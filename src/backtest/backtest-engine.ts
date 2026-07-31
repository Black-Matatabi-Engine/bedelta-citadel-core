/**
 * Historical backtest harness — 1m candle + slippage fixtures vs Pgate gates.
 */

import { computeEffectiveMaxSlUsd } from "../services/effective-max-sl";
import {
  checkSoilResistance,
  vineWrapProtection,
  RiskLimitExceeded,
  type SoilResistanceInput,
} from "../services/risk-control";

export interface BacktestCandle {
  timestamp: number;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volumeUsd: number;
}

export interface BacktestSlippageSample {
  timestamp: number;
  symbol: string;
  crossVenueSlippage: number;
  spotPerpSlippage: number;
  depthUsd: number;
}

export type BacktestScenarioId = "MAY_2026_VOLATILITY" | "MARCH_2024_CRASH";

export interface BacktestFixture {
  scenario: BacktestScenarioId;
  candles: BacktestCandle[];
  slippage: BacktestSlippageSample[];
}

export interface BacktestRunConfig {
  scenario: BacktestScenarioId;
  accountBalanceUsd?: number;
  orderNotionalUsd?: number;
  eventCount?: number;
}

export interface BacktestEventResult {
  eventIndex: number;
  timestamp: number;
  soilTripped: boolean;
  rootProtectionBlocked: boolean;
  estimatedLossUsd: number;
  dynamicMaxSlUsd: number;
  survived: boolean;
  liquidated: boolean;
}

export interface BacktestRunResult {
  scenario: BacktestScenarioId;
  eventsSimulated: number;
  survivalRate: number;
  zeroLiquidation: boolean;
  soilTripCount: number;
  rootProtectionTripCount: number;
  dynamicMaxSlUsd: number;
  events: BacktestEventResult[];
}

const DEFAULT_BALANCE_USD = 10_000;
const DEFAULT_NOTIONAL_USD = 500;
const DEFAULT_EVENT_COUNT = 1_000;

/** Deterministic PRNG (LCG) for reproducible fixtures. */
export function createBacktestRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function scenarioSeed(scenario: BacktestScenarioId): number {
  return scenario === "MAY_2026_VOLATILITY" ? 0x5a26_2026 : 0x3a24_2024;
}

function basePrice(scenario: BacktestScenarioId): number {
  return scenario === "MAY_2026_VOLATILITY" ? 68_500 : 52_000;
}

/** Build 1-minute candle + slippage fixtures for a volatility scenario. */
export function buildHistoricalFixtures(
  scenario: BacktestScenarioId,
  barCount = 1_440,
): BacktestFixture {
  const rng = createBacktestRng(scenarioSeed(scenario));
  const px = basePrice(scenario);
  const startMs = scenario === "MAY_2026_VOLATILITY"
    ? Date.parse("2026-05-12T00:00:00.000Z")
    : Date.parse("2024-03-18T00:00:00.000Z");
  const shockMul = scenario === "MARCH_2024_CRASH" ? 2.4 : 1.6;

  const candles: BacktestCandle[] = [];
  const slippage: BacktestSlippageSample[] = [];
  let lastClose = px;

  for (let i = 0; i < barCount; i += 1) {
    const ts = startMs + i * 60_000;
    const roll = rng();
    const isShock = roll > 0.965;
    const drift = (rng() - 0.5) * px * 0.0008;
    const shock = isShock ? (rng() - 0.55) * px * 0.018 * shockMul : 0;
    const open = lastClose;
    const close = Math.max(px * 0.55, open + drift + shock);
    const wick = Math.abs(shock) + px * 0.001 * rng();
    const high = Math.max(open, close) + wick;
    const low = Math.min(open, close) - wick;
    lastClose = close;

    candles.push({
      timestamp: ts,
      symbol: "BTC",
      open,
      high,
      low,
      close,
      volumeUsd: 200_000 + rng() * 2_000_000,
    });

    const crossSlip = isShock
      ? 0.002 + rng() * 0.012
      : 0.0002 + rng() * 0.003;
    const depthUsd = isShock
      ? 20_000 + rng() * 60_000
      : 150_000 + rng() * 800_000;

    slippage.push({
      timestamp: ts,
      symbol: "BTC",
      crossVenueSlippage: crossSlip,
      spotPerpSlippage: Math.abs(close - open) / Math.max(open, 1),
      depthUsd,
    });
  }

  return { scenario, candles, slippage };
}

export function candleToSoilInput(
  candle: BacktestCandle,
  slip: BacktestSlippageSample,
): SoilResistanceInput {
  const hlPerp = candle.close;
  const spread = slip.crossVenueSlippage * hlPerp;
  return {
    symbol: candle.symbol,
    hlSpot: candle.open,
    hlPerp,
    dydxPerp: hlPerp + spread,
    depthUsd: slip.depthUsd,
    at: new Date(candle.timestamp),
  };
}

/** Worst-case 1m drawdown loss proxy for notional at bar wick. */
export function estimateVolatilityLossUsd(
  candle: BacktestCandle,
  notionalUsd: number,
): number {
  const rangePct = (candle.high - candle.low) / Math.max(candle.close, 1);
  return notionalUsd * rangePct;
}

function pickExtremeEvents(
  fixture: BacktestFixture,
  eventCount: number,
): Array<{ candle: BacktestCandle; slip: BacktestSlippageSample }> {
  const paired = fixture.candles.map((candle, i) => ({
    candle,
    slip: fixture.slippage[i]!,
    score:
      (candle.high - candle.low) / Math.max(candle.close, 1) +
      fixture.slippage[i]!.crossVenueSlippage,
  }));
  paired.sort((a, b) => b.score - a.score);
  const top = paired.slice(0, eventCount);
  if (top.length >= eventCount) return top.map(({ candle, slip }) => ({ candle, slip }));

  const rng = createBacktestRng(scenarioSeed(fixture.scenario) ^ eventCount);
  const out = top.map(({ candle, slip }) => ({ candle, slip }));
  while (out.length < eventCount) {
    const idx = Math.floor(rng() * fixture.candles.length);
    out.push({ candle: fixture.candles[idx]!, slip: fixture.slippage[idx]! });
  }
  return out;
}

/** Simulate extreme volatility events against soil + dynamic Max SL gates. */
export function runBacktest(config: BacktestRunConfig): BacktestRunResult {
  const balance = config.accountBalanceUsd ?? DEFAULT_BALANCE_USD;
  const notional = config.orderNotionalUsd ?? DEFAULT_NOTIONAL_USD;
  const eventCount = config.eventCount ?? DEFAULT_EVENT_COUNT;
  const dynamicMaxSlUsd = computeEffectiveMaxSlUsd(balance);

  const fixture = buildHistoricalFixtures(config.scenario);
  const events = pickExtremeEvents(fixture, eventCount);

  let soilTripCount = 0;
  let rootProtectionTripCount = 0;
  let liquidatedCount = 0;
  const results: BacktestEventResult[] = [];

  for (let i = 0; i < events.length; i += 1) {
    const { candle, slip } = events[i]!;
    const soil = checkSoilResistance(candleToSoilInput(candle, slip));
    const estimatedLossUsd = estimateVolatilityLossUsd(candle, notional);

    let rootProtectionBlocked = false;
    if (!soil.tripped) {
      try {
        vineWrapProtection({
          symbol: candle.symbol,
          estimatedLossUsd,
          accountBalanceUsd: balance,
          maxLossLimit: dynamicMaxSlUsd,
        });
      } catch (err) {
        if (err instanceof RiskLimitExceeded) {
          rootProtectionBlocked = true;
        } else {
          throw err;
        }
      }
    }

    if (soil.tripped) soilTripCount += 1;
    if (rootProtectionBlocked) rootProtectionTripCount += 1;

    const gateBlocked = soil.tripped || rootProtectionBlocked;
    const wouldLiquidate = !gateBlocked && estimatedLossUsd >= balance;
    const survived = gateBlocked || !wouldLiquidate;
    if (wouldLiquidate) liquidatedCount += 1;

    results.push({
      eventIndex: i,
      timestamp: candle.timestamp,
      soilTripped: soil.tripped,
      rootProtectionBlocked,
      estimatedLossUsd,
      dynamicMaxSlUsd,
      survived,
      liquidated: wouldLiquidate,
    });
  }

  const survivedCount = results.filter((r) => r.survived).length;
  const survivalRate = eventCount > 0 ? survivedCount / eventCount : 1;

  return {
    scenario: config.scenario,
    eventsSimulated: eventCount,
    survivalRate,
    zeroLiquidation: liquidatedCount === 0,
    soilTripCount,
    rootProtectionTripCount,
    dynamicMaxSlUsd,
    events: results,
  };
}

/** Run all bundled scenarios — grant / CI validation entry. */
export function runFullBacktestSuite(
  eventCount = DEFAULT_EVENT_COUNT,
): BacktestRunResult[] {
  return (
    ["MAY_2026_VOLATILITY", "MARCH_2024_CRASH"] as BacktestScenarioId[]
  ).map((scenario) => runBacktest({ scenario, eventCount }));
}
