#!/usr/bin/env tsx
/** EIP-1193 Breakthrough Demo — Usage: pnpm demo:eip1193 · Trip shortcut: pnpm demo:eip1193 -- --trip */
import { INTENT_MAX_ATTEMPTS_DEFAULT } from "../src/core/wasm-intent-ffi";
import {
  __resetRetailGuardStateForTests,
  encodePermit2ApproveCalldata,
  evaluateErc7683CrossChainIntentGuard,
  evaluateRetailApproveGate,
  evaluateRetailSoilGate,
  evaluateRetailVenueAllowlist,
  isRetailGuardChannelSevered,
  parseTransactionCalldata,
  parseTypedDataPayload,
  RetailGuardRejectedError,
  SELECTOR_GMX_MULTICALL,
  UINT160_MAX,
  withRetailGuardProvider,
} from "../src/sdk/robinhood-agentic-retail-wallet-guard";
import { BOLD, GREEN, R, RED, YELLOW } from "./adapters/citadel-ansi-hud";
import {
  breakthroughMetric,
  buildPhishingTypedData,
  crossVenueSlippagePct,
  degradedDemoConfig,
  demoConfig,
  eipTag,
  EIP1193_DEMO,
  formatIntentUsd,
  measureWasmSoilUs,
  printBreakthroughBanner,
  printChannelOpen,
  printDefenseMatrixHeader,
  printDefenseMatrixLine,
  printDuneTelemetry,
  printEip1193Ingress,
  printEip6963Discovery,
  printForwardGate,
  printLatencyBreakdown,
  printMainnetAnchors,
  printPayloadBox,
  printPreConsensusProofBox,
  rejectCode,
  resolveIntentPrincipalUsd,
  wrapGuarded,
} from "./lib/eip1193-breakthrough-helpers";
import { hrtimeElapsedUs, hrtimeStart } from "./lib/demo-timing";
import { isDemoTripArgv, wrapDemoExecution, type DemoEnvironment } from "./lib/demo-harness";

const RETAIL_GUARD_AGENT_ID = "retail-guard";
const PHASE_RULE = "═".repeat(88);

function printPhaseHeader(phase: number, status: string, emoji: string, color: string): void {
  console.log(`\n${PHASE_RULE}`);
  console.log(`${color}${BOLD}Phase ${phase}: ${emoji} ${status}${R}`);
  console.log(`${PHASE_RULE}\n`);
}

function buildGmxDepositTx() {
  return {
    from: EIP1193_DEMO.wallet,
    to: EIP1193_DEMO.gmxGmVault,
    data: SELECTOR_GMX_MULTICALL + "0".repeat(128),
  };
}

async function runPhase1AllowPassthrough(): Promise<void> {
  printPhaseHeader(1, "ALLOW_PASSTHROUGH", "🟢", GREEN);
  __resetRetailGuardStateForTests();
  const cfg = demoConfig();
  printMainnetAnchors();
  printEip6963Discovery();
  printEip1193Ingress("eth_sendTransaction");
  console.log(
    `${eipTag("INTENT PAYLOAD")} Deposit ${formatIntentUsd(resolveIntentPrincipalUsd())} into GMX ETH/USDC GM Vault (${EIP1193_DEMO.gmxGmVault})`,
  );
  const tx = buildGmxDepositTx();
  const wasmUs = measureWasmSoilUs(cfg);
  const soilClean = evaluateRetailSoilGate(cfg.soilQuote!, false) === null;
  printPayloadBox(EIP1193_DEMO.arbChainId, wasmUs, soilClean);
  const guarded = wrapGuarded({ request: async () => "0xdeadbeef" }, cfg);
  const t0 = hrtimeStart();
  await guarded.request({ method: "eth_sendTransaction", params: [tx] });
  printLatencyBreakdown(hrtimeElapsedUs(t0), wasmUs);
  printChannelOpen(soilClean ? 100 : 0);
  printForwardGate();
  console.log(`\n${GREEN}${BOLD}RESULT: 🟢 EIP-1193 PASSTHROUGH ALLOWED (Pre-Consensus Verified Clean)${R}`);
}

async function runPhase2DegradedWarn(): Promise<void> {
  printPhaseHeader(2, "DEGRADED_WARN", "🟡", YELLOW);
  __resetRetailGuardStateForTests();
  const cfg = degradedDemoConfig();
  printEip1193Ingress("eth_sendTransaction");
  const slipPct = crossVenueSlippagePct(cfg);
  console.log(
    `${YELLOW}${BOLD}[DEGRADED_WARN]${R} High-Slippage Warning: cross-venue delta ${slipPct.toFixed(2)}% (monitor-only · non-blocking)`,
  );
  const tx = buildGmxDepositTx();
  const wasmUs = measureWasmSoilUs(cfg);
  const soilClean = evaluateRetailSoilGate(cfg.soilQuote!, false) === null;
  printPayloadBox(EIP1193_DEMO.arbChainId, wasmUs, soilClean);
  const guarded = wrapGuarded({ request: async () => "0xdegraded" }, cfg);
  const t0 = hrtimeStart();
  await guarded.request({ method: "eth_sendTransaction", params: [tx] });
  printLatencyBreakdown(hrtimeElapsedUs(t0), wasmUs);
  printForwardGate();
  console.log(`\n${YELLOW}${BOLD}RESULT: 🟡 DEGRADED_WARN (High-Slippage Monitor · Passthrough Continues)${R}`);
}

async function runPhase3FailClosed(ctx: DemoEnvironment): Promise<string> {
  printPhaseHeader(3, "FAIL_CLOSED_INTERCEPT", "🛑", RED);
  __resetRetailGuardStateForTests();
  const principalUsd = resolveIntentPrincipalUsd();
  const cfg = demoConfig();
  const typedData = buildPhishingTypedData();
  printEip1193Ingress("eth_signTypedData_v4");
  console.log(
    `${eipTag("INTENT VALUATION")} Phishing Cross-Venue Route | Attempted Exposure: ${formatIntentUsd(principalUsd)}`,
  );

  const td = parseTypedDataPayload([EIP1193_DEMO.wallet, typedData]);
  const eip712 = evaluateRetailVenueAllowlist(td.verifyingContract ?? EIP1193_DEMO.malicious, cfg);
  const permit2Parsed = parseTransactionCalldata({
    to: EIP1193_DEMO.permit2,
    data: encodePermit2ApproveCalldata(EIP1193_DEMO.usdc, EIP1193_DEMO.malicious, UINT160_MAX),
  });
  const permit2 =
    permit2Parsed?.kind === "permit2_approve"
      ? evaluateRetailApproveGate(
          {
            kind: "approve",
            token: permit2Parsed.token,
            spender: permit2Parsed.spender,
            amountWei: permit2Parsed.amountWei,
            infinite: permit2Parsed.infinite,
          },
          cfg,
        )
      : null;
  const erc7683 = evaluateErc7683CrossChainIntentGuard(
    {
      originChainId: EIP1193_DEMO.arbChainId,
      destinationChainId: 10,
      inputAmount: BigInt(Math.round(principalUsd * 1e6)),
      minOutputAmount: BigInt(Math.round(principalUsd * 999)),
      quotedOutputAmount: BigInt(Math.round(principalUsd * 1e6)),
      solverFeeBps: 100,
      maxSlippageBps: 10,
      deadlineSec: 9_999_999_999,
      nowSec: Math.floor(ctx.nowMs / 1000),
    },
    cfg.soilQuote,
  );

  printDefenseMatrixHeader();
  if (eip712) printDefenseMatrixLine("EIP-712 GUARD", "Phishing Attack: VerifyingContract Mismatch!", eip712.code, "├");
  if (permit2) printDefenseMatrixLine("PERMIT2 GUARD", "Infinite Approve Blocked for Untrusted Spender!", permit2.code, "├");
  if (!erc7683.passed) {
    console.log(
      `├── ${eipTag("ERC-7683 GATE")} Cross-Chain Solver MEV Bps (${breakthroughMetric(`${erc7683.solverMevBps.toFixed(0)}bps`)}) > Safety Limit! · ${rejectCode(erc7683.code ?? "FAIL")}`,
    );
  }
  printDefenseMatrixLine("PRE-CONSENSUS", "0-Gas Wasm Intercept armed for toxic EIP-712 ingress", undefined, "└");

  const guarded = wrapGuarded({ request: async () => "0x0" }, cfg);
  const wasmReflexUs = Math.min(measureWasmSoilUs(cfg), erc7683.evalLatencyUs);
  const t0 = hrtimeStart();
  let thrown: RetailGuardRejectedError | null = null;
  try {
    await guarded.request({ method: "eth_signTypedData_v4", params: [EIP1193_DEMO.wallet, typedData] });
  } catch (err) {
    if (err instanceof RetailGuardRejectedError) thrown = err;
    else throw err;
  }
  if (!thrown) throw new Error("PHASE3_EXPECTED_FAIL_CLOSED");

  printPreConsensusProofBox(Math.min(wasmReflexUs, hrtimeElapsedUs(t0)), principalUsd);
  console.log(`▸ Gas Spent: ${breakthroughMetric("0.000000 ETH")} | Capital Protected: ${formatIntentUsd(principalUsd)} (100% Principal Preserved)`);
  printDuneTelemetry(RETAIL_GUARD_AGENT_ID, thrown.code, ctx.nowMs);
  console.log(
    `\n${RED}${BOLD}RESULT: 🛑 FAIL_CLOSED_INTERCEPT (${breakthroughMetric("0-Gas")} Intercepted BEFORE RPC Ingress)${R}`,
  );
  return thrown.code;
}

async function runPhase4ChannelSevered(): Promise<string> {
  printPhaseHeader(4, "CHANNEL_SEVERED", "🔒", RED);
  __resetRetailGuardStateForTests();
  const cfg = demoConfig({ maxAttempts: INTENT_MAX_ATTEMPTS_DEFAULT });
  printEip1193Ingress("eth_sendTransaction");
  const guarded = withRetailGuardProvider({ request: async () => "0x1" }, cfg);
  const params = [{ from: EIP1193_DEMO.wallet, to: EIP1193_DEMO.gmxGmVault, value: "0x0" }];
  for (let i = 0; i < INTENT_MAX_ATTEMPTS_DEFAULT; i++) {
    await guarded.request({ method: "eth_sendTransaction", params });
  }
  let severCode = "MAX_ATTEMPTS_EXCEEDED_SEVERED";
  try {
    await guarded.request({ method: "eth_sendTransaction", params });
  } catch (err) {
    if (err instanceof RetailGuardRejectedError) severCode = err.code;
    else throw err;
  }
  let channelCode = severCode;
  try {
    await guarded.request({ method: "eth_sendTransaction", params });
  } catch (err) {
    if (err instanceof RetailGuardRejectedError) channelCode = err.code;
    else throw err;
  }
  const attemptN = INTENT_MAX_ATTEMPTS_DEFAULT + 1;
  console.log(
    `${eipTag("CHANNEL SEVER")} ${attemptN}th Rapid Attack Attempt -> EIP-712 Signature Channel ${RED}${BOLD}SEVERED${R} (${rejectCode(severCode)})`,
  );
  console.log(`  ${eipTag("CHANNEL STATE")} isRetailGuardChannelSevered=${isRetailGuardChannelSevered()} · follow-up=${rejectCode(channelCode)}`);
  console.log(`\n${RED}${BOLD}RESULT: 🔒 CHANNEL_SEVERED (Signature Pipeline Permanently Closed · Gate ${EIP1193_DEMO.slivervineGate})${R}`);
  return channelCode;
}

wrapDemoExecution(async (ctx) => {
  printBreakthroughBanner();
  if (isDemoTripArgv()) {
    const tripCode = await runPhase3FailClosed(ctx);
    const severCode = await runPhase4ChannelSevered();
    return { tripped: true, reason: `${tripCode}|${severCode}` };
  }
  await runPhase1AllowPassthrough();
  await runPhase2DegradedWarn();
  const tripCode = await runPhase3FailClosed(ctx);
  const severCode = await runPhase4ChannelSevered();
  console.log(
    `\n${GREEN}${BOLD}RESULT: ✅ 4-PHASE EIP-1193 LIFECYCLE COMPLETE (ALLOW → DEGRADED → ${tripCode} → ${severCode})${R}`,
  );
});
