/**
 * Agentic referral code format — Edge-safe parse/format (no Wasm, no Node HMAC).
 * Code shape: `SV-REF-<unixMs>-<hash>` (hash = 16 lowercase hex).
 */
export const REFERRAL_CODE_PREFIX = "SV-REF" as const;
export const REFERRAL_HASH_LEN = 16;
export const REFERRAL_PAYMASTER_SLOT_COUNT = 8;
export const REFERRAL_WHITELIST_ROUTES = [
  "zerodev-paymaster-priority",
  "eip1193-retail-guard",
  "kernel-v3-session",
] as const;

export type ReferralWhitelistRoute = (typeof REFERRAL_WHITELIST_ROUTES)[number];

const CODE_RE = /^SV-REF-(\d+)-([0-9a-f]{16})$/;

export function formatReferralCode(unixMs: number, hash16: string): string {
  const h = hash16.replace(/[^0-9a-f]/gi, "").toLowerCase().slice(0, REFERRAL_HASH_LEN);
  return `${REFERRAL_CODE_PREFIX}-${unixMs}-${h.padEnd(REFERRAL_HASH_LEN, "0")}`;
}

export function parseReferralCode(
  code: string,
): { unixMs: number; hash: string } | null {
  const m = CODE_RE.exec(code.trim());
  if (!m) return null;
  return { unixMs: Number(m[1]), hash: m[2] };
}

export function resolveWhitelistRoute(hash: string): ReferralWhitelistRoute {
  const n = Number.parseInt(hash.slice(2, 4) || "0", 16);
  return REFERRAL_WHITELIST_ROUTES[n % REFERRAL_WHITELIST_ROUTES.length]!;
}

export function resolvePaymasterSlot(hash: string): number {
  const n = Number.parseInt(hash.slice(0, 2) || "0", 16);
  return n % REFERRAL_PAYMASTER_SLOT_COUNT;
}

export function buildReferralHookInUrl(code: string): string {
  return `https://slivervine.xyz/agentic?ref=${encodeURIComponent(code)}`;
}
