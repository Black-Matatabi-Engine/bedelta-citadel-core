#!/usr/bin/env tsx
/**
 * Experimental benchmark — TS split evals vs batch sim vs single-FFI Wasm kernel.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  runProtocolBatchSim,
  type ProtocolBatchInput,
} from "../src/services/wasm-feasibility-lib/protocol-flags-kernel";
import {
  evaluateProtocolBatch,
  initProtocolFlagsWasm,
} from "../src/sdk/protocol-flags-wasm";

const WASM_PATH = resolve(import.meta.dirname, "../pkg/soil_core.wasm");
const ITERS = 500;

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

function p50(samples: number[]): number {
  const s = [...samples].sort((a, b) => a - b);
  return s[Math.floor(s.length * 0.5)]!;
}

/** Legacy-style three evaluate*Flags calls (TS risk-engine-core path). */
async function benchTsLegacySplit(): Promise<number> {
  const { evaluateGmxFlags, evaluatePendleFlags, evaluateVariationalFlags, packProtocolLane, PROTO_VECT_LEN } =
    await import("../src/core/risk-engine-core");
  const vec = new Float64Array(PROTO_VECT_LEN);
  const t0 = performance.now();
  for (let i = 0; i < ITERS; i += 1) {
    evaluateGmxFlags(
      packProtocolLane(0, BASE.gmxOiLongUsd, BASE.gmxOiShortUsd, BASE.gmxPoolTvlUsd, BASE.gmxCollateralRatio, vec),
    );
    evaluatePendleFlags(BASE.pendleYieldCurrent, BASE.pendleYieldOracle);
    evaluateVariationalFlags({
      quotePriceUsd: BASE.variationalQuotePriceUsd,
      oracleMarkUsd: BASE.variationalOracleMarkUsd,
      quoteTimestampMs: BASE.variationalQuoteTimestampMs,
      nowMs: BASE.variationalNowMs,
      tradeSizeUsd: BASE.variationalTradeSizeUsd,
      olpDepthUsd: BASE.variationalOlpDepthUsd,
    });
  }
  return ((performance.now() - t0) * 1000) / ITERS;
}

function benchTsBatchSim(): number {
  runProtocolBatchSim(BASE);
  const t0 = performance.now();
  for (let i = 0; i < ITERS; i += 1) runProtocolBatchSim(BASE);
  return ((performance.now() - t0) * 1000) / ITERS;
}

function benchWasmBatch(): number {
  evaluateProtocolBatch(BASE);
  const samples: number[] = [];
  for (let i = 0; i < ITERS; i += 1) {
    samples.push(evaluateProtocolBatch(BASE).elapsedUs);
  }
  return p50(samples);
}

const wasmOk = initProtocolFlagsWasm(readFileSync(WASM_PATH));
const tsLegacySplitUs = await benchTsLegacySplit();
const tsBatchUs = benchTsBatchSim();
const wasmBatchUs = wasmOk ? benchWasmBatch() : -1;

console.log(
  JSON.stringify(
    {
      branch: "feat/wasm-opsec-kernel-experiment",
      iterations: ITERS,
      tsLegacySplitEvaluateUsP50: Number(tsLegacySplitUs.toFixed(3)),
      tsBatchSimUsP50: Number(tsBatchUs.toFixed(3)),
      wasmSingleFfiUsP50: wasmOk ? Number(wasmBatchUs.toFixed(3)) : null,
      ffiBudgetUs: 14,
      wasmLoaded: wasmOk,
    },
    null,
    2,
  ),
);
