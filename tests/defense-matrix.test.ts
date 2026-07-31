import { afterEach, describe, expect, it, vi } from "vitest";
import {
  R20_LOCKED,
  __setSystemStateForTests,
  buildBlockedSystemState,
  buildSystemState,
  isR20Locked,
  readActiveSystemState,
  resolveRiskLockLabel,
  updateSystemState,
} from "../src/core/state";
import {
  HardlockError,
  RiskLimitExceeded,
  checkSoilResistance,
  computeEffectiveMaxSlUsd,
  vineWrapProtection,
} from "../src/core/risk";
import {
  DefenseMatrixError,
  PGATE_MAX_SLIPPAGE_BPS,
  assertSystemStateGates,
  evaluateJupiterSoilResistance,
  fetchJupiterQuote,
  type JupiterQuoteResponse,
} from "../src/services/jupiter-adapter";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

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

function highImpactQuote(): JupiterQuoteResponse {
  return {
    inputMint: SOL_MINT,
    outputMint: USDC_MINT,
    inAmount: "100000000",
    outAmount: "15000000",
    slippageBps: 10,
    priceImpactPct: "1.5",
    swapMode: "ExactIn",
    routePlan: [],
  };
}

afterEach(() => {
  __setSystemStateForTests(null);
  vi.restoreAllMocks();
});

describe("Defense Matrix — Jupiter Route Slippage Attack", () => {
  it("evaluateJupiterSoilResistance throws DefenseMatrixError on 1.5% price impact", () => {
    const quote = highImpactQuote();

    expect(() =>
      evaluateJupiterSoilResistance(quote, PGATE_MAX_SLIPPAGE_BPS, 100),
    ).toThrow(DefenseMatrixError);

    try {
      evaluateJupiterSoilResistance(quote, PGATE_MAX_SLIPPAGE_BPS, 100);
    } catch (err) {
      expect(err).toBeInstanceOf(DefenseMatrixError);
      const matrixErr = err as DefenseMatrixError;
      expect(matrixErr.code).toBe("SOIL_RESISTANCE_SLIPPAGE_BREAKER");
      expect(matrixErr.httpStatus).toBe(422);
      expect(matrixErr.reasons.some((r) => r.startsWith("PRICE_IMPACT="))).toBe(
        true,
      );
    }
  });

  it("routes slippage through checkSoilResistance() cross-venue probe", () => {
    const quote = highImpactQuote();
    const { combinedSlippageBps: totalBps } = {
      combinedSlippageBps:
        Math.abs(Number(quote.priceImpactPct)) * 100 + quote.slippageBps,
    };
    const slippageRatio = totalBps / 10_000;
    const basePx = 50_000;

    const soil = checkSoilResistance({
      symbol: "JUP_SWAP",
      hlSpot: basePx,
      hlPerp: basePx,
      dydxPerp: basePx * (1 + slippageRatio),
      depthUsd: 500_000,
    });

    expect(soil.tripped).toBe(true);
    expect(soil.reasons.length).toBeGreaterThan(0);
  });

  it("fetchJupiterQuote intercepts mocked high-impact Jupiter route", async () => {
    const mockFetch = vi.fn().mockResolvedValue(jsonResponse(highImpactQuote()));

    await expect(
      fetchJupiterQuote(
        {
          inputMint: SOL_MINT,
          outputMint: USDC_MINT,
          amount: "100000000",
          slippageBps: 10,
        },
        {
          fetchFn: mockFetch,
          systemState: HEALTHY_STATE,
          amountUsd: 100,
        },
      ),
    ).rejects.toMatchObject({
      name: "DefenseMatrixError",
      code: "SOIL_RESISTANCE_SLIPPAGE_BREAKER",
    });

    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("passes clean quote below slippage threshold", () => {
    const cleanQuote: JupiterQuoteResponse = {
      inputMint: SOL_MINT,
      outputMint: USDC_MINT,
      inAmount: "100000000",
      outAmount: "16198753",
      slippageBps: 5,
      priceImpactPct: "0.05",
    };

    const soil = evaluateJupiterSoilResistance(
      cleanQuote,
      PGATE_MAX_SLIPPAGE_BPS,
      100,
    );

    expect(soil.ok).toBe(true);
    expect(soil.tripped).toBe(false);
    expect(soil.soil.tripped).toBe(false);
  });
});

describe("Defense Matrix — Dynamic Max SL Breaker Attack", () => {
  const ACCOUNT_BALANCE_USD = 10_000;
  const EXPECTED_MAX_SL = 200;

  it("computes dynamic Max SL as Balance × 1% + $100", () => {
    expect(computeEffectiveMaxSlUsd(ACCOUNT_BALANCE_USD)).toBe(EXPECTED_MAX_SL);

    const state = buildSystemState({
      accountBalanceUsd: ACCOUNT_BALANCE_USD,
      currentCri: 100,
      skipHardlockAssert: true,
    });

    expect(state.dynamicMaxSL).toBe(EXPECTED_MAX_SL);
  });

  it("vineWrapProtection rejects oversized loss above $200 Max SL", () => {
    expect(() =>
      vineWrapProtection({
        symbol: "ATTACK_VECTOR",
        estimatedLossUsd: 250,
        accountBalanceUsd: ACCOUNT_BALANCE_USD,
      }),
    ).toThrow(RiskLimitExceeded);

    try {
      vineWrapProtection({
        symbol: "ATTACK_VECTOR",
        estimatedLossUsd: 250,
        accountBalanceUsd: ACCOUNT_BALANCE_USD,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(RiskLimitExceeded);
      expect((err as RiskLimitExceeded).message).toContain("200");
    }
  });

  it("assertSystemStateGates maps Max SL breach to DefenseMatrixError", () => {
    expect(() =>
      assertSystemStateGates(HEALTHY_STATE, 250),
    ).toThrow(DefenseMatrixError);

    try {
      assertSystemStateGates(HEALTHY_STATE, 250);
    } catch (err) {
      expect(err).toBeInstanceOf(DefenseMatrixError);
      expect((err as DefenseMatrixError).code).toBe("ROOT_PROTECTION");
    }
  });

  it("allows loss at exact Max SL boundary", () => {
    expect(() =>
      vineWrapProtection({
        symbol: "BOUNDARY_OK",
        estimatedLossUsd: EXPECTED_MAX_SL,
        accountBalanceUsd: ACCOUNT_BALANCE_USD,
      }),
    ).not.toThrow();
  });
});

describe("Defense Matrix — R20 Physical Deadlock Execution", () => {
  it("vineWrapProtection criHardlock throws HardlockError (403 deadlock)", () => {
    expect(() =>
      vineWrapProtection({
        symbol: "R20_TRIP",
        estimatedLossUsd: 50,
        accountBalanceUsd: 10_000,
        criHardlock: true,
      }),
    ).toThrow(HardlockError);
  });

  it("updateSystemState hardlocks on CRI === 0 circuit breaker trip", () => {
    const locked = updateSystemState({
      patch: { currentCri: 0, hardlock: true },
    });

    expect(locked.hardlock).toBe(true);
    expect(locked.signingChannelOpen).toBe(false);
    expect(locked.currentCri).toBe(0);
    expect(isR20Locked(locked)).toBe(true);
    expect(resolveRiskLockLabel(locked)).toBe(R20_LOCKED);
  });

  it("buildBlockedSystemState produces R20-ready deadlock snapshot", () => {
    const blocked = buildBlockedSystemState(10_000);

    expect(blocked.hardlock).toBe(true);
    expect(blocked.signingChannelOpen).toBe(false);
    expect(blocked.currentCri).toBe(0);
    expect(isR20Locked(blocked)).toBe(true);
  });

  it("fetchJupiterQuote rejects when R20 physical deadlock is active", async () => {
    const blocked = buildBlockedSystemState(10_000);
    __setSystemStateForTests(blocked);

    const mockFetch = vi.fn().mockResolvedValue(
      jsonResponse({
        inputMint: SOL_MINT,
        outputMint: USDC_MINT,
        inAmount: "100000000",
        outAmount: "16198753",
        slippageBps: 5,
        priceImpactPct: "0.05",
      }),
    );

    await expect(
      fetchJupiterQuote(
        {
          inputMint: SOL_MINT,
          outputMint: USDC_MINT,
          amount: "100000000",
          slippageBps: 5,
        },
        { fetchFn: mockFetch, systemState: readActiveSystemState() },
      ),
    ).rejects.toMatchObject({
      name: "DefenseMatrixError",
      code: R20_LOCKED,
      httpStatus: 403,
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("assertSystemStateGates blocks when signingChannelOpen is false", () => {
    const severed = buildSystemState({
      accountBalanceUsd: 10_000,
      currentCri: 100,
      skipHardlockAssert: true,
    });
    severed.signingChannelOpen = false;

    expect(() => assertSystemStateGates(severed, 50)).toThrow(
      DefenseMatrixError,
    );

    try {
      assertSystemStateGates(severed, 50);
    } catch (err) {
      expect((err as DefenseMatrixError).code).toBe(R20_LOCKED);
      expect((err as DefenseMatrixError).httpStatus).toBe(403);
    }
  });
});
