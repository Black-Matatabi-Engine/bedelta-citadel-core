/** Module-load singleton ring buffers — globalThis SSOT survives duplicate Vitest module graphs. */
import { INTENT_CORE_HEAP_WORDS, INTENT_RING_SLOT_COUNT } from "./wasm-intent-ffi";

type IntentRingGlobal = typeof globalThis & {
  __citadelIntentRingSlab?: BigInt64Array;
  __citadelIntentRingU32?: Uint32Array;
};

const g = globalThis as IntentRingGlobal;
const ringWords = INTENT_CORE_HEAP_WORDS * INTENT_RING_SLOT_COUNT;

export const INTENT_RING_SLAB =
  g.__citadelIntentRingSlab ?? (g.__citadelIntentRingSlab = new BigInt64Array(ringWords));

export const INTENT_RING_U32 =
  g.__citadelIntentRingU32 ?? (g.__citadelIntentRingU32 = new Uint32Array(ringWords));
