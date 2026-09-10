/** Wasm soil FFI layout SSOT — mirrors `src/wasm/soil_core.rs` · `PROTO_VECT_LEN` lanes. */
import { PROTO_VECT_LEN } from "./risk-engine-core";

export const WASM_PROTOCOL_LEN = PROTO_VECT_LEN;
export const WASM_SOIL_OFFSET = WASM_PROTOCOL_LEN;
export const WASM_SOIL_INPUT_FLOATS = WASM_PROTOCOL_LEN + 8;
export const WASM_SOIL_INPUT_BYTES = WASM_SOIL_INPUT_FLOATS * 8;
export const WASM_SOIL_OUTPUT_BYTES = 64;
export const WASM_SOIL_MEMORY_BUDGET_BYTES = 28 * 1024;
export const WASM_ABI_VERSION = 2 as const;

export interface WasmSoilCoreInput {
  hlSpot: number;
  hlPerp: number;
  dydxPerp: number;
  depthUsd: number;
  orderSizeUsd: number;
  accountBalanceUsd: number;
  maxSlippage: number;
  minDepthUsd: number;
  protocolMask?: number;
}

/** Module-load reusable scratch — zero per-invoke `ArrayBuffer` allocation on hot FFI path. */
export const SOIL_FFI_REUSABLE_BUFFER = new ArrayBuffer(WASM_SOIL_INPUT_BYTES);
const SOIL_FFI_REUSABLE_VIEW = new DataView(SOIL_FFI_REUSABLE_BUFFER);

const SOIL_FIELD_ORDER: (keyof WasmSoilCoreInput)[] = [
  "hlSpot",
  "hlPerp",
  "dydxPerp",
  "depthUsd",
  "orderSizeUsd",
  "accountBalanceUsd",
  "maxSlippage",
  "minDepthUsd",
];

export function wasmSoilInputByteOffset(field: keyof WasmSoilCoreInput): number {
  if (field === "protocolMask") return (WASM_PROTOCOL_LEN - 1) * 8;
  let offset = WASM_SOIL_OFFSET * 8;
  for (const key of SOIL_FIELD_ORDER) {
    if (key === field) return offset;
    offset += 8;
  }
  return offset;
}

/** Read all `PROTO_VECT_LEN` protocol lanes from a Wasm linear-memory view. */
export function readProtocolVectorFromView(
  view: DataView,
  byteOffset = 0,
): Float64Array {
  const vec = new Float64Array(WASM_PROTOCOL_LEN);
  for (let i = 0; i < WASM_PROTOCOL_LEN; i++) {
    vec[i] = view.getFloat64(byteOffset + i * 8, true);
  }
  return vec;
}

/** Write soil input into `SOIL_FFI_REUSABLE_BUFFER` (in-place · zero alloc). */
export function encodeWasmSoilInput(input: WasmSoilCoreInput): ArrayBuffer {
  const view = SOIL_FFI_REUSABLE_VIEW;
  for (let i = 0; i < WASM_SOIL_INPUT_BYTES; i += 8) {
    view.setFloat64(i, 0, true);
  }
  if (input.protocolMask) {
    view.setFloat64(wasmSoilInputByteOffset("protocolMask"), input.protocolMask, true);
  }
  for (const key of SOIL_FIELD_ORDER) {
    view.setFloat64(wasmSoilInputByteOffset(key), input[key] as number, true);
  }
  return SOIL_FFI_REUSABLE_BUFFER;
}

export function getSoilFfiReusableDataView(): DataView {
  return SOIL_FFI_REUSABLE_VIEW;
}

export function decodeWasmSoilInput(buf: ArrayBuffer = SOIL_FFI_REUSABLE_BUFFER): WasmSoilCoreInput {
  const view = new DataView(buf);
  const protocolMask = view.getFloat64(wasmSoilInputByteOffset("protocolMask"), true);
  return {
    hlSpot: view.getFloat64(wasmSoilInputByteOffset("hlSpot"), true),
    hlPerp: view.getFloat64(wasmSoilInputByteOffset("hlPerp"), true),
    dydxPerp: view.getFloat64(wasmSoilInputByteOffset("dydxPerp"), true),
    depthUsd: view.getFloat64(wasmSoilInputByteOffset("depthUsd"), true),
    orderSizeUsd: view.getFloat64(wasmSoilInputByteOffset("orderSizeUsd"), true),
    accountBalanceUsd: view.getFloat64(wasmSoilInputByteOffset("accountBalanceUsd"), true),
    maxSlippage: view.getFloat64(wasmSoilInputByteOffset("maxSlippage"), true),
    minDepthUsd: view.getFloat64(wasmSoilInputByteOffset("minDepthUsd"), true),
    protocolMask: protocolMask !== 0 ? protocolMask : undefined,
  };
}
