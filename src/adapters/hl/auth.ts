/**
 * Hyperliquid L1 authentication — EIP-712 signing for exchange actions,
 * session-key (agent) delegation, and agent authorization.
 *
 * Hashing uses Workers-safe @noble/hashes; signing accepts injectable Eip712Signer.
 */

import { encode as encodeMsgpack } from "@msgpack/msgpack";
import { HardlockError } from "../../services/risk-control";
import {
  concatBytes,
  getAddressBytes,
  keccak256Hex,
  normalizeAddress,
  toUint64Bytes,
} from "./crypto";
import type { Eip712Domain, Eip712Signer, Eip712TypedField } from "./eip712-signer";

export { splitHyperliquidSignature } from "./crypto";
export type { Eip712Signer } from "./eip712-signer";

/** Hyperliquid verifying contract placeholder (always zero address) */
export const HL_ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

/** L1 phantom-agent domain chain id — fixed by Hyperliquid, not wallet network */
export const HL_L1_CHAIN_ID = 1337;

/** Default user-signed chain id (Arbitrum Sepolia) used for wallet EIP-712 signing */
export const HL_USER_SIGNED_CHAIN_ID = "0x66eee" as const;

/** EIP-712 domain for L1 exchange actions (phantom Agent) */
export const HL_EXCHANGE_DOMAIN: Eip712Domain = {
  name: "Exchange",
  version: "1",
  chainId: HL_L1_CHAIN_ID,
  verifyingContract: HL_ZERO_ADDRESS,
};

/** Phantom Agent typed data for L1 exchange actions */
export const HL_AGENT_TYPES: Record<string, Eip712TypedField[]> = {
  Agent: [
    { name: "source", type: "string" },
    { name: "connectionId", type: "bytes32" },
  ],
};

/** User-signed domain builder — chainId parsed from action.signatureChainId */
export function buildUserSignedDomain(signatureChainId: string): Eip712Domain {
  return {
    name: "HyperliquidSignTransaction",
    version: "1",
    chainId: Number.parseInt(signatureChainId, 16),
    verifyingContract: HL_ZERO_ADDRESS,
  };
}

/** Agent authorization (approveAgent) — master wallet authorizes session-key agent */
export const HL_APPROVE_AGENT_TYPES: Record<string, Eip712TypedField[]> = {
  "HyperliquidTransaction:ApproveAgent": [
    { name: "hyperliquidChain", type: "string" },
    { name: "agentAddress", type: "address" },
    { name: "agentName", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
};

/** Session-key delegation uses the same ApproveAgent envelope with a fixed agent name */
export const HL_SESSION_KEY_AGENT_NAME = "BeDeltaSessionKey" as const;

export const HL_SESSION_KEY_DELEGATION_TYPES = HL_APPROVE_AGENT_TYPES;

export type HyperliquidChain = "Mainnet" | "Testnet";

export interface SigningGateInput {
  hardlock?: boolean;
  signingChannelOpen?: boolean;
  criHardlock?: boolean;
  soilResistanceTripped?: boolean;
  symbol?: string;
}

export interface SignHyperliquidActionOptions {
  isTestnet?: boolean;
  vaultAddress?: string;
  expiresAfter?: number;
  gate?: SigningGateInput;
}

export interface SessionKeyAgentResult {
  action: ApproveAgentAction;
  signature: string;
  agentAddress: string;
  expiresAt: number;
  nonce: number;
  hyperliquidChain: HyperliquidChain;
}

export interface ApproveAgentAction {
  type: "approveAgent";
  signatureChainId: typeof HL_USER_SIGNED_CHAIN_ID;
  hyperliquidChain: HyperliquidChain;
  agentAddress: string;
  agentName: string;
  nonce: number;
}

export class SigningChannelLockedError extends Error {
  readonly code = "SIGNING_CHANNEL_LOCKED" as const;
  readonly httpStatus = 403 as const;
  readonly reason:
    | "HARDLOCK"
    | "SOIL_RESISTANCE"
    | "SIGNING_CHANNEL_CLOSED";

  constructor(
    message: string,
    reason: SigningChannelLockedError["reason"],
  ) {
    super(message);
    this.name = "SigningChannelLockedError";
    this.reason = reason;
  }
}

export function isSigningChannelLocked(gate: SigningGateInput = {}): boolean {
  if (gate.soilResistanceTripped) return true;
  if (gate.hardlock || gate.criHardlock) return true;
  if (gate.signingChannelOpen === false) return true;
  return false;
}

export function assertSigningChannelOpen(gate: SigningGateInput = {}): void {
  const symbol = gate.symbol ?? "HL_AUTH";

  if (gate.soilResistanceTripped) {
    throw new SigningChannelLockedError(
      "checkSoilResistance() trip — signing channel blocked (ping/depth/slippage fuse)",
      "SOIL_RESISTANCE",
    );
  }

  if (gate.hardlock || gate.criHardlock) {
    throw new HardlockError(
      "vineWrapProtection() hardlock — Session Key signing channel severed (R17/R20)",
      {
        level: "error",
        module: "risk-control",
        event: "CRI_HARDLOCK",
        symbol,
        timestamp: new Date().toISOString(),
        message: "Signing blocked under R20 physical deadlock",
        details: { signingChannelOpen: false },
      },
    );
  }

  if (gate.signingChannelOpen === false) {
    throw new SigningChannelLockedError(
      "Signing channel closed — hardlock active",
      "SIGNING_CHANNEL_CLOSED",
    );
  }
}

type MsgpackValue =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | bigint
  | null;

function adjustForMsgpack(value: unknown): MsgpackValue {
  if (Array.isArray(value)) {
    return value.map(adjustForMsgpack);
  }
  if (typeof value === "object" && value !== null) {
    const result: Record<string, MsgpackValue> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) {
        result[key] = adjustForMsgpack(entry);
      }
    }
    return result;
  }
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    (value >= 0x1_0000_0000 || value < -0x8000_0000)
  ) {
    return BigInt(value);
  }
  return value as MsgpackValue;
}

let lastNonce = 0;
export function generateUniqueNonce(): number {
  const now = Date.now();
  if (now <= lastNonce) {
    lastNonce += 1;
    return lastNonce;
  }
  lastNonce = now;
  return lastNonce;
}

export function createL1ActionHash(args: {
  action: Record<string, unknown> | unknown[];
  nonce: number;
  vaultAddress?: string;
  expiresAfter?: number;
}): string {
  const { action, nonce, vaultAddress, expiresAfter } = args;

  const actionBytes = encodeMsgpack(adjustForMsgpack(action));
  const nonceBytes = toUint64Bytes(nonce);

  const vaultMarker = vaultAddress ? new Uint8Array([1]) : new Uint8Array([0]);
  const vaultBytes = vaultAddress ? getAddressBytes(vaultAddress) : new Uint8Array();
  const expiresMarker =
    expiresAfter !== undefined ? new Uint8Array([0]) : new Uint8Array();
  const expiresBytes =
    expiresAfter !== undefined ? toUint64Bytes(expiresAfter) : new Uint8Array();

  const packed = concatBytes(
    actionBytes,
    nonceBytes,
    vaultMarker,
    vaultBytes,
    expiresMarker,
    expiresBytes,
  );

  return keccak256Hex(packed);
}

export function verifySessionKeyValidity(
  sessionKeyAddress: string,
  expiresAt: number,
  nowMs: number = Date.now(),
  clockDriftBufferMs = 5_000,
): boolean {
  if (!Number.isFinite(expiresAt) || expiresAt - clockDriftBufferMs <= nowMs) {
    return false;
  }
  try {
    normalizeAddress(sessionKeyAddress);
    return true;
  } catch {
    return false;
  }
}

export function buildExchangeAgentMessage(args: {
  action: Record<string, unknown> | unknown[];
  nonce: number;
  isTestnet?: boolean;
  vaultAddress?: string;
  expiresAfter?: number;
}): { source: string; connectionId: string } {
  return {
    source: args.isTestnet ? "b" : "a",
    connectionId: createL1ActionHash(args),
  };
}

export async function signHyperliquidAction(
  signer: Eip712Signer,
  action: object,
  nonce: number,
  options: SignHyperliquidActionOptions = {},
): Promise<string> {
  assertSigningChannelOpen(options.gate);

  const agentMessage = buildExchangeAgentMessage({
    action: action as Record<string, unknown>,
    nonce,
    isTestnet: options.isTestnet,
    vaultAddress: options.vaultAddress,
    expiresAfter: options.expiresAfter,
  });

  return signer.signTypedData(HL_EXCHANGE_DOMAIN, HL_AGENT_TYPES, agentMessage);
}

export async function createSessionKeyAgent(
  masterSigner: Eip712Signer,
  agentAddress: string,
  durationMs: number,
  options: {
    isTestnet?: boolean;
    gate?: SigningGateInput;
    nonce?: number;
    agentName?: string;
  } = {},
): Promise<SessionKeyAgentResult> {
  assertSigningChannelOpen(options.gate);

  const normalizedAgent = normalizeAddress(agentAddress);
  const nonce = options.nonce ?? Date.now();
  const expiresAt = nonce + durationMs;
  const hyperliquidChain: HyperliquidChain = options.isTestnet
    ? "Testnet"
    : "Mainnet";

  const action: ApproveAgentAction = {
    type: "approveAgent",
    signatureChainId: HL_USER_SIGNED_CHAIN_ID,
    hyperliquidChain,
    agentAddress: normalizedAgent,
    agentName: options.agentName ?? HL_SESSION_KEY_AGENT_NAME,
    nonce,
  };

  const domain = buildUserSignedDomain(action.signatureChainId);
  const signature = await masterSigner.signTypedData(
    domain,
    HL_SESSION_KEY_DELEGATION_TYPES,
    action as unknown as Record<string, unknown>,
  );

  return {
    action,
    signature,
    agentAddress: normalizedAgent,
    expiresAt,
    nonce,
    hyperliquidChain,
  };
}
