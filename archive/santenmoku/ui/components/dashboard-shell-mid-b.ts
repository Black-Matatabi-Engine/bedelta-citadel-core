import type { DashboardBuildContext } from "./ui-helpers";

export function renderDashboardShellMidHtmlPartB(ctx: DashboardBuildContext): string {
  const {
    brandShield,
  } = ctx;
  return `
    <aside class="sniper-rail bg-[#50D2C1] text-slate-950" id="sniperExecutionShield" aria-label="Sniper Execution Shield">
      <div class="mb-1 flex items-center gap-2 flex-wrap">
        <span class="step-badge typo-action text-slate-950 border border-slate-900/40 px-2 py-0.5 rounded">Step 3</span>
        <h2 class="section-header typo-title m-0 text-slate-950 inline-flex-shield">${brandShield("brand-shield-icon-md", 20)} Step 3: Sniper Execution Shield</h2>
      </div>
      <div class="step3-emergency-row">
        <button type="button" class="emergency-close-all-btn" onclick="emergencyCloseAllPositions()" title="Instant mock exit of all positions">
          🚨 EMERGENCY CLOSE ALL
        </button>`;
}
