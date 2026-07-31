import { describe, expect, it } from "vitest";
import { buildHeaderHudClientScript } from "../src/ui/header-hud-client";

describe("header-hud-client", () => {
  it("uses one canonical top clock ticker", () => {
    const script = buildHeaderHudClientScript();
    expect(script).toContain("function refreshTopClock");
    expect(script).toContain("function startTopClockTicker");
    expect(script).toContain("HKT:");
    expect(script).not.toContain("updateClocks");
  });
});
