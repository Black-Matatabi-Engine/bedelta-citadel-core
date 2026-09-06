#!/usr/bin/env tsx
/**
 * Variational Omni RFQ Demo — stale quote & OLP depth pre-flight.
 * Usage: pnpm demo:variational
 * Trip:  pnpm demo:variational -- --trip
 */
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
} from "./adapters/citadel-ansi-hud";
import { ensureDemoWasmSoft, isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
import { formatGuardTime, measureSync } from "./lib/demo-timing";
import { validateVariationalRFQIntent } from "../src/adapters/variational-rfq-adapter";

function runHealthy(nowMs: number): number {
  hudIntent("variational-demo", "Variational Omni RFQ", "RFQ_HEDGE", "LONG_TAIL_PERP · Arbitrum One");
  const { value: result, latencyUs } = measureSync(() =>
    validateVariationalRFQIntent({
      symbol: "LONG_TAIL_PERP",
      quotePriceUsd: 3500,
      oracleMarkUsd: 3500,
      quoteTimestampMs: nowMs - 100,
      nowMs,
      tradeSizeUsd: 5_000,
      olpDepthUsd: 100_000,
      longTailAsset: true,
    }),
  );
  console.log(`${R}  status=${result.status} · detail=${result.detail ?? "ok"}${R}`);
  hudSoilFuse(result.ok, latencyUs, result.reason ? [result.reason] : []);
  hudChannelOpen();
  hudDispatched("Variational Omni RFQ hedge leg", latencyUs);
  return latencyUs;
}

function runTrip(nowMs: number): number {
  hudIntent("variational-demo", "Variational Omni RFQ", "STALE_QUOTE", "LONG_TAIL_PERP · quote age breach");
  const { value: result, latencyUs } = measureSync(() =>
    validateVariationalRFQIntent({
      symbol: "LONG_TAIL_PERP",
      quotePriceUsd: 3520,
      oracleMarkUsd: 3500,
      quoteTimestampMs: nowMs - 800,
      nowMs,
      tradeSizeUsd: 50_000,
      olpDepthUsd: 100_000,
      longTailAsset: true,
    }),
  );
  console.log(`${R}  status=${result.status} · detail=${result.detail ?? "n/a"}${R}`);
  hudSoilFuse(false, latencyUs, result.reason ? [result.reason] : []);
  hudSevered(result.reason ?? "VARIATIONAL_STALE_QUOTE_BREACH");
  hudBlocked();
  if (!result.reason?.includes("FAIL_CLOSED")) {
    console.error(`${RED}Expected FAIL_CLOSED reason${R}`);
  }
  return latencyUs;
}

wrapDemoExecution(({ nowMs }) => {
  const trip = isDemoTripArgv();
  ensureDemoWasmSoft();
  printBanner("Variational Omni RFQ Guard Demo");
  printMode(trip);
  const latencyUs = trip ? runTrip(nowMs) : runHealthy(nowMs);
  console.log(`\n${R}Variational guard · ${formatGuardTime(latencyUs)}${R}\n`);
  printResult(!trip);
  if (trip) return { tripped: true, reason: "VARIATIONAL_STALE_QUOTE_BREACH" };
});
