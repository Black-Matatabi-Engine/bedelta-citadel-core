/** E2E Step 1 — injected soil circuit breaker for `--trip` fail-closed demo. */
import { ensureSoilWasm } from "../../src/sdk";
import { checkSoilResistance } from "../../src/services/risk-control";
import { DEMO_ETH_MID, DEMO_TOKEN, DEMO_VAULT_CAPITAL_USD } from "./e2e-demo-constants";
import { e2eLog, fmtE2eUsd, logE2eStep } from "./e2e-hud-renderer";
import { formatE2eSoilTripReasons } from "./e2e-hud-step-theme";

export function runE2eStep1TripIntercept(demoNowMs: number): void {
  logE2eStep(1, "Citadel Pre-Execution Gatehouse & Sub-ms Wasm Shield", [
    "[Pillar Set Y: Pre-Consensus Firewall] checkSoilResistance() — simulated tsunami / slippage anomaly injected",
    "[Pillar Set X: Account Ingress] ZeroDev Kernel v3 AA · ERC-7715 Session Mandates / EIP-7702 Code Auth",
  ]);
  e2eLog(`Vault Capital: ${fmtE2eUsd(DEMO_VAULT_CAPITAL_USD)} ${DEMO_TOKEN} | Asset Pair: ETH/USDC`);
  ensureSoilWasm();
  const tripSoil = checkSoilResistance({
    symbol: "ETH-PERP",
    hlSpot: DEMO_ETH_MID,
    hlPerp: DEMO_ETH_MID * 1.08,
    dydxPerp: DEMO_ETH_MID * 0.92,
    depthUsd: 80,
    isTestnet: false,
    at: new Date(demoNowMs),
  });
  e2eLog("[ ALERT ] Soil Resistance Circuit Breaker TRIPPED!");
  if (tripSoil.reasons.length) {
    e2eLog(`└─ ${formatE2eSoilTripReasons(tripSoil.reasons)}`);
  }
  e2eLog("INTERCEPT: 0-Gas Fail-Closed — pipeline halted before Robinhood ingress dispatch");
}
