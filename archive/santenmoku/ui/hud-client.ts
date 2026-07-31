/**
 * Vanilla HUD stream client — mirrors useHudStream.ts for dashboard.ts injection.
 */

export const HUD_CANARY_HEADER = "santenmoku";
export const HUD_STREAM_POLL_MS = 150;

export const HUD_CLIENT_SCRIPT = `
    let hudStreamPayload = null;
    let hudStreamError = null;
    let hudStreamTimer = null;

    async function fetchHudStream() {
      try {
        const response = await fetch('/api/hud-stream', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'X-Santenmoku-Canary': '${HUD_CANARY_HEADER}',
          },
        });
        const body = await response.json();
        if (!response.ok || body.success !== true) {
          hudStreamPayload = null;
          hudStreamError = body.error || ('HUD stream HTTP ' + response.status);
          return null;
        }
        hudStreamPayload = body;
        hudStreamError = null;
        applyHudStreamPayload(body);
        return body;
      } catch (err) {
        hudStreamPayload = null;
        hudStreamError = err && err.message ? err.message : String(err);
        return null;
      }
    }

    function applyHudStreamPayload(payload) {
      if (!payload || typeof payload !== 'object') return;
      try {

      const left = payload.leftEyeDefense || {};
      const crown = payload.crownTreasuryPnl || {};
      const probe = payload.marketProbe || {};

      if (typeof applySystemState === 'function') {
        applySystemState({
          accountBalanceUsd: crown.accountBalanceUsd != null
            ? crown.accountBalanceUsd
            : systemState.accountBalanceUsd,
          currentCri: crown.criIndex != null ? crown.criIndex : systemState.currentCri,
          dynamicMaxSL: left.dynamicMaxSlUsd != null
            ? left.dynamicMaxSlUsd
            : systemState.dynamicMaxSL,
          hudState: crown.hudState || systemState.hudState,
          hardlock: left.hardlock === true,
          signingChannelOpen: left.hardlock !== true,
        });
      }

      const dynSl = document.getElementById('dynSlLockTag');
      if (dynSl && left.dynamicMaxSlUsd != null && typeof dynamicMaxSlPct === 'function') {
        const pct = dynamicMaxSlPct(10000, systemState.accountBalanceUsd || 10000);
        dynSl.innerHTML = '[ ' + (typeof brandShieldImg === 'function' ? brandShieldImg('brand-shield-icon', 14) : '') +
          ' MAX SL DYNAMIC WELD | DYN-SL: ' + pct.toFixed(2) + '% ($' + Number(left.dynamicMaxSlUsd).toFixed(0) + ' MAX LOSS) ]';
      }

      const soilBadge = document.getElementById('consoleSoilBadge');
      if (soilBadge && left.status) {
        if (left.status === 'PASS') {
          soilBadge.className = 'soil-badge soil-solid w-fit mt-1 sv-tip';
          soilBadge.textContent = '[ SOIL PASS · HEDGE ACTIVE ]';
        } else if (left.status === 'LOCKED') {
          soilBadge.className = 'soil-badge soil-danger w-fit mt-1 sv-tip';
          soilBadge.textContent = '[ SOIL LOCKED · CHANNEL SEVERED ]';
        } else {
          soilBadge.className = 'soil-badge soil-balanced w-fit mt-1 sv-tip';
          soilBadge.textContent = '[ SOIL STANDBY · SENSING ]';
        }
      }

      const pairCountEl = document.getElementById('headerPairCount');
      if (pairCountEl && probe.livePairsCount != null) {
        pairCountEl.textContent = String(probe.livePairsCount) + ' pairs live';
      }

      const bestSymbolEl = document.getElementById('bestPairSymbol');
      if (bestSymbolEl && probe.bestToken && (!bestSymbolEl.textContent || bestSymbolEl.textContent.indexOf('---') >= 0)) {
        bestSymbolEl.textContent = String(probe.bestToken).toUpperCase() + ' / USDC';
      }

      if (probe.selectToken && !selectedConsoleKey) {
        const labelEl = document.getElementById('consoleSelectedLabel');
        if (labelEl) {
          labelEl.className = 'inject-status-badge is-active text-slate-950';
          labelEl.innerHTML = '🎯 <span class="font-black">[ ' + String(probe.selectToken).toUpperCase() + ' ]</span> STANDBY';
        }
        if (typeof injectTokenToMasterConsole === 'function') {
          const found = typeof lookupAssetByKey === 'function'
            ? lookupAssetByKey(probe.selectToken)
            : null;
          if (found) injectTokenToMasterConsole(found.key, found.asset);
        }
      }

      if (left.status === 'PASS' && ROOT_DEFENSE_TELEMETRY && ROOT_DEFENSE_TELEMETRY[4]) {
        ROOT_DEFENSE_TELEMETRY[4].status = 'ACTIVE';
      }
      if (typeof refreshCriAndStatusHud === 'function') {
        refreshCriAndStatusHud();
      }
      if (typeof dismissAppBootBanner === 'function') {
        dismissAppBootBanner();
      }
      } catch (err) {
        console.error('[hud-stream] apply payload failed', err);
        if (typeof showDashboardBootError === 'function') {
          showDashboardBootError(err);
        }
      }
    }

    function startHudStreamPoll() {
      if (hudStreamTimer) return;
      void fetchHudStream();
      hudStreamTimer = window.setInterval(function() {
        void fetchHudStream();
      }, ${HUD_STREAM_POLL_MS});
    }
`;
