import { describe, expect, it, vi } from "vitest";
import { GmxAdapter } from "../../src/adapters/gmx";
import { JupiterAdapter } from "../../src/adapters/jupiter";
import { HyperliquidYieldAdapter } from "../../src/adapters/hyperliquid";
import { queryStructuralTriangle } from "../../src/services/yield-router";

const JUPITER_QUOTE = {
  inAmount: "1000000000",
  outAmount: "150000000",
  priceImpactPct: "0.02",
  slippageBps: 50,
};

const GMX_MARKETS = [
  {
    name: "ETH/USD",
    isDisabled: false,
    poolValueMax: "2500000",
    borrowingFactorPerSecondForLongs: "0.00000000001",
    fundingFactorPerSecond: "0.00000000001",
  },
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("structural triangle adapters", () => {
  it("JupiterAdapter getDepth/getAPY/checkHealth via quote API", async () => {
    const fetchFn = vi.fn(async () => jsonResponse(JUPITER_QUOTE));
    const adapter = new JupiterAdapter({ fetchFn, defaultApy: 0.07 });
    const depth = await adapter.getDepth("SOL");
    expect(depth.venue).toBe("jupiter");
    expect(depth.depthUsd).toBeGreaterThan(0);
    expect(await adapter.getAPY("SOL")).toBeCloseTo(0.07 - 0.0002, 4);
    expect((await adapter.checkHealth()).ok).toBe(true);
  });

  it("GmxAdapter reads vault RPC + markets/info health", async () => {
    const fetchFn = vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { method?: string };
        if (body.method === "eth_call") return jsonResponse({ result: "0x3" });
        return jsonResponse({ result: "0xabc123" });
      }
      return jsonResponse({ markets: GMX_MARKETS });
    });
    const adapter = new GmxAdapter({ fetchFn });
    const depth = await adapter.getDepth("ETH");
    expect(depth.venue).toBe("gmx");
    expect(depth.depthUsd).toBe(2_500_000);
    expect((await adapter.checkHealth()).ok).toBe(true);
  });

  it("HyperliquidYieldAdapter parses metaAndAssetCtxs depth", async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse([
        { universe: [{ name: "BTC", dayNtlVlm: "10000000" }] },
        [{ markPx: "65000", midPx: "64990", dayNtlVlm: "10000000" }],
      ]),
    );
    const adapter = new HyperliquidYieldAdapter({ fetchFn, defaultApy: 0.09 });
    const depth = await adapter.getDepth("BTC");
    expect(depth.venue).toBe("hyperliquid");
    expect(depth.depthUsd).toBe(500_000);
    expect(await adapter.getAPY()).toBe(0.09);
  });
});

describe("yield-router", () => {
  it("queryStructuralTriangle gates all venues with checkSoilResistance", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const hl = new HyperliquidYieldAdapter({
      fetchFn: vi.fn(async () =>
        jsonResponse([
          { universe: [{ name: "BTC" }] },
          [{ markPx: "65000", midPx: "65000" }],
        ]),
      ),
      defaultApy: 0.08,
    });
    const jup = new JupiterAdapter({
      fetchFn: vi.fn(async () => jsonResponse(JUPITER_QUOTE)),
      defaultApy: 0.07,
    });
    const gmx = new GmxAdapter({
      fetchFn: vi.fn(async (url: string, init?: RequestInit) => {
        if (init?.method === "POST") {
          const body = JSON.parse(String(init.body)) as { method?: string };
          if (body.method === "eth_call") return jsonResponse({ result: "0x2" });
          return jsonResponse({ result: "0x1" });
        }
        return jsonResponse({ markets: GMX_MARKETS });
      }),
    });

    const result = await queryStructuralTriangle("BTC", [hl, jup, gmx]);
    expect(result.venues).toHaveLength(3);
    expect(result.soilOk).toBe(true);
    expect(result.routable).toBe(true);
    expect(result.compositeDepthUsd).toBeGreaterThan(0);
    expect(result.bestApyVenue).toBe("hyperliquid");
  });

  it("queryStructuralTriangle trips when composite depth collapses", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const shallow = {
      id: "hyperliquid" as const,
      getDepth: async () => ({
        venue: "hyperliquid" as const,
        symbol: "BTC",
        depthUsd: 1_000,
        spotPrice: 65_000,
        perpPrice: 66_500,
        fetchedAt: new Date().toISOString(),
      }),
      getAPY: async () => 0.05,
      checkHealth: async () => ({ ok: true, latencyMs: 1, reasons: [] }),
    };

    const result = await queryStructuralTriangle("BTC", [shallow, shallow, shallow]);
    expect(result.soilOk).toBe(false);
    expect(result.routable).toBe(false);
    expect(result.reasons.some((r) => r.includes("DEPTH") || r.includes("SLIPPAGE"))).toBe(
      true,
    );
  });
});
