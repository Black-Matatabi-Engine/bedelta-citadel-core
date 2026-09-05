/** High-precision latency helpers for Citadel CLI demos (process.hrtime.bigint). */

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

export function printBenchmarkRow(label: string, us: number, color: string): void {
  console.log(`  ${color}${BOLD}${label.padEnd(26)}${R} ${color}${formatLatencyLabel(us)}${R}`);
}

export function printDynamicBenchmarkBreakdown(snapshot: DemoBenchmarkSnapshot): void {
  console.log(`${BOLD}[BENCHMARK]${R} Runtime: Node.js CLI Harness · live micro-timing`);
  printBenchmarkRow("Pure Invariant Time", snapshot.pureInvariantUs, GUARD_BRIGHT_GREEN);
  printBenchmarkRow("Full Matrix Execution", snapshot.fullMatrixUs, CORE_BRIGHT_CYAN);
  printBenchmarkRow("E2E Harness Overhead", snapshot.e2eHarnessUs, EXEC_BRIGHT_YELLOW);
}

export function printBenchmarkBanner(snapshot?: DemoBenchmarkSnapshot): void {
  if (snapshot) {
    printDynamicBenchmarkBreakdown(snapshot);
    return;
  }
  console.log(`${BOLD}[BENCHMARK]${R} Runtime: Node.js CLI Harness · probing…`);
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
