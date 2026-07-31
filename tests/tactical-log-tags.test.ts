import { describe, expect, it } from "vitest";
import {
  formatTacticalLogAnnotation,
  INFINITY_GAUNTLET_GEMS,
  listTacticalAliases,
  mapAntiMevShield,
  mapDonDonPocketActive,
  mapDonDumHudActive,
  mapDuguNineSwordsStrike,
  mapFleetAriseToTacticalState,
  mapFomoMarketMuted,
  mapFurinkazanMountain,
  mapImbalanceRadarActive,
  mapJiuyangImpactAbsorb,
  mapNoahArkProtect,
  mapRedCardToTacticalState,
  mapRightEyeToTacticalState,
  mapRiskEventToTacticalState,
  mapSoilPassToTacticalState,
  mapStrikePhaseToTacticalState,
  mapTruthGateAudit,
  resolveInternalStateFromAlias,
  resolveTacticalAlias,
  TACTICAL_OPTIONAL_ALIASES,
  TACTICAL_STATE_ALIASES,
  TACTICAL_UNIVERSAL_MATRIX_ALIAS_LIST,
  TACTICAL_UNIVERSAL_MATRIX_ALIASES,
  withTacticalAlias,
  withTacticalLogMetaphors,
  isTacticalLogMetaphorsEnabled,
} from "../src/services/tactical-log-tags";

describe("TACTICAL_STATE_ALIASES", () => {
  it("maps SANTENBOKU_STRIKE to FLURRY_RUSH_STRIKE", () => {
    expect(resolveTacticalAlias("SANTENBOKU_STRIKE")).toBe("FLURRY_RUSH_STRIKE");
  });

  it("maps SYSTEM_ROLLBACK to FLUX_SNAPSHOT_RESTORED", () => {
    expect(resolveTacticalAlias("SYSTEM_ROLLBACK")).toBe("FLUX_SNAPSHOT_RESTORED");
  });

  it("maps ORDER_66_CANCEL_ALL to ORDER_66_TRIGGERED", () => {
    expect(resolveTacticalAlias("ORDER_66_CANCEL_ALL")).toBe("ORDER_66_TRIGGERED");
  });

  it("keeps R20_LOCKED identity mapping", () => {
    expect(TACTICAL_STATE_ALIASES.R20_LOCKED).toBe("R20_LOCKED");
  });

  it("covers every internal state with a unique alias", () => {
    for (const [state, alias] of Object.entries(TACTICAL_STATE_ALIASES)) {
      expect(alias).toBeTruthy();
      expect(resolveTacticalAlias(state as keyof typeof TACTICAL_STATE_ALIASES)).toBe(alias);
    }
  });

  it("reverse-resolves primary aliases to internal states", () => {
    expect(resolveInternalStateFromAlias("FLURRY_RUSH_STRIKE")).toBe("SANTENBOKU_STRIKE");
    expect(resolveInternalStateFromAlias("FLUX_SNAPSHOT_RESTORED")).toBe("SYSTEM_ROLLBACK");
    expect(resolveInternalStateFromAlias("ORDER_66_TRIGGERED")).toBe("ORDER_66_CANCEL_ALL");
  });
});

describe("formatTacticalLogAnnotation", () => {
  it("prefixes message with pop-culture alias", () => {
    expect(
      formatTacticalLogAnnotation("SANTENBOKU_STRIKE", "Third Eye armed"),
    ).toBe("[FLURRY_RUSH_STRIKE] Third Eye armed");
  });

  it("includes internal state when requested", () => {
    expect(
      formatTacticalLogAnnotation("R20_LOCKED", "deadlock", {
        includeInternal: true,
      }),
    ).toBe("[R20_LOCKED · R20_LOCKED] deadlock");
  });
});

describe("withTacticalAlias", () => {
  it("adds annotation fields without mutating gate logic fields", () => {
    const out = withTacticalAlias("SYSTEM_ROLLBACK", { ok: true }, true);
    expect(out.tacticalAlias).toBe("FLUX_SNAPSHOT_RESTORED");
    expect(out.tacticalState).toBe("SYSTEM_ROLLBACK");
    expect(out.ok).toBe(true);
  });

  it("skips annotation when disabled", () => {
    const out = withTacticalAlias("SANTENBOKU_STRIKE", { armed: true }, false);
    expect(out.tacticalAlias).toBeUndefined();
  });
});

describe("mapRiskEventToTacticalState", () => {
  it("maps CRI_HARDLOCK to R20_LOCKED", () => {
    expect(mapRiskEventToTacticalState("CRI_HARDLOCK")).toBe("R20_LOCKED");
  });

  it("maps SOIL_RESISTANCE_TRIP to POWER_GEM_TRIPPED", () => {
    const state = mapRiskEventToTacticalState("SOIL_RESISTANCE_TRIP");
    expect(state).toBe("SOIL_RESISTANCE_TRIP");
    expect(resolveTacticalAlias(state!)).toBe("POWER_GEM_TRIPPED");
  });
});

describe("mapStrikePhaseToTacticalState", () => {
  it("returns SANTENBOKU_STRIKE on micro-spread vacuum strike", () => {
    expect(
      mapStrikePhaseToTacticalState({ armed: true, microSpreadCollapse: true }),
    ).toBe("SANTENBOKU_STRIKE");
  });

  it("returns KUNG_FU_MICRO_EXEC on armed strike without vacuum", () => {
    expect(mapStrikePhaseToTacticalState({ armed: true })).toBe("KUNG_FU_MICRO_EXEC");
  });
});

describe("mapRedCardToTacticalState", () => {
  it("maps R20 red card to ORDER_66_CANCEL_ALL", () => {
    expect(mapRedCardToTacticalState("R20")).toBe("ORDER_66_CANCEL_ALL");
  });

  it("maps R17 red card to R17_LOCKED", () => {
    expect(mapRedCardToTacticalState("R17")).toBe("R17_LOCKED");
  });
});

describe("INFINITY_GAUNTLET_GEMS", () => {
  it("defines six risk gems", () => {
    expect(INFINITY_GAUNTLET_GEMS).toHaveLength(6);
    expect(INFINITY_GAUNTLET_GEMS.map((g) => g.gem)).toEqual([
      "Power",
      "Space",
      "Time",
      "Mind",
      "Reality",
      "Soul",
    ]);
  });
});

describe("ACG / Manga tactical aliases", () => {
  it("maps required DonDon and Nen tags", () => {
    expect(resolveTacticalAlias("DONDON_4D_POCKET")).toBe("DONDON_4D_POCKET_ACTIVE");
    expect(resolveTacticalAlias("NEN_GYO_SENSING")).toBe("NEN_GYO_SENSING");
    expect(resolveTacticalAlias("DOMAIN_EXPANSION_ZONE")).toBe("DOMAIN_EXPANSION_SOIL");
    expect(resolveTacticalAlias("SHADOW_FLEET_ARISE")).toBe("SHADOW_ARRAISE_FLEET");
  });

  it("reverse-resolves ACG aliases to internal states", () => {
    expect(resolveInternalStateFromAlias("DONDON_4D_POCKET_ACTIVE")).toBe("DONDON_4D_POCKET");
    expect(resolveInternalStateFromAlias("DOMAIN_EXPANSION_SOIL")).toBe("DOMAIN_EXPANSION_ZONE");
    expect(resolveInternalStateFromAlias("SHADOW_ARRAISE_FLEET")).toBe("SHADOW_FLEET_ARISE");
  });
});

describe("ACG mapper helpers", () => {
  it("maps soil pass to DOMAIN_EXPANSION_ZONE", () => {
    expect(mapSoilPassToTacticalState(true)).toBe("DOMAIN_EXPANSION_ZONE");
    expect(resolveTacticalAlias(mapSoilPassToTacticalState(true))).toBe(
      "DOMAIN_EXPANSION_SOIL",
    );
  });

  it("maps right eye sensing to NEN_GYO_SENSING", () => {
    expect(mapRightEyeToTacticalState({ imbalanceStrike: true, microSpreadCollapse: false })).toBe(
      "NEN_GYO_SENSING",
    );
  });

  it("maps fleet mode to SHADOW_FLEET_ARISE", () => {
    expect(mapFleetAriseToTacticalState(true)).toBe("SHADOW_FLEET_ARISE");
    expect(mapDonDonPocketActive(true)).toBe("DONDON_4D_POCKET");
  });
});

describe("Religion / Wuxia / History optional aliases", () => {
  it("maps finalized optional aliases to internal states", () => {
    expect(resolveInternalStateFromAlias("FURINKAZAN_MOUNTAIN")).toBe("R20_LOCKED");
    expect(resolveInternalStateFromAlias("DUGU_NINE_SWORDS_STRIKE")).toBe("SANTENBOKU_STRIKE");
    expect(resolveInternalStateFromAlias("ARK_SAFETY_PROTOCOL")).toBe("SOIL_RESISTANCE_TRIP");
    expect(resolveInternalStateFromAlias("EIGHT_FORMATIONS_SCAN")).toBe("IMBALANCE_RADAR_ACTIVE");
    expect(resolveInternalStateFromAlias("TEN_COMMANDMENTS_SL")).toBe("DYNAMIC_SL_ENFORCED");
    expect(resolveInternalStateFromAlias("TURTLE_SHIP_PROTECT")).toBe("ANTI_MEV_SHIELD");
    expect(resolveInternalStateFromAlias("JIUYANG_IMPACT_ABSORB")).toBe("SOIL_RESISTANCE_TRIP");
  });

  it("resolves variant alias when valid for state", () => {
    expect(resolveTacticalAlias("R20_LOCKED", "FURINKAZAN_MOUNTAIN")).toBe(
      "FURINKAZAN_MOUNTAIN",
    );
    expect(resolveTacticalAlias("R20_LOCKED")).toBe("R20_LOCKED");
    expect(resolveTacticalAlias("SANTENBOKU_STRIKE", "DUGU_NINE_SWORDS_STRIKE")).toBe(
      "DUGU_NINE_SWORDS_STRIKE",
    );
  });

  it("lists primary and optional aliases per state", () => {
    const aliases = listTacticalAliases("R20_LOCKED");
    expect(aliases).toContain("R20_LOCKED");
    expect(aliases).toContain("FURINKAZAN_MOUNTAIN");
    expect(aliases).toContain("DIAMOND_BODY_LOCK");
  });

  it("mapper helpers return correct internal states", () => {
    expect(mapFurinkazanMountain(true)).toBe("R20_LOCKED");
    expect(mapDuguNineSwordsStrike(true)).toBe("SANTENBOKU_STRIKE");
    expect(mapNoahArkProtect(true)).toBe("SOIL_RESISTANCE_TRIP");
    expect(mapImbalanceRadarActive(true)).toBe("IMBALANCE_RADAR_ACTIVE");
  });

  it("documents optional alias registry for R20 and strike", () => {
    expect(TACTICAL_OPTIONAL_ALIASES.R20_LOCKED).toContain("FURINKAZAN_MOUNTAIN");
    expect(TACTICAL_OPTIONAL_ALIASES.SANTENBOKU_STRIKE).toContain("DUGU_NINE_SWORDS_STRIKE");
    expect(TACTICAL_OPTIONAL_ALIASES.SOIL_RESISTANCE_TRIP).toContain("ARK_SAFETY_PROTOCOL");
  });
});

describe("Section H — Gate of Truth & DonDum Market", () => {
  it("maps Gate of Truth and DonDum aliases", () => {
    expect(resolveInternalStateFromAlias("GATE_OF_TRUTH_EQUAL_EXCHANGE")).toBe("TRUTH_GATE_AUDIT");
    expect(resolveInternalStateFromAlias("DONDUM_MARKET_OVERVIEW")).toBe("DONDUM_HUD_ACTIVE");
    expect(resolveInternalStateFromAlias("FOMO_MARKET_NOISE_MUTED")).toBe("SOIL_RESISTANCE_TRIP");
  });

  it("mapper helpers return Section H internal states", () => {
    expect(mapTruthGateAudit(true)).toBe("TRUTH_GATE_AUDIT");
    expect(mapDonDumHudActive(true)).toBe("DONDUM_HUD_ACTIVE");
    expect(mapFomoMarketMuted(true)).toBe("SOIL_RESISTANCE_TRIP");
    expect(mapAntiMevShield(true)).toBe("ANTI_MEV_SHIELD");
    expect(mapJiuyangImpactAbsorb(true)).toBe("SOIL_RESISTANCE_TRIP");
  });
});

describe("withTacticalLogMetaphors", () => {
  it("attaches alias when TACTICAL_LOG_METAPHORS=true", () => {
    const out = withTacticalLogMetaphors(
      "DONDUM_HUD_ACTIVE",
      { ok: true },
      { TACTICAL_LOG_METAPHORS: "true" },
    );
    expect(out.tacticalAlias).toBe("DONDUM_MARKET_OVERVIEW");
  });

  it("skips alias when metaphors disabled", () => {
    const out = withTacticalLogMetaphors(
      "DONDUM_HUD_ACTIVE",
      { ok: true },
      { TACTICAL_LOG_METAPHORS: "false" },
    );
    expect(out.tacticalAlias).toBeUndefined();
  });

  it("uses variant when metaphors enabled", () => {
    const out = withTacticalLogMetaphors(
      "SOIL_RESISTANCE_TRIP",
      { tripped: true },
      { TACTICAL_LOG_METAPHORS: "true" },
      "FOMO_MARKET_NOISE_MUTED",
    );
    expect(out.tacticalAlias).toBe("FOMO_MARKET_NOISE_MUTED");
  });

  it("isTacticalLogMetaphorsEnabled respects env flag", () => {
    expect(isTacticalLogMetaphorsEnabled({ TACTICAL_LOG_METAPHORS: "true" })).toBe(true);
    expect(isTacticalLogMetaphorsEnabled({})).toBe(false);
  });
});

describe("Universal Metaphor Comparative Matrix", () => {
  it("registers 26 sector optional aliases across matrix groups", () => {
    expect(TACTICAL_UNIVERSAL_MATRIX_ALIAS_LIST).toHaveLength(26);
    expect(TACTICAL_UNIVERSAL_MATRIX_ALIASES.luBan).toHaveLength(2);
    expect(TACTICAL_UNIVERSAL_MATRIX_ALIASES.overcookedWeb3).toHaveLength(5);
    expect(TACTICAL_UNIVERSAL_MATRIX_ALIASES.mythology).toHaveLength(4);
    expect(TACTICAL_UNIVERSAL_MATRIX_ALIASES.psychologyMetaphysics).toHaveLength(3);
    expect(TACTICAL_UNIVERSAL_MATRIX_ALIASES.sectionY).toHaveLength(6);
    expect(TACTICAL_UNIVERSAL_MATRIX_ALIASES.sectionZ).toHaveLength(4);
  });

  it("reverse-resolves every universal-matrix alias to an internal state", () => {
    for (const alias of TACTICAL_UNIVERSAL_MATRIX_ALIAS_LIST) {
      expect(resolveInternalStateFromAlias(alias)).toBeTruthy();
    }
  });

  it("maps key matrix aliases to expected internal states", () => {
    expect(resolveInternalStateFromAlias("LUBAN_MORTISE_TENON_LOCK")).toBe("SYSTEM_STATE_STABLE");
    expect(resolveInternalStateFromAlias("OVERCOOKED_FIRE_EXTINGUISHER")).toBe("R20_LOCKED");
    expect(resolveInternalStateFromAlias("BYZANTINE_FLEET_CONSENSUS")).toBe("FLEET_HEALTH_CHECK");
    expect(resolveInternalStateFromAlias("RICH_DAD_ASSET_CASHFLOW")).toBe("SYSTEM_STATE_STABLE");
    expect(resolveInternalStateFromAlias("NUWA_FIVE_COLOR_REPAIR")).toBe("R20_LOCKED");
    expect(resolveInternalStateFromAlias("FIVE_ELEMENTS_EQUILIBRIUM")).toBe("SYSTEM_STATE_STABLE");
    expect(resolveInternalStateFromAlias("HOHMANN_TRANSFER_WINDOW_EXEC")).toBe(
      "IMBALANCE_RADAR_ACTIVE",
    );
    expect(resolveInternalStateFromAlias("FENCING_MICROSECOND_REACTION_STRIKE")).toBe(
      "IMBALANCE_RADAR_ACTIVE",
    );
    expect(resolveInternalStateFromAlias("HAWKING_SINGULARITY_LOCK")).toBe("R20_LOCKED");
    expect(resolveInternalStateFromAlias("ICHING_DYNAMIC_PHASE_CONTROL")).toBe(
      "SYSTEM_STATE_STABLE",
    );
    expect(resolveInternalStateFromAlias("BOTTOMLINE_RISK_PREVENTION")).toBe("R20_LOCKED");
    expect(resolveInternalStateFromAlias("NASH_EQUILIBRIUM_MEV_COUNTER")).toBe("ANTI_MEV_SHIELD");
    expect(resolveInternalStateFromAlias("FRACTIONAL_KELLY_CAPITAL_SIZING")).toBe(
      "DYNAMIC_SL_ENFORCED",
    );
    expect(resolveInternalStateFromAlias("SCHRODINGER_WAVE_STATE_COLLAPSE")).toBe(
      "SYSTEM_STATE_STABLE",
    );
    expect(resolveInternalStateFromAlias("QUANTUM_TUNNELING_VOLATILITY_TRIP")).toBe(
      "SOIL_RESISTANCE_TRIP",
    );
  });
});
