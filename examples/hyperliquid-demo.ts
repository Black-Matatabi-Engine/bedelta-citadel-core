#!/usr/bin/env tsx
/**
 * Hyperliquid Demo — Session Key Auth & Orderbook Depth / WS Guard.
 * Usage: pnpm demo:hl
 * Trip:  pnpm demo:hl -- --trip
 */
import { Wallet, verifyTypedData } from "ethers";
import {
  HL_APPROVE_AGENT_TYPES,
  HL_SESSION_KEY_AGENT_NAME,
  HL_USER_SIGNED_CHAIN_ID,
  buildUserSignedDomain,
  createSessionKeyAgent,
  verifySessionKeyValidity,
} from "../src/adapters/hl/auth";
import { evaluateHyperliquidSessionGuard } from "../src/adapters/hl/hyperliquid-session-guard";
import { evaluateWsSoilResistance } from "../src/adapters/hl/websocket";
import { ensureSoilWasm } from "../src/sdk";
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
import { formatGuardTime, hrtimeElapsedUs, hrtimeStart, measureAsync } from "./lib/demo-timing";
import {
  TEST_AGENT_ADDRESS,
  TEST_MASTER_ADDRESS,
  TEST_PRIVATE_KEY,
} from "../tests/adapters/hl/auth-lib/auth-fixtures";

const SESSION_MS = 86_400_000;
const HEALTHY_SOIL = {
  symbol: "ETH",
  hlSpot: 3500,
  hlPerp: 3500,
  dydxPerp: 3500,
  depthUsd: 200_000,
  disableThresholdJitter: true,
};

async function runHealthy(nowMs: number): Promise<number> {
  hudIntent("hl-demo", "Hyperliquid", "ApproveAgent", "HL L1 · session key");
  const masterWallet = new Wallet(TEST_PRIVATE_KEY);
  const { value: result, latencyUs } = await measureAsync(() =>
    createSessionKeyAgent(masterWallet, TEST_AGENT_ADDRESS, SESSION_MS, { nonce: nowMs }),
  );
  const domain = buildUserSignedDomain(HL_USER_SIGNED_CHAIN_ID);
  const recovered = verifyTypedData(
    domain,
    HL_APPROVE_AGENT_TYPES,
    {
      hyperliquidChain: result.action.hyperliquidChain,
      agentAddress: result.action.agentAddress,
      agentName: result.action.agentName,
      nonce: result.action.nonce,
    },
    result.signature,
  );
  const valid = verifySessionKeyValidity(TEST_AGENT_ADDRESS, result.expiresAt);
  const sessionGuard = evaluateHyperliquidSessionGuard({
    orderSizeUsd: 2_000,
    spreadBps: 12,
    requestsInLastMinute: 5,
    sessionKeyValid: valid,
  });
  console.log(
    `${R}  EIP-712 recovered=${recovered.slice(0, 10)}… · session valid=${valid} · agent=${HL_SESSION_KEY_AGENT_NAME} · guard=${sessionGuard.status}`,
  );
  hudSoilFuse(sessionGuard.ok, latencyUs, sessionGuard.reasons);
  hudChannelOpen();
  hudDispatched("Hyperliquid ApproveAgent → L1 dispatch channel", latencyUs);
  return latencyUs;
}

function runTrip(nowMs: number): number {
  hudIntent("hl-demo", "Hyperliquid", "SPREAD_TRIP", "HL L1 orderbook · >20bps spread");
  const t0 = hrtimeStart();
  const sessionGuard = evaluateHyperliquidSessionGuard({
    orderSizeUsd: 6_000,
    spreadBps: 28,
    requestsInLastMinute: 5,
    sessionKeyValid: true,
  });
  const health = {
    connected: true,
    latencyMs: 80,
    lastMessageAt: nowMs,
    lastPingAt: nowMs - 1_000,
    stale: false,
    reconnectAttempts: 0,
    soilTripped: false,
    tripReasons: [] as string[],
  };
  const fused = evaluateWsSoilResistance(health, HEALTHY_SOIL);
  const latencyUs = hrtimeElapsedUs(t0);
  const reasons = [...sessionGuard.reasons, ...(fused.tripped ? fused.reasons : [])];
  console.log(`${R}  spread=28bps (>20bps) · maxSize breach · session guard=${sessionGuard.status}`);
  hudSoilFuse(false, latencyUs, reasons.length ? reasons : ["HL_ORDERBOOK_SPREAD_BREACH"]);
  hudSevered("HL_ORDERBOOK_SPREAD_BREACH");
  hudBlocked();
  return latencyUs;
}

async function main(): Promise<void> {
  const trip = process.argv.includes("--trip");
  if (!ensureSoilWasm()) {
    console.error(`${RED}soil_core.wasm unavailable${R}`);
    process.exit(1);
  }
  const nowMs = Date.now();
  seedAdapterProbes(nowMs);
  printBanner("Hyperliquid Session Key Demo");
  printMode(trip);
  const latencyUs = trip ? runTrip(nowMs) : await runHealthy(nowMs);
  console.log(`\n${R}HL guard · ${formatGuardTime(latencyUs)}${R}\n`);
  printResult(!trip);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
