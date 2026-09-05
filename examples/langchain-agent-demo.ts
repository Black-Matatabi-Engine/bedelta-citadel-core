#!/usr/bin/env tsx
/**
 * LangChain / LangGraph Demo — CitadelRiskGuardTool pre-broadcast guard.
 * Usage: pnpm demo:langchain
 * Trip:  pnpm demo:langchain -- --trip
 */
import { CitadelRiskGuardTool } from "../src/adapters/langchain/langchain-citadel-tool";
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
import { DEMO_LATENCY_LEGEND, measureAsync, resolveLatency } from "./lib/demo-timing";

const AGENT_ID = "langchain-demo";

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  const now = new Date();
  seedAdapterProbes(now.getTime());

  printBanner("LangChain / LangGraph Demo");
  printMode(trip);
  console.log(`${R}${DEMO_LATENCY_LEGEND}${R}\n`);

  const intent = trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT";
  hudIntent(AGENT_ID, "LangChain", intent, "LangGraph state node · GMX v2 ETH/USDC GM");

  const { value: result, latencyUs: measuredUs } = await measureAsync(() =>
    CitadelRiskGuardTool.invoke({
      ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
      at: now,
      agentId: AGENT_ID,
      chainId: 42161,
      intent,
      nowMs: now.getTime(),
      sessionKey: {
        agentAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
        maxOrderClipUsd: 30,
        expiresAtMs: now.getTime() + 86_400_000,
        approvedAtMs: now.getTime() - 1_000,
      },
    }),
  );
  const latencyUs = resolveLatency(measuredUs, result.latencyUs);

  if (result.status === "MANDATORY_COOLDOWN_ACTIVE") {
    hudBackoff(AGENT_ID, 60);
    printBackoffResult();
    console.error(`${RED}${result.reasons?.join("; ")}${R}`);
    process.exit(1);
  }

  hudSoilFuse(result.success, latencyUs, result.reasons);

  if (result.success && result.status === "ALLOW") {
    hudChannelOpen();
    hudDispatched("LangChain CitadelRiskGuardTool → GMX v2 GM", latencyUs);
    printResult(true);
    return;
  }

  hudSevered("SOIL_FUSE_TRIP");
  hudBlocked();
  printResult(false);
  console.error(`${RED}${result.reasons?.join("; ")}${R}`);

  if (trip) {
    printBackoffDivider();
    const retry = await CitadelRiskGuardTool.invoke({
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
