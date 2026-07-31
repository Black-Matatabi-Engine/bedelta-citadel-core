import { describe, expect, it } from "vitest";
import {
  BAGUA_GATE_UI,
  enrichSystemStateTaijiBagua,
  resolveActiveGate,
  resolveTaijiMode,
  TAIJI_YANG_CRI_MIN,
} from "../src/services/taiji-bagua";
import { buildSystemState } from "../src/services/systemState";

const healthyBase = () =>
  buildSystemState({
    currentCri: 100,
    skipHardlockAssert: true,
  });

describe("taiji-bagua resolvers", () => {
  it("YANG_STRIKE when CRI >= 75 and soil clear", () => {
    expect(
      resolveTaijiMode(
        { currentCri: 75, hardlock: false, isStale: false, signingChannelOpen: true },
        { soilTripped: false },
      ),
    ).toBe("YANG_STRIKE");
    expect(
      resolveTaijiMode(
        { currentCri: 100, hardlock: false, isStale: false, signingChannelOpen: true },
        {},
      ),
    ).toBe("YANG_STRIKE");
  });

  it("YIN_YIELD when CRI below threshold, stale, hardlocked, or soil tripped", () => {
    expect(
      resolveTaijiMode(
        { currentCri: 74, hardlock: false, isStale: false, signingChannelOpen: true },
        {},
      ),
    ).toBe("YIN_YIELD");
    expect(
      resolveTaijiMode(
        { currentCri: 100, hardlock: false, isStale: true, signingChannelOpen: true },
        {},
      ),
    ).toBe("YIN_YIELD");
    expect(
      resolveTaijiMode(
        { currentCri: 100, hardlock: true, isStale: false, signingChannelOpen: false },
        {},
      ),
    ).toBe("YIN_YIELD");
    expect(
      resolveTaijiMode(
        { currentCri: 100, hardlock: false, isStale: false, signingChannelOpen: true },
        { soilTripped: true },
      ),
    ).toBe("YIN_YIELD");
  });

  it("maps Bagua gates by priority", () => {
    expect(
      resolveActiveGate(
        { currentCri: 0, hardlock: true, isStale: false, signingChannelOpen: false },
        {},
      ),
    ).toBe("DUI_DEATH");
    expect(
      resolveActiveGate(
        { currentCri: 80, hardlock: false, isStale: true, signingChannelOpen: false },
        {},
      ),
    ).toBe("XUN_BLOCK");
    expect(
      resolveActiveGate(
        { currentCri: 80, hardlock: false, isStale: false, signingChannelOpen: true },
        { soilTripped: true },
      ),
    ).toBe("ZHEN_HARM");
    expect(
      resolveActiveGate(
        { currentCri: 60, hardlock: false, isStale: false, signingChannelOpen: true },
        { isHedgeActive: true },
      ),
    ).toBe("GEN_LIFE");
    expect(
      resolveActiveGate(
        { currentCri: TAIJI_YANG_CRI_MIN, hardlock: false, isStale: false, signingChannelOpen: true },
        {},
      ),
    ).toBe("QIAN_OPEN");
    expect(
      resolveActiveGate(
        { currentCri: 20, hardlock: false, isStale: false, signingChannelOpen: true },
        {},
      ),
    ).toBe("KAN_SINK");
    expect(
      resolveActiveGate(
        { currentCri: 40, hardlock: false, isStale: false, signingChannelOpen: true },
        {},
      ),
    ).toBe("KUN_REST");
    expect(
      resolveActiveGate(
        { currentCri: 60, hardlock: false, isStale: false, signingChannelOpen: true },
        {},
      ),
    ).toBe("LI_BRIGHT");
  });

  it("enrichSystemStateTaijiBagua attaches derived fields via buildSystemState", () => {
    const state = healthyBase();
    expect(state.taijiMode).toBe("YANG_STRIKE");
    expect(state.activeGate).toBe("QIAN_OPEN");
  });

  it("exposes tooltip copy for all eight Bagua gates", () => {
    for (const gate of Object.keys(BAGUA_GATE_UI)) {
      expect(BAGUA_GATE_UI[gate as keyof typeof BAGUA_GATE_UI].tooltip.length).toBeGreaterThan(20);
    }
  });
});
