import { describe, expect, it, vi } from "vitest";
import {
  PolymarketAdapter,
  getMarketProbability,
} from "../../src/adapters/polymarket";
import { assertRpcAllowlisted } from "../../src/services/defense/rpc-whitelist";

const CONDITION_ID = "0xabc123condition";
const TOKEN_ID = "71321045679252212594626385532706912750332728571942532289631379312455583992563";

const GAMMA_MARKET = [
  {
    conditionId: CONDITION_ID,
    clobTokenIds: JSON.stringify([TOKEN_ID, "222"]),
    outcomePrices: JSON.stringify(["0.07", "0.93"]),
  },
];

const ORDERBOOK = {
  bids: [
    { price: "0.05", size: "1200" },
    { price: "0.04", size: "800" },
  ],
  asks: [
    { price: "0.07", size: "500" },
    { price: "0.08", size: "300" },
  ],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("polymarket adapter", () => {
  it("getMarketProbability parses gamma outcome prices", async () => {
    const fetchFn = vi.fn(async (url: string) => {
      if (url.includes("gamma-api")) return jsonResponse(GAMMA_MARKET);
      return jsonResponse({ error: "unexpected" }, 404);
    });

    const prob = await getMarketProbability(CONDITION_ID, { fetchFn });
    expect(prob.conditionId).toBe(CONDITION_ID);
    expect(prob.yesProbability).toBe(0.07);
    expect(prob.noProbability).toBe(0.93);
    expect(prob.tokenId).toBe(TOKEN_ID);
  });

  it("getDepth aggregates CLOB book depth and mid prices", async () => {
    const fetchFn = vi.fn(async (url: string) => {
      if (url.includes("gamma-api")) return jsonResponse(GAMMA_MARKET);
      if (url.includes("/book")) return jsonResponse(ORDERBOOK);
      return jsonResponse({}, 404);
    });

    const adapter = new PolymarketAdapter({ fetchFn, benchmarkProb: 0.5 });
    const depth = await adapter.getDepth(CONDITION_ID);

    expect(depth.venue).toBe("polymarket");
    expect(depth.spotPrice).toBeCloseTo(0.06);
    expect(depth.perpPrice).toBe(0.07);
    expect(depth.depthUsd).toBeCloseTo(1200 * 0.05 + 800 * 0.04 + 500 * 0.07 + 300 * 0.08);
  });

  it("getAPY returns probability yield spread from benchmark", async () => {
    const fetchFn = vi.fn(async () => jsonResponse(GAMMA_MARKET));
    const adapter = new PolymarketAdapter({ fetchFn, benchmarkProb: 0.5 });
    const apy = await adapter.getAPY(CONDITION_ID);
    expect(apy).toBeGreaterThan(0);
    expect(apy).toBeLessThan(2);
  });

  it("checkHealth probes CLOB time and gamma markets", async () => {
    const fetchFn = vi.fn(async (url: string) => {
      if (url.includes("/time")) return jsonResponse({ timestamp: 1_700_000_000 });
      if (url.includes("gamma-api")) return jsonResponse(GAMMA_MARKET);
      return jsonResponse({}, 404);
    });

    const health = await new PolymarketAdapter({ fetchFn }).checkHealth();
    expect(health.ok).toBe(true);
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("allowlists Polymarket RPC domains", () => {
    expect(() => assertRpcAllowlisted("https://clob.polymarket.com/time")).not.toThrow();
    expect(() => assertRpcAllowlisted("https://gamma-api.polymarket.com/markets")).not.toThrow();
  });
});
