/** Orca Whirlpools adapter — mainnet REST · Workers-safe fetch. */

import { fetchAllowlisted } from "../services/defense/rpc-whitelist";
import type {
  AdapterDepthSnapshot,
  AdapterFetchOptions,
  AdapterHealthResult,
  IExchangeAdapter,
} from "./types";

export const ORCA_API_URL = "https://api.mainnet.orca.so/v1";
export const ORCA_ALLOWED_HOSTS = ["api.mainnet.orca.so"] as const;

interface OrcaWhirlpoolWire {
  tvl?: number;
  price?: number;
  feeRate?: number;
  tokenA?: { symbol?: string };
  tokenB?: { symbol?: string };
}

export interface OrcaAdapterOptions extends AdapterFetchOptions {
  apiUrl?: string;
}

function refPx(symbol: string): number {
  const key = symbol.toUpperCase();
  if (key.includes("BTC")) return 65_000;
  if (key.includes("ETH")) return 3_500;
  return 150;
}

function pickPool(pools: OrcaWhirlpoolWire[], symbol: string): OrcaWhirlpoolWire | undefined {
  const needle = symbol.toUpperCase();
  return pools.find(
    (p) =>
      p.tokenA?.symbol?.toUpperCase().includes(needle) ||
      p.tokenB?.symbol?.toUpperCase().includes(needle),
  );
}

async function fetchWhirlpools(opts: OrcaAdapterOptions): Promise<OrcaWhirlpoolWire[]> {
  const url = `${opts.apiUrl ?? ORCA_API_URL}/whirlpool/list`;
  const res = opts.fetchFn
    ? await opts.fetchFn(url)
    : await fetchAllowlisted(url, undefined, ORCA_ALLOWED_HOSTS);
  if (!res.ok) throw new Error(`Orca HTTP ${res.status}`);
  const body = (await res.json()) as { whirlpools?: OrcaWhirlpoolWire[] } | OrcaWhirlpoolWire[];
  return Array.isArray(body) ? body : (body.whirlpools ?? []);
}

export class OrcaAdapter implements IExchangeAdapter {
  readonly id = "orca" as const;
  constructor(private readonly opts: OrcaAdapterOptions = {}) {}

  async getDepth(symbol: string): Promise<AdapterDepthSnapshot> {
    const pools = await fetchWhirlpools(this.opts);
    const pool = pickPool(pools, symbol) ?? pools[0];
    if (!pool) throw new Error(`Orca whirlpool unavailable: ${symbol}`);
    const spot = pool.price ?? refPx(symbol);
    const slip = (pool.feeRate ?? 300) / 100_000;
    return {
      venue: "orca",
      symbol: symbol.toUpperCase(),
      depthUsd: Math.max(pool.tvl ?? 0, 50_000),
      spotPrice: spot,
      perpPrice: spot * (1 + slip),
      fetchedAt: new Date().toISOString(),
    };
  }

  async getAPY(symbol?: string): Promise<number> {
    const pools = await fetchWhirlpools(this.opts);
    const pool = pickPool(pools, symbol ?? "SOL") ?? pools[0];
    if (!pool) return 0;
    const feeApr = ((pool.feeRate ?? 300) / 1_000_000) * 365;
    return Math.min(feeApr, 2);
  }

  async checkHealth(): Promise<AdapterHealthResult> {
    const t0 = performance.now();
    try {
      const pools = await fetchWhirlpools(this.opts);
      if (pools.length === 0) throw new Error("ORCA_POOLS_EMPTY");
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

export const orcaAdapter = new OrcaAdapter();
