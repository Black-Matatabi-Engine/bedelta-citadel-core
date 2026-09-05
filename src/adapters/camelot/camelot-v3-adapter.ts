/**
 * Camelot V3 — Arbitrum concentrated-liquidity spot swap pre-flight guard.
 * Depth · dynamic fee impact · checkSoilResistance() 0-Gas fail-closed fuse.
 */
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";
import {
  CAMELOT_V3_ARBITRUM_CHAIN_ID,
  CAMELOT_V3_MAX_DYNAMIC_FEE_BPS,
  CAMELOT_V3_MAX_SLIPPAGE_BPS,
  CAMELOT_V3_MAX_UTILIZATION,
  CAMELOT_V3_MIN_ACTIVE_LIQUIDITY_USD,
  CAMELOT_V3_UTILIZATION_SLIPPAGE_FACTOR_BPS,
} from "./camelot-v3-constants";

export {
  CAMELOT_V3_ARBITRUM_CHAIN_ID,
  CAMELOT_V3_MAX_DYNAMIC_FEE_BPS,
  CAMELOT_V3_MAX_SLIPPAGE_BPS,
  CAMELOT_V3_MAX_UTILIZATION,
  CAMELOT_V3_MIN_ACTIVE_LIQUIDITY_USD,
} from "./camelot-v3-constants";

export interface CamelotV3SwapInput {
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountInUsd: number;
  activeLiquidityUsd: number;
  dynamicFeeBps: number;
  spotPriceUsd: number;
  refPriceUsd: number;
  depthUsd?: number;
  agentId?: string;
  nowMs?: number;
  at?: Date;
}

export interface CamelotV3LiquidityResult {
  ok: boolean;
  liquidityOk: boolean;
  utilizationOk: boolean;
  dynamicFeeOk: boolean;
  utilization: number;
  estimatedSlippageBps: number;
  reasons: string[];
}

export interface CamelotV3GuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reasons: string[];
  liquidityOk: boolean;
  soilOk: boolean;
  estimatedSlippageBps: number;
  latencyUs: number;
}

export function estimateCamelotV3SlippageBps(
  amountInUsd: number,
  activeLiquidityUsd: number,
  dynamicFeeBps: number,
): number {
  if (!Number.isFinite(amountInUsd) || amountInUsd <= 0) return dynamicFeeBps;
  if (!Number.isFinite(activeLiquidityUsd) || activeLiquidityUsd <= 0) return Number.POSITIVE_INFINITY;
  const utilization = amountInUsd / activeLiquidityUsd;
  return dynamicFeeBps + utilization * CAMELOT_V3_UTILIZATION_SLIPPAGE_FACTOR_BPS;
}

export function verifyCamelotPoolLiquidity(input: {
  amountInUsd: number;
  activeLiquidityUsd: number;
  dynamicFeeBps: number;
}): CamelotV3LiquidityResult {
  const reasons: string[] = [];
  const amountInUsd = Number(input.amountInUsd);
  const activeLiquidityUsd = Number(input.activeLiquidityUsd);
  const dynamicFeeBps = Number(input.dynamicFeeBps);

  if (!Number.isFinite(amountInUsd) || amountInUsd <= 0) {
    return {
      ok: false,
      liquidityOk: false,
      utilizationOk: false,
      dynamicFeeOk: false,
      utilization: 0,
      estimatedSlippageBps: 0,
      reasons: ["CAMELOT_V3_AMOUNT_INVALID"],
    };
  }

  const liquidityOk = activeLiquidityUsd >= CAMELOT_V3_MIN_ACTIVE_LIQUIDITY_USD;
  if (!liquidityOk) {
    reasons.push(
      `CAMELOT_V3_ACTIVE_LIQUIDITY_LOW:liquidity=${activeLiquidityUsd}<min=${CAMELOT_V3_MIN_ACTIVE_LIQUIDITY_USD}`,
    );
  }

  const utilization = activeLiquidityUsd > 0 ? amountInUsd / activeLiquidityUsd : Number.POSITIVE_INFINITY;
  const utilizationOk = utilization <= CAMELOT_V3_MAX_UTILIZATION;
  if (!utilizationOk) {
    reasons.push(
      `CAMELOT_V3_LIQUIDITY_DEPLETED:utilization=${(utilization * 100).toFixed(1)}%>${CAMELOT_V3_MAX_UTILIZATION * 100}%`,
    );
  }

  const dynamicFeeOk = dynamicFeeBps <= CAMELOT_V3_MAX_DYNAMIC_FEE_BPS;
  if (!dynamicFeeOk) {
    reasons.push(`CAMELOT_V3_DYNAMIC_FEE_BREACH:feeBps=${dynamicFeeBps}>${CAMELOT_V3_MAX_DYNAMIC_FEE_BPS}`);
  }

  const estimatedSlippageBps = estimateCamelotV3SlippageBps(amountInUsd, activeLiquidityUsd, dynamicFeeBps);
  if (estimatedSlippageBps > CAMELOT_V3_MAX_SLIPPAGE_BPS) {
    reasons.push(
      `CAMELOT_V3_SLIPPAGE_BREACH:estimatedBps=${estimatedSlippageBps.toFixed(1)}>${CAMELOT_V3_MAX_SLIPPAGE_BPS}`,
    );
  }

  return {
    ok: reasons.length === 0,
    liquidityOk,
    utilizationOk,
    dynamicFeeOk,
    utilization,
    estimatedSlippageBps,
    reasons,
  };
}

function buildCamelotSoilInput(input: CamelotV3SwapInput): SoilResistanceInput {
  const remainingDepth = Math.max(0, input.activeLiquidityUsd - input.amountInUsd);
  return {
    symbol: `${input.tokenIn}/${input.tokenOut}`,
    hlSpot: input.refPriceUsd,
    hlPerp: input.spotPriceUsd,
    dydxPerp: input.refPriceUsd,
    depthUsd: input.depthUsd ?? remainingDepth,
    orderSizeUsd: input.amountInUsd,
    at: input.at ?? new Date(input.nowMs ?? Date.now()),
    disableThresholdJitter: true,
  };
}

export function evaluateCamelotV3SwapGuard(input: CamelotV3SwapInput): CamelotV3GuardResult {
  const t0 = performance.now();
  const reasons: string[] = [];

  if (input.chainId !== CAMELOT_V3_ARBITRUM_CHAIN_ID) {
    reasons.push(`CAMELOT_V3_CHAIN_UNSUPPORTED:chainId=${input.chainId}`);
  }
  if (input.tokenIn === input.tokenOut) reasons.push("CAMELOT_V3_NOOP_SWAP");

  const liquidity = verifyCamelotPoolLiquidity(input);
  if (!liquidity.ok) reasons.push(...liquidity.reasons);

  const soilProbe = checkSoilResistance(buildCamelotSoilInput(input));
  const soilOk = soilProbe.ok;
  if (!soilOk) reasons.push("SOIL_RESISTANCE_TRIP", ...soilProbe.reasons);

  const liquidityOk = liquidity.ok;
  const ok = reasons.length === 0 && soilOk;

  return {
    ok,
    status: ok ? "ALLOW" : "FAIL_CLOSED",
    reasons: [...new Set(reasons)],
    liquidityOk,
    soilOk,
    estimatedSlippageBps: liquidity.estimatedSlippageBps,
    latencyUs: (performance.now() - t0) * 1000,
  };
}
