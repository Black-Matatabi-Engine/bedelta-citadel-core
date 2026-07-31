import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PGATE_MAX_SLIPPAGE_BPS,
  parseJupiterQuote,
} from "../../src/adapters/jupiter/index";
import {
  fetchAndValidateJupiterIngress,
  validateJupiterSlippageFor2Pc,
} from "../../src/adapters/jupiter/ingress-guard";
import {
  __clearIntentLedgerForTests,
  createCrossLegIntent,
  prepareIntent,
} from "../../src/core/intent-ledger";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const PASSING_QUOTE = parseJupiterQuote(
  {
    inputMint: SOL_MINT,
    outputMint: USDC_MINT,
    inAmount: "100000000",
    outAmount: "16198753",
    slippageBps: 10,
    priceImpactPct: "0.05",
  },
  100,
);

const FAILING_QUOTE = parseJupiterQuote(
  {
    inputMint: SOL_MINT,
    outputMint: USDC_MINT,
    inAmount: "100000000",
    outAmount: "16198753",
    slippageBps: 50,
    priceImpactPct: "0.5",
  },
  100,
);

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}

describe("jupiter ingress guard — 2PC block", () => {
  beforeEach(() => {
    __clearIntentLedgerForTests();
  });

  it("allows 2PC when slippage within cap", () => {
    const validation = validateJupiterSlippageFor2Pc(
      PASSING_QUOTE,
      PGATE_MAX_SLIPPAGE_BPS,
      "SOL",
    );

    expect(validation.allowed).toBe(true);
    expect(validation.readyFor2Pc).toBe(true);
    expect(validation.proposedLeg?.venue).toBe("JUPITER");
  });

  it("rejects 2PC when combined slippage exceeds max", () => {
    const validation = validateJupiterSlippageFor2Pc(
      FAILING_QUOTE,
      PGATE_MAX_SLIPPAGE_BPS,
    );

    expect(validation.allowed).toBe(false);
    expect(validation.readyFor2Pc).toBe(false);
    expect(validation.proposedLeg).toBeNull();
    expect(validation.reasons.some((r) => r.includes("JUPITER"))).toBe(true);
  });

  it("fetchAndValidateJupiterIngress blocks high-impact routes (mocked)", async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({
        inputMint: SOL_MINT,
        outputMint: USDC_MINT,
        inAmount: "100000000",
        outAmount: "16198753",
        slippageBps: 80,
        priceImpactPct: "1.2",
      }),
    );

    const validation = await fetchAndValidateJupiterIngress({
      inputMint: SOL_MINT,
      outputMint: USDC_MINT,
      amountUsd: 100,
      fetchOptions: { fetchFn },
    });

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(validation.readyFor2Pc).toBe(false);
  });

  it("blocks 2PC prepare when jupiter ingress validation fails", async () => {
    const hlLeg = { venue: "HL" as const, side: "SHORT" as const, sizeUsd: 500, symbol: "ETH" };
    const jupValidation = validateJupiterSlippageFor2Pc(FAILING_QUOTE);
    expect(jupValidation.proposedLeg).toBeNull();

    createCrossLegIntent({
      id: "jup-block-1",
      legs: [
        hlLeg,
        { venue: "JUPITER", side: "BUY" as const, sizeUsd: 100, symbol: "SOL" },
      ],
    });

    const result = await prepareIntent("jup-block-1", {
      prepareLeg: async (leg, index) => {
        if (leg.venue === "JUPITER") {
          const v = validateJupiterSlippageFor2Pc(FAILING_QUOTE);
          return v.readyFor2Pc
            ? { legIndex: index, ok: true, filledUsd: leg.sizeUsd }
            : { legIndex: index, ok: false, reason: "JUPITER_2PC_SLIPPAGE_BLOCK" };
        }
        return { legIndex: index, ok: true, filledUsd: leg.sizeUsd };
      },
    });

    expect(result.ok).toBe(false);
    expect(result.intent.phase).toBe("ABORTED");
    expect(result.intent.flattenActions.some((a) => a.venue === "HL")).toBe(true);
  });
});
