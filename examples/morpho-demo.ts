#!/usr/bin/env tsx
/** Morpho Blue Demo — Usage: pnpm demo:morpho · Trip: pnpm demo:morpho -- --trip */
import { MORPHO_ARBITRUM_CHAIN_ID, evaluateMorphoBlueGuard } from "../src/adapters/morpho/morpho-blue-adapter";
import { HEALTHY_SOIL, printPillarSetYVenueBanner } from "./adapters/citadel-ansi-hud";
import { captureSoilBenchmark } from "./lib/demo-benchmark";
import { ensureDemoWasmSoft, isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
import { collectMorphoBreachLines, withMatrixHudMute } from "./lib/matrix-demo-hud";
import { finalizeVenueHappy, finalizeVenueTrip, printVenuePreflightHeader, printVenueRow } from "./lib/venue-demo-hud";

function runGuard(nowMs: number, trip: boolean): string {
  const r = evaluateMorphoBlueGuard({
    chainId: MORPHO_ARBITRUM_CHAIN_ID,
    marketId: "WETH/USDC",
    action: trip ? "BORROW" : "SUPPLY",
    amountUsd: trip ? 200_000 : 50_000,
    marketLiquidityUsd: trip ? 80_000 : 5_000_000,
    oraclePriceUsd: trip ? 3650 : 3500,
    referencePriceUsd: 3500,
    oracleTimestampMs: trip ? nowMs - 5_000_000 : nowMs - 120_000,
    refPriceUsd: 3500,
    spotPriceUsd: 3500,
    depthUsd: trip ? 6_000 : 400_000,
    nowMs,
  });
  return trip ? "oracle stale / deviation breach" : `oracle age ${r.oracleAgeMs}ms nominal`;
}

wrapDemoExecution(({ nowMs }) => {
  const trip = isDemoTripArgv();
  ensureDemoWasmSoft();
  const soil = { ...HEALTHY_SOIL, at: new Date(nowMs) };
  const benchmark = captureSoilBenchmark(soil, () => withMatrixHudMute(() => runGuard(nowMs, false)));
  printPillarSetYVenueBanner("Morpho Blue", benchmark);
  printVenuePreflightHeader(!trip);
  let detail = "";
  withMatrixHudMute(() => {
    detail = runGuard(nowMs, trip);
  });
  printVenueRow("Morpho Blue", !trip, detail);
  if (trip) {
    finalizeVenueTrip(collectMorphoBreachLines(nowMs), benchmark);
    return { tripped: true, reason: "MORPHO_FAIL_CLOSED" };
  }
  finalizeVenueHappy(benchmark);
});
