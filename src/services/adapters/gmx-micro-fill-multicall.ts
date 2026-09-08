/** GMX micro-fill ExchangeRouter multicall builder. */
import type { Hex } from "viem";
import type { GmxV2UnsignedOrderPayload } from "./gmx-v2-adapter.types";
import { stripGmxOnChainMetadata } from "./gmx-create-order-encode";
import {
  buildGmxMarketIncreaseMulticallCalls,
  encodeGmxExchangeRouterMulticall,
  GMX_ORDER_VAULT_ARBITRUM,
} from "./gmx-market-increase-multicall";
import { normalizeMicroFillMarketToken } from "./gmx-micro-fill-market";

export function buildGmxRouterMulticall(payload: GmxV2UnsignedOrderPayload): {
  calls: Hex[];
  data: Hex;
  value: bigint;
  executionFee: bigint;
  collateral: bigint;
} {
  const wirePayload = stripGmxOnChainMetadata(payload);
  const market = normalizeMicroFillMarketToken(wirePayload.addresses.market);
  const { calls, msgValue, executionFee, collateral } = buildGmxMarketIncreaseMulticallCalls({
    payload: wirePayload,
    market,
    orderVault: GMX_ORDER_VAULT_ARBITRUM,
  });
  const { data, value } = encodeGmxExchangeRouterMulticall(calls, msgValue);
  return { calls, data, value, executionFee, collateral };
}

export function encodeGmxV2RouterCreateOrderMulticall(payload: GmxV2UnsignedOrderPayload): {
  data: Hex;
  value: bigint;
  executionFee: bigint;
  collateral: bigint;
} {
  const { data, value, executionFee, collateral } = buildGmxRouterMulticall(payload);
  return { data, value, executionFee, collateral };
}
