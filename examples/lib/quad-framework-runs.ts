import { evaluateElizaCitadelAction } from "../../src/adapters/elizaos/elizaos-citadel-plugin";
import { CitadelRiskGuardTool } from "../../src/adapters/langchain/langchain-citadel-tool";
import { evaluateVirtualsGameTask } from "../../src/adapters/virtuals/virtuals-game-adapter";
import { wayfinderCitadelShieldHook } from "../../src/adapters/wayfinder/wayfinder-shield";
import { HEALTHY_SOIL, hudIntent, TOXIC_SOIL } from "../adapters/citadel-ansi-hud";
import { hrtimeElapsedUs, hrtimeStart, resolveLatency } from "./demo-timing";
import type { FrameworkMeta } from "./framework-boundary-hud";

export type FrameworkResult = {
  framework: string;
  status: string;
  ok: boolean;
  latencyUs: number;
  detail?: string;
};

export type QuadSession = {
  agentAddress: string;
  maxOrderClipUsd: number;
  expiresAtMs: number;
  approvedAtMs: number;
};

type FrameworkRun = (
  trip: boolean,
  nowMs: number,
  session: QuadSession,
) => Promise<FrameworkResult>;

async function runWayfinder(trip: boolean, nowMs: number, session: QuadSession): Promise<FrameworkResult> {
  const agentId = "quad-wayfinder";
  hudIntent(agentId, "Wayfinder", trip ? "TOXIC_ROUTE" : "DELTA_NEUTRAL_GM_DEPOSIT", "Arbitrum 42161");
  const t0 = hrtimeStart();
  const result = await wayfinderCitadelShieldHook.execute({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: new Date(nowMs),
    agentId,
    chainId: 42161,
    nowMs,
    sessionKey: session,
  });
  const latencyUs = resolveLatency(hrtimeElapsedUs(t0), result.latencyUs);
  return { framework: "Wayfinder Agent Engine", status: result.status, ok: result.success, latencyUs, detail: result.reasons?.join("; ") };
}

async function runElizaOS(trip: boolean, nowMs: number, session: QuadSession): Promise<FrameworkResult> {
  const agentId = "quad-elizaos";
  hudIntent(agentId, "ElizaOS", trip ? "TOXIC_ACTION" : "CITADEL_SOIL_GUARD", "GMX v2 ETH/USDC GM");
  const t0 = hrtimeStart();
  const result = await evaluateElizaCitadelAction(
    { agentId },
    {
      soil: { ...(trip ? TOXIC_SOIL : HEALTHY_SOIL), at: new Date(nowMs) },
      intent: trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT",
      nowMs,
      chainId: 42161,
      sessionKey: session,
    },
  );
  const latencyUs = resolveLatency(hrtimeElapsedUs(t0), result.latencyUs);
  return { framework: "ElizaOS Framework", status: result.status, ok: result.success, latencyUs, detail: result.reasons?.join("; ") ?? result.text };
}

async function runVirtuals(trip: boolean, nowMs: number, session: QuadSession): Promise<FrameworkResult> {
  const agentId = "quad-virtuals";
  hudIntent(agentId, "Virtuals GAME", trip ? "TOXIC_TASK" : "GAME_TRADE_INTENT", "GMX v2 ETH/USDC GM");
  const t0 = hrtimeStart();
  const result = await evaluateVirtualsGameTask({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: new Date(nowMs),
    agentId,
    chainId: 42161,
    taskId: "game-quad-001",
    intent: trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT",
    nowMs,
    sessionKey: session,
  });
  const latencyUs = resolveLatency(hrtimeElapsedUs(t0), result.latencyUs);
  return { framework: "Virtuals Protocol (GAME)", status: result.status, ok: result.success, latencyUs, detail: result.reasons?.join("; ") ?? result.message };
}

async function runLangChain(trip: boolean, nowMs: number, session: QuadSession): Promise<FrameworkResult> {
  const agentId = "quad-langchain";
  hudIntent(agentId, "LangChain", trip ? "TOXIC_TOOL_CALL" : "TRADE_INTENT", "LangGraph state node");
  const t0 = hrtimeStart();
  const result = await CitadelRiskGuardTool.invoke({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: new Date(nowMs),
    agentId,
    chainId: 42161,
    intent: trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT",
    nowMs,
    sessionKey: session,
  });
  const latencyUs = resolveLatency(hrtimeElapsedUs(t0), result.latencyUs);
  return { framework: "LangChain / LangGraph", status: result.status, ok: result.success, latencyUs, detail: result.reasons?.join("; ") ?? result.output };
}

export const QUAD_FRAMEWORKS: (FrameworkMeta & { run: FrameworkRun })[] = [
  { name: "Wayfinder Agent Engine", layer: "Autonomous Pathfinding & Intent Routing", interception: "Pre-Routing Intent Gate", run: runWayfinder },
  { name: "ElizaOS Framework", layer: "Plugin / Character Action Execution", interception: "Action-to-UserOp Dispatch Hook", run: runElizaOS },
  { name: "Virtuals Protocol (GAME)", layer: "Protocol-Level Agent Task Loop", interception: "On-Chain Task Execution Boundary", run: runVirtuals },
  { name: "LangChain / LangGraph", layer: "State Node & Multi-Step Reasoning", interception: "State Transition Guard", run: runLangChain },
];
