/**
 * Santenmoku Third Eye — strike gate orchestration.
 * Alpha thresholds are injected via resolveStrikeAlphaConfig(); never embedded as secrets.
 */

import { checkRoot17DailyLimit } from "../v2/services/root17-daily";
import { checkSoilResistance, vineWrapProtection } from "./risk-control";
import type {
  LeftEyeInput,
  LeftEyeResult,
  RightEyeInput,
  RightEyeResult,
  SantenbokuStrikeEngine,
  StrikeAlphaConfig,
  StrikeAlphaEnv,
  StrikeGateInput,
  StrikeGateResult,
} from "./types";

/** Conservative defaults for dry-run / demo — override via env in production */
export const DEFAULT_STRIKE_ALPHA: StrikeAlphaConfig = {
  imbalanceRatioMin: 1.35,
  microSpreadCollapseBps: 3,
  sensingProbeNotionalUsd: 250,
  sensingCooldownMs: 800,
  pitStopFundingBps: 15,
  pitStopMaxHoldMs: 4 * 60 * 60 * 1000,
  fleetMode: false,
};

function parsePositiveFloat(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Resolve strike alpha from Worker env or test fixtures — no secrets required */
export function resolveStrikeAlphaConfig(
  env: StrikeAlphaEnv = {},
  defaults: StrikeAlphaConfig = DEFAULT_STRIKE_ALPHA,
): StrikeAlphaConfig {
  return {
    imbalanceRatioMin: parsePositiveFloat(
      env.STRIKE_IMBALANCE_RATIO_MIN,
      defaults.imbalanceRatioMin,
    ),
    microSpreadCollapseBps: parsePositiveFloat(
      env.STRIKE_MICRO_SPREAD_COLLAPSE_BPS,
      defaults.microSpreadCollapseBps,
    ),
    sensingProbeNotionalUsd: parsePositiveFloat(
      env.STRIKE_SENSING_PROBE_USD,
      defaults.sensingProbeNotionalUsd,
    ),
    sensingCooldownMs: parsePositiveInt(
      env.STRIKE_SENSING_COOLDOWN_MS,
      defaults.sensingCooldownMs,
    ),
    pitStopFundingBps: parsePositiveFloat(
      env.STRIKE_PITSTOP_FUNDING_BPS,
      defaults.pitStopFundingBps,
    ),
    pitStopMaxHoldMs: parsePositiveInt(
      env.STRIKE_PITSTOP_MAX_HOLD_MS,
      defaults.pitStopMaxHoldMs,
    ),
    fleetMode: env.STRIKE_FLEET_MODE === "true" || defaults.fleetMode,
  };
}

export function evaluateLeftEye(input: LeftEyeInput): LeftEyeResult {
  const reasons: string[] = [];
  const soil = checkSoilResistance(input.soil);
  if (soil.tripped) {
    reasons.push(...soil.reasons.map((r) => `SOIL:${r}`));
  }

  const root17 = checkRoot17DailyLimit(input.root17);
  if (root17.tripped && root17.reason) {
    reasons.push(`ROOT17:${root17.reason}`);
  }

  let root20Blocked = false;
  let root20Reason: string | undefined;
  try {
    vineWrapProtection(input.root20);
  } catch (err) {
    root20Blocked = true;
    root20Reason = err instanceof Error ? err.message : String(err);
    reasons.push(`ROOT20:${root20Reason}`);
  }

  const pass = !soil.tripped && !root17.tripped && !root20Blocked;
  return {
    verdict: pass ? "PASS" : "FAIL",
    phase: pass ? "RIGHT_EYE" : "BLOCKED",
    soil,
    root17,
    root20Blocked,
    ...(root20Reason !== undefined ? { root20Reason } : {}),
    reasons,
  };
}

export function evaluateRightEye(input: RightEyeInput): RightEyeResult {
  const { snapshot, config } = input;
  const reasons: string[] = [];
  const imbalanceStrike = snapshot.imbalanceRatio >= config.imbalanceRatioMin;
  const microSpreadCollapse =
    snapshot.microSpreadBps > 0 &&
    snapshot.microSpreadBps <= config.microSpreadCollapseBps;

  if (imbalanceStrike) {
    reasons.push(
      `IMBALANCE_RATIO=${snapshot.imbalanceRatio.toFixed(4)}>=${config.imbalanceRatioMin}`,
    );
  }
  if (microSpreadCollapse) {
    reasons.push(
      `MICRO_SPREAD_COLLAPSE=${snapshot.microSpreadBps.toFixed(2)}bps<=${config.microSpreadCollapseBps}`,
    );
  }

  const strike = imbalanceStrike || microSpreadCollapse;
  return {
    verdict: strike ? "STRIKE" : "STANDBY",
    phase: strike ? "THIRD_EYE" : "RIGHT_EYE",
    imbalanceStrike,
    microSpreadCollapse,
    reasons,
  };
}

export function evaluateStrikeGate(input: StrikeGateInput): StrikeGateResult {
  const left = evaluateLeftEye(input.left);
  if (left.verdict === "FAIL") {
    return {
      phase: "BLOCKED",
      armed: false,
      left,
      right: null,
      label: "[ LEFT EYE FAIL · STRIKE BLOCKED ]",
    };
  }

  const right = evaluateRightEye(input.right);
  const armed = right.verdict === "STRIKE";
  return {
    phase: armed ? "THIRD_EYE" : "RIGHT_EYE",
    armed,
    left,
    right,
    label: armed
      ? "[ THIRD EYE ARMED · DYNAMIC STRIKE ]"
      : "[ RIGHT EYE STANDBY · SENSING ]",
  };
}

export function createSantenbokuStrikeEngine(
  config: StrikeAlphaConfig = DEFAULT_STRIKE_ALPHA,
): SantenbokuStrikeEngine {
  return {
    config,
    evaluateLeftEye,
    evaluateRightEye,
    evaluateStrikeGate,
  };
}
