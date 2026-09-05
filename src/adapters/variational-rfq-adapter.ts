/** Variational Omni RFQ pre-flight guard — delegates to core bitmask engine. */

import {
  evaluateVariationalFlags,
  FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED,
  FLAG_VARIATIONAL_STALE_QUOTE,
  FLAGS_CLEAR,
  FLAGS_SEVERED,
} from "../core/risk-engine-core";
import {
  VARIATIONAL_PRICE_DEVIATION_MAX_BPS,
  VARIATIONAL_QUOTE_MAX_AGE_MS,
} from "../core/risk-engine-limits";
export {
  VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION,
  VARIATIONAL_PRICE_DEVIATION_MAX_BPS,
  VARIATIONAL_QUOTE_MAX_AGE_MS,
} from "../core/risk-engine-limits";

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
  /** Core bitmask flags (includes FLAGS_SEVERED when auto-sever tripped). */
  flags: number;
}

function staleQuoteDetail(payload: VariationalRFQPayload): string {
  const ageMs = payload.nowMs - payload.quoteTimestampMs;
  if (ageMs > VARIATIONAL_QUOTE_MAX_AGE_MS) {
    return `quoteAgeMs=${ageMs}>${VARIATIONAL_QUOTE_MAX_AGE_MS}`;
  }
  const mark = payload.oracleMarkUsd;
  const devBps = mark > 0 ? (Math.abs(payload.quotePriceUsd - mark) / mark) * 10_000 : 0;
  return `priceDevBps=${devBps.toFixed(1)}>${VARIATIONAL_PRICE_DEVIATION_MAX_BPS}`;
}

export function validateVariationalRFQIntent(payload: VariationalRFQPayload): VariationalRFQResult {
  const flags = evaluateVariationalFlags(payload);
  const tripMask = FLAG_VARIATIONAL_STALE_QUOTE | FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED;
  if ((flags & tripMask) === FLAGS_CLEAR) {
    return { ok: true, status: "ALLOW", detail: "OLP depth ok", flags };
  }
  if (flags & FLAG_VARIATIONAL_STALE_QUOTE) {
    return {
      ok: false,
      status: "FAIL_CLOSED",
      reason: "FAIL_CLOSED: VARIATIONAL_STALE_QUOTE_BREACH",
      detail: staleQuoteDetail(payload),
      flags,
    };
  }
  const utilPct = ((payload.tradeSizeUsd / payload.olpDepthUsd) * 100).toFixed(1);
  return {
    ok: false,
    status: "FAIL_CLOSED",
    reason: "FAIL_CLOSED: VARIATIONAL_OLP_DEPTH_BREACH",
    detail: `utilPct=${utilPct}>15`,
    flags,
  };
}

export function formatVariationalFlagMask(flags: number): string {
  const core = flags & ~FLAGS_SEVERED;
  return core === FLAGS_CLEAR ? "0x0" : `0x${core.toString(16)}`;
}
