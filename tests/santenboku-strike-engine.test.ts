import { describe, expect, it } from "vitest";
import {
  createRoot17DailyState,
} from "../src/v2/services/root17-daily";
import {
  createSantenbokuStrikeEngine,
  DEFAULT_STRIKE_ALPHA,
  evaluateLeftEye,
  evaluateRightEye,
  evaluateStrikeGate,
  resolveStrikeAlphaConfig,
} from "../src/services/santenboku-strike-engine";

const PASS_SOIL = {
  symbol: "BTC",
  hlSpot: 100_000,
  hlPerp: 100_010,
  dydxPerp: 100_005,
} as const;

const PASS_ROOT20 = {
  symbol: "BTC",
  estimatedLossUsd: 50,
  accountBalanceUsd: 10_000,
} as const;

describe("resolveStrikeAlphaConfig", () => {
  it("returns defaults when env is empty", () => {
    expect(resolveStrikeAlphaConfig({})).toEqual(DEFAULT_STRIKE_ALPHA);
  });

  it("overrides thresholds from env strings", () => {
    const cfg = resolveStrikeAlphaConfig({
      STRIKE_IMBALANCE_RATIO_MIN: "2.0",
      STRIKE_MICRO_SPREAD_COLLAPSE_BPS: "5",
      STRIKE_FLEET_MODE: "true",
    });
    expect(cfg.imbalanceRatioMin).toBe(2);
    expect(cfg.microSpreadCollapseBps).toBe(5);
    expect(cfg.fleetMode).toBe(true);
  });
});

describe("evaluateLeftEye", () => {
  it("PASS when soil, root17, and root20 are clear", () => {
    const result = evaluateLeftEye({
      soil: PASS_SOIL,
      root17: { accountEquityUsd: 10_000, state: createRoot17DailyState() },
      root20: PASS_ROOT20,
    });
    expect(result.verdict).toBe("PASS");
    expect(result.phase).toBe("RIGHT_EYE");
    expect(result.root20Blocked).toBe(false);
  });

  it("FAIL when checkSoilResistance trips", () => {
    const result = evaluateLeftEye({
      soil: { ...PASS_SOIL, dydxPerp: 0 },
      root17: { accountEquityUsd: 10_000, state: createRoot17DailyState() },
      root20: PASS_ROOT20,
    });
    expect(result.verdict).toBe("FAIL");
    expect(result.phase).toBe("BLOCKED");
    expect(result.soil.tripped).toBe(true);
  });

  it("FAIL when rootProtection physical deadlock trips", () => {
    const result = evaluateLeftEye({
      soil: PASS_SOIL,
      root17: { accountEquityUsd: 10_000, state: createRoot17DailyState() },
      root20: { ...PASS_ROOT20, estimatedLossUsd: 999_999, criHardlock: true },
    });
    expect(result.verdict).toBe("FAIL");
    expect(result.root20Blocked).toBe(true);
  });
});

describe("evaluateRightEye", () => {
  it("STRIKE when imbalance ratio exceeds threshold", () => {
    const result = evaluateRightEye({
      snapshot: {
        symbol: "ETH",
        askDepthUsd: 200_000,
        bidDepthUsd: 100_000,
        imbalanceRatio: 2.0,
        microSpreadBps: 10,
        at: new Date().toISOString(),
      },
      config: DEFAULT_STRIKE_ALPHA,
    });
    expect(result.verdict).toBe("STRIKE");
    expect(result.imbalanceStrike).toBe(true);
  });

  it("STANDBY when neither imbalance nor micro-spread collapse fires", () => {
    const result = evaluateRightEye({
      snapshot: {
        symbol: "ETH",
        askDepthUsd: 100_000,
        bidDepthUsd: 95_000,
        imbalanceRatio: 1.05,
        microSpreadBps: 12,
        at: new Date().toISOString(),
      },
      config: DEFAULT_STRIKE_ALPHA,
    });
    expect(result.verdict).toBe("STANDBY");
  });
});

describe("evaluateStrikeGate", () => {
  it("blocks when left eye fails even if radar would strike", () => {
    const gate = evaluateStrikeGate({
      left: {
        soil: { ...PASS_SOIL, dydxPerp: 0 },
        root17: { accountEquityUsd: 10_000, state: createRoot17DailyState() },
        root20: PASS_ROOT20,
      },
      right: {
        snapshot: {
          symbol: "BTC",
          askDepthUsd: 300_000,
          bidDepthUsd: 100_000,
          imbalanceRatio: 3,
          microSpreadBps: 2,
          at: new Date().toISOString(),
        },
        config: DEFAULT_STRIKE_ALPHA,
      },
    });
    expect(gate.armed).toBe(false);
    expect(gate.phase).toBe("BLOCKED");
    expect(gate.right).toBeNull();
  });

  it("arms third eye when left PASS and right STRIKE", () => {
    const engine = createSantenbokuStrikeEngine();
    const gate = engine.evaluateStrikeGate({
      left: {
        soil: PASS_SOIL,
        root17: { accountEquityUsd: 10_000, state: createRoot17DailyState() },
        root20: PASS_ROOT20,
      },
      right: {
        snapshot: {
          symbol: "BTC",
          askDepthUsd: 300_000,
          bidDepthUsd: 100_000,
          imbalanceRatio: 3,
          microSpreadBps: 2,
          at: new Date().toISOString(),
        },
        config: engine.config,
      },
    });
    expect(gate.armed).toBe(true);
    expect(gate.phase).toBe("THIRD_EYE");
    expect(gate.label).toContain("THIRD EYE ARMED");
  });
});
