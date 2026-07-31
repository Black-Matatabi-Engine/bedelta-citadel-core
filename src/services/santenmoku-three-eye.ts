/**
 * Santenmoku Three-Eye adapter audit — HL + Jupiter + Polymarket readiness probes.
 * Hub integrates live counter-attack matrix + session-key passive maker execution.
 */

import { evaluateJupiterSoilResistance } from "./jupiter-adapter";
import {
  evaluatePolymarketFriction,
  type PolymarketQuoteResponse,
} from "./polymarket-adapter";
import {
  computeLiveBookMetrics,
  evaluateSoilResistance as evaluateHyperliquidMarginHealth,
  peekCachedLiveL2Book,
  fetchLiveL2Book,
} from "./hyperliquid-adapter";
import {
  evalCounterAttackOpportunity,
  type CounterAttackInput,
  type CounterAttackResult,
} from "./counter-attack-matrix";
import {
  signAndExecuteOrder,
  type SessionKeyOrderPayload,
  type SigningResult,
} from "./session-key-adapter";
import { isR20Locked, type CoreSystemState } from "../core/state";
import { checkSoilResistance, type SoilResistanceInput } from "../core/risk";

export const TELEMETRY_VENUES = [
  "HYPERLIQUID",
  "JUPITER",
  "POLYMARKET",
] as const;

export const DEFAULT_COUNTER_ATTACK_COIN = "BTC" as const;

export type TelemetryVenue = (typeof TELEMETRY_VENUES)[number];

export type SantenmokuThreeEyeStatus =
  | "THREE_EYES_ACTIVE"
  | "THREE_EYES_DEGRADED"
  | "THREE_EYES_LOCKED";

export type CounterAttackStatus =
  | "ARMED_AND_READY"
  | "STANDBY"
  | "LOCKED"
  | "REJECT";

export interface VenueAdapterAudit {
  venue: TelemetryVenue;
  ready: boolean;
  soilOk: boolean;
}

export interface ThreeEyeAuditResult {
  activeVenues: readonly TelemetryVenue[];
  santenmokuStatus: SantenmokuThreeEyeStatus;
  adapters: readonly VenueAdapterAudit[];
}

export interface SantenmokuHubResult extends ThreeEyeAuditResult {
  counterAttack: CounterAttackResult | null;
  counterAttackStatus: CounterAttackStatus;
  execution: SigningResult | null;
}

export interface EvaluateSantenmokuHubOptions {
  coin?: string;
  assetIndex?: number;
  execute?: boolean;
  dryRun?: boolean;
  fetchFn?: typeof fetch;
  orderNotionalUsd?: number;
}

const HL_SOIL_PROBE: SoilResistanceInput = {
  symbol: "HL_PROBE",
  hlSpot: 50_000,
  hlPerp: 50_010,
  dydxPerp: 50_005,
  depthUsd: 500_000,
};

const JUPITER_SOIL_PROBE = {
  inputMint: "So11111111111111111111111111111111111111112",
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  inAmount: "100000000",
  outAmount: "16198753",
  slippageBps: 5,
  priceImpactPct: "0.05",
};

const POLYMARKET_FRICTION_PROBE: PolymarketQuoteResponse = {
  conditionId: "0xprobe",
  tokenId: "probe-token",
  bestBid: 0.05495,
  bestAsk: 0.05505,
  midPrice: 0.055,
  impliedProbability: 0.05505,
  spread: 0.0001,
  spreadPct: 0.0001 / 0.055,
  bidDepthUsd: 50_000,
  askDepthUsd: 45_000,
  totalDepthUsd: 95_000,
  binaryHedge: {
    yesProbability: 0.05505,
    noProbability: 0.94495,
    hedgeRatio: 0.05505 / 0.94495,
    spread: 0.0001,
    spreadPct: 0.0001 / 0.055,
    totalDepthUsd: 95_000,
  },
  timestamp: new Date().toISOString(),
};

function probeHyperliquidAdapter(): VenueAdapterAudit {
  const soil = checkSoilResistance(HL_SOIL_PROBE);
  const marginTier = evaluateHyperliquidMarginHealth(25);
  const moduleReady = typeof evaluateHyperliquidMarginHealth === "function";
  const soilOk = soil.ok && marginTier === "HEALTHY";

  return {
    venue: "HYPERLIQUID",
    ready: moduleReady && soilOk,
    soilOk,
  };
}

function probeJupiterAdapter(): VenueAdapterAudit {
  let soilOk = false;
  try {
    evaluateJupiterSoilResistance(JUPITER_SOIL_PROBE, undefined, 100);
    soilOk = true;
  } catch {
    soilOk = false;
  }

  return {
    venue: "JUPITER",
    ready: typeof evaluateJupiterSoilResistance === "function" && soilOk,
    soilOk,
  };
}

function probePolymarketAdapter(): VenueAdapterAudit {
  let soilOk = false;
  try {
    evaluatePolymarketFriction(POLYMARKET_FRICTION_PROBE);
    soilOk = true;
  } catch {
    soilOk = false;
  }

  return {
    venue: "POLYMARKET",
    ready: typeof evaluatePolymarketFriction === "function" && soilOk,
    soilOk,
  };
}

/** Dynamically audit all three venue adapters via checkSoilResistance friction probes. */
export function auditThreeEyeAdapters(
  state: CoreSystemState,
): ThreeEyeAuditResult {
  if (isR20Locked(state) || state.hardlock || !state.signingChannelOpen) {
    return {
      activeVenues: [],
      santenmokuStatus: "THREE_EYES_LOCKED",
      adapters: TELEMETRY_VENUES.map((venue) => ({
        venue,
        ready: false,
        soilOk: false,
      })),
    };
  }

  const adapters = [
    probeHyperliquidAdapter(),
    probeJupiterAdapter(),
    probePolymarketAdapter(),
  ] as const;

  const allReady = adapters.every((adapter) => adapter.ready);

  return {
    activeVenues: allReady ? TELEMETRY_VENUES : [],
    santenmokuStatus: allReady ? "THREE_EYES_ACTIVE" : "THREE_EYES_DEGRADED",
    adapters,
  };
}

export function buildCounterAttackInputFromMetrics(
  symbol: string,
  metrics: NonNullable<ReturnType<typeof computeLiveBookMetrics>>,
  state: CoreSystemState,
  orderNotionalUsd?: number,
): CounterAttackInput {
  return {
    symbol,
    markPx: metrics.midPx,
    soilAnchorPx: metrics.bestBid,
    bestBid: metrics.bestBid,
    bestAsk: metrics.bestAsk,
    midPx: metrics.midPx,
    bidDepthUsd: metrics.bidDepthUsd,
    askDepthUsd: metrics.askDepthUsd,
    depthUsd: metrics.depthUsd,
    spreadBps: metrics.spreadBps,
    priceImpactBps: metrics.priceImpactBps,
    accountBalanceUsd: state.accountBalanceUsd,
    orderNotionalUsd,
  };
}

/** Sync counter-attack eval from cached live L2 book (telemetry path). */
export function evaluateCounterAttackSync(
  state: CoreSystemState,
  coin: string = DEFAULT_COUNTER_ATTACK_COIN,
  orderNotionalUsd?: number,
): CounterAttackResult | null {
  const cached = peekCachedLiveL2Book(coin);
  if (!cached) return null;

  const metrics = computeLiveBookMetrics(cached.book);
  if (!metrics) return null;

  return evalCounterAttackOpportunity(
    buildCounterAttackInputFromMetrics(
      cached.coin,
      metrics,
      state,
      orderNotionalUsd,
    ),
  );
}

export function resolveCounterAttackStatus(
  state: CoreSystemState,
  audit: ThreeEyeAuditResult,
  counter: CounterAttackResult | null,
): CounterAttackStatus {
  if (
    isR20Locked(state) ||
    state.hardlock ||
    audit.santenmokuStatus === "THREE_EYES_LOCKED"
  ) {
    return "LOCKED";
  }

  if (!counter) return "STANDBY";
  if (counter.armed) return "ARMED_AND_READY";
  if (counter.panicDetected && counter.atSoilAnchor) return "REJECT";
  return "STANDBY";
}

function buildPassiveMakerOrder(
  counter: CounterAttackResult,
  assetIndex: number,
): SessionKeyOrderPayload | null {
  if (!counter.limitPx || !counter.sz) return null;

  return {
    asset: assetIndex,
    isBuy: true,
    limitPx: counter.limitPx,
    sz: counter.sz,
    reduceOnly: false,
    orderType: { limit: { tif: "Alo" } },
  };
}

/**
 * Santenmoku central hub — live feed → counter-attack → session-key passive maker.
 */
export async function evaluateSantenmokuHub(
  state: CoreSystemState,
  options: EvaluateSantenmokuHubOptions = {},
): Promise<SantenmokuHubResult> {
  const audit = auditThreeEyeAdapters(state);
  const coin = options.coin ?? DEFAULT_COUNTER_ATTACK_COIN;

  if (audit.santenmokuStatus === "THREE_EYES_LOCKED") {
    return {
      ...audit,
      counterAttack: null,
      counterAttackStatus: "LOCKED",
      execution: null,
    };
  }

  await fetchLiveL2Book(coin, {
    fetchFn: options.fetchFn,
    maxRetries: 1,
  });

  const counter = evaluateCounterAttackSync(
    state,
    coin,
    options.orderNotionalUsd,
  );

  const counterAttackStatus = resolveCounterAttackStatus(state, audit, counter);

  let execution: SigningResult | null = null;
  if (
    counter?.armed &&
    options.execute !== false &&
    counterAttackStatus === "ARMED_AND_READY"
  ) {
    const order = buildPassiveMakerOrder(
      counter,
      options.assetIndex ?? 0,
    );
    if (order) {
      execution = await signAndExecuteOrder(order, {
        systemState: state,
        dryRun: options.dryRun,
      });
    }
  }

  return {
    ...audit,
    counterAttack: counter,
    counterAttackStatus,
    execution,
  };
}

/** Telemetry-facing counter-attack posture (sync, cache-backed). */
export function readCounterAttackTelemetryStatus(
  state: CoreSystemState,
): CounterAttackStatus {
  const audit = auditThreeEyeAdapters(state);
  const counter = evaluateCounterAttackSync(state);
  return resolveCounterAttackStatus(state, audit, counter);
}
