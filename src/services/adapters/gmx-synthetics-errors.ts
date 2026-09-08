/** GMX v2 gmx-synthetics Errors.sol — decode helpers for ExchangeRouter / OrderHandler reverts. */
import { decodeErrorResult, parseAbi, type Hex } from "viem";

export const GMX_SYNTHETICS_ERRORS_ABI = parseAbi([
  "error InsufficientExecutionFee(uint256 minExecutionFee, uint256 executionFee)",
  "error InsufficientWntAmountForExecutionFee(uint256 wntAmount, uint256 executionFee)",
  "error EmptyOrder()",
  "error OrderTypeCannotBeCreated(uint256 orderType)",
  "error UnexpectedMarket()",
  "error InvalidReceiver(address receiver)",
  "error UnexpectedValidFromTime(uint256 orderType)",
  "error Unauthorized(address msgSender, string role)",
  "error InvalidOrderPrices(uint256 indexTokenPrice, uint256 acceptablePrice)",
  "error MarketNotFound(address key)",
  "error DisabledFeature(bytes32 key)",
]);

export function decodeGmxSyntheticsError(data: Hex): string | null {
  if (!data || data === "0x" || data.length < 10) return null;
  try {
    const decoded = decodeErrorResult({ abi: GMX_SYNTHETICS_ERRORS_ABI, data });
    const args = decoded.args?.length ? decoded.args.map(String).join(", ") : "";
    return args ? `${decoded.errorName}(${args})` : decoded.errorName;
  } catch {
    return null;
  }
}
