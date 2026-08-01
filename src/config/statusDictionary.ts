/**
 * Master English Status & Tooltip Dictionary
 * Single source of truth for DEX Grant–ready internationalized UI copy.
 */

import { BRAND_DELTA_SYMBOL } from "./constants";
import {
  computeEffectiveMaxSlUsd,
  DAILY_LOSS_CAP_MULTIPLIER,
} from "../services/effective-max-sl";
import {
  AUTO_PILOT_BASIS_BADGE,
  MILESTONE_SANDBOX_BADGE,
} from "../services/copilot-care-messages";
import {
  ROOT_DEFENSE_MATRIX_TOOLTIP_DESC,
} from "../services/cri-engine";

const brandDelta = BRAND_DELTA_SYMBOL;

/** Dual delta-neutral strategies keyed by funding-rate direction */
export const STRATEGY_DICTIONARY = {
  CASHCAT: {
    label: "[ ⚡ REC: CASH & CARRY ]",
    actionText: "Buy HL Spot + Short HL Perp",
    tooltip:
      `Strategy: Buy HL Spot + Short HL Perp simultaneously to achieve 0-${brandDelta} price exposure while collecting positive funding APR.`,
    color: "#50D2C1",
  },
  REVERSE_CASHCAT: {
    label: "[ ⚡ REC: REVERSE HEDGE ]",
    actionText: "Short HL Spot + Long HL Perp",
    tooltip:
      "Strategy: Short HL Spot + Long HL Perp simultaneously to harvest yield under negative funding rate conditions.",
    color: "#50D2C1",
  },
} as const;

export type StrategyKey = keyof typeof STRATEGY_DICTIONARY;

/** Friction / volatility metric chip copy (Best Hedge panel) */
export const METRICS_DICTIONARY = {
  FRICTION: {
    label: "⚙️ FRICTION",
    desc: "Combined slippage + liquidity friction (checkSoilResistance linkage)",
  },
  HEAT: {
    label: "🔥 HEAT SCORE",
    desc: "Composite market volatility index (0-100)",
  },
} as const;

/**
 * Resolve CASHCAT vs REVERSE_CASHCAT from strategyType, actionStatus, or funding sign.
 * Positive funding → CASHCAT · Negative funding → REVERSE_CASHCAT.
 *
 * @theory Hull (2018) — Continuous Delta-Neutral Basis Hedging Framework.
 * @theory Gatev et al. (2006) — funding-direction cash-and-carry vs reverse-hedge selection.
 */
export function resolveStrategyKey(input: {
  strategyType?: string | null;
  actionStatus?: string | null;
  fundingRateHourly?: number | null;
}): StrategyKey {
  const typed = String(input.strategyType || "").toUpperCase();
  if (typed === "CASHCAT" || typed === "REVERSE_CASHCAT") {
    return typed as StrategyKey;
  }
  const action = String(input.actionStatus || "");
  if (action === "SHORT_HL_SPOT_LONG_HL_PERP") return "REVERSE_CASHCAT";
  if (action === "BUY_HL_SPOT_SHORT_HL_PERP") return "CASHCAT";
  const fr = Number(input.fundingRateHourly);
  if (Number.isFinite(fr) && fr < 0) return "REVERSE_CASHCAT";
  return "CASHCAT";
}

/** Abbreviate visible Root tags for compact terminal UI: "Root 18" → "R18", "Root 5/10" → "R5/10". */
export function abbrevRootLabel(text: string): string {
  return String(text).replace(/Root\s*(\d+)/g, "R$1");
}

/** Format dynamic Max SL copy for tooltips given account equity */
export function formatDynamicMaxSlCopy(accountEquityUsd = 10_000): {
  maxSlUsd: number;
  dailyCapUsd: number;
  label: string;
  weldLabel: string;
  desc: string;
} {
  const maxSlUsd = computeEffectiveMaxSlUsd(accountEquityUsd);
  const dailyCapUsd = maxSlUsd * DAILY_LOSS_CAP_MULTIPLIER;
  const maxSlStr = `$${maxSlUsd.toFixed(0)}`;
  return {
    maxSlUsd,
    dailyCapUsd,
    label: `MAX SL ${maxSlStr} WELDED`,
    weldLabel: `[ R1: SL ${maxSlStr} WELD ]`,
    desc: `Dynamic Limit Enforced: Effective Max SL = (Account Equity × 1%) + $100 → ${maxSlStr} USD at $${accountEquityUsd.toLocaleString()} equity. Daily drawdown cap (Root 17) = ${maxSlStr} × 3 = $${dailyCapUsd.toFixed(0)}.`,
  };
}

export const STATUS_DICTIONARY = {
  // Step 1: Top Bar & Heartbeat
  TOP_BAR_STATUS: {
    MINDSET:
      "Mindset Status: Psychological discipline check before executing trades.",
    VIX_DVOL:
      "Volatility Index: Real-time implied volatility reading from options/DVOL.",
    TARGET_LOCK:
      "Target State: Indicates whether a token is locked & ready in Step 3.",
    MARKET_HEARTBEAT: {
      SAFE: {
        label: "SAFE / STABLE",
        color: "#50D2C1",
        desc: "Market structure stable. All safety circuit breakers disarmed.",
      },
      ELEVATED: {
        label: "ELEVATED VOL",
        color: "#FFD700",
        desc: "Volatility spiking. Position sizing automatically throttled.",
      },
      LOCKED: {
        label: "CIRCUIT TRIGGERED",
        color: "#FF4D4D",
        desc: "Extreme volatility detected. Step 3 execution hard-locked.",
      },
    },
  },

  // Step 1: Best Hedge & Strategy Radar (labels live in STRATEGY_DICTIONARY)
  BEST_HEDGE_STRATEGY: {
    LOCK_BUTTON: {
      label: "[ 🔒 LOCK BEST HEDGE TO STEP 3 ]",
      desc: `Auto-injects optimal ${brandDelta}-neutral strategy with dynamic Effective Max SL = (Equity × 1%) + $100. ${AUTO_PILOT_BASIS_BADGE}`,
    },
    AUTO_LOCKED: {
      label: "[ 🎯 AUTO LOCKED ]",
      desc: `Top-ranked ${brandDelta}-neutral hedge auto-selected by APR / funding edge.`,
    },
    AUTO_PILOT: {
      label: AUTO_PILOT_BASIS_BADGE,
      desc: "One-click basis arbitrage — optimal ratio computed and Step 3 pre-filled without page reload.",
    },
    MILESTONE: {
      label: MILESTONE_SANDBOX_BADGE,
      desc: "Cross-chain live settlement ships in Milestone 2; sandbox execution is active today.",
    },
  },

  // Step 3: Dynamic Max SL weld badge
  MAX_SL_WELD: {
    label: "MAX SL DYNAMIC WELD",
    color: "#50D2C1",
    desc: "Dynamic Limit Enforced: Effective Max SL USD = (Account Equity × 1%) + $100. Auto-calculates Dynamic Stop-Loss % based on order size and live equity.",
  },

  // Step 1: Volatility Heat
  VOLATILITY_HEAT: {
    SAFE: {
      label: "SAFE",
      color: "#50D2C1",
      desc: "Low market stress. Deep orderbooks and low slippage.",
    },
    ELEVATED: {
      label: "ELEVATED",
      color: "#FFD700",
      desc: "Elevated market stress. Limit orders strongly recommended.",
    },
    DANGER: {
      label: "DANGER",
      color: "#FF4D4D",
      desc: "Extreme market stress. Slippage circuit breaker activated.",
    },
  },

  // Step 2 & 3: Soil & Slippage
  SLIPPAGE_ALERT: {
    ATTACK_READY: {
      label: "ATTACK READY",
      color: "#50D2C1",
      desc: "Spread and estimated slippage within acceptable risk thresholds.",
    },
    CIRCUIT_BREAKER: {
      label: "CIRCUIT BREAKER",
      color: "#FF4D4D",
      desc: "Orderbook depth too thin. Target temporarily locked.",
    },
  },
  SOIL_RESISTANCE: {
    COMPACT: {
      label: "SOIL: COMPACT",
      color: "#50D2C1",
      desc: "High orderbook depth (Slippage < 0.1%). Supports maximum capital execution.",
    },
    BALANCED: {
      label: "SOIL: BALANCED",
      color: "#45C4B4",
      desc: "Moderate depth (Slippage 0.1%-0.3%). Standard capital allocation.",
    },
    LOOSE: {
      label: "SOIL: LOOSE",
      color: "#FFD700",
      desc: "Thin orderbook depth (Slippage > 0.3%). Capital allocation auto-capped.",
    },
  },

  /** Step 1 Root-tagged indicators + hover tooltips (Full English) */
  ROOT_TAGS: {
    ROOT5_VIX_DVOL: {
      label: "[ R5: VIX/DVOL ]",
      desc: "Monitors VIX/DVOL composite index to prevent trading during extreme market turbulence.",
    },
    ROOT13_SESSION: {
      label: "[ R13: Session Gatekeeper ]",
      desc: "Tracks global market trading hours and liquidity venue transitions.",
    },
    ROOT10_TSUNAMI: {
      label: "[ R10: Tsunami Shield / HL Settlement ]",
      desc: "Monitors Hyperliquid funding rate settlement and HKT 21-23 volatility windows.",
    },
    ROOT2_GEO_LOCK: {
      ok: "[ R2: GEO LOCK ]",
      fail: "[ R2: GEO LOCK · BLOCKED ]",
      desc: "Jurisdiction gate: blocks execution from Hyperliquid-restricted geos.",
      lockDesc:
        "LOCKED: Restricted IP or regional compliance barrier triggered. API execution key isolated.",
    },
    ROOT8_SLIPPAGE_BREAKER: {
      ok: "[ R8: SLIPPAGE BREAKER ]",
      fail: "[ R8: SLIPPAGE BREAKER · TRIP ]",
      desc: "Physical slippage circuit breaker (0.5% max limit) active.",
      tripDesc:
        "TRIPPED: Estimated slippage (>0.5%) exceeds safety margin. Execution hard-locked to prevent flash crashes.",
    },
    ROOT1_SL_WELD: {
      label: "[ R1: SL DYNAMIC WELD ]",
      desc: "Dynamic capital protection limit. Single trade max loss = (Account Equity × 1%) + $100 USD.",
    },
    ROOT_MACRO_FILTER: {
      label: "[ R5/R10 Macro Filter ]",
      desc: "Real-time calendar tracking macro event risks (FOMC, CPI) to avoid black-swan volatility.",
    },
    /** Pipeline Bar (auto-guard banner) Root tags */
    ROOT6_MINDSET: {
      clear: "[ R6: Mindset CLEAR ]",
      stressed: "[ R6: Mindset STRESSED ]",
      desc: "Mindset Status: Psychological discipline check before executing trades.",
    },
    ROOT5_MACRO_VOL: {
      normal: "[ R5: MACRO VOL ]",
      elevated: "[ R5: MACRO VOL · ELEVATED ]",
      desc: "Macro volatility gate from VIX/DVOL composite before Step 3 unlock.",
      elevatedDesc:
        "ELEVATED: VIX (>20) or DVOL (>55) macro volatility surge detected. Direct market orders blocked.",
    },
    /** Shield / Tactical Pipeline Bar — Root 5 VIX gate */
    ROOT5_VIX: {
      pass: "[ R5: VIX PASS ]",
      fail: "[ R5: VIX FAIL ]",
      desc: "Volatility Index: Real-time implied volatility reading from options/DVOL.",
      failDesc:
        "ELEVATED: VIX (>20) or DVOL (>55) macro volatility surge detected. Direct market orders blocked.",
    },
    /** Shield / Tactical Pipeline Bar — Root 10 settlement gate */
    ROOT10_SETTLEMENT: {
      clear: "[ R10: SETTLEMENT >5m ]",
      lockdown: "[ R10: SETTLEMENT LOCKDOWN ]",
      desc: "Monitors Hyperliquid funding rate settlement and HKT 21-23 volatility windows.",
      lockdownDesc:
        "LOCKDOWN: Hyperliquid Funding Rate Settlement active (<5m window) or HKT 21-23 US Open surge. Orders paused to prevent oracle gap slippage.",
    },
    /** Shield / Tactical Pipeline Bar — Root 3 soil gate */
    ROOT3_SOIL: {
      safe: "[ R3: SOIL SAFE ]",
      danger: "[ R3: SOIL DANGER ]",
      desc: "Soil Resistance: Orderbook depth vs dynamic Effective Max SL risk boundary before Step 3 unlock.",
      dangerDesc:
        "DANGER: Liquidity depth-to-impact ratio failed check. Max risk exceeds Effective Max SL threshold.",
    },
    ROOT13_TARGET: {
      locked: "[ R13: Target LOCKED ]",
      pending: "[ R13: Target PENDING ]",
      desc: "Target State: Indicates whether a token is locked & ready in Step 3.",
    },
    ROOT18_STEP3: {
      locked: "[ R18: STEP 3 LOCKED 🎯 ]",
      unlocked: "[ R18: STEP 3 UNLOCKED 🎯 ]",
      direct: "[ 🔓 STEP 3 DIRECT ACCESS 🎯 ]",
      desc: "Step 3 execution gate — unlocks only when upstream Root checks pass.",
    },
    /** Flash Pipeline Bar — survey bypass + physical welds */
    FLASH_ACTIVE: {
      label: "[ ⚡ FLASH ACTIVE: SURVEY BYPASSED ]",
      desc: "Pro Sniper Mode. Survey gates bypassed. Root 1 (Dynamic Max SL) and Root 8 (Slippage Breaker) remain welded.",
    },
  },

  /** 6-stage DonDon / Santenmoku status HUD prompts */
  STATUS_HUD: {
    NORMAL: {
      emoji: "🟢",
      label: "Green Scan",
      subtitle: "Silent background monitoring",
      cssClass: "is-normal",
    },
    GROWTH: {
      emoji: "🟢",
      label: "+EXP, LEVEL UP!",
      subtitle: "Safe-zone XP progression burst",
      cssClass: "is-growth",
    },
    WARNING: {
      emoji: "🟡",
      label: "Amber Status / alert",
      subtitle: "Risk hawk eye activated",
      cssClass: "is-warning",
    },
    SHIELD: {
      emoji: "🛡️",
      label: "Shield Protocol",
      subtitle: "Deep root defense active",
      cssClass: "is-shield",
    },
    GOD_MODE: {
      emoji: "👁️",
      label: "SANTENMOKU PROTOCOL: ENGAGED",
      subtitle: "Three-Eyes physical override",
      cssClass: "is-god-mode",
    },
    BLOCKED: {
      emoji: "🔴",
      label: "ERROR 403 / DEADLOCK",
      subtitle: "100% execution deadlock",
      cssClass: "is-blocked",
    },
  },

  /** Step 1 Pipeline Bar — Master Preset Controller (trade modes) */
  TRADE_MODES: {
    SHIELD: {
      label: "Shield",
      button: "[ 🛡️ R6: Shield ]",
      status: "MAX DEFENSE (ALL 20 ROOTS)",
      root: 6,
      desc: "Default Security Mode. Unlocked (0 TXs). Enforces all 20-Root defenses and macro gates.",
    },
    TACTICAL: {
      label: "Tactical",
      button: "[ ⚔️ R13: Tactical ]",
      status: "BALANCED DEFENSE",
      root: 13,
      lockTip: "Requires ≥ 5 HL TXs to unlock",
      desc: "Unlocked via ≥ 5 HL Wallet TXs. Streamlines macro gates while keeping dynamic Max SL & Soil Check active.",
    },
    FLASH: {
      label: "Flash",
      button: "[ ⚡ R18: Flash ]",
      status: "HIGH SPEED DIRECT ACCESS",
      lamp: "HIGH SPEED",
      root: 18,
      lockTip: "Requires ≥ 20 HL TXs",
      desc: "Pro Sniper Mode. Unlocked via ≥ 20 HL Wallet TXs. Direct access to Step 3 with welded Root 1 (Dynamic Max SL) & Root 8 (Slippage Breaker).",
    },
  },

  /** 5-Sec Quick Guide modal steps */
  QUICK_TOUR: {
    TITLE: "5-Sec Quick Guide",
    CTA: "[ 🚀 START EXECUTION / ENTER SANDBOX ]",
    STEP1: {
      title: "Gatekeeper & Preset Roles",
      roots: "[R5/R6/R13]",
      desc: "Monitors macro volatility, session locks, and preset defense modes (Shield/Tactical/Flash) to unlock execution pathways.",
    },
    STEP2: {
      title: "Weak Target Radar",
      roots: "[R11/R12/R16]",
      desc: `Filters venue funding rate extremes and cross-venue yield discrepancies to lock optimal ${brandDelta}-neutral targets.`,
    },
    STEP3: {
      title: "Sniper Shield & Risk Engine",
      roots: "[R1/R3/R8]",
      desc: "Calculates dynamic order size based on soil resistance while enforcing Effective Max SL = (Equity × 1%) + $100.",
    },
    STEP4: {
      title: "Live Vault & Review Logs",
      roots: "[R14/R17/R19/R20]",
      desc: "Real-time vault position telemetry, ClOID order tracking, and automated post-trade review closure.",
    },
  },

  /** Demo Control Hub — Risk Toggle labels + tooltips */
  DEMO_HUB: {
    INTRO: "Centralized risk simulation switches · Does not affect live on-chain execution.",
    SANDBOX: {
      label: "DEMO SANDBOX MODE",
      desc: "Dry-run execution path — zero-key sandbox; toggles SystemState.isSandboxMode for demo walkthroughs.",
    },
    TELEMETRY_INTRO:
      "20-Root Defense Matrix grouped by Step 1–4 Tier Levels · Hover any Root for algorithm tip",
    WALLET_TX_LEVEL: {
      label: "[ Wallet TX Level Override ]",
      desc: "Mock HL wallet fill count to unlock Shield / Tactical / Flash micro-tabs for demo.",
      options: {
        SHIELD: "0 TXs (Shield Only)",
        TACTICAL: "5 TXs (Unlock Tactical)",
        FLASH: "20+ TXs (Unlock All / Flash)",
      },
    },
    ROOT8_SLIPPAGE: {
      label: "[ Root 8: Slippage Breaker Demo ]",
      desc: "Simulates physical slippage breaker triggers to force circuit locks.",
    },
    ROOT10_SETTLEMENT: {
      label: "[ Root 10: Settlement Lockdown Sim ]",
      desc: "Simulates Hyperliquid funding rate settlement volatility locks.",
    },
    ROOT11_FUNDING: {
      label: "[ Root 11: Funding Extreme Sim ]",
      desc: "Simulates extreme funding rate spikes to trigger long/short crowding warnings.",
    },
    ROOT13_GATEKEEPER: {
      label: "[ Root 13: Gatekeeper Switch ]",
      desc: "Toggles session gatekeeper authorization status (PASS / BLOCKED).",
    },
    CRI_TELEMETRY: {
      label: "ROOT DEFENSE MATRIX",
      desc: ROOT_DEFENSE_MATRIX_TOOLTIP_DESC,
    },
    CRI_CONTROL: {
      label: "Defense Presets",
      desc: "Manual ROOT DEFENSE MATRIX override presets for demo walkthroughs. Instantly updates Main Header score, status bar, and DonDon IP visual state.",
      presets: {
        NOMINAL: "NOMINAL",
        WARNING: "WARNING",
        TOXIC: "TOXIC",
        GOD: "DEFCON 1",
      },
      presetTips: {
        NOMINAL:
          "Instantly sets ROOT DEFENSE MATRIX to 100 — optimal green HUD and calm DonDon IP state.",
        WARNING:
          "Sets ROOT DEFENSE MATRIX to 50 — amber warning band; mirrors elevated macro stress.",
        TOXIC:
          "Sets ROOT DEFENSE MATRIX to 20 — toxic circuit posture; triggers hard execution lockdown demo.",
        GOD: "DEFCON 1 global kill-switch — maximum emergency posture across all pipeline steps.",
      },
      resetBtn: "Reset Toxic Lock",
    },
    XP_CONTROLS: {
      label: "[ XP / Level Progression Override ]",
      desc: "Mock RPG XP to trigger GROWTH HUD state when ROOT DEFENSE MATRIX ≤ 25. Drives BEGINNER / INTERMEDIATE / EXPERT tier.",
      presets: {
        PLUS_10: "+10 XP",
        RESET: "Reset XP",
      },
    },
    ROOT_TOGGLES: {
      label: "[ 20-Root ROOT DEFENSE MATRIX Toggles ]",
      desc: "Simulate individual Root trips — immediately recalculates ROOT DEFENSE MATRIX score and updates Main Header + ROOT LED matrix.",
    },
    DEFCON1: {
      label: "[ DEFCON 1: Global Emergency Kill-Switch ]",
      desc: "Triggers global circuit kill-switch. Hard-locks all execution steps.",
      toggleBtn: "[ 🚨 Toggle DEFCON 1 ]",
    },
  },

  /** 20-Root Telemetry — Tier 1–4 pipeline lifecycle groups (Demo Control Hub) */
  ROOT_TELEMETRY_TIERS: {
    TIER1: {
      id: "TIER1",
      badge: "TIER 1",
      emoji: "🛡️",
      title: "TIER 1: STEP 1 - MACRO / GEO PRE-TRADE LOCKS",
      header: "TIER 1: STEP 1 - MACRO / GEO LOCKS",
      focus:
        "Pre-trade physical locks, macro volatility fuses, and geo/session gates",
      roots: [1, 2, 3, 4, 5, 6],
      accent: "emerald",
    },
    TIER2: {
      id: "TIER2",
      badge: "TIER 2",
      emoji: "🎯",
      title: "TIER 2: STEP 2 - TARGET / FUNDING / BASIS SHIELD",
      header: "TIER 2: STEP 2 - TARGET / FUNDING / BASIS",
      focus:
        `${brandDelta}-neutral target selection, yield discrepancy, and settlement locks`,
      roots: [7, 8, 9, 10, 11, 12],
      accent: "cyan",
    },
    TIER3: {
      id: "TIER3",
      badge: "TIER 3",
      emoji: "⚡",
      title: "TIER 3: STEP 3 - EXECUTION / SLIPPAGE / MAX SL",
      header: "TIER 3: STEP 3 - EXECUTION & SLIPPAGE",
      focus:
        "Execution path, slippage breakers, Max SL weld, and dispatch locks",
      roots: [13, 14, 15, 16, 17, 18],
      accent: "yellow",
    },
    TIER4: {
      id: "TIER4",
      badge: "TIER 4",
      emoji: "📊",
      title: "TIER 4: STEP 4 - HKT SETTLEMENT & HARD DEADLOCK",
      header: "TIER 4: STEP 4 - SETTLEMENT & HARD DEADLOCK",
      focus: "HKT settlement gates, ClOID live audit, and hard deadlock closure",
      roots: [19, 20],
      accent: "cyan",
    },
  },

  /** 20-Root Telemetry algorithm tooltips (Demo Control Hub) */
  ROOT_TELEMETRY_TIPS: {
    1: "Dynamic Max SL ceiling = (Account Equity × 1%) + $100 USD regardless of leverage/size.",
    2: "Automated IP and regional compliance barrier check.",
    3: "Liquidity depth-to-impact calculation to prevent thin-order slippage.",
    4: "Detects orderbook candle spikes near hourly candles to block bad fills.",
    5: "Monitors macro volatility indicators (VIX/DVOL) to circuit-break high-risk market entries.",
    6: "Role-based authorization gate (Shield / Tactical / Flash) tied to HL Wallet TX history.",
    7: "Auto-calibrates position leverage based on the dynamic Effective Max SL boundary.",
    8: "Physical slippage circuit breaker. Hard-locks dispatch if slippage exceeds 0.5%.",
    9: "Filters funding rate arbitrage variance across Hyperliquid, Binance, and Bybit.",
    10: "Locks execution within 5 minutes of Hyperliquid funding settlement windows.",
    11: "Detects crowded long/short positioning to prevent squeeze liquidations.",
    12: `Validates spot-perp basis spreads before injecting ${brandDelta}-neutral hedges.`,
    13: "Validates active wallet session signature and execution key permissions.",
    14: "Injects unique Client Order IDs to physically prevent double-fill execution.",
    15: "Monitors cross-chain gas spikes and protocol fee friction.",
    16: "Ensures trade size does not exceed 1% of top-of-book depth.",
    17: "Choice A circuit lock: daily loss > Effective Max SL × 3 OR ≥ 3 SL trips per UTC day → ERROR 403.",
    18: "Enforces underlying Root 1 (Dynamic Max SL) even when Flash Mode bypasses surveys.",
    19: "Real-time order fill tracking and latency telemetry via Worker websockets.",
    20: "Mandatory psychological & execution review gate before unlocking the next trade.",
  },

  /** Canonical Root labels for telemetry rows (Full English) */
  ROOT_TELEMETRY_LABELS: {
    1: "Max Loss Weld (Dynamic SL)",
    2: "Geo Jurisdiction Lock",
    3: "checkSoilResistance()",
    4: "Close Spike Window",
    5: "VIX / DVOL Macro Fuse",
    6: "Beginner Cap Gate & Preset Modes",
    7: "Pre-Calculated Risk Boundary Lock",
    8: "Slippage Breaker (0.5%)",
    9: "Cross-Venue Yield Discrepancy",
    10: "Settlement Lockdown (<5m Window)",
    11: "Funding Extreme Simulation",
    12: `${brandDelta}-Neutral Basis Arbitrage Shield`,
    13: "Session & Address Auth Gatekeeper",
    14: "ClOID Anti-Replay & Deduplication",
    15: "Friction & Gas Cost Safeguard",
    16: "Order Depth-Impact Circuit Breaker",
    17: "Daily Drawdown Cap (Dynamic SL × 3 · 3 SL/day)",
    18: "Direct Access & Direct Bypass Circuit Lock",
    19: "ClOID Live Order Status & Execution Audit",
    20: "Post-Trade Review Closure",
  },
} as const;

export type StatusDictionary = typeof STATUS_DICTIONARY;

/** Serialize for embedding into the vanilla dashboard client script. */
export function statusDictionaryJson(): string {
  return JSON.stringify(STATUS_DICTIONARY);
}

/** Serialize dual-strategy dictionary for dashboard client embed. */
export function strategyDictionaryJson(): string {
  return JSON.stringify(STRATEGY_DICTIONARY);
}

/** Serialize metrics chip dictionary for dashboard client embed. */
export function metricsDictionaryJson(): string {
  return JSON.stringify(METRICS_DICTIONARY);
}
