/** GMX micro-fill — English execution errors, simulation bypass, and on-chain revert replay. */
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
  decodedOnChainRevert?: string;
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

/** Replay a mined revert via eth_call to recover GMX custom error data. */
export async function decodeGmxFailedTransaction(
  client: Pick<PublicClient, "getTransaction" | "call">,
  txHash: Hex,
): Promise<string | undefined> {
  const tx = await client.getTransaction({ hash: txHash });
  if (!tx.to || !tx.input) return undefined;
  try {
    await client.call({
      account: tx.from,
      to: tx.to,
      data: tx.input,
      value: tx.value,
      gas: tx.gas,
    });
    return undefined;
  } catch (err) {
    const details = extractGmxSimulateRevertDetails(err);
    return details.decodedError ?? details.message;
  }
}

function buildSuggestions(cause: unknown, ctx: GmxMicroFillExecutionContext): string[] {
  const msg = cause instanceof Error ? cause.message : String(cause);
  const details = extractGmxSimulateRevertDetails(cause);
  const tips: string[] = [];
  const decoded = ctx.decodedOnChainRevert ?? details.decodedError ?? "";
  if (decoded.includes("InsufficientExecutionFee")) {
    tips.push("Raise executionFee — use dynamic GMX DataStore estimate (gasLimit × gasPrice + 30% buffer)");
  }
  if (decoded.includes("InsufficientWntAmountForExecutionFee")) {
    tips.push("Ensure multicall msg.value matches executionFee and sendWnt deposits WNT to OrderVault first");
  }
  if (ctx.step.includes("simulate") && isSilentGmxSimulateRevert(cause)) {
    tips.push("Local eth_call returned silent revert (rawData=0x); set BYPASS_SIMULATION=true to broadcast and inspect on-chain");
  }
  if (msg.includes("USDC_INSUFFICIENT") || msg.includes("COLLATERAL_INSUFFICIENT")) {
    tips.push(`Fund owner ${ctx.owner ?? "EOA/Kernel"} with at least ${ctx.collateralUsd ?? "$2"} USDC`);
  }
  if (msg.includes("allowance") || msg.includes("approve")) {
    tips.push(`Approve USDC for ExchangeRouter spender ${GMX_COLLATERAL_SPENDER_ARBITRUM}`);
  }
  if (msg.includes("GUARD_BLOCKED") || msg.includes("CRI_HARDLOCK")) {
    tips.push("Check oracle lag / gas guard; probe-only: ALLOW_STALE_ORACLE=1 or BYPASS_SOIL_PROBE=true");
  }
  if (msg.includes("MARKET")) {
    tips.push("Confirm marketToken matches gmxinfra markets/info ETH/USDC SSOT");
  }
  if (details.decodedError?.includes("Error(")) {
    tips.push(`GMX contract revert: ${details.decodedError}`);
  }
  if (details.rawData) {
    const selector = details.rawData.slice(0, 10);
    if (selector && selector !== "0x") {
      tips.push(`Custom error selector ${selector} — cross-check gmx-synthetics Errors.sol`);
    }
  }
  if (ctx.txHash) {
    tips.push(`Arbiscan: https://arbiscan.io/tx/${ctx.txHash}`);
  }
  if (tips.length === 0) {
    tips.push("Verify executionFee ETH, acceptablePrice 30-dec encoding, USDC balance, and Router multicall order (sendWnt→sendTokens→createOrder)");
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
    "GMX Micro-Fill Execution Failed",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `Step: ${ctx.step}`,
    `Router: ${ctx.router ?? GMX_V2_EXCHANGE_ROUTER_ARBITRUM}`,
    `Owner: ${ctx.owner ?? "n/a"}`,
    `Market: ${ctx.market ?? "n/a"}`,
    `Collateral: ${ctx.collateralUsd ?? formatUsdc(ctx.collateralRaw)}`,
    `Execution fee (wei): ${ctx.executionFeeWei ?? "n/a"}`,
    `Dispatch: ${ctx.dispatchMode ?? "n/a"}`,
    `Error: ${headline}`,
  ];
  if (ctx.decodedOnChainRevert) lines.push(`On-chain revert: ${ctx.decodedOnChainRevert}`);
  if (details.message && details.message !== headline) lines.push(`Revert: ${details.message}`);
  if (details.rawData) lines.push(`rawData: ${details.rawData}`);
  lines.push("── Suggestions ──");
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
      console.warn("[gmx-micro-fill] BYPASS_SIMULATION=true — skipping eth_call preflight, proceeding to broadcast");
      return { bypassed: true };
    }
    throw new GmxMicroFillExecutionError(err, ctx);
  }
}
