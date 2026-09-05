/** GMX v2 pool imbalance & collateral reserve boundary constants. */
export const GMX_POOL_IMBALANCE_MAX_RATIO = 0.35;
export const GMX_COLLATERAL_RESERVE_MIN_RATIO = 1.05;

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
  const reasons: string[] = [];
  if (imbalanceRatio > GMX_POOL_IMBALANCE_MAX_RATIO) {
    reasons.push(
      `GMX_POOL_IMBALANCE_BREACH:ratio=${imbalanceRatio.toFixed(4)}>${GMX_POOL_IMBALANCE_MAX_RATIO}`,
    );
  }
  return { ok: reasons.length === 0, imbalanceRatio, reasons };
}

export function verifyGmxCollateralReserve(input: {
  collateralReserveRatio: number;
}): { ok: boolean; reasons: string[] } {
  const ratio = Number(input.collateralReserveRatio);
  const reasons: string[] = [];
  if (!Number.isFinite(ratio) || ratio < GMX_COLLATERAL_RESERVE_MIN_RATIO) {
    reasons.push(
      `GMX_COLLATERAL_RESERVE_BREACH:ratio=${ratio.toFixed(4)}<${GMX_COLLATERAL_RESERVE_MIN_RATIO}`,
    );
  }
  return { ok: reasons.length === 0, reasons };
}
