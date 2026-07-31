import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_STABLE_BASE_APY,
  fetchAllSolanaStableYields,
  fetchSolanaStableYield,
  pickBestStableIngress,
  validateSolanaYieldIngress,
} from "../../src/adapters/solana/solana-yield-ingress";
import { computeStackedTotalApy, resolveYieldStack } from "../../src/services/yield-router";
import { HyperliquidYieldAdapter } from "../../src/adapters/hyperliquid";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}

describe("solana-yield-ingress", () => {
  it("reads stable base APY from Raydium pool wire", async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({
        data: { data: [{ tvl: 5_000_000, day: { apr: 5.2 } }] },
      }),
    );

    const snap = await fetchSolanaStableYield("USDC", { fetchFn });
    expect(snap.baseApy).toBeCloseTo(0.052);
    expect(snap.depthUsd).toBe(5_000_000);
    expect(snap.source).toBe("raydium");
  });

  it("falls back to default APY when Raydium unavailable", async () => {
    const fetchFn = vi.fn(async () => new Response("", { status: 502 }));
    const snap = await fetchSolanaStableYield("PYUSD", { fetchFn });
    expect(snap.baseApy).toBe(DEFAULT_STABLE_BASE_APY.PYUSD);
    expect(snap.source).toBe("default");
  });

  it("pickBestStableIngress selects highest APY with depth", async () => {
    const snaps = await fetchAllSolanaStableYields({
      fetchFn: vi.fn(async () => new Response("", { status: 502 })),
    });
    const best = pickBestStableIngress(snaps);
    expect(best?.symbol).toBe("PYUSD");
  });

  it("validateSolanaYieldIngress blocks shallow pools", () => {
    const shallow = {
      symbol: "USDT" as const,
      mint: "x",
      baseApy: 0.04,
      depthUsd: 1_000,
      source: "default" as const,
      fetchedAt: "",
    };
    const v = validateSolanaYieldIngress(shallow);
    expect(v.readyFor2Pc).toBe(false);
    expect(v.reasons.some((r) => r.includes("SOLANA_DEPTH"))).toBe(true);
  });
});

describe("yield stacking", () => {
  it("computeStackedTotalApy sums Solana base + HL funding", () => {
    expect(computeStackedTotalApy(0.048, 0.12)).toBeCloseTo(0.168);
  });

  it("resolveYieldStack builds HL-targeted stack snapshot", async () => {
    const hl = new HyperliquidYieldAdapter({
      fetchFn: vi.fn(async (_url, init) => {
        const body = JSON.parse(String(init?.body)) as { type?: string };
        if (body.type === "vaultSummaries") {
          return jsonResponse([{ name: "ETH", apr: "0.06" }]);
        }
        return jsonResponse([
          { universe: [{ name: "ETH" }] },
          [{ funding: "0.00001" }],
        ]);
      }),
    });

    const stack = await resolveYieldStack(
      "ETH",
      hl,
      [
        {
          symbol: "USDC",
          mint: "m",
          baseApy: 0.05,
          depthUsd: 2_000_000,
          source: "default",
          fetchedAt: "",
        },
      ],
    );

    expect(stack.solanaBaseApy).toBe(0.05);
    expect(stack.hlFundingApy).toBeGreaterThan(0);
    expect(stack.totalStackedApy).toBeCloseTo(stack.solanaBaseApy + stack.hlFundingApy);
  });
});
