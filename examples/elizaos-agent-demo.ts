#!/usr/bin/env tsx
/**
 * ElizaOS Agent Demo — Citadel Shield Action handler.
 * Usage: pnpm demo:elizaos
 * Trip:  pnpm demo:elizaos -- --trip
 */
import { evaluateElizaCitadelAction } from "../src/adapters/elizaos/elizaos-citadel-plugin";
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
import { measureAsync, resolveLatency } from "./lib/demo-timing";
import { getDemoSafeTimestamp, handleDemoExit, muteLibraryConsole } from "./lib/demo-utils";

const AGENT_ID = "elizaos-demo";

async function main(): Promise<void> {
  const restore = muteLibraryConsole();
  try {
  const trip = process.argv.includes("--trip");
  const { nowMs, at } = getDemoSafeTimestamp();
  seedAdapterProbes(nowMs);

  printBanner("ElizaOS Framework Demo");
  printMode(trip);

  const intent = trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT";
  hudIntent(AGENT_ID, "ElizaOS", intent, "GMX v2 ETH/USDC GM");

  const { value: result, latencyUs: measuredUs } = await measureAsync(() =>
    evaluateElizaCitadelAction(
      { agentId: AGENT_ID },
      {
        soil: { ...(trip ? TOXIC_SOIL : HEALTHY_SOIL), at },
        intent,
        nowMs,
        chainId: 42161,
        sessionKey: {
          agentAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          maxOrderClipUsd: 30,
          expiresAtMs: nowMs + 86_400_000,
          approvedAtMs: nowMs - 1_000,
        },
      },
    ),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);

  if (result.status === "MANDATORY_COOLDOWN_ACTIVE") {
    hudBackoff(AGENT_ID, 60);
    printBackoffResult();
    console.error(`${RED}${result.text}${R}`);
    process.exit(1);
  }

  hudSoilFuse(result.success, latencyUs, result.reasons);

  if (result.success && result.status === "ALLOW") {
    hudChannelOpen();
    hudDispatched("ElizaOS Action Handler → GMX v2 GM", latencyUs);
    printResult(true);
    return;
  }

  hudSevered("SOIL_FUSE_TRIP");
  hudBlocked();
  printResult(false);
  console.error(`${RED}${result.text}${R}`);

  if (trip) {
    printBackoffDivider();
    const retry = await evaluateElizaCitadelAction(
      { agentId: AGENT_ID },
      { soil: { ...TOXIC_SOIL, at }, intent, nowMs, chainId: 42161 },
    );
    if (retry.status === "MANDATORY_COOLDOWN_ACTIVE") {
      hudBackoff(AGENT_ID, 60);
      printBackoffResult();
      process.exit(1);
    }
    handleDemoExit(true, "SOIL_FUSE_TRIP");
  } else {
    process.exit(1);
  }
  } finally {
    restore();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
