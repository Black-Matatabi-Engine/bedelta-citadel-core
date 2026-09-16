/** Treasury ingress demo HUD — box-drawn ERC-7683/7579 limitation vs enhancement scenarios. */
/// <reference types="node" />
import * as readline from "readline/promises";
import { BOLD, CYAN, GRAY, GREEN, R, RED, YELLOW } from "../adapters/citadel-ansi-hud";
import { CORE_BRIGHT_CYAN, formatLatencyLabel, printPerfHierarchyHud, type DemoBenchmarkSnapshot } from "./demo-timing";
import { isDemoJsonArgv, releaseDemoStdin } from "./demo-utils";
import { printModuleBIngressBanner, printOpSecFootnote } from "./demo-module-banners";

const BOX_W = 74;
const DETAIL_LABEL_W = 14;
const MODULE_TAG = `${CYAN}${BOLD}[Module B: Sanctuary · Pillar Set X Ingress]${R}`;
const TAG_GATE = `${RED}${BOLD}[PRE-CONSENSUS GATE]${R}`;

export type IngressScenarioId = "A" | "B" | "C";

export interface IngressScenarioDetail {
  label: string;
  value: string;
}

export interface IngressScenarioHud {
  id: IngressScenarioId;
  title: string;
  frameColor: string;
  limitation: string;
  enhancement: string;
  detailFields: readonly IngressScenarioDetail[];
  latencyUs?: number;
  pass: boolean;
  resultLine: string;
  gateLine?: string;
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function boxLine(inner: string, color: string): void {
  const pad = Math.max(0, BOX_W - 2 - stripAnsi(inner).length);
  console.log(`${color}│${R}${inner}${" ".repeat(pad)}${color}│${R}`);
}

function boxRule(color: string): void {
  console.log(`${color}├${"─".repeat(BOX_W - 2)}┤${R}`);
}

function boxOpen(color: string): void {
  console.log(`${color}┌${"─".repeat(BOX_W - 2)}┐${R}`);
}

function boxClose(color: string): void {
  console.log(`${color}└${"─".repeat(BOX_W - 2)}┘${R}`);
}

export function printIngressBanner(benchmark: DemoBenchmarkSnapshot): void {
  printModuleBIngressBanner();
  printPerfHierarchyHud(benchmark);
}

export async function awaitIngressScenarioTransition(nextId: IngressScenarioId): Promise<void> {
  if (isDemoJsonArgv() || !process.stdin.isTTY) return;
  console.log(`\n${GRAY}Press ENTER to advance to Scenario ${nextId}...${R}`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    await rl.question("");
  } finally {
    rl.close();
    releaseDemoStdin();
  }
}

export function printIngressScenario(hud: IngressScenarioHud): void {
  const { frameColor, id, title } = hud;
  console.log("");
  boxOpen(frameColor);
  boxLine(` ${BOLD}Scenario ${id}: ${title}${R}`, frameColor);
  boxLine(` ${MODULE_TAG}`, frameColor);
  boxRule(frameColor);
  boxLine(` ${YELLOW}${BOLD}⚠️  RAW CROSS-CHAIN / ERC-7683 LIMITATION${R}`, frameColor);
  boxLine(` ${GRAY}${hud.limitation}${R}`, frameColor);
  boxRule(frameColor);
  boxLine(` ${GREEN}${BOLD}🛡️  SLIVERVINE SANCTUARY ENHANCEMENT${R}`, frameColor);
  boxLine(` ${GRAY}${hud.enhancement}${R}`, frameColor);
  boxRule(frameColor);
  for (const { label, value } of hud.detailFields) {
    boxLine(` ${GRAY}${label.padEnd(DETAIL_LABEL_W)}${R} ${value}`, frameColor);
  }
  if (hud.latencyUs !== undefined) {
    boxLine(
      ` ${CORE_BRIGHT_CYAN}${BOLD}⚡ ${formatLatencyLabel(hud.latencyUs)} Escort Router Eval${R}`,
      frameColor,
    );
  }
  if (hud.gateLine) {
    boxLine(` ${TAG_GATE} ${RED}${hud.gateLine}${R}`, frameColor);
  }
  boxRule(frameColor);
  const resultColor = hud.pass ? GREEN : RED;
  boxLine(` ${resultColor}${BOLD}[RESULT]${R} ${hud.resultLine}`, frameColor);
  boxClose(frameColor);
  printOpSecFootnote();
}

export function printIngressResult(trip: boolean): void {
  const line = "═".repeat(BOX_W);
  if (trip) {
    console.log(`\n${RED}${line}${R}`);
    console.log(`${RED}${BOLD}RESULT: 🛑 LIFECYCLE COMPLETE: FAIL_CLOSED (0-Gas Intercepted)${R}`);
    console.log(`${RED}${line}${R}\n`);
    printOpSecFootnote();
    return;
  }
  console.log(`\n${GREEN}${line}${R}`);
  console.log(
    `${GREEN}${BOLD}RESULT: 🟢 INGRESS MATRIX VERIFIED: 3/3 SCENARIOS PASSED (lostUsd = $0.00 · AML Shield Active)${R}`,
  );
  console.log(`${GREEN}${line}${R}\n`);
  printOpSecFootnote();
}

export const INGRESS_SCENARIO_TITLES: Record<IngressScenarioId, string> = {
  A: "GMX / Pendle Escort — Robinhood → Arbitrum One",
  B: "Hyperliquid L1 Bridge Topology Guard",
  C: "Arbitrum One → Base Outbound + AML Inbound Block",
};

/** @deprecated Use INGRESS_SCENARIO_TITLES */
export const INGRESS_ROUTE_TITLES = INGRESS_SCENARIO_TITLES;

/** @deprecated Use printIngressScenario */
export const printIngressRoute = printIngressScenario;
