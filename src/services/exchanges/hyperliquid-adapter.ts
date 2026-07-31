/**
 * Canonical Hyperliquid exchange adapter — maps, L2 book, soil audit, classified bundle.
 * Prefer importing from here or `./index` rather than legacy shims under `services/hyperliquid-adapter`.
 */
import type {
  CommoditiesSnapshot,
  ExchangePriceMaps,
  FxSnapshot,
  IndicesSnapshot,
  PreIpoSnapshot,
  StocksSnapshot,
  TradFiEnrichmentPack,
} from "../../types/matrix";
import type {
  HyperliquidMetaAndAssetCtxs,
  HyperliquidUniverseAsset,
} from "../../types/matrix";
import {
  classifyHyperliquidAsset,
  type ClassifiedAsset,
} from "./asset-classifier";
import type {
  ExchangeAdapter,
  MarketDataSnapshot,
  MarketQuote,
  OrderPayload,
  OrderPayloadInput,
  OrderSlippageInput,
  OrderSlippageResult,
} from "./exchange-adapter";
import { evaluateOrderSlippage } from "./exchange-adapter";
import { assertRpcAllowlisted, fetchAllowlisted } from "../defense/rpc-whitelist";
import {
  auditLiveBookSoilResistance,
  type LiveBookSoilAudit,
  type LiveBookSoilProbe,
} from "../check-soil-resistance";
import {
  extractTradFiFromAllMids,
  mergeAllMidsMaps,
  type HyperliquidAllMids,
} from "./tradfi-allmids";
import { parseTradFiEnrichmentFromXyzMeta } from "./tradfi-enrichment";

export {
  extractTradFiFromAllMids,
  mergeAllMidsMaps,
  normalizeAllMidsKey,
  type HyperliquidAllMids,
} from "./tradfi-allmids";

import {
  HL_EXCHANGE_URL,
  HL_INFO_URL,
  HL_L2_CACHE_TTL_MS,
  HL_L2_FETCH_TIMEOUT_MS,
  HL_L2_MAX_RETRIES,
  HL_L2_PROBE_USD,
  HL_TESTNET_INFO_URL,
} from "../../config/constants";

export {
  HL_EXCHANGE_URL,
  HL_INFO_URL,
  HL_L2_CACHE_TTL_MS,
  HL_L2_FETCH_TIMEOUT_MS,
  HL_L2_MAX_RETRIES,
  HL_L2_PROBE_USD,
  HL_TESTNET_INFO_URL,
} from "../../config/constants";

const UA_HEADERS = { "User-Agent": "Mozilla/5.0" } as const;

export interface HlL2BookLevel {
  px: string;
  sz: string;
  n?: number;
}

export interface HlL2BookResponse {
  coin: string;
  levels: [HlL2BookLevel[], HlL2BookLevel[]];
  time?: number;
}

export interface LiveL2BookSnapshot {
  coin: string;
  book: HlL2BookResponse;
  fetchedAt: string;
  live: boolean;
  source: "testnet" | "cache" | "degraded";
}

export interface LiveBookMetrics {
  bestBid: number;
  bestAsk: number;
  midPx: number;
  spreadBps: number;
  bidDepthUsd: number;
  askDepthUsd: number;
  depthUsd: number;
  priceImpactBps: number;
}

export interface FetchLiveL2BookOptions {
  fetchFn?: typeof fetch;
  timeoutMs?: number;
  maxRetries?: number;
  /** Skip network — return cached/degraded empty book */
  forceDegraded?: boolean;
}

const l2BookCache = new Map<string, { snapshot: LiveL2BookSnapshot; expiresAt: number }>();

export type HyperliquidMaps = Pick<
  ExchangePriceMaps,
  "hlSpot" | "hlPerp" | "hlFunding"
>;

export interface HyperliquidParseBundle {
  snapshot: MarketDataSnapshot;
  cryptoMaps: HyperliquidMaps;
  dayVolumeUsd: Record<string, number>;
  commodities: CommoditiesSnapshot;
  stocks: StocksSnapshot;
  indices: IndicesSnapshot;
  fx: FxSnapshot;
  preipo: PreIpoSnapshot;
  tradfiEnrichment: TradFiEnrichmentPack;
  debugSystemLogs: string[];
}

export function hyperliquidSnapshotToMaps(
  snapshot: MarketDataSnapshot,
): HyperliquidMaps {
  const hlSpot: Record<string, number> = {};
  const hlPerp: Record<string, number> = {};
  const hlFunding: Record<string, number> = {};

  for (const quote of Object.values(snapshot.quotes)) {
    if (quote.assetClass && quote.assetClass !== "crypto") continue;
    const symbol = quote.symbol.toUpperCase();
    if (quote.spotPrice !== undefined && quote.spotPrice > 0) {
      hlSpot[symbol] = quote.spotPrice;
    }
    if (quote.perpPrice > 0) {
      hlPerp[symbol] = quote.perpPrice;
    }
    hlFunding[symbol] = quote.fundingRate;
  }

  return { hlSpot, hlPerp, hlFunding };
}

function parseDayVolume(ctx: {
  dayNtlVlm?: string;
  dayBaseVlm?: string;
}): number {
  const ntl = parseFloat(ctx.dayNtlVlm ?? "0");
  if (Number.isFinite(ntl) && ntl > 0) return ntl;
  return 0;
}

export function resolveIsSpotAsset(
  asset: HyperliquidUniverseAsset,
  classified: ClassifiedAsset,
): boolean {
  if (
    classified.assetClass === "commodity" ||
    classified.assetClass === "stock" ||
    classified.assetClass === "index" ||
    classified.assetClass === "fx" ||
    classified.assetClass === "preipo"
  ) {
    return false;
  }

  if (typeof asset.isSpot === "boolean") {
    return asset.isSpot;
  }

  const name = asset.name ?? "";
  if (/-USDC$/i.test(name) || /\/USDC$/i.test(name)) {
    return true;
  }

  if (Array.isArray(asset.tokens) && asset.tokens.length > 0) {
    return true;
  }

  return false;
}

/**
 * Crypto-only parse from metaAndAssetCtxs.
 * TradFi is sourced exclusively from allMids (synthetic market).
 */
export function parseHyperliquidCryptoResponse(
  raw: HyperliquidMetaAndAssetCtxs,
  _logs: string[] = [],
): {
  snapshot: MarketDataSnapshot;
  cryptoMaps: HyperliquidMaps;
  dayVolumeUsd: Record<string, number>;
} {
  const quotes: Record<string, MarketQuote> = {};
  const hlSpot: Record<string, number> = {};
  const hlPerp: Record<string, number> = {};
  const hlFunding: Record<string, number> = {};
  const dayVolumeUsd: Record<string, number> = {};

  const universe = raw[0]?.universe ?? [];
  const ctxs = raw[1] ?? [];

  universe.forEach((asset, index) => {
    const classified = classifyHyperliquidAsset(asset.name);
    if (classified.assetClass !== "crypto") return;

    const ctx = ctxs[index] ?? {};
    const price = parseFloat(ctx.oraclePx ?? ctx.midPx ?? "0");
    const dayVol = parseDayVolume(ctx);
    const isSpot = resolveIsSpotAsset(asset, classified);
    const fundingRate = parseFloat(ctx.funding ?? "0") || 0;
    const symbol = classified.normalizedSymbol;
    const existing = quotes[symbol];

    if (!isSpot) {
      quotes[symbol] = {
        symbol,
        spotPrice: existing?.spotPrice,
        perpPrice: price,
        fundingRate,
        depthUsd: existing?.depthUsd ?? dayVol,
        assetClass: "crypto",
        dayVolumeUsd: dayVol || existing?.dayVolumeUsd,
      };
      if (price > 0) hlPerp[symbol] = price;
      hlFunding[symbol] = fundingRate;
      if (dayVol > 0) dayVolumeUsd[symbol] = dayVol;
    } else {
      quotes[symbol] = {
        symbol,
        spotPrice: price,
        perpPrice: existing?.perpPrice ?? price,
        fundingRate: existing?.fundingRate ?? 0,
        depthUsd: existing?.depthUsd,
        assetClass: "crypto",
        dayVolumeUsd: existing?.dayVolumeUsd,
      };
      if (price > 0) hlSpot[symbol] = price;
    }
  });

  return {
    snapshot: {
      exchangeId: "hyperliquid",
      quotes,
      fetchedAt: new Date().toISOString(),
    },
    cryptoMaps: { hlSpot, hlPerp, hlFunding },
    dayVolumeUsd,
  };
}

/** @deprecated Prefer parseHyperliquidCryptoResponse + extractTradFiFromAllMids */
export function parseHyperliquidResponse(
  raw: HyperliquidMetaAndAssetCtxs,
): HyperliquidParseBundle {
  const logs: string[] = [];
  const crypto = parseHyperliquidCryptoResponse(raw, logs);
  const tradFi = extractTradFiFromAllMids({}, logs);
  return {
    snapshot: crypto.snapshot,
    cryptoMaps: crypto.cryptoMaps,
    dayVolumeUsd: crypto.dayVolumeUsd,
    commodities: tradFi.commodities,
    stocks: tradFi.stocks,
    indices: tradFi.indices,
    fx: tradFi.fx,
    preipo: tradFi.preipo,
    tradfiEnrichment: {
      commodities: {},
      stocks: {},
      indices: {},
      fx: {},
      preipo: {},
      kings: {},
    },
    debugSystemLogs: logs,
  };
}

async function postHlInfo(body: Record<string, unknown>): Promise<Response> {
  return fetchAllowlisted(HL_INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...UA_HEADERS },
    body: JSON.stringify(body),
  });
}

async function postHlTestnetInfo(
  body: Record<string, unknown>,
  fetchFn: typeof fetch,
  timeoutMs: number,
): Promise<Response> {
  assertRpcAllowlisted(HL_TESTNET_INFO_URL, ["api.hyperliquid-testnet.xyz"]);
  return fetchFn(HL_TESTNET_INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...UA_HEADERS },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
}

function readCachedL2Book(coin: string): LiveL2BookSnapshot | null {
  const key = coin.toUpperCase();
  const entry = l2BookCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.snapshot;
}

function writeCachedL2Book(snapshot: LiveL2BookSnapshot): void {
  l2BookCache.set(snapshot.coin.toUpperCase(), {
    snapshot,
    expiresAt: Date.now() + HL_L2_CACHE_TTL_MS,
  });
}

function parseLevelPxSz(level: HlL2BookLevel | [string, string]): {
  px: number;
  sz: number;
} {
  if (Array.isArray(level)) {
    return { px: parseFloat(level[0]), sz: parseFloat(level[1]) };
  }
  return { px: parseFloat(level.px), sz: parseFloat(level.sz) };
}

function sumBookSideUsd(
  levels: HlL2BookLevel[] | undefined,
  maxLevels = 10,
): number {
  if (!levels?.length) return 0;
  let sum = 0;
  for (let i = 0; i < Math.min(levels.length, maxLevels); i++) {
    const { px, sz } = parseLevelPxSz(levels[i]!);
    if (Number.isFinite(px) && Number.isFinite(sz) && px > 0 && sz > 0) {
      sum += px * sz;
    }
  }
  return sum;
}

/** Top-of-book spread in basis points. */
export function computeLiveBookSpreadBps(bestBid: number, bestAsk: number): number {
  if (bestBid <= 0 || bestAsk <= 0) return Number.POSITIVE_INFINITY;
  const mid = (bestBid + bestAsk) / 2;
  return ((bestAsk - bestBid) / mid) * 10_000;
}

/** Walk the ask side for a buy probe — return slippage vs mid in bps. */
export function computeLivePriceImpactBps(
  asks: HlL2BookLevel[],
  midPx: number,
  probeUsd = HL_L2_PROBE_USD,
): number {
  if (!(midPx > 0) || !asks.length) return Number.POSITIVE_INFINITY;

  let remaining = probeUsd;
  let filledUsd = 0;
  let filledQty = 0;

  for (const level of asks) {
    const { px, sz } = parseLevelPxSz(level);
    if (!(px > 0 && sz > 0)) continue;
    const levelUsd = px * sz;
    const takeUsd = Math.min(remaining, levelUsd);
    filledUsd += takeUsd;
    filledQty += takeUsd / px;
    remaining -= takeUsd;
    if (remaining <= 0) break;
  }

  if (filledQty <= 0 || filledUsd <= 0) return Number.POSITIVE_INFINITY;
  const avgPx = filledUsd / filledQty;
  return ((avgPx - midPx) / midPx) * 10_000;
}

/** Derive live book metrics from an L2 snapshot. */
export function computeLiveBookMetrics(
  book: HlL2BookResponse,
  probeUsd = HL_L2_PROBE_USD,
): LiveBookMetrics | null {
  const bids = book.levels?.[0] ?? [];
  const asks = book.levels?.[1] ?? [];
  const bestBid = bids[0] ? parseLevelPxSz(bids[0]).px : 0;
  const bestAsk = asks[0] ? parseLevelPxSz(asks[0]).px : 0;
  if (!(bestBid > 0 && bestAsk > 0)) return null;

  const midPx = (bestBid + bestAsk) / 2;
  const bidDepthUsd = sumBookSideUsd(bids);
  const askDepthUsd = sumBookSideUsd(asks);

  return {
    bestBid,
    bestAsk,
    midPx,
    spreadBps: computeLiveBookSpreadBps(bestBid, bestAsk),
    bidDepthUsd,
    askDepthUsd,
    depthUsd: Math.min(bidDepthUsd, askDepthUsd),
    priceImpactBps: computeLivePriceImpactBps(asks, midPx, probeUsd),
  };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch live L2 book from Hyperliquid testnet (`l2Book`).
 * Graceful fallback: cache → degraded empty book on timeout / 429.
 */
export async function fetchLiveL2Book(
  coin: string,
  options: FetchLiveL2BookOptions = {},
): Promise<LiveL2BookSnapshot> {
  const symbol = coin.toUpperCase();
  const fetchFn = options.fetchFn ?? fetch;
  const timeoutMs = options.timeoutMs ?? HL_L2_FETCH_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? HL_L2_MAX_RETRIES;

  if (options.forceDegraded) {
    const cached = readCachedL2Book(symbol);
    if (cached) return { ...cached, live: false, source: "cache" };
    return {
      coin: symbol,
      book: { coin: symbol, levels: [[], []] },
      fetchedAt: new Date().toISOString(),
      live: false,
      source: "degraded",
    };
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await postHlTestnetInfo(
        { type: "l2Book", coin: symbol },
        fetchFn,
        timeoutMs,
      );

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after") ?? "0");
        await sleep(retryAfter > 0 ? retryAfter * 1000 : 500 * (attempt + 1));
        lastError = new Error("Hyperliquid testnet rate limited (429)");
        continue;
      }

      if (!res.ok) {
        lastError = new Error(`Hyperliquid testnet l2Book HTTP ${res.status}`);
        continue;
      }

      const book = (await res.json()) as HlL2BookResponse;
      const snapshot: LiveL2BookSnapshot = {
        coin: symbol,
        book: {
          coin: book.coin ?? symbol,
          levels: book.levels ?? [[], []],
          time: book.time,
        },
        fetchedAt: new Date().toISOString(),
        live: true,
        source: "testnet",
      };
      writeCachedL2Book(snapshot);
      return snapshot;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await sleep(250 * (attempt + 1));
      }
    }
  }

  const cached = readCachedL2Book(symbol);
  if (cached) {
    console.warn(
      `[HL l2Book] ${symbol} fallback to cache after error:`,
      lastError,
    );
    return { ...cached, live: false, source: "cache" };
  }

  console.error(`[HL l2Book] ${symbol} degraded — no cache:`, lastError);
  return {
    coin: symbol,
    book: { coin: symbol, levels: [[], []] },
    fetchedAt: new Date().toISOString(),
    live: false,
    source: "degraded",
  };
}

/** Fetch live testnet L2 book and run checkSoilResistance() depth audit. */
export async function auditHyperliquidLiveSoil(
  coin: string,
  options: FetchLiveL2BookOptions & { probeUsd?: number } = {},
): Promise<LiveBookSoilAudit | null> {
  const snapshot = await fetchLiveL2Book(coin, options);
  const metrics = computeLiveBookMetrics(snapshot.book, options.probeUsd);
  if (!metrics) return null;

  const probe: LiveBookSoilProbe = {
    symbol: snapshot.coin,
    ...metrics,
  };

  return auditLiveBookSoilResistance(probe);
}

/** @internal Test hook — reset L2 cache between tests */
export function __clearL2BookCacheForTests(): void {
  l2BookCache.clear();
}

/** Read cached live L2 snapshot (sync telemetry / hub path). */
export function peekCachedLiveL2Book(coin: string): LiveL2BookSnapshot | null {
  return readCachedL2Book(coin.toUpperCase());
}

/** @internal Seed L2 cache for hub / telemetry tests */
export function __seedL2BookCacheForTests(snapshot: LiveL2BookSnapshot): void {
  writeCachedL2Book(snapshot);
}

/**
 * Hyperliquid adapter — metaAndAssetCtxs (crypto) + allMids (TradFi synthetics).
 */
export class HyperliquidAdapter implements ExchangeAdapter {
  readonly id = "hyperliquid" as const;
  readonly displayName = "Hyperliquid";

  private lastBundle: HyperliquidParseBundle | null = null;

  getLastBundle(): HyperliquidParseBundle | null {
    return this.lastBundle;
  }

  async fetchMarketData(): Promise<MarketDataSnapshot> {
    const bundle = await this.fetchClassifiedBundle();
    return bundle.snapshot;
  }

  /** Fetch crypto + TradFi in parallel; TradFi never aborts crypto path. */
  async fetchClassifiedBundle(): Promise<HyperliquidParseBundle> {
    const debugSystemLogs: string[] = [];
    let crypto: {
      snapshot: MarketDataSnapshot;
      cryptoMaps: HyperliquidMaps;
      dayVolumeUsd: Record<string, number>;
    } = {
      snapshot: {
        exchangeId: "hyperliquid",
        quotes: {},
        fetchedAt: new Date().toISOString(),
      },
      cryptoMaps: { hlSpot: {}, hlPerp: {}, hlFunding: {} },
      dayVolumeUsd: {},
    };
    let allMids: HyperliquidAllMids = {};

    const [metaResult, metaXyzResult, midsMainResult, midsXyzResult] =
      await Promise.allSettled([
      postHlInfo({ type: "metaAndAssetCtxs" }),
      postHlInfo({ type: "metaAndAssetCtxs", dex: "xyz" }),
      postHlInfo({ type: "allMids" }),
      postHlInfo({ type: "allMids", dex: "xyz" }),
    ]);

    try {
      if (metaResult.status === "fulfilled" && metaResult.value.ok) {
        const raw =
          (await metaResult.value.json()) as HyperliquidMetaAndAssetCtxs;
        crypto = parseHyperliquidCryptoResponse(raw, debugSystemLogs);
      } else {
        const reason =
          metaResult.status === "rejected"
            ? String(metaResult.reason)
            : `HTTP ${metaResult.value.status}`;
        const msg = `[HL meta] FAILED: ${reason}`;
        debugSystemLogs.push(msg);
        console.error(msg);
      }
    } catch (err) {
      const msg = `[HL meta] PARSE ERROR: ${String(err)}`;
      debugSystemLogs.push(msg);
      console.error(msg, err);
    }

    let tradfiEnrichment: TradFiEnrichmentPack = {
      commodities: {},
      stocks: {},
      indices: {},
      fx: {},
      preipo: {},
      kings: {},
    };

    try {
      if (metaXyzResult.status === "fulfilled" && metaXyzResult.value.ok) {
        const rawXyz =
          (await metaXyzResult.value.json()) as HyperliquidMetaAndAssetCtxs;
        tradfiEnrichment = parseTradFiEnrichmentFromXyzMeta(
          rawXyz,
          debugSystemLogs,
        );
      } else {
        const reason =
          metaXyzResult.status === "rejected"
            ? String(metaXyzResult.reason)
            : `HTTP ${metaXyzResult.value.status}`;
        const msg = `[HL meta] xyz dex FAILED: ${reason}`;
        debugSystemLogs.push(msg);
        console.error(msg);
      }
    } catch (err) {
      const msg = `[HL meta] xyz dex PARSE ERROR: ${String(err)}`;
      debugSystemLogs.push(msg);
      console.error(msg, err);
    }

    let mainMids: HyperliquidAllMids = {};
    let xyzMids: HyperliquidAllMids = {};

    try {
      if (midsMainResult.status === "fulfilled" && midsMainResult.value.ok) {
        mainMids = (await midsMainResult.value.json()) as HyperliquidAllMids;
      } else {
        const reason =
          midsMainResult.status === "rejected"
            ? String(midsMainResult.reason)
            : `HTTP ${midsMainResult.value.status}`;
        const msg = `[allMids] main FAILED: ${reason}`;
        debugSystemLogs.push(msg);
        console.error(msg);
      }
    } catch (err) {
      const msg = `[allMids] main PARSE ERROR: ${String(err)}`;
      debugSystemLogs.push(msg);
      console.error(msg, err);
    }

    try {
      if (midsXyzResult.status === "fulfilled" && midsXyzResult.value.ok) {
        xyzMids = (await midsXyzResult.value.json()) as HyperliquidAllMids;
      } else {
        const reason =
          midsXyzResult.status === "rejected"
            ? String(midsXyzResult.reason)
            : `HTTP ${midsXyzResult.value.status}`;
        const msg = `[allMids] xyz dex FAILED: ${reason} — TradFi may be empty`;
        debugSystemLogs.push(msg);
        console.error(msg);
      }
    } catch (err) {
      const msg = `[allMids] xyz dex PARSE ERROR: ${String(err)}`;
      debugSystemLogs.push(msg);
      console.error(msg, err);
    }

    allMids = mergeAllMidsMaps(mainMids, xyzMids);

    const tradFi = extractTradFiFromAllMids(allMids, debugSystemLogs);

    const bundle: HyperliquidParseBundle = {
      snapshot: crypto.snapshot,
      cryptoMaps: crypto.cryptoMaps,
      dayVolumeUsd: crypto.dayVolumeUsd,
      commodities: tradFi.commodities,
      stocks: tradFi.stocks,
      indices: tradFi.indices,
      fx: tradFi.fx,
      preipo: tradFi.preipo,
      tradfiEnrichment,
      debugSystemLogs,
    };

    this.lastBundle = bundle;
    return bundle;
  }

  calculateOrderSlippage(input: OrderSlippageInput): OrderSlippageResult {
    return evaluateOrderSlippage(input);
  }

  buildOrderPayload(input: OrderPayloadInput): OrderPayload {
    const isBuy = input.side === "buy";
    const size = input.sizeUsd;
    const price = input.limitPrice ?? 0;
    const symbol = input.symbol.toUpperCase();

    console.log(
      `[ORDER] ${input.side} ${symbol} sizeUsd=${size} limit=${price}`,
    );

    return {
      exchangeId: "hyperliquid",
      symbol,
      side: input.side,
      endpoint: HL_EXCHANGE_URL,
      method: "POST",
      headers: { "Content-Type": "application/json", ...UA_HEADERS },
      body: {
        type: "order",
        orders: [
          {
            a: symbol,
            b: isBuy,
            p: String(price),
            s: String(size),
            r: input.reduceOnly ?? false,
            t: { limit: { tif: "Ioc" } },
          },
        ],
      },
    };
  }
}

export const hyperliquidAdapter = new HyperliquidAdapter();

export async function fetchHyperliquidMaps(): Promise<HyperliquidMaps> {
  const bundle = await hyperliquidAdapter.fetchClassifiedBundle();
  return bundle.cryptoMaps;
}

/** Live arbitrage book snapshot for Position Health Monitor */
export interface PositionStatus {
  pair: string;
  spotQty: number;
  perpQty: number;
  entryPrice: number;
  markPrice: number;
  liqPrice: number;
  fundingEarnedUSD: number;
  currentAPY: number;
}

export type MarginHealthTier = "HEALTHY" | "WARNING" | "CRITICAL";

/**
 * % distance from mark to perp liquidation price.
 * Returns 100 when liq is unset/zero (treat as maximally safe).
 */
export function calculateLiqDistance(
  markPrice: number,
  liqPrice: number,
): number {
  if (!liqPrice || liqPrice === 0) return 100;
  if (!markPrice || markPrice === 0) return 0;
  return Math.abs((liqPrice - markPrice) / markPrice) * 100;
}

/**
 * 3-stage margin health from liquidation distance (%).
 * CRITICAL < 10% · WARNING 10–20% · HEALTHY > 20%
 */
export function evaluateSoilResistance(
  distancePct: number,
): MarginHealthTier {
  if (distancePct < 10) return "CRITICAL";
  if (distancePct <= 20) return "WARNING";
  return "HEALTHY";
}

/** Net delta = spot + perp (short perp is negative). */
export function calculateNetDelta(spotQty: number, perpQty: number): number {
  return spotQty + perpQty;
}
