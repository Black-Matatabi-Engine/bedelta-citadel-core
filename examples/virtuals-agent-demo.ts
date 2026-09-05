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
  seedAdapterProbes,
  TOXIC_SOIL,
} from "./adapters/citadel-ansi-hud";

const AGENT_ID = "virtuals-demo";

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  const now = new Date();
  seedAdapterProbes(now.getTime());

  printBanner("Virtuals GAME Framework Demo");
  printMode(trip);

  const intent = trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT";
  hudIntent(AGENT_ID, "Virtuals GAME", intent, "GMX v2 ETH/USDC GM");

  const result = await evaluateVirtualsGameTask({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: now,
    agentId: AGENT_ID,
    chainId: 42161,
    taskId: "game-demo-001",
    intent,
    nowMs: now.getTime(),
    sessionKey: {
      agentAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      maxOrderClipUsd: 30,
      expiresAtMs: now.getTime() + 86_400_000,
      approvedAtMs: now.getTime() - 1_000,
    },
  });

  if (result.status === "MANDATORY_COOLDOWN_ACTIVE") {
    hudBackoff(AGENT_ID, 60);
    printBackoffResult();
    console.error(`${RED}${result.message ?? result.reasons?.join("; ")}${R}`);
    process.exit(1);
  }

  hudSoilFuse(result.success, result.latencyUs ?? 0, result.reasons);

  if (result.success && result.status === "ALLOW") {
    hudChannelOpen();
    hudDispatched("Virtuals GAME Worker → GMX v2 GM", result.latencyUs ?? 0);
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
      at: now,
      agentId: AGENT_ID,
      chainId: 42161,
      nowMs: now.getTime(),
    });
    if (retry.status === "MANDATORY_COOLDOWN_ACTIVE") {
      hudBackoff(AGENT_ID, 60);
      printBackoffResult();
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
