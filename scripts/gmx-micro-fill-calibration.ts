/** GMX v2 mainnet micro-fill calibration — balanced side + guard preflight. */
import { evaluateGmxV2PoolGuard, verifyGmxPoolImbalance } from "../src/adapters/gmx/gmx-v2-invariants";
import { filterSoftConfirmationProbeReasons } from "../src/core/soil-resistance-core";
import type { GmxV2PoolWeights } from "../src/services/yield/gmx-v2-price-impact";

export const MICRO_FILL_MIN_SIZE_USD = 10;
export const MICRO_FILL_MAX_SIZE_USD = 20;

export interface MicroFillMarketSnapshot {
  symbol: string;
  pool: GmxV2PoolWeights;
  poolTvlUsd: number;
  midPriceUsd: number;
  depthUsd: number;
}

export function parseMicroFillSize(argv: string[]): number {
  const raw = argv.find((a, i) => argv[i - 1] === "--size");
  const n = raw ? Number.parseFloat(raw) : MICRO_FILL_MIN_SIZE_USD;
  if (!Number.isFinite(n) || n < MICRO_FILL_MIN_SIZE_USD || n > MICRO_FILL_MAX_SIZE_USD) {
    throw new Error(`size must be $${MICRO_FILL_MIN_SIZE_USD}–$${MICRO_FILL_MAX_SIZE_USD} USD`);
  }
  return n;
}

/** Pick the side that reduces GM pool skew (lower-OI leg). */
export function resolveBalancedSide(pool: GmxV2PoolWeights): "long" | "short" {
  return pool.longTokenUsd > pool.shortTokenUsd ? "short" : "long";
}

export function resolveMicroFillSide(
  argv: string[],
  pool: GmxV2PoolWeights,
): "long" | "short" {
  const raw = argv.find((a, i) => argv[i - 1] === "--side");
  if (raw === "long" || raw === "short") return raw;
  return resolveBalancedSide(pool);
}

export function evaluateMicroFillGuard(input: {
  market: MicroFillMarketSnapshot;
  sizeUsd: number;
  side: "long" | "short";
  bypassSoil?: boolean;
}): ReturnType<typeof evaluateGmxV2PoolGuard> {
  const { market, sizeUsd, side, bypassSoil } = input;
  const skewDeltaUsd = side === "long" ? sizeUsd : -sizeUsd;
  const guard = evaluateGmxV2PoolGuard({
    symbol: market.symbol,
    oiLongUsd: market.pool.longTokenUsd,
    oiShortUsd: market.pool.shortTokenUsd,
    poolTvlUsd: market.poolTvlUsd,
    depthUsd: market.depthUsd,
    refPriceUsd: market.midPriceUsd,
    spotPriceUsd: market.midPriceUsd,
    notionalUsd: sizeUsd,
    skewDeltaUsd,
  });
  if (bypassSoil && !guard.imbalanceOk) return guard;
  if (bypassSoil && guard.imbalanceOk) {
    const reasons = filterSoftConfirmationProbeReasons(
      guard.reasons.filter((r) => !r.includes("SOIL_RESISTANCE_TRIP") && !r.includes("DEPTH_USD")),
    );
    return { ...guard, ok: true, status: "ALLOW", reasons, soilOk: true };
  }
  return guard;
}

/** Try explicit side, then flip to balanced leg if fail-closed. */
export function calibrateMicroFillExecution(input: {
  market: MicroFillMarketSnapshot;
  sizeUsd: number;
  preferredSide?: "long" | "short";
  bypassSoil?: boolean;
}): { side: "long" | "short"; guard: ReturnType<typeof evaluateGmxV2PoolGuard> } {
  const primary = input.preferredSide ?? resolveBalancedSide(input.market.pool);
  const primaryGuard = evaluateMicroFillGuard({
    market: input.market, sizeUsd: input.sizeUsd, side: primary, bypassSoil: input.bypassSoil,
  });
  if (primaryGuard.ok) return { side: primary, guard: primaryGuard };

  const alternate: "long" | "short" = primary === "long" ? "short" : "long";
  const altGuard = evaluateMicroFillGuard({
    market: input.market, sizeUsd: input.sizeUsd, side: alternate, bypassSoil: input.bypassSoil,
  });
  if (altGuard.ok) return { side: alternate, guard: altGuard };

  const imbalance = verifyGmxPoolImbalance({
    oiLongUsd: input.market.pool.longTokenUsd,
    oiShortUsd: input.market.pool.shortTokenUsd,
    poolTvlUsd: input.market.poolTvlUsd,
  });
  throw new Error(
    `GMX_MICRO_FILL_FAIL_CLOSED:${[...new Set([...primaryGuard.reasons, ...altGuard.reasons])].join("|")};imbalance=${imbalance.imbalanceRatio.toFixed(4)}`,
  );
}
