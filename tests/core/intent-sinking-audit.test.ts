import { describe, expect, it } from "vitest";
import {
  allocIntentCoreHeap,
  checkVenueDriftPure,
  encodeVenueMaskPure,
  evaluateIntentGatePure,
  INTENT_CORE_HEAP_BYTES,
  INTENT_CORE_HEAP_WORDS,
  INTENT_SLOT_ATTEMPTS,
  INTENT_SLOT_ALLOWED_MASK,
  INTENT_SLOT_FLAGS,
  INTENT_SLOT_TARGET_BIT,
  INTENT_WASM_ABI_VERSION,
  trackAttemptBudgetPure,
  venueKeyToBitPure,
} from "../../src/core/intent-core";
import {
  INTENT_CORE_HEAP_BYTES as FFI_HEAP_BYTES,
  INTENT_CORE_HEAP_WORDS as FFI_HEAP_WORDS,
  INTENT_WASM_ABI_VERSION as FFI_ABI_VERSION,
} from "../../src/core/wasm-intent-ffi";

describe("intent-core — pure state machine determinism", () => {
  it("checkVenueDriftPure is deterministic for mask / bit inputs", () => {
    const allowed = encodeVenueMaskPure([0, 2]);
    const target = venueKeyToBitPure(0);
    expect(checkVenueDriftPure(allowed, target)).toBe(true);
    expect(checkVenueDriftPure(allowed, venueKeyToBitPure(1))).toBe(false);
    expect(checkVenueDriftPure(0n, venueKeyToBitPure(1))).toBe(true);
  });

  it("trackAttemptBudgetPure severs on 4th attempt with in-place heap mutation", () => {
    const heap = allocIntentCoreHeap();
    for (let i = 1; i <= 3; i += 1) {
      const step = trackAttemptBudgetPure(heap);
      expect(step.allowed).toBe(true);
      expect(step.severChannel).toBe(false);
      expect(step.nextAttempts).toBe(i);
    }
    const fourth = trackAttemptBudgetPure(heap);
    expect(fourth.allowed).toBe(false);
    expect(fourth.severChannel).toBe(true);
    expect(fourth.nextAttempts).toBe(4);
    expect(Number(heap[INTENT_SLOT_FLAGS] & 1n)).toBe(1);
  });

  it("evaluateIntentGatePure fails closed on venue drift before attempt increment", () => {
    const heap = allocIntentCoreHeap();
    const allowed = encodeVenueMaskPure([0]);
    const target = venueKeyToBitPure(1);
    const gate = evaluateIntentGatePure(heap, allowed, target);
    expect(gate.ok).toBe(false);
    expect(gate.venueDrift).toBe(true);
    expect(gate.attempts).toBe(0);
    expect(Number(heap[INTENT_SLOT_ATTEMPTS])).toBe(0);
  });
});

describe("intent-core — Wasm C-ABI memory layout parity", () => {
  it("matches wasm-intent-ffi constants (i64 slots, 32-byte heap)", () => {
    expect(INTENT_WASM_ABI_VERSION).toBe(FFI_ABI_VERSION);
    expect(INTENT_CORE_HEAP_WORDS).toBe(FFI_HEAP_WORDS);
    expect(INTENT_CORE_HEAP_BYTES).toBe(FFI_HEAP_BYTES);
    expect(INTENT_CORE_HEAP_WORDS).toBe(4);
    expect(INTENT_CORE_HEAP_BYTES).toBe(32);
  });

  it("packs mandate fields into fixed slots 2–3", () => {
    const heap = allocIntentCoreHeap();
    const allowed = encodeVenueMaskPure([0, 1, 2]);
    const target = venueKeyToBitPure(0);
    evaluateIntentGatePure(heap, allowed, target);
    expect(heap[INTENT_SLOT_ALLOWED_MASK]).toBe(allowed);
    expect(heap[INTENT_SLOT_TARGET_BIT]).toBe(target);
  });
});

describe("intent-core — zero-allocation hot path", () => {
  it("reuses pre-allocated heap without per-iteration object churn", () => {
    const heap = allocIntentCoreHeap();
    const allowed = encodeVenueMaskPure([0]);
    const target = venueKeyToBitPure(0);
    const before = process.memoryUsage().heapUsed;

    for (let i = 0; i < 5_000; i += 1) {
      checkVenueDriftPure(allowed, target);
      heap[INTENT_SLOT_ATTEMPTS] = 0n;
      heap[INTENT_SLOT_FLAGS] = 0n;
      trackAttemptBudgetPure(heap, 0);
    }

    const after = process.memoryUsage().heapUsed;
    expect(after - before).toBeLessThan(512 * 1024);
  });
});
