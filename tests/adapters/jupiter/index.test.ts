import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../../../src/env";
import {
  JupiterApiError,
  JupiterExecutionBlockedError,
  PGATE_MAX_SLIPPAGE_BPS,
  SYSTEM_STATE_KV_KEY,
  SYSTEM_STATE_R20_FLAG_KEY,
  combinedSlippageBps,
  evaluateJupiterSoilResistance,
  executeJupiterQuote,
  executeJupiterQuoteWithEnv,
  fetchJupiterQuote,
  isKvR20LockedFlag,
  parseJupiterQuote,
  usdToAtomicAmount,
} from "../../../src/adapters/jupiter/index";
import {
  R20_LOCKED,
  __setSystemStateForTests,
  buildBlockedSystemState,
  buildSystemState,
} from "../../../src/core/state";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const SAMPLE_QUOTE = {
  inputMint: SOL_MINT,
  outputMint: USDC_MINT,
  inAmount: "100000000",
  outAmount: "16198753",
  slippageBps: 10,
  priceImpactPct: "0.05",
  swapMode: "ExactIn",
  routePlan: [],
};

const HEALTHY_STATE = buildSystemState({
  accountBalanceUsd: 10_000,
  currentCri: 100,
  skipHardlockAssert: true,
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  __setSystemStateForTests(null);
});

describe("jupiter — quote helpers", () => {
  it("converts USD to atomic amount", () => {
    expect(usdToAtomicAmount(100)).toBe("100000000");
  });

  it("parses wire quote", () => {
    const quote = parseJupiterQuote(SAMPLE_QUOTE, 100);
    expect(quote.amountUsd).toBe(100);
    expect(quote.slippageBps).toBe(10);
    expect(combinedSlippageBps(quote).combinedSlippageBps).toBe(15);
  });
});

describe("jupiter — evaluateJupiterSoilResistance", () => {
  it("passes when combined slippage is within Pgate limit", () => {
    const quote = parseJupiterQuote(SAMPLE_QUOTE, 100);
    const evalResult = evaluateJupiterSoilResistance(quote, PGATE_MAX_SLIPPAGE_BPS);

    expect(evalResult.ok).toBe(true);
    expect(evalResult.tripped).toBe(false);
    expect(evalResult.soil.tripped).toBe(false);
  });

  it("trips when price impact + slippage exceeds maxSlippageBps", () => {
    const quote = parseJupiterQuote(
      { ...SAMPLE_QUOTE, slippageBps: 20, priceImpactPct: "0.2" },
      100,
    );
    const evalResult = evaluateJupiterSoilResistance(quote, PGATE_MAX_SLIPPAGE_BPS);

    expect(evalResult.tripped).toBe(true);
    expect(evalResult.reasons.some((r) => r.includes("JUPITER_COMBINED_SLIPPAGE"))).toBe(
      true,
    );
  });

  it("links high slippage into checkSoilResistance cross-venue trip", () => {
    const quote = parseJupiterQuote(
      { ...SAMPLE_QUOTE, slippageBps: 80, priceImpactPct: "1" },
      100,
    );
    const evalResult = evaluateJupiterSoilResistance(quote, 200);

    expect(evalResult.soil.tripped).toBe(true);
    expect(evalResult.tripped).toBe(true);
  });
});

describe("jupiter — fetchJupiterQuote (mocked)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches quote from Jupiter v6 endpoint", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(SAMPLE_QUOTE));

    const quote = await fetchJupiterQuote(SOL_MINT, USDC_MINT, 100);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("/quote?");
    expect(url).toContain(`inputMint=${SOL_MINT}`);
    expect(url).toContain(`amount=${usdToAtomicAmount(100)}`);
    expect(quote.outAmount).toBe("16198753");
  });

  it("throws JupiterApiError on HTTP failure", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ error: "fail" }, 500));

    await expect(fetchJupiterQuote(SOL_MINT, USDC_MINT, 50)).rejects.toMatchObject({
      name: "JupiterApiError",
      code: "HTTP_ERROR",
      httpStatus: 500,
    });
  });
});

describe("jupiter — executeJupiterQuote gates", () => {
  it("dryRun passes when gates and soil are clear", async () => {
    const quote = parseJupiterQuote(SAMPLE_QUOTE, 50);

    const result = await executeJupiterQuote(quote, {
      systemState: HEALTHY_STATE,
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.soil.ok).toBe(true);
  });

  it("blocks when isR20Locked", async () => {
    const quote = parseJupiterQuote(SAMPLE_QUOTE, 50);

    await expect(
      executeJupiterQuote(quote, { systemState: buildBlockedSystemState() }),
    ).rejects.toMatchObject({
      name: "JupiterExecutionBlockedError",
      lockState: R20_LOCKED,
    });
  });

  it("blocks when rootProtection exceeds dynamic Max SL", async () => {
    const quote = parseJupiterQuote(SAMPLE_QUOTE, 500);
    const tightState = buildSystemState({
      accountBalanceUsd: 100,
      currentCri: 80,
      skipHardlockAssert: true,
    });

    await expect(
      executeJupiterQuote(quote, { systemState: tightState, dryRun: true }),
    ).rejects.toMatchObject({
      name: "JupiterExecutionBlockedError",
      lockState: "ROOT_PROTECTION",
    });
  });

  it("blocks when soil resistance trips", async () => {
    const quote = parseJupiterQuote(
      { ...SAMPLE_QUOTE, slippageBps: 50, priceImpactPct: "1" },
      50,
    );

    await expect(
      executeJupiterQuote(quote, { systemState: HEALTHY_STATE, dryRun: true }),
    ).rejects.toMatchObject({
      name: "JupiterExecutionBlockedError",
      lockState: "SOIL_RESISTANCE",
    });
  });
});

function mockSystemStateKv(store: Record<string, string>): KVNamespace {
  return {
    get: vi.fn(async (key: string) => store[key] ?? null),
    put: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
    list: vi.fn(async () => ({ keys: [], list_complete: true, cacheStatus: null })),
    getWithMetadata: vi.fn(async (key: string) => ({
      value: store[key] ?? null,
      metadata: null,
      cacheStatus: null,
    })),
  } as unknown as KVNamespace;
}

describe("jupiter — executeJupiterQuoteWithEnv (Edge KV)", () => {
  it("detects KV R20_LOCKED flag values", () => {
    expect(isKvR20LockedFlag("true")).toBe(true);
    expect(isKvR20LockedFlag(R20_LOCKED)).toBe(true);
    expect(isKvR20LockedFlag("false")).toBe(false);
  });

  it("blocks Jupiter orders when Edge KV R20 flag is set", async () => {
    const quote = parseJupiterQuote(SAMPLE_QUOTE, 50);
    const env: Env = {
      SLIVERVINE_KV: mockSystemStateKv({
        [SYSTEM_STATE_R20_FLAG_KEY]: R20_LOCKED,
      }),
    };

    await expect(
      executeJupiterQuoteWithEnv(quote, env, { dryRun: true }),
    ).rejects.toMatchObject({
      name: "JupiterExecutionBlockedError",
      lockState: R20_LOCKED,
      reasons: [`kv:${SYSTEM_STATE_R20_FLAG_KEY}=${R20_LOCKED}`],
    });
  });

  it("blocks when KV snapshot embeds r20Locked", async () => {
    const quote = parseJupiterQuote(SAMPLE_QUOTE, 50);
    const env: Env = {
      SLIVERVINE_KV: mockSystemStateKv({
        [SYSTEM_STATE_KV_KEY]: JSON.stringify({
          version: 1,
          savedAt: new Date().toISOString(),
          state: { r20Locked: true },
        }),
      }),
    };

    await expect(
      executeJupiterQuoteWithEnv(quote, env, { dryRun: true }),
    ).rejects.toMatchObject({
      lockState: R20_LOCKED,
    });
  });

  it("executes on Edge runtime when KV state is healthy", async () => {
    const quote = parseJupiterQuote(SAMPLE_QUOTE, 50);
    const env: Env = {
      SLIVERVINE_KV: mockSystemStateKv({
        [SYSTEM_STATE_R20_FLAG_KEY]: "false",
        [SYSTEM_STATE_KV_KEY]: JSON.stringify({
          version: 1,
          savedAt: new Date().toISOString(),
          state: {
            accountBalanceUsd: 10_000,
            currentCri: 100,
            hardlock: false,
            signingChannelOpen: true,
            isHedgeActive: true,
          },
        }),
      }),
    };

    const result = await executeJupiterQuoteWithEnv(quote, env, { dryRun: true });

    expect(result.runtime).toBe("edge");
    expect(result.dryRun).toBe(true);
    expect(result.soil.ok).toBe(true);
  });

  it("falls back to local runtime without SLIVERVINE_KV binding", async () => {
    __setSystemStateForTests({
      ...HEALTHY_STATE,
      isHedgeActive: true,
    });
    const quote = parseJupiterQuote(SAMPLE_QUOTE, 50);

    const result = await executeJupiterQuoteWithEnv(quote, {}, { dryRun: true });

    expect(result.runtime).toBe("local");
    expect(result.dryRun).toBe(true);
  });
});

describe("jupiter — error shapes", () => {
  it("exposes JupiterExecutionBlockedError metadata", () => {
    const err = new JupiterExecutionBlockedError("blocked", R20_LOCKED, ["x"]);
    expect(err.code).toBe("JUPITER_EXECUTION_BLOCKED");
    expect(err.httpStatus).toBe(403);
  });

  it("exposes JupiterApiError metadata", () => {
    const err = new JupiterApiError("fail", "HTTP_ERROR", 429);
    expect(err.httpStatus).toBe(429);
  });
});
