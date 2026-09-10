/** Standardized Pillar Set Y venue demo HUD — aligned with matrix-cross-venue-demo.ts. */
import { GMX_POOL_IMBALANCE_MAX_RATIO } from "../../src/adapters/gmx/gmx-v2-invariants";
import { HL_SPREAD_MAX_BPS } from "../../src/core/risk-engine-limits";
import { BOLD, GRAY, GREEN, R, RED, YELLOW } from "../adapters/citadel-ansi-hud";
import {
  GUARD_BRIGHT_GREEN,
  printE2eShieldLatencyBlock,
  printReflexCoreDeadlockBlock,
  type DemoBenchmarkSnapshot,
} from "./demo-timing";
import {
  type BreachLine,
  printBreachBreakdown,
  printTripSoilReject,
} from "./matrix-demo-hud";

export type { BreachLine };

export function printVenuePreflightHeader(pass = true): void {
  const label = pass ? "Step 1 — Pre-flight validation (PASS)" : "Invariant Breach Interception";
  console.log(`\n${pass ? YELLOW : RED}${BOLD}${label}${R}`);
}

export function printVenueRow(venue: string, ok: boolean, detail: string): void {
  const color = ok ? GREEN : RED;
  const status = ok ? "ALLOW" : "FAIL_CLOSED";
  console.log(`  ${color}${venue.padEnd(16)} ${status.padEnd(12)}${R} ${GRAY}${detail}${R}`);
}

export function printVenueDispatchAllowed(): void {
  const tag = `${GUARD_BRIGHT_GREEN}${BOLD}[DISPATCH]${R}`;
  console.log(`  ${tag} ${GREEN}ALLOWED${R} ${GRAY}->${R} pre-broadcast clearance ok`);
}

export function printVenueHappyClear(): void {
  console.log(`\n${GREEN}${BOLD}🟢 ALL INVARIANTS CLEAR — Signature Released (Pre-Broadcast Allowed)${R}`);
}

export function finalizeVenueHappy(benchmark: DemoBenchmarkSnapshot): void {
  printVenueDispatchAllowed();
  printVenueHappyClear();
  printE2eShieldLatencyBlock(benchmark.fullMatrixUs);
}

export function finalizeVenueTrip(breachLines: BreachLine[], benchmark: DemoBenchmarkSnapshot): void {
  printTripSoilReject();
  printBreachBreakdown(breachLines);
  printReflexCoreDeadlockBlock(benchmark.fullMatrixUs);
}

export const GMX_TRIP_BREACHES: BreachLine[] = [
  { label: "Price Impact", value: ">50.0 bps", limit: "LIMIT: ≤50.0 bps" },
  { label: "Pool Skew", value: "0.667", limit: `LIMIT: imbalance ≤${GMX_POOL_IMBALANCE_MAX_RATIO}` },
];

export const HL_TRIP_BREACHES: BreachLine[] = [
  { label: "Orderbook Spread", value: "28.0 bps", limit: `LIMIT: ≤${HL_SPREAD_MAX_BPS}.0 bps` },
];

export function pendleTripBreaches(): BreachLine[] {
  const driftBps = Math.abs(0.05 - 0.095) * 10_000;
  return [{ label: "Yield Shock", value: `${driftBps.toFixed(1)} bps`, limit: "LIMIT: >150.0 bps" }];
}
