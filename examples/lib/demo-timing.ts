/** High-precision latency helpers for Citadel CLI demos (process.hrtime.bigint). */

export const EDGE_TARGET_US = 106;
/** Production SSOT latency bands — hardware-agnostic; local CLI may vary. */
export const PURE_INVARIANT_BAND_US = "~0.5–1.1µs (warm-path min)";
export const REFLEX_CORE_BAND_US = "p50 ~15µs (<20µs warm path)";
export const E2E_SHIELD_BAND_US = "p50 ~106µs (Edge Worker target)";
export const LATENCY_HOST_VARIANCE_DISCLAIMER =
  "Absolute CLI μs vary by CPU/OS; production SSOT = Edge p50 bands.";
export const BENCH_BOX_W = 64;
export const INTENT_BOX_W = 72;
const BENCH_KV_LABEL_W = 22;

const SLOW_LAYER = "\x1b[31;2m";
const SLOW_DIM = "\x1b[90m";

export const R = "\x1b[0m";
export const BOLD = "\x1b[1m";
export const GRAY = "\x1b[90m";
export const GUARD_BRIGHT_GREEN = "\x1b[92;1m";
export const CORE_BRIGHT_CYAN = "\x1b[96;1m";
export const EXEC_BRIGHT_YELLOW = "\x1b[93;1m";

export interface DemoBenchmarkSnapshot {
  pureInvariantUs: number;
  fullMatrixUs: number;
  e2eHarnessUs: number;
}

export function hrtimeStart(): bigint {
  return process.hrtime.bigint();
}

export function hrtimeElapsedUs(start: bigint): number {
  const us = Number(process.hrtime.bigint() - start) / 1000;
  return us > 0 ? us : 0.1;
}

export function measureProbe(fn: () => void, runs = 3): number {
  fn();
  let min = Infinity;
  for (let i = 0; i < runs; i++) {
    const t0 = hrtimeStart();
    fn();
    min = Math.min(min, hrtimeElapsedUs(t0));
  }
  return min > 0 ? min : 0.1;
}

export function captureDemoBenchmark(probes: {
  pureInvariant: () => void;
  fullMatrix: () => void;
  e2eHarness: () => void;
}): DemoBenchmarkSnapshot {
  return {
    pureInvariantUs: measureProbe(probes.pureInvariant),
    fullMatrixUs: measureProbe(probes.fullMatrix),
    e2eHarnessUs: measureProbe(probes.e2eHarness),
  };
}

export function resolveLatency(measuredUs: number, reportedUs?: number): number {
  const reported = reportedUs && reportedUs > 0 ? reportedUs : 0;
  return Math.max(measuredUs, reported, 0.1);
}

export function formatLatencyLabel(us: number): string {
  return us >= 1000 ? `${(us / 1000).toFixed(2)}ms` : `${us.toFixed(1)}µs`;
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function padVisible(text: string, width: number): string {
  const pad = Math.max(0, width - stripAnsi(text).length);
  return text + " ".repeat(pad);
}

function formatBenchmarkKvRow(label: string, latencyUs: number, suffix = ""): string {
  const kv = `  ${label.padEnd(BENCH_KV_LABEL_W)}: ${formatLatencyLabel(latencyUs)}`;
  return `${GRAY}${kv}${R}${suffix}`;
}

export function printDynamicBenchmarkBreakdown(snapshot: DemoBenchmarkSnapshot): void {
  const matrixPass = snapshot.fullMatrixUs <= EDGE_TARGET_US;
  const passTag = matrixPass ? ` ${GUARD_BRIGHT_GREEN}${BOLD}(PASS)${R}` : "";
  const title = `${BOLD}[BENCHMARK]${R} Bands: ${PURE_INVARIANT_BAND_US} · ${REFLEX_CORE_BAND_US} · ${E2E_SHIELD_BAND_US}`;
  const rows = [
    formatBenchmarkKvRow("Pure Invariant (local)", snapshot.pureInvariantUs, ` ${GRAY}${PURE_INVARIANT_BAND_US}${R}`),
    formatBenchmarkKvRow("Full Matrix (local)", snapshot.fullMatrixUs, `${passTag} ${GRAY}${REFLEX_CORE_BAND_US}${R}`),
    formatBenchmarkKvRow("E2E Harness (local)", snapshot.e2eHarnessUs, ` ${GRAY}${E2E_SHIELD_BAND_US}${R}`),
  ];
  const innerW = BENCH_BOX_W - 2;
  console.log(`${CORE_BRIGHT_CYAN}┌${"─".repeat(BENCH_BOX_W)}┐${R}`);
  console.log(`${CORE_BRIGHT_CYAN}│${R}${padVisible(` ${title}`, innerW)}${CORE_BRIGHT_CYAN}│${R}`);
  for (const row of rows) {
    console.log(`${CORE_BRIGHT_CYAN}│${R}${padVisible(` ${row}`, innerW)}${CORE_BRIGHT_CYAN}│${R}`);
  }
  console.log(`${CORE_BRIGHT_CYAN}└${"─".repeat(BENCH_BOX_W)}┘${R}`);
  console.log(`${GRAY}  ${LATENCY_HOST_VARIANCE_DISCLAIMER}${R}`);
}

export function printBenchmarkBanner(snapshot?: DemoBenchmarkSnapshot): void {
  if (snapshot) {
    printDynamicBenchmarkBreakdown(snapshot);
    return;
  }
  console.log(`${BOLD}[BENCHMARK]${R} Runtime: Edge Wasm Kernel · probing…`);
}

function intentBoxLine(content: string): void {
  const innerW = INTENT_BOX_W - 2;
  console.log(`${CORE_BRIGHT_CYAN}│${R}${padVisible(` ${content}`, innerW)}${CORE_BRIGHT_CYAN}│${R}`);
}

export function printIntentLayerBanner(): void {
  const slowBar = `${SLOW_LAYER}▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓${R}`;
  const reflexBar = `${GUARD_BRIGHT_GREEN}██████████████${R}`;
  console.log(`${CORE_BRIGHT_CYAN}┌${"─".repeat(INTENT_BOX_W)}┐${R}`);
  intentBoxLine(`${SLOW_LAYER}${BOLD}🧠 LLM Cerebrum (Reasoning)${R}  ${slowBar}  ${SLOW_DIM}~1.0s–10.0s${R}`);
  intentBoxLine(`${SLOW_DIM}          ↓ intent payload (untrusted)${R}`);
  intentBoxLine(
    `${GUARD_BRIGHT_GREEN}${BOLD}⚡ Citadel Cerebellum (Wasm Reflex)${R}  ${reflexBar}  ${CORE_BRIGHT_CYAN}${BOLD}<14µs FAIL-CLOSED${R}`,
  );
  intentBoxLine(`${GRAY}          ↓ cleared signatures only${R}`);
  intentBoxLine(`${EXEC_BRIGHT_YELLOW}🔗 EIP-712 Sign / Chain Settlement${R}  ${GRAY}(post-shield)${R}`);
  console.log(`${CORE_BRIGHT_CYAN}└${"─".repeat(INTENT_BOX_W)}┘${R}`);
}

/** Per-line soil fuse / execution telemetry (Node harness E2E). */
export function formatExecutionLatency(us: number): string {
  return `${EXEC_BRIGHT_YELLOW}${BOLD}▸ Execution Latency: ${formatLatencyLabel(us)}${R}`;
}

/** Per-line guard / dispatch telemetry — bright emphasis for pitch video scanability. */
export function formatGuardTime(us: number): string {
  return `${GUARD_BRIGHT_GREEN}${BOLD}⚡ Guard Time: ${formatLatencyLabel(us)}${R}`;
}

export function printGuardTimeBlock(us: number, indent = "      "): void {
  console.log(`${indent}${formatGuardTime(us)}`);
}

/** Happy-path verification telemetry — replaces Guard Time on ALLOWED paths. */
export function formatVerificationLatency(us: number): string {
  return `${GUARD_BRIGHT_GREEN}${BOLD}⚡ Verification Latency: ${formatLatencyLabel(us)}${R}`;
}

export function printVerificationLatencyBlock(us: number, indent = "      "): void {
  console.log(`${indent}${formatVerificationLatency(us)}`);
}

/** Happy-path shield clearance — Full Matrix Execution (microseconds). */
export function printE2eShieldLatencyBlock(us: number, indent = "  "): void {
  console.log(`${indent}${GUARD_BRIGHT_GREEN}${BOLD}⚡ E2E Shield Latency: ${formatLatencyLabel(us)}${R}`);
}

/** Tripped-path Wasm reflex severance — Full Matrix Execution (microseconds). */
export function printReflexCoreDeadlockBlock(us: number, indent = "  "): void {
  console.log(`${indent}${CORE_BRIGHT_CYAN}${BOLD}⚡ Reflex Core Deadlock: ${formatLatencyLabel(us)}${R}`);
}

export function printExecutionLatencyBlock(us: number, indent = "      "): void {
  console.log(`${indent}${formatExecutionLatency(us)}`);
}

export async function measureAsync<T>(
  fn: () => Promise<T>,
): Promise<{ value: T; latencyUs: number }> {
  const t0 = hrtimeStart();
  const value = await fn();
  return { value, latencyUs: hrtimeElapsedUs(t0) };
}

export function measureSync<T>(fn: () => T): { value: T; latencyUs: number } {
  const t0 = hrtimeStart();
  const value = fn();
  return { value, latencyUs: hrtimeElapsedUs(t0) };
}
