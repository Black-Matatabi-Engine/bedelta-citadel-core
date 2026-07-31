/**
 * Yield Triangle Router — HL · Jupiter · GMX read-path with 2PC gate status.
 */

import { hyperliquidYieldAdapter } from "../adapters/hyperliquid";
import { jupiterAdapter } from "../adapters/jupiter";
import { gmxAdapter } from "../adapters/gmx";
import type {
  AdapterDepthSnapshot,
  AdapterHealthResult,
  IExchangeAdapter,
  TriangleVenueId,
} from "../adapters/types";
import { readActiveSystemState } from "../core/state";
import type { IntentPhase } from "../core/intent-ledger";
import { checkSoilResistance, type SoilResistanceResult } from "./risk-control";

export interface YieldVenueSnapshot {
  venue: TriangleVenueId;
  depth: AdapterDepthSnapshot;
  apy: number;
  /** Annualized yield edge vs triangle median (bps) */
  edgeBps: number;
  health: AdapterHealthResult;
}

export interface YieldTriangleGateStatus {
  soilOk: boolean;
  routable: boolean;
  intent2pcReady: boolean;
  signingChannelOpen: boolean;
  dynamicMaxSlUsd: number;
  phase: IntentPhase | "IDLE";
  reasons: string[];
}

export interface YieldRecommendedRoute {
  venue: TriangleVenueId | null;
  apy: number;
  edgeBps: number;
}

export interface YieldRouterResult {
  symbol: string;
  soil: SoilResistanceResult;
  soilOk: boolean;
  venues: YieldVenueSnapshot[];
  compositeDepthUsd: number;
  bestApyVenue: TriangleVenueId | null;
  routable: boolean;
  reasons: string[];
}

export interface YieldTriangleResponse extends YieldRouterResult {
  gateStatus: YieldTriangleGateStatus;
  recommendedRoute: YieldRecommendedRoute;
  fetchedAt: string;
}

export const DEFAULT_TRIANGLE_ADAPTERS: readonly IExchangeAdapter[] = [
  hyperliquidYieldAdapter,
  jupiterAdapter,
  gmxAdapter,
];

async function loadVenueSnapshot(
  adapter: IExchangeAdapter,
  symbol: string,
  medianApy: number,
): Promise<YieldVenueSnapshot> {
  const [depth, apy, health] = await Promise.all([
    adapter.getDepth(symbol),
    adapter.getAPY(symbol),
    adapter.checkHealth(),
  ]);
  const edgeBps = Math.round((apy - medianApy) * 10_000);
  return { venue: adapter.id as TriangleVenueId, depth, apy, edgeBps, health };
}

function medianApy(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export function buildYieldTriangleGateStatus(
  result: YieldRouterResult,
): YieldTriangleGateStatus {
  const state = readActiveSystemState();
  const reasons = [...result.reasons];
  const intent2pcReady = result.soilOk && state.signingChannelOpen === true;

  if (!state.signingChannelOpen) {
    reasons.push("SIGNING_CHANNEL_CLOSED");
  }

  return {
    soilOk: result.soilOk,
    routable: result.routable && intent2pcReady,
    intent2pcReady,
    signingChannelOpen: state.signingChannelOpen === true,
    dynamicMaxSlUsd: state.dynamicMaxSL,
    phase: "IDLE",
    reasons,
  };
}

/** Query HL + Jupiter + GMX in parallel, gated by checkSoilResistance(). */
export async function queryStructuralTriangle(
  symbol: string,
  adapters: readonly IExchangeAdapter[] = DEFAULT_TRIANGLE_ADAPTERS,
): Promise<YieldRouterResult> {
  const apyProbes = await Promise.all(
    adapters.map(async (adapter) => {
      try {
        return await adapter.getAPY(symbol);
      } catch {
        return 0;
      }
    }),
  );
  const med = medianApy(apyProbes.filter((v) => v > 0));

  const venues = await Promise.all(
    adapters.map((adapter) => loadVenueSnapshot(adapter, symbol, med)),
  );

  const hl = venues.find((v) => v.venue === "hyperliquid");
  const jup = venues.find((v) => v.venue === "jupiter");
  const gmx = venues.find((v) => v.venue === "gmx");

  const hlSpot = hl?.depth.spotPrice ?? jup?.depth.spotPrice ?? 0;
  const hlPerp = hl?.depth.perpPrice ?? hlSpot;
  const dydxPerp = gmx?.depth.perpPrice ?? jup?.depth.perpPrice ?? hlPerp;
  const compositeDepthUsd =
    venues.reduce((sum, v) => sum + v.depth.depthUsd, 0) /
    Math.max(venues.length, 1);

  const soil = checkSoilResistance({
    symbol: symbol.toUpperCase(),
    hlSpot,
    hlPerp,
    dydxPerp,
    depthUsd: compositeDepthUsd,
  });

  const healthyVenues = venues.filter((v) => v.health.ok);
  const best = healthyVenues.sort((a, b) => b.apy - a.apy)[0] ?? null;

  const reasons = [...soil.reasons];
  for (const v of venues) {
    if (!v.health.ok) {
      reasons.push(`${v.venue}_UNHEALTHY:${v.health.reasons.join("|")}`);
    }
  }

  return {
    symbol: symbol.toUpperCase(),
    soil,
    soilOk: soil.ok,
    venues,
    compositeDepthUsd,
    bestApyVenue: best?.venue ?? null,
    routable: soil.ok && healthyVenues.length > 0,
    reasons,
  };
}

/** Full triangle response with 2PC gate status and recommended route */
export async function queryYieldTriangle(
  symbol: string,
  adapters: readonly IExchangeAdapter[] = DEFAULT_TRIANGLE_ADAPTERS,
): Promise<YieldTriangleResponse> {
  const triangle = await queryStructuralTriangle(symbol, adapters);
  const gateStatus = buildYieldTriangleGateStatus(triangle);
  const best = triangle.venues.find((v) => v.venue === triangle.bestApyVenue);

  return {
    ...triangle,
    gateStatus,
    recommendedRoute: {
      venue: triangle.bestApyVenue,
      apy: best?.apy ?? 0,
      edgeBps: best?.edgeBps ?? 0,
    },
    fetchedAt: new Date().toISOString(),
  };
}
