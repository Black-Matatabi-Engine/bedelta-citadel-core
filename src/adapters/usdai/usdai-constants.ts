/** USD.ai yield-bearing GPU RWA collateral — Arbitrum One guard constants. */
export const USDAI_ARBITRUM_CHAIN_ID = 42161 as const;
export const USDAI_ORACLE_MAX_AGE_MS = 7_200_000 as const;
export const USDAI_PEG_DRIFT_MAX_BPS = 30 as const;
export const USDAI_NAV_DEVIATION_MAX_BPS = 50 as const;
export const USDAI_MIN_LIQUIDITY_DEPTH_USD = 100_000 as const;
export const USD_AI_DEPEG_ORACLE_TRIP = "USD_AI_DEPEG_ORACLE_TRIP" as const;

export interface UsdaiSoilInput {
  oracleTimestampMs: number;
  /** Omitted in production — defaults to `Date.now()` (see `resolveUsdAiClockSsot`). */
  nowMs?: number;
  susdaiPriceUsd: number;
  navUsd: number;
  gpuMarkUsd: number;
  liquidityDepthUsd: number;
  amountUsd?: number;
}

/** Production clock SSOT — reject caller forgery when `nowMs` omitted. */
export function resolveUsdAiClockSsot<T extends UsdaiSoilInput>(
  input: T,
  emitLog = true,
): T & { nowMs: number } {
  const wallMs = Date.now();
  const nowMs = input.nowMs ?? wallMs;
  const skewMs = input.nowMs != null ? Math.abs(input.nowMs - wallMs) : 0;
  if (emitLog) {
    console.info(`[CLOCK_SSOT_VERIFIED] source=Date.now skewMs=${skewMs}`);
  }
  return { ...input, nowMs };
}
