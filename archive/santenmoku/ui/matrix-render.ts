/**
 * Dashboard matrix render — re-exports core + store subscription script.
 */
export { MATRIX_RENDER_SCRIPT } from "./matrix-render-core";
export const MATRIX_VIEW_SUBSCRIPTION_SCRIPT = `
    function initMatrixViewStoreSubscription() {
      if (typeof __svDashboardStore === 'undefined' || typeof __svDashboardStore.subscribe !== 'function') return;
      __svDashboardStore.subscribe(function(state, action) {
        if (!action || action.type !== 'SYSTEM_STATE_APPLY') return;
        if (typeof recalculate === 'function') recalculate();
      });
    }
    initMatrixViewStoreSubscription();
`;
