/** Variational Omni RFQ pre-flight guard — quote freshness & OLP depth invariants. */

export const VARIATIONAL_QUOTE_MAX_AGE_MS = 500;
export const VARIATIONAL_PRICE_DEVIATION_MAX_BPS = 30;
export const VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION = 0.15;

export interface VariationalRFQPayload {
  symbol: string;
  quotePriceUsd: number;
  oracleMarkUsd: number;
  quoteTimestampMs: number;
  nowMs: number;
  tradeSizeUsd: number;
  olpDepthUsd: number;
  /** When true (default), enforce 15% OLP depth cap for long-tail assets. */
  longTailAsset?: boolean;
}

export interface VariationalRFQResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reason?: string;
  detail?: string;
}

export function validateVariationalRFQIntent(payload: VariationalRFQPayload): VariationalRFQResult {
  const ageMs = payload.nowMs - payload.quoteTimestampMs;
  if (ageMs > VARIATIONAL_QUOTE_MAX_AGE_MS) {
    return {
      ok: false,
      status: "FAIL_CLOSED",
      reason: "FAIL_CLOSED: VARIATIONAL_STALE_QUOTE_BREACH",
      detail: `quoteAgeMs=${ageMs}>${VARIATIONAL_QUOTE_MAX_AGE_MS}`,
    };
  }
  const mark = payload.oracleMarkUsd;
  if (mark > 0) {
    const devBps = (Math.abs(payload.quotePriceUsd - mark) / mark) * 10_000;
    if (devBps > VARIATIONAL_PRICE_DEVIATION_MAX_BPS) {
      return {
        ok: false,
        status: "FAIL_CLOSED",
        reason: "FAIL_CLOSED: VARIATIONAL_STALE_QUOTE_BREACH",
        detail: `priceDevBps=${devBps.toFixed(1)}>${VARIATIONAL_PRICE_DEVIATION_MAX_BPS}`,
      };
    }
  }
  const longTail = payload.longTailAsset !== false;
  const depth = payload.olpDepthUsd;
  if (longTail && depth > 0 && payload.tradeSizeUsd / depth > VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION) {
    return {
      ok: false,
      status: "FAIL_CLOSED",
      reason: "FAIL_CLOSED: VARIATIONAL_OLP_DEPTH_BREACH",
      detail: `utilPct=${((payload.tradeSizeUsd / depth) * 100).toFixed(1)}>15`,
    };
  }
  return { ok: true, status: "ALLOW", detail: "OLP depth ok" };
}
