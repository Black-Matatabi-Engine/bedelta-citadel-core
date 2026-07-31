/** Matrix render — recalculate, table rows, drag (part 2). */
export const MATRIX_RENDER_TABLE_SCRIPT = `
    function recalculate() {
          try {
            const capitalInputEl = document.getElementById('capitalInput');
            const capitalFromInput = parseFloat(capitalInputEl && capitalInputEl.value);
            const capital = Number.isFinite(masterOrderSizeUsd) && masterOrderSizeUsd > 0
              ? masterOrderSizeUsd
              : (Number.isFinite(capitalFromInput) ? capitalFromInput : 10000);
            syncStep3CapitalUi(capital);
            const frictionRate = getStep3FrictionRate();
            const fixedCost = getStep3FixedCost();
            
            const upfrontFrictionUSD = (capital * frictionRate) + fixedCost;
            
            const frictionBlockVal = document.getElementById('displayTotalFriction');
            if (frictionBlockVal) {
              frictionBlockVal.innerText = "$" + upfrontFrictionUSD.toFixed(2);
            }

            const tbody = document.getElementById('matrixTableBody');
            if (!tbody) return;

            if (!globalData || globalData.length === 0) {
              const tradfiOnly = buildTradFiMatrixRows(cachedTradFiEnrichment);
              if (!tradfiOnly.length) {
                tbody.innerHTML = '<tr><td colspan="13" class="p-4 text-center text-rose-400 font-bold">⚠️ 等待數據網關接入或無可用標的...</td></tr>';
                cachedDisplayList = [];
                updatePaginationControls(0);
                return;
              }
            }

            // Sanitize matrix rows (Rule A/B crypto + TradFi HL assets).
            let processedData = mergeMatrixDataSource(globalData).map(item => {
              const row = { ...item };
              row.b1_symbol = row.b1_symbol || 'Unknown';
              row.c1_hl_spot = parseFloat(row.c1_hl_spot) || 0;
              row.d1_hl_perp = parseFloat(row.d1_hl_perp) || 0;
              row.e1_hl_funding = parseFloat(row.e1_hl_funding) || 0;
              row.f1_peer_perp = parseFloat(row.f1_peer_perp) || 0;
              row.g1_peer_funding = parseFloat(row.g1_peer_funding) || 0;
              row.i1_annual_cross = parseFloat(row.i1_annual_cross) || 0;
              row.std_dev_24h = parseFloat(row.std_dev_24h) || 0;
              row.vol_3d_avg = parseFloat(row.vol_3d_avg) || 0;
              row.stability = parseFloat(row.stability) || 0;
              row.hl_oi_usd = parseFloat(row.hl_oi_usd) || parseFloat(row.vol_3d_avg) || 0;
              row.peer_oi_usd = parseFloat(row.peer_oi_usd) || 0;
              return row;
            });

            // Rule A enforced server-side; client search/status/category/pagination only.
            let filteredData = processedData.filter(row => {
              const hasSymbol = !!row.b1_symbol && row.b1_symbol !== 'Unknown';
              const hasPrice = row.c1_hl_spot > 0 || row.d1_hl_perp > 0;
              return hasSymbol && hasPrice && rowMatchesMatrixCategory(row);
            });

            // Tab filter from backend actionStatus; derive only when missing.
            let displayList = filteredData.map(row => {
              const dailyYieldRate = (row.i1_annual_cross / 100) / 365;
              const dailyGrossProfit = capital * dailyYieldRate;
              const net7 = (dailyGrossProfit * 7) - upfrontFrictionUSD;
              const net30 = (dailyGrossProfit * 30) - upfrontFrictionUSD;
              const spread = row.e1_hl_funding - row.g1_peer_funding;

              const currentStatus = row.actionStatus || '';
              const riskTripped = row.risk_tripped === true;
              let styleObj;
              if (currentStatus) {
                styleObj = getActionStyle(currentStatus, riskTripped, row.passedRule);
              } else if (riskTripped) {
                styleObj = getActionStyle('SPREAD_TOO_HIGH', true, row.passedRule);
              } else {
                styleObj = getActionStyle('HOLD', false, row.passedRule);
                if (row.net7 <= 0 || exceedsDynamicMaxSL(upfrontFrictionUSD)) {
                  styleObj = getActionStyle('HOLD', false, row.passedRule);
                } else {
                  const hlPerpDiff = (row.d1_hl_perp - row.c1_hl_spot) / row.c1_hl_spot;
                  const crossExDiff = Math.abs(row.d1_hl_perp - row.f1_peer_perp) / row.d1_hl_perp;
                  if (hlPerpDiff > 0.015) {
                    styleObj = getActionStyle('BUY_HL_SPOT_SHORT_HL_PERP', false, row.passedRule);
                  } else if (hlPerpDiff < -0.015) {
                    styleObj = getActionStyle('SHORT_HL_SPOT_LONG_HL_PERP', false, row.passedRule);
                  } else if (crossExDiff < 0.005) {
                    if (row.e1_hl_funding > row.g1_peer_funding) {
                      styleObj = getActionStyle('SHORT_HL_PERP_LONG_PEER_PERP', false, row.passedRule);
                    } else if (row.g1_peer_funding > row.e1_hl_funding) {
                      styleObj = getActionStyle('LONG_HL_PERP_SHORT_PEER_PERP', false, row.passedRule);
                    } else {
                      styleObj = getActionStyle('HOLD', false, row.passedRule);
                    }
                  } else {
                    styleObj = getActionStyle('SPREAD_TOO_HIGH', false, row.passedRule);
                  }
                }
              }

              const pairStatusKey = resolvePairStatusKey(
                currentStatus || (
                  styleObj.statusKey === 'SPREAD' ? 'SPREAD_TOO_HIGH' :
                  styleObj.statusKey === 'DEFICIT' ? (row.passedRule === 'B' ? 'RULE_B_HIGH_RATE' : 'SHORT_HL_SPOT_LONG_HL_PERP') :
                  styleObj.statusKey === 'OPEN' ? 'BUY_HL_SPOT_SHORT_HL_PERP' :
                  'HOLD'
                ),
                riskTripped,
                row.passedRule
              );

              return {
                ...row,
                spread,
                net7,
                net30,
                styleObj,
                pairStatusKey: pairStatusKey
              };
            });

            // Token search/status filters — never apply to pinned rows.
            const pinnedSet = {};
            pinnedSymbols.forEach(function(s) { pinnedSet[s] = true; });

            const pinnedPool = displayList.filter(function(row) {
              return !!pinnedSet[String(row.b1_symbol).toUpperCase()];
            });
            // Keep pin order stable
            pinnedPool.sort(function(a, b) {
              return pinnedSymbols.indexOf(String(a.b1_symbol).toUpperCase()) -
                pinnedSymbols.indexOf(String(b.b1_symbol).toUpperCase());
            });

            let unpinnedList = displayList.filter(function(row) {
              return !pinnedSet[String(row.b1_symbol).toUpperCase()];
            });

            if (tokenSearchQuery) {
              unpinnedList = unpinnedList.filter(function(row) {
                return String(row.b1_symbol).toUpperCase().indexOf(tokenSearchQuery) >= 0;
              });
            }

            if (pairStatusFilter && pairStatusFilter !== 'ALL') {
              unpinnedList = unpinnedList.filter(function(row) {
                if (row.isTradFiSynthetic) return matrixCategoryFilter !== 'CRYPTO';
                return row.pairStatusKey === pairStatusFilter;
              });
            }

            // Sort unpinned rows only; pinned rows keep top order.
            if (currentSortCol !== -1) {
              unpinnedList.sort((a, b) => {
                let valA, valB;
                switch (currentSortCol) {
                  case 1: valA = a.b1_symbol; valB = b.b1_symbol; break;
                  case 2: valA = a.hl_oi_usd || 0; valB = b.hl_oi_usd || 0; break;
                  case 3: valA = a.d1_hl_perp; valB = b.d1_hl_perp; break;
                  case 4: valA = a.f1_peer_perp; valB = b.f1_peer_perp; break;
                  case 5: valA = a.spread; valB = b.spread; break;
                  case 6: valA = a.i1_annual_cross; valB = b.i1_annual_cross; break;
                  case 7: valA = a.vol_3d_avg; valB = b.vol_3d_avg; break;
                  case 8: valA = a.net7; valB = b.net7; break;
                  case 9: valA = a.net30; valB = b.net30; break;
                  case 10: valA = a.i1_annual_cross; valB = b.i1_annual_cross; break;
                  default: valA = 0; valB = 0;
                }
                if (typeof valA === 'string') {
                  return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
                } else {
                  return sortAscending ? valA - valB : valB - valA;
                }
              });
            }

            cachedDisplayList = unpinnedList;
            updatePaginationControls(unpinnedList.length);

            const startIdx = (currentPage - 1) * PAGE_SIZE;
            const pageRows = unpinnedList.slice(startIdx, startIdx + PAGE_SIZE);
            const renderRows = pinnedPool.concat(pageRows);

            tbody.innerHTML = '';
            const bestRow = pickRecommendedRow(displayList);

            if (renderRows.length === 0) {
              tbody.innerHTML = '<tr><td colspan="13" class="p-4 text-center text-amber-400 font-bold">⚠️ 目前篩選條件下無標的</td></tr>';
            }

            renderRows.forEach(row => {
              const isTradFiRow = row.isTradFiSynthetic === true;
              const isPositive7 = row.net7 > 0;
              const isPositive30 = row.net30 > 0;
              const styleObj = row.styleObj || getActionStyle(isTradFiRow ? 'HOLD' : 'HOLD');
              const maxLossText = row.maxLossLabel || '';
              const actionTagHtml =
                '<div class="inline-flex flex-col items-end gap-1">' +
                  '<span class="px-2 py-1 rounded text-xs font-black border ' + styleObj.bg + ' ' + styleObj.text + ' ' + styleObj.border + '">' + styleObj.label + '</span>' +
                  (maxLossText
                    ? '<span class="text-[10px] font-mono text-amber-300/90">' + maxLossText + '</span>'
                    : '') +
                '</div>';
              const cleanSymbolName = getSymbolEmoji(row.b1_symbol) + " " + row.b1_symbol;
              const volText = row.vol_3d_avg ? ("$" + (row.vol_3d_avg / 1000000).toFixed(1) + "M") : "N/A";
              
              const mixTrendCol = '<div>' + (row.stability * 1000).toFixed(2) + ' ‰ (平穩)</div><div class="text-[10px] text-gray-400 mt-0.5">3d Vol: ' + volText + '</div>';

              const symUpper = String(row.b1_symbol).toUpperCase();
              const pinned = isPinned(symUpper);
              const pinAtCap = !pinned && pinnedSymbols.length >= MAX_PINS;
              const pinClass = 'pin-btn' + (pinned ? ' pinned' : '') + (pinAtCap ? ' pin-locked' : '');
              const pinLabel = pinned ? '📌' : '📍';
              const pinTitle = pinAtCap
                ? '已達 Pin 上限 (Max 3)'
                : (pinned ? 'Unpin ' + symUpper : 'Pin ' + symUpper);

              // Soil Resistance — English grant-review UX
              const soilHtml = buildSoilResistanceHtml(row);

              const tr = document.createElement('tr');
              tr.className = 'hover:bg-white/5 border-b border-white/5 transition matrix-token-row' +
                (pinned ? ' row-pinned' : '') +
                (String(activeSelectedToken).toUpperCase() === symUpper || String(selectedConsoleKey).toUpperCase() === symUpper
                  ? ' token-row-selected' : '');
              tr.setAttribute('data-token-key', symUpper);
              tr.title = '點擊 Token 名稱注入風控主控制台；點擊價格 / 🔗 開啟交易所';
              tr.addEventListener('click', function(e) {
                if (e.target && e.target.closest && e.target.closest('a, button, .pin-btn, .token-price-link, .hl-trade-icon-link')) return;
                injectTokenToMasterConsole(symUpper, assetFromMatrixRow(row));
              });

              const displayHlSpot = "$" + row.c1_hl_spot.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4});
              const displayHlFunding = "8h FR: " + formatFunding8hLabel(formatFunding8hPctFromHourly(row.e1_hl_funding));
              
              const displayPeerPerp = "$" + row.f1_peer_perp.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4});
              const displayPeerFunding = "8h FR: " + formatFunding8hLabel(formatFunding8hPctFromHourly(row.g1_peer_funding));
              
              const displaySpread = (row.spread * 100).toFixed(5) + "%";
              const displayAnnualCross = row.i1_annual_cross.toFixed(2) + "%";
              
              const net7Class = isPositive7 ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/5';
              const displayNet7 = "$" + row.net7.toFixed(2);
              
              const net30Class = isPositive30 ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/5';
              const displayNet30 = "$" + row.net30.toFixed(2);
              const isOpenAction = row.pairStatusKey === 'OPEN';
              const tradeLinkGuard = isOpenAction ? ' onclick="return guardSettlementLockdownLink(event)"' : '';
              const actionCellClass = 'p-3 sticky-col-right text-right' + (isOpenAction ? ' cursor-pointer' : '');
              const actionCellClick = isOpenAction ? ' onclick="handleActionCellClick(\\\'OPEN\\\')"' : '';
              const hlUrl = isTradFiRow ? hlTradFiTradeUrl(row.b1_symbol) : hlTradeUrl(row.b1_symbol);
              const oiCell = formatOiPairCell(row.hl_oi_usd, row.peer_oi_usd);

              tr.innerHTML = 
                '<td class="p-3 sticky-col-left text-center">' +
                  '<button type="button" class="' + pinClass + '" title="' + pinTitle + '" onclick="togglePin(\\'' + symUpper + '\\')">' + pinLabel + '</button>' +
                '</td>' +
                '<td class="p-3 font-bold sticky-col-left text-white" style="left:48px">' +
                  '<button type="button" class="token-name-select bg-transparent border-0 p-0 cursor-pointer text-white font-bold text-left" onclick="injectTokenToMasterConsole(\\'' + symUpper + '\\')">' +
                    cleanSymbolName +
                  '</button>' +
                '</td>' +
                '<td class="p-3 font-mono text-emerald-300 text-sm font-bold">' + oiCell + '</td>' +
                '<td class="p-3 text-emerald-800/60 opacity-60">' +
                  '<div><a href="' + hlUrl + '" target="_blank" rel="noopener noreferrer" class="token-price-link text-emerald-800/70"' + tradeLinkGuard + '>' + displayHlSpot + '</a></div>' +
                  '<div class="text-[11px] font-mono mt-1">' +
                    '<a href="' + hlUrl + '" target="_blank" rel="noopener noreferrer" class="hl-trade-icon-link opacity-70"' + tradeLinkGuard + '>🔗 Hyperliquid</a>' +
                    ' <a href="' + hlUrl + '" target="_blank" class="funding-link text-yellow-400 font-bold"' + tradeLinkGuard + '>' + displayHlFunding + '</a>' +
                  '</div>' +
                '</td>' +
                '<td class="p-3 text-emerald-800/60 opacity-60">' +
                  (isTradFiRow
                    ? '<div class="text-gray-500 text-xs">—</div><div class="text-[10px] text-gray-600 mt-1">HL TradFi only</div>'
                    : '<div><a href="https://app.hyperliquid.xyz/trade/' + row.b1_symbol + '-USD" target="_blank" rel="noopener noreferrer" class="token-price-link text-emerald-800/70"' + tradeLinkGuard + '>' + displayPeerPerp + '</a></div>' +
                      '<div class="text-[11px] font-mono mt-1">' +
                        '<a href="https://app.hyperliquid.xyz/trade/' + row.b1_symbol + '-USD" target="_blank" class="funding-link text-yellow-400 font-bold"' + tradeLinkGuard + '>' + displayPeerFunding + '</a>' +
                      '</div>') +
                '</td>' +
                '<td class="p-3 font-mono font-bold text-circuit">' + displaySpread + '</td>' +
                '<td class="p-3 font-mono font-bold text-circuit">' + displayAnnualCross + '</td>' +
                '<td class="p-3 font-mono text-amber-400">' + mixTrendCol + '</td>' +
                '<td class="p-3 text-center font-mono font-bold ' + net7Class + '">' + displayNet7 + '</td>' +
                '<td class="p-3 text-center font-mono font-bold ' + net30Class + '">' + displayNet30 + '</td>' +
                '<td class="p-3 font-mono font-black text-circuit bg-emerald-950/20">' + displayAnnualCross + '</td>' +
                '<td class="p-3 text-center">' + soilHtml + '</td>' +
                '<td class="' + actionCellClass + '"' + actionCellClick + '>' + actionTagHtml + '</td>';
                
              tbody.appendChild(tr);
            });

            if (selectedConsoleKey) syncConsoleSelectionHighlights(selectedConsoleKey);
            applyDefaultConsoleToken();

            // Block 01 — highest APR Rule A row not slippage-locked (synced with table logic)
            const bestSymbolEl = document.getElementById('bestPairSymbol');
            const bestYieldEl = document.getElementById('bestPairYield');
            const bestActionEl = document.getElementById('bestPairAction');
            const bestProfitEl = document.getElementById('bestPairProfit');
            const bestProfit30El = document.getElementById('bestPairProfit30');

            if (bestRow) {
              cachedBestAprPct = bestRow.i1_annual_cross;
              if (bestSymbolEl) bestSymbolEl.innerText = bestRow.b1_symbol;
              if (bestYieldEl) bestYieldEl.innerText = bestRow.i1_annual_cross.toFixed(2) + "% APR";
              if (bestActionEl) {
                const bestStyle = bestRow.styleObj || getActionStyle(bestRow.actionStatus || 'HOLD', bestRow.risk_tripped, bestRow.passedRule);
                bestActionEl.innerHTML = '<span class="px-2 py-0.5 rounded text-xs font-black border ' + bestStyle.bg + ' ' + bestStyle.text + ' ' + bestStyle.border + '">' + bestStyle.label + '</span>';
              }
              if (bestProfitEl) bestProfitEl.innerText = "$" + bestRow.net7.toFixed(2) + " USD";
              if (bestProfit30El) bestProfit30El.innerText = "$" + bestRow.net30.toFixed(2) + " USD";
            } else {
              cachedBestAprPct = null;
              if (bestSymbolEl) bestSymbolEl.innerText = '---';
              if (bestYieldEl) bestYieldEl.innerText = '---% APR';
              if (bestActionEl) {
                const holdStyle = getActionStyle('HOLD', false);
                bestActionEl.innerHTML = '<span class="px-2 py-0.5 rounded text-xs font-black border ' + holdStyle.bg + ' ' + holdStyle.text + ' ' + holdStyle.border + '">無合適標的（全數滑價鎖死或無 Rule A 標的）</span>';
              }
              if (bestProfitEl) bestProfitEl.innerText = '$0.00 USD';
              if (bestProfit30El) bestProfit30El.innerText = '$0.00 USD';
            }

          } catch (err) {
            addLog("Recalculate Error: " + err.message, "error");
            console.error(err);
          }
        }

    function sortTable(colIndex) {
      if (currentSortCol === colIndex) {
        sortAscending = !sortAscending;
      } else {
        currentSortCol = colIndex;
        sortAscending = true;
      }
      
      const headers = document.querySelectorAll('#matrixTable th');
      headers.forEach((h, idx) => {
        h.classList.remove('sort-asc', 'sort-desc');
        if (idx === colIndex) {
          h.classList.add(sortAscending ? 'sort-asc' : 'sort-desc');
        }
      });

      recalculate();
    }

    let dragSrcEl = null;
    let tradfiDragSrcEl = null;
`;
