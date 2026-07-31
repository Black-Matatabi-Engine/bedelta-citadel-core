import { Wallet } from "ethers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildArbitrumIngressIntentLeg,
  validateArbitrumYieldIngress,
  type ArbitrumStableYieldSnapshot,
} from "../../src/adapters/arbitrum/arbitrum-yield-ingress";
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

const ARB_SNAPSHOT: ArbitrumStableYieldSnapshot = {
  symbol: "USDC",
  address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  baseApy: 0.038,
  depthUsd: 3_000_000,
  source: "aave",
  fetchedAt: new Date().toISOString(),
};

describe("arb-hl stacked yield integration", () => {
  beforeEach(() => {
    __clearIntentLedgerForTests();
    vi.restoreAllMocks();
  });

  it("Arbitrum guard pass → 2PC prepare → HL short hedge → COMMITTED", async () => {
    const arbGuard = validateArbitrumYieldIngress(ARB_SNAPSHOT, 100_000, 1_000);
    expect(arbGuard.readyFor2Pc).toBe(true);

    vi.spyOn(sessionExecutor, "executeHlSessionKeyOrder").mockResolvedValue({
      ok: true,
      dryRun: true,
      filledUsd: 1_000,
      reduceOnly: false,
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

    const arbLeg = buildArbitrumIngressIntentLeg(ARB_SNAPSHOT, 1_000);
    const hlLeg = {
      venue: "HL" as const,
      side: "SHORT" as const,
      sizeUsd: 1_000,
      symbol: "ETH",
    };

    createCrossLegIntent({
      id: "arb-hl-stack-1",
      legs: [arbLeg, hlLeg],
      ttlMs: 30_000,
    });

    const prepared = await prepareIntent("arb-hl-stack-1", {
      prepareLeg: async (leg, index, intent) => {
        if (leg.venue === "GMX") {
          if (!arbGuard.readyFor2Pc) {
            return { legIndex: index, ok: false, reason: "ARBITRUM_INGRESS_GUARD_BLOCK" };
          }
          return { legIndex: index, ok: true, filledUsd: leg.sizeUsd };
        }
        return bridge.prepareLeg(leg, index, intent);
      },
      flattenLeg: bridge.flattenLeg,
    });

    expect(prepared.ok).toBe(true);
    expect(prepared.intent.phase).toBe("PREPARED");
    expect(prepared.intent.legResults.every((r) => r.ok)).toBe(true);

    const committed = await commitIntent("arb-hl-stack-1", {
      commitLeg: bridge.commitLeg,
      flattenLeg: bridge.flattenLeg,
    });

    expect(committed.ok).toBe(true);
    expect(committed.intent.phase).toBe("COMMITTED");
    expect(committed.intent.legs.some((l) => l.venue === "HL" && l.side === "SHORT")).toBe(
      true,
    );
    expect(committed.intent.legs.some((l) => l.venue === "GMX")).toBe(true);
  });
});
