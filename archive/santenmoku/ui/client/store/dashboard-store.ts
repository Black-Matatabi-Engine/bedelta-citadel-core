/**
 * Dashboard client store — single write path for systemState + __SV_DEMO__ pipeline.
 * Injected immediately after `let systemState = …` in the dashboard script shell.
 */

export const DASHBOARD_STORE_SCRIPT = `
    /** Demo override SSOT — all Demo Hub writes go through svDemoDispatch */
    window.__SV_DEMO__ = window.__SV_DEMO__ || {
      forceDefcon1: false,
      rootStatus: {},
      rootTripped: {},
      mockHlTxCount: 0,
    };

    function svDemoDispatch(action) {
      if (!action || !action.type) return window.__SV_DEMO__;
      var demo = window.__SV_DEMO__;
      switch (action.type) {
        case 'DEMO_INIT':
          window.__SV_DEMO__ = {
            forceDefcon1: false,
            rootStatus: {},
            rootTripped: {},
            mockHlTxCount: demo.mockHlTxCount || 0,
          };
          break;
        case 'DEMO_TOGGLE_FORCE_DEFCON1':
          demo.forceDefcon1 = !demo.forceDefcon1;
          break;
        case 'DEMO_SET_FORCE_DEFCON1':
          demo.forceDefcon1 = action.value === true;
          break;
        case 'DEMO_SET_ROOT_STATUS': {
          var rootNum = Math.trunc(Number(action.root));
          if (rootNum < 1 || rootNum > 20) break;
          var status = normalizeDevRootStatus(action.status);
          demo.rootStatus[rootNum] = status;
          demo.rootTripped[rootNum] = status === 'TRIPPED';
          break;
        }
        case 'DEMO_CYCLE_ROOT_STATUS': {
          var cycleRoot = Math.trunc(Number(action.root));
          if (cycleRoot < 1 || cycleRoot > 20) break;
          var nextStatus = normalizeDevRootStatus(action.next);
          demo.rootStatus[cycleRoot] = nextStatus;
          demo.rootTripped[cycleRoot] = nextStatus === 'TRIPPED';
          break;
        }
        case 'DEMO_SET_MOCK_HL_TX_COUNT': {
          var tx = Number(action.value);
          if (!Number.isFinite(tx)) break;
          demo.mockHlTxCount = Math.max(0, Math.floor(tx));
          break;
        }
        default:
          break;
      }
      return window.__SV_DEMO__;
    }

    svDemoDispatch({ type: 'DEMO_INIT' });

    var __svStoreListeners = [];
    function notifyStoreListeners(action) {
      var snapshot = systemState;
      for (var i = 0; i < __svStoreListeners.length; i++) {
        try {
          __svStoreListeners[i](snapshot, action);
        } catch (err) {
          console.error('[dashboard-store] subscriber failed', err);
        }
      }
    }

    /** Pure reducer — only the store may assign systemState */
    function reduceSystemStateClient(current, patch) {
      if (!patch || typeof patch !== 'object') return current;
      var balance = Number(patch.accountBalanceUsd);
      var cri = Number(patch.currentCri);
      var maxSl = Number(patch.dynamicMaxSL);
      var merged = {
        accountBalanceUsd: Number.isFinite(balance) ? balance : current.accountBalanceUsd,
        currentCri: Number.isFinite(cri) ? cri : current.currentCri,
        dynamicMaxSL: Number.isFinite(maxSl) ? maxSl : current.dynamicMaxSL,
        hudState: patch.hudState || current.hudState,
        hardlock: patch.hardlock === true || (Number.isFinite(cri) && cri === 0),
        signingChannelOpen: patch.signingChannelOpen !== false && patch.hardlock !== true && !(Number.isFinite(cri) && cri === 0),
        isSandboxMode: patch.isSandboxMode != null ? patch.isSandboxMode === true : current.isSandboxMode === true,
        isStale: patch.isStale != null ? patch.isStale === true : current.isStale === true,
        isHedgeActive: patch.isHedgeActive != null ? patch.isHedgeActive === true : current.isHedgeActive === true,
      };
      if (merged.hardlock || merged.currentCri === 0) {
        merged.signingChannelOpen = false;
      }
      return merged;
    }

    var __svDashboardStore = {
      subscribe: function(listener) {
        if (typeof listener !== 'function') return function() {};
        __svStoreListeners.push(listener);
        return function unsubscribe() {
          var idx = __svStoreListeners.indexOf(listener);
          if (idx >= 0) __svStoreListeners.splice(idx, 1);
        };
      },
      dispatch: function(action) {
        if (!action || !action.type) return;
        if (action.type === 'SYSTEM_STATE_APPLY') {
          systemState = reduceSystemStateClient(systemState, action.payload || {});
          if (typeof enrichSystemStateTaijiBagua === 'function') {
            var ctx = typeof resolveClientTaijiBaguaContext === 'function'
              ? resolveClientTaijiBaguaContext()
              : { isHedgeActive: systemState.isHedgeActive === true };
            var enriched = enrichSystemStateTaijiBagua(systemState, ctx);
            systemState.taijiMode = enriched.taijiMode;
            systemState.activeGate = enriched.activeGate;
          } else if (action.payload && action.payload.taijiMode) {
            systemState.taijiMode = action.payload.taijiMode;
            systemState.activeGate = action.payload.activeGate || systemState.activeGate;
          }
          if (typeof refreshTaijiBaguaHud === 'function') refreshTaijiBaguaHud();
          notifyStoreListeners(action);
          window.dispatchEvent(new CustomEvent('system-state-update', {
            detail: systemState,
          }));
          return;
        }
        if (String(action.type).indexOf('DEMO_') === 0) {
          svDemoDispatch(action);
          notifyStoreListeners(action);
        }
      },
      getState: function() { return systemState; },
    };

    function applySystemState(next) {
      __svDashboardStore.dispatch({ type: 'SYSTEM_STATE_APPLY', payload: next });
    }
`;
