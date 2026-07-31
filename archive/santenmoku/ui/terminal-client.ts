/**
 * Dashboard terminal client — page accordion + Active Vault hard-cap.
 * Injected into the dashboard HTML <script> shell (Phase 3 decoupling).
 */

import { MAX_ACTIVE_VAULT_POSITIONS } from "../services/terminal-state";

export const TERMINAL_CLIENT_SCRIPT = `
    /** Top-level page accordion: only one of Steps 1–4 expanded */
    let activePageStep = 1;

    function setPageStep(step) {
      const n = Math.max(1, Math.min(4, Number(step) || 1));
      activePageStep = n;
      const steps = document.querySelectorAll('.page-step[data-page-step]');
      for (let i = 0; i < steps.length; i++) {
        const el = steps[i];
        const s = parseInt(el.getAttribute('data-page-step'), 10);
        const active = s === n;
        el.classList.toggle('is-active', active);
        const bar = el.querySelector('.page-step-bar');
        if (bar) bar.setAttribute('aria-expanded', active ? 'true' : 'false');
        const chevron = el.querySelector('.page-step-chevron');
        if (chevron) chevron.textContent = active ? '▲' : '▼';
      }
      if (typeof updatePageStepBadges === 'function') updatePageStepBadges();
    }
    window.setPageStep = setPageStep;

    function updatePageStepBadges() {
      const b1 = document.getElementById('pageStepBadge1');
      if (b1) {
        const vix = Number.isFinite(lastVixValue) ? lastVixValue.toFixed(1) : '--';
        const dvol = Number.isFinite(lastDvolValue) ? lastDvolValue.toFixed(1) + '%' : '--';
        const defconActive =
          !!window.__SV_DEMO__.forceDefcon1 ||
          (lastVixValue > 20 || lastDvolValue > 55 || isMacroBlocking);
        b1.textContent =
          (defconActive ? 'DEFCON: ACTIVE' : 'DEFCON: CLEAR') +
          ' | VIX: ' + vix + ' | DVOL: ' + dvol;
      }
      const b2 = document.getElementById('pageStepBadge2');
      if (b2 && typeof resolveAssetLabel === 'function' && selectedConsoleAsset) {
        const label = resolveAssetLabel(selectedConsoleKey, selectedConsoleAsset);
        const price = parseFloat(selectedConsoleAsset.markPrice);
        const priceText = Number.isFinite(price)
          ? '$' + price.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : '$—';
        b2.textContent = 'Active Target: [' + label + '] ' + priceText + ' (8h FR: —)';
      } else if (b2) {
        b2.textContent = 'Active Target: [—] $— (8h FR: —)';
      }
      const b3 = document.getElementById('pageStepBadge3');
      if (b3) {
        b3.textContent =
          'Strategy: HL + Spot Arbitrage | Health: 🟢 HEALTHY (Liq Dist: —) · Vault ' +
          activeVaultPositions.filter(isOpenVaultPosition).length + '/' + MAX_ACTIVE_VAULT;
      }
    }

    function calculateLiqDistance(markPrice, liqPrice) {
      if (!liqPrice || liqPrice === 0) return 100;
      if (!markPrice || markPrice === 0) return 0;
      return Math.abs((liqPrice - markPrice) / markPrice) * 100;
    }
    function evaluateMarginHealth(distancePct) {
      if (distancePct < 10) return 'CRITICAL';
      if (distancePct <= 20) return 'WARNING';
      return 'HEALTHY';
    }
    function calculateNetDelta(spotQty, perpQty) {
      return (Number(spotQty) || 0) + (Number(perpQty) || 0);
    }

    const MAX_ACTIVE_VAULT = ${MAX_ACTIVE_VAULT_POSITIONS};
    let activeVaultPositions = [];

    function isOpenVaultPosition(pos) {
      if (!pos) return false;
      return Math.abs(Number(pos.spotQty) || 0) > 1e-12 || Math.abs(Number(pos.perpQty) || 0) > 1e-12;
    }

    function isVaultAtCapacity() {
      return activeVaultPositions.filter(isOpenVaultPosition).length >= MAX_ACTIVE_VAULT;
    }

    function updateVaultLimitGate() {
      const openCount = activeVaultPositions.filter(isOpenVaultPosition).length;
      const atCap = openCount >= MAX_ACTIVE_VAULT;
      const banner = document.getElementById('vaultLimitBanner');
      if (banner) {
        if (atCap) banner.classList.remove('hidden');
        else banner.classList.add('hidden');
      }
      const countEl = document.getElementById('vaultPositionCount');
      if (countEl) countEl.innerText = openCount + '/' + MAX_ACTIVE_VAULT;
      const builder = document.getElementById('strategyBuilder');
      if (builder) builder.classList.toggle('vault-locked', atCap);
    }

    function renderActiveVaultUI() {
      const panel = document.getElementById('positionHealthMonitor');
      const cards = document.getElementById('activeVaultCards');
      const open = activeVaultPositions.filter(isOpenVaultPosition);
      if (panel) {
        if (open.length > 0) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      }
      if (cards) {
        cards.innerHTML = open.map(function(pos) {
          return '<div class="vault-card p-2 rounded border border-[#52D0B6]/30 text-xs">' +
            '<div class="font-bold text-[#52D0B6]">' + (pos.pair || 'ASSET') + '</div>' +
            '<button type="button" class="mt-1 text-[10px] underline" onclick="executeVaultUnwind(\\'' + String(pos.id).replace(/'/g, '') + '\\')">⚡ UNWIND</button>' +
          '</div>';
        }).join('');
      }
      updateVaultLimitGate();
      if (typeof updatePageStepBadges === 'function') updatePageStepBadges();
    }

    function executeVaultUnwind(vaultId) {
      if (typeof guardExecutionDisabledAction === 'function' && guardExecutionDisabledAction()) return;
      const idx = activeVaultPositions.findIndex(function(p) { return p && p.id === vaultId; });
      if (idx < 0) {
        addLog('[UNWIND] Position not found: ' + vaultId, 'warn');
        return;
      }
      activeVaultPositions.splice(idx, 1);
      renderActiveVaultUI();
    }
    window.executeVaultUnwind = executeVaultUnwind;
`;
