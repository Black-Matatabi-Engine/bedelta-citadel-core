import { describe, expect, it } from "vitest";
import {
  HEALTH_CRI_MIN,
  HEALTH_CRI_MAX,
  ROOT_DEFENSE_SCORE_MAX,
  RISK_INDEX_MAX,
  TOXIC_MODE_THRESHOLD,
} from "../src/config/constants";
import {
  reduceSystemState,
  resolveHudStateFromHealthCri,
  type ClientSystemState,
} from "../src/ui/client/store/reducers/system-state";
import {
  DEFAULT_SV_DEMO_STATE,
  reduceDemoState,
} from "../src/ui/client/store/reducers/demo-state";
import { DASHBOARD_STORE_SCRIPT } from "../src/ui/client/store/dashboard-store";

const baseState = (): ClientSystemState => ({
  accountBalanceUsd: 10_000,
  currentCri: 100,
  dynamicMaxSL: 200,
  hudState: "GREEN",
  hardlock: false,
  signingChannelOpen: true,
});

describe("config/constants SSOT", () => {
  it("separates health CRI (100→0) from risk index (0→100) directions", () => {
    expect(HEALTH_CRI_MAX).toBe(100);
    expect(HEALTH_CRI_MIN).toBe(0);
    expect(ROOT_DEFENSE_SCORE_MAX).toBe(100);
    expect(RISK_INDEX_MAX).toBe(100);
    expect(TOXIC_MODE_THRESHOLD).toBe(75);
  });
});

describe("system-state reducer", () => {
  it("merges patches without mutating prior snapshot", () => {
    const prev = baseState();
    const next = reduceSystemState(prev, { currentCri: 50, hudState: "AMBER" });
    expect(prev.currentCri).toBe(100);
    expect(next.currentCri).toBe(50);
    expect(next.hudState).toBe("AMBER");
  });

  it("forces signing channel closed at CRI zero", () => {
    const next = reduceSystemState(baseState(), {
      currentCri: 0,
      hardlock: true,
      signingChannelOpen: true,
    });
    expect(next.signingChannelOpen).toBe(false);
    expect(next.hardlock).toBe(true);
  });

  it("resolveHudStateFromHealthCri maps health bands", () => {
    expect(resolveHudStateFromHealthCri(100, false)).toBe("GREEN");
    expect(resolveHudStateFromHealthCri(40, false)).toBe("AMBER");
    expect(resolveHudStateFromHealthCri(10, false)).toBe("SANTENMOKU");
    expect(resolveHudStateFromHealthCri(0, true)).toBe("BLOCKED");
  });
});

describe("demo-state reducer", () => {
  it("routes DEFCON toggles through __SV_DEMO__ actions", () => {
    const on = reduceDemoState(DEFAULT_SV_DEMO_STATE, {
      type: "DEMO_SET_FORCE_DEFCON1",
      value: true,
    });
    expect(on.forceDefcon1).toBe(true);
    const off = reduceDemoState(on, { type: "DEMO_TOGGLE_FORCE_DEFCON1" });
    expect(off.forceDefcon1).toBe(false);
  });

  it("tracks root trip status", () => {
    const next = reduceDemoState(DEFAULT_SV_DEMO_STATE, {
      type: "DEMO_SET_ROOT_STATUS",
      root: 8,
      status: "TRIPPED",
    });
    expect(next.rootStatus[8]).toBe("TRIPPED");
    expect(next.rootTripped[8]).toBe(true);
  });
});

describe("dashboard-store script", () => {
  it("defines __SV_DEMO__ pipeline and store-only applySystemState", () => {
    expect(DASHBOARD_STORE_SCRIPT).toContain("window.__SV_DEMO__");
    expect(DASHBOARD_STORE_SCRIPT).toContain("function svDemoDispatch");
    expect(DASHBOARD_STORE_SCRIPT).toContain("function reduceSystemStateClient");
    expect(DASHBOARD_STORE_SCRIPT).toContain("function applySystemState");
    expect(DASHBOARD_STORE_SCRIPT).toContain("__svDashboardStore");
    expect(DASHBOARD_STORE_SCRIPT).toContain("subscribe");
    expect(DASHBOARD_STORE_SCRIPT).not.toContain("devForceDefcon1");
  });
});
