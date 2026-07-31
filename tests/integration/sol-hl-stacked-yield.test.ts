import { Wallet } from "ethers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHlIntentBridge } from "../../src/adapters/hl/hl-intent-bridge";
import * as sessionExecutor from "../../src/adapters/hl/session-key-executor";
import {
  PGATE_MAX_SLIPPAGE_BPS,
  parseJupiterQuote,
} from "../../src/adapters/jupiter/index";
import { validateJupiterSlippageFor2Pc } from "../../src/adapters/jupiter/ingress-guard";
import {
  buildSolanaIngressIntentLeg,
  validateSolanaYieldIngress,
  type SolanaStableYieldSnapshot,
} from "../../src/adapters/solana/solana-yield-ingress";
import {
  __clearIntentLedgerForTests,
  commitIntent,
  createCrossLegIntent,
  prepareIntent,
} from "../../src/core/intent-ledger";
import { buildSystemState } from "../../src/core/state";

const TEST_PRIVATE_KEY =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const STABLE_SNAPSHOT: SolanaStableYieldSnapshot = {
  symbol: "USDC",
  mint: USDC_MINT,
  baseApy: 0.048,
  depthUsd: 2_000_000,
  source: "default",
  fetchedAt: new Date().toISOString(),
};

const PASSING_JUP_QUOTE = parseJupiterQuote(
  {
    inputMint: USDC_MINT,
    outputMint: SOL_MINT,
    inAmount: "100000000",
    outAmount: "650000000",
    slippageBps: 10,
    priceImpactPct: "0.04",
  },
  1_000,
);

describe("sol-hl stacked yield integration", () => {
  beforeEach(() => {
    __clearIntentLedgerForTests();
    vi.restoreAllMocks();
  });

  it("Solana guard pass → 2PC prepare → HL short hedge → COMMITTED", async () => {
    const solGuard = validateSolanaYieldIngress(STABLE_SNAPSHOT, 100_000, 1_000);
    expect(solGuard.readyFor2Pc).toBe(true);

    const jupGuard = validateJupiterSlippageFor2Pc(
      PASSING_JUP_QUOTE,
      PGATE_MAX_SLIPPAGE_BPS,
      "USDC",
    );
    expect(jupGuard.readyFor2Pc).toBe(true);

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

    const solLeg = buildSolanaIngressIntentLeg(STABLE_SNAPSHOT, 1_000);
    const hlLeg = {
      venue: "HL" as const,
      side: "SHORT" as const,
      sizeUsd: 1_000,
      symbol: "ETH",
    };

    createCrossLegIntent({
      id: "sol-hl-stack-1",
      legs: [solLeg, hlLeg],
      ttlMs: 30_000,
    });

    const prepared = await prepareIntent("sol-hl-stack-1", {
      prepareLeg: async (leg, index, intent) => {
        if (leg.venue === "JUPITER") {
          if (!solGuard.readyFor2Pc || !jupGuard.readyFor2Pc) {
            return { legIndex: index, ok: false, reason: "SOLANA_INGRESS_GUARD_BLOCK" };
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

    const committed = await commitIntent("sol-hl-stack-1", {
      commitLeg: bridge.commitLeg,
      flattenLeg: bridge.flattenLeg,
    });

    expect(committed.ok).toBe(true);
    expect(committed.intent.phase).toBe("COMMITTED");
    expect(committed.intent.legs.some((l) => l.venue === "HL" && l.side === "SHORT")).toBe(
      true,
    );
    expect(committed.intent.legs.some((l) => l.venue === "JUPITER")).toBe(true);
  });
});
