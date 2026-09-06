#!/usr/bin/env tsx
/**
 * Stabilizer Protocol Demo — Sepolia 1:1 zero-slippage stablecoin guard.
 * Usage: pnpm demo:stabilizer
 * Trip:  pnpm demo:stabilizer -- --trip
 */
import {
  evaluateStabilizerSwapGuard,
  STABILIZER_SEPOLIA_CHAIN_ID,
  type StabilizerSwapInput,
} from "../src/adapters/stabilizer/stabilizer-adapter";
import {
  hudBackoff,
  hudBlocked,
  hudChannelOpen,
  hudDispatched,
  hudIntent,
  hudSevered,
  hudSoilFuse,
  printBackoffDivider,
  printBackoffResult,
  printBanner,
  printMode,
  printResult,
  R,
  RED,
} from "./adapters/citadel-ansi-hud";
import { measureSync, resolveLatency } from "./lib/demo-timing";
import { isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";

const AGENT_ID = "stabilizer-demo";

function buildSwap(trip: boolean, now: Date): StabilizerSwapInput {
  if (trip) {
    return {
      chainId: STABILIZER_SEPOLIA_CHAIN_ID,
      fromAsset: "USDZ",
      toAsset: "USDC",
      amountUsd: 4_950_000,
      poolReserveUsd: 5_000_000,
      poolCapacityUsd: 5_000_000,
      usdzMarkUsd: 0.994,
      collateralMarkUsd: 1,
      agentId: AGENT_ID,
      at: now,
      nowMs: now.getTime(),
    };
  }
  return {
    chainId: STABILIZER_SEPOLIA_CHAIN_ID,
    fromAsset: "USDZ",
    toAsset: "USDC",
    amountUsd: 50_000,
    poolReserveUsd: 5_000_000,
    poolCapacityUsd: 1_000_000,
    usdzMarkUsd: 1,
    collateralMarkUsd: 1,
    agentId: AGENT_ID,
    at: now,
    nowMs: now.getTime(),
  };
}

async function runDemo(trip: boolean, nowMs: number, at: Date): Promise<{ tripped?: boolean; reason?: string } | void> {
  const swap = buildSwap(trip, at);
  const intent = trip ? "STABILIZER_USDZ_DEPEG_INTERCEPT" : "STABILIZER_ZERO_SLIPPAGE_SWAP";

  printBanner("Stabilizer Protocol · Sepolia Testnet");
  printMode(trip);

  hudIntent(
    AGENT_ID,
    "Stabilizer",
    intent,
    `Arbitrum Sepolia ${STABILIZER_SEPOLIA_CHAIN_ID} · ${swap.fromAsset}→${swap.toAsset} · 1:1 zero-slippage`,
  );

  const { value: result, latencyUs: measuredUs } = measureSync(() => evaluateStabilizerSwapGuard(swap));
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);
  hudSoilFuse(result.soilOk, latencyUs, result.reasons);

  if (result.ok && result.status === "ALLOW") {
    hudChannelOpen();
    hudDispatched(
      `Stabilizer Guard → ${swap.fromAsset}/${swap.toAsset} · Sepolia ${STABILIZER_SEPOLIA_CHAIN_ID}`,
      latencyUs,
    );
    printResult(true);
    return;
  }

  if (result.status === "MANDATORY_COOLDOWN_ACTIVE") {
    hudBackoff(AGENT_ID, 60);
    printBackoffResult();
    console.error(`${RED}${result.reasons.join("; ")}${R}`);
    process.exit(1);
  }

  hudSevered(result.signatureChannelSevered ? "USDZ_DEPEG_SEVERED" : "SOIL_FUSE_TRIP");
  hudBlocked();
  printResult(false);
  console.error(`${RED}${result.reasons.join("; ")}${R}`);

  if (trip) {
    printBackoffDivider();
    const retry = evaluateStabilizerSwapGuard({
      ...swap,
      usdzMarkUsd: 1,
      collateralMarkUsd: 1,
    });
    if (retry.status === "MANDATORY_COOLDOWN_ACTIVE") {
      hudBackoff(AGENT_ID, 60);
      printBackoffResult();
      console.error(`${RED}${retry.reasons.join("; ")}${R}`);
    }
    return { tripped: true, reason: result.reasons[0] ?? "STABILIZER_TRIP" };
  }

  process.exit(1);
}

wrapDemoExecution(async ({ nowMs, at }) => runDemo(isDemoTripArgv(), nowMs, at));
