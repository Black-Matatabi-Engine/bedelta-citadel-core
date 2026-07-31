/**
 * Counter-Attack Matrix — panic asymmetry → systematic maker entry signals.
 * Integrates checkSoilResistance() + dynamic Max SL (Balance×1%+$100).
 */

import {
  auditLiveBookSoilResistance,
  type LiveBookSoilProbe,
} from "./check-soil-resistance";
import { computeEffectiveMaxSlUsd } from "./effective-max-sl";
import {
  RiskLimitExceeded,
  vineWrapProtection,
  type SoilResistanceResult,
} from "./risk-control";

/** (AskDepth − BidDepth) / (AskDepth + BidDepth) — positive = ask-heavy panic */
export const PANIC_IMBALANCE_THRESHOLD = 0.75;

/** Counter-attack live slippage fuse — stricter than global MAX_SLIPPAGE (0.5%) */
export const COUNTER_ATTACK_MAX_LIVE_SLIPPAGE = 0.003;

/** Mark must sit within this band of the soil anchor to qualify */
export const SOIL_ANCHOR_TOLERANCE_BPS = 30;

export type CounterAttackVerdict = "STRIKE" | "REJECT";

export interface CounterAttackInput {
  symbol: string;
  markPx: number;
  bidDepthUsd: number;
  askDepthUsd: number;
  bestBid: number;
  bestAsk: number;
  midPx: number;
  /** Strong support / soil anchor price level */
  soilAnchorPx: number;
  accountBalanceUsd: number;
  orderNotionalUsd?: number;
  hlSpot?: number;
  hlPerp?: number;
  dydxPerp?: number;
  depthUsd?: number;
  spreadBps?: number;
  priceImpactBps?: number;
  at?: Date;
}

export interface CounterAttackResult {
  verdict: CounterAttackVerdict;
  armed: boolean;
  imbalanceRatio: number;
  panicDetected: boolean;
  atSoilAnchor: boolean;
  liveSlippageRatio: number;
  liveSlippageBps: number;
  soil: SoilResistanceResult;
  limitPx: string | null;
  sz: string | null;
  orderNotionalUsd: number;
  dynamicMaxSlUsd: number;
  reasons: string[];
}

/** Orderbook imbalance: (AskDepth − BidDepth) / (AskDepth + BidDepth). */
export function computeOrderbookImbalanceRatio(
  askDepthUsd: number,
  bidDepthUsd: number,
): number {
  const total = askDepthUsd + bidDepthUsd;
  if (!(total > 0)) return 0;
  return (askDepthUsd - bidDepthUsd) / total;
}

export function isExtremePanicSell(imbalanceRatio: number): boolean {
  return imbalanceRatio > PANIC_IMBALANCE_THRESHOLD;
}

/** Price within SOIL_ANCHOR_TOLERANCE_BPS of the strong soil anchor. */
export function isAtStrongSoilAnchor(
  markPx: number,
  soilAnchorPx: number,
  toleranceBps = SOIL_ANCHOR_TOLERANCE_BPS,
): boolean {
  if (!(markPx > 0 && soilAnchorPx > 0)) return false;
  const band = toleranceBps / 10_000;
  return Math.abs(markPx - soilAnchorPx) / soilAnchorPx <= band;
}

/** Passive maker buy — join best bid (zero taker slippage). */
export function computePassiveMakerLimitPx(
  bestBid: number,
  side: "buy" | "sell" = "buy",
  bestAsk?: number,
): string | null {
  if (side === "buy") {
    return bestBid > 0 ? String(bestBid) : null;
  }
  return bestAsk !== undefined && bestAsk > 0 ? String(bestAsk) : null;
}

export function computeCounterAttackSize(
  orderNotionalUsd: number,
  limitPx: number,
): string | null {
  if (!(orderNotionalUsd > 0 && limitPx > 0)) return null;
  return String(orderNotionalUsd / limitPx);
}

export function resolveLiveSlippageRatio(probe: {
  spreadBps?: number;
  priceImpactBps?: number;
  spotPerpSlippage?: number;
}): number {
  const spread = (probe.spreadBps ?? 0) / 10_000;
  const impact = (probe.priceImpactBps ?? 0) / 10_000;
  const spotPerp = probe.spotPerpSlippage ?? 0;
  return Math.max(spread, impact, spotPerp);
}

function buildLiveProbe(input: CounterAttackInput): LiveBookSoilProbe {
  const depthUsd =
    input.depthUsd ?? Math.min(input.bidDepthUsd, input.askDepthUsd);
  const spreadBps =
    input.spreadBps ??
    (input.bestBid > 0 && input.bestAsk > 0
      ? ((input.bestAsk - input.bestBid) /
          ((input.bestAsk + input.bestBid) / 2)) *
        10_000
      : Number.POSITIVE_INFINITY);

  return {
    symbol: input.symbol,
    bestBid: input.bestBid,
    bestAsk: input.bestAsk,
    midPx: input.midPx,
    bidDepthUsd: input.bidDepthUsd,
    askDepthUsd: input.askDepthUsd,
    spreadBps,
    priceImpactBps: input.priceImpactBps ?? spreadBps,
    depthUsd,
  };
}

/**
 * Evaluate counter-attack opportunity — panic + soil anchor + safety gates.
 * Exported for Santenmoku Engine orchestration.
 */
export function evalCounterAttackOpportunity(
  input: CounterAttackInput,
): CounterAttackResult {
  const reasons: string[] = [];
  const dynamicMaxSlUsd = computeEffectiveMaxSlUsd(input.accountBalanceUsd);
  const orderNotionalUsd = input.orderNotionalUsd ?? dynamicMaxSlUsd;

  const imbalanceRatio = computeOrderbookImbalanceRatio(
    input.askDepthUsd,
    input.bidDepthUsd,
  );
  const panicDetected = isExtremePanicSell(imbalanceRatio);
  const atSoilAnchor = isAtStrongSoilAnchor(input.markPx, input.soilAnchorPx);

  if (!panicDetected) {
    reasons.push(
      `IMBALANCE=${imbalanceRatio.toFixed(4)}<=${PANIC_IMBALANCE_THRESHOLD}`,
    );
  }
  if (!atSoilAnchor) {
    reasons.push(
      `NOT_AT_SOIL_ANCHOR mark=${input.markPx} anchor=${input.soilAnchorPx}`,
    );
  }

  const probe = buildLiveProbe(input);
  const soilAudit = auditLiveBookSoilResistance(probe, input.at);
  const soil: SoilResistanceResult = {
    ok: soilAudit.ok,
    tripped: soilAudit.tripped,
    crossVenueSlippage: soilAudit.crossVenueSlippage,
    spotPerpSlippage: soilAudit.spotPerpSlippage,
    reasons: soilAudit.reasons,
  };

  if (soil.tripped) {
    reasons.push(...soil.reasons.map((r) => `SOIL:${r}`));
  }

  const liveSlippageRatio = resolveLiveSlippageRatio({
    spreadBps: probe.spreadBps,
    priceImpactBps: probe.priceImpactBps,
    spotPerpSlippage: soil.spotPerpSlippage,
  });

  if (liveSlippageRatio > COUNTER_ATTACK_MAX_LIVE_SLIPPAGE) {
    reasons.push(
      `LIVE_SLIPPAGE=${(liveSlippageRatio * 100).toFixed(4)}%>${COUNTER_ATTACK_MAX_LIVE_SLIPPAGE * 100}%`,
    );
  }

  if (orderNotionalUsd > dynamicMaxSlUsd) {
    reasons.push(
      `ORDER_NOTIONAL=${orderNotionalUsd.toFixed(2)}>dynamicMaxSlUsd=${dynamicMaxSlUsd.toFixed(2)}`,
    );
  }

  try {
    vineWrapProtection({
      symbol: input.symbol,
      estimatedLossUsd: orderNotionalUsd,
      accountBalanceUsd: input.accountBalanceUsd,
      maxLossLimit: dynamicMaxSlUsd,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!(err instanceof RiskLimitExceeded) || !reasons.some((r) => r.startsWith("ORDER_NOTIONAL"))) {
      reasons.push(`ROOT:${msg}`);
    }
  }

  const structuralOk = panicDetected && atSoilAnchor;
  const safetyOk =
    !soil.tripped &&
    liveSlippageRatio <= COUNTER_ATTACK_MAX_LIVE_SLIPPAGE &&
    orderNotionalUsd <= dynamicMaxSlUsd &&
    !reasons.some((r) => r.startsWith("ROOT:"));

  const armed = structuralOk && safetyOk;
  const limitPxNum = armed ? input.bestBid : 0;
  const limitPx = armed
    ? computePassiveMakerLimitPx(input.bestBid, "buy")
    : null;
  const sz = armed
    ? computeCounterAttackSize(orderNotionalUsd, limitPxNum)
    : null;

  return {
    verdict: armed ? "STRIKE" : "REJECT",
    armed,
    imbalanceRatio,
    panicDetected,
    atSoilAnchor,
    liveSlippageRatio,
    liveSlippageBps: liveSlippageRatio * 10_000,
    soil,
    limitPx,
    sz,
    orderNotionalUsd,
    dynamicMaxSlUsd,
    reasons,
  };
}
