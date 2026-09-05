/** Numeric protocol invariant limits — shared by engine + pending window. */
export const GMX_IMBALANCE_MAX = 0.35;
export const GMX_COLLATERAL_MIN = 1.05;
export const PENDLE_YIELD_SHOCK_MAX_BPS = 150;
export const UNISWAP_SLIPPAGE_MAX_BPS = 50;
export const AAVE_HF_MIN = 1.15;
export const MORPHO_ORACLE_MAX_AGE_MS = 3_600_000;
export const MORPHO_PRICE_DEVIATION_MAX_BPS = 30;
export const HL_SPREAD_MAX_BPS = 20;
export const HL_RATE_LIMIT_RPM = 120;
export const STABILIZER_DEPEG_MAX_BPS = 50;
export const VARIATIONAL_QUOTE_MAX_AGE_MS = 500;
export const VARIATIONAL_PRICE_DEVIATION_MAX_BPS = 30;
export const VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION = 0.15;
