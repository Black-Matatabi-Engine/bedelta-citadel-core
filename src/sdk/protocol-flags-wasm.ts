/**
 * Single-FFI protocol bitmask batch evaluator (experimental WASM opsec kernel).
 * SPDX-License-Identifier: BUSL-1.1
 */

import {
  decodeProtocolBatchOutput,
  encodeProtocolBatchInput,
  PROTOCOL_BATCH_INPUT_BYTES,
  PROTOCOL_KERNEL_ABI_VERSION,
  runProtocolBatchSim,
  type ProtocolBatchInput,
  type ProtocolBatchOutput,
} from "../services/wasm-feasibility-lib/protocol-flags-kernel";
import { readDefaultWasmBytesSync } from "./soil-wasm-node";

export const PROTOCOL_FFI_BUDGET_US = 14;

const PROTOCOL_SCRATCH_IN = 128;
const PROTOCOL_SCRATCH_OUT = PROTOCOL_SCRATCH_IN + PROTOCOL_BATCH_INPUT_BYTES;
const INPUT_FLOATS = PROTOCOL_BATCH_INPUT_BYTES / 8;

type ProtocolWasmExports = {
  memory: WebAssembly.Memory;
  protocol_batch_eval: (inPtr: number, outPtr: number) => number;
  protocol_kernel_abi_version: () => number;
};

let exportsRef: ProtocolWasmExports | null = null;

function bindProtocolExports(bytes: Uint8Array): boolean {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const mod = new WebAssembly.Module(copy);
  const instance = new WebAssembly.Instance(mod, {});
  const ex = instance.exports as unknown as ProtocolWasmExports;
  if (typeof ex.protocol_batch_eval !== "function") return false;
  if (ex.protocol_kernel_abi_version() !== PROTOCOL_KERNEL_ABI_VERSION) return false;
  exportsRef = ex;
  return true;
}

export function initProtocolFlagsWasm(source?: ArrayBuffer | Uint8Array): boolean {
  try {
    const bytes = source
      ? source instanceof ArrayBuffer
        ? new Uint8Array(source)
        : new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
      : readDefaultWasmBytesSync();
    if (!bytes) return false;
    return bindProtocolExports(bytes);
  } catch {
    exportsRef = null;
    return false;
  }
}

export function isProtocolFlagsWasmReady(): boolean {
  return exportsRef != null;
}

export function __resetProtocolFlagsWasmForTests(): void {
  exportsRef = null;
}

function runViaWasm(input: ProtocolBatchInput): ProtocolBatchOutput {
  const ex = exportsRef!;
  const view = new DataView(ex.memory.buffer);
  const encoded = encodeProtocolBatchInput(input);
  for (let i = 0; i < INPUT_FLOATS; i += 1) {
    view.setFloat64(PROTOCOL_SCRATCH_IN + i * 8, encoded[i]!, true);
  }
  ex.protocol_batch_eval(PROTOCOL_SCRATCH_IN, PROTOCOL_SCRATCH_OUT);
  return decodeProtocolBatchOutput(view, PROTOCOL_SCRATCH_OUT);
}

/** One FFI call per intent — Wasm when loaded, else TS sim fallback. */
export function evaluateProtocolBatch(input: ProtocolBatchInput): {
  output: ProtocolBatchOutput;
  wasmUsed: boolean;
  elapsedUs: number;
  ffiCalls: number;
} {
  const t0 = performance.now();
  const wasmUsed = exportsRef != null;
  const output = wasmUsed ? runViaWasm(input) : runProtocolBatchSim(input);
  return {
    output,
    wasmUsed,
    elapsedUs: (performance.now() - t0) * 1000,
    ffiCalls: wasmUsed ? 1 : 0,
  };
}
