import type { DashboardBuildContext } from "./ui-helpers";

export function renderDashboardShellMidHtmlPartA2(_ctx: DashboardBuildContext): string {
  return `<!-- STEP 2: Weak Target Radar -->
      <div class="mb-1 flex items-center gap-2 flex-wrap">
        <span class="step-badge typo-action text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded">Step 2</span>
        <div>
          <h2 class="section-header typo-title m-0" title="Six asset branches · OI · Extreme FR">🎯 Step 2: Weak Target Radar</h2>
          <p class="typo-context text-gray-400">6 categories · ALL HL tokens mapped · Top 3 extreme FR · Lock → Sniper</p>
        </div>
      </div>

      <div class="step2-funding-panel funding-world-tree-bar" id="fundingRateKingsBar">
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <span class="typo-action text-[#50D2C1]">🔥 Funding Extremes · Top/Bottom 3</span>
          <button type="button" id="fundingRiskGuideBtn" onclick="toggleFundingRiskGuide()" class="typo-action px-1.5 py-0.5 rounded border border-[#50D2C1]/50 text-[#50D2C1] hover:bg-[#50D2C1]/10">INFO</button>
        </div>
        <div class="relative">
          <div id="fundingRiskGuidePopover" class="risk-guide-popover hidden">
            <div class="font-black text-[#50D2C1] mb-2">Funding Rate Risk Guide</div>
            <p class="mb-2">Funding rate is hourly interest paid between longs and shorts on perpetuals. Positive = longs pay shorts; negative = shorts pay longs.</p>
            <p class="mb-2"><strong class="text-rose-300">Carry bleed risk:</strong> Extreme positive funding can drain long P&amp;L; extreme negative funding drains naked shorts.</p>
            <p>Practice: Watch Top 3, Soil Resistance, and settlement countdown — avoid blind entries near the hour.</p>
          </div>
        </div>
        <div id="fundingRateKings" class="funding-ticker-compact status-chip-value">
          <span class="text-gray-500">Syncing...</span>
        </div>
      </div>

      <div class="mb-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-2 tradfi-panel-scale" id="tradFiPanel">
        <div id="tradfi-crypto" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel step1-glacier-card bg-[#051A16]/80 border border-[#50D2C1]/30" style="order:0;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">⚡ Crypto</span>
            <span id="cryptoOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="cryptoPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-commodities" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:1;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">⚜️ Commodities</span>
            <span id="commoditiesOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="commoditiesPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-stocks" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:2;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">📈 Stocks</span>
            <span id="stocksOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="stocksPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-indices" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:3;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">📊 Indices</span>
            <span id="indicesOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="indicesPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-fx" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:4;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">💱 FX</span>
            <span id="fxOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="fxPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-preipo" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:5;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">🚀 Pre-IPO</span>
            <span id="preipoOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="preipoPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
      </div>

      <div class="rounded-xl overflow-hidden shadow-md border" style="background-color: var(--bg-card-dark); border-color: var(--border-color)" id="tokenTableSection">
        <header class="brand-hero-header brand-hero-header--matrix">
          <div class="brand-hero-header-overlay" aria-hidden="true"></div>
          <div class="brand-hero-header-inner w-full">
            <div class="matrix-table-toolbar">
              <div>
                <h3 class="brand-hero-title brand-hero-title--section typo-title">Filtered Token Table</h3>
                <p class="brand-hero-subtitle typo-context">Symbol · Price / 8H FR · HL OI · APR · Slippage · Quick Lock</p>
              </div>
              <div class="matrix-table-toolbar-right">
                <div id="matrixCategoryFilters" class="flex flex-wrap gap-1.5 justify-end">
                  <button type="button" data-category="ALL" onclick="setMatrixCategoryFilter('ALL')" class="matrix-category-btn active typo-action px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">🌐 All</button>
                  <button type="button" data-category="CRYPTO" onclick="setMatrixCategoryFilter('CRYPTO')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">⚡ Crypto</button>
                  <button type="button" data-category="COMMODITIES" onclick="setMatrixCategoryFilter('COMMODITIES')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">🌴 Commodities</button>
                  <button type="button" data-category="STOCKS" onclick="setMatrixCategoryFilter('STOCKS')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">📈 Stocks</button>
                  <button type="button" data-category="INDICES" onclick="setMatrixCategoryFilter('INDICES')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">📊 Indices</button>
                  <button type="button" data-category="FX" onclick="setMatrixCategoryFilter('FX')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">💱 FX</button>
                  <button type="button" data-category="PREIPO" onclick="setMatrixCategoryFilter('PREIPO')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">🚀 Pre-IPO</button>
                </div>
                <div class="matrix-table-updated typo-num" id="lastUpdated">Syncing market foundation data...</div>
              </div>
            </div>
            <div class="matrix-table-filters">
              <div class="flex flex-col lg:flex-row lg:items-center gap-3 justify-between mt-2">
                <div class="relative w-full lg:max-w-xs">
                  <input id="tokenSearchInput" type="search" placeholder="Search token (e.g. BTC)..." oninput="onTokenSearchInput()"
                    class="w-full bg-black/40 border border-white/10 rounded px-3 py-2 typo-context text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div id="pairStatusFilters" class="flex flex-wrap gap-1.5">
                  <button type="button" data-status="ALL" onclick="setPairStatusFilter('ALL')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">All</button>
                  <button type="button" data-status="OPEN" onclick="setPairStatusFilter('OPEN')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Open</button>
                  <button type="button" data-status="HOLD" onclick="setPairStatusFilter('HOLD')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Hold</button>
                  <button type="button" data-status="SPREAD" onclick="setPairStatusFilter('SPREAD')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Spread</button>
                  <button type="button" data-status="DEFICIT" onclick="setPairStatusFilter('DEFICIT')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Deficit</button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div class="matrix-pagination-bar border-b" id="matrixPaginationTop">
          <span class="pagination-info text-gray-400 typo-context">Page 0 / 0 · 0 rows</span>
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5 typo-context text-gray-400">
              <span>Show:</span>
              <button type="button" data-page-size="5" onclick="setPageSize(5)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">5</button>
              <button type="button" data-page-size="10" onclick="setPageSize(10)" class="matrix-page-size-btn active typo-action px-2 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">10</button>
              <button type="button" data-page-size="20" onclick="setPageSize(20)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">20</button>
              <button type="button" data-page-size="all" onclick="setPageSize('all')" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">All</button>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="page-prev-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToPrevPage()">Prev</button>
              <button type="button" class="page-next-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToNextPage()">Next</button>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse dynamic-text-target table-layout-fixed" id="matrixTable">
            <thead>
              <tr class="uppercase tracking-wider border-b select-none typo-action" style="border-color: var(--border-color); color: #9ca3af">
                <th class="p-2 sticky-col-left text-center" style="width: 40px;" title="Favorite / Pin to Top">☆</th>
                <th class="p-2 sticky-col-left cursor-pointer hover:bg-white/5" style="width: 110px; left: 40px;" onclick="sortTable(1)">Symbol</th>
                <th class="p-2 text-emerald-400 cursor-pointer hover:bg-white/5" style="width: 100px;" onclick="sortTable(2)">HL OI</th>
                <th class="p-2 cursor-pointer hover:bg-white/5" style="width: 120px;" onclick="sortTable(3)">PRICE / 8H FR</th>
                <th class="p-2 text-circuit cursor-pointer hover:bg-white/5" style="width: 100px;" onclick="sortTable(4)">HL APR</th>
                <th class="p-2 text-center text-circuit" style="width: 120px;">Slippage</th>
                <th class="p-2 sticky-col-right text-right" style="width: 168px;" title="Lock to Step 3">Lock to Step 3</th>
              </tr>
            </thead>
            <tbody id="matrixTableBody" class="divide-y divide-white/5"></tbody>
          </table>
        </div>
        <div class="matrix-pagination-bar border-t" id="matrixPaginationBottom">
          <span class="pagination-info text-gray-400 typo-context">Page 0 / 0 · 0 rows</span>
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5 typo-context text-gray-400">
              <span>Show:</span>
              <button type="button" data-page-size="5" onclick="setPageSize(5)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">5</button>
              <button type="button" data-page-size="10" onclick="setPageSize(10)" class="matrix-page-size-btn active typo-action px-2 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">10</button>
              <button type="button" data-page-size="20" onclick="setPageSize(20)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">20</button>
              <button type="button" data-page-size="all" onclick="setPageSize('all')" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">All</button>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="page-prev-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToPrevPage()">Prev</button>
              <button type="button" class="page-next-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToNextPage()">Next</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Positions & Execution Logs (replaces bottom Vault box) -->
      <div class="live-ops-panel mt-2" id="livePositionsLogsPanel">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="step-badge typo-action text-[#50D2C1] border border-[#50D2C1]/50 px-2 py-0.5 rounded">Ops</span>
          <h2 class="section-header typo-title m-0">📜 Step 4: Live Positions &amp; Review Logs</h2>
        </div>
        <div class="live-ops-grid">
          <div>
            <div class="typo-action text-gray-400 mb-1">Active Positions</div>
            <div class="overflow-x-auto">
              <table class="live-ops-table" id="activePositionsTable">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Size</th>
                    <th>Dynamic SL</th>
                    <th>PnL</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="activePositionsBody">
                  <tr id="activePositionsEmpty"><td colspan="5" class="text-gray-500">No open positions</td></tr>
                </tbody>
              </table>
            </div>
            <!-- Hidden vault mirrors for header sync -->
            <span id="vaultOpenPositions" class="hidden">0</span>
            <span id="vaultSettledPnl" class="hidden">$0.00</span>
            <span id="vaultLastAttack" class="hidden">—</span>
          </div>
          <div>
            <div class="typo-action text-gray-400 mb-1">Real-time Execution Log</div>
            <div id="execLogStream" class="exec-log-stream" aria-live="polite">
              <div class="log-line log-ok">[SYSTEM] Root Defense loop armed · waiting for inject / ATTACK</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT 30%: Sniper Execution Shield (merged Step 3 + Execution) -->`;
}
