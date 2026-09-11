/**
 * SPDX-License-Identifier: Apache-2.0
 * Wasm IP boundary — binds retail reflex eval to `pkg/soil_core.wasm` (proprietary core).
 */
import { INTENT_RING_SLAB, INTENT_RING_U32 } from "../../core/intent-core-buffers";
import { syncIntentSlotToWasmSlab } from "../../core/intent-core-ring";
import {
  INTENT_CORE_HEAP_WORDS,
  INTENT_SLOT_ATTEMPTS,
  INTENT_SLOT_FLAGS,
  INTENT_SLOT_ALLOWED_MASK,
  INTENT_SLOT_TARGET_BIT,
} from "../../core/wasm-intent-ffi";
import {
  SOIL_FFI_REUSABLE_BUFFER,
  WASM_ABI_VERSION,
  WASM_SOIL_INPUT_BYTES,
  WASM_SOIL_OUTPUT_BYTES,
  encodeWasmSoilInput,
} from "../../core/wasm-soil-ffi";
import { readDefaultWasmBytesSync } from "../soil-wasm-node";
import type { RetailSoilQuote } from "./types";

const WASM_SOIL_OUT_OFFSET = WASM_SOIL_INPUT_BYTES;
const WASM_INTENT_HEAP_BYTE_OFFSET = WASM_SOIL_INPUT_BYTES + WASM_SOIL_OUTPUT_BYTES;

type RetailWasmExports = {
  memory: WebAssembly.Memory;
  soil_core_eval: (inPtr: number, outPtr: number) => number;
  soil_core_abi_version: () => number;
  intent_core_evaluate_gate: (
    heapPtr: number,
    allowedMask: bigint,
    targetBit: bigint,
    maxAttempts: bigint,
  ) => number;
};

let exportsRef: RetailWasmExports | null = null;

function bindRetailWasm(bytes: Uint8Array): boolean {
  try {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const mod = new WebAssembly.Module(copy);
    const instance = new WebAssembly.Instance(mod, {});
    const ex = instance.exports as unknown as RetailWasmExports;
    if (typeof ex.soil_core_eval !== "function") return false;
    if (ex.soil_core_abi_version() !== WASM_ABI_VERSION) return false;
    exportsRef = ex;
    return true;
  } catch {
    exportsRef = null;
    return false;
  }
}

/** Bootstrap Wasm reflex core for retail guard (idempotent). */
export function ensureRetailGuardWasm(): boolean {
  if (exportsRef) return true;
  const bytes = readDefaultWasmBytesSync();
  if (!bytes) return false;
  return bindRetailWasm(bytes);
}

export function isRetailGuardWasmReady(): boolean {
  return exportsRef != null;
}

export function __resetRetailGuardWasmForTests(): void {
  exportsRef = null;
}

export interface WasmSoilEvalResult {
  tripFlags: number;
  crossVenueSlippage: number;
}

/** Evaluate soil lane via Wasm using `SOIL_FFI_REUSABLE_BUFFER` — returns null when Wasm unavailable. */
export function evaluateSoilViaWasm(quote: RetailSoilQuote): WasmSoilEvalResult | null {
  if (!ensureRetailGuardWasm() || !exportsRef) return null;
  encodeWasmSoilInput({
    hlSpot: quote.hlSpot,
    hlPerp: quote.hlPerp,
    dydxPerp: quote.dydxPerp,
    depthUsd: quote.depthUsd,
    orderSizeUsd: 0,
    accountBalanceUsd: 0,
    maxSlippage: quote.maxSlippage ?? 0.005,
    minDepthUsd: quote.minDepthUsd ?? 100_000,
  });
  const mem = new Uint8Array(exportsRef.memory.buffer);
  const encoded = new Uint8Array(SOIL_FFI_REUSABLE_BUFFER);
  mem.set(encoded.subarray(0, WASM_SOIL_INPUT_BYTES), 0);
  const tripFlags = exportsRef.soil_core_eval(0, WASM_SOIL_OUT_OFFSET);
  const view = new DataView(exportsRef.memory.buffer);
  return {
    tripFlags,
    crossVenueSlippage: view.getFloat64(WASM_SOIL_OUT_OFFSET, true),
  };
}

export interface WasmIntentGateResult {
  ok: boolean;
  venueDrift: boolean;
  severChannel: boolean;
  attempts: number;
}

/** Evaluate intent gate via Wasm `INTENT_RING_SLAB` slice — returns null when Wasm unavailable. */
export function evaluateIntentGateViaWasm(
  baseOffset: number,
  allowedMask: number,
  targetBit: number,
  maxAttempts: number,
): WasmIntentGateResult | null {
  if (!ensureRetailGuardWasm() || !exportsRef) return null;
  if (typeof exportsRef.intent_core_evaluate_gate !== "function") return null;

  INTENT_RING_U32[baseOffset + INTENT_SLOT_ALLOWED_MASK] = allowedMask >>> 0;
  INTENT_RING_U32[baseOffset + INTENT_SLOT_TARGET_BIT] = targetBit >>> 0;
  syncIntentSlotToWasmSlab(baseOffset);

  const view = new DataView(exportsRef.memory.buffer);
  for (let i = 0; i < INTENT_CORE_HEAP_WORDS; i += 1) {
    view.setBigInt64(
      WASM_INTENT_HEAP_BYTE_OFFSET + i * 8,
      INTENT_RING_SLAB[baseOffset + i],
      true,
    );
  }

  const allowed = exportsRef.intent_core_evaluate_gate(
    WASM_INTENT_HEAP_BYTE_OFFSET,
    BigInt(allowedMask >>> 0),
    BigInt(targetBit >>> 0),
    BigInt(maxAttempts),
  );

  for (let i = 0; i < INTENT_CORE_HEAP_WORDS; i += 1) {
    INTENT_RING_SLAB[baseOffset + i] = view.getBigInt64(
      WASM_INTENT_HEAP_BYTE_OFFSET + i * 8,
      true,
    );
  }
  INTENT_RING_U32[baseOffset + INTENT_SLOT_ATTEMPTS] = Number(
    INTENT_RING_SLAB[baseOffset + INTENT_SLOT_ATTEMPTS],
  );
  INTENT_RING_U32[baseOffset + INTENT_SLOT_FLAGS] = Number(
    INTENT_RING_SLAB[baseOffset + INTENT_SLOT_FLAGS],
  );

  const attempts = INTENT_RING_U32[baseOffset + INTENT_SLOT_ATTEMPTS];
  const flags = INTENT_RING_U32[baseOffset + INTENT_SLOT_FLAGS];
  const venueDrift = (flags & 2) !== 0;
  const severChannel = (flags & 1) !== 0;
  return {
    ok: allowed === 1,
    venueDrift,
    severChannel,
    attempts,
  };
}

export const WASM_INTENT_WORDS_PER_SLOT = INTENT_CORE_HEAP_WORDS;
