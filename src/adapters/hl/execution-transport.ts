/**
 * Hyperliquid signed L1 action transport — Workers-safe native fetch.
 */

import {
  SigningChannelLockedError,
  signHyperliquidAction,
  splitHyperliquidSignature,
  verifySessionKeyValidity,
  generateUniqueNonce,
  type SigningGateInput,
} from "./auth";
import { checkSoilResistanceWithVine } from "../../services/risk-control";
import { HL_EXCHANGE_URL } from "../../config/constants";
import {
  HyperliquidExecutionError,
  PreTradeValidationError,
  type ExecutionContext,
  type ExecutionResult,
  type HlOrderWire,
  type HyperliquidExchangeRequest,
  type HyperliquidExchangeResponse,
  type PreTradeValidationInput,
  type SessionKeyContext,
} from "./execution-types";
import { assertPreTradeValidation } from "./execution-wire";

function resolveSigningGate(
  gate: SigningGateInput | undefined,
  soilTripped: boolean,
): SigningGateInput {
  return {
    ...gate,
    soilResistanceTripped: gate?.soilResistanceTripped ?? soilTripped,
  };
}

function assertSessionKey(sessionKey?: SessionKeyContext): void {
  if (!sessionKey) return;
  if (!verifySessionKeyValidity(sessionKey.agentAddress, sessionKey.expiresAt)) {
    throw new SigningChannelLockedError(
      "Session key expired or invalid — agent authorization rejected",
      "SIGNING_CHANNEL_CLOSED",
    );
  }
}

function isOpeningOrderAction(action: Record<string, unknown>): boolean {
  if (action.type !== "order") return false;
  const orders = action.orders;
  if (!Array.isArray(orders)) return false;
  return orders.some((order) => {
    if (!order || typeof order !== "object") return false;
    return (order as HlOrderWire).r !== true;
  });
}

async function parseResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HyperliquidExecutionError(
      "Invalid JSON response from Hyperliquid exchange",
      "INVALID_RESPONSE",
      res.status,
      text,
    );
  }
}

export async function postExchangeRequest(
  request: HyperliquidExchangeRequest,
  fetchFn: typeof fetch = fetch,
  exchangeUrl: string = HL_EXCHANGE_URL,
): Promise<HyperliquidExchangeResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (request.vaultAddress) {
    headers["X-HL-Vault-Address"] = request.vaultAddress;
  }

  const res = await fetchFn(exchangeUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  const body = await parseResponseBody(res);

  if (res.status === 429) {
    throw new HyperliquidExecutionError(
      "Hyperliquid exchange rate limit exceeded",
      "RATE_LIMIT",
      429,
      body,
    );
  }

  if (!res.ok) {
    throw new HyperliquidExecutionError(
      `Hyperliquid exchange HTTP ${res.status}`,
      "HTTP_ERROR",
      res.status,
      body,
    );
  }

  const parsed = body as HyperliquidExchangeResponse;
  if (parsed.status && parsed.status !== "ok") {
    throw new HyperliquidExecutionError(
      "Hyperliquid execution rejected",
      "EXECUTION_REJECT",
      res.status,
      body,
    );
  }

  return parsed;
}

/**
 * Sign and POST a Hyperliquid L1 action to the exchange endpoint.
 * @see assertPreTradeValidation — Pgate + soil pre-flight.
 * @see auth.ts — signHyperliquidAction / session-key gate.
 */
export async function executeSignedAction(
  action: Record<string, unknown>,
  ctx: ExecutionContext,
  options: {
    nonce?: number;
    preTrade?: PreTradeValidationInput;
    skipPreTrade?: boolean;
  } = {},
): Promise<ExecutionResult> {
  const nonce = options.nonce ?? generateUniqueNonce();
  const fetchFn = ctx.fetchFn ?? fetch;
  const exchangeUrl = ctx.exchangeUrl ?? HL_EXCHANGE_URL;

  assertSessionKey(ctx.sessionKey);

  if (ctx.gate?.soilResistanceTripped || ctx.gate?.signingChannelOpen === false) {
    throw new SigningChannelLockedError(
      "[CIRCUIT_BREAKER] Physical deadlock active — Hotkey signing channel fully terminated",
      "SIGNING_CHANNEL_CLOSED",
    );
  }

  const isOpening = isOpeningOrderAction(action);

  if (!options.skipPreTrade && isOpening) {
    if (!options.preTrade) {
      throw new PreTradeValidationError(
        "Pre-trade validation bypassed — opening order missing preTrade verification input",
        ["MISSING_PRE_TRADE_INPUT"],
      );
    }
    assertPreTradeValidation(options.preTrade);
  }

  const soilTripped = options.preTrade
    ? checkSoilResistanceWithVine(options.preTrade).tripped
    : (ctx.gate?.soilResistanceTripped ?? false);

  const gate = resolveSigningGate(ctx.gate, soilTripped);

  const signatureHex = await signHyperliquidAction(ctx.signer, action, nonce, {
    isTestnet: ctx.isTestnet,
    vaultAddress: ctx.sessionKey?.vaultAddress,
    gate,
  });

  const request: HyperliquidExchangeRequest = {
    action,
    nonce,
    signature: splitHyperliquidSignature(signatureHex),
  };

  if (ctx.sessionKey?.vaultAddress) {
    request.vaultAddress = ctx.sessionKey.vaultAddress;
  }

  if (ctx.dryRun) {
    return {
      request,
      response: { status: "dry_run" },
      dryRun: true,
      sessionKeyAddress: ctx.sessionKey?.agentAddress,
    };
  }

  const response = await postExchangeRequest(request, fetchFn, exchangeUrl);

  return {
    request,
    response,
    dryRun: false,
    sessionKeyAddress: ctx.sessionKey?.agentAddress,
  };
}
