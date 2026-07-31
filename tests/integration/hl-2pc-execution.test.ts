import { Wallet } from "ethers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHlIntentBridge } from "../../src/adapters/hl/hl-intent-bridge";
import * as sessionExecutor from "../../src/adapters/hl/session-key-executor";
import {
  __clearIntentLedgerForTests,
  commitIntent,
  createCrossLegIntent,
  prepareIntent,
} from "../../src/core/intent-ledger";
import { buildSystemState } from "../../src/core/state";

const TEST_PRIVATE_KEY =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

const HL_LEG = {
  venue: "HL" as const,
  side: "SHORT" as const,
  sizeUsd: 500,
  symbol: "ETH",
};

const POLY_LEG = {
  venue: "POLYMARKET" as const,
  side: "BUY" as const,
  sizeUsd: 100,
};

describe("hl-2pc-execution integration", () => {
  beforeEach(() => {
    __clearIntentLedgerForTests();
    vi.restoreAllMocks();
  });

  it("flattens HL reduce-only when second leg TTL expires on commit", async () => {
    const flattenSpy = vi
      .spyOn(sessionExecutor, "flattenHlLeg")
      .mockResolvedValue({
        ok: true,
        dryRun: true,
        reduceOnly: true,
        filledUsd: 500,
      });

    const bridge = createHlIntentBridge({
      signer: new Wallet(TEST_PRIVATE_KEY),
      dryRun: true,
      isTestnet: true,
      systemState: buildSystemState({
        accountBalanceUsd: 50_000,
        currentCri: 100,
        skipHardlockAssert: true,
      }),
    });

    vi.spyOn(sessionExecutor, "executeHlSessionKeyOrder").mockResolvedValue({
      ok: true,
      dryRun: true,
      filledUsd: 500,
      reduceOnly: false,
    });

    createCrossLegIntent({
      id: "hl-poly-ttl-1",
      legs: [HL_LEG, POLY_LEG],
      ttlMs: 1_000,
      now: 1_000_000,
    });

    const prepared = await prepareIntent("hl-poly-ttl-1", {
      prepareLeg: bridge.prepareLeg,
      flattenLeg: bridge.flattenLeg,
      now: () => 1_000_000,
    });
    expect(prepared.ok).toBe(true);
    expect(prepared.intent.phase).toBe("PREPARED");

    const committed = await commitIntent("hl-poly-ttl-1", {
      commitLeg: bridge.commitLeg,
      flattenLeg: bridge.flattenLeg,
      now: () => 1_002_500,
    });

    expect(committed.ok).toBe(false);
    expect(committed.reason).toBe("PREPARE_TTL_EXPIRED");
    expect(committed.intent.phase).toBe("ABORTED");
    expect(committed.intent.flattenActions.length).toBeGreaterThan(0);
    expect(
      committed.intent.flattenActions.some((action) => action.venue === "HL"),
    ).toBe(true);
    expect(
      committed.intent.flattenActions.every((action) => action.reduceOnly),
    ).toBe(true);

    expect(flattenSpy).toHaveBeenCalled();
    const hlFlattenCall = flattenSpy.mock.calls.find(
      ([action]) => action.venue === "HL",
    );
    expect(hlFlattenCall?.[0].reduceOnly).toBe(true);
    expect(hlFlattenCall?.[0].reason).toBe("TTL_EXPIRED");
    expect(bridge.hlFlattenLog.some((entry) => entry.ok)).toBe(true);
  });
});
