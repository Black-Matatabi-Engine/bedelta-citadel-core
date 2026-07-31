/**
 * Hyperliquid Session Key execution guard — Workers-safe signing pipeline stub.
 * Zero ethers/msgpack on hot path · SystemState physical gate · EIP-712 payload ready.
 */

import {
  R20_LOCKED,
  isR20Locked,
  readActiveSystemState,
  updateSystemState,
  type SystemState,
} from "../core/state";
import { vineWrapProtection } from "../core/risk";
import { assertVineShield, type VineShieldOrder } from "./fool-proof-guard";

/** Hyperliquid L1 phantom-agent chain id (EIP-712 stub) */
export const HL_L1_CHAIN_ID = 1337;

/** Session-key agent label — matches hl/auth.ts delegation envelope */
export const HL_SESSION_KEY_AGENT_NAME = "BeDeltaSessionKey" as const;

export type SessionKeyOrderTif = "Gtc" | "Ioc" | "Alo";

export type SessionKeyOrderType =
  | { limit: { tif: SessionKeyOrderTif } }
  | { trigger: { triggerPx: string; isMarket: boolean; tpsl: "tp" | "sl" } };

export interface SessionKeyOrderPayload {
  asset: number;
  isBuy: boolean;
  limitPx: string;
  sz: string;
  reduceOnly: boolean;
  orderType: SessionKeyOrderType;
}

export interface SigningResult {
  success: boolean;
  signatureHash: string | null;
  errorReason: string | null;
}

/** EIP-712 stub envelope for HyperEVM Session Key signing pipeline */
export interface SessionKeyEip712Stub {
  domain: {
    name: "Exchange";
    version: "1";
    chainId: number;
    verifyingContract: string;
  };
  types: {
    Agent: Array<{ name: string; type: string }>;
  };
  message: {
    source: string;
    connectionId: string;
    action: {
      type: "order";
      orders: Array<{
        a: number;
        b: boolean;
        p: string;
        s: string;
        r: boolean;
        t: SessionKeyOrderType;
      }>;
      grouping: "na";
    };
    nonce: number;
    agentName: typeof HL_SESSION_KEY_AGENT_NAME;
  };
}

export interface SignAndExecuteOptions {
  systemState?: SystemState;
  /** Max open notional per asset (defaults to account balance) */
  maxPositionUsd?: number;
  nonce?: number;
  dryRun?: boolean;
  leverage?: number;
  contractTarget?: string;
  profile?: "retail" | "institutional";
}

export class DefenseMatrixError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly reasons: string[];

  constructor(
    code: string,
    message: string,
    reasons: string[] = [],
    httpStatus = 403,
  ) {
    super(message);
    this.name = "DefenseMatrixError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.reasons = reasons;
  }
}

function resolveOrderNotionalUsd(payload: SessionKeyOrderPayload): number {
  const px = Number(payload.limitPx);
  const sz = Number(payload.sz);
  if (!Number.isFinite(px) || !Number.isFinite(sz) || px <= 0 || sz <= 0) {
    throw new DefenseMatrixError(
      "SESSION_KEY_INVALID_ORDER",
      "Invalid Session Key order notional — limitPx and sz must be positive",
      [`limitPx=${payload.limitPx}`, `sz=${payload.sz}`],
      422,
    );
  }
  return px * sz;
}

/** Derived R20 lock flag — mirrors telemetry `circuitBreakers.r20Locked`. */
export function resolveR20Locked(state: SystemState): boolean {
  return isR20Locked(state);
}

/** Immediately sever the Session Key signing channel (physical hardlock). */
export function severSigningChannel(): SystemState {
  return updateSystemState({
    patch: {
      signingChannelOpen: false,
      hardlock: true,
      currentCri: 0,
      hudState: "BLOCKED",
    },
  });
}

function interceptAndSever(reasons: string[]): never {
  severSigningChannel();
  throw new DefenseMatrixError(
    "SESSION_KEY_HARDLOCK_INTERCEPTED",
    "Session Key hardlock intercepted — signing channel severed",
    reasons,
    403,
  );
}


/** Pre-flight physical gates for Session Key order signing. */
export function assertSessionKeyExecutionGates(
  payload: SessionKeyOrderPayload,
  state: SystemState,
  maxPositionUsd?: number,
  foolProof?: Pick<
    VineShieldOrder,
    "leverage" | "contractTarget" | "profile"
  >,
): number {
  const reasons: string[] = [];

  if (state.signingChannelOpen !== true) {
    reasons.push("signingChannelOpen=false");
  }

  if (resolveR20Locked(state)) {
    reasons.push(`${R20_LOCKED}=true`);
    reasons.push(`hardlock=${state.hardlock}`);
    reasons.push(`currentCri=${state.currentCri}`);
  }

  if (reasons.length > 0) {
    interceptAndSever(reasons);
  }

  const orderNotionalUsd = resolveOrderNotionalUsd(payload);

  try {
    assertVineShield({
      order: {
        positionValueUsd: orderNotionalUsd,
        reduceOnly: payload.reduceOnly,
        leverage: foolProof?.leverage,
        contractTarget: foolProof?.contractTarget,
        profile: foolProof?.profile,
      },
      accountBalanceUsd: state.accountBalanceUsd,
    });
  } catch (err) {
    interceptAndSever([
      err instanceof Error ? err.message : String(err),
    ]);
  }

  const dynamicMaxSlUsd = state.dynamicMaxSL;
  const positionCap = maxPositionUsd ?? state.accountBalanceUsd;

  if (orderNotionalUsd > dynamicMaxSlUsd) {
    interceptAndSever([
      `ORDER_NOTIONAL=${orderNotionalUsd.toFixed(2)}>dynamicMaxSlUsd=${dynamicMaxSlUsd.toFixed(2)}`,
    ]);
  }

  if (!payload.reduceOnly && orderNotionalUsd > positionCap) {
    interceptAndSever([
      `POSITION_LIMIT=${orderNotionalUsd.toFixed(2)}>maxPositionUsd=${positionCap.toFixed(2)}`,
    ]);
  }

  try {
    vineWrapProtection({
      symbol: `HL_ASSET_${payload.asset}`,
      estimatedLossUsd: orderNotionalUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock,
      maxLossLimit: dynamicMaxSlUsd,
    });
  } catch (err) {
    interceptAndSever([
      err instanceof Error ? err.message : String(err),
    ]);
  }

  return orderNotionalUsd;
}
 
/** Build Hyperliquid Session Key EIP-712 stub (no ethers — Workers-safe). */
export function buildSessionKeyEip712Stub(
  payload: SessionKeyOrderPayload,
  nonce: number,
  connectionId: string,
  isTestnet = false,
): SessionKeyEip712Stub {
  return {
    domain: {
      name: "Exchange",
      version: "1",
      chainId: HL_L1_CHAIN_ID,
      verifyingContract: "0x0000000000000000000000000000000000000000",
    },
    types: {
      Agent: [
        { name: "source", type: "string" },
        { name: "connectionId", type: "bytes32" },
      ],
    },
    message: {
      source: isTestnet ? "b" : "a",
      connectionId,
      action: {
        type: "order",
        orders: [
          {
            a: payload.asset,
            b: payload.isBuy,
            p: payload.limitPx,
            s: payload.sz,
            r: payload.reduceOnly,
            t: payload.orderType,
          },
        ],
        grouping: "na",
      },
      nonce,
      agentName: HL_SESSION_KEY_AGENT_NAME,
    },
  };
}

/** Deterministic stub signature hash — replace with external signer in production. */
export async function stubSignSessionKeyPayload(
  eip712: SessionKeyEip712Stub,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(eip712)),
  );
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
}


/**
 * Workers-native SHA-256 builder for authentic 32-byte Hex ConnectionId
 */
export async function buildConnectionId(
  payload: SessionKeyOrderPayload,
  nonce: number,
): Promise<string> {
  const seed = `${payload.asset}:${payload.limitPx}:${payload.sz}:${payload.reduceOnly}:${nonce}`;
  const msgUint8 = new TextEncoder().encode(seed);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `0x${hex}`;
}
/**
 * Sign and execute (stub) a Hyperliquid Session Key order.
 * Physical gates run first; any trip severs the signing channel immediately.
 */
export async function signAndExecuteOrder(
  payload: SessionKeyOrderPayload,
  options: SignAndExecuteOptions = {},
): Promise<SigningResult> {
  const state = options.systemState ?? readActiveSystemState();

  try {
    assertSessionKeyExecutionGates(
      payload,
      state,
      options.maxPositionUsd,
      {
        leverage: options.leverage,
        contractTarget: options.contractTarget,
        profile: options.profile,
      },
    );

    const nonce = options.nonce ?? Date.now();
    const connectionId = await buildConnectionId(payload, nonce);
    const eip712 = buildSessionKeyEip712Stub(payload, nonce, connectionId);

    if (options.dryRun) {
      return {
        success: true,
        signatureHash: null,
        errorReason: null,
      };
    }

    const signatureHash = await stubSignSessionKeyPayload(eip712);

    return {
      success: true,
      signatureHash,
      errorReason: null,
    };
  } catch (err) {
    if (err instanceof DefenseMatrixError) {
      throw err;
    }

    severSigningChannel();
    throw new DefenseMatrixError(
      "SESSION_KEY_HARDLOCK_INTERCEPTED",
      err instanceof Error ? err.message : String(err),
      [],
      403,
    );
  }
}
