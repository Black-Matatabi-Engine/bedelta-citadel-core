#!/usr/bin/env tsx
/** Uniswap V3 Demo — Usage: pnpm demo:uniswap · Trip: pnpm demo:uniswap -- --trip */
import { UNISWAP_V3_ARBITRUM_CHAIN_ID, evaluateUniswapV3SwapGuard } from "../src/adapters/uniswap/uniswap-v3-adapter";
import { HEALTHY_SOIL, printPillarSetYVenueBanner } from "./adapters/citadel-ansi-hud";
import { captureSoilBenchmark } from "./lib/demo-benchmark";
import { ensureDemoWasmSoft, isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
import { withMatrixHudMute } from "./lib/matrix-demo-hud";
import {
  finalizeVenueHappy,
  finalizeVenueTrip,
  printVenuePreflightHeader,
  printVenueRow,
  UNISWAP_TRIP_BREACHES,
} from "./lib/venue-demo-hud";

function runGuard(nowMs: number, trip: boolean): string {
  const r = evaluateUniswapV3SwapGuard({
    chainId: UNISWAP_V3_ARBITRUM_CHAIN_ID,
    tokenIn: "WETH",
    tokenOut: "USDC",
    amountInUsd: trip ? 600_000 : 25_000,
    activeLiquidityUsd: trip ? 200_000 : 2_500_000,
    dynamicFeeBps: trip ? 85 : 5,
    tickRangeLiquidityUsd: trip ? undefined : 200_000,
    tickSpacing: trip ? undefined : 60,
    directionalFeeBps: trip ? undefined : 2,
    spotPriceUsd: 3500,
    refPriceUsd: 3500,
    depthUsd: trip ? 8_000 : 500_000,
    nowMs,
  });
  return trip
    ? `slippage ${r.estimatedSlippageBps.toFixed(1)}bps · liquidity depleted`
    : `slippage ${r.estimatedSlippageBps.toFixed(1)}bps · liquidity ok`;
}

wrapDemoExecution(({ nowMs }) => {
  const trip = isDemoTripArgv();
  ensureDemoWasmSoft();
  const soil = { ...HEALTHY_SOIL, at: new Date(nowMs) };
  const benchmark = captureSoilBenchmark(soil, () => withMatrixHudMute(() => runGuard(nowMs, false)));
  printPillarSetYVenueBanner("Uniswap V3", benchmark);
  printVenuePreflightHeader(!trip);
  let detail = "";
  withMatrixHudMute(() => {
    detail = runGuard(nowMs, trip);
  });
  printVenueRow("Uniswap V3", !trip, detail);
  if (trip) {
    finalizeVenueTrip(UNISWAP_TRIP_BREACHES, benchmark);
    return { tripped: true, reason: "UNISWAP_FAIL_CLOSED" };
  }
  finalizeVenueHappy(benchmark);
});
