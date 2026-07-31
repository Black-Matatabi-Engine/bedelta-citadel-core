/**
 * Hyperliquid execution — wire types, errors, and session context.
 * @see execution-wire.ts — order wire builders
 * @see execution-transport.ts — signed POST transport
 */

import type { SigningGateInput, SessionKeyAgentResult } from "./auth";
import type { VineShieldOrder } from "../../services/fool-proof-guard";
import type { SoilResistanceInput } from "../../services/risk-control";
import {
  HL_EXCHANGE_URL,
  PGATE_MAX_LATENCY_MS,
  PGATE_MAX_SLIPPAGE,
} from "../../config/constants";

export { HL_EXCHANGE_URL, PGATE_MAX_LATENCY_MS, PGATE_MAX_SLIPPAGE };

export type OrderTif = "Gtc" | "Ioc" | "Alo";
export type TpslSide = "tp" | "sl";
export type OrderGrouping = "na" | "normalTpsl" | "positionTpsl";

export interface HlLimitOrderType {
  limit: { tif: OrderTif };
}

export interface HlTriggerOrderType {
  trigger: {
    triggerPx: string;
    isMarket: boolean;
    tpsl: TpslSide;
  };
}

export type HlOrderType = HlLimitOrderType | HlTriggerOrderType;

/** Wire-format order sent inside L1 `order` actions */
export interface HlOrderWire {
  a: number;
  b: boolean;
  p: string;
  s: string;
  r: boolean;
  t: HlOrderType;
  c?: string;
}

export interface SessionKeyContext {
  agentAddress: string;
  expiresAt: number;
  vaultAddress?: string;
}

export interface PreTradeValidationInput extends SoilResistanceInput {
  latencyMs?: number;
  expectedSlippage?: number;
  accountBalanceUsd?: number;
  foolProof?: VineShieldOrder;
}

import type { Eip712Signer } from "./eip712-signer";

export interface ExecutionContext {
  signer: Eip712Signer;
  sessionKey?: SessionKeyContext;
  gate?: SigningGateInput;
  isTestnet?: boolean;
  dryRun?: boolean;
  fetchFn?: typeof fetch;
  exchangeUrl?: string;
}

export interface HyperliquidSignaturePayload {
  r: string;
  s: string;
  v: number;
}

export interface HyperliquidExchangeRequest {
  action: Record<string, unknown>;
  nonce: number;
  signature: HyperliquidSignaturePayload;
  vaultAddress?: string;
}

export interface HyperliquidExchangeResponse {
  status: string;
  response?: unknown;
}

export interface ExecutionResult {
  request: HyperliquidExchangeRequest;
  response: HyperliquidExchangeResponse;
  dryRun: boolean;
  sessionKeyAddress?: string;
}

/** Thrown when pre-trade Pgate / soil validation fails before HTTP POST. */
export class PreTradeValidationError extends Error {
  readonly code = "PRE_TRADE_VALIDATION_FAILED" as const;
  readonly httpStatus = 422 as const;
  readonly reasons: string[];

  constructor(message: string, reasons: string[]) {
    super(message);
    this.name = "PreTradeValidationError";
    this.reasons = reasons;
  }
}

/** Thrown when Hyperliquid exchange API rejects or rate-limits a request. */
export class HyperliquidExecutionError extends Error {
  readonly code: "RATE_LIMIT" | "EXECUTION_REJECT" | "HTTP_ERROR" | "INVALID_RESPONSE";
  readonly httpStatus: number;
  readonly body?: unknown;

  constructor(
    message: string,
    code: HyperliquidExecutionError["code"],
    httpStatus: number,
    body?: unknown,
  ) {
    super(message);
    this.name = "HyperliquidExecutionError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.body = body;
  }
}

/** Convenience: bind an approved session-key agent from auth.ts */
export function sessionKeyFromAgentResult(
  result: SessionKeyAgentResult,
  vaultAddress?: string,
): SessionKeyContext {
  return {
    agentAddress: result.agentAddress,
    expiresAt: result.expiresAt,
    vaultAddress,
  };
}
