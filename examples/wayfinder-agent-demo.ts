#!/usr/bin/env tsx
/**
 * Wayfinder Route Interception Demo — Citadel Shield on Arbitrum & Stabilizer Sepolia.
 * Usage: pnpm demo:wayfinder
 * Trip:  pnpm demo:wayfinder -- --trip
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
  HEALTHY_SOIL,
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
  printMode,
  printResult,
  R,
  RED,
  seedAdapterProbes,
  TOXIC_SOIL,
} from "./adapters/citadel-ansi-hud";
import { checkSoilResistance } from "../src/services/risk-control";

async function runArbitrumDemo(payload: WayfinderRouteIntent, trip: boolean): Promise<void> {
  const agentId = payload.agentId ?? "wayfinder-demo";
  const chainId = payload.chainId ?? 42161;
  const intent = payload.intent ?? "WAYFINDER_ONCHAIN_INTENT";

  hudIntent(agentId, "Wayfinder", intent, `Arbitrum ${chainId} · GMX v2 ETH/USDC GM`);

  const t0 = performance.now();
  const soilProbe = checkSoilResistance({
    symbol: payload.symbol,
    hlSpot: payload.hlSpot,
    hlPerp: payload.hlPerp,
    dydxPerp: payload.dydxPerp,
    depthUsd: payload.depthUsd,
    at: payload.at,
  });
  hudSoilFuse(soilProbe.ok, (performance.now() - t0) * 1000, soilProbe.reasons);

  const result = await wayfinderCitadelShieldHook.execute(payload);

  if (result.success && result.status === "ALLOW") {
    hudChannelOpen();
    hudDispatched(`Wayfinder Agent Engine → Arbitrum ${chainId}`, result.latencyUs ?? 0);
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
      process.exit(1);
    }
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

  hudSoilFuse(stabilizer.soilOk, stabilizer.latencyUs ?? 0, stabilizer.reasons);

  if (!stabilizer.ok) {
    hudSevered(stabilizer.signatureChannelSevered ? "USDZ_DEPEG_SEVERED" : "SOIL_FUSE_TRIP");
    hudBlocked();
    printResult(false);
    console.error(`${RED}${stabilizer.reasons.join("; ")}${R}`);
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

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  const stabilizer = process.argv.includes("--stabilizer");
  const now = new Date();
  seedAdapterProbes(now.getTime());

  printBanner(stabilizer ? "Wayfinder · Stabilizer Sepolia Demo" : "Wayfinder Agent Demo");
  printMode(trip);

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
          at: now,
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
          at: now,
        };
    await runStabilizerDemo(swap, trip);
    return;
  }

  const payload: WayfinderRouteIntent = trip
    ? { ...TOXIC_SOIL, at: now, intent: "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN", agentId: "wayfinder-demo", chainId: 42161 }
    : { ...HEALTHY_SOIL, at: now, intent: "DELTA_NEUTRAL_GM_DEPOSIT", agentId: "wayfinder-demo", chainId: 42161 };

  await runArbitrumDemo(payload, trip);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
