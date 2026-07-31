/**
 * Client-side market sensors — HL funding extremes + Pyth confidence intervals.
 * Runs in the browser on slivervine.xyz to avoid Worker cron KV write loops.
 */

export const MARKET_SENSORS_POLL_MS = 30_000;
export const HL_INFO_URL = "https://api.hyperliquid.xyz/info";
export const PYTH_HERMES_URL = "https://hermes.pyth.network/v2/updates/price/latest";

/** Pyth price feed ids (hex) — BTC / ETH / SOL USD */
export const PYTH_FEED_IDS = {
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f27ac66b7dc3277896040",
  ETH: "0xff61491a931112ddf1bd81456cd3766f4515ea090f5f0e",
  SOL: "0xef8cb42769f9a25d2be10d2be546b3614b8cacc0d909711",
} as const;

export const MARKET_SENSORS_CLIENT_SCRIPT = `
    const HL_INFO_URL = '${HL_INFO_URL}';
    const PYTH_HERMES_URL = '${PYTH_HERMES_URL}';
    const PYTH_FEED_IDS = ${JSON.stringify(PYTH_FEED_IDS)};
    const MARKET_SENSORS_POLL_MS = ${MARKET_SENSORS_POLL_MS};
    let marketSensorsTimer = null;
    let marketSensorsInFlight = false;

    window.__SV_MARKET_SENSORS__ = window.__SV_MARKET_SENSORS__ || {
      fundingKings: null,
      pythConfidence: {},
      history: {
        pos: [],
        neg: [],
        spread: [],
      },
      lastOkAt: null,
      lastError: null,
    };

    function funding8hPctFromHourly(hourlyRate) {
      const h = Number(hourlyRate);
      if (!Number.isFinite(h)) return 0;
      return h * 8 * 100;
    }

    function computeFundingKingsFromHlMaps(hlFunding, hlPerp) {
      const entries = Object.keys(hlFunding || {}).filter(function(sym) {
        if (!sym || sym.indexOf(':') >= 0 || String(sym).toUpperCase().indexOf('XYZ:') === 0) return false;
        const rate = Number(hlFunding[sym]);
        const perp = Number(hlPerp && hlPerp[sym]);
        return Number.isFinite(rate) && perp > 0;
      }).map(function(sym) {
        return [sym, Number(hlFunding[sym])];
      });
      if (!entries.length) return null;

      var highest = entries[0];
      var lowest = entries[0];
      entries.forEach(function(entry) {
        if (entry[1] > highest[1]) highest = entry;
        if (entry[1] < lowest[1]) lowest = entry;
      });

      var positive = entries.filter(function(e) { return e[1] > 0; })
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 3)
        .map(function(e) { return { symbol: e[0], rate8h_pct: funding8hPctFromHourly(e[1]) }; });
      var negative = entries.filter(function(e) { return e[1] < 0; })
        .sort(function(a, b) { return a[1] - b[1]; })
        .slice(0, 3)
        .map(function(e) { return { symbol: e[0], rate8h_pct: funding8hPctFromHourly(e[1]) }; });

      return {
        highest: { symbol: highest[0], rate8h_pct: funding8hPctFromHourly(highest[1]) },
        lowest: { symbol: lowest[0], rate8h_pct: funding8hPctFromHourly(lowest[1]) },
        topPositive: positive.length ? positive : undefined,
        topNegative: negative.length ? negative : undefined,
      };
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function readSystemStateSnapshot() {
      return typeof systemState === 'object' && systemState ? systemState : null;
    }

    function readChartFrictionPct() {
      const frictionEl = document.getElementById('gkFrictionReadout');
      const raw = frictionEl && frictionEl.textContent ? parseFloat(frictionEl.textContent) : NaN;
      return Number.isFinite(raw) ? raw : 0.24;
    }

    function syncFrIoActionChrome(spread, frictionPct) {
      const profitable = Number(spread) > Number(frictionPct);
      const stateEl = document.getElementById('crossVenueFrIoState');
      if (stateEl) {
        stateEl.textContent = profitable ? 'GREEN / HEDGE' : 'RED / LOCKED';
        stateEl.style.color = profitable ? '#00FF9D' : '#FF3366';
        stateEl.style.textShadow = profitable ? '0 0 10px rgba(0, 255, 157, 0.6)' : '0 0 10px rgba(255, 51, 102, 0.45)';
        stateEl.style.display = 'inline-flex';
        stateEl.style.alignItems = 'center';
        stateEl.style.padding = '0.2rem 0.55rem';
        stateEl.style.borderRadius = '9999px';
        stateEl.style.border = profitable ? '1px solid rgba(0, 255, 157, 0.35)' : '1px solid rgba(255, 51, 102, 0.35)';
        stateEl.style.background = profitable ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 51, 102, 0.15)';
      }
      const button = document.getElementById('lockBestHedgeBtn');
      if (button) {
        if (profitable) {
          button.disabled = false;
          button.textContent = button.dataset.defaultText || '[ 🔒 LOCK BEST HEDGE TO STEP 3 ]';
          button.style.color = '#fef08a';
          button.style.opacity = '1';
          button.style.borderColor = '#f59e0b';
          button.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(245, 158, 11, 0.16))';
          button.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.35), 0 0 22px rgba(245, 158, 11, 0.18)';
        } else {
          button.disabled = true;
          button.textContent = '[ 🔒 LOCKED: NO ARBITRAGE EDGE ]';
          button.style.color = '#9ca3af';
          button.style.opacity = '0.5';
          button.style.borderColor = '#6b7280';
          button.style.background = 'rgba(75, 85, 99, 0.16)';
          button.style.boxShadow = 'none';
        }
      }
      return profitable;
    }

    function buildFallbackFundingKingsFromSystemState(state) {
      const defaults = { pos: 2.42, neg: -0.18, spread: 2.24 };
      if (!state) {
        return {
          highest: { symbol: 'SYSTEM', rate8h_pct: defaults.pos },
          lowest: { symbol: 'HEDGE', rate8h_pct: defaults.neg },
          topPositive: [{ symbol: 'SYSTEM', rate8h_pct: defaults.pos }],
          topNegative: [{ symbol: 'HEDGE', rate8h_pct: defaults.neg }],
        };
      }
      const cri = Number(state.currentCri);
      const balance = Number(state.accountBalanceUsd);
      const dynamicMaxSL = Number(state.dynamicMaxSL);
      const riskBias = Number.isFinite(cri) ? Math.max(0.12, (100 - cri) / 18) : defaults.pos;
      const balanceBias = Number.isFinite(balance) && balance > 0
        ? Math.min(2.2, balance / 20000)
        : 1;
      const slBias = Number.isFinite(dynamicMaxSL) && Number.isFinite(balance) && balance > 0
        ? Math.min(1.6, dynamicMaxSL / balance)
        : 1;
      const pos = Number((riskBias + balanceBias * 0.35 + slBias * 0.2).toFixed(2));
      const neg = Number((-Math.max(0.08, riskBias * 0.68 + balanceBias * 0.08)).toFixed(2));
      return {
        highest: {
          symbol: state.hudState || 'SYSTEM',
          rate8h_pct: Number.isFinite(pos) ? pos : defaults.pos,
        },
        lowest: {
          symbol: state.signingChannelOpen === false ? 'HARDLOCK' : 'HEDGE',
          rate8h_pct: Number.isFinite(neg) ? neg : defaults.neg,
        },
        topPositive: [{ symbol: state.hudState || 'SYSTEM', rate8h_pct: Number.isFinite(pos) ? pos : defaults.pos }],
        topNegative: [{ symbol: 'HEDGE', rate8h_pct: Number.isFinite(neg) ? neg : defaults.neg }],
      };
    }

    function pushSparklinePoint(history, key, value) {
      if (!history[key]) history[key] = [];
      history[key].push(value);
      while (history[key].length > 24) history[key].shift();
    }

    function toPolyline(values, width, height, pad, minValue, maxValue) {
      if (!values.length) return '';
      const innerWidth = width - pad * 2;
      const innerHeight = height - pad * 2;
      const range = Math.max(maxValue - minValue, 0.0001);
      return values.map(function(value, index) {
        const x = pad + (values.length === 1 ? innerWidth / 2 : (index / (values.length - 1)) * innerWidth);
        const normalized = (value - minValue) / range;
        const y = pad + innerHeight - (normalized * innerHeight);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
    }

    function renderCrossVenueFrIoChart(kings, pythConfidence) {
      const root = document.getElementById('crossVenueFrIoChart');
      if (!root) return;
      const systemStateSnapshot = readSystemStateSnapshot();
      const effectiveKings = kings && kings.highest && kings.lowest
        ? kings
        : buildFallbackFundingKingsFromSystemState(systemStateSnapshot);
      const stateEl = document.getElementById('crossVenueFrIoState');
      if (!effectiveKings || !effectiveKings.highest || !effectiveKings.lowest) {
        if (stateEl) stateEl.textContent = 'BOOTSTRAP';
        return;
      }
      if (!kings) {
        window.__SV_MARKET_SENSORS__.fundingKings = effectiveKings;
      }
      const pos = Number(effectiveKings.highest.rate8h_pct || 0);
      const neg = Number(effectiveKings.lowest.rate8h_pct || 0);
      const spread = pos - neg;
      const frictionPct = readChartFrictionPct();
      const netMargin = Number((Number(spread) - Number(frictionPct)).toFixed(2));
      const isArbitrageProfitable = netMargin > 0;
      const history = window.__SV_MARKET_SENSORS__.history || (window.__SV_MARKET_SENSORS__.history = { pos: [], neg: [], spread: [] });
      pushSparklinePoint(history, 'pos', pos);
      pushSparklinePoint(history, 'neg', neg);
      pushSparklinePoint(history, 'spread', spread);
      const allValues = history.pos.concat(history.neg, history.spread);
      const maxAbs = Math.max(allValues.reduce(function(max, value) {
        return Math.max(max, Math.abs(Number(value) || 0));
      }, 0), 0.01);
      const minValue = -maxAbs;
      const maxValue = maxAbs;
      const sparkWidth = 320;
      const sparkHeight = 108;
      const pad = 8;
      const posLine = toPolyline(history.pos, sparkWidth, sparkHeight, pad, minValue, maxValue);
      const negLine = toPolyline(history.neg, sparkWidth, sparkHeight, pad, minValue, maxValue);
      const spreadLine = toPolyline(history.spread, sparkWidth, sparkHeight, pad, minValue, maxValue);
      const avgConfidence = (() => {
        const values = Object.keys(pythConfidence || {}).map(function(key) {
          return Number(pythConfidence[key] && pythConfidence[key].confidenceBps);
        }).filter(function(value) { return Number.isFinite(value); });
        if (!values.length) return null;
        return values.reduce(function(sum, value) { return sum + value; }, 0) / values.length;
      })();
      const stateLabel = isArbitrageProfitable ? 'GREEN / HEDGE' : 'RED / LOCKED';
      const netMarginLabel = (netMargin > 0 ? '+' : '') + netMargin.toFixed(2) + '%';
      const netMarginColor = isArbitrageProfitable ? '#00FF9D' : '#FF3366';
      const frictionWidth = Math.min(100, Math.max(4, frictionPct * 20));
      root.innerHTML = [
        '<div class="flex items-center justify-between gap-2 mb-2">',
        '  <span class="typo-action text-[#50D2C1]">Cross-Venue FR &amp; IO Arbitrage Chart</span>',
        '  <span id="crossVenueFrIoState" class="typo-num inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-gray-400">' + stateLabel + '</span>',
        '</div>',
        '<div class="space-y-3 text-xs font-mono">',
        '  <svg viewBox="0 0 320 108" class="w-full h-28 rounded-lg border border-white/10 bg-black/25 overflow-hidden" role="img" aria-label="Cross-Venue FR and IO sparkline">',
        '    <defs>',
        '      <linearGradient id="frPosGlow" x1="0%" y1="0%" x2="100%" y2="0%">',
        '        <stop offset="0%" stop-color="#34d399" />',
        '        <stop offset="100%" stop-color="#10b981" />',
        '      </linearGradient>',
        '      <linearGradient id="frNegGlow" x1="0%" y1="0%" x2="100%" y2="0%">',
        '        <stop offset="0%" stop-color="#f87171" />',
        '        <stop offset="100%" stop-color="#ef4444" />',
        '      </linearGradient>',
        '      <linearGradient id="frSpreadGlow" x1="0%" y1="0%" x2="100%" y2="0%">',
        '        <stop offset="0%" stop-color="#fbbf24" />',
        '        <stop offset="100%" stop-color="#f59e0b" />',
        '      </linearGradient>',
        '      <filter id="frSparkGlow" x="-50%" y="-50%" width="200%" height="200%">',
        '        <feGaussianBlur stdDeviation="3.5" result="blur" />',
        '        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 0 1 0 0 0 0 1 0" />',
        '        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>',
        '      </filter>',
        '    </defs>',
        '    <g opacity="0.12" stroke="rgba(30,41,59,0.95)" stroke-width="1">',
        '      <line x1="12" y1="54" x2="308" y2="54" />',
        '      <line x1="12" y1="96" x2="308" y2="96" />',
        '    </g>',
        '    <line x1="12" y1="54" x2="308" y2="54" stroke="rgba(148,163,184,0.28)" stroke-dasharray="4 4" />',
        posLine ? '    <polyline points="' + posLine + '" fill="none" stroke="url(#frPosGlow)" stroke-width="2.5" filter="url(#frSparkGlow)" stroke-linecap="round" stroke-linejoin="round" />' : '',
        negLine ? '    <polyline points="' + negLine + '" fill="none" stroke="url(#frNegGlow)" stroke-width="2.5" filter="url(#frSparkGlow)" stroke-linecap="round" stroke-linejoin="round" />' : '',
        spreadLine ? '    <polyline points="' + spreadLine + '" fill="none" stroke="url(#frSpreadGlow)" stroke-width="2.5" filter="url(#frSparkGlow)" stroke-linecap="round" stroke-linejoin="round" />' : '',
        '  </svg>',
        '  <div class="flex items-center gap-2">',
        '    <span class="w-10 text-base font-mono font-bold text-emerald-300">+FR</span>',
        '    <span class="flex-1 h-px bg-emerald-400/40"></span>',
        '    <span class="w-16 text-right text-lg font-mono font-bold text-emerald-300">' + pos.toFixed(2) + '%</span>',
        '  </div>',
        '  <div class="flex items-center gap-2">',
        '    <span class="w-10 text-base font-mono font-bold text-rose-300">-FR</span>',
        '    <span class="flex-1 h-px bg-rose-400/40"></span>',
        '    <span class="w-16 text-right text-lg font-mono font-bold text-rose-300">' + neg.toFixed(2) + '%</span>',
        '  </div>',
        '  <div class="flex items-center gap-2">',
        '    <span class="w-10 text-base font-mono font-bold text-circuit">ΔIO</span>',
        '    <span class="flex-1 h-px bg-amber-400/40"></span>',
        '    <span class="w-16 text-right text-lg font-mono font-bold text-circuit">' + spread.toFixed(2) + '%</span>',
        '  </div>',
        '  <div class="flex items-center gap-2">',
        '    <span class="w-10 text-base font-mono font-bold text-[#CBD5E1]">FRICTION</span>',
        '    <span class="flex-1 h-px bg-slate-500/40"></span>',
        '    <span id="gkFrictionReadout" class="w-16 text-right text-lg font-mono font-bold text-[#CBD5E1]">' + frictionPct.toFixed(2) + '%</span>',
        '  </div>',
        '  <div class="border-t border-white/10 pt-2 flex items-center justify-between gap-2">',
        '    <span class="text-sm font-mono font-bold tracking-[0.18em] text-slate-200">NET MARGIN</span>',
        '    <span id="crossVenueFrIoNetMarginValue" class="text-lg font-mono font-bold" style="color:' + netMarginColor + ';text-shadow:' + (isArbitrageProfitable ? '0 0 10px rgba(0,255,157,0.5)' : 'none') + ';">' + netMarginLabel + '</span>',
        '  </div>',
        '  <div class="text-[11px] text-gray-400 flex items-center justify-between gap-2 pt-1">',
        '    <span>Avg Pyth confidence</span>',
        '    <span>' + (avgConfidence == null ? '--' : avgConfidence.toFixed(2) + ' bps') + '</span>',
        '  </div>',
        '</div>'
      ].join('');
      const frictionBar = document.getElementById('crossVenueFrIoFrictionBar');
      if (frictionBar) {
        frictionBar.style.width = frictionWidth.toFixed(1) + '%';
      }
      syncFrIoActionChrome(spread, frictionPct);
    }

    async function fetchHlFundingMapsClient() {
      const res = await fetch(HL_INFO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
      });
      if (!res.ok) throw new Error('HL metaAndAssetCtxs HTTP ' + res.status);
      const raw = await res.json();
      if (!Array.isArray(raw) || raw.length < 2) throw new Error('HL metaAndAssetCtxs invalid');
      const universe = (raw[0] && raw[0].universe) || [];
      const ctxs = raw[1] || [];
      const hlFunding = {};
      const hlPerp = {};
      for (var i = 0; i < universe.length; i++) {
        var asset = universe[i];
        if (!asset || !asset.name) continue;
        var sym = String(asset.name).toUpperCase();
        if (sym.indexOf(':') >= 0 || sym.indexOf('XYZ:') === 0) continue;
        var ctx = ctxs[i] || {};
        var isSpot = asset.type === 'spot' || (Array.isArray(asset.tokens) && asset.tokens.length > 0);
        if (isSpot) continue;
        var px = parseFloat(ctx.oraclePx || ctx.midPx || '0');
        var funding = parseFloat(ctx.funding || '0') || 0;
        if (px > 0) hlPerp[sym] = px;
        hlFunding[sym] = funding;
      }
      return { hlFunding: hlFunding, hlPerp: hlPerp };
    }

    function parsePythConfidenceBps(priceObj) {
      if (!priceObj || priceObj.price == null || priceObj.conf == null) return null;
      var price = Number(priceObj.price) * Math.pow(10, Number(priceObj.expo || 0));
      var conf = Number(priceObj.conf) * Math.pow(10, Number(priceObj.expo || 0));
      if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(conf)) return null;
      return (conf / price) * 10000;
    }

    async function fetchPythConfidenceClient() {
      var ids = [PYTH_FEED_IDS.BTC, PYTH_FEED_IDS.ETH, PYTH_FEED_IDS.SOL];
      var qs = ids.map(function(id) { return 'ids[]=' + encodeURIComponent(id); }).join('&');
      var res = await fetch(PYTH_HERMES_URL + '?' + qs);
      if (!res.ok) throw new Error('Pyth Hermes HTTP ' + res.status);
      var body = await res.json();
      var parsed = {};
      var feeds = (body && body.parsed) || [];
      feeds.forEach(function(item) {
        if (!item || !item.id) return;
        var label = null;
        Object.keys(PYTH_FEED_IDS).forEach(function(key) {
          if (PYTH_FEED_IDS[key].toLowerCase() === String(item.id).toLowerCase()) label = key;
        });
        if (!label) return;
        parsed[label] = {
          confidenceBps: parsePythConfidenceBps(item.price),
          publishTime: item.price && item.price.publish_time,
        };
      });
      return parsed;
    }

    async function refreshMarketSensorsClient() {
      if (marketSensorsInFlight) return;
      marketSensorsInFlight = true;
      try {
        var maps = await fetchHlFundingMapsClient();
        var kings = computeFundingKingsFromHlMaps(maps.hlFunding, maps.hlPerp);
        var pyth = await fetchPythConfidenceClient();
        window.__SV_MARKET_SENSORS__ = {
          fundingKings: kings,
          pythConfidence: pyth,
          lastOkAt: new Date().toISOString(),
          lastError: null,
        };
        if (kings && typeof renderFundingRateKings === 'function') {
          renderFundingRateKings(kings);
        }
      } catch (err) {
        window.__SV_MARKET_SENSORS__.lastError =
          err && err.message ? err.message : String(err);
      } finally {
        renderCrossVenueFrIoChart(
          window.__SV_MARKET_SENSORS__.fundingKings,
          window.__SV_MARKET_SENSORS__.pythConfidence,
        );
        marketSensorsInFlight = false;
      }
    }

    function startMarketSensorsPoll() {
      if (marketSensorsTimer) return;
      void refreshMarketSensorsClient();
      marketSensorsTimer = window.setInterval(function() {
        void refreshMarketSensorsClient();
      }, MARKET_SENSORS_POLL_MS);
    }

    function updateCrossVenueFrIoChartFromState(detail) {
      if (!window.__SV_MARKET_SENSORS__.fundingKings || !window.__SV_MARKET_SENSORS__.fundingKings.highest || !window.__SV_MARKET_SENSORS__.fundingKings.lowest) {
        window.__SV_MARKET_SENSORS__.fundingKings = buildFallbackFundingKingsFromSystemState(detail || readSystemStateSnapshot());
      }
      renderCrossVenueFrIoChart(
        window.__SV_MARKET_SENSORS__.fundingKings,
        window.__SV_MARKET_SENSORS__.pythConfidence,
      );
    }

    if (!window.__SV_MARKET_SENSORS_BOUND__) {
      window.__SV_MARKET_SENSORS_BOUND__ = true;
      window.addEventListener('system-state-update', function(event) {
        updateCrossVenueFrIoChartFromState(event && event.detail);
      });
    }

    updateCrossVenueFrIoChartFromState(readSystemStateSnapshot());
    startMarketSensorsPoll();
`;
