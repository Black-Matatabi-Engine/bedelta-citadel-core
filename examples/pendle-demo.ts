#!/usr/bin/env tsx
/**
 * Pendle Demo — PT/YT Safety Sentinel & Guarded Pool Factory.
 * Usage: pnpm demo:pendle
 * Trip:  pnpm demo:pendle -- --trip
 */
import {
  __resetPendleMarketOracleForTests,
  pendleMarketOracle,
} from "../src/adapters/pendle/pendle-market-oracle-adapter";
import {
  PENDLE_POOL_MIN_INITIAL_LIQUIDITY_USD,
  PENDLE_POOL_YIELD_DRIFT_BREACH,
  validateAIPoolSelection,
} from "../src/adapters/pendle/pendle-pool-factory-adapter";
import { PENDLE_PT_MARKET_PT_EETH } from "../src/adapters/pendle/pendle-pt-registry";
import { checkSoilResistance } from "../src/services/risk-control";
import { ensureSoilWasm } from "../src/sdk";
import {
  hudBlocked,
  hudChannelOpen,
  hudDispatched,
  hudIntent,
  hudSevered,
  hudSoilFuse,
  printBanner,
  printMode,
  printResult,
  R,
  RED,
  seedAdapterProbes,
} from "./adapters/citadel-ansi-hud";
import { formatGuardTime, hrtimeElapsedUs, hrtimeStart, measureSync } from "./lib/demo-timing";

const HEALTHY_SOIL = {
  symbol: "ETH",
  hlSpot: 3500,
  hlPerp: 3500,
  dydxPerp: 3500,
  depthUsd: 200_000,
  disableThresholdJitter: true,
};

function ingestOracle(nowMs: number): void {
  const nowSec = Math.floor(nowMs / 1000);
  pendleMarketOracle.ingest({
    marketKey: PENDLE_PT_MARKET_PT_EETH,
    updatedAtMs: nowMs,
    impliedYield: 0.062,
    historicalYield24h: 0.063,
    ptPriceInAsset: 0.93,
    liquidityConstant: 11_000_000,
    expirySec: nowSec + 30 * 86_400,
  });
}

function selection(nowMs: number, trip: boolean) {
  return {
    intent: "PENDLE_CREATE_POOL" as const,
    underlyingAsset: "eETH",
    maturityTimestampSec: Math.floor(nowMs / 1000) + 30 * 86_400,
    impliedYield: 0.05,
    oracleYield: trip ? 0.095 : 0.062,
    initialLiquidityUsd: PENDLE_POOL_MIN_INITIAL_LIQUIDITY_USD + 100_000,
    nowMs,
  };
}

function runHealthy(nowMs: number): number {
  hudIntent("pendle-demo", "Pendle", "PENDLE_CREATE_POOL", "Guarded Pool Factory · eETH PT");
  ingestOracle(nowMs);
  const sel = selection(nowMs, false);
  const { value: verdict, latencyUs: validateUs } = measureSync(() => validateAIPoolSelection(sel));
  const t1 = hrtimeStart();
  const soil = checkSoilResistance({
    ...HEALTHY_SOIL,
    pendlePoolFactory: {
      selection: sel,
      marketKeyOrAddress: PENDLE_PT_MARKET_PT_EETH,
      useOracle: true,
      nowMs,
    },
  });
  const soilUs = hrtimeElapsedUs(t1);
  const totalUs = validateUs + soilUs;
  console.log(
    `${R}  validateAIPoolSelection=${verdict.passed} · yieldDrift=${verdict.yieldDriftBps.toFixed(0)}bps`,
  );
  hudSoilFuse(soil.ok, soilUs, soil.reasons);
  hudChannelOpen();
  hudDispatched("Pendle guarded pool · validateAIPoolSelection", totalUs);
  return totalUs;
}

function runTrip(nowMs: number): number {
  hudIntent("pendle-demo", "Pendle", "YIELD_DRIFT_TRIP", "Guarded Pool Factory · MEV fuse");
  const sel = selection(nowMs, true);
  const { value: verdict } = measureSync(() => validateAIPoolSelection(sel));
  const t0 = hrtimeStart();
  const soil = checkSoilResistance({
    ...HEALTHY_SOIL,
    pendlePoolFactory: { selection: sel, marketKeyOrAddress: PENDLE_PT_MARKET_PT_EETH, nowMs },
  });
  const latencyUs = hrtimeElapsedUs(t0);
  console.log(
    `${R}  yieldDrift=${verdict.yieldDriftBps.toFixed(0)}bps · breach=${verdict.reasons.includes(PENDLE_POOL_YIELD_DRIFT_BREACH)}`,
  );
  hudSoilFuse(false, latencyUs, soil.reasons);
  hudSevered(PENDLE_POOL_YIELD_DRIFT_BREACH);
  hudBlocked();
  return latencyUs;
}

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  if (!ensureSoilWasm()) {
    console.error(`${RED}soil_core.wasm unavailable${R}`);
    process.exit(1);
  }
  __resetPendleMarketOracleForTests();
  const nowMs = Date.now();
  seedAdapterProbes(nowMs);
  printBanner("Pendle Institutional Shield Demo");
  printMode(trip);
  const latencyUs = trip ? runTrip(nowMs) : runHealthy(nowMs);
  console.log(`\n${R}Pendle guard · ${formatGuardTime(latencyUs)}${R}\n`);
  printResult(!trip);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
