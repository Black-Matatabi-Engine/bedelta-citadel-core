import { describe, expect, it, vi } from "vitest";
import { handleYieldTriangleRequest } from "../../src/api/routes/yield";
import * as yieldRouter from "../../src/services/yield-router";

describe("yield triangle API", () => {
  it("GET /api/yield/triangle?symbol=ETH returns gate status JSON", async () => {
    vi.spyOn(yieldRouter, "queryYieldTriangle").mockResolvedValue({
      symbol: "ETH",
      soil: {
        ok: true,
        tripped: false,
        crossVenueSlippage: 0,
        spotPerpSlippage: 0,
        reasons: [],
      },
      soilOk: true,
      venues: [],
      compositeDepthUsd: 1_000_000,
      bestApyVenue: "hyperliquid",
      routable: true,
      reasons: [],
      gateStatus: {
        soilOk: true,
        routable: true,
        intent2pcReady: true,
        signingChannelOpen: true,
        dynamicMaxSlUsd: 600,
        phase: "IDLE",
        reasons: [],
      },
      recommendedRoute: { venue: "hyperliquid", apy: 0.12, edgeBps: 50 },
      fetchedAt: "2026-08-01T00:00:00.000Z",
    });

    const res = await handleYieldTriangleRequest(
      new Request("https://example.com/api/yield/triangle?symbol=ETH"),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { symbol: string; gateStatus: { phase: string } };
    expect(body.symbol).toBe("ETH");
    expect(body.gateStatus.phase).toBe("IDLE");
  });

  it("rejects invalid symbol", async () => {
    const res = await handleYieldTriangleRequest(
      new Request("https://example.com/api/yield/triangle?symbol=!!!"),
    );
    expect(res.status).toBe(400);
  });
});
