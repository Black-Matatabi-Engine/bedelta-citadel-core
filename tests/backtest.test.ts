import { describe, expect, it, vi } from "vitest";
import {
  buildHistoricalFixtures,
  estimateVolatilityLossUsd,
  runBacktest,
  runFullBacktestSuite,
} from "../src/backtest/backtest-engine";
import { generateMockAnalytics } from "../src/mocks/mock-analytics-generator";
import { computeEffectiveMaxSlUsd } from "../src/services/effective-max-sl";

describe("backtest-engine", () => {
  it("buildHistoricalFixtures — May 2026 and March 2024 scenarios", () => {
    const may = buildHistoricalFixtures("MAY_2026_VOLATILITY", 60);
    const march = buildHistoricalFixtures("MARCH_2024_CRASH", 60);

    expect(may.candles).toHaveLength(60);
    expect(may.slippage).toHaveLength(60);
    expect(march.candles[0]!.close).toBeGreaterThan(0);
    expect(may.scenario).toBe("MAY_2026_VOLATILITY");
    expect(march.scenario).toBe("MARCH_2024_CRASH");
  });

  it("estimateVolatilityLossUsd scales with candle wick range", () => {
    const loss = estimateVolatilityLossUsd(
      {
        timestamp: 0,
        symbol: "BTC",
        open: 50_000,
        high: 51_000,
        low: 49_000,
        close: 50_500,
        volumeUsd: 1_000_000,
      },
      1_000,
    );
    expect(loss).toBeCloseTo(40, 0);
  });

  it("runBacktest — 1,000 extreme events · 100% survival · zero liquidation", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = runBacktest({
      scenario: "MAY_2026_VOLATILITY",
      accountBalanceUsd: 10_000,
      eventCount: 1_000,
    });

    expect(result.eventsSimulated).toBe(1_000);
    expect(result.dynamicMaxSlUsd).toBe(computeEffectiveMaxSlUsd(10_000));
    expect(result.survivalRate).toBe(1);
    expect(result.zeroLiquidation).toBe(true);
    expect(result.soilTripCount + result.rootProtectionTripCount).toBeGreaterThan(
      0,
    );
    expect(result.events.every((e) => e.survived)).toBe(true);
    expect(result.events.every((e) => !e.liquidated)).toBe(true);
  });

  it("runFullBacktestSuite — both scenarios pass Dynamic Max SL gate", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const suite = runFullBacktestSuite(1_000);
    expect(suite).toHaveLength(2);

    for (const run of suite) {
      expect(run.eventsSimulated).toBe(1_000);
      expect(run.survivalRate).toBe(1);
      expect(run.zeroLiquidation).toBe(true);
      expect(run.dynamicMaxSlUsd).toBe(computeEffectiveMaxSlUsd(10_000));
    }
  });
});

describe("mock-analytics-generator", () => {
  it("generateMockAnalytics — CRI, breakers, PnL, session latency", () => {
    const snap = generateMockAnalytics({
      accountBalanceUsd: 10_000,
      sampleCount: 50,
      seed: 42,
    });

    expect(snap.dynamicMaxSlUsd).toBe(200);
    expect(snap.criHistory).toHaveLength(50);
    expect(snap.pnlCurve).toHaveLength(50);
    expect(snap.sessionKeyLatency).toHaveLength(50);
    expect(snap.criHistory[0]!.cri).toBeLessThanOrEqual(100);
    expect(snap.pnlCurve.at(-1)!.equityUsd).toBeGreaterThan(0);
    expect(snap.sessionKeyLatency.every((s) => s.latencyMs >= 0)).toBe(true);
    expect(() => JSON.stringify(snap)).not.toThrow();
  });

  it("generateMockAnalytics — deterministic with fixed seed", () => {
    const a = generateMockAnalytics({ seed: 99, sampleCount: 10 });
    const b = generateMockAnalytics({ seed: 99, sampleCount: 10 });
    expect(a.criHistory.map((x) => x.cri)).toEqual(
      b.criHistory.map((x) => x.cri),
    );
  });
});
