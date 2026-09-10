/** Lightweight Retail Guard SDK — EIP-1193 provider config types. */

export interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

/** Soil lane quote fed into `evaluateSoilSlippagePacked` (honeypot / slippage fuse). */
export interface RetailSoilQuote {
  hlSpot: number;
  hlPerp: number;
  dydxPerp: number;
  depthUsd: number;
  maxSlippage?: number;
  minDepthUsd?: number;
}

export interface RetailGuardConfig {
  /** Wallet address used for attempt-budget ring slot keying. */
  walletAddress: string;
  /** Allowed venue bitmask (u32) — maps to `evaluateIntentGateU32Pure`. */
  allowedVenueMask?: number;
  /** Approved contract addresses (lowercase) for EIP-712 / tx targets. */
  allowedVenues?: readonly string[];
  /** Approved ERC20 spender addresses (lowercase). */
  allowedSpenders?: readonly string[];
  /** Optional contract → venue index (0–7) for ring-slab bitmask gate. */
  contractVenueIndex?: Readonly<Record<string, number>>;
  /** Reject approvals above this USD notional (uses `approvalTokenPriceUsd`). */
  maxApprovalUsd?: number;
  /** Token USD price for approval notional checks (default 1). */
  approvalTokenPriceUsd?: number;
  /** Token decimals for approval notional (default 18). */
  approvalTokenDecimals?: number;
  /** Static soil quote (overridden by `resolveSoilQuote` when present). */
  soilQuote?: RetailSoilQuote;
  /** Per-request soil quote resolver — return `null` to skip soil gate. */
  resolveSoilQuote?: (method: string, params: unknown[]) => RetailSoilQuote | null;
  /** Per-request venue bit resolver — return `0` to skip venue bitmask gate. */
  resolveVenueBit?: (method: string, params: unknown[]) => number;
  /** Max submit attempts before channel sever (default 3). */
  maxAttempts?: number;
}

export type RetailGuardReasonCode =
  | "SLIPPAGE_EXCEEDED"
  | "DEPTH_INSUFFICIENT"
  | "VENUE_DRIFT_REJECTED"
  | "UNAUTHORIZED_SPENDER_REJECTED"
  | "MAX_ATTEMPTS_EXCEEDED_SEVERED"
  | "CHANNEL_SEVERED";

export interface RetailGuardRejectPayload {
  code: RetailGuardReasonCode;
  message: string;
  plainTextWarning: string;
}

export interface RetailGuardRiskInput {
  method: string;
  params: unknown[];
  config: RetailGuardConfig;
}
