import type { DashboardBuildContext } from "./ui-helpers";
import {
  PGATE_TOOLTIP_DESC,
  PGATE_TOOLTIP_LABEL,
  TENSILE_TOOLTIP_DESC,
  TENSILE_TOOLTIP_LABEL,
} from "../../services/hmi-formatters";

export function renderDashboardShellMidHtmlPartA(ctx: DashboardBuildContext): string {
  const {
    escAttr,
    brandShield,
    STATUS_DICTIONARY,
    TAIJI_MODE_UI,
    BAGUA_GATE_UI,
  } = ctx;
  return `      <!-- STEP 1: Gatekeeper & Macro Lock -->
      <div class="mb-1 flex items-center gap-2 flex-wrap">
        <span class="step-badge typo-action text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded">Step 1</span>
        <h2 class="section-header typo-title m-0 inline-flex-shield">${brandShield("brand-shield-icon-md", 20)} Step 1: Gatekeeper &amp; Macro Lock</h2>
      </div>
      <div id="autoGuardBanner" class="auto-guard-banner is-locked" aria-live="polite">
        <div class="pipeline-mode-toggle" role="group" aria-label="Trade mode master preset controller">
          <button
            type="button"
            id="modeBtnShield"
            class="pipeline-mode-btn shield is-active sv-tip"
            onclick="setTradeMode('SHIELD')"
            data-sv-tip="${escAttr(STATUS_DICTIONARY.TRADE_MODES.SHIELD.desc)}"
            data-sv-label="${escAttr(STATUS_DICTIONARY.TRADE_MODES.SHIELD.button)}"
          >
            <span class="pipeline-mode-label">${STATUS_DICTIONARY.TRADE_MODES.SHIELD.button}</span>
            <span class="pipeline-mode-status">${STATUS_DICTIONARY.TRADE_MODES.SHIELD.status}</span>
          </button>
          <button
            type="button"
            id="modeBtnTactical"
            class="pipeline-mode-btn tactical sv-tip"
            onclick="setTradeMode('TACTICAL')"
            data-sv-tip="${escAttr(STATUS_DICTIONARY.TRADE_MODES.TACTICAL.desc)}"
            data-sv-label="${escAttr(STATUS_DICTIONARY.TRADE_MODES.TACTICAL.button)}"
          >
            <span class="pipeline-mode-label">${STATUS_DICTIONARY.TRADE_MODES.TACTICAL.button}</span>
            <span class="pipeline-mode-status">${STATUS_DICTIONARY.TRADE_MODES.TACTICAL.status}</span>
          </button>
          <button
            type="button"
            id="modeBtnFlash"
            class="pipeline-mode-btn flash sv-tip"
            onclick="setTradeMode('FLASH')"
            data-sv-tip="${escAttr(STATUS_DICTIONARY.TRADE_MODES.FLASH.desc)}"
            data-sv-label="${escAttr(STATUS_DICTIONARY.TRADE_MODES.FLASH.button)}"
          >
            <span class="pipeline-mode-label">${STATUS_DICTIONARY.TRADE_MODES.FLASH.button}</span>
            <span class="pipeline-mode-status">${STATUS_DICTIONARY.TRADE_MODES.FLASH.status}</span>
          </button>
        </div>
        <span id="autoGuardBannerMain" class="auto-guard-banner-main"></span>
        <span id="gkHeatLamp" class="banner-heat-status is-safe sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.VOLATILITY_HEAT.SAFE.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label)}">🟢 ${STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label}</span>
      </div>
      <div id="step1AllRedBanner" class="step1-all-red-banner hidden">
        🚨 DEFCON 1: ALL-RED RISK ALERT (MACRO / HIGH VOLATILITY LOCKDOWN)
      </div>
      <div class="step1-overhaul-grid" id="step1MacroSentimentTree">
        <div
          class="step1-unified-defense gatekeeper-defense-matrix step1-col-left"
          id="macroSentimentRadar"
          data-step1-panel="step1ColLeft"
          aria-label="Unified Defense Command — CRI, Sanctuary, Gatekeeper"
        >
          <div id="statusHudBar" class="risk-index-hud defense-hud-panel step1-cri-block is-optimal" role="status" aria-live="polite">
            <span id="statusHudBadge" class="hmi-metric hmi-metric--pgate sv-tip text-emerald-400" tabindex="0" data-sv-tip="${escAttr(PGATE_TOOLTIP_DESC)}" data-sv-label="${escAttr(PGATE_TOOLTIP_LABEL)}">P-GATE : [ 20 ROOTS % SECURE ]</span>
            <span id="statusHudCri" class="hmi-metric hmi-metric--tensile sv-tip text-emerald-400" tabindex="0" data-sv-tip="${escAttr(TENSILE_TOOLTIP_DESC)}" data-sv-label="${escAttr(TENSILE_TOOLTIP_LABEL)}">TENSILE : [ 100% / 20% MIN ]</span>
            <span id="statusHudFriction" class="hmi-metric hmi-metric--friction sv-tip text-emerald-400">FRICTION : [ 0.24% % LOW ]</span>
            <span id="statusHudGateway" class="hmi-metric hmi-metric--gateway sv-tip text-emerald-400">GATEWAY : [ 🟢 SIGNING OPEN ]</span>
            <div class="demo-cri-bar-track risk-index-bar-track"><div id="statusHudFill" class="demo-cri-bar-fill" style="width:100%;background:#34d399"></div></div>
          </div>
          <div id="taijiBaguaOverlay" class="taiji-bagua-overlay">
            <span id="taijiModeBadge" class="taiji-mode-badge taiji-mode-yang sv-tip" tabindex="0" data-sv-tip="${escAttr(TAIJI_MODE_UI.YANG_STRIKE.tooltip)}" data-sv-label="Taiji Stance">${TAIJI_MODE_UI.YANG_STRIKE.label}</span>
            <span id="baguaGateBadge" class="bagua-gate-badge bagua-gate-qian sv-tip" tabindex="0" data-sv-tip="${escAttr(BAGUA_GATE_UI.QIAN_OPEN.tooltip)}" data-sv-label="Bagua Gate">${BAGUA_GATE_UI.QIAN_OPEN.label}</span>
          </div>
          <div class="dondon-ip-frame dondon-ip-frame--inline" id="dondonIpFrame" data-dondon-state="NORMAL" aria-label="DonDon IP Status Display">
            <span id="dondonIpBadge" class="dondon-ip-badge">ちリブ</span>
            <img
              id="bestHedgeDonDonAvatar"
              src="/brand/dondon_normal.png"
              alt="DonDon IP — Nominal Scan"
              class="dondon-ip-img dondon-state-normal"
              decoding="async"
            />
          </div>
          <div id="step1CondensedLog" class="step1-condensed-log hidden" aria-hidden="true"></div>
          <div class="step1-unified-defense-divider" aria-hidden="true"></div>
          <p class="typo-action text-circuit mb-2">🛡️ Sanctuary Risk Shield · VIX / DVOL</p>
          <div id="vixTrad" class="vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm mb-2">
            VIX (Trad): <strong>16.8</strong>
            <a href="https://www.cboe.com/tradable_products/vix/" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="CBOE VIX">🔗</a>
            [ <span class="emoji-xl">😌</span> 傳統市場：平穩 / Stable ]
          </div>
          <div id="vixCrypto" class="vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm mb-2">
            DVOL (Crypto): <strong>52.5%</strong>
            <a href="https://www.deribit.com/statistics/BTC/volatility-index" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="Deribit DVOL">🔗</a>
            [ <span class="emoji-xl">😌</span> 加密市場：橫盤蓄勢 / Low Vol ]
          </div>
          <div
            id="marketHeartbeatBar"
            class="market-heartbeat-card is-safe"
            role="status"
            aria-live="polite"
            aria-label="Market Heartbeat"
          >
            <div class="mhb-grid">
              <div class="mhb-left">
                <div class="mhb-title">MARKET HEARTBEAT</div>
                <div class="mhb-root5">
                  <span
                    class="mhb-root5-label root-tag sv-tip"
                    data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT5_VIX_DVOL.desc)}"
                    data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT5_VIX_DVOL.label)}"
                  >${STATUS_DICTIONARY.ROOT_TAGS.ROOT5_VIX_DVOL.label}</span>
                  <span id="heartbeatVolState" class="mhb-vol-state">SAFE / STABLE</span>
                </div>
                <div id="heartbeatCircuitLabel" class="mhb-circuit">NO CIRCUIT RISK</div>
                <span id="heartbeatVolLabel" class="hidden" aria-hidden="true">SAFE / STABLE</span>
              </div>
              <div class="mhb-right">
                <div id="hlCountdownWrap" class="mhb-hl">
                  <span
                    id="root10TsunamiTag"
                    class="root-tag sv-tip"
                    data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.desc)}"
                    data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.label)}"
                  >${STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.label}</span>
                  <span class="mhb-hl-text">HL Settled: <span id="hlCountdown">--m --s</span></span>
                </div>
                <div class="mhb-sessions" aria-label="Global trading sessions">
                  <div class="mhb-sessions-header">
                    <span class="mhb-sessions-title">SESSIONS</span>
                    <span
                      class="root-tag sv-tip"
                      data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT13_SESSION.desc)}"
                      data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT13_SESSION.label)}"
                    >${STATUS_DICTIONARY.ROOT_TAGS.ROOT13_SESSION.label}</span>
                  </div>
                  <div class="mhb-session-row">
                    <span class="mhb-session-name">ASIA (TOKYO/HKT):</span>
                    <span id="sessionAsiaClock" class="mhb-session-clock">--:--:--</span>
                    <span id="sessionAsia" class="mhb-session-state is-closed">CLOSED</span>
                  </div>
                  <div class="mhb-session-row">
                    <span class="mhb-session-name">EUROPE (LONDON):</span>
                    <span id="sessionEuropeClock" class="mhb-session-clock">--:--:--</span>
                    <span id="sessionEurope" class="mhb-session-state is-closed">CLOSED</span>
                  </div>
                  <div class="mhb-session-row">
                    <span class="mhb-session-name">US (NEW YORK):</span>
                    <span id="sessionUSClock" class="mhb-session-clock">--:--:--</span>
                    <span id="sessionUS" class="mhb-session-state is-closed">CLOSED</span>
                  </div>
                </div>
                <div
                  id="root10VolWindow"
                  class="mhb-root10 hidden sv-tip"
                  data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.desc)}"
                  data-sv-label="[ HKT 21-23 Window - HIGH VOLATILITY ]"
                >[ HKT 21-23 Window - HIGH VOLATILITY ]</div>
              </div>
            </div>
          </div>
          <div class="gk-matrix-title inline-flex-shield">${brandShield("brand-shield-icon", 16)} Gatekeeper Defense Matrix</div>
          <div class="gk-status-row" id="gkStatusRow">
            <span
              id="gkStatusGeo"
              class="gk-status-pill sv-tip"
              tabindex="0"
              data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT2_GEO_LOCK.desc)}"
              data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT2_GEO_LOCK.ok)}"
            >${STATUS_DICTIONARY.ROOT_TAGS.ROOT2_GEO_LOCK.ok}</span>
            <span
              id="gkStatusSlippage"
              class="gk-status-pill sv-tip"
              tabindex="0"
              data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT8_SLIPPAGE_BREAKER.desc)}"
              data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT8_SLIPPAGE_BREAKER.ok)}"
            >${STATUS_DICTIONARY.ROOT_TAGS.ROOT8_SLIPPAGE_BREAKER.ok}</span>
            <span
              id="gkStatusSl"
              class="gk-status-pill sv-tip"
              tabindex="0"
              data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT1_SL_WELD.desc)}"
              data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT1_SL_WELD.label)}"
            >${STATUS_DICTIONARY.ROOT_TAGS.ROOT1_SL_WELD.label}</span>
          </div>
          <div class="gk-macro-mini gate-card us-macro-card" style="background:transparent;border:0;box-shadow:none;padding:0;">
            <div class="macro-radar-title-row typo-action text-gray-400">
              <span>📡 Macro Radar · FOMC / CPI</span>
              <span
                class="root-tag sv-tip"
                data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT_MACRO_FILTER.desc)}"
                data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT_MACRO_FILTER.label)}"
              >${STATUS_DICTIONARY.ROOT_TAGS.ROOT_MACRO_FILTER.label}</span>
            </div>
            <div id="usMacroEvents" class="us-macro-grid">
              <div class="us-macro-row typo-context">
                <span>🇺🇸 FOMC <a href="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">🔗</a></span>
                <span id="macroFomcCountdown" class="typo-num text-[#50D2C1]">8d 12h</span>
              </div>
              <div class="us-macro-row typo-context">
                <span>🇺🇸 CPI <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">🔗</a></span>
                <span id="macroCpiCountdown" class="typo-num text-[#50D2C1]">--</span>
              </div>
              <div class="us-macro-row typo-context">
                <span>🇪🇺 ECB <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">🔗</a></span>
                <span id="macroEcbCountdown" class="typo-num text-[#50D2C1]">--</span>
              </div>
              <div class="us-macro-row typo-context">
                <span>🇯🇵 BOJ <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">🔗</a></span>
                <span id="macroBojCountdown" class="typo-num text-[#50D2C1]">--</span>
              </div>
            </div>
            <div class="macro-oracle-badge">
              [ ℹ️ Data Source: Federal Reserve &amp; BLS Official Oracles | Informational Only ]
            </div>
          </div>
        </div>

        `;
}
