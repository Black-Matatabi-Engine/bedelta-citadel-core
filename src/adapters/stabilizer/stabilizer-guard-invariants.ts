/** Stabilizer peg drift, reserve-ratio, and zero-slippage capacity invariants. */
import {
  STABILIZER_DEFAULT_RESERVE_FLOOR_USD,
  STABILIZER_MIN_RESERVE_RATIO,
  STABILIZER_PEG_DRIFT_MAX_BPS,
} from "./stabilizer-constants";

export interface StabilizerPoolCapacityResult {
  ok: boolean;
  capacityOk: boolean;
  reserveOk: boolean;
  reserveRatioOk: boolean;
  zeroSlippageOk: boolean;
  reasons: string[];
}

export interface StabilizerPegResult {
  ok: boolean;
  pegOk: boolean;
  reasons: string[];
}

function driftBps(markUsd: number): number {
  return Math.abs(markUsd - 1) * 10_000;
}

export function verifyStabilizerPegDrift(input: {
  usdzMarkUsd?: number;
  collateralMarkUsd?: number;
  maxDriftBps?: number;
}): StabilizerPegResult {
  const maxBps = input.maxDriftBps ?? STABILIZER_PEG_DRIFT_MAX_BPS;
  const reasons: string[] = [];
  const usdzDrift = driftBps(input.usdzMarkUsd ?? 1);
  const collateralDrift = driftBps(input.collateralMarkUsd ?? 1);

  if (usdzDrift > maxBps) reasons.push(`STABILIZER_USDZ_DEPEG:driftBps=${usdzDrift.toFixed(2)}>${maxBps}`);
  if (collateralDrift > maxBps) {
    reasons.push(`STABILIZER_COLLATERAL_DEPEG:driftBps=${collateralDrift.toFixed(2)}>${maxBps}`);
  }
  return { ok: reasons.length === 0, pegOk: reasons.length === 0, reasons };
}

export function verifyZeroSlippageCapacity(input: {
  amountUsd: number;
  poolCapacityUsd: number;
  poolReserveUsd: number;
}): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const amountUsd = Number(input.amountUsd);
  if (amountUsd > Number(input.poolCapacityUsd)) {
    reasons.push(`STABILIZER_ZERO_SLIPPAGE_CAPACITY_EXCEEDED:amount=${amountUsd}>capacity=${input.poolCapacityUsd}`);
  }
  if (amountUsd > Number(input.poolReserveUsd)) {
    reasons.push(`STABILIZER_CONSTANT_SUM_BREACH:amount=${amountUsd}>reserve=${input.poolReserveUsd}`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function verifyStabilizerPoolCapacity(input: {
  amountUsd: number;
  poolReserveUsd: number;
  poolCapacityUsd: number;
  reserveFloorUsd?: number;
  minReserveRatio?: number;
}): StabilizerPoolCapacityResult {
  const reasons: string[] = [];
  const reserveFloor = input.reserveFloorUsd ?? STABILIZER_DEFAULT_RESERVE_FLOOR_USD;
  const minReserveRatio = input.minReserveRatio ?? STABILIZER_MIN_RESERVE_RATIO;
  const amountUsd = Number(input.amountUsd);
  const poolReserveUsd = Number(input.poolReserveUsd);

  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return {
      ok: false,
      capacityOk: false,
      reserveOk: false,
      reserveRatioOk: false,
      zeroSlippageOk: false,
      reasons: ["STABILIZER_AMOUNT_INVALID"],
    };
  }

  const zeroSlippage = verifyZeroSlippageCapacity({
    amountUsd,
    poolCapacityUsd: input.poolCapacityUsd,
    poolReserveUsd,
  });
  let capacityOk = zeroSlippage.ok;
  if (!zeroSlippage.ok) reasons.push(...zeroSlippage.reasons);

  const postReserve = poolReserveUsd - amountUsd;
  let reserveOk = true;
  if (postReserve < reserveFloor) {
    reserveOk = false;
    reasons.push(`STABILIZER_RESERVE_FLOOR_BREACH:postReserve=${postReserve}<floor=${reserveFloor}`);
  }

  const reserveRatio = poolReserveUsd > 0 ? postReserve / poolReserveUsd : 0;
  let reserveRatioOk = true;
  if (reserveRatio < minReserveRatio) {
    reserveRatioOk = false;
    reasons.push(`STABILIZER_RESERVE_RATIO_BREACH:ratio=${reserveRatio.toFixed(4)}<min=${minReserveRatio}`);
  }

  return {
    ok: capacityOk && reserveOk && reserveRatioOk,
    capacityOk,
    reserveOk,
    reserveRatioOk,
    zeroSlippageOk: zeroSlippage.ok,
    reasons,
  };
}
