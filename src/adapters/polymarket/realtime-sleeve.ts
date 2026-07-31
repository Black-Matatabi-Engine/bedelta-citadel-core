/**
 * Polymarket real-time tail sleeve — orderbook read-path + 2PC intent leg builder.
 */

import type { IntentLeg } from "../../core/intent-ledger";
import {
  DEFAULT_TAIL_HEDGE_THRESHOLD,
  evaluateTailHedgeTrigger,
  fetchMarketSnapshot,
  type FetchMarketSnapshotOptions,
  type MarketSnapshot,
} from "./index";

/** Minimum ask-side depth (USD) to enter 2PC prepare */
export const DEFAULT_MIN_ASK_DEPTH_USD = 500;

/** Max bid-ask spread (bps) before blocking 2PC */
export const DEFAULT_MAX_SPREAD_BPS = 2_000;

/** Block tail sleeve 2PC when |fundingRate| exceeds this (hourly fraction) */
export const DEFAULT_MAX_FUNDING_RATE = 0.001;

/** Block when symbol realized vol exceeds this fraction (e.g. 0.08 = 8%) */
export const DEFAULT_MAX_SYMBOL_VOLATILITY = 0.08;

export interface OrderbookLiquidityMetrics {
  spreadBps: number;
  askDepthUsd: number;
  bidDepthUsd: number;
  totalDepthUsd: number;
  /** 0–100 liquidity score from depth + tight spread */
  liquidityScore: number;
}

export interface RealtimeSleeveInput {
  tokenId: string;
  hedgeSizeUsd: number;
  symbol?: string;
  thresholdProb?: number;
  fundingRate?: number;
  symbolVolatility?: number;
  maxSpreadBps?: number;
  minAskDepthUsd?: number;
  maxFundingRate?: number;
  maxSymbolVolatility?: number;
  fetchOptions?: FetchMarketSnapshotOptions;
}

export interface RealtimeSleeveEvaluation {
  tailTriggered: boolean;
  readyFor2Pc: boolean;
  reasons: string[];
  snapshot: MarketSnapshot;
  metrics: OrderbookLiquidityMetrics;
  proposedLeg: IntentLeg | null;
}

export function computeOrderbookLiquidityMetrics(
  snapshot: MarketSnapshot,
): OrderbookLiquidityMetrics {
  const askDepthUsd = snapshot.askDepthUsd;
  const bidDepthUsd = snapshot.bidDepthUsd;
  const totalDepthUsd = askDepthUsd + bidDepthUsd;

  let spreadBps = 0;
  if (
    snapshot.spread !== null &&
    snapshot.midPrice !== null &&
    snapshot.midPrice > 0
  ) {
    spreadBps = (snapshot.spread / snapshot.midPrice) * 10_000;
  }

  const depthScore = Math.min(totalDepthUsd / 10_000, 1) * 70;
  const spreadScore = Math.max(0, 30 - spreadBps / 100);
  const liquidityScore = Math.min(100, Math.round(depthScore + spreadScore));

  return {
    spreadBps,
    askDepthUsd,
    bidDepthUsd,
    totalDepthUsd,
    liquidityScore,
  };
}

export function buildPolymarketIntentLeg(
  sizeUsd: number,
  symbol?: string,
): IntentLeg {
  return {
    venue: "POLYMARKET",
    side: "BUY",
    sizeUsd,
    symbol,
  };
}

/** Pure evaluation from an existing snapshot (test-friendly). */
export function evaluateTailSleeveFromSnapshot(
  snapshot: MarketSnapshot,
  input: Omit<RealtimeSleeveInput, "tokenId" | "fetchOptions">,
): RealtimeSleeveEvaluation {
  const threshold = input.thresholdProb ?? DEFAULT_TAIL_HEDGE_THRESHOLD;
  const maxSpreadBps = input.maxSpreadBps ?? DEFAULT_MAX_SPREAD_BPS;
  const minAskDepthUsd = input.minAskDepthUsd ?? DEFAULT_MIN_ASK_DEPTH_USD;
  const maxFunding = input.maxFundingRate ?? DEFAULT_MAX_FUNDING_RATE;
  const maxVol = input.maxSymbolVolatility ?? DEFAULT_MAX_SYMBOL_VOLATILITY;

  const metrics = computeOrderbookLiquidityMetrics(snapshot);
  const marketPrice = snapshot.impliedProbability ?? snapshot.bestAsk ?? 0;
  const tailTriggered = evaluateTailHedgeTrigger(marketPrice, threshold);

  const reasons: string[] = [];

  if (input.fundingRate !== undefined && Math.abs(input.fundingRate) > maxFunding) {
    reasons.push(
      `FUNDING_RATE=${input.fundingRate}>${maxFunding}`,
    );
  }
  if (
    input.symbolVolatility !== undefined &&
    input.symbolVolatility > maxVol
  ) {
    reasons.push(
      `SYMBOL_VOL=${input.symbolVolatility}>${maxVol}`,
    );
  }
  if (metrics.spreadBps > maxSpreadBps) {
    reasons.push(`SPREAD_BPS=${metrics.spreadBps.toFixed(0)}>${maxSpreadBps}`);
  }
  if (metrics.askDepthUsd < minAskDepthUsd) {
    reasons.push(
      `ASK_DEPTH_USD=${metrics.askDepthUsd.toFixed(0)}<${minAskDepthUsd}`,
    );
  }
  if (!tailTriggered) {
    reasons.push(`TAIL_NOT_TRIGGERED:price=${marketPrice}>${threshold}`);
  }

  const readyFor2Pc = tailTriggered && reasons.length === 0;
  const proposedLeg = readyFor2Pc
    ? buildPolymarketIntentLeg(input.hedgeSizeUsd, input.symbol)
    : null;

  return {
    tailTriggered,
    readyFor2Pc,
    reasons,
    snapshot,
    metrics,
    proposedLeg,
  };
}

/** Fetch orderbook + evaluate tail sleeve readiness for 2PC prepare. */
export async function evaluateRealtimeTailSleeve(
  input: RealtimeSleeveInput,
): Promise<RealtimeSleeveEvaluation> {
  const snapshot = await fetchMarketSnapshot(input.tokenId, input.fetchOptions ?? {});
  return evaluateTailSleeveFromSnapshot(snapshot, input);
}
