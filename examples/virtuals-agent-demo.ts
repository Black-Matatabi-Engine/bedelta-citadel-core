#!/usr/bin/env tsx
/**
 * Virtuals GAME Framework Demo — Citadel pre-broadcast worker guard.
 * Usage: pnpm demo:virtuals
 * Trip:  pnpm demo:virtuals -- --trip
 */
import { evaluateVirtualsGameTask } from "../src/adapters/virtuals/virtuals-game-adapter";
import {
  HEALTHY_SOIL,
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
  TOXIC_SOIL,
} from "./adapters/citadel-ansi-hud";
import { measureAsync, resolveLatency } from "./lib/demo-timing";
import { isDemoTripArgv, withDemoSoil, wrapDemoExecution } from "./lib/demo-harness";

const AGENT_ID = "virtuals-demo";

wrapDemoExecution(async ({ nowMs, at }) => {
  const trip = isDemoTripArgv();

  printBanner("Virtuals GAME Framework Demo");
  printMode(trip);

  const intent = trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT";
  hudIntent(AGENT_ID, "Virtuals GAME", intent, "GMX v2 ETH/USDC GM");

  const { value: result, latencyUs: measuredUs } = await measureAsync(() =>
    evaluateVirtualsGameTask({
      ...withDemoSoil(trip ? TOXIC_SOIL : HEALTHY_SOIL, at),
      agentId: AGENT_ID,
      chainId: 42161,
      taskId: "game-demo-001",
      intent,
      nowMs,
      sessionKey: {
        agentAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        maxOrderClipUsd: 30,
        expiresAtMs: nowMs + 86_400_000,
        approvedAtMs: nowMs - 1_000,
      },
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);

  if (result.status === "MANDATORY_COOLDOWN_ACTIVE") {
    hudBackoff(AGENT_ID, 60);
    printBackoffResult();
    console.error(`${RED}${result.message ?? result.reasons?.join("; ")}${R}`);
    process.exit(1);
  }

  hudSoilFuse(result.success, latencyUs, result.reasons);

  if (result.success && result.status === "ALLOW") {
    hudChannelOpen();
    hudDispatched("Virtuals GAME Worker → GMX v2 GM", latencyUs);
    printResult(true);
    return;
  }

  hudSevered("SOIL_FUSE_TRIP");
  hudBlocked();
  printResult(false);
  console.error(`${RED}${result.reasons?.join("; ")}${R}`);

  if (trip) {
    printBackoffDivider();
    const retry = await evaluateVirtualsGameTask({
      ...TOXIC_SOIL,
      at,
      agentId: AGENT_ID,
      chainId: 42161,
      nowMs,
    });
    if (retry.status === "MANDATORY_COOLDOWN_ACTIVE") {
      hudBackoff(AGENT_ID, 60);
      printBackoffResult();
      process.exit(1);
    }
    return { tripped: true, reason: "SOIL_FUSE_TRIP" };
  } else {
    process.exit(1);
  }
});

