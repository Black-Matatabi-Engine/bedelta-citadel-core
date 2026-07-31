import type { YieldTriangleResponse } from "../../../src/services/yield-router";
import type { YieldTriangleViewModel } from "../types";

const EMPTY_LIGHTS = {
  hyperliquid: "amber" as const,
  jupiter: "amber" as const,
  polymarket: "amber" as const,
};

const EMPTY_GATE = {
  soilOk: false,
  routable: false,
  intent2pcReady: false,
  signingChannelOpen: false,
  dynamicMaxSlUsd: 0,
  phase: "IDLE" as const,
  reasons: [] as string[],
};

export function buildYieldTriangleViewModel(
  data: YieldTriangleResponse | null,
  loading: boolean,
  error: string | null,
  symbol: string,
): YieldTriangleViewModel {
  if (!data) {
    return {
      symbol,
      hlApy: 0,
      jupiterImpactBps: 0,
      polymarketSpreadBps: 0,
      fundingRateBps: 0,
      gateStatus: EMPTY_GATE,
      guardLights: EMPTY_LIGHTS,
      fetchedAt: "",
      loading,
      error,
    };
  }

  const hl = data.venues.find((v) => v.venue === "hyperliquid");
  const jup = data.venues.find((v) => v.venue === "jupiter");

  return {
    symbol: data.symbol,
    hlApy: (hl?.apy ?? 0) * 100,
    jupiterImpactBps: Math.round(data.soil.crossVenueSlippage * 10_000),
    polymarketSpreadBps: Math.round(data.soil.spotPerpSlippage * 10_000),
    fundingRateBps: Math.round((jup?.depth.perpPrice ? data.soil.spotPerpSlippage : 0) * 10_000),
    gateStatus: data.gateStatus,
    guardLights: data.guardLights,
    fetchedAt: data.fetchedAt,
    loading,
    error,
  };
}
