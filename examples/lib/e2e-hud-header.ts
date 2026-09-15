/** E2E top banner, execution mode, clock, and pipeline roadmap ANSI HUD. */
import type { E2eDemoMode } from "./e2e-demo-constants";
import { E2E_LOST_USD_INVARIANT } from "./e2e-demo-constants";
import {
  BOLD,
  BOLD_CYAN,
  BOLD_GREEN,
  BOLD_YELLOW,
  BRIGHT_CYAN,
  BRIGHT_GREEN,
  BRIGHT_MAGENTA,
  CYAN,
  RESET,
  e2eLogColored,
  useColor,
  wrap,
} from "./e2e-hud-ansi";
import { e2eDoubleBoxClose, e2eDoubleBoxOpen } from "./e2e-hud-box";
import { E2E_EXECUTION_PIPELINE_STEPS, E2E_R20_SHIELD } from "./e2e-hud-step-theme";

const BANNER_GATE_LABEL = "Arbitrum Sepolia / Robinhood Gate";

export function paintE2eBanner(): void {
  e2eDoubleBoxOpen(
    [
      ` ${BOLD}SliverVine Protocol — Dual-Module E2E Lifecycle${RESET}`,
      " Module A (ExoMesh ~70%) + Module B (Sanctuary ~30%) · Pillar Set Y & X",
      ` ${BANNER_GATE_LABEL} · p50 ~106µs · ${E2E_LOST_USD_INVARIANT}`,
    ],
    CYAN,
  );
  e2eDoubleBoxClose(CYAN);
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
  const shield = E2E_R20_SHIELD.label;
  return useColor ? `Shield:   ${wrap(E2E_R20_SHIELD.color, shield)}` : `Shield:   ${shield}`;
}

export function logE2ePipelineRoadmap(): void {
  e2eLogColored(`Pipeline: ${paintExecutionPipelineRoadmap()}`);
  e2eLogColored(paintR20ShieldLine());
}
