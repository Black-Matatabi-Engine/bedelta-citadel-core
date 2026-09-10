#!/usr/bin/env tsx
/** Pendle Demo — Usage: pnpm demo:pendle · Trip: pnpm demo:pendle -- --trip */
import { __resetPendleMarketOracleForTests, pendleMarketOracle } from "../src/adapters/pendle/pendle-market-oracle-adapter";
import { PENDLE_POOL_MIN_INITIAL_LIQUIDITY_USD, validateAIPoolSelection } from "../src/adapters/pendle/pendle-pool-factory-adapter";
import { PENDLE_PT_MARKET_PT_EETH } from "../src/adapters/pendle/pendle-pt-registry";
import { checkSoilResistance } from "../src/services/risk-control";
import { HEALTHY_SOIL, printPillarSetYVenueBanner } from "./adapters/citadel-ansi-hud";
import { captureSoilBenchmark } from "./lib/demo-benchmark";
import { ensureDemoWasmSoft, isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
import { withMatrixHudMute } from "./lib/matrix-demo-hud";
import {
  finalizeVenueHappy,
  finalizeVenueTrip,
  pendleTripBreaches,
  printVenuePreflightHeader,
  printVenueRow,
} from "./lib/venue-demo-hud";

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

function runGuard(nowMs: number, trip: boolean): void {
  if (!trip) ingestOracle(nowMs);
  const sel = selection(nowMs, trip);
  validateAIPoolSelection(sel);
  checkSoilResistance({
    ...HEALTHY_SOIL,
    disableThresholdJitter: true,
    pendlePoolFactory: {
      selection: sel,
      marketKeyOrAddress: PENDLE_PT_MARKET_PT_EETH,
      useOracle: !trip,
      nowMs,
    },
  });
}

wrapDemoExecution(({ nowMs }) => {
  const trip = isDemoTripArgv();
  ensureDemoWasmSoft();
  __resetPendleMarketOracleForTests();
  const soil = { ...HEALTHY_SOIL, at: new Date(nowMs) };
  const benchmark = captureSoilBenchmark(soil, () => withMatrixHudMute(() => runGuard(nowMs, false)));
  printPillarSetYVenueBanner("Pendle", benchmark);
  printVenuePreflightHeader(!trip);
  withMatrixHudMute(() => runGuard(nowMs, trip));
  printVenueRow("Pendle", !trip, trip ? "yield shock trip" : "yield farming clear");
  if (trip) {
    finalizeVenueTrip(pendleTripBreaches(), benchmark);
    return { tripped: true, reason: "PENDLE_FAIL_CLOSED" };
  }
  finalizeVenueHappy(benchmark);
});
