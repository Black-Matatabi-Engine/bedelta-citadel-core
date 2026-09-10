/** Uniswap V3 concentrated-liquidity guard constants — Arbitrum One. */
import { ARBITRUM_ONE_CHAIN_ID } from "../../sdk/constants";

export const UNISWAP_V3_ARBITRUM_CHAIN_ID = ARBITRUM_ONE_CHAIN_ID;
export const UNISWAP_V3_MIN_ACTIVE_LIQUIDITY_USD = 50_000;
export const UNISWAP_V3_MAX_UTILIZATION = 0.25;
export const UNISWAP_V3_MAX_DYNAMIC_FEE_BPS = 100;
export const UNISWAP_V3_MAX_SLIPPAGE_BPS = 50;
export const UNISWAP_V3_UTILIZATION_SLIPPAGE_FACTOR_BPS = 200;
export const UNISWAP_V3_MIN_TICK_DEPTH_RATIO = 4;
export const UNISWAP_V3_MAX_DIRECTIONAL_FEE_BPS = 120;
export const UNISWAP_V3_DEFAULT_TICK_SPACING = 60;
