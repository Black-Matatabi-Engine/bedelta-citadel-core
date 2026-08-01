/**
 * Polymarket CLOB adapter — BeΔ / SilverVine services layer.
 * Native fetch only · SystemState circuit breakers · soil resistance linkage.
 */

import {
  R20_LOCKED,
  isR20Locked,
  readActiveSystemState,
  type SystemState,
} from "../core/state";
import {
  HardlockError,
  MIN_DEPTH_USD,
  RiskLimitExceeded,
  checkSoilResistance,
  vineWrapProtection,
  type SoilResistanceResult,
} from "../core/risk";

/** Polymarket CLOB REST base */
export const POLYMARKET_CLOB_URL = "https://clob.polymarket.com";

/** Max bid-ask spread on binary probability (5%) */
export const MAX_BINARY_SPREAD = 0.05;

/** Minimum combined book depth (USD notional proxy) */
export const MIN_BINARY_LIQUIDITY_USD = 10_000;

export interface PolymarketOrderbookParams {
  conditionId: string;
  tokenId: string;
}

export interface OrderbookLevel {
  price: string;
  size: string;
}

export interface PolymarketOrderbookWire {
  market: string;
  asset_id: string;
  timestamp: string;
  hash: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  min_order_size: string;
  tick_size: string;
  neg_risk: boolean;
  last_trade_price?: string;
}

export interface BinaryHedgeRatio {
  /** YES-side implied probability (0–1) */
  yesProbability: number;
  /** NO-side implied probability (0–1) */
  noProbability: number;
  /** YES / NO ratio for tail-hedge sizing */
  hedgeRatio: number;
  spread: number;
  spreadPct: number;
  totalDepthUsd: number;
}

export interface PolymarketQuoteResponse {
  conditionId: string;
  tokenId: string;
  bestBid: number | null;
  bestAsk: number | null;
  midPrice: number | null;
  impliedProbability: number | null;
  spread: number | null;
  spreadPct: number | null;
  bidDepthUsd: number;
  askDepthUsd: number;
  totalDepthUsd: number;
  binaryHedge: BinaryHedgeRatio;
  timestamp: string;
}

export interface PolymarketFrictionEvaluation {
  ok: boolean;
  tripped: boolean;
  reasons: string[];
  spread: number;
  spreadPct: number;
  totalDepthUsd: number;
  maxSpread: number;
  minLiquidityUsd: number;
  soil: SoilResistanceResult;
}

export interface FetchPolymarketOrderbookOptions {
  fetchFn?: typeof fetch;
  clobUrl?: string;
  systemState?: SystemState;
  maxSpread?: number;
  minLiquidityUsd?: number;
  /** USD notional for vineWrapProtection gate (defaults 100) */
  amountUsd?: number;
}

export class DefenseMatrixError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly reasons: string[];

  constructor(
    code: string,
    message: string,
    reasons: string[] = [],
    httpStatus = 422,
  ) {
    super(message);
    this.name = "DefenseMatrixError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.reasons = reasons;
  }
}

export class PolymarketApiError extends Error {
  readonly code: "HTTP_ERROR" | "INVALID_RESPONSE" | "CONDITION_MISMATCH";
  readonly httpStatus: number;
  readonly body?: unknown;

  constructor(
    message: string,
    code: PolymarketApiError["code"],
    httpStatus: number,
    body?: unknown,
  ) {
    super(message);
    this.name = "PolymarketApiError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.body = body;
  }
}

function parseLevelPrice(level: OrderbookLevel | undefined): number | null {
  if (!level) return null;
  const price = Number(level.price);
  return Number.isFinite(price) && price >= 0 && price <= 1 ? price : null;
}

function depthUsd(levels: OrderbookLevel[]): number {
  return levels.reduce((sum, level) => {
    const price = Number(level.price);
    const size = Number(level.size);
    if (!Number.isFinite(price) || !Number.isFinite(size)) return sum;
    return sum + price * size;
  }, 0);
}

function parseOrderbookWire(body: unknown): PolymarketOrderbookWire {
  if (!body || typeof body !== "object") {
    throw new PolymarketApiError(
      "Invalid Polymarket orderbook response",
      "INVALID_RESPONSE",
      502,
      body,
    );
  }

  const wire = body as Record<string, unknown>;
  const market = String(wire.market ?? "");
  const assetId = String(wire.asset_id ?? "");

  if (!market || !assetId) {
    throw new PolymarketApiError(
      "Polymarket orderbook missing market or asset_id",
      "INVALID_RESPONSE",
      502,
      body,
    );
  }

  return {
    market,
    asset_id: assetId,
    timestamp: String(wire.timestamp ?? new Date().toISOString()),
    hash: String(wire.hash ?? ""),
    bids: Array.isArray(wire.bids) ? (wire.bids as OrderbookLevel[]) : [],
    asks: Array.isArray(wire.asks) ? (wire.asks as OrderbookLevel[]) : [],
    min_order_size: String(wire.min_order_size ?? "1"),
    tick_size: String(wire.tick_size ?? "0.01"),
    neg_risk: Boolean(wire.neg_risk),
    last_trade_price: wire.last_trade_price
      ? String(wire.last_trade_price)
      : undefined,
  };
}

function buildBinaryHedgeRatio(
  bestBid: number | null,
  bestAsk: number | null,
  bidDepthUsd: number,
  askDepthUsd: number,
): BinaryHedgeRatio {
  const midPrice =
    bestBid !== null && bestAsk !== null
      ? (bestBid + bestAsk) / 2
      : bestBid ?? bestAsk;
  const yesProbability = bestAsk ?? midPrice ?? 0;
  const noProbability = Math.max(0, 1 - yesProbability);
  const spread =
    bestBid !== null && bestAsk !== null ? Math.max(0, bestAsk - bestBid) : 0;
  const spreadPct = midPrice && midPrice > 0 ? spread / midPrice : spread;
  const totalDepthUsd = bidDepthUsd + askDepthUsd;
  const hedgeRatio =
    noProbability > 0 ? yesProbability / noProbability : Number.POSITIVE_INFINITY;

  return {
    yesProbability,
    noProbability,
    hedgeRatio,
    spread,
    spreadPct,
    totalDepthUsd,
  };
}

function buildQuoteResponse(
  params: PolymarketOrderbookParams,
  orderbook: PolymarketOrderbookWire,
): PolymarketQuoteResponse {
  const bestBid = parseLevelPrice(orderbook.bids[0]);
  const bestAsk = parseLevelPrice(orderbook.asks[0]);
  const bidDepthUsd = depthUsd(orderbook.bids);
  const askDepthUsd = depthUsd(orderbook.asks);
  const midPrice =
    bestBid !== null && bestAsk !== null
      ? (bestBid + bestAsk) / 2
      : bestBid ?? bestAsk;
  const impliedProbability = bestAsk ?? midPrice;
  const spread =
    bestBid !== null && bestAsk !== null ? Math.max(0, bestAsk - bestBid) : null;
  const spreadPct =
    spread !== null && midPrice !== null && midPrice > 0
      ? spread / midPrice
      : null;

  return {
    conditionId: params.conditionId,
    tokenId: params.tokenId,
    bestBid,
    bestAsk,
    midPrice,
    impliedProbability,
    spread,
    spreadPct,
    bidDepthUsd,
    askDepthUsd,
    totalDepthUsd: bidDepthUsd + askDepthUsd,
    binaryHedge: buildBinaryHedgeRatio(
      bestBid,
      bestAsk,
      bidDepthUsd,
      askDepthUsd,
    ),
    timestamp: orderbook.timestamp,
  };
}

/** Assert SystemState circuit breakers before Polymarket exposure. */
export function assertSystemStateGates(
  state: SystemState,
  amountUsd: number,
): void {
  if (isR20Locked(state) || state.hardlock) {
    throw new DefenseMatrixError(
      R20_LOCKED,
      `${R20_LOCKED} — Polymarket adapter blocked; signing channel severed`,
      [
        `hardlock=${state.hardlock}`,
        `currentCri=${state.currentCri}`,
        `signingChannelOpen=${state.signingChannelOpen}`,
      ],
      403,
    );
  }

  if (!state.signingChannelOpen) {
    throw new DefenseMatrixError(
      R20_LOCKED,
      "Polymarket adapter blocked — signing channel closed",
      [`signingChannelOpen=false`],
      403,
    );
  }

  try {
    vineWrapProtection({
      symbol: "POLY_HEDGE",
      estimatedLossUsd: amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock,
    });
  } catch (err) {
    if (err instanceof HardlockError) {
      throw new DefenseMatrixError(R20_LOCKED, err.message, [err.message], 403);
    }
    if (err instanceof RiskLimitExceeded) {
      throw new DefenseMatrixError(
        "ROOT_PROTECTION",
        err.message,
        [err.message],
        422,
      );
    }
    throw err;
  }
}

/**
 * Friction audit — spread / liquidity depth for binary probability markets.
 * Integrates checkSoilResistance() when spread or depth fails thresholds.
 */
export function evaluatePolymarketFriction(
  quote: PolymarketQuoteResponse,
  maxSpread: number = MAX_BINARY_SPREAD,
  minLiquidityUsd: number = MIN_BINARY_LIQUIDITY_USD,
): PolymarketFrictionEvaluation {
  const reasons: string[] = [];
  const spread = quote.spread ?? quote.binaryHedge.spread;
  const spreadPct = quote.spreadPct ?? quote.binaryHedge.spreadPct;
  const totalDepthUsd = quote.totalDepthUsd;

  if (spreadPct > maxSpread) {
    reasons.push(
      `BINARY_SPREAD=${(spreadPct * 100).toFixed(2)}%>${(maxSpread * 100).toFixed(0)}%`,
    );
  }

  if (totalDepthUsd < minLiquidityUsd) {
    reasons.push(
      `BINARY_LIQUIDITY=${totalDepthUsd.toFixed(2)}<${minLiquidityUsd}`,
    );
  }

  const mid = quote.midPrice ?? quote.impliedProbability ?? 0.5;
  const ask = quote.bestAsk ?? mid;
  const soil = checkSoilResistance({
    symbol: "POLY_BINARY",
    hlSpot: mid,
    hlPerp: mid,
    dydxPerp: ask + spread,
    depthUsd: Math.max(totalDepthUsd, MIN_DEPTH_USD),
  });

  if (soil.tripped) {
    reasons.push(...soil.reasons);
  }

  const tripped = reasons.length > 0;

  if (tripped) {
    throw new DefenseMatrixError(
      "SOIL_RESISTANCE_SLIPPAGE_BREAKER",
      "Polymarket friction audit failed — binary exposure rejected",
      reasons,
      422,
    );
  }

  return {
    ok: true,
    tripped: false,
    reasons: [],
    spread,
    spreadPct,
    totalDepthUsd,
    maxSpread,
    minLiquidityUsd,
    soil,
  };
}

/** Fetch live Polymarket CLOB orderbook with friction audit + SystemState gates. */
export async function fetchPolymarketOrderbook(
  params: PolymarketOrderbookParams,
  options: FetchPolymarketOrderbookOptions = {},
): Promise<PolymarketQuoteResponse> {
  const state = options.systemState ?? readActiveSystemState();
  const amountUsd = options.amountUsd ?? 100;

  assertSystemStateGates(state, amountUsd);

  const fetchFn = options.fetchFn ?? fetch;
  const base = options.clobUrl ?? POLYMARKET_CLOB_URL;
  const url = `${base}/book?token_id=${encodeURIComponent(params.tokenId)}`;

  const res = await fetchFn(url, { method: "GET" });

  if (!res.ok) {
    throw new PolymarketApiError(
      `Polymarket orderbook HTTP ${res.status}`,
      "HTTP_ERROR",
      res.status,
    );
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new PolymarketApiError(
      "Invalid JSON from Polymarket orderbook",
      "INVALID_RESPONSE",
      res.status,
    );
  }

  const orderbook = parseOrderbookWire(body);

  if (
    params.conditionId &&
    orderbook.market.toLowerCase() !== params.conditionId.toLowerCase()
  ) {
    throw new PolymarketApiError(
      `conditionId mismatch: expected ${params.conditionId}, got ${orderbook.market}`,
      "CONDITION_MISMATCH",
      422,
      orderbook,
    );
  }

  const quote = buildQuoteResponse(params, orderbook);

  evaluatePolymarketFriction(
    quote,
    options.maxSpread ?? MAX_BINARY_SPREAD,
    options.minLiquidityUsd ?? MIN_BINARY_LIQUIDITY_USD,
  );

  return quote;
}
