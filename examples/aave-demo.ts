#!/usr/bin/env tsx
/** Aave V3 Demo — Usage: pnpm demo:aave · Trip: pnpm demo:aave -- --trip */
import { AAVE_ARBITRUM_CHAIN_ID, evaluateAaveV3Guard } from "../src/adapters/aave/aave-v3-adapter";
import { HEALTHY_SOIL, printPillarSetYVenueBanner } from "./adapters/citadel-ansi-hud";
import { captureSoilBenchmark } from "./lib/demo-benchmark";
import { ensureDemoWasmSoft, isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
import { collectAaveBreachLines, withMatrixHudMute } from "./lib/matrix-demo-hud";
import { finalizeVenueHappy, finalizeVenueTrip, printVenuePreflightHeader, printVenueRow } from "./lib/venue-demo-hud";

function runGuard(nowMs: number, trip: boolean): { hf: number } {
  const r = evaluateAaveV3Guard({
    chainId: AAVE_ARBITRUM_CHAIN_ID,
    market: "WETH/USDC",
    collateralUsd: trip ? 95_000 : 150_000,
    debtUsd: trip ? 120_000 : 80_000,
    liquidationThreshold: 0.825,
    projectedHealthFactor: trip ? 1.05 : 1.42,
    crossChainSourceHf: trip ? 1.35 : undefined,
    crossChainDestHf: trip ? 1.12 : undefined,
    refPriceUsd: 3500,
    spotPriceUsd: 3500,
    depthUsd: trip ? 8_000 : 500_000,
    nowMs,
  });
  return { hf: r.healthFactor };
}

wrapDemoExecution(({ nowMs }) => {
  const trip = isDemoTripArgv();
  ensureDemoWasmSoft();
  const soil = { ...HEALTHY_SOIL, at: new Date(nowMs) };
  const benchmark = captureSoilBenchmark(soil, () => withMatrixHudMute(() => runGuard(nowMs, false)));
  printPillarSetYVenueBanner("Aave V3", benchmark);
  printVenuePreflightHeader(!trip);
  let hf = 0;
  withMatrixHudMute(() => {
    hf = runGuard(nowMs, trip).hf;
  });
  printVenueRow("Aave V3", !trip, trip ? `HF ${hf.toFixed(2)} breach` : `HF ${hf.toFixed(2)} nominal`);
  if (trip) {
    finalizeVenueTrip(collectAaveBreachLines(nowMs), benchmark);
    return { tripped: true, reason: "AAVE_FAIL_CLOSED" };
  }
  finalizeVenueHappy(benchmark);
});
