import { BRAND_DELTA_SYMBOL } from "../config/constants";
import { computeEffectiveMaxSlUsd } from "./effective-max-sl";
import { evaluateSystemTakeover, assertZeroCapitalLeak } from "./rootProtectionService";
import {
  assertExhaustiveDonDonMood,
  DonDonMood,
  type DonDonControlMode,
  type DonDonState,
  type DonDonSystemInput,
} from "../types/dondon";

/** MANUAL hold-to-confirm friction duration (1.5s anti-FOMO) */
export const MANUAL_HOLD_CONFIRM_MS = 1500;

const MOOD_PALETTE: Record<DonDonMood, { colorHue: string; statusText: string }> = {
  [DonDonMood.WALLET_NOT_LINKED]: {
    colorHue: "#64748B",
    statusText: ":santen[boku | Wallet Not Linked",
  },
  [DonDonMood.SEARCHING]: {
    colorHue: "#10B981",
    statusText: ":santen[boku | Scanning Liquidity Slivers",
  },
  [DonDonMood.DEFENSIVE]: {
    colorHue: "#F59E0B",
    statusText: ":santen[boku | Soil Resistance Secured",
  },
  [DonDonMood.ROOTSHIELD_ACTIVE]: {
    colorHue: "#06B6D4",
    statusText: ":santen[boku | Root Shield Engaged",
  },
  [DonDonMood.ALERT]: {
    colorHue: "#EAB308",
    statusText: ":santen[boku | Ears Up — Volatility Spike",
  },
  [DonDonMood.RAGE_FOMO]: {
    colorHue: "#EF4444",
    statusText: ":santen[boku | Circuit Breaker — Rage FOMO",
  },
  [DonDonMood.VICTORY]: {
    colorHue: "#8B5CF6",
    statusText: ":santen[boku | Fish in Mouth — Take Profit",
  },
  [DonDonMood.TIER_UPGRADE]: {
    colorHue: "#FBBF24",
    statusText: ":santen[boku | Tier Upgrade — Root Expansion",
  },
  [DonDonMood.ADMIN_MODE]: {
    colorHue: "#3B82F6",
    statusText: ":santen[boku | Admin Mode — Operator Override",
  },
  [DonDonMood.SYSTEM_PAUSED]: {
    colorHue: "#94A3B8",
    statusText: ":santen[boku | System Paused — Vine Dormant",
  },
};

function clampIndex(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deriveSoilScore(systemState: DonDonSystemInput): number {
  return clampIndex(systemState.soilScore ?? systemState.currentCri);
}

function deriveCeilingScore(systemState: DonDonSystemInput): number {
  return clampIndex(systemState.ceilingScore ?? 100 - systemState.currentCri);
}

function deriveVolatilityIndex(systemState: DonDonSystemInput): number {
  return clampIndex(systemState.volatility ?? 0);
}

function computeDynamicMaxSlUsd(accountBalanceUsd: number): number {
  return computeEffectiveMaxSlUsd(accountBalanceUsd);
}

/** Scale dynamic Max SL by filled position ratio; capped at full account risk limit. */
export function calculateDynamicSL(
  accountBalanceUsd: number,
  positionSizeRatio = 1,
): number {
  const maxAccountRisk = computeDynamicMaxSlUsd(accountBalanceUsd);
  const ratio = Math.max(0, Math.min(1, positionSizeRatio));
  return Math.min(maxAccountRisk * ratio, maxAccountRisk);
}

export function clampManualHoldProgress(ms: number): number {
  return Math.max(0, Math.min(MANUAL_HOLD_CONFIRM_MS, ms));
}

export function advanceManualHoldProgress(
  currentMs: number,
  deltaMs: number,
): number {
  return clampManualHoldProgress(currentMs + deltaMs);
}

export function resolveSafetyLatchUnlocked(
  controlMode: DonDonControlMode,
  manualHoldProgressMs: number,
): boolean {
  if (controlMode === "MANUAL") {
    return manualHoldProgressMs >= MANUAL_HOLD_CONFIRM_MS;
  }
  return true;
}

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatSessionExpiryMmSs(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export interface OverheadHudContext {
  dynamicMaxSL: number;
  controlMode: DonDonControlMode;
  indexes: Pick<DonDonState, "soilScore" | "volatilityIndex" | "shieldHealth">;
  manualHoldProgressMs?: number;
  positionSizeRatio?: number;
  deadlockCooldownSec?: number;
  sessionExpirySeconds?: number;
  mood?: DonDonMood;
  killSwitchActive?: boolean;
}

function buildNumbersFirstPrefix(ctx: OverheadHudContext): string {
  if (
    ctx.sessionExpirySeconds !== undefined &&
    ctx.sessionExpirySeconds <= 300
  ) {
    return `[ ${formatSessionExpiryMmSs(ctx.sessionExpirySeconds)} EXPIRY | Re-sign Session Key ]`;
  }

  if (ctx.deadlockCooldownSec !== undefined && ctx.deadlockCooldownSec > 0) {
    return `[ ${ctx.deadlockCooldownSec}s COOLDOWN | Deadlock Active ]`;
  }

  if (
    ctx.mood === DonDonMood.ALERT ||
    ctx.indexes.volatilityIndex > 75
  ) {
    return `[ ${ctx.indexes.volatilityIndex}/100 VOLATILITY | Spike Active ]`;
  }

  const fillRatio = ctx.positionSizeRatio ?? 1;
  if (fillRatio < 1) {
    const pct = Math.round(fillRatio * 100);
    return `[ ${pct}% FILLED | Position ${BRAND_DELTA_SYMBOL} ]`;
  }

  switch (ctx.controlMode) {
    case "MANUAL": {
      const holdSec = (
        Math.min(MANUAL_HOLD_CONFIRM_MS, ctx.manualHoldProgressMs ?? 0) / 1000
      ).toFixed(1);
      return `[ ${holdSec}s HOLD | Manual Confirm ]`;
    }
    case "SEMI_AUTO":
      return `[ ${ctx.indexes.soilScore}/100 SOIL | Semi-Auto Shield ]`;
    case "FULL_AUTO":
      return `[ ${ctx.indexes.shieldHealth}% SHIELD | Full Automated ]`;
    default:
      return `[ ${ctx.indexes.shieldHealth}% SHIELD | Full Automated ]`;
  }
}

/** Numbers-first HUD primary + secondary lines (mode-aware). */
export function formatOverheadHudText(
  dynamicMaxSL: number,
  indexes: Pick<
    DonDonState,
    "soilScore" | "volatilityIndex" | "shieldHealth"
  >,
  options: Omit<OverheadHudContext, "dynamicMaxSL" | "indexes"> = {
    controlMode: "SEMI_AUTO",
  },
): string {
  const ctx: OverheadHudContext = {
    dynamicMaxSL,
    indexes,
    ...options,
  };

  const prefix = buildNumbersFirstPrefix(ctx);
  const sl = formatUsd(dynamicMaxSL);
  const tp = formatUsd(dynamicMaxSL * 2);

  const showKillSwitch =
    ctx.controlMode === "FULL_AUTO" &&
    ctx.killSwitchActive !== false &&
    ctx.deadlockCooldownSec === undefined &&
    ctx.sessionExpirySeconds === undefined &&
    ctx.mood !== DonDonMood.ALERT &&
    (ctx.positionSizeRatio ?? 1) >= 1;

  const primary = showKillSwitch
    ? `${prefix} -${sl} SL | Kill Switch Active`
    : `${prefix} -${sl} SL | +${tp} TP`;

  const secondary = `[ ${indexes.soilScore}/100 SOIL | ${indexes.volatilityIndex}/100 VOL | ${indexes.shieldHealth}% SHIELD ]`;
  return `${primary}\n${secondary}`;
}

export function parseOverheadHudLines(overheadHUDText: string): {
  primary: string;
  secondary: string;
} {
  const [primary = "", secondary = ""] = overheadHUDText.split("\n");
  return { primary, secondary };
}

function readShieldEnvNumber(key: string, fallback: number): number {
  const raw =
    typeof process !== "undefined" ? process.env[key] : undefined;
  const parsed = parseFloat(raw ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Env-backed shield thresholds (5% jitter applied at evaluation). */
export function readShieldActionRateLimit(): number {
  const base = readShieldEnvNumber("SHIELD_ACTION_RATE_LIMIT", 8);
  return applyShieldJitter(base);
}

export function readShieldIdleNoviceMs(): number {
  const base = readShieldEnvNumber("SHIELD_IDLE_NOVICE_MS", 180_000);
  return applyShieldJitter(base);
}

export function readShieldHttp429CooldownSec(): number {
  const base = readShieldEnvNumber("SHIELD_HTTP429_COOLDOWN_SEC", 120);
  return applyShieldJitter(base);
}

/** ±5% jitter on secret thresholds — anti reverse-engineering. */
export function applyShieldJitter(base: number, jitterPct = 0.05): number {
  const factor = 1 + (Math.random() * 2 - 1) * jitterPct;
  return base * factor;
}

export interface DynamicShieldInput {
  actionTimestamps?: number[];
  http429Blocked?: boolean;
  lastActivityAt?: number;
  isNovice?: boolean;
  now?: number;
}

export interface DynamicShieldResult {
  shieldHUDText: string | null;
  wsDisconnectSec: number;
  actionVelocityPerSec: number;
  isNoviceGuided: boolean;
  rateLimited: boolean;
}

export function formatHttp429ShieldText(): string {
  return "[ HTTP 429 BLOCKED | IP Cooldown Active ]";
}

export function formatNoviceGuidedShieldText(): string {
  return "[ 100% GUIDED | Dynamic Risk Shield ]";
}

/** Action-reaction dynamic shield — velocity, 429 backoff, novice idle HUD.
 * @theory Glosten & Milgrom (1985) — adverse selection / informed flow shielding.
 * @theory O'Hara (1995) — market microstructure rate-limit defense.
 */
export function evaluateDynamicShield(
  input: DynamicShieldInput,
): DynamicShieldResult {
  const now = input.now ?? Date.now();
  const windowMs = 1000;
  const recent = (input.actionTimestamps ?? []).filter(
    (ts) => ts >= now - windowMs && ts <= now,
  );
  const actionVelocityPerSec = recent.length;
  const rateLimit = readShieldActionRateLimit();

  if (input.http429Blocked) {
    const cooldownSec = Math.round(readShieldHttp429CooldownSec());
    return {
      shieldHUDText: formatHttp429ShieldText(),
      wsDisconnectSec: cooldownSec,
      actionVelocityPerSec,
      isNoviceGuided: false,
      rateLimited: true,
    };
  }

  const idleMs = input.lastActivityAt
    ? now - input.lastActivityAt
    : Number.POSITIVE_INFINITY;
  const noviceThreshold = readShieldIdleNoviceMs();
  const isNoviceGuided =
    input.isNovice === true || idleMs >= noviceThreshold;

  if (isNoviceGuided) {
    return {
      shieldHUDText: formatNoviceGuidedShieldText(),
      wsDisconnectSec: 0,
      actionVelocityPerSec,
      isNoviceGuided: true,
      rateLimited: actionVelocityPerSec > rateLimit,
    };
  }

  if (actionVelocityPerSec > rateLimit) {
    return {
      shieldHUDText: `[ ${actionVelocityPerSec}/s VELOCITY | Action Throttled ]`,
      wsDisconnectSec: 0,
      actionVelocityPerSec,
      isNoviceGuided: false,
      rateLimited: true,
    };
  }

  return {
    shieldHUDText: null,
    wsDisconnectSec: 0,
    actionVelocityPerSec,
    isNoviceGuided: false,
    rateLimited: false,
  };
}

function prependShieldBanner(baseText: string, banner: string | null): string {
  if (!banner) return baseText;
  const [primary = "", secondary = ""] = baseText.split("\n");
  return `${banner}\n${primary}${secondary ? `\n${secondary}` : ""}`;
}

function resolveMood(systemState: DonDonSystemInput): DonDonMood {
  if (systemState.moodOverride) {
    return systemState.moodOverride;
  }

  if (systemState.walletLinked === false) {
    return DonDonMood.WALLET_NOT_LINKED;
  }

  if (systemState.systemPaused) {
    return DonDonMood.SYSTEM_PAUSED;
  }

  if (systemState.adminMode) {
    return DonDonMood.ADMIN_MODE;
  }

  if (
    systemState.circuitBreakerTriggered ||
    systemState.isFOMORisk ||
    systemState.hardlock
  ) {
    return DonDonMood.RAGE_FOMO;
  }

  if (systemState.takeProfitTriggered) {
    return DonDonMood.VICTORY;
  }

  if (systemState.tierUpgrade) {
    return DonDonMood.TIER_UPGRADE;
  }

  if (systemState.rootShieldActive) {
    return DonDonMood.ROOTSHIELD_ACTIVE;
  }

  if (systemState.inSoilZone) {
    return DonDonMood.DEFENSIVE;
  }

  if ((systemState.volatility ?? 0) > 75) {
    return DonDonMood.ALERT;
  }

  return DonDonMood.SEARCHING;
}

function buildIndexes(
  mood: DonDonMood,
  systemState: DonDonSystemInput,
): Pick<
  DonDonState,
  "soilScore" | "ceilingScore" | "volatilityIndex" | "shieldHealth" | "scanProgress"
> {
  const soil = deriveSoilScore(systemState);
  const ceiling = deriveCeilingScore(systemState);
  const vol = deriveVolatilityIndex(systemState);
  const shieldFromCri = clampIndex(systemState.currentCri);

  switch (mood) {
    case DonDonMood.WALLET_NOT_LINKED:
      return {
        soilScore: 0,
        ceilingScore: 0,
        volatilityIndex: 0,
        shieldHealth: 0,
        scanProgress: 0,
      };
    case DonDonMood.SEARCHING:
      return {
        soilScore: soil,
        ceilingScore: ceiling,
        volatilityIndex: vol,
        shieldHealth: shieldFromCri,
        scanProgress: 100,
      };
    case DonDonMood.DEFENSIVE:
      return {
        soilScore: soil,
        ceilingScore: ceiling,
        volatilityIndex: vol,
        shieldHealth: shieldFromCri,
        scanProgress: clampIndex(systemState.currentCri),
      };
    case DonDonMood.ROOTSHIELD_ACTIVE:
      return {
        soilScore: soil,
        ceilingScore: ceiling,
        volatilityIndex: vol,
        shieldHealth: 100,
        scanProgress: 100,
      };
    case DonDonMood.ALERT:
      return {
        soilScore: soil,
        ceilingScore: ceiling,
        volatilityIndex: vol,
        shieldHealth: shieldFromCri,
        scanProgress: clampIndex(100 - vol),
      };
    case DonDonMood.RAGE_FOMO:
      return {
        soilScore: 0,
        ceilingScore: 100,
        volatilityIndex: clampIndex(Math.max(vol, 90)),
        shieldHealth: 0,
        scanProgress: 0,
      };
    case DonDonMood.VICTORY:
      return {
        soilScore: clampIndex(Math.max(soil, 85)),
        ceilingScore: 100,
        volatilityIndex: vol,
        shieldHealth: 100,
        scanProgress: 100,
      };
    case DonDonMood.TIER_UPGRADE:
      return {
        soilScore: clampIndex(Math.max(soil, 70)),
        ceilingScore: clampIndex(Math.min(ceiling, 40)),
        volatilityIndex: vol,
        shieldHealth: clampIndex(Math.max(shieldFromCri, 90)),
        scanProgress: 100,
      };
    case DonDonMood.ADMIN_MODE:
      return {
        soilScore: soil,
        ceilingScore: ceiling,
        volatilityIndex: vol,
        shieldHealth: 100,
        scanProgress: 100,
      };
    case DonDonMood.SYSTEM_PAUSED:
      return {
        soilScore: soil,
        ceilingScore: ceiling,
        volatilityIndex: 0,
        shieldHealth: clampIndex(shieldFromCri),
        scanProgress: 0,
      };
    default:
      return assertExhaustiveDonDonMood(mood);
  }
}

/** Map CRI + circuit breakers to DonDon HUD emotion state (pure).
 * @theory Kahneman & Tversky (1979) — loss-aversion mood mapping for operator HMI.
 * @see taiji-bagua.ts — resolveTaijiMode regime overlay.
 */
export function evaluateDonDonMood(systemState: DonDonSystemInput): DonDonState {
  const now = systemState.now ?? Date.now();
  const baseControlMode = systemState.controlMode ?? "SEMI_AUTO";
  const dynamicMaxSL = calculateDynamicSL(
    systemState.accountBalanceUsd,
    systemState.positionSizeRatio ?? 1,
  );

  const leak =
    systemState.expectedBalanceUsd !== undefined &&
    systemState.observedBalanceUsd !== undefined
      ? assertZeroCapitalLeak({
          expectedBalanceUsd: systemState.expectedBalanceUsd,
          observedBalanceUsd: systemState.observedBalanceUsd,
          accountedDeltaUsd: systemState.accountedDeltaUsd,
          thresholdUsd: 0.01,
        })
      : { leaked: false, leakAmountUsd: 0, haltText: "", forceSystemPaused: false };

  const dynamicShield = evaluateDynamicShield({
    actionTimestamps: systemState.userActionTimestamps,
    http429Blocked: systemState.http429Blocked,
    lastActivityAt: systemState.lastActivityAt,
    isNovice: systemState.isNovice,
    now,
  });

  const takeover = evaluateSystemTakeover({
    controlMode: baseControlMode,
    dynamicMaxSL,
    unrealizedLossUsd: systemState.unrealizedLossUsd,
    actionTimestamps: systemState.userActionTimestamps,
    slippageRatio: systemState.slippageRatio,
    now,
  });

  const effectiveState: DonDonSystemInput = {
    ...systemState,
    controlMode: takeover.effectiveControlMode,
    systemPaused: systemState.systemPaused || leak.forceSystemPaused,
    circuitBreakerTriggered:
      systemState.circuitBreakerTriggered || takeover.forceCircuitBreaker,
    deadlockCooldownSec:
      takeover.deadlockCooldownSec > 0
        ? takeover.deadlockCooldownSec
        : systemState.deadlockCooldownSec,
  };

  const mood = resolveMood(effectiveState);
  const palette = MOOD_PALETTE[mood];
  const indexes = buildIndexes(mood, effectiveState);
  const controlMode = takeover.effectiveControlMode;
  const manualHoldProgressMs = clampManualHoldProgress(
    systemState.manualHoldProgressMs ?? 0,
  );
  const isSafetyLatchUnlocked = resolveSafetyLatchUnlocked(
    controlMode,
    manualHoldProgressMs,
  );

  const secondaryIndexes = `[ ${indexes.soilScore}/100 SOIL | ${indexes.volatilityIndex}/100 VOL | ${indexes.shieldHealth}% SHIELD ]`;
  let overheadHUDText = takeover.systemTakeover.isOverridden
    ? `${takeover.takeoverHUDText}\n${secondaryIndexes}`
    : formatOverheadHudText(dynamicMaxSL, indexes, {
        controlMode,
        manualHoldProgressMs,
        positionSizeRatio: systemState.positionSizeRatio,
        deadlockCooldownSec: effectiveState.deadlockCooldownSec,
        sessionExpirySeconds: systemState.sessionExpirySeconds,
        mood,
        killSwitchActive: systemState.killSwitchActive,
      });

  if (leak.leaked) {
    overheadHUDText = `${leak.haltText}\n${secondaryIndexes}`;
  } else {
    overheadHUDText = prependShieldBanner(
      overheadHUDText,
      dynamicShield.shieldHUDText,
    );
  }

  return {
    mood,
    colorHue: palette.colorHue,
    statusText: `${systemState.currentCri} CRI · ${palette.statusText}`,
    dynamicMaxSL,
    overheadHUDText,
    controlMode,
    manualHoldProgressMs,
    isSafetyLatchUnlocked,
    systemTakeover: takeover.systemTakeover,
    takeoverHUDText: takeover.takeoverHUDText,
    dynamicShieldText: dynamicShield.shieldHUDText,
    leakHaltText: leak.leaked ? leak.haltText : null,
    ...indexes,
  };
}

export { DonDonMood, type DonDonState };
