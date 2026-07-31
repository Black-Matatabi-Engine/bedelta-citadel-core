var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/services/config.ts
var APP_VERSION = "v1.0.0 \u2014 santenbokui \u8518\u5929\u6728";
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
var PRODUCT = "\u8518\u5929\u6728";
function humanizeSystemLog(raw) {
  const line = String(raw ?? "").trim();
  if (!line) return "";
  const upper = line.toUpperCase();
  if (/CROSS_VENUE_SLIPPAGE|SPOT_PERP_SLIPPAGE|SOIL_RESISTANCE_TRIP|SPREAD_TOO_HIGH|價差過大/.test(
    upper
  ) || /SOIL RESISTANCE CIRCUIT BREAKER TRIPPED/i.test(line)) {
    return `[\u98A8\u63A7\u63D0\u793A] \u5075\u6E2C\u5230\u77AC\u9593\u50F9\u5DEE\u904E\u5927\uFF0C${PRODUCT}\u9632\u79A6\u77E9\u9663\u5DF2\u81EA\u52D5\u70BA\u60A8\u963B\u65B7\u958B\u5009`;
  }
  if (/CRI.?HARDLOCK|HARDLOCK|簽名通道已切斷|PHYSICAL DEADLOCK/i.test(upper) || /CRI_HARDLOCK/i.test(line)) {
    return `[\u98A8\u63A7\u6B7B\u9396] ${PRODUCT}\u89F8\u767C\u7269\u7406\u6B7B\u9396\uFF0CCRI \u6B78\u96F6\uFF0CHot Key \u7C3D\u540D\u901A\u9053\u5DF2\u5207\u65B7`;
  }
  if (/ROOT_PROTECTION_TRIP|MAX.?SL|RISKLIMITEXCEEDED/i.test(line)) {
    return `[\u98A8\u63A7\u63D0\u793A] \u9810\u4F30\u8667\u640D\u903C\u8FD1\u6839\u7CFB\u6B62\u640D\u4E0A\u9650\uFF08Dynamic Max SL\uFF09\uFF0C${PRODUCT}\u5DF2\u9396\u6B7B\u672C\u7B46\u958B\u5009\u4EE5\u9632\u7206\u5009`;
  }
  if (/DEPTH_USD|MINDEPTH|流動性不足/i.test(line)) {
    return `[\u98A8\u63A7\u63D0\u793A] \u76E4\u53E3\u6DF1\u5EA6\u4E0D\u8DB3\uFF0C${PRODUCT}\u571F\u58E4\u963B\u6297\u9632\u7DDA\u5DF2\u62D2\u7D55\u9032\u5834`;
  }
  if (/RPC_NODE_NOT_ALLOWLISTED|NOT ON ALLOWLIST/i.test(line)) {
    return `[\u98A8\u63A7\u63D0\u793A] \u5075\u6E2C\u5230\u672A\u6388\u6B0A\u7684 RPC \u7BC0\u9EDE\u8ACB\u6C42\uFF0C${PRODUCT}\u5DF2\u6514\u622A\uFF08\u50C5\u5141\u8A31\u767D\u540D\u55AE\u7BC0\u9EDE\uFF09`;
  }
  if (/PIN LOCK|PINNED.*MAX|FOMO|置頂.*上限|風控死鎖/i.test(line)) {
    return `[\u98A8\u63A7\u6B7B\u9396] \u70BA\u4E86\u9632\u6B62\u60C5\u7DD2 FOMO\uFF0C\u7F6E\u9802\u6838\u5FC3\u76E3\u63A7\u6A19\u7684\u7269\u7406\u4E0A\u9650\u70BA 3 \u500B\u3002`;
  }
  if (/ALLMIDS.*FAILED|HL META.*FAILED|NETWORK ERROR|FETCH FAILED/i.test(line)) {
    return `[\u7CFB\u7D71\u63D0\u793A] \u884C\u60C5\u7BC0\u9EDE\u66AB\u6642\u7E41\u5FD9\uFF0C${PRODUCT}\u6B63\u5728\u91CD\u8A66\u540C\u6B65\uFF0C\u8ACB\u7A0D\u5019\u518D FORCE REFRESH`;
  }
  if (/SQL(STATE|EXCEPTION|ERROR)|SQLITE|POSTGRES|MYSQL|PRAGMA/i.test(line)) {
    return `[\u7CFB\u7D71\u63D0\u793A] \u5167\u90E8\u8CC7\u6599\u6821\u9A57\u672A\u901A\u904E\uFF0C${PRODUCT}\u5DF2\u5B89\u5168\u964D\u7D1A\uFF0C\u4E0D\u5F71\u97FF\u60A8\u7684\u700F\u89BD`;
  }
  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|HTTP\s*[45]\d\d|STATUS\s*[45]\d\d/i.test(line)) {
    return `[\u7CFB\u7D71\u63D0\u793A] \u5916\u90E8\u884C\u60C5\u901A\u9053\u77ED\u66AB\u4E2D\u65B7\uFF0C${PRODUCT}\u9632\u79A6\u77E9\u9663\u7DAD\u6301\u5F85\u6A5F\uFF0C\u7A0D\u5F8C\u81EA\u52D5\u6062\u5FA9`;
  }
  if (/STACK TRACE|AT\s+\S+\.(TS|JS):\d+|TYPEERROR:|REFERENCEERROR:/i.test(line)) {
    return `[\u7CFB\u7D71\u63D0\u793A] \u5F15\u64CE\u5167\u90E8\u81EA\u6AA2\u89F8\u767C\u4FDD\u8B77\uFF0C${PRODUCT}\u5DF2\u9694\u96E2\u7570\u5E38\u4E26\u7E7C\u7E8C\u670D\u52D9`;
  }
  if (line.startsWith("[\u98A8\u63A7") || line.startsWith("[\u7CFB\u7D71") || line.startsWith("[TRADFI]") || line.startsWith("[allMids]") || line.startsWith("[HL") || line.startsWith("[API]") || line.startsWith("[BUNDLE]") || line.startsWith("[PIPELINE]") || line.startsWith("[SYSTEM]")) {
    return line;
  }
  if (/[{}\[\]]/.test(line) && /error|exception|failed/i.test(line)) {
    return `[\u7CFB\u7D71\u63D0\u793A] \u540C\u6B65\u904E\u7A0B\u51FA\u73FE\u6CE2\u52D5\uFF0C${PRODUCT}\u5DF2\u5B8C\u6210\u81EA\u7652\uFF0C\u8ACB\u67E5\u770B\u9762\u677F\u6700\u65B0\u5831\u50F9`;
  }
  return line;
}
__name(humanizeSystemLog, "humanizeSystemLog");
function humanizeSystemLogs(lines) {
  return lines.map(humanizeSystemLog).filter(Boolean);
}
__name(humanizeSystemLogs, "humanizeSystemLogs");

// src/services/humanize-log.ts
var HARDLOCK_HUMAN = "[\u98A8\u63A7\u6B7B\u9396] \u8518\u5929\u6728\u89F8\u767C\u7269\u7406\u6B7B\u9396\uFF0CCRI \u6B78\u96F6\uFF0CHot Key \u7C3D\u540D\u901A\u9053\u5DF2\u5207\u65B7";
function humanizeHardlockMessage(raw) {
  const line = String(raw ?? "").trim();
  if (/CRI.?HARDLOCK|HARDLOCK|CRI.*0|簽名通道/i.test(line)) {
    return HARDLOCK_HUMAN;
  }
  return humanizeSystemLog(line) || HARDLOCK_HUMAN;
}
__name(humanizeHardlockMessage, "humanizeHardlockMessage");

// src/config/constants.ts
var TAIJI_YANG_CRI_MIN = 75;
var HEALTH_CRI_MAX = 100;
var HEALTH_CRI_MIN = 0;
var HEALTH_CRI_TIER_1_PENALTY = 5;
var HEALTH_CRI_TIER_2_PENALTY = 12;
var HEALTH_CRI_TIER_3_PENALTY = 25;
var CRI_MAX = HEALTH_CRI_MAX;
var CRI_MIN = HEALTH_CRI_MIN;
var ROOT_DEFENSE_SCORE_MAX = 100;
var ROOT_DEFENSE_SCORE_MIN = 0;
var ROOT_DEFENSE_TIER_1_ROOTS = [1, 2, 3, 4, 5];
var ROOT_DEFENSE_TIER_2_ROOTS = [6, 7, 8, 9, 10];
var ROOT_DEFENSE_TIER_3_ROOTS = [11, 12, 13, 14, 15];
var ROOT_DEFENSE_TIER_4_ROOTS = [16, 17, 18, 19, 20];
var ROOT_DEFENSE_TIER_1_PENALTY = 5;
var ROOT_DEFENSE_TIER_2_PENALTY = 12;
var ROOT_DEFENSE_TIER_3_PENALTY = 25;
var ROOT_DEFENSE_OPTIMAL_MIN = 80;
var ROOT_DEFENSE_ELEVATED_MIN = 50;
var TOXICITY_ELEVATED_THRESHOLD = 40;
var TOXIC_MODE_THRESHOLD = 75;
var TOXIC_MODE_COOLDOWN_MS = 6e4;
var RISK_INDEX_TIER_DEFINITIONS = [
  { id: "TIER1", roots: [1, 2, 3, 4, 5, 6], weight: 0.2 },
  { id: "TIER2", roots: [7, 8, 9, 10, 11, 12], weight: 0.25 },
  { id: "TIER3", roots: [13, 14, 15, 16, 17, 18], weight: 0.35 },
  { id: "TIER4", roots: [19, 20], weight: 0.2 }
];
var CRI_TIER_DEFINITIONS = RISK_INDEX_TIER_DEFINITIONS;

// src/services/effective-max-sl.ts
var DYNAMIC_MAX_SL_BASE_USD = 100;
var DYNAMIC_MAX_SL_BALANCE_RATE = 0.01;
var DEFAULT_ACCOUNT_EQUITY_USD = 1e4;
var MAX_DAILY_SL_COUNT = 3;
var DAILY_LOSS_CAP_MULTIPLIER = 3;
function computeEffectiveMaxSlUsd(accountEquityUsd) {
  const equity = Number.isFinite(accountEquityUsd) ? Math.max(0, accountEquityUsd) : 0;
  return equity * DYNAMIC_MAX_SL_BALANCE_RATE + DYNAMIC_MAX_SL_BASE_USD;
}
__name(computeEffectiveMaxSlUsd, "computeEffectiveMaxSlUsd");
function computeDailyLossCapUsd(accountEquityUsd) {
  return computeEffectiveMaxSlUsd(accountEquityUsd) * DAILY_LOSS_CAP_MULTIPLIER;
}
__name(computeDailyLossCapUsd, "computeDailyLossCapUsd");
function sanitizeAccountEquityUsd(raw) {
  const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? "").replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_ACCOUNT_EQUITY_USD;
  return n;
}
__name(sanitizeAccountEquityUsd, "sanitizeAccountEquityUsd");
function dynamicMaxSlPct(orderSizeUsd, accountEquityUsd = DEFAULT_ACCOUNT_EQUITY_USD) {
  const maxSl = computeEffectiveMaxSlUsd(accountEquityUsd);
  const size = Math.max(Number(orderSizeUsd) || 0, Number.EPSILON);
  return maxSl / size * 100;
}
__name(dynamicMaxSlPct, "dynamicMaxSlPct");
function formatDynSlLockTag(orderSizeUsd, accountEquityUsd = DEFAULT_ACCOUNT_EQUITY_USD) {
  const maxSl = computeEffectiveMaxSlUsd(accountEquityUsd);
  const pct = dynamicMaxSlPct(orderSizeUsd, accountEquityUsd);
  return `[ DYN-SL LOCKED: ${pct.toFixed(2)}% ($${maxSl.toFixed(0)} MAX LOSS) ]`;
}
__name(formatDynSlLockTag, "formatDynSlLockTag");

// src/services/risk-control.ts
var calculateDynamicMaxSL = computeEffectiveMaxSlUsd;
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
  const maxLossLimit = input.maxLossLimit ?? calculateDynamicMaxSL(accountBalanceUsd);
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
var rootProtection = vineWrapProtection;
function estimateEntryLossUsd(capitalUsd, frictionRate, fixedCostUsd) {
  return capitalUsd * frictionRate + fixedCostUsd;
}
__name(estimateEntryLossUsd, "estimateEntryLossUsd");

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
    maxLossLimit: calculateDynamicMaxSL(input.accountBalanceUsd),
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
    tooltip: "Kan Gate (Delta-Neutral Sink): Low CRI (<=25). Funds routed to delta-neutral hedge.",
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
    label: "\u262F TAIJI \xB7 YANG STRIKE",
    tooltip: `Yang offensive engine \u2014 CRI \u2265 ${TAIJI_YANG_CRI_MIN}, soil clear, signing channel open.`,
    cssClass: "taiji-mode-yang"
  },
  YIN_YIELD: {
    label: "\u262F TAIJI \xB7 YIN YIELD",
    tooltip: "Yin yield engine \u2014 capital rotated to vault lend / delta-neutral sleeves.",
    cssClass: "taiji-mode-yin"
  }
};
function resolveTaijiMode(state, ctx = {}) {
  const soilOk = ctx.soilTripped !== true;
  if (!state.hardlock && !state.isStale && state.currentCri >= TAIJI_YANG_CRI_MIN && soilOk) {
    return "YANG_STRIKE";
  }
  return "YIN_YIELD";
}
__name(resolveTaijiMode, "resolveTaijiMode");
function resolveActiveGate(state, ctx = {}) {
  if (state.hardlock || state.currentCri <= 0) return "DUI_DEATH";
  if (state.isStale || state.signingChannelOpen === false) return "XUN_BLOCK";
  if (ctx.soilTripped === true) return "ZHEN_HARM";
  if (ctx.isHedgeActive === true) return "GEN_LIFE";
  if (state.currentCri >= TAIJI_YANG_CRI_MIN) return "QIAN_OPEN";
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
function recomputeDynamicMaxSL(accountBalanceUsd) {
  return calculateDynamicMaxSL(accountBalanceUsd);
}
__name(recomputeDynamicMaxSL, "recomputeDynamicMaxSL");
function resolveHudState(currentCri, hardlock, synced = true) {
  if (hardlock || currentCri <= CRI_MIN) return "BLOCKED";
  if (!synced) return "IDLE";
  if (currentCri <= 25) return "SANTENMOKU";
  if (currentCri <= 50) return "AMBER";
  if (currentCri <= 85) return "GREEN";
  return "GREEN";
}
__name(resolveHudState, "resolveHudState");
function deriveCriFromRiskSignals(signals) {
  let cri = CRI_MAX;
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
  const currentCri = input.currentCri ?? CRI_MAX;
  const dynamicMaxSL = recomputeDynamicMaxSL(accountBalanceUsd);
  const hardlock = currentCri <= CRI_MIN;
  const hudState = resolveHudState(currentCri, hardlock, true);
  if (!input.skipHardlockAssert && hardlock) {
    assertCriHardlock({
      symbol: input.symbol ?? "SYSTEM",
      cri: CRI_MIN,
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
    currentCri: CRI_MIN,
    dynamicMaxSL: recomputeDynamicMaxSL(accountBalanceUsd),
    hudState: "BLOCKED",
    hardlock: true,
    signingChannelOpen: false,
    isSandboxMode: false,
    isStale: false
  });
}
__name(buildBlockedSystemState, "buildBlockedSystemState");
function serializeSystemStateForClient(state) {
  return { ...state };
}
__name(serializeSystemStateForClient, "serializeSystemStateForClient");

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
  SYSTEM_STATE: 300,
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
async function saveSystemStateToKV(kv, stateData, ttlSeconds = KV_TTL_SECONDS.SYSTEM_STATE) {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.SYSTEM_STATE, skipped: true };
  }
  let payload = stateData;
  if (isSystemStateLike(stateData)) {
    const existing = await readSystemStateFromKV(binding);
    if (existing && isSystemStateLike(existing.state)) {
      payload = mergeSystemStateRecords(existing.state, stateData);
    }
  }
  const record = {
    version: 1,
    savedAt: (/* @__PURE__ */ new Date()).toISOString(),
    state: payload
  };
  await binding.put(KV_KEYS.SYSTEM_STATE, JSON.stringify(record), {
    expirationTtl: ttlSeconds
  });
  return { ok: true, key: KV_KEYS.SYSTEM_STATE, skipped: false };
}
__name(saveSystemStateToKV, "saveSystemStateToKV");
async function saveMatrixPayloadToKV(kv, payload, ttlSeconds = KV_TTL_SECONDS.MATRIX) {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.MATRIX_LATEST, skipped: true };
  }
  await binding.put(
    KV_KEYS.MATRIX_LATEST,
    JSON.stringify({
      version: 1,
      savedAt: (/* @__PURE__ */ new Date()).toISOString(),
      payload
    }),
    { expirationTtl: ttlSeconds }
  );
  return { ok: true, key: KV_KEYS.MATRIX_LATEST, skipped: false };
}
__name(saveMatrixPayloadToKV, "saveMatrixPayloadToKV");
async function saveMarketSnapshotToKV(kv, snapshot, ttlSeconds = KV_TTL_SECONDS.MARKET) {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.MARKET_SNAPSHOT, skipped: true };
  }
  await binding.put(KV_KEYS.MARKET_SNAPSHOT, JSON.stringify(snapshot), {
    expirationTtl: ttlSeconds
  });
  return { ok: true, key: KV_KEYS.MARKET_SNAPSHOT, skipped: false };
}
__name(saveMarketSnapshotToKV, "saveMarketSnapshotToKV");
async function saveSoakTelemetryToKV(kv, log, ttlSeconds = KV_TTL_SECONDS.SOAK) {
  const binding = resolveKv(kv);
  if (!binding) {
    return { ok: false, key: KV_KEYS.SOAK_TELEMETRY, skipped: true };
  }
  await binding.put(KV_KEYS.SOAK_TELEMETRY, JSON.stringify(log), {
    expirationTtl: ttlSeconds
  });
  return { ok: true, key: KV_KEYS.SOAK_TELEMETRY, skipped: false };
}
__name(saveSoakTelemetryToKV, "saveSoakTelemetryToKV");
async function readSystemStateFromKV(kv) {
  const binding = resolveKv(kv);
  if (!binding) return null;
  const raw = await binding.get(KV_KEYS.SYSTEM_STATE);
  if (!raw) return null;
  try {
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
var HL_INFO_URL = "https://api.hyperliquid.xyz/info";
var HL_TESTNET_INFO_URL = "https://api.hyperliquid-testnet.xyz/info";
var HL_EXCHANGE_URL = "https://api.hyperliquid.xyz/exchange";
var UA_HEADERS2 = { "User-Agent": "Mozilla/5.0" };
var HL_L2_FETCH_TIMEOUT_MS = 8e3;
var HL_L2_MAX_RETRIES = 2;
var HL_L2_PROBE_USD = 1e4;
var HL_L2_CACHE_TTL_MS = 5e3;
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
    return "\u3010 \u89C0\u671B\u5176\u8B8A / HOLD \u3011";
  }
  if (hlFunding > 0) {
    return "\u3010 \u{1F4C8}\u8CB7 HL \u73FE + \u{1F4C9}\u7A7A HL \u5408 \u3011";
  }
  if (hlFunding < 0) {
    return "\u3010 \u{1F4C9}\u7A7A HL \u73FE + \u{1F4C8}\u591A HL \u5408 \u3011";
  }
  return "\u3010 \u89C0\u671B\u5176\u8B8A / HOLD \u3011";
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
  const maxLossLimit = calculateDynamicMaxSL(RISK_EVAL_CAPITAL_USD);
  let rootTripped = false;
  let rootReason;
  try {
    rootProtection({
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
    j1_strategy: actionStatus === "SPREAD_TOO_HIGH" ? "\u3010\u26A0\uFE0F \u50F9\u5DEE\u904E\u5927\u62D2\u7D55\u958B\u5009\u3011" : "\u3010 \u89C0\u671B\u5176\u8B8A / HOLD \xB7 \u98A8\u63A7\u7194\u65B7 \u3011",
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
  const maxLossLimit = calculateDynamicMaxSL(accountBalanceUsd);
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
      "\u3010 Rule B \u5996\u5E63\u84C4\u6C34\u6C60 / HIGH RATE \u3011",
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
      j1_strategy: "\u3010 Rule B \u5996\u5E63\u84C4\u6C34\u6C60 \u3011",
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
    const friendly = humanizeSystemLogs([message])[0] ?? "[\u7CFB\u7D71\u63D0\u793A] \u8518\u5929\u6728\u66AB\u6642\u7121\u6CD5\u5B8C\u6210\u540C\u6B65\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66";
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
var DefenseMatrixError = class extends Error {
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
    throw new DefenseMatrixError(
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
    throw new DefenseMatrixError(
      "SIGNING_CHANNEL_CLOSED",
      "Jupiter adapter blocked \u2014 signing channel closed",
      [`signingChannelOpen=false`],
      403
    );
  }
  try {
    rootProtection({
      symbol: "JUP_SWAP",
      estimatedLossUsd: amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock
    });
  } catch (err) {
    if (err instanceof HardlockError) {
      throw new DefenseMatrixError(
        R20_LOCKED,
        err.message,
        [err.message],
        403
      );
    }
    if (err instanceof RiskLimitExceeded) {
      throw new DefenseMatrixError(
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
    throw new DefenseMatrixError(
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
    throw new DefenseMatrixError2(
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
    throw new DefenseMatrixError2(
      R20_LOCKED,
      "Polymarket adapter blocked \u2014 signing channel closed",
      [`signingChannelOpen=false`],
      403
    );
  }
  try {
    rootProtection({
      symbol: "POLY_HEDGE",
      estimatedLossUsd: amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock
    });
  } catch (err) {
    if (err instanceof HardlockError) {
      throw new DefenseMatrixError2(R20_LOCKED, err.message, [err.message], 403);
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
    throw new DefenseMatrixError2(
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
    rootProtection({
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

// src/services/session-key-adapter.ts
var HL_L1_CHAIN_ID = 1337;
var HL_SESSION_KEY_AGENT_NAME = "SantenmokuSessionKey";
var DefenseMatrixError3 = class extends Error {
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
    throw new DefenseMatrixError3(
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
  throw new DefenseMatrixError3(
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
function buildConnectionId(payload, nonce) {
  const seed = `${payload.asset}:${payload.limitPx}:${payload.sz}:${nonce}`;
  return `0x${seed.padEnd(64, "0").slice(0, 64)}`;
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
    const connectionId = buildConnectionId(payload, nonce);
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
    if (err instanceof DefenseMatrixError3) {
      throw err;
    }
    severSigningChannel();
    throw new DefenseMatrixError3(
      "SESSION_KEY_HARDLOCK_INTERCEPTED",
      err instanceof Error ? err.message : String(err),
      [],
      403
    );
  }
}
__name(signAndExecuteOrder, "signAndExecuteOrder");

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

// src/ui/brand-assets.ts
var BRAND_LOGO_DATA_URI = "data:image/png;base64,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";
var BRAND_BANNER_DATA_URI = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAFSBAADASIAAhEBAxEB/8QAHQAAAgIDAQEBAAAAAAAAAAAABgcEBQADCAIBCf/EAFkQAAEDAgQEBAMFBAYGCAIFDQECAwQFEQAGEiEHEzFBFCJRYTJxgQgVI0KRM1JioRYkcoKxwUNTkqKy0Rc0Y3OTwuHwJYMJJkRko8PS8RhUVXSktDZFhLP/xAAbAQADAQEBAQEAAAAAAAAAAAADBAUCAQAGB//EADcRAAICAQMCAwYGAgICAwEBAAECAAMRBBIhMUETIlEFMmFxgZEUobHB0fAj4TNCFSQGUvFDYv/aAAwDAQACEQMRAD8A5UxV5qjqfy7PCfiS0XE/NPmH+GJFHqX3lHVzWjHmMrLUhg9W3B1H+Y9jiVKQHYzzZ31oUm3zBxE6GRxlW5lM7JCpOWagDZD3NiqPbzoC0j9RghwIMFS+GkSV1XBejyB8kkJP8icF/wAVyPXHjG9UPMD6zwQR229cegm2/XBXEk0xWWQy8tsKCCFJ/Nr3sR9bYgMUND9DTKStQfAUogkWNibj22GFhaO8T2zerL8RNBEwPqS7ywvUVeUm3w2/lijdjuMaeYhTeoXGoW2xubgy3k2S0spvcA7D+eMzfmFH3BKUpktyIzC1FROwKUnYfUY8m4NjOZ7GYM8N2w3k+bMOxlyXnvnvp/yxumnloSjoTY/5435Yjfd+QKNGtdTraCBbc6yXP88aKidVRcRYAJSE7fp/liq8or1xBxxzlUyuu32ccWhJ9Ty0oH8xbEptHLSEjonYYglOvLMZKtzJlhZ97vldv0BxYYysdHSYAT0xFooMtcmUR5XndDZ/gRsP1Oo/XHmpyiwwG2SDKfPLZT3ufzfIdT8sXNGpyWwxHR+yZQBq9AB1P6Y65wJ0dZIDAZcQz+YjWfl0xYw4RkTWGiDZSrn5Dc/8vrj1TaPLUhFUlRJLMKcopiPOtKS26hG1kKIsT1O3r7Yv6Gwh1cqYo2abuyg+undR/Xb6YQd8QtWLOhlTV5i0VaNAbNlWU87b9wCwH1Kh+hwS5PpAkPGW4LobNkA/mV/6XwJ0lDlVnzagAVKlu8pi/XloJSP1UVn5WwScSqy7lHJzFNpu1VqShCjBHUX/AGi/oD17FQwpZk4rHUxgYALnoIKVWq/03zu9LQSukUVSo0Y9Uuv9FrHqB0B+RxbMpSt1tKuilgH5XxX0imsUCkRYLCVLDYS2kJF1OLJ7D1Urti7qdFqVCUlNSpkmIpdtNkcxJ9tSLi/te+CttHlHSfOWM9zlwJepeb56mEm60JBKR+UY22waUv7OOdEZDj5uZhtlyQbmjSF8qTyDp0OebYEm50kg6dPqRi+4dcDZtWqTsrN9PMKA0hSWIglfiOuKsAsls7JSL2F9z7DeU2opGSGziHGmtyFK4zEfWvPNFvypAP8AM/54hYIs6ZMm03NlU+5I5qFJcfUWCp5KXG7bEK1ddwdx7YC89PTMpJh09p1mVXZqCsMt/BFTf41+3pfqRsLdaVZVwAp6xU1NuwJT5qzA+p/7kpa9M1xN5EgdIzZ/8xHT0v64rmGUwG002mJCOULOPKFw2Tvc/vLN72/X0x6p0AU9pTEa78lRKn5Tm+pw73J3ub9B/hgooVEZgpjhaNS3FaW2yPMpW5JPvsScPFlrXEq007BgTTlzKq3rNsoUNZ1uPObqUf3ie5xtq9XK3XqBl5zllB0zqkNw16pQe6+3t9ME1TbmTZjGVKK5yalJbDk2ZbaEweqv7auiR79tiN9a4Wu5dLDmWooeh8pDT0MuBLmof6UKUbKJ/N79MIG5dw3n5TV9nhDanWDFOpzFKhtxoyNDTYsB3PqT6knEq22LOBknMNTdCVRW6W3fzPSnkrIHslF7n5kYpK6lrItUnwqpJcab5pXHekpN3mikEFNhY73Fh32x1XDtgHJkYqx5MkAbX6AYGpVfm16aabl1PMXq0OTrakpPcNj8yvfoO+N0Kj1jiLIUwhpyBSB5lJBCHHE/vOK/Inbp1OJDtRStpdDydaLAbHKl11KbFdurbA7f2vmcGACn4x2vThB4lvSQ2osDKElUGKya/md3zPJ16ktH955z8v8AZH6YnM5ddqEpuZW5AqUtvdplKdMZj+wjoT/Ed8S6RSodFj+GhthAButV7rWr95R6kn3xIZgSqvCrU1yd93QaWF6kRwC+8UtBwXURZKbKHQE4yz4/mCsuL+VeBNshLqGVOIaU6pAuEJ6n1A97YsKNVsoVSgzWJdZj0upoBU284sodb228iutjsU2JIOBcok0jJsmqOyVvVV9hC+co30lRFkITaw6joOu+L6nzY1ZiszmkpVzBcKKfMDfcfMG4+mF3XcufSLAY5nmiPP1Gnw3XGS3JfQkqbtayiPQ9MXM6iy6ZMTGkNctxQuDe4I9b4jsrUhxK0/ElQI+d8fc/5sbzrIocGkuS4dTjOqkyneQpKWE6FAA6hZaVLtsLggYXJc2DaODNqoMnxafRno5p+YrU1E4kQ6kpzllDgH5VXtcdbG9977YF6Wpx3xEd5xt+RDkORHXWSChakKtqSRtYix29bdsS67UKvmLLUPL8+jRNTEtt/wC8kSNTQSleokNlOq5BUm17b9cTqfAjRAhqOwhhoHZttISkfQY2gIBLHkzzYA4hNlHJUrMc5iJDjuSZL6ghtptBUpZPYAD/AN2wxJv2c683CdcajxZbzKSp2LEmsvPot1u2hRUbd9INsFfA+EWMs5omxFBuYzDbQXB8bbK3AHSn3IASfZZ9cdEcQMm5MonDlqoUVTESosJQ5AnMPnnOr1Ane5J2JP8AD7WwUEmQbdQ4c7e0/Oes0dUBxSSmxGKgC18Pf7QNEZj54qIYbSguBt55CE2Sl5baFupHpZalC3a1sKqg05tVYQh4DQQrZY2JttjhOBmUabPEUNF/yVUiWylawxFS+hwSHUKU3pCtwSPgISSjcaSkJ6EYsaYBFS5AKgpUUhLZTuFMndtQ9fLYX9QcEa4CUSH0tgqaCiASL7XOBiZTjSpbLSVhlsKKYbyr6WyTuw5/ASbpPY7egLAbxBiVEcWDaeslE86s0mOfhU8pav7IQRf9VJxEy4lUilMOk3VJK5BP/eLK/wDzY30l37xzGGUtqalR4L4Ww58SFlSCN+4OjYjr/LFllCEhNJpZNikRWth/YGON5UwZqwFawJfUXLL05TelskE+mHDlrhwxQA09mFS4TirFFObH9bUnrqUOjQ6br3NwQlQwZ/Z5zRTaXSarRnqUy7NltOPR6iUanGFIaUduihYBShpIOr3ItArEhNMqbjSsv05mUFBwy21vvF4KFw4CtxSVBQ3uU736YW6jJnzN17FikM870Gh5kydQqfT6W1T62uIuWzyj+3RrWnlKJ+JZCNQJ6m6QBqAHJmaaIqK+tQTbfHVXEnMK/v6NElp1rp8WKyiVGAbeacSykqF+hs4TsR8inAlxS4fPZhyi7neEhlUQq5c/ljQA9dILiUkDZRUklIJ0qKgPKBjsFpbChwZyjMGqXTWe65jZt7Ju4f8AgxuiKK36kf8A768n/ZWUf+XE1iB4zO1HjJ/fWv8AWzf/AOUOIkJaXGXHgbiS+9JB/wC8dUsf8WCN7s+sA/wD4mR6uCYZaT8b7rbA/vqCT/In9MQWVuqSpstFKVPvWbcSQXVcwm1juEC91K79BcnFtDZXL5VStpCipFNaUP2m1lySLfAkHSm/UqHY3FgKU4Vl2ynHFCynFbqV9f8ALp7Y8DtXBmvLUg3dZFYhLjRmgQopI2cUD5z3N+9zc4saXTH6pJSwym5O5J6JHqcXtYqEd/L0SKkDno03Ra2iwIP88QKBVzRZKl6OYhadKkg2PW+xxPLsUJA5gQe5lycltx4rq1SVFSU6gdICdvnim5C2gAttSCQFAKFrg9Dg+oefcrO09CZaHTUkP8tTPLUq6wnmAA20kaLHf133xVz5rGZ6vUqjPkcnU+gx21EkpYShI02HuFE27nE5bbskOIQrjkwcZRtvviay302xZ5lq0er1BK4rQbYZQG0kJtq3629Nxb2xIyrBZmVBxElGsIRqCDsL3HUfXHWfC7mE5gyC03tftgsGQa03QE1hUQeAUgO8xLiSUoPRRAN7bj/PFxJyPTZkRC3qvEy9JkoV4QyAAhxSfZRA262G5B2wA0ZSK3TGH3VK06lAstyFqY1pUUlSU30kXTcG24scJC3xRuQ9IYLt5MvZNEnUxmO7LiPRm5A1NKdQQFjbcfqP1xOpmXKnVIj8qLCdkRmAS46geVPf67b7Y3VrMFUzMGBUJXOTHTZCQlKQL2ubAddh+mLmjZ9qlDy4qkRgwlolYDxQStIV8Vje3c9sLO1gXAAzNAAmDkWE7KfaYYbU666sIbbQLqWomwAHcnDMynSo/Dia+5mNqbTqopvQ3HfgPDymxughB1kgAbe+MoFCpNJy/TnKjSPvOpTUqWIviGg8UbkaGnHElZtbypClX7YPOGFTrOW88UaJlSm5iFJlPBqqUmowJTMaK2er6VvJAbUk/lB8w2sdsByNR5CDg94ZUxzC3gZlurVfO03Os+nSaTS0U00umszWy0/ICnEuOPFs7oTdCUgGxIubYel7nGE7knqe+MPTbFWtFrUKvQQw4lBnvLKs5ZSqdGQ8I7klCS24oXSlaFpcRcDcjUgXHpfHP8nw2cE1CkTlNw6jCkKQ4hl5LoCk7akqHxJJJ9/XHSNaZ51GqLZeTHC4zg5y1aUoGk+YnsB1v2tjlV3PVFbafjRYc+VF3QXKdGWWlWNjpWnqPcYk+0FJKlRz6zYI7wNrFKXR6g/EcUlamjbUnoQdx8vlitWgkgDcnYDEuVNjz5TzkUFtorP4SlkrR7Kvvf54yHLcgTGJLJSHWVhadQuLj1GOoSF56wBGTID0VbRs4hSFfuqFjj6laExy2UnV12wcZnzPUsxURtEilIabWpKhISkm/fy36XwJQ6W9U5bUZhIW66bJFwN/n26Y9W5ZcuMYnCMdJQus7nbAnMq9QnVaTCpEJC24iw1JnSlHQFlIVobQN1kBQvukC9rk4Yk+lPU6U7GkILb7Z0qT1sf88L3OHDKjVNipVFFJ5tVUy44gtyHWw66EnSVJSoJUbgdRv3xQoesnzQTAmbVtrS2kOkKcHxKCdIJ+Vzb9cDVcpzn3pFqKYjVWaYSUmnvqAG5vzG7+XWLW8w6E2KTvgtyTTcuS8nUZ5GbKNBieDaRypMpCXm3AkBSFoUoWUFA3uet8eZkehuVJml07NlGqtRfCy3FiSA4tWhJUrdBUBsCdyL2xpWKOQAePhBFT1lBNkxa/DcbMZcVxO4DyEpWj32JuPkcD0HL7VdZkO0+oxZTbDiml6F6ilSSQQbXt02xMzlQILtBVVKrS/Fw21pYbeW31WshKUJVt1J7HscCUiLTIs8s2TSVMR0rZkRHlRlFAJBBUkpuBZOxv8WKNPKZQwDDPWZVmlUV/lSRpcKtCEIGorNr2T67An2tviPTWZMpS1PNhpJPkbBuQP4u1/liLTIbS/wCuq5z7zillt2W6t1wNlR02KibXTa9sMLh5ldWZq9ApzakIdlyG2EKcNkhS1BIvbtcjtiiCQMGLWMEGZ6ylw8qWa5iIlOhvTZSwSlllBWsgC5sB7YjVrI8ukPONPMradbNltuJKVJPuDuMdE5Glmh5nhUegtLYZ1kOyyQH5ZAIvcE6W79EJPUAqKiBpksxa7yuTmhxv7ruQBVGA+64EgkpYCvN0FtSFJA2BUL47mQ21bhpx1UotQp80uMMiWy4kJLPMCFIIJ3BOxBvuL32749UuT95QGJASEFwXKAb6Tcgjt6YdvHnLlGpWYGzRYC6dCehxpAjrdLhTzGUufEd/zDHP0+hxi+8UKlsIcUVrajyVttqJ6nSDtfva18EwG6yrVYLVyZNdraGJLpCOZBjHlyZKAVcpZ33A6gC2o9ioX6G2yZVEvGJGp0lhcyU4EtqH4iQgbrWQCLgJB79SMe8vVuJl1amHWPDQi2EoWy2pQQbm4IAJ3uDffcb4MsvRqK/Tfvenx46WJCVqU800lBWlJIOrYHqD19MAtcVHO2NBQYLUqku05clyRKEuS+pJWsN6EgAWASm5sOvUk74uIeX6nmHK2YqnS0BRpDavENc1KXkddKgj4lJNhukG2pN+uI+bVR6Vlaoz+aqO4G1JZN9y4rZCR6m5H+ONuUFOUWq1BlNMk1ByVAeiBiQrS606BzEKusjZWktG5Nku97Y1XmzzmCsBAhxwvo+Xc5ZNqFSD7qqtGKHWoapLcdEhg3SoJKwSXEq/JbcDbcWwTVzImUa5OpsGiio0yZIiR7iUjxDK3lNpKzdNlpGtRBOhXQnyjor+DOY2eFnEJCqnS4leiGOmQYMz9k7dPLd7GxCgFAkH4hscMmt56bzjCMGmqZjU55bjkFttsJdQgru7DdX8SuUoqIBJBvex1psZgQciRbVcPlekVHGXItS4XVqoUGcpn70bW2wjw7ocSpboTyyCP7QJ7je+ANSkyarNdaN4zGmBGP8A2bI0E/VfMOD/AI4VRwcWc3yj+KmjTJS2go6gp9bqo8ZB/wB75bYCaJQ1obYhNgqDSQlTnXUbbqPuTvhtfKMy4hKacbu80KCiglKNSgCUpPc9hiLQamaVT0tmkVFc9w8yS4ptI5jh6nUVWsOg9gMP7hnwTOZX2Fy3W6dT1OpZXNfFxrV0QkdVqN+g7G5IG+N/ELgY7l5L8mC8iqU1Dha8ZGBslQNilxJ3bVfseu+kqAvgZZSNpEnfi0DbYj8u1eXVZlSbkstx1RloSlpCtRAUm9ye/W3ptjzJqU6bXvAUrwy+Q3qkKkBRSFEjSi4721E4zMGVgmaXFLkRZATy1ORXi2pSb9CRsf8ALFnkymRoKkssoDSAq5HUqPckncn3OM7VzujZYbdwkmvZAqmT0ZbzFVagxJYrkV1tDbDRbbhlLxSkKUo76y0sXP7oGJVJy7Usx1RFNo9PfqtQW2t4x49tSGkJKluKKiAlIAO5IuSANzjqdmJTmuHmWpcOJGroNOciPMzkBxpg81xbySyf2gBe1b3SlJBtfzCzyplqmUrK0DLtFpUahQ64hU2fKYshaCXChttSiRzUDQFctRJstJuLAjLEE5kk6z1HM4piSVy3JaVMORnI7ymVNPJ0rFgk7g9OuK2t1WmMvCn1EJUh1GpfMTdtAJsNR/LfexPpjoPjXwoy3FpdKq0NqqUuuTXpCZTvODZfQ2UIQVNgEJUFBwXuT5bE7YSjuWYtPSI8dorU+ol1bpK1uf2ieuNhVJj9Vq2DMFImYFZKmIhRVnMVBeBW9SAvmrjosSXGli+j6ncne/UT67lNiZDZzLleYmRFkbJdSLJcI6tPp/KsdL9fmMH9B4RVafT35NIoEhyM3u65CiKKEH+IpFh674E+TO4b1aTUo0Qy6TJGmq0hI/bI/wBa2Ozid/na2Cbv/r1/WVaNZXafCs6QbpNWTU0utqbVHmMnS/HX8SD/AJj0OJrrKX21tuIC21gpUlQuCCLEYu88ZFj1KDAzJl2aFxHwVw5yE30i5BacFtxsRvvse98CtOr6XJCYVQbFPnnYIdVZDnuhR2I/njYYMNyzt+lNRyvSEOQgahFk5Qlq1vR21P0t1w3LjH5mif4b/p8sBuZaS/TZHiGWyJ0FRW2D1Wn8yD8xf6gYLqlBfiNRZtOKU1SnuCUws7alDqg+qVC6SPfF9nRmHmehU3NVMSfDTUWcQRu26OqD6EEKB/s++BrZtsz2P6yhURfXtPUQRgzWqlDZlMK1suoC0n2PbG/ApHkO5Vec/CU/SHVlZCBdcZR3JA7o726jfBPFktTmG3o7iXmnLFK0G4OGXXbzIttRrOJs/mPTF9wjit1GnVfKjytD1OcMuAsDow6b29wF6gfmMen6TCZp6Rup1QB1pUbk/L0xSOTHsm12m5ijJWtVPURKZT1ejK2cT7kfEL904VZhapVevb5xjRWCq0Z6GXdagOsIlRHk6X2T5k/Lf+eB6NpJUg2uRfSe474a3ECHGlJoeZYa0v098tsPuNkaVsukctz6KUPkFnCzzTAVR6o4tpogRndS0i5u2rr/ACN/mnAqLd4wes+htQgwckx1RH1NnoOhPfEZyP4qE7H6aklKT6Hex+htgzYyvKzXU4MKms+Jmy3EsstggalK6bmwHzO2IGZsoVLJdWVT6mwhmQEJcSW3UOtuIULpWlaCUqB9QTiglgYYk9mTf4RPJmzi84qswcvZsQCpdUgMS3v4XmvwXx/uE2/jwHTo4lwpLI3Djakg/MHDAitCt8IJUZabroNWVt/92lIv/JxBH1wvoBUYbSVjzoHLPuUnTf8AlfBlPGIlpeEKehxLrKsvxuW6a93LCQfmBY/zGLZV0mxBB99sUOQHm2Kchp0XbjzHW1D+EOk/4HDCnNxMw3EN9tTzJAVbpY9j+mFLG2Ng9Iiw8xxAikOhecqtII2hUxDF/Rbiyr/ADA+6DIzFR0f9s48f7rarfzVggoyOVHzNLcATzagWEqHQpZQE3H94K/nigafZh19p+S6lpmPCdWVrOwupAwwnU4lVhtoA+EIqnUWqXT35b3wMp1W9T2A9ybD64DlQ3FQ4FOXvLqb5elHva+tf0GycWKn11t9MyW2Y9PZJWwy7sVEf6VY7ew7dTvjdlphVRnyKy6goaUjkREqHVu9yv+8ensMd9xcxVU8GssephIAECw2AxsxLoJjCptGXp5O/x9L22v8A+uJOYlRFzEKiFsgp8/KHlv8ATbCu/DbcRDEFasssKRmJpBIQlLFSbR1Ujs7b1T/hf0xZvupEV15JCkhsrCgdrWvfFbl2qoZmll4BTTqdDiVdFJPf/I/PEGYleXGatRHFEtCM69BWo/E1pN0X9Unb5YLt52ypqK92LBPEEFvhTUEm9/CJP6kHBk5CchttaxcKQDqHQ4FvDhfDWqpR1RDbV9ALn+Qwz2Xm00xh1ZAb5SFXIvsQD0+uA2OV6es1qhnaJX0GEDqkOIF72RqH88WQZcSHWtSVRnFhdj8SelwPbbGtmpR5DrTbLgcKwSNPQAYkvSm4iAtwKtcJGlJUbnYdPU2wgxLHmI4xCTJnC3NnEmmVep5cbhzGKW+3FXCdc5bj6igqVoWfLdPluCR8Qwo+M2VcwZdy9OTU6DUqOqbIbhtmXGWhHMUsHSFlISq4Cjt2Bx3v9k+DV6ZwxkRatSnqQhNSfVDbkx+Q6tlQQrWpJAJ85cAKt7AdgMJz7eNfRWM2cPMnIspDC3q/KRfYaBy2D/tB0fphLR6x7Nd4AAx/EuPoa10wuJIMQUZlDdSpMZNg1DQqRv8AutJ2v8+mAmXLTFbmT3idIJct3IAsB9f88F7WZFUtvM7SYvNdmRUU9ElQ2ZQFpcdA26qtpv6XwDVRCnVUyIseV+QkrB6aUAr/AMUjH1bGTqQWckzQ7HXEp1CjuCy0uXWP4uWu/wDM4+y5YjlKEIL0hzZtpPf3J7Aev+JxZVeH46ODrW2to6kuotdJ6d9jtfEWl09LKi5rXJectd1ZGpfoNu3oMZDYGY9ia6bSiytUh88+WsWLltgP3U+iR/PvgsRFTBpWl1K7vkJeWhKiG0nsogeW+w37nEiK14VoEhOu3y3wV5Zzc5RMmVWmaEyTXStLQcB2bASlxxQ7puAE3/hI74VdyZi92pA2jJMqJmZ6m9lVmiJUhcVMpLkZASSsuBKkoG5sEJ5jith09gBjRX3FUmhwqJCUTMmKTEaUOu+61/pqUcTIUFMdYkulKUMJKWgpWw/eUT2Pb5X9cQslhFezBKzLJuIUZpQiBfZsXu5btqsSPbThVmBG49BHK6lqGFGMwgylRGF5zVDZTaJR4rbZSOhcIH+ACT9cHXCXgjG+0TnnOtRkS1Q6dlphFJpktoa0icohx5ZTcatKQWyL9FpPUA4FqHITk/I9bzHMGiStLs5d+oWRdCD/ALifpjr/AOyVkNzh5wEyzHlpH3rUmjWJy7WUp6QeYNXuGy2k+6TiHrdU1FTWqeeg/eUaqhaQjDic10/ggrK2bFqqtSZqK6ZJWlpEdkoQtxJKQtVyTtuQPXBudSAbbY38Ss00vLFXr9Rq85mnw25r+p55VgTzFbAdVH2AJwoJP2joEkr+5cuVOqtfkkvFEVpfuCs3t9BgSrqNUA+MxMLVQSoneVTQoZNYRcg+Fa/klP8AyxGosCJGheIdSlQ0a1uOdEp6k77AY43zN9tviBWqd4Km5Xy9QmOWlCfGyHpjosOt0aE326EYSedeJ+dOIDX3fmvOc6pwvzUeloTGjkei0tAah/bOAUexrm4sYDmNWaqvduAzxGzx+4qZXg5ol0/hzNazDPW4TLeQ3eDBUTvpdBAdN7+VNwPU2thCtRebKkueIXMqD6tUue5utR9B2HoAOn6Y3wqU68yiLFY8DFAtyWrayPcjZP0uffBNBpcamMpUpN0oIQlDaSbqJsEpA6kk2sP+Zx9VVWmmQKv+5LKqWL4xNNGo7cdkSH9LbLYukK2AHqfbE+HWYNCqbdXqDTz63UcunwUI/EWm4K3SCRpCiAAT2APfF61lqXJnojPR0yKi2EuKgLN2Id/h53+sd76Bsna4JxHnUClRqrauVYzq1JOhEClBT8pdvyBCAVA9eyfngJtUnDTVZNnKDj1ghlXOGYcpt1B1NPpr82oSFSZEyY+srWT0BsLAC52B7nFhK4tZrmtqQiTl6Ar/AFjTbjix8tS7fyw1cufZ4zXX22X6TwxEJp1QAmZpltsqTv8AEpk63QPpfG3iBwY4g8NEUoypeT4KagtbbaqZDfe5akgHSS5pFyCe35TgJ1GnZ8HGfjOvpwoLtEk1XM6VQKT/AEpnOhQsfA09CT9FIQSPpibTOHbqVLq9XU+zHZGp+r11atSBa+wcNyfSwH1ODxvLedSLPZ8cTf8ALFpEdu3yJuce0cNY9RmsS8xVSoZndYsWm6g5Zls+obTYX+d8aOpVRgED5RbxKV5UcwFrqp+YsnS3aS2/TsnxihbrzoKZNWTrQFrIG6Wwm597emyfvPp9Kp6SlbUeG0jyaSLaQO3r9OpOHWUtqb5RQnllOjRpGm1rWt6W7YWuc8lUihVKmzoVOjstOqUytKUXAc+JChfpexH0wOrUB22kYib7r3AYyjy1kxnMVLNRamyaTV1vLEjSAtKgTdAKFbbIKbEW74L6bk5mk5cl08LefRPDgflPDd1Sk6SfTYWAA9MTeF8FidnZcF9aUsy2hICFdHVN/Eke5TYn2ScPefQ4VSjIjPxwtlBGhAJTp+Vun+GE9XqzVYEM6aCCZx+5lifBkU6LVprMlMRrW0xHSpKDoIShxd9yrr6AWxuoL8fKdfEmcHEUSS8mSp5tBcDDv5tQAJ0qsDcDrf1wS5lXEn5orD0MHwCXvCsBRudDZIJB9CvWR7EYnZXhJfeecWkFCU6bH3xSL5ry3eNppwy7TBCjVlyn1CZVZUd6flh6c8408htSiw1zVWCk21aFJtY22vgpbk0fPWfTMoPM+6YlM8O7JDKkIU6XNSUJ1AXIGq/zxaV6mlrLTMfYLqM5uMkDs2Falf7qVYKAnSkWBCFXKbjY722/mNvTCNlig71HPSL30ik4ED6zRG4kyLHjPreU6nUsqRYJN7W/kT+mKLMkWRQ3WVMyQ6hCSuSjRuygkBLv0N7juAT23PK5Vo9GhB5wc19auWwwn43Vnoke3cnsATiipdMXId5EpXiH5xU5MdGwKBspI/hAIQB2B9Qcapc+83QQdVQYFm6CX/DnPb8ENymlcspuzIjKVqSqxGtCgLXTsPpY+hDnd41UJmjx0Q6UlmYzUFNsIffLrUZa2Uua0pIBV+xVYKKtxfc3vy3XcvVfIclckNPN03ZDc51sqZcbGyA/a6m1JFkhwixAF/THpiry5iKpy4xS8IjFSa/ES4lZZWouFtSSb3aukXAN1dMPbA/mXpJtvs9bWJ7TqB+PTBT6jVKrT2sx0qRC8UJ6XVtvtvrUlCmyoEpStK3CfxEqvZKhsrdc5tyxlmJRob9PXVHZ88iQzz22kMtsBTiFJVZRUV62yQdhYjYdMQ+HvEQZabn7rmQqhFDSmkOpCFjUhQJC0LSoWSRYpv5zYjfDcy21krNMYVRdQZocOhuKlOQJJLql6wNLbfmJcRrbG17nWoEAG4CQekl7GoOO0o8u5MoOSazRqXLoYr1RmchydKntnw0NhwjXykAi5SlRCnHDZKkkBIIvhE5iywEvSocpCHmgpTSwd0rANv8A2cPOpcXUQJaW6G0gNIeMhcypstyJEl9SgpTqgrUhFykWCANI7kknFVmnIGZM209GbVNJn/e/iZauQLKSGrlxak2sEgA77++5APNxHSHptZWy0RmTW1Qa54aorQ74N5i0tw+ZyKsqHnPqChQN/Y98aMqICKdHYSpLnhdUQrQbhRaJbJB73KcZW6YDmOnFbaViUhcMBaAoFwWdaBSbg3KFJG3VQwQpoSmapEnRQTBrTHiUjQlCW5LeluQgJSAE3u04AB/pT6HB3O5AZfsbfTk9owuHNSepFYgzmxqVGeQ6E32VYg6T7Hph9U3KLM3N0WhOo/qHi23YEk2ulh0hwI9SlSF3sL2Vc9CrCqy/RGshQGZ1ejH7ye80OlyEqSdINua6OobvsBsVf2QTh5cPKlJzfCYraAqTUKXFkNOkDdSilXIV6AanCL9AG/QYAvAnyGoyXJEH69TIb+ZajJZQ3Un3pDz7k2SkiHFSVFRVpIuuw6arAmwCF3TdRcW+IsuvsmnNS3/ulg6WmVqsHDf41JG1z2SNkiwHS5Z1TzLTtD2VmZCFxZv4T0w280m45bgJ3DaVgD3SparXItzZnd1dIXMM67AiFYfCuqCkkKBHrcWt649yZvSIXfmCeXlBWbK1Ud9NJprjoNui0NuP/wDka/XFLRqF4+OYz61t0WmNNonvt/E8qwSI7XqpR2PbqDYBRBhRMo1FjhPmmrSm1R/vHlh54EJUwVuIWpO5834LejboVj1wQ5b4fS65TubT4bqaTS2+e20U7oubKkO+ilE2AvdKTa9yu5S0+zsZNPUrP27SvytlObmaroS1DDkt+zbcaOnUlptN9DaAPypBO+1yVKNiTh20jgtQ2qfJaqNW01BtCSoRWkusskqSmy1hXm+IX0XHoVHbFbwQjvRs2GMwpSHnIctKeX1JEdxQA/vJT/hjqrhw/lH+h0n70TS/FjUahdKBqF/KE2AvtpHk/Nfr1wLljjM+V1F722dcTivP3CWZlpLchxAdhvC7Mpk6mnR7HsfVJsodwMKuqhukx3n3E/hsoUtQHUgdh79vnjrLi8iW9kjna+dBVPAjlBGhCeWdKNIA0EAi6SAe9t7nl+oUh2s5sgUpbSmmWR94S1PAhKW0ElBUbbJ1JKyfRpXXAgQTKWg33kKYL0xwU+Uy3I1uzGm7KjtoK3HJTxDi0oSASohPLF7bA9QMWrsiQuUqPIdUy6NzT6ZoflJ9nHjdlk+oJUsemLaqMQKfOcbhsOUVqrMiYqY+otS6i0okXCidTLRsDy0kLI0lRAVoxoor8N5sx4KQ2w0LoCG9Da03UNSNrEakqFx3Bxl7FPOJft2I3qfynk0h52HYJaZW0oPxoTbilNJdSdQU4s+Z1RIAKlbAHZItgtmcTYc+lUtmBSnnq+mTZyI8ypt2O0EKKwXSNJTcJ0m5Bv2xWxxdYQLFw7hAO5wz26fQsnRXY9SjO1Sooi+KmlCBohMm/mUSoAdD0uo6SQLYkamxTjeMn4QAZnJMCqzOi56qJcXTJrNKYYbZZjVgBX4vm5ikt3UALaBq72NupxeZfyFV6xDKqXTrxGfwwoKQ2gW7JBI6X7Y81XLNQozoJSl6OsktOoNwodR/LDW4d0UtZnomUcx1Jyl0WoNyJjM+BKVHU66loHkrWbFFk3X6HSBhF7CFC1TQXJ5muPTIvDnJrzbrJm1Wb+ClplouLffWLJbQkC5A9vc4ryumRuE1OrcKOy9KhiO+pRbutbwdSHW1XF/i1Jsem3oMdHcPOC+VKTWWsyw63OzbOi6mosyfOblJi32VoDaUpCrG2ogmx2Ix4r/2eMv1nOLdbZlS6fGdmtVCoUmOU+FmvtqCkrUnqlRUlJVb4rbi++AjRsRlm5zkxgL6RXcQYjeW6nIoud6Y0zSn3CmHVVt8yDIQT5QpZvyXRsCFEbi4NiMHXAjNsmPV5mTJVRVVYCIYqNHluu8xxMcLDa2Cv82hSklKib6Vd7Yc0qO1PjuR5LTchh0WcadQFoWPRSSCD9cDmXOF2UcnVp+rUPLsGk1F9stLfiIKLoJBICQdIuUjoB0w1Xp1qfch49JvBhScfLnHwm+MG2HMzUhVyjxcw0adS56C5CmMqYeQklJKFCxsRuPpjnCfRFU/MLlKy5mSdNptNcMeU9UGWVpStI3ZaUhCSop2BUdgbi5Ix0+k7ixsfXCBo3ArOUSG3TXK/SafT0OLK5sRpx6Y6FLUomy7JSo6tz5t/XCOrRrFCoJmK7O7CVZgfWyHHggNIkuIbUpDK1eVCVqAskkAWBxbTIsPLURikSEsNCpOlC6g+UJ5aUgFQue+1h8++OhoPCrL1PyPLyq3HcNPmJPinVuFT77hIPNUs76wQkg9rCwtioyvwTpVGqSp1Wlv5okJbLLCaoy2ptlBteyLWKjYDUd9u2FzpGIVc8d5zHeKSjsTqmzNlZbor9fpFLbsuQ3JSAVgFRS0FEcyyR+W5uQADikrFHJcjVyiOkiS4ggJ6IUra49N+oPQ3x0XxDzUeHuVWRS4rImyX0QYDOnS0hxWo6iBbypSlaiBa+kC++EW7X4NGZqbT85cucS5IeW5sX3lWKkpAAGokp8iemobXN8K31CkgV8nvNY9ZFm0OBQKZJqNYcM915SVOOKHVRNgEDruSP8A0xVZjj01NDamswkBp9tIZcbsCnUNQJ+nzw8stcNMo8LMnw8w1Gkt/eVMp6HpMhSluqS9oAXoQpRSFFXlBAHXrgHp9NInSZyqZEoVOfu4ilodW5yVE3uVKVoTe5JShIAPTpgd1Z04DO3M9jInK9YpMSr1ip/dWXKTKfgKSio1efGTymnVi6Wr21OukEGwIAFtSh0xUV2gtw6TIqsmQxAVBbDseTTYYaEVSTq1hJUq6lEAG5sQCLAE4ajdCzdlZiXTI7WUpkaRVptQ+9JLjsl0l55S0rUxoSnWErCP2lrI9MUEWfTcpVLPdNzPVVT26rRET/F1LQjxHLS+0+22BZI06m9LaegI774uC1j7hyBjpySO8UKcxcZym5mrNboIzW4wmN4bm0+DASUxW3xfWF3J1OhCgRva2q19NzVz6Yy+2yh9hMhxbgSw0EJWor/hv02uSdrAE9sWealyoMHL7GZ1TYlIRSoDjDjTSuSiUhALnNWlJKVghIGqwsSPXGMGn54kts0ypSY8mDaSJcNvTo1akgedOlWoFW1j8N8UgdgB6AenSLsvMGIS6Q7FqXj6kiDOilaSw64lKkqTe9wetyO3Yi2D/gnUoLGa6FOekhqOzLjvvE7lpIWlRKkgXFh7Yj16lN0OgOS3mk1SQwU6XZbaFK1LcCQrYAAAqv5QNhi8ZimOXHFAb/Ese3rjS6kEZETvqDLiOE1mn8N6+pxFKbqTMlxZbnSnFKQ80bpK2eWoJA0qve6iDtsbgSC3Q85hmDCnvQJ8dvw0NmSkutualrVoStIvuXFkakiwO6jbCnp3ENVEjrjFpNQp7iruwZIJaWf3geqFfxJIPY3FwY1T40ymEORaKwzQYawUqEO/OcHfW8olar903CPRIw8uWGZ862lYnAll9oiIadm/7ufUlMqLToTam9QJ8kZpB3BsRqSoXG1wR2xzVmKEJrgZGvmuCQhISoi5EZ5Sdh6KSnBNmLMLtXqarpbdacBdREkLUEhSLIcDawdbSwbLBSbFLg1JUBiiLi35jLsNMidJivtSVxXEATWUJcSVlSU+V9GjV+I12PmQnfDaKRzPodJpjXtBP0m+lspqjEdxlN0uNBxPyKQR/I4sYWVHn4j8Np+Q3AkqK3oaFANrJNz21C/cAgHuDj7k1X3UuTSnEAu0+U5EI9EBV2/py1Ix1vwM4eRqo1SksR4wqlUddLcmWyH24rDYF1BCrpKiQoea9tItYm+MscNiKaq46c4E5FXw2THQEpYbU3qCg2dtNlA+U9twP8OmHVknKD3FjMbTkJtMKtF1uSuJzEp1BCklzQomxBGpWndQOwCgSpL1428Mo9GjTo00w35aIomRJkSM3GUoa0oU24hA0nYqUD1262NscvU+vyMq5posiHIcjPipxkh1lZSoDmpBsR7FQ+pxzcScGTxa+oG3vNPE2jxsvyIdKCWnKpBK3ahMFlKDykhPh0q/cbCTqt8Til9kpwB5fqfgsxswX3VNQqs8hCXU7qjyk/A4n+2kFs/3D1SLT2XXqxTJ0pThccbdcKrm5V51b4hqYhQa3lec6o+HYrUBx0/weIbCz7bE42GHuypRUeEeUdeqblXznW2HVKW85WHanLWo/GS2lLQP1UtfzF8HGQI7L1Q0rT5bgmwwJ5spCqDxVrUNSLuSmUO/NbSiysfySfrgnyrKRSXUuvHT5gCnqSb2AAHUk2Fu5IAuTjZbIHyhdapGVHadzZJyPSs8cRX4AVIp0ehuOcmLHIU0GmnQhIRfdBJsVXCiokm4JxNzflKn8OuJEFhhLlQTXXkocalKHLS049pcStItzD1tqsB7kA4F6Vm9uHPLmV6m3Gr7p5tQYkKQHucd1soVuhQQrylF9RUDcbWFlmvOaaNnOdMzdUG5kaLPLsWGhQclJ0Ofh6NJAaFgAQsi4udJNjgOOOes+QJGNpHmz1nGnEanpalSClIFr22wBU+YYkgLubXFwMM/iuptqrAtOokRJYW7ElNm7chAVpUU+iknZSD5knqLEErFMJKVkk332wVTxzPodOp8MAzojgzmUVdmTltSyHZZD8BerSpEpI8oB9Vp1IH8RRfpho8RpMSgV58195xqHDaZjMUmOQ27JUy2lC1Hs02VpUenmBulJ3UOPqBXF06usu8wtM09o1B9QPQJNmx/t+b5NKxtVnSo1xhEqbIfelSSqQ6t5ZUrUslZBJ62vb5AY9jvFrdA2Q/Yw74o8Wpeeqml6S82OSRDjRkKOllARrCBckny73USSTck3xUcLKEjN+eKRT5bhQmVLajqV3SFLCSR774ViJBerTCyTZdacI9wmDp/ywdUSrLoFRjzmHFNutupWlSTYpINwR8jvjZG04jdmn8KvYvpO9uH/CqHxDoL9SXVJdIbjPLYp8OnqDbcBKALG1r6twSbgnck3xzHx6pbU+mUuqFpAnuLfiSX20gJkqaUCHdu5StIJ76L9ScNDKnGCiVDK9bnmqP0eRLLLEuNGAKXHTdxSmxrTbUlBuk7J12FwdITPE7PLGaZMOJHSmPT4aC1GYKtRAKioqUo9VEk3NgOgAAAwDkEcSJSrBxx0ioyeqZkSfNeTT3Knk+Z5qtBaaK/CdvFISL7DbUB236gYvc7cHkzacmdTW2q9RJCeY040Qs2PQi3X5p3HcDDo4Bh6kwM2SYrbbjxpaWtLjQcCwqVHSpJSQQQpJII7g43VbgRlmrZilRcr1isZDqSOZzmKY6oxXn0oJVoTqtYqSQAoEWsdXQYyxJbcpwf1n0lPthKj4VwyPWcgyMnzqMpfIn1Snso/wBG6FKbb/207fU4tck1JzLNGqlMdeRVKdU3S+eYkJ5aza6myk2HQHpbD0k5L4k5eoP3mutULNDSoS53hKlDVHeDSX1M6UrbAQVEi+/Y4XDmacoSpK0ZkyJVKBKKfxJlJRz2QbfEVN6L/LSo/PGjY5GHXI+Et6fUaW7zVOMwJnUJS0l+KQra+lfQ/I+uBNMd+gTjIhDwrhVqciPbMPk+hGyVe/64d1Ey3k/NBtlbO0SQ8TYRZaiw+T6aFBJPpYJOKDPHDmtZfQp56H4iMTZTjXmAHqQN8Er1IJ2N+cbto3rnrKTLiZGc3HqjSUEPU1CUrhyFBBU4onUg77bDY9MSHn2qmlz8JbS21lp5p0WKVdx3vbAxSpMvKldFTpSf602nQ/CcVZMho/lv6jqlXQHBPTaeznuXMXQKuzCTJc50ynzGymXFUr49I6KB7Hp74I42Hd2kWygoeJf8GZDdcy/mbITzgdTGbW/AUdgGF9gf4HD/AL3sMS6gpioRqa+9Zt2psKjKB/1yUqUQfkUKx6h0aLlHiTkBcW7TC0S6c6o9XAWytOo9zrufqMfc8Jagxq1EbFn6dUBU4oHQAq1qH1PNT/fGJxYG3cnQ8/tPoKG30jPbiCWX6jJokxBjPqjVCC4FsuDqkpN0m3cdB8sXnFlxdYby3XU2TFm0xtDbCEhKI62VKadaSB2C06x3s4CSeuKDNiW4tViVNhQ5Dukkj8yFbX/mD9MFMdg5g4bVuFqCn6LJbqiB35Dulh5I+S/DK+pxSQ9GkjVoEsS/uOPoYNUaX4HhVmBXRVSrseET6IaY5u/zUvG2HwiW5webzs1U0OAanHonKOlseILJRzL25lzq0W+HfH3ItPNdoGc8vp3lpjor8BB31OxvI+ge5YWSPdOKrJSXKjCzTl9DrikOwhV4rGs6C40Qp3bpctpWcN89pLc2IzlDghsn5GROGGVDmGVmBlEwR/Dym3Fp0ajZxoG43Ft0q64Ms80f+hVEerdMlIjrjx0sGM83zBKcKrN2sQdZUrrgZ4RTBT+Ic2KVaUVOAFpBPVbSx/5Vk/TBBnya3VuIlJgvOBUCixVVV5rsp8koaB9wATb3xOtL/icHpjMeFYezEC6/DXQKFTaIpzXLACX1+riiVun+ah9Rio+7WKhKbcWw2txgFQdcHlbHW5/T+WJEx1+uVpbqVAvOrLLJO4G91rP6W+g9cXuV8sM5zqD0NIP9HKesJlrB3nvj/R6h+ROxV67DFEEV17nMbscA8QUixRmx821fcrS/Mvp4tQ7D+AHqe/ywzcrU2JKZkqcbQ4EWQAdgkW/l0xYVHhu1IqS3YUr7uiu25sdplNgeh0dNO3scUM6kralOfdbiYDZSGy2UathsFX/e9Sepwk163DCmS7SzHLTVTRT3K6thx8KjpcWlJUCEm17An6fyxlabjoqLgiWLJsfLuL23t9cZJoxZpLUeKSpbCg4kqVus/mv7m5xrhQXZb4W+04wwgdFbKKv+Qx0YzuzAYgLMC4bpWAdbJJI/eT3H6bj5Yt8xss5moMYFwokN3CH07kak2v8AIjYjH2sxNYD6Oo2I9r4raa5yCYpPlHmbv6en0P8AI+2KVi9CJaRsiE+WI7cqnSqeTdD8bk799ik/446S+yDwfj58yvlzN1RrgfTR5So71IRGCVJkx12QHHCo3FuW5sBe4HbHKsJc6mPpeiJD6Eua0tHbWD8TV+x7pPQkWx1J9hbPMeDnnN+US8Gmay23WoLTmy+cgcuQjT11W0Kt1sgnpiD7TFgoc19ev8x7TrW9i+II2/tO8K38wUWBXMvUZp+oU+Q65MZgsJD8hpxIClbC6ykpSbbmxVjnOicLM2Z8mM0+m0CpMIeWkLnzI6o7DCbi6ytYANhcgC5JAFsfoD1AvuO2+Pur3x8dT7Sspr2YzKV3s6u2zxM4+E0OuoisrcddCEIBUp102AAFypXp6n64/MjOvEU8SeJGb+ILpWadIcMSlBX/AOxMeRJSP41J1W9Scdc/bZ4iSMq8Km8t0t1TdazbIFKbW2uymo1tUhz1to8h9nL9scRVNTdMmUSkwmgI7L6FLuPJZoBaUH3OlJPsffH0/sDTbEbUv1bpEPad3Spe0IKrWa3F4dU+hyKO7CjLfXIelLSoc51ZJPUCwGoj6D0wEy0Bdeg+jbLzgHvdCf8AAnH3M2b63Vp7pm1R16KzK5bcfQgNoSXAk22uO5648z0rEmBLSm6Trjue1wCP5oA+uPpWGDI2mQquSOTN9XPMhMRgrR4h3SojrpAKlD6gW+uLKixAnU8bC2wFth64p3LyJcTUDZlpZ3H5lFNv5X/XF0WVOUZLIJCn3ENmx3spYSf5HAW4GI/kLlvSTXDHMZqVMUtTDxIYitftJaR1I/dRfYq9PmL2tOiPvuOTp5SJb4SkNpHkYaHwtJ9hufcknvt5dgiTmWa4UjlslLDaR0ShCRZI9AVXOKfM0+TW6gqhQFlpoAeOko2KARs2k9lEG5PYHC58x2zlC5HjPyT0kaqVFWc57sFhRboMVdpb6NvEKB/ZJP7t+p72tgspdRixYC4i9KnXvOtpPZsWCU27A2t8r4oJjkag01mBDZSV30NsI2ubfy9SfQYrRPTRAtv/AK5U3U811QIShCR3UT8CBvbqTv1N8YK+IMDpGg2DmNPMVJXmqjZMynp1KzRXocJ9I68pbutZHyAH0x2Jx++0ZlngNSBHcR96ZnkNkU7L0RX4q+yVOW/ZND95XUDyg7Y/NefmnM2aplOqTlXeojNLKlwnqcTHeupOkrCr3HluB3sTsL49RaY6687JK3ua9YvTZSi5Jf27qVc2+f6DCNns1LdninhcnHqYZdUUzsHJltWXqxxCzK9mHNDzdQq0hxb7cNHliwgolRCE3tt3J9N7nfEKUh2o6vBqnSkpuFPxktttH+yp34h7gWwUU3LyncqhzkOuGozxAaaAKlOttJ1u6e5u4plBHeyh64J3UU3JTX9dbYmVdshJjuDXGhK20pWlP7Z70bT5R+a9rYolwmFUSK9wJPc+g7xRIorrtg5TqtJ2uSp9Dg/RK7fyxawKHKulDVNqTaQdkpQy2m/95QH8sNKHW6xWwjxKmp5ULcqoQWX1BPzQEFA9kqsBbfbFi5luM0yZEyPR6e2N1Kddnx0C/wD84j+eAvqdvBjCm4e9X+cAmqeuM42mevlrWdLFLp4Lrzyu2ojc/JIA9SRg5pNKYyrAkV2rusQHoaFEvKUHG6YjoSk2suSr4drhF7C6rDEA5jyblh9uOcwQ1yH/ACinZWjLceknoEKeCnHFE3sBrRe/T1dPBngRWM912Dm3iBRjR8vU8hyiZTkgai4B5ZEpHS4/K2eh6gC+qffeEXe5wP70jK02ag7XGF9P5lFwi+zXUuKUSPXc0P1DLOT3ruwqDFdUzNnoUT+NLeHmTr66RvptuL6ldR5K4Z5V4bwvCZXy/AojRFlKisgOL/tOfGv+8TgkQTqIPXCe46faOpvCtD1GpSG6rnTQ063Tnm3Qwy2tVuY84AABYKITq1Ktt64+Ye/U659icD07fWXNtOmTLRxNtnWDgf4m5VjZryyuFKjNSUKCtAeBshy3kUCNwQe4OEFlb7TmfcwDW3R8mvrDZJiePkMPKUCLKClJUncahottsdfbDdyRxlGb6q1lfMlDXlitzkOLpq0TETIdQCElag08lKbOBI1ctSUq07i9jhZtPZW2VIJHPB5ghqaLwUz1nLsGkVmA8zSKhSKs3V0+RTC4bi1LV6pISQpJ7EG2CukcLc0VWpeGdpD1IbQSHZNSAQEWHZu4Uo/L9cdmZTqapNO8KtRDsbyWP7u9v03GA3MqP/rDO2H7T/LDR1xbosn/APjkB5M42RL8IJTVQWzFlQ3VsSEE6AhSVEHYm9ja4xHzNleuV/Lq433DUeZMZ8VTi1HW4XdCrpNkglJ8vRVtlA98dbtZby2Zb9RmZcpk+rq08qZJiNrW2RfzXI3I2t6YY2TKR4CIJjif6w8PKD1Sjt+tsE/8gEIIEwvs7nJafmDAqUiKuDVoHllxlJksDoCR8SD7EXH1x1rxOzZlOg8CafmajpD9UrsZMSla3VEl9wHWtYBA1NALJ7AoSO4xzZn2hnK3EXONF5Yabg1iSllA6BlSy43b20LTgaebfS4hK5Tz0RkLXGirWS1HKyC4pA7FRSL4+hsoTVFLD25mRhcgiYywmNHQ22Dy2wEgnv6YJqMlyNSmNA/HlPBKAe4uLn6JCj9MV7kIopUBkC70lzmHboLWH+OCCCpCa4NQHhKa0kXtsFqsSfogD/b98FtbIwIatcHJjC4eUoVHi3RI5Gtqj0x6epNr/iLIYR9bFxQxecZeImT40lFPVGOYa/GCgmNBe5bbF97PODZIv+UXV7YTMiuVh7MVacplRcgwqkyzGWmMNL620ajpC+qAStV9O52F+2JbFCiZWTGadjeLqkm5i0lnZa/Vaz+VO9yo/wAztiW2nBsDufpPOosJz0lfSKA5OkO1quSEtMNgkvWIaZBOzTQPUnYd1H+WHLwx4byZzhqEmGUy5hSmNCUNmGU7oCh0Ctyok9L9rHFNlTLKvHtT6043NqCLchptFo8T2aQe/wDGq6j7DbHUWS2aTPg0uMllyEmQypUuSh4G9lKSdepBsNhsCAdadibYYLeIdoMjazUitfDrHEWWZcjyaGtbExpCh5kkpIWhVtlC/Q+hH69RfnziXkaDkmRCzTQoiICIsjTPZaFmuWuw5obvpSUrCCbAeXVfpfHe9dy/TI1YehvyH5DMlRcU0GxpVck9SRpNzYEG/TqDYoXONEppmzoiAJlOcK2rOgWcbO3m+Y64wpfTPuzx6SdptQWO0zl3K2THqhX3aPFlNRI6mlSqdzl6tbQV5mRbu0o6SOujQqxBvifSspVasVo0qE+yZLD8h5zzkIUiOnk6Qfd2Q4Af4Meq3BRw2mCj1h59ulFXi6PWGj+MzovYoPTnNglKknyuNne97i24W1sUHMkGRU3m2Gp9MTHjzybNSHlPuOrBP+jWrUhRQojckC9sP2u+w2JzxKooR8n1kg5JqVHoUmp1os0wB2Ow2HXArTzH0Nla9JICRq9cN3Ls6JVaDUMq0Wquv0BqKho1NlBaekqWpSj1JKWybq5fRSOQo7qJIVxse8XlmHR3x+BVqgzHkAjfkovIc+RKGCL++CnhZGcj5OhS39BlVNIqL2hNgkugKQ2PZtGhseyE4k2aiwUeITgk4mRo6ieR0nNmbA5qqMRlwfeUGapqOeijIZe/DsP4lJTYeisNfhDm5MB2qeGpsSqtvxU1+mQprKVpKwhSnmxqB0q0c5II31Ib62th45NyxkOnZoezFVctRpFbQC6zODIWvm2sFWOwIt8XX3xyxmiC7lTidV2Yr7keDT6kX47SHVMJbZk2fKdTZS4oBa1pACkgBNr4d02rXUA1gYIGZ7wAvB6HiO7MWV4PFpuJmqNNkU2dUWkSlPJPMC0rAUErQT1AIGxFrW7YF4KpdBlZgy3CqktXjapS6R4lRtchPjXjpTYW5aFJt6d8EHC+9BjVzLK1oIotRW0yUElPIeSmS1a5JsEv6Rc7aMBGQqoqt5jpc6QsIbXIq1fLizYcvUiPHJPoGn3AL/uYUQ2hnBOQOk7+EqHG3pJVcyRmqPWH22m40mAAVpqT0pEdptFvMXQpRUm1uwVti4zRS6NxkpNArpdgMS1R44lx6dLUW5clISS8snoQk61eaybEqurADm3iK/xYqa6VSw6mgodS23GbB59XdIJQdPXkG10joqxUTpFsEyaRIrDi6Cy82zTI9o9WlQlHluFJGqDHJ30hQ/FcvdSrpGwID9bPXXm3gxJ9Iu4MhwB1/iV9RljPD9JpVOK38uUxWiNdASupyt7vlIAuLkpQLXIAPcDDTpU37koNfokN3Wy1CPi3EAEOyCoA2P7qACkEbHzn82DDg5wwy/RafWJjJ8VPehqQ0mWvmCIkXVdu48qrIuFDcDvgjyrwmpNIpLy1BnkTlJCWA4t1dkm1++3xAg9OvbHhcgA2yPq7za53HpOccsPyEvyqiw6pkwbua2j5ysAkAG4sfL1w3KFxQgKjx25lPiTn6m0wpLwKmg8FB5Y1JQQL2Yv5bX3vfrgKzlkOmu16c6h+ZED5LUxiFICGpIB31ADvvcpIvc77nC+p766lxJaXHX/U2pMgtNIPlbbjMJi6QOw5jzlvrhXxS+SvaP16JbRuMdWbc6IjU6ROnSEswYLKnCEJCUNIAuQlI29vUk9yb4StIpMzMQ1zWtNUzg6Zk1B6xKS0oJDd+xcKUM+9n/XG6s1FviNXxSmpaWcr0oqm1eokgtENAqIB6FLenUeyl6UjocG2SWXZ6ZVelRzFk1UoUzGV1ixEJ0x2fYhHmV/G4vCmTVWXb3jLtNY09e4Dr0lxUMu0uvNobqVOiT2m1XQiQwhwJ7baht0HTHiscMaRnlMSLvSH4iNLEuCpLS2m+6ALEFPTykEdxbBTT6K7LI0NqUSNgkXJ+mPcql+GQpZY5qkpJSkAEq26A4jM9g6GCFiMdsWGaeCVHjyYL2W6hJj1aCLKnzFqkJk9CUuIukAXAI0abG+L3LmUFxG6m9WJxrlQqlhLddaCGygJKUtpb3AQAT7m5JOLKJKJUGH0rYlJTrLTgsQknax6G3S4xYsEuuIQkXUohIHucea2zaAxziGAGeIEng/EhLiy6LVJ8GdBVeGmXIXKjNo7tcpR+A+3mFhY7DBbQYdck5mhVrMj9PkfdyHExIVObcDYWsaVuLUskk6bgDoLnBBIo8mFPTDIDrygFJDe9/8A3bGoeRwpUCFJJBBHQ4A1psHJzCAYl9UKZFrUGVLorTMPMOzjD6VFpxDgIsrUkE2273B74eeSM7MZ0iyf6u9AqMJwNS4b5BUhRTqSoKTspKhuCPQ9xjneI+Y8hp1O5QoHBfHr1VyDMqOZIios2nS/DqkQnWVJdDafKOWsLtq8yjYp3vbGdPcaX2MeDN9Y/gmxvj7j6RY2O2MxezOTxjMethjNsezPTzjMetI64zSDjs9iecZjNJGMscdnpR5vyZS880tMCrNurZQ6l9tTDymXG1pvZSVpIINiofInG2kZOodGp0Onw6VEbiw3OawhTYUUOd3LqudZ7qJufXH3NeY42UMvTqvLupuMgENI3U4tRCUIHupSkpHzwoalV8w5iYizcw1Y0eMEFZptLccjBtarWC3UuanCkA+gv2wlffXTy3WdAzJWec2VTPb9eocF5mmZbjrcgPSVNBx+S4nZwp1eVCUquAbEki99sB+Zqw09GbitvKkqSQVO9Aqwtv74kB+DSqBKbQiYhcxa3guWpS1vLUq5WVEnr17X73JxTwqyzDZeSY6VuLGyj226Yh2WNc5sPQdJ3pKN1IUb2x8zVlbK9YodKdfixZ9Tjuh5HiG0ultVtyAoeW1huLfyGFZmjM1YbzRUY1bq8/KWX2FgRJNMp4e8Wiw87klSXENb7adKT74gT3JngDKy/wARJsxgkBwOCJONjYnlqS2NKrX+LUPbYYqigqVO/Hyzj7wBcAGHtfrMDLNNcqNUmIhxEFKS4oE3JNkpAFyok7AAEnCbzzm6gNzf6VUyqz409KGmn6dJiOR0VFrVYBJfQAFp1k3Sb2uLYnLzZO5TdPqPOzxRKgFtONOMIZkxXUDUgqWgISlOoDzEBSSARe1jGTCf+6hCqb6anqURZ1OsFN7pSokecgWGogFVr29alSrUPMc5+32izMDKNVFqmY6sqRmEMSIjiNAprD7yG49r90qAcJvuVDa22OhOEXD2DNpqpU1tMiG1ePHiSXVqS86QSEqWVBQSBbfV10i6QSoJpMkMtBepIaCdSVg+W1uvythxcHuJtPNCTCcjSm2lO86HUpEQqauoJurl3uU2SLKsep8qrghuttx5GBI+t37MrL2ucGKTOL8d2nv5fnJYedbQHeY2rloUo+RdnEiyCNRUr2BsccyZnpaKfJKQu53BFsdhZkzlEKHpk6YxVK4mPIZioiKuZAcbWgIUogJ1aV3SL6iRoNiQE8pZmYYriWp0B9LzDt9KvbuCOoIOxB3B2OHRZjGTxJ2kV88xVVSC65NcTGF33Ly4wH5320fiN/8AzGQofNtJx9LSag3HktOracQUvxpTJ0uNKsClaVdj39+h2OL+p0aWhoLh+eZHcTJYUDY8xB1AfI20n2UcVzSIsaelpiyIE9BmU+56JUbuM/2m1Ei3YEehs4toZcjtPocFkDDqJL+8FxavSK4EotW4xZleWwTOjEoc27ak+YD0SLY6Z4N8XIzTtDp8p5yHMjykogzo4SSguqCVNrSrYoNyb3BBKuoNhza1RnKxTa9Q4ybzlNprtNv1MmOAl5tP9pnQT/C2vFO1ml+M0zUYayjkwZM6xO6SGS2gfMOuo+qfbHsB8ERfWaT8SVb1nXHFTjLHzMy+5FlmdJqqAhMqSAgNMlQWhttKTYdEkqJ332Fzfl/MgmQ8w0RL2ylVWKAQdjd0DENUp4Qo8dS1FLLaWwDvskW/yxFjOrlZnyyqW8tTSa3T0qW4onSkyW09T2F8eVSGzmK6OgVuAeeZIydNVToTtxzG0SpLLqe9g+sf+/nj7W2o8qgVmPGbN6mVQYmrctFKUuuOAdrHlIB7F32xqqMV7LeZs5U1aTaNLLyU9NQWmxt83EuD541yJTVOrq4b2rw1NbEESerfiCQ7IJPb8VzSD0/DA9MeA8xeVDX4bsx7S14ryBUl5PzyymzU9EeTIWdgBJbDcj/ZkBQ+mIUeqvwHWalFWBOeUtujq6hnSSl6fbvoN22b7ayVj4AcFVMojWbuEdfy49ZS6JKcQ0nTuiJMBebV/ckJf39VAYCOHNBn8RaxEZnvrQ6W9M9UcaRGZYu0hhP7oun6lSjjqsoUlv8Ar+kZvQEC31ENMrVlymGJBY1Fbi0R2WkgqUtaiAPcknc9+pwacc8xM0/P1WZYkJdZW82A6jdHMcaQsg26brt5rb7dcBEfLkigUalw6xSnYxjVqGw5UFRUyULtJSQtAvdzUnbQAf3SO2L/AIv0GPVp2bmo9MzAmQ/To02KuXEisvIUhCkXWyAlKUlbaQOWgKAve2OoVfn1nzL0KLRkdYu59ScTDlsLaXMpslYdkREmy0uAWTIYV+R5I29FpuhVxa1UZRgMtrlvtvRXW1Oxqi0nS1JQkXVsfgcTY62zuDftvhmUbhLFzPk+FVYdXdVUJzDEph5QIZaCglSkFsHzbFQJJO/pgeqvD5uh5kcgu1NFQoUVpuq1Zh5gIAdSr+rp6kBSyFFVrfhtm99ic16ipyax1Et1U7sI0EapHfiUGHSXklmp1t0TZ6CbFqOEgpaPyaKEkfvPr7jEspJ6n64sMj0tefK1XqjUHVMzZTTEiEpQv/VlLdFynb4lJKzv0Wn0xVZhapzxWlma67RGlcp+WhO89y5HJjpG5TcEFQJvuBtcgu4M/h+nWbtrNj7V6CVFKbMlWXnwNn5k+YNuqPMlJ+RStB+Rxf1N1TfLtcC5x8gQ5Dsjx8xtMdwNBhiIi1ozN76bjYqJA1EbCwA2G+vMSzGpzrqUKXI0hLCBsVuLIDYHzUpI+uNMwLgRa3DvhflPMarOJpNKLbmlUqoypih/C02qOkj5jSfrizhh+ouak7gEXJwPyozdPqrUUuJTHotNaircUQE8xVlLUT7hDZv/ABY0mpKfSwtTbpjSBqjwgpTbk5P76yN2447q2UvonucEK7jxPW1ZfAHSdZfZ3znQqBKnqrLzpjy43Jj8gAkuJdbWHN7+RKmx5gCL7DVYjDgy8zGXX6ZIpMemyY/imtTsFK5Ty0FQuVpcUVoPW55aR3xwrRq0/BkofkOl50qSp1SEhCSALBKEjZKANgkdB7knBi1xEcjuoUw66VpN0KA0qSfaxwqy44E+c1GjJbKzpPiXmemZVyhOpkyDF+81w0QmwkrQ402Xg8pS0helN130p0g2sTYEX5gGYmpKnSt1EbQr4b9R2OImZs4Sq+Fh0rK3F61uOLKlrPqT369cCEpS2m9SI7skg7paAuP1Ix7www5jWlo8IcynrNIpdQ5rk5hhTWo2dcskgE7ebY+nfBDw+zJmzLZkqpKn82ZXjoAkU6Y7rJB6pjrPVQG+noem5tihW85Ww7TY9PkqqCzoDGi+g7ELKhsADY9e2HzqQ0gITpAH7osL/LGNRaEUKwzLlFj1nIMXlWy5R8zQI9VoshT9NlKPhJahZ2I8PiiyB+VQ3tfqB32JA6rQGnZID6Fx58Y+R9hZbdaPqlQ3/wAQfTDFzQ61kWsf0kEfnUGepETMMBI8rrSiAmSkflcbO+ob/wAydPEXKqqdUAsPCTpCEiWkhIfju/sXtup1HRt3JPS2O1W7cDPB6fxLKkXJuA5i+qWYMzoTSVvyUVpulTWpzDykBuWkoO4uPKu4JG4vgoXnFvNZTVUKQ5zE8tYCfjT3Ch2IPbtbAwt56mvpZmgaFq0IftpGr91Y7H+R9jtjWiEqnVNyXGNmnx+Ki2wWPzfUXB9wMNmtGwe8wuU4EtpLS5WVX4ygVKiKLSCeug/D+gVb6YLeHExcODXaw6oeFYob8Z5CvhfckANNt+51kuf/ACSe2BWBUkuy3IjgNn29QHuDZX+IOLxqmuwuF8hEdRVHTX3DJ1HzalR21MD+yB4iw9dWODjiK6vzqFPQkCeOD/iW+MuSxETzHl1JLTiD0LC21pfCvblFwn5Yp8rS42XOLdDdZUF04VRdPN+i4rpLah/4f+OCfh4o5XoOdM62vIhxk0SmlJ8zcmUDzHdtxpZSsAm267YWVJp7lezdSaahamkl1pHMH5VurDaf0BUcNrzJjgPZc3YDE95gkucM85NSnWlvLolRcjutp2U4g62lgfMG/wBBjy/KqLcepVmpKJrVYWlxxlPRpPwtND2Fxf5YtuMT7dc4q1+UpvQ2moyHA0rpdK9IJH6n54qKlMDyEyFHUNHNQfaxt/L/ABx0jdgyhpzmsOeuBKxDzkSM4qKpPiVqTTIhWr4nnFAKWfl1+hx0FlyhRsr0OFSog/AjNhAV3WeqlE9yokn64EuAOU4tc4r0WHPaalQ6TAfnyG3UBSFvv/hISoHbYFdr+mHHxL4bx8q/d1Uy3AlmGhxaZ8SM46+EoUnyrDZJOyutvUemJHtDUr4i6fOO801LuniDpBom+K6RQocl1Ti2yFq66VEA4t42WM0VyGZMKgVGBT9YbXVKhGLDTYP5kpXZSz6WFr9calZEzMJKaf4uM5BWvSqp3s8ls+qLW12Nttr74mhwvO6AGnsfosGFZTcMlYDqUMflNrn9MVs+CYEpTOrWAAQq1r3F8MXONHpOWeI2ZaPQFqdo0N5ttJUSS28G0h1sKudQBG523J2wPVOht1BwuoXy3bWO10nDSXHPmPEWesqSPSJ9+ZHmQm6pFVzYT4HMA/ITtcjt6H02PS+KabDLDgKTYXuhfod/+eOovtffZ9HCSuS+IGW4l8lVR7/43T2UXTT5CzbnpAGzSyQFDspXopNub3KcpuUxHDiV02SQlmQTfkKPw6j3RuN+oGPoNNqa9ZULa+hj1lbadyrTxQ6vbUVoFgdDzR3sf/e4wQtNM1B2OXFrQ40rmQ50ZxTT7Kv4XEm4I7YCZUd+nTFnQUyGlKadY6E2JBT8wb2P/PFrS6mGU8xlRXFWbLb6FB7kDsR3GB3VZ5EIDkZE7s+yLxgn52olWyrmarLqWZqG6FtPygOfLgqCeW6SPjUlepCj1+C973x0IkaiLbfPH5eZXzJVsu5pp1boc5FOzPTNSoslxGpmUwoWW04nuhQIBHYkEdjjsLhf9snK2Z4MyLm8s5OzDAZW89HlO2jTEISVKVGdVYEkA2QfNe1tW5Hw/tH2bYbPFpHB6j0/1Luk1alNth5E57+1dnM5h+0VV7guwsoUpqAykKulcl78VZ9AfOGz/YHfC+oSJIzPSaXFgt1R5hp6XJS6nUkr5aipZNxYblW57gemKaDV383PS8wS1a3q3WH6vOUd9F1qUlA/sqCPlvjZSJ1ZgIrddhrDEWSPuxx42KlcwaihN/4UC5HQH3x93RUKKEqHYT5jVP4zM2esEKzDdfdkMqJQp9151Jt1BUopP6qSfpi7oxRXcvlKypKnUg3Sd0LB/wAQoYg1J0O1R1AOoRkJYuOmq2pX/EB9Me8pucufUI4sEcwOD+8m5/mkn64Lb7sZpzgZkhpwqOhStTjaihR73H/pbBTS6NIqPhQ2tKG2NEt4q6ctspWv+QwJuBEfMsxoAgPIbe/veZJ/klOGvkFCVQa64seVFAkH6kNp/wASMKWHGDPXsUqYiVdZmN0OFVqirzpC1vITbdW50J+ZJA+owP5bhKpVIW++dcld3HF9dbijcn6nErPMkzJtPpaSNKl+KfPbQ2QU/wC+U/pjRVwpynxYjPlL5SnbskkC/wBE3P0wuOg+MeACgKOglQxILbUirP8A4inLoYSRY6NVhb3Wq2/ppx4NOT4UsvHmreUHJK/9aoW2+Wwt7C3rjfUCiRWosVsaWY6VOFPYW8qR/Mn+7icyhK3HFbEp8pHobA/5jBM45mcZlZHYLhTJkIskH8Fk9E/xEdye3oAMXqaY42hp2oOGGhaeYhpKdclwDfyNDcD+JdgO+JlBpUyquxE09srqM911qM5p1FppshK1JHTWparAnoBgwyflRUSpBxEdD6m3VBb8glznOpNrDe7liL3uE7W3FxgNtwTrEyz2ErWf5hlmZUbLGXKfTMvxw23S2TDVUGrLmKfdJWtlmxISpSgpJUN7IUSoJBuvJdFg5TQxUsyul6qSDpg0OnJL7pv+RpA3N7HU4bajfcCwwX5zzZLof3VlfLcZqtZ0kS5MqRFWbohNuNtBL8hY2SbhzykgnWdrEaiDIPDZjJ7r1Unyl1vNEsf1urSN1H+BsfkQOgAtcDfawE17vDXcx4P3P+p32fphSh482es+8MeAPEDixAVNk1KNw3y4lwtmPCSJVUeGkHdfwN7EbglQ7g4v8zfZ54bZOmsU1unSsz1aN55VWrsxcp1aiNm9IIbsBufJffrscOSgZ4jZM4cRWmFJerEtbzjbI35fnKdavT4dh3t6YpuGOV15or7lRlguxYi+a4pwftHSbpHvvdR+nriC2tvJZidqjoBPovDUgDqTDXhHw2omRaOwuBQqfSp8kBx1USI20tAI2TdIB6WuPUnDljZMekUzxZSNFr374EmTy3tR9b4NoucXkUnwaQCLab23tiO1htJawmPbSigIBBKVAMeToA1WPQemPytzvKquduIWdqhUKkllblalRlqph0tvqaPL1BSk6tACQlIsNkgm5JJ7i+0n9qpjgvUHqZS6T9+ZiahCoPB5wtxYbRUUoLqgCVKWpJ0oTYm25GOG8uNJNAgJdWXJIS4uSsjq+pxSnP8AfJGPq/Y2metGtdfexiQPaVyNhFOcSVk6vmW9TY7YVFmqkiK6paSstlKVKWR67JICv4gd8M96NnPKeWpuZYlfDr+TVCusO8pSVLBJbS2tIISoKQ4+hQv0CbDc4D6ll4QaO1mKJAWuo0tSXlJaQC460SEuJ6Eq8hUR7pGGEmoSJ/2X+KlSWytDMppphoLChpQJIbCbH1sSfcnBNTV4dqsgGCefrE9IosY/CdxVBH9HcwszkgiJKGpQ/dv1H064ocypT9/TVJIUkqBBHToMMKv0n72pTkdI/GSApv8AtDoPr0wsi2QvQoEKBsQeo9sfHHhiBPpAJLy7TEVOqNNL/Zpu4oHuB2+psPrhgrNjYbD0GIFAydNorsafIS3yJTBKNK7kXsdx8sWT7WlRtgbg5wZtCD0nAn2taYik8e6rIbIUKlTosxYT+VSQWbH3IaB+uFFIN5EVsC5dIRv0AuCT+l8Nj7Vc3xvHXMiBcmMxDi/L8BKyP/xP54UEupQoU5tMuZHjKSgaUvOpSST3AJGP0DSAmhM+kh24FhxCyOtE2uakmzUVuyT/ACx9iMuv0BCmxeTUX+efUhSrpH0QED6Yq4zpRS6ktoha1xjoUk3BuLdfrgtyojxmbaPCQLtRoWtQ7X1ISm/0ScDsO3J9IdBu4mRI6MlUWTVXE/eFQek+Ep0QCxcdB0AW9LpUsnsm59MX2WMvGiNuyZjpm1qUQuZMV1UrshPohN7Ae1+uIdIgmr5sqlVfVrj0+Q9Ap7IPlbsr8Zz+0VlSb+icHisqVUUSLVhEW5BkurabcbSSdSfUDpexsenlOEHsx1PJieoYk7F6CR4TxQsHoMNLKWdmYMAxX2Oagr160OBCugFvMlQI2vaw33wpVa4rymlpKHEKKVJULEEdsSo01aFCxOMZI5Em2Ui0YMaub+MdMyyxEjqS9eSkxjLeKQlpomwKuuopUpAvtYLBtZs2oIERzMldYhJWEuOr3UeiQNz/ACBwvs705zMuXHYrZb8Wj8SMp4XTrsQUqHdK0lSFD91RwMcM+MLeUHGI9UkPsiIospfWkuPwiNi0+ACSkdEvWsU217jUo5rN9e5eo6iBr0vh5xOjeMfBuj1PJcaDPiOrjHTodUdLiHBcpebULaVA+m3Y3GOPcz5WzPwsZlKkx0ZjoagdTzbAcbcTbYSWD8Hu4i6R122x13m/jJV+IeX6d4SdTJURsfhPNjmNLTa1wps7m9u9sBzaXCndXPkKHmKEnzbb2HW1r/S+BJqW0xwOV9DH61YDkxBZdb8fAy02zVXqgy1JU8qmqfS61ZbTzZ8K8oghCUu25a1KJ0CxBJGHLwtrqJmVotLkJVGrFFabp86I4kpWhaEhKV2PVDiQFpUNiFbHY4X+c+CcmS9KrOS4Ljk0IVJm0OMn8KYlIJWtAH7N21yCLBR26kYF8t8TDWqhRpFITIq9ZpyCS/GAPMpwSXH4z9yNSgAVNpBKw4LAALNm7a11leU7fkYyD2M6jnS2tLbMLmBhKUrJeSjXzClOvcDcXGwPb645q+0CzJjZ8fEVLJMmkRHXS8sptolvC4sDc+YbXHTHaNK4TIqLdMqkCsxajRpbbUpp4IILzKwFJIAuN0kd++OZftuR4dN4vxWIUduK3/RdlxSGkBIKjPdF7DboB+mJns7jUFfgZ6xPLn5TKew20zxAqxnvQ3k5KiVRot6TzZDfiWADe+5IaTt7YU2casaC9HyyYzq4NPolOi1RTZSCpkhyToupSb6zIa1JG5S0R+be7qWbHZjj9DpkGRVFPUSn06b4ZbYU2oTUywgBak6ypCQLJ384xFp0NPE/iZLbSlxlifV3n30ymy243HjK8O0laTukpSylRB6aDfFtBsJdhDvWGyB3hNlbJVXzaKG7RfEwc7VVTxpwaWho06ktpKZLjmoEArKtCBsQ4oFJGkEGDlIcybNNBcjCnOwEJR4MEEtptdJ263G+rv1wzOEFEmROHObOINLjFVZrMR1dFYU1qU1BjoWmG2E99ZHNI/MXR1thPplvViU9VpU1dRmS7LemPG612AAHsAAAEiwFrWBviW9xtcjsP1id6LXhVhoOIoypTG1ahrkOJa8x+FG6nV/3WUun6W74KHOJTT1PbepynUvSmEaXXUaFstFGzaR1CjqOtXUqKrWHxco5pznHr+YjEiF+oxojiYxbgp5iVDUFvkruEC4SGhdXQrPQ4KIdYzjnaaY1HhCG0fjcjJEhbQ2JLjigGWtt99WGfBcIB0k8aFbCGAhZn3O7eW4CnS8FVB8FESP1U4s7A2/dB3J9BbqQCuabQ6hVHXkNzjT8twoTMOdVVJU2HioF1d3CBbUt0JIT5lKaG9tjYN0ijUrMMVcOV/TeqlSkVKPT5ClxkDSSnmT1ApKgqwKGr2BO3bDy4ccPqtxEmMJlu0ORHgaXY1DfZdZgRySUhSQ2oLcWNZuV3Hsm98dQLUAq9THGavSIQ3J9Is8msQc2USnZdpEByLRI5bk11TiNIedSdTMJBsCpsKCXlnvZtJtuMOSmQNchOrbUe+LKMim0LMrX3nJYq7fOU9M8GCG9alKUUp9UgkfDtYWBPXBHxVzPSqlWqeulyoz0dmA2F8kpHKJWtQQodUkJ07G1gRtvifcDYCfSIW6l7WAx2jDyFlMqlIjw5TTcltpuQ69Yk6CUkJTtboRc367Wt1pM75ebiIm89xsT4ykpeDSToWSNlAkAAnqbX+mBjhzxhjltptUl2I8GubDfSm/OjaiOYoXFm1K5gbubqstVilKVDTnrNv3vTHeQy6wy8rSuYNluuBFtV+gNiTYX3JNzglopWgL3k5a7A49YEViMfGiWQCGkKQlNraQbE/4D9Ma2itBQVpU0ogKAULHFcJ09xwGRLQ8lJ2CGgnVve6tzf6WHtizqtferT7S3G0N6E6bI773/AP0YgspBA7T6NTxLmmVl2LUUS3SqQvodStyLW649SZPjZjr+gN8xWrSDgTbzPT2UyfES24yoyih1DytKk+hseoI3Fut8WdPzBTpkeM6zNYWmT+xHMAU4bE2Ave+246ixwM1EHcBCgwljpZVDFm3TJUuwKd0W9Pngkbbk16Elp4KiORXmn2XQ3dJWhWpIUk7KFwNsCkOpvRVNFDh0tq1pQfhv8sXdOzHOm1Fhoup0rcF0hA6el+uErEfqvaEGO8eGQs4O5vhT/FxkRajAkeHkIaUShR0pUFovvpIV3vY33OCbHPFRkS8lCqV6n5ikUx5wB1TD3LVGfUlNkIU2U3NwLeU6vTfD8os16p0SmzJDBjPyYrT7jJv+GpSAop39CbfTFrTXi5cjrPEESXa+PPQ49Ywi+HczMwHbGXx80HGabdcezPT7fHwXKgB3NsZpwBcQuI5ofjKNQ2HajmXka0ttthTcXV8CnVKKUg9SE3JNgbWwN3CDcxnesB831pviRmeK7HblvZUiBbSlvPFhl2QhwEPIQFAuJBTYFYttceuByr1wrlS0+V9lSrICxsB0/wDfzxZVOnIo2VIsNDroCVAkOqSVLJJUQdO3Uk2G3pgFmy106pU2YYbtRisOKU/GZ067aCErAJAVpJvpv79sfP5/EubD9J08cSfUKtIqDTTbzmtLfw7AdrXP6YCHanV8z5kl0LLaIjaqelBqNTnpWtlhSxqS0htJBcc0+Y+YJSLXNyASefXqROLj7Ul6C+4Cvwc2KttY3IABAKe1+vfC9/om5TpNQfo2Y63RBPkrlyG4chCm1uqtdVnEKt0A2tYADDlCjB7HtnpBtBvixHl056itV2suKhiVZTgoi0qfuk6g2gqc1EAfFoJTa6SDuYlOzCJrK5bMRxFJdSn7tVJcJfeRaxcUg30oO2kE6iN8Ts1ZbFLy7mCrrk1KuV1NNkNszJzqpDyNTahpbSAEpuSL6QDtiBSs85ZREpn9GokvNtdZgR2GIjDK0xIy0NpRrdeUAAARuAT6DFRULVKo8x+wi5XMGRmd+dOrUQwp657D/hIEKFEWec7pF1uvKSUNpBUm42IAJPUYq8sVCpOZeiZbiSC/m9a5DU5+QSsQtLy9TrncbadCe+1thhr5TpDlCpK25L6JU6Q+5Kmvtpslb61ErsOwHwi/QJHyx8bzBRJM6UIsqM48lsOSHWFJUAAdI1LHW1+h6C/QYaDqCQq9Jjb6RZPwK1mSBT8sJor1FciRkQqrUF6RGU2kAamFAkuKcTt/DffcYN4dQEZ1cGKhRVGQnW20CotItZOq3QW6X62wQxZcSotlyLIZlIBsVNOBdj72xTim1fL9dqFVy3IgByopbEqHUkL5a1tpKULQpBuk6TYixBxxnyMAY/mDasNwZEqVfadirYlLK2nE2KEm5I7EW3HqD2IBwAwo1QmVeQ1BKpNad1PeDNkGsIG5W32EtKdlI2DqU6h5goYJKzGqWW41Wcr8RdYlVVLT8ObRaetTDT4WrXG1bhNkFCjqIJC7nqMD9LoNQzPFrMl2EIcOjOs89DrmqRrWApCkFB8hTdJve49sOVEVqS3uzyV+H1HErf6cUcrLbskxHOim5bK2VJPoQoCxxS1J6lvJlIj1KgVCFIcMhdPqEhKNDh+JbLqTqQSd7aTuSdiTgu8DOCbR8wVyOLbDx63bf+Lqx4MCrpsr+kkty3aTDhuj/eZvhlHqrO5DDoa05BIgJEzVFy3V6fVIlTkQJ9MfEyNT5MlubHe0ghTSX06lALQVostQuFkWxacUcrxMr1yeqlHxFGzIiDUaKSoJb8M68l5beo9DqI1X6E27WwQGNXGFamq6woju5SI4/wCEJxtjQI2a8it8P6rOYiZip89U7KtRmNBEZ8LVzHIiibpCg4VkIUfMlzy3IAw0loLArG1aqwbAeYFGXMZU0qbSJrLC1AKejBEoJBO5s2rUf0wQGHknMFLmw4mZNFRcaUmOideG4l63kUEuBJNlaTtfpj3l3LtYrsyTAdo+UKbmKESZFMdhuxX7A25iFhSgtH8QG3QgHbFnVcoVptlSankp6VGGylU6YzNT8+UsNr/QHHrGTdjdg/OL/h6Qcg4Mr+JVZjf0iypxAl6kU6rU5MuTHQm6XZTbalpbV8pLbqdu5SO+LLg3Ql+Flu1GOl0uNFL3NTdLjrhK3evXe9/niHSsuNZr4WZvy0y26hdAmpmwmJMZbDjMeSQbaFpBARKR8rObHfErJ/GZ16nRnMxwEMtLGkz6elTjbSxspDre60FJBBUNQ2vtgdwc1FKuSP07QmoQvtYdITUqm0DhvnKE8ph2LQcwR3aFUA2HX9Di7OxFpQNR2eaCbJH+k6Yj8GazGYzHmGjMqSpmUr7zjOaSnXuGnwLgXstKFf8AzCcXeZKezm7KshuDLSpbyEOwZcVeuz6VJWytCk3uQ4EWA+WBDiBWVty8ucRYsd1h9xJqEuKEnU26m7NTjkeqVJeWAf3EYVrHj1lG948fXtPJ/kqK9xzGJxUajoy5TnF1ebAfTVoBbjU4JLzwElsqcQAgrKkAXTYgalJ2JIGKLiRTkDOlMEfKdaaRLpq22matWVNSXVNrSsuKWXlqSdJI5aynr8Ittoz1nyWuBS2adNpdPpLuYIDL1WXZT90BM1CgVfhpbSNC/PfUpXSwwH8SsxQarmPL0pcutV9CXyl9+Wp5vnBaNA5RIbRbUpPwbbDDOkrZFVfnI7VM77oRcMq2MmcKJxntlk5edltyGOYFqSAsuITdJIJKVoAsd7j1wK5tKxAYy3UbKnvsO5hzO/e1iUhRZv6JTyoyR6Bw++PuU3G6xnlmlMpeboLaBVqtDkpWVKTFUFsJ1LJuFuuNpO5uEgdsUDtUXX5VQrb6xIRUZi5TiR1ebYc0MNq9lPcx331Iv0wZKgljN3PP8fuZWqQivPc8SG/DTAbjuS5ZhwWKRHjS4kZR58zZNmjtqSNY0hI3USex3OMscHc11SsU2UaFHnyZDYbjQ/GpQ1TUrGhKCkp+L4SpSSqwJSLAWO3hzklusZ8ygqpnmsSajIQt71lGDIWg+4SUAgemn0x1WGc2spfltGJAMSP4dClLCUqQBfWk7hNviuSkA/LCms1jUkInUwN2T5VEX1W+xf8A9GKaVUs314ZnbfQEmI01yGGZAGo3sdTqR2JsOtx0wnOITEWpcRW0sqQ5BoQ5hu3bTIcSA0yT35aLu27EtDqcNriX9o2tZzy0zTqLUGKsac240vMk1JELn2N0xwADKd2SnUAW02uSdxhCU1lOe5jOWqM+9BpbKFy6zU3lgSGkknmFxZ2D7igofwgEjYJxupHLm+zgY+0Fp6tnnftAV55D1XlJ5LVZqSnlvlh0HwkZZX5Fu2/aFKAlISeukEJtZaiGl5YelOPyOauZOdsZEl43W6q1h8gB0SNgNgMGULhAw+tbeV6lTPunnK0oUpa3GhsVX66j7m17i+NGXVfdtYfiKQpaEvqQg9FbEjf3w4dQr8VmJ6q1sEjgT3TeGVVnsILMVx90j9mygrV89seGqB/Rx6QuoqTDUkWSp8hAB3v1747k4XZBYrzqKIipPUqJDp8aa6mAoIdkuutocKlK7hJXYA9LJ9VXWvHijR2aFWY82W3UHaLPaYaqLu63GltruhaupKShJFztZQG22BsWK89J80urYsM9DOPJdWbq9RfdjNKERICEvLSUl1W9yEne1rC5tfGtc+PT2C48h1YUbENtKWRsdyE7gf8APEyrR3DzVRtDiiCpslXlPpuO2LSo8NcxROHNCzS2iFVKPXmwyzKbdSyWX1hQLTjaze4KVWUkkEDtcY3lFA3GX60LjKjpKPK771PpUgOmSw2464Y7aAsvoaJ8t9N1A9TbsLYLchT51TgS0THHZIjvlpmW8yWlPIsCCQQNwSUkgb2vj7TcryaPXacgXLMdpGt4G4Kko0qG/qofoce15hrtUfqLcCPBXGQ+uOzMU6UlFrXVp31Wv274UsPiZCw6KzHAEuqnTI9Xp0mFJbDkeQ2ppaT6EWOKDLL5qnCqEJ4VMmZSdeotaZFy4qCTZK7WvZKeUoEflbXbfDWo32fc81qiUiVSKzSqhTaiwhzx83W0/FKhZy6AkhelWq24O29sKdmFN4fZjRmjLLUqtREpcYqsK3NdnwkqUrnAb/iISNW22kEdMAqZXBRWyRLGnqsobLjgyizvTG1lqJNbC5LzRSmWi3Lnt28rot/pLWKrdT5hsRgNbDsaPEQ+OZzFFhTnqQDYn5hP6nD0q+S6RXqCxLpD6JuVqgkSYnKOlUNZJILZ7JuSNJ3Sq46EgK+t5clw9MKRpLjchp1D4Fg4lKwT8lWBBGH9PerDbnkRqxCDmA3PVEZadUSXYMkNrPcoJCST80Lv9MOfJEcVei5spLik6pdKFQjp2/axnAo29+Ut/wCgwoq1FSH64gDyqjldv4hrF/5DDS4SzW4mc8oF7dqVLXTl36aZGqOb/R04dfkAiSdWpNDH05+028PoZqnD7ijRkN8x5ymxaogablJiyLOH6IdI/XCbMldLqoeacLK3Up5ToP7N5BJQb9r3/VOGfkzN6uHOe35MmKZ8BKn6XUoSVaS/HdRZxIPQK3uPdAxA4mcOYmW4sCuUWpIreVaqpYhyynQ6haCCpl5B+FxNx7G1xscGrbBx6ycrbbmVuj8j7SDxqgtzc0t5hiAJh5jprVUaSnohbw/FT/deDo/u4AoqV1FuG23cl0tN2HYXAI+gB/Q4Y1WdTWOCmX3T5pFBqsylL9Qy7pktD5DU4BgIy6jw1fZaUkBJUqQ16X0kLHzuoH+8cNJ0xDaZiKdp7ZH2ju+zLEUtGccxFGkSqqILKz3RHQBt7FSz+hx13krKszMghz3G0pprhJWvWnzWO4ABuDfbtjnb7OFMX/0AZckljQqWqXL1fvky3gT79LfTHRHAzMnKmyqK8vyPDxEcH98DzD6jf+6cfn/tVy9tjr2M+q0aLhQ0MeLyuXw+qIAvqUynpe34qf8AljnbVYE+2OguNThayI8B1ckNJ/mT/ljnparJJ9dsTtL/AMZJj2p9/AlvxE+zDOjTq3mOk5niwaTMcXUHY0qIpx9t1w3UhCgoJUFLO17Wv3thE5fkPSqJGfkOcx1SSVqItY3Nx9On0x2vxaqhi8PYTQNjNWygfIJK/wDFKf1wuqP9lPLmZafCqi6nVae3OHiJlPiuo5LpUrV5dSSUXFr2Pc4do1oCf5z8uJG1mgDN/hHznQGbIEWp5WrMObHblw5EJ5p5h5OpDiCggpI7g4/J/OOSn+GctqIpa5OVZ6i3EkLupcRxW4ZWf3TvpV7et7/rJmZzl5aq6/3Ybyv0bUf8scPZmy3EzZlydR5iAqNLZLaifyHqFj3SQFfTGf8A4/qGo3ZPlyIX2iocgGc9VWmOZtYVOhIL1ZjNhNRhpHnc0iwkNp/MCANVtwq56YDVKXFWXWxdaf2iP3gO3zHb9MXEZiVJo/4i3Y1doz64r7jJLbqHGza4I36W37i+LN8yM25Sk1WUtD9VpLzbMuQhAQp9h3Vy3FgADUFpKCbbhScfpGARPnEc1cN0/SaKTJRJZQEndFltLT2Fu2JlWdiVemlcoNpehqK1tPC42F7WPUEWtgZoryokhSB8KTrR8idx+v8AiMX8hCFSmngNnElCgehHXf8AnhJk2vmPFQ0HlcymV6OI6giLPWIrrQISgLI8ivQE20n6YI6zJl0WE1luoMIiLpUmQ7KCFhWt4qOokjY6UJSgddgcC+bgpEdQR8YWhabeoWkj/DF3xXrUavVKpVOEpKm6gxGXdB/0jjLQWPnrUr64dB3YiLKTYoxxB2iutKqlNE2OuTHdX4mS0hwoUrWTsD81E/JOLihrjS6jKlw2FR40h9am2lr1qQgeQAnv0virgpH37LcsA3DZSVfRKjb/AHxi4ygwUU2NqFlBhF/mQCf54zafLGqx/kmiftmkH96Mv+Sm/wD844cnD5lIpOaNSdk0FY+RLzA/xIwm3lJkZqaSD0jufzcQB/wnDryk0UZczm8nYNU+M2SNvjmsC38jifccACc1P/CfmP1iwdcNQzbWHuojttRUfMkqV/iMWMvQ1W6Sj90kD6NrxCynHVMkVaXa6XKi5cn0TZA/4cWmbKe7SnKVU16S2peoJF7gFCkC/wAytOBM2GCykAcZlGhANffvusttD3sVuYmtwnnJlaQ454fTMIUs/lSG0X/w6npiJUz935miulPlkMWR7rQrUB8yFL/TB8zlePXcx1Np5vxUWaWp6G9Wy0qQlO9juApFzfbcXxyywIMmeVS3EseFMmBNzZBEJxUaG3THqdDmuBQQJC2nLvdPhC1pGv2v2wU02LmXMmdv+jLI0BpnM0ZtsVStrcS9EpMcoSQ6laSQtRSoaU7HUbWuDbRWXU8OY0dmlQzWM4VlaYdHpTCPMtw2AskdEJNiomw2t8nH9lHL7nCBNcoFXcD1fqRdlVCabKU7Mb1FSdQ/KBqAttdJP5sR9TeFrN2MnsD+vynqNL4duQeD1gTknItLyDTnIdPC33nllyVUJB1Py3Lm7jiu5Nzt0F++5JEBfGpCvKm5ubdcY86WIzzobceLaCrlti6l2HwpHqeg97YkszWnLHJMf4A4k6n056qTmIcZHMkPrDbaPUn/AC9fa+OlctZXYynQI9PY8ykDU673cWeqv8h7AY5H4ecfoVDj1Srs0ov1qKhlpiK8ouIb5jqeaXOUFLbUhnWpWpIA0qBN9i26X9rSg1SrPsPQXGYTNMVLW43IDrqJCGXnnGFI0gWLbCyhzVZWxsAtJwlqtJqn4VeBO1amkdW5jkKPNibHHTAxkvO1Mzxl6lVeItUZNR5iW4sopQ8HG1KQ83pBOpSFIUFaSQLX6YIajPZoNFqNVkbRqfGdlu+6G0lSv5A/piaEdXFbDmNNYCuQZ+b32i8xKrlf4wZgisqdcdr7VLZSN9TcJLbKiPYlLpOBWlxuUyy0COgFwLXJ3J+pJON8urCl8NKLPq7oRJqXOq0ohBUpx19ZdNgNyfxD9AcU1PrcmqzVJo6YcplgtlS3HjZaiNWkKSFWsLA3B3PTH6wqiusJ2E+OUNe7FRnJj6yk2pmCkLcCk2uLdAAMGnESC1E+zBnqKwhDSFmnJ0oTYXVObJ29yScL3hNXkZqpKZHKXHWVFtTDigrQUFTarG1iLoO4wzeITZe4D5piN2UHKnRmu2yVT2RiFrAfFQfGUdASpcGdqL/aL/tH/HC0zQ1y8wy9Nh5gr6lIJwaZyzTTsj5dqNeqrrjVOhjmOrabLigCoJFkgEncjC7czPTM5KTWaRJEunygC27pKTdI0rSpJAKVJUlSSkgEFJB6Y+GKNy2OJeDDp3hDlCpvuVmOw46442G1oSlSyQna+wJ9sZxj4oUzg/kibmOpoMkNrbZjQW3ENuy3lrCEtoKu/muTvZIUSNsVuXXvD12EsnSC4Ek/2gU/545M/wDpDM0sJ4r5dgteJnPUeiOSH4bTZdQy4+8A0dKRdC1BpVyT8Om1gTd7Q6b8VqAjdOsBfaaayw6xQZpzKrjBnGr1KvTHotRlyG3ZKKWSzFaXoADSV7rVpQEAkm24sB0wX5dyzRcrusBuixHWHnR4nxADji2/zHUoKUrqB1PXCWy5MRAfpcZAW87NC5LrunSgFV1kkfM2tgwXUnMwQq5mCM64HKYyWoUhCi3oTZKisgnSsFSu4IKUDbvj6LU02OdisQs+dG+1/UxlZ34Z07KrTOZcpMOLyLUF8iewVkmnSFuEJ0oO6WlFSUkAnSq3QHFlw1oxXmmTNIIGhLQ9gErUf8U4lZ54PZfyjweqVfpbsil1SBMgRllt4qTU1OzGwUyUquF2JDgI3BQOwtgiyRGQzQatNRuUQ5Eq9+lhYfyGFd7CjBbd2zPoa0NbYftzGx9m/KFGzLwRok+p0tiW7KmVCUHHU+Y6pr1txY2sB7e2HO3CjsQ0RWo7TcVsAJZSgBIHy6YoeDGVV5a4N5KgcpSCikx3FjTb8RxAcXceupasGkijSGoZfKbJ06vpiFaXaxjicYptz3nJnGOmppfEOoaU6G5AbfTt11JAUf8AaCsV/Dx2Mc95ealMpkRnZzDLjS06kqSpYTYg/PBd9oGEpzNdMdAvrhhs/RxZ/wDNilTwmzCxlpvMbcJ0QknmIfTsRY7KHcC464rVsDUMyWK2ZiVE1cY00OHnWTDy0kohsAIe0ua2+bc6ggnew2HU7g4SecuFFQzFLXXKZATNWsBDzCJPhn+YkWS8y4dgQmyVJUQkgJ62thk0Whycw1mJS4aNUqS6GkC3Qnqr5AAqPsk46qreVMsZUyUDNp7T0Kkx7oWLoWsjtqFiStR7k7q6YJ+JOkKhOSZpazZlugn5nMZezjk6pPrj0quxpI8ypMGOpDguBYuKYC47vW34gA9cN7g19qapUOo8qZTqTmoMAokNtJTCqKU/mKgbtK2uLANg+uHnw3iuz1y6s4jlxnFlpFj5dVwpQF+wBT+uGhVuDGTOLWR2oeY6IxJfussVJkcmbGXqNltPJ8ySPS5SbC4UNsFt9pU2Hw70+s6iZ5EsODmdclZ2or0vKKWoq2SG5kFbHJlxVnol1HUex3Sq3lKhjibj5kZ3g1x6qL9OfXEo8gJrVPiobTy0NOuEP2VbV+HI8wTewStA6YqJjOdvs+8ahTKXU23p0FRNPrMts2qcValBLLzabJ0qcSULVeyVhK0gEgYf/wBqaNT+MHAfJXEmnBUdlh9kSNCiHERpZEd9hShuCh8shXoWlYZor/C3Ao2a34/iZtO9DjqIRfZO4kQpdIzNlFySw0xQNNTiAOpJYgP6lqQrfy8l1LyAD+Qt+1+L+JWYqjxbzXKzNVKhUxJqAWYSGHG20Rqfz1rishBbIVZKgo6t7lVzjTAzVVckZXQuioagyKmmRlOoFCQm8eZZK19PiC2bgk3GrrvjapTEmtOssup8lkJY1DUhCRYbdbf88P1ULU7Wr1M0MvtBkngYkOViHOlPLmlEt2fLkrtqLbJJBVpAAs20kWsOmLLKTVby/QZc+t0SXT/6UxmoUOvsLbfhxlzXEhxb7iFEsKAkvKs4BvYdcacrZUpGaK9UUyoLa0NpRGUY5U2pZUkqXdSCknZYBubW2w6OIlZiZO4KvOJhGWZNepsVEJlQSqQG32ny2D08yGljf1wpdePF2YyWxKS1YrLZ6R58VOK+XPs/ZSpkMsLmTFtpg0ahxSEuyA2gAC52Q2hIGpw7DpudscZ5jnZg4tZvM6vmEYMp9th1mAkxqZTnlqPLS8v/AEuroVrv5tiE6rCZApNc4v54qtVr1XbFQW2ZVbri1WjUqInzeHZv8CEgn3N9RNyVJtc0QplUpFIiN0GVQ+FTul2lMSEhP3q6CopkSx18wQVttq2tZVr6UpHTVXph1y3c/wARFjxvbp2kRpjLlMbLNCiJzlJZOgzFFUWjNKH7gT+JJA9U2Qf3sbqlS5eZkpRX6k7UYaTqRSYyBEpzXeyY7dgof96Vn3xX1XNlPoshEFIXKn2umBDRrcA7XGwQPQqKRjXTs1VmqMU6TEyrJXEqElcOPIkzo7KS8kOFSFEqISQGnOp/KcdItPIEWay23yqMD4QjpioobS1EDaG2yUBtpIARY2I0jp0ODTJ1fmUXM9CciOltxdRjMKIAN0LdShY6HqkqGF5Jy1WE1NmXIlZVpDyxoShTy57xVfty0oSVdrBZ9sfJi41AqEQVR3OeYZoKX0RINMXSIjZG6VKeWEuDpsUuK+WBis7g3WD/AAruMOMQmq+codNkoYdk8yc8fwoUZCnpLpPZDSAVq+gOKyoyjTJ78WuxiZc5wTE5TbeSZD9m22wqe4glMePZtBKL613033KMVcOvOR47jdMbj5DornllSaHEdckLSdiHqi62CVHshscxR2QScbsm5UbpDEqX4Pwsie8pzlO7uoa1HlocUSSpdiCokm6id7WxxgtKknqZvZXSOOTCun1uPRoz0ydOZcmS18+XLVZsOrsAAlPQJSkJQhI+FKQOt7yYHEH+kEWNEHjWoq1rXH5rJDTmxJUFWt0SepwrZMVusLQ3FjNNv1KStttwIF22QTdY228iQfmr1OD1+jsvMRmgp1jwtuQthwoW3tp2I9tsJ2oo5bqYMrjkwiLwbQpxwhttAKlKWQAAOpJPQYr6zmNFKYSGNLsl1suI1HyIQOriz2SP5/qRVnLLEQttuGc2wspdMZ51XLdPULUFbqBNjsQD74pqclWbqlz1+aLJeUtYV0LDR0oQPZSiFH1BVgC1qfMeghUAPWX2UaQh9o1Sa0JEmQrmtOSGwXAnss3GxV1sLWGkdsFECNDhTVyWoUdt9y+p5DKQs+vmAvisq9YZocbmuDmOLJS0yi11qte3sANyT0GNOVJkmbFkVapSUsxnRdpsjQ222Pz7779iT0t62wJgXBY9J088w9p4XPksMNka3VBKSTtc4tEQnm5i4yLuPNqKTy7ncdTgYg57plTjCFTaXNWtsoQuWpjShCj03+K59wLd8FEHM8iJD8OiGy29Yp8QEHWb9SffEx1s9JvMJqfIiVeAzAq8VEhpflSp1OoKPr7H3wzuElaXMTXKO/Pelu02WAwmUSXkx1NpIuo7rTr5iQrf4bE4S8OrqUmA0tlKmWFAkD4l7/8AvbBRVxHiByuCqyaBNEbQmY3ILWkC6glSb6Vi/wCUg3wCqz8PZg9DDDkToDl++MKLd8UmQKvOzDkih1Ops8ioSojbr6NOkaiOtu1xY298EGjF0TWJoKDjyRbEgt48KQL47mexNO2FtmrhrVH8zTa3QKjEacqAb8ZEqLK1NlaEhCXEKQQQdISCCCDpvthm8u2PhaPXAXAddrDiexOdsx07MWW01GLWqFOzAjUXos+ixAtsIKBqSU6ypBSrUPMSVDfe+BPnUaU5Gaj1dL7sh1LKW22FqKFq2Act8Bvt5rY6xKCPl2xV5iy3Ts00l6m1OMJMR4hSkaighQIUlQUkhSVAgEEEEEdcJnTqPd4nChac0yMnz0uuIMVTzafzAXSRe3+R2wv8ws5hYk6YtOjwEIGu8pzVz7flRb4Qf3lfK2Ogc7cIHMu0ZVYy1Lr0+pxXGlORHJ5fVJYDg5iEpXsVaSogCx6+uBRVFzTnGUioRsnSXKPGHLMWrEQpT6zfztpcIslNh8RF9W17Y4niI3IzBFT0iHpmbHGVvIqSSG2yEqfSyQpg/uvIF9I62WPIR3xNzNQmcx0dJjONokNgriSWyLX2Om4/Kq1jb546Fyh9nyPW4c+dmqnKo1RdUUQGoMwKehNWG5cF0qUTfynWix3BJ2W+dPst5py9NdmZbV94MqVfm0xSGHTbu7FcPKUT6tqBPZIxTQqSCvBnjVnkRZ8PoS63XItDprCWl1JSyxGeWEht9IUXGbnudC7Ancg+ovKzhwdzdHgz80f0alwqfRWuXPElsNF+MTdS20dVBv4if3dXXEWZBrn9KHphjxqPUYiGX3BGbdjPMyWikIeXHdutskBF7XSrRf8AMcdzcOM507ipkONU+S3/AFhtUaoQevLeA0utKHpuSD3SpJ6HBrHapg4+sL4IzmfnLJZeojjUmOUNrhlKkgqIQtg9QSOqdJJ72IvjsLgt9nGVTaw9mDOzdLmlcQxodMYtKZSlZBU6tSkgFRAAFhsCTffHOmdcrf0Qn1XK8lPNVl+Uqm3WN3oTg5kRZ9fw1BN/VJx1x9lrO6858IKY3KcLlToq1UmWVG5JasGlf3mlNH5k4JqGJr3Cb8Nd2cQJ+1rlen0Hh1lNqlwmKfBi1ko5MZpLaEhcWQTsB1KgnfHNfDajV+pZizVCoGWnM0xqhCYXOiszGYzjKklbaFAuqAUCNjbcEJ2N8difaqhomcLUcwX5dUilN/VRU3/gs4Qn2S6R99ZwzrATIciql5e5IfaPnbKnSkKHuNVx8sDQ7tO24TzpuGIsqjT4KWIkV2jmk1iItbdQYTKTJSFJJTbmpJQ5cgG6dt7GxFsLqr5ipqYdSdTIcdzMJbzaKK2wrUEpWUNgAJOxSEuFXQ6jh1Zz4a1nhbEUqvQUsR2nG2hJZeStt5KnEthxIBKgLkGygCP54Wec8zKokBmoNKhRg5KTGHjCVLCCLFaGkkKdINrpBuL+2CUctgDMkshB5Eoqcp2Zk373ZeEuap1CFRA2UpbUVBBa6agoarkq/QDGupMQpq2qRWYraPGMB1KH3EhCiFAFCVA/GDpO2/pj7XJNRqL8KTCfX4d5wGVLpMR+nSVJSlWguMv6g4kL0G4INgQQRsLOhUOrcQ6hUaA85DVUmUoWjm3bCoykoBdHUlQVrvpGxAsALYext82f5EDtOeJ4kstyIFPp+ap77D0R1KaNnRraTBUdktSz+Zsmyeadt7OAjfBrl3Pc2nVhWW85R2qbXEeVmW2QI082v5N/K5psrRcgjdJIx54mQolJnxacmncpqdHecWsrK2FBK0JLdlJ6kOXN+w272D6HT/vPLlToGYYyqjlmnuiNCqshpT6oALaHAzJSBrUwNfkdG7ZTZRCcZUrqq/8AIP78P4lBG8TyWe96xiZqqDGWqrTcyvoKqa0hdLrCbbGnSCELXb/snOW6PTSrCngZKq1N4rVHLMNiFO8aXX40GQ54dch9Fi62y+PKla0jmJCwUK81rHc1cPJlSFCbMRdWRTZwkoW/TJq34vJCw3ZTalFNjqUNgbgAhIubba7IrTLsN8VF1T1DZjeGqrsZSJEeQ1cMqdGhBCQlCUqUpPmSo3VhymvwhtDZ/vEbRWWvH2kqgu1fhvmZ6tZdZCXYD+mo0GrMKaDLh2s61e7S7fC8i4V184wQN5ipPESfm+nU1tyK+sJzOzS5KbORnrBqcz6KSohDoUm6Vc1R6hQD9hRKD9qThzTszwSii5wiIMVclAClw5Cf2sV9H+kYUd9J/KpKkkHzY5amVJeRc7R68GGmqnlqepipQmHQ8A0bpkNah8aC2VqTfukXsoKxiqwXFgRhxwfn2+c1WAGDfeXXC3K1LzU05T5LnhqllsBllxEdpbsqK4dTCip1CknQhJaF0lQ03ChcWsuOmQYFJTSZJbcmaro/rzy5KRYIsEhwqAAHZNgLdMBvECqHJOeG51BlzokGTzoLdQYiiz8dZLjBbLqbK/EbKdQB2Xte+JvFKn0NjKtJzBUhPrrzsZD16pMcklalpRpbShR5ablQFkoA3w0m83K5bg9ohcoRiggzEqLOW8iZxq8NiPDfnPt0mGY6ENJIbAufKLbyH0gn0a9jipok1UViPSpMJyBJi8qOWlELStCErUlaFjZSSUD3vscWWcsthiiZfyW0hAdjU92RJTayQ+UEq26WD8i4/wC7HpitaqrlVj0CrLdhPpdcShfh0KBZLid0qupXRegdsUFw6k+p/wDybsOx1T0E6U4CJbo+XKxn/NAbgZapYcjUqQ+BYKStbcp4AXKlqWhDSdtXl0JHmNxvPXFuTxBW+/W2PCZTbQVx6IqQlDa7G/MqCgQVHSQoMjyC9lFSkqGFIjOFTk5NpjNSfU5QqbJmyKNTGiEpdLsl54S3Qq29nQEqPlQnzdVXw1Ps+cIG+Imc5dYqtQTW8u0NpEl4NcvwRmqsWmyRfmJbQFrIUdiW7ne2JtlFdLNqLDk9vh8vjODjiCOVaTUONmc/u9+ZKo1GYYW8VJa5Uh1pHJshlBSAw2oPoIVpva9gOuOgKDkKj5Pg+Co9OZgRvzNtpvrNrXUTuo7bkkk9zgG4GyJeas/5hzCpta25MIyAodEpmSnHGUE+oajti3oMHuZeJmU8rqcaqFfhJlINlQo7niJV/wDuG9Tn+7iZrXue0VVg4x0hQAw5iazRPZyDxGqcuDTY7bcCM25yQCkOBxKlOLBB2NrpFttiLYvuIDEGh1SJNiMxWp0rmOOqcJQlCEgFUhz91CR1PdRAG5GK7P8AnvKeYHo9SVQKlJLSQnxc5xNKirQF6gl3nEOFIVc2Dd9yB1xs4aZdVxOlu5irS/vCjKdC0JcRZFTcSfKdBG0Zs3DaPzqClqJ2u2qGtRbaMYHPxiL6cOCp6GNLL3HGnTKDT2X4tQbjR0J5MmK+I0p8BOlK3QUqFrX0pFilJsb74D+I/E9mvU9umU9jwNMbcLykrc5rz7tiAtxYCQbAkAAAAKPUknFFnXglDpLLblPrFUix1uKLLPMC0R1fEm1xdSdiAk4X1Yy7XcvtplvSjW4hJS8iLE0raHZYSCSoXuDbpfG0sS3BUyCfZorbOIOVSiRZT0hESU7DJN1tMvEti++6OgB+gx0L9nXNtLzhlpOVM2QmHsv1s8kN/C2zJQotoWjugK0AAg7EI7Xv5+zlwDp+dotfztnjKri6IxC00pipB1hUlSdS1vFAKSUWCUjVsbnbbFPKy+aEwy6xGLNIfWpqOpA0obdSlKltJt02UFAe59DYGouS4GkHkfrPo9JU+n22N0PaN/M/2S8t0vKtekmp1qrrjxVvw40+UOWwUeY/AlKlHSlSfMdtRwjYtPjQY6GIzSWWUCyUIFgMdccKM5p4nZFk06UsKrUdhUWUD8TySkpS6B6EbE9AoH1GOTktKZGhYIWNlg9lDYj9cTNJZaSyWnkStelahXqGMx4ZF4hCg/Z4zG5r0yKSt2JHB6lT9i1b++6r/YOAbgNDWniVltpCNSY6HVKv2CWFi5+pH64DUF95KY3PV4NTiXXI9/K4tAUGyflzF/rh1fZzoMhOeKk89EcacZgaAHWylV1rQQbH2QrGrEFNdjDvOLZ4jordoAcZ+G0jgZmUZgy+0lfD7MExLNTpq7papEx1QSl9uwOllxVgsWICjsN06VznOiy4ExtiqRjFMVwvJSp0O60228w2sN/fYXx3znHJ1PzXliqUOttB+m1OMuLIZ03JQoWJ9iOoPYgHtj86a5Us2mhT8tV+dS2nMvVGRQhUZyVolOBoeRZudCtaFII6E2J33ODaG5tQoZveXr8R2MNdtBO3oYtFqExVWlKNkvPJio99yDb5KWof3Thj8PaQ9U81ZGitIJWaww8q3VKEvBSlfIAE/TAlAoTTyoyopBokA6fEk3S88o6fKroq1ySobXVhq5KQKJT69mMeR2mxRBhkHpIkhTY/2WhIV8wnF+yzpiRNUNtLep4+8X2Zw3Vc0ZlWwkaHVplIt/EtwD+SRi0pzSal9n/MkZdi7Sa/HnkH8qXmFs/8TacU1BW5W8yVoQ465GhUWmtIaTqLr91qKQO5/EQPrgti0VWWqNxIo8uXGdMmFFSBEWXG/FtyUr5AVYBS0pK76bjrYnB0Y5wfhJOt211IgPmUj9YCZfdRN4ZZ/hhQ5rbcGrMDvqClRyfnZ1P6DAhBddlUwyI7eqVHQJjKD3KQdSfqkqH6Y8SZDtJfcYbddQphoMS2BdKlNhSVJJHcBSUqt6+4x7y/KRAqrKUkKYcVqaULFJB+IfQm/wAj7YpKMcxhE27z68z9DvsaUGm1f7LPD4zYbUoojyFJKxum8p4kY+8QKY7kPPTU6npDLS1iXGAHlSb+ZHyvcW9FYFf/AKP/ADGo5Kzbkx98rOXqrz4aCfhiyk8xKB7JcS9+uHXxpowqOUfGAfiwXUuA99CiEqH80n+7j8x1ZajXvW3Qn9Z9bUwehWWU/FjMkXMXDmkzoivwpUtJKT1QpKF6kn5E2/TCXHTp9MbzKe8N4fmq8Pr5nKv5dVraretgBjSDY3wWuvw12icd95yYx+LNWVIpmUoTfnP3ciSQn1WlIH/Cf1w66VCEClwoo2DDCGv9lIH+WObKS8/mnNdCYe8wCo0MJ6gNo0pP8gT+uOn17qJ9d8StUCm1JlnIy0pc+S0xsk15ZNv6g+nr3LZA/mccjE339cdKcVqly+H9W3sVpbb/AFcSD/K+ObNFvlih7NTZWx+Mm6izxCDFNxV4eTaMqZxCpcUv0ZKmotfbbuVME3DUu37u2hdugCT3OAzKVMSJ2caRe6KhQH3o6f31sONSAB6kJbcx23wbprGYKLnGiyUhcafFRGdSrcFC0uoUCPko44PytOmZepdCrLiOZU8tyyiQ0Ny422otPtG/7zYI+uPt/Z2qa9XqbquPtI+srwm5e8F4q9MhBPfy/r/7GLR+TyIqlrOlLKVOX+QvjfnvL7eVs4VGBHVrhoWl+I52XHWA4yr6oUnFTW1ldJdA/wBIUI/2lAf54qMMkGHqcOgYd5IqLLctbCljcFKiPcG+B9lnTSobI6Kmmw9kuqVb9E4vJj6WtbqjZDadR+QF8R4UAfdzBWDzWAH/AJFRIN/9pQwReJ5pEdirYblKVOf8O6FF5rS2EqTY3BVp1Wt74KKGlTFEZccFnC2HVJO1r72+l7fTA+9ENTlMQgbJcVre9mknzD6/D9cW2ZKkYUBYaGtewSgfnWTZKfqbYFYd2FhlAHMiZaZXNrU2aU6mmFpaSSdiEC6rf3lEfT2w88tlMfh5nR9dgJDtMiN79Vcx5429dmsKmh0Y0mjQqag633B+Isdyd1qPzN8NNLenhEpQOkvZkIFjupLUA/5v4StO5hAakeRV9WEEeF9PD2QJkpY8zj7qgT681X/PF7xahJTlhlSU6hGIdsPRspcI/RBxM4TU9B4dUdC0jS8hbyyfQrUq/wDhg94mZGmUvL7gq1MegFyKuQyHQPxEFOlXQmxsoXBsRcbYkNYfHz8ZTNtaBa2OCekR6KD/AEzokliOsNToLgDazsUrSfKr5EWO3UKwX0JlibSFrqQrGVJ2Xo65DkptvSNAF1hDmktuINhZPXYehwF5dem0ei0Ss0xSF1F7TTnYrqbomAKUlFyPhUNN9XoPTDGqWWsy8Uc55L4aVGPHy/FzC85KqXhpHOdTDj/iLGoCwKwmw2PmAvtthi0ndtJ4/THWFXAXd3nQP2NeFJfo8fi3mpxVRzZXo5TAS+gBNOg3IQlCQLBbibKUoW2ULfEq9rxfhLpHEKXIZJZ8UlEpCkbbkaVfqpKj9cPOmR49Lp0WDDZRGhxWkR2GGxZLbaEhKEj2CQB9MLHj5ADkak1JKblC1xlkehGpP/Cv9cfE/iWv1Zc9DwB8O0aG3w8DrFCO2Ptzc4+I32xsCQMUSIIGfc18CKjnzJkbMVJRKrdXRdmNS2zGZQz+IpK3eY8dKhpO6SNXZK0dQg5AeYlZlZlzFLmx+ZFnPyFtp5am1OpcCQ2nWpKCpSSVHSAlQDjgVZXRqOMmauFtJb5sGi/cDrrjUFyU+lDzyvLq8of5pCXF7lLJTp07i98L3PPEDMeeptLp9UoNICXJ0dprxCpcCNUJUvW0h5xcZ0OHlKFrEmyTcgFW1DSWXZK2AFexkvUCknjhpTZOz+iHm7JlRlOuU1ml1BEthchBQTEelSH5bqUKSlSQpouX8qSUtbixBLnz39oR/PP2X+LlX+61UV6Kk0KOwh0uuOCY0yhvV5RZwCVZSRfdOxxydVZkaRVW0qcixGnXXkMzmUNoaeC0BtVni0mQ43p1IAXe4N9Z2OIbdaqOYq1linzas5IgrqsuuyIcdakR0hkAIKkkDmK8rKAtYvpbSBa1zRGiqusVj1BB/eLpqGqBXtK7iYZNXnwadKprtDplHbagONSFtuOupGgKPkUpKEkCx3OyiNt8W9AepzC2i3PiHcANpdSLnoAN/kMUE+qT0qlzVvmfLckl7SpA+BSwShNhe4Te3ywawaw05w/rM1pZUjwElaSbghYbXt6ghQ/UYqWDxeM9ITS3nTpjGcy4yUqu5ByvFXHixKi+iSGn4rsktAh+UEo0OaCLhbgJuOl+lhho1TNb8jK6MsVWg1Wh1ytZjoaYjDrHPjSQma0pQakta2lKABOkqCrX8u2FHkqhvKVQlv1KpoYlVkRlQJUlL7TiWmX5CHQpQUoeeOwrZQ2JBGHvm5gscIauXXNbsGs0OfG3/ZrFRYTdPp8RH1xMtABUPyc9Y8WRbTs9I9PtT5wXQ8nQKMxVqZClVx92K5BqjRLc+OWlIda5pshqxcbVqWtvYEBaeuOX+C3EypZezDTKU9WIX9HpLrj816WQlRX4ZdlaiqzKdEZD5v1L5B9+kvtjNUmo8PV0svF/MbTqZcKBDrCYktCLlKnwxZZkJHQoDaidykhSRjgRuM9qgPMikc5a1LYlsBKmTrIPOWyPMtaEtoQEi+oqSoDUDiToqg+n2v3JgtRYUuDLP0NoeY6XLai1eNU4smlJXzFTo7yXGglCvOrUCRtY39CDjgnNWeHc/wBYrmbpgV4rNVScqKUr2U3DT+HEa+QaSj63wzcx8TWf/wBXWRlikQ5dLmzZqMrR3pK2i7JCkJcmSDo8urlF8LIvZwncnCPzPWokQy5CBpiQmSltAHRDaTZI/T+eKPs7SfhwzY5JwPlO6i3xMD6z1l/IEjMz7ExEhqHGlyFMMkfEGEJW2tKQCLE7qBN+o9Bh9OQKbQ8uVZa4rAaapEu7Wm2tDcdVkk26BO2/QYSWRs/RsqRaPSq9TZUZyGkoMhtYIcWQbkIcCFL+TYX9cOPNclibw0qs+M5zWJ8RMFl/ToI8S4hkKIVYptzACCL9cNawFAq/GY0CubmZhwAZvz+qTG4BcKaBPkvSZk2utPOuyEctbiYcRazdNhcay3+gxbLlTqNw4rK6ZKehTH4rURpyOsoUlTqg2LEb9XAcauMMRxOdOHdFkFxxFKy1JqxDitStcyUUo1E9+Ux39cFtMrFLbyxTXUURpYcn0xCkSXFLBJlNDUenpfES3AVR8c/cysxzuwMzsiE7U3QmNEcedTHbskFf5U7Dr8sejm2ctgsOLbcQRpOtsY+O5gWgkttttk90oxs8NUXKd43wbC4xGq+lNyL9bdcQ0c5O1j8Ym/A5WI/jRMoMrMtOYqMV2O8IutMqIRtdahZSDsR5T0IOJ0jiJWjw6cotMEOq00MlkyGQS8hv91SL3H6YHOMmYqErOCYtSorrq0xG0+JhSNDiLlRtpN0n4r7+uB2i0+muS0SMuZkMaYLaY1UHh3D7BweRXyNsWUAasZknx2qchePn0hp9nnJzaZlUzA+gc1tXhGAR0JAUtQ+hSPqrGn7SWa1lEHLkZRUV2lSkoP5RcNpP11K+icNnIUxFH4fqn19luluodcXIVYJSo3sDtsdXl3GE5Q8kVPN3FtmoVdrnRy8Z7i0EKb0Ity0gjYpvy0/LCLVsbGsboI8LwUCdzDB7LCcpZLyzTNNnmWVKesP9KrSpf6EkfIDBdlSX4XKTjpOzJcI/xA/U/wA8a+IadSIN+oKx/wAOKRFQEfKZjg2U7I3APYJST/MjEQksxJjAwDxE99qThsircIIuc2EoRUaHUE8x5aSo+DeUlh3uD5Flp7rtyT74WvCvPCJXA3i9w2rMxUpRoNSzFSnXwlKuc0grktAAAXS+EPgD/WrPRJx25MypCzJw/k5dqKAqFUac5Efv+662UrI9wFqt72x+V+a4lTy6xNhTC+zWo0h2iSHo50uNS9RhPncEaHWnFHcbpWD6HH2PsthfR4TdVMXu/wAbA9jBfM6C/R6qtM6ZJK3G5rJcULIeWsEGyQkGxVtcG2CPLPD85hmpiRoTUtbjpabT93qmPyF2C1EJTZWwULqv1VbAeqh1JLNQgqnaxS0oTrabSfELSOY2FXBtZPLBA/MetsdLfZY4hUfh1mqPPqSnHos+GttuVoC3ElakL1BKQLmwCbJF7b9Eqt9A3BwTFNTc9OnNlIyRBCNw7qeSJNi9VMspbcQHnm21KS0pRCUKfiyQVaTsNSFAe+JfE/MtSqtAo1BkREyKrQsxrTLXTWHHW3P6soNPoaGpZBD7Z0bm9x03w8OP/EWmcRnZAo1lMR4Hhn5MqzCUIW8hZUvXbQAE2SF2JKyRsCcJijcQqDQ5nEDNYqEX73pxWunMLVpDj6+XFYfTfZbaRoUVJvYHpiPZ/wAm5RnHSUPZ11l+mzbxmNfhdw2pGaWXaCXUNZEyylFSzTNeUWkVKfp5qIril2s0yFJddBt5tKTa6rj/ABW42zeLzy8qZJiLRQJi+V95JihUmfY2tEbWLNNg/wCnWL2sU6dlFeZrrdbzLk6h5SoqHomRaW40pcB66XKotbgDtSqCgbpSp1wuho7JHxb7AryrSHqnDfp+XJj8aiu3aqWbGhy5NWsbFiF3ajgjTzBurfRY+bAyi1nexzjp8Pj84y3n5bgSso9DoPCenzixRV5vrMVwIloiFX3XTXVK28XMseY7cgaQSrsR3wLGn5jzTFi0+sCLTqVEqsusJTSXnG1uvvFyyUkAFttIdWALlXmO4GO0uGNayPw/yFAytUplKo8KQt3lU6YpCWltqVa6gvy2KgrdfUg9ThUZoyRkuq5pcTk3O9DpcSVIKRS6iy80hpxSrnkrCbcok+W40gmwURbCq6s7jkfUxa7cVArIx6TnqvZGpNJgGZHo0V1TTodfXJaD7jjV9KypbmpRsDq6/lxqFCgsVKkR4DK6YXZK0L8A+uOCAy4ro2pPRQSfpjtjK32VotJkqNbr5rMSTFdjTYSoCUtK1oKboUSSkJJCgdzdPUAkY5HTl9zL+amaZUVhufQ6i5EkBW+pSNTRP94KSv5KwenVC3IznEEtNiYL94acPOC1ezbkNvO0Kku1Z2KygtibLdfkvlIAeMfmKVum6uhFylSR0IxXVGpKcotQeityVLjo0LIjuBLDilBCUuKIsg6yBY2N8dX/AGT6klfCxVISRzqLU5cNSO6UqdU+39Ch5BGF/wDa/wA0/euY8q5JYdKuU598Tkg7dFNsJV/+Mv8AupxMF5svKMIZ9OOGBgXwN4CyM/s1aopmtwW6THTTYnMbKguQUJc332TpLOrvubdL4uqXwE4gVFx9pyhN09xlO7kqa1ynVDshSCom/Y6QN97YdP2fHIeX+C8Goz348CO89LmvSJDqWkBKpDgQVKJsLNhsde2K7M/2rMs094xctsSM2TEmxMNBQx/4qhYi/dII98CeyyxyFEKaUOMxR8auHVQyTkJNUzPmNyTmqorRTqfToZCmW27G5UtSdatCLquNIB0je98KGg1hqC0uHTIMqfIaCW0hCNDaQBYedWx7/Dq6dMNJ2JmzjpnrXUmW6vWGW9KITSi3ApTCt/xli5BVa+kXWu3oBpJM2cOK1wwERVUSxPp77agqRR6e7ymXARZK7FStxeyjYHoN+pd4RdrcmZKBRxEjNytmCsqLzrYdkOEBxKgEtoaG/KQFKSbE2uSbnfpsASQMlzam405W5x0IN0soN1fyAQn6JJHY98Gdvu11g5ip1Syww+Atl2oxFht5B6ELAISf4VWUL9MHmTOF9M4o1yfKSapT8usxUNR5kJao6XZJWq5RqB5gCdNzYpv64Ab3J2YxBgZPAgrl7LbDbKGGdEGCg+ZxRslNz1JJ3JJ77nF5SHcvR6qQK40lTPmCJA5QcG4uhSrBYv3Tce+GFR/s5Nx5sZFXzRPrdIjOpfRTnYrLKXFJVqSHVoF1i4Btte2+GzU8uUmuMNs1KkwKg03s23KjIcS37JCht9MJNSX95psVHvEHw14e1jMNGdrNEq0RTCZb8eOKmwVtSW0q2eQtFiASVDbY6Ljrhj5W4NiJVGqrmWoozBPaBLMXwyUQoyjsVIQQVKVbbUtR9rYY0aM1EYbZZbQy02AlDbaQlKQOgAGwHsMbcHWtFOccwoQCeOVjNNu2PeMG5wyDO4E86LjHgot1xuIx8O4xwz2BIvTHzbHt1JSb41XB+eAs2J0LMXvjUUXxuSApQBNgTucWiobKIy3EcpWgX8298arQ25xPEhZRhJ//AEY2MRXJTgbZTdR/QYkrmBwWVHZ+YTbG2JVRCBCI6AD1PfHFFRcbm4mSDjgSDLhOQnuW5pJte46Y1DbG6bKXMkKdXsT0A6AY0A3xxipY7OkztOOYB8XOFkbiTRAWFop+YoYK6fUtFyhVt2nP3mlgaVJ97jcDHM2Rs817hFmWdUYlOc0Id8LmHLTq9K0rTbSttR2CtPmbWfKtCrE7AjtbAHxI4Q03P2iey8qj5kZRy49VYQFEpvflPINg63f8qunYg4IjgDa3SaU44M5+4w1fK/FHMOXs1ZeqbLyKtHcoFThujlSYrw1PRVutKspJCkvIBOx1psSLYifZYzsMicTXKJUHOXT8xgRgVGyWprYJbv6a0lSPdQQPTETNnDpuJmOJTszUZijZlSvmU+exqVCqJSdV2VndK+h5SiFDrYjC/wA6Uh+LNktPa2XCsOc1olKkrBCkrSexBAPsRh2pkceHDFcLmdd/aomJZyRQ4R28bW2Un2DbLz5//wCQxzv9mWuyqBmPO0unxvFTWqLH0N6CuyTJstWkbmwsfpjznHj0/wAUcuZSpFYQqNmKkGW/OeCLMyrRlMtPNnpdXOUVJ6gpV2Ix4+yTU2qTxwXHkKKTVaPIitJPdxt1p0D/AGEuH6Y0KytTL8IEkYn3jrnGoV+PRY82Wqa49JU+sOqFg22gnYDYfiLaO3phO8Pc5UnL+Zq1JrVHqjtVeklmNOZgqkNMw0oTpCFpva51KVYXubHphjcfKzTM0cSJ8fLzDEeLEdFFiKYNw9JU5Z5ffbmEIt0AZw2VUOAmIxGchxpDcdAbb5jSVAAbbbf+zfAmYU0hGHWBes2dDOcq43U8xVhyvUvKlRXlII5CFRIxL8l9RCi6WPjCABoBAG9yR0OLCFwBqea0fetWTHorrKeXBgTY4kKCDZSnFqacSptZISAEOCwT5tzYdDrAbKksghpOyEkAWHbpsPpiXSoTVRVIS/MahltouIDwP4hH5QegJ98LrrHrACDGPrPJp1B3TmHNnCDOj1OYhMyKjLZZdS62adWkvqbUNtSUTkgouCQQl47Eg3Bx4y3Wqvw+S5BWuGXFL5jqMyxXaRJkLsBZMuyo7qrABIRfYCxx0yGEgeh9R2x8kRWZcdcd9pD8dwFK2nUhSVg9lA7Eex2wYa/cNtqAiHNI64nNTWZ8m1KrqlVbKf3MtsgSqnSpamZcNZ2CpCGg0+lB2/EUCnufLvgxk5Jm5fZXmCnVdvPFKVGQpym1Zplb0mP8SQxLbCPOAoqQVpUCTYmyr40584IxafFW/ToMio0JsKV93RFaZ9MB3K4LoIWUDqYxO/8AoyDZJ+ZKzWGMsHLE6bDkCNBacp9UjkBmXDSUJJKR8C0JsFJ277AhSQ6z5QWac5HcHnj9pxVKHIisqlWrHBqSvMnD6rEZczNC5S5CGdaiybjmBu4tLj+ayTYmxTba2IGehFnxqF/R2ElnL0aD+A9IYWh+rxFOqQ682VABSEOoUoqUNSlKJFkuAqP8oZVlryC/VqtHdVkGuTtb8lVx9zzJDhcjLAt5WltuRwtQ2S6u5tqUQE16c/w7pNUy1mFK24VLW9PpsxpIJpkotm+kEEKjSdkLQdgspVtuRUrYFsDkjv6/7E9Yo4sXp3EA82Opk8OvDTXQ1UaGfB89+Rs4GSl6IEg7A8tSEeXqQepxNhVmbmyLlTL7rDzDLksMNTZzWlHMaQ45HSEkhSklTTVza1trm+HZm/JGQ+HjCZVAS1mqrpDaXazMcEp5JcSSgHQkoZJSLBKEJO2FJnWUmnz6PLdd5MuFU4EtxoqBW2C8hKgf7q7b+o9Rgtd62nao7mbbTBsWNIU+p1KVn992dT2o81dMBsJAU2s+IXqUkgEgX7EX6XwOUigwsyU+mUh9lCVtc1yc6lRSWo7Lyk6Sdr6ikJF+gKiOl8buMMDweaufqdcUWqihKeYoJu0sPpFgRsUBe3vjbUMryGqNVUUB1unMz4qg6gMlS1gJWU6V6gQVarG9+uKCLmtSO8mWYF5LTrr7IfAuk5mpp4nZmpUaeqfdjL0GawHGokJCyOeG1AjW6pNwbXCEptbVuyPtZZ6jcOODNVhxSItRzDqpMNuKypSruoPiHUoQCboZ5ir2+IIH5hgs+zxmaLm7gZkKpw9DbC6JEZKLBIQttlLakn92ykq69rHvjivjpxZVxW4jzq9C5k+jw1/cuW4jY3lkuBKnEjuXnvhPXloQel8fJUpbrNcz2+6h6fLpDEjGRBXJ8fM+aK1Ucp5PVUqxHryIz7tDp6/CNpaabCUGU6QkobBuQFKSklShoUcNOh/Zneo48PX6w7Tnm1aXKZl9tEVhNuoU4Ulaj/EnRfqMdQfZc4aQOF3D/wC5kMsLrS1CTVJ6EBK5b6xdalK6qSlV0pv0SE+97XibSY0itsLUgFZji6k7H4lY5qvarGwpTwPWYBE53pvBrJFBfMhnLsN6TfaRPCpjg+S3isj6HFhH00+rtxiUtsuLS2CRZKAbAEnsBff0GOiciZLo79G8RJp7Ml9TqxzHk6iALAAX+uAHjlkSIh1h2kRERnGY+pxptNuYNSt/ci18TF1Ztfa5J+cMVyMwO4mZNnUajympSG1LjNtSlFlYWEpUsIBJHqVj9ffCjS3p6bYbOW8+0/8AoRmuiVsuKmTIIbhyF3WLt7oaPcC4TY9NgNsKo2ubYp0AgFWilpBIKzq7KMabmfglBjQ0F+ZKgeDaTcC5BLXXoNh1OB2j8LRXOFNUy7UGkRah451xpagCWJCAkJVf02IJH5VK9cQKbXF0/wCzlT0suqafU64yFpNikh5bmx7bAYMeCSnJHDmmPvLU4t5yQorWbk/jLG/6DEd91QZh/wDaW0KuAD6TkZaZtEqjrBD1PqURxTbmhRQtpYNiLjfr36EWPQjEOEyqbNs+4oa3TzHVAqO5uVHuepOOt+L3A85yhPZmpDLTdTgt3laiEiS0B3/jSNx6jy+lkxGyhSspNIreZnFtx3wHIlKaOmTMH7xHVtu/5juewxdosFy7gMSVfYtJx1l+OG9MoGcaVUso1lufTaWluXOq1TQPCsupVqCOg17BPkFzc2vcYb/D7P8AGzfOrtUZKpDqn2mHag6kJW6EpJslP5UpCgAOtjc7knHK2c+JNRzUpuPpRBpUfyxqfFToZaHsO6vVR398Ob7M6g7kmo6Rdw1JWr/wm7YX1v8Ajp4nNFWbrw9v2nQeb65SJkFiNTY41IOovlGkjbp6k/8ALHEnGfKrcfjLmKAsAw87UFMloOJ1JROi2YJA9eWtpX0OOwhQHUNB6WpMVrqNZ8yvkMc7fagbhw8xcMKwAW249eXTdZNyfFRXUAH2K22/qBhLRO5uOeMj/YlxxWqbE5xOdKnTZ2caHS2IEFapU5bCER206UpdS4kqQOwAUlQ9rEnocH1cFPk5AqlEp+h+LR3oRMtNrynFGVzXLjqnUsJTf8iUk9cfYfOyzljNLhs2sSX48YI+MNqTzHtPzSdJPo8cD+Qp4q0ur0ZG5rdLSI+qwu8lQfbA91BBQB6uDH0VLZE+Y1ym1w56IR/uBfCojLfD2s1Rpss1elIcaSVghQlyZK0F35hrmFJ/s+mGlwyy8qKxlLLVMotKrOYMzBdT5ldZ50aEynWhJSgWuspQtRPuBb0AqM/Tok+qUyturiUOuRkxZE1AJVDeQsLYft+6FDSr+FasFEaerJzlAp+Zqs/lHMlDB+480w2jJhS4ylFSUkpvdPnJ1i9krIUPWmrbuZ857RVt7Ke/P0xx+cGPtM8D5OTp01L0CFBqtPYTPEqjJUiO+wpehSi2okoIUbEdCDjnSICX32Uo5RW2l5KB0S5ci4+dv8cdacb61mLLOSswnO1VjVbN2bOREjLYeS6E05tfMU4NACUoWrSEi1zjlN1Qi1dpbiSlDzXLQq3lKwSdN/Wxv9MUqCdvMZ9mMzUnccjtOrvsN1FpPGSskPBH3plpt7klXxKQ+kpPuQHFj5HHa+Yad97UGowrXL8ZxAHqopOn+dsfmZ9nLNScpcb+FlTcWpDMiU7Q3gOh5ySygH2Cyk/TH6jdwe4x+f8A/wAhQ16xbPUD8p9poHzTt9JyANzvj4Ri6zdSzRsz1SGU6Q1IXpA/dJun/dIxTnfHlOVBhTxxDHg7H5/EKmHTcNh1Z2/7JQB/UjHRqhvhAcDgP6dJ9orpH+7/AM8P5SgDviLrDm2L2nAia4zTSnK7DIOzslNx62So/wCNsJVW98e8y8ZXs61CLHcp6IUFCyEHmla7mwBUbAdu3qceRa2PpKaWoQK3WSVcPyIxeB8sx65UmdWnmxQRb1Cx/wDnHHInGfJs7KnHbOmT6ZFJczHKRVKUlPRSZX7b5BK9Y9gk+mOpOF0kx80gjuwsfzBwBfbhokilw8ocR6YXGJdFlKp06QybKESQCASewCiofN7Dfs+3wdaVPRxj6wd/nrKjrOeOM70VeenY8FQdh0+LHpzTo/0gYbDRX9Sk/wAsAJeEiKEhV0rkpCPfQQT/ADQcEGdm1R4zTzCeY86rlt26XV0Vf0FifkMDEdbbMnT1jwGrFZ/fIufqEg/7ePtNuBA6cCupUHaSKkPFvRIIVs8vU5b9xG5/U6R9Th0/Z+y3k3M1UzGjOUqRGp7LQaQYnx6whK032O3mc7WJtfCUoWuZUX5L6QlTTaGgLdCRrV/ikfTFxMpz9KmrnIelwHXGwHUNL0B5I6ah39LjAnUkYBxPX1m5NgbB9ZLqLcWjS5giOFYWs/ir/KgXsPaw/wAziipCXK3Pj1BYKITJJioUN3DuC4fbrp/XEd8f0gmLiBRMNpQMpwH4j1DQ/lf2274O8uZalV2YiDC5LKwguvSXzojxGU2CnXVflQkW9ySALkgYGTtHxjORWuWPAlvlLL8/MtRMeFy0rbbLz8qQvQxGaT1cdV+VI/VRskXJtiwz5mNiJl6nZboa5NSDLjyIa3kgPz5b5SFOBsfAmyEBKd9KE7m5OIlczS01AjZVyfDlS4jz6QNLZ8XW5XQOrT+VA/I30SkajucFtPypH4Nx359YkM1XiLKb5amWlBxmjtnqhJ/1lupuT9NihYQvJiZsL2KzDn/qv7mWeSaY7R6bEpjxF40VuMpKT0skA/W+Gjn3NUzMuR3JdZeM1cehEpJATut1xClbd7NI3/h98LjIlEqNQdjR4zS6hU5ieeoJ67+ZSlE7JSkBIubAAb4YNZi056kVOjw5zdSaiUlEV2Uxu064FuOOctX5kguaQrvpxDsJBJ+McuSuzU05GWXP0iDplFTCbyTGK9SEzAtQPryHVW+ilY6B4WEVn7WMp9AJRQ8ocpXol16WNvqgHCOpTCzQMnPk+dt9Daif3uQtB/3gcPTgoo0v7TedIq7JNWy5FnMknchp8skD/bv9MdvJIY//AOT+0q3HbUcfCdQNPnbfC945zgMv02ODu5K5hHslCh/5hg4Sq4uDt88KLjnPV95UmKDsllbh37qVb/yY+VorzaDE67CTgxftuaRjc055tj/PC/zxxJYyo41ToUU1nMElGtmntLCQhH+sdX/o0fzV0A7hH5rzBKrcojMeeYodv56VGnGLEb/hKWyFm3qtRPsMfV0aB7huY4EYL46Todz7UVARSfuiBkQ50EJ95Sp017wCEHypKWFqbKl7oJJBQPKNzthN+IzTNTEZaqVMjlt4yTOZQ4Xo6iDqShJUQdzsq40gkJA2sGtUXK8aIlblERHjFOhqpU2oPPM3PS6woFBv+8CPfEeVDrWVWn50dE2qwCOY6uS6suMoG2x0kEWNz06G+Kf4OuoYp/OT7ltfk9ox6nmTOM2mppCp1KkQXZfi3JzkFLcjUFEgL0gKdSL3TqXcKNySAAA2MitZfqtZrLlLamOyIRhx2qc6VedbgK16VWKQrqdzbEtuql15mO8+pCFIC2ylQIXv2HUi29+mJDc4wlpcU6pKQtNgTso32BHe+AJbZScYETOTwYOUSWqVVBDrTQpsplRLkNLqVK02BCk2PmFiNx74NadSpVXi1KmRjFiUP4Xhy1OOvhYCnNwoBAJJTuDffG2sZQg58Zp+pxMaYCpxp9lSQtJ0nyi4Pre3e2KCjpzPl6plmdTpExQas4uEpHJdAt5rrKTrvfy/pji3izLIcN6GEX4w1gVZMFeXGGG/CsN1GaG0J2H4TAaFrezih8sM3POaWo/AzNdRWS+uM5SXFNIOkrKaiwrSCfXTbfCWrNVizMtNUyoZfkwJTkpcuA4+tJIdJBc8zazpJSVEpOxA74KHyc4cM80JTGLLrtPdEdlagQpTRDiVEW7LbTgTAGytj0B/eVarFZWHeWPF/jjWuO0qOvNULLtBQ0Fobdo7LqZqmVEkR3H3HFa2wTqOlCbq3GkXGAF2NSafPgR0prEqM85y9DdTWhps6RsVqVqTcXskEXIthP8A3UipSyX6aKkVpS4uZLXdx9SgCdF0kAC9rAp9rWvg74d0xUykS6IXCuG634iI4tZ1NC6boB63BKVpvuLKG9sU7NKKk8rYA7RRajc2SeY3oHBtWcW4LmValIo1Qpbbq48WqSlzIaS6LKSlK1lSLi3mQdt7g9MKus5TrkHM8PK1fpL1OqSnm5ElJ87LkZCgtTjbg2WhRCUbbgrsQMF3DYVmBBjVeI+9V5aUqZlRpU2zjUhtakKU2SNKUkg3Tt0Ta+4w169R838Rshz5FQoL7tey4PvamS4qw8h5pCU+IYSoAKKlNBwFCgLqSCCeuJaX6rS3bLCGT17gn9p4VnOO8VaaBUczVKpsBTJZXBU1GTJTqa5q9d1r2O6dCLegJ2OHVwtzJkygQIuW+JMP+j0FSBBdhVqE4uE+VlKUBMhKC0pF7EKCgodSEkbA2S6izVyxKhrDsaQlC21ja6VWIO+HPnSeK9RqtlZtpmXDajxqlUFE35LbbqHnAoHYjlNlVh2PvjGqt3OKmH26iWKTsGR6RUs8j+nmfDHmTJ0Gn1NyhU5ye9znERIaeWhsLtcpSsuAE3NhuSdyctX/AKJ0QJNr1SlD/wDm2jhUcM336plJFTeAU5UpMyetSTe5ekOuX9/iGGJPzXR6ZkZiauoMOM0+dDW8Y6ucpKmHUOOp0ouSpCEKUpIBICSSLA4U1alrMLzjiFrICEmduLv3N8SmaxNjw1RUSVpjqBBR1FjiIH23o7b6DdpxKVoVYi4ULg/ocan3EIQpa1BLaRqUo9ABuTj5EbkJA4MWcjE5h4wTudxKrBSsLCVNN7dilpAI/UHFHT5TKiQ8tbZ20qSnUPe+/wDhfEeYt3MuZpkhJKlzZS3U3PQLWSB+hGLXOmRapw/qDUSqNhp5xtLgAUD5T06Y+qQ7VVTJpq3gtCuLmysUzL0enB1qXQUOl3krQHGlqNtifiBFrgbEXOOkeBtJjQ8qCW4y6w7UrPJjPr1clu3lCTbod1etiL3xzXwVpr+Ys5xoigldObHOnIWLpcZT+Qg7HUbJ9rkjcY7BQ3Gktp8H+GUjZjpp/s+3tgNtwr8q4z6QaVHO4wc4n0JaocV2MlTiUKVqAG6dh1HphcwYK5k+NG3IccSmw7AkX/lho5oqLbKITM1TzZ5itEho+do2HxD8w7YgUajx5FbjPlLaXAFOBxn9i9tYEfuq36YnvStx318fCEW0q2DCFagLgbDsBjgL7auXouX+OlLmxpEURK+wKnUY/NHMakRG9AXo6hLiVRt7blo++O/X2SlRSQQb23x+VvFusSa3xZ4k1dMVpurz81PUKMuS2Tpaj2aG4sSA2yVWB62xT9j1N47MegENqnHhjMCKdVWqhIrXhl3cTUFKeSpNjbQhKPoUoBxKpeWqtECY8GdGmRwPJFnx76R+6FotsPdJOKLLaZLmanXJC4yuZDcQTGQpAWG3kpQogk/vKtY9MMrKsVJcWtEmUlTatFhH56L2B3t5uhHfH0upfwwTGtKithYQ5LyzUK0/Gj1mJDRRYS+cmAy5zW337WDixoSLIHRJBuTqPwjBFxeyWzJzXw/yFRacyuXMfezPPjtizd9AZZKrdADckeqMXVEcj0l2FDkhEyqSyVRYMdRbW6lPxrV1KGwCdSzcb2AUogGXl/KVf45faQzrTWluUnKjsaI3OqjL4Q+7AYLjTkOPbdBclJkJUrayGlW3tj59HdrTY3AAMsW111V7RLXh/wALGuJdPqECI85/0cU51S6/Wk2DmZZLN1GIwodIiFABa0/EQUg7Empzln2TTqxLoNLp7TKYsdKFPkaUMlSPIG0ADYJII3tcW7Y7Cr1Kg5X4eyabTIrNPp8SImLHjRk6G2m9khKQOgAOObeIOTUZjob/AIOHHdqgCeW8saXNIUCUpXa4JFwL7XPbrhJdQLG5Hl/vMk6kMw46xJQqczFYDakJVcDmXSPOfU/XfBFGqaxT58AkGPMbLbnlFzsQDe19r3+eL/MXAbiLluhP1mfllYiR1hL7EWS3JkBBBu4ltoqulOwO997gWBxScMcsyuINQrNHhPMQapDjvTmET9XNkoSLobbRaxuoi5JuEqBF97NnDLkGRxXYDjEfPB37QTsx+LlnNyVicpxtiHWWo+iPI1CyQ7vZDhX5dtiSOl8Jb7T+XRQuPNYkggJqcaHUEj0OgsK/nHB+uIvCPK+duKkViXSKfGLUGqMpemuSUNhlSdDoKmjuoAEDa97HuLYPPtwUQxs35QrBvolwpMAn0La0OIHzs67+mA1ItWox6iUkNjV+ftKLI3Ft3g/mf78ahPVSj1uDy5sKIocwSWx+C6L7C5JbUT0BB304XNUzNVq/mKpZkrJQurVJ4yHw1fQ35QlDaO+lCEpQO503O5OITUgqiRwndSlhAF/U74Kcnw2HXp9Ultn7upbK33NO5WR8IHue3qVDDJVaQWxzGBlyJEo+WBMegx5MKROmTnlORKJDBcW86dyoN30jsVLIASNyRbHReTfsr1KZGbdzLWTQGjY/dOXtGu3o5JUkkn/u0p9lHrhi8DuEzeRKH971OOhWbashLs50jeMg7pit/uobFgbfEoFRvtZnAG98Tbb2zhYbA7Slyrk2j5IozNKocBqnwWyVctu5K1HqtajdSlHqVKJJ9elpqsxUuNVW6W5UojdTc+CEt9KX1d9kX1HbfYdMJDiz9ourZYzxUcsZcgQVu05pvxc6eVqIecQFpS2hJFwEqBJJsSbWtfClgyYy6Wlp9hubLWouvy3weY46TculQ82u5vqvtYW6YWZSPM3WAa0LxO3SSLX6Ht1x5uT1wgeG1aZpHEmnMoqi6fTqnTlrdjzpSy3KlcxAQEcwn8X4973UOxNsdApsb7YGpyARNqwYZn1Kd8bEgk7C+PbTKl9cSm20oGwscNpWzczxOJqQypQ32GNoaSB0vj1j7a+HBWqweZ50J9MfC0n0x70k49Bo2ONbMz2ZoW2kI2FjjVpAxMLFx1x58IFfEdvbA2qY9BPbhKx9G9uuNGkpOLR+KEC4ufY4iKZ9sIPUwPMIGyOJH274y+1hj2pk6umKPOGaYWSqKufMS46tSwzGiMJu9KfVshptP5lKP0AuTsCcC2MTgTeR3mjOGdqNkeneOrEsRm1K0NMpSVvPrtfQ22LqWr2A26mw3xW8OOIkLibSJE+BFlwvDylRXY8xKQsKCUrFtJUDdK0nY7XIPTCI4sVGZS5C1VEt1HPdRbQl9Da9TFJZcIDUBj0U4pSeYvqoa9wlScbc+5yicOcox+H9DkqWiE1rr1RirsuTIX5nGG1Dopaleb90KS2LG9rKezdyAf8AY/pFGvwSe0ejXE7J0iuCjt5opK6oXOSIqZiNRc/cG9ir+G9/a+CVaSOot7Y4wqDTK6SzRZjTTMp2NzFJjICER1badFu6T0PfRfvjpzgxnRziFkOFLfUPvSJeFUEHql9uwKvksaVj2X7Y9rPZ50yB0ORM03+KSpGIYXKTj7zBiYzTVOnzkpT/ADxKVQ2Sg6VLCvUnEsU2OMgQ5K9II5wyjSs95flUWsxUyoMgDvpW2sbpcQrqlaTYhQ3BxyxnTJ86JIm0asaZdapCUr8Tp0/eMJRs3JsBsrYocA6KBPcY7BeaXFdLaxYj+fvhW8e6Ap7LjGaYjWuo5dK5C0JG8iEoASmj6jR+IP4mx64ypKttPWHQ/acWTY4hTnmLkhBugnqUnp/y+mKZup1PL1ZiVOivmJVYjqyxIAuW+YhbaiPfS4cHfE/L/wB2TGpUZephSg+y6Nw4yTZdz3sklXzA9cBUxhSZQBTY9D9MfQ0uHUEQDoVMZn2YeGzGeOJSDLZLlJy/CMlXmIK33LtM3PqBzV/NIOOkc4cMZVNMd2iQpE5ggh1KFBa0q7bbG2Br7EVKbTkHM1Q0DxEquKaWruUNx2dA/Va/9o+uOkW2wnriVqgXsx6TS8CJbLWV6RWKZUYEyM5EzFCad0t8wpLmxKSU9yk7bbWIO+JvDzK1GrOXZdQMdSqkwh1ohS7oCig6VhPyNvpgyzzkZOYNFQgr8JWGAC28k6eZboCex6WP+WA3he69S8yVGlS0KYekNH8JYt+Ik3/wKv0xNcEQoHGYuEsmw7Xwd0nh8w/kuTWXXlPvLjuLaZSNIbKSdyb7ny/zwGKCQbewGG1kmWF8NZjav9C3JQQfdJV/5sYPSEwYJy8s0uLw/p9RSHPvWYpKW/xNlK1G4CfkD73tjlv7QnDgZTrc6nUunrbczS40kzG5CGm21h1CJzSUqULFbRLtkbqJcNiUknqPhtEkZgrMdySpTkKlpK20n4QsklIH1Or+6MCX2gslvZyy7VEwY6JFZpc5FYpaHBcmVGd5raB7rAU38nDhvSXeFcFPQzJXAyJQfZn4wZfr2Qa1krN7MJhMSbKhSEFBMR+O9+IlCr76S28lIJsCB2thScdOFb2XpK8qyXTUC1FVIoc90haqpSz5SypXRbrGpKSRupPLWd1k4uuFtNoFL43qpz6NGWeIlKZk0mQsaS1KSguxwFHuplTrdvzKZA62xS/aeynNpT5pNemyJKKLHbq9BTzlJjoZ52iSEWsdRXyblROlLqAmwBxbrUJqTtPDc/X4fvAKSjEQKerMyFw34f5oZQpM12kJocs3QhoPQnHmlLcUUn8QiOQAdjr6d8LfiRSm6llmrzA2TJcgJlJcUAHFWQHUX9/KP0HoMNLh3xAqQyLmKkUDLUnMsIVqRPi1VxaGKalh5tpa089Vtag9z/KgK3v64XFbzRNzVNqMepxo8WUEJQ43GUVoWhYISQogE/mHTt3xRUMtxOOAYxWQa8GR+KHh5tSolQNhElToxU4eiGpURTZUfbUoY18Kcn0HPkajU8QIIcRTkuzJAbIVqQVtqACSmxKmlm5v1G2KOp1Z53hJR5YRqdjU2KFKtchyHNQFn/ZScW/D6c7QH1VaJV4tFqFNmTIQRUmi7HmMqWuQEAIUFhaQ8el76jtixVwmCehnzftQOSTX1IhMc1VDg+/mzIVFqMxqFmqjssxmy+4pENsP6ZBQCTo1M62xc7KULGwADB+xRwoRnLivIzJPYbcpWT0p8LywoIXOdTZlJSpRTdli6rpA3cQeuEYquSqxV69XqktipSnGWUwxBQpCFMKvym20KJUCpZ77kqHTpj9Lvs3cKFcHeENGoktINdfCqhV3bWK5jx1uD3CBpbHs0MSfady6elgnvN/czWmDCpQ5yZaUofcWcnY99LLylI6WuFeZP87D9cReIB1VpHsyn/FWL7NNNQ7Ohyi83FA8qnXAdII3TewPv+mB3O7iX64tSFBaC0gpI6WIv/nj4PbiMjriFWR0BGWo38SnD/vqwGZ9cCswvJv8CEAfO1/88HGTEhOWYX/zP+NWAavQ5FVr1QcZYcdSHCklCSbAeX/y4ygJbiMBwg5MV3HPho1lpUKs09BRBmWQ812ae0329lWJ+YOFHyh6HHbGfsvMZjyZVKc61zVGOpTI6EOpF0Ef3gPpcd8cZJZKiBYknoB19sW9FabEIPURa9Qhz6wki11Q4cimatkTnXLegKG7fz1Y6M4RUd2PkHL0RpsqdXFDxSB++S5/58c9w8mop0MScxzDRoawHExLapb4/hb6pBt8SrDHXOTUwZ2WWIrT33RDYhthLesc1YCABrUetrAWG2M6uobQPXmH0t28nb2ElLrLOX2VNNLEuXe5AN2m1ev8RxwlxT8YvOVbEx1x99ue8guOG5KCSW/pptYelsdkR4T8x4NMNqecPQJG598InjDQ8s5PztWKhXZH31Of5DrVDiLKEoIaSnU+6NwCQfKjc+oxjQO7ORjAh9XVXSoI5aLjhTk+i5gqUqTmPxiaPFaKluMKQ00XNrJceVsgEXNhdSugBvhu8Ds1Zayo/W6RQnHag6q0vxMpOlAsdBCEnc2BTuq1/QdMc75qz9PzEtLay3FhNeViBEQG47A9EoH81G6j3Jx94a180XOtNkOOFDLiyw7vYWWNIv7AkH6YsXpvrIEm0o4sFjnj0nW9Tzg7NkkvvKcV0uo9P8h9MJz7U8pbnBarVNhPOk0aVCqzSU9fwZTS1/7mu/thv5QyQ5nGpOxkvpZ5aCsqVvtsP88BXE/KanaBmfLroS84/ClQwOoKlNrQLfU4h6c7Lkc+s+gOdhAiyzu/TJtRpjUIajPgSJKXB8LgJjhJHuUlP0GEfSWJDeW8sVaIVeKiwo+oIPn1IQkXSeykqSbe4wWZWrK63wk4W5hWstiO23T31dyFIXEAP/zUsnA7labHm0KZTorifGU2VLbU24gpIQt9xbK9JsSgpUmxG23XF2oNWpA7HH7RZkV+D3hVJqWTOIMdye5PVlmsOgrecdRrgOO28xVpGti5uSLKSCTuAMUmXaZUqfXJPDysONyqNW4jq4LQcS8y1K5K3Y0iMsXGlZRpOk6SF9L3wORy1UXJDwYTFqkZfLmR0k2UOoUP3kkbg+xHY4qYGa3KHm3JhUeXHy/OjtNrv/oEylunf0s4R8hitSMnjrPmdZpWFZVTlecfD5SPxLnvVvLfDyrPL1qVTX6QpR/KY0hRQP8Aw3W/0wtlSm26Ul2SlUiC4sMTWArdCkmwcR3CgQDt6j6tfiPThBytmilpTZWWs3Lsm1tDLqFtH6XYb/2hhQyGyV5gh/ldZTKR8ykpP80A/XFmo8RfRYNO34y1eqqskqy/VHCqS3TqvHqMSewnyOFDgJDlv2bncg2Bttj9i2XUvtpdbUFtODW2tJuFIO6SD6EWOPyi4ZMrzHTTBmKEqBOjBpxmVUo6SVKQPMG3BrVsfykY7r+xNm+TmvgDSoVQfVIquW5UjL8pazdRMddmt+9mlNC/tj5P/wCSUeJStw/6nH3lz2bfh2qPWfOOEVtrOLCkoCVvQ0LWR3IUtN/0SP0x6yzwodzTTVOQUqef0ailPb54+cdFhWc2UA35cJtP11LP+eIOROKtUyEh8QyhYdTpIcF/rj52ncalxLgKgnIn3hlGcy/xNixH/wANaucwoK7HlqIH6gYfK3Bfc45ni5ikS85waq8uzomNurV7awVD9L46ScsFEfrhfUr5wZL1JweOk/O25HTbvgwi5ujLaTz21tudCEjUPngPx9Btj7hkDjmfOq5XpHDw4r8J/ODEdt661oWkeU2Plvsfp/LFrxY4hZcqtLreSapTX6nElsqiS1trSkNki+pJN7rQrSobW1JHphK0mqSKNUY0+KsIksL1oURcA/LH2o1J+sVORNkqCpElwuOFIsConew7YT/CL4wf0hGtJiRlMhWQaUIg0y03huLWoqLa2yULVYk2PlUbetu2Bd6GlAahMi0VvzuqO5cVf4T6kncn2t64IcsuqkZezNU1E6JNRkSUDsBrAH8wcU7EF5mktO8talFHx6TpKyAdN+mok9L4+z6jmaqwODLbI1PNXqENnSAJMpRcJ2s2lRKj/wCGg/piDxIzI/UpCjGul+a8GY6R/o03vf6AX+ZwScNnIcJuQuUso5VKe0EAklxYCAR9C5+uAhbSpmaXFEXTBZCUi1wFr3J/2AP1xjvNId1pPpLSkwkUmAhplCnQ0m+lIup1Z/zKj/PBTV5LlCafo5kaWGCFVFwGyX30A3v6obJKUp6eUqtdWPWWWWqBMpVUqTrbbalKlRYmkqckKbCi2T2SnmpT166cXXDekwKnmSVVK22J1Jy/ENXlRHOk10OIbjsq/hU+4gq9UpUO+FXOOTM2WjlsZC/mYY5VZVwoy03Vy2G+IGYI/NaK0guUOnrHkSB+V94WUT1Skj1GIeWsmv5ljuT35jMOmISqTLny16UttA+Zwk7m+9upJItckYpJsyoZ3zE2qdIW9Mq8pb0yT0JbHmct6A2SgegUPTHpurS+JNWcixl8nKMN5PJjtiyZSmzbmr9W0m+hPTocSnJJJjen07qhb/u3f++kPG85ozGDS6K2/TMuuJssuDRKqmnop626Gh+VlO1rFRUeh/Gp7NNpz4jlQZkUxDiAoAW1NeYbdbL1gfIe+FbTWijNikb6dBKflpw4GI18t0ZZNlLpridR3A0zZaf5AD9MSbyD7sOVXSsmO+c/HiIiEpwZAiXSQ7DrjYKTsUgztNv9hwfQ4Ms/VSo5d4vcOK1TpTsJ6o0ubAdeZOklASl21+wJIwW8S+EcbLbc2JRJnj01iI/KZQpSSrxDRSGnBp20rISQOvlOFpxDzE3Wq7weLavM+3Nli3ZHIRYfUbfTBq/PaMD1z9ocXpqNKbE6TqjgXmaqZhi1Vmpy1zERS0pt903UCvWCkq7/AAg7+uFr9p7OZylMq9RbaMt+HHYYjsA/tHV2CE/IqcF/a+BajZtq2X0qTTKi/BSpwOqSwvSFKAsNXqAL7Hbc7YhZ/W3xPRUU11vmonKStxLKi3pUm2kpINxYpSR8sK16cJqBY3uyZXZt6zlbNVcmRPHU9ExxyW6su1yqpJSuU/3aSr8raAQna3QDsomgpOV6tWKYqZTqbGi00bJkS/IHTfqlIGpQ364Yc7hdQIGcJEIVGozKLS2hIqLUt1Kwt5Z1NsghIJ2BUrffUkeuKjMlblVya8lD7FOixyEKdeUAyxsLNoTexUNrk9Og9vtRYpA2w+/f0g6xRczcPZS6o2yxLpwV/WmY5IQ4i3mCkKHzsR9dsdEcJnaXWEmkuSOXDfjplwnlWXqYXsW1X/dUbeoCkjCTfqFWoLUYu1EVelzFBpL+lJ0LV8NrXuCR62ti64SVqTTH6XyCW/u6pvxjtf8AAdbLgH+0W/0wtepdC3cRnTksdhjV4ifZ4jUaNGl5Yp0ZioNrStp0qIKr3C27kkAaSbbW2HTbCfzNWFOUZqptxJLTtNf1yIEhJbJsmyt7fl1g3tbbHY1CzmiVHZTNih9pdvOLEoJ7kH6YXPFbh/l+rqq+Z4UlQkOoRDlwVNpSh1JUEldyNRUQtIvfonEyu9HIJ7RezS2o2HWc/wCXqpWHFPKbT94OJOtccLS1yjc6ShVt0kXBvuFIV0GDfLWe/v6SGHWXg82qzqZLZQ4hfWyr+o6EbHAFkq1ClBcpwldOkKiSVk2/DKi1qP8Ae8Or++r1wyZFEhT3vvSOeatTBaPJWAl9IJsCQeo3AN/zHHtZVVk5X5Gaagbcr1hY9R4WanmmZD6Uwg3qXpBCmlg7K279tvfG6dw6rWVctuGhzDmCM4h3xECQEJkpZW3dTjJTbmWso8vTc32v0wLZIzgui1d6mvxda4zTXxm/OQUjzAn0WFjqeg9cNPLVaplYmssOvT461MhA0u8sA9kpI9Bj5e19Ro345Uc4gkODOWZGXqplmrNQE1WJIjRW1AvOtakgAlNwtJFyCk7Hpaxvi3ydWoFQq0OLSi86xFWlSZJFm3yLskA3urd+5NrXG18H/wBpPhm/KVPzdBejLo61wY0yK40W3HF6+WHdafK5qUpOoEC4HXvhdZDpgiZrgxkp5MVoLccULANgqLxJ9Bdof7Qx9jVemr0otBzx9ozWdtgxGQrIMTPGcKhOgim099uSWUtphKbSeWlKVLDsdxpwqKgpRJUrf9MNjISOKfDqqwn4FU8ZAlSUU3nz3GalDSp5QSkLB8PJQN+qVu273wochV2Cp14JnNtyDPlOKaKxzUJVIcUm6evwkY6CyrnGn0tqlrq8xpmgUmYiuzJPLW6ShtKkpSEpBJOpSVdL3T74iazWPUwqKhh8ROj/AJc56xPcOssyMj1qdlCrLjoqmXZ7sOQG3Roc0kL1JvYhJCx8rYcnDzOUGDS+NNZeZkU6rRsvVSazGmMraLjbcZEVt1vUAHEEtp8yCR5x64QvH+vsUnjpxCnORlT6Y/XeYJcRwJciFxDXx7g6SlaCCO9wRhjTKfK4rcMm6NTam7GzZR2pKAw4hKhUobqAl2NdW1lhLQCt9K0A2745qCFdLLuFbHPp3mxcVYp6RUUzMlR/ozAoVKMilVKk0oP3aCXee43HS400NjfWDdSQL3sMMysZTo2WYOaX5MptFIlmLFjSUMuPwojTbcZh9l1bakLaefLCEqsSQLAbkjAXTstVjIUmHBX4KUa7CM2m1Ga6qM+hhpIZ5SQkOaJXILTm2rZRuL9PmTWadm5UqTKqbL0/STDaecjNTKmDHUpwOBgpU+hCrEawbqQdQBCk4Zcqcuh4+Hf+mDQu5wZ1F9nbh7OzFVWc+VYvQX4Ul9mIhlmW2JyFN6eat2U4p15uzirBSEedJPnAScNTjRmVWXsiywhSm5E9QhtkDeygSv6aErHzIwdtyVPRmVEWUptJN/lhBfaLrYlVymUttRKYrKn3B6LWQB/JN/72PlfEOq1ILDgQlh2riKeNIVHUlSCUqBvcbYm1KtTKy4lyZIckLSLBTitRtiuONrTRdCtPYX/wxZIBOYJSSMToz7N9A8Fl2fVnB55r/KbJ6htu4/4iv9Bh0RVHWADt7YXPBIgcNqSPRcgf/wAw7hiw+pOPlb2LXEmNjhMTRm2qR0twmJ0fxLKtfnSrS438O6T3+RxJyTTkRpb0iHLTNhraILStlg6h8Sf8xgW4hPf1qC3e3kUf1P8A6Y98OpKk1aQCT+wvf5KT/wA8NU6nacPEzVltwMahaalIKU9R0Sr4h8j3x+bv2seGFYovG6sSIRizIimZFdbYijTIQ84hLYDjfUi/NIWkHrub3x+hlSzVS8uw/GVqoQqbECgjxM6QhhGomyU61EC5PQd8csZ24yUvMHF+tspzHHmUiNKLXgKvSC/HbEZoB1cd9rUsJ5oBJ8tze3Y4+q9nuGJsWTNfY9SDbzzOJMuZZejVGrOOAIRS4bEZ0ntZKnVq+VlJ/TB7wwrNHXUotLfM2HVJT6nA3KiK0KVa4TqQVAWSkfERh4Iy5ws4q1KCalGWqc+8NTlDYdQVlAKnLmQgK06RYgE9O5wKcepuR8s5men8O2JsqstU6WiS3JaUhtp6yDqJKQbobS4pQHoB1OKd1YtrOTPaH2sfGWrbzFnmXLEOsZIzVxGWku5gTWmYNFdW6baRKDTbSU306S2gq6b6ib33x1X9mOjJ/wCmjNcmEh5EChUZukvuqeWtL0mTJVMKbknVy0nqbqu+bnCTpfCzMGZsp8I8lUAQE1Q1B/MClVYueH0wmkIBXy/Pu4+kC3cjHZnAfhtL4WcPmaVVJkao1uTMlVGpTYaFJaekPOqWdIV5tKUlCBfeyBsMQNRYor688gD4f0T6zdniX3EghOTaj6q5Y/8AxE4T1Bg+MrdPYtdLkhtJHqCsYb3E11CMpPJO/MdbT9NV/wDLFBRYtBczfl8UVTikhC1vh0E2WlCiOvuO2IoGJkjmM4qVe9ycJT7QnBKZnZ6n5vys8uFnajJJjrYUELlIFyEBR2S4kklJVsbqSrZVw7VkIF8eUOJX03wetjW2ROMu4czjH7GWZV0ziFWKNOkBa65HceSnlck+KZdWtSC3+Reh166e3KIttsyvtr5cbqXCSHVhYO0irRnge5Q6THIH1eSf7uA37V/DmXkLMsHidlhSoHMlNipPM/8A2aVcJZk26WXs0sdCSi/xKv74o8boPFn7LeZFvIRAzFGk01ibASb2cM1gpcbvuW1aFWvuCCk7i5oMhe1L06d4DO1SpnNSXFxacpxCdTrOpTY9V2ISPqojDw4K5UVNq+UqE634hiRVvGS1kXCmYbQeuf4eeWE77G9u9sJelHxUqIwRdLslCf8AZu7/APk8NjIXFuXk2r6KBTk1OvGkJiMOvX8PFVIkKfWpQBBWrlpi2QCO9yANy6gFvKIWs8Znc0uYxDZckyX22GG91uurCUpFr7k9NvXC/wAz/aDyNlxCm49XazFUzs1TaD/XHnF/ukt3S381lIH8sc15e4WZv4+VZ+e/LVV2WnFNv1+uqUqE24DZSIsdFg5pIsSjSgEW1E3GHhlf7I+XKWls1Ws1esoAsqI04mBFJ72QwErt7KWrCApA945nYsKRwxzL9pLNtYzLV32aIywkxGnIqAWUOJ3SwCLKkaDs44VWCrpSNrC2ncA865WDMlynxcyRADzG6O8Q6j35boQVA+iST7HrjqWkUeDQKZFp1NitQYEVAbZjsICUNpHYAYsk9BgxRXGDAOgJnNlH4LZ0znQvDVNUHK1GeeQUw3GS9PQylSVatSXOWhZKTbqUj32x0mltIv5e/fHoC2PSU6sarpWvhRODieQLdBj2E3x7SBj1bBgs8SZq0WO+PQQD7Y9jrj0RfBQkyTPIR7Wx60bdcfcZgoUCczPOk+uM0n1x7AuMfdOO4nMzSoXHS+NKmr9MSCLY0yX2ocd2Q+4lphpJW44s2SlIFySewAwu6ZM2DiU+Zq7Tso0KbWKs+mLAiNlx1aupHZKR1UonYJG5JAG+Fjl5MqfXEZwzQyWqxJQRRqIuxFJjEfEv/tnAQVnqPgFgDjzJrH9N5jOb6wwpGXILhOXqU6NJlvC48Y6k/XQD0Hm6kYoK1mtbRXIU/wAyqSbuuOKRqEdvVpCinvc2ShH5lfwpWoYWvnyzufWc4Zljy5lQbfnodnNvOSHZLymlOhcjXpJWQCB1ctewHQdBbdlynLrNcijQRToX9YVZFkOOb8tA+Rus27hPrhjuZfQFlyC+/TXX3FLcafd8S2lSipRWQQFFRJ3CVJTcmwHTFPBqL0xM6O8OTNivKjOBPQGwKVgXNkkKSobnrj6WuzKhRJjKQcwDcqS5dflVNKlFvnKbQk9NCDosPY6VKH9rDV4PcQovDvPTL8t9LOXa8lESU84qyI74/YOqPQA7tqJ6ak+mEzDWUwmEW0lDaUKHooCx/mDjYmppZD0B5sSWpLSjy3L6UWsCT6J3v8x74ZdBahRuhggxVtyzujOPG/J/D2tQKXW6iuPJmMiQlTUZx1ppor0BxxaAQhOruf8ALB8w+3KYbeZcS6y4kLQ4ggpUki4II6gjH5z5Lp7VNW9OSyGUSkpQhtQ3DQ6XB7quSR6EDscOzhLxWc4TyWKbUnVO5JkuWStaipVJWo9R1PIJ6j8hNxttiPboSiZQ5IjYvy2GnUtRheMQlQIDie59MVz1AEqM6y7y3W3EFC2lJuFpIsQfYgkYu0LS4hK0qStCgFBSTcKB6EH0x8ULDEJ6FJ3HrHA5HScJ5hywaflWs0J8KdfyrVHYIKxcqjgjlX9bsuNfOxwoK0AJzybWKCN/UEbH+RH9046e4x012hcVs6srjuPMZjpLFSjIaAutbKUx3wkfmUlAaXpG5ChbHM2Y4Slzoj3xeJaXFUUHbUElxBv7hLgv/Fj2n8jle0dY+IgPedG/YbzO02jOGV3F/jl9usRwo9UKQhlwD+yppv8A8QY6pFsfmZwkz3I4c8Rsv15Sjy4EpMSck7c2E9+GtR9dN0r/ALTWP00KRfY3ttf1xrUph8jvFl6T450PphVcWIb1NqdOrkRSmXb8ouJ6hQ3SfqLj6YbSmFKb1W29cUGZqOmvUaXAVa7iPIT2UN0n9bYk2jEaQ54nPAJVcnub7YPcpT+TkLMjd7KQkm3/AHidI/wxDyvkuJWXZzM+qNUlyNtoesLqFwepHQjFbTHW6fMkQ5DyvASFJafW0m5UhKwbj9P54WboDDdcgRg8JIiWMqFwAXekLUT62sn/ACOMreWZLUGoVxMhptDT61JbI8xAVbr0vfoMEeX2aYzQ433OXfAK1FBevqPmNzv73wAZySpFflN6lBtakL032uUp3tjBbzHiD5YDE5p45ZB/oxNXlXMLycu5QdlqqWV8zojr5LDzrhdMSTJB/qym3F/hKIAICLKukpwEZjzPmDP+fOF+U+KdCp+Y26dU5FOFadDakShKirba5zVikuB1MdQWjyqKQSlJx+hB8PWaC3Hlx2ZUSTHSl5h9AW24kpF0qSq4I9iMcafaj4EOcLMuN5zyRc5boU+JVZdCdd1CmpZkNul2KpRJDQ0q1Mk2AUSiwBTj6TQ6xbiK24b9+nHoYBxxz2lbxjptSqWXcmyqXNbjMuURgKjuJSpvUhpTDiQClQSQtIVcJvcdQd8czZ5paaHnGEuS466l6mLS54VKgXHG1psQlO5P4qrDHYOf3US8nJhsR1GRQqvPgKQlBuWlrMhpdh+UoWog9DpOOVeKtDm5hmwfu10szacy9LfcVdKW46hyioqG4JWpsJACiVDpYGzWgLb9rfGN2sq0Bz2gnS6vRxkurUFx9bEhgVJtiI+2sPrbfYKk2SpOokOLPv5SffFTqnuwBUEROZTkPtVB19xSUoCkxlNPIAJupQITcAHf3GJleiZoylLgLzNT5EfmOMyESHmFMrLdi2XCkpGsFLh3G422tcizoNRq9HppiQ2YMltl+QqM+8pQLOtxaylSAkhY1L1A6hta423+kUAcmfO6hmvUNTziW3BygsxKnlmuNVKFW36PJhzJFBKVJcdYYd54S2SUoccCSdr2JSLAjr+tcFj73pkSoRXA7GlMofaWvylSFAKBIO97EY/MPiHlLL2XmOGdby7TmqZCzTkmnz5SY4ISqcglElZ/iJcaB/s9sd2/Zbz0vNX2c8gTS4ebHpqaa9qNyXIqlRlE+5LJP1xG9qJVYosfoOIqi2L0MYdey1KqFIkoDKlKSnWkjc3Sb/5EfXC7l0Gdyg+8jSkWQAsgKAA28vXDQk11bcR5ZSkhKFG4uk9PYjAIznG48z9QZ7/gyrj9FA/44+d2absTMvZcvQQryVSFu5ejXWhAQVpsVb31E/54G4r1WbnLiwV6GX3gHeS0o6gVb3Nttr4JMuZkaco0x1U+X+EVEl1IuPKCOh3xX0uaxKqUdBrk13zX0FCrG2/72OFa1HkODOZdyN4zCA0aQpRUvSwnc3cIH+OOb69S6BkWtTorFWjxX2X3ApcCOqVNI1GyQ4vS21tb4QVD1OH9X805doEhlqfLd5rx8qbgkD1IF7D3wjM758yvRuI74bocJ1hxxpb9SfKpRIUhKipLdwm+/vguiRUY47wusLOo74iqjZRq+cKu+qmxZs5LjivxXfOrTvYuL6A2tc46ydg0rKsVJrdWZbU2kf1SKea6bDptf/DHOPErioiquoiUOsVF+mFBDjbjKIyAb9EpRba372+D/hXPodYfpLtffDVOWwC6okgKWE2sSNwLg74Pq1VtsY9nu+DniGdW4w0SRQFM0lEuDIK9HhwnQVo7qUre9x2BvfthB8dMo1OFmVcupwnISJcFp1nmFJKgLhXQmxF9wbHB7npmif0rnCgX+69Q5ZJVa9hqtfe172vhUcX80VGo16N4+a/MUIKW2+asq0pDi9h+g/TCtWfExKLHyRPTGAh5QFrYY/Bfg7O4mVNSI6CUN7lR2Sn3J7YXE0kvKOGXwj451XhXCnxoKG1olgAlaLlJHce/XrfFSzds8sFWVDZadA1uBNyg2wpEpTUxsctbjLliVAWVuPUjAmuY7JfLriypd76ibm+KDLHEN/PcWWmQo86O7qKSeqVbg/qFDFwkWGIXhtWfN1lEur+70nNtBfhNT80cJZ8QtUNyoTmKLUwsAKcJTJXGt+VbfPCkHvp6XGB6JT2qa5l+pgBuRE1UiZpuOYNRZUCPZ4IWL9PNgkp2WkZ1yPxaiyVKTUImc58lh1KiHI7iQ0W1pV2IFiD6JxHaqcXiFkwfij7zEYRqozp5TrEzQOYVJ2tdd1A9FAgg4+lLeZivrz8yOv1gACQM/SBWYaimJWDNhodE2GAXWXWlNiTGJOrSSAFgEFSVC4um3c3Fs1MtOPuFhwKQ6gSGVA/Egjf/ABv9cOjiDnWNxByPwwfTFaYqVNpcqkzwgAqQtnw6NB9Adlj/ALw+uEUI6o8ZlKySmNMWhAPZtwA2+hJxTpGDJCXPfVusGDkjEOeKFa/+sGbDyuazmeg0yaTf4XVIjulY9+YlQPzPTCqahpkzg8XQ2pVOUAk/6SzjdwPlqJ+hw0s9Q+flTINRI8z1Km01wjuqPJWUg/3FIwPVan5NZ4ZZZmx6tI/pv96OsSacpB5fhihyygdNrABs31HckWxSrbyiRNOy1oAByTiReGOZaDTKTSo9UynBqcplZaM5+fIZIKSbXDZIFgAPhPbHXP2IKkik8RuKmVmQ2mHJVCzBDQ0+HUhDjZaesofFZaWxfr62OOI8rVR2kTKgEJZUUyzpS+0hxHmSD0WCMdCcLc/r4V8c8kZjqMil/c1TbdyzVJFKW3yWy6oKYUvTYJs8hBJsPKT64T9o0ePprKxzkfpzHaz4OqVvWdD8ZnlOcQp6Sf2bbKB/4aT/AJ4XVUrMKjttqnzY8JLzgabMh1LYWs9Ei5Fz7YO+K73O4hVlW+y0J39m0D/LCC4vNxVVWjqdadkvoYk3jpQlSC2rlhRsbXVdKQPYq9Rj47R1hgqN6T6G6zYhaHtSqbdLiLedKhpOkJSLkq9MbOJ3GirZsrLZo9TmU6lNNNltthxTK1OaElxSyk3NllQG9rJB74QEev1uBKodNcnMror0gtRY8hKg/wArkrWAparEFGkJSm3Sw3ONmaFKq1cp1MAnJiBt159yPzGkaxblXcTbpZe1+tr4rro1DBmOZGuu8TpJsStF+YW1JSlk3sq9iLX/AOWDfImZ6NRqhIkVCkRswMqjrZTHfcUkIWdgvbe4wrO98EmUW2zLaK7EKWAr5YqWou3MQrJ3DEvvu2Q9qcQwoIvcbdsQ3tUcKUQSUAq0+tu2O/8AIvDbKebOG0FEWLHQVR06pCUjmcy3mufnfbHHnF/Kqcn5umwBpuy4U+XpiTp9WLbNmOkq6rQ/h0FgOZy/k1rmcJ06Bda4zy1Ad1FaycTJU9lWSKZBbSrxD8zxBJTtoDKE9fXzY2ZFYEaHW6MpISiBUZEZKR/q1HUkn5hRx9U0mRlbKiUJGqKzNbfI6hxCykX+iU4+yzmSDgsM+sqctnXTaio9W4zDf1usn/LFFSTqm1dz1llP0ShI/wAsXOVXAqNmBoHdIaIHtpVihpCgJNWTfpMWf1SnHT1j1Y5MM49XbqUKPGnQGJLlObLcaUlxaFoBJVpWkGygNRI6dcFGTVqYydxGUL3XT4CfoZqCf+EYXtGcKnagLbIUk/Tlj/lg9oMkIoOdI+oIEmjsuJ3tqLc6Kf8ABav54Ss64g9RWFp8vqP1n2A993ZVrFSUrzopwjNEjot5Rvb32RhgcA8swamYUOVLTS4kmWiMqUq1mWwkAddvYX2uRe/TCur8gf0Qo1PR8U2c064f4G0a7fqgD64YWQ13yu612K17fMA/8sR78hCfUys6s9bKhwcRjcV8gQuHXE+DBhT1TmXo6XLulJdRq5idKtNh+S42GxwUUEt5horMaG62qoUxD7LsJaglxxpTing42Pz2K3ApI3AAVYi5wBcVHwxn6VOVdRekImA9yl1pDoF/YLAHtiblOotR1ePdc8Oh9epKwbFtQ2BB7EHcH1xOux6cRHTU22aSss2XHOZvbrUlWelIcUFtOwosuKNIH7NAafTfqfOlJ3/e9MLPNcE0TjvApSmgYYpcmTTnjv8AhuvJcUn2KVB1I/h0+uGxxcpjseRTcwUuOkytIqceO2nyrUdTcyOPQLKStI6Aqb7YBOOIRU8hZb4iUUl9dCcRKOhPmdgvAJdQR6gFJ9tJx2htty+jcfXtHFHi6TCdoecPsmxM1eL8Q6U8kDShKrE++B2pQxT6i/FCgtDbhb1eu9sQ6TVloQ3KiSDy3kBaVtqtqSRcH9CMCXFSu1CnQKcIchcJudORGk1BtsOOMBQNikHupQSm9ja5NsHrqdrsE8Sczp4YUDkd4o0ZwRJo67NvPSa3UJMuTIQglpADqg2hSul9LaduwT7jFFlZ6JENPkVNxplkxVuIdfICBJUq7lydtViQL/xWwb1zLEeFS2KZBQXWIVgG1KsXE2IUAr94g9dhcC+A5tysUEtMRafrckK0iK6QUqctcqStJNrgFSgrYG9jj6Gu1XyFmqnGMzYiEt+K202hTTVQqiXmGCnTy20qStStJ6X0KX/fHri2yU601U6j00OVRhKR6lLCVn+ScToFJkxkOTqu+3IqshssobjizcdB+JKQdyTtdR9MDrxlZTrK47cRNZjyXXKilth0tSYpKQ2o3vpKdyACd9xjr+cFRH6Gw+89I7mKtJiS3yl1QYdSnSgquAQLdD0xLzHmGLMhRo78ptqorQShsuJC1pB3sm9yNvTCnovEqBMfRGFVbbfB0+FrCPDPA+msDSfTZJ+eLKt0qXVKm7Lb8JHjzPDqecebLjzfJUSkNLTdICtupG9zv0xG/C7W8/EvNeHXycwPmS/DZyzO2lNkkB638SYyHv8AiYGHVn/I8WmNOKpin2o1XSmIzCQvQjxLhShDgIsoEAhRANjpubm900UeLzxmFdrhbio4+kBYP/FjpiK1Ez/lHJaGyXHmqhHflpvpcbQI7t1A9rHTvvuRilbjyAyBbkMSOkUk7KMjJmbaKZniFxHorsNla3Nag5fmHVfcgpRtfpo6Y209ypUWnsZvekSZ1LkreEiIlKCiK2lyzS0JA1EaUq1EEnzXsBh/TcoQalTjT6w0xWG2lhQVIbHmG5SpQ6agCQSLd/XA443R5NTkZXhwkOxVxrPMJSAylopKVAAbWt2HriYdr5DjOePpFgoOSISZJnUXPmWJOXa5CakUOexd1qQrQUJuFEE/lKTYhXUEXxyJQqZmSisB6RQ5k2mrQiQioU8GWox1G6Q6EDUbhsJKrWIThi5RzD/Rykz6WtMipS1vy6Q3AuFOu/iOoSkk7ABtN1KP5Rc3xpy5mquZAPJdqVJH3eyxTnVS0rPNUhkLOlxC+oK1jZBNkk4BoNM2k8VRyCeAf2h6VDdZTM54azHTJkeO1ArT6vgbfUEuNLuLH95JHXcDcYv285Vir0xphL0+n1d2QyUmFFcjogpSolai7ctu+W23Qk2wQjP2Rc8Q352bcpU2czGCbyGNDryyogJCFaW3k3B1AkAWCjq2xe0/hhw3q8uM1FmZ54fuSo5kx483mJjPoGm5bMhDoVbWkkBfcYYcVZ8ykY+ohWqOciKCsiVWc55wk1OQJ8mr0dyfOeWjShx0KcSFaRskBJSAP4Bhi8D80TstzKfHjNeNnw5CojbbywStpSiWbq73aU0oK3BuDvvi1PBbLuXMw06M/m2oZgVXNcCQXWWEERG23HlIGkDSVKCElW5AURa5uBR2aujcVMzrpEJyjpbmNGPEfZsAG06A40lQtylaPKBceU2IvYL63bqKGTrxn9ou4PBnTuYKLlHMtCcy3mSHTKTHqvOCYkptpxLUhYUA+0dtKwSD5AOmFFk3MdMp8up5O4lZUhzG4KWILzbKANKQEvMuMONFKktKC9QSlQtcgg3OCrPU/K2ZsnMwc3vRmTUYJcZeNkrQ6gJUVtLPwrSoggD0I6Xwoc3cKKhQGcnVVFTlU/MeZMsCoyZctRk86W28pp1twL7BKowGm2jSbXBtj5z2XpzZQyO5Bzx14PqD+sLtZ+VnS9Fo1Qy/k2XVOGnEB+BQIJcqFMy3UoSH4LTCQVSIylqBkFIssoAUkt9LK7ALucZfElqHmqa01HkVaKzKUxHVqba1NpshJPYdN99sD3ADjFUEJabejLgriSXWFtpd5jYcQSlek90EpV19MS61SoWROMFUylT1PxqRVobeYKPHfUkthLqlmQ2wbA6Er3CCLjz7kC+GNKLVuso1HLjkHjkd+R1gnO4A+ksFHqMWtPiqVp2/asOW+YviscaLVwo74IctzGJMmDFdSttzWppDih5Fk72B9bHphtz5eISognE6N4JulzhrSFXv55P/APUOYZkJtYRr0nST8VtsKzgaoJ4fw2R1YedbI9DrKv8AzYasaoPCIIuxavqG298fLXAeK2Y6fcgPnp4PVwIv+yaSn/E/549ZBVpr+i/xsrH6WP8AlivzcvVmKWfQpH6JGMyrUmKXW2pcp9EeKy264884rSlDaW1FSiewABP0wNRkgCAEQX/0gVYq0DMWVOSHFQYtIqUqGNOpKp45Y6dNSWzt7LX7447ypVZMKJVTEmuPsJb8DGcULqKX3AXbmwuSEhVyPze2Ou+If2k6R9p1NP4bU7Kz1IYzFVo7FNzTVFsqDLCdTr0hLZOtl4stqDY6nmi5B2xyAqU1HhJkpllSENyamHkNi8g/sY21iBqSQe/TH6ToUaugV2LgiIXBWOeuY3+C+f2sn5hgv1SnKqK0MyIwiGSlhSlOOBXNZUvyrNgQUg6gVHbvi3kPN5rr9bnNDwgcfRAQ0XA555D/ADH2lKGxUmK3Y++2FtQmTVcyxI0tDUhiJBK3kKQFILjqgncH2aX9FYM86yvuHJURqBG+73aZEqNYSlhsJSFpb5TWw2AIfd/2MYubcQnTMJR7PrrtOpHWOfhPxqy9lfixOqlYhzFUGmU5rLrVbhR0rhxXHZ61vF5RUFfF4VBUhKgnSdRFsdsqSdPofbH5lZPp7jGU6vSWoaJcZvLblNiNrQFBybPfTBjEfxjWtV+v4ijsDfH6ZxWBDjNsatfKSEBXrYWvj57XVqMEfKWgcQXzvmOPQaey3LiCYmStSQhXayev+9gS4UoLmaUP6SEcl21/oLfzxs41SyJ9Lj9Qllblv7SgP/LiJwjnLczK1GOyQy6U2+h/yxMCkTpfPEcExZWAkbDGlgKQ4LHbqcb3WyD0x8YSrnbjbHgOYcOAuJ4zDQoGaaBUKPU2BIp0+OuPIaI+JChY2997g9iAe2Py+zZleVl7NczLk9Zcm0OouRHnAq3NQi6m1kdCFpLS/mr2x+qOi/r8hj8+PtU0yLD+0dmJyC8Frmw4T0tsDZmSWw3b6tIZXb+LFvSPgkSfYICUmGtU5LbTgS6iKt5JtfSpZ0pV9AlX64cXBnhLIzLWUZWgFcKHEZbXXak2bORmVC6Yrav9e6BdSuqEH1IwA8LookZud5yQWESWm7kdUIbC7fK5x2f9lqliHwbpNTW0lMyvPSKvIctu4XnVKbJ9fwg0B7JGB2tufHpGB5U4jOpFKh0OmxqdTorUKDFbSyxHZTpQ2hIsEgegGLBLeoY+JQMLXjlxQORKCmm0pxK8zVVKm4aRv4ZHRchY7BN9r9VWHrjSVmxtoi7OFGTGU6UR2nHXFpaabSVrccOlKUjckk9AB3O2FrD4+Uyo1WQxTaHWKrTmUFz7xiNIKXUBQSpxtsqC3EBRtdIN9iBYgnn+FW6pVQxQq5WqtVafo1NMT5ZcbdINyF7ArI+IBRItf0wf5enLYWy1HCETo7okQCo6UB4CxaJ/cdTdB9CUntil+E2DzdYqbs8idEUGtwcy0eLU6ZIRLgyUcxp5HRQ+R3BHQgjYgjqMWCemE1S66jKbn9KaG07IyvUlFyr0pI/Fgu30rkJQNwUqGl1I66SobgjDjjPtS2G347iXmXUhxDiDdKkkXBB7ggjfC20QuZ7x904wDfGxI83tggXmcM8hO2PQFse7D0xmkHBcYmczyBfH0i2PuB7N2eqVk5qOmY449OlEpiU6I2XZMlQ6hCBuR6k2A7kY7x1M7L/GYV9J4zzZmf4GWJmVHoD0vX50VBqQuOAgru6hFwjYDbUTuPUXZ5B//Rj09PCumETxXzXLz1EmQ6S6lvKNPf5VSqAeDZmvA25DB5awpKV6dZtZR8oPXBNxAzS/mmpS8pUSaqFEjJvXqyyqxiNkXMZtXTnLFrn8iTfYlOAnM0qHHjwoDMNEODCaDcOnjZDCbWBUnusjpfoFepJwsX8+0TYXjJkU5hrwfYi1OU8lhxpxyOJrMV9shC0tqSA2lopUNSNvS57YoZvLaW4SVOLUvmLccA1KVYi9gLAAXSlI2CdtzqUrXSqqwYFPYlvJ0UqfKjqfWNtHgXyBc/EUoDBNr7qHfEesPhptbmoXINu+/pg1QC5gzIch/S63dW2oHbAbVanDpedX2nH0pVLgtLcQNzzUXFrDuUFJseyRibmCufcFPVKeLa5iklTbazZItYlRHom4J9bgDcjCuYi1bMM+TGhNPSp7uhctd/xEJWtCEov+8pS0X9LgdAm1LToWJY9InY6qOZsakNP1KoBv/q7j7jzB/eSVXV9Qsn6FOItTQtqY6oJ186MW203tqIJUtHzKTt8j6Y9tTPCoNLmARnojhSy4oD8FaSQUK/hO4v2+gx7qSkzIgZVcOOrSlvexQsH4vYpsT9PQ4pRcEMMiEkeqNzC0pptZYda5rb2myepCkHuFA9ji3g1O6TFfAWy4NNlC4N+x9sL+kvyYFTcjvaQpYLitINnrDdbY381rBSPa4uQNRK00ZEhL4kFcdTQTyk2Ui53Cgoe23W1t8cnjhhG7wr43yOEDBo1dam1bKZ/6g/GRzZEBR6MEEjU2TslR+G9ibWs0Efaeouu72Vszss/63wrC/wDdS8VH6DHNbdSdCUbgkJ0KB3Ch7j1xSJr1bo1SU0am21CcVaMhyIHEf2LhSSD6Dv23wk+jpdixhltdRidZcQ5lC4rcOJOYcuTES6tlwqqccBJQ/HcbQSth1tQCk8xsKQUqA+IEXIBxx/najuZfqj8WK4ZcB0sVSnuObrSyXUFTd+4SlabHrpUB+W+DLLubJsmpIm019NFzOwgoVpGpiaz+ZC0/6Ro9wfMk7g3AOKCqOu1TLGTZzqUsuxFv0mQG1EpHLUtoC53O6WeuIOs0/wCHdWXoZW0lviKynrFFmKIUvTGE/G4zIZTb2Hl/z/XH6i8PqwjMOQstVVCw546mRpKlDupbSVH+Zx+ZdcQhivAqdSlSUqUEKO5O2ogew/xx259jTNIq3BlmlOK1P0CY9Tjc78rVzWf0bdSn+57YzeN1Yae6MRH/AOIIY5dhbFPJTdeJS5V0m3XENais3xE1B3YjNa4iY4gNmLmuaE+VK9DlvW6Rf+d8V1KyxVa+w+/BhuSGmRdak2+dh6n2GL3iq0E5lbUB8UZB/wB5QxV5b4h1XKMSRFhcktOq1/io1FCrWuLH5dfTCKhc+aMsWxxGflZJZyxTGiCClhJIO1r7/wCeAvNq+bmOT7aB+iRg8pK/EUinu3uVx21EjuSgHAHmBOjNElRsQHEqKT3FhtgZyeBOQgos50Q40ZbLqFcvyqWkgKA9L4r8+5ZbzvkTMuXXtOmr0yVTxqOwLrK2wT8tV/pgWzj9oRzOtFiR6DS5lKYKw6Z7ykpWpA6BtKSSArbdVvL23wmeIvHDN1DjrouX5sl+rSYT82VJCGnFU6E3ZLj6ddhrKlJbbBNtar2VpKTSq0reKBU3TmKG8MORAVc3LPFCnU/Lkmu1bJHGfL8GNTKpRJMksuPvMsJbU40hRLMpCwNYABVZQItc3W1RrVW4f5taazI5Clpfajcp9lpTTcjw75dLbqSSEX1m9iRsk7C5AyrIlIrFUyzUp0RufSXMyIo61v3W9MdfS409JcevrKg8pGlWq+pBV6AC6M7V9ukRadmRlWcqQ4JKv6ysJnRiw/yTpcuOYR5SLkL3Pmx9glILbkP0P7RZnW6k1tHn9q7jtQuNdMplNpNPKJCGXkoS8tC3VOOt6CBoJs0nUVFRt0SOtsIKRNhxmpLLkA1GqOTTGYp7Ti7SV6ElJUgkp2QpOpRFgBjbHpGWcwsqfoNTmIncsLsH3G5LANiLtKPQix3SoEb3xX5Spq6fHk1F6S9Iq1R1h+a4jQoMBakIabI+ErDYUpQ6JskbkKDwA79onXUujq2LzmWLmasyzKRRctVGuRPAZZZlIhMQ4CVCN4l/nOshy+pyykAAnYabdQQG59nDjxnPhhVcr5eZqaKllGoV1mJKhVGG2ks+LlBK3WXEWUkhbuqyipO5sBhT5VppmvVBxTaWWxI0JQPKUpQhCdx0AsLj2Iw0+BXArOHGpTdSpLVPp+X6bVor33xJceQ3J5T6XT4YcpQe08uxUFJGogA7HC99lboy2Abe8ACScT9IZ6VCmSyrryV/4HCvCrAXwzqs8VU2Yq+xYX9PKcLENuFhTmi6UpJ/xOPzsnniM4zCHLz5TlutJT18p6eu3+QxRQ80RKdLkKE1tEhqO8pvuNehWkX6XvbC6elvvPqdU6vmKvdQNtvT5Y0pGk4bWjuTOjib5Ux6e+t+S6t55ZupxZupR98LfOhUmuukG2pCD/L/ANMN3KeWH811VuGybKUd1HoB6nFHxt4Z/wBFpiZLclMhGgIUQLeYXvh2u1VcKZpqXdNwHET+rfDG4c1QSKW7CWfPHVqSPVKjf/G/64XRsMXGTaoKTX2VLUEMPAtOE9ADax/2gMN3LuQwFLbHEbCj1wp+LSv/AI/CHpEH/GvDYO18KHjDKajVxl11xDLTUQFa1qACRzF9ScJab/klS33YsWK23OeYD0aRB8WXfBqkoARLS24ttZbWCUkhTa7pvqFiSBicotx21uOLS22gFSlrNgkDqSewxa02XDr3D6flGaUExpT02C5fzhh9wuoktK7qZkrcBA7KRe4XYhVBqdLrDTNUzOUrolJZbdmQ7XTKnaygMFPVaUqSVaButS2gbi+LwAJPGMfn6Y+cleIBxDXhTnyGnMPNZU8mItQjPLdaU2CFJStCxqtdO6FA9wbi+Og9ZGOW4sipz6m4/WYKYE6p82oLYccHOaupOlC2wPIAlQQkFRVZvcDph3ZPz3B/o4n71lpZkRSllRVcrcFvKQkbnYWPyv3xP1dI3bkEaotxkGCjDTlG41Z+pCQBHr9CYraEAdHW9UVdv7QS2T74W2XFtwG+I1YP/XYgQ22tVykNohodQnT0N1OL3674JZedRXPtPZOW2wuMzNo06nkKcuVoQecm4AsN09N8Bkmj1tjN1RpFPSzJgZinsQpaHDpUwnyx1KBva2gA7jbThtUOcN1ZV/Lj9o0HBQOOgzKZclTGY23NCkNSpKmloIty1LjtuAW+bRHzOBatLT95zaZqCVlPNFjuN1JB/l/LBlm5mEnOOZokAqMGLPalRlFRUS2hwd+pulu1+u+BqrRiqpVmRJQ2mX4hKW9I3DISnTuD3KlKPubdAMUUYKMxOxv8eR3hTlirUnPvC2lUSXXIVBzBTqk7LjOVMOJjPNvNJbebLiEq0KC0X3Fj64E+KfB7MmQqZTp8sRJlNlnXCq1LkpkxXVjqgOJ2CrX2NsCmX7yI85kjSpEl9KfY8wkf44Y3C7iWjLTE3LdfYcqmTquA3UYCT521flfZJ+F1BsQe9rHrisPLyJCeqyjNlRyOpH8RXRnFla3RZKipJcFr2WkK0kj0IVv8knthlyMx0jN2XHqDNy5Fpyp6BzHIDak3Nj5gLlB33uNthiLxG4Q1HJNaiuQ3m6hBmx/FUqqNtnkVGN1TcdQvsR1B9iMW+bolMcoGTcx0CCmlRKzTNb0dlailE1l1Tb4uokgnyKtforBGZTgiYayu4oR3hPlji/UpfCqS9U5vjc10+SKO68tsuKUQ4htt5Y/7tSTc9Skk9TimkyalU5UJ2p1FU4ww4G3HGkNuq16dQWpFkqHlFgEjcDc2wAVmdIyVX28yttn7oqSW2am2N+WsbIeFvS9j7A98WrVeqLdRhQEqEkWccenGKrlOIsCjSQbBW++/5dhY4k2aYVsSgwDzHWvdwATxCWI7TcwqS6nRLMGSoJNj+E8m6T6bjURi1IvhZS9UCKj76rzVNUA+tnwSzGDjhUV80gEa1AEDRuDf8xODvLNfYrsI6Ob4hjS2+l9gtL1FIN9J6AjfAnqIGRyIKUuJ9Iltw5Gtaj2tb1viBjB1w+wyMRYR9ZL4+V/JcEx6bMW20odtx898BOZ81zM1VR6fNdU686oqUtR3JwIRp6WIQKwbghCUtpKlLJICUpSNyokgADckjFplOlzOIU3wVNWqJGdBR966dSWiENrI0+pS6gJJ6rVa22JhpqpzYRj4xptRbaoRjxFoZRpHE7MvMSsR5jUN4LShRSlR/CFyAbXV3PpjcyyIrE1RsgLekk77E6lD/lg54w1Gg0DOdBydl5uO5D5r86fIEpUh9coJUEtPKJ/0STZIO4sDsb3qqZOpbeQc5w5y0eP5yHIzarBVyvqn9cXKLfFqV8dYu5KdBmLDLskR6pWmt7vRWbfqsHFZCVy8y1ZjqlYbfH1SAR/IYkwFWzHKA21Qmz/vrxElrTTs1R3l7NTWeQFHstJBA+ow3KCjBzL6hFKqlVEDqlpsn5+bF61G55jLSDqMWUhVu4Syty3/AOEP5YpojCY02PKSbKkJXGXv1I86f5BWCjhuiLmSsUunTJqadHkyvCPSlp1JY1hTK7+11G57A4RfrmeuIFTEyJXVK/opS5qbq8G6lSztsjWNX+7fDD4dSQuDJa7oWD9LW/ywKtUGVSzWstVdgonQ3nIshlX76VFKrextcexGNvCeYtl5cN5X4jaVMK9yg7H6pAP1xPuG6th6R+lw+1h0Ijc4srbVHy1UlLShEijxitajYBTWuMbn/wCQP1xW5TqtOrlIdhRp8aVIiqUl5lp1K1tnUfiANxvcb+mJPE+OKpwrpIbBW4iNUoICeoWCl5P/APUjAHl2ouzFsT6Cw0uqRCfEQVoDLshpwBSkG9tKjZK0KOx9bKvhE1iyvPeB0LlK9h7Ej849qHmWIugGi1inoitJSEU2pRWXHHBI2uh61/K7YAKACUqSgE2Ow5wtMCtQM25KktqVCbdfaQ06hSFhl0FTjZSoApUhTjiACNtAx8ylXo+YEFURbgacS4w806gtuNOAeZDiCLoUPQ/zBBxeZ0rLTHErKGaLJQ7XKTy5Sk7FyTFcDLpV7lK1q+SR6YnHJDKRgj9oetBpbgq+62fv/uJnhq4/BpM3LspS1zcvTXqW44tNitKFeRQ9igpA/s4qq0+mZxUS1MWrTApiH4banSEKUpbqVuaOhIHlv2+uCLPpXlT7QuYWGGeY3XqdGnpSVaUpU2VNLV/Im3e+AXLlUfzAmvV+olozH31wWYhTZUJDaiktBR63+I2G5OLqHKG71H6yPqV2WMolbWJ7rFR8eVvCCXSh03TygFKISd973Kd+gH8ttSoMWtR47heW08yeZHlRV6Vtk90kXFiNtwRixiPiUwCxocZAKdhe6gbEfQjFZW/ENwiYqlNyVLQ0y2gfG4o6UJ+VyL+wOF0YllC8GeX0Er0ZZrMh2fUaBR5WYKhFPJcnPyG7hZSlWjQVJ1WChskDr7nFJSJhM9dJ8POjZwqCgHnKwxyC2mx84BNtCR8KBuTtve+GxlbL8zL8dmh1dGlL6nZLFQgulSJLl9SwpJF0rCb2BuLJ2O1sE6MkwOImR51NzFTZC6jCSt2lPLBbklAHlCVn+Lbf97FLxhWdr/f+9o+NyDPURMcRcn0TLdEhUmEfEViUnShl2zoKPzyFX+HufQqO2A+nR3abPkNUmoTKZFht2dWy7qQtzYkaVXTskG+w3OK6mioppM+SuSY85tLglLcSpcoLQCChSlfBa1rW+WJlTqbAo6adTIzxdfSllJSg6Gy5YAqWRYnzX2uTfFNEKrtY5nd+WyvEIcsLXHpFOlyFFyXJRJmPOrPmcUqK8q57dNP6YePDysfci2kpaBcS2lAI2UBYXA+f+WE68y3S5NJKk3hBS4a1WuG0rYWylR9gVJH1wzqLT3FPB5uXyShdy2W73B/Kf/TEXVHIDCWtOoJYMIX5t4z0+kCPBlocYfmkpStN9kggX6dPn79gbMjLVDgiBGmNFD63EahI06SUm1/l7j2wp52WolUYaNSgRJioayuO48Fakg7nooX3ANlXFx063t6VnR6nJjxCfwEILbY+Eeu5+eJ+4DHrM26UshFXAlZxGVQssLquasuxG6hXnCkGbqKmooWA2p0IFkkgC2ogmxvewIwIR+EFRznlalVej1t2pzHXFmoRqopLPLeUlSHS3pbOkp1KSUnVcWIPS4jlGi0jNtTmQ8zQZkDMsuetSJ0WyUpXp18jSdSRYAkBSCCLEK3GH2ioR+GuVozFObTIlSHlMQWXVEl98p1OOuqG+lAutZ2uNKRYqFj32WU4rrOW+PTE5pqUwS3SE9f4VUvO1Ko0nMcl9uXSWi09KjOoYbeSpKSttxS0qASSCoAWUnUbEXwW5h4escWaPR/ujNEeizKQ464xKaZbnx7OpQFNrQlwED8NNiDtc44tzXTM0ZqrriK6JVZqqXy2y88B4ZfVSUx0rs2LpFwhA1Cxvcgk3Kcn5jypmCis0mk1WkZjmkJh6Iq4inHLeYoWANSU3uoglKRur0wk+isXa3jeYZxxxG/HVsrs4nQOeuD+VeCDuTXoMxyLmGa5IRVavJfUmPPjtshchbiFqUlKy640pASU2SDe4ScL/i3FqcSvUvOCXmnaCxBjwnZqSktrDjrmkpIJGxLW/Sy/XD/4V58YzjVpGQeIsClVmvUJ+PJKnGUSI7w2LclKVCyF3WEqBA3V0sSAIUF9mLmOt5fruUp+WmazWJfhKTLpjhpjdklfKafUnlOaw2uRZPlutQSAAMK0XOxKXcso56cg+kT1lCgB06GAHDLLdN4mZidqk+nuVXLUFhBgOyipUYzS6ouLZF/MAG0DVuAbgdTdmcYX6dGHBRc8B5hb2YoykkG5SVtqA+igk/TFhnV1+gJoFOpiI0RU6cmG0CizTSeU46ohCSL2S2q1u5HvhdcSH5NXXwzhzg2X4H9IXtcdepCx4phgLF9wCUr26i2DA72BHCgHH2gtJXzj1lZT+CNQRMzBVsvVt5usmWuZFp61JEJxJFg24m1yVBJGsKA1EKPfG2rPROINBzXneKuov13IlKpMtuO6kp+7y3MkIqEVYIuFBlwki5FlA9LHF1lHibHhTX8uAyRIdKozUptBShDxaLvLCwb3CPP0IBtuDthlcP3o9fy1mmkrbd/+K0SqU6WmUBzFrMZVipX5jZKLKO9gOuOC1q3D2Lz2PwOIzbo13MydIHuutPWU2daFbpI6EeuLqg5ijw2G4rzJJL7a0kAEA6hv7bDADw2kpqnDzK8pSipx2mRlKJ6lXKTf+eGLB4cVmqU9U2LHLjSRq264DcqqxRjiRaVctlBmPXgi8oUSstnYNVV0JH8JbbUP8cErvFigQHpDZeddcZJA5bRIWb2ISen1O3vjnTKfFes8O2ajCVDRNVKd5q1SFEKQdITtb2SOvp0xdQ0+MisyE+XmoDgB7XF8SH0vnLN0jQs3eXvGarM8PM9SlvMBbS1K1cp217fQ4UX2oa+7A4etZbhuKbn5pkimhaDYojAcyUr5cpKkfN1OHBIoGXaNSaXMpssOT3UWe8+o7gEkjtvtji3iJxaYz3xDm1d1pcGm0SFJgQ25JCi8W5K0yZCQnayi2ygDr5ffDHs3S+LqN4HlX9YvqGNa4HWLHiiFuUac3GS5EcivMIhuML0rafLiUtqQRuLA/pfFVU5LVIYUyELkKeXGhxWGUXcUhkBRSB/aLgJ7AY21itCtqptR5gYiDmTuQ/5QtaWFqbSff4tvYY0UZb6J1RnvNJD8CCeWyvcc51Sja/qooSP7xx90pITJi617mVYecMo6+ZUpc1oxpMuUGyyXAvlpbSlsDUNjuFnbuThm/ekJyRnN+THRJbplG8C2y+nUh1xMZ59I32OpUllNje9hheUTh3TmpxQ3VsxUySr8Rb1PfQ9H5iidSlMuoUACok2BHXtizreVKlCTEpf9IqbmSHmiptRZiFQ3oUttDemQ4ogLWlSS3E5flUm2oYkWBLLCQ0+g2MKwMR75L4O0bh5UabMp0iqpXTS27GhSJq3YjEhKCnnIaVfzWUq1yQkm4ANsdG5H4nzK5WYVLlxkK5jZRz0q86nAkklQ6WNjsPbHMOW6UxlDiDR6fSJE6PRKvl+TUnqPLlrlNRnm5TLSVsqcKloCgty6dRHTDJRKMZwPNuFlTZ1BwHSU+9+2PntTuZhls5HEGQVO2GnFyYX84Kav/wBXjob/AFur/wA2InDWpMUvOMJ+S+3HY0upW44oJSkctW5JwE1TP9KqE12TUMwwXZTh87jkpu5sLb79gMbaVXINRUV02pRpa0jcxX0rKR3vpJthXaw7TOe86rhz41VjNyochqXGcvoeZWFoVY2NiNuuJA2xzvlHiZUMgRxHfhsTsvpUt1akKKZTWolS13J0qSDc2sD13PTD+jTESWkOtq1tLAUlQ6EHocaBxzOg7ppzJmODlLLlTrlVdDFNp0dcqQ53CEC5t79gO5Ix+Y87MkzNOaKzWp5H3hUnnJ75Uf2a3VHloPpy0BKB7JT6466+2/mJcXh9l7L6XChquVdsSAPzMsIW+R8uYlm/r0xx7lCImqVZoqUC3IkJU4k/mvdSR/sIbH1Prixp1C1GwwJO5sQ1ym+zH+/aswpRYaYmPpGkjUURG02sQCDqVbffH6D8PMvnK+Q8t0Qiy6ZTIsNYA6FtlKSf93HAMAtChfewjuzEVHMLcVuK0sJ8Q0JKHXhc7DUiGrc/v9+mG7mvifmriEHW6rOFOpbl70mmEoaWkm9nFnzue+6Un93G6NMdRlh6zt1oqwDGXxK+0LJTNepeSVxXPDnTIrL7ZeZ1i122QPjI6Fe6RuACd0paoVSp5gzTU6rWZbc6qLcLbjzRHLSkW5aGx2QEkEDr5rncnGB1CGuU2UsstjzqGyWk27enT6dfnorbtPimNOpqwiTK8r9MW2pCen7VCrGwN9wfX5Y+iq06UrheskWXMzc9JNlBb7ALa9D6CFtL/dWOh/y+RODKhzkVeAxKR5SoedHQoWDZSfoQRhYPVSqMgKREYQOoC1qOoextb674Kco5kiy0cpIWw8+pV0KFiFpSAUk9L239wL47YmRPVuDwDGkl52FX6XPjuliRLiOSJLY3Q46lYaDtvVSNlDodIvghpM52lBYoVfmUKMoa/utcVEuM2oklXK1EKQCd9Oqwv0wEOqk1WIzKY0qqVNC1huwAdjHdxI9wfN8iT+XG16f4tmnyo9RVHgTVmOpOmy0uAKOkK7KJCkn+wbeuJtleTkRituMGNGLmLOEaOKjDmwc0xEH8anGH4OUUj4ghWsp19wlQsdhcXBwwcrZmp2bqS3UKc6XGiSlaFpKXGljZTbiTuhQPVJ3wkqUJNJDb1AU3GltDeO6o8qUm99CzuQdzZfYnfy9L2FVBVZZzFQFmh5jFmZtPnIKGpRTb8N9I6KA+FxNzYgjUk2witgU4aNlY5j1x8O3ywJZW4l0vMc00uRqo+YUAldJm+Vw26qaPR1H8SL+9jsI2f8+u0KQzRKJHRVM0S2ytmKT+FGbvYyJCh8LYPQdVnyp7kNnpugxzJOd89jLa49MpzAqmZZySYdOCtI0jq86r8jSe6u/QXJGELnHOysiTpkeFOFcz5PR/8RrKk+SMm5AaZFiEJSRYJHQgk3V0s11D7qqEilwJ71RrM10Ct5jNkrWpNtbTSt0oSgKHw3CLhIutQIXHFfMdOmZohxaalLECBA5HlNg2gL1An0Jurc9fMT3wGsm2wLjiabyLIGUM8zsiZoj1gO6pqXTrXKcIbmsrI1sqO+k3IUk/vJSSDZWHlD48VPiDHdomXqZ91199ZCpa3BIZgRbC8hRsAV3uEo7qANyAcc5U1MuvSY8aGhx2RMUGYkVAAUva5UskbCwKlH8qRvvcBzMMUvhzllVCpjwkynvPU6i2fPJc07pR3CQL7dkj+0cHuwvlXrMIc9YWMNU6h0RqBStTtPiqUUuOK1LnSb3cfcV+Yarkk/Er2GFlmKoPy5SI0Z9BqMrWvxEk3ajtpGp2Q6f3EDc9LnSkWKhjVIXmyWp1qDlirCGTYeIUiKlSQbC4WoEfIge47YpKNTZb7sxNQUhTy3AKiGVhxu7artQ0rFwpDR87hGynVW6IthRECZOcmGOWlzSYqYtPiSUNSGYiEqbheJTZYZJ1KeWehdeWVuL9PKmwCcVNTmW5099RRHauUotcn5DuSdgO5OLKTAEirOVBDim5CoxjFTizy0p1awdPzA3vhS5yzquqstoSrRHQ2lS1sXuonylSL91nUlF+g1L9CGaqja2O0G7BRmUmac0P1Wet3yqUFlDKCdSNST8Xuhs/RTl/ROCHhTpizp6UatRRGUpZ+JRM+KSo+5ve/vgJjhC3S4tKEOqSBpQPK2gCyW0+wH67nvhtQ6ojMeeanMbfZeb8HTUJXHCdBIkwwq1vRWofyxfChVwJ85qrCRiLiFRDmnOSYAlMRlzJakc+SvS2klR3Uf8A32xXVaC9QapKhJmLvFdUzqYe1NqKVEXTcdDbb2xKhRlIzjFKd7Tk2P8AfGLvMi4jWWJ6V0xBqjlbe01HmK1hoI3b09LXVfBcCZFhQqB0lAH/AL5YDLyy0+2Qtt9GykqHRSfQi24xaUKoSHpfhy02l4qCXW0uJQlKlHZxJUQAhRtffZRPbZNF4N6HJQiS27FdASvS4koUEkagbEXsQQfcYI80URui1QsMVCJNdZCVNyoytTSwpIJSfXrYg+mMsPSNrYM47yY7WEtvrZRHkvOpUUlLbJsD6ajYfzx8lSlSIikTqa8iM4CLq0rvb2SSdvbobY1QJrEmKkt2Rp8haJH4ZHVP0/mCDhhyolSo6mctVuKt6I02qQhEZIcWwFXUXUkbkJsbg7WuLjYgZE69uzEWzKNelPPLxbOpqW2bOJI6Xt0UP5/qMWSFKk8OMyFwgyKbWmppUkWulaEOE27XUyrbpcnG2t5cep0oFY0FQ1tvo+B9F9lA9CD/ACNwbEEDZk5pEv8AptSX+kqlR5JHry3loX/uuj9cSvaa/wDr7vQynoGBt47xTcTYQ+9w8kW0WcuDvyyQFkHt8O/tfDb+znxckcMsw12nM0o1hytRm3Y7JkpjtoeZKwpSlm+xQ4DZIJOjphfVunmfRmHHUKU/F1MvXPxWJQ59CQT9cUUVb8ZqHKZ806C4HGgo/GU3BB/tpuP72J9JWxQrdI/cpUkidnU/jtnGHO8RVKPSalTT+0iUlTiZLSR3SpxWlw+osm/a2HBlHOtGz1TvGUaamShOzrSgUvMnppcQd0n5ix7E45BoVaZqlPjVCA4oNPoC0K7j1BHqDcEeoOLJucpNQRUGJL1Kq7WzdRhK0OAeih0UPZQIwfUezarRmvgxKvVuhw3MefFmya/Hv2ipv/trwvX17nbHprOFXzc2V1lcV6XESlgSIqCgOp+IKUkkgK8xvbbbpikq+aIlMnCHypMyWUBxTERkrUhBJAUo7BIJBtc3Nthj46ylq7DWRyJZWwMobtHG1xBhZP4Y02qT0PSV8zwTMaOkFx93UoIQLkAbC9ybAAk4Rr02uTXZc12tTo06c6t6QA6HUpCibNICwQhKEqCQUaT5b9cbqhVJVYqDFOfKjTKYPER0pQQkvuApUpR6KKUiwt01q74+kXwZUCj4xSxyxnhhKIkZphpOlppIQlPoALDChnzKpUs/cTKEhiO3MqkSkwKU8/ILSXUtFUpcdJ0EJW4VPFIWUhRYNr6FaW+Qb7YGaJCpk7i7W8t1htsM5sywj7vUtWkuT4Mhx1IbVcEOpbfC0lJuNFx8OKOkYKXyO0woywE5pi1s0jhLPgyWnGKxk/MLEmRGeBS6hAqaX0uEHtpWoaul0nEDMUNNKzPUoJCSiDmSdCSf+zfZTJH6lpWDXixw/cryJyqpIdmuPMOMoqLA5cpoEeZLmj9oknci1r3JAvcLjM9Xqocn1GdTl1KVMcgvc2lN60qebcUlaygnUgqacUPzC462x9FTctgG3qf3xBGs0Eq09SqTBf4fZLmvMB2ZFeqVJDyLpcQW1qW0AoWIsiOoD2WcaEzEro1BbAuPCyG1kb3WzNfbN/fSWca2JlZlZbVRvBxqVrrS6qiQ+8HXWEqZDZRykgpKjd07rFtQ2xWzZLFPpzUSLCqtSjQnXudU2Wy6lLignm7kjX8CdQQCElPQb4cVdwKk8xJgWPHaHX2fKZQOI/HmhZPzI4wzSJDD02TFW8Eiout3SzF1AgkKKdakDchBTaxIx2l9rnM1IylwNqVHTLRTKrLSzGokGI8I7ynUOp08pI3CEBJKrAAJB6HH5yN02BT2aRNnvsTILrLjDkhLflcC/wAVCyCSdRUj56nLbXxdU6gmlR5FVeZdfrLuplgPPKdLTJcPKSoqJIsCkq3PS3QYR1OmR7EcscL29TMb9owJ2N9mz7QddzbScwZUzI946XS4rUmJVHlXffjrcUhSHT+ZaSkWX1KVDVdQJLvb4j0ONk+XTVUwPzXUqCX1oG1+h9bjHAn2c86UvLXE59moTXvC1OkJixahK2StwyVKSHFkAAK0nQeh8oB3F+rHyQSCLEHviFrtMK79wGMiM1MQMmaVE6sYDvj6RfHwiwwrNGXGXc9/0CkmfqQg2KAVi97jsMA3ELiA7mpwBDxdaVubgix77HFNxOrEGhxmJVSnR4ERAN3ZLoaQCTsLqsL7dMLmm8Tsp1iLIkxMxU12PHALq1SkI5dzYE6iNr98M1aQv/lCkzLXuqmsHiEKh5seSPrj60+3JZbeZWl1pxIUhxCgpKgRcEEbEYwkA7dcNYI4IikP6fnRmk5FkVepqdcbp6Sl4MtqccUBbTZI3UbHtfocKvikurZjRJmVHJuYYdMfaShOqMnnN28wVywouhQV5vg2IG2LRYDra23AFtLGlaFAFKh6EHY9+uKGo1edlWl+AnqlTspskLiy493JVG9R3UuOO1rlAvcFA8vKq9h3oMt9vt8YwbmYYMB6lmuHmdLMpuMxR80xVcturQIxYjSnQmykSECwbW4LJWhwJVdXlJsMV2TpkOM5Fq6mH5UyVJkVCn0tkall51Z1PkKsEBCbNhSiAkhZFyRibnKrtuNu1inSIlWmKQGUyoq0qbntq8qUOAXGtJOoX7JUBYG2I9ByzLc+8nmK5KpzYkKhgQm2dawz+H5lrQogApUEpFrDc3JJNYBDX6f37xLrN1Xl1kVUSnZDzeYKi0ORSaSGlaWkEnW8+8ki2pZuoBNzsAbYns59hxYdORVmn41TeWmO7GYaU9yntrpJSCN7ggAk2PtihbqcfJlVfLlXYbkzHNCqhmJ7WuQGwklKCnQhtKSvYX3JJti/dr0uqNplw6et2GpDim3XVBrW4EgtqG99CvMm5sd0m1uoW8mBt49ek3IuV80UzMn2geGy6VJ8TyRVEugoUhSR4Y9QoA2I6G2/bBHxIKYVRqrbDocLssMJUg9FOOBN/mkq/wB0+mKzg9Ecq3GifWJjTLaqBQuWtbFyhEl9yyRcjf8ACCr4GKnVHWxQlPqLq51Sfnqv2bPOcTf5FbY+eOuoe1cdlH7mVaDto+ZlZXqyY1ZrhbDjs2SwIsOPGaLjrzytZSlCACSdx26YO+IGWaZQ6NSOSgR3+WguE3K3VKTdalE73v6/5Y9cAP6xxGzHVPDLegRIQR94KR+HHl6hqbSojdRbIO3QXv1xrzrRTINTqLk3nOurW+SUWQBc2SLk22tifqLs3rV0xyfjnt9IlYxbiKVqU01mF4aAlorCSAPUdf1x8q0X7vqe27a7LHt6/wA8VVeJiTG37XfQFOFCLnWyLBX1FwR7i3fBLNCazRGJLagtYRrSU9CLb/qN8fTIcBT6zieZcGPPiBmRWcoPDGZzU0+hU3LbTjyVbJDrTzjLxSPVRYT9PphP0Cvx6xBzDlFu6R441iig7FDhCgtj21tIuB+82kdVYmRKsrM/CpdH16ptJeW63c2vGeKLgeuh4I2/+8H0wsmys1NyQgKSFNostJsUrSo9/UXwetAARIlGmABXuDxDyhON1HxMKSQ6xJb0OR3t0L2sOvTYWsPT1wN01FQyrMkwYYcnRo5u5SZDqfExkbEFpRNnGzcW6elwbjFixXI1X3qKFR59haayLIcPq4jsT+8n5kdTiZGrtPrRbi1Na0SE/hszQnlyGDf8iyN/kLi3rjZwRtYRog5zKrLlVYq9TeekuuippaKHIMtoILQ1BV0AjpsL7q3A36Y8Zipokypa4UKR94LbQ4mamQpAS5fSmwJtcBNzb5HrggreQX4dLaQiuOSJCiVRZymBzUbjckGyttiLC4OKmiVB9+TMjThoqEVSW3Qg+RYI1JcQnsFD173GE2BQ707TiMGGRCfUMbGGJMyQxHhtodlPrDTLbq9AWs9Eg+p6D3IxHjw6jUqw3Cp7Md97w7khLDjvLcfKNN0Nk+VStJ1aTa4B3GJeWaBHrOUZIpBXTs00SQXw0tlSPE+cPsBxJHlWFfh36+Uar3BxyxwgyYMDMscsUnxVOh16mc+XLhZiYZqkNalFTLSTHWhaW72BQrWFCw3Uq/w4a1Cp7WRsrVCdGZQ7EefddZjyasmnFAXcBYeIskJFkIvY6d73IsEQZMjMUyXU6HR1GdUW47tSgvyjFC1gfAbpNlWUNRAuU6emrVjfn6LMh0yRXK/wqorW34tTNdTcBKRY6UBC1dBsk32GIlpbUWBCePSFHETub6i1UuLVBlNIbZDhltltqcZyRpZB2fK18wnVuQbXvsDfExOWp1XlzJXhXm4Ly3ENS1NkNrcQ2CUhXQm46ex9DiprzKYFfyjMUoFCJb7O19Kecg6UjUSqw6C5J2FyTgzTnWoQ6D90OSUfdcdyRLZaUkauYptdhq62uom38Rx9UgxWAIJy+Aa4pqaoqzLJPYQmxb++vHjNUBVRchR0HS4sulsnsoNkj+YGMpWoZgqZvsiMym/1WcHvEWbQKlVskfcdO+73I9MU1PsLB2QkEFfuSCk3/wCWCk4YR0uQQMdYNZedRmGjpaWssuPAELHVp5P/ACIONsZx2i1aSl1tZbds4pTaLhCgkBRIG4BABuPfFbpNEzDZJtGnkuIt0S+Oo/vAX+YwQzpQMtiYgXUkDUnAH6/AxgYIxHJVJqOJOUUZqiI52ZaPGQisttnUqfCSAlEwW6rbGlC+vkCVdsLmE81SczxpqCEx5y0kKHQuAWIPzSLf3bY25PrM3IMqBU6U8CWHFONhQuktqUbtqHdJSpSSO4PbbDAztwXkTMuxs2ZOgqrOVKxHM16iMr5kymEKs4AB5lNoWCErFyNICrWBM0gZIk9LRoHFTnyn3T6fCGuWUN5ooEzL6JUePN5wqEFUp1LTbjgSUOta1WSkqRoULkAlq198C2eMp/0cqUF6vwJFNS6UtxMw099DjBUd+UXmypAN/wAjlwbbDvhcZWzI5EUyzLkc2OpQRHmKsEk9Ahf7q+3oo9Otg98gVqJUJ7dLnsCVT6kRDnQyfLJZWdKhb95N9Se4UkEHE2wGlo+wsr3W1EFTzj+DBYSafKzRlOPnGTJbjMS0hEyKHEMVAK25T5bUlTToFtCtVj0F/hwR8assqybT2oyZb85jLucLNPSLFxMWVriqSsjqQvQb99QJ64oc0ZDn0tidlVupMPyaPVUsiWpRIcbYkhaL26KKUJBHrfF7xUnzM5UfiEy+oGZU6TFrTIQmwDlkg6f/APZhLH/zMDDDcB8ef5gmUm5LUPlI4+cXH2nak1l7PvD7Mj7oajvU+Yw84eh0tpWlB9ypW3ucLfKyKjTcsxEyC01Ke5kmSHQdXMcUVk3vta9reuH1xeyavijwejyqc0mTWKEturxGSNQeSkalNkeikE29ShIxz7nSrM1fJDU6PIUxDmlpK377tIWsJXc9iBqHzw5pX8ShKh2OD+0Y1af5Qx7yoezFVXnFzICnYlAQShqRFZbd1rCjrWtB82m97ad+/fBjkSiyqrmp6VIlrmIpoSkJVZKBJUjzEAdNLZG38eAmnw2IqHpy2qfKYiN80Sacstc8jZtpbafKVElNvkNhh2ZHy2/RqDChqCVzSC9JdUSLvLOpw7dgSQPZIxUcIg4E8VFajA5M2Q6BX5ud4zrrIdpqEuOtOB0JSw4UaRsTqJPn6C34nXa2HXS2Uop6pkxxCG4Mda33iQEoQkbqt8hf6YBHsyRqFDW9IbesHEx222kFbryyOiUjrsCfkDgT4scWqfWOGEbLOXam1Jq2ZZqoctkEtyIMVuynuY2bKQSBpsoC4WeuIxR9TaoUcDvH7a1qoJb3jObKtUJecq/WsyMvBDdSnOPOsBaUoDPwpSq42VoseoxsywmZMahvPlC4lOHKYdQSUyHLaQobC4SkncbE99sXqaZQZMeLImwIyXlKLISsC+tBIKbfmtptv6Ymh8TUg8kxktKslBFtrbYvvd5doEUpRdwyZZ0dGpDUNxpUgPPpTo9QpQvf2tcn2GDyqM0zKUemSarX49Lp7T+oNyEkvyFI+BIULmw/NZJJGxIvgdyzCW5IStl0IkMJDmnZRBNwPl164EeIMGuZnkVLNLbLCqBS3E05C3X9Llg8G3FJQB3cV1J6JHphNKw7AMcCMNcwc7I4YPE2jVhJ8JMYmbHeG8h4j5oB5l/7uAriZmwJiBMGUtlxTqW3HLKaKSG1LAubEEkJH1thVMZIerjNSqqaXNn0qmeWRIYSFJZUE6lEgHXZKSCSBYd8bEmbCgKXCrEzwqGy4hp0iQ2U6b7BwHtbpgo0dQbIPSeGqsC7SOsefCrLNBmyG61BrsmuTGgFueIkocLTqkaCpQCQoK03SNZ2x84rVisw+ItNTTVReXDpKAqPKaKkOF55wrsUkFBsy2NQv8IxQcG8t1x6pxampKWIbbjjinOW2lTxUgtlCEIuQgGyyDbdINrnBbxZp1R+8aVWadERIU80KS+XFBDbLnMUtlxZ7IPMdTtuVJQBuoXlnC6zaWzwev6Sjy1GQMGask1+QzlfNedWG2UVaK9GhxWnzzWojbojBSrbXAL6lHpfloB2BGHjw1zlXZ8TMGWarXvvNJy7KrMOrJYZakU+Q1pRvy0hJT+IFAlN/ItJ1Am3O6XHuEDTLbctupOzYqxVKdMjqUw+0ColZCQooCdZSLhd0ixSdN8S5mfZuW8uzINCy7TMv0yohCJyIsxT8qeze/JSvQNCCCRax2UQNNyQC2gXe6Bg9D8sfX+ZsWbMZPSXvDaQxSOLGRquypajUo7peWpZWt1biB51q6qKVOKNzvcfQdB8VKy4vO+XpNZcqqcpQ1x5EN6FEDkNNSW4+z/WnghSmyA40lIJQk8ze98c/wDCFbee+LEatQ6emJDpUdwSbscoOSnSQRb4dSCAbjqUL3NsNXNkifU88VOlVarz4FFjeFnwqOw2zyai21yXi9rLZWook2SpKFgjQgKFlAlCxf8A3FJ6qpz/AK+M65/9Y/EwgzgnL+f2nqJJa8Y9FdS8hbLq2nIzgukLQ4gghVyobHoSN8cyfaLhVLhHxoqFApGaZ9Xi5fpcdKWa0A8tlyWpUhbCXG9CiCtSVajc+axx2Nw+yvHerdJbYjlL0+a24+HQVKIKtRvfpYajboN8cOcXswN8ReP2dKy+gSIM7NrrCLq8rjMf8COL2PlKmkYe9mEtY4PKgdPnJrkIoKcSHQc61eg1GZUjGeaqLiDqlNqjSEXsEi5dQh0CyQLcy/8ALDsyBx+rrCI7lLoTGbXlx32ViKy/TeRqZUjUpx9K2Vm6xshy5t0wGZYyflnMNTiMnKsJp+WVuIdlQkrbWUg60BXQkBKjbbYG2GxxA4a0vgtnDLEmhQU0nLWcoSku02OsrYhVZlIKtBJNkutE7DqUbADGrNTprbPCKefGRn4TH4m0IQDKnIdGk5YybQKXJKfEQoTLLoQrUNaUAKse+98dUcHuNtJy3l92mVNttSSk2Ctr45tSrUMM2icJRUOH68yOVJCAm58OB0SDbr64laoqx3WHBMFpXcM2wZ45g3xArESs1+Q9DQEtKUSCBjfl/ObdPhiNKaKWmG/Itu6io3vY/rgemxG47h5bwdSPUWOK+TKZiRnX3lctlpBcWs/lSBcn6C5xtawyBRFGtO8t3MteMPFBuNw3lw6cHvvauFVIhtIWELQtbaity9/hQgKNx7d8I+vxKZGap0GPGbZRCB5QSn9mDtYfMbn1viPEq7tcqEjMc9sKlSWyxBaRsYcQklPr+Iu+pR7eUdiMUkyor8YWGmnJ83SFqQFDyp7KWs7J/mfbFSuoVr4dfXvAFmsfJ7SHMpLktT0Fxkv01SkOtOoUkrQtKtRTYkG21vkTj3R2zMWyrQUpq1X5mki1mowuDb3UwP8Abx7gprtTqb8OM3EhR0BIXKAU7oURdSU/CFKufSw736YIMtwGUZhTHiEvQ6RDMQOKN9T6ykr+oShN/QrI9cPBiikNKenQsRmMClitCnpdo6WOYZCS8uTv+EAQSm+17jpfvtvg2mtNSeItAj8lFoFFfqClpFjrfeQ0gn1Olh4D2UcUM+W7S6dT6dB0NTqg8IyHHE6ktJCCtxenubJsP4lpvte93w2pE+ocSK2ipTDUHjJhUtt/QlOlpEdtwoASANlSXb2A3vtiGxwrWfAz6DoQsts41WRD4t1BqE7HiLomWKbT3ZMgFfIU6p6Q5ZAtqURytibfPpiCnLtZrDiZKovigdxLzE8tRJ9UR0WSkeygD7Y2qWjMWb+KldQwhb7mYHYrCgkEqaiNMsFPyJac/U4KafXozOXDNkPpLEZoKU4DclNrp+ZIIFu6rjGT5QABzgSTc7FmK+sq2Xa5lttUhaqQ7FFklhuO20q/ojU0QVnsD1xKazDDkNpFYy5SKwUulvmORvu+YlYFy2otlOh4J3HULG49BX0jx2Z6o5Ic1RSyopWtNrxgR+xa7cwggrc3tfSP4bWuUCJCbE1LQbiBHKnNt3BWyTfmX3OttR5gV12V1JuBsM9ZlbtuFbqYS02ExmGmgZXrC5rcpK2TQcyqP4pAs40zKFlBSdQulYUobXsCCSegcRswxkSKXBmvUurQWA2ui11rmKYA2SpJvdaOgCwopPsdsAtNjMVWGuFU0JkuvuCLIUklJRPZRqjvAj4S62Ajb/XNfu4t57rlRgwo9WmKd5BSui5mWn+swXFAaW5BFgtpdwnVbe9iL2XhJlBMIwDYA4MWvH6r5pqNRynFzFXvvt1tE2Q1pjNspaJDKdtI3Bvbf0wsct0yfCUnlFDSEMIdW+tVgyRHU2o/NNwoetsGfFetvVXP8ViU14eXT6SGpMcm4afW+rUB7ENpUD3BTithRjNpK49gFTHURBbrZ1wIP+6on6YqBilIBgqlJbmHjqGKezkiK0w94SOxLqhabbU4pDYaZYQohIJsOcu57bnF+9LZTE5yHUBkpCg8NxbsR6n2xYZcglziW65/ooWXWW0IHYPS5Cj/ACZR/LBA/wAOaLVZ5kFhyKSgIU3DdUwldiSFEItuCeu3vfGNJ7QXTpscdeYvqxutx6RdvvOFKHFtnQCSxD7qPXWv37+g+dsWDeUqzdch6G84txOpTmxFuoA9gMWmY4UXh5VQ47G8bSpjBAfqBdc8KtBF060qBCVBQVdZO6TvbH2nPUua6GFQUNlMV9ReS4tRUtDS1JUBuPiA/wCePoqtQt6bkPEiXs6HGJKpMecFQ0uyUx0KpkhTCnXAlKWyHQR9SD0wJtuGDUG3EK5YdWmyztocT8Cvr8J9jgqjqjgUsxWS1zqRLW6Sd1r/AKykk9P3R+mNL9GYVQXoxaQ54hDDinFIBdSpQXshX5Rt09bemCh+0WqsCNkwsodaLqY0thSmXNlW6FChsR9Dti4cjsJ8S8hgimT7JnRmjbkO/ldb9NwCPlpJ/eWeXJrsR7w76wVlfLXfYcwdD/eA6euGE1WI0WdFXFgupYMblTW3XitLyr7kXva/8iAQLjAXUAysW3AECEFFiVpqMhXg35iRsl9hpa0OjssWGxPcdiCO2JEmuVJ/+qPy5DQadSosaigpUhQNiOvUC4wMVEiC8OUsuxlpC2XCLakH19CLWPuDiqnZom1iUmjUpaU1NvT4ipvDU1CZIPxjqtyw8ib3t1slIwi9SHJxGEd+IZ5lzQ/mlf8ARyNS4lYrOkOqfkps1TkdnnVjdNreVIIUo7D1xBqeZYmVKRMolCqDjtTfQHKrmGU7eS8rSAAgk3Kj8KU9EJ3A7kRq2a2cr09WXMup0uqPOlzHzrdcWR+2fI+Nw76UbAADokA4CZQacZlrQ8qzVjJnSFlRClbJAsN1q7JSBtvYAHHK9MW69IV7gnWGEzP2mgRYcBSC64grZaCbJZSo31KHsCLA9Tb3wCwKJMzNNZj08JdU86VBckEh9QsVOuEEWQnrfodu2kGTGy8WstKnORm4cBJDYZJspxR/IkD4levzF/iFyWFObyhl9bjoSZssWdAIBNhdLKb7BKd1E9L3UdgMNGvwhhepgVsFh+UvqRSGcm+LVGk+MqD45Sp5b0aWu6G03OkE7k3udugAGBKuZ0VSkt1UulMFp4sxWm0lbk99PxaQAbNtlIuux8ybdvMJVbiLOqSghszXWSSSY62o7KhvslRBdtb82xPUW2trqDMyr1SI/VW26U0YyGojHKcSyxHA8unylSgSASq2+3YDHk0pJy84+oRRxLZ7jtW3LctoA37xlk/zWj/DFenijWvDNx2GERWUJ0pQ0y22APq4s++LCs02g1CQlyNMp1OaCEp5TIlrBI6qJUjqfbFQ/lmmrhy3olZbkPsIDvITHcGtOoA2UQBte+/phsUVjoIh+NJ+Er69U80K/BmzpqWpDQXyVzG9K21puNksnYg9L98DiIkhTut/SopJUlKST5iLFRJ6mwAGwAGwGGo3Hj/9IGV258JNThuRqcy5GWsoCgthtO5G4tqBt3t6HA3lMQpmcWBNp4epy1uKVFS4UeXQopTq67G2/tgyqF6CLfimceaRc3iAYmXXIVMEAu0xKpBS6VF51LrrZWb9CdF9vW3bBWxLkxcz5mnVANl1iNCcc8IjQjSmREOyf7Kfqd8DuYEhyDl0pT//AI4jYdP6y/ghjy012Nm2Zyi0VwWBy19dpEYD/hvjWcxM+ZRBR+lTKPmluSthciKl9MhD7CdSHWtVwpKum47GxBuDYg4vq9S/vOmSBEKZSHJj1QZW3uHmiAFBPfWi3mQbEA3Fxvi6g5JqbOXmZUBzMiJhAdbZYp7iY1yoG4cDnpvcJ3ON0WISwZTjZQVpS/LjxFDt0lxyDZLiFbLTtvq2CSdPiTAu5JGO0ra3R6hVqm1PZy0qvxn4EEIlFL5T5YrSVAKbUkGykkG++2Pj1IfqCyibkLwqVgJW9CEkPiw2KAt1Sb7Dqk/LE6WinMcx1xOWpZAJMh5qoNLX3KlJQAhJJ3NrAX+uBSNVpGcIXjctUCNDZiPaX68ZSotKaA9XnSoqWlVv2ZO19gQCRNclYy5xCaem3UEBBKWCyqJKLrYISvZSCNzb4T8x69wSOhwcxc4UOkR23JtXh0uWkc+PLecstCwLFlxJ3KFAWGxA90k4oJcWjTluVOs1GuZtdcILrlFaao9LUbb/ANZkaS6DbdSLk3J6nFdBruWueoZc4RyZryVWM+DXHXSk/wDf8spH0XbE5/aAz/jUmfS/gAwHiuBCqPxUytmGKqDCZqVTjPIU8lml096QYT/flm1i2qwum/Qi+6bkcpVarlGzOiot5IzZJhKhyYMpCKStK1ocSNNgqw2WlJxOn0nNVYbT4mDxIpkYi4YpmaochI9tDigT8sL2pIpNKqYZqFaXHdCwvw2d6PJiKUAehlIUWrdrhNsI26my9SjDiP6bS00NuRsy5k1Wrl99S8iZuabc8yr0harG1j8JPUAfXAZNr8WnvqRMbmUoXNhU4bse3zK0gfzx9zHKh5f5bpLdPZmG0ZymVVMhCyTYFktqS4sX7Fs/543U3Med/BLTG/pO00ncLnSi2gg/wS1b26CyTcWwKqsqOBHnwxwYS8NswxmqgYUec07DnL1MKbWFtof7pNr2CwNv4h/FhjS57NPadcmLTGQ0NS1LNhb1B7jHO0ust1J9P3sjJrkhJuZL9RRFmg9jrjoSm/vpOLuLxDlQm0RXaxRsxQOYhRhVCstvLOkhQCZADSuoGygrpigl5RcYzJtmmycqY+8rZwdS3JTAotQqjTjiSH0JSy1awGynCnV9PffE3wi6pXkVtmNLo6lI5EhmYEhUlKb6DpBITYqNlXub9MUWX+PWX6y243KRIpdUS2paIEgalP2HRpadnL9rbnsMevvnMkSauZMlMz2DcmlxoqWym/QIcUu5I9VGx32GPnLQ72M5XBMJu2KEMLlIVe4GBLNNUqwqDcKlTosANpDkh95jnuXN9KAi6bDa5J36W9ceHs2V+Y44yzTI1KIaCy++8ZAJJICUhIRZQsb3vbbriHEQyzGCEN6CkArWpNis91E+p6knA66yvJ5g3sGMCa2sy1515DkstRkwzpUIwBbm7/FYgqQLWFr3uTv0wGZ+iKz1AlIlOLTJF3oLrbikLiPpvynG1AgpUlVjqBud74MlTYxjqfQ8hbYNipB1C/S22KCpqQ6UlsBDaQTfp88P0eVwwHMTdm9YEGfnBzK2W603rzrTKhTFVNx1lCWapHKTokNrQLIkFC7i6AhZCb6ScDldYFRoYzFSVf1VUUyQ2tBQXUgE7DqFHcWI6++JeUqdKrrOUKDWoba8oz8xVdMB1uUtK5MZ1MlTd0JA/DLxuk6rKt0tY4i5qo0nJ9cplMYqJcoMl555qnOMpvGKTqCEuXuUhS7gEG1hvtik4UttwM8n6fzK5JercekB6YwtVLVW6G+2hosurVDcC1pLnmOw1eRZV1sPW4wyOI1GRQMm8MXqe5HNKdytTlR1OyTHDb7jYccctey1KdU8SOt77b3CyjzJrKIVflU6FCarsjS2iM+su6SkkKWi2kqKUm5B7i+D9x9rMX2fMiIWuQ7OosuoZcWhp4IUQhxxaEkq20lhwe9rWwbzDB+P9+xiulbJZT6QHplATJrFQpSlJTGpU8TGWim+pDiS42PYJWV/7IxHqcxyZlZ1dUcYCQhSXrKU22VJWUg7b9QLp9yMbI9YbGb6dLa1IaqcR2IpKuodZUVpBI67c0fTA8ho12mVdSGUGauW8ooT0LjTyuWCOx8qb+t974YCMzhj04iNq7bCJKpFRm1DMESQxSzKpU2J92sNkt3fUlavIpsqHxEKSEfEVAADUQks3I3G2vZOcMcIfrtFZVyn6VKUfFw7dUtLX5jb/VO7+hxt4gZTh1FcPMsC6cs5ySJaVMm3gp5TqUi/5Ssgm/UOtq/exc16RlnPHDGTW8wT49Fz5Q0iG7OQLOT3ALspLY3eS8mxCRdSVFVrabY3aarFAK5B4+U4CY8qNm+j5jy21X4U5tVIW2p0yXTy0thPxBy/wFJBBB6EYEo1dqfHCoVXL3D2vU6LT4seOqbmVh8vKbLrigWo4QCA5obWSpR21Dbvik4FcA26plGqZr4kRqzAo7kwyYuUZDq4rKw0EBbslg2KytTZ8qjYgAn4jhhO5wpVZeqEyPOiZLYfSlKGojCA++Eoskq02uEp2A97DHxGq1tOmsevTeZh37A/uY3g4BaR4/CbIuX81pC6dX+I8uE2pIi5lnJnswApVypIdFg4rSm3U2va18Uma805frGfmp83h1QpLMRhaGHpsRKZcd06bhSSFJUk2NtgU/XECq5hruVKZTKhGqL78BTBQw6ywGWlE3HmBJ1KIFyVC+2FBmLN7SZE+t1CW85IX+I6444pdzawCRe1zsAAOtrYBpl1OoYs7luMDkwTvgYltnLh3kioGW7EoUfL8iQhSW1QX3PwXCb6mULUUtG+/lSPpgZGbc45CQ47UVM5rorelRlFSIstlI+IkAaFgb+hx9otSzRWFNyGMozJTa/PyuelUxTY7pZAJJAFykqva1rnbH2o1P71cS3yVoTp/Zuggn5g/wCGPpaxqKMJb5gfXmLbhJmc+NaaSXmMvxmqm6ypLTs15ShGbdULpaTpup50jfQ32tc9SLKrQ870jLztYzjxBoOQg2yHBS6dTRPngHpzkqcUhpRuPKXL72tfCYl5YqHD2ptVqkqROpkZ1xwU+SVDwpcsHHEKF7bDdRGw+V8WsmWjPGZeTVWnILNOZTIapkpQvKeUo3XsSHEIA7d1C/U4tLXVgGoDHf1+UarCNwesk0WTm2uxnqqcuUOsUpa9cWuVVDNGkSLHdSQld1C+2wti0h54n0hipN16kriRJbrjomUeS3LEbWkbqSiytjdWqx3PtgFzzmKTMrJpcWU6y03YPuxkkvrURcNN2B0gAgkgbXttiopcCprrDEDLorL1cc8yYA1ulQ/ecSs2Sn+K4+eGfBWwZcATjIgO0dY1267TaFSoyYcOZXqQGOYJrBQ+kixKioqVcmyST9B3xPr+b4dMpapbr4EFtNw51ubbJA7k7WHuMVGXuDPE0zn3YlPo+XGpdlvImy+ckOd1pS0CASLXF7XAwycq8H6BkKW1Xs01J3NtejEusoeSERoy+uptnsR+8oncXtfES4adW5bPwByT+wnU0tjHngTfkmmTOHPC4yKmgM5kzJIM6Wy58SCoBLTdvRtq23YlWE7XKyxJzPKkuSER4cJsQm3SCpAUSFOK2676E7d0kYKOIvFGVmWsPhlxLLzSNPNtqTET10i+2sjck7C97dBgVouT5tUo8eqtMqj01o8yE5KRtNcSdQVbrouCdVtyQRexwapSmbrOCf7iN2MAuxe0Z9Gz1Gy3wqpdIjRzDRDjLM2UApHOV1ddKVAK85CleYAi+ACZWZoyhBYkqfLy1FSnFG10kkpSfe2kfTH1kVDOi0qlNiHR0XDrCHA4qUpJsQVDo3cHbqbdhtirrbqn5zyQtQabV+Eg9PfCSUqrn1JyZMJzBupPn74przqgkOJcYtbbWbKSProP1tjfl+oJy9UVUx9Z8G8C7FWTfTb4kfTqPY+2JLtL8cytlaNSDZXlO4INwR7ggHHiqUxuowwNfLcBDjbqbXQsdCP/AH0vj6CnDpsM6p28iWaHH8uVGPV6aoLSlWoA7pIIIUkjuhSSUkehPsR54g5YbjR2a/QlrRQ6ypWkqOoxZAAK2z7j+YKVfm2o6DXnadMMOoIDYcB1DqlVv9In2PQjqNjhj8PHqcxmZnL1aVfK2YFphyL/AP2dxWzUhB7KbWoKv3TrSdlHBAShwYvqBtHjp26j4RSU+oOxljm2dWg31EWJw4Z2XMpcSp7lRoWbafRqhMIdepFfCoobdIGoNvWLaklV7EkGx3AwpOIeXajk2r1aKpH9dpchceSwoHSrQohSh6dL/LFGxWEp5ZkoVEKt0uLP4ah6hfT6dcNFN4DCYZfGw6Ngxu5gyzmzhg+xGr9PfTAd3YeCuaw6n1adBKVD2BwPZsYlSI8etULS5OZ8qwN+cz1KFJ/MQdx0I3t6YseG/GKbl5CoLrrdbyxK/DmUiQrmR30HY2H5HALkLTYggdbYk5uoCsk1FqbR5KqhlqoguwZR31o7trt0cR8KvlfocL7SDzMIzK2y3r2+M3PSHpE/w7Cl0nMlLeTIajykp1IVbYkAkKQpKrEgmwV6jBq/WouZxSsxwg3FrbiPByEpT+0JBCml3sSEKAUD1sja4OAJrM7ecmI9HrKVwK/AWXGHWyA60rTYqbKgdTStri29h3F8acvyaw81MqVO5CpzjidLMm5ZUUoSlak7gAqKU736DE2xN65bgj+/aDHEYsDMmWaTE8NmJNfpISp1oz0JlRklV9RUHGzYk2BH9qwsNsDmZqNk4o8Vlip1+s1Euj8arNNKYI1bpKloQ90uQoau3Xpgtoues4ZZpJkVPJ8GqxE2SpyFLKgBpBBU3oUogHqQLAegFyOZjzBRs0GPNy9ln7gkurS6883PSuNISbFZDSQU362UnSSbE7XGE6A4szg4+BBEJniBfEZrRlJx+3njSY7yT6EPIF/0JxEzS4SuOjp8SiPToMb+J0kDLzEO/nnTY8dIHfzhR/4cQcyq5lRG/wAKLb9PX/lj6OnlJurkykoyL1GrOqFgVMtD38u//HiznX+/advc8l8/8GIdNkhUSO7oKQ6subj4hvpP18pxJbUX66yVf6KKs/VS0/8A5pxtzGlhZSeHzWesvZnfdqzFLNHhImo1o1OLXrAGgX20m17X+L0OBWHMM+FEeAsX0p29CR0wS0Z1DMLMij+WkPqB7jdOAajOkUtxjfmRHddv4b6gf0J/TABkg5mEDLY245HaNPJlBfzFBdhw2VyZjKCoxUJ1OK0nzhKRubJOqw7BR7HBhCnSqXwwamQ5TrUjLtdQpt5lZStlmW0tKkgjcfjRkfVfvhaIqrlLUxWYr7kZS9Gt1klKkL1AJWCOhBPX0w5MkZ1qXE6mVLJmY3o85NdbTBbqbzKUymZSSFRCXgApaOcG0kL1bKUdsTmXnMDrEcgEAEAgzXKiUviKCuqGNDrMnY1RTYTHnAgDlzEJG9+z6QFJJBWFgEitqmTa3w0qsWFK8RIpcxtS4bklJ50dSDpWytQJ1aT0UCQpJSpJIULU2SnpEqkKjrb0zo5Uy4y7sUrT1SR6jcfTDuq1Sdzr9mQ1EKLszJU9LjqD5lmA55FC/XyEg/Jm2EmJztM9a34Rq3rP+NuCPTMSsDiPEy4+3ErUU0BbhVpWvzR3f3lJcSLDqNlBJ36Ytsv55czJmCbOYWHqU4wxRaYVJt4giQX3Vo7lAUogX2+M4r5LlQ50CpUhiPLkxyocqS4W0KStNj5gCdlBBt3sfbFrkCmfdddZkVWWupVQBSQ6s6W21q3KUI6JFthfe2BOK1RmUckS2AWIXtGHwxrCGOS22saIrpiqSDtZKigpP9lYIxytxcp6sj5kztlJDjTcRNRbkw21J8xaklLiEo3/ACqURt6YfkxCsh8RipRKaLmR0uRnD8LE3SNbZ9OZoCwf3tYwBfanyzHXxoyfWJCEJiTKQ4HXFdErZKlqV8whwfoMZ0OE1OOzDI+Yhb13Jg9QYLwY0edmOnwg223GZUKpKASAlar6WEqt1OoFe/7gw1qDapTEPRlKQBdClEGxGOdYecKcgyKiuu/d8uc8XlNx20vaGwAlpCxpVbSgJ2uLEnDDyZxBqdOpcioQo0XNLXLUWlwFltfM0+XW2okGxtexBt2xZ1COUwJlER3DN2jLhU9eb+IqITCiqFSj4UkC4VIWkKeUP7DWlHzcUMJ/izORm/PGYM5RGSqLQJLUGCUJtzWmCRJUSPiB1LAJ7IGGvErKOHfBSrV2DNbk1ZxkwobqgdT86Qu7iwLXKuYpSrW20W26YCqJS41LosalJSHGGmeSq+/MuPMT6lRJJ/tHC+mPh5cdOn8xf2hcMhYusxUiLAzK1PLYXDklMhNgSPMkoV+vlUcSa5dtUCLDmfdzDilrfcbtrCEpvsVXsLnc+2Ketz5lMp7+W5GjXTnRFjEkc2U06bNFN/ROxPS4xbZEpcWvc1+r05K51MfQlEp9wFOyASDY2KRsvfa6/bD7AoN55AiunBcgS9yxkamZgyhCM6PIp05K3D94xnOTJfQFK86lEEkLSAohXTqLC2CGmZmyZl2lJoMZl6oUxIUlbTUZyU05clatSyNK7qN9ica6hHTmjL06E3KSluc2nlTG/PoIUFJNh8SSQAoenTcDC1Rw5rrjrzJypNlvtGzjnJ5iFH1S4sgLB6gg9x07JIBqN3iPjnpKzsasbFz8Y9sryMm5koFQypSyilRJzDrTkNhoxXkhYspYQsAn52KdgDgCzxwgh8PcoVir1PMD0uUlxmPSm4yAy0bq35yCFarpCybEABO3piJkDhdVqnWYjtVh1GjUqA8h8szEKacdcSdSUMBXmAvbUtO2m4BJOHvNhFgRY85ceUpQ18lwpU4WegUpBBsUmx1W3v7nCNtx0V2KnyDyR/uMJWNSm51we05Omzp9Ng/dr8yswo6eW4xBkoUyAhZAQ4EgJKk+hJPT1x0rTcyIoeU6ZHzRKhNyJ7amFR6ktIMhtROltwEjUrQUhRH5h2O+EdxWqsnMmeqnDqLbDMekF6ExHSoKKmiUqLi1dVavKrYAJvbrvgey/lquVSfAQxTp9RLjLao6JzhdaREWrrqJKW09TY3Ow232p3UJqK1Zzt7/ANMUqual2VQTHRm7hTLzEqS7RsyBhqRHEYRa4y48GmvPpS2+3dRSNara0E77qVjDwkzNW5CEViv0ynRGt1ijtOqcKbbjmO6dG3cDbAzU841fJ+UYdBapdSokqlqQmozboWhKSlRQlLg1ABxRTYECwGnGM8X2qrw8qNGlMVSq1GUy60iYWmw3ZdyjWslPTYEab2uPfCITVFRtIIzjoM49Y4XoDHcOY7MtVmjZVyJXo+UZtPaciUyQ5DkJcQ6z4hCNy64PKXCBcA7X0i1tsbcn0ypVCdCrtVrVRrc4RENsCoIabXEaUQ4tuzaUjUVabkgnyAdsJCmS8jtVDxdTYltc1xsrbaWfCLWkpCCppBuo7J/KRsL4dkyt8mTTqOw6VyKiFSZKkrKFNRE9TdNjdaihAtY2KyPhwk9JryFyS3UkfvBvb4wCx3MZzRkTKmYs5OupZTQaLLqKbm13A2UNpF+pUtYSPfH5u5SeccqlBRW2XGoBeQXG3ToW48u60urt+XmdB3JBPbD/AOObWYcr5AomUmcyrqFGzlN1vUye0XJTUWKsOkiTquWyvSAlaSbgebbCXr9LVVa2+wHURk6EKNrld7OBGn2CglV/4bYp+z6lqrJz73f4RKzKsFPaPaVPco/DFYhveFqEKox0pfbsVNuqlIRr3FraXCbHYhW+xw8c0UeXxZ4bVrLtMcMqpUmAMyUhSgApqdFcCikEH/TNqcbsBb6nHO2RajCzlk5TFRASxOjKhVBlOykyG/KbehuDY+qEnHQeQBA4P1/LFYo1afqNSeprvPoU11TrtRQCLvlzoyoFencBCyEA6bFQ+f1lXhutgOGQk/P6zbV87h0MAqDVmMw0OBVYiiY81hD6L9QFC+k+4Nx9MXCKtORCMRMl4RVG5aCjpP0xTVTLa+GfEzM+UilTVKeV/SGiawAPAyVFS2x/3T3MR9R2wFT+JkmoyVooHgxCQrT96TQpxDqhsoNISUlYB21lQSTe17Ye8A3HKDKnkSVlq2IBh1PqsalxHpUyQ3Gisp1OPOrCUoHqScLasZ2mZ0irjRWVUTLr90PTpYPiZTR2UlpofAFJJGpW9ibAdcUOYaxKrEiAzPmOZgmF3mRqW202xHUtI/aLG50pve6lEAkbE4gZiZzPFYVLkv0lHTS2VuuG52CRZI1H2AxUo0y1jc3WY69ZoqcWlNym6e1KqkmEd0U1oBxfLGwBISFBFwRurfpftjGIcyra4dPhuZepAX+PIeFpL57hAJukdtSrm3THqgty6NGhOVBK11OprAcQkJCWlBClae2wCT3J2+eNdWqcmVU105uQ9FZbv4l5hpTjyiG1OFCAkEps2hS1Ltsn0646HZmK1/eEX0EluzZhcGXqS8EvNJPiah1S0i+yR6uG4v0AIJ9sHuTKIii0pttCNKEHyEjdX8R9SSST7k4FcnxIoYcfjJQIOspa5e6VISop2Pe6tar73Kjg1zTVzTsvxkxXFR5U5xEWOsAEt3BW4ux/dbSux/eKcBuJOKxLVACje3aWQnn+luX0OjVobl9exKowH6XP64ZnBdbcHixmZqQstiHOM9WtW3JchtuBVj/FzE39UH0xznQKZEoGeKY9GYSz49p2I4re5csHUqUfzK/DX5jcm+HBxMlVGjZEqOfcvRy9Oh0eTSKvEBspcN5CkocB/eYeWF/2Fr9MI3VDirPDd/jmN1271L+kn8FZLsnhxTam+CmRVHZNUcv1/HkOPA/osY8Vha6cZMSKsuojvaYzSe7y/OgFP5g0VLWB7j0xTmgLcRw7ygiY5TnmY90SmVEBp5mOlptSrdUB15BUDspII741OVSUpNFDLDaa0+uS2uM/ctRpCVFMlbpG+hpQcBt1OlII1C2WALscyQlgBJMJolYk02E1GhR6w2w15QAUgk3uSbRVbkm53O5PXExOb5rCLPpqOhYKSmRIZ0kdwQqIn/iGN7+XabReJVNjw33qlMp1BEio1CSo8xciY4ChGkeVtKW45IbSABzd9RuTdTag64tEWJ5HlkFx21+Ui+5se5GwB+fbAcq4DL3njZ5sYEh5Tqbc5t+mx3H0zHIKXWVuhHmkxlBTKwpCikndAN97NA2wQ0/MDeYI+h2VFplJWFeRRs4WFKKgglaQSAghOyE/DcLPelj0mLTKtTqq0+8l5iWkLCyDqS4C1ubdLuA/TC34gV1DbMnLNMU5CkPPOicW1gNNRA4oFSkb6HFadO1ri6jfAxUHfEZNgZdwEGpNWezFU6rWy64+qc6lEdbo8ymkgMsE+5SkKP8Aawc5ShFVfpMdSilcZfi9Ch+0HLWhJB6bE3N+9sLymBTL0YrAaYSFSVJ6BtsAJSPaybfocOLI5rKczU+VIprAyuSkLlhai8yoEaStFvhJ/QG5ONaxgiYE1WwByYYZYnKjcQ84SblUaM5DpIIFwrw8ZJct8nHXB8wcHMTNUcvqStpTTZGy+pv7gYUWSMwttVCfTJgS3JnVKqTI7inBd8Ca6Fi3UFPl+Y+WDYWJsNsJGpcAfCS7rCbCRC0VeHWXHIa06m3ElGlwXS4LWKbfU7YGKdwzk0R8Ck1xSWEsrYSiXFDy221oUggKSpINkqNtQPQXvgGrnEMIefiUBtNRlMkh2UpREaOR6qSCXFD91H6jAqalPzCj/wCLVKVV0LVpRA8SY7al9dKYrX4ihYE/iLGwubDBqq7KeUbGZtaGuGWHEcblIyVQVCPPzcqLKbbLR8RWG2lgG+o6NgL3O1reY7Yo6HxApLTzbT+ZaQuTDnMNtvNy27OtoUsJctqt8Om9trn5YFcq1ByjFQj5fy7JW0VDwsCmJUpKh2ckOOKQD6pBUffBhS8wV+ty5lqdlqTFYbCnYCqYwHIyDsVumQWrovfzpBT74MmotpJLcj4xh/Z1Vi43cyRWYkisuxptLp78x+RzVSZLK0Btai4opIKlBIIsnYeu2Jv3nUaQ1asUibFDaQp2QhCXWUj94qQpWkdzcbYrMsDLdYclyGKVBVLaUpAlZJcVTihYte7i3ktOWveyULT72wYZenVWfTH51FdezZSGFqYeiTGEx6i2ofGErT+BJtv8Gn5k7Hr+0rCcEcTK6Fq1whzBuZmSXXr02jyEoZSq71QSApDNwLhu+y3CAP4U7E3NgY8qpMZchoo9EShEpQLpUrzhq/V50/mUTewO6iOwBtvh5ccrEhbuTarFi0px5SZkGfHcL1Ne6qSlq4KCT/o12AJJFxtiqzJlOr5HaD8mRHm0+VKDblRDakuMlXRTqbkEbaQoEAHSLAEWpVaui0hc4J7RckoCCJWiDrdWtE52LEjJKp0xZ13KyN7fneUU+UdBudkjafQ6U3WF/eExtVNy9T7qaj6tSrn8xJ+N5dt1HpcmwSmw1U402uTWac3OaS3FUpQZKwsg387qwN1Lva53tsNtsEVVcamJajRkFuBHvym1WJJJ3Wr1Uf5CwGwxYBXpJzl7DiVztVVUZSalLR4eLFTohw0g6WEdrDus369SST1JsFVusvZlnrSCTFbJQ4BulW/7JP8ACOqj3O3Qbz67UTVpaYDLqmoqCA/IbGpSQeukXHmsfXYb3uoWvKEaFl+LODaTUVuRVsMMSqeEIbJsAQQ95e+9r46BzkzllwqXYsqsn0aBVa60zVfEIh8p51ZjBOs6GlrABItuUjf3xPrEiVmKZQY89+VJQmI2w2llkOuhA1WCUXTqPTqcXFElQJa4brcOLCl8ueFtxVuH8MRiEFWtSt7lfTqMQ26eiVUKbZiG+BBR5J8jkNdTvq5iN/QXxrpJjWbmzPaOHThDy2Wq9GUww7IDsylctoFttTllK5htfTa9juRiLU4UqZUZsl8Mqfk0tLzi47a2wpRCCVKCuqj1JHlJ3Ati5pslMWszYQpFMjPpgzB4iG+67b+quHynnLQdj79T0xDZqS50xxikQZlcdTTW4zymXkqbZc0JuhTrmhKSOnLBJTt1GMPYtYyxwIMCx+MZlpTENiuUvmlgvhdHSlLkYrXbltfC5ezfy/NgNyhET9/x1lJ2Cz/uHBo3mdmlV2BHq7U+g/1mnp1TngzFWWkIC7kXbWbpNjruAOmK7IeQ52Y4LFacqqoFOfuY7UNqzy2xdOsukkAL3IATfSoEHfCtutpqTxCeIWqmxiy4n2kQYRao3PLSQKabF5ptYv4l7oFpIx8qENqMxmZSFI5P3Wyq6W22xYS2rk8sJHY9Rf17YJa3w1QzGbey9Iep05lOgJelPOMvIuSUqupRTuSQU9D1BFxiM1kttC49RzRIblLbaDKYbJX4Y2WVjWFEl5QJBuoBPlBCR1wj/wCXoKbhnPpCfgbN454gvlyg1jNNAYqVPp9HgxCgpjiay845MCduao67NhRBIABuLGwvbFV985gyNWafBn0aPPmTvFtwqdSpXMkOKeYU3cJKRpbTYeY2AF+uGBmriY5EkqouVaU/mbMamg54SIi7UNCjZDj6zYJF72QSCq3Yb4GJWUM706nTzTcpVF2q1GMs1GtS6jCbmTXCk6GRpfPIjg2uhBKina6dzicvtG/O5iAD2lyn2WlvJXiD0rLcSHR36rneEvNDjs4U6nZXoklxtlb6ElT6luI8znLAKSoeXUlQ9Divrue8sVuoMwKrwxmpfZSENMzs5TWiwntpSsAIHysMErX3plao0hM3IWZmKbRqSimxDGjNTPxFK1yXlJYdWQpxQb6A/Cr1wL53zll3O1UTS6jUEUenwAJDzExkx6jKUfhaZbdSlaBuLqAHqT0wvva5suc/WWQp058OtMCVtVoWU5FYMY5QzlS5bKQ6puiVaNV0N9LFSXAVemw3OMGZ61KfVDy7xAgypaTymqPmCGujzAf3Updu24r2FgcViqRWMqUpVQeM2kZQmykc1pDiRJKFeVFtgVdUgADf03vi6rtMgMRItIg5XYMuqq5UGDWkc2dNA6qMckclAFyXHCnSAToJ2JydhwWnveOCoMG5UiuzKo5Sc8Vmt0SpAkN0uRFecXOIsSI7bADTx3GySfXpvjQ7kqnU2ptRao/OEx9IVHytl9tt+pvj999xOpthB72JA/1oO2Cpih1ag0yZlrI7zVXzFAbUzUsxT3l+HiLV5vAQ9QXoAvcjom6dfZKQzLGYmqLVl0x3KU6l12Q4GZdQpmYno0pT35Q8l38JZVfylxRQbgJPmTcqsW92awiZA6yWxRanTZUqDTKZTeHMQqIcbpiUyqi5bYhyUu469dleysA9byjAYqXg8wPPzlvELiVmS846AomwQ82pWkAk6bp0g3HwG1z2t1fkVs+IzG5ElruPBZ0h+AeeUAB5JTY5K+g+FCr/ADOKTPElcSGz9901+mWJSt95KXIikK6fjpJRY7fHpJv03xtC2RmbJ8uesGo7qsp1QtMA0uoxVBJYcjplMm99Kk6hrKVAGxB7EbFJwaxc2U/NDWiv0GJLU35VVCkAqUg/xN/tU/IasB02Ql2HHgyGXJlRYSVUtSElxyQzcBbCyOwukhZIA8qibpOrRUGFPT4rM8qmVU7R6VTV/iFJ2/HfukkdtihG3VeDlQ3WLtWG5llXaBRxIrNJp1Qi1FkwjUmfDLTzI8hBsdWn4FK1N3sASB0vi0yRxfmU2MlNU8ROpqUJWXXBrlxUECyl2A5zYFvOkXHcbYqafSZtBzApE4RoyUUmQ6mJDb0tsp5jNxrsNZ9SANx36mhy9Bp8nLtOcivLjS2ozSky2SrVHc0C4cbO+k+o7G+42x4qrLtbmCbaUBMf87NTKojbsJxMoPIDjTiCFNkHuDiLSp8arVUCrqbDCGjy21GzZcuNz26XtfCVo1QnZfedfYZ1NNqP3hTGPMgkjVz43zSoLKBsQbje9mJEks1GKzKjOpejvJC21pNwpJ6HCz0qowJOs3Ieeku65OiPVJSoDaW4/lCtI0pWoX81v0H0wLQJIzjmeu05ymt1KLT2ENMJqBWKeh7SHZEiShJBfDLbkZKWb2Ut8athdNpp+eKCn5goiOBOVptPrbS687Mm1OuGMSeWZIVdh1XRJQhlhGgkK/DG2C1+RSQMnoIXSqLLCT2n3LNFdmVyistVNP3hDmoq6330gKd5biXHCEAiwN9IA2SFAdAMD+epb1dzXTS81yUtS5zTSr7OJSlA1f7Vx9MX2TYjUDLtLrTbIfrtZpYnS5rl1GLGcILLDX7iSVXPdRacJPSwTnCstwsyU6XLfQ0xFiSV6nlWRcrYFyT7asbqBN3rjP37ys5xVBeiQYkii5Zjc3XJgxESAArdrW0Em4B/Nc9e2Dfh+1GrGV+IWVKhES8lqZEr7AV6LbEdwjuLKbRuP3sL4JgVKg5HS+2FPvNqSmSyooWlAaWQAobj8u3TY4n8LMwyWM7QnXlFTE1c3L6lrtqWkJK2i5YAX1tK6AdcNGt2ViP6cyXpTi4H6SLnylimUUyIiFsilPokshlIBQhJssJuLfApdr98VjUWPlytQpUclMeoXRLZSsqS06SOW6SepVsgnuoi2GfmiK1VXX21tFpmSyUOIV6FOlX+YwpEUSpTcg1NLbC3HYTRYluKBUUllQTqAtdSglIWEjYdSdxhqqzcg3ev6w+rQK2RG9kPOjMnKGY+Gj1Ll16o1V1MigU+Kg3SpxSitfMsUtIaeb5xcVsNfQ9MOfhpwroPCiUvNHEGXSMy52LLYYYjRwtuAlClH8FKiSpalKBLhAtby2F8JrhOK8l6tO8I4MutNB9tFWzDU5rLCX7p5aGW3CgAgKJcKAPLfvdOGG3wSznOjGfWM50eM0+smWpEB1xbCQbKShxbllq6jzIFj+XtiH7QqvvzVW2xD1/+x/iKIdp6cwm4p8Xf6SQEtQKlNKHVEvxwylKEjawBG5tt3N/bpjXTeKUKRlp+C7Au83cxX0AEE38wV77ncX/lhecXeF1U4aQEThmET3jNghEaR+GpEZxSG3OaEJSOYpTlwCmyUDud8V0PiFCzBIXS49Qiu+ASNceKtJDXa5AJ3639+uIL+yVpqXZyOuZxrGJye8mZggSKrAW+qpLcWFFaoilEJSBfzA9NW/p0wuMpZNTVeJzsue7TIMVqDzxPq8lDbLSU6dTpUrdJT0CEBRVfYYKcxV9CIgZUlKkP3QiyyLmx3t6AdsCbTlKq7IaeMScYK9BS7pXyVe972OLWgL0gsRxFrAWGAcQwr4yzUspOzomZYk+b4ltmFBUzIiSFldwZCGzpLqEouevUjULbYFKnR26gzHSpQCGnkuLSoXS6BcEK9t7/ADAxlWrSKcoIEZbzgTrKUbG3oL99umB6VnOO5P5S48qEFWA8QnSE32SpYBOgHoNVrn5YoHxLiGRekxXXsHJzLhC6bQUKZbS2226SVt6tQ6W6X6W9MVOYn4+ZYxjtuoQ62OZEfHxtOjopP16juL4qKnSXpUp+Yy6HUKSkpQASoEbHSoHpbe1ut98eGEqU8lLqHE2WEHWgp7D1/wAsFqrCkOG5jKwUi19dHq9UlVJjROSHEqZTvd46SEpPort7DHQWT5w4R5KjxICGZWcqsnxdTqDqdXLudk/3fhSnYbEkbjCZzpTm4U+HmEMl5MRxsy2U78xpKrhVvVJsflgortcNZitKafDgmAFbqVWs2Ei/0IKRf3OHb/8A2FQDoev8Rqp9uT3lhVOKOZarIChWpRabXqDuoAKUD2SPLp+m/pbfFJVOJVQr3NdnVV+qFsEo1lRYSfUkDQAO++KeY4zKg6damYRBLjnwDlgevYHYX9L4Y/BzhnSc1xV5nzWypOWYljTqStGhMqwH4riNipF7BKehtc4GyUadN7jGJsM9hwDKThZkFXEF9M6bHdRkmB+PLmvJKDVXL7NN33KVL+JQ7bDB1PzF/wBIdfhRHY65eUqcVuzkU9CktOaSEIjB0EJAuSVBJJs3psLnETNWaahxIlTo7VWh5Xy3CcMFloICn1kCy+UgEAadWnUQbG9gLb2eVY+ZONb0PJGRnhByzRmm41RzHyvw46EoCdCALBbxAvYWtck26hGwva27pj7L8T8YN2/6JBhtdSzFXjk7IdDS/VHCpSmG/LFpzKiTqeX0TbfbqTsNyAWnG+yHl6m0xK8157r0qp2/FRR1txmgo9kI5alWHqogn2w28q5YoXDGjM5QyLDKXHXP6zOJC35jx2KlOfmPW6ugF7WAviNmSvRlQ49JisxlsRFqUZqEHmSXCPMoqvum+yR6AX3ONVtjy1cD17mLMwRwmMnv8IqKd9l7hjMVMBn5olSGNBQxPqf7VKtYK/IkWA0gdepGKvNn2cuHdJggxFz8tSUp8j0Ga4tbh9VIWVBfr0HzGGc9lx+NDTm6PMeTsuAphNuUdJSrzbE6iHbpsR8J64D6wG5CedKJWuxAv1w4jWbveOJyvB3Ees5czpQ5uWnfC1NxL8crKoFYbb5YWodEuJuQ2ojbrYgm2N8SWuXRbEklkhwG++g//pw5czNUpdBqH3u2lylpaUp9LndIF9vQ3tbve1sIxmg1bLTDcmHGXMgLbBcp5VqfYunzJSTbWOu3UdN7Yp43rnuJ7IHB6GMysNq4wS3auw+2rM6ozYm01zyrnFttKC8wei1KQkKU2bKJ1FOoGyU7SKDOkqmwIcpPOiE6WJAugt9UgHYjrp79MXNArJS63Lp8hSHozwcZdTdK2lJVcXHVKkkfyGDHigYsTivTK5AQhuHmOA1KU23slDjjQcWkD+F1LycaXKnbE0HhOKx0PSKeS3KoNUJei+HlI3eZa3S83ewcR62P1sT6YZWUs8P0OI7EcYYrNBmWU/TZNy0vbZaCN23B2Wn0sbjbEfMFIazRGcZZc5NSiELYeKbaVEdD6pUNj/zGASnyZFKWvlskspWpL0JXxsrB8wT9ex69Ra+NkBxmNMiuNrCHMmrCVFSXVJmOJWTDnBvSSCLL1DbStIJJFhsBiyg5IqcxLCY9depyEhKuQ00SEq363UCeoA7bDFZCc8XUowdYbiuFZW+AsEBQFyb97gIHyXi1l5BpVVlvvtSJEOQ4SpYjLSEhRtva2xuQfr8sTnIUYBx+cnZxGTlWh8QKDGLsDMcCrApAEepxVNAWuAQ4gk3+FRv1II2BwIVWVNbzZNRUYkClTnApx6LT1FTLhuBzU7kA9lD1KbgHcjCaArLEdSqzFQuGAAmpRispPbzpG6Fe42t3xveSv7oqUihRG47sUMFV44HOS6tCG9NvXUTc3totbfC9VQRjYSOfhiEzkYkDMMhFUzxS4hcAZpzSpblztzF+Vsfpc/XFHmSpMS31RmZCFOvuctehQJQjvcdrjb5nDny3weyhQa3Uns2ViK5HlyWA29NlBC1aGUBYCjuCVlR8trAJF0gnE/PPHtmgrZyzw2p8fKjEUqVLkw4sVeq+rSWnm3HEkXKuqSfcdMHXWhmFVC5+PaGrWJyjTIcWrwXZEcS4kV9pT8QGxW0FJJR7XSCMHvGWs0nMPFOfMo1IVRYSIcdlMdcdLCibFVyhOw2I/lihyvTX81Zt8XUHXZA1GbUZshZWpTaBdSlrO52GkXPcDEWdUVVusVCqOXDk19T+km+kHZKfokAYbbpmeCBtQG9BMZSVUfNYB3FEfWP1TgHbk/ds1iWf2Ck8p42vYHdKvof5HBxAeT4urRVkJblUWYzc9iGysf8ABb64CwOdEbJT1SCR/ljVfIjH/Ywtp0lnQunyCFxpaSEntcjdP1G4xa5YqsilOtK5qkyI6+UpwGxStJ8jg9+ivrgBpq3UtOQ0n8ZkCREPeyT8B/mPksemCyG8JEhDiSQiUylab9dQtt89JH+zhaysCHXzcGOXiGG6VxIiZjhJDNKzhERWWAj4USSSmU2PcPJd29FJwyOBNVh0XOs+i1MJVlnNcZVPlIV8KQ8NP08xHyCz6YUud6kKdwWyXGmi1QRUJlUghQ8zcHShCj8lvtuafXlrPfF1luqMzac0ULBUAlaAjdRCt0kW7ncDEjUAgBhE6qhqNI1L9s4Mop2XqxwhzLWcrVZlx92luLbZc7voAKmlD+0jY/xA40U2pibJmyoqwrzpkMnuUlIsf93D6+0/Fiy8y5blqcbOYEUqOxWW2yCpqQAFJ1kfmBNiOwIxzDk51ykTXYj/AJVQX3oLwO1kJOpo/LRot/axzAsUnvHNFa1lKM3WPSpQIHEDKyqK++uO9LaTMhyEDzMvNlKkrT7pUUm3cE++Fnxsi1fiPkqmQl0tE3OuU5ock02ONfiozidKltj8wNm1AC/RW10qAvIM99inJXDTzJ9HfEmO2Du4ixugf2m1uI+ZHpgj4pSItVyK3mmkPKYqLCWXIlRZ6tsrcQFlwD4mwlRUpJ6WvcEXxPrLae1cc88fA/7la3LoSOs5kyxl/wDpRMqFPKJFP/rCwlDzZadjvoausadikpUE/W/rjb/RyqxMmHONFPg6pFUpNQShP4UlDbpbcK0DbbSVXG9gcOGFw7az7nM1WDmR7LlcqrSUrksx23mX1WF1lKvhJSlI2Pm0j1wOZugZn4NcHp1GzJlhSFzkSqc1VGZTbyHHHEuEuKQk3bCtS1XPS3TFtdatrBEbzHHB/Pr1iVTIVJbgwfber2YqjHerimosCCouRafHdLjan1J0qfJsN9JISCLgHF6w+lDqAVpClGyU91G17DFVDfQ/GZU04HWyhOlxKrhYsLEH0tjZDpjdaqUhlyDIkLYiPKjyEAaGpWguMaje6dSmyi9rEqt12wyw9eAJDdmsbLGVfFaQldKpLT7anIa6gz4gtIKnAgalAJ0+YXIHTfc4yGKezkp9dJKzGkLAK3FLK1FbyWnNWrzXtqTv6YpeJE1dMKIJqjFRqEOqMmXHDySiOvl3WkaRflpUvRc3JKFKxYNrYy1lEQ6i8FSH3HH2xGSpadRe5oF7bICtIKjYebHWXyKBzzKWk8qkGD2TswSqROiSUPK5cyUgvNlW13HAAsehTqHTqBY4btRzVWY82DAjSYrD0ht17musFQWEEXSEhabqubk36W27hSRMozq3HjJp3LbgypShGluK0XbQrUXm02upKDy03HVSgBexIZWZMyZbpx8DXn4a7jnoYlscz1ANikgE2+eF9UENikLkyjpmY1nJxCk8V50rhBPrC2GW6xF0Bh1NyglTwYCxfqmx1AdwRhN5KzFLXnakVB+Q7Lmv1FcaRJeVqcebUhYAUfQWSbDYaNgMMGLUKfn3LNTp8WUjwUhKGyYty4y4hSFtqUCBYDSPJaxH5sC+TOH1So+YWX5zaORAW4+2+2oKTJdWlSUlI6gALUSCNiEjfqQ6cU1V2AjBPb4Q1psd0KngS0zcKbmXiMxS5ENKH1RuY7KiLCHibEBLih5tOlv16qSPTE6l1Z6pNvqi1FeXcsUrTFSmIizz6gAkAHci90FNtyFDqTsMozazS+JMhDdSgyY1Qmtx5DAChJZcSzoGm3xJugAkXsVH0OLCCuPk+NPpdbD33Y6+h5qosJBDak6OWb7jUAhs2NzqSTYpIxooUQKfQY/ebDAsSIxaHIqUZbFHq9Qeq2XMwc6mtyZDQblwn1IXZtQIF7gGxULhQHrbCazvkx/hnmpNFfrkOQ6iI04H4pDC0kqWnlrSVqsoaL9fzDbDly9XomYY9FajGWmg0iea7Uq5UkBpDpbbVoSjyi9iq5IASlKAOuFBmhqm544rzodAlGqU/MFZbW1KcaAvzDzpOg23QkakgnfbHtHu8RgeBj0/vaD1IBQY6wakMzHqvRoT1RkSmpEtDqkOlKgEN+cqBIvtYDr3x09kmks1vMjjSo4K6glqOFlYsGUpsE77pAupfzcO+EfVqPlGl8QaY9lyM69SH9VMUEsrbHP1kqWkkALSdJSSnppwzK3XsyQ661lXKiqfAXLpJfn1OShS3ojbi1N6WwNgspFxe/c7Wx3WBrdqLxx8pihlpQu8FeK2bJOeeKq8xNFKspMLXlijLHT8IalODsUuOh0BXskdsDDUBEtNSi1BwOOvqW22UpAWGynYJPU22OGlU+HcKVw+GVIi1RWGWkJjPD4m3UEKS589QufW5wlZMYTxBkSrpqL6HoL6lDePMbVe4HbdtR99sHoZLFwnAHH8Scrm1jmXfC6eaPU5FKTLaf8AGJ8Qy4woqT4lrYj5qQEkj1CsdKMSZ2amqLmOhoRLmQWHob9PcWlpbjbpbUeWs7IWlxtJGogEFQ2vccrocaQYlShRxHfW2moNtI2SiQ2sofQkdrkFJA/ePrg9p/FWoUd5+RR50bLlKmKK2pFQQHJKkqF7tt30i5uRq1HfdOF9Xpzadw78HMpV4avY0ZPH6RK4jcLMuZqfLcmFR5LK5Di0LbkGDL0NhCik20pe0a0HuUnubqFdZEt1camRDNcaOhThUG47dtrarG9ulkg272xOzFmqSxw1n0FMDMaqdWnGojVWrDTkanJcMlEggqUEoSDoWbhNhfbYY+V7nZDmu0nMMBWV5rTYdDUpSC04ySQHGnEkocTcFN0k7gg74JoKTTT4R7E4+UmWoVaaqRS51Omv1CTKZkS3EBvQhoobaQLnSm5J3JuSTvYY2BlDEpyq1JJkPIN2bJKwwm35U2O53JP+AGJ2WaBmjPdPkSMr5Qq1XgItaYEtsocCu7fNUkufQYJ4XCriFLnRacnIlTYmSGS814lbSGAgGx1vBRQ2q5A0KOrcbYHqtQg8u4D15EBtPXEExIbrFeEJaGpTSG0LbjCR4d5KlBQ54BH4iUAg7KTZQ3J3GKOk+MTU8tpkIfiV1+pvS1CNFVJeQ8wSi6UoIJHl30knTsErG2LrOuQM3Ra5QqTNyXX41dWpc6BCZaJckoQhXOS24yokKSm6t97hNxYnAnmJ2VV3GS4+iSyxNZSJshKEOOrVe0dQWnSh0WcSvUk20AlPoSgKUG0jBnhlYz6xT05bzX95QJDLdLqtQZjrorTBCGn1RUuSnW1GykJEhVg2UjZS7gFNhMpmX6jxOzAJMdibGylSkrS7UW0ISqW4pxCHm4Rc0oW6lKANSjpTZfU2Boa5AXmTMFFiOzZMMOIDinJkdLctlVtDi3Fp/DWG2OZoUiyVKUNgUkYscySpHGiRBynlSkPSsrZbQ22/TFKgKiNrQ4llDrT+krQhRStTh1KJF9uuFlJ4BPPc+g/mMLYdm2DTsU1ut1CtUGkCitxZiWYMJTZbedSw4rWX1qcWVuqK3UFZURsLWAth60Kvx8ycJc/ojrLnistVFvlKGlaXUMKulST0UBa4P7uAVGQs60ePFcpVFgVqkoh+KcYoSgpbCSErQhtKlJU6opUFWQ0PiSBucQcuZzbyxmhVTVEeZQhXgq5Bmx1sLbQsaUOPNrAUE6StsqItZYNyEbZtA1Cgqc46R3TuFOPWW6eJgrU+hKVFdgzxSXlpDhSpLwXyVpcQpOxBCCSNik9Rggizo9U4uZieSpDcWU/DWkjZKA9HamSL/wBt1zzH2GAHNnDuq5LpLFRovNr+UqZIDzD7d1SqZGN0OMyEdVNpQpVnBtZAv0uIS5KhDmsxJCWZNXfMJL4NtLfLQ044D6JZaWb+2AvSj5Zeh4ku1HrYhhGRl+qVrPtbq+ZaO7FpiJkhyXOr1RJ8HEjhIQw3puC6tLCGdSQQlKr6lJO2CaXRcvUDKFRzFV4dTzemyGoX38+tr7zmOeRlDMNsoQ22pZSQXApegKV0Go0eUkCtxY5YhRIOTqE0HGETJHh44Q2Cee6Sk7DqLi1/MdyLVmb+JNSz/mKmzqVam0ClBz7s8THK3n3ljSqXpJASdBUlsKBslRUQCqwRHiXWhE4QdcfDtn1hkYtJ70hnhVkiFlyCGHcyzFCSENICG0ulwOOvFI2Q2lXwjbYJT64B4kRuQXkMvrlLedK5stxV1SF382/fe4PYDb5R3ZESVMkoadeqUl5Q8bNecN1kflU4OltxoQNum2Ps6Q4mC6iLGXHbSAgKWpI37JSBe9ybb2sD64pgYyfWHX0lvTVIqS3Fqs/HWsJRqG1kK2PuNQKsNrJWcJeYqZR6EilSKdDq1STHfqDykBPLbN3m0JCiolRaU3qIAson0wqqQwqM7Eip+BCLGwtskWv/ADGGLEr4kZKyjU46VtXqBLesWIIZdUP1IuPW+JWsXIHGY7UoY8y2Wwy/k3MzQ/CrFBqtTnRHgLKQ43IecsPZSPKR3Ss4qM+5uXWnF0mjqdciX0SHIxPMfVa6mUEbgAHzqH9kb4sc0FUnNOeIMN/7vXOkMy2XQhJTy5EZokkEWKFFLqVH3PfA7RYzGVmaol0hL1NdVDcZQTdOntvv5ydQJ6hQPoca04BAJ6xAqBYc+sg0tVKhU5cd2GzLnAKOqS0PDMNp6qAI8iU907KJ2O5vi4Yy249R1PF51lK9osOUjXe58y1i92gQSAhspKe5J2xUw6ZKrjk2Xf8AFDgUUbfjOpIIAJ6BvSkDtqBvti+/pot+lvgthFXQsM8tYt5ybayDuALEkHpY9rEssI1llPknin1qZSlJprps2hwNBptSdawEhRRHdICVKsR5Vp1C/wCa2DijRIOYKO3LqKmF01sqcRT2VqRGilPxKWSQpbqdypxy5BBsE22FMuxqWplaKo9GK32whEeY4kKDJJOog/mWbrJ9wNtOIM1gUmpPx48pVVhPIQ6tpKtQkWJ5bDyhtqJRYLvdSQUqvsSu6bjNZ3EovBjAjVOLOkLdnQ36u7ISFxAppbslpgpOh2WlLjZkIKgFIZXqcKRcqPw4tFwIWYm4jdWfcj1pDXOhVeM6XGX0Dy62RYJCQQApnSktnYgKsrFHRmqEqnNypU2VVJE0CQ87qcCVrULnyoAFhsADcgADtjQ9JpUN6S1GStNGSttciM0FFaZJ6Ox09Q4loLU4Oi27pO5BCj1CbW3e2wfeF8KTLrrxmrdFPzBBWIrGZCgpiyj5dMaUVftErKrBW7jaib3tqUX0zN8er0uW3UIJh1GK4YlQpUgBSmXbX0m4spKgQpKrWUCCMKbNC509qVOekNzJlOGqPBaSBBEXTqSlpvfyONKBC/iuodLWFs9NkVagpzOyFuVKgMoRUUlF1zqSpVkOK9XI6r+bukL/AHsLmoYBMzcotB2+8IezKfRM0UxqlrjeGQ0NbIi/gqYULj8NSehsSNtiCb40TOF+W5tPMb7uSy8UWE1o6ZKVW+IOdbnqb7G+4ttgfNfpMZ1KHKrCbcNiAZCEnfcWucEH3w8osOBYJQkaVA7KH+eOf5UwEYyR8xFiiNVMmPz6W5TpEtuE6pRqCaJz0utkBYcUvlKANlWVvYFJ+EbC/p0+FMhNvuT221OJCwI9GjOJIO6TclPUWPTv3wyImZ23322yyUaja+rYYFuIuQFqo0V/LFKiR6hGf1KaYQhrnNruFg9AfMUrsT+W198WdP7VbIS4fWI26UOMrKqHLjIn2RO5muNKAS7T2IoP9Xc6KSokm/bAwGalW6zBhUWA5U5DEdpT6kOBtpgC+y3DslR7JFz3sOuDvhxlemcmSmq09l+vxXjznJKElxKVAFFjcgJKVWsk2uCDc3wVw4NJyu1IaiIaiJecLrjaVG6lWAuATfokbDYY9qPa+CVrXmZr0QHLGL2lZGzBWcySpNWZVSYT63VvONTeY+oLuChKkkkXBIKib2JAsSCGZTaVColNZgwWExojCdKEJ3sL3JJO5JNySTckm+KdzNSkrXpjgjoklW+KCtZzS043HlStLroKm4rKCt1xI6kISCpQHrbEW6zUas/5DxHkRaxhYS1SownEuMyGmpcXTdYcAUnb1B2t3viOM0BUdpURtosFIKFJN0kdtNtrfLA3T4yMzBEqdeNQ4zqtUeU0UmaQBpUQqxDYJJAIuopBOwsr5Vm6AwzJmUlkpqThKkobfdaYU5+8tCTp3tudJJxhahnbyZomEj1YYnMJ8U463bq01sCfngFztmp+E5CpdJZFRzJVnCxToj5JSDtqdcP5W0Agk9yQBucapeczTob0qp01MKLHbU4/ITJDiQAD8I0gkk2AGxubdTikgzJGTszsSp7IXnB+mSsxVZB3TTYDLK/CQR6K5jiHVnutF+hThhavDJPeNaerxWGekp6bwvpWYapU2HahMfoNGfWquVt+Ytv7xmJsXkpAOlCE6QLpHlSNN7kFEan8K8tZqzJlqWzQWKTl+o1RtiHHClofmMISt5x9Z1aglSWClKQR5Vkne2KKLmISOHOWaXNfcpeW2Yjcp5DiObKq8pf4jqw1cfhc1S7KUoJuOqiAgEWRKpNrvETJ1WapDjFM8e6gVKUvmOu6oUlCQFmySne1m0JGwFzbDJV1BYmPjLWDnAgzQpLFGyqHKdLzDT6s7MltIfiVl+LFYCZDiUBSnF8o2SkeW3zxcOZ9zrFpDUKdmHLvENctQaaoFVitS3Xh+f8AFaCEoAG5WpKwnuSbXrsu5Koyct/fNZfmVGVLqk6NCo0RwNF9xMp9OjVuq1kKUpV0hKQSb2saiqZeMKhV1ygaWYzbqWaxWGlrVrJWEmHFUolQQgqAWu5I3HxklB1CNxNhyCTuOMzdEzTktqsKk05MrhVWYilxWpqAmqUMOHZWhTgKGzew8pZIO2+4xaO/fPDiNUK7UUoVU6k0zT4ubkPCVERznLPS3XTZTJSnllKFgIGghKiCRiVlDhrSMx5SaXElyIEpoGM40kJW0LdLpIvYpsbAgdcDFEoma8i1CsN5Pe8ZDgucmXTSCYUnV8SQ2bls3BB03TcC6TjpCOSq9vX+Z5blJ54MedLiUjJGXafCgn+pDS2wQeYt9aySVk/mKjqWpXfzG+Abidkz+mcNU2K0398MNqQhKhZMpo/Ewv2NzpP5VEG9ioEFy/nGPIbLuUW1UOZoMh/KU+wZ32LkU3s2b3F0/hkgpUlBva/y5xGqNdQ6FJYS4yvlvsusLbfZX1KXE6vKbb+hBBBIIOAil62Ng6ydaj1Nu6/GVeV62M5Zdl5bqrhmPhgrhOyRqU8lBAKHAerjarIUDckbnfVYYiQ36W6qPlWU9Tg3pXMYcXzKcyg2J5rar2UUnZDZSo7H4bnFlmGlmqZwfepkw01LSw/UZjIuqO8QPK0DtzXEK3HRIOo3KwCKSqsM0tJplGYlRMqRlKHMjIWrxrnVdnTa4J1anSdSiSB3UXkH99I7VgDd2MrfvmOHJaqepOV5alFhU2O3rpb6/wC8Pwlaidhayri6yCMenUtU12OzIjKolZQRzkKdKxLF7h9tz86go73soJUbgBIxY02vtRpaWI8NTLLeltlK2kltRSkK0AX/AHVdO4vjXV0UOtQ1tRAhhlZPMy/MUWk37mKpdi2sG/lF0ncWT1LAPOJpjkYMsc1VRuZTanUg5qksUbw60jb8ZanfL8zoaP8AeGKBtl3LUow5iVpEPShTjX7WOi3ldQfztm1yk3tvbpiLKlRqRlmlh19ctupVRp8qljkqWy2pJSFXFk3DCQVdLuX74KsxZlh1mKmWqLKhTI4OlbjWttxH5mytGoWPUarbge+OYIi7eTCdpVVePOpq560BDfOhiaxMjH8NbrCgrUn90qQogp9AbXGNtEraKHO8QSGqbKWkS2AfJGcX8D6P+zcuL9gd9sRYkpbZptK1c6C6+tcVwKvpaUy5qQfqQRiBQWVx6BBZeQqW7HhIJS7/APaojibKQfXSbpHyHrjYGRzBMoKhGjcLgb3Hbe+B+BOlVrhxmzhizAStNCddqzMwOhATElKccU2R1LgWXkgfu6TfApSM9LFAqsuI8ZdLystpE9xTepyQw46Gm9G43TdVzY3Ldu+GhlVcbhxk+ejMbam801pQq1YYCQfCIW3ZiMo9i2ylNx2K1euF7Qa6zxk5GB8f/wAnNDURac9MSFn2sUKhSE5PyUzrpMBGh58PLcAV2a1qJK1C++9kiw2vbCtmUR3OWYcvHw7/AN0xFLqSpnIVynloIQ22lZGlQuVE6Sfg+uLvNiYNYq1GoTLKI0GoVWn05cKOoMkRXZKUKSkj4dQCxce/phgcZqhByrOqMWjNJEKG2luNFRuhkBISEjc2AAFt+lsK2XHShFQZZs/7MZ1dp5UdIj81xoMByjqaaQ2liollhDe37RK0mw+atR+WBEpdhUqbVI63ELpdbcnpab/NynUqUDt6BR+uCjMjrK5FJkqU0iDDW5Mffc2KTyykdunnJJ9hizypwQzJnCUz9+RJWVciV2et52qy1oZkuNcoam22VedPMWkgKUm1iTbFfT3LTQGtbHz/AL1kxDzxGJwjyNReOGc81Sau+/MydQG0BH3e8tKZchwLWv8AFbUCeWkDyJI3ULnC84qZSyNTo0tzKMDMkCfPd5KHZ9XIhpuer25KUFKdJKl3tbvhx5w4lwcmZTj5ZostbOXYLaYaHCygPyTfSlNmkpSoqsB5Ugq6++AOjZIqOeMzUx6qUisUXLkZRckKqbLkZE1R8qGUtbLdUV2IT0ISRZWoYiaW267UG8EirsPl6/Ew1tm6dbUdml5cyJTKDHp0Kk06HDSHosUnw7R0XcAJ3031eYnfqTvigqNZDVKiVIRVR5rjj6mXpAOpaEqTypQbOyVLurzEG+jUkDVfGVGS004puUUKlMkERFlK0xFDop3st64+HdLZ66l20B1cmLqC3HHHHVJU4lAUlKnHX3VGyUISLqWtR2AG5O/Y4crrOST3idu29g54UfnKDMMtmptyGKgEzxKuH0yE80OA9dQVe/1wjuIVfplAz1Tk3gU2DBpio6QhaG0hbjqTp0giwsgEdt1e+HlU8uM06a4msZjj0SfbSuns09c5Uf8AhddStKQsfmSjXpOxNxbA5Oo+VGpom1OuNVppvYRafBfZkP8A/Z63WwlpJ/Mq69r2STh9F2gq3QzbXoy4UH7RbZTo0TiaVVKqqep+T4bqTKnqQUqkrHmQwwgj8VSxZW22nckJuRmYjKzJUarU8u5QjUmhU5bcJ1QWmO2npykldryHlJVrVpHQEhKUgAH8hD+bkRqvWnPuPKUW7EKNBRp5gSfNHhIV1N7a3lXCSSVFayE4hyE1jiVLRSKNS0sUumsqW3T469ESnsk3U8+8sgJva63nFXURseiQYKqrsUcREcvuY/wP9xPZey9X6lXmMuU+EZtUmFwxngu7TbfUk33ARqAsRYgXJAvZgzsn0LKWXfBU7MEeuPzW3ly5IaUrlvXKQVFaEpcG1xpGmwFr97Bb1I4f0uoUHK037+r1UZLFUzGgEMsQx8USGVAKUlRP4jxA13ISLKJwCSJjjrgSNSUp/nt3w0owOJ0B7m3A4X9YJU3MNMh0uI25LjsaW1JSEKJToRtr9QCADv62x7YqKajUZD7DyXorYShCkgaSrzFRB7jcD6HEtMeBKqS5DcROvlBtL4RZK0gm4HbrimnORcvym4jQOhYUtLLd1qF1b+UbkbncdLemAGpckr1Mp+CQgYy0RWostDJbOsPqUhvUkgLIBJG/awO/TA5lx1ufl6K+UhptQcOkGyW0lZJSPYAW+WPdaqD7YbKGubVpJLVPb0EKjpKbKUr0NiCfpbE9qgNobodAbTZiQ4mO6RsVNJSVudP3gkg/2jgyhUWcxg4hjw8yXEzJHRmOvptRWjzIcVweR0A7OrT3ub6U9LC+98Emd+IzryVRYK0xYiU+dzYG1ulzskAYg57zexTaahp5TcGFHSFLSnZN+iEpHoE2AGC/hD9m2Rn8N5u4kR3qRldwhyBl03bkTgBdK3+hSgixCRYq2NwDczSosPj3+6Og/veN52jYsAuEfCGu8c6kUwVroWR0FbtQzEpOlTyEq/FRGB+IknSV7gG9/Q9fsP0nKGXI2V8o09FGy9DRy0IbFnHe5Us9SVG5JO5PU22wReLhPZdkw2IDFPp8FtluE3HbCUtEKsGwBsBo5hsOnLGPtbjtVB+JRnGFQXGil6S466lQYbS3qUEpA8ulJNxuSoAHe+BW2G4jHA9JKOq8JypHeDjLqqDl1+ckKTOqSVRYpA3Qx0ecT/aP4Y+blumKKu06i5UcLFWmvz6ugfiU6npShLCuulb6rjUL2KUoNiLXwQCtsLnzszusaadSAlqnxVHyqfsRHb99NlOq9dB/ewo1iXWKiooQ9MmSFlRCEla3FE3JsNyTe+2GqUiaFrHLscev8T3Uc+S//g2XFFtqI86/ICUJsXXUoHxEnchAIAFgLHub4CZ2avvSYWKcw/VZe+mPHTYJTcgKUpVkoSbbKURfte+COp5TfzQp6AltUeRT1eIfkqVy1QwDpV1/OoKU2EdfPvYC+JtFosHL0FEOAwGGU9T1Us/vKV1J26n+QAGHPKgzKFe3kLF3m6ku03LZerrjcidOfbiRoMa4ZY1KGo3O61hAWdRAA7Ab3pqvIjwo5cWm7itkBPW+LzivOS5XsvRkq1Bh1bqxf4VKbWBf3sCfrhe1SYZstauiB5Uj2w7SCwyZmwyizlGTTqjDr8awjyiI01Kemo/As/4XxXZmqkuU1TCkqdcpqeYynqeWhzWUj/xF/rgmEdmpQ5NMlm0WYgtKV+4T8KvmDY/TAY0uQxZqUCidT3Sw+O5B21fIiyvpg7Lg5g1OeDDuFIalojzI5StKkBTayOqSP/0fpgHzHJeq1WdqdOgKDKSWJKStOp4oOkrSPUWKdzuAMbKHW5lEkzG1Npcokd8JIQnzsBY16x6pBUQR2GLKhMpfpvMFiHXnnAR0IU6og/KxGOEbYUmSl0mDUW5EiqNNFhtWzjirBu4uTf5qt/dHpje7TcqwISCt6PHAKXA8hzUva4sCb7Gx2A7euJyMsUuqAqkRgtbmxcStQIO17WOKtGV/6MVeE7JlJjQ0KStmWpkFC1i+psm40EgbXvexsb7YmblbjcRJwIx1lrHqVLiNMs0iq1BC3VKDbcZwraWTYlJDt0W3vtvYHBdlFdNystpyozo9IZmEaGnXkjmaVqII2AAuu+wA9PUjlHpbs92QiPIW3T1PKdjx3UAhC7b+XYlIJ1ab/PF9Vsy5gy7T3jW8swazTBcCSjdhN7AFxBCynsLmw/iwpb5v8anrOg5OJbZo4mT6JSVsxqxkfMNKcskxGxzHkb23ZLxB+Yue9sAuR8mzs9Zk8DTmG2S6vmO8tOlmM3cXNr7JF9hfvbbA1LmomT35KIMOlNKAAiwEqQ0kXJvuTvvudht0w2ae1PhcNqvByg2JIERUzMOYtWiMwyAf6u27+ZWxFkXJubdSQ5TUmmT0JhX3Ku1Opg3neu0yGXstZWcUaM0oJmTybLqTqTuSf9Wk30gbHrvtikp7S5AbQ2nW44bIT6/+nU/TFHCHOSy2RytSQpV/yi1z+gwZ0qY3QKU3Vi2FTZYIgNLGzbQ25qh/FY6R6Adr3YfpgRqtRWuByZpzLDiZUoryHV+Ir1Tb8MyyNuU2f2ij6eXV+o9cBLzJZI8wKSOlumNFRrheqsqdIUuZKWossN38xCT5zc7AFV7k9gMQ5U+qOaFERbE7NaVbbfvX9vTBUUgTXQyWXFR9UlA1rirS4U+qFeVQ/wA/pg/yFSFZszNlykNBYcm1FiHdv4kBxwNFQ+QWT9MLqlS0zjUjoUhwQilbSuqVJKj/AOcY6AyM4vhDwohZyjqQ3m3M6no9HdUAVQISPI/KQD/pFqPLQr8o1kb4Hd0gLrfDXaOp4EqeI9aa4h57rj8Ypj09TyqfTmkfAzFaHJjoT6ANpT8yT3vi/wCAD7TVeyshSeUBUYzT6Vb+ZDyEm9+1k/QYVOV5X9XOnoy+tKfayz/kMGtIkqp+aKg0yS2pbrcxm3bWkXI/vJUcTdQOCsbSrbTsHpiO/iPEVS+JmZoryy44isSeZrO5Dq+agn+64n9MI/P8c0XiIfIWm6rBStXoXmlFtR+egt4fPG6S1V6hlrNzN0IzXTEre1bf16NZt63zSU/7Bwv+K2Xf6Z8OEViMgmrUYGa0UDc6Nnkf3kg/UDE2tvDtG7oeIXRHxNKPVf2gZlWvuMKYk6tbrJLDyTtq0myh+ouPpghmVByiVSFBDz5o0ha5sFpp3ShSju60ofmF1FYT/Gv93CppeYUR60l5BvEnMpWs9gsADUPmnR+mGLIgs5nywqExKLMhpwSIsjr4Z9I8qh/CbkEeijhm6oKw3dDG1fcuJaVzI0GkU5eZMs1GLQI6ka34dSUoQlG5G2/4StRA8ux/dwc5E40So649DrbLqudqEdchRUl1O4u050cFhfTsoDsBhV0TNS8zU9NEnkwajEfT4qGr8jqQSCkd0nZQ9vlghZoCcw05mh1cRXIrZuzIXqbQFg3Qk6d2+6dV9O51FIucTLtOtg23dex7/wC4J0B5XiUXEThu1w8Yk5lplRTMy5LqDq3oSGSlFNDilKSUWJs2CSlV7AEgiwvil4UvNwq9ElhMqO64861Fq0Z4uNTUBSith9OohCkka0/DfQOlzht5J4fUjMzMqhxW4tEcknQptCy2FpsQ4lTGnQ4q17G6Vb9bb4TrWV53BHN68rVkIgzm2Vym5cYHw1aigKUlxKT8L6CLHvZKgb9cP0XeLU9Ltlh9yIhZQw82OJGz3UmqlWGIcZcGrKeMhYo1JihDDB0hS1qeJCXnCNQXboSQBvvM4bcO8s06lx6rX5rEWlT6fHYaZmSghEh9xCFvJ1LUAnVoAVYHZa7DyjELKbjrrzdXlSixKgSWohhSY/hvDAsrSplCBcabuoXqN9kEk7YtZmYqpCmM0ugzGkQG1w6e9RqrQw5GS045yW3As2UoX1X6AkHcXw0xfAprOPjAjjifK3mCQuuzptcYptOktJbjNJgyubGRCQFLQloathbVcJSncKJAwtB981J+suLgSnZsFrxk8yUllKW1JCkLJV01gpCE9TsLCxw0Mi8I6HLpaH51P8ZUXKquO41HjpQA1GlrLjiEdEhZQhsm9gFAXte7LzDX6VlOn1Vme5RE5gqclucYuYFrhNSQjRy9DqkaF6EttpAF03BUVAkjGPxK0vsrXc3T+/CGNhICjoIjMvUCTl5xdXmCouVBNo/3TR2wot6wdCJj60lpk/m5elSwNyBi/lcRKdlZMSDVpZnVJKdctyC1zEMXNxrtbYbDYXIGrSL4Bc/Z1qGd6qzUl1FNEhI5iaXGjuthUd0gpI5rbbetBsqw3B1d73MnKHDqrZ4q82vTpqKDlws86oV2W0EsL5ZDaiyi41KuhSSb21bbmyS49KWAWX8fzGatSalwOsoWoLcrM8lqgcyWwl912HNgPlLqEaC4o3VpuEgrB37W3Jxe5W4j1mkU6AwG2auy05d2YXC446yTeyASnSsAqPnJvYDvjYJ2XqbRM4VvKsB6FTHI6MtU2RNdK5Mxx1RL77nQAhJuEpACQALXBxupmZ8uutNN1vhxFnuISAuTEmIQSAOtlISR8io4YsG9cFcgfebqc5yGxmQ83Z/rub6JWqc9GjxqNNUgNlxJQ+w224lVydRBKgncEgC/fF9w8oVUy/QanxImxjCh06mSTSUvbLcdWjSl0jsCCAnudV+4xOpeauDjaUShw3qckA3sqS261cf/AD7H9LYi5ncb4g5ly7NqrjkNupvmWinKkERoVOZTrQ2pOyVKP4eo9CVKt0Fgg4Hhqm0Qzcf5GbJE0Tm36PXMqRo1LmVGNl+KkyUwka1KluNEICh22GrUdhrF8MzJVIlwYsupVhaV1+qu+ImaSClsAaW2Un91CAB8yo98ROH1DRHpc2o2W2apMcmJQ4sqKGTZLIJJJH4aUGx6Xxa1mpJo1Hk1EpLzTLRcSlsglz90A9NzYA++J2ot8RjWgk5rCRt7S3J32OElxVpP9HqzU5khZjUmrITKbk28rE1oC4NumsISr3KSO+C1HEtTMrTNpEqGwHVRVG4WtLyQFLuBtywgqVrvvoVt0xv4mLaqdPoNOeSHok2qtJdAN0rShtx0J+RU2n6Y7plsptAI4MyhKsMRMwBVpUQyVvigQpTin46FQ1yXQpYSFm4ASlJKAqxuQdzg1pfDOrT6D94UutqrzzTRkGnOp5XiW0/EY7zah5hf4SOtgbXFxqVWXMwTHpr9RfhIEgxoyG0jlNnUUp1ptuCob/MWti9yrnz+h7Dz8smIwS49ymxuzPZvui/QOpStJt1BHcm9OzeRlZVQqOsPsq8fHHsmz8l1antZxgV2IV09VUe5a2EpUNaX1fErlkakqT57ixNxfGZayzlSlRqU7V1LrFXipCETJbinNKjvZCVkhCQegAFsA9IyfBplImVitqTDrFRdVOkSW9KRCUtRUG273AAKyCO5J9se4y5dOqaW01BVQhqYS+lT7XKkNEq8uoAAEEBRGyeg64laisNuFLYHf4yfZc1h5PE6LoXFefSam4zTkLsltCQFoWW9JuARbY2sflggGc8zTKzILeYmYLLjpUHy2laW0huwQEm1wXE6iTvpWUgiwIQ7GZmGIxfW0nxojqbU8SBy0k3JCrXtffGmn5kzTmeqIgUmNIXJWx4lUiocyPHDd7JWDoJXqPQAdicfNH2YbGJRR9Z1XJ8onRc3N+YqpneFGezZS4FBYXqRUY8RC5rai3pUlJcC0N6iSNVj5bD1OLDNXDLhZmOK2qu1eTKlsPyJPNhTAhTz7wst5SGxpUehsAE9QQbkYQGXKJmrOKKmyuoRqHMiu+GbaMVx8ukAHm3WW7oJ1JFk9Um5uLY2o4ZyqDMiM1fiNPoeaXnlOxXakkfc00FRu0lOxQbEJ0leoEXTqBwRfZdyY2XBCPT/AFDKjkciW0f7K+cqjTubRc3UPxcMP06nxzqbcfhld0OF9KyG3CEiw0WTqI2GwAs9UXPHCyHLi1akVTKEJuK3Ip6qXLZXCU8worSt2Q2Qb6ghIRdBN+6iMOc/Z6z7UGXqkzn5inVdspMKBCjFVNVpB1B4qHMUV3+JIGm/RWCJzMPFigtnL0+bk2TUJWxpkupvz1IjWNy5HTFKyLjZWyem218PJdq6zksjjuOhH8/aa/Dvx5ZzZEdezM0uWnNs6q85TbjsmLJGovJaW0pSljcktLKPNuEhN7kXwSwahOVmBFZqtWnZhmIZMU/eim1hbJUVLbVpQnUlRUr4r2BIFhhocT+As/NdTp2YpuecmZazStpSHfCUWREjTkpuUtulb/4hSkjzctKhYdhbCmzHQcxcPcxRaLmqnswnpqC5T6hCeL0KekAFXKWQCFAEEoUAbeuKy2C8ZTr6ek74b18kQu4ZZ9kZQrEGDIiPMRuY6zFccWHWZbAJs0o9lBsDyqG4SSCbYCeINIhZI4n1qkRYqn6YyUS6ZFSdDfh5I5pus7JQlYUgHfyosAb7+nJNQmx5lKa0uTmlM1SnBR0gltQDrYPa4um//bemLXMy5vEP7lq1OpM779o8NUCdS34y2npkUK1IUyo2Q442dXlSolSVG2BCsI+7oD1+fabtzbUV7jpNAhyM0MxzWM40liM0pK2qa5Ee8Cyu+11JV5iOutSFWPQDE+u5Dr9LpLldqkZFUywtVk1ihShOpjItuXi2A43vckuoCb98VuU6iKo5pouZfCy2zZcedGTJ5BBsUONKs8ix2NlXHZJ6YYFF4hcQspVYsqfy5Tquy0l2wpb+l5hd9DrbiJY5rSrEXPdKkqSCkgALXIcIBj06Sehx1lDSKZDTDYW0ESGlIBbdSAUqSemm21vS2KQut1usKaikJiRXRzCn4VuD4UD5Hc272Hrj1mibVqfIqlZY+5qYiWhSV0yjwXI8ZUlflS62hTq+WoqUklKbJNr2B3xBahIRHTTGXCxEYaCpbt7eSxJF+xVuSfQH1FigZ5h6+uZcmpNsxKhPbUsssR1obeCfKpRP5fUXCRf5+mGHEdYncIMwx7pQ7Q43jYyu6VMI1pN/Q8rT8icLF5NVr1JWik0xv7uWyW23JLpZLqSLAtJ0mwGxBVpBtYbWOCPh/VU15x3L0xw0wVZK6TUkPiy463GiEqA7g3GnexCgb4U1Fe9dw7cx2u0A4hZTpH/ShBplSorzMPNdPaVAkU6eS34hoEqDS7bpcQb6TY7HoQcWUl2kZtqMaBmGmzaHWYXLS44hwB0JB8us6Slxu4uD5hcbWwKvUqTLTHrlOW0jMcQqiTWUnQiaplam3Ek/lVrQooX26Hbpe5lzg3nPJlAzYBZyjzTDqTi06Fpjugt+cdtLwa1DtoUfXCRBDAL0/SCbFqlhwwhtH4N0xNNm0tciqPQ5LRSiQZoBZJ66QkJBNzquQoH/ABsKfwhy0YfLn0mK4+hAZRIZUtLhQkWSSb7K6XI62wMxs+1KnQ22lcnksotqeSdkgdzf0xDTxYj1ypKi07MURT6xtEjy21LG3QJBucAZNSTjMVDmFjvB9tp1p6FX6mHEmyhMLbyFN/u6dIA9b/P1wIy8sVOn1dxNagIjUx95bQlRVANvKCQlpwpF+VdJV1J89um2CSiZtnUtKUurXJbBvZS7qPtc4YFOrdJzLT1tOaQ28gtvRnx2IsUn2PrgJuupPn5EItjCJGjy5FCk1OBNseSlclN06bmwKwP7WpK/mtQ7Yl0+C8xERUiVLXAkpGobBS1qAkL9916fYMjBrmDgRDeVFeyk4zR3WyNUWSXHYzoBJBHmugi53Fx6i++A2Zwfz6VKQjL9MW0FEhxyap5ok7kp1Og7knYoHXDi6qpxnOI0rqec4zLZNcYoslTDj7QRCWltltB1LciPFS0o0jclp4OJAG4Q6OwGJGUs3jJVRpbtQa8PG5aob0addL0yO4pKNHJ+JKeWPiWALnYG4wJ1agZnydAfkVOjz6JDDKgX6Y2xykub6StTKlrQncbkgXO5xop/3ZPpWYE09+LISqA1KUGHQvS8jVfVuTcKQgm+NYV14OQYYOoOesYVLqUzJyKnl/nUwNUSYuIEyqS07zGLcxpSlkgm7JG/Umw3JxYMt0NYkSKhSTkiZyxI+9aAdUbQVobTzopJbWnU4kEt3Jud02NhCuE1Ku0+cyopcn0aC66mybqdQstFVyNiChtW1vgxLjZnefiqjvIlhUpptTJZhi6Sp5p1CwUPLNypkWGkb72wM1kjI6zTAE4PIhozKkU6czT6oI5kPteIhzoS9cSoMj/Ssquem10HdPqQQcWrdRkR3ApDy0qT0BJP8sAULMIq0GbSHNKdbhfiFpp5CotSHwuISttIRruUuNg2VfaxUb76dUzVIbMxKVMqdTdTZO6FXIUk+4UFD6Y6tW/hpL1FfgkMvQw1rbFPqCTWxAYFdjNctqU46Wx8ipN/L5jsQeuKqTSHJzC5bVQceqiBqQGpKks3BuEaLkaVWsSQTvfba1WmQ6lhxoOK5a91JJ2P/u2ITs9mG+22XVCQ5cNstArdc9koTdSvoMdFG0dYnvz2hDCrBkupZlRVxX7atBWlaVDobKBsbehsdx2xCytWYkOnrkJLCszSHFmcw4j+sNthatCNA30JTaxHlNyq51XPql0DMVeWBFp66XGPxTKmktlPpZm4Wr+9oHvg0pOVoeVlPzHZRfmOtJadlSNCPICTpSAAAm5Jsb+5OF7rKq/KDk+ghAGPXiBVUq8ypps84lTQOoJSmwB/9nA85X4rPwqceJcLKEstqcLjg6oRpB1KHoLnBVRMtUviOxVK0qpyoVOMlxmGilyiyhKEK0l5Sh8RWfMPyhKk7Xuoz15xoGUqRHgUsKkxYzZJWXSQlO5KlKNyTe5N/f1x4agDyVLkz3hf/YxdrkMyM0JdzHHdp2XMsoYq9TRIKPxHFuBENpQSo2893Sk7/houN8CWWK1LzQnPteqTT33pXMn1uctx3ohClR0tsoHXS2gJRc9wpNyUHEjPtfjvcL6tEmtF6XXRDzRVkJuFhl6ey3FYHoUxmgCPUg98WULLVRiZipMiqo5VQzRAqVGejtnS1DaXF5jLCR2CRHI+ZPW18MjkFm69pcrAp2J6zTw44ZR6nEiZgzSsLZeSjwcKUu3MAACVuauuwGlHS3W+wBnxFr0XLsOhvJfSl9FZg8pCd/Lz0Jc6dAG1K39xinys1EzNlHLcyZFblvpprCFKdAUUqDaQtO/SygRhY53lRMwzMzaNEWk0qC5qUwNN3POhkJI7qeStz3RGI744qm63LHpE03PaPhN0SnVKTnuvZXgzHU1JFSmt+JSB/wDC6e64mS6tv/tHC+lAJ76ezZBcysuQkZWXl5hhEem+GMVDKRshJFgR3JvvfqTv3wkF5tX/AEuh1ynqeYczbSGnHAwoJUJTH7RF/ZLpFv4D7YlTWcxVsBEqW8tlRuWpDylA/wB24B+oww9TvtycYmtSSXwOgk7hvmw5QmzYdUJShOtp0K2AdbJ3+tlD9MT8i5xp2XMoqkyC9NqlQkuynWGeoUTpF1GwF9N+t/N0OAOswE5bOqa/GjMLHlLiwgbWB62xrQ7Tm6CzKS8mPT1ENJqAu7z19OXHQD+K4bHoCkfxWthhqVYZPecKl+RIObILs+fUgwz4Ga6V1qkriqsuO6lQMllCiN+YCFWI0lTi7iwtjyK9IrrkdLs0UbMciIBTq5EQEtTmym4StJvuL3KDdST5kki96aszXYLTVXiUaoU96muplpMmG4uS6hN0ul55QsLtFfkT5QbbnoPtRksNUupZeU047GS8JsZ9oeZmO4oLDiT6pdK0i24SL72sXAmQIcNtTnnHWbKtMezDTXsvsxVUVqltFyZBLmtyS6dStOu91ocsVF3qrVbbzAWmU6o3B+9YLQSIrTQqERCRYBlxJuAPQLSs+wWMUVJmSK+mAxOJiZiYbUqnz1gaJbY+JCwOvbWjqDZSbdMQXZUiGae5FbTFklT1Jlx3vNyUL84SbEX8qRpV0OoHobY8yZBWZcd+0I6RAVVYdciA8t9LzK2FfuuBhspPyvsfYn1x7jOeMieDShKl1UBplKwCGnCLLUR6ISFLPry1YiFNZYrtXFNmRYrIcbCg/FU8oq5SdwQ4mwttbfEFuqvUSJVanOcamutKcix/DsltK3FEF4oSVKsSShoG/wASnPUjGQpnVwSQZErknxGY5P3bHS7TqTGETwbyAUutqCNaAroClHJ/2iDsb4k0CPC0NRor7sJLoJiSWTbVbqy4hV06k79gSEm5JSona3TJtFoDDk2ZGleFUqTIZTGKCvmG7916zcAKURtbyp9ManmAyy68p0hpMjkSlt9WnQQWZA9yC3q9TufzXL2wJhvOMz1VKo7l6fFbnoXPdZUqQgU6Opai3y1pJ0b6SDe+9txbfbBRw+4fRsw8Pp1WzLOl08xo4dpYZkhmK/CUhDgVzUE6lODUhYURoCegI1YGaxWwpioy5b7dOlxqWqMSoGwkqUdBQACTqIQoAXO4G9sXPDnJCcumD/TnKteh0BKm3KZlmYpYhTVhN+dLUjWdSl9GilpJNrlRNiO1T4J2nB/P6Qaq7kLiHNCyzR8zV5fEBuE9QOGVNiRkxKWoBLdblRipyOW02BMZlbmoqvZwpSB64Ac5VUVVyXJlStCS+Z1Tkubc164IQo+iLIBPfQlP7wwXZ94hVHNUgTKxaMhs6ItPZI5baUnyCw8u1rgDZN+5F8DfAuTl+tVPMud8xuPT6LlCXFRT6XHb1tvSF3JfdQASsJWoafygpJN8KKWVDc/RRwOp/wBkxw7al2AyPkzhih+NUsw5+yzUI1GSk1ODV5sox+a+FJSwjw6VBenSoFOrqUk28+BnOmZUzI61PyFOOPvazpBUt1ZOyEDqtSiQABe9xhycTOK6OIbcl1l5UajM3UUu2GopFypfsL3tfYDFJw1byXw2yxSOL+f2tVXlOKVlWkKQVchsGyZHLG63XNJUm9kpRpPfVheiyzUnxr1PHRR+n8yeVFr4B49ZRJ+z7nVmhQM0ZvyfMk0Zt0c/KFO1PVOShTawhbqWyAhCV6Lt3KrXva2GJnLhlxGquX4WZsw56i5dmuNhxVFkU1K4lMbXblx9eoKKgNKVH96/phc57+2NUq44sysv3hP/ALNqqVNqPrT2HL0LB/U/PC5PHKlypIeOREsrR/pqPUkBwe4LYbP88U00uotANqAY+v6/mYcrp14U5nUHDjghEoVRiZsrtUGYqq0xpiaYqmGGVEeZaG1EnXuQFHoCcGsKu+DzEjMbzraoFFZkBKr7Py3Gi22yg91jUVG26UpvtcX5Pp/2hqNUXEx3s1Zko19hCrD5daUR0SpboWq3Y6XUn0IODipcXKpXFxvvinMJprbaURVUHzRmW1b+RnZQF9yQXCbkqJO+OnT2I25vpE7UFo8JeFPUy8oMuoPyWoSWHJM+bILTbLR1uOq6hKEj2BUbmwFySACcENVzKjKjwi011M2ukmMqdEu4I5WdBYh23K1EhCnhuskJRpSbqradVGafCaj5avUq5WWQ09NiHW5y1DV4Ri3wJCd3VGxKkqBIQjFfGiCNOEClPty6y6lYfqTS9LMZoJ/ESyvskJ165G1wSEWTu4WtNvAiGotFhyeg6D9zJj1YpWVY5aepsKu1s7PIlqUuJDPduza0l13bzHVpQbp8ygSKlWasuzF82VkiA5J3KG486U3GcP8AG0XFKUPUJcTfFTUMyQMtDkUulU2rkWDk6rQ0yAv2aaXdLaLWG4Kza5KbhCfsHi3lRoKVV+HNKmyUC7f3VPk09oqHTmtArStN+oTo2wfAg1RyNxrJz8f2li+0rMLC805sqKoNAa/q7PhmkoXI0DaLBa+FKU3AKvgbvvqUdJXufeJs3MkNNHgxm6LlllzmR6NDUeXq/wBa+s+Z909Stff4QkWGImes/wBVzzVTPqSmrttcqNDjpDbEZoX0tNIGyEC/T3JNyTejo0CXmCVKZp7CZS4yA9LeedQxHhtk2C33nCG2k3NgVEXOwBONAHtKFVFda+Jf27dh/uVbr89Mpp1VuQlIcjPtr0qtYBaDvf1O2xF7jbGxyZJlvt+dlqKR5mgg61+tz29rYkVrKNQiyDTKoqMecwJ1Pn0+ciXGeRqKA4y8jY6FBSVDqCCCMUkie4uhLnpVy3ynSsAA6FpVoWB7gg2+mGCDgRqtq7POORLF2Wgr8NDaDjqQNYSfIyD01H16WT1PsNwI5kqX9Gau0+lSqjIm3QIQsF3A8hRYXCexuT1viZXMyt0DTSKQwJNUULlJOpLVzu46fU9bdTf9YNIixKIuVUZ7i5UxQK3Zzouoi29v3R7DGguzkiYu1GOB1nymQ5FKqRqU8ohIdSQI4dLgSVEXSCeqtr+XqVW7YK6O8Hc0QnFtuNpix3HwHE6FXWQhOx3GwXscRKHHSlpVbqQCJSkFbSHDtEatew9FW3Uev6WM7J+VavxPzgzlmiJW3U62Qt6QU3FPhI2W6v0sCbDbzrt6Yw2Gzu7RNCxbJjm+zTw9g59zFUuJWaY6XsuUR8x6LGfRduVLHxP2Oywi2lJ6XufynHTFVZm1KQZdVdRTGjYpTKJCgg9ClsArVf1tY+uJ7WT4GRMr5bpOXnU0uhU6K5G57adS2S0oJNu/NWVjURYk3NwAo4pmK7Ejy3lQC1R46CC5VZwMqWpRvcJ2tqPXygEDqrviI7eK24dB0+UBdqnGVr+snhbdGaYnrZW3T4aOZETKQEKmSFbl0pufKmwPfZCE3uTgfzDKkU6E1T7rertbKHH2+riWlEFtr+2tVln+56m/yoZnozYVMTDqVektKBXMqDwSypV/zISFGx/dLmKbLFQk1yXmysJeL1fbgOyYqb7kqKUvOJHqhorIA6WBHw4KlcmgnG4ymz1VUAxMuwVpfjU4lK3GhcSZSj+I4P3rEJQk/uoB7m9tWswSeGzMfK9FleCqCWdVYmRwA64+qyuSHLagltOlJAI82q+KPhc0kZokT1tB56lwJVRjskbKeaaKkbd9J83vowM0iHNzRmaNCYXzZ9RkpaDjp+Jbi9N1H5m5+uKKqOghtq7tre6vJ+cYL+ZMup4bKp7LN67JWlUh3lKKysOqUVqcKrEFBSAkJ6gkknAM+vwaAXbINgpLR2WpPqE9SMFrwyXkuW5HeanZvqcZxSFi4iQgtJsU28zixcHe6b+mAGTMDkmRMePncUp1xQ7X3Nh2A9McC5MPpcclAcHnJiXzNV/vWv5gkIBKPvDktFQsU8poNK/3kr/XHvJfD3NHEjX/AEXy9OrLSSUmY0lLcZJBsQXnFJQSDsQFEj0xTMxfvPKi3XQoeOC5aik2P4qys7/JeLrLXFLPGTnIpo+cKww1GAS3ElS1yYukdEFpwlIT7J0+2KdgtWvFGN3xhm97mFb32X+K7CAVZchJA+IirMEp+dj/AIXwB514Q5yo9RbqD1ETJcaR4eYinSUSFrb/ACq0AhaiL28qTth1J47Zc4iQ47WY6b92Zi+FSGILklDqwLlbLiEKULgE6TZSelyN8DdfzW6XyuNUn5mggBmoczUpFtkpccAUPbUVDt5RuIVWr15bbcoB9MfoYNmC8iInLQQKhVUhQcacU2q3bZOkg373FiPbHtwO5VUS02t6jE3LaAVKik+g7o9h0+WDDNsiHV0GvxEaJrBKZgtpU61tq1jutGyr9wCLkacUbkhwOAhsGOXBHLl9w6pClgW7gJQSf7ScXa33rkjEKtgYczVDiJkumqUeaYj4Vd5tQugqtazjZIsd7f8APBFSsz07MFNXDraVRQBynXgT4Z8DcG5Hl3FwSBa2yjgRUGKkIqpUdEaSFDnLO1t7Cx7gm1v/AExdzn4tNLIkAtxX21MEBN0jrsQN7Eav0xPdQ3B6xDHaS4SY3McoDs4PLR54Uth+7hb30qCknZwbgjuPY4p48/Nk2dUKImqVWYtpDxfjNSlJ1tNo1LJGoFQ0G5AubX9MaaHTEZhTEYHOnyYzKyqI2xd1NyBcHYm1xa1ze1sF/B+ntx2cr5rpAcFSplQdiVplSyS625qAe3v8KHdKh6Jv2OOOVpBY8n4+sOgAMv8AgbwljZqq9OkVoKMGRHbqcAtXCVhqWG3GV2NjdKDuRsHAbYOPtYZtRS6JDyLR6S5SaU8/qlFymraYkrSQs8p4rSlZBANtCvXVsMW1FrVE4f0I0qmV6hU6bF5i41Lr1QTHIaWpS9BUkgtnzAAkEgAX3ucc11uWnMGc5ryYbcBerS+21OVOSk9SoPKKipJSUn4iN9j2EugPrNT49nur0H7xpeZ8odANRkMh95MeI8r8ZxRsOUN1D+8QB8sb85Zj5rk2o6QltCQ1GZtslIAS2kD9P1OJkx5KI7TSBpSsA29E9sBVcmfeVSEdBvHiKuSOi3T/APmj+Zx9AuXOTDEAcz1k2i09dVp8eruqSxIcUw7ISqymnHEKS2odvK4pBsdiNV+uLCdlyVTKM9NmrRF5M3wCGlIJMhxOoOKQb2DYsbK3uTbbGUClxpMCc5LglMdt3z1GAv8ArURRAsVpAuptQFxsoApPTfSR5xprtfW5GagLrdQWkrSlCNLNMaKgtS1E2SHHLXuT8JuLW36z+cLFi2GxF0++qmy2Kg2m/LIQ8OymlGyr/K9/1wZMZnqNWZiUefKVIj0VjwlPSq34cYrU4lI9fM4rf2wGSnR4B5VgokFsJuFBRJ022Njc+h3xIYccodXih5fNcaIhPLG1za7Z+oNvrg7DIhiASCR0jZ4LZOYqkat1WvzXaPlunyy05Laa5jr7ywVBllNwCspBUSSAlO57AsF7MvDmNU4Ih5Mq0jWrw5mza6ErCLKULpbZCeqbW3tfqcUrtVqPFfLmWsr5ZpDFDoOV2FzKjPmSENMrku2Dkh51RCUg6dKUm5O4A2xPiZBo1QkMQKbnyiVKsuq0MwuTJYZfcvYIakuNhtaj0FyATaxNxiXcMnMnrYrE+OxB9B2+caPFh2PmbhPRn8vwVsN5WcE1mGlwvuhtSlCUVKsNV0rKug2SNsU+RJSJ7M2CohxhQBHcaVpIP/CDii4Q1F/Lef8AwUwOMgqXElRZF08tQ2UFJPQjzYvcuZfXkviFm7Lqla41KdZZjrve7S0c5tPvoSsI+SRj5+/IQqeo5l3RKlLeGvQ8icqZhgryrV6xAT0pE5SQjr+ArzAfRK/9zBDQJVRakpFN1vj9pymxcrSBc2+mM4sMpTxkzU38SHUMLWL9yki36YG8sVKRRJgYQ8puTDUHGXAdyi+x+h2OPo8eLSCRzgTB8rkCM2oUSLnmIxNjyFU+rtJ0tydG5H+rcT3Tf6g9PTEWDmfMWVJ8en1fS086LR3HCVx5Bt8KHPiSr+E39sWESpMVRk1aDpacJAlxB/o1n8w/hP8AjghcgQc5UN+mzk647ybXSbLaWN0rSexBAOJjHZ5bBkfpHUxYOOsl0uvt19KZUALjVOOB4mGDZwW6OII+ICw8w+u4wTccqG/xl4JJrYjPIzVlJzxiksjQ7IjWs8Aeo1IGrb8zfvhKUR6VHfkQpj5jV6lO8kymviv1Q6B3StJSSO+4+Tu4W8Q1qaaqDrSA6kmNNYbN23U7XKT3SbAgHodjuDhO6s0Ot1f/AF/v5zy4YFGiGRJeqgZgx54faktoVEqK0alradOhKnCm2paUmQnt0GL+kN89+FyY7MapMxxTpMZ1ClpS+28h1taCeqf2ixv0t0ONPFbhgOE1acqjMVdR4aVJ/nRZsdRP3WpZVqYctulIUolJ7EgdTbFXBjvVCN4eOtqvxWwQ6mRNDDjqCdXMCkC9wA2Adh5Tv1xUba6h0PBkSxDW2GhVmKsMUGAuJMjRacXSUSBm2C8hmf5iSW5jKyhs+gA2PphS1TMlQzFJ+70TayzRmbPMwqhVEz0JWlZF23CgEI2G+xsepBwb1/Ns1aWKdS8wVpUJz8KVT1yok6OhsixBc1LWnqPKsEq3FxgWgwIsOnuTA2dDaFR4zQ1K0oSdPQbkqKASd9gn3wakLUmSOTMAgTTw3inMNYflT22XKWhhymrOsOBl99vShzbqhR8gV2Ku3ZjcUZTUTJGXKYlMkUemyGIwgqprimZSkXRpKyQlRNlqFkr8yr3GIGVojVGyzRAXCp5LAS0/GTfxsZQLyUH0WhYCQOwPoo2HaQo5prwqcqlrirejt/dapcpUhx1wPEBxZJslQ0o+FIARewxlyLbN/QL+s9nJzDYcLazxFpjzYiR6XUoTrcal0hl4Jj09vW2t+U+sWSrUgqQAAdlWG+495wy9lHhHQiabSZGdcyz3uTCrFajLNJp6tKiFNjSlt9zyKI8qk+4AAJbBzhIy3HlqhQKfWHJSVpeck1tunLfdBKCbFJVpCUBI8yQALXPU85O1UVyuOVRyKY6X3EhqPFU++xEUpB0o1uKX51gE3uNVtgAcY0/jWkljhR0EMuTyZrlRZQgaHn2mlPKCHpDzwSnUtVlrKjb1UbYJo9epFSXVi+823NcYaptHjym9Ky0s2LzYWN93FEEdmxi2yfltqvUlVSTQKvWERHVPKfbiaYzQbvcqeWpLY73BJ6dMNXLdNpnEnK0yLMhFvxsIhlEtsBbRIuCfQghKtvQY5qtatHLKces2WJG0Rf06FKodREqjveHQstNuQxZDC0gKSpSgAbqsoEHr5BvvjZScvUqnsJpwcLz4Q0hxK1rIUptCbdTsnbUE3sDe3SwjNPTaBLeolajlFThtth66r8wFPlcSfzBW+9hvcEYmxJjEx95DMpSHCE69BHM26df/AHvhB3cjrx6wcsp8RuYwqLIAcZkfhltSj+J3t79Nx8/XAjX8pM0ikJmUaGDPgyk1BsD4nClV1Ng9klOpIA2HbF1Woi+U9JElyelo8xMB9pspIHUJISFa+pSb9bDvfA1R6mhiryKfE10wBwNopr6NSdRSFhSVJJCApIPlJtqB98H04YDcjT2cQbfZhp50ltt2dQpzgmxnWG1KU2vUFFCgncEKHy6jtiKtLlSqNJalMFsPTXqkthzqEISEt3+d03Hri2moo4W5Nptc+53pCtbzSW+cyVkJOpxv8p8wGoEA3HXFVRUVAZ2eFTeaecTAJZWwnS2psuiyki562B39sWgwKkiMlwwwIfjMD0+GhCOQ6Q6haXNykuJcCwDa9gQLX9TiLCmJkZgq6XTpkPLbfFzsocpCDpv1SCm3tfGpqe1TmHiVNttOKFyRYXICQPmdv5YgzJkCt6oUmMxP5B3bS4FLb+gN0/yxPVMgjEL+HG0EdYZZVoLGaK9ERU2CvKzUgCoOtKBde0m5aQk22vpuSRcBSe+Ohl0CKhhyr0iQ3VIDKbOPsFSHI6f+2ZVu2Nvi3T6KxztQK/CiQmosBpFPYjgaWkBNiCd9u+57epwaZSzrKi1Zt+LKTFkoN2nmV2Xvtax2NxsQbg9wRgdijG0TgotTz1n6Rs01uLLkB2Q+7EbCSC9FB5oJ2ugp3Ct+va18Sl0zLEB9TaRNYp5YLD5lPEuzCN9brp897BdyCCQo9LWwPM5tptQrFOp7lMRTHpQcL0+NKSxFaOhRCiwpJFyU2IQtA81wB0wr+J3EjwLlSU86HaLSEjmgWJkyiAW2Ukj8txe3dQ7JN0hTYz4Uxmsi1vEsBGO3aHHETjpGyZl9NIgasvUBpHhYTEJSjOlpRZIS0AboTsRe+opNyUHqgqpxSztUkrgQkTsmUJ66lNUiO4qQ4DckuvhBJJ76be5PXATHXWM01Vus1eO3PqNQXy47DzQeSlNioNoSVpCEADdR9/mp+cOsi5TpcdP3lXqrErK0JU81l9LLcYKIHkQlbZCxe26rquNsUGWjRLlhlvvMW6oucLwInKVkWBmdAVCqNOq85BKn0SXFKlG46XWpQJ+YA9xg8o/DKFSBEZrCanT6O80mfFq6UO01MaSgp0pWy+THeUAR+zWbpUd9sdA5VyHSYOdRmrJbIm1iPGMcv1udHbfYCwCogHQClQuNQBtdSbjDPjzamouVap0+dT1NpHia1l+albYsLJLpQVI26DX8sJ2a9nA8McfnFPEVuN4z8Zzpwpyll3iBU4z9RzlVUpQt0U6XTYLVOTJKRpcDfO5ynNPVQsE9PQYv67wozBBffi0riVT56mFh0IkUweMbAOofsn0A2FtyE39O2H41w4ylnScirVyNRswtBC9MxcARqglRKSm77JSVEWO+xGrphLcTct5JVmuo5Zy1lrLuX002I1Ll1t2E4/UnHXispW27zkLQEhIOtSlXVYWsMSza9lpZXIGOhAIEYC2Km48QEzxlZ379gTs65ZejLKQioV6NEdEGTHOrkynHNN47iVoCCHCCUOpOogA4r6MalUI+XlM1hiuUeA7JbalqN322FhQU2Vg/iILqEKF9wRe51G/S3CXiQzCypBiv1JOYGnGAyuY40gIkJsE6ikEpPlJB339sQs08LeBucq24ZeTYVPkuNhQqlHfVBWXNJSE6GVJ09E7lJB98IV+2NjmrU1kY7gZH2PImTV4nmDcznyrJTPrDLQsWIdnCP3nSPL/spN/moemK+mxRVpaUr3jSZjsh1pQuHEMhLaUn+HWEq9/rhkZg4A1aBJnyuF1Y/p9GhLDNSy5Vam0ajT3bAgIfskOAptYLAPoThd0qsMwczClVeJLyrXkMhoUatsKiyN1XUUhQAWDpRunY2xfqsS1M0nP6/UdZ4qUXGIwmyOWAfTAJm+ox6DmuFVUFZWwz/XeUlR5KErSttxZHwj4xc/velzgySl4xlhsgu2OnV0v74EY1cjZUYcTW4j9PU4pS3JjqOa3IWdlHUgqt16KttjlKgscwKHBzC2mSZWYs4RHaLW4MGk5pXz48yREVKQJ6UAOMWDiNJcCCtO5urWMQ0v1SNmfMFNaqKW6U+tLFXl5ddQrxagmziI5c2bKk6QvVq0qChdWpVhWhNszKBOo8Qo+762zJfglv4WpLS1qjuIt01Wb6eivU4sqTNnTKPTpNKEKPDcitrERxC07FN7BabgDcfkPTBRSoJB7RhjjzL3ji4b5T4OVRcSGcq+MqyQEojZllreWQNgG2iQypIAH7MEfLDOzGMphuFlx3KeWpDMhRS7TfANIbZZCSVOrKU627K0JSoEeZYHfHKEqXJnsCHUIb8BLqgHJcdaH20J7+bZSbjbWUDTe/bDJytlJmssRIFKgET20qdZcpwS3ISUpJUpKwLk6Qbg3Cr7g3wC3T87i0z4mF6RgVPI0vh8iRWMqtyszZdbTrlUGQedVICe6oyyf6w0P3VXXboonYx8u8TKfmmmNVBcUM0dy4+8PEtLbaI68yyrt26G48p6264+ZI4g1agUJNQzF5YsZ/lM1OGC4426VEIS40i6klRAGwKFlQA0k6cR840MV6NWeIWXqM9l6sMqS/VKK0UkVmIlP48gsAfhPpTdYAVqUlCtQudp1mn3e995nGRkQyp7Dk2KxMpNZL8F4a0KBS824n+FQtfvvcjF7BzJ90LXAXCeaeVu1JWS4y78yPgV18qrX7E4S9Cqr9KeRUqJMabiTAHXWdGtiSCAQ5YEWVYJ8wO4632sXROIboy7ILjKH68w4hhDASUNPlxQShwH9zclW506FD0Jk3aZunUQYcRkuZrmMJSh+CzocG4WhQC097C9sfalIyHmtEWlVqnxCejDchjQEA7BKFpHlve3UX/lgTo2cK/SWEMVKju5mdec1R5VL5IjtJDaAtBLiwU2c12vquLb9sV9ZhU3N8WS7EylGE1iaU1elSGWUPvam7pcQ8DbVdSFJWFjooEhQFlBVg4PHyMIGxyIY5j4CUOrpQ7Rp8ygSW2+UhUd0yGgi97aHCbb7+UpGBePwXzdT5TTcefRJDTCG22pbxeQdKL6dTQSd997OWxc5Zqy34pbEaZAlxQlpxmSsKdAt5VFaVELuBfUFHe/cEYtpmeJdEYbccelPoLgSQ1HL2hPdSrC+kWN98cF2qp8obPzhPEB6xT1mk17KbVWYrlFnMBxJfNThMqkQ0uBa1hfMSLoAUUfGARbfHnKlVi1qLKNNfjySZch1QaeCwgLdWu+17A6rjHQ6czQnALu6za5sDf54oMw5PyhnpbC5UdDc9j9jLjOGPJb9gtNiR7G49sNVe0yP+VMTNg8RdoMA6bQIUhK3avVX2xf8ADjQRywB/EqxUSf4Sn64Jsv1nL9B57UCAinsnq7Ylx097mxUr+8TgbqnDPOVGfcFInwMwU/qhNTUqPKSP3CpKShX9ogYHXcwppk5qBXIb9AqLhshmamyHT/2bo8i/ob+2Gspqej5iuCnaNKo57jpbtCQXnCPjWClKT8u+FzT6XN4g1qtRHprUSiQFtxpwIUXpSnGwtSQsKHKToWkXsSST2GKzMtXXHepdMhyTHqVSmMx0cprnvNtlYDjiWvzaQdyQQL3PTHiot0/LLtXg096ZU5ksttTKnNdTdwNm4SlDaUI2O2rTft8tLQtQ2J1M9uJ5aW2bM3tTIIokCMGabFKGkLClXWlCdIFvTYevQYXObwuVQvu5pSmnarIYpbZAsfx3Etrt7hClH6YueenTuOguSR0wP5epFNlUmFm+vMzodRerM16h5hhI+8WY6I7i43KdhJIXyxpKytF7lQVrTa2Hq61rUw2nQ32D4SmzZINbr2d5DNkiqNzolNTfygQhGVGA9tMVZA9zi34icYmsy0amTKRTn+dAlMVdqU+Q2oqb86kIRuTqQpaLm3Xa+Bum8PMwPTIk7KlTofEJNOWl2I5R6q1zUDWVOBbLikqQXApSSLm1x6YpZGXsxZZ5zErKGZoEZlxQYdfo7ykhq90gqbSpPlFk3Bt5bjrhrw62xz0lOwNkNjpLOu12dTKlMpsSoyY9GdWahBSw6GUOMSFF0KKkjURrU4B5tgBikm2Zo1IpAuHp7grU9JNyEWT4ZHtZAZNvXm+pxQScw0dVOYp9RqrEJUF5LDfidTalwnVgOtnVYgt7keiUpHc42Lz7l+o1qpz3a7TQp90IZR4tsaWkjYAX6aisj2Vhlaz0AmbPIGde8sXHJCMvz0RgTMoEwVmGgblcdzX4hAHffxG39j2x9kxZ9RiJlF2JU216VIVMS86hQURY252kDcHYYit51otNrVPqbNZgONJV4WUgSUKJYcKRe1+iVhtR9kqxVsy6JAnSKGuvQWW230+CqKpySmPGVdVwdWnU3ZTYHchFxY4IAYIZsVW9ODCKkpQzAXLmMU5umABtTVJpxakypJH/AFVtRWrVvcLUALAEAjzFMiMmo1Cosz3lz4stxlSGYjEaOhuI2i34TRdGwAULmwKiknYWAq5ef8qKn6vvWImHBbDMJmLUW2lJTc6lFXMSVLXa5Ve/TuVXgPZ+oEiVBkRZsZgtuFSw/XlvKKShSSCAtWk7pOx7WxtVIyxEMSAMCEdXpNb8OoyZtRRFUkpWZb0VCdJ63LbR/wAcBLTqmqHSHFKQ84hEqhPuIOpOgBRaVcdfK2Lf2/fE6TWabJnLlRXYjjizqLppzst0qPWy7nb2GKxMmc/Ta0ldOnPSnZseW0GKc8gEp0C+ki6QQ0Bc7HUcEUYgupPEsnGEueIjuunwvi2SXEkBcR9y5u2exC1I2/7RQOxtjxWGXaoQ6+z/APHKWUmSywbCY0ArQ4n3FypPoQpG974sX1TahDfjRcsVNwOHXqdDTQ16tWq63Ab3AOIFaXVWakmoOU+FSnW1AlybVW0BSLAKSrSFXBASRvsUg49PICOMcSykSUTZU+oxZClJkllEZLbziAta2klJ8qgCADc3GwSrfbFDmens1SnKQw4RSKOpppareZ5xR3O3VXnKz/E4L/DircmJQt9cfMNDjBxwuBmEtU7QpQAUUhITuen1I/McWEKS/HpQpyZFTejFJSoRqYmNzCTdSip++5JJJv1OOqhHIhGBIwJ7vFytTvEyJRRTCi0lDrn4RF+W6kA7XCt0lNiQbEG4UJuX28yT6Yt2BkevVWmyYzaFylxCww6UpUkrC3LXCk6d/bF/wkpNNZqczOOY2XnqBlhRRCgTlIcEmoFIOuyRoAbSoWteyrntjRmjiZmjifXFxX58lF3Ea4sAAIgtKNtSyfKk6SSAPMbDc3wJmYsVUdOpMxsAGWMvOE2WEUKIjP8AnUshyn60UmnvOJdQ1o1JMh4jZSk72tcenXA/nvjjUa9UkKRPMJuUVKbSYyn5bye69IvoHzBttex2F1xDjPZgbg02ApuPRoyfhV8PlADaNItdIO/Xew+oVkyAH5VTOWqLX861NtQRPqFJprkhAXuEo1p8qE3BASNhY3J3OA1qj5vt5Pb0E7ZqNo2V/WRINCk5plpMpucmmKUHJMidqQ9Nt8KAkgFKPU2SCBYCxJwQw8wQ8jZdzMxMeRT01qsIcQpWxeaZYQ222hA3NlBZ2HS2DmD9nzipXI8h6oSqNkWKh5vmImkyJKIygLuIWkqbU4PMnQoCygN98b4eS6RkbPuWGMnz63WM8PPpQ9Ua4zz2GqdrSJC9ACEJQnUm2hSVFRSm5BIwB9VTcTTvB+A5xjnk9IphmPMW+ZMmZtqlCjxZ9CRQIWYlCDBkVae1GecW4kFJDAJXexBCTYna9r408VOFGfJ+bIi8vcN8wmk02nCGy6qIFc1ywOsJLh2skW36emOz4cWFQqgKg+/NzVmJLb3h3XEoK2UaQp1LDadKGm7JBUpXQW1LIwO5kzHWqu/A0vRW3pCzyaQ1JslCAklciQ8U2KUAXIbulPdSyUpHdNqrMjwkGPrBXPVQpUmcQQ4KsgMGXVoua8pyZGzkusUJC21KuSRzOUSR1sL4sI7ULNSQtt3KOckFNy0Y4hyfnrBXY/3RjtlFTZh0/kRpCi2bNSKghopdmOq2SzHQbqAURYI+JViVWHlC440ZF4fU6jSZOacsUqVmGShJbZijkvQ0W8hW8yUrceVf4QbE2AB+JVYasf8AYYk/xNzAAdZybWco0BkOJl02pZSN7a1LEyAD/EbqCR89GBeQ3WeGb7T8Cotx4clX4bjKy5Df2KvO2TdGwJuLj3wbKjSkPuoy7mCWkMkJcouZkESG0k7Wc6kG4sSkjfrjXSKHByyiTOm/1eWlP4ySrU23cAqS2ALAG4JsNzb5Yd8ZQOefhGBle8s8n8XH6siTCZeXSau8wrmRUukNSUmxJSofGg6RcdfW4uCdU/iRHlZWXAjRRSpbSU/e3Mc1OvOXJRdVh+CPLoA2Juokqtp5zzVQ3ID7NQLaKJznedFhpJMli1yX9I+FJPxJFgPnfBTGlrzZRzOa0tZjpg0SGGzbxCOpT7pVa6fRWCtSpGVntiMwZu0OZ8x2rSGHIqUOoRqTqv5xewNv0xPo+TnKtCeqD0+DS6U24WFVOoLXyFOjq00G0LW84AbqShJ0i2opuL1dEiRItHiZkrkkikyG+bT6LGeDUipk7anVpJLEcEWUdlrIUlOndSbvOiKrJoTVQrtRbpNQkxAiiUdqIAUsH4FIYBSGIwvcKPx3uAsqKiqK8cmZt1TE7Kzgev8AEjyMo02GnnVDNtHXBSTqFFEh+a8OyGmXWGwhR6anDpTubKItgZzVmh+oQWKZFpyaZRGHSuHQ4yytAWduc+4d3XSPieX03CQkWTgbU0zToK486Yr7wcGlUkX5jhJ2Sj12FrDH2oZghUtqbFadUuezF5hFitV7AI1H1uQd8aDE8KJkddznM9qzjFoEdEKW8ouRZcgoaYSVEF5qIdCBtfzNrPb4r98U33/UX0SY1Mpn3ah91SzMmuBxYSpRUSlsd7km17C+I9KpzMpxdSWlbst615L2nUvYC6bAAJ2t0HTBdkfIqs75lXSWqoadUJERaqclxsLYkSEXUWXPzJ1IBsoHYoIsb4Mzogye08HK8LBiFDiUkJjoUVPunU46rzOOq2uVH1uR+oxk6O7KiJS40WmlyGE2Udykuo1Ajtsf54P+GeXxVs9P5VrMUxnqjBl015pzdTLnK8Q0sEdbKjoUk+3zGAWXKMWA07UFcnwz48Ur0W0o3A9brRYDGA+WwOswOTLDM0qQ45T6fGiuzpEyQlpuGym65CyfI2PmrTf2Bx3PwL4Rt8B8hTZ09SJWcak2l6pzALhte3LjoP8Aq0E/3jc+mFr9mvg85k6IjibnCHozFNbKaHSnk7wWVD9ooH/SKSbnuEm2xOz/AGKlEqOSK6qShTtTjhEkrUOqS60kEG/TzKuLd+vbEnU2Fx4CHjuY21g067mGTItSnuyeH8WK04DJFYDf4irJHNaunUf7lz6b4padIamVBLcGC1UUcwQqah9IUHXlKTqfcR0Uo7WCrhOtFwoJxAjTRJyFmMqN1pnRHL27qTISo/W9vrjczmdeX6ZkquxkBw09x5ktr2ClId5pBPul8C/tjyqBINm45HXk/wAxp1/7PNYqdCefl5ncmVNpkuCKWzyLgX0J8wCd9gQkD2woYOayzWst119DIdp73h5y0NJSZDCiblYSBclCnUEnchIve+GtX/tHyszZdmx8s5cnJmLaKXpblltRUkWUolO17XsVaQMKrK1Ph0nKk7M1XHiKYFBmmQXjZudNsQFlP5kNgqJ9dx0JGDgSdUbAp8b6SPkKkIonFecFOJ+6KSZqZ0lR8iIoQtok266goADuVDA3kZtmg16k1+YXA3GlJeixGUanpbrakkJA6JTqsCo79QkKOwJ8wQXqBlymZSjt6sw191qZUU7JUhJNo0dXp15ivdSfQYEczZ/k0+Wqm0FxMOJDaEJE1jZ59A+NQXupCFrK16U2Hn3vgygnpHE325C9+PpCzOHBuZl7IgzVUZTsWc8ttxyDIjFv9oo2SlZN1LSBdSdIsD7Y5z4o5sVAivUqG5pe5BfluJJBbasbIB7KXax/hue4OCHNOc3aHQue+67LUklESKpwnW6q5CQO1zck+gUcJmql9+nVJC1Kmz30LclPDutSf+VglPZIT23w9TWRyZXpR6k2u2TI8CVJoMJMdTypNP06TrF1sC1r7fEj+afcdNrboWSkiyk9QDfbsQe4Pr/nfHolLoSpJCknzJI7jt/LEZcPloT4eyHG/hB+Ejuk+3p6H6gvYE11klS3GlNvMPORZDKw61IaVpW0sbhQPax/lcHFy7xcp1WUBmJltE0J0qn0hSVJdVf4lskgp266L79PTA6zKZlOlgqSHei2XFAKFx+6dyPcbHFlTKzJocVMZyC3VozWzaudofbT+6LgpWB2vY9iThe6sOAcZImGHE0Tp8FMxM+DJamQngG5Ia6FB2Cik2IIvvcXtf0GK2I8mLlWNEWvQ4KwrU4o7FLba0BRPyQMbMw16l1laTGitQqgi5WOTyHVo/MlaRZKtr7p77/PTlbLYqsJuo1lKkUVl1xbLViFTnSo2t/ALbnvci9rnARhV3PxB1qzttEjQJ6JU+QzLS2liUmzevbptoPzHmHob42SE1Gr0+RThE8SKdrdcfQqyw0hKgSQepANyb9ibdcVK/OS3yi+nQVrCReyQRc272vva9hv0BwY5ZbVk6LR8yRFLepykKYqKVAHlKUbKVsPgChYg37774xZivzDr2nSgU5EIsqUGPU8vwMyZbApuYKS2FPwlLs1LKdllJ2CSU7gDym42B3wbZDbpsx6o5mL7VNps9bTilyVJQ0XkpI1EEgd9xfdSeotuFO0z7pzA3PoQUxFqDJD7CHCU838q0DrbcEi+1jtawwyaEuYKaIcOk0GtxAlIFOqj5Qt0AbkFSC2FX1dT9d7Ygalsg89f7ieU5MtczLzU1ld01DKmXeKWV0ouF04qbkMi1wdI5ih63auRte2OZaElkIqEiO2WGHntDTZWV8tClXCSqw1WSQLkXPXDA4gZWj1Pxqafw9qGVq20hpz7v8AvJt2I8jVZS0oUm6gQkgFs6bjocRYnDmoUjJNTrVUiKbVojt0uJHeuqRJeWhKQehshN7pIG6h2Tu9pjXTXgnk/wB9TG0gTmOsrae5EWxlOjyk7hpA/MffsB/ywPqYRGjafNb4fL1JUbdfmev/ACwWZ0ys1k+Hlaouz0vjMdKRUipVgW3b2U2LdQElsjqdziknQJcJbbUuLJglwJXeRFVflFelSwg2KrDVtcdPfFatlKgiEMKKfS009TDJ15dzPCbOpl6/Inxwd9rkE7WOg2uL/wBn7X6jT0QpEepV5brDqjy6XRQhN1A7c5xQUCq1rg2F9gDbExdMqsSnR2phj5hoyEJchVVlVlMnoOpN0W8vU2736CtrESTSKNIeh0SLCihNpE19Tbjzmra6Rc2JJ2ub7/CMKDBfJMUHJ5g9Q4cZDT9WqYJTBtoQNxzDbcDurdKR7nFfIiqqbc5bw5TslanNN78s7aBf2CU/XF5UYS6flilt20hcnWpCupAQspP8knFSyvU4oDrbDinPIjnSM93M9PRwbytRIMkPTqjKeqlYQElPLcQnkstq9bWdX6fiDGikJFTojbS761MraBPULBICvmCL4XNLWU1Cc0NrFDiQO2oG/wDNOGFw+vLhMqO4ceeI+XMVY/phW8BRmYoqCBgecx7SWHc2cb8suElEyq5dpU2a56vLjALcPubaifnj6czu1biDWKuq6YFVffcaJtdAZUlKB9Wikf3PfGS6i1l/PImuKKX2sm06C2Ep3S8uAAN+1uYFfTAJxNm/0T4RKlJuJp1BgpNrLfugfolwfUYg2r4luz1wJvRKVrV/QfvE1V6+jM2d8yVhJ1Jlyyls9i235AR8yCfrjTMg+JDbzRDcps3bWb2PqDbscUFPQIsdKGl35ACFm/wn39O5wRZSjqzFX2oCqs3D8WQ3HcebC2Uu9kLKfMkLOwULkHbSq+30hUVj4CeL55MylZgcgy0pKlQJnw6Fnyr9geigcMOhVarKotTr7KGosCmSIseQ6q5S648uwbSDvcICnCd7AJH5hYKzNQX8uzZlMr0Hw0iMAtxhyygpJF0rQropBHRQ62PQ7YYubY/9D/szZMpEZtJnVKtmfI1k/iFMdRIJ9itCB/ZGELirbAB7xxNhyCCss6tS6RnJDM8LcplaQ2ENzWRrQ4j91afzJ377jsRihp8LMWR6k7UEIZmU502lMRVlYUf9ahFr79FJuTtcX7glGzc/AWltt4xlrP8A1Z8Cyj7A9fpgrOdajBZDs2Khts9FrQpsHb3OFjTanl6iOeIj8nrGvljirHgMOhEVmp0iY3oeiOqDjTgO3Qix9PXtgZq/CLh3OQ5Iy1mGr5RdkOBxUNDSZkVpfW6W1AKTY9ws29bYVszOFLkz/EB5NJJOp56O4EpdPuFXQT72v74IKdUPHtpXCzGWSseVUhhLrX+4UjAxpmp81ZKzhIfg8wpqf2cK1meXGfgcS6BWJ6ClSPEU8RH3ADcJXoKlKFwDYjEWqfZo4t+HIjOZYkpCw42uNIdQpKgoKSRqSBe4B3xpkVWo5aDT1ZQ0/BJAFUp+oIbJPlK0G5SL/mCiOm4w4uH2dIE4ORa9VKmxFkaeVV6Y/Z6MRfdabHmJ9fzfPsOy3VLgqQR8v4gXSpFyUP0nOXECkZoyHTlU/NmXZuX463kkTYyw9COtQC0B1vZBUkq2O91dr4taHSpLMe9IcYLMVotU95x0hppLpClKKhfZCbhNt7eXqcdf5fdNZQmmQsw0rPkCQC05BqDIgzigkg/hu3S8LX2Bucc+cafs+s8P48rMOVoBqeU2XufVstG6/BqTcKfZB/KkHzIN9Nieg8va9T4mKrBtP5GJ7K7QWpPTseDF7Iyy1mDNsKPWqRltFEp0lJlTKNBUw85qjKeCVK1KuknSkjqSodzhg0V7LWQMsBNQgQWXUzX6pTYkttxMZt+6y2FOWIUtKFBAve2jYG1wuMq1aEzHmyqPT0zKYJXMjxI6vDlR5KELWnYef8oFwQSo3vbERGYpFUqLS3ZdQap2pLkGLPmBxYcKVhXQkqASqwCiSPNg9tb2nBJCiBGYwqnGzbxaZVVJk12HHDDb1Por8jmxWXQNSQpoIbSBukb6iNzq7Yh0vP0ejTkx6zIRRavdIchSnEpcSvYjTv5knsoXBvipouf2IFWTBXWENOrNlMF0A3tsNzsbDp1xd0fPGVczyXWJiadVbKLCn3GkuqPUAG4uR7jb0xPtVzlbUyvbHaGEm8RMhSc81J/MVJrIRNbgpjohONBTboSVLCVKCgpNyq1wdsLuNDp8spjuwnqPU2W0LdirbUw8ncbi/wASSofELg/PBBJUcly3JlElvNQTGdfXTazMKQjlk/sHTr7D4DtZSDcdMWeYXqRmUZcqCH5S8xOw1qg0+MwHHZYdCSEufuIBKSVHYbnBEL1hUJyvY9x8DOSmpc0Q4LTUouyFpTdb6zcqJ3N/rfFXUKjTKjGVrIkxVfiXCFLQgfvEjZNvUkYJa/kfPGWaUqpTMsMyYzWkuinVAPOgKUAClvQCrcjp63xVtzvBVRmNPiTKdJCeYYc+Mph0ouQSEqG46i4uOuNIQcupz8jOHIg28/SVRvEoDKmnA0zzWSDqS0tJSjbsCkC2Bp2C7S61S57c92XC0Jp5DtjykG+k3FttQSN/Xrho1fJMCpQ6tXG1TGgEFLMSnIU6p+UdSitaCFC3TpYfESR2AaxRmzHUxr1IcTZ5pFwNQte19xY+u4tilRcrdDOZKnMk1Cky6nHDCoLjbyJDbratYLawlYNyfcX2IxMpGSmc1SoMV7w7Tsh4NpkzVctCFKXYFTg+AXI32A6nYHFDT8y1WhIDD7a6vFGyHmiOelPopJ+I+4PzGLCmZ8o/IkMyXXKfJ1KWhExBbVa2xTfb1wzh190ZHwjTWAp5TzCXNnCDN/DnQ/MiTYUZxWhp6e14mK6fRt8Gyr9tLhxQDNcuBLjx34iHJF0kCI4QvoVXCVgAiySdlHphicJ81NtVJdNqFQ5NGrUN2nzHEquwOc0oNPLHQhtwtuE9RoNsB3EnLcnLkrwVTYXTarS5SW3mz1buoJWb9CAkqUD0I3wRkV+WEzRqrFbw2MnzuLTaJpdkaYMJMdSkIlpW08p0HdICwAq46WJwuc61GRKpdCozq7qQ0qoSj3XIdXYX+S1rP0GGJFeSzEEd8h90goCgmwWfTv0vhc5r/wD7mS8pBS2qMw6SqwsG3Qpf8lb4HQU34UShduSsjMJsqIbk1+fJQshuE0iEyEnyg21KI9xdKfphi5fy5Ta2xIbqrTNSW7pUoJQpBbCSCAhRUVDzb3SRhXSao9l/LgSdSahKnPNoQhGtwkvL3QnudIFvmD2xDTk+rN0uTVZ2XH3WU+ZyQ6y1JW2PVYLhWbDc2CbbmwHTj0733E4gqiiY4yZ0zR6bHj0V6Ol55uouAqM5ZCngq1kE+UBWlISLKBBtvfcn3kHi0xSpCgupNozBSnnkFLRDT6g2spS4EXJAUnSSDcEK9DbHNuW65VaK+23S5Wqy1NmEpazHdWm5U1oWSqO6ADsSQbb+gYsyrqrLVMrcPmGKph5qUptrW8kWGnUnqQhaFA26EDsMStToBg5+mJu2tLkJUcidVMZxm1GMrMFGgQm488NqVTY8gqUpagPxG2wkBKFE306yU3Pa2AzPLzUpxipZt4Tya23CCkCUYSZPLQLqVfkrUooBubFJHU264UTPFWDlLJKtM2Q4zBIYYLOnW6Qq4SlaklJSSCknsEq32wY5RRmDNhi5nqGaS/Vn/wBhARVVswWGinZKUoQsLsD5iRcq9MRQLqCbbcY6dwfy/WLVua12QqgZO4Q8W6euu0iI9luvyEl6FVKG6vSw4gAXQzcNWNtK0FCb73IO4pJdL4UZZJczZxnzHmXMDoSpNMymjkcnYXRyWQ4Em9/jcHywEZ74LZn+6ajX6fB+9KS2tx2uRMvyFrXIcCtSpfJSAFNjUpKgDq0oClDY4V1EmJr8V5qhyG4NPjlrlclocp8kalpcIsoDcJOkggi+/TFWlEvTej5H04+Gesa3BhkLzHLSOKdR4M8SUV+hxM1Ky/V2+Q1/S5+OzJlaWlFtCilVilN0qSrTqG43CsSM4cZ8+cfWnciVOj5UfjzG+aidUG33lQSVkBxh9KklLibagEIPw7i18SspfaLjT8nQKHLyjRZuWUSBFlR5jaH2HEBNrpKkcxViBa6Bb174ucy/ZryJxIylPreSKe7lWrQbKbpFPCprEzzCxDbi06F3UfM2tJSnrfE/xKqbt+pr2P0DdR8MwYckbQfpLPM/DnMmQcvwKmyH85U1EVAlvUuOTIiFtIDjq2iQtaDZRukXABJFsUtLqMaswWpcJ9qXDeTdDzCgpCxfsR7/APLFJlyXnfKmdaBRM41qvZVnRoqS7S9TKjPj6VBL0V9SVIUQTZRIWRY7g4Yle4AmDSnc8cI5dQrqtSn67lSoOJcfmE+Zb0cpACXxcnlgWWLafTGkyoC3MCT0I6H5zJ07sNyjiLF3KFRoNbbqFPW25TmZSp6ICWyl1LikkLShV9NiSpdiPiJF+mIWWU1RxDVMblxKeYrDZ5TsYuueYKVoJDidKk2N0kE2se+D2l5uptQoMOrx5aZFKlX0yQkjlEX1Jd/cUCCDcixGMrGTabX0lbja2JCnA8JcNfKeCwgo1BY3voUpO/YnDCapkOLRFgxxiU8al1PxbIdqzAj+YuOIiaVA9rXUQR/6e+L2krr+T9U+lE1vkOhbJpto8ho+obWu1t+y9vSxNqH+hGY4TKGIOZWXm0CwVVKeXnD/AGlodQFH304sYeXc5RbPNTqPKeT0ab50X9F3c/TT9cHa+ojlhO7geDGhA4g0DiNSpapTDUTMYZImx3GjHE1lYOpD7JALbigSQrora29sbMnZokUyoM06TJPi0DmQZqz/ANdaSdib9XUdFp72120qsF05lPPuYUCVIVl1iVHV/VG3FOmQjaxPiUpsAo7FBbIIO5wVR+GeacyRKcarm+k0BIdRIeYpsIvSWVp7Nvur03PQq5fQ2sR1Se7T1gguMfebQBeBBtuDKoebKvlOltJS6qoo+6WXP2bTMhHONz2bZIf266G0p6kYk5Dqqazl9t5VRZqj4ccSt5rQDp1kthSUkhKuWUXH+PXDUyXwZytl+pvVFyuVGu1OQ2pl+VWpSH1ONqtdFtKUpAAIAAAGpXrgCb4L50y49LnU9GWHkypvNdgRH1NLda1aEBnUlDbQQylsBJvchRv6pDW6e4lQ2OnJ4zMvWTyJOjTXYbzbsdZbcQdSSk2ti8pOZp6a2/ORHadVKZSh5pCCA4pJslZO52BItsN7+mBpTVUixTKl5Zr1PhJS4XJkmCSy0G761LUgq0pGlR1KskgdbbmNU800zLqWlSqi20uSrlsMsqLjr5/dbQi6ln2SDjJrS3gDMCAwhnVUZczRIcVmPLcV2YpnkeMSylbyE7kaSbKSQTcEHY4soecoOXqVRYNYmrWp1tuJ95OgBl10J02Wb3QpWknzWBJsCb4DKZFzVmBBVTMl1rR2eqiWoKPql1Yc/wBzFqjh1mSotcmbUMsUZbu2l2oLlqPsUBDYP+1gNlFaDDnH1jaUXv0WGH9HY0Vy9OlSaVuTyYzg5KvblLCkj+6EnEuCmY0hwTX2pCtf4amWS1YeigVKufcW+WFpDq6KM69T3uI72YPDuKacTlXL/MLa77o8Q6461qBvsTt3ti0j5dnVdQdYm5hebUL2rmZo1OP6Qo6v01A9sLtRj324nTSynzECMxmszUICG5KykbWvfA9mjO9E1KpFfqdMdU4AVU6cppS1A9CGzcm/awxRwuCNEqClOZnrVNDVrpjQFvzXR83pjjwI/stJ+mGflSXlnJ8AU7K1HhwmmkgKLTSWi5/Eqybkk73PfCFjU1cpkn7T2wd2iaomVs1P13MC8vZVnRo011mOzMnEw2ERm2k+VHNAdQnWpZKUoUCenTBPROAuZa9DnGpzouXJqHg3HQhKZzTrYHmXsptV+wvbpcpwzZGc59lH8BoeunYfqcBNe4lKFTbhtpqVVluWu1T2fwx6XcJS2DsdioHGRrNVbxWAJzbWOTzLZj7NmTILsR+sPVKtckha2arKBjPL33U0lKUEC5sLW9Qcc+5zq/8AQB1ijyGG6LLpVUqj9OfcSkRXmpUx91CGXEnQdTTmgouFJJvYWw8Y0Kt1CsMvygxTqSgAuRnrvS3yU9CpKtDVjbpzLgdU32jv5WeeokyJU6izJL5cSp4xEpbDSidKChSlJVZJsSTvubDBdPq7KmPjNuziM12eEcqJzcaJSa0qu+KpMObMceZS28+wlbjSFxo6A4CRcafOrr1QceMvwRS363HplYzDRuRLSY7MOsSUJbjlOgJ0lZBsttSiSP8ASp7WGG/U+HWUITC2KawIqlJ0F2A842tA9AoK6e3T2wETeFCIEiLKoddnxZDepLwn3mIfSobg3Ukg3CTsbeUbbDFyvV1vnkiNjW1nG4QYp+ZMzyajPiP52zDrYc8iXnIzoU2bBFytlRKrpcve35fXEbMFfzBAEhTNbE0tRlP8ubSYrpJB7lLadrBR2H5TjM60lrKklEmXnai0GVJKiTU44QHAQkEpHPSeiEX6jyjpvekp6xXvFIp2aqRmlamtLjdHgPPuBJBHmSw46bbnsOuKaKWwy9Pl/qdGqqIxLGo1yuw0PLXKy86lt8stk5bbUpw6tKbAODcnbb37A4rJ+Y81U9VLSs5ZDkt9cdRboIAQA264CDzNz+GB9TiyiUmouuIenxM1yn2Vktfd+VJjKEXBBuHWXLmxIvcDc4+S8g5hzJNS47Rs2sQmXOYh1cWI05cpKbhtTrRSdKiLqv1+G22DDg4ac8UN7oMjKzLmRad5lJTbqGqME2//ABDimc4kSHZBjHN0BuRe3LiojJWD6WVq3wTLyZlmC6WpuU8y16YyRf75fiPBB7fh+IDY/wBnHmo5py5DkwqNLoDtLdmq5UeE5DZWXVW6JQ0pd/Tpa+NZA7fpNE+sHJk6rlkrdzNVlJtsltMZOr0A0sjrgfdpFRW6rxVZqkmU7DdUVeLW2ELSoaB5CkEJ5ivmQTYdMG0fg5JrNSfqUCnN5QZjtERkqjIQuW8dypxCfgbGw6aiSTtYA3kTgfEnxOZmOpypEtdwtqDJXHjoQb/hgX1K7XUbEkdEjbA21dFXRoq16dDFqnK1PkJbU8x4pRsT4h1bu/8AeUcVzFHpWXURH3I8Fnmt8rRyU8xa0nqgAEqJF7ge3vhso4UZdiyltzazOrNNFtFPdXfzd+Y6gJK09LJPvcq6Yly5WUOF8SbXo9KjUhKglDj0ZgJU5cgJQhKdySSLJT1745+OUnbWCxMG+oX/AKiLlGU8x5vaei0+nN0+AEArl1dDscLUTsG0aNRtYEqIsOm+PdWoGYqBRanUanToUWLT2VPLeTUNaXtI1WQAi/T97Tv+uHCxRuKuYIT0ulcOxDgKBDEnMVSTAdUOy1RykrSnv5tJI7DG6k8Ncu0d1qfmdbHEPMqPMXp7RFKhquDpjRb2NunMcKiq19umNJdduy+APQcmC8SxjnpOd61mltWX8mZDy/W6dLqLiBIlykvodZakuK5rpUQbKUFKISnqTpHqMGrEVnI1Lh0mlU6bXazMWvw0OK2XZc+RpKlqNh6AkqOyUj5DDOzlxFzPnGWrJ2RaVHqVQaQhT8WElEWnU1KlBKXJSkdBc7I6qANhjfRsnZZ4OVSnV2r5smZt4hw4zykKQ6EU2KtxPLXy2kgAJSFKT5lFRtcgdAvqtUlS7WHPXb3J+OOgnnJY5J4k3h79nuNRlOZm4xxqTXH3Gm41KoEZhclqMp1GpwONrFnHrnRcbJ0KIIvfDom1hWUaBT6XlGmRKTSoMZC0tSW+Uww2QSGwm4sRdRJ7Xt3xzbVeMNfqlWlVCiKfzLUIMRTzioymlNRWlBViStQQkqCFaQPMbGwIwLyOI0iDS4c6o1cpffR94uxnJWtBTYKWbX81tgSBbHy+p0mt1pDWnj0HT7fvPG0KMKI/czZseqNIcqEn7tmVNxYZb8OsLATfYJ3vcXOwPe+EdmB/MEbNsfMtInU5ip0+O7HRGqbC1o/EKdelSHAUkhIFylVvTAnUuLMGp5gYbiSF1GfJIcSzTUqeWkW+I6L6R03ONia9UqmwyuZT5cRgi7RkISDufzAbpJ62VvYjDui9nXaL/Jj7wBck5joyDxOfz5RZ9NYhvRKtGdbRWEBYWHXdOtCUKSSAyAdk9b6lLAUbCfCplTnQ5sGkxqbTpzoU/JfDRS2sN+ZT0lwErWlAtsVab6QlIJGFPlSVmhNOn5dytFQ1EkOIlS3wpLSQt5SkJSFAKWpbikEBCUm5HUDDfoMORw5oMrL8iSzUqq7GTBkyYqQiMw0FJW402kKUVLKwnWsqsClQGq+ofRAZ8wGFk+8gqKlHm/vMgys5/wBCaK/PgyDValDYcUarKYbYQym3nEdk2CLgbrcJWQLXsAAhEZrezfOnVeszA8tSw4mKpZcDR66lEgallW97bWAHqTTjFmdFFFMpaHGWGapzkSC62F3bSkXTv5RcqAuf0N8KwMVF2KtujUKZU4TI0pfZcQULUOqStSrki4ud8e2M4wOphERaxx1mZsrdPncuPJhqmKcR5IqGtbqrG5It0ANtyQBtifmDKT02kzouYKc1FqzqGExqdzAuXCRzWnVSHrD+r3ZSQkEhauaCkW3wYcNsvyeGWWKhmGU6y/nGfNRCalobSfANtsJcd5O1gq7zQC+oBWRYkECWZJcp+c487IW8VXUtTiiVFR3Kio9b++KddK047meqR7364URXLQvLlcmQX46Kk7KSpyPNeWAt9F7EOKPdFwCB1TYgdbjlOmJyhXaZLQXPD8tKHlOJ0h2OtZSFAdbJVYi++nBVmZg16KoIfYRLju8+E5qOlShsUk/xJuPT9MAdSkuzospMpkxVwoRgracN1BQBNz9NH6HFWlg37xl9u7y9I142YYXDmo1OQqjtVCShszqc4/ZxmPdVnjySLOLCylSdR0jXcpVYYhNoqU6qS67Vqm/UatULrdLqyrRcg2JO6lepPpsAMQ58lyWzkxaVWmqbC3EnrySyOYT7X0/UjErMNbZoEVDjiVPOuL5bbKPjWbXNh32/xHrhTUltwrTvFGRVbIldmyYadQ5T4CvGFCm4xQnUvmKFtvp/IYo4zEejw0gJ5SQLrUd1LUet+5JxOFTl1yQmQ8yYcRlSuQyr41G6k61+mx2HvjdS4TuYK4zT6dEeqVRUrSzDio5ji12uo27AJ3KjYC5JIx5Aa02tPTQwlalRVnnIiahzUMBKXtFuidQKQR7i3ywy6Zw6iV5j7yyHnQSqpB0SzS6zE8HMjrSoFK9aCUgBQFlaSk9NW+J7v2f61SY7D+Yq1Gobrouin0+E7VZRHqeXpSn6ah740VzhSxSUR6jSs01KnzGVBbMmqUkt6VdCEmzdgdxYlQINrHCbaitxhH/LI+szifc3ZtFezDlbO0JlMGswpTTNViC121qXoeTt285Wkj8qz6nBD9nzhRTc/Z6r+fcwgPZVoVUdEGAoXTLnE61qUO6UKULDuq3YG6szHmJVMYk1CY00xUWmS1LjtbtydyG3Wz3GspG+6dRB7X6zyhl88OOD+UMuOkmUzD8fNJO6pLxK139bKUsfpj1g8CoBep4+kJpl3EsegjKolWgV6rzKjXA2uHESgFtxTmlKVK3ACNyq1wNwLqBJ2xRZdmJn1mbTmj+DNgyo4Cj35anG/mdaEYpcoyvEs5ghK8zkunrcb/tsqS+frobWPriLkhS1Ztpr3ODLMJ4TJDyvhQy1+I4T/dSoe5IGAJWBwIreMm0sfTEl5GcFSp2bKWpQCpdKW+yD/rGFpdAHzSlY+uByj5igtw/u6rQ5FQg87nNJiSgw4hwgJVuULBCglO1vyjfc4m0eeKJQK9mZA5KypVLpyT1S86g8w/3GCv8AvOJOIUGsyMl5KYmQXFRq1WnVBl5vZxqG2opJbPVJW7qFxvZk+uHFSKFgcnHXH3hezHFKCV1inohU5saosPM9SWoNo67R2whxze52QE7/AFxV5h4oU92dGmll3Mc2KQiI5NQI8COAbpQ1FRvYbdVi9hdPXEOXw2iZYcTJ4g5hTSZKwHFUiF/W6k4CL+cX0NE+q1G3ocaVcW6fllRbyTluJRVhNvvOoHxs8/xBagEN7dkp79cbCZ6cxZKvEbKjP6Te/wDfNCpVWzrmYPs1era49NEtBQ46t0WefCTY6EtlSEm1tSxb4cKCqVRmlx3pUtRbbRuRYlSlHokJG5UewG5xszZnyo5hrT/NkP5irhIDy5DxKWSRcBxe+nbcIF1EfltvgEzS1JdU1EkTBMqSmyt5TSOWzDZUdJKE7nWseQFSibFRFrEYbrr55lqio1jJ6wekVufnKsLm2MWI2C3HJseQjbVp7KcVYXV0SBYXIN/UqUKW7DiQrMqSecSk7pSlV7+5KiOvWxxYo0oQlKAAlIsAOwxTVIWrKyR5jFat8tbv/phsHPEOemZpWtDEyzaA1HkKKkIHwocO6kj2O5T6eYdhjeOtxiNIjIltKacBKVW3T1BBuCPcEA41qkOmnLKiA7+yK09yTpuPmSD9cEEDNTDDFRS67LYQ+24s8tDqb6UjYEX6X3Vt641SYaYDa3o1QdhNNi5S+rmspHyVuPoRiU6+iMuPFabcekukNx4jCdbrp7JSkbnBtQeGjVNQ3W86OtANKDkelJXdps9QXD/pF7dBsLd+wLb0pGWMKlTWHiDFAyqqpU5qu5qZCaYDeBT0IKFzldlruSUNjrpvv8tjpzVmx1bwRpD0pSQlmM2LIaT22HQf8sWGbs7rr9QUttYUhN0Ng7oQn/M98Bi1IfedTHOtSj+I4TdSj7nCabrDvs+0bOE8qS+l0kZVqEaqo1SqQklWtKrqbQoFJv6pso9fQA+uLimzhl2ZIhLbKqDJbK2XDZbdlAXQb9AdV7b73PfYfytmR6CpDC1B5m9uQ4bpWnuPn/j364mx1NUuS5SgObTnx4mnFYuWiCCpr6HcegwFwT5X6xG6v/uJaUYJoZDa5fh4wWsMJUsAthVyQkm/TYb37/LBVSaHU2YwlxXX62kEKXGRKfS/pP5glKrKHTYb36J62BHa1TfEGJKpjk5bBUgqWyTpNxc+U6t7X2xaQIFCaZMrL2YPAzrKccpqpiml97hsXBCr9EqBH8QsMKOmevf4RdQYwnMwRJjDLvJkpmR9TQSZzrgRcJ1JWhajZXQkdjbBtSMtylSKbL+8GfBmMiQ+l340agogoSPiFwBf1wp8uVVudUBUKhPmTisIUVvnWtQBJCfQAXPbv7YsqhnVDdUQ7HdUVMKTyWlruW2wSrb2ASo29jiLdS7NtSMowHWOJ5MGNSWocqHEkmXDdirYS1ocjMrsC2VdbKFzpGnoMKaf9mGj1V2ozKNW3KQ+8W1Ijy1lTLZKjzBsdagUnygnYjqb4mucSHxIdXLeZSvSlQuggk3CQfe5Va2CnL3E3xtLJYYZedacIS4N0KCkm4I72uLYTrbWaTzVn+IyLEfgxPVbItRyjMZYqWV6i2pD6YxqtNeUpl8FQCHVArJKDe6gQbbi+BWblyRmeDU5TMKRT0UeL4pT1TkLW7JujWEJsspQNF1A/IWGOjcz5fkZvSl+lTXvCtKaaU5q8geWlSA1puLk3vYdNt8UT2Xo8On+DmQ0tsSUq1ocTpDovpVf1G1regHbFav2kdoLDzTArXdkRJ0Ut8R3WolPcBjJAekyyP8Aqqd7DfbWfMB2Aue2KfMDNGTXHBQG9NNYaSwl/UVeKcBJU7c9Rc6Qe4TcbWw6815ahVPLlRp8JQgOTUaVuRgE6iAAkKsNxZIBHoLYS9TyVV8vuGTIkInMtRtUlTKNCG1awAE91GxJPtixptVXbznHoJ0kZ5lI2+Y06qPpFy3EbAH8ZKgn+ZGG3kCKI0eEx/qmrA277kfzwp4SA7MltqAVzpbLZ/soQHD/AO/fDOyfVB/WnNktRzoCv7KdRP8AP+WGNWCUwJ3na2PSPPjRS/BcX8zxUKLSUcpI9ktxW0pA+iRhP/aHqqnKDlClqVZUp7xTifUNtX/4ljDp45zmpXGbMclpQWy4psBSdwQY6Bf9cc8faB8RIztQmGUF0R6WtaEi22pzTcX+Q29sSNMN2pBPae07Y0a/KABSWZLMph1cWaybtSGjZaT0+vXocFcOtN5ra8LmSGluULNRa9Cb5Zbd/IHPrY3FxcgWBOw9TssOrkBM95M1hTCk7oAU04beZPy3seuL/wC6GEwlxWQWGFNKRpSSbLJBDgv0IIuB6k4r3Oh4gWOYRZ7qcnPPDaK/PCP6QUUKjLWj4nGS4GnW1fJSkOj2J9cXOdFSM+VrKWV4ayhECM87IeT5i0X3glIA6a1BsBIP71zcCxoIbiQufqUf65cq22Ci2EX/AECf0xfUnktCe6xV/uqc6oKVNQm7iBp0jSTskhAAB7EkgXxJZhXjHbOPrMDOZE4u5jo9KpwyBk6HHj0yI6hdaqLVlOTJSNw0XT5lhCt1En4gAAALYXNMy7WqszNdhwg/GhoUtx0vABACNe467jYWBuThtxskZZYrEOV4BMynQ4qY7FMfSCwVhSip1y9+YpWq/mGx+gF/AZynlqK4qNRW6VGVIclPOiSUN6lJKSncgaADskEAHoMcGtWlNlQLH1MOAROeXm3o6kolxXoTjmnQ1IbIKgrZNvW9j8rG+PApqGnua1rjvj/SMq0K+tuv1w552cMj5wmzo8OgS80VB1e7sFJUmOOUlASHlaQ2nUFKvc7qJv2xQ0jgQvkhdXzUiGyTdMGkMeIcsT0Ly9IB9SAoXxUqvLrmxSs1ugvRs91GgpUxOWmdS3fI5zUi4B28w6KHuAMWmXcyrRVFQsnxp+ZCrzIgU2MuSpo90XSLafQ3236gYbWTOC+Q40xDxooqrmoJLtdkqkkHpcpGhu3zR0vjonMWR5+VaXDYy3ORIjKWWm6bS2GY5WgAEOsttLJcbN7Cw1d7YDYaweFmH1i1MtbnrOcqTkPixmjlpaynTsshRGlyu1IXB7fhNXWDfscMhULjdw+ZQ7UqFTs9w2UhJlZddUJoR3Stl3d0AbApOq3W/TEtEhJfc5hUmQhVlpXcLSrvcHcH54OYbub8uwUy1MVFqn3AC5bClMi/QXUNv174n25PAUEen+4wLK8hiee04H4oNZIjZzVNpmuBBkPKRUMt1FhyNLpMgkFVm1blBIv5b6QSnpbGlGVJTC4yUvpkNJispYajKtzGgQHSCSBcq0nY9DbH6B1f+iPE2K3Azzlmn1JKfhfeYDmi/dJ+Nv5pOFhmr7D2W+SudkfMU/LIUhRS2+vx9PIPVN/KttJ9SSR7kYONegAR8qfjyPvMvUScrOSxWDIkJgxXqW1SUoTzESopWEOFekIIuBe49O2DVTdOrDT0ORGiIkNM8lqW7GQosaknSUX3Fjva46Y8cS+E9a4XLD2b8oMClaglNepKi9Tz+7qKbKaO9gFgHfa+Bx3KlUpUR6q0yoKdhyEJJVKQZKUo/KUqChsL23wZ1WwDacenp+UWIIOCIa1Gju5Voxq7FWfrrMdOucxKcS5rRfzuNDogpFzpGxAt13xcUvONMyw45VnXIbHjNDapK1BPMsDoTr6kAD17YUbOYqxSkqQtqPVErIAeQOUpAJsdSbHUN+2PNVZpjyXlt01iKumyo7q3m20pSsFQK9SehSEKJ3739MAbRmwbbT9ROczqbKXFFWa4kyLT5ECXVYzY0lTpLSbm116bnaxNtr298Qcy0BnOdRYg5tmBM6mI5safQD4dRQ8FJKHG3OYRYtpPUg/ywq6TWGVx48qM+phS0JWlVyki42H+WLBifX/Fvfd9WjpcmvNlTk6Klwt2KRdKk21eUEWXq69U2xCXSeC5NR2/HvNh/WXUPhbWoeaGGKHm6DMo60qdcTUY15aQCAEWbUkLvc+fSmxFrHAzXeFdXq1TqdQp0yGCuQRyHGVctZQNBs6k99AN9J6n0vi2pkBGWJLUByoRkz3nXX4kZpPJDaTcqS22VqUUA6lfEbEn0FvrOe5dHotTDkdb66a1occYaBQtYTdRQm+wBN7E9N8Miy9W3VkH6Yz8Z7gxdLy/LYjB6oUmdAsBzFLAsj1JAJNve1rb7YiTaABpC0NyGlDUkqSCCPrhkVOuTJEFKuS7UQ4mxZToFwfULUB9N8L2TUYlLmvsPR/uh8KF4Xlt5twUJSSDq/h73xTotssGTxMFfSUsmgoQlLjS34jhWt1DjDhSQs2uf5DbpgkqnEiuVfLIpeYYUXMzkdgMRKkXDGmNNjYNOKspLrYTcBJspPRKgmyREnvMOKkQpyn6a60ErdaktqjuoRcEEhYBAPS/vtisdpQZjx5UCosS2Xl6eQ87qKxqP7NV/wAqbDob2JNjiilpAw0EVBIz2kOk54foy40WqsmKygkMzH1J0na2lRFwFW2vffEuvUVGa4Am0lxuQ60VOoaDiVJUkjStBIJsDfv3tiYunoKbHSv1ChscVUrLVLdKlLgMpJ6ltJTf9CMdWxN24DBjn4hiu0yBw1R4vOEh0OOvtxYf9XD4OptSlBK9+hOxGodb9+uOu+EkGnPMopk14OtznEIkJUQSpDqeSr+SxjlTLLbdJzk+iIyhtLlNuhtIsFKS4Nv5gYJGuI1abmoZy47yJK3OQ3JZYL7z7ybFSY7ewOk2utXlFsD1VL6k4XiN1MPDBlvxWyv91ZSbrTLVqpTH3KVUHG025y2HlMocV6qS4hCr+ilDpisyrmYF6akNFyPLaanBkbBIdSQse41Iv/eOLyrUniMjKk+lKo1SzFFrDT75akNsvSeeslSngqOpRH4ik3C02ubakkjCmoObDTKqjxlOlQmokY090hoqKFIUkgKT1SQNVwemCLWXrKk5xDm0I4bpCjOtXS1JoDDbB8GzJW8I7ekAaVNgCxsOi1Df1xcx6hBhFqTT3nqBMccSLMpCEPbFQ5iBdCwQlW/X37YEs6Vil1ulwJVNqcQyo8pKiyu6XCk2BBQRq6hN7DpiVGzLTZkuhsAPMTRLUstTEqsPwnUpsqwunUR74z4eawCPWZdlLEE9Z0twjfqWfas629nGRlGluAsKbpOnx8kAAKBeIIaSLlOwKtr3F8G3Hj7KqKnDbzXwygiPmmDHQibRQvyVuO2gDWn/AO8hI3P+k/tfFzFQMwTKbVpDzUNMaotBHiG2HLsy0G4SUm10LGna/oAbgi3W3DDjbLFHjS6y8in09poXmSX0tBhItpWQogje4Nzb0x8xqa9TpbRZp+ncev8AMZrqULicaZGlvzp76KTUVU5xlK3FMqaCtC1SFq0OIO4KbW2I7Hvg8yjmeVR6nDbTKbolfbW4iFUEFTkR/mL1OMONqPlCiCoBJBBtpUemNn2uqvw8zdXGM+8PK4YuaHZAYq4p0Z1UJ8qNhJS9oDYX8IWnVZV73uDcCoeYUVyNIp1dQlqpNIKyho2TKSkX1NH96wvbsRfFrZ+IqFrLjPUEcwaisMUbr6+s6sVmGlcTITNFzlTlPsOJSzJcin8Wmyki6H40gpBSoA3A2Ck/FcHYYZ4o5p+yzm9FPrDLtdMloSKXPhthDFbidQsm+lpxG2veySdrggFR0bi1mZ4xcuttyYniW0yg9TlNypS2jbSm6wlts7brUOidsHta4E534uZdNTiJRGmZZjP1CPGq1ckViXPUkBfKDavwmirQn4SewtbE6vRpp/JcR4Z7fxNqSgzXPs3PUqs8TX88Lyg3QslZnU3Dqq6W6ubATUVKs2+t4MpZStz4FBClXIudzhh/0dpb8dCYzQZS0vUhUNwtFCtOm/l6m224tt0xe8IZjHHzgTmjIRWNNdpZm0o3/YS02cbA90vIQfovCsyjnFmflei1OoSWqbNmgRltvuBtXikkocaAJ660KFsK6lDZygwVOMfoYhqq/DYMO8M4OVWmnG3JU+dLkpKgmU8+QUg320Js3tf939cSo+SaxJCWZeZkuU+10qp8dUeQ5v0W6HDb30BJv3A2I4xnqIutJpLUxUmVrW2pTTSltNuJTqU2twDSlenfSTe1tt8HmX5Ue6S7NS0tQILKthe22/TEm1rqve4z8Ipumh7KGY8qMtysrVZyoJLqEvwa28uc1yioalIUo85KwOgCiD+70wxo2Z6NCoaKzU44ojTf7VqemykLvbSOuu5+HTfVtYX2wv5GYapQ2UrlxUOoSEjmXsST0FxcE7dse3qzBzlBcptVpfOZVZamJjOpJ9CCRsR2PXCtga8DxR9R1hA4EMJfFan6VzZGTsw+BSnzzRTQAlH7/J5get78u9sHdFzRR5UCBJaTGqVNWzzYrjS7JcSrzBQUPiGENAyLRYD6jEkViKyRpTHbrMsNt+6U82wPyxujqyfwqiPSX6hCoMSUvUtUyYUB1dySQFq8yiTuRucZu0untAXTg5hPEE6MiZ2Q2pLUWNGTDKyHWm07j63sT9MDuYcl8Pq7VXJ0rK8F59RKjJQtyO4SQLk6CPbp6db74UtP4nImIccy5QK7mBKhcSWopixFe/OkFCSPdOrHmmZgzznZanYVbyJlVhv4kTZb1Ve9N+XyUJ391YHV7I1Abcp2/XEKLCR0hbA4KyMpVqNPyVIpmaoMiSTJg5wAfkRkKBspmVpLg0m3kWFEi2/fFxWIHFemyHF+Eo8yjAGzOVFpjTkAE7gS21tubflBQb98L+fUc+Ua4VxG4SyFJ3tKcfiH6/jqtiyoWduK1UjqVSY2TM4BA8yMuZp81vZLrSh6dVYeOn1oPJVvn/RGV1FgGBIj+S8m0qou1KTC4iZfM7+sTKs0ktttqsNRfaa1BBHdSmQDubkb40SJWXdATlfiHmWtLVYIWqmRpUf/AMUtMJt/8z64KMv8Y5VQrP3BXqPLy1mIoU6il1ZsJU+2PiWw4glt9A3uUE27gY2VXIWTswvc6flGiPyCbl5UFvmb9fNa/wDPGDqGqbbqVOfvBm5T7yiDlKydxcqoblw3cryacd9dUQqO5btvHekIB+uNMnM+ZKPUvAiLluq1RNwqHQ6+4/J/8Hw2ofU/XH2o/Z8yhUg8hpNRp6XbXESqPgIAt5UoUpTYG3QoI3wEwpdZyBJl0XJ3FRquuMqUkZdh0nxspG+6FGM27oV2uWhbvhqo06nIQfkR+YnQ1DcFcQ4YzPmGVHD72QswPMqJAehGPKBI6jSl3X/u4gzeItIpSgmtNVPLqgbWrFKkxkj++pAT/PHvLKuJtapjUmo5GzdVX3UlSkVioCmpT7FpMhgEfNH0xvlO5ny64WxwqpFPkEed1qVCLt/UrK1quf7WDfhU93AB+BmmopxkGTKVxCp9cjPCkZoizmmUa3PDTUrDafVVj5R7nAivi7RKtUlU+iyZecKkFaVRMuxnak4k97loKSn+8oYoaM9lfP8AmLNlQzxAp8ytUiciDTsuVN7nxozSWWlredaaWjmla3FWUq6bJA9cHuUuP+Ys5QafScvxaVwzyoUHkVpimLlc5sdPDwWbcoEbhbqtPQ23wyvs+uvtn8h/JgBSO7cQbzDVeJkIxzE4UVqHDfUEqqFUUg+HH7y40dTjqv7PlJ9sQRV8itTvAcQ+Kmb4tSeQdFIpWXpdDb0kE2P4Lryxa/8ApAPa2DV+jcJc7xHvE57rnFGQUlDi5dfKIzRIsSlmOWm0EdgpCvmca6dnLNuSIsek0yNkurZXSyUIQzH+7X2yDYFYQpxty6epShF1X2ANsMqK1UhEwft9ic/tDJSinMncLOGuQWDI/ohX86UZki5mvwIcZbvoSuTC5zgP73m9zizzVw1flTHoic8mY22jmLczBQ6ZMaHoLIDLhPuBYeuFXnLilS8vzvHRqq/RZcROudTqW7zYyrkk8xC0lLQudlgNE+ptbC/TmHNtRZnVs0pMClyHS79+VtK4zQSq1laSVKc7WOpCT2NsaWu9zvLYHxjG5VGFEY9Xo1XyerXEr+XZTaTvEg06bSVOeoC2JatPz5ZHtin4cxqjxJykmtVDNOY2pypcliTFgVMoZiqQ8tAaSQnUQEhHmUSpV7nrimZye1VmkP12pPVtDgvyWz4eGseyEG6h/bWoYm/0dpbLZYgR10ti/wCwpshyIi4FrlLSkgmwAva+w9MEtU7NqnDeoEG29vdOJb5hyfRaJSX11rNtcgsqUomfPrBQoIItywXPJbvcJ1X31Yqcq8Q+H2X5MSh5PpEis1V8FLLdFgFyRJIFyrnKtr23KtZGBadw/NPcel0RqJIkuG6jUkBySn15UohSm/7yV+xG2KSZLjwUsM1qnLoESPJ8QkOxNTCl6FAapAUtKt1aipRSSRvjI0osXDuW/KA8Jj7xjkk5krjbRdzOW+GMNbnLadq0F2S66N/hWAiOlR7fiL+WKLMyqBFcXGoFfzdWqpYLKxJirSjVYhTl2S22DfbUU9dh0wBPTpTkORJp04Jg6FGIILlmnVFBspZHlVuT5dxtfc9K2nKorLNNDDa46Z6eZz2JzkfWvTf8igFrUfTfYnG69LXX7oxD+HWowBDR2dXssQXqrXZ9Lk0ptHMkA6mXY+9hpUElLqjcC2lF1Gw64ZPDHIngKy3n7PEXk1GMgqy1lZ4alwypO0yUnol5QIKUn4AelzsoKDIp1QznAb5U7MJpxS9AozD65b9QnKF2yltxwhSWWyXL7C603O1iYvVqu8W2XIuXY86NARIS3WatJIjmnkKJcZdSpQcDpCbEJTfzjcXBG2rWobjgep6cRN9itkQi4i8UJFLkxWpipFbr1QWUxIPMALlhdS1E7IbSNyr3AAJNsLrN+aK7SKc5UqrmKFQ46lhtiDBgeJW64ejaSshTqz2CUo9emIT9CY4TQIldrUNtyrvpdg+HpalOmW+p/wDBQ0lVyVrQUgn0SL3PVr5RyGnhChnPfEJmNP4kONFdNpAIXHy4yRcWvsXz1Us309ul8YFtagMnTt6k/D+Z6tGuPoIj8s1TP/CCNmymO1GTlKu1iU5VF0esUIl+RHdISl3xSHxpCUmyk2Ggm3U7WnDrN+RqxX3V8Tq0qlUmK8EJpdMhvmny1aU6jIlhPmTcm7R07p8yj0wR5NQvi/nv/pHzbDROy4h9cSl019AWmtEJdC3DqWLNoWEkXQQop9rYg8W3Mv1mqVV+LTo2X5qWyy0zRWktNhxStfNWUpSHVjYHVtYkW3uB2ail7zUyYYjkjHB9M/3E821D5ecRwZw4k5cbh0xvh3GpLNJjpJRLp8RnlElOiyNIsPKeo3PTClpFIgZxrlUfo2X26/WogL8w0thpAQ4kGwW4SlGs3sE3Kj6dThH5OYqOZM1s0nLrMiJmiVLWw6ijK5bTyEEFby0G6UITfdSrkG+5NsNXK2aOL3C3LLFGitRpMGCFttQpkAFLe5CiZDK9JN7q1LRcnci5x59J+EBFbgsfU4z84M2bjlhG3lvhfJj0XnOUmPlwFHM8OoI17pCrK5d99yCCb3ThK1o5pzPUKi3R2KaunMPmOw65IUFIWnZalp09QoHy3BO3S+LJrjvU8xVl6DXUPQpi0h3wS3NTK7XGtkjYgbjta5uMRqbmCWvNMaHAkRIUmrvqaEifcMR0hJUt5YSbq0pSSEjdRskWvcYoXUhyLgOftMFg3AjV+ztTYWR5L7dWmVKqVxSJE9EpLDSYqHG2HOSSNYKEINyLJVdxad+mKmZOrGZswP0ekVFFIi09DS5tQSyl90rXqIYbCvKkhKQpRVc2Umyd9WKzi3mCPlpmFSKTMmU6gvKUqo1Vw8tyc6jTyw6tJ/BRdSlBAIAt1JOB5rOzjkZMKlusQIcZlFo8NsIbCVC4V/esTg2ossC5Uc/kIlUm2xrG7yUxnKWuvsUWtCFU2pQcLEjk8pYKLXC0EqSokEbp09D5e+DKNUYoWyh4lmNqCXFNpF0I7lI6XA3A9cc+5mqqYk+DWdZApb6XQtSdQCCQl3bv5Srf5H2JUnN1SnIamBfgEqSHWmkC6mgfhKlHqobE9gRax6l+hDYinv3jGFZCB1hZxaz2xTqimIiEmP4Z1yFBozKy464vUdRK1G6lFQutw2ACegSkAc65hqk7Mb8+UxyKy5BbW46+6kqgRikElDKP9KoWsVq2vvsNsa11eZnerPyA+4uTUi6BJUoqWzAQshRBP53nCbq73wQ5Uej5Xri4aQEU06rJJBS0262HBf2CkOgexGKxHgrkcmeQbECifKc/ApFGZjreblSkpLy0NpTqW4pWolKR0F1G3Ta2F/WUx8wZqqFRbg/etPSW2k6JHLC1pSLqI/N1t9MNal0ynxIiXIMfkxHCZDFyBqSs6gQOwsqwB7WGASNERTqtV4ABSW5Snkpta7a/Mkj26j6YR07je5HWAJxNaK3V3Jj6E0+HDdkIAbfC9Sm0JAG4CfNYkW6AemMhxn1ONy5zxlT+XoLn5Uj0Snt0Fz3O/tgooTLDyZEeQAh11NkqUbEgjex/TFfmFdNojpHiAlATdIWoalkDcJ9eowQWAttUczk0KQotK0WDljpKhcX7XxZZMzXX+H6JUmn1kUyTISEPSmIjJWpINwkrcSqwHoLDGyBlGq1WMy6ph+lLRNQ26mQE2UzoupYNyDubbHqMW+Tco0ybBTXJU1NWleNeajRkhPh0NJWW9RSR8RAuCT+bAbLa1Q7uROhTPbPH7N9TafjKrUCut288edCCCtJ/ib03B33sRiK1nGiupUtzK9Roc7T+3ob6Ckn1tdO3sRgg4i5flrXDW14ZhtOmOwEanCpSh0VYCyRY2xQzKaYkBtEdLK5V7JXIVoST1JNtzt2GFEalgCi4zPFBIOSKQ5xM4tZRolQaRHiOTlTZC1pSFuMsILqgsJOm6tATcevtjqrO9fXPqK3LC7y79eiRsB+mOXuG8uQxxWYkoDSZUeiyHE9dAXcJ69bG5HyJw36Lm9vN0dySW1RpLSy1IirN1Mr62v3BFiCOoIO17YfsQ2MrdgIxWQiYjPya+mlsVTMLouzT46mWUHo9IeSW0I+QBWs+yLd8QKpJVlzIrDLfmn5iOsgC6hCbXZI9i48n9GU+uJrsaKhWXcqzZIgslCqhPdLiW7vutam0a1eVB5YaRqVskrUTibS3ItY4sVSvyi3KoGWGDMASoFotR0pbispI2UFOctNx8XmPfGFUGQbrC7lj/cdJV5+pzqavlrIELl8+npbjvkEWXPkKSp5R/slSG9+gbOPlFqEGo8R5teW2F5dyvGD0ZpfwuIY0tRQR6uOltSvdazipoE+Q3GzRnCY5rnBKmY7qj8cyVrClD3S1z1/PScB6KuuNl+VTmSWxKfQ4+R+dKAdCf1Ws/RPpg4E1XUX8v956yHWaxPr1VlTZDhkzpbqnFrcPxLUbn6XOKytOO01tUZyppiMNAGVOKwhYJ30I7J7b7n0ufNjRUK43RQH1nz9UJBsScATDJzHXEPVOYjmuKKue+CW2b7+VIvb59fU4bRJYXCDAhfCrtMTHYp2XQxUZ76uXFgxF+Zxw7lSu4A+JSzfYHqdiW1fIT7OQ244c8ZV2nDMkugbvuKHnAHZKQAEjsEjuTi74X5ao+Sp7FVaWipuKSULkixAQbatFr29etzbBW8jkuqQFJUEmwUjooDa4+f8AngwXE1nM5mLiWULcWoIQkFSirsB1P+OKNx1UmqOuqui7DehsjdKSpdiT6kg7dsOviXkKjS4ipK5rNGU64nmrdIDSwDqVcXFiQk3t6nCQMltU+pTeaFxCQhp/olbSAfxBex0kqURe21vXGlWYY4m191DDTjjqw22gXUtRsAPUnHvLeU6tmqmrlhaKLQ1Ol372mp3cGu6eU2dz2Go2HpfFzlLLDE2JGzDmGIqUw8rVSqJbd89UuujuO4HQCxNyQMTc4ZjW2tb86pj7wQoaEMEcmF7AEG6rbAfXfYYRs1JJ8Orr6wyVcbmlrEj03IERSqIw2mfITYz6oSuXJ/spAvb0AAHthd1+r1GuSkuVCQ7KkOHS1GTtv6W26ep22x7frEt+U5NlPOR0LBB5qvxXvaw6D2/kMDk+uct+zCVF5/yAD4lJ7Aeg/wA8CrpIbcxyYYtxgSRLpDbaLTJ2twfExHOltHspXVX8sQJlYSyjw9PQABtzLbD5YgVCNI5iEvvJDgN1NIF+X7HfrjzdDLZKiEpSLknth4L6wOcSY+1IU/ERFb5jrryWggGxJVskD3vYe98EVMmorcVMR91UaY2sOMv6bKQ4Nr2PfqCO+4wMzqlHaZXokoS+ga2yFeZKgQUkW9wMM/ivlxDsGi54gMFMetoR41plP7OUUakuADoHEg3/AIgT+bC9pGVU9T0mC+047GQUpFcaEaTph1uIjUFAq0OJv8Sf3kH9UkD5H3TVx6mFsvKYdeaUQU3SsEC3Q9/5fIYHYdTarMZtp90h5B1MSWlWcQr1Sex9R33BxthVEU2tJfqyeZIPlRLFkpcNja4AHm373+eFWqOCB1gWr2nI6Rn1iltJy89UqLTHBGbAaW0HgVIPTUPXqNtu/pikg0dultGW9qLDOjQ2ne3kUFA+13VfQYjQc7MeAlxVP+GUXEtvo1brQSPMB3sFXt7HGuqTzTZAjsPeLkBCnSw2NVkJBUsqHZKUi5UbAb74mrVYDsPeZl6mLTJUlKZ8MNyEttltwOakhJOpOnTtcA/pcYuYDdPpGWXg3MEQobs666dkpA06r7Wsm29xbbAllWrR+WguRdXig04Au3lQFalJt6m1rXxsoUuHU6zLemN89ph8qh09ZGhKRbS6r99V72vsmw2vvjo0zWtsJwBPDrCugcQ2IdRbYpVUY8Q0tLzTalaiqySnUEq2UNzvY4tsxZmVUWo02oP8lloaH3XV2SCTYW9BqtfG6mVGh5gqLMKu0tioRnlW5UtIWnUnfynqk6QqxFrWxAz1RWOGmY4vLdem5XqhSuneKcLvIeTuuKtR3INtSL721De2MX6NVYFRzNgdxBhE9ytRpVUiNSBGpaHn0O7hqRocA1JV0UlSEPJ9ifUDGuPVo1eix40uMC5OZcDqUeZokKUgpv6nSsj2QcNmPmrlpXRqvT4c2kPJ/C5KgLahcpsSNWyiO3fFFm6nUdDK/usCOtyaZkmO8wQsOaCgBtXRKRqWoje5WfXCS6gbtpXHpNY4nPdNgsRZlQQ0myGZjyEAkmwClIAufZNsWOTJxdjz4S/Kt959CT6HUof4EYiIbXDrtZiOtOMLEt11CHUFJKFOKsoX6gm++IqQqBVnNJ0h78ZsjsoABQ/4T9Tj6o+dYZTwDOg6RUlZ1yZErLYLk6jRhHrDCd3Q0FnlyrdSgX0LP5bIOwN8LnjOrl5wyzUyQI78J2Lr7BSSFjf3vi94P5yXl+rCWw+qI/HfUsOt21J1je4OykkFSSk7EXBwxeJvCCkcYMvIRlNyHRq+Vh5qgy3NEOS9psfBvKNkawTZhdrG2lR6YmKFrvyeIsS1KlTyvb4RFUim1WsiqGjR2HjToZlPOPqOk3CiltIA3UoJPcAbY8UmBWc4QXXsvU/xDaVBsyn3UoQlZtfSkkFem+/TcW3xYZaqIhMuwGVooLDjp8dHQylCi4g6VtK6FBBCkn5YrJErnOvpjFbTK1LKSnykXJ3+ff542S2SAPl/uaXBl9xAyfK4U1CEzUKj94UyY0FNVJxtLOh4AlTS7G3QXSfmOoxqmZsdqFFiwChsstlKw8km67BWk+lrKAxfZN+756abIqKHq7VqeyGOTWHTIYLY/OhKr2Pb1Fz2xUZ8ypSqbWIcihMKpsKa+03Lpjakq8GpawFOsjroIJ8pHlNj0vYCsrsEs94d8cTTLxkQYmZwmImmHSlDxTaQXZLpKm2Ae1vzKtvp/XEd6kMVBSXpynapLKk3kzlcwJFxcpRskWFyB8sWM7K8qgRBJnuuKkP1d2A0w03qQ62lhCkLSkJKipSj6na47XxEjT2XpPh0XJLQdB7FNyP1BFji3p1q25QQfIjGy7UYaY7dNp8jnFpGoRr/AIlu50i36gYsPvPSSNOk9weuFk40h1IC06rHUPY+o9D74sqbmGpR91OpqKG1EOMzSQsjtpdAKht+8F/TG2q5yJoNmMeHV5DTmtHQbnfBPrqsNiNJep0phl/zMvKbUlLlupSSLG23TFJk+qUuUqLUm2AlUd1KnWH/ADJSob6VdiP8f5YclV47tZjjLIo0GoMPOB2S1KkrkxlOJTo1NJBBZPXZKtunTbE+zrgLFbzaGXYuR3kCh8TZiTHbr0KFmGO1bS3VW+Y6gDslz4h8iSn+E4YUKoNVySmdlSsyWqkU2NHluhElKf3W7aUPJ/hSAbW8uAOLm/JTK0yU5NfflabGO9VD4ZKvVIDesi+9ivFDWPtA5hqoepeV0QMvRGlFpyRT2OUw0b7gEErdUO4Cgm/VXbChRmPAgPDZ2BrTB+PSG9SzZTHai7S5dIkRa+38YitctlKjcgPpP7In1SD3IbOKmLDz1SaiibMrSaLFcB5MeiK5rSwCLkvLBQ5YgA+QWvbbpjVQOKyXY8WBmlC8xR206E1FbgTOQPZ21iP4VJIsLC2D6k0+aWFuZXkx8z095AW7ACQH7f8AaRyb3H7zZV7EXwu6gDGI2tj0+/8A6kaDnCQwh1C4zDweFpAWklL4PUKQSU733sAMJ/P/ANkrLOcJv33w9RDplWF1P5SqxUKbLJ68kpI5Kzbt5fZIw2GokKpTSw2V0eXr0KgTb3Cv4FG2rf8AKoBQ/i64u6fkp16c2wZrLaiCsn8wSBdRA6mwGEUsbTtms4/SVFsrtXM42g5T4d0zMCsv514YnLeYU9YUuVJaUv8AiaUHCl1PopGDlngVworjWmnRall2QsWTIplScdsSPzIcKgR7acdIZsnZTz3R26BmugNZlpCU25sxP4yFdloPxJUPUEHCUzt9lWrwojlS4W5lFdpaU3VQa9IKJDXcpalbfRLoFv3jhg3Nbghyh+fE0CP+wzExxB+z/mrKLTk5ibOzVQNlfeVBJTJigd3YwvqHqUm3qBgYplFlmlszcs5hXWW2zdUSWtCkrF/MNYSFNqF9r9CLWwwcrcc8w0CU9TalGeZl054w5TEglubFdQdwpW4X1HUbj82Cqop4b8RJCJ9WYdo1afNl1iiKXEfWf+1CUlCgPVV8Ea66obdQv1Az9x/EG1KtykWbUKqVyBVlVSmxolVfSnkSGXy6QUos3c9UlKh22Oo+99xg1AU6polIEoPOuOtxwsEBC2wVtXsL+cuAE9rYZI+zxX3GnZeUeIEOvxt1tQ61DTqI/dMhk9ffR9MCmVqi1maBNRIZXTZ0J5cSbFUsFTCx13t0tuDthU3hlJqIIHXGePvzA7CvWUqOHFaqTPijmByHKKdTMeOyOSi+4Cz8S+17W9sSY+WKzRcywZ1SgtVaQUpYZqlPYUVMG58i2yVFI8x86et9wMMjJ8GkLoMjk1BD7ZToYdMxS3EkXupBvY2t+a/pizzXRkSnKLR8uTSqqKiIfqylOIS4whTZIW2hSbbrGjYKA/wUGtsLFCOPlj85vYCIu2alSs+usOzorIrFMWVBiVpW/GJGxI/dUFA2O17dxfE53JUNcOoVBvLzC0yyluRNbjnSV22sbWCvl1Nr3xdxqHEer8N6pTEPlq7Tk5pkMqWhXLupSRe6gG0C+/w7bbYY0muRsj5cXEpOYI+YKXUEracpElBJj3B/FSsdPN2I3JBthC7VsjAUk49IQICOZy3NyQ+0GER3eY4SUvFyydG+xA69O3riulZXmRZJRy/FNbrUpvs2FAEkdjve3zx0kzVjNy01Hfy/BqSUPqDbhbUpYI86wQN7WPW42B2OAyvtx5DrrtMiLpzL7dg0XCtAVaxKTYbE229zijR7RsJ2sIJqR2nPeasvz6fIM2mpUZLLLqUJSrdSFpIIB9QrSbe2LLhcGodPj1RKnGHXEchkskammkHTb+8sFah3K8GT1Iq6lLadjMBCU6/I8FFNux9/YfywupdFnZcqLk2ksEodPMfpjwKQu/5m7/Cr+Rx9HTqPFr8MnmepcVt5uk6IyXmyHVEtQqo2pSgoLS6y6Wnm19A40sboWL/UbdNsQeNmSE5ggPViMhpzOMSKqYioxUBtrMMFuwWl1A2RKauLkfFdNh5rIWGSq4xXEOPsLutohDjS9nGVX6KT2P8A79sMinZxTAkZdgyNbiW6k5KSq/7NHhH23PoouNfUD0wEK1T5Et7VsrIPQznh0qqnIlRgykrRzEuuNhSjceUXtt1/lja/SFyo7jEpRdCwCh5KglZsolPQeUiwOCWi5eFVy3DkwGwWQuSUDVY8nnr5dvWyf8MX87h4tlUtyHIDzLaOYygpu45bqn523uOtxhhtSiNtzPmypBwICUSvPZXdlNVh7xLUn8RiepIB1pQAG3LdyEpsr1xe5fgy8xVyj0itVNyQwhDclSltIUhl1aNehKSNBcOlRClJVYAbXN8R61RkxVLgzWkukoTzGzuNwDb5i+IeT1utipUUyFIqCFNy4slW5UhAQGz7lBQi/qL+uDbg6ll6x+i1mIRp2vw34fZAqTX3ZmCHOzFTZzXg1vViW4tLOsWC2mxZoEHoQm4sTe4xxlnrIsrJ2aa3k6tIKp1Dmqilz4VLQLFl1JHTW2UKv/Efljp3gdnFOYaaiJIVo1XPKUd21g2WkH+FYV9FXxC+2DlJqpjKPENqzbqnEZbry0i5B3VEfV8xqQT7pGJGmtsrvNdhzn9f9w99R2/LpOdeHbT7bVRlF1cmtUyQ0UBXxKYQ3ZCRbrqQVp+Z+WO5vs+5qgGjRalT1anm3EuOaVbOIUNlexKbg+4xwLDNcyPUW65JQp5LCUNTEJACnI61KG1tiUrRqHsoYdPCXO68gZlb5SjLy7UkKfjrb6aFHU4hP9knmAehUO2C66jxkLAxrR3BlA7xqQZQ4A/aJrdJhIKaWqSnMdFQi4CoUknnNADsh0uJsOgPtiXlzI3DnPXFbjHlioBxhpxaKxQamVqtCM9pDy3EN3trbkN3B2NlKTcXOKb7U1OfzNw9yjmyi1EwqnRao1FRVEJCtECYeUsaT8QS5oUAfU9MWnD/ACDTuEniZdVrzlQrdXWhEmq1JaUF0toWoJQm9kISlK1WvsEkk4j6u4JpvEViLGGOPUEc/b9Z7UMFOxhC3iN9nZ57KFOVw/qSpsnL1Gbg0umRnW4/iJTr6VypT7ijZS1pSlWglIKk2JI2KZpPE2i1d6XEkTIsGoRHHkSIq5TatOhZSpSXEkoWnvqSSLHHXPgotPp8aoUuuiGH2GeVGjL1uvu91FIO4sSRb0B9sb6vETXolPXm7KsPMdOpzhlRUSGE6o60pKQ7pNwPKpXUW39cfLaf2udpr1YLeh6EfzFLKkbpxOZ6PVVyGUSKZP57DnwuNKDjavl1BxKqHEeHlxpP3xU6bDJ3Cpb6WSr9VDFhm77NWXc6cRZU3Lcqk5aTUSedl2sU12RFjuEalOsJS8hIUshRKSkJ32GKSDw1zVw0qz1PTwqZqsiI6Siu5djw2Y8pu90OBLjiVJXbYoN7EGxIx9DUNHqQCr846HAP58QCUAnzNiRP+nnLxUsx6pHlobGpZhsPSUpHuptKhhaP5sy63madXKPnejifLcLjia82la0X/IhxRbcQn0SSQMPyD9oGsU+qLpMqoVHLFXSnX911iP4R4pvYKQlY0rTe+6CobYt6jxsqEaGt2ty6VLhp3cVVozPLt7kgD+eHKUGmbKIefj/qPDRIRkPE1l7i47Pf5J8I+Lf9YpNURIbPuUnSof72NNczXlyqSfD1Slv1RbY3UKS5KSj21IQu364Nv6Y8Lc2WclcG8u5vLm3iqDROQFH/APiAnR/vDHhXDXKsp0P0LhRMycCblxnOMqOoevkaDqD+oxRF1a8spX7fzMHS2dFOYEyM6Zdo7DEeLVDQnB+yjGnrHMv0BbU3qI/sWN/XG+FmeuCYiQ5Ts0PllQcizqRl52LpPydWVKHyAvhs0nhXluJGZeZzdn6mVQMlHiObCmISTuUguMaii/a+/ffG1OQswMpV4PizBkb3Sit5SWCR/EuO+kfonAG1dbcJj65/ieOmvXtPaeM3/SRk8UPNfDrM9UqjbgXGmNRG4LjTqfgfQ+64kNLBsQRc9QQodZGW18WqnTYzchGVqe82VJVKnuvSXX06jpK0MhCEL021EKIKr2AG2KpFCz/DFl1LINbH7zNSmU9Sv7rjDgH+1gZzvVf6FRVV3OuR6YzEHlVU6dmaG84sgdEpWplbh9gCcT3ra7yoqn8/1xBOlg5YRjZklZpdpcilV7LapMF2yX5+VqmCtSAq6klp4NLSFAaVaFKNiQCDipczjLytSY+Vsh16sZdRBRr+7KHRn6iuKlV1BK0ctzljc7KF+wOPGUsyV3PVGiScmZAzXVqUtpKmpM1tmnx1Jt+Rch1Ose6Qoe+JMyg8T9aV/wDRlXo7jfwPQMyw2VD56JCb/I3GF6q7K22uAB6ZA+4OZgI/UAyhd4wZ+y48lVc4ix2EG4SMy0CdTSr++pxCP0Rggpuecy5oj+IhLyxWW1AEyIdQdeB99kH/ABxIiVrjPSobUZHDusVJrotyfUKYtwe925CAr5KF/fA/NyxmetVBM+tcIahJmtr1trai0jUkjuFeJK/54cO487V+hX/U2Vs9DNGcst0fNtOQ1mXL8JdS0lImMIKXEWN08py2tJG29+uE+uNmGgZfjZcmZel1Skx5CY7cmA628qRFQu7YcQVIKSUpQlXUHe9r2w7sw1TNDqU+N4Y5uC0DZQREVpHsEyDgIredhl5jxNaytmahwgoJXMn02zLV+6lIWrb37Y7p7dUnVd2e2f0gSHXnEE3s3ZXqUVDtVgOMNNfhNifTHmVtr6aEqKNlX2CUG5xMoyqJUqg8zFqFZjSWk6nKc/Okx3EJI2VoUQ4En1vbF89nimISlYkRyhaQrX4hAuki4IJ63G+BLN9fyhmJLQqSaRIWxuy9IlIDjf8AZWCCnf0Iw0mpLNhkInRY3pMpsuaiVS6ohuDUJzviZLb9XaXKEVAdAZDKOYkJVoUCXDdRI64I6hxjzVECI65LE+Y/cNxY7Sk6x3KtSyEpHdR/QnbCzpghBxqPFzs66lCeUyyh+IsoR2SCWypXbckk2xbN5TtNelKrtWMh5KUrXrZBIHwjZobD0wyz1E5f9IQX7fhKSqQZdarYlPGBFrKCpx5oRnY4Wk7AoWw82VJ3+I6iT1sfKPdRm1inRHn0+KabZbU4tUbMkq2kC5Ol5Ch0B2KsW0rL1RLzC4tYS8lo6gJ8VK1gkWIC2yjYjsQfnsMaKpSa793vuIk06S6GlkRfALAeNjZFy936dD16YKupQ4XMyLRPMJ2pqK3Xcw1uM1pQEoefjqIUVKB30KBB8lt++J6XKgm3/wBYqkrtZQjH6fsMRcv8LarXKYiAYr8NymZbdzrAQy6p+PUGW1NlltpywKhdxaSgjUlTWk9ASd0X7NnETMxy894+Plyl1emfek+ozY+pNJQpZ5TKE3HNeU3pUQSNJJ9ADm++io/5HAhQ5MWGY3aJT5PJSg/0ikI/qwhNKTKecUSlGzIBUSoEWPWxwxsh/ZQq2YaDm6nGnVWjqZylANHkV2KuMuNUVlt+ShLi0ggB9hxOpO4Q51Ith6UXN3Cj7LdPXSMuSKZTKnMajmdUaxN0rnFpJTzS2ty/mUpxV0hI1KPXE6RxLiZ1prNWpOYBUUTdSH/BPhUa6TYJQUmxG24O973x81qfbOoC5orIXsxzOHHcyhpPDbJ2Rp1FGUspUw5lYZad8dEefmKiPBCkLQwXCdKPOuwBA824vjZWn6m1HbXMKgicpT6hYJLjiTyyVgAXV5EjffYYFpP2pnMsy6dGgU9t+Py3I8Ra0gPygpQUSy2AVKT8FlKKBv6G+B/jTnh9/hvX67HecVLlR1txilYJS8+vQAmxIHncJ2Ox+WJQo1l1qfiM+b1OYMle0HeGfE+hQOItezvmRuJWK5Rpj1Jy5Q0VFjmU8J2VL5C1AuKXckLTewBAHS3t1qofaZ4hPUIVB6LluKlE/M1VVdC0M3KhGSDuHF237gDoQCD9495P/wCjfI39EZopU6k5ehhiLGjwtOp5SQrW4SslTilKTdQAJNz7Ck4f54HCXhbQMvUiPHqL9YQqoVlmWlcOY7K1HyIdc8joSjQnQNJuhR1WJGPtPDRl8Sn3hwPQfH+942D4Q8NukuM4xqpWF1qLk+nN0rKGVtDUYz3VpYYDm7UZkC6nHV2uT0SCVKUe6frVeRU4smTITIhURCCD+V+WpWwSkdbE9OhUSOgvdk8VeMKuIOXItOoTH3bCp4DSYc46XFSVaQ686ALFRHwgEgJ0gHuZP2fsjPZglSeJU6Mw7QqC+Y+W4ErZqZOSQlUgg/EhkatI7lJO2k4IiV0IbHHT7kyZUDYxY/aWPDvJGbfs58O4FVj0OEjPmaVvPyl1OQpDtLhD9k1YAq1KKlKO3xXB3TsLVXidW6fQapCrMH7v5YTzXB+LzFLJuG1AjVc22IBGq3XB9nbN85yqS5VXbdcnyVJLWsgJecOohKQDslIBJ2sE3+qCzRU5WZq003HUt9mM4UIkWJS5JGy3T/CjcAdNV/bHKtMmpJtvHJ7/ALQpGeBBGouOw25Nb1PoqLUsTjzValJZ1lPLNtgnlqVsO+DqLRKlxQrErLtGREDURrxNSqk1AWzAa6g2/M4QCQn0BPa4XWaKx4xt2nQy5IhtkRnXgbuy3egZSfnbUr6DHWtT4bxfs88BG6LVGmJ+Y8yoXUK2opuWgkBXLCfRIsgX2uFnvh3WXDTouB5jwB/fScJHRe0QVQyy7lFqTKylmx1ynMJKrzUp5LwHfSjYA9hZR9Djb/SlMuptyZYVBqUhgwZbKrcpx1CrpKSTfUUqJHqlXXbEWt5zLsJuNTqcp+a8yH2UOo/DRpIJUrsAiwPzAAwL5eg8qsvUuouGqR6nFRPK3jcKcSQFW9BYpI9LDGq63srPiRfBPSEklxGYnjAbQpVObVrnSkkhCUI8xRe25VYXA6C/tjKhNmTotRUzKcbZcQssshpKSlNjYG4J3+h37YhwJDkNmrRmZ8U04PKK0x06QyjQnyFXbypF8VsjNrEuO6ikLEh9TSi26UkNoVqCd7gX6k/T3wdE8MbVnGO0YEp8oVhultuMxW+dU5MGKxBR+VROsqJ9kklR+WGLlPKTFPVMjulMpL1PU6+68kXfcQ4m5P8A41gPQAdsLSg0ligZjokoPKU8uVyXVk2SA4lSbJT0SLq6YO4WfYlLmPVAaqghTb8XmOakwkBSklIDhTa4DaDYX3JN7YYsJb3ZpTmRqLNlJXKpz6Wx92lqOnlkm6OWkhR9z/Kx9MDtRW65nWct11ZSIzfJQfhCL7/M6gf1xdLm0atvR3qzTF0iW8EpYn8yyFd0gPIPXfYKtigbpzkXMtRZ56pEeIlLDK3FFbhCrOkKPe2q1/S2ACoIWcekG645EM5UuDOgNuLPIkNxjpBTfWdhY/ocXGUcsxKpJEydFSsMWUwHU9FbHUPlYYraVlN95lx1YbJ5KXmk3vzEnrb3GDpt4xkFIsLgDcbi3piLfZtBWs8ziDnJlsuO66hKWyVlXTb4h8/TC9pVHqeXKNKpMZDL4YWswXFHSFBRKgly3dJNr9wBgvzvxQekJgKq01tossIhRW0IsdCRslCEi5O5vtffFflOk5h4jzpjOWIsNwU9KFSnKo44x5130spAQSF2SSdQAAt64UpV0rLPgL8YV9pPEHH2Kume+3Ikpp8VTTbra0th5OtQGpsm4JCVAm9t9XUWxqiRoaJ8ibVXfvCoIQpEdSGyhhCbWs2m5IUSTck+vbDcp/2Ys01bL0qqVzNMfLk65LdPYiokMNJAuUrdUpOtZG4I2Bt13wEZq4Q5fo/IfCHXl6whb9RnLW4+LbgpSQn3sBYYNXq9NYdivz04H7wZGIJZHdQ3xOBJteivj/8AETg+yZlk5i4gZabiPriy3p0eK9oF0vsKdSFNuDuLE2PVJ3HphdM5aao9TcnU+uy2JDDfJYC20OhSFG6kElPmHz3Hrg64LcQ2ctZ5guZlW3AdipluRp+nRHfcEd0sJBuQhZXoFj1PTri/VYjLhTzBWsRWcQmq+c365m2uT3ihaH3pDzFk2sCo6B16AEfoMFsnMUPK/C2mUYy2maxmR1M+S2pYChFaKkMN2/iWFufIIwkDLWFpNyCm2DPixITW6TkiW42NEmgtIWlW4JZeej9PcMpP1wQoOBFWTJRIb8RqlBydkXK9NkyUQ0uMOVqaXlAfivq0NC3sy02QP4z64R1R4jPVK7dIjFiOT/16Uj4h/A31PzVYex6Y35qbYrtDpEx1ttyXTUCnqUq6lcoC7B3vuBrRcWsltA3OBd5aWW1uOLShtA1KWo2AA7k4KlYEPUu1fjNynVulWt114qsVuPL1qWfc7W+QAGNjDiW0kabAC5OIzS0rSFJUFJULgje49cR5tSYhKQh1ZSV3OySqwBAubDYXUBc+uGB0hwYQ5azfOy1UQ8ytSmFK/Gjk+VY/yPvhx1HOzNLy6ashSFQyhJYRbzOEjZPXbfb2scc8vylsttueBmOtOqWhDjTBWlZQCXLW/dAN/kbXxIk5lmTaE3Eb5CKXDJf8XPWphlGsK0gGxK76VWCR3OPbl9Z3M8Zmr0vO9Y1VF4vssm62ybIKuzYH7oBuR3NhvvjdlzL39Oa+IChajwVJcqCgNnD1QwPna6v4Rbvj1kbJKqtWKOa8atQ8qVAiH97NOIZcTIeUeXI5S0qJaLigkk22WCCLYYma+Euc+FVAco8GntVqisFYdqFIbX4lRv5i8wVKXe99RQVjbsNsKajUKo2IeTOqVDgPBzOGcHXp7sWmEcwjlB4HZLY2sD+VPy3PbYYXy3WaU4QwDLqSlEl9zdKFHrpHr/7Jx6k1xhTDgiPJUT+0e9D3FuoP+GKFUoqBQ3dCTsT3OBU07RiNu+ekkyZzEdSnZTipb5+IBWw9if8AIY8M1UNa3xHbjyVJ0t6RdSE+5PfEaj0qfmarJp1EgSKrUQCoMRWypSR+8o9EAfvKtbB8eDrVEYC6/UkyqibD7upirstG/Rx/857aUCwP5z0w5gDgmALYi5bcVIf5TCFyX+pQ0kqI+eGFkDIw+5lZtrbAMRJIpkFzo8sK085fqkEHSO5BPQWMuJSUV2uUnKNIbbjKnSOU8qOAkR2E+Z5Vx3CArf1I7nBjxDrUaQGIcRKI8RnZmOk7NMI8jafkEj9QcLX2kMtSdT+kUssPSU8N1mmgpgwIEBKhp/q0RCFW/tWv/PBLwyT/AEs4RuUFTpRIVCQqI5fduQ0QppQ9LKCP0OFvCzEtSW1uJQ8hViFoNrj19MXPCauO0ykRXEG3JOoi/wCXmFKv5E4Hrqya9y9QczLnGDCanKyvxOpsZ7MFGbiz5DSVKqNNSGnUqtuFgbKsfUHp0wIcS+GdXyRT4tUiSWswUBKwlUwt7skiyUvI30g3sFbi/obDF3HbNEzFXYbCtAjVFxxsnoEu6XgPl+If0wVS8xSa1KfytSZiWEyI96rOSAtLEdY+BIOxcWL2v8I3tewwNiUw4PljeVKZMVnDzKU7iPLlQqdTo1Hpev8Ar09aCtDKrflGwLlug6DqfQs/jJTqFw1yfSMlZfZDMqs2mVaS4QqQ/GbPkDi+vncA22ADdgMF+TWadTXYlHpbKIdIgndCTte1yVHqTuFEnuU367JvOdDzfxJzFNzpBpRqVPqCimC1FkJLzcVslDf4RsTqCdflv8Z2xPrdtReT7qL+Z7RVMt0lE1EdlOtoZbKlOXCANgbDfHmq09yAlHMcS2b3UTcWIF7BQOxxXMVl+l1BMOY29Dlsq1CNKbUy8hXc6VAHB7ErE6a2xGdp0ab4vTy0uMAl4C238xhixnrIYdJroYN+CzCz4WZHqzrbC13b8Syl4FSCCbHZWxHr64v6vVc4Znyy7RJtcguwHChZApoC0LQQpKkq1+UggbjBBMrMGqMuU6dEkQlNrH4KLeS3xW+dz/tXxEey421PiyaVJcchqdWlxrUnlttlKtKUpt+VWgetut8L/i3PDcTue01u0mVUjHnIjKeVCfQ4HUoJCbEEjbpcC2DmuZuXmGDTS5EEMMtgONcsJQtwXusd7EW2OAWq1h3KscyVyVRULPLPJJUo/QA9gT8gTj47XJkhiKwWzLmqccSW0r8xSlCndQNvNdASU+uoDvie9Juw2Ok7KTiyxJnV9iuQI6XSyzyXYrO61Nk3uPkTsPS+ASXITVYUKU0S2lK9f8SCQU2+hO+GHJnMVmO6qFJbeKPIpaFXsbXscLV+K5Tpb7sFrnRHyVPRCdKkqPUov2Ppi9oz5AjdoRWxxJUCXIp1biyG3dAUlTS7/CrukH64duTM/RJEZHNUQxfQ4hY3bUNiD/79DhBx5saa54fWWnR1YfToWP8An9MX8OcunSUzWPO4kBD6D/pUjv8AMYNqKRYPjGEbEuOIeXZWQ8zuVnxLtSy/WHS4ZLitamHiNgpXcK283fe+43hwnRJ5aU8tLyU7gm2vcm/z/wCWDun1yC/R1wqi2mblyop0LQ4f2JJ/lv8AodxhbZpyxJyFWGqc86qTS5Pmp05QvrH+qUf3wP1FsATzja3X9YK2v/svSFlBzDFos1l+XFbmNk8nluKASCrygkkHuQPqMNSmUfL2esvu01int5fzGHjJRKbR8Tmq407i4sbFPoL4QsKWmVEXClALYKVWSlIupRH5vbFpRpr0V6PEqFVlNUcOJ57iBqfbbAN0pXe4HQXIJSL7+id2lD+YHDCYVh0MYNJ4oJypOl0WuKjpqkJ3lpKXUhGq3VCz2II22INwR6+KfknLmafvltcI0+v1JZdiVPmKWpt5SiuwJ2QkqVukCxBOCN/ilkykZcFHbhwl05TelinxCl9TySO6R3PdR+d8LOgvvwg4tWuG3ztcSMXdZjIFtKdXrcX9umEq0fzOgKH9ZwkdJWLg1Gn02k1GZHbYiVSQ9FYTzTztTaVFSijTbTdCh1v0NrHGh3+pzEPXs09Ztfsfyn9dv72CniVXxVqZlqW3FiIbgv8AhFFUjS+tbgSkhCACCnYLJNuntgPkuuVGY5Da0pZa0mQtQuo3FwlI7bb6u21t+n1Glsa2sM/WYPHSX1GzFKy5L57KeYy55XWlfCodj8xghkZypsxTbtRpmhxJATKjPlt1JOwAULH/AHsAFTpLc8IUlRYkIUFIdSD+ihfdJ/X3xvTND8iOxIR4aSF60t6rpdsDuhX5rbbdR3GCtWrHM2DiMSWU1qmIbo1XqqJoWkiEuQQuSnUNTaVG/nIvp3uTYd8WdNfZMJnw9kRtICEBNtIAtYjsQeo7G4O98AEaSU6U3t6EdsH1EzDArx8PV3BAmrVtUwkqbcV6voSCRe+7iQT3KVElWAOu2a3Y5jg4PcLWOI0CpSEzVofjvNMIaZjl4hTmqy3LKBQ2CmxXY21DbGysZYzFw8ZTPqdLkMwQbtVKGsPRye1nEEi/1vhdTMj53y1T3a3EgTxRy2QarTlFcZxs9SHWyUlJ+fz3BxXZI4jZhyPLVIoVYkQg4bOsoVqadHotB8qh8xhQ1b+ZLBtLsyMCPSOiBxwmVeM1Fq0On5nhtkAIqTOp1HycBCwfmTi1z1mEcOqglGXaTCj0esxW5TMtIWp91pY8zZWpRtpUFpIHp74XXFKnQmZtGzdSGm4tJzFGExLLI0ojyUnTIZFtgA4CQOyVjBRR5g4h8L5tIuF1TL4VUoQPxORVWEhof2Tpc+QVhRtOvUjieR1XbagwD1EIshZuypPW99+f1Va9IIeQtxCU385ToIOq3QnoR0xbR4cXK0ipqqSnZNPktListx3AnxSHED8QHpp0KBCvVae4NkRTo8ibLYjsIU486sNtoTuVKJskD5kgfMjDlrqIDpj5chvIXOy+z4ZLyl7TDcrfSntdDil6R3SFdTbC11IxtHSNhvD1GcnzRI/bRyXFp82h8VaAxalVQN0ytIbH7J5Isw6r02SWz/ZR3OOfY2Z6jEcKuVGfbJslIKkKt89wf0x3LCpEHO2WK7ket6VUivR1MXV/onrXbWPcKSkj3QnH59zItVyjVapRK1FcEykylwZKm03IUg21FPWxFiCOoOHNGwsr8N+Sv6Sk3lMZeTs+yokxyTTJUth5Fg/F1jmt36KRe4UNr2Ox7acGVSgo4k1ymy35VPZzHUkpYgVxpotQqq4gf9UmNnUWXkgeVwH1Fvy4REKeX3G59MfQ4+z0AOyh+4r0wycv12JJhuyH+YqmTkJbntJUQptaVDRIT6OtqSPN6WP5RjFtArbeomT5hJNSy8XKrJp9SjP0yrU90Mz4DxB0ki4BtstKgbhQ2I/TGx1dOyfGVKai6PMlKW46AFrUSAlIPbqOuww0c+5Yr+cMu5XznE8NW5cCnPxKm42otypLSVgpWAQQsoKXFadj51aewwtYspqeguIdRIbc0qaA3CkHe/8AhiSHWwBuo7j9oM5E9xa3WZ7ilTJX3dGUnysUwIUtJ/icdQoKPyQn5nrgiixpymfEQq61XQ2NS6VLgpiy1ptvyXErLbi/RJSnUdha4x9i8DJVWYVUITBpjqn2W1Lp69GsuHSlS0aVIIBsCSLjV9cXMLge3LDMyPX6wDEnBtxa3kFCnGyF2CEoSPr0642+r0GzGMfSFXIk7LFVkxkxKpRpirqSH2F2uhWpNtwfUEjf3xDqzIpsduRU5iW0qcOiO2CpSlqNyltA3UT6JH0sMHtD4HRfu7mt1JyMDKdebRqUVIcUpTgsLgadSrEfu3xTZoyi3Iy7TXKqlt1qYEuNBha0usO6QdlABSVgK6g+ox82t1PjcHy5+sLgkRduTIbbzXjI8ymIfc5bTk1LehS1bJSVIWrSSdgFabnbrtjdUct+PjWkJS+hCikWPmRtb522/UYk07IVKXWozK6zXpjzMhC0wp0sqaK0G6dSSkX0qAO56jDNy5RYMSvJVVGETI7XnejJ6rJSdIUNja4HzAOHtTfVWQ1BMwE3dZzDXOG7y5TdSpr64tRTdPPZ2Xb0Wk7OJxGXl3N1ZdeYkOQosd5rwzs6OhxLvJKiVpQg3CSq9ibnoMdeuZQylmqRTocelOUuagl6WYroAU0AdW6j6lq221zj0jhrkuY86zSKqX6khCCWS8l9tr8UaiohIJISCNJ7kb42vt0ouCOflNKjrwp4nP1Py8mJEjwoKChplAbQ22nVYAbYsVZErAZeklbjYDd2mg3ZWsXtv2B9Ld8N6u8Pq7TKqt2msmVHdUUNLaICgkAfENrYDKhUXqeqSJsox1RyoOl1wJS2Une56C1sKjWPacpzmZNQHWJ3MNOeqbsZD6Al1tZC1JTZdiP+YGAWr0WoMtR6hHbUzOjqUuOVba7bKQfZQ2/TD3e4k5JlOI+8KnT37kJ8QFEt7+riRpH1ONlQytTpgDkVSXoznnQhyygAehCh1+fvi3VrbKMeIhEBsIOVMV+Q81OePRWKOtbbhWPGwh+2YdAtq0n5AEd0gHqN3XnXi/l2rcJM4UbMjioQqNMcQkqSQDIbAcjqTfqeYlHT1wu6nwSplRfRMdjPx3SNKZDDulXtZQ3xd5V4O5Zpbpkyad961DUC25PKpJTbfUNRIve3bBLdZpWIs5yPSPC9iuxhK7J+XJWbKRBW3FL0l2G0+6yu2xKATe/e/bGp3gVXYZQ7QpE6kBD3NMblJfYbXY7htXwHc7g23w+Xcp1tMaOyhDTCeUHtCVBsgkkBKj3UetsRWZknL4qLNQq6aS+lsXQ75+YLH83QDte/fEP/AMhqNxakfTrF1rCnIgbkzhXUpsyCM/ZqVU6XCkJmxKO02mPHXISdluhIOq1yQNVr4cGalcPs0UKnt1iOqU/FWSQwSHFaiNZJ6FKkp0m/5VKHfCcqHHqi1ZuNTkuPVpUUFAFCiOS1A27qQFJvtuLjAhAazNnir1BUqpVLKcFt8IYpaITaZym9CTzFrVr06rmwA+uONpdVqnF2pfZt6dvsBDpudsDn5xswapS8oUOGzFqM2S7EQpb8+arQbDoq+o6AkWHWwCRil/8A1oKJBml2JnBcyZoLRTC5kxZT6eQKHbALXeFlPzBTTT/6Z5h5biwHWpshmS09Y6gko0pNrgXF98Y3wszJTooZgZppYSkWQ3MoamkJHzaeNv8AZxQr9m6R13WtuJ+n7Qn4ezMK6/8AaDkZnmOSWcuVyqSikJ1uxW4aCBtuXFJP10nApUOPHEGY4mlQYsCmFdrRZVXekLNvRppIv06f44lUbhHm1uPedFyxmxZ+K+YJMRK/YsvMhsYIX6BxHh09iHRuHD0BpK7OLoMiDU7It/o0IeRZXzSoe2HE0ujrwtaqfmf9wq6bu2YD5vl8Q+LDEOJmSqxE06DdbceTSi82lRBBWoPuBzYEgWTbfubYBKLSXsu1VcyiSYNbkNDQHKbdlLAHZJUHmQSTfSdJvhqTsqmIrnZryjnl0pOsLr9DlPNIPqENtlpPzCe2PX9P8lp/AdrkGEpPl5Mw+HI9tLgTbD62tWuxE4+A4hV06+uJCpP2i82ZOsDUplNT1Kq/lxmUz9HowRt7lWGHlL7YWaagsaI1DzNa11UWpCOsDv8AguNrsfmsYFIFKyzmO33LV4xeVuPuuWhVz66QSk/VOBSvZXy9Oq7tMlR05rrKAB4enwQ5Ia/7xwWSj6lFvfAWXT38WV8/35Q2La+jcTpBj7VNMS221PyjNgNIVzHRKic9sK7m8dLiR8zgWzz9o2hZzdch5bjF9pAQ44vLEdK5VwlV0LkOpS02Cq21tW1u+FbSOBNfVFbcizpOXgDtCXUlSQhN9hZSVhO3ofriZM4IVlx5bq6ilbiranGqjIaJttuE2GFl02irfInjZcRiWlL4q5krVNqDFVqE3INHgxkSAINLXVazLLi7ctMhwJaQoXBUQmyB3uLYZGWa5wA4fVH7xgy6bWsxJso5gznKMmZr9RzbJR/cCcJkcD8xoJ01Gpg+jdbeP/GrFbVOH+Y6JNhwU1StvVGXcsRUTmXVFI2U4rUhWltPdZFtwNyQMMOtNo2I2PlxBqzIcsuZ1i99pzLk8FR4kUNCBvpZqkdsAf7V8VT/ANpfKKVlLOdvvB4/6OnPOS1n5JaCjjkRC6wZzyFZodegxl+GM0wmHfESL2KGEhu6gCCL7kkbDYnEx7J+ZakpN3M5OtnoWaL4a/yPIBwt/wCL04OS39+0Y/GtjCrOjMxfaiW/EWmlwqrLCTcvzlJhtj5lV3B/sYUdb+0rXK5IUmmVND4tZbFHYXUHAf8Av1kNJ/vJGBGdwbdZp7c5UNVXl6m9qmpcmQ2grAWoMvKSCpKbkIum5Fr4lTY0+KtpFHbqsllDiUrZqlJbhICbjUQsPq02FyAELvbt1w1XpNMnKDMXfUWscHibcuZuqOfGRKqvEp3K8R8HS2puZNmLHYFiKhppO3qpXyODugZZ4J0TS9UmM054lfEtVTp8pmOtXryWWUgj+3q974U9dy7lijsJlVKIxTkOkkK1KbCj3ICewJ3PQX3648UvI2XcwtOOUumoraW063Pu9TkpSE+pSgqIHXfB38MrkZUfD+YHcQeeZ0d/0s5RpiQmmZIiwmEABDcXKJRpHzUzvjyv7Q8VLZREy/KbUNrt0phgj/bKbY5uo+RMvZnqH3bRaPAlVFaCpIfQoNADqpSiDsL9Bueg64NKr9miNTmkOtGgPBKSXubTeSlPWxB1LuPmBhFk0isFdjk/GcOoK8YEKcy8W6OqK8ajSG0NvXCxVpcNDa7joQHF9fS2FOK1RpC1DLUSbTXLnS3QZDsyKFe7TjIbA/sLT88TZWXMi0aeIuXorOZsxKSfD06gsJlPKcA2B5KToBVbqRh/5Q+x7WuRlqtZozRDqsJxDb9cyzU4jkRlvWm6mkOsuJXqRciy7gqTvjVmo0ukQNY20HpnPP05gmsa0YxE2iTmNVPocJuizKlmCpLKWaPAALjjiUKcWRc2FkJKiLn0xVwKKnizXKQnLdJbzVmNKVBqnSG2nWIyTbWZqXApDTYIsSdKr7JNyDjqbgdwgynwQqkmpvil5oqrUp12m1GPS3IsqGhZWFILi3l8waV6Uki4F/Mb4Y1TzHLr7b8OBBaixVKVIcjQmd12OorWQPMbm56euPnbvbVOnsP4dd3xzgfb0i4o7kz3lqJSeF+VqBT0U2kQpcWOppyNSXlrjQnHFJW8lsrusNKXvp2+EbYCuLGaKtmDL9RaoExxc11bLaJCEpHIbK0pddbbWoJK0NlwpBIuQMb6/wAOaVmCFTpuZq5XqLS1XdjxaK+WRP2HxuISpQtbZN0/FfEN6JQYjMCm0Tx0ansFYXNqj6n3Vajq8xJUo27EkmxA6DHzKMhsGoZtz5yRjj7xk56DpFJT86y8g86lZJyJW6ctYu7OepHi59QX3celqJSoqJvYKAF7AYhZQ4e53i5yezTUI8fLlMff51Up8eWHDKJAClKYbb5aHN0+ZCgQbXvhsHMaKOmzIC6rHk625rbuprSNrAEb/P3wB5/4kVmJqkRKRJzDKmKU5IZjOhHKSChHNULW0BSmwTtpCgegJx9IvtDUakGqtB5vXn9YuQO8J8vry7QpdSkSsvF+RVWHIU+Yh9SVuxlBNkaRsCNI8wIPvgC4hikVHOfDjL9KgikUeVmCI47DKyseGjAvvbk9LIB3J+uLGLWpiEqbmw3aXOYWWZECUPOy4m10kjYjcEEbEKBHXAVxIplcm1WhV+gBhyoUZUnVEfWWg4h5rlqIVY2IF+v72M6HKaoeK3T498cT2VGCZMzzUn+JXF/JtJXZaazmNp+Q2Rqu02svuD6BCRjbx1yfRK1mLM02mwEREuTgp5hl1xph8BxIcKm0EJUVJ1ncdVYHuBUqpVXj2avV4KKecr0CXUEMpkB4Kedsym5AAudRsO9vfFrn+qOR6cU69bjupZJNybevzJH6Y+zqQo6qp4A/WGtcOM+s5zzhIOUYb7dNdTEp8l1bBZUSUsE31LbHboq46XII6Ww918ZHKdlTLdLFIqWWKXSIiI0YscuZHLVtWt1DagtC1blSrEb74qvs30FjNHHWAzUm25UGj0eXPkMOJ1IWXRyNKh6aXFn5Yhz8jx4U6fDberMOBGBS0lp9SYziSRYNlV7DzW0hQPlOGbDXZYKmHI5+8XAKDeO8hZxzS7WF86JV2anUpqA0w7EVqRFYVbUvvZR7XsSdOwCTgMqj7ramcvUl9MeQpm774NzHYG3l/jV0Htc4qs1lNEddfiyZcWlsuLMRpt0ltt9B+G25KVEKAF7A39cQ5SpEKHV6hK/AnSwXjrPwJ0/htg+wsPmcNFQoAH0i7OVGO8bv2WchR6lmufnCTHZVRMof1amsvN62pNTUk6LjuGwdZ9wn1xfZjrlcrkme7WWXl1VxPLfNQSpbZUu9y2q+hadzYC/ToOgq8mcVE5OyBQ6FTIDz9Jitl5/8MJeTKJ0yOYjZSvxEmxF9trCwxS8RuIcrN9CccgNvFRCWEFppYIS4NSnEhQBNmybEbb4Rahrbt7jgdIwECqBBKNMZgVJmrukNUZLhgFX5Wo+lTYcPspwpJP7uk4Gsv0gvQZsx+pPobaQqLCJHmDOsKBHQ+YAfIY2VyYitPRqNBcBpEdtt2QW+i9gW2r+gFifpiezFdeuGmlOFIvZA6C1/8sUXO1eDiKWNg4E0z4jatMeP/VoYALrLFkpeIAtqt1At0xrDfJJSlIRclRAFtybk4MKFQWYviXZ7Wp5gag3sU2te/ucU9TYQ7UH1JYLFzq5auo2vhRbwzFRAnMoEUwZirMGlOJC49zJkA7fho2A+qikfrjoLhtCpi8qVGqSXGmkyGzBp0NKbaGEG5XbsHFovfoUpQe+EPSVLaqWZltHTIZpd2iDuNlk2+tsNxf8AV4DcSL5Y0dlDftpsAkfoP5YPapZAoMarGRAVlbtJh/dU2kuTKckqAfi2eSUAnSFINimwt0v0wJUGU27T3Kk+6lKH3CtRVsEpTZCUj6JTi/z7VJDbMWjw1lEmoqKXFA7oZA85+vT6nG2gZfFelxKFEYjqL34aG5CwluwF/MT6BJPQ9OmMvtrTJ7wLjBwJKqOY3Jz7Manz0xGyg89CWyiQk/lKdViElQCSQD8QwXUB2fmKS/UAsRqdTY7ZlpVul3nu6GiOlleUfqoYt2eEvhxBhiqx50eNLDgmxF3EJOizqEajvuFC3TzA2HQXsmnU6NAnUKhUifVYrzrKpzmhTzji0DUgLKbJRYlSgBY+YHviDbqKCNtYndpE3cMZVPocfP2bG9MrMFNaXT4EVTYVy0oY52rfqVuEgkdkAYKIFRpWTMq0hVCqAcTJZany5ZT+PNmOJ5jrqyRdVyRt0A27YS+Y2qxFpOY4cSHOgxp85t1+MloNyXY6ktJeSkX7gKA33F/XGmp1/MOZoAjU7KFWagNlKESJIbaOkJsEgLWLenfbC9mlOoHvcEjv2A6TuSOkaNQziuppcqcyp6GXnNXlc3Vby7JAsNgB9MLqtzF5nqqCFrYjpTpQl1Wo+pJ9z/ywP1+g1nL1EeqLzXhGoykiQhZ/FShVhzE2BGkEi/tfA2znt19tTDdQYIulCpCGi5oJNh5h5QTva+GNPoVUb6+YJi3eFL7K4TzzCkpV0PMtuR6jFHVjIqTCo8ePGfiuCzhlhVj7BIF/rfG+NX2qjVRFYfkTHG2ipxS1IUlsdtRFrEntucfaXDn11MqoRZaUw0uFuM0hkEOBIsVFRO4Krja3TFBAazlpyacuVO8dNOk6kz4bSEuhY+MdAtJ7g26/rhiVqUZ/D7LL19XhJM2Cf4UjlOpB/vPOYXtQyBU505UxdRWiQlsIjphgt6dvNcG97m3XHh8ZvpdGTBkzIZp6nkyFamdTiHtBSRYEDobG3XSPTFJLq3xzzMOu4gy7dqLMCK8uS6luNp/ECj8Q+XU726emALnhql1FCHjIpf4jceUq/kJbCggk9vNp3/Mm3fEjL1FqucatMkQaE1XX0uoCJhJbjRtI7OK7330pucHLOUHIbQarebokJRUVLgUSGldlEknzrB69/LjdlypwIcVM3KiCLFPqTEp4sQ3noqHlRmWGhfWVDmhXslIKU36Df0xaUqJTKPHeOaKog1KZHcjLpbDgc0trUNkJQkqKiEJ9euJVdXlOlrS2ubV6xt+wnzzpPzbbCcQ4ef4dKSpul0ZinNntGZS3q+Z+I/XAGd7FwP4hBVj3jChFQrqoLaaZS42XacyStuVVxqfANyoojpNwSb/ERe+4wNqq0SDVmJbyHa/XSbMy6mQoo/7pkeRAHrvb1xRVrPNQqLgYSdDiyAGI/mcV9TiIwldJSuxD9UkeUkKuGwfyg9SfU+3tjyU7RzxNhV7S6z3Xnau2pmoTnHdYsWWT5dXYe9jY9gLdMdC5K4uys5cN6VXnnSarAUKRWUg/tFpTdl/fopSOptYqCha2OT6otto6EOc3Tu7IP5j6D0AwWcEc6ry5miU24yuTluotNwqi/wAsqZjLKwGHVq6JAWoJ37LV7YFqdKttHA5HMX1C7hnuI+cw5TylxFCf6R05tMt4lEau06zMom3wqI8qldboWCSPhJ6YTNe4BTMo1tEiYuTmfKaAXFvUYaZFvy81AuoJHco369MNqoGLTHZEZoqihw6HoE0EtuWPQK7EdiD74iw89yKG8ymUVOBKtDb7lruJV/one2va6V9FWF973k6e++oeQ5HoYmrle8EWOIdKpNHTBy81Hj09YChGpiAhsnpdxXdXuslXXAZUcwz6+9qeUWGEmyGm1bH3J74Mc+ZYg5qzDJm0PlQak8A4kgaWpRtul0fvHcauoPrhfRJCnHHWnWlRpLBKHmHNlNm3T/174+k0zpYu7HMOLN0L+FCBT5tRryyEEym6RGUfyp2cdI+Z0J+QOB/MUpye/UfMQjWmMi3ZCR5h/tFf64vaG993ZEo0dZF3mhU7+qlyFn/hUP0wJpkGUyVHqp51z/aWoj/HAa13WtZFickyxrzcdwpq8JCWmHnAmZHR8LLx6LSOyVnr6Kt64iZNkmNBcauQNUlk/VS7f4jHynz21JClfiw5Leh1PZbagCf5bj3tiDT23KZMqkN1V1supWFfvJUgWV9bX+uD7SU2GaPK4MLc2Zj+6KvMqCWw8ZUOI9o7qcKVIAH1SBiZkwry3l+bKcPOkuL1unoX31dr+mogewTgIqTpqeYaWlRKm48RLqx7pW6EfpqJ+mC6PIEhcaGi5THGtQBvd1f/ACSf9/2wrahFYrmWfygQkXNlUnIUv8dX3nXHDS4pHVKFXXJet/Y1EeiigegxeZXmPU5DTUBwR2mwEhm+2lIta3ewGFrLrsvNGbw3RWxIRS2fBRiVBLDab3eecWQbaliwtuQ2LA4JZEWh5bgpm5mlrrbyiAiMUaGHV9kMxwbunpu4SO5sMC2qibSMse0arcVrjvGZWOLGSqvlmVBzc0zXILSg28wwgyeWsmydCk3La77DcG+Amr5dr2S6fHr+Wnncw5YbQXG/EMpcqFNCk7oeQncgJ6rT0HxDvimptbazHOYm1WRGYRGJECkRgBHgJItewACnbdV29hYYPaPLlUuQ1Np8lTLvULbV1HofUexwFqRWMY69j0jIUWDJisjTodakRKjGnhqYolxxEpd2nLpUNSFgbXOnY4n5dmVFM9bauSt2QRccwKQFHe9xt7YO8wcMqHn1bk2lvR8p5ncVrW2Ranzl/wAaf9Esn8yf0OFtV6Q9kZ6ZBzPBm0msLZUIjbt+UtYP7RlxPlcTtvuT7DAyiMCF+0XZSkJXahKfp7K5DDDbxUoFBvqbINr2PYi/64IYNeiMM011EJnxEUMJC2gEuJDN0hCjYlSSlR29/a2FbErtUqEaS7GUiW/HLaBD5ZLj+tRTdKgfKBseh2CvqbxsmmNmVikKzIgz1UxUxxcpCUNpfDiRoQQBZJSomx1HYeuydtAQYYzgYzXW36a4p56LD8EpLTbLYSU20JKiNVgBfzq3t2HfAZMEaqKUOQ6VhXLS40BcqsNhv7jrYdd9sHuZ4P8AROr+EU+1NkBHM5rF0kAk2uOx2v8AXHiDl6ryJMuUlpthQj+MWp1z9olQABHUXsOhtbbHarRWu6dMTNTpaZCXG5LAdQ2spOsDUgg2PTpuOoxVtzHaHIaTIdU7CcVpQ8vdTR9FHuPfD4fyDRW5lPdVWkrivhtyWFNFDjZV8YG5CrH3vY3scAGd8jfdiH30LZk0eQ6tplWsa1jf8vUf+uKtOsSwhTPKSpyJDy3UHwHqapsPtv7aCbdR1T9P8MGlNgt5wynUMp1RX9YZBDDzhuptQuW1g+oP8jbCky/OfiWBWS9BfLQV3KRuj+Rtg6q1bXAq8GrRtkvshdv3inqn9D/LBLkIbyx5G45gpTBIWyW5A0TozimH0/uuJNj/AIYsHJzjbS9SUpIAJdsVIbGoJ1L9ALg9bYs62yqvvO5gpDJdcUgGpU9Bu4bCwfbHfa1wPT1xBhSUvoLjDl0rGk6bi49D/wAsZZjnOIk42nEuJFAk0TML9EaMNc9UtiK3LbTpZcDykJbd2JNrLuRc7gjfbH1mHU5FRVTfBSX6shbjTkOM0p1wLQbLsB2B79LEHvi0p8in1V9ifUllqoQFNra5XlS+hB1JSpPRRCxqHTr6bYP8o5qgNZzquY2VJiVSrIaZkl6yQ2hASCW/chKd/VA9MTrtQUB8uTj85wYiZqlNVP1sr5sGdEfvZ1opdYdQdwpB36bEehxBfYmqWqe8gtzIDYCSwoaJIK0lVhe/wBXlPRVjvhm8VcrPw6rJzJR2/vGl1KUpxcRKlrlsgN/iPEKvqSS2VWvcBY+WBipZdq9Key3zoLch3MUNMynNQ1FbirhJ0LuAAdK0qJvYC++2HKNTlAyHr/TPYMyLBqNQirfiU56ShL5YKUlKVGwB1AKIuN+3pit8VEq7DrZS2+0FFDiDvoUOxt0IxcIVU8u1qXT32V0+oROWXW0uIWghaAtO6SQdjuO2NmZ0ZbquXarVKm393VaNEUEPRnVthxyx5atKSApWo979Tg6atg+HGQfScg+HpVLTe650brY7vIHsfzD57/PFxRqlHqDK3GXUvNnYgdUn0IO4PscVrLqxFZccTdZbSpVvUi5x8bixWHzJNPafdVuSk8p23cpcTuD9bfLrimeZoTsv7PHFeXVOGVW4aU5plifJp05FPfc6qfWkrU0Rex1pCwk9QSNscxNuuRZrja0lBuQUq2I+eNGVMxzcnVeLX6BPD6oDqJHh5hDchhxJCkkkbEbdCBcdFG+L/jBmjKdRz3IqlBqsIQ6wlFQTD5yUuRXHU6nGFJvspCysW9LWvfCyoEY/GT0rFNx2jhv1jP4dn+nHC/NGVCrXUKYf6QUwKO50J0SWx82vMB3KMVnDPNz+VMxwKpGstcZzUponZ1s7LQR3CklSfrgI4dZ4lZFzXSq5FSl5cN3UppR8rzZBSts+ykKUk/PBzJyJBzbVlTuHtYbll5alt0GcoR57QJvykBR0PADYFCrnrpGBunUTJxWzI/utG3VMqRuEfE+mT3nUKoEmWvwr6DqVFJAtzAei2uY2ux66RgdoGSnpPEY5bqspcV1t11Lrrada3ChClgNgkalL0gJ33Khha5+4jZyrlQh0jNsqUXqSCymJKa5amjYAhQsCTYAXO+2Dup1deb8gUzMyHFKqlHKKVU1I2UUAExXjb+EFsn1Qn1wsayBzF8WqoLHkjGf0hHm9h3h9XYjD0h6TEkxmpcZ2Q1ypDKFdA4i5soFJ+liDawwmvtf5OYXJy/xPp6EhmrJRS6wEHZMhI/CdPsQCj5aO5wS5zrcmtyI1WkSOe5NQFrXqKjzE+VYN+5IC7dLLFgMb6TV6dmnJdayLmCy6VVWShtR6tOg3Qoem9v8AHthc1+GwtX6/KV9MzvSBYcmcoLy+KpKWphfgqihF0vJFibdlDuPnjdlqvuRJ0iBPYEaWE3eZ/I4LWKk+oItf6364taNHm0Sr1CjVp29RpUhyCtSwAVaSNKj7lJScS8wZWYzC0hWrkTGvMxJR1bV2PuPbvgrWhW8Ozp6xhGKwu4eZpzAmmSKOzWkPQ1KsKelJaW41p0qs5qN1EWuO/YjEqTwujoUX+HE5lxs6lO5TqrvLdZV+bwzyuu/5F/rhPMyX6VIbZkOCmVFJ3jyFFDLpv8bLnS3e3vbbrg4gVipZlOtpTUaoskannhdMqydgdKtj0/EG/sd8LPQa2LIRg9fQxgFMZMn0jjZmnKM5dINRm5fnN2LlOqEZtCiLWHxJOtNhtYkY11jPuYM1JUiVUJTrHMDqm4rRQ1zNNtZSgAard8XcXiVFzLAFNr8eDmGK0Ql2HVmQ8ppVr6Q4POlQ9bk4xOXqC41poNfqeVkX8sN7l1CMi/ZGuy0j6n6YXaqpTnw8N8uIUKcZU5g7AqdRhuhyDUpjM1HmbUHXG7H5jcfPDqyFximOp5WZ2UVGU0krjyUISp0LKCDfoD2GoD54Wj2R3HgObxCDiD/qaGhJ/UrP+GPD/DauNtJVQs50mrO31Jh1OOY61ewWg9f7uFL9NTqBtYgff9cTxWzriEteqzE56PJTOenTHmguWp1vQEO3I0p9QEhO+2KZObQ3VDTkTXBMdb5im0KV8I2Go/U2B9DgdXWZtAntQsz0l+gSHV8tt52zkV4+iHh5ST6GxxtpKteX8szFhKXJ8mqPPuDq44VNJaH91tuw+R9Tjy6MIp3jgDiLMxB5hOmW68UpccW4EDSkLUVWHoL4safV5tJLpivuRuc2ppZQbaknqMUGWYjWZUTKjUKurLuTqfzDJqLISZUwoH4iI+rypSnop4g2JskEjAhArtBredPH0qlM0KK2yWYTMmoGROkJVYqdkFayrUoDZACQkE9zfHhot6MW7fCeDnOBG49mye80pL0t5x1WhPOLy9QSlNkp+IC3TqCduuBnND8KXRJDVTmNworhH9YdcSkJUlQUk3VsSCBseuBOXPzxUJi2KfSqdAa1FIkyZCnyseoSkD52IxWp4dzkurdrMZnMdR1XMp6cptbY/dQ2WyhIHpf9Mb0+gFbBiwHy6w+x37S9XxVaiMBqRn+nOMpTpIEZSyU26bOqB/T6YiZb4i03LtLVEy5TKvXg68t4uckMR9Sjc6CQEoR/ClNhjVSIMerzH4dKZrBmRU3fMeHGnss72sSzuD7Eg+2LabSZ1NKFSq7TYxP5a1TZVNP+0vUP5YqWJW422HPz/wBQy6ckTac6Z3qJUWk0ejtKGzakOSnUe5OpCSfoRivSK1T5RC87VZE2oeVSUOttpcKQTZCAjy2Cj8Pri4plBzFVrLpsah1xv1pdebWo/IKQn/HFp/R+vRQPG5CrTpSbhTTTEkA+o0uH+QwDYlYIRQPtGPw64lXl/hy9mKQ45VK1Nq7LexjTao6mx7nSlQ/mMMih8IsgTIx5+VqYy4lQP4ig4VEWIOom5Hzwvpa4EaV4idSa9RVq+NTtLktpVb1KUKSf5Yn0qHRa1CKqRVHEtNr0qXElKuhQNykpUSB8iMS9RVqG5DlR8P8AUwNKxPBEY06vT8gPhyemk/0dccU1B5K1NJbATcNqBTpBt/FY2NhiIji/JzLKZjUNSYaFo/6yqOt5p0DshQ0jb54g0XxTU+PCU4xUadIUlEiLMQCFgG9yLWNiL9AR64uUVDhu9VlQa3WavCqSl6Q0tS203v0ToAKvmb4lNWgPnUs3qJsU+Gf8gkNrI9IzDWBLzaEV1LpKnA7FZ0JURbWhBTsdhffcY1HhPlmluwkRYyIC5i1IZTTpD0dYI6ag0oab4saFz47kxMhpTUMODwuqYZC9FrHUooSRvY2N+vXBKtxmBB+8ag8inU9KSvxUlQQkpHUgHqB3PT3GGi9qkBGPyldakIyBiCgyHLjSnGIeY8yRpCFaOWiYmQAf/nIcuMeqvR8xZOiNSarnmMwh8lEWJOorcmVJWN9DaGFtKWr1sNupIGLA8ZK1myOiJkyKmPTU+RWY6sgrSsdywybFy/ZSrIH8WMpFDi0OQ/VJUl6dU3gEyKpUHS6+6OydXZPohICR2GGlawD/ADYz6YBP19JrCf8AU/WScluZsn0hibW5UqiVCLKU+w3R5y2RIbA8geRrUEk90cxQG3m6jEnPXFvNcinR3ZWaq3kVMdwlSZ1Oan/eajYCOyA4sLWDvpTfY7gDFBP4mLqrrsLJ8dqsPtL5b9YmFSKdEX3BI3ecH+rR67qTigps8OVmRIpL/wDSDMLd40zNNVA5ELbzNNJTskjswz5rfGsC5wRKju3uoHw9P4/uJlirDaDn4y1z3JRxAZjf0nyxTqe3JfQYFIptLZXWpy02UkKcbTqQSQCW2zcD4nALjBTlfJDkbkNV6os5WgHdrLGVQ2ZJ/wC/l20IPqloXG/nPenpD6KCqWuGt56fLRypVVk2Mp9HdAI2aav0aRYepWbqMmJPdhvIdbWQpPrvgVt7Bdlf9+UKlK5y0ucyUfI9NlwkycmZsqypCikSIlfqkkN2I3WUugIG/wDI4nK4f5M1ENQMzQyn/wDZs2z/AOQU4RiLIzAtEVp15Sk8wbIa7/TEN6qthgyH3nIzSU6la1hCUD1J6fqcIeNecBWP3jXgVZO4Cb3chZdAuisZ4i+yMyKVb/aQcU6uGmUg9Pd/pFnhL89HKkvCqsqW4kJ0hJUY5IABNhfufXFXK4hPSahWY9FoUyvIorKH6i9FeaTy0rRzAG0qUC8rR5ilPbviqXxoy7KpCqjTWKtU4i3URYr0emvcqXKXbRHbcKQkuHfY26HfbdxRrR0J/L84sW0WcZHEv6Nw1yzleO2xR815zp7TaAhKUSYZskCwG8X0xVVesUqBVpVOTn3PzphtJdnSY8aE8xCSoEo5qhGuLgX2vYbm2LVzhjx0zkl6NSslwMpFpOtyVV6o26p4EXCGQhCgFW6lSSAflit4W1ePSaDLZRR3IlTjTXWaxEmSeZOamXspTxtdRUAdK7AFIsLWtjfjOELlw5HYY4+fWStRqaEwKV+sg5ay/Xs2SYc2DmbMETL7r133a1BiNvvR9CiHGNCNSSohIutIsDe3TDAr2TcgvRkx5FLNRdSAESlKU7JbINwpL6zqSoHfY/ywE8TOLEqjU+FAiOxaVOq0kRGZ8wKW1DRYqckLAG4QgKNrdbX2Bww679n/AIWUKjRXsxVfNWclOspcckuVp8trvbzaWlpSkE3IAGw74Ey2XBbLGKKegA/XpJjOz8z3luj5Vy3HcXAjOB6SPxn5KFOvvb3AW4blW+4F7DsBjS7UhDqkuVBp8aO4+AlyShgB50DoVK6nr0PTESHwG4KSmyuLw9fnBBsQ/WpZKT1F0lw74nucBeDsdCS9w4p7G2+qc8sj9VDGDp6yTvdjn4f7mMMe8CMxcSKmzm5rLFPbjMVJ2P4hU6tvLZjNoJ/KEpUt5W19KBt3IxfsZYynPaiu55qU7PXhnQ+1To0NECmBwXtrQVqcctc/Eu3qnG2ZwZ4KAkJyYykk/DzVrA+nMOBWq8BsgKlJlZedn5VkpBTrpMlyOpYPZW9j/jhvwaSoWslT645++Z4KVjXe43s0KOqPTKfS8uQ1I0pRGShohPzAA/kLYFUceYNRqCWWqjBqUnVZbKpyVLV7WBv/AI4U03gpk6kSCpECFU31k63ZSVPOKPqpTilXP1xpc4dZYWgtnLlMt6oioSofIgA4EfY2ls8zMSfj/wDsyWf1jtc4oKUtXNpqW0kbJQ9a36pxJy5xfqTDzMdmNT4r6XSqNPUgJdjg9QV9FA7jzJPX2FuflZQq+WyFZbqq48b/APdlWKpDA/sKuFoHtviVHmZ3fvzINBRp6p8a/wDifI8vy/W+ErPYQ/6AETgscTotHEZ7NQpmW3Z7ZZQ+Qh9+yUN2Crkq2uLXsB1/QYh1+rUum0eOIVeZqj63lB+My04lLZAOlYKgNQtt077XF8c/5fzpMq2ZHac5TRBRCavPceeSsNvH4GkFJsq6bqPsRsDgzgSIM2oMMSKg1CZWrSuQpJWlsepA64k3ezfw7YbibFhMKMl5DqnE6pSG6pmCHFpiJbbqqbGjrDrjDcgLUlTocBTrbCQSAfiWLCwJOmGMh8LKo4unmXWqq8hTKFGSuSstuKF2iSdOwQgC4KrbEm5JV1aqlFpNOch0adIqM/nBXjuTyWijTYpCSok773sOuJeWcryHfD1OXUjZJS8hEdYGgjcFSx0I9unrgdosdPM2F9AMTwaGeZ+Kktmu1AP0VKWUtIjPRKgi7iFG6gVbbXCh5dwbA4XGcc8ivoWvwRbmFIbL4sLpG1jbrt3wTV3NFKQiQ4iSzOmOrBWCor1kWHmV3IAG98Ar05vNFU5MZuMy+Ek2SdN/me5xvTVKMNs6TzMTxKPhBIZYh8Sa88NAmVSPSULPVKIzety39pakfpgP4iZrYhsSZ8pfLaRayL7kflQn3Jt/ji1zLwmzNRpNQquWqrFQ3KX4iVTZKCttTlgC4gnTYkAXwtZ2TqzJqLU6vLEt5nzstISlDDfqpKQTqV/EcfoOn1Gnddyt9JgttHSMz7I7cqn0jidmidZM6QYtPbT+7rClqQPklbf+zizzdOepWXVKmSPEra5jy1hIRdKbqtYbbAge9r98aeCyEweDkV4u6pFbrEyqrSD8CArkIB/8JR+uBHiTmJFYU3Toy9SHXg0VjopCfO79CAlH97B1Xfez4/onWOQoi1zQtxUehUxw3cecEh8f2E3Vf5rUMS6LSf6XZ3yzRH1amJs9C5Oruw0OY5/upxXuv/fOapslJ1sQ2xDbUOhXfU5b5Gw+mDThFCTJzzVakpJKaZATGbN+jryiSf8AYSofXDjnn5CL5BeHeb8p0Gp1esVMtyIC3ip55mDJLTTildApKTa/S+wuPXCXzCXaQqpValLEZEVxEcxSCWn1eUGw7EFSRt+4Rhu51raYdOcSPMG0lwi/xEdE/MnCfqdnplNooVq8J/XZyr7FwklI+q1KV8rY7WNicwrP/wBp9y9Q5BY5KBzZSruvOHqpZPmP6n+Qwd0eiGjOu6ng8legtqPlII6/zwNUmpP012VITT3JTSbNfhHzhR0keU9vMN79iTgrgZUm1qMiZVKjJhOkEtsQXeWln5nfWbdztv0xK1Dlj5jgRVRk5m+RUGob6W2m1PzZDrTKUJ6BS1hCSpR2SL+uI9UYVFlym5NElNTUh1sv8nUjy2CzrSSCBqG/uMW2U2qTT5TyVThNqazoVLdQEc0A3SkW8p0+3fFrVuK1Py28mF42I86SSpt122gbakg269NhuO4xOyVbbWpMJgROzUfc1XYq8doSY4aMeZGSfMtk9SPUjrgnhZzorcFsuVmKUJbCUKW8ApSQNro6hQ6H1PTrbEuWqFmqqyH4CWFreT4jw8R5KtKLX1WHa25Nhipey7EjpVJcEeOlA1KfdCQEj1JtiwmoyArjmeDFekHYaF1ytTaytKkNvWZipcFilkd7dtR3w3+GfDCdWMkRMzVDMjFMojklUtNNiREOvKS0op/EdJJSTpPlCbgHC2hIpkjM2h1up5mpEZhLkhijjkhx0k+Rx4FRSiwBISL72uMdIUbMUDMdOo+WKPRYuV4clLbam0HUiIlRSVbBKd+xKj164Q9pX2IgNY6/kJwcnJlLmLPNAy5TIS4TXh0TV6QyyhI5S1dSsAje/XGmnZizjVcusU6jQ41AgU5lYkTnBzS691UtII6qN1E2PU79MEWeEU/KQh02jSxWW0hxqWHWrBKgopULdLEX9RYe+AOpZwFCQ661IMGnF1OiOnzBRBASgAC6ibAWA36YhUqLEGxc59f4mixzzL6JOi1ChOy8xVSSakmOlMUNteV13TdW9rBIVa4Fviv2sda+IcmNRYcBllpDbPxlX+kHb5H3xZ5gonFjjD4CS7RqZlentFSkLqmppQCtN1FhBWsKISNlFNvQYWWfMnwsmyGnqTmmRnKsNq5NUjxI1mmk7FJZCbpBT5rpKySFX6i2KVWjFgxZjPp1nDu6iSpfFp+XMVrpzakpulCeZYW73GnviSxl6p5zP3omgtGlut3dbUpGkNINlLVcdN7A23ttiln58y1VqC/Fi0xbboHLSeWhCm3B11b6gQeoONdF4pTYNJapkmLHmw2k8tOvUlQTe9iQbG23UdsFNLov+JcGYDesu5NPo7rSadT6ctuoAFpCobASE6b7+iht098Ll+c/BmNR5C1syEkoQ2QUlBA3Fh0waK4lMR5AdhMutrSPINkjcWNzc3vgFk1N+vz3H55HjpLDzwAHwLSEuot6goSn6KVhvTV2EkP0nCRL5Ob3abTUm6UlsqW6+9uCn/EWx5y3lmLXIxzJmta41CdJXEpxOh2oHrrWLghG+ydr7E7YgZMy83nGR951JsDLdPUVLT0TNeSfKgeqE7E++2IOf83rrFSffdeStlCdKRezbaRbYe2G1qGdqde5h60Cje0IsxcXH5UfwFJabi05q7SGY6dDSB+6APit7bYX0yqT6i6G1PuPLO4aZRqVb2SL2GLbKmTpmZUomTVrp1KtqClGzzyf4QfgT7n6Dvi1dnwqEqSqnIahwUEnWoD0+Ik9Tfe5vhhQlXlQZMy1rHpKaHkypqjLkSuVSo4QVJU+dSztfdKTsPmcCqysPrX94JVCR/pkNaNfyBJNv0vizrNbk5gfSAl55h1YaaaAJdlLJslIHoTaw74f2W+ClEyHRo0rMkaJW86OAOqhzgXYcC9ilvlgjmKA+Iq2JNk7JuTlzUMv1PaYXcxiIyrSK9m51bOUKBOqe4Q9KjteW5/fdPlSPa+GLSvs21wnmZnzTRssJvuzGKp8oD0KEWTf314ci+ItSXFEebFp0hltOlDMNtcNCR2AAWsAe1sDcrMsBXMclUSUykAkqgS0OgD1PM0H/HAfEsY+UQuCepkOl8LuG2WNDpp9QzbMSnd+tvBLAV6hlGxHssqxLqy2KzSH6Q82humvILfgmEhtlKVfuoSAB7WHpgcl8RMrpZW6wiquuAXS061ov9Ug/wAsBNTz9WqqtbcYIo0JV08tpILqx7q3t8iT8hgi1O3JMzkAQ1y7Xa1U2JdGqUdqfOo6UsqeWoByUxazbhST1sLEi9yNwCbmNVGEPR3EqirjhadK21HW0oem3T5+wwBQa1IoFUjVdlCpz8ckPMPkq8QyfjQb9DtdPoQMMF+v0urxm51NTJYYkDW2pBDqCOhBF7ggggi2xBHviffS1VmVHBktwQ2YLQ6k9EloYedKnUbsvX3Wkep/eFt/Xr3OI+dmfFrZrUUXlsp0voHV1rqQfcbke4x9r7bdQStClaF31JcSkpKVdjbFXSam6HuRJIDiBocA6HuCPY9f1GHK06WDqJ4HHMsnpqV5QynJaUFIRTRFWPkpST/MXwOCUIdKbeUm55abJ7qUQLD6kjH2IpdOmzKMtRMdJU9GBO2hW5A+RJ/XEcgPzoMfq3HZD6h7/Cn/AM38sN1rtE73mujyEoU7ESsKaP4zBG40k7gfIk/r7YsZCgt9mST+MWxGWP3tJug/pqH0GKmbGslNSp26UnW40N7HuR7HoRiS7ITIgeJaN9g4O9ik3I/lbBduTkTR9RPsN8CoVB1R8qNDd/RITqP/ABHFlTqjIfcEZh4sOqSXZUgC6mgsXCU/x2O37oF8DwloTGqjgsrW6UpT63SlIGJTk5VBgJZaHNnyFbDupaup+Q/wGPMuZkjmFysywcmU5qn06KhUki7ENs7C3Va1dT7qP0xTxZa5M5c+quKlz1DSHreRpP7qE/lH8z3xUQY6ojgbQlc2pyjckfE4R39EoH6D54M26BQaLHaerbiswVJwXRTo5KYyfY9NdtrlRt7DAMJRzjLGEBCdZARVYUxweDQ5UJCT/wDYmS6pPzUAQPrgwiZuzFBp70iZT2GYTKdSn6lISwUAeujWT8tN8Vys1JYj8yQG2YjKbphxBy2Gkgd1DdX0AHz64E5uYJma5zMyQORT46wuLCtsojo4sdz3A7fPAvPcfdwJtbGJ4jSyznp+VT0yanSW+Y4oqQ0l5QAR2Kha9z1t+uDamJhcV8q1DKlfmErmWcjPkAeBfSPwlNjsBsOu42PXCbgZibdSBJAbJO6wfL9fTF0mTJjJL0KQqNIQNbbiN9+ov6g9Mcs04PK8GNBvWBiIdTodUfy/WXl06ZTXHWXgnol0pGle3xIIAIv1C8SEZnlqpFOYEgKdSfEOeWxbc3GkH0t19cGPEOYzxUyk3muMwG8z0NkM1dhA3lxL/tfctk3J/d1egwsxBfcpzkwAiM0jmLWg2K7q0pSPS5BuT0AvuSMBKB+WHMCwwZe5gzIvMUVlUlYbq7awpMpptKVcsD4b9bdt/QYJPvGVByuxWJcwMoWoNR4z7Dqi96pSsbA9wAFX9etlalt2A+GnI7nOeAccUo6VBJ+ElJJIFugNiRv3wQN1XTBZafcMhDaVFtjT8CtwCT9T+uA26dQAFHE5mFU2tQnlpkJeHiFJDSUvKDaRc33JFh74o6tBqkxD8h2nvQIDCNaH5SFJEhXcNnoRYfFfe423xXwkU9ych2ZJK9LaLFpuxBJ8w3v0FunX6Yt2s4uOPGO4gPxVgtnmLsDfbUQR1tgYrKHyCezAK/LrUxtJ2ksIdT7lN0n/ACxdyZajk5DxuXac7zLA9Um+ofoo/pihrrbkKQiQ1+KqMpQIR+ZB+ID+R+mLSkzGahEdaSoLjy2ym49en/PFQ+YAxhDxiQst5inQVxlOPeHlLGpp5lVte3S/Y+2L5cWnz1eLhOfctaIKlgkmPJV184PQk9SN98BdOa5kJcR9JKo6yyoHqNJ2xOanuxG1Nybvsdnki6kf2gOo9x+mNPWCcrNcHrDegZrW23MhSILSZxADsd9Nymw2KT3SfUYJcvUUVCHHkyHghlbxbSi4BVYXt8yf5YWUeaxPaZalKDqU7R5bSrLb9kqHw/I7HFoh+q08XKE1aOPzNDlvp27p6K+mJ92mJ9ziBKY6RwzqnNjVYyW2ksMxkApkKWApTijulI32At19fbEGmZUbbzLlCVSqlNjtpmrJ5kgLRGbcbUl1LSCCAVHSL/lsCB2wC07MYq7SHW5K30tKsUOE3QbdCnsfngqoOY0toDMwoDDKDyzpuokm9sSmqspB2zAlNmkClZvrThRITFl1J1MeQ+ouc5aQlKhrJKidQVa/pYbDEczGZbZaKkL1p6JVvb19frhh5ZqlJk1qkVByM0idCW6plJJ2U4LEpHQqP63x9cyjkrMLsCmP0x6jT4slTi5kdKRJlvq1BSVugE2JUTb+zawGNreowHB4nesU1NC4gXT3XFuPNXWhxxV1OIJNlfMdD8vcYsWVK0JCuttziZnPKb2W8xNQ2y9UAl5bsQNJLr5jFOn8UgAX1EfOycU66xEaY55UssBQQX0NLU2lRNrFYGkb7bnrj6KmxbUDAzw4m2qLVHjqlNj8Rmy1kdS2FArHv5QTb2we5O4juZfgimzYcap0lZuW32+ZpB629R7b9/lgKKrgggEHYg9xiJSVclpcVZKlRlaAR3Ta6P5ED5pODMgcYM7nHMcysj5DzMx4umGRlN90FSHaY6FRlE9y2oFFr9RpT33vgdzNlSuZBYFRmrZq9CFr1mnXBaG27rdzoTew1JKkjvpwEZcqMyjRGHITxaLiQtxlYu2skb3Hrudxv8+mGbk7iWVLcjHSgvJUHqfJIU28i1lWPRQsSDbe3UYTKWVnynIm8K4wRPuc80IzflqgTXlqcrUFtUOQ/wDEJLCSCw5qvupKSWzfshJxO4QZwap2YVUuqOlFDrbRpk5X+rSsjlu/NtwIX8god8K6ss/0VzFIhU0uMU538eI055gEfmbProJsO+nT3vjW3XUtvgSGDHaPV5s6kD11Dqn57/TDOzcsSekBDWI70U177izXl+a4mPVKG8ZbYJA1FCwzIbuexBQoevKHrgMMtxryqV57dj0OLni9PfMunVxgp8JmWlx5anE7hbiQlD+/rzmFG/8AEMKadXZFZKoEZSmGG7IkykHzKNv2aPQ+qu3Qb7ga15Ezpiduc9ZK401SCvM1LzA2qyqlTQiorQoKCpTB0BVv3lNgA+pAxYZZoFRrsdK6zmGm5YZUkaWmmFTZSv7aUnQ2fqT6jAfXUxGGqLHdQymI3K5YaWkaNCm1hYI9Lb4ms0CdDShNIrJbiWu2xKZD6Uj0SoEG31NsL2rWhAbrHAeeYxDwwhz1eHi8RWqhYArZcy25ICb/AL3KWNP1GBrNfDOvZLpj9UYepc/L6gWnarR2VNriKIsFPsndCQT8QJttew3xAgy82wXEOR0QXFpJs4xMcZ+ttKrfri/g5q4jhcpKatDo7EtosSHUnxjq2ztYBaQm9ibE3thcsi/9hj++k0WXvAlWQZEoUhqnSIcGyPDmUyyA5MccUnSVKJ0kX/MSSLnEXNGXsxZHqLdOq6RIfXGTJbXTpokIUgkjr5bdOnuMGlLy/SKUmHR404sJSkq8KXhzXD+8Lm4332GNObMq/eMqhRky3W5kmSmCh4EfsiVOLUra1wkLO3e2AJqibAre78p0PiLZNWrZXpYgupt3clhJ/kTja9WMxNBJkRUqbH+snJAHy1DrhgZ5yvDazLMi5Pp0Zun06IxGmFyUW1uP+dalFzSdStK29RJHTt2AKbNh1iMt2AlPjC4mPqKkuONqUsICr3Nx5rgjY4dRlsG4LCizjrC7K3GWS5DXSqgBUYLidL1PqbeolHpY9R/7BGIuZJUjLeXUooyXJOWGni/G0kqdpC1hSHPdbVnFKHcKAvt1oFsOT6CZVVYXHUl5UeK4yCXlOJuklPpcg7dCAb49ZbzXLy/UkwailLbiwPMr9m+g9j29R8zY+/BWqklB9ITIsGGlzmGvUnMlLpVDpdeo0elIAU8ibIU23ym7ctogDUSVErUNr2uTvidJqrWW2GUZdn0rM8oW5tMpNJda0Xt0dQpaP9oA4qK3PRlUx1waNT3aW+dPPcbbTylX/ZuEtq79CfkTfEVdXpwcSuo5SbilJ1eLpdm3UH1CmtJH+ycdC5A44+kyiGs8GM6BPr09DbkajfdgUjzO1N2xQq29m27lQB9VIxIOUlVWxrcx+qgjzR1fhRr/APdIsCP7ZV88CNFz7NgNpdjOOZrod7B5q3j4/stIsHR7iyvUYOaHnjL1ahLlt1iK0y2QlxLqiHUq/c5XxlXsAcT7Vtr9wcfCXaWqccnmWbMGPT4yG2UhhtAAShkBKU9tgBti7hInMU5yeuWYNJa3dmTJHJjpHutRAP0vgXczw8hhaaNR2YygCVVWvAK0j95EUGw+bi/mnATUK79/zUTZDsnN85Bu1NqDv9UZIP8Aohp0C3/ZoP8AawJdM7nLH+YdrkQcS2YnR5S5pcjxs+OvnyVCfT0RobSQTdSVKBcd7fCEp8osd74GmK3CoEsPxalNcUtakOIoi3247O35EMq8u4te6j64lvx3qpc1SSZqVbGMlOiOB28lzq/vFXyGPkhmHHaLjiGmW0C6lkhCUj3PTFMIJPa70k9ji5Piqu3n+uQB2RKmOeX2/rAViHQ61OYnVCTSM3MzH6hIVJfMhtmSVrPU3RpI+QsPbFMh96pWNJjkNnpMkLKGiPVKQNSv90e+NEuiVaQR4mNSamn/ALZOk/TUheN+EuMQfjHPIjCZzHmZjS46iizSOhDD0ZX+0la/8MTms+1RK0rkZcUvT1XErAWbH0DjQ/S+E7OWjLzJdfpDlOb1BPMgSQgaj0ACFoJPsE39sElCoVeqytb02bSKW4LKbec1ynB7arlr5kk+wwtZpqwNzAf35Q6XljgRnweMDC5jtOp9BqM6voTdEOQWXEN36KWUL0oHuu3slXTFqxkyoZlloqWcJaapIBDjVOBPgo5HTyn9qodlKsPRIwNUSNEy1ETGpzQjNhWo6DupX7yj1JPqd8QannydVpT1No6TUpaToedcWRFjK9HFD4lfwJ39SMJCsE4pGPj/AHpGixx5zGHmbiDSMmwfESpiHV3DaUo+Aq7ITbdauwSP5YFG41S4gq8XmOWYVJN+XRY745ryb7c9SDZAPdtG/wC8o9MADjbLM15yO4jMVeCS09UpwvHj9lNoSnYD1Sn18yr4qV0F83L1Cy3KWd7tsqYP66V4Yr06J0PPr/ECbW7jiMp+ss5iZeiJqcalUSEp2KzSojhjKfLZKdK1gDlIKh8KNyNyd7Ysso5nBaEOfMo0KLHabbiR4z7TQb2OtAbDiwEg2sq4KupSMJyiU2DKdlJYiP01TLulfgZ7vKUs3KtJSpIJHfy9cTKlFj0yKp+TXqhDYTsVPTApPy/ESr9MEfTqwNeZwXsCGxHgzmJUqtvU5MR8MJRcTkkFpRsDsobd7CxvcHa2+JsSOzBaQkNFWncuO+ZSj6lR6nHO9Ly/W85EHL8JurRibGoVqnxmYo9+YUJUr+6DhnZe4Cxilp2u5papjiSFKYypEMY39nVXJ+YSMLWaKtRy2J0a/HUZh9Vs8QMtQESKrUWITHZyS4ElXsB+b6XwO0xibxQzvCfnUipyMhpZS4WKk2mNHdkJJKHAhY5jyLH4SALgHe1sGOWsq5AyRJM+m0lyo1m9/vSqEyJJPc8xZJH90DHqtVJdakuPLkSmVLINmJDjfT+yrCYqCA+EOT3P7RXUayy5do4EIYdHy1ltyTHpzUCjKdVzn48VtDWokWupCbXuAO3QYYtN4v5eoNGp9LgZeWsREp5QbQ21FaUOikjqkDtZPe2EPUKdArjvOqkGHUpV95EiIzrItYAlKBcC21798aGMrUJj9jTW4wvfTHUptP8AspIH8sTH9li0f5XJMmjKniN+rcc654oNLfqDzTzfLKIvLSm2wsTdJ1H1t69MDWY8hwuMNZp9dqsGsUOqRkGOKvCnJjyn2dI0hzTr1hKhtf16kC2Aql5ioUatClMS0uSmydbLZW9yCBfzqAIa6fmI7YYeX8xpiMKVrdmtPnWlzm6gBbYJHS3y/ngf4BtJ5qBgzxyesQPHHJbvDjPORkO5lnVqjyVyyz96JaK47gZCQOahKSrVqtYjqnF5kDidIyGpNOlhcvLLitPKF1OQiSf2Y6rbJP7PqLnTt5MNfP8AConEXKkukT2mn0Ls6hD4CkBY6H2779r9Rjk/MWXK3lhspp6nKzR2X2nnIj6tUpkNuJUQhf5xZPQ7+5x9PoW/E0eHaPMP7mc5E6Rl5tyjGqMedSpsxS0NKSjwXiVsWV1shN03tt029BjSeJFLUvzfeTiyf/3ZJP8A+Txz7MzOammjIpMx7wctTjjvhVBt5xKANTaVKB0K3O9tiB7nBvR6PlKVHaluT6tNpchzlNTXqtJQpl7YGPISHAEOAmwNgFbDqRqO2nVBk5hA+YzJHEWmR2i441NabHVbkJ0fyKb/AMsVVTzBErF3IebZdNJTs2lpjSNvRxkkfrgNk5doUrNLdBpVERIlKj+JL1WzJKhtrTqIIR51qWRbew2uL4h0Wl5PrcKorRlR1yoU+WqFIYTXX3EcxJGoodDmlSbG9xb0sDjIrVRuGZrmEL8eh3VbiHMaft/ppsZQ1e6S30+VsWVIzfEcU7FkyIQeZF0SYrqVsSEdlJVfyq9UHcdioEE1yOHuQ3U70+oRza/lqcuw+gex6/6PMjoFxJqYB/KKjMP/AJ8c3oeGz9p7Bnms1zLnNLr1bjRHztrEpKSfmCd8RhnqgoQC3UTNsLaojDj9/wDw0nEleTskoB0irqH8FTlj/wDLDFdMy7kyOkqWmsIQNruVmQhP83Tja+GfWcyRA6tvQ3qrJqdAFepVSfIU+tEO8eQQLAradUnfpuLHbFb/ANIOb4S2m5QpUBVwEeKjOtpkH01hZSD7A3wZNU3JMt0ojeMkLTuQjMMlSgPWwcOKysZZhLac+7KlPiqUCCzLd8cyseikuWV+ixgrJTZwy/cQeO81f0+zGRcUKE1brzZxOr3TZGw+eJVC4gy6nXFUybTmYLvhjJQWpXN1AKCbfCn3P0wCPR5FDNlE0ax0pUFF6nOH03sWifTa38WMkPMS5UduqRVwJoNo76VkXJ3/AAnU239jY+xwrZoasHCia4Ma8ioaup2xrg1dun1ONJLRkIaVqLYXov174WRgVOOSqJmCelV+kkpfT/vC/wDPEhjNdXg6W51JVOsbGRTlBVx2PLO/6HCB0PGF5mSCI1Xq/WM1Vcswm3FrfP4cRHn6C56+wJxvk5IrUukT58xPIVCUnXFeGleki5UkdLAEfPf0wLZUzPKgvR6tDQ7CkNlQDclrSobFJCknsQTgjr/FKr12nKhrDLCV3DimUka02I07k2G5/liW1dtbhalAE716xcU/+kGRm3YtKRGqlIK1LbjPLLTrOpRJCVWIUm5JF9xfA1NiVmtS3FuqRRI6kctSWHOc8U3uQF7BN9r2F9hhsZQbpkioPGqOISEo1IDxAbJ7g+p6bYh1SpUiTIfU1SU2Vsk69I22vYDb1xZTXWA7cc+sxziCdAyQlUVhDMcsQkXQlYO3z9Tv1ONdOq0zhxVatDcpcmbDnOJkokxEcxaSEBNlIuDYWNiPXBMa9J8MlhCW2kJASnQkgi3pucDdQrjDocUy6ipTeYhlMZp5JWpxSglKfbdWC03W7yzDIMx0OZTV7NlQzNJYTS6bI0BWtbtQb5LaVD4TYm6rdbDuBjzS8tpgMKDjy333la33lbFxR6n5e2Ces0yqZbakLrNLdpgaSVX1JdbUkC90rTsenTY4qn5y4sxuA9T5sepurQhunvsFp5wqNkkBVhb3vbB3vewYUcThOZYRg3HZbS2QlQ6DHmBWJmYUxm4CTVESuaVMwQFrSltJUokbEkAbgb+gOLyi8KMzVyapc2UjKrDSQGRIbaleIcJOytLnlAFu97nDAyzk2icMokJx9qNJr0dp1ozY7HLWsOOFwptqNgLhIuSQBibbfVUM53N6TwUyooPC2h5ipmW6hMrlQiZdlQELmtRdPPVKKRfS4UGzd9d02uNt7GwLqJwdy3lt9isUeo1NyqwKhHl0ydOYCFhtPxtEJslaFpKwVaQdx6bw5uYotV5KX2lsIbClKcccvdRI9LWFhiCc1SC25F8U9LpiXG9ZWshZQOraFHoCNsSjbqn91sTRIEsMxZGptSyrTafQFxKQ/BqsySJSGUuuID6Hipra3lu6gBJNgGx1tgzy/wDZ+yHkWniXmGQ5nSdNabdhIqYADCRpUS0EgAEq3KrXsAnpe67zDn9qlsymqHSGKRHlvpdbVzFOuthGny61epFzt3I3wHZ54u5kzO+OfWX0Sw7dS2yUIbSQLJTb4R629MeFesvAQPgd/X7zodR2jN4gKy1MzjWqlAjS49VqPJXPSytBZecQkgEAi6SArc3sSOnfC4qM1zLtcbl0p9+JJLd3OZZR36g9iNsU1KzmuIuNEkILikEh2UtXmWex/wD04ra5mptxqVMU4h5bLSlhpChewvYf4Yfp01ikIxz2gycnMIX8wVys1uLEpsNFQrNRWIsSCkkJWvclRJNwlIupSuwBw4cnZSo3DR5E54t5lzclJDlUcTZiIT1RGR+UDoVfErubbYSeSsxtcO5TtUrQjP1qU2WkaHSksNH4m2k2JN/zKtc9NgMT65xulzEcimUdMdbg/wCuSXyQzv1DekFRHpcD1xWGkceVB84VCvU9YzM9cSJ8s+EEgvSV+bln9kyOmoo6E7CwPue2F+hRTe6ioqJUVKNyo+p98VCKnBp0W5mh5SrrU4pWtx1R6kn1P0+mKOqZocmhTLCVMtd1E+ZQ/wAhh2rThBtAnGctzIWcocStVBMmCsxKggaFS0C6XQL+VSfzgevUdsDZlPRXFMz2+S9YkFBJQ6PVJ63/AIeuJsivRIbojlZelEeWMwkrdP8AdG/62xscp9Uqce0tESjwz1M6zzpH/dg2B+Zwy6pjDQWC3SQ4UaGh5MmaZcCDNHlnFC0tMrtdKjqGhSDaxB3BtY+lhTqCMw+EmznHINIhxwyqRu0uaAVbpHVCCFAb7qAsLdcQR/RvLvKSsSa7NSq7Dcg6kBZPVDewTv3t2698eq1X5UspS84HJCfypHkZ/wCZ7X9+2BEEjCwq1gHLS0zlncTY7VHpraYlLYSE8ttOnYDYW7D2+p3OAWDKgSZLkue82iOyvTHZWfjV3Vbqrtb540zFOznlQIl+Yv8Aaujogd/riTFjQKAz/V0JdkgeaS4OnywZK1RcDrPWEucS1l1iSpgOMsOqBGy5BKE29h8R/TFE7z3wh+pOKfWpYDMVtN/MTsEpHVRx7bqqXlOvuKW4hCSouEG3yGGDkJqHlZxus1NKna8tOphtKQUwUEbWudnCOp7XsMaVdgyBBEKDC3hhkdWQ3EV2rtIVmopIjRjZSKWlQ3J7F8gnf8n9q9ieRLUpZUtalrVupSjck4EJfEKMw0paYrryugTrAJ+uKWdnuoyT+A1Gij0XqeP0N0j9QcA8F3bc0OHVRgQ2kzDfY3v2GAHMGbVVR56FDUPBoOh18H9ooHdKf4RaxPc3HbegrNRqE0oQuoyS68dFkL5aQN9Rsi3a/XvbGuiNIrjqo0KfT4Edk8tUqa+lKU22slu+pZHtYbdcNCtaxuaBaybnHUtJKlqSgDuo2GIjVUjzDpiqXNV3EVtTtv8AZBwZxss0Gkp5nhlV+WdxJqY/Dv8AwNWKQPofniyObMzIRymZcBqONgyqIpSUj0+Mf4YWbVE+4PvFTdjpARUaehkOmk1NLZ31+CdI/kMU1MzJ9x1R9cMl2K4q8mCfKsHutCTYg+o74ZTleq6U6tMBavRCFMp/mVf4DA5mCvwqyhQrMFV0jZ+3MSg+oWDcfPbHltezh14gzYW6yazWoNVYQtt1C21i41bHFHXY4iKTLavdsEqA31I7j6dR9fXFGinuU68iA8ZcVfmU0DdXzBHU4mxJqZDIW04Fov0v0PcEeuCLSEOVPEziaqtJ/rNPnkhXLeS2pXqhY0//AJuPUEBU2oOHqFoaB9gi/wDio4hSm7U6ZFtsyjmNX7pB1D9Cm30xPhWbTOcV0L6lfTSnB8TU3UtCRVpyAkaOckabbbgX/XEGlJCYk9IACUurAAGwFsZjMEHvGaMr6YAptoEXBli9/wCynG54BWbWQRcBlRAPY7YzGY73nR1hBlRIL9XWQCsPhGq2+kIBAv6XxJjeepzyrzEPaLn90AWHyHpjMZhVvfgX94yvzikKYhNkAoXLbCknooX7jvibpAAAAG57YzGY2numHr6T2yBzQLbHrghywSqE4k7pS9ZIPQD2xmMwVoZessOGHl4jU5sbIecdbcSOi0FK7pI7j2OBvKrSDTG2ShJZTOSkN28oAcNhb6D9MZjMI2951ukBqy4s1uUsqJWX1EqvuTrO/wDIYvHEjmnYdL4zGYLb7omJrSBzEbdSL/riyzEy21VpaUIShIXsEiwG2MxmAnqJ0SilgBINt/8A1xrpbSGp09KEJQlMtFgkWAukXxmMwUe4YSv3p5qTaE5lqVkgX5ZNh309cemkJKtwP0xmMwUdIUyE0w0mty2w2gNqa1KQEixPqRgty0Sumx1KOpViLnc4zGYFb7s0k1VJtLGe4nLSG+bFUXNAtrIvYn1xepAt0xmMwhf70A3WWUFamVNuNqKHEkKStJsQb9QcXiFq1h3UeYBrC773v1v64zGYnN1nB0lxR33JSXXXnFPOlxZK3CVKJunucLDja6uKxQY7K1MsGStRabOlJI0EGw22O+MxmC6L/kE5JyUj0GNDaR98EWFjGTfbr514zGY+jnj0khlCQ0gAC1htbHiW2nwb69I1IGpKrbpIOxHoRjMZjg6TwkiuuKk5Ry++8ouvmWgc1ZurdKwdzvuNsamEglWw2BI26YzGY8vSbbrGdXwHPs+5NKvMWqxUmm776EWbVpHoNRJt6knChoCQKNFIABKdRPqSbk/Ukn64zGY9X7pk/Se4fmf1kWsJCq7DBAIDDpAPY3bH+Bxb5aSBEfSAAnmdO3TGYzEzW9BHIWRQE2AFhYbDEmRtGdI2IQog+nlOMxmPnz784IrqFBjTeHNWnSI7T83UpzxLqApzUCLK1He49cOrKI59Gpjrn4jpjNqK17quUbm/ruf1xmMxR13ur/e000sTEYRKUUstpLitS7JHmJSbk+pwpOK0KPGzvk9xphppxUxCFLQgAka07EjtjMZgeg98/L9pwdJInMt/dNJ8if2rx6f95ihzfAjO0wKXHaWpLoAKkAkXQu9sZjMUafeH1hF6SVllpEnLqEvIS6l2IQsLFwvY9b9cDWR1F2hpCyVhLykp1b2AOwHtjMZgi9D85QmuupEDN9LXFAjLe2dUz5Svp8RHX64uOJzaIkOm1BhKWZ+q3imxpdtb98b/AM8ZjMGHvj5TI6iSKm85PzPRIslapEVUZLqmHTqQVgbKKTtf3wWOpCTcAA+2MxmAr7gjFnWasC1RSJeeqZGfAej8pS+S55karnex2v74zGY2nWDPQwzcAAJHW+NSvhOMxmPHrOjpBnKaRN4qVASAHxGYTyOb5uVcb6b/AA39sM5Qtf54zGYU1f8A1+Ua0nQwX4kyXYmSao6w6tlwNgBbaikgFQB3HtiHmZIpPC9xMECEAwyAI/4dgrTq6etzf1vjMZjNf/H9Yaz3pIpMdpiDHbbbQ2hKAAlKQANh2+pxEzA4pujTVoUUKDKiFJNiNsZjMbPvzg92bqSy2zSYiG0JQkNoASkWA2GKXL8dqo8a4rMtpEplmCtxpt5IWlCrfEkHofcYzGYZq/5TEbvcnQMRtJauUgkbXt2tjfpGk7D9MZjMIP1MTX3ZifgOMHTGYzHjNCecej8OMxmBnqJk9ZUZWjMxMu09LDSGUllK7NpCRcpSSdu5JJ+uKuLRafS5UtEKBGiIkPqDyWGUoDg62UAN9998ZjMNno05PMqkwU12ivphxw8JCrOBpOr9mvvbEqvISKrLISAdje38KcZjMZT35wxKZbYaHEiYkNoCVSHlkaRYqKdz88MXJEKO5xCq0VUdpUWVR3FSGCgFDxSQElaeirAkC/qcZjMULev0nBNFLhR67w7p/wB5R2qh/Vyf60gO7gkD4r9AB+mDKjQY1NpbMeJHaix0IBS0ygISkkb2A2xmMwq3/F9YWelHyjEV1RudzjMZhYTx6zV1BvviLJQlaU6kg2NxcdOuMxmNrPGRHUggGwv8sRFgC9hbGYzBm6zk9R2G37IdbS4hR0qStIIIPUH2wuabGacpOYoymkKjNPPJbZKQUIA6ADoAPbGYzB6+k9N2XHFO0KCtaitRaF1KNycbqw6tiiTHGlqbcSyopWg2IPqDjMZhNoU9IV08ldLiqUdSi0klR3J2GMsN/njMZiMfeMXM82Grp3/yxpWBcbYzGY0vSePSDedJb8SHFUw84yVPWJbUU3Gk+mGvkbLVINJynLNKhGUiLGcS/wCHRrCuWk6gq1733vjMZhwf8R+sx3hBxhiMTcqoTIZbfSmbHKQ6gKA/ESNr+xP64OqnDjvPJW4w24tpzU2pSASg26j0+mMxmI3/APBPr+kKvSDua0pECwAALib7e+IFb2ydSx2L6lEep8wv87YzGYRr90fOY7GBNT/Yj+0MVc/yssoGydSjpHTpjMZitXAGVM51bkhkKWpQCNgTe2+BmSkc942Fyo7/AFxmMxRp6GeE1qGx+f8Alioq29Mnf/w7n/DjMZh6v3hOyXTEhwOvKAU8tR1OHdSvme+Jfw9Ntu2MxmKh6Ts8ufkPffFdX3FtUeWpClIUEbKSbEYzGY6J3tC3IkKPFyhGdZjtMuOC61toCSs79SOuBeqOKcfkFSiop6Em9tsZjMI//wBYftBKkpAnMLAAWW3FFXcnpf52xaLACBt2xmMw0/WZEgUlIFHWoABSnfMR1O/fFfUQF1NlChqR+6enXGYzGh75gz0k9CEqk05BSCgy2gUkbfGMGb6ip9wkkkqO5+eMxmCr0gvSaP8AljBjMZggnu00JANR33sybe24xumxWXWlFbLaztupIPfGYzGIMwWivuU/MLDUVxUZpavMhlRQlW/cDDVR1TjMZhDUe9Fmg3U3VqlOJK1FIV0J2xpYAKjcXxmMxun3ZyQCw2xmJtDbaW0LQVKSlIAUfU4izmkR8zpS0hLYcY1LCBbUfU+uMxmGRNCeZyRrd2H/AFd0f8H/ADONkZINLmbDqf8AgTjMZj096T//2Q==";

// src/services/cri-engine.ts
var ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL = "ROOT DEFENSE MATRIX (CRI) Logic:";
var ROOT_DEFENSE_MATRIX_TOOLTIP_DESC = [
  "\u2022 Tier 4 (R16-R20): Fatal Breaker -> Immediate 0 pts (PHYSICAL DEADLOCK)",
  "\u2022 Tier 3 (R11-R15): Replay & State -> -25 pts",
  "\u2022 Tier 2 (R6-R10) : Slippage & Cap -> -12 pts",
  "\u2022 Tier 1 (R1-R5)  : Base Telemetry -> -5 pts",
  "\u2022 Status Bands: \u{1F7E2} 80-100 OPTIMAL | \u{1F7E1} 50-79 ELEVATED | \u{1F534} <50 CRITICAL"
].join("\n");
var ROOT_DEFENSE_MATRIX_HUD_CONFIG = {
  OPTIMAL: {
    band: "OPTIMAL",
    badge: "[ STATUS: OPTIMAL / ALL ROOTS LOCKED ]",
    cssClass: "is-optimal",
    scoreClass: "text-emerald-400"
  },
  ELEVATED: {
    band: "ELEVATED",
    badge: "[ STATUS: ELEVATED / CAUTION ]",
    cssClass: "is-elevated",
    scoreClass: "text-amber-400"
  },
  CRITICAL: {
    band: "CRITICAL",
    badge: "[ STATUS: CRITICAL / PHYSICAL DEADLOCK ]",
    cssClass: "is-critical",
    scoreClass: "text-red-400"
  }
};
var TIER_PENALTY_BY_ROOT = {
  ...Object.fromEntries(
    ROOT_DEFENSE_TIER_1_ROOTS.map((r) => [r, ROOT_DEFENSE_TIER_1_PENALTY])
  ),
  ...Object.fromEntries(
    ROOT_DEFENSE_TIER_2_ROOTS.map((r) => [r, ROOT_DEFENSE_TIER_2_PENALTY])
  ),
  ...Object.fromEntries(
    ROOT_DEFENSE_TIER_3_ROOTS.map((r) => [r, ROOT_DEFENSE_TIER_3_PENALTY])
  )
};
var ROOT_DEFENSE_TIER_PENALTY_BY_ROOT = TIER_PENALTY_BY_ROOT;
var TIER_4_SET = new Set(ROOT_DEFENSE_TIER_4_ROOTS);
function normalizeTriggeredRoots(triggeredRoots) {
  const out = [];
  if (triggeredRoots == null) return out;
  let iterable;
  if (typeof triggeredRoots === "object" && typeof triggeredRoots[Symbol.iterator] === "function") {
    iterable = triggeredRoots;
  } else if (typeof triggeredRoots === "object") {
    iterable = Object.values(triggeredRoots);
  } else {
    return out;
  }
  for (const raw of iterable) {
    const root = Math.trunc(Number(raw));
    if (root >= 1 && root <= 20) out.push(root);
  }
  return out;
}
__name(normalizeTriggeredRoots, "normalizeTriggeredRoots");
function calculateRootDefenseMatrixScore(triggeredRoots) {
  const roots = normalizeTriggeredRoots(triggeredRoots);
  if (roots.some((root) => TIER_4_SET.has(root))) {
    return ROOT_DEFENSE_SCORE_MIN;
  }
  let totalPenalty = 0;
  for (const root of roots) {
    totalPenalty += TIER_PENALTY_BY_ROOT[root] ?? 0;
  }
  return Math.max(
    ROOT_DEFENSE_SCORE_MIN,
    ROOT_DEFENSE_SCORE_MAX - totalPenalty
  );
}
__name(calculateRootDefenseMatrixScore, "calculateRootDefenseMatrixScore");
function resolveRootDefenseMatrixBand(score) {
  const s = Number.isFinite(score) ? score : ROOT_DEFENSE_SCORE_MIN;
  if (s >= ROOT_DEFENSE_OPTIMAL_MIN) return "OPTIMAL";
  if (s >= ROOT_DEFENSE_ELEVATED_MIN) return "ELEVATED";
  return "CRITICAL";
}
__name(resolveRootDefenseMatrixBand, "resolveRootDefenseMatrixBand");
function formatRootDefenseMatrixLabel(score) {
  const s = Number.isFinite(score) ? Math.max(ROOT_DEFENSE_SCORE_MIN, Math.min(ROOT_DEFENSE_SCORE_MAX, Math.round(score))) : ROOT_DEFENSE_SCORE_MIN;
  return `ROOT DEFENSE MATRIX: ${s} / 100`;
}
__name(formatRootDefenseMatrixLabel, "formatRootDefenseMatrixLabel");
function trippedRootsFromStatuses(statuses) {
  const tripped = [];
  for (let root = 1; root <= 20; root++) {
    if (statuses[root] === "TRIPPED") tripped.push(root);
  }
  return tripped;
}
__name(trippedRootsFromStatuses, "trippedRootsFromStatuses");
function calculateRootDefenseMatrixFromStatuses(statuses) {
  return calculateRootDefenseMatrixScore(trippedRootsFromStatuses(statuses));
}
__name(calculateRootDefenseMatrixFromStatuses, "calculateRootDefenseMatrixFromStatuses");

// src/config/statusDictionary.ts
var STRATEGY_DICTIONARY = {
  CASHCAT: {
    label: "[ \u26A1 REC: CASH & CARRY ]",
    actionText: "Buy HL Spot + Short HL Perp",
    tooltip: "Strategy: Buy HL Spot + Short HL Perp simultaneously to achieve 0-Delta price exposure while collecting positive funding APR.",
    color: "#50D2C1"
  },
  REVERSE_CASHCAT: {
    label: "[ \u26A1 REC: REVERSE HEDGE ]",
    actionText: "Short HL Spot + Long HL Perp",
    tooltip: "Strategy: Short HL Spot + Long HL Perp simultaneously to harvest yield under negative funding rate conditions.",
    color: "#50D2C1"
  }
};
var METRICS_DICTIONARY = {
  GAS: {
    label: "\u26FD GAS",
    desc: "Estimated execution Gas (Cross-chain + L1 TX fees)"
  },
  FRICTION: {
    label: "\u2699\uFE0F FRICTION",
    desc: "Estimated total friction percentage (Taker fees + Spread)"
  },
  SLIPPAGE: {
    label: "\u{1F30A} SLIPPAGE EST.",
    desc: "Real-time orderbook impact slippage derived from checkSoilResistance()"
  },
  HEAT: {
    label: "\u{1F525} HEAT SCORE",
    desc: "Composite market volatility index (0-100)"
  }
};
var STATUS_DICTIONARY = {
  // Step 1: Top Bar & Heartbeat
  TOP_BAR_STATUS: {
    MINDSET: "Mindset Status: Psychological discipline check before executing trades.",
    VIX_DVOL: "Volatility Index: Real-time implied volatility reading from options/DVOL.",
    TARGET_LOCK: "Target State: Indicates whether a token is locked & ready in Step 3.",
    MARKET_HEARTBEAT: {
      SAFE: {
        label: "SAFE / STABLE",
        color: "#50D2C1",
        desc: "Market structure stable. All safety circuit breakers disarmed."
      },
      ELEVATED: {
        label: "ELEVATED VOL",
        color: "#FFD700",
        desc: "Volatility spiking. Position sizing automatically throttled."
      },
      LOCKED: {
        label: "CIRCUIT TRIGGERED",
        color: "#FF4D4D",
        desc: "Extreme volatility detected. Step 3 execution hard-locked."
      }
    }
  },
  // Step 1: Best Hedge & Strategy Radar (labels live in STRATEGY_DICTIONARY)
  BEST_HEDGE_STRATEGY: {
    LOCK_BUTTON: {
      label: "[ \u{1F512} LOCK BEST HEDGE TO STEP 3 ]",
      desc: "Auto-injects optimal delta-neutral strategy with dynamic Effective Max SL = (Equity \xD7 1%) + $100."
    },
    AUTO_LOCKED: {
      label: "[ \u{1F3AF} AUTO LOCKED ]",
      desc: "Top-ranked delta-neutral hedge auto-selected by APR / funding edge."
    }
  },
  // Step 3: Dynamic Max SL weld badge
  MAX_SL_WELD: {
    label: "MAX SL DYNAMIC WELD",
    color: "#50D2C1",
    desc: "Dynamic Limit Enforced: Effective Max SL USD = (Account Equity \xD7 1%) + $100. Auto-calculates Dynamic Stop-Loss % based on order size and live equity."
  },
  // Step 1: Volatility Heat
  VOLATILITY_HEAT: {
    SAFE: {
      label: "SAFE",
      color: "#50D2C1",
      desc: "Low market stress. Deep orderbooks and low slippage."
    },
    ELEVATED: {
      label: "ELEVATED",
      color: "#FFD700",
      desc: "Elevated market stress. Limit orders strongly recommended."
    },
    DANGER: {
      label: "DANGER",
      color: "#FF4D4D",
      desc: "Extreme market stress. Slippage circuit breaker activated."
    }
  },
  // Step 2 & 3: Soil & Slippage
  SLIPPAGE_ALERT: {
    ATTACK_READY: {
      label: "ATTACK READY",
      color: "#50D2C1",
      desc: "Spread and estimated slippage within acceptable risk thresholds."
    },
    CIRCUIT_BREAKER: {
      label: "CIRCUIT BREAKER",
      color: "#FF4D4D",
      desc: "Orderbook depth too thin. Target temporarily locked."
    }
  },
  SOIL_RESISTANCE: {
    COMPACT: {
      label: "SOIL: COMPACT",
      color: "#50D2C1",
      desc: "High orderbook depth (Slippage < 0.1%). Supports maximum capital execution."
    },
    BALANCED: {
      label: "SOIL: BALANCED",
      color: "#45C4B4",
      desc: "Moderate depth (Slippage 0.1%-0.3%). Standard capital allocation."
    },
    LOOSE: {
      label: "SOIL: LOOSE",
      color: "#FFD700",
      desc: "Thin orderbook depth (Slippage > 0.3%). Capital allocation auto-capped."
    }
  },
  /** Step 1 Root-tagged indicators + hover tooltips (Full English) */
  ROOT_TAGS: {
    ROOT5_VIX_DVOL: {
      label: "[ R5: VIX/DVOL ]",
      desc: "Monitors VIX/DVOL composite index to prevent trading during extreme market turbulence."
    },
    ROOT13_SESSION: {
      label: "[ R13: Session Gatekeeper ]",
      desc: "Tracks global market trading hours and liquidity venue transitions."
    },
    ROOT10_TSUNAMI: {
      label: "[ R10: Tsunami Shield / HL Settlement ]",
      desc: "Monitors Hyperliquid funding rate settlement and HKT 21-23 volatility windows."
    },
    ROOT2_GEO_LOCK: {
      ok: "[ R2: GEO LOCK ]",
      fail: "[ R2: GEO LOCK \xB7 BLOCKED ]",
      desc: "Jurisdiction gate: blocks execution from Hyperliquid-restricted geos.",
      lockDesc: "LOCKED: Restricted IP or regional compliance barrier triggered. API execution key isolated."
    },
    ROOT8_SLIPPAGE_BREAKER: {
      ok: "[ R8: SLIPPAGE BREAKER ]",
      fail: "[ R8: SLIPPAGE BREAKER \xB7 TRIP ]",
      desc: "Physical slippage circuit breaker (0.5% max limit) active.",
      tripDesc: "TRIPPED: Estimated slippage (>0.5%) exceeds safety margin. Execution hard-locked to prevent flash crashes."
    },
    ROOT1_SL_WELD: {
      label: "[ R1: SL DYNAMIC WELD ]",
      desc: "Dynamic capital protection limit. Single trade max loss = (Account Equity \xD7 1%) + $100 USD."
    },
    ROOT_MACRO_FILTER: {
      label: "[ R5/R10 Macro Filter ]",
      desc: "Real-time calendar tracking macro event risks (FOMC, CPI) to avoid black-swan volatility."
    },
    /** Pipeline Bar (auto-guard banner) Root tags */
    ROOT6_MINDSET: {
      clear: "[ R6: Mindset CLEAR ]",
      stressed: "[ R6: Mindset STRESSED ]",
      desc: "Mindset Status: Psychological discipline check before executing trades."
    },
    ROOT5_MACRO_VOL: {
      normal: "[ R5: MACRO VOL ]",
      elevated: "[ R5: MACRO VOL \xB7 ELEVATED ]",
      desc: "Macro volatility gate from VIX/DVOL composite before Step 3 unlock.",
      elevatedDesc: "ELEVATED: VIX (>20) or DVOL (>55) macro volatility surge detected. Direct market orders blocked."
    },
    /** Shield / Tactical Pipeline Bar — Root 5 VIX gate */
    ROOT5_VIX: {
      pass: "[ R5: VIX PASS ]",
      fail: "[ R5: VIX FAIL ]",
      desc: "Volatility Index: Real-time implied volatility reading from options/DVOL.",
      failDesc: "ELEVATED: VIX (>20) or DVOL (>55) macro volatility surge detected. Direct market orders blocked."
    },
    /** Shield / Tactical Pipeline Bar — Root 10 settlement gate */
    ROOT10_SETTLEMENT: {
      clear: "[ R10: SETTLEMENT >5m ]",
      lockdown: "[ R10: SETTLEMENT LOCKDOWN ]",
      desc: "Monitors Hyperliquid funding rate settlement and HKT 21-23 volatility windows.",
      lockdownDesc: "LOCKDOWN: Hyperliquid Funding Rate Settlement active (<5m window) or HKT 21-23 US Open surge. Orders paused to prevent oracle gap slippage."
    },
    /** Shield / Tactical Pipeline Bar — Root 3 soil gate */
    ROOT3_SOIL: {
      safe: "[ R3: SOIL SAFE ]",
      danger: "[ R3: SOIL DANGER ]",
      desc: "Soil Resistance: Orderbook depth vs dynamic Effective Max SL risk boundary before Step 3 unlock.",
      dangerDesc: "DANGER: Liquidity depth-to-impact ratio failed check. Max risk exceeds Effective Max SL threshold."
    },
    ROOT13_TARGET: {
      locked: "[ R13: Target LOCKED ]",
      pending: "[ R13: Target PENDING ]",
      desc: "Target State: Indicates whether a token is locked & ready in Step 3."
    },
    ROOT18_STEP3: {
      locked: "[ R18: STEP 3 LOCKED \u{1F3AF} ]",
      unlocked: "[ R18: STEP 3 UNLOCKED \u{1F3AF} ]",
      direct: "[ \u{1F513} STEP 3 DIRECT ACCESS \u{1F3AF} ]",
      desc: "Step 3 execution gate \u2014 unlocks only when upstream Root checks pass."
    },
    /** Flash Pipeline Bar — survey bypass + physical welds */
    FLASH_ACTIVE: {
      label: "[ \u26A1 FLASH ACTIVE: SURVEY BYPASSED ]",
      desc: "Pro Sniper Mode. Survey gates bypassed. Root 1 (Dynamic Max SL) and Root 8 (Slippage Breaker) remain welded."
    }
  },
  /** 6-Stage DonDon / 三天目 Status Prompts HUD */
  STATUS_HUD: {
    NORMAL: {
      emoji: "\u{1F7E2}",
      label: "Green Scan",
      subtitle: "Silent background monitoring",
      cssClass: "is-normal"
    },
    GROWTH: {
      emoji: "\u{1F7E2}",
      label: "+EXP, LEVEL UP!",
      subtitle: "Safe-zone XP progression burst",
      cssClass: "is-growth"
    },
    WARNING: {
      emoji: "\u{1F7E1}",
      label: "Amber Status / alert",
      subtitle: "Risk hawk eye activated",
      cssClass: "is-warning"
    },
    SHIELD: {
      emoji: "\u{1F6E1}\uFE0F",
      label: "Shield Protocol",
      subtitle: "Deep root defense active",
      cssClass: "is-shield"
    },
    GOD_MODE: {
      emoji: "\u{1F441}\uFE0F",
      label: "SANTENMOKU PROTOCOL: ENGAGED",
      subtitle: "Three-Eyes (\u4E09\u5929\u76EE) physical override",
      cssClass: "is-god-mode"
    },
    BLOCKED: {
      emoji: "\u{1F534}",
      label: "ERROR 403 / DEADLOCK",
      subtitle: "100% execution deadlock",
      cssClass: "is-blocked"
    }
  },
  /** Step 1 Pipeline Bar — Master Preset Controller (trade modes) */
  TRADE_MODES: {
    SHIELD: {
      label: "Shield",
      button: "[ \u{1F6E1}\uFE0F R6: Shield ]",
      status: "MAX DEFENSE (ALL 20 ROOTS)",
      root: 6,
      desc: "Default Security Mode. Unlocked (0 TXs). Enforces all 20-Root defenses and macro gates."
    },
    TACTICAL: {
      label: "Tactical",
      button: "[ \u2694\uFE0F R13: Tactical ]",
      status: "BALANCED DEFENSE",
      root: 13,
      lockTip: "Requires \u2265 5 HL TXs to unlock",
      desc: "Unlocked via \u2265 5 HL Wallet TXs. Streamlines macro gates while keeping dynamic Max SL & Soil Check active."
    },
    FLASH: {
      label: "Flash",
      button: "[ \u26A1 R18: Flash ]",
      status: "HIGH SPEED DIRECT ACCESS",
      lamp: "HIGH SPEED",
      root: 18,
      lockTip: "Requires \u2265 20 HL TXs",
      desc: "Pro Sniper Mode. Unlocked via \u2265 20 HL Wallet TXs. Direct access to Step 3 with welded Root 1 (Dynamic Max SL) & Root 8 (Slippage Breaker)."
    }
  },
  /** 5-Sec Quick Guide modal steps */
  QUICK_TOUR: {
    TITLE: "5-Sec Quick Guide",
    CTA: "[ \u{1F680} START EXECUTION / ENTER SANDBOX ]",
    STEP1: {
      title: "Gatekeeper & Preset Roles",
      roots: "[R5/R6/R13]",
      desc: "Monitors macro volatility, session locks, and preset defense modes (Shield/Tactical/Flash) to unlock execution pathways."
    },
    STEP2: {
      title: "Weak Target Radar",
      roots: "[R11/R12/R16]",
      desc: "Filters venue funding rate extremes and cross-venue yield discrepancies to lock optimal delta-neutral targets."
    },
    STEP3: {
      title: "Sniper Shield & Risk Engine",
      roots: "[R1/R3/R8]",
      desc: "Calculates dynamic order size based on soil resistance while enforcing Effective Max SL = (Equity \xD7 1%) + $100."
    },
    STEP4: {
      title: "Live Vault & Review Logs",
      roots: "[R14/R17/R19/R20]",
      desc: "Real-time vault position telemetry, ClOID order tracking, and automated post-trade review closure."
    }
  },
  /** Demo Control Hub — Risk Toggle labels + tooltips */
  DEMO_HUB: {
    INTRO: "Centralized risk simulation switches \xB7 Does not affect live on-chain execution.",
    TELEMETRY_INTRO: "20-Root Defense Matrix grouped by Step 1\u20134 Tier Levels \xB7 Hover any Root for algorithm tip",
    WALLET_TX_LEVEL: {
      label: "[ Wallet TX Level Override ]",
      desc: "Mock HL wallet fill count to unlock Shield / Tactical / Flash micro-tabs for demo.",
      options: {
        SHIELD: "0 TXs (Shield Only)",
        TACTICAL: "5 TXs (Unlock Tactical)",
        FLASH: "20+ TXs (Unlock All / Flash)"
      }
    },
    ROOT8_SLIPPAGE: {
      label: "[ Root 8: Slippage Breaker Demo ]",
      desc: "Simulates physical slippage breaker triggers to force circuit locks."
    },
    ROOT10_SETTLEMENT: {
      label: "[ Root 10: Settlement Lockdown Sim ]",
      desc: "Simulates Hyperliquid funding rate settlement volatility locks."
    },
    ROOT11_FUNDING: {
      label: "[ Root 11: Funding Extreme Sim ]",
      desc: "Simulates extreme funding rate spikes to trigger long/short crowding warnings."
    },
    ROOT13_GATEKEEPER: {
      label: "[ Root 13: Gatekeeper Switch ]",
      desc: "Toggles session gatekeeper authorization status (PASS / BLOCKED)."
    },
    CRI_TELEMETRY: {
      label: "ROOT DEFENSE MATRIX",
      desc: ROOT_DEFENSE_MATRIX_TOOLTIP_DESC
    },
    CRI_CONTROL: {
      label: "[ ROOT DEFENSE MATRIX State Control ]",
      desc: "Manual ROOT DEFENSE MATRIX override presets for demo walkthroughs. Instantly updates Main Header score, status bar, and DonDon IP visual state.",
      presets: {
        NOMINAL: "[ NOMINAL: 100 ]",
        WARNING: "[ WARNING: 50 ]",
        TOXIC: "[ TOXIC: 20 ]",
        GOD: "[ DEFCON 1 ]"
      },
      presetTips: {
        NOMINAL: "Instantly sets ROOT DEFENSE MATRIX to 100 \u2014 optimal green HUD and calm DonDon IP state.",
        WARNING: "Sets ROOT DEFENSE MATRIX to 50 \u2014 amber warning band; mirrors elevated macro stress.",
        TOXIC: "Sets ROOT DEFENSE MATRIX to 20 \u2014 toxic circuit posture; triggers hard execution lockdown demo.",
        GOD: "DEFCON 1 global kill-switch \u2014 maximum emergency posture across all pipeline steps."
      },
      resetBtn: "[ Reset Toxic Lock & Cooldown ]"
    },
    XP_CONTROLS: {
      label: "[ XP / Level Progression Override ]",
      desc: "Mock RPG XP to trigger GROWTH HUD state when ROOT DEFENSE MATRIX \u2264 25. Drives BEGINNER / INTERMEDIATE / EXPERT tier.",
      presets: {
        PLUS_10: "+10 XP",
        RESET: "Reset XP"
      }
    },
    ROOT_TOGGLES: {
      label: "[ 20-Root ROOT DEFENSE MATRIX Toggles ]",
      desc: "Simulate individual Root trips \u2014 immediately recalculates ROOT DEFENSE MATRIX score and updates Main Header + ROOT LED matrix."
    },
    DEFCON1: {
      label: "[ DEFCON 1: Global Emergency Kill-Switch ]",
      desc: "Triggers global circuit kill-switch. Hard-locks all execution steps.",
      toggleBtn: "[ \u{1F6A8} Toggle DEFCON 1 ]"
    }
  },
  /** 20-Root Telemetry — Tier 1–4 pipeline lifecycle groups (Demo Control Hub) */
  ROOT_TELEMETRY_TIERS: {
    TIER1: {
      id: "TIER1",
      badge: "TIER 1",
      emoji: "\u{1F6E1}\uFE0F",
      title: "TIER 1: STEP 1 - MACRO / GEO PRE-TRADE LOCKS",
      header: "TIER 1: STEP 1 - MACRO / GEO LOCKS",
      focus: "Pre-trade physical locks, macro volatility fuses, and geo/session gates",
      roots: [1, 2, 3, 4, 5, 6],
      accent: "emerald"
    },
    TIER2: {
      id: "TIER2",
      badge: "TIER 2",
      emoji: "\u{1F3AF}",
      title: "TIER 2: STEP 2 - TARGET / FUNDING / BASIS SHIELD",
      header: "TIER 2: STEP 2 - TARGET / FUNDING / BASIS",
      focus: "Delta-neutral target selection, yield discrepancy, and settlement locks",
      roots: [7, 8, 9, 10, 11, 12],
      accent: "cyan"
    },
    TIER3: {
      id: "TIER3",
      badge: "TIER 3",
      emoji: "\u26A1",
      title: "TIER 3: STEP 3 - EXECUTION / SLIPPAGE / MAX SL",
      header: "TIER 3: STEP 3 - EXECUTION & SLIPPAGE",
      focus: "Execution path, slippage breakers, Max SL weld, and dispatch locks",
      roots: [13, 14, 15, 16, 17, 18],
      accent: "yellow"
    },
    TIER4: {
      id: "TIER4",
      badge: "TIER 4",
      emoji: "\u{1F4CA}",
      title: "TIER 4: STEP 4 - HKT SETTLEMENT & HARD DEADLOCK",
      header: "TIER 4: STEP 4 - SETTLEMENT & HARD DEADLOCK",
      focus: "HKT settlement gates, ClOID live audit, and hard deadlock closure",
      roots: [19, 20],
      accent: "cyan"
    }
  },
  /** 20-Root Telemetry algorithm tooltips (Demo Control Hub) */
  ROOT_TELEMETRY_TIPS: {
    1: "Dynamic Max SL ceiling = (Account Equity \xD7 1%) + $100 USD regardless of leverage/size.",
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
    12: "Validates spot-perp basis spreads before injecting delta-neutral hedges.",
    13: "Validates active wallet session signature and execution key permissions.",
    14: "Injects unique Client Order IDs to physically prevent double-fill execution.",
    15: "Monitors cross-chain gas spikes and protocol fee friction.",
    16: "Ensures trade size does not exceed 1% of top-of-book depth.",
    17: "Choice A circuit lock: daily loss > Effective Max SL \xD7 3 OR \u2265 3 SL trips per UTC day \u2192 ERROR 403.",
    18: "Enforces underlying Root 1 (Dynamic Max SL) even when Flash Mode bypasses surveys.",
    19: "Real-time order fill tracking and latency telemetry via Worker websockets.",
    20: "Mandatory psychological & execution review gate before unlocking the next trade."
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
    12: "Delta-Neutral Basis Arbitrage Shield",
    13: "Session & Address Auth Gatekeeper",
    14: "ClOID Anti-Replay & Deduplication",
    15: "Friction & Gas Cost Safeguard",
    16: "Order Depth-Impact Circuit Breaker",
    17: "Daily Drawdown Cap (Dynamic SL \xD7 3 \xB7 3 SL/day)",
    18: "Direct Access & Direct Bypass Circuit Lock",
    19: "ClOID Live Order Status & Execution Audit",
    20: "Post-Trade Review Closure"
  }
};
function statusDictionaryJson() {
  return JSON.stringify(STATUS_DICTIONARY);
}
__name(statusDictionaryJson, "statusDictionaryJson");
function strategyDictionaryJson() {
  return JSON.stringify(STRATEGY_DICTIONARY);
}
__name(strategyDictionaryJson, "strategyDictionaryJson");
function metricsDictionaryJson() {
  return JSON.stringify(METRICS_DICTIONARY);
}
__name(metricsDictionaryJson, "metricsDictionaryJson");

// src/v2/services/risk-engine.ts
var ROOT_STATUS_SCORE = {
  PASS: 0,
  WARN: 50,
  TRIPPED: 100
};
var RISK_INDEX_HUD_CONFIG = {
  NOMINAL: {
    band: "NOMINAL",
    badge: "[ STATUS: NOMINAL ]",
    cssClass: "is-nominal",
    scoreClass: "text-emerald-400"
  },
  TOXICITY_ELEVATED: {
    band: "TOXICITY_ELEVATED",
    badge: "[ STATUS: TOXICITY ELEVATED ]",
    cssClass: "is-toxicity-elevated",
    scoreClass: "text-purple-400"
  },
  TOXIC_MODE: {
    band: "TOXIC_MODE",
    badge: "[ TOXIC MODE TRIPPED ]",
    cssClass: "is-toxic-mode",
    scoreClass: "text-cyan-400 animate-pulse"
  }
};
function rootStatusToScore(status) {
  return ROOT_STATUS_SCORE[status];
}
__name(rootStatusToScore, "rootStatusToScore");
function resolveRootStatus(statuses, root) {
  return statuses[root] ?? "PASS";
}
__name(resolveRootStatus, "resolveRootStatus");
function tierAverageScore(statuses, roots) {
  if (roots.length === 0) return 0;
  let sum = 0;
  for (const root of roots) {
    sum += rootStatusToScore(resolveRootStatus(statuses, root));
  }
  return sum / roots.length;
}
__name(tierAverageScore, "tierAverageScore");
function statusesFromTrippedRoots(trippedRoots) {
  const out = {};
  for (const root of trippedRoots) {
    if (root >= 1 && root <= 20) out[root] = "TRIPPED";
  }
  return out;
}
__name(statusesFromTrippedRoots, "statusesFromTrippedRoots");
function calculateRiskScore(statuses) {
  let score = 0;
  for (const tier of CRI_TIER_DEFINITIONS) {
    score += tierAverageScore(statuses, tier.roots) * tier.weight;
  }
  return Math.min(100, Math.round(score));
}
__name(calculateRiskScore, "calculateRiskScore");
function calculateRiskScoreFromTrippedRoots(trippedRoots) {
  return calculateRiskScore(statusesFromTrippedRoots(trippedRoots));
}
__name(calculateRiskScoreFromTrippedRoots, "calculateRiskScoreFromTrippedRoots");
function resolveRiskIndexBand(riskScore) {
  if (riskScore >= TOXIC_MODE_THRESHOLD) return "TOXIC_MODE";
  if (riskScore >= TOXICITY_ELEVATED_THRESHOLD) return "TOXICITY_ELEVATED";
  return "NOMINAL";
}
__name(resolveRiskIndexBand, "resolveRiskIndexBand");
function isToxicModeTripped(riskScore) {
  return riskScore >= TOXIC_MODE_THRESHOLD;
}
__name(isToxicModeTripped, "isToxicModeTripped");
function formatRiskIndexLabel(riskScore) {
  return `RISK INDEX: ${riskScore} / 100`;
}
__name(formatRiskIndexLabel, "formatRiskIndexLabel");

// src/v2/services/root17-daily.ts
function utcDayKey(now = /* @__PURE__ */ new Date()) {
  return now.toISOString().slice(0, 10);
}
__name(utcDayKey, "utcDayKey");
function createRoot17DailyState(now = /* @__PURE__ */ new Date()) {
  return {
    utcDay: utcDayKey(now),
    cumulativeDailyLossUsd: 0,
    dailySlCount: 0
  };
}
__name(createRoot17DailyState, "createRoot17DailyState");
function normalizeRoot17State(state, now = /* @__PURE__ */ new Date()) {
  const today = utcDayKey(now);
  if (state.utcDay === today) return state;
  return createRoot17DailyState(now);
}
__name(normalizeRoot17State, "normalizeRoot17State");
function checkRoot17DailyLimit(input) {
  const now = input.now ?? /* @__PURE__ */ new Date();
  const state = normalizeRoot17State(input.state, now);
  const effectiveMaxSlUsd = computeEffectiveMaxSlUsd(input.accountEquityUsd);
  const maxDailyLossUsd = computeDailyLossCapUsd(input.accountEquityUsd);
  const lossTripped = state.cumulativeDailyLossUsd > maxDailyLossUsd;
  const countTripped = state.dailySlCount >= MAX_DAILY_SL_COUNT;
  const tripped = lossTripped || countTripped;
  let reason;
  if (lossTripped) {
    reason = `ROOT17_DAILY_LOSS_EXCEEDED: $${state.cumulativeDailyLossUsd.toFixed(2)} > $${maxDailyLossUsd.toFixed(2)} cap (Effective Max SL \xD7 3)`;
  } else if (countTripped) {
    reason = `ROOT17_DAILY_SL_COUNT_EXCEEDED: ${state.dailySlCount} >= ${MAX_DAILY_SL_COUNT} UTC-day SL trips`;
  }
  return {
    status: tripped ? "TRIPPED" : "PASS",
    tripped,
    httpStatus: tripped ? 403 : 200,
    ...reason !== void 0 ? { reason } : {},
    maxDailyLossUsd,
    maxDailySlCount: MAX_DAILY_SL_COUNT,
    effectiveMaxSlUsd,
    state
  };
}
__name(checkRoot17DailyLimit, "checkRoot17DailyLimit");
function recordRoot17SlTrip(state, lossUsd, now = /* @__PURE__ */ new Date()) {
  const normalized = normalizeRoot17State(state, now);
  return {
    utcDay: normalized.utcDay,
    cumulativeDailyLossUsd: normalized.cumulativeDailyLossUsd + Math.max(0, Math.abs(lossUsd)),
    dailySlCount: normalized.dailySlCount + 1
  };
}
__name(recordRoot17SlTrip, "recordRoot17SlTrip");

// src/v2/services/step1-engine.ts
var MAX_SL_USD = computeEffectiveMaxSlUsd(
  DEFAULT_ACCOUNT_EQUITY_USD
);
var HL_RESTRICTED_COUNTRIES = [
  "US",
  "CA",
  "CU",
  "IR",
  "KP",
  "SY",
  "GB"
];
var OPEN_SPIKE_START_MIN = 9 * 60 + 15;
var OPEN_SPIKE_END_MIN = 9 * 60 + 45;
var CLOSE_SPIKE_START_MIN = 15 * 60 + 45;
var CLOSE_SPIKE_END_MIN = 16 * 60 + 15;
function resolveUserMode(xp) {
  if (xp < 30) return "BEGINNER";
  if (xp <= 70) return "INTERMEDIATE";
  return "EXPERT";
}
__name(resolveUserMode, "resolveUserMode");
var ROLE_TX_THRESHOLDS = {
  SHIELD: 0,
  TACTICAL: 5,
  FLASH: 20
};
var ROLE_LOCK_TIPS = {
  TACTICAL: "Requires \u2265 5 HL TXs to unlock",
  FLASH: "Requires \u2265 20 HL TXs"
};
function flashHardLocks(accountEquityUsd) {
  return {
    root1_maxSlUsd: computeEffectiveMaxSlUsd(
      sanitizeAccountEquityUsd(accountEquityUsd)
    ),
    root8_maxSlippage: 5e-3
  };
}
__name(flashHardLocks, "flashHardLocks");
var FLASH_HARD_LOCKS = flashHardLocks();
function checkRoleEligibility(input) {
  const walletAddress = String(input.walletAddress || "").trim();
  const raw = Number(input.txCount);
  const txCount = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  const effectiveMaxSlUsd = computeEffectiveMaxSlUsd(
    sanitizeAccountEquityUsd(input.accountEquityUsd)
  );
  const allowedModes = ["SHIELD"];
  const reasons = {};
  if (txCount >= ROLE_TX_THRESHOLDS.TACTICAL) {
    allowedModes.push("TACTICAL");
  } else {
    reasons.TACTICAL = ROLE_LOCK_TIPS.TACTICAL;
  }
  if (txCount >= ROLE_TX_THRESHOLDS.FLASH) {
    allowedModes.push("FLASH");
  } else {
    reasons.FLASH = ROLE_LOCK_TIPS.FLASH;
  }
  const maxMode = allowedModes.includes("FLASH") ? "FLASH" : allowedModes.includes("TACTICAL") ? "TACTICAL" : "SHIELD";
  return {
    walletAddress,
    txCount,
    allowedModes,
    maxMode,
    reasons,
    root1HardWeld: true,
    effectiveMaxSlUsd,
    root8SlippageMax: FLASH_HARD_LOCKS.root8_maxSlippage
  };
}
__name(checkRoleEligibility, "checkRoleEligibility");
function assertFlashHardLocks(accountEquityUsd) {
  const locks = flashHardLocks(accountEquityUsd);
  return {
    root1_lossLock: true,
    root8_slippageLock: true,
    maxLossUSD: locks.root1_maxSlUsd,
    maxSlippage: locks.root8_maxSlippage
  };
}
__name(assertFlashHardLocks, "assertFlashHardLocks");

// src/v2/services/trade-pipeline.ts
var MAX_SL_USD2 = computeEffectiveMaxSlUsd(DEFAULT_ACCOUNT_EQUITY_USD);
function estimateSlipLossUsd(orderSizeUsd, slipRatio) {
  return Math.max(0, orderSizeUsd) * Math.max(0, slipRatio);
}
__name(estimateSlipLossUsd, "estimateSlipLossUsd");
function estimateFrictionLossUsd(orderSizeUsd, frictionRate, fixedCostUsd) {
  return Math.max(0, orderSizeUsd) * Math.max(0, frictionRate) + Math.max(0, fixedCostUsd);
}
__name(estimateFrictionLossUsd, "estimateFrictionLossUsd");
function exceedsMaxRiskBoundary(input) {
  const equity = sanitizeAccountEquityUsd(input.accountEquityUsd);
  const maxSl = computeEffectiveMaxSlUsd(equity);
  const slipLoss = estimateSlipLossUsd(input.orderSizeUsd, input.slipRatio);
  if (slipLoss > maxSl) return true;
  if (input.includeFriction) {
    const frictionLoss = estimateFrictionLossUsd(
      input.orderSizeUsd,
      input.frictionRate ?? 0,
      input.fixedCostUsd ?? 0
    );
    if (frictionLoss > maxSl) return true;
  }
  return false;
}
__name(exceedsMaxRiskBoundary, "exceedsMaxRiskBoundary");
function requiredMarginUsd(orderSizeUsd) {
  return Math.max(0, Number(orderSizeUsd) || 0);
}
__name(requiredMarginUsd, "requiredMarginUsd");
function hasInsufficientMargin(withdrawableCollateral, requiredMargin) {
  return withdrawableCollateral < requiredMargin;
}
__name(hasInsufficientMargin, "hasInsufficientMargin");
var ROOT8_SLIPPAGE_LOCK_LABEL = "[ SOIL TOO LOOSE / SLIPPAGE LIMIT EXCEEDED ]";
function resolveRoot8SlippageLock(input) {
  const symbol = String(input.symbol ?? "").trim();
  const hlSpot = Number(input.hlSpot);
  const hlPerp = Number(input.hlPerp);
  const dydxRaw = Number(input.dydxPerp);
  const dydxPerp = Number.isFinite(dydxRaw) && dydxRaw > 0 ? dydxRaw : 0;
  if (symbol && Number.isFinite(hlSpot) && Number.isFinite(hlPerp) && hlSpot > 0 && hlPerp > 0) {
    const soil = checkSoilResistance({
      symbol,
      hlSpot,
      hlPerp,
      dydxPerp
    });
    if (soil.tripped) {
      return {
        locked: true,
        reason: "ROOT8_SLIPPAGE_EXCEEDED",
        label: ROOT8_SLIPPAGE_LOCK_LABEL
      };
    }
  }
  if (input.slipRatio > MAX_SLIPPAGE) {
    return {
      locked: true,
      reason: "ROOT8_SLIPPAGE_EXCEEDED",
      label: ROOT8_SLIPPAGE_LOCK_LABEL
    };
  }
  return null;
}
__name(resolveRoot8SlippageLock, "resolveRoot8SlippageLock");
function resolveAttackLock(input) {
  const now = input.now ?? Date.now();
  if (input.executionDisabled) {
    return {
      locked: true,
      reason: "EXECUTION_DISABLED",
      label: "LOCKED / EXECUTION DISABLED"
    };
  }
  const riskScore = input.riskScore ?? 0;
  const cooldownUntil = input.toxicCooldownUntil ?? 0;
  if (isToxicModeTripped(riskScore) || cooldownUntil > now) {
    const remainingSec = cooldownUntil > now ? Math.ceil((cooldownUntil - now) / 1e3) : 0;
    const cooldownSuffix = remainingSec > 0 ? ` \xB7 COOLDOWN ${remainingSec}s` : "";
    return {
      locked: true,
      reason: "TOXIC_MODE",
      label: `[ TOXIC MODE TRIPPED \xB7 EXECUTION LOCKED${cooldownSuffix} ]`
    };
  }
  if (input.auditReadOnly) {
    return {
      locked: true,
      reason: "AUDIT_READ_ONLY",
      label: "[ AUDIT READ-ONLY MODE \xB7 EXECUTION DISABLED ]"
    };
  }
  if (input.root17Tripped) {
    return {
      locked: true,
      reason: "ROOT17_DAILY_LIMIT",
      label: "[ ROOT 17: DAILY DRAWDOWN / SL CAP \xB7 ERROR 403 ]"
    };
  }
  if (!input.step3Unlocked) {
    return {
      locked: true,
      reason: "STEP3_LOCKED",
      label: "LOCKED / COMPLETE MODE GATES"
    };
  }
  if (!input.hasTarget) {
    return {
      locked: true,
      reason: "NO_TARGET",
      label: "ATTACK / EXECUTE ORDER"
    };
  }
  const required = requiredMarginUsd(input.orderSizeUsd);
  if (hasInsufficientMargin(input.withdrawableCollateral, required)) {
    return {
      locked: true,
      reason: "INSUFFICIENT_MARGIN",
      label: "INSUFFICIENT MARGIN"
    };
  }
  const root8Lock = resolveRoot8SlippageLock({
    slipRatio: input.slipRatio,
    symbol: input.symbol,
    hlSpot: input.hlSpot,
    hlPerp: input.hlPerp,
    dydxPerp: input.dydxPerp
  });
  if (root8Lock) {
    return root8Lock;
  }
  const equity = sanitizeAccountEquityUsd(input.accountEquityUsd);
  const maxSl = computeEffectiveMaxSlUsd(equity);
  if (exceedsMaxRiskBoundary({
    orderSizeUsd: input.orderSizeUsd,
    slipRatio: input.slipRatio,
    accountEquityUsd: equity
  })) {
    return {
      locked: true,
      reason: "SOIL_EXCEEDS_MAX_SL",
      label: `[ SOIL DANGER: EXCEEDS $${maxSl.toFixed(0)} RISK ]`
    };
  }
  return {
    locked: false,
    reason: null,
    label: "ATTACK / EXECUTE ORDER"
  };
}
__name(resolveAttackLock, "resolveAttackLock");
function dynamicMaxSlLabel(equity = DEFAULT_ACCOUNT_EQUITY_USD) {
  return `$${computeEffectiveMaxSlUsd(equity).toFixed(0)}`;
}
__name(dynamicMaxSlLabel, "dynamicMaxSlLabel");
function dynamicDailyCapLabel(equity = DEFAULT_ACCOUNT_EQUITY_USD) {
  return `$${(computeEffectiveMaxSlUsd(equity) * 3).toFixed(0)}`;
}
__name(dynamicDailyCapLabel, "dynamicDailyCapLabel");
var ROOT_DEFENSE_TELEMETRY = [
  {
    root: 1,
    label: `Max Loss Weld (${dynamicMaxSlLabel()})`,
    defaultStatus: "ENGAGED"
  },
  { root: 2, label: "Geo Jurisdiction Lock", defaultStatus: "READY" },
  { root: 3, label: "checkSoilResistance()", defaultStatus: "ACTIVE" },
  { root: 4, label: "Close Spike Window", defaultStatus: "READY" },
  { root: 5, label: "VIX / DVOL Macro Fuse", defaultStatus: "ACTIVE" },
  {
    root: 6,
    label: "Beginner Cap Gate & Preset Modes",
    defaultStatus: "READY"
  },
  {
    root: 7,
    label: "Pre-Calculated Risk Boundary Lock",
    defaultStatus: "ENGAGED"
  },
  { root: 8, label: "Slippage Breaker (0.5%)", defaultStatus: "ACTIVE" },
  {
    root: 9,
    label: "Cross-Venue Yield Discrepancy",
    defaultStatus: "READY"
  },
  {
    root: 10,
    label: "Settlement Lockdown (<5m Window)",
    defaultStatus: "READY"
  },
  {
    root: 11,
    label: "Funding Extreme Simulation",
    defaultStatus: "READY"
  },
  {
    root: 12,
    label: "Delta-Neutral Basis Arbitrage Shield",
    defaultStatus: "STANDBY"
  },
  {
    root: 13,
    label: "Session & Address Auth Gatekeeper",
    defaultStatus: "ACTIVE"
  },
  {
    root: 14,
    label: "ClOID Anti-Replay & Deduplication",
    defaultStatus: "READY"
  },
  {
    root: 15,
    label: "Friction & Gas Cost Safeguard",
    defaultStatus: "READY"
  },
  {
    root: 16,
    label: "Order Depth-Impact Circuit Breaker",
    defaultStatus: "STANDBY"
  },
  {
    root: 17,
    label: `Daily Drawdown Cap (${dynamicDailyCapLabel()} \xB7 3 SL/day)`,
    defaultStatus: "READY"
  },
  {
    root: 18,
    label: "Direct Access & Direct Bypass Circuit Lock",
    defaultStatus: "READY"
  },
  {
    root: 19,
    label: "ClOID Live Order Status & Execution Audit",
    defaultStatus: "ACTIVE"
  },
  { root: 20, label: "Post-Trade Review Closure", defaultStatus: "ACTIVE" }
];
function resolveRootTelemetryDisplayStatus(row, criStatus) {
  if (criStatus === "TRIPPED") return "TRIPPED";
  if (criStatus === "WARN") return "ENGAGED";
  return row.status ?? row.defaultStatus ?? "PASS";
}
__name(resolveRootTelemetryDisplayStatus, "resolveRootTelemetryDisplayStatus");

// src/v2/services/demo-roles.ts
var DEMO_ROLE_CONFIG = {
  TRADER: {
    id: "TRADER",
    label: "Trader",
    themeClass: "role-trader",
    readOnly: false,
    faultInjection: false,
    orderEntry: true,
    riskPresetOverrides: false,
    telemetryAudit: false,
    masterBreaker: false,
    banner: "[ TRADER MODE \xB7 ORDER ENTRY ENABLED ]"
  },
  AUDITOR: {
    id: "AUDITOR",
    label: "Auditor",
    themeClass: "role-auditor",
    readOnly: true,
    faultInjection: false,
    orderEntry: false,
    riskPresetOverrides: false,
    telemetryAudit: true,
    masterBreaker: false,
    banner: "[ AUDIT READ-ONLY MODE \xB7 20-ROOT TELEMETRY UNLOCKED ]"
  },
  RISK_MANAGER: {
    id: "RISK_MANAGER",
    label: "Risk Manager (Javier)",
    themeClass: "role-risk-manager",
    readOnly: false,
    faultInjection: true,
    orderEntry: true,
    riskPresetOverrides: true,
    telemetryAudit: true,
    masterBreaker: true,
    banner: "[ RISK MANAGER \xB7 FULL RISK SANDBOX UNLOCKED ]"
  }
};
function resolveDemoRole(raw) {
  const id = String(raw ?? "").toUpperCase();
  if (id === "AUDITOR") return "AUDITOR";
  if (id === "RISK_MANAGER" || id === "JAVIER") return "RISK_MANAGER";
  return "TRADER";
}
__name(resolveDemoRole, "resolveDemoRole");
function isDemoReadOnly(role) {
  return DEMO_ROLE_CONFIG[role].readOnly;
}
__name(isDemoReadOnly, "isDemoReadOnly");
function canAccessFaultInjection(role) {
  return DEMO_ROLE_CONFIG[role].faultInjection;
}
__name(canAccessFaultInjection, "canAccessFaultInjection");
function canUseOrderEntry(role) {
  return DEMO_ROLE_CONFIG[role].orderEntry;
}
__name(canUseOrderEntry, "canUseOrderEntry");
function canEditRiskPresets(role) {
  return DEMO_ROLE_CONFIG[role].riskPresetOverrides;
}
__name(canEditRiskPresets, "canEditRiskPresets");
function canAccessTelemetryAudit(role) {
  return DEMO_ROLE_CONFIG[role].telemetryAudit;
}
__name(canAccessTelemetryAudit, "canAccessTelemetryAudit");
function canToggleMasterBreaker(role) {
  return DEMO_ROLE_CONFIG[role].masterBreaker;
}
__name(canToggleMasterBreaker, "canToggleMasterBreaker");

// src/v2/services/client-runtime.ts
function clientRuntimeScript() {
  const fns = [
    normalizeTriggeredRoots,
    calculateRootDefenseMatrixFromStatuses,
    calculateRootDefenseMatrixScore,
    formatRootDefenseMatrixLabel,
    resolveRootDefenseMatrixBand,
    trippedRootsFromStatuses,
    computeEffectiveMaxSlUsd,
    computeDailyLossCapUsd,
    sanitizeAccountEquityUsd,
    dynamicMaxSlPct,
    formatDynSlLockTag,
    estimateSlipLossUsd,
    exceedsMaxRiskBoundary,
    rootStatusToScore,
    resolveRootStatus,
    tierAverageScore,
    calculateRiskScore,
    calculateRiskScoreFromTrippedRoots,
    statusesFromTrippedRoots,
    resolveRiskIndexBand,
    formatRiskIndexLabel,
    isToxicModeTripped,
    getHktHour,
    isTsunamiShieldWindow,
    checkSoilResistance,
    resolveRoot8SlippageLock,
    resolveAttackLock,
    resolveRootTelemetryDisplayStatus,
    checkRoleEligibility,
    assertFlashHardLocks,
    utcDayKey,
    createRoot17DailyState,
    normalizeRoot17State,
    checkRoot17DailyLimit,
    recordRoot17SlTrip,
    resolveUserMode,
    resolveDemoRole,
    isDemoReadOnly,
    canAccessFaultInjection,
    canUseOrderEntry,
    canEditRiskPresets,
    canAccessTelemetryAudit,
    canToggleMasterBreaker,
    enrichSystemStateTaijiBagua,
    resolveActiveGate,
    resolveTaijiMode
  ];
  const constants = `
const DYNAMIC_MAX_SL_BASE_USD = ${DYNAMIC_MAX_SL_BASE_USD};
const DYNAMIC_MAX_SL_BALANCE_RATE = ${DYNAMIC_MAX_SL_BALANCE_RATE};
const DEFAULT_ACCOUNT_EQUITY_USD = ${DEFAULT_ACCOUNT_EQUITY_USD};
const DAILY_LOSS_CAP_MULTIPLIER = ${DAILY_LOSS_CAP_MULTIPLIER};
const MAX_DAILY_SL_COUNT = ${MAX_DAILY_SL_COUNT};
const TOXIC_MODE_THRESHOLD = ${TOXIC_MODE_THRESHOLD};
const TOXICITY_ELEVATED_THRESHOLD = ${TOXICITY_ELEVATED_THRESHOLD};
const TOXIC_MODE_COOLDOWN_MS = ${TOXIC_MODE_COOLDOWN_MS};
const ROLE_TX_THRESHOLDS = ${JSON.stringify(ROLE_TX_THRESHOLDS)};
const ROLE_LOCK_TIPS = ${JSON.stringify(ROLE_LOCK_TIPS)};
const ROOT_DEFENSE_MATRIX_HUD_CONFIG = ${JSON.stringify(ROOT_DEFENSE_MATRIX_HUD_CONFIG)};
const ROOT_DEFENSE_SCORE_MAX = ${ROOT_DEFENSE_SCORE_MAX};
const ROOT_DEFENSE_SCORE_MIN = ${ROOT_DEFENSE_SCORE_MIN};
const TIER_PENALTY_BY_ROOT = ${JSON.stringify(ROOT_DEFENSE_TIER_PENALTY_BY_ROOT)};
const TIER_4_SET = new Set(${JSON.stringify([...ROOT_DEFENSE_TIER_4_ROOTS])});
const RISK_INDEX_HUD_CONFIG = ${JSON.stringify(RISK_INDEX_HUD_CONFIG)};
const ROOT_STATUS_SCORE = ${JSON.stringify(ROOT_STATUS_SCORE)};
const CRI_TIER_DEFINITIONS = ${JSON.stringify(CRI_TIER_DEFINITIONS)};
const MAX_SLIPPAGE = ${MAX_SLIPPAGE};
const MIN_DEPTH_USD = ${MIN_DEPTH_USD};
const HL_RESTRICTED_COUNTRIES = ${JSON.stringify(HL_RESTRICTED_COUNTRIES)};
const DEMO_ROLE_CONFIG = ${JSON.stringify(DEMO_ROLE_CONFIG)};
const BAGUA_GATE_UI = ${JSON.stringify(BAGUA_GATE_UI)};
const TAIJI_MODE_UI = ${JSON.stringify(TAIJI_MODE_UI)};
`.trim();
  return constants + "\n" + fns.map((fn) => fn.toString()).join("\n");
}
__name(clientRuntimeScript, "clientRuntimeScript");

// src/ui/client/store/dashboard-store.ts
var DASHBOARD_STORE_SCRIPT = `
    /** Demo override SSOT \u2014 all Demo Hub writes go through svDemoDispatch */
    window.__SV_DEMO__ = window.__SV_DEMO__ || {
      forceDefcon1: false,
      rootStatus: {},
      rootTripped: {},
      mockHlTxCount: 0,
    };

    function svDemoDispatch(action) {
      if (!action || !action.type) return window.__SV_DEMO__;
      var demo = window.__SV_DEMO__;
      switch (action.type) {
        case 'DEMO_INIT':
          window.__SV_DEMO__ = {
            forceDefcon1: false,
            rootStatus: {},
            rootTripped: {},
            mockHlTxCount: demo.mockHlTxCount || 0,
          };
          break;
        case 'DEMO_TOGGLE_FORCE_DEFCON1':
          demo.forceDefcon1 = !demo.forceDefcon1;
          break;
        case 'DEMO_SET_FORCE_DEFCON1':
          demo.forceDefcon1 = action.value === true;
          break;
        case 'DEMO_SET_ROOT_STATUS': {
          var rootNum = Math.trunc(Number(action.root));
          if (rootNum < 1 || rootNum > 20) break;
          var status = normalizeDevRootStatus(action.status);
          demo.rootStatus[rootNum] = status;
          demo.rootTripped[rootNum] = status === 'TRIPPED';
          break;
        }
        case 'DEMO_CYCLE_ROOT_STATUS': {
          var cycleRoot = Math.trunc(Number(action.root));
          if (cycleRoot < 1 || cycleRoot > 20) break;
          var nextStatus = normalizeDevRootStatus(action.next);
          demo.rootStatus[cycleRoot] = nextStatus;
          demo.rootTripped[cycleRoot] = nextStatus === 'TRIPPED';
          break;
        }
        case 'DEMO_SET_MOCK_HL_TX_COUNT': {
          var tx = Number(action.value);
          if (!Number.isFinite(tx)) break;
          demo.mockHlTxCount = Math.max(0, Math.floor(tx));
          break;
        }
        default:
          break;
      }
      return window.__SV_DEMO__;
    }

    /** @deprecated Legacy shims \u2014 read via __SV_DEMO__ instead */
    Object.defineProperty(window, 'devForceDefcon1', {
      configurable: true,
      enumerable: true,
      get: function() { return window.__SV_DEMO__.forceDefcon1 === true; },
      set: function(v) { svDemoDispatch({ type: 'DEMO_SET_FORCE_DEFCON1', value: v === true }); },
    });
    Object.defineProperty(window, 'devRootStatus', {
      configurable: true,
      enumerable: true,
      get: function() { return window.__SV_DEMO__.rootStatus; },
      set: function(v) {
        if (v && typeof v === 'object') window.__SV_DEMO__.rootStatus = v;
      },
    });
    Object.defineProperty(window, 'devRootTripped', {
      configurable: true,
      enumerable: true,
      get: function() { return window.__SV_DEMO__.rootTripped; },
      set: function(v) {
        if (v && typeof v === 'object') window.__SV_DEMO__.rootTripped = v;
      },
    });
    Object.defineProperty(window, 'devMockHlTxCount', {
      configurable: true,
      enumerable: true,
      get: function() { return window.__SV_DEMO__.mockHlTxCount; },
      set: function(v) {
        svDemoDispatch({ type: 'DEMO_SET_MOCK_HL_TX_COUNT', value: v });
      },
    });

    svDemoDispatch({ type: 'DEMO_INIT' });

    /** Pure reducer \u2014 only the store may assign systemState */
    function reduceSystemStateClient(current, patch) {
      if (!patch || typeof patch !== 'object') return current;
      var balance = Number(patch.accountBalanceUsd);
      var cri = Number(patch.currentCri);
      var maxSl = Number(patch.dynamicMaxSL);
      var merged = {
        accountBalanceUsd: Number.isFinite(balance) ? balance : current.accountBalanceUsd,
        currentCri: Number.isFinite(cri) ? cri : current.currentCri,
        dynamicMaxSL: Number.isFinite(maxSl) ? maxSl : current.dynamicMaxSL,
        hudState: patch.hudState || current.hudState,
        hardlock: patch.hardlock === true || (Number.isFinite(cri) && cri === 0),
        signingChannelOpen: patch.signingChannelOpen !== false && patch.hardlock !== true && !(Number.isFinite(cri) && cri === 0),
        isSandboxMode: patch.isSandboxMode != null ? patch.isSandboxMode === true : current.isSandboxMode === true,
        isStale: patch.isStale != null ? patch.isStale === true : current.isStale === true,
        isHedgeActive: patch.isHedgeActive != null ? patch.isHedgeActive === true : current.isHedgeActive === true,
      };
      if (merged.hardlock || merged.currentCri === 0) {
        merged.signingChannelOpen = false;
      }
      return merged;
    }

    var __svDashboardStore = {
      dispatch: function(action) {
        if (!action || !action.type) return;
        if (action.type === 'SYSTEM_STATE_APPLY') {
          systemState = reduceSystemStateClient(systemState, action.payload || {});
          if (typeof enrichSystemStateTaijiBagua === 'function') {
            var ctx = typeof resolveClientTaijiBaguaContext === 'function'
              ? resolveClientTaijiBaguaContext()
              : { isHedgeActive: systemState.isHedgeActive === true };
            var enriched = enrichSystemStateTaijiBagua(systemState, ctx);
            systemState.taijiMode = enriched.taijiMode;
            systemState.activeGate = enriched.activeGate;
          } else if (action.payload && action.payload.taijiMode) {
            systemState.taijiMode = action.payload.taijiMode;
            systemState.activeGate = action.payload.activeGate || systemState.activeGate;
          }
          if (typeof updateSystemStateUi === 'function') updateSystemStateUi();
          if (typeof refreshTaijiBaguaHud === 'function') refreshTaijiBaguaHud();
          return;
        }
        if (String(action.type).indexOf('DEMO_') === 0) {
          svDemoDispatch(action);
        }
      },
      getState: function() { return systemState; },
    };

    function applySystemState(next) {
      __svDashboardStore.dispatch({ type: 'SYSTEM_STATE_APPLY', payload: next });
    }
`;

// src/ui/risk-client.ts
var RISK_CLIENT_CORE_SCRIPT = `
    function isSystemHardlocked() {
      return (
        systemState.hardlock === true ||
        systemState.currentCri === 0 ||
        systemState.signingChannelOpen === false
      );
    }

    function guardSystemStateHardlock() {
      if (!isSystemHardlocked()) return false;
      addLog('[\u98A8\u63A7\u6B7B\u9396] \u8518\u5929\u6728\u89F8\u767C\u7269\u7406\u6B7B\u9396\uFF0CCRI \u6B78\u96F6\uFF0CHot Key \u7C3D\u540D\u901A\u9053\u5DF2\u5207\u65B7', 'warn');
      return true;
    }

    function syncSystemStateBalanceFromCapital(capitalUsd) {
      const balance = Number(capitalUsd);
      if (!Number.isFinite(balance) || balance <= 0) return;
      applySystemState({
        accountBalanceUsd: balance,
        currentCri: systemState.currentCri,
        dynamicMaxSL: computeEffectiveMaxSlUsd(balance),
        hudState: systemState.hudState,
        hardlock: systemState.hardlock,
        signingChannelOpen: systemState.signingChannelOpen,
      });
    }

    function updateSystemStateUi() {
      const badge = document.getElementById('maxSlLockBadge');
      if (badge) {
        badge.innerText = 'MAX SL $' + Number(systemState.dynamicMaxSL).toFixed(2) + ' LOCK';
      }
      const criBadge = document.getElementById('criHudBadge');
      if (criBadge) {
        criBadge.innerText = 'CRI ' + systemState.currentCri + ' \xB7 ' + systemState.hudState;
        criBadge.className = 'text-[10px] font-mono ml-2 ' + (
          systemState.hudState === 'BLOCKED' ? 'text-red-400 font-black animate-pulse' :
          systemState.hudState === 'SANTENMOKU' ? 'text-rose-300 font-black' :
          systemState.hudState === 'AMBER' ? 'text-amber-300 font-bold' :
          'text-emerald-300/90'
        );
      }
      const cat = document.getElementById('forceRefreshCat');
      if (cat) {
        if (systemState.hudState === 'BLOCKED' || systemState.hudState === 'SANTENMOKU') {
          cat.classList.add('cat-spinner');
        }
      }
      if (typeof updateMasterConsoleSlippage === 'function') {
        updateMasterConsoleSlippage();
      }
    }

    function resolveHudStateClient(currentCri, hardlock, synced) {
      if (synced === undefined) synced = true;
      if (hardlock || currentCri <= 0) return 'BLOCKED';
      if (!synced) return 'IDLE';
      if (currentCri <= 25) return 'SANTENMOKU';
      if (currentCri <= 50) return 'AMBER';
      return 'GREEN';
    }

    function syncCriFromLiveRiskSignals() {
      if (typeof refreshCriAndStatusHud === 'function') {
        refreshCriAndStatusHud();
      }
    }
`;

// src/ui/hud-client.ts
var HUD_CANARY_HEADER = "santenmoku";
var HUD_STREAM_POLL_MS = 150;
var HUD_CLIENT_SCRIPT = `
    let hudStreamPayload = null;
    let hudStreamError = null;
    let hudStreamTimer = null;

    async function fetchHudStream() {
      try {
        const response = await fetch('/api/hud-stream', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'X-Santenmoku-Canary': '${HUD_CANARY_HEADER}',
          },
        });
        const body = await response.json();
        if (!response.ok || body.success !== true) {
          hudStreamPayload = null;
          hudStreamError = body.error || ('HUD stream HTTP ' + response.status);
          return null;
        }
        hudStreamPayload = body;
        hudStreamError = null;
        applyHudStreamPayload(body);
        return body;
      } catch (err) {
        hudStreamPayload = null;
        hudStreamError = err && err.message ? err.message : String(err);
        return null;
      }
    }

    function applyHudStreamPayload(payload) {
      if (!payload || typeof payload !== 'object') return;
      try {

      const left = payload.leftEyeDefense || {};
      const crown = payload.crownTreasuryPnl || {};
      const probe = payload.marketProbe || {};

      if (typeof applySystemState === 'function') {
        applySystemState({
          accountBalanceUsd: crown.accountBalanceUsd != null
            ? crown.accountBalanceUsd
            : systemState.accountBalanceUsd,
          currentCri: crown.criIndex != null ? crown.criIndex : systemState.currentCri,
          dynamicMaxSL: left.dynamicMaxSlUsd != null
            ? left.dynamicMaxSlUsd
            : systemState.dynamicMaxSL,
          hudState: crown.hudState || systemState.hudState,
          hardlock: left.hardlock === true,
          signingChannelOpen: left.hardlock !== true,
        });
      }

      const dynSl = document.getElementById('dynSlLockTag');
      if (dynSl && left.dynamicMaxSlUsd != null && typeof dynamicMaxSlPct === 'function') {
        const pct = dynamicMaxSlPct(10000, systemState.accountBalanceUsd || 10000);
        dynSl.innerHTML = '[ ' + (typeof brandShieldImg === 'function' ? brandShieldImg('brand-shield-icon', 14) : '') +
          ' MAX SL DYNAMIC WELD | DYN-SL: ' + pct.toFixed(2) + '% ($' + Number(left.dynamicMaxSlUsd).toFixed(0) + ' MAX LOSS) ]';
      }

      const soilBadge = document.getElementById('consoleSoilBadge');
      if (soilBadge && left.status) {
        if (left.status === 'PASS') {
          soilBadge.className = 'soil-badge soil-solid w-fit mt-1 sv-tip';
          soilBadge.textContent = '[ SOIL PASS \xB7 HEDGE ACTIVE ]';
        } else if (left.status === 'LOCKED') {
          soilBadge.className = 'soil-badge soil-danger w-fit mt-1 sv-tip';
          soilBadge.textContent = '[ SOIL LOCKED \xB7 CHANNEL SEVERED ]';
        } else {
          soilBadge.className = 'soil-badge soil-balanced w-fit mt-1 sv-tip';
          soilBadge.textContent = '[ SOIL STANDBY \xB7 SENSING ]';
        }
      }

      const pairCountEl = document.getElementById('headerPairCount');
      if (pairCountEl && probe.livePairsCount != null) {
        pairCountEl.textContent = String(probe.livePairsCount) + ' pairs live';
      }

      const bestSymbolEl = document.getElementById('bestPairSymbol');
      if (bestSymbolEl && probe.bestToken && (!bestSymbolEl.textContent || bestSymbolEl.textContent.indexOf('---') >= 0)) {
        bestSymbolEl.textContent = String(probe.bestToken).toUpperCase() + ' / USDC';
      }

      if (probe.selectToken && !selectedConsoleKey) {
        const labelEl = document.getElementById('consoleSelectedLabel');
        if (labelEl) {
          labelEl.className = 'inject-status-badge is-active text-slate-950';
          labelEl.innerHTML = '\u{1F3AF} <span class="font-black">[ ' + String(probe.selectToken).toUpperCase() + ' ]</span> STANDBY';
        }
        if (typeof injectTokenToMasterConsole === 'function') {
          const found = typeof lookupAssetByKey === 'function'
            ? lookupAssetByKey(probe.selectToken)
            : null;
          if (found) injectTokenToMasterConsole(found.key, found.asset);
        }
      }

      if (left.status === 'PASS' && ROOT_DEFENSE_TELEMETRY && ROOT_DEFENSE_TELEMETRY[4]) {
        ROOT_DEFENSE_TELEMETRY[4].status = 'ACTIVE';
      }
      if (typeof refreshCriAndStatusHud === 'function') {
        refreshCriAndStatusHud();
      }
      if (typeof dismissAppBootBanner === 'function') {
        dismissAppBootBanner();
      }
      } catch (err) {
        console.error('[hud-stream] apply payload failed', err);
        if (typeof showDashboardBootError === 'function') {
          showDashboardBootError(err);
        }
      }
    }

    function startHudStreamPoll() {
      if (hudStreamTimer) return;
      void fetchHudStream();
      hudStreamTimer = window.setInterval(function() {
        void fetchHudStream();
      }, ${HUD_STREAM_POLL_MS});
    }
`;

// src/ui/components/dashboard-styles.ts
var DASHBOARD_INLINE_STYLES = `    :root {
      --bg-primary: #051311;
      --bg-card-dark: #0A1A17;
      --bg-card-light: #0F2A24;
      --text-dark-theme: #e8fff0;
      --text-light-theme: #A0FFE0;
      --border-color: rgba(80, 210, 193, 0.18);
      --primary: #50D2C1;
      --accent: #50D2C1;
      --circuit: #50D2C1;
      --glacier: #50D2C1;
      --glacier-dim: #45C4B4;
      --glacier-glow: rgba(80, 210, 193, 0.8);
      --surface-glacier: #0A1A17;
      --copper: #8b5a2b;
      --base-font-size: 1.125rem;
    }
    [data-theme="light"] {
      --bg-primary: #e8f5ec;
      --bg-card-dark: #d4eadc;
      --bg-card-light: #f4fbf6;
      --text-dark-theme: #0A1A17;
      --text-light-theme: #1a3324;
      --border-color: rgba(107, 68, 35, 0.25);
    }
    body {
      background-color: var(--bg-primary);
      background-image:
        linear-gradient(180deg, rgba(5,19,17,0.82) 0%, rgba(5,19,17,0.94) 55%, #051311 100%),
        url('\${BRAND_BANNER_DATA_URI}');
      background-size: cover;
      background-position: center top;
      background-attachment: fixed;
      color: var(--text-dark-theme);
      font-size: var(--base-font-size);
      font-family: 'Inter', -apple-system, sans-serif;
      font-variant-numeric: tabular-nums;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color 0.3s, color 0.3s;
    }
    .font-hud { font-family: 'Inter', -apple-system, sans-serif; }
    .font-mono {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .tabular-nums {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    #marketSessionsBox {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    table, input, button, select {
      font-size: var(--base-font-size) !important;
    }
    .sticky-col-left {
      position: sticky;
      left: 0;
      background-color: var(--bg-card-dark);
      z-index: 10;
    }
    .sticky-col-right {
      position: sticky;
      right: 0;
      background-color: var(--bg-card-dark);
      z-index: 10;
    }
    .draggable { cursor: grab; user-select: none; }
    .draggable:active { cursor: grabbing; }
    .drag-over {
      border: 2px dashed #50D2C1 !important;
      opacity: 0.8;
    }
    .funding-link {
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 0.2s, opacity 0.2s;
    }
    .funding-link:hover { color: #50D2C1 !important; opacity: 0.9; }
    th { position: relative; }
    .resizer {
      position: absolute;
      right: 0; top: 0; height: 100%; width: 5px;
      background: rgba(80, 210, 193, 0.05);
      cursor: col-resize;
      user-select: none;
    }
    .resizer:hover { background: #50D2C1; }
    .sort-asc::after { content: " \u25B2"; font-size: 0.75rem; color: #50D2C1; }
    .sort-desc::after { content: " \u25BC"; font-size: 0.75rem; color: #ef4444; }
    .brand-logo-ring {
      box-shadow: 0 0 0 1px rgba(80,210,193,0.35), 0 0 18px rgba(80,210,193,0.25);
    }
    .circuit-panel {
      border: 1px solid rgba(80,210,193,0.22);
      background: linear-gradient(145deg, rgba(13,40,24,0.92), rgba(8,26,16,0.96));
      box-shadow: inset 0 0 0 1px rgba(139,90,43,0.18);
    }
    .soil-shield {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.15rem;
      padding: 0.25rem 0.45rem;
      border-radius: 9999px;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-align: center;
      line-height: 1.25;
      white-space: nowrap;
    }
    .soil-shield-ok {
      color: #7DFFD0;
      border: 1px solid rgba(52, 211, 153, 0.35);
      background: rgba(16, 185, 129, 0.1);
      box-shadow: none;
    }
    .soil-shield-trip {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: 0.35rem;
      border-radius: 0.5rem;
      padding: 0.35rem 0.55rem;
      white-space: nowrap;
      color: #ff8a8a;
      border: 1px solid rgba(255, 80, 80, 0.55);
      background: rgba(80, 10, 10, 0.45);
      box-shadow: 0 0 12px rgba(255, 60, 60, 0.18);
      font-size: 0.68rem;
      background-image: none;
    }
    .soil-subline {
      font-size: 0.58rem;
      font-weight: 700;
      opacity: 0.9;
      letter-spacing: 0.02em;
    }
    .soil-shield-icon-lg {
      font-size: 3rem;
      line-height: 1;
      filter: drop-shadow(0 0 10px rgba(255,100,100,0.55));
    }
    .soil-shield-icon-attack {
      font-size: 2rem;
      line-height: 1;
      filter: drop-shadow(0 0 8px rgba(80,210,193,0.45));
    }
    .soil-shield-dondon {
      width: 1.75rem; /* w-7 */
      height: auto;
      object-fit: contain;
      display: block;
      margin: 0 auto;
      opacity: 1;
      transition: filter 0.2s ease, transform 0.2s ease;
    }
    .soil-shield-ok .soil-shield-dondon,
    .attack-btn:not(:disabled) .attack-btn-dondon {
      filter: drop-shadow(0 0 6px rgba(80, 210, 193, 0.6));
    }
    .soil-shield-trip .soil-shield-dondon,
    .attack-btn:disabled .attack-btn-dondon,
    .attack-btn.attack-locked .attack-btn-dondon {
      filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.8));
    }
    .attack-btn-dondon {
      width: 1.75rem;
      height: auto;
      max-width: 1.75rem;
      object-fit: contain;
      vertical-align: middle;
    }
    .funding-king-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 900;
      font-size: 1.125rem;
      line-height: 1.2;
      text-decoration: none;
      transition: background 0.15s, box-shadow 0.15s;
      letter-spacing: 0.02em;
    }
    .funding-king-high {
      color: #50D2C1;
      border: 2px solid rgba(80,210,193,0.65);
      background: rgba(80,210,193,0.12);
      box-shadow: 0 0 18px rgba(80,210,193,0.35);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .funding-king-high:hover {
      background: rgba(80,210,193,0.22);
      box-shadow: 0 0 24px rgba(80,210,193,0.5);
    }
    .funding-king-low {
      color: #ff8a8a;
      border: 2px solid rgba(255,80,80,0.65);
      background: rgba(255,80,80,0.12);
      box-shadow: 0 0 18px rgba(255,80,80,0.35);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .funding-king-low:hover {
      background: rgba(255,80,80,0.22);
      box-shadow: 0 0 24px rgba(255,80,80,0.5);
    }
    .funding-kings-bar {
      border: 1px solid rgba(80,210,193,0.35);
      background: linear-gradient(135deg, rgba(80,210,193,0.06), rgba(255,80,80,0.06));
      box-shadow: 0 0 20px rgba(80,210,193,0.12), inset 0 0 0 1px rgba(255,80,80,0.12);
    }
    .countdown-lockdown {
      background: rgba(220, 38, 38, 0.92) !important;
      color: #fff !important;
      border: 2px solid #ff6b6b !important;
      border-radius: 0.5rem;
      padding: 0.35rem 0.75rem;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      animation: pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      box-shadow: 0 0 16px rgba(255, 60, 60, 0.55);
      text-decoration: none !important;
    }
    .vol-filter-panel {
      font-size: 1rem;
    }
    .vol-filter-badge {
      font-size: 0.95rem;
      padding: 0.45rem 0.85rem;
      line-height: 1.35;
      font-weight: 800;
    }
    .oi-king-title {
      font-size: 0.8rem;
      font-weight: 900;
      color: #50D2C1;
      text-shadow: 0 0 10px rgba(80, 210, 193, 0.45);
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }
    .commodity-chip {
      font-size: 0.58rem;
      font-weight: 800;
      padding: 0.28rem 0.45rem;
      border-radius: 0.375rem;
      text-decoration: none;
      transition: background 0.15s, box-shadow 0.15s;
    }
    .commodity-chip:hover {
      box-shadow: 0 0 10px rgba(80,210,193,0.25);
    }
    .tradfi-asset-chip {
      font-size: 0.58rem;
      font-weight: 800;
      padding: 0.32rem 0.48rem;
      border-radius: 0.375rem;
      text-decoration: none;
      transition: background 0.15s, box-shadow 0.15s;
      white-space: nowrap;
    }
    .tradfi-asset-chip:hover {
      box-shadow: 0 0 12px rgba(80,210,193,0.2);
    }
    .emoji-xl {
      font-size: 1.5em;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
    }
    .panel-emoji {
      font-size: 1.5rem;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
    }
    .panel-title-text {
      font-size: 0.875rem;
      font-weight: 800;
    }
    .tradfi-cat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.35rem;
      flex-wrap: wrap;
      border-bottom: 1px solid rgba(80, 210, 193, 0.28);
      padding-bottom: 0.35rem;
      margin-bottom: 0.5rem;
    }
    .tradfi-cat-title {
      font-size: 0.875rem !important;
      font-weight: 800 !important;
      color: #7DFFD0 !important;
      letter-spacing: 0.06em;
      line-height: 1.3;
    }
    .tradfi-top-node-tag {
      position: absolute;
      top: -0.35rem;
      right: -0.2rem;
      font-size: 0.5rem;
      font-weight: 900;
      letter-spacing: 0.03em;
      color: #0b1217;
      background: linear-gradient(135deg, #fcd34d, #50D2C1);
      border: 1px solid rgba(252, 211, 77, 0.9);
      border-radius: 0.25rem;
      padding: 0.06rem 0.32rem;
      line-height: 1.2;
      white-space: nowrap;
      z-index: 3;
      pointer-events: none;
      box-shadow: 0 0 8px rgba(252, 211, 77, 0.45);
    }
    .world-tree-capsule-wrap {
      position: relative;
      padding-top: 1.35rem;
    }
    .world-tree-capsule-wrap .tradfi-root-node-tag {
      position: absolute;
      top: 0;
      right: 0;
      left: auto;
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #0b1217;
      background: linear-gradient(135deg, #fde047, #fbbf24 55%, #f59e0b 100%);
      border: 1px solid rgba(250, 204, 21, 0.95);
      border-radius: 0.4rem;
      padding: 0.2rem 0.55rem;
      line-height: 1.25;
      white-space: nowrap;
      z-index: 5;
      pointer-events: none;
      box-shadow: 0 0 12px rgba(250, 204, 21, 0.55), 0 2px 6px rgba(0, 0, 0, 0.35);
    }
    .world-tree-capsule {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 9.5rem;
      max-width: 100%;
      padding: 0.45rem 0.55rem 0.4rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.75);
      overflow: hidden;
      transition: box-shadow 0.15s, border-color 0.15s;
    }
    .world-tree-capsule:hover {
      border-color: rgba(80, 210, 193, 0.65);
      box-shadow: 0 0 14px rgba(80, 210, 193, 0.2);
    }
    .world-tree-capsule.is-root-node {
      border-color: rgb(250, 204, 21);
      box-shadow: 0 0 10px rgba(250, 204, 21, 0.4), 0 0 0 1px rgba(250, 204, 21, 0.25);
    }
    .world-tree-capsule.crowded-long {
      border-color: rgba(251, 191, 36, 0.75);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.35), inset 0 0 20px rgba(239, 68, 68, 0.08);
      animation: crowded-pulse 2.4s ease-in-out infinite;
    }
    @keyframes crowded-pulse {
      0%, 100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
      50% { box-shadow: 0 0 18px rgba(239, 68, 68, 0.45); }
    }
    .world-tree-oi-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: linear-gradient(90deg, rgba(80, 210, 193, 0.22), rgba(80, 210, 193, 0.06));
      pointer-events: none;
      z-index: 0;
      border-radius: inherit;
    }
    .world-tree-capsule-body {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .world-tree-capsule-main {
      font-size: 0.72rem;
      font-weight: 800;
      line-height: 1.35;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
    }
    .world-tree-capsule-meta {
      font-size: 0.58rem;
      font-weight: 600;
      color: rgba(156, 163, 175, 0.95);
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      line-height: 1.3;
    }
    .world-tree-capsule-actions {
      display: none;
    }
    #tradFiPanel .world-tree-capsule,
    #tradFiPanel .world-tree-capsule button,
    #tradFiPanel .world-tree-capsule a {
      font-family: ui-monospace, 'JetBrains Mono', monospace !important;
    }
    .matrix-category-btn.active {
      border-color: rgba(80, 210, 193, 0.7) !important;
      background: rgba(80, 210, 193, 0.2) !important;
      color: #50D2C1 !important;
    }
    .step2-theory-line {
      font-size: 0.7rem;
      color: rgba(156, 163, 175, 0.95);
      line-height: 1.45;
      margin-top: 0.15rem;
    }
    #tradFiPanel .tradfi-asset-chip,
    #tradFiPanel .tradfi-asset-chip button,
    #tradFiPanel .tradfi-token-price {
      font-size: 0.75rem !important;
      font-family: ui-monospace, 'JetBrains Mono', monospace !important;
      color: #45C4B4 !important;
      opacity: 0.9;
      font-weight: 600;
    }
    #tradFiPanel .tradfi-asset-chip button {
      opacity: 0.95;
    }
    /* \u4E94\u5927 TradFi \u677F\u584A\u6574\u9AD4\u5B57\u9AD4\u6536\u7D30 ~20%\uFF08\u6A19\u984C / \u5361\u7247\u5B57\u7D1A\u5DF2\u65BC\u4E0A\u65B9\u898F\u5247\u4E0B\u4FEE\uFF09 */
    .tradfi-panel-scale .panel-emoji {
      font-size: 1.2rem;
    }
    .tradfi-panel-scale .emoji-xl {
      font-size: 1.2em;
    }
    #matrixTableBody tr.token-row-selected {
      background: rgba(80, 210, 193, 0.12);
      outline: 1px solid rgba(80, 210, 193, 0.45);
    }
    #matrixTableBody tr.matrix-token-row {
      cursor: pointer;
      border-left: 4px solid transparent;
      transition: background 0.15s, border-color 0.15s;
    }
    #matrixTableBody tr.matrix-token-row:hover {
      background: rgba(2, 44, 34, 0.4); /* emerald-950/40 */
      border-left-color: #45C4B4; /* emerald-400 */
    }
    #matrixTableBody td.matrix-symbol-cell,
    #matrixTableBody td.matrix-symbol-cell .token-name-select {
      font-size: calc(1em - 1px);
    }
    .matrix-price-fr-cell {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      line-height: 1.25;
    }
    .matrix-price-fr-cell .matrix-fr-sub {
      font-size: 0.7rem;
      color: #facc15;
      opacity: 0.9;
    }
    .matrix-pagination-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.75rem;
      border-color: var(--border-color);
    }
    .matrix-page-size-btn.active {
      border-color: rgba(80, 210, 193, 0.7) !important;
      background: rgba(80, 210, 193, 0.2) !important;
      color: #50D2C1 !important;
    }
    .matrix-table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.75rem;
      width: 100%;
    }
    .matrix-table-toolbar-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      margin-left: auto;
    }
    .app-footer {
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.12);
    }
    .footer-link-btn {
      background: transparent;
      border: none;
      color: #50D2C1;
      cursor: pointer;
      padding: 0.15rem 0.35rem;
      font: inherit;
      font-weight: 800;
    }
    .footer-link-btn:hover {
      text-decoration: underline;
      color: #7ee0ce;
    }
    .footer-copyright-link {
      color: inherit;
      text-decoration: none;
    }
    .footer-copyright-link:hover {
      color: #7ee0ce;
      text-decoration: underline;
    }
    .footer-x-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #50D2C1;
      line-height: 0;
      padding: 0.15rem 0.35rem;
    }
    .footer-x-link:hover {
      color: #7ee0ce;
    }
    .footer-x-link svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    .legal-modal-body {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-height: min(60vh, 28rem);
      overflow-y: auto;
    }
    .legal-modal-body p {
      margin: 0;
    }
    .legal-modal-body strong {
      color: #50D2C1;
      display: block;
      margin-bottom: 0.35rem;
      font-size: 0.7rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .alpha-edge-panel {
      position: relative;
      border: 2px solid #ffcc33;
      border-image: none;
      background:
        linear-gradient(
          125deg,
          #ff3300 0%,
          #ff5500 28%,
          #ff9900 58%,
          #ffcc44 78%,
          #ff7700 100%
        );
      box-shadow:
        0 0 0 1px rgba(255, 230, 120, 0.55),
        0 0 18px rgba(255, 85, 0, 0.55),
        0 0 42px rgba(255, 153, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 200, 0.55),
        inset 0 -10px 28px rgba(180, 40, 0, 0.28);
      color: #000000;
      animation: alpha-edge-neon-pulse 2.8s ease-in-out infinite;
    }
    @keyframes alpha-edge-neon-pulse {
      0%, 100% {
        box-shadow:
          0 0 0 1px rgba(255, 230, 120, 0.5),
          0 0 16px rgba(255, 85, 0, 0.45),
          0 0 36px rgba(255, 153, 0, 0.28),
          inset 0 1px 0 rgba(255, 255, 200, 0.5),
          inset 0 -10px 28px rgba(180, 40, 0, 0.28);
      }
      50% {
        box-shadow:
          0 0 0 1px rgba(255, 245, 160, 0.75),
          0 0 26px rgba(255, 85, 0, 0.7),
          0 0 56px rgba(255, 200, 40, 0.4),
          inset 0 1px 0 rgba(255, 255, 220, 0.7),
          inset 0 -10px 28px rgba(180, 40, 0, 0.22);
      }
    }
    .alpha-edge-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      z-index: 1;
      background:
        linear-gradient(
          180deg,
          rgba(255, 255, 210, 0.18) 0%,
          transparent 42%,
          transparent 70%,
          rgba(120, 20, 0, 0.1) 100%
        );
    }
    .alpha-edge-panel,
    .alpha-edge-panel * {
      color: #000000;
    }
    .alpha-edge-title {
      color: #1a0500 !important;
      font-weight: 900;
      font-size: 1.05rem;
      letter-spacing: -0.02em;
      text-shadow:
        0 0 10px rgba(255, 220, 120, 0.85),
        0 1px 0 rgba(255, 255, 255, 0.35);
    }
    .alpha-edge-warning {
      color: #d1d5db !important;
      font-weight: 800;
      font-size: 0.8rem;
      line-height: 1.4;
      text-shadow: 0 0 8px rgba(0, 0, 0, 0.35);
    }
    .alpha-edge-tokens {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    }
    .alpha-edge-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.78rem;
      font-weight: 900;
      font-family: 'Akkurat Mono', 'JetBrains Mono', 'Fira Code', monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      padding: 0.4rem 0.65rem;
      border-radius: 0.375rem;
      text-decoration: none;
      white-space: nowrap;
      border: 2px solid;
      box-shadow: 0 0 12px rgba(0, 0, 0, 0.25);
    }
    .alpha-edge-chip-up {
      color: #064e3b !important;
      border-color: #064e3b;
      background: rgba(80, 210, 193, 0.32);
    }
    .alpha-edge-chip-down {
      color: #7f1d1d !important;
      border-color: #7f1d1d;
      background: rgba(255, 80, 80, 0.28);
    }
    .alpha-edge-fish-overlay {
      opacity: 0.26;
      mix-blend-mode: normal;
      filter: saturate(1.05) brightness(0.92) contrast(1.05);
    }
    .dex-settlement-box {
      background: #50D2C1;
      border: 2px solid rgba(11, 18, 23, 0.35);
      color: #0b1217;
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.35);
    }
    .dex-settlement-box.settlement-demo-locked {
      background: #0b1217;
      border-color: #50D2C1;
      color: #50D2C1;
      box-shadow: 0 0 22px rgba(80, 210, 193, 0.45);
    }
    .market-sessions-title {
      font-size: 1.5rem;
      line-height: 1.2;
      font-weight: 900;
    }
    .asia-market-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.45rem;
      border-radius: 0.35rem;
      font-size: 0.65rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(80, 210, 193, 0.35);
      color: #50D2C1;
    }
    .tradfi-draggable { cursor: grab; user-select: none; }
    .tradfi-draggable:active { cursor: grabbing; }
    .connect-wallet-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      border-radius: 0.65rem;
      font-weight: 900;
      font-size: 0.85rem;
      letter-spacing: -0.02em;
      color: #0b1217;
      background: linear-gradient(135deg, #50D2C1 0%, #45C4B4 100%);
      border: 2px solid rgba(11, 18, 23, 0.35);
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.45);
      transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
    }
    .connect-wallet-btn:hover {
      filter: brightness(1.06);
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.65);
      transform: translateY(-1px);
    }
    .connect-wallet-btn.connected {
      background: #0b1217;
      color: #50D2C1;
      border-color: #50D2C1;
    }
    .wallet-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 80;
      background: rgba(0, 0, 0, 0.72);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .wallet-modal {
      width: min(420px, 100%);
      border-radius: 1rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: linear-gradient(160deg, #0A1F1A, #051311);
      padding: 1.25rem;
      box-shadow: 0 0 40px rgba(80, 210, 193, 0.25);
    }
    .us-macro-card {
      min-width: 220px;
    }
    .us-macro-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.72rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      padding: 0.25rem 0;
      border-bottom: 1px solid rgba(80, 210, 193, 0.12);
    }
    .us-macro-row:last-child { border-bottom: none; }
    .sentiment-ext-link {
      text-decoration: none;
      margin-left: 0.25rem;
      opacity: 0.9;
    }
    .sentiment-ext-link:hover { opacity: 1; filter: brightness(1.2); }
    .gatekeeper-screen {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(ellipse at center, rgba(80, 210, 193, 0.12), transparent 55%),
        #051311;
      padding: 1.5rem;
    }
    .gatekeeper-card {
      max-width: 560px;
      width: 100%;
      text-align: center;
      border: 2px solid rgba(80, 210, 193, 0.45);
      background: rgba(11, 18, 23, 0.92);
      border-radius: 1rem;
      padding: 2rem 1.5rem;
      box-shadow: 0 0 40px rgba(80, 210, 193, 0.2);
    }
    .tsunami-shield-lamp {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: 900;
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      color: #ff8a8a;
      border: 2px solid rgba(255, 100, 100, 0.55);
      background: rgba(80, 10, 10, 0.45);
      box-shadow: 0 0 16px rgba(255, 60, 60, 0.35);
      animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .funding-yield-fact {
      font-size: 0.7rem;
      color: rgba(80, 210, 193, 0.75);
      font-weight: 600;
      letter-spacing: 0.02em;
      margin-top: 0.35rem;
    }
    .soil-subline {
      font-size: 0.55rem;
      font-weight: 600;
      opacity: 0.85;
      letter-spacing: 0.02em;
    }
    .soil-token-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
      max-width: 100%;
    }
    .soil-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.58rem;
      font-weight: 900;
      font-family: 'Akkurat Mono', 'JetBrains Mono', 'Fira Code', monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      padding: 0.18rem 0.4rem;
      border-radius: 0.3rem;
      border: 1px solid;
      white-space: nowrap;
      cursor: help;
    }
    .soil-solid {
      color: #50D2C1;
      border-color: rgba(80, 210, 193, 0.55);
      background: rgba(80, 210, 193, 0.1);
    }
    .soil-balanced {
      color: #45C4B4;
      border-color: rgba(0, 229, 153, 0.55);
      background: rgba(0, 229, 153, 0.12);
    }
    .soil-loose {
      color: #FFD700;
      border-color: rgba(255, 215, 0, 0.55);
      background: rgba(255, 215, 0, 0.12);
    }
    .soil-danger {
      color: #FF4D4D;
      border-color: rgba(255, 77, 77, 0.7);
      background: rgba(255, 77, 77, 0.16);
      box-shadow: 0 0 10px rgba(255, 77, 77, 0.35);
      animation: pulse 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    /* Radix-compatible status tooltips (vanilla dashboard surface) */
    .sv-tip {
      cursor: help;
      border-bottom: 1px dotted rgba(80, 210, 193, 0.4);
      outline: none;
    }
    .sv-tip:focus-visible {
      box-shadow: 0 0 0 2px rgba(80, 210, 193, 0.45);
      border-radius: 0.25rem;
    }
    #svTooltipRoot {
      position: fixed;
      z-index: 10050;
      max-width: min(20rem, calc(100vw - 1.5rem));
      padding: 0.55rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(16, 185, 129, 0.4);
      background: rgba(15, 23, 42, 0.92);
      color: #A0FFE0;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.7rem;
      font-weight: 700;
      line-height: 1.45;
      letter-spacing: 0.01em;
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.22), 0 12px 32px rgba(0, 0, 0, 0.55);
      pointer-events: none;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.12s ease, transform 0.12s ease;
      white-space: normal;
    }
    #svTooltipRoot[data-state="open"] {
      opacity: 1;
      transform: translateY(0);
    }
    #svTooltipRoot .sv-tip-label {
      display: block;
      color: #50D2C1;
      margin-bottom: 0.3rem;
      font-weight: 900;
    }
    .soil-tooltip {
      display: none;
      position: absolute;
      left: 0;
      bottom: calc(100% + 8px);
      z-index: 40;
      min-width: 220px;
      padding: 0.75rem 0.85rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      background: #0b1217;
      color: #e8fff0;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55), 0 0 18px rgba(80, 210, 193, 0.2);
      font-family: 'Akkurat Mono', 'JetBrains Mono', 'Fira Code', monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      pointer-events: none;
    }
    .soil-token-wrap:hover .soil-tooltip,
    .soil-king-wrap:hover .soil-tooltip {
      display: block;
    }
    .soil-tooltip-title {
      font-size: 0.68rem;
      font-weight: 900;
      color: #50D2C1;
      margin-bottom: 0.45rem;
    }
    .soil-tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.18rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .soil-tooltip-row:last-child { border-bottom: none; }
    .soil-king-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      flex-wrap: wrap;
      width: 100%;
    }
    .root-slip-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(80, 210, 193, 0.06);
      font-family: 'Akkurat Mono', 'JetBrains Mono', 'Fira Code', monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .root-slip-status.tripped {
      border-color: rgba(251, 146, 60, 0.55);
      background: rgba(251, 146, 60, 0.1);
    }
    .dondon-eyes {
      width: 140px;
      max-width: 140px;
      height: auto;
      object-fit: contain;
      opacity: 0.8;
      transition: all 0.3s ease;
      vertical-align: middle;
    }
    .dondon-eyes:hover,
    .dondon-eyes.dondon-awake,
    .attack-armed .dondon-eyes,
    button:hover .dondon-eyes {
      opacity: 1;
      transform: scale(1.05);
      filter: drop-shadow(0 0 12px rgba(80, 210, 193, 0.8));
    }
    .dondon-eyes-lg {
      width: 140px;
      max-width: 140px;
      height: auto;
    }
    .dondon-eyes-inline {
      width: 140px;
      max-width: 140px;
    }
    .section-header {
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #45C4B4;
    }
    .step-badge {
      display: inline-flex;
      align-items: center;
      color: #45C4B4;
      border: 1px solid rgba(16, 185, 129, 0.5);
      padding: 0.125rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 800;
      font-family: var(--font-mono, ui-monospace, monospace);
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .token-price-link {
      font-size: 0.875rem;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-weight: 700;
      color: #45C4B4;
      text-decoration: none;
    }
    .token-price-link:hover {
      text-decoration: underline;
      color: #7DFFD0;
    }
    .tradfi-token-price,
    #tradFiPanel .token-price-link {
      font-size: 0.75rem !important;
      font-family: ui-monospace, 'JetBrains Mono', monospace !important;
      font-weight: 700 !important;
      opacity: 0.8;
      color: #45C4B4 !important;
    }
    .alpha-edge-chip .text-emerald-300,
    .alpha-edge-price {
      font-size: 1.25rem !important;
      font-family: ui-monospace, 'JetBrains Mono', monospace !important;
      font-weight: 800 !important;
      color: #7DFFD0 !important;
    }
    .step1-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .step1-header-sentiment {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-left: auto;
    }
    .step1-sentiment-micro {
      font-size: 0.65rem;
      font-weight: 800;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      white-space: nowrap;
      border: 1px solid;
    }
    .step1-sessions-mint {
      background: #a8f0e6 !important;
      color: #0f172a !important;
      border: 2px solid rgba(16, 185, 129, 0.45) !important;
      box-shadow: 0 0 12px rgba(168, 240, 230, 0.35);
    }
    .step1-sessions-mint .section-header,
    .step1-sessions-mint #marketSessionsTitle,
    .step1-sessions-mint .asia-market-chip {
      color: #0f172a !important;
    }
    .step1-sessions-mint .asia-market-chip {
      background: rgba(255, 255, 255, 0.45) !important;
      border-color: rgba(15, 23, 42, 0.15) !important;
    }
    .alien-sandbox-hero,
    .aquarium-springs-hero {
      background: #0b1317 !important;
      border: 1px solid rgba(245, 158, 11, 0.4) !important;
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.15) !important;
      min-height: 100%;
      color: #e5e7eb !important;
    }
    .alien-sandbox-title,
    .aquarium-springs-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fbbf24 !important;
      text-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
      letter-spacing: -0.02em;
    }
    .aquarium-dark-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      background: linear-gradient(
        to top,
        #0b1317 0%,
        rgba(11, 19, 23, 0.7) 55%,
        rgba(11, 19, 23, 0.3) 100%
      );
    }
    .step1-col-left {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 0;
    }
    .step1-sentiment-slot {
      min-height: 7rem;
    }
    .step1-aquarium-slot {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
    }
    .step1-col-center {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-height: 0;
    }
    .world-tree-capsule-capacity {
      font-size: 0.78rem;
      font-weight: 800;
      line-height: 1.4;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
    }
    .world-tree-capsule-price {
      font-size: 0.68rem;
      font-weight: 700;
      line-height: 1.35;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      color: #7DFFD0;
      opacity: 0.88;
    }
    .world-tree-capsule-price a,
    .world-tree-capsule-price .hl-trade-icon-link {
      color: #7DFFD0;
      opacity: 0.92;
      text-decoration: none;
      font-weight: 800;
    }
    .world-tree-capsule-price a:hover,
    .world-tree-capsule-price .hl-trade-icon-link:hover {
      color: #A0FFE0;
      opacity: 1;
      text-decoration: underline;
    }
    .world-tree-oi-highlight {
      color: #7DFFD0;
      font-weight: 800;
    }
    .world-tree-fr-highlight {
      color: #facc15;
      font-weight: 800;
    }
    #step1ColLeft .vol-filter-badge,
    #step1ColCenter .vol-filter-badge,
    #step1LeftPanel .vol-filter-badge {
      font-size: 1rem;
      line-height: 1.45;
      padding: 0.55rem 0.8rem;
      font-weight: 800;
    }
    #step1ColCenter .asia-market-chip,
    #step1ColLeft .asia-market-chip,
    #step1LeftPanel .asia-market-chip {
      font-size: 0.875rem;
      padding: 0.45rem 0.7rem;
      white-space: nowrap;
      font-weight: 700;
    }
    #step1ColCenter .us-macro-row,
    #step1ColLeft .us-macro-row,
    #step1LeftPanel .us-macro-row {
      font-size: 1rem;
      padding: 0.45rem 0;
    }
    #step1ColCenter .section-header,
    #step1ColLeft .section-header,
    #step1LeftPanel .section-header {
      font-size: 1.05rem;
    }
    .step1-glacier-card {
      background: rgba(6, 32, 27, 0.8);
      border: 1px solid rgba(80, 210, 193, 0.3);
      box-shadow: 0 0 15px rgba(80, 210, 193, 0.1);
    }
    .step1-sessions-card {
      overflow: visible;
    }
    .step1-col-center,
    .step1-left-panel {
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: linear-gradient(145deg, rgba(11, 18, 23, 0.96), rgba(13, 40, 24, 0.9));
      transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
      padding: 0.75rem;
      border-radius: 0.75rem;
    }
    .step1-col-left.all-red-mode,
    .step1-col-center.all-red-mode,
    .step1-left-panel.all-red-mode {
      background: rgba(69, 10, 10, 0.9) !important;
      border: 2px solid #ef4444 !important;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.5);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      color: #fecaca;
    }
    .step1-col-center.all-red-mode .section-header,
    .step1-col-center.all-red-mode .us-macro-row,
    .step1-col-center.all-red-mode .asia-market-chip,
    .step1-col-center.all-red-mode #marketSessionsTitle,
    .step1-col-center.all-red-mode a,
    .step1-col-left.all-red-mode .section-header,
    .step1-col-left.all-red-mode .us-macro-row,
    .step1-col-left.all-red-mode .asia-market-chip,
    .step1-col-left.all-red-mode #marketSessionsTitle,
    .step1-col-left.all-red-mode a,
    .step1-left-panel.all-red-mode .section-header,
    .step1-left-panel.all-red-mode .us-macro-row,
    .step1-left-panel.all-red-mode .asia-market-chip,
    .step1-left-panel.all-red-mode #marketSessionsTitle,
    .step1-left-panel.all-red-mode a {
      color: #fecaca !important;
    }
    .step1-col-center.all-red-mode #macroCpiCountdown,
    .step1-col-center.all-red-mode #macroEcbCountdown,
    .step1-col-center.all-red-mode #macroBojCountdown,
    .step1-col-center.all-red-mode #macroFomcCountdown,
    .step1-col-left.all-red-mode #macroCpiCountdown,
    .step1-col-left.all-red-mode #macroEcbCountdown,
    .step1-col-left.all-red-mode #macroBojCountdown,
    .step1-col-left.all-red-mode #macroFomcCountdown,
    .step1-left-panel.all-red-mode #macroCpiCountdown,
    .step1-left-panel.all-red-mode #macroEcbCountdown,
    .step1-left-panel.all-red-mode #macroBojCountdown,
    .step1-left-panel.all-red-mode #macroFomcCountdown {
      color: #fdba74 !important;
    }
    .step1-col-center.all-red-mode .us-macro-card,
    .step1-col-center.all-red-mode .step1-glacier-card,
    .step1-col-center.all-red-mode .circuit-panel,
    .step1-col-center.all-red-mode .vol-filter-panel,
    .step1-col-center.all-red-mode .dex-settlement-box,
    .step1-col-left.all-red-mode .us-macro-card,
    .step1-col-left.all-red-mode .step1-glacier-card,
    .step1-col-left.all-red-mode .circuit-panel,
    .step1-col-left.all-red-mode .vol-filter-panel,
    .step1-left-panel.all-red-mode .us-macro-card,
    .step1-left-panel.all-red-mode .step1-glacier-card,
    .step1-left-panel.all-red-mode .circuit-panel,
    .step1-left-panel.all-red-mode .vol-filter-panel {
      border-color: rgba(239, 68, 68, 0.45) !important;
      background: rgba(0, 0, 0, 0.25) !important;
      box-shadow: none !important;
    }
    .step1-all-red-banner {
      font-size: 0.95rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      text-align: center;
      padding: 0.65rem 0.85rem;
      border-radius: 0.5rem;
      background: rgba(127, 29, 29, 0.85);
      border: 1px solid #f87171;
      color: #fed7aa;
      text-shadow: 0 0 12px rgba(239, 68, 68, 0.55);
    }
    .hl-trade-icon-link {
      font-size: 0.7rem;
      color: #50D2C1;
      text-decoration: none;
      font-weight: 800;
      white-space: nowrap;
    }
    .hl-trade-icon-link:hover {
      text-decoration: underline;
      opacity: 1;
    }
    .tour-modal,
    .sop-guide-modal {
      max-width: 48rem;
      max-height: 88vh;
      overflow: hidden;
      width: 94%;
      background: #0d131a;
      border: 2px solid rgba(80, 210, 193, 0.55);
      border-radius: 1.25rem;
      padding: 0;
      box-shadow:
        0 0 0 1px rgba(80, 210, 193, 0.15),
        0 0 48px rgba(80, 210, 193, 0.28),
        0 24px 64px rgba(0, 0, 0, 0.55);
    }
    .brand-hero-header {
      position: relative;
      height: 12rem;
      background-image: url('/brand/dondon-eyes.webp');
      background-size: cover;
      background-position: center;
      overflow: hidden;
    }
    .brand-hero-header--section {
      position: relative;
      height: auto;
      min-height: 0;
      border-radius: 0.75rem 0.75rem 0 0;
      background-image: none;
      background-color: #50D2C1;
      border-bottom: 1px solid rgba(15, 23, 42, 0.18);
      box-shadow: 0 0 15px rgba(80, 210, 193, 0.35);
      transition: all 0.15s ease;
    }
    .brand-hero-header--section .brand-hero-header-overlay {
      display: none;
    }
    .inject-header-stack {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 2.75rem 0.75rem 0.75rem;
      width: 100%;
      text-align: center;
    }
    .inject-header-subtitle {
      margin: 0;
      max-width: 100%;
      line-height: 1.35;
      color: rgb(15 23 42 / 0.8);
    }
    .brand-hero-header--matrix {
      min-height: 10.5rem;
      height: auto;
      border-radius: 0;
      background-image: none;
      background-color: #0d131a;
    }
    .brand-hero-header--matrix::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('/brand/dondon-eyes.webp');
      background-size: cover;
      background-position: center;
      opacity: 0.8;
      pointer-events: none;
      z-index: 0;
    }
    .brand-hero-header--matrix .brand-hero-header-overlay {
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
      z-index: 0;
    }
    .sop-guide-modal .brand-hero-header {
      border-radius: 1.1rem 1.1rem 0 0;
    }
    .brand-hero-title {
      margin: 0;
      font-size: 1.5rem;
      line-height: 1.2;
      font-weight: 700;
      color: #45C4B4;
      text-shadow: 0 0 24px rgba(52, 211, 153, 0.45), 0 2px 8px rgba(0, 0, 0, 0.85);
      letter-spacing: -0.02em;
    }
    .brand-hero-title--section {
      font-size: 1.25rem;
    }
    .brand-hero-subtitle {
      margin: 0.35rem 0 0;
      font-size: 0.8rem;
      line-height: 1.4;
      font-weight: 700;
      color: rgba(167, 243, 208, 0.82);
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.85);
    }
    .brand-hero-close {
      position: absolute;
      top: 0.85rem;
      right: 0.85rem;
      z-index: 2;
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.45);
      color: #d1d5db;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .brand-hero-close:hover {
      background: rgba(80, 210, 193, 0.2);
      border-color: rgba(80, 210, 193, 0.55);
      color: #fff;
    }
    .sop-guide-body {
      padding: 2rem;
      overflow-y: auto;
      max-height: calc(88vh - 12rem);
    }
    .sop-guide-steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .sop-guide-step h3 {
      color: #50D2C1;
      font-weight: 900;
      font-size: 1.125rem;
      line-height: 1.4;
      margin: 0 0 0.65rem;
    }
    .sop-guide-step p,
    .sop-guide-step li {
      color: #d1d5db;
      font-size: 1rem;
      line-height: 1.65;
      margin: 0;
    }
    .sop-guide-step ul {
      margin: 0 0 0.75rem;
      padding-left: 1.25rem;
    }
    .sop-guide-step p + p {
      margin-top: 0.5rem;
    }
    .sop-book-link {
      color: #7DFFD0;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 0.2s;
      font-weight: 700;
    }
    .sop-book-link:hover {
      color: #ecfdf5;
    }
    .inject-status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0;
      border-radius: 0;
      border: none;
      background: transparent;
      color: #020617;
      font-size: 1.05rem;
      line-height: 1.25;
      font-weight: 900;
      letter-spacing: 0.02em;
      white-space: normal;
      text-align: center;
      text-shadow: none;
      box-shadow: none;
    }
    .inject-status-badge.is-pending {
      color: rgb(15 23 42 / 0.75);
      font-size: 0.95rem;
      font-weight: 700;
      background: transparent;
      border: none;
      animation: injectPulse 1.4s ease-in-out infinite;
    }
    .inject-status-badge.is-active {
      color: #020617;
      background: transparent;
      border: none;
      box-shadow: none;
      text-shadow: none;
    }
    @keyframes injectPulse {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 1; }
    }
    .brand-hero-header--section .brand-hero-header-inner {
      display: block;
      height: auto;
      padding: 0;
      align-items: center;
      justify-content: center;
    }
    .sop-guide-trigger-btn {
      position: absolute;
      top: 0.55rem;
      right: 0.55rem;
      width: 1.85rem;
      height: 1.85rem;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: 1px solid rgba(15, 23, 42, 0.28);
      background: rgba(15, 23, 42, 0.18);
      color: #020617;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: none;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .sop-guide-trigger-btn:hover {
      background: rgba(15, 23, 42, 0.28);
      border-color: rgba(15, 23, 42, 0.45);
      color: #020617;
      box-shadow: none;
    }
    .max-sl-lock-badge,
    .dyn-sl-lock-tag,
    .merged-sl-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
      margin-top: 0;
      padding: 0.45rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.65);
      background: rgba(80, 210, 193, 0.1);
      color: #50D2C1;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      box-shadow: 0 0 14px rgba(80, 210, 193, 0.28);
      white-space: normal;
      line-height: 1.35;
      cursor: help;
    }
    .master-risk-console-body,
    .attack-zone-body {
      padding: 1rem 1.25rem 1.25rem;
    }
    .tour-modal-header {
      position: relative;
      height: 11rem;
      background-image: url('/brand/dondon-eyes.webp');
      background-size: cover;
      background-position: center;
      border-radius: 1.1rem 1.1rem 0 0;
      overflow: hidden;
    }
    .tour-modal-header-overlay,
    .brand-hero-header-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        #0d131a 0%,
        rgba(13, 19, 26, 0.82) 38%,
        rgba(13, 19, 26, 0.35) 68%,
        transparent 100%
      );
      pointer-events: none;
    }
    .tour-modal-header-inner,
    .brand-hero-header-inner {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 100%;
      padding: 1rem 1.5rem 1.25rem;
    }
    .brand-hero-header-inner {
      flex-wrap: wrap;
      gap: 1rem;
    }
    .brand-hero-header--matrix .brand-hero-header-inner {
      align-items: stretch;
      padding: 1.25rem 1.5rem 1.5rem;
    }
    .matrix-table-filters {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }
    .matrix-table-updated {
      font-size: 0.75rem;
      font-family: ui-monospace, monospace;
      color: rgba(167, 243, 208, 0.8);
      white-space: nowrap;
    }
    .tour-modal-title {
      margin: 0;
      font-size: 1.875rem;
      line-height: 1.2;
      font-weight: 900;
      color: #45C4B4;
      text-shadow: 0 0 24px rgba(52, 211, 153, 0.45), 0 2px 8px rgba(0, 0, 0, 0.85);
      letter-spacing: -0.02em;
    }
    .tour-modal-close,
    .brand-hero-close {
      position: absolute;
      top: 0.85rem;
      right: 0.85rem;
      z-index: 2;
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.45);
      color: #d1d5db;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .tour-modal-close:hover {
      background: rgba(80, 210, 193, 0.2);
      border-color: rgba(80, 210, 193, 0.55);
      color: #fff;
    }
    .tour-modal-body {
      padding: 1.5rem 1.75rem 1.75rem;
      overflow-y: auto;
      max-height: calc(88vh - 11rem);
    }
    .tour-modal-steps {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .tour-modal-step {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.85rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.2);
      background: rgba(6, 32, 27, 0.55);
      font-size: 1rem;
      line-height: 1.6;
      color: #e5e7eb;
      cursor: help;
    }
    .tour-modal-step-body {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.45rem 0.65rem;
      min-width: 0;
    }
    .tour-modal-step .tour-root-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: #A0FFE0;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 78, 59, 0.35);
      border-radius: 0.35rem;
      padding: 0.12rem 0.4rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .tour-modal-step-badge {
      flex-shrink: 0;
      font-size: 0.8rem;
      font-weight: 900;
      padding: 0.3rem 0.65rem;
      border-radius: 0.45rem;
      color: #7DFFD0;
      border: 1px solid rgba(16, 185, 129, 0.55);
      background: rgba(16, 185, 129, 0.12);
      white-space: nowrap;
    }
    .tour-modal-cta {
      margin-top: 1.5rem;
      width: 100%;
      padding: 0.85rem 1.25rem;
      border-radius: 0.75rem;
      border: 2px solid rgba(80, 210, 193, 0.75);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(6, 78, 59, 0.55));
      color: #7DFFD0;
      font-size: 1.125rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      cursor: pointer;
      box-shadow:
        0 0 20px rgba(80, 210, 193, 0.35),
        0 0 40px rgba(16, 185, 129, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
      transition: transform 0.15s, box-shadow 0.2s, background 0.2s, border-color 0.2s;
    }
    .tour-modal-cta:hover {
      transform: translateY(-1px);
      border-color: #50D2C1;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.42), rgba(6, 95, 70, 0.65));
      color: #A0FFE0;
      box-shadow:
        0 0 28px rgba(80, 210, 193, 0.55),
        0 0 56px rgba(16, 185, 129, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
    .tour-modal-cta:active {
      transform: translateY(0);
    }
    .tour-modal-step p,
    .tour-modal-step li {
      color: #d1d5db;
      font-size: 0.75rem;
      line-height: 1.55;
    }
    .soil-badge.soil-warning {
      color: #fbbf24;
      border-color: rgba(251, 191, 36, 0.45);
      background: rgba(251, 191, 36, 0.12);
    }
    .attack-zone {
      border: 2px solid rgba(251, 146, 60, 0.45);
      background: linear-gradient(145deg, rgba(11, 18, 23, 0.96), rgba(40, 24, 13, 0.94));
      box-shadow: 0 0 28px rgba(251, 146, 60, 0.18);
      overflow: hidden;
    }
    .master-risk-console {
      border: 2px solid rgba(80, 210, 193, 0.45);
      background: linear-gradient(145deg, rgba(11, 18, 23, 0.96), rgba(13, 40, 24, 0.94));
      box-shadow: 0 0 28px rgba(80, 210, 193, 0.18);
      overflow: hidden;
    }
    .step3-econ-card {
      background: rgba(6, 78, 59, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 0.5rem;
      padding: 0.75rem;
      min-height: 150px;
    }
    .master-slider {
      width: 100%;
      accent-color: #50D2C1;
    }
    .mega-slider-wrap {
      margin-top: 0.35rem;
      padding: 0.85rem 0.9rem 1rem;
      border-radius: 0.85rem;
      border: 1px solid rgba(80, 210, 193, 0.55);
      background:
        radial-gradient(ellipse at 20% 0%, rgba(80, 210, 193, 0.22), transparent 55%),
        linear-gradient(180deg, rgba(6, 40, 32, 0.95), rgba(4, 16, 12, 0.92));
      box-shadow:
        0 0 28px rgba(80, 210, 193, 0.28),
        inset 0 0 18px rgba(80, 210, 193, 0.08);
    }
    .mega-slider-wrap .master-slider {
      height: 1.35rem;
      accent-color: #50D2C1;
      filter: drop-shadow(0 0 8px rgba(80, 210, 193, 0.55));
    }
    .mega-slider-title {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.45rem;
    }
    .mega-slider-title .typo-action {
      color: #A0FFE0;
      letter-spacing: 0.06em;
      text-shadow: 0 0 10px rgba(80, 210, 193, 0.35);
      font-size: 0.78rem;
    }
    .capital-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.45rem;
    }
    .capital-preset-btn {
      padding: 0.25rem 0.55rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      background: rgba(0, 0, 0, 0.35);
      color: #7DFFD0;
      font-size: 0.68rem;
      font-weight: 900;
      cursor: pointer;
    }
    .capital-preset-btn:hover,
    .capital-preset-btn.is-active {
      background: rgba(80, 210, 193, 0.2);
      border-color: #50D2C1;
      color: #A0FFE0;
    }
    /* Pipeline Bar Master Preset Controller (micro-tabs) */
    .pipeline-mode-toggle {
      display: inline-flex;
      flex-shrink: 0;
      align-items: stretch;
      gap: 0.2rem;
      padding: 0.18rem;
      border-radius: 0.55rem;
      border: 1px solid rgba(251, 191, 36, 0.35);
      background: rgba(0, 0, 0, 0.45);
      box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.35);
    }
    @media (max-width: 720px) {
      .pipeline-mode-toggle {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
      }
      .pipeline-mode-btn {
        min-width: 0;
      }
      .pipeline-mode-btn .pipeline-mode-status {
        display: none;
      }
    }
    .pipeline-mode-btn {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 0.08rem;
      padding: 0.28rem 0.55rem;
      border: 1px solid transparent;
      border-radius: 0.4rem;
      background: transparent;
      color: #94a3b8;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.01em;
      line-height: 1.15;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .pipeline-mode-btn .pipeline-mode-label {
      font-weight: 900;
    }
    .pipeline-mode-btn .pipeline-mode-status {
      font-size: 0.52rem;
      font-weight: 700;
      opacity: 0.72;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .pipeline-mode-btn:hover {
      color: #e2e8f0;
      background: rgba(255, 255, 255, 0.04);
    }
    .pipeline-mode-btn.is-active.shield {
      color: #6EE7B7;
      border-color: rgba(16, 185, 129, 0.55);
      background: rgba(6, 78, 59, 0.45);
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.45), inset 0 0 8px rgba(16, 185, 129, 0.18);
    }
    .pipeline-mode-btn.is-active.tactical {
      color: #FCD34D;
      border-color: rgba(251, 191, 36, 0.55);
      background: rgba(120, 53, 15, 0.42);
      box-shadow: 0 0 14px rgba(251, 191, 36, 0.4), inset 0 0 8px rgba(251, 191, 36, 0.15);
    }
    .pipeline-mode-btn.is-active.flash {
      color: #A5B4FC;
      border-color: rgba(99, 102, 241, 0.55);
      background: rgba(49, 46, 129, 0.5);
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.5), inset 0 0 8px rgba(129, 140, 248, 0.2);
    }
    .pipeline-mode-btn.is-active .pipeline-mode-status {
      opacity: 0.95;
    }
    .auto-guard-banner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.55rem 0.75rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(251, 191, 36, 0.42);
      background: linear-gradient(135deg, rgba(66, 42, 8, 0.88), rgba(11, 18, 23, 0.92));
      padding: 0.55rem 0.85rem;
      margin-bottom: 0.65rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 800;
      color: #fde68a;
      line-height: 1.45;
      box-shadow: 0 0 18px rgba(251, 191, 36, 0.12);
      letter-spacing: 0.01em;
    }
    .auto-guard-banner-main {
      flex: 1 1 12rem;
      min-width: 0;
    }
    .banner-heat-status {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      font-weight: 900;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .banner-heat-status.is-safe { color: #50D2C1; text-shadow: 0 0 10px rgba(80, 210, 193, 0.55); }
    .banner-heat-status.is-elevated { color: #fde68a; }
    .banner-heat-status.is-extreme { color: #fecaca; }
    .banner-heat-status.is-flash {
      color: #A5B4FC;
      text-shadow: 0 0 12px rgba(99, 102, 241, 0.65);
    }
    .auto-guard-banner.is-locked {
      border-color: rgba(251, 191, 36, 0.5);
      color: #fde68a;
    }
    .auto-guard-banner.is-flash {
      border-color: rgba(99, 102, 241, 0.55);
      color: #c7d2fe;
      box-shadow: 0 0 18px rgba(99, 102, 241, 0.18);
    }
    .auto-guard-banner.is-unlocked {
      border-color: rgba(52, 211, 153, 0.55);
      color: #7DFFD0;
    }
    .auto-guard-banner.is-tactical {
      border-color: rgba(251, 191, 36, 0.48);
      color: #fde68a;
    }
    .session-clock-row {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.5rem;
    }
    .session-clock-chip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.55rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(0,0,0,0.12);
      background: rgba(255,255,255,0.35);
      font-size: 0.72rem;
      font-weight: 800;
      color: #0b1217;
    }
    .session-clock-chip.is-active {
      border-color: rgba(6, 78, 59, 0.45);
      background: rgba(16, 185, 129, 0.28);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
    }
    .session-settlement-merge {
      margin-top: 0.55rem;
      padding-top: 0.5rem;
      border-top: 1px dashed rgba(0,0,0,0.15);
      font-size: 0.72rem;
      font-weight: 800;
      color: #0b1217;
    }
    .macro-oracle-badge {
      margin-top: 0.65rem;
      padding: 0.4rem 0.5rem;
      border-radius: 0.4rem;
      border: 1px dashed rgba(80, 210, 193, 0.35);
      background: rgba(0,0,0,0.2);
      font-size: 0.62rem;
      color: #94a3b8;
      line-height: 1.35;
      font-weight: 700;
    }
    .step2-funding-panel {
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: linear-gradient(135deg, rgba(80, 210, 193, 0.12), rgba(11, 18, 23, 0.92));
      padding: 0.65rem 0.85rem;
      margin-bottom: 0.75rem;
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.15);
    }
    .mode-gate-panel {
      display: none !important;
    }
    .header-vault-pill {
      display: none !important;
    }
    .step3-vault-bar,
    .step1-vault-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.65rem;
      margin-bottom: 0.75rem;
      padding: 0.625rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(16, 185, 129, 0.3);
      background: rgba(15, 23, 42, 0.8);
      font-size: 0.75rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .step1-vault-bar {
      width: 100%;
    }
    .vault-balance-badge {
      display: flex;
      flex-direction: column;
      gap: 0.28rem;
      margin-bottom: 0.65rem;
      padding: 0.5rem 0.65rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(80, 210, 193, 0.55);
      background:
        linear-gradient(135deg, rgba(2, 24, 22, 0.95) 0%, rgba(15, 23, 42, 0.98) 55%, rgba(6, 40, 36, 0.92) 100%);
      box-shadow:
        0 0 0 1px rgba(80, 210, 193, 0.12) inset,
        0 0 14px rgba(80, 210, 193, 0.18);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .vault-balance-main {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.4rem 0.55rem;
      line-height: 1.2;
    }
    .vault-balance-label {
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      color: #7DFFD0;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.45);
    }
    .vault-balance-value {
      font-size: 0.82rem;
      font-weight: 900;
      color: #A0FFE0;
      letter-spacing: 0.04em;
      text-shadow: 0 0 12px rgba(80, 210, 193, 0.55);
    }
    .vault-balance-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.3rem 0.45rem;
      font-size: 0.62rem;
      font-weight: 700;
      color: #94a3b8;
    }
    .vault-balance-meta .vault-sep {
      color: rgba(148, 163, 184, 0.45);
    }
    .capital-vault-pcts {
      margin-top: 0.3rem;
    }
    .capital-vault-pct-btn {
      border-style: dashed;
    }
    .capital-preset-btn:disabled,
    .capital-preset-btn.is-disabled {
      opacity: 0.35;
      cursor: not-allowed;
      filter: grayscale(0.4);
    }
    .step3-vault-stats,
    .step1-vault-stats {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem 0.65rem;
      font-family: inherit;
      font-size: inherit;
      font-weight: 700;
      color: #cbd5e1;
    }
    .step1-vault-stats .vault-label-vault,
    .step1-vault-stats .vault-equity-value {
      color: #34d399;
      font-weight: 700;
    }
    .step1-vault-stats .vault-label-pos,
    .step1-vault-stats .vault-pos-value {
      color: #cbd5e1;
    }
    .step1-vault-stats .vault-label-pnl,
    .step1-vault-stats .step3-vault-pnl.is-pos {
      color: #34d399;
      font-weight: 700;
    }
    .step1-vault-stats .step3-vault-pnl.is-neg {
      color: #f87171;
      font-weight: 700;
    }
    .step3-vault-stats .vault-sep,
    .step1-vault-stats .vault-sep {
      color: rgba(148, 163, 184, 0.55);
    }
    .step3-vault-pnl.is-pos { color: #45C4B4; }
    .step3-vault-pnl.is-neg { color: #f87171; }
    .step3-emergency-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 0.55rem;
    }
    .emergency-close-all-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.75rem;
      border-radius: 0.5rem;
      border: 2px solid rgba(239, 68, 68, 0.75);
      background: linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(69, 10, 10, 0.9));
      color: #fecaca;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 0 18px rgba(239, 68, 68, 0.35);
      white-space: nowrap;
    }
    .emergency-close-all-btn:hover {
      background: linear-gradient(135deg, rgba(185, 28, 28, 0.98), rgba(127, 29, 29, 0.95));
      color: #fff;
    }
    .market-heartbeat-card {
      min-height: 100px;
      height: auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.4rem;
      margin-bottom: 0.65rem;
      padding: 0.55rem 0.75rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      transition: background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s;
      box-sizing: border-box;
    }
    .market-heartbeat-card .mhb-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.2fr);
      gap: 0.55rem 0.85rem;
      align-items: start;
    }
    @media (max-width: 640px) {
      .market-heartbeat-card .mhb-grid {
        grid-template-columns: 1fr;
      }
    }
    .market-heartbeat-card .mhb-title {
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 0.2rem;
    }
    .market-heartbeat-card .mhb-root5,
    .market-heartbeat-card .mhb-circuit,
    .market-heartbeat-card .mhb-hl {
      line-height: 1.35;
      white-space: nowrap;
    }
    .market-heartbeat-card .mhb-hl {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem 0.45rem;
      white-space: normal;
    }
    .market-heartbeat-card .mhb-root5-label {
      opacity: 0.95;
      margin-right: 0.35rem;
    }
    .market-heartbeat-card .mhb-vol-state {
      font-weight: 900;
    }
    .market-heartbeat-card .mhb-sessions {
      display: flex;
      flex-direction: column;
      gap: 0.12rem;
      margin-top: 0.15rem;
      font-variant-numeric: tabular-nums;
    }
    .market-heartbeat-card .mhb-sessions-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem 0.5rem;
      margin-bottom: 0.2rem;
    }
    .market-heartbeat-card .mhb-sessions-title {
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.9;
    }
    .root-tag {
      display: inline-flex;
      align-items: center;
      padding: 0.12rem 0.35rem;
      border-radius: 0.3rem;
      border: 1px solid rgba(16, 185, 129, 0.4);
      background: rgba(15, 23, 42, 0.55);
      color: #50D2C1;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.58rem;
      font-weight: 900;
      letter-spacing: 0.03em;
      white-space: nowrap;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.35);
    }
    .gk-status-pill.sv-tip,
    .root-tag.sv-tip {
      border-bottom-style: solid;
    }
    .macro-radar-title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem 0.55rem;
      margin-bottom: 0.35rem;
    }
    .market-heartbeat-card .mhb-session-row {
      display: grid;
      grid-template-columns: minmax(9.5rem, 1fr) 5.1rem 4.2rem;
      gap: 0.35rem;
      align-items: center;
    }
    .market-heartbeat-card .mhb-session-name {
      opacity: 0.88;
      letter-spacing: 0.04em;
    }
    .market-heartbeat-card .mhb-session-clock {
      font-weight: 900;
      text-align: right;
    }
    .market-heartbeat-card .mhb-session-state {
      font-weight: 900;
      text-align: right;
      letter-spacing: 0.06em;
    }
    .market-heartbeat-card .mhb-session-state.is-open {
      color: #A0FFE0;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.45);
    }
    .market-heartbeat-card .mhb-session-state.is-closed {
      color: rgba(148, 163, 184, 0.95);
    }
    .market-heartbeat-card .mhb-root10 {
      margin-top: 0.25rem;
      padding: 0.2rem 0.4rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(251, 191, 36, 0.55);
      background: rgba(120, 53, 15, 0.55);
      color: #fde68a;
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.03em;
      line-height: 1.3;
      white-space: normal;
    }
    .market-heartbeat-card .mhb-root10.is-active {
      display: block;
    }
    .market-heartbeat-card.is-safe {
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(16, 185, 129, 0.35));
      border-color: rgba(52, 211, 153, 0.7);
      color: #ecfdf5;
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.28);
    }
    .market-heartbeat-card.is-elevated {
      background: linear-gradient(135deg, rgba(120, 53, 15, 0.95), rgba(245, 158, 11, 0.4));
      border-color: rgba(251, 191, 36, 0.75);
      color: #fffbeb;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.3);
    }
    .market-heartbeat-card.is-extreme {
      background: linear-gradient(135deg, rgba(127, 29, 29, 0.98), rgba(220, 38, 38, 0.55));
      border-color: rgba(248, 113, 113, 0.85);
      color: #fef2f2;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
      animation: heartbeat-pulse 1.1s ease-in-out infinite;
    }
    .market-heartbeat-card .countdown-lockdown,
    .market-heartbeat-card.settlement-active #hlCountdown {
      color: #fca5a5;
      font-weight: 900;
    }
    .market-heartbeat-bar {
      min-height: 35px;
      height: auto;
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.35rem 0.75rem;
      padding: 0.35rem 0.85rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      text-align: left;
      transition: background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s;
    }
    .market-heartbeat-bar .hb-cluster {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem 0.65rem;
    }
    .market-heartbeat-bar .hb-sep {
      opacity: 0.45;
    }
    .market-heartbeat-bar .hb-meta {
      opacity: 0.95;
      white-space: nowrap;
    }
    .market-heartbeat-bar.is-safe {
      background: linear-gradient(90deg, rgba(6, 78, 59, 0.95), rgba(16, 185, 129, 0.55));
      border-color: rgba(52, 211, 153, 0.7);
      color: #ecfdf5;
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);
    }
    .market-heartbeat-bar.is-elevated {
      background: linear-gradient(90deg, rgba(120, 53, 15, 0.95), rgba(245, 158, 11, 0.55));
      border-color: rgba(251, 191, 36, 0.75);
      color: #fffbeb;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.35);
    }
    .market-heartbeat-bar.is-extreme {
      background: linear-gradient(90deg, rgba(127, 29, 29, 0.98), rgba(220, 38, 38, 0.65));
      border-color: rgba(248, 113, 113, 0.85);
      color: #fef2f2;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.45);
      animation: heartbeat-pulse 1.1s ease-in-out infinite;
    }
    @keyframes heartbeat-pulse {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.18); }
    }
    .hot-token-spotlight {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      padding: 0.75rem 0.95rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(245, 158, 11, 0.6);
      background: linear-gradient(120deg, rgba(69, 26, 3, 0.92), rgba(120, 53, 15, 0.55) 48%, rgba(11, 18, 23, 0.95));
      box-shadow: 0 0 26px rgba(245, 158, 11, 0.28), inset 0 0 18px rgba(180, 83, 9, 0.18);
    }
    .hot-token-spotlight-main {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.65rem 1rem;
      min-width: 0;
    }
    .hot-token-badge {
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #fbbf24;
      text-shadow: 0 0 12px rgba(251, 191, 36, 0.45);
    }
    .hot-token-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.45rem 0.85rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 800;
      color: #fde68a;
    }
    .hot-token-meta .hot-chg { color: #fbbf24; }
    .hot-token-meta .hot-chg.is-neg { color: #fb923c; }
    .hot-token-meta .hot-fr { color: #fcd34d; }
    .hot-token-sparkline {
      width: 96px;
      height: 28px;
      flex-shrink: 0;
    }
    .quick-snipe-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.85rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(245, 158, 11, 0.7);
      background: linear-gradient(135deg, rgba(120, 53, 15, 0.95), rgba(245, 158, 11, 0.28));
      color: #fbbf24;
      font-size: 0.75rem;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.35);
    }
    .quick-snipe-btn:hover {
      background: linear-gradient(135deg, rgba(146, 64, 14, 0.98), rgba(251, 191, 36, 0.4));
      color: #fef3c7;
    }
    .step1-overhaul-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.65rem;
      margin-bottom: 0.75rem;
    }
    @media (min-width: 900px) {
      .step1-overhaul-grid {
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      }
    }
    .gatekeeper-defense-matrix,
    .best-hedge-radar {
      border-radius: 0.75rem;
      padding: 0.75rem 0.85rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.88);
      box-shadow: 0 0 14px rgba(80, 210, 193, 0.1);
      min-width: 0;
    }
    .best-hedge-radar {
      border: 2px solid rgba(245, 158, 11, 0.7);
      background: linear-gradient(to bottom, rgba(69, 26, 3, 0.4), #020617 45%, #020617);
      color: #e2e8f0;
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.25), inset 0 0 28px rgba(245, 158, 11, 0.04);
    }
    .best-hedge-radar,
    .best-hedge-radar .typo-context,
    .best-hedge-radar .typo-num,
    .best-hedge-radar .typo-action,
    .best-hedge-radar .best-hedge-title,
    .best-hedge-radar .live-vol-heat-meta,
    .best-hedge-radar .live-vol-heat-score {
      color: #e2e8f0 !important;
      text-shadow: none !important;
    }
    .dondon-ip-stage {
      position: relative;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-height: 14rem;
      background: #020617;
      border-bottom: 1px solid rgba(245, 158, 11, 0.22);
      isolation: isolate;
    }
    .dondon-ip-stage--header {
      flex: none;
      min-height: 9rem;
      max-height: 11rem;
      margin: 0 0 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.22);
      border-radius: 0.65rem;
      border-bottom: 1px solid rgba(80, 210, 193, 0.22);
    }
    .dondon-ip-stage--header .dondon-ip-frame {
      min-height: 7.5rem;
    }
    .step1-condensed-log {
      flex-shrink: 0;
      max-height: 2.35rem;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.28rem 0.55rem;
      background: rgba(0, 0, 0, 0.55);
      border-bottom: 1px solid rgba(80, 210, 193, 0.18);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.58rem;
      line-height: 1.35;
      color: #94a3b8;
      scrollbar-width: thin;
    }
    .step1-condensed-log-line { margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .step1-condensed-log-line.log-ok { color: #45C4B4; }
    .step1-condensed-log-line.log-warn { color: #fbbf24; }
    .step1-condensed-log-line.log-err { color: #f87171; }
    .dondon-ip-frame {
      position: relative;
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 11rem;
      overflow: hidden;
      background: radial-gradient(ellipse at center, rgba(0, 255, 163, 0.06) 0%, #020617 72%);
    }
    .dondon-ip-frame[data-dondon-state="GOD_MODE"] {
      background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.12) 0%, rgba(0, 255, 153, 0.06) 40%, #020617 75%);
    }
    .dondon-ip-frame[data-dondon-state="HARD_LOCK"] {
      background: radial-gradient(ellipse at center, rgba(255, 0, 51, 0.14) 0%, #020617 70%);
    }
    .dondon-ip-badge {
      position: absolute;
      top: 0.45rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      padding: 0.15rem 0.65rem;
      border-radius: 0.35rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.14em;
      color: #e2e8f0;
      background: rgba(2, 6, 23, 0.72);
      border: 1px solid rgba(80, 210, 193, 0.35);
      text-shadow: 0 0 10px var(--dondon-glow, #00FFA3);
      pointer-events: none;
    }
    .dondon-ip-img {
      display: block;
      width: auto;
      height: auto;
      max-width: 92%;
      max-height: 92%;
      object-fit: contain;
      object-position: center center;
      transform: scale(var(--dondon-scale, 1));
      transition: transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), filter 0.35s ease;
      filter: drop-shadow(0 0 16px var(--dondon-glow, #00FFA3));
      transform-origin: center center;
    }
    .dondon-state-normal { --dondon-scale: 1; --dondon-glow: #00FFA3; }
    .dondon-state-levelup { --dondon-scale: 1.2; --dondon-glow: #00F0FF; }
    .dondon-state-warning { --dondon-scale: 1.4; --dondon-glow: #FFD700; }
    .dondon-state-shield { --dondon-scale: 1.6; --dondon-glow: #00E676; }
    .dondon-state-hardlock { --dondon-scale: 2; --dondon-glow: #FF0033; animation: dondon-glitch-pulse 1.1s ease-in-out infinite; }
    .dondon-state-godmode {
      --dondon-scale: 2.5;
      --dondon-glow: #FFD700;
      filter: drop-shadow(0 0 22px #FFD700) drop-shadow(0 0 14px #00FF99);
    }
    .dondon-state-orangetarget { --dondon-scale: 1; --dondon-glow: #FF8C00; }
    @keyframes dondon-glitch-pulse {
      0%, 100% { filter: drop-shadow(0 0 22px #FF0033); }
      50% { filter: drop-shadow(0 0 34px #FF0033) drop-shadow(2px 0 0 #00FFFF) drop-shadow(-2px 0 0 #FF00FF); }
    }
    .best-hedge-eyes-banner,
    .best-hedge-eyes-img { display: none; }
    .best-hedge-header {
      flex-shrink: 0;
      padding: 0.55rem 0.95rem 0.5rem;
      border-bottom: 1px solid rgba(245, 158, 11, 0.28);
      background: linear-gradient(180deg, rgba(2, 6, 23, 0.98), rgba(15, 23, 42, 0.9));
      box-shadow: inset 0 1px 0 rgba(251, 191, 36, 0.08), inset 0 -1px 0 rgba(251, 191, 36, 0.1);
    }
    .best-hedge-body {
      padding: 0.85rem 0.95rem 1rem;
      min-width: 0;
    }
    .gk-matrix-title,
    .best-hedge-title {
      font-size: 0.78rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #A0FFE0;
      margin-bottom: 0.55rem;
    }
    .best-hedge-radar .best-hedge-title {
      margin: 0;
      color: #e2e8f0 !important;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: none !important;
    }
    .best-hedge-hero-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem 1rem;
      margin-bottom: 0.45rem;
    }
    .best-hedge-badges {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.35rem;
      flex-shrink: 0;
      max-width: min(52%, 14.5rem);
    }
    .best-hedge-auto-lock {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0.28rem 0.55rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(251, 191, 36, 0.75);
      background: rgba(120, 53, 15, 0.45);
      color: #fcd34d !important;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.03em;
      white-space: nowrap;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.35), inset 0 0 8px rgba(251, 191, 36, 0.12);
    }
    .best-pair-action-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
      padding: 0.28rem 0.55rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(139, 92, 246, 0.65);
      background: rgba(76, 29, 149, 0.35);
      color: #c4b5fd !important;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      cursor: help;
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.28);
    }
    .best-pair-action-tag.is-cashcat {
      border-color: rgba(56, 189, 248, 0.65);
      background: rgba(12, 74, 110, 0.45);
      color: #7dd3fc !important;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.28);
    }
    .best-pair-action-tag.is-reverse {
      border-color: rgba(167, 139, 250, 0.7);
      background: rgba(76, 29, 149, 0.4);
      color: #ddd6fe !important;
      box-shadow: 0 0 12px rgba(139, 92, 246, 0.35);
    }
    .best-pair-action-tag.is-empty {
      border-color: rgba(148, 163, 184, 0.4);
      background: rgba(15, 23, 42, 0.7);
      color: #94a3b8 !important;
      box-shadow: none;
      white-space: normal;
      text-align: right;
      line-height: 1.35;
      font-size: 0.65rem;
    }
    .pipeline-mode-btn.is-locked {
      opacity: 0.42;
      cursor: not-allowed;
      filter: grayscale(0.35);
    }
    .pipeline-mode-btn.is-locked:hover {
      color: #94a3b8;
      background: transparent;
    }
    .gk-heat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }
    .live-vol-heat-panel {
      margin-top: 0.75rem;
      padding-top: 0.7rem;
      border-top: 1px solid rgba(15, 23, 42, 0.18);
    }
    .best-hedge-radar .live-vol-heat-panel {
      border-top-color: rgba(245, 158, 11, 0.22);
    }
    .best-hedge-radar .live-vol-heat-score {
      color: #34d399 !important;
    }
    .live-vol-heat-panel .gk-heat-row {
      margin-bottom: 0.45rem;
    }
    .live-vol-heat-score {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 900;
      color: #50D2C1;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.35);
    }
    .live-vol-heat-meta {
      font-size: 0.65rem;
      color: #94a3b8;
      font-weight: 700;
    }
    .gk-heat-lamp {
      display: none; /* SAFE status lives in Step 1 top bar only */
    }
    .gk-heat-lamp.is-safe {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(52, 211, 153, 0.55);
      color: #7DFFD0;
    }
    .gk-heat-lamp.is-elevated {
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(251, 191, 36, 0.55);
      color: #fde68a;
    }
    .gk-heat-lamp.is-extreme {
      background: rgba(239, 68, 68, 0.22);
      border-color: rgba(248, 113, 113, 0.65);
      color: #fecaca;
    }
    .gk-telemetry-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem;
      margin-bottom: 0.55rem;
    }
    .best-hedge-radar .gk-telemetry-grid {
      margin-top: 0.65rem;
      margin-bottom: 0;
    }
    .gk-telemetry-chip {
      padding: 0.4rem 0.5rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: rgba(80, 210, 193, 0.06);
      box-shadow: 0 0 10px rgba(80, 210, 193, 0.12);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      color: #50D2C1;
    }
    .best-hedge-radar .gk-telemetry-chip {
      background: rgba(2, 6, 23, 0.92);
      border-color: rgba(245, 158, 11, 0.28);
      color: #fbbf24;
      box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.35);
    }
    .gk-telemetry-chip .label {
      display: block;
      color: #50D2C1;
      font-size: 0.62rem;
      margin-bottom: 0.15rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 800;
      opacity: 0.85;
    }
    .gk-telemetry-chip .value {
      color: #50D2C1;
      font-weight: 900;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.35);
    }
    .best-hedge-radar .gk-telemetry-chip .label,
    .best-hedge-radar .gk-telemetry-chip .value {
      color: #fbbf24 !important;
      text-shadow: none !important;
    }
    .gk-status-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .gk-status-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.28rem 0.45rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(52, 211, 153, 0.4);
      background: rgba(6, 78, 59, 0.35);
      color: #A0FFE0;
      font-size: 0.65rem;
      font-weight: 800;
      white-space: nowrap;
    }
    .gk-status-pill.is-fail {
      border-color: rgba(248, 113, 113, 0.55);
      background: rgba(127, 29, 29, 0.4);
      color: #fecaca;
    }
    .gk-macro-mini {
      margin-top: 0.55rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .best-hedge-symbol-row {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.55rem 1rem;
      margin: 0 0 0.65rem;
      min-width: 0;
      flex: 1 1 auto;
    }
    .best-hedge-token-pair {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      min-width: 0;
    }
    .best-hedge-token-icon {
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      border: 1px solid rgba(251, 191, 36, 0.45);
      background: radial-gradient(circle at 30% 30%, #fde68a, #b45309 62%, #1e293b);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.35);
      flex-shrink: 0;
    }
    #bestPairSymbol {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: #ffffff !important;
      text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
      background: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
      line-height: 1.15;
    }
    #bestPairYield {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 1.05rem;
      font-weight: 900;
      color: #34d399 !important;
      text-shadow: 0 0 14px rgba(52, 211, 153, 0.45);
    }
    .best-hedge-returns {
      margin: 0.65rem 0 0.85rem;
      background: rgba(15, 23, 42, 0.78);
      border: 1px solid rgba(245, 158, 11, 0.28);
      border-radius: 0.65rem;
      padding: 0.75rem 0.85rem;
      box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .best-hedge-returns-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
    }
    .best-hedge-returns-value {
      font-size: 1.15rem;
      font-weight: 900;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: #34d399;
      text-shadow: 0 0 10px rgba(52, 211, 153, 0.35);
      filter: none;
    }
    .lock-best-hedge-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.65rem;
      border: 1px solid #fbbf24;
      background: rgba(245, 158, 11, 0.2);
      color: #fcd34d;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
      transition: all 0.15s ease;
    }
    .lock-best-hedge-btn:hover {
      background: rgba(245, 158, 11, 0.3);
      border-color: #fbbf24;
      color: #fde68a;
      box-shadow: 0 0 22px rgba(245, 158, 11, 0.45);
    }
    .best-hedge-lock-hint {
      margin-top: 0.45rem;
      font-size: 0.68rem;
      font-weight: 700;
      color: #94a3b8 !important;
      line-height: 1.4;
    }
    .lock-best-hedge-btn:active {
      transform: scale(0.95);
    }
    .lock-best-hedge-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
    .lock-shield-icon,
    .matrix-inject-icon,
    .brand-shield-icon {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      object-fit: contain;
      flex-shrink: 0;
      vertical-align: -0.15em;
      filter: drop-shadow(0 0 6px rgba(80, 210, 193, 0.55));
    }
    .lock-shield-icon,
    .matrix-inject-icon,
    .brand-shield-icon-md {
      width: 1.25rem;
      height: 1.25rem;
    }
    .brand-shield-icon-lg {
      width: 1.5rem;
      height: 1.5rem;
      vertical-align: -0.25em;
    }
    .brand-shield-icon-xl {
      width: 2.5rem;
      height: 2.5rem;
      display: block;
      margin: 0 auto 1rem;
      filter: drop-shadow(0 0 12px rgba(80, 210, 193, 0.65));
    }
    .section-header .brand-shield-icon,
    .section-header .brand-shield-icon-md,
    .gk-matrix-title .brand-shield-icon,
    .sop-guide-step h3 .brand-shield-icon,
    .sop-guide-step li .brand-shield-icon {
      margin-right: 0.2rem;
    }
    .inline-flex-shield {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .soil-circuit-shield-icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      object-fit: contain;
      flex-shrink: 0;
      filter: drop-shadow(0 0 4px rgba(80, 210, 193, 0.45));
    }
    #marketSessionsBox { display: none !important; }
    .aquarium-deprecated { display: none !important; }
    .header-actions-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: nowrap;
      justify-content: flex-end;
      position: relative;
      flex-shrink: 0;
    }
    .header-menu-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: rgba(0, 0, 0, 0.4);
      color: #A0FFE0;
      font-size: 0.75rem;
      font-weight: 800;
      cursor: pointer;
    }
    .header-menu-toggle:hover {
      background: rgba(80, 210, 193, 0.12);
    }
    /* Universal: secondary actions always live inside \u2630 MENU (all breakpoints) */
    .header-secondary-actions {
      display: none;
      position: absolute;
      top: calc(100% + 0.4rem);
      right: 0;
      z-index: 60;
      width: min(22rem, calc(100vw - 1.5rem));
      flex-direction: column;
      align-items: stretch;
      gap: 0.45rem;
      padding: 0.75rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      background: linear-gradient(160deg, rgba(8, 24, 18, 0.98), rgba(6, 14, 12, 0.98));
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
    }
    .header-secondary-actions.is-open {
      display: flex;
    }
    .header-secondary-actions > * {
      width: 100%;
      justify-content: center;
    }
    .live-ops-panel {
      border-radius: 0.85rem;
      border: 1px solid rgba(80, 210, 193, 0.3);
      background: rgba(6, 20, 13, 0.78);
      padding: 0.75rem 1rem;
      margin-top: 0.5rem;
    }
    .live-ops-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    @media (min-width: 900px) {
      .live-ops-grid {
        grid-template-columns: 1.15fr 0.85fr;
      }
    }
    .live-ops-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.72rem;
    }
    .live-ops-table th,
    .live-ops-table td {
      padding: 0.4rem 0.35rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      text-align: left;
    }
    .live-ops-table th { color: #94a3b8; font-weight: 800; }
    .exec-log-stream {
      max-height: 11rem;
      overflow-y: auto;
      font-size: 0.68rem;
      font-family: 'JetBrains Mono', monospace;
      color: #cbd5e1;
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 0.5rem;
      padding: 0.5rem 0.6rem;
    }
    .exec-log-stream .log-line { margin: 0.2rem 0; }
    .exec-log-stream .log-warn { color: #fbbf24; }
    .exec-log-stream .log-ok { color: #45C4B4; }
    .exec-log-stream .log-err { color: #f87171; }
    .demo-hub-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
      padding: 0.25rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      background: rgba(0, 0, 0, 0.4);
    }
    .demo-hub-tab {
      padding: 0.55rem 0.65rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      background: transparent;
      color: #94a3b8;
      font-size: calc((0.72rem + 2px) * 1.15);
      font-weight: 900;
      cursor: pointer;
      text-align: center;
      transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
    }
    .demo-hub-tab.is-active {
      background: rgba(80, 210, 193, 0.22);
      color: #ecfdf5;
      border-color: #50D2C1;
      box-shadow: 0 0 12px rgba(80, 210, 193, 0.25);
    }
    .demo-hub-pane.hidden { display: none; }
    .demo-hub-tab-content {
      max-height: 65vh;
      overflow-y: auto;
      padding-right: 0.35rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(16, 185, 129, 0.3) rgb(15, 23, 42);
    }
    .demo-hub-tab-content::-webkit-scrollbar {
      width: 6px;
    }
    .demo-hub-tab-content::-webkit-scrollbar-track {
      background: rgb(15, 23, 42);
      border-radius: 3px;
    }
    .demo-hub-tab-content::-webkit-scrollbar-thumb {
      background: rgba(16, 185, 129, 0.3);
      border-radius: 3px;
    }
    .demo-hub-tab-content::-webkit-scrollbar-thumb:hover {
      background: rgba(16, 185, 129, 0.5);
    }
    .root-telemetry-grid {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .root-telemetry-tier {
      flex-shrink: 0;
      height: auto;
      border-radius: 0.65rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.38);
      overflow: visible;
    }
    .root-telemetry-tier.is-emerald {
      border-color: rgba(52, 211, 153, 0.4);
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.1);
    }
    .root-telemetry-tier.is-amber {
      border-color: rgba(251, 191, 36, 0.4);
      box-shadow: 0 0 14px rgba(245, 158, 11, 0.1);
    }
    .root-telemetry-tier.is-violet {
      border-color: rgba(167, 139, 250, 0.4);
      box-shadow: 0 0 14px rgba(139, 92, 246, 0.12);
    }
    .root-telemetry-tier.is-cyan {
      border-color: rgba(34, 211, 238, 0.42);
      box-shadow: 0 0 14px rgba(6, 182, 212, 0.12);
      background: rgba(8, 51, 68, 0.35);
    }
    .root-telemetry-tier.is-indigo {
      border-color: rgba(129, 140, 248, 0.42);
      box-shadow: 0 0 14px rgba(99, 102, 241, 0.14);
      background: rgba(30, 27, 75, 0.38);
    }
    .root-telemetry-tier.is-crimson {
      border-color: rgba(248, 113, 113, 0.42);
      box-shadow: 0 0 14px rgba(220, 38, 38, 0.14);
      background: rgba(69, 10, 10, 0.38);
    }
    .root-telemetry-tier.is-cyan .root-telemetry-tier-badge {
      background: rgba(8, 51, 68, 0.55);
      border: 1px solid rgba(34, 211, 238, 0.55);
      color: #67e8f9;
    }
    .root-telemetry-tier.is-indigo .root-telemetry-tier-badge {
      background: rgba(49, 46, 129, 0.55);
      border: 1px solid rgba(129, 140, 248, 0.55);
      color: #c7d2fe;
    }
    .root-telemetry-tier.is-crimson .root-telemetry-tier-badge {
      background: rgba(127, 29, 29, 0.55);
      border: 1px solid rgba(248, 113, 113, 0.55);
      color: #fecaca;
    }
    .root-telemetry-row.is-tier1 {
      background: rgba(76, 5, 25, 0.5);
      border: 1px solid rgba(244, 63, 94, 0.4);
    }
    .root-telemetry-row.is-tier2 {
      background: rgba(69, 26, 3, 0.4);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .root-telemetry-row.is-tier3 {
      background: rgba(66, 32, 6, 0.3);
      border: 1px solid rgba(234, 179, 8, 0.2);
    }
    .root-telemetry-row.is-tier4 {
      background: rgba(8, 51, 68, 0.3);
      border: 1px solid rgba(6, 182, 212, 0.2);
    }
    .root-telemetry-row.is-tripped {
      background: rgba(127, 29, 29, 0.8) !important;
      animation: heartbeat-pulse 1s ease-in-out infinite;
      box-shadow: inset 0 0 0 1px rgba(248, 113, 113, 0.55);
    }
    .risk-index-hud {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      margin: 0.5rem 0 0;
      padding: 0.65rem 0.85rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.25);
      background: rgba(6, 32, 27, 0.75);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      text-align: center;
    }
    .risk-index-hud.is-nominal { border-color: rgba(52, 211, 153, 0.45); }
    .risk-index-hud.is-optimal { border-color: rgba(52, 211, 153, 0.55); }
    .risk-index-hud.is-elevated { border-color: rgba(251, 191, 36, 0.55); }
    .risk-index-hud.is-critical { border-color: rgba(248, 113, 113, 0.55); }
    .risk-index-hud.is-toxicity-elevated { border-color: rgba(192, 132, 252, 0.55); }
    .risk-index-hud.is-toxic-mode {
      border-color: rgba(34, 211, 238, 0.75);
      box-shadow: 0 0 24px rgba(34, 211, 238, 0.35);
      animation: heartbeat-pulse 1.2s ease-in-out infinite;
    }
    .risk-index-score {
      font-size: 1.05rem;
      font-weight: 900;
      letter-spacing: 0.06em;
    }
    .risk-index-badge {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    .risk-index-score.sv-tip,
    .risk-index-badge.sv-tip {
      cursor: help;
      border-bottom: 1px dotted rgba(80, 210, 193, 0.45);
    }
    .risk-index-bar-track {
      width: min(100%, 22rem);
      margin-top: 0.15rem;
    }
    .taiji-bagua-overlay {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: min(100%, 26rem);
      margin-bottom: 0.15rem;
    }
    .taiji-mode-badge,
    .bagua-gate-badge {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      cursor: help;
      white-space: nowrap;
    }
    .taiji-mode-yang {
      color: #fde68a;
      background: rgba(120, 53, 15, 0.55);
      border-color: rgba(251, 191, 36, 0.65);
      box-shadow: 0 0 14px rgba(251, 191, 36, 0.45), inset 0 0 8px rgba(251, 191, 36, 0.15);
    }
    .taiji-mode-yin {
      color: #c7d2fe;
      background: rgba(30, 27, 75, 0.65);
      border-color: rgba(129, 140, 248, 0.55);
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.25);
    }
    .bagua-gate-qian { color: #fde68a; border-color: rgba(251, 191, 36, 0.5); background: rgba(69, 26, 3, 0.45); }
    .bagua-gate-kun { color: #a5b4fc; border-color: rgba(129, 140, 248, 0.45); background: rgba(30, 27, 75, 0.45); }
    .bagua-gate-zhen { color: #fdba74; border-color: rgba(251, 146, 60, 0.55); background: rgba(124, 45, 18, 0.45); }
    .bagua-gate-xun { color: #fcd34d; border-color: rgba(234, 179, 8, 0.5); background: rgba(66, 32, 6, 0.45); }
    .bagua-gate-kan { color: #67e8f9; border-color: rgba(34, 211, 238, 0.45); background: rgba(8, 51, 68, 0.55); }
    .bagua-gate-li { color: #86efac; border-color: rgba(52, 211, 153, 0.45); background: rgba(6, 44, 28, 0.45); }
    .bagua-gate-gen { color: #5eead4; border-color: rgba(45, 212, 191, 0.45); background: rgba(4, 47, 46, 0.5); }
    .bagua-gate-dui {
      color: #fca5a5;
      border-color: rgba(248, 113, 113, 0.75);
      background: rgba(69, 10, 10, 0.65);
      animation: heartbeat-pulse 0.85s ease-in-out infinite;
      box-shadow: 0 0 16px rgba(248, 113, 113, 0.55);
    }
    .text-emerald-400 { color: #34d399; }
    .text-purple-400 { color: #c084fc; }
    .text-cyan-400 { color: #22d3ee; }
    .animate-pulse { animation: heartbeat-pulse 1.2s ease-in-out infinite; }
    .dondon-avatar-toxic {
      filter: hue-rotate(160deg) saturate(1.35) brightness(1.05);
      box-shadow: 0 0 28px rgba(34, 211, 238, 0.45);
    }
    .demo-cri-control-block {
      margin-bottom: 0.85rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px solid rgba(251, 191, 36, 0.45);
      background: rgba(69, 26, 3, 0.28);
    }
    .demo-cri-preset-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem;
      margin-top: 0.45rem;
    }
    .demo-cri-preset-btn {
      padding: 0.4rem 0.45rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.75);
      color: #a7f3d0;
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      cursor: pointer;
      text-align: center;
    }
    .demo-cri-preset-btn:hover { background: rgba(80, 210, 193, 0.15); border-color: rgba(80, 210, 193, 0.65); }
    .demo-cri-preset-btn.is-toxic { border-color: rgba(248, 113, 113, 0.55); color: #fecaca; }
    .demo-cri-preset-btn.is-god { border-color: rgba(251, 191, 36, 0.65); color: #fde68a; }
    .demo-cri-reset-btn {
      display: block;
      width: 100%;
      margin-top: 0.45rem;
      padding: 0.45rem 0.55rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(34, 211, 238, 0.55);
      background: rgba(8, 47, 73, 0.55);
      color: #a5f3fc;
      font-size: 0.62rem;
      font-weight: 800;
      cursor: pointer;
    }
    .demo-cri-reset-btn:hover { background: rgba(14, 116, 144, 0.45); }
    .sniper-rail.soil-stress-shake {
      animation: soil-stress-shake 0.5s ease-in-out;
    }
    @keyframes soil-stress-shake {
      0%, 100% { transform: translate(0, 0); }
      12% { transform: translate(-2px, 1px); }
      24% { transform: translate(2px, -1px); }
      36% { transform: translate(-2px, -1px); }
      48% { transform: translate(2px, 1px); }
      60% { transform: translate(-1px, 0); }
      72% { transform: translate(1px, 0); }
    }
    .toxic-mode-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(2, 8, 23, 0.92);
      padding: 1.5rem;
    }
    .toxic-mode-backdrop.hidden { display: none; }
    .toxic-mode-modal {
      max-width: 36rem;
      width: 100%;
      border: 2px solid rgba(34, 211, 238, 0.65);
      border-radius: 1rem;
      background: rgba(8, 47, 73, 0.95);
      padding: 1.5rem;
      text-align: center;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: #a5f3fc;
      box-shadow: 0 0 40px rgba(34, 211, 238, 0.35);
    }
    .toxic-mode-modal h2 {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: 0.06em;
      color: #67e8f9;
    }
    .demo-role-block {
      margin-bottom: 0.85rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.65);
    }
    .demo-role-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.45rem;
    }
    .demo-role-btn {
      flex: 1 1 auto;
      min-width: 7rem;
      padding: 0.35rem 0.5rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(0,0,0,0.35);
      color: #e5e7eb;
      font-size: 0.68rem;
      font-weight: 800;
      cursor: pointer;
    }
    .demo-role-btn.is-active { border-color: rgba(80, 210, 193, 0.75); color: #6ee7b7; }
    .demo-role-btn.role-auditor.is-active { border-color: rgba(34, 211, 238, 0.75); color: #67e8f9; }
    .demo-role-btn.role-risk.is-active { border-color: rgba(251, 191, 36, 0.75); color: #fcd34d; }
    .demo-fault-panel {
      margin-top: 0.75rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px dashed rgba(251, 191, 36, 0.45);
      background: rgba(69, 26, 3, 0.35);
    }
    .demo-fault-panel.hidden { display: none; }
    .demo-fault-btn {
      display: block;
      width: 100%;
      margin-top: 0.35rem;
      padding: 0.45rem 0.55rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(248, 113, 113, 0.45);
      background: rgba(127, 29, 29, 0.45);
      color: #fecaca;
      font-size: 0.68rem;
      font-weight: 800;
      cursor: pointer;
    }
    body.role-auditor .attack-btn,
    body.role-auditor #attackExecuteBtn,
    body.role-auditor #attackExecuteZone input,
    body.role-auditor #masterRiskConsole input:not([readonly]),
    body.role-auditor #masterRiskConsole select,
    body.role-auditor #masterRiskConsole textarea,
    body.role-auditor #capitalInput,
    body.role-auditor #frictionInput {
      pointer-events: none;
      opacity: 0.55;
    }
    body.role-auditor #demoHubBackdrop input,
    body.role-auditor #demoHubBackdrop button,
    body.role-auditor #demoHubBackdrop select {
      pointer-events: auto;
      opacity: 1;
    }
    body.role-trader .demo-hub-risk-inject button,
    body.role-trader .demo-hub-risk-inject input,
    body.role-trader .demo-hub-risk-inject select,
    body.role-trader .demo-cri-preset-btn,
    body.role-trader .demo-cri-reset-btn,
    body.role-trader .demo-root-toggle-btn,
    body.role-trader .demo-hub-row button,
    body.role-trader #hubDefcon1ToggleBtn,
    body.role-trader .demo-hub-tx-btn:not(.demo-role-btn),
    body.role-trader .demo-xp-block button,
    body.role-trader .demo-xp-block input {
      pointer-events: none;
      opacity: 0.55;
    }
    body.role-auditor .demo-hub-risk-inject button,
    body.role-auditor .demo-hub-risk-inject input,
    body.role-auditor .demo-hub-risk-inject select,
    body.role-auditor .demo-cri-preset-btn,
    body.role-auditor .demo-cri-reset-btn,
    body.role-auditor .demo-root-toggle-btn,
    body.role-auditor .demo-hub-row button,
    body.role-auditor #hubDefcon1ToggleBtn,
    body.role-auditor .demo-hub-tx-btn:not(.demo-role-btn),
    body.role-auditor .demo-xp-block button,
    body.role-auditor .demo-xp-block input {
      pointer-events: none;
      opacity: 0.55;
    }
    body.role-auditor #demoHubTabTelemetry {
      pointer-events: auto;
      opacity: 1;
    }
    body:not(.role-auditor):not(.role-risk-manager) #demoHubTabTelemetry {
      opacity: 0.45;
    }
    body.role-auditor #demoHubTabTelemetry,
    body.role-risk-manager #demoHubTabTelemetry {
      opacity: 1;
    }
    body.role-trader { --role-accent: #34d399; }
    body.role-auditor { --role-accent: #22d3ee; }
    body.role-risk-manager { --role-accent: #fbbf24; }
    .demo-root-toggle-btn.is-warn {
      border-color: rgba(251, 191, 36, 0.75);
      color: #fcd34d;
      background: rgba(69, 26, 3, 0.45);
    }
    @keyframes hud-growth-pulse {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.25); }
    }
    .status-hud-emoji { font-size: 1.1rem; line-height: 1; }
    .status-hud-subtitle {
      font-size: 0.62rem;
      font-weight: 600;
      opacity: 0.85;
      letter-spacing: 0.06em;
    }
    .demo-cri-bar {
      margin-bottom: 0.85rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.65);
    }
    .demo-cri-bar-track {
      height: 0.45rem;
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.85);
      overflow: hidden;
      margin-top: 0.35rem;
    }
    .demo-cri-bar-fill {
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, #34d399, #fbbf24, #f87171);
      transition: width 0.25s ease;
    }
    .demo-xp-block { margin-bottom: 0.85rem; }
    .demo-xp-row { display: flex; gap: 0.45rem; flex-wrap: wrap; align-items: center; margin-top: 0.35rem; }
    .demo-xp-input {
      width: 5rem;
      padding: 0.25rem 0.45rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(0,0,0,0.35);
      color: #50D2C1;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .demo-root-toggle-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
      gap: 0.35rem;
      margin-top: 0.45rem;
    }
    .demo-root-toggle-btn {
      padding: 0.3rem 0.25rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(0,0,0,0.35);
      color: #94a3b8;
      font-size: 0.62rem;
      font-weight: 900;
      cursor: pointer;
    }
    .demo-root-toggle-btn.is-tripped {
      border-color: rgba(248, 113, 113, 0.65);
      background: rgba(127, 29, 29, 0.45);
      color: #fecaca;
    }
    .root-telemetry-status.TRIPPED { color: #f87171; }
    .root-telemetry-tier-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.45rem 0.65rem;
      padding: 0.55rem 0.7rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.55);
    }
    .root-telemetry-tier-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.15rem 0.45rem;
      border-radius: 0.3rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .root-telemetry-tier.is-emerald .root-telemetry-tier-badge {
      background: rgba(6, 78, 59, 0.55);
      border: 1px solid rgba(52, 211, 153, 0.55);
      color: #6ee7b7;
    }
    .root-telemetry-tier.is-amber .root-telemetry-tier-badge {
      background: rgba(120, 53, 15, 0.55);
      border: 1px solid rgba(251, 191, 36, 0.55);
      color: #fcd34d;
    }
    .root-telemetry-tier.is-violet .root-telemetry-tier-badge {
      background: rgba(76, 29, 149, 0.5);
      border: 1px solid rgba(167, 139, 250, 0.55);
      color: #ddd6fe;
    }
    .root-telemetry-tier.is-sky .root-telemetry-tier-badge {
      background: rgba(12, 74, 110, 0.55);
      border: 1px solid rgba(56, 189, 248, 0.55);
      color: #7dd3fc;
    }
    .root-telemetry-tier-title {
      flex: 1 1 auto;
      min-width: 0;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: calc(0.62rem * 1.15);
      font-weight: 800;
      letter-spacing: 0.03em;
      color: #e2e8f0;
      line-height: 1.35;
    }
    .root-telemetry-tier-focus {
      width: 100%;
      font-size: calc(0.58rem * 1.15);
      font-weight: 600;
      color: #94a3b8;
      line-height: 1.35;
    }
    .root-telemetry-tier-body {
      display: flex;
      flex-direction: column;
      gap: 0.28rem;
      padding: 0.45rem 0.5rem 0.55rem;
      height: auto;
      overflow: visible;
    }
    .root-telemetry-row {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.4rem 0.55rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(0,0,0,0.28);
      font-size: calc(0.68rem * 1.15);
      cursor: help;
    }
    .root-telemetry-status {
      font-weight: 900;
      color: #7DFFD0;
      white-space: nowrap;
    }
    .root-telemetry-status.ENGAGED { color: #fca5a5; }
    .root-telemetry-status.ACTIVE { color: #7DFFD0; }
    .root-telemetry-status.READY { color: #50D2C1; }
    .root-telemetry-status.STANDBY { color: #94a3b8; }
    .root-telemetry-status.FAIL { color: #f87171; }
    .quick-close-btn {
      padding: 0.2rem 0.45rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(248, 113, 113, 0.45);
      background: rgba(127, 29, 29, 0.35);
      color: #fecaca;
      font-size: 0.65rem;
      font-weight: 900;
      cursor: pointer;
    }
    .post-trade-review-toast {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 95;
      padding: 0.75rem 1.1rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.5);
      background: rgba(6, 20, 13, 0.95);
      color: #A0FFE0;
      font-weight: 900;
      font-size: 0.8rem;
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.3);
    }
    .funding-world-tree-bar {
      border: 2px solid #50D2C1;
      background: linear-gradient(135deg, rgba(80, 210, 193, 0.16), rgba(11, 18, 23, 0.92));
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.25);
    }
    .funding-world-tree-bar.funding-extreme-demo {
      animation: pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      box-shadow: 0 0 32px rgba(255, 80, 80, 0.45);
      border-color: #fb923c;
    }
    .funding-tag {
      display: inline-flex;
      align-items: center;
      font-size: 0.62rem;
      font-weight: 900;
      padding: 0.15rem 0.4rem;
      border-radius: 0.3rem;
      border: 1px solid;
      white-space: nowrap;
    }
    .funding-tag-bleed {
      color: #fecaca;
      border-color: rgba(248, 113, 113, 0.55);
      background: rgba(127, 29, 29, 0.35);
    }
    .funding-tag-short {
      color: #fdba74;
      border-color: rgba(251, 146, 60, 0.55);
      background: rgba(154, 52, 18, 0.3);
    }
    .funding-tag-arb {
      color: #fde68a;
      border-color: rgba(251, 191, 36, 0.5);
      background: rgba(120, 53, 15, 0.35);
    }
    .funding-tag-ok {
      color: #7DFFD0;
      border-color: rgba(80, 210, 193, 0.45);
      background: rgba(80, 210, 193, 0.1);
    }
    .risk-guide-popover {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      z-index: 50;
      width: min(360px, 90vw);
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: #0b1217;
      color: #e8fff0;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
      font-size: 0.75rem;
      line-height: 1.45;
    }
    .demo-hub-backdrop {
      position: fixed;
      inset: 0;
      z-index: 85;
      background: rgba(0, 0, 0, 0.72);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .demo-hub-drawer-backdrop {
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      align-items: stretch;
      justify-content: flex-end;
      padding: 0;
    }
    .demo-hub-backdrop.hidden,
    .wallet-modal-backdrop.hidden {
      display: none !important;
      pointer-events: none !important;
      visibility: hidden;
    }
    .demo-hub-modal {
      width: min(680px, 100%);
      border-radius: 1.1rem;
      border: 2px solid rgba(80, 210, 193, 0.55);
      background: linear-gradient(160deg, #0A1F1A, #051311);
      padding: 0;
      overflow: hidden;
      box-shadow: 0 0 48px rgba(80, 210, 193, 0.35), 0 0 0 1px rgba(80, 210, 193, 0.15);
      font-size: calc((0.8rem + 2px) * 1.15);
    }
    .demo-hub-drawer {
      width: 100%;
      max-width: 400px;
      height: 100%;
      max-height: 100vh;
      border-radius: 0;
      border: none;
      border-left: 2px solid rgba(80, 210, 193, 0.55);
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .demo-hub-drawer .demo-hub-modal-header {
      flex-shrink: 0;
      height: 6.5rem;
      border-radius: 0;
    }
    .demo-hub-drawer .demo-hub-modal-body {
      flex: 1 1 auto;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .demo-hub-modal-header {
      position: relative;
      height: 9.5rem;
      background-image: url('/brand/dondon-eyes.webp');
      background-size: cover;
      background-position: center;
      border-radius: 1.05rem 1.05rem 0 0;
      overflow: hidden;
    }
    .demo-hub-modal-body {
      padding: 1.15rem 1.35rem 1.35rem;
    }
    .demo-hub-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 0.85rem;
      margin-bottom: 0.45rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.22);
      background: rgba(0, 0, 0, 0.32);
      font-size: calc((0.8rem + 2px) * 1.15);
      font-weight: 800;
      color: #e8fff0;
    }
    .demo-hub-row:last-child { border-bottom: none; margin-bottom: 0; }
    .demo-hub-tx-block {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.55rem;
      padding: 0.75rem 0.85rem;
      margin-bottom: 0.45rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(251, 191, 36, 0.35);
      background: rgba(69, 26, 3, 0.28);
      font-size: calc((0.8rem + 2px) * 1.15);
      font-weight: 800;
      color: #fde68a;
    }
    .demo-hub-tx-label {
      color: #fbbf24;
      font-weight: 900;
      letter-spacing: 0.02em;
    }
    .demo-hub-tx-options {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.35rem;
    }
    .demo-hub-tx-btn {
      width: 100%;
      text-align: left;
      padding: 0.45rem 0.65rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: rgba(2, 6, 23, 0.55);
      color: #cbd5e1;
      font-size: calc((0.68rem + 2px) * 1.15);
      font-weight: 800;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;
    }
    .demo-hub-tx-btn:hover {
      border-color: rgba(251, 191, 36, 0.55);
      color: #fde68a;
    }
    .demo-hub-tx-btn.is-active {
      border-color: rgba(251, 191, 36, 0.85);
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
    }
    .demo-hub-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.25rem;
      margin-bottom: 0.85rem;
      padding: 0.3rem;
      border-radius: 0.7rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: rgba(0, 0, 0, 0.45);
    }
    .demo-hub-tab {
      padding: 0.6rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px solid transparent;
      background: transparent;
      color: #94a3b8;
      font-size: calc((0.72rem + 2px) * 1.15);
      font-weight: 900;
      cursor: pointer;
      text-align: center;
      transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
    }
    .demo-hub-tab.is-active {
      background: rgba(80, 210, 193, 0.22);
      color: #ecfdf5;
      border-color: #50D2C1;
      box-shadow: 0 0 14px rgba(80, 210, 193, 0.3);
    }
    .root-telemetry-row {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.5rem 0.65rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(0,0,0,0.28);
      font-size: calc((0.72rem + 2px) * 1.15);
    }
    .tradfi-asset-chip.token-selected,
    .world-tree-capsule.token-selected {
      box-shadow: 0 0 0 2px #50D2C1, 0 0 14px rgba(80, 210, 193, 0.45);
    }
    .attack-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.75rem 1.35rem;
      border-radius: 0.65rem;
      font-weight: 900;
      font-size: 0.95rem;
      background: #50D2C1;
      color: #0b1217;
      border: 2px solid rgba(11, 18, 23, 0.35);
      transition: all 0.2s ease;
      box-shadow: 0 0 15px rgba(80, 210, 193, 0.4);
    }
    .attack-btn-xl {
      padding: 0.9rem 1.6rem;
      font-size: 1.05rem;
      min-height: 3.25rem;
    }
    .attack-btn:hover:not(:disabled) {
      filter: brightness(1.05);
      box-shadow: 0 0 22px rgba(80, 210, 193, 0.6);
    }
    .attack-btn:disabled,
    .attack-btn.attack-locked {
      opacity: 1;
      cursor: not-allowed;
      background: #4b5563;
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.55);
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.35);
      filter: none;
    }
    .attack-btn:disabled .attack-btn-dondon,
    .attack-btn.attack-locked .attack-btn-dondon {
      filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.8));
    }
    .attack-btn:not(:disabled):not(.attack-locked) .attack-btn-dondon {
      filter: drop-shadow(0 0 6px rgba(80, 210, 193, 0.6));
    }
    .matrix-inject-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.625rem 1rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(80, 210, 193, 0.65);
      background: rgba(80, 210, 193, 0.12);
      color: #50D2C1;
      font-size: 0.875rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      cursor: pointer;
      white-space: nowrap;
      text-shadow: 0 0 10px rgba(80, 210, 193, 0.45);
      box-shadow: 0 0 12px rgba(80, 210, 193, 0.18);
      transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.12s ease;
    }
    .matrix-inject-btn:hover {
      background: rgba(80, 210, 193, 0.22);
      border-color: rgba(80, 210, 193, 0.9);
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.4);
      color: #A0FFE0;
    }
    .matrix-inject-btn:active {
      transform: scale(0.95);
    }
    .pin-btn {
      cursor: pointer;
      user-select: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      line-height: 1;
      color: #9ca3af;
      background: transparent;
      border: 0;
      padding: 0;
      transform: scale(0.7);
      transition: transform 0.15s, filter 0.15s, color 0.15s;
    }
    .pin-btn:hover { transform: scale(0.78); color: #facc15; }
    .pin-btn.pinned {
      color: #facc15;
      filter: drop-shadow(0 0 6px #facc15);
    }
    .pin-btn.pin-locked { opacity: 0.35; cursor: not-allowed; }
    .row-pinned {
      background: linear-gradient(90deg, rgba(80,210,193,0.08), transparent 40%);
      box-shadow: inset 3px 0 0 #50D2C1;
    }
    @keyframes cat-spin {
      0% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 4px #50D2C1); }
      50% { transform: rotate(180deg) scale(1.06); filter: drop-shadow(0 0 14px #50D2C1); }
      100% { transform: rotate(360deg) scale(1); filter: drop-shadow(0 0 4px #50D2C1); }
    }
    .cat-spinner {
      animation: cat-spin 1.1s linear infinite;
      width: 28px; height: 28px; border-radius: 9999px;
    }
    #forceRefreshOverlay {
      display: none;
      position: fixed; inset: 0; z-index: 80;
      background: rgba(6,20,13,0.72);
      backdrop-filter: blur(3px);
      align-items: center; justify-content: center;
      flex-direction: column; gap: 0.75rem;
    }
    #forceRefreshOverlay.active { display: flex; }

    #app {
      min-height: calc(100vh - 2rem);
      color: var(--text-dark-theme);
    }
    #app[data-mounted="true"] { opacity: 1; }
    .app-boot-banner {
      margin: 0 0 0.75rem;
      padding: 0.55rem 0.85rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(10, 26, 23, 0.92);
      color: #a0ffe0;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .app-boot-banner.is-error {
      border-color: rgba(248, 113, 113, 0.45);
      color: #fecaca;
    }
    .app-boot-banner.hidden { display: none; }
    body.dashboard-booting #app { visibility: visible; opacity: 1; }

    /* === v2.0 Split-Screen Layout (70/30) + Typography === */
    body.terminal-body {
      padding: 1rem 1.25rem 0;
      padding-bottom: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .typo-title {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.35);
    }
    @media (min-width: 1024px) {
      .typo-title { font-size: 1.125rem; }
    }
    .typo-context {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 0.75rem;
      font-weight: 500;
    }
    @media (min-width: 1024px) {
      .typo-context { font-size: 0.875rem; }
    }
    .typo-context.mono,
    .typo-num {
      font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
      font-variant-numeric: tabular-nums;
    }
    .typo-action {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .terminal-header {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }
    .terminal-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: nowrap;
    }
    .global-status-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: stretch;
      gap: 0.5rem;
      width: 100%;
    }
    .global-status-bar .market-heartbeat-bar {
      flex: 1 1 100%;
    }
    .status-chip {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding: 0.4rem 0.65rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.85);
      min-width: 0;
      flex: 1 1 140px;
    }
    .status-chip-label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #50D2C1;
      font-family: 'Inter', sans-serif;
    }
    .status-chip-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 500;
      color: #e8fff0;
    }
    .status-chip--funding {
      flex: 2 1 280px;
    }
    #fundingRateKings.funding-ticker-compact {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem 0.75rem;
      font-size: 0.75rem;
    }
    .terminal-workspace {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      flex: 1 1 auto;
      min-height: 0;
      align-items: start;
    }
    @media (min-width: 1100px) {
      .terminal-workspace {
        grid-template-columns: minmax(0, 7fr) minmax(280px, 3fr);
      }
      .sniper-rail {
        position: sticky;
        top: 0.75rem;
        max-height: calc(100vh - 5.5rem);
        overflow-y: auto;
        align-self: start;
      }
    }
    .main-canvas {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .sniper-rail {
      min-width: 0;
      background: #50D2C1;
      color: #020617;
      border: 1px solid rgba(15, 23, 42, 0.22);
      border-radius: 0.85rem;
      padding: 0.65rem 0.7rem 0.75rem;
      box-shadow: 0 0 20px rgba(80, 210, 193, 0.35);
    }
    .sniper-rail,
    .sniper-rail .section-header,
    .sniper-rail .typo-title,
    .sniper-rail .typo-action,
    .sniper-rail .typo-num,
    .sniper-rail .typo-context,
    .sniper-rail .inject-status-badge,
    .sniper-rail .inject-header-subtitle {
      color: #020617;
    }
    .sniper-rail .step-badge {
      color: #020617 !important;
      border-color: rgba(15, 23, 42, 0.35) !important;
      background: rgba(255, 255, 255, 0.45);
    }
    .sniper-rail .brand-hero-header--section {
      background: transparent;
      box-shadow: none;
      border-bottom: 1px solid rgba(15, 23, 42, 0.18);
      border-radius: 0;
    }
    .sniper-rail .sniper-panel {
      background: transparent;
      border-color: rgba(15, 23, 42, 0.2);
      box-shadow: none;
    }
    .sniper-rail .target-locked-banner {
      background: rgba(2, 6, 23, 0.88);
      border-bottom-color: rgba(15, 23, 42, 0.35);
      color: #50D2C1;
    }
    .sniper-rail .merged-sl-badge,
    .sniper-rail .max-sl-lock-badge,
    .sniper-rail .dyn-sl-lock-tag {
      background: rgba(2, 6, 23, 0.9);
      border-color: rgba(15, 23, 42, 0.8);
      color: #50D2C1;
      box-shadow: none;
    }
    .sniper-rail .mega-slider-wrap {
      background: rgba(2, 6, 23, 0.9);
      border-color: rgba(15, 23, 42, 0.85);
      box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.28);
    }
    .sniper-rail .mega-slider-title .typo-action,
    .sniper-rail #consoleOrderSizeLabel {
      color: #50D2C1 !important;
      text-shadow: none !important;
    }
    .sniper-rail .mega-slider-wrap .typo-context {
      color: rgba(226, 232, 240, 0.85) !important;
    }
    .sniper-rail #consoleSlippageReadout {
      color: #020617 !important;
    }
    .sniper-rail .order-size-ceiling > .mt-2 > .typo-action {
      color: #020617 !important;
    }
    .sniper-rail .master-slider {
      accent-color: #50D2C1;
    }
    .sniper-rail .step3-econ-card {
      background: rgba(2, 6, 23, 0.9) !important;
      border-color: rgba(15, 23, 42, 0.85) !important;
      color: #50D2C1;
    }
    .sniper-rail .step3-econ-card .typo-action,
    .sniper-rail .step3-econ-card .typo-num,
    .sniper-rail .step3-econ-card .typo-context {
      color: #50D2C1 !important;
    }
    .sniper-rail .step3-econ-card input[type="number"] {
      background: rgba(15, 23, 42, 0.95) !important;
      border-color: rgba(51, 65, 85, 0.95) !important;
      color: #50D2C1 !important;
    }
    .sniper-rail .capital-preset-btn {
      background: rgba(15, 23, 42, 0.95);
      border-color: rgba(51, 65, 85, 0.95);
      color: #50D2C1;
    }
    .sniper-rail .capital-preset-btn:hover,
    .sniper-rail .capital-preset-btn.is-active {
      background: rgba(80, 210, 193, 0.18);
      border-color: #50D2C1;
      color: #A0FFE0;
    }
    .sniper-rail .vault-balance-badge {
      border-color: rgba(15, 23, 42, 0.85);
      background:
        linear-gradient(135deg, rgba(2, 6, 23, 0.98) 0%, rgba(15, 23, 42, 0.98) 60%, rgba(2, 24, 22, 0.95) 100%);
      box-shadow:
        0 0 0 1px rgba(80, 210, 193, 0.22) inset,
        0 0 16px rgba(2, 6, 23, 0.35);
    }
    .sniper-rail .vault-balance-label {
      color: #50D2C1;
    }
    .sniper-rail .vault-balance-value {
      color: #A0FFE0;
    }
    .sniper-rail .capital-preset-btn:disabled,
    .sniper-rail .capital-preset-btn.is-disabled {
      opacity: 0.32;
      color: #64748b;
    }
    .sniper-rail .soil-badge {
      background: rgba(15, 23, 42, 0.95);
    }
    .sniper-rail .attack-zone {
      background: rgba(2, 6, 23, 0.92);
      border-color: rgba(15, 23, 42, 0.85);
      box-shadow: none;
    }
    .sniper-rail .root-slip-status {
      background: rgba(15, 23, 42, 0.85);
      border-color: rgba(51, 65, 85, 0.9);
    }
    .sniper-rail .root-slip-status .typo-action,
    .sniper-rail .root-slip-status .typo-context {
      color: #50D2C1 !important;
    }
    .sniper-rail #attackWarning {
      color: #fde68a !important;
    }
    .sniper-rail .attack-btn:not(:disabled):not(.attack-locked) {
      background: #020617;
      color: #50D2C1;
      border-color: rgba(15, 23, 42, 0.85);
      box-shadow: 0 0 14px rgba(2, 6, 23, 0.35);
    }
    .sniper-rail .attack-btn:hover:not(:disabled):not(.attack-locked) {
      background: #0f172a;
      filter: none;
    }
    .sniper-rail .sop-guide-trigger-btn {
      background: rgba(2, 6, 23, 0.85);
      border-color: rgba(15, 23, 42, 0.7);
      color: #50D2C1;
    }
    .sniper-rail .sop-guide-trigger-btn:hover {
      background: #020617;
      color: #7ee0ce;
    }
    .gatekeeper-compact {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    @media (min-width: 768px) {
      .gatekeeper-compact {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    .gate-card {
      border-radius: 0.75rem;
      padding: 0.65rem 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.3);
      background: rgba(6, 32, 27, 0.8);
      box-shadow: 0 0 12px rgba(80, 210, 193, 0.08);
      min-width: 0;
    }
    .cat-card-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }
    .cat-oi-total {
      font-family: 'JetBrains Mono', monospace;
      font-size: calc(0.75rem + 1.5px);
      color: #ecfdf5;
      text-shadow: 0 0 8px rgba(52, 211, 153, 0.55), 0 1px 2px rgba(0, 0, 0, 0.85);
      font-weight: 700;
      letter-spacing: 0.01em;
    }
    .cat-fr-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .cat-fr-row {
      display: flex;
      justify-content: space-between;
      gap: 0.35rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
    }
    .cat-fr-row button {
      background: transparent;
      border: 0;
      padding: 0;
      color: #e8fff0;
      font: inherit;
      cursor: pointer;
      text-align: left;
    }
    .cat-fr-row button:hover { color: #50D2C1; }
    .sniper-panel {
      border: 1px solid rgba(80, 210, 193, 0.4);
      border-radius: 0.75rem;
      background: #0e1a17;
      overflow: hidden;
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.08);
    }
    .sniper-panel.target-lock-pulse {
      animation: gun-cock 0.65s ease-out;
    }
    @keyframes gun-cock {
      0% { box-shadow: 0 0 0 0 rgba(80, 210, 193, 0.0); transform: translateX(0); border-color: rgba(80, 210, 193, 0.28); }
      15% { box-shadow: 0 0 24px 2px rgba(80, 210, 193, 0.55); transform: translateX(-3px); border-color: #50D2C1; }
      30% { transform: translateX(3px); }
      45% { transform: translateX(-2px); box-shadow: 0 0 18px 1px rgba(80, 210, 193, 0.45); }
      100% { box-shadow: 0 0 0 0 rgba(80, 210, 193, 0); transform: translateX(0); border-color: rgba(80, 210, 193, 0.28); }
    }
    .target-locked-banner {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      background: rgba(80, 210, 193, 0.12);
      border-bottom: 1px solid rgba(80, 210, 193, 0.35);
      color: #50D2C1;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-family: 'Inter', sans-serif;
    }
    .target-locked-banner.is-active {
      display: flex;
      animation: target-pulse 1.2s ease-in-out 2;
    }
    @keyframes target-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.55; }
    }
    .sniper-stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.75rem;
    }
    .sniper-stack #draggableGrid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    @media (min-width: 1100px) {
      .sniper-stack #draggableGrid {
        grid-template-columns: 1fr;
      }
    }
    .sniper-stack .step3-econ-card {
      min-height: 0 !important;
    }
    .hardlock-badge-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      flex-direction: column;
      align-items: flex-start;
    }
    .vault-panel {
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.28);
      background: rgba(6, 20, 13, 0.75);
      padding: 0.75rem 1rem;
    }
    .debug-drawer {
      flex-shrink: 0;
      margin-top: 0.75rem;
      border-radius: 0.75rem 0.75rem 0 0;
      border: 1px solid rgba(244, 63, 94, 0.25);
      border-bottom: 0;
      background: rgba(0, 0, 0, 0.72);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
    }
    .debug-drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      user-select: none;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .debug-drawer-body {
      padding: 0.5rem 0.75rem 0.75rem;
      max-height: 12rem;
      overflow-y: auto;
    }
    .debug-drawer.is-collapsed .debug-drawer-body {
      display: none;
    }

    #globalStatusBar #dexSettlementBox.status-chip {
      background: rgba(6, 32, 27, 0.85);
      border: 1px solid rgba(80, 210, 193, 0.35);
      color: #e8fff0;
      box-shadow: none;
    }
    #globalStatusBar #dexSettlementBox.settlement-demo-locked {
      background: #0b1217;
      border-color: #50D2C1;
      color: #50D2C1;
    }
    #step1ColCenter.all-red-mode {
      padding: 0.5rem;
      border-radius: 0.75rem;
    }
    .aquarium-deprecated {
      display: none !important;
    }
    /* Tighten section headers to typography budget (excl. debug) */
    .main-canvas .section-header,
    .sniper-rail .section-header,
    .vault-panel .section-header {
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .main-canvas button.typo-action,
    .sniper-rail button.typo-action,
    .terminal-header button.typo-action {
      font-size: 0.75rem !important;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;`;

// src/ui/components/dashboard-shell.ts
function renderDashboardShellHtml(ctx) {
  const { BRAND_LOGO_DATA_URI: BRAND_LOGO_DATA_URI2 } = ctx;
  return `<body class="terminal-body min-h-screen dashboard-booting">

  <noscript>
    <div style="margin:1rem;padding:1rem;border:2px solid #50D2C1;border-radius:0.75rem;background:#0A1A17;color:#e8fff0;font-family:Inter,sans-serif;">
      JavaScript is required for live telemetry. The risk dashboard layout is server-rendered below.
    </div>
  </noscript>

  <div id="forceRefreshOverlay">
    <img src="${BRAND_LOGO_DATA_URI2}" alt="SANTENBOKU loading" class="cat-spinner" style="width:88px;height:88px;border-radius:9999px;" />
    <div class="font-hud text-circuit text-sm tracking-widest">SANTENBOKU / \u8518\u5929\u6728 \xB7 SECURED: RUNNING</div>
  </div>

  <div id="app" role="main" data-dashboard-mount="v1" aria-label="Santenboku risk terminal">
    <div id="appBootBanner" class="app-boot-banner hidden" aria-live="polite">
      Connecting v0.8 telemetry stream\u2026 SSR dashboard active.
    </div>
`;
}
__name(renderDashboardShellHtml, "renderDashboardShellHtml");
function renderDashboardShellMidHtml(ctx) {
  const { escAttr: escAttr2, brandShield: brandShield2, STATUS_DICTIONARY: STATUS_DICTIONARY3, STRATEGY_DICTIONARY: STRATEGY_DICTIONARY3, METRICS_DICTIONARY: METRICS_DICTIONARY3 } = ctx;
  return `
  <div id="walletModalBackdrop" class="wallet-modal-backdrop hidden" onclick="closeWalletModal(event)">
    <div class="wallet-modal font-mono" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-circuit font-black text-base">Connect Wallet</h3>
        <button type="button" onclick="closeWalletModal()" class="text-gray-400 hover:text-white text-sm">\u2715</button>
      </div>
      <p class="text-xs text-gray-400 mb-4">Select a wallet provider to enter the SilverVine Santenboku terminal.</p>
      <div class="flex flex-col gap-2">
        <button type="button" onclick="mockConnectWallet('MetaMask')" class="w-full px-3 py-2.5 rounded-lg border border-circuit/40 bg-circuit/10 text-circuit font-black hover:bg-circuit/20 text-left">\u{1F98A} MetaMask</button>
        <button type="button" onclick="mockConnectWallet('WalletConnect')" class="w-full px-3 py-2.5 rounded-lg border border-circuit/40 bg-black/40 text-white font-black hover:bg-white/10 text-left">\u{1F517} WalletConnect</button>
        <button type="button" onclick="mockConnectWallet('Rabby')" class="w-full px-3 py-2.5 rounded-lg border border-circuit/40 bg-black/40 text-white font-black hover:bg-white/10 text-left">\u{1F430} Rabby</button>
      </div>
      <p id="walletModalStatus" class="text-[11px] text-gray-500 mt-3">Ready \xB7 Mock / ethereum provider</p>
    </div>
  </div>


  <div id="quickTourBackdrop" class="demo-hub-backdrop hidden" aria-hidden="true" onclick="closeQuickTour(event)">
    <div class="tour-modal font-mono" onclick="event.stopPropagation()">
      <header class="tour-modal-header">
        <div class="tour-modal-header-overlay" aria-hidden="true"></div>
        <button type="button" onclick="closeQuickTour()" class="tour-modal-close" aria-label="Close quick guide">\u2715</button>
        <div class="tour-modal-header-inner">
          <h2 class="tour-modal-title">\u{1F680} ${STATUS_DICTIONARY3.QUICK_TOUR.TITLE}</h2>
        </div>
      </header>
      <div class="tour-modal-body">
        <ol class="tour-modal-steps">
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.QUICK_TOUR.STEP1.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.QUICK_TOUR.STEP1.title)}">
            <span class="tour-modal-step-badge">Step 1</span>
            <span class="tour-modal-step-body">
              <span class="inline-flex-shield">${brandShield2("brand-shield-icon", 14)} ${STATUS_DICTIONARY3.QUICK_TOUR.STEP1.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY3.QUICK_TOUR.STEP1.roots}</span>
            </span>
          </li>
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.QUICK_TOUR.STEP2.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.QUICK_TOUR.STEP2.title)}">
            <span class="tour-modal-step-badge">Step 2</span>
            <span class="tour-modal-step-body">
              <span>\u{1F3AF} ${STATUS_DICTIONARY3.QUICK_TOUR.STEP2.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY3.QUICK_TOUR.STEP2.roots}</span>
            </span>
          </li>
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.QUICK_TOUR.STEP3.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.QUICK_TOUR.STEP3.title)}">
            <span class="tour-modal-step-badge">Step 3</span>
            <span class="tour-modal-step-body">
              <span class="inline-flex-shield">${brandShield2("brand-shield-icon", 14)} ${STATUS_DICTIONARY3.QUICK_TOUR.STEP3.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY3.QUICK_TOUR.STEP3.roots}</span>
            </span>
          </li>
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.QUICK_TOUR.STEP4.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.QUICK_TOUR.STEP4.title)}">
            <span class="tour-modal-step-badge">Step 4</span>
            <span class="tour-modal-step-body">
              <span>\u{1F4DC} ${STATUS_DICTIONARY3.QUICK_TOUR.STEP4.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY3.QUICK_TOUR.STEP4.roots}</span>
            </span>
          </li>
        </ol>
        <button type="button" onclick="closeQuickTour()" class="tour-modal-cta">${STATUS_DICTIONARY3.QUICK_TOUR.CTA}</button>
      </div>
    </div>
  </div>

  <div id="sopGuideBackdrop" class="demo-hub-backdrop hidden" aria-hidden="true" onclick="closeSopGuide(event)">
    <div class="sop-guide-modal font-mono" onclick="event.stopPropagation()">
      <header class="brand-hero-header">
        <div class="brand-hero-header-overlay" aria-hidden="true"></div>
        <button type="button" onclick="closeSopGuide()" class="brand-hero-close" aria-label="Close SOP">\u2715</button>
        <div class="brand-hero-header-inner">
          <div>
            <h2 class="brand-hero-title">\u{1F4D6} SilverVine Labs Ironclad Risk Control SOP</h2>
            <p class="brand-hero-subtitle">[SANTENBOKU] Rules \xB7 Quant Risk Control Playbook</p>
          </div>
        </div>
      </header>
      <div class="sop-guide-body">
        <div class="sop-guide-steps">
          <section class="sop-guide-step">
            <h3>Phase 1: \u5B8F\u89C0\u9580\u7981\u8207\u7D50\u7B97\u6DE8\u7A7A (Macro Lock &amp; Settlement Clear)</h3>
            <ul class="list-disc list-inside">
              <li>Rule: Confirm Macro Radar shows no imminent high-impact releases (US CPI/FED) and sentiment is within control bands.</li>
            </ul>
            <p>\u{1F4DA} \u7406\u8AD6\u4F9D\u64DA\uFF1A<a href="https://www.amazon.com/dp/0471152803" target="_blank" rel="noopener noreferrer" class="sop-book-link">Nassim Taleb\u300ADynamic Hedging: Managing Vanilla and Exotic Options\u300B</a> \u2014 Avoid fat-tailed black-swan uncertainty.</p>
          </section>
          <section class="sop-guide-step">
            <h3>Phase 2: \u6A19\u7684\u72D9\u64CA\u8207\u5C0D\u6C96\u96F7\u9054 (Pre-Launch Snipe &amp; Best Hedge)</h3>
            <ul class="list-disc list-inside">
              <li>Rule: Verify funding rate before entry. Never chase longs during extreme long bleed (+0.1%+).</li>
            </ul>
            <p>\u{1F4DA} \u7406\u8AD6\u4F9D\u64DA\uFF1A<a href="https://www.amazon.com/Quantitative-Trading-Algorithmic-Business-Revised/dp/1394378041/ref=sr_1_1?nsdOptOutParam=true&amp;s=books&amp;sr=1-1" target="_blank" rel="noopener noreferrer" class="sop-book-link">Dr. Ernest P. Chan\u300AQuantitative Trading (Revised Edition)\u300B</a> \u2014 Avoid crowded trades with excessive carry friction.</p>
          </section>
          <section class="sop-guide-step">
            <h3 class="inline-flex-shield">${brandShield2("brand-shield-icon", 16)} Phase 3: \u5730\u57FA\u963B\u529B\u8207\u6ED1\u50F9\u65B7\u8DEF (Soil Resistance &amp; Slippage Breaker)</h3>
            <ul class="list-disc list-inside">
              <li class="inline-flex-shield">${brandShield2("brand-shield-icon", 14)} Rule 1: Dynamic Max SL = (Equity \xD7 1%) + $100 per order (hard-welded across all symbols).</li>
              <li>Rule 2: No structure / weak foundation / weak ceiling \u2014 no entry. Anti-FOMO enforced.</li>
              <li>Rule 3: If Order Size Slider shows [ SOIL: DANGER ] (slippage too high), entry is physically blocked.</li>
            </ul>
            <p>\u{1F4DA} \u7406\u8AD6\u4F9D\u64DA\uFF1A<a href="https://www.amazon.com/KELLY-CAPITAL-GROWTH-INVESTMENT-CRITERION/dp/9814383139/ref=sr_1_1?nsdOptOutParam=true&amp;s=books&amp;sr=1-1" target="_blank" rel="noopener noreferrer" class="sop-book-link">Edward O. Thorp\u300AThe Kelly Capital Growth Investment Criterion\u300B</a> Capital management and physical slippage breaker mechanics.</p>
          </section>
          <section class="sop-guide-step">
            <h3 class="inline-flex-shield">${brandShield2("brand-shield-icon", 16)} Phase 4: \u7D55\u5C0D\u8CC7\u672C\u9632\u8B77\u8207\u8655\u6C7A (Dynamic Max SL Weld &amp; Attack)</h3>
            <ul class="list-disc list-inside">
              <li class="inline-flex-shield">${brandShield2("brand-shield-icon", 14)} Rule: After Phases 1\u20133 pass, fire ATTACK and execute the stop-loss plan without deviation.</li>
            </ul>
            <p>\u{1F4DA} \u7406\u8AD6\u4F9D\u64DA\uFF1A<a href="https://www.amazon.com/dp/0735201447" target="_blank" rel="noopener noreferrer" class="sop-book-link">Mark Douglas\u300ATrading in the Zone\u300B</a> \u2014 Remove emotion; execute pure probabilistic edge.</p>
          </section>
        </div>
      </div>
    </div>
  </div>

  <div class="terminal-workspace">
    <div class="main-canvas">
      <div class="hot-token-spotlight bg-amber-950/40 border-amber-500/60" id="hotTokenSpotlight" aria-label="HL Pre-Launch Spotlight">
        <div class="hot-token-spotlight-main">
          <span class="hot-token-badge text-amber-400">\u{1F680} HL PRE-LAUNCH SPOTLIGHT</span>
          <div class="hot-token-meta text-amber-400">
            <span id="hotTokenSymbol">CASHCAT-USDC</span>
            <span id="hotTokenPrice">$0.0834</span>
            <span id="hotTokenChg" class="hot-chg is-neg">-26.10%</span>
            <span id="hotTokenFr" class="hot-fr">8H FR: 0.1675%</span>
          </div>
          <svg class="hot-token-sparkline" id="hotTokenSparkline" viewBox="0 0 96 28" aria-hidden="true">
            <polyline id="hotTokenSparkFill" fill="rgba(248,113,113,0.18)" stroke="none"
              points="2,6 12,8 22,10 32,12 42,14 52,16 62,18 72,20 82,22 94,24 94,28 2,28" />
            <polyline id="hotTokenSparkLine" fill="none" stroke="#f87171" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
              points="2,6 12,8 22,10 32,12 42,14 52,16 62,18 72,20 82,22 94,24" />
          </svg>
        </div>
        <button type="button" class="quick-snipe-btn" onclick="quickSnipeHotToken()">\u26A1 QUICK SNIPE</button>
      </div>

      <!-- STEP 1: Gatekeeper & Macro Lock -->
      <div class="mb-1 flex items-center gap-2 flex-wrap">
        <span class="step-badge typo-action text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded">Step 1</span>
        <h2 class="section-header typo-title m-0 inline-flex-shield">${brandShield2("brand-shield-icon-md", 20)} Step 1: Gatekeeper &amp; Macro Lock</h2>
      </div>
      <div id="autoGuardBanner" class="auto-guard-banner is-locked" aria-live="polite">
        <div class="pipeline-mode-toggle" role="group" aria-label="Trade mode master preset controller">
          <button
            type="button"
            id="modeBtnShield"
            class="pipeline-mode-btn shield is-active sv-tip"
            onclick="setTradeMode('SHIELD')"
            data-sv-tip="${escAttr2(STATUS_DICTIONARY3.TRADE_MODES.SHIELD.desc)}"
            data-sv-label="${escAttr2(STATUS_DICTIONARY3.TRADE_MODES.SHIELD.button)}"
          >
            <span class="pipeline-mode-label">${STATUS_DICTIONARY3.TRADE_MODES.SHIELD.button}</span>
            <span class="pipeline-mode-status">${STATUS_DICTIONARY3.TRADE_MODES.SHIELD.status}</span>
          </button>
          <button
            type="button"
            id="modeBtnTactical"
            class="pipeline-mode-btn tactical sv-tip"
            onclick="setTradeMode('TACTICAL')"
            data-sv-tip="${escAttr2(STATUS_DICTIONARY3.TRADE_MODES.TACTICAL.desc)}"
            data-sv-label="${escAttr2(STATUS_DICTIONARY3.TRADE_MODES.TACTICAL.button)}"
          >
            <span class="pipeline-mode-label">${STATUS_DICTIONARY3.TRADE_MODES.TACTICAL.button}</span>
            <span class="pipeline-mode-status">${STATUS_DICTIONARY3.TRADE_MODES.TACTICAL.status}</span>
          </button>
          <button
            type="button"
            id="modeBtnFlash"
            class="pipeline-mode-btn flash sv-tip"
            onclick="setTradeMode('FLASH')"
            data-sv-tip="${escAttr2(STATUS_DICTIONARY3.TRADE_MODES.FLASH.desc)}"
            data-sv-label="${escAttr2(STATUS_DICTIONARY3.TRADE_MODES.FLASH.button)}"
          >
            <span class="pipeline-mode-label">${STATUS_DICTIONARY3.TRADE_MODES.FLASH.button}</span>
            <span class="pipeline-mode-status">${STATUS_DICTIONARY3.TRADE_MODES.FLASH.status}</span>
          </button>
        </div>
        <span id="autoGuardBannerMain" class="auto-guard-banner-main"></span>
        <span id="gkHeatLamp" class="banner-heat-status is-safe sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.VOLATILITY_HEAT.SAFE.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label)}">\u{1F7E2} ${STATUS_DICTIONARY3.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label}</span>
      </div>
      <div id="step1AllRedBanner" class="step1-all-red-banner hidden">
        \u{1F6A8} DEFCON 1: ALL-RED RISK ALERT (MACRO / HIGH VOLATILITY LOCKDOWN)
      </div>
      <div class="step1-overhaul-grid" id="step1MacroSentimentTree">
        <div class="step1-sentiment-sanctuary circuit-panel p-3 mb-3" id="macroSentimentRadar" aria-label="Global Market Sentiment Radar">
          <p class="typo-action text-circuit mb-2">\u{1F6E1}\uFE0F Sanctuary Risk Shield \xB7 VIX / DVOL</p>
          <div id="vixTrad" class="vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm mb-2">
            VIX (Trad): <strong>16.8</strong>
            <a href="https://www.cboe.com/tradable_products/vix/" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="CBOE VIX">\u{1F517}</a>
            [ <span class="emoji-xl">\u{1F60C}</span> \u50B3\u7D71\u5E02\u5834\uFF1A\u5E73\u7A69 / Stable ]
          </div>
          <div id="vixCrypto" class="vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm">
            DVOL (Crypto): <strong>52.5%</strong>
            <a href="https://www.deribit.com/statistics/BTC/volatility-index" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="Deribit DVOL">\u{1F517}</a>
            [ <span class="emoji-xl">\u{1F60C}</span> \u52A0\u5BC6\u5E02\u5834\uFF1A\u6A6B\u76E4\u84C4\u52E2 / Low Vol ]
          </div>
        </div>
        <div class="gatekeeper-defense-matrix" id="step1ColLeft">
          <div
            id="marketHeartbeatBar"
            class="market-heartbeat-card is-safe"
            role="status"
            aria-live="polite"
            aria-label="Market Heartbeat"
          >
            <div class="mhb-grid">
              <div class="mhb-left">
                <div class="mhb-title">MARKET HEARTBEAT</div>
                <div class="mhb-root5">
                  <span
                    class="mhb-root5-label root-tag sv-tip"
                    data-sv-tip="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT5_VIX_DVOL.desc)}"
                    data-sv-label="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT5_VIX_DVOL.label)}"
                  >${STATUS_DICTIONARY3.ROOT_TAGS.ROOT5_VIX_DVOL.label}</span>
                  <span id="heartbeatVolState" class="mhb-vol-state">SAFE / STABLE</span>
                </div>
                <div id="heartbeatCircuitLabel" class="mhb-circuit">NO CIRCUIT RISK</div>
                <span id="heartbeatVolLabel" class="hidden" aria-hidden="true">SAFE / STABLE</span>
              </div>
              <div class="mhb-right">
                <div id="hlCountdownWrap" class="mhb-hl">
                  <span
                    id="root10TsunamiTag"
                    class="root-tag sv-tip"
                    data-sv-tip="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT10_TSUNAMI.desc)}"
                    data-sv-label="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT10_TSUNAMI.label)}"
                  >${STATUS_DICTIONARY3.ROOT_TAGS.ROOT10_TSUNAMI.label}</span>
                  <span class="mhb-hl-text">HL Settled: <span id="hlCountdown">--m --s</span></span>
                </div>
                <div class="mhb-sessions" aria-label="Global trading sessions">
                  <div class="mhb-sessions-header">
                    <span class="mhb-sessions-title">SESSIONS</span>
                    <span
                      class="root-tag sv-tip"
                      data-sv-tip="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT13_SESSION.desc)}"
                      data-sv-label="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT13_SESSION.label)}"
                    >${STATUS_DICTIONARY3.ROOT_TAGS.ROOT13_SESSION.label}</span>
                  </div>
                  <div class="mhb-session-row">
                    <span class="mhb-session-name">ASIA (TOKYO/HKT):</span>
                    <span id="sessionAsiaClock" class="mhb-session-clock">--:--:--</span>
                    <span id="sessionAsia" class="mhb-session-state is-closed">CLOSED</span>
                  </div>
                  <div class="mhb-session-row">
                    <span class="mhb-session-name">EUROPE (LONDON):</span>
                    <span id="sessionEuropeClock" class="mhb-session-clock">--:--:--</span>
                    <span id="sessionEurope" class="mhb-session-state is-closed">CLOSED</span>
                  </div>
                  <div class="mhb-session-row">
                    <span class="mhb-session-name">US (NEW YORK):</span>
                    <span id="sessionUSClock" class="mhb-session-clock">--:--:--</span>
                    <span id="sessionUS" class="mhb-session-state is-closed">CLOSED</span>
                  </div>
                </div>
                <div
                  id="root10VolWindow"
                  class="mhb-root10 hidden sv-tip"
                  data-sv-tip="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT10_TSUNAMI.desc)}"
                  data-sv-label="[ HKT 21-23 Window - HIGH VOLATILITY ]"
                >[ HKT 21-23 Window - HIGH VOLATILITY ]</div>
              </div>
            </div>
          </div>
          <div class="gk-matrix-title inline-flex-shield">${brandShield2("brand-shield-icon", 16)} Gatekeeper Defense Matrix</div>
          <div class="gk-status-row" id="gkStatusRow">
            <span
              id="gkStatusGeo"
              class="gk-status-pill sv-tip"
              tabindex="0"
              data-sv-tip="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT2_GEO_LOCK.desc)}"
              data-sv-label="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT2_GEO_LOCK.ok)}"
            >${STATUS_DICTIONARY3.ROOT_TAGS.ROOT2_GEO_LOCK.ok}</span>
            <span
              id="gkStatusSlippage"
              class="gk-status-pill sv-tip"
              tabindex="0"
              data-sv-tip="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT8_SLIPPAGE_BREAKER.desc)}"
              data-sv-label="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT8_SLIPPAGE_BREAKER.ok)}"
            >${STATUS_DICTIONARY3.ROOT_TAGS.ROOT8_SLIPPAGE_BREAKER.ok}</span>
            <span
              id="gkStatusSl"
              class="gk-status-pill sv-tip"
              tabindex="0"
              data-sv-tip="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT1_SL_WELD.desc)}"
              data-sv-label="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT1_SL_WELD.label)}"
            >${STATUS_DICTIONARY3.ROOT_TAGS.ROOT1_SL_WELD.label}</span>
          </div>
          <div class="gk-macro-mini gate-card us-macro-card" style="background:transparent;border:0;box-shadow:none;padding:0;">
            <div class="macro-radar-title-row typo-action text-gray-400">
              <span>\u{1F4E1} Macro Radar \xB7 FOMC / CPI</span>
              <span
                class="root-tag sv-tip"
                data-sv-tip="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT_MACRO_FILTER.desc)}"
                data-sv-label="${escAttr2(STATUS_DICTIONARY3.ROOT_TAGS.ROOT_MACRO_FILTER.label)}"
              >${STATUS_DICTIONARY3.ROOT_TAGS.ROOT_MACRO_FILTER.label}</span>
            </div>
            <div id="usMacroEvents" class="flex flex-col gap-1">
              <div class="us-macro-row typo-context flex justify-between gap-2">
                <span>\u{1F1FA}\u{1F1F8} FOMC <a href="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">\u{1F517}</a></span>
                <span id="macroFomcCountdown" class="typo-num text-[#50D2C1]">8d 12h</span>
              </div>
              <div class="us-macro-row typo-context flex justify-between gap-2">
                <span>\u{1F1FA}\u{1F1F8} CPI <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">\u{1F517}</a></span>
                <span id="macroCpiCountdown" class="typo-num text-[#50D2C1]">--</span>
              </div>
              <div class="us-macro-row typo-context flex justify-between gap-2">
                <span>\u{1F1EA}\u{1F1FA} ECB <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">\u{1F517}</a></span>
                <span id="macroEcbCountdown" class="typo-num text-[#50D2C1]">--</span>
              </div>
              <div class="us-macro-row typo-context flex justify-between gap-2">
                <span>\u{1F1EF}\u{1F1F5} BOJ <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">\u{1F517}</a></span>
                <span id="macroBojCountdown" class="typo-num text-[#50D2C1]">--</span>
              </div>
            </div>
            <div class="macro-oracle-badge">
              [ \u2139\uFE0F Data Source: Federal Reserve &amp; BLS Official Oracles | Informational Only ]
            </div>
          </div>
        </div>

        <div class="best-hedge-radar bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 text-slate-200" id="step1BestHedgeRadar">
          <div class="best-hedge-header">
            <h3 class="best-hedge-title">BEST HEDGE &amp; DELTA NEUTRAL RADAR</h3>
          </div>
          <div class="best-hedge-body">
          <div class="best-hedge-hero-row">
            <div class="best-hedge-symbol-row">
              <div class="best-hedge-token-pair">
                <span class="best-hedge-token-icon" aria-hidden="true"></span>
                <span id="bestPairSymbol" class="text-white font-extrabold drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">--- / USDC</span>
              </div>
              <span id="bestPairYield" class="text-emerald-400 font-black">---% APR</span>
            </div>
            <div class="best-hedge-badges">
              <span
                class="best-hedge-auto-lock sv-tip"
                data-sv-tip="${escAttr2(STATUS_DICTIONARY3.BEST_HEDGE_STRATEGY.AUTO_LOCKED.desc)}"
                data-sv-label="${escAttr2(STATUS_DICTIONARY3.BEST_HEDGE_STRATEGY.AUTO_LOCKED.label)}"
              >${STATUS_DICTIONARY3.BEST_HEDGE_STRATEGY.AUTO_LOCKED.label}</span>
              <span
                id="bestPairAction"
                class="best-pair-action-tag sv-tip is-cashcat"
                data-sv-tip="${escAttr2(STRATEGY_DICTIONARY3.CASHCAT.tooltip)}"
                data-sv-label="${escAttr2(STRATEGY_DICTIONARY3.CASHCAT.actionText)}"
              >Computing\u2026</span>
            </div>
          </div>
          <div class="best-hedge-returns">
            <div class="flex items-baseline gap-2 min-w-0">
              <span class="best-hedge-returns-label">7d:</span>
              <span id="bestPairProfit" class="best-hedge-returns-value">---</span>
            </div>
            <div class="flex items-baseline gap-2 min-w-0">
              <span class="best-hedge-returns-label">30d:</span>
              <span id="bestPairProfit30" class="best-hedge-returns-value">---</span>
              <span class="best-hedge-returns-label">USD</span>
            </div>
          </div>
          <button type="button" id="lockBestHedgeBtn" class="lock-best-hedge-btn sv-tip bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]" onclick="lockBestHedgeToStep3()" disabled data-sv-tip="${escAttr2(STATUS_DICTIONARY3.BEST_HEDGE_STRATEGY.LOCK_BUTTON.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.BEST_HEDGE_STRATEGY.LOCK_BUTTON.label)}">
            ${brandShield2("lock-shield-icon", 20)}
            ${STATUS_DICTIONARY3.BEST_HEDGE_STRATEGY.LOCK_BUTTON.label}
          </button>
          <div class="best-hedge-lock-hint">Auto-injects optimal delta-neutral strategy with dynamic Effective Max SL = (Equity \xD7 1%) + $100.</div>

          <div class="live-vol-heat-panel sv-tip" id="liveVolHeatPanel" aria-label="Live Volatility Heat" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.VOLATILITY_HEAT.SAFE.desc)}" data-sv-label="Live Volatility Heat">
            <div class="gk-heat-row">
              <span class="typo-context">Live Volatility Heat</span>
              <span id="liveVolHeatScore" class="live-vol-heat-score">--</span>
            </div>
            <div id="liveVolHeatMeta" class="live-vol-heat-meta">Heat score \xB7 VIX / DVOL composite</div>
          </div>

          <div class="gk-telemetry-grid" id="bestHedgeMetricsGrid" aria-label="Friction &amp; Volatility Metrics">
            <div class="gk-telemetry-chip sv-tip" data-sv-tip="${escAttr2(METRICS_DICTIONARY3.GAS.desc)}" data-sv-label="${escAttr2(METRICS_DICTIONARY3.GAS.label)}">
              <span class="label">${METRICS_DICTIONARY3.GAS.label}</span>
              <span class="value" id="gkGasReadout">$2.50</span>
            </div>
            <div class="gk-telemetry-chip sv-tip" data-sv-tip="${escAttr2(METRICS_DICTIONARY3.FRICTION.desc)}" data-sv-label="${escAttr2(METRICS_DICTIONARY3.FRICTION.label)}">
              <span class="label">${METRICS_DICTIONARY3.FRICTION.label}</span>
              <span class="value" id="gkFrictionReadout">0.24%</span>
            </div>
            <div class="gk-telemetry-chip sv-tip" data-sv-tip="${escAttr2(METRICS_DICTIONARY3.SLIPPAGE.desc)}" data-sv-label="${escAttr2(METRICS_DICTIONARY3.SLIPPAGE.label)}">
              <span class="label">${METRICS_DICTIONARY3.SLIPPAGE.label}</span>
              <span class="value" id="gkSlipReadout">--</span>
            </div>
            <div class="gk-telemetry-chip sv-tip" data-sv-tip="${escAttr2(METRICS_DICTIONARY3.HEAT.desc)}" data-sv-label="${escAttr2(METRICS_DICTIONARY3.HEAT.label)}">
              <span class="label">${METRICS_DICTIONARY3.HEAT.label}</span>
              <span class="value" id="gkHeatScore">--</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- Hidden legacy Step 1 shells for older selectors -->
      <div id="step1ColCenter" class="hidden" aria-hidden="true"></div>
      <div id="alphaEdgeTokens" class="hidden" aria-hidden="true"></div>

      <!-- STEP 2: Weak Target Radar -->
      <div class="mb-1 flex items-center gap-2 flex-wrap">
        <span class="step-badge typo-action text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded">Step 2</span>
        <div>
          <h2 class="section-header typo-title m-0" title="Six asset branches \xB7 OI \xB7 Extreme FR">\u{1F3AF} Step 2: Weak Target Radar</h2>
          <p class="typo-context text-gray-400">6 categories \xB7 ALL HL tokens mapped \xB7 Top 3 extreme FR \xB7 Lock \u2192 Sniper</p>
        </div>
      </div>

      <div class="step2-funding-panel funding-world-tree-bar" id="fundingRateKingsBar">
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <span class="typo-action text-[#50D2C1]">\u{1F525} Funding Extremes \xB7 Top/Bottom 3</span>
          <button type="button" id="fundingRiskGuideBtn" onclick="toggleFundingRiskGuide()" class="typo-action px-1.5 py-0.5 rounded border border-[#50D2C1]/50 text-[#50D2C1] hover:bg-[#50D2C1]/10">INFO</button>
        </div>
        <div class="relative">
          <div id="fundingRiskGuidePopover" class="risk-guide-popover hidden">
            <div class="font-black text-[#50D2C1] mb-2">Funding Rate Risk Guide</div>
            <p class="mb-2">Funding rate is hourly interest paid between longs and shorts on perpetuals. Positive = longs pay shorts; negative = shorts pay longs.</p>
            <p class="mb-2"><strong class="text-rose-300">Carry bleed risk:</strong> Extreme positive funding can drain long P&amp;L; extreme negative funding drains naked shorts.</p>
            <p>Practice: Watch Top 3, Soil Resistance, and settlement countdown \u2014 avoid blind entries near the hour.</p>
          </div>
        </div>
        <div id="fundingRateKings" class="funding-ticker-compact status-chip-value">
          <span class="text-gray-500">Syncing...</span>
        </div>
      </div>

      <div class="mb-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-2 tradfi-panel-scale" id="tradFiPanel">
        <div id="tradfi-crypto" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel step1-glacier-card bg-[#051A16]/80 border border-[#50D2C1]/30" style="order:0;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">\u26A1 Crypto</span>
            <span id="cryptoOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="cryptoPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-commodities" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:1;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">\u269C\uFE0F Commodities</span>
            <span id="commoditiesOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="commoditiesPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-stocks" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:2;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">\u{1F4C8} Stocks</span>
            <span id="stocksOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="stocksPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-indices" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:3;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">\u{1F4CA} Indices</span>
            <span id="indicesOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="indicesPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-fx" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:4;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">\u{1F4B1} FX</span>
            <span id="fxOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="fxPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-preipo" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:5;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">\u{1F680} Pre-IPO</span>
            <span id="preipoOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="preipoPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
      </div>

      <div class="rounded-xl overflow-hidden shadow-md border" style="background-color: var(--bg-card-dark); border-color: var(--border-color)" id="tokenTableSection">
        <header class="brand-hero-header brand-hero-header--matrix">
          <div class="brand-hero-header-overlay" aria-hidden="true"></div>
          <div class="brand-hero-header-inner w-full">
            <div class="matrix-table-toolbar">
              <div>
                <h3 class="brand-hero-title brand-hero-title--section typo-title">Filtered Token Table</h3>
                <p class="brand-hero-subtitle typo-context">Symbol \xB7 Price / 8H FR \xB7 HL OI \xB7 APR \xB7 Slippage \xB7 Quick Lock</p>
              </div>
              <div class="matrix-table-toolbar-right">
                <div id="matrixCategoryFilters" class="flex flex-wrap gap-1.5 justify-end">
                  <button type="button" data-category="ALL" onclick="setMatrixCategoryFilter('ALL')" class="matrix-category-btn active typo-action px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">\u{1F310} All</button>
                  <button type="button" data-category="CRYPTO" onclick="setMatrixCategoryFilter('CRYPTO')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">\u26A1 Crypto</button>
                  <button type="button" data-category="COMMODITIES" onclick="setMatrixCategoryFilter('COMMODITIES')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">\u{1F334} Commodities</button>
                  <button type="button" data-category="STOCKS" onclick="setMatrixCategoryFilter('STOCKS')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">\u{1F4C8} Stocks</button>
                  <button type="button" data-category="INDICES" onclick="setMatrixCategoryFilter('INDICES')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">\u{1F4CA} Indices</button>
                  <button type="button" data-category="FX" onclick="setMatrixCategoryFilter('FX')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">\u{1F4B1} FX</button>
                  <button type="button" data-category="PREIPO" onclick="setMatrixCategoryFilter('PREIPO')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">\u{1F680} Pre-IPO</button>
                </div>
                <div class="matrix-table-updated typo-num" id="lastUpdated">Syncing market foundation data...</div>
              </div>
            </div>
            <div class="matrix-table-filters">
              <div class="flex flex-col lg:flex-row lg:items-center gap-3 justify-between mt-2">
                <div class="relative w-full lg:max-w-xs">
                  <input id="tokenSearchInput" type="search" placeholder="Search token (e.g. BTC)..." oninput="onTokenSearchInput()"
                    class="w-full bg-black/40 border border-white/10 rounded px-3 py-2 typo-context text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div id="pairStatusFilters" class="flex flex-wrap gap-1.5">
                  <button type="button" data-status="ALL" onclick="setPairStatusFilter('ALL')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">All</button>
                  <button type="button" data-status="OPEN" onclick="setPairStatusFilter('OPEN')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Open</button>
                  <button type="button" data-status="HOLD" onclick="setPairStatusFilter('HOLD')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Hold</button>
                  <button type="button" data-status="SPREAD" onclick="setPairStatusFilter('SPREAD')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Spread</button>
                  <button type="button" data-status="DEFICIT" onclick="setPairStatusFilter('DEFICIT')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Deficit</button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div class="matrix-pagination-bar border-b" id="matrixPaginationTop">
          <span class="pagination-info text-gray-400 typo-context">Page 0 / 0 \xB7 0 rows</span>
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5 typo-context text-gray-400">
              <span>Show:</span>
              <button type="button" data-page-size="5" onclick="setPageSize(5)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">5</button>
              <button type="button" data-page-size="10" onclick="setPageSize(10)" class="matrix-page-size-btn active typo-action px-2 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">10</button>
              <button type="button" data-page-size="20" onclick="setPageSize(20)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">20</button>
              <button type="button" data-page-size="all" onclick="setPageSize('all')" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">All</button>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="page-prev-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToPrevPage()">Prev</button>
              <button type="button" class="page-next-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToNextPage()">Next</button>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse dynamic-text-target table-layout-fixed" id="matrixTable">
            <thead>
              <tr class="uppercase tracking-wider border-b select-none typo-action" style="border-color: var(--border-color); color: #9ca3af">
                <th class="p-2 sticky-col-left text-center" style="width: 40px;" title="Favorite / Pin to Top">\u2606</th>
                <th class="p-2 sticky-col-left cursor-pointer hover:bg-white/5" style="width: 110px; left: 40px;" onclick="sortTable(1)">Symbol</th>
                <th class="p-2 text-emerald-400 cursor-pointer hover:bg-white/5" style="width: 100px;" onclick="sortTable(2)">HL OI</th>
                <th class="p-2 cursor-pointer hover:bg-white/5" style="width: 120px;" onclick="sortTable(3)">PRICE / 8H FR</th>
                <th class="p-2 text-circuit cursor-pointer hover:bg-white/5" style="width: 100px;" onclick="sortTable(4)">HL APR</th>
                <th class="p-2 text-center text-circuit" style="width: 120px;">Slippage</th>
                <th class="p-2 sticky-col-right text-right" style="width: 168px;" title="Lock to Step 3">Lock to Step 3</th>
              </tr>
            </thead>
            <tbody id="matrixTableBody" class="divide-y divide-white/5"></tbody>
          </table>
        </div>
        <div class="matrix-pagination-bar border-t" id="matrixPaginationBottom">
          <span class="pagination-info text-gray-400 typo-context">Page 0 / 0 \xB7 0 rows</span>
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5 typo-context text-gray-400">
              <span>Show:</span>
              <button type="button" data-page-size="5" onclick="setPageSize(5)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">5</button>
              <button type="button" data-page-size="10" onclick="setPageSize(10)" class="matrix-page-size-btn active typo-action px-2 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">10</button>
              <button type="button" data-page-size="20" onclick="setPageSize(20)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">20</button>
              <button type="button" data-page-size="all" onclick="setPageSize('all')" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">All</button>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="page-prev-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToPrevPage()">Prev</button>
              <button type="button" class="page-next-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToNextPage()">Next</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Positions & Execution Logs (replaces bottom Vault box) -->
      <div class="live-ops-panel mt-2" id="livePositionsLogsPanel">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="step-badge typo-action text-[#50D2C1] border border-[#50D2C1]/50 px-2 py-0.5 rounded">Ops</span>
          <h2 class="section-header typo-title m-0">\u{1F4DC} Step 4: Live Positions &amp; Review Logs</h2>
        </div>
        <div class="live-ops-grid">
          <div>
            <div class="typo-action text-gray-400 mb-1">Active Positions</div>
            <div class="overflow-x-auto">
              <table class="live-ops-table" id="activePositionsTable">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Size</th>
                    <th>Dynamic SL</th>
                    <th>PnL</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="activePositionsBody">
                  <tr id="activePositionsEmpty"><td colspan="5" class="text-gray-500">No open positions</td></tr>
                </tbody>
              </table>
            </div>
            <!-- Hidden vault mirrors for header sync -->
            <span id="vaultOpenPositions" class="hidden">0</span>
            <span id="vaultSettledPnl" class="hidden">$0.00</span>
            <span id="vaultLastAttack" class="hidden">\u2014</span>
          </div>
          <div>
            <div class="typo-action text-gray-400 mb-1">Real-time Execution Log</div>
            <div id="execLogStream" class="exec-log-stream" aria-live="polite">
              <div class="log-line log-ok">[SYSTEM] Root Defense loop armed \xB7 waiting for inject / ATTACK</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT 30%: Sniper Execution Shield (merged Step 3 + Execution) -->
    <aside class="sniper-rail bg-[#50D2C1] text-slate-950" id="sniperExecutionShield" aria-label="Sniper Execution Shield">
      <div class="mb-1 flex items-center gap-2 flex-wrap">
        <span class="step-badge typo-action text-slate-950 border border-slate-900/40 px-2 py-0.5 rounded">Step 3</span>
        <h2 class="section-header typo-title m-0 text-slate-950 inline-flex-shield">${brandShield2("brand-shield-icon-md", 20)} Step 3: Sniper Execution Shield</h2>
      </div>
      <div class="step3-emergency-row">
        <button type="button" class="emergency-close-all-btn" onclick="emergencyCloseAllPositions()" title="Instant mock exit of all positions">
          \u{1F6A8} EMERGENCY CLOSE ALL
        </button>`;
}
__name(renderDashboardShellMidHtml, "renderDashboardShellMidHtml");
function renderDashboardShellTailHtml(_ctx) {
  return `
  <div class="debug-drawer" id="debugDrawer">
    <div class="debug-drawer-header" onclick="toggleDebugDrawer()" role="button" tabindex="0">
      <span class="text-rose-400 font-bold flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
        SYSTEM DEBUG CONSOLE (SANTENBOKU)
      </span>
      <div class="flex items-center gap-2" onclick="event.stopPropagation()">
        <button type="button" onclick="toggleDefcon1Demo()" class="typo-action bg-red-950/50 border border-red-500/40 px-2 py-0.5 rounded hover:bg-red-900/50 text-red-200">DEFCON 1</button>
        <button onclick="clearLogs()" class="typo-action bg-white/5 border border-white/10 px-2 py-0.5 rounded hover:bg-white/10 text-white">Clear</button>
        <button type="button" id="debugDrawerToggleBtn" onclick="toggleDebugDrawer()" class="typo-action text-gray-400 border border-white/10 px-2 py-0.5 rounded">Collapse</button>
      </div>
    </div>
    <div class="debug-drawer-body">
      <div id="consoleOutput" class="space-y-1 text-gray-300">
        <div class="text-emerald-400">[SYSTEM] Santenboku defense matrix online \xB7 SECURED: RUNNING \xB7 Layout v2.0 70/30</div>
      </div>
    </div>
  </div>

  <footer id="appFooter" class="app-footer mt-8 mb-4 px-4 py-4 rounded-xl border border-[#50D2C1]/25 bg-black/40 font-mono">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-400">
      <div class="text-center sm:text-left">
        <a
          href="https://www.SliverVineLabs.com"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-copyright-link"
        >\xA9 2026 SliverVine Labs. All rights reserved.</a>
      </div>
      <div class="flex items-center justify-center gap-2 text-[#50D2C1] font-bold">
        <a
          href="https://x.com/SliverVineLabs"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-x-link"
          aria-label="SliverVine Labs on X"
          title="X / Twitter"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
          </svg>
        </a>
        <span class="text-gray-600">|</span>
        <button type="button" class="footer-link-btn" onclick="openLegalModal('tc')">T&amp;C</button>
        <span class="text-gray-600">|</span>
        <button type="button" class="footer-link-btn" onclick="openLegalModal('privacy')">Privacy</button>
        <span class="text-gray-600">|</span>
        <button type="button" class="footer-link-btn" onclick="openLegalModal('disclaimer')">Disclaimer</button>
      </div>
    </div>
  </footer>
  <div id="legalModalBackdrop" class="demo-hub-backdrop hidden" aria-hidden="true" onclick="closeLegalModal(event)">
    <div class="demo-hub-modal font-mono" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-3">
        <h3 id="legalModalTitle" class="text-[#50D2C1] font-black text-base">Legal</h3>
        <button type="button" onclick="closeLegalModal()" class="text-gray-400 hover:text-white text-sm">\u2715</button>
      </div>
      <div id="legalModalBody" class="legal-modal-body text-xs text-gray-300 leading-relaxed"></div>
    </div>
  </div>
  </div><!-- #app -->`;
}
__name(renderDashboardShellTailHtml, "renderDashboardShellTailHtml");
var DASHBOARD_SHELL_HEAD_SCRIPT = `    let globalData = [];
    let currentFontSizeRem = 1.125;
    let currentSortCol = -1;
    let sortAscending = true;
    let currentPage = 1;
    let pageSize = 10; // 5 | 10 | 20 | Infinity (All)

    /**
     * Safe arg for onclick="fn(...)" inside HTML strings.
     * Uses JSON + &quot; so nested TS template-literal backslashes cannot strip quotes
     * (avoids SyntaxError: Unexpected string from injectTokenToMasterConsole(BTC)).
     */

    let pairStatusFilter = 'ALL';
    let matrixCategoryFilter = 'ALL';
    let tokenSearchQuery = '';
    let cachedDisplayList = [];
    /** Hard dead-lock: max 3 pinned tokens, pinned above search/pagination */
    const MAX_PINS = 3;
    let pinnedSymbols = [];
    /** Defense 3/4 \u2014 FORCE REFRESH physical debounce lock (ms) */
    const FORCE_REFRESH_DEBOUNCE_MS = 2000;
    let lastForceRefreshAt = 0;
    let forceRefreshInFlight = false;
    /** Settlement lockdown \u2014 true when < 5 min to hourly funding */
    let settlementLockdownActive = false;
    let tsunamiShieldActive = false;
    /** Demo Switch \u2014 override global sessions into Red Alert visuals */
    let shieldDemoRedAlertActive = false;
    const SHIELD_DEMO_RED_ALERT_MSG =
      'SHIELD LOCKED (21:00-23:00) HKT - Extreme Volatility. Order execution disabled.';
    /** Demo Switch \u2014 force Settlement Lockdown visuals + execution block */
    let settlementLockdownDemoActive = false;
    const SETTLEMENT_LOCKDOWN_DEMO_MSG =
      'SETTLEMENT LOCKDOWN DEMO: NO OPEN POSITIONS';
    /** Demo Switch \u2014 persist draggable layout via localStorage */
    const LAYOUT_MEMORY_FLAG_KEY = 'santenboku_layout_memory_enabled';
    let layoutMemoryEnabled =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(LAYOUT_MEMORY_FLAG_KEY) !== '0'
        : true;
    const GRID_LAYOUT_STORAGE_KEY = 'santenboku_grid_layout';
    const TRADFI_LAYOUT_STORAGE_KEY = 'santenboku_tradfi_layout';
    const SETTLEMENT_LOCKDOWN_SEC = 300;
    const SETTLEMENT_LOCKDOWN_MSG = '[RISK LOCK] No new positions within 5 minutes of HL settlement.';
    const COMMODITY_ORDER = ['brent', 'wti', 'gold', 'silver', 'copper', 'natgas', 'platinum', 'palladium', 'aluminium', 'urnm'];
    const COMMODITY_LABELS = {
      brent: 'BRENT', wti: 'WTI', copper: 'COPPER', gold: 'GOLD', natgas: 'NATGAS', silver: 'SILVER',
      platinum: 'PLATINUM', palladium: 'PALLADIUM', aluminium: 'ALUMINIUM', urnm: 'URNM',
    };
    let cachedTradFiEnrichment = null;
    let cachedHlUniverse = [];
    let cachedTradFiSnapshots = {
      commodities: {},
      stocks: {},
      indices: {},
      fx: {},
      preipo: {},
    };

    function isExecutionDisabled() {
      return (
        settlementLockdownActive === true ||
        tsunamiShieldActive === true ||
        shieldDemoRedAlertActive === true ||
        settlementLockdownDemoActive === true
      );
    }

    function guardExecutionDisabledLink(event) {
      if (!isExecutionDisabled()) return true;
      if (event && event.preventDefault) event.preventDefault();
      if (settlementLockdownActive === true || settlementLockdownDemoActive === true) {
        addLog(settlementLockdownDemoActive ? SETTLEMENT_LOCKDOWN_DEMO_MSG : SETTLEMENT_LOCKDOWN_MSG, 'warn');
      } else {
        addLog(SHIELD_DEMO_RED_ALERT_MSG, 'warn');
      }
      return false;
    }

    function guardExecutionDisabledAction() {
      if (!isExecutionDisabled()) return false;
      if (settlementLockdownActive === true || settlementLockdownDemoActive === true) {
        addLog(settlementLockdownDemoActive ? SETTLEMENT_LOCKDOWN_DEMO_MSG : SETTLEMENT_LOCKDOWN_MSG, 'warn');
      } else {
        addLog(SHIELD_DEMO_RED_ALERT_MSG, 'warn');
      }
      return true;
    }
`;
var DASHBOARD_SHELL_TAIL_SCRIPT = `
    let fundingExtremeDemoActive = false;
    let gatekeeperDemoLocked = false;



    function toggleFundingRiskGuide() {
      const pop = document.getElementById('fundingRiskGuidePopover');
      if (!pop) return;
      pop.classList.toggle('hidden');
    }

    function toggleLayoutMemory() {
      layoutMemoryEnabled = !layoutMemoryEnabled;
      try {
        sessionStorage.setItem(
          LAYOUT_MEMORY_FLAG_KEY,
          layoutMemoryEnabled ? '1' : '0',
        );
      } catch (e) {
        // ignore
      }
      const lamp = document.getElementById('layoutMemoryLamp');
      const state = document.getElementById('layoutMemoryState');
      if (layoutMemoryEnabled) {
        if (lamp) lamp.className = 'inline-block w-2.5 h-2.5 rounded-full bg-emerald-400';
        if (state) state.innerText = 'ON';
        const order = loadStoredGridLayoutOrder();
        if (order) applyGridLayoutOrder(order);
        const tradfiOrder = loadStoredTradFiLayoutOrder();
        if (tradfiOrder) applyTradFiLayoutOrder(tradfiOrder);
        addLog('[UI] Layout Memory ON \u2014 grid layout persistence enabled.', 'info');
      } else {
        if (lamp) lamp.className = 'inline-block w-2.5 h-2.5 rounded-full bg-gray-500';
        if (state) state.innerText = 'OFF';
        addLog('[UI] Layout Memory OFF \u2014 localStorage write/read paused.', 'info');
      }
    }

    function applyGridLayoutOrder(orderIds) {
      if (!Array.isArray(orderIds) || orderIds.length === 0) return;
      const grid = document.getElementById('draggableGrid');
      if (!grid) return;
      for (let i = 0; i < orderIds.length; i++) {
        const el = document.getElementById(orderIds[i]);
        if (el) el.style.order = String(i + 1);
      }
    }

    function loadStoredGridLayoutOrder() {
      if (!layoutMemoryEnabled) return null;
      try {
        const raw = localStorage.getItem(GRID_LAYOUT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed;
      } catch (e) {
        return null;
      }
    }

    function persistGridLayoutOrder() {
      if (!layoutMemoryEnabled) return;
      try {
        const blocks = Array.from(
          document.querySelectorAll('#draggableGrid .draggable'),
        );
        const ordered = blocks
          .slice()
          .sort(
            (a, b) => parseInt(a.style.order || '0', 10) - parseInt(b.style.order || '0', 10),
          );
        const ids = ordered.map((x) => x.id);
        localStorage.setItem(GRID_LAYOUT_STORAGE_KEY, JSON.stringify(ids));
      } catch (e) {
        // ignore
      }
    }

    function applyTradFiLayoutOrder(orderIds) {
      if (!Array.isArray(orderIds) || orderIds.length === 0) return;
      for (let i = 0; i < orderIds.length; i++) {
        const el = document.getElementById(orderIds[i]);
        if (el) el.style.order = String(i + 1);
      }
    }

    function loadStoredTradFiLayoutOrder() {
      if (!layoutMemoryEnabled) return null;
      try {
        const raw = localStorage.getItem(TRADFI_LAYOUT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed;
      } catch (e) {
        return null;
      }
    }

    function persistTradFiLayoutOrder() {
      if (!layoutMemoryEnabled) return;
      try {
        const blocks = Array.from(
          document.querySelectorAll('#tradFiPanel .tradfi-draggable'),
        );
        const ordered = blocks
          .slice()
          .sort(
            (a, b) => parseInt(a.style.order || '0', 10) - parseInt(b.style.order || '0', 10),
          );
        const ids = ordered.map((x) => x.id);
        localStorage.setItem(TRADFI_LAYOUT_STORAGE_KEY, JSON.stringify(ids));
      } catch (e) {
        // ignore
      }
    }

    /** Defense 16 \u2014 serenity-style humanized console (never dump raw SQL/API) */
    function humanizeConsoleMessage(raw) {
      const line = String(raw == null ? '' : raw).trim();
      if (!line) return '';
      const upper = line.toUpperCase();
      if (/CROSS_VENUE_SLIPPAGE|SPOT_PERP_SLIPPAGE|SOIL_RESISTANCE_TRIP|SPREAD_TOO_HIGH|\u50F9\u5DEE\u904E\u5927|SOIL RESISTANCE CIRCUIT/.test(upper) || /SOIL RESISTANCE CIRCUIT BREAKER TRIPPED/i.test(line)) {
        return '[RISK ALERT] Spot/perp spread too wide \u2014 Santenboku defense matrix blocked entry';
      }
      if (/ROOT_PROTECTION_TRIP|MAX.?SL|RISKLIMITEXCEEDED/i.test(line)) {
        return '[RISK ALERT] Estimated loss near root stop-loss ceiling \u2014 entry locked to prevent liquidation';
      }
      if (/DEPTH_USD|MINDEPTH|\u6D41\u52D5\u6027\u4E0D\u8DB3/i.test(line)) {
        return '[RISK ALERT] Insufficient book depth \u2014 soil resistance rejected entry';
      }
      if (/RPC_NODE_NOT_ALLOWLISTED|NOT ON ALLOWLIST/i.test(line)) {
        return '[RISK ALERT] Unauthorized RPC node request intercepted (whitelist nodes only)';
      }
      if (/PIN LOCK|PINNED.*MAX|FOMO|\u7F6E\u9802.*\u4E0A\u9650|\u98A8\u63A7\u6B7B\u9396/i.test(line)) {
        return '[RISK DEADLOCK] Pin limit is 3 core watchlist symbols to prevent over-trading and emotional FOMO.';
      }
      if (/\u7D50\u7B97\u524D 5 \u5206\u9418\u7981\u6B62\u958B\u5009|SETTLEMENT LOCKDOWN/i.test(line)) {
        return SETTLEMENT_LOCKDOWN_MSG;
      }
      if (/TSUNAMI_SHIELD|\u6D77\u562F\u671F|SHIELD LOCKED/i.test(line)) {
        return '[RISK DEADLOCK] Tsunami window HKT 21:00\u201323:00 \xB7 Soil Resistance locked execution.';
      }
      if (/ALLMIDS.*FAILED|HL META.*FAILED|NETWORK ERROR|FETCH FAILED/i.test(line)) {
        return '[SYSTEM] Market node busy \u2014 Santenboku retrying sync. Please FORCE REFRESH shortly.';
      }
      if (/SQL(STATE|EXCEPTION|ERROR)|SQLITE|POSTGRES|MYSQL|PRAGMA/i.test(line)) {
        return '[SYSTEM] Internal data validation failed \u2014 safe degraded mode active.';
      }
      if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|HTTP\\s*[45]\\d\\d|STATUS\\s*[45]\\d\\d/i.test(line)) {
        return '[SYSTEM] External market feed interrupted \u2014 defense matrix on standby.';
      }
      if (/STACK TRACE|TYPEERROR:|REFERENCEERROR:/i.test(line)) {
        return '[SYSTEM] Engine self-check triggered protection \u2014 anomaly isolated.';
      }
      if (line.indexOf('[\u98A8\u63A7') === 0) return '[RISK CONTROL] ' + line.slice(line.indexOf(']') + 1).trim();
      if (line.indexOf('[\u7CFB\u7D71') === 0) return '[SYSTEM] ' + line.slice(line.indexOf(']') + 1).trim();
      if (line.indexOf('[TRADFI]') === 0 || line.indexOf('[allMids]') === 0 || line.indexOf('[HL') === 0 || line.indexOf('[API]') === 0 || line.indexOf('[BUNDLE]') === 0 || line.indexOf('[PIPELINE]') === 0 || line.indexOf('[SYSTEM]') === 0) {
        return line;
      }
      if (/[{}\\[\\]]/.test(line) && /error|exception|failed/i.test(line)) {
        return '[SYSTEM] Sync fluctuation detected \u2014 self-heal complete. Check latest panel quotes.';
      }
      return line;
    }

    /**
     * Weld frontend Tab filters to backend actionStatus:
     * OPEN = Rule A green SOP directions
     * HOLD = \u{1F7E1} \u975C\u89C0\u5176\u8B8A
     * SPREAD = \u{1F6D1} soil / spread breaker
     * DEFICIT = \u{1F6A8} funding inversion / Rule B high-rate risk
     */
    function resolvePairStatusKey(status, riskTripped, passedRule) {
      if (status === 'RULE_B_HIGH_RATE' || passedRule === 'B') return 'DEFICIT';
      if (riskTripped === true) return 'SPREAD';
      if (status === 'SPREAD_TOO_HIGH' || status === 'SPREAD') return 'SPREAD';
      if (status === 'SHORT_HL_SPOT_LONG_HL_PERP' || status === 'DEFICIT') return 'DEFICIT';
      if (status === 'HOLD') return 'HOLD';
      if (
        status === 'BUY_HL_SPOT_SHORT_HL_PERP' ||
        status === 'OPEN'
      ) {
        return 'OPEN';
      }
      return 'HOLD';
    }

    function onTokenSearchInput() {
      const el = document.getElementById('tokenSearchInput');
      tokenSearchQuery = el && el.value ? String(el.value).trim().toUpperCase() : '';
      currentPage = 1;
      recalculate();
    }

    function isSettlementLockdown() {
      return settlementLockdownActive === true;
    }

    function guardSettlementLockdown() {
      if (isTsunamiShieldActive() && guardTsunamiShield()) return true;
      if (!isSettlementLockdown()) return false;
      addLog(SETTLEMENT_LOCKDOWN_MSG, 'warn');
      return true;
    }

    function isTsunamiShieldActive() {
      return tsunamiShieldActive === true;
    }

    function guardTsunamiShield() {
      if (!isTsunamiShieldActive()) return false;
      addLog('[RISK DEADLOCK] Tsunami window HKT 21:00\u201323:00 \xB7 Soil Resistance locked execution.', 'warn');
      return true;
    }

    function getHktHour(now) {
      now = now || new Date();
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Hong_Kong',
        hour: 'numeric',
        hour12: false
      }).formatToParts(now);
      const hourPart = parts.find(function(p) { return p.type === 'hour'; });
      return parseInt(hourPart && hourPart.value ? hourPart.value : '0', 10);
    }

    function guardSettlementLockdownLink(event) {
      return guardExecutionDisabledLink(event);
    }

    function handleActionCellClick(statusKey) {
      if (statusKey === 'OPEN' && guardExecutionDisabledAction()) return false;
      return true;
    }

    function setPairStatusFilter(status) {
      if (status === 'OPEN' && guardExecutionDisabledAction()) return;
      pairStatusFilter = status || 'ALL';
      currentPage = 1;
      const buttons = document.querySelectorAll('.pair-status-btn');
      buttons.forEach(function(btn) {
        const active = btn.getAttribute('data-status') === pairStatusFilter;
        if (active) {
          btn.className = 'pair-status-btn px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit font-bold';
        } else {
          btn.className = 'pair-status-btn px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 font-bold hover:bg-white/10';
        }
      });
      recalculate();
    }

    function setMatrixCategoryFilter(category) {
      matrixCategoryFilter = category || 'ALL';
      currentPage = 1;
      document.querySelectorAll('.matrix-category-btn').forEach(function(btn) {
        const active = btn.getAttribute('data-category') === matrixCategoryFilter;
        btn.classList.toggle('active', active);
        if (active) {
          btn.className = 'matrix-category-btn active typo-action px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit font-bold';
        } else {
          btn.className = 'matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 font-bold hover:bg-white/10';
        }
      });
      recalculate();
    }

    function isPinned(symbol) {
      return pinnedSymbols.indexOf(String(symbol).toUpperCase()) >= 0;
    }

    function togglePin(symbol) {
      if (guardSettlementLockdown()) return;
      const sym = String(symbol || '').toUpperCase();
      if (!sym) return;
      const idx = pinnedSymbols.indexOf(sym);
      if (idx >= 0) {
        pinnedSymbols.splice(idx, 1);
        addLog('FAVORITE OFF: ' + sym + ' (' + pinnedSymbols.length + '/' + MAX_PINS + ')', 'info');
        recalculate();
        return;
      }
      if (pinnedSymbols.length >= MAX_PINS) {
        console.warn('[RISK DEADLOCK] Pin limit is 3 core watchlist symbols to prevent over-trading and emotional FOMO.');
        addLog('[RISK DEADLOCK] Pin limit is 3 core watchlist symbols to prevent over-trading and emotional FOMO.', 'warn');
        return;
      }
      pinnedSymbols.push(sym);
      addLog('FAVORITE ON: ' + sym + ' (' + pinnedSymbols.length + '/' + MAX_PINS + ')', 'success');
      recalculate();
    }

    const BRAND_FAVICON_SRC = '/brand/favicon.webp';
    function brandShieldImg(cls, size) {
      const s = size || 16;
      const c = cls || 'brand-shield-icon';
      return '<img src="' + BRAND_FAVICON_SRC + '" alt="" class="' + c + '" width="' + s + '" height="' + s + '" decoding="async" />';
    }

    function isSlippageLocked(row) {
      if (!row) return true;
      if (row.risk_tripped === true) return true;
      if (row.pairStatusKey === 'SPREAD') return true;
      if (row.actionStatus === 'SPREAD_TOO_HIGH') return true;
      return false;
    }

    function buildSoilResistanceHtml(row) {
      const locked = isSlippageLocked(row);
      const ready = STATUS_DICTIONARY.SLIPPAGE_ALERT.ATTACK_READY;
      const trip = STATUS_DICTIONARY.SLIPPAGE_ALERT.CIRCUIT_BREAKER;
      if (locked) {
        return '<div class="soil-shield soil-shield-trip sv-tip" data-sv-tip="' + escapeTooltipHtml(trip.desc) + '" data-sv-label="' + escapeTooltipHtml(trip.label) + '" title="' + escapeTooltipHtml(trip.desc) + '">' +
          brandShieldImg('soil-circuit-shield-icon', 16) +
          '<span class="font-black text-[11px]" style="color:' + trip.color + '">' + trip.label + '</span>' +
        '</div>';
      }
      return '<span class="soil-shield soil-shield-ok sv-tip" style="color:' + ready.color + '" data-sv-tip="' + escapeTooltipHtml(ready.desc) + '" data-sv-label="' + escapeTooltipHtml(ready.label) + '" title="' + escapeTooltipHtml(ready.desc) + '">\u{1F7E2} ' + ready.label + '</span>';
    }

    function pickRecommendedRow(rows) {
      const eligible = (rows || []).filter(function(row) {
        return row && row.b1_symbol && row.passedRule === 'A' && !isSlippageLocked(row);
      });
      if (eligible.length === 0) return null;
      let best = eligible[0];
      for (let i = 1; i < eligible.length; i++) {
        const row = eligible[i];
        if ((row.i1_annual_cross || 0) > (best.i1_annual_cross || 0)) {
          best = row;
        }
      }
      return best;
    }

    /** Ranked Rule A hedges by APR (bestHedgeList[0] = #1 recommendation). */
    function buildBestHedgeList(rows) {
      return (rows || [])
        .filter(function(row) {
          return row && row.b1_symbol && row.passedRule === 'A' && !isSlippageLocked(row);
        })
        .slice()
        .sort(function(a, b) {
          return (b.i1_annual_cross || 0) - (a.i1_annual_cross || 0);
        });
    }

    /** Resolve CASHCAT vs REVERSE_CASHCAT from row strategyType / actionStatus / funding. */
    function resolveStrategyType(row) {
      if (!row) return 'CASHCAT';
      const typed = String(row.strategyType || '').toUpperCase();
      if (typed === 'CASHCAT' || typed === 'REVERSE_CASHCAT') return typed;
      const action = String(row.actionStatus || '');
      if (action === 'SHORT_HL_SPOT_LONG_HL_PERP') return 'REVERSE_CASHCAT';
      if (action === 'BUY_HL_SPOT_SHORT_HL_PERP') return 'CASHCAT';
      const fr = parseFloat(row.e1_hl_funding);
      if (Number.isFinite(fr) && fr < 0) return 'REVERSE_CASHCAT';
      return 'CASHCAT';
    }

    function getStrategyEntry(strategyType) {
      const key = strategyType === 'REVERSE_CASHCAT' ? 'REVERSE_CASHCAT' : 'CASHCAT';
      return STRATEGY_DICTIONARY[key] || STRATEGY_DICTIONARY.CASHCAT;
    }

    function renderBestHedgeStrategyTag(row) {
      const bestActionEl = document.getElementById('bestPairAction');
      if (!bestActionEl) return;
      if (!row) {
        bestActionEl.className = 'best-pair-action-tag sv-tip is-empty';
        bestActionEl.style.color = '';
        bestActionEl.textContent = 'No eligible hedge';
        applySvTip(bestActionEl, STATUS_DICTIONARY.SLIPPAGE_ALERT.CIRCUIT_BREAKER.desc, 'No Eligible Hedge');
        return;
      }
      const strategyType = resolveStrategyType(row);
      const rec = getStrategyEntry(strategyType);
      const tipBody = rec.actionText + ' \u2014 ' + rec.tooltip;
      const tone = strategyType === 'REVERSE_CASHCAT' ? 'is-reverse' : 'is-cashcat';
      // Single-layer badge only \u2014 never nest another .best-pair-action-tag inside.
      bestActionEl.className = 'best-pair-action-tag sv-tip ' + tone;
      bestActionEl.style.color = '';
      bestActionEl.textContent = rec.label;
      applySvTip(bestActionEl, tipBody, rec.actionText);
    }

    function effectivePageSize(totalFiltered) {
      if (pageSize === Infinity || pageSize <= 0) return Math.max(1, totalFiltered || 1);
      return pageSize;
    }

    function goToPage(page) {
      const size = effectivePageSize(cachedDisplayList.length);
      const totalPages = Math.max(1, Math.ceil(cachedDisplayList.length / size) || 1);
      currentPage = Math.min(Math.max(1, page), totalPages);
      recalculate();
    }

    function goToPrevPage() {
      goToPage(currentPage - 1);
    }

    function goToNextPage() {
      goToPage(currentPage + 1);
    }

    function setPageSize(size) {
      if (size === 'all' || size === 'All' || size === Infinity) {
        pageSize = Infinity;
      } else {
        const n = parseInt(size, 10);
        pageSize = (n === 5 || n === 10 || n === 20) ? n : 10;
      }
      currentPage = 1;
      document.querySelectorAll('.matrix-page-size-btn').forEach(function(btn) {
        const key = btn.getAttribute('data-page-size');
        const active = (pageSize === Infinity && key === 'all') || String(pageSize) === key;
        btn.classList.toggle('active', active);
        if (active) {
          btn.className = 'matrix-page-size-btn active typo-action px-2 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit';
        } else {
          btn.className = 'matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10';
        }
      });
      recalculate();
    }

    function updatePaginationControls(totalFiltered) {
      const size = effectivePageSize(totalFiltered);
      const totalPages = Math.max(1, Math.ceil(totalFiltered / size) || 1);
      if (currentPage > totalPages) currentPage = totalPages;
      const infoText = 'Page ' + currentPage + ' / ' + totalPages + ' \xB7 ' + totalFiltered + ' rows';
      document.querySelectorAll('.pagination-info').forEach(function(info) {
        info.innerText = infoText;
      });
      document.querySelectorAll('.page-prev-btn').forEach(function(prevBtn) {
        if (currentPage <= 1) prevBtn.setAttribute('disabled', 'true');
        else prevBtn.removeAttribute('disabled');
      });
      document.querySelectorAll('.page-next-btn').forEach(function(nextBtn) {
        if (currentPage >= totalPages) nextBtn.setAttribute('disabled', 'true');
        else nextBtn.removeAttribute('disabled');
      });
    }

    // SOP \u56DB\u52D5\u4F5C\u8272\u7CFB + \u98A8\u63A7\u72C0\u614B\u878D\u5408\uFF08\u963B\u65B7\u614B\u96B1\u85CF\u65B9\u5411\uFF0C\u5EFA\u8B70\u958B\u5009\u4FDD\u7559 SOP \u6307\u5F15\uFF09
    function getSopDirection(status) {
      const s = status || 'HOLD';
      if (s === 'BUY_HL_SPOT_SHORT_HL_PERP') {
        return {
          bg: "bg-amber-500/15",
          text: "text-amber-400",
          border: "border-amber-500/30",
          direction: "\u{1F4C8} Buy HL Spot + \u{1F4C9} Short HL Perp"
        };
      }
      if (s === 'SHORT_HL_SPOT_LONG_HL_PERP') {
        return {
          bg: "bg-blue-500/15",
          text: "text-blue-400",
          border: "border-blue-500/30",
          direction: "\u{1F4C9} Short HL Spot + \u{1F4C8} Long HL Perp"
        };
      }
      return null;
    }

    function getActionStyle(status, riskTripped, passedRule) {
      const s = status || 'HOLD';
      if (s === 'RULE_B_HIGH_RATE' || passedRule === 'B') {
        return {
          bg: "bg-orange-600/25",
          text: "text-orange-300",
          border: "border-orange-400/50",
          label: "[ Rule B: High Rate Risk ]",
          statusKey: "DEFICIT"
        };
      }
      const statusKey = resolvePairStatusKey(s, riskTripped, passedRule);

      // \u{1F534} \u6ED1\u50F9\u65B7\u8DEF\uFF1A\u96B1\u85CF\u5177\u9AD4\u65B9\u5411\uFF0C\u9632\u8AA4\u64CD\u4F5C
      if (statusKey === 'SPREAD' || s === 'SPREAD_TOO_HIGH') {
        return {
          bg: "bg-red-900/40",
          text: "text-red-300",
          border: "border-red-500/50",
          label: "\u{1F534}\u3010 \u{1F6D1} SLIPPAGE BREAKER LOCKED \u3011",
          statusKey: "SPREAD"
        };
      }

      // \u{1F535} \u9006\u5DEE / Rule B \u6975\u7AEF\u8CBB\u7387\u963B\u65B7
      if (statusKey === 'DEFICIT' || s === 'SHORT_HL_SPOT_LONG_HL_PERP') {
        return {
          bg: "bg-blue-600/25",
          text: "text-blue-300",
          border: "border-blue-400/50",
          label: "\u{1F535}\u3010 \u{1F6A8} INVERSE RISK: FUNDING INVERSION BLOCK \u3011",
          statusKey: "DEFICIT"
        };
      }

      // \u{1F7E1} \u975C\u89C0\u5176\u8B8A
      if (statusKey === 'HOLD' || s === 'HOLD') {
        return {
          bg: "bg-gray-500/15",
          text: "text-gray-400",
          border: "border-gray-500/30",
          label: "\u{1F7E1}\u3010 \u{1F4A4} HOLD / WATCH \u3011",
          statusKey: "HOLD"
        };
      }

      // \u{1F7E2} \u5EFA\u8B70\u958B\u5009\uFF1A\u98A8\u63A7\u5FBD\u7AE0 + SOP \u52D5\u4F5C\u65B9\u5411\uFF08\u4FDD\u7559\u539F\u8272\u7CFB\uFF09
      const sop = getSopDirection(s);
      if (sop) {
        return {
          bg: sop.bg,
          text: sop.text,
          border: sop.border,
          label: "\u{1F7E2}\u3010 \u26A1 SUGGEST ENTRY \u3011 " + sop.direction,
          statusKey: "OPEN"
        };
      }

      return {
        bg: "bg-gray-500/15",
        text: "text-gray-400",
        border: "border-gray-500/30",
        label: "\u{1F7E1}\u3010 \u{1F4A4} HOLD / WATCH \u3011",
        statusKey: "HOLD"
      };
    }

    function getSymbolEmoji(symbol) {
      if (!symbol) return '\u{1FA99}';
      const sym = symbol.toUpperCase();
      if (sym.includes('BTC')) return '\u{1F7E0}';
      if (sym.includes('ETH')) return '\u{1F535}';
      if (sym.includes('SOL')) return '\u{1F7E3}';
      if (sym.includes('LINK')) return '\u{1F7E2}';
      if (sym.includes('BNB')) return '\u{1F7E1}';
      if (sym.includes('ADA')) return '\u{1F535}';
      if (sym.includes('XRP')) return '\u26AB';
      if (sym.includes('SUI')) return '\u{1F4A7}';
      if (sym.includes('AVAX')) return '\u{1F534}';
      return '\u{1FA99}';
    }

    function adjustFontSize(delta) {
      currentFontSizeRem += delta;
      if (currentFontSizeRem < 0.8) currentFontSizeRem = 0.8;
      if (currentFontSizeRem > 1.8) currentFontSizeRem = 1.8;
      document.documentElement.style.setProperty('--base-font-size', currentFontSizeRem + 'rem');
      addLog("UI Font Size Adjusted to: " + currentFontSizeRem.toFixed(3) + "rem", "info");
    }

    function secondsToNextHour(now) {
      const nextHour = new Date(now.getTime());
      nextHour.setMinutes(0, 0, 0);
      nextHour.setHours(now.getHours() + 1);
      return Math.max(0, Math.floor((nextHour.getTime() - now.getTime()) / 1000));
    }

    /** Macro Radar Phase 1 calendar (UTC \u2192 HKT countdown) */
    const US_MACRO_EVENTS = [
      { id: 'macroFomcCountdown', label: 'US FED FOMC', dates: ['2026-07-29T18:00:00Z', '2026-09-16T18:00:00Z', '2026-11-04T19:00:00Z', '2026-12-16T19:00:00Z'] },
      { id: 'macroCpiCountdown', label: 'US CPI', dates: ['2026-08-12T12:30:00Z', '2026-09-11T12:30:00Z', '2026-10-14T12:30:00Z'] },
      { id: 'macroEcbCountdown', label: 'EU ECB', dates: ['2026-09-11T12:15:00Z', '2026-10-30T12:15:00Z', '2026-12-18T13:15:00Z'] },
      { id: 'macroBojCountdown', label: 'Asia BOJ', dates: ['2026-09-19T03:00:00Z', '2026-10-31T03:00:00Z', '2026-12-19T03:00:00Z'] },
    ];

    /**
     * Phase 2 reserved shape \u2014 Polymarket prediction markets.
     * @typedef {{ marketId: string, question: string, yesPrice?: number, volumeUsd?: number, endDateIso?: string, sourceUrl?: string, tags?: string[] }} PredictionMarketData
     */
    /** @type {PredictionMarketData[]|null} */
    let predictionMarketCache = null;
    void predictionMarketCache;

    function formatMacroCountdown(ms) {
      if (ms <= 0) return 'LIVE / RELEASED';
      const totalSec = Math.floor(ms / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      if (days > 0) return days + 'd ' + hours + 'h';
      if (hours > 0) return hours + 'h ' + mins + 'm';
      return mins + 'm';
    }

    function nextMacroDate(dates, now) {
      const t = now.getTime();
      for (let i = 0; i < dates.length; i++) {
        const d = new Date(dates[i]).getTime();
        if (d + 2 * 3600 * 1000 > t) return d;
      }
      return new Date(dates[dates.length - 1]).getTime();
    }

    /** Macro blocking window: LIVE or within 6h before release */
    const MACRO_BLOCK_MS = 6 * 3600 * 1000;
    let lastVixValue = 16.8;
    let lastDvolValue = 38.0;
    let lastHeatScore = 29.52;
    let lastHeatState = 'safe'; // safe | elevated | extreme
    let isMacroBlocking = false;
    let cachedBestHedgeRow = null;
    /** Ranked eligible hedges by APR \u2014 [0] is the live #1 recommendation */
    let bestHedgeList = [];
    let cachedSpotlight = {
      key: 'CASHCAT',
      pair: 'CASHCAT-USDC',
      markPrice: 0.0834,
      change24h_pct: -26.10,
      fundingRate8h_pct: 0.1675,
      fundingRateHourly: 0.1675 / 800,
      openInterestNotionalUsd: 5e6,
      displayName: 'CASHCAT',
      hlSymbol: 'CASHCAT',
    };
    if (typeof window.__SV_DEMO__.forceDefcon1 !== 'boolean') {
      svDemoDispatch({ type: 'DEMO_SET_FORCE_DEFCON1', value: false });
    }

    function computeIsMacroBlocking(now) {
      now = now || new Date();
      const t = now.getTime();
      for (let i = 0; i < US_MACRO_EVENTS.length; i++) {
        const target = nextMacroDate(US_MACRO_EVENTS[i].dates, now);
        const ms = target - t;
        if (ms <= MACRO_BLOCK_MS) return true;
      }
      return false;
    }

    function applyStep1EmergencyState() {
      const vix = lastVixValue;
      const dvol = lastDvolValue;
      const isEmergencyState =
        window.__SV_DEMO__.forceDefcon1 || (vix > 20 || dvol > 55 || isMacroBlocking);
      const panel = document.getElementById('step1MacroSentimentTree') || document.getElementById('step1ColLeft');
      const banner = document.getElementById('step1AllRedBanner');
      if (!panel && !banner) return;
      if (isEmergencyState) {
        if (panel) {
          panel.classList.add(
            'all-red-mode',
            'bg-red-950/90',
            'border-2',
            'border-red-500',
            'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
          );
        }
        if (banner) {
          banner.classList.remove('hidden');
          banner.textContent =
            '\u{1F6A8} DEFCON 1: ALL-RED RISK ALERT (MACRO / HIGH VOLATILITY LOCKDOWN)';
        }
      } else {
        if (panel) {
          panel.classList.remove(
            'all-red-mode',
            'bg-red-950/90',
            'border-2',
            'border-red-500',
            'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
          );
        }
        if (banner) banner.classList.add('hidden');
      }
      refreshGatekeeperDefenseMatrix();
    }

    function updateUsMacroCountdowns(now) {
      now = now || new Date();
      US_MACRO_EVENTS.forEach(function(ev) {
        const el = document.getElementById(ev.id);
        if (!el) return;
        const target = nextMacroDate(ev.dates, now);
        el.textContent = formatMacroCountdown(target - now.getTime());
      });
      isMacroBlocking = computeIsMacroBlocking(now);
      applyStep1EmergencyState();
    }

    let connectedWalletAddress = '';
    /** Mock Hyperliquid withdrawable collateral (USD) \u2014 0 until wallet connects */
    let withdrawableCollateralUsd = 0;
    /** Account capital (editable) \u2014 capped by live Vault balance */
    let capitalUsd = 25000;
    /** Active trade mode: SHIELD | TACTICAL | FLASH */
    let tradeMode = 'SHIELD';
    /** HL wallet historical fill / TX count for 3-Role eligibility */
    let hlWalletTxCount = 0;
    let roleEligibility = {
      walletAddress: '',
      txCount: 0,
      allowedModes: ['SHIELD'],
      maxMode: 'SHIELD',
      reasons: {
        TACTICAL: ROLE_LOCK_TIPS.TACTICAL,
        FLASH: ROLE_LOCK_TIPS.FLASH,
      },
      root1HardWeld: true,
      effectiveMaxSlUsd: computeEffectiveMaxSlUsd(DEFAULT_ACCOUNT_EQUITY_USD),
      root8SlippageMax: 0.005,
    };
    const FLASH_HARD_LOCKS = { maxSlippage: 0.005 };
    /** Open positions for Live Ops + header vault */
    let openPositions = [];
    let nextPositionId = 1;
    let settledPnlUsd = 0;
    const POST_TRADE_REVIEW_KV_KEY = 'silvervine_post_trade_reviews_v1';
    /** Demo / live Root 17 Choice A UTC-day tracker */
    let root17DailyState = createRoot17DailyState();
    /** Demo hub \u2014 per-root status overrides (rootNum -> PASS | WARN | TRIPPED) */
    
    /** Demo persona role */
    let demoPersonaRole = 'TRADER';


    let toxicModeCooldownUntil = 0;
    let toxicModeModalShown = false;
    /** RPG XP for GROWTH HUD + tier display */
    let demoUserXp = 0;
    let growthHudTimer = null;
    let lastDemoXp = 0;
    /** DonDon IP transient animation state (Priority 2) */
    let dondonTransientKind = null;
    let dondonTransientTimer = null;



    let criHudRefreshing = false;


    function isRoot17Blocking() {
      return checkRoot17DailyLimit({
        accountEquityUsd: resolveAccountEquityUsd(),
        state: root17DailyState,
      }).tripped;
    }



    async function fetchHlWalletTxCount(walletAddress) {
      // Demo Control Hub TX override takes priority (works without connected wallet).
      if (typeof window.__SV_DEMO__.mockHlTxCount === 'number' && Number.isFinite(window.__SV_DEMO__.mockHlTxCount)) {
        return Math.max(0, Math.floor(window.__SV_DEMO__.mockHlTxCount));
      }
      const user = String(walletAddress || '').trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(user)) return 0;
      try {
        const res = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'userFills', user: user }),
        });
        if (!res.ok) return 0;
        const data = await res.json();
        return Array.isArray(data) ? data.length : 0;
      } catch (err) {
        return 0;
      }
    }



    async function refreshRoleEligibility() {
      const addr = connectedWalletAddress || '';
      hlWalletTxCount = await fetchHlWalletTxCount(addr);
      roleEligibility = checkRoleEligibility({
        walletAddress: addr,
        txCount: hlWalletTxCount,
        accountEquityUsd: resolveAccountEquityUsd(),
      });
      syncTradeModeButtonsFromEligibility();
      if (tradeMode !== 'SHIELD' && roleEligibility.allowedModes.indexOf(tradeMode) < 0) {
        tradeMode = 'SHIELD';
        syncTradeModeButtonsFromEligibility();
        refreshAutoGuardBanner();
      }
      return roleEligibility;
    }

    function syncTradeModeButtonsFromEligibility() {
      const map = {
        SHIELD: 'modeBtnShield',
        TACTICAL: 'modeBtnTactical',
        FLASH: 'modeBtnFlash',
      };
      Object.keys(map).forEach(function(k) {
        const el = document.getElementById(map[k]);
        if (!el) return;
        const allowed = roleEligibility.allowedModes.indexOf(k) >= 0;
        const modeMeta = STATUS_DICTIONARY.TRADE_MODES[k];
        el.classList.toggle('is-active', k === tradeMode);
        el.classList.toggle('is-locked', !allowed);
        el.disabled = !allowed;
        el.setAttribute('aria-disabled', allowed ? 'false' : 'true');
        const tip = !allowed && roleEligibility.reasons[k]
          ? roleEligibility.reasons[k]
          : (modeMeta && modeMeta.desc) || '';
        const label = (modeMeta && modeMeta.button) || k;
        applySvTip(el, tip, label);
      });
    }

    function formatBestHedgePairLabel(symbol) {
      const raw = String(symbol || '').trim().toUpperCase();
      if (!raw || raw === '---') return '--- / USDC';
      const cleaned = raw
        .replace(/[-_/]?USDC$/i, '')
        .replace(/[-_/]?USD$/i, '')
        .replace(/^XYZ:/i, '')
        .trim();
      const base = cleaned || raw;
      return base + ' / USDC';
    }

    function setTradeMode(mode) {
      const m = String(mode || '').toUpperCase();
      let next = 'SHIELD';
      if (m === 'TACTICAL' || m === 'INTERMEDIATE') next = 'TACTICAL';
      else if (m === 'FLASH' || m === 'EXPERT') next = 'FLASH';

      if (roleEligibility.allowedModes.indexOf(next) < 0) {
        const tip = roleEligibility.reasons[next] || ('Requires HL TXs to unlock ' + next);
        pushExecLog('[MODE] Blocked ' + next + ' \xB7 ' + tip, 'warn');
        syncTradeModeButtonsFromEligibility();
        return;
      }

      tradeMode = next;
      if (tradeMode === 'FLASH') {
        const locks = assertFlashHardLocksLocal();
        pushExecLog(
          '[MODE] \u26A1 Flash \xB7 survey bypass \xB7 Root 1 Max SL $' + locks.maxLossUSD.toFixed(0) +
          ' + Root 8 Slippage \u2264 ' + (locks.maxSlippage * 100).toFixed(1) + '% WELDED',
          'ok'
        );
        if (typeof renderRootTelemetry === 'function') renderRootTelemetry();
        if (typeof refreshGatekeeperDefenseMatrix === 'function') refreshGatekeeperDefenseMatrix();
      } else if (tradeMode === 'TACTICAL') {
        pushExecLog('[MODE] \u2694\uFE0F Tactical \xB7 balanced defense \xB7 Dynamic Max SL $' +
          resolveEffectiveMaxSlUsd().toFixed(0) + ' retained', 'ok');
      } else {
        pushExecLog('[MODE] Shield \xB7 full automated safety pipeline armed', 'ok');
      }
      syncTradeModeButtonsFromEligibility();
      refreshAutoGuardBanner();
    }

    function onModeGateChange() {
      refreshAutoGuardBanner();
    }

    function syncExpertVixMirror() {
      // retained no-op \u2014 Flash mode status lives in auto-guard banner
    }

    function formatTzClock(now, timeZone) {
      try {
        return new Intl.DateTimeFormat('en-GB', {
          timeZone: timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);
      } catch (e) {
        return '--:--:--';
      }
    }

    function getTzHour(now, timeZone) {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: timeZone,
          hour: '2-digit',
          hour12: false,
        }).formatToParts(now);
        return parseInt(parts.find(function(p) { return p.type === 'hour'; }).value, 10);
      } catch (e) {
        return -1;
      }
    }



    function toggleHeaderMenu() {
      const drawer = document.getElementById('headerSecondaryActions');
      const btn = document.getElementById('headerMenuToggle');
      if (!drawer) return;
      const open = !drawer.classList.contains('is-open');
      drawer.classList.toggle('is-open', open);
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function closeHeaderMenu() {
      const drawer = document.getElementById('headerSecondaryActions');
      const btn = document.getElementById('headerMenuToggle');
      if (drawer) drawer.classList.remove('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    document.addEventListener('click', function(e) {
      const wrap = document.querySelector('.header-actions-right');
      if (!wrap || wrap.contains(e.target)) return;
      closeHeaderMenu();
    });

    function sumLivePnlUsd() {
      let sum = 0;
      for (let i = 0; i < openPositions.length; i++) {
        const n = parseFloat(openPositions[i].pnlUsd);
        if (Number.isFinite(n)) sum += n;
      }
      return sum;
    }

    function formatSignedUsd(n) {
      const v = Number.isFinite(n) ? n : 0;
      const sign = v >= 0 ? '+' : '-';
      return sign + '$' + Math.abs(v).toFixed(2);
    }

    function resolveVaultEquityUsd() {
      if (Number.isFinite(withdrawableCollateralUsd) && withdrawableCollateralUsd > 0) {
        return withdrawableCollateralUsd;
      }
      return 25000;
    }

    function syncHeaderVault() {
      const posCount = openPositions.length;
      const livePnl = sumLivePnlUsd();
      const equity = resolveVaultEquityUsd();
      const vaultOpen = document.getElementById('vaultOpenPositions');
      const vaultPnl = document.getElementById('vaultSettledPnl');
      if (vaultOpen) vaultOpen.textContent = String(posCount);
      if (vaultPnl) vaultPnl.textContent = '$' + settledPnlUsd.toFixed(2);

      const stepPos = document.getElementById('step3VaultPos');
      const stepEquity = document.getElementById('step3VaultEquity');
      const stepLive = document.getElementById('step3VaultLivePnl');
      const stepEmoji = document.getElementById('step3VaultPnlEmoji');
      if (stepPos) stepPos.textContent = String(posCount);
      if (stepEquity) stepEquity.textContent = equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (stepLive) {
        stepLive.textContent = formatSignedUsd(livePnl);
        stepLive.className = 'step3-vault-pnl font-bold ' + (livePnl >= 0 ? 'is-pos text-emerald-400' : 'is-neg text-rose-400');
      }
      if (stepEmoji) stepEmoji.textContent = livePnl >= 0 ? '\u{1F7E2}' : '\u{1F534}';

      const capitalInput = document.getElementById('capitalInput');
      if (capitalInput) capitalInput.max = String(equity);

      // CAPITAL ceiling tracks live vault \u2014 clamp + refresh soil / MAX SL weld
      if (capitalUsd > equity) {
        applyCapitalUsd(equity, { forceInput: true, sanitize: true });
      } else {
        refreshCapitalPresetsFromVault();
        updateMasterConsoleSlippage();
      }
    }

    function emergencyCloseAllPositions() {
      if (!openPositions.length) {
        addLog('[EMERGENCY] No open positions to close', 'warn');
        pushExecLog('[EMERGENCY] CLOSE ALL \u2014 no open positions', 'warn');
        return;
      }
      const count = openPositions.length;
      let realized = 0;
      while (openPositions.length) {
        const pos = openPositions.pop();
        // Instant mock exit \u2014 lock current mark PnL into settled
        realized += pos.pnlUsd;
        settledPnlUsd += pos.pnlUsd;
      }
      const reviewLog = storePostTradeReview('Emergency Exit');
      showPostTradeReviewToast(reviewLog);
      pushExecLog('[EMERGENCY] CLOSE ALL \xB7 ' + count + ' pos \xB7 realized ' + formatSignedUsd(realized) + ' \xB7 Root 19-20 ACTIVE', 'warn');
      addLog('[EMERGENCY] Closed all ' + count + ' positions \xB7 ' + formatSignedUsd(realized), 'warn');
      const vaultLast = document.getElementById('vaultLastAttack');
      if (vaultLast) vaultLast.innerText = 'EMERGENCY EXIT \xB7 ' + count + ' pos';
      renderActivePositions();
      updateMasterConsoleSlippage();
    }

    function quickSnipeHotToken() {
      closeHeaderMenu();
      const spot = cachedSpotlight || {};
      const symbol = spot.key || spot.hlSymbol || 'CASHCAT';
      const asset = {
        markPrice: spot.markPrice,
        change24h_pct: spot.change24h_pct,
        openInterestNotionalUsd: spot.openInterestNotionalUsd || 5e6,
        fundingRateHourly: spot.fundingRateHourly || ((spot.fundingRate8h_pct || 0) / 800),
        fundingRate8h_pct: spot.fundingRate8h_pct,
        displayName: spot.displayName || String(symbol).toUpperCase(),
        hlSymbol: spot.hlSymbol || String(symbol).toUpperCase(),
      };
      injectTokenToMasterConsole(symbol, asset);
      // Prefer Pre-IPO filter in Step 2 for handoff clarity
      if (typeof setMatrixCategoryFilter === 'function') {
        try { setMatrixCategoryFilter('PREIPO'); } catch (e) { /* ignore */ }
      }
      const step3 = document.getElementById('sniperExecutionShield');
      const step2 = document.getElementById('tokenTableSection');
      if (step3 && step3.scrollIntoView) {
        step3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (step2 && step2.scrollIntoView) {
        step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      addLog('[PRE-LAUNCH SNIPE] ' + (spot.pair || symbol) + ' injected into Step 2/3', 'success');
      pushExecLog('[PRE-LAUNCH SNIPE] ' + (spot.pair || symbol) + ' locked into Sniper console', 'ok');
    }

    function lockBestHedgeToStep3() {
      if (!cachedBestHedgeRow || !cachedBestHedgeRow.b1_symbol) {
        addLog('[BEST HEDGE] No eligible Rule A hedge yet', 'warn');
        return;
      }
      const row = cachedBestHedgeRow;
      const asset = assetFromMatrixRow(row);
      injectTokenToMasterConsole(row.b1_symbol, asset);
      const step3 = document.getElementById('sniperExecutionShield');
      if (step3 && step3.scrollIntoView) {
        step3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      addLog('[BEST HEDGE] Locked ' + row.b1_symbol + ' @ ' + (row.i1_annual_cross || 0).toFixed(2) +
        '% APR \xB7 Dynamic Max SL $' + resolveEffectiveMaxSlUsd().toFixed(0) + ' weld', 'success');
      pushExecLog('[BEST HEDGE] ' + row.b1_symbol + ' injected \xB7 Dyn-SL $' +
        resolveEffectiveMaxSlUsd().toFixed(0) + ' MAX LOSS armed', 'ok');
    }

    function resolveActiveSessionName(now) {
      const hktHour = getHktHour(now);
      const londonHour = getTzHour(now, 'Europe/London');
      const nyHour = getTzHour(now, 'America/New_York');
      if (hktHour >= 9 && hktHour < 18) return 'TOKYO';
      if (londonHour >= 8 && londonHour < 17) return 'LONDON';
      if (nyHour >= 9 && nyHour < 17) return 'NEW YORK';
      return 'OFF-HOURS';
    }

    function isAsiaSessionOpen(now) {
      const h = getHktHour(now);
      return h >= 9 && h < 18;
    }

    function isEuropeSessionOpen(now) {
      const h = getTzHour(now, 'Europe/London');
      return h >= 8 && h < 17;
    }

    function isUsSessionOpen(now) {
      const h = getTzHour(now, 'America/New_York');
      return h >= 9 && h < 17;
    }

    function setSessionStateEl(el, isOpen) {
      if (!el) return;
      el.textContent = isOpen ? 'OPEN' : 'CLOSED';
      el.className = 'mhb-session-state ' + (isOpen ? 'is-open' : 'is-closed');
    }

    function formatSettledMinutes(secsLeft) {
      if (settlementLockdownDemoActive || secsLeft < SETTLEMENT_LOCKDOWN_SEC) {
        return 'LOCKDOWN';
      }
      const total = Math.max(0, Math.floor(secsLeft));
      const mins = Math.floor(total / 60);
      const secs = total % 60;
      return String(mins).padStart(2, '0') + 'm ' + String(secs).padStart(2, '0') + 's';
    }

    function sparklinePoints(changePct) {
      const down = !(Number.isFinite(changePct) && changePct >= 0);
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const x = 2 + i * (92 / 9);
        const t = i / 9;
        const y = down
          ? (6 + t * 18 + Math.sin(t * 6) * 1.5)
          : (22 - t * 18 + Math.sin(t * 6) * 1.5);
        pts.push(x.toFixed(1) + ',' + y.toFixed(1));
      }
      return pts.join(' ');
    }

    function pickPreLaunchSpotlight(enrichment) {
      const bucket = (enrichment && enrichment.preipo) || {};
      const keys = Object.keys(bucket);
      let bestKey = null;
      let bestAsset = null;
      let bestScore = -1;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const asset = bucket[key];
        if (!asset || !(parseFloat(asset.markPrice) > 0)) continue;
        const label = String(asset.hlSymbol || asset.displayName || key).toUpperCase();
        const chg = Math.abs(parseFloat(asset.change24h_pct) || 0);
        const fr = Math.abs(parseFloat(asset.fundingRate8h_pct) || 0);
        const prefer = /CASHCAT|PRE.?LAUNCH|FLAUNCH/i.test(label) || /cashcat/i.test(key) ? 1000 : 0;
        const score = prefer + chg + fr * 10;
        if (score > bestScore) {
          bestScore = score;
          bestKey = key;
          bestAsset = asset;
        }
      }
      if (bestAsset && bestKey) {
        const sym = String(bestAsset.hlSymbol || bestAsset.displayName || bestKey).toUpperCase().replace(/-USDC$/i, '');
        return {
          key: bestKey,
          pair: sym + '-USDC',
          markPrice: parseFloat(bestAsset.markPrice) || 0,
          change24h_pct: parseFloat(bestAsset.change24h_pct),
          fundingRate8h_pct: parseFloat(bestAsset.fundingRate8h_pct),
          fundingRateHourly: parseFloat(bestAsset.fundingRateHourly) || ((parseFloat(bestAsset.fundingRate8h_pct) || 0) / 800),
          openInterestNotionalUsd: parseFloat(bestAsset.openInterestNotionalUsd) || 5e6,
          displayName: sym,
          hlSymbol: sym,
        };
      }
      return cachedSpotlight;
    }

    function renderPreLaunchSpotlight(enrichment) {
      const spot = pickPreLaunchSpotlight(enrichment);
      cachedSpotlight = spot;
      const symEl = document.getElementById('hotTokenSymbol');
      const pxEl = document.getElementById('hotTokenPrice');
      const chgEl = document.getElementById('hotTokenChg');
      const frEl = document.getElementById('hotTokenFr');
      const lineEl = document.getElementById('hotTokenSparkLine');
      const fillEl = document.getElementById('hotTokenSparkFill');
      if (symEl) symEl.textContent = spot.pair || '---';
      if (pxEl) {
        const px = parseFloat(spot.markPrice);
        pxEl.textContent = Number.isFinite(px)
          ? ('$' + px.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }))
          : '\u2014';
      }
      const chg = parseFloat(spot.change24h_pct);
      if (chgEl) {
        if (Number.isFinite(chg)) {
          const sign = chg > 0 ? '+' : '';
          chgEl.textContent = sign + chg.toFixed(2) + '%';
          chgEl.className = 'hot-chg' + (chg < 0 ? ' is-neg' : '');
        } else {
          chgEl.textContent = '\u2014';
          chgEl.className = 'hot-chg';
        }
      }
      const fr = parseFloat(spot.fundingRate8h_pct);
      if (frEl) {
        frEl.textContent = Number.isFinite(fr)
          ? ('8H FR: ' + (fr >= 0 ? '' : '') + fr.toFixed(4) + '%')
          : '8H FR: \u2014';
      }
      const pts = sparklinePoints(chg);
      const stroke = Number.isFinite(chg) && chg < 0 ? '#f87171' : '#45C4B4';
      const fill = Number.isFinite(chg) && chg < 0 ? 'rgba(248,113,113,0.18)' : 'rgba(52,211,153,0.18)';
      if (lineEl) {
        lineEl.setAttribute('points', pts);
        lineEl.setAttribute('stroke', stroke);
      }
      if (fillEl) {
        fillEl.setAttribute('points', pts + ' 94,28 2,28');
        fillEl.setAttribute('fill', fill);
      }
    }

    function refreshBannerHeatStatus() {
      const heatLamp = document.getElementById('gkHeatLamp');
      const heatPanel = document.getElementById('liveVolHeatPanel');
      const state = lastHeatState || 'safe';
      const heat = STATUS_DICTIONARY.VOLATILITY_HEAT;
      const hb = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT;
      const flashMode = tradeMode === 'FLASH';

      if (heatLamp && flashMode) {
        const flash = STATUS_DICTIONARY.TRADE_MODES.FLASH;
        heatLamp.className = 'banner-heat-status is-flash sv-tip';
        heatLamp.textContent = '\u26A1 ' + flash.lamp;
        applySvTip(heatLamp, flash.desc, flash.lamp);
        heatLamp.style.color = '#A5B4FC';
      } else {
        let entry = heat.SAFE;
        let hbEntry = hb.SAFE;
        let prefix = '\u{1F7E2} ';
        if (state === 'extreme') {
          entry = heat.DANGER;
          hbEntry = hb.LOCKED;
          prefix = '\u{1F534} ';
        } else if (state === 'elevated') {
          entry = heat.ELEVATED;
          hbEntry = hb.ELEVATED;
          prefix = '\u{1F7E1} ';
        }
        if (heatLamp) {
          heatLamp.className = 'banner-heat-status is-' + state + ' sv-tip';
          heatLamp.textContent = prefix + hbEntry.label;
          applySvTip(heatLamp, entry.desc, entry.label);
          heatLamp.style.color = hbEntry.color;
        }
      }
      if (heatPanel) {
        const tipEntry = state === 'extreme' ? heat.DANGER : state === 'elevated' ? heat.ELEVATED : heat.SAFE;
        applySvTip(heatPanel, tipEntry.desc, 'Live Volatility Heat \xB7 ' + tipEntry.label);
      }
    }



    let rootTelemetryRendering = false;


    function renderActivePositions() {
      const body = document.getElementById('activePositionsBody');
      if (!body) return;
      if (!openPositions.length) {
        body.innerHTML = '<tr id="activePositionsEmpty"><td colspan="5" class="text-gray-500">No open positions</td></tr>';
        syncHeaderVault();
        return;
      }
      body.innerHTML = openPositions.map(function(p) {
        const pnlClass = p.pnlUsd >= 0 ? 'text-emerald-300' : 'text-rose-300';
        return '<tr data-pos-id="' + p.id + '">' +
          '<td class="typo-num">' + p.symbol + '</td>' +
          '<td class="typo-num">$' + p.sizeUsd.toLocaleString() + '</td>' +
          '<td class="typo-num">' + p.dynSlPct.toFixed(2) + '%</td>' +
          '<td class="typo-num ' + pnlClass + '">$' + p.pnlUsd.toFixed(2) + '</td>' +
          '<td><button type="button" class="quick-close-btn" onclick="closePosition(' + p.id + ')">CLOSE POSITION</button></td>' +
        '</tr>';
      }).join('');
      syncHeaderVault();
    }

    function storePostTradeReview(kind) {
      const entry = {
        kind: kind,
        at: new Date().toISOString(),
        log: 'Review: [ ' + kind + ' ]',
      };
      try {
        const raw = localStorage.getItem(POST_TRADE_REVIEW_KV_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const arr = Array.isArray(list) ? list : [];
        arr.push(entry);
        while (arr.length > 50) arr.shift();
        localStorage.setItem(POST_TRADE_REVIEW_KV_KEY, JSON.stringify(arr));
      } catch (e) { /* private mode */ }
      return entry.log;
    }

    function showPostTradeReviewToast(text) {
      const existing = document.getElementById('postTradeReviewToast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'postTradeReviewToast';
      toast.className = 'post-trade-review-toast';
      toast.textContent = text;
      document.body.appendChild(toast);
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 3000);
    }

    function closePosition(posId) {
      const idx = openPositions.findIndex(function(p) { return p.id === posId; });
      if (idx < 0) return;
      const pos = openPositions[idx];
      // Demo exit classifier: small random TP/SL, else Manual Exit
      const roll = Math.random();
      let kind = 'Manual Exit';
      if (roll < 0.25) { kind = 'Hit TP'; pos.pnlUsd = Math.abs(pos.pnlUsd) + 12; }
      else if (roll < 0.4) {
        kind = 'Hit SL';
        const maxSl = resolveEffectiveMaxSlUsd();
        pos.pnlUsd = -Math.min(maxSl, Math.abs(pos.pnlUsd) + 18);
        root17DailyState = recordRoot17SlTrip(root17DailyState, Math.abs(pos.pnlUsd));
        refreshCriAndStatusHud();
      }
      settledPnlUsd += pos.pnlUsd;
      openPositions.splice(idx, 1);
      const reviewLog = storePostTradeReview(kind);
      showPostTradeReviewToast(reviewLog);
      pushExecLog('[STEP 4] ' + reviewLog + ' \xB7 ' + pos.symbol + ' \xB7 Root 19-20 closure ACTIVE', 'ok');
      addLog('[STEP 4] ' + reviewLog + ' \xB7 closed ' + pos.symbol, 'success');
      const vaultLast = document.getElementById('vaultLastAttack');
      if (vaultLast) vaultLast.innerText = 'CLOSED ' + pos.symbol + ' \xB7 ' + kind;
      renderActivePositions();
      updateMasterConsoleSlippage();
    }

    function connectWallet() {
      const backdrop = document.getElementById('walletModalBackdrop');
      if (backdrop) backdrop.classList.remove('hidden');
    }

    function closeWalletModal(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      const backdrop = document.getElementById('walletModalBackdrop');
      if (backdrop) backdrop.classList.add('hidden');
    }

    function shortenAddress(addr) {
      const a = String(addr || '');
      if (a.length < 10) return a;
      return a.slice(0, 6) + '\u2026' + a.slice(-4);
    }

    async function mockConnectWallet(providerName) {
      const statusEl = document.getElementById('walletModalStatus');
      const btn = document.getElementById('connectWalletBtn');
      const label = document.getElementById('connectWalletLabel');
      if (statusEl) statusEl.textContent = 'Connecting via ' + providerName + '\u2026';

      try {
        if (providerName === 'MetaMask' && window.ethereum && window.ethereum.request) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts[0]) {
            connectedWalletAddress = accounts[0];
          }
        }
      } catch (err) {
        if (statusEl) statusEl.textContent = 'Provider denied \u2014 falling back to mock session.';
      }

      if (!connectedWalletAddress) {
        connectedWalletAddress = '0x' + Array.from({ length: 40 }, function() {
          return Math.floor(Math.random() * 16).toString(16);
        }).join('');
      }

      if (btn) btn.classList.add('connected');
      if (label) label.textContent = shortenAddress(connectedWalletAddress);
      // Mock withdrawable collateral for Margin Guard
      withdrawableCollateralUsd = 25000;
      const marginReadout = document.getElementById('walletMarginReadout');
      if (marginReadout) {
        marginReadout.textContent = 'Withdrawable: $' + withdrawableCollateralUsd.toLocaleString();
        marginReadout.className = 'typo-context text-emerald-300 mt-1';
      }
      if (statusEl) statusEl.textContent = 'Connected \xB7 ' + providerName + ' \xB7 ' + shortenAddress(connectedWalletAddress);
      addLog('[WALLET] Connected via ' + providerName + ': ' + shortenAddress(connectedWalletAddress) + ' \xB7 collateral $' + withdrawableCollateralUsd.toLocaleString(), 'success');
      pushExecLog('[WALLET] Margin Guard armed \xB7 withdrawable $' + withdrawableCollateralUsd.toLocaleString(), 'ok');
      syncHeaderVault();
      applyCapitalUsd(resolveVaultEquityUsd(), { forceInput: true, sanitize: true });
      updateMasterConsoleSlippage();
      refreshRoleEligibility().then(function(elig) {
        pushExecLog('[ROLE] HL TXs=' + elig.txCount + ' \xB7 max mode ' + elig.maxMode, 'ok');
      });
      setTimeout(function() {
        const backdrop = document.getElementById('walletModalBackdrop');
        if (backdrop) backdrop.classList.add('hidden');
      }, 500);
    }

    const GATEKEEPER_AUTH_KEY = __SV_GATEKEEPER_AUTH_KEY__;

    function isValidWalletRef(ref) {
      if (typeof ref !== 'string') return false;
      const value = ref.trim();
      if (!value) return false;
      const lower = value.toLowerCase();
      const whitelist = __SV_GATEKEEPER_WHITELIST__;
      for (let i = 0; i < whitelist.length; i++) {
        if (String(whitelist[i]).toLowerCase() === lower) return true;
      }
      return /^0x[a-fA-F0-9]{40}$/.test(value);
    }

    function readGatekeeperAuth() {
      try {
        return localStorage.getItem(GATEKEEPER_AUTH_KEY);
      } catch (e) {
        return null;
      }
    }

    function writeGatekeeperAuth(value) {
      try {
        localStorage.setItem(GATEKEEPER_AUTH_KEY, value);
      } catch (e) { /* private mode / quota */ }
    }

    function runGatekeeper() {
      const params = new URLSearchParams(window.location.search || '');
      let ref = params.get('ref');
      if (!isValidWalletRef(ref)) {
        const stored = readGatekeeperAuth();
        if (isValidWalletRef(stored)) {
          ref = String(stored).trim();
          window.location.search = '?ref=' + encodeURIComponent(ref);
          return false;
        }
      }
      if (isValidWalletRef(ref)) {
        writeGatekeeperAuth(String(ref).trim());
        return true;
      }
      document.body.innerHTML =
        '<div class="gatekeeper-screen">' +
          '<div class="gatekeeper-card font-mono">' +
            brandShieldImg('brand-shield-icon-xl', 40) +
            '<h1 style="color:#50D2C1;font-weight:900;font-size:1.15rem;letter-spacing:0.04em;margin-bottom:0.75rem;">SILVERVINE LABS | PRIVATE BETA ACCESS</h1>' +
            '<p style="color:#e8fff0;font-weight:800;font-size:0.95rem;line-height:1.5;">Internal quant risk-control beta terminal. Enter your authorized Pass to continue.</p>' +
            '<p style="color:#9ca3af;font-size:0.75rem;margin-top:0.75rem;line-height:1.5;">Whitelist Pass / Wallet Ref Example: <code style="color:#50D2C1;">0x...</code> (40-char hex address)</p>' +
            '<form class="gate-form" id="gateForm" autocomplete="off" style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1.25rem;text-align:left;">' +
              '<label for="gatePassInput" style="font-size:0.75rem;font-weight:800;color:#9ca3af;">Pass Key / Wallet Address</label>' +
              '<input id="gatePassInput" type="password" name="ref" placeholder="Enter Pass Key or 0x Wallet Address..." spellcheck="false" autocapitalize="off" autocomplete="off" required style="width:100%;box-sizing:border-box;padding:0.85rem 1rem;border-radius:0.75rem;border:2px solid rgba(80,210,193,0.45);background:rgba(0,0,0,0.45);color:#e8fff0;font-family:inherit;font-size:0.9rem;font-weight:700;outline:none;" />' +
              '<p id="gateError" role="alert" style="display:none;margin:0;color:#f87171;font-size:0.75rem;font-weight:800;">Invalid Pass or wallet address. Enter a whitelist pass or valid 0x wallet.</p>' +
              '<button type="submit" style="display:inline-flex;align-items:center;justify-content:center;width:100%;box-sizing:border-box;padding:0.85rem 1.25rem;border-radius:0.75rem;border:2px solid #50D2C1;background:#50D2C1;color:#051311;font-weight:900;font-size:0.9rem;font-family:inherit;cursor:pointer;box-shadow:0 0 24px rgba(80,210,193,0.35);">[ \u{1F513} UNLOCK TRADING TERMINAL ]</button>' +
            '</form>' +
          '</div>' +
        '</div>';
      (function bindInlineGate() {
        var form = document.getElementById('gateForm');
        var input = document.getElementById('gatePassInput');
        var errorEl = document.getElementById('gateError');
        if (!form || !input) return;
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          var value = String(input.value || '').trim();
          if (!isValidWalletRef(value)) {
            if (errorEl) errorEl.style.display = 'block';
            input.focus();
            return;
          }
          writeGatekeeperAuth(value);
          window.location.search = '?ref=' + encodeURIComponent(value);
        });
      })();
      return false;
    }

    function applyCountdownLockdown(wrapEl, countEl, secsLeft) {
      if (!wrapEl || !countEl) return;
      const locked = settlementLockdownDemoActive || secsLeft < SETTLEMENT_LOCKDOWN_SEC;
      if (locked) {
        countEl.innerText = 'LOCKDOWN';
        countEl.className = 'countdown-lockdown';
        wrapEl.className = 'mhb-hl settlement-active';
        wrapEl.style.color = '';
      } else {
        countEl.innerText = formatSettledMinutes(secsLeft);
        wrapEl.style.color = '';
        wrapEl.className = 'mhb-hl';
        countEl.className = '';
      }
    }

    function updateClocks() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const dateStr = "" + now.getFullYear() + "/" + pad(now.getMonth() + 1) + "/" + pad(now.getDate());
      const timeStrLong = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
      const clockEl = document.getElementById('topClock');
      if (clockEl) clockEl.innerText = "\u{1F552} HKT: " + dateStr + " " + timeStrLong;

      const secsLeft = secondsToNextHour(now);
      settlementLockdownActive = secsLeft < SETTLEMENT_LOCKDOWN_SEC || settlementLockdownDemoActive;
      const hktHour = getHktHour(now);
      tsunamiShieldActive = hktHour >= 21 && hktHour < 23;
      const usSessionOpen = isUsSessionOpen(now);

      const tsunamiLamp = document.getElementById('tsunamiShieldLamp');
      if (tsunamiLamp) {
        if (tsunamiShieldActive) {
          tsunamiLamp.classList.remove('hidden');
        } else {
          tsunamiLamp.classList.add('hidden');
        }
      }
      applySettlementLockdownDemoUI();

      const hlWrap = document.getElementById('hlCountdownWrap');
      const hlCount = document.getElementById('hlCountdown');
      if (hlWrap) {
        if (settlementLockdownDemoActive || secsLeft < SETTLEMENT_LOCKDOWN_SEC) {
          hlWrap.className = 'mhb-hl settlement-active';
          if (hlCount) {
            hlCount.textContent = 'LOCKDOWN';
            hlCount.className = 'countdown-lockdown';
          } else {
            const R10 = STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI;
            hlWrap.innerHTML =
              '<span id="root10TsunamiTag" class="root-tag sv-tip" data-sv-tip="' + escapeTooltipHtml(R10.desc) + '" data-sv-label="' + escapeTooltipHtml(R10.label) + '">' + escapeTooltipHtml(R10.label) + '</span>' +
              '<span class="mhb-hl-text">HL Settled: <span id="hlCountdown" class="countdown-lockdown">LOCKDOWN</span></span>';
          }
        } else {
          hlWrap.className = 'mhb-hl';
          if (hlCount) {
            hlCount.textContent = formatSettledMinutes(secsLeft);
            hlCount.className = '';
          } else {
            const R10 = STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI;
            hlWrap.innerHTML =
              '<span id="root10TsunamiTag" class="root-tag sv-tip" data-sv-tip="' + escapeTooltipHtml(R10.desc) + '" data-sv-label="' + escapeTooltipHtml(R10.label) + '">' + escapeTooltipHtml(R10.label) + '</span>' +
              '<span class="mhb-hl-text">HL Settled: <span id="hlCountdown">' + formatSettledMinutes(secsLeft) + '</span></span>';
          }
        }
      }

      const sessionLabel = document.getElementById('heartbeatSessionLabel');
      if (sessionLabel && !shieldDemoRedAlertActive) {
        sessionLabel.textContent = 'Session: ' + resolveActiveSessionName(now);
      }

      const root10 = document.getElementById('root10VolWindow');
      if (root10) {
        const showRoot10 = tsunamiShieldActive || usSessionOpen || shieldDemoRedAlertActive;
        root10.classList.toggle('hidden', !showRoot10);
        root10.classList.toggle('is-active', showRoot10);
        if (showRoot10) {
          root10.textContent = '[ HKT 21-23 Window - HIGH VOLATILITY ]';
          applySvTip(root10, STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.desc, '[ HKT 21-23 Window - HIGH VOLATILITY ]');
        }
      }

      updateUsMacroCountdowns(now);
      updateRootSlipProtectionStatus();
      refreshGatekeeperDefenseMatrix();

      const asiaClock = document.getElementById('sessionAsiaClock');
      const euClock = document.getElementById('sessionEuropeClock');
      const usClock = document.getElementById('sessionUSClock');
      if (asiaClock) asiaClock.textContent = formatTzClock(now, 'Asia/Hong_Kong');
      if (euClock) euClock.textContent = formatTzClock(now, 'Europe/London');
      if (usClock) usClock.textContent = formatTzClock(now, 'America/New_York');
      setSessionStateEl(document.getElementById('sessionAsia'), isAsiaSessionOpen(now));
      setSessionStateEl(document.getElementById('sessionEurope'), isEuropeSessionOpen(now));
      setSessionStateEl(document.getElementById('sessionUS'), usSessionOpen);

      refreshAutoGuardBanner();
    }

    function addLog(msg, type="info") {
      const consoleBox = document.getElementById('consoleOutput');
      const friendly = humanizeConsoleMessage(msg);
      if (!friendly) return;
      appendStep1CondensedLog(friendly, type === 'success' ? 'ok' : type);
      if (!consoleBox) return;
      const time = new Date().toLocaleTimeString();
      let color = "text-gray-300";
      if (type === "success") color = "text-emerald-400";
      if (type === "error") color = "text-rose-400";
      if (type === "warn") color = "text-amber-400";

      const line = document.createElement('div');
      line.className = color;
      line.textContent = "[" + time + "] " + friendly;
      consoleBox.appendChild(line);
      // Cap DOM nodes to avoid memory death on long sessions
      while (consoleBox.childNodes.length > 200) {
        consoleBox.removeChild(consoleBox.firstChild);
      }
      consoleBox.scrollTop = consoleBox.scrollHeight;
    }

    function clearLogs() {
      const consoleBox = document.getElementById('consoleOutput');
      if (consoleBox) consoleBox.innerHTML = '<div class="text-emerald-400">[SYSTEM] Santenboku log cleared.</div>';
    }

    function fundingRiskTag(rate8hPct, side) {
      if (side === 'pos') {
        if (rate8hPct >= 0.15) return { cls: 'funding-tag funding-tag-bleed', label: '[ \u26A0\uFE0F LONG BLEED ]' };
        if (rate8hPct >= 0.05) return { cls: 'funding-tag funding-tag-arb', label: '[ \u26A1 BASIS ARB ]' };
        return { cls: 'funding-tag funding-tag-ok', label: '[ \u{1F7E2} FUNDING HEALTHY ]' };
      }
      if (rate8hPct <= -0.15) return { cls: 'funding-tag funding-tag-short', label: '[ \u{1F680} SHORT SQUEEZE ALERT ]' };
      if (rate8hPct <= -0.05) return { cls: 'funding-tag funding-tag-arb', label: '[ \u26A1 BASIS ARB ]' };
      return { cls: 'funding-tag funding-tag-ok', label: '[ \u{1F7E2} FUNDING HEALTHY ]' };
    }

    function renderFundingWorldTreeList(items, side) {
      if (!items || items.length === 0) {
        return '<div class="text-gray-500 text-xs">No data</div>';
      }
      return items.map(function(item, idx) {
        const sign = item.rate8h_pct >= 0 ? '+' : '';
        const rate = sign + item.rate8h_pct.toFixed(4) + '%';
        const url = 'https://app.hyperliquid.xyz/trade/' + encodeURIComponent(item.symbol);
        const tag = fundingRiskTag(item.rate8h_pct, side);
        const linkCls = side === 'pos' ? 'funding-king-link funding-king-high' : 'funding-king-link funding-king-low';
        return '<div class="flex flex-wrap items-center gap-2">' +
          '<span class="text-[10px] text-gray-400 font-bold">#' + (idx + 1) + '</span>' +
          '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="' + linkCls + '">' +
            rate + ' ' + item.symbol +
          '</a>' +
          '<span class="' + tag.cls + '">' + tag.label + '</span>' +
        '</div>';
      }).join('');
    }

    function renderFundingRateKings(kings) {
      const el = document.getElementById('fundingRateKings');
      if (!el) return;
      if (!kings || (!kings.highest && !(kings.topPositive && kings.topPositive.length))) {
        el.innerHTML = '<span class="text-gray-500">No funding extremes \xB7 retry sync</span>';
        return;
      }
      const pos = (kings.topPositive && kings.topPositive.length)
        ? kings.topPositive
        : (kings.highest ? [kings.highest] : []);
      const neg = (kings.topNegative && kings.topNegative.length)
        ? kings.topNegative
        : (kings.lowest ? [kings.lowest] : []);
      function compactKingChips(items, side) {
        return (items || []).slice(0, 3).map(function(item) {
          if (!item) return '';
          const sym = String(item.symbol || item.b1_symbol || '\u2014');
          const rateVal = Number(item.rate8h_pct);
          const sign = Number.isFinite(rateVal) && rateVal >= 0 ? '+' : '';
          const rate = (Number.isFinite(rateVal) ? sign + rateVal.toFixed(3) : '\u2014') + '%';
          const url = 'https://app.hyperliquid.xyz/trade/' + encodeURIComponent(sym);
          const cls = side === 'pos' ? 'text-rose-300' : 'text-emerald-300';
          return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="typo-num ' + cls + ' hover:underline">' +
            sym + ' ' + rate + '</a>';
        }).filter(Boolean).join(' \xB7 ');
      }
      el.innerHTML =
        '<span class="text-rose-300/80 typo-action">LONG+</span> ' + (compactKingChips(pos, 'pos') || '--') +
        ' <span class="text-gray-600">|</span> ' +
        '<span class="text-emerald-300/80 typo-action">SHORT\u2212</span> ' + (compactKingChips(neg, 'neg') || '--');
    }



    function toggleTheme() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    }

    async function fetchData() {
      const statusEl = document.getElementById('refreshStatus');
      try {
        if (statusEl) statusEl.innerText = 'syncing...';
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        let res;
        try {
          res = await response.json();
        } catch (parseErr) {
          throw new Error('Invalid /api/data JSON');
        }

        if (res && res.success) {
          if (res.systemState && typeof applySystemState === 'function') {
            applySystemState(res.systemState);
          }
          if (Array.isArray(res.data)) {
            globalData = res.data;
          } else if (Array.isArray(res.matrix)) {
            globalData = res.matrix;
          } else if (res.data && Array.isArray(res.data.list)) {
            globalData = res.data.list;
          } else if (Array.isArray(res.list)) {
            globalData = res.list;
          } else {
            globalData = [];
          }
          cachedHlUniverse = Array.isArray(res.hl_universe) ? res.hl_universe : [];
          currentPage = 1;

          const updatedEl = document.getElementById('lastUpdated');
          if (updatedEl) {
            updatedEl.innerText = 'Last updated HKT: ' + (res.timestamp_hkt || new Date().toLocaleString());
          }

          if (res.tsunami_shield_active === true) {
            tsunamiShieldActive = true;
          }
          try {
            updateVolatilityFilters(res.vix_traditional || 16.8, res.dvol_crypto || 52.5);
          } catch (_) { /* macro filters are non-fatal */ }

          renderStep2MarketPanels(res);

          try {
            applyDefaultConsoleToken();
          } catch (_) { /* console default is optional */ }

          if (Array.isArray(res.debug_system_logs)) {
            res.debug_system_logs.forEach(function(line) {
              if (line) addLog(String(line), 'success');
            });
          }

          addLog('Data sync success. Count: ' + globalData.length + ' pairs.', 'success');
          try {
            recalculate();
          } catch (recalcErr) {
            addLog('[Step 2] Matrix recalculate failed: ' + (recalcErr && recalcErr.message ? recalcErr.message : String(recalcErr)), 'warn');
          }
          if (typeof refreshCriAndStatusHud === 'function') {
            refreshCriAndStatusHud();
          }
          if (statusEl) statusEl.innerText = 'ok \xB7 ' + globalData.length + ' pairs';
        } else {
          const apiErr = (res && res.error) ? String(res.error) : 'Unknown';
          addLog('API Error: ' + apiErr, 'error');
          if (!globalData.length) renderStep2MarketPanels({});
          if (statusEl) statusEl.innerText = 'api error';
        }
      } catch (err) {
        addLog('Network Error: ' + (err && err.message ? err.message : String(err)), 'error');
        if (!globalData.length) renderStep2MarketPanels({});
        if (statusEl) statusEl.innerText = 'network error';
      }
    }

    async function forceRefresh() {
      const now = Date.now();
      if (forceRefreshInFlight) {
        addLog('[RISK ALERT] Sync in progress \u2014 duplicate FORCE REFRESH ignored', 'warn');
        return;
      }
      if (now - lastForceRefreshAt < FORCE_REFRESH_DEBOUNCE_MS) {
        const waitMs = FORCE_REFRESH_DEBOUNCE_MS - (now - lastForceRefreshAt);
        addLog('[RISK ALERT] FORCE REFRESH debounce active (remaining ' + Math.ceil(waitMs / 100) / 10 + 's) \u2014 protecting Workers quota', 'warn');
        return;
      }
      lastForceRefreshAt = now;
      forceRefreshInFlight = true;

      const btn = document.getElementById('forceRefreshBtn');
      const overlay = document.getElementById('forceRefreshOverlay');
      const cat = document.getElementById('forceRefreshCat');
      try {
        if (btn) {
          btn.setAttribute('disabled', 'true');
          btn.classList.add('opacity-50');
        }
        if (cat) cat.classList.remove('hidden');
        if (overlay) overlay.classList.add('active');
        await fetchData();
      } finally {
        forceRefreshInFlight = false;
        if (btn) {
          // Keep button disabled for remaining debounce window
          const elapsed = Date.now() - lastForceRefreshAt;
          const remain = Math.max(0, FORCE_REFRESH_DEBOUNCE_MS - elapsed);
          setTimeout(function() {
            btn.removeAttribute('disabled');
            btn.classList.remove('opacity-50');
          }, remain);
        }
        if (cat) cat.classList.add('hidden');
        if (overlay) overlay.classList.remove('active');
      }
    }

    function hlTradeUrl(hlSymbol) {
      const raw = String(hlSymbol || '');
      const cleaned = raw.replace(/^xyz:/i, '');
      return 'https://app.hyperliquid.xyz/trade/' + encodeURIComponent(cleaned);
    }

    /** TradFi / HIP-3 assets \u2014 keep xyz: prefix for Hyperliquid trade deep-links */
    function hlTradFiTradeUrl(hlSymbol) {
      const raw = String(hlSymbol || '').trim();
      const cleaned = raw.replace(/^xyz:/i, '');
      return 'https://app.hyperliquid.xyz/trade/xyz:' + encodeURIComponent(cleaned);
    }

    function formatMarkPrice(key, price) {
      const n = parseFloat(price);
      if (!Number.isFinite(n) || n <= 0) return null;
      const k = String(key || '').toLowerCase();
      if (['gold', 'platinum', 'xyz100', 'sp500', 'us500', 'jp225', 'kr200', 'qqq', 'nvda', 'amd', 'samsung', 'skhynix', 'dram', 'sndk', 'mu'].indexOf(k) >= 0) {
        return n.toFixed(2);
      }
      if (['natgas', 'wti', 'brent', 'silver', 'copper', 'eurusd', 'gbpusd', 'usdjpy', 'usdkrw', 'dxy'].indexOf(k) >= 0) {
        return n.toFixed(4);
      }
      return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }

    function formatOiNotionalUsd(value) {
      const n = parseFloat(value);
      if (!Number.isFinite(n) || n <= 0) return '\u2014';
      if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
      if (n >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
      return '$' + n.toFixed(2);
    }

    function resolveAssetLabel(key, asset) {
      if (asset && asset.hlSymbol) {
        const sym = String(asset.hlSymbol).toUpperCase();
        if (COMMODITY_LABELS[key]) return COMMODITY_LABELS[key];
        return sym;
      }
      return COMMODITY_LABELS[key] || String(key).toUpperCase();
    }

    /**
     * Order-book soil estimator \u2014 square-root impact vs OI depth proxy.
     * Returns slippage ratios for $1K / $10K / $50K buys + SOIL tier from 10K.
     */
    function estimateSoilSlippage(asset) {
      const oiNotional = parseFloat(asset && asset.openInterestNotionalUsd);
      const absChg = Math.abs(parseFloat(asset && asset.change24h_pct) || 0);
      const depthUsd = Math.max(
        25000,
        (Number.isFinite(oiNotional) && oiNotional > 0 ? oiNotional : 5e6) * 0.015,
      );
      const volFactor = 1 + Math.min(absChg, 12) / 100;
      const impactK = 0.01;
      function slipForNotional(notional) {
        const ratio = impactK * Math.sqrt(notional / depthUsd) * volFactor;
        return Math.min(ratio, 0.05);
      }
      const slip1k = slipForNotional(1000);
      const slip10k = slipForNotional(10000);
      const slip50k = slipForNotional(50000);
      // SOLID \u22640.05% | LOOSE 0.05%\u20130.5% (core band 0.05%\u20130.2%) | DANGER >0.5%
      let tier = 'SOLID';
      if (slip10k > 0.005) tier = 'DANGER';
      else if (slip10k > 0.0005) tier = 'LOOSE';
      return { slip1k: slip1k, slip10k: slip10k, slip50k: slip50k, tier: tier, depthUsd: depthUsd };
    }

    function formatSlipPct(ratio) {
      return (ratio * 100).toFixed(2) + '%';
    }

    function soilDictEntryFromTier(tier) {
      const soil = STATUS_DICTIONARY.SOIL_RESISTANCE;
      if (tier === 'SOLID') return soil.COMPACT;
      if (tier === 'LOOSE') return soil.BALANCED;
      if (tier === 'WARNING' || tier === 'DANGER') return soil.LOOSE;
      return soil.BALANCED;
    }

    function soilBadgeClass(tier) {
      if (tier === 'DANGER') return 'soil-badge soil-danger';
      if (tier === 'WARNING') return 'soil-badge soil-warning';
      if (tier === 'LOOSE') return 'soil-badge soil-balanced';
      if (tier === 'SOLID') return 'soil-badge soil-solid';
      return 'soil-badge soil-balanced';
    }

    function soilBadgeLabel(tier) {
      const entry = soilDictEntryFromTier(tier);
      if (tier === 'DANGER') return '[ ' + entry.label + ' ] \u{1F534}';
      if (tier === 'WARNING') return '[ ' + entry.label + ' ] \u{1F7E1}';
      if (tier === 'LOOSE') return '[ ' + entry.label + ' ]';
      if (tier === 'SOLID') return '[ ' + entry.label + ' ]';
      return '[ SOIL: \u2014 ]';
    }

    function applySoilBadgeTip(badgeEl, tier) {
      if (!badgeEl) return;
      if (String(tier || '').toUpperCase() === 'DANGER') {
        const soil = STATUS_DICTIONARY.ROOT_TAGS.ROOT3_SOIL;
        applySvTip(
          badgeEl,
          soil.dangerDesc || soil.desc,
          soil.danger || '[ R3: SOIL DANGER ]'
        );
        return;
      }
      const entry = soilDictEntryFromTier(tier);
      applySvTip(badgeEl, entry.desc, entry.label);
    }

    function soilTooltipHtml(label, est) {
      return '<div class="soil-tooltip" role="tooltip">' +
        '<div class="soil-tooltip-title">\u{1F4D0} Slippage Estimator \xB7 ' + label + '</div>' +
        '<div class="soil-tooltip-row"><span>$1K Buy</span><span style="color:#50D2C1">' + formatSlipPct(est.slip1k) + '</span></div>' +
        '<div class="soil-tooltip-row"><span>$10K Buy</span><span style="color:#fbbf24">' + formatSlipPct(est.slip10k) + '</span></div>' +
        '<div class="soil-tooltip-row"><span>$50K Buy</span><span style="color:#fb923c">' + formatSlipPct(est.slip50k) + '</span></div>' +
        '<div class="soil-tooltip-row"><span>Depth Proxy</span><span style="color:#50D2C1">' + formatOiNotionalUsd(est.depthUsd) + '</span></div>' +
      '</div>';
    }

    let selectedConsoleAsset = null;
    let selectedConsoleKey = '';
    /** Alias for UI click-to-select state */
    let activeSelectedToken = '';
    let masterOrderSizeUsd = 10000;
    let consoleDefaultApplied = false;
    /** Cached best-pair APR % for live Block 01/05 slider updates (no full table rebuild) */
    let cachedBestAprPct = null;

    function assetFromMatrixRow(row) {
      if (!row) return null;
      const vol = parseFloat(row.vol_3d_avg);
      const oi = parseFloat(row.hl_oi_usd);
      return {
        markPrice: row.c1_hl_spot || row.d1_hl_perp,
        change24h_pct: 0,
        openInterestNotionalUsd: Number.isFinite(oi) && oi > 0
          ? oi
          : (Number.isFinite(vol) && vol > 0 ? vol : 5e6),
        fundingRateHourly: parseFloat(row.e1_hl_funding) || 0,
        fundingRate8h_pct: formatFunding8hPctFromHourly(row.e1_hl_funding),
        displayName: row.b1_symbol,
        hlSymbol: row.b1_symbol,
      };
    }

    function syncConsoleSelectionHighlights(key) {
      document.querySelectorAll('.world-tree-capsule.token-selected, .tradfi-asset-chip.token-selected').forEach(function(n) {
        n.classList.remove('token-selected');
      });
      const chips = document.querySelectorAll('.world-tree-capsule[data-token-key="' + key + '"], .tradfi-asset-chip[data-token-key="' + key + '"]');
      chips.forEach(function(c) { c.classList.add('token-selected'); });
      document.querySelectorAll('#matrixTableBody tr.token-row-selected').forEach(function(n) {
        n.classList.remove('token-row-selected');
      });
      const rows = document.querySelectorAll('#matrixTableBody tr[data-token-key="' + String(key).toUpperCase() + '"]');
      rows.forEach(function(r) { r.classList.add('token-row-selected'); });
      // also match lowercase tradfi keys on table if any
      const rowsLower = document.querySelectorAll('#matrixTableBody tr[data-token-key="' + String(key).toLowerCase() + '"]');
      rowsLower.forEach(function(r) { r.classList.add('token-row-selected'); });
    }

    function slipForNotionalDynamic(asset, notional) {
      const est = estimateSoilSlippage(asset);
      const depthUsd = est.depthUsd;
      const absChg = Math.abs(parseFloat(asset && asset.change24h_pct) || 0);
      const volFactor = 1 + Math.min(absChg, 12) / 100;
      const impactK = 0.01;
      return Math.min(impactK * Math.sqrt(notional / depthUsd) * volFactor, 0.05);
    }

    function tierFromSlip10k(slip10k) {
      if (slip10k > 0.005) return 'DANGER';
      if (slip10k > 0.0005) return 'LOOSE';
      return 'SOLID';
    }

    function soilTierFromOrderSize(usd) {
      // Soft tier for display \u2014 hard ATTACK lock uses dynamic Effective Max SL boundary
      const size = Number(usd) || 0;
      if (size >= 50000) return 'WARNING';
      if (size >= 15000) return 'WARNING';
      return 'LOOSE';
    }

    function injectTokenToMasterConsole(key, asset) {
      if (!asset && cachedTradFiEnrichment) {
        const cats = ['commodities', 'stocks', 'indices', 'fx', 'preipo'];
        const keyLower = String(key).toLowerCase();
        for (let i = 0; i < cats.length; i++) {
          const bucket = cachedTradFiEnrichment[cats[i]];
          if (bucket && bucket[key]) {
            asset = bucket[key];
            break;
          }
          if (bucket && bucket[keyLower]) {
            asset = bucket[keyLower];
            key = keyLower;
            break;
          }
        }
      }
      if (!asset && globalData && globalData.length) {
        const sym = String(key).toUpperCase();
        const cryptoBucket = buildCryptoAssetsFromMatrix();
        if (cryptoBucket[key] || cryptoBucket[key.toLowerCase()]) {
          asset = cryptoBucket[key] || cryptoBucket[key.toLowerCase()];
          key = key.toLowerCase();
        }
        for (let i = 0; i < globalData.length; i++) {
          if (String(globalData[i].b1_symbol).toUpperCase() === sym) {
            asset = assetFromMatrixRow(globalData[i]);
            key = sym;
            break;
          }
        }
      }
      if (!asset) {
        addLog('[CONSOLE] Token data not found: ' + key, 'warn');
        return;
      }
      selectedConsoleKey = key;
      activeSelectedToken = key;
      selectedConsoleAsset = asset;
      const labelEl = document.getElementById('consoleSelectedLabel');
      const label = resolveAssetLabel(key, asset);
      if (labelEl) {
        labelEl.className = 'inject-status-badge is-active text-slate-950';
        labelEl.innerHTML = '\u{1F3AF} <span class="font-black">[ ' + label + ' ]</span> INJECTED';
      }
      syncConsoleSelectionHighlights(key);
      const warn = document.getElementById('attackWarning');
      if (warn) warn.classList.remove('hidden');
      triggerTargetLockFeedback(label);
      refreshAutoGuardBanner();
      pushExecLog('[INJECT] Target locked: ' + label + ' \xB7 Root Defense scanning', 'ok');
      addLog('[CONSOLE] Token injected: ' + label, 'info');
    }

    function triggerTargetLockFeedback(label) {
      const panel = document.getElementById('masterRiskConsole');
      const banner = document.getElementById('targetLockedBanner');
      const rail = document.getElementById('sniperExecutionShield');
      if (panel) {
        panel.classList.remove('target-lock-pulse');
        void panel.offsetWidth;
        panel.classList.add('target-lock-pulse');
        setTimeout(function() { panel.classList.remove('target-lock-pulse'); }, 700);
      }
      if (rail) {
        rail.classList.remove('soil-stress-shake');
        void rail.offsetWidth;
        rail.classList.add('soil-stress-shake');
        setTimeout(function() { rail.classList.remove('soil-stress-shake'); }, 500);
      }
      triggerDonDonOrangeTarget();
      if (banner) {
        banner.classList.add('is-active');
        banner.innerText = '\u{1F3AF} TARGET LOCKED \xB7 ' + (label || '');
        setTimeout(function() { banner.classList.remove('is-active'); }, 2400);
      }
      if (rail && rail.scrollIntoView) {
        try { rail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
      }
    }

    function toggleDebugDrawer() {
      const drawer = document.getElementById('debugDrawer');
      const btn = document.getElementById('debugDrawerToggleBtn');
      if (!drawer) return;
      drawer.classList.toggle('is-collapsed');
      if (btn) btn.innerText = drawer.classList.contains('is-collapsed') ? 'Expand' : 'Collapse';
    }

    function showConsoleTokenPending() {
      const labelEl = document.getElementById('consoleSelectedLabel');
      if (!labelEl || selectedConsoleKey) return;
      labelEl.className = 'inject-status-badge is-pending text-slate-950';
      labelEl.innerHTML = '\u23F3 Waiting for token inject\u2026';
    }

    function resolveTokenFromUrlParam() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        const raw = params.get('token') || params.get('symbol') || params.get('asset');
        if (!raw) return null;
        return String(raw).trim();
      } catch (e) {
        return null;
      }
    }

    function lookupAssetByKey(key) {
      if (!key) return null;
      const keyLower = String(key).toLowerCase();
      const keyUpper = String(key).toUpperCase();
      if (cachedTradFiEnrichment) {
        const cats = ['commodities', 'stocks', 'indices', 'fx', 'preipo'];
        for (let i = 0; i < cats.length; i++) {
          const bucket = cachedTradFiEnrichment[cats[i]];
          if (!bucket) continue;
          if (bucket[key]) return { key: key, asset: bucket[key] };
          if (bucket[keyLower]) return { key: keyLower, asset: bucket[keyLower] };
          if (bucket[keyUpper]) return { key: keyUpper, asset: bucket[keyUpper] };
        }
      }
      if (typeof buildCryptoAssetsFromMatrix === 'function') {
        const cryptoBucket = buildCryptoAssetsFromMatrix();
        if (cryptoBucket[key]) return { key: key, asset: cryptoBucket[key] };
        if (cryptoBucket[keyLower]) return { key: keyLower, asset: cryptoBucket[keyLower] };
        if (cryptoBucket[keyUpper]) return { key: keyUpper, asset: cryptoBucket[keyUpper] };
      }
      if (globalData && globalData.length) {
        for (let i = 0; i < globalData.length; i++) {
          if (String(globalData[i].b1_symbol).toUpperCase() === keyUpper) {
            return { key: keyUpper, asset: assetFromMatrixRow(globalData[i]) };
          }
        }
      }
      if (cachedSpotlight && (String(cachedSpotlight.key || '').toUpperCase() === keyUpper
          || String(cachedSpotlight.hlSymbol || '').toUpperCase() === keyUpper
          || String(cachedSpotlight.displayName || '').toUpperCase() === keyUpper)) {
        return {
          key: cachedSpotlight.key || cachedSpotlight.hlSymbol || keyUpper,
          asset: {
            markPrice: cachedSpotlight.markPrice,
            change24h_pct: cachedSpotlight.change24h_pct,
            openInterestNotionalUsd: cachedSpotlight.openInterestNotionalUsd || 5e6,
            fundingRateHourly: cachedSpotlight.fundingRateHourly || ((cachedSpotlight.fundingRate8h_pct || 0) / 800),
            fundingRate8h_pct: cachedSpotlight.fundingRate8h_pct,
            displayName: cachedSpotlight.displayName || keyUpper,
            hlSymbol: cachedSpotlight.hlSymbol || keyUpper,
          },
        };
      }
      return null;
    }

    /**
     * Resolve Step 3 token dynamically from #1 APR best hedge (bestHedgeList[0]).
     * Never hardcode static symbols (QNT / CASHCAT). URL param still wins when present.
     */
    function applyDefaultConsoleToken() {
      if (selectedConsoleKey && selectedConsoleAsset) {
        consoleDefaultApplied = true;
        return;
      }

      // 1) URL ?token= / ?symbol= / ?asset=
      const urlToken = resolveTokenFromUrlParam();
      if (urlToken) {
        const found = lookupAssetByKey(urlToken);
        if (found) {
          consoleDefaultApplied = true;
          injectTokenToMasterConsole(found.key, found.asset);
          return;
        }
      }

      // 2) Top-ranked Best Hedge (#1 APR) \u2014 primary dynamic bind for Step 3
      const topHedge = (bestHedgeList && bestHedgeList[0]) || cachedBestHedgeRow;
      if (topHedge && topHedge.b1_symbol) {
        consoleDefaultApplied = true;
        injectTokenToMasterConsole(topHedge.b1_symbol, assetFromMatrixRow(topHedge));
        return;
      }

      // 3) No token yet \u2014 keep skeleton / pending state
      showConsoleTokenPending();
    }



    function openLegalModal(kind) {
      const title = document.getElementById('legalModalTitle');
      const body = document.getElementById('legalModalBody');
      const NON_CUSTODIAL =
        'SliverVine Labs provides an open-source, non-custodial risk-control execution terminal. SliverVine Labs never holds user private keys, custodial funds, or execution authority.';
      const HARD_RISK_LIMIT =
        'All trades are executed directly via decentralized venue contracts (e.g., Hyperliquid / Jupiter). While the terminal enforces a dynamic Effective Max SL circuit breaker \u2014 (Account Equity \xD7 1%) + $100 \u2014 and soil resistance checks (<code>checkSoilResistance()</code>), market slippage, orderbook gaps, and blockchain congestion remain subject to venue conditions.';
      const PRIVACY_POLICY =
        'No personal identity data is stored. On-chain telemetry and telemetry logs are processed locally or via stateless Cloudflare Workers without tracking individual users.';
      const copyByKind = {
        tc: {
          title: 'Terms of Service',
          html:
            '<p><strong>Non-Custodial Architecture</strong>' + NON_CUSTODIAL + '</p>' +
            '<p><strong>Hard Risk Limit Notice</strong>' + HARD_RISK_LIMIT + '</p>',
        },
        privacy: {
          title: 'Privacy Policy',
          html:
            '<p><strong>Privacy Policy</strong>' + PRIVACY_POLICY + '</p>' +
            '<p><strong>Non-Custodial Architecture</strong>' + NON_CUSTODIAL + '</p>',
        },
        disclaimer: {
          title: 'Risk Disclaimer',
          html:
            '<p><strong>Hard Risk Limit Notice</strong>' + HARD_RISK_LIMIT + '</p>' +
            '<p><strong>Non-Custodial Architecture</strong>' + NON_CUSTODIAL + '</p>',
        },
      };
      const selected = copyByKind[kind] || copyByKind.tc;
      if (title) title.innerText = selected.title;
      if (body) body.innerHTML = selected.html;
      setDashboardModalOpen('legalModalBackdrop', true);
    }

    function closeLegalModal(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      setDashboardModalOpen('legalModalBackdrop', false);
    }

    function openQuickTour() {
      setDashboardModalOpen('quickTourBackdrop', true);
    }

    function closeQuickTour(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      setDashboardModalOpen('quickTourBackdrop', false);
    }

    function openSopGuide() {
      setDashboardModalOpen('sopGuideBackdrop', true);
    }

    function closeSopGuide(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      setDashboardModalOpen('sopGuideBackdrop', false);
    }

    function refreshCapitalPresetsFromVault() {
      const vault = resolveVaultEquityUsd();
      document.querySelectorAll('.capital-preset-btn[data-capital]').forEach(function(btn) {
        const v = parseFloat(btn.getAttribute('data-capital'));
        const exceeds = Number.isFinite(v) && v > vault;
        btn.disabled = exceeds;
        btn.classList.toggle('is-disabled', exceeds);
        btn.title = exceeds
          ? 'Exceeds vault ($' + vault.toLocaleString() + ')'
          : 'Set CAPITAL to $' + v.toLocaleString();
      });
      syncCapitalPresetButtons();
    }

    function syncCapitalPresetButtons() {
      const vault = resolveVaultEquityUsd();
      document.querySelectorAll('.capital-preset-btn[data-capital]').forEach(function(btn) {
        const v = parseFloat(btn.getAttribute('data-capital'));
        btn.classList.toggle('is-active', Number.isFinite(v) && v === capitalUsd && v <= vault);
      });
      document.querySelectorAll('.capital-preset-btn[data-vault-pct]').forEach(function(btn) {
        const pct = parseFloat(btn.getAttribute('data-vault-pct'));
        if (!Number.isFinite(pct) || pct <= 0) {
          btn.classList.remove('is-active');
          return;
        }
        const target = Math.round((vault * pct) / 100);
        // Active when CAPITAL matches vault% (within $1 rounding)
        btn.classList.toggle('is-active', Math.abs(capitalUsd - target) < 1);
      });
    }



    /** @deprecated Use syncOrderSizeUi \u2014 kept for init call sites */


    function formatFunding8hPctFromHourly(hourly) {
      const h = parseFloat(hourly);
      if (!Number.isFinite(h)) return null;
      return h * 8 * 100;
    }

    function formatFunding8hLabel(pct) {
      if (pct === null || pct === undefined || !Number.isFinite(pct)) return '\u2014';
      const sign = pct >= 0 ? '+' : '';
      return sign + pct.toFixed(4) + '%';
    }

    function isCrowdedLongFunding(fr8hPct) {
      return Number.isFinite(fr8hPct) && fr8hPct > 0.1;
    }

    function formatOiCell(hlUsd) {
      return formatOiNotionalUsd(hlUsd);
    }

    function resolveRowCategory(row) {
      if (row && row.asset_category) return row.asset_category;
      return 'crypto';
    }

    function rowMatchesMatrixCategory(row) {
      if (!matrixCategoryFilter || matrixCategoryFilter === 'ALL') return true;
      const cat = resolveRowCategory(row);
      if (matrixCategoryFilter === 'CRYPTO') return cat === 'crypto';
      if (matrixCategoryFilter === 'COMMODITIES') return cat === 'commodity';
      if (matrixCategoryFilter === 'STOCKS') return cat === 'stock';
      if (matrixCategoryFilter === 'INDICES') return cat === 'index';
      if (matrixCategoryFilter === 'PREIPO') return cat === 'preipo';
      if (matrixCategoryFilter === 'STOCKS_INDICES') return cat === 'stock' || cat === 'index' || cat === 'preipo';
      if (matrixCategoryFilter === 'FX') return cat === 'fx';
      return true;
    }

    function sortedBucketEntries(bucket, orderedKeys) {
      const entries = [];
      const seen = {};
      function push(key, asset) {
        if (!asset || seen[key]) return;
        seen[key] = true;
        entries.push({ key: key, asset: asset });
      }
      (orderedKeys || []).forEach(function(key) {
        if (bucket && bucket[key]) push(key, bucket[key]);
      });
      Object.keys(bucket || {}).forEach(function(key) {
        push(key, bucket[key]);
      });
      entries.sort(function(a, b) {
        const oiA = parseFloat(a.asset.openInterestNotionalUsd) || 0;
        const oiB = parseFloat(b.asset.openInterestNotionalUsd) || 0;
        return oiB - oiA;
      });
      return entries;
    }

    function maxOiInBucket(bucket) {
      let max = 0;
      Object.keys(bucket || {}).forEach(function(key) {
        const oi = parseFloat(bucket[key] && bucket[key].openInterestNotionalUsd) || 0;
        if (oi > max) max = oi;
      });
      return max;
    }

    function worldTreeCapsuleHtml(key, asset, isRootNode, maxOi, isCrypto) {
      if (!asset) return '';
      const label = resolveAssetLabel(key, asset);
      const price = parseFloat(asset.markPrice);
      if (!Number.isFinite(price) || price <= 0) return '';
      const pct = parseFloat(asset.change24h_pct);
      const hasPct = Number.isFinite(pct);
      const priceText = formatMarkPrice(key, price) || price.toFixed(4);
      const sign = hasPct && pct >= 0 ? '+' : '';
      const pctText = hasPct ? ' (' + sign + pct.toFixed(2) + '%)' : '';
      const oiUsd = parseFloat(asset.openInterestNotionalUsd) || 0;
      const fr8h = asset.fundingRate8h_pct !== undefined
        ? parseFloat(asset.fundingRate8h_pct)
        : formatFunding8hPctFromHourly(asset.fundingRateHourly !== undefined
          ? asset.fundingRateHourly
          : asset.e1_hl_funding);
      const crowded = isCrowdedLongFunding(fr8h);
      const oiFillPct = maxOi > 0 && oiUsd > 0 ? Math.min(100, (oiUsd / maxOi) * 100) : 0;
      const hlSymbol = asset.hlSymbol || label;
      const tradeUrl = isCrypto ? hlTradeUrl(hlSymbol) : hlTradFiTradeUrl(hlSymbol);
      const selected = selectedConsoleKey === key || String(selectedConsoleKey).toUpperCase() === String(key).toUpperCase();
      const rootTag = isRootNode
        ? '<span class="tradfi-root-node-tag" title="Root Node \u2014 Max OI Capacity">\u{1F451} ROOT NODE (MAX OI)</span>'
        : '';
      const capsuleCls = 'world-tree-capsule' +
        (isRootNode ? ' is-root-node' : '') +
        (crowded ? ' crowded-long' : '') +
        (selected ? ' token-selected' : '');
      const capacityLine =
        '<span class="world-tree-oi-highlight">OI: ' + formatOiNotionalUsd(oiUsd) + '</span>' +
        ' \xB7 <span class="world-tree-fr-highlight">8h FR: ' + formatFunding8hLabel(fr8h) + '</span>' +
        (crowded ? ' <span class="text-amber-300 font-bold">\u26A0 CROWDED</span>' : '');
      const priceLine =
        '<button type="button" class="bg-transparent border-0 p-0 cursor-pointer font-bold text-inherit" onclick="injectTokenToMasterConsole(' + jsOnclickArg(key) + ')" title="Lock &amp; Inject to Step 3">[' + label + ']</button>' +
        ' <a href="' + tradeUrl + '" target="_blank" rel="noopener noreferrer" class="token-price-link tradfi-token-price" onclick="event.stopPropagation()" title="Open Hyperliquid">$' + priceText + pctText + '</a>' +
        ' <a href="' + tradeUrl + '" target="_blank" rel="noopener noreferrer" class="hl-trade-icon-link" onclick="event.stopPropagation()" title="Hyperliquid">\u{1F517}</a>';
      const est = estimateSoilSlippage(asset);
      const capsuleInner =
        '<div class="' + capsuleCls + '" data-token-key="' + key + '">' +
        (oiFillPct > 0 ? '<div class="world-tree-oi-fill" style="width:' + oiFillPct.toFixed(1) + '%"></div>' : '') +
        '<div class="world-tree-capsule-body">' +
          '<div class="world-tree-capsule-capacity">' + capacityLine + '</div>' +
          '<div class="world-tree-capsule-price">' + priceLine + '</div>' +
        '</div>' +
        soilTooltipHtml(label, est) +
      '</div>';
      if (isRootNode) {
        return '<div class="world-tree-capsule-wrap">' + rootTag + capsuleInner + '</div>';
      }
      return capsuleInner;
    }

    function sumBucketOi(bucket) {
      let total = 0;
      Object.keys(bucket || {}).forEach(function(k) {
        total += parseFloat(bucket[k].openInterestNotionalUsd) || 0;
      });
      return total;
    }

    function fundingAbs8hPct(asset) {
      const fr8 = parseFloat(asset && asset.fundingRate8h_pct);
      if (Number.isFinite(fr8)) return Math.abs(fr8);
      return Math.abs((parseFloat(asset && asset.fundingRateHourly) || 0) * 100 * 8);
    }

    function topExtremeFundingEntries(bucket, orderedKeys, limit) {
      const entries = sortedBucketEntries(bucket, orderedKeys);
      entries.sort(function(a, b) {
        return fundingAbs8hPct(b.asset) - fundingAbs8hPct(a.asset);
      });
      return entries.slice(0, limit || 3);
    }

    function formatCatFrPct(asset) {
      const fr8 = parseFloat(asset.fundingRate8h_pct);
      if (Number.isFinite(fr8)) {
        const sign = fr8 >= 0 ? '+' : '';
        return sign + fr8.toFixed(4) + '%';
      }
      const hourly = parseFloat(asset.fundingRateHourly) || 0;
      const pct = hourly * 100 * 8;
      const sign = pct >= 0 ? '+' : '';
      return sign + pct.toFixed(4) + '%';
    }

    function renderCategoryExtremeFrList(elId, bucket, orderedKeys, emptyMsg, isCrypto) {
      const el = document.getElementById(elId);
      if (!el) return;
      const oiEl = document.getElementById(elId.replace('Panel', 'OiTotal'));
      const totalOi = sumBucketOi(bucket);
      if (oiEl) oiEl.innerText = 'OI ' + formatOiNotionalUsd(totalOi);
      const top = topExtremeFundingEntries(bucket, orderedKeys, 3);
      if (!top.length) {
        el.innerHTML = '<span class="text-gray-500 typo-context">' + emptyMsg + '</span>';
        return;
      }
      el.innerHTML = top.map(function(entry) {
        const label = resolveAssetLabel(entry.key, entry.asset);
        const fr = formatCatFrPct(entry.asset);
        const frNum = parseFloat(entry.asset.fundingRate8h_pct);
        const color = (Number.isFinite(frNum) ? frNum : (parseFloat(entry.asset.fundingRateHourly) || 0)) >= 0
          ? 'text-rose-300' : 'text-emerald-300';
        return '<div class="cat-fr-row">' +
          '<button type="button" onclick="injectTokenToMasterConsole(' + jsOnclickArg(entry.key) + ')" title="Quick Target Lock">' + label + '</button>' +
          '<span class="typo-num ' + color + '">' + fr + '</span>' +
        '</div>';
      }).join('');
    }

    function renderWorldTreeCategoryPanel(elId, bucket, orderedKeys, emptyMsg, kingKey, isCrypto, itemLimit) {
      // v2.0: condensed cards \u2014 ALL tokens mapped in bucket; display Top 3 extreme FR only
      renderCategoryExtremeFrList(elId, bucket, orderedKeys, emptyMsg, isCrypto);
    }

    /**
     * Client-side crypto bucket from Worker hl_universe proxy (ALL tokens).
     * Heavy FR/OI sort happens here \u2014 Worker only ships slim quotes.
     * Falls back to Rule A/B matrix rows if proxy absent.
     */
    function buildCryptoAssetsFromMatrix() {
      const bucket = {};
      if (cachedHlUniverse && cachedHlUniverse.length) {
        cachedHlUniverse.forEach(function(q) {
          if (!q || typeof q !== 'object') return;
          const sym = String(q.symbol || '').toUpperCase();
          if (!sym) return;
          const key = sym.toLowerCase();
          const oi = parseFloat(q.dayVolumeUsd) || 0;
          const fr8h = Number.isFinite(parseFloat(q.funding8h_pct))
            ? parseFloat(q.funding8h_pct)
            : formatFunding8hPctFromHourly(q.funding);
          bucket[key] = {
            hlSymbol: sym,
            markPrice: parseFloat(q.mark) || parseFloat(q.spot) || 0,
            change24h_pct: 0,
            openInterestNotionalUsd: oi,
            fundingRateHourly: parseFloat(q.funding) || 0,
            fundingRate8h_pct: fr8h,
            displayName: sym,
          };
        });
        return bucket;
      }
      if (!globalData || !globalData.length) return bucket;
      globalData.forEach(function(row) {
        const sym = String(row.b1_symbol || '').toUpperCase();
        if (!sym) return;
        const key = sym.toLowerCase();
        const price = parseFloat(row.d1_hl_perp) || parseFloat(row.c1_hl_spot) || 0;
        const oi = parseFloat(row.hl_oi_usd) || parseFloat(row.vol_3d_avg) || 0;
        const fr8h = formatFunding8hPctFromHourly(row.e1_hl_funding);
        const existing = bucket[key];
        const existingOi = existing ? (parseFloat(existing.openInterestNotionalUsd) || 0) : 0;
        if (existing && existingOi >= oi) return;
        bucket[key] = {
          hlSymbol: sym,
          markPrice: price,
          change24h_pct: 0,
          openInterestNotionalUsd: oi,
          fundingRateHourly: parseFloat(row.e1_hl_funding) || 0,
          fundingRate8h_pct: fr8h,
          displayName: sym,
        };
      });
      return bucket;
    }

    function renderCryptoWorldTreePanel() {
      const bucket = buildCryptoAssetsFromMatrix();
      let kingKey = '';
      let bestOi = 0;
      Object.keys(bucket).forEach(function(k) {
        const oi = parseFloat(bucket[k].openInterestNotionalUsd) || 0;
        if (oi > bestOi) { bestOi = oi; kingKey = k; }
      });
      renderWorldTreeCategoryPanel('cryptoPanel', bucket, null, 'No crypto targets', kingKey, true, 0);
    }

    function buildTradFiMatrixRows(enrichment) {
      if (!enrichment) return [];
      const specs = [
        { bucket: 'commodities', cat: 'commodity' },
        { bucket: 'stocks', cat: 'stock' },
        { bucket: 'indices', cat: 'index' },
        { bucket: 'fx', cat: 'fx' },
        { bucket: 'preipo', cat: 'preipo' },
      ];
      const rows = [];
      specs.forEach(function(spec) {
        const bucket = enrichment[spec.bucket] || {};
        Object.keys(bucket).forEach(function(key) {
          const asset = bucket[key];
          if (!asset || !asset.markPrice) return;
          const label = resolveAssetLabel(key, asset);
          const oi = parseFloat(asset.openInterestNotionalUsd) || 0;
          const fr = parseFloat(asset.fundingRateHourly) || 0;
          rows.push({
            b1_symbol: label,
            asset_category: spec.cat,
            c1_hl_spot: asset.markPrice,
            d1_hl_perp: asset.markPrice,
            e1_hl_funding: fr,
            i1_annual_cross: 0,
            vol_3d_avg: oi,
            hl_oi_usd: oi,
            onHyperliquid: true,
            stability: 0,
            isTradFiSynthetic: true,
            tradfi_key: key,
          });
        });
      });
      return rows;
    }

    function mergeTradFiEnrichmentWithSnapshots(enrichment, snapshots) {
      const merged = {
        commodities: {},
        stocks: {},
        indices: {},
        fx: {},
        preipo: {},
        kings: (enrichment && enrichment.kings) ? enrichment.kings : {},
      };
      ['commodities', 'stocks', 'indices', 'fx', 'preipo'].forEach(function(cat) {
        const existing = (enrichment && enrichment[cat]) ? enrichment[cat] : {};
        Object.keys(existing).forEach(function(key) {
          merged[cat][key] = Object.assign({}, existing[key]);
        });
        const snapshot = (snapshots && snapshots[cat]) ? snapshots[cat] : {};
        Object.keys(snapshot).forEach(function(key) {
          const normKey = String(key).toLowerCase();
          const price = parseFloat(snapshot[key]);
          if (!Number.isFinite(price) || price <= 0) return;
          if (!merged[cat][normKey]) {
            merged[cat][normKey] = {
              hlSymbol: resolveAssetLabel(normKey, {}),
              markPrice: price,
            };
          } else if (!Number.isFinite(parseFloat(merged[cat][normKey].markPrice))) {
            merged[cat][normKey].markPrice = price;
          }
        });
      });
      return merged;
    }

    function mergeMatrixDataSource(cryptoRows) {
      const tradfiRows = buildTradFiMatrixRows(cachedTradFiEnrichment);
      return (cryptoRows || []).concat(tradfiRows);
    }

    function tradFiAssetChipHtml(key, asset, isTopNode) {
      return worldTreeCapsuleHtml(key, asset, isTopNode, maxOiInBucket({ [key]: asset }), false);
    }

    function renderTradFiCategoryPanel(elId, bucket, orderedKeys, emptyMsg, kingKey) {
      renderWorldTreeCategoryPanel(elId, bucket, orderedKeys, emptyMsg, kingKey, false);
    }

    function updateRootSlipProtectionStatus() {
      const box = document.getElementById('rootSlipProtectionStatus');
      const lamp = document.getElementById('rootSlipBreakerLamp');
      if (!lamp) return;
      const tripped = settlementLockdownActive || tsunamiShieldActive || shieldDemoRedAlertActive || settlementLockdownDemoActive;
      if (tripped) {
        lamp.innerHTML = '\u{1F7E0} Slip Breaker: LOCKED | Max 0.5% Slippage Tolerance';
        if (box) box.classList.add('tripped');
      } else {
        lamp.innerHTML = '\u{1F7E2} Slip Breaker: ACTIVE | Max 0.5% Slippage Tolerance';
        if (box) box.classList.remove('tripped');
      }
    }

    function renderTradFiPanels(commodities, stocks, indices, fx, preipo, enrichment) {
      cachedTradFiSnapshots = {
        commodities: commodities || {},
        stocks: stocks || {},
        indices: indices || {},
        fx: fx || {},
        preipo: preipo || {},
      };
      cachedTradFiEnrichment = mergeTradFiEnrichmentWithSnapshots(enrichment, cachedTradFiSnapshots);
      const kings = (cachedTradFiEnrichment && cachedTradFiEnrichment.kings) ? cachedTradFiEnrichment.kings : {};
      const bucket = cachedTradFiEnrichment || {};

      renderTradFiCategoryPanel(
        'commoditiesPanel',
        bucket.commodities,
        COMMODITY_ORDER,
        'No commodities',
        kings.commodities ? kings.commodities.key : ''
      );
      renderTradFiCategoryPanel(
        'stocksPanel',
        bucket.stocks,
        null,
        'No synthetic stocks',
        kings.stocks ? kings.stocks.key : ''
      );
      renderTradFiCategoryPanel(
        'indicesPanel',
        bucket.indices,
        null,
        'No indices',
        kings.indices ? kings.indices.key : ''
      );
      renderTradFiCategoryPanel(
        'fxPanel',
        bucket.fx,
        null,
        'No FX pairs',
        kings.fx ? kings.fx.key : ''
      );
      renderTradFiCategoryPanel(
        'preipoPanel',
        bucket.preipo,
        null,
        'No Pre-IPO targets',
        kings.preipo ? kings.preipo.key : ''
      );
      renderCryptoWorldTreePanel();
      renderPreLaunchSpotlight(cachedTradFiEnrichment || enrichment);
    }

    function updateVolatilityFilters(vixValue, dvolValue) {
      const vixTradEl = document.getElementById('vixTrad');
      const vixCryptoEl = document.getElementById('vixCrypto');
      const heartbeatEl = document.getElementById('marketHeartbeatBar');
      const volLabelEl = document.getElementById('heartbeatVolLabel');
      const volStateEl = document.getElementById('heartbeatVolState');
      const circuitEl = document.getElementById('heartbeatCircuitLabel');
      const vixNum = parseFloat(vixValue);
      const dvolNum = parseFloat(dvolValue);
      lastVixValue = Number.isFinite(vixNum) ? vixNum : lastVixValue;
      lastDvolValue = Number.isFinite(dvolNum) ? dvolNum : lastDvolValue;
      const vixPanic = Number.isFinite(vixNum) && vixNum >= 22;
      const dvolHigh = Number.isFinite(dvolNum) && dvolNum >= 45;
      const vixForHeat = Number.isFinite(lastVixValue) ? lastVixValue : 0;
      const dvolForHeat = Number.isFinite(lastDvolValue) ? lastDvolValue : 0;
      const heatScore = (vixForHeat * 0.4) + (dvolForHeat * 0.6);
      lastHeatScore = heatScore;

      if (vixTradEl) {
        const mood = vixPanic
          ? '<span class="emoji-xl">\u{1F635}</span> \u50B3\u7D71\u5E02\u5834\uFF1A\u6050\u614C\u66B4\u52D5 / Panic'
          : '<span class="emoji-xl">\u{1F60C}</span> \u50B3\u7D71\u5E02\u5834\uFF1A\u5E73\u7A69 / Stable';
        vixTradEl.innerHTML = 'VIX (Trad): <strong>' + (Number.isFinite(vixNum) ? vixNum.toFixed(1) : '--') + '</strong>' +
          ' <a href="https://www.cboe.com/tradable_products/vix/" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="CBOE VIX">\u{1F517}</a> [ ' + mood + ' ]';
        vixTradEl.className = vixPanic
          ? 'vol-filter-badge rounded bg-red-500/20 text-red-300 border-2 border-red-500/50 font-mono font-bold text-sm mb-2 animate-pulse'
          : 'vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm mb-2';
      }
      if (vixCryptoEl) {
        const mood = dvolHigh
          ? '<span class="emoji-xl">\u{1F92A}</span> \u52A0\u5BC6\u5E02\u5834\uFF1A\u760B\u72C2\u6D17\u76E4 / High Vol'
          : '<span class="emoji-xl">\u{1F60C}</span> \u52A0\u5BC6\u5E02\u5834\uFF1A\u6A6B\u76E4\u84C4\u52E2 / Low Vol';
        vixCryptoEl.innerHTML = 'DVOL (Crypto): <strong>' + (Number.isFinite(dvolNum) ? dvolNum.toFixed(1) + '%' : '--') + '</strong>' +
          ' <a href="https://www.deribit.com/statistics/BTC/volatility-index" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="Deribit DVOL">\u{1F517}</a> [ ' + mood + ' ]';
        vixCryptoEl.className = dvolHigh
          ? 'vol-filter-badge text-orange-300 font-mono font-bold text-sm bg-red-950/40 border-2 border-orange-500/50 px-3 py-1.5 rounded animate-pulse'
          : 'vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm';
      }

      let stateClass = 'is-safe';
      let volState = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label;
      let circuitText = 'NO CIRCUIT RISK';
      let tipDesc = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.desc;
      let tipLabel = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label;
      lastHeatState = 'safe';
      if (heatScore > 75) {
        stateClass = 'is-extreme';
        lastHeatState = 'extreme';
        volState = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.LOCKED.label;
        circuitText = 'CIRCUIT TRIGGERED';
        tipDesc = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.LOCKED.desc;
        tipLabel = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.LOCKED.label;
      } else if (heatScore >= 40) {
        stateClass = 'is-elevated';
        lastHeatState = 'elevated';
        volState = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.ELEVATED.label;
        circuitText = 'CIRCUIT WATCH';
        tipDesc = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.ELEVATED.desc;
        tipLabel = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.ELEVATED.label;
      }

      if (heartbeatEl) {
        heartbeatEl.className = 'market-heartbeat-card ' + stateClass;
        heartbeatEl.title = 'Heat ' + heatScore.toFixed(1) + ' = VIX ' + vixForHeat.toFixed(1) + '\xD70.4 + DVOL ' + dvolForHeat.toFixed(1) + '\xD70.6';
      }
      if (volStateEl) volStateEl.textContent = volState;
      if (circuitEl) circuitEl.textContent = circuitText;
      if (volLabelEl) {
        volLabelEl.textContent = volState + ' \u2014 ' + circuitText;
        applySvTip(volLabelEl, tipDesc, tipLabel);
      }
      if (volStateEl) applySvTip(volStateEl, tipDesc, tipLabel);

      applyStep1EmergencyState();
      refreshGatekeeperDefenseMatrix();
      if (typeof syncCriFromLiveRiskSignals === 'function') {
        syncCriFromLiveRiskSignals();
      }
    }

function recalculate() {
      try {
        const capital = Number.isFinite(masterOrderSizeUsd) && masterOrderSizeUsd > 0
          ? masterOrderSizeUsd
          : sanitizeCapitalUsd(capitalUsd);
        syncOrderSizeUi(capital);
        const frictionRate = getStep3FrictionRate();
        const fixedCost = getStep3FixedCost();
        
        const upfrontFrictionUSD = (capital * frictionRate) + fixedCost;
        
        const frictionBlockVal = document.getElementById('displayTotalFriction');
        if (frictionBlockVal) {
          frictionBlockVal.innerText = "$" + upfrontFrictionUSD.toFixed(2);
        }

        const tbody = document.getElementById('matrixTableBody');
        if (!tbody) return;

        if (!globalData || globalData.length === 0) {
          const tradfiOnly = buildTradFiMatrixRows(cachedTradFiEnrichment);
          if (!tradfiOnly.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-rose-400 font-bold">\u26A0\uFE0F Waiting for data gateway or no available targets...</td></tr>';
            cachedDisplayList = [];
            updatePaginationControls(0);
            return;
          }
        }

        // \u6578\u64DA\u6E05\u6D17\u8207\u5B89\u5168\u503C\u586B\u5145\uFF08Crypto Rule A/B + TradFi HL \u8CC7\u7522\uFF09
        let processedData = mergeMatrixDataSource(globalData).map(item => {
          const row = { ...item };
          row.b1_symbol = row.b1_symbol || 'Unknown';
          row.c1_hl_spot = parseFloat(row.c1_hl_spot) || 0;
          row.d1_hl_perp = parseFloat(row.d1_hl_perp) || 0;
          row.e1_hl_funding = parseFloat(row.e1_hl_funding) || 0;
          row.i1_annual_cross = parseFloat(row.i1_annual_cross) || 0;
          row.std_dev_24h = parseFloat(row.std_dev_24h) || 0;
          row.vol_3d_avg = parseFloat(row.vol_3d_avg) || 0;
          row.stability = parseFloat(row.stability) || 0;
          row.hl_oi_usd = parseFloat(row.hl_oi_usd) || parseFloat(row.vol_3d_avg) || 0;
          return row;
        });

        // \u5F8C\u7AEF\u5DF2\u710A\u6B7B Rule A\uFF1B\u524D\u7AEF\u50C5\u505A\u641C\u5C0B / \u72C0\u614B / \u5206\u985E / \u5206\u9801
        let filteredData = processedData.filter(row => {
          const hasSymbol = !!row.b1_symbol && row.b1_symbol !== 'Unknown';
          const hasPrice = row.c1_hl_spot > 0 || row.d1_hl_perp > 0;
          return hasSymbol && hasPrice && rowMatchesMatrixCategory(row);
        });

        // \u5F8C\u7AEF actionStatus \u710A\u6B7B \u2192 Tab Filter\uFF1B\u50C5\u5728\u7F3A\u5931\u6642\u624D\u524D\u7AEF\u63A8\u5C0E
        let displayList = filteredData.map(row => {
          const dailyYieldRate = (row.i1_annual_cross / 100) / 365;
          const dailyGrossProfit = capital * dailyYieldRate;
          const net7 = (dailyGrossProfit * 7) - upfrontFrictionUSD;
          const net30 = (dailyGrossProfit * 30) - upfrontFrictionUSD;
          const funding8hPct = formatFunding8hPctFromHourly(row.e1_hl_funding);

          const currentStatus = row.actionStatus || '';
          const riskTripped = row.risk_tripped === true;
          let styleObj;
          if (currentStatus) {
            styleObj = getActionStyle(currentStatus, riskTripped, row.passedRule);
          } else if (riskTripped) {
            styleObj = getActionStyle('SPREAD_TOO_HIGH', true, row.passedRule);
          } else {
            styleObj = getActionStyle('HOLD', false, row.passedRule);
            if (row.net7 <= 0 || upfrontFrictionUSD > 50) {
              styleObj = getActionStyle('HOLD', false, row.passedRule);
            } else {
              const hlPerpDiff = row.c1_hl_spot > 0
                ? (row.d1_hl_perp - row.c1_hl_spot) / row.c1_hl_spot
                : 0;
              if (hlPerpDiff > 0.015 || row.e1_hl_funding > 0) {
                styleObj = getActionStyle('BUY_HL_SPOT_SHORT_HL_PERP', false, row.passedRule);
              } else if (hlPerpDiff < -0.015 || row.e1_hl_funding < 0) {
                styleObj = getActionStyle('SHORT_HL_SPOT_LONG_HL_PERP', false, row.passedRule);
              } else {
                styleObj = getActionStyle('HOLD', false, row.passedRule);
              }
            }
          }

          const pairStatusKey = resolvePairStatusKey(
            currentStatus || (
              styleObj.statusKey === 'SPREAD' ? 'SPREAD_TOO_HIGH' :
              styleObj.statusKey === 'DEFICIT' ? (row.passedRule === 'B' ? 'RULE_B_HIGH_RATE' : 'SHORT_HL_SPOT_LONG_HL_PERP') :
              styleObj.statusKey === 'OPEN' ? 'BUY_HL_SPOT_SHORT_HL_PERP' :
              'HOLD'
            ),
            riskTripped,
            row.passedRule
          );

          return {
            ...row,
            funding8hPct,
            net7,
            net30,
            styleObj,
            pairStatusKey: pairStatusKey
          };
        });

        // Token \u641C\u5C0B / \u72C0\u614B\u7BE9\u9078 \u2014 \u4E0D\u5957\u7528\u5230\u5DF2 Pin \u7684 Token
        const pinnedSet = {};
        pinnedSymbols.forEach(function(s) { pinnedSet[s] = true; });

        const pinnedPool = displayList.filter(function(row) {
          return !!pinnedSet[String(row.b1_symbol).toUpperCase()];
        });
        // Keep pin order stable
        pinnedPool.sort(function(a, b) {
          return pinnedSymbols.indexOf(String(a.b1_symbol).toUpperCase()) -
            pinnedSymbols.indexOf(String(b.b1_symbol).toUpperCase());
        });

        let unpinnedList = displayList.filter(function(row) {
          return !pinnedSet[String(row.b1_symbol).toUpperCase()];
        });

        if (tokenSearchQuery) {
          unpinnedList = unpinnedList.filter(function(row) {
            return String(row.b1_symbol).toUpperCase().indexOf(tokenSearchQuery) >= 0;
          });
        }

        if (pairStatusFilter && pairStatusFilter !== 'ALL') {
          unpinnedList = unpinnedList.filter(function(row) {
            if (row.isTradFiSynthetic) return matrixCategoryFilter !== 'CRYPTO';
            return row.pairStatusKey === pairStatusFilter;
          });
        }

        // \u6392\u5E8F\u5F15\u64CE\uFF08\u50C5 unpinned\uFF1Bpinned \u4FDD\u6301\u9802\u7F6E\u9806\u5E8F\uFF09
        if (currentSortCol !== -1) {
          unpinnedList.sort((a, b) => {
            let valA, valB;
            switch (currentSortCol) {
              case 1: valA = a.b1_symbol; valB = b.b1_symbol; break;
              case 2: valA = a.hl_oi_usd || 0; valB = b.hl_oi_usd || 0; break;
              case 3: valA = Math.abs(a.funding8hPct || 0); valB = Math.abs(b.funding8hPct || 0); break;
              case 4: valA = a.i1_annual_cross; valB = b.i1_annual_cross; break;
              case 5: valA = a.vol_3d_avg; valB = b.vol_3d_avg; break;
              case 6: valA = a.net7; valB = b.net7; break;
              case 7: valA = a.net30; valB = b.net30; break;
              default: valA = 0; valB = 0;
            }
            if (typeof valA === 'string') {
              return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else {
              return sortAscending ? valA - valB : valB - valA;
            }
          });
        }

        cachedDisplayList = unpinnedList;
        updatePaginationControls(unpinnedList.length);

        const size = effectivePageSize(unpinnedList.length);
        const startIdx = (currentPage - 1) * size;
        const pageRows = unpinnedList.slice(startIdx, startIdx + size);
        const renderRows = pinnedPool.concat(pageRows);

        tbody.innerHTML = '';
        const bestRow = pickRecommendedRow(displayList);

        if (renderRows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-amber-400 font-bold">\u26A0\uFE0F No targets match current filters</td></tr>';
        }

        renderRows.forEach(row => {
          const isTradFiRow = row.isTradFiSynthetic === true;
          const isPositive7 = row.net7 > 0;
          const isPositive30 = row.net30 > 0;
          const styleObj = row.styleObj || getActionStyle(isTradFiRow ? 'HOLD' : 'HOLD');
          const maxLossText = row.maxLossLabel || '';
          const actionTagHtml =
            '<div class="inline-flex flex-col items-end gap-1">' +
              '<span class="px-2 py-1 rounded text-xs font-black border ' + styleObj.bg + ' ' + styleObj.text + ' ' + styleObj.border + '">' + styleObj.label + '</span>' +
              (maxLossText
                ? '<span class="text-[10px] font-mono text-amber-300/90">' + maxLossText + '</span>'
                : '') +
            '</div>';
          const cleanSymbolName = getSymbolEmoji(row.b1_symbol) + " " + row.b1_symbol;
          const volText = row.vol_3d_avg ? ("$" + (row.vol_3d_avg / 1000000).toFixed(1) + "M") : "N/A";
          
          const mixTrendCol = '<div>' + (row.stability * 1000).toFixed(2) + ' \u2030 (stable)</div><div class="text-[10px] text-gray-400 mt-0.5">3d Vol: ' + volText + '</div>';

          const symUpper = String(row.b1_symbol).toUpperCase();
          const pinned = isPinned(symUpper);
          const pinAtCap = !pinned && pinnedSymbols.length >= MAX_PINS;
          const pinClass = 'pin-btn' + (pinned ? ' pinned' : '') + (pinAtCap ? ' pin-locked' : '');
          const pinLabel = pinned ? '\u2605' : '\u2606';
          const pinTitle = pinAtCap
            ? 'Favorite limit reached (Max 3)'
            : (pinned ? 'Unfavorite ' + symUpper : 'Favorite / Pin to Top');

          // Soil Resistance \u2014 compact Normal tag; expanded only on CIRCUIT BREAKER
          const soilHtml = buildSoilResistanceHtml(row);

          const tr = document.createElement('tr');
          tr.className = 'border-b border-white/5 matrix-token-row' +
            (pinned ? ' row-pinned' : '') +
            (String(activeSelectedToken).toUpperCase() === symUpper || String(selectedConsoleKey).toUpperCase() === symUpper
              ? ' token-row-selected' : '');
          tr.setAttribute('data-token-key', symUpper);
          tr.title = '\u2606 Favorite on left \xB7 Lock & Inject on right to send to Step 3';
          tr.addEventListener('click', function(e) {
            if (e.target && e.target.closest && e.target.closest('a, button, .pin-btn, .token-price-link, .hl-trade-icon-link, .matrix-inject-btn')) return;
            injectTokenToMasterConsole(symUpper, assetFromMatrixRow(row));
          });

          const markPx = parseFloat(row.d1_hl_perp) || parseFloat(row.c1_hl_spot) || 0;
          const displayHlSpot = markPx > 0
            ? ('$' + markPx.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4}))
            : '\u2014';
          const displayAnnualHl = row.i1_annual_cross.toFixed(2) + "%";
          
          const net7Class = isPositive7 ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/5';
          const displayNet7 = "$" + row.net7.toFixed(2);
          
          const net30Class = isPositive30 ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/5';
          const displayNet30 = "$" + row.net30.toFixed(2);
          const isOpenAction = row.pairStatusKey === 'OPEN';
          const tradeLinkGuard = isOpenAction ? ' onclick="return guardSettlementLockdownLink(event)"' : '';
          const actionCellClass = 'p-3 sticky-col-right text-right' + (isOpenAction ? ' cursor-pointer' : '');
          const actionCellClick = isOpenAction ? ' onclick="handleActionCellClick(\\'OPEN\\')"' : '';
          const hlUrl = isTradFiRow ? hlTradFiTradeUrl(row.b1_symbol) : hlTradeUrl(row.b1_symbol);
          const oiCell = formatOiCell(row.hl_oi_usd);

          const fr8Label = formatFunding8hLabel(formatFunding8hPctFromHourly(row.e1_hl_funding));
          const shieldIcon = brandShieldImg('matrix-inject-icon', 20);
          const lockBtn =
            '<button type="button" class="matrix-inject-btn" ' +
            'onclick="injectTokenToMasterConsole(' + jsOnclickArg(symUpper) + ')" title="Lock to Step 3">' +
            shieldIcon + '[ LOCK TO STEP 3 ]</button>';
          tr.innerHTML =
            '<td class="p-2 sticky-col-left text-center">' +
              '<button type="button" class="' + pinClass + '" title="' + pinTitle + '" aria-label="' + pinTitle + '" onclick="togglePin(' + jsOnclickArg(symUpper) + ')">' + pinLabel + '</button>' +
            '</td>' +
            '<td class="p-2 font-bold sticky-col-left text-white typo-context matrix-symbol-cell" style="left:40px">' +
              '<button type="button" class="token-name-select bg-transparent border-0 p-0 cursor-pointer text-white font-bold text-left" onclick="injectTokenToMasterConsole(' + jsOnclickArg(symUpper) + ')" title="Lock to Step 3">' +
                cleanSymbolName +
              '</button>' +
            '</td>' +
            '<td class="p-2 typo-num text-emerald-300 font-bold">' + oiCell + '</td>' +
            '<td class="p-2 typo-num">' +
              '<div class="matrix-price-fr-cell">' +
                '<a href="' + hlUrl + '" target="_blank" rel="noopener noreferrer" class="token-price-link text-white font-bold"' + tradeLinkGuard + ' title="Open Hyperliquid">' + displayHlSpot + '</a>' +
                '<span class="matrix-fr-sub funding-link">' + fr8Label + '</span>' +
              '</div>' +
            '</td>' +
            '<td class="p-2 typo-num font-bold text-circuit">' + displayAnnualHl + '</td>' +
            '<td class="p-2 text-center">' + soilHtml + '</td>' +
            '<td class="p-2 sticky-col-right text-right">' + lockBtn + '</td>';
            
          tbody.appendChild(tr);
        });

        if (selectedConsoleKey) syncConsoleSelectionHighlights(selectedConsoleKey);

        // Block 01 \u2014 highest APR Rule A row not slippage-locked (synced with table logic)
        const bestSymbolEl = document.getElementById('bestPairSymbol');
        const bestYieldEl = document.getElementById('bestPairYield');
        const bestProfitEl = document.getElementById('bestPairProfit');
        const bestProfit30El = document.getElementById('bestPairProfit30');

        bestHedgeList = buildBestHedgeList(displayList);
        const topHedge = bestHedgeList[0] || bestRow || null;

        if (topHedge) {
          cachedBestHedgeRow = topHedge;
          cachedBestAprPct = topHedge.i1_annual_cross;
          if (bestSymbolEl) bestSymbolEl.innerText = formatBestHedgePairLabel(topHedge.b1_symbol);
          if (bestYieldEl) bestYieldEl.innerText = topHedge.i1_annual_cross.toFixed(2) + "% APR";
          renderBestHedgeStrategyTag(topHedge);
          if (bestProfitEl) bestProfitEl.innerText = "$" + Number(topHedge.net7 || 0).toFixed(2);
          if (bestProfit30El) bestProfit30El.innerText = "$" + Number(topHedge.net30 || 0).toFixed(2);
          const lockBtn = document.getElementById('lockBestHedgeBtn');
          if (lockBtn) lockBtn.disabled = false;
        } else {
          cachedBestHedgeRow = null;
          bestHedgeList = [];
          cachedBestAprPct = null;
          if (bestSymbolEl) bestSymbolEl.innerText = formatBestHedgePairLabel('---');
          if (bestYieldEl) bestYieldEl.innerText = '---% APR';
          renderBestHedgeStrategyTag(null);
          if (bestProfitEl) bestProfitEl.innerText = '$0.00';
          if (bestProfit30El) bestProfit30El.innerText = '$0.00';
          const lockBtn = document.getElementById('lockBestHedgeBtn');
          if (lockBtn) lockBtn.disabled = true;
        }

        // Bind Step 3 AFTER bestHedgeList[0] is known (dynamic #1 APR inject)
        applyDefaultConsoleToken();
        refreshGatekeeperDefenseMatrix();

      } catch (err) {
        addLog("Recalculate Error: " + err.message, "error");
        console.error(err);
      }
    }

    function sortTable(colIndex) {
      if (currentSortCol === colIndex) {
        sortAscending = !sortAscending;
      } else {
        currentSortCol = colIndex;
        sortAscending = true;
      }
      
      const headers = document.querySelectorAll('#matrixTable th');
      headers.forEach((h, idx) => {
        h.classList.remove('sort-asc', 'sort-desc');
        if (idx === colIndex) {
          h.classList.add(sortAscending ? 'sort-asc' : 'sort-desc');
        }
      });

      recalculate();
    }

    let dragSrcEl = null;
    let tradfiDragSrcEl = null;

    function handleDragStart(e) {
      this.style.opacity = '0.4';
      dragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
      if (e.preventDefault) e.preventDefault();
      this.classList.add('drag-over');
      return false;
    }

    function handleDragLeave() {
      this.classList.remove('drag-over');
    }

    function handleDrop(e) {
      if (e.stopPropagation) e.stopPropagation();
      this.classList.remove('drag-over');
      
      if (dragSrcEl !== this) {
        const tempOrder = this.style.order;
        this.style.order = dragSrcEl.style.order;
        dragSrcEl.style.order = tempOrder;
        addLog("Dashboard Layout Adjusted.", "info");
        persistGridLayoutOrder();
      }
      return false;
    }

    function handleDragEnd() {
      this.style.opacity = '1';
      const cols = document.querySelectorAll('.draggable');
      cols.forEach(col => col.classList.remove('drag-over'));
    }

    function initDraggables() {
      const cols = document.querySelectorAll('.draggable');
      cols.forEach(col => {
        col.addEventListener('dragstart', handleDragStart, false);
        col.addEventListener('dragover', handleDragOver, false);
        col.addEventListener('dragleave', handleDragLeave, false);
        col.addEventListener('drop', handleDrop, false);
        col.addEventListener('dragend', handleDragEnd, false);
      });
    }

    function handleTradFiDragStart(e) {
      this.style.opacity = '0.4';
      tradfiDragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
    }

    function handleTradFiDragOver(e) {
      if (e.preventDefault) e.preventDefault();
      this.classList.add('drag-over');
      return false;
    }

    function handleTradFiDragLeave() {
      this.classList.remove('drag-over');
    }

    function handleTradFiDrop(e) {
      if (e.stopPropagation) e.stopPropagation();
      this.classList.remove('drag-over');
      if (tradfiDragSrcEl && tradfiDragSrcEl !== this) {
        const tempOrder = this.style.order;
        this.style.order = tradfiDragSrcEl.style.order;
        tradfiDragSrcEl.style.order = tempOrder;
        addLog('TradFi Panel Layout Adjusted.', 'info');
        persistTradFiLayoutOrder();
      }
      return false;
    }

    function handleTradFiDragEnd() {
      this.style.opacity = '1';
      document.querySelectorAll('.tradfi-draggable').forEach(function(col) {
        col.classList.remove('drag-over');
      });
    }

    function initTradFiDraggables() {
      document.querySelectorAll('#tradFiPanel .tradfi-draggable').forEach(function(col) {
        col.addEventListener('dragstart', handleTradFiDragStart, false);
        col.addEventListener('dragover', handleTradFiDragOver, false);
        col.addEventListener('dragleave', handleTradFiDragLeave, false);
        col.addEventListener('drop', handleTradFiDrop, false);
        col.addEventListener('dragend', handleTradFiDragEnd, false);
      });
    }

    function initResizers() {
      const ths = document.querySelectorAll('#matrixTable th');
      ths.forEach(th => {
        const resizer = th.querySelector('.resizer');
        if (!resizer) return;
        
        let startX, startWidth;
        resizer.addEventListener('mousedown', e => {
          startX = e.clientX;
          startWidth = th.offsetWidth;
          document.addEventListener('mousemove', doDrag);
          document.addEventListener('mouseup', stopDrag);
          e.preventDefault();
        });

        function doDrag(e) {
          th.style.width = (startWidth + e.clientX - startX) + 'px';
        }

        function stopDrag() {
          document.removeEventListener('mousemove', doDrag);
          document.removeEventListener('mouseup', stopDrag);
        }
      });
    }

    window.injectTokenToMasterConsole = injectTokenToMasterConsole;

    function revealDashboardMount() {
      const app = document.getElementById('app');
      if (app) {
        app.hidden = false;
        app.setAttribute('data-mounted', 'true');
      }
      document.body.classList.remove('dashboard-booting');
      const overlay = document.getElementById('forceRefreshOverlay');
      if (overlay) overlay.classList.remove('active');
    }

    function dismissAppBootBanner() {
      const banner = document.getElementById('appBootBanner');
      if (banner) banner.classList.add('hidden');
    }

    function showDashboardBootError(err) {
      revealDashboardMount();
      const banner = document.getElementById('appBootBanner');
      if (banner) {
        banner.classList.remove('hidden');
        banner.classList.add('is-error');
        banner.textContent = 'Telemetry deferred \u2014 SSR dashboard fallback active.';
      }
      if (err) console.error('[dashboard] bootstrap error', err);
    }

    function bootstrapDashboard() {
      try {
        revealDashboardMount();
        closeAllDashboardModals();
        bindDashboardModalEscapeDismiss();
        if (!runGatekeeper()) return;
      // Demo UI initial state sync
      if (typeof window.__SV_DEMO__.mockHlTxCount !== 'number' || !Number.isFinite(window.__SV_DEMO__.mockHlTxCount)) {
        window.__SV_DEMO__.mockHlTxCount = 0; // Demo default: Shield Only
      }
      initSvTooltips();
      refreshAutoGuardBanner();
      if (shieldDemoRedAlertActive) applyShieldDemoUI();
      applySettlementLockdownDemoUI();
      const layoutLamp = document.getElementById('layoutMemoryLamp');
      const layoutState = document.getElementById('layoutMemoryState');
      if (layoutMemoryEnabled) {
        if (layoutLamp) layoutLamp.className = 'inline-block w-2.5 h-2.5 rounded-full bg-emerald-400';
        if (layoutState) layoutState.innerText = 'ON';
        const order = loadStoredGridLayoutOrder();
        if (order) applyGridLayoutOrder(order);
        const tradfiOrder = loadStoredTradFiLayoutOrder();
        if (tradfiOrder) applyTradFiLayoutOrder(tradfiOrder);
      } else {
        if (layoutLamp) layoutLamp.className = 'inline-block w-2.5 h-2.5 rounded-full bg-gray-500';
        if (layoutState) layoutState.innerText = 'OFF';
      }
      updateClocks();
      applyCapitalUsd(resolveVaultEquityUsd(), { forceInput: true, sanitize: true });
      setTradeMode('SHIELD');
      syncTradeModeButtonsFromEligibility();
      syncDemoWalletTxLevelUI();
      if (typeof refreshRoleEligibility === 'function') {
        refreshRoleEligibility();
      }
      renderActivePositions();
      syncHeaderVault();
      updateStep3BlockEconomics();
      updateMasterConsoleSlippage();
      applyStep1EmergencyState();
      syncDemoHubLamps();
      renderDemoRootToggleGrid();
      syncDemoXpUI();
      syncDemoPersonaRoleUI();
      refreshCriAndStatusHud();
      renderStep2MarketPanels({});
      setInterval(function() {
        if (toxicModeCooldownUntil > Date.now() || isToxicModeTripped(getToxicityRiskScore())) {
          updateMasterConsoleSlippage();
        }
      }, 1000);
      fetchData();
      if (typeof startHudStreamPoll === 'function') {
        startHudStreamPoll();
      }
      initDraggables();
      initTradFiDraggables();
      initResizers();
      setInterval(updateClocks, 1000);
      setInterval(fetchData, 20000);
      dismissAppBootBanner();
      } catch (err) {
        showDashboardBootError(err);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootstrapDashboard);
    } else {
      bootstrapDashboard();
    }`;

// src/ui/components/demo-drawer.ts
function renderDemoDrawerHtml(ctx) {
  const { escAttr: escAttr2, brandShield: brandShield2, STATUS_DICTIONARY: STATUS_DICTIONARY3, ROOT_DEFENSE_MATRIX_TOOLTIP_DESC: ROOT_DEFENSE_MATRIX_TOOLTIP_DESC2, ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL: ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL2 } = ctx;
  return `
  <div id="toxicModeBackdrop" class="toxic-mode-backdrop hidden" role="alertdialog" aria-modal="true" aria-labelledby="toxicModeTitle">
    <div class="toxic-mode-modal">
      <h2 id="toxicModeTitle">TOXIC MODE TRIPPED \u2014 ALL POSITIONS CLOSED &amp; ORDERS CANCELLED</h2>
      <p id="toxicModeSubtitle" class="text-sm" style="margin:0;color:#bae6fd;">Execution hard-locked. Cooldown active before re-arm.</p>
      <button type="button" class="demo-fault-btn" style="max-width:12rem;margin:1rem auto 0;" onclick="acknowledgeToxicModeModal()">ACKNOWLEDGE</button>
    </div>
  </div>

  <div id="demoHubBackdrop" class="demo-hub-backdrop demo-hub-drawer-backdrop hidden" aria-hidden="true" onclick="closeDemoControlHub(event)">
    <div class="demo-hub-modal demo-hub-drawer font-mono" onclick="event.stopPropagation()">
      <header class="demo-hub-modal-header">
        <div class="tour-modal-header-overlay" aria-hidden="true"></div>
        <button type="button" onclick="closeDemoControlHub()" class="tour-modal-close" aria-label="Close Demo Hub">\u2715</button>
        <div class="tour-modal-header-inner">
          <h2 class="tour-modal-title">\u{1F39B}\uFE0F Demo Control Hub</h2>
        </div>
      </header>
      <div class="demo-hub-modal-body">
        <div class="demo-hub-tabs" role="tablist" aria-label="Demo Control Hub views">
          <button type="button" id="demoHubTabToggles" class="demo-hub-tab is-active" role="tab" aria-selected="true" onclick="setDemoHubTab('toggles')">\u{1F39B}\uFE0F Risk Toggles</button>
          <button type="button" id="demoHubTabTelemetry" class="demo-hub-tab inline-flex-shield" role="tab" aria-selected="false" onclick="setDemoHubTab('telemetry')">${brandShield2("brand-shield-icon", 14)} 20-Root Telemetry</button>
        </div>
        <div class="demo-hub-tab-content">
        <div id="demoHubPaneToggles" class="demo-hub-pane">
          <p class="text-gray-400 mb-3" style="font-size:calc((0.7rem + 2px) * 1.15);">${STATUS_DICTIONARY3.DEMO_HUB.INTRO}</p>
          <div class="demo-cri-bar sv-tip" data-sv-tip="${escAttr2(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC2)}" data-sv-label="${escAttr2(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL2)}">
            <div class="flex justify-between items-center gap-2">
              <span class="font-black text-[#50D2C1]">${STATUS_DICTIONARY3.DEMO_HUB.CRI_TELEMETRY.label}</span>
              <span id="demoHubCriReadout" class="typo-num text-emerald-300">ROOT DEFENSE MATRIX: 100 / 100</span>
            </div>
            <div class="demo-cri-bar-track"><div id="demoHubCriFill" class="demo-cri-bar-fill" style="width:100%;background:#34d399"></div></div>
            <div class="flex flex-col gap-0.5 mt-2 text-[0.62rem] font-bold">
              <span id="demoHubDynSlReadout" class="typo-num text-[#50D2C1]">DYN-SL: \u2014 \xB7 MAX $350</span>
              <span id="demoHubSlippageReadout" class="typo-num text-gray-400">Soil: \u2014 \xB7 Max 0.5%</span>
            </div>
          </div>
          <div class="demo-cri-control-block demo-hub-risk-inject sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.label)}">
            <span class="demo-hub-tx-label">${STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.label}</span>
            <div class="demo-cri-preset-grid" role="group" aria-label="ROOT DEFENSE MATRIX quick presets">
              <button type="button" class="demo-cri-preset-btn sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presetTips.NOMINAL)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presets.NOMINAL)}" onclick="setDemoCriPreset('NOMINAL')">${STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presets.NOMINAL}</button>
              <button type="button" class="demo-cri-preset-btn sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presetTips.WARNING)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presets.WARNING)}" onclick="setDemoCriPreset('WARNING')">${STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presets.WARNING}</button>
              <button type="button" class="demo-cri-preset-btn is-toxic sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presetTips.TOXIC)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presets.TOXIC)}" onclick="setDemoCriPreset('TOXIC')">${STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presets.TOXIC}</button>
              <button type="button" class="demo-cri-preset-btn is-god sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presetTips.GOD)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presets.GOD)}" onclick="setDemoCriPreset('GOD')">${STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.presets.GOD}</button>
            </div>
            <button type="button" class="demo-cri-reset-btn" onclick="resetToxicLockAndCooldown()">${STATUS_DICTIONARY3.DEMO_HUB.CRI_CONTROL.resetBtn}</button>
          </div>
          <div class="demo-role-block sv-tip" data-sv-tip="Switch Demo Hub persona \u2014 Trader, Auditor (read-only), or Risk Manager (Javier)." data-sv-label="Demo Persona Role">
            <span class="demo-hub-tx-label">[ Demo Persona Role ]</span>
            <div id="demoRoleBanner" class="text-xs text-emerald-300 mt-1">[ TRADER MODE \xB7 ORDER ENTRY ENABLED ]</div>
            <div class="demo-role-options" role="group" aria-label="Demo persona role">
              <button type="button" id="demoRoleTrader" class="demo-role-btn is-active" onclick="setDemoPersonaRole('TRADER')">Trader</button>
              <button type="button" id="demoRoleAuditor" class="demo-role-btn role-auditor" onclick="setDemoPersonaRole('AUDITOR')">Auditor</button>
              <button type="button" id="demoRoleRisk" class="demo-role-btn role-risk" onclick="setDemoPersonaRole('RISK_MANAGER')">Risk Manager</button>
            </div>
          </div>
          <div id="demoFaultPanel" class="demo-fault-panel demo-hub-risk-inject hidden sv-tip" data-sv-tip="Javier-only 1-click fault injection sandbox for demo stress tests." data-sv-label="Inject Fault Sandbox Testing">
            <span class="demo-hub-tx-label">[ Inject Fault Sandbox Testing ]</span>
            <button type="button" class="demo-fault-btn" onclick="injectFaultPreset('HIGH_SLIPPAGE')">High Slippage</button>
            <button type="button" class="demo-fault-btn" onclick="injectFaultPreset('HIGH_VOLATILITY')">High Volatility</button>
            <button type="button" class="demo-fault-btn" onclick="injectFaultPreset('RISK_SCORE_SPIKE')">RiskScore Spike</button>
          </div>
          <div class="demo-xp-block demo-hub-risk-inject sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.XP_CONTROLS.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.XP_CONTROLS.label)}">
            <span class="demo-hub-tx-label">${STATUS_DICTIONARY3.DEMO_HUB.XP_CONTROLS.label}</span>
            <div class="demo-xp-row">
              <input type="number" id="demoXpInput" class="demo-xp-input" min="0" max="200" value="0" oninput="onDemoXpInputChange()" />
              <button type="button" class="demo-hub-tx-btn" onclick="adjustDemoXp(10)">${STATUS_DICTIONARY3.DEMO_HUB.XP_CONTROLS.presets.PLUS_10}</button>
              <button type="button" class="demo-hub-tx-btn" onclick="resetDemoXp()">${STATUS_DICTIONARY3.DEMO_HUB.XP_CONTROLS.presets.RESET}</button>
            </div>
            <div class="demo-cri-bar-track"><div id="demoXpFill" class="demo-cri-bar-fill" style="width:0%; background: linear-gradient(90deg, #34d399, #50D2C1);"></div></div>
            <div id="demoXpTierLabel" class="text-xs text-gray-400 mt-1">RPG Tier: BEGINNER \xB7 XP 0</div>
          </div>
          <div class="demo-hub-tx-block demo-hub-risk-inject sv-tip mb-3" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT_TOGGLES.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT_TOGGLES.label)}">
            <span class="demo-hub-tx-label">${STATUS_DICTIONARY3.DEMO_HUB.ROOT_TOGGLES.label}</span>
            <div id="demoRootToggleGrid" class="demo-root-toggle-grid" aria-label="20-Root CRI toggles"></div>
          </div>
          <div class="demo-hub-tx-block demo-hub-risk-inject sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.WALLET_TX_LEVEL.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.WALLET_TX_LEVEL.label)}">
            <span class="demo-hub-tx-label">${STATUS_DICTIONARY3.DEMO_HUB.WALLET_TX_LEVEL.label}</span>
            <div class="demo-hub-tx-options" role="group" aria-label="Wallet TX Level Override">
              <button type="button" id="hubTxLevel0" class="demo-hub-tx-btn is-active" onclick="setDemoWalletTxLevel(0)">${STATUS_DICTIONARY3.DEMO_HUB.WALLET_TX_LEVEL.options.SHIELD}</button>
              <button type="button" id="hubTxLevel5" class="demo-hub-tx-btn" onclick="setDemoWalletTxLevel(5)">${STATUS_DICTIONARY3.DEMO_HUB.WALLET_TX_LEVEL.options.TACTICAL}</button>
              <button type="button" id="hubTxLevel20" class="demo-hub-tx-btn" onclick="setDemoWalletTxLevel(20)">${STATUS_DICTIONARY3.DEMO_HUB.WALLET_TX_LEVEL.options.FLASH}</button>
            </div>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT8_SLIPPAGE.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT8_SLIPPAGE.label)}">${STATUS_DICTIONARY3.DEMO_HUB.ROOT8_SLIPPAGE.label}</span>
            <button type="button" onclick="toggleShieldDemo()" class="px-2 py-1 rounded border border-white/20 font-black" id="hubShieldState" style="font-size:calc((0.75rem + 2px) * 1.15);">NORMAL</button>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT10_SETTLEMENT.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT10_SETTLEMENT.label)}">${STATUS_DICTIONARY3.DEMO_HUB.ROOT10_SETTLEMENT.label}</span>
            <button type="button" onclick="toggleSettlementLockdownDemo()" class="px-2 py-1 rounded border border-white/20 font-black" id="hubSettlementState" style="font-size:calc((0.75rem + 2px) * 1.15);">Normal</button>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT11_FUNDING.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT11_FUNDING.label)}">${STATUS_DICTIONARY3.DEMO_HUB.ROOT11_FUNDING.label}</span>
            <button type="button" onclick="toggleFundingExtremeDemo()" class="px-2 py-1 rounded border border-white/20 font-black" id="hubFundingExtremeState" style="font-size:calc((0.75rem + 2px) * 1.15);">OFF</button>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT13_GATEKEEPER.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.ROOT13_GATEKEEPER.label)}">${STATUS_DICTIONARY3.DEMO_HUB.ROOT13_GATEKEEPER.label}</span>
            <button type="button" onclick="toggleGatekeeperDemo()" class="px-2 py-1 rounded border border-white/20 font-black" id="hubGatekeeperState" style="font-size:calc((0.75rem + 2px) * 1.15);">PASS</button>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.DEFCON1.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.DEFCON1.label)}">${STATUS_DICTIONARY3.DEMO_HUB.DEFCON1.label}</span>
            <button type="button" onclick="toggleDefcon1Demo()" class="px-2 py-1 rounded border border-red-500/50 text-red-300 font-black hover:bg-red-500/20" id="hubDefcon1State" style="font-size:calc((0.75rem + 2px) * 1.15);">OFF</button>
          </div>
          <button type="button" onclick="toggleDefcon1Demo()" id="hubDefcon1ToggleBtn" class="demo-hub-risk-inject mt-2 w-full px-3 py-2.5 rounded-lg border border-red-500/60 bg-red-950/50 text-red-200 font-black hover:bg-red-900/60 tracking-wide sv-tip" style="font-size:calc((0.75rem + 2px) * 1.15);" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.DEFCON1.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.DEMO_HUB.DEFCON1.toggleBtn)}">
            ${STATUS_DICTIONARY3.DEMO_HUB.DEFCON1.toggleBtn}
          </button>
        </div>
        <div id="demoHubPaneTelemetry" class="demo-hub-pane hidden">
          <p class="text-gray-400 mb-3" style="font-size:calc((0.7rem + 2px) * 1.15);">${STATUS_DICTIONARY3.DEMO_HUB.TELEMETRY_INTRO}</p>
          <div id="rootTelemetryGrid" class="root-telemetry-grid" aria-live="polite"></div>
        </div>
        </div>
      </div>
    </div>
  </div>`;
}
__name(renderDemoDrawerHtml, "renderDemoDrawerHtml");
var DEMO_DRAWER_SCRIPT = `    function applyShieldDemoUI() {
      const box = document.getElementById('marketSessionsBox');
      const msg = document.getElementById('shieldDemoMessage');
      const stateEl = document.getElementById('hubShieldState') || document.getElementById('shieldDemoState');
      const heartbeat = document.getElementById('marketHeartbeatBar');
      const sessionLabel = document.getElementById('heartbeatSessionLabel');
      const volState = document.getElementById('heartbeatVolState');
      const circuitLabel = document.getElementById('heartbeatCircuitLabel');

      if (shieldDemoRedAlertActive) {
        if (box) {
          box.classList.remove('dex-settlement-box');
          box.style.background = '#dc2626';
        }
        if (msg) msg.classList.remove('hidden');
        if (stateEl) stateEl.innerText = 'RED';
        if (heartbeat) {
          heartbeat.classList.add('is-extreme');
          heartbeat.classList.remove('is-safe', 'is-elevated');
        }
        if (sessionLabel) sessionLabel.textContent = 'Session: SHIELD LOCK';
        if (volState) volState.textContent = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.LOCKED.label;
        if (circuitLabel) circuitLabel.textContent = 'CIRCUIT TRIGGERED';
      } else {
        if (box) {
          box.classList.add('dex-settlement-box');
          box.style.background = '';
          box.style.color = '';
          box.style.borderColor = '';
          box.style.boxShadow = '';
        }
        if (msg) msg.classList.add('hidden');
        if (stateEl) stateEl.innerText = 'NORMAL';
      }
      applyDonDonIpDisplay();
    }

    function toggleShieldDemo() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      shieldDemoRedAlertActive = !shieldDemoRedAlertActive;
      applyShieldDemoUI();
      syncDemoHubLamps();
      refreshCriAndStatusHud();
      addLog(
        shieldDemoRedAlertActive
          ? SHIELD_DEMO_RED_ALERT_MSG
          : '[RISK DEADLOCK] Normal sessions restored.',
        'warn',
      );
    }

    function applySettlementLockdownDemoUI() {
      const box = document.getElementById('dexSettlementBox');
      const demoLamp = document.getElementById('settlementDemoLamp');
      const stateEl = document.getElementById('hubSettlementState') || document.getElementById('settlementLockdownDemoState');
      if (stateEl) {
        stateEl.innerText = settlementLockdownDemoActive ? 'Lockdown' : 'Normal';
      }
      if (box) {
        if (settlementLockdownDemoActive) {
          box.classList.add('settlement-demo-locked');
        } else {
          box.classList.remove('settlement-demo-locked');
        }
      }
      if (demoLamp) {
        if (settlementLockdownDemoActive) demoLamp.classList.remove('hidden');
        else demoLamp.classList.add('hidden');
      }
    }

    function toggleSettlementLockdownDemo() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      settlementLockdownDemoActive = !settlementLockdownDemoActive;
      applySettlementLockdownDemoUI();
      syncDemoHubLamps();
      refreshCriAndStatusHud();
      updateClocks();
      addLog(
        settlementLockdownDemoActive
          ? SETTLEMENT_LOCKDOWN_DEMO_MSG
          : '[UI] Settlement Lockdown Demo OFF \u2014 countdown restored.',
        'warn',
      );
    }

    function syncDemoHubLamps() {
      const hubShield = document.getElementById('hubShieldState');
      const hubSettle = document.getElementById('hubSettlementState');
      const hubFund = document.getElementById('hubFundingExtremeState');
      const hubGate = document.getElementById('hubGatekeeperState');
      const hubDefcon = document.getElementById('hubDefcon1State');
      const hubDefconBtn = document.getElementById('hubDefcon1ToggleBtn');
      if (hubShield) hubShield.innerText = shieldDemoRedAlertActive ? 'RED' : 'NORMAL';
      if (hubSettle) hubSettle.innerText = settlementLockdownDemoActive ? 'Lockdown' : 'Normal';
      if (hubFund) hubFund.innerText = fundingExtremeDemoActive ? 'ON' : 'OFF';
      if (hubGate) hubGate.innerText = gatekeeperDemoLocked ? 'LOCKED' : 'PASS';
      const forced = window.__SV_DEMO__.forceDefcon1 === true;
      if (hubDefcon) {
        hubDefcon.innerText = forced ? 'ON' : 'OFF';
        hubDefcon.className = forced
          ? 'px-2 py-1 rounded border border-red-400 text-red-200 text-xs font-black bg-red-600/40 animate-pulse'
          : 'px-2 py-1 rounded border border-red-500/50 text-red-300 text-xs font-black hover:bg-red-500/20';
      }
      if (hubDefconBtn) {
        hubDefconBtn.innerText = forced
          ? '[ \u{1F6A8} DEFCON 1 Mode: ON \u2014 Click to Clear ]'
          : '[ \u{1F6A8} Toggle DEFCON 1 Mode ]';
      }
      syncDemoWalletTxLevelUI();
    }

    function toggleDefcon1Demo() {
      if (typeof canToggleMasterBreaker === 'function' && !canToggleMasterBreaker(demoPersonaRole)) {
        addLog('[DEMO] Master Breaker toggles locked for current persona role', 'warn');
        return;
      }
      svDemoDispatch({ type: 'DEMO_TOGGLE_FORCE_DEFCON1' });
      applyStep1EmergencyState();
      syncDemoHubLamps();
      refreshCriAndStatusHud();
      addLog(
        window.__SV_DEMO__.forceDefcon1
          ? '[DEMO] DEFCON 1 / ALL-RED Mode FORCED ON \u2014 Step 1 left panel lockdown'
          : '[DEMO] DEFCON 1 / ALL-RED Mode cleared \u2014 auto thresholds restored',
        'warn',
      );
    }

    function openDemoControlHub() {
      const backdrop = document.getElementById('demoHubBackdrop');
      if (backdrop) backdrop.classList.remove('hidden');
      syncDemoHubLamps();
      renderDemoRootToggleGrid();
      syncDemoXpUI();
      refreshCriAndStatusHud();
      renderRootTelemetry();
    }

    function closeDemoControlHub(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      const backdrop = document.getElementById('demoHubBackdrop');
      if (backdrop) backdrop.classList.add('hidden');
    }

    function toggleFundingExtremeDemo() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      fundingExtremeDemoActive = !fundingExtremeDemoActive;
      const bar = document.getElementById('fundingRateKingsBar');
      if (bar) {
        if (fundingExtremeDemoActive) bar.classList.add('funding-extreme-demo');
        else bar.classList.remove('funding-extreme-demo');
      }
      syncDemoHubLamps();
      addLog(
        fundingExtremeDemoActive
          ? '[DEMO] Funding Extreme simulation ON \u2014 world-tree board highlighted'
          : '[DEMO] Funding Extreme simulation OFF',
        'warn',
      );
    }

    function toggleGatekeeperDemo() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      gatekeeperDemoLocked = !gatekeeperDemoLocked;
      syncDemoHubLamps();
      refreshCriAndStatusHud();
      if (gatekeeperDemoLocked) {
        addLog('[DEMO] Gatekeeper LOCKED simulation \u2014 valid ref still required on refresh', 'warn');
        if (!document.getElementById('gatekeeperDemoBanner')) {
          document.body.insertAdjacentHTML(
            'afterbegin',
            '<div id="gatekeeperDemoBanner" class="mb-3 p-3 rounded-xl text-center font-black" style="background:#0b1217;border:2px solid #50D2C1;color:#50D2C1;">\u{1F510} Gatekeeper Demo LOCKED \xB7 Use Demo Hub to restore PASS</div>',
          );
        }
      } else {
        const banner = document.getElementById('gatekeeperDemoBanner');
        if (banner) banner.remove();
        addLog('[DEMO] Gatekeeper PASS restored', 'info');
      }
    }

    function canMutateDemoRiskControls() {
      return typeof canEditRiskPresets === 'function'
        ? canEditRiskPresets(demoPersonaRole)
        : demoPersonaRole === 'RISK_MANAGER';
    }

    function resetDemoRootStatuses() {
      for (let r = 1; r <= 20; r++) setDevRootStatus(r, 'PASS');
    }

    function applyDemoRootTrips(rootNums) {
      resetDemoRootStatuses();
      (rootNums || []).forEach(function(r) { setDevRootStatus(r, 'TRIPPED'); });
    }

    function setDemoCriPreset(preset) {
      if (typeof canEditRiskPresets === 'function' && !canEditRiskPresets(demoPersonaRole)) {
        addLog('[DEMO] Risk preset overrides locked for current persona role', 'warn');
        return;
      }
      const p = String(preset || '').toUpperCase();
      svDemoDispatch({ type: 'DEMO_SET_FORCE_DEFCON1', value: false });
      if (p === 'NOMINAL') {
        resetDemoRootStatuses();
      } else if (p === 'WARNING') {
        applyDemoRootTrips([11, 6, 1, 2, 3]);
      } else if (p === 'TOXIC') {
        applyDemoRootTrips([11, 12, 13, 1]);
      } else if (p === 'GOD') {
        svDemoDispatch({ type: 'DEMO_SET_FORCE_DEFCON1', value: true });
        for (let r = 1; r <= 20; r++) setDevRootStatus(r, 'TRIPPED');
      }
      applyStep1EmergencyState();
      syncDemoHubLamps();
      renderDemoRootToggleGrid();
      refreshCriAndStatusHud();
      addLog('[DEMO] ROOT DEFENSE MATRIX preset applied: ' + p, 'success');
      pushExecLog('[DEMO] ROOT DEFENSE MATRIX preset \u2192 ' + p, 'ok');
    }

    function resetToxicLockAndCooldown() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      toxicModeCooldownUntil = 0;
      toxicModeModalShown = false;
      const backdrop = document.getElementById('toxicModeBackdrop');
      if (backdrop) backdrop.classList.add('hidden');
      if (getToxicityRiskScore() >= TOXIC_MODE_THRESHOLD) {
        setDemoCriPreset('WARNING');
        return;
      }
      refreshCriAndStatusHud();
      if (typeof updateMasterConsoleSlippage === 'function') updateMasterConsoleSlippage();
      addLog('[DEMO] Toxic Mode execution lock and cooldown cleared \u2014 standard execution restored', 'success');
      pushExecLog('[DEMO] Toxic lock & cooldown reset', 'ok');
    }

    function normalizeDevRootStatus(raw) {
      const v = String(raw || '').toUpperCase();
      if (v === 'TRIPPED' || v === 'WARN' || v === 'PASS') return v;
      return 'PASS';
    }

    function setDevRootStatus(rootNum, status) {
      window.__SV_DEMO__.rootStatus[rootNum] = normalizeDevRootStatus(status);
      window.__SV_DEMO__.rootTripped = window.__SV_DEMO__.rootTripped || {};
      window.__SV_DEMO__.rootTripped[rootNum] = window.__SV_DEMO__.rootStatus[rootNum] === 'TRIPPED';
    }

    function cycleDevRootStatus(rootNum) {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Root toggle locked for current persona role', 'warn');
        return normalizeDevRootStatus(window.__SV_DEMO__.rootStatus[rootNum]);
      }
      const current = normalizeDevRootStatus(window.__SV_DEMO__.rootStatus[rootNum]);
      const next = current === 'PASS' ? 'WARN' : (current === 'WARN' ? 'TRIPPED' : 'PASS');
      setDevRootStatus(rootNum, next);
      return next;
    }

    function collectRootStatusesForCri() {
      const statuses = {};
      for (let r = 1; r <= 20; r++) {
        statuses[r] = normalizeDevRootStatus(window.__SV_DEMO__.rootStatus[r]);
      }
      if (window.__SV_DEMO__.forceDefcon1 === true) {
        for (let r = 1; r <= 20; r++) statuses[r] = 'TRIPPED';
      }
      if (gatekeeperDemoLocked) statuses[13] = 'TRIPPED';
      if (shieldDemoRedAlertActive) statuses[8] = 'TRIPPED';
      if (settlementLockdownDemoActive) statuses[10] = 'TRIPPED';
      if (tsunamiShieldActive) statuses[10] = 'TRIPPED';
      if (typeof isMacroBlocking !== 'undefined' && isMacroBlocking) statuses[5] = 'TRIPPED';
      if (typeof lastVixValue === 'number' && lastVixValue > 20) statuses[5] = 'TRIPPED';
      if (typeof lastDvolValue === 'number' && lastDvolValue > 55) statuses[5] = 'TRIPPED';
      const rows = typeof globalData !== 'undefined' ? globalData : [];
      rows.forEach(function(row) {
        if (!row || !row.risk_tripped) return;
        const reasons = row.risk_reasons || [];
        if (reasons.indexOf('RISK_LIMIT_EXCEEDED') >= 0) {
          statuses[16] = 'TRIPPED';
        } else if (reasons.indexOf('SOIL_RESISTANCE') >= 0 || reasons.indexOf('INSUFFICIENT_DEPTH') >= 0) {
          statuses[3] = 'TRIPPED';
        }
      });
      const root17 = checkRoot17DailyLimit({
        accountEquityUsd: resolveAccountEquityUsd(),
        state: root17DailyState,
      });
      if (root17.tripped) statuses[17] = 'TRIPPED';
      return statuses;
    }

    function collectTrippedRootsForCri() {
      const tripped = [];
      const statuses = collectRootStatusesForCri();
      for (let r = 1; r <= 20; r++) {
        if (statuses[r] === 'TRIPPED') tripped.push(r);
      }
      return tripped;
    }

    function triggerToxicModeCircuitBreaker(riskScore) {
      if (!isToxicModeTripped(riskScore)) {
        toxicModeModalShown = false;
        return;
      }
      if (openPositions.length) {
        openPositions = [];
        renderActivePositions();
        pushExecLog('[TOXIC MODE] All open positions force-closed', 'err');
      }
      toxicModeCooldownUntil = Date.now() + TOXIC_MODE_COOLDOWN_MS;
      if (!toxicModeModalShown) {
        toxicModeModalShown = true;
        const backdrop = document.getElementById('toxicModeBackdrop');
        if (backdrop) backdrop.classList.remove('hidden');
        addLog('TOXIC MODE TRIPPED \u2014 ALL POSITIONS CLOSED & ORDERS CANCELLED', 'warn');
        pushExecLog('[TOXIC MODE] Circuit breaker engaged \xB7 execution cooldown started', 'err');
      }
      updateMasterConsoleSlippage();
    }

    function acknowledgeToxicModeModal() {
      const backdrop = document.getElementById('toxicModeBackdrop');
      if (backdrop) backdrop.classList.add('hidden');
    }

    function syncDemoPersonaRoleUI() {
      const banner = document.getElementById('demoRoleBanner');
      const faultPanel = document.getElementById('demoFaultPanel');
      const teleTab = document.getElementById('demoHubTabTelemetry');
      const cfg = (typeof DEMO_ROLE_CONFIG !== 'undefined' && DEMO_ROLE_CONFIG[demoPersonaRole])
        ? DEMO_ROLE_CONFIG[demoPersonaRole]
        : { banner: '[ TRADER MODE \xB7 ORDER ENTRY ENABLED ]', themeClass: 'role-trader', color: 'text-emerald-300' };
      if (banner) {
        banner.textContent = cfg.banner;
        const roleColors = { TRADER: 'text-emerald-300', AUDITOR: 'text-cyan-300', RISK_MANAGER: 'text-amber-300' };
        banner.className = 'text-xs mt-1 ' + (roleColors[demoPersonaRole] || 'text-emerald-300');
      }
      document.body.classList.remove('role-trader', 'role-auditor', 'role-risk-manager');
      document.body.classList.add(cfg.themeClass || 'role-trader');
      ['demoRoleTrader', 'demoRoleAuditor', 'demoRoleRisk'].forEach(function(id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.classList.remove('is-active');
      });
      const activeId = demoPersonaRole === 'AUDITOR' ? 'demoRoleAuditor'
        : (demoPersonaRole === 'RISK_MANAGER' ? 'demoRoleRisk' : 'demoRoleTrader');
      const activeBtn = document.getElementById(activeId);
      if (activeBtn) activeBtn.classList.add('is-active');
      if (faultPanel) {
        faultPanel.classList.toggle('hidden', !(typeof canAccessFaultInjection === 'function'
          ? canAccessFaultInjection(demoPersonaRole)
          : demoPersonaRole === 'RISK_MANAGER'));
      }
      if (teleTab) {
        const teleUnlocked = typeof canAccessTelemetryAudit === 'function'
          ? canAccessTelemetryAudit(demoPersonaRole)
          : (demoPersonaRole === 'AUDITOR' || demoPersonaRole === 'RISK_MANAGER');
        teleTab.disabled = !teleUnlocked;
        teleTab.setAttribute('aria-disabled', teleUnlocked ? 'false' : 'true');
        teleTab.title = teleUnlocked ? '' : 'Auditor or Risk Manager role required';
      }
      if (demoPersonaRole === 'AUDITOR') {
        setDemoHubTab('telemetry');
      } else if (demoPersonaRole === 'TRADER') {
        setDemoHubTab('toggles');
      }
      updateMasterConsoleSlippage();
    }

    function setDemoPersonaRole(role) {
      demoPersonaRole = typeof resolveDemoRole === 'function'
        ? resolveDemoRole(role)
        : (String(role || 'TRADER').toUpperCase() === 'AUDITOR' ? 'AUDITOR'
          : (String(role || '').toUpperCase() === 'RISK_MANAGER' || String(role || '').toUpperCase() === 'JAVIER'
            ? 'RISK_MANAGER' : 'TRADER'));
      syncDemoPersonaRoleUI();
      triggerDonDonLevelUp();
      pushExecLog('[ROLE] Demo persona \u2192 ' + demoPersonaRole, 'ok');
    }

    function injectFaultPreset(preset) {
      if (typeof canAccessFaultInjection === 'function'
        ? !canAccessFaultInjection(demoPersonaRole)
        : demoPersonaRole !== 'RISK_MANAGER') {
        addLog('[FAULT] Risk Manager (Javier) role required for sandbox injection', 'warn');
        return;
      }
      const id = String(preset || '').toUpperCase();
      if (id === 'HIGH_SLIPPAGE') {
        shieldDemoRedAlertActive = true;
        applyShieldDemoUI();
        setDevRootStatus(8, 'TRIPPED');
      } else if (id === 'HIGH_VOLATILITY') {
        svDemoDispatch({ type: 'DEMO_SET_FORCE_DEFCON1', value: true });
        setDevRootStatus(5, 'TRIPPED');
        syncDemoHubLamps();
      } else if (id === 'RISK_SCORE_SPIKE') {
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].forEach(function(r) {
          setDevRootStatus(r, 'TRIPPED');
        });
      }
      renderDemoRootToggleGrid();
      refreshCriAndStatusHud();
      pushExecLog('[FAULT] Injected preset: ' + id, 'warn');
    }

    function syncDemoXpUI() {
      const input = document.getElementById('demoXpInput');
      if (input) input.value = String(demoUserXp);
      const fill = document.getElementById('demoXpFill');
      if (fill) fill.style.width = Math.min(100, demoUserXp) + '%';
      const tierEl = document.getElementById('demoXpTierLabel');
      if (tierEl) {
        tierEl.textContent = 'RPG Tier: ' + resolveUserMode(demoUserXp) + ' \xB7 XP ' + demoUserXp;
      }
    }

    function onDemoXpInputChange() {
      if (!canMutateDemoRiskControls()) return;
      const input = document.getElementById('demoXpInput');
      const raw = input ? parseInt(String(input.value), 10) : 0;
      demoUserXp = Number.isFinite(raw) ? Math.max(0, Math.min(200, raw)) : 0;
      const prev = lastDemoXp;
      lastDemoXp = demoUserXp;
      syncDemoXpUI();
      const cri = refreshCriAndStatusHud().criScore;
      if (demoUserXp > prev && cri <= 25) triggerGrowthHudBurst();
    }

    function adjustDemoXp(delta) {
      demoUserXp = Math.max(0, Math.min(200, demoUserXp + Number(delta || 0)));
      onDemoXpInputChange();
    }

    function resetDemoXp() {
      demoUserXp = 0;
      lastDemoXp = 0;
      onDemoXpInputChange();
    }

    function syncDemoWalletTxLevelUI() {
      const raw = Number(window.__SV_DEMO__.mockHlTxCount);
      const tx = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
      const levels = [
        { id: 'hubTxLevel0', match: tx < 5 },
        { id: 'hubTxLevel5', match: tx >= 5 && tx < 20 },
        { id: 'hubTxLevel20', match: tx >= 20 },
      ];
      levels.forEach(function(row) {
        const el = document.getElementById(row.id);
        if (el) el.classList.toggle('is-active', row.match);
      });
    }

    function setDemoWalletTxLevel(level) {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Wallet TX override locked for current persona role', 'warn');
        return;
      }
      const n = Number(level);
      const tx = n >= 20 ? 20 : (n >= 5 ? 5 : 0);
      svDemoDispatch({ type: 'DEMO_SET_MOCK_HL_TX_COUNT', value: tx });
      syncDemoWalletTxLevelUI();
      refreshRoleEligibility().then(function(elig) {
        refreshAutoGuardBanner();
        const unlocked = (elig && elig.allowedModes) ? elig.allowedModes.join('/') : 'SHIELD';
        pushExecLog(
          '[DEMO] Wallet TX Level Override \u2192 ' + tx + ' TXs \xB7 unlocked roles: ' + unlocked,
          'ok'
        );
      });
    }

    function setDemoHubTab(tab) {
      if (tab === 'telemetry' && typeof canAccessTelemetryAudit === 'function'
        && !canAccessTelemetryAudit(demoPersonaRole)) {
        addLog('[DEMO] 20-Root Telemetry audit view requires Auditor or Risk Manager role', 'warn');
        tab = 'toggles';
      }
      const togglesPane = document.getElementById('demoHubPaneToggles');
      const telePane = document.getElementById('demoHubPaneTelemetry');
      const tabT = document.getElementById('demoHubTabToggles');
      const tabR = document.getElementById('demoHubTabTelemetry');
      const isTele = tab === 'telemetry';
      if (togglesPane) togglesPane.classList.toggle('hidden', isTele);
      if (telePane) telePane.classList.toggle('hidden', !isTele);
      if (tabT) {
        tabT.classList.toggle('is-active', !isTele);
        tabT.setAttribute('aria-selected', isTele ? 'false' : 'true');
      }
      if (tabR) {
        tabR.classList.toggle('is-active', isTele);
        tabR.setAttribute('aria-selected', isTele ? 'true' : 'false');
      }
      if (isTele) renderRootTelemetry();
    }

    function syncDemoHubMirrorReadouts(slip, softTier, isDanger) {
      const equity = resolveAccountEquityUsd();
      const maxSl = Number(systemState.dynamicMaxSL) || computeEffectiveMaxSlUsd(equity);
      const dynPct = dynamicMaxSlPct(masterOrderSizeUsd || equity, equity);
      const hubDyn = document.getElementById('demoHubDynSlReadout');
      const hubSlip = document.getElementById('demoHubSlippageReadout');
      if (hubDyn) {
        hubDyn.textContent = 'DYN-SL: ' + dynPct.toFixed(2) + '% \xB7 MAX $' + maxSl.toFixed(0) +
          ' @ $' + equity.toLocaleString();
      }
      if (hubSlip) {
        if (!selectedConsoleAsset) {
          hubSlip.textContent = 'Soil: \u2014 \xB7 Max ' + (MAX_SLIPPAGE * 100).toFixed(1) + '%';
        } else {
          hubSlip.textContent = 'Soil: ' + formatSlipPct(slip || 0) + ' \xB7 ' +
            (isDanger ? 'EXCEEDS MAX SL' : soilBadgeLabel(softTier)) +
            ' \xB7 Max ' + (MAX_SLIPPAGE * 100).toFixed(1) + '%';
        }
      }
    }`;

// src/ui/components/header-hud.ts
function renderHeaderHudHtml(ctx) {
  const { escAttr: escAttr2, BRAND_LOGO_DATA_URI: BRAND_LOGO_DATA_URI2, versionLabel, ROOT_DEFENSE_MATRIX_TOOLTIP_DESC: ROOT_DEFENSE_MATRIX_TOOLTIP_DESC2, ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL: ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL2 } = ctx;
  return `  <header class="terminal-header">
    <div class="terminal-header-top">
      <div class="flex items-center gap-3 flex-wrap">
        <a href="https://javier-dashboard-core.henry-astar1.workers.dev/" class="typo-action flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-circuit/20 hover:border-circuit/50 text-circuit rounded transition">
          &lt; Home
        </a>
        <div class="flex items-center gap-3">
          <img src="${BRAND_LOGO_DATA_URI2}" alt="SANTENBOKU cat shield" class="h-14 w-14 rounded-full object-cover brand-logo-ring bg-black" />
          <div>
            <h1 class="typo-title text-circuit leading-tight">
              SANTENBOKU / \u8518\u5929\u6728 / \u3055\u3093\u3066\u3093\u307C\u304F / \uC0BC\uCC9C\uBAA9
            </h1>
            <p class="typo-context text-copper tracking-[0.18em] mt-0.5">
              [ SECURED : RUNNING ] <span class="text-circuit/70">\xB7 SILVERVINE LABS \xB7 ${versionLabel}</span>
              <span id="headerPairCount" class="text-circuit/60"> \xB7 162 pairs live</span>
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end header-actions-right">
        <div id="topClock" class="typo-num text-circuit/70 bg-black/40 px-3 py-1.5 border border-circuit/20 rounded">\u{1F552} HKT: --/--/---- --:--:--</div>
        <button type="button" id="connectWalletBtn" onclick="connectWallet()" class="connect-wallet-btn typo-action">
          <span class="panel-emoji" style="font-size:1.1rem;">\u{1F98A}</span>
          <span id="connectWalletLabel">Connect Wallet</span>
        </button>
        <button type="button" id="headerMenuToggle" class="header-menu-toggle typo-action" onclick="toggleHeaderMenu()" aria-expanded="false" aria-controls="headerSecondaryActions">\u2630 Menu</button>
        <div id="headerSecondaryActions" class="header-secondary-actions">
          <div class="flex items-center border border-circuit/20 rounded overflow-hidden bg-black/30">
            <button onclick="adjustFontSize(-0.05)" class="typo-action px-3 py-1.5 text-circuit hover:bg-circuit/10 transition border-r border-circuit/20" title="Decrease font size">- A</button>
            <button onclick="adjustFontSize(0.05)" class="typo-action px-3 py-1.5 text-circuit hover:bg-circuit/10 transition" title="Increase font size">+ A</button>
          </div>
          <a href="__SHEET_LINK__" target="_blank" class="typo-action flex items-center gap-1.5 px-3 py-2 bg-circuit/15 hover:bg-circuit/25 text-circuit border border-circuit/40 rounded transition">
            Sheet
          </a>
          <button type="button" id="forceRefreshBtn" onclick="forceRefresh()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-circuit/15 border-2 border-circuit/50 text-circuit hover:bg-circuit/25 transition">
            <img id="forceRefreshCat" src="${BRAND_LOGO_DATA_URI2}" alt="" class="h-5 w-5 rounded-full object-cover hidden" />
            FORCE REFRESH
          </button>
          <span id="refreshStatus" class="typo-num text-gray-500">idle</span>
          <button type="button" id="demoControlHubBtn" onclick="openDemoControlHub()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-[#50D2C1]/50 text-[#50D2C1] hover:bg-[#50D2C1]/10 transition">
            Demo Control Hub
          </button>
          <button type="button" id="startTourBtn" onclick="openQuickTour()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition">
            5-Sec Quick Guide
          </button>
          <button type="button" id="layoutMemoryBtn" onclick="toggleLayoutMemory()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-circuit/30 text-circuit hover:bg-circuit/10 transition">
            Layout
            <span id="layoutMemoryLamp" class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span id="layoutMemoryState" class="px-2 py-0.5 rounded bg-white/5 border border-white/10">ON</span>
          </button>
          <button onclick="toggleTheme()" class="p-2 rounded border border-copper/40 hover:bg-copper/20 text-copper typo-action">
            <span class="panel-emoji">\u2600\uFE0F</span>/<span class="panel-emoji">\u{1F319}</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Legacy status mirrors (Market Heartbeat card lives in Step 1) -->
    <div id="globalStatusBar" class="hidden" aria-hidden="true">
      <div id="marketSessionsBox">
        <div id="shieldDemoMessage" class="hidden"></div>
      </div>
      <span id="heartbeatSessionLabel" class="hidden">Session: TOKYO</span>
      <span id="tsunamiShieldLamp" class="tsunami-shield-lamp hidden">SHIELD</span>
      <span id="settlementDemoLamp" class="tsunami-shield-lamp hidden">LOCKDOWN</span>
    </div>
    <div id="statusHudBar" class="risk-index-hud is-optimal" role="status" aria-live="polite">
      <div id="taijiBaguaOverlay" class="taiji-bagua-overlay">
        <span id="taijiModeBadge" class="taiji-mode-badge taiji-mode-yang sv-tip" tabindex="0" data-sv-tip="${escAttr2("Yang offensive engine \u2014 CRI \u2265 75, soil clear, signing channel open.")}" data-sv-label="Taiji Mode">\u262F TAIJI \xB7 YANG STRIKE</span>
        <span id="baguaGateBadge" class="bagua-gate-badge bagua-gate-qian sv-tip" tabindex="0" data-sv-tip="${escAttr2("Qian Gate (Hyperliquid Main Active): Yang offensive state. Full signature enabled.")}" data-sv-label="Bagua Gate">\u2630 QIAN \xB7 OPEN</span>
      </div>
      <span id="statusHudCri" class="risk-index-score sv-tip text-emerald-400" tabindex="0" data-sv-tip="${escAttr2(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC2)}" data-sv-label="${escAttr2(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL2)}" title="${escAttr2(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL2)}">ROOT DEFENSE MATRIX: 100 / 100</span>
      <div class="demo-cri-bar-track risk-index-bar-track"><div id="statusHudFill" class="demo-cri-bar-fill" style="width:100%;background:#34d399"></div></div>
      <span id="statusHudBadge" class="risk-index-badge sv-tip text-emerald-400" tabindex="0" data-sv-tip="${escAttr2(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC2)}" data-sv-label="${escAttr2(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL2)}" title="${escAttr2(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL2)}">[ STATUS: OPTIMAL / ALL ROOTS LOCKED ]</span>
    </div>
    <div class="dondon-ip-stage dondon-ip-stage--header" id="dondonIpStage" aria-label="DonDon IP Status Display">
      <div id="step1CondensedLog" class="step1-condensed-log" aria-live="polite">
        <div class="step1-condensed-log-line log-ok">[SYSTEM] Root Defense loop armed \xB7 awaiting target inject</div>
      </div>
      <div class="dondon-ip-frame" id="dondonIpFrame" data-dondon-state="NORMAL">
        <span id="dondonIpBadge" class="dondon-ip-badge">\u3061\u30EA\u30D6</span>
        <img
          id="bestHedgeDonDonAvatar"
          src="/brand/dondon_normal.png"
          alt="DonDon IP \u2014 Nominal Scan"
          class="dondon-ip-img dondon-state-normal"
          decoding="async"
        />
      </div>
    </div>
  </header>`;
}
__name(renderHeaderHudHtml, "renderHeaderHudHtml");
var HEADER_HUD_SCRIPT = "    const DONDON_IP = {\n      NORMAL: { asset: '/brand/dondon_normal.png', scale: 1.0, glow: '#00FFA3', badge: '\u3061\u30EA\u30D6', cssClass: 'dondon-state-normal' },\n      LEVEL_UP: { asset: '/brand/dondon_levelup.png', scale: 1.2, glow: '#00F0FF', badge: '\u3061\u30EA\u30D6 (+EXP)', cssClass: 'dondon-state-levelup' },\n      WARNING: { asset: '/brand/dondon_warning.png', scale: 1.4, glow: '#FFD700', badge: '\u8B66 \u544A', cssClass: 'dondon-state-warning' },\n      SHIELD: { asset: '/brand/dondon_defense.png', scale: 1.6, glow: '#00E676', badge: '\u9632 \u5FA1', cssClass: 'dondon-state-shield' },\n      HARD_LOCK: { asset: '/brand/dondon_deadlock.png', scale: 2.0, glow: '#FF0033', badge: '\u6B7B \u9396', cssClass: 'dondon-state-hardlock' },\n      GOD_MODE: { asset: '/brand/dondon_godmode.png', scale: 2.5, glow: '#FFD700', badge: '\u4E09\u5929\u76EE', cssClass: 'dondon-state-godmode' },\n      ORANGE_TARGET: { asset: '/brand/dondon_orangetarget.png', scale: 1.0, glow: '#FF8C00', badge: 'TARGET LOCK', cssClass: 'dondon-state-orangetarget' },\n    };\n\n    function recomputeRootDefenseMatrixState() {\n      const statuses = collectRootStatusesForCri();\n      const score = calculateRootDefenseMatrixFromStatuses(statuses);\n      const hardlock = score <= 0;\n      const equity = resolveAccountEquityUsd();\n      const dynamicMaxSL = computeEffectiveMaxSlUsd(equity);\n      if (typeof applySystemState === 'function') {\n        applySystemState({\n          accountBalanceUsd: equity,\n          currentCri: score,\n          dynamicMaxSL: dynamicMaxSL,\n          hudState: typeof resolveHudStateClient === 'function'\n            ? resolveHudStateClient(score, hardlock, true)\n            : systemState.hudState,\n          hardlock: hardlock,\n          signingChannelOpen: !hardlock,\n        });\n      }\n      return score;\n    }\n\n    function getRootDefenseMatrixScore() {\n      const cri = Number(systemState.currentCri);\n      return Math.max(0, Math.min(100, Number.isFinite(cri) ? Math.round(cri) : 0));\n    }\n\n    function getToxicityRiskScore() {\n      return Math.max(0, Math.min(100, 100 - getRootDefenseMatrixScore()));\n    }\n\n    function resolveRootDefenseMatrixFillColor(score) {\n      const s = Number.isFinite(score) ? score : 0;\n      if (s >= 80) return '#34d399';\n      if (s >= 50) return '#fbbf24';\n      return '#f87171';\n    }\n\n    function applyRootDefenseMatrixBarFill(el, score) {\n      if (!el) return;\n      const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));\n      el.style.width = s + '%';\n      el.style.background = resolveRootDefenseMatrixFillColor(s);\n    }\n\n    function getEffectiveRiskScore() {\n      return getToxicityRiskScore();\n    }\n\n    function clearDonDonTransient() {\n      dondonTransientKind = null;\n      if (dondonTransientTimer) {\n        clearTimeout(dondonTransientTimer);\n        dondonTransientTimer = null;\n      }\n    }\n\n    function resolveDonDonBaseState(riskScore) {\n      if (window.__SV_DEMO__.forceDefcon1 === true) return 'GOD_MODE';\n      if (isToxicModeTripped(riskScore)) return 'HARD_LOCK';\n      if (shieldDemoRedAlertActive || tsunamiShieldActive) return 'SHIELD';\n      if (riskScore >= TOXICITY_ELEVATED_THRESHOLD) return 'WARNING';\n      return 'NORMAL';\n    }\n\n    function applyDonDonIpDisplay(forceState) {\n      const avatar = document.getElementById('bestHedgeDonDonAvatar');\n      const badge = document.getElementById('dondonIpBadge');\n      const frame = document.getElementById('dondonIpFrame');\n      if (!avatar) return;\n\n      const riskScore = getEffectiveRiskScore();\n      let stateKey = forceState || resolveDonDonBaseState(riskScore);\n\n      if (isToxicModeTripped(riskScore) && window.__SV_DEMO__.forceDefcon1 !== true) {\n        stateKey = 'HARD_LOCK';\n        clearDonDonTransient();\n      } else if (!forceState && dondonTransientKind) {\n        stateKey = dondonTransientKind;\n      }\n\n      const cfg = DONDON_IP[stateKey] || DONDON_IP.NORMAL;\n      avatar.src = cfg.asset;\n      avatar.alt = 'DonDon IP \u2014 ' + String(stateKey).replace(/_/g, ' ');\n      Object.keys(DONDON_IP).forEach(function(k) {\n        avatar.classList.remove(DONDON_IP[k].cssClass);\n      });\n      avatar.classList.add(cfg.cssClass);\n      avatar.style.setProperty('--dondon-scale', String(cfg.scale));\n      avatar.style.setProperty('--dondon-glow', cfg.glow);\n      avatar.classList.toggle('dondon-avatar-toxic', stateKey === 'HARD_LOCK');\n      if (badge) badge.textContent = cfg.badge;\n      if (frame) frame.dataset.dondonState = stateKey;\n    }\n\n    function triggerDonDonTransient(kind, durationMs) {\n      if (isToxicModeTripped(getEffectiveRiskScore())) return;\n      clearDonDonTransient();\n      dondonTransientKind = kind;\n      applyDonDonIpDisplay();\n      dondonTransientTimer = setTimeout(function() {\n        dondonTransientKind = null;\n        dondonTransientTimer = null;\n        applyDonDonIpDisplay();\n      }, durationMs || 1750);\n    }\n\n    function triggerDonDonOrangeTarget() {\n      triggerDonDonTransient('ORANGE_TARGET', 1750);\n    }\n\n    function triggerDonDonLevelUp() {\n      triggerDonDonTransient('LEVEL_UP', 1750);\n    }\n\n    function applyDonDonAvatarForRisk(riskScore) {\n      applyDonDonIpDisplay();\n    }\n\n    function appendStep1CondensedLog(msg, type) {\n      const bar = document.getElementById('step1CondensedLog');\n      if (!bar) return;\n      const line = document.createElement('div');\n      line.className = 'step1-condensed-log-line' +\n        (type === 'warn' ? ' log-warn' : type === 'error' ? ' log-err' : ' log-ok');\n      const time = new Date().toLocaleTimeString();\n      line.textContent = '[' + time + '] ' + msg;\n      bar.appendChild(line);\n      while (bar.childNodes.length > 40) bar.removeChild(bar.firstChild);\n      bar.scrollTop = bar.scrollHeight;\n    }\n\n    function resolveClientTaijiBaguaContext() {\n      var soilTripped = false;\n      if (typeof resolveRoot8SlippageLock === 'function' && typeof selectedConsoleAsset !== 'undefined' && selectedConsoleAsset) {\n        var slip = typeof slipForNotionalDynamic === 'function'\n          ? slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd || 10000)\n          : 0;\n        var soilLock = resolveRoot8SlippageLock({\n          slipRatio: slip,\n          symbol: selectedConsoleAsset.symbol || selectedConsoleAsset.key,\n          hlSpot: selectedConsoleAsset.hlSpot,\n          hlPerp: selectedConsoleAsset.hlPerp,\n          dydxPerp: selectedConsoleAsset.dydxPerp,\n        });\n        soilTripped = !!soilLock;\n      }\n      return {\n        soilTripped: soilTripped,\n        isHedgeActive: systemState.isHedgeActive === true,\n      };\n    }\n\n    function syncTaijiBaguaOnSystemState() {\n      if (typeof enrichSystemStateTaijiBagua !== 'function') return systemState;\n      var ctx = resolveClientTaijiBaguaContext();\n      var enriched = enrichSystemStateTaijiBagua(systemState, ctx);\n      systemState.taijiMode = enriched.taijiMode;\n      systemState.activeGate = enriched.activeGate;\n      return enriched;\n    }\n\n    function refreshTaijiBaguaHud() {\n      var enriched = syncTaijiBaguaOnSystemState();\n      var taijiEl = document.getElementById('taijiModeBadge');\n      var gateEl = document.getElementById('baguaGateBadge');\n      if (!taijiEl || !gateEl || typeof TAIJI_MODE_UI === 'undefined' || typeof BAGUA_GATE_UI === 'undefined') return;\n      var taijiMode = enriched.taijiMode || 'YIN_YIELD';\n      var activeGate = enriched.activeGate || 'LI_BRIGHT';\n      var taijiCfg = TAIJI_MODE_UI[taijiMode] || TAIJI_MODE_UI.YIN_YIELD;\n      var gateCfg = BAGUA_GATE_UI[activeGate] || BAGUA_GATE_UI.LI_BRIGHT;\n      taijiEl.textContent = taijiCfg.label;\n      taijiEl.className = 'taiji-mode-badge sv-tip ' + taijiCfg.cssClass;\n      taijiEl.setAttribute('data-sv-tip', taijiCfg.tooltip);\n      taijiEl.setAttribute('data-sv-label', 'Taiji Mode \xB7 ' + taijiMode.replace('_', ' '));\n      gateEl.textContent = gateCfg.label;\n      gateEl.className = 'bagua-gate-badge sv-tip ' + gateCfg.cssClass;\n      gateEl.setAttribute('data-sv-tip', gateCfg.tooltip);\n      gateEl.setAttribute('data-sv-label', 'Bagua Gate \xB7 ' + gateCfg.shortLabel);\n    }\n\n    function refreshCriAndStatusHud(opts) {\n      if (criHudRefreshing) {\n        const cached = getRootDefenseMatrixScore();\n        return {\n          criScore: cached,\n          riskScore: Math.max(0, 100 - cached),\n          band: resolveRootDefenseMatrixBand(cached),\n          statuses: collectRootStatusesForCri(),\n        };\n      }\n      criHudRefreshing = true;\n      try {\n      opts = opts || {};\n      const statuses = collectRootStatusesForCri();\n      const defenseScore = recomputeRootDefenseMatrixState();\n      const band = resolveRootDefenseMatrixBand(defenseScore);\n      const hudCfg = ROOT_DEFENSE_MATRIX_HUD_CONFIG[band] || ROOT_DEFENSE_MATRIX_HUD_CONFIG.OPTIMAL;\n\n      const bar = document.getElementById('statusHudBar');\n      const criEl = document.getElementById('statusHudCri');\n      const badgeEl = document.getElementById('statusHudBadge');\n      if (bar) bar.className = 'risk-index-hud ' + hudCfg.cssClass;\n      if (criEl) {\n        criEl.textContent = formatRootDefenseMatrixLabel(defenseScore);\n        criEl.className = 'risk-index-score sv-tip ' + hudCfg.scoreClass;\n      }\n      if (badgeEl) {\n        badgeEl.textContent = hudCfg.badge;\n        badgeEl.className = 'risk-index-badge sv-tip ' + hudCfg.scoreClass;\n      }\n\n      applyRootDefenseMatrixBarFill(document.getElementById('statusHudFill'), defenseScore);\n\n      const hubReadout = document.getElementById('demoHubCriReadout');\n      const hubFill = document.getElementById('demoHubCriFill');\n      if (hubReadout) {\n        hubReadout.textContent = formatRootDefenseMatrixLabel(defenseScore);\n        hubReadout.className = 'typo-num ' + hudCfg.scoreClass;\n      }\n      applyRootDefenseMatrixBarFill(hubFill, defenseScore);\n\n      applyDonDonAvatarForRisk(getToxicityRiskScore());\n      triggerToxicModeCircuitBreaker(getToxicityRiskScore());\n      refreshTaijiBaguaHud();\n\n      if (typeof renderRootTelemetry === 'function') renderRootTelemetry();\n      if (typeof updateMasterConsoleSlippage === 'function') updateMasterConsoleSlippage();\n      return {\n        criScore: defenseScore,\n        riskScore: getToxicityRiskScore(),\n        band: band,\n        statuses: statuses,\n      };\n      } finally {\n        criHudRefreshing = false;\n      }\n    }\n\n    function triggerGrowthHudBurst() {\n      triggerDonDonLevelUp();\n      refreshCriAndStatusHud({ forceGrowth: true });\n      if (growthHudTimer) clearTimeout(growthHudTimer);\n      growthHudTimer = setTimeout(function() {\n        growthHudTimer = null;\n        refreshCriAndStatusHud();\n      }, 3000);\n    }";

// src/ui/components/order-entry.ts
function renderOrderEntryHtml(ctx) {
  const { escAttr: escAttr2, STATUS_DICTIONARY: STATUS_DICTIONARY3, initialMaxSlUsd, initialDynSlPct, brandShield: brandShield2 } = ctx;
  return `      </div>
      <div id="masterRiskConsole" class="sniper-panel font-mono">
        <div id="targetLockedBanner" class="target-locked-banner">\u{1F3AF} TARGET LOCKED</div>
        <header class="brand-hero-header brand-hero-header--section text-slate-950 font-bold">
          <button type="button" id="sopGuideBtn" onclick="openSopGuide()" class="sop-guide-trigger-btn" title="SOP Guide" aria-label="Open SOP Guide">\u2754</button>
          <div class="inject-header-stack flex flex-col gap-1.5 items-center justify-center p-3 pr-11">
            <div id="consoleSelectedLabel" class="inject-status-badge is-pending text-slate-950">\u23F3 Waiting for token inject\u2026</div>
            <p id="consoleInjectSubtitle" class="inject-header-subtitle text-xs font-mono tracking-wider uppercase font-semibold text-slate-900/80">
              CAPITAL . SOIL . ATTACK / Order size synced with Soil Resistance
            </p>
          </div>
        </header>
        <div class="sniper-stack master-risk-console-body">
          <div class="hardlock-badge-wrap">
            <span
              id="dynSlLockTag"
              class="merged-sl-badge sv-tip"
              data-sv-tip="${escAttr2(STATUS_DICTIONARY3.MAX_SL_WELD.desc)}"
              data-sv-label="${escAttr2(STATUS_DICTIONARY3.MAX_SL_WELD.label)}"
            >[ ${brandShield2("brand-shield-icon", 14)} MAX SL DYNAMIC WELD | DYN-SL: ${initialDynSlPct.toFixed(2)}% ($${initialMaxSlUsd.toFixed(0)} MAX LOSS) ]</span>
          </div>

          <!-- Order Size ABOVE Capital \u2014 visual ceiling before Capital sizing -->
          <div class="order-size-ceiling" id="orderSizeCeiling">
            <div class="mega-slider-wrap" id="orderSizeMegaSlider">
              <div class="mega-slider-title">
                <span class="typo-action">\u26A1 ORDER SIZE \xB7 MEGA SLIDER</span>
                <span id="consoleOrderSizeLabel" class="typo-num text-base font-black">$10,000</span>
              </div>
              <input type="range" id="masterOrderSizeSlider" class="master-slider" min="1000" max="25000" step="1000" value="10000" oninput="onMasterOrderSizeChange()" />
              <div class="flex justify-between typo-context mt-1">
                <span>$1K</span>
                <span id="orderSizeSliderMid">mid</span>
                <span id="orderSizeSliderMaxLabel">$25K</span>
              </div>
            </div>
            <div class="mt-2">
              <div class="typo-action mb-1">Soil Resistance</div>
              <div id="consoleSlippageReadout" class="typo-num font-bold">--</div>
              <div id="consoleSoilBadge" class="soil-badge soil-loose w-fit mt-1 sv-tip" data-sv-tip="${escAttr2(STATUS_DICTIONARY3.SOIL_RESISTANCE.LOOSE.desc)}" data-sv-label="${escAttr2(STATUS_DICTIONARY3.SOIL_RESISTANCE.LOOSE.label)}">[ ${STATUS_DICTIONARY3.SOIL_RESISTANCE.LOOSE.label} ]</div>
            </div>
          </div>

          <div class="grid gap-2" id="draggableGrid">
            <div id="block2" class="step3-econ-card bg-slate-950/90 border border-slate-800 rounded-lg p-2.5" style="order:1;">
              <div
                class="vault-balance-badge"
                id="step3VaultBar"
                title="Santenboku Vault Control \u2014 CAPITAL presets bind to this balance"
              >
                <div class="vault-balance-main">
                  <span class="vault-balance-label">VAULT BALANCE:</span>
                  <span class="vault-balance-value">$<span id="step3VaultEquity">25,000.00</span> USD</span>
                </div>
                <div class="vault-balance-meta">
                  <span>Open Pos: <span id="step3VaultPos">0</span></span>
                  <span class="vault-sep">\xB7</span>
                  <span>Live PnL: <span id="step3VaultLivePnl" class="step3-vault-pnl is-pos">+$0.00</span> <span id="step3VaultPnlEmoji">\u{1F7E2}</span></span>
                </div>
              </div>
              <div class="typo-action mb-1">Capital</div>
              <input type="number" id="capitalInput" value="25000" min="1" max="25000" step="100" oninput="onCapitalInputChange()" onblur="onCapitalInputBlur()"
                class="w-full bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded typo-num text-[#50D2C1] focus:outline-none focus:border-[#50D2C1]" />
              <div class="capital-presets" id="capitalAbsPresets">
                <button type="button" class="capital-preset-btn" data-capital="1000" onclick="setCapitalPreset(1000)">$1k</button>
                <button type="button" class="capital-preset-btn" data-capital="5000" onclick="setCapitalPreset(5000)">$5k</button>
                <button type="button" class="capital-preset-btn" data-capital="10000" onclick="setCapitalPreset(10000)">$10k</button>
                <button type="button" class="capital-preset-btn" data-capital="50000" onclick="setCapitalPreset(50000)">$50k</button>
              </div>
              <div class="capital-presets capital-vault-pcts" id="capitalVaultPctPresets" title="Allocate % of live Vault balance">
                <button type="button" class="capital-preset-btn capital-vault-pct-btn" data-vault-pct="25" onclick="setCapitalVaultPct(25)">25%</button>
                <button type="button" class="capital-preset-btn capital-vault-pct-btn" data-vault-pct="50" onclick="setCapitalVaultPct(50)">50%</button>
                <button type="button" class="capital-preset-btn capital-vault-pct-btn" data-vault-pct="75" onclick="setCapitalVaultPct(75)">75%</button>
                <button type="button" class="capital-preset-btn capital-vault-pct-btn is-active" data-vault-pct="100" onclick="setCapitalVaultPct(100)">100%</button>
              </div>
              <div id="block2CapitalDisplay" class="hidden">$25,000</div>
              <div id="walletMarginReadout" class="typo-context mt-1">Margin: connect wallet</div>
            </div>
            <div id="block3" class="step3-econ-card bg-slate-950/90 border border-slate-800 rounded-lg p-2.5" style="order:2;">
              <div class="typo-action mb-1">Friction %</div>
              <div class="relative">
                <input type="number" id="frictionInput" value="0.24" step="0.01" oninput="onStep3FrictionChange()" class="w-full bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded typo-num text-[#50D2C1] focus:outline-none focus:border-[#50D2C1]">
                <span class="absolute right-3 top-2 typo-context text-[#50D2C1]/70">%</span>
              </div>
            </div>
            <div id="block4" class="step3-econ-card bg-slate-950/90 border border-slate-800 rounded-lg p-2.5" style="order:3;" title="Gas fixed cost">
              <div class="typo-action mb-1">Gas</div>
              <div class="typo-num font-bold">$2.50</div>
              <input type="hidden" id="fixedCostInput" value="2.50" />
            </div>
            <div id="block5" class="step3-econ-card bg-slate-950/90 border border-slate-800 rounded-lg p-2.5" style="order:4;">
              <div class="typo-action mb-1 text-rose-300">Total Friction</div>
              <div class="typo-num font-bold text-rose-300" id="displayTotalFriction">$26.50</div>
            </div>
          </div>

          <div id="attackExecuteZone" class="attack-zone rounded-lg border border-slate-800 overflow-hidden">
            <div class="attack-zone-body flex flex-col gap-3 p-3">
              <div id="rootSlipProtectionStatus" class="root-slip-status">
                <div class="flex flex-col gap-1">
                  <span class="typo-action">Root Slip-Protection</span>
                  <span id="rootSlipBreakerLamp" class="typo-context font-bold">\u{1F7E2} Slip Breaker: ACTIVE | Max 0.5%</span>
                </div>
              </div>
              <div id="step4SopCard" class="hidden" aria-hidden="true"></div>
              <div id="attackExecuteRow" class="flex flex-col gap-2">
                <span id="attackWarning" class="typo-context font-bold">\u26A0\uFE0F Confirm Soil + Settlement countdown</span>
                <div class="flex items-center gap-2">
                  <span id="attackLockdownLabel" class="hidden typo-action text-red-300 border border-red-500/40 bg-red-950/60 px-2 py-1 rounded animate-pulse">\u{1F512} LOCKDOWN</span>
                  <button type="button" id="attackExecuteBtn" class="attack-btn attack-btn-xl w-full typo-action" onclick="executeAttackOrder()" disabled>
                    <img src="/brand/dondon-eyes.webp" alt="DonDon" class="attack-btn-dondon w-7 h-auto" />
                    <span id="attackExecuteBtnLabel">ATTACK / EXECUTE ORDER</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>`;
}
__name(renderOrderEntryHtml, "renderOrderEntryHtml");
var ORDER_ENTRY_SCRIPT = `    function resolveAccountEquityUsd() {
      return resolveVaultEquityUsd();
    }

    function resolveEffectiveMaxSlUsd() {
      return computeEffectiveMaxSlUsd(resolveAccountEquityUsd());
    }

    function formatDynSlLockTagHtml(orderSize) {
      const equity = resolveAccountEquityUsd();
      const maxSl = computeEffectiveMaxSlUsd(equity);
      return '[ ' + brandShieldImg('brand-shield-icon', 14) + ' MAX SL DYNAMIC WELD | DYN-SL: ' +
        dynamicMaxSlPct(orderSize, equity).toFixed(2) + '% ($' + maxSl.toFixed(0) + ' MAX LOSS) ]';
    }

    function formatMaxSlWeldLabel() {
      const maxSl = resolveEffectiveMaxSlUsd();
      return '[ R1: SL $' + maxSl.toFixed(0) + ' WELD ]';
    }

    function formatMaxSlWeldDesc() {
      const equity = resolveAccountEquityUsd();
      const maxSl = computeEffectiveMaxSlUsd(equity);
      return 'Dynamic capital protection limit. Effective Max SL = (Equity \xD7 1%) + $100 \u2192 $' +
        maxSl.toFixed(0) + ' at $' + equity.toLocaleString() + ' equity.';
    }

    function sanitizeCapitalUsd(raw) {
      const vault = resolveVaultEquityUsd();
      const n = typeof raw === 'number' ? raw : parseFloat(String(raw == null ? '' : raw).replace(/,/g, ''));
      if (!Number.isFinite(n) || n <= 0) return Math.min(10000, vault);
      return Math.min(n, vault);
    }

    function resolveOrderSizeMaxUsd(cap) {
      const vault = resolveVaultEquityUsd();
      const c = Math.min(sanitizeCapitalUsd(cap), vault);
      return Math.max(1000, Math.min(100000, c));
    }

    function clampOrderSizeUsd(size, cap) {
      const max = resolveOrderSizeMaxUsd(cap);
      const n = Number(size);
      if (!Number.isFinite(n) || n < 1000) return 1000;
      return Math.min(Math.max(n, 1000), max);
    }

    function dynamicMaxSlPctLocal(orderSize) {
      return dynamicMaxSlPct(orderSize, resolveAccountEquityUsd());
    }

    function exceedsMaxRiskBoundaryLocal(orderSize, slipRatio) {
      return exceedsMaxRiskBoundary({
        orderSizeUsd: orderSize,
        slipRatio: slipRatio,
        accountEquityUsd: resolveAccountEquityUsd(),
      });
    }

    function collectAutoGuards() {
      const mindsetClear = !(window.__SV_DEMO__.forceDefcon1 === true) && !isMacroBlocking && !(lastVixValue > 20 && lastDvolValue > 55);
      const vixDvolNormal = lastVixValue <= 22 && lastDvolValue <= 45;
      const targetLocked = !!selectedConsoleAsset;
      const settlementClear = !settlementLockdownActive && !settlementLockdownDemoActive;
      let soilSafe = true;
      if (selectedConsoleAsset) {
        const slip = slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd);
        soilSafe = !exceedsMaxRiskBoundaryLocal(masterOrderSizeUsd, slip);
      }
      return {
        mindsetClear: mindsetClear,
        vixDvolNormal: vixDvolNormal,
        targetLocked: targetLocked,
        settlementClear: settlementClear,
        soilSafe: soilSafe,
      };
    }

    function formatAutoGuardBannerLocal(mode, guards) {
      const unlocked = isStep3UnlockedFromGuards(mode, guards);
      const R = STATUS_DICTIONARY.ROOT_TAGS;
      if (mode === 'FLASH') {
        const flashLabel = (R.FLASH_ACTIVE && R.FLASH_ACTIVE.label) || '[ \u26A1 FLASH ACTIVE: SURVEY BYPASSED ]';
        const flashDesc = (R.FLASH_ACTIVE && R.FLASH_ACTIVE.desc) || STATUS_DICTIONARY.TRADE_MODES.FLASH.desc;
        const root1 = formatMaxSlWeldLabel();
        const root8 = R.ROOT8_SLIPPAGE_BREAKER.ok;
        const direct = (R.ROOT18_STEP3 && R.ROOT18_STEP3.direct) || '[ \u{1F513} STEP 3 DIRECT ACCESS \u{1F3AF} ]';
        return (
          '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(flashDesc) + '" data-sv-label="' + escapeTooltipHtml(flashLabel) + '">' + escapeTooltipHtml(flashLabel) + '</span> \xB7 ' +
          '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(formatMaxSlWeldDesc()) + '" data-sv-label="' + escapeTooltipHtml(root1) + '">' + escapeTooltipHtml(root1) + '</span> \xB7 ' +
          '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(R.ROOT8_SLIPPAGE_BREAKER.desc) + '" data-sv-label="' + escapeTooltipHtml(root8) + '">' + escapeTooltipHtml(root8) + '</span> -> ' +
          '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(R.ROOT18_STEP3.desc) + '" data-sv-label="' + escapeTooltipHtml(direct) + '">' + escapeTooltipHtml(direct) + '</span>'
        );
      }
      // Shield + Tactical: Root 5 / Root 10 / Root 3 -> Root 18 (dynamic lock explainers on trip states)
      const vixLabel = guards.vixDvolNormal ? R.ROOT5_VIX.pass : R.ROOT5_VIX.fail;
      const vixTip = guards.vixDvolNormal
        ? R.ROOT5_VIX.desc
        : (R.ROOT5_VIX.failDesc || R.ROOT5_MACRO_VOL.elevatedDesc || R.ROOT5_VIX.desc);
      const settLabel = guards.settlementClear ? R.ROOT10_SETTLEMENT.clear : R.ROOT10_SETTLEMENT.lockdown;
      const settTip = guards.settlementClear
        ? R.ROOT10_SETTLEMENT.desc
        : (R.ROOT10_SETTLEMENT.lockdownDesc || R.ROOT10_SETTLEMENT.desc);
      const soilLabel = guards.soilSafe ? R.ROOT3_SOIL.safe : R.ROOT3_SOIL.danger;
      const soilTip = guards.soilSafe
        ? R.ROOT3_SOIL.desc
        : (R.ROOT3_SOIL.dangerDesc || R.ROOT3_SOIL.desc);
      const tailLabel = unlocked ? R.ROOT18_STEP3.unlocked : R.ROOT18_STEP3.locked;
      return (
        '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(vixTip) + '" data-sv-label="' + escapeTooltipHtml(vixLabel) + '">' + escapeTooltipHtml(vixLabel) + '</span> \xB7 ' +
        '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(settTip) + '" data-sv-label="' + escapeTooltipHtml(settLabel) + '">' + escapeTooltipHtml(settLabel) + '</span> \xB7 ' +
        '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(soilTip) + '" data-sv-label="' + escapeTooltipHtml(soilLabel) + '">' + escapeTooltipHtml(soilLabel) + '</span> -> ' +
        '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(R.ROOT18_STEP3.desc) + '" data-sv-label="' + escapeTooltipHtml(tailLabel) + '">' + escapeTooltipHtml(tailLabel) + '</span>'
      );
    }

    function isStep3UnlockedFromGuards(mode, guards) {
      if (mode === 'FLASH') return true;
      if (mode === 'TACTICAL') {
        return !!(guards.vixDvolNormal && guards.settlementClear && guards.soilSafe);
      }
      // SHIELD: full automated safety pipeline (mindset + target + risk trio)
      return !!(
        guards.mindsetClear &&
        guards.vixDvolNormal &&
        guards.targetLocked &&
        guards.settlementClear &&
        guards.soilSafe
      );
    }

    function isStep3Unlocked() {
      return isStep3UnlockedFromGuards(tradeMode, collectAutoGuards());
    }

    function refreshAutoGuardBanner() {
      const guards = collectAutoGuards();
      const unlocked = isStep3UnlockedFromGuards(tradeMode, guards);
      const banner = document.getElementById('autoGuardBanner');
      const main = document.getElementById('autoGuardBannerMain');
      if (main) {
        main.innerHTML = formatAutoGuardBannerLocal(tradeMode, guards);
      } else if (banner) {
        banner.innerHTML = formatAutoGuardBannerLocal(tradeMode, guards);
      }
      if (banner) {
        let modeClass = ' is-locked';
        if (tradeMode === 'FLASH') modeClass = ' is-flash';
        else if (tradeMode === 'TACTICAL') modeClass = unlocked ? ' is-unlocked is-tactical' : ' is-locked is-tactical';
        else modeClass = unlocked ? ' is-unlocked' : ' is-locked';
        banner.className = 'auto-guard-banner' + modeClass;
      }
      refreshBannerHeatStatus();
      if (typeof updateMasterConsoleSlippage === 'function') {
        updateMasterConsoleSlippage();
      }
    }

    function assertFlashHardLocksLocal() {
      const locks = assertFlashHardLocks(resolveAccountEquityUsd());
      if (ROOT_DEFENSE_TELEMETRY[0]) ROOT_DEFENSE_TELEMETRY[0].status = 'ENGAGED';
      if (ROOT_DEFENSE_TELEMETRY[7]) ROOT_DEFENSE_TELEMETRY[7].status = 'ACTIVE';
      return locks;
    }

    function renderStep2MarketPanels(payload) {
      payload = payload || {};
      try {
        renderTradFiPanels(
          payload.commodities || {},
          payload.stocks || {},
          payload.indices || {},
          payload.fx || {},
          payload.preipo || {},
          payload.tradfi_enrichment || null
        );
      } catch (err) {
        addLog('[Step 2] TradFi panel render failed: ' + (err && err.message ? err.message : String(err)), 'warn');
        renderTradFiPanels({}, {}, {}, {}, {}, null);
      }
      try {
        renderFundingRateKings(payload.funding_rate_kings || null);
      } catch (err) {
        addLog('[Step 2] Funding kings render failed: ' + (err && err.message ? err.message : String(err)), 'warn');
        renderFundingRateKings(null);
      }
      try {
        renderCryptoWorldTreePanel();
      } catch (err) {
        addLog('[Step 2] Crypto world-tree render failed: ' + (err && err.message ? err.message : String(err)), 'warn');
        const cryptoEl = document.getElementById('cryptoPanel');
        if (cryptoEl) cryptoEl.innerHTML = '<span class="text-gray-500 typo-context">HL feed unavailable</span>';
      }
      try {
        renderPreLaunchSpotlight(cachedTradFiEnrichment);
      } catch (_) { /* optional spotlight */ }
    }

    function applyCapitalUsd(raw, opts) {
      const options = opts || {};
      capitalUsd = sanitizeCapitalUsd(raw);
      const capitalInput = document.getElementById('capitalInput');
      if (capitalInput) {
        capitalInput.max = String(resolveVaultEquityUsd());
        if (options.forceInput || sanitizeCapitalUsd(capitalInput.value) !== capitalUsd || options.sanitize) {
          capitalInput.value = String(capitalUsd);
        }
      }
      const block2 = document.getElementById('block2CapitalDisplay');
      if (block2) block2.innerText = '$' + capitalUsd.toLocaleString();
      refreshCapitalPresetsFromVault();
      // Re-bound mega slider max to capital \u2229 vault (capped $1k\u2013$100k)
      const slider = document.getElementById('masterOrderSizeSlider');
      const maxSize = resolveOrderSizeMaxUsd(capitalUsd);
      if (slider) {
        slider.min = '1000';
        slider.max = String(maxSize);
        slider.step = '1000';
      }
      const maxLabel = document.getElementById('orderSizeSliderMaxLabel');
      if (maxLabel) maxLabel.textContent = '$' + (maxSize >= 1000 ? (maxSize / 1000) + 'K' : maxSize);
      const midLabel = document.getElementById('orderSizeSliderMid');
      if (midLabel) {
        const mid = Math.round(maxSize / 2000) * 1000;
        midLabel.textContent = mid >= 1000 ? '$' + (mid / 1000) + 'K' : String(mid);
      }
      masterOrderSizeUsd = clampOrderSizeUsd(masterOrderSizeUsd, capitalUsd);
      syncOrderSizeUi(masterOrderSizeUsd);
      updateStep3BlockEconomics();
      updateMasterConsoleSlippage();
    }

    function setCapitalPreset(usd) {
      const vault = resolveVaultEquityUsd();
      const requested = typeof usd === 'number' ? usd : parseFloat(String(usd));
      if (Number.isFinite(requested) && requested > vault) {
        pushExecLog('[CAPITAL] $' + requested.toLocaleString() + ' exceeds vault $' + vault.toLocaleString() + ' \u2014 clamped', 'warn');
      }
      applyCapitalUsd(usd, { forceInput: true, sanitize: true });
      pushExecLog('[CAPITAL] Preset $' + sanitizeCapitalUsd(usd).toLocaleString() + ' / vault $' + vault.toLocaleString(), 'ok');
    }

    function setCapitalVaultPct(pct) {
      const vault = resolveVaultEquityUsd();
      const p = Math.max(0, Math.min(100, Number(pct) || 0));
      const usd = Math.round((vault * p) / 100);
      applyCapitalUsd(usd, { forceInput: true, sanitize: true });
      pushExecLog('[CAPITAL] Vault ' + p + '% \u2192 $' + sanitizeCapitalUsd(usd).toLocaleString() + ' of $' + vault.toLocaleString(), 'ok');
    }

    function onCapitalInputChange() {
      const capitalInput = document.getElementById('capitalInput');
      const raw = capitalInput ? capitalInput.value : '';
      if (raw === '' || raw === null) return; // wait for blur to sanitize empty
      const n = parseFloat(String(raw).replace(/,/g, ''));
      if (!Number.isFinite(n) || n <= 0) return;
      applyCapitalUsd(n, { forceInput: false });
    }

    function onCapitalInputBlur() {
      const capitalInput = document.getElementById('capitalInput');
      applyCapitalUsd(capitalInput ? capitalInput.value : '', { forceInput: true, sanitize: true });
    }

    function onMasterOrderSizeChange() {
      const slider = document.getElementById('masterOrderSizeSlider');
      if (!slider) return;
      masterOrderSizeUsd = clampOrderSizeUsd(parseFloat(slider.value) || 1000, capitalUsd);
      syncOrderSizeUi(masterOrderSizeUsd);
      updateStep3BlockEconomics();
      updateMasterConsoleSlippage();
    }

    function onStep3FrictionChange() {
      updateStep3BlockEconomics();
      // Friction affects table net7 columns \u2014 debounce-free light path: full recalc on blur-scale inputs
      recalculate();
      updateMasterConsoleSlippage();
    }

    function syncOrderSizeUi(usd) {
      const size = clampOrderSizeUsd(usd, capitalUsd);
      masterOrderSizeUsd = size;
      const label = document.getElementById('consoleOrderSizeLabel');
      if (label) label.innerText = '$' + size.toLocaleString();
      const slider = document.getElementById('masterOrderSizeSlider');
      if (slider && parseFloat(slider.value) !== size) {
        const stepped = Math.max(1000, Math.round(size / 1000) * 1000);
        const max = resolveOrderSizeMaxUsd(capitalUsd);
        slider.value = String(Math.min(stepped, max));
      }
      const dynTag = document.getElementById('dynSlLockTag');
      if (dynTag) {
        dynTag.innerHTML = formatDynSlLockTagHtml(size);
        applySvTip(
          dynTag,
          STATUS_DICTIONARY.MAX_SL_WELD.desc,
          STATUS_DICTIONARY.MAX_SL_WELD.label
        );
      }
    }

    function syncStep3CapitalUi(usd) {
      syncOrderSizeUi(usd);
    }

    function getStep3FrictionRate() {
      const el = document.getElementById('frictionInput');
      return (parseFloat(el && el.value) || 0.24) / 100;
    }

    function getStep3FixedCost() {
      const el = document.getElementById('fixedCostInput');
      return parseFloat(el && el.value) || 2.50;
    }

    function updateStep3BlockEconomics() {
      const capital = masterOrderSizeUsd || 10000;
      const frictionRate = getStep3FrictionRate();
      const fixedCost = getStep3FixedCost();
      const upfrontFrictionUSD = (capital * frictionRate) + fixedCost;
      const frictionBlockVal = document.getElementById('displayTotalFriction');
      if (frictionBlockVal) {
        frictionBlockVal.innerText = '$' + upfrontFrictionUSD.toFixed(2);
      }
      const bestProfitEl = document.getElementById('bestPairProfit');
      const bestProfit30El = document.getElementById('bestPairProfit30');
      if (cachedBestAprPct !== null && Number.isFinite(cachedBestAprPct)) {
        const dailyGrossProfit = capital * ((cachedBestAprPct / 100) / 365);
        const net7 = (dailyGrossProfit * 7) - upfrontFrictionUSD;
        const net30 = (dailyGrossProfit * 30) - upfrontFrictionUSD;
        if (bestProfitEl) bestProfitEl.innerText = '$' + net7.toFixed(2);
        if (bestProfit30El) bestProfit30El.innerText = '$' + net30.toFixed(2);
      }
    }

    function resolveAttackButtonState(slip) {
      const riskScore = getToxicityRiskScore();
      const lock = resolveAttackLock({
        hasTarget: !!selectedConsoleAsset,
        step3Unlocked: isStep3Unlocked(),
        withdrawableCollateral: withdrawableCollateralUsd,
        orderSizeUsd: masterOrderSizeUsd,
        slipRatio: slip || 0,
        accountEquityUsd: resolveAccountEquityUsd(),
        root17Tripped: isRoot17Blocking(),
        executionDisabled: typeof isExecutionDisabled === 'function' && isExecutionDisabled(),
        riskScore: riskScore,
        toxicCooldownUntil: toxicModeCooldownUntil,
        auditReadOnly: typeof canUseOrderEntry === 'function'
          ? !canUseOrderEntry(demoPersonaRole)
          : demoPersonaRole === 'AUDITOR',
      });
      return {
        locked: lock.locked,
        label: lock.label,
        reason: lock.reason,
        soilDanger: lock.reason === 'SOIL_EXCEEDS_MAX_SL',
      };
    }

    function updateMasterConsoleSlippage() {
      const readout = document.getElementById('consoleSlippageReadout');
      const badge = document.getElementById('consoleSoilBadge');
      const btn = document.getElementById('attackExecuteBtn');
      const btnLabel = document.getElementById('attackExecuteBtnLabel');
      const lockdownLabel = document.getElementById('attackLockdownLabel');
      const warn = document.getElementById('attackWarning');
      const dynTag = document.getElementById('dynSlLockTag');
      if (dynTag) {
        dynTag.innerHTML = formatDynSlLockTagHtml(masterOrderSizeUsd);
        applySvTip(
          dynTag,
          STATUS_DICTIONARY.MAX_SL_WELD.desc,
          STATUS_DICTIONARY.MAX_SL_WELD.label
        );
      }

      const slip = selectedConsoleAsset
        ? slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd)
        : 0;
      const softTier = soilTierFromOrderSize(masterOrderSizeUsd);
      const attackState = resolveAttackButtonState(slip);
      const isDanger = attackState.soilDanger;

      if (warn) warn.classList.remove('hidden');

      if (!selectedConsoleAsset) {
        if (readout) readout.innerText = '--';
        if (badge) {
          badge.className = soilBadgeClass(softTier) + ' w-fit';
          badge.innerText = soilBadgeLabel(softTier);
          applySoilBadgeTip(badge, softTier);
        }
      } else {
        if (readout) {
          readout.innerText = formatSlipPct(slip) + ' @ $' + masterOrderSizeUsd.toLocaleString() +
            ' \xB7 risk $' + (masterOrderSizeUsd * slip).toFixed(2);
          readout.style.color = isDanger ? '#f87171' : (softTier === 'WARNING' ? '#fbbf24' : '#45C4B4');
        }
        if (badge) {
          if (isDanger) {
            badge.className = soilBadgeClass('DANGER') + ' w-fit';
            badge.innerText = '[ ' + STATUS_DICTIONARY.SOIL_RESISTANCE.LOOSE.label + ' \xB7 EXCEEDS $' +
              resolveEffectiveMaxSlUsd().toFixed(0) + ' RISK ] \u{1F534}';
            applySoilBadgeTip(badge, 'DANGER');
          } else {
            badge.className = soilBadgeClass(softTier) + ' w-fit';
            badge.innerText = soilBadgeLabel(softTier);
            applySoilBadgeTip(badge, softTier);
          }
        }
      }

      const consoleBox = document.getElementById('masterRiskConsole');
      const attackZone = document.getElementById('attackExecuteZone');
      if (consoleBox) {
        if (isDanger) consoleBox.classList.add('attack-armed');
        else consoleBox.classList.remove('attack-armed');
      }
      if (attackZone) {
        if (isDanger) attackZone.classList.add('attack-armed');
        else attackZone.classList.remove('attack-armed');
      }
      if (btn) {
        btn.disabled = attackState.locked;
        if (attackState.locked) btn.classList.add('attack-locked');
        else btn.classList.remove('attack-locked');
        if (isDanger) {
          const soil = STATUS_DICTIONARY.ROOT_TAGS.ROOT3_SOIL;
          applySvTip(btn, soil.dangerDesc || soil.desc, soil.danger || attackState.label);
        }
      }
      if (btnLabel) btnLabel.innerText = attackState.label;
      if (lockdownLabel) {
        if (isDanger || attackState.reason === 'INSUFFICIENT_MARGIN') lockdownLabel.classList.remove('hidden');
        else lockdownLabel.classList.add('hidden');
      }

      const marginReadout = document.getElementById('walletMarginReadout');
      if (marginReadout && connectedWalletAddress) {
        const ok = withdrawableCollateralUsd >= masterOrderSizeUsd;
        marginReadout.textContent = 'Withdrawable: $' + withdrawableCollateralUsd.toLocaleString() +
          ' \xB7 Required: $' + masterOrderSizeUsd.toLocaleString() + (ok ? '' : ' \xB7 SHORT');
        marginReadout.className = 'typo-context mt-1 ' + (ok ? 'text-emerald-300' : 'text-rose-300');
      }
      if (typeof refreshGatekeeperDefenseMatrix === 'function') {
        refreshGatekeeperDefenseMatrix();
      }
      syncDemoHubMirrorReadouts(slip, softTier, isDanger);
    }

    function executeAttackOrder() {
      if (typeof canUseOrderEntry === 'function' ? !canUseOrderEntry(demoPersonaRole) : demoPersonaRole === 'AUDITOR') {
        addLog('[AUDIT READ-ONLY MODE] Execution disabled for Auditor persona', 'warn');
        return;
      }
      if (guardExecutionDisabledAction()) return;
      if (!isStep3Unlocked()) {
        addLog('[ATTACK BLOCKED] Complete mode gates before Step 3', 'warn');
        pushExecLog('[ROOT] Step 3 locked \u2014 mode gate incomplete', 'warn');
        return;
      }
      if (!selectedConsoleAsset) {
        addLog('[ATTACK] Inject a token into the master console first', 'warn');
        return;
      }
      const label = resolveAssetLabel(selectedConsoleKey, selectedConsoleAsset);
      const slip = slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd);
      const attackState = resolveAttackButtonState(slip);
      if (attackState.reason === 'INSUFFICIENT_MARGIN') {
        addLog('[ATTACK BLOCKED] INSUFFICIENT MARGIN \xB7 collateral $' + withdrawableCollateralUsd.toLocaleString() + ' < $' + masterOrderSizeUsd.toLocaleString(), 'warn');
        pushExecLog('[MARGIN GUARD] ATTACK denied \u2014 insufficient withdrawable collateral', 'err');
        updateMasterConsoleSlippage();
        return;
      }
      if (attackState.reason === 'SOIL_EXCEEDS_MAX_SL') {
        const maxSl = resolveEffectiveMaxSlUsd();
        addLog('[ATTACK BLOCKED] SOIL DANGER: EXCEEDS $' + maxSl.toFixed(0) + ' RISK \xB7 slip ' + formatSlipPct(slip) + ' \xB7 $' + (masterOrderSizeUsd * slip).toFixed(2), 'warn');
        pushExecLog('[ROOT 3/7] Soil friction exceeds $' + maxSl.toFixed(0) + ' Effective Max SL \u2014 ATTACK physically locked', 'err');
        updateMasterConsoleSlippage();
        return;
      }
      if (attackState.locked) {
        addLog('[ATTACK BLOCKED] ' + attackState.label, 'warn');
        return;
      }

      const dynPct = dynamicMaxSlPct(masterOrderSizeUsd);
      addLog('[ATTACK ARMED] DonDon locked ' + label + ' \xB7 size $' + masterOrderSizeUsd.toLocaleString() + ' \xB7 DYN-SL ' + dynPct.toFixed(2) + '% \xB7 slip ' + formatSlipPct(slip), 'success');
      pushExecLog('[ATTACK] Injected ' + label + ' \xB7 size $' + masterOrderSizeUsd.toLocaleString() + ' \xB7 friction ' + formatSlipPct(slip) + ' \xB7 ' + formatDynSlLockTag(masterOrderSizeUsd), 'ok');
      pushExecLog('[ROOT 14] ClOID Deduplication READY \xB7 ticket #' + nextPositionId, 'ok');

      openPositions.push({
        id: nextPositionId++,
        symbol: label,
        sizeUsd: masterOrderSizeUsd,
        dynSlPct: dynPct,
        pnlUsd: Math.round((20 + Math.random() * 140) * 100) / 100,
        openedAt: Date.now(),
      });
      const vaultLast = document.getElementById('vaultLastAttack');
      if (vaultLast) vaultLast.innerText = label + ' \xB7 $' + masterOrderSizeUsd.toLocaleString();
      renderActivePositions();
      updateMasterConsoleSlippage();
    }`;

// src/ui/components/telemetry-matrix.ts
var TELEMETRY_MATRIX_SCRIPT = `    function renderDemoRootToggleGrid() {
      const grid = document.getElementById('demoRootToggleGrid');
      if (!grid) return;
      grid.innerHTML = '';
      for (let r = 1; r <= 20; r++) {
        const status = normalizeDevRootStatus(window.devRootStatus[r]);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'demo-root-toggle-btn' +
          (status === 'TRIPPED' ? ' is-tripped' : (status === 'WARN' ? ' is-warn' : ''));
        btn.textContent = 'R' + r + (status === 'WARN' ? '!' : '');
        btn.setAttribute('aria-pressed', status !== 'PASS' ? 'true' : 'false');
        btn.title = 'Cycle PASS \u2192 WARN \u2192 TRIPPED';
        btn.onclick = function() { toggleDemoRootTrip(r); };
        grid.appendChild(btn);
      }
    }

    function toggleDemoRootTrip(rootNum) {
      const n = Number(rootNum);
      if (!Number.isFinite(n) || n < 1 || n > 20) return;
      const next = cycleDevRootStatus(n);
      renderDemoRootToggleGrid();
      const snapshot = refreshCriAndStatusHud();
      pushExecLog('[DEMO] Root ' + n + ' \u2192 ' + next +
        ' \xB7 ' + formatRiskIndexLabel(snapshot.riskScore), next === 'TRIPPED' ? 'warn' : 'ok');
    }

    function refreshGatekeeperDefenseMatrix() {
      const heatScoreEl = document.getElementById('gkHeatScore');
      const heatScoreRight = document.getElementById('liveVolHeatScore');
      const heatMeta = document.getElementById('liveVolHeatMeta');
      const gasEl = document.getElementById('gkGasReadout');
      const frEl = document.getElementById('gkFrictionReadout');
      const slipEl = document.getElementById('gkSlipReadout');
      const geoPill = document.getElementById('gkStatusGeo');
      const slipPill = document.getElementById('gkStatusSlippage');
      const slPill = document.getElementById('gkStatusSl');

      const state = lastHeatState || 'safe';
      refreshBannerHeatStatus();
      const scoreText = Number.isFinite(lastHeatScore) ? lastHeatScore.toFixed(1) : '--';
      if (heatScoreEl) heatScoreEl.textContent = scoreText;
      if (heatScoreRight) heatScoreRight.textContent = scoreText;
      if (heatMeta) {
        heatMeta.textContent = state === 'extreme'
          ? 'Heat score \xB7 CIRCUIT RISK ELEVATED'
          : (state === 'elevated' ? 'Heat score \xB7 caution zone' : 'Heat score \xB7 VIX / DVOL composite');
      }
      if (gasEl) gasEl.textContent = '$' + (getStep3FixedCost ? getStep3FixedCost() : 2.5).toFixed(2);
      if (frEl) {
        const rate = getStep3FrictionRate ? getStep3FrictionRate() : 0.0024;
        frEl.textContent = (rate * 100).toFixed(2) + '%';
      }
      let slipRatio = null;
      if (slipEl) {
        if (selectedConsoleAsset && typeof slipForNotionalDynamic === 'function') {
          slipRatio = slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd || 10000);
          slipEl.textContent = (slipRatio * 100).toFixed(3) + '%';
        } else {
          slipEl.textContent = 'standby';
        }
      }

      // Root 2 GEO LOCK defaults to PASS in client UI (server enforces restricted geos).
      const geoOk = true;
      // Root 8 physical slippage breaker: 0.5% max limit (Flash hard-weld included).
      const slipCeil = (tradeMode === 'FLASH' ? FLASH_HARD_LOCKS.maxSlippage : 0.005);
      const slipOk = !(Number.isFinite(slipRatio) && slipRatio > slipCeil);
      const R = STATUS_DICTIONARY.ROOT_TAGS;
      if (geoPill) {
        geoPill.className = 'gk-status-pill sv-tip' + (geoOk ? '' : ' is-fail');
        geoPill.textContent = geoOk ? R.ROOT2_GEO_LOCK.ok : R.ROOT2_GEO_LOCK.fail;
        applySvTip(
          geoPill,
          geoOk ? R.ROOT2_GEO_LOCK.desc : (R.ROOT2_GEO_LOCK.lockDesc || R.ROOT2_GEO_LOCK.desc),
          geoOk ? R.ROOT2_GEO_LOCK.ok : R.ROOT2_GEO_LOCK.fail
        );
      }
      if (slipPill) {
        slipPill.className = 'gk-status-pill sv-tip' + (slipOk ? '' : ' is-fail');
        slipPill.textContent = slipOk ? R.ROOT8_SLIPPAGE_BREAKER.ok : R.ROOT8_SLIPPAGE_BREAKER.fail;
        applySvTip(
          slipPill,
          slipOk ? R.ROOT8_SLIPPAGE_BREAKER.desc : (R.ROOT8_SLIPPAGE_BREAKER.tripDesc || R.ROOT8_SLIPPAGE_BREAKER.desc),
          slipOk ? R.ROOT8_SLIPPAGE_BREAKER.ok : R.ROOT8_SLIPPAGE_BREAKER.fail
        );
      }
      if (slPill) {
        slPill.className = 'gk-status-pill sv-tip';
        slPill.textContent = formatMaxSlWeldLabel();
        applySvTip(slPill, formatMaxSlWeldDesc(), formatMaxSlWeldLabel());
      }
      refreshCriAndStatusHud();
    }

    function renderRootTelemetry() {
      const grid = document.getElementById('rootTelemetryGrid');
      if (!grid || rootTelemetryRendering) return;
      rootTelemetryRendering = true;
      try {
      ROOT_DEFENSE_TELEMETRY[2].status = 'ACTIVE';
      ROOT_DEFENSE_TELEMETRY[6].status = 'ENGAGED';
      ROOT_DEFENSE_TELEMETRY[13].status = 'READY';
      ROOT_DEFENSE_TELEMETRY[18].status = 'ACTIVE';
      ROOT_DEFENSE_TELEMETRY[19].status = 'ACTIVE';
      const root17Check = checkRoot17DailyLimit({
        accountEquityUsd: resolveAccountEquityUsd(),
        state: root17DailyState,
      });
      if (ROOT_DEFENSE_TELEMETRY[16]) {
        ROOT_DEFENSE_TELEMETRY[16].status = root17Check.tripped ? 'TRIPPED' : 'READY';
        ROOT_DEFENSE_TELEMETRY[16].label = 'Daily Drawdown Cap ($' +
          root17Check.maxDailyLossUsd.toFixed(0) + ' \xB7 3 SL/day)';
      }
      const tips = STATUS_DICTIONARY.ROOT_TELEMETRY_TIPS || {};
      const labels = STATUS_DICTIONARY.ROOT_TELEMETRY_LABELS || {};
      const tiers = STATUS_DICTIONARY.ROOT_TELEMETRY_TIERS || {};
      const statusMap = collectRootStatusesForCri();
      const trippedSet = {};
      Object.keys(statusMap).forEach(function(k) {
        if (statusMap[k] === 'TRIPPED') trippedSet[k] = true;
      });
      const byRoot = {};
      ROOT_DEFENSE_TELEMETRY.forEach(function(row) {
        byRoot[row.root] = row;
      });
      const tierOrder = ['TIER1', 'TIER2', 'TIER3', 'TIER4'];
      const tierCardClass = function(rootNum) {
        if (rootNum <= 6) return 'is-tier1';
        if (rootNum <= 12) return 'is-tier2';
        if (rootNum <= 16) return 'is-tier3';
        return 'is-tier4';
      };
      grid.innerHTML = tierOrder.map(function(key) {
        const tier = tiers[key];
        if (!tier) return '';
        const accent = String(tier.accent || 'emerald');
        const rowsHtml = (tier.roots || []).map(function(rootNum) {
          const row = byRoot[rootNum];
          if (!row) return '';
          const tipRaw = tips[rootNum] || tips[String(rootNum)] || ('Root ' + rootNum + ' defense algorithm status.');
          const nameRaw = labels[rootNum] || labels[String(rootNum)] || row.label || ('Root ' + rootNum);
          const tip = tooltipPrimitive(tipRaw);
          const name = tooltipPrimitive(nameRaw);
          const displayLabel = 'R' + rootNum + ': ' + name;
          const tooltipLabel = 'Root ' + rootNum + ': ' + name;
          const tripped = !!trippedSet[rootNum];
          const status = tripped ? 'TRIPPED' : tooltipPrimitive(row.status || 'READY');
          return '<div class="root-telemetry-row sv-tip ' + tierCardClass(rootNum) +
            (tripped ? ' is-tripped' : '') + '" tabindex="0" data-sv-tip="' + escapeTooltipHtml(tip) +
            '" data-sv-label="' + escapeTooltipHtml(tooltipLabel) + '">' +
            '<span>' + escapeTooltipHtml(displayLabel) + '</span>' +
            '<span class="root-telemetry-status ' + status + '">[' + status + ']</span>' +
          '</div>';
        }).join('');
        return (
          '<section class="root-telemetry-tier is-' + escapeTooltipHtml(accent) + '" aria-label="' + escapeTooltipHtml(tooltipPrimitive(tier.title || tier.header)) + '">' +
            '<header class="root-telemetry-tier-header">' +
              '<span class="root-telemetry-tier-badge">' + escapeTooltipHtml(tooltipPrimitive((tier.emoji ? tier.emoji + ' ' : '') + (tier.badge || ''))) + '</span>' +
              '<span class="root-telemetry-tier-title">' + escapeTooltipHtml(tooltipPrimitive(tier.header || tier.title)) + '</span>' +
              '<span class="root-telemetry-tier-focus">' + escapeTooltipHtml(tooltipPrimitive(tier.focus || '')) + '</span>' +
            '</header>' +
            '<div class="root-telemetry-tier-body">' + rowsHtml + '</div>' +
          '</section>'
        );
      }).join('');
      } finally {
        rootTelemetryRendering = false;
      }
    }

    function pushExecLog(msg, kind) {
      const stream = document.getElementById('execLogStream');
      appendStep1CondensedLog(msg, kind === 'warn' ? 'warn' : kind === 'err' ? 'error' : 'ok');
      if (!stream) return;
      const line = document.createElement('div');
      line.className = 'log-line' + (kind === 'warn' ? ' log-warn' : kind === 'err' ? ' log-err' : ' log-ok');
      const time = new Date().toLocaleTimeString();
      line.textContent = '[' + time + '] ' + msg;
      stream.appendChild(line);
      while (stream.childNodes.length > 120) stream.removeChild(stream.firstChild);
      stream.scrollTop = stream.scrollHeight;
    }`;

// src/ui/components/ui-helpers.ts
var BRAND_FAVICON_SRC = "/brand/favicon.webp";
function escAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
__name(escAttr, "escAttr");
function brandShield(cls = "brand-shield-icon", size = 16) {
  return `<img src="${BRAND_FAVICON_SRC}" alt="" class="${cls}" width="${size}" height="${size}" decoding="async" />`;
}
__name(brandShield, "brandShield");
function brandShieldImg(cls = "brand-shield-icon", size = 16) {
  return brandShield(cls, size);
}
__name(brandShieldImg, "brandShieldImg");
var UI_HELPERS_SCRIPT = `    function jsOnclickArg(value) {
      return JSON.stringify(String(value == null ? '' : value)).replace(/"/g, '&quot;');
    }

    function tooltipPrimitive(value) {
      if (value == null) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      if (typeof value === 'object') {
        if (typeof value.desc === 'string') return value.desc;
        if (typeof value.label === 'string') return value.label;
        if (typeof value.text === 'string') return value.text;
        try { return JSON.stringify(value); } catch (_) { return ''; }
      }
      try { return String(value); } catch (_) { return ''; }
    }

    function escapeTooltipHtml(value) {
      const text = tooltipPrimitive(value);
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /** Radix-style floating tooltip for [data-sv-tip] / .sv-tip nodes */
    function initSvTooltips() {
      let root = document.getElementById('svTooltipRoot');
      if (!root) {
        root = document.createElement('div');
        root.id = 'svTooltipRoot';
        root.setAttribute('role', 'tooltip');
        root.setAttribute('data-state', 'closed');
        root.hidden = true;
        document.body.appendChild(root);
      }
      let activeEl = null;
      let hideTimer = null;

      function hideTip() {
        activeEl = null;
        root.setAttribute('data-state', 'closed');
        root.hidden = true;
        root.innerHTML = '';
      }

      function showTip(el) {
        const tip = el.getAttribute('data-sv-tip');
        if (!tip) return;
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        activeEl = el;
        const label = el.getAttribute('data-sv-label');
        root.innerHTML =
          (label ? '<span class="sv-tip-label">' + escapeTooltipHtml(label) + '</span>' : '') +
          escapeTooltipHtml(tip);
        root.hidden = false;
        root.setAttribute('data-state', 'open');
        const rect = el.getBoundingClientRect();
        const tipRect = root.getBoundingClientRect();
        let left = rect.left + (rect.width / 2) - (tipRect.width / 2);
        let top = rect.top - tipRect.height - 10;
        if (top < 8) top = rect.bottom + 10;
        left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
        root.style.left = left + 'px';
        root.style.top = top + 'px';
      }

      document.addEventListener('mouseover', function(e) {
        const el = e.target && e.target.closest ? e.target.closest('[data-sv-tip], .sv-tip') : null;
        if (!el || !el.getAttribute('data-sv-tip')) return;
        showTip(el);
      });
      document.addEventListener('mouseout', function(e) {
        const el = e.target && e.target.closest ? e.target.closest('[data-sv-tip], .sv-tip') : null;
        if (!el || el !== activeEl) return;
        const related = e.relatedTarget;
        if (related && el.contains(related)) return;
        hideTimer = setTimeout(hideTip, 80);
      });
      document.addEventListener('focusin', function(e) {
        const el = e.target && e.target.closest ? e.target.closest('[data-sv-tip], .sv-tip') : null;
        if (el && el.getAttribute('data-sv-tip')) showTip(el);
      });
      document.addEventListener('focusout', function() {
        hideTimer = setTimeout(hideTip, 80);
      });
      window.addEventListener('scroll', hideTip, true);
    }

    function applySvTip(el, desc, label) {
      if (!el) return;
      el.classList.add('sv-tip');
      if (desc != null) el.setAttribute('data-sv-tip', tooltipPrimitive(desc));
      if (label != null) el.setAttribute('data-sv-label', tooltipPrimitive(label));
    }

    function setDashboardModalOpen(backdropId, open) {
      const backdrop = document.getElementById(backdropId);
      if (!backdrop) return;
      if (open) {
        backdrop.classList.remove('hidden');
        backdrop.setAttribute('aria-hidden', 'false');
      } else {
        backdrop.classList.add('hidden');
        backdrop.setAttribute('aria-hidden', 'true');
      }
    }

    function closeAllDashboardModals() {
      [
        'legalModalBackdrop',
        'quickTourBackdrop',
        'sopGuideBackdrop',
        'demoHubBackdrop',
        'walletModalBackdrop',
        'toxicModeBackdrop',
      ].forEach(function(id) {
        setDashboardModalOpen(id, false);
      });
    }

    function bindDashboardModalEscapeDismiss() {
      document.addEventListener('keydown', function(event) {
        if (event.key !== 'Escape') return;
        closeLegalModal();
        closeQuickTour();
        closeSopGuide();
        if (typeof closeDemoControlHub === 'function') closeDemoControlHub();
        if (typeof closeWalletModal === 'function') closeWalletModal();
      });
    }`;

// src/ui/dashboard.ts
var GATEKEEPER_REF_WHITELIST = [
  "grant.santenbokui",
  "0xhyperliquid",
  "0xwallet"
];
var GATEKEEPER_AUTH_STORAGE_KEY = "sv_gatekeeper_auth";
function isValidWalletRef(ref) {
  if (typeof ref !== "string") return false;
  const value = ref.trim();
  if (!value) return false;
  const lower = value.toLowerCase();
  if (GATEKEEPER_REF_WHITELIST.some((pass) => pass.toLowerCase() === lower)) {
    return true;
  }
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}
__name(isValidWalletRef, "isValidWalletRef");
function renderRestrictedAccess(version) {
  return `<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SILVERVINE LABS | PRIVATE BETA ACCESS \xB7 ${version}</title>
  <link rel="icon" href="/brand/favicon.webp" type="image/webp">
  <link rel="icon" href="/brand/favicon.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(ellipse at center, rgba(80, 210, 193, 0.12), transparent 55%),
        #051311;
      color: #e8fff0;
      font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .card {
      max-width: 560px;
      width: calc(100% - 2rem);
      text-align: center;
      border: 2px solid rgba(80, 210, 193, 0.45);
      background: rgba(11, 18, 23, 0.92);
      border-radius: 1rem;
      padding: 2rem 1.5rem;
      box-shadow: 0 0 40px rgba(80, 210, 193, 0.2);
    }
    h1 {
      color: #50D2C1;
      font-size: 1.15rem;
      letter-spacing: 0.04em;
      margin: 0 0 0.75rem;
      font-weight: 900;
    }
    p { margin: 0.5rem 0; line-height: 1.5; }
    code { color: #50D2C1; }
    .gate-hero {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 1rem;
    }
    .gate-hero-img {
      width: 160px;
      height: 160px;
      max-width: 160px;
      aspect-ratio: 1 / 1;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0px 0px 16px rgba(80, 210, 193, 0.35));
    }
    @media (max-width: 480px) {
      .gate-hero-img {
        width: 120px;
        height: 120px;
        max-width: 120px;
      }
    }
    .gate-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.25rem;
      text-align: left;
    }
    .gate-form label {
      font-size: 0.75rem;
      font-weight: 800;
      color: #9ca3af;
      letter-spacing: 0.02em;
    }
    .gate-input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.85rem 1rem;
      border-radius: 0.75rem;
      border: 2px solid rgba(80, 210, 193, 0.45);
      background: rgba(0, 0, 0, 0.45);
      color: #e8fff0;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 700;
      outline: none;
    }
    .gate-input:focus {
      border-color: #50D2C1;
      box-shadow: 0 0 0 3px rgba(80, 210, 193, 0.2);
    }
    .gate-error {
      display: none;
      margin: 0;
      color: #f87171;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .gate-error.visible { display: block; }
    .unlock-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      width: 100%;
      box-sizing: border-box;
      padding: 0.85rem 1.25rem;
      border-radius: 0.75rem;
      font-weight: 900;
      font-size: 0.9rem;
      letter-spacing: -0.02em;
      text-decoration: none;
      transition: filter 0.15s, transform 0.15s;
      cursor: pointer;
      font-family: inherit;
      border: 2px solid #50D2C1;
      background: #50D2C1;
      color: #051311;
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.35);
    }
    .unlock-btn:hover {
      filter: brightness(1.06);
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="gate-hero">
      <img
        src="/brand/dondon_gateway.webp"
        alt="SilverVine Private Beta Gateway"
        class="gate-hero-img"
        width="160"
        height="160"
        decoding="async"
      />
    </div>
    <h1>SILVERVINE LABS | PRIVATE BETA ACCESS</h1>
    <p style="font-weight:800;font-size:0.95rem;">Internal quant risk-control beta terminal. Enter your authorized Pass to continue.</p>
    <p style="color:#9ca3af;font-size:0.8rem;">Whitelist Pass / Wallet Ref Example: <code>0x...</code> (40-char hex address)</p>
    <form class="gate-form" id="gateForm" autocomplete="off">
      <label for="gatePassInput">Pass Key / Wallet Address</label>
      <input
        id="gatePassInput"
        class="gate-input"
        type="password"
        name="ref"
        placeholder="Enter Pass Key or 0x Wallet Address..."
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        required
      />
      <p id="gateError" class="gate-error" role="alert">Invalid Pass or wallet address. Enter a whitelist pass or valid 0x wallet.</p>
      <button type="submit" class="unlock-btn">[ \u{1F513} UNLOCK TRADING TERMINAL ]</button>
    </form>
  </div>
  <script>
    (function () {
      var WHITELIST = ${JSON.stringify([...GATEKEEPER_REF_WHITELIST])};
      var AUTH_KEY = ${JSON.stringify(GATEKEEPER_AUTH_STORAGE_KEY)};
      function isValidRef(ref) {
        if (typeof ref !== 'string') return false;
        var value = ref.trim();
        if (!value) return false;
        var lower = value.toLowerCase();
        for (var i = 0; i < WHITELIST.length; i++) {
          if (String(WHITELIST[i]).toLowerCase() === lower) return true;
        }
        return /^0x[a-fA-F0-9]{40}$/.test(value);
      }
      function readStoredAuth() {
        try {
          return localStorage.getItem(AUTH_KEY);
        } catch (e) {
          return null;
        }
      }
      function writeStoredAuth(value) {
        try {
          localStorage.setItem(AUTH_KEY, value);
        } catch (e) { /* private mode / quota */ }
      }
      var stored = readStoredAuth();
      if (isValidRef(stored)) {
        window.location.href = '/?ref=' + encodeURIComponent(String(stored).trim());
        return;
      }
      var form = document.getElementById('gateForm');
      var input = document.getElementById('gatePassInput');
      var errorEl = document.getElementById('gateError');
      if (!form || !input) return;
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = String(input.value || '').trim();
        if (!isValidRef(value)) {
          if (errorEl) errorEl.classList.add('visible');
          input.focus();
          return;
        }
        if (errorEl) errorEl.classList.remove('visible');
        writeStoredAuth(value);
        window.location.href = '/?ref=' + encodeURIComponent(value);
      });
      input.addEventListener('input', function () {
        if (errorEl) errorEl.classList.remove('visible');
      });
      input.focus();
    })();
  <\/script>
</body>
</html>`;
}
__name(renderRestrictedAccess, "renderRestrictedAccess");
function buildDashboardContext(options) {
  const sheetBase = options.sheetLink ?? options.telemetryLink;
  const sheetHref = sheetBase.includes("?") ? sheetBase : `${sheetBase}?gid=0#gid=0`;
  const defaultVaultEquity = 25e3;
  return {
    versionLabel: options.version,
    sheetHref,
    escAttr,
    brandShield,
    brandShieldImg,
    STATUS_DICTIONARY,
    STRATEGY_DICTIONARY,
    METRICS_DICTIONARY,
    ROOT_DEFENSE_MATRIX_TOOLTIP_DESC,
    ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL,
    BRAND_LOGO_DATA_URI,
    BRAND_BANNER_DATA_URI,
    initialMaxSlUsd: computeEffectiveMaxSlUsd(defaultVaultEquity),
    initialDynSlPct: dynamicMaxSlPct(1e4, defaultVaultEquity)
  };
}
__name(buildDashboardContext, "buildDashboardContext");
function resolveClientScriptTokens(script) {
  return script.replaceAll("__SV_GATEKEEPER_AUTH_KEY__", JSON.stringify(GATEKEEPER_AUTH_STORAGE_KEY)).replaceAll("__SV_GATEKEEPER_WHITELIST__", JSON.stringify([...GATEKEEPER_REF_WHITELIST]));
}
__name(resolveClientScriptTokens, "resolveClientScriptTokens");
function assembleDashboardClientScript(initialSystemState, injectedRuntime, rootTelemetryJson) {
  return resolveClientScriptTokens(`
    /** Master English Status Dictionary \u2014 injected from src/config/statusDictionary.ts */
    const STATUS_DICTIONARY = ${statusDictionaryJson()};
    const STRATEGY_DICTIONARY = ${strategyDictionaryJson()};
    const METRICS_DICTIONARY = ${metricsDictionaryJson()};

    /** Shared risk / role / CRI runtime \u2014 sourced from step1-engine + client-runtime.ts */
    ${injectedRuntime}

    let systemState = ${initialSystemState};
    ${DASHBOARD_STORE_SCRIPT}
    ${RISK_CLIENT_CORE_SCRIPT}
    ${HUD_CLIENT_SCRIPT}

    const ROOT_DEFENSE_TELEMETRY = ${rootTelemetryJson};

    ${DASHBOARD_SHELL_HEAD_SCRIPT}

    ${UI_HELPERS_SCRIPT}

    ${DEMO_DRAWER_SCRIPT}

    ${HEADER_HUD_SCRIPT}

    ${ORDER_ENTRY_SCRIPT}

    ${TELEMETRY_MATRIX_SCRIPT}

    ${DASHBOARD_SHELL_TAIL_SCRIPT}
  `);
}
__name(assembleDashboardClientScript, "assembleDashboardClientScript");
function renderDashboard(options) {
  const ctx = buildDashboardContext(options);
  const initialSystemState = serializeSystemStateForClient(buildSystemState());
  const injectedRuntime = clientRuntimeScript();
  const rootTelemetryJson = JSON.stringify(ROOT_DEFENSE_TELEMETRY);
  const clientScript = assembleDashboardClientScript(
    JSON.stringify(initialSystemState),
    injectedRuntime,
    rootTelemetryJson
  );
  return `
<!DOCTYPE html>
<html lang="zh-HK" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SANTENBOKU / \u8518\u5929\u6728 \xB7 ${ctx.versionLabel}</title>
  <link rel="icon" href="/brand/favicon.webp" type="image/webp">
  <link rel="icon" href="/brand/favicon.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/dashboard.css">
  <style>
${DASHBOARD_INLINE_STYLES}
  </style>
</head>
${renderDashboardShellHtml(ctx)}
${renderHeaderHudHtml(ctx)}
${renderDemoDrawerHtml(ctx)}
${renderDashboardShellMidHtml(ctx)}
${renderOrderEntryHtml(ctx)}
${renderDashboardShellTailHtml(ctx)}
  <div id="svTooltipRoot" role="tooltip" data-state="closed" hidden></div>
  <script>${clientScript}
  <\/script>
</body>
</html>
`.replaceAll("__SHEET_LINK__", ctx.sheetHref);
}
__name(renderDashboard, "renderDashboard");

// src/api/page.ts
function handlePageRequest(env, request) {
  const config = resolveConfig(env);
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref");
  if (!isValidWalletRef(ref)) {
    return new Response(renderRestrictedAccess(config.version), {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
  const html = renderDashboard({
    telemetryLink: config.telemetryHealthPath,
    version: config.version
  });
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(handlePageRequest, "handlePageRequest");

// src/api/routes/telemetry.ts
function resolveSoilResistanceStatus(state) {
  if (isR20Locked(state) || state.hardlock) return "LOCKED";
  if (state.isHedgeActive) return "PASS";
  return "STANDBY";
}
__name(resolveSoilResistanceStatus, "resolveSoilResistanceStatus");
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
    counterAttackStatus: readCounterAttackTelemetryStatus(state)
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: CORS_JSON_HEADERS
  });
}
__name(handleTelemetryHealthRequest, "handleTelemetryHealthRequest");

// src/api/middleware/og-preview.ts
var GRANT_AUDIT_VERSION_HEADER = "X-SliverVine-Version";
var GRANT_AUDIT_DEFENSE_HEADER = "X-Defense-Matrix";
var GRANT_AUDIT_VERSION = "v0.8-santenmoku";
var GRANT_AUDIT_DEFENSE_MATRIX = "20-Roots-Active";
var PUBLIC_AUDIT_ENDPOINTS = [
  "/api/telemetry/health",
  "/api/state",
  "/api/data",
  "/api/hedge/evaluate"
];
var DEFAULT_ORIGIN = "https://slivervine.xyz";
var DEFAULT_OG_IMAGE = `${DEFAULT_ORIGIN}/og/grant-audit-card.png`;
var ENDPOINT_COPY = {
  "/api/telemetry/health": {
    title: "SliverVine Grant Audit \u2014 Live Telemetry",
    description: "Public CRI index, soil resistance status, active venues, and circuit breaker health."
  },
  "/api/state": {
    title: "SliverVine Grant Audit \u2014 System State",
    description: "Authoritative Pgate system snapshot for grant auditor verification."
  },
  "/api/data": {
    title: "SliverVine Grant Audit \u2014 Matrix Data",
    description: "Cross-venue arbitrage matrix feed with risk tripped flags for auditor review."
  },
  "/api/hedge/evaluate": {
    title: "SliverVine Grant Audit \u2014 Tail Hedge Evaluation",
    description: "Polymarket tail-hedge trigger evaluation gated by unified Pgate policy."
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
    siteName: "SliverVine Protocol",
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
console.log("[slivervine] routes initialized");
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
    if ((url.pathname === "/" || url.pathname === "/index.html") && request.method === "GET") {
      return applyGrantAuditHeaders(handlePageRequest(env, request));
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
    rootProtection({
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
    rootProtection({
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
function toPriceBasisRows(rows) {
  return rows.filter((row) => row.b1_symbol && row.d1_hl_perp > 0).map((row) => ({
    symbol: row.b1_symbol,
    hlSpot: row.c1_hl_spot,
    hlPerp: row.d1_hl_perp,
    basisSp: row.k1_basis_sp,
    fundingApr: row.i1_annual_cross
  }));
}
__name(toPriceBasisRows, "toPriceBasisRows");
async function runScheduledMarketSync(env) {
  const config = resolveConfig(env);
  const { data: pipeline, source } = await buildMatrixPayload(config);
  const matrixRows = (Array.isArray(pipeline.matrix) ? pipeline.matrix : pipeline.data ?? []).filter(
    (row) => !!row.b1_symbol && row.onHyperliquid === true && row.d1_hl_perp > 0
  );
  const snapshot = {
    timestamp_hkt: pipeline.timestamp_hkt,
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    source,
    rows: toPriceBasisRows(matrixRows)
  };
  await saveMarketSnapshotToKV(env.SLIVERVINE_KV, snapshot);
  const matrixPayload = {
    ...pipeline,
    matrix: matrixRows,
    data: matrixRows,
    debug_info: { source: `Cron: ${source}` }
  };
  await saveMatrixPayloadToKV(env.SLIVERVINE_KV, matrixPayload);
  await saveSystemStateToKV(env.SLIVERVINE_KV, {
    source: `Cron: ${source}`,
    timestamp_hkt: pipeline.timestamp_hkt,
    rowCount: matrixRows.length
  });
}
__name(runScheduledMarketSync, "runScheduledMarketSync");
async function runScheduledSoakTelemetry(env) {
  await runSoakTelemetryTick({ kv: env.SLIVERVINE_KV });
}
__name(runScheduledSoakTelemetry, "runScheduledSoakTelemetry");
async function runScheduledJobs(env) {
  await Promise.all([
    runScheduledMarketSync(env),
    runScheduledSoakTelemetry(env)
  ]);
}
__name(runScheduledJobs, "runScheduledJobs");
console.log("[slivervine] worker boot");
var index_default = {
  async fetch(request, env, ctx) {
    return routeRequest(request, env, ctx);
  },
  async scheduled(controller, env, ctx) {
    console.log("[slivervine] cron fired", controller.cron);
    ctx.waitUntil(
      runScheduledJobs(env).catch((err) => {
        console.error("[slivervine] scheduled cron failed", err);
      })
    );
  }
};
export {
  TELEMETRY_VENUES,
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
  index_default as default,
  evaluateGlobalRiskPolicy,
  evaluateSantenmokuHub,
  fetchHyperliquidMaps,
  fetchJupiterQuote,
  fetchPolymarketOrderbook,
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
