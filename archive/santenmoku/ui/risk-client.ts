/**
 * Dashboard risk client — SystemState subscription, Macro/DEFCON, CRI sync.
 * Injected into the dashboard HTML <script> shell (Phase 3 decoupling).
 */

export const RISK_CLIENT_SCRIPT = `
    function isSystemHardlocked() {
      return (
        systemState.hardlock === true ||
        systemState.currentCri === 0 ||
        systemState.signingChannelOpen === false
      );
    }

    function guardSystemStateHardlock() {
      if (!isSystemHardlocked()) return false;
      addLog('[風控死鎖] 蔘天木觸發物理死鎖，CRI 歸零，Hot Key 簽名通道已切斷', 'warn');
      return true;
    }

    function applySystemState(next) {
      if (typeof __svDashboardStore !== 'undefined' && __svDashboardStore.dispatch) {
        __svDashboardStore.dispatch({ type: 'SYSTEM_STATE_APPLY', payload: next || {} });
      }
    }

    function syncSystemStateBalanceFromCapital(capitalUsd) {
      const balance = Number(capitalUsd);
      if (!Number.isFinite(balance) || balance <= 0) return;
      applySystemState({
        accountBalanceUsd: balance,
        currentCri: systemState.currentCri,
        dynamicMaxSL: computeEffectiveMaxSlUsd(balance),
        hudState: systemState.hudState,
        hardlock: systemState.hardlock,
        signingChannelOpen: systemState.signingChannelOpen,
      });
    }

    function updateSystemStateUi() {
      const badge = document.getElementById('maxSlLockBadge');
      if (badge) {
        badge.innerText = 'MAX SL $' + Number(systemState.dynamicMaxSL).toFixed(2) + ' LOCK';
      }
      const criBadge = document.getElementById('criHudBadge');
      if (criBadge) {
        criBadge.innerText = 'CRI ' + systemState.currentCri + ' · ' + systemState.hudState;
        criBadge.className = 'text-[10px] font-mono ml-2 ' + (
          systemState.hudState === 'BLOCKED' ? 'text-red-400 font-black animate-pulse' :
          systemState.hudState === 'SANTENMOKU' ? 'text-rose-300 font-black' :
          systemState.hudState === 'AMBER' ? 'text-amber-300 font-bold' :
          'text-emerald-300/90'
        );
      }
      const cat = document.getElementById('forceRefreshCat');
      if (cat) {
        if (systemState.hudState === 'BLOCKED' || systemState.hudState === 'SANTENMOKU') {
          cat.classList.add('cat-spinner');
        }
      }
      updateMasterConsoleSlippage();
    }

    function exceedsDynamicMaxSL(upfrontFrictionUSD) {
      return Number(upfrontFrictionUSD) > Number(systemState.dynamicMaxSL);
    }

    function isExecutionDisabled() {
      return (
        isSystemHardlocked() ||
        settlementLockdownActive === true ||
        tsunamiShieldActive === true ||
        shieldDemoRedAlertActive === true ||
        settlementLockdownDemoActive === true
      );
    }

    function guardExecutionDisabledLink(event) {
      if (guardSystemStateHardlock()) {
        if (event && event.preventDefault) event.preventDefault();
        return false;
      }
      if (!isExecutionDisabled()) return true;
      if (event && event.preventDefault) event.preventDefault();
      if (settlementLockdownActive === true || settlementLockdownDemoActive === true) {
        addLog(settlementLockdownDemoActive ? SETTLEMENT_LOCKDOWN_DEMO_MSG : SETTLEMENT_LOCKDOWN_MSG, 'warn');
      } else {
        addLog(SHIELD_DEMO_RED_ALERT_MSG, 'warn');
      }
      return false;
    }

    function guardExecutionDisabledAction() {
      if (guardSystemStateHardlock()) return true;
      if (!isExecutionDisabled()) return false;
      if (settlementLockdownActive === true || settlementLockdownDemoActive === true) {
        addLog(settlementLockdownDemoActive ? SETTLEMENT_LOCKDOWN_DEMO_MSG : SETTLEMENT_LOCKDOWN_MSG, 'warn');
      } else {
        addLog(SHIELD_DEMO_RED_ALERT_MSG, 'warn');
      }
      return true;
    }

    function applyShieldDemoUI() {
      const box = document.getElementById('marketSessionsBox');
      const msg = document.getElementById('shieldDemoMessage');
      const stateEl = document.getElementById('hubShieldState') || document.getElementById('shieldDemoState');
      const asia = document.getElementById('sessionAsia');
      const europe = document.getElementById('sessionEurope');
      const us = document.getElementById('sessionUS');

      if (!box) return;
      if (!msg) return;

      if (shieldDemoRedAlertActive) {
        box.classList.remove('dex-settlement-box');
        box.style.background = '#dc2626';
        box.style.color = '#ffffff';
        box.style.borderColor = 'rgba(255,255,255,0.25)';
        box.style.boxShadow = 'none';
        msg.classList.remove('hidden');
        if (stateEl) stateEl.innerText = 'RED';
        const pillBase =
          'px-3 py-1.5 rounded bg-red-800/30 text-white border border-white/20 font-mono font-bold text-base';
        if (asia) asia.className = pillBase;
        if (europe) europe.className = pillBase;
        if (us) us.className = pillBase;
      } else {
        box.classList.add('dex-settlement-box');
        box.style.background = '';
        box.style.color = '';
        box.style.borderColor = '';
        box.style.boxShadow = '';
        msg.classList.add('hidden');
        if (stateEl) stateEl.innerText = 'NORMAL';
        const pillIdle = 'px-2.5 py-1 rounded bg-black/10 text-[#0b1217] border border-black/15 font-mono font-bold text-sm';
        if (asia) asia.className = pillIdle;
        if (europe) europe.className = pillIdle;
        if (us) us.className = pillIdle;
      }
    }

    function toggleShieldDemo() {
      shieldDemoRedAlertActive = !shieldDemoRedAlertActive;
      applyShieldDemoUI();
      syncCriFromLiveRiskSignals();
      syncDemoHubLamps();
      addLog(
        shieldDemoRedAlertActive
          ? SHIELD_DEMO_RED_ALERT_MSG
          : '[風控死鎖] Normal sessions restored.',
        'warn',
      );
    }

    function applySettlementLockdownDemoUI() {
      const box = document.getElementById('dexSettlementBox');
      const demoLamp = document.getElementById('settlementDemoLamp');
      const stateEl = document.getElementById('hubSettlementState') || document.getElementById('settlementLockdownDemoState');
      if (stateEl) {
        stateEl.innerText = settlementLockdownDemoActive ? 'Lockdown' : 'Normal';
      }
      if (box) {
        if (settlementLockdownDemoActive) {
          box.classList.add('settlement-demo-locked');
        } else {
          box.classList.remove('settlement-demo-locked');
        }
      }
      if (demoLamp) {
        if (settlementLockdownDemoActive) demoLamp.classList.remove('hidden');
        else demoLamp.classList.add('hidden');
      }
    }

    function toggleSettlementLockdownDemo() {
      settlementLockdownDemoActive = !settlementLockdownDemoActive;
      applySettlementLockdownDemoUI();
      syncDemoHubLamps();
      updateClocks();
      addLog(
        settlementLockdownDemoActive
          ? SETTLEMENT_LOCKDOWN_DEMO_MSG
          : '[UI] Settlement Lockdown Demo OFF — countdown restored.',
        'warn',
      );
    }

    let fundingExtremeDemoActive = false;
    let gatekeeperDemoLocked = false;

    function syncDemoHubLamps() {
      const hubShield = document.getElementById('hubShieldState');
      const hubSettle = document.getElementById('hubSettlementState');
      const hubFund = document.getElementById('hubFundingExtremeState');
      const hubGate = document.getElementById('hubGatekeeperState');
      const hubDefcon = document.getElementById('hubDefcon1State');
      const hubDefconBtn = document.getElementById('hubDefcon1ToggleBtn');
      if (hubShield) hubShield.innerText = shieldDemoRedAlertActive ? 'RED' : 'NORMAL';
      if (hubSettle) hubSettle.innerText = settlementLockdownDemoActive ? 'Lockdown' : 'Normal';
      if (hubFund) hubFund.innerText = fundingExtremeDemoActive ? 'ON' : 'OFF';
      if (hubGate) hubGate.innerText = gatekeeperDemoLocked ? 'LOCKED' : 'PASS';
      const forced = window.__SV_DEMO__.forceDefcon1 === true;
      if (hubDefcon) {
        hubDefcon.innerText = forced ? 'ON' : 'OFF';
        hubDefcon.className = forced
          ? 'px-2 py-1 rounded border border-red-400 text-red-200 text-xs font-black bg-red-600/40 animate-pulse'
          : 'px-2 py-1 rounded border border-red-500/50 text-red-300 text-xs font-black hover:bg-red-500/20';
      }
      if (hubDefconBtn) {
        hubDefconBtn.innerText = forced
          ? '[ 🚨 DEFCON 1 Mode: ON — Click to Clear ]'
          : '[ 🚨 Toggle DEFCON 1 Mode ]';
      }
    }

    function toggleDefcon1Demo() {
      svDemoDispatch({ type: 'DEMO_TOGGLE_FORCE_DEFCON1' });
      applyStep1EmergencyState();
      syncCriFromLiveRiskSignals();
      syncDemoHubLamps();
      if (window.__SV_DEMO__.forceDefcon1) {
        if (typeof showR20DeadlockOverlay === 'function') showR20DeadlockOverlay();
        addLog('[DonDon Co-Pilot] DEFCON 1 engaged — R20 physical deadlock active.', 'warn');
      } else {
        if (typeof hideR20DeadlockOverlay === 'function') hideR20DeadlockOverlay();
        addLog('[DonDon Co-Pilot] DEFCON 1 cleared — auto thresholds restored.', 'ok');
      }
    }

    function isSettlementLockdown() {
      return settlementLockdownActive === true;
    }

    function guardSettlementLockdown() {
      if (isTsunamiShieldActive() && guardTsunamiShield()) return true;
      if (!isSettlementLockdown()) return false;
      addLog(SETTLEMENT_LOCKDOWN_MSG, 'warn');
      return true;
    }

    function isTsunamiShieldActive() {
      return tsunamiShieldActive === true;
    }

    function guardTsunamiShield() {
      if (!isTsunamiShieldActive()) return false;
      addLog('[風控死鎖] 海嘯期 HKT 21:00–23:00 · Soil Resistance 已鎖死開倉。', 'warn');
      return true;
    }

    function getHktHour(now) {
      now = now || new Date();
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Hong_Kong',
        hour: 'numeric',
        hour12: false
      }).formatToParts(now);
      const hourPart = parts.find(function(p) { return p.type === 'hour'; });
      return parseInt(hourPart && hourPart.value ? hourPart.value : '0', 10);
    }

    function guardSettlementLockdownLink(event) {
      return guardExecutionDisabledLink(event);
    }

    /** Macro Radar Phase 1 calendar (UTC → HKT countdown) */
    const US_MACRO_EVENTS = [
      { id: 'macroFomcCountdown', label: 'US FED FOMC', dates: ['2026-07-29T18:00:00Z', '2026-09-16T18:00:00Z', '2026-11-04T19:00:00Z', '2026-12-16T19:00:00Z'] },
      { id: 'macroCpiCountdown', label: 'US CPI', dates: ['2026-08-12T12:30:00Z', '2026-09-11T12:30:00Z', '2026-10-14T12:30:00Z'] },
      { id: 'macroEcbCountdown', label: 'EU ECB', dates: ['2026-09-11T12:15:00Z', '2026-10-30T12:15:00Z', '2026-12-18T13:15:00Z'] },
      { id: 'macroBojCountdown', label: 'Asia BOJ', dates: ['2026-09-19T03:00:00Z', '2026-10-31T03:00:00Z', '2026-12-19T03:00:00Z'] },
    ];

    /**
     * Phase 2 reserved shape — Polymarket prediction markets.
     * @typedef {{ marketId: string, question: string, yesPrice?: number, volumeUsd?: number, endDateIso?: string, sourceUrl?: string, tags?: string[] }} PredictionMarketData
     */
    /** @type {PredictionMarketData[]|null} */
    let predictionMarketCache = null;
    void predictionMarketCache;

    function formatMacroCountdown(ms) {
      if (ms <= 0) return 'LIVE / RELEASED';
      const totalSec = Math.floor(ms / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      if (days > 0) return days + 'd ' + hours + 'h';
      if (hours > 0) return hours + 'h ' + mins + 'm';
      return mins + 'm';
    }

    function nextMacroDate(dates, now) {
      const t = now.getTime();
      for (let i = 0; i < dates.length; i++) {
        const d = new Date(dates[i]).getTime();
        if (d + 2 * 3600 * 1000 > t) return d;
      }
      return new Date(dates[dates.length - 1]).getTime();
    }

    /** Macro blocking window: LIVE or within 6h before release */
    const MACRO_BLOCK_MS = 6 * 3600 * 1000;
    let lastVixValue = 16.8;
    let lastDvolValue = 52.5;
    let isMacroBlocking = false;
    svDemoDispatch({ type: 'DEMO_INIT' });

    function computeIsMacroBlocking(now) {
      now = now || new Date();
      const t = now.getTime();
      for (let i = 0; i < US_MACRO_EVENTS.length; i++) {
        const target = nextMacroDate(US_MACRO_EVENTS[i].dates, now);
        const ms = target - t;
        if (ms <= MACRO_BLOCK_MS) return true;
      }
      return false;
    }

    function applyStep1EmergencyState() {
      const vix = lastVixValue;
      const dvol = lastDvolValue;
      const isEmergencyState =
        window.__SV_DEMO__.forceDefcon1 || (vix > 20 || dvol > 55 || isMacroBlocking);
      const panel = document.getElementById('macroSentimentRadar') || document.getElementById('step1ColCenter') || document.getElementById('step1ColLeft') || document.getElementById('step1LeftPanel');
      const banner = document.getElementById('step1AllRedBanner');
      if (!panel) return;
      if (isEmergencyState) {
        panel.classList.add(
          'all-red-mode',
          'bg-red-950/90',
          'border-2',
          'border-red-500',
          'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
          'animate-pulse',
        );
        if (banner) {
          banner.classList.remove('hidden');
          banner.textContent =
            '🚨 DEFCON 1: ALL-RED RISK ALERT (MACRO / HIGH VOLATILITY LOCKDOWN)';
        }
      } else {
        panel.classList.remove(
          'all-red-mode',
          'bg-red-950/90',
          'border-2',
          'border-red-500',
          'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
          'animate-pulse',
        );
        if (banner) banner.classList.add('hidden');
      }
    }

    function updateUsMacroCountdowns(now) {
      now = now || new Date();
      US_MACRO_EVENTS.forEach(function(ev) {
        const el = document.getElementById(ev.id);
        if (!el) return;
        const target = nextMacroDate(ev.dates, now);
        el.textContent = formatMacroCountdown(target - now.getTime());
      });
      isMacroBlocking = computeIsMacroBlocking(now);
      applyStep1EmergencyState();
      syncCriFromLiveRiskSignals();
    }

    let connectedWalletAddress = '';

    function applyCountdownLockdown(wrapEl, countEl, secsLeft) {
      if (!wrapEl || !countEl) return;
      const locked = settlementLockdownDemoActive || secsLeft < SETTLEMENT_LOCKDOWN_SEC;
      if (locked) {
        countEl.innerText = settlementLockdownDemoActive
          ? '⚠️ SETTLEMENT LOCKDOWN DEMO: NO OPEN POSITIONS'
          : '⚠️ SETTLEMENT LOCKDOWN: NO OPEN POSITIONS';
        countEl.className = 'countdown-lockdown';
        wrapEl.className = wrapEl.className.replace(/text-(emerald|rose)-400/g, '') + ' settlement-active';
        wrapEl.style.color = '#ffffff';
      } else {
        const pad = (n) => String(n).padStart(2, '0');
        const mm = Math.floor(secsLeft / 60);
        const ss = secsLeft % 60;
        countEl.innerText = pad(mm) + ':' + pad(ss);
        wrapEl.style.color = '#0b1217';
        if (wrapEl.id === 'hlCountdownWrap') {
          wrapEl.className = '';
          countEl.className = 'underline decoration-black/40 underline-offset-4';
        } else {
          wrapEl.className = '';
          countEl.className = 'underline decoration-black/40 underline-offset-4';
        }
      }
    }

    function updateRootSlipProtectionStatus() {
      const box = document.getElementById('rootSlipProtectionStatus');
      const lamp = document.getElementById('rootSlipBreakerLamp');
      if (!lamp) return;
      const tripped = settlementLockdownActive || tsunamiShieldActive || shieldDemoRedAlertActive || settlementLockdownDemoActive;
      if (tripped) {
        lamp.innerHTML = '🟠 Slip Breaker: LOCKED | Max 0.5% Slippage Tolerance';
        if (box) box.classList.add('tripped');
      } else {
        lamp.innerHTML = '🟢 Slip Breaker: ACTIVE | Max 0.5% Slippage Tolerance';
        if (box) box.classList.remove('tripped');
      }
    }

    function updateVolatilityFilters(vixValue, dvolValue) {
      const vixTradEl = document.getElementById('vixTrad');
      const vixCryptoEl = document.getElementById('vixCrypto');
      const vixNum = parseFloat(vixValue);
      const dvolNum = parseFloat(dvolValue);
      lastVixValue = Number.isFinite(vixNum) ? vixNum : lastVixValue;
      lastDvolValue = Number.isFinite(dvolNum) ? dvolNum : lastDvolValue;
      const vixPanic = Number.isFinite(vixNum) && vixNum >= 22;
      const dvolHigh = Number.isFinite(dvolNum) && dvolNum >= 45;
      const vixLink = ' <a href="https://www.cboe.com/tradable_products/vix/" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="CBOE VIX">🔗</a>';
      const dvolLink = ' <a href="https://www.deribit.com/statistics/BTC/volatility-index" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="Deribit DVOL">🔗</a>';

      if (vixTradEl) {
        const mood = vixPanic
          ? '<span class="emoji-xl">😵</span> 傳統市場：恐慌暴動 / Panic'
          : '<span class="emoji-xl">😌</span> 傳統市場：平穩 / Stable';
        vixTradEl.innerHTML = 'VIX (Trad): <strong>' + (Number.isFinite(vixNum) ? vixNum.toFixed(1) : '--') + '</strong>' + vixLink + ' [ ' + mood + ' ]';
        vixTradEl.className = vixPanic
          ? 'vol-filter-badge rounded bg-red-500/20 text-red-300 border-2 border-red-500/50 font-mono font-bold text-sm animate-pulse'
          : 'vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm';
      }

      if (vixCryptoEl) {
        const mood = dvolHigh
          ? '<span class="emoji-xl">🤪</span> 加密市場：瘋狂洗盤 / High Vol'
          : '<span class="emoji-xl">😌</span> 加密市場：橫盤蓄勢 / Low Vol';
        vixCryptoEl.innerHTML = 'DVOL (Crypto): <strong>' + (Number.isFinite(dvolNum) ? dvolNum.toFixed(1) + '%' : '--') + '</strong>' + dvolLink + ' [ ' + mood + ' ]';
        vixCryptoEl.className = dvolHigh
          ? 'vol-filter-badge text-orange-300 font-mono font-bold text-sm bg-red-950/40 border-2 border-orange-500/50 px-3 py-1.5 rounded animate-pulse'
          : 'vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm';
      }

      applyStep1EmergencyState();
      syncCriFromLiveRiskSignals();
    }

    /** Client-side mirror of systemState.deriveCriFromRiskSignals (Tiered Root 100→0) */
    function deriveCriFromRiskSignalsClient(signals) {
      var cri = 100;
      var T1 = 5, T2 = 12, T3 = 25;
      function applyTier(current, tier) {
        var c = Number.isFinite(current) ? Math.max(0, Math.min(100, current)) : 100;
        if (tier === 4) return 0;
        if (tier === 3) return Math.max(0, c - T3);
        if (tier === 2) return Math.max(0, c - T2);
        return Math.max(0, c - T1);
      }
      if (signals.tsunamiShieldActive) cri = applyTier(cri, 1);
      var macroBlocking = !!signals.macroBlocking;
      if (macroBlocking || (signals.vix || 0) > 20 || (signals.dvol || 0) > 55) {
        cri = applyTier(cri, 1);
      }
      var rows = signals.matrixRows || [];
      var anyRootTrip = rows.some(function(r) {
        return (r.risk_reasons || []).indexOf('RISK_LIMIT_EXCEEDED') >= 0;
      });
      var anySoilTrip = rows.some(function(r) {
        return r.risk_tripped === true && (r.risk_reasons || []).indexOf('RISK_LIMIT_EXCEEDED') < 0;
      });
      if (anyRootTrip) cri = applyTier(cri, 3);
      else if (anySoilTrip) cri = applyTier(cri, 2);
      return cri;
    }

    function resolveHudStateClient(currentCri, hardlock, synced) {
      if (synced === undefined) synced = true;
      if (hardlock || currentCri <= 0) return 'BLOCKED';
      if (!synced) return 'IDLE';
      if (currentCri <= 25) return 'SANTENMOKU';
      if (currentCri <= 50) return 'AMBER';
      return 'GREEN';
    }

    /** Push Macro / Tsunami / DEFCON / vol signals into SystemState CRI */
    function syncCriFromLiveRiskSignals() {
      var macroBlocking = isMacroBlocking === true || window.__SV_DEMO__.forceDefcon1 === true;
      var tsunami = tsunamiShieldActive === true || shieldDemoRedAlertActive === true;
      var cri = deriveCriFromRiskSignalsClient({
        tsunamiShieldActive: tsunami,
        macroBlocking: macroBlocking,
        vix: lastVixValue,
        dvol: lastDvolValue,
        matrixRows: typeof globalData !== 'undefined' ? globalData : [],
      });
      var hardlock = cri <= 0;
      applySystemState({
        accountBalanceUsd: systemState.accountBalanceUsd,
        currentCri: cri,
        dynamicMaxSL: systemState.dynamicMaxSL,
        hudState: resolveHudStateClient(cri, hardlock, true),
        hardlock: hardlock,
        signingChannelOpen: !hardlock,
      });
    }
`;

/** V1 dashboard core — guards + UI sync; state writes live in dashboard-store.ts */
export const RISK_CLIENT_CORE_SCRIPT = `
    function isSystemHardlocked() {
      return (
        systemState.hardlock === true ||
        systemState.currentCri === 0 ||
        systemState.signingChannelOpen === false
      );
    }

    function guardSystemStateHardlock() {
      if (!isSystemHardlocked()) return false;
      addLog('[風控死鎖] 蔘天木觸發物理死鎖，CRI 歸零，Hot Key 簽名通道已切斷', 'warn');
      return true;
    }

    function syncSystemStateBalanceFromCapital(capitalUsd) {
      const balance = Number(capitalUsd);
      if (!Number.isFinite(balance) || balance <= 0) return;
      applySystemState({
        accountBalanceUsd: balance,
        currentCri: systemState.currentCri,
        dynamicMaxSL: computeEffectiveMaxSlUsd(balance),
        hudState: systemState.hudState,
        hardlock: systemState.hardlock,
        signingChannelOpen: systemState.signingChannelOpen,
      });
    }

    function updateSystemStateUi() {
      const badge = document.getElementById('maxSlLockBadge');
      if (badge) {
        badge.innerText = 'MAX SL $' + Number(systemState.dynamicMaxSL).toFixed(2) + ' LOCK';
      }
      const criBadge = document.getElementById('criHudBadge');
      if (criBadge) {
        criBadge.innerText = 'CRI ' + systemState.currentCri + ' · ' + systemState.hudState;
        criBadge.className = 'text-[10px] font-mono ml-2 ' + (
          systemState.hudState === 'BLOCKED' ? 'text-red-400 font-black animate-pulse' :
          systemState.hudState === 'SANTENMOKU' ? 'text-rose-300 font-black' :
          systemState.hudState === 'AMBER' ? 'text-amber-300 font-bold' :
          'text-emerald-300/90'
        );
      }
      const cat = document.getElementById('forceRefreshCat');
      if (cat) {
        if (systemState.hudState === 'BLOCKED' || systemState.hudState === 'SANTENMOKU') {
          cat.classList.add('cat-spinner');
        }
      }
      if (typeof updateMasterConsoleSlippage === 'function') {
        updateMasterConsoleSlippage();
      }
    }

    function resolveHudStateClient(currentCri, hardlock, synced) {
      if (synced === undefined) synced = true;
      if (hardlock || currentCri <= 0) return 'BLOCKED';
      if (!synced) return 'IDLE';
      if (currentCri <= 25) return 'SANTENMOKU';
      if (currentCri <= 50) return 'AMBER';
      return 'GREEN';
    }

    function syncCriFromLiveRiskSignals() {
      if (typeof refreshCriAndStatusHud === 'function') {
        refreshCriAndStatusHud();
      }
    }

    function initRiskClientStoreSubscription() {
      if (typeof __svDashboardStore === 'undefined' || typeof __svDashboardStore.subscribe !== 'function') return;
      __svDashboardStore.subscribe(function(state, action) {
        if (!action || action.type !== 'SYSTEM_STATE_APPLY') return;
        updateSystemStateUi();
      });
    }
    initRiskClientStoreSubscription();
`;
