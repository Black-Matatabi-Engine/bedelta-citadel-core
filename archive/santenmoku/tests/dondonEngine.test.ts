import { describe, expect, it } from "vitest";
import {
  advanceManualHoldProgress,
  formatOverheadHudText,
  MANUAL_HOLD_CONFIRM_MS,
  parseOverheadHudLines,
  resolveSafetyLatchUnlocked,
} from "../src/services/dondonEngine";
import {
  DemoHubController,
  buildDemoHubInput,
} from "../src/components/DemoHubController";
import { buildSystemState } from "../src/services/systemState";
import { evaluateDonDonMood } from "../src/services/dondonEngine";
import { DEMO_HUB_MOODS, DonDonMood } from "../src/types/dondon";

describe("parseOverheadHudLines", () => {
  it("splits primary and secondary HUD lines", () => {
    const lines = parseOverheadHudLines(
      "[ 65/100 SOIL | Semi-Auto Shield ] -$200.00 SL | +$400.00 TP\n[ 65/100 SOIL | 40/100 VOL | 100% SHIELD ]",
    );
    expect(lines.primary).toContain("-$200.00 SL");
    expect(lines.secondary).toContain("65/100 SOIL");
  });
});

function baseState() {
  return buildSystemState({
    accountBalanceUsd: 10_000,
    currentCri: 100,
    skipHardlockAssert: true,
  });
}

function expectIndexBounds(result: ReturnType<typeof evaluateDonDonMood>) {
  for (const key of [
    "soilScore",
    "ceilingScore",
    "volatilityIndex",
    "shieldHealth",
    "scanProgress",
  ] as const) {
    expect(result[key]).toBeGreaterThanOrEqual(0);
    expect(result[key]).toBeLessThanOrEqual(100);
  }
}

describe("dondonEngine — numbers-first control modes", () => {
  const indexes = { soilScore: 85, volatilityIndex: 40, shieldHealth: 100 };

  it("MANUAL mode — hold prefix precedes SL/TP", () => {
    const text = formatOverheadHudText(250, indexes, {
      controlMode: "MANUAL",
      manualHoldProgressMs: 1500,
    });
    expect(text).toContain("[ 1.5s HOLD | Manual Confirm ]");
    expect(text).toContain("-$250.00 SL | +$500.00 TP");
    expect(text.indexOf("1.5s")).toBeLessThan(text.indexOf("-$250.00"));
  });

  it("SEMI_AUTO mode — soil score precedes label", () => {
    const text = formatOverheadHudText(250, indexes, {
      controlMode: "SEMI_AUTO",
    });
    expect(text).toContain("[ 85/100 SOIL | Semi-Auto Shield ]");
    expect(text).toContain("-$250.00 SL | +$500.00 TP");
  });

  it("FULL_AUTO mode — shield percent + kill switch", () => {
    const text = formatOverheadHudText(250, indexes, {
      controlMode: "FULL_AUTO",
      killSwitchActive: true,
    });
    expect(text).toContain("[ 100% SHIELD | Full Automated ]");
    expect(text).toContain("-$250.00 SL | Kill Switch Active");
  });

  it("hold-to-confirm friction unlocks safety latch at 1500ms", () => {
    expect(resolveSafetyLatchUnlocked("MANUAL", 0)).toBe(false);
    expect(resolveSafetyLatchUnlocked("MANUAL", 1499)).toBe(false);
    expect(resolveSafetyLatchUnlocked("MANUAL", 1500)).toBe(true);
    expect(advanceManualHoldProgress(1400, 100)).toBe(1500);
    expect(resolveSafetyLatchUnlocked("SEMI_AUTO", 0)).toBe(true);
  });

  it("overheadHUDText — $200.00 SL / $400.00 TP at $10k balance", () => {
    const result = evaluateDonDonMood({
      ...baseState(),
      accountBalanceUsd: 10_000,
      volatility: 20,
      controlMode: "SEMI_AUTO",
    });

    expect(result.dynamicMaxSL).toBe(200);
    expect(result.overheadHUDText).toContain("-$200.00 SL");
    expect(result.overheadHUDText).toContain("+$400.00 TP");
    expect(result.overheadHUDText).toContain("[");
    expect(result.statusText.startsWith("100 CRI")).toBe(true);
  });

  it("overheadHUDText — $600.00 SL / $1200.00 TP at $50k balance", () => {
    const hub = new DemoHubController({ accountBalanceUsd: 50_000 });
    const result = hub.evaluateMood(DonDonMood.SEARCHING);

    expect(result.dynamicMaxSL).toBe(600);
    expect(result.overheadHUDText).toContain("-$600.00 SL");
    expect(result.overheadHUDText).toContain("+$1200.00 TP");
  });

  it.each(DEMO_HUB_MOODS)("DemoHub mood %s evaluates with overheadHUDText", (mood) => {
    const result = evaluateDonDonMood(buildDemoHubInput(mood));
    expect(result.mood).toBe(mood);
    expect(result.overheadHUDText.length).toBeGreaterThan(0);
    expect(result.dynamicMaxSL).toBe(200);
    expectIndexBounds(result);
  });

  it("WALLET_NOT_LINKED — slate gray, scanProgress 0", () => {
    const result = evaluateDonDonMood({
      ...baseState(),
      walletLinked: false,
    });

    expect(result.mood).toBe(DonDonMood.WALLET_NOT_LINKED);
    expect(result.colorHue).toBe("#64748B");
    expect(result.scanProgress).toBe(0);
    expect(result.overheadHUDText).toContain("-$200.00 SL");
    expectIndexBounds(result);
  });

  it("SEARCHING — emerald green, scanProgress 100", () => {
    const result = evaluateDonDonMood({
      ...baseState(),
      walletLinked: true,
      volatility: 40,
    });

    expect(result.mood).toBe(DonDonMood.SEARCHING);
    expect(result.colorHue).toBe("#10B981");
    expect(result.scanProgress).toBe(100);
    expectIndexBounds(result);
  });

  it("DEFENSIVE — amber gold, soilScore from systemState", () => {
    const result = evaluateDonDonMood({
      ...baseState(),
      inSoilZone: true,
      soilScore: 72,
      volatility: 50,
    });

    expect(result.mood).toBe(DonDonMood.DEFENSIVE);
    expect(result.colorHue).toBe("#F59E0B");
    expect(result.soilScore).toBe(72);
    expectIndexBounds(result);
  });

  it("ROOTSHIELD_ACTIVE — electric cyan, shieldHealth 100", () => {
    const result = evaluateDonDonMood({
      ...baseState(),
      rootShieldActive: true,
      volatility: 30,
    });

    expect(result.mood).toBe(DonDonMood.ROOTSHIELD_ACTIVE);
    expect(result.colorHue).toBe("#06B6D4");
    expect(result.shieldHealth).toBe(100);
    expectIndexBounds(result);
  });

  it("ALERT — volatility prefix when session expiry absent", () => {
    const result = evaluateDonDonMood({
      ...baseState(),
      volatility: 82,
    });

    expect(result.mood).toBe(DonDonMood.ALERT);
    expect(result.colorHue).toBe("#EAB308");
    expect(result.volatilityIndex).toBe(82);
    expect(result.overheadHUDText).toContain("[ 82/100 VOLATILITY | Spike Active ]");
    expectIndexBounds(result);
  });

  it("RAGE_FOMO — crimson red, shieldHealth 0 ceilingScore 100", () => {
    const result = evaluateDonDonMood({
      ...baseState(),
      circuitBreakerTriggered: true,
      deadlockCooldownSec: 60,
    });

    expect(result.mood).toBe(DonDonMood.RAGE_FOMO);
    expect(result.colorHue).toBe("#EF4444");
    expect(result.shieldHealth).toBe(0);
    expect(result.ceilingScore).toBe(100);
    expect(result.overheadHUDText).toContain("[ 60s COOLDOWN | Deadlock Active ]");
    expectIndexBounds(result);
  });

  it("VICTORY — electric violet, ceilingScore 100", () => {
    const result = evaluateDonDonMood({
      ...baseState(),
      takeProfitTriggered: true,
      soilScore: 90,
    });

    expect(result.mood).toBe(DonDonMood.VICTORY);
    expect(result.colorHue).toBe("#8B5CF6");
    expect(result.ceilingScore).toBe(100);
    expectIndexBounds(result);
  });

  it("TIER_UPGRADE — gold hue", () => {
    const result = evaluateDonDonMood(buildDemoHubInput(DonDonMood.TIER_UPGRADE));
    expect(result.mood).toBe(DonDonMood.TIER_UPGRADE);
    expect(result.colorHue).toBe("#FBBF24");
    expect(result.overheadHUDText).toContain("-$200.00 SL");
  });

  it("ADMIN_MODE — blue hue, shieldHealth 100", () => {
    const result = evaluateDonDonMood(buildDemoHubInput(DonDonMood.ADMIN_MODE));
    expect(result.mood).toBe(DonDonMood.ADMIN_MODE);
    expect(result.colorHue).toBe("#3B82F6");
    expect(result.shieldHealth).toBe(100);
  });

  it("SYSTEM_PAUSED — muted slate, scanProgress 0", () => {
    const result = evaluateDonDonMood(buildDemoHubInput(DonDonMood.SYSTEM_PAUSED));
    expect(result.mood).toBe(DonDonMood.SYSTEM_PAUSED);
    expect(result.colorHue).toBe("#94A3B8");
    expect(result.scanProgress).toBe(0);
    expect(result.volatilityIndex).toBe(0);
  });

  it("DemoHubController balance override changes dynamicMaxSL live", () => {
    const hub = new DemoHubController({ accountBalanceUsd: 10_000 });
    expect(hub.evaluateMood(DonDonMood.SEARCHING).dynamicMaxSL).toBe(200);

    hub.setAccountBalanceUsd(50_000);
    expect(hub.evaluateMood(DonDonMood.SEARCHING).dynamicMaxSL).toBe(600);
    expect(hub.evaluateAllMoods()).toHaveProperty(DonDonMood.RAGE_FOMO);
  });

  it("prioritizes RAGE_FOMO over DEFENSIVE and ALERT", () => {
    const result = evaluateDonDonMood({
      ...baseState(),
      isFOMORisk: true,
      inSoilZone: true,
      volatility: 90,
    });

    expect(result.mood).toBe(DonDonMood.RAGE_FOMO);
    expect(result.colorHue).toBe("#EF4444");
  });

  it("MANUAL mode sets isSafetyLatchUnlocked from hold progress", () => {
    const locked = evaluateDonDonMood({
      ...baseState(),
      controlMode: "MANUAL",
      manualHoldProgressMs: 500,
    });
    expect(locked.isSafetyLatchUnlocked).toBe(false);
    expect(locked.manualHoldProgressMs).toBe(500);

    const unlocked = evaluateDonDonMood({
      ...baseState(),
      controlMode: "MANUAL",
      manualHoldProgressMs: MANUAL_HOLD_CONFIRM_MS,
    });
    expect(unlocked.isSafetyLatchUnlocked).toBe(true);
  });
});
