import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HEALTH_CRI_MAX,
  HEALTH_CRI_MIN,
} from "../src/config/constants";
import {
  applyTierAndAssertHardlock,
  applyTieredRootPenalty,
  assertCriHardlock,
  TIER_1_PENALTY,
  TIER_2_PENALTY,
  TIER_3_PENALTY,
} from "../src/services/criEngine";
import {
  computeEffectiveMaxSlUsd,
  checkSoilResistance,
  emitRiskLog,
  estimateEntryLossUsd,
  getHktHour,
  HardlockError,
  isTsunamiShieldWindow,
  MAX_SLIPPAGE,
  MIN_DEPTH_USD,
  RiskLimitExceeded,
  vineWrapProtection,
  type RiskLogPayload,
} from "../src/services/risk-control";
import {
  SAFE_TRADING_TIME,
  TSUNAMI_SHIELD_TIME,
} from "./helpers/system-time";

const TEST_BALANCE_USD = 10_000;
const TEST_MAX_SL = computeEffectiveMaxSlUsd(TEST_BALANCE_USD); // 10000 * 0.01 + 100 = 200

afterEach(() => {
  vi.restoreAllMocks();
});

describe("risk-control", () => {
  describe("computeEffectiveMaxSlUsd", () => {
    it("computes Balance × 1% + $100", () => {
      expect(computeEffectiveMaxSlUsd(10_000)).toBe(200);
      expect(computeEffectiveMaxSlUsd(0)).toBe(100);
      expect(computeEffectiveMaxSlUsd(50_000)).toBe(600);
    });
  });

  describe("Scenario A — soil resistance circuit breaker", () => {
    it("trips and rejects when cross-venue slippage is 0.51% (> 0.5%)", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = checkSoilResistance({
        symbol: "BTC",
        hlSpot: 100,
        hlPerp: 100,
        dydxPerp: 100.51,
      });

      expect(result.crossVenueSlippage).toBeCloseTo(0.0051, 6);
      expect(result.crossVenueSlippage).toBeGreaterThan(MAX_SLIPPAGE);
      expect(result.tripped).toBe(true);
      expect(result.ok).toBe(false);
      expect(result.reasons.some((r) => r.startsWith("CROSS_VENUE_SLIPPAGE"))).toBe(
        true,
      );
      expect(warnSpy).toHaveBeenCalledOnce();

      const log = JSON.parse(String(warnSpy.mock.calls[0]?.[0])) as RiskLogPayload;
      expect(log.module).toBe("risk-control");
      expect(log.event).toBe("SOIL_RESISTANCE_TRIP");
      expect(log.details.tradeAllowed).toBe(false);
    });
  });

  describe("Scenario B — root protection dynamic Max SL", () => {
    it("throws RiskLimitExceeded when estimated loss exceeds dynamic Max SL", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const overLimit = TEST_MAX_SL + 0.01;

      expect(() =>
        vineWrapProtection({
          symbol: "ETH",
          estimatedLossUsd: overLimit,
          accountBalanceUsd: TEST_BALANCE_USD,
          maxLossLimit: TEST_MAX_SL,
          frictionUsd: overLimit,
        }),
      ).toThrow(RiskLimitExceeded);

      try {
        vineWrapProtection({
          symbol: "ETH",
          estimatedLossUsd: overLimit,
          accountBalanceUsd: TEST_BALANCE_USD,
          maxLossLimit: TEST_MAX_SL,
          frictionUsd: overLimit,
        });
        expect.unreachable("vineWrapProtection must throw");
      } catch (err) {
        expect(err).toBeInstanceOf(RiskLimitExceeded);
        const riskErr = err as RiskLimitExceeded;
        expect(riskErr.code).toBe("RISK_LIMIT_EXCEEDED");
        expect(riskErr.httpStatus).toBe(422);
        expect(riskErr.context.event).toBe("ROOT_PROTECTION_TRIP");
        expect(riskErr.context.details.estimatedLossUsd).toBe(overLimit);
        expect(riskErr.context.details.maxLossLimit).toBe(TEST_MAX_SL);
        expect(riskErr.context.details.accountBalanceUsd).toBe(TEST_BALANCE_USD);
        expect(riskErr.context.details.blocked).toBe(true);
      }

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("Scenario C — healthy boundary pass", () => {
    it("passes when slippage is 0.1% and estimated loss is below dynamic Max SL", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const soil = checkSoilResistance({
        symbol: "SOL",
        hlSpot: 100,
        hlPerp: 100,
        dydxPerp: 100.1,
        depthUsd: MIN_DEPTH_USD,
      });

      expect(soil.crossVenueSlippage).toBeCloseTo(0.001, 6);
      expect(soil.tripped).toBe(false);
      expect(soil.ok).toBe(true);
      expect(soil.reasons).toEqual([]);

      expect(() =>
        vineWrapProtection({
          symbol: "SOL",
          estimatedLossUsd: 20,
          accountBalanceUsd: TEST_BALANCE_USD,
          maxLossLimit: TEST_MAX_SL,
          frictionUsd: 20,
        }),
      ).not.toThrow();

      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe("CRI engine — 100→0 tiered root penalties", () => {
    it("starts at HEALTH_CRI_MAX (100) and deducts tier penalties", () => {
      expect(HEALTH_CRI_MAX).toBe(100);
      expect(applyTieredRootPenalty(100, 1)).toBe(100 - TIER_1_PENALTY);
      expect(applyTieredRootPenalty(100, 2)).toBe(100 - TIER_2_PENALTY);
      expect(applyTieredRootPenalty(100, 3)).toBe(100 - TIER_3_PENALTY);
      expect(applyTieredRootPenalty(100, 4)).toBe(HEALTH_CRI_MIN);
    });

    it("clamps CRI at zero — never negative", () => {
      expect(applyTieredRootPenalty(10, 3)).toBe(0);
      expect(applyTieredRootPenalty(5, 2)).toBe(0);
    });

    it("throws HardlockError (403) when CRI === 0 via assertCriHardlock", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() =>
        assertCriHardlock({
          symbol: "BTC",
          cri: 0,
          accountBalanceUsd: TEST_BALANCE_USD,
        }),
      ).toThrow(HardlockError);

      try {
        assertCriHardlock({
          symbol: "BTC",
          cri: 0,
          accountBalanceUsd: TEST_BALANCE_USD,
        });
        expect.unreachable("assertCriHardlock must throw at CRI 0");
      } catch (err) {
        expect(err).toBeInstanceOf(HardlockError);
        const lockErr = err as HardlockError;
        expect(lockErr.code).toBe("HARDLOCK");
        expect(lockErr.httpStatus).toBe(403);
        expect(lockErr.context.event).toBe("CRI_HARDLOCK");
        expect(lockErr.context.details.cri).toBe(0);
        expect(lockErr.context.details.blocked).toBe(true);
      }
    });

    it("does not throw when CRI > 0", () => {
      expect(() =>
        assertCriHardlock({
          symbol: "ETH",
          cri: 1,
          accountBalanceUsd: TEST_BALANCE_USD,
        }),
      ).not.toThrow();
    });

    it("applyTierAndAssertHardlock triggers hardlock when tier 4 zeroes CRI", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() =>
        applyTierAndAssertHardlock({
          symbol: "SOL",
          cri: 100,
          tier: 4,
          accountBalanceUsd: TEST_BALANCE_USD,
        }),
      ).toThrow(HardlockError);
    });

    it("applyTierAndAssertHardlock returns next CRI when still healthy", () => {
      const next = applyTierAndAssertHardlock({
        symbol: "SOL",
        cri: 100,
        tier: 1,
        accountBalanceUsd: TEST_BALANCE_USD,
      });
      expect(next).toBe(95);
    });
  });

  describe("coverage edges — depth, missing venue, exact bounds, helpers", () => {
    it("trips when dual-venue depth is missing (dydx price = 0)", () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = checkSoilResistance({
        symbol: "ARB",
        hlSpot: 1,
        hlPerp: 1,
        dydxPerp: 0,
      });

      expect(result.tripped).toBe(true);
      expect(result.crossVenueSlippage).toBe(-1);
      expect(result.reasons).toContain("INSUFFICIENT_DEPTH_DUAL_VENUE");
    });

    it("trips when explicit depthUsd is below MIN_DEPTH_USD", () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = checkSoilResistance({
        symbol: "LINK",
        hlSpot: 10,
        hlPerp: 10,
        dydxPerp: 10.01,
        depthUsd: MIN_DEPTH_USD - 1,
      });

      expect(result.tripped).toBe(true);
      expect(
        result.reasons.some((r) => r.startsWith("DEPTH_USD=")),
      ).toBe(true);
    });

    it("reports infinite spot–perp telemetry as -1 when hlSpot is 0", () => {
      vi.spyOn(console, "log").mockImplementation(() => {});

      const result = checkSoilResistance({
        symbol: "NEAR",
        hlSpot: 0,
        hlPerp: 10,
        dydxPerp: 10,
      });

      expect(result.ok).toBe(true);
      expect(result.spotPerpSlippage).toBe(-1);
    });

    it("returns cappedMaxSlUsd when order size and balance are provided", () => {
      const result = checkSoilResistance({
        symbol: "SOL",
        hlSpot: 100,
        hlPerp: 100,
        dydxPerp: 100.1,
        orderSizeUsd: 1_000,
        accountBalanceUsd: 10_000,
      });

      expect(result.cappedMaxSlUsd).toBe(5);
      expect(result.soilRiskUsd).toBeCloseTo(1, 6);
    });

    it("allows exact dynamic Max SL boundary (not greater-than)", () => {
      vi.spyOn(console, "log").mockImplementation(() => {});

      expect(() =>
        vineWrapProtection({
          symbol: "DOT",
          estimatedLossUsd: TEST_MAX_SL,
          accountBalanceUsd: TEST_BALANCE_USD,
          maxLossLimit: TEST_MAX_SL,
        }),
      ).not.toThrow();
    });

    it("uses absolute value so negative estimated loss still trips above limit", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() =>
        vineWrapProtection({
          symbol: "AVAX",
          estimatedLossUsd: -(TEST_MAX_SL + 0.01),
          accountBalanceUsd: TEST_BALANCE_USD,
          maxLossLimit: TEST_MAX_SL,
        }),
      ).toThrow(RiskLimitExceeded);
    });

    it("derives maxLossLimit from accountBalanceUsd when omitted", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() =>
        vineWrapProtection({
          symbol: "NEAR",
          estimatedLossUsd: TEST_MAX_SL + 1,
          accountBalanceUsd: TEST_BALANCE_USD,
        }),
      ).toThrow(RiskLimitExceeded);
    });

    it("estimateEntryLossUsd computes capital * friction + fixed cost", () => {
      expect(estimateEntryLossUsd(10_000, 0.0012, 2.5)).toBeCloseTo(14.5, 10);
    });

    it("resolves HKT hour via Asia/Hong_Kong timezone", () => {
      expect(getHktHour(SAFE_TRADING_TIME)).toBe(14);
      expect(isTsunamiShieldWindow(SAFE_TRADING_TIME)).toBe(false);
      expect(getHktHour(TSUNAMI_SHIELD_TIME)).toBe(21);
      expect(isTsunamiShieldWindow(TSUNAMI_SHIELD_TIME)).toBe(true);
    });

    it("trips soil resistance during HKT tsunami window 21:00–23:00", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const clear = checkSoilResistance({
        symbol: "BTC",
        hlSpot: 100,
        hlPerp: 100,
        dydxPerp: 100,
        at: SAFE_TRADING_TIME,
      });
      expect(clear.tripped).toBe(false);

      const tsunami = checkSoilResistance({
        symbol: "BTC",
        hlSpot: 100,
        hlPerp: 100,
        dydxPerp: 100,
        at: TSUNAMI_SHIELD_TIME,
      });
      expect(tsunami.tripped).toBe(true);
      expect(tsunami.reasons).toContain("TSUNAMI_SHIELD_LOCKED_HKT_21_23");
      expect(warnSpy).toHaveBeenCalled();
    });

    it("emitRiskLog silences info; routes warn / error to the correct console sink", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const base = {
        module: "risk-control" as const,
        symbol: "TEST",
        timestamp: new Date().toISOString(),
        message: "probe",
        details: { blocked: false },
      };

      emitRiskLog({ ...base, level: "info", event: "SOIL_RESISTANCE_PASS" });
      emitRiskLog({ ...base, level: "warn", event: "SOIL_RESISTANCE_TRIP" });
      emitRiskLog({ ...base, level: "error", event: "ROOT_PROTECTION_TRIP" });

      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledOnce();
      expect(errorSpy).toHaveBeenCalledOnce();
    });
  });
});
