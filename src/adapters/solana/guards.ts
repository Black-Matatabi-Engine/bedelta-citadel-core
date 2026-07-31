/**
 * Solana Touchwood guards — slot latency, oracle deviation, depth resolvers.
 * @see risk-control.ts — checkSoilResistance cross-venue matrix.
 */

import {
  R15_ORACLE_DEVIATION_MAX_BPS,
  RAYDIUM_TICK_COLLAPSE_MIN_USD,
  SOLANA_BASE_PRIORITY_FEE_LAMPORTS,
  SOLANA_SLOT_LATENCY_MAX_MS,
  TOUCHWOOD_JUPITER_ORACLE_MAX_BPS,
} from "../../config/constants";
import type {
  JupiterRouteQuote,
  PhoenixOrderbookSnapshot,
  RaydiumClmmSnapshot,
} from "./types";

export function checkSlotLatency(slotLatencyMs: number): {
  pass: boolean;
  reason?: string;
} {
  if (!Number.isFinite(slotLatencyMs) || slotLatencyMs < 0) {
    return { pass: false, reason: "SLOT_LATENCY_INVALID" };
  }
  if (slotLatencyMs >= SOLANA_SLOT_LATENCY_MAX_MS) {
    return {
      pass: false,
      reason: `SLOT_LATENCY=${slotLatencyMs.toFixed(0)}ms>=${SOLANA_SLOT_LATENCY_MAX_MS}ms`,
    };
  }
  return { pass: true };
}

/** Dynamic priority-fee scaler — raises fee when slot lag approaches fuse */
export function adjustPriorityFee(
  baseLamports: number = SOLANA_BASE_PRIORITY_FEE_LAMPORTS,
  slotLatencyMs: number,
  congestionMultiplier = 1,
): number {
  const base = Math.max(0, baseLamports);
  const lagRatio = Math.min(
    1,
    Math.max(0, slotLatencyMs) / SOLANA_SLOT_LATENCY_MAX_MS,
  );
  const latencyScale = 1 + lagRatio * 0.75;
  return Math.round(base * latencyScale * Math.max(1, congestionMultiplier));
}

/** R15 oracle deviation — Jupiter Pyth vs spot delta gate */
export function checkR15OracleDeviation(
  pythOraclePx: number,
  spotPx: number,
  maxBps: number = R15_ORACLE_DEVIATION_MAX_BPS,
): { pass: boolean; deviationBps: number; reason?: string } {
  if (!Number.isFinite(pythOraclePx) || !Number.isFinite(spotPx) || spotPx <= 0) {
    return {
      pass: false,
      deviationBps: Number.POSITIVE_INFINITY,
      reason: "R15_ORACLE_DEVIATION_INVALID_INPUT",
    };
  }

  const deviationBps = (Math.abs(pythOraclePx - spotPx) / spotPx) * 10_000;
  if (deviationBps > maxBps) {
    return {
      pass: false,
      deviationBps,
      reason: `R15_ORACLE_DEVIATION=${deviationBps.toFixed(2)}bps>${maxBps}bps`,
    };
  }

  return { pass: true, deviationBps };
}

/** Touchwood — Jupiter pipe sever when Pyth delta > 0.3% */
export function checkTouchwoodJupiterOracle(
  pythOraclePx: number,
  spotPx: number,
): { pass: boolean; deviationBps: number; reason?: string } {
  return checkR15OracleDeviation(
    pythOraclePx,
    spotPx,
    TOUCHWOOD_JUPITER_ORACLE_MAX_BPS,
  );
}

/** Touchwood — Raydium CLMM tick liquidity collapse detector */
export function checkRaydiumTickCollapse(
  snapshot: RaydiumClmmSnapshot,
  minLiquidityUsd: number = RAYDIUM_TICK_COLLAPSE_MIN_USD,
): { pass: boolean; reason?: string } {
  const liquidity = Math.min(snapshot.tickLiquidityUsd, snapshot.depthUsd);
  if (!Number.isFinite(liquidity) || liquidity < minLiquidityUsd) {
    return {
      pass: false,
      reason: `RAYDIUM_TICK_COLLAPSE=${liquidity.toFixed(0)}USD<${minLiquidityUsd}USD`,
    };
  }
  return { pass: true };
}

export function resolvePhoenixDepthUsd(
  snapshot: PhoenixOrderbookSnapshot,
  override?: number,
): number {
  if (override !== undefined && override > 0) return override;
  const bidDepth = snapshot.bids.reduce((s, l) => s + l.price * l.size, 0);
  const askDepth = snapshot.asks.reduce((s, l) => s + l.price * l.size, 0);
  return Math.min(bidDepth, askDepth);
}

export function resolveRaydiumDepthUsd(
  snapshot: RaydiumClmmSnapshot,
  override?: number,
): number {
  if (override !== undefined && override > 0) return override;
  return Math.min(snapshot.depthUsd, snapshot.tickLiquidityUsd);
}

export function resolveJupiterRoutingDepthUsd(
  quote: JupiterRouteQuote,
  override?: number,
): number {
  if (override !== undefined && override > 0) return override;
  const inAmt = Number(quote.inAmount);
  const outAmt = Number(quote.outAmount);
  const notional = Math.max(inAmt, outAmt) / 1_000_000;
  return Math.max(notional * 100, 250_000);
}

export function resolvePhoenixMidPx(snapshot: PhoenixOrderbookSnapshot): number | null {
  const bestBid = snapshot.bids[0]?.price;
  const bestAsk = snapshot.asks[0]?.price;
  if (bestBid !== undefined && bestAsk !== undefined) {
    return (bestBid + bestAsk) / 2;
  }
  return snapshot.lastTradePx ?? null;
}

export { SOLANA_BASE_PRIORITY_FEE_LAMPORTS };
