/**
 * Taiji Dual-Engine + Bagua 8-Gates — pure derivations from SystemState.
 */

import {
  BRAND_DELTA_SYMBOL,
  TAIJI_YANG_CRI_MIN,
  TAIJI_YIN_CRI_MIN,
} from "../config/constants";
import type { SystemState } from "./systemState";

export { TAIJI_YANG_CRI_MIN, TAIJI_YIN_CRI_MIN };

export type TaijiMode = "YANG_STRIKE" | "YIN_YIELD";

export type BaguaGate =
  | "QIAN_OPEN"
  | "KUN_REST"
  | "ZHEN_HARM"
  | "XUN_BLOCK"
  | "KAN_SINK"
  | "LI_BRIGHT"
  | "GEN_LIFE"
  | "DUI_DEATH";

/** CRI ceiling for Kan delta-neutral sink gate */
export const BAGUA_KAN_CRI_MAX = 25 as const;

/** CRI floor for Li nominal-green gate */
export const BAGUA_LI_CRI_MIN = 50 as const;

export interface TaijiBaguaContext {
  soilTripped?: boolean;
  isHedgeActive?: boolean;
}

export interface BaguaGateUiConfig {
  gate: BaguaGate;
  label: string;
  shortLabel: string;
  tooltip: string;
  cssClass: string;
}

export const BAGUA_GATE_UI: Readonly<Record<BaguaGate, BaguaGateUiConfig>> = {
  QIAN_OPEN: {
    gate: "QIAN_OPEN",
    label: "☰ QIAN · OPEN",
    shortLabel: "Qian (Open)",
    tooltip:
      "Qian Gate (Hyperliquid Main Active): Yang offensive state. Full signature enabled.",
    cssClass: "bagua-gate-qian",
  },
  KUN_REST: {
    gate: "KUN_REST",
    label: "☷ KUN · REST",
    shortLabel: "Kun (Rest)",
    tooltip:
      "Kun Gate (HL Vault Yield Mode): Yin rest state. Earning HL Lend base APR.",
    cssClass: "bagua-gate-kun",
  },
  ZHEN_HARM: {
    gate: "ZHEN_HARM",
    label: "☳ ZHEN · HARM",
    shortLabel: "Zhen (Harm)",
    tooltip:
      "Zhen Gate (Soil/Slippage Alert): Slippage spring tripped. Tightening entry size.",
    cssClass: "bagua-gate-zhen",
  },
  XUN_BLOCK: {
    gate: "XUN_BLOCK",
    label: "☴ XUN · BLOCK",
    shortLabel: "Xun (Block)",
    tooltip:
      "Xun Gate (Network Stale): WS heartbeat lost. Hot key signing blocked.",
    cssClass: "bagua-gate-xun",
  },
  KAN_SINK: {
    gate: "KAN_SINK",
    label: "☵ KAN · SINK",
    shortLabel: "Kan (Sink)",
    tooltip:
      `Kan Gate (${BRAND_DELTA_SYMBOL}-Neutral Sink): Low CRI (<=25). Funds routed to ${BRAND_DELTA_SYMBOL}-neutral hedge.`,
    cssClass: "bagua-gate-kan",
  },
  LI_BRIGHT: {
    gate: "LI_BRIGHT",
    label: "☲ LI · BRIGHT",
    shortLabel: "Li (Bright)",
    tooltip:
      "Li Gate (Nominal Green): System operating within normal risk parameters.",
    cssClass: "bagua-gate-li",
  },
  GEN_LIFE: {
    gate: "GEN_LIFE",
    label: "☶ GEN · LIFE",
    shortLabel: "Gen (Life)",
    tooltip:
      "Gen Gate (Living Water Active): Tail risk hedged via Polymarket binary options.",
    cssClass: "bagua-gate-gen",
  },
  DUI_DEATH: {
    gate: "DUI_DEATH",
    label: "☱ DUI · DEATH",
    shortLabel: "Dui (Death)",
    tooltip:
      "Dui Gate (Genbu Hard Shell): CRI=0 DEFCON 1. Physical deadlock engaged.",
    cssClass: "bagua-gate-dui",
  },
};

export const TAIJI_MODE_UI: Readonly<
  Record<TaijiMode, { label: string; tooltip: string; cssClass: string }>
> = {
  YANG_STRIKE: {
    label: "( ATTACK 陽 MODE )",
    tooltip:
      `Yang offensive engine — Tensile ≥ ${TAIJI_YANG_CRI_MIN}, friction clear, signing channel open.`,
    cssClass: "taiji-mode-yang",
  },
  YIN_YIELD: {
    label: "( GUARD 陰 MODE )",
    tooltip:
      `Yin guard engine — capital rotated to vault lend / ${BRAND_DELTA_SYMBOL}-neutral sleeves.`,
    cssClass: "taiji-mode-yin",
  },
};

type TaijiInput = Pick<
  SystemState,
  "currentCri" | "hardlock" | "isStale" | "signingChannelOpen"
>;

/**
 * Resolve Yang offensive vs Yin yield regime from CRI, hardlock, and soil context.
 *
 * @theory Hamilton (1989) — Markov Regime-Switching Model (MSRM).
 * @theory Ang & Bekaert (2002) — latent-state transition between offensive and defensive regimes.
 */
export function resolveTaijiMode(
  state: TaijiInput,
  ctx: TaijiBaguaContext = {},
): TaijiMode {
  const soilOk = ctx.soilTripped !== true;
  const yangMin =
    typeof TAIJI_YANG_CRI_MIN === "number" ? TAIJI_YANG_CRI_MIN : 75;
  if (!state.hardlock && !state.isStale && state.currentCri >= yangMin && soilOk) {
    return "YANG_STRIKE";
  }
  return "YIN_YIELD";
}

export function resolveActiveGate(
  state: TaijiInput,
  ctx: TaijiBaguaContext = {},
): BaguaGate {
  const yangMin =
    typeof TAIJI_YANG_CRI_MIN === "number" ? TAIJI_YANG_CRI_MIN : 75;
  if (state.hardlock || state.currentCri <= 0) return "DUI_DEATH";
  if (state.isStale || state.signingChannelOpen === false) return "XUN_BLOCK";
  if (ctx.soilTripped === true) return "ZHEN_HARM";
  if (ctx.isHedgeActive === true) return "GEN_LIFE";
  if (state.currentCri >= yangMin) return "QIAN_OPEN";
  if (state.currentCri <= BAGUA_KAN_CRI_MAX) return "KAN_SINK";
  if (state.currentCri < BAGUA_LI_CRI_MIN) return "KUN_REST";
  return "LI_BRIGHT";
}

/** Attach derived Taiji + Bagua fields without mutating SSOT inputs. */
export function enrichSystemStateTaijiBagua<S extends SystemState>(
  state: S,
  ctx: TaijiBaguaContext = {},
): S & { taijiMode: TaijiMode; activeGate: BaguaGate } {
  return {
    ...state,
    taijiMode: resolveTaijiMode(state, ctx),
    activeGate: resolveActiveGate(state, ctx),
  };
}
