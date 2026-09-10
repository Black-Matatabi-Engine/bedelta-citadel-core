/** Plain-text retail warning generator — Robinhood C-end user alerts. */

import type { RetailGuardReasonCode } from "./types";

export function formatRetailWarning(
  code: RetailGuardReasonCode,
  detail: Record<string, string | number | boolean> = {},
): string {
  switch (code) {
    case "UNAUTHORIZED_SPENDER_REJECTED":
      return `ALERT: Unauthorized ERC20 approval requested for spender ${detail.spender ?? "unknown"}${detail.infinite ? " (INFINITE allowance)" : ""}.`;
    case "VENUE_DRIFT_REJECTED":
      return `ALERT: Signature blocked — contract ${detail.contract ?? "unknown"} is not on your approved venue whitelist (anti-phishing).`;
    case "SLIPPAGE_EXCEEDED":
      return `ALERT: Swap blocked — estimated price impact ${detail.crossSlippage ?? "exceeds"} exceeds your safety limit (0-Gas pre-broadcast guard).`;
    case "DEPTH_INSUFFICIENT":
      return `ALERT: Swap blocked — market depth $${detail.depthUsd ?? 0} is below the minimum safety floor.`;
    case "MAX_ATTEMPTS_EXCEEDED_SEVERED":
      return `ALERT: Too many rapid submit attempts (${detail.attempts ?? 4}) — signing channel severed to prevent panic trading.`;
    case "CHANNEL_SEVERED":
      return "ALERT: Signing channel is severed — wait before retrying (FOMO throttle active).";
    default:
      return `ALERT: Transaction blocked by Retail Guard (${code}).`;
  }
}
