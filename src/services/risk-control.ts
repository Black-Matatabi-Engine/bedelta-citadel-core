/**
 * Risk-control module — soil resistance (slippage/depth) + root protection (dynamic Max SL).
 * All log emissions are structured JSON for downstream tracing.
 */

import {
  computeEffectiveMaxSlUsd,
  computeOrderAwareMaxSlUsd,
  computeSoilRiskUsd,
  DYNAMIC_MAX_SL_BASE_USD,
  DYNAMIC_MAX_SL_BALANCE_RATE,
} from "./effective-max-sl";

export {
  computeEffectiveMaxSlUsd,
  computeOrderAwareMaxSlUsd,
  computeSoilRiskUsd,
  DYNAMIC_MAX_SL_BASE_USD,
  DYNAMIC_MAX_SL_BALANCE_RATE,
};

/** Cross-venue / cross-book slippage trip threshold (0.5%) */
export const MAX_SLIPPAGE = 0.005;

/**
 * Minimum liquidity depth (USD notional proxy). Rows without an explicit
 * depth reading are judged by dual-venue price presence only.
 */
export const MIN_DEPTH_USD = 100_000;

export type RiskLogLevel = "info" | "warn" | "error";

export type RiskEvent =
  | "SOIL_RESISTANCE_PASS"
  | "SOIL_RESISTANCE_TRIP"
  | "ROOT_PROTECTION_PASS"
  | "ROOT_PROTECTION_TRIP"
  | "CRI_HARDLOCK";

/** Structured risk log payload — always JSON-serializable */
export interface RiskLogPayload {
  level: RiskLogLevel;
  module: "risk-control";
  event: RiskEvent;
  symbol: string;
  timestamp: string;
  message: string;
  details: Record<string, number | string | boolean | null>;
}

/** Vine soil fuse — L2 slippage isolation threshold (0.3%) */
export const VINE_SOIL_MAX_SLIPPAGE = 0.003;

export interface SoilResistanceInput {
  symbol: string;
  hlSpot: number;
  hlPerp: number;
  dydxPerp: number;
  /** Optional order-book / volume depth in USD */
  depthUsd?: number;
  /** Optional slippage fuse override (default MAX_SLIPPAGE) */
  maxSlippage?: number;
  /** Optional order notional — enables soil-risk Max SL cap */
  orderSizeUsd?: number;
  /** Optional account equity — enables soil-risk Max SL cap */
  accountBalanceUsd?: number;
  /** Optional evaluation timestamp (tests / replay) */
  at?: Date;
}

export interface SoilResistanceResult {
  ok: boolean;
  tripped: boolean;
  /** Absolute cross-venue perp slippage ratio */
  crossVenueSlippage: number;
  /** Absolute HL spot–perp basis ratio */
  spotPerpSlippage: number;
  reasons: string[];
  /** Measured slippage loss USD when orderSizeUsd is provided */
  soilRiskUsd?: number;
  /** min(dynamic Max SL, orderSize×fuse) when order + balance provided */
  cappedMaxSlUsd?: number;
}

export interface RootProtectionInput {
  symbol: string;
  /** Worst-case estimated loss in USD for this trade notion */
  estimatedLossUsd: number;
  /** Account balance used to derive dynamic Max SL */
  accountBalanceUsd: number;
  /** Pre-computed dynamic limit; defaults to computeEffectiveMaxSlUsd(accountBalanceUsd) */
  maxLossLimit?: number;
  frictionUsd?: number;
  /** CRI deadlocked at 0 — physical hardlock (403), signing channel blocked */
  criHardlock?: boolean;
}

/**
 * Thrown when estimated P&L loss exceeds the dynamic Max SL limit.
 * Callers that execute trades must let this propagate to block fills.
 */
export class RiskLimitExceeded extends Error {
  readonly code = "RISK_LIMIT_EXCEEDED" as const;
  readonly httpStatus = 422 as const;
  readonly context: RiskLogPayload;

  constructor(message: string, context: RiskLogPayload) {
    super(message);
    this.name = "RiskLimitExceeded";
    this.context = context;
  }
}

/**
 * Thrown when CRI reaches 0 — physical root deadlock; HTTP 403 hardlock.
 * Signing / execution channels must abort immediately.
 */
export class HardlockError extends Error {
  readonly code = "HARDLOCK" as const;
  readonly httpStatus = 403 as const;
  readonly context: RiskLogPayload;

  constructor(message: string, context: RiskLogPayload) {
    super(message);
    this.name = "HardlockError";
    this.context = context;
  }
}

/** HKT tsunami shield window — 21:00–23:00 locks soil resistance */
export const TSUNAMI_SHIELD_HKT_START = 21;
export const TSUNAMI_SHIELD_HKT_END = 23;

/** Current hour in Hong Kong (UTC+8), 0–23 */
export function getHktHour(now: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong",
    hour: "2-digit",
    hour12: false,
  }).format(now);
  return parseInt(hour, 10);
}

/** True during HKT 21:00–22:59 — US open tsunami volatility window */
export function isTsunamiShieldWindow(now: Date = new Date()): boolean {
  const h = getHktHour(now);
  return h >= TSUNAMI_SHIELD_HKT_START && h < TSUNAMI_SHIELD_HKT_END;
}

function isoNow(): string {
  return new Date().toISOString();
}

/**
 * Emit structured risk logs for CF Workers / log drains.
 * Info/PASS emissions are intentionally silent — only warn/error (trips) surface.
 */
export function emitRiskLog(payload: RiskLogPayload): void {
  if (payload.level === "info") return;
  const line = JSON.stringify(payload);
  if (payload.level === "error") {
    console.error(line);
  } else {
    console.warn(line);
  }
}

/**
 * Serialize trip reasons for structured logs.
 * Empty / blank joins fall back to `"none"` so log drains never see `reasons: ""`.
 */
export function formatTripReasons(reasons: string[]): string {
  return reasons.join("|") || "none";
}

/**
 * Soil resistance — slippage & depth circuit breaker.
 * Trips when cross-venue / cross-book slippage > 0.5%, or liquidity depth is insufficient.
 * Spot–perp basis is reported for telemetry only (it is often the arb edge, not a fuse).
 * On trip: refuse actionable trade signals (caller must not trigger execution).
 *
 * @theory Kyle (1985) — Kyle's Lambda (λ) linear price-impact coefficient.
 * @theory Almgren & Chriss (2000) — transient market impact / optimal execution model.
 */
export function checkSoilResistance(
  input: SoilResistanceInput,
): SoilResistanceResult {
  const { symbol, hlSpot, hlPerp, dydxPerp, depthUsd } = input;
  const reasons: string[] = [];

  if (isTsunamiShieldWindow(input.at)) {
    reasons.push("TSUNAMI_SHIELD_LOCKED_HKT_21_23");
  }

  const crossVenueSlippage =
    hlPerp > 0 && dydxPerp > 0
      ? Math.abs(dydxPerp - hlPerp) / hlPerp
      : Number.POSITIVE_INFINITY;

  const spotPerpSlippage =
    hlSpot > 0 ? Math.abs(hlPerp - hlSpot) / hlSpot : Number.POSITIVE_INFINITY;

  if (hlPerp <= 0 || dydxPerp <= 0) {
    reasons.push("INSUFFICIENT_DEPTH_DUAL_VENUE");
  }

  const slippageFuse = input.maxSlippage ?? MAX_SLIPPAGE;
  if (hlPerp > 0 && dydxPerp > 0 && crossVenueSlippage > slippageFuse) {
    reasons.push(
      `CROSS_VENUE_SLIPPAGE=${(crossVenueSlippage * 100).toFixed(4)}%>${slippageFuse * 100}%`,
    );
  }

  if (depthUsd !== undefined && depthUsd < MIN_DEPTH_USD) {
    reasons.push(`DEPTH_USD=${depthUsd}<${MIN_DEPTH_USD}`);
  }

  const tripped = reasons.length > 0;
  const result: SoilResistanceResult = {
    ok: !tripped,
    tripped,
    crossVenueSlippage: Number.isFinite(crossVenueSlippage)
      ? crossVenueSlippage
      : -1,
    spotPerpSlippage: Number.isFinite(spotPerpSlippage) ? spotPerpSlippage : -1,
    reasons,
  };

  const orderSize = Number(input.orderSizeUsd);
  const balance = Number(input.accountBalanceUsd);
  if (Number.isFinite(orderSize) && orderSize > 0) {
    const slipForRisk =
      Number.isFinite(result.crossVenueSlippage) && result.crossVenueSlippage >= 0
        ? result.crossVenueSlippage
        : slippageFuse;
    result.soilRiskUsd = computeSoilRiskUsd(orderSize, slipForRisk);
    if (Number.isFinite(balance) && balance >= 0) {
      result.cappedMaxSlUsd = computeOrderAwareMaxSlUsd(
        balance,
        orderSize,
        slippageFuse,
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
      message: "Soil resistance circuit breaker tripped — trade rejected",
      details: {
        crossVenueSlippage: result.crossVenueSlippage,
        spotPerpSlippage: result.spotPerpSlippage,
        maxSlippage: slippageFuse,
        depthUsd: depthUsd ?? null,
        minDepthUsd: MIN_DEPTH_USD,
        reasons: formatTripReasons(reasons),
        tradeAllowed: false,
      },
    });
  }

  return result;
}

/**
 * Vine soil gate — live L2 slippage/spread fuse at 0.3%.
 * Trips when cross-venue slippage exceeds VINE_SOIL_MAX_SLIPPAGE.
 */
export function checkSoilResistanceWithVine(
  input: SoilResistanceInput,
): SoilResistanceResult {
  return checkSoilResistance({
    ...input,
    maxSlippage: input.maxSlippage ?? VINE_SOIL_MAX_SLIPPAGE,
  });
}

/**
 * Vine wrap protection — wraps Hot Key signing during extreme drawdown.
 * Dynamic Max SL (Balance × 1% + $100) · R20 physical deadlock at CRI === 0.
 *
 * @theory Embrechts et al. (1997) — Extreme Value Theory (EVT) tail exceedance bounds.
 * @theory Mandelbrot (1963) — fat-tail defense via hard loss-cap circuit breakers.
 */
export function vineWrapProtection(input: RootProtectionInput): void {
  const {
    symbol,
    estimatedLossUsd,
    accountBalanceUsd,
    frictionUsd,
    criHardlock = false,
  } = input;
  const maxLossLimit =
    input.maxLossLimit ?? computeEffectiveMaxSlUsd(accountBalanceUsd);
  const loss = Math.abs(estimatedLossUsd);

  if (criHardlock) {
    const context: RiskLogPayload = {
      level: "error",
      module: "risk-control",
      event: "CRI_HARDLOCK",
      symbol,
      timestamp: isoNow(),
      message: `CRI hardlock — vine wrap protection deadlock at 0/100; signing channel blocked`,
      details: {
        cri: 0,
        accountBalanceUsd,
        maxLossLimit,
        frictionUsd: frictionUsd ?? null,
        blocked: true,
        httpStatus: 403,
      },
    };

    emitRiskLog(context);
    throw new HardlockError(context.message, context);
  }

  if (loss > maxLossLimit) {
    const context: RiskLogPayload = {
      level: "error",
      module: "risk-control",
      event: "ROOT_PROTECTION_TRIP",
      symbol,
      timestamp: isoNow(),
      message: `Vine wrap protection — estimated loss $${loss.toFixed(2)} exceeds dynamic Max SL $${maxLossLimit.toFixed(2)}`,
      details: {
        estimatedLossUsd: loss,
        maxLossLimit,
        accountBalanceUsd,
        frictionUsd: frictionUsd ?? null,
        blocked: true,
      },
    };

    emitRiskLog(context);
    throw new RiskLimitExceeded(context.message, context);
  }
}

export { estimateEntryLossUsd } from "./risk-control-helpers";

/** Alias for {@link vineWrapProtection} — physical root deadlock & dynamic Max SL gate. @see checkCircuitBreaker */
export const rootProtection = vineWrapProtection;
