/**
 * Live L2 book → checkSoilResistance() bridge for Hyperliquid testnet depth auditing.
 */

import {
  MAX_SLIPPAGE,
  checkSoilResistance,
  type SoilResistanceInput,
  type SoilResistanceResult,
} from "./risk-control";

export interface LiveBookSoilProbe {
  symbol: string;
  bestBid: number;
  bestAsk: number;
  midPx: number;
  bidDepthUsd: number;
  askDepthUsd: number;
  spreadBps: number;
  priceImpactBps: number;
  depthUsd: number;
}

export interface LiveBookSoilAudit extends SoilResistanceResult {
  probe: LiveBookSoilProbe;
  spreadBps: number;
  priceImpactBps: number;
}

/** Map live top-of-book metrics into SoilResistanceInput (HL testnet single-venue probe). */
export function buildSoilInputFromLiveBook(
  probe: LiveBookSoilProbe,
  at?: Date,
): SoilResistanceInput {
  return {
    symbol: probe.symbol,
    hlSpot: probe.bestBid,
    hlPerp: probe.bestAsk,
    dydxPerp: probe.midPx,
    depthUsd: probe.depthUsd,
    at,
  };
}

/** Feed live spread / depth / price-impact metrics into checkSoilResistance(). */
export function auditLiveBookSoilResistance(
  probe: LiveBookSoilProbe,
  at?: Date,
): LiveBookSoilAudit {
  const base = checkSoilResistance(buildSoilInputFromLiveBook(probe, at));
  const reasons = [...base.reasons];
  const spreadRatio = probe.spreadBps / 10_000;
  const impactRatio = probe.priceImpactBps / 10_000;

  if (spreadRatio > MAX_SLIPPAGE) {
    reasons.push(
      `LIVE_SPREAD_BPS=${probe.spreadBps.toFixed(2)}>${MAX_SLIPPAGE * 10_000}bps`,
    );
  }
  if (impactRatio > MAX_SLIPPAGE) {
    reasons.push(
      `LIVE_PRICE_IMPACT_BPS=${probe.priceImpactBps.toFixed(2)}>${MAX_SLIPPAGE * 10_000}bps`,
    );
  }

  const tripped = reasons.length > 0;

  return {
    ok: !tripped,
    tripped,
    crossVenueSlippage: base.crossVenueSlippage,
    spotPerpSlippage: base.spotPerpSlippage,
    reasons,
    probe,
    spreadBps: probe.spreadBps,
    priceImpactBps: probe.priceImpactBps,
  };
}
