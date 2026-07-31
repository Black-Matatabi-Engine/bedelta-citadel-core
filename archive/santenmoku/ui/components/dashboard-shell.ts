import type { DashboardBuildContext } from "./ui-helpers";

/** Main layout shell — steps 1–4, matrix, modals, footer */
import { renderDashboardShellModalsHtml } from "./dashboard-shell-modals";
import { renderDashboardShellMidHtmlPartA } from "./dashboard-shell-mid-a";
import { renderDashboardShellMidHtmlPartA1b } from "./dashboard-shell-mid-a1b";
import { renderDashboardShellMidHtmlPartA2 } from "./dashboard-shell-mid-a2";
import { renderDashboardShellMidHtmlPartB } from "./dashboard-shell-mid-b";
export function renderDashboardShellHtml(ctx: DashboardBuildContext): string {
  const { BRAND_LOGO_DATA_URI } = ctx;
  return `<body class="terminal-body min-h-screen dashboard-booting">

  <noscript>
    <div style="margin:1rem;padding:1rem;border:2px solid #50D2C1;border-radius:0.75rem;background:#0A1A17;color:#e8fff0;font-family:Inter,sans-serif;">
      JavaScript is required for live telemetry. The risk dashboard layout is server-rendered below.
    </div>
  </noscript>

  <div id="forceRefreshOverlay">
    <img src="${BRAND_LOGO_DATA_URI}" alt="SANTENBOKU loading" class="cat-spinner" style="width:88px;height:88px;border-radius:9999px;" />
    <div class="font-hud text-circuit text-sm tracking-widest">SANTENBOKU / 蔘天木 · SECURED: RUNNING</div>
  </div>

  <div id="app" role="main" data-dashboard-mount="v1" aria-label="Santenboku risk terminal">
    <div id="appBootBanner" class="app-boot-banner hidden" aria-live="polite">
      Connecting v0.8 telemetry stream… SSR dashboard active.
    </div>
`;
}

export function renderDashboardShellMidHtml(ctx: DashboardBuildContext): string {
  return renderDashboardShellModalsHtml(ctx) + renderDashboardShellMidHtmlPartA(ctx) + renderDashboardShellMidHtmlPartA1b(ctx) + renderDashboardShellMidHtmlPartA2(ctx) + renderDashboardShellMidHtmlPartB(ctx);
}

export function renderDashboardShellTailHtml(_ctx: DashboardBuildContext): string {
  return `
  <div class="debug-drawer" id="debugDrawer">
    <div class="debug-drawer-header" onclick="toggleDebugDrawer()" role="button" tabindex="0">
      <span class="text-rose-400 font-bold flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
        SYSTEM DEBUG CONSOLE (SANTENBOKU)
      </span>
      <div class="flex items-center gap-2" onclick="event.stopPropagation()">
        <button type="button" onclick="toggleDefcon1Demo()" class="typo-action bg-red-950/50 border border-red-500/40 px-2 py-0.5 rounded hover:bg-red-900/50 text-red-200">DEFCON 1</button>
        <button onclick="clearLogs()" class="typo-action bg-white/5 border border-white/10 px-2 py-0.5 rounded hover:bg-white/10 text-white">Clear</button>
        <button type="button" id="debugDrawerToggleBtn" onclick="toggleDebugDrawer()" class="typo-action text-gray-400 border border-white/10 px-2 py-0.5 rounded">Collapse</button>
      </div>
    </div>
    <div class="debug-drawer-body">
      <div id="consoleOutput" class="space-y-1 text-gray-300">
        <div class="text-emerald-400">[SYSTEM] Santenboku defense matrix online · SECURED: RUNNING · Layout v2.0 70/30</div>
      </div>
    </div>
  </div>

  <footer id="appFooter" class="app-footer mt-8 mb-4 px-4 py-4 rounded-xl border border-[#50D2C1]/25 bg-black/40 font-mono">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-400">
      <div class="text-center sm:text-left">
        <a
          href="https://www.SliverVineLabs.com"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-copyright-link"
        >© 2026 SliverVine Labs. All rights reserved.</a>
      </div>
      <div class="flex items-center justify-center gap-2 text-[#50D2C1] font-bold">
        <a
          href="https://x.com/SliverVineLabs"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-x-link"
          aria-label="SliverVine Labs on X"
          title="X / Twitter"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
          </svg>
        </a>
        <span class="text-gray-600">|</span>
        <button type="button" class="footer-link-btn" onclick="openLegalModal('tc')">T&amp;C</button>
        <span class="text-gray-600">|</span>
        <button type="button" class="footer-link-btn" onclick="openLegalModal('privacy')">Privacy</button>
        <span class="text-gray-600">|</span>
        <button type="button" class="footer-link-btn" onclick="openLegalModal('disclaimer')">Disclaimer</button>
      </div>
    </div>
  </footer>
  <div id="legalModalBackdrop" class="demo-hub-backdrop hidden" aria-hidden="true" onclick="closeLegalModal(event)">
    <div class="demo-hub-modal font-mono" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-3">
        <h3 id="legalModalTitle" class="text-[#50D2C1] font-black text-base">Legal</h3>
        <button type="button" onclick="closeLegalModal()" class="text-gray-400 hover:text-white text-sm">✕</button>
      </div>
      <div id="legalModalBody" class="legal-modal-body text-xs text-gray-300 leading-relaxed"></div>
    </div>
  </div>
  </div><!-- #app -->`;
}

import { DASHBOARD_SHELL_HEAD_SCRIPT } from "./dashboard-shell-head-script";
import { DASHBOARD_SHELL_TAIL_SCRIPT } from "./dashboard-shell-tail-script";

export { DASHBOARD_SHELL_HEAD_SCRIPT, DASHBOARD_SHELL_TAIL_SCRIPT };
