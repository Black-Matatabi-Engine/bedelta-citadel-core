/** GMX v2 micro-fill router encoder — acceptablePrice (1% slip) + ExchangeRouter multicall. */
import { encodeFunctionData, getAddress, maxUint256, parseAbi, toHex, type Hex } from "viem";
import type { GmxV2UnsignedOrderPayload } from "./gmx-v2-adapter.types";
import { GMX_V2_EXCHANGE_ROUTER_ARBITRUM } from "../../config/gmx-revenue";
import { GMX_USDC_ARBITRUM } from "./gmx-v2-order-payload-constants";
import { BROWSER_MIMIC_USER_AGENT } from "../defense/rpc-whitelist";

export const GMX_ORDER_VAULT_ARBITRUM = getAddress("0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5");
/** ExchangeRouter — ERC20 allowance spender for sendTokens → OrderVault. */
export const GMX_COLLATERAL_SPENDER_ARBITRUM = getAddress(GMX_V2_EXCHANGE_ROUTER_ARBITRUM);
export { GMX_USDC_ARBITRUM };
export const GMX_ORACLE_TICKERS_URL = "https://arbitrum-api.gmxinfra.io/prices/tickers";
export const MICRO_FILL_SLIPPAGE_BPS = 100;
const ETH_INDEX_DECIMALS = 18;

export interface GmxOracleTicker {
  tokenAddress: string;
  minPrice: string;
  maxPrice: string;
}

/** Human USD oracle → GMX 30-decimal acceptablePrice (long ×1.01 / short ×0.99). */
export function computeMicroFillAcceptablePrice(oraclePriceUsd: number, isLong: boolean): bigint {
  if (!Number.isFinite(oraclePriceUsd) || oraclePriceUsd <= 0) {
    throw new Error("computeMicroFillAcceptablePrice: invalid oraclePriceUsd");
  }
  const priceMicro = BigInt(Math.round(oraclePriceUsd * 1_000_000));
  const factor = isLong ? 10100n : 9900n;
  return (priceMicro * factor * 10n ** 24n) / 10000n;
}

export function oracleHumanUsdFromTicker(ticker: GmxOracleTicker, isLong: boolean, indexDecimals = ETH_INDEX_DECIMALS): number {
  const raw = BigInt(isLong ? ticker.maxPrice : ticker.minPrice);
  const scale = 10n ** BigInt(30 - indexDecimals);
  return Number(raw) / Number(scale);
}

export async function fetchGmxIndexOracleTicker(indexToken: Hex): Promise<GmxOracleTicker> {
  const res = await fetch(GMX_ORACLE_TICKERS_URL, {
    headers: { Accept: "application/json", "User-Agent": BROWSER_MIMIC_USER_AGENT },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`GMX oracle tickers HTTP ${res.status}`);
  const tickers = (await res.json()) as GmxOracleTicker[];
  const hit = tickers.find((t) => getAddress(t.tokenAddress as Hex) === getAddress(indexToken));
  if (!hit) throw new Error(`GMX oracle ticker missing for ${indexToken}`);
  return hit;
}

export function applyMicroFillOrderPricing(
  payload: GmxV2UnsignedOrderPayload,
  acceptablePrice: bigint,
): GmxV2UnsignedOrderPayload {
  return {
    ...payload,
    numbers: {
      ...payload.numbers,
      acceptablePrice: acceptablePrice.toString(),
      minOutputAmount: "0",
      triggerPrice: "0",
    },
  };
}

const erc20ApproveAbi = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

export function encodeGmxCollateralApprove(amount: bigint = maxUint256): Hex {
  return encodeFunctionData({
    abi: erc20ApproveAbi,
    functionName: "approve",
    args: [GMX_COLLATERAL_SPENDER_ARBITRUM, amount],
  });
}

export async function readGmxCollateralAllowance(
  client: { readContract: (args: object) => Promise<unknown> },
  owner: Hex,
  token: Hex,
): Promise<bigint> {
  return client.readContract({
    address: token,
    abi: erc20ApproveAbi,
    functionName: "allowance",
    args: [owner, GMX_COLLATERAL_SPENDER_ARBITRUM],
  }) as Promise<bigint>;
}

const gmxRouterAbi = parseAbi([
  "function multicall(bytes[] data) payable returns (bytes[])",
  "function sendWnt(address receiver, uint256 amount) payable",
  "function sendTokens(address token, address receiver, uint256 amount) payable",
  "function createOrder(((address receiver, address cancellationReceiver, address callbackContract, address uiFeeReceiver, address market, address initialCollateralToken, address[] swapPath) addresses, (uint256 sizeDeltaUsd, uint256 initialCollateralDeltaAmount, uint256 triggerPrice, uint256 acceptablePrice, uint256 executionFee, uint256 callbackGasLimit, uint256 minOutputAmount, uint256 validFromTime) numbers, uint8 orderType, uint8 decreasePositionSwapType, bool isLong, bool shouldUnwrapNativeToken, bool autoCancel, bytes32 referralCode, bytes[] dataList) params) payable returns (bytes32)",
]);

export function bindGmxOrderReceiver(
  payload: GmxV2UnsignedOrderPayload,
  receiver: Hex,
): GmxV2UnsignedOrderPayload {
  return { ...payload, addresses: { ...payload.addresses, receiver } };
}

export function encodeGmxV2RouterCreateOrderMulticall(payload: GmxV2UnsignedOrderPayload): {
  data: Hex;
  value: bigint;
  executionFee: bigint;
  collateral: bigint;
} {
  const executionFee = BigInt(payload.numbers.executionFee);
  const collateral = BigInt(payload.numbers.initialCollateralDeltaAmount);
  const collateralToken = getAddress(payload.addresses.initialCollateralToken as Hex);
  const orderArgs = {
    addresses: {
      receiver: payload.addresses.receiver as Hex,
      cancellationReceiver: payload.addresses.cancellationReceiver as Hex,
      callbackContract: payload.addresses.callbackContract as Hex,
      uiFeeReceiver: payload.addresses.uiFeeReceiver as Hex,
      market: payload.addresses.market as Hex,
      initialCollateralToken: collateralToken,
      swapPath: payload.addresses.swapPath as Hex[],
    },
    numbers: {
      sizeDeltaUsd: BigInt(payload.numbers.sizeDeltaUsd),
      initialCollateralDeltaAmount: collateral,
      triggerPrice: 0n,
      acceptablePrice: BigInt(payload.numbers.acceptablePrice),
      executionFee,
      callbackGasLimit: BigInt(payload.numbers.callbackGasLimit),
      minOutputAmount: 0n,
      validFromTime: BigInt(payload.numbers.validFromTime),
    },
    orderType: payload.orderType,
    decreasePositionSwapType: payload.decreasePositionSwapType,
    isLong: payload.isLong,
    shouldUnwrapNativeToken: payload.shouldUnwrapNativeToken,
    autoCancel: payload.autoCancel,
    referralCode: payload.referralCode as Hex,
    dataList: payload.dataList.map((item) => toHex(item)),
  };
  const calls = [
    encodeFunctionData({ abi: gmxRouterAbi, functionName: "sendWnt", args: [GMX_ORDER_VAULT_ARBITRUM, executionFee] }),
    encodeFunctionData({ abi: gmxRouterAbi, functionName: "sendTokens", args: [collateralToken, GMX_ORDER_VAULT_ARBITRUM, collateral] }),
    encodeFunctionData({ abi: gmxRouterAbi, functionName: "createOrder", args: [orderArgs] }),
  ];
  return {
    data: encodeFunctionData({ abi: gmxRouterAbi, functionName: "multicall", args: [calls] }),
    value: executionFee,
    executionFee,
    collateral,
  };
}
