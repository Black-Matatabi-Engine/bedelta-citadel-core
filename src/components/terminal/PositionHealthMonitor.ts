/**
 * Step 3 — SANTENBOKU Vault active-position strip.
 * Conditionally shown above Strategy Builder when ≥1 open position.
 * Hard-capped at MAX_ACTIVE_VAULT_POSITIONS (3).
 * HTML fragment for the Worker dashboard (no React runtime).
 */
import { MAX_ACTIVE_VAULT_POSITIONS } from "../../services/terminal-state";
import { BRAND_DELTA_SYMBOL } from "../../config/constants";

export { MAX_ACTIVE_VAULT_POSITIONS };

export function renderPositionHealthMonitor(): string {
  return `
<div id="positionHealthMonitor" class="santenboku-vault-panel hidden font-mono rounded-xl border border-[#52D0B6]/35 bg-black/40 overflow-hidden mb-3" data-max-vault="${MAX_ACTIVE_VAULT_POSITIONS}" aria-live="polite">
  <header class="brand-hero-header brand-hero-header--section">
    <div class="brand-hero-header-overlay" aria-hidden="true"></div>
    <div class="brand-hero-header-inner w-full">
      <div class="min-w-0">
        <h3 class="brand-hero-title brand-hero-title--section">🏛️ Active Vault</h3>
        <p class="brand-hero-subtitle">Live Net ${BRAND_DELTA_SYMBOL} · PnL · Liquidation Distance · max ${MAX_ACTIVE_VAULT_POSITIONS}</p>
      </div>
      <span id="vaultPositionCount" class="text-[10px] font-black text-[#52D0B6] border border-[#52D0B6]/40 px-2 py-1 rounded ml-auto">0/${MAX_ACTIVE_VAULT_POSITIONS}</span>
    </div>
  </header>

  <div id="vaultLimitBanner" class="vault-limit-banner hidden" role="alert">
    🚫 Active Vault Limit Reached (3/3): Close an existing position before opening new orders
  </div>

  <div id="activeVaultCards" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
    <!-- Cards rendered by renderActiveVaultUI() -->
  </div>
</div>`;
}
