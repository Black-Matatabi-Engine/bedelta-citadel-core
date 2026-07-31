import type {
  ActionStatus,
  ExchangePriceMaps,
  FundingRateKings,
  HlUniverseQuote,
  MatrixRow,
  MatrixSuccessResponse,
} from "../types/matrix";
import {
  DEFAULT_FIXED_COST_USD,
  DEFAULT_FRICTION,
  DEFAULT_TOKENS,
  hktTimestamp,
  STRATEGY_APR_THRESHOLD,
} from "./config";
import { fetchExchangeBundle } from "./exchanges/fetch-exchange-maps";
import { isXyzAsset } from "./exchanges/asset-classifier";
import {
  computeEffectiveMaxSlUsd,
  checkSoilResistance,
  estimateEntryLossUsd,
  HardlockError,
  RiskLimitExceeded,
  vineWrapProtection,
} from "./risk-control";

/** Default notional used when projecting entry drag for Max SL / 7d PnL */
const RISK_EVAL_CAPITAL_USD = 10_000;

/** Crypto admission — Rule A (HL spot+perp funding yield) */
export const RULE_FUNDING_STD_MAX = 0.015;

function pickStrategy(hlFunding: number, annualYield: number): string {
  if (annualYield <= STRATEGY_APR_THRESHOLD) {
    return "【 觀望其變 / HOLD 】";
  }

  if (hlFunding > 0) {
    return "【 📈買 HL 現 + 📉空 HL 合 】";
  }
  if (hlFunding < 0) {
    return "【 📉空 HL 現 + 📈多 HL 合 】";
  }
  return "【 觀望其變 / HOLD 】";
}

function applyRiskToRow(
  symbol: string,
  c1_spot: number,
  d1_perp: number,
  dydxPerp: number,
  strategy: string,
  depthUsd: number | undefined,
): {
  j1_strategy: string;
  actionStatus: ActionStatus | undefined;
  risk_tripped: boolean;
  risk_reasons: string[];
  risk_estimated_loss_usd: number;
} {
  const soil = checkSoilResistance({
    symbol,
    hlSpot: c1_spot,
    hlPerp: d1_perp,
    dydxPerp,
    depthUsd,
  });

  const estimatedLossUsd = estimateEntryLossUsd(
    RISK_EVAL_CAPITAL_USD,
    DEFAULT_FRICTION,
    DEFAULT_FIXED_COST_USD,
  );
  const maxLossLimit = computeEffectiveMaxSlUsd(RISK_EVAL_CAPITAL_USD);

  let rootTripped = false;
  let rootReason: string | undefined;

  try {
    vineWrapProtection({
      symbol,
      estimatedLossUsd,
      accountBalanceUsd: RISK_EVAL_CAPITAL_USD,
      maxLossLimit,
      frictionUsd: estimatedLossUsd,
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
      actionStatus: undefined,
      risk_tripped: false,
      risk_reasons: [],
      risk_estimated_loss_usd: estimatedLossUsd,
    };
  }

  const actionStatus: ActionStatus = soil.reasons.some(
    (r) =>
      r.startsWith("SPOT_PERP_SLIPPAGE") ||
      r.startsWith("DEPTH_USD") ||
      r === "INSUFFICIENT_HL_DEPTH",
  )
    ? "SPREAD_TOO_HIGH"
    : "HOLD";

  return {
    j1_strategy:
      actionStatus === "SPREAD_TOO_HIGH"
        ? "【⚠️ 價差過大拒絕開倉】"
        : "【 觀望其變 / HOLD · 風控熔斷 】",
    actionStatus,
    risk_tripped: true,
    risk_reasons: reasons,
    risk_estimated_loss_usd: estimatedLossUsd,
  };
}

function estimateNetProfit7d(annualYieldPct: number): number {
  const dailyYieldRate = annualYieldPct / 100 / 365;
  const dailyGross = RISK_EVAL_CAPITAL_USD * dailyYieldRate;
  const frictionUsd = estimateEntryLossUsd(
    RISK_EVAL_CAPITAL_USD,
    DEFAULT_FRICTION,
    DEFAULT_FIXED_COST_USD,
  );
  return dailyGross * 7 - frictionUsd;
}

/**
 * Proxy 24h funding std-dev when historical series is unavailable.
 * Uses absolute HL funding magnitude scaled into a fractional band.
 */
function estimateFundingStdDev24h(hlFunding: number): number {
  const level = Math.abs(hlFunding);
  return Math.min(0.05, level * 4);
}

/**
 * Dynamic Max SL label for matrix rows — Balance × 1% + $100.
 */
export function resolveMaxLossLimit(accountBalanceUsd: number): {
  maxLossLimit: number;
  maxLossLabel: string;
} {
  const maxLossLimit = computeEffectiveMaxSlUsd(accountBalanceUsd);
  return {
    maxLossLimit,
    maxLossLabel: `Max SL $${maxLossLimit.toFixed(2)} (Balance×1%+$100)`,
  };
}

/**
 * Rule A only:
 * score > 0 && netProfit7d > 0 && fundingStdDev24h < 1.5%
 * plus live HL perp (+ optional spot). Condition B abolished.
 */
function passesRuleA(row: MatrixRow): boolean {
  if (!row.onHyperliquid || row.d1_hl_perp <= 0) return false;
  return (
    row.score > 0 &&
    row.netProfit7d > 0 &&
    row.fundingStdDev24h < RULE_FUNDING_STD_MAX
  );
}

/** Rule B — top-N absolute HL hourly funding pool */
export const RULE_B_TOP_N = 10;

/** Hourly funding → 8h display percentage */
export function funding8hPct(hourlyRate: number): number {
  return hourlyRate * 8 * 100;
}

/**
 * All HL perp symbols with funding (not TradFi / colon keys).
 * Never filtered against perp symbol allowlists — full map scan.
 */
export function resolveHlFundingUniverse(
  maps: ExchangePriceMaps,
): string[] {
  return Object.keys(maps.hlFunding ?? {})
    .filter(
      (s) =>
        !isXyzAsset(s) &&
        !s.includes(":") &&
        Number.isFinite(maps.hlFunding[s]) &&
        Math.abs(maps.hlFunding[s]!) > 0 &&
        (maps.hlPerp[s] ?? 0) > 0,
    )
    .sort();
}

/** Top N symbols by |hourly funding| across HL perps */
export function resolveRuleBTopSymbols(
  maps: ExchangePriceMaps,
  topN: number = RULE_B_TOP_N,
): string[] {
  return Object.entries(maps.hlFunding ?? {})
    .filter(
      ([sym, rate]) =>
        !isXyzAsset(sym) &&
        !sym.includes(":") &&
        Number.isFinite(rate) &&
        Math.abs(rate) > 0 &&
        (maps.hlPerp[sym] ?? 0) > 0,
    )
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, topN)
    .map(([sym]) => sym);
}

/** Highest positive & lowest negative 8h funding + Top 3 boards */
export function computeFundingRateKings(
  maps: ExchangePriceMaps,
): FundingRateKings | undefined {
  const entries = Object.entries(maps.hlFunding ?? {}).filter(
    ([sym, rate]) =>
      !isXyzAsset(sym) &&
      !sym.includes(":") &&
      Number.isFinite(rate) &&
      (maps.hlPerp[sym] ?? 0) > 0,
  );
  if (entries.length === 0) return undefined;

  let highest = entries[0]!;
  let lowest = entries[0]!;
  for (const entry of entries) {
    if (entry[1] > highest[1]) highest = entry;
    if (entry[1] < lowest[1]) lowest = entry;
  }

  const positive = entries
    .filter(([, rate]) => rate > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([symbol, rate]) => ({
      symbol,
      rate8h_pct: funding8hPct(rate),
    }));

  const negative = entries
    .filter(([, rate]) => rate < 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([symbol, rate]) => ({
      symbol,
      rate8h_pct: funding8hPct(rate),
    }));

  return {
    highest: {
      symbol: highest[0],
      rate8h_pct: funding8hPct(highest[1]),
    },
    lowest: {
      symbol: lowest[0],
      rate8h_pct: funding8hPct(lowest[1]),
    },
    topPositive: positive.length > 0 ? positive : undefined,
    topNegative: negative.length > 0 ? negative : undefined,
  };
}

/**
 * Universe for HL funding-yield Rule A table = live HL perps only.
 */
export function resolveHlCryptoUniverse(
  maps: ExchangePriceMaps,
  preferred: readonly string[] = DEFAULT_TOKENS,
): string[] {
  const fromHl = Object.keys(maps.hlPerp).filter(
    (s) =>
      !isXyzAsset(s) &&
      !s.includes(":") &&
      (maps.hlPerp[s] ?? 0) > 0,
  );

  const preferredSet = new Set(preferred.map((t) => t.toUpperCase()));
  const preferredHits = fromHl.filter((s) => preferredSet.has(s));
  const rest = fromHl.filter((s) => !preferredSet.has(s));

  return [...preferredHits, ...rest.sort()];
}

/** @deprecated Use resolveHlCryptoUniverse — kept for older imports */
export const resolveDualListedCryptoUniverse = resolveHlCryptoUniverse;

/**
 * Core funding-yield assembler: HL spot+perp basis, annualized funding,
 * strategy labels, with soil-resistance + root-protection gates and Rule A filter.
 *
 * @theory Hull (2018) — Continuous Delta-Neutral Basis Hedging Framework.
 * @theory Gatev et al. (2006) — pairs trading / spot–perp convergence with zero net delta.
 */
export function assembleMatrix(
  hkt: string,
  maps: ExchangePriceMaps,
  tokens: readonly string[] = DEFAULT_TOKENS,
): MatrixSuccessResponse {
  const { hlSpot, hlPerp, hlFunding, hlDayVolumeUsd, dydxPerp } = maps;
  const universe = resolveHlCryptoUniverse(maps, tokens);
  const candidates: MatrixRow[] = [];

  for (const symbol of universe) {
    // Defense: TradFi must never enter crypto Rules
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
      dayVol > 0 ? dayVol : undefined,
    );

    let actionStatus = risk.actionStatus;
    if (!risk.risk_tripped && i1_annual_cross > STRATEGY_APR_THRESHOLD) {
      if (e1_funding > 0) actionStatus = "BUY_HL_SPOT_SHORT_HL_PERP";
      else if (e1_funding < 0) actionStatus = "SHORT_HL_SPOT_LONG_HL_PERP";
    }

    const row: MatrixRow = {
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
      hl_oi_usd: hlOiUsd > 0 ? hlOiUsd : undefined,
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
      "【 Rule B 妖幣蓄水池 / HIGH RATE 】",
      dayVol > 0 ? dayVol : undefined,
    );

    const row: MatrixRow = {
      a1_timestamp: hkt,
      b1_symbol: symbol,
      c1_hl_spot: spotBasis,
      d1_hl_perp: hlPerpPx,
      e1_hl_funding: e1_funding,
      h1_annual_hl,
      i1_annual_cross: Math.abs(h1_annual_hl),
      j1_strategy: "【 Rule B 妖幣蓄水池 】",
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
      actionStatus:
        risk.actionStatus === "SPREAD_TOO_HIGH"
          ? "SPREAD_TOO_HIGH"
          : "RULE_B_HIGH_RATE",
      risk_tripped: risk.risk_tripped,
      risk_reasons: risk.risk_reasons,
      risk_estimated_loss_usd: risk.risk_estimated_loss_usd,
      asset_category: "crypto",
      hl_oi_usd: hlOiUsd > 0 ? hlOiUsd : undefined,
    };

    candidates.push(row);
  }

  const ruleA = candidates.filter((c) => c.passedRule === "A");
  const ruleB = candidates
    .filter((c) => c.passedRule === "B")
    .sort(
      (a, b) => Math.abs(b.e1_hl_funding) - Math.abs(a.e1_hl_funding),
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
    hl_universe,
  };
}

/**
 * Lightweight HL quote proxy for client-side category map / FR sort.
 * No Rule A/B, no soil — O(n) copy only. Always returns an array (possibly empty).
 */
export function buildHlUniverseProxy(
  maps: ExchangePriceMaps,
  universe?: readonly string[],
): HlUniverseQuote[] {
  const { hlSpot, hlPerp, hlFunding, hlDayVolumeUsd } = maps;
  const symbols =
    universe ??
    Object.keys(hlPerp).filter(
      (s) => !isXyzAsset(s) && !s.includes(":") && (hlPerp[s] ?? 0) > 0,
    );
  const out: HlUniverseQuote[] = [];
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
      funding8h_pct: funding8hPct(funding),
    });
  }
  return out;
}

/**
 * Fetch live exchange maps via adapters, then assemble the funding-yield matrix.
 * TradFi commodities/stocks are attached from the front-of-pipe branch — never Rules-filtered.
 */
export async function assembleMatrixFromAdapters(
  tokens: readonly string[] = DEFAULT_TOKENS,
  hkt: string = hktTimestamp(),
): Promise<MatrixSuccessResponse> {
  const bundle = await fetchExchangeBundle();
  const assembled = assembleMatrix(hkt, bundle.maps, tokens);
  assembled.commodities = bundle.commodities;
  assembled.stocks = bundle.stocks;
  assembled.indices = bundle.indices;
  assembled.fx = bundle.fx;
  assembled.preipo = bundle.preipo;
  return assembled;
}
