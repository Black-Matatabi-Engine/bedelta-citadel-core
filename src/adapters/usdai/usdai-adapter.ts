/**
 * USD.ai — AI-compute yield-bearing collateral pre-flight guard (Pillar 3).
 * Decoupled GPU RWA oracle freshness · sUSDai peg · liquidity depth · soil fuse.
 */
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";
import { resolveUsdAiProtocolMask } from "./usdai-protocol-lane";
import {
  USDAI_ARBITRUM_CHAIN_ID,
  USDAI_MIN_LIQUIDITY_DEPTH_USD,
  USDAI_NAV_DEVIATION_MAX_BPS,
  USDAI_ORACLE_MAX_AGE_MS,
  USDAI_PEG_DRIFT_MAX_BPS,
  USD_AI_DEPEG_ORACLE_TRIP,
  type UsdaiSoilInput,
} from "./usdai-constants";

export {
  USDAI_ARBITRUM_CHAIN_ID,
  USDAI_MIN_LIQUIDITY_DEPTH_USD,
  USDAI_NAV_DEVIATION_MAX_BPS,
  USDAI_ORACLE_MAX_AGE_MS,
  USDAI_PEG_DRIFT_MAX_BPS,
  USD_AI_DEPEG_ORACLE_TRIP,
  type UsdaiSoilInput,
} from "./usdai-constants";
export { packUsdAiProtocolLane, resolveUsdAiProtocolMask, formatUsdAiFlagMask } from "./usdai-protocol-lane";

export interface UsdaiCollateralInput extends UsdaiSoilInput {
  chainId: number;
  collateralSymbol?: string;
  agentId?: string;
  at?: Date;
}

export interface UsdaiOracleCheckResult {
  ok: boolean;
  oracleAgeMs: number;
  pegDriftBps: number;
  navDeviationBps: number;
  reasons: string[];
}

export interface UsdaiCollateralGuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reasons: string[];
  oracleOk: boolean;
  depthOk: boolean;
  soilOk: boolean;
  latencyUs: number;
}

export function computeUsdAiPegDriftBps(susdaiPriceUsd: number): number {
  return Math.abs(susdaiPriceUsd - 1) * 10_000;
}

export function computeUsdAiNavDeviationBps(navUsd: number, gpuMarkUsd: number): number {
  if (!Number.isFinite(gpuMarkUsd) || gpuMarkUsd <= 0) return Number.POSITIVE_INFINITY;
  return (Math.abs(navUsd - gpuMarkUsd) / gpuMarkUsd) * 10_000;
}

/** Decoupled oracle lane — GPU valuation age · peg drift · NAV vs GPU mark. */
export function verifyUsdAiOracle(input: UsdaiSoilInput): UsdaiOracleCheckResult {
  const reasons: string[] = [];
  const oracleAgeMs = Math.max(0, input.nowMs - input.oracleTimestampMs);
  const pegDriftBps = computeUsdAiPegDriftBps(input.susdaiPriceUsd);
  const navDeviationBps = computeUsdAiNavDeviationBps(input.navUsd, input.gpuMarkUsd);
  const mask = resolveUsdAiProtocolMask(input);

  if (mask !== 0) {
    if (oracleAgeMs > USDAI_ORACLE_MAX_AGE_MS) {
      reasons.push(`USDAI_ORACLE_STALE:ageMs=${oracleAgeMs}>${USDAI_ORACLE_MAX_AGE_MS}`);
    }
    if (pegDriftBps > USDAI_PEG_DRIFT_MAX_BPS) {
      reasons.push(`USDAI_PEG_DRIFT:driftBps=${pegDriftBps.toFixed(1)}>${USDAI_PEG_DRIFT_MAX_BPS}`);
    }
    if (navDeviationBps > USDAI_NAV_DEVIATION_MAX_BPS) {
      reasons.push(`USDAI_NAV_DEVIATION:deviationBps=${navDeviationBps.toFixed(1)}>${USDAI_NAV_DEVIATION_MAX_BPS}`);
    }
    reasons.push(USD_AI_DEPEG_ORACLE_TRIP);
  }

  return { ok: reasons.length === 0, oracleAgeMs, pegDriftBps, navDeviationBps, reasons };
}

/** Liquidity depth lane — independent of oracle freshness. */
export function verifyUsdAiLiquidityDepth(
  liquidityDepthUsd: number,
  amountUsd = 0,
): { ok: boolean; reasons: string[] } {
  const available = liquidityDepthUsd - amountUsd;
  if (available >= USDAI_MIN_LIQUIDITY_DEPTH_USD) {
    return { ok: true, reasons: [] };
  }
  return {
    ok: false,
    reasons: [
      `USDAI_LIQUIDITY_DEPTH_LOW:available=${available}<min=${USDAI_MIN_LIQUIDITY_DEPTH_USD}`,
      USD_AI_DEPEG_ORACLE_TRIP,
    ],
  };
}

export function evaluateUsdAiSoilGate(
  input: UsdaiSoilInput,
): { triggered: boolean; reasons: string[] } {
  const oracle = verifyUsdAiOracle(input);
  const depth = verifyUsdAiLiquidityDepth(input.liquidityDepthUsd, input.amountUsd ?? 0);
  const reasons = [...oracle.reasons, ...depth.reasons];
  return { triggered: reasons.length > 0, reasons: [...new Set(reasons)] };
}

function buildUsdAiSoilInput(input: UsdaiCollateralInput): SoilResistanceInput {
  return {
    symbol: input.collateralSymbol ?? "sUSDai",
    hlSpot: input.susdaiPriceUsd,
    hlPerp: input.gpuMarkUsd,
    dydxPerp: input.navUsd,
    depthUsd: Math.max(0, input.liquidityDepthUsd - (input.amountUsd ?? 0)),
    orderSizeUsd: input.amountUsd,
    at: input.at ?? new Date(input.nowMs),
    disableThresholdJitter: true,
    usdai: input,
  };
}

export function evaluateUsdAiCollateralGuard(
  input: UsdaiCollateralInput,
): UsdaiCollateralGuardResult {
  const t0 = performance.now();
  const reasons: string[] = [];

  if (input.chainId !== USDAI_ARBITRUM_CHAIN_ID) {
    reasons.push(`USDAI_CHAIN_UNSUPPORTED:chainId=${input.chainId}`);
  }

  const oracle = verifyUsdAiOracle(input);
  if (!oracle.ok) reasons.push(...oracle.reasons);

  const depth = verifyUsdAiLiquidityDepth(input.liquidityDepthUsd, input.amountUsd ?? 0);
  if (!depth.ok) reasons.push(...depth.reasons);

  const soilProbe = checkSoilResistance(buildUsdAiSoilInput(input));
  const soilOk = soilProbe.ok;
  if (!soilOk) reasons.push("SOIL_RESISTANCE_TRIP", ...soilProbe.reasons);

  const ok = reasons.length === 0 && soilOk;

  return {
    ok,
    status: ok ? "ALLOW" : "FAIL_CLOSED",
    reasons: [...new Set(reasons)],
    oracleOk: oracle.ok,
    depthOk: depth.ok,
    soilOk,
    latencyUs: (performance.now() - t0) * 1000,
  };
}
