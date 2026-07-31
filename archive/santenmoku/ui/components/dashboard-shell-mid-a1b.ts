import type { DashboardBuildContext } from "./ui-helpers";

export function renderDashboardShellMidHtmlPartA1b(ctx: DashboardBuildContext): string {
  const {
    escAttr,
    brandShield,
    STATUS_DICTIONARY,
    STRATEGY_DICTIONARY,
    METRICS_DICTIONARY,
  } = ctx;
  return `<div class="best-hedge-radar bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 text-slate-200" id="step1BestHedgeRadar">
          <div class="best-hedge-header">
            <h3 class="best-hedge-title">BEST HEDGE &amp; DELTA NEUTRAL RADAR</h3>
          </div>
          <div class="best-hedge-body">
          <div class="best-hedge-hero-row">
            <div class="best-hedge-symbol-row">
              <div class="best-hedge-token-pair">
                <span class="best-hedge-token-icon" aria-hidden="true"></span>
                <span id="bestPairSymbol" class="text-white font-extrabold drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">--- / USDC</span>
              </div>
              <span id="bestPairYield" class="text-emerald-400 font-black">---% APR</span>
            </div>
            <div class="best-hedge-badges">
              <span
                class="best-hedge-auto-lock sv-tip"
                data-sv-tip="${escAttr(STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.AUTO_LOCKED.desc)}"
                data-sv-label="${escAttr(STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.AUTO_LOCKED.label)}"
              >${STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.AUTO_LOCKED.label}</span>
              <span
                id="bestPairAction"
                class="best-pair-action-tag sv-tip is-cashcat"
                data-sv-tip="${escAttr(STRATEGY_DICTIONARY.CASHCAT.tooltip)}"
                data-sv-label="${escAttr(STRATEGY_DICTIONARY.CASHCAT.actionText)}"
              >Computing…</span>
            </div>
          </div>
          <div class="best-hedge-returns">
            <div class="flex items-baseline gap-2 min-w-0">
              <span class="best-hedge-returns-label">7d:</span>
              <span id="bestPairProfit" class="best-hedge-returns-value">---</span>
            </div>
            <div class="flex items-baseline gap-2 min-w-0">
              <span class="best-hedge-returns-label">30d:</span>
              <span id="bestPairProfit30" class="best-hedge-returns-value">---</span>
              <span class="best-hedge-returns-label">USD</span>
            </div>
          </div>
          <button type="button" id="lockBestHedgeBtn" class="lock-best-hedge-btn sv-tip bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]" onclick="lockBestHedgeToStep3()" disabled data-default-text="${escAttr(STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.LOCK_BUTTON.label)}" data-sv-tip="${escAttr(STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.LOCK_BUTTON.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.LOCK_BUTTON.label)}">
            ${brandShield("lock-shield-icon", 20)}
            [ 🔒 LOCKED: NO ARBITRAGE EDGE ]
          </button>
          <div class="best-hedge-lock-hint">Auto-injects optimal delta-neutral strategy with dynamic Effective Max SL = (Equity × 1%) + $100.</div>

          <div class="live-vol-heat-panel sv-tip" id="liveVolHeatPanel" aria-label="Live Volatility Heat" data-sv-tip="${escAttr(STATUS_DICTIONARY.VOLATILITY_HEAT.SAFE.desc)}" data-sv-label="Live Volatility Heat">
            <div class="gk-heat-row">
              <span class="typo-context">Live Volatility Heat</span>
              <span id="liveVolHeatScore" class="live-vol-heat-score">--</span>
            </div>
            <div id="liveVolHeatMeta" class="live-vol-heat-meta">Heat score · VIX / DVOL composite</div>
          </div>

          <div id="crossVenueFrIoChart" class="cross-venue-fr-io-chart" aria-label="Cross-Venue FR & IO Arbitrage Chart" style="margin-top:0.75rem;padding:0.85rem 1rem;border:1px solid rgba(80,210,193,0.25);border-radius:0.9rem;background:rgba(0,0,0,0.25);">
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="typo-action text-[#50D2C1]">Cross-Venue FR &amp; IO Arbitrage Chart</span>
              <span id="crossVenueFrIoState" class="typo-num inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-gray-400">LIVE · SYSTEMSTATE</span>
            </div>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex items-center gap-2">
                <span class="w-10 text-base font-mono font-bold text-emerald-300">+FR</span>
                <div class="flex-1 h-2 rounded bg-white/10 overflow-hidden"><span id="crossVenueFrIoPosBar" style="display:block;height:100%;width:0%;background:linear-gradient(90deg,#34d399,#10b981);"></span></div>
                <span id="crossVenueFrIoPosValue" class="w-16 text-right text-lg font-mono font-bold text-emerald-300">--</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-10 text-base font-mono font-bold text-rose-300">-FR</span>
                <div class="flex-1 h-2 rounded bg-white/10 overflow-hidden"><span id="crossVenueFrIoNegBar" style="display:block;height:100%;width:0%;background:linear-gradient(90deg,#f87171,#ef4444);"></span></div>
                <span id="crossVenueFrIoNegValue" class="w-16 text-right text-lg font-mono font-bold text-rose-300">--</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-10 text-base font-mono font-bold text-circuit">ΔIO</span>
                <div class="flex-1 h-2 rounded bg-white/10 overflow-hidden"><span id="crossVenueFrIoSpreadBar" style="display:block;height:100%;width:0%;background:linear-gradient(90deg,#fbbf24,#f59e0b);"></span></div>
                <span id="crossVenueFrIoSpreadValue" class="w-16 text-right text-lg font-mono font-bold text-circuit">--</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-10 text-base font-mono font-bold text-[#CBD5E1]">FRICTION</span>
                <div class="flex-1 h-2 rounded bg-white/10 overflow-hidden"><span id="crossVenueFrIoFrictionBar" style="display:block;height:100%;width:0%;background:linear-gradient(90deg,#94a3b8,#64748b);"></span></div>
                <span id="gkFrictionReadout" class="w-16 text-right text-lg font-mono font-bold text-[#CBD5E1]">0.24%</span>
              </div>
              <div class="border-t border-white/10 pt-2 flex items-center justify-between gap-2">
                <span class="text-sm font-mono font-bold tracking-[0.18em] text-slate-200">NET MARGIN</span>
                <span id="crossVenueFrIoNetMarginValue" class="text-lg font-mono font-bold">--</span>
              </div>
            </div>
          </div>

          <div class="gk-telemetry-grid" id="bestHedgeMetricsGrid" aria-label="Contrast heat metrics">
            <div class="gk-telemetry-chip sv-tip" data-sv-tip="${escAttr(METRICS_DICTIONARY.HEAT.desc)}" data-sv-label="${escAttr(METRICS_DICTIONARY.HEAT.label)}">
              <span class="label">${METRICS_DICTIONARY.HEAT.label}</span>
              <span class="value" id="gkHeatScore">--</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- Hidden legacy Step 1 shells for older selectors -->
      <div id="step1ColCenter" class="hidden" aria-hidden="true"></div>
      <div id="step1ColLeft" class="hidden" aria-hidden="true"></div>
      <div id="alphaEdgeTokens" class="hidden" aria-hidden="true"></div>

      `;
}
