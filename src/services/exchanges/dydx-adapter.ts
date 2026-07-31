import { fetchAllowlisted } from "../defense/rpc-whitelist";

const DYDX_PERPETUAL_MARKETS_URL =
  "https://indexer.dydx.trade/v4/perpetualMarkets";
const UA_HEADERS = { "User-Agent": "Mozilla/5.0", Accept: "application/json" } as const;

export interface DydxPerpetualMarket {
  ticker: string;
  status: string;
  oraclePrice: string;
  volume24H?: string;
}

export interface DydxOrderbookLevel {
  price: string;
  size: string;
}

/** Normalize dYdX tickers (`BTC-USD`) to matrix symbols (`BTC`). */
export function parseDydxTicker(ticker: string): string | null {
  const match = /^([A-Z0-9]+)-USD$/i.exec(ticker.trim());
  return match ? match[1].toUpperCase() : null;
}

/** Mid from best bid/ask; falls back to single-sided book when one side is empty. */
export function computeOrderbookMid(
  bids: readonly DydxOrderbookLevel[],
  asks: readonly DydxOrderbookLevel[],
): number {
  const bestBid = bids[0]?.price ? parseFloat(bids[0].price) : 0;
  const bestAsk = asks[0]?.price ? parseFloat(asks[0].price) : 0;
  if (bestBid > 0 && bestAsk > 0) return (bestBid + bestAsk) / 2;
  if (bestBid > 0) return bestBid;
  if (bestAsk > 0) return bestAsk;
  return 0;
}

/**
 * Parse ACTIVE dYdX perpetual markets into symbol → mid map.
 * Uses oracle price as the live reference mid for cross-venue soil resistance.
 */
export function parseDydxPerpMidsFromMarkets(
  markets: Record<string, DydxPerpetualMarket>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const market of Object.values(markets)) {
    if (market.status !== "ACTIVE") continue;
    const symbol = parseDydxTicker(market.ticker);
    if (!symbol) continue;
    const mid = parseFloat(market.oraclePrice);
    if (!Number.isFinite(mid) || mid <= 0) continue;
    out[symbol] = mid;
  }
  return out;
}

/**
 * Lightweight dYdX v4 adapter — single indexer snapshot for all ACTIVE perp mids.
 */
export async function fetchDydxPerpMids(): Promise<Record<string, number>> {
  const response = await fetchAllowlisted(DYDX_PERPETUAL_MARKETS_URL, {
    headers: UA_HEADERS,
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`dYdX perpetualMarkets HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    markets?: Record<string, DydxPerpetualMarket>;
  };

  return parseDydxPerpMidsFromMarkets(payload.markets ?? {});
}
