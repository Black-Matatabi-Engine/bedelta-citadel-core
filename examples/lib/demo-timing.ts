/** High-precision latency helpers for Citadel CLI demos (process.hrtime.bigint). */

export const EDGE_TARGET_US = 106;
export const BENCH_BOX_W = 76;
export const BAR_INNER_WIDTH = 14;
export const INTENT_BOX_W = 72;
const BENCH_LABEL_W = 20;

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

function benchmarkPct(us: number, e2eUs: number): number {
  if (e2eUs <= 0) return 100;
  return Math.min(100, (us / e2eUs) * 100);
}

function asciiBar(pct: number): string {
  const filled = Math.max(0, Math.min(BAR_INNER_WIDTH, Math.round((pct / 100) * BAR_INNER_WIDTH)));
  return `[${"█".repeat(filled)}${" ".repeat(BAR_INNER_WIDTH - filled)}]`;
}

function formatBenchmarkBarLines(
  label: string,
  us: number,
  pct: number,
  color: string,
  opts?: { pass?: boolean; force100?: boolean },
): [string, string] {
  const pctLabel = opts?.force100 ? "100%" : `${pct.toFixed(1)}%`;
  const passTag = opts?.pass ? ` ${GUARD_BRIGHT_GREEN}${BOLD}(PASS)${R}` : "";
  const bar = asciiBar(opts?.force100 ? 100 : pct);
  const barRow = `${color}${BOLD}${label.padEnd(BENCH_LABEL_W)}${R} ${bar} ${color}${BOLD}${pctLabel}${R}${passTag}`;
  const latencyRow = `${" ".repeat(BENCH_LABEL_W + 1)}${GRAY}${formatLatencyLabel(us)}${R}`;
  return [barRow, latencyRow];
}

export function printDynamicBenchmarkBreakdown(snapshot: DemoBenchmarkSnapshot): void {
  const e2e = snapshot.e2eHarnessUs;
  const purePct = benchmarkPct(snapshot.pureInvariantUs, e2e);
  const matrixPct = benchmarkPct(snapshot.fullMatrixUs, e2e);
  const matrixPass = snapshot.fullMatrixUs <= EDGE_TARGET_US;
  const title = `${BOLD}[BENCHMARK]${R} Runtime: Node.js CLI Harness ${CORE_BRIGHT_CYAN}${BOLD}(Edge Target: <${EDGE_TARGET_US.toFixed(1)}µs)${R}`;
  const rowPairs = [
    formatBenchmarkBarLines("Pure Invariant Time", snapshot.pureInvariantUs, purePct, GUARD_BRIGHT_GREEN),
    formatBenchmarkBarLines("Full Matrix Execution", snapshot.fullMatrixUs, matrixPct, CORE_BRIGHT_CYAN, { pass: matrixPass }),
    formatBenchmarkBarLines("E2E Harness Overhead", snapshot.e2eHarnessUs, 100, EXEC_BRIGHT_YELLOW, { force100: true }),
  ];
  const innerW = BENCH_BOX_W - 2;
  console.log(`${CORE_BRIGHT_CYAN}┌${"─".repeat(BENCH_BOX_W)}┐${R}`);
  console.log(`${CORE_BRIGHT_CYAN}│${R}${padVisible(` ${title}`, innerW)}${CORE_BRIGHT_CYAN}│${R}`);
  for (const [barRow, latencyRow] of rowPairs) {
    console.log(`${CORE_BRIGHT_CYAN}│${R}${padVisible(` ${barRow}`, innerW)}${CORE_BRIGHT_CYAN}│${R}`);
    console.log(`${CORE_BRIGHT_CYAN}│${R}${padVisible(` ${latencyRow}`, innerW)}${CORE_BRIGHT_CYAN}│${R}`);
  }
  console.log(`${CORE_BRIGHT_CYAN}└${"─".repeat(BENCH_BOX_W)}┘${R}`);
}

export function printBenchmarkBanner(snapshot?: DemoBenchmarkSnapshot): void {
  if (snapshot) {
    printDynamicBenchmarkBreakdown(snapshot);
    return;
  }
  console.log(`${BOLD}[BENCHMARK]${R} Runtime: Node.js CLI Harness · probing…`);
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
