/**
 * Solana DEX adapter — shared types and error classes.
 */

import type { SoilResistanceResult } from "../../core/risk";
import {
  R20_HARDLOCK,
  RAYDIUM_TICK_COLLAPSE_MIN_USD,
  R15_ORACLE_DEVIATION_MAX_BPS,
  SOLANA_BASE_PRIORITY_FEE_LAMPORTS,
  SOLANA_SLOT_LATENCY_MAX_MS,
  TOUCHWOOD_JUPITER_ORACLE_MAX_BPS,
} from "../../config/constants";

export {
  R20_HARDLOCK,
  RAYDIUM_TICK_COLLAPSE_MIN_USD,
  R15_ORACLE_DEVIATION_MAX_BPS,
  SOLANA_BASE_PRIORITY_FEE_LAMPORTS,
  SOLANA_SLOT_LATENCY_MAX_MS,
  TOUCHWOOD_JUPITER_ORACLE_MAX_BPS,
};

/** Supported Solana execution models */
export type SolanaDexModel =
  | "JUPITER_AGGREGATOR"
  | "PHOENIX_CLOB"
  | "RAYDIUM_CLMM";

/** All three pipes in the 1:3 depth matrix */
export const SOLANA_DEPTH_PIPES: readonly SolanaDexModel[] = [
  "PHOENIX_CLOB",
  "RAYDIUM_CLMM",
  "JUPITER_AGGREGATOR",
] as const;

export interface JupiterRouteQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  slippageBps: number;
  priceImpactPct: string;
  contextSlot?: number;
  routePlan?: unknown[];
}

export interface PhoenixOrderbookLevel {
  price: number;
  size: number;
}

export interface PhoenixOrderbookSnapshot {
  symbol: string;
  marketAddress: string;
  slot: number;
  bids: PhoenixOrderbookLevel[];
  asks: PhoenixOrderbookLevel[];
  lastTradePx?: number;
}

export interface RaydiumClmmSnapshot {
  symbol: string;
  poolAddress: string;
  slot: number;
  tickCurrent: number;
  tickLiquidityUsd: number;
  depthUsd: number;
  sqrtPriceX64?: string;
}

export interface SolanaDexPipeInput {
  phoenix?: {
    snapshot: PhoenixOrderbookSnapshot;
    slotLatencyMs: number;
    depthUsd?: number;
  };
  raydium?: {
    snapshot: RaydiumClmmSnapshot;
    depthUsd?: number;
  };
  jupiter?: {
    quote: JupiterRouteQuote;
    pythOraclePx: number;
    spotPx: number;
    routingDepthUsd?: number;
  };
  symbol: string;
  spotPx: number;
  priorityFeeLamports?: number;
}

export interface TouchwoodPipeStatus {
  dex: SolanaDexModel;
  active: boolean;
  severed: boolean;
  depthUsd: number;
  reason?: string;
}

export interface AggregatedSolanaDepth {
  totalDepthUsd: number;
  compositeDepthUsd: number;
  activePipes: SolanaDexModel[];
  severedPipes: SolanaDexModel[];
  pipeStatuses: TouchwoodPipeStatus[];
  r20Hardlock: boolean;
  r20Reason?: string;
}

export interface SolanaSoilProbe {
  symbol: string;
  venue: SolanaDexModel;
  slotLatencyMs: number;
  priorityFeeLamports: number;
  pythOraclePx?: number;
  spotPx?: number;
  hlSpot?: number;
  hlPerp?: number;
  dydxPerp?: number;
  depthUsd?: number;
}

export interface SolanaSoilEvaluation {
  ok: boolean;
  tripped: boolean;
  reasons: string[];
  slotLatencyMs: number;
  slotLatencyPass: boolean;
  priorityFeeLamports: number;
  adjustedPriorityFeeLamports: number;
  oracleDeviationBps: number | null;
  r15OraclePass: boolean;
  soil: SoilResistanceResult;
  aggregatedDepth?: AggregatedSolanaDepth;
  touchwood?: TouchwoodPipeStatus[];
  r20Hardlock?: boolean;
}

export interface SolanaDexIntent {
  venue: SolanaDexModel;
  symbol: string;
  amountUsd: number;
  soil: SolanaSoilProbe;
  matrix?: SolanaDexPipeInput;
  jupiter?: JupiterRouteQuote;
  phoenix?: PhoenixOrderbookSnapshot;
  raydium?: RaydiumClmmSnapshot;
}

export interface SolanaDexExecutionResult {
  allowed: boolean;
  venue: SolanaDexModel;
  soil: SolanaSoilEvaluation;
  adjustedPriorityFeeLamports: number;
  dryRun: boolean;
  activePipes: SolanaDexModel[];
}

export class SolanaDexBlockedError extends Error {
  readonly code = "SOLANA_DEX_BLOCKED" as const;
  readonly httpStatus = 422 as const;
  readonly reasons: string[];

  constructor(message: string, reasons: string[]) {
    super(message);
    this.name = "SolanaDexBlockedError";
    this.reasons = reasons;
  }
}

export class SolanaR20HardlockError extends Error {
  readonly code = typeof R20_HARDLOCK;
  readonly httpStatus = 403 as const;
  readonly reasons: string[];

  constructor(message: string, reasons: string[]) {
    super(message);
    this.name = "SolanaR20HardlockError";
    this.reasons = reasons;
  }
}
