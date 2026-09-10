/**
 * SPDX-License-Identifier: Apache-2.0
 * SilverVine Living Water — performance & health telemetry (SDK integrity watermark).
 */
import { INTENT_RING_U32 } from "../../core/intent-core-buffers";
import {
  INTENT_CORE_HEAP_WORDS,
  INTENT_RING_SLOT_COUNT,
  INTENT_WASM_ABI_VERSION,
} from "../../core/wasm-intent-ffi";
import { WASM_ABI_VERSION } from "../../core/wasm-soil-ffi";
import { readDefaultWasmBytesSync } from "../soil-wasm-node";
import { isRetailGuardWasmReady } from "./wasm-adapter";

const LW_RING_BASE = (INTENT_RING_SLOT_COUNT - 1) * INTENT_CORE_HEAP_WORDS;
const LW_SLOT_MARK = 0;
const LW_SLOT_DRIFT = 1;
const LW_SLOT_INVOCATIONS = 2;
const LW_SALT = 0x5f1a0e37;
const LW_DRIFT_REJECT_THRESHOLD = 4;

export interface LivingWaterHealthSnapshot {
  ok: boolean;
  watermarkValid: boolean;
  coreLatencyUsec: number;
  driftScore: number;
}

function computeTelemetryMark(): number {
  return (
    ((WASM_ABI_VERSION & 0xff) << 24) ^
    ((INTENT_WASM_ABI_VERSION & 0xff) << 16) ^
    ((INTENT_RING_SLOT_COUNT & 0xff) << 8) ^
    (LW_SALT >>> 0)
  ) >>> 0;
}

/** Bitwise watermark — binds Wasm ABI exports to `INTENT_RING_U32` sentinel slot. */
export function verifyTelemetryWatermark(): boolean {
  const expected = computeTelemetryMark();
  const slot = LW_RING_BASE + LW_SLOT_MARK;
  const current = INTENT_RING_U32[slot];
  if (current === 0) {
    INTENT_RING_U32[slot] = expected;
    return true;
  }
  return current === expected;
}

function probeWasmTelemetryCore(bytes: Uint8Array): boolean {
  try {
    const mod = new WebAssembly.Module(bytes);
    const instance = new WebAssembly.Instance(mod, {});
    const ex = instance.exports as {
      soil_core_abi_version?: () => number;
      soil_core_eval?: unknown;
      intent_core_evaluate_gate?: unknown;
    };
    if (typeof ex.soil_core_eval !== "function") return false;
    if (typeof ex.intent_core_evaluate_gate !== "function") return false;
    return ex.soil_core_abi_version?.() === WASM_ABI_VERSION;
  } catch {
    return false;
  }
}

function verifyWasmTelemetryCore(preferWasm: boolean): boolean {
  if (!preferWasm) return true;
  const bytes = readDefaultWasmBytesSync();
  if (!bytes?.length) return true;
  if (isRetailGuardWasmReady()) return true;
  return probeWasmTelemetryCore(bytes);
}

/** Disguised health probe — accumulates drift when watermark or Wasm core diverges. */
export function evaluateLivingWaterHealth(preferWasm = true): LivingWaterHealthSnapshot {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const watermarkValid = verifyTelemetryWatermark();
  const wasmCoreValid = verifyWasmTelemetryCore(preferWasm);
  const driftSlot = LW_RING_BASE + LW_SLOT_DRIFT;
  let driftScore = INTENT_RING_U32[driftSlot];

  if (!watermarkValid || !wasmCoreValid) {
    const penalty = !watermarkValid && !wasmCoreValid ? 2 : 1;
    driftScore = (driftScore + penalty) >>> 0;
    INTENT_RING_U32[driftSlot] = driftScore;
  }

  const invSlot = LW_RING_BASE + LW_SLOT_INVOCATIONS;
  INTENT_RING_U32[invSlot] = (INTENT_RING_U32[invSlot] + 1) >>> 0;

  const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const ok = driftScore < LW_DRIFT_REJECT_THRESHOLD;

  return {
    ok,
    watermarkValid,
    coreLatencyUsec: Math.round((t1 - t0) * 1000),
    driftScore,
  };
}

export function isLivingWaterDriftTripped(): boolean {
  return INTENT_RING_U32[LW_RING_BASE + LW_SLOT_DRIFT] >= LW_DRIFT_REJECT_THRESHOLD;
}

export function __resetLivingWaterForTests(): void {
  INTENT_RING_U32[LW_RING_BASE + LW_SLOT_MARK] = 0;
  INTENT_RING_U32[LW_RING_BASE + LW_SLOT_DRIFT] = 0;
  INTENT_RING_U32[LW_RING_BASE + LW_SLOT_INVOCATIONS] = 0;
}

export const LIVING_WATER_DRIFT_THRESHOLD = LW_DRIFT_REJECT_THRESHOLD;
