import type { DashboardBuildContext } from "./ui-helpers";
import { buildHeaderHudClientScript } from "../header-hud-client";
import { HEADER_HUD_CORE_SCRIPT } from "../header-hud-core-script";

/** Terminal header — compact HMI contrast strip + wallet / clock / nav */
export function renderHeaderHudHtml(ctx: DashboardBuildContext): string {
  const {
    BRAND_LOGO_DATA_URI,
    versionLabel,
  } = ctx;
  return `  <header class="terminal-header">
    <div class="terminal-header-top">
      <div class="flex items-center gap-3 flex-wrap">
        <a href="https://javier-dashboard-core.henry-astar1.workers.dev/" class="typo-action flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-circuit/20 hover:border-circuit/50 text-circuit rounded transition">
          &lt; Home
        </a>
        <div class="flex items-center gap-3">
          <img src="${BRAND_LOGO_DATA_URI}" alt="SANTENBOKU cat shield" class="h-14 w-14 rounded-full object-cover brand-logo-ring bg-black" />
          <div>
            <h1 class="typo-title text-circuit leading-tight">
              SANTENBOKU / 蔘天木 / さんてんぼく / 삼천목
            </h1>
            <p class="typo-context text-copper tracking-[0.18em] mt-0.5">
              [ SECURED : RUNNING ] <span class="text-circuit/70">· SILVERVINE LABS · ${versionLabel}</span>
              <span id="headerPairCount" class="text-circuit/60"> · 162 pairs live</span>
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end header-actions-right">
        <div id="topClock" class="typo-num font-mono tabular-nums whitespace-nowrap min-w-[220px] text-circuit/70 bg-black/40 px-3 py-1.5 border border-circuit/20 rounded">HKT: --/--/---- --:--:--</div>
        <button type="button" id="connectWalletBtn" onclick="connectWallet()" class="connect-wallet-btn typo-action">
          <span class="panel-emoji" style="font-size:1.1rem;">🦊</span>
          <span id="connectWalletLabel">Connect Wallet</span>
        </button>
        <button type="button" id="headerMenuToggle" class="header-menu-toggle typo-action" onclick="toggleHeaderMenu()" aria-expanded="false" aria-controls="headerSecondaryActions">☰ Menu</button>
        <div id="headerSecondaryActions" class="header-secondary-actions">
          <div class="flex items-center border border-circuit/20 rounded overflow-hidden bg-black/30">
            <button onclick="adjustFontSize(-0.05)" class="typo-action px-3 py-1.5 text-circuit hover:bg-circuit/10 transition border-r border-circuit/20" title="Decrease font size">- A</button>
            <button onclick="adjustFontSize(0.05)" class="typo-action px-3 py-1.5 text-circuit hover:bg-circuit/10 transition" title="Increase font size">+ A</button>
          </div>
          <a href="__SHEET_LINK__" target="_blank" class="typo-action flex items-center gap-1.5 px-3 py-2 bg-circuit/15 hover:bg-circuit/25 text-circuit border border-circuit/40 rounded transition">
            Sheet
          </a>
          <button type="button" id="forceRefreshBtn" onclick="forceRefresh()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-circuit/15 border-2 border-circuit/50 text-circuit hover:bg-circuit/25 transition">
            <img id="forceRefreshCat" src="${BRAND_LOGO_DATA_URI}" alt="" class="h-5 w-5 rounded-full object-cover hidden" />
            FORCE REFRESH
          </button>
          <span id="refreshStatus" class="typo-num text-gray-500">idle</span>
          <button type="button" id="demoControlHubBtn" onclick="openDemoControlHub()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-[#50D2C1]/50 text-[#50D2C1] hover:bg-[#50D2C1]/10 transition">
            Demo Control Hub
          </button>
          <button type="button" id="startTourBtn" onclick="openQuickTour()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition">
            5-Sec Quick Guide
          </button>
          <button type="button" id="layoutMemoryBtn" onclick="toggleLayoutMemory()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-circuit/30 text-circuit hover:bg-circuit/10 transition">
            Layout
            <span id="layoutMemoryLamp" class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span id="layoutMemoryState" class="px-2 py-0.5 rounded bg-white/5 border border-white/10">ON</span>
          </button>
          <button onclick="toggleTheme()" class="p-2 rounded border border-copper/40 hover:bg-copper/20 text-copper typo-action">
            <span class="panel-emoji">☀️</span>/<span class="panel-emoji">🌙</span>
          </button>
        </div>
      </div>
    </div>
  </header>`;
}

export const HEADER_HUD_SCRIPT = `${buildHeaderHudClientScript()}\n\n${HEADER_HUD_CORE_SCRIPT}`;
