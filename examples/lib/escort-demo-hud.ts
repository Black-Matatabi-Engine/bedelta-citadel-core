/** Pillar 2 escort demo HUD — silent benchmark bar + result banners (no soil probe noise). */
import {
  BOLD,
  CYAN,
  GREEN,
  GRAY,
  RED,
  R,
} from "../adapters/citadel-ansi-hud";
import {
  BENCH_BOX_W,
  EDGE_TARGET_US,
  captureDemoBenchmark,
  formatLatencyLabel,
  type DemoBenchmarkSnapshot,
} from "./demo-timing";

const BOX_W = 63;
const BAR_W = 22;

export function muteLibraryConsole(): () => void {
  const warn = console.warn;
  const log = console.log;
  const dropJson = (fn: typeof console.warn) => (...args: unknown[]) => {
    const msg = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
    if (msg.includes('"level"') && msg.includes('"module"')) return;
    fn(...args);
  };
  console.warn = dropJson(warn);
  console.log = dropJson(log);
  return () => {
    console.warn = warn;
    console.log = log;
  };
}

function escortBar(pct: number, forceFull = false): string {
  const p = forceFull ? 100 : Math.min(100, Math.max(0, pct));
  const filled = Math.round((p / 100) * BAR_W);
  return `[${"█".repeat(filled)}${"░".repeat(BAR_W - filled)}]`;
}

function printEscortBenchmark(snapshot: DemoBenchmarkSnapshot): void {
  const e2e = snapshot.e2eHarnessUs;
  const rows = [
    { label: "Pure Invariant Time", us: snapshot.pureInvariantUs, pct: e2e > 0 ? (snapshot.pureInvariantUs / e2e) * 100 : 100, color: GREEN, pass: false, full: false },
    { label: "Full Matrix Execution", us: snapshot.fullMatrixUs, pct: e2e > 0 ? (snapshot.fullMatrixUs / e2e) * 100 : 100, color: CYAN, pass: snapshot.fullMatrixUs <= EDGE_TARGET_US, full: false },
    { label: "E2E Harness Overhead", us: snapshot.e2eHarnessUs, pct: 100, color: "\x1b[33;1m", pass: false, full: true },
  ];
  console.log(`${CYAN}┌${"─".repeat(BENCH_BOX_W)}┐${R}`);
  console.log(`${CYAN}│${R} ${BOLD}[BENCHMARK]${R} Pillar 2 Escort Harness ${CYAN}(Edge Target: <${EDGE_TARGET_US}µs)${R}`);
  for (const row of rows) {
    const pct = Math.min(100, row.pct);
    const passTag = row.pass ? ` ${GREEN}${BOLD}(PASS)${R}` : "";
    console.log(
      `${CYAN}│${R} ${row.color}${BOLD}${row.label.padEnd(22)}${R} ${escortBar(pct, row.full)} ${row.color}${BOLD}${row.full ? "100%" : `${pct.toFixed(1)}%`}${R}${passTag} ${GRAY}${formatLatencyLabel(row.us)}${R}`,
    );
  }
  console.log(`${CYAN}└${"─".repeat(BENCH_BOX_W)}┘${R}`);
}

export function printEscortBanner(snapshot: DemoBenchmarkSnapshot): void {
  const inner = ` 🛡️  SliverVine Citadel Shield · Pillar 2 Compliance Escort · Multi-Route HUD `;
  const pad = Math.max(0, BOX_W - inner.length);
  console.log(`${CYAN}┌${"─".repeat(BOX_W)}┐${R}`);
  console.log(`${CYAN}│${R}${BOLD}${"─".repeat(Math.floor(pad / 2))}${inner}${"─".repeat(Math.ceil(pad / 2))}${R}${CYAN}│${R}`);
  console.log(`${CYAN}└${"─".repeat(BOX_W)}┘${R}`);
  printEscortBenchmark(snapshot);
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
