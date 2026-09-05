import { afterEach, describe, expect, it } from "vitest";
import {
  FLAGS_IMBALANCE_TRIP,
  FLAGS_SEVERED,
  FLAGS_YIELD_SHOCK,
  evaluateGmxFlags,
  evaluatePendleFlags,
  packProtocolLane,
  PROTO_VECT_LEN,
} from "../../src/core/risk-engine-core";
import { __resetPendingExposureWindowForTests, recordPendingGmxSkew } from "../../src/core/pending-exposure-window";
import {
  __setSystemStateForTests,
  buildSystemState,
  readActiveSystemState,
} from "../../src/core/state";

const GMX_VEC = new Float64Array(PROTO_VECT_LEN);

afterEach(() => {
  __setSystemStateForTests(null);
  __resetPendingExposureWindowForTests();
});

describe("auto severance on bitmask trips", () => {
  it("severSigningChannel when GMX imbalance trips", () => {
    __setSystemStateForTests(buildSystemState({ accountBalanceUsd: 10_000, currentCri: 100, skipHardlockAssert: true }));
    const flags = evaluateGmxFlags(packProtocolLane(0, 4_500_000, 500_000, 5_500_000, 0, GMX_VEC));
    expect(flags & FLAGS_IMBALANCE_TRIP).not.toBe(0);
    expect(flags & FLAGS_SEVERED).not.toBe(0);
    const state = readActiveSystemState();
    expect(state.signingChannelOpen).toBe(false);
    expect(state.hardlock).toBe(true);
    expect(state.currentCri).toBe(0);
  });

  it("severSigningChannel when Pendle yield shock trips", () => {
    __setSystemStateForTests(buildSystemState({ accountBalanceUsd: 10_000, currentCri: 100, skipHardlockAssert: true }));
    const flags = evaluatePendleFlags(0.095, 0.062);
    expect(flags & FLAGS_YIELD_SHOCK).not.toBe(0);
    expect(flags & FLAGS_SEVERED).not.toBe(0);
    expect(readActiveSystemState().signingChannelOpen).toBe(false);
  });
});

describe("sliding-window pending GMX skew", () => {
  it("trips accumulated skew across sub-threshold splits", () => {
    const tvl = 5_500_000;
    const now = 1_700_000_000_000;
    const skewPerLeg = 700_000;
    let flags = 0;
    for (let i = 0; i < 3; i += 1) {
      flags = evaluateGmxFlags(
        packProtocolLane(0, 3_000_000, 2_500_000, tvl, 0, GMX_VEC),
        0,
        { skewDeltaUsd: skewPerLeg, notionalUsd: skewPerLeg, nowMs: now + i * 100 },
      );
    }
    expect(flags & FLAGS_IMBALANCE_TRIP).not.toBe(0);
    const snap = recordPendingGmxSkew(0, 0, now + 500);
    expect(snap.accumSkewUsd).toBeGreaterThanOrEqual(skewPerLeg * 3);
  });
});
