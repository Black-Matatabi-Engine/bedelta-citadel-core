/**
 * KV write gate — skip SLIVERVINE_KV.put when critical defense flags are unchanged.
 * Prevents Cloudflare 429 Limit Exceeded on high-frequency cron /api/data loops.
 */

import type { SystemState } from "./systemState";
import { isSystemStateLike } from "./kv-store";

/** Slice persisted to KV — Pro Trader gates + Taiji/Bagua posture */
export interface CriticalKvFlags {
  taijiMode: string | null;
  activeGate: string | null;
  circuitBreaker: boolean;
  rootProtection: boolean;
  currentCri: number;
}

export function extractCriticalKvFlags(state: unknown): CriticalKvFlags | null {
  if (!isSystemStateLike(state)) return null;
  const s = state as SystemState;
  return {
    taijiMode: s.taijiMode ?? null,
    activeGate: s.activeGate ?? null,
    circuitBreaker: s.signingChannelOpen === false || s.hardlock === true,
    rootProtection: s.hardlock === true || s.currentCri <= 0,
    currentCri: Math.round(s.currentCri),
  };
}

export function criticalKvFlagsEqual(
  a: CriticalKvFlags,
  b: CriticalKvFlags,
): boolean {
  return (
    a.taijiMode === b.taijiMode &&
    a.activeGate === b.activeGate &&
    a.circuitBreaker === b.circuitBreaker &&
    a.rootProtection === b.rootProtection &&
    a.currentCri === b.currentCri
  );
}

/** True when merged SystemState critical flags differ from KV record (or no prior record). */
export function shouldPersistSystemStateToKv(
  existingState: unknown,
  mergedState: unknown,
): boolean {
  const next = extractCriticalKvFlags(mergedState);
  if (!next) return true;
  const prev = extractCriticalKvFlags(existingState);
  if (!prev) return true;
  return !criticalKvFlagsEqual(prev, next);
}

/** Fingerprint high-churn matrix sensor fields (funding kings + row count). */
export function matrixSensorFingerprint(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const p = payload as Record<string, unknown>;
  const matrix = Array.isArray(p.matrix)
    ? p.matrix
    : Array.isArray(p.data)
      ? p.data
      : [];
  return JSON.stringify({
    rows: matrix.length,
    kings: p.funding_rate_kings ?? null,
    vix: p.vix_traditional ?? p.vix ?? null,
    dvol: p.dvol_crypto ?? null,
  });
}

export function shouldPersistMatrixPayloadToKv(
  existingPayload: unknown,
  nextPayload: unknown,
): boolean {
  const nextFp = matrixSensorFingerprint(nextPayload);
  if (!nextFp) return true;
  const prevFp = matrixSensorFingerprint(existingPayload);
  if (!prevFp) return true;
  return nextFp !== prevFp;
}
