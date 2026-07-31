import {
  computeBasisHedgePrefill,
  formatCopilotSoilCareMessage,
  R20_DEADLOCK_OVERLAY_BODY,
  R20_DEADLOCK_OVERLAY_TITLE,
  YIN_GUARD_MODE_BADGE,
} from "../services/copilot-care-messages";

/** Browser helpers — DonDon Co-Pilot HMI (injected via dashboard.ts). */
export const COPILOT_HMI_SCRIPT = `
    let yinGuardModeActive = false;
    let lastCopilotCareKey = '';

    function formatCopilotSoilCareMessage(orderSizeUsd, slipRatio, cappedMaxSlUsd) {
      return (${formatCopilotSoilCareMessage.toString()})({
        orderSizeUsd: orderSizeUsd,
        soilCapacityPct: slipRatio,
        cappedMaxSlUsd: cappedMaxSlUsd,
      });
    }

    function computeBasisHedgePrefill(row, vaultEquityUsd) {
      return (${computeBasisHedgePrefill.toString()})(row, vaultEquityUsd);
    }

    function pushCopilotCareLog(slipRatio) {
      const equity = resolveAccountEquityUsd();
      const orderSize = masterOrderSizeUsd || 10000;
      const capped = computeOrderAwareMaxSlUsd(equity, orderSize, slipRatio || 0.005);
      const msg = formatCopilotSoilCareMessage(orderSize, slipRatio || 0.005, capped);
      const careKey = orderSize + '|' + (slipRatio || 0) + '|' + capped;
      if (careKey === lastCopilotCareKey) return;
      lastCopilotCareKey = careKey;
      if (typeof appendStep1CondensedLog === 'function') {
        appendStep1CondensedLog(msg, 'warn');
      }
      if (typeof pushExecLog === 'function') {
        pushExecLog(msg, 'warn');
      }
      const badge = document.getElementById('copilotCareBadge');
      if (badge) {
        badge.textContent = msg;
        badge.classList.remove('hidden');
        badge.classList.add('is-visible');
      }
    }

    function clearCopilotCareLog() {
      lastCopilotCareKey = '';
      const badge = document.getElementById('copilotCareBadge');
      if (badge) {
        badge.textContent = '';
        badge.classList.add('hidden');
        badge.classList.remove('is-visible');
      }
    }

    function applyYinGuardMode() {
      if (yinGuardModeActive) return;
      yinGuardModeActive = true;
      const badge = document.getElementById('dondonIpBadge');
      const frame = document.getElementById('dondonIpFrame');
      if (badge) {
        badge.textContent = ${JSON.stringify(YIN_GUARD_MODE_BADGE)};
        badge.classList.add('is-yin-guard');
      }
      if (frame) frame.classList.add('is-yin-guard-mode');
      const taijiEl = document.getElementById('taijiModeBadge');
      if (taijiEl) {
        taijiEl.textContent = '( GUARD 陰 MODE )';
        taijiEl.className = 'taiji-mode-badge sv-tip taiji-mode-yin is-yin-guard-active';
      }
    }

    function clearYinGuardMode() {
      if (!yinGuardModeActive) return;
      yinGuardModeActive = false;
      const badge = document.getElementById('dondonIpBadge');
      const frame = document.getElementById('dondonIpFrame');
      if (badge) badge.classList.remove('is-yin-guard');
      if (frame) frame.classList.remove('is-yin-guard-mode');
      if (typeof applyDonDonIpDisplay === 'function') applyDonDonIpDisplay();
      if (typeof refreshTaijiBaguaHud === 'function') refreshTaijiBaguaHud();
    }

    function showR20DeadlockOverlay() {
      const overlay = document.getElementById('r20DeadlockOverlay');
      if (!overlay) return;
      overlay.classList.remove('hidden');
      overlay.setAttribute('aria-hidden', 'false');
    }

    function hideR20DeadlockOverlay() {
      const overlay = document.getElementById('r20DeadlockOverlay');
      if (!overlay) return;
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }

    function prefillStep3FromBestHedge(row) {
      if (!row) return;
      const vault = resolveVaultEquityUsd();
      const prefill = computeBasisHedgePrefill(row, vault);
      if (typeof applyCapitalUsd === 'function') {
        applyCapitalUsd(prefill.suggestedCapitalUsd, { forceInput: true, sanitize: true });
      }
      masterOrderSizeUsd = prefill.suggestedOrderSizeUsd;
      if (typeof syncOrderSizeUi === 'function') syncOrderSizeUi(masterOrderSizeUsd);
      const frictionInput = document.getElementById('frictionInput');
      if (frictionInput) frictionInput.value = String(prefill.frictionPct);
      const fixedCostInput = document.getElementById('fixedCostInput');
      if (fixedCostInput) fixedCostInput.value = String(prefill.fixedCostUsd.toFixed(2));
      if (typeof updateStep3BlockEconomics === 'function') updateStep3BlockEconomics();
      if (typeof updateMasterConsoleSlippage === 'function') updateMasterConsoleSlippage();
      if (typeof pushExecLog === 'function') {
        pushExecLog(
          '[AUTO-PILOT] Basis ratio ' + (prefill.basisRatio * 100).toFixed(3) +
          '% · capital $' + prefill.suggestedCapitalUsd.toLocaleString() +
          ' · size $' + prefill.suggestedOrderSizeUsd.toLocaleString(),
          'ok'
        );
      }
    }

    /** Co-Pilot override — zero-friction Step 3 lock from Best Hedge radar. */
    function lockBestHedgeToStep3() {
      if (!cachedBestHedgeRow || !cachedBestHedgeRow.b1_symbol) {
        if (typeof appendStep1CondensedLog === 'function') {
          appendStep1CondensedLog(
            '[DonDon Co-Pilot] Scanning Rule A hedges — stand by for optimal basis pair.',
            'warn'
          );
        }
        return;
      }
      const row = cachedBestHedgeRow;
      const asset = assetFromMatrixRow(row);
      injectTokenToMasterConsole(row.b1_symbol, asset);
      prefillStep3FromBestHedge(row);
      if (typeof triggerDonDonOrangeTarget === 'function') triggerDonDonOrangeTarget();
      const step3 = document.getElementById('sniperExecutionShield');
      if (step3 && step3.scrollIntoView) {
        step3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      const maxSl = resolveEffectiveMaxSlUsd();
      const basisPct = ((Number(row.k1_basis_sp) || 0) * 100).toFixed(3);
      const careMsg =
        '[DonDon Co-Pilot] ' + row.b1_symbol + ' locked @ ' + (row.i1_annual_cross || 0).toFixed(2) +
        '% APR · basis ' + basisPct + '% · Dynamic Max SL $' + maxSl.toFixed(0);
      if (typeof appendStep1CondensedLog === 'function') appendStep1CondensedLog(careMsg, 'ok');
      if (typeof pushExecLog === 'function') pushExecLog(careMsg + ' · Step 3 pre-filled', 'ok');
    }
`;

export const R20_DEADLOCK_OVERLAY_HTML = `
  <div id="r20DeadlockOverlay" class="r20-deadlock-overlay hidden" role="alertdialog" aria-hidden="true" aria-labelledby="r20DeadlockTitle" aria-describedby="r20DeadlockBody">
    <div class="r20-deadlock-panel">
      <h2 id="r20DeadlockTitle">${R20_DEADLOCK_OVERLAY_TITLE}</h2>
      <p id="r20DeadlockBody">${R20_DEADLOCK_OVERLAY_BODY}</p>
    </div>
  </div>`;
