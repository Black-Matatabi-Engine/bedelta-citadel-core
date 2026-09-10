/**
 * Morpho Blue — Arbitrum isolated-market pre-flight guard.
 * Oracle freshness · price deviation · soil fuse.
 */
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";
import { evaluateMorphoFlags } from "../../core/risk-engine-core";
import {
  MORPHO_ARBITRUM_CHAIN_ID,
  MORPHO_MIN_MARKET_LIQUIDITY_USD,
  MORPHO_ORACLE_MAX_AGE_MS,
  MORPHO_PRICE_DEVIATION_MAX_BPS,
} from "./morpho-blue-constants";

export {
  MORPHO_ARBITRUM_CHAIN_ID,
  MORPHO_ORACLE_MAX_AGE_MS,
  MORPHO_PRICE_DEVIATION_MAX_BPS,
  MORPHO_MIN_MARKET_LIQUIDITY_USD,
} from "./morpho-blue-constants";

export interface MorphoBlueMarketInput {
  chainId: number;
  marketId: string;
  action: "SUPPLY" | "BORROW" | "WITHDRAW";
  amountUsd: number;
  marketLiquidityUsd: number;
  oraclePriceUsd: number;
  referencePriceUsd: number;
  oracleTimestampMs: number;
  refPriceUsd: number;
  spotPriceUsd: number;
  depthUsd?: number;
  agentId?: string;
  nowMs?: number;
  at?: Date;
}

export interface MorphoOracleResult {
  ok: boolean;
  oracleAgeMs: number;
  priceDeviationBps: number;
  liquidityOk: boolean;
  reasons: string[];
}

export interface MorphoBlueGuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reasons: string[];
  oracleAgeMs: number;
  oracleOk: boolean;
  soilOk: boolean;
  latencyUs: number;
}

export function computeMorphoPriceDeviationBps(oracle: number, reference: number): number {
  if (!Number.isFinite(reference) || reference <= 0) return Number.POSITIVE_INFINITY;
  return (Math.abs(oracle - reference) / reference) * 10_000;
}

export function verifyMorphoOracle(input: {
  oracleTimestampMs: number;
  nowMs: number;
  oraclePriceUsd: number;
  referencePriceUsd: number;
  marketLiquidityUsd: number;
}): MorphoOracleResult {
  const reasons: string[] = [];
  const oracleAgeMs = Math.max(0, input.nowMs - input.oracleTimestampMs);
  const priceDeviationBps = computeMorphoPriceDeviationBps(input.oraclePriceUsd, input.referencePriceUsd);
  const liquidityOk = Number(input.marketLiquidityUsd) >= MORPHO_MIN_MARKET_LIQUIDITY_USD;

  if (!liquidityOk) {
    reasons.push(`MORPHO_MARKET_LIQUIDITY_LOW:liquidity=${input.marketLiquidityUsd}<min=${MORPHO_MIN_MARKET_LIQUIDITY_USD}`);
  }
  if (evaluateMorphoFlags(oracleAgeMs, priceDeviationBps) !== 0) {
    if (oracleAgeMs > MORPHO_ORACLE_MAX_AGE_MS) {
      reasons.push(`MORPHO_ORACLE_STALE:ageMs=${oracleAgeMs}>${MORPHO_ORACLE_MAX_AGE_MS}`);
    }
    if (priceDeviationBps > MORPHO_PRICE_DEVIATION_MAX_BPS) {
      reasons.push(`MORPHO_ORACLE_DEVIATION:deviationBps=${priceDeviationBps.toFixed(1)}>${MORPHO_PRICE_DEVIATION_MAX_BPS}`);
    }
  }

  return { ok: reasons.length === 0, oracleAgeMs, priceDeviationBps, liquidityOk, reasons };
}

function buildMorphoSoilInput(input: MorphoBlueMarketInput): SoilResistanceInput {
  return {
    symbol: input.marketId,
    hlSpot: input.refPriceUsd,
    hlPerp: input.spotPriceUsd,
    dydxPerp: input.refPriceUsd,
    depthUsd: input.depthUsd ?? Math.max(0, input.marketLiquidityUsd - input.amountUsd),
    orderSizeUsd: input.amountUsd,
    at: input.at ?? new Date(input.nowMs ?? Date.now()),
    disableThresholdJitter: true,
  };
}

export function evaluateMorphoBlueGuard(input: MorphoBlueMarketInput): MorphoBlueGuardResult {
  const t0 = performance.now();
  const reasons: string[] = [];
  const nowMs = input.nowMs ?? Date.now();

  if (input.chainId !== MORPHO_ARBITRUM_CHAIN_ID) {
    reasons.push(`MORPHO_CHAIN_UNSUPPORTED:chainId=${input.chainId}`);
  }

  const oracle = verifyMorphoOracle({
    oracleTimestampMs: input.oracleTimestampMs,
    nowMs,
    oraclePriceUsd: input.oraclePriceUsd,
    referencePriceUsd: input.referencePriceUsd,
    marketLiquidityUsd: input.marketLiquidityUsd,
  });
  if (!oracle.ok) reasons.push(...oracle.reasons);

  const soilProbe = checkSoilResistance(buildMorphoSoilInput(input));
  const soilOk = soilProbe.ok;
  if (!soilOk) reasons.push("SOIL_RESISTANCE_TRIP", ...soilProbe.reasons);

  const ok = reasons.length === 0 && soilOk;

  return {
    ok,
    status: ok ? "ALLOW" : "FAIL_CLOSED",
    reasons: [...new Set(reasons)],
    oracleAgeMs: oracle.oracleAgeMs,
    oracleOk: oracle.ok,
    soilOk,
    latencyUs: (performance.now() - t0) * 1000,
  };
}
