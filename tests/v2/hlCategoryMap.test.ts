import { describe, expect, it } from "vitest";
import {
  bucketTokensByHlCategory,
  mapHlTokenToCategory,
  matrixFilterMatchesCategory,
  worldCategoryToMatrixFilter,
} from "../../src/services/exchanges/hlCategoryMap";

describe("hlCategoryMap — 6 World-Tree branches", () => {
  it("maps crypto / commodity / stock / index / fx / pre-ipo names", () => {
    expect(mapHlTokenToCategory("BTC")).toBe("Crypto");
    expect(mapHlTokenToCategory("xyz:GOLD")).toBe("Commodities");
    expect(mapHlTokenToCategory("xyz:NVDA")).toBe("Stocks");
    expect(mapHlTokenToCategory("xyz:XYZ100")).toBe("Indices");
    expect(mapHlTokenToCategory("xyz:EURUSD")).toBe("FX");
    expect(mapHlTokenToCategory("PRE-IPO SPACE")).toBe("Pre-IPO");
  });

  it("buckets ALL tokens without truncation", () => {
    const names = ["ETH", "SOL", "xyz:SILVER", "xyz:AMD", "xyz:US500", "xyz:DXY"];
    const buckets = bucketTokensByHlCategory(names);
    expect(buckets.Crypto).toEqual(["ETH", "SOL"]);
    expect(buckets.Commodities).toEqual(["xyz:SILVER"]);
    expect(buckets.Stocks).toEqual(["xyz:AMD"]);
    expect(buckets.Indices).toEqual(["xyz:US500"]);
    expect(buckets.FX).toEqual(["xyz:DXY"]);
    const total =
      buckets.Crypto.length +
      buckets.Commodities.length +
      buckets.Stocks.length +
      buckets.Indices.length +
      buckets.FX.length +
      buckets["Pre-IPO"].length;
    expect(total).toBe(names.length);
  });

  it("maps world categories to matrix filters and matches rows", () => {
    expect(worldCategoryToMatrixFilter("Crypto")).toBe("CRYPTO");
    expect(worldCategoryToMatrixFilter("Pre-IPO")).toBe("PREIPO");
    expect(matrixFilterMatchesCategory("ALL", "crypto")).toBe(true);
    expect(matrixFilterMatchesCategory("STOCKS", "stock")).toBe(true);
    expect(matrixFilterMatchesCategory("INDICES", "index")).toBe(true);
    expect(matrixFilterMatchesCategory("STOCKS_INDICES", "preipo")).toBe(false);
    expect(matrixFilterMatchesCategory("STOCKS_INDICES", "stock")).toBe(true);
  });

  it("is a client-side module — Worker assemble must not depend on category sort", async () => {
    // Guard: hlCategoryMap must stay off the Worker hot path.
    // assembleMatrix ships hl_universe proxy; client buckets via this module.
    const { assembleMatrix } = await import(
      "../../src/services/assemble-matrix"
    );
    const result = assembleMatrix(
      "test",
      {
        hlSpot: { BTC: 100, ETH: 2000, SOL: 100 },
        hlPerp: { BTC: 100.1, ETH: 2001, SOL: 100.2 },
        dydxPerp: { BTC: 100.1, ETH: 2001, SOL: 100.2 },
        hlFunding: { BTC: 0.001, ETH: -0.0005, SOL: 0.002 },
        hlDayVolumeUsd: { BTC: 1e9, ETH: 5e8, SOL: 2e8 },
      },
      ["BTC", "ETH", "SOL"],
    );
    expect(Array.isArray(result.hl_universe)).toBe(true);
    expect(result.hl_universe!.length).toBeGreaterThanOrEqual(3);
    expect(result.hl_universe!.every((q) => typeof q.funding8h_pct === "number")).toBe(
      true,
    );
    const names = result.hl_universe!.map((q) => q.symbol);
    const buckets = bucketTokensByHlCategory(names);
    expect(buckets.Crypto.length).toBe(names.length);
  });
});
