/** Jones DAO vault guard constants — Arbitrum One. */
import { ARBITRUM_ONE_CHAIN_ID } from "../../sdk/constants";

export const JONES_ARBITRUM_CHAIN_ID = ARBITRUM_ONE_CHAIN_ID;
export const JONES_MAX_NAV_DEVIATION_BPS = 30;
export const JONES_MAX_SHARE_SLIPPAGE_BPS = JONES_MAX_NAV_DEVIATION_BPS;
export const JONES_FLASH_SANDWICH_DEVIATION_BPS = JONES_MAX_NAV_DEVIATION_BPS;
export const JONES_MIN_VAULT_TVL_USD = 100_000;
