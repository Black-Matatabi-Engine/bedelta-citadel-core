import { describe, expect, it } from "vitest";
import {
  clampActivePageStep,
  formatStep1Badge,
  formatStep2Badge,
  formatStep3Badge,
  pageStrategyLabel,
  MAX_ACTIVE_VAULT_POSITIONS,
  PAGE_STEP_TITLES,
} from "../src/services/terminal-state";

describe("terminal-state page accordion", () => {
  it("clamps activeStep to 1–4", () => {
    expect(clampActivePageStep(0)).toBe(1);
    expect(clampActivePageStep(2)).toBe(2);
    expect(clampActivePageStep(9)).toBe(4);
    expect(clampActivePageStep("3")).toBe(3);
  });

  it("exposes SANTENBOKU Vault step title and hard position lock", () => {
    expect(PAGE_STEP_TITLES[3]).toBe("Step 3 🏛️ SANTENBOKU Vault");
    expect(PAGE_STEP_TITLES[1]).toContain("Sanctuary Defense Grid");
    expect(MAX_ACTIVE_VAULT_POSITIONS).toBe(3);
  });

  it("formats Step 1 radar badge", () => {
    expect(
      formatStep1Badge({ vix: 16.8, dvol: 52.5, defconActive: true }),
    ).toBe("DEFCON: ACTIVE | VIX: 16.8 | DVOL: 52.5%");
  });

  it("formats Step 1 clear badge with DEFCON first", () => {
    expect(
      formatStep1Badge({ vix: 16.8, dvol: 52.5, defconActive: false }),
    ).toBe("DEFCON: CLEAR | VIX: 16.8 | DVOL: 52.5%");
  });

  it("formats Step 2 target badge", () => {
    expect(
      formatStep2Badge({
        label: "BRENT",
        markPrice: 88.58,
        funding8hPct: 0.005,
      }),
    ).toBe("Active Target: [BRENT] $88.58 (8h FR: +0.0050%)");
  });

  it("formats Step 3 strategy health badge", () => {
    expect(
      formatStep3Badge({
        strategyLabel: pageStrategyLabel("spot_long_perp_short"),
        health: "HEALTHY",
        liqDistPct: 22,
      }),
    ).toBe(
      "Strategy: HL + Spot Arbitrage | Health: 🟢 HEALTHY (Liq Dist: 22.0%)",
    );
  });

  it("formats Step 3 badge with empty liq distance", () => {
    expect(
      formatStep3Badge({
        strategyLabel: pageStrategyLabel("spot_long_perp_short"),
        health: "HEALTHY",
        liqDistPct: null,
      }),
    ).toBe(
      "Strategy: HL + Spot Arbitrage | Health: 🟢 HEALTHY (Liq Dist: —)",
    );
  });
});
