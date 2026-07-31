import { describe, expect, it } from "vitest";
import { mergeStep1WithApiSnapshot } from "../src/v2/services/live-dashboard";
import type { Step1ScanResult } from "../src/v2/types/step1";
import { STEP1_ROOT_KEYS } from "../src/v2/types/step1";

function baseStep1(): Step1ScanResult {
  const matrixDetails = Object.fromEntries(
    STEP1_ROOT_KEYS.map((key) => [key, true]),
  ) as Step1ScanResult["matrixDetails"];

  return {
    status: "SAFE",
    primaryMode: "EXPERT",
    maxLossUSD: 200,
    timestamp: Date.now(),
    matrixDetails,
  };
}

describe("live-dashboard", () => {
  it("merges systemState and tsunami shield from /api/data", () => {
    const merged = mergeStep1WithApiSnapshot(baseStep1(), {
      fetchedAt: Date.now(),
      payload: {
        success: true,
        timestamp_hkt: "2026-07-25 12:00:00",
        matrix: [],
        tsunami_shield_active: true,
        systemState: {
          accountBalanceUsd: 10_000,
          currentCri: 42,
          dynamicMaxSL: 200,
          hudState: "AMBER",
          hardlock: false,
          signingChannelOpen: true,
        },
      },
    });

    expect(merged.maxLossUSD).toBe(200);
    expect(merged.risk_score).toBe(58);
    expect(merged.matrixDetails.root10_tsunamiShield).toBe(false);
  });
});
