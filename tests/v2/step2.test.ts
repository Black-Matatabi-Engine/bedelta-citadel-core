import { describe, expect, it } from "vitest";
import type { Step1ScanResult } from "../../src/v2/types/step1";
import {
  assignDebuffs,
  buildWeakTargetMetric,
  computeWeaknessScore,
  defaultMockL2Books,
  defaultMockUniverse,
  FUNDING_EXTREME_THRESHOLD,
  runStep2Scan,
  STEP2_HANDSHAKE_TTL_MS,
} from "../../src/v2/services/step2-engine";

function makeStep1(
  overrides: Partial<Step1ScanResult> = {},
): Step1ScanResult {
  return {
    status: "SAFE",
    primaryMode: "INTERMEDIATE",
    maxLossUSD: 50,
    timestamp: Date.now(),
    matrixDetails: { root1_lossLock: true },
    ...overrides,
  };
}

describe("Step 2 — handshake & Step 1 gate", () => {
  it("fails handshake when Step 1 timestamp is stale (> 30s)", async () => {
    const stale = makeStep1({
      timestamp: Date.now() - (STEP2_HANDSHAKE_TTL_MS + 5_000),
    });

    const result = await runStep2Scan(stale, { isMockMode: true });

    expect(result.status).toBe("HANDSHAKE_FAILED");
    expect(result.handshake.isHandshakeValid).toBe(false);
    expect(result.targets).toEqual([]);
    expect(result.handshake.handshakeMessage).toMatch(/stale/i);
  });

  it("instantly skips when Step 1 status is LOCKED", async () => {
    const locked = makeStep1({
      status: "LOCKED",
      activeLockReason: "Jurisdiction Access Restricted",
      timestamp: Date.now(),
    });

    const result = await runStep2Scan(locked, { isMockMode: true });

    expect(result.status).toBe("SKIPPED_DUE_TO_STEP1");
    expect(result.handshake.isHandshakeValid).toBe(true);
    expect(result.targets).toEqual([]);
  });
});

describe("Step 2 — weakness score & debuff assignment on mock data", () => {
  it("assigns bleeding / air-pocket / magnet / crowded debuffs from mock market features", () => {
    const books = defaultMockL2Books();
    const weakLong = defaultMockUniverse().find((r) => r.symbol === "WEAKLONG");
    expect(weakLong).toBeDefined();

    const priceChange24hRatio =
      (weakLong!.midPx - weakLong!.prevDayPx) / weakLong!.prevDayPx;
    const book = books.WEAKLONG!;
    const asymmetry = book.bidDepthUsd / book.askDepthUsd;

    const debuffs = assignDebuffs({
      fundingRateHourly: weakLong!.fundingRateHourly,
      bookDepthAsymmetryRatio: asymmetry,
      estimatedLiquidationDistancePct: book.estimatedLiquidationDistancePct,
      oiChange24hRatio: weakLong!.oiChange24hRatio,
      priceChange24hRatio,
    });

    expect(Math.abs(weakLong!.fundingRateHourly)).toBeGreaterThan(
      FUNDING_EXTREME_THRESHOLD,
    );
    expect(debuffs).toContain("DEBUFF_BLEEDING");
    expect(debuffs).toContain("DEBUFF_AIR_POCKET");
    expect(debuffs).toContain("DEBUFF_MAGNET_PULL");
    expect(debuffs).toContain("DEBUFF_CROWDED_TRAP");
  });

  it("computes a high weakness score for extreme mock WEAKLONG features", () => {
    const books = defaultMockL2Books();
    const row = defaultMockUniverse().find((r) => r.symbol === "WEAKLONG")!;
    const book = books.WEAKLONG!;
    const priceChange24hRatio =
      (row.midPx - row.prevDayPx) / row.prevDayPx;
    const bookDepthAsymmetryRatio = book.bidDepthUsd / book.askDepthUsd;

    const score = computeWeaknessScore({
      fundingRateHourly: row.fundingRateHourly,
      oiChange24hRatio: row.oiChange24hRatio,
      priceChange24hRatio,
      bookDepthAsymmetryRatio,
      estimatedLiquidationDistancePct: book.estimatedLiquidationDistancePct,
    });

    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns ranked weak targets from mock dry-run scan", async () => {
    const result = await runStep2Scan(makeStep1(), {
      isMockMode: true,
      mockUniverse: defaultMockUniverse(),
      mockL2Books: defaultMockL2Books(),
    });

    expect(result.status).toBe("TARGETS_FOUND");
    expect(result.targets.length).toBeGreaterThan(0);
    expect(result.targets.length).toBeLessThanOrEqual(3);
    expect(result.executionMetadata.totalUniverseScanned).toBe(3);

    // Descending weaknessScore
    for (let i = 1; i < result.targets.length; i++) {
      expect(result.targets[i - 1]!.weaknessScore).toBeGreaterThanOrEqual(
        result.targets[i]!.weaknessScore,
      );
    }

    const top = result.targets[0]!;
    expect(top.symbol).toMatch(/WEAK/);
    expect(top.debuffs.length).toBeGreaterThan(0);
    expect(top.metrics.fundingRateHourly).toBeDefined();
    expect(top.reasoning.length).toBeGreaterThan(0);
  });

  it("buildWeakTargetMetric wires direction WEAK_LONG for positive extreme funding", () => {
    const metric = buildWeakTargetMetric(
      {
        symbol: "TEST",
        fundingRateHourly: 0.001,
        oiChange24hRatio: 0.2,
        priceChange24hRatio: -0.05,
        dayNtlVlm: 10_000_000,
        openInterestUsd: 3_000_000,
        midPx: 1,
      },
      {
        bidDepthUsd: 30_000,
        askDepthUsd: 200_000,
        estimatedLiquidationDistancePct: 0.8,
      },
    );

    expect(metric.direction).toBe("WEAK_LONG");
    expect(metric.weaknessScore).toBeGreaterThan(40);
    expect(metric.debuffs).toEqual(
      expect.arrayContaining([
        "DEBUFF_BLEEDING",
        "DEBUFF_AIR_POCKET",
        "DEBUFF_MAGNET_PULL",
        "DEBUFF_CROWDED_TRAP",
      ]),
    );
  });
});
