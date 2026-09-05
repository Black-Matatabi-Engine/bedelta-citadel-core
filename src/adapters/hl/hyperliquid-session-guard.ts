/** Hyperliquid L1 session-key & orderbook guard constants. */
import {
  FLAGS_HL_RATE,
  FLAGS_HL_SESSION,
  FLAGS_HL_SIZE,
  FLAGS_HL_SPREAD,
  HL_RATE_LIMIT_RPM,
  HL_SPREAD_MAX_BPS,
  evaluateHlSessionFlags,
} from "../../core/risk-engine-core";
import { SESSION_KEY_NOTIONAL_CAP_USD } from "../../services/session-key-adapter-lib/session-key-types";

export const HL_ORDERBOOK_SPREAD_MAX_BPS = HL_SPREAD_MAX_BPS;
export const HL_SESSION_MAX_SIZE_PER_ORDER_USD = SESSION_KEY_NOTIONAL_CAP_USD;
export const HL_SESSION_RATE_LIMIT_PER_MIN = HL_RATE_LIMIT_RPM;

export interface HyperliquidSessionGuardInput {
  orderSizeUsd: number;
  maxOrderSizeUsd?: number;
  spreadBps: number;
  requestsInLastMinute?: number;
  sessionKeyValid: boolean;
}

export interface HyperliquidSessionGuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reasons: string[];
}

export function evaluateHyperliquidSessionGuard(
  input: HyperliquidSessionGuardInput,
): HyperliquidSessionGuardResult {
  const maxSize = input.maxOrderSizeUsd ?? HL_SESSION_MAX_SIZE_PER_ORDER_USD;
  const flags = evaluateHlSessionFlags(
    input.sessionKeyValid,
    input.orderSizeUsd,
    maxSize,
    input.spreadBps,
    input.requestsInLastMinute ?? 0,
  );
  const reasons: string[] = [];
  if (flags & FLAGS_HL_SESSION) reasons.push("HL_SESSION_KEY_INVALID");
  if (flags & FLAGS_HL_SIZE) reasons.push(`HL_MAX_SIZE_PER_ORDER_BREACH:size=${input.orderSizeUsd}>${maxSize}`);
  if (flags & FLAGS_HL_SPREAD) reasons.push(`HL_ORDERBOOK_SPREAD_BREACH:spreadBps=${input.spreadBps}>${HL_ORDERBOOK_SPREAD_MAX_BPS}`);
  if (flags & FLAGS_HL_RATE) {
    const rpm = input.requestsInLastMinute ?? 0;
    reasons.push(`HL_RATE_LIMIT_BREACH:rpm=${rpm}>${HL_SESSION_RATE_LIMIT_PER_MIN}`);
  }
  const ok = flags === 0;
  return { ok, status: ok ? "ALLOW" : "FAIL_CLOSED", reasons };
}
