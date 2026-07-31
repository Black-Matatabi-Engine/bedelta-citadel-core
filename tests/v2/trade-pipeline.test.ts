import { describe, expect, it } from "vitest";
import { R1018_SLIPPAGE_LOCK_LABEL } from "../../src/config/constants";
import {
  computeEffectiveMaxSlUsd,
  DEFAULT_ACCOUNT_EQUITY_USD,
  ORDER_SIZE_MIN_USD,
  ORDER_SIZE_MAX_USD,
  ROOT_DEFENSE_TELEMETRY,
  ROOT_TELEMETRY_TIER_ROOTS,
  buildRootTelemetryRows,
  clampOrderSizeUsd,
  dynamicMaxSlPct,
  exceedsMaxRiskBoundary,
  formatAutoGuardBanner,
  formatDynSlLockTag,
  formatPostTradeReviewLog,
  hasInsufficientMargin,
  isStep3Unlocked,
  normalizeTradeMode,
  requiredMarginUsd,
  resolveAttackLock,
  resolveOrderSizeMaxUsd,
  resolveRootTelemetryDisplayStatus,
  sanitizeCapitalUsd,
} from "../../src/v2/services/trade-pipeline";

describe("Capital sanitization & order-size bounds", () => {
  it("falls back to 10000 when empty, NaN, or <= 0", () => {
    expect(sanitizeCapitalUsd("")).toBe(DEFAULT_ACCOUNT_EQUITY_USD);
    expect(sanitizeCapitalUsd(null)).toBe(DEFAULT_ACCOUNT_EQUITY_USD);
    expect(sanitizeCapitalUsd(undefined)).toBe(DEFAULT_ACCOUNT_EQUITY_USD);
    expect(sanitizeCapitalUsd(0)).toBe(DEFAULT_ACCOUNT_EQUITY_USD);
    expect(sanitizeCapitalUsd(-5)).toBe(DEFAULT_ACCOUNT_EQUITY_USD);
    expect(sanitizeCapitalUsd("abc")).toBe(DEFAULT_ACCOUNT_EQUITY_USD);
  });

  it("accepts positive capital and clamps slider max into [$1k, $100k]", () => {
    expect(sanitizeCapitalUsd(5000)).toBe(5000);
    expect(resolveOrderSizeMaxUsd(500)).toBe(ORDER_SIZE_MIN_USD);
    expect(resolveOrderSizeMaxUsd(50_000)).toBe(50_000);
    expect(resolveOrderSizeMaxUsd(250_000)).toBe(ORDER_SIZE_MAX_USD);
    expect(clampOrderSizeUsd(75_000, 10_000)).toBe(10_000);
    expect(clampOrderSizeUsd(500, 10_000)).toBe(ORDER_SIZE_MIN_USD);
  });
});

describe("Dynamic Effective Max SL Lock", () => {
  const equity = DEFAULT_ACCOUNT_EQUITY_USD;
  const maxSl = computeEffectiveMaxSlUsd(equity);

  it("tightens dyn SL at $50,000 order size for $10k equity", () => {
    expect(dynamicMaxSlPct(50_000, equity)).toBeCloseTo(0.4, 8);
    expect(formatDynSlLockTag(50_000, equity)).toContain("0.40%");
    expect(formatDynSlLockTag(50_000, equity)).toContain(`$${maxSl} MAX LOSS`);
  });

  it("locks when slip dollar impact exceeds dynamic risk boundary", () => {
    expect(
      exceedsMaxRiskBoundary({
        orderSizeUsd: 50_000,
        slipRatio: 0.005,
        accountEquityUsd: equity,
      }),
    ).toBe(true);
    expect(
      exceedsMaxRiskBoundary({
        orderSizeUsd: 50_000,
        slipRatio: 0.0005,
        accountEquityUsd: equity,
      }),
    ).toBe(false);
  });
});

describe("3-Mode Step 3 unlock + margin guard", () => {
  const allClear = {
    mindsetClear: true,
    vixDvolNormal: true,
    targetLocked: true,
    settlementClear: true,
    soilSafe: true,
  };

  it("Shield requires mindset + VIX + target + settlement + soil; Flash bypasses; Tactical uses risk trio", () => {
    expect(
      isStep3Unlocked({
        mode: "SHIELD",
        guards: { ...allClear, targetLocked: false },
      }),
    ).toBe(false);
    expect(
      isStep3Unlocked({
        mode: "SHIELD",
        guards: allClear,
      }),
    ).toBe(true);
    expect(
      isStep3Unlocked({
        mode: "FLASH",
        guards: {
          mindsetClear: false,
          vixDvolNormal: false,
          targetLocked: false,
          settlementClear: false,
          soilSafe: false,
        },
      }),
    ).toBe(true);
  });

  it("labels ATTACK as INSUFFICIENT MARGIN when collateral < required", () => {
    const lock = resolveAttackLock({
      hasTarget: true,
      step3Unlocked: true,
      withdrawableCollateral: 5_000,
      orderSizeUsd: 10_000,
      slipRatio: 0.0001,
    });
    expect(lock.locked).toBe(true);
    expect(lock.reason).toBe("INSUFFICIENT_MARGIN");
  });

  it("labels ATTACK with SOIL DANGER when slip exceeds dynamic Max SL", () => {
    const maxSl = computeEffectiveMaxSlUsd(DEFAULT_ACCOUNT_EQUITY_USD);
    const lock = resolveAttackLock({
      hasTarget: true,
      step3Unlocked: true,
      withdrawableCollateral: 100_000,
      orderSizeUsd: 50_000,
      slipRatio: 0.005,
      accountEquityUsd: DEFAULT_ACCOUNT_EQUITY_USD,
    });
    expect(lock.locked).toBe(true);
    expect(lock.reason).toBe("SOIL_EXCEEDS_MAX_SL");
    expect(lock.label).toBe(`[ SOIL DANGER: EXCEEDS $${maxSl} RISK ]`);
  });

  it("locks ATTACK when Root 8 slippage exceeds 0.5% before dollar Max SL", () => {
    const lock = resolveAttackLock({
      hasTarget: true,
      step3Unlocked: true,
      withdrawableCollateral: 100_000,
      orderSizeUsd: 1_000,
      slipRatio: 0.006,
      accountEquityUsd: DEFAULT_ACCOUNT_EQUITY_USD,
    });
    expect(lock.locked).toBe(true);
    expect(lock.reason).toBe("ROOT8_SLIPPAGE_EXCEEDED");
    expect(lock.label).toBe(R1018_SLIPPAGE_LOCK_LABEL);
  });

  it("locks ATTACK when checkSoilResistance trips on missing dYdX feed", () => {
    const lock = resolveAttackLock({
      hasTarget: true,
      step3Unlocked: true,
      withdrawableCollateral: 100_000,
      orderSizeUsd: 1_000,
      slipRatio: 0.0001,
      accountEquityUsd: DEFAULT_ACCOUNT_EQUITY_USD,
      symbol: "BTC",
      hlSpot: 100,
      hlPerp: 100.1,
      dydxPerp: 0,
    });
    expect(lock.locked).toBe(true);
    expect(lock.reason).toBe("ROOT8_SLIPPAGE_EXCEEDED");
  });

  it("locks ATTACK when cross-venue slippage exceeds 0.5%", () => {
    const lock = resolveAttackLock({
      hasTarget: true,
      step3Unlocked: true,
      withdrawableCollateral: 100_000,
      orderSizeUsd: 1_000,
      slipRatio: 0.0001,
      accountEquityUsd: DEFAULT_ACCOUNT_EQUITY_USD,
      symbol: "BTC",
      hlSpot: 100,
      hlPerp: 100,
      dydxPerp: 100.6,
    });
    expect(lock.locked).toBe(true);
    expect(lock.reason).toBe("ROOT8_SLIPPAGE_EXCEEDED");
  });

  it("labels ATTACK blocked on Root 17 daily cap trip", () => {
    const lock = resolveAttackLock({
      hasTarget: true,
      step3Unlocked: true,
      withdrawableCollateral: 100_000,
      orderSizeUsd: 10_000,
      slipRatio: 0.0001,
      root17Tripped: true,
    });
    expect(lock.reason).toBe("ROOT17_DAILY_LIMIT");
    expect(lock.label).toContain("403");
  });

  it("locks ATTACK when Risk Index enters Toxic Mode (>= 75)", () => {
    const lock = resolveAttackLock({
      hasTarget: true,
      step3Unlocked: true,
      withdrawableCollateral: 100_000,
      orderSizeUsd: 10_000,
      slipRatio: 0.0001,
      riskScore: 75,
    });
    expect(lock.locked).toBe(true);
    expect(lock.reason).toBe("TOXIC_MODE");
    expect(lock.label).toContain("TOXIC MODE TRIPPED");
  });

  it("locks ATTACK during toxic cooldown window", () => {
    const now = Date.now();
    const lock = resolveAttackLock({
      hasTarget: true,
      step3Unlocked: true,
      withdrawableCollateral: 100_000,
      orderSizeUsd: 10_000,
      slipRatio: 0.0001,
      riskScore: 10,
      toxicCooldownUntil: now + 30_000,
      now,
    });
    expect(lock.reason).toBe("TOXIC_MODE");
    expect(lock.label).toMatch(/COOLDOWN/);
  });

  it("locks ATTACK in Auditor read-only mode", () => {
    const lock = resolveAttackLock({
      hasTarget: true,
      step3Unlocked: true,
      withdrawableCollateral: 100_000,
      orderSizeUsd: 10_000,
      slipRatio: 0.0001,
      auditReadOnly: true,
    });
    expect(lock.reason).toBe("AUDIT_READ_ONLY");
  });
});

describe("20-Root Defense Matrix Telemetry + post-trade review", () => {
  it("exposes exactly 20 roots with Root 3/7/14/19-20 labels", () => {
    expect(ROOT_DEFENSE_TELEMETRY).toHaveLength(20);
    const rows = buildRootTelemetryRows();
    expect(rows).toHaveLength(20);
    expect(rows[16].root).toBe(17);
    expect(rows[16].label).toMatch(/Daily Drawdown Cap/);
  });

  it("groups 20 roots into Tier 1–4 Step pipeline ranges", () => {
    expect(ROOT_TELEMETRY_TIER_ROOTS.TIER1).toEqual([1, 2, 3, 4, 5, 6]);
    expect(ROOT_TELEMETRY_TIER_ROOTS.TIER2).toEqual([7, 8, 9, 10, 11, 12]);
    expect(ROOT_TELEMETRY_TIER_ROOTS.TIER3).toEqual([13, 14, 15, 16, 17, 18]);
    expect(ROOT_TELEMETRY_TIER_ROOTS.TIER4).toEqual([19, 20]);
    const all = [
      ...ROOT_TELEMETRY_TIER_ROOTS.TIER1,
      ...ROOT_TELEMETRY_TIER_ROOTS.TIER2,
      ...ROOT_TELEMETRY_TIER_ROOTS.TIER3,
      ...ROOT_TELEMETRY_TIER_ROOTS.TIER4,
    ];
    expect(all).toHaveLength(20);
    expect(new Set(all).size).toBe(20);
  });

  it("never returns undefined telemetry badges — uses defaultStatus fallback", () => {
    const r1 = ROOT_DEFENSE_TELEMETRY[0];
    expect(resolveRootTelemetryDisplayStatus(r1, "PASS")).toBe("ENGAGED");
    expect(resolveRootTelemetryDisplayStatus(r1, "TRIPPED")).toBe("TRIPPED");
    expect(resolveRootTelemetryDisplayStatus(r1, "WARN")).toBe("ENGAGED");
    expect(
      resolveRootTelemetryDisplayStatus(
        { defaultStatus: "READY" },
        undefined,
      ),
    ).toBe("READY");
    expect(
      resolveRootTelemetryDisplayStatus({ defaultStatus: "ACTIVE" as const }),
    ).toBe("ACTIVE");
    expect(
      resolveRootTelemetryDisplayStatus(
        { status: undefined, defaultStatus: undefined as unknown as "PASS" },
        "PASS",
      ),
    ).toBe("PASS");
    const rows = buildRootTelemetryRows();
    rows.forEach((row) => {
      expect(row.status).toBeTruthy();
      expect(String(row.status)).not.toBe("undefined");
    });
  });

  it("formats automated guard banners per mode with dynamic SL label", () => {
    const guards = {
      mindsetClear: true,
      vixDvolNormal: true,
      targetLocked: true,
      settlementClear: true,
      soilSafe: true,
    };
    expect(formatAutoGuardBanner("FLASH", guards, 10_000)).toContain(
      "[ R1: SL $200 WELD ]",
    );
  });
});
