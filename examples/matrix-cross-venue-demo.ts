#!/usr/bin/env tsx
/**
 * Cross-Venue Matrix Demo — flexible capital loops across 6 protocols.
 * Usage:
 *   pnpm demo:matrix                      # --loop=all (default)
 *   pnpm demo:matrix -- --loop=perp       # Pendle → GMX → HL perp stack
 *   pnpm demo:matrix -- --loop=spot       # Camelot → Radiant → Jones spot loop
 *   pnpm demo:matrix -- --loop=spot --radiant  # Spot loop: Radiant HF trip (default: Jones NAV)
 *   pnpm demo:matrix -- --healthy-only    # nominal PASS (no R20 sever)
 * Trip:  pnpm demo:matrix -- --trip --gmx  # GMX pool imbalance trip
 */
import {
  CAMELOT_V3_ARBITRUM_CHAIN_ID,
  evaluateCamelotV3SwapGuard,
} from "../src/adapters/camelot/camelot-v3-adapter";
import { verifyGmxPoolImbalance } from "../src/adapters/gmx/gmx-v2-invariants";
import { evaluateHyperliquidSessionGuard } from "../src/adapters/hl/hyperliquid-session-guard";
import {
  JONES_ARBITRUM_CHAIN_ID,
  evaluateJonesVaultGuard,
} from "../src/adapters/jones/jones-vault-adapter";
import {
  PENDLE_POOL_MIN_INITIAL_LIQUIDITY_USD,
  validateAIPoolSelection,
} from "../src/adapters/pendle/pendle-pool-factory-adapter";
import { PENDLE_PT_MARKET_PT_EETH } from "../src/adapters/pendle/pendle-pt-registry";
import {
  RADIANT_ARBITRUM_CHAIN_ID,
  evaluateRadiantLendingGuard,
} from "../src/adapters/radiant/radiant-lending-adapter";
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
  printBanner,
  seedAdapterProbes,
} from "./adapters/citadel-ansi-hud";
import {
  DEMO_LATENCY_LEGEND,
  formatHarnessLatencyLabel,
  hrtimeElapsedUs,
  hrtimeStart,
} from "./lib/demo-timing";

type VenueStatus = "ALLOW" | "FAIL_CLOSED";
type MatrixLoop = "perp" | "spot" | "all";
type VenueKey = "pendle" | "gmx" | "hl" | "camelot" | "radiant" | "jones" | "soil";
type SpotAnomaly = "jones" | "radiant";

interface VenueRow {
  venue: string;
  status: VenueStatus;
  detail: string;
}

interface TripContext {
  active: boolean;
  perpPendle: boolean;
  perpGmx: boolean;
  spotJones: boolean;
  spotRadiant: boolean;
}

interface LoopEvalResult {
  rows: VenueRow[];
  soilProbe: ReturnType<typeof checkSoilResistance>;
  soilLatencyUs: number;
}

const PERP_KEYS: VenueKey[] = ["pendle", "gmx", "hl", "soil"];
const SPOT_KEYS: VenueKey[] = ["camelot", "radiant", "jones", "soil"];
const ALL_KEYS: VenueKey[] = ["pendle", "gmx", "hl", "camelot", "radiant", "jones", "soil"];

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

function parseSpotAnomaly(argv: string[]): SpotAnomaly {
  return argv.includes("--radiant") ? "radiant" : "jones";
}

function buildTripContext(loop: MatrixLoop, trip: boolean, gmxTrip: boolean, spotAnomaly: SpotAnomaly): TripContext {
  const perpActive = trip && loop !== "spot";
  const spotActive = trip && loop !== "perp";
  return {
    active: trip,
    perpPendle: perpActive && !gmxTrip,
    perpGmx: perpActive && gmxTrip,
    spotJones: spotActive && spotAnomaly === "jones",
    spotRadiant: spotActive && spotAnomaly === "radiant",
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
    case "camelot": {
      const r = evaluateCamelotV3SwapGuard({
        chainId: CAMELOT_V3_ARBITRUM_CHAIN_ID,
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
      return { venue: "Camelot V3", status: gateStatus(state, r.ok), detail };
    }
    case "radiant": {
      const radiantTrip = ctx.spotRadiant;
      const r = evaluateRadiantLendingGuard({
        chainId: RADIANT_ARBITRUM_CHAIN_ID,
        market: "WETH/USDC",
        collateralUsd: 150_000,
        debtUsd: radiantTrip ? 120_000 : 80_000,
        liquidationThreshold: 0.825,
        projectedHealthFactor: radiantTrip ? 1.05 : 1.42,
        refPriceUsd: 3500,
        spotPriceUsd: 3500,
        depthUsd: 500_000,
        nowMs,
      });
      const detail = !r.ok && ctx.spotRadiant
        ? "FAIL_CLOSED: RADIANT_HEALTH_FACTOR_BREACH"
        : !r.ok
          ? r.reasons.join("|") || "lending guard trip"
          : ctx.active && isR20Locked(state)
            ? "FAIL_CLOSED: R20_DEADLOCK"
            : `HF ${r.healthFactor.toFixed(2)} nominal`;
      return { venue: "Radiant", status: gateStatus(state, r.ok), detail };
    }
    case "jones": {
      const r = evaluateJonesVaultGuard({
        chainId: JONES_ARBITRUM_CHAIN_ID,
        vaultId: "jGLP",
        action: "REBALANCE",
        amountUsd: 50_000,
        vaultTvlUsd: 5_000_000,
        expectedSharePriceUsd: 1.245,
        quotedSharePriceUsd: ctx.spotJones ? 1.252 : 1.246,
        refPriceUsd: 3500,
        spotPriceUsd: 3500,
        depthUsd: 400_000,
        nowMs,
      });
      const detail = !r.ok && ctx.spotJones
        ? "FAIL_CLOSED: JONES_NAV_DEVIATION_BREACH"
        : !r.ok
          ? r.reasons.join("|") || "vault guard trip"
          : ctx.active && isR20Locked(state)
            ? "FAIL_CLOSED: R20_DEADLOCK"
            : `NAV slippage ${r.shareSlippageBps.toFixed(1)}bps nominal`;
      return { venue: "Jones DAO", status: gateStatus(state, r.ok), detail };
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

function printMatrix(title: string, result: LoopEvalResult): void {
  console.log(`\n${YELLOW}${title}${R}`);
  const soilLabel = result.soilProbe.tripped ? "REJECT" : "PASS";
  console.log(
    `  checkSoilResistance() -> ${soilLabel} | ${formatHarnessLatencyLabel(result.soilLatencyUs)}`,
  );
  for (const row of result.rows) {
    const color = row.status === "ALLOW" ? GREEN : RED;
    console.log(`  ${color}${row.venue.padEnd(14)} ${row.status.padEnd(12)} ${row.detail}${R}`);
  }
}

function resetState(): void {
  __setSystemStateForTests(buildSystemState({ accountBalanceUsd: 10_000, currentCri: 100, skipHardlockAssert: true }));
}

function anomalyLabel(loop: MatrixLoop, gmxTrip: boolean, spotAnomaly: SpotAnomaly): string {
  if (loop === "spot") {
    return spotAnomaly === "radiant"
      ? "Radiant projected HF < 1.15"
      : "Jones NAV deviation > 30bps";
  }
  return gmxTrip ? "GMX pool imbalance >0.35" : "Pendle yield shock >150bps";
}

function injectSpotAnomaly(nowMs: number, spotAnomaly: SpotAnomaly): void {
  if (spotAnomaly === "radiant") {
    const r = evaluateRadiantLendingGuard({
      chainId: RADIANT_ARBITRUM_CHAIN_ID,
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
    console.log(`  Radiant guard ok=${r.ok} · reasons=${r.reasons.join("|") || "none"}`);
    return;
  }
  const r = evaluateJonesVaultGuard({
    chainId: JONES_ARBITRUM_CHAIN_ID,
    vaultId: "jGLP",
    action: "REBALANCE",
    amountUsd: 50_000,
    vaultTvlUsd: 5_000_000,
    expectedSharePriceUsd: 1.245,
    quotedSharePriceUsd: 1.252,
    refPriceUsd: 3500,
    spotPriceUsd: 3500,
    depthUsd: 400_000,
    nowMs,
  });
  console.log(`  Jones vault guard ok=${r.ok} · reasons=${r.reasons.join("|") || "none"}`);
}

function runCircuitBreaker(
  label: string,
  keys: VenueKey[],
  loop: MatrixLoop,
  nowMs: number,
  gmxTrip: boolean,
  spotAnomaly: SpotAnomaly,
  t0: bigint,
): boolean {
  const nominalCtx = buildTripContext(loop, false, false, spotAnomaly);
  printMatrix(`${label} · Step 1 — Nominal pre-flight (PASS)`, evaluateLoop(keys, nowMs, nominalCtx, readActiveSystemState()));

  const tripCtx = buildTripContext(loop, true, gmxTrip, spotAnomaly);
  const tripLabel = anomalyLabel(loop, gmxTrip, spotAnomaly);
  console.log(`\n${RED}${label} · Step 2 — Inject anomaly: ${tripLabel}${R}`);
  if (loop === "spot") {
    injectSpotAnomaly(nowMs, spotAnomaly);
  } else {
    const soilTrip = checkSoilResistance(soilForStep(nowMs, tripCtx));
    console.log(`  checkSoilResistance() -> ${soilTrip.tripped ? "REJECT" : "PASS"} | Layer-1 reasons=${soilTrip.reasons.join("|") || "none"}`);
  }

  console.log(`\n${RED}${label} · Step 3 — R20 auto-severance (core-integrated)${R}`);
  const locked = readActiveSystemState();
  console.log(`  signingChannelOpen=${locked.signingChannelOpen} · hardlock=${locked.hardlock} · cri=${locked.currentCri}`);

  const finalResult = evaluateLoop(keys, nowMs, tripCtx, locked);
  printMatrix(`${label} · Step 4 — FAIL_CLOSED (zero-gas severance)`, finalResult);

  const ok = finalResult.rows.every((r) => r.status === "FAIL_CLOSED");
  console.log(
    ok
      ? `${GREEN}${label} TRIP OK — ${finalResult.rows.length}/${finalResult.rows.length} FAIL_CLOSED · ${formatHarnessLatencyLabel(hrtimeElapsedUs(t0))}${R}`
      : `${RED}${label} INCOMPLETE — expected universal FAIL_CLOSED${R}`,
  );
  return ok;
}

function main(): void {
  const argv = process.argv.slice(2);
  const loop = parseLoop(argv);
  const spotAnomaly = parseSpotAnomaly(argv);
  const healthyOnly = argv.includes("--healthy-only");
  const trip = !healthyOnly;
  const gmxTrip = argv.includes("--gmx");
  const nowMs = Date.now();
  const t0 = hrtimeStart();

  const loopTitle =
    loop === "perp"
      ? "Delta-Neutral Perp Stack (Pendle → GMX → HL)"
      : loop === "spot"
        ? "Spot & Lending Vault Loop (Camelot → Radiant → Jones)"
        : "Full 6-Protocol Cross-Venue Matrix";
  printBanner(`Cross-Venue Matrix · ${loopTitle}`);
  console.log(`${R}${DEMO_LATENCY_LEGEND}${R}`);
  seedAdapterProbes(nowMs);
  resetState();

  if (healthyOnly || !trip) {
    const keys = loop === "perp" ? PERP_KEYS : loop === "spot" ? SPOT_KEYS : ALL_KEYS;
    const ctx = buildTripContext(loop, false, false, spotAnomaly);
    if (loop === "all") {
      printMatrix("Loop A — Perp Stack pre-flight", evaluateLoop(PERP_KEYS, nowMs, ctx, readActiveSystemState()));
      printMatrix("Loop B — Spot Vault pre-flight", evaluateLoop(SPOT_KEYS, nowMs, ctx, readActiveSystemState()));
    } else {
      printMatrix("Step 1 — Nominal pre-flight (PASS)", evaluateLoop(keys, nowMs, ctx, readActiveSystemState()));
    }
    console.log(`\n${GREEN}Nominal matrix PASS · ${formatHarnessLatencyLabel(hrtimeElapsedUs(t0))}${R}`);
    if (!ensureSoilWasm()) console.log(`${YELLOW}Wasm: offline (TS soil path)${R}`);
    return;
  }

  let allOk = true;
  if (loop === "perp" || loop === "all") {
    if (loop === "all") resetState();
    allOk = runCircuitBreaker(loop === "all" ? "Loop A · Perp Stack" : "Perp Stack", PERP_KEYS, "perp", nowMs, gmxTrip, spotAnomaly, t0) && allOk;
  }
  if (loop === "spot" || loop === "all") {
    if (loop === "all") resetState();
    allOk = runCircuitBreaker(loop === "all" ? "Loop B · Spot Vault" : "Spot Vault", SPOT_KEYS, "spot", nowMs, gmxTrip, spotAnomaly, t0) && allOk;
  }
  if (loop === "all") {
    resetState();
    const ctx = buildTripContext("all", false, false, spotAnomaly);
    printMatrix("Combined · Step 1 — Full 6-protocol nominal", evaluateLoop(ALL_KEYS, nowMs, ctx, readActiveSystemState()));
    allOk = runCircuitBreaker("Combined · 6-Protocol", ALL_KEYS, "all", nowMs, gmxTrip, spotAnomaly, t0) && allOk;
  }

  const elapsed = formatHarnessLatencyLabel(hrtimeElapsedUs(t0));
  console.log(
    allOk
      ? `\n${GREEN}MATRIX COMPLETE — all loops FAIL_CLOSED · ${elapsed}${R}`
      : `\n${RED}MATRIX INCOMPLETE — see loop output above · ${elapsed}${R}`,
  );
  if (!ensureSoilWasm()) console.log(`${YELLOW}Wasm: offline (TS soil path)${R}`);
  if (!allOk) process.exitCode = 1;
}

main();
