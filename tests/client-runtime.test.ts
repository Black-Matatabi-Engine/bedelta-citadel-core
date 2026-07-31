import { describe, expect, it } from "vitest";
import { clientRuntimeScript } from "../src/v2/services/client-runtime";
import { clientNowMs, isBrowser } from "../src/v2/lib/client-runtime";

describe("client-runtime", () => {
  it("reports non-browser in node test runtime", () => {
    expect(isBrowser()).toBe(false);
    expect(clientNowMs()).toBe(0);
  });

  it("injects ROOT DEFENSE MATRIX constants for browser score helpers", () => {
    const script = clientRuntimeScript();
    expect(script).toContain("const ROOT_DEFENSE_SCORE_MIN = 0");
    expect(script).toContain("const ROOT_DEFENSE_SCORE_MAX = 100");
    expect(script).toContain("const ROOT_DEFENSE_OPTIMAL_MIN = 80");
    expect(script).toContain("const ROOT_DEFENSE_ELEVATED_MIN = 50");
    expect(script).toContain("const TIER_PENALTY_BY_ROOT =");
    expect(script).toContain("const TIER_4_SET = new Set");
    expect(script).toContain("function normalizeTriggeredRoots");
    expect(script.indexOf("function normalizeTriggeredRoots")).toBeLessThan(
      script.indexOf("function calculateRootDefenseMatrixScore"),
    );
    expect(script.indexOf("const ROOT_DEFENSE_OPTIMAL_MIN")).toBeLessThan(
      script.indexOf("function resolveRootDefenseMatrixBand"),
    );
    expect(script).toContain("const R1018_SLIPPAGE_LOCK_LABEL =");
    expect(script).toContain("function computeOrderAwareMaxSlUsd");
    expect(script).toContain("const TAIJI_YANG_CRI_MIN = 75");
    expect(script).toContain("const BAGUA_KAN_CRI_MAX = 25");
    expect(script).toContain("function resolveTaijiMode");
    expect(script.indexOf("const TAIJI_YANG_CRI_MIN")).toBeLessThan(
      script.indexOf("function resolveTaijiMode"),
    );
  });
});
