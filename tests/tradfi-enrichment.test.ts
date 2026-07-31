import { describe, expect, it } from "vitest";
import { parseTradFiEnrichmentFromXyzMeta } from "../src/services/exchanges/tradfi-enrichment";
import type { HyperliquidMetaAndAssetCtxs } from "../src/types/matrix";

describe("parseTradFiEnrichmentFromXyzMeta", () => {
  it("computes mark price, 24h change, and commodity key aliases", () => {
    const raw: HyperliquidMetaAndAssetCtxs = [
      {
        universe: [
          { name: "xyz:GOLD" },
          { name: "xyz:CL" },
          { name: "xyz:BRENTOIL" },
          { name: "xyz:NATGAS" },
        ],
      },
      [
        {
          midPx: "100",
          prevDayPx: "90",
          openInterest: "5000",
        },
        {
          midPx: "80",
          prevDayPx: "100",
          openInterest: "9000",
        },
        {
          midPx: "86",
          prevDayPx: "88",
          openInterest: "12000",
        },
        {
          midPx: "2.8",
          prevDayPx: "2.9",
          openInterest: "300000",
        },
      ],
    ];

    const pack = parseTradFiEnrichmentFromXyzMeta(raw);
    expect(pack.commodities.gold?.markPrice).toBe(100);
    expect(pack.commodities.gold?.change24h_pct).toBeCloseTo(11.111, 2);
    expect(pack.commodities.wti?.hlSymbol).toBe("CL");
    expect(pack.commodities.wti?.change24h_pct).toBeCloseTo(-20, 2);
    // NATGAS has larger raw OI but BRENTOIL has higher notional (86 × 12000 > 2.8 × 3M)
    expect(pack.kings.commodities?.key).toBe("brent");
    expect(pack.kings.commodities?.displayName).toBe("BRENT");
    expect(pack.kings.commodities?.openInterestNotionalUsd).toBe(86 * 12000);
  });

  it("ranks king by OI notional USDC not raw token size", () => {
    const raw: HyperliquidMetaAndAssetCtxs = [
      {
        universe: [{ name: "xyz:BRENTOIL" }, { name: "xyz:NATGAS" }],
      },
      [
        { midPx: "87.5", prevDayPx: "88", openInterest: "2000000" },
        { midPx: "2.8", prevDayPx: "2.9", openInterest: "50000000" },
      ],
    ];

    const pack = parseTradFiEnrichmentFromXyzMeta(raw);
    expect(pack.kings.commodities?.key).toBe("brent");
    expect(pack.kings.commodities?.openInterestNotionalUsd).toBeCloseTo(
      175_000_000,
      -3,
    );
  });

  it("classifies extended HL commodity tickers (PALLADIUM, URNM, ALUMINIUM)", () => {
    const raw: HyperliquidMetaAndAssetCtxs = [
      {
        universe: [
          { name: "xyz:PALLADIUM" },
          { name: "xyz:URNM" },
          { name: "xyz:ALUMINIUM" },
        ],
      },
      [
        { midPx: "950", prevDayPx: "940", openInterest: "800", funding: "0.00001" },
        { midPx: "42", prevDayPx: "41", openInterest: "12000", funding: "0.00002" },
        { midPx: "2400", prevDayPx: "2380", openInterest: "5000", funding: "0.000015" },
      ],
    ];

    const pack = parseTradFiEnrichmentFromXyzMeta(raw);
    expect(pack.commodities.palladium?.hlSymbol).toBe("PALLADIUM");
    expect(pack.commodities.urnm?.openInterestNotionalUsd).toBeCloseTo(504000, -2);
    expect(pack.commodities.aluminium?.markPrice).toBe(2400);
    expect(pack.commodities.aluminium?.fundingRate8h_pct).toBeCloseTo(0.012, 4);
  });

  it("routes unmatched OI equity tickers to Stocks — never Commodities", () => {
    const raw: HyperliquidMetaAndAssetCtxs = [
      {
        universe: [
          { name: "xyz:GOOGL" },
          { name: "xyz:MSFT" },
          { name: "xyz:INTC" },
          { name: "xyz:SMSN" },
          { name: "xyz:CRCL" },
          { name: "xyz:GOLD" },
        ],
      },
      [
        { midPx: "180", prevDayPx: "175", openInterest: "10000" },
        { midPx: "420", prevDayPx: "410", openInterest: "8000" },
        { midPx: "45", prevDayPx: "44", openInterest: "12000" },
        { midPx: "55", prevDayPx: "54", openInterest: "9000" },
        { midPx: "90", prevDayPx: "88", openInterest: "7000" },
        { midPx: "2400", prevDayPx: "2380", openInterest: "5000" },
      ],
    ];

    const pack = parseTradFiEnrichmentFromXyzMeta(raw);
    expect(pack.stocks.googl?.hlSymbol).toBe("GOOGL");
    expect(pack.stocks.msft?.hlSymbol).toBe("MSFT");
    expect(pack.stocks.intc?.hlSymbol).toBe("INTC");
    expect(pack.stocks.smsn?.hlSymbol).toBe("SMSN");
    expect(pack.stocks.crcl?.hlSymbol).toBe("CRCL");
    expect(pack.commodities.gold?.hlSymbol).toBe("GOLD");
    expect(pack.commodities.googl).toBeUndefined();
    expect(pack.commodities.msft).toBeUndefined();
  });

  it("includes FULL xyz universe — unknown tickers not dropped by keyword whitelist", () => {
    const raw: HyperliquidMetaAndAssetCtxs = [
      {
        universe: [
          { name: "xyz:GOLD" },
          { name: "xyz:OBSCUREEQ" },
          { name: "BARESTOCK" },
          { name: "xyz:SP500" },
        ],
      },
      [
        { midPx: "2400", prevDayPx: "2380", openInterest: "100" },
        { midPx: "12", prevDayPx: "11", openInterest: "50000" },
        { midPx: "99", prevDayPx: "98", openInterest: "8000" },
        { midPx: "5000", prevDayPx: "4950", openInterest: "2000" },
      ],
    ];

    const pack = parseTradFiEnrichmentFromXyzMeta(raw);
    expect(pack.commodities.gold?.markPrice).toBe(2400);
    expect(pack.stocks.obscureeq?.hlSymbol).toBe("OBSCUREEQ");
    expect(pack.stocks.obscureeq?.openInterestNotionalUsd).toBe(12 * 50000);
    expect(pack.stocks.barestock?.markPrice).toBe(99);
    expect(pack.indices.sp500?.markPrice).toBe(5000);
    expect(pack.commodities.obscureeq).toBeUndefined();
  });
});
