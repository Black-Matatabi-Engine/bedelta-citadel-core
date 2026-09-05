/** High-precision latency helpers for Citadel CLI demos (process.hrtime.bigint). */

export const EDGE_WASM_P50_US = 106;
export const GUARD_BITMASK_P50_US = 14;

export const R = "\x1b[0m";
export const BOLD = "\x1b[1m";
export const GRAY = "\x1b[90m";
export const GUARD_BRIGHT_GREEN = "\x1b[92;1m";
export const CORE_BRIGHT_CYAN = "\x1b[96;1m";
export const EXEC_BRIGHT_YELLOW = "\x1b[93;1m";

export const DEMO_BENCHMARK_BANNER =
  "[BENCHMARK] Runtime: Node.js CLI Harness | Core Vector Engine: ~106µs (Edge WASM Target)";

export function printTimingTaxonomy(): void {
  console.log(`${GRAY}  Timing taxonomy:${R}`);
  console.log(
    `    ${GUARD_BRIGHT_GREEN}${BOLD}⚡ Guard Time${R} — Pure Invariant Bitmask Execution (~${GUARD_BITMASK_P50_US}.0µs)`,
  );
  console.log(
    `    ${CORE_BRIGHT_CYAN}${BOLD}◎ Core Vector Engine${R} — Cloudflare Edge Gateway Target (~${EDGE_WASM_P50_US}µs)`,
  );
  console.log(
    `    ${EXEC_BRIGHT_YELLOW}${BOLD}▸ Execution Latency${R} — Node.js Harness E2E Execution (~522µs)`,
  );
}

export function printBenchmarkBanner(): void {
  console.log(DEMO_BENCHMARK_BANNER);
  printTimingTaxonomy();
}

export function hrtimeStart(): bigint {
  return process.hrtime.bigint();
}

export function hrtimeElapsedUs(start: bigint): number {
  const us = Number(process.hrtime.bigint() - start) / 1000;
  return us > 0 ? us : 0.1;
}

export function resolveLatency(measuredUs: number, reportedUs?: number): number {
  const reported = reportedUs && reportedUs > 0 ? reportedUs : 0;
  return Math.max(measuredUs, reported, 0.1);
}

export function formatLatencyLabel(us: number): string {
  return us >= 1000 ? `${(us / 1000).toFixed(2)}ms` : `${us.toFixed(1)}µs`;
}

/** Per-line soil fuse / execution telemetry (Node harness E2E). */
export function formatExecutionLatency(us: number): string {
  return `${EXEC_BRIGHT_YELLOW}${BOLD}▸ Execution Latency: ${formatLatencyLabel(us)}${R}`;
}

/** Per-line guard / dispatch / summary telemetry — bright emphasis for pitch video scanability. */
export function formatGuardTime(us: number): string {
  return `${GUARD_BRIGHT_GREEN}${BOLD}⚡ Guard Time: ${formatLatencyLabel(us)}${R}`;
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
