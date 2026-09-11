/**
 * SPDX-License-Identifier: Apache-2.0
 * EIP-5792 wallet_sendCalls — unfold calls[] into eth_sendTransaction risk (one attempt).
 */
import { evaluateRetailIntentGate, evaluateRpcTransportProtocol, resolveVenueBitFromContract } from "./guard-engine";
import { evaluateRetailRisk } from "./risk-evaluator";
import type { RetailGuardConfig, RetailGuardRejectPayload } from "./types";

export const EIP5792_WALLET_SEND_CALLS = "wallet_sendCalls";

const EMPTY_BATCH: RetailGuardRejectPayload = {
  code: "SEND_CALLS_BATCH_REJECTED",
  message: "SEND_CALLS_BATCH_REJECTED:empty_or_malformed_calls",
  plainTextWarning:
    "ALERT: EIP-5792 wallet_sendCalls batch rejected — empty or malformed calls[] (0-Gas pre-broadcast guard).",
};

function asTx(call: unknown): { to?: string; data?: string; value?: string } | null {
  if (!call || typeof call !== "object") return null;
  const rec = call as { to?: string; data?: string; value?: string };
  return { to: rec.to, data: rec.data, value: rec.value };
}

/** Parse EIP-5792 `wallet_sendCalls` params[0].calls into tx envelopes. */
export function parseWalletSendCalls(params: unknown[]): { to?: string; data?: string; value?: string }[] | null {
  const body = params[0];
  if (!body || typeof body !== "object") return null;
  const calls = (body as { calls?: unknown }).calls;
  if (!Array.isArray(calls)) return null;
  const out: { to?: string; data?: string; value?: string }[] = [];
  for (let i = 0; i < calls.length; i++) {
    const tx = asTx(calls[i]);
    if (!tx) return null;
    out.push(tx);
  }
  return out;
}

/**
 * Fail-closed: empty/malformed batch rejected.
 * Per-call approve/venue/soil; intent ring increments once for the whole batch.
 */
export function evaluateEip5792WalletSendCalls(
  config: RetailGuardConfig,
  params: unknown[],
): RetailGuardRejectPayload | null {
  const calls = parseWalletSendCalls(params);
  if (!calls || calls.length === 0) return EMPTY_BATCH;

  const transport = evaluateRpcTransportProtocol(config);
  if (transport) return transport;

  let venueBits = 0;
  for (let i = 0; i < calls.length; i++) {
    const tx = calls[i];
    const reject = evaluateRetailRisk(config, "eth_sendTransaction", [tx], {
      skipTransport: true,
      skipIntentGate: true,
    });
    if (reject) return reject;
    venueBits |= resolveVenueBitFromContract(tx.to, config.contractVenueIndex);
  }
  return evaluateRetailIntentGate(config, venueBits);
}
