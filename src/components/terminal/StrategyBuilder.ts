/**
 * Column A — Strategy Builder (accordion step-wizard).
 * HTML fragment for the Worker dashboard (no React runtime).
 * Inactive steps collapse to a 40px summary bar.
 */
import {
  computeEffectiveMaxSlUsd,
  DEFAULT_ACCOUNT_EQUITY_USD,
} from "../../services/effective-max-sl";

export function renderStrategyBuilder(
  accountEquityUsd: number = DEFAULT_ACCOUNT_EQUITY_USD,
): string {
  const maxSlUsd = computeEffectiveMaxSlUsd(accountEquityUsd);
  const maxSlLabel = `$${maxSlUsd.toFixed(0)} USD`;
  const maxSlShort = `$${maxSlUsd.toFixed(0)}`;
  return `
<div id="strategyBuilder" class="strategy-builder font-mono rounded-xl border border-[#52D0B6]/35 bg-black/40 overflow-hidden h-full flex flex-col">
  <header class="brand-hero-header brand-hero-header--section">
    <div class="brand-hero-header-overlay" aria-hidden="true"></div>
    <div class="brand-hero-header-inner w-full">
      <div class="min-w-0">
        <h3 class="brand-hero-title brand-hero-title--section">⚙️ Strategy Builder · 4-Step Order</h3>
        <p class="brand-hero-subtitle">Accordion wizard · only one step expanded</p>
      </div>
      <div id="consoleSelectedLabel" class="inject-status-badge ml-auto">未選擇標的</div>
    </div>
  </header>

  <div class="strategy-builder-body master-risk-console flex flex-col flex-1 p-3 gap-2" id="masterRiskConsole">

    <!-- STEP 1: Asset & Pair -->
    <section class="sb-step is-active" data-step="1" id="sbStep1">
      <button type="button" class="sb-step-bar" onclick="setStrategyStep(1)" aria-expanded="true">
        <span class="sb-step-index">1</span>
        <span class="sb-step-title">Asset &amp; Pair Selection</span>
        <span class="sb-step-summary" id="sbSummary1">Select pair from matrix…</span>
        <span class="sb-step-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="sb-step-panel">
        <p class="text-[11px] text-gray-400 mb-3">點擊上方矩陣 Token 注入，或選擇對沖結構：</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <label class="sb-pair-option">
            <input type="radio" name="sbPairMode" value="spot_long_perp_short" checked onchange="onStrategyPairChange()" />
            <span>BTC Spot + HL Perp Short</span>
          </label>
          <label class="sb-pair-option">
            <input type="radio" name="sbPairMode" value="spot_short_perp_long" onchange="onStrategyPairChange()" />
            <span>Spot Short + HL Perp Long</span>
          </label>
        </div>
        <div class="flex justify-end">
          <button type="button" class="sb-next-btn" onclick="setStrategyStep(2)">Next → Capital</button>
        </div>
      </div>
    </section>

    <!-- STEP 2: Capital & Leverage -->
    <section class="sb-step" data-step="2" id="sbStep2">
      <button type="button" class="sb-step-bar" onclick="setStrategyStep(2)" aria-expanded="false">
        <span class="sb-step-index">2</span>
        <span class="sb-step-title">Position Capital &amp; Leverage</span>
        <span class="sb-step-summary" id="sbSummary2">Capital: $10,000</span>
        <span class="sb-step-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="sb-step-panel">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4" id="draggableGrid">
          <div id="block1" class="step3-econ-card bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 flex flex-col justify-between min-h-[120px]" style="order:1;">
            <div class="flex justify-between items-start text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>BLOCK 01 // Pair</span>
              <span class="animate-pulse text-emerald-400">● LIVE</span>
            </div>
            <div class="my-1">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span id="bestPairSymbol" class="bg-[#10b981] text-white px-2 py-0.5 rounded text-xs font-bold">---</span>
                <span id="bestPairYield" class="text-xs font-mono text-emerald-400 font-bold">---% APR</span>
              </div>
              <div id="bestPairAction" class="text-[10px] font-bold mb-1">等待注入…</div>
              <div class="text-[11px] text-gray-400">7d: <span id="bestPairProfit" class="text-emerald-400 font-mono font-bold">---</span>
                · 30d: <span id="bestPairProfit30" class="text-circuit/80 font-mono font-bold">---</span></div>
            </div>
          </div>
          <div id="block2" class="step3-econ-card bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 flex flex-col justify-between min-h-[120px]" style="order:2;">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BLOCK 02 // Capital</div>
            <div class="mt-auto">
              <div id="block2CapitalDisplay" class="text-lg font-black text-emerald-300 font-mono tabular-nums">$10,000</div>
              <input type="hidden" id="capitalInput" value="10000" />
            </div>
          </div>
          <div id="block3" class="step3-econ-card bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 flex flex-col justify-between min-h-[120px]" style="order:3;">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BLOCK 03 // Friction %</div>
            <div class="relative mt-auto">
              <input type="number" id="frictionInput" value="0.24" step="0.01" oninput="onStep3FrictionChange()" class="w-full bg-black/40 border border-emerald-500/30 px-3 py-1.5 rounded text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-400">
              <span class="absolute right-3 top-2 text-[10px] font-semibold text-gray-500">%</span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div id="block4" class="step3-econ-card bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3" style="order:4;">
            <div class="text-[10px] font-bold text-gray-400 uppercase">BLOCK 04 // Gas</div>
            <div class="text-lg font-black text-emerald-300 font-mono">$2.50</div>
            <input type="hidden" id="fixedCostInput" value="2.50" />
          </div>
          <div id="block5" class="step3-econ-card bg-emerald-950/20 border border-rose-500/30 rounded-lg p-3" style="order:5;">
            <div class="text-[10px] font-bold text-rose-300 uppercase">BLOCK 05 // Total Wear</div>
            <div class="text-lg font-black text-rose-300 font-mono tabular-nums" id="displayTotalFriction">$26.50</div>
          </div>
        </div>
        <div class="mb-3">
          <div class="flex justify-between text-xs font-bold mb-1">
            <span class="text-gray-400">Order Size / Leverage Notional</span>
            <span id="consoleOrderSizeLabel" class="text-[#52D0B6]">$10,000</span>
          </div>
          <input type="range" id="masterOrderSizeSlider" class="master-slider" min="1000" max="100000" step="1000" value="10000" oninput="onMasterOrderSizeChange()" />
          <div class="flex justify-between text-[10px] text-gray-500 mt-1"><span>$1K</span><span>$50K WARNING</span><span>$100K DANGER</span></div>
        </div>
        <div class="flex justify-between gap-2">
          <button type="button" class="sb-back-btn" onclick="setStrategyStep(1)">← Back</button>
          <button type="button" class="sb-next-btn" onclick="setStrategyStep(3)">Next → Risk</button>
        </div>
      </div>
    </section>

    <!-- STEP 3: Risk Hardlock -->
    <section class="sb-step" data-step="3" id="sbStep3">
      <button type="button" class="sb-step-bar" onclick="setStrategyStep(3)" aria-expanded="false">
        <span class="sb-step-index">3</span>
        <span class="sb-step-title">Risk Hardlock</span>
        <span class="sb-step-summary" id="sbSummary3">Max SL Lock: ${maxSlLabel}</span>
        <span class="sb-step-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="sb-step-panel">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <span class="max-sl-lock-badge" id="strategyMaxSlLockBadge">Max SL Lock: ${maxSlLabel}</span>
          <button type="button" id="sopGuideBtn" onclick="openSopGuide()" class="sop-guide-trigger-btn">❓ 風控 SOP</button>
        </div>
        <div class="flex flex-col gap-2 mb-4 p-3 rounded-lg border border-emerald-500/25 bg-black/30">
          <div class="text-xs font-bold text-gray-300">Soil 阻力監控防線</div>
          <div id="consoleSlippageReadout" class="text-lg font-black text-[#52D0B6]">--</div>
          <div id="consoleSoilBadge" class="soil-badge soil-loose w-fit">[ SOIL: LOOSE ] 🟢</div>
        </div>
        <div id="rootSlipProtectionStatus" class="root-slip-status mb-4">
          <div class="flex flex-col gap-1">
            <span class="text-[#52D0B6] font-black text-sm">20-Root Slip-Protection Status</span>
            <span id="rootSlipBreakerLamp" class="text-emerald-300 font-black text-xs">🟢 Slip Breaker: ACTIVE | Max 0.5% Slippage Tolerance</span>
          </div>
        </div>
        <div class="flex justify-between gap-2">
          <button type="button" class="sb-back-btn" onclick="setStrategyStep(2)">← Back</button>
          <button type="button" class="sb-next-btn" onclick="setStrategyStep(4)">Next → Execute</button>
        </div>
      </div>
    </section>

    <!-- STEP 4: Execute -->
    <section class="sb-step" data-step="4" id="sbStep4">
      <button type="button" class="sb-step-bar" onclick="setStrategyStep(4)" aria-expanded="false">
        <span class="sb-step-index">4</span>
        <span class="sb-step-title">Execute Strategy</span>
        <span class="sb-step-summary" id="sbSummary4">Ready to arm ATTACK</span>
        <span class="sb-step-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="sb-step-panel attack-zone" id="attackExecuteZone">
        <div id="step4SopCard" class="p-3 rounded-xl border border-[#10b981]/30 bg-[#042d20]/50 text-gray-200 mb-3 text-[11px] leading-relaxed">
          Cross-chain / cross-book execution · 確認 Soil、結算倒數與 Max SL ${maxSlShort} 後再 ATTACK。
        </div>
        <div id="attackExecuteRow" class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span id="attackWarning" class="text-sm text-amber-300 font-bold flex items-center gap-2 text-left">
            ⚠️ 開倉提示：請確認 Soil Resistance 與結算倒數
          </span>
          <div class="flex items-center gap-2 shrink-0 ml-auto">
            <span id="attackLockdownLabel" class="hidden text-xs font-black text-red-400 border border-red-500/40 bg-red-950/40 px-2 py-1 rounded animate-pulse">🔒 LOCKDOWN</span>
            <button type="button" class="sb-back-btn" onclick="setStrategyStep(3)">← Back</button>
            <button type="button" id="attackExecuteBtn" class="attack-btn attack-btn-xl" onclick="executeAttackOrder()" disabled>
              <img src="/brand/dondon-eyes.webp" alt="DonDon" class="attack-btn-dondon w-7 h-auto" />
              <span id="attackExecuteBtnLabel">ATTACK / EXECUTE</span>
            </button>
          </div>
        </div>
      </div>
    </section>

  </div>
</div>`;
}
