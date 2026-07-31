import { describe, expect, it } from "vitest";
import {
  calculateRootDefenseMatrixFromStatuses,
  calculateRootDefenseMatrixScore,
  formatRootDefenseMatrixLabel,
  normalizeTriggeredRoots,
  resolveRootDefenseMatrixBand,
  ROOT_DEFENSE_MATRIX_HUD_CONFIG,
  ROOT_DEFENSE_MATRIX_TOOLTIP_DESC,
  ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL,
} from "../src/services/cri-engine";

describe("ROOT DEFENSE MATRIX tiered penalty engine", () => {
  it("returns 100 when no roots are triggered", () => {
    expect(calculateRootDefenseMatrixScore([])).toBe(100);
    expect(calculateRootDefenseMatrixFromStatuses({})).toBe(100);
  });

  it("applies Tier 1 −5 penalties for R1–R5", () => {
    expect(calculateRootDefenseMatrixScore([1])).toBe(95);
    expect(calculateRootDefenseMatrixScore([1, 2, 3, 4, 5])).toBe(75);
  });

  it("applies Tier 2 −12 penalties for R6–R10", () => {
    expect(calculateRootDefenseMatrixScore([6])).toBe(88);
    expect(calculateRootDefenseMatrixScore([6, 7])).toBe(76);
  });

  it("applies Tier 3 −25 penalties for R11–R15", () => {
    expect(calculateRootDefenseMatrixScore([11])).toBe(75);
    expect(calculateRootDefenseMatrixScore([12, 13])).toBe(50);
  });

  it("Tier 4 fatal veto forces score 0 for R16–R20", () => {
    for (const root of [16, 17, 18, 19, 20]) {
      expect(calculateRootDefenseMatrixScore([root])).toBe(0);
    }
    expect(calculateRootDefenseMatrixScore([1, 16])).toBe(0);
  });

  it("floors at 0 when cumulative penalties exceed 100", () => {
    expect(
      calculateRootDefenseMatrixScore([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    ).toBe(0);
  });

  it("maps score bands to OPTIMAL / ELEVATED / CRITICAL HUD labels", () => {
    expect(resolveRootDefenseMatrixBand(100)).toBe("OPTIMAL");
    expect(resolveRootDefenseMatrixBand(80)).toBe("OPTIMAL");
    expect(resolveRootDefenseMatrixBand(79)).toBe("ELEVATED");
    expect(resolveRootDefenseMatrixBand(50)).toBe("ELEVATED");
    expect(resolveRootDefenseMatrixBand(49)).toBe("CRITICAL");
    expect(resolveRootDefenseMatrixBand(0)).toBe("CRITICAL");
    expect(ROOT_DEFENSE_MATRIX_HUD_CONFIG.OPTIMAL.badge).toContain("OPTIMAL");
    expect(ROOT_DEFENSE_MATRIX_HUD_CONFIG.CRITICAL.badge).toContain("CRITICAL");
  });

  it("formats header label", () => {
    expect(formatRootDefenseMatrixLabel(100)).toBe(
      "ROOT DEFENSE MATRIX: 100 / 100",
    );
    expect(formatRootDefenseMatrixLabel(82)).toBe(
      "ROOT DEFENSE MATRIX: 82 / 100",
    );
  });

  it("exposes HUD tooltip copy for tiered deduction rules", () => {
    expect(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL).toContain("CRI");
    expect(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC).toContain("Tier 4 (R16-R20)");
    expect(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC).toContain("Tier 1 (R1-R5)");
    expect(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC).toContain("Status Bands");
    expect(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC).toContain("80-100 OPTIMAL");
  });

  it("normalizeTriggeredRoots handles nullish and object maps safely", () => {
    expect(normalizeTriggeredRoots(null)).toEqual([]);
    expect(normalizeTriggeredRoots(undefined)).toEqual([]);
    expect(normalizeTriggeredRoots([1, 2.9, 0, 21, "3"])).toEqual([1, 2, 3]);
    expect(normalizeTriggeredRoots({ a: 4, b: 16, c: "bad" })).toEqual([4, 16]);
  });
});
