/**
 * Protocol bitmask batch kernel — TS sim + flat f64 layout (parity with `protocol_flags.rs`).
 * SPDX-License-Identifier: BUSL-1.1
 */

import {
  FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED,
  FLAG_VARIATIONAL_STALE_QUOTE,
  FLAGS_AUTO_SEVER_MASK,
  FLAGS_CLEAR,
  FLAGS_COLLATERAL_TRIP,
  FLAGS_IMBALANCE_TRIP,
  FLAGS_SEVERED,
  FLAGS_YIELD_SHOCK,
} from "../../core/risk-flags";
import {
  GMX_COLLATERAL_MIN,
  GMX_IMBALANCE_MAX,
  PENDLE_YIELD_SHOCK_MAX_BPS,
  VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION,
  VARIATIONAL_PRICE_DEVIATION_MAX_BPS,
  VARIATIONAL_QUOTE_MAX_AGE_MS,
} from "../../core/risk-engine-limits";

export const PROTOCOL_BATCH_INPUT_FLOATS = 13;
export const PROTOCOL_BATCH_OUTPUT_FLOATS = 4;
export const PROTOCOL_BATCH_INPUT_BYTES = PROTOCOL_BATCH_INPUT_FLOATS * 8;
export const PROTOCOL_BATCH_OUTPUT_BYTES = PROTOCOL_BATCH_OUTPUT_FLOATS * 8;
export const PROTOCOL_KERNEL_ABI_VERSION = 1;

export interface ProtocolBatchInput {
  gmxOiLongUsd: number;
  gmxOiShortUsd: number;
  gmxPoolTvlUsd: number;
  gmxCollateralRatio: number;
  pendleYieldCurrent: number;
  pendleYieldOracle: number;
  variationalQuotePriceUsd: number;
  variationalOracleMarkUsd: number;
  variationalQuoteTimestampMs: number;
  variationalNowMs: number;
  variationalTradeSizeUsd: number;
  variationalOlpDepthUsd: number;
  variationalLongTail: boolean;
}

export interface ProtocolBatchOutput {
  combinedFlags: number;
  gmxFlags: number;
  pendleFlags: number;
  variationalFlags: number;
}

const INPUT_ORDER: (keyof ProtocolBatchInput)[] = [
  "gmxOiLongUsd",
  "gmxOiShortUsd",
  "gmxPoolTvlUsd",
  "gmxCollateralRatio",
  "pendleYieldCurrent",
  "pendleYieldOracle",
  "variationalQuotePriceUsd",
  "variationalOracleMarkUsd",
  "variationalQuoteTimestampMs",
  "variationalNowMs",
  "variationalTradeSizeUsd",
  "variationalOlpDepthUsd",
  "variationalLongTail",
];

function evalGmxRaw(input: ProtocolBatchInput): number {
  let f = FLAGS_CLEAR;
  const tvl = input.gmxPoolTvlUsd;
  if (tvl > 0 && Math.abs(input.gmxOiLongUsd - input.gmxOiShortUsd) / tvl > GMX_IMBALANCE_MAX) {
    f |= FLAGS_IMBALANCE_TRIP;
  }
  const coll = input.gmxCollateralRatio;
  if (coll !== 0 && (!Number.isFinite(coll) || coll < GMX_COLLATERAL_MIN)) f |= FLAGS_COLLATERAL_TRIP;
  return f;
}

function evalPendleRaw(input: ProtocolBatchInput): number {
  return Math.abs(input.pendleYieldCurrent - input.pendleYieldOracle) * 10_000 > PENDLE_YIELD_SHOCK_MAX_BPS
    ? FLAGS_YIELD_SHOCK
    : FLAGS_CLEAR;
}

function evalVariationalRaw(input: ProtocolBatchInput): number {
  let f = FLAGS_CLEAR;
  const ageMs = input.variationalNowMs - input.variationalQuoteTimestampMs;
  if (ageMs > VARIATIONAL_QUOTE_MAX_AGE_MS) f |= FLAG_VARIATIONAL_STALE_QUOTE;
  else if (input.variationalOracleMarkUsd > 0) {
    const devBps =
      (Math.abs(input.variationalQuotePriceUsd - input.variationalOracleMarkUsd) /
        input.variationalOracleMarkUsd) *
      10_000;
    if (devBps > VARIATIONAL_PRICE_DEVIATION_MAX_BPS) f |= FLAG_VARIATIONAL_STALE_QUOTE;
  }
  const depth = input.variationalOlpDepthUsd;
  if (
    input.variationalLongTail &&
    depth > 0 &&
    input.variationalTradeSizeUsd / depth > VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION
  ) {
    f |= FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED;
  }
  return f;
}

export function applyProtocolAutoSeverMask(flags: number): number {
  if (flags !== FLAGS_CLEAR && (flags & FLAGS_AUTO_SEVER_MASK) !== FLAGS_CLEAR) {
    return flags | FLAGS_SEVERED;
  }
  return flags;
}

/** Pure TS batch — mirrors Rust `protocol_batch_eval` (no pending GMX skew window). */
export function runProtocolBatchSim(input: ProtocolBatchInput): ProtocolBatchOutput {
  const gmxFlags = evalGmxRaw(input);
  const pendleFlags = evalPendleRaw(input);
  const variationalFlags = evalVariationalRaw(input);
  const combinedFlags = applyProtocolAutoSeverMask(gmxFlags | pendleFlags | variationalFlags);
  return { combinedFlags, gmxFlags, pendleFlags, variationalFlags };
}

export function encodeProtocolBatchInput(input: ProtocolBatchInput): Float64Array {
  const buf = new Float64Array(PROTOCOL_BATCH_INPUT_FLOATS);
  for (let i = 0; i < INPUT_ORDER.length; i += 1) {
    const key = INPUT_ORDER[i]!;
    const v = input[key];
    buf[i] = typeof v === "boolean" ? (v ? 1 : 0) : v;
  }
  return buf;
}

export function decodeProtocolBatchOutput(view: DataView, offset = 0): ProtocolBatchOutput {
  return {
    combinedFlags: Math.trunc(view.getFloat64(offset, true)),
    gmxFlags: Math.trunc(view.getFloat64(offset + 8, true)),
    pendleFlags: Math.trunc(view.getFloat64(offset + 16, true)),
    variationalFlags: Math.trunc(view.getFloat64(offset + 24, true)),
  };
}
