import { describe, expect, it } from "vitest";
import {
  computeOrderbookMid,
  parseDydxPerpMidsFromMarkets,
  parseDydxTicker,
} from "../src/services/exchanges/dydx-adapter";

describe("dydx-adapter", () => {
  it("normalizes BTC-USD to BTC", () => {
    expect(parseDydxTicker("BTC-USD")).toBe("BTC");
    expect(parseDydxTicker("eth-usd")).toBe("ETH");
    expect(parseDydxTicker("INVALID")).toBeNull();
  });

  it("computes orderbook mid from bid/ask", () => {
    expect(
      computeOrderbookMid(
        [{ price: "100", size: "1" }],
        [{ price: "102", size: "1" }],
      ),
    ).toBe(101);
  });

  it("parses ACTIVE perpetual mids and skips settled markets", () => {
    const mids = parseDydxPerpMidsFromMarkets({
      "BTC-USD": {
        ticker: "BTC-USD",
        status: "ACTIVE",
        oraclePrice: "64000.5",
      },
      "MATIC-USD": {
        ticker: "MATIC-USD",
        status: "FINAL_SETTLEMENT",
        oraclePrice: "0.39",
      },
      "ETH-USD": {
        ticker: "ETH-USD",
        status: "ACTIVE",
        oraclePrice: "1850",
      },
    });

    expect(mids).toEqual({ BTC: 64000.5, ETH: 1850 });
  });
});
