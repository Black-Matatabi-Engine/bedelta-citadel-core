/** GMX v2 micro-fill router encoder — acceptablePrice (1% slip) + ExchangeRouter multicall. */
import {
  BaseError, ContractFunctionRevertedError, createWalletClient, decodeAbiParameters, encodeFunctionData, getAddress, http,
  maxUint256, parseAbi, type Chain, type Hex, type PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { GmxV2UnsignedOrderPayload } from "./gmx-v2-adapter.types";
import { GMX_V2_EXCHANGE_ROUTER_ARBITRUM } from "../../config/gmx-revenue";
import { GMX_MARKET_REGISTRY, GMX_ETH_USD_MARKET_TOKEN } from "../../config/gmx-markets";
import { GMX_USDC_ARBITRUM, USDC_DECIMALS } from "./gmx-v2-order-payload-constants";
import { GMX_FLOAT_PRECISION } from "./gmx-v2-order-payload-guards";
import { BROWSER_MIMIC_USER_AGENT } from "../defense/rpc-whitelist";
import {
  GMX_MARKET_INCREASE_MULTICALL_METHODS,
  GMX_ORDER_VAULT_ARBITRUM,
  buildGmxMarketIncreaseMulticallCalls,
  encodeGmxExchangeRouterMulticall,
  gmxRouterAbi,
} from "./gmx-market-increase-multicall";
import { decodeGmxSyntheticsError } from "./gmx-synthetics-errors";
import { stripGmxOnChainMetadata } from "./gmx-create-order-encode";

export { GMX_ORDER_VAULT_ARBITRUM, GMX_MARKET_INCREASE_MULTICALL_METHODS };
/** ExchangeRouter — ERC20 allowance spender for sendTokens → OrderVault. */
export const GMX_COLLATERAL_SPENDER_ARBITRUM = getAddress(GMX_V2_EXCHANGE_ROUTER_ARBITRUM);
export { GMX_USDC_ARBITRUM };
export const MICRO_FILL_MIN_POSITION_USD = 10;
export const MICRO_FILL_COLLATERAL_USD = 2;
export const MICRO_FILL_LEVERAGE_X = 5;
export const MICRO_FILL_SIZE_DELTA_USD_30 = 10n * 10n ** 30n;
export const MICRO_FILL_COLLATERAL_USDC = BigInt(MICRO_FILL_COLLATERAL_USD) * 10n ** BigInt(USDC_DECIMALS);
export const GMX_ORACLE_TICKERS_URL = "https://arbitrum-api.gmxinfra.io/prices/tickers";
export const GMX_MARKETS_INFO_URL = "https://arbitrum-api.gmxinfra.io/markets/info";
/** GMX v2 ETH/USD [WETH-USDC] GM marketToken — Arbitrum One SSOT (matches gmxinfra markets/info). */
export const MICRO_FILL_ETH_USDC_MARKET = getAddress(GMX_ETH_USD_MARKET_TOKEN);
export const MICRO_FILL_SLIPPAGE_BPS = 100;
/** GMX Synthetics oracle / order price precision — `10^30` (FLOAT_PRECISION). */
export const GMX_ORACLE_PRICE_PRECISION_30 = GMX_FLOAT_PRECISION;
/** MarketIncrease orders use `triggerPrice = 0` (no limit/stop trigger). */
export const GMX_MARKET_INCREASE_TRIGGER_PRICE_30 = 0n;
const ETH_INDEX_DECIMALS = 18;
const USD_MICRO_SCALE = 1_000_000n;

/**
 * USD per 1 index token (human) → GMX 30-dec oracle price.
 * Formula: `(priceUsd / 10^tokenDecimals) * 10^30` per gmx-synthetics oracle spec.
 */
export function scaleHumanUsdToGmxIndexPrice30(humanUsd: number, tokenDecimals: number): bigint {
  if (!Number.isFinite(humanUsd) || humanUsd <= 0) {
    throw new Error("scaleHumanUsdToGmxIndexPrice30: invalid humanUsd");
  }
  const [whole, frac = ""] = humanUsd.toFixed(6).split(".");
  const microUsd = BigInt(whole + (frac + "000000").slice(0, 6));
  return (microUsd * GMX_ORACLE_PRICE_PRECISION_30) / (10n ** BigInt(tokenDecimals) * USD_MICRO_SCALE);
}

/** GMX 30-dec oracle price → human USD per 1 index token. */
export function parseGmxIndexPrice30ToHuman(raw: bigint, tokenDecimals: number): number {
  const unitScale = 10n ** BigInt(30 - tokenDecimals);
  return Number(raw) / Number(unitScale);
}

/** Coerce acceptablePrice / triggerPrice to non-negative GMX 30-dec uint. */
export function normalizeGmxOrderPrice30(price: bigint): bigint {
  if (price < 0n) throw new Error("GMX order price must be non-negative");
  return price;
}

export interface GmxOracleTicker {
  tokenAddress: string;
  minPrice: string;
  maxPrice: string;
}

/** Apply slippage on GMX oracle 30-decimal index price (gmx-interface `convertToContractPrice` path). */
export function computeGmxAcceptablePriceFromOracleRaw(
  oraclePriceRaw: bigint,
  isLong: boolean,
  slippageBps: number = MICRO_FILL_SLIPPAGE_BPS,
): bigint {
  const bps = BigInt(slippageBps);
  const factor = isLong ? 10_000n + bps : 10_000n - bps;
  return (oraclePriceRaw * factor) / 10_000n;
}

/** Human USD index price → acceptablePrice (30-dec oracle encoding + slippage). */
export function computeMicroFillAcceptablePrice(
  oraclePriceUsd: number,
  isLong: boolean,
  indexDecimals = ETH_INDEX_DECIMALS,
): bigint {
  if (!Number.isFinite(oraclePriceUsd) || oraclePriceUsd <= 0) {
    throw new Error("computeMicroFillAcceptablePrice: invalid oraclePriceUsd");
  }
  return computeGmxAcceptablePriceFromOracleRaw(
    scaleHumanUsdToGmxIndexPrice30(oraclePriceUsd, indexDecimals),
    isLong,
  );
}

export function oracleHumanUsdFromTicker(ticker: GmxOracleTicker, isLong: boolean, indexDecimals = ETH_INDEX_DECIMALS): number {
  const raw = BigInt(isLong ? ticker.maxPrice : ticker.minPrice);
  return parseGmxIndexPrice30ToHuman(raw, indexDecimals);
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

const MICRO_FILL_MARKET_TOKENS = new Set(
  Object.values(GMX_MARKET_REGISTRY).map((e) => getAddress(e.marketToken)),
);

/** Normalize + fail-closed if marketToken is outside Arbitrum SSOT registry. */
export function normalizeMicroFillMarketToken(market: string): Hex {
  const normalized = getAddress(market as Hex);
  if (!MICRO_FILL_MARKET_TOKENS.has(normalized)) {
    throw new Error(
      `GMX_MARKET_INVALID: ${normalized} not in micro-fill registry (${[...MICRO_FILL_MARKET_TOKENS].join(", ")})`,
    );
  }
  return normalized;
}

type GmxMarketsInfoRow = { marketToken: string; longToken: string; shortToken: string; name?: string };

/** Cross-check registry marketToken against live gmxinfra markets/info (long/short pair). */
export async function verifyMicroFillMarketAgainstGmxApi(market: string): Promise<Hex> {
  const normalized = normalizeMicroFillMarketToken(market);
  const entry = Object.values(GMX_MARKET_REGISTRY).find((e) => getAddress(e.marketToken) === normalized);
  if (!entry) return normalized;
  const res = await fetch(GMX_MARKETS_INFO_URL, {
    headers: { Accept: "application/json", "User-Agent": BROWSER_MIMIC_USER_AGENT },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`GMX markets/info HTTP ${res.status}`);
  const body = (await res.json()) as { markets?: GmxMarketsInfoRow[] } | GmxMarketsInfoRow[];
  const rows = Array.isArray(body) ? body : (body.markets ?? []);
  const live = rows.find(
    (m) => getAddress(m.longToken as Hex) === getAddress(entry.longToken)
      && getAddress(m.shortToken as Hex) === getAddress(entry.shortToken),
  );
  if (!live) throw new Error(`GMX_MARKET_NOT_LISTED: ${entry.key} missing on gmxinfra markets/info`);
  const official = getAddress(live.marketToken as Hex);
  if (official !== normalized) {
    throw new Error(`GMX_MARKET_DRIFT: registry=${normalized} official=${official} for ${entry.key}`);
  }
  return official;
}

export function applyMicroFillOrderPricing(
  payload: GmxV2UnsignedOrderPayload,
  acceptablePrice: bigint,
): GmxV2UnsignedOrderPayload {
  const acceptable = normalizeGmxOrderPrice30(acceptablePrice);
  const trigger = normalizeGmxOrderPrice30(GMX_MARKET_INCREASE_TRIGGER_PRICE_30);
  return {
    ...payload,
    numbers: {
      ...payload.numbers,
      acceptablePrice: acceptable.toString(),
      triggerPrice: trigger.toString(),
      minOutputAmount: "0",
    },
  };
}

export function applyMicroFillMinPositionSizing(
  payload: GmxV2UnsignedOrderPayload,
): GmxV2UnsignedOrderPayload {
  return {
    ...payload,
    addresses: { ...payload.addresses, initialCollateralToken: GMX_USDC_ARBITRUM },
    numbers: {
      ...payload.numbers,
      sizeDeltaUsd: MICRO_FILL_SIZE_DELTA_USD_30.toString(),
      initialCollateralDeltaAmount: MICRO_FILL_COLLATERAL_USDC.toString(),
      minOutputAmount: "0",
    },
  };
}

const erc20ApproveAbi = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

export type GmxKernelCall = { to: Hex; value: bigint; data: Hex };

export async function ensureGmxCollateralAllowance(input: {
  client: { readContract: (args: object) => Promise<unknown>; waitForTransactionReceipt: (args: { hash: Hex }) => Promise<{ status: string; blockNumber: bigint }> };
  owner: Hex;
  token: Hex;
  required: bigint;
  pk?: Hex;
  chain: Chain;
  rpc: string;
  resolveFees?: () => Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }>;
}): Promise<{ approveTx: Hex | null; approveCall: GmxKernelCall | null }> {
  const allowance = await readGmxCollateralAllowance(input.client, input.owner, input.token);
  if (allowance >= input.required) return { approveTx: null, approveCall: null };
  const approveCall: GmxKernelCall = { to: input.token, value: 0n, data: encodeGmxCollateralApprove() };
  if (!input.pk) return { approveTx: null, approveCall };
  const wallet = createWalletClient({
    account: privateKeyToAccount(input.pk), chain: input.chain, transport: http(input.rpc),
  });
  const fees = input.resolveFees ? await input.resolveFees() : { maxFeePerGas: 150_000_000n, maxPriorityFeePerGas: 10_000_000n };
  const approveTx = await wallet.writeContract({
    address: input.token,
    abi: erc20ApproveAbi,
    functionName: "approve",
    args: [GMX_COLLATERAL_SPENDER_ARBITRUM, maxUint256],
    maxFeePerGas: fees.maxFeePerGas,
    maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
  });
  const receipt = await input.client.waitForTransactionReceipt({ hash: approveTx });
  if (receipt.status !== "success") throw new Error(`GMX approve reverted: ${approveTx}`);
  console.log("[gmx-micro-fill] USDC approve confirmed", {
    owner: input.owner, spender: GMX_COLLATERAL_SPENDER_ARBITRUM, block: receipt.blockNumber.toString(), tx: approveTx,
  });
  return { approveTx, approveCall: null };
}

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

export function bindGmxOrderReceiver(
  payload: GmxV2UnsignedOrderPayload,
  receiver: Hex,
): GmxV2UnsignedOrderPayload {
  return { ...payload, addresses: { ...payload.addresses, receiver } };
}

const ERROR_STRING_SELECTOR = "0x08c379a0";
const PANIC_SELECTOR = "0x4e487b71";

export type GmxSimulateRevertDetails = {
  message: string;
  reason?: string;
  signature?: string;
  rawData?: Hex;
  decodedError?: string;
  causeData?: string;
};

function readHexData(value: unknown): Hex | undefined {
  if (typeof value !== "string" || !value.startsWith("0x")) return undefined;
  return value as Hex;
}

function scrapeRevertData(err: unknown, depth = 0): Hex | undefined {
  if (!err || typeof err !== "object" || depth > 6) return undefined;
  const o = err as Record<string, unknown>;
  for (const key of ["data", "raw", "result"]) {
    const hex = readHexData(o[key]);
    if (hex && hex.length > 10) return hex;
  }
  return scrapeRevertData(o.cause, depth + 1);
}

function formatDecodedContractError(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const { errorName, args } = data as { errorName?: string; args?: readonly unknown[] };
  if (!errorName) return undefined;
  if (errorName === "Error" && args?.[0] != null) return `Error("${String(args[0])}")`;
  if (errorName === "Panic" && args?.[0] != null) return `Panic(0x${BigInt(args[0] as bigint).toString(16)})`;
  return args?.length ? `${errorName}(${args.map(String).join(", ")})` : errorName;
}

function decodeGmxRevertData(data: Hex): string | null {
  const selector = data.slice(0, 10).toLowerCase();
  const gmxDecoded = decodeGmxSyntheticsError(data);
  if (gmxDecoded) return gmxDecoded;
  try {
    if (selector === ERROR_STRING_SELECTOR) {
      const [msg] = decodeAbiParameters([{ type: "string" }], `0x${data.slice(10)}` as Hex);
      return `Error("${msg}")`;
    }
    if (selector === PANIC_SELECTOR) {
      const [code] = decodeAbiParameters([{ type: "uint256" }], `0x${data.slice(10)}` as Hex);
      return `Panic(0x${code.toString(16)})`;
    }
    return `CustomError(selector=${selector}, payload=${data})`;
  } catch {
    return `UndecodedRevert(data=${data})`;
  }
}

export function extractGmxSimulateRevertDetails(err: unknown): GmxSimulateRevertDetails {
  const parts: string[] = [];
  let reason: string | undefined;
  let signature: string | undefined;
  let rawData: Hex | undefined;
  let decodedError: string | undefined;
  const causeData = scrapeRevertData(err);

  if (err instanceof BaseError) {
    const rev = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (rev instanceof ContractFunctionRevertedError) {
      reason = rev.reason;
      signature = rev.signature;
      rawData = readHexData((rev as { raw?: unknown }).raw) ?? scrapeRevertData(rev);
      decodedError = formatDecodedContractError(rev.data) ?? undefined;
      if (reason) parts.push(`reason=${reason}`);
      if (signature) parts.push(`signature=${signature}`);
      if (rawData) {
        parts.push(`rawData=${rawData}`);
        decodedError = decodedError ?? decodeGmxRevertData(rawData) ?? undefined;
      }
      if (decodedError) parts.push(`decoded=${decodedError}`);
    }
    if (causeData && causeData !== rawData) {
      parts.push(`causeData=${causeData}`);
      if (!decodedError) decodedError = decodeGmxRevertData(causeData) ?? undefined;
      if (decodedError && !parts.some((p) => p.startsWith("decoded="))) {
        parts.push(`decoded=${decodedError}`);
      }
    }
    if (parts.length === 0) parts.push(err.shortMessage ?? err.message);
  } else {
    parts.push(err instanceof Error ? err.message : String(err));
    if (causeData) {
      rawData = causeData;
      decodedError = decodeGmxRevertData(causeData) ?? undefined;
      parts.push(`causeData=${causeData}`);
      if (decodedError) parts.push(`decoded=${decodedError}`);
    }
  }
  return { message: parts.join(" | "), reason, signature, rawData, decodedError, causeData };
}

export function formatGmxSimulateRevert(err: unknown): string {
  return extractGmxSimulateRevertDetails(err).message;
}

function serializeSimulateError(err: unknown, depth = 0): unknown {
  if (err == null || depth > 5) return err;
  if (typeof err !== "object") return err;
  const o = err as Record<string, unknown>;
  const base: Record<string, unknown> = {
    name: o.name,
    message: o.message,
    shortMessage: o.shortMessage,
    data: o.data,
    raw: o.raw,
    reason: o.reason,
    signature: o.signature,
    cause: serializeSimulateError(o.cause, depth + 1),
  };
  if (err instanceof BaseError) {
    base.details = err.details;
    base.metaMessages = err.metaMessages;
  }
  return base;
}

export function logGmxSimulateRevert(err: unknown, ctx?: Record<string, unknown>): string {
  const details = extractGmxSimulateRevertDetails(err);
  const top = err && typeof err === "object" ? (err as Record<string, unknown>) : undefined;
  const errData = top?.data;
  const causeObj = top?.cause;
  const causeData = causeObj && typeof causeObj === "object" ? (causeObj as Record<string, unknown>).data : undefined;
  const selector = details.rawData?.slice(0, 10) ?? details.causeData?.slice(0, 10);
  console.error("[gmx-micro-fill] simulateContract err.data", errData);
  console.error("[gmx-micro-fill] simulateContract err.cause?.data", causeData);
  console.error("[gmx-micro-fill] simulateContract err json", JSON.stringify(serializeSimulateError(err), null, 2));
  if (selector) console.error("[gmx-micro-fill] simulateContract error selector", selector);
  console.error("[gmx-micro-fill] simulateContract revert details", { ...ctx, ...details, errData, causeData, selector });
  return details.message;
}

function isEmptyRevertHex(hex?: string): boolean {
  return hex === "0x" || hex === "";
}

/** Silent eth_call revert — GMX Router multicall often returns rawData `0x` without a reason string. */
export function isSilentGmxSimulateRevert(err: unknown): boolean {
  const { rawData, causeData } = extractGmxSimulateRevertDetails(err);
  if (isEmptyRevertHex(rawData) || isEmptyRevertHex(causeData)) return true;
  if (err instanceof BaseError) {
    const rev = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (rev instanceof ContractFunctionRevertedError) {
      const raw = readHexData((rev as { raw?: unknown }).raw);
      if (isEmptyRevertHex(raw)) return true;
    }
  }
  return false;
}

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

/** eth_call preflight via simulateContract — logs revert reason on failure. */
export async function simulateGmxMicroFillOrder(input: {
  client: Pick<PublicClient, "simulateContract">;
  payload: GmxV2UnsignedOrderPayload;
  from: Hex;
}): Promise<void> {
  const router = buildGmxRouterMulticall(input.payload);
  const market = normalizeMicroFillMarketToken(input.payload.addresses.market);
  await verifyMicroFillMarketAgainstGmxApi(market);
  console.log("[gmx-micro-fill] market verified", {
    market,
    ethUsdc: MICRO_FILL_ETH_USDC_MARKET,
    collateral: GMX_USDC_ARBITRUM,
  });
  try {
    await input.client.simulateContract({
      address: GMX_COLLATERAL_SPENDER_ARBITRUM,
      abi: gmxRouterAbi,
      functionName: "multicall",
      args: [router.calls],
      account: input.from,
      value: router.value,
    });
  } catch (err) {
    logGmxSimulateRevert(err, {
      from: input.from,
      router: GMX_COLLATERAL_SPENDER_ARBITRUM,
      value: router.value.toString(),
      collateral: router.collateral.toString(),
    });
    if (isSilentGmxSimulateRevert(err)) {
      console.warn(
        "[gmx-micro-fill] simulateContract silent revert (rawData=0x); local eth_call may diverge from on-chain GMX Router execution",
      );
      if (process.env.BYPASS_SIMULATION === "true") {
        console.warn("[gmx-micro-fill] BYPASS_SIMULATION=true — skipping simulation preflight, proceeding to broadcast");
        return;
      }
    }
    throw err;
  }
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
