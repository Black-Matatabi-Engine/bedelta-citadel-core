#!/usr/bin/env tsx
/**
 * Aave V3 Demo — Health Factor & cross-chain liquidation boundary guard.
 * Usage: pnpm demo:aave
 * Trip:  pnpm demo:aave -- --trip
 */
import {
  AAVE_ARBITRUM_CHAIN_ID,
  evaluateAaveV3Guard,
} from "../src/adapters/aave/aave-v3-adapter";
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
  hudIntent("aave-demo", "Aave Capital", "BORROW", "WETH/USDC · Arbitrum One");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateAaveV3Guard({
      chainId: AAVE_ARBITRUM_CHAIN_ID,
      market: "WETH/USDC",
      collateralUsd: 150_000,
      debtUsd: 80_000,
      liquidationThreshold: 0.825,
      projectedHealthFactor: 1.42,
      refPriceUsd: 3500,
      spotPriceUsd: 3500,
      depthUsd: 500_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(`${R}  healthFactor=${result.healthFactor.toFixed(4)} · hfOk=${result.hfOk}`);
  hudSoilFuse(result.soilOk, latencyUs, result.reasons);
  hudChannelOpen();
  hudDispatched(`Aave lending guard · HF ${result.healthFactor.toFixed(2)}`, latencyUs);
  return latencyUs;
}

function runTrip(nowMs: number): number {
  hudIntent("aave-demo", "Aave Capital", "HF_BREACH", "Cross-chain liquidation boundary");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateAaveV3Guard({
      chainId: AAVE_ARBITRUM_CHAIN_ID,
      market: "WETH/USDC",
      collateralUsd: 95_000,
      debtUsd: 80_000,
      liquidationThreshold: 0.825,
      projectedHealthFactor: 1.08,
      crossChainSourceHf: 1.35,
      crossChainDestHf: 1.12,
      refPriceUsd: 3500,
      spotPriceUsd: 3500,
      depthUsd: 8_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(`${R}  healthFactor=${result.healthFactor.toFixed(4)} · hfOk=${result.hfOk}`);
  hudSoilFuse(false, latencyUs, result.reasons);
  hudSevered("AAVE_HF_FAIL_CLOSED");
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
  printBanner("Aave Capital Lending Guard Demo");
  printMode(trip);
  const latencyUs = trip ? runTrip(nowMs) : runHealthy(nowMs);
  console.log(`\n${R}Aave guard · ${formatGuardTime(latencyUs)}${R}\n`);
  printResult(!trip);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
