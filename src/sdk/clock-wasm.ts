/**
 * SPDX-License-Identifier: BUSL-1.1 (SliverVine Protocol Proprietary)
 * M4 Wasm clock_core loader — proprietary arithmetic obfuscated in Rust/Wasm.
 */
import {
  CLOCK_WASM_ABI_VERSION,
  CLOCK_WASM_HEAP_BYTES,
  CLOCK_WASM_RESOLVE_LEAP,
} from "../core/wasm-clock-ffi";
import { readDefaultWasmBytesSync } from "./soil-wasm-node";

const DEFAULT_WASM_URL = new URL("../../pkg/soil_core.wasm", import.meta.url);

type ClockWasmExports = {
  memory: WebAssembly.Memory;
  clock_core_abi_version: () => number;
  clock_core_read: (
    statePtr: number,
    stickyPtr: number,
    wallMs: bigint,
    maxForwardMs: bigint,
    outVirtualPtr: number,
  ) => number;
  clock_core_saturating_sub: (a: bigint, b: bigint) => bigint;
  clock_core_resolve_wall_age: (nowMs: bigint, tsMs: bigint, outDeltaPtr: number) => number;
  clock_core_rpc_ingest: (
    statePtr: number,
    blockNumber: bigint,
    timestampSec: bigint,
    outRegressionPtr: number,
  ) => bigint;
  clock_core_pack_state: (
    statePtr: number,
    sticky: number,
    wallMs: bigint,
    maxForwardMs: bigint,
    outPtr: number,
  ) => void;
};

let exportsRef: ClockWasmExports | null = null;
let wasmInitPromise: Promise<boolean> | null = null;

function isNodeRuntime(): boolean {
  return typeof process !== "undefined" && Boolean(process.versions?.node);
}

function toUint8Array(source: ArrayBuffer | Uint8Array): Uint8Array {
  return source instanceof ArrayBuffer
    ? new Uint8Array(source)
    : new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
}

function bindInstance(bytes: Uint8Array): boolean {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const mod = new WebAssembly.Module(copy);
  const instance = new WebAssembly.Instance(mod, {});
  const ex = instance.exports as unknown as ClockWasmExports;
  if (typeof ex.clock_core_abi_version !== "function") return false;
  if (ex.clock_core_abi_version() !== CLOCK_WASM_ABI_VERSION) return false;
  exportsRef = ex;
  return true;
}

export function initClockWasm(source?: ArrayBuffer | Uint8Array): boolean {
  try {
    const bytes = source ? toUint8Array(source) : readDefaultWasmBytesSync();
    if (!bytes) return false;
    return bindInstance(bytes);
  } catch {
    exportsRef = null;
    return false;
  }
}

export async function initClockWasmAsync(source?: ArrayBuffer | Uint8Array): Promise<boolean> {
  if (source) return initClockWasm(source);
  if (exportsRef) return true;
  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      if (isNodeRuntime()) return initClockWasm();
      try {
        const res = await fetch(DEFAULT_WASM_URL);
        if (!res.ok) return false;
        return initClockWasm(await res.arrayBuffer());
      } catch {
        return false;
      }
    })();
  }
  return wasmInitPromise;
}

export function isClockWasmReady(): boolean {
  return exportsRef != null;
}

export function ensureClockWasm(): boolean {
  if (exportsRef) return true;
  return initClockWasm();
}

export function __resetClockWasmForTests(): void {
  exportsRef = null;
  wasmInitPromise = null;
}

/** Allocate clock heap slice in Wasm linear memory (zero host heap for state). */
export function allocClockWasmHeap(): {
  basePtr: number;
  monotonicState: BigInt64Array;
  stickyView: Int32Array;
  rpcState: BigInt64Array;
} {
  const ex = exportsRef!;
  const basePtr = 1024;
  const stickyPtr = basePtr + 16;
  const rpcPtr = basePtr + 24;
  const buf = ex.memory.buffer;
  return {
    basePtr,
    monotonicState: new BigInt64Array(buf, basePtr, 2),
    stickyView: new Int32Array(buf, stickyPtr, 1),
    rpcState: new BigInt64Array(buf, rpcPtr, 2),
  };
}

export function clockWasmRead(
  monotonicState: BigInt64Array,
  stickyView: Int32Array,
  currentWallMs: number,
  maxForwardStepMs: number,
): { virtualWallMs: number; anomalyCode: number } {
  const ex = exportsRef!;
  const outPtr = 2048;
  const outView = new BigInt64Array(ex.memory.buffer, outPtr, 1);
  const code = ex.clock_core_read(
    monotonicState.byteOffset,
    stickyView.byteOffset,
    BigInt(Math.trunc(currentWallMs)),
    BigInt(maxForwardStepMs),
    outPtr,
  );
  const sticky = stickyView[0];
  return { virtualWallMs: Number(outView[0]), anomalyCode: sticky !== 0 ? sticky : code };
}

export function clockWasmSaturatingSub(a: number, b: number): number {
  return Number(exportsRef!.clock_core_saturating_sub(BigInt(Math.trunc(a)), BigInt(Math.trunc(b))));
}

export function clockWasmResolveWallAge(
  nowMs: number,
  timestampMs: number,
): { kind: "OK"; ageMs: number } | { kind: "LEAP"; deltaMs: number } {
  const ex = exportsRef!;
  const deltaPtr = 2056;
  const deltaView = new BigInt64Array(ex.memory.buffer, deltaPtr, 1);
  const code = ex.clock_core_resolve_wall_age(
    BigInt(Math.trunc(nowMs)),
    BigInt(Math.trunc(timestampMs)),
    deltaPtr,
  );
  const delta = Number(deltaView[0]);
  if (code === CLOCK_WASM_RESOLVE_LEAP) return { kind: "LEAP", deltaMs: delta };
  return { kind: "OK", ageMs: delta };
}

export function clockWasmRpcIngest(
  rpcState: BigInt64Array,
  blockNumber: bigint,
  timestampSec: bigint,
): { ok: boolean; regression: boolean; heldTimestampSec: bigint } {
  const ex = exportsRef!;
  const regPtr = 2064;
  const regView = new Int32Array(ex.memory.buffer, regPtr, 1);
  const held = ex.clock_core_rpc_ingest(
    rpcState.byteOffset,
    blockNumber,
    timestampSec,
    regPtr,
  );
  return {
    ok: regView[0] === 0,
    regression: regView[0] === 1,
    heldTimestampSec: held,
  };
}

export function clockWasmPackState(
  monotonicState: BigInt64Array,
  sticky: number,
  wallMs: number,
  maxForwardStepMs: number,
): Float64Array {
  const ex = exportsRef!;
  const outPtr = 2080;
  const out = new Float64Array(ex.memory.buffer, outPtr, 3);
  ex.clock_core_pack_state(
    monotonicState.byteOffset,
    sticky,
    BigInt(Math.trunc(wallMs)),
    BigInt(maxForwardStepMs),
    outPtr,
  );
  return out;
}

export { CLOCK_WASM_ABI_VERSION, CLOCK_WASM_HEAP_BYTES };
