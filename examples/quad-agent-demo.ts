#!/usr/bin/env tsx
/**
 * Multi-AI Framework Demo — four major agent runtimes protected by Citadel.
 * Usage: pnpm demo:multi-ai-framework
 * Legacy: pnpm demo:quad
 * Trip:   pnpm demo:multi-ai-framework -- --trip
 */
import {
  hudBlocked,
  hudChannelOpen,
  hudDispatched,
  hudSevered,
  hudSoilFuse,
  printBanner,
  printMode,
  printResult,
  R,
  RED,
} from "./adapters/citadel-ansi-hud";
import {
  formatExecutionLatency,
  formatGuardTime,
  printDynamicBenchmarkBreakdown,
  printIntentLayerBanner,
  type DemoBenchmarkSnapshot,
} from "./lib/demo-timing";
import { isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
import { printFrameworkBoundary } from "./lib/framework-boundary-hud";
import { QUAD_FRAMEWORKS, type FrameworkResult } from "./lib/quad-framework-runs";

const GRAY = "\x1b[90m";
const BOLD = "\x1b[1m";

const SESSION_BASE = {
  agentAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  maxOrderClipUsd: 30,
};

function printFrameworkResult(r: FrameworkResult, trip: boolean): void {
  const color = trip ? (r.ok ? "\x1b[33;1m" : "\x1b[32;1m") : r.ok ? "\x1b[32;1m" : "\x1b[31;1m";
  const mark = trip ? (r.ok ? "⚠" : "✓") : r.ok ? "✓" : "✗";
  console.log(`${color}  ${mark} ${r.framework}${R} → ${r.status} · ${formatExecutionLatency(r.latencyUs)}`);
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

wrapDemoExecution(async ({ nowMs }) => {
  const trip = isDemoTripArgv();
  const session = { ...SESSION_BASE, expiresAtMs: nowMs + 86_400_000, approvedAtMs: nowMs - 1_000 };
  printBanner("Multi-AI Framework Demo");
  printIntentLayerBanner();
  printMode(trip);

  console.log(`${BOLD}Citadel Pre-Execution Risk Gateway — Four Major AI Agent Frameworks${R}\n`);

  const results: FrameworkResult[] = [];
  for (const fw of QUAD_FRAMEWORKS) {
    printFrameworkBoundary(fw);
    const result = await fw.run(trip, nowMs, session);
    printFrameworkResult(result, trip);
    results.push(result);
  }

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
    if (trip) return { tripped: true, reason: "SOIL_FUSE_TRIP" };
    return;
  }

  printResult(false);
  console.error(`${RED}Multi-AI framework demo: ${passCount}/4 ${trip ? "unexpected ALLOW" : "FAIL_CLOSED"}${R}`);
  process.exit(1);
});
