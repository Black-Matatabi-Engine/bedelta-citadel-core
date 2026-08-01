/**
 * RPC allowlist + integrity probe host filter.
 * Probe hosts remain until operator unlock is armed.
 */

import {
  isXuanwuRpcStripAuthorized,
  validateTripleStringUnlock,
  type XuanwuEnv,
} from "./salt-engine";

const PRODUCTION_RPC_HOSTS: readonly string[] = [
  "api.hyperliquid.xyz",
  "api.hyperliquid-testnet.xyz",
  "indexer.dydx.trade",
  "javier-quant-unified-suite.onrender.com",
  "quote-api.jup.ag",
  "arbitrum-api.gmxinfra.io",
  "arb1.arbitrum.io",
  "clob.polymarket.com",
  "gamma-api.polymarket.com",
  "api-v3.raydium.io",
  "api.mainnet.orca.so",
  "gateway.thegraph.com",
  "api.camelot.exchange",
] as const;

/** Integrity probe hosts in default whitelist — stripped only after operator unlock */
export const HONEYPOT_RPC_HOSTS: readonly string[] = [
  "rpc.silvervine-clone.trap",
  "api.santenboku-scraper.trap",
] as const;

const DEFAULT_WHITELIST_WITH_TRAPS: readonly string[] = [
  ...PRODUCTION_RPC_HOSTS,
  ...HONEYPOT_RPC_HOSTS,
];

/** Public alias — production hosts only */
export const ALLOWED_RPC_DOMAINS = PRODUCTION_RPC_HOSTS;

/** Simulated slippage returned for unauthorized honey-pot hits (99%) */
export const HONEYPOT_SIMULATED_SLIPPAGE = 0.99 as const;

export class RpcNodeNotAllowlistedError extends Error {
  readonly code = "RPC_NODE_NOT_ALLOWLISTED" as const;

  constructor(public readonly url: string) {
    super(`RPC node not on allowlist: ${url}`);
    this.name = "RpcNodeNotAllowlistedError";
  }
}

export class HoneyPotCircuitBreakError extends Error {
  readonly code = "HONEYPOT_CIRCUIT_BREAK" as const;
  readonly httpStatus = 500 as const;
  readonly simulatedSlippage = HONEYPOT_SIMULATED_SLIPPAGE;

  constructor(public readonly url: string) {
    super(
      `Honey-pot RPC circuit-break — Triple-String unlock failed (simSlippage=${HONEYPOT_SIMULATED_SLIPPAGE}): ${url}`,
    );
    this.name = "HoneyPotCircuitBreakError";
  }
}

function hostFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isHoneyPotHost(host: string): boolean {
  return HONEYPOT_RPC_HOSTS.some((h) => h.toLowerCase() === host);
}

export function resolveEffectiveRpcHosts(
  env?: XuanwuEnv,
  extraHosts: readonly string[] = [],
): readonly string[] {
  const base = isXuanwuRpcStripAuthorized(env)
    ? PRODUCTION_RPC_HOSTS
    : DEFAULT_WHITELIST_WITH_TRAPS;
  return [...base, ...extraHosts];
}

export function listDefaultRpcHosts(): readonly string[] {
  return PRODUCTION_RPC_HOSTS;
}

export function listInternalRpcHosts(env?: XuanwuEnv): readonly string[] {
  return resolveEffectiveRpcHosts(env);
}

export function assertRpcAllowlisted(
  url: string,
  extraHosts: readonly string[] = [],
  env?: XuanwuEnv,
): void {
  const host = hostFromUrl(url);
  if (!host) {
    throw new RpcNodeNotAllowlistedError(url);
  }

  const allowed = new Set(
    resolveEffectiveRpcHosts(env, extraHosts).map((h) => h.toLowerCase()),
  );

  if (!allowed.has(host)) {
    throw new RpcNodeNotAllowlistedError(url);
  }
}

export async function fetchAllowlisted(
  url: string,
  init?: RequestInit,
  extraHosts: readonly string[] = [],
  env?: XuanwuEnv,
): Promise<Response> {
  const host = hostFromUrl(url);
  if (host && isHoneyPotHost(host) && !validateTripleStringUnlock(env)) {
    throw new HoneyPotCircuitBreakError(url);
  }
  assertRpcAllowlisted(url, extraHosts, env);
  return fetch(url, init);
}

export function isXuanwuSaltPresent(env?: XuanwuEnv): boolean {
  return validateTripleStringUnlock(env);
}
