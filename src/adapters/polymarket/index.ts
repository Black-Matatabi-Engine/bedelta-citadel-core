/**
 * Polymarket tail-risk hedge adapter — Phase 2 (Pgate.md).
 *
 * Fetches CLOB orderbook depth, evaluates cheap tail-insurance triggers,
 * and builds CLOB-ready hedge order payloads gated by R20 / vineWrapProtection.
 */

import type { Signer } from "ethers";
import { readActiveSystemState, isR20Locked, R20_LOCKED, type SystemState } from "../../core/state";
import { HardlockError, RiskLimitExceeded, vineWrapProtection } from "../../core/risk";

/** Polymarket CLOB REST base (public market data + order POST) */
export const POLYMARKET_CLOB_URL = "https://clob.polymarket.com";

/** Pgate Phase 2 — default max YES price for tail hedge ($0.08 implied prob) */
export const DEFAULT_TAIL_HEDGE_THRESHOLD = 0.08;

export type HedgeSide = "BUY" | "SELL";
export type PolymarketOrderType = "GTC" | "FOK" | "GTD";

export interface OrderbookLevel {
  price: string;
  size: string;
}

/** Wire shape from GET /book?token_id= */
export interface PolymarketOrderbook {
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

export interface MarketSnapshot {
  tokenId: string;
  marketId: string;
  bestBid: number | null;
  bestAsk: number | null;
  midPrice: number | null;
  /** Cost to lift the ask — primary tail-hedge entry price */
  impliedProbability: number | null;
  spread: number | null;
  bidDepthUsd: number;
  askDepthUsd: number;
  orderbook: PolymarketOrderbook;
}

export interface PolymarketSignedOrder {
  tokenId: string;
  side: HedgeSide;
  price: string;
  size: string;
  amountUsd: number;
  nonce: string;
  expiration: string;
  feeRateBps: string;
  signatureType: number;
  signature: string;
}

export interface PolymarketHedgeOrderPayload {
  marketId: string;
  orderType: PolymarketOrderType;
  order: PolymarketSignedOrder;
}

export interface FetchMarketSnapshotOptions {
  fetchFn?: typeof fetch;
  clobUrl?: string;
}

export interface CreateHedgeOrderOptions {
  systemState?: SystemState;
  price?: number;
  orderType?: PolymarketOrderType;
  feeRateBps?: string;
  expirationSec?: number;
  nonce?: string;
}

export interface SubmitHedgeOrderOptions extends CreateHedgeOrderOptions {
  fetchFn?: typeof fetch;
  clobUrl?: string;
  owner?: string;
  dryRun?: boolean;
  signer?: Signer;
}

/**
 * Thrown when R20 / vineWrapProtection blocks hedge order creation or submission.
 */
export class HedgeExecutionBlockedError extends Error {
  readonly code = "HEDGE_EXECUTION_BLOCKED" as const;
  readonly httpStatus = 403 as const;
  readonly lockState: typeof R20_LOCKED | "ROOT_PROTECTION";
  readonly reasons: string[];

  constructor(
    message: string,
    lockState: HedgeExecutionBlockedError["lockState"],
    reasons: string[],
  ) {
    super(message);
    this.name = "HedgeExecutionBlockedError";
    this.lockState = lockState;
    this.reasons = reasons;
  }
}

/**
 * Thrown when Polymarket CLOB market-data fetch fails.
 */
export class PolymarketApiError extends Error {
  readonly code: "HTTP_ERROR" | "INVALID_RESPONSE";
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
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function depthUsd(levels: OrderbookLevel[]): number {
  return levels.reduce((sum, level) => {
    const price = Number(level.price);
    const size = Number(level.size);
    if (!Number.isFinite(price) || !Number.isFinite(size)) return sum;
    return sum + price * size;
  }, 0);
}

/** Normalize probability/price to CLOB decimal string (max 6 decimals) */
export function formatProbability(value: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`Invalid probability: ${value}`);
  }
  return value.toFixed(6).replace(/\.?0+$/, "") || "0";
}

/** Convert USD notional to outcome-token size at a given probability price */
export function usdToOutcomeSize(amountUsd: number, price: number): string {
  if (amountUsd <= 0) throw new Error(`amountUsd must be positive: ${amountUsd}`);
  if (price <= 0 || price > 1) throw new Error(`price must be in (0, 1]: ${price}`);
  const size = amountUsd / price;
  return size.toFixed(4).replace(/\.?0+$/, "") || "0";
}

/**
 * Tail-risk trigger — true when market YES price is at or below threshold
 * (cheap black-swan insurance per Pgate Phase 2 <$0.08).
 */
export function evaluateTailHedgeTrigger(
  marketPrice: number,
  thresholdProb: number,
): boolean {
  if (!Number.isFinite(marketPrice) || !Number.isFinite(thresholdProb)) {
    return false;
  }
  if (marketPrice <= 0 || marketPrice > 1) return false;
  if (thresholdProb <= 0 || thresholdProb > 1) return false;
  return marketPrice <= thresholdProb;
}

export function parseOrderbookSnapshot(
  tokenId: string,
  orderbook: PolymarketOrderbook,
): MarketSnapshot {
  const bestBid = parseLevelPrice(orderbook.bids[0]);
  const bestAsk = parseLevelPrice(orderbook.asks[0]);
  const midPrice =
    bestBid !== null && bestAsk !== null ? (bestBid + bestAsk) / 2 : bestBid ?? bestAsk;
  const impliedProbability = bestAsk ?? midPrice;
  const spread =
    bestBid !== null && bestAsk !== null ? Math.max(0, bestAsk - bestBid) : null;

  return {
    tokenId,
    marketId: orderbook.market,
    bestBid,
    bestAsk,
    midPrice,
    impliedProbability,
    spread,
    bidDepthUsd: depthUsd(orderbook.bids),
    askDepthUsd: depthUsd(orderbook.asks),
    orderbook,
  };
}

export async function fetchOrderbook(
  tokenId: string,
  options: FetchMarketSnapshotOptions = {},
): Promise<PolymarketOrderbook> {
  const fetchFn = options.fetchFn ?? fetch;
  const base = options.clobUrl ?? POLYMARKET_CLOB_URL;
  const url = `${base}/book?token_id=${encodeURIComponent(tokenId)}`;

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

  return body as PolymarketOrderbook;
}

/** Fetch orderbook depth and derive implied probability for a target market token. */
export async function fetchMarketSnapshot(
  tokenId: string,
  options: FetchMarketSnapshotOptions = {},
): Promise<MarketSnapshot> {
  const orderbook = await fetchOrderbook(tokenId, options);
  return parseOrderbookSnapshot(tokenId, orderbook);
}

function assertHedgeRiskGates(state: SystemState, amountUsd: number): void {
  if (isR20Locked(state)) {
    throw new HedgeExecutionBlockedError(
      `${R20_LOCKED} — hedge order blocked; signing channel severed`,
      R20_LOCKED,
      [
        `hardlock=${state.hardlock}`,
        `currentCri=${state.currentCri}`,
        `signingChannelOpen=${state.signingChannelOpen}`,
      ],
    );
  }

  try {
    vineWrapProtection({
      symbol: "POLY_TAIL_HEDGE",
      estimatedLossUsd: amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock,
    });
  } catch (err) {
    if (err instanceof HardlockError || err instanceof RiskLimitExceeded) {
      throw new HedgeExecutionBlockedError(
        "vineWrapProtection() blocked Polymarket tail hedge",
        "ROOT_PROTECTION",
        [err.message],
      );
    }
    throw err;
  }
}

/**
 * Build a CLOB-ready hedge order payload.
 * Blocked when R20_LOCKED or vineWrapProtection() would trip.
 */
export function createHedgeOrderPayload(
  marketId: string,
  side: HedgeSide,
  amountUsd: number,
  options: CreateHedgeOrderOptions = {},
): PolymarketHedgeOrderPayload {
  const state = options.systemState ?? readActiveSystemState();
  assertHedgeRiskGates(state, amountUsd);

  const price = options.price;
  if (price === undefined || price <= 0 || price > 1) {
    throw new Error("createHedgeOrderPayload requires a valid price in (0, 1]");
  }

  const nonce = options.nonce ?? `${Date.now()}`;
  const expirationSec = options.expirationSec ?? 3600;
  const expiration = `${Math.floor(Date.now() / 1000) + expirationSec}`;

  const order: PolymarketSignedOrder = {
    tokenId: marketId,
    side,
    price: formatProbability(price),
    size: usdToOutcomeSize(amountUsd, price),
    amountUsd,
    nonce,
    expiration,
    feeRateBps: options.feeRateBps ?? "0",
    signatureType: 0,
    signature: "",
  };

  return {
    marketId,
    orderType: options.orderType ?? "GTC",
    order,
  };
}

/** Attach an EIP-191 placeholder signature for dry-run / client hand-off */
export async function signHedgeOrderPayload(
  payload: PolymarketHedgeOrderPayload,
  signer: Signer,
): Promise<PolymarketHedgeOrderPayload> {
  const message = JSON.stringify({
    tokenId: payload.order.tokenId,
    side: payload.order.side,
    price: payload.order.price,
    size: payload.order.size,
    nonce: payload.order.nonce,
    expiration: payload.order.expiration,
  });

  const signature = await signer.signMessage(message);

  return {
    ...payload,
    order: {
      ...payload.order,
      signature,
    },
  };
}

export async function submitHedgeOrder(
  marketId: string,
  side: HedgeSide,
  amountUsd: number,
  price: number,
  options: SubmitHedgeOrderOptions = {},
): Promise<{ payload: PolymarketHedgeOrderPayload; response?: unknown; dryRun: boolean }> {
  let payload = createHedgeOrderPayload(marketId, side, amountUsd, {
    ...options,
    price,
  });

  if (options.signer) {
    payload = await signHedgeOrderPayload(payload, options.signer);
  }

  if (options.dryRun) {
    return { payload, dryRun: true };
  }

  const fetchFn = options.fetchFn ?? fetch;
  const base = options.clobUrl ?? POLYMARKET_CLOB_URL;

  const res = await fetchFn(`${base}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order: payload.order,
      owner: options.owner,
      orderType: payload.orderType,
    }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new PolymarketApiError(
      `Polymarket order POST HTTP ${res.status}`,
      "HTTP_ERROR",
      res.status,
      body,
    );
  }

  return { payload, response: body, dryRun: false };
}

export * from "./realtime-sleeve";
