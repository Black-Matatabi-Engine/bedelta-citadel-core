import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  advanceManualHoldProgress,
  calculateDynamicSL,
  evaluateDonDonMood,
  formatOverheadHudText,
  MANUAL_HOLD_CONFIRM_MS,
  resolveSafetyLatchUnlocked,
} from "../src/services/dondonEngine";
import {
  checkSessionKeyValidity,
  executeOrder,
  SESSION_KEY_WARNING_THRESHOLD_SEC,
} from "../src/services/hyperliquidAdapter";
import {
  adminResetDeadlock,
  checkCircuitBreaker,
  DEADLOCK_COOLDOWN_MS,
  evaluateSystemTakeover,
  formatEmergencySlTakeoverText,
  formatFomoTakeoverLockText,
  isDeadlockActive,
  __resetDeadlockRegistryForTests,
} from "../src/services/rootProtectionService";
import { buildSystemState } from "../src/services/systemState";
import { MAX_SLIPPAGE } from "../src/services/risk-control";
import { DonDonMood } from "../src/types/dondon";

const PASSING_SOIL = {
  symbol: "BTC",
  hlSpot: 50_000,
  hlPerp: 50_010,
  dydxPerp: 50_005,
  depthUsd: 500_000,
};

const BASE_ORDER = {
  asset: 0,
  isBuy: true,
  limitPx: "50000",
  sz: "0.01",
  reduceOnly: false,
  orderType: { limit: { tif: "Gtc" as const } },
};

describe("edgeCases — scale-in SL", () => {
  it("scales dynamicMaxSL by positionSizeRatio (30% fill)", () => {
    expect(calculateDynamicSL(10_000, 1)).toBe(200);
    expect(calculateDynamicSL(10_000, 0.3)).toBe(60);
    expect(calculateDynamicSL(10_000, 0)).toBe(0);

    const dondon = evaluateDonDonMood({
      ...buildSystemState({
        accountBalanceUsd: 10_000,
        currentCri: 100,
        skipHardlockAssert: true,
      }),
      positionSizeRatio: 0.3,
    });

    expect(dondon.dynamicMaxSL).toBe(60);
    expect(dondon.overheadHUDText).toContain("[ 30% FILLED | Position $\\Delta$ ]");
    expect(dondon.overheadHUDText).toContain("-$60.00 SL");
    expect(dondon.overheadHUDText).toContain("+$120.00 TP");
  });

  it("never exceeds full account risk limit at 100% fill", () => {
    expect(calculateDynamicSL(10_000, 1.5)).toBe(200);
  });
});

describe("edgeCases — numbers-first HUD overlays", () => {
  const indexes = { soilScore: 65, volatilityIndex: 82, shieldHealth: 100 };

  it("session expiry prefix — numbers before label", () => {
    const text = formatOverheadHudText(250, indexes, {
      controlMode: "SEMI_AUTO",
      sessionExpirySeconds: 299,
    });
    expect(text).toContain("[ 04:59 EXPIRY | Re-sign Session Key ]");
    expect(text.indexOf("04:59")).toBeLessThan(text.indexOf("EXPIRY"));
  });

  it("deadlock cooldown prefix", () => {
    const text = formatOverheadHudText(250, indexes, {
      controlMode: "SEMI_AUTO",
      deadlockCooldownSec: 60,
    });
    expect(text).toContain("[ 60s COOLDOWN | Deadlock Active ]");
  });

  it("volatility spike prefix", () => {
    const text = formatOverheadHudText(250, indexes, {
      controlMode: "SEMI_AUTO",
      mood: DonDonMood.ALERT,
    });
    expect(text).toContain("[ 82/100 VOLATILITY | Spike Active ]");
  });
});

describe("edgeCases — manual hold friction", () => {
  it("advances hold progress toward 1500ms latch", () => {
    expect(advanceManualHoldProgress(0, 800)).toBe(800);
    expect(advanceManualHoldProgress(1400, 200)).toBe(1500);
    expect(resolveSafetyLatchUnlocked("MANUAL", 1500)).toBe(true);
    expect(resolveSafetyLatchUnlocked("MANUAL", MANUAL_HOLD_CONFIRM_MS - 1)).toBe(
      false,
    );
  });
});

describe("edgeCases — deadlock cooldown hysteresis", () => {
  beforeEach(() => {
    __resetDeadlockRegistryForTests();
  });

  it("persists deadlock for 60s after slippage normalizes", () => {
    const state = buildSystemState({
      accountBalanceUsd: 10_000,
      currentCri: 100,
      skipHardlockAssert: true,
    });
    const t0 = Date.now();

    checkCircuitBreaker({
      state,
      slippageRatio: MAX_SLIPPAGE + 0.01,
      now: t0,
    });
    expect(isDeadlockActive(t0)).toBe(true);

    const normalized = checkCircuitBreaker({
      state,
      slippageRatio: 0.001,
      now: t0 + 1_000,
    });
    expect(normalized.tripped).toBe(false);
    expect(normalized.deadlocked).toBe(true);
    expect(isDeadlockActive(t0 + 1_000)).toBe(true);

    vi.advanceTimersByTime(DEADLOCK_COOLDOWN_MS);
    const tExpired = t0 + DEADLOCK_COOLDOWN_MS;
    const cooled = checkCircuitBreaker({
      state,
      slippageRatio: 0.001,
      now: tExpired,
    });
    expect(cooled.deadlocked).toBe(false);
    expect(isDeadlockActive(tExpired)).toBe(false);
  });

  it("adminResetDeadlock unlocks before cool-off expiry", () => {
    const state = buildSystemState({
      accountBalanceUsd: 10_000,
      currentCri: 100,
      skipHardlockAssert: true,
    });
    const t0 = Date.now();

    checkCircuitBreaker({
      state,
      slippageRatio: MAX_SLIPPAGE + 0.02,
      now: t0,
    });
    expect(isDeadlockActive(t0)).toBe(true);

    const reset = adminResetDeadlock("edge-admin-key", "edge-admin-key");
    expect(reset.ok).toBe(true);
    expect(isDeadlockActive(t0 + 1_000)).toBe(false);
  });
});

describe("edgeCases — system safety takeover", () => {
  beforeEach(() => {
    __resetDeadlockRegistryForTests();
  });

  it("Emergency SL Override during MANUAL mode — instant FULL_AUTO", () => {
    const result = evaluateDonDonMood({
      ...buildSystemState({
        accountBalanceUsd: 10_000,
        currentCri: 100,
        skipHardlockAssert: true,
      }),
      controlMode: "MANUAL",
      unrealizedLossUsd: 250,
    });

    expect(result.systemTakeover.isOverridden).toBe(true);
    expect(result.systemTakeover.reason).toBe("EMERGENCY_SL_PROTECTION");
    expect(result.controlMode).toBe("FULL_AUTO");
    expect(result.takeoverHUDText).toBe(
      formatEmergencySlTakeoverText(200),
    );
    expect(result.overheadHUDText).toContain(
      "[ EMERGENCY TAKEOVER | Auto-SL Executed ] -$200.00 SL Shielded",
    );
  });

  it("Anti-FOMO behavioral downgrade — >5 actions / 10s triggers 60s lock", () => {
    const t0 = Date.now();
    const stamps = Array.from({ length: 6 }, (_, i) => t0 - i * 500);

    const takeover = evaluateSystemTakeover({
      controlMode: "FULL_AUTO",
      dynamicMaxSL: 200,
      actionTimestamps: stamps,
      now: t0,
    });

    expect(takeover.systemTakeover.reason).toBe("FOMO_BEHAVIOR_LOCK");
    expect(takeover.forceCircuitBreaker).toBe(true);
    expect(takeover.deadlockCooldownSec).toBe(60);
    expect(takeover.takeoverHUDText).toBe(formatFomoTakeoverLockText(60));

    const dondon = evaluateDonDonMood({
      ...buildSystemState({
        accountBalanceUsd: 10_000,
        currentCri: 100,
        skipHardlockAssert: true,
      }),
      controlMode: "SEMI_AUTO",
      userActionTimestamps: stamps,
      now: t0,
    });

    expect(dondon.mood).toBe(DonDonMood.RAGE_FOMO);
    expect(dondon.systemTakeover.reason).toBe("FOMO_BEHAVIOR_LOCK");
    expect(dondon.overheadHUDText).toContain(
      "[ 60s TAKEOVER LOCK | Anti-FOMO Overload ] HotKey Disabled",
    );
    expect(isDeadlockActive(t0)).toBe(true);

    const cooled = evaluateSystemTakeover({
      controlMode: "SEMI_AUTO",
      dynamicMaxSL: 200,
      now: t0 + DEADLOCK_COOLDOWN_MS,
    });
    expect(cooled.systemTakeover.reason).toBe("NONE");
    expect(isDeadlockActive(t0 + DEADLOCK_COOLDOWN_MS)).toBe(false);
  });

  it("slippage overload triggers FOMO takeover lock", () => {
    const t0 = Date.now();
    const takeover = evaluateSystemTakeover({
      controlMode: "MANUAL",
      dynamicMaxSL: 200,
      slippageRatio: MAX_SLIPPAGE + 0.02,
      now: t0,
    });

    expect(takeover.systemTakeover.reason).toBe("FOMO_BEHAVIOR_LOCK");
    expect(takeover.takeoverHUDText).toContain("60s TAKEOVER LOCK");
  });
});

describe("edgeCases — session key expiry probe", () => {
  it("sets sessionKeyWarning when remaining time < 5 minutes", () => {
    const now = Date.now();
    const probe = checkSessionKeyValidity(now + 120_000, now);
    expect(probe.valid).toBe(true);
    expect(probe.sessionKeyWarning).toBe(true);
    expect(probe.remainingSeconds).toBeLessThan(SESSION_KEY_WARNING_THRESHOLD_SEC);
    expect(probe.forceFallback).toBe(false);
  });

  it("forces fallback on expired session key during executeOrder", async () => {
    const expired = Date.now() - 1_000;
    const result = await executeOrder({
      payload: BASE_ORDER,
      soil: PASSING_SOIL,
      sessionExpiryTimestamp: expired,
    });

    expect(result.success).toBe(false);
    expect(result.rejected).toBe(true);
    expect(result.reason).toBe("SESSION_KEY_EXPIRED_FALLBACK");
    expect(result.fillId).toBeNull();
  });

  it("allows dry-run with warning when session key near expiry", async () => {
    const nearExpiry = Date.now() + 60_000;
    const result = await executeOrder({
      payload: BASE_ORDER,
      soil: PASSING_SOIL,
      sessionExpiryTimestamp: nearExpiry,
    });

    expect(result.success).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(result.sessionKeyWarning).toBe(true);
  });
});
