/**
 * Solana multi-stable yield ingress — USDC/USDT/PYUSD base APY read-path for HL margin routing.
 */

import { fetchAllowlisted } from "../../services/defense/rpc-whitelist";
import type { IntentLeg } from "../../core/intent-ledger";
import { RAYDIUM_ALLOWED_HOSTS, RAYDIUM_API_URL } from "../raydium";

export type SolanaStableSymbol = "USDC" | "USDT" | "PYUSD";

export const SOLANA_STABLE_MINTS: Record<SolanaStableSymbol, string> = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  PYUSD: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
};

/** Fallback base APY when Raydium read-path unavailable (annualized fraction) */
export const DEFAULT_STABLE_BASE_APY: Record<SolanaStableSymbol, number> = {
  USDC: 0.048,
  USDT: 0.042,
  PYUSD: 0.051,
};

export interface SolanaStableYieldSnapshot {
  symbol: SolanaStableSymbol;
  mint: string;
  baseApy: number;
  depthUsd: number;
  source: "raydium" | "default";
  fetchedAt: string;
}

export interface SolanaYieldIngressOptions {
  fetchFn?: typeof fetch;
  apiUrl?: string;
  minDepthUsd?: number;
}

export interface SolanaYieldIngressValidation {
  allowed: boolean;
  readyFor2Pc: boolean;
  reasons: string[];
  snapshot: SolanaStableYieldSnapshot;
  proposedLeg: IntentLeg | null;
}

interface RaydiumPoolWire {
  tvl?: number;
  day?: { apr?: number; volume?: number };
}

function normalizeApr(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.abs(raw) > 1 ? raw / 100 : raw;
}

async function fetchRaydiumStablePool(
  mint: string,
  opts: SolanaYieldIngressOptions,
): Promise<RaydiumPoolWire | null> {
  const url =
    `${opts.apiUrl ?? RAYDIUM_API_URL}/pools/info/mint?` +
    `mint1=${mint}&poolType=all&poolSortField=liquidity&sortType=desc&pageSize=1`;
  try {
    const res = opts.fetchFn
      ? await opts.fetchFn(url)
      : await fetchAllowlisted(url, undefined, RAYDIUM_ALLOWED_HOSTS);
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { data?: RaydiumPoolWire[] } };
    return body.data?.data?.[0] ?? null;
  } catch {
    return null;
  }
}

/** Read base APY for a single Solana stablecoin pool */
export async function fetchSolanaStableYield(
  symbol: SolanaStableSymbol,
  opts: SolanaYieldIngressOptions = {},
): Promise<SolanaStableYieldSnapshot> {
  const mint = SOLANA_STABLE_MINTS[symbol];
  const pool = await fetchRaydiumStablePool(mint, opts);
  const fetchedAt = new Date().toISOString();

  if (pool) {
    const baseApy = normalizeApr(pool.day?.apr ?? 0) || DEFAULT_STABLE_BASE_APY[symbol];
    return {
      symbol,
      mint,
      baseApy,
      depthUsd: Math.max(pool.tvl ?? 0, 0),
      source: "raydium",
      fetchedAt,
    };
  }

  return {
    symbol,
    mint,
    baseApy: DEFAULT_STABLE_BASE_APY[symbol],
    depthUsd: 500_000,
    source: "default",
    fetchedAt,
  };
}

/** Parallel read for USDC / USDT / PYUSD idle-yield pools */
export async function fetchAllSolanaStableYields(
  opts: SolanaYieldIngressOptions = {},
): Promise<SolanaStableYieldSnapshot[]> {
  const symbols: SolanaStableSymbol[] = ["USDC", "USDT", "PYUSD"];
  return Promise.all(symbols.map((s) => fetchSolanaStableYield(s, opts)));
}

/** Pick highest base APY stable with sufficient depth for HL ingress */
export function pickBestStableIngress(
  snapshots: readonly SolanaStableYieldSnapshot[],
  minDepthUsd = 100_000,
): SolanaStableYieldSnapshot | null {
  const eligible = snapshots.filter((s) => s.depthUsd >= minDepthUsd && s.baseApy > 0);
  if (eligible.length === 0) return null;
  return eligible.sort((a, b) => b.baseApy - a.baseApy)[0] ?? null;
}

export function buildSolanaIngressIntentLeg(
  snapshot: SolanaStableYieldSnapshot,
  sizeUsd: number,
): IntentLeg {
  return {
    venue: "JUPITER",
    side: "BUY",
    sizeUsd,
    symbol: snapshot.symbol,
  };
}

/** Guard Solana stable ingress before 2PC prepare */
export function validateSolanaYieldIngress(
  snapshot: SolanaStableYieldSnapshot,
  minDepthUsd = 100_000,
  sizeUsd?: number,
): SolanaYieldIngressValidation {
  const reasons: string[] = [];

  if (snapshot.baseApy <= 0) {
    reasons.push("SOLANA_BASE_APY_ZERO");
  }
  if (snapshot.depthUsd < minDepthUsd) {
    reasons.push(`SOLANA_DEPTH=${snapshot.depthUsd}<${minDepthUsd}`);
  }

  const allowed = reasons.length === 0;
  return {
    allowed,
    readyFor2Pc: allowed,
    reasons,
    snapshot,
    proposedLeg:
      allowed && sizeUsd !== undefined && sizeUsd > 0
        ? buildSolanaIngressIntentLeg(snapshot, sizeUsd)
        : null,
  };
}

/** Fetch + validate in one call for HL margin ingress routing */
export async function fetchAndValidateSolanaYieldIngress(
  symbol: SolanaStableSymbol = "USDC",
  opts: SolanaYieldIngressOptions = {},
): Promise<SolanaYieldIngressValidation> {
  const snapshot = await fetchSolanaStableYield(symbol, opts);
  return validateSolanaYieldIngress(snapshot, opts.minDepthUsd);
}
