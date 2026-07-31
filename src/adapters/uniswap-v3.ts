/** Uniswap v3 Arbitrum adapter — The Graph subgraph · Workers-safe fetch. */

import { fetchAllowlisted } from "../services/defense/rpc-whitelist";
import type {
  AdapterDepthSnapshot,
  AdapterFetchOptions,
  AdapterHealthResult,
  IExchangeAdapter,
} from "./types";

export const UNISWAP_V3_SUBGRAPH_URL =
  "https://gateway.thegraph.com/api/subgraphs/id/5zvR82QoaXYFyDEHLZJKyHGGzrSXmHrBgR5s6gHBfoG7";
export const UNISWAP_ALLOWED_HOSTS = ["gateway.thegraph.com"] as const;

interface UniPoolWire {
  totalValueLockedUSD?: string;
  token0Price?: string;
  token1Price?: string;
  feeTier?: string;
  volumeUSD?: string;
}

export interface UniswapV3AdapterOptions extends AdapterFetchOptions {
  subgraphUrl?: string;
}

function tokenSymbol(symbol: string): string {
  const key = symbol.toUpperCase();
  return key === "ETH" ? "WETH" : key;
}

function refPx(symbol: string): number {
  const key = symbol.toUpperCase();
  if (key.includes("BTC")) return 65_000;
  if (key.includes("ETH")) return 3_500;
  return 150;
}

async function fetchPool(symbol: string, opts: UniswapV3AdapterOptions): Promise<UniPoolWire> {
  const token = tokenSymbol(symbol);
  const query = `{ pools(first:1,orderBy:totalValueLockedUSD,orderDirection:desc,where:{or:[{token0_:{symbol:"${token}"}},{token1_:{symbol:"${token}"}}]}) { totalValueLockedUSD token0Price token1Price feeTier volumeUSD } }`;
  const url = opts.subgraphUrl ?? UNISWAP_V3_SUBGRAPH_URL;
  const init = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  } as RequestInit;
  const res = opts.fetchFn
    ? await opts.fetchFn(url, init)
    : await fetchAllowlisted(url, init, UNISWAP_ALLOWED_HOSTS);
  if (!res.ok) throw new Error(`Uniswap subgraph HTTP ${res.status}`);
  const body = (await res.json()) as { data?: { pools?: UniPoolWire[] } };
  const pool = body.data?.pools?.[0];
  if (!pool) throw new Error(`Uniswap pool unavailable: ${symbol}`);
  return pool;
}

export class UniswapV3Adapter implements IExchangeAdapter {
  readonly id = "uniswap-v3" as const;
  constructor(private readonly opts: UniswapV3AdapterOptions = {}) {}

  async getDepth(symbol: string): Promise<AdapterDepthSnapshot> {
    const pool = await fetchPool(symbol, this.opts);
    const tvl = parseFloat(pool.totalValueLockedUSD ?? "0");
    const spot = parseFloat(pool.token0Price ?? "") || refPx(symbol);
    const slip = tvl > 0 ? Math.min(parseFloat(pool.volumeUSD ?? "0") / tvl, 0.02) : 0.001;
    return {
      venue: "uniswap-v3",
      symbol: symbol.toUpperCase(),
      depthUsd: Math.max(tvl, 50_000),
      spotPrice: spot,
      perpPrice: spot * (1 + slip),
      fetchedAt: new Date().toISOString(),
    };
  }

  async getAPY(symbol?: string): Promise<number> {
    const pool = await fetchPool(symbol ?? "ETH", this.opts);
    const tvl = parseFloat(pool.totalValueLockedUSD ?? "0");
    const vol = parseFloat(pool.volumeUSD ?? "0");
    const fee = parseInt(pool.feeTier ?? "3000", 10) / 1_000_000;
    if (tvl <= 0) return 0;
    return Math.min((vol / tvl) * fee * 365, 2);
  }

  async checkHealth(): Promise<AdapterHealthResult> {
    const t0 = performance.now();
    try {
      await fetchPool("ETH", this.opts);
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

export const uniswapV3Adapter = new UniswapV3Adapter();
