/** GMX micro-fill MarketDecrease live broadcast (EOA path). */
import { createPublicClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum } from "viem/chains";
import { stripGmxOnChainMetadata } from "../src/services/adapters/gmx-create-order-encode";
import { estimateGmxMarketIncreaseExecutionFeeWei } from "../src/services/adapters/gmx-execution-fee-estimator";
import {
  applyMicroFillOrderPricing,
  bindGmxOrderReceiver,
  computeGmxAcceptablePriceFromOracleRaw,
  computeMicroFillAcceptablePrice,
  fetchGmxIndexOracleTicker,
} from "../src/services/adapters/gmx-micro-fill-router-encode";
import {
  decodeGmxFailedTransaction,
  printGmxMicroFillError,
  contextFromPayload,
} from "../src/services/adapters/gmx-micro-fill-execution-errors";
import type { GmxV2UnsignedOrderPayload } from "../src/services/adapters/gmx-v2-adapter.types";
import { GMX_ORDER_TYPE_INDEX } from "../src/services/adapters/gmx-v2-order-payload.types";
import { dispatchGmxDecreaseRouterViaEoa } from "./gmx-micro-fill-decrease-eoa";
import { resolveBufferedEip1559Fees } from "./gmx-micro-fill-gas";

export type GmxMicroFillDecreaseLiveInput = {
  rpc: string;
  pk: Hex;
  orderPayload: GmxV2UnsignedOrderPayload;
  longToken: Hex;
  midPriceUsd: number;
  sizeUsd: number;
};

function arbiscan(tx: string): string { return `https://arbiscan.io/tx/${tx}`; }

export async function executeGmxMicroFillDecreaseLive(input: GmxMicroFillDecreaseLiveInput): Promise<Hex> {
  const client = createPublicClient({ chain: arbitrum, transport: http(input.rpc) });
  const owner = privateKeyToAccount(input.pk).address;
  let livePayload = bindGmxOrderReceiver(stripGmxOnChainMetadata(input.orderPayload), owner);
  if (livePayload.orderType !== GMX_ORDER_TYPE_INDEX.MarketDecrease) {
    throw new Error("GMX_MICRO_FILL_DECREASE: orderType must be MarketDecrease");
  }
  let acceptablePrice: bigint;
  try {
    const ticker = await fetchGmxIndexOracleTicker(input.longToken);
    acceptablePrice = computeGmxAcceptablePriceFromOracleRaw(
      BigInt(livePayload.isLong ? ticker.maxPrice : ticker.minPrice),
      livePayload.isLong,
    );
  } catch {
    acceptablePrice = computeMicroFillAcceptablePrice(input.midPriceUsd, livePayload.isLong);
  }
  livePayload = applyMicroFillOrderPricing(livePayload, acceptablePrice);
  const feeEstimate = await estimateGmxMarketIncreaseExecutionFeeWei({
    client,
    swapPathLength: livePayload.addresses.swapPath.length,
    callbackGasLimit: BigInt(livePayload.numbers.callbackGasLimit),
    gasPriceWei: (await resolveBufferedEip1559Fees(client)).maxFeePerGas,
  });
  livePayload = { ...livePayload, numbers: { ...livePayload.numbers, executionFee: feeEstimate.executionFeeWei } };
  console.log("[gmx-micro-fill-decrease] order pricing", {
    isLong: livePayload.isLong,
    orderType: livePayload.orderType,
    sizeDeltaUsd: livePayload.numbers.sizeDeltaUsd,
    collateralDelta: livePayload.numbers.initialCollateralDeltaAmount,
    acceptablePrice: livePayload.numbers.acceptablePrice,
    executionFeeWei: feeEstimate.executionFeeWei,
  });
  const tx = await dispatchGmxDecreaseRouterViaEoa({
    pk: input.pk, chain: arbitrum, rpc: input.rpc, client, payload: livePayload,
  });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  console.log("[gmx-micro-fill-decrease] broadcast OK", {
    owner, tx, status: receipt.status, block: receipt.blockNumber.toString(), sizeUsd: input.sizeUsd, url: arbiscan(tx),
  });
  if (receipt.status !== "success") {
    const diag = await decodeGmxFailedTransaction(client, tx, { primaryRpc: input.rpc });
    printGmxMicroFillError(new Error("Transaction mined with revert status=0"), contextFromPayload(livePayload, owner, "on-chain broadcast revert", {
      dispatchMode: "eoa", txHash: tx, decodedOnChainRevert: diag?.summary,
    }));
    process.exit(1);
  }
  return tx;
}
