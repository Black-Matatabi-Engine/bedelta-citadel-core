import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  evaluateGmxFlags,
  evaluatePendleFlags,
  evaluateVariationalFlags,
  FLAGS_IMBALANCE_TRIP,
  FLAGS_SEVERED,
  FLAGS_YIELD_SHOCK,
  FLAG_VARIATIONAL_STALE_QUOTE,
  packProtocolLane,
  PROTO_VECT_LEN,
} from "../../src/core/risk-engine-core";
import {
  runProtocolBatchSim,
  type ProtocolBatchInput,
} from "../../src/services/wasm-feasibility-lib/protocol-flags-kernel";
import {
  __resetProtocolFlagsWasmForTests,
  evaluateProtocolBatch,
  initProtocolFlagsWasm,
  PROTOCOL_FFI_BUDGET_US,
} from "../../src/sdk/protocol-flags-wasm";

const WASM_PATH = resolve(import.meta.dirname, "../../pkg/soil_core.wasm");
const GMX_VEC = new Float64Array(PROTO_VECT_LEN);

const BASE: ProtocolBatchInput = {
  gmxOiLongUsd: 3_000_000,
  gmxOiShortUsd: 2_500_000,
  gmxPoolTvlUsd: 5_500_000,
  gmxCollateralRatio: 1.12,
  pendleYieldCurrent: 0.062,
  pendleYieldOracle: 0.064,
  variationalQuotePriceUsd: 3500,
  variationalOracleMarkUsd: 3500,
  variationalQuoteTimestampMs: 1_700_000_000_000,
  variationalNowMs: 1_700_000_000_200,
  variationalTradeSizeUsd: 5_000,
  variationalOlpDepthUsd: 100_000,
  variationalLongTail: true,
};

afterEach(() => {
  __resetProtocolFlagsWasmForTests();
});

describe("protocol flags wasm kernel", () => {
  it("loads pkg/soil_core.wasm and exposes protocol_batch_eval", () => {
    const wasm = readFileSync(WASM_PATH);
    expect(initProtocolFlagsWasm(wasm)).toBe(true);
    const r = evaluateProtocolBatch(BASE);
    expect(r.wasmUsed).toBe(true);
    expect(r.ffiCalls).toBe(1);
    expect(r.output.combinedFlags).toBe(0);
  });

  it("wasm batch matches TS sim on clean vector", () => {
    initProtocolFlagsWasm(readFileSync(WASM_PATH));
    const sim = runProtocolBatchSim(BASE);
    const wasm = evaluateProtocolBatch(BASE);
    expect(wasm.output).toEqual(sim);
  });

  it("wasm GMX imbalance matches evaluateGmxFlags (no skew opts)", () => {
    initProtocolFlagsWasm(readFileSync(WASM_PATH));
    const trip: ProtocolBatchInput = {
      ...BASE,
      gmxOiLongUsd: 4_500_000,
      gmxOiShortUsd: 500_000,
    };
    const coreFlags = evaluateGmxFlags(
      packProtocolLane(0, trip.gmxOiLongUsd, trip.gmxOiShortUsd, trip.gmxPoolTvlUsd, 0, GMX_VEC),
    );
    const batch = evaluateProtocolBatch(trip);
    expect(batch.output.gmxFlags & FLAGS_IMBALANCE_TRIP).not.toBe(0);
    expect(batch.output.combinedFlags & FLAGS_SEVERED).not.toBe(0);
    expect(coreFlags & FLAGS_IMBALANCE_TRIP).not.toBe(0);
  });

  it("wasm Pendle shock matches evaluatePendleFlags", () => {
    initProtocolFlagsWasm(readFileSync(WASM_PATH));
    const trip = { ...BASE, pendleYieldCurrent: 0.095, pendleYieldOracle: 0.062 };
    const core = evaluatePendleFlags(trip.pendleYieldCurrent, trip.pendleYieldOracle);
    const batch = evaluateProtocolBatch(trip);
    expect(batch.output.pendleFlags & FLAGS_YIELD_SHOCK).not.toBe(0);
    expect(core & FLAGS_YIELD_SHOCK).not.toBe(0);
  });

  it("wasm Variational stale quote matches evaluateVariationalFlags", () => {
    initProtocolFlagsWasm(readFileSync(WASM_PATH));
    const trip = { ...BASE, variationalNowMs: BASE.variationalQuoteTimestampMs + 800 };
    const core = evaluateVariationalFlags({
      quotePriceUsd: trip.variationalQuotePriceUsd,
      oracleMarkUsd: trip.variationalOracleMarkUsd,
      quoteTimestampMs: trip.variationalQuoteTimestampMs,
      nowMs: trip.variationalNowMs,
      tradeSizeUsd: trip.variationalTradeSizeUsd,
      olpDepthUsd: trip.variationalOlpDepthUsd,
    });
    const batch = evaluateProtocolBatch(trip);
    expect(batch.output.variationalFlags & FLAG_VARIATIONAL_STALE_QUOTE).not.toBe(0);
    expect(core & FLAG_VARIATIONAL_STALE_QUOTE).not.toBe(0);
  });

  it("single-FFI warm path stays under FFI budget", () => {
    initProtocolFlagsWasm(readFileSync(WASM_PATH));
    evaluateProtocolBatch(BASE);
    const samples: number[] = [];
    for (let i = 0; i < 200; i += 1) {
      samples.push(evaluateProtocolBatch(BASE).elapsedUs);
    }
    samples.sort((a, b) => a - b);
    const p50 = samples[Math.floor(samples.length * 0.5)]!;
    expect(p50).toBeLessThan(PROTOCOL_FFI_BUDGET_US);
  });
});
