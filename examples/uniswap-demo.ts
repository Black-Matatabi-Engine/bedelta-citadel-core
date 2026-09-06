#!/usr/bin/env tsx
/**
 * Uniswap V3 Demo — Concentrated liquidity depth & dynamic fee pre-flight.
 * Usage: pnpm demo:uniswap
 * Trip:  pnpm demo:uniswap -- --trip
 */
import {
  UNISWAP_V3_ARBITRUM_CHAIN_ID,
  evaluateUniswapV3SwapGuard,
} from "../src/adapters/uniswap/uniswap-v3-adapter";
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
} from "./adapters/citadel-ansi-hud";
import { ensureDemoWasmSoft, isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
import { formatGuardTime, measureSync, resolveLatency } from "./lib/demo-timing";

function runHealthy(nowMs: number): number {
  hudIntent("uniswap-demo", "Uniswap V3", "V3_SPOT_SWAP", "WETH/USDC · Arbitrum One");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateUniswapV3SwapGuard({
      chainId: UNISWAP_V3_ARBITRUM_CHAIN_ID,
      tokenIn: "WETH",
      tokenOut: "USDC",
      amountInUsd: 25_000,
      activeLiquidityUsd: 2_500_000,
      dynamicFeeBps: 5,
      tickRangeLiquidityUsd: 200_000,
      tickSpacing: 60,
      directionalFeeBps: 2,
      spotPriceUsd: 3500,
      refPriceUsd: 3500,
      depthUsd: 500_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(
    `${R}  slippageEst=${result.estimatedSlippageBps.toFixed(1)}bps · liquidityOk=${result.liquidityOk}`,
  );
  hudSoilFuse(result.soilOk, latencyUs, result.reasons);
  hudChannelOpen();
  hudDispatched("Uniswap V3 WETH/USDC spot swap", latencyUs);
  return latencyUs;
}

function runTrip(nowMs: number): number {
  hudIntent("uniswap-demo", "Uniswap V3", "DEPLETED_CL_SWAP", "WETH/USDC · toxic utilization");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateUniswapV3SwapGuard({
      chainId: UNISWAP_V3_ARBITRUM_CHAIN_ID,
      tokenIn: "WETH",
      tokenOut: "USDC",
      amountInUsd: 600_000,
      activeLiquidityUsd: 200_000,
      dynamicFeeBps: 85,
      spotPriceUsd: 3500,
      refPriceUsd: 3500,
      depthUsd: 8_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(
    `${R}  slippageEst=${result.estimatedSlippageBps.toFixed(1)}bps · liquidityOk=${result.liquidityOk}`,
  );
  hudSoilFuse(false, latencyUs, result.reasons);
  hudSevered("UNISWAP_V3_LIQUIDITY_DEPLETED");
  hudBlocked();
  if (!result.reasons.includes("SOIL_RESISTANCE_TRIP")) {
    console.error(`${RED}Expected SOIL_RESISTANCE_TRIP in reasons${R}`);
  }
  return latencyUs;
}

wrapDemoExecution(({ nowMs }) => {
  const trip = isDemoTripArgv();
  ensureDemoWasmSoft();
  printBanner("Uniswap V3 Concentrated Liquidity Demo");
  printMode(trip);
  const latencyUs = trip ? runTrip(nowMs) : runHealthy(nowMs);
  console.log(`\n${R}Uniswap guard · ${formatGuardTime(latencyUs)}${R}\n`);
  printResult(!trip);
  if (trip) return { tripped: true, reason: "SOIL_RESISTANCE_TRIP" };
});
