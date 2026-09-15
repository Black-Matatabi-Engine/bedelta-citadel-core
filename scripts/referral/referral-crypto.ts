/** HMAC-SHA256 referral mint/verify — CLI / Node only (not Worker hot path). */
import { createHmac, randomBytes } from "node:crypto";
import {
  buildReferralHookInUrl,
  formatReferralCode,
  parseReferralCode,
  resolvePaymasterSlot,
  resolveWhitelistRoute,
} from "../../src/sdk/exomesh-agentic-wallet-guard/referral-code";
import type { ReferralRecord } from "./referral-types";

const DEV_SEED = "slivervine-referral-dev-seed";

export function resolveReferralHmacSecret(): string {
  return process.env.SLIVERVINE_REFERRAL_HMAC_SECRET?.trim() || DEV_SEED;
}

export function signReferralPayload(agentId: string, unixMs: number, nonce: string, secret: string): string {
  return createHmac("sha256", secret).update(`${agentId}|${unixMs}|${nonce}`, "utf8").digest("hex");
}

export function mintReferralRecord(agentId: string, nowMs = Date.now(), nonce = randomBytes(8).toString("hex")): ReferralRecord {
  const secret = resolveReferralHmacSecret();
  const sig = signReferralPayload(agentId, nowMs, nonce, secret);
  const hash = sig.slice(0, 16);
  const code = formatReferralCode(nowMs, hash);
  return {
    code,
    agentId,
    issuedAt: new Date(nowMs).toISOString(),
    unixMs: nowMs,
    nonceHex: nonce,
    signatureHex: sig,
    whitelistPriorityRoute: resolveWhitelistRoute(hash),
    zerodevPaymasterSlot: resolvePaymasterSlot(hash),
    hookInUrl: buildReferralHookInUrl(code),
    hookIns: [],
  };
}

export function verifyReferralRecord(record: ReferralRecord): boolean {
  const parsed = parseReferralCode(record.code);
  if (!parsed || parsed.unixMs !== record.unixMs) return false;
  const secret = resolveReferralHmacSecret();
  const sig = signReferralPayload(record.agentId, record.unixMs, record.nonceHex, secret);
  return sig === record.signatureHex && sig.slice(0, 16) === parsed.hash;
}
