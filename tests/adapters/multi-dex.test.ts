import { describe, expect, it, vi } from "vitest";
import { CamelotAdapter } from "../../src/adapters/camelot";
import { OrcaAdapter } from "../../src/adapters/orca";
import { RaydiumAdapter } from "../../src/adapters/raydium";
import { UniswapV3Adapter } from "../../src/adapters/uniswap-v3";
import { assertRpcAllowlisted } from "../../src/services/defense/rpc-whitelist";

const RAYDIUM_POOL = {
  data: { data: [{ tvl: 1_800_000, price: 150.5, day: { apr: 12.5, volume: 900_000 } }] },
};

const ORCA_POOLS = {
  whirlpools: [
    {
      tvl: 950_000,
      price: 150.2,
      feeRate: 400,
      tokenA: { symbol: "SOL" },
      tokenB: { symbol: "USDC" },
    },
  ],
};

const UNISWAP_POOL = {
  data: {
    pools: [
      {
        totalValueLockedUSD: "3200000",
        token0Price: "3500",
        token1Price: "1",
        feeTier: "3000",
        volumeUSD: "12000000",
      },
    ],
  },
};

const CAMELOT_POOLS = {
  pools: [
    {
      tvlUsd: 2_100_000,
      price: 3500,
      apr: 0.18,
      volumeUsd24h: 4_500_000,
      token0Symbol: "WETH",
      token1Symbol: "USDC",
    },
  ],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("multi-dex trinity adapters", () => {
  it("RaydiumAdapter getDepth/getAPY/checkHealth", async () => {
    const fetchFn = vi.fn(async () => jsonResponse(RAYDIUM_POOL));
    const adapter = new RaydiumAdapter({ fetchFn });
    const depth = await adapter.getDepth("SOL");
    expect(depth.venue).toBe("raydium");
    expect(depth.depthUsd).toBe(1_800_000);
    expect(await adapter.getAPY("SOL")).toBeCloseTo(0.125);
    expect((await adapter.checkHealth()).ok).toBe(true);
  });

  it("OrcaAdapter getDepth/getAPY/checkHealth", async () => {
    const fetchFn = vi.fn(async () => jsonResponse(ORCA_POOLS));
    const adapter = new OrcaAdapter({ fetchFn });
    const depth = await adapter.getDepth("SOL");
    expect(depth.venue).toBe("orca");
    expect(depth.depthUsd).toBe(950_000);
    expect(await adapter.getAPY("SOL")).toBeGreaterThan(0);
    expect((await adapter.checkHealth()).ok).toBe(true);
  });

  it("UniswapV3Adapter getDepth/getAPY/checkHealth via subgraph", async () => {
    const fetchFn = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      return jsonResponse(UNISWAP_POOL);
    });
    const adapter = new UniswapV3Adapter({ fetchFn });
    const depth = await adapter.getDepth("ETH");
    expect(depth.venue).toBe("uniswap-v3");
    expect(depth.depthUsd).toBe(3_200_000);
    expect(await adapter.getAPY("ETH")).toBeGreaterThan(0);
    expect((await adapter.checkHealth()).ok).toBe(true);
  });

  it("CamelotAdapter getDepth/getAPY/checkHealth", async () => {
    const fetchFn = vi.fn(async (url: string) => {
      expect(url).toContain("chainId=42161");
      return jsonResponse(CAMELOT_POOLS);
    });
    const adapter = new CamelotAdapter({ fetchFn });
    const depth = await adapter.getDepth("ETH");
    expect(depth.venue).toBe("camelot");
    expect(depth.depthUsd).toBe(2_100_000);
    expect(await adapter.getAPY("ETH")).toBe(0.18);
    expect((await adapter.checkHealth()).ok).toBe(true);
  });

  it("allowlists Multi-DEX API domains", () => {
    expect(() => assertRpcAllowlisted("https://api-v3.raydium.io/pools/info/mint")).not.toThrow();
    expect(() => assertRpcAllowlisted("https://api.mainnet.orca.so/v1/whirlpool/list")).not.toThrow();
    expect(() =>
      assertRpcAllowlisted(
        "https://gateway.thegraph.com/api/subgraphs/id/5zvR82QoaXYFyDEHLZJKyHGGzrSXmHrBgR5s6gHBfoG7",
      ),
    ).not.toThrow();
    expect(() => assertRpcAllowlisted("https://api.camelot.exchange/liquidity/v2/pools")).not.toThrow();
  });
});
