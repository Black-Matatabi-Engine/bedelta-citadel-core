/** GMX v2 GM Pool withdrawal — Arbitrum SSOT constants. */
import { getAddress } from "viem";
import { GMX_ETH_USD_MARKET_TOKEN } from "../../config/gmx-markets";

export const GMX_WITHDRAWAL_VAULT_ARBITRUM = getAddress("0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701c55");
export const GMX_GM_ETH_USDC_MARKET = getAddress(GMX_ETH_USD_MARKET_TOKEN);

/** Official user-side GM withdrawal: sendWnt → sendTokens(GM) → createWithdrawal. */
export const GMX_GM_WITHDRAW_MULTICALL_METHODS = [
  "sendWnt",
  "sendTokens",
  "createWithdrawal",
] as const;
