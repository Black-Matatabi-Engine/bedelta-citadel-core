/**
 * Pure intent mandate state machine — Wasm-ready, zero ambient I/O.
 * Memory layout matches `src/wasm/intent_core.rs` C-ABI (4 × i64).
 */
import {
  INTENT_CORE_HEAP_WORDS,
  INTENT_FLAG_SEVER_CHANNEL,
  INTENT_FLAG_VENUE_DRIFT,
  INTENT_MAX_ATTEMPTS_DEFAULT,
  INTENT_SLOT_ALLOWED_MASK,
  INTENT_SLOT_ATTEMPTS,
  INTENT_SLOT_FLAGS,
  INTENT_SLOT_TARGET_BIT,
} from "./wasm-intent-ffi";

export {
  INTENT_CORE_HEAP_BYTES,
  INTENT_CORE_HEAP_WORDS,
  INTENT_FLAG_SEVER_CHANNEL,
  INTENT_FLAG_VENUE_DRIFT,
  INTENT_MAX_ATTEMPTS_DEFAULT,
  INTENT_SLOT_ATTEMPTS,
  INTENT_SLOT_ALLOWED_MASK,
  INTENT_SLOT_FLAGS,
  INTENT_SLOT_TARGET_BIT,
  INTENT_WASM_ABI_VERSION,
  VENUE_BIT_AAVE,
  VENUE_BIT_GMX,
  VENUE_BIT_HYPERLIQUID,
  VENUE_BIT_MORPHO,
  VENUE_BIT_PENDLE,
  VENUE_BIT_UNISWAP,
  VENUE_BIT_USDAI,
  VENUE_BIT_VARIATIONAL,
} from "./wasm-intent-ffi";

export interface AttemptBudgetResult {
  readonly allowed: boolean;
  readonly severChannel: boolean;
  readonly nextAttempts: number;
}

/** Allocate zeroed C-ABI heap (4 × i64). */
export function allocIntentCoreHeap(): BigInt64Array {
  return new BigInt64Array(INTENT_CORE_HEAP_WORDS);
}

/** Map venue matrix index (0–7) to single-bit mask. */
export function venueKeyToBitPure(venueIndex: number): bigint {
  if (!Number.isInteger(venueIndex) || venueIndex < 0 || venueIndex > 63) return 0n;
  return 1n << BigInt(venueIndex);
}

/** OR-combine venue indices into allowed mask. */
export function encodeVenueMaskPure(venueIndices: readonly number[]): bigint {
  let mask = 0n;
  for (let i = 0; i < venueIndices.length; i += 1) {
    mask |= venueKeyToBitPure(venueIndices[i]!);
  }
  return mask;
}

/**
 * Returns true when target venue is authorized (no drift).
 * Mask 0 or target bit 0 → mandate not armed → pass.
 */
export function checkVenueDriftPure(allowedVenuesMask: bigint, targetVenueBit: bigint): boolean {
  if (allowedVenuesMask === 0n || targetVenueBit === 0n) return true;
  return (allowedVenuesMask & targetVenueBit) !== 0n;
}

/**
 * Increment attempt counter in heap slot 0; fail-closed on budget exhaust.
 * `currentAttempts` optional — when omitted, reads slot 0.
 */
export function trackAttemptBudgetPure(
  memoryBuffer: BigInt64Array,
  currentAttempts?: number,
  maxAttempts: number = INTENT_MAX_ATTEMPTS_DEFAULT,
): AttemptBudgetResult {
  const base =
    currentAttempts !== undefined
      ? currentAttempts
      : Number(memoryBuffer[INTENT_SLOT_ATTEMPTS] ?? 0n);
  const next = base + 1;
  memoryBuffer[INTENT_SLOT_ATTEMPTS] = BigInt(next);

  if (next > maxAttempts) {
    memoryBuffer[INTENT_SLOT_FLAGS] =
      (memoryBuffer[INTENT_SLOT_FLAGS] ?? 0n) | BigInt(INTENT_FLAG_SEVER_CHANNEL);
    return { allowed: false, severChannel: true, nextAttempts: next };
  }

  return { allowed: true, severChannel: false, nextAttempts: next };
}

/** Pack mandate snapshot into heap slots 2–3 (read-only for Wasm FFI export). */
export function packIntentMandateHeap(
  memoryBuffer: BigInt64Array,
  allowedVenuesMask: bigint,
  targetVenueBit: bigint,
): void {
  memoryBuffer[INTENT_SLOT_ALLOWED_MASK] = allowedVenuesMask;
  memoryBuffer[INTENT_SLOT_TARGET_BIT] = targetVenueBit;
}

/** Pure combined gate — venue drift then attempt budget. Mutates heap in-place. */
export function evaluateIntentGatePure(
  memoryBuffer: BigInt64Array,
  allowedVenuesMask: bigint,
  targetVenueBit: bigint,
  maxAttempts: number = INTENT_MAX_ATTEMPTS_DEFAULT,
): { ok: boolean; venueDrift: boolean; severChannel: boolean; attempts: number } {
  packIntentMandateHeap(memoryBuffer, allowedVenuesMask, targetVenueBit);

  if (!checkVenueDriftPure(allowedVenuesMask, targetVenueBit)) {
    memoryBuffer[INTENT_SLOT_FLAGS] =
      (memoryBuffer[INTENT_SLOT_FLAGS] ?? 0n) | BigInt(INTENT_FLAG_VENUE_DRIFT);
    return {
      ok: false,
      venueDrift: true,
      severChannel: false,
      attempts: Number(memoryBuffer[INTENT_SLOT_ATTEMPTS] ?? 0n),
    };
  }

  const budget = trackAttemptBudgetPure(memoryBuffer, undefined, maxAttempts);
  return {
    ok: budget.allowed,
    venueDrift: false,
    severChannel: budget.severChannel,
    attempts: budget.nextAttempts,
  };
}
