/** E2E top banner, execution mode, clock, and pipeline roadmap ANSI HUD. */
import type { E2eDemoMode } from "./e2e-demo-constants";
import {
  BLUE,
  BOLD,
  BOLD_CYAN,
  BOLD_GREEN,
  BOLD_RED,
  BOLD_YELLOW,
  BRIGHT_CYAN,
  BRIGHT_GREEN,
  BRIGHT_MAGENTA,
  CYAN,
  RESET,
  YELLOW,
  e2eLogColored,
  useColor,
  wrap,
} from "./e2e-hud-ansi";

const BANNER_FRAME = [
  "  ┌─ SliverVine Citadel Shield ─────────────────────────────────────┐",
  "  │  BeΔ Living Water v1.0 · 5-Step Grant E2E Demo                  │",
  "  └────────────────────────────────────────────────────────────────┘",
] as const;

const PIPELINE_BADGES = [
  { label: "Intent+Deadman", color: BRIGHT_CYAN },
  { label: "Robinhood Escort", color: BRIGHT_MAGENTA },
  { label: "GMX GM Deposit", color: `${BOLD}${YELLOW}` },
  { label: "HL Session Hedge", color: BLUE },
  { label: "R20 Panic Flash", color: BOLD_RED },
] as const;

function paintBannerSubtitle(): string {
  if (!useColor) return "  │  Sepolia Gate · p50 ~106µs · Δnet ≡ 0 · lostUsd ≡ 0            │";
  return `${CYAN}  │  Sepolia Gate · p50 ~106µs · ${RESET}${BOLD_GREEN}Δnet ≡ 0${RESET}${CYAN} · ${RESET}${BOLD_GREEN}lostUsd ≡ 0${RESET}${CYAN}            │${RESET}`;
}

function paintPipelineRoadmap(): string {
  const arrow = wrap(BRIGHT_GREEN, "➔");
  return PIPELINE_BADGES
    .map((node, index) => {
      const badge = wrap(node.color, node.label);
      return index === 0 ? badge : `${arrow} ${badge}`;
    })
    .join(" ");
}

export function paintE2eBanner(): void {
  e2eLogColored(useColor ? `${CYAN}${BANNER_FRAME[0]}${RESET}` : BANNER_FRAME[0]);
  e2eLogColored(useColor ? `${CYAN}${BANNER_FRAME[1]}${RESET}` : BANNER_FRAME[1]);
  e2eLogColored(paintBannerSubtitle());
  e2eLogColored(useColor ? `${CYAN}${BANNER_FRAME[2]}${RESET}` : BANNER_FRAME[2]);
}

export function logE2eHeaderMode(mode: E2eDemoMode): void {
  const value = mode === "live" ? "LIVE_HEDGE" : "DRY_RUN";
  const painted = mode === "live" ? wrap(BOLD_YELLOW, value) : wrap(BOLD_CYAN, value);
  e2eLogColored(`Mode: ${painted}  (default dry-run; pass --hedge-live to enable)`);
}

export function logE2eHeaderClock(livingWater: boolean): void {
  const value = livingWater ? "LIVING_WATER (Date.now)" : "JUDGE_SAFE (HKT 14:00 mock)";
  e2eLogColored(`Clock: ${wrap(BOLD_GREEN, value)}`);
}

export function logE2ePipelineRoadmap(): void {
  e2eLogColored(`Pipeline: ${paintPipelineRoadmap()}`);
}
