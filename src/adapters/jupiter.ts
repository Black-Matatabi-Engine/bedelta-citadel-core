/**
 * Jupiter Aggregator adapter — Quote API v6 · Workers-safe fetch only.
 */

import { fetchAllowlisted } from "../services/defense/rpc-whitelist";
import type {
  AdapterDepthSnapshot,
  AdapterFetchOptions,
  AdapterHealthResult,
  IExchangeAdapter,
} from "./types";

export const JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";
export const JUPITER_ALLOWED_HOSTS = ["quote-api.jup.ag"] as const;

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const SYMBOL_MINT: Record<string, { input: string; decimals: number; px: number }> = {
  SOL: { input: SOL_MINT, decimals: 9, px: 150 },
  BTC: { input: "cbbtf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij", decimals: 8, px: 65_000 },
};

export interface JupiterQuoteWire {
  inAmount: string;
  outAmount: string;
  priceImpactPct?: string;
  slippageBps?: number;
}

export interface JupiterAdapterOptions extends AdapterFetchOptions {
  quoteUrl?: string;
  probeUsd?: number;
  /** JitoSOL / routing yield proxy when no on-chain lend APY exists */
  defaultApy?: number;
}

function resolveMint(symbol: string) {
  const key = symbol.toUpperCase();
  return SYMBOL_MINT[key] ?? SYMBOL_MINT.SOL!;
}

async function fetchQuote(
  symbol: string,
  opts: JupiterAdapterOptions,
): Promise<JupiterQuoteWire> {
  const mint = resolveMint(symbol);
  const probeUsd = opts.probeUsd ?? 10_000;
  const amount = String(Math.round((probeUsd / mint.px) * 10 ** mint.decimals));
  const url =
    `${opts.quoteUrl ?? JUPITER_QUOTE_URL}?` +
    `inputMint=${mint.input}&outputMint=${USDC_MINT}&amount=${amount}&slippageBps=50`;
  const fetchFn = opts.fetchFn ?? fetch;
  const res = opts.fetchFn
    ? await fetchFn(url)
    : await fetchAllowlisted(url, undefined, JUPITER_ALLOWED_HOSTS);
  if (!res.ok) throw new Error(`Jupiter quote HTTP ${res.status}`);
  return (await res.json()) as JupiterQuoteWire;
}

function depthFromQuote(quote: JupiterQuoteWire, probeUsd: number): number {
  const impact = Math.abs(parseFloat(quote.priceImpactPct ?? "0")) / 100;
  const outUsd = Number(quote.outAmount) / 1e6;
  if (impact > 0 && Number.isFinite(outUsd)) return Math.max(outUsd / impact, probeUsd * 10);
  return Math.max(outUsd * 50, probeUsd * 5);
}

export class JupiterAdapter implements IExchangeAdapter {
  readonly id = "jupiter" as const;

  constructor(private readonly opts: JupiterAdapterOptions = {}) {}

  async getDepth(symbol: string): Promise<AdapterDepthSnapshot> {
    const probeUsd = this.opts.probeUsd ?? 10_000;
    const quote = await fetchQuote(symbol, this.opts);
    const mint = resolveMint(symbol);
    const spot = mint.px;
    const impact = parseFloat(quote.priceImpactPct ?? "0") / 100;
    const perp = spot * (1 + impact);
    return {
      venue: "jupiter",
      symbol: symbol.toUpperCase(),
      depthUsd: depthFromQuote(quote, probeUsd),
      spotPrice: spot,
      perpPrice: perp,
      fetchedAt: new Date().toISOString(),
    };
  }

  async getAPY(symbol?: string): Promise<number> {
    try {
      const quote = await fetchQuote(symbol ?? "SOL", this.opts);
      const impact = Math.abs(parseFloat(quote.priceImpactPct ?? "0")) / 100;
      const base = this.opts.defaultApy ?? 0.07;
      return Math.max(base - impact, 0);
    } catch {
      return this.opts.defaultApy ?? 0.07;
    }
  }

  async checkHealth(): Promise<AdapterHealthResult> {
    const t0 = performance.now();
    try {
      await fetchQuote("SOL", this.opts);
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

export const jupiterAdapter = new JupiterAdapter();
