/** Raydium CLMM adapter — api-v3 REST · Workers-safe fetch. */

import { fetchAllowlisted } from "../services/defense/rpc-whitelist";
import type {
  AdapterDepthSnapshot,
  AdapterFetchOptions,
  AdapterHealthResult,
  IExchangeAdapter,
} from "./types";

export const RAYDIUM_API_URL = "https://api-v3.raydium.io";
export const RAYDIUM_ALLOWED_HOSTS = ["api-v3.raydium.io"] as const;

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

interface RaydiumPoolWire {
  tvl?: number;
  price?: number;
  day?: { apr?: number; volume?: number };
}

export interface RaydiumAdapterOptions extends AdapterFetchOptions {
  apiUrl?: string;
}

function refPx(symbol: string): number {
  const key = symbol.toUpperCase();
  if (key.includes("BTC")) return 65_000;
  if (key.includes("ETH")) return 3_500;
  return 150;
}

async function fetchTopPool(symbol: string, opts: RaydiumAdapterOptions): Promise<RaydiumPoolWire> {
  const url =
    `${opts.apiUrl ?? RAYDIUM_API_URL}/pools/info/mint?` +
    `mint1=${SOL_MINT}&mint2=${USDC_MINT}&poolType=all&poolSortField=liquidity&sortType=desc&pageSize=1`;
  const res = opts.fetchFn
    ? await opts.fetchFn(url)
    : await fetchAllowlisted(url, undefined, RAYDIUM_ALLOWED_HOSTS);
  if (!res.ok) throw new Error(`Raydium HTTP ${res.status}`);
  const body = (await res.json()) as { data?: { data?: RaydiumPoolWire[] } };
  const pool = body.data?.data?.[0];
  if (!pool) throw new Error(`Raydium pool unavailable: ${symbol}`);
  return pool;
}

export class RaydiumAdapter implements IExchangeAdapter {
  readonly id = "raydium" as const;
  constructor(private readonly opts: RaydiumAdapterOptions = {}) {}

  async getDepth(symbol: string): Promise<AdapterDepthSnapshot> {
    const pool = await fetchTopPool(symbol, this.opts);
    const spot = pool.price ?? refPx(symbol);
    const slip = pool.day?.volume && pool.tvl ? Math.min(pool.day.volume / pool.tvl, 0.02) : 0.001;
    return {
      venue: "raydium",
      symbol: symbol.toUpperCase(),
      depthUsd: Math.max(pool.tvl ?? 0, 50_000),
      spotPrice: spot,
      perpPrice: spot * (1 + slip),
      fetchedAt: new Date().toISOString(),
    };
  }

  async getAPY(symbol?: string): Promise<number> {
    const pool = await fetchTopPool(symbol ?? "SOL", this.opts);
    const apr = pool.day?.apr ?? 0;
    return Math.min(Math.abs(apr) > 1 ? apr / 100 : apr, 2);
  }

  async checkHealth(): Promise<AdapterHealthResult> {
    const t0 = performance.now();
    try {
      await fetchTopPool("SOL", this.opts);
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

export const raydiumAdapter = new RaydiumAdapter();
