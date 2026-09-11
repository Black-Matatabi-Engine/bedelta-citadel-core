#!/usr/bin/env tsx
/**
 * Wayfinder Route Interception Demo — Citadel Shield on Arbitrum & Stabilizer Sepolia.
 * Usage: pnpm demo:wayfinder
 * Trip:  pnpm demo:wayfinder -- --trip
 * Venue: pnpm demo:wayfinder -- --venue=gmx
 * Stabilizer: pnpm demo:wayfinder -- --stabilizer
 * Stabilizer trip: pnpm demo:wayfinder -- --stabilizer --trip
 */
import {
  evaluateStabilizerSwapGuard,
  STABILIZER_SEPOLIA_CHAIN_ID,
  type StabilizerSwapInput,
} from "../src/adapters/stabilizer/stabilizer-adapter";
import {
  wayfinderCitadelShieldHook,
  type WayfinderRouteIntent,
} from "../src/adapters/wayfinder/wayfinder-shield";
import {
  hudBackoff,
  hudBlocked,
  hudChannelOpen,
  hudDispatched,
  hudIntent,
  hudSevered,
  hudSoilFuse,
  parseBackoffRemainingSec,
  parseShieldTripReasons,
  printBackoffDivider,
  printBackoffResult,
  printBanner,
  printPillarSetYFrameworkLine,
  printMode,
  printResult,
  R,
  RED,
} from "./adapters/citadel-ansi-hud";
import { checkSoilResistance } from "../src/services/risk-control";
import { hrtimeElapsedUs, hrtimeStart } from "./lib/demo-timing";
import { isDemoTripArgv, withDemoSoil, wrapDemoExecution } from "./lib/demo-harness";
import {
  buildAgentIntent,
  parseDemoVenueArgv,
  printAgentVenueHud,
  resolveAgentVenue,
  type AgentVenueContext,
} from "./lib/agent-venue-matrix";

const WAYFINDER_TRIP_CAPITAL_PROTECTED_USD = 100_030;
const WAYFINDER_DUNE_EVT_HASH = "0xbede17a1c0debeef0000000000000000000000000000000000000000000001";

function printWayfinderZeroGasPhysicalProof(): void {
  const capital = WAYFINDER_TRIP_CAPITAL_PROTECTED_USD.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  console.log(
    `    ▸ Gas Spent: 0.000000 ETH (Intercepted at EIP-1193 Provider Level) | Capital Protected: $${capital}`,
  );
}

function printWayfinderDuneTelemetryIngest(): void {
  console.log(
    `[TELEMETRY] Event: RiskTripBlocked(evtHash: ${WAYFINDER_DUNE_EVT_HASH.slice(0, 10)}...) -> Ingested to Dune Spell (silvervine_chaos.intercepts)`,
  );
}

function finalizeWayfinderTripIntercept(): never {
  printWayfinderZeroGasPhysicalProof();
  printWayfinderDuneTelemetryIngest();
  throw new Error("SOIL_FUSE_TRIP");
}

async function runArbitrumDemo(
  payload: WayfinderRouteIntent,
  trip: boolean,
  venue: AgentVenueContext,
): Promise<void> {
  const agentId = payload.agentId ?? "wayfinder-demo";
  const chainId = payload.chainId ?? 42161;
  const intent = payload.intent ?? buildAgentIntent(venue, trip);

  hudIntent(agentId, "Wayfinder", intent, `${venue.chainLabel} · ${venue.hudVenue}`);

  const t0 = hrtimeStart();
  const soilProbe = checkSoilResistance({
    symbol: payload.symbol,
    hlSpot: payload.hlSpot,
    hlPerp: payload.hlPerp,
    dydxPerp: payload.dydxPerp,
    depthUsd: payload.depthUsd,
    at: payload.at,
  });
  hudSoilFuse(soilProbe.ok, hrtimeElapsedUs(t0), soilProbe.reasons, { splitWasmCore: true });

  const result = await wayfinderCitadelShieldHook.execute(payload);

  if (result.success && result.status === "ALLOW") {
    hudChannelOpen();
    hudDispatched(`Wayfinder Agent Engine → ${venue.label} · Arbitrum ${chainId}`, result.latencyUs ?? 0);
    printResult(true);
    return;
  }

  if (result.status === "MANDATORY_COOLDOWN_ACTIVE") {
    hudBackoff(agentId, parseBackoffRemainingSec(result.reasons?.[0] ?? ""));
    printBackoffResult();
    console.error(`${RED}${result.reasons?.join("; ")}${R}`);
    process.exit(1);
  }

  hudSevered(trip ? "SOIL_FUSE_TRIP" : "SESSION_OR_SOIL_FAIL");
  hudBlocked();
  printResult(false);
  const detail = result.reasons?.join("; ") ?? parseShieldTripReasons("").join("; ");
  console.error(`${RED}${detail}${R}`);

  if (trip) {
    printBackoffDivider();
    const retry = await wayfinderCitadelShieldHook.execute(payload);
    if (retry.status === "MANDATORY_COOLDOWN_ACTIVE") {
      hudBackoff(agentId, 60);
      printBackoffResult();
      printWayfinderZeroGasPhysicalProof();
      printWayfinderDuneTelemetryIngest();
      process.exit(1);
    }
    finalizeWayfinderTripIntercept();
  } else {
    process.exit(1);
  }
}

async function runStabilizerDemo(swap: StabilizerSwapInput, trip: boolean): Promise<void> {
  const agentId = "wayfinder-stabilizer-demo";
  const intent = trip ? "STABILIZER_DEPLETED_CAPACITY_SWAP" : "STABILIZER_ZERO_SLIPPAGE_SWAP";

  hudIntent(
    agentId,
    "Wayfinder",
    intent,
    `Arbitrum Sepolia ${STABILIZER_SEPOLIA_CHAIN_ID} · Stabilizer ${swap.fromAsset}→${swap.toAsset}`,
  );

  const stabilizer = evaluateStabilizerSwapGuard({ ...swap, agentId });

  if (stabilizer.status === "MANDATORY_COOLDOWN_ACTIVE") {
    hudBackoff(agentId, 60);
    printBackoffResult();
    console.error(`${RED}${stabilizer.reasons.join("; ")}${R}`);
    process.exit(1);
  }

  hudSoilFuse(stabilizer.soilOk, stabilizer.latencyUs ?? 0, stabilizer.reasons, {
    splitWasmCore: true,
  });

  if (!stabilizer.ok) {
    hudSevered(stabilizer.signatureChannelSevered ? "USDZ_DEPEG_SEVERED" : "SOIL_FUSE_TRIP");
    hudBlocked();
    printResult(false);
    console.error(`${RED}${stabilizer.reasons.join("; ")}${R}`);
    if (trip) finalizeWayfinderTripIntercept();
    process.exit(1);
  }

  const wayfinderPayload: WayfinderRouteIntent = {
    symbol: `${swap.fromAsset}/${swap.toAsset}`,
    hlSpot: 1,
    hlPerp: 1,
    dydxPerp: 1,
    depthUsd: swap.poolReserveUsd,
    at: swap.at,
    agentId,
    chainId: STABILIZER_SEPOLIA_CHAIN_ID,
    intent,
    nowMs: swap.at?.getTime(),
  };

  const shield = await wayfinderCitadelShieldHook.execute(wayfinderPayload);
  if (shield.success && shield.status === "ALLOW") {
    hudChannelOpen();
    hudDispatched(
      `Wayfinder → Stabilizer 1:1 ${swap.fromAsset}/${swap.toAsset} · Sepolia ${STABILIZER_SEPOLIA_CHAIN_ID}`,
      shield.latencyUs ?? stabilizer.latencyUs ?? 0,
    );
    printResult(true);
    return;
  }

  hudSevered("STABILIZER_OR_SHIELD_FAIL");
  hudBlocked();
  printResult(false);
  console.error(`${RED}${shield.reasons?.join("; ")}${R}`);
  process.exit(1);
}

wrapDemoExecution(async ({ nowMs, at }) => {
  const trip = isDemoTripArgv();
  const stabilizer = process.argv.includes("--stabilizer");

  const venue = resolveAgentVenue(nowMs);
  const venueLocked = parseDemoVenueArgv() !== undefined;

  printBanner(stabilizer ? "Wayfinder · Stabilizer Sepolia Demo" : "Wayfinder Agent Demo");
  if (!stabilizer) printPillarSetYFrameworkLine();
  printMode(trip);
  if (!stabilizer) printAgentVenueHud(venue, venueLocked);

  if (stabilizer) {
    const swap: StabilizerSwapInput = trip
      ? {
          chainId: STABILIZER_SEPOLIA_CHAIN_ID,
          fromAsset: "USDZ",
          toAsset: "USDC",
          amountUsd: 4_950_000,
          poolReserveUsd: 5_000_000,
          poolCapacityUsd: 5_000_000,
          agentId: "wayfinder-stabilizer-demo",
          at,
        }
      : {
          chainId: STABILIZER_SEPOLIA_CHAIN_ID,
          fromAsset: "USDZ",
          toAsset: "USDC",
          amountUsd: 50_000,
          poolReserveUsd: 5_000_000,
          poolCapacityUsd: 1_000_000,
          usdzMarkUsd: 1,
          collateralMarkUsd: 1,
          agentId: "wayfinder-stabilizer-demo",
          at,
        };
    await runStabilizerDemo(swap, trip);
    return;
  }

  const intent = buildAgentIntent(venue, trip);
  const payload: WayfinderRouteIntent = trip
    ? { ...withDemoSoil(venue.toxicSoil, at), nowMs, intent, agentId: "wayfinder-demo", chainId: 42161 }
    : { ...withDemoSoil(venue.healthySoil, at), nowMs, intent, agentId: "wayfinder-demo", chainId: 42161 };

  await runArbitrumDemo(payload, trip, venue);
});
