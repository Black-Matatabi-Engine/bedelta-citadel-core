/**
 * Jupiter swap adapter — Phase 3 dynamic slippage + Pgate soil linkage.
 */

import type { Env } from "../../env";
import {
  readActiveSystemState,
  isR20Locked,
  R20_LOCKED,
  buildBlockedSystemState,
  buildSystemState,
  type CoreSystemState,
  type SystemState,
} from "../../core/state";
import {
  HardlockError,
  RiskLimitExceeded,
  checkSoilResistance,
  vineWrapProtection,
  type SoilResistanceResult,
} from "../../core/risk";
import { KV_KEYS, readSystemStateFromKV } from "../../services/kv-store";

/** Jupiter v6 quote API (Workers-safe fetch) */
export const JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";

/** Pgate.md — max expected slippage before blocking execution (0.15% = 15 bps) */
export const PGATE_MAX_SLIPPAGE_BPS = 15;

/** Workers KV keys for Edge runtime system-state bridge */
export const SYSTEM_STATE_KV_KEY = KV_KEYS.SYSTEM_STATE;
export const SYSTEM_STATE_R20_FLAG_KEY = KV_KEYS.SYSTEM_R20_LOCKED;

export interface KvSystemStateRecord {
  accountBalanceUsd?: number;
  currentCri?: number;
  dynamicMaxSL?: number;
  hudState?: SystemState["hudState"];
  hardlock?: boolean;
  signingChannelOpen?: boolean;
  isHedgeActive?: boolean;
  r20Locked?: boolean | typeof R20_LOCKED;
}

export interface JupiterExecutionResult {
  quote: JupiterQuote;
  soil: JupiterSoilEvaluation;
  dryRun: boolean;
}

export interface JupiterEnvExecutionResult extends JupiterExecutionResult {
  runtime: "edge" | "local";
}

export interface JupiterQuoteWire {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  slippageBps?: number;
  priceImpactPct?: string;
  swapMode?: string;
  routePlan?: unknown[];
}

export interface JupiterQuote extends JupiterQuoteWire {
  amountUsd: number;
  slippageBps: number;
  priceImpactPct: string;
}

export interface FetchJupiterQuoteOptions {
  fetchFn?: typeof fetch;
  quoteUrl?: string;
  slippageBps?: number;
}

export interface JupiterSoilEvaluation {
  ok: boolean;
  tripped: boolean;
  reasons: string[];
  combinedSlippageBps: number;
  maxSlippageBps: number;
  priceImpactBps: number;
  quoteSlippageBps: number;
  soil: SoilResistanceResult;
}

export interface JupiterExecutionOptions {
  systemState?: SystemState;
  maxSlippageBps?: number;
  fetchFn?: typeof fetch;
  quoteUrl?: string;
  dryRun?: boolean;
}

export class JupiterExecutionBlockedError extends Error {
  readonly code = "JUPITER_EXECUTION_BLOCKED" as const;
  readonly httpStatus = 403 as const;
  readonly lockState: typeof R20_LOCKED | "ROOT_PROTECTION" | "SOIL_RESISTANCE";
  readonly reasons: string[];

  constructor(
    message: string,
    lockState: JupiterExecutionBlockedError["lockState"],
    reasons: string[],
  ) {
    super(message);
    this.name = "JupiterExecutionBlockedError";
    this.lockState = lockState;
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

/** USD notional → 6-decimal atomic units (USDC-equivalent raw amount) */
export function usdToAtomicAmount(amountUsd: number): string {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    throw new Error(`amountUsd must be positive: ${amountUsd}`);
  }
  return Math.round(amountUsd * 1_000_000).toString();
}

export function parseJupiterQuote(
  wire: JupiterQuoteWire,
  amountUsd: number,
): JupiterQuote {
  return {
    ...wire,
    amountUsd,
    slippageBps: Number(wire.slippageBps ?? 0),
    priceImpactPct: wire.priceImpactPct ?? "0",
  };
}

export function combinedSlippageBps(quote: JupiterQuote): {
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

/**
 * Map Jupiter price impact + slippage into checkSoilResistance() cross-venue probe.
 */
export function evaluateJupiterSoilResistance(
  quote: JupiterQuote,
  maxSlippageBps: number = PGATE_MAX_SLIPPAGE_BPS,
): JupiterSoilEvaluation {
  const { priceImpactBps, quoteSlippageBps, combinedSlippageBps: totalBps } =
    combinedSlippageBps(quote);
  const reasons: string[] = [];

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
    depthUsd: Math.max(quote.amountUsd * 100, 500_000),
  });

  if (soil.tripped) {
    reasons.push(...soil.reasons);
  }

  const tripped = reasons.length > 0;

  return {
    ok: !tripped,
    tripped,
    reasons,
    combinedSlippageBps: totalBps,
    maxSlippageBps,
    priceImpactBps,
    quoteSlippageBps,
    soil,
  };
}

function assertJupiterExecutionGates(
  amountUsd: number,
  state: SystemState,
): void {
  if (isR20Locked(state)) {
    throw new JupiterExecutionBlockedError(
      `${R20_LOCKED} — Jupiter swap blocked; signing channel severed`,
      R20_LOCKED,
      [
        `hardlock=${state.hardlock}`,
        `currentCri=${state.currentCri}`,
        `signingChannelOpen=${state.signingChannelOpen}`,
      ],
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
    if (err instanceof HardlockError || err instanceof RiskLimitExceeded) {
      throw new JupiterExecutionBlockedError(
        "vineWrapProtection() blocked Jupiter swap",
        "ROOT_PROTECTION",
        [err.message],
      );
    }
    throw err;
  }
}

/** Fetch mockable Jupiter v6 swap quote for a USD notional. */
export async function fetchJupiterQuote(
  inputMint: string,
  outputMint: string,
  amountUsd: number,
  options: FetchJupiterQuoteOptions = {},
): Promise<JupiterQuote> {
  const fetchFn = options.fetchFn ?? fetch;
  const quoteUrl = options.quoteUrl ?? JUPITER_QUOTE_URL;
  const slippageBps = options.slippageBps ?? PGATE_MAX_SLIPPAGE_BPS;
  const amount = usdToAtomicAmount(amountUsd);

  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount,
    slippageBps: String(slippageBps),
  });

  const res = await fetchFn(`${quoteUrl}?${params.toString()}`, {
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

  return parseJupiterQuote(body as JupiterQuoteWire, amountUsd);
}

/**
 * Validate + optionally dry-run execute a Jupiter quote.
 * Blocked when isR20Locked(), vineWrapProtection(), or soil resistance trips.
 */
export async function executeJupiterQuote(
  quote: JupiterQuote,
  options: JupiterExecutionOptions = {},
): Promise<JupiterExecutionResult> {
  const state = options.systemState ?? readActiveSystemState();
  const maxSlippageBps = options.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS;

  assertJupiterExecutionGates(quote.amountUsd, state);

  const soil = evaluateJupiterSoilResistance(quote, maxSlippageBps);
  if (soil.tripped) {
    throw new JupiterExecutionBlockedError(
      "Jupiter soil resistance tripped — swap blocked",
      "SOIL_RESISTANCE",
      soil.reasons,
    );
  }

  if (options.dryRun) {
    return { quote, soil, dryRun: true };
  }

  const fetchFn = options.fetchFn ?? fetch;
  const swapUrl = (options.quoteUrl ?? JUPITER_QUOTE_URL).replace(
    "/quote",
    "/swap",
  );

  const res = await fetchFn(swapUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quoteResponse: quote }),
  });

  if (!res.ok) {
    throw new JupiterApiError(
      `Jupiter swap HTTP ${res.status}`,
      "HTTP_ERROR",
      res.status,
    );
  }

  return { quote, soil, dryRun: false };
}

export function isKvR20LockedFlag(value: string | null): boolean {
  if (!value) return false;
  const normalized = value.trim().toUpperCase();
  return normalized === "TRUE" || normalized === "1" || normalized === R20_LOCKED;
}

export function mergeKvSystemState(record: KvSystemStateRecord): CoreSystemState {
  if (
    record.r20Locked === true ||
    record.r20Locked === R20_LOCKED ||
    record.hardlock === true
  ) {
    return {
      ...buildBlockedSystemState(record.accountBalanceUsd),
      isHedgeActive: false,
    };
  }

  const base = buildSystemState({
    accountBalanceUsd: record.accountBalanceUsd,
    currentCri: record.currentCri,
    skipHardlockAssert: true,
  });

  return {
    ...base,
    ...record,
    isHedgeActive: record.isHedgeActive ?? false,
  };
}

export async function readKvSystemState(
  kv: KVNamespace,
): Promise<CoreSystemState | null> {
  const snapshot = await readSystemStateFromKV(kv);
  if (!snapshot?.state) return null;

  try {
    return mergeKvSystemState(snapshot.state as KvSystemStateRecord);
  } catch {
    return null;
  }
}

/** Edge KV gate — throws when R20 flag or snapshot lock is set. */
export async function assertKvExecutionAllowed(
  env: Env,
): Promise<CoreSystemState | null> {
  const kv = env.SLIVERVINE_KV;
  if (!kv) return null;

  const [r20Flag, snapshot] = await Promise.all([
    kv.get(SYSTEM_STATE_R20_FLAG_KEY),
    readSystemStateFromKV(kv),
  ]);

  if (isKvR20LockedFlag(r20Flag)) {
    throw new JupiterExecutionBlockedError(
      `${R20_LOCKED} — Jupiter swap blocked by Edge KV flag`,
      R20_LOCKED,
      [`kv:${SYSTEM_STATE_R20_FLAG_KEY}=${r20Flag}`],
    );
  }

  if (snapshot?.state) {
    const record = snapshot.state as KvSystemStateRecord;
    if (record.r20Locked === true || record.r20Locked === R20_LOCKED) {
      throw new JupiterExecutionBlockedError(
        `${R20_LOCKED} — Jupiter swap blocked by Edge KV snapshot`,
        R20_LOCKED,
        [`kv:${SYSTEM_STATE_KV_KEY}.r20Locked=${String(record.r20Locked)}`],
      );
    }
    return mergeKvSystemState(record);
  }

  return null;
}

/** Workers Env execution bridge — KV state check then Jupiter quote execution. */
export async function executeJupiterQuoteWithEnv(
  quote: JupiterQuote,
  env: Env,
  options: Omit<JupiterExecutionOptions, "systemState"> = {},
): Promise<JupiterEnvExecutionResult> {
  const kvState = await assertKvExecutionAllowed(env);
  const runtime = env.SLIVERVINE_KV ? ("edge" as const) : ("local" as const);

  const result = await executeJupiterQuote(quote, {
    ...options,
    systemState: kvState ?? readActiveSystemState(),
  });

  return { ...result, runtime };
}

/** Audit surface — typed re-exports for Workers + risk integration */
export type { Env } from "../../env";
export type { CoreSystemState, SystemState } from "../../core/state";
export { R20_LOCKED, isR20Locked, readActiveSystemState } from "../../core/state";
export type { SoilResistanceInput, SoilResistanceResult } from "../../core/risk";
export { checkSoilResistance, vineWrapProtection } from "../../core/risk";

export * from "./ingress-guard";
