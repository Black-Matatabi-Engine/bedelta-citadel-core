/** Hyperliquid L1 session-key & orderbook guard constants. */
import { SESSION_KEY_NOTIONAL_CAP_USD } from "../../services/session-key-adapter-lib/session-key-types";

export const HL_ORDERBOOK_SPREAD_MAX_BPS = 20;
export const HL_SESSION_MAX_SIZE_PER_ORDER_USD = SESSION_KEY_NOTIONAL_CAP_USD;
export const HL_SESSION_RATE_LIMIT_PER_MIN = 120;

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
  const reasons: string[] = [];
  const maxSize = input.maxOrderSizeUsd ?? HL_SESSION_MAX_SIZE_PER_ORDER_USD;

  if (!input.sessionKeyValid) reasons.push("HL_SESSION_KEY_INVALID");
  if (input.orderSizeUsd > maxSize) {
    reasons.push(`HL_MAX_SIZE_PER_ORDER_BREACH:size=${input.orderSizeUsd}>${maxSize}`);
  }
  if (input.spreadBps > HL_ORDERBOOK_SPREAD_MAX_BPS) {
    reasons.push(`HL_ORDERBOOK_SPREAD_BREACH:spreadBps=${input.spreadBps}>${HL_ORDERBOOK_SPREAD_MAX_BPS}`);
  }
  const rpm = input.requestsInLastMinute ?? 0;
  if (rpm > HL_SESSION_RATE_LIMIT_PER_MIN) {
    reasons.push(`HL_RATE_LIMIT_BREACH:rpm=${rpm}>${HL_SESSION_RATE_LIMIT_PER_MIN}`);
  }

  const ok = reasons.length === 0;
  return { ok, status: ok ? "ALLOW" : "FAIL_CLOSED", reasons };
}
