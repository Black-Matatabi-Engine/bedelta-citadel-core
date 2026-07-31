/**
 * 3-Mode trade pipeline helpers + Dynamic Effective Max SL enforcement.
 * Pure functions — mirrored in the HTML dashboard console for live UX.
 */

import { STATUS_DICTIONARY } from "../../config/statusDictionary";
import { ROOT8_SLIPPAGE_LOCK_LABEL, BRAND_DELTA_SYMBOL } from "../../config/constants";
import {
  computeEffectiveMaxSlUsd,
  computeOrderAwareMaxSlUsd,
  DEFAULT_ACCOUNT_EQUITY_USD,
  sanitizeAccountEquityUsd,
} from "../../services/effective-max-sl";
import {
  checkSoilResistance,
  MAX_SLIPPAGE,
} from "../../services/risk-control";
import { isToxicModeTripped } from "./risk-engine";

export { MAX_SLIPPAGE, checkSoilResistance } from "../../services/risk-control";

export {
  computeEffectiveMaxSlUsd,
  computeOrderAwareMaxSlUsd,
  computeDailyLossCapUsd,
  DEFAULT_ACCOUNT_EQUITY_USD,
  dynamicMaxSlPct,
  dynamicMaxSlRatio,
  formatDynSlLockTag,
  sanitizeAccountEquityUsd,
} from "../../services/effective-max-sl";
export {
  isToxicModeTripped,
  TOXIC_MODE_COOLDOWN_MS,
  TOXIC_MODE_THRESHOLD,
  calculateRiskScore,
  resolveRiskIndexBand,
  formatRiskIndexLabel,
} from "./risk-engine";

/** @deprecated Use computeEffectiveMaxSlUsd(DEFAULT_ACCOUNT_EQUITY_USD) */
export const MAX_SL_USD = computeEffectiveMaxSlUsd(DEFAULT_ACCOUNT_EQUITY_USD);

export const DEFAULT_CAPITAL_USD = DEFAULT_ACCOUNT_EQUITY_USD;
export const ORDER_SIZE_MIN_USD = 1_000 as const;
export const ORDER_SIZE_MAX_USD = 100_000 as const;

/** Top-bar tactical modes (Shield / Tactical / Flash). */
export type TradeMode = "SHIELD" | "TACTICAL" | "FLASH";

/** @deprecated Legacy aliases — prefer TradeMode */
export type LegacyTradeMode = "BEGINNER" | "INTERMEDIATE" | "EXPERT";

export function normalizeTradeMode(mode: string | null | undefined): TradeMode {
  const m = String(mode || "").toUpperCase();
  if (m === "TACTICAL" || m === "INTERMEDIATE") return "TACTICAL";
  if (m === "FLASH" || m === "EXPERT") return "FLASH";
  return "SHIELD";
}

export type AttackLockReason =
  | null
  | "NO_TARGET"
  | "STEP3_LOCKED"
  | "INSUFFICIENT_MARGIN"
  | "SOIL_EXCEEDS_MAX_SL"
  | "ROOT8_SLIPPAGE_EXCEEDED"
  | "ROOT17_DAILY_LIMIT"
  | "EXECUTION_DISABLED"
  | "TOXIC_MODE"
  | "AUDIT_READ_ONLY";

/** Sanitize capital — empty / NaN / <= 0 falls back to $10,000 (no div-by-zero). */
export function sanitizeCapitalUsd(raw: unknown): number {
  return sanitizeAccountEquityUsd(raw);
}

/** Slider max = capital, hard-capped into [$1k, $100k]. */
export function resolveOrderSizeMaxUsd(capitalUsd: number): number {
  const capital = sanitizeCapitalUsd(capitalUsd);
  return Math.max(
    ORDER_SIZE_MIN_USD,
    Math.min(ORDER_SIZE_MAX_USD, capital),
  );
}

/** Clamp order size into [min, sliderMax(capital)]. */
export function clampOrderSizeUsd(
  orderSizeUsd: number,
  capitalUsd: number,
): number {
  const max = resolveOrderSizeMaxUsd(capitalUsd);
  const n = Number(orderSizeUsd);
  if (!Number.isFinite(n) || n < ORDER_SIZE_MIN_USD) return ORDER_SIZE_MIN_USD;
  return Math.min(Math.max(n, ORDER_SIZE_MIN_USD), max);
}

export function estimateSlipLossUsd(
  orderSizeUsd: number,
  slipRatio: number,
): number {
  return Math.max(0, orderSizeUsd) * Math.max(0, slipRatio);
}

export function estimateFrictionLossUsd(
  orderSizeUsd: number,
  frictionRate: number,
  fixedCostUsd: number,
): number {
  return Math.max(0, orderSizeUsd) * Math.max(0, frictionRate) + Math.max(0, fixedCostUsd);
}

/**
 * True when expected slippage (and optional market friction) exceeds the dynamic Max SL boundary.
 */
export function exceedsMaxRiskBoundary(input: {
  orderSizeUsd: number;
  slipRatio: number;
  accountEquityUsd?: number;
  frictionRate?: number;
  fixedCostUsd?: number;
  includeFriction?: boolean;
}): boolean {
  const equity = sanitizeAccountEquityUsd(input.accountEquityUsd);
  const maxSl = computeOrderAwareMaxSlUsd(equity, input.orderSizeUsd, input.slipRatio);
  const slipLoss = estimateSlipLossUsd(input.orderSizeUsd, input.slipRatio);
  if (slipLoss > maxSl) return true;
  if (input.includeFriction) {
    const frictionLoss = estimateFrictionLossUsd(
      input.orderSizeUsd,
      input.frictionRate ?? 0,
      input.fixedCostUsd ?? 0,
    );
    if (frictionLoss > maxSl) return true;
  }
  return false;
}

/** Required margin notional (1x conservative — full order size). */
export function requiredMarginUsd(orderSizeUsd: number): number {
  return Math.max(0, Number(orderSizeUsd) || 0);
}

export function hasInsufficientMargin(
  withdrawableCollateral: number,
  requiredMargin: number,
): boolean {
  return withdrawableCollateral < requiredMargin;
}

export interface AutoGuardSnapshot {
  /** Mindset / DEFCON clear (no ALL-RED) */
  mindsetClear: boolean;
  /** VIX & DVOL within normal band */
  vixDvolNormal: boolean;
  /** Weak target injected into sniper console */
  targetLocked: boolean;
  /** Settlement countdown > 5 minutes */
  settlementClear: boolean;
  /** Soil resistance not exceeding dynamic Max SL risk */
  soilSafe: boolean;
}

export interface ModeGateInput {
  mode: TradeMode | LegacyTradeMode;
  /** Automated guard snapshot — no manual checkboxes */
  guards: AutoGuardSnapshot;
}

/** Step 3 unlock from automated guards. Flash bypasses survey. */
export function isStep3Unlocked(input: ModeGateInput): boolean {
  const mode = normalizeTradeMode(input.mode);
  const g = input.guards;
  if (mode === "FLASH") return true;
  if (mode === "TACTICAL") {
    return g.vixDvolNormal && g.settlementClear && g.soilSafe;
  }
  // SHIELD: full automated safety pipeline (mindset + target + risk trio)
  return (
    g.mindsetClear &&
    g.vixDvolNormal &&
    g.targetLocked &&
    g.settlementClear &&
    g.soilSafe
  );
}

export function formatAutoGuardBanner(
  mode: TradeMode | LegacyTradeMode,
  guards: AutoGuardSnapshot,
  accountEquityUsd: number = DEFAULT_ACCOUNT_EQUITY_USD,
): string {
  const m = normalizeTradeMode(mode);
  const unlocked = isStep3Unlocked({ mode: m, guards });
  const R = STATUS_DICTIONARY.ROOT_TAGS;
  const maxSlUsd = computeEffectiveMaxSlUsd(accountEquityUsd);
  if (m === "FLASH") {
    const flashLabel =
      R.FLASH_ACTIVE?.label || "[ ⚡ FLASH ACTIVE: SURVEY BYPASSED ]";
    const root1 = `[ R1: SL $${maxSlUsd.toFixed(0)} WELD ]`;
    const root8 = R.ROOT8_SLIPPAGE_BREAKER.ok;
    const direct = R.ROOT18_STEP3?.direct || "[ 🔓 STEP 3 DIRECT ACCESS 🎯 ]";
    return `${flashLabel} · ${root1} · ${root8} -> ${direct}`;
  }
  const vix = guards.vixDvolNormal ? R.ROOT5_VIX.pass : R.ROOT5_VIX.fail;
  const sett = guards.settlementClear
    ? R.ROOT10_SETTLEMENT.clear
    : R.ROOT10_SETTLEMENT.lockdown;
  const soil = guards.soilSafe ? R.ROOT3_SOIL.safe : R.ROOT3_SOIL.danger;
  const tail = unlocked ? R.ROOT18_STEP3.unlocked : R.ROOT18_STEP3.locked;
  return `${vix} · ${sett} · ${soil} -> ${tail}`;
}

export { ROOT8_SLIPPAGE_LOCK_LABEL };

/** Root 8 — HL soil resistance + 0.5% order slippage breaker (client attack path). */
export function resolveRoot8SlippageLock(input: {
  slipRatio: number;
  symbol?: string;
  hlSpot?: number;
  hlPerp?: number;
  dydxPerp?: number;
}): { locked: true; reason: "ROOT8_SLIPPAGE_EXCEEDED"; label: string } | null {
  const label =
    typeof ROOT8_SLIPPAGE_LOCK_LABEL !== "undefined"
      ? ROOT8_SLIPPAGE_LOCK_LABEL
      : "SLIPPAGE_LOCK";
  const symbol = String(input.symbol ?? "").trim();
  const hlSpot = Number(input.hlSpot);
  const hlPerp = Number(input.hlPerp);
  const dydxRaw = Number(input.dydxPerp);
  const dydxPerp =
    Number.isFinite(dydxRaw) && dydxRaw > 0 ? dydxRaw : 0;

  if (
    symbol &&
    Number.isFinite(hlSpot) &&
    Number.isFinite(hlPerp) &&
    hlSpot > 0 &&
    hlPerp > 0
  ) {
    const soil = checkSoilResistance({
      symbol,
      hlSpot,
      hlPerp,
      dydxPerp,
    });
    if (soil.tripped) {
      return {
        locked: true,
        reason: "ROOT8_SLIPPAGE_EXCEEDED",
        label,
      };
    }
  }
  if (input.slipRatio > MAX_SLIPPAGE) {
    return {
      locked: true,
      reason: "ROOT8_SLIPPAGE_EXCEEDED",
      label,
    };
  }
  return null;
}

export function resolveAttackLock(input: {
  hasTarget: boolean;
  step3Unlocked: boolean;
  withdrawableCollateral: number;
  orderSizeUsd: number;
  slipRatio: number;
  accountEquityUsd?: number;
  symbol?: string;
  hlSpot?: number;
  hlPerp?: number;
  dydxPerp?: number;
  root17Tripped?: boolean;
  executionDisabled?: boolean;
  riskScore?: number;
  toxicCooldownUntil?: number;
  auditReadOnly?: boolean;
  now?: number;
}): { locked: boolean; reason: AttackLockReason; label: string } {
  const now = input.now ?? Date.now();
  if (input.executionDisabled) {
    return {
      locked: true,
      reason: "EXECUTION_DISABLED",
      label: "LOCKED / EXECUTION DISABLED",
    };
  }
  const riskScore = input.riskScore ?? 0;
  const cooldownUntil = input.toxicCooldownUntil ?? 0;
  if (isToxicModeTripped(riskScore) || cooldownUntil > now) {
    const remainingSec =
      cooldownUntil > now ? Math.ceil((cooldownUntil - now) / 1000) : 0;
    const cooldownSuffix =
      remainingSec > 0 ? ` · COOLDOWN ${remainingSec}s` : "";
    return {
      locked: true,
      reason: "TOXIC_MODE",
      label: `[ TOXIC MODE TRIPPED · EXECUTION LOCKED${cooldownSuffix} ]`,
    };
  }
  if (input.auditReadOnly) {
    return {
      locked: true,
      reason: "AUDIT_READ_ONLY",
      label: "[ AUDIT READ-ONLY MODE · EXECUTION DISABLED ]",
    };
  }
  if (input.root17Tripped) {
    return {
      locked: true,
      reason: "ROOT17_DAILY_LIMIT",
      label: "[ ROOT 17: DAILY DRAWDOWN / SL CAP · ERROR 403 ]",
    };
  }
  if (!input.step3Unlocked) {
    return {
      locked: true,
      reason: "STEP3_LOCKED",
      label: "LOCKED / COMPLETE MODE GATES",
    };
  }
  if (!input.hasTarget) {
    return {
      locked: true,
      reason: "NO_TARGET",
      label: "ATTACK / EXECUTE ORDER",
    };
  }
  const required = requiredMarginUsd(input.orderSizeUsd);
  if (hasInsufficientMargin(input.withdrawableCollateral, required)) {
    return {
      locked: true,
      reason: "INSUFFICIENT_MARGIN",
      label: "INSUFFICIENT MARGIN",
    };
  }
  const root8Lock = resolveRoot8SlippageLock({
    slipRatio: input.slipRatio,
    symbol: input.symbol,
    hlSpot: input.hlSpot,
    hlPerp: input.hlPerp,
    dydxPerp: input.dydxPerp,
  });
  if (root8Lock) {
    return root8Lock;
  }
  const equity = sanitizeAccountEquityUsd(input.accountEquityUsd);
  const maxSl = computeOrderAwareMaxSlUsd(
    equity,
    input.orderSizeUsd,
    input.slipRatio,
  );
  if (
    exceedsMaxRiskBoundary({
      orderSizeUsd: input.orderSizeUsd,
      slipRatio: input.slipRatio,
      accountEquityUsd: equity,
    })
  ) {
    return {
      locked: true,
      reason: "SOIL_EXCEEDS_MAX_SL",
      label: `[ SOIL DANGER: EXCEEDS $${maxSl.toFixed(0)} RISK ]`,
    };
  }
  return {
    locked: false,
    reason: null,
    label: "ATTACK / EXECUTE ORDER",
  };
}

export type RootTelemetryStatus =
  | "ACTIVE"
  | "ENGAGED"
  | "READY"
  | "STANDBY"
  | "PASS"
  | "FAIL"
  | "TRIPPED";

export interface RootTelemetryRow {
  root: number;
  label: string;
  status: RootTelemetryStatus;
}

function dynamicMaxSlLabel(equity = DEFAULT_ACCOUNT_EQUITY_USD): string {
  return `$${computeEffectiveMaxSlUsd(equity).toFixed(0)}`;
}

function dynamicDailyCapLabel(equity = DEFAULT_ACCOUNT_EQUITY_USD): string {
  return `$${(computeEffectiveMaxSlUsd(equity) * 3).toFixed(0)}`;
}

/** Canonical 20-Root Defense Matrix telemetry labels for Demo Control Hub. */
export const ROOT_DEFENSE_TELEMETRY: ReadonlyArray<{
  root: number;
  label: string;
  defaultStatus: RootTelemetryStatus;
}> = [
  {
    root: 1,
    label: `Max Loss Weld (${dynamicMaxSlLabel()})`,
    defaultStatus: "ENGAGED",
  },
  { root: 2, label: "Geo Jurisdiction Lock", defaultStatus: "READY" },
  { root: 3, label: "checkSoilResistance()", defaultStatus: "ACTIVE" },
  { root: 4, label: "Close Spike Window", defaultStatus: "READY" },
  { root: 5, label: "VIX / DVOL Macro Fuse", defaultStatus: "ACTIVE" },
  {
    root: 6,
    label: "Beginner Cap Gate & Preset Modes",
    defaultStatus: "READY",
  },
  {
    root: 7,
    label: "Pre-Calculated Risk Boundary Lock",
    defaultStatus: "ENGAGED",
  },
  { root: 8, label: "Slippage Breaker (0.5%)", defaultStatus: "ACTIVE" },
  {
    root: 9,
    label: "Cross-Venue Yield Discrepancy",
    defaultStatus: "READY",
  },
  {
    root: 10,
    label: "Settlement Lockdown (<5m Window)",
    defaultStatus: "READY",
  },
  {
    root: 11,
    label: "Funding Extreme Simulation",
    defaultStatus: "READY",
  },
  {
    root: 12,
    label: `${BRAND_DELTA_SYMBOL}-Neutral Basis Arbitrage Shield`,
    defaultStatus: "STANDBY",
  },
  {
    root: 13,
    label: "Session & Address Auth Gatekeeper",
    defaultStatus: "ACTIVE",
  },
  {
    root: 14,
    label: "ClOID Anti-Replay & Deduplication",
    defaultStatus: "READY",
  },
  {
    root: 15,
    label: "Friction & Gas Cost Safeguard",
    defaultStatus: "READY",
  },
  {
    root: 16,
    label: "Order Depth-Impact Circuit Breaker",
    defaultStatus: "STANDBY",
  },
  {
    root: 17,
    label: `Daily Drawdown Cap (${dynamicDailyCapLabel()} · 3 SL/day)`,
    defaultStatus: "READY",
  },
  {
    root: 18,
    label: "Direct Access & Direct Bypass Circuit Lock",
    defaultStatus: "READY",
  },
  {
    root: 19,
    label: "ClOID Live Order Status & Execution Audit",
    defaultStatus: "ACTIVE",
  },
  { root: 20, label: "Post-Trade Review Closure", defaultStatus: "ACTIVE" },
];

/** Tier 1–4 root index ranges for Demo Control Hub telemetry grouping */
export const ROOT_TELEMETRY_TIER_ROOTS = {
  TIER1: [1, 2, 3, 4, 5, 6],
  TIER2: [7, 8, 9, 10, 11, 12],
  TIER3: [13, 14, 15, 16, 17, 18],
  TIER4: [19, 20],
} as const;

export function buildRootTelemetryRows(
  overrides: Partial<Record<number, RootTelemetryStatus>> = {},
): RootTelemetryRow[] {
  return ROOT_DEFENSE_TELEMETRY.map((row) => ({
    root: row.root,
    label: row.label,
    status: overrides[row.root] ?? row.defaultStatus,
  }));
}

/** CRI demo statuses mapped to telemetry badge labels — never returns undefined. */
export type RootCriDemoStatus = "PASS" | "WARN" | "TRIPPED";

export function resolveRootTelemetryDisplayStatus(
  row: {
    status?: RootTelemetryStatus;
    defaultStatus: RootTelemetryStatus;
  },
  criStatus?: RootCriDemoStatus,
): RootTelemetryStatus {
  if (criStatus === "TRIPPED") return "TRIPPED";
  if (criStatus === "WARN") return "ENGAGED";
  return row.status ?? row.defaultStatus ?? "PASS";
}

export type PostTradeExitKind = "Hit TP" | "Hit SL" | "Manual Exit";

export function formatPostTradeReviewLog(kind: PostTradeExitKind): string {
  return `Review: [ ${kind} ]`;
}
