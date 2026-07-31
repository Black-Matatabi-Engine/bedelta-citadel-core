/**
 * Root protection circuit breaker — R17 daily loss · slippage decay · admin reset.
 */

import type { SystemState } from "./systemState";
import { MAX_SLIPPAGE } from "./risk-control";
import type {
  DonDonControlMode,
  SystemTakeover,
} from "../core/risk-envelope-types";
import {
  checkRoot17DailyLimit,
  createRoot17DailyState,
  type Root17DailyState,
} from "../v2/services/root17-daily";

export type { SystemTakeover } from "../core/risk-envelope-types";
export type { SystemTakeoverReason } from "../core/risk-envelope-types";

export type CircuitBreakerTarget = "R17" | "R20" | "SLIPPAGE" | "FOMO";

/** Minimum RAGE_FOMO / circuit-breaker hold before auto cool-off (60s). */
export const DEADLOCK_COOLDOWN_MS = 60_000;

/** Behavioral FOMO — max actions within rolling window before hard lock. */
export const FOMO_ACTION_WINDOW_MS = 10_000;
export const FOMO_ACTION_MAX_ACTIONS = 5;

export interface CircuitBreakerInput {
  state: SystemState;
  root17?: Root17DailyState;
  slippageRatio?: number;
  maxSlippage?: number;
  now?: number;
}

export interface CircuitBreakerResult {
  deadlocked: boolean;
  tripped: boolean;
  reasons: string[];
  target?: CircuitBreakerTarget;
}

export interface AdminResetResult {
  ok: boolean;
  message: string;
}

export interface SystemTakeoverInput {
  controlMode: DonDonControlMode;
  dynamicMaxSL: number;
  unrealizedLossUsd?: number;
  actionTimestamps?: number[];
  slippageRatio?: number;
  maxSlippage?: number;
  now?: number;
}

export interface SystemTakeoverResult {
  systemTakeover: SystemTakeover;
  takeoverHUDText: string;
  effectiveControlMode: DonDonControlMode;
  deadlockCooldownSec: number;
  forceCircuitBreaker: boolean;
}

interface DeadlockRegistry {
  active: boolean;
  reason: string | null;
  target: CircuitBreakerTarget | null;
  resetAt: string | null;
  lockedUntil: number | null;
}

let registry: DeadlockRegistry = {
  active: false,
  reason: null,
  target: null,
  resetAt: null,
  lockedUntil: null,
};

function armDeadlock(
  reason: string,
  target: CircuitBreakerTarget,
  now: number,
): void {
  registry.active = true;
  registry.reason = reason;
  registry.target = target;
  registry.lockedUntil = now + DEADLOCK_COOLDOWN_MS;
}

function clearDeadlockIfCooldownExpired(now: number): boolean {
  if (!registry.active) return false;
  if (registry.lockedUntil !== null && now >= registry.lockedUntil) {
    registry.active = false;
    registry.reason = null;
    registry.target = null;
    registry.lockedUntil = null;
    return false;
  }
  return true;
}

export function isDeadlockActive(now = Date.now()): boolean {
  return clearDeadlockIfCooldownExpired(now);
}

export function readDeadlockRegistry(): Readonly<DeadlockRegistry> {
  return { ...registry };
}

function remainingCooldownSec(now: number): number {
  if (registry.lockedUntil === null) {
    return Math.ceil(DEADLOCK_COOLDOWN_MS / 1000);
  }
  return Math.max(0, Math.ceil((registry.lockedUntil - now) / 1000));
}

export function formatEmergencySlTakeoverText(dynamicMaxSL: number): string {
  return `[ EMERGENCY TAKEOVER | Auto-SL Executed ] -$${dynamicMaxSL.toFixed(2)} SL Shielded`;
}

export function formatFomoTakeoverLockText(cooldownSec: number): string {
  return `[ ${cooldownSec}s TAKEOVER LOCK | Anti-FOMO Overload ] HotKey Disabled`;
}

/** System safety takeover — emergency SL override + behavioral FOMO downgrade. */
export function evaluateSystemTakeover(
  input: SystemTakeoverInput,
): SystemTakeoverResult {
  const now = input.now ?? Date.now();
  const none: SystemTakeoverResult = {
    systemTakeover: { isOverridden: false, reason: "NONE" },
    takeoverHUDText: "",
    effectiveControlMode: input.controlMode,
    deadlockCooldownSec: 0,
    forceCircuitBreaker: false,
  };

  const windowStart = now - FOMO_ACTION_WINDOW_MS;
  const recentActions = (input.actionTimestamps ?? []).filter(
    (ts) => ts >= windowStart && ts <= now,
  );
  const maxSlippage = input.maxSlippage ?? MAX_SLIPPAGE;
  const slippage = input.slippageRatio ?? 0;
  const rapidClicks = recentActions.length > FOMO_ACTION_MAX_ACTIONS;
  const slippageOverload = slippage > maxSlippage;

  if (rapidClicks || slippageOverload) {
    armDeadlock("FOMO_BEHAVIOR_LOCK", "FOMO", now);
    const cooldownSec = remainingCooldownSec(now);
    return {
      systemTakeover: { isOverridden: true, reason: "FOMO_BEHAVIOR_LOCK" },
      takeoverHUDText: formatFomoTakeoverLockText(cooldownSec),
      effectiveControlMode: input.controlMode,
      deadlockCooldownSec: cooldownSec,
      forceCircuitBreaker: true,
    };
  }

  if (
    registry.active &&
    registry.reason === "FOMO_BEHAVIOR_LOCK" &&
    clearDeadlockIfCooldownExpired(now)
  ) {
    const cooldownSec = remainingCooldownSec(now);
    return {
      systemTakeover: { isOverridden: true, reason: "FOMO_BEHAVIOR_LOCK" },
      takeoverHUDText: formatFomoTakeoverLockText(cooldownSec),
      effectiveControlMode: input.controlMode,
      deadlockCooldownSec: cooldownSec,
      forceCircuitBreaker: true,
    };
  }

  const inManualModes =
    input.controlMode === "MANUAL" || input.controlMode === "SEMI_AUTO";
  const loss = input.unrealizedLossUsd ?? 0;
  if (inManualModes && loss >= input.dynamicMaxSL && input.dynamicMaxSL > 0) {
    return {
      systemTakeover: { isOverridden: true, reason: "EMERGENCY_SL_PROTECTION" },
      takeoverHUDText: formatEmergencySlTakeoverText(input.dynamicMaxSL),
      effectiveControlMode: "FULL_AUTO",
      deadlockCooldownSec: 0,
      forceCircuitBreaker: false,
    };
  }

  return none;
}

/** Auto-trigger deadlock on R17 daily loss cap or slippage fuse breach.
 *
 * @theory Embrechts et al. (1997) — Extreme Value Theory (EVT) tail-risk thresholds.
 * @theory McNeil et al. (2005) — fat-tail defense via multi-layer circuit breakers.
 */
export function checkCircuitBreaker(
  input: CircuitBreakerInput,
): CircuitBreakerResult {
  const now = input.now ?? Date.now();
  const reasons: string[] = [];
  let target: CircuitBreakerTarget | undefined;

  if (input.state.hardlock) {
    armDeadlock("R20_HARDLOCK", "R20", now);
    return {
      deadlocked: true,
      tripped: true,
      reasons: ["R20_HARDLOCK"],
      target: "R20",
    };
  }

  const root17 = checkRoot17DailyLimit({
    accountEquityUsd: input.state.accountBalanceUsd,
    state: input.root17 ?? createRoot17DailyState(),
  });

  if (root17.tripped) {
    const reason = root17.reason ?? "ROOT17_DAILY_LIMIT";
    armDeadlock(reason, "R17", now);
    reasons.push(reason);
    target = "R17";
  }

  const maxSlippage = input.maxSlippage ?? MAX_SLIPPAGE;
  const slippage = input.slippageRatio ?? 0;
  if (slippage > maxSlippage) {
    const reason = `SLIPPAGE_DECAY_EXCEEDED: ${slippage.toFixed(6)} > ${maxSlippage}`;
    armDeadlock(reason, target ?? "SLIPPAGE", now);
    reasons.push(reason);
    target = target ?? "SLIPPAGE";
  }

  if (reasons.length > 0) {
    return {
      deadlocked: true,
      tripped: true,
      reasons,
      target,
    };
  }

  if (clearDeadlockIfCooldownExpired(now)) {
    return {
      deadlocked: true,
      tripped: false,
      reasons: registry.reason ? [registry.reason] : ["DEADLOCK_COOLDOWN"],
      target: registry.target ?? undefined,
    };
  }

  return {
    deadlocked: false,
    tripped: false,
    reasons: [],
  };
}

/** Secure admin cool-down — clears deadlock registry when key matches. */
export function adminResetDeadlock(
  adminKey: string,
  expectedKey = "",
): AdminResetResult {
  const resolvedKey =
    expectedKey ||
    (typeof process !== "undefined"
      ? process.env.ADMIN_RESET_KEY ?? ""
      : "");

  if (!resolvedKey || adminKey !== resolvedKey) {
    return { ok: false, message: "INVALID_ADMIN_KEY" };
  }

  registry = {
    active: false,
    reason: null,
    target: null,
    resetAt: new Date().toISOString(),
    lockedUntil: null,
  };

  return { ok: true, message: "DEADLOCK_RESET" };
}

/** Test-only registry reset */
export function __resetDeadlockRegistryForTests(): void {
  registry = {
    active: false,
    reason: null,
    target: null,
    resetAt: null,
    lockedUntil: null,
  };
}

/** Capital leak threshold USD — env override with 5% jitter at read time. */
export function readCapitalLeakThresholdUsd(): number {
  const base = readEnvNumber("CAPITAL_LEAK_THRESHOLD_USD", 0.01);
  return applyThresholdJitter(base, readEnvNumber("CAPITAL_LEAK_JITTER_PCT", 0.05));
}

export const PENDING_ORDER_STAGNATION_MS = 1500;

function readEnvNumber(key: string, fallback: number): number {
  const raw =
    typeof process !== "undefined" ? process.env[key] : undefined;
  const parsed = parseFloat(raw ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Apply ±jitterPct noise to obfuscate secret thresholds. */
export function applyThresholdJitter(base: number, jitterPct = 0.05): number {
  const factor = 1 + (Math.random() * 2 - 1) * jitterPct;
  return base * factor;
}

export interface CapitalLeakInput {
  expectedBalanceUsd: number;
  observedBalanceUsd: number;
  accountedDeltaUsd?: number;
  thresholdUsd?: number;
}

export interface CapitalLeakResult {
  leaked: boolean;
  leakAmountUsd: number;
  haltText: string;
  forceSystemPaused: boolean;
}

/** Balance leak sensor — halt on unaccounted delta > threshold. */
export function assertZeroCapitalLeak(input: CapitalLeakInput): CapitalLeakResult {
  const threshold = input.thresholdUsd ?? readCapitalLeakThresholdUsd();
  const explained = input.accountedDeltaUsd ?? 0;
  const rawDelta = input.observedBalanceUsd - input.expectedBalanceUsd;
  const unaccounted = Math.abs(rawDelta - explained);
  const leaked = unaccounted > threshold;

  if (!leaked) {
    return {
      leaked: false,
      leakAmountUsd: unaccounted,
      haltText: "",
      forceSystemPaused: false,
    };
  }

  const displayAmount = Math.max(threshold, unaccounted);
  return {
    leaked: true,
    leakAmountUsd: unaccounted,
    haltText: `[ $${displayAmount.toFixed(2)} UNEXPLAINED LEAK | System Halted ]`,
    forceSystemPaused: true,
  };
}

export interface PendingOrderState {
  orderId: string;
  pendingSince: number;
  acknowledged?: boolean;
}

export interface StagnationResult {
  stagnated: boolean;
  canceledOrderIds: string[];
  locked: boolean;
  reason?: string;
}

/** Force 1500ms timeout on unacknowledged pending orders — auto-cancel + lock. */
export function evaluatePendingOrderStagnation(
  orders: PendingOrderState[],
  now = Date.now(),
): StagnationResult {
  const stale = orders.filter(
    (o) => !o.acknowledged && now - o.pendingSince >= PENDING_ORDER_STAGNATION_MS,
  );

  if (stale.length === 0) {
    return { stagnated: false, canceledOrderIds: [], locked: false };
  }

  return {
    stagnated: true,
    canceledOrderIds: stale.map((o) => o.orderId),
    locked: true,
    reason: `PENDING_STAGNATION_${PENDING_ORDER_STAGNATION_MS}ms`,
  };
}

export interface SlRejectionFallbackInput {
  rejected: boolean;
  rejectionReason?: string;
  payload: import("./session-key-adapter").SessionKeyOrderPayload;
}

export interface SlRejectionFallbackResult {
  fallbackToIoc: boolean;
  iocPayload?: import("./session-key-adapter").SessionKeyOrderPayload;
  reason?: string;
}

const SL_REJECTION_PATTERN = /POST.?ONLY|DEPTH|SL_REJECT|REJECT/i;

/** SL rejection → instant Market IOC sweep fallback. */
export function resolveSlRejectionFallback(
  input: SlRejectionFallbackInput,
): SlRejectionFallbackResult {
  if (!input.rejected) {
    return { fallbackToIoc: false };
  }

  const reason = input.rejectionReason ?? "";
  if (!SL_REJECTION_PATTERN.test(reason)) {
    return { fallbackToIoc: false, reason };
  }

  return {
    fallbackToIoc: true,
    iocPayload: {
      ...input.payload,
      orderType: { limit: { tif: "Ioc" } },
    },
    reason: "SL_IOC_SWEEP_FALLBACK",
  };
}
