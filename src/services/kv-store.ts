/**
 * BeDelta KV store — Workers KV via BEDELTA_WATER_KV (compat alias: SLIVERVINE_KV).
 * Local `wrangler dev` defaults to Miniflare SQLite unless wrangler.jsonc sets `"remote": true`
 * on this binding (or CLI uses `--remote`). Verify live writes: `npm run kv:ping`.
 */

import type { Env } from "../env";
import type { SystemState } from "./systemState";
import { buildSystemState } from "./systemState";
import type { MatrixSuccessResponse } from "../types/matrix";
import type { SoakTelemetryRollingLog } from "./soak-telemetry";
import { shouldPersistMatrixPayloadToKv, shouldPersistSystemStateToKv } from "./stateManager";

export type SliverVineKv = Env["SLIVERVINE_KV"];

/** Must match wrangler.jsonc `kv_namespaces[].id` for SLIVERVINE_KV */
export const PRODUCTION_KV_NAMESPACE_ID = "af57772629914596b206aef2b5935cf5";

export const KV_KEYS = {
  SYSTEM_STATE: "system:state",
  SYSTEM_HEARTBEAT: "system:heartbeat",
  SYSTEM_PING: "system:ping",
  SYSTEM_DEMO_SNAPSHOT: "system:demo_snapshot",
  SYSTEM_R20_LOCKED: "system:r20_locked",
  SOAK_TELEMETRY: "telemetry:soak-rolling",
  MARKET_SNAPSHOT: "market:price-basis-snapshot",
  MATRIX_LATEST: "matrix:latest",
  RISK_LOG_ROLLING: "telemetry:risk-log-rolling",
} as const;

export const KV_TTL_SECONDS = {
  SYSTEM_STATE: 86_400, // 24h TTL — prevents hardlock state evicting on short KV expiry
  MATRIX: 300,
  MARKET: 300,
  SOAK: 86_400,
  RISK_LOG: 86_400,
} as const;

export interface KvWriteResult {
  ok: boolean;
  key: string;
  skipped: boolean;
}

export interface SystemStateKvRecord {
  version: 1;
  savedAt: string;
  state: unknown;
}

export interface RiskLogEntry {
  at: string;
  level: "info" | "warn" | "error";
  module: string;
  event: string;
  message: string;
}

export interface RiskLogRollingRecord {
  version: 1;
  lastUpdated: string;
  entries: RiskLogEntry[];
}

function resolveKv(kv?: SliverVineKv): SliverVineKv | undefined {
  return kv;
}

/** Dynamic Key Helper for Cross-Chain Venue Isolation */
export function buildVenueKvKey(venue: "hl" | "jup" | "poly", baseKey: string): string {
  return `${venue}:${baseKey}`;
}

/** Type guard for SystemState KV payloads. */
export function isSystemStateLike(state: unknown): state is SystemState {
  if (typeof state !== "object" || state === null) return false;
  const s = state as Record<string, unknown>;
  return (
    typeof s.accountBalanceUsd === "number" &&
    typeof s.currentCri === "number" &&
    typeof s.dynamicMaxSL === "number" &&
    typeof s.hardlock === "boolean"
  );
}

/**
 * Deterministic SSOT merge — conservative CRI/hardlock; dynamicMaxSL recomputed from balance.
 */
export function mergeSystemStateRecords(
  local: SystemState,
  remote: SystemState,
): SystemState {
  const accountBalanceUsd = Math.min(
    local.accountBalanceUsd,
    remote.accountBalanceUsd,
  );
  const currentCri = Math.min(local.currentCri, remote.currentCri);
  const hardlock =
    local.hardlock || remote.hardlock || currentCri <= 0;
  const base = buildSystemState({
    accountBalanceUsd,
    currentCri,
    skipHardlockAssert: true,
    isSandboxMode: local.isSandboxMode || remote.isSandboxMode,
  });

  return {
    ...base,
    hardlock,
    signingChannelOpen: !hardlock,
    hudState: hardlock ? "BLOCKED" : base.hudState,
    dynamicMaxSL: base.dynamicMaxSL,
  };
}

/** Merge multiple edge KV records — earliest→latest fold with conservative gates. */
export function resolveSystemStateKvConflict(
  records: SystemStateKvRecord[],
): SystemStateKvRecord | null {
  if (records.length === 0) return null;

  const sorted = [...records].sort((a, b) =>
    a.savedAt.localeCompare(b.savedAt),
  );
  let merged: SystemState | null = null;

  for (const rec of sorted) {
    if (!isSystemStateLike(rec.state)) continue;
    merged = merged
      ? mergeSystemStateRecords(merged, rec.state)
      : rec.state;
  }

  if (!merged) return sorted.at(-1) ?? null;

  return {
    version: 1,
    savedAt: sorted.at(-1)!.savedAt,
    state: merged,
  };
}

export async function saveSystemStateToKV(
  kv: SliverVineKv | undefined,
  stateData: unknown,
  ttlSeconds = KV_TTL_SECONDS.SYSTEM_STATE,
): Promise<KvWriteResult> {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.SYSTEM_STATE, skipped: true };
  }

  try {
    let payload = stateData;
    const existing = await readSystemStateFromKV(binding);
    if (isSystemStateLike(stateData)) {
      if (existing && isSystemStateLike(existing.state)) {
        payload = mergeSystemStateRecords(existing.state, stateData);
      }
    }

    const record: SystemStateKvRecord = {
      version: 1,
      savedAt: new Date().toISOString(),
      state: payload,
    };

    if (
      isSystemStateLike(payload) &&
      existing &&
      !shouldPersistSystemStateToKv(existing.state, payload)
    ) {
      return { ok: true, key: KV_KEYS.SYSTEM_STATE, skipped: true };
    }

    const effectiveTtl = (isSystemStateLike(payload) && payload.hardlock) ? 86_400 : ttlSeconds;

    await binding.put(KV_KEYS.SYSTEM_STATE, JSON.stringify(record), {
      expirationTtl: effectiveTtl,
    });

    return { ok: true, key: KV_KEYS.SYSTEM_STATE, skipped: false };
  } catch {
    return { ok: false, key: KV_KEYS.SYSTEM_STATE, skipped: false };
  }
}

export async function saveMatrixPayloadToKV(
  kv: SliverVineKv | undefined,
  payload: MatrixSuccessResponse,
  ttlSeconds = KV_TTL_SECONDS.MATRIX,
): Promise<KvWriteResult> {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.MATRIX_LATEST, skipped: true };
  }

  try {
    const raw = await binding.get(KV_KEYS.MATRIX_LATEST);
    if (raw) {
      try {
        const existing = JSON.parse(raw) as { payload?: unknown };
        if (
          existing?.payload &&
          !shouldPersistMatrixPayloadToKv(existing.payload, payload)
        ) {
          return { ok: true, key: KV_KEYS.MATRIX_LATEST, skipped: true };
        }
      } catch {
        // corrupt cache — rewrite
      }
    }

    await binding.put(
      KV_KEYS.MATRIX_LATEST,
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        payload,
      }),
      { expirationTtl: ttlSeconds },
    );

    return { ok: true, key: KV_KEYS.MATRIX_LATEST, skipped: false };
  } catch {
    return { ok: false, key: KV_KEYS.MATRIX_LATEST, skipped: false };
  }
}

export async function saveMarketSnapshotToKV(
  kv: SliverVineKv | undefined,
  snapshot: unknown,
  ttlSeconds = KV_TTL_SECONDS.MARKET,
): Promise<KvWriteResult> {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.MARKET_SNAPSHOT, skipped: true };
  }

  try {
    const nextRaw = JSON.stringify(snapshot);
    const existingRaw = await binding.get(KV_KEYS.MARKET_SNAPSHOT);
    if (existingRaw === nextRaw) {
      return { ok: true, key: KV_KEYS.MARKET_SNAPSHOT, skipped: true };
    }

    await binding.put(KV_KEYS.MARKET_SNAPSHOT, nextRaw, {
      expirationTtl: ttlSeconds,
    });

    return { ok: true, key: KV_KEYS.MARKET_SNAPSHOT, skipped: false };
  } catch {
    return { ok: false, key: KV_KEYS.MARKET_SNAPSHOT, skipped: false };
  }
}

export async function saveSoakTelemetryToKV(
  kv: SliverVineKv | undefined,
  log: SoakTelemetryRollingLog,
  ttlSeconds = KV_TTL_SECONDS.SOAK,
): Promise<KvWriteResult> {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.SOAK_TELEMETRY, skipped: true };
  }

  try {
    await binding.put(KV_KEYS.SOAK_TELEMETRY, JSON.stringify(log), {
      expirationTtl: ttlSeconds,
    });

    return { ok: true, key: KV_KEYS.SOAK_TELEMETRY, skipped: false };
  } catch {
    return { ok: false, key: KV_KEYS.SOAK_TELEMETRY, skipped: false };
  }
}

export async function appendRiskLogToKV(
  kv: SliverVineKv | undefined,
  entry: RiskLogEntry,
  maxEntries = 200,
): Promise<KvWriteResult> {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.RISK_LOG_ROLLING, skipped: true };
  }

  try {
    const raw = await binding.get(KV_KEYS.RISK_LOG_ROLLING);
    let record: RiskLogRollingRecord = {
      version: 1,
      lastUpdated: entry.at,
      entries: [],
    };

    if (raw) {
      try {
        record = JSON.parse(raw) as RiskLogRollingRecord;
      } catch {
        record.entries = [];
      }
    }

    const entries = [...record.entries, entry].slice(-maxEntries);
    const next: RiskLogRollingRecord = {
      version: 1,
      lastUpdated: entry.at,
      entries,
    };

    await binding.put(KV_KEYS.RISK_LOG_ROLLING, JSON.stringify(next), {
      expirationTtl: KV_TTL_SECONDS.RISK_LOG,
    });

    return { ok: true, key: KV_KEYS.RISK_LOG_ROLLING, skipped: false };
  } catch {
    return { ok: false, key: KV_KEYS.RISK_LOG_ROLLING, skipped: false };
  }
}

export async function readSystemStateFromKV(
  kv: SliverVineKv | undefined,
): Promise<SystemStateKvRecord | null> {
  const binding = resolveKv(kv);
  if (!binding) return null;

  try {
    const raw = await binding.get(KV_KEYS.SYSTEM_STATE);
    if (!raw) return null;
    return JSON.parse(raw) as SystemStateKvRecord;
  } catch {
    return null;
  }
}