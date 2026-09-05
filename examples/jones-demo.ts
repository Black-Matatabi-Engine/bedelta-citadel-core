#!/usr/bin/env tsx
/**
 * Jones DAO Demo — Vault share-price slippage & flash-loan sandwich guard.
 * Usage: pnpm demo:jones
 * Trip:  pnpm demo:jones -- --trip
 */
import {
  JONES_ARBITRUM_CHAIN_ID,
  evaluateJonesVaultGuard,
} from "../src/adapters/jones/jones-vault-adapter";
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
  hudIntent("jones-demo", "Jones DAO", "REBALANCE", "jGLP vault · Arbitrum One");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateJonesVaultGuard({
      chainId: JONES_ARBITRUM_CHAIN_ID,
      vaultId: "jGLP",
      action: "REBALANCE",
      amountUsd: 50_000,
      vaultTvlUsd: 5_000_000,
      expectedSharePriceUsd: 1.245,
      quotedSharePriceUsd: 1.246,
      rebalancePending: false,
      refPriceUsd: 3500,
      spotPriceUsd: 3500,
      depthUsd: 400_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(`${R}  shareSlippage=${result.shareSlippageBps.toFixed(1)}bps · shareOk=${result.shareOk}`);
  hudSoilFuse(result.soilOk, latencyUs, result.reasons);
  hudChannelOpen();
  hudDispatched(`Jones vault rebalance · slippage ${result.shareSlippageBps.toFixed(1)}bps`, latencyUs);
  return latencyUs;
}

function runTrip(nowMs: number): number {
  hudIntent("jones-demo", "Jones DAO", "FLASH_SANDWICH", "jGLP · pending rebalance");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateJonesVaultGuard({
      chainId: JONES_ARBITRUM_CHAIN_ID,
      vaultId: "jGLP",
      action: "REBALANCE",
      amountUsd: 50_000,
      vaultTvlUsd: 5_000_000,
      expectedSharePriceUsd: 1.245,
      quotedSharePriceUsd: 1.32,
      rebalancePending: true,
      blockPriceDeviationBps: 35,
      refPriceUsd: 3500,
      spotPriceUsd: 3500,
      depthUsd: 6_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(`${R}  shareSlippage=${result.shareSlippageBps.toFixed(1)}bps · shareOk=${result.shareOk}`);
  hudSoilFuse(false, latencyUs, result.reasons);
  hudSevered("JONES_FLASH_SANDWICH_TRIP");
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
  printBanner("Jones DAO Vault Guard Demo");
  printMode(trip);
  const latencyUs = trip ? runTrip(nowMs) : runHealthy(nowMs);
  console.log(`\n${R}Jones guard · ${formatGuardTime(latencyUs)}${R}\n`);
  printResult(!trip);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
