#!/usr/bin/env tsx
/**
 * Camelot V3 Demo — Concentrated liquidity depth & dynamic fee pre-flight.
 * Usage: pnpm demo:camelot
 * Trip:  pnpm demo:camelot -- --trip
 */
import {
  CAMELOT_V3_ARBITRUM_CHAIN_ID,
  evaluateCamelotV3SwapGuard,
} from "../src/adapters/camelot/camelot-v3-adapter";
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
import { formatGuardTime, measureSync, resolveLatency } from "./lib/demo-timing";

function runHealthy(nowMs: number): number {
  hudIntent("camelot-demo", "Camelot V3", "V3_SPOT_SWAP", "WETH/USDC · Arbitrum One");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateCamelotV3SwapGuard({
      chainId: CAMELOT_V3_ARBITRUM_CHAIN_ID,
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
  hudDispatched("Camelot V3 WETH/USDC spot swap", latencyUs);
  return latencyUs;
}

function runTrip(nowMs: number): number {
  hudIntent("camelot-demo", "Camelot V3", "DEPLETED_CL_SWAP", "WETH/USDC · toxic utilization");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateCamelotV3SwapGuard({
      chainId: CAMELOT_V3_ARBITRUM_CHAIN_ID,
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
  hudSevered("CAMELOT_V3_LIQUIDITY_DEPLETED");
  hudBlocked();
  if (!result.reasons.includes("SOIL_RESISTANCE_TRIP")) {
    console.error(`${RED}Expected SOIL_RESISTANCE_TRIP in reasons${R}`);
  }
  return latencyUs;
}

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  if (!ensureSoilWasm()) {
    console.error(`${RED}soil_core.wasm unavailable${R}`);
    process.exit(1);
  }
  const nowMs = Date.now();
  seedAdapterProbes(nowMs);
  printBanner("Camelot V3 Concentrated Liquidity Demo");
  printMode(trip);
  const latencyUs = trip ? runTrip(nowMs) : runHealthy(nowMs);
  console.log(`\n${R}Camelot guard · ${formatGuardTime(latencyUs)}${R}\n`);
  printResult(!trip);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
