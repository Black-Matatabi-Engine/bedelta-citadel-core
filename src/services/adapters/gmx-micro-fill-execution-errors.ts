/** GMX micro-fill — human-readable execution errors + simulation bypass helpers. */
import type { Hex, PublicClient } from "viem";
import type { GmxV2UnsignedOrderPayload } from "./gmx-v2-adapter.types";
import { GMX_V2_EXCHANGE_ROUTER_ARBITRUM } from "../../config/gmx-revenue";
import { USDC_DECIMALS } from "./gmx-v2-order-payload-constants";
import {
  GMX_COLLATERAL_SPENDER_ARBITRUM,
  extractGmxSimulateRevertDetails,
  isSilentGmxSimulateRevert,
  simulateGmxMicroFillOrder,
} from "./gmx-micro-fill-router-encode";

export type GmxMicroFillExecutionContext = {
  step: string;
  router?: string;
  owner?: string;
  market?: string;
  collateralRaw?: string;
  collateralUsd?: string;
  executionFeeWei?: string;
  dispatchMode?: string;
  txHash?: string;
};

export class GmxMicroFillExecutionError extends Error {
  readonly summary: string;
  readonly context: GmxMicroFillExecutionContext;
  readonly cause: unknown;

  constructor(cause: unknown, context: GmxMicroFillExecutionContext) {
    const summary = formatGmxMicroFillErrorSummary(cause, context);
    super(summary);
    this.name = "GmxMicroFillExecutionError";
    this.summary = summary;
    this.context = context;
    this.cause = cause;
  }
}

export function isBypassSimulationEnabled(): boolean {
  const v = (process.env.BYPASS_SIMULATION ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function formatUsdc(raw?: string): string {
  if (!raw) return "n/a";
  try {
    const n = BigInt(raw);
    return `$${(Number(n) / 10 ** USDC_DECIMALS).toFixed(2)} USDC (${raw} raw)`;
  } catch {
    return raw;
  }
}

function buildSuggestions(cause: unknown, ctx: GmxMicroFillExecutionContext): string[] {
  const msg = cause instanceof Error ? cause.message : String(cause);
  const details = extractGmxSimulateRevertDetails(cause);
  const tips: string[] = [];
  if (ctx.step.includes("simulate") && isSilentGmxSimulateRevert(cause)) {
    tips.push("本地 eth_call 為 silent revert (rawData=0x)；可設 BYPASS_SIMULATION=true 直接 broadcast 以查看鏈上 revert");
  }
  if (msg.includes("USDC_INSUFFICIENT") || msg.includes("COLLATERAL_INSUFFICIENT")) {
    tips.push(`向 owner ${ctx.owner ?? "EOA/Kernel"} 充值至少 ${ctx.collateralUsd ?? "$2"} USDC`);
  }
  if (msg.includes("allowance") || msg.includes("approve")) {
    tips.push(`確認 USDC 已 approve 給 ExchangeRouter spender ${GMX_COLLATERAL_SPENDER_ARBITRUM}`);
  }
  if (msg.includes("GUARD_BLOCKED") || msg.includes("CRI_HARDLOCK")) {
    tips.push("檢查 oracle lag / gas guard；或 ALLOW_STALE_ORACLE=1 / BYPASS_SOIL_PROBE=true（僅探針）");
  }
  if (msg.includes("MARKET")) {
    tips.push("確認 marketToken 與 gmxinfra markets/info 一致（ETH/USDC SSOT）");
  }
  if (details.decodedError?.includes("Error(")) {
    tips.push(`GMX 合約 revert: ${details.decodedError}`);
  }
  if (details.rawData) {
    const selector = details.rawData.slice(0, 10);
    if (selector && selector !== "0x") {
      tips.push(`自訂 error selector: ${selector} — 對照 gmx-synthetics Errors.sol`);
    }
  }
  if (ctx.txHash) {
    tips.push(`Arbiscan: https://arbiscan.io/tx/${ctx.txHash}`);
  }
  if (tips.length === 0) {
    tips.push("檢查 executionFee ETH、acceptablePrice 30-dec 編碼、USDC 餘額與 Router multicall 順序");
  }
  return tips;
}

export function formatGmxMicroFillErrorSummary(
  cause: unknown,
  ctx: GmxMicroFillExecutionContext,
): string {
  const details = extractGmxSimulateRevertDetails(cause);
  const headline = cause instanceof Error
    ? ((cause as Error & { shortMessage?: string }).shortMessage ?? cause.message)
    : String(cause);
  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "GMX Micro-Fill 執行失敗",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `步驟: ${ctx.step}`,
    `Router: ${ctx.router ?? GMX_V2_EXCHANGE_ROUTER_ARBITRUM}`,
    `Owner: ${ctx.owner ?? "n/a"}`,
    `Market: ${ctx.market ?? "n/a"}`,
    `抵押品: ${ctx.collateralUsd ?? formatUsdc(ctx.collateralRaw)}`,
    `Execution fee (wei): ${ctx.executionFeeWei ?? "n/a"}`,
    `Dispatch: ${ctx.dispatchMode ?? "n/a"}`,
    `錯誤: ${headline}`,
  ];
  if (details.message && details.message !== headline) lines.push(`Revert: ${details.message}`);
  if (details.rawData) lines.push(`rawData: ${details.rawData}`);
  lines.push("── 建議 ──");
  for (const tip of buildSuggestions(cause, ctx)) lines.push(`• ${tip}`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  return lines.join("\n");
}

export function printGmxMicroFillError(cause: unknown, ctx: GmxMicroFillExecutionContext): void {
  console.error(formatGmxMicroFillErrorSummary(cause, ctx));
}

export function contextFromPayload(
  payload: GmxV2UnsignedOrderPayload,
  owner: Hex,
  step: string,
  extra?: Partial<GmxMicroFillExecutionContext>,
): GmxMicroFillExecutionContext {
  const collateralRaw = payload.numbers.initialCollateralDeltaAmount;
  return {
    step,
    router: GMX_V2_EXCHANGE_ROUTER_ARBITRUM,
    owner,
    market: payload.addresses.market,
    collateralRaw,
    collateralUsd: formatUsdc(collateralRaw),
    executionFeeWei: payload.numbers.executionFee,
    ...extra,
  };
}

export async function runGmxMicroFillSimulationPreflight(input: {
  client: Pick<PublicClient, "simulateContract">;
  payload: GmxV2UnsignedOrderPayload;
  from: Hex;
}): Promise<{ bypassed: boolean }> {
  const ctx = contextFromPayload(input.payload, input.from, "ExchangeRouter.multicall simulateContract");
  try {
    await simulateGmxMicroFillOrder(input);
    return { bypassed: false };
  } catch (err) {
    if (isSilentGmxSimulateRevert(err) && isBypassSimulationEnabled()) {
      console.warn("[gmx-micro-fill] BYPASS_SIMULATION=true — 跳過 eth_call 預檢，將直接 broadcast");
      return { bypassed: true };
    }
    throw new GmxMicroFillExecutionError(err, ctx);
  }
}
