#!/usr/bin/env tsx
/**
 * Cross-Venue Matrix Demo — flexible capital loops across 7 protocols.
 * Usage:
 *   pnpm demo:matrix                      # --loop=all (default)
 *   pnpm demo:matrix -- --loop=perp       # Pendle → GMX → HL + Variational (both hedges)
 *   pnpm demo:matrix -- --loop=perp --hedge=variational
 *   pnpm demo:matrix -- --loop=perp --hedge=hyperliquid
 *   pnpm demo:matrix -- --loop=spot       # Uniswap V3 → Aave V3 → Morpho Blue spot loop
 *   pnpm demo:matrix -- --loop=spot --aave
 *   pnpm demo:matrix -- --healthy-only
 * Trip:  pnpm demo:matrix -- --trip --gmx
 */
import {
  AAVE_ARBITRUM_CHAIN_ID,
  evaluateAaveV3Guard,
} from "../src/adapters/aave/aave-v3-adapter";
import { verifyGmxPoolImbalance } from "../src/adapters/gmx/gmx-v2-invariants";
import { evaluateHyperliquidSessionGuard } from "../src/adapters/hl/hyperliquid-session-guard";
import {
  MORPHO_ARBITRUM_CHAIN_ID,
  evaluateMorphoBlueGuard,
} from "../src/adapters/morpho/morpho-blue-adapter";
import {
  PENDLE_POOL_MIN_INITIAL_LIQUIDITY_USD,
  validateAIPoolSelection,
} from "../src/adapters/pendle/pendle-pool-factory-adapter";
import { PENDLE_PT_MARKET_PT_EETH } from "../src/adapters/pendle/pendle-pt-registry";
import {
  UNISWAP_V3_ARBITRUM_CHAIN_ID,
  evaluateUniswapV3SwapGuard,
} from "../src/adapters/uniswap/uniswap-v3-adapter";
import {
  formatVariationalFlagMask,
  validateVariationalRFQIntent,
  type VariationalRFQPayload,
} from "../src/adapters/variational-rfq-adapter";
import { FLAGS_SEVERED } from "../src/core/risk-engine-core";
import {
  __setSystemStateForTests,
  buildSystemState,
  isR20Locked,
  readActiveSystemState,
  type SystemState,
} from "../src/core/state";
import { ensureSoilWasm } from "../src/sdk";
import { checkSoilResistance, type SoilResistanceInput } from "../src/services/risk-control";
import {
  GREEN,
  RED,
  R,
  YELLOW,
  BOLD,
  printBanner,
  seedAdapterProbes,
} from "./adapters/citadel-ansi-hud";
import {
  formatExecutionLatency,
  formatGuardTime,
  hrtimeElapsedUs,
  hrtimeStart,
  CORE_BRIGHT_CYAN,
  GUARD_BRIGHT_GREEN,
} from "./lib/demo-timing";

type VenueStatus = "ALLOW" | "FAIL_CLOSED";
type MatrixLoop = "perp" | "spot" | "all";
type PerpHedge = "hyperliquid" | "variational" | "both";
type PerpAnomaly = "pendle" | "gmx" | "variational";
type SpotAnomaly = "morpho" | "aave";
type VenueKey = "pendle" | "gmx" | "hl" | "variational" | "uniswap" | "aave" | "morpho" | "soil";

interface VenueRow {
  venue: string;
  status: VenueStatus;
  detail: string;
}

interface TripContext {
  active: boolean;
  perpPendle: boolean;
  perpGmx: boolean;
  perpVariational: boolean;
  spotMorpho: boolean;
  spotAave: boolean;
}

interface LoopEvalResult {
  rows: VenueRow[];
  soilProbe: ReturnType<typeof checkSoilResistance>;
  soilLatencyUs: number;
}

interface PrintMatrixOpts {
  nowMs: number;
  ctx: TripContext;
  hedge: PerpHedge;
}

const SPOT_KEYS: VenueKey[] = ["uniswap", "aave", "morpho", "soil"];

const HEALTHY_SOIL: SoilResistanceInput = {
  symbol: "ETH",
  hlSpot: 3500,
  hlPerp: 3500,
  dydxPerp: 3500,
  depthUsd: 500_000,
  disableThresholdJitter: true,
};

function parseLoop(argv: string[]): MatrixLoop {
  const raw = argv.find((a) => a.startsWith("--loop="))?.split("=")[1]?.toLowerCase();
  if (raw === "perp" || raw === "spot") return raw;
  return "all";
}

function parseHedge(argv: string[]): PerpHedge {
  const raw = argv.find((a) => a.startsWith("--hedge="))?.split("=")[1]?.toLowerCase();
  if (raw === "hyperliquid" || raw === "hl") return "hyperliquid";
  if (raw === "variational") return "variational";
  return "both";
}

function parseSpotAnomaly(argv: string[]): SpotAnomaly {
  return argv.includes("--aave") ? "aave" : "morpho";
}

function parsePerpAnomaly(argv: string[], gmxTrip: boolean, hedge: PerpHedge): PerpAnomaly {
  if (gmxTrip) return "gmx";
  if (hedge === "variational") return "variational";
  return "pendle";
}

function perpKeysForHedge(hedge: PerpHedge): VenueKey[] {
  const base: VenueKey[] = ["pendle", "gmx"];
  if (hedge === "hyperliquid") return [...base, "hl", "soil"];
  if (hedge === "variational") return [...base, "variational", "soil"];
  return [...base, "hl", "variational", "soil"];
}

function allKeysForHedge(hedge: PerpHedge): VenueKey[] {
  const perp = perpKeysForHedge(hedge).filter((k) => k !== "soil");
  const spot = SPOT_KEYS.filter((k) => k !== "soil");
  return [...perp, ...spot, "soil"];
}

function buildTripContext(
  loop: MatrixLoop,
  trip: boolean,
  gmxTrip: boolean,
  spotAnomaly: SpotAnomaly,
  perpAnomaly: PerpAnomaly,
): TripContext {
  const perpActive = trip && loop !== "spot";
  const spotActive = trip && loop !== "perp";
  return {
    active: trip,
    perpPendle: perpActive && perpAnomaly === "pendle",
    perpGmx: perpActive && perpAnomaly === "gmx",
    perpVariational: perpActive && perpAnomaly === "variational",
    spotMorpho: spotActive && spotAnomaly === "morpho",
    spotAave: spotActive && spotAnomaly === "aave",
  };
}

function variationalPayload(nowMs: number, trip: boolean): VariationalRFQPayload {
  return {
    symbol: "LONG_TAIL_PERP",
    quotePriceUsd: trip ? 3520 : 3500,
    oracleMarkUsd: 3500,
    quoteTimestampMs: trip ? nowMs - 800 : nowMs - 100,
    nowMs,
    tradeSizeUsd: trip ? 50_000 : 5_000,
    olpDepthUsd: 100_000,
    longTailAsset: true,
  };
}

function pendleSelection(nowMs: number, trip: boolean) {
  return {
    intent: "PENDLE_CREATE_POOL" as const,
    underlyingAsset: "eETH",
    maturityTimestampSec: Math.floor(nowMs / 1000) + 30 * 86_400,
    impliedYield: trip ? 0.095 : 0.05,
    oracleYield: 0.062,
    initialLiquidityUsd: PENDLE_POOL_MIN_INITIAL_LIQUIDITY_USD + 100_000,
    nowMs,
  };
}

function soilForStep(nowMs: number, ctx: TripContext): SoilResistanceInput {
  if (ctx.perpGmx) {
    return { ...HEALTHY_SOIL, at: new Date(nowMs), depthUsd: 1, hlPerp: 4200 };
  }
  if (ctx.perpPendle) {
    const selection = pendleSelection(nowMs, true);
    return {
      ...HEALTHY_SOIL,
      at: new Date(nowMs),
      pendlePoolFactory: { selection, marketKeyOrAddress: PENDLE_PT_MARKET_PT_EETH, useOracle: false },
    };
  }
  return { ...HEALTHY_SOIL, at: new Date(nowMs) };
}

function gateStatus(state: SystemState, innerOk: boolean): VenueStatus {
  if (isR20Locked(state)) return "FAIL_CLOSED";
  return innerOk ? "ALLOW" : "FAIL_CLOSED";
}

function evaluateVenue(
  key: VenueKey,
  nowMs: number,
  ctx: TripContext,
  state: SystemState,
  soilProbe: ReturnType<typeof checkSoilResistance>,
): VenueRow | null {
  switch (key) {
    case "pendle": {
      const r = validateAIPoolSelection(pendleSelection(nowMs, ctx.perpPendle));
      return { venue: "Pendle", status: gateStatus(state, r.passed), detail: r.passed ? "yield farming clear" : "yield shock trip" };
    }
    case "gmx": {
      const r = verifyGmxPoolImbalance({
        oiLongUsd: ctx.perpGmx ? 4_500_000 : 3_000_000,
        oiShortUsd: ctx.perpGmx ? 500_000 : 2_500_000,
        poolTvlUsd: 5_500_000,
      });
      return { venue: "GMX v2", status: gateStatus(state, r.ok), detail: r.ok ? "shadow margin ok" : "pool imbalance trip" };
    }
    case "hl": {
      const r = evaluateHyperliquidSessionGuard({
        orderSizeUsd: 2_000,
        spreadBps: ctx.perpPendle ? 25 : 10,
        sessionKeyValid: !isR20Locked(state),
        requestsInLastMinute: 5,
      });
      return { venue: "Hyperliquid", status: gateStatus(state, r.ok), detail: r.status };
    }
    case "variational": {
      const r = validateVariationalRFQIntent(variationalPayload(nowMs, ctx.perpVariational));
      const detail = !r.ok
        ? r.reason ?? "variational guard trip"
        : ctx.active && isR20Locked(state)
          ? "FAIL_CLOSED: R20_DEADLOCK"
          : r.detail ?? "OLP depth ok";
      return { venue: "Variational RFQ", status: gateStatus(state, r.ok), detail };
    }
    case "uniswap": {
      const r = evaluateUniswapV3SwapGuard({
        chainId: UNISWAP_V3_ARBITRUM_CHAIN_ID,
        tokenIn: "WETH",
        tokenOut: "USDC",
        amountInUsd: 25_000,
        activeLiquidityUsd: 2_500_000,
        dynamicFeeBps: 5,
        tickRangeLiquidityUsd: 200_000,
        spotPriceUsd: 3500,
        refPriceUsd: 3500,
        depthUsd: 500_000,
        nowMs,
      });
      const detail = !r.ok
        ? r.status
        : ctx.active && isR20Locked(state)
          ? "FAIL_CLOSED: R20_DEADLOCK"
          : r.status;
      return { venue: "Uniswap V3", status: gateStatus(state, r.ok), detail };
    }
    case "aave": {
      const aaveTrip = ctx.spotAave;
      const r = evaluateAaveV3Guard({
        chainId: AAVE_ARBITRUM_CHAIN_ID,
        market: "WETH/USDC",
        collateralUsd: 150_000,
        debtUsd: aaveTrip ? 120_000 : 80_000,
        liquidationThreshold: 0.825,
        projectedHealthFactor: aaveTrip ? 1.05 : 1.42,
        refPriceUsd: 3500,
        spotPriceUsd: 3500,
        depthUsd: 500_000,
        nowMs,
      });
      const detail = !r.ok && ctx.spotAave
        ? "FAIL_CLOSED: AAVE_HEALTH_FACTOR_BREACH"
        : !r.ok
          ? r.reasons.join("|") || "lending guard trip"
          : ctx.active && isR20Locked(state)
            ? "FAIL_CLOSED: R20_DEADLOCK"
            : `HF ${r.healthFactor.toFixed(2)} nominal`;
      return { venue: "Aave V3", status: gateStatus(state, r.ok), detail };
    }
    case "morpho": {
      const r = evaluateMorphoBlueGuard({
        chainId: MORPHO_ARBITRUM_CHAIN_ID,
        marketId: "WETH/USDC",
        action: "SUPPLY",
        amountUsd: 50_000,
        marketLiquidityUsd: ctx.spotMorpho ? 80_000 : 5_000_000,
        oraclePriceUsd: ctx.spotMorpho ? 3650 : 3500,
        referencePriceUsd: 3500,
        oracleTimestampMs: ctx.spotMorpho ? nowMs - 5_000_000 : nowMs - 120_000,
        refPriceUsd: 3500,
        spotPriceUsd: 3500,
        depthUsd: ctx.spotMorpho ? 6_000 : 400_000,
        nowMs,
      });
      const detail = !r.ok && ctx.spotMorpho
        ? "FAIL_CLOSED: MORPHO_ORACLE_STALE"
        : !r.ok
          ? r.reasons.join("|") || "oracle guard trip"
          : ctx.active && isR20Locked(state)
            ? "FAIL_CLOSED: R20_DEADLOCK"
            : `oracle age ${r.oracleAgeMs}ms nominal`;
      return { venue: "Morpho Blue", status: gateStatus(state, r.ok), detail };
    }
    case "soil":
      return {
        venue: "Soil Fuse",
        status: gateStatus(state, !soilProbe.tripped),
        detail: soilProbe.tripped
          ? soilProbe.reasons.join("|")
          : ctx.active && isR20Locked(state)
            ? "FAIL_CLOSED: R20_DEADLOCK"
            : "nominal",
      };
    default:
      return null;
  }
}

function evaluateLoop(
  keys: VenueKey[],
  nowMs: number,
  ctx: TripContext,
  state: SystemState,
): LoopEvalResult {
  const soil = soilForStep(nowMs, ctx);
  const tSoil = hrtimeStart();
  const soilProbe = checkSoilResistance(soil);
  const soilLatencyUs = hrtimeElapsedUs(tSoil);
  const rows = keys
    .map((k) => evaluateVenue(k, nowMs, ctx, state, soilProbe))
    .filter((r): r is VenueRow => r != null);
  return { rows, soilProbe, soilLatencyUs };
}

function printVariationalDispatch(nowMs: number, ctx: TripContext): void {
  const t0 = hrtimeStart();
  const r = validateVariationalRFQIntent(variationalPayload(nowMs, ctx.perpVariational));
  const us = hrtimeElapsedUs(t0);
  const fuseColor = r.ok ? GREEN : YELLOW;
  const fuseVerdict = r.ok ? "PASS" : "REJECT";
  const severed = (r.flags & FLAGS_SEVERED) !== 0 ? " | R20_SEVERED" : "";
  console.log(
    `  ${CORE_BRIGHT_CYAN}${BOLD}[FUSE]${R} ${fuseColor}evaluateVariationalFlags() -> ${fuseVerdict} | bitmask=${formatVariationalFlagMask(r.flags)}${severed} | ${formatGuardTime(us)}`,
  );
  const color = r.ok ? GREEN : RED;
  const dispatchTag = r.ok ? GUARD_BRIGHT_GREEN : RED;
  const label = r.ok ? "ALLOWED" : (r.reason ?? "FAIL_CLOSED");
  const tail = r.ok ? (r.detail ?? "OLP depth ok") : (r.detail ?? "trip");
  console.log(
    `  ${dispatchTag}${BOLD}[DISPATCH]${R} ${color}${label} | target: Variational Omni RFQ -> ${tail} | ${formatGuardTime(us)}${R}`,
  );
}

function printMatrix(title: string, result: LoopEvalResult, opts?: PrintMatrixOpts): void {
  console.log(`\n${YELLOW}${title}${R}`);
  const soilLabel = result.soilProbe.tripped ? "REJECT" : "PASS";
  console.log(
    `  checkSoilResistance() -> ${soilLabel} | ${formatExecutionLatency(result.soilLatencyUs)}`,
  );
  for (const row of result.rows) {
    const color = row.status === "ALLOW" ? GREEN : RED;
    console.log(`  ${color}${row.venue.padEnd(14)} ${row.status.padEnd(12)} ${row.detail}${R}`);
  }
  if (opts && (opts.hedge === "variational" || opts.hedge === "both")) {
    printVariationalDispatch(opts.nowMs, opts.ctx);
  }
}

function resetState(): void {
  __setSystemStateForTests(buildSystemState({ accountBalanceUsd: 10_000, currentCri: 100, skipHardlockAssert: true }));
}

function anomalyLabel(
  loop: MatrixLoop,
  gmxTrip: boolean,
  spotAnomaly: SpotAnomaly,
  perpAnomaly: PerpAnomaly,
): string {
  if (loop === "spot") {
    return spotAnomaly === "aave"
      ? "Aave V3 projected HF < 1.15"
      : "Morpho Blue oracle stale / deviation > 30bps";
  }
  if (perpAnomaly === "gmx") return "GMX pool imbalance >0.35";
  if (perpAnomaly === "variational") return "Variational stale quote / OLP depth breach";
  return "Pendle yield shock >150bps";
}

function injectSpotAnomaly(nowMs: number, spotAnomaly: SpotAnomaly): void {
  if (spotAnomaly === "aave") {
    const r = evaluateAaveV3Guard({
      chainId: AAVE_ARBITRUM_CHAIN_ID,
      market: "WETH/USDC",
      collateralUsd: 150_000,
      debtUsd: 120_000,
      liquidationThreshold: 0.825,
      projectedHealthFactor: 1.05,
      refPriceUsd: 3500,
      spotPriceUsd: 3500,
      depthUsd: 500_000,
      nowMs,
    });
    console.log(`  Aave guard ok=${r.ok} · reasons=${r.reasons.join("|") || "none"}`);
    return;
  }
  const r = evaluateMorphoBlueGuard({
    chainId: MORPHO_ARBITRUM_CHAIN_ID,
    marketId: "WETH/USDC",
    action: "BORROW",
    amountUsd: 200_000,
    marketLiquidityUsd: 80_000,
    oraclePriceUsd: 3650,
    referencePriceUsd: 3500,
    oracleTimestampMs: nowMs - 5_000_000,
    refPriceUsd: 3500,
    spotPriceUsd: 3500,
    depthUsd: 6_000,
    nowMs,
  });
  console.log(`  Morpho guard ok=${r.ok} · reasons=${r.reasons.join("|") || "none"}`);
}

function injectPerpAnomaly(nowMs: number, perpAnomaly: PerpAnomaly): void {
  if (perpAnomaly === "variational") {
    const r = validateVariationalRFQIntent(variationalPayload(nowMs, true));
    console.log(`  Variational RFQ ok=${r.ok} · ${r.reason ?? r.detail ?? "pass"}`);
    return;
  }
  const ctx: TripContext = {
    active: true,
    perpPendle: perpAnomaly === "pendle",
    perpGmx: perpAnomaly === "gmx",
    perpVariational: false,
    spotMorpho: false,
    spotAave: false,
  };
  const soilTrip = checkSoilResistance(soilForStep(nowMs, ctx));
  console.log(`  checkSoilResistance() -> ${soilTrip.tripped ? "REJECT" : "PASS"} | Layer-1 reasons=${soilTrip.reasons.join("|") || "none"}`);
}

function tripSuccess(rows: VenueRow[], hedge: PerpHedge, loop: MatrixLoop): boolean {
  if (loop !== "spot" && hedge === "variational") {
    const v = rows.find((r) => r.venue === "Variational RFQ");
    return v?.status === "FAIL_CLOSED";
  }
  return rows.every((r) => r.status === "FAIL_CLOSED");
}

function runCircuitBreaker(
  label: string,
  keys: VenueKey[],
  loop: MatrixLoop,
  hedge: PerpHedge,
  nowMs: number,
  gmxTrip: boolean,
  spotAnomaly: SpotAnomaly,
  perpAnomaly: PerpAnomaly,
  t0: bigint,
): boolean {
  const printOpts = (ctx: TripContext): PrintMatrixOpts => ({ nowMs, ctx, hedge });
  const nominalCtx = buildTripContext(loop, false, false, spotAnomaly, perpAnomaly);
  printMatrix(`${label} · Step 1 — Nominal pre-flight (PASS)`, evaluateLoop(keys, nowMs, nominalCtx, readActiveSystemState()), printOpts(nominalCtx));

  const tripCtx = buildTripContext(loop, true, gmxTrip, spotAnomaly, perpAnomaly);
  console.log(`\n${RED}${label} · Step 2 — Inject anomaly: ${anomalyLabel(loop, gmxTrip, spotAnomaly, perpAnomaly)}${R}`);
  if (loop === "spot") injectSpotAnomaly(nowMs, spotAnomaly);
  else injectPerpAnomaly(nowMs, perpAnomaly);

  console.log(`\n${RED}${label} · Step 3 — R20 auto-severance (core-integrated)${R}`);
  const locked = readActiveSystemState();
  console.log(`  signingChannelOpen=${locked.signingChannelOpen} · hardlock=${locked.hardlock} · cri=${locked.currentCri}`);

  const finalResult = evaluateLoop(keys, nowMs, tripCtx, locked);
  printMatrix(`${label} · Step 4 — FAIL_CLOSED (zero-gas severance)`, finalResult, printOpts(tripCtx));

  const ok = tripSuccess(finalResult.rows, hedge, loop);
  console.log(
    ok
      ? `${GREEN}${label} TRIP OK — ${finalResult.rows.filter((r) => r.status === "FAIL_CLOSED").length}/${finalResult.rows.length} FAIL_CLOSED · ${formatGuardTime(hrtimeElapsedUs(t0))}${R}`
      : `${RED}${label} INCOMPLETE — expected universal FAIL_CLOSED${R}`,
  );
  return ok;
}

function perpLoopTitle(hedge: PerpHedge): string {
  if (hedge === "variational") return "Delta-Neutral Perp Stack (Pendle → GMX → Variational Omni RFQ)";
  if (hedge === "hyperliquid") return "Delta-Neutral Perp Stack (Pendle → GMX → Hyperliquid L1)";
  return "Delta-Neutral Perp Stack (Pendle → GMX → HL + Variational)";
}

function main(): void {
  const argv = process.argv.slice(2);
  const loop = parseLoop(argv);
  const hedge = parseHedge(argv);
  const spotAnomaly = parseSpotAnomaly(argv);
  const healthyOnly = argv.includes("--healthy-only");
  const trip = !healthyOnly;
  const gmxTrip = argv.includes("--gmx");
  const perpAnomaly = parsePerpAnomaly(argv, gmxTrip, hedge);
  const perpKeys = perpKeysForHedge(hedge);
  const allKeys = allKeysForHedge(hedge);
  const nowMs = Date.now();
  const t0 = hrtimeStart();

  const loopTitle =
    loop === "perp"
      ? perpLoopTitle(hedge)
      : loop === "spot"
        ? "Spot & Lending Vault Loop (Uniswap V3 → Aave V3 → Morpho Blue)"
        : "Full Cross-Venue Matrix (Dual Perp Hedge)";
  printBanner(`Cross-Venue Matrix · ${loopTitle}`);
  seedAdapterProbes(nowMs);
  resetState();

  const printOpts = (ctx: TripContext): PrintMatrixOpts => ({ nowMs, ctx, hedge });

  if (healthyOnly || !trip) {
    const keys = loop === "perp" ? perpKeys : loop === "spot" ? SPOT_KEYS : allKeys;
    const ctx = buildTripContext(loop, false, false, spotAnomaly, perpAnomaly);
    if (loop === "all") {
      printMatrix("Loop A — Perp Stack pre-flight", evaluateLoop(perpKeys, nowMs, ctx, readActiveSystemState()), printOpts(ctx));
      printMatrix("Loop B — Spot Vault pre-flight", evaluateLoop(SPOT_KEYS, nowMs, ctx, readActiveSystemState()), printOpts(ctx));
    } else {
      printMatrix("Step 1 — Nominal pre-flight (PASS)", evaluateLoop(keys, nowMs, ctx, readActiveSystemState()), printOpts(ctx));
    }
    console.log(`\n${GREEN}Nominal matrix PASS · ${formatGuardTime(hrtimeElapsedUs(t0))}${R}`);
    if (!ensureSoilWasm()) console.log(`${YELLOW}Wasm: offline (TS soil path)${R}`);
    return;
  }

  let allOk = true;
  if (loop === "perp" || loop === "all") {
    if (loop === "all") resetState();
    allOk = runCircuitBreaker(loop === "all" ? "Loop A · Perp Stack" : "Perp Stack", perpKeys, "perp", hedge, nowMs, gmxTrip, spotAnomaly, perpAnomaly, t0) && allOk;
  }
  if (loop === "spot" || loop === "all") {
    if (loop === "all") resetState();
    allOk = runCircuitBreaker(loop === "all" ? "Loop B · Spot Vault" : "Spot Vault", SPOT_KEYS, "spot", hedge, nowMs, gmxTrip, spotAnomaly, perpAnomaly, t0) && allOk;
  }
  if (loop === "all") {
    resetState();
    const ctx = buildTripContext("all", false, false, spotAnomaly, perpAnomaly);
    printMatrix("Combined · Step 1 — Full protocol nominal", evaluateLoop(allKeys, nowMs, ctx, readActiveSystemState()), printOpts(ctx));
    allOk = runCircuitBreaker("Combined · Full Matrix", allKeys, "all", hedge, nowMs, gmxTrip, spotAnomaly, perpAnomaly, t0) && allOk;
  }

  const elapsed = formatGuardTime(hrtimeElapsedUs(t0));
  console.log(
    allOk
      ? `\n${GREEN}MATRIX COMPLETE — all loops FAIL_CLOSED · ${elapsed}${R}`
      : `\n${RED}MATRIX INCOMPLETE — see loop output above · ${elapsed}${R}`,
  );
  if (!ensureSoilWasm()) console.log(`${YELLOW}Wasm: offline (TS soil path)${R}`);
  if (!allOk) process.exitCode = 1;
}

main();
