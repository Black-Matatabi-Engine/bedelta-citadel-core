/**
 * Cross-isolate protocolMask sync — SLIVERVINE_KV hot-path cache + non-blocking writes.
 */
import { KV_KEYS, KV_TTL_SECONDS, resolveKv, type SliverVineKv } from "./keys";

interface ProtocolMaskKvRecord {
  version: 1;
  mask: number;
  savedAt: string;
}

let boundKv: SliverVineKv | undefined;
let cachedMask = 0;

export function bindProtocolMaskKv(kv?: SliverVineKv): void {
  boundKv = resolveKv(kv);
}

export function readProtocolMaskSync(): number {
  return cachedMask;
}

export async function prefetchProtocolMaskKv(kv?: SliverVineKv): Promise<number> {
  const binding = resolveKv(kv ?? boundKv);
  if (!binding) return cachedMask;
  try {
    const raw = await binding.get(KV_KEYS.PROTOCOL_MASK);
    if (!raw) return cachedMask;
    const parsed = JSON.parse(raw) as ProtocolMaskKvRecord;
    if (typeof parsed.mask === "number" && Number.isFinite(parsed.mask)) {
      cachedMask = parsed.mask | 0;
    }
  } catch {
    /* fail-closed — retain last known cache */
  }
  return cachedMask;
}

/** Non-blocking KV persist — updates local cache immediately, put() is fire-and-forget. */
export function scheduleProtocolMaskKvWrite(nextMask: number): void {
  const binding = resolveKv(boundKv);
  if (!binding) return;
  const merged = (cachedMask | nextMask) | 0;
  if (merged === cachedMask) return;
  cachedMask = merged;
  const record: ProtocolMaskKvRecord = {
    version: 1,
    mask: merged,
    savedAt: new Date().toISOString(),
  };
  void binding
    .put(KV_KEYS.PROTOCOL_MASK, JSON.stringify(record), {
      expirationTtl: KV_TTL_SECONDS.SYSTEM_STATE,
    })
    .catch(() => {
      /* non-blocking — edge hot path must not await */
    });
}

export function mergeProtocolMaskLocal(localMask: number): number {
  return (cachedMask | localMask) | 0;
}

export function __resetProtocolMaskKvForTests(): void {
  boundKv = undefined;
  cachedMask = 0;
}
