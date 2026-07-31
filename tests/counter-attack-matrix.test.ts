import { describe, expect, it } from "vitest";
import {
  COUNTER_ATTACK_MAX_LIVE_SLIPPAGE,
  PANIC_IMBALANCE_THRESHOLD,
  computeOrderbookImbalanceRatio,
  computePassiveMakerLimitPx,
  evalCounterAttackOpportunity,
  isAtStrongSoilAnchor,
  isExtremePanicSell,
} from "../src/services/counter-attack-matrix";

const PASSING_BASE = {
  symbol: "BTC",
  markPx: 100,
  soilAnchorPx: 100,
  bestBid: 99.98,
  bestAsk: 100.02,
  midPx: 100,
  bidDepthUsd: 50_000,
  askDepthUsd: 450_000,
  depthUsd: 500_000,
  spreadBps: 4,
  priceImpactBps: 4,
  accountBalanceUsd: 10_000,
  orderNotionalUsd: 150,
};

describe("counter-attack-matrix", () => {
  describe("computeOrderbookImbalanceRatio", () => {
    it("returns positive ask-heavy imbalance", () => {
      expect(computeOrderbookImbalanceRatio(450_000, 50_000)).toBeCloseTo(
        0.8,
        6,
      );
    });

    it("returns 0 when both sides empty", () => {
      expect(computeOrderbookImbalanceRatio(0, 0)).toBe(0);
    });
  });

  describe("panic detection", () => {
    it("flags extreme panic sell above threshold", () => {
      const ratio = computeOrderbookImbalanceRatio(400_000, 50_000);
      expect(ratio).toBeGreaterThan(PANIC_IMBALANCE_THRESHOLD);
      expect(isExtremePanicSell(ratio)).toBe(true);
    });

    it("does not flag balanced book", () => {
      const ratio = computeOrderbookImbalanceRatio(200_000, 180_000);
      expect(isExtremePanicSell(ratio)).toBe(false);
    });
  });

  describe("soil anchor", () => {
    it("accepts mark within tolerance band", () => {
      expect(isAtStrongSoilAnchor(100.02, 100)).toBe(true);
    });

    it("rejects mark far from anchor", () => {
      expect(isAtStrongSoilAnchor(101.5, 100)).toBe(false);
    });
  });

  describe("evalCounterAttackOpportunity", () => {
    it("STRIKE when panic + anchor + soil + slippage pass", () => {
      const result = evalCounterAttackOpportunity(PASSING_BASE);

      expect(result.verdict).toBe("STRIKE");
      expect(result.armed).toBe(true);
      expect(result.panicDetected).toBe(true);
      expect(result.atSoilAnchor).toBe(true);
      expect(result.liveSlippageRatio).toBeLessThanOrEqual(
        COUNTER_ATTACK_MAX_LIVE_SLIPPAGE,
      );
      expect(result.limitPx).toBe("99.98");
      expect(result.sz).toBe(String(150 / 99.98));
      expect(result.dynamicMaxSlUsd).toBe(200);
    });

    it("REJECT when imbalance below panic threshold", () => {
      const result = evalCounterAttackOpportunity({
        ...PASSING_BASE,
        bidDepthUsd: 200_000,
        askDepthUsd: 220_000,
      });

      expect(result.verdict).toBe("REJECT");
      expect(result.panicDetected).toBe(false);
      expect(result.reasons.some((r) => r.startsWith("IMBALANCE"))).toBe(true);
    });

    it("REJECT when not at soil anchor", () => {
      const result = evalCounterAttackOpportunity({
        ...PASSING_BASE,
        markPx: 105,
      });

      expect(result.verdict).toBe("REJECT");
      expect(result.atSoilAnchor).toBe(false);
    });

    it("REJECT when live slippage exceeds 0.3%", () => {
      const result = evalCounterAttackOpportunity({
        ...PASSING_BASE,
        spreadBps: 35,
        priceImpactBps: 35,
        bestBid: 99,
        bestAsk: 100.5,
        midPx: 99.75,
      });

      expect(result.verdict).toBe("REJECT");
      expect(result.liveSlippageRatio).toBeGreaterThan(
        COUNTER_ATTACK_MAX_LIVE_SLIPPAGE,
      );
      expect(result.reasons.some((r) => r.startsWith("LIVE_SLIPPAGE"))).toBe(
        true,
      );
    });

    it("REJECT when order notional exceeds dynamicMaxSlUsd", () => {
      const result = evalCounterAttackOpportunity({
        ...PASSING_BASE,
        orderNotionalUsd: 500,
      });

      expect(result.verdict).toBe("REJECT");
      expect(result.reasons.some((r) => r.includes("dynamicMaxSlUsd"))).toBe(
        true,
      );
    });

    it("REJECT when checkSoilResistance trips on thin depth", () => {
      const result = evalCounterAttackOpportunity({
        ...PASSING_BASE,
        depthUsd: 10_000,
        bidDepthUsd: 10_000,
        askDepthUsd: 450_000,
      });

      expect(result.verdict).toBe("REJECT");
      expect(result.soil.tripped).toBe(true);
    });
  });

  describe("computePassiveMakerLimitPx", () => {
    it("places buy at best bid", () => {
      expect(computePassiveMakerLimitPx(99.98, "buy")).toBe("99.98");
    });
  });
});
