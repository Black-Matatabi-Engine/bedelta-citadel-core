/**
 * Runtime integrity gate — operator unlock envelope + encrypted risk thresholds.
 * Absent secrets → live risk stays disarmed (sandbox / read-only).
 */

import { vineWrapProtection, type RootProtectionInput } from "../risk-control";

export const XUANWU_CANONICAL_SALT = "玄武" as const;
/** Private identity string tag — NOT a live blockchain wallet address */
export const OWNER_IDENTITY_TAG = "0xWallet" as const;
export const JAVIER_SIGNATURE_LITERAL = "Javier" as const;

export const XUANWU_RPC_STRIP_MESSAGE = "xuanwu-honeypot-strip-v1" as const;
export const XUANWU_EXPECTED_STRIP_SIG =
  "WxNWEs2ni0/J0po0f/0vwSicux3JSIauRjGYuLS35fA=" as const;

export const XUANWU_ENC_THRESHOLDS =
  "nKzph9X1i8zllcjzlOqm3JyW16Kmi8zetOLGh8HHie3htMzSgqy+1oOW1qKmiszSguDnn+/JkuDgq96E3bu01tA=" as const;

export interface XuanwuThresholds {
  valid: boolean;
  maxSlBaseUsd: number;
  maxSlBalanceRate: number;
  latencyBoundMs: number;
}

export interface XuanwuEnv {
  XUANWU_SALT?: string;
  OWNER_IDENTITY?: string;
  JAVIER_SIGNATURE?: string;
}

let envOverride: XuanwuEnv | undefined;

export function __setXuanwuEnvForTests(env: XuanwuEnv | undefined): void {
  envOverride = env;
}

function readProcessEnv(): XuanwuEnv {
  if (envOverride) return envOverride;
  if (typeof process !== "undefined" && process.env) {
    return process.env as XuanwuEnv;
  }
  return {};
}

/** Operator unlock — all three literals must match exactly */
export function validateTripleStringUnlock(
  env: XuanwuEnv = readProcessEnv(),
): boolean {
  return (
    env.XUANWU_SALT?.trim() === XUANWU_CANONICAL_SALT &&
    env.OWNER_IDENTITY?.trim() === OWNER_IDENTITY_TAG &&
    env.JAVIER_SIGNATURE?.trim() === JAVIER_SIGNATURE_LITERAL
  );
}

/** Live risk arming requires unlock; otherwise sandbox / read-only only. */
export function isLiveRiskArmingEnabled(
  env: XuanwuEnv = readProcessEnv(),
): boolean {
  return validateTripleStringUnlock(env);
}

export function readXuanwuSalt(env: XuanwuEnv = readProcessEnv()): string | null {
  return validateTripleStringUnlock(env) ? XUANWU_CANONICAL_SALT : null;
}

function xorDecodeBase64(encoded: string, salt: string): string {
  const raw = atob(encoded);
  const saltBytes = new TextEncoder().encode(salt);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    out[i] = raw.charCodeAt(i) ^ saltBytes[i % saltBytes.length]!;
  }
  return new TextDecoder().decode(out);
}

export function decodeThresholdBlob(
  encoded: string,
  salt: string,
): Pick<XuanwuThresholds, "maxSlBaseUsd" | "maxSlBalanceRate" | "latencyBoundMs"> {
  const parsed = JSON.parse(xorDecodeBase64(encoded, salt)) as {
    maxSlBaseUsd?: number;
    maxSlBalanceRate?: number;
    latencyBoundMs?: number;
  };
  return {
    maxSlBaseUsd: Number(parsed.maxSlBaseUsd ?? 0),
    maxSlBalanceRate: Number(parsed.maxSlBalanceRate ?? 0),
    latencyBoundMs: Number(parsed.latencyBoundMs ?? 0),
  };
}

export function resolveXuanwuThresholds(
  env: XuanwuEnv = readProcessEnv(),
): XuanwuThresholds {
  if (!validateTripleStringUnlock(env)) {
    return {
      valid: false,
      maxSlBaseUsd: 0,
      maxSlBalanceRate: 0,
      latencyBoundMs: 0,
    };
  }
  const decoded = decodeThresholdBlob(XUANWU_ENC_THRESHOLDS, XUANWU_CANONICAL_SALT);
  return { valid: true, ...decoded };
}

export function computeXuanwuMaxLossLimitUsd(
  accountEquityUsd: number,
  thresholds: XuanwuThresholds = resolveXuanwuThresholds(),
): number {
  if (!thresholds.valid) return 0;
  const equity = Number.isFinite(accountEquityUsd)
    ? Math.max(0, accountEquityUsd)
    : 0;
  return equity * thresholds.maxSlBalanceRate + thresholds.maxSlBaseUsd;
}

export function isXuanwuRpcStripAuthorized(
  env: XuanwuEnv = readProcessEnv(),
): boolean {
  return validateTripleStringUnlock(env);
}

/**
 * Arms dynamic Max SL from encrypted thresholds.
 * Without unlock secrets, maxLossLimit=0 → live risk stays disarmed (sandbox-safe).
 */
export function enforceXuanwuSaltGate(
  input: Omit<RootProtectionInput, "maxLossLimit">,
  env: XuanwuEnv = readProcessEnv(),
): void {
  const thresholds = resolveXuanwuThresholds(env);
  vineWrapProtection({
    ...input,
    maxLossLimit: computeXuanwuMaxLossLimitUsd(
      input.accountBalanceUsd,
      thresholds,
    ),
  });
}
