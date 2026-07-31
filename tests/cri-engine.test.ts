import { describe, expect, it } from "vitest";
import {
  calculateRiskScore,
  calculateRiskScoreFromTrippedRoots,
  CRI_TIER_DEFINITIONS,
  formatRiskIndexLabel,
  isToxicModeTripped,
  resolveRiskIndexBand,
  rootTierCardClass,
  statusesFromTrippedRoots,
  tierAverageScore,
} from "../src/v2/services/risk-engine";

describe("Distance-weighted Risk Index", () => {
  it("returns 0 when all roots PASS", () => {
    expect(calculateRiskScore({})).toBe(0);
    expect(calculateRiskScoreFromTrippedRoots([])).toBe(0);
  });

  it("returns 100 when all roots TRIPPED", () => {
    const allTripped = statusesFromTrippedRoots(
      Array.from({ length: 20 }, (_, i) => i + 1),
    );
    expect(calculateRiskScore(allTripped)).toBe(100);
    expect(
      calculateRiskScoreFromTrippedRoots(
        Array.from({ length: 20 }, (_, i) => i + 1),
      ),
    ).toBe(100);
  });

  it("applies 20/25/35/20 tier weights", () => {
    const tier1Only = calculateRiskScore(
      statusesFromTrippedRoots([1, 2, 3, 4, 5, 6]),
    );
    expect(tier1Only).toBe(20);

    const tier2Only = calculateRiskScore(
      statusesFromTrippedRoots([7, 8, 9, 10, 11, 12]),
    );
    expect(tier2Only).toBe(25);

    const tier3Only = calculateRiskScore(
      statusesFromTrippedRoots([13, 14, 15, 16, 17, 18]),
    );
    expect(tier3Only).toBe(35);

    const tier4Only = calculateRiskScore(
      statusesFromTrippedRoots([19, 20]),
    );
    expect(tier4Only).toBe(20);
  });

  it("scores WARN at 50 per root within tier average", () => {
    const tier1Warn = calculateRiskScore({
      1: "WARN",
      2: "WARN",
      3: "WARN",
      4: "WARN",
      5: "WARN",
      6: "WARN",
    });
    expect(tier1Warn).toBe(10);
    expect(tierAverageScore({ 1: "WARN" }, [1])).toBe(50);
  });

  it("uses distance-weighted tier root ranges", () => {
    expect(CRI_TIER_DEFINITIONS[0].weight).toBe(0.2);
    expect(CRI_TIER_DEFINITIONS[1].weight).toBe(0.25);
    expect(CRI_TIER_DEFINITIONS[2].roots).toEqual([13, 14, 15, 16, 17, 18]);
    expect(CRI_TIER_DEFINITIONS[2].weight).toBe(0.35);
    expect(CRI_TIER_DEFINITIONS[3].roots).toEqual([19, 20]);
    expect(CRI_TIER_DEFINITIONS[3].weight).toBe(0.2);
  });

  it("maps tier card Santenboku accents", () => {
    expect(rootTierCardClass(1)).toContain("is-tier1");
    expect(rootTierCardClass(8)).toContain("is-tier2");
    expect(rootTierCardClass(17)).toContain("is-tier3");
    expect(rootTierCardClass(20)).toContain("is-tier4");
  });
});

describe("Risk Index HUD bands", () => {
  it("maps thresholds to NOMINAL / TOXICITY ELEVATED / TOXIC MODE", () => {
    expect(resolveRiskIndexBand(0)).toBe("NOMINAL");
    expect(resolveRiskIndexBand(39)).toBe("NOMINAL");
    expect(resolveRiskIndexBand(40)).toBe("TOXICITY_ELEVATED");
    expect(resolveRiskIndexBand(74)).toBe("TOXICITY_ELEVATED");
    expect(resolveRiskIndexBand(75)).toBe("TOXIC_MODE");
    expect(resolveRiskIndexBand(100)).toBe("TOXIC_MODE");
  });

  it("detects toxic mode trip at >= 75", () => {
    expect(isToxicModeTripped(74)).toBe(false);
    expect(isToxicModeTripped(75)).toBe(true);
  });

  it("formats risk index label", () => {
    expect(formatRiskIndexLabel(82)).toBe("RISK INDEX: 82 / 100");
  });
});
