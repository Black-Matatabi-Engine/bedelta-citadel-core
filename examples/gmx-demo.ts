#!/usr/bin/env tsx
/**
 * GMX v2 Demo — Shadow Margin, Cross-Venue Slippage & Position Cap pre-flight.
 * Usage: pnpm demo:gmx
 * Trip:  pnpm demo:gmx -- --trip
 */
import { ensureSoilWasm } from "../src/sdk";
import {
  assertGmxPayloadFailClosed,
  GMX_PAYLOAD_PRICE_IMPACT_TRIP,
} from "../src/services/adapters/gmx-v2-order-payload-guards";
import {
  buildGmxV2UnsignedOrderPayload,
  DEFAULT_GMX_EXECUTION_FEE_WEI,
} from "../src/services/adapters/gmx-v2-order-payload";
import { checkSoilResistance, RiskLimitExceeded } from "../src/services/risk-control";
import {
  estimatePreliminaryImpact,
  evaluateGmxPriceImpactSoilGate,
  gmxPriceImpactForSoil,
} from "../src/services/yield/gmx-v2-price-impact";
import {
  hudBlocked,
  hudChannelOpen,
  hudDispatched,
  hudIntent,
  hudSevered,
  hudSoilFuse,
  printBanner,
  printMode,
  printResult,
  R,
  RED,
  seedAdapterProbes,
} from "./adapters/citadel-ansi-hud";
import { formatLatencyLabel, hrtimeElapsedUs, hrtimeStart, measureSync } from "./lib/demo-timing";

const ETH_GM = "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336" as const;
const TOXIC_POOL = { longTokenUsd: 3_000_000, shortTokenUsd: 1_000_000 };

function runHealthy(): number {
  hudIntent("gmx-demo", "GMX v2", "MarketIncrease", "ETH/USD GM · Arbitrum One");
  const { value: payload, latencyUs: buildUs } = measureSync(() =>
    buildGmxV2UnsignedOrderPayload({
      side: "long",
      sizeUsd: 100,
      marketToken: ETH_GM,
      midPriceUsd: 3500,
    }),
  );
  const t1 = hrtimeStart();
  assertGmxPayloadFailClosed({
    sizeUsd: 100,
    isLong: true,
    executionFee: DEFAULT_GMX_EXECUTION_FEE_WEI,
    pool: { longTokenUsd: 5_000_000, shortTokenUsd: 2_500_000 },
  });
  const guardUs = hrtimeElapsedUs(t1);
  const soil = measureSync(() =>
    checkSoilResistance({
      symbol: "ETH",
      hlSpot: 3500,
      hlPerp: 3500,
      dydxPerp: 3500,
      depthUsd: 200_000,
      disableThresholdJitter: true,
    }),
  );
  const totalUs = buildUs + guardUs + soil.latencyUs;
  console.log(`${R}  Payload orderType=${payload.orderType} isLong=${payload.isLong} · sizeUsd=$100`);
  hudSoilFuse(soil.value.ok, soil.latencyUs, soil.value.reasons);
  hudChannelOpen();
  hudDispatched(`GMX v2 MarketIncrease · build ${formatLatencyLabel(buildUs)}`, totalUs);
  return totalUs;
}

function runTrip(): number {
  hudIntent("gmx-demo", "GMX v2", "TOXIC_PRICE_IMPACT", "ETH/USD GM · skewed pool");
  const impact = estimatePreliminaryImpact({
    orderSizeUsd: 2_000_000,
    isLong: true,
    pool: TOXIC_POOL,
  });
  const t0 = hrtimeStart();
  const gate = evaluateGmxPriceImpactSoilGate(gmxPriceImpactForSoil(impact));
  const soil = checkSoilResistance({
    symbol: "ETH",
    hlSpot: 3500,
    hlPerp: 3500,
    dydxPerp: 3500,
    depthUsd: 200_000,
    disableThresholdJitter: true,
    gmxPriceImpact: gmxPriceImpactForSoil(impact),
  });
  const latencyUs = hrtimeElapsedUs(t0);
  console.log(`${R}  Price-impact penalty=${impact.priceImpactPenaltyBps.toFixed(1)}bps · gate triggered=${gate.triggered}`);
  hudSoilFuse(false, latencyUs, soil.reasons);
  hudSevered("GMX_PRICE_IMPACT_TRIP");
  hudBlocked();
  try {
    buildGmxV2UnsignedOrderPayload({
      side: "long",
      sizeUsd: 5_000_000,
      marketToken: ETH_GM,
      midPriceUsd: 3500,
      pool: { longTokenUsd: 1_000_000, shortTokenUsd: 500_000 },
    });
  } catch (err) {
    const msg = err instanceof RiskLimitExceeded ? err.message : String(err);
    if (msg.includes(GMX_PAYLOAD_PRICE_IMPACT_TRIP)) {
      console.log(`${RED}  Payload builder: ${GMX_PAYLOAD_PRICE_IMPACT_TRIP}${R}`);
    }
  }
  return latencyUs;
}

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  if (!ensureSoilWasm()) {
    console.error(`${RED}soil_core.wasm unavailable${R}`);
    process.exit(1);
  }
  seedAdapterProbes(Date.now());
  printBanner("GMX v2 Shadow Margin Demo");
  printMode(trip);
  console.log(`${R}Latency: process.hrtime.bigint() · ${trip ? "toxic pool" : "healthy MarketIncrease"}${R}\n`);
  const latencyUs = trip ? runTrip() : runHealthy();
  console.log(`\n${R}GMX guard latency: ${formatLatencyLabel(latencyUs)}${R}\n`);
  printResult(!trip);
  if (trip) process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
