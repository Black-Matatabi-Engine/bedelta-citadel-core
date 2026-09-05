/**
 * Radiant Capital — Arbitrum lending pre-flight guard.
 * Health Factor validation · cross-chain liquidation boundary · soil fuse.
 */
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";
import {
  RADIANT_ARBITRUM_CHAIN_ID,
  RADIANT_CROSS_CHAIN_HF_BUFFER,
  RADIANT_HF_FAIL_CLOSED_THRESHOLD,
  RADIANT_HF_LIQUIDATION_THRESHOLD,
} from "./radiant-lending-constants";

export {
  RADIANT_ARBITRUM_CHAIN_ID,
  RADIANT_CROSS_CHAIN_HF_BUFFER,
  RADIANT_HF_FAIL_CLOSED_THRESHOLD,
  RADIANT_HF_LIQUIDATION_THRESHOLD,
} from "./radiant-lending-constants";

export interface RadiantLendingInput {
  chainId: number;
  market: string;
  collateralUsd: number;
  debtUsd: number;
  liquidationThreshold: number;
  /** Post-action projected HF (optional). */
  projectedHealthFactor?: number;
  /** Cross-chain source market HF when bridging collateral/debt. */
  crossChainSourceHf?: number;
  crossChainDestHf?: number;
  refPriceUsd: number;
  spotPriceUsd: number;
  depthUsd?: number;
  agentId?: string;
  nowMs?: number;
  at?: Date;
}

export interface RadiantHealthFactorResult {
  ok: boolean;
  healthFactor: number;
  projectedOk: boolean;
  crossChainOk: boolean;
  reasons: string[];
}

export interface RadiantLendingGuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reasons: string[];
  healthFactor: number;
  hfOk: boolean;
  soilOk: boolean;
  latencyUs: number;
}

export function computeRadiantHealthFactor(input: {
  collateralUsd: number;
  debtUsd: number;
  liquidationThreshold: number;
}): number {
  const debt = Number(input.debtUsd);
  if (!Number.isFinite(debt) || debt <= 0) return Number.POSITIVE_INFINITY;
  const collateral = Number(input.collateralUsd);
  const ltv = Number(input.liquidationThreshold);
  if (!Number.isFinite(collateral) || !Number.isFinite(ltv) || ltv <= 0) return 0;
  return (collateral * ltv) / debt;
}

export function verifyRadiantHealthFactor(input: {
  collateralUsd: number;
  debtUsd: number;
  liquidationThreshold: number;
  projectedHealthFactor?: number;
  crossChainSourceHf?: number;
  crossChainDestHf?: number;
}): RadiantHealthFactorResult {
  const reasons: string[] = [];
  const healthFactor = computeRadiantHealthFactor(input);

  if (healthFactor < RADIANT_HF_LIQUIDATION_THRESHOLD) {
    reasons.push(`RADIANT_HF_LIQUIDATABLE:hf=${healthFactor.toFixed(4)}<${RADIANT_HF_LIQUIDATION_THRESHOLD}`);
  } else if (healthFactor < RADIANT_HF_FAIL_CLOSED_THRESHOLD) {
    reasons.push(
      `RADIANT_HF_FAIL_CLOSED:hf=${healthFactor.toFixed(4)}<${RADIANT_HF_FAIL_CLOSED_THRESHOLD}`,
    );
  }

  const projected = input.projectedHealthFactor ?? healthFactor;
  const projectedOk = projected >= RADIANT_HF_FAIL_CLOSED_THRESHOLD;
  if (!projectedOk) {
    reasons.push(
      `RADIANT_PROJECTED_HF_FAIL_CLOSED:projected=${projected.toFixed(4)}<${RADIANT_HF_FAIL_CLOSED_THRESHOLD}`,
    );
  }

  let crossChainOk = true;
  const src = input.crossChainSourceHf;
  const dest = input.crossChainDestHf;
  if (src !== undefined && dest !== undefined) {
    crossChainOk = dest >= src - RADIANT_CROSS_CHAIN_HF_BUFFER;
    if (!crossChainOk) {
      reasons.push(
        `RADIANT_CROSS_CHAIN_HF_BOUNDARY:dest=${dest.toFixed(4)}<source=${src.toFixed(4)}-buffer=${RADIANT_CROSS_CHAIN_HF_BUFFER}`,
      );
    }
    if (dest < RADIANT_HF_FAIL_CLOSED_THRESHOLD) {
      reasons.push(`RADIANT_CROSS_CHAIN_DEST_HF_LOW:dest=${dest.toFixed(4)}`);
      crossChainOk = false;
    }
  }

  return {
    ok: reasons.length === 0,
    healthFactor,
    projectedOk,
    crossChainOk,
    reasons,
  };
}

function buildRadiantSoilInput(input: RadiantLendingInput, healthFactor: number): SoilResistanceInput {
  const hfDepthScale = Math.max(0, (healthFactor - RADIANT_HF_FAIL_CLOSED_THRESHOLD) * 100_000);
  return {
    symbol: input.market,
    hlSpot: input.refPriceUsd,
    hlPerp: input.spotPriceUsd,
    dydxPerp: input.refPriceUsd,
    depthUsd: input.depthUsd ?? hfDepthScale,
    orderSizeUsd: input.debtUsd,
    at: input.at ?? new Date(input.nowMs ?? Date.now()),
    disableThresholdJitter: true,
  };
}

export function evaluateRadiantLendingGuard(input: RadiantLendingInput): RadiantLendingGuardResult {
  const t0 = performance.now();
  const reasons: string[] = [];

  if (input.chainId !== RADIANT_ARBITRUM_CHAIN_ID) {
    reasons.push(`RADIANT_CHAIN_UNSUPPORTED:chainId=${input.chainId}`);
  }

  const hf = verifyRadiantHealthFactor(input);
  if (!hf.ok) reasons.push(...hf.reasons);

  const soilProbe = checkSoilResistance(buildRadiantSoilInput(input, hf.healthFactor));
  const soilOk = soilProbe.ok;
  if (!soilOk) reasons.push("SOIL_RESISTANCE_TRIP", ...soilProbe.reasons);

  const ok = reasons.length === 0 && soilOk;

  return {
    ok,
    status: ok ? "ALLOW" : "FAIL_CLOSED",
    reasons: [...new Set(reasons)],
    healthFactor: hf.healthFactor,
    hfOk: hf.ok,
    soilOk,
    latencyUs: (performance.now() - t0) * 1000,
  };
}
