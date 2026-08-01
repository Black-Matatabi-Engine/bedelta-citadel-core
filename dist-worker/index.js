var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/services/config.ts
var APP_VERSION = "v0.8.0 \u2014 Be\u0394 Living Water \xB7 Santenmoku";
var DEFAULT_TOKENS = [
  "BTC",
  "ETH",
  "SOL",
  "AVAX",
  "LINK",
  "NEAR",
  "DOT",
  "ARB",
  "ADA"
];
var DEFAULT_FRICTION = 12e-4;
var DEFAULT_FIXED_COST_USD = 2.5;
var STRATEGY_APR_THRESHOLD = 5;
var DEFAULT_VIX = 16.8;
var DEFAULT_DVOL = 52.5;
var DEFAULT_GATEWAY_URL = "https://javier-quant-unified-suite.onrender.com/matrix";
function resolveConfig(_env) {
  return {
    version: APP_VERSION,
    telemetryHealthPath: "/api/telemetry/health",
    pythonGatewayUrl: _env.PYTHON_GATEWAY_URL ?? DEFAULT_GATEWAY_URL,
    usePythonGateway: _env.USE_PYTHON_GATEWAY === "true",
    defaultTokens: DEFAULT_TOKENS
  };
}
__name(resolveConfig, "resolveConfig");
function hktTimestamp() {
  return (/* @__PURE__ */ new Date()).toLocaleString("zh-HK", { timeZone: "Asia/Hong_Kong" });
}
__name(hktTimestamp, "hktTimestamp");
var CORS_JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
};

// src/services/defense/humanize-log.ts
var PRODUCT = "Be\u0394";
function humanizeSystemLog(raw) {
  const line = String(raw ?? "").trim();
  if (!line) return "";
  const upper = line.toUpperCase();
  if (/CROSS_VENUE_SLIPPAGE|SPOT_PERP_SLIPPAGE|SOIL_RESISTANCE_TRIP|SPREAD_TOO_HIGH/.test(
    upper
  ) || /SOIL RESISTANCE CIRCUIT BREAKER TRIPPED/i.test(line)) {
    return `[Risk] ${PRODUCT} soil capacity exceeded \u2014 order size auto-capped. Equity protected.`;
  }
  if (/CRI.?HARDLOCK|HARDLOCK|PHYSICAL DEADLOCK/i.test(upper) || /CRI_HARDLOCK/i.test(line)) {
    return `[Risk] Physical deadlock \u2014 CRI zeroed; Hot Key signing channel severed.`;
  }
  if (/ROOT_PROTECTION_TRIP|MAX.?SL|RISKLIMITEXCEEDED/i.test(line)) {
    return `[Risk] Dynamic Max SL engaged \u2014 max loss capped. Equity protected.`;
  }
  if (/DEPTH_USD|MINDEPTH/i.test(line)) {
    return `[Risk] Insufficient book depth \u2014 soil resistance rejected entry.`;
  }
  if (/RPC_NODE_NOT_ALLOWLISTED|NOT ON ALLOWLIST/i.test(line)) {
    return `[Risk] Unauthorized RPC host blocked \u2014 allowlist only.`;
  }
  if (/PIN LOCK|PINNED.*MAX|FOMO/i.test(line)) {
    return `[Risk] Watchlist hard-cap is 3 symbols \u2014 FOMO latch engaged.`;
  }
  if (/ALLMIDS.*FAILED|HL META.*FAILED|NETWORK ERROR|FETCH FAILED/i.test(line)) {
    return `[System] Market node busy \u2014 retry sync, then FORCE REFRESH.`;
  }
  if (/SQL(STATE|EXCEPTION|ERROR)|SQLITE|POSTGRES|MYSQL|PRAGMA/i.test(line)) {
    return `[System] Internal validation failed \u2014 safe degrade; UI remains available.`;
  }
  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|HTTP\s*[45]\d\d|STATUS\s*[45]\d\d/i.test(line)) {
    return `[System] External market feed interrupted \u2014 defense matrix on standby.`;
  }
  if (/STACK TRACE|AT\s+\S+\.(TS|JS):\d+|TYPEERROR:|REFERENCEERROR:/i.test(line)) {
    return `[System] Engine self-check tripped \u2014 fault isolated; service continues.`;
  }
  if (line.startsWith("[Risk]") || line.startsWith("[System]") || line.startsWith("[TRADFI]") || line.startsWith("[allMids]") || line.startsWith("[HL") || line.startsWith("[API]") || line.startsWith("[BUNDLE]") || line.startsWith("[PIPELINE]") || line.startsWith("[SYSTEM]")) {
    return line;
  }
  if (/[{}\[\]]/.test(line) && /error|exception|failed/i.test(line)) {
    return `[System] Sync volatility absorbed \u2014 check panel for latest marks.`;
  }
  return line;
}
__name(humanizeSystemLog, "humanizeSystemLog");
function humanizeSystemLogs(lines) {
  return lines.map(humanizeSystemLog).filter(Boolean);
}
__name(humanizeSystemLogs, "humanizeSystemLogs");

// src/services/humanize-log.ts
var HARDLOCK_HUMAN = "[Risk] Physical deadlock \u2014 CRI zeroed; Hot Key signing channel severed.";
function humanizeHardlockMessage(raw) {
  const line = String(raw ?? "").trim();
  if (/CRI.?HARDLOCK|HARDLOCK|CRI.*0|SIGNING CHANNEL/i.test(line)) {
    return HARDLOCK_HUMAN;
  }
  return humanizeSystemLog(line) || HARDLOCK_HUMAN;
}
__name(humanizeHardlockMessage, "humanizeHardlockMessage");

// src/config/constants.ts
var TAIJI_YANG_CRI_MIN = 75;
var BRAND_DELTA_SYMBOL = "$\\Delta$";
var BRAND_DELTA_NEUTRAL = `${BRAND_DELTA_SYMBOL}-Neutral`;
var BRAND_DELTA_NEUTRAL_RADAR_TITLE = `BEST HEDGE & ${BRAND_DELTA_SYMBOL}-NEUTRAL RADAR`;
var HEALTH_CRI_MAX = 100;
var HEALTH_CRI_MIN = 0;
var HEALTH_CRI_TIER_1_PENALTY = 5;
var HEALTH_CRI_TIER_2_PENALTY = 12;
var HEALTH_CRI_TIER_3_PENALTY = 25;
var HL_EXCHANGE_URL = "https://api.hyperliquid.xyz/exchange";
var HL_INFO_URL = "https://api.hyperliquid.xyz/info";
var HL_TESTNET_INFO_URL = "https://api.hyperliquid-testnet.xyz/info";
var HL_L2_FETCH_TIMEOUT_MS = 8e3;
var HL_L2_MAX_RETRIES = 2;
var HL_L2_PROBE_USD = 1e4;
var HL_L2_CACHE_TTL_MS = 5e3;

// src/services/effective-max-sl.ts
var DYNAMIC_MAX_SL_BASE_USD = 100;
var DYNAMIC_MAX_SL_BALANCE_RATE = 0.01;
function computeEffectiveMaxSlUsd(accountEquityUsd) {
  const equity = Number.isFinite(accountEquityUsd) ? Math.max(0, accountEquityUsd) : 0;
  return equity * DYNAMIC_MAX_SL_BALANCE_RATE + DYNAMIC_MAX_SL_BASE_USD;
}
__name(computeEffectiveMaxSlUsd, "computeEffectiveMaxSlUsd");
function computeSoilRiskUsd(orderSizeUsd, slippageFuse = 5e-3) {
  const size = Math.max(0, Number(orderSizeUsd) || 0);
  const fuse = Math.max(0, Number(slippageFuse) || 0);
  return size * fuse;
}
__name(computeSoilRiskUsd, "computeSoilRiskUsd");
function computeOrderAwareMaxSlUsd(accountEquityUsd, orderSizeUsd, slippageFuse = 5e-3) {
  const dynamicMax = computeEffectiveMaxSlUsd(accountEquityUsd);
  const size = Number(orderSizeUsd);
  if (!Number.isFinite(size) || size <= 0) return dynamicMax;
  return Math.min(dynamicMax, computeSoilRiskUsd(size, slippageFuse));
}
__name(computeOrderAwareMaxSlUsd, "computeOrderAwareMaxSlUsd");

// src/services/risk-control-helpers.ts
function estimateEntryLossUsd(capitalUsd, frictionRate, fixedCostUsd) {
  return capitalUsd * frictionRate + fixedCostUsd;
}
__name(estimateEntryLossUsd, "estimateEntryLossUsd");

// src/services/risk-control.ts
var MAX_SLIPPAGE = 5e-3;
var MIN_DEPTH_USD = 1e5;
var VINE_SOIL_MAX_SLIPPAGE = 3e-3;
var RiskLimitExceeded = class extends Error {
  static {
    __name(this, "RiskLimitExceeded");
  }
  code = "RISK_LIMIT_EXCEEDED";
  httpStatus = 422;
  context;
  constructor(message, context) {
    super(message);
    this.name = "RiskLimitExceeded";
    this.context = context;
  }
};
var HardlockError = class extends Error {
  static {
    __name(this, "HardlockError");
  }
  code = "HARDLOCK";
  httpStatus = 403;
  context;
  constructor(message, context) {
    super(message);
    this.name = "HardlockError";
    this.context = context;
  }
};
var TSUNAMI_SHIELD_HKT_START = 21;
var TSUNAMI_SHIELD_HKT_END = 23;
function getHktHour(now = /* @__PURE__ */ new Date()) {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong",
    hour: "2-digit",
    hour12: false
  }).format(now);
  return parseInt(hour, 10);
}
__name(getHktHour, "getHktHour");
function isTsunamiShieldWindow(now = /* @__PURE__ */ new Date()) {
  const h = getHktHour(now);
  return h >= TSUNAMI_SHIELD_HKT_START && h < TSUNAMI_SHIELD_HKT_END;
}
__name(isTsunamiShieldWindow, "isTsunamiShieldWindow");
function isoNow() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(isoNow, "isoNow");
function emitRiskLog(payload) {
  if (payload.level === "info") return;
  const line = JSON.stringify(payload);
  if (payload.level === "error") {
    console.error(line);
  } else {
    console.warn(line);
  }
}
__name(emitRiskLog, "emitRiskLog");
function formatTripReasons(reasons) {
  return reasons.join("|") || "none";
}
__name(formatTripReasons, "formatTripReasons");
function checkSoilResistance(input) {
  const { symbol, hlSpot, hlPerp, dydxPerp, depthUsd: depthUsd2 } = input;
  const reasons = [];
  if (isTsunamiShieldWindow(input.at)) {
    reasons.push("TSUNAMI_SHIELD_LOCKED_HKT_21_23");
  }
  const crossVenueSlippage = hlPerp > 0 && dydxPerp > 0 ? Math.abs(dydxPerp - hlPerp) / hlPerp : Number.POSITIVE_INFINITY;
  const spotPerpSlippage = hlSpot > 0 ? Math.abs(hlPerp - hlSpot) / hlSpot : Number.POSITIVE_INFINITY;
  if (hlPerp <= 0 || dydxPerp <= 0) {
    reasons.push("INSUFFICIENT_DEPTH_DUAL_VENUE");
  }
  const slippageFuse = input.maxSlippage ?? MAX_SLIPPAGE;
  if (hlPerp > 0 && dydxPerp > 0 && crossVenueSlippage > slippageFuse) {
    reasons.push(
      `CROSS_VENUE_SLIPPAGE=${(crossVenueSlippage * 100).toFixed(4)}%>${slippageFuse * 100}%`
    );
  }
  if (depthUsd2 !== void 0 && depthUsd2 < MIN_DEPTH_USD) {
    reasons.push(`DEPTH_USD=${depthUsd2}<${MIN_DEPTH_USD}`);
  }
  const tripped = reasons.length > 0;
  const result = {
    ok: !tripped,
    tripped,
    crossVenueSlippage: Number.isFinite(crossVenueSlippage) ? crossVenueSlippage : -1,
    spotPerpSlippage: Number.isFinite(spotPerpSlippage) ? spotPerpSlippage : -1,
    reasons
  };
  const orderSize = Number(input.orderSizeUsd);
  const balance = Number(input.accountBalanceUsd);
  if (Number.isFinite(orderSize) && orderSize > 0) {
    const slipForRisk = Number.isFinite(result.crossVenueSlippage) && result.crossVenueSlippage >= 0 ? result.crossVenueSlippage : slippageFuse;
    result.soilRiskUsd = computeSoilRiskUsd(orderSize, slipForRisk);
    if (Number.isFinite(balance) && balance >= 0) {
      result.cappedMaxSlUsd = computeOrderAwareMaxSlUsd(
        balance,
        orderSize,
        slippageFuse
      );
    }
  }
  if (tripped) {
    emitRiskLog({
      level: "warn",
      module: "risk-control",
      event: "SOIL_RESISTANCE_TRIP",
      symbol,
      timestamp: isoNow(),
      message: "Soil resistance circuit breaker tripped \u2014 trade rejected",
      details: {
        crossVenueSlippage: result.crossVenueSlippage,
        spotPerpSlippage: result.spotPerpSlippage,
        maxSlippage: slippageFuse,
        depthUsd: depthUsd2 ?? null,
        minDepthUsd: MIN_DEPTH_USD,
        reasons: formatTripReasons(reasons),
        tradeAllowed: false
      }
    });
  }
  return result;
}
__name(checkSoilResistance, "checkSoilResistance");
function checkSoilResistanceWithVine(input) {
  return checkSoilResistance({
    ...input,
    maxSlippage: input.maxSlippage ?? VINE_SOIL_MAX_SLIPPAGE
  });
}
__name(checkSoilResistanceWithVine, "checkSoilResistanceWithVine");
function vineWrapProtection(input) {
  const {
    symbol,
    estimatedLossUsd,
    accountBalanceUsd,
    frictionUsd,
    criHardlock = false
  } = input;
  const maxLossLimit = input.maxLossLimit ?? computeEffectiveMaxSlUsd(accountBalanceUsd);
  const loss = Math.abs(estimatedLossUsd);
  if (criHardlock) {
    const context = {
      level: "error",
      module: "risk-control",
      event: "CRI_HARDLOCK",
      symbol,
      timestamp: isoNow(),
      message: `CRI hardlock \u2014 vine wrap protection deadlock at 0/100; signing channel blocked`,
      details: {
        cri: 0,
        accountBalanceUsd,
        maxLossLimit,
        frictionUsd: frictionUsd ?? null,
        blocked: true,
        httpStatus: 403
      }
    };
    emitRiskLog(context);
    throw new HardlockError(context.message, context);
  }
  if (loss > maxLossLimit) {
    const context = {
      level: "error",
      module: "risk-control",
      event: "ROOT_PROTECTION_TRIP",
      symbol,
      timestamp: isoNow(),
      message: `Vine wrap protection \u2014 estimated loss $${loss.toFixed(2)} exceeds dynamic Max SL $${maxLossLimit.toFixed(2)}`,
      details: {
        estimatedLossUsd: loss,
        maxLossLimit,
        accountBalanceUsd,
        frictionUsd: frictionUsd ?? null,
        blocked: true
      }
    };
    emitRiskLog(context);
    throw new RiskLimitExceeded(context.message, context);
  }
}
__name(vineWrapProtection, "vineWrapProtection");

// src/services/criEngine.ts
function applyTieredRootPenalty(cri, tier) {
  const current = Number.isFinite(cri) ? Math.max(HEALTH_CRI_MIN, Math.min(HEALTH_CRI_MAX, cri)) : HEALTH_CRI_MAX;
  if (tier === 4) return HEALTH_CRI_MIN;
  if (tier === 3) return Math.max(HEALTH_CRI_MIN, current - HEALTH_CRI_TIER_3_PENALTY);
  if (tier === 2) return Math.max(HEALTH_CRI_MIN, current - HEALTH_CRI_TIER_2_PENALTY);
  return Math.max(HEALTH_CRI_MIN, current - HEALTH_CRI_TIER_1_PENALTY);
}
__name(applyTieredRootPenalty, "applyTieredRootPenalty");
function assertCriHardlock(input) {
  if (input.cri !== HEALTH_CRI_MIN) return;
  vineWrapProtection({
    symbol: input.symbol,
    estimatedLossUsd: 0,
    accountBalanceUsd: input.accountBalanceUsd,
    maxLossLimit: computeEffectiveMaxSlUsd(input.accountBalanceUsd),
    criHardlock: true
  });
}
__name(assertCriHardlock, "assertCriHardlock");

// src/services/taiji-bagua.ts
var BAGUA_KAN_CRI_MAX = 25;
var BAGUA_LI_CRI_MIN = 50;
var BAGUA_GATE_UI = {
  QIAN_OPEN: {
    gate: "QIAN_OPEN",
    label: "\u2630 QIAN \xB7 OPEN",
    shortLabel: "Qian (Open)",
    tooltip: "Qian Gate (Hyperliquid Main Active): Yang offensive state. Full signature enabled.",
    cssClass: "bagua-gate-qian"
  },
  KUN_REST: {
    gate: "KUN_REST",
    label: "\u2637 KUN \xB7 REST",
    shortLabel: "Kun (Rest)",
    tooltip: "Kun Gate (HL Vault Yield Mode): Yin rest state. Earning HL Lend base APR.",
    cssClass: "bagua-gate-kun"
  },
  ZHEN_HARM: {
    gate: "ZHEN_HARM",
    label: "\u2633 ZHEN \xB7 HARM",
    shortLabel: "Zhen (Harm)",
    tooltip: "Zhen Gate (Soil/Slippage Alert): Slippage spring tripped. Tightening entry size.",
    cssClass: "bagua-gate-zhen"
  },
  XUN_BLOCK: {
    gate: "XUN_BLOCK",
    label: "\u2634 XUN \xB7 BLOCK",
    shortLabel: "Xun (Block)",
    tooltip: "Xun Gate (Network Stale): WS heartbeat lost. Hot key signing blocked.",
    cssClass: "bagua-gate-xun"
  },
  KAN_SINK: {
    gate: "KAN_SINK",
    label: "\u2635 KAN \xB7 SINK",
    shortLabel: "Kan (Sink)",
    tooltip: `Kan Gate (${BRAND_DELTA_SYMBOL}-Neutral Sink): Low CRI (<=25). Funds routed to ${BRAND_DELTA_SYMBOL}-neutral hedge.`,
    cssClass: "bagua-gate-kan"
  },
  LI_BRIGHT: {
    gate: "LI_BRIGHT",
    label: "\u2632 LI \xB7 BRIGHT",
    shortLabel: "Li (Bright)",
    tooltip: "Li Gate (Nominal Green): System operating within normal risk parameters.",
    cssClass: "bagua-gate-li"
  },
  GEN_LIFE: {
    gate: "GEN_LIFE",
    label: "\u2636 GEN \xB7 LIFE",
    shortLabel: "Gen (Life)",
    tooltip: "Gen Gate (Living Water Active): Tail risk hedged via Polymarket binary options.",
    cssClass: "bagua-gate-gen"
  },
  DUI_DEATH: {
    gate: "DUI_DEATH",
    label: "\u2631 DUI \xB7 DEATH",
    shortLabel: "Dui (Death)",
    tooltip: "Dui Gate (Genbu Hard Shell): CRI=0 DEFCON 1. Physical deadlock engaged.",
    cssClass: "bagua-gate-dui"
  }
};
var TAIJI_MODE_UI = {
  YANG_STRIKE: {
    label: "( ATTACK MODE )",
    tooltip: `Yang offensive engine \u2014 Tensile \u2265 ${TAIJI_YANG_CRI_MIN}, friction clear, signing channel open.`,
    cssClass: "taiji-mode-yang"
  },
  YIN_YIELD: {
    label: "( GUARD MODE )",
    tooltip: `Yin guard engine \u2014 capital rotated to vault lend / ${BRAND_DELTA_SYMBOL}-neutral sleeves.`,
    cssClass: "taiji-mode-yin"
  }
};
function resolveTaijiMode(state, ctx = {}) {
  const soilOk = ctx.soilTripped !== true;
  const yangMin = typeof TAIJI_YANG_CRI_MIN === "number" ? TAIJI_YANG_CRI_MIN : 75;
  if (!state.hardlock && !state.isStale && state.currentCri >= yangMin && soilOk) {
    return "YANG_STRIKE";
  }
  return "YIN_YIELD";
}
__name(resolveTaijiMode, "resolveTaijiMode");
function resolveActiveGate(state, ctx = {}) {
  const yangMin = typeof TAIJI_YANG_CRI_MIN === "number" ? TAIJI_YANG_CRI_MIN : 75;
  if (state.hardlock || state.currentCri <= 0) return "DUI_DEATH";
  if (state.isStale || state.signingChannelOpen === false) return "XUN_BLOCK";
  if (ctx.soilTripped === true) return "ZHEN_HARM";
  if (ctx.isHedgeActive === true) return "GEN_LIFE";
  if (state.currentCri >= yangMin) return "QIAN_OPEN";
  if (state.currentCri <= BAGUA_KAN_CRI_MAX) return "KAN_SINK";
  if (state.currentCri < BAGUA_LI_CRI_MIN) return "KUN_REST";
  return "LI_BRIGHT";
}
__name(resolveActiveGate, "resolveActiveGate");
function enrichSystemStateTaijiBagua(state, ctx = {}) {
  return {
    ...state,
    taijiMode: resolveTaijiMode(state, ctx),
    activeGate: resolveActiveGate(state, ctx)
  };
}
__name(enrichSystemStateTaijiBagua, "enrichSystemStateTaijiBagua");

// src/services/systemState.ts
var DEFAULT_ACCOUNT_BALANCE_USD = 1e4;
function resolveHudState(currentCri, hardlock, synced = true) {
  if (hardlock || currentCri <= HEALTH_CRI_MIN) return "BLOCKED";
  if (!synced) return "IDLE";
  if (currentCri <= 25) return "SANTENMOKU";
  if (currentCri <= 50) return "AMBER";
  if (currentCri <= 85) return "GREEN";
  return "GREEN";
}
__name(resolveHudState, "resolveHudState");
function deriveCriFromRiskSignals(signals) {
  let cri = HEALTH_CRI_MAX;
  if (signals.tsunamiShieldActive) {
    cri = applyTieredRootPenalty(cri, 1);
  }
  if (signals.macroBlocking || (signals.vix ?? 0) > 20 || (signals.dvol ?? 0) > 55) {
    cri = applyTieredRootPenalty(cri, 1);
  }
  const rows = signals.matrixRows ?? [];
  const anyRootTrip = rows.some(
    (r) => (r.risk_reasons ?? []).includes("RISK_LIMIT_EXCEEDED")
  );
  const anySoilTrip = rows.some(
    (r) => r.risk_tripped === true && !(r.risk_reasons ?? []).includes("RISK_LIMIT_EXCEEDED")
  );
  if (anyRootTrip) {
    cri = applyTieredRootPenalty(cri, 3);
  } else if (anySoilTrip) {
    cri = applyTieredRootPenalty(cri, 2);
  }
  return cri;
}
__name(deriveCriFromRiskSignals, "deriveCriFromRiskSignals");
function buildSystemState(input = {}) {
  const accountBalanceUsd = input.accountBalanceUsd ?? DEFAULT_ACCOUNT_BALANCE_USD;
  const currentCri = input.currentCri ?? HEALTH_CRI_MAX;
  const dynamicMaxSL = computeEffectiveMaxSlUsd(accountBalanceUsd);
  const hardlock = currentCri <= HEALTH_CRI_MIN;
  const hudState = resolveHudState(currentCri, hardlock, true);
  if (!input.skipHardlockAssert && hardlock) {
    assertCriHardlock({
      symbol: input.symbol ?? "SYSTEM",
      cri: HEALTH_CRI_MIN,
      accountBalanceUsd
    });
  }
  const base = {
    accountBalanceUsd,
    currentCri,
    dynamicMaxSL,
    hudState,
    hardlock,
    signingChannelOpen: !hardlock,
    isSandboxMode: input.isSandboxMode ?? false,
    isStale: false
  };
  return enrichSystemStateTaijiBagua(base, {
    soilTripped: input.soilTripped,
    isHedgeActive: input.isHedgeActive
  });
}
__name(buildSystemState, "buildSystemState");
function buildSystemStateFromSignals(signals, accountBalanceUsd = DEFAULT_ACCOUNT_BALANCE_USD) {
  const currentCri = deriveCriFromRiskSignals(signals);
  const rows = signals.matrixRows ?? [];
  const anySoilTrip = rows.some(
    (r) => r.risk_tripped === true && !(r.risk_reasons ?? []).includes("RISK_LIMIT_EXCEEDED")
  );
  return buildSystemState({
    accountBalanceUsd,
    currentCri,
    symbol: "SYSTEM",
    soilTripped: anySoilTrip
  });
}
__name(buildSystemStateFromSignals, "buildSystemStateFromSignals");
function buildBlockedSystemState(accountBalanceUsd = DEFAULT_ACCOUNT_BALANCE_USD) {
  return enrichSystemStateTaijiBagua({
    accountBalanceUsd,
    currentCri: HEALTH_CRI_MIN,
    dynamicMaxSL: computeEffectiveMaxSlUsd(accountBalanceUsd),
    hudState: "BLOCKED",
    hardlock: true,
    signingChannelOpen: false,
    isSandboxMode: false,
    isStale: false
  });
}
__name(buildBlockedSystemState, "buildBlockedSystemState");

// src/api/hardlock-response.ts
function hardlockResponse(err, accountBalanceUsd) {
  const systemState = buildBlockedSystemState(accountBalanceUsd);
  const body = {
    success: false,
    error: humanizeHardlockMessage(err.message),
    hardlock: true,
    code: "HARDLOCK",
    signingChannelOpen: false,
    systemState
  };
  return new Response(JSON.stringify(body), {
    status: 403,
    headers: CORS_JSON_HEADERS
  });
}
__name(hardlockResponse, "hardlockResponse");

// src/services/macro-radar.ts
var MACRO_BLOCK_MS = 6 * 60 * 60 * 1e3;
var US_MACRO_EVENTS = [
  {
    id: "macroFomcCountdown",
    label: "US FED FOMC",
    dates: [
      "2026-07-29T18:00:00Z",
      "2026-09-16T18:00:00Z",
      "2026-11-04T19:00:00Z",
      "2026-12-16T19:00:00Z"
    ]
  },
  {
    id: "macroCpiCountdown",
    label: "US CPI",
    dates: [
      "2026-08-12T12:30:00Z",
      "2026-09-11T12:30:00Z",
      "2026-10-14T12:30:00Z"
    ]
  },
  {
    id: "macroEcbCountdown",
    label: "EU ECB",
    dates: [
      "2026-09-11T12:15:00Z",
      "2026-10-30T12:15:00Z",
      "2026-12-18T13:15:00Z"
    ]
  },
  {
    id: "macroBojCountdown",
    label: "Asia BOJ",
    dates: [
      "2026-09-19T03:00:00Z",
      "2026-10-31T03:00:00Z",
      "2026-12-19T03:00:00Z"
    ]
  }
];
function nextMacroDate(dates, now = /* @__PURE__ */ new Date()) {
  const t = now.getTime();
  for (const iso of dates) {
    const d = new Date(iso).getTime();
    if (d + 2 * 3600 * 1e3 > t) return d;
  }
  return new Date(dates[dates.length - 1]).getTime();
}
__name(nextMacroDate, "nextMacroDate");
function computeIsMacroBlocking(now = /* @__PURE__ */ new Date()) {
  const t = now.getTime();
  for (const ev of US_MACRO_EVENTS) {
    const target = nextMacroDate(ev.dates, now);
    if (target - t <= MACRO_BLOCK_MS) return true;
  }
  return false;
}
__name(computeIsMacroBlocking, "computeIsMacroBlocking");

// src/services/stateManager.ts
function extractCriticalKvFlags(state) {
  if (!isSystemStateLike(state)) return null;
  const s = state;
  return {
    taijiMode: s.taijiMode ?? null,
    activeGate: s.activeGate ?? null,
    circuitBreaker: s.signingChannelOpen === false || s.hardlock === true,
    rootProtection: s.hardlock === true || s.currentCri <= 0,
    currentCri: Math.round(s.currentCri)
  };
}
__name(extractCriticalKvFlags, "extractCriticalKvFlags");
function criticalKvFlagsEqual(a, b) {
  return a.taijiMode === b.taijiMode && a.activeGate === b.activeGate && a.circuitBreaker === b.circuitBreaker && a.rootProtection === b.rootProtection && a.currentCri === b.currentCri;
}
__name(criticalKvFlagsEqual, "criticalKvFlagsEqual");
function shouldPersistSystemStateToKv(existingState, mergedState) {
  const next = extractCriticalKvFlags(mergedState);
  if (!next) return true;
  const prev = extractCriticalKvFlags(existingState);
  if (!prev) return true;
  return !criticalKvFlagsEqual(prev, next);
}
__name(shouldPersistSystemStateToKv, "shouldPersistSystemStateToKv");
function matrixSensorFingerprint(payload) {
  if (typeof payload !== "object" || payload === null) return null;
  const p = payload;
  const matrix = Array.isArray(p.matrix) ? p.matrix : Array.isArray(p.data) ? p.data : [];
  return JSON.stringify({
    rows: matrix.length,
    kings: p.funding_rate_kings ?? null,
    vix: p.vix_traditional ?? p.vix ?? null,
    dvol: p.dvol_crypto ?? null
  });
}
__name(matrixSensorFingerprint, "matrixSensorFingerprint");
function shouldPersistMatrixPayloadToKv(existingPayload, nextPayload) {
  const nextFp = matrixSensorFingerprint(nextPayload);
  if (!nextFp) return true;
  const prevFp = matrixSensorFingerprint(existingPayload);
  if (!prevFp) return true;
  return nextFp !== prevFp;
}
__name(shouldPersistMatrixPayloadToKv, "shouldPersistMatrixPayloadToKv");

// src/services/kv-store.ts
var KV_KEYS = {
  SYSTEM_STATE: "system:state",
  SYSTEM_HEARTBEAT: "system:heartbeat",
  SYSTEM_PING: "system:ping",
  SYSTEM_DEMO_SNAPSHOT: "system:demo_snapshot",
  SYSTEM_R20_LOCKED: "system:r20_locked",
  SOAK_TELEMETRY: "telemetry:soak-rolling",
  MARKET_SNAPSHOT: "market:price-basis-snapshot",
  MATRIX_LATEST: "matrix:latest",
  RISK_LOG_ROLLING: "telemetry:risk-log-rolling"
};
var KV_TTL_SECONDS = {
  SYSTEM_STATE: 86400,
  // 24h TTL — prevents hardlock state evicting on short KV expiry
  MATRIX: 300,
  MARKET: 300,
  SOAK: 86400,
  RISK_LOG: 86400
};
function resolveKv(kv) {
  return kv;
}
__name(resolveKv, "resolveKv");
function isSystemStateLike(state) {
  if (typeof state !== "object" || state === null) return false;
  const s = state;
  return typeof s.accountBalanceUsd === "number" && typeof s.currentCri === "number" && typeof s.dynamicMaxSL === "number" && typeof s.hardlock === "boolean";
}
__name(isSystemStateLike, "isSystemStateLike");
function mergeSystemStateRecords(local, remote) {
  const accountBalanceUsd = Math.min(
    local.accountBalanceUsd,
    remote.accountBalanceUsd
  );
  const currentCri = Math.min(local.currentCri, remote.currentCri);
  const hardlock = local.hardlock || remote.hardlock || currentCri <= 0;
  const base = buildSystemState({
    accountBalanceUsd,
    currentCri,
    skipHardlockAssert: true,
    isSandboxMode: local.isSandboxMode || remote.isSandboxMode
  });
  return {
    ...base,
    hardlock,
    signingChannelOpen: !hardlock,
    hudState: hardlock ? "BLOCKED" : base.hudState,
    dynamicMaxSL: base.dynamicMaxSL
  };
}
__name(mergeSystemStateRecords, "mergeSystemStateRecords");
async function saveSystemStateToKV(kv, stateData, ttlSeconds2 = KV_TTL_SECONDS.SYSTEM_STATE) {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.SYSTEM_STATE, skipped: true };
  }
  try {
    let payload = stateData;
    const existing = await readSystemStateFromKV(binding);
    if (isSystemStateLike(stateData)) {
      if (existing && isSystemStateLike(existing.state)) {
        payload = mergeSystemStateRecords(existing.state, stateData);
      }
    }
    const record = {
      version: 1,
      savedAt: (/* @__PURE__ */ new Date()).toISOString(),
      state: payload
    };
    if (isSystemStateLike(payload) && existing && !shouldPersistSystemStateToKv(existing.state, payload)) {
      return { ok: true, key: KV_KEYS.SYSTEM_STATE, skipped: true };
    }
    const effectiveTtl = isSystemStateLike(payload) && payload.hardlock ? 86400 : ttlSeconds2;
    await binding.put(KV_KEYS.SYSTEM_STATE, JSON.stringify(record), {
      expirationTtl: effectiveTtl
    });
    return { ok: true, key: KV_KEYS.SYSTEM_STATE, skipped: false };
  } catch {
    return { ok: false, key: KV_KEYS.SYSTEM_STATE, skipped: false };
  }
}
__name(saveSystemStateToKV, "saveSystemStateToKV");
async function saveMatrixPayloadToKV(kv, payload, ttlSeconds2 = KV_TTL_SECONDS.MATRIX) {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.MATRIX_LATEST, skipped: true };
  }
  try {
    const raw = await binding.get(KV_KEYS.MATRIX_LATEST);
    if (raw) {
      try {
        const existing = JSON.parse(raw);
        if (existing?.payload && !shouldPersistMatrixPayloadToKv(existing.payload, payload)) {
          return { ok: true, key: KV_KEYS.MATRIX_LATEST, skipped: true };
        }
      } catch {
      }
    }
    await binding.put(
      KV_KEYS.MATRIX_LATEST,
      JSON.stringify({
        version: 1,
        savedAt: (/* @__PURE__ */ new Date()).toISOString(),
        payload
      }),
      { expirationTtl: ttlSeconds2 }
    );
    return { ok: true, key: KV_KEYS.MATRIX_LATEST, skipped: false };
  } catch {
    return { ok: false, key: KV_KEYS.MATRIX_LATEST, skipped: false };
  }
}
__name(saveMatrixPayloadToKV, "saveMatrixPayloadToKV");
async function saveSoakTelemetryToKV(kv, log, ttlSeconds2 = KV_TTL_SECONDS.SOAK) {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.SOAK_TELEMETRY, skipped: true };
  }
  try {
    await binding.put(KV_KEYS.SOAK_TELEMETRY, JSON.stringify(log), {
      expirationTtl: ttlSeconds2
    });
    return { ok: true, key: KV_KEYS.SOAK_TELEMETRY, skipped: false };
  } catch {
    return { ok: false, key: KV_KEYS.SOAK_TELEMETRY, skipped: false };
  }
}
__name(saveSoakTelemetryToKV, "saveSoakTelemetryToKV");
async function readSystemStateFromKV(kv) {
  const binding = resolveKv(kv);
  if (!binding) return null;
  try {
    const raw = await binding.get(KV_KEYS.SYSTEM_STATE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(readSystemStateFromKV, "readSystemStateFromKV");

// src/services/defense/salt-engine.ts
var XUANWU_CANONICAL_SALT = "\u7384\u6B66";
var OWNER_IDENTITY_TAG = "0xWallet";
var JAVIER_SIGNATURE_LITERAL = "Javier";
var envOverride;
function readProcessEnv() {
  if (envOverride) return envOverride;
  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }
  return {};
}
__name(readProcessEnv, "readProcessEnv");
function validateTripleStringUnlock(env = readProcessEnv()) {
  return env.XUANWU_SALT?.trim() === XUANWU_CANONICAL_SALT && env.OWNER_IDENTITY?.trim() === OWNER_IDENTITY_TAG && env.JAVIER_SIGNATURE?.trim() === JAVIER_SIGNATURE_LITERAL;
}
__name(validateTripleStringUnlock, "validateTripleStringUnlock");
function isXuanwuRpcStripAuthorized(env = readProcessEnv()) {
  return validateTripleStringUnlock(env);
}
__name(isXuanwuRpcStripAuthorized, "isXuanwuRpcStripAuthorized");

// src/services/defense/rpc-whitelist.ts
var PRODUCTION_RPC_HOSTS = [
  "api.hyperliquid.xyz",
  "api.hyperliquid-testnet.xyz",
  "indexer.dydx.trade",
  "javier-quant-unified-suite.onrender.com",
  "quote-api.jup.ag",
  "arbitrum-api.gmxinfra.io",
  "arb1.arbitrum.io",
  "clob.polymarket.com",
  "gamma-api.polymarket.com",
  "api-v3.raydium.io",
  "api.mainnet.orca.so",
  "gateway.thegraph.com",
  "api.camelot.exchange"
];
var HONEYPOT_RPC_HOSTS = [
  "rpc.silvervine-clone.trap",
  "api.santenboku-scraper.trap"
];
var DEFAULT_WHITELIST_WITH_TRAPS = [
  ...PRODUCTION_RPC_HOSTS,
  ...HONEYPOT_RPC_HOSTS
];
var HONEYPOT_SIMULATED_SLIPPAGE = 0.99;
var RpcNodeNotAllowlistedError = class extends Error {
  constructor(url) {
    super(`RPC node not on allowlist: ${url}`);
    this.url = url;
    this.name = "RpcNodeNotAllowlistedError";
  }
  url;
  static {
    __name(this, "RpcNodeNotAllowlistedError");
  }
  code = "RPC_NODE_NOT_ALLOWLISTED";
};
var HoneyPotCircuitBreakError = class extends Error {
  constructor(url) {
    super(
      `Honey-pot RPC circuit-break \u2014 Triple-String unlock failed (simSlippage=${HONEYPOT_SIMULATED_SLIPPAGE}): ${url}`
    );
    this.url = url;
    this.name = "HoneyPotCircuitBreakError";
  }
  url;
  static {
    __name(this, "HoneyPotCircuitBreakError");
  }
  code = "HONEYPOT_CIRCUIT_BREAK";
  httpStatus = 500;
  simulatedSlippage = HONEYPOT_SIMULATED_SLIPPAGE;
};
function hostFromUrl(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}
__name(hostFromUrl, "hostFromUrl");
function isHoneyPotHost(host) {
  return HONEYPOT_RPC_HOSTS.some((h) => h.toLowerCase() === host);
}
__name(isHoneyPotHost, "isHoneyPotHost");
function resolveEffectiveRpcHosts(env, extraHosts = []) {
  const base = isXuanwuRpcStripAuthorized(env) ? PRODUCTION_RPC_HOSTS : DEFAULT_WHITELIST_WITH_TRAPS;
  return [...base, ...extraHosts];
}
__name(resolveEffectiveRpcHosts, "resolveEffectiveRpcHosts");
function assertRpcAllowlisted(url, extraHosts = [], env) {
  const host = hostFromUrl(url);
  if (!host) {
    throw new RpcNodeNotAllowlistedError(url);
  }
  const allowed = new Set(
    resolveEffectiveRpcHosts(env, extraHosts).map((h) => h.toLowerCase())
  );
  if (!allowed.has(host)) {
    throw new RpcNodeNotAllowlistedError(url);
  }
}
__name(assertRpcAllowlisted, "assertRpcAllowlisted");
async function fetchAllowlisted(url, init, extraHosts = [], env) {
  const host = hostFromUrl(url);
  if (host && isHoneyPotHost(host) && !validateTripleStringUnlock(env)) {
    throw new HoneyPotCircuitBreakError(url);
  }
  assertRpcAllowlisted(url, extraHosts, env);
  return fetch(url, init);
}
__name(fetchAllowlisted, "fetchAllowlisted");

// src/services/exchanges/dydx-adapter.ts
var DYDX_PERPETUAL_MARKETS_URL = "https://indexer.dydx.trade/v4/perpetualMarkets";
var UA_HEADERS = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };
function parseDydxTicker(ticker) {
  const match = /^([A-Z0-9]+)-USD$/i.exec(ticker.trim());
  return match ? match[1].toUpperCase() : null;
}
__name(parseDydxTicker, "parseDydxTicker");
function parseDydxPerpMidsFromMarkets(markets) {
  const out = {};
  for (const market of Object.values(markets)) {
    if (market.status !== "ACTIVE") continue;
    const symbol = parseDydxTicker(market.ticker);
    if (!symbol) continue;
    const mid = parseFloat(market.oraclePrice);
    if (!Number.isFinite(mid) || mid <= 0) continue;
    out[symbol] = mid;
  }
  return out;
}
__name(parseDydxPerpMidsFromMarkets, "parseDydxPerpMidsFromMarkets");
async function fetchDydxPerpMids() {
  const response = await fetchAllowlisted(DYDX_PERPETUAL_MARKETS_URL, {
    headers: UA_HEADERS,
    signal: AbortSignal.timeout(8e3)
  });
  if (!response.ok) {
    throw new Error(`dYdX perpetualMarkets HTTP ${response.status}`);
  }
  const payload = await response.json();
  return parseDydxPerpMidsFromMarkets(payload.markets ?? {});
}
__name(fetchDydxPerpMids, "fetchDydxPerpMids");

// src/services/exchanges/asset-classifier.ts
var COMMODITY_KEYWORD_KEYS = [
  ["BRENTOIL", "brent"],
  ["WTIOIL", "wti"],
  ["NATGAS", "natgas"],
  ["PALLADIUM", "palladium"],
  ["PLATINUM", "platinum"],
  ["ALUMINIUM", "aluminium"],
  ["ALUMINUM", "aluminium"],
  ["COPPER", "copper"],
  ["SILVER", "silver"],
  ["URNM", "urnm"],
  ["BRENT", "brent"],
  ["GOLD", "gold"],
  ["WTI", "wti"]
];
var STOCK_KEYWORD_KEYS = [
  ["SKHYNIX", "skhynix"],
  ["SAMSUNG", "samsung"],
  ["SSNHY", "samsung"],
  ["SMSN", "smsn"],
  ["GOOGL", "googl"],
  ["GOOG", "goog"],
  ["MSFT", "msft"],
  ["INTC", "intc"],
  ["CRCL", "crcl"],
  ["AAPL", "aapl"],
  ["TSLA", "tsla"],
  ["META", "meta"],
  ["AMZN", "amzn"],
  ["TSMC", "tsmc"],
  ["SNDK", "sndk"],
  ["DRAM", "dram"],
  ["NVDA", "nvda"],
  ["SKHY", "skhynix"],
  ["AMD", "amd"],
  ["TSM", "tsm"],
  ["MU", "mu"]
];
var INDEX_KEYWORD_KEYS = [
  ["XYZ100", "xyz100"],
  ["S&P500", "sp500"],
  ["SP500", "sp500"],
  ["US500", "us500"],
  ["JP225", "jp225"],
  ["KR200", "kr200"],
  ["NDX", "xyz100"],
  ["QQQ", "qqq"]
];
var FX_KEYWORD_KEYS = [
  ["USDJPY", "usdjpy"],
  ["EURUSD", "eurusd"],
  ["GBPUSD", "gbpusd"],
  ["USDKRW", "usdkrw"],
  ["DXY", "dxy"]
];
var FX_SINGLE_CCY = [
  ["EUR", "eurusd"],
  ["GBP", "gbpusd"],
  ["JPY", "usdjpy"],
  ["KRW", "usdkrw"]
];
var PRE_IPO_HIGHLIGHT_TICKERS = ["CXMT", "QNT"];
function findKeywordKey(upperName, table) {
  for (const [keyword, key] of table) {
    if (keyword === "MU") {
      if (/(?:^|[^A-Z0-9])MU(?:[^A-Z0-9]|$)/.test(upperName)) return key;
      continue;
    }
    if (keyword === "GOLD") {
      if (upperName.includes("GOLD") && !upperName.includes("GOLDMAN") && !upperName.includes("GOLDFISH") && !upperName.includes("GOOGL") && !upperName.includes("GOOG")) {
        return key;
      }
      continue;
    }
    if (keyword === "TSM") {
      if (/(?:^|[^A-Z0-9])TSM(?:[^A-Z0-9]|$)/.test(upperName)) return key;
      continue;
    }
    if (keyword === "NDX") {
      if (/(?:^|[^A-Z0-9])NDX(?:[^A-Z0-9]|$)/.test(upperName)) return key;
      continue;
    }
    if (upperName.includes(keyword)) return key;
  }
  return void 0;
}
__name(findKeywordKey, "findKeywordKey");
function isPreIpoName(upper) {
  return upper.includes("PRE-IPO") || upper.includes("PREIPO") || upper.includes("PRE_IPO") || /PRE[\s_-]?IPO/.test(upper);
}
__name(isPreIpoName, "isPreIpoName");
function normalizeTradFiBody(rawName) {
  let upper = String(rawName ?? "").trim().toUpperCase();
  upper = upper.replace(/&/g, "");
  upper = upper.replace(
    /^(XYZ|HIP3|FLAUNCH|XYZDEX|UNIT|CASH)[:/\-_]+/i,
    ""
  );
  const xyzIdx = upper.indexOf("XYZ:");
  if (xyzIdx >= 0) upper = upper.slice(xyzIdx + 4);
  upper = upper.replace(/[-_/]USDC$/i, "");
  upper = upper.replace(/[-_/]USD$/i, "");
  return upper.trim();
}
__name(normalizeTradFiBody, "normalizeTradFiBody");
function isXyzOrHip3Key(rawName) {
  const k = String(rawName ?? "").trim().toUpperCase();
  return /^(XYZ|HIP3|FLAUNCH|XYZDEX)[:/\-_]/i.test(k) || k.includes("XYZ:");
}
__name(isXyzOrHip3Key, "isXyzOrHip3Key");
function hlBodySymbol(rawName) {
  const normalized = normalizeTradFiBody(rawName);
  const parts = normalized.split(/[^A-Z0-9]+/).filter(Boolean);
  return parts[parts.length - 1] ?? normalized;
}
__name(hlBodySymbol, "hlBodySymbol");
function preIpoPayloadKey(bodyUpper) {
  const body = bodyUpper.replace(/PRE[\s_-]?IPO/g, " ").replace(/[^A-Z0-9]+/g, " ").trim();
  const parts = body.split(/\s+/).filter(Boolean);
  return (parts[parts.length - 1] || parts[0] || "preipo").toLowerCase();
}
__name(preIpoPayloadKey, "preIpoPayloadKey");
function isPreIpoHighlight(normalized) {
  for (const sym of PRE_IPO_HIGHLIGHT_TICKERS) {
    if (normalized === sym || normalized.endsWith(sym)) return sym.toLowerCase();
  }
  return void 0;
}
__name(isPreIpoHighlight, "isPreIpoHighlight");
function placeTradFiAsset(rawName, opts) {
  const trimmed = String(rawName ?? "").trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  const bodyUpper = normalizeTradFiBody(trimmed);
  const hlSymbol = hlBodySymbol(trimmed);
  const catchAll = opts?.assumeTradFiUniverse === true || isXyzOrHip3Key(trimmed);
  if (isPreIpoName(upper) || isPreIpoName(bodyUpper)) {
    return {
      category: "preipo",
      key: preIpoPayloadKey(bodyUpper),
      hlSymbol
    };
  }
  const highlightKey = isPreIpoHighlight(bodyUpper);
  if (highlightKey) {
    return {
      category: "preipo",
      key: highlightKey,
      hlSymbol: highlightKey.toUpperCase(),
      isHighlight: true
    };
  }
  const indexKey = findKeywordKey(upper, INDEX_KEYWORD_KEYS) ?? findKeywordKey(bodyUpper, INDEX_KEYWORD_KEYS);
  if (indexKey) {
    return { category: "index", key: indexKey, hlSymbol };
  }
  for (const [ccy, fxKey2] of FX_SINGLE_CCY) {
    if (bodyUpper === ccy) {
      return { category: "fx", key: fxKey2, hlSymbol: ccy };
    }
  }
  const fxKey = findKeywordKey(upper, FX_KEYWORD_KEYS) ?? findKeywordKey(bodyUpper, FX_KEYWORD_KEYS);
  if (fxKey) {
    return { category: "fx", key: fxKey, hlSymbol };
  }
  if (bodyUpper === "CL") {
    return { category: "commodity", key: "wti", hlSymbol: "CL" };
  }
  if (bodyUpper === "BRENTOIL" || bodyUpper.includes("BRENTOIL")) {
    return { category: "commodity", key: "brent", hlSymbol: "BRENTOIL" };
  }
  const commodityKey = findKeywordKey(upper, COMMODITY_KEYWORD_KEYS) ?? findKeywordKey(bodyUpper, COMMODITY_KEYWORD_KEYS);
  if (commodityKey) {
    return { category: "commodity", key: commodityKey, hlSymbol };
  }
  const stockKey = findKeywordKey(upper, STOCK_KEYWORD_KEYS) ?? findKeywordKey(bodyUpper, STOCK_KEYWORD_KEYS);
  if (stockKey) {
    return { category: "stock", key: stockKey, hlSymbol };
  }
  if (catchAll) {
    const key = hlSymbol.replace(/[^A-Z0-9]/gi, "").toLowerCase();
    if (!key || key.length < 1) return null;
    return { category: "stock", key, hlSymbol };
  }
  return null;
}
__name(placeTradFiAsset, "placeTradFiAsset");
function classifyHyperliquidAsset(rawName) {
  const trimmed = rawName.trim();
  const placement = placeTradFiAsset(trimmed);
  if (placement) {
    return {
      rawName: trimmed,
      normalizedSymbol: trimmed,
      assetClass: placement.category,
      tradFiKey: placement.key
    };
  }
  let body = trimmed;
  if (body.startsWith("@")) body = body.slice(1);
  return {
    rawName: trimmed,
    normalizedSymbol: body.toUpperCase(),
    assetClass: "crypto"
  };
}
__name(classifyHyperliquidAsset, "classifyHyperliquidAsset");
function isTradFiAsset(name) {
  const c = classifyHyperliquidAsset(name);
  return c.assetClass !== "crypto";
}
__name(isTradFiAsset, "isTradFiAsset");
function isXyzAsset(name) {
  return name.toUpperCase().includes("XYZ:") || isTradFiAsset(name);
}
__name(isXyzAsset, "isXyzAsset");

// src/services/exchanges/exchange-adapter.ts
var DEFAULT_ADAPTER_SLIPPAGE_LIMIT = 5e-3;
function calculateSlippageRatio(referencePrice, executionPrice) {
  if (referencePrice <= 0) return Number.POSITIVE_INFINITY;
  return Math.abs(executionPrice - referencePrice) / referencePrice;
}
__name(calculateSlippageRatio, "calculateSlippageRatio");
function evaluateOrderSlippage(input, maxSlippage = DEFAULT_ADAPTER_SLIPPAGE_LIMIT) {
  const slippageRatio = calculateSlippageRatio(
    input.referencePrice,
    input.executionPrice
  );
  const slippageUsd = input.notionalUsd * slippageRatio;
  return {
    slippageRatio,
    slippageUsd,
    acceptable: Number.isFinite(slippageRatio) && slippageRatio <= maxSlippage
  };
}
__name(evaluateOrderSlippage, "evaluateOrderSlippage");

// src/services/check-soil-resistance.ts
function buildSoilInputFromLiveBook(probe, at) {
  return {
    symbol: probe.symbol,
    hlSpot: probe.bestBid,
    hlPerp: probe.bestAsk,
    dydxPerp: probe.midPx,
    depthUsd: probe.depthUsd,
    at
  };
}
__name(buildSoilInputFromLiveBook, "buildSoilInputFromLiveBook");
function auditLiveBookSoilResistance(probe, at) {
  const base = checkSoilResistance(buildSoilInputFromLiveBook(probe, at));
  const reasons = [...base.reasons];
  const spreadRatio = probe.spreadBps / 1e4;
  const impactRatio = probe.priceImpactBps / 1e4;
  if (spreadRatio > MAX_SLIPPAGE) {
    reasons.push(
      `LIVE_SPREAD_BPS=${probe.spreadBps.toFixed(2)}>${MAX_SLIPPAGE * 1e4}bps`
    );
  }
  if (impactRatio > MAX_SLIPPAGE) {
    reasons.push(
      `LIVE_PRICE_IMPACT_BPS=${probe.priceImpactBps.toFixed(2)}>${MAX_SLIPPAGE * 1e4}bps`
    );
  }
  const tripped = reasons.length > 0;
  return {
    ok: !tripped,
    tripped,
    crossVenueSlippage: base.crossVenueSlippage,
    spotPerpSlippage: base.spotPerpSlippage,
    reasons,
    probe,
    spreadBps: probe.spreadBps,
    priceImpactBps: probe.priceImpactBps
  };
}
__name(auditLiveBookSoilResistance, "auditLiveBookSoilResistance");

// src/services/exchanges/tradfi-allmids.ts
function normalizeAllMidsKey(rawKey) {
  let k = String(rawKey ?? "").trim().toUpperCase();
  k = k.replace(/&/g, "");
  k = k.replace(
    /^(XYZ|HIP3|FLAUNCH|XYZDEX|UNIT|CASH)[:/\-_]+/i,
    ""
  );
  k = k.replace(/[-_/]USDC$/i, "");
  k = k.replace(/[-_/]USD$/i, "");
  return k.trim();
}
__name(normalizeAllMidsKey, "normalizeAllMidsKey");
function parseMidPrice(raw) {
  if (raw === void 0 || raw === null) return null;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}
__name(parseMidPrice, "parseMidPrice");
function assignOnce(bucket, key, price) {
  if (bucket[key] !== void 0 && bucket[key] > 0) return false;
  bucket[key] = price;
  return true;
}
__name(assignOnce, "assignOnce");
function mergeAllMidsMaps(main, xyz) {
  return { ...main ?? {}, ...xyz ?? {} };
}
__name(mergeAllMidsMaps, "mergeAllMidsMaps");
function extractTradFiFromAllMids(allMids, _logs = []) {
  const commodities = {};
  const stocks = {};
  const indices = {};
  const fx = {};
  const preipo = {};
  const mids = allMids ?? {};
  for (const [rawKey, rawVal] of Object.entries(mids)) {
    const price = parseMidPrice(rawVal);
    if (price === null) continue;
    const normalized = normalizeAllMidsKey(rawKey);
    if (!normalized) continue;
    const placement = placeTradFiAsset(rawKey);
    if (!placement) continue;
    switch (placement.category) {
      case "commodity":
        assignOnce(commodities, placement.key, price);
        break;
      case "stock":
        assignOnce(stocks, placement.key, price);
        break;
      case "index":
        assignOnce(indices, placement.key, price);
        break;
      case "fx":
        assignOnce(fx, placement.key, price);
        break;
      case "preipo":
        assignOnce(preipo, placement.key, price);
        break;
    }
  }
  if (indices.sp500 && !indices.us500) {
    indices.us500 = indices.sp500;
  }
  return { commodities, stocks, indices, fx, preipo };
}
__name(extractTradFiFromAllMids, "extractTradFiFromAllMids");

// src/services/exchanges/tradfi-enrichment.ts
var CATEGORY_BUCKET = {
  commodity: "commodities",
  stock: "stocks",
  index: "indices",
  fx: "fx",
  preipo: "preipo"
};
var DISPLAY_NAMES = {
  brent: "BRENT",
  wti: "WTI",
  gold: "GOLD",
  silver: "SILVER",
  copper: "COPPER",
  natgas: "NATGAS",
  platinum: "PLATINUM",
  palladium: "PALLADIUM",
  aluminium: "ALUMINIUM",
  urnm: "URNM",
  nvda: "NVDA",
  samsung: "SAMSUNG",
  smsn: "SMSN",
  googl: "GOOGL",
  goog: "GOOG",
  msft: "MSFT",
  intc: "INTC",
  crcl: "CRCL",
  aapl: "AAPL",
  tsla: "TSLA",
  meta: "META",
  amzn: "AMZN",
  tsmc: "TSMC",
  tsm: "TSM",
  mu: "MU",
  skhynix: "SKHYNIX",
  dram: "DRAM",
  sndk: "SNDK",
  amd: "AMD",
  xyz100: "XYZ100",
  sp500: "SP500",
  us500: "US500",
  jp225: "JP225",
  kr200: "KR200",
  qqq: "QQQ",
  usdjpy: "USDJPY",
  eurusd: "EURUSD",
  gbpusd: "GBPUSD",
  usdkrw: "USDKRW",
  dxy: "DXY",
  cxmt: "CXMT",
  qnt: "QNT"
};
function displayNameForKey(key) {
  return DISPLAY_NAMES[key.toLowerCase()] ?? key.toUpperCase();
}
__name(displayNameForKey, "displayNameForKey");
function upsertAsset(bucket, key, hlSymbol, markPrice, change24h_pct, openInterest, fundingRateHourly, isHighlight) {
  const oiSize = openInterest ?? 0;
  const notional = markPrice > 0 && oiSize > 0 ? markPrice * oiSize : 0;
  const fr8h = Number.isFinite(fundingRateHourly) && fundingRateHourly !== void 0 ? fundingRateHourly * 8 * 100 : void 0;
  const existing = bucket[key];
  const existingNotional = existing?.openInterestNotionalUsd ?? 0;
  if (existing && existingNotional > notional) {
    if (isHighlight && !existing.isHighlight) {
      existing.isHighlight = true;
    }
    return;
  }
  bucket[key] = {
    hlSymbol,
    markPrice,
    change24h_pct,
    openInterest: oiSize > 0 ? oiSize : existing?.openInterest,
    openInterestNotionalUsd: notional > 0 ? notional : existing?.openInterestNotionalUsd,
    fundingRateHourly: Number.isFinite(fundingRateHourly) ? fundingRateHourly : existing?.fundingRateHourly,
    fundingRate8h_pct: fr8h !== void 0 ? fr8h : existing?.fundingRate8h_pct,
    isHighlight: isHighlight || existing?.isHighlight
  };
}
__name(upsertAsset, "upsertAsset");
function pickKing(bucket) {
  let bestKey = "";
  let bestNotional = 0;
  let bestHl = "";
  for (const [key, asset] of Object.entries(bucket)) {
    const notional = asset.openInterestNotionalUsd ?? 0;
    if (notional > bestNotional) {
      bestNotional = notional;
      bestKey = key;
      bestHl = asset.hlSymbol;
    }
  }
  if (bestNotional <= 0 || !bestKey) return void 0;
  return {
    key: bestKey,
    hlSymbol: bestHl,
    openInterestNotionalUsd: bestNotional,
    displayName: displayNameForKey(bestKey)
  };
}
__name(pickKing, "pickKing");
function parseTradFiEnrichmentFromXyzMeta(raw, _logs = []) {
  const pack = {
    commodities: {},
    stocks: {},
    indices: {},
    fx: {},
    preipo: {},
    kings: {}
  };
  const universe = raw[0]?.universe ?? [];
  const ctxs = raw[1] ?? [];
  for (let i = 0; i < universe.length; i++) {
    const name = universe[i]?.name ?? "";
    const ctx = ctxs[i] ?? {};
    const mid = parseFloat(ctx.midPx ?? ctx.oraclePx ?? "0");
    const prev = parseFloat(ctx.prevDayPx ?? "0");
    const oi = parseFloat(ctx.openInterest ?? "0");
    const funding = parseFloat(ctx.funding ?? "0");
    if (!Number.isFinite(mid) || mid <= 0) continue;
    const placement = placeTradFiAsset(name, { assumeTradFiUniverse: true });
    if (!placement) continue;
    let change24h_pct;
    if (Number.isFinite(prev) && prev > 0) {
      change24h_pct = (mid - prev) / prev * 100;
    }
    const bucketKey = CATEGORY_BUCKET[placement.category];
    const bucket = pack[bucketKey];
    upsertAsset(
      bucket,
      placement.key,
      placement.hlSymbol,
      mid,
      change24h_pct,
      Number.isFinite(oi) && oi > 0 ? oi : void 0,
      Number.isFinite(funding) ? funding : void 0,
      placement.isHighlight
    );
  }
  for (const cat of [
    "commodities",
    "stocks",
    "indices",
    "fx",
    "preipo"
  ]) {
    const king = pickKing(pack[cat]);
    if (king) pack.kings[cat] = king;
  }
  return pack;
}
__name(parseTradFiEnrichmentFromXyzMeta, "parseTradFiEnrichmentFromXyzMeta");

// src/services/exchanges/hyperliquid-adapter.ts
var UA_HEADERS2 = { "User-Agent": "Mozilla/5.0" };
var l2BookCache = /* @__PURE__ */ new Map();
function parseDayVolume(ctx) {
  const ntl = parseFloat(ctx.dayNtlVlm ?? "0");
  if (Number.isFinite(ntl) && ntl > 0) return ntl;
  return 0;
}
__name(parseDayVolume, "parseDayVolume");
function resolveIsSpotAsset(asset, classified) {
  if (classified.assetClass === "commodity" || classified.assetClass === "stock" || classified.assetClass === "index" || classified.assetClass === "fx" || classified.assetClass === "preipo") {
    return false;
  }
  if (typeof asset.isSpot === "boolean") {
    return asset.isSpot;
  }
  const name = asset.name ?? "";
  if (/-USDC$/i.test(name) || /\/USDC$/i.test(name)) {
    return true;
  }
  if (Array.isArray(asset.tokens) && asset.tokens.length > 0) {
    return true;
  }
  return false;
}
__name(resolveIsSpotAsset, "resolveIsSpotAsset");
function parseHyperliquidCryptoResponse(raw, _logs = []) {
  const quotes = {};
  const hlSpot = {};
  const hlPerp = {};
  const hlFunding = {};
  const dayVolumeUsd = {};
  const universe = raw[0]?.universe ?? [];
  const ctxs = raw[1] ?? [];
  universe.forEach((asset, index) => {
    const classified = classifyHyperliquidAsset(asset.name);
    if (classified.assetClass !== "crypto") return;
    const ctx = ctxs[index] ?? {};
    const price = parseFloat(ctx.oraclePx ?? ctx.midPx ?? "0");
    const dayVol = parseDayVolume(ctx);
    const isSpot = resolveIsSpotAsset(asset, classified);
    const fundingRate = parseFloat(ctx.funding ?? "0") || 0;
    const symbol = classified.normalizedSymbol;
    const existing = quotes[symbol];
    if (!isSpot) {
      quotes[symbol] = {
        symbol,
        spotPrice: existing?.spotPrice,
        perpPrice: price,
        fundingRate,
        depthUsd: existing?.depthUsd ?? dayVol,
        assetClass: "crypto",
        dayVolumeUsd: dayVol || existing?.dayVolumeUsd
      };
      if (price > 0) hlPerp[symbol] = price;
      hlFunding[symbol] = fundingRate;
      if (dayVol > 0) dayVolumeUsd[symbol] = dayVol;
    } else {
      quotes[symbol] = {
        symbol,
        spotPrice: price,
        perpPrice: existing?.perpPrice ?? price,
        fundingRate: existing?.fundingRate ?? 0,
        depthUsd: existing?.depthUsd,
        assetClass: "crypto",
        dayVolumeUsd: existing?.dayVolumeUsd
      };
      if (price > 0) hlSpot[symbol] = price;
    }
  });
  return {
    snapshot: {
      exchangeId: "hyperliquid",
      quotes,
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    cryptoMaps: { hlSpot, hlPerp, hlFunding },
    dayVolumeUsd
  };
}
__name(parseHyperliquidCryptoResponse, "parseHyperliquidCryptoResponse");
async function postHlInfo(body) {
  return fetchAllowlisted(HL_INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...UA_HEADERS2 },
    body: JSON.stringify(body)
  });
}
__name(postHlInfo, "postHlInfo");
async function postHlTestnetInfo(body, fetchFn, timeoutMs) {
  assertRpcAllowlisted(HL_TESTNET_INFO_URL, ["api.hyperliquid-testnet.xyz"]);
  return fetchFn(HL_TESTNET_INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...UA_HEADERS2 },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs)
  });
}
__name(postHlTestnetInfo, "postHlTestnetInfo");
function readCachedL2Book(coin) {
  const key = coin.toUpperCase();
  const entry = l2BookCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.snapshot;
}
__name(readCachedL2Book, "readCachedL2Book");
function writeCachedL2Book(snapshot) {
  l2BookCache.set(snapshot.coin.toUpperCase(), {
    snapshot,
    expiresAt: Date.now() + HL_L2_CACHE_TTL_MS
  });
}
__name(writeCachedL2Book, "writeCachedL2Book");
function parseLevelPxSz(level) {
  if (Array.isArray(level)) {
    return { px: parseFloat(level[0]), sz: parseFloat(level[1]) };
  }
  return { px: parseFloat(level.px), sz: parseFloat(level.sz) };
}
__name(parseLevelPxSz, "parseLevelPxSz");
function sumBookSideUsd(levels, maxLevels = 10) {
  if (!levels?.length) return 0;
  let sum = 0;
  for (let i = 0; i < Math.min(levels.length, maxLevels); i++) {
    const { px, sz } = parseLevelPxSz(levels[i]);
    if (Number.isFinite(px) && Number.isFinite(sz) && px > 0 && sz > 0) {
      sum += px * sz;
    }
  }
  return sum;
}
__name(sumBookSideUsd, "sumBookSideUsd");
function computeLiveBookSpreadBps(bestBid, bestAsk) {
  if (bestBid <= 0 || bestAsk <= 0) return Number.POSITIVE_INFINITY;
  const mid = (bestBid + bestAsk) / 2;
  return (bestAsk - bestBid) / mid * 1e4;
}
__name(computeLiveBookSpreadBps, "computeLiveBookSpreadBps");
function computeLivePriceImpactBps(asks, midPx, probeUsd = HL_L2_PROBE_USD) {
  if (!(midPx > 0) || !asks.length) return Number.POSITIVE_INFINITY;
  let remaining = probeUsd;
  let filledUsd = 0;
  let filledQty = 0;
  for (const level of asks) {
    const { px, sz } = parseLevelPxSz(level);
    if (!(px > 0 && sz > 0)) continue;
    const levelUsd = px * sz;
    const takeUsd = Math.min(remaining, levelUsd);
    filledUsd += takeUsd;
    filledQty += takeUsd / px;
    remaining -= takeUsd;
    if (remaining <= 0) break;
  }
  if (filledQty <= 0 || filledUsd <= 0) return Number.POSITIVE_INFINITY;
  const avgPx = filledUsd / filledQty;
  return (avgPx - midPx) / midPx * 1e4;
}
__name(computeLivePriceImpactBps, "computeLivePriceImpactBps");
function computeLiveBookMetrics(book, probeUsd = HL_L2_PROBE_USD) {
  const bids = book.levels?.[0] ?? [];
  const asks = book.levels?.[1] ?? [];
  const bestBid = bids[0] ? parseLevelPxSz(bids[0]).px : 0;
  const bestAsk = asks[0] ? parseLevelPxSz(asks[0]).px : 0;
  if (!(bestBid > 0 && bestAsk > 0)) return null;
  const midPx = (bestBid + bestAsk) / 2;
  const bidDepthUsd = sumBookSideUsd(bids);
  const askDepthUsd = sumBookSideUsd(asks);
  return {
    bestBid,
    bestAsk,
    midPx,
    spreadBps: computeLiveBookSpreadBps(bestBid, bestAsk),
    bidDepthUsd,
    askDepthUsd,
    depthUsd: Math.min(bidDepthUsd, askDepthUsd),
    priceImpactBps: computeLivePriceImpactBps(asks, midPx, probeUsd)
  };
}
__name(computeLiveBookMetrics, "computeLiveBookMetrics");
async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
__name(sleep, "sleep");
async function fetchLiveL2Book(coin, options = {}) {
  const symbol = coin.toUpperCase();
  const fetchFn = options.fetchFn ?? fetch;
  const timeoutMs = options.timeoutMs ?? HL_L2_FETCH_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? HL_L2_MAX_RETRIES;
  if (options.forceDegraded) {
    const cached2 = readCachedL2Book(symbol);
    if (cached2) return { ...cached2, live: false, source: "cache" };
    return {
      coin: symbol,
      book: { coin: symbol, levels: [[], []] },
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      live: false,
      source: "degraded"
    };
  }
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await postHlTestnetInfo(
        { type: "l2Book", coin: symbol },
        fetchFn,
        timeoutMs
      );
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after") ?? "0");
        await sleep(retryAfter > 0 ? retryAfter * 1e3 : 500 * (attempt + 1));
        lastError = new Error("Hyperliquid testnet rate limited (429)");
        continue;
      }
      if (!res.ok) {
        lastError = new Error(`Hyperliquid testnet l2Book HTTP ${res.status}`);
        continue;
      }
      const book = await res.json();
      const snapshot = {
        coin: symbol,
        book: {
          coin: book.coin ?? symbol,
          levels: book.levels ?? [[], []],
          time: book.time
        },
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
        live: true,
        source: "testnet"
      };
      writeCachedL2Book(snapshot);
      return snapshot;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await sleep(250 * (attempt + 1));
      }
    }
  }
  const cached = readCachedL2Book(symbol);
  if (cached) {
    console.warn(
      `[HL l2Book] ${symbol} fallback to cache after error:`,
      lastError
    );
    return { ...cached, live: false, source: "cache" };
  }
  console.error(`[HL l2Book] ${symbol} degraded \u2014 no cache:`, lastError);
  return {
    coin: symbol,
    book: { coin: symbol, levels: [[], []] },
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    live: false,
    source: "degraded"
  };
}
__name(fetchLiveL2Book, "fetchLiveL2Book");
function peekCachedLiveL2Book(coin) {
  return readCachedL2Book(coin.toUpperCase());
}
__name(peekCachedLiveL2Book, "peekCachedLiveL2Book");
var HyperliquidAdapter = class {
  static {
    __name(this, "HyperliquidAdapter");
  }
  id = "hyperliquid";
  displayName = "Hyperliquid";
  lastBundle = null;
  getLastBundle() {
    return this.lastBundle;
  }
  async fetchMarketData() {
    const bundle = await this.fetchClassifiedBundle();
    return bundle.snapshot;
  }
  /** Fetch crypto + TradFi in parallel; TradFi never aborts crypto path. */
  async fetchClassifiedBundle() {
    const debugSystemLogs = [];
    let crypto2 = {
      snapshot: {
        exchangeId: "hyperliquid",
        quotes: {},
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      cryptoMaps: { hlSpot: {}, hlPerp: {}, hlFunding: {} },
      dayVolumeUsd: {}
    };
    let allMids = {};
    const [metaResult, metaXyzResult, midsMainResult, midsXyzResult] = await Promise.allSettled([
      postHlInfo({ type: "metaAndAssetCtxs" }),
      postHlInfo({ type: "metaAndAssetCtxs", dex: "xyz" }),
      postHlInfo({ type: "allMids" }),
      postHlInfo({ type: "allMids", dex: "xyz" })
    ]);
    try {
      if (metaResult.status === "fulfilled" && metaResult.value.ok) {
        const raw = await metaResult.value.json();
        crypto2 = parseHyperliquidCryptoResponse(raw, debugSystemLogs);
      } else {
        const reason = metaResult.status === "rejected" ? String(metaResult.reason) : `HTTP ${metaResult.value.status}`;
        const msg = `[HL meta] FAILED: ${reason}`;
        debugSystemLogs.push(msg);
        console.error(msg);
      }
    } catch (err) {
      const msg = `[HL meta] PARSE ERROR: ${String(err)}`;
      debugSystemLogs.push(msg);
      console.error(msg, err);
    }
    let tradfiEnrichment = {
      commodities: {},
      stocks: {},
      indices: {},
      fx: {},
      preipo: {},
      kings: {}
    };
    try {
      if (metaXyzResult.status === "fulfilled" && metaXyzResult.value.ok) {
        const rawXyz = await metaXyzResult.value.json();
        tradfiEnrichment = parseTradFiEnrichmentFromXyzMeta(
          rawXyz,
          debugSystemLogs
        );
      } else {
        const reason = metaXyzResult.status === "rejected" ? String(metaXyzResult.reason) : `HTTP ${metaXyzResult.value.status}`;
        const msg = `[HL meta] xyz dex FAILED: ${reason}`;
        debugSystemLogs.push(msg);
        console.error(msg);
      }
    } catch (err) {
      const msg = `[HL meta] xyz dex PARSE ERROR: ${String(err)}`;
      debugSystemLogs.push(msg);
      console.error(msg, err);
    }
    let mainMids = {};
    let xyzMids = {};
    try {
      if (midsMainResult.status === "fulfilled" && midsMainResult.value.ok) {
        mainMids = await midsMainResult.value.json();
      } else {
        const reason = midsMainResult.status === "rejected" ? String(midsMainResult.reason) : `HTTP ${midsMainResult.value.status}`;
        const msg = `[allMids] main FAILED: ${reason}`;
        debugSystemLogs.push(msg);
        console.error(msg);
      }
    } catch (err) {
      const msg = `[allMids] main PARSE ERROR: ${String(err)}`;
      debugSystemLogs.push(msg);
      console.error(msg, err);
    }
    try {
      if (midsXyzResult.status === "fulfilled" && midsXyzResult.value.ok) {
        xyzMids = await midsXyzResult.value.json();
      } else {
        const reason = midsXyzResult.status === "rejected" ? String(midsXyzResult.reason) : `HTTP ${midsXyzResult.value.status}`;
        const msg = `[allMids] xyz dex FAILED: ${reason} \u2014 TradFi may be empty`;
        debugSystemLogs.push(msg);
        console.error(msg);
      }
    } catch (err) {
      const msg = `[allMids] xyz dex PARSE ERROR: ${String(err)}`;
      debugSystemLogs.push(msg);
      console.error(msg, err);
    }
    allMids = mergeAllMidsMaps(mainMids, xyzMids);
    const tradFi = extractTradFiFromAllMids(allMids, debugSystemLogs);
    const bundle = {
      snapshot: crypto2.snapshot,
      cryptoMaps: crypto2.cryptoMaps,
      dayVolumeUsd: crypto2.dayVolumeUsd,
      commodities: tradFi.commodities,
      stocks: tradFi.stocks,
      indices: tradFi.indices,
      fx: tradFi.fx,
      preipo: tradFi.preipo,
      tradfiEnrichment,
      debugSystemLogs
    };
    this.lastBundle = bundle;
    return bundle;
  }
  calculateOrderSlippage(input) {
    return evaluateOrderSlippage(input);
  }
  buildOrderPayload(input) {
    const isBuy = input.side === "buy";
    const size = input.sizeUsd;
    const price = input.limitPrice ?? 0;
    const symbol = input.symbol.toUpperCase();
    console.log(
      `[ORDER] ${input.side} ${symbol} sizeUsd=${size} limit=${price}`
    );
    return {
      exchangeId: "hyperliquid",
      symbol,
      side: input.side,
      endpoint: HL_EXCHANGE_URL,
      method: "POST",
      headers: { "Content-Type": "application/json", ...UA_HEADERS2 },
      body: {
        type: "order",
        orders: [
          {
            a: symbol,
            b: isBuy,
            p: String(price),
            s: String(size),
            r: input.reduceOnly ?? false,
            t: { limit: { tif: "Ioc" } }
          }
        ]
      }
    };
  }
};
var hyperliquidAdapter = new HyperliquidAdapter();
async function fetchHyperliquidMaps() {
  const bundle = await hyperliquidAdapter.fetchClassifiedBundle();
  return bundle.cryptoMaps;
}
__name(fetchHyperliquidMaps, "fetchHyperliquidMaps");
function evaluateSoilResistance(distancePct) {
  if (distancePct < 10) return "CRITICAL";
  if (distancePct <= 20) return "WARNING";
  return "HEALTHY";
}
__name(evaluateSoilResistance, "evaluateSoilResistance");

// src/services/exchanges/fetch-exchange-maps.ts
function sanitizeCryptoMap(input) {
  const out = {};
  for (const [key, value] of Object.entries(input)) {
    if (isTradFiAsset(key) || key.includes(":")) continue;
    if (!Number.isFinite(value) || value <= 0) continue;
    out[key.toUpperCase()] = value;
  }
  return out;
}
__name(sanitizeCryptoMap, "sanitizeCryptoMap");
function sanitizeFundingMap(input) {
  const out = {};
  for (const [key, value] of Object.entries(input)) {
    if (isTradFiAsset(key) || key.includes(":")) continue;
    if (!Number.isFinite(value)) continue;
    out[key.toUpperCase()] = value;
  }
  return out;
}
__name(sanitizeFundingMap, "sanitizeFundingMap");
async function fetchExchangeBundle() {
  const [hlBundle, dydxPerpRaw] = await Promise.all([
    hyperliquidAdapter.fetchClassifiedBundle(),
    fetchDydxPerpMids().catch((err) => {
      console.error("[dYdX] perpetual mid fetch failed", err);
      return {};
    })
  ]);
  const commodities = { ...hlBundle.commodities };
  const stocks = { ...hlBundle.stocks };
  const indices = { ...hlBundle.indices };
  const fx = { ...hlBundle.fx };
  const preipo = { ...hlBundle.preipo };
  const debugSystemLogs = [...hlBundle.debugSystemLogs ?? []];
  if (Object.keys(dydxPerpRaw).length === 0) {
    debugSystemLogs.push("[dYdX] WARN: dydxPerp map empty \u2014 soil resistance may trip");
  } else {
    debugSystemLogs.push(
      `[dYdX] synced ${Object.keys(dydxPerpRaw).length} perpetual mids`
    );
  }
  const maps = {
    hlSpot: sanitizeCryptoMap(hlBundle.cryptoMaps.hlSpot),
    hlPerp: sanitizeCryptoMap(hlBundle.cryptoMaps.hlPerp),
    dydxPerp: sanitizeCryptoMap(dydxPerpRaw),
    hlFunding: sanitizeFundingMap(hlBundle.cryptoMaps.hlFunding),
    hlDayVolumeUsd: sanitizeCryptoMap(hlBundle.dayVolumeUsd)
  };
  return {
    maps,
    commodities,
    stocks,
    indices,
    fx,
    preipo,
    tradfiEnrichment: hlBundle.tradfiEnrichment,
    debugSystemLogs
  };
}
__name(fetchExchangeBundle, "fetchExchangeBundle");

// src/services/assemble-matrix.ts
var RISK_EVAL_CAPITAL_USD = 1e4;
var RULE_FUNDING_STD_MAX = 0.015;
function pickStrategy(hlFunding, annualYield) {
  if (annualYield <= STRATEGY_APR_THRESHOLD) {
    return "[ HOLD ]";
  }
  if (hlFunding > 0) {
    return "[ LONG HL SPOT + SHORT HL PERP ]";
  }
  if (hlFunding < 0) {
    return "[ SHORT HL SPOT + LONG HL PERP ]";
  }
  return "[ HOLD ]";
}
__name(pickStrategy, "pickStrategy");
function applyRiskToRow(symbol, c1_spot, d1_perp, dydxPerp, strategy, depthUsd2) {
  const soil = checkSoilResistance({
    symbol,
    hlSpot: c1_spot,
    hlPerp: d1_perp,
    dydxPerp,
    depthUsd: depthUsd2
  });
  const estimatedLossUsd = estimateEntryLossUsd(
    RISK_EVAL_CAPITAL_USD,
    DEFAULT_FRICTION,
    DEFAULT_FIXED_COST_USD
  );
  const maxLossLimit = computeEffectiveMaxSlUsd(RISK_EVAL_CAPITAL_USD);
  let rootTripped = false;
  let rootReason;
  try {
    vineWrapProtection({
      symbol,
      estimatedLossUsd,
      accountBalanceUsd: RISK_EVAL_CAPITAL_USD,
      maxLossLimit,
      frictionUsd: estimatedLossUsd
    });
  } catch (err) {
    if (err instanceof RiskLimitExceeded || err instanceof HardlockError) {
      rootTripped = true;
      rootReason = err.code;
    } else {
      throw err;
    }
  }
  const reasons = [...soil.reasons];
  if (rootReason) reasons.push(rootReason);
  const risk_tripped = soil.tripped || rootTripped;
  if (!risk_tripped) {
    return {
      j1_strategy: strategy,
      actionStatus: void 0,
      risk_tripped: false,
      risk_reasons: [],
      risk_estimated_loss_usd: estimatedLossUsd
    };
  }
  const actionStatus = soil.reasons.some(
    (r) => r.startsWith("SPOT_PERP_SLIPPAGE") || r.startsWith("DEPTH_USD") || r === "INSUFFICIENT_HL_DEPTH"
  ) ? "SPREAD_TOO_HIGH" : "HOLD";
  return {
    j1_strategy: actionStatus === "SPREAD_TOO_HIGH" ? "[ REJECT \u2014 SPREAD TOO WIDE ]" : "[ HOLD \xB7 RISK BREAKER ]",
    actionStatus,
    risk_tripped: true,
    risk_reasons: reasons,
    risk_estimated_loss_usd: estimatedLossUsd
  };
}
__name(applyRiskToRow, "applyRiskToRow");
function estimateNetProfit7d(annualYieldPct) {
  const dailyYieldRate = annualYieldPct / 100 / 365;
  const dailyGross = RISK_EVAL_CAPITAL_USD * dailyYieldRate;
  const frictionUsd = estimateEntryLossUsd(
    RISK_EVAL_CAPITAL_USD,
    DEFAULT_FRICTION,
    DEFAULT_FIXED_COST_USD
  );
  return dailyGross * 7 - frictionUsd;
}
__name(estimateNetProfit7d, "estimateNetProfit7d");
function estimateFundingStdDev24h(hlFunding) {
  const level = Math.abs(hlFunding);
  return Math.min(0.05, level * 4);
}
__name(estimateFundingStdDev24h, "estimateFundingStdDev24h");
function resolveMaxLossLimit(accountBalanceUsd) {
  const maxLossLimit = computeEffectiveMaxSlUsd(accountBalanceUsd);
  return {
    maxLossLimit,
    maxLossLabel: `Max SL $${maxLossLimit.toFixed(2)} (Balance\xD71%+$100)`
  };
}
__name(resolveMaxLossLimit, "resolveMaxLossLimit");
function passesRuleA(row) {
  if (!row.onHyperliquid || row.d1_hl_perp <= 0) return false;
  return row.score > 0 && row.netProfit7d > 0 && row.fundingStdDev24h < RULE_FUNDING_STD_MAX;
}
__name(passesRuleA, "passesRuleA");
var RULE_B_TOP_N = 10;
function funding8hPct(hourlyRate) {
  return hourlyRate * 8 * 100;
}
__name(funding8hPct, "funding8hPct");
function resolveRuleBTopSymbols(maps, topN = RULE_B_TOP_N) {
  return Object.entries(maps.hlFunding ?? {}).filter(
    ([sym, rate]) => !isXyzAsset(sym) && !sym.includes(":") && Number.isFinite(rate) && Math.abs(rate) > 0 && (maps.hlPerp[sym] ?? 0) > 0
  ).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, topN).map(([sym]) => sym);
}
__name(resolveRuleBTopSymbols, "resolveRuleBTopSymbols");
function computeFundingRateKings(maps) {
  const entries = Object.entries(maps.hlFunding ?? {}).filter(
    ([sym, rate]) => !isXyzAsset(sym) && !sym.includes(":") && Number.isFinite(rate) && (maps.hlPerp[sym] ?? 0) > 0
  );
  if (entries.length === 0) return void 0;
  let highest = entries[0];
  let lowest = entries[0];
  for (const entry of entries) {
    if (entry[1] > highest[1]) highest = entry;
    if (entry[1] < lowest[1]) lowest = entry;
  }
  const positive = entries.filter(([, rate]) => rate > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([symbol, rate]) => ({
    symbol,
    rate8h_pct: funding8hPct(rate)
  }));
  const negative = entries.filter(([, rate]) => rate < 0).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([symbol, rate]) => ({
    symbol,
    rate8h_pct: funding8hPct(rate)
  }));
  return {
    highest: {
      symbol: highest[0],
      rate8h_pct: funding8hPct(highest[1])
    },
    lowest: {
      symbol: lowest[0],
      rate8h_pct: funding8hPct(lowest[1])
    },
    topPositive: positive.length > 0 ? positive : void 0,
    topNegative: negative.length > 0 ? negative : void 0
  };
}
__name(computeFundingRateKings, "computeFundingRateKings");
function resolveHlCryptoUniverse(maps, preferred = DEFAULT_TOKENS) {
  const fromHl = Object.keys(maps.hlPerp).filter(
    (s) => !isXyzAsset(s) && !s.includes(":") && (maps.hlPerp[s] ?? 0) > 0
  );
  const preferredSet = new Set(preferred.map((t) => t.toUpperCase()));
  const preferredHits = fromHl.filter((s) => preferredSet.has(s));
  const rest = fromHl.filter((s) => !preferredSet.has(s));
  return [...preferredHits, ...rest.sort()];
}
__name(resolveHlCryptoUniverse, "resolveHlCryptoUniverse");
function assembleMatrix(hkt, maps, tokens = DEFAULT_TOKENS) {
  const { hlSpot, hlPerp, hlFunding, hlDayVolumeUsd, dydxPerp } = maps;
  const universe = resolveHlCryptoUniverse(maps, tokens);
  const candidates = [];
  for (const symbol of universe) {
    if (isXyzAsset(symbol) || symbol.includes(":")) continue;
    const hlPerpPx = hlPerp[symbol] ?? 0;
    const hlSpotPx = hlSpot[symbol] ?? hlSpot[`${symbol}-SPOT`] ?? 0;
    if (hlPerpPx <= 0) continue;
    const spotBasis = hlSpotPx > 0 ? hlSpotPx : hlPerpPx;
    const e1_funding = hlFunding[symbol] ?? 0;
    const onHyperliquid = true;
    const k1_basis = (hlPerpPx - spotBasis) / spotBasis;
    const h1_annual_hl = e1_funding * 24 * 365 * 100;
    const i1_annual_cross = Math.abs(h1_annual_hl);
    const dayVol = hlDayVolumeUsd?.[symbol] ?? 0;
    const volume3d = dayVol * 3;
    const hlOiUsd = dayVol > 0 ? dayVol : volume3d / 3;
    const fundingStdDev24h = estimateFundingStdDev24h(e1_funding);
    const netProfit7d = estimateNetProfit7d(i1_annual_cross);
    const score = i1_annual_cross;
    const maxLoss = resolveMaxLossLimit(RISK_EVAL_CAPITAL_USD);
    const rawStrategy = pickStrategy(e1_funding, i1_annual_cross);
    const risk = applyRiskToRow(
      symbol,
      spotBasis,
      hlPerpPx,
      dydxPerp[symbol] ?? 0,
      rawStrategy,
      dayVol > 0 ? dayVol : void 0
    );
    let actionStatus = risk.actionStatus;
    if (!risk.risk_tripped && i1_annual_cross > STRATEGY_APR_THRESHOLD) {
      if (e1_funding > 0) actionStatus = "BUY_HL_SPOT_SHORT_HL_PERP";
      else if (e1_funding < 0) actionStatus = "SHORT_HL_SPOT_LONG_HL_PERP";
    }
    const row = {
      a1_timestamp: hkt,
      b1_symbol: symbol,
      c1_hl_spot: spotBasis,
      d1_hl_perp: hlPerpPx,
      e1_hl_funding: e1_funding,
      h1_annual_hl,
      i1_annual_cross,
      j1_strategy: risk.j1_strategy,
      k1_basis_sp: k1_basis,
      n1_friction: DEFAULT_FRICTION,
      o1_cost_usd: DEFAULT_FIXED_COST_USD,
      stability: fundingStdDev24h,
      score,
      netProfit7d,
      fundingStdDev24h,
      volume3d,
      onHyperliquid,
      maxLossLimit: maxLoss.maxLossLimit,
      maxLossLabel: maxLoss.maxLossLabel,
      std_dev_24h: fundingStdDev24h * 100,
      vol_3d_avg: volume3d,
      actionStatus,
      risk_tripped: risk.risk_tripped,
      risk_reasons: risk.risk_reasons,
      risk_estimated_loss_usd: risk.risk_estimated_loss_usd,
      asset_category: "crypto",
      hl_oi_usd: hlOiUsd > 0 ? hlOiUsd : void 0
    };
    if (!passesRuleA(row)) continue;
    row.passedRule = "A";
    candidates.push(row);
  }
  const ruleASymbols = new Set(candidates.map((c) => c.b1_symbol));
  const ruleBTop = resolveRuleBTopSymbols(maps);
  for (const symbol of ruleBTop) {
    if (ruleASymbols.has(symbol)) continue;
    if (isXyzAsset(symbol) || symbol.includes(":")) continue;
    const hlPerpPx = hlPerp[symbol] ?? 0;
    if (hlPerpPx <= 0) continue;
    const hlSpotPx = hlSpot[symbol] ?? hlSpot[`${symbol}-SPOT`] ?? 0;
    const spotBasis = hlSpotPx > 0 ? hlSpotPx : hlPerpPx;
    const e1_funding = hlFunding[symbol] ?? 0;
    const h1_annual_hl = e1_funding * 24 * 365 * 100;
    const dayVol = hlDayVolumeUsd?.[symbol] ?? 0;
    const volume3d = dayVol * 3;
    const hlOiUsd = dayVol > 0 ? dayVol : volume3d / 3;
    const fundingStdDev24h = Math.abs(e1_funding) * 2;
    const maxLoss = resolveMaxLossLimit(RISK_EVAL_CAPITAL_USD);
    const risk = applyRiskToRow(
      symbol,
      spotBasis,
      hlPerpPx,
      dydxPerp[symbol] ?? 0,
      "[ Rule B HIGH-RATE POOL ]",
      dayVol > 0 ? dayVol : void 0
    );
    const row = {
      a1_timestamp: hkt,
      b1_symbol: symbol,
      c1_hl_spot: spotBasis,
      d1_hl_perp: hlPerpPx,
      e1_hl_funding: e1_funding,
      h1_annual_hl,
      i1_annual_cross: Math.abs(h1_annual_hl),
      j1_strategy: "[ Rule B HIGH-RATE POOL ]",
      k1_basis_sp: 0,
      n1_friction: DEFAULT_FRICTION,
      o1_cost_usd: DEFAULT_FIXED_COST_USD,
      stability: fundingStdDev24h,
      score: 0,
      netProfit7d: 0,
      fundingStdDev24h,
      volume3d,
      onHyperliquid: true,
      passedRule: "B",
      maxLossLimit: maxLoss.maxLossLimit,
      maxLossLabel: maxLoss.maxLossLabel,
      std_dev_24h: fundingStdDev24h * 100,
      vol_3d_avg: volume3d,
      actionStatus: risk.actionStatus === "SPREAD_TOO_HIGH" ? "SPREAD_TOO_HIGH" : "RULE_B_HIGH_RATE",
      risk_tripped: risk.risk_tripped,
      risk_reasons: risk.risk_reasons,
      risk_estimated_loss_usd: risk.risk_estimated_loss_usd,
      asset_category: "crypto",
      hl_oi_usd: hlOiUsd > 0 ? hlOiUsd : void 0
    };
    candidates.push(row);
  }
  const ruleA = candidates.filter((c) => c.passedRule === "A");
  const ruleB = candidates.filter((c) => c.passedRule === "B").sort(
    (a, b) => Math.abs(b.e1_hl_funding) - Math.abs(a.e1_hl_funding)
  );
  ruleA.sort((a, b) => b.i1_annual_cross - a.i1_annual_cross);
  const merged = [...ruleA, ...ruleB];
  const funding_rate_kings = computeFundingRateKings(maps);
  const hl_universe = buildHlUniverseProxy(maps, universe);
  return {
    success: true,
    timestamp_hkt: hkt,
    matrix: merged,
    data: merged,
    funding_rate_kings,
    hl_universe
  };
}
__name(assembleMatrix, "assembleMatrix");
function buildHlUniverseProxy(maps, universe) {
  const { hlSpot, hlPerp, hlFunding, hlDayVolumeUsd } = maps;
  const symbols = universe ?? Object.keys(hlPerp).filter(
    (s) => !isXyzAsset(s) && !s.includes(":") && (hlPerp[s] ?? 0) > 0
  );
  const out = [];
  for (const symbol of symbols) {
    if (isXyzAsset(symbol) || symbol.includes(":")) continue;
    const mark = hlPerp[symbol] ?? 0;
    if (mark <= 0) continue;
    const spot = hlSpot[symbol] ?? hlSpot[`${symbol}-SPOT`] ?? mark;
    const funding = hlFunding[symbol] ?? 0;
    const dayVolumeUsd = hlDayVolumeUsd?.[symbol] ?? 0;
    out.push({
      symbol,
      mark,
      spot: spot > 0 ? spot : mark,
      funding,
      dayVolumeUsd,
      funding8h_pct: funding8hPct(funding)
    });
  }
  return out;
}
__name(buildHlUniverseProxy, "buildHlUniverseProxy");

// src/services/gateway.ts
function sanitizeDydxMap(input) {
  const out = {};
  for (const [key, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value <= 0) continue;
    out[key.toUpperCase()] = value;
  }
  return out;
}
__name(sanitizeDydxMap, "sanitizeDydxMap");
async function processPythonGatewayData(rawJson) {
  const hkt = hktTimestamp();
  const items = rawJson.raw?.matrix ?? {};
  const dydxPerp = await fetchDydxPerpMids().catch((err) => {
    console.error("[dYdX] gateway path mid fetch failed", err);
    return {};
  });
  const maps = {
    hlSpot: {},
    hlPerp: {},
    dydxPerp: sanitizeDydxMap(dydxPerp),
    hlFunding: {}
  };
  for (const item of Object.values(items)) {
    const symbol = item.pair.toUpperCase();
    if (item.exchange === "Hyperliquid" || item.exchange === "HL") {
      maps.hlSpot[symbol] = item.price;
      maps.hlPerp[symbol] = item.price;
      maps.hlFunding[symbol] = item.funding;
    }
  }
  const base = assembleMatrix(hkt, maps);
  base.debug_raw_keys = {
    hlSpot: Object.keys(maps.hlSpot),
    hlPerp: Object.keys(maps.hlPerp)
  };
  return base;
}
__name(processPythonGatewayData, "processPythonGatewayData");
async function fetchPythonGateway(gatewayUrl) {
  const response = await fetchAllowlisted(gatewayUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8e3)
  });
  if (!response.ok) {
    throw new Error(`Gateway HTTP ${response.status}`);
  }
  return await response.json();
}
__name(fetchPythonGateway, "fetchPythonGateway");

// src/services/matrix-pipeline.ts
async function fetchNativeExchangeData(tokens) {
  const hkt = hktTimestamp();
  const bundle = await fetchExchangeBundle();
  const base = assembleMatrix(hkt, bundle.maps, tokens);
  base.commodities = bundle.commodities;
  base.stocks = bundle.stocks;
  base.indices = bundle.indices;
  base.fx = bundle.fx;
  base.preipo = bundle.preipo;
  base.tradfi_enrichment = bundle.tradfiEnrichment;
  base.data = base.matrix;
  base.debug_system_logs = [...bundle.debugSystemLogs ?? []];
  base.debug_raw_keys = {
    hlSpotKeys: Object.keys(bundle.maps.hlSpot).slice(0, 15),
    hlPerpKeys: Object.keys(bundle.maps.hlPerp).slice(0, 15)
  };
  return base;
}
__name(fetchNativeExchangeData, "fetchNativeExchangeData");
async function buildMatrixPayload(config) {
  let data;
  let source;
  if (config.usePythonGateway) {
    try {
      const raw = await fetchPythonGateway(config.pythonGatewayUrl);
      data = await processPythonGatewayData(raw);
      source = "Python Gateway";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[PIPELINE] gateway failed, falling back to native", err);
      data = await fetchNativeExchangeData(config.defaultTokens);
      source = `Native Fallback (Gateway Error: ${message})`;
    }
  } else {
    data = await fetchNativeExchangeData(config.defaultTokens);
    source = "Direct Native Fetch";
  }
  data.debug_info = { source };
  data.vix = DEFAULT_VIX;
  data.vix_traditional = DEFAULT_VIX;
  data.dvol_crypto = DEFAULT_DVOL;
  data.data = data.matrix;
  data.commodities = data.commodities ?? {};
  data.stocks = data.stocks ?? {};
  data.indices = data.indices ?? {};
  data.fx = data.fx ?? {};
  data.preipo = data.preipo ?? {};
  data.tradfi_enrichment = data.tradfi_enrichment ?? {
    commodities: {},
    stocks: {},
    indices: {},
    fx: {},
    preipo: {},
    kings: {}
  };
  data.debug_system_logs = data.debug_system_logs ?? [];
  return { data, source };
}
__name(buildMatrixPayload, "buildMatrixPayload");

// src/api/data.ts
function normalizeTradFiKeys(input) {
  const out = {};
  if (!input) return out;
  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      continue;
    }
    out[key.toLowerCase()] = value;
  }
  return out;
}
__name(normalizeTradFiKeys, "normalizeTradFiKeys");
async function handleDataRequest(env, ctx) {
  try {
    const config = resolveConfig(env);
    const { data: pipeline } = await buildMatrixPayload(config);
    const cryptoRows = (Array.isArray(pipeline.matrix) ? pipeline.matrix : Array.isArray(pipeline.data) ? pipeline.data : []).filter(
      (row) => !!row.b1_symbol && !row.b1_symbol.toUpperCase().includes("XYZ:") && !row.b1_symbol.includes(":") && row.onHyperliquid === true && row.d1_hl_perp > 0 && (row.passedRule === "A" || row.passedRule === "B")
    );
    const commodities = normalizeTradFiKeys(
      pipeline.commodities
    );
    const stocks = normalizeTradFiKeys(pipeline.stocks);
    const indices = normalizeTradFiKeys(pipeline.indices);
    const fx = normalizeTradFiKeys(pipeline.fx);
    const preipo = normalizeTradFiKeys(pipeline.preipo);
    const rawLogs = Array.isArray(pipeline.debug_system_logs) ? pipeline.debug_system_logs : [];
    const tsunamiActive = isTsunamiShieldWindow();
    const vix = pipeline.vix_traditional ?? 16.8;
    const dvol = pipeline.dvol_crypto ?? 52.5;
    const macroBlocking = computeIsMacroBlocking();
    const systemState = buildSystemStateFromSignals(
      {
        tsunamiShieldActive: tsunamiActive,
        matrixRows: cryptoRows,
        vix,
        dvol,
        macroBlocking
      },
      DEFAULT_ACCOUNT_BALANCE_USD
    );
    const finalPayload = {
      success: true,
      timestamp_hkt: pipeline.timestamp_hkt,
      vix_traditional: vix,
      dvol_crypto: dvol,
      vix,
      commodities,
      stocks,
      indices,
      fx,
      preipo,
      matrix: cryptoRows,
      data: cryptoRows,
      funding_rate_kings: pipeline.funding_rate_kings,
      hl_universe: pipeline.hl_universe,
      tradfi_enrichment: pipeline.tradfi_enrichment,
      tsunami_shield_active: tsunamiActive,
      debug_info: pipeline.debug_info,
      debug_raw_keys: pipeline.debug_raw_keys,
      debug_system_logs: humanizeSystemLogs(rawLogs),
      systemState
    };
    ctx.waitUntil(
      Promise.all([
        saveMatrixPayloadToKV(env.SLIVERVINE_KV, finalPayload),
        saveSystemStateToKV(env.SLIVERVINE_KV, systemState)
      ]).catch((err) => {
        console.error("[kv-store-waitUntil]", err);
      })
    );
    return new Response(JSON.stringify(finalPayload), {
      status: 200,
      headers: CORS_JSON_HEADERS
    });
  } catch (error) {
    if (error instanceof HardlockError) {
      return hardlockResponse(error, DEFAULT_ACCOUNT_BALANCE_USD);
    }
    console.error("[API] /api/data failed", error);
    const message = error instanceof Error ? error.message : String(error);
    const friendly = humanizeSystemLogs([message])[0] ?? "[System] Sync unavailable \u2014 retry shortly";
    const body = { success: false, error: friendly };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(handleDataRequest, "handleDataRequest");

// src/services/fool-proof-guard.ts
var FOOL_PROOF_MAX_RETAIL_POSITION_RATIO = 0.2;
var FOOL_PROOF_MAX_LEVERAGE = 5;
var HL_SESSION_KEY_ALLOWED_CONTRACTS = [
  "0x0000000000000000000000000000000000000000"
];
var FoolProofRejectedError = class extends Error {
  static {
    __name(this, "FoolProofRejectedError");
  }
  code = "FOOL_PROOF_REJECTED";
  httpStatus = 422;
  reasons;
  constructor(message, reasons) {
    super(message);
    this.name = "FoolProofRejectedError";
    this.reasons = reasons;
  }
};
var VineShieldRejectedError = class extends FoolProofRejectedError {
  static {
    __name(this, "VineShieldRejectedError");
  }
  constructor(message, reasons) {
    super(message, reasons);
    this.name = "VineShieldRejectedError";
  }
};
function normalizeContractAddress(address) {
  return address.trim().toLowerCase();
}
__name(normalizeContractAddress, "normalizeContractAddress");
function isAllowedSessionKeyContract(target) {
  const normalized = normalizeContractAddress(target);
  return HL_SESSION_KEY_ALLOWED_CONTRACTS.some(
    (allowed) => normalizeContractAddress(allowed) === normalized
  );
}
__name(isAllowedSessionKeyContract, "isAllowedSessionKeyContract");
function resolveEffectiveLeverage(order, accountBalanceUsd) {
  if (order.leverage !== void 0 && Number.isFinite(order.leverage)) {
    return order.leverage;
  }
  if (!(accountBalanceUsd > 0)) return Number.POSITIVE_INFINITY;
  return order.positionValueUsd / accountBalanceUsd;
}
__name(resolveEffectiveLeverage, "resolveEffectiveLeverage");
function checkFoolProofOrder(order, accountBalanceUsd) {
  const reasons = [];
  const profile = order.profile ?? "retail";
  if (!order.reduceOnly && profile !== "institutional") {
    const cap = accountBalanceUsd * FOOL_PROOF_MAX_RETAIL_POSITION_RATIO;
    if (order.positionValueUsd > cap) {
      reasons.push(
        `RETAIL_POSITION=${order.positionValueUsd.toFixed(2)}>${cap.toFixed(2)} (20% of balance)`
      );
    }
  }
  const leverage = resolveEffectiveLeverage(order, accountBalanceUsd);
  if (leverage > FOOL_PROOF_MAX_LEVERAGE) {
    reasons.push(`LEVERAGE=${leverage.toFixed(4)}>${FOOL_PROOF_MAX_LEVERAGE}`);
  }
  if (order.contractTarget !== void 0) {
    if (!isAllowedSessionKeyContract(order.contractTarget)) {
      reasons.push(
        `CONTRACT_TARGET=${order.contractTarget} not in HL session key allowlist`
      );
    }
  }
  const rejected = reasons.length > 0;
  return { ok: !rejected, rejected, reasons };
}
__name(checkFoolProofOrder, "checkFoolProofOrder");
function checkVineShield(input) {
  return checkFoolProofOrder(input.order, input.accountBalanceUsd);
}
__name(checkVineShield, "checkVineShield");
var checkFoolProofGuard = checkVineShield;
function assertVineShield(input) {
  const result = checkVineShield(input);
  if (result.rejected) {
    throw new VineShieldRejectedError(
      `Vine Shield rejected \u2014 ${result.reasons.join("|")}`,
      result.reasons
    );
  }
}
__name(assertVineShield, "assertVineShield");
var assertFoolProofGuard = assertVineShield;
function runVineShieldSoilGate(soil, guard) {
  assertVineShield(guard);
  return checkSoilResistanceWithVine(soil);
}
__name(runVineShieldSoilGate, "runVineShieldSoilGate");
var checkSoilResistanceWithFoolProofGuard = runVineShieldSoilGate;

// src/core/risk.ts
function isR20Locked(state) {
  return state.hardlock || state.currentCri <= 0 || state.signingChannelOpen === false;
}
__name(isR20Locked, "isR20Locked");
function isHedgeActive(soil, state) {
  if (isR20Locked(state)) return false;
  return !checkSoilResistance(soil).tripped;
}
__name(isHedgeActive, "isHedgeActive");

// src/core/state.ts
var R20_LOCKED = "R20_LOCKED";
var activeStateOverride = null;
function readActiveSystemState() {
  if (activeStateOverride) return activeStateOverride;
  const base = buildSystemState();
  return enrichSystemStateTaijiBagua(
    { ...base, isHedgeActive: false },
    { isHedgeActive: false }
  );
}
__name(readActiveSystemState, "readActiveSystemState");
function updateSystemState(input = {}) {
  const current = readActiveSystemState();
  const patch = input.patch ?? {};
  const merged = buildSystemState({
    accountBalanceUsd: patch.accountBalanceUsd ?? current.accountBalanceUsd,
    currentCri: patch.currentCri ?? current.currentCri,
    skipHardlockAssert: true
  });
  const cri = patch.currentCri ?? merged.currentCri;
  const hardlock = patch.hardlock ?? merged.hardlock;
  const next = {
    ...merged,
    ...patch,
    dynamicMaxSL: patch.dynamicMaxSL ?? merged.dynamicMaxSL,
    hudState: patch.hudState ?? resolveHudState(cri, hardlock),
    signingChannelOpen: patch.signingChannelOpen ?? !(hardlock || cri <= 0),
    isStale: patch.isStale ?? current.isStale ?? false
  };
  const hedgeActive = input.soil ? isHedgeActive(input.soil, next) : current.isHedgeActive;
  const soilTripped = input.soil ? checkSoilResistance(input.soil).tripped : void 0;
  activeStateOverride = enrichSystemStateTaijiBagua(
    { ...next, isHedgeActive: hedgeActive },
    { soilTripped, isHedgeActive: hedgeActive }
  );
  return activeStateOverride;
}
__name(updateSystemState, "updateSystemState");

// src/adapters/polymarket/index.ts
var DEFAULT_TAIL_HEDGE_THRESHOLD = 0.08;
function evaluateTailHedgeTrigger(marketPrice, thresholdProb) {
  if (!Number.isFinite(marketPrice) || !Number.isFinite(thresholdProb)) {
    return false;
  }
  if (marketPrice <= 0 || marketPrice > 1) return false;
  if (thresholdProb <= 0 || thresholdProb > 1) return false;
  return marketPrice <= thresholdProb;
}
__name(evaluateTailHedgeTrigger, "evaluateTailHedgeTrigger");

// src/api/index.ts
function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_JSON_HEADERS
  });
}
__name(json, "json");
function handleStateRequest() {
  const body = {
    success: true,
    systemState: readActiveSystemState()
  };
  return json(body, 200);
}
__name(handleStateRequest, "handleStateRequest");
async function handleHedgeEvaluateRequest(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: "Invalid JSON body" }, 400);
  }
  const input = body;
  const marketPrice = Number(input.marketPrice);
  const thresholdProb = Number(
    input.thresholdProb ?? DEFAULT_TAIL_HEDGE_THRESHOLD
  );
  if (!Number.isFinite(marketPrice) || marketPrice <= 0 || marketPrice > 1) {
    return json({ success: false, error: "Invalid marketPrice" }, 422);
  }
  if (!Number.isFinite(thresholdProb) || thresholdProb <= 0 || thresholdProb > 1) {
    return json({ success: false, error: "Invalid thresholdProb" }, 422);
  }
  const systemState = readActiveSystemState();
  if (isR20Locked(systemState)) {
    const err = {
      success: false,
      code: R20_LOCKED,
      error: "Hedge evaluation blocked \u2014 signing channel severed",
      systemState
    };
    return json(err, 403);
  }
  if (input.soil) {
    const hedgeActive2 = isHedgeActive(input.soil, systemState);
    if (!hedgeActive2) {
      const err = {
        success: false,
        code: "SOIL_RESISTANCE_TRIP",
        error: "Soil resistance tripped \u2014 hedge channel inactive",
        isHedgeActive: false,
        systemState
      };
      return json(err, 422);
    }
  }
  const triggered = evaluateTailHedgeTrigger(marketPrice, thresholdProb);
  const hedgeActive = input.soil ? isHedgeActive(input.soil, systemState) : systemState.isHedgeActive;
  const ok = {
    success: true,
    triggered,
    marketPrice,
    thresholdProb,
    isHedgeActive: hedgeActive,
    systemState
  };
  return json(ok, 200);
}
__name(handleHedgeEvaluateRequest, "handleHedgeEvaluateRequest");
async function handleIndexApiRequest(request, url) {
  if (url.pathname === "/api/state" && request.method === "GET") {
    return handleStateRequest();
  }
  if (url.pathname === "/api/hedge/evaluate" && request.method === "POST") {
    return handleHedgeEvaluateRequest(request);
  }
  return null;
}
__name(handleIndexApiRequest, "handleIndexApiRequest");

// src/core/intent-ledger.ts
var DEFAULT_TTL_MS = 3e4;
var ledgerStore = /* @__PURE__ */ new Map();
function nowMs(options) {
  return options?.now?.() ?? Date.now();
}
__name(nowMs, "nowMs");
function cloneIntent(intent) {
  return {
    ...intent,
    legs: [...intent.legs],
    legResults: [...intent.legResults],
    flattenActions: [...intent.flattenActions]
  };
}
__name(cloneIntent, "cloneIntent");
function persist(intent) {
  const copy = cloneIntent(intent);
  ledgerStore.set(copy.id, copy);
  return copy;
}
__name(persist, "persist");
function isExpired(intent, now) {
  if (intent.phase !== "PREPARED" || intent.preparedAt === void 0) return false;
  return now - intent.preparedAt > intent.ttlMs;
}
__name(isExpired, "isExpired");
function oppositeSide(side) {
  switch (side) {
    case "BUY":
      return "SELL";
    case "SELL":
      return "BUY";
    case "LONG":
      return "SHORT";
    case "SHORT":
      return "LONG";
  }
}
__name(oppositeSide, "oppositeSide");
async function defaultPrepareLeg(leg, legIndex) {
  if (leg.sizeUsd <= 0) {
    return { legIndex, ok: false, reason: "INVALID_LEG_SIZE" };
  }
  return { legIndex, ok: true, fillPrice: 1, filledUsd: leg.sizeUsd };
}
__name(defaultPrepareLeg, "defaultPrepareLeg");
async function defaultCommitLeg(_leg, legIndex, intent) {
  const prep = intent.legResults.find((r) => r.legIndex === legIndex);
  if (!prep?.ok) return { ok: false, reason: "LEG_NOT_PREPARED" };
  return { ok: true };
}
__name(defaultCommitLeg, "defaultCommitLeg");
function buildFlattenAction(leg, reason) {
  return {
    venue: leg.venue,
    side: oppositeSide(leg.side),
    sizeUsd: leg.sizeUsd,
    reduceOnly: true,
    reason
  };
}
__name(buildFlattenAction, "buildFlattenAction");
function createCrossLegIntent(input) {
  const intent = {
    id: input.id,
    legs: input.legs,
    phase: "PENDING",
    ttlMs: input.ttlMs ?? DEFAULT_TTL_MS,
    createdAt: input.now ?? Date.now(),
    legResults: [],
    flattenActions: []
  };
  return persist(intent);
}
__name(createCrossLegIntent, "createCrossLegIntent");
function getIntent(id) {
  const stored = ledgerStore.get(id);
  return stored ? cloneIntent(stored) : void 0;
}
__name(getIntent, "getIntent");
function importCrossLegIntent(intent) {
  return persist(cloneIntent(intent));
}
__name(importCrossLegIntent, "importCrossLegIntent");
function listAllIntents() {
  return Array.from(ledgerStore.values()).map(cloneIntent);
}
__name(listAllIntents, "listAllIntents");
async function prepareIntent(id, options = {}) {
  const stored = ledgerStore.get(id);
  if (!stored) return { intent: { id, legs: [{ venue: "HL", side: "LONG", sizeUsd: 0 }, { venue: "HL", side: "SHORT", sizeUsd: 0 }], phase: "ABORTED", ttlMs: 0, createdAt: 0, legResults: [], flattenActions: [] }, ok: false, reason: "INTENT_NOT_FOUND" };
  let intent = cloneIntent(stored);
  if (intent.phase !== "PENDING") {
    return { intent, ok: false, reason: `INVALID_PHASE:${intent.phase}` };
  }
  const prepareLeg = options.prepareLeg ?? defaultPrepareLeg;
  const now = nowMs(options);
  const results = await Promise.all(
    intent.legs.map((leg, index) => prepareLeg(leg, index, intent))
  );
  intent.legResults = results;
  const allOk = results.every((r) => r.ok);
  if (allOk) {
    intent.phase = "PREPARED";
    intent.preparedAt = now;
    intent = persist(intent);
    return { intent, ok: true };
  }
  const failed = results.filter((r) => !r.ok);
  const preparedOk = results.filter((r) => r.ok).map((r) => intent.legs[r.legIndex]);
  intent.flattenActions = preparedOk.map(
    (leg) => buildFlattenAction(leg, "PREPARE_PARTIAL_FAILURE")
  );
  intent.phase = "ABORTED";
  intent.abortedAt = now;
  intent.abortReason = failed.map((f) => f.reason ?? "PREPARE_FAILED").join("|");
  const flattenLeg = options.flattenLeg ?? (async () => ({ ok: true }));
  for (const action of intent.flattenActions) {
    await flattenLeg(action, intent);
  }
  intent = persist(intent);
  return { intent, ok: false, reason: intent.abortReason };
}
__name(prepareIntent, "prepareIntent");
async function commitIntent(id, options = {}) {
  const stored = ledgerStore.get(id);
  if (!stored) {
    return {
      intent: {
        id,
        legs: [{ venue: "HL", side: "LONG", sizeUsd: 0 }, { venue: "HL", side: "SHORT", sizeUsd: 0 }],
        phase: "ABORTED",
        ttlMs: 0,
        createdAt: 0,
        legResults: [],
        flattenActions: []
      },
      ok: false,
      reason: "INTENT_NOT_FOUND"
    };
  }
  let intent = cloneIntent(stored);
  const now = nowMs(options);
  if (intent.phase !== "PREPARED") {
    return { intent, ok: false, reason: `INVALID_PHASE:${intent.phase}` };
  }
  if (isExpired(intent, now)) {
    intent.phase = "ABORTED";
    intent.abortedAt = now;
    intent.abortReason = "PREPARE_TTL_EXPIRED";
    const preparedIndexes = new Set(
      intent.legResults.filter((r) => r.ok).map((r) => r.legIndex)
    );
    intent.flattenActions = intent.legs.filter((_, index) => preparedIndexes.has(index)).map((leg) => buildFlattenAction(leg, "TTL_EXPIRED"));
    const flattenLeg2 = options.flattenLeg ?? (async () => ({ ok: true }));
    for (const action of intent.flattenActions) {
      await flattenLeg2(action, intent);
    }
    intent = persist(intent);
    return { intent, ok: false, reason: intent.abortReason };
  }
  const commitLeg = options.commitLeg ?? defaultCommitLeg;
  const commitResults = await Promise.all(
    intent.legs.map((leg, index) => commitLeg(leg, index, intent))
  );
  if (commitResults.every((r) => r.ok)) {
    intent.phase = "COMMITTED";
    intent.committedAt = now;
    intent = persist(intent);
    return { intent, ok: true };
  }
  const failedReasons = commitResults.filter((r) => !r.ok).map((r) => r.reason ?? "COMMIT_FAILED").join("|");
  intent.flattenActions = intent.legs.map(
    (leg) => buildFlattenAction(leg, "COMMIT_PARTIAL_FAILURE")
  );
  intent.phase = "ABORTED";
  intent.abortedAt = now;
  intent.abortReason = failedReasons;
  const flattenLeg = options.flattenLeg ?? (async () => ({ ok: true }));
  for (const action of intent.flattenActions) {
    await flattenLeg(action, intent);
  }
  intent = persist(intent);
  return { intent, ok: false, reason: intent.abortReason };
}
__name(commitIntent, "commitIntent");
async function abortIntent(id, reason, options = {}) {
  const stored = ledgerStore.get(id);
  if (!stored) {
    return {
      intent: {
        id,
        legs: [{ venue: "HL", side: "LONG", sizeUsd: 0 }, { venue: "HL", side: "SHORT", sizeUsd: 0 }],
        phase: "ABORTED",
        ttlMs: 0,
        createdAt: 0,
        legResults: [],
        flattenActions: []
      },
      ok: false,
      reason: "INTENT_NOT_FOUND"
    };
  }
  let intent = cloneIntent(stored);
  if (intent.phase === "COMMITTED" || intent.phase === "ABORTED") {
    return { intent, ok: false, reason: `INVALID_PHASE:${intent.phase}` };
  }
  const preparedIndexes = new Set(
    intent.legResults.filter((r) => r.ok).map((r) => r.legIndex)
  );
  intent.flattenActions = intent.legs.filter((_, i) => preparedIndexes.has(i) || intent.phase === "PREPARED").map((leg) => buildFlattenAction(leg, reason));
  intent.phase = "ABORTED";
  intent.abortedAt = nowMs(options);
  intent.abortReason = reason;
  const flattenLeg = options.flattenLeg ?? (async () => ({ ok: true }));
  for (const action of intent.flattenActions) {
    await flattenLeg(action, intent);
  }
  intent = persist(intent);
  return { intent, ok: true, reason };
}
__name(abortIntent, "abortIntent");

// src/services/circuit-breaker.ts
var RECOVERY_COOLDOWN_MS = 18e4;
var NORMALIZED_SPREAD_MAX = 1e-3;
var lastSoilViolationAt = null;
var lastSpreadRatio = Number.POSITIVE_INFINITY;
var vineMeshRecoveryCount = 0;
function asCoreState(state) {
  const active = readActiveSystemState();
  return {
    ...state,
    isHedgeActive: active.isHedgeActive
  };
}
__name(asCoreState, "asCoreState");
function recordSoilViolation(at = Date.now()) {
  lastSoilViolationAt = at;
}
__name(recordSoilViolation, "recordSoilViolation");
function recordSpreadSample(spreadRatio) {
  if (Number.isFinite(spreadRatio) && spreadRatio >= 0) {
    lastSpreadRatio = spreadRatio;
  }
}
__name(recordSpreadSample, "recordSpreadSample");
function isSoftR20Deadlock(state) {
  return !state.signingChannelOpen && !state.hardlock && state.currentCri > 0;
}
__name(isSoftR20Deadlock, "isSoftR20Deadlock");
function resolveLockedCounterAttackStatus() {
  return "STANDBY";
}
__name(resolveLockedCounterAttackStatus, "resolveLockedCounterAttackStatus");
function vineMeshAutoRecovery(systemState, now = Date.now()) {
  const reasons = [];
  if (systemState.hardlock || systemState.currentCri <= 0) {
    return {
      recovered: false,
      recoveryCount: vineMeshRecoveryCount,
      counterAttackStatus: "LOCKED",
      systemState: asCoreState(systemState),
      reasons: ["HARDLOCK_ACTIVE"]
    };
  }
  if (!isSoftR20Deadlock(systemState)) {
    return {
      recovered: false,
      recoveryCount: vineMeshRecoveryCount,
      counterAttackStatus: systemState.signingChannelOpen ? "ARMED_AND_READY" : resolveLockedCounterAttackStatus(),
      systemState: asCoreState(systemState),
      reasons: ["NOT_SOFT_R20_DEADLOCK"]
    };
  }
  const sinceViolation = lastSoilViolationAt === null ? Number.POSITIVE_INFINITY : now - lastSoilViolationAt;
  if (sinceViolation < RECOVERY_COOLDOWN_MS) {
    reasons.push(
      `COOLDOWN_ACTIVE=${Math.floor(sinceViolation / 1e3)}s<${RECOVERY_COOLDOWN_MS / 1e3}s`
    );
    return {
      recovered: false,
      recoveryCount: vineMeshRecoveryCount,
      counterAttackStatus: "STANDBY",
      systemState: asCoreState(systemState),
      reasons
    };
  }
  if (!(lastSpreadRatio < NORMALIZED_SPREAD_MAX)) {
    reasons.push(
      `SPREAD=${(lastSpreadRatio * 100).toFixed(4)}%>=${NORMALIZED_SPREAD_MAX * 100}%`
    );
    return {
      recovered: false,
      recoveryCount: vineMeshRecoveryCount,
      counterAttackStatus: "STANDBY",
      systemState: asCoreState(systemState),
      reasons
    };
  }
  const next = updateSystemState({
    patch: {
      signingChannelOpen: true,
      hardlock: false
    }
  });
  vineMeshRecoveryCount += 1;
  return {
    recovered: true,
    recoveryCount: vineMeshRecoveryCount,
    counterAttackStatus: "ARMED_AND_READY",
    systemState: next,
    reasons: ["AUTO_RECOVERY_COOLDOWN_CLEAR", "SPREAD_NORMALIZED"]
  };
}
__name(vineMeshAutoRecovery, "vineMeshAutoRecovery");
var checkCircuitRecovery = vineMeshAutoRecovery;

// src/services/session-key-adapter.ts
var HL_L1_CHAIN_ID = 1337;
var HL_SESSION_KEY_AGENT_NAME = "BeDeltaSessionKey";
var DefenseMatrixError = class extends Error {
  static {
    __name(this, "DefenseMatrixError");
  }
  code;
  httpStatus;
  reasons;
  constructor(code, message, reasons = [], httpStatus = 403) {
    super(message);
    this.name = "DefenseMatrixError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.reasons = reasons;
  }
};
function resolveOrderNotionalUsd(payload) {
  const px = Number(payload.limitPx);
  const sz = Number(payload.sz);
  if (!Number.isFinite(px) || !Number.isFinite(sz) || px <= 0 || sz <= 0) {
    throw new DefenseMatrixError(
      "SESSION_KEY_INVALID_ORDER",
      "Invalid Session Key order notional \u2014 limitPx and sz must be positive",
      [`limitPx=${payload.limitPx}`, `sz=${payload.sz}`],
      422
    );
  }
  return px * sz;
}
__name(resolveOrderNotionalUsd, "resolveOrderNotionalUsd");
function resolveR20Locked(state) {
  return isR20Locked(state);
}
__name(resolveR20Locked, "resolveR20Locked");
function severSigningChannel() {
  return updateSystemState({
    patch: {
      signingChannelOpen: false,
      hardlock: true,
      currentCri: 0,
      hudState: "BLOCKED"
    }
  });
}
__name(severSigningChannel, "severSigningChannel");
function interceptAndSever(reasons) {
  severSigningChannel();
  throw new DefenseMatrixError(
    "SESSION_KEY_HARDLOCK_INTERCEPTED",
    "Session Key hardlock intercepted \u2014 signing channel severed",
    reasons,
    403
  );
}
__name(interceptAndSever, "interceptAndSever");
function assertSessionKeyExecutionGates(payload, state, maxPositionUsd, foolProof) {
  const reasons = [];
  if (state.signingChannelOpen !== true) {
    reasons.push("signingChannelOpen=false");
  }
  if (resolveR20Locked(state)) {
    reasons.push(`${R20_LOCKED}=true`);
    reasons.push(`hardlock=${state.hardlock}`);
    reasons.push(`currentCri=${state.currentCri}`);
  }
  if (reasons.length > 0) {
    interceptAndSever(reasons);
  }
  const orderNotionalUsd = resolveOrderNotionalUsd(payload);
  try {
    assertVineShield({
      order: {
        positionValueUsd: orderNotionalUsd,
        reduceOnly: payload.reduceOnly,
        leverage: foolProof?.leverage,
        contractTarget: foolProof?.contractTarget,
        profile: foolProof?.profile
      },
      accountBalanceUsd: state.accountBalanceUsd
    });
  } catch (err) {
    interceptAndSever([
      err instanceof Error ? err.message : String(err)
    ]);
  }
  const dynamicMaxSlUsd = state.dynamicMaxSL;
  const positionCap = maxPositionUsd ?? state.accountBalanceUsd;
  if (orderNotionalUsd > dynamicMaxSlUsd) {
    interceptAndSever([
      `ORDER_NOTIONAL=${orderNotionalUsd.toFixed(2)}>dynamicMaxSlUsd=${dynamicMaxSlUsd.toFixed(2)}`
    ]);
  }
  if (!payload.reduceOnly && orderNotionalUsd > positionCap) {
    interceptAndSever([
      `POSITION_LIMIT=${orderNotionalUsd.toFixed(2)}>maxPositionUsd=${positionCap.toFixed(2)}`
    ]);
  }
  try {
    vineWrapProtection({
      symbol: `HL_ASSET_${payload.asset}`,
      estimatedLossUsd: orderNotionalUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock,
      maxLossLimit: dynamicMaxSlUsd
    });
  } catch (err) {
    interceptAndSever([
      err instanceof Error ? err.message : String(err)
    ]);
  }
  return orderNotionalUsd;
}
__name(assertSessionKeyExecutionGates, "assertSessionKeyExecutionGates");
function buildSessionKeyEip712Stub(payload, nonce, connectionId, isTestnet = false) {
  return {
    domain: {
      name: "Exchange",
      version: "1",
      chainId: HL_L1_CHAIN_ID,
      verifyingContract: "0x0000000000000000000000000000000000000000"
    },
    types: {
      Agent: [
        { name: "source", type: "string" },
        { name: "connectionId", type: "bytes32" }
      ]
    },
    message: {
      source: isTestnet ? "b" : "a",
      connectionId,
      action: {
        type: "order",
        orders: [
          {
            a: payload.asset,
            b: payload.isBuy,
            p: payload.limitPx,
            s: payload.sz,
            r: payload.reduceOnly,
            t: payload.orderType
          }
        ],
        grouping: "na"
      },
      nonce,
      agentName: HL_SESSION_KEY_AGENT_NAME
    }
  };
}
__name(buildSessionKeyEip712Stub, "buildSessionKeyEip712Stub");
async function stubSignSessionKeyPayload(eip712) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(eip712))
  );
  const hex = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hex}`;
}
__name(stubSignSessionKeyPayload, "stubSignSessionKeyPayload");
async function buildConnectionId(payload, nonce) {
  const seed = `${payload.asset}:${payload.limitPx}:${payload.sz}:${payload.reduceOnly}:${nonce}`;
  const msgUint8 = new TextEncoder().encode(seed);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `0x${hex}`;
}
__name(buildConnectionId, "buildConnectionId");
async function signAndExecuteOrder(payload, options = {}) {
  const state = options.systemState ?? readActiveSystemState();
  try {
    assertSessionKeyExecutionGates(
      payload,
      state,
      options.maxPositionUsd,
      {
        leverage: options.leverage,
        contractTarget: options.contractTarget,
        profile: options.profile
      }
    );
    const nonce = options.nonce ?? Date.now();
    const connectionId = await buildConnectionId(payload, nonce);
    const eip712 = buildSessionKeyEip712Stub(payload, nonce, connectionId);
    if (options.dryRun) {
      return {
        success: true,
        signatureHash: null,
        errorReason: null
      };
    }
    const signatureHash = await stubSignSessionKeyPayload(eip712);
    return {
      success: true,
      signatureHash,
      errorReason: null
    };
  } catch (err) {
    if (err instanceof DefenseMatrixError) {
      throw err;
    }
    severSigningChannel();
    throw new DefenseMatrixError(
      "SESSION_KEY_HARDLOCK_INTERCEPTED",
      err instanceof Error ? err.message : String(err),
      [],
      403
    );
  }
}
__name(signAndExecuteOrder, "signAndExecuteOrder");

// src/core/black-swan-logger.ts
var BLACK_SWAN_HUD_TAG = "[CRITICAL: BLACK_SWAN_DEFENSE_ACTIVE]";
var defenseActive = false;
var activeTriggers = [];
var rollingLogs = [];
function isBlackSwanDefenseActive() {
  return defenseActive;
}
__name(isBlackSwanDefenseActive, "isBlackSwanDefenseActive");
function readBlackSwanActiveTriggers() {
  return activeTriggers;
}
__name(readBlackSwanActiveTriggers, "readBlackSwanActiveTriggers");
function getBlackSwanDefenseHudLabel() {
  return defenseActive ? BLACK_SWAN_HUD_TAG : null;
}
__name(getBlackSwanDefenseHudLabel, "getBlackSwanDefenseHudLabel");
function getRecentBlackSwanLogs() {
  return rollingLogs;
}
__name(getRecentBlackSwanLogs, "getRecentBlackSwanLogs");

// src/services/defense/ui-canary.ts
var HUD_CANARY_EXPECTED = "santenmoku";
var UI_LOCKED_MESSAGE = "Disconnected / Locked State";
function validateHudStreamRequest(request) {
  const headerCanary = request.headers.get("X-Santenmoku-Canary")?.trim() ?? request.headers.get("x-santenmoku-canary")?.trim();
  if (headerCanary === HUD_CANARY_EXPECTED) {
    return { ok: true };
  }
  return { ok: false, status: 403, message: UI_LOCKED_MESSAGE };
}
__name(validateHudStreamRequest, "validateHudStreamRequest");

// src/services/jupiter-adapter.ts
var JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";
var PGATE_MAX_SLIPPAGE_BPS = 15;
var DefenseMatrixError2 = class extends Error {
  static {
    __name(this, "DefenseMatrixError");
  }
  code;
  httpStatus;
  reasons;
  constructor(code, message, reasons = [], httpStatus = 422) {
    super(message);
    this.name = "DefenseMatrixError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.reasons = reasons;
  }
};
var JupiterApiError = class extends Error {
  static {
    __name(this, "JupiterApiError");
  }
  code;
  httpStatus;
  body;
  constructor(message, code, httpStatus, body) {
    super(message);
    this.name = "JupiterApiError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.body = body;
  }
};
function resolveAmountUsd(params, override) {
  if (override !== void 0 && Number.isFinite(override) && override > 0) {
    return override;
  }
  const atomic = Number(params.amount);
  if (!Number.isFinite(atomic) || atomic <= 0) return 0;
  return atomic / 1e6;
}
__name(resolveAmountUsd, "resolveAmountUsd");
function parseQuoteWire(body) {
  if (!body || typeof body !== "object") {
    throw new JupiterApiError(
      "Invalid Jupiter quote response",
      "INVALID_RESPONSE",
      502,
      body
    );
  }
  const wire = body;
  const inputMint = String(wire.inputMint ?? "");
  const outputMint = String(wire.outputMint ?? "");
  const inAmount = String(wire.inAmount ?? "");
  const outAmount = String(wire.outAmount ?? "");
  if (!inputMint || !outputMint || !inAmount || !outAmount) {
    throw new JupiterApiError(
      "Jupiter quote missing required fields",
      "INVALID_RESPONSE",
      502,
      body
    );
  }
  return {
    inputMint,
    outputMint,
    inAmount,
    outAmount,
    slippageBps: Number(wire.slippageBps ?? 0),
    priceImpactPct: String(wire.priceImpactPct ?? "0"),
    swapMode: wire.swapMode ? String(wire.swapMode) : void 0,
    routePlan: Array.isArray(wire.routePlan) ? wire.routePlan : void 0,
    otherAmountThreshold: wire.otherAmountThreshold ? String(wire.otherAmountThreshold) : void 0,
    contextSlot: typeof wire.contextSlot === "number" ? wire.contextSlot : void 0
  };
}
__name(parseQuoteWire, "parseQuoteWire");
function combinedSlippageBps(quote) {
  const priceImpactBps = Math.abs(Number(quote.priceImpactPct)) * 100;
  const quoteSlippageBps = quote.slippageBps;
  return {
    priceImpactBps,
    quoteSlippageBps,
    combinedSlippageBps: priceImpactBps + quoteSlippageBps
  };
}
__name(combinedSlippageBps, "combinedSlippageBps");
function assertSystemStateGates(state, amountUsd) {
  if (isR20Locked(state) || state.hardlock) {
    throw new DefenseMatrixError2(
      R20_LOCKED,
      `${R20_LOCKED} \u2014 Jupiter adapter blocked; signing channel severed`,
      [
        `hardlock=${state.hardlock}`,
        `currentCri=${state.currentCri}`,
        `signingChannelOpen=${state.signingChannelOpen}`
      ],
      403
    );
  }
  if (!state.signingChannelOpen) {
    throw new DefenseMatrixError2(
      "SIGNING_CHANNEL_CLOSED",
      "Jupiter adapter blocked \u2014 signing channel closed",
      [`signingChannelOpen=false`],
      403
    );
  }
  try {
    vineWrapProtection({
      symbol: "JUP_SWAP",
      estimatedLossUsd: amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock
    });
  } catch (err) {
    if (err instanceof HardlockError) {
      throw new DefenseMatrixError2(
        R20_LOCKED,
        err.message,
        [err.message],
        403
      );
    }
    if (err instanceof RiskLimitExceeded) {
      throw new DefenseMatrixError2(
        "ROOT_PROTECTION",
        err.message,
        [err.message],
        422
      );
    }
    throw err;
  }
}
__name(assertSystemStateGates, "assertSystemStateGates");
function evaluateJupiterSoilResistance(quote, maxSlippageBps = PGATE_MAX_SLIPPAGE_BPS, amountUsd) {
  const { priceImpactBps, quoteSlippageBps, combinedSlippageBps: totalBps } = combinedSlippageBps(quote);
  const reasons = [];
  const notional = amountUsd ?? (Number(quote.inAmount) > 0 ? Number(quote.inAmount) / 1e6 : 0);
  if (priceImpactBps > maxSlippageBps) {
    reasons.push(
      `PRICE_IMPACT=${priceImpactBps.toFixed(2)}bps>${maxSlippageBps}bps`
    );
  }
  if (totalBps > maxSlippageBps) {
    reasons.push(
      `JUPITER_COMBINED_SLIPPAGE=${totalBps.toFixed(2)}bps>${maxSlippageBps}bps`
    );
  }
  const slippageRatio = totalBps / 1e4;
  const basePx = 5e4;
  const soil = checkSoilResistance({
    symbol: "JUP_SWAP",
    hlSpot: basePx,
    hlPerp: basePx,
    dydxPerp: basePx * (1 + slippageRatio),
    depthUsd: Math.max(notional * 100, 5e5)
  });
  if (soil.tripped) {
    reasons.push(...soil.reasons);
  }
  const tripped = reasons.length > 0;
  if (tripped) {
    throw new DefenseMatrixError2(
      "SOIL_RESISTANCE_SLIPPAGE_BREAKER",
      "Jupiter soil resistance slippage breaker tripped \u2014 swap blocked",
      reasons,
      422
    );
  }
  return {
    ok: true,
    tripped: false,
    reasons: [],
    combinedSlippageBps: totalBps,
    maxSlippageBps,
    priceImpactBps,
    quoteSlippageBps,
    soil
  };
}
__name(evaluateJupiterSoilResistance, "evaluateJupiterSoilResistance");
async function fetchJupiterQuote(params, options = {}) {
  const state = options.systemState ?? readActiveSystemState();
  const amountUsd = resolveAmountUsd(params, options.amountUsd);
  assertSystemStateGates(state, amountUsd);
  const fetchFn = options.fetchFn ?? fetch;
  const quoteUrl = options.quoteUrl ?? JUPITER_QUOTE_URL;
  const maxSlippageBps = options.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS;
  const search = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount,
    slippageBps: String(params.slippageBps)
  });
  const res = await fetchFn(`${quoteUrl}?${search.toString()}`, {
    method: "GET"
  });
  if (!res.ok) {
    throw new JupiterApiError(
      `Jupiter quote HTTP ${res.status}`,
      "HTTP_ERROR",
      res.status
    );
  }
  let body;
  try {
    body = await res.json();
  } catch {
    throw new JupiterApiError(
      "Invalid JSON from Jupiter quote API",
      "INVALID_RESPONSE",
      res.status
    );
  }
  const quote = parseQuoteWire(body);
  evaluateJupiterSoilResistance(quote, maxSlippageBps, amountUsd);
  return quote;
}
__name(fetchJupiterQuote, "fetchJupiterQuote");

// src/services/polymarket-adapter.ts
var POLYMARKET_CLOB_URL = "https://clob.polymarket.com";
var MAX_BINARY_SPREAD = 0.05;
var MIN_BINARY_LIQUIDITY_USD = 1e4;
var DefenseMatrixError3 = class extends Error {
  static {
    __name(this, "DefenseMatrixError");
  }
  code;
  httpStatus;
  reasons;
  constructor(code, message, reasons = [], httpStatus = 422) {
    super(message);
    this.name = "DefenseMatrixError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.reasons = reasons;
  }
};
var PolymarketApiError = class extends Error {
  static {
    __name(this, "PolymarketApiError");
  }
  code;
  httpStatus;
  body;
  constructor(message, code, httpStatus, body) {
    super(message);
    this.name = "PolymarketApiError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.body = body;
  }
};
function parseLevelPrice(level) {
  if (!level) return null;
  const price = Number(level.price);
  return Number.isFinite(price) && price >= 0 && price <= 1 ? price : null;
}
__name(parseLevelPrice, "parseLevelPrice");
function depthUsd(levels) {
  return levels.reduce((sum, level) => {
    const price = Number(level.price);
    const size = Number(level.size);
    if (!Number.isFinite(price) || !Number.isFinite(size)) return sum;
    return sum + price * size;
  }, 0);
}
__name(depthUsd, "depthUsd");
function parseOrderbookWire(body) {
  if (!body || typeof body !== "object") {
    throw new PolymarketApiError(
      "Invalid Polymarket orderbook response",
      "INVALID_RESPONSE",
      502,
      body
    );
  }
  const wire = body;
  const market = String(wire.market ?? "");
  const assetId = String(wire.asset_id ?? "");
  if (!market || !assetId) {
    throw new PolymarketApiError(
      "Polymarket orderbook missing market or asset_id",
      "INVALID_RESPONSE",
      502,
      body
    );
  }
  return {
    market,
    asset_id: assetId,
    timestamp: String(wire.timestamp ?? (/* @__PURE__ */ new Date()).toISOString()),
    hash: String(wire.hash ?? ""),
    bids: Array.isArray(wire.bids) ? wire.bids : [],
    asks: Array.isArray(wire.asks) ? wire.asks : [],
    min_order_size: String(wire.min_order_size ?? "1"),
    tick_size: String(wire.tick_size ?? "0.01"),
    neg_risk: Boolean(wire.neg_risk),
    last_trade_price: wire.last_trade_price ? String(wire.last_trade_price) : void 0
  };
}
__name(parseOrderbookWire, "parseOrderbookWire");
function buildBinaryHedgeRatio(bestBid, bestAsk, bidDepthUsd, askDepthUsd) {
  const midPrice = bestBid !== null && bestAsk !== null ? (bestBid + bestAsk) / 2 : bestBid ?? bestAsk;
  const yesProbability = bestAsk ?? midPrice ?? 0;
  const noProbability = Math.max(0, 1 - yesProbability);
  const spread = bestBid !== null && bestAsk !== null ? Math.max(0, bestAsk - bestBid) : 0;
  const spreadPct = midPrice && midPrice > 0 ? spread / midPrice : spread;
  const totalDepthUsd = bidDepthUsd + askDepthUsd;
  const hedgeRatio = noProbability > 0 ? yesProbability / noProbability : Number.POSITIVE_INFINITY;
  return {
    yesProbability,
    noProbability,
    hedgeRatio,
    spread,
    spreadPct,
    totalDepthUsd
  };
}
__name(buildBinaryHedgeRatio, "buildBinaryHedgeRatio");
function buildQuoteResponse(params, orderbook) {
  const bestBid = parseLevelPrice(orderbook.bids[0]);
  const bestAsk = parseLevelPrice(orderbook.asks[0]);
  const bidDepthUsd = depthUsd(orderbook.bids);
  const askDepthUsd = depthUsd(orderbook.asks);
  const midPrice = bestBid !== null && bestAsk !== null ? (bestBid + bestAsk) / 2 : bestBid ?? bestAsk;
  const impliedProbability = bestAsk ?? midPrice;
  const spread = bestBid !== null && bestAsk !== null ? Math.max(0, bestAsk - bestBid) : null;
  const spreadPct = spread !== null && midPrice !== null && midPrice > 0 ? spread / midPrice : null;
  return {
    conditionId: params.conditionId,
    tokenId: params.tokenId,
    bestBid,
    bestAsk,
    midPrice,
    impliedProbability,
    spread,
    spreadPct,
    bidDepthUsd,
    askDepthUsd,
    totalDepthUsd: bidDepthUsd + askDepthUsd,
    binaryHedge: buildBinaryHedgeRatio(
      bestBid,
      bestAsk,
      bidDepthUsd,
      askDepthUsd
    ),
    timestamp: orderbook.timestamp
  };
}
__name(buildQuoteResponse, "buildQuoteResponse");
function assertSystemStateGates2(state, amountUsd) {
  if (isR20Locked(state) || state.hardlock) {
    throw new DefenseMatrixError3(
      R20_LOCKED,
      `${R20_LOCKED} \u2014 Polymarket adapter blocked; signing channel severed`,
      [
        `hardlock=${state.hardlock}`,
        `currentCri=${state.currentCri}`,
        `signingChannelOpen=${state.signingChannelOpen}`
      ],
      403
    );
  }
  if (!state.signingChannelOpen) {
    throw new DefenseMatrixError3(
      R20_LOCKED,
      "Polymarket adapter blocked \u2014 signing channel closed",
      [`signingChannelOpen=false`],
      403
    );
  }
  try {
    vineWrapProtection({
      symbol: "POLY_HEDGE",
      estimatedLossUsd: amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock
    });
  } catch (err) {
    if (err instanceof HardlockError) {
      throw new DefenseMatrixError3(R20_LOCKED, err.message, [err.message], 403);
    }
    if (err instanceof RiskLimitExceeded) {
      throw new DefenseMatrixError3(
        "ROOT_PROTECTION",
        err.message,
        [err.message],
        422
      );
    }
    throw err;
  }
}
__name(assertSystemStateGates2, "assertSystemStateGates");
function evaluatePolymarketFriction(quote, maxSpread = MAX_BINARY_SPREAD, minLiquidityUsd = MIN_BINARY_LIQUIDITY_USD) {
  const reasons = [];
  const spread = quote.spread ?? quote.binaryHedge.spread;
  const spreadPct = quote.spreadPct ?? quote.binaryHedge.spreadPct;
  const totalDepthUsd = quote.totalDepthUsd;
  if (spreadPct > maxSpread) {
    reasons.push(
      `BINARY_SPREAD=${(spreadPct * 100).toFixed(2)}%>${(maxSpread * 100).toFixed(0)}%`
    );
  }
  if (totalDepthUsd < minLiquidityUsd) {
    reasons.push(
      `BINARY_LIQUIDITY=${totalDepthUsd.toFixed(2)}<${minLiquidityUsd}`
    );
  }
  const mid = quote.midPrice ?? quote.impliedProbability ?? 0.5;
  const ask = quote.bestAsk ?? mid;
  const soil = checkSoilResistance({
    symbol: "POLY_BINARY",
    hlSpot: mid,
    hlPerp: mid,
    dydxPerp: ask + spread,
    depthUsd: Math.max(totalDepthUsd, MIN_DEPTH_USD)
  });
  if (soil.tripped) {
    reasons.push(...soil.reasons);
  }
  const tripped = reasons.length > 0;
  if (tripped) {
    throw new DefenseMatrixError3(
      "SOIL_RESISTANCE_SLIPPAGE_BREAKER",
      "Polymarket friction audit failed \u2014 binary exposure rejected",
      reasons,
      422
    );
  }
  return {
    ok: true,
    tripped: false,
    reasons: [],
    spread,
    spreadPct,
    totalDepthUsd,
    maxSpread,
    minLiquidityUsd,
    soil
  };
}
__name(evaluatePolymarketFriction, "evaluatePolymarketFriction");
async function fetchPolymarketOrderbook(params, options = {}) {
  const state = options.systemState ?? readActiveSystemState();
  const amountUsd = options.amountUsd ?? 100;
  assertSystemStateGates2(state, amountUsd);
  const fetchFn = options.fetchFn ?? fetch;
  const base = options.clobUrl ?? POLYMARKET_CLOB_URL;
  const url = `${base}/book?token_id=${encodeURIComponent(params.tokenId)}`;
  const res = await fetchFn(url, { method: "GET" });
  if (!res.ok) {
    throw new PolymarketApiError(
      `Polymarket orderbook HTTP ${res.status}`,
      "HTTP_ERROR",
      res.status
    );
  }
  let body;
  try {
    body = await res.json();
  } catch {
    throw new PolymarketApiError(
      "Invalid JSON from Polymarket orderbook",
      "INVALID_RESPONSE",
      res.status
    );
  }
  const orderbook = parseOrderbookWire(body);
  if (params.conditionId && orderbook.market.toLowerCase() !== params.conditionId.toLowerCase()) {
    throw new PolymarketApiError(
      `conditionId mismatch: expected ${params.conditionId}, got ${orderbook.market}`,
      "CONDITION_MISMATCH",
      422,
      orderbook
    );
  }
  const quote = buildQuoteResponse(params, orderbook);
  evaluatePolymarketFriction(
    quote,
    options.maxSpread ?? MAX_BINARY_SPREAD,
    options.minLiquidityUsd ?? MIN_BINARY_LIQUIDITY_USD
  );
  return quote;
}
__name(fetchPolymarketOrderbook, "fetchPolymarketOrderbook");

// src/services/counter-attack-matrix.ts
var PANIC_IMBALANCE_THRESHOLD = 0.75;
var COUNTER_ATTACK_MAX_LIVE_SLIPPAGE = 3e-3;
var SOIL_ANCHOR_TOLERANCE_BPS = 30;
function computeOrderbookImbalanceRatio(askDepthUsd, bidDepthUsd) {
  const total = askDepthUsd + bidDepthUsd;
  if (!(total > 0)) return 0;
  return (askDepthUsd - bidDepthUsd) / total;
}
__name(computeOrderbookImbalanceRatio, "computeOrderbookImbalanceRatio");
function isExtremePanicSell(imbalanceRatio) {
  return imbalanceRatio > PANIC_IMBALANCE_THRESHOLD;
}
__name(isExtremePanicSell, "isExtremePanicSell");
function isAtStrongSoilAnchor(markPx, soilAnchorPx, toleranceBps = SOIL_ANCHOR_TOLERANCE_BPS) {
  if (!(markPx > 0 && soilAnchorPx > 0)) return false;
  const band = toleranceBps / 1e4;
  return Math.abs(markPx - soilAnchorPx) / soilAnchorPx <= band;
}
__name(isAtStrongSoilAnchor, "isAtStrongSoilAnchor");
function computePassiveMakerLimitPx(bestBid, side = "buy", bestAsk) {
  if (side === "buy") {
    return bestBid > 0 ? String(bestBid) : null;
  }
  return bestAsk !== void 0 && bestAsk > 0 ? String(bestAsk) : null;
}
__name(computePassiveMakerLimitPx, "computePassiveMakerLimitPx");
function computeCounterAttackSize(orderNotionalUsd, limitPx) {
  if (!(orderNotionalUsd > 0 && limitPx > 0)) return null;
  return String(orderNotionalUsd / limitPx);
}
__name(computeCounterAttackSize, "computeCounterAttackSize");
function resolveLiveSlippageRatio(probe) {
  const spread = (probe.spreadBps ?? 0) / 1e4;
  const impact = (probe.priceImpactBps ?? 0) / 1e4;
  const spotPerp = probe.spotPerpSlippage ?? 0;
  return Math.max(spread, impact, spotPerp);
}
__name(resolveLiveSlippageRatio, "resolveLiveSlippageRatio");
function buildLiveProbe(input) {
  const depthUsd2 = input.depthUsd ?? Math.min(input.bidDepthUsd, input.askDepthUsd);
  const spreadBps = input.spreadBps ?? (input.bestBid > 0 && input.bestAsk > 0 ? (input.bestAsk - input.bestBid) / ((input.bestAsk + input.bestBid) / 2) * 1e4 : Number.POSITIVE_INFINITY);
  return {
    symbol: input.symbol,
    bestBid: input.bestBid,
    bestAsk: input.bestAsk,
    midPx: input.midPx,
    bidDepthUsd: input.bidDepthUsd,
    askDepthUsd: input.askDepthUsd,
    spreadBps,
    priceImpactBps: input.priceImpactBps ?? spreadBps,
    depthUsd: depthUsd2
  };
}
__name(buildLiveProbe, "buildLiveProbe");
function evalCounterAttackOpportunity(input) {
  const reasons = [];
  const dynamicMaxSlUsd = computeEffectiveMaxSlUsd(input.accountBalanceUsd);
  const orderNotionalUsd = input.orderNotionalUsd ?? dynamicMaxSlUsd;
  const imbalanceRatio = computeOrderbookImbalanceRatio(
    input.askDepthUsd,
    input.bidDepthUsd
  );
  const panicDetected = isExtremePanicSell(imbalanceRatio);
  const atSoilAnchor = isAtStrongSoilAnchor(input.markPx, input.soilAnchorPx);
  if (!panicDetected) {
    reasons.push(
      `IMBALANCE=${imbalanceRatio.toFixed(4)}<=${PANIC_IMBALANCE_THRESHOLD}`
    );
  }
  if (!atSoilAnchor) {
    reasons.push(
      `NOT_AT_SOIL_ANCHOR mark=${input.markPx} anchor=${input.soilAnchorPx}`
    );
  }
  const probe = buildLiveProbe(input);
  const soilAudit = auditLiveBookSoilResistance(probe, input.at);
  const soil = {
    ok: soilAudit.ok,
    tripped: soilAudit.tripped,
    crossVenueSlippage: soilAudit.crossVenueSlippage,
    spotPerpSlippage: soilAudit.spotPerpSlippage,
    reasons: soilAudit.reasons
  };
  if (soil.tripped) {
    reasons.push(...soil.reasons.map((r) => `SOIL:${r}`));
  }
  const liveSlippageRatio = resolveLiveSlippageRatio({
    spreadBps: probe.spreadBps,
    priceImpactBps: probe.priceImpactBps,
    spotPerpSlippage: soil.spotPerpSlippage
  });
  if (liveSlippageRatio > COUNTER_ATTACK_MAX_LIVE_SLIPPAGE) {
    reasons.push(
      `LIVE_SLIPPAGE=${(liveSlippageRatio * 100).toFixed(4)}%>${COUNTER_ATTACK_MAX_LIVE_SLIPPAGE * 100}%`
    );
  }
  if (orderNotionalUsd > dynamicMaxSlUsd) {
    reasons.push(
      `ORDER_NOTIONAL=${orderNotionalUsd.toFixed(2)}>dynamicMaxSlUsd=${dynamicMaxSlUsd.toFixed(2)}`
    );
  }
  try {
    vineWrapProtection({
      symbol: input.symbol,
      estimatedLossUsd: orderNotionalUsd,
      accountBalanceUsd: input.accountBalanceUsd,
      maxLossLimit: dynamicMaxSlUsd
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!(err instanceof RiskLimitExceeded) || !reasons.some((r) => r.startsWith("ORDER_NOTIONAL"))) {
      reasons.push(`ROOT:${msg}`);
    }
  }
  const structuralOk = panicDetected && atSoilAnchor;
  const safetyOk = !soil.tripped && liveSlippageRatio <= COUNTER_ATTACK_MAX_LIVE_SLIPPAGE && orderNotionalUsd <= dynamicMaxSlUsd && !reasons.some((r) => r.startsWith("ROOT:"));
  const armed = structuralOk && safetyOk;
  const limitPxNum = armed ? input.bestBid : 0;
  const limitPx = armed ? computePassiveMakerLimitPx(input.bestBid, "buy") : null;
  const sz = armed ? computeCounterAttackSize(orderNotionalUsd, limitPxNum) : null;
  return {
    verdict: armed ? "STRIKE" : "REJECT",
    armed,
    imbalanceRatio,
    panicDetected,
    atSoilAnchor,
    liveSlippageRatio,
    liveSlippageBps: liveSlippageRatio * 1e4,
    soil,
    limitPx,
    sz,
    orderNotionalUsd,
    dynamicMaxSlUsd,
    reasons
  };
}
__name(evalCounterAttackOpportunity, "evalCounterAttackOpportunity");

// src/services/santenmoku-three-eye.ts
var TELEMETRY_VENUES = [
  "HYPERLIQUID",
  "JUPITER",
  "POLYMARKET"
];
var DEFAULT_COUNTER_ATTACK_COIN = "BTC";
var HL_SOIL_PROBE = {
  symbol: "HL_PROBE",
  hlSpot: 5e4,
  hlPerp: 50010,
  dydxPerp: 50005,
  depthUsd: 5e5
};
var JUPITER_SOIL_PROBE = {
  inputMint: "So11111111111111111111111111111111111111112",
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  inAmount: "100000000",
  outAmount: "16198753",
  slippageBps: 5,
  priceImpactPct: "0.05"
};
var POLYMARKET_FRICTION_PROBE = {
  conditionId: "0xprobe",
  tokenId: "probe-token",
  bestBid: 0.05495,
  bestAsk: 0.05505,
  midPrice: 0.055,
  impliedProbability: 0.05505,
  spread: 1e-4,
  spreadPct: 1e-4 / 0.055,
  bidDepthUsd: 5e4,
  askDepthUsd: 45e3,
  totalDepthUsd: 95e3,
  binaryHedge: {
    yesProbability: 0.05505,
    noProbability: 0.94495,
    hedgeRatio: 0.05505 / 0.94495,
    spread: 1e-4,
    spreadPct: 1e-4 / 0.055,
    totalDepthUsd: 95e3
  },
  timestamp: (/* @__PURE__ */ new Date()).toISOString()
};
function probeHyperliquidAdapter() {
  const soil = checkSoilResistance(HL_SOIL_PROBE);
  const marginTier = evaluateSoilResistance(25);
  const moduleReady = typeof evaluateSoilResistance === "function";
  const soilOk = soil.ok && marginTier === "HEALTHY";
  return {
    venue: "HYPERLIQUID",
    ready: moduleReady && soilOk,
    soilOk
  };
}
__name(probeHyperliquidAdapter, "probeHyperliquidAdapter");
function probeJupiterAdapter() {
  let soilOk = false;
  try {
    evaluateJupiterSoilResistance(JUPITER_SOIL_PROBE, void 0, 100);
    soilOk = true;
  } catch {
    soilOk = false;
  }
  return {
    venue: "JUPITER",
    ready: typeof evaluateJupiterSoilResistance === "function" && soilOk,
    soilOk
  };
}
__name(probeJupiterAdapter, "probeJupiterAdapter");
function probePolymarketAdapter() {
  let soilOk = false;
  try {
    evaluatePolymarketFriction(POLYMARKET_FRICTION_PROBE);
    soilOk = true;
  } catch {
    soilOk = false;
  }
  return {
    venue: "POLYMARKET",
    ready: typeof evaluatePolymarketFriction === "function" && soilOk,
    soilOk
  };
}
__name(probePolymarketAdapter, "probePolymarketAdapter");
function auditThreeEyeAdapters(state) {
  if (isR20Locked(state) || state.hardlock || !state.signingChannelOpen) {
    return {
      activeVenues: [],
      santenmokuStatus: "THREE_EYES_LOCKED",
      adapters: TELEMETRY_VENUES.map((venue) => ({
        venue,
        ready: false,
        soilOk: false
      }))
    };
  }
  const adapters = [
    probeHyperliquidAdapter(),
    probeJupiterAdapter(),
    probePolymarketAdapter()
  ];
  const allReady = adapters.every((adapter) => adapter.ready);
  return {
    activeVenues: allReady ? TELEMETRY_VENUES : [],
    santenmokuStatus: allReady ? "THREE_EYES_ACTIVE" : "THREE_EYES_DEGRADED",
    adapters
  };
}
__name(auditThreeEyeAdapters, "auditThreeEyeAdapters");
function buildCounterAttackInputFromMetrics(symbol, metrics, state, orderNotionalUsd) {
  return {
    symbol,
    markPx: metrics.midPx,
    soilAnchorPx: metrics.bestBid,
    bestBid: metrics.bestBid,
    bestAsk: metrics.bestAsk,
    midPx: metrics.midPx,
    bidDepthUsd: metrics.bidDepthUsd,
    askDepthUsd: metrics.askDepthUsd,
    depthUsd: metrics.depthUsd,
    spreadBps: metrics.spreadBps,
    priceImpactBps: metrics.priceImpactBps,
    accountBalanceUsd: state.accountBalanceUsd,
    orderNotionalUsd
  };
}
__name(buildCounterAttackInputFromMetrics, "buildCounterAttackInputFromMetrics");
function evaluateCounterAttackSync(state, coin = DEFAULT_COUNTER_ATTACK_COIN, orderNotionalUsd) {
  const cached = peekCachedLiveL2Book(coin);
  if (!cached) return null;
  const metrics = computeLiveBookMetrics(cached.book);
  if (!metrics) return null;
  return evalCounterAttackOpportunity(
    buildCounterAttackInputFromMetrics(
      cached.coin,
      metrics,
      state,
      orderNotionalUsd
    )
  );
}
__name(evaluateCounterAttackSync, "evaluateCounterAttackSync");
function resolveCounterAttackStatus(state, audit, counter) {
  if (isR20Locked(state) || state.hardlock || audit.santenmokuStatus === "THREE_EYES_LOCKED") {
    return "LOCKED";
  }
  if (!counter) return "STANDBY";
  if (counter.armed) return "ARMED_AND_READY";
  if (counter.panicDetected && counter.atSoilAnchor) return "REJECT";
  return "STANDBY";
}
__name(resolveCounterAttackStatus, "resolveCounterAttackStatus");
function buildPassiveMakerOrder(counter, assetIndex) {
  if (!counter.limitPx || !counter.sz) return null;
  return {
    asset: assetIndex,
    isBuy: true,
    limitPx: counter.limitPx,
    sz: counter.sz,
    reduceOnly: false,
    orderType: { limit: { tif: "Alo" } }
  };
}
__name(buildPassiveMakerOrder, "buildPassiveMakerOrder");
async function evaluateSantenmokuHub(state, options = {}) {
  const audit = auditThreeEyeAdapters(state);
  const coin = options.coin ?? DEFAULT_COUNTER_ATTACK_COIN;
  if (audit.santenmokuStatus === "THREE_EYES_LOCKED") {
    return {
      ...audit,
      counterAttack: null,
      counterAttackStatus: "LOCKED",
      execution: null
    };
  }
  await fetchLiveL2Book(coin, {
    fetchFn: options.fetchFn,
    maxRetries: 1
  });
  const counter = evaluateCounterAttackSync(
    state,
    coin,
    options.orderNotionalUsd
  );
  const counterAttackStatus = resolveCounterAttackStatus(state, audit, counter);
  let execution = null;
  if (counter?.armed && options.execute !== false && counterAttackStatus === "ARMED_AND_READY") {
    const order = buildPassiveMakerOrder(
      counter,
      options.assetIndex ?? 0
    );
    if (order) {
      execution = await signAndExecuteOrder(order, {
        systemState: state,
        dryRun: options.dryRun
      });
    }
  }
  return {
    ...audit,
    counterAttack: counter,
    counterAttackStatus,
    execution
  };
}
__name(evaluateSantenmokuHub, "evaluateSantenmokuHub");
function readCounterAttackTelemetryStatus(state) {
  const audit = auditThreeEyeAdapters(state);
  const counter = evaluateCounterAttackSync(state);
  return resolveCounterAttackStatus(state, audit, counter);
}
__name(readCounterAttackTelemetryStatus, "readCounterAttackTelemetryStatus");

// src/api/hud-telemetry.ts
var HUD_STREAM_DEBOUNCE_MS = 100;
var HUD_FALLBACK_LIVE_PAIRS = 162;
var HUD_FALLBACK_MARKET_PROBE = {
  selectToken: "BTC",
  bestToken: "SOL",
  livePairsCount: HUD_FALLBACK_LIVE_PAIRS,
  topPairs: [
    { symbol: "SOL", annualYieldPct: 24.6 },
    { symbol: "ETH", annualYieldPct: 18.2 },
    { symbol: "BTC", annualYieldPct: 12.4 }
  ]
};
var lastStream = null;
function isHudDryRunView(state) {
  return !state.signingChannelOpen || state.isSandboxMode || state.hardlock || isR20Locked(state);
}
__name(isHudDryRunView, "isHudDryRunView");
function resolveConnectivityMode(state, dryRun, rightStatus) {
  if (dryRun) return "CONNECTED_MOCK";
  if (state.hardlock || isR20Locked(state)) return "DISCONNECTED";
  if (rightStatus === "STANDBY" || state.isStale) return "STANDBY";
  return "CONNECTED";
}
__name(resolveConnectivityMode, "resolveConnectivityMode");
function buildHudStreamPayload(now = Date.now()) {
  const state = readActiveSystemState();
  const threeEye = auditThreeEyeAdapters(state);
  const dryRun = isHudDryRunView(state);
  const leftStatus = dryRun ? "STANDBY" : state.hardlock ? "LOCKED" : state.isHedgeActive ? "PASS" : "STANDBY";
  const rightStatus = dryRun ? "STANDBY" : threeEye.santenmokuStatus === "THREE_EYES_ACTIVE" ? "ACTIVE" : threeEye.santenmokuStatus === "THREE_EYES_DEGRADED" ? "STANDBY" : "OFFLINE";
  const useFallbackMarket = dryRun || threeEye.activeVenues.length === 0 || rightStatus !== "ACTIVE";
  const estimatedPnlUsd = state.accountBalanceUsd - 1e4;
  const connectivityMode = resolveConnectivityMode(state, dryRun, rightStatus);
  return {
    success: true,
    timestamp: new Date(now).toISOString(),
    debounceMs: HUD_STREAM_DEBOUNCE_MS,
    isStale: dryRun ? false : state.isStale,
    connectivityMode,
    marketProbe: useFallbackMarket ? HUD_FALLBACK_MARKET_PROBE : {
      selectToken: HUD_FALLBACK_MARKET_PROBE.selectToken,
      bestToken: HUD_FALLBACK_MARKET_PROBE.bestToken,
      livePairsCount: HUD_FALLBACK_LIVE_PAIRS,
      topPairs: HUD_FALLBACK_MARKET_PROBE.topPairs
    },
    leftEyeDefense: {
      status: leftStatus,
      dynamicMaxSlUsd: state.dynamicMaxSL,
      hardlock: dryRun ? false : state.hardlock
    },
    rightEyeProbe: {
      status: rightStatus,
      santenmokuStatus: dryRun ? "THREE_EYES_STANDBY" : threeEye.santenmokuStatus,
      activeVenues: dryRun ? TELEMETRY_VENUES : threeEye.activeVenues.length > 0 ? threeEye.activeVenues : TELEMETRY_VENUES
    },
    crownTreasuryPnl: {
      accountBalanceUsd: state.accountBalanceUsd,
      estimatedPnlUsd,
      criIndex: state.currentCri,
      hudState: dryRun ? "IDLE" : state.hudState
    },
    blackSwanDefense: {
      active: isBlackSwanDefenseActive(),
      hudTag: getBlackSwanDefenseHudLabel(),
      triggers: readBlackSwanActiveTriggers()
    }
  };
}
__name(buildHudStreamPayload, "buildHudStreamPayload");
function handleHudStreamRequest(request) {
  const auth = validateHudStreamRequest(request);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ success: false, error: auth.message, locked: true }),
      { status: auth.status, headers: CORS_JSON_HEADERS }
    );
  }
  const now = Date.now();
  if (lastStream && now - lastStream.at < HUD_STREAM_DEBOUNCE_MS) {
    return new Response(JSON.stringify(lastStream.body), {
      status: 200,
      headers: CORS_JSON_HEADERS
    });
  }
  const body = buildHudStreamPayload(now);
  lastStream = { at: now, body };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: CORS_JSON_HEADERS
  });
}
__name(handleHudStreamRequest, "handleHudStreamRequest");

// src/api/page.ts
async function handlePageRequest(env, request) {
  if (env.ASSETS) {
    return env.ASSETS.fetch(request);
  }
  return new Response(
    "Be\u0394 Living Water \u2014 build SPA with `pnpm run build:spa` before serving.",
    {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    }
  );
}
__name(handlePageRequest, "handlePageRequest");

// src/core/fee-calculator.ts
var PERFORMANCE_FEE_RATE = 0.15;
var INSTANT_WITHDRAWAL_CONVENIENCE_FEE_RATE = 1e-3;
var DONDON_CHARITY_BPS = 10;
var DONDON_CHARITY_RATE = DONDON_CHARITY_BPS / 1e4;
var CONSERVATIVE_NET_APY_BAND = {
  min: 6.2,
  base: 11.5,
  max: 22.4
};
function buildNetApyBand(liveNetApyFraction) {
  const livePct = Number((liveNetApyFraction * 100).toFixed(1));
  const base = livePct > 0 ? Math.min(
    CONSERVATIVE_NET_APY_BAND.max,
    Math.max(CONSERVATIVE_NET_APY_BAND.min, livePct)
  ) : CONSERVATIVE_NET_APY_BAND.base;
  return {
    min: CONSERVATIVE_NET_APY_BAND.min,
    base,
    max: CONSERVATIVE_NET_APY_BAND.max
  };
}
__name(buildNetApyBand, "buildNetApyBand");
function calculateYieldFees(grossApy) {
  const safeGross = Math.max(0, grossApy);
  const performanceFeeApy = safeGross * PERFORMANCE_FEE_RATE;
  const netApy = safeGross - performanceFeeApy;
  return {
    grossApy: safeGross,
    performanceFeeRate: PERFORMANCE_FEE_RATE,
    performanceFeeApy,
    netApy,
    protocolTreasuryFee: performanceFeeApy,
    instantWithdrawalFeeRate: INSTANT_WITHDRAWAL_CONVENIENCE_FEE_RATE,
    dondonCharityShare: safeGross * DONDON_CHARITY_RATE
  };
}
__name(calculateYieldFees, "calculateYieldFees");

// src/api/routes/telemetry.ts
function resolveSoilResistanceStatus(state) {
  if (isR20Locked(state) || state.hardlock) return "LOCKED";
  if (state.isHedgeActive) return "PASS";
  return "STANDBY";
}
__name(resolveSoilResistanceStatus, "resolveSoilResistanceStatus");
function resolveLubanExoskeletonStatus(state) {
  if (isBlackSwanDefenseActive() || state.hardlock || isR20Locked(state)) {
    return "COLLAPSE";
  }
  return "SAFE";
}
__name(resolveLubanExoskeletonStatus, "resolveLubanExoskeletonStatus");
function handleTelemetryHealthRequest() {
  const state = readActiveSystemState();
  const threeEye = auditThreeEyeAdapters(state);
  const body = {
    success: true,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    criIndex: state.currentCri,
    hudState: state.hudState,
    soilResistance: {
      status: resolveSoilResistanceStatus(state),
      hedgeChannelActive: state.isHedgeActive
    },
    activeVenues: threeEye.activeVenues,
    santenmokuStatus: threeEye.santenmokuStatus,
    adapterAudit: threeEye.adapters,
    circuitBreakers: {
      r20Locked: isR20Locked(state),
      hardlock: state.hardlock,
      signingChannelOpen: state.signingChannelOpen,
      dynamicMaxSlUsd: state.dynamicMaxSL
    },
    counterAttackStatus: readCounterAttackTelemetryStatus(state),
    blackSwanDefense: {
      active: isBlackSwanDefenseActive(),
      hudTag: getBlackSwanDefenseHudLabel(),
      triggers: readBlackSwanActiveTriggers(),
      recentLogs: getRecentBlackSwanLogs()
    },
    lubanExoskeleton: {
      status: resolveLubanExoskeletonStatus(state),
      cushionArmed: true
    },
    dondonCharityEngine: {
      status: "ACTIVE",
      feeBps: DONDON_CHARITY_BPS
    }
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: CORS_JSON_HEADERS
  });
}
__name(handleTelemetryHealthRequest, "handleTelemetryHealthRequest");

// src/adapters/hyperliquid.ts
var HL_INFO_URL2 = "https://api.hyperliquid.xyz/info";
async function postInfo(body, opts) {
  const url = opts.infoUrl ?? HL_INFO_URL2;
  const init = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
  const res = opts.fetchFn ? await opts.fetchFn(url, init) : await fetchAllowlisted(url, init);
  if (!res.ok) throw new Error(`HL info HTTP ${res.status}`);
  return await res.json();
}
__name(postInfo, "postInfo");
function findVault(vaults, symbol) {
  const key = symbol.toUpperCase();
  return vaults.find((v) => v.name?.toUpperCase().includes(key));
}
__name(findVault, "findVault");
var HyperliquidYieldAdapter = class {
  constructor(opts = {}) {
    this.opts = opts;
  }
  opts;
  static {
    __name(this, "HyperliquidYieldAdapter");
  }
  id = "hyperliquid";
  async getDepth(symbol) {
    const data = await postInfo({ type: "metaAndAssetCtxs" }, this.opts);
    const universe = data[0]?.universe ?? [];
    const ctxs = data[1] ?? [];
    const idx = universe.findIndex((a) => a.name.toUpperCase() === symbol.toUpperCase());
    const asset = idx >= 0 ? universe[idx] : universe[0];
    const ctx = idx >= 0 ? ctxs[idx] : ctxs[0];
    const mark = parseFloat(ctx?.markPx ?? ctx?.oraclePx ?? ctx?.midPx ?? "0");
    const mid = parseFloat(ctx?.midPx ?? ctx?.oraclePx ?? String(mark));
    const dayVol = parseFloat(ctx?.dayNtlVlm ?? asset?.dayNtlVlm ?? "0");
    const depthUsd2 = dayVol > 0 ? dayVol * 0.05 : 5e5;
    return {
      venue: "hyperliquid",
      symbol: symbol.toUpperCase(),
      depthUsd: depthUsd2,
      spotPrice: mid || mark,
      perpPrice: mark || mid,
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async getAPY(symbol) {
    const funding = await this.getFundingApy(symbol);
    const vault = await this.getVaultApy(symbol);
    const best = Math.max(funding, vault);
    if (best > 0) return best;
    return this.opts.defaultApy ?? 0.08;
  }
  /** Hourly funding rate annualized (absolute) */
  async getFundingApy(symbol) {
    try {
      const sym = (symbol ?? "ETH").toUpperCase();
      const data = await postInfo({ type: "metaAndAssetCtxs" }, this.opts);
      const idx = data[0]?.universe.findIndex(
        (a) => a.name.toUpperCase() === sym
      );
      const ctx = idx !== void 0 && idx >= 0 ? data[1]?.[idx] : data[1]?.[0];
      const funding = parseFloat(ctx?.funding ?? "0");
      if (Number.isFinite(funding)) {
        return Math.abs(funding) * 24 * 365;
      }
    } catch {
    }
    return 0;
  }
  /** HL Lend / vault APR */
  async getVaultApy(symbol) {
    try {
      const vaults = await postInfo({ type: "vaultSummaries" }, this.opts);
      const target = symbol ? findVault(vaults, symbol) : vaults[0];
      const vaultApr = parseFloat(target?.apr ?? "0");
      return Number.isFinite(vaultApr) ? vaultApr : 0;
    } catch {
      return 0;
    }
  }
  async checkHealth() {
    const t0 = performance.now();
    try {
      await postInfo({ type: "metaAndAssetCtxs" }, this.opts);
      return { ok: true, latencyMs: performance.now() - t0, reasons: [] };
    } catch (err) {
      return {
        ok: false,
        latencyMs: performance.now() - t0,
        reasons: [err instanceof Error ? err.message : String(err)]
      };
    }
  }
};
var hyperliquidYieldAdapter = new HyperliquidYieldAdapter();

// src/adapters/jupiter.ts
var JUPITER_QUOTE_URL2 = "https://quote-api.jup.ag/v6/quote";
var JUPITER_ALLOWED_HOSTS = ["quote-api.jup.ag"];
var SOL_MINT = "So11111111111111111111111111111111111111112";
var USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
var SYMBOL_MINT = {
  SOL: { input: SOL_MINT, decimals: 9, px: 150 },
  BTC: { input: "cbbtf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij", decimals: 8, px: 65e3 }
};
function resolveMint(symbol) {
  const key = symbol.toUpperCase();
  return SYMBOL_MINT[key] ?? SYMBOL_MINT.SOL;
}
__name(resolveMint, "resolveMint");
async function fetchQuote(symbol, opts) {
  const mint = resolveMint(symbol);
  const probeUsd = opts.probeUsd ?? 1e4;
  const amount = String(Math.round(probeUsd / mint.px * 10 ** mint.decimals));
  const url = `${opts.quoteUrl ?? JUPITER_QUOTE_URL2}?inputMint=${mint.input}&outputMint=${USDC_MINT}&amount=${amount}&slippageBps=50`;
  const fetchFn = opts.fetchFn ?? fetch;
  const res = opts.fetchFn ? await fetchFn(url) : await fetchAllowlisted(url, void 0, JUPITER_ALLOWED_HOSTS);
  if (!res.ok) throw new Error(`Jupiter quote HTTP ${res.status}`);
  return await res.json();
}
__name(fetchQuote, "fetchQuote");
function depthFromQuote(quote, probeUsd) {
  const impact = Math.abs(parseFloat(quote.priceImpactPct ?? "0")) / 100;
  const outUsd = Number(quote.outAmount) / 1e6;
  if (impact > 0 && Number.isFinite(outUsd)) return Math.max(outUsd / impact, probeUsd * 10);
  return Math.max(outUsd * 50, probeUsd * 5);
}
__name(depthFromQuote, "depthFromQuote");
var JupiterAdapter = class {
  constructor(opts = {}) {
    this.opts = opts;
  }
  opts;
  static {
    __name(this, "JupiterAdapter");
  }
  id = "jupiter";
  async getDepth(symbol) {
    const probeUsd = this.opts.probeUsd ?? 1e4;
    const quote = await fetchQuote(symbol, this.opts);
    const mint = resolveMint(symbol);
    const spot = mint.px;
    const impact = parseFloat(quote.priceImpactPct ?? "0") / 100;
    const perp = spot * (1 + impact);
    return {
      venue: "jupiter",
      symbol: symbol.toUpperCase(),
      depthUsd: depthFromQuote(quote, probeUsd),
      spotPrice: spot,
      perpPrice: perp,
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async getAPY(symbol) {
    try {
      const quote = await fetchQuote(symbol ?? "SOL", this.opts);
      const impact = Math.abs(parseFloat(quote.priceImpactPct ?? "0")) / 100;
      const base = this.opts.defaultApy ?? 0.07;
      return Math.max(base - impact, 0);
    } catch {
      return this.opts.defaultApy ?? 0.07;
    }
  }
  async checkHealth() {
    const t0 = performance.now();
    try {
      await fetchQuote("SOL", this.opts);
      return { ok: true, latencyMs: performance.now() - t0, reasons: [] };
    } catch (err) {
      return {
        ok: false,
        latencyMs: performance.now() - t0,
        reasons: [err instanceof Error ? err.message : String(err)]
      };
    }
  }
};
var jupiterAdapter = new JupiterAdapter();

// src/adapters/gmx.ts
var GMX_MARKETS_INFO_URL = "https://arbitrum-api.gmxinfra.io/markets/info";
var ARBITRUM_RPC_URL = "https://arb1.arbitrum.io/rpc";
var GMX_V2_DATASTORE = "0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8";
var GMX_MARKET_LIST_CALL = "0xf3903b9fcdac201abd09598973b1365dbbaeb65ff0f370d30bb5c7440dc3341f570b2e38";
var GMX_ALLOWED_HOSTS = ["arbitrum-api.gmxinfra.io", "arb1.arbitrum.io"];
var pickMarket = /* @__PURE__ */ __name((markets, symbol) => markets.find((m) => m.name?.toUpperCase().includes(symbol.toUpperCase())), "pickMarket");
function poolDepthUsd(market) {
  const max = parseFloat(market.poolValueMax ?? "0");
  const min = parseFloat(market.poolValueMin ?? "0");
  if (max > 0) return max;
  if (min > 0) return min;
  return Math.max(parseFloat(market.longPoolAmount ?? "0"), parseFloat(market.shortPoolAmount ?? "0")) / 1e6;
}
__name(poolDepthUsd, "poolDepthUsd");
function referencePx(symbol) {
  const key = symbol.toUpperCase();
  if (key.includes("BTC")) return 65e3;
  if (key.includes("ETH")) return 3500;
  return 150;
}
__name(referencePx, "referencePx");
async function rpcPost(opts, body) {
  const rpc = opts.rpcUrl ?? ARBITRUM_RPC_URL;
  const init = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
  const res = opts.fetchFn ? await opts.fetchFn(rpc, init) : await fetchAllowlisted(rpc, init, GMX_ALLOWED_HOSTS);
  if (!res.ok) throw new Error(`Arbitrum RPC HTTP ${res.status}`);
  const json2 = await res.json();
  if (json2.error) throw new Error(json2.error.message ?? "Arbitrum RPC error");
  return json2.result;
}
__name(rpcPost, "rpcPost");
async function readVaultMarketCount(opts) {
  const result = await rpcPost(opts, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [{ to: opts.dataStore ?? GMX_V2_DATASTORE, data: GMX_MARKET_LIST_CALL }, "latest"]
  });
  return typeof result === "string" && result.startsWith("0x") ? parseInt(result, 16) : 0;
}
__name(readVaultMarketCount, "readVaultMarketCount");
async function fetchMarketsInfo(opts) {
  const url = opts.marketsUrl ?? GMX_MARKETS_INFO_URL;
  const res = opts.fetchFn ? await opts.fetchFn(url) : await fetchAllowlisted(url, void 0, GMX_ALLOWED_HOSTS);
  if (!res.ok) throw new Error(`GMX markets/info HTTP ${res.status}`);
  const body = await res.json();
  return Array.isArray(body) ? body : body.markets ?? [];
}
__name(fetchMarketsInfo, "fetchMarketsInfo");
var GmxAdapter = class {
  constructor(opts = {}) {
    this.opts = opts;
  }
  opts;
  static {
    __name(this, "GmxAdapter");
  }
  id = "gmx";
  async getDepth(symbol) {
    const [markets, vaultMarkets] = await Promise.all([fetchMarketsInfo(this.opts), readVaultMarketCount(this.opts)]);
    const market = pickMarket(markets, symbol) ?? markets[0];
    if (!market || market.isDisabled || vaultMarkets <= 0) throw new Error(`GMX vault/market unavailable: ${symbol}`);
    const px = referencePx(symbol);
    return {
      venue: "gmx",
      symbol: symbol.toUpperCase(),
      depthUsd: poolDepthUsd(market),
      spotPrice: px,
      perpPrice: px,
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async getAPY(symbol) {
    const markets = await fetchMarketsInfo(this.opts);
    const market = pickMarket(markets, symbol ?? "ETH") ?? markets[0];
    if (!market) return 0;
    const borrow = parseFloat(market.borrowingFactorPerSecondForLongs ?? "0");
    const funding = parseFloat(market.fundingFactorPerSecond ?? "0");
    return Math.min(Math.abs(borrow + funding) * 31536e3, 2);
  }
  async checkHealth() {
    const t0 = performance.now();
    try {
      const [markets, vaultMarkets, blockHex] = await Promise.all([
        fetchMarketsInfo(this.opts),
        readVaultMarketCount(this.opts),
        rpcPost(this.opts, { jsonrpc: "2.0", id: 2, method: "eth_blockNumber", params: [] })
      ]);
      const reasons = [];
      if (markets.length === 0) reasons.push("GMX_MARKETS_EMPTY");
      if (vaultMarkets <= 0) reasons.push("GMX_VAULT_EMPTY");
      if (typeof blockHex !== "string" || !blockHex.startsWith("0x")) reasons.push("ARBITRUM_RPC_UNREACHABLE");
      return { ok: reasons.length === 0, latencyMs: performance.now() - t0, reasons };
    } catch (err) {
      return { ok: false, latencyMs: performance.now() - t0, reasons: [err instanceof Error ? err.message : String(err)] };
    }
  }
};
var gmxAdapter = new GmxAdapter();

// src/adapters/arbitrum/arbitrum-yield-ingress.ts
var ARBITRUM_STABLE_ADDRESSES = {
  USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  USDT: "0xFd086bC7CD5C481DCC9CE3f219033bB859fA8Cb"
};
var DEFAULT_AAVE_BASE_APY = {
  USDC: 0.038,
  USDT: 0.035
};
var STABLE_NAME_HINTS = {
  USDC: ["USDC", "USDC/USD"],
  USDT: ["USDT", "USDT/USD"]
};
function normalizeApr(raw) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.abs(raw) > 1 ? raw / 100 : raw;
}
__name(normalizeApr, "normalizeApr");
function gmxMarketApy(market) {
  const borrow = parseFloat(market.borrowingFactorPerSecondForLongs ?? "0");
  const funding = parseFloat(market.fundingFactorPerSecond ?? "0");
  return Math.min(Math.abs(borrow + funding) * 31536e3, 2);
}
__name(gmxMarketApy, "gmxMarketApy");
function gmxPoolDepthUsd(market) {
  const max = parseFloat(market.poolValueMax ?? "0");
  const min = parseFloat(market.poolValueMin ?? "0");
  if (max > 0) return max;
  if (min > 0) return min;
  return Math.max(
    parseFloat(market.longPoolAmount ?? "0"),
    parseFloat(market.shortPoolAmount ?? "0")
  ) / 1e6;
}
__name(gmxPoolDepthUsd, "gmxPoolDepthUsd");
async function fetchGmxMarkets(opts) {
  const url = opts.marketsUrl ?? GMX_MARKETS_INFO_URL;
  try {
    const res = opts.fetchFn ? await opts.fetchFn(url) : await fetchAllowlisted(url, void 0, GMX_ALLOWED_HOSTS);
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body) ? body : body.markets ?? [];
  } catch {
    return [];
  }
}
__name(fetchGmxMarkets, "fetchGmxMarkets");
function pickStableMarket(markets, symbol) {
  const hints = STABLE_NAME_HINTS[symbol];
  return markets.find(
    (m) => !m.isDisabled && hints.some((h) => m.name?.toUpperCase().includes(h.toUpperCase()))
  );
}
__name(pickStableMarket, "pickStableMarket");
async function fetchArbitrumStableYield(symbol, opts = {}) {
  const address = ARBITRUM_STABLE_ADDRESSES[symbol];
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  const markets = await fetchGmxMarkets(opts);
  const stableMarket = pickStableMarket(markets, symbol);
  const proxyMarket = stableMarket ?? markets.find((m) => !m.isDisabled) ?? markets[0];
  if (proxyMarket) {
    const rawApy = gmxMarketApy(proxyMarket);
    const baseApy = normalizeApr(rawApy) || (stableMarket ? DEFAULT_AAVE_BASE_APY[symbol] : DEFAULT_AAVE_BASE_APY[symbol] * 0.85);
    const scaledApy = stableMarket ? baseApy : baseApy * 0.25;
    return {
      symbol,
      address,
      baseApy: scaledApy > 0 ? scaledApy : DEFAULT_AAVE_BASE_APY[symbol],
      depthUsd: Math.max(gmxPoolDepthUsd(proxyMarket), 25e4),
      source: stableMarket ? "gmx" : "gmx",
      fetchedAt
    };
  }
  return {
    symbol,
    address,
    baseApy: DEFAULT_AAVE_BASE_APY[symbol],
    depthUsd: 75e4,
    source: "aave",
    fetchedAt
  };
}
__name(fetchArbitrumStableYield, "fetchArbitrumStableYield");
async function fetchAllArbitrumStableYields(opts = {}) {
  const symbols = ["USDC", "USDT"];
  return Promise.all(symbols.map((s) => fetchArbitrumStableYield(s, opts)));
}
__name(fetchAllArbitrumStableYields, "fetchAllArbitrumStableYields");
function pickBestArbitrumStableIngress(snapshots, minDepthUsd = 1e5) {
  const eligible = snapshots.filter((s) => s.depthUsd >= minDepthUsd && s.baseApy > 0);
  if (eligible.length === 0) return null;
  return eligible.sort((a, b) => b.baseApy - a.baseApy)[0] ?? null;
}
__name(pickBestArbitrumStableIngress, "pickBestArbitrumStableIngress");

// src/adapters/raydium.ts
var RAYDIUM_API_URL = "https://api-v3.raydium.io";
var RAYDIUM_ALLOWED_HOSTS = ["api-v3.raydium.io"];
var SOL_MINT2 = "So11111111111111111111111111111111111111112";
var USDC_MINT2 = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
function refPx(symbol) {
  const key = symbol.toUpperCase();
  if (key.includes("BTC")) return 65e3;
  if (key.includes("ETH")) return 3500;
  return 150;
}
__name(refPx, "refPx");
async function fetchTopPool(symbol, opts) {
  const url = `${opts.apiUrl ?? RAYDIUM_API_URL}/pools/info/mint?mint1=${SOL_MINT2}&mint2=${USDC_MINT2}&poolType=all&poolSortField=liquidity&sortType=desc&pageSize=1`;
  const res = opts.fetchFn ? await opts.fetchFn(url) : await fetchAllowlisted(url, void 0, RAYDIUM_ALLOWED_HOSTS);
  if (!res.ok) throw new Error(`Raydium HTTP ${res.status}`);
  const body = await res.json();
  const pool = body.data?.data?.[0];
  if (!pool) throw new Error(`Raydium pool unavailable: ${symbol}`);
  return pool;
}
__name(fetchTopPool, "fetchTopPool");
var RaydiumAdapter = class {
  constructor(opts = {}) {
    this.opts = opts;
  }
  opts;
  static {
    __name(this, "RaydiumAdapter");
  }
  id = "raydium";
  async getDepth(symbol) {
    const pool = await fetchTopPool(symbol, this.opts);
    const spot = pool.price ?? refPx(symbol);
    const slip = pool.day?.volume && pool.tvl ? Math.min(pool.day.volume / pool.tvl, 0.02) : 1e-3;
    return {
      venue: "raydium",
      symbol: symbol.toUpperCase(),
      depthUsd: Math.max(pool.tvl ?? 0, 5e4),
      spotPrice: spot,
      perpPrice: spot * (1 + slip),
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async getAPY(symbol) {
    const pool = await fetchTopPool(symbol ?? "SOL", this.opts);
    const apr = pool.day?.apr ?? 0;
    return Math.min(Math.abs(apr) > 1 ? apr / 100 : apr, 2);
  }
  async checkHealth() {
    const t0 = performance.now();
    try {
      await fetchTopPool("SOL", this.opts);
      return { ok: true, latencyMs: performance.now() - t0, reasons: [] };
    } catch (err) {
      return {
        ok: false,
        latencyMs: performance.now() - t0,
        reasons: [err instanceof Error ? err.message : String(err)]
      };
    }
  }
};
var raydiumAdapter = new RaydiumAdapter();

// src/adapters/solana/solana-yield-ingress.ts
var SOLANA_STABLE_MINTS = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  PYUSD: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"
};
var DEFAULT_STABLE_BASE_APY = {
  USDC: 0.048,
  USDT: 0.042,
  PYUSD: 0.051
};
function normalizeApr2(raw) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.abs(raw) > 1 ? raw / 100 : raw;
}
__name(normalizeApr2, "normalizeApr");
async function fetchRaydiumStablePool(mint, opts) {
  const url = `${opts.apiUrl ?? RAYDIUM_API_URL}/pools/info/mint?mint1=${mint}&poolType=all&poolSortField=liquidity&sortType=desc&pageSize=1`;
  try {
    const res = opts.fetchFn ? await opts.fetchFn(url) : await fetchAllowlisted(url, void 0, RAYDIUM_ALLOWED_HOSTS);
    if (!res.ok) return null;
    const body = await res.json();
    return body.data?.data?.[0] ?? null;
  } catch {
    return null;
  }
}
__name(fetchRaydiumStablePool, "fetchRaydiumStablePool");
async function fetchSolanaStableYield(symbol, opts = {}) {
  const mint = SOLANA_STABLE_MINTS[symbol];
  const pool = await fetchRaydiumStablePool(mint, opts);
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (pool) {
    const baseApy = normalizeApr2(pool.day?.apr ?? 0) || DEFAULT_STABLE_BASE_APY[symbol];
    return {
      symbol,
      mint,
      baseApy,
      depthUsd: Math.max(pool.tvl ?? 0, 0),
      source: "raydium",
      fetchedAt
    };
  }
  return {
    symbol,
    mint,
    baseApy: DEFAULT_STABLE_BASE_APY[symbol],
    depthUsd: 5e5,
    source: "default",
    fetchedAt
  };
}
__name(fetchSolanaStableYield, "fetchSolanaStableYield");
async function fetchAllSolanaStableYields(opts = {}) {
  const symbols = ["USDC", "USDT", "PYUSD"];
  return Promise.all(symbols.map((s) => fetchSolanaStableYield(s, opts)));
}
__name(fetchAllSolanaStableYields, "fetchAllSolanaStableYields");
function pickBestStableIngress(snapshots, minDepthUsd = 1e5) {
  const eligible = snapshots.filter((s) => s.depthUsd >= minDepthUsd && s.baseApy > 0);
  if (eligible.length === 0) return null;
  return eligible.sort((a, b) => b.baseApy - a.baseApy)[0] ?? null;
}
__name(pickBestStableIngress, "pickBestStableIngress");

// src/services/yield-router.ts
function parseIngressChain(raw) {
  const value = (raw ?? "SOLANA").trim().toUpperCase();
  return value === "ARBITRUM" ? "ARBITRUM" : "SOLANA";
}
__name(parseIngressChain, "parseIngressChain");
function computeStackedTotalApy(chainBaseApy, hlFundingApy) {
  return chainBaseApy + hlFundingApy;
}
__name(computeStackedTotalApy, "computeStackedTotalApy");
async function resolveYieldStack(symbol, ingressChain = "SOLANA", hlAdapter = hyperliquidYieldAdapter) {
  const [hlFundingApy, hlLendApy] = await Promise.all([
    hlAdapter.getFundingApy(symbol),
    hlAdapter.getVaultApy(symbol)
  ]);
  if (ingressChain === "ARBITRUM") {
    const stables2 = await fetchAllArbitrumStableYields();
    const best2 = pickBestArbitrumStableIngress(stables2) ?? stables2[0];
    const chainBaseApy2 = best2.baseApy;
    return {
      ingressChain,
      stableSymbol: best2.symbol,
      chainBaseApy: chainBaseApy2,
      hlFundingApy,
      hlLendApy,
      totalStackedApy: computeStackedTotalApy(chainBaseApy2, hlFundingApy),
      stableDepthUsd: best2.depthUsd,
      yieldSource: best2.source
    };
  }
  const stables = await fetchAllSolanaStableYields();
  const best = pickBestStableIngress(stables) ?? stables[0];
  const chainBaseApy = best.baseApy;
  return {
    ingressChain: "SOLANA",
    stableSymbol: best.symbol,
    chainBaseApy,
    hlFundingApy,
    hlLendApy,
    totalStackedApy: computeStackedTotalApy(chainBaseApy, hlFundingApy),
    stableDepthUsd: best.depthUsd,
    yieldSource: best.source
  };
}
__name(resolveYieldStack, "resolveYieldStack");
function slippageGuardLight(ratio, warn, trip) {
  if (ratio >= trip) return "red";
  if (ratio >= warn) return "amber";
  return "green";
}
__name(slippageGuardLight, "slippageGuardLight");
function buildAdaptiveGuardLights(result) {
  const jup = result.venues.find((v) => v.venue === "jupiter");
  const hl = result.venues.find((v) => v.venue === "hyperliquid");
  const crossSlip = result.soil.crossVenueSlippage;
  const spotPerp = result.soil.spotPerpSlippage;
  let jupiter = "green";
  if (!jup?.health.ok) {
    jupiter = "red";
  } else if (crossSlip >= MAX_SLIPPAGE || result.soil.tripped) {
    jupiter = "red";
  } else if (crossSlip >= VINE_SOIL_MAX_SLIPPAGE) {
    jupiter = "amber";
  }
  let polymarket = slippageGuardLight(spotPerp, VINE_SOIL_MAX_SLIPPAGE, MAX_SLIPPAGE);
  if (!result.soil.ok) polymarket = "red";
  let hyperliquid = "green";
  if (!hl?.health.ok) {
    hyperliquid = "red";
  } else if (!result.soilOk) {
    hyperliquid = "amber";
  }
  return { hyperliquid, jupiter, polymarket };
}
__name(buildAdaptiveGuardLights, "buildAdaptiveGuardLights");
var DEFAULT_TRIANGLE_ADAPTERS = [
  hyperliquidYieldAdapter,
  jupiterAdapter,
  gmxAdapter
];
async function loadVenueSnapshot(adapter, symbol, medianApy2) {
  const [depth, apy, health] = await Promise.all([
    adapter.getDepth(symbol),
    adapter.getAPY(symbol),
    adapter.checkHealth()
  ]);
  const edgeBps = Math.round((apy - medianApy2) * 1e4);
  return { venue: adapter.id, depth, apy, edgeBps, health };
}
__name(loadVenueSnapshot, "loadVenueSnapshot");
function medianApy(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
__name(medianApy, "medianApy");
function buildYieldTriangleGateStatus(result) {
  const state = readActiveSystemState();
  const reasons = [...result.reasons];
  const intent2pcReady = result.soilOk && state.signingChannelOpen === true;
  if (!state.signingChannelOpen) {
    reasons.push("SIGNING_CHANNEL_CLOSED");
  }
  return {
    soilOk: result.soilOk,
    routable: result.routable && intent2pcReady,
    intent2pcReady,
    signingChannelOpen: state.signingChannelOpen === true,
    dynamicMaxSlUsd: state.dynamicMaxSL,
    phase: "IDLE",
    reasons
  };
}
__name(buildYieldTriangleGateStatus, "buildYieldTriangleGateStatus");
async function queryStructuralTriangle(symbol, adapters = DEFAULT_TRIANGLE_ADAPTERS) {
  const apyProbes = await Promise.all(
    adapters.map(async (adapter) => {
      try {
        return await adapter.getAPY(symbol);
      } catch {
        return 0;
      }
    })
  );
  const med = medianApy(apyProbes.filter((v) => v > 0));
  const venues = await Promise.all(
    adapters.map((adapter) => loadVenueSnapshot(adapter, symbol, med))
  );
  const hl = venues.find((v) => v.venue === "hyperliquid");
  const jup = venues.find((v) => v.venue === "jupiter");
  const gmx = venues.find((v) => v.venue === "gmx");
  const hlSpot = hl?.depth.spotPrice ?? jup?.depth.spotPrice ?? 0;
  const hlPerp = hl?.depth.perpPrice ?? hlSpot;
  const dydxPerp = gmx?.depth.perpPrice ?? jup?.depth.perpPrice ?? hlPerp;
  const compositeDepthUsd = venues.reduce((sum, v) => sum + v.depth.depthUsd, 0) / Math.max(venues.length, 1);
  const soil = checkSoilResistance({
    symbol: symbol.toUpperCase(),
    hlSpot,
    hlPerp,
    dydxPerp,
    depthUsd: compositeDepthUsd
  });
  const healthyVenues = venues.filter((v) => v.health.ok);
  const best = healthyVenues.sort((a, b) => b.apy - a.apy)[0] ?? null;
  const reasons = [...soil.reasons];
  for (const v of venues) {
    if (!v.health.ok) {
      reasons.push(`${v.venue}_UNHEALTHY:${v.health.reasons.join("|")}`);
    }
  }
  return {
    symbol: symbol.toUpperCase(),
    soil,
    soilOk: soil.ok,
    venues,
    compositeDepthUsd,
    bestApyVenue: best?.venue ?? null,
    routable: soil.ok && healthyVenues.length > 0,
    reasons
  };
}
__name(queryStructuralTriangle, "queryStructuralTriangle");
async function queryYieldTriangle(symbol, options = {}) {
  const ingressChain = options.ingressChain ?? "SOLANA";
  const adapters = options.adapters ?? DEFAULT_TRIANGLE_ADAPTERS;
  const hlAdapter = options.hlAdapter ?? hyperliquidYieldAdapter;
  const triangle = await queryStructuralTriangle(symbol, adapters);
  const gateStatus = buildYieldTriangleGateStatus(triangle);
  const yieldStack = await resolveYieldStack(symbol, ingressChain, hlAdapter);
  const best = triangle.venues.find((v) => v.venue === triangle.bestApyVenue);
  const fees = calculateYieldFees(yieldStack.totalStackedApy);
  const netApyBand = buildNetApyBand(fees.netApy);
  return {
    ...triangle,
    gateStatus,
    guardLights: buildAdaptiveGuardLights(triangle),
    targetVenue: "HYPERLIQUID",
    ingressChain,
    yieldStack,
    grossApy: fees.grossApy,
    netApy: fees.netApy,
    protocolTreasuryFee: fees.protocolTreasuryFee,
    netApyBand,
    recommendedRoute: {
      venue: "hyperliquid",
      apy: fees.netApy,
      edgeBps: Math.round((fees.netApy - (best?.apy ?? 0)) * 1e4)
    },
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(queryYieldTriangle, "queryYieldTriangle");

// src/api/routes/yield.ts
var SYMBOL_PATTERN = /^[A-Za-z0-9]{2,12}$/;
async function handleYieldTriangleRequest(request) {
  const url = new URL(request.url);
  const rawSymbol = url.searchParams.get("symbol") ?? "ETH";
  const symbol = rawSymbol.trim().toUpperCase();
  const ingressChain = parseIngressChain(url.searchParams.get("ingressChain"));
  if (!SYMBOL_PATTERN.test(symbol)) {
    return Response.json(
      { error: "INVALID_SYMBOL", symbol: rawSymbol },
      { status: 400 }
    );
  }
  try {
    const payload = await queryYieldTriangle(symbol, { ingressChain });
    return Response.json(payload, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=5"
      }
    });
  } catch (err) {
    return Response.json(
      {
        error: "YIELD_TRIANGLE_FAILED",
        symbol,
        message: err instanceof Error ? err.message : String(err)
      },
      { status: 502 }
    );
  }
}
__name(handleYieldTriangleRequest, "handleYieldTriangleRequest");

// src/api/middleware/og-preview.ts
var GRANT_AUDIT_VERSION_HEADER = "X-SilverVine-Version";
var GRANT_AUDIT_DEFENSE_HEADER = "X-Defense-Matrix";
var GRANT_AUDIT_VERSION = "v0.8-santenmoku";
var GRANT_AUDIT_DEFENSE_MATRIX = "20-Roots-Active";
var PUBLIC_AUDIT_ENDPOINTS = [
  "/api/telemetry/health",
  "/api/state",
  "/api/data",
  "/api/hedge/evaluate"
];
var DEFAULT_ORIGIN = "https://bedeltawater.slivervine.xyz";
var DEFAULT_OG_IMAGE = `${DEFAULT_ORIGIN}/og/grant-audit-card.png`;
var ENDPOINT_COPY = {
  "/api/telemetry/health": {
    title: "Be\u0394 Living Water \u2014 Live Telemetry",
    description: "Public CRI index, soil resistance status, active venues, and circuit breaker health."
  },
  "/api/state": {
    title: "Be\u0394 Living Water \u2014 System State",
    description: "Authoritative Risk Envelope system snapshot for grant auditor verification."
  },
  "/api/data": {
    title: "Be\u0394 Living Water \u2014 Matrix Data",
    description: "Cross-venue arbitrage matrix feed with risk tripped flags for auditor review."
  },
  "/api/hedge/evaluate": {
    title: "Be\u0394 Living Water \u2014 Tail Hedge Evaluation",
    description: "Polymarket tail-hedge trigger evaluation gated by unified Risk Envelope policy."
  }
};
function isPublicAuditEndpoint(pathname) {
  return PUBLIC_AUDIT_ENDPOINTS.includes(pathname);
}
__name(isPublicAuditEndpoint, "isPublicAuditEndpoint");
function generateOgPreviewMetadata(input) {
  const origin = input.origin ?? DEFAULT_ORIGIN;
  const pathname = isPublicAuditEndpoint(input.pathname) ? input.pathname : "/api/telemetry/health";
  const copy = ENDPOINT_COPY[pathname];
  const criSuffix = input.criIndex !== void 0 ? ` \xB7 CRI ${input.criIndex}` : "";
  const hudSuffix = input.hudState ? ` \xB7 HUD ${input.hudState}` : "";
  return {
    title: copy.title,
    description: `${copy.description}${criSuffix}${hudSuffix}`,
    url: `${origin}${pathname}`,
    type: "website",
    siteName: "SilverVine Protocol",
    image: DEFAULT_OG_IMAGE
  };
}
__name(generateOgPreviewMetadata, "generateOgPreviewMetadata");
function renderOgMetaTags(meta) {
  return [
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  ].join("\n");
}
__name(renderOgMetaTags, "renderOgMetaTags");
function buildOgPreviewDocument(meta) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(meta.title)}</title>
  ${renderOgMetaTags(meta)}
</head>
<body>
  <h1>${escapeHtml(meta.title)}</h1>
  <p>${escapeHtml(meta.description)}</p>
</body>
</html>`;
}
__name(buildOgPreviewDocument, "buildOgPreviewDocument");
function grantAuditHeaders(extra = {}) {
  return {
    ...extra,
    [GRANT_AUDIT_VERSION_HEADER]: GRANT_AUDIT_VERSION,
    [GRANT_AUDIT_DEFENSE_HEADER]: GRANT_AUDIT_DEFENSE_MATRIX
  };
}
__name(grantAuditHeaders, "grantAuditHeaders");
function publicApiHeaders(extra = {}) {
  return grantAuditHeaders({ ...CORS_JSON_HEADERS, ...extra });
}
__name(publicApiHeaders, "publicApiHeaders");
function applyGrantAuditHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set(GRANT_AUDIT_VERSION_HEADER, GRANT_AUDIT_VERSION);
  headers.set(GRANT_AUDIT_DEFENSE_HEADER, GRANT_AUDIT_DEFENSE_MATRIX);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
__name(applyGrantAuditHeaders, "applyGrantAuditHeaders");
function handleOgPreviewRequest(request) {
  const url = new URL(request.url);
  if (url.pathname !== "/api/og-preview" || request.method !== "GET") {
    return null;
  }
  const targetPath = url.searchParams.get("path") ?? "/api/telemetry/health";
  const criRaw = url.searchParams.get("cri");
  const criIndex = criRaw !== null ? Number(criRaw) : void 0;
  const hudState = url.searchParams.get("hud") ?? void 0;
  const meta = generateOgPreviewMetadata({
    pathname: targetPath,
    origin: url.origin,
    criIndex: Number.isFinite(criIndex) ? criIndex : void 0,
    hudState: hudState ?? void 0
  });
  return new Response(buildOgPreviewDocument(meta), {
    status: 200,
    headers: publicApiHeaders({ "Content-Type": "text/html; charset=utf-8" })
  });
}
__name(handleOgPreviewRequest, "handleOgPreviewRequest");
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
__name(escapeHtml, "escapeHtml");

// src/api/routes.ts
async function routeRequest(request, env, ctx) {
  try {
    const url = new URL(request.url);
    if (url.pathname === "/api/data" && request.method === "GET") {
      return applyGrantAuditHeaders(await handleDataRequest(env, ctx));
    }
    if (url.pathname === "/api/telemetry/health" && request.method === "GET") {
      return applyGrantAuditHeaders(handleTelemetryHealthRequest());
    }
    if (url.pathname === "/api/hud-stream" && request.method === "GET") {
      return applyGrantAuditHeaders(handleHudStreamRequest(request));
    }
    if (url.pathname === "/api/yield/triangle" && request.method === "GET") {
      return applyGrantAuditHeaders(await handleYieldTriangleRequest(request));
    }
    if ((url.pathname === "/" || url.pathname === "/index.html") && request.method === "GET") {
      return applyGrantAuditHeaders(await handlePageRequest(env, request));
    }
    const ogPreviewResponse = handleOgPreviewRequest(request);
    if (ogPreviewResponse) return ogPreviewResponse;
    const indexResponse = await handleIndexApiRequest(request, url);
    if (indexResponse) return applyGrantAuditHeaders(indexResponse);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Santenmoku-Canary, X-Xuanwu-Watermark"
        }
      });
    }
    return new Response("Not Found", { status: 404 });
  } catch (error) {
    if (error instanceof HardlockError) {
      return applyGrantAuditHeaders(hardlockResponse(error));
    }
    throw error;
  }
}
__name(routeRequest, "routeRequest");

// src/services/soak-telemetry.ts
var SOAK_TELEMETRY_KV_KEY = KV_KEYS.SOAK_TELEMETRY;
var SOAK_ROLLING_MAX_TICKS = 1440;
var SOAK_TELEMETRY_COINS = ["BTC", "ETH"];
var inMemoryRollingLog = {
  version: 1,
  lastUpdated: (/* @__PURE__ */ new Date(0)).toISOString(),
  tickCount: 0,
  ticks: []
};
function defaultSystemState() {
  return {
    ...buildSystemState({
      accountBalanceUsd: 1e4,
      currentCri: 100,
      skipHardlockAssert: true
    }),
    isHedgeActive: false
  };
}
__name(defaultSystemState, "defaultSystemState");
function createEmptySoakLog() {
  return {
    version: 1,
    lastUpdated: (/* @__PURE__ */ new Date(0)).toISOString(),
    tickCount: 0,
    ticks: []
  };
}
__name(createEmptySoakLog, "createEmptySoakLog");
function appendSoakTicks(log, ticks, maxTicks = SOAK_ROLLING_MAX_TICKS) {
  const merged = [...log.ticks, ...ticks];
  const trimmed = merged.length > maxTicks ? merged.slice(merged.length - maxTicks) : merged;
  return {
    version: 1,
    lastUpdated: ticks.at(-1)?.at ?? (/* @__PURE__ */ new Date()).toISOString(),
    tickCount: log.tickCount + ticks.length,
    ticks: trimmed
  };
}
__name(appendSoakTicks, "appendSoakTicks");
async function loadRollingLog(kv) {
  if (!kv) return inMemoryRollingLog;
  const raw = await kv.get(SOAK_TELEMETRY_KV_KEY);
  if (!raw) return createEmptySoakLog();
  try {
    return JSON.parse(raw);
  } catch {
    return createEmptySoakLog();
  }
}
__name(loadRollingLog, "loadRollingLog");
async function persistRollingLog(log, kv) {
  const result = await saveSoakTelemetryToKV(kv, log);
  if (!result.skipped) return;
  inMemoryRollingLog = log;
}
__name(persistRollingLog, "persistRollingLog");
async function evaluateSoakCoinTick(coin, state, options = {}) {
  const started = (options.now ?? Date.now)();
  const at = new Date(started).toISOString();
  try {
    const snapshot = await fetchLiveL2Book(coin, {
      fetchFn: options.fetchFn,
      maxRetries: options.fetchOptions?.maxRetries ?? 1,
      timeoutMs: options.fetchOptions?.timeoutMs
    });
    const metrics = computeLiveBookMetrics(snapshot.book);
    if (!metrics) {
      return {
        at,
        coin: coin.toUpperCase(),
        latencyMs: (options.now ?? Date.now)() - started,
        soilOk: false,
        soilReasons: ["EMPTY_L2_BOOK"],
        crossVenueSlippage: -1,
        spotPerpSlippage: -1,
        counterVerdict: "REJECT",
        counterArmed: false,
        imbalanceRatio: 0,
        liveSlippageBps: Number.POSITIVE_INFINITY,
        dynamicMaxSlUsd: state.dynamicMaxSL,
        error: "EMPTY_L2_BOOK"
      };
    }
    const liveProbe = {
      symbol: coin.toUpperCase(),
      bestBid: metrics.bestBid,
      bestAsk: metrics.bestAsk,
      midPx: metrics.midPx,
      bidDepthUsd: metrics.bidDepthUsd,
      askDepthUsd: metrics.askDepthUsd,
      spreadBps: metrics.spreadBps,
      priceImpactBps: metrics.priceImpactBps,
      depthUsd: metrics.depthUsd
    };
    const soilBase = checkSoilResistance(buildSoilInputFromLiveBook(liveProbe));
    const soilAudit = auditLiveBookSoilResistance(liveProbe);
    recordSpreadSample(metrics.spreadBps / 1e4);
    if (soilAudit.tripped) {
      recordSoilViolation(started);
    }
    const counter = evalCounterAttackOpportunity(
      buildCounterAttackInputFromMetrics(coin.toUpperCase(), metrics, state)
    );
    return {
      at,
      coin: coin.toUpperCase(),
      latencyMs: (options.now ?? Date.now)() - started,
      soilOk: soilBase.ok && soilAudit.ok,
      soilReasons: [.../* @__PURE__ */ new Set([...soilBase.reasons, ...soilAudit.reasons])],
      crossVenueSlippage: soilBase.crossVenueSlippage,
      spotPerpSlippage: soilBase.spotPerpSlippage,
      counterVerdict: counter.verdict,
      counterArmed: counter.armed,
      imbalanceRatio: counter.imbalanceRatio,
      liveSlippageBps: counter.liveSlippageBps,
      dynamicMaxSlUsd: counter.dynamicMaxSlUsd
    };
  } catch (err) {
    return {
      at,
      coin: coin.toUpperCase(),
      latencyMs: (options.now ?? Date.now)() - started,
      soilOk: false,
      soilReasons: ["TICK_EXCEPTION"],
      crossVenueSlippage: -1,
      spotPerpSlippage: -1,
      counterVerdict: "REJECT",
      counterArmed: false,
      imbalanceRatio: 0,
      liveSlippageBps: Number.POSITIVE_INFINITY,
      dynamicMaxSlUsd: state.dynamicMaxSL,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
__name(evaluateSoakCoinTick, "evaluateSoakCoinTick");
async function runSoakTelemetryTick(options = {}) {
  const state = options.systemState ?? defaultSystemState();
  const coins = options.coins ?? SOAK_TELEMETRY_COINS;
  const ticks = [];
  for (const coin of coins) {
    ticks.push(await evaluateSoakCoinTick(coin, state, options));
  }
  const current = await loadRollingLog(options.kv);
  const next = appendSoakTicks(current, ticks);
  await persistRollingLog(next, options.kv);
  console.log(
    JSON.stringify({
      level: "info",
      module: "soak-telemetry",
      event: "SOAK_TICK",
      tickCount: next.tickCount,
      bufferSize: next.ticks.length,
      lastUpdated: next.lastUpdated,
      coins: ticks.map((t) => ({
        coin: t.coin,
        soilOk: t.soilOk,
        counterVerdict: t.counterVerdict,
        latencyMs: t.latencyMs,
        error: t.error ?? null
      }))
    })
  );
  return next;
}
__name(runSoakTelemetryTick, "runSoakTelemetryTick");

// src/core/intent-persistence.ts
var INTENT_PERSISTENCE_PREFIX = "intent:2pc:";
var INTENT_INDEX_KEY = "intent:2pc:__index";
function intentKey(id) {
  return `${INTENT_PERSISTENCE_PREFIX}${id}`;
}
__name(intentKey, "intentKey");
function cloneIntent2(intent) {
  return {
    ...intent,
    legs: [...intent.legs],
    legResults: [...intent.legResults],
    flattenActions: [...intent.flattenActions]
  };
}
__name(cloneIntent2, "cloneIntent");
function serializeIntentRecord(intent) {
  const record = {
    version: 1,
    savedAt: (/* @__PURE__ */ new Date()).toISOString(),
    intent: cloneIntent2(intent)
  };
  return JSON.stringify(record);
}
__name(serializeIntentRecord, "serializeIntentRecord");
function deserializeIntentRecord(raw) {
  const parsed = JSON.parse(raw);
  if ("intent" in parsed && parsed.version === 1) {
    return cloneIntent2(parsed.intent);
  }
  return cloneIntent2(parsed);
}
__name(deserializeIntentRecord, "deserializeIntentRecord");
function createKvIntentPersistenceStore(kv) {
  return {
    get: /* @__PURE__ */ __name((key) => kv.get(key), "get"),
    put: /* @__PURE__ */ __name((key, value, options) => kv.put(key, value, options?.expirationTtl ? { expirationTtl: options.expirationTtl } : void 0), "put"),
    delete: /* @__PURE__ */ __name((key) => kv.delete(key), "delete"),
    listKeys: /* @__PURE__ */ __name(async (prefix) => {
      const listing = await kv.list({ prefix });
      return listing.keys.map((entry) => entry.name);
    }, "listKeys")
  };
}
__name(createKvIntentPersistenceStore, "createKvIntentPersistenceStore");
async function readIndex(store) {
  const raw = await store.get(INTENT_INDEX_KEY);
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}
__name(readIndex, "readIndex");
async function writeIndex(store, ids) {
  await store.put(INTENT_INDEX_KEY, JSON.stringify([...new Set(ids)]));
}
__name(writeIndex, "writeIndex");
function ttlSeconds(intent) {
  return Math.max(Math.ceil(intent.ttlMs / 1e3) + 86400, 86400);
}
__name(ttlSeconds, "ttlSeconds");
async function saveIntentSnapshot(intent, store) {
  const key = intentKey(intent.id);
  await store.put(key, serializeIntentRecord(intent), {
    expirationTtl: ttlSeconds(intent)
  });
  const index = await readIndex(store);
  if (!index.includes(intent.id)) {
    index.push(intent.id);
    await writeIndex(store, index);
  }
}
__name(saveIntentSnapshot, "saveIntentSnapshot");
async function loadIntentSnapshot(id, store) {
  const raw = await store.get(intentKey(id));
  if (!raw) return null;
  return deserializeIntentRecord(raw);
}
__name(loadIntentSnapshot, "loadIntentSnapshot");
async function loadAllIntentSnapshots(store) {
  const keys = await store.listKeys(INTENT_PERSISTENCE_PREFIX);
  const idsFromKeys = keys.filter((key) => key !== INTENT_INDEX_KEY).map((key) => key.slice(INTENT_PERSISTENCE_PREFIX.length));
  const index = await readIndex(store);
  const ids = [.../* @__PURE__ */ new Set([...index, ...idsFromKeys])];
  const intents = [];
  for (const id of ids) {
    const intent = await loadIntentSnapshot(id, store);
    if (intent) intents.push(intent);
  }
  return intents;
}
__name(loadAllIntentSnapshots, "loadAllIntentSnapshots");
async function restoreLedgerFromPersistence(store) {
  const snapshots = await loadAllIntentSnapshots(store);
  return snapshots.map((intent) => importCrossLegIntent(intent));
}
__name(restoreLedgerFromPersistence, "restoreLedgerFromPersistence");
function isPreparedExpired(intent, now) {
  if (intent.phase !== "PREPARED" || intent.preparedAt === void 0) return false;
  return now - intent.preparedAt > intent.ttlMs;
}
__name(isPreparedExpired, "isPreparedExpired");
async function emergencyUnwindPreparedIntent(intent, options = {}) {
  const now = options.now?.() ?? Date.now();
  const flattenLeg = options.flattenLeg ?? (async () => ({ ok: true }));
  if (!isPreparedExpired(intent, now)) {
    return {
      intent,
      result: {
        intentId: intent.id,
        ok: true,
        reason: "NOT_EXPIRED",
        flattenCount: 0
      }
    };
  }
  const preparedIndexes = new Set(
    intent.legResults.filter((r) => r.ok).map((r) => r.legIndex)
  );
  const updated = cloneIntent2(intent);
  updated.phase = "ABORTED";
  updated.abortedAt = now;
  updated.abortReason = "CRASH_RECOVERY_TTL_EXPIRED";
  updated.flattenActions = updated.legs.filter((_, index) => preparedIndexes.has(index)).map((leg) => buildFlattenAction(leg, "CRASH_RECOVERY_TTL_EXPIRED"));
  for (const action of updated.flattenActions) {
    await flattenLeg(action, updated);
  }
  const persisted = importCrossLegIntent(updated);
  return {
    intent: persisted,
    result: {
      intentId: persisted.id,
      ok: true,
      reason: "CRASH_RECOVERY_TTL_EXPIRED",
      flattenCount: persisted.flattenActions.length
    }
  };
}
__name(emergencyUnwindPreparedIntent, "emergencyUnwindPreparedIntent");
async function runCrashRecovery(store, options = {}) {
  const restored = await restoreLedgerFromPersistence(store);
  const now = options.now?.() ?? Date.now();
  const unwound = [];
  for (const intent of listAllIntents()) {
    if (intent.phase !== "PREPARED") continue;
    if (!isPreparedExpired(intent, now)) continue;
    const { intent: updated, result } = await emergencyUnwindPreparedIntent(intent, options);
    unwound.push(result);
    await saveIntentSnapshot(updated, store);
  }
  return {
    restoredCount: restored.length,
    unwound
  };
}
__name(runCrashRecovery, "runCrashRecovery");
async function bootstrapIntentPersistence(store, options = {}) {
  return runCrashRecovery(store, options);
}
__name(bootstrapIntentPersistence, "bootstrapIntentPersistence");
async function syncLedgerToPersistence(store) {
  const intents = listAllIntents();
  for (const intent of intents) {
    await saveIntentSnapshot(intent, store);
  }
  return intents.length;
}
__name(syncLedgerToPersistence, "syncLedgerToPersistence");

// src/services/telegram-notifier.ts
var TELEGRAM_API_BASE = "https://api.telegram.org";
function formatPanicAlertMessage(metrics) {
  const imbalancePct = (metrics.imbalanceRatio * 100).toFixed(2);
  const slippagePct = (metrics.liveSlippageBps / 100).toFixed(3);
  const lines = [
    "\u{1F6A8} Santenmoku Counter-Attack Alert",
    `Coin: ${metrics.coin}`,
    `Imbalance: ${imbalancePct}%`,
    `Live Slippage: ${slippagePct}%`,
    `Dynamic Max SL: $${metrics.dynamicMaxSlUsd.toFixed(2)}`
  ];
  if (metrics.verdict) {
    lines.push(`Verdict: ${metrics.verdict}`);
  }
  if (metrics.limitPx) {
    lines.push(`Passive Limit: ${metrics.limitPx}`);
  }
  return lines.join("\n");
}
__name(formatPanicAlertMessage, "formatPanicAlertMessage");
async function sendPanicAlert(metrics, options = {}) {
  const env = options.env ?? {};
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    return {
      sent: false,
      skipped: true,
      reason: "TELEGRAM_CREDENTIALS_MISSING"
    };
  }
  const message = formatPanicAlertMessage(metrics);
  const fetchFn = options.fetchFn ?? fetch;
  const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true
      })
    });
    if (!res.ok) {
      return {
        sent: false,
        skipped: false,
        reason: `TELEGRAM_HTTP_${res.status}`,
        message
      };
    }
    return { sent: true, skipped: false, message };
  } catch (err) {
    return {
      sent: false,
      skipped: false,
      reason: err instanceof Error ? err.message : String(err),
      message
    };
  }
}
__name(sendPanicAlert, "sendPanicAlert");

// src/adapters/jupiter/index.ts
var PGATE_MAX_SLIPPAGE_BPS2 = 15;
var SYSTEM_STATE_KV_KEY = KV_KEYS.SYSTEM_STATE;
var SYSTEM_STATE_R20_FLAG_KEY = KV_KEYS.SYSTEM_R20_LOCKED;
function parseJupiterQuote(wire, amountUsd) {
  return {
    ...wire,
    amountUsd,
    slippageBps: Number(wire.slippageBps ?? 0),
    priceImpactPct: wire.priceImpactPct ?? "0"
  };
}
__name(parseJupiterQuote, "parseJupiterQuote");
function combinedSlippageBps2(quote) {
  const priceImpactBps = Math.abs(Number(quote.priceImpactPct)) * 100;
  const quoteSlippageBps = quote.slippageBps;
  return {
    priceImpactBps,
    quoteSlippageBps,
    combinedSlippageBps: priceImpactBps + quoteSlippageBps
  };
}
__name(combinedSlippageBps2, "combinedSlippageBps");
function evaluateJupiterSoilResistance2(quote, maxSlippageBps = PGATE_MAX_SLIPPAGE_BPS2) {
  const { priceImpactBps, quoteSlippageBps, combinedSlippageBps: totalBps } = combinedSlippageBps2(quote);
  const reasons = [];
  if (totalBps > maxSlippageBps) {
    reasons.push(
      `JUPITER_COMBINED_SLIPPAGE=${totalBps.toFixed(2)}bps>${maxSlippageBps}bps`
    );
  }
  const slippageRatio = totalBps / 1e4;
  const basePx = 5e4;
  const soil = checkSoilResistance({
    symbol: "JUP_SWAP",
    hlSpot: basePx,
    hlPerp: basePx,
    dydxPerp: basePx * (1 + slippageRatio),
    depthUsd: Math.max(quote.amountUsd * 100, 5e5)
  });
  if (soil.tripped) {
    reasons.push(...soil.reasons);
  }
  const tripped = reasons.length > 0;
  return {
    ok: !tripped,
    tripped,
    reasons,
    combinedSlippageBps: totalBps,
    maxSlippageBps,
    priceImpactBps,
    quoteSlippageBps,
    soil
  };
}
__name(evaluateJupiterSoilResistance2, "evaluateJupiterSoilResistance");

// src/core/risk-engine.ts
function deny(reason, suggestedHttpCode) {
  return { isAllowed: false, reason, suggestedHttpCode };
}
__name(deny, "deny");
function evaluateRootProtection(intent, state) {
  try {
    vineWrapProtection({
      symbol: intent.symbol ?? intent.venue,
      estimatedLossUsd: intent.amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock
    });
    return null;
  } catch (err) {
    if (err instanceof HardlockError) {
      return deny(err.message, 403);
    }
    if (err instanceof RiskLimitExceeded) {
      return deny(err.message, 422);
    }
    throw err;
  }
}
__name(evaluateRootProtection, "evaluateRootProtection");
function evaluateFoolProofGate(intent, state) {
  const result = checkFoolProofGuard({
    order: {
      positionValueUsd: intent.amountUsd,
      leverage: intent.foolProof?.leverage,
      contractTarget: intent.foolProof?.contractTarget,
      profile: intent.foolProof?.profile,
      reduceOnly: intent.foolProof?.reduceOnly
    },
    accountBalanceUsd: state.accountBalanceUsd
  });
  if (!result.rejected) return null;
  return deny(
    `Fool-proof guard rejected \u2014 ${result.reasons.join("|")}`,
    422
  );
}
__name(evaluateFoolProofGate, "evaluateFoolProofGate");
function evaluateSoilGate(soil) {
  const result = checkSoilResistance(soil);
  if (!result.tripped) return null;
  return deny(
    `Soil resistance tripped \u2014 ${result.reasons.join("|")}`,
    422
  );
}
__name(evaluateSoilGate, "evaluateSoilGate");
function evaluatePolymarketGate(tailHedge) {
  const threshold = tailHedge.thresholdProb ?? DEFAULT_TAIL_HEDGE_THRESHOLD;
  if (evaluateTailHedgeTrigger(tailHedge.marketPrice, threshold)) {
    return null;
  }
  return deny(
    `Tail hedge trigger not met \u2014 marketPrice ${tailHedge.marketPrice} > threshold ${threshold}`,
    422
  );
}
__name(evaluatePolymarketGate, "evaluatePolymarketGate");
function evaluateJupiterGate(intent, jupiter) {
  const quote = parseJupiterQuote(jupiter.quote, intent.amountUsd);
  const evaluation = evaluateJupiterSoilResistance2(
    quote,
    jupiter.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS2
  );
  if (!evaluation.tripped) return null;
  return deny(evaluation.reasons.join("|"), 422);
}
__name(evaluateJupiterGate, "evaluateJupiterGate");
function evaluateGlobalRiskPolicy(intent) {
  const state = intent.systemState ?? readActiveSystemState();
  if (isR20Locked(state)) {
    return deny(`${R20_LOCKED} \u2014 signing channel severed`, 403);
  }
  const rootBlock = evaluateRootProtection(intent, state);
  if (rootBlock) return rootBlock;
  const foolProofBlock = evaluateFoolProofGate(intent, state);
  if (foolProofBlock) return foolProofBlock;
  if (intent.soil) {
    const soilBlock = evaluateSoilGate(intent.soil);
    if (soilBlock) return soilBlock;
  }
  if (intent.venue === "POLYMARKET" && intent.tailHedge) {
    const tailBlock = evaluatePolymarketGate(intent.tailHedge);
    if (tailBlock) return tailBlock;
  }
  if (intent.venue === "JUPITER" && intent.jupiter) {
    const jupiterBlock = evaluateJupiterGate(intent, intent.jupiter);
    if (jupiterBlock) return jupiterBlock;
  }
  return { isAllowed: true };
}
__name(evaluateGlobalRiskPolicy, "evaluateGlobalRiskPolicy");

// src/services/sandbox.ts
function resolveMockState(mockState) {
  const base = buildSystemState({
    accountBalanceUsd: mockState?.accountBalanceUsd,
    currentCri: mockState?.currentCri,
    skipHardlockAssert: true
  });
  const cri = mockState?.currentCri ?? base.currentCri;
  const hardlock = mockState?.hardlock ?? base.hardlock;
  return {
    ...base,
    ...mockState,
    dynamicMaxSL: mockState?.dynamicMaxSL ?? base.dynamicMaxSL,
    hudState: mockState?.hudState ?? base.hudState,
    signingChannelOpen: mockState?.signingChannelOpen ?? !(hardlock || cri <= 0)
  };
}
__name(resolveMockState, "resolveMockState");
function venueDryRunGate(venue) {
  switch (venue) {
    case "HL":
      return "HL_DRY_RUN";
    case "POLYMARKET":
      return "POLYMARKET_DRY_RUN";
    case "JUPITER":
      return "JUPITER_DRY_RUN";
  }
}
__name(venueDryRunGate, "venueDryRunGate");
function buildReport(args) {
  const isAllowed = !args.failedGate;
  return {
    isAllowed,
    venue: args.intent.venue,
    zeroKeyDryRun: true,
    passedGates: args.passedGates,
    failedGate: args.failedGate,
    reason: args.reason,
    suggestedHttpCode: args.suggestedHttpCode,
    simulatedExecutionTimeMs: Math.max(0, Date.now() - args.startedAt),
    executionPath: args.executionPath
  };
}
__name(buildReport, "buildReport");
function simulateTransactionIntent(intent, mockState) {
  const startedAt = Date.now();
  const passedGates = [];
  const executionPath = ["sandbox:start"];
  const state = resolveMockState(mockState);
  const enrichedIntent = { ...intent, systemState: state };
  executionPath.push(`venue:${intent.venue}`);
  executionPath.push("mode:zero-key-dry-run");
  if (isR20Locked(state)) {
    executionPath.push("gate:R20_LOCK:fail");
    return buildReport({
      intent,
      passedGates,
      failedGate: "R20_LOCK",
      reason: `${R20_LOCKED} \u2014 signing channel severed`,
      suggestedHttpCode: 403,
      startedAt,
      executionPath
    });
  }
  passedGates.push("R20_LOCK");
  executionPath.push("gate:R20_LOCK:pass");
  try {
    vineWrapProtection({
      symbol: intent.symbol ?? intent.venue,
      estimatedLossUsd: intent.amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock
    });
  } catch (err) {
    if (err instanceof HardlockError) {
      executionPath.push("gate:ROOT_PROTECTION:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "ROOT_PROTECTION",
        reason: err.message,
        suggestedHttpCode: 403,
        startedAt,
        executionPath
      });
    }
    if (err instanceof RiskLimitExceeded) {
      executionPath.push("gate:ROOT_PROTECTION:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "ROOT_PROTECTION",
        reason: err.message,
        suggestedHttpCode: 422,
        startedAt,
        executionPath
      });
    }
    throw err;
  }
  passedGates.push("ROOT_PROTECTION");
  executionPath.push("gate:ROOT_PROTECTION:pass");
  const foolProof = checkFoolProofGuard({
    order: {
      positionValueUsd: intent.amountUsd,
      leverage: intent.foolProof?.leverage,
      contractTarget: intent.foolProof?.contractTarget,
      profile: intent.foolProof?.profile,
      reduceOnly: intent.foolProof?.reduceOnly
    },
    accountBalanceUsd: state.accountBalanceUsd
  });
  if (foolProof.rejected) {
    executionPath.push("gate:FOOL_PROOF_GUARD:fail");
    return buildReport({
      intent,
      passedGates,
      failedGate: "FOOL_PROOF_GUARD",
      reason: `Fool-proof guard rejected \u2014 ${foolProof.reasons.join("|")}`,
      suggestedHttpCode: 422,
      startedAt,
      executionPath
    });
  }
  passedGates.push("FOOL_PROOF_GUARD");
  executionPath.push("gate:FOOL_PROOF_GUARD:pass");
  if (intent.soil) {
    const soil = checkSoilResistance(intent.soil);
    if (soil.tripped) {
      executionPath.push("gate:SOIL_RESISTANCE:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "SOIL_RESISTANCE",
        reason: `Soil resistance tripped \u2014 ${soil.reasons.join("|")}`,
        suggestedHttpCode: 422,
        startedAt,
        executionPath
      });
    }
    passedGates.push("SOIL_RESISTANCE");
    executionPath.push("gate:SOIL_RESISTANCE:pass");
  }
  if (intent.venue === "POLYMARKET" && intent.tailHedge) {
    const threshold = intent.tailHedge.thresholdProb ?? DEFAULT_TAIL_HEDGE_THRESHOLD;
    if (!evaluateTailHedgeTrigger(intent.tailHedge.marketPrice, threshold)) {
      executionPath.push("gate:POLYMARKET_TAIL_HEDGE:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "POLYMARKET_TAIL_HEDGE",
        reason: `Tail hedge trigger not met \u2014 marketPrice ${intent.tailHedge.marketPrice} > threshold ${threshold}`,
        suggestedHttpCode: 422,
        startedAt,
        executionPath
      });
    }
    passedGates.push("POLYMARKET_TAIL_HEDGE");
    executionPath.push("gate:POLYMARKET_TAIL_HEDGE:pass");
  }
  if (intent.venue === "JUPITER" && intent.jupiter) {
    const quote = parseJupiterQuote(intent.jupiter.quote, intent.amountUsd);
    const evaluation = evaluateJupiterSoilResistance2(
      quote,
      intent.jupiter.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS2
    );
    if (evaluation.tripped) {
      executionPath.push("gate:JUPITER_SLIPPAGE:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "JUPITER_SLIPPAGE",
        reason: evaluation.reasons.join("|"),
        suggestedHttpCode: 422,
        startedAt,
        executionPath
      });
    }
    passedGates.push("JUPITER_SLIPPAGE");
    executionPath.push("gate:JUPITER_SLIPPAGE:pass");
  }
  const dryRunGate = venueDryRunGate(intent.venue);
  passedGates.push(dryRunGate);
  executionPath.push(`gate:${dryRunGate}:pass`);
  executionPath.push("sandbox:complete");
  const policy = evaluateGlobalRiskPolicy(enrichedIntent);
  if (!policy.isAllowed) {
    return buildReport({
      intent,
      passedGates: passedGates.slice(0, -1),
      failedGate: dryRunGate,
      reason: policy.reason,
      suggestedHttpCode: policy.suggestedHttpCode,
      startedAt,
      executionPath: [...executionPath.slice(0, -1), `gate:${dryRunGate}:fail`]
    });
  }
  return buildReport({
    intent,
    passedGates,
    startedAt,
    executionPath
  });
}
__name(simulateTransactionIntent, "simulateTransactionIntent");

// src/index.ts
async function runScheduledSoakTelemetry(env) {
  await runSoakTelemetryTick({ kv: env.SLIVERVINE_KV });
}
__name(runScheduledSoakTelemetry, "runScheduledSoakTelemetry");
var intentPersistenceBootPromise = null;
async function ensureIntentPersistenceBoot(env) {
  const kv = env.SLIVERVINE_KV ?? env.SYSTEM_STATE_KV;
  if (!kv) return;
  if (!intentPersistenceBootPromise) {
    intentPersistenceBootPromise = (async () => {
      const store = createKvIntentPersistenceStore(kv);
      const result = await bootstrapIntentPersistence(store);
      console.log(
        "[bedelta] intent persistence boot",
        JSON.stringify({
          restoredCount: result.restoredCount,
          unwound: result.unwound.length
        })
      );
    })().catch((err) => {
      intentPersistenceBootPromise = null;
      console.error("[bedelta] intent persistence boot failed", err);
      throw err;
    });
  }
  await intentPersistenceBootPromise;
}
__name(ensureIntentPersistenceBoot, "ensureIntentPersistenceBoot");
async function runScheduledJobs(env) {
  await ensureIntentPersistenceBoot(env);
  await runScheduledSoakTelemetry(env);
  const kv = env.SLIVERVINE_KV ?? env.SYSTEM_STATE_KV;
  if (kv) {
    await syncLedgerToPersistence(createKvIntentPersistenceStore(kv));
  }
}
__name(runScheduledJobs, "runScheduledJobs");
console.log("[bedelta-living-water] worker boot");
var GEO_BLOCKED_COUNTRIES = /* @__PURE__ */ new Set(["US", "CU", "IR", "KP", "SY"]);
function enforceGeoCompliance(request) {
  const country = request.cf?.country;
  if (typeof country !== "string" || !GEO_BLOCKED_COUNTRIES.has(country)) {
    return null;
  }
  severSigningChannel();
  return new Response(
    "[SILVERVINE DEFENSE] Access Denied by Geo-Compliance Circuit Breaker",
    {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=UTF-8" }
    }
  );
}
__name(enforceGeoCompliance, "enforceGeoCompliance");
var index_default = {
  async fetch(request, env, ctx) {
    ctx.waitUntil(
      ensureIntentPersistenceBoot(env).catch((err) => {
        console.error("[bedelta] fetch persistence boot failed", err);
      })
    );
    const geoResponse = enforceGeoCompliance(request);
    if (geoResponse) return geoResponse;
    return routeRequest(request, env, ctx);
  },
  async scheduled(controller, env, ctx) {
    console.log("[bedelta-living-water] cron fired", controller.cron);
    ctx.waitUntil(
      runScheduledJobs(env).catch((err) => {
        console.error("[bedelta-living-water] scheduled cron failed", err);
      })
    );
  }
};
export {
  TELEMETRY_VENUES,
  abortIntent,
  assertFoolProofGuard,
  assertSessionKeyExecutionGates,
  assertVineShield,
  auditThreeEyeAdapters,
  checkCircuitRecovery,
  checkFoolProofGuard,
  checkFoolProofOrder,
  checkSoilResistanceWithFoolProofGuard,
  checkSoilResistanceWithVine,
  checkVineShield,
  commitIntent,
  createCrossLegIntent,
  index_default as default,
  evaluateGlobalRiskPolicy,
  evaluateSantenmokuHub,
  fetchHyperliquidMaps,
  fetchJupiterQuote,
  fetchPolymarketOrderbook,
  getIntent,
  prepareIntent,
  readCounterAttackTelemetryStatus,
  recordSoilViolation,
  runVineShieldSoilGate,
  sendPanicAlert,
  severSigningChannel,
  signAndExecuteOrder,
  simulateTransactionIntent,
  vineMeshAutoRecovery,
  vineWrapProtection
};
//# sourceMappingURL=index.js.map
