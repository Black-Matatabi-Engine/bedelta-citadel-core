#!/usr/bin/env tsx
/**
 * Radiant Capital Demo — Health Factor & cross-chain liquidation boundary guard.
 * Usage: pnpm demo:radiant
 * Trip:  pnpm demo:radiant -- --trip
 */
import {
  RADIANT_ARBITRUM_CHAIN_ID,
  evaluateRadiantLendingGuard,
} from "../src/adapters/radiant/radiant-lending-adapter";
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
import { formatLatencyLabel, measureSync, resolveLatency } from "./lib/demo-timing";

function runHealthy(nowMs: number): number {
  hudIntent("radiant-demo", "Radiant Capital", "BORROW", "WETH/USDC · Arbitrum One");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateRadiantLendingGuard({
      chainId: RADIANT_ARBITRUM_CHAIN_ID,
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
  hudDispatched(`Radiant lending guard · HF ${result.healthFactor.toFixed(2)} · ${formatLatencyLabel(latencyUs)}`, latencyUs);
  return latencyUs;
}

function runTrip(nowMs: number): number {
  hudIntent("radiant-demo", "Radiant Capital", "HF_BREACH", "Cross-chain liquidation boundary");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateRadiantLendingGuard({
      chainId: RADIANT_ARBITRUM_CHAIN_ID,
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
  hudSevered("RADIANT_HF_FAIL_CLOSED");
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
  printBanner("Radiant Capital Lending Guard Demo");
  printMode(trip);
  console.log(`${R}Latency: process.hrtime.bigint()${R}\n`);
  const latencyUs = trip ? runTrip(nowMs) : runHealthy(nowMs);
  console.log(`\n${R}Radiant guard latency: ${formatLatencyLabel(latencyUs)}${R}\n`);
  printResult(!trip);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
