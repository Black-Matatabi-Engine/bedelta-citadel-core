/** Matrix render — filters, search, pagination script (part 1). */
export const MATRIX_RENDER_FILTERS_SCRIPT = `
    function resolvePairStatusKey(status, riskTripped, passedRule) {
      if (status === 'RULE_B_HIGH_RATE' || passedRule === 'B') return 'DEFICIT';
      if (riskTripped === true) return 'SPREAD';
      if (status === 'SPREAD_TOO_HIGH' || status === 'SPREAD') return 'SPREAD';
      if (status === 'SHORT_HL_SPOT_LONG_HL_PERP' || status === 'DEFICIT') return 'DEFICIT';
      if (status === 'HOLD') return 'HOLD';
      if (
        status === 'BUY_HL_SPOT_SHORT_HL_PERP' ||
        status === 'SHORT_HL_PERP_LONG_PEER_PERP' ||
        status === 'LONG_HL_PERP_SHORT_PEER_PERP' ||
        status === 'OPEN'
      ) {
        return 'OPEN';
      }
      return 'HOLD';
    }

    function onTokenSearchInput() {
      const el = document.getElementById('tokenSearchInput');
      tokenSearchQuery = el && el.value ? String(el.value).trim().toUpperCase() : '';
      currentPage = 1;
      recalculate();
    }

    function handleActionCellClick(statusKey) {
      if (statusKey === 'OPEN' && guardExecutionDisabledAction()) return false;
      return true;
    }

    function setPairStatusFilter(status) {
      if (status === 'OPEN' && guardExecutionDisabledAction()) return;
      pairStatusFilter = status || 'ALL';
      currentPage = 1;
      const buttons = document.querySelectorAll('.pair-status-btn');
      buttons.forEach(function(btn) {
        const active = btn.getAttribute('data-status') === pairStatusFilter;
        if (active) {
          btn.className = 'pair-status-btn px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit font-bold';
        } else {
          btn.className = 'pair-status-btn px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 font-bold hover:bg-white/10';
        }
      });
      recalculate();
    }

    function setMatrixCategoryFilter(category) {
      matrixCategoryFilter = category || 'ALL';
      currentPage = 1;
      document.querySelectorAll('.matrix-category-btn').forEach(function(btn) {
        const active = btn.getAttribute('data-category') === matrixCategoryFilter;
        btn.classList.toggle('active', active);
        if (active) {
          btn.className = 'matrix-category-btn active px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit font-bold';
        } else {
          btn.className = 'matrix-category-btn px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 font-bold hover:bg-white/10';
        }
      });
      recalculate();
    }

    function isPinned(symbol) {
      return pinnedSymbols.indexOf(String(symbol).toUpperCase()) >= 0;
    }

    function togglePin(symbol) {
      if (guardSettlementLockdown()) return;
      const sym = String(symbol || '').toUpperCase();
      if (!sym) return;
      const idx = pinnedSymbols.indexOf(sym);
      if (idx >= 0) {
        pinnedSymbols.splice(idx, 1);
        addLog('PIN OFF: ' + sym + ' (pinned ' + pinnedSymbols.length + '/' + MAX_PINS + ')', 'info');
        recalculate();
        return;
      }
      if (pinnedSymbols.length >= MAX_PINS) {
        console.warn('[風控死鎖] 為了防止過度交易與情緒 FOMO，置頂核心監控標的物理上限為 3 個。');
        addLog('[風控死鎖] 為了防止過度交易與情緒 FOMO，置頂核心監控標的物理上限為 3 個。', 'warn');
        return;
      }
      pinnedSymbols.push(sym);
      addLog('PIN ON: ' + sym + ' (pinned ' + pinnedSymbols.length + '/' + MAX_PINS + ')', 'success');
      recalculate();
    }

    function isSlippageLocked(row) {
      if (!row) return true;
      if (row.risk_tripped === true) return true;
      if (row.pairStatusKey === 'SPREAD') return true;
      if (row.actionStatus === 'SPREAD_TOO_HIGH') return true;
      return false;
    }

    function buildSoilResistanceHtml(row) {
      const locked = isSlippageLocked(row);
      const dondonImg =
        '<img src="/brand/dondon-eyes.webp" alt="DonDon" class="soil-shield-dondon w-7 h-auto" />';
      if (locked) {
        return '<div class="soil-shield soil-shield-trip" title="Soil Resistance — CIRCUIT BREAKER LOCKED">' +
          dondonImg +
          '<span class="font-black text-[11px]">CIRCUIT BREAKER LOCKED</span>' +
          '<span class="soil-subline">[ High Slippage Danger / Order Blocked ]</span>' +
        '</div>';
      }
      return '<div class="soil-shield soil-shield-ok" title="Soil Resistance — ATTACK READY">' +
        dondonImg +
        '<span class="font-black text-[11px]">ATTACK READY</span>' +
        '<span class="soil-subline">[ Slippage OK / Spread Permitted ]</span>' +
      '</div>';
    }

    function pickRecommendedRow(rows) {
      const eligible = (rows || []).filter(function(row) {
        return row && row.b1_symbol && row.passedRule === 'A' && !isSlippageLocked(row);
      });
      if (eligible.length === 0) return null;
      let best = eligible[0];
      for (let i = 1; i < eligible.length; i++) {
        const row = eligible[i];
        if ((row.i1_annual_cross || 0) > (best.i1_annual_cross || 0)) {
          best = row;
        }
      }
      return best;
    }

    function goToPage(page) {
      const totalPages = Math.max(1, Math.ceil(cachedDisplayList.length / PAGE_SIZE) || 1);
      currentPage = Math.min(Math.max(1, page), totalPages);
      recalculate();
    }

    function goToPrevPage() {
      goToPage(currentPage - 1);
    }

    function goToNextPage() {
      goToPage(currentPage + 1);
    }

    function updatePaginationControls(totalFiltered) {
      const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE) || 1);
      if (currentPage > totalPages) currentPage = totalPages;
      const info = document.getElementById('paginationInfo');
      if (info) {
        info.innerText = '第 ' + currentPage + ' / ' + totalPages + ' 頁 · ' + totalFiltered + ' 筆';
      }
      const prevBtn = document.getElementById('pagePrevBtn');
      const nextBtn = document.getElementById('pageNextBtn');
      if (prevBtn) {
        if (currentPage <= 1) prevBtn.setAttribute('disabled', 'true');
        else prevBtn.removeAttribute('disabled');
      }
      if (nextBtn) {
        if (currentPage >= totalPages) nextBtn.setAttribute('disabled', 'true');
        else nextBtn.removeAttribute('disabled');
      }
    }

    // Merge SOP action colors with risk gates (hide direction when tripped).

    function getSopDirection(status) {
      const s = status || 'HOLD';
      if (s === 'BUY_HL_SPOT_SHORT_HL_PERP') {
        return {
          bg: "bg-amber-500/15",
          text: "text-amber-400",
          border: "border-amber-500/30",
          direction: "📈 買 HL 現 + 📉 空 HL 合"
        };
      }
      if (s === 'SHORT_HL_SPOT_LONG_HL_PERP') {
        return {
          bg: "bg-blue-500/15",
          text: "text-blue-400",
          border: "border-blue-500/30",
          direction: "📉 空 HL 現 + 📈 多 HL 合"
        };
      }
      if (s === 'SHORT_HL_PERP_LONG_PEER_PERP') {
        return {
          bg: "bg-rose-500/15",
          text: "text-rose-400",
          border: "border-rose-500/30",
          direction: "📉 空 HL 合 + 📈 多 Peer 合"
        };
      }
      if (s === 'LONG_HL_PERP_SHORT_PEER_PERP') {
        return {
          bg: "bg-emerald-500/15",
          text: "text-emerald-400",
          border: "border-emerald-500/30",
          direction: "📈 多 HL 合 + 📉 空 Peer 合"
        };
      }
      return null;
    }

    function getActionStyle(status, riskTripped, passedRule) {
      const s = status || 'HOLD';
      if (s === 'RULE_B_HIGH_RATE' || passedRule === 'B') {
        return {
          bg: "bg-orange-600/25",
          text: "text-orange-300",
          border: "border-orange-400/50",
          label: "[ Rule B: High Rate Risk ]",
          statusKey: "DEFICIT"
        };
      }
      const statusKey = resolvePairStatusKey(s, riskTripped, passedRule);

      // Slippage breaker: hide leg direction to prevent mis-clicks.
      if (statusKey === 'SPREAD' || s === 'SPREAD_TOO_HIGH') {
        return {
          bg: "bg-red-900/40",
          text: "text-red-300",
          border: "border-red-500/50",
          label: R1018_SLIPPAGE_LOCK_LABEL,
          statusKey: "SPREAD"
        };
      }

      // Rule B extreme funding inversion block.
      if (statusKey === 'DEFICIT' || s === 'SHORT_HL_SPOT_LONG_HL_PERP') {
        return {
          bg: "bg-blue-600/25",
          text: "text-blue-300",
          border: "border-blue-400/50",
          label: "🔵【 🚨 逆差風險：費率倒掛阻斷 】",
          statusKey: "DEFICIT"
        };
      }

      if (statusKey === 'HOLD' || s === 'HOLD') {
        return {
          bg: "bg-gray-500/15",
          text: "text-gray-400",
          border: "border-gray-500/30",
          label: "🟡【 💤 靜觀其變 】",
          statusKey: "HOLD"
        };
      }

      // Attack-ready: risk badge plus SOP direction (preserve palette).
      const sop = getSopDirection(s);
      if (sop) {
        return {
          bg: sop.bg,
          text: sop.text,
          border: sop.border,
          label: "🟢【 ⚡ 建議開倉 】 " + sop.direction,
          statusKey: "OPEN"
        };
      }

      return {
        bg: "bg-gray-500/15",
        text: "text-gray-400",
        border: "border-gray-500/30",
        label: "🟡【 💤 靜觀其變 】",
        statusKey: "HOLD"
      };
    }

    function getSymbolEmoji(symbol) {
      if (!symbol) return '🪙';
      const sym = symbol.toUpperCase();
      if (sym.includes('BTC')) return '🟠';
      if (sym.includes('ETH')) return '🔵';
      if (sym.includes('SOL')) return '🟣';
      if (sym.includes('LINK')) return '🟢';
      if (sym.includes('BNB')) return '🟡';
      if (sym.includes('ADA')) return '🔵';
      if (sym.includes('XRP')) return '⚫';
      if (sym.includes('SUI')) return '💧';
      if (sym.includes('AVAX')) return '🔴';
      return '🪙';
    }

    function resolveRowCategory(row) {
      if (row && row.asset_category) return row.asset_category;
      return 'crypto';
    }

    function rowMatchesMatrixCategory(row) {
      if (!matrixCategoryFilter || matrixCategoryFilter === 'ALL') return true;
      const cat = resolveRowCategory(row);
      if (matrixCategoryFilter === 'CRYPTO') return cat === 'crypto';
      if (matrixCategoryFilter === 'COMMODITIES') return cat === 'commodity';
      if (matrixCategoryFilter === 'STOCKS_INDICES') return cat === 'stock' || cat === 'index' || cat === 'preipo';
      if (matrixCategoryFilter === 'FX') return cat === 'fx';
      return true;
    }
`;
