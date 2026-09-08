/** GMX v2 micro-fill sizing / oracle URL constants. */
import { getAddress } from "viem";
import { GMX_V2_EXCHANGE_ROUTER_ARBITRUM } from "../../config/gmx-revenue";
import { GMX_ETH_USD_MARKET_TOKEN } from "../../config/gmx-markets";
import { GMX_USDC_ARBITRUM, USDC_DECIMALS } from "./gmx-v2-order-payload-constants";
import { GMX_FLOAT_PRECISION } from "./gmx-v2-order-payload-guards";
import { GMX_ORDER_VAULT_ARBITRUM } from "./gmx-market-increase-multicall";

export { GMX_ORDER_VAULT_ARBITRUM, GMX_USDC_ARBITRUM };
export const GMX_COLLATERAL_SPENDER_ARBITRUM = getAddress(GMX_V2_EXCHANGE_ROUTER_ARBITRUM);
export const MICRO_FILL_MIN_POSITION_USD = 10;
export const MICRO_FILL_COLLATERAL_USD = 2;
export const MICRO_FILL_LEVERAGE_X = 5;
export const MICRO_FILL_SIZE_DELTA_USD_30 = 10n * 10n ** 30n;
export const MICRO_FILL_COLLATERAL_USDC = BigInt(MICRO_FILL_COLLATERAL_USD) * 10n ** BigInt(USDC_DECIMALS);
export const GMX_ORACLE_TICKERS_URL = "https://arbitrum-api.gmxinfra.io/prices/tickers";
export const GMX_MARKETS_INFO_URL = "https://arbitrum-api.gmxinfra.io/markets/info";
export const MICRO_FILL_ETH_USDC_MARKET = getAddress(GMX_ETH_USD_MARKET_TOKEN);
export const MICRO_FILL_SLIPPAGE_BPS = 100;
export const GMX_ORACLE_PRICE_PRECISION_30 = GMX_FLOAT_PRECISION;
export const GMX_MARKET_INCREASE_TRIGGER_PRICE_30 = 0n;
