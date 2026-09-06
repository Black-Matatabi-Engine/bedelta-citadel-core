#!/usr/bin/env tsx
/**
 * USD.ai Yield Collateral Demo — GPU RWA oracle · peg · depth pre-flight.
 * Usage: pnpm demo:usdai
 * Trip:  pnpm demo:usdai -- --trip
 * Live:  pnpm demo:usdai -- --livingwater
 */
import {
  evaluateUsdAiCollateralGuard,
  USDAI_ARBITRUM_CHAIN_ID,
  USD_AI_DEPEG_ORACLE_TRIP,
} from "../src/adapters/usdai/usdai-adapter";
import { ensureDemoWasmSoft, isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
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
import { formatGuardTime, measureSync, resolveLatency } from "./lib/demo-timing";

const HEALTHY_BASE = {
  chainId: USDAI_ARBITRUM_CHAIN_ID,
  collateralSymbol: "sUSDai",
  susdaiPriceUsd: 1,
  navUsd: 102_500,
  gpuMarkUsd: 102_500,
  liquidityDepthUsd: 2_500_000,
  amountUsd: 75_000,
};

function runHealthy(nowMs: number): number {
  hudIntent("usdai-demo", "USD.ai", "YIELD_COLLATERAL", "sUSDai · AI-compute RWA · Arbitrum One");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateUsdAiCollateralGuard({
      ...HEALTHY_BASE,
      oracleTimestampMs: nowMs - 180_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(
    `${R}  oracleOk=${result.oracleOk} · depthOk=${result.depthOk} · soilOk=${result.soilOk}${R}`,
  );
  hudSoilFuse(result.soilOk, latencyUs, result.reasons);
  hudChannelOpen();
  hudDispatched("USD.ai sUSDai yield collateral", latencyUs);
  return latencyUs;
}

function runTrip(nowMs: number): number {
  hudIntent("usdai-demo", "USD.ai", "DEPEG_ORACLE", "sUSDai · simulated peg drift + oracle lag");
  const { value: result, latencyUs: measuredUs } = measureSync(() =>
    evaluateUsdAiCollateralGuard({
      ...HEALTHY_BASE,
      susdaiPriceUsd: 0.993,
      oracleTimestampMs: nowMs - 8_500_000,
      liquidityDepthUsd: 120_000,
      amountUsd: 50_000,
      nowMs,
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  console.log(
    `${R}  oracleOk=${result.oracleOk} · depthOk=${result.depthOk} · status=${result.status}${R}`,
  );
  hudSoilFuse(false, latencyUs, result.reasons);
  hudSevered(USD_AI_DEPEG_ORACLE_TRIP);
  hudBlocked();
  if (!result.reasons.includes(USD_AI_DEPEG_ORACLE_TRIP)) {
    console.error(`${RED}Expected ${USD_AI_DEPEG_ORACLE_TRIP} in reasons${R}`);
  }
  return latencyUs;
}

wrapDemoExecution(({ nowMs }) => {
  const trip = isDemoTripArgv();
  ensureDemoWasmSoft();
  printBanner("USD.ai Yield Collateral Guard Demo");
  printMode(trip);
  const latencyUs = trip ? runTrip(nowMs) : runHealthy(nowMs);
  console.log(`\n${R}USD.ai guard · ${formatGuardTime(latencyUs)}${R}\n`);
  printResult(!trip);
  if (trip) return { tripped: true, reason: USD_AI_DEPEG_ORACLE_TRIP };
});
