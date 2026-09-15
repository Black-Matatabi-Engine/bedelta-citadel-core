/** Local persistence schema for agentic referral telemetry. */
import type { ReferralWhitelistRoute } from "../../src/sdk/exomesh-agentic-wallet-guard/referral-code";

export interface ReferralHookIn {
  at: string;
  source: string;
}

export interface ReferralRecord {
  code: string;
  agentId: string;
  issuedAt: string;
  unixMs: number;
  nonceHex: string;
  signatureHex: string;
  whitelistPriorityRoute: ReferralWhitelistRoute;
  zerodevPaymasterSlot: number;
  hookInUrl: string;
  hookIns: ReferralHookIn[];
}

export interface ReferralMetricsFile {
  schema: "silvervine.agentic-referral.metrics.v1";
  updatedAt: string;
  chainId: 42161;
  totals: {
    issued: number;
    hookIns: number;
    paymasterSlotsAllocated: number;
  };
  records: ReferralRecord[];
}

export interface ReferralGenResult {
  code: string;
  agentId: string;
  hookInUrl: string;
  whitelistPriorityRoute: ReferralWhitelistRoute;
  zerodevPaymasterSlot: number;
  signatureAlg: "HMAC-SHA256";
  signatureHex: string;
  totals: ReferralMetricsFile["totals"];
}
