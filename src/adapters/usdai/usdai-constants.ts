/** USD.ai yield-bearing GPU RWA collateral — thin re-export shell (SSOT: core/risk-engine-usdai). */
export {
  USDAI_ARBITRUM_CHAIN_ID,
  USDAI_ORACLE_MAX_AGE_MS,
  USDAI_PEG_DRIFT_MAX_BPS,
  USDAI_NAV_DEVIATION_MAX_BPS,
  USDAI_MIN_LIQUIDITY_DEPTH_USD,
  USD_AI_DEPEG_ORACLE_TRIP,
  USDAI_CLOCK_SKEW_MAX_MS,
  CLOCK_SKEW_EXCEEDED,
  resolveUsdAiClockSsot,
  resolveUsdAiClockSsotPure,
  type UsdaiSoilInput,
  type UsdaiClockSsotResult,
} from "../../core/risk-engine-usdai";
