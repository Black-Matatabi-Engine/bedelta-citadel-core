import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  evaluateDonDonMood,
  evaluateDynamicShield,
  formatHttp429ShieldText,
  formatNoviceGuidedShieldText,
  readShieldHttp429CooldownSec,
} from "../src/services/dondonEngine";
import {
  assertZeroCapitalLeak,
  evaluatePendingOrderStagnation,
  PENDING_ORDER_STAGNATION_MS,
  resolveSlRejectionFallback,
} from "../src/services/rootProtectionService";
import {
  assertSessionKeyPermission,
  executeOrder,
  forceFullStateResync,
  HyperliquidAdapterError,
  registerVisibilityResyncListener,
  __resetVisibilityListenerForTests,
} from "../src/services/hyperliquidAdapter";
import { buildSystemState } from "../src/services/systemState";
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

describe("leakSensing — capital leak detection", () => {
  it("assertZeroCapitalLeak halts on > $0.01 unaccounted delta", () => {
    const leak = assertZeroCapitalLeak({
      expectedBalanceUsd: 10_000,
      observedBalanceUsd: 9999.98,
      accountedDeltaUsd: 0,
      thresholdUsd: 0.01,
    });

    expect(leak.leaked).toBe(true);
    expect(leak.forceSystemPaused).toBe(true);
    expect(leak.haltText).toContain("UNEXPLAINED LEAK");
    expect(leak.haltText).toContain("System Halted");

    const dondon = evaluateDonDonMood({
      ...buildSystemState({
        accountBalanceUsd: 10_000,
        currentCri: 100,
        skipHardlockAssert: true,
      }),
      expectedBalanceUsd: 10_000,
      observedBalanceUsd: 9999.98,
      accountedDeltaUsd: 0,
    });

    expect(dondon.mood).toBe(DonDonMood.SYSTEM_PAUSED);
    expect(dondon.leakHaltText).toContain("UNEXPLAINED LEAK");
    expect(dondon.overheadHUDText).toContain("System Halted");
  });

  it("passes when delta is within threshold", () => {
    const ok = assertZeroCapitalLeak({
      expectedBalanceUsd: 10_000,
      observedBalanceUsd: 9999.995,
      accountedDeltaUsd: 0,
      thresholdUsd: 0.01,
    });
    expect(ok.leaked).toBe(false);
  });
});

describe("leakSensing — pending order stagnation", () => {
  it("auto-cancels and locks after 1500ms unacknowledged", () => {
    const t0 = 1_000_000;
    const fresh = evaluatePendingOrderStagnation(
      [{ orderId: "oid-1", pendingSince: t0, acknowledged: false }],
      t0 + PENDING_ORDER_STAGNATION_MS - 1,
    );
    expect(fresh.stagnated).toBe(false);

    const stale = evaluatePendingOrderStagnation(
      [{ orderId: "oid-1", pendingSince: t0, acknowledged: false }],
      t0 + PENDING_ORDER_STAGNATION_MS,
    );
    expect(stale.stagnated).toBe(true);
    expect(stale.canceledOrderIds).toEqual(["oid-1"]);
    expect(stale.locked).toBe(true);
  });
});

describe("leakSensing — SL rejection IOC fallback", () => {
  it("resolves Post-Only/Depth rejection to IOC sweep", () => {
    const fallback = resolveSlRejectionFallback({
      rejected: true,
      rejectionReason: "POST_ONLY_REJECT_DEPTH",
      payload: BASE_ORDER,
    });

    expect(fallback.fallbackToIoc).toBe(true);
    expect(fallback.iocPayload?.orderType).toEqual({ limit: { tif: "Ioc" } });
  });

  it("executeOrder dry-run uses IOC fallback when slRejected", async () => {
    const result = await executeOrder({
      payload: BASE_ORDER,
      soil: PASSING_SOIL,
      slRejected: true,
      rejectionReason: "DEPTH_INSUFFICIENT",
    });

    expect(result.success).toBe(true);
    expect(result.usedIocFallback).toBe(true);
    expect(result.reason).toBe("SL_IOC_SWEEP_FALLBACK");
  });
});

describe("leakSensing — dynamic shield rate-limit backoff", () => {
  it("HTTP 429 triggers 120s WS disconnect banner", () => {
    const shield = evaluateDynamicShield({ http429Blocked: true });
    expect(shield.shieldHUDText).toBe(formatHttp429ShieldText());
    expect(shield.rateLimited).toBe(true);
    expect(shield.wsDisconnectSec).toBeGreaterThanOrEqual(114);
    expect(shield.wsDisconnectSec).toBeLessThanOrEqual(126);
    expect(readShieldHttp429CooldownSec()).toBeGreaterThan(110);
  });

  it("novice idle >3m shows guided shield HUD", () => {
    const t0 = Date.now();
    const shield = evaluateDynamicShield({
      lastActivityAt: t0 - 200_000,
      now: t0,
    });
    expect(shield.isNoviceGuided).toBe(true);
    expect(shield.shieldHUDText).toBe(formatNoviceGuidedShieldText());
  });
});

describe("leakSensing — session key permission & visibility resync", () => {
  beforeEach(() => {
    __resetVisibilityListenerForTests();
  });

  afterEach(() => {
    __resetVisibilityListenerForTests();
  });

  it("blocks WITHDRAW and SET_LEVERAGE session key permissions", () => {
    expect(() => assertSessionKeyPermission("WITHDRAW")).toThrow(
      HyperliquidAdapterError,
    );
    expect(() => assertSessionKeyPermission("SET_LEVERAGE")).toThrow(
      HyperliquidAdapterError,
    );
    expect(() => assertSessionKeyPermission("ORDER_EXECUTE")).not.toThrow();
  });

  it("forceFullStateResync records sync timestamp", async () => {
    const resync = await forceFullStateResync();
    expect(resync.synced).toBe(true);
    expect(resync.at).toBeTruthy();
  });

  it("visibility listener triggers resync on tab refocus", async () => {
    const resyncFn = vi.fn(async () => forceFullStateResync());
    const listeners: Record<string, () => void> = {};

    vi.stubGlobal("document", {
      visibilityState: "hidden",
      addEventListener: (event: string, handler: () => void) => {
        listeners[event] = handler;
      },
      removeEventListener: () => undefined,
    });

    registerVisibilityResyncListener(resyncFn);
    document.visibilityState = "visible";
    listeners.visibilitychange?.();

    expect(resyncFn).toHaveBeenCalledOnce();

    vi.unstubAllGlobals();
  });
});
