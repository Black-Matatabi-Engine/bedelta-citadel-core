/**
 * Aave V3 — Arbitrum lending pre-flight guard.
 * Health Factor validation · cross-chain liquidation boundary · soil fuse.
 */
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";
import { evaluateAaveFlags } from "../../core/risk-engine-core";
import {
  AAVE_ARBITRUM_CHAIN_ID,
  AAVE_CROSS_CHAIN_HF_BUFFER,
  AAVE_HF_FAIL_CLOSED_THRESHOLD,
  AAVE_HF_LIQUIDATION_THRESHOLD,
} from "./aave-v3-constants";

export {
  AAVE_ARBITRUM_CHAIN_ID,
  AAVE_CROSS_CHAIN_HF_BUFFER,
  AAVE_HF_FAIL_CLOSED_THRESHOLD,
  AAVE_HF_LIQUIDATION_THRESHOLD,
} from "./aave-v3-constants";

export interface AaveLendingInput {
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

export interface AaveHealthFactorResult {
  ok: boolean;
  healthFactor: number;
  projectedOk: boolean;
  crossChainOk: boolean;
  reasons: string[];
}

export interface AaveLendingGuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reasons: string[];
  healthFactor: number;
  hfOk: boolean;
  soilOk: boolean;
  latencyUs: number;
}

export function computeAaveHealthFactor(input: {
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

export function verifyAaveHealthFactor(input: {
  collateralUsd: number;
  debtUsd: number;
  liquidationThreshold: number;
  projectedHealthFactor?: number;
  crossChainSourceHf?: number;
  crossChainDestHf?: number;
}): AaveHealthFactorResult {
  const reasons: string[] = [];
  const healthFactor = computeAaveHealthFactor(input);

  if (healthFactor < AAVE_HF_LIQUIDATION_THRESHOLD) {
    reasons.push(`AAVE_HF_LIQUIDATABLE:hf=${healthFactor.toFixed(4)}<${AAVE_HF_LIQUIDATION_THRESHOLD}`);
  } else if (evaluateAaveFlags(healthFactor) !== 0) {
    reasons.push(
      `AAVE_HF_FAIL_CLOSED:hf=${healthFactor.toFixed(4)}<${AAVE_HF_FAIL_CLOSED_THRESHOLD}`,
    );
  }

  const projected = input.projectedHealthFactor ?? healthFactor;
  const projectedOk = projected >= AAVE_HF_FAIL_CLOSED_THRESHOLD;
  if (!projectedOk) {
    reasons.push(
      `AAVE_PROJECTED_HF_FAIL_CLOSED:projected=${projected.toFixed(4)}<${AAVE_HF_FAIL_CLOSED_THRESHOLD}`,
    );
  }

  let crossChainOk = true;
  const src = input.crossChainSourceHf;
  const dest = input.crossChainDestHf;
  if (src !== undefined && dest !== undefined) {
    crossChainOk = dest >= src - AAVE_CROSS_CHAIN_HF_BUFFER;
    if (!crossChainOk) {
      reasons.push(
        `AAVE_CROSS_CHAIN_HF_BOUNDARY:dest=${dest.toFixed(4)}<source=${src.toFixed(4)}-buffer=${AAVE_CROSS_CHAIN_HF_BUFFER}`,
      );
    }
    if (dest < AAVE_HF_FAIL_CLOSED_THRESHOLD) {
      reasons.push(`AAVE_CROSS_CHAIN_DEST_HF_LOW:dest=${dest.toFixed(4)}`);
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

function buildAaveSoilInput(input: AaveLendingInput, healthFactor: number): SoilResistanceInput {
  const hfDepthScale = Math.max(0, (healthFactor - AAVE_HF_FAIL_CLOSED_THRESHOLD) * 100_000);
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

export function evaluateAaveV3Guard(input: AaveLendingInput): AaveLendingGuardResult {
  const t0 = performance.now();
  const reasons: string[] = [];

  if (input.chainId !== AAVE_ARBITRUM_CHAIN_ID) {
    reasons.push(`AAVE_CHAIN_UNSUPPORTED:chainId=${input.chainId}`);
  }

  const hf = verifyAaveHealthFactor(input);
  if (!hf.ok) reasons.push(...hf.reasons);

  const soilProbe = checkSoilResistance(buildAaveSoilInput(input, hf.healthFactor));
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
