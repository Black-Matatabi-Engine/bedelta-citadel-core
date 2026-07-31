import { beforeEach, describe, expect, it } from "vitest";
import { buildYieldTriangleViewModel } from "../../apps/dashboard/lib/yield-view-model";
import {
  runIntentDemoScenario,
  runJupiterBlockDemo,
} from "../../apps/dashboard/services/intent-stream-demo";
import { __clearIntentLedgerForTests } from "../../src/core/intent-ledger";

beforeEach(() => {
  __clearIntentLedgerForTests();
});

describe("dashboard yield view model", () => {
  it("maps triangle API payload to HUD metrics", () => {
    const vm = buildYieldTriangleViewModel(
      {
        symbol: "ETH",
        soil: {
          ok: true,
          tripped: false,
          crossVenueSlippage: 0.0012,
          spotPerpSlippage: 0.0008,
          reasons: [],
        },
        soilOk: true,
        venues: [
          {
            venue: "hyperliquid",
            depth: {
              venue: "hyperliquid",
              symbol: "ETH",
              depthUsd: 1e6,
              spotPrice: 3000,
              perpPrice: 3000,
              fetchedAt: "",
            },
            apy: 0.15,
            edgeBps: 0,
            health: { ok: true, latencyMs: 1, reasons: [] },
          },
          {
            venue: "jupiter",
            depth: {
              venue: "jupiter",
              symbol: "ETH",
              depthUsd: 1e6,
              spotPrice: 3000,
              perpPrice: 3000,
              fetchedAt: "",
            },
            apy: 0.1,
            edgeBps: 0,
            health: { ok: true, latencyMs: 1, reasons: [] },
          },
        ],
        compositeDepthUsd: 1e6,
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
        recommendedRoute: { venue: "hyperliquid", apy: 0.15, edgeBps: 0 },
        guardLights: { hyperliquid: "green", jupiter: "green", polymarket: "green" },
        targetVenue: "HYPERLIQUID",
        ingressChain: "SOLANA",
        yieldStack: {
          ingressChain: "SOLANA",
          stableSymbol: "USDC",
          chainBaseApy: 0.048,
          hlFundingApy: 0.072,
          hlLendApy: 0.06,
          totalStackedApy: 0.12,
          stableDepthUsd: 2_000_000,
          yieldSource: "default",
        },
        fetchedAt: "2026-08-01T00:00:00.000Z",
        grossApy: 0.12,
        netApy: 0.102,
        protocolTreasuryFee: 0.018,
        netApyBand: { min: 6.2, base: 10.2, max: 22.4 },
      },
      false,
      null,
      "ETH",
    );

    expect(vm.hlApy).toBeCloseTo(15);
    expect(vm.jupiterImpactBps).toBe(12);
    expect(vm.polymarketSpreadBps).toBe(8);
  });
});

describe("dashboard intent stream demo", () => {
  it("runs commit scenario through COMMITTED", async () => {
    const events = await runIntentDemoScenario("commit");
    expect(events.some((e) => e.kind === "COMMIT" && e.phase === "COMMITTED")).toBe(true);
  });

  it("highlights TTL flatten on abort", async () => {
    const events = await runIntentDemoScenario("ttl_abort");
    expect(events.some((e) => e.kind === "TTL" && e.highlight)).toBe(true);
    expect(events.some((e) => e.kind === "FLATTEN" && e.message.includes("TTL_EXPIRED"))).toBe(
      true,
    );
  });

  it("blocks jupiter ingress in demo", async () => {
    const events = await runJupiterBlockDemo();
    expect(events.some((e) => e.message.includes("Jupiter ingress guard"))).toBe(true);
  });
});
