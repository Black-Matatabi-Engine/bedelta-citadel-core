/**
 * Uniswap V3 — Arbitrum concentrated-liquidity spot swap pre-flight guard.
 * Depth · dynamic fee impact · checkSoilResistance() 0-Gas fail-closed fuse.
 */
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";
import { evaluateUniswapFlags } from "../../core/risk-engine-core";
import {
  UNISWAP_V3_ARBITRUM_CHAIN_ID,
  UNISWAP_V3_MAX_DYNAMIC_FEE_BPS,
  UNISWAP_V3_MAX_SLIPPAGE_BPS,
  UNISWAP_V3_MAX_UTILIZATION,
  UNISWAP_V3_MIN_ACTIVE_LIQUIDITY_USD,
  UNISWAP_V3_MIN_TICK_DEPTH_RATIO,
  UNISWAP_V3_MAX_DIRECTIONAL_FEE_BPS,
  UNISWAP_V3_UTILIZATION_SLIPPAGE_FACTOR_BPS,
} from "./uniswap-v3-constants";

export {
  UNISWAP_V3_ARBITRUM_CHAIN_ID,
  UNISWAP_V3_MAX_DYNAMIC_FEE_BPS,
  UNISWAP_V3_MAX_SLIPPAGE_BPS,
  UNISWAP_V3_MAX_UTILIZATION,
  UNISWAP_V3_MIN_ACTIVE_LIQUIDITY_USD,
} from "./uniswap-v3-constants";

export interface UniswapV3SwapInput {
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountInUsd: number;
  activeLiquidityUsd: number;
  dynamicFeeBps: number;
  /** Liquidity concentrated in the active tick band (USD). */
  tickRangeLiquidityUsd?: number;
  /** Tick spacing for the V3 pool (e.g. 60 = 0.01% fee tier). */
  tickSpacing?: number;
  /** Directional fee premium when swap worsens tick imbalance. */
  directionalFeeBps?: number;
  spotPriceUsd: number;
  refPriceUsd: number;
  depthUsd?: number;
  agentId?: string;
  nowMs?: number;
  at?: Date;
}

export interface UniswapV3LiquidityResult {
  ok: boolean;
  liquidityOk: boolean;
  utilizationOk: boolean;
  dynamicFeeOk: boolean;
  utilization: number;
  estimatedSlippageBps: number;
  reasons: string[];
}

export interface UniswapV3GuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reasons: string[];
  liquidityOk: boolean;
  soilOk: boolean;
  estimatedSlippageBps: number;
  latencyUs: number;
}

export function estimateUniswapV3SlippageBps(
  amountInUsd: number,
  activeLiquidityUsd: number,
  dynamicFeeBps: number,
  directionalFeeBps = 0,
): number {
  if (!Number.isFinite(amountInUsd) || amountInUsd <= 0) return dynamicFeeBps + directionalFeeBps;
  if (!Number.isFinite(activeLiquidityUsd) || activeLiquidityUsd <= 0) return Number.POSITIVE_INFINITY;
  const utilization = amountInUsd / activeLiquidityUsd;
  return dynamicFeeBps + directionalFeeBps + utilization * UNISWAP_V3_UTILIZATION_SLIPPAGE_FACTOR_BPS;
}

export function verifyUniswapTickDepth(input: {
  amountInUsd: number;
  tickRangeLiquidityUsd: number;
  tickSpacing?: number;
}): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const amountInUsd = Number(input.amountInUsd);
  const tickLiquidity = Number(input.tickRangeLiquidityUsd);
  const minDepth = amountInUsd * UNISWAP_V3_MIN_TICK_DEPTH_RATIO;
  if (!Number.isFinite(tickLiquidity) || tickLiquidity < minDepth) {
    reasons.push(
      `UNISWAP_V3_TICK_DEPTH_INSUFFICIENT:tickLiquidity=${tickLiquidity}<required=${minDepth.toFixed(0)}`,
    );
  }
  const spacing = input.tickSpacing ?? 0;
  if (spacing > 0 && spacing < 1) {
    reasons.push(`UNISWAP_V3_TICK_SPACING_INVALID:spacing=${spacing}`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function verifyUniswapPoolLiquidity(input: {
  amountInUsd: number;
  activeLiquidityUsd: number;
  dynamicFeeBps: number;
  directionalFeeBps?: number;
  tickRangeLiquidityUsd?: number;
  tickSpacing?: number;
}): UniswapV3LiquidityResult {
  const reasons: string[] = [];
  const amountInUsd = Number(input.amountInUsd);
  const activeLiquidityUsd = Number(input.activeLiquidityUsd);
  const dynamicFeeBps = Number(input.dynamicFeeBps);
  const directionalFeeBps = Number(input.directionalFeeBps ?? 0);

  if (!Number.isFinite(amountInUsd) || amountInUsd <= 0) {
    return {
      ok: false,
      liquidityOk: false,
      utilizationOk: false,
      dynamicFeeOk: false,
      utilization: 0,
      estimatedSlippageBps: 0,
      reasons: ["UNISWAP_V3_AMOUNT_INVALID"],
    };
  }

  const liquidityOk = activeLiquidityUsd >= UNISWAP_V3_MIN_ACTIVE_LIQUIDITY_USD;
  if (!liquidityOk) {
    reasons.push(
      `UNISWAP_V3_ACTIVE_LIQUIDITY_LOW:liquidity=${activeLiquidityUsd}<min=${UNISWAP_V3_MIN_ACTIVE_LIQUIDITY_USD}`,
    );
  }

  const utilization = activeLiquidityUsd > 0 ? amountInUsd / activeLiquidityUsd : Number.POSITIVE_INFINITY;
  const utilizationOk = utilization <= UNISWAP_V3_MAX_UTILIZATION;
  if (!utilizationOk) {
    reasons.push(
      `UNISWAP_V3_LIQUIDITY_DEPLETED:utilization=${(utilization * 100).toFixed(1)}%>${UNISWAP_V3_MAX_UTILIZATION * 100}%`,
    );
  }

  const dynamicFeeOk = dynamicFeeBps <= UNISWAP_V3_MAX_DYNAMIC_FEE_BPS;
  if (!dynamicFeeOk) {
    reasons.push(`UNISWAP_V3_DYNAMIC_FEE_BREACH:feeBps=${dynamicFeeBps}>${UNISWAP_V3_MAX_DYNAMIC_FEE_BPS}`);
  }

  if (input.tickRangeLiquidityUsd !== undefined) {
    const tick = verifyUniswapTickDepth({
      amountInUsd,
      tickRangeLiquidityUsd: input.tickRangeLiquidityUsd,
      tickSpacing: input.tickSpacing,
    });
    if (!tick.ok) reasons.push(...tick.reasons);
  }

  const estimatedSlippageBps = estimateUniswapV3SlippageBps(
    amountInUsd,
    activeLiquidityUsd,
    dynamicFeeBps,
    directionalFeeBps,
  );
  if (evaluateUniswapFlags(estimatedSlippageBps, directionalFeeBps, UNISWAP_V3_MAX_DIRECTIONAL_FEE_BPS) !== 0) {
    if (estimatedSlippageBps > UNISWAP_V3_MAX_SLIPPAGE_BPS) {
      reasons.push(
        `UNISWAP_V3_SLIPPAGE_BREACH:estimatedBps=${estimatedSlippageBps.toFixed(1)}>${UNISWAP_V3_MAX_SLIPPAGE_BPS}`,
      );
    }
    if (directionalFeeBps > UNISWAP_V3_MAX_DIRECTIONAL_FEE_BPS) {
      reasons.push(
        `UNISWAP_V3_DIRECTIONAL_FEE_BREACH:feeBps=${directionalFeeBps}>${UNISWAP_V3_MAX_DIRECTIONAL_FEE_BPS}`,
      );
    }
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

function buildUniswapSoilInput(input: UniswapV3SwapInput): SoilResistanceInput {
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

export function evaluateUniswapV3SwapGuard(input: UniswapV3SwapInput): UniswapV3GuardResult {
  const t0 = performance.now();
  const reasons: string[] = [];

  if (input.chainId !== UNISWAP_V3_ARBITRUM_CHAIN_ID) {
    reasons.push(`UNISWAP_V3_CHAIN_UNSUPPORTED:chainId=${input.chainId}`);
  }
  if (input.tokenIn === input.tokenOut) reasons.push("UNISWAP_V3_NOOP_SWAP");

  const liquidity = verifyUniswapPoolLiquidity(input);
  if (!liquidity.ok) reasons.push(...liquidity.reasons);

  const soilProbe = checkSoilResistance(buildUniswapSoilInput(input));
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
