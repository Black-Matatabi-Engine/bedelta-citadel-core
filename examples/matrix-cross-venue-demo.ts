#!/usr/bin/env tsx
/**
 * Cross-Venue Matrix Demo — flexible capital loops across 6 protocols.
 * Usage:
 *   pnpm demo:matrix                      # --loop=all (default)
 *   pnpm demo:matrix -- --loop=perp       # Pendle → GMX → HL perp stack
 *   pnpm demo:matrix -- --loop=spot       # Camelot → Radiant → Jones spot loop
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
import { formatLatencyLabel, hrtimeElapsedUs, hrtimeStart } from "./lib/demo-timing";

type VenueStatus = "ALLOW" | "FAIL_CLOSED";
type MatrixLoop = "perp" | "spot" | "all";
type VenueKey = "pendle" | "gmx" | "hl" | "camelot" | "radiant" | "jones" | "soil";

interface VenueRow {
  venue: string;
  status: VenueStatus;
  detail: string;
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

function soilForStep(nowMs: number, trip: boolean, gmxTrip: boolean): SoilResistanceInput {
  if (trip && gmxTrip) {
    return { ...HEALTHY_SOIL, at: new Date(nowMs), depthUsd: 1, hlPerp: 4200 };
  }
  const selection = pendleSelection(nowMs, trip);
  return {
    ...HEALTHY_SOIL,
    at: new Date(nowMs),
    pendlePoolFactory: trip
      ? { selection, marketKeyOrAddress: PENDLE_PT_MARKET_PT_EETH, useOracle: false }
      : undefined,
  };
}

function gateStatus(state: SystemState, innerOk: boolean): VenueStatus {
  if (isR20Locked(state)) return "FAIL_CLOSED";
  return innerOk ? "ALLOW" : "FAIL_CLOSED";
}

function evaluateVenue(
  key: VenueKey,
  nowMs: number,
  trip: boolean,
  gmxTrip: boolean,
  state: SystemState,
  soil: SoilResistanceInput,
  soilProbe: ReturnType<typeof checkSoilResistance>,
): VenueRow | null {
  switch (key) {
    case "pendle": {
      const r = validateAIPoolSelection(pendleSelection(nowMs, trip && !gmxTrip));
      return { venue: "Pendle", status: gateStatus(state, r.passed), detail: r.passed ? "yield farming clear" : "yield shock trip" };
    }
    case "gmx": {
      const r = verifyGmxPoolImbalance({
        oiLongUsd: gmxTrip ? 4_500_000 : 3_000_000,
        oiShortUsd: gmxTrip ? 500_000 : 2_500_000,
        poolTvlUsd: 5_500_000,
      });
      return { venue: "GMX v2", status: gateStatus(state, r.ok), detail: r.ok ? "shadow margin ok" : "pool imbalance trip" };
    }
    case "hl": {
      const r = evaluateHyperliquidSessionGuard({
        orderSizeUsd: 2_000,
        spreadBps: trip ? 25 : 10,
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
      return { venue: "Camelot V3", status: gateStatus(state, r.ok), detail: r.status };
    }
    case "radiant": {
      const r = evaluateRadiantLendingGuard({
        chainId: RADIANT_ARBITRUM_CHAIN_ID,
        market: "WETH/USDC",
        collateralUsd: 150_000,
        debtUsd: 80_000,
        liquidationThreshold: 0.825,
        projectedHealthFactor: trip ? 1.05 : 1.42,
        refPriceUsd: 3500,
        spotPriceUsd: 3500,
        depthUsd: 500_000,
        nowMs,
      });
      return { venue: "Radiant", status: gateStatus(state, r.ok), detail: r.status };
    }
    case "jones": {
      const r = evaluateJonesVaultGuard({
        chainId: JONES_ARBITRUM_CHAIN_ID,
        vaultId: "jGLP",
        action: "REBALANCE",
        amountUsd: 50_000,
        vaultTvlUsd: 5_000_000,
        expectedSharePriceUsd: 1.245,
        quotedSharePriceUsd: trip ? 1.252 : 1.246,
        refPriceUsd: 3500,
        spotPriceUsd: 3500,
        depthUsd: 400_000,
        nowMs,
      });
      return { venue: "Jones DAO", status: gateStatus(state, r.ok), detail: r.status };
    }
    case "soil":
      return {
        venue: "Soil Fuse",
        status: gateStatus(state, !soilProbe.tripped),
        detail: soilProbe.tripped ? soilProbe.reasons.join("|") : "nominal",
      };
    default:
      return null;
  }
}

function evaluateLoop(
  keys: VenueKey[],
  nowMs: number,
  trip: boolean,
  gmxTrip: boolean,
  state: SystemState,
): VenueRow[] {
  const soil = soilForStep(nowMs, trip, gmxTrip);
  const soilProbe = checkSoilResistance(soil);
  return keys
    .map((k) => evaluateVenue(k, nowMs, trip, gmxTrip, state, soil, soilProbe))
    .filter((r): r is VenueRow => r != null);
}

function printMatrix(title: string, rows: VenueRow[]): void {
  console.log(`\n${YELLOW}${title}${R}`);
  for (const row of rows) {
    const color = row.status === "ALLOW" ? GREEN : RED;
    console.log(`  ${color}${row.venue.padEnd(14)} ${row.status.padEnd(12)} ${row.detail}${R}`);
  }
}

function resetState(): void {
  __setSystemStateForTests(buildSystemState({ accountBalanceUsd: 10_000, currentCri: 100, skipHardlockAssert: true }));
}

function runCircuitBreaker(
  label: string,
  keys: VenueKey[],
  nowMs: number,
  gmxTrip: boolean,
  t0: bigint,
): boolean {
  printMatrix(`${label} · Step 1 — Nominal pre-flight (PASS)`, evaluateLoop(keys, nowMs, false, false, readActiveSystemState()));

  const tripLabel = gmxTrip ? "GMX pool imbalance >0.35" : "Pendle yield shock >150bps";
  console.log(`\n${RED}${label} · Step 2 — Inject anomaly: ${tripLabel}${R}`);
  const soilTrip = checkSoilResistance(soilForStep(nowMs, true, gmxTrip));
  console.log(`  Layer-1 soil tripped=${soilTrip.tripped} · reasons=${soilTrip.reasons.join("|") || "none"}`);

  console.log(`\n${RED}${label} · Step 3 — R20 auto-severance (core-integrated)${R}`);
  const locked = readActiveSystemState();
  console.log(`  signingChannelOpen=${locked.signingChannelOpen} · hardlock=${locked.hardlock} · cri=${locked.currentCri}`);

  const finalRows = evaluateLoop(keys, nowMs, true, gmxTrip, locked);
  printMatrix(`${label} · Step 4 — FAIL_CLOSED (zero-gas severance)`, finalRows);

  const ok = finalRows.every((r) => r.status === "FAIL_CLOSED");
  console.log(
    ok
      ? `${GREEN}${label} TRIP OK — ${finalRows.length}/${finalRows.length} FAIL_CLOSED · ${formatLatencyLabel(hrtimeElapsedUs(t0))}${R}`
      : `${RED}${label} INCOMPLETE — expected universal FAIL_CLOSED${R}`,
  );
  return ok;
}

function main(): void {
  const argv = process.argv.slice(2);
  const loop = parseLoop(argv);
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
  seedAdapterProbes(nowMs);
  resetState();

  if (healthyOnly || !trip) {
    const keys = loop === "perp" ? PERP_KEYS : loop === "spot" ? SPOT_KEYS : ALL_KEYS;
    if (loop === "all") {
      printMatrix("Loop A — Perp Stack pre-flight", evaluateLoop(PERP_KEYS, nowMs, false, false, readActiveSystemState()));
      printMatrix("Loop B — Spot Vault pre-flight", evaluateLoop(SPOT_KEYS, nowMs, false, false, readActiveSystemState()));
    } else {
      printMatrix("Step 1 — Nominal pre-flight (PASS)", evaluateLoop(keys, nowMs, false, false, readActiveSystemState()));
    }
    console.log(`\n${GREEN}Nominal matrix PASS · ${formatLatencyLabel(hrtimeElapsedUs(t0))}${R}`);
    if (!ensureSoilWasm()) console.log(`${YELLOW}Wasm: offline (TS soil path)${R}`);
    return;
  }

  let allOk = true;
  if (loop === "perp" || loop === "all") {
    if (loop === "all") resetState();
    allOk = runCircuitBreaker(loop === "all" ? "Loop A · Perp Stack" : "Perp Stack", PERP_KEYS, nowMs, gmxTrip, t0) && allOk;
  }
  if (loop === "spot" || loop === "all") {
    if (loop === "all") resetState();
    allOk = runCircuitBreaker(loop === "all" ? "Loop B · Spot Vault" : "Spot Vault", SPOT_KEYS, nowMs, gmxTrip, t0) && allOk;
  }
  if (loop === "all") {
    resetState();
    printMatrix("Combined · Step 1 — Full 6-protocol nominal", evaluateLoop(ALL_KEYS, nowMs, false, false, readActiveSystemState()));
    allOk = runCircuitBreaker("Combined · 6-Protocol", ALL_KEYS, nowMs, gmxTrip, t0) && allOk;
  }

  const elapsed = formatLatencyLabel(hrtimeElapsedUs(t0));
  console.log(
    allOk
      ? `\n${GREEN}MATRIX COMPLETE — all loops FAIL_CLOSED · ${elapsed}${R}`
      : `\n${RED}MATRIX INCOMPLETE — see loop output above · ${elapsed}${R}`,
  );
  if (!ensureSoilWasm()) console.log(`${YELLOW}Wasm: offline (TS soil path)${R}`);
  if (!allOk) process.exitCode = 1;
}

main();
