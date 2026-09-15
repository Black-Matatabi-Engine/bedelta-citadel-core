/** Sanctuary ERC-7540+ demo HUD — box-drawn limitation vs enhancement scenarios. */
/// <reference types="node" />
import * as readline from "readline/promises";
import { BOLD, CYAN, GRAY, GREEN, R, RED, YELLOW } from "../adapters/citadel-ansi-hud";
import { isDemoJsonArgv, releaseDemoStdin } from "./demo-utils";
import {
  CORE_BRIGHT_CYAN,
  formatLatencyLabel,
  printPerfHierarchyHud,
  type DemoBenchmarkSnapshot,
} from "./demo-timing";
import { printModuleBBanner, printOpSecFootnote } from "./demo-module-banners";

const BOX_W = 74;
const TAG_WASM = `${CYAN}${BOLD}[WASM REFLEX]${R}`;
const TAG_GATE = `${RED}${BOLD}[PRE-CONSENSUS GATE]${R}`;

export type SanctuaryScenarioId = "A" | "B" | "C";

export interface SanctuaryScenarioHud {
  id: SanctuaryScenarioId;
  title: string;
  frameColor: string;
  limitation: string;
  enhancement: string;
  detailLines: readonly string[];
  wasmUs: number;
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

export function printSanctuaryBanner(benchmark: DemoBenchmarkSnapshot): void {
  printModuleBBanner();
  printPerfHierarchyHud(benchmark);
}

export function printSanctuaryProofHighlights(): void {
  console.log("");
  boxOpen(CYAN);
  boxLine(` ${BOLD}Sanctuary ERC-7540+ — 3 Key Proofs${R}`, CYAN);
  boxRule(CYAN);
  boxLine(` ${GREEN}Scenario A${R} ${GRAY}· Valid Whitelisted Escort (drift=2 bps ≤ 50)${R}`, CYAN);
  boxLine(
    ` ${RED}Scenario B${R} ${GRAY}· Raw ERC-7540 Operator Hijack 0-Gas Interception (setOperator block)${R}`,
    CYAN,
  );
  boxLine(
    ` ${RED}Scenario C${R} ${GRAY}· Pending→Claimable High-Slippage Fail-Closed (drift=2000 bps > 50)${R}`,
    CYAN,
  );
  boxClose(CYAN);
  console.log("");
}

export async function awaitSanctuaryScenarioTransition(nextId: SanctuaryScenarioId): Promise<void> {
  if (isDemoJsonArgv() || !process.stdin.isTTY) return;
  console.log(`\n${GRAY}Press ENTER to advance to next Scenario (${nextId})...${R}`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    await rl.question("");
  } finally {
    rl.close();
    releaseDemoStdin();
  }
}

export function printSanctuaryScenario(hud: SanctuaryScenarioHud): void {
  const { frameColor, id, title } = hud;
  console.log("");
  boxOpen(frameColor);
  boxLine(` ${BOLD}Scenario ${id}: ${title}${R}`, frameColor);
  boxRule(frameColor);
  boxLine(` ${YELLOW}${BOLD}⚠️  RAW ERC-7540 LIMITATION${R}`, frameColor);
  boxLine(` ${GRAY}${hud.limitation}${R}`, frameColor);
  boxRule(frameColor);
  boxLine(` ${GREEN}${BOLD}🛡️  SLIVERVINE SANCTUARY ENHANCEMENT (ERC-7540+)${R}`, frameColor);
  boxLine(` ${GRAY}${hud.enhancement}${R}`, frameColor);
  boxRule(frameColor);
  for (const line of hud.detailLines) {
    boxLine(` ${CYAN}[ERC-7540 ASYNC VAULT]${R} ${GRAY}${line}${R}`, frameColor);
  }
  boxLine(
    ` ${TAG_WASM} ${CORE_BRIGHT_CYAN}${BOLD}⚡ ${formatLatencyLabel(hud.wasmUs)} SSRC Escort Eval${R}`,
    frameColor,
  );
  if (hud.gateLine) {
    boxLine(` ${TAG_GATE} ${RED}${hud.gateLine}${R}`, frameColor);
  }
  boxRule(frameColor);
  const resultColor = hud.pass ? GREEN : RED;
  boxLine(` ${resultColor}${BOLD}[RESULT]${R} ${hud.resultLine}`, frameColor);
  boxClose(frameColor);
  printOpSecFootnote();
}

export function printSanctuaryMatrixComplete(): void {
  const line = "═".repeat(BOX_W);
  console.log(`\n${GREEN}${line}${R}`);
  console.log(
    `${GREEN}${BOLD}RESULT: ✅ Sanctuary Async Escort Matrix Complete — Scenarios A–C Replayed` +
      ` (ALLOW · REJECT_OPERATOR · REJECT_SLIPPAGE)${R}`,
  );
  console.log(`${GREEN}${line}${R}\n`);
}

export const SANCTUARY_SCENARIO_TITLES: Record<SanctuaryScenarioId, string> = {
  A: "ALLOW_DEPOSIT — Valid requestDeposit() · Whitelisted Controller",
  B: "REJECT_UNAUTHORIZED_OPERATOR — Malicious setOperator() Blocked",
  C: "REJECT_ASYNC_SLIPPAGE — High-Slippage Async Vault Request Rejected",
};
