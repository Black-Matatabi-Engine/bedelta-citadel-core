/** USD.ai yield-bearing GPU RWA collateral — Arbitrum One guard constants. */
export const USDAI_ARBITRUM_CHAIN_ID = 42161 as const;
export const USDAI_ORACLE_MAX_AGE_MS = 7_200_000 as const;
export const USDAI_PEG_DRIFT_MAX_BPS = 30 as const;
export const USDAI_NAV_DEVIATION_MAX_BPS = 50 as const;
export const USDAI_MIN_LIQUIDITY_DEPTH_USD = 100_000 as const;
export const USD_AI_DEPEG_ORACLE_TRIP = "USD_AI_DEPEG_ORACLE_TRIP" as const;
export const USDAI_CLOCK_SKEW_MAX_MS = 30_000 as const;
export const CLOCK_SKEW_EXCEEDED = "CLOCK_SKEW_EXCEEDED" as const;

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

export interface UsdaiClockSsotResult<T extends UsdaiSoilInput> {
  input: T & { nowMs: number };
  skewMs: number;
  tripped: boolean;
  reasons: string[];
}

/** Production clock SSOT — reject caller skew >30s; default `Date.now()` when `nowMs` omitted. */
export function resolveUsdAiClockSsot<T extends UsdaiSoilInput>(
  input: T,
  emitLog = true,
): UsdaiClockSsotResult<T> {
  const wallMs = Date.now();
  const callerProvided = input.nowMs != null;
  const nowMs = input.nowMs ?? wallMs;
  const skewMs = callerProvided ? Math.abs(input.nowMs! - wallMs) : 0;
  const tripped = callerProvided && skewMs > USDAI_CLOCK_SKEW_MAX_MS;
  const reasons = tripped
    ? [`${CLOCK_SKEW_EXCEEDED}:skewMs=${skewMs}>${USDAI_CLOCK_SKEW_MAX_MS}`]
    : [];
  if (emitLog) {
    const source = callerProvided ? "CallerValidated" : "Date.now";
    const status = tripped ? "TRIPPED" : "PASS";
    console.info(`[CLOCK_SSOT_VERIFIED] source=${source} skewMs=${skewMs} status=${status}`);
  }
  return { input: { ...input, nowMs }, skewMs, tripped, reasons };
}
