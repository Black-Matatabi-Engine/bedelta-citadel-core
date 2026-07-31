import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MAX_FUNDING_RATE,
  DEFAULT_MAX_SYMBOL_VOLATILITY,
  buildPolymarketIntentLeg,
  computeOrderbookLiquidityMetrics,
  evaluateRealtimeTailSleeve,
  evaluateTailSleeveFromSnapshot,
} from "../../src/adapters/polymarket/realtime-sleeve";
import {
  parseOrderbookSnapshot,
} from "../../src/adapters/polymarket/index";
import {
  __clearIntentLedgerForTests,
  createCrossLegIntent,
  prepareIntent,
} from "../../src/core/intent-ledger";

const TEST_TOKEN_ID = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
const TEST_MARKET_ID = "0xmarket";

const SAMPLE_ORDERBOOK = {
  market: TEST_MARKET_ID,
  asset_id: TEST_TOKEN_ID,
  timestamp: "1700000000",
  hash: "abc",
  bids: [{ price: "0.069", size: "8000" }, { price: "0.068", size: "5000" }],
  asks: [{ price: "0.071", size: "10000" }, { price: "0.072", size: "5000" }],
  min_order_size: "1",
  tick_size: "0.01",
  neg_risk: false,
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}

describe("polymarket realtime sleeve", () => {
  beforeEach(() => {
    __clearIntentLedgerForTests();
  });

  it("computes spread and liquidity metrics from snapshot", () => {
    const snapshot = parseOrderbookSnapshot(TEST_TOKEN_ID, SAMPLE_ORDERBOOK);
    const metrics = computeOrderbookLiquidityMetrics(snapshot);

    expect(metrics.spreadBps).toBeGreaterThan(0);
    expect(metrics.askDepthUsd).toBeGreaterThan(500);
    expect(metrics.liquidityScore).toBeGreaterThan(0);
    expect(metrics.liquidityScore).toBeLessThanOrEqual(100);
  });

  it("produces 2PC intent leg when tail triggers and liquidity is healthy", () => {
    const snapshot = parseOrderbookSnapshot(TEST_TOKEN_ID, SAMPLE_ORDERBOOK);
    const evalResult = evaluateTailSleeveFromSnapshot(snapshot, {
      hedgeSizeUsd: 50,
      symbol: "ETH-TAIL",
    });

    expect(evalResult.tailTriggered).toBe(true);
    expect(evalResult.readyFor2Pc).toBe(true);
    expect(evalResult.proposedLeg).toEqual(
      buildPolymarketIntentLeg(50, "ETH-TAIL"),
    );
  });

  it("blocks 2PC when funding rate or volatility exceeds limits", () => {
    const snapshot = parseOrderbookSnapshot(TEST_TOKEN_ID, SAMPLE_ORDERBOOK);

    const highFunding = evaluateTailSleeveFromSnapshot(snapshot, {
      hedgeSizeUsd: 50,
      fundingRate: DEFAULT_MAX_FUNDING_RATE + 0.001,
    });
    expect(highFunding.readyFor2Pc).toBe(false);
    expect(highFunding.reasons.some((r) => r.startsWith("FUNDING_RATE"))).toBe(true);

    const highVol = evaluateTailSleeveFromSnapshot(snapshot, {
      hedgeSizeUsd: 50,
      symbolVolatility: DEFAULT_MAX_SYMBOL_VOLATILITY + 0.02,
    });
    expect(highVol.readyFor2Pc).toBe(false);
    expect(highVol.reasons.some((r) => r.startsWith("SYMBOL_VOL"))).toBe(true);
  });

  it("fetches orderbook and evaluates realtime sleeve (mocked)", async () => {
    const fetchFn = vi.fn(async () => jsonResponse(SAMPLE_ORDERBOOK));

    const evalResult = await evaluateRealtimeTailSleeve({
      tokenId: TEST_TOKEN_ID,
      hedgeSizeUsd: 25,
      fetchOptions: { fetchFn },
    });

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(evalResult.snapshot.impliedProbability).toBe(0.071);
    expect(evalResult.proposedLeg?.venue).toBe("POLYMARKET");
  });

  it("integrates proposed leg with 2PC intent ledger prepare", async () => {
    const snapshot = parseOrderbookSnapshot(TEST_TOKEN_ID, SAMPLE_ORDERBOOK);
    const sleeve = evaluateTailSleeveFromSnapshot(snapshot, { hedgeSizeUsd: 40 });
    expect(sleeve.proposedLeg).not.toBeNull();

    const hlLeg = { venue: "HL" as const, side: "SHORT" as const, sizeUsd: 400, symbol: "ETH" };
    createCrossLegIntent({
      id: "poly-sleeve-1",
      legs: [hlLeg, sleeve.proposedLeg!],
    });

    const result = await prepareIntent("poly-sleeve-1", {
      prepareLeg: async (leg, index) => ({
        legIndex: index,
        ok: true,
        filledUsd: leg.sizeUsd,
      }),
    });

    expect(result.ok).toBe(true);
    expect(result.intent.phase).toBe("PREPARED");
  });
});
