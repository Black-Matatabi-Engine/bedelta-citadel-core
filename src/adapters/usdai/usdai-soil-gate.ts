/** Lean USD.ai soil gate — Worker-tree-shakeable (no checkSoilResistance import). */
import { resolveUsdAiProtocolMask } from "./usdai-protocol-lane";
import {
  USDAI_MIN_LIQUIDITY_DEPTH_USD,
  USDAI_NAV_DEVIATION_MAX_BPS,
  USDAI_ORACLE_MAX_AGE_MS,
  USDAI_PEG_DRIFT_MAX_BPS,
  USD_AI_DEPEG_ORACLE_TRIP,
  resolveUsdAiClockSsot,
  type UsdaiSoilInput,
} from "./usdai-constants";

export interface UsdaiOracleCheckResult {
  ok: boolean;
  oracleAgeMs: number;
  pegDriftBps: number;
  navDeviationBps: number;
  reasons: string[];
}

export function computeUsdAiPegDriftBps(susdaiPriceUsd: number): number {
  return Math.abs(susdaiPriceUsd - 1) * 10_000;
}

export function computeUsdAiNavDeviationBps(navUsd: number, gpuMarkUsd: number): number {
  if (!Number.isFinite(gpuMarkUsd) || gpuMarkUsd <= 0) return Number.POSITIVE_INFINITY;
  return (Math.abs(navUsd - gpuMarkUsd) / gpuMarkUsd) * 10_000;
}

export function verifyUsdAiOracle(input: UsdaiSoilInput): UsdaiOracleCheckResult {
  const clock = resolveUsdAiClockSsot(input, input.nowMs == null);
  if (clock.tripped) {
    return { ok: false, oracleAgeMs: 0, pegDriftBps: 0, navDeviationBps: 0, reasons: clock.reasons };
  }
  const clocked = clock.input;
  const reasons: string[] = [];
  const oracleAgeMs = Math.max(0, clocked.nowMs - clocked.oracleTimestampMs);
  const pegDriftBps = computeUsdAiPegDriftBps(clocked.susdaiPriceUsd);
  const navDeviationBps = computeUsdAiNavDeviationBps(clocked.navUsd, clocked.gpuMarkUsd);
  const mask = resolveUsdAiProtocolMask(clocked, false);
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

export function verifyUsdAiLiquidityDepth(
  liquidityDepthUsd: number,
  amountUsd = 0,
): { ok: boolean; reasons: string[] } {
  const available = liquidityDepthUsd - amountUsd;
  if (available >= USDAI_MIN_LIQUIDITY_DEPTH_USD) return { ok: true, reasons: [] };
  return {
    ok: false,
    reasons: [
      `USDAI_LIQUIDITY_DEPTH_LOW:available=${available}<min=${USDAI_MIN_LIQUIDITY_DEPTH_USD}`,
      USD_AI_DEPEG_ORACLE_TRIP,
    ],
  };
}

export function evaluateUsdAiSoilGate(input: UsdaiSoilInput): { triggered: boolean; reasons: string[] } {
  const oracle = verifyUsdAiOracle(input);
  const depth = verifyUsdAiLiquidityDepth(input.liquidityDepthUsd, input.amountUsd ?? 0);
  const reasons = [...oracle.reasons, ...depth.reasons];
  return { triggered: reasons.length > 0, reasons: [...new Set(reasons)] };
}
