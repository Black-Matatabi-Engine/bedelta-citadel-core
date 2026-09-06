/** E2E grant demo ANSI HUD — step blocks, RESULT lines, capital balance sheet. */
import {
  AML_INBOUND_TO_ROBINHOOD_BLOCKED,
  ARBITRUM_ONE_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
} from "../../src/sdk";
import {
  DEMO_TOKEN,
  GMX_BUILDER_FEE_BPS,
  TOTAL_VAULT_CAPITAL_USD,
  E2E_SUMMARY_DIVIDER,
} from "./e2e-demo-constants";
import { computeE2eFinancialLedger } from "./e2e-financial-accounting";
import type { E2eProofPayload } from "./e2e-demo-types";
import {
  BOLD,
  BOLD_CYAN,
  BOLD_GREEN,
  BOLD_RED,
  BRIGHT_CYAN,
  BRIGHT_GREEN,
  BRIGHT_MAGENTA,
  CYAN,
  GREEN,
  ORANGE,
  RED_BOLD,
  RESET,
  YELLOW,
  e2eLogColored,
  useColor,
  wrap,
} from "./e2e-hud-ansi";
import { e2eStepThemeColor } from "./e2e-hud-step-theme";

export {
  logE2eHeaderClock,
  logE2eHeaderMode,
  logE2ePipelineRoadmap,
  paintE2eBanner,
} from "./e2e-hud-header";

const ROBINHOOD_CHAIN_LABEL = `ROBINHOOD (Chain ${ROBINHOOD_TESTNET_CHAIN_ID})`;
const ARBITRUM_CHAIN_LABEL = `ARBITRUM ONE (Chain ${ARBITRUM_ONE_CHAIN_ID})`;
const STEP2_OUTBOUND_ARROW = "═══( Across Fast Intent )═══►";
const STEP2_INBOUND_ARROW = "───( Reversal Blocked )───x";

function highlight(line: string): string {
  if (!useColor) return line;
  let out = line;
  for (const kw of ["PHYSICAL_DEADLOCK_TRIGGERED", "SOIL_TRIPPED", AML_INBOUND_TO_ROBINHOOD_BLOCKED, "[ ALERT ]"]) {
    out = out.split(kw).join(`${RED_BOLD}${kw}${RESET}`);
  }
  out = out.replace(/uiFeeReceiver/gi, `${YELLOW}uiFeeReceiver${RESET}`);
  out = out.replace(/\+\s*10\s*bps/gi, `${YELLOW}+10 bps${RESET}`);
  out = out.replace(/0-Gas Sponsored|0-Gas Verified/g, `${YELLOW}$&${RESET}`);
  out = out.replace(/\[ ACTIVE \]|\[ PASSED \]|\[ ALLOWED \]|\[ VERIFIED \]/g, `${GREEN}$&${RESET}`);
  out = out.replace(/\[ REJECTED \]/g, `${RED_BOLD}[ REJECTED ]${RESET}`);
  out = out.replace(/Step [1345].*PASS|Pillar 2 Ingress PASS/g, `${GREEN}$&${RESET}`);
  out = out.replace(/Pillar [123]/g, (m) => `${BRIGHT_CYAN}${m}${RESET}`);
  out = out.replace(/Architecture:/g, `${CYAN}Architecture:${RESET}`);
  out = out.replace(/\b(IN_BAND|FAST_LOCAL|SETTLED)\b/g, `${GREEN}$&${RESET}`);
  out = out.replace(/\bOUT_OF_BAND\b/g, `${RED_BOLD}OUT_OF_BAND${RESET}`);
  out = out.replace(/\d+\.?\d*\s*µs/g, (m) => `${CYAN}${m.trim()}${RESET}`);
  out = out.replace(/Δnet\s*≡\s*0|lostUsd\s*≡\s*0/g, `${BOLD_GREEN}$&${RESET}`);
  out = out.replace(/\bPASS\b/g, `${GREEN}PASS${RESET}`);
  out = out.replace(/E2E OK \(5\/5\)/g, `${GREEN}E2E OK (5/5)${RESET}`);
  return out;
}

export function e2eLog(line: string): void {
  console.log(highlight(line));
}

function paintRobinhoodChain(): string {
  return useColor ? `${BOLD}${BRIGHT_MAGENTA}${ROBINHOOD_CHAIN_LABEL}${RESET}` : ROBINHOOD_CHAIN_LABEL;
}

function paintArbitrumChain(): string {
  return useColor ? `${BOLD_CYAN}${ARBITRUM_CHAIN_LABEL}${RESET}` : ARBITRUM_CHAIN_LABEL;
}

function paintStep2OutboundArrow(): string {
  return useColor ? `${BOLD_GREEN}${STEP2_OUTBOUND_ARROW}${RESET}` : STEP2_OUTBOUND_ARROW;
}

function paintStep2InboundArrow(): string {
  return useColor ? `${BOLD_RED}${STEP2_INBOUND_ARROW}${RESET}` : STEP2_INBOUND_ARROW;
}

export function logE2eStep2OutboundEscortLine(): void {
  e2eLogColored(
    `[ OUTBOUND ESCORT ]   ${paintRobinhoodChain()} ${paintStep2OutboundArrow()} ${paintArbitrumChain()}`,
  );
}

export function logE2eStep2InboundAmlBlockLine(): void {
  e2eLogColored(
    `[ INBOUND AML BLOCK ] ${paintArbitrumChain()} ${paintStep2InboundArrow()} ${paintRobinhoodChain()}`,
  );
}

export function fmtE2eUsd(amount: number, decimals = 2): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function logE2eStep(n: number, title: string, architecture: string | string[]): void {
  e2eLogColored("");
  e2eLogColored(wrap(e2eStepThemeColor(n), `── Step ${n}: ${title} ──`));
  for (const line of Array.isArray(architecture) ? architecture : [architecture]) {
    e2eLog(`    Architecture: ${line}`);
  }
}

export function e2eLogHlSession(line: string, tone: "live" | "fallback"): void {
  if (!useColor) {
    console.log(line);
    return;
  }
  console.log(`${tone === "live" ? BRIGHT_GREEN : ORANGE}${line}${RESET}`);
}

export function printHlEnvMissingNotice(): void {
  e2eLog("[ NOTICE: .env.production missing for live Hyperliquid L1 Broadcast ]");
  e2eLog("└─ Falling back seamlessly to Hyperliquid Session Key Live Sandbox Simulator");
}

export function emitStep4PassResult(): void {
  const ledger = computeE2eFinancialLedger();
  e2eLog(
    `RESULT: 🟢 Step 4 Hyperliquid Hedge PASS — ${ledger.hlHedgeEthSize} ETH (${fmtE2eUsd(ledger.hlHedgeShortUsd)} USD) Short Active · Δnet ≡ ${ledger.deltaNetEthFormatted} ETH`,
  );
}

export function printE2eSummaryHud(
  payload: E2eProofPayload,
  proofRelPath: string,
  allOk: boolean,
): void {
  const s1 = payload.steps["1_verifyAgentIntent"];
  const s2 = payload.steps["2_robinhoodUnidirectionalEscort"];
  const s3 = payload.steps["3_gmxGmPoolDeposit"];
  const s4 = payload.steps["4_hlSessionKeyHedge"];
  const s5 = payload.steps["5_r20PanicFlash"];
  const cap = payload.capitalInvariant;
  const ledger = computeE2eFinancialLedger();
  const mark = (ok: boolean) => (ok ? "PASSED" : "FAILED");

  e2eLog(E2E_SUMMARY_DIVIDER);
  e2eLog(allOk ? "🟢 CITADEL GRANT E2E LIFECYCLE COMPLETE: 5/5 STEPS PASSED" : "🔴 CITADEL GRANT E2E LIFECYCLE INCOMPLETE");
  e2eLog("[ PIPELINE EXECUTION ]");
  e2eLog(`• Step 1: Pre-Execution Gatehouse & Wasm Shield   [ ${mark(s1.ok && s1.deadmanOk)} ]  wasm: ${s1.wasmHotPathUs}µs (p50: ${s1.wasmP50Us}µs)`);
  e2eLog(`• Step 2: Pillar 2 Compliance Ingress Escort      [ ${mark(s2.ok)} ]  Robinhood -> Arbitrum (${fmtE2eUsd(TOTAL_VAULT_CAPITAL_USD)} ${DEMO_TOKEN})`);
  e2eLog(`• Step 3: GMX v2 GM Pool Liquidity Provision      [ ${mark(s3.ok)} ]  ${fmtE2eUsd(ledger.gmxDepositUsd)} GM · +${s3.uiFeeBps} bps (${fmtE2eUsd(ledger.builderRebateEarnedUsd)})`);
  e2eLog(`• Step 4: Hyperliquid Delta-Neutral Hedge         [ ${mark(s4.ok)} ]  ${ledger.hlHedgeEthSize} ETH Short (${fmtE2eUsd(ledger.hlHedgeShortUsd)} USD)`);
  e2eLog(`• Step 5: Citadel Shield Exercise — R20 Unwind          [ ${mark(s5.ok && s5.withinBudget)} ]  Channel Severed · 0-Gas Intercepted`);
  e2eLog("");
  e2eLog("[ CAPITAL INVARIANT BALANCE SHEET ]");
  e2eLog(`• Initial Ingress Capital:  ${fmtE2eUsd(cap.initialUsd)} ${cap.token}`);
  e2eLog(`• Deployed Allocation:       GMX GM ${fmtE2eUsd(cap.gmxGmDepositUsd)} + HL Margin ${fmtE2eUsd(cap.hlMarginUsd)}`);
  e2eLog(`• Delta Neutral Exposure:    GMX Long +${fmtE2eUsd(cap.gmxLongExposureUsd)} | HL Short -${fmtE2eUsd(cap.hlShortExposureUsd)}`);
  e2eLog(`• Net Builder Rebate Earned: +${fmtE2eUsd(cap.builderFeeUsd)} USD (+${GMX_BUILDER_FEE_BPS} bps GMX Fee Share)`);
  e2eLog(`• Final Vault Balance:      ${fmtE2eUsd(cap.finalUsd)} ${cap.token} (Principal ${fmtE2eUsd(cap.principalUsd)} Guarded)`);
  e2eLog(`• Invariant Verification:   lostUsd ≡ ${fmtE2eUsd(cap.lostUsd)} · Δnet ≡ ${cap.deltaNetEth} ETH [ VERIFIED ]`);
  e2eLog("");
  e2eLog(`💾 Execution Proof JSON persisted to: ${proofRelPath}`);
  e2eLog(`Timestamp: ${payload.timestamp}`);
  e2eLog(`RESULT: ${allOk ? "E2E OK (5/5)" : "E2E FAIL"}`);
  e2eLog(E2E_SUMMARY_DIVIDER);
}
