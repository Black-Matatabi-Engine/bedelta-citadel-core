/**
 * Pop-culture tactical log aliases (film/game doctrine).
 * Annotation-only layer — maps to internal states without changing execution logic.
 * @see docs/POPCULTURE_TACTICS.md
 */

import type { TacticalInternalState, TacticalLogAlias } from "./types";

/** Canonical internal states used by risk / strike / coach pipelines */
export const TACTICAL_INTERNAL_STATES = [
  "KUNG_FU_MICRO_EXEC",
  "SANTENBOKU_STRIKE",
  "R20_LOCKED",
  "R17_LOCKED",
  "SYSTEM_ROLLBACK",
  "ORDER_66_CANCEL_ALL",
  "INFINITY_GAUNTLET_ARMED",
  "MOSS_TINDER_LOCK",
  "SOIL_RESISTANCE_PASS",
  "SOIL_RESISTANCE_TRIP",
  "FLUX_SNAPSHOT_SAVED",
  "DONDON_4D_POCKET",
  "NEN_GYO_SENSING",
  "DOMAIN_EXPANSION_ZONE",
  "SHADOW_FLEET_ARISE",
  "NEN_ZETSU_CLOAK",
  "NEN_VOW_LIMITATION",
  "AFTERIMAGE_FLEET",
  "IMBALANCE_RADAR_ACTIVE",
  "DYNAMIC_SL_ENFORCED",
  "ANTI_MEV_SHIELD",
  "TRUTH_GATE_AUDIT",
  "DONDUM_HUD_ACTIVE",
  "SYSTEM_STATE_STABLE",
  "FLEET_HEALTH_CHECK",
] as const satisfies readonly TacticalInternalState[];

/**
 * Primary alias per internal state — canonical default for structured logs.
 * Optional alternates live in TACTICAL_OPTIONAL_ALIASES (same underlying guard).
 */
export const TACTICAL_STATE_ALIASES: Readonly<
  Record<TacticalInternalState, TacticalLogAlias>
> = {
  KUNG_FU_MICRO_EXEC: "KUNG_FU_NO_FORM_STRIKE",
  SANTENBOKU_STRIKE: "FLURRY_RUSH_STRIKE",
  R20_LOCKED: "R20_LOCKED",
  R17_LOCKED: "R17_LOCKED",
  SYSTEM_ROLLBACK: "FLUX_SNAPSHOT_RESTORED",
  ORDER_66_CANCEL_ALL: "ORDER_66_TRIGGERED",
  INFINITY_GAUNTLET_ARMED: "INFINITY_GAUNTLET_ARMED",
  MOSS_TINDER_LOCK: "MOSS_TINDER_LOCK",
  SOIL_RESISTANCE_PASS: "INFINITY_GAUNTLET_ARMED",
  SOIL_RESISTANCE_TRIP: "POWER_GEM_TRIPPED",
  FLUX_SNAPSHOT_SAVED: "FLUX_SNAPSHOT_SAVED",
  DONDON_4D_POCKET: "DONDON_4D_POCKET_ACTIVE",
  NEN_GYO_SENSING: "NEN_GYO_SENSING",
  DOMAIN_EXPANSION_ZONE: "DOMAIN_EXPANSION_SOIL",
  SHADOW_FLEET_ARISE: "SHADOW_ARRAISE_FLEET",
  NEN_ZETSU_CLOAK: "NEN_ZETSU_CLOAK",
  NEN_VOW_LIMITATION: "NEN_VOW_LIMITATION",
  AFTERIMAGE_FLEET: "AFTERIMAGE_FLEET_DECOY",
  IMBALANCE_RADAR_ACTIVE: "EIGHT_FORMATIONS_SCAN",
  DYNAMIC_SL_ENFORCED: "TEN_COMMANDMENTS_SL",
  ANTI_MEV_SHIELD: "TURTLE_SHIP_PROTECT",
  TRUTH_GATE_AUDIT: "GATE_OF_TRUTH_EQUAL_EXCHANGE",
  DONDUM_HUD_ACTIVE: "DONDUM_MARKET_OVERVIEW",
  SYSTEM_STATE_STABLE: "SYSTEM_STATE_STABLE",
  FLEET_HEALTH_CHECK: "FLEET_HEALTH_CHECK",
};

/**
 * Optional annotation aliases — each maps to an existing internal state.
 * Active when `TACTICAL_LOG_METAPHORS=true` via resolveTacticalAlias(state, variant).
 */
export const TACTICAL_OPTIONAL_ALIASES: Readonly<
  Partial<Record<TacticalInternalState, readonly TacticalLogAlias[]>>
> = {
  R20_LOCKED: [
    "FURINKAZAN_MOUNTAIN",
    "DIAMOND_BODY_LOCK",
    "POTTER_INVISIBILITY_CLOAK",
    "OVERCOOKED_FIRE_EXTINGUISHER",
    "ZIWEI_MUTATION_RISK_SHIELD",
    "NUWA_FIVE_COLOR_REPAIR",
    "HAWKING_SINGULARITY_LOCK",
    "BOTTOMLINE_RISK_PREVENTION",
  ],
  SANTENBOKU_STRIKE: ["DUGU_NINE_SWORDS_STRIKE", "FURINKAZAN_WIND"],
  KUNG_FU_MICRO_EXEC: ["ZEN_IMPERMANENCE_GUARD", "FURINKAZAN_FIRE"],
  SOIL_RESISTANCE_PASS: ["FURINKAZAN_FOREST"],
  SOIL_RESISTANCE_TRIP: [
    "NOAH_ARK_PROTECT",
    "ARK_SAFETY_PROTOCOL",
    "JIUYANG_IMPACT_ABSORB",
    "FOMO_MARKET_NOISE_MUTED",
    "JOBS_SAY_NO_TO_FOMO",
    "SHAKESPEARE_TO_BE_GATE",
    "DISC_COMPLIANCE_EXECUTION",
    "DINOSAUR_KT_EXTINCTION_SHIELD",
    "QUANTUM_TUNNELING_VOLATILITY_TRIP",
  ],
  IMBALANCE_RADAR_ACTIVE: [
    "EIGHT_FORMATIONS_MATRIX",
    "PARADIGM_SHIFT_EDGE_SYNC",
    "INVISIBLE_HAND_EQUILIBRIUM",
    "HUMAN_DESIGN_AUTHORITY_GATE",
    "HOHMANN_TRANSFER_WINDOW_EXEC",
    "CAPITAL_EFFICIENCY_STRIKE",
    "FENCING_MICROSECOND_REACTION_STRIKE",
  ],
  NEN_VOW_LIMITATION: ["TEN_COMMANDMENTS_SL"],
  DYNAMIC_SL_ENFORCED: [
    "NEN_VOW_LIMITATION",
    "SATOSHI_GENESIS_COVENANT",
    "POTTER_UNBREAKABLE_VOW",
    "LUBAN_RULER_BOUNDS_CHECK",
    "ATLANTIS_ORICHALCUM_SHIELD",
    "FRACTIONAL_KELLY_CAPITAL_SIZING",
  ],
  SHADOW_FLEET_ARISE: ["SEVEN_STARS_FLEET"],
  AFTERIMAGE_FLEET: ["EMPTY_FORT_DECOY"],
  MOSS_TINDER_LOCK: ["TURTLE_SHIP_SHIELD"],
  ANTI_MEV_SHIELD: [
    "MOSS_TINDER_LOCK",
    "MJ_MOONWALK_ANTI_SLIPPAGE",
    "COMMONS_PROTECTION_ACTIVE",
    "NASH_EQUILIBRIUM_MEV_COUNTER",
  ],
  SYSTEM_STATE_STABLE: [
    "BFI_TENSEGRITY_BALANCE",
    "RICH_DAD_ASSET_CASHFLOW",
    "LUBAN_MORTISE_TENON_LOCK",
    "FIVE_ELEMENTS_EQUILIBRIUM",
    "ICHING_DYNAMIC_PHASE_CONTROL",
    "SCHRODINGER_WAVE_STATE_COLLAPSE",
  ],
  FLEET_HEALTH_CHECK: ["BYZANTINE_FLEET_CONSENSUS", "TIEBAN_NUMERICAL_PRECISION"],
  TRUTH_GATE_AUDIT: [
    "CYPHERPUNK_MANIFESTO_SHIELD",
    "MONEY_AND_YOU_INTEGRITY",
    "MBTI_INTJ_ARCHITECT_LOGIC",
    "INCA_QUIPU_IMMUTABLE_LOG",
  ],
};

/**
 * Universal metaphor comparative matrix — master optional aliases grouped by sector.
 * Annotation-only registry; see docs/POPCULTURE_TACTICS.md § Universal Metaphor Comparative Matrix.
 */
export const TACTICAL_UNIVERSAL_MATRIX_ALIASES = {
  luBan: ["LUBAN_MORTISE_TENON_LOCK", "LUBAN_RULER_BOUNDS_CHECK"],
  overcookedWeb3: [
    "OVERCOOKED_FIRE_EXTINGUISHER",
    "BYZANTINE_FLEET_CONSENSUS",
    "COMMONS_PROTECTION_ACTIVE",
    "INVISIBLE_HAND_EQUILIBRIUM",
    "CYPHERPUNK_MANIFESTO_SHIELD",
  ],
  richDad: ["RICH_DAD_ASSET_CASHFLOW"],
  moneyAndYou: ["MONEY_AND_YOU_INTEGRITY"],
  mythology: [
    "NUWA_FIVE_COLOR_REPAIR",
    "ATLANTIS_ORICHALCUM_SHIELD",
    "INCA_QUIPU_IMMUTABLE_LOG",
    "DINOSAUR_KT_EXTINCTION_SHIELD",
  ],
  psychologyMetaphysics: [
    "MBTI_INTJ_ARCHITECT_LOGIC",
    "FIVE_ELEMENTS_EQUILIBRIUM",
    "ZIWEI_MUTATION_RISK_SHIELD",
  ],
  sectionY: [
    "ICHING_DYNAMIC_PHASE_CONTROL",
    "BOTTOMLINE_RISK_PREVENTION",
    "CAPITAL_EFFICIENCY_STRIKE",
    "HOHMANN_TRANSFER_WINDOW_EXEC",
    "HAWKING_SINGULARITY_LOCK",
    "FENCING_MICROSECOND_REACTION_STRIKE",
  ],
  sectionZ: [
    "NASH_EQUILIBRIUM_MEV_COUNTER",
    "FRACTIONAL_KELLY_CAPITAL_SIZING",
    "SCHRODINGER_WAVE_STATE_COLLAPSE",
    "QUANTUM_TUNNELING_VOLATILITY_TRIP",
  ],
} as const satisfies Readonly<Record<string, readonly TacticalLogAlias[]>>;

/** Flat list of all universal-matrix optional aliases (26 sector entries) */
export const TACTICAL_UNIVERSAL_MATRIX_ALIAS_LIST: readonly TacticalLogAlias[] =
  Object.values(TACTICAL_UNIVERSAL_MATRIX_ALIASES).flat();

function buildAliasToStateMap(): Readonly<
  Partial<Record<TacticalLogAlias, TacticalInternalState>>
> {
  const map: Partial<Record<TacticalLogAlias, TacticalInternalState>> = {};
  for (const [state, alias] of Object.entries(TACTICAL_STATE_ALIASES)) {
    map[alias as TacticalLogAlias] = state as TacticalInternalState;
  }
  for (const [state, aliases] of Object.entries(TACTICAL_OPTIONAL_ALIASES)) {
    for (const alias of aliases ?? []) {
      if (map[alias] === undefined) {
        map[alias] = state as TacticalInternalState;
      }
    }
  }
  return map;
}

/** Reverse lookup — log alias → internal state (primary + optional) */
const ALIAS_TO_STATE = buildAliasToStateMap();

/** Infinity Gauntlet — six risk gems (MCU metaphor) */
export const INFINITY_GAUNTLET_GEMS = [
  { gem: "Power", label: "Soil Check", module: "checkSoilResistance()" },
  { gem: "Space", label: "Dynamic SL (1%+$100)", module: "computeEffectiveMaxSlUsd()" },
  { gem: "Time", label: "R17 Daily Loss", module: "checkRoot17DailyLimit()" },
  { gem: "Mind", label: "R20 Deadlock", module: "vineWrapProtection()" },
  { gem: "Reality", label: "Imbalance Radar", module: "evaluateRightEye()" },
  { gem: "Soul", label: "HL Lend Collateral", module: "FleetRole: hl_lend_vault" },
] as const;

/** Resolve pop-culture alias for a known internal state (optional variant override) */
export function resolveTacticalAlias(
  state: TacticalInternalState,
  variant?: TacticalLogAlias,
): TacticalLogAlias {
  if (variant !== undefined) {
    const resolved = resolveInternalStateFromAlias(variant);
    if (resolved === state) return variant;
  }
  return TACTICAL_STATE_ALIASES[state];
}

/** List all valid aliases (primary + optional) for an internal state */
export function listTacticalAliases(state: TacticalInternalState): TacticalLogAlias[] {
  const primary = TACTICAL_STATE_ALIASES[state];
  const optional = TACTICAL_OPTIONAL_ALIASES[state] ?? [];
  return [primary, ...optional.filter((a) => a !== primary)];
}

/** Resolve internal state from a log alias (annotation decode) */
export function resolveInternalStateFromAlias(
  alias: TacticalLogAlias,
): TacticalInternalState | undefined {
  return ALIAS_TO_STATE[alias];
}

/** Format a log line with optional tactical alias prefix — does not mutate payloads */
export function formatTacticalLogAnnotation(
  state: TacticalInternalState,
  message: string,
  options?: { includeInternal?: boolean; variant?: TacticalLogAlias },
): string {
  const alias = resolveTacticalAlias(state, options?.variant);
  const includeInternal = options?.includeInternal ?? false;
  const tag = includeInternal ? `[${alias} · ${state}]` : `[${alias}]`;
  const body = String(message ?? "").trim();
  return body ? `${tag} ${body}` : tag;
}

/** Attach optional tacticalAlias field to structured log details (annotation only) */
export function withTacticalAlias<T extends Record<string, unknown>>(
  state: TacticalInternalState,
  details: T,
  enabled = true,
  variant?: TacticalLogAlias,
): T & { tacticalAlias?: TacticalLogAlias; tacticalState?: TacticalInternalState } {
  if (!enabled) return details;
  return {
    ...details,
    tacticalAlias: resolveTacticalAlias(state, variant),
    tacticalState: state,
  };
}

/**
 * When TACTICAL_LOG_METAPHORS=true, attach pop-culture alias (optional variant).
 * No-op when metaphors disabled — gate verdicts unchanged.
 */
export function withTacticalLogMetaphors<T extends Record<string, unknown>>(
  state: TacticalInternalState,
  details: T,
  env?: { TACTICAL_LOG_METAPHORS?: string },
  variant?: TacticalLogAlias,
): T & { tacticalAlias?: TacticalLogAlias; tacticalState?: TacticalInternalState } {
  return withTacticalAlias(state, details, isTacticalLogMetaphorsEnabled(env), variant);
}

/** Map existing risk-control / strike events to tactical internal states */
export function mapRiskEventToTacticalState(event: string): TacticalInternalState | null {
  switch (event) {
    case "SOIL_RESISTANCE_PASS":
      return "SOIL_RESISTANCE_PASS";
    case "SOIL_RESISTANCE_TRIP":
      return "SOIL_RESISTANCE_TRIP";
    case "ROOT_PROTECTION_TRIP":
    case "CRI_HARDLOCK":
      return "R20_LOCKED";
    case "ROOT_PROTECTION_PASS":
      return "SOIL_RESISTANCE_PASS";
    default:
      return null;
  }
}

/** Map strike gate phase to tactical state (annotation helper) */
export function mapStrikePhaseToTacticalState(input: {
  armed: boolean;
  microSpreadCollapse?: boolean;
}): TacticalInternalState {
  if (!input.armed) return "SOIL_RESISTANCE_PASS";
  if (input.microSpreadCollapse) return "SANTENBOKU_STRIKE";
  return "KUNG_FU_MICRO_EXEC";
}

/** Map coach red card to tactical state */
export function mapRedCardToTacticalState(target: "R17" | "R20" | null): TacticalInternalState | null {
  if (target === "R17") return "R17_LOCKED";
  if (target === "R20") return "ORDER_66_CANCEL_ALL";
  return null;
}

/** Map soil pass to Domain Expansion execution zone (Jujutsu Kaisen metaphor) */
export function mapSoilPassToTacticalState(soilOk: boolean): TacticalInternalState {
  return soilOk ? "DOMAIN_EXPANSION_ZONE" : "SOIL_RESISTANCE_TRIP";
}

/** Map Right Eye sensing to Nen Gyo (Hunter × Hunter metaphor) */
export function mapRightEyeToTacticalState(input: {
  imbalanceStrike: boolean;
  microSpreadCollapse: boolean;
}): TacticalInternalState {
  if (input.imbalanceStrike || input.microSpreadCollapse) return "NEN_GYO_SENSING";
  return "SOIL_RESISTANCE_PASS";
}

/** Map fleet co-op boot to Shadow Monarch Arise (Solo Leveling metaphor) */
export function mapFleetAriseToTacticalState(fleetMode: boolean): TacticalInternalState | null {
  return fleetMode ? "SHADOW_FLEET_ARISE" : null;
}

/** Map DonDon 4D pocket toolkit active (Doraemon metaphor) */
export function mapDonDonPocketActive(active: boolean): TacticalInternalState | null {
  return active ? "DONDON_4D_POCKET" : null;
}

/** Map R20 hardlock to Nen Zetsu silent cloak */
export function mapR20ToTacticalState(locked: boolean): TacticalInternalState | null {
  return locked ? "NEN_ZETSU_CLOAK" : null;
}

/** Map Dynamic SL vow adherence (Hunter × Hunter / Ten Commandments) */
export function mapDynamicSlVow(withinLimit: boolean): TacticalInternalState | null {
  return withinLimit ? "DYNAMIC_SL_ENFORCED" : null;
}

/** Map decoy fleet routing active (Dragon Ball Afterimage metaphor) */
export function mapAfterimageFleet(active: boolean): TacticalInternalState | null {
  return active ? "AFTERIMAGE_FLEET" : null;
}

/** Map Right Eye radar active (Zhuge Eight Formations / imbalance scan) */
export function mapImbalanceRadarActive(active: boolean): TacticalInternalState | null {
  return active ? "IMBALANCE_RADAR_ACTIVE" : null;
}

/** Furinkazan "immovable mountain" — maps to R20 physical deadlock */
export function mapFurinkazanMountain(locked: boolean): TacticalInternalState | null {
  return locked ? "R20_LOCKED" : null;
}

/** Dugu Nine Swords "qi-break" — counter-strike on liquidity vacuum */
export function mapDuguNineSwordsStrike(armed: boolean): TacticalInternalState | null {
  return armed ? "SANTENBOKU_STRIKE" : null;
}

/** Noah's Ark — capital preservation when soil resistance trips */
export function mapNoahArkProtect(tripped: boolean): TacticalInternalState | null {
  return tripped ? "SOIL_RESISTANCE_TRIP" : null;
}

/** Jiuyang Formula — absorb market impact on soil trip */
export function mapJiuyangImpactAbsorb(tripped: boolean): TacticalInternalState | null {
  return tripped ? "SOIL_RESISTANCE_TRIP" : null;
}

/** Anti-MEV Turtle Ship hull shield */
export function mapAntiMevShield(active: boolean): TacticalInternalState | null {
  return active ? "ANTI_MEV_SHIELD" : null;
}

/** Fullmetal Alchemist — Truth Gate equal-exchange audit */
export function mapTruthGateAudit(active: boolean): TacticalInternalState | null {
  return active ? "TRUTH_GATE_AUDIT" : null;
}

/** DonDum market HUD cold-eye overview */
export function mapDonDumHudActive(active: boolean): TacticalInternalState | null {
  return active ? "DONDUM_HUD_ACTIVE" : null;
}

/** FOMO market noise muted via soil resistance trip */
export function mapFomoMarketMuted(tripped: boolean): TacticalInternalState | null {
  return tripped ? "SOIL_RESISTANCE_TRIP" : null;
}

/** True when env enables tactical metaphor suffixes on structured logs */
export function isTacticalLogMetaphorsEnabled(env?: { TACTICAL_LOG_METAPHORS?: string }): boolean {
  return env?.TACTICAL_LOG_METAPHORS === "true";
}
