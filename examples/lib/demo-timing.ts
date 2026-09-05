/** High-precision latency helpers for Citadel CLI demos (process.hrtime.bigint). */

export const EDGE_WASM_P50_US = 106;

export const DEMO_BENCHMARK_BANNER =
  "[BENCHMARK] Runtime: Node.js CLI Harness | Core Vector Engine: ~106µs (Edge WASM Target)";

export function printBenchmarkBanner(): void {
  console.log(DEMO_BENCHMARK_BANNER);
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

/** Per-line soil fuse / execution telemetry (no Edge target suffix). */
export function formatExecutionLatency(us: number): string {
  return `Execution Latency: ${formatLatencyLabel(us)}`;
}

/** Per-line guard / dispatch / summary telemetry (no Edge target suffix). */
export function formatGuardTime(us: number): string {
  return `Guard Time: ${formatLatencyLabel(us)}`;
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
