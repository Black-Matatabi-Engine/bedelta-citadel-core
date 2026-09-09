/** 7-Protocol Execution Matrix — dynamic venue rotation & intent mapping for agent demos. */
import type { SoilResistanceInput } from "../../src/services/risk-control";
import { HEALTHY_SOIL, TOXIC_SOIL, BOLD, CYAN, GRAY, R } from "../adapters/citadel-ansi-hud";
import { isDemoTripArgv } from "./demo-harness";

export type AgentVenueKey =
  | "gmx"
  | "pendle"
  | "uniswap"
  | "aave"
  | "morpho"
  | "usdai"
  | "hyperliquid"
  | "variational";

export interface AgentVenueContext {
  key: AgentVenueKey;
  label: string;
  chainLabel: string;
  hudVenue: string;
  healthyIntent: string;
  tripIntent: string;
  invariantCheck: string;
  healthySoil: SoilResistanceInput;
  toxicSoil: SoilResistanceInput;
}

const VENUE_ORDER: AgentVenueKey[] = [
  "gmx",
  "pendle",
  "uniswap",
  "aave",
  "morpho",
  "usdai",
  "hyperliquid",
  "variational",
];

const VENUE_ALIASES: Record<string, AgentVenueKey> = {
  gmx: "gmx",
  pendle: "pendle",
  uniswap: "uniswap",
  uni: "uniswap",
  aave: "aave",
  morpho: "morpho",
  usdai: "usdai",
  usd: "usdai",
  hyperliquid: "hyperliquid",
  hl: "hyperliquid",
  variational: "variational",
  var: "variational",
};

const VENUE_CATALOG: Record<AgentVenueKey, Omit<AgentVenueContext, "healthyIntent" | "tripIntent">> = {
  gmx: {
    key: "gmx",
    label: "GMX v2",
    chainLabel: "Arbitrum One 42161",
    hudVenue: "GMX v2 ETH/USDC GM",
    invariantCheck: "OI skew / reserve cap · cross-venue slippage fuse",
    healthySoil: HEALTHY_SOIL,
    toxicSoil: TOXIC_SOIL,
  },
  pendle: {
    key: "pendle",
    label: "Pendle",
    chainLabel: "Arbitrum One 42161",
    hudVenue: "Pendle PT/YT · PT-eETH market",
    invariantCheck: "|Yield_current − Yield_oracle| ≤ 150 bps",
    healthySoil: HEALTHY_SOIL,
    toxicSoil: TOXIC_SOIL,
  },
  uniswap: {
    key: "uniswap",
    label: "Uniswap V3",
    chainLabel: "Arbitrum One 42161",
    hudVenue: "Uniswap V3 ETH/USDC 0.05% pool",
    invariantCheck: "Tick depth · dynamic fee / slippage ≤ 50 bps",
    healthySoil: HEALTHY_SOIL,
    toxicSoil: TOXIC_SOIL,
  },
  aave: {
    key: "aave",
    label: "Aave V3",
    chainLabel: "Arbitrum One 42161",
    hudVenue: "Aave V3 ETH supply / borrow",
    invariantCheck: "Health Factor HF ≥ 1.15 · liquidation guard",
    healthySoil: HEALTHY_SOIL,
    toxicSoil: TOXIC_SOIL,
  },
  morpho: {
    key: "morpho",
    label: "Morpho Blue",
    chainLabel: "Arbitrum One 42161",
    hudVenue: "Morpho Blue vault shares",
    invariantCheck: "NAV deviation ≤ 30 bps · sandwich guard",
    healthySoil: HEALTHY_SOIL,
    toxicSoil: TOXIC_SOIL,
  },
  usdai: {
    key: "usdai",
    label: "USD.ai",
    chainLabel: "Arbitrum One 42161",
    hudVenue: "USD.ai sUSDai collateral lane",
    invariantCheck: "Peg drift ≤ 30 bps · oracle age ≤ 2h · depth ≥ $100k",
    healthySoil: HEALTHY_SOIL,
    toxicSoil: TOXIC_SOIL,
  },
  hyperliquid: {
    key: "hyperliquid",
    label: "Hyperliquid",
    chainLabel: "Hyperliquid L1 Perps",
    hudVenue: "Hyperliquid session-key orderbook",
    invariantCheck: "MaxSizePerOrder · spread ≤ 20 bps · 120/min rate cap",
    healthySoil: HEALTHY_SOIL,
    toxicSoil: TOXIC_SOIL,
  },
  variational: {
    key: "variational",
    label: "Variational Omni RFQ",
    chainLabel: "Arbitrum One 42161",
    hudVenue: "Variational Omni RFQ hedge leg",
    invariantCheck: "Quote stale ≤ 500ms · drift ≤ 30 bps · OLP ≤ 15%",
    healthySoil: HEALTHY_SOIL,
    toxicSoil: TOXIC_SOIL,
  },
};

const HEALTHY_INTENTS: Record<AgentVenueKey, string> = {
  gmx: "DELTA_NEUTRAL_GM_DEPOSIT",
  pendle: "PENDLE_PT_YT_SWAP",
  uniswap: "UNISWAP_V3_SWAP",
  aave: "AAVE_V3_SUPPLY",
  morpho: "MORPHO_VAULT_DEPOSIT",
  usdai: "USDAI_COLLATERAL_MINT",
  hyperliquid: "HL_SESSION_PERP_ORDER",
  variational: "VARIATIONAL_RFQ_QUOTE",
};

const TRIP_INTENT = "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN";

export function parseDemoVenueArgv(argv: readonly string[] = process.argv): AgentVenueKey | undefined {
  for (const arg of argv) {
    if (arg.startsWith("--venue=")) {
      const raw = arg.slice("--venue=".length).trim().toLowerCase();
      const key = VENUE_ALIASES[raw];
      if (!key) throw new Error(`Unknown --venue=${raw} (try: ${VENUE_ORDER.join(", ")})`);
      return key;
    }
    if (arg === "--venue" || arg.startsWith("--venue:")) {
      throw new Error("Use --venue=<protocol> (e.g. --venue=pendle)");
    }
  }
  return undefined;
}

export function resolveAgentVenue(nowMs: number, argv: readonly string[] = process.argv): AgentVenueContext {
  const locked = parseDemoVenueArgv(argv);
  const key = locked ?? VENUE_ORDER[Math.abs(nowMs) % VENUE_ORDER.length];
  const base = VENUE_CATALOG[key];
  return {
    ...base,
    healthyIntent: HEALTHY_INTENTS[key],
    tripIntent: TRIP_INTENT,
  };
}

export function buildAgentIntent(venue: AgentVenueContext, trip: boolean): string {
  return trip ? venue.tripIntent : venue.healthyIntent;
}

export function printAgentVenueHud(venue: AgentVenueContext, locked: boolean): void {
  const mode = locked ? "locked" : "rotated";
  console.log(
    `${BOLD}VENUE:${R} ${CYAN}${venue.label}${R} · ${venue.chainLabel} · ${GRAY}${mode}${R}`,
  );
  console.log(`${BOLD}INVARIANT:${R} ${venue.invariantCheck}\n`);
}

export function agentDemoTrip(argv: readonly string[] = process.argv): boolean {
  return isDemoTripArgv(argv);
}
