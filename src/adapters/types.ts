/** Initial Structural Triangle venue ids — HL · Jupiter · GMX */
export type TriangleVenueId = "hyperliquid" | "jupiter" | "gmx";

/** Dualism hedging venue — Polymarket event-driven tail signals */
export type HedgeVenueId = "polymarket";

/** Solana Multi-DEX Trinity — Raydium CLMM · Orca Whirlpools */
export type SolanaDexVenueId = "raydium" | "orca";

/** Arbitrum Multi-DEX Trinity — Uniswap v3 · Camelot */
export type ArbitrumDexVenueId = "uniswap-v3" | "camelot";

export type AdapterVenueId =
  | TriangleVenueId
  | HedgeVenueId
  | SolanaDexVenueId
  | ArbitrumDexVenueId;

export interface AdapterDepthSnapshot {
  venue: AdapterVenueId;
  symbol: string;
  depthUsd: number;
  spotPrice: number;
  perpPrice: number;
  fetchedAt: string;
}

export interface AdapterHealthResult {
  ok: boolean;
  latencyMs: number;
  reasons: string[];
}

/** Lightweight yield / liquidity adapter surface (Workers-safe fetch only) */
export interface IExchangeAdapter {
  readonly id: AdapterVenueId;
  getDepth(symbol: string): Promise<AdapterDepthSnapshot>;
  getAPY(symbol?: string): Promise<number>;
  checkHealth(): Promise<AdapterHealthResult>;
}

export interface AdapterFetchOptions {
  fetchFn?: typeof fetch;
}
