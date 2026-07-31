import { describe, expect, it } from "vitest";
import {
  calibrateStrikeThresholds,
  createSantenbokuCoachEngine,
  DEFAULT_COACH_ALPHA,
  evaluateMacroRegime,
  evaluateRedCard,
  evaluateSubstitution,
  resolveCoachAlphaConfig,
} from "../src/services/santenboku-coach-engine";
import { DEFAULT_STRIKE_ALPHA } from "../src/services/santenboku-strike-engine";

describe("resolveCoachAlphaConfig", () => {
  it("returns defaults when env is empty", () => {
    expect(resolveCoachAlphaConfig({})).toEqual(DEFAULT_COACH_ALPHA);
  });

  it("overrides margin substitution threshold from env", () => {
    const cfg = resolveCoachAlphaConfig({ COACH_MARGIN_SUBSTITUTION_PCT: "75" });
    expect(cfg.marginUsageSubstitutionPct).toBe(75);
  });
});

describe("evaluateMacroRegime", () => {
  it("CLEAR when all signals normal", () => {
    const result = evaluateMacroRegime({
      vix: 16,
      dvol: 45,
      macroBlocking: false,
      venueDelayMs: 500,
      mevThreatLevel: "clear",
      at: new Date().toISOString(),
    });
    expect(result.level).toBe("CLEAR");
    expect(result.freezeSubstitutions).toBe(false);
  });

  it("CRITICAL when MEV threat is critical", () => {
    const result = evaluateMacroRegime({
      vix: 16,
      dvol: 45,
      macroBlocking: false,
      venueDelayMs: 500,
      mevThreatLevel: "critical",
      at: new Date().toISOString(),
    });
    expect(result.level).toBe("CRITICAL");
    expect(result.freezeSubstitutions).toBe(true);
  });
});

describe("evaluateSubstitution", () => {
  it("substitutes attacker when margin usage exceeds 80%", () => {
    const decisions = evaluateSubstitution(
      [
        {
          walletId: "att-1",
          role: "attacker",
          marginUsagePct: 85,
          holdingDurationMs: 1000,
          edgeBps: 5,
          active: true,
        },
        {
          walletId: "att-2",
          role: "attacker",
          marginUsagePct: 20,
          holdingDurationMs: 0,
          edgeBps: 10,
          active: false,
        },
      ],
      DEFAULT_STRIKE_ALPHA.pitStopMaxHoldMs,
    );
    expect(decisions[0]?.action).toBe("substitute");
    expect(decisions[0]?.toWalletId).toBe("att-2");
  });

  it("holds when active attacker is within bounds", () => {
    const decisions = evaluateSubstitution(
      [
        {
          walletId: "att-1",
          role: "attacker",
          marginUsagePct: 50,
          holdingDurationMs: 1000,
          edgeBps: 5,
          active: true,
        },
      ],
      DEFAULT_STRIKE_ALPHA.pitStopMaxHoldMs,
    );
    expect(decisions[0]?.action).toBe("hold");
  });
});

describe("calibrateStrikeThresholds", () => {
  it("tightens imbalance ratio when trip rate is high", () => {
    const logs = Array.from({ length: 10 }, (_, i) => ({
      symbol: "BTC",
      tripped: i < 4,
      crossVenueSlippage: 0.01,
      reasons: ["CROSS_VENUE_SLIPPAGE"],
      timestamp: new Date().toISOString(),
    }));
    const patch = calibrateStrikeThresholds(logs, DEFAULT_STRIKE_ALPHA);
    expect(patch.imbalanceRatioMin).toBeGreaterThan(
      DEFAULT_STRIKE_ALPHA.imbalanceRatioMin,
    );
  });

  it("returns empty patch when no logs", () => {
    expect(calibrateStrikeThresholds([], DEFAULT_STRIKE_ALPHA)).toEqual({});
  });
});

describe("evaluateRedCard", () => {
  it("issues R17 when fleet daily loss exceeds cap", () => {
    const card = evaluateRedCard({
      accountEquityUsd: 10_000,
      cumulativeDailyLossUsd: 700,
      dailySlCount: 1,
      fleetEstimatedLossUsd: 100,
      cri: 50,
      maxDailyLossUsd: 600,
      effectiveMaxSlUsd: 200,
    });
    expect(card.issued).toBe(true);
    expect(card.target).toBe("R17");
  });

  it("issues R20 when global CRI is zero", () => {
    const card = evaluateRedCard({
      accountEquityUsd: 10_000,
      cumulativeDailyLossUsd: 0,
      dailySlCount: 0,
      fleetEstimatedLossUsd: 50,
      cri: 0,
      maxDailyLossUsd: 600,
      effectiveMaxSlUsd: 200,
    });
    expect(card.issued).toBe(true);
    expect(card.target).toBe("R20");
  });

  it("no red card when fleet metrics are safe", () => {
    const card = evaluateRedCard({
      accountEquityUsd: 10_000,
      cumulativeDailyLossUsd: 100,
      dailySlCount: 1,
      fleetEstimatedLossUsd: 50,
      cri: 80,
      maxDailyLossUsd: 600,
      effectiveMaxSlUsd: 200,
    });
    expect(card.issued).toBe(false);
  });
});

describe("createSantenbokuCoachEngine", () => {
  it("exposes coach interface methods", () => {
    const coach = createSantenbokuCoachEngine();
    expect(coach.config.marginUsageSubstitutionPct).toBe(80);
    expect(typeof coach.evaluateRedCard).toBe("function");
  });
});
