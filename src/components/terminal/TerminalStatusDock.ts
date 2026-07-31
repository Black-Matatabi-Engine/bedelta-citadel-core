/**
 * Footer Dock — Global Terminal Status (sticky 48px bar).
 * HTML fragment for the Worker dashboard (no React runtime).
 */
import {
  computeEffectiveMaxSlUsd,
  DEFAULT_ACCOUNT_EQUITY_USD,
} from "../../services/effective-max-sl";

export function renderTerminalStatusDock(
  accountEquityUsd: number = DEFAULT_ACCOUNT_EQUITY_USD,
): string {
  const maxSlLabel = `$${computeEffectiveMaxSlUsd(accountEquityUsd).toFixed(0)}`;
  return `
<nav id="terminalStatusDock" class="terminal-status-dock" aria-label="Global terminal status">
  <div class="terminal-status-dock-inner font-mono">
    <span class="tsd-item">
      <span class="tsd-key">Max Loss Lock</span>
      <span class="tsd-val" id="tsdMaxLoss">${maxSlLabel}</span>
    </span>
    <span class="tsd-sep" aria-hidden="true">|</span>
    <span class="tsd-item">
      <span class="tsd-key">Circuit Breaker</span>
      <span class="tsd-val tsd-active" id="tsdCircuit">Active</span>
    </span>
    <span class="tsd-sep" aria-hidden="true">|</span>
    <span class="tsd-item">
      <span class="tsd-key">HL Worker Adapter</span>
      <span class="tsd-val tsd-connected" id="tsdHlAdapter">Connected</span>
    </span>
  </div>
</nav>`;
}
