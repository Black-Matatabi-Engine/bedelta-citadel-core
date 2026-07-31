export enum DonDonMood {
  WALLET_NOT_LINKED = "WALLET_NOT_LINKED",
  SEARCHING = "SEARCHING",
  DEFENSIVE = "DEFENSIVE",
  ROOTSHIELD_ACTIVE = "ROOTSHIELD_ACTIVE",
  ALERT = "ALERT",
  RAGE_FOMO = "RAGE_FOMO",
  VICTORY = "VICTORY",
  TIER_UPGRADE = "TIER_UPGRADE",
  ADMIN_MODE = "ADMIN_MODE",
  SYSTEM_PAUSED = "SYSTEM_PAUSED",
}

export type DonDonControlMode = "MANUAL" | "SEMI_AUTO" | "FULL_AUTO";

export type SystemTakeoverReason =
  | "EMERGENCY_SL_PROTECTION"
  | "FOMO_BEHAVIOR_LOCK"
  | "NONE";

export interface SystemTakeover {
  isOverridden: boolean;
  reason: SystemTakeoverReason;
}

export interface DonDonState {
  mood: DonDonMood;
  /** High-contrast hex color code */
  colorHue: string;
  statusText: string;
  /** Dynamic Max SL = Balance × 1% + $100 */
  dynamicMaxSL: number;
  /** Primary + secondary HUD debug line (always populated) */
  overheadHUDText: string;
  /** 0–100 — soil density */
  soilScore: number;
  /** 0–100 — ceiling pressure */
  ceilingScore: number;
  /** 0–100 — market speed */
  volatilityIndex: number;
  /** 0–100 — protection strength */
  shieldHealth: number;
  /** 0–100 — search status */
  scanProgress: number;
  controlMode: DonDonControlMode;
  /** 0–1500ms hold-to-confirm friction (MANUAL mode) */
  manualHoldProgressMs: number;
  /** Physical anti-FOMO latch — true when hold complete or non-manual mode */
  isSafetyLatchUnlocked: boolean;
  systemTakeover: SystemTakeover;
  /** Numbers-first takeover banner (empty when reason is NONE) */
  takeoverHUDText: string;
  /** Action-reaction dynamic shield banner (null when inactive) */
  dynamicShieldText: string | null;
  /** Balance leak halt banner (null when no leak) */
  leakHaltText: string | null;
}

/** CRI / circuit-breaker signals layered on authoritative SystemState */
export interface DonDonSystemSignals {
  walletLinked?: boolean;
  circuitBreakerTriggered?: boolean;
  isFOMORisk?: boolean;
  inSoilZone?: boolean;
  rootShieldActive?: boolean;
  tierUpgrade?: boolean;
  adminMode?: boolean;
  systemPaused?: boolean;
  /** DemoHub / test harness — force mood without re-deriving signals */
  moodOverride?: DonDonMood;
  soilScore?: number;
  ceilingScore?: number;
  volatility?: number;
  takeProfitTriggered?: boolean;
  /** Scale-in fill ratio 0.0–1.0 — scales dynamic Max SL allocation */
  positionSizeRatio?: number;
  controlMode?: DonDonControlMode;
  manualHoldProgressMs?: number;
  /** Remaining deadlock cool-down seconds (RAGE_FOMO hysteresis) */
  deadlockCooldownSec?: number;
  /** Remaining session key TTL seconds */
  sessionExpirySeconds?: number;
  /** FULL_AUTO emergency kill-switch armed */
  killSwitchActive?: boolean;
  /** Unrealized loss USD — emergency SL pierce probe */
  unrealizedLossUsd?: number;
  /** Recent user action timestamps (behavioral FOMO probe) */
  userActionTimestamps?: number[];
  /** Cross-venue slippage ratio for takeover probe */
  slippageRatio?: number;
  /** Evaluation clock override (tests) */
  now?: number;
  /** Capital leak probe — expected vs observed balance */
  expectedBalanceUsd?: number;
  observedBalanceUsd?: number;
  accountedDeltaUsd?: number;
  /** HTTP 429 rate-limit probe */
  http429Blocked?: boolean;
  /** Last user activity timestamp (idle / novice probe) */
  lastActivityAt?: number;
  /** Force novice guided shield HUD */
  isNovice?: boolean;
}

export type DonDonSystemInput = import("../services/systemState").SystemState &
  DonDonSystemSignals;

/** Compile-time exhaustiveness guard for DonDonMood switch fallbacks */
export function assertExhaustiveDonDonMood(value: never): never {
  throw new Error(`Unhandled DonDonMood: ${String(value)}`);
}

/** All DemoHub switcher moods (ordered) */
export const DEMO_HUB_MOODS: readonly DonDonMood[] = [
  DonDonMood.WALLET_NOT_LINKED,
  DonDonMood.SEARCHING,
  DonDonMood.DEFENSIVE,
  DonDonMood.ROOTSHIELD_ACTIVE,
  DonDonMood.ALERT,
  DonDonMood.RAGE_FOMO,
  DonDonMood.VICTORY,
  DonDonMood.TIER_UPGRADE,
  DonDonMood.ADMIN_MODE,
  DonDonMood.SYSTEM_PAUSED,
] as const;

export const DON_DON_CONTROL_MODES: readonly DonDonControlMode[] = [
  "MANUAL",
  "SEMI_AUTO",
  "FULL_AUTO",
] as const;
