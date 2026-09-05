/** Lean Santenmoku risk engine — f64 protocol lanes + bitmask invariants. */
import { HardlockError, RiskLimitExceeded, vineWrapProtection } from "./risk";
import type { CitadelRiskGateVerdict, GatewayRulesInput, GatewayRulesResult } from "./risk-engine-lib/risk-engine-types";
import {
  FLAG_AAVE_HEALTH_FACTOR_LOW,
  FLAG_MORPHO_ORACLE_STALE,
  FLAG_UNISWAP_SLIPPAGE_EXCEEDED,
  FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED,
  FLAG_VARIATIONAL_STALE_QUOTE,
  FLAGS_CLEAR,
  FLAGS_COLLATERAL_TRIP,
  FLAGS_DEPEG_TRIP,
  FLAGS_HL_RATE,
  FLAGS_HL_SESSION,
  FLAGS_HL_SIZE,
  FLAGS_HL_SPREAD,
  FLAGS_IMBALANCE_TRIP,
  FLAGS_YIELD_SHOCK,
} from "./risk-flags";
import {
  AAVE_HF_MIN,
  GMX_COLLATERAL_MIN,
  GMX_IMBALANCE_MAX,
  HL_RATE_LIMIT_RPM,
  HL_SPREAD_MAX_BPS,
  MORPHO_ORACLE_MAX_AGE_MS,
  MORPHO_PRICE_DEVIATION_MAX_BPS,
  PENDLE_YIELD_SHOCK_MAX_BPS,
  STABILIZER_DEPEG_MAX_BPS,
  UNISWAP_SLIPPAGE_MAX_BPS,
  VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION,
  VARIATIONAL_PRICE_DEVIATION_MAX_BPS,
  VARIATIONAL_QUOTE_MAX_AGE_MS,
} from "./risk-engine-limits";
import { applyAutoSeveranceOnFlags } from "./risk-severance";
import { isPendingGmxSkewTripped, recordPendingGmxSkew } from "./pending-exposure-window";
import { checkSoilResistance, isGatewayNominalFastPath } from "./risk-engine-soil";

export { evaluateGlobalRiskPolicy } from "./risk-engine-policy";
export { checkSoilResistance, isGatewayNominalFastPath } from "./risk-engine-soil";

export {
  FLAGS_CLEAR,
  FLAGS_SEVERED,
  FLAGS_IMBALANCE_TRIP,
  FLAGS_COLLATERAL_TRIP,
  FLAGS_YIELD_SHOCK,
  FLAG_UNISWAP_SLIPPAGE_EXCEEDED,
  FLAG_AAVE_HEALTH_FACTOR_LOW,
  FLAG_MORPHO_ORACLE_STALE,
  FLAGS_HL_SESSION,
  FLAGS_HL_SIZE,
  FLAGS_HL_SPREAD,
  FLAGS_HL_RATE,
  FLAGS_DEPEG_TRIP,
  FLAG_VARIATIONAL_STALE_QUOTE,
  FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED,
} from "./risk-flags";

export const PROTO_VECT_LEN = 24;
export const PROTO_SLOT = 4;
export const PROTO_GMX = 0;
export const PROTO_PENDLE = 4;
export const PROTO_UNISWAP = 8;
export const PROTO_AAVE = 12;
export const PROTO_MORPHO = 16;
export const PROTO_HL = 20;

export {
  GMX_IMBALANCE_MAX,
  GMX_COLLATERAL_MIN,
  PENDLE_YIELD_SHOCK_MAX_BPS,
  UNISWAP_SLIPPAGE_MAX_BPS,
  AAVE_HF_MIN,
  MORPHO_ORACLE_MAX_AGE_MS,
  MORPHO_PRICE_DEVIATION_MAX_BPS,
  HL_SPREAD_MAX_BPS,
  HL_RATE_LIMIT_RPM,
  VARIATIONAL_QUOTE_MAX_AGE_MS,
  VARIATIONAL_PRICE_DEVIATION_MAX_BPS,
  VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION,
} from "./risk-engine-limits";

export interface VariationalFlagInput {
  quotePriceUsd: number;
  oracleMarkUsd: number;
  quoteTimestampMs: number;
  nowMs: number;
  tradeSizeUsd: number;
  olpDepthUsd: number;
  longTailAsset?: boolean;
}

const GATEWAY_CLEAR: GatewayRulesResult = Object.freeze({ blocked: false, tripped: false, crashed: false, failClosed: false, reasons: Object.freeze([]) });
const PAYLOAD_POISON: GatewayRulesResult = Object.freeze({ blocked: true, tripped: true, crashed: false, failClosed: true, reasons: Object.freeze(["PAYLOAD_POISON_FAIL_CLOSED"]) });

export interface GmxFlagOptions {
  skewDeltaUsd?: number;
  notionalUsd?: number;
  nowMs?: number;
}

export function packProtocolLane(slot: number, a: number, b: number, c: number, d: number, out: Float64Array): Float64Array {
  out[slot] = a; out[slot + 1] = b; out[slot + 2] = c; out[slot + 3] = d;
  return out;
}

export function evaluateGmxFlags(vec: Float64Array, slot = PROTO_GMX, opts?: GmxFlagOptions): number {
  const oiL = vec[slot], oiS = vec[slot + 1], tvl = vec[slot + 2], coll = vec[slot + 3];
  let f = FLAGS_CLEAR;
  if (tvl > 0 && Math.abs(oiL - oiS) / tvl > GMX_IMBALANCE_MAX) f |= FLAGS_IMBALANCE_TRIP;
  if (coll !== 0 && (!Number.isFinite(coll) || coll < GMX_COLLATERAL_MIN)) f |= FLAGS_COLLATERAL_TRIP;
  if (opts?.skewDeltaUsd !== undefined) {
    const nowMs = opts.nowMs ?? Date.now();
    recordPendingGmxSkew(opts.skewDeltaUsd, opts.notionalUsd ?? opts.skewDeltaUsd, nowMs);
    if (isPendingGmxSkewTripped(tvl, nowMs)) f |= FLAGS_IMBALANCE_TRIP;
  }
  return applyAutoSeveranceOnFlags(f);
}

export function evaluatePendleFlags(yieldCurrent: number, yieldOracle: number): number {
  const f = Math.abs(yieldCurrent - yieldOracle) * 10_000 > PENDLE_YIELD_SHOCK_MAX_BPS ? FLAGS_YIELD_SHOCK : FLAGS_CLEAR;
  return applyAutoSeveranceOnFlags(f);
}

export function evaluateUniswapFlags(slippageBps: number, directionalFeeBps: number, maxDirBps: number): number {
  const f = (slippageBps > UNISWAP_SLIPPAGE_MAX_BPS || directionalFeeBps > maxDirBps) ? FLAG_UNISWAP_SLIPPAGE_EXCEEDED : FLAGS_CLEAR;
  return applyAutoSeveranceOnFlags(f);
}

export function evaluateAaveFlags(hf: number, projected?: number, crossDest?: number): number {
  let f = FLAGS_CLEAR;
  if (!Number.isFinite(hf) || hf < AAVE_HF_MIN) f |= FLAG_AAVE_HEALTH_FACTOR_LOW;
  if (projected !== undefined && projected < AAVE_HF_MIN) f |= FLAG_AAVE_HEALTH_FACTOR_LOW;
  if (crossDest !== undefined && crossDest < AAVE_HF_MIN) f |= FLAG_AAVE_HEALTH_FACTOR_LOW;
  return applyAutoSeveranceOnFlags(f);
}

export function evaluateMorphoFlags(oracleAgeMs: number, priceDeviationBps: number): number {
  let f = FLAGS_CLEAR;
  if (oracleAgeMs > MORPHO_ORACLE_MAX_AGE_MS) f |= FLAG_MORPHO_ORACLE_STALE;
  if (priceDeviationBps > MORPHO_PRICE_DEVIATION_MAX_BPS) f |= FLAG_MORPHO_ORACLE_STALE;
  return applyAutoSeveranceOnFlags(f);
}

export function evaluateHlSessionFlags(sessionValid: boolean, orderSize: number, maxSize: number, spreadBps: number, rpm: number): number {
  let f = FLAGS_CLEAR;
  if (!sessionValid) f |= FLAGS_HL_SESSION;
  if (orderSize > maxSize) f |= FLAGS_HL_SIZE;
  if (spreadBps > HL_SPREAD_MAX_BPS) f |= FLAGS_HL_SPREAD;
  if (rpm > HL_RATE_LIMIT_RPM) f |= FLAGS_HL_RATE;
  return applyAutoSeveranceOnFlags(f);
}

export function evaluateDepegFlags(pegDeviationBps: number, maxBps = STABILIZER_DEPEG_MAX_BPS): number {
  const f = pegDeviationBps > maxBps ? FLAGS_DEPEG_TRIP : FLAGS_CLEAR;
  return applyAutoSeveranceOnFlags(f);
}

export function evaluateVariationalFlags(input: VariationalFlagInput): number {
  let f = FLAGS_CLEAR;
  const ageMs = input.nowMs - input.quoteTimestampMs;
  if (ageMs > VARIATIONAL_QUOTE_MAX_AGE_MS) f |= FLAG_VARIATIONAL_STALE_QUOTE;
  else if (input.oracleMarkUsd > 0) {
    const devBps = (Math.abs(input.quotePriceUsd - input.oracleMarkUsd) / input.oracleMarkUsd) * 10_000;
    if (devBps > VARIATIONAL_PRICE_DEVIATION_MAX_BPS) f |= FLAG_VARIATIONAL_STALE_QUOTE;
  }
  const depth = input.olpDepthUsd;
  if (input.longTailAsset !== false && depth > 0 && input.tradeSizeUsd / depth > VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION) {
    f |= FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED;
  }
  return applyAutoSeveranceOnFlags(f);
}

export function evaluateGatewayRules(input: GatewayRulesInput): GatewayRulesResult {
  if (input.payloadPoison) return PAYLOAD_POISON;
  const hasVine = input.estimatedLossUsd !== undefined && input.accountBalanceUsd !== undefined;
  if (!hasVine && isGatewayNominalFastPath(input.soil)) return GATEWAY_CLEAR;
  try {
    const soil = checkSoilResistance(input.soil);
    if (!soil.tripped) {
      if (!hasVine) return GATEWAY_CLEAR;
      vineWrapProtection({ symbol: input.symbol, estimatedLossUsd: input.estimatedLossUsd!, accountBalanceUsd: input.accountBalanceUsd!, criHardlock: input.criHardlock });
      return GATEWAY_CLEAR;
    }
    return { blocked: true, tripped: true, crashed: false, failClosed: true, reasons: soil.reasons };
  } catch (err) {
    if (err instanceof HardlockError || err instanceof RiskLimitExceeded) {
      return { blocked: true, tripped: true, crashed: false, failClosed: true, reasons: Object.freeze([err.code]), errorCode: err.code };
    }
    return { blocked: true, tripped: true, crashed: true, failClosed: false, reasons: Object.freeze([err instanceof Error ? err.message : String(err)]) };
  }
}

export function assertCitadelRiskGate(input: GatewayRulesInput, expectTrip: boolean): CitadelRiskGateVerdict {
  const result = evaluateGatewayRules(input);
  if (!expectTrip) return { pass: !result.tripped, failClosed: false, falseNegatives: 0, result };
  const failClosed = result.failClosed && result.tripped;
  return { pass: failClosed, failClosed, falseNegatives: result.tripped ? 0 : 1, result };
}
