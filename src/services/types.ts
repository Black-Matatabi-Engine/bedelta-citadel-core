/**
 * Santenboku v0.8 — shared service interfaces.
 * Strike alpha parameters are typed here but injected at runtime (never hardcoded secrets).
 */

import type { Root17CheckResult, Root17DailyState } from "../v2/services/root17-daily";
import type { RootProtectionInput, SoilResistanceInput, SoilResistanceResult } from "./risk-control";

// ---------------------------------------------------------------------------
// Pop-culture tactical log aliases (annotation only — see docs/POPCULTURE_TACTICS.md)
// ---------------------------------------------------------------------------

/** Internal execution states — authoritative; never renamed for metaphors */
export type TacticalInternalState =
  | "KUNG_FU_MICRO_EXEC"
  | "SANTENBOKU_STRIKE"
  | "R20_LOCKED"
  | "R17_LOCKED"
  | "SYSTEM_ROLLBACK"
  | "ORDER_66_CANCEL_ALL"
  | "INFINITY_GAUNTLET_ARMED"
  | "MOSS_TINDER_LOCK"
  | "SOIL_RESISTANCE_PASS"
  | "SOIL_RESISTANCE_TRIP"
  | "FLUX_SNAPSHOT_SAVED"
  | "DONDON_4D_POCKET"
  | "NEN_GYO_SENSING"
  | "DOMAIN_EXPANSION_ZONE"
  | "SHADOW_FLEET_ARISE"
  | "NEN_ZETSU_CLOAK"
  | "NEN_VOW_LIMITATION"
  | "AFTERIMAGE_FLEET"
  | "IMBALANCE_RADAR_ACTIVE"
  | "DYNAMIC_SL_ENFORCED"
  | "ANTI_MEV_SHIELD"
  | "TRUTH_GATE_AUDIT"
  | "DONDUM_HUD_ACTIVE"
  | "SYSTEM_STATE_STABLE"
  | "FLEET_HEALTH_CHECK";

/** Operator-facing pop-culture log tags — primary alias per state + optional alternates */
export type TacticalLogAlias =
  | "KUNG_FU_NO_FORM_STRIKE"
  | "FLURRY_RUSH_STRIKE"
  | "R20_LOCKED"
  | "R17_LOCKED"
  | "FLUX_SNAPSHOT_RESTORED"
  | "FLUX_SNAPSHOT_SAVED"
  | "ORDER_66_TRIGGERED"
  | "INFINITY_GAUNTLET_ARMED"
  | "MOSS_TINDER_LOCK"
  | "POWER_GEM_TRIPPED"
  | "DONDON_4D_POCKET_ACTIVE"
  | "NEN_GYO_SENSING"
  | "DOMAIN_EXPANSION_SOIL"
  | "SHADOW_ARRAISE_FLEET"
  | "NEN_ZETSU_CLOAK"
  | "NEN_VOW_LIMITATION"
  | "AFTERIMAGE_FLEET_DECOY"
  | "FURINKAZAN_MOUNTAIN"
  | "FURINKAZAN_WIND"
  | "FURINKAZAN_FOREST"
  | "FURINKAZAN_FIRE"
  | "DUGU_NINE_SWORDS_STRIKE"
  | "NOAH_ARK_PROTECT"
  | "EIGHT_FORMATIONS_SCAN"
  | "ARK_SAFETY_PROTOCOL"
  | "TEN_COMMANDMENTS_SL"
  | "ZEN_IMPERMANENCE_GUARD"
  | "DIAMOND_BODY_LOCK"
  | "JIUYANG_ABSORB"
  | "SEVEN_STARS_FLEET"
  | "EIGHT_FORMATIONS_MATRIX"
  | "TURTLE_SHIP_SHIELD"
  | "EMPTY_FORT_DECOY"
  | "JIUYANG_IMPACT_ABSORB"
  | "TURTLE_SHIP_PROTECT"
  | "GATE_OF_TRUTH_EQUAL_EXCHANGE"
  | "DONDUM_MARKET_OVERVIEW"
  | "FOMO_MARKET_NOISE_MUTED"
  | "BFI_TENSEGRITY_BALANCE"
  | "SATOSHI_GENESIS_COVENANT"
  | "PARADIGM_SHIFT_EDGE_SYNC"
  | "JOBS_SAY_NO_TO_FOMO"
  | "MJ_MOONWALK_ANTI_SLIPPAGE"
  | "POTTER_UNBREAKABLE_VOW"
  | "POTTER_INVISIBILITY_CLOAK"
  | "SHAKESPEARE_TO_BE_GATE"
  | "SYSTEM_STATE_STABLE"
  | "OVERCOOKED_FIRE_EXTINGUISHER"
  | "BYZANTINE_FLEET_CONSENSUS"
  | "COMMONS_PROTECTION_ACTIVE"
  | "INVISIBLE_HAND_EQUILIBRIUM"
  | "CYPHERPUNK_MANIFESTO_SHIELD"
  | "RICH_DAD_ASSET_CASHFLOW"
  | "MONEY_AND_YOU_INTEGRITY"
  | "FLEET_HEALTH_CHECK"
  | "LUBAN_MORTISE_TENON_LOCK"
  | "LUBAN_RULER_BOUNDS_CHECK"
  | "MBTI_INTJ_ARCHITECT_LOGIC"
  | "DISC_COMPLIANCE_EXECUTION"
  | "HUMAN_DESIGN_AUTHORITY_GATE"
  | "FIVE_ELEMENTS_EQUILIBRIUM"
  | "ZIWEI_MUTATION_RISK_SHIELD"
  | "TIEBAN_NUMERICAL_PRECISION"
  | "NUWA_FIVE_COLOR_REPAIR"
  | "ATLANTIS_ORICHALCUM_SHIELD"
  | "INCA_QUIPU_IMMUTABLE_LOG"
  | "DINOSAUR_KT_EXTINCTION_SHIELD"
  | "HOHMANN_TRANSFER_WINDOW_EXEC"
  | "HAWKING_SINGULARITY_LOCK"
  | "ICHING_DYNAMIC_PHASE_CONTROL"
  | "BOTTOMLINE_RISK_PREVENTION"
  | "CAPITAL_EFFICIENCY_STRIKE"
  | "FENCING_MICROSECOND_REACTION_STRIKE"
  | "NASH_EQUILIBRIUM_MEV_COUNTER"
  | "FRACTIONAL_KELLY_CAPITAL_SIZING"
  | "SCHRODINGER_WAVE_STATE_COLLAPSE"
  | "QUANTUM_TUNNELING_VOLATILITY_TRIP";

/** Optional structured log annotation — does not affect gate verdicts */
export interface TacticalLogAnnotation {
  tacticalAlias: TacticalLogAlias;
  tacticalState: TacticalInternalState;
}

// ---------------------------------------------------------------------------
// Strike / Coach interfaces
// ---------------------------------------------------------------------------

/** Runtime-injectable strike thresholds — sourced from env / Wrangler vars, not the repo */
export interface StrikeAlphaConfig {
  /** Minimum ask/bid imbalance ratio to qualify as STRIKE (e.g. 1.35 = 35% skew) */
  imbalanceRatioMin: number;
  /** Bid–ask micro-spread floor in basis points — collapse below = liquidity vacuum */
  microSpreadCollapseBps: number;
  /** Probe notional (USD) for audible sensing orders before a sized strike */
  sensingProbeNotionalUsd: number;
  /** Cooldown between sensing probes (ms) */
  sensingCooldownMs: number;
  /** Absolute funding rate (bps) that triggers F1 pit-stop rebalance consideration */
  pitStopFundingBps: number;
  /** Max holding duration (ms) before pit-stop rebalance consideration */
  pitStopMaxHoldMs: number;
  /** Enable multi-wallet fleet co-op topology */
  fleetMode: boolean;
}

/** Partial env bag for resolving StrikeAlphaConfig (Workers bindings or test fixtures) */
export interface StrikeAlphaEnv {
  STRIKE_IMBALANCE_RATIO_MIN?: string;
  STRIKE_MICRO_SPREAD_COLLAPSE_BPS?: string;
  STRIKE_SENSING_PROBE_USD?: string;
  STRIKE_SENSING_COOLDOWN_MS?: string;
  STRIKE_PITSTOP_FUNDING_BPS?: string;
  STRIKE_PITSTOP_MAX_HOLD_MS?: string;
  STRIKE_FLEET_MODE?: string;
}

export type ThreeEyePhase = "LEFT_EYE" | "RIGHT_EYE" | "THIRD_EYE" | "BLOCKED";

export type LeftEyeVerdict = "PASS" | "FAIL";

export type RightEyeVerdict = "STANDBY" | "STRIKE";

export interface OrderbookImbalanceSnapshot {
  symbol: string;
  askDepthUsd: number;
  bidDepthUsd: number;
  /** askDepth / bidDepth when bid > 0 */
  imbalanceRatio: number;
  microSpreadBps: number;
  at: string;
}

export interface LeftEyeInput {
  soil: SoilResistanceInput;
  root17: {
    accountEquityUsd: number;
    state: Root17DailyState;
    now?: Date;
  };
  root20: RootProtectionInput;
}

export interface LeftEyeResult {
  verdict: LeftEyeVerdict;
  phase: ThreeEyePhase;
  soil: SoilResistanceResult;
  root17: Root17CheckResult;
  /** Set when vineWrapProtection would trip (caller may catch RiskLimitExceeded / HardlockError) */
  root20Blocked: boolean;
  root20Reason?: string;
  reasons: string[];
}

export interface RightEyeInput {
  snapshot: OrderbookImbalanceSnapshot;
  config: StrikeAlphaConfig;
}

export interface RightEyeResult {
  verdict: RightEyeVerdict;
  phase: ThreeEyePhase;
  imbalanceStrike: boolean;
  microSpreadCollapse: boolean;
  reasons: string[];
}

export interface StrikeGateInput {
  left: LeftEyeInput;
  right: RightEyeInput;
}

export interface StrikeGateResult {
  phase: ThreeEyePhase;
  armed: boolean;
  left: LeftEyeResult;
  right: RightEyeResult | null;
  label: string;
}

/** Fleet wallet roles for co-op execution (addresses supplied at runtime only) */
export type FleetRole = "attacker" | "hedger" | "hl_lend_vault";

export interface FleetWalletSlot {
  role: FleetRole;
  /** Opaque wallet id — never a private key */
  walletId: string;
  enabled: boolean;
}

export interface SantenbokuStrikeEngine {
  readonly config: StrikeAlphaConfig;
  evaluateLeftEye(input: LeftEyeInput): LeftEyeResult;
  evaluateRightEye(input: RightEyeInput): RightEyeResult;
  evaluateStrikeGate(input: StrikeGateInput): StrikeGateResult;
}

/** Runtime-injectable coach thresholds — sourced from env / Wrangler vars */
export interface CoachAlphaConfig {
  /** VIX level that elevates coach oversight (default 22) */
  vixSpikeThreshold: number;
  /** DVOL level that elevates coach oversight (default 55) */
  dvolSpikeThreshold: number;
  /** Venue round-trip delay (ms) before routing concern (default 2500) */
  venueDelayMsThreshold: number;
  /** Attacker margin usage % that triggers wallet substitution (default 80) */
  marginUsageSubstitutionPct: number;
  /** Minimum edge (bps) required to avoid substitution on long holds */
  minEdgeBps: number;
  /** Fleet aggregate daily loss multiplier vs single-wallet cap before R17 Red Card */
  fleetDailyLossMultiplier: number;
}

/** Partial env bag for resolving CoachAlphaConfig */
export interface CoachAlphaEnv {
  COACH_VIX_SPIKE_THRESHOLD?: string;
  COACH_DVOL_SPIKE_THRESHOLD?: string;
  COACH_VENUE_DELAY_MS?: string;
  COACH_MARGIN_SUBSTITUTION_PCT?: string;
  COACH_MIN_EDGE_BPS?: string;
  COACH_FLEET_DAILY_LOSS_MULTIPLIER?: string;
}

export type MacroRegimeLevel = "CLEAR" | "ELEVATED" | "CRITICAL";

export type MevThreatLevel = "clear" | "elevated" | "critical";

export interface MacroRegimeSnapshot {
  vix: number;
  dvol: number;
  macroBlocking: boolean;
  venueDelayMs: number;
  mevThreatLevel: MevThreatLevel;
  at: string;
}

export interface CoachRegimeResult {
  level: MacroRegimeLevel;
  freezeSubstitutions: boolean;
  extendSensingCooldown: boolean;
  reasons: string[];
}

export interface FleetWalletMetrics {
  walletId: string;
  role: FleetRole;
  marginUsagePct: number;
  holdingDurationMs: number;
  /** Positive = favorable edge; negative = decaying */
  edgeBps: number;
  active: boolean;
}

export type CoachSubstitutionAction = "substitute" | "hold" | "bench";

export interface CoachSubstitutionDecision {
  action: CoachSubstitutionAction;
  fromWalletId: string;
  toWalletId?: string;
  reason: string;
}

/** Structured soil-resistance log row for post-trade review */
export interface SoilResistanceLogEntry {
  symbol: string;
  tripped: boolean;
  crossVenueSlippage: number;
  reasons: string[];
  timestamp: string;
}

export interface FleetAggregateMetrics {
  accountEquityUsd: number;
  cumulativeDailyLossUsd: number;
  dailySlCount: number;
  fleetEstimatedLossUsd: number;
  cri: number;
  maxDailyLossUsd: number;
  effectiveMaxSlUsd: number;
}

export type RedCardTarget = "R17" | "R20";

export interface CoachRedCardDecision {
  issued: boolean;
  target: RedCardTarget | null;
  reason: string;
}

export interface SantenbokuCoachEngine {
  readonly config: CoachAlphaConfig;
  evaluateMacroRegime(snapshot: MacroRegimeSnapshot): CoachRegimeResult;
  evaluateSubstitution(
    fleet: FleetWalletMetrics[],
    pitStopMaxHoldMs: number,
  ): CoachSubstitutionDecision[];
  calibrateStrikeThresholds(
    logs: SoilResistanceLogEntry[],
    current: StrikeAlphaConfig,
  ): Partial<StrikeAlphaConfig>;
  evaluateRedCard(metrics: FleetAggregateMetrics): CoachRedCardDecision;
}
