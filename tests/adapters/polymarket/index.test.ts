import { Wallet } from "ethers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_TAIL_HEDGE_THRESHOLD,
  HedgeExecutionBlockedError,
  PolymarketApiError,
  createHedgeOrderPayload,
  evaluateTailHedgeTrigger,
  fetchMarketSnapshot,
  fetchOrderbook,
  formatProbability,
  parseOrderbookSnapshot,
  signHedgeOrderPayload,
  submitHedgeOrder,
  usdToOutcomeSize,
} from "../../../src/adapters/polymarket/index";
import {
  R20_LOCKED,
  __setSystemStateForTests,
  buildBlockedSystemState,
  buildSystemState,
} from "../../../src/core/state";

const TEST_TOKEN_ID = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
const TEST_MARKET_ID = "0x1234567890123456789012345678901234567890";

const SAMPLE_ORDERBOOK = {
  market: TEST_MARKET_ID,
  asset_id: TEST_TOKEN_ID,
  timestamp: "1700000000",
  hash: "abc123",
  bids: [
    { price: "0.05", size: "1200" },
    { price: "0.04", size: "800" },
  ],
  asks: [
    { price: "0.07", size: "500" },
    { price: "0.08", size: "300" },
  ],
  min_order_size: "1",
  tick_size: "0.01",
  neg_risk: false,
  last_trade_price: "0.06",
};

const HEALTHY_STATE = buildSystemState({
  accountBalanceUsd: 10_000,
  currentCri: 100,
  skipHardlockAssert: true,
});

const BLOCKED_STATE = buildBlockedSystemState(10_000);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("polymarket — tail hedge trigger", () => {
  it("fires when market price is at or below threshold", () => {
    expect(evaluateTailHedgeTrigger(0.07, DEFAULT_TAIL_HEDGE_THRESHOLD)).toBe(true);
    expect(evaluateTailHedgeTrigger(0.08, 0.08)).toBe(true);
    expect(evaluateTailHedgeTrigger(0.09, 0.08)).toBe(false);
  });

  it("rejects invalid probabilities", () => {
    expect(evaluateTailHedgeTrigger(0, 0.08)).toBe(false);
    expect(evaluateTailHedgeTrigger(1.2, 0.08)).toBe(false);
    expect(evaluateTailHedgeTrigger(0.05, 0)).toBe(false);
    expect(evaluateTailHedgeTrigger(Number.NaN, 0.08)).toBe(false);
  });
});

describe("polymarket — orderbook parsing", () => {
  it("derives implied probability from best ask", () => {
    const snapshot = parseOrderbookSnapshot(TEST_TOKEN_ID, SAMPLE_ORDERBOOK);

    expect(snapshot.tokenId).toBe(TEST_TOKEN_ID);
    expect(snapshot.marketId).toBe(TEST_MARKET_ID);
    expect(snapshot.bestBid).toBe(0.05);
    expect(snapshot.bestAsk).toBe(0.07);
    expect(snapshot.midPrice).toBeCloseTo(0.06);
    expect(snapshot.impliedProbability).toBe(0.07);
    expect(snapshot.spread).toBeCloseTo(0.02);
    expect(snapshot.bidDepthUsd).toBeCloseTo(1200 * 0.05 + 800 * 0.04);
    expect(snapshot.askDepthUsd).toBeCloseTo(500 * 0.07 + 300 * 0.08);
  });

  it("formats probability and USD size helpers", () => {
    expect(formatProbability(0.07)).toBe("0.07");
    expect(usdToOutcomeSize(70, 0.07)).toBe("1000");
  });
});

describe("polymarket — REST fetch (mocked)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetchOrderbook calls CLOB /book endpoint", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(SAMPLE_ORDERBOOK));

    const book = await fetchOrderbook(TEST_TOKEN_ID);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("/book?token_id=");
    expect(url).toContain(encodeURIComponent(TEST_TOKEN_ID));
    expect(book.market).toBe(TEST_MARKET_ID);
    expect(book.bids).toHaveLength(2);
  });

  it("fetchMarketSnapshot wraps orderbook parsing", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(SAMPLE_ORDERBOOK));

    const snapshot = await fetchMarketSnapshot(TEST_TOKEN_ID);

    expect(snapshot.impliedProbability).toBe(0.07);
    expect(
      evaluateTailHedgeTrigger(snapshot.impliedProbability!, DEFAULT_TAIL_HEDGE_THRESHOLD),
    ).toBe(true);
  });

  it("throws PolymarketApiError on HTTP failure", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ error: "not found" }, 404));

    await expect(fetchOrderbook(TEST_TOKEN_ID)).rejects.toMatchObject({
      name: "PolymarketApiError",
      code: "HTTP_ERROR",
      httpStatus: 404,
    });
  });
});

describe("polymarket — hedge order payload", () => {
  afterEach(() => {
    __setSystemStateForTests(null);
  });

  it("builds BUY payload with CLOB fields", () => {
    const payload = createHedgeOrderPayload(TEST_TOKEN_ID, "BUY", 50, {
      systemState: HEALTHY_STATE,
      price: 0.05,
      nonce: "12345",
    });

    expect(payload.marketId).toBe(TEST_TOKEN_ID);
    expect(payload.orderType).toBe("GTC");
    expect(payload.order).toMatchObject({
      tokenId: TEST_TOKEN_ID,
      side: "BUY",
      price: "0.05",
      size: "1000",
      amountUsd: 50,
      nonce: "12345",
      feeRateBps: "0",
      signatureType: 0,
      signature: "",
    });
    expect(payload.order.expiration).toMatch(/^\d+$/);
  });

  it("blocks payload when R20_LOCKED / hardlock active", () => {
    expect(() =>
      createHedgeOrderPayload(TEST_TOKEN_ID, "BUY", 25, {
        systemState: BLOCKED_STATE,
        price: 0.05,
      }),
    ).toThrow(HedgeExecutionBlockedError);

    try {
      createHedgeOrderPayload(TEST_TOKEN_ID, "BUY", 25, {
        systemState: BLOCKED_STATE,
        price: 0.05,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(HedgeExecutionBlockedError);
      expect((err as HedgeExecutionBlockedError).lockState).toBe(R20_LOCKED);
    }
  });

  it("blocks payload when rootProtection loss exceeds dynamic Max SL", () => {
    const tightState = buildSystemState({
      accountBalanceUsd: 100,
      currentCri: 80,
      skipHardlockAssert: true,
    });

    expect(() =>
      createHedgeOrderPayload(TEST_TOKEN_ID, "BUY", 500, {
        systemState: tightState,
        price: 0.05,
      }),
    ).toThrow(HedgeExecutionBlockedError);
  });

  it("signHedgeOrderPayload attaches signer signature", async () => {
    const wallet = new Wallet(
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    );
    const payload = createHedgeOrderPayload(TEST_TOKEN_ID, "SELL", 20, {
      systemState: HEALTHY_STATE,
      price: 0.06,
    });

    const signed = await signHedgeOrderPayload(payload, wallet);

    expect(signed.order.signature).toMatch(/^0x[0-9a-f]+$/i);
    expect(signed.order.side).toBe("SELL");
  });
});

describe("polymarket — submitHedgeOrder", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    __setSystemStateForTests(null);
  });

  it("dryRun skips POST but returns payload", async () => {
    const result = await submitHedgeOrder(TEST_TOKEN_ID, "BUY", 10, 0.05, {
      systemState: HEALTHY_STATE,
      dryRun: true,
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.dryRun).toBe(true);
    expect(result.payload.order.amountUsd).toBe(10);
  });

  it("posts signed order to CLOB /order", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ success: true, orderID: "abc" }));

    const wallet = new Wallet(
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    );

    const result = await submitHedgeOrder(TEST_TOKEN_ID, "BUY", 15, 0.05, {
      systemState: HEALTHY_STATE,
      signer: wallet,
      owner: "api-key-id",
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/order");
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body as string) as {
      order: { signature: string; side: string };
      owner: string;
      orderType: string;
    };

    expect(body.order.signature).toMatch(/^0x/i);
    expect(body.order.side).toBe("BUY");
    expect(body.owner).toBe("api-key-id");
    expect(body.orderType).toBe("GTC");
    expect(result.response).toEqual({ success: true, orderID: "abc" });
  });

  it("does not submit when R20_LOCKED", async () => {
    await expect(
      submitHedgeOrder(TEST_TOKEN_ID, "BUY", 10, 0.05, {
        systemState: BLOCKED_STATE,
        dryRun: true,
      }),
    ).rejects.toBeInstanceOf(HedgeExecutionBlockedError);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("polymarket — error shapes", () => {
  it("exposes HedgeExecutionBlockedError metadata", () => {
    const err = new HedgeExecutionBlockedError("blocked", R20_LOCKED, ["hardlock=true"]);
    expect(err.code).toBe("HEDGE_EXECUTION_BLOCKED");
    expect(err.httpStatus).toBe(403);
    expect(err.lockState).toBe(R20_LOCKED);
  });

  it("exposes PolymarketApiError metadata", () => {
    const err = new PolymarketApiError("fail", "HTTP_ERROR", 500);
    expect(err.code).toBe("HTTP_ERROR");
    expect(err.httpStatus).toBe(500);
  });
});
