#!/usr/bin/env tsx
/**
 * Cross-Venue Matrix Demo — 6-protocol unified circuit breaker (Pendle · GMX · HL · Camelot · Radiant · Jones).
 * Usage: pnpm demo:matrix
 * Trip:  pnpm demo:matrix -- --trip  (default: Pendle yield shock; pass --gmx for pool imbalance)
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
import { severSigningChannel } from "../src/services/session-key-adapter-lib/session-key-gates";
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

interface VenueRow {
  venue: string;
  status: VenueStatus;
  detail: string;
}

const HEALTHY_SOIL: SoilResistanceInput = {
  symbol: "ETH",
  hlSpot: 3500,
  hlPerp: 3500,
  dydxPerp: 3500,
  depthUsd: 500_000,
  disableThresholdJitter: true,
};

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
    return {
      ...HEALTHY_SOIL,
      at: new Date(nowMs),
      depthUsd: 1,
      hlPerp: 4200,
    };
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

function evaluateAllVenues(nowMs: number, trip: boolean, gmxTrip: boolean, state: SystemState): VenueRow[] {
  const soil = soilForStep(nowMs, trip, gmxTrip);
  const pendle = validateAIPoolSelection(pendleSelection(nowMs, trip && !gmxTrip));
  const gmx = verifyGmxPoolImbalance({
    oiLongUsd: gmxTrip ? 4_500_000 : 3_000_000,
    oiShortUsd: gmxTrip ? 500_000 : 2_500_000,
    poolTvlUsd: 5_500_000,
  });
  const hl = evaluateHyperliquidSessionGuard({
    orderSizeUsd: 2_000,
    spreadBps: trip ? 25 : 10,
    sessionKeyValid: !isR20Locked(state),
    requestsInLastMinute: 5,
  });
  const camelot = evaluateCamelotV3SwapGuard({
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
  const radiant = evaluateRadiantLendingGuard({
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
  const jones = evaluateJonesVaultGuard({
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
  const soilProbe = checkSoilResistance(soil);

  return [
    { venue: "Pendle", status: gateStatus(state, pendle.passed), detail: pendle.passed ? "yield shock clear" : "yield shock trip" },
    { venue: "GMX v2", status: gateStatus(state, gmx.ok), detail: gmx.ok ? "pool balanced" : "imbalance trip" },
    { venue: "Hyperliquid", status: gateStatus(state, hl.ok), detail: hl.status },
    { venue: "Camelot V3", status: gateStatus(state, camelot.ok), detail: camelot.status },
    { venue: "Radiant", status: gateStatus(state, radiant.ok), detail: radiant.status },
    { venue: "Jones DAO", status: gateStatus(state, jones.ok), detail: jones.status },
    { venue: "Soil Fuse", status: gateStatus(state, !soilProbe.tripped), detail: soilProbe.tripped ? soilProbe.reasons.join("|") : "nominal" },
  ];
}

function printMatrix(title: string, rows: VenueRow[]): void {
  console.log(`\n${YELLOW}${title}${R}`);
  for (const row of rows) {
    const color = row.status === "ALLOW" ? GREEN : RED;
    console.log(`  ${color}${row.venue.padEnd(14)} ${row.status.padEnd(12)} ${row.detail}${R}`);
  }
}

function main(): void {
  const trip = !process.argv.includes("--healthy-only");
  const gmxTrip = process.argv.includes("--gmx");
  const nowMs = Date.now();
  printBanner("Cross-Venue Matrix · 6-Protocol Circuit Breaker");
  seedAdapterProbes(nowMs);
  __setSystemStateForTests(buildSystemState({ accountBalanceUsd: 10_000, currentCri: 100, skipHardlockAssert: true }));

  const t0 = hrtimeStart();
  printMatrix("Step 1 — Nominal multi-venue pre-flight (PASS)", evaluateAllVenues(nowMs, false, false, readActiveSystemState()));

  if (!trip) {
    console.log(`\n${GREEN}Nominal matrix PASS · ${formatLatencyLabel(hrtimeElapsedUs(t0))}${R}`);
    if (!ensureSoilWasm()) console.log(`${YELLOW}Wasm: offline (TS soil path)${R}`);
    return;
  }

  const tripLabel = gmxTrip ? "GMX pool imbalance >0.35" : "Pendle yield shock >150bps";
  console.log(`\n${RED}Step 2 — Inject anomaly: ${tripLabel}${R}`);
  const toxicSoil = soilForStep(nowMs, true, gmxTrip);
  const soilTrip = checkSoilResistance(toxicSoil);
  console.log(`  Layer-1 soil tripped=${soilTrip.tripped} · reasons=${soilTrip.reasons.join("|") || "none"}`);

  console.log(`\n${RED}Step 3 — severSigningChannel() · R20 physical deadlock${R}`);
  severSigningChannel();
  const locked = readActiveSystemState();
  console.log(`  signingChannelOpen=${locked.signingChannelOpen} · hardlock=${locked.hardlock} · cri=${locked.currentCri}`);

  const finalRows = evaluateAllVenues(nowMs, true, gmxTrip, locked);
  printMatrix("Step 4 — Global FAIL_CLOSED (zero-gas severance)", finalRows);

  const allClosed = finalRows.every((r) => r.status === "FAIL_CLOSED");
  const elapsed = formatLatencyLabel(hrtimeElapsedUs(t0));
  console.log(
    allClosed
      ? `\n${GREEN}MATRIX TRIP OK — all venues FAIL_CLOSED · ${elapsed}${R}`
      : `\n${RED}MATRIX INCOMPLETE — expected universal FAIL_CLOSED${R}`,
  );
  if (!ensureSoilWasm()) console.log(`${YELLOW}Wasm: offline (TS soil path)${R}`);
  if (!allClosed) process.exitCode = 1;
}

main();
