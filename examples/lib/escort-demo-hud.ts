/** Pillar 2 escort demo HUD — silent benchmark bar + result banners (no soil probe noise). */
import {
  BOLD,
  GREEN,
  RED,
  R,
} from "../adapters/citadel-ansi-hud";
import {
  captureDemoBenchmark,
  printDynamicBenchmarkBreakdown,
  type DemoBenchmarkSnapshot,
} from "./demo-timing";
import { printModuleBBanner, printOpSecFootnote } from "./demo-module-banners";

const BOX_W = 63;

function printEscortBenchmark(snapshot: DemoBenchmarkSnapshot, invariantClear = true): void {
  printDynamicBenchmarkBreakdown(snapshot, {
    invariantClear,
    title: `${BOLD}[BENCHMARK]${R} Pillar 2 Escort Harness`,
  });
}

export function printEscortBanner(snapshot: DemoBenchmarkSnapshot, invariantClear = true): void {
  printModuleBBanner();
  printEscortBenchmark(snapshot, invariantClear);
}

export function printEscortResult(trip: boolean): void {
  const line = "═".repeat(BOX_W + 2);
  if (trip) {
    console.log(`\n${RED}${line}${R}`);
    console.log(`${RED}${BOLD}RESULT: 🛑 LIFECYCLE COMPLETE: FAIL_CLOSED (0-Gas Intercepted)${R}`);
    console.log(`${RED}${line}${R}`);
    printOpSecFootnote();
    return;
  }
  console.log(`\n${GREEN}${line}${R}`);
  console.log(`${GREEN}${BOLD}RESULT: 🟢 LIFECYCLE COMPLETE: COMPLIANCE_ESCORT_SETTLED (lostUsd ≡ 0 Verified)${R}`);
  console.log(`${GREEN}${line}${R}`);
  printOpSecFootnote();
}

export { captureDemoBenchmark, type DemoBenchmarkSnapshot };
