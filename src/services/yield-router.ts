/**
 * Yield Triangle Router — HL · Jupiter · GMX read-path with multi-chain ingress stacking.
 */

import { hyperliquidYieldAdapter, HyperliquidYieldAdapter } from "../adapters/hyperliquid";
import { jupiterAdapter } from "../adapters/jupiter";
import { gmxAdapter } from "../adapters/gmx";
import {
  fetchAllArbitrumStableYields,
  pickBestArbitrumStableIngress,
} from "../adapters/arbitrum/arbitrum-yield-ingress";
import {
  fetchAllSolanaStableYields,
  pickBestStableIngress,
} from "../adapters/solana/solana-yield-ingress";
import type {
  AdapterDepthSnapshot,
  AdapterHealthResult,
  IExchangeAdapter,
  TriangleVenueId,
} from "../adapters/types";
import { readActiveSystemState } from "../core/state";
import type { IntentPhase } from "../core/intent-ledger";
import { calculateYieldFees, buildNetApyBand, type NetApyBand } from "../core/fee-calculator";
import {
  MAX_SLIPPAGE,
  VINE_SOIL_MAX_SLIPPAGE,
  checkSoilResistance,
  type SoilResistanceResult,
} from "./risk-control";

export type GuardLight = "green" | "amber" | "red";

export interface AdaptiveGuardLights {
  hyperliquid: GuardLight;
  jupiter: GuardLight;
  polymarket: GuardLight;
}

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

export type TargetVenue = "HYPERLIQUID";
export type IngressChain = "SOLANA" | "ARBITRUM";

export interface YieldStackSnapshot {
  ingressChain: IngressChain;
  stableSymbol: string;
  chainBaseApy: number;
  hlFundingApy: number;
  hlLendApy: number;
  /** Total APY = Chain Base Yield + HL Funding Rate */
  totalStackedApy: number;
  stableDepthUsd: number;
  yieldSource: string;
}

export interface QueryYieldTriangleOptions {
  ingressChain?: IngressChain;
  adapters?: readonly IExchangeAdapter[];
  hlAdapter?: HyperliquidYieldAdapter;
}

export function parseIngressChain(raw: string | null | undefined): IngressChain {
  const value = (raw ?? "SOLANA").trim().toUpperCase();
  return value === "ARBITRUM" ? "ARBITRUM" : "SOLANA";
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
  guardLights: AdaptiveGuardLights;
  targetVenue: TargetVenue;
  ingressChain: IngressChain;
  yieldStack: YieldStackSnapshot;
  /** Gross stacked APY before protocol performance fee */
  grossApy: number;
  /** Net APY after 15% performance fee */
  netApy: number;
  /** Protocol treasury take (15% of gross yield) */
  protocolTreasuryFee: number;
  /** Conservative net APY band (percent) — replaces single-point marketing claims */
  netApyBand: NetApyBand;
  fetchedAt: string;
}

/** Total APY = Chain Base Yield + HL Funding Rate */
export function computeStackedTotalApy(
  chainBaseApy: number,
  hlFundingApy: number,
): number {
  return chainBaseApy + hlFundingApy;
}

export async function resolveYieldStack(
  symbol: string,
  ingressChain: IngressChain = "SOLANA",
  hlAdapter: HyperliquidYieldAdapter = hyperliquidYieldAdapter,
): Promise<YieldStackSnapshot> {
  const [hlFundingApy, hlLendApy] = await Promise.all([
    hlAdapter.getFundingApy(symbol),
    hlAdapter.getVaultApy(symbol),
  ]);

  if (ingressChain === "ARBITRUM") {
    const stables = await fetchAllArbitrumStableYields();
    const best = pickBestArbitrumStableIngress(stables) ?? stables[0]!;
    const chainBaseApy = best.baseApy;
    return {
      ingressChain,
      stableSymbol: best.symbol,
      chainBaseApy,
      hlFundingApy,
      hlLendApy,
      totalStackedApy: computeStackedTotalApy(chainBaseApy, hlFundingApy),
      stableDepthUsd: best.depthUsd,
      yieldSource: best.source,
    };
  }

  const stables = await fetchAllSolanaStableYields();
  const best = pickBestStableIngress(stables) ?? stables[0]!;
  const chainBaseApy = best.baseApy;
  return {
    ingressChain: "SOLANA",
    stableSymbol: best.symbol,
    chainBaseApy,
    hlFundingApy,
    hlLendApy,
    totalStackedApy: computeStackedTotalApy(chainBaseApy, hlFundingApy),
    stableDepthUsd: best.depthUsd,
    yieldSource: best.source,
  };
}

function slippageGuardLight(ratio: number, warn: number, trip: number): GuardLight {
  if (ratio >= trip) return "red";
  if (ratio >= warn) return "amber";
  return "green";
}

/** Jupiter ingress + Polymarket orderbook guard lights for HUD */
export function buildAdaptiveGuardLights(result: YieldRouterResult): AdaptiveGuardLights {
  const jup = result.venues.find((v) => v.venue === "jupiter");
  const hl = result.venues.find((v) => v.venue === "hyperliquid");
  const crossSlip = result.soil.crossVenueSlippage;
  const spotPerp = result.soil.spotPerpSlippage;

  let jupiter: GuardLight = "green";
  if (!jup?.health.ok) {
    jupiter = "red";
  } else if (crossSlip >= MAX_SLIPPAGE || result.soil.tripped) {
    jupiter = "red";
  } else if (crossSlip >= VINE_SOIL_MAX_SLIPPAGE) {
    jupiter = "amber";
  }

  let polymarket = slippageGuardLight(spotPerp, VINE_SOIL_MAX_SLIPPAGE, MAX_SLIPPAGE);
  if (!result.soil.ok) polymarket = "red";

  let hyperliquid: GuardLight = "green";
  if (!hl?.health.ok) {
    hyperliquid = "red";
  } else if (!result.soilOk) {
    hyperliquid = "amber";
  }

  return { hyperliquid, jupiter, polymarket };
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
  options: QueryYieldTriangleOptions = {},
): Promise<YieldTriangleResponse> {
  const ingressChain = options.ingressChain ?? "SOLANA";
  const adapters = options.adapters ?? DEFAULT_TRIANGLE_ADAPTERS;
  const hlAdapter = options.hlAdapter ?? hyperliquidYieldAdapter;

  const triangle = await queryStructuralTriangle(symbol, adapters);
  const gateStatus = buildYieldTriangleGateStatus(triangle);
  const yieldStack = await resolveYieldStack(symbol, ingressChain, hlAdapter);
  const best = triangle.venues.find((v) => v.venue === triangle.bestApyVenue);
  const fees = calculateYieldFees(yieldStack.totalStackedApy);
  const netApyBand = buildNetApyBand(fees.netApy);

  return {
    ...triangle,
    gateStatus,
    guardLights: buildAdaptiveGuardLights(triangle),
    targetVenue: "HYPERLIQUID",
    ingressChain,
    yieldStack,
    grossApy: fees.grossApy,
    netApy: fees.netApy,
    protocolTreasuryFee: fees.protocolTreasuryFee,
    netApyBand,
    recommendedRoute: {
      venue: "hyperliquid",
      apy: fees.netApy,
      edgeBps: Math.round((fees.netApy - (best?.apy ?? 0)) * 10_000),
    },
    fetchedAt: new Date().toISOString(),
  };
}
