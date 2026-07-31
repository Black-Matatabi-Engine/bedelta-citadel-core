import { Wallet } from "ethers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "../../../src/adapters/hl/auth";
import {
  HL_EXCHANGE_URL,
  HyperliquidExecutionError,
  PGATE_MAX_LATENCY_MS,
  PGATE_MAX_SLIPPAGE,
  PreTradeValidationError,
  assertPreTradeValidation,
  buildCancelAction,
  buildCancelByCloidAction,
  buildLimitOrderWire,
  buildMarketOrderWire,
  buildOrderAction,
  buildTriggerOrderWire,
  cancelOrder,
  cancelOrderByCloid,
  executeSignedAction,
  floatToWire,
  placeLimitOrder,
  placeLimitWithStopLoss,
  postExchangeRequest,
  sessionKeyFromAgentResult,
} from "../../../src/adapters/hl/execution";
import { SigningChannelLockedError } from "../../../src/adapters/hl/auth";

const TEST_PRIVATE_KEY =
  "0x0000000000000000000000000000000000000000000000000000000000000001" as const;
const TEST_AGENT_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

const PASSING_PRE_TRADE = {
  symbol: "BTC",
  hlSpot: 50_000,
  hlPerp: 50_010,
  dydxPerp: 50_005,
  depthUsd: 500_000,
  latencyMs: 50,
  expectedSlippage: 0.0005,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("hl/execution — wire builders", () => {
  it("floatToWire normalizes prices to HL string format", () => {
    expect(floatToWire(1.5)).toBe("1.5");
    expect(floatToWire(50000)).toBe("50000");
  });

  it("builds limit, market, and trigger order wires", () => {
    expect(buildLimitOrderWire({
      asset: 0,
      isBuy: true,
      size: 0.01,
      limitPx: 50000,
    })).toEqual({
      a: 0,
      b: true,
      p: "50000",
      s: "0.01",
      r: false,
      t: { limit: { tif: "Gtc" } },
    });

    expect(buildMarketOrderWire({
      asset: 0,
      isBuy: false,
      size: 0.02,
      limitPx: 49000,
    }).t).toEqual({ limit: { tif: "Ioc" } });

    expect(buildTriggerOrderWire({
      asset: 0,
      isBuy: false,
      size: 0.01,
      triggerPx: 48000,
      tpsl: "sl",
    })).toMatchObject({
      p: "0",
      r: true,
      t: { trigger: { triggerPx: "48000", isMarket: true, tpsl: "sl" } },
    });
  });

  it("builds cancel and cancelByCloid actions", () => {
    expect(buildCancelAction([{ asset: 0, oid: 999 }])).toEqual({
      type: "cancel",
      cancels: [{ a: 0, o: 999 }],
    });
    expect(buildCancelByCloidAction([{ asset: 0, cloid: "0xabc" }])).toEqual({
      type: "cancelByCloid",
      cancels: [{ a: 0, cloid: "0xabc" }],
    });
  });
});

describe("hl/execution — pre-trade validation (Pgate)", () => {
  it("passes when soil, latency, and slippage are within limits", () => {
    expect(() => assertPreTradeValidation(PASSING_PRE_TRADE)).not.toThrow();
  });

  it("blocks when latency exceeds 200ms", () => {
    expect(() =>
      assertPreTradeValidation({ ...PASSING_PRE_TRADE, latencyMs: 250 }),
    ).toThrow(PreTradeValidationError);

    try {
      assertPreTradeValidation({ ...PASSING_PRE_TRADE, latencyMs: 250 });
    } catch (err) {
      expect(err).toBeInstanceOf(PreTradeValidationError);
      expect((err as PreTradeValidationError).reasons.some((r) => r.includes("LATENCY_MS"))).toBe(true);
    }
  });

  it("blocks when expected slippage exceeds 0.15%", () => {
    expect(() =>
      assertPreTradeValidation({ ...PASSING_PRE_TRADE, expectedSlippage: 0.002 }),
    ).toThrow(PreTradeValidationError);
    expect(PGATE_MAX_SLIPPAGE).toBe(0.0015);
    expect(PGATE_MAX_LATENCY_MS).toBe(200);
  });

  it("blocks when checkSoilResistance trips", () => {
    expect(() =>
      assertPreTradeValidation({
        ...PASSING_PRE_TRADE,
        hlPerp: 0,
        dydxPerp: 0,
      }),
    ).toThrow(PreTradeValidationError);
  });
});

describe("hl/execution — signed HTTP POST", () => {
  const wallet = new Wallet(TEST_PRIVATE_KEY);
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts signed order payload with correct structure", async () => {
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({ status: "ok", response: { type: "order" } }),
    );

    const signSpy = vi.spyOn(auth, "signHyperliquidAction").mockResolvedValue(
      "0x" + "11".repeat(65),
    );
    vi.spyOn(auth, "splitHyperliquidSignature").mockReturnValue({
      r: "0x" + "a".repeat(64),
      s: "0x" + "b".repeat(64),
      v: 27,
    });

    const action = buildOrderAction([
      buildLimitOrderWire({ asset: 0, isBuy: true, size: 0.01, limitPx: 50000 }),
    ]);

    const result = await executeSignedAction(action, {
      signer: wallet,
      sessionKey: {
        agentAddress: TEST_AGENT_ADDRESS,
        expiresAt: Date.now() + 60_000,
      },
    }, {
      nonce: 1_700_000_000_000,
      preTrade: PASSING_PRE_TRADE,
    });

    expect(signSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledOnce();

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(HL_EXCHANGE_URL);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });

    const body = JSON.parse(init.body as string) as {
      action: { type: string; orders: unknown[] };
      nonce: number;
      signature: { r: string; s: string; v: number };
    };

    expect(body.action.type).toBe("order");
    expect(body.action.orders).toHaveLength(1);
    expect(body.nonce).toBe(1_700_000_000_000);
    expect(body.signature).toMatchObject({ r: expect.stringMatching(/^0x/), s: expect.stringMatching(/^0x/), v: expect.any(Number) });
    expect(result.response.status).toBe("ok");
    expect(result.sessionKeyAddress).toBe(TEST_AGENT_ADDRESS);
  });

  it("dryRun skips fetch but still signs", async () => {
    const signSpy = vi.spyOn(auth, "signHyperliquidAction").mockResolvedValue(
      "0x" + "22".repeat(65),
    );
    vi.spyOn(auth, "splitHyperliquidSignature").mockReturnValue({
      r: "0x" + "c".repeat(64),
      s: "0x" + "d".repeat(64),
      v: 28,
    });

    const action = buildCancelAction([{ asset: 0, oid: 1 }]);
    const result = await executeSignedAction(action, {
      signer: wallet,
      dryRun: true,
    }, { skipPreTrade: true });

    expect(signSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.dryRun).toBe(true);
    expect(result.response.status).toBe("dry_run");
  });

  it("handles rate limit (429)", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ error: "rate limit" }, 429));

    await expect(
      postExchangeRequest({
        action: { type: "cancel", cancels: [] },
        nonce: 1,
        signature: { r: "0x1", s: "0x2", v: 27 },
      }),
    ).rejects.toMatchObject({
      name: "HyperliquidExecutionError",
      code: "RATE_LIMIT",
      httpStatus: 429,
    });
  });

  it("handles execution reject (non-ok status field)", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ status: "err", response: "bad order" }));

    await expect(
      postExchangeRequest({
        action: { type: "order", orders: [], grouping: "na" },
        nonce: 1,
        signature: { r: "0x1", s: "0x2", v: 27 },
      }),
    ).rejects.toMatchObject({
      name: "HyperliquidExecutionError",
      code: "EXECUTION_REJECT",
    });
  });

  it("handles HTTP error responses", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ error: "server error" }, 500));

    await expect(
      postExchangeRequest({
        action: { type: "cancel", cancels: [] },
        nonce: 1,
        signature: { r: "0x1", s: "0x2", v: 27 },
      }),
    ).rejects.toMatchObject({
      code: "HTTP_ERROR",
      httpStatus: 500,
    });
  });

  it("placeLimitOrder blocks when pre-trade fails", async () => {
    await expect(
      placeLimitOrder(
        {
          asset: 0,
          isBuy: true,
          size: 0.01,
          limitPx: 50000,
          preTrade: { ...PASSING_PRE_TRADE, latencyMs: 999 },
        },
        { signer: wallet, dryRun: true },
      ),
    ).rejects.toBeInstanceOf(PreTradeValidationError);
  });

  it("cancelOrder skips pre-trade but requires signing", async () => {
    vi.spyOn(auth, "signHyperliquidAction").mockResolvedValue(
      "0x" + "33".repeat(65),
    );
    fetchSpy.mockResolvedValueOnce(jsonResponse({ status: "ok" }));

    const result = await cancelOrder({ asset: 0, oid: 42 }, { signer: wallet });
    expect(result.request.action).toEqual({
      type: "cancel",
      cancels: [{ a: 0, o: 42 }],
    });
  });

  it("cancelOrderByCloid posts cancelByCloid action", async () => {
    vi.spyOn(auth, "signHyperliquidAction").mockResolvedValue(
      "0x" + "44".repeat(65),
    );
    fetchSpy.mockResolvedValueOnce(jsonResponse({ status: "ok" }));

    const result = await cancelOrderByCloid(
      { asset: 1, cloid: "0xdeadbeef" },
      { signer: wallet },
    );
    expect(result.request.action.type).toBe("cancelByCloid");
  });

  it("rejects expired session key before signing", async () => {
    await expect(
      executeSignedAction(
        buildCancelAction([{ asset: 0, oid: 1 }]),
        {
          signer: wallet,
          sessionKey: {
            agentAddress: TEST_AGENT_ADDRESS,
            expiresAt: Date.now() - 1,
          },
          dryRun: true,
        },
        { skipPreTrade: true },
      ),
    ).rejects.toBeInstanceOf(SigningChannelLockedError);
  });

  it("placeLimitWithStopLoss sends atomic entry + SL grouping", async () => {
    vi.spyOn(auth, "signHyperliquidAction").mockResolvedValue(
      "0x" + "55".repeat(65),
    );
    fetchSpy.mockResolvedValueOnce(jsonResponse({ status: "ok" }));

    const result = await placeLimitWithStopLoss(
      {
        asset: 0,
        isBuy: true,
        size: 0.01,
        limitPx: 50000,
        stopTriggerPx: 48000,
        preTrade: PASSING_PRE_TRADE,
      },
      { signer: wallet },
    );

    const action = result.request.action as {
      type: string;
      orders: unknown[];
      grouping: string;
    };
    expect(action.type).toBe("order");
    expect(action.orders).toHaveLength(2);
    expect(action.grouping).toBe("normalTpsl");
  });

  it("sessionKeyFromAgentResult maps auth result to execution context", () => {
    const ctx = sessionKeyFromAgentResult({
      action: {
        type: "approveAgent",
        signatureChainId: "0x66eee",
        hyperliquidChain: "Mainnet",
        agentAddress: TEST_AGENT_ADDRESS,
        agentName: "BeDeltaSessionKey",
        nonce: 1,
      },
      signature: "0x",
      agentAddress: TEST_AGENT_ADDRESS,
      expiresAt: 999,
      nonce: 1,
      hyperliquidChain: "Mainnet",
    }, "0x0000000000000000000000000000000000000001");

    expect(ctx.agentAddress).toBe(TEST_AGENT_ADDRESS);
    expect(ctx.expiresAt).toBe(999);
    expect(ctx.vaultAddress).toBe("0x0000000000000000000000000000000000000001");
  });
});

describe("hl/execution — HyperliquidExecutionError shape", () => {
  it("exposes code and httpStatus", () => {
    const err = new HyperliquidExecutionError("test", "RATE_LIMIT", 429);
    expect(err.code).toBe("RATE_LIMIT");
    expect(err.httpStatus).toBe(429);
  });
});
