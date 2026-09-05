#!/usr/bin/env tsx
/**
 * Quad-Agent Framework Demo — all four major AI agent runtimes protected by Citadel.
 * Usage: pnpm demo:quad
 * Trip:  pnpm demo:quad -- --trip
 */
import { evaluateElizaCitadelAction } from "../src/adapters/elizaos/elizaos-shield";
import { CitadelRiskGuardTool } from "../src/adapters/langchain/langchain-citadel-tool";
import { evaluateVirtualsGameTask } from "../src/adapters/virtuals/virtuals-game-adapter";
import { wayfinderCitadelShieldHook } from "../src/adapters/wayfinder/wayfinder-shield";
import {
  HEALTHY_SOIL,
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
  TOXIC_SOIL,
} from "./adapters/citadel-ansi-hud";

const NOW_MS = Date.now();
const SESSION = {
  agentAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  maxOrderClipUsd: 30,
  expiresAtMs: NOW_MS + 86_400_000,
  approvedAtMs: NOW_MS - 1_000,
};

type FrameworkResult = { framework: string; status: string; ok: boolean; detail?: string };

async function runWayfinder(trip: boolean): Promise<FrameworkResult> {
  const agentId = "quad-wayfinder";
  hudIntent(agentId, "Wayfinder", trip ? "TOXIC_ROUTE" : "DELTA_NEUTRAL_GM_DEPOSIT", "Arbitrum 42161");
  const result = await wayfinderCitadelShieldHook.execute({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: new Date(NOW_MS),
    agentId,
    chainId: 42161,
    nowMs: NOW_MS,
    sessionKey: SESSION,
  });
  return {
    framework: "Wayfinder Agent Engine",
    status: result.status,
    ok: result.success,
    detail: result.reasons?.join("; "),
  };
}

async function runElizaOS(trip: boolean): Promise<FrameworkResult> {
  const agentId = "quad-elizaos";
  hudIntent(agentId, "ElizaOS", trip ? "TOXIC_ACTION" : "CITADEL_SOIL_GUARD", "GMX v2 ETH/USDC GM");
  const result = await evaluateElizaCitadelAction(
    { agentId },
    {
      soil: trip ? TOXIC_SOIL : HEALTHY_SOIL,
      intent: trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT",
      nowMs: NOW_MS,
      sessionKey: SESSION,
    },
  );
  return {
    framework: "ElizaOS Framework",
    status: result.status,
    ok: result.success,
    detail: result.reasons?.join("; ") ?? result.text,
  };
}

async function runVirtuals(trip: boolean): Promise<FrameworkResult> {
  const agentId = "quad-virtuals";
  hudIntent(agentId, "Virtuals GAME", trip ? "TOXIC_TASK" : "GAME_TRADE_INTENT", "GMX v2 ETH/USDC GM");
  const result = await evaluateVirtualsGameTask({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: new Date(NOW_MS),
    agentId,
    chainId: 42161,
    taskId: "game-quad-001",
    nowMs: NOW_MS,
    sessionKey: SESSION,
  });
  return {
    framework: "Virtuals Protocol (GAME)",
    status: result.status,
    ok: result.success,
    detail: result.reasons?.join("; ") ?? result.message,
  };
}

async function runLangChain(trip: boolean): Promise<FrameworkResult> {
  const agentId = "quad-langchain";
  hudIntent(agentId, "LangChain", trip ? "TOXIC_TOOL_CALL" : "TRADE_INTENT", "LangGraph state node");
  const result = await CitadelRiskGuardTool.invoke({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: new Date(NOW_MS),
    agentId,
    chainId: 42161,
    nowMs: NOW_MS,
    sessionKey: SESSION,
  });
  return {
    framework: "LangChain / LangGraph",
    status: result.status,
    ok: result.success,
    detail: result.reasons?.join("; ") ?? result.output,
  };
}

function printFrameworkResult(r: FrameworkResult): void {
  const color = r.ok ? "\x1b[32;1m" : "\x1b[31;1m";
  console.log(`${color}  ${r.ok ? "✓" : "✗"} ${r.framework}${R} → ${r.status}`);
  if (!r.ok && r.detail) console.log(`${GRAY}    ${r.detail}${R}`);
}

const GRAY = "\x1b[90m";

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  seedAdapterProbes(NOW_MS);
  printBanner("Quad-Agent Framework Demo");
  printMode(trip);

  console.log(`${BOLD}Citadel Pre-Execution Risk Gateway — Four Major AI Agent Frameworks${R}\n`);

  const results = await Promise.all([
    runWayfinder(trip),
    runElizaOS(trip),
    runVirtuals(trip),
    runLangChain(trip),
  ]);

  for (const r of results) printFrameworkResult(r);

  const passCount = results.filter((r) => r.ok).length;
  const allOk = trip ? results.every((r) => !r.ok) : results.every((r) => r.ok);

  if (!trip && passCount === 4) {
    hudSoilFuse(true, 0, []);
    hudChannelOpen();
    hudDispatched("Quad-Agent → All frameworks ALLOW", 0);
  } else if (trip && passCount === 0) {
    hudSevered("QUAD_FAIL_CLOSED");
  }

  console.log();
  if (allOk) {
    printResult(true);
    return;
  }

  printResult(false);
  console.error(`${RED}Quad demo: ${passCount}/4 ${trip ? "FAIL_CLOSED" : "ALLOW"}${R}`);
  process.exit(1);
}

const BOLD = "\x1b[1m";

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
