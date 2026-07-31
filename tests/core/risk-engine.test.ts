import { afterEach, describe, expect, it } from "vitest";
import { evaluateGlobalRiskPolicy } from "../../src/core/risk-engine";
import {
  R20_LOCKED,
  __setSystemStateForTests,
  buildBlockedSystemState,
  buildSystemState,
} from "../../src/core/state";

const PASSING_SOIL = {
  symbol: "BTC",
  hlSpot: 50_000,
  hlPerp: 50_010,
  dydxPerp: 50_005,
  depthUsd: 500_000,
};

const TRIPPED_SOIL = {
  symbol: "BTC",
  hlSpot: 50_000,
  hlPerp: 0,
  dydxPerp: 0,
};

const HEALTHY_STATE = buildSystemState({
  accountBalanceUsd: 10_000,
  currentCri: 100,
  skipHardlockAssert: true,
});

afterEach(() => {
  __setSystemStateForTests(null);
});

describe("evaluateGlobalRiskPolicy", () => {
  it("allows HL intent when R20 clear and soil passes", () => {
    const result = evaluateGlobalRiskPolicy({
      venue: "HL",
      amountUsd: 50,
      systemState: HEALTHY_STATE,
      soil: PASSING_SOIL,
    });

    expect(result).toEqual({ isAllowed: true });
  });

  it("blocks when R20 locked", () => {
    const result = evaluateGlobalRiskPolicy({
      venue: "HL",
      amountUsd: 50,
      systemState: buildBlockedSystemState(),
      soil: PASSING_SOIL,
    });

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toContain(R20_LOCKED);
    expect(result.suggestedHttpCode).toBe(403);
  });

  it("blocks when soil resistance trips", () => {
    const result = evaluateGlobalRiskPolicy({
      venue: "HL",
      amountUsd: 50,
      systemState: HEALTHY_STATE,
      soil: TRIPPED_SOIL,
    });

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toContain("Soil resistance tripped");
    expect(result.suggestedHttpCode).toBe(422);
  });

  it("evaluates Polymarket tail-hedge trigger in unified flow", () => {
    const allowed = evaluateGlobalRiskPolicy({
      venue: "POLYMARKET",
      amountUsd: 25,
      systemState: HEALTHY_STATE,
      soil: PASSING_SOIL,
      tailHedge: { marketPrice: 0.06 },
    });
    expect(allowed.isAllowed).toBe(true);

    const blocked = evaluateGlobalRiskPolicy({
      venue: "POLYMARKET",
      amountUsd: 25,
      systemState: HEALTHY_STATE,
      soil: PASSING_SOIL,
      tailHedge: { marketPrice: 0.12 },
    });
    expect(blocked.isAllowed).toBe(false);
    expect(blocked.suggestedHttpCode).toBe(422);
  });

  it("evaluates Jupiter slippage gate in unified flow", () => {
    const result = evaluateGlobalRiskPolicy({
      venue: "JUPITER",
      amountUsd: 50,
      systemState: HEALTHY_STATE,
      soil: PASSING_SOIL,
      jupiter: {
        quote: {
          inputMint: "So11111111111111111111111111111111111111112",
          outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          inAmount: "100000000",
          outAmount: "16198753",
          slippageBps: 10,
          priceImpactPct: "0.05",
        },
      },
    });

    expect(result.isAllowed).toBe(true);
  });
});
