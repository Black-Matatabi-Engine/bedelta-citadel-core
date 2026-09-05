/** Sliding-window pending OI / notional accumulation — split-payload defense. */
import { GMX_IMBALANCE_MAX } from "./risk-engine-limits";
import { readStateOverride, writeStateOverride } from "./state-store";

export const PENDING_EXPOSURE_WINDOW_MS = 30_000;

let windowSkewUsd = 0;
let windowNotionalUsd = 0;
let windowStartMs = 0;

export function __resetPendingExposureWindowForTests(): void {
  windowSkewUsd = 0;
  windowNotionalUsd = 0;
  windowStartMs = 0;
}

function rollWindow(nowMs: number): void {
  if (windowStartMs === 0 || nowMs - windowStartMs > PENDING_EXPOSURE_WINDOW_MS) {
    windowStartMs = nowMs;
    windowSkewUsd = 0;
    windowNotionalUsd = 0;
  }
}

export function recordPendingGmxSkew(
  skewUsd: number,
  notionalUsd: number,
  nowMs: number,
): { accumSkewUsd: number; accumNotionalUsd: number } {
  rollWindow(nowMs);
  windowSkewUsd += Math.abs(skewUsd);
  windowNotionalUsd += Math.abs(notionalUsd);
  syncPendingExposureToState(nowMs);
  return { accumSkewUsd: windowSkewUsd, accumNotionalUsd: windowNotionalUsd };
}

function syncPendingExposureToState(_nowMs: number): void {
  const override = readStateOverride();
  if (!override) return;
  writeStateOverride({
    ...override,
    pendingOiSkewUsd: windowSkewUsd,
    pendingNotionalUsd: windowNotionalUsd,
    pendingWindowExpiresAtMs: windowStartMs + PENDING_EXPOSURE_WINDOW_MS,
  });
}

export function isPendingGmxSkewTripped(poolTvlUsd: number, nowMs: number): boolean {
  if (windowStartMs === 0 || nowMs - windowStartMs > PENDING_EXPOSURE_WINDOW_MS) {
    return false;
  }
  if (!Number.isFinite(poolTvlUsd) || poolTvlUsd <= 0) return true;
  return windowSkewUsd / poolTvlUsd > GMX_IMBALANCE_MAX;
}

export function readPendingExposureSnapshot(nowMs: number): {
  accumSkewUsd: number;
  accumNotionalUsd: number;
  windowActive: boolean;
} {
  const active =
    windowStartMs > 0 && nowMs - windowStartMs <= PENDING_EXPOSURE_WINDOW_MS;
  return {
    accumSkewUsd: active ? windowSkewUsd : 0,
    accumNotionalUsd: active ? windowNotionalUsd : 0,
    windowActive: active,
  };
}
