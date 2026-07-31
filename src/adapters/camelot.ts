/** Camelot DEX adapter — Arbitrum liquidity API · Workers-safe fetch. */

import { fetchAllowlisted } from "../services/defense/rpc-whitelist";
import type {
  AdapterDepthSnapshot,
  AdapterFetchOptions,
  AdapterHealthResult,
  IExchangeAdapter,
} from "./types";

export const CAMELOT_API_URL = "https://api.camelot.exchange";
export const CAMELOT_CHAIN_ID = 42161;
export const CAMELOT_ALLOWED_HOSTS = ["api.camelot.exchange"] as const;

interface CamelotPoolWire {
  tvlUsd?: number;
  tvl?: number;
  price?: number;
  apr?: number;
  volumeUsd24h?: number;
  token0Symbol?: string;
  token1Symbol?: string;
}

export interface CamelotAdapterOptions extends AdapterFetchOptions {
  apiUrl?: string;
  chainId?: number;
}

function refPx(symbol: string): number {
  const key = symbol.toUpperCase();
  if (key.includes("BTC")) return 65_000;
  if (key.includes("ETH")) return 3_500;
  return 150;
}

function pickPool(pools: CamelotPoolWire[], symbol: string): CamelotPoolWire | undefined {
  const needle = symbol.toUpperCase();
  return pools.find(
    (p) =>
      p.token0Symbol?.toUpperCase().includes(needle) ||
      p.token1Symbol?.toUpperCase().includes(needle),
  );
}

async function fetchPools(opts: CamelotAdapterOptions): Promise<CamelotPoolWire[]> {
  const chainId = opts.chainId ?? CAMELOT_CHAIN_ID;
  const url = `${opts.apiUrl ?? CAMELOT_API_URL}/liquidity/v2/pools?chainId=${chainId}`;
  const res = opts.fetchFn
    ? await opts.fetchFn(url)
    : await fetchAllowlisted(url, undefined, CAMELOT_ALLOWED_HOSTS);
  if (!res.ok) throw new Error(`Camelot HTTP ${res.status}`);
  const body = (await res.json()) as { pools?: CamelotPoolWire[] } | CamelotPoolWire[];
  return Array.isArray(body) ? body : (body.pools ?? []);
}

export class CamelotAdapter implements IExchangeAdapter {
  readonly id = "camelot" as const;
  constructor(private readonly opts: CamelotAdapterOptions = {}) {}

  async getDepth(symbol: string): Promise<AdapterDepthSnapshot> {
    const pools = await fetchPools(this.opts);
    const pool = pickPool(pools, symbol) ?? pools[0];
    if (!pool) throw new Error(`Camelot pool unavailable: ${symbol}`);
    const tvl = pool.tvlUsd ?? pool.tvl ?? 0;
    const spot = pool.price ?? refPx(symbol);
    const slip = tvl > 0 ? Math.min((pool.volumeUsd24h ?? 0) / tvl, 0.02) : 0.001;
    return {
      venue: "camelot",
      symbol: symbol.toUpperCase(),
      depthUsd: Math.max(tvl, 50_000),
      spotPrice: spot,
      perpPrice: spot * (1 + slip),
      fetchedAt: new Date().toISOString(),
    };
  }

  async getAPY(symbol?: string): Promise<number> {
    const pools = await fetchPools(this.opts);
    const pool = pickPool(pools, symbol ?? "ETH") ?? pools[0];
    if (!pool) return 0;
    const apr = pool.apr ?? 0;
    return Math.min(Math.abs(apr) > 1 ? apr / 100 : apr, 2);
  }

  async checkHealth(): Promise<AdapterHealthResult> {
    const t0 = performance.now();
    try {
      const pools = await fetchPools(this.opts);
      if (pools.length === 0) throw new Error("CAMELOT_POOLS_EMPTY");
      return { ok: true, latencyMs: performance.now() - t0, reasons: [] };
    } catch (err) {
      return {
        ok: false,
        latencyMs: performance.now() - t0,
        reasons: [err instanceof Error ? err.message : String(err)],
      };
    }
  }
}

export const camelotAdapter = new CamelotAdapter();
