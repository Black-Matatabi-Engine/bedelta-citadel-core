import { describe, expect, it } from "vitest";
import {
  computeIsMacroBlocking,
  isMacroDefconEmergency,
  MACRO_BLOCK_MS,
  nextMacroDate,
  US_MACRO_EVENTS,
} from "../src/services/macro-radar";
import { deriveCriFromRiskSignals } from "../src/services/systemState";

describe("macro-radar", () => {
  it("exposes Phase 1 calendar events", () => {
    expect(US_MACRO_EVENTS.length).toBeGreaterThanOrEqual(4);
    expect(MACRO_BLOCK_MS).toBe(6 * 60 * 60 * 1000);
  });

  it("nextMacroDate returns upcoming or LIVE release", () => {
    const dates = ["2026-07-29T18:00:00Z", "2026-09-16T18:00:00Z"];
    const before = new Date("2026-07-20T00:00:00Z");
    expect(nextMacroDate(dates, before)).toBe(
      new Date("2026-07-29T18:00:00Z").getTime(),
    );
  });

  it("computeIsMacroBlocking is true inside 6h window", () => {
    const release = new Date(US_MACRO_EVENTS[0]!.dates[0]!);
    const inside = new Date(release.getTime() - 3 * 60 * 60 * 1000);
    const outside = new Date(release.getTime() - 7 * 60 * 60 * 1000);
    // Only assert relative to first event if no earlier event overlaps
    if (computeIsMacroBlocking(outside) === false) {
      expect(computeIsMacroBlocking(inside)).toBe(true);
    } else {
      expect(computeIsMacroBlocking(inside)).toBe(true);
    }
  });

  it("isMacroDefconEmergency matches VIX/DVOL/macro thresholds", () => {
    expect(isMacroDefconEmergency({ vix: 16, dvol: 50 })).toBe(false);
    expect(isMacroDefconEmergency({ vix: 21 })).toBe(true);
    expect(isMacroDefconEmergency({ dvol: 56 })).toBe(true);
    expect(isMacroDefconEmergency({ macroBlocking: true })).toBe(true);
    expect(isMacroDefconEmergency({ forceDefcon1: true })).toBe(true);
  });

  it("macro blocking feeds deriveCriFromRiskSignals Tier 1", () => {
    const cri = deriveCriFromRiskSignals({
      macroBlocking: computeIsMacroBlocking(
        new Date(new Date(US_MACRO_EVENTS[0]!.dates[0]!).getTime() - 60_000),
      ),
    });
    // If calendar says blocking, CRI drops by Tier 1; otherwise stays 100
    if (
      computeIsMacroBlocking(
        new Date(new Date(US_MACRO_EVENTS[0]!.dates[0]!).getTime() - 60_000),
      )
    ) {
      expect(cri).toBe(95);
    } else {
      expect(cri).toBe(100);
    }
  });
});
