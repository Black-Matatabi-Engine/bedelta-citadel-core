/** Polymarket CLOB adapter — event-driven probability signals · Workers-safe fetch. */
import { fetchAllowlisted } from "../services/defense/rpc-whitelist";
import type {
  AdapterDepthSnapshot,
  AdapterFetchOptions,
  AdapterHealthResult,
  IExchangeAdapter,
} from "./types";

export const POLYMARKET_CLOB_URL = "https://clob.polymarket.com";
export const POLYMARKET_GAMMA_URL = "https://gamma-api.polymarket.com";
export const POLYMARKET_ALLOWED_HOSTS = ["clob.polymarket.com", "gamma-api.polymarket.com"] as const;

interface GammaMarketWire {
  conditionId?: string;
  clobTokenIds?: string;
  outcomePrices?: string;
}

interface OrderbookWire {
  bids: { price: string; size: string }[];
  asks: { price: string; size: string }[];
  last_trade_price?: string;
}

export interface PolymarketProbabilitySnapshot {
  conditionId: string;
  yesProbability: number;
  noProbability: number;
  tokenId: string;
  fetchedAt: string;
}

export interface PolymarketAdapterOptions extends AdapterFetchOptions {
  clobUrl?: string;
  gammaUrl?: string;
  benchmarkProb?: number;
}

function parseJsonArray(raw: string | undefined): string[] {
  try {
    return JSON.parse(raw ?? "[]") as string[];
  } catch {
    return [];
  }
}

function bookDepthUsd(levels: { price: string; size: string }[]): number {
  return levels.reduce((sum, l) => {
    const p = Number(l.price);
    const s = Number(l.size);
    return Number.isFinite(p) && Number.isFinite(s) ? sum + p * s : sum;
  }, 0);
}

async function polyFetch(url: string, opts: PolymarketAdapterOptions): Promise<Response> {
  return opts.fetchFn
    ? opts.fetchFn(url)
    : fetchAllowlisted(url, undefined, POLYMARKET_ALLOWED_HOSTS);
}

async function fetchGammaMarket(conditionId: string, opts: PolymarketAdapterOptions): Promise<GammaMarketWire> {
  const url = `${opts.gammaUrl ?? POLYMARKET_GAMMA_URL}/markets?condition_id=${encodeURIComponent(conditionId)}`;
  const res = await polyFetch(url, opts);
  if (!res.ok) throw new Error(`Polymarket gamma HTTP ${res.status}`);
  const markets = (await res.json()) as GammaMarketWire[];
  const market = markets[0];
  if (!market) throw new Error(`Polymarket market not found: ${conditionId}`);
  return market;
}

async function fetchOrderbook(tokenId: string, opts: PolymarketAdapterOptions): Promise<OrderbookWire> {
  const url = `${opts.clobUrl ?? POLYMARKET_CLOB_URL}/book?token_id=${encodeURIComponent(tokenId)}`;
  const res = await polyFetch(url, opts);
  if (!res.ok) throw new Error(`Polymarket CLOB HTTP ${res.status}`);
  return (await res.json()) as OrderbookWire;
}

/** Real-time YES/NO implied probabilities for a condition. */
export async function getMarketProbability(
  conditionId: string,
  opts: PolymarketAdapterOptions = {},
): Promise<PolymarketProbabilitySnapshot> {
  const market = await fetchGammaMarket(conditionId, opts);
  const tokenIds = parseJsonArray(market.clobTokenIds);
  const prices = parseJsonArray(market.outcomePrices);
  const yesProbability = parseFloat(prices[0] ?? "0");
  const noProbability = parseFloat(prices[1] ?? String(Math.max(0, 1 - yesProbability)));
  return {
    conditionId,
    yesProbability,
    noProbability,
    tokenId: tokenIds[0] ?? conditionId,
    fetchedAt: new Date().toISOString(),
  };
}

function probabilityYieldSpread(yes: number, benchmark: number): number {
  if (!Number.isFinite(yes) || yes <= 0 || yes >= 1) return 0;
  const tailYield = (1 - yes) / yes;
  return Math.min(Math.abs(benchmark - yes) + Math.abs(tailYield) * 0.01, 2);
}

export class PolymarketAdapter implements IExchangeAdapter {
  readonly id = "polymarket" as const;
  constructor(private readonly opts: PolymarketAdapterOptions = {}) {}

  async getDepth(symbol: string): Promise<AdapterDepthSnapshot> {
    const prob = await getMarketProbability(symbol, this.opts);
    const book = await fetchOrderbook(prob.tokenId, this.opts);
    const bestBid = parseFloat(book.bids[0]?.price ?? "0");
    const bestAsk = parseFloat(book.asks[0]?.price ?? String(prob.yesProbability));
    const mid = bestBid > 0 && bestAsk > 0 ? (bestBid + bestAsk) / 2 : prob.yesProbability;
    return {
      venue: "polymarket",
      symbol: symbol.toUpperCase(),
      depthUsd: bookDepthUsd(book.bids) + bookDepthUsd(book.asks),
      spotPrice: mid,
      perpPrice: bestAsk || mid,
      fetchedAt: new Date().toISOString(),
    };
  }

  async getAPY(symbol?: string): Promise<number> {
    if (!symbol) return 0;
    const prob = await getMarketProbability(symbol, this.opts);
    return probabilityYieldSpread(prob.yesProbability, this.opts.benchmarkProb ?? 0.5);
  }

  async checkHealth(): Promise<AdapterHealthResult> {
    const t0 = performance.now();
    try {
      const [clob, gamma] = await Promise.all([
        polyFetch(`${this.opts.clobUrl ?? POLYMARKET_CLOB_URL}/time`, this.opts),
        polyFetch(`${this.opts.gammaUrl ?? POLYMARKET_GAMMA_URL}/markets?limit=1`, this.opts),
      ]);
      const reasons: string[] = [];
      if (!clob.ok) reasons.push(`CLOB_HTTP_${clob.status}`);
      if (!gamma.ok) reasons.push(`GAMMA_HTTP_${gamma.status}`);
      return { ok: reasons.length === 0, latencyMs: performance.now() - t0, reasons };
    } catch (err) {
      return {
        ok: false,
        latencyMs: performance.now() - t0,
        reasons: [err instanceof Error ? err.message : String(err)],
      };
    }
  }
}

export const polymarketAdapter = new PolymarketAdapter();