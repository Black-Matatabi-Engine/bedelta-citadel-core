/**
 * SPDX-License-Identifier: Apache-2.0
 * EIP-5792 wallet_sendCalls — unfold calls[] into send-tx risk (one INTENT_RING attempt).
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

const SKIP_OPTS = { skipTransport: true, skipIntentGate: true } as const;
const TX_PARAMS: [unknown] = [null];

type TxEnv = { to?: string; data?: string; value?: string };

function asTx(call: unknown): TxEnv | null {
  if (!call || typeof call !== "object") return null;
  return call as TxEnv;
}

/** Parse EIP-5792 `wallet_sendCalls` params[0].calls into tx envelopes. */
export function parseWalletSendCalls(params: unknown[]): TxEnv[] | null {
  const body = params[0];
  if (!body || typeof body !== "object") return null;
  const calls = (body as { calls?: unknown }).calls;
  if (!Array.isArray(calls)) return null;
  if (calls.length === 0) return [];
  const out: TxEnv[] = new Array(calls.length);
  for (let i = 0; i < calls.length; i++) {
    const tx = asTx(calls[i]);
    if (!tx) return null;
    out[i] = tx;
  }
  return out;
}

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
    const tx = calls[i]!;
    TX_PARAMS[0] = tx;
    const reject = evaluateRetailRisk(config, "eth_sendTransaction", TX_PARAMS, SKIP_OPTS);
    if (reject) return reject;
    venueBits |= resolveVenueBitFromContract(tx.to, config.contractVenueIndex);
  }
  return evaluateRetailIntentGate(config, venueBits);
}
