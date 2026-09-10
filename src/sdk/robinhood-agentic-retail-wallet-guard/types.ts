/**
 * SPDX-License-Identifier: Apache-2.0
 * Robinhood Agentic & Retail Wallet Guard SDK — EIP-1193 provider config types.
 */

export interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

/** Soil lane quote fed into Wasm / `evaluateSoilSlippagePacked`. */
export interface RetailSoilQuote {
  hlSpot: number;
  hlPerp: number;
  dydxPerp: number;
  depthUsd: number;
  maxSlippage?: number;
  minDepthUsd?: number;
}

export interface RetailGuardConfig {
  walletAddress: string;
  allowedVenueMask?: number;
  allowedVenues?: readonly string[];
  allowedSpenders?: readonly string[];
  contractVenueIndex?: Readonly<Record<string, number>>;
  maxApprovalUsd?: number;
  approvalTokenPriceUsd?: number;
  approvalTokenDecimals?: number;
  soilQuote?: RetailSoilQuote;
  resolveSoilQuote?: (method: string, params: unknown[]) => RetailSoilQuote | null;
  resolveVenueBit?: (method: string, params: unknown[]) => number;
  maxAttempts?: number;
  /** Prefer Wasm reflex core when `pkg/soil_core.wasm` is loaded (default true). */
  preferWasm?: boolean;
}

export type RetailGuardReasonCode =
  | "SLIPPAGE_EXCEEDED"
  | "DEPTH_INSUFFICIENT"
  | "VENUE_DRIFT_REJECTED"
  | "UNAUTHORIZED_SPENDER_REJECTED"
  | "MAX_ATTEMPTS_EXCEEDED_SEVERED"
  | "CHANNEL_SEVERED"
  | "RPC_TRANSPORT_SYNC_FAILED";

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
