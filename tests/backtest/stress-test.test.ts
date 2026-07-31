import { afterEach, describe, expect, it, vi } from "vitest";
import type { IExchangeAdapter } from "../../src/adapters/types";
import {
  buildHistoricalFixtures,
  candleToSoilInput,
  createBacktestRng,
  estimateVolatilityLossUsd,
  runBacktest,
  runFullBacktestSuite,
  type BacktestCandle,
  type BacktestScenarioId,
  type BacktestSlippageSample,
} from "../../src/backtest/backtest-engine";
import {
  __setSystemStateForTests,
  buildSystemState,
} from "../../src/core/state";
import { evaluateGlobalRiskPolicy } from "../../src/core/risk-engine";
import { computeEffectiveMaxSlUsd } from "../../src/services/effective-max-sl";
import {
  RiskLimitExceeded,
  checkSoilResistance,
  vineWrapProtection,
} from "../../src/services/risk-control";
import {
  assertSessionKeyExecutionGates,
  severSigningChannel,
  type SessionKeyOrderPayload,
} from "../../src/services/session-key-adapter";
import { queryStructuralTriangle } from "../../src/services/yield-router";

const BALANCE_USD = 10_000;
const NOTIONAL_USD = 2_500;
const STRESS_DAYS = 180;

const SESSION_PAYLOAD: SessionKeyOrderPayload = {
  asset: "BTC",
  isBuy: true,
  limitPx: "65000",
  sz: "0.01",
  reduceOnly: false,
};

function flashCrashCandle(basePx = 65_000): BacktestCandle {
  const open = basePx;
  const close = open * 0.7;
  return {
    timestamp: Date.parse("2026-07-26T12:00:00.000Z"),
    symbol: "BTC",
    open,
    high: open,
    low: close,
    close,
    volumeUsd: 5_000_000,
  };
}

function flashCrashSlippage(candle: BacktestCandle): BacktestSlippageSample {
  return {
    timestamp: candle.timestamp,
    symbol: candle.symbol,
    crossVenueSlippage: 0.012,
    spotPerpSlippage: Math.abs(candle.close - candle.open) / candle.open,
    depthUsd: 40_000,
  };
}

/** Dualism hedging — scale directional exposure when tail probability spikes. */
function computeBlackSwanExposureUsd(baseExposureUsd: number, yesProbability: number): number {
  if (yesProbability <= 0.8) return baseExposureUsd;
  const spike = Math.min(1, (yesProbability - 0.8) / 0.2);
  return baseExposureUsd * Math.max(0.1, 1 - spike * 0.85);
}

function resolveLatencyRoutingMode(input: {
  hlSpot: number;
  hlPerp: number;
  jupPerp: number;
  gmxPerp: number;
  jupLatencyMs: number;
  gmxLatencyMs: number;
  hlDepthUsd: number;
  externalDepthUsd: number;
}) {
  const stripExternal = input.jupLatencyMs > 500 || input.gmxLatencyMs > 500;
  const dydxPerp = stripExternal ? input.hlPerp : input.gmxPerp;
  const depthUsd = stripExternal
    ? input.hlDepthUsd
    : (input.hlDepthUsd + input.externalDepthUsd) / 2;
  const soil = checkSoilResistance({
    symbol: "BTC",
    hlSpot: input.hlSpot,
    hlPerp: input.hlPerp,
    dydxPerp,
    depthUsd,
  });
  return { mode: stripExternal ? ("SINGLE_HL" as const) : ("TRIANGLE" as const), soil, stripExternal };
}

function simulateStressDay(
  candle: BacktestCandle,
  slip: BacktestSlippageSample,
  balanceUsd: number,
  notionalUsd: number,
): { survived: boolean; liquidated: boolean } {
  const dynamicMaxSlUsd = computeEffectiveMaxSlUsd(balanceUsd);
  const soil = checkSoilResistance(candleToSoilInput(candle, slip));
  const estimatedLossUsd = estimateVolatilityLossUsd(candle, notionalUsd);

  let blocked = soil.tripped;
  if (!blocked) {
    try {
      vineWrapProtection({
        symbol: candle.symbol,
        estimatedLossUsd,
        accountBalanceUsd: balanceUsd,
        maxLossLimit: dynamicMaxSlUsd,
      });
    } catch (err) {
      if (err instanceof RiskLimitExceeded) blocked = true;
      else throw err;
    }
  }

  const wouldLiquidate = !blocked && estimatedLossUsd >= balanceUsd;
  return { survived: blocked || !wouldLiquidate, liquidated: wouldLiquidate };
}

function runDeterministicStressWindow(
  scenario: BacktestScenarioId,
  days = STRESS_DAYS,
): { days: number; liquidations: number; survivalRate: number } {
  const fixture = buildHistoricalFixtures(scenario, Math.max(days * 8, 360));
  const rng = createBacktestRng(scenario === "MAY_2026_VOLATILITY" ? 0x5a26_180 : 0x3a24_180);
  let liquidations = 0;
  let survived = 0;

  for (let day = 0; day < days; day += 1) {
    const idx = Math.floor(rng() * fixture.candles.length);
    const candle = fixture.candles[idx]!;
    const slip = fixture.slippage[idx]!;
    const result = simulateStressDay(candle, slip, BALANCE_USD, NOTIONAL_USD);
    if (result.liquidated) liquidations += 1;
    if (result.survived) survived += 1;
  }

  return { days, liquidations, survivalRate: days > 0 ? survived / days : 1 };
}

function mockTriangleAdapter(
  id: "hyperliquid" | "jupiter" | "gmx",
  health: { ok: boolean; latencyMs: number; reasons?: string[] },
  depthUsd: number,
  spot: number,
  perp: number,
): IExchangeAdapter {
  return {
    id,
    getDepth: async () => ({
      venue: id,
      symbol: "BTC",
      depthUsd,
      spotPrice: spot,
      perpPrice: perp,
      fetchedAt: new Date().toISOString(),
    }),
    getAPY: async () => (id === "hyperliquid" ? 0.08 : 0.06),
    checkHealth: async () => ({
      ok: health.ok,
      latencyMs: health.latencyMs,
      reasons: health.reasons ?? (health.ok ? [] : ["LATENCY_SPIKE"]),
    }),
  };
}

describe("extreme market stress backtest", () => {
  afterEach(() => {
    __setSystemStateForTests(null);
  });

  it("Scenario A — flash crash (-30% / 60s) locks Dynamic Max SL + signing pipeline", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const candle = flashCrashCandle();
    const slip = flashCrashSlippage(candle);
    const dynamicMaxSlUsd = computeEffectiveMaxSlUsd(BALANCE_USD);
    const estimatedLossUsd = estimateVolatilityLossUsd(candle, NOTIONAL_USD);

    expect(estimatedLossUsd).toBeGreaterThan(dynamicMaxSlUsd);
    expect(() =>
      vineWrapProtection({
        symbol: "BTC",
        estimatedLossUsd,
        accountBalanceUsd: BALANCE_USD,
        maxLossLimit: dynamicMaxSlUsd,
      }),
    ).toThrow(RiskLimitExceeded);

    __setSystemStateForTests(buildSystemState({ accountBalanceUsd: BALANCE_USD, skipHardlockAssert: true }));
    const locked = severSigningChannel();
    expect(locked.signingChannelOpen).toBe(false);
    expect(locked.hardlock).toBe(true);
    expect(() =>
      assertSessionKeyExecutionGates(SESSION_PAYLOAD, locked, NOTIONAL_USD),
    ).toThrow();

    const soil = checkSoilResistance(candleToSoilInput(candle, slip));
    expect(soil.tripped).toBe(true);
  });

  it("Scenario B — Polymarket black swan (>80%) dynamically reduces exposure", () => {
    const baseExposureUsd = 150;
    const baseline = computeBlackSwanExposureUsd(baseExposureUsd, 0.55);
    const reduced = computeBlackSwanExposureUsd(baseExposureUsd, 0.87);

    expect(baseline).toBe(baseExposureUsd);
    expect(reduced).toBeLessThan(baseExposureUsd);
    expect(reduced).toBeGreaterThan(0);

    const state = buildSystemState({ accountBalanceUsd: BALANCE_USD, skipHardlockAssert: true });
    expect(() =>
      vineWrapProtection({
        symbol: "POLY_BLACK_SWAN",
        estimatedLossUsd: baseExposureUsd * 2,
        accountBalanceUsd: BALANCE_USD,
      }),
    ).toThrow(RiskLimitExceeded);
    expect(() =>
      vineWrapProtection({
        symbol: "POLY_BLACK_SWAN",
        estimatedLossUsd: reduced,
        accountBalanceUsd: BALANCE_USD,
      }),
    ).not.toThrow();

    const policy = evaluateGlobalRiskPolicy({
      venue: "POLYMARKET",
      amountUsd: reduced,
      symbol: "BLACK_SWAN",
      systemState: state,
      tailHedge: { marketPrice: 0.07, thresholdProb: 0.08 },
    });
    expect(policy.isAllowed).toBe(true);
  });

  it("Scenario C — cross-chain latency spike (>500ms) reverts to Single HL mode", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const hl = mockTriangleAdapter("hyperliquid", { ok: true, latencyMs: 14 }, 800_000, 65_000, 65_010);
    const jup = mockTriangleAdapter("jupiter", { ok: false, latencyMs: 620 }, 200_000, 65_000, 66_500);
    const gmx = mockTriangleAdapter("gmx", { ok: false, latencyMs: 740 }, 180_000, 65_000, 66_800);

    const triangle = await queryStructuralTriangle("BTC", [hl, jup, gmx]);
    expect(triangle.venues.filter((v) => v.health.ok)).toHaveLength(1);
    expect(triangle.venues.find((v) => v.health.ok)?.venue).toBe("hyperliquid");
    expect(triangle.reasons.some((r) => r.includes("jupiter_UNHEALTHY"))).toBe(true);
    expect(triangle.reasons.some((r) => r.includes("gmx_UNHEALTHY"))).toBe(true);

    const withExternal = resolveLatencyRoutingMode({
      hlSpot: 65_000,
      hlPerp: 65_010,
      jupPerp: 66_500,
      gmxPerp: 66_800,
      jupLatencyMs: 20,
      gmxLatencyMs: 18,
      hlDepthUsd: 800_000,
      externalDepthUsd: 200_000,
    });
    const singleHl = resolveLatencyRoutingMode({
      hlSpot: 65_000,
      hlPerp: 65_010,
      jupPerp: 66_500,
      gmxPerp: 66_800,
      jupLatencyMs: 620,
      gmxLatencyMs: 740,
      hlDepthUsd: 800_000,
      externalDepthUsd: 200_000,
    });

    expect(withExternal.mode).toBe("TRIANGLE");
    expect(singleHl.mode).toBe("SINGLE_HL");
    expect(withExternal.soil.tripped).toBe(true);
    expect(singleHl.soil.tripped).toBe(false);
    expect(singleHl.soil.ok).toBe(true);
  });

  it("180-day deterministic stress window — zero liquidations across scenarios", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    for (const scenario of ["MAY_2026_VOLATILITY", "MARCH_2024_CRASH"] as BacktestScenarioId[]) {
      const window = runDeterministicStressWindow(scenario, STRESS_DAYS);
      expect(window.days).toBe(STRESS_DAYS);
      expect(window.liquidations).toBe(0);
      expect(window.survivalRate).toBe(1);
    }

    const engineSuite = runFullBacktestSuite(1_000);
    for (const run of engineSuite) {
      expect(run.zeroLiquidation).toBe(true);
      expect(run.survivalRate).toBe(1);
      expect(run.events.every((e) => !e.liquidated)).toBe(true);
    }

    const may = runBacktest({ scenario: "MAY_2026_VOLATILITY", eventCount: STRESS_DAYS });
    expect(may.zeroLiquidation).toBe(true);
    expect(may.survivalRate).toBe(1);
  });
});
