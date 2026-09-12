/**
 * SPDX-License-Identifier: Apache-2.0
 * EIP-1193 Agentic Wallet Guard SDK — EIP-1193 provider config types.
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
  /** ERC-7540 async vault operator whitelist (`setOperator` / `controller`). */
  allowedOperators?: readonly string[];
  /** Max Pending→Claimable drift bps for ERC-7540 requestDeposit/requestRedeem. */
  erc7540MaxSlippageBps?: number;
  /** Static async vault quote for slippage drift gate (tests / harness). */
  erc7540AsyncQuote?: {
    requestAmountWei: bigint;
    claimableAmountWei: bigint;
    maxSlippageBps?: number;
  };
  resolveErc7540Quote?: (
    kind: "deposit" | "redeem",
    amountWei: bigint,
    vault: string,
  ) => {
    requestAmountWei: bigint;
    claimableAmountWei: bigint;
    maxSlippageBps?: number;
  } | null;
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
  | "RPC_TRANSPORT_SYNC_FAILED"
  | "SEND_CALLS_BATCH_REJECTED"
  | "ERC7540_OPERATOR_REJECTED"
  | "ERC7540_ASYNC_SLIPPAGE_DRIFT";

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
