#!/usr/bin/env tsx
/**
 * Wayfinder Route Interception Demo — Citadel Shield on Arbitrum.
 * Usage: pnpm demo:wayfinder
 * Trip:  pnpm demo:wayfinder -- --trip
 */
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
  isCooldownError,
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

async function runDemo(payload: WayfinderRouteIntent, trip: boolean): Promise<void> {
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

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  seedAdapterProbes();

  printBanner("Wayfinder Agent Demo");
  printMode(trip);

  const payload: WayfinderRouteIntent = trip
    ? { ...TOXIC_SOIL, intent: "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN", agentId: "wayfinder-demo", chainId: 42161 }
    : { ...HEALTHY_SOIL, intent: "DELTA_NEUTRAL_GM_DEPOSIT", agentId: "wayfinder-demo", chainId: 42161 };

  await runDemo(payload, trip);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
