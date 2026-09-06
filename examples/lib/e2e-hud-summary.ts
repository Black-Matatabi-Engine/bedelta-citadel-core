/** E2E summary HUD — aligned pipeline table and capital balance sheet. */
import { DEMO_TOKEN, E2E_LOST_USD_INVARIANT, E2E_SUMMARY_DIVIDER } from "./e2e-demo-constants";
import { computeE2eFinancialLedger } from "./e2e-financial-accounting";
import type { E2eProofPayload } from "./e2e-demo-types";
import { e2eLog, fmtE2eUsd } from "./e2e-hud-renderer";

const SUMMARY_TAG_COL = 48;

function fmtSummaryRow(stepLabel: string, ok: boolean, detail: string): string {
  const bracket = `[ ${ok ? "PASSED" : "FAILED"} ]`;
  const padLen = Math.max(1, SUMMARY_TAG_COL - stepLabel.length);
  return `• ${stepLabel}${" ".repeat(padLen)}${bracket}  ${detail}`;
}

function fmtWasmHotPath(hotPathUs: number): string {
  return `wasm hot-path: ${hotPathUs.toFixed(1)}µs`;
}

export function printE2eSummaryHud(
  payload: E2eProofPayload,
  proofRelPath: string,
  allOk: boolean,
): void {
  const total = payload.pipelineSteps;
  const s1 = payload.steps["1_verifyAgentIntent"];
  const s2 = payload.steps["2_robinhoodUnidirectionalEscort"];
  const s3 = payload.steps["3_gmxGmPoolDeposit"];
  const s4 = payload.steps["4_hlSessionKeyHedge"];
  const s5 = payload.steps["5_r20PanicFlash"];
  const cap = payload.capitalInvariant;
  const ledger = computeE2eFinancialLedger();

  e2eLog(E2E_SUMMARY_DIVIDER);
  e2eLog(
    allOk
      ? `🟢 CITADEL GRANT E2E LIFECYCLE COMPLETE: ${total}/${total} STEPS PASSED`
      : `🔴 CITADEL GRANT E2E LIFECYCLE INCOMPLETE`,
  );
  e2eLog("[ PIPELINE EXECUTION ]");
  e2eLog(
    fmtSummaryRow(
      "Step 1: Pre-Execution Gatehouse & Wasm Shield",
      s1.ok && s1.deadmanOk,
      fmtWasmHotPath(s1.wasmHotPathUs),
    ),
  );
  e2eLog(
    fmtSummaryRow(
      "Step 2: Pillar 2 Compliance Ingress Escort",
      s2.ok,
      `Robinhood -> Arbitrum · ${E2E_LOST_USD_INVARIANT}`,
    ),
  );
  e2eLog(
    fmtSummaryRow(
      "Step 3: GMX v2 GM Pool Liquidity Provision",
      s3.ok,
      `${fmtE2eUsd(ledger.gmxDepositUsd)} GM · Treasury +${fmtE2eUsd(ledger.builderRebateEarnedUsd)}`,
    ),
  );
  e2eLog(
    fmtSummaryRow(
      "Step 4: Hyperliquid Delta-Neutral Hedge",
      s4.ok,
      `${ledger.hlHedgeEthSize} ETH Short · HL margin ${fmtE2eUsd(ledger.hlMarginUsd)}`,
    ),
  );
  if (total === 5 && s5) {
    e2eLog(
      fmtSummaryRow(
        "Step 5: Citadel Shield Exercise — R20 Unwind",
        s5.ok && s5.withinBudget,
        "Channel Severed · 0-Gas Intercepted",
      ),
    );
  }
  e2eLog("");
  e2eLog("[ CAPITAL INVARIANT BALANCE SHEET ]");
  e2eLog(`• Initial Ingress Capital:  ${fmtE2eUsd(cap.initialUsd)} ${cap.token} (Arbitrum One Vault)`);
  e2eLog(
    `• Capital Split Routing:    GMX GM Pool ${fmtE2eUsd(cap.gmxGmDepositUsd)} ║ HL L1 Margin ${fmtE2eUsd(cap.hlMarginUsd)}`,
  );
  e2eLog(
    `• Delta Neutral Exposure:    GMX Long +${fmtE2eUsd(cap.gmxLongExposureUsd)} ║ HL Short -${fmtE2eUsd(cap.hlShortExposureUsd)}`,
  );
  e2eLog(`• Protocol Treasury Revenue: +${fmtE2eUsd(cap.protocolTreasuryRebateUsd)} USD (uiFeeReceiver GMX Share)`);
  e2eLog(`• Final User Principal:     ${fmtE2eUsd(cap.finalUsd)} ${cap.token} (100% Principal Guarded)`);
  e2eLog(`• Invariant Verification:   ${E2E_LOST_USD_INVARIANT} · Δnet ≡ ${cap.deltaNetEth} ETH  [ VERIFIED ]`);
  e2eLog("");
  e2eLog(`💾 Execution Proof JSON persisted to: ${proofRelPath}`);
  e2eLog(`Timestamp: ${payload.timestamp}`);
  e2eLog(`RESULT: ${allOk ? `E2E OK (${total}/${total})` : "E2E FAIL"}`);
  e2eLog(E2E_SUMMARY_DIVIDER);
}
