/** DonDon IP + Taiji HUD core — composed with hmi-formatters in header-hud.ts */

export const HEADER_HUD_CORE_SCRIPT = `
    const DONDON_IP = {
      NORMAL: { asset: '/brand/dondon_normal.png', scale: 1.0, glow: '#00FFA3', badge: 'ちリブ', cssClass: 'dondon-state-normal' },
      LEVEL_UP: { asset: '/brand/dondon_levelup.png', scale: 1.2, glow: '#00F0FF', badge: 'ちリブ (+EXP)', cssClass: 'dondon-state-levelup' },
      WARNING: { asset: '/brand/dondon_warning.png', scale: 1.4, glow: '#FFD700', badge: '警 告', cssClass: 'dondon-state-warning' },
      SHIELD: { asset: '/brand/dondon_defense.png', scale: 1.6, glow: '#00E676', badge: '防 御', cssClass: 'dondon-state-shield' },
      HARD_LOCK: { asset: '/brand/dondon_deadlock.png', scale: 2.0, glow: '#FF0033', badge: '死 鎖', cssClass: 'dondon-state-hardlock' },
      GOD_MODE: { asset: '/brand/dondon_godmode.png', scale: 2.5, glow: '#FFD700', badge: '三天目', cssClass: 'dondon-state-godmode' },
      ORANGE_TARGET: { asset: '/brand/dondon_orangetarget.png', scale: 1.0, glow: '#FF8C00', badge: 'TARGET LOCK', cssClass: 'dondon-state-orangetarget' },
    };

    function recomputeRootDefenseMatrixState() {
      const statuses = collectRootStatusesForCri();
      const score = calculateRootDefenseMatrixFromStatuses(statuses);
      const hardlock = score <= 0;
      const equity = resolveAccountEquityUsd();
      const dynamicMaxSL = computeEffectiveMaxSlUsd(equity);
      if (typeof applySystemState === 'function') {
        applySystemState({
          accountBalanceUsd: equity,
          currentCri: score,
          dynamicMaxSL: dynamicMaxSL,
          hudState: typeof resolveHudStateClient === 'function'
            ? resolveHudStateClient(score, hardlock, true)
            : systemState.hudState,
          hardlock: hardlock,
          signingChannelOpen: !hardlock,
        });
      }
      return score;
    }

    function getRootDefenseMatrixScore() {
      const cri = Number(systemState.currentCri);
      return Math.max(0, Math.min(100, Number.isFinite(cri) ? Math.round(cri) : 0));
    }

    function getToxicityRiskScore() {
      return Math.max(0, Math.min(100, 100 - getRootDefenseMatrixScore()));
    }

    function resolveRootDefenseMatrixFillColor(score) {
      const s = Number.isFinite(score) ? score : 0;
      if (s >= 80) return '#34d399';
      if (s >= 50) return '#fbbf24';
      return '#f87171';
    }

    function applyRootDefenseMatrixBarFill(el, score) {
      if (!el) return;
      const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
      el.style.width = s + '%';
      el.style.background = resolveRootDefenseMatrixFillColor(s);
    }

    function getEffectiveRiskScore() {
      return getToxicityRiskScore();
    }

    function clearDonDonTransient() {
      dondonTransientKind = null;
      if (dondonTransientTimer) {
        clearTimeout(dondonTransientTimer);
        dondonTransientTimer = null;
      }
    }

    function resolveDonDonBaseState(riskScore) {
      if (window.__SV_DEMO__.forceDefcon1 === true) return 'GOD_MODE';
      if (isToxicModeTripped(riskScore)) return 'HARD_LOCK';
      if (shieldDemoRedAlertActive || tsunamiShieldActive) return 'SHIELD';
      if (riskScore >= TOXICITY_ELEVATED_THRESHOLD) return 'WARNING';
      return 'NORMAL';
    }

    function applyDonDonIpDisplay(forceState) {
      const avatar = document.getElementById('bestHedgeDonDonAvatar');
      const badge = document.getElementById('dondonIpBadge');
      const frame = document.getElementById('dondonIpFrame');
      if (!avatar) return;

      const riskScore = getEffectiveRiskScore();
      let stateKey = forceState || resolveDonDonBaseState(riskScore);

      if (isToxicModeTripped(riskScore) && window.__SV_DEMO__.forceDefcon1 !== true) {
        stateKey = 'HARD_LOCK';
        clearDonDonTransient();
      } else if (!forceState && dondonTransientKind) {
        stateKey = dondonTransientKind;
      }

      const cfg = DONDON_IP[stateKey] || DONDON_IP.NORMAL;
      avatar.src = cfg.asset;
      avatar.alt = 'DonDon IP — ' + String(stateKey).replace(/_/g, ' ');
      Object.keys(DONDON_IP).forEach(function(k) {
        avatar.classList.remove(DONDON_IP[k].cssClass);
      });
      avatar.classList.add(cfg.cssClass);
      var compactFrame = frame && (frame.classList.contains('dondon-ip-frame--compact') || frame.classList.contains('dondon-ip-frame--inline'));
      avatar.style.setProperty('--dondon-scale', compactFrame ? '1' : String(cfg.scale));
      avatar.style.setProperty('--dondon-glow', cfg.glow);
      avatar.classList.toggle('dondon-avatar-toxic', stateKey === 'HARD_LOCK');
      if (badge) badge.textContent = cfg.badge;
      if (frame) frame.dataset.dondonState = stateKey;
    }

    function triggerDonDonTransient(kind, durationMs) {
      if (isToxicModeTripped(getEffectiveRiskScore())) return;
      clearDonDonTransient();
      dondonTransientKind = kind;
      applyDonDonIpDisplay();
      dondonTransientTimer = setTimeout(function() {
        dondonTransientKind = null;
        dondonTransientTimer = null;
        applyDonDonIpDisplay();
      }, durationMs || 1750);
    }

    function triggerDonDonOrangeTarget() {
      triggerDonDonTransient('ORANGE_TARGET', 1750);
    }

    function triggerDonDonLevelUp() {
      triggerDonDonTransient('LEVEL_UP', 1750);
    }

    function applyDonDonAvatarForRisk(riskScore) {
      applyDonDonIpDisplay();
    }

    function resolveClientTaijiBaguaContext() {
      var soilTripped = false;
      if (typeof resolveRoot8SlippageLock === 'function' && typeof selectedConsoleAsset !== 'undefined' && selectedConsoleAsset) {
        var slip = typeof slipForNotionalDynamic === 'function'
          ? slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd || 10000)
          : 0;
        var soilLock = resolveRoot8SlippageLock({
          slipRatio: slip,
          symbol: selectedConsoleAsset.symbol || selectedConsoleAsset.key,
          hlSpot: selectedConsoleAsset.hlSpot,
          hlPerp: selectedConsoleAsset.hlPerp,
          dydxPerp: selectedConsoleAsset.dydxPerp,
        });
        soilTripped = !!soilLock;
      }
      return {
        soilTripped: soilTripped,
        isHedgeActive: systemState.isHedgeActive === true,
      };
    }

    function syncTaijiBaguaOnSystemState() {
      if (typeof enrichSystemStateTaijiBagua !== 'function') return systemState;
      var ctx = resolveClientTaijiBaguaContext();
      var enriched = enrichSystemStateTaijiBagua(systemState, ctx);
      systemState.taijiMode = enriched.taijiMode;
      systemState.activeGate = enriched.activeGate;
      return enriched;
    }

    function refreshTaijiBaguaHud() {
      var enriched = syncTaijiBaguaOnSystemState();
      var taijiNodes = document.querySelectorAll('#taijiModeBadge, #headerTaijiModeBadge');
      var gateEl = document.getElementById('baguaGateBadge');
      if ((!taijiNodes || !taijiNodes.length) && !gateEl) return;
      if (typeof TAIJI_MODE_UI === 'undefined' || typeof BAGUA_GATE_UI === 'undefined') return;
      var taijiMode = enriched.taijiMode || 'YIN_YIELD';
      var activeGate = enriched.activeGate || 'LI_BRIGHT';
      var taijiCfg = TAIJI_MODE_UI[taijiMode] || TAIJI_MODE_UI.YIN_YIELD;
      var gateCfg = BAGUA_GATE_UI[activeGate] || BAGUA_GATE_UI.LI_BRIGHT;
      taijiNodes.forEach(function(taijiEl) {
        taijiEl.textContent = taijiCfg.label;
        taijiEl.className = 'taiji-mode-badge sv-tip ' + taijiCfg.cssClass;
        taijiEl.setAttribute('data-sv-tip', taijiCfg.tooltip);
        taijiEl.setAttribute('data-sv-label', 'Taiji Stance · ' + taijiMode.replace('_', ' '));
      });
      if (gateEl) {
        gateEl.textContent = gateCfg.label;
        gateEl.className = 'bagua-gate-badge sv-tip ' + gateCfg.cssClass;
        gateEl.setAttribute('data-sv-tip', gateCfg.tooltip);
        gateEl.setAttribute('data-sv-label', 'Bagua Gate · ' + gateCfg.shortLabel);
      }
    }

    function applyHmiMetric(el, text, scoreClass) {
      if (!el) return;
      el.textContent = text;
      el.className = 'hmi-metric sv-tip ' + scoreClass;
    }

    function refreshCriAndStatusHud(opts) {
      if (criHudRefreshing) {
        const cached = getRootDefenseMatrixScore();
        return {
          criScore: cached,
          riskScore: Math.max(0, 100 - cached),
          band: resolveRootDefenseMatrixBand(cached),
          statuses: collectRootStatusesForCri(),
        };
      }
      criHudRefreshing = true;
      try {
      opts = opts || {};
      const statuses = collectRootStatusesForCri();
      const defenseScore = recomputeRootDefenseMatrixState();
      const band = resolveRootDefenseMatrixBand(defenseScore);
      const hudCfg = ROOT_DEFENSE_MATRIX_HUD_CONFIG[band] || ROOT_DEFENSE_MATRIX_HUD_CONFIG.OPTIMAL;

      const bar = document.getElementById('statusHudBar');
      const headerStrip = document.getElementById('hmiStatusStrip');
      const barClass = 'risk-index-hud defense-hud-panel step1-cri-block ' + hudCfg.cssClass;
      if (bar) bar.className = barClass;
      if (headerStrip) headerStrip.className = 'hmi-status-strip ' + hudCfg.cssClass;

      const tensileLabel = formatTensileLabel(defenseScore);
      const pgateLabel = formatPgateStatusLabel(statuses);

      var slipRatio = null;
      if (typeof selectedConsoleAsset !== 'undefined' && selectedConsoleAsset && typeof slipForNotionalDynamic === 'function') {
        slipRatio = slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd || 10000);
      }
      var frictionRatio = resolveLiveFrictionRatio(
        typeof getStep3FrictionRate === 'function' ? getStep3FrictionRate() : null,
        slipRatio
      );
      var frictionLabel = formatFrictionLabel(frictionRatio);
      var gatewayLabel = formatGatewayLabel({
        signingChannelOpen: systemState.signingChannelOpen !== false,
        hardlock: systemState.hardlock === true || defenseScore <= 0,
      });

      applyHmiMetric(document.getElementById('statusHudCri'), tensileLabel, hudCfg.scoreClass);
      applyHmiMetric(document.getElementById('statusHudBadge'), pgateLabel, hudCfg.scoreClass);
      applyHmiMetric(document.getElementById('statusHudFriction'), frictionLabel, hudCfg.scoreClass);
      applyHmiMetric(document.getElementById('statusHudGateway'), gatewayLabel, hudCfg.scoreClass);
      applyHmiMetric(document.getElementById('headerHudTensile'), tensileLabel, hudCfg.scoreClass);
      applyHmiMetric(document.getElementById('headerHudPgate'), pgateLabel, hudCfg.scoreClass);
      applyHmiMetric(document.getElementById('headerHudFriction'), frictionLabel, hudCfg.scoreClass);
      applyHmiMetric(document.getElementById('headerHudGateway'), gatewayLabel, hudCfg.scoreClass);

      applyRootDefenseMatrixBarFill(document.getElementById('statusHudFill'), defenseScore);

      const hubReadout = document.getElementById('demoHubCriReadout');
      const hubFill = document.getElementById('demoHubCriFill');
      if (hubReadout) {
        hubReadout.textContent = tensileLabel;
        hubReadout.className = 'typo-num ' + hudCfg.scoreClass;
      }
      applyRootDefenseMatrixBarFill(hubFill, defenseScore);

      var gkFriction = document.getElementById('gkFrictionReadout');
      if (gkFriction) gkFriction.textContent = (frictionRatio * 100).toFixed(2) + '%';

      applyDonDonAvatarForRisk(getToxicityRiskScore());
      triggerToxicModeCircuitBreaker(getToxicityRiskScore());
      refreshTaijiBaguaHud();

      if (typeof renderRootTelemetry === 'function') renderRootTelemetry();
      if (typeof updateMasterConsoleSlippage === 'function') updateMasterConsoleSlippage();
      return {
        criScore: defenseScore,
        riskScore: getToxicityRiskScore(),
        band: band,
        statuses: statuses,
      };
      } finally {
        criHudRefreshing = false;
      }
    }

    function triggerGrowthHudBurst() {
      triggerDonDonLevelUp();
      refreshCriAndStatusHud({ forceGrowth: true });
      if (growthHudTimer) clearTimeout(growthHudTimer);
      growthHudTimer = setTimeout(function() {
        growthHudTimer = null;
        refreshCriAndStatusHud();
      }, 3000);
    }
`.trim();
