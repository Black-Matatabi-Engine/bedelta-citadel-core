/** Module A / Module B SSOT taxonomy banners for CLI demos. */
import { BOLD, CYAN, GRAY, R } from "../adapters/citadel-ansi-hud";

const BOX_W_MIN = 92;

export const MODULE_A_BANNER_LINES = [
  "🛡️ SliverVine ExoMesh (Module A · ~70% Surface)",
  "ExoMesh Agentic Guard (EIP-1193/5792/6963+) · Pre-Consensus Exoskeleton",
  "Engine: Stylus ReflexCore (SSRC) · soil_core.wasm + Arbitrum Stylus Coprocessor (Sub-1.8µs Warm Path)",
] as const;

export const MODULE_B_BANNER_LINES = [
  "🏛️ SliverVine Sanctuary (Module B · ~30% Surface)",
  "Sanctuary Async Escort (ERC-7540+) · Treasury Escort Router",
  "Ingress: Across / Robinhood AML Ingress · Pillar Set X Risk Engine",
] as const;

export const OPSEC_FFI_FOOTNOTE =
  "[OpSec]: Pre-consensus hot-path logic encapsulated inside pkg/soil_core.wasm FFI boundary.";

function padBanner(text: string, width: number): string {
  const inner = ` ${text} `;
  const pad = Math.max(0, width - inner.length);
  return `${"─".repeat(Math.floor(pad / 2))}${inner}${"─".repeat(Math.ceil(pad / 2))}`;
}

function printModuleBanner(lines: readonly string[], extraLines: readonly string[] = []): void {
  const all = [...lines, ...extraLines];
  const w = Math.max(BOX_W_MIN, ...all.map((line) => line.length + 4));
  console.log(`${CYAN}┌${"─".repeat(w)}┐${R}`);
  for (const line of all) {
    console.log(`${CYAN}│${R}${BOLD}${padBanner(line, w)}${R}${CYAN}│${R}`);
  }
  console.log(`${CYAN}└${"─".repeat(w)}┘${R}`);
}

export function printModuleABanner(extraLine?: string): void {
  printModuleBanner(MODULE_A_BANNER_LINES, extraLine ? [extraLine] : []);
}

export function printModuleBBanner(): void {
  printModuleBanner(MODULE_B_BANNER_LINES);
}

export function printOpSecFootnote(): void {
  console.log(`${GRAY}${OPSEC_FFI_FOOTNOTE}${R}`);
}
