/**
 * Santenboku Coach Engine — async global tactical controller (12th player).
 * Monitors macro regimes, manages fleet substitutions, calibrates strike alpha,
 * and may issue R17/R20 Red Cards. No signing keys or wallet secrets in repo.
 */

import { MAX_DAILY_SL_COUNT } from "./effective-max-sl";
import type {
  CoachAlphaConfig,
  CoachAlphaEnv,
  CoachRedCardDecision,
  CoachRegimeResult,
  CoachSubstitutionDecision,
  FleetAggregateMetrics,
  FleetWalletMetrics,
  MacroRegimeSnapshot,
  SantenbokuCoachEngine,
  SoilResistanceLogEntry,
  StrikeAlphaConfig,
} from "./types";

export const DEFAULT_COACH_ALPHA: CoachAlphaConfig = {
  vixSpikeThreshold: 22,
  dvolSpikeThreshold: 55,
  venueDelayMsThreshold: 2500,
  marginUsageSubstitutionPct: 80,
  minEdgeBps: 0,
  fleetDailyLossMultiplier: 1,
};

function parsePositiveFloat(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function resolveCoachAlphaConfig(
  env: CoachAlphaEnv = {},
  defaults: CoachAlphaConfig = DEFAULT_COACH_ALPHA,
): CoachAlphaConfig {
  return {
    vixSpikeThreshold: parsePositiveFloat(
      env.COACH_VIX_SPIKE_THRESHOLD,
      defaults.vixSpikeThreshold,
    ),
    dvolSpikeThreshold: parsePositiveFloat(
      env.COACH_DVOL_SPIKE_THRESHOLD,
      defaults.dvolSpikeThreshold,
    ),
    venueDelayMsThreshold: parsePositiveFloat(
      env.COACH_VENUE_DELAY_MS,
      defaults.venueDelayMsThreshold,
    ),
    marginUsageSubstitutionPct: parsePositiveFloat(
      env.COACH_MARGIN_SUBSTITUTION_PCT,
      defaults.marginUsageSubstitutionPct,
    ),
    minEdgeBps: parsePositiveFloat(
      env.COACH_MIN_EDGE_BPS,
      defaults.minEdgeBps,
    ),
    fleetDailyLossMultiplier: parsePositiveFloat(
      env.COACH_FLEET_DAILY_LOSS_MULTIPLIER,
      defaults.fleetDailyLossMultiplier,
    ),
  };
}

export function evaluateMacroRegime(
  snapshot: MacroRegimeSnapshot,
  config: CoachAlphaConfig = DEFAULT_COACH_ALPHA,
): CoachRegimeResult {
  const reasons: string[] = [];
  let level: CoachRegimeResult["level"] = "CLEAR";

  if (snapshot.vix >= config.vixSpikeThreshold) {
    reasons.push(`VIX_SPIKE=${snapshot.vix}>=${config.vixSpikeThreshold}`);
    level = "ELEVATED";
  }
  if (snapshot.dvol >= config.dvolSpikeThreshold) {
    reasons.push(`DVOL_SPIKE=${snapshot.dvol}>=${config.dvolSpikeThreshold}`);
    level = "ELEVATED";
  }
  if (snapshot.macroBlocking) {
    reasons.push("MACRO_RADAR_BLOCKING");
    level = "ELEVATED";
  }
  if (snapshot.venueDelayMs >= config.venueDelayMsThreshold) {
    reasons.push(
      `VENUE_DELAY=${snapshot.venueDelayMs}ms>=${config.venueDelayMsThreshold}ms`,
    );
    level = level === "ELEVATED" ? "CRITICAL" : "ELEVATED";
  }
  if (snapshot.mevThreatLevel === "critical") {
    reasons.push("MEV_THREAT_CRITICAL");
    level = "CRITICAL";
  } else if (snapshot.mevThreatLevel === "elevated" && level === "CLEAR") {
    reasons.push("MEV_THREAT_ELEVATED");
    level = "ELEVATED";
  }

  return {
    level,
    freezeSubstitutions: level === "CRITICAL",
    extendSensingCooldown: level !== "CLEAR",
    reasons,
  };
}

export function evaluateSubstitution(
  fleet: FleetWalletMetrics[],
  pitStopMaxHoldMs: number,
  config: CoachAlphaConfig = DEFAULT_COACH_ALPHA,
): CoachSubstitutionDecision[] {
  const decisions: CoachSubstitutionDecision[] = [];
  const attackers = fleet.filter((w) => w.role === "attacker");
  const active = attackers.find((w) => w.active);
  const bench = attackers.filter((w) => !w.active);

  if (!active) return decisions;

  const marginTripped =
    active.marginUsagePct > config.marginUsageSubstitutionPct;
  const edgeDecayed =
    active.holdingDurationMs > pitStopMaxHoldMs &&
    active.edgeBps < config.minEdgeBps;

  if (marginTripped || edgeDecayed) {
    const next = bench[0];
    if (next) {
      decisions.push({
        action: "substitute",
        fromWalletId: active.walletId,
        toWalletId: next.walletId,
        reason: marginTripped
          ? `MARGIN_USAGE=${active.marginUsagePct.toFixed(1)}%>${config.marginUsageSubstitutionPct}%`
          : `EDGE_DECAY hold=${active.holdingDurationMs}ms edge=${active.edgeBps}bps`,
      });
    } else {
      decisions.push({
        action: "bench",
        fromWalletId: active.walletId,
        reason: marginTripped
          ? `MARGIN_USAGE=${active.marginUsagePct.toFixed(1)}% — no bench attacker`
          : `EDGE_DECAY — no bench attacker`,
      });
    }
  } else {
    decisions.push({
      action: "hold",
      fromWalletId: active.walletId,
      reason: "ACTIVE_ATTACKER_OK",
    });
  }

  return decisions;
}

/** Adaptive calibration from soil-resistance execution logs — returns runtime patch only */
export function calibrateStrikeThresholds(
  logs: SoilResistanceLogEntry[],
  current: StrikeAlphaConfig,
): Partial<StrikeAlphaConfig> {
  if (logs.length === 0) return {};

  const trips = logs.filter((l) => l.tripped);
  const tripRate = trips.length / logs.length;

  const patch: Partial<StrikeAlphaConfig> = {};

  if (tripRate > 0.3) {
    patch.imbalanceRatioMin = current.imbalanceRatioMin * 1.05;
    patch.sensingCooldownMs = Math.round(current.sensingCooldownMs * 1.2);
  }

  const nearSlippageTrips = trips.filter(
    (l) => l.crossVenueSlippage > 0 && l.crossVenueSlippage <= 0.0055,
  );
  if (nearSlippageTrips.length >= 2) {
    patch.microSpreadCollapseBps = Math.max(
      1,
      current.microSpreadCollapseBps - 0.5,
    );
  }

  return patch;
}

export function evaluateRedCard(
  metrics: FleetAggregateMetrics,
  config: CoachAlphaConfig = DEFAULT_COACH_ALPHA,
): CoachRedCardDecision {
  const fleetDailyCap =
    metrics.maxDailyLossUsd * config.fleetDailyLossMultiplier;

  if (metrics.cri <= 0) {
    return {
      issued: true,
      target: "R20",
      reason: "RED_CARD_R20: global CRI === 0 — physical deadlock",
    };
  }

  if (metrics.fleetEstimatedLossUsd > metrics.effectiveMaxSlUsd) {
    return {
      issued: true,
      target: "R20",
      reason: `RED_CARD_R20: fleet loss $${metrics.fleetEstimatedLossUsd.toFixed(2)} > Max SL $${metrics.effectiveMaxSlUsd.toFixed(2)}`,
    };
  }

  if (metrics.cumulativeDailyLossUsd > fleetDailyCap) {
    return {
      issued: true,
      target: "R17",
      reason: `RED_CARD_R17: fleet daily loss $${metrics.cumulativeDailyLossUsd.toFixed(2)} > cap $${fleetDailyCap.toFixed(2)}`,
    };
  }

  if (metrics.dailySlCount >= MAX_DAILY_SL_COUNT) {
    return {
      issued: true,
      target: "R17",
      reason: `RED_CARD_R17: fleet SL count ${metrics.dailySlCount} >= ${MAX_DAILY_SL_COUNT}`,
    };
  }

  return { issued: false, target: null, reason: "NO_RED_CARD" };
}

export function createSantenbokuCoachEngine(
  config: CoachAlphaConfig = DEFAULT_COACH_ALPHA,
): SantenbokuCoachEngine {
  return {
    config,
    evaluateMacroRegime: (snapshot) => evaluateMacroRegime(snapshot, config),
    evaluateSubstitution: (fleet, pitStopMaxHoldMs) =>
      evaluateSubstitution(fleet, pitStopMaxHoldMs, config),
    calibrateStrikeThresholds,
    evaluateRedCard: (metrics) => evaluateRedCard(metrics, config),
  };
}
