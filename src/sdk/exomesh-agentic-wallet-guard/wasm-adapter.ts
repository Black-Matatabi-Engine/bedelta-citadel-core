/**
 * SPDX-License-Identifier: Apache-2.0
 * Wasm IP boundary — binds retail reflex eval to `pkg/soil_core.wasm`.
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
  copySoilFfiInto,
  encodeWasmSoilInput,
  WASM_ABI_VERSION,
  WASM_SOIL_INPUT_BYTES,
  WASM_SOIL_OUTPUT_BYTES,
} from "../../core/wasm-soil-ffi";
import { readDefaultWasmBytesSync } from "../soil-wasm-node";
import type { RetailSoilQuote } from "./types";

const WASM_SOIL_OUT_OFFSET = WASM_SOIL_INPUT_BYTES;
const WASM_INTENT_HEAP_BYTE_OFFSET = WASM_SOIL_INPUT_BYTES + WASM_SOIL_OUTPUT_BYTES;
const SOIL_IN = {
  hlSpot: 0,
  hlPerp: 0,
  dydxPerp: 0,
  depthUsd: 0,
  orderSizeUsd: 0,
  accountBalanceUsd: 0,
  maxSlippage: 0.005,
  minDepthUsd: 100_000,
};
const SOIL_SCRATCH: WasmSoilEvalResult = { tripFlags: 0, crossVenueSlippage: 0 };
const INTENT_SCRATCH: WasmIntentGateResult = {
  ok: false,
  venueDrift: false,
  severChannel: false,
  attempts: 0,
};

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
let wasmU8: Uint8Array | null = null;
let wasmView: DataView | null = null;
let wasmInitScratch: Uint8Array | null = null;

const BIGINT_U32_LUT: bigint[] = (() => {
  const lut: bigint[] = new Array(4096);
  for (let i = 0; i < lut.length; i += 1) lut[i] = BigInt(i);
  return lut;
})();

function toBigIntU32(n: number): bigint {
  const v = n >>> 0;
  return v < BIGINT_U32_LUT.length ? BIGINT_U32_LUT[v]! : BigInt(v);
}

function bindViews(): { u8: Uint8Array; view: DataView } | null {
  if (!exportsRef) return null;
  const buf = exportsRef.memory.buffer;
  if (!wasmU8 || wasmU8.buffer !== buf) {
    wasmU8 = new Uint8Array(buf);
    wasmView = new DataView(buf);
  }
  return { u8: wasmU8, view: wasmView! };
}

function bindRetailWasm(bytes: Uint8Array): boolean {
  try {
    if (!wasmInitScratch || wasmInitScratch.byteLength < bytes.byteLength) {
      wasmInitScratch = new Uint8Array(bytes.byteLength);
    }
    const copy = wasmInitScratch.subarray(0, bytes.byteLength);
    copy.set(bytes);
    const mod = new WebAssembly.Module(copy as BufferSource);
    const instance = new WebAssembly.Instance(mod, {});
    const ex = instance.exports as unknown as RetailWasmExports;
    if (typeof ex.soil_core_eval !== "function") return false;
    if (ex.soil_core_abi_version() !== WASM_ABI_VERSION) return false;
    exportsRef = ex;
    wasmU8 = null;
    wasmView = null;
    return true;
  } catch {
    exportsRef = null;
    return false;
  }
}

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
  wasmU8 = null;
  wasmView = null;
}

export interface WasmSoilEvalResult {
  tripFlags: number;
  crossVenueSlippage: number;
}

export function evaluateSoilViaWasm(quote: RetailSoilQuote): WasmSoilEvalResult | null {
  if (!ensureRetailGuardWasm() || !exportsRef) return null;
  SOIL_IN.hlSpot = quote.hlSpot;
  SOIL_IN.hlPerp = quote.hlPerp;
  SOIL_IN.dydxPerp = quote.dydxPerp;
  SOIL_IN.depthUsd = quote.depthUsd;
  SOIL_IN.maxSlippage = quote.maxSlippage ?? 0.005;
  SOIL_IN.minDepthUsd = quote.minDepthUsd ?? 100_000;
  encodeWasmSoilInput(SOIL_IN);
  const mem = bindViews();
  if (!mem) return null;
  copySoilFfiInto(mem.u8, 0);
  SOIL_SCRATCH.tripFlags = exportsRef.soil_core_eval(0, WASM_SOIL_OUT_OFFSET);
  SOIL_SCRATCH.crossVenueSlippage = mem.view.getFloat64(WASM_SOIL_OUT_OFFSET, true);
  return SOIL_SCRATCH;
}

export interface WasmIntentGateResult {
  ok: boolean;
  venueDrift: boolean;
  severChannel: boolean;
  attempts: number;
}

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

  const mem = bindViews();
  if (!mem) return null;
  const view = mem.view;
  for (let i = 0; i < INTENT_CORE_HEAP_WORDS; i++) {
    view.setBigInt64(WASM_INTENT_HEAP_BYTE_OFFSET + i * 8, INTENT_RING_SLAB[baseOffset + i]!, true);
  }

  const allowed = exportsRef.intent_core_evaluate_gate(
    WASM_INTENT_HEAP_BYTE_OFFSET,
    toBigIntU32(allowedMask),
    toBigIntU32(targetBit),
    toBigIntU32(maxAttempts),
  );

  for (let i = 0; i < INTENT_CORE_HEAP_WORDS; i++) {
    INTENT_RING_SLAB[baseOffset + i] = view.getBigInt64(WASM_INTENT_HEAP_BYTE_OFFSET + i * 8, true);
  }
  INTENT_RING_U32[baseOffset + INTENT_SLOT_ATTEMPTS] = Number(INTENT_RING_SLAB[baseOffset + INTENT_SLOT_ATTEMPTS]);
  INTENT_RING_U32[baseOffset + INTENT_SLOT_FLAGS] = Number(INTENT_RING_SLAB[baseOffset + INTENT_SLOT_FLAGS]);

  const flags = INTENT_RING_U32[baseOffset + INTENT_SLOT_FLAGS];
  INTENT_SCRATCH.ok = allowed === 1;
  INTENT_SCRATCH.venueDrift = (flags & 2) !== 0;
  INTENT_SCRATCH.severChannel = (flags & 1) !== 0;
  INTENT_SCRATCH.attempts = INTENT_RING_U32[baseOffset + INTENT_SLOT_ATTEMPTS];
  return INTENT_SCRATCH;
}

export const WASM_INTENT_WORDS_PER_SLOT = INTENT_CORE_HEAP_WORDS;
