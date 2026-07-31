/**
 * Dry-Run Sandbox Engine — zero-private-key Hyperliquid tick / depth / volatility simulation.
 */

import type { SystemState } from "./systemState";
import { buildSystemState } from "./systemState";
import {
  checkSoilResistance,
  MAX_SLIPPAGE,
  type SoilResistanceInput,
} from "./risk-control";
import {
  executeOrder,
  resolveHyperliquidDryRun,
  type HyperliquidAdapterConfig,
  type HyperliquidFillResult,
} from "./hyperliquidAdapter";
import {
  assertZeroCapitalLeak,
  checkCircuitBreaker,
  DEADLOCK_COOLDOWN_MS,
  evaluatePendingOrderStagnation,
  evaluateSystemTakeover,
  type CapitalLeakResult,
  type CircuitBreakerResult,
  type SystemTakeoverResult,
} from "./rootProtectionService";
import type { SessionKeyOrderPayload } from "./session-key-adapter";
import { simulateTransactionIntent, type SandboxDiagnosticReport } from "./sandbox";
import { createRoot17DailyState } from "../v2/services/root17-daily";

export type SandboxExecutionMode = "SANDBOX" | "LIVE";

export interface SandboxMarketTick {
  symbol: string;
  asset: number;
  markPx: number;
  bestBid: number;
  bestAsk: number;
  bidDepthUsd: number;
  askDepthUsd: number;
  tickVelocity: number;
  volatilityIndex: number;
  timestamp: number;
}

export interface SandboxOrderBookDepth {
  bids: Array<{ px: number; szUsd: number }>;
  asks: Array<{ px: number; szUsd: number }>;
  midPx: number;
  spreadBps: number;
}

export interface SandboxTickScenario {
  volatilitySpikeAt?: number;
  depthCollapseRatio?: number;
}

export interface SandboxProtectionSnapshot {
  circuitBreaker: CircuitBreakerResult;
  takeover: SystemTakeoverResult;
  capitalLeak: CapitalLeakResult;
  dynamicMaxSL: number;
}

export interface SandboxPipelineResult {
  mode: SandboxExecutionMode;
  state: SystemState;
  tick: SandboxMarketTick;
  fill: HyperliquidFillResult | null;
  protection: SandboxProtectionSnapshot;
  sandboxReport: SandboxDiagnosticReport;
  executionPath: string[];
  elapsedMs: number;
}

const DEFAULT_PAIR = {
  symbol: "BTC",
  asset: 0,
  markPx: 65_000,
  bestBid: 64_998,
  bestAsk: 65_002,
  bidDepthUsd: 500_000,
  askDepthUsd: 500_000,
};

/** Resolve SANDBOX vs LIVE from SystemState.isSandboxMode + adapter secrets. */
export function resolveExecutionMode(
  state: SystemState,
  config: HyperliquidAdapterConfig = {},
): SandboxExecutionMode {
  if (state.isSandboxMode || resolveHyperliquidDryRun(config, state)) {
    return "SANDBOX";
  }
  return "LIVE";
}

export function buildOrderBookFromTick(tick: SandboxMarketTick): SandboxOrderBookDepth {
  const midPx = (tick.bestBid + tick.bestAsk) / 2;
  const spreadBps = ((tick.bestAsk - tick.bestBid) / midPx) * 10_000;
  return {
    bids: [{ px: tick.bestBid, szUsd: tick.bidDepthUsd }],
    asks: [{ px: tick.bestAsk, szUsd: tick.askDepthUsd }],
    midPx,
    spreadBps,
  };
}

export function buildSoilFromTick(tick: SandboxMarketTick): SoilResistanceInput {
  const mid = (tick.bestBid + tick.bestAsk) / 2;
  return {
    symbol: tick.symbol,
    hlSpot: mid,
    hlPerp: tick.markPx,
    dydxPerp: mid + (tick.markPx - mid) * 0.5,
    depthUsd: Math.min(tick.bidDepthUsd, tick.askDepthUsd),
  };
}

export function createInitialTick(
  overrides: Partial<SandboxMarketTick> = {},
): SandboxMarketTick {
  return {
    ...DEFAULT_PAIR,
    tickVelocity: 20,
    volatilityIndex: 25,
    timestamp: Date.now(),
    ...overrides,
  };
}

/** Advance mock Hyperliquid tick — optional volatility spike + depth shock. */
export function advanceSandboxTick(
  current: SandboxMarketTick,
  tickIndex: number,
  scenario: SandboxTickScenario = {},
): SandboxMarketTick {
  const spike =
    scenario.volatilitySpikeAt !== undefined &&
    tickIndex >= scenario.volatilitySpikeAt;
  const volatilityIndex = spike
    ? Math.min(100, current.volatilityIndex + 55)
    : Math.max(10, current.volatilityIndex + (tickIndex % 3 === 0 ? 8 : -2));
  const tickVelocity = spike ? 85 : Math.min(70, current.tickVelocity + 5);
  const collapse = scenario.depthCollapseRatio ?? 0.35;
  const depthMul = spike ? collapse : 1;
  const drift = spike ? -120 : (tickIndex % 5) * 2 - 4;
  const markPx = current.markPx + drift;
  const spread = spike ? 18 : 4;

  return {
    ...current,
    markPx,
    bestBid: markPx - spread / 2,
    bestAsk: markPx + spread / 2,
    bidDepthUsd: current.bidDepthUsd * depthMul,
    askDepthUsd: current.askDepthUsd * depthMul,
    tickVelocity,
    volatilityIndex,
    timestamp: current.timestamp + 1000,
  };
}

export function evaluateRootProtectionSuite(input: {
  state: SystemState;
  tick: SandboxMarketTick;
  slippageRatio?: number;
  unrealizedLossUsd?: number;
  actionTimestamps?: number[];
  expectedBalanceUsd?: number;
  observedBalanceUsd?: number;
  accountedDeltaUsd?: number;
  now?: number;
}): SandboxProtectionSnapshot {
  const now = input.now ?? Date.now();
  const slippage =
    input.slippageRatio ??
    Math.abs(input.tick.markPx - input.tick.bestBid) / input.tick.markPx;

  return {
    circuitBreaker: checkCircuitBreaker({
      state: input.state,
      root17: createRoot17DailyState(),
      slippageRatio: slippage,
      now,
    }),
    takeover: evaluateSystemTakeover({
      controlMode: "SEMI_AUTO",
      dynamicMaxSL: input.state.dynamicMaxSL,
      unrealizedLossUsd: input.unrealizedLossUsd,
      actionTimestamps: input.actionTimestamps,
      slippageRatio: slippage,
      now,
    }),
    capitalLeak: assertZeroCapitalLeak({
      expectedBalanceUsd:
        input.expectedBalanceUsd ?? input.state.accountBalanceUsd,
      observedBalanceUsd:
        input.observedBalanceUsd ?? input.state.accountBalanceUsd,
      accountedDeltaUsd: input.accountedDeltaUsd,
      thresholdUsd: 0.01,
    }),
    dynamicMaxSL: input.state.dynamicMaxSL,
  };
}

export async function executeSandboxOrder(input: {
  state: SystemState;
  tick: SandboxMarketTick;
  payload: SessionKeyOrderPayload;
  config?: HyperliquidAdapterConfig;
}): Promise<HyperliquidFillResult> {
  const soil = buildSoilFromTick(input.tick);
  const dryRun = resolveExecutionMode(input.state, input.config) === "SANDBOX";

  return executeOrder({
    payload: input.payload,
    soil,
    tickVelocity: input.tick.tickVelocity,
    systemState: input.state,
    config: { ...input.config, dryRun: dryRun || input.config?.dryRun },
  });
}

/** Full E2E dry-run pipeline — tick → root protection → mock fill. */
export async function runSandboxPipeline(
  input: {
    state?: Partial<SystemState>;
    tick?: SandboxMarketTick;
    payload?: SessionKeyOrderPayload;
    amountUsd?: number;
    scenario?: SandboxTickScenario;
    slippageRatio?: number;
    unrealizedLossUsd?: number;
    actionTimestamps?: number[];
    expectedBalanceUsd?: number;
    observedBalanceUsd?: number;
    now?: number;
  } = {},
): Promise<SandboxPipelineResult> {
  const startedAt = Date.now();
  const executionPath: string[] = ["sandboxEngine:start"];

  const base = buildSystemState({
    accountBalanceUsd: input.state?.accountBalanceUsd,
    currentCri: input.state?.currentCri,
    isSandboxMode: input.state?.isSandboxMode,
    skipHardlockAssert: true,
  });
  const mergedState: SystemState = {
    ...base,
    ...input.state,
    isSandboxMode: input.state?.isSandboxMode ?? true,
  };

  const mode = resolveExecutionMode(mergedState);
  executionPath.push(`mode:${mode.toLowerCase()}`);

  const tick = input.tick ?? createInitialTick();
  executionPath.push(`tick:${tick.symbol}@${tick.markPx}`);

  const soil = buildSoilFromTick(tick);
  const soilAudit = checkSoilResistance(soil);
  executionPath.push(
    soilAudit.tripped ? "soil:resistance:trip" : "soil:resistance:pass",
  );

  const protection = evaluateRootProtectionSuite({
    state: mergedState,
    tick,
    slippageRatio: input.slippageRatio,
    unrealizedLossUsd: input.unrealizedLossUsd,
    actionTimestamps: input.actionTimestamps,
    expectedBalanceUsd: input.expectedBalanceUsd,
    observedBalanceUsd: input.observedBalanceUsd,
    now: input.now,
  });
  executionPath.push(
    protection.circuitBreaker.tripped
      ? "protection:circuit-breaker:trip"
      : "protection:circuit-breaker:pass",
  );
  executionPath.push(
    protection.takeover.systemTakeover.isOverridden
      ? "protection:takeover:active"
      : "protection:takeover:pass",
  );
  executionPath.push(
    protection.capitalLeak.leaked
      ? "protection:capital-leak:trip"
      : "protection:capital-leak:pass",
  );

  const payload: SessionKeyOrderPayload = input.payload ?? {
    asset: tick.asset,
    isBuy: true,
    limitPx: String(Math.floor(tick.bestAsk)),
    sz: "0.01",
    reduceOnly: false,
    orderType: { limit: { tif: "Gtc" } },
  };

  let fill: HyperliquidFillResult | null = null;
  const blocked =
    mergedState.hardlock ||
    protection.circuitBreaker.tripped ||
    protection.capitalLeak.leaked ||
    soilAudit.tripped;

  if (!blocked) {
    fill = await executeSandboxOrder({
      state: mergedState,
      tick,
      payload,
      config: {},
    });
    executionPath.push(
      fill.success ? "fill:mock:success" : "fill:mock:reject",
    );
  } else {
    executionPath.push("fill:blocked");
  }

  const sandboxReport = simulateTransactionIntent(
    {
      venue: "HL",
      amountUsd: input.amountUsd ?? 50,
      symbol: tick.symbol,
      soil,
    },
    mergedState,
  );
  executionPath.push("sandbox:complete");

  return {
    mode,
    state: mergedState,
    tick,
    fill,
    protection,
    sandboxReport,
    executionPath,
    elapsedMs: Date.now() - startedAt,
  };
}

export { DEADLOCK_COOLDOWN_MS, evaluatePendingOrderStagnation, MAX_SLIPPAGE };
