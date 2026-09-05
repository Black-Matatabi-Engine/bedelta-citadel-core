/** GMX v2 pool imbalance & collateral reserve boundary constants. */
import {
  FLAGS_COLLATERAL_TRIP,
  FLAGS_IMBALANCE_TRIP,
  GMX_COLLATERAL_MIN,
  GMX_IMBALANCE_MAX,
  PROTO_VECT_LEN,
  evaluateGmxFlags,
  packProtocolLane,
} from "../../core/risk-engine-core";

export const GMX_POOL_IMBALANCE_MAX_RATIO = GMX_IMBALANCE_MAX;
export const GMX_COLLATERAL_RESERVE_MIN_RATIO = GMX_COLLATERAL_MIN;

const GMX_VEC = new Float64Array(PROTO_VECT_LEN);

export function computeGmxPoolImbalanceRatio(input: {
  oiLongUsd: number;
  oiShortUsd: number;
  poolTvlUsd: number;
}): number {
  const tvl = Number(input.poolTvlUsd);
  if (!Number.isFinite(tvl) || tvl <= 0) return Number.POSITIVE_INFINITY;
  return Math.abs(Number(input.oiLongUsd) - Number(input.oiShortUsd)) / tvl;
}

export function verifyGmxPoolImbalance(input: {
  oiLongUsd: number;
  oiShortUsd: number;
  poolTvlUsd: number;
}): { ok: boolean; imbalanceRatio: number; reasons: string[] } {
  const imbalanceRatio = computeGmxPoolImbalanceRatio(input);
  const flags = evaluateGmxFlags(packProtocolLane(0, input.oiLongUsd, input.oiShortUsd, input.poolTvlUsd, 0, GMX_VEC));
  const reasons: string[] = [];
  if (flags & FLAGS_IMBALANCE_TRIP) {
    reasons.push(`GMX_POOL_IMBALANCE_BREACH:ratio=${imbalanceRatio.toFixed(4)}>${GMX_POOL_IMBALANCE_MAX_RATIO}`);
  }
  return { ok: reasons.length === 0, imbalanceRatio, reasons };
}

export function verifyGmxCollateralReserve(input: {
  collateralReserveRatio: number;
}): { ok: boolean; reasons: string[] } {
  const ratio = Number(input.collateralReserveRatio);
  const flags = evaluateGmxFlags(packProtocolLane(0, 0, 0, 0, ratio, GMX_VEC));
  const reasons: string[] = [];
  if (flags & FLAGS_COLLATERAL_TRIP) {
    reasons.push(`GMX_COLLATERAL_RESERVE_BREACH:ratio=${ratio.toFixed(4)}<${GMX_COLLATERAL_RESERVE_MIN_RATIO}`);
  }
  return { ok: reasons.length === 0, reasons };
}
