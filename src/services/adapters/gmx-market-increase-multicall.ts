/**
 * GMX v2 MarketIncrease ExchangeRouter.multicall — aligned with gmx-interface
 * `buildCreateOrderMulticall` / `buildTokenTransfersParamsForIncreaseOrSwap`.
 *
 * User submission sequence (Arbitrum): sendWnt → sendTokens → createOrder.
 * sendOraclePrices is keeper-only at OrderHandler.executeOrder — not in user multicall.
 *
 * @see https://github.com/gmx-io/gmx-interface/blob/master/sdk/src/utils/orderTransactions/utils.ts
 * @see https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/router/BaseRouter.sol
 */
import { encodeFunctionData, getAddress, parseAbi, toHex, type Hex } from "viem";
import type { GmxV2UnsignedOrderPayload } from "./gmx-v2-adapter.types";
import { GMX_ORDER_TYPE_INDEX } from "./gmx-v2-order-payload.types";
import { GMX_ZERO_ADDRESS } from "./gmx-v2-order-payload-constants";

export const GMX_ORDER_VAULT_ARBITRUM = getAddress("0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5");

/** Official user-side MarketIncrease multicall method order (no oracle prices). */
export const GMX_MARKET_INCREASE_MULTICALL_METHODS = [
  "sendWnt",
  "sendTokens",
  "createOrder",
] as const;

export type GmxMarketIncreaseTokenTransfer = {
  isNative: boolean;
  token: Hex;
  destination: Hex;
  amount: bigint;
};

const gmxRouterAbi = parseAbi([
  "function multicall(bytes[] data) payable returns (bytes[])",
  "function sendWnt(address receiver, uint256 amount) payable",
  "function sendTokens(address token, address receiver, uint256 amount) payable",
  "function createOrder(((address receiver, address cancellationReceiver, address callbackContract, address uiFeeReceiver, address market, address initialCollateralToken, address[] swapPath) addresses, (uint256 sizeDeltaUsd, uint256 initialCollateralDeltaAmount, uint256 triggerPrice, uint256 acceptablePrice, uint256 executionFee, uint256 callbackGasLimit, uint256 minOutputAmount, uint256 validFromTime) numbers, uint8 orderType, uint8 decreasePositionSwapType, bool isLong, bool shouldUnwrapNativeToken, bool autoCancel, bytes32 referralCode, bytes[] dataList) params) payable returns (bytes32)",
]);

/** Mirrors gmx-interface `buildTokenTransfersParamsForIncreaseOrSwap` for ERC20 collateral. */
export function buildGmxMarketIncreaseTokenTransfers(input: {
  orderVault: Hex;
  executionFee: bigint;
  collateralToken: Hex;
  collateralAmount: bigint;
}): { transfers: GmxMarketIncreaseTokenTransfer[]; msgValue: bigint } {
  const vault = input.orderVault;
  return {
    msgValue: input.executionFee,
    transfers: [
      { isNative: true, token: GMX_ZERO_ADDRESS as Hex, destination: vault, amount: input.executionFee },
      { isNative: false, token: input.collateralToken, destination: vault, amount: input.collateralAmount },
    ],
  };
}

export function buildGmxMarketIncreaseOrderArgs(payload: GmxV2UnsignedOrderPayload, market: Hex) {
  const executionFee = BigInt(payload.numbers.executionFee);
  const collateral = BigInt(payload.numbers.initialCollateralDeltaAmount);
  const collateralToken = getAddress(payload.addresses.initialCollateralToken as Hex);
  return {
    addresses: {
      receiver: getAddress(payload.addresses.receiver as Hex),
      cancellationReceiver: getAddress(payload.addresses.cancellationReceiver as Hex),
      callbackContract: getAddress(payload.addresses.callbackContract as Hex),
      uiFeeReceiver: getAddress(payload.addresses.uiFeeReceiver as Hex),
      market,
      initialCollateralToken: collateralToken,
      swapPath: (payload.addresses.swapPath as Hex[]).map((p) => getAddress(p)),
    },
    numbers: {
      sizeDeltaUsd: BigInt(payload.numbers.sizeDeltaUsd),
      initialCollateralDeltaAmount: collateral,
      triggerPrice: 0n,
      acceptablePrice: BigInt(payload.numbers.acceptablePrice),
      executionFee,
      callbackGasLimit: BigInt(payload.numbers.callbackGasLimit),
      minOutputAmount: BigInt(payload.numbers.minOutputAmount),
      validFromTime: BigInt(payload.numbers.validFromTime),
    },
    orderType: payload.orderType ?? GMX_ORDER_TYPE_INDEX.MarketIncrease,
    decreasePositionSwapType: payload.decreasePositionSwapType,
    isLong: payload.isLong,
    shouldUnwrapNativeToken: payload.shouldUnwrapNativeToken,
    autoCancel: payload.autoCancel,
    referralCode: payload.referralCode as Hex,
    dataList: payload.dataList.map((item) => toHex(item)),
  };
}

/** Mirrors gmx-interface `buildCreateOrderMulticall` + `encodeExchangeRouterMulticall`. */
export function buildGmxMarketIncreaseMulticallCalls(input: {
  payload: GmxV2UnsignedOrderPayload;
  market: Hex;
  orderVault?: Hex;
}): { calls: Hex[]; msgValue: bigint; executionFee: bigint; collateral: bigint } {
  const orderVault = input.orderVault ?? GMX_ORDER_VAULT_ARBITRUM;
  const executionFee = BigInt(input.payload.numbers.executionFee);
  const collateral = BigInt(input.payload.numbers.initialCollateralDeltaAmount);
  const collateralToken = getAddress(input.payload.addresses.initialCollateralToken as Hex);
  const { transfers, msgValue } = buildGmxMarketIncreaseTokenTransfers({
    orderVault,
    executionFee,
    collateralToken,
    collateralAmount: collateral,
  });
  const orderArgs = buildGmxMarketIncreaseOrderArgs(input.payload, input.market);
  const calls: Hex[] = [];
  for (const t of transfers) {
    calls.push(
      t.isNative
        ? encodeFunctionData({ abi: gmxRouterAbi, functionName: "sendWnt", args: [t.destination, t.amount] })
        : encodeFunctionData({ abi: gmxRouterAbi, functionName: "sendTokens", args: [t.token, t.destination, t.amount] }),
    );
  }
  calls.push(encodeFunctionData({ abi: gmxRouterAbi, functionName: "createOrder", args: [orderArgs] }));
  return { calls, msgValue, executionFee, collateral };
}

export function encodeGmxExchangeRouterMulticall(calls: Hex[], msgValue: bigint): { data: Hex; value: bigint } {
  return {
    data: encodeFunctionData({ abi: gmxRouterAbi, functionName: "multicall", args: [calls] }),
    value: msgValue,
  };
}

export { gmxRouterAbi };
