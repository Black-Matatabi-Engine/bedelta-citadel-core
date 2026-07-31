/**
 * Top-level page accordion wrappers (Worker HTML — not React).
 * Single-expanded mode; collapsed banner is 48px.
 */
import {
  DEFAULT_ACTIVE_PAGE_STEP,
  PAGE_STEP_TITLES,
  type ActivePageStep,
} from "../../services/terminal-state";

export interface PageStepSectionOptions {
  step: ActivePageStep;
  badgeHtml: string;
  bodyHtml: string;
  /** Extra classes on the outer <section> */
  sectionClass?: string;
  /** Preserve an existing section id (e.g. totalSolutionDeck) */
  sectionId?: string;
  activeStep?: ActivePageStep;
}

export function renderPageStepSection(opts: PageStepSectionOptions): string {
  const active = opts.activeStep ?? DEFAULT_ACTIVE_PAGE_STEP;
  const isActive = opts.step === active;
  const title = PAGE_STEP_TITLES[opts.step];
  const idAttr = opts.sectionId ? ` id="${opts.sectionId}"` : ` id="pageStep${opts.step}"`;
  const extra = opts.sectionClass ? ` ${opts.sectionClass}` : "";

  return `
<section class="page-step transition-all duration-300${isActive ? " is-active" : ""}${extra}" data-page-step="${opts.step}"${idAttr}>
  <button type="button" class="page-step-bar transition-all duration-300" onclick="setPageStep(${opts.step})" aria-expanded="${isActive ? "true" : "false"}">
    <span class="page-step-title">${title}</span>
    <span class="page-step-badges transition-all duration-300" id="pageStepBadge${opts.step}">${opts.badgeHtml}</span>
    <span class="page-step-chevron transition-all duration-300" aria-hidden="true">${isActive ? "▲" : "▼"}</span>
  </button>
  <div class="page-step-panel transition-all duration-300">
    <div class="page-step-panel-inner transition-all duration-300">
      ${opts.bodyHtml}
    </div>
  </div>
</section>`;
}
