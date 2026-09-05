#!/usr/bin/env tsx
/**
 * Morpho Blue Demo — Oracle freshness & market liquidity pre-flight.
 * Usage: pnpm demo:morpho
 * Trip:  pnpm demo:morpho -- --trip
 */
import {
  MORPHO_ARBITRUM_CHAIN_ID,
  evaluateMorphoBlueGuard,
} from "../src/adapters/morpho/morpho-blue-adapter";
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
  hudIntent("morpho-demo", "Morpho Blue", "MARKET_SUPPLY", "WETH/USDC · Arbitrum One");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateMorphoBlueGuard({
      chainId: MORPHO_ARBITRUM_CHAIN_ID,
      marketId: "WETH/USDC",
      action: "SUPPLY",
      amountUsd: 50_000,
      marketLiquidityUsd: 5_000_000,
      oraclePriceUsd: 3500,
      referencePriceUsd: 3500,
      oracleTimestampMs: nowMs - 120_000,
      refPriceUsd: 3500,
      spotPriceUsd: 3500,
      depthUsd: 400_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(`${R}  oracleAgeMs=${result.oracleAgeMs} · oracleOk=${result.oracleOk}${R}`);
  hudSoilFuse(result.soilOk, latencyUs, result.reasons);
  hudChannelOpen();
  hudDispatched("Morpho Blue WETH/USDC supply", latencyUs);
  return latencyUs;
}

function runTrip(nowMs: number): number {
  hudIntent("morpho-demo", "Morpho Blue", "STALE_ORACLE", "WETH/USDC · toxic oracle age");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateMorphoBlueGuard({
      chainId: MORPHO_ARBITRUM_CHAIN_ID,
      marketId: "WETH/USDC",
      action: "BORROW",
      amountUsd: 200_000,
      marketLiquidityUsd: 80_000,
      oraclePriceUsd: 3650,
      referencePriceUsd: 3500,
      oracleTimestampMs: nowMs - 5_000_000,
      refPriceUsd: 3500,
      spotPriceUsd: 3500,
      depthUsd: 6_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(`${R}  oracleAgeMs=${result.oracleAgeMs} · oracleOk=${result.oracleOk}${R}`);
  hudSoilFuse(false, latencyUs, result.reasons);
  hudSevered("MORPHO_ORACLE_STALE");
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
  printBanner("Morpho Blue Oracle Guard Demo");
  printMode(trip);
  const latencyUs = trip ? runTrip(nowMs) : runHealthy(nowMs);
  console.log(`\n${R}Morpho guard · ${formatGuardTime(latencyUs)}${R}\n`);
  printResult(!trip);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
