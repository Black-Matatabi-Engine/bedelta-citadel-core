/** Pillar 2 escort demo HUD — silent benchmark bar + result banners (no soil probe noise). */
import {
  BOLD,
  CYAN,
  GREEN,
  RED,
  R,
} from "../adapters/citadel-ansi-hud";
import {
  captureDemoBenchmark,
  printDynamicBenchmarkBreakdown,
  type DemoBenchmarkSnapshot,
} from "./demo-timing";

const BOX_W = 63;

function printEscortBenchmark(snapshot: DemoBenchmarkSnapshot, invariantClear = true): void {
  printDynamicBenchmarkBreakdown(snapshot, {
    invariantClear,
    title: `${BOLD}[BENCHMARK]${R} Pillar 2 Escort Harness`,
  });
}

export function printEscortBanner(snapshot: DemoBenchmarkSnapshot, invariantClear = true): void {
  const inner = ` 🛡️  SliverVine Sanctuary · Compliance Escort · Multi-Route HUD `;
  const pad = Math.max(0, BOX_W - inner.length);
  console.log(`${CYAN}┌${"─".repeat(BOX_W)}┐${R}`);
  console.log(`${CYAN}│${R}${BOLD}${"─".repeat(Math.floor(pad / 2))}${inner}${"─".repeat(Math.ceil(pad / 2))}${R}${CYAN}│${R}`);
  console.log(`${CYAN}└${"─".repeat(BOX_W)}┘${R}`);
  printEscortBenchmark(snapshot, invariantClear);
}

export function printEscortResult(trip: boolean): void {
  const line = "═".repeat(BOX_W + 2);
  if (trip) {
    console.log(`\n${RED}${line}${R}`);
    console.log(`${RED}${BOLD}RESULT: 🛑 LIFECYCLE COMPLETE: FAIL_CLOSED (0-Gas Intercepted)${R}`);
    console.log(`${RED}${line}${R}`);
    return;
  }
  console.log(`\n${GREEN}${line}${R}`);
  console.log(`${GREEN}${BOLD}RESULT: 🟢 LIFECYCLE COMPLETE: COMPLIANCE_ESCORT_SETTLED (lostUsd ≡ 0 Verified)${R}`);
  console.log(`${GREEN}${line}${R}`);
}

export { captureDemoBenchmark, type DemoBenchmarkSnapshot };
