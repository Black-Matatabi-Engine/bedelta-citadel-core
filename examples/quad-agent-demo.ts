#!/usr/bin/env tsx
/**
 * Quad-Agent Framework Demo — all four major AI agent runtimes protected by Citadel.
 * Usage: pnpm demo:quad
 * Trip:  pnpm demo:quad -- --trip
 */
import { evaluateElizaCitadelAction } from "../src/adapters/elizaos/elizaos-citadel-plugin";
import { CitadelRiskGuardTool } from "../src/adapters/langchain/langchain-citadel-tool";
import { evaluateVirtualsGameTask } from "../src/adapters/virtuals/virtuals-game-adapter";
import { wayfinderCitadelShieldHook } from "../src/adapters/wayfinder/wayfinder-shield";
import {
  HEALTHY_SOIL,
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
  TOXIC_SOIL,
} from "./adapters/citadel-ansi-hud";
import {
  formatExecutionLatency,
  formatGuardTime,
  hrtimeStart,
  hrtimeElapsedUs,
  resolveLatency,
  printDynamicBenchmarkBreakdown,
  type DemoBenchmarkSnapshot,
} from "./lib/demo-timing";

const NOW_MS = Date.now();
const SESSION = {
  agentAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  maxOrderClipUsd: 30,
  expiresAtMs: NOW_MS + 86_400_000,
  approvedAtMs: NOW_MS - 1_000,
};

type FrameworkResult = {
  framework: string;
  status: string;
  ok: boolean;
  latencyUs: number;
  detail?: string;
};

async function runWayfinder(trip: boolean): Promise<FrameworkResult> {
  const agentId = "quad-wayfinder";
  hudIntent(agentId, "Wayfinder", trip ? "TOXIC_ROUTE" : "DELTA_NEUTRAL_GM_DEPOSIT", "Arbitrum 42161");
  const t0 = hrtimeStart();
  const result = await wayfinderCitadelShieldHook.execute({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: new Date(NOW_MS),
    agentId,
    chainId: 42161,
    nowMs: NOW_MS,
    sessionKey: SESSION,
  });
  const latencyUs = resolveLatency(hrtimeElapsedUs(t0), result.latencyUs);
  return {
    framework: "Wayfinder Agent Engine",
    status: result.status,
    ok: result.success,
    latencyUs,
    detail: result.reasons?.join("; "),
  };
}

async function runElizaOS(trip: boolean): Promise<FrameworkResult> {
  const agentId = "quad-elizaos";
  hudIntent(agentId, "ElizaOS", trip ? "TOXIC_ACTION" : "CITADEL_SOIL_GUARD", "GMX v2 ETH/USDC GM");
  const t0 = hrtimeStart();
  const result = await evaluateElizaCitadelAction(
    { agentId },
    {
      soil: { ...(trip ? TOXIC_SOIL : HEALTHY_SOIL), at: new Date(NOW_MS) },
      intent: trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT",
      nowMs: NOW_MS,
      chainId: 42161,
      sessionKey: SESSION,
    },
  );
  const latencyUs = resolveLatency(hrtimeElapsedUs(t0), result.latencyUs);
  return {
    framework: "ElizaOS Framework",
    status: result.status,
    ok: result.success,
    latencyUs,
    detail: result.reasons?.join("; ") ?? result.text,
  };
}

async function runVirtuals(trip: boolean): Promise<FrameworkResult> {
  const agentId = "quad-virtuals";
  hudIntent(agentId, "Virtuals GAME", trip ? "TOXIC_TASK" : "GAME_TRADE_INTENT", "GMX v2 ETH/USDC GM");
  const t0 = hrtimeStart();
  const result = await evaluateVirtualsGameTask({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: new Date(NOW_MS),
    agentId,
    chainId: 42161,
    taskId: "game-quad-001",
    intent: trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT",
    nowMs: NOW_MS,
    sessionKey: SESSION,
  });
  const latencyUs = resolveLatency(hrtimeElapsedUs(t0), result.latencyUs);
  return {
    framework: "Virtuals Protocol (GAME)",
    status: result.status,
    ok: result.success,
    latencyUs,
    detail: result.reasons?.join("; ") ?? result.message,
  };
}

async function runLangChain(trip: boolean): Promise<FrameworkResult> {
  const agentId = "quad-langchain";
  hudIntent(agentId, "LangChain", trip ? "TOXIC_TOOL_CALL" : "TRADE_INTENT", "LangGraph state node");
  const t0 = hrtimeStart();
  const result = await CitadelRiskGuardTool.invoke({
    ...(trip ? TOXIC_SOIL : HEALTHY_SOIL),
    at: new Date(NOW_MS),
    agentId,
    chainId: 42161,
    intent: trip ? "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN" : "DELTA_NEUTRAL_GM_DEPOSIT",
    nowMs: NOW_MS,
    sessionKey: SESSION,
  });
  const latencyUs = resolveLatency(hrtimeElapsedUs(t0), result.latencyUs);
  return {
    framework: "LangChain / LangGraph",
    status: result.status,
    ok: result.success,
    latencyUs,
    detail: result.reasons?.join("; ") ?? result.output,
  };
}

function printFrameworkResult(r: FrameworkResult, trip: boolean): void {
  const color = trip ? (r.ok ? "\x1b[33;1m" : "\x1b[32;1m") : r.ok ? "\x1b[32;1m" : "\x1b[31;1m";
  const mark = trip ? (r.ok ? "⚠" : "✓") : r.ok ? "✓" : "✗";
  console.log(
    `${color}  ${mark} ${r.framework}${R} → ${r.status} · ${formatExecutionLatency(r.latencyUs)}`,
  );
  if (!r.ok && r.detail) {
    console.log(`${GRAY}    ${r.detail}${R}`);
    hudSoilFuse(false, r.latencyUs, r.detail.split("; "));
    hudSevered(trip ? "SOIL_FUSE_TRIP" : "GUARD_FAIL");
    hudBlocked();
  } else if (r.ok && !trip) {
    hudSoilFuse(true, r.latencyUs, []);
    hudChannelOpen();
    hudDispatched(`${r.framework} → pre-broadcast clearance`, r.latencyUs);
  }
  console.log();
}

const GRAY = "\x1b[90m";
const BOLD = "\x1b[1m";

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  seedAdapterProbes(NOW_MS);
  printBanner("Quad-Agent Framework Demo");
  printMode(trip);

  console.log(`${BOLD}Citadel Pre-Execution Risk Gateway — Four Major AI Agent Frameworks${R}\n`);

  const results: FrameworkResult[] = [];
  for (const run of [runWayfinder, runElizaOS, runVirtuals, runLangChain]) {
    results.push(await run(trip));
  }

  console.log(`${BOLD}── Per-Framework Benchmark ──${R}\n`);
  for (const r of results) printFrameworkResult(r, trip);

  const latencies = results.map((r) => r.latencyUs);
  const avgUs = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const maxUs = Math.max(...latencies);
  const minUs = Math.min(...latencies);

  const frameworkBenchmark: DemoBenchmarkSnapshot = {
    pureInvariantUs: minUs,
    fullMatrixUs: avgUs,
    e2eHarnessUs: maxUs,
  };
  console.log(`\n${BOLD}── Aggregate Framework Benchmark ──${R}`);
  printDynamicBenchmarkBreakdown(frameworkBenchmark);
  console.log(
    `\n${BOLD}Aggregate guard time:${R} min ${formatGuardTime(minUs)} · avg ${formatGuardTime(avgUs)} · max ${formatGuardTime(maxUs)}`,
  );

  const passCount = results.filter((r) => r.ok).length;
  const allOk = trip ? results.every((r) => !r.ok) : results.every((r) => r.ok);

  if (trip && allOk) {
    console.log(`\n${RED}${BOLD}0-Gas Fail-Closed: 4/4 frameworks intercepted toxic intent pre-broadcast${R}`);
  }

  console.log();
  if (allOk) {
    printResult(!trip);
    if (trip) process.exit(0);
    return;
  }

  printResult(false);
  console.error(`${RED}Quad demo: ${passCount}/4 ${trip ? "unexpected ALLOW" : "FAIL_CLOSED"}${R}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
