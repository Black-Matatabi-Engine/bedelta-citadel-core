import type { DashboardBuildContext } from "./ui-helpers";

export function renderDashboardShellModalsHtml(ctx: DashboardBuildContext): string {
  const {
    escAttr,
    brandShield,
    STATUS_DICTIONARY,
  } = ctx;
  return `
  <div id="walletModalBackdrop" class="wallet-modal-backdrop hidden" onclick="closeWalletModal(event)">
    <div class="wallet-modal font-mono" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-circuit font-black text-base">Connect Wallet</h3>
        <button type="button" onclick="closeWalletModal()" class="text-gray-400 hover:text-white text-sm">✕</button>
      </div>
      <p class="text-xs text-gray-400 mb-4">Select a wallet provider to enter the SilverVine Santenboku terminal.</p>
      <div class="flex flex-col gap-2">
        <button type="button" onclick="mockConnectWallet('MetaMask')" class="w-full px-3 py-2.5 rounded-lg border border-circuit/40 bg-circuit/10 text-circuit font-black hover:bg-circuit/20 text-left">🦊 MetaMask</button>
        <button type="button" onclick="mockConnectWallet('WalletConnect')" class="w-full px-3 py-2.5 rounded-lg border border-circuit/40 bg-black/40 text-white font-black hover:bg-white/10 text-left">🔗 WalletConnect</button>
        <button type="button" onclick="mockConnectWallet('Rabby')" class="w-full px-3 py-2.5 rounded-lg border border-circuit/40 bg-black/40 text-white font-black hover:bg-white/10 text-left">🐰 Rabby</button>
      </div>
      <p id="walletModalStatus" class="text-[11px] text-gray-500 mt-3">Ready · Mock / ethereum provider</p>
    </div>
  </div>


  <div id="quickTourBackdrop" class="demo-hub-backdrop hidden" aria-hidden="true" onclick="closeQuickTour(event)">
    <div class="tour-modal font-mono" onclick="event.stopPropagation()">
      <header class="tour-modal-header">
        <div class="tour-modal-header-overlay" aria-hidden="true"></div>
        <button type="button" onclick="closeQuickTour()" class="tour-modal-close" aria-label="Close quick guide">✕</button>
        <div class="tour-modal-header-inner">
          <h2 class="tour-modal-title">🚀 ${STATUS_DICTIONARY.QUICK_TOUR.TITLE}</h2>
        </div>
      </header>
      <div class="tour-modal-body">
        <ol class="tour-modal-steps">
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP1.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP1.title)}">
            <span class="tour-modal-step-badge">Step 1</span>
            <span class="tour-modal-step-body">
              <span class="inline-flex-shield">${brandShield("brand-shield-icon", 14)} ${STATUS_DICTIONARY.QUICK_TOUR.STEP1.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY.QUICK_TOUR.STEP1.roots}</span>
            </span>
          </li>
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP2.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP2.title)}">
            <span class="tour-modal-step-badge">Step 2</span>
            <span class="tour-modal-step-body">
              <span>🎯 ${STATUS_DICTIONARY.QUICK_TOUR.STEP2.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY.QUICK_TOUR.STEP2.roots}</span>
            </span>
          </li>
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP3.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP3.title)}">
            <span class="tour-modal-step-badge">Step 3</span>
            <span class="tour-modal-step-body">
              <span class="inline-flex-shield">${brandShield("brand-shield-icon", 14)} ${STATUS_DICTIONARY.QUICK_TOUR.STEP3.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY.QUICK_TOUR.STEP3.roots}</span>
            </span>
          </li>
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP4.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP4.title)}">
            <span class="tour-modal-step-badge">Step 4</span>
            <span class="tour-modal-step-body">
              <span>📜 ${STATUS_DICTIONARY.QUICK_TOUR.STEP4.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY.QUICK_TOUR.STEP4.roots}</span>
            </span>
          </li>
        </ol>
        <button type="button" onclick="closeQuickTour()" class="tour-modal-cta">${STATUS_DICTIONARY.QUICK_TOUR.CTA}</button>
      </div>
    </div>
  </div>

  <div id="sopGuideBackdrop" class="demo-hub-backdrop hidden" aria-hidden="true" onclick="closeSopGuide(event)">
    <div class="sop-guide-modal font-mono" onclick="event.stopPropagation()">
      <header class="brand-hero-header">
        <div class="brand-hero-header-overlay" aria-hidden="true"></div>
        <button type="button" onclick="closeSopGuide()" class="brand-hero-close" aria-label="Close SOP">✕</button>
        <div class="brand-hero-header-inner">
          <div>
            <h2 class="brand-hero-title">📖 SilverVine Labs Ironclad Risk Control SOP</h2>
            <p class="brand-hero-subtitle">[SANTENBOKU] Rules · Quant Risk Control Playbook</p>
          </div>
        </div>
      </header>
      <div class="sop-guide-body">
        <div class="sop-guide-steps">
          <section class="sop-guide-step">
            <h3>Phase 1: 宏觀門禁與結算淨空 (Macro Lock &amp; Settlement Clear)</h3>
            <ul class="list-disc list-inside">
              <li>Rule: Confirm Macro Radar shows no imminent high-impact releases (US CPI/FED) and sentiment is within control bands.</li>
            </ul>
            <p>📚 理論依據：<a href="https://www.amazon.com/dp/0471152803" target="_blank" rel="noopener noreferrer" class="sop-book-link">Nassim Taleb《Dynamic Hedging: Managing Vanilla and Exotic Options》</a> — Avoid fat-tailed black-swan uncertainty.</p>
          </section>
          <section class="sop-guide-step">
            <h3>Phase 2: 標的狙擊與對沖雷達 (Pre-Launch Snipe &amp; Best Hedge)</h3>
            <ul class="list-disc list-inside">
              <li>Rule: Verify funding rate before entry. Never chase longs during extreme long bleed (+0.1%+).</li>
            </ul>
            <p>📚 理論依據：<a href="https://www.amazon.com/Quantitative-Trading-Algorithmic-Business-Revised/dp/1394378041/ref=sr_1_1?nsdOptOutParam=true&amp;s=books&amp;sr=1-1" target="_blank" rel="noopener noreferrer" class="sop-book-link">Dr. Ernest P. Chan《Quantitative Trading (Revised Edition)》</a> — Avoid crowded trades with excessive carry friction.</p>
          </section>
          <section class="sop-guide-step">
            <h3 class="inline-flex-shield">${brandShield("brand-shield-icon", 16)} Phase 3: 地基阻力與滑價斷路 (Soil Resistance &amp; Slippage Breaker)</h3>
            <ul class="list-disc list-inside">
              <li class="inline-flex-shield">${brandShield("brand-shield-icon", 14)} Rule 1: Dynamic Max SL = (Equity × 1%) + $100 per order (hard-welded across all symbols).</li>
              <li>Rule 2: No structure / weak foundation / weak ceiling — no entry. Anti-FOMO enforced.</li>
              <li>Rule 3: If Order Size Slider shows [ SOIL: DANGER ] (slippage too high), entry is physically blocked.</li>
            </ul>
            <p>📚 理論依據：<a href="https://www.amazon.com/KELLY-CAPITAL-GROWTH-INVESTMENT-CRITERION/dp/9814383139/ref=sr_1_1?nsdOptOutParam=true&amp;s=books&amp;sr=1-1" target="_blank" rel="noopener noreferrer" class="sop-book-link">Edward O. Thorp《The Kelly Capital Growth Investment Criterion》</a> Capital management and physical slippage breaker mechanics.</p>
          </section>
          <section class="sop-guide-step">
            <h3 class="inline-flex-shield">${brandShield("brand-shield-icon", 16)} Phase 4: 絕對資本防護與處決 (Dynamic Max SL Weld &amp; Attack)</h3>
            <ul class="list-disc list-inside">
              <li class="inline-flex-shield">${brandShield("brand-shield-icon", 14)} Rule: After Phases 1–3 pass, fire ATTACK and execute the stop-loss plan without deviation.</li>
            </ul>
            <p>📚 理論依據：<a href="https://www.amazon.com/dp/0735201447" target="_blank" rel="noopener noreferrer" class="sop-book-link">Mark Douglas《Trading in the Zone》</a> — Remove emotion; execute pure probabilistic edge.</p>
          </section>
        </div>
      </div>
    </div>
  </div>

  <div class="terminal-workspace">
    <div class="main-canvas">
      <div class="hot-token-spotlight bg-amber-950/40 border-amber-500/60" id="hotTokenSpotlight" aria-label="HL Pre-Launch Spotlight">
        <div class="hot-token-spotlight-main">
          <span class="hot-token-badge text-amber-400">🚀 HL PRE-LAUNCH SPOTLIGHT</span>
          <div class="hot-token-meta text-amber-400">
            <span id="hotTokenSymbol">CASHCAT-USDC</span>
            <span id="hotTokenPrice">$0.0834</span>
            <span id="hotTokenChg" class="hot-chg is-neg">-26.10%</span>
            <span id="hotTokenFr" class="hot-fr">8H FR: 0.1675%</span>
          </div>
          <svg class="hot-token-sparkline" id="hotTokenSparkline" viewBox="0 0 96 28" aria-hidden="true">
            <polyline id="hotTokenSparkFill" fill="rgba(248,113,113,0.18)" stroke="none"
              points="2,6 12,8 22,10 32,12 42,14 52,16 62,18 72,20 82,22 94,24 94,28 2,28" />
            <polyline id="hotTokenSparkLine" fill="none" stroke="#f87171" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
              points="2,6 12,8 22,10 32,12 42,14 52,16 62,18 72,20 82,22 94,24" />
          </svg>
        </div>
        <button type="button" class="quick-snipe-btn" onclick="quickSnipeHotToken()">⚡ QUICK SNIPE</button>
      </div>

`;
}
