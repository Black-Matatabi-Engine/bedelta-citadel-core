/**
 * Jupiter Aggregator adapter — SliverVine Protocol services layer.
 * Workers-safe fetch · SystemState circuit breakers · soil resistance linkage.
 */

import {
  R20_LOCKED,
  isR20Locked,
  readActiveSystemState,
  type SystemState,
} from "../core/state";
import {
  HardlockError,
  RiskLimitExceeded,
  checkSoilResistance,
  vineWrapProtection,
  type SoilResistanceResult,
} from "../core/risk";

/** Jupiter v6 quote API (Cloudflare Workers-safe) */
export const JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";

/** Jupiter v6 swap transaction builder API */
export const JUPITER_SWAP_URL = "https://quote-api.jup.ag/v6/swap";

/** Pgate default — max combined price-impact + slippage (15 bps = 0.15%) */
export const PGATE_MAX_SLIPPAGE_BPS = 15;

export interface JupiterQuoteParams {
  inputMint: string;
  outputMint: string;
  /** Atomic input amount (smallest token unit, string-encoded integer) */
  amount: string;
  slippageBps: number;
}

export interface JupiterQuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  slippageBps: number;
  priceImpactPct: string;
  swapMode?: string;
  routePlan?: unknown[];
  otherAmountThreshold?: string;
  contextSlot?: number;
}

export interface JupiterSoilEvaluation {
  ok: boolean;
  tripped: boolean;
  reasons: string[];
  priceImpactBps: number;
  quoteSlippageBps: number;
  combinedSlippageBps: number;
  maxSlippageBps: number;
  soil: SoilResistanceResult;
}

export interface JupiterSwapTransactionPayload {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports?: number;
  computeUnitLimit?: number;
  dynamicSlippageReport?: unknown;
}

export interface JupiterExecutionResult {
  quote: JupiterQuoteResponse;
  soil: JupiterSoilEvaluation;
  swap?: JupiterSwapTransactionPayload;
  dryRun: boolean;
}

export interface FetchJupiterQuoteOptions {
  fetchFn?: typeof fetch;
  quoteUrl?: string;
  systemState?: SystemState;
  maxSlippageBps?: number;
  /** USD notional proxy for vineWrapProtection (defaults from inAmount when 6-decimal) */
  amountUsd?: number;
}

export interface BuildJupiterSwapOptions {
  fetchFn?: typeof fetch;
  swapUrl?: string;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
  dynamicComputeUnitLimit?: boolean;
  systemState?: SystemState;
  maxSlippageBps?: number;
  amountUsd?: number;
}

export class DefenseMatrixError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly reasons: string[];

  constructor(
    code: string,
    message: string,
    reasons: string[] = [],
    httpStatus = 422,
  ) {
    super(message);
    this.name = "DefenseMatrixError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.reasons = reasons;
  }
}

export class JupiterApiError extends Error {
  readonly code: "HTTP_ERROR" | "INVALID_RESPONSE";
  readonly httpStatus: number;
  readonly body?: unknown;

  constructor(
    message: string,
    code: JupiterApiError["code"],
    httpStatus: number,
    body?: unknown,
  ) {
    super(message);
    this.name = "JupiterApiError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.body = body;
  }
}

function resolveAmountUsd(
  params: JupiterQuoteParams,
  override?: number,
): number {
  if (override !== undefined && Number.isFinite(override) && override > 0) {
    return override;
  }
  const atomic = Number(params.amount);
  if (!Number.isFinite(atomic) || atomic <= 0) return 0;
  return atomic / 1_000_000;
}

function parseQuoteWire(body: unknown): JupiterQuoteResponse {
  if (!body || typeof body !== "object") {
    throw new JupiterApiError(
      "Invalid Jupiter quote response",
      "INVALID_RESPONSE",
      502,
      body,
    );
  }

  const wire = body as Record<string, unknown>;
  const inputMint = String(wire.inputMint ?? "");
  const outputMint = String(wire.outputMint ?? "");
  const inAmount = String(wire.inAmount ?? "");
  const outAmount = String(wire.outAmount ?? "");

  if (!inputMint || !outputMint || !inAmount || !outAmount) {
    throw new JupiterApiError(
      "Jupiter quote missing required fields",
      "INVALID_RESPONSE",
      502,
      body,
    );
  }

  return {
    inputMint,
    outputMint,
    inAmount,
    outAmount,
    slippageBps: Number(wire.slippageBps ?? 0),
    priceImpactPct: String(wire.priceImpactPct ?? "0"),
    swapMode: wire.swapMode ? String(wire.swapMode) : undefined,
    routePlan: Array.isArray(wire.routePlan) ? wire.routePlan : undefined,
    otherAmountThreshold: wire.otherAmountThreshold
      ? String(wire.otherAmountThreshold)
      : undefined,
    contextSlot:
      typeof wire.contextSlot === "number" ? wire.contextSlot : undefined,
  };
}

function combinedSlippageBps(quote: JupiterQuoteResponse): {
  priceImpactBps: number;
  quoteSlippageBps: number;
  combinedSlippageBps: number;
} {
  const priceImpactBps = Math.abs(Number(quote.priceImpactPct)) * 100;
  const quoteSlippageBps = quote.slippageBps;
  return {
    priceImpactBps,
    quoteSlippageBps,
    combinedSlippageBps: priceImpactBps + quoteSlippageBps,
  };
}

/** Assert SystemState circuit breakers before any Jupiter route evaluation. */
export function assertSystemStateGates(
  state: SystemState,
  amountUsd: number,
): void {
  if (isR20Locked(state) || state.hardlock) {
    throw new DefenseMatrixError(
      R20_LOCKED,
      `${R20_LOCKED} — Jupiter adapter blocked; signing channel severed`,
      [
        `hardlock=${state.hardlock}`,
        `currentCri=${state.currentCri}`,
        `signingChannelOpen=${state.signingChannelOpen}`,
      ],
      403,
    );
  }

  if (!state.signingChannelOpen) {
    throw new DefenseMatrixError(
      "SIGNING_CHANNEL_CLOSED",
      "Jupiter adapter blocked — signing channel closed",
      [`signingChannelOpen=false`],
      403,
    );
  }

  try {
    vineWrapProtection({
      symbol: "JUP_SWAP",
      estimatedLossUsd: amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock,
    });
  } catch (err) {
    if (err instanceof HardlockError) {
      throw new DefenseMatrixError(
        R20_LOCKED,
        err.message,
        [err.message],
        403,
      );
    }
    if (err instanceof RiskLimitExceeded) {
      throw new DefenseMatrixError(
        "ROOT_PROTECTION",
        err.message,
        [err.message],
        422,
      );
    }
    throw err;
  }
}

/**
 * Evaluate Jupiter route slippage via checkSoilResistance() cross-venue probe.
 * Throws DefenseMatrixError when combined price impact exceeds threshold.
 */
export function evaluateJupiterSoilResistance(
  quote: JupiterQuoteResponse,
  maxSlippageBps: number = PGATE_MAX_SLIPPAGE_BPS,
  amountUsd?: number,
): JupiterSoilEvaluation {
  const { priceImpactBps, quoteSlippageBps, combinedSlippageBps: totalBps } =
    combinedSlippageBps(quote);
  const reasons: string[] = [];
  const notional =
    amountUsd ??
    (Number(quote.inAmount) > 0 ? Number(quote.inAmount) / 1_000_000 : 0);

  if (priceImpactBps > maxSlippageBps) {
    reasons.push(
      `PRICE_IMPACT=${priceImpactBps.toFixed(2)}bps>${maxSlippageBps}bps`,
    );
  }

  if (totalBps > maxSlippageBps) {
    reasons.push(
      `JUPITER_COMBINED_SLIPPAGE=${totalBps.toFixed(2)}bps>${maxSlippageBps}bps`,
    );
  }

  const slippageRatio = totalBps / 10_000;
  const basePx = 50_000;
  const soil = checkSoilResistance({
    symbol: "JUP_SWAP",
    hlSpot: basePx,
    hlPerp: basePx,
    dydxPerp: basePx * (1 + slippageRatio),
    depthUsd: Math.max(notional * 100, 500_000),
  });

  if (soil.tripped) {
    reasons.push(...soil.reasons);
  }

  const tripped = reasons.length > 0;

  if (tripped) {
    throw new DefenseMatrixError(
      "SOIL_RESISTANCE_SLIPPAGE_BREAKER",
      "Jupiter soil resistance slippage breaker tripped — swap blocked",
      reasons,
      422,
    );
  }

  return {
    ok: true,
    tripped: false,
    reasons: [],
    combinedSlippageBps: totalBps,
    maxSlippageBps,
    priceImpactBps,
    quoteSlippageBps,
    soil,
  };
}

/** Fetch live Jupiter v6 quote routes with SystemState pre-gates. */
export async function fetchJupiterQuote(
  params: JupiterQuoteParams,
  options: FetchJupiterQuoteOptions = {},
): Promise<JupiterQuoteResponse> {
  const state = options.systemState ?? readActiveSystemState();
  const amountUsd = resolveAmountUsd(params, options.amountUsd);

  assertSystemStateGates(state, amountUsd);

  const fetchFn = options.fetchFn ?? fetch;
  const quoteUrl = options.quoteUrl ?? JUPITER_QUOTE_URL;
  const maxSlippageBps = options.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS;

  const search = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount,
    slippageBps: String(params.slippageBps),
  });

  const res = await fetchFn(`${quoteUrl}?${search.toString()}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new JupiterApiError(
      `Jupiter quote HTTP ${res.status}`,
      "HTTP_ERROR",
      res.status,
    );
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new JupiterApiError(
      "Invalid JSON from Jupiter quote API",
      "INVALID_RESPONSE",
      res.status,
    );
  }

  const quote = parseQuoteWire(body);
  evaluateJupiterSoilResistance(quote, maxSlippageBps, amountUsd);

  return quote;
}

/**
 * Build unsigned Jupiter swap transaction payload for Cloudflare Worker signing pipeline.
 * Does not sign or broadcast — returns serialized transaction bytes (base64).
 */
export async function buildJupiterSwapTransaction(
  quote: JupiterQuoteResponse,
  options: BuildJupiterSwapOptions,
): Promise<JupiterSwapTransactionPayload> {
  const state = options.systemState ?? readActiveSystemState();
  const amountUsd = resolveAmountUsd(
    {
      inputMint: quote.inputMint,
      outputMint: quote.outputMint,
      amount: quote.inAmount,
      slippageBps: quote.slippageBps,
    },
    options.amountUsd,
  );
  const maxSlippageBps = options.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS;

  assertSystemStateGates(state, amountUsd);
  evaluateJupiterSoilResistance(quote, maxSlippageBps, amountUsd);

  const fetchFn = options.fetchFn ?? fetch;
  const swapUrl = options.swapUrl ?? JUPITER_SWAP_URL;

  const res = await fetchFn(swapUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: options.userPublicKey,
      wrapAndUnwrapSol: options.wrapAndUnwrapSol ?? true,
      dynamicComputeUnitLimit: options.dynamicComputeUnitLimit ?? true,
    }),
  });

  if (!res.ok) {
    throw new JupiterApiError(
      `Jupiter swap HTTP ${res.status}`,
      "HTTP_ERROR",
      res.status,
    );
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new JupiterApiError(
      "Invalid JSON from Jupiter swap API",
      "INVALID_RESPONSE",
      res.status,
    );
  }

  if (!body || typeof body !== "object") {
    throw new JupiterApiError(
      "Jupiter swap missing payload",
      "INVALID_RESPONSE",
      502,
      body,
    );
  }

  const wire = body as Record<string, unknown>;
  const swapTransaction = String(wire.swapTransaction ?? "");
  const lastValidBlockHeight = Number(wire.lastValidBlockHeight);

  if (!swapTransaction || !Number.isFinite(lastValidBlockHeight)) {
    throw new JupiterApiError(
      "Jupiter swap response missing swapTransaction or lastValidBlockHeight",
      "INVALID_RESPONSE",
      502,
      body,
    );
  }

  return {
    swapTransaction,
    lastValidBlockHeight,
    prioritizationFeeLamports:
      typeof wire.prioritizationFeeLamports === "number"
        ? wire.prioritizationFeeLamports
        : undefined,
    computeUnitLimit:
      typeof wire.computeUnitLimit === "number"
        ? wire.computeUnitLimit
        : undefined,
    dynamicSlippageReport: wire.dynamicSlippageReport,
  };
}

/** End-to-end: quote fetch + soil validation + unsigned swap payload. */
export async function executeJupiterSwapPipeline(
  params: JupiterQuoteParams,
  swapOptions: BuildJupiterSwapOptions,
): Promise<JupiterExecutionResult> {
  const quote = await fetchJupiterQuote(params, {
    fetchFn: swapOptions.fetchFn,
    systemState: swapOptions.systemState,
    maxSlippageBps: swapOptions.maxSlippageBps,
    amountUsd: swapOptions.amountUsd,
  });

  const soil = evaluateJupiterSoilResistance(
    quote,
    swapOptions.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS,
    swapOptions.amountUsd ?? resolveAmountUsd(params, swapOptions.amountUsd),
  );

  const swap = await buildJupiterSwapTransaction(quote, swapOptions);

  return { quote, soil, swap, dryRun: false };
}
