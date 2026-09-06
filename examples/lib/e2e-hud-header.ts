/** E2E top banner, execution mode, clock, and pipeline roadmap ANSI HUD. */
import type { E2eDemoMode } from "./e2e-demo-constants";
import {
  BOLD_CYAN,
  BOLD_GREEN,
  BOLD_YELLOW,
  BRIGHT_GREEN,
  CYAN,
  RESET,
  e2eLogColored,
  useColor,
  wrap,
} from "./e2e-hud-ansi";
import { E2E_EXECUTION_PIPELINE_STEPS, E2E_R20_SHIELD } from "./e2e-hud-step-theme";

const BANNER_FRAME = [
  "  ┌─ SliverVine Citadel Shield ─────────────────────────────────────┐",
  "  │  BeΔ Living Water v1.0 · 5-Step Grant E2E Demo                  │",
  "  └────────────────────────────────────────────────────────────────┘",
] as const;

function paintBannerSubtitle(): string {
  if (!useColor) return "  │  Sepolia Gate · p50 ~106µs · Δnet ≡ 0 · lostUsd ≡ 0            │";
  return `${CYAN}  │  Sepolia Gate · p50 ~106µs · ${RESET}${BOLD_GREEN}Δnet ≡ 0${RESET}${CYAN} · ${RESET}${BOLD_GREEN}lostUsd ≡ 0${RESET}${CYAN}            │${RESET}`;
}

function paintExecutionPipelineRoadmap(): string {
  const arrow = wrap(BRIGHT_GREEN, "➔");
  return E2E_EXECUTION_PIPELINE_STEPS
    .map((node, index) => {
      const badge = wrap(node.color, `[${node.step}] ${node.label}`);
      return index === 0 ? badge : `${arrow} ${badge}`;
    })
    .join(" ");
}

function paintR20ShieldLine(): string {
  const shield = `${E2E_R20_SHIELD.prefix} ${E2E_R20_SHIELD.label}`;
  return useColor ? `Shield:   ${wrap(E2E_R20_SHIELD.color, shield)}` : `Shield:   ${shield}`;
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
  e2eLogColored(`Pipeline: ${paintExecutionPipelineRoadmap()}`);
  e2eLogColored(paintR20ShieldLine());
}
