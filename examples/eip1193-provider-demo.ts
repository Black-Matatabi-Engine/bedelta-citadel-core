#!/usr/bin/env tsx
/** ExoMesh Agentic Guard Demo — Usage: pnpm demo:exomesh · JSON: pnpm demo:exomesh -- --json · Trip: --trip · Alias: pnpm demo:eip1193 */
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
} from "../src/sdk/eip1193-agentic-wallet-guard";
import { BOLD, GRAY, GREEN, R, RED, YELLOW } from "./adapters/citadel-ansi-hud";
import {
  awaitScenarioRecordingTransition,
  breakthroughMetric,
  buildPhishingTypedData,
  crossVenueSlippagePct,
  degradedDemoConfig,
  demoConfig,
  eipTag,
  EIP1193_DEMO,
  type Eip1193ScenarioJsonResult,
  formatIntentUsd,
  isDemoJsonArgv,
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
  printProductionPlainTextWarning,
  rejectCode,
  releaseDemoStdin,
  resolveDegradedSoftThresholdPct,
  resolveIntentPrincipalUsd,
  roundWasmUs,
  wrapGuarded,
} from "./lib/eip1193-breakthrough-helpers";
import { hrtimeElapsedUs, hrtimeStart } from "./lib/demo-timing";
import { isDemoTripArgv, wrapDemoExecution, type DemoEnvironment } from "./lib/demo-harness";

const RETAIL_GUARD_AGENT_ID = "retail-guard";
const SCENARIO_RULE = "═".repeat(88);

const SCENARIO_LABELS = {
  A: "🟢 ALLOW_PASSTHROUGH (Healthy Intent)",
  B: "🟡 DEGRADED_WARN (High-Slippage Warning)",
  C: "🛑 FAIL_CLOSED_INTERCEPT (Toxic Intent Interception)",
  D: "🔒 CHANNEL_SEVERED (Hot-Key Circuit Breaker)",
} as const;

type ScenarioOpts = { interactive: boolean };
type ScenarioCtxOpts = ScenarioOpts & { ctx: DemoEnvironment };

function printScenarioHeader(id: keyof typeof SCENARIO_LABELS, color: string): void {
  console.log(`\n${SCENARIO_RULE}`);
  console.log(`${color}${BOLD}Scenario ${id}: ${SCENARIO_LABELS[id]}${R}`);
  console.log(`${SCENARIO_RULE}\n`);
}

function buildGmxDepositTx() {
  return {
    from: EIP1193_DEMO.wallet,
    to: EIP1193_DEMO.gmxGmVault,
    data: SELECTOR_GMX_MULTICALL + "0".repeat(128),
  };
}

async function runScenarioA({ interactive }: ScenarioOpts): Promise<Eip1193ScenarioJsonResult> {
  if (interactive) printScenarioHeader("A", GREEN);
  __resetRetailGuardStateForTests();
  const cfg = demoConfig();
  if (interactive) {
    printMainnetAnchors();
    printEip6963Discovery();
    printEip1193Ingress("eth_sendTransaction");
    console.log(
      `${eipTag("INTENT PAYLOAD")} Deposit ${formatIntentUsd(resolveIntentPrincipalUsd())} into GMX ETH/USDC GM Vault (${EIP1193_DEMO.gmxGmVault})`,
    );
  }
  const tx = buildGmxDepositTx();
  const wasmUs = measureWasmSoilUs(cfg);
  const soilClean = evaluateRetailSoilGate(cfg.soilQuote!, false) === null;
  const guarded = wrapGuarded({ request: async () => "0xdeadbeef" }, cfg);
  if (interactive) {
    printPayloadBox(EIP1193_DEMO.arbChainId, wasmUs, soilClean);
    const t0 = hrtimeStart();
    await guarded.request({ method: "eth_sendTransaction", params: [tx] });
    printLatencyBreakdown(hrtimeElapsedUs(t0), wasmUs);
    printChannelOpen(soilClean ? 100 : 0);
    printForwardGate();
    console.log(`\n${GREEN}${BOLD}RESULT: 🟢 EIP-1193 PASSTHROUGH ALLOWED (Pre-Consensus Verified Clean)${R}`);
  } else {
    await guarded.request({ method: "eth_sendTransaction", params: [tx] });
  }
  return { scenario: "A", status: "ALLOW_PASSTHROUGH", wasmUs: roundWasmUs(wasmUs), code: null, plainTextWarning: null };
}

async function runScenarioB({ interactive }: ScenarioOpts): Promise<Eip1193ScenarioJsonResult> {
  if (interactive) printScenarioHeader("B", YELLOW);
  __resetRetailGuardStateForTests();
  const cfg = degradedDemoConfig();
  const softPct = resolveDegradedSoftThresholdPct();
  const slipPct = crossVenueSlippagePct(cfg);
  if (interactive) {
    printEip1193Ingress("eth_sendTransaction");
    console.log(
      `${YELLOW}${BOLD}[DEMO MONITOR PREVIEW] [DEGRADED WARN]${R} Slippage (${slipPct.toFixed(2)}%) exceeds soft threshold (${softPct.toFixed(2)}%) — Execution allowed with warning logged`,
    );
  }
  const tx = buildGmxDepositTx();
  const wasmUs = measureWasmSoilUs(cfg);
  const soilClean = evaluateRetailSoilGate(cfg.soilQuote!, false) === null;
  const guarded = wrapGuarded({ request: async () => "0xdegraded" }, cfg);
  if (interactive) {
    printPayloadBox(EIP1193_DEMO.arbChainId, wasmUs, soilClean);
    const t0 = hrtimeStart();
    await guarded.request({ method: "eth_sendTransaction", params: [tx] });
    printLatencyBreakdown(hrtimeElapsedUs(t0), wasmUs);
    printForwardGate();
    console.log(`\n${YELLOW}${BOLD}RESULT: 🟡 DEGRADED_WARN (High-Slippage Monitor · Passthrough Continues)${R}`);
  } else {
    await guarded.request({ method: "eth_sendTransaction", params: [tx] });
  }
  return { scenario: "B", status: "DEGRADED_WARN", wasmUs: roundWasmUs(wasmUs), code: null, plainTextWarning: null };
}

async function runScenarioC({ interactive, ctx }: ScenarioCtxOpts): Promise<Eip1193ScenarioJsonResult> {
  if (interactive) printScenarioHeader("C", RED);
  __resetRetailGuardStateForTests();
  const principalUsd = resolveIntentPrincipalUsd();
  const cfg = demoConfig();
  const typedData = buildPhishingTypedData();
  if (interactive) {
    printEip1193Ingress("eth_signTypedData_v4");
    console.log(
      `${eipTag("INTENT VALUATION")} Phishing Cross-Venue Route | Attempted Exposure: ${formatIntentUsd(principalUsd)}`,
    );
  }

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

  if (interactive) {
    printDefenseMatrixHeader();
    if (eip712) printDefenseMatrixLine("EIP-712 GUARD", "Phishing Attack: VerifyingContract Mismatch!", eip712.code, "├");
    if (permit2) printDefenseMatrixLine("PERMIT2 GUARD", "Infinite Approve Blocked for Untrusted Spender!", permit2.code, "├");
    if (!erc7683.passed) {
      console.log(
        `├── ${eipTag("ERC-7683 GATE")} Cross-Chain Solver MEV Bps (${breakthroughMetric(`${erc7683.solverMevBps.toFixed(0)}bps`)}) > Safety Limit! · ${rejectCode(erc7683.code ?? "FAIL")} ${GRAY}(diagnostic preview)${R}`,
      );
    }
    printDefenseMatrixLine("PRE-CONSENSUS", "0-Gas Wasm Intercept armed for toxic EIP-712 ingress", undefined, "└");
  }

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
  if (!thrown) throw new Error("SCENARIO_C_EXPECTED_FAIL_CLOSED");

  const wasmUs = roundWasmUs(Math.min(wasmReflexUs, hrtimeElapsedUs(t0)));
  if (interactive) {
    printProductionPlainTextWarning(thrown.plainTextWarning, thrown.code);
    printPreConsensusProofBox(wasmUs, principalUsd);
    console.log(
      `▸ Gas Spent: ${breakthroughMetric("0.000000 ETH")} | Capital Protected: ${formatIntentUsd(principalUsd)} (100% Principal Preserved)`,
    );
    printDuneTelemetry(RETAIL_GUARD_AGENT_ID, thrown.code, ctx.nowMs);
    console.log(
      `\n${RED}${BOLD}RESULT: 🛑 FAIL_CLOSED_INTERCEPT (${breakthroughMetric("0-Gas")} Intercepted BEFORE RPC Ingress)${R}`,
    );
  }
  return {
    scenario: "C",
    status: "FAIL_CLOSED",
    wasmUs,
    code: thrown.code,
    plainTextWarning: thrown.plainTextWarning,
  };
}

async function runScenarioD({ interactive }: ScenarioOpts): Promise<Eip1193ScenarioJsonResult> {
  if (interactive) printScenarioHeader("D", RED);
  __resetRetailGuardStateForTests();
  const cfg = demoConfig({ maxAttempts: INTENT_MAX_ATTEMPTS_DEFAULT });
  const wasmUs = roundWasmUs(measureWasmSoilUs(cfg));
  if (interactive) printEip1193Ingress("eth_sendTransaction");
  const guarded = withRetailGuardProvider({ request: async () => "0x1" }, cfg);
  const params = [{ from: EIP1193_DEMO.wallet, to: EIP1193_DEMO.gmxGmVault, value: "0x0" }];
  for (let i = 0; i < INTENT_MAX_ATTEMPTS_DEFAULT; i++) {
    await guarded.request({ method: "eth_sendTransaction", params });
  }
  let severErr: RetailGuardRejectedError | null = null;
  try {
    await guarded.request({ method: "eth_sendTransaction", params });
  } catch (err) {
    if (err instanceof RetailGuardRejectedError) severErr = err;
    else throw err;
  }
  if (!severErr) throw new Error("SCENARIO_D_EXPECTED_SEVER_REJECT");
  let channelErr: RetailGuardRejectedError | null = null;
  try {
    await guarded.request({ method: "eth_sendTransaction", params });
  } catch (err) {
    if (err instanceof RetailGuardRejectedError) channelErr = err;
    else throw err;
  }
  if (!channelErr) throw new Error("SCENARIO_D_EXPECTED_CHANNEL_REJECT");

  if (interactive) {
    printProductionPlainTextWarning(severErr.plainTextWarning, severErr.code);
    if (channelErr.plainTextWarning !== severErr.plainTextWarning) {
      printProductionPlainTextWarning(channelErr.plainTextWarning, channelErr.code);
    }
    const attemptN = INTENT_MAX_ATTEMPTS_DEFAULT + 1;
    console.log(
      `${RED}${BOLD}[CIRCUIT BREAKER]${R} R17 Hot Key Signature Channel SEVERED — All subsequent signing requests hard-blocked (${breakthroughMetric("0-Gas")})`,
    );
    console.log(
      `${eipTag("CHANNEL SEVER")} ${attemptN}th Rapid Attack Attempt -> EIP-712 Signature Channel ${RED}${BOLD}SEVERED${R} (${rejectCode(severErr.code)})`,
    );
    console.log(
      `  ${eipTag("CHANNEL STATE")} isRetailGuardChannelSevered=${isRetailGuardChannelSevered()} · follow-up=${rejectCode(channelErr.code)}`,
    );
    console.log(`\n${RED}${BOLD}RESULT: 🔒 CHANNEL_SEVERED (Signature Pipeline Permanently Closed · Gate ${EIP1193_DEMO.slivervineGate})${R}`);
  }
  return {
    scenario: "D",
    status: "CHANNEL_SEVERED",
    wasmUs,
    code: channelErr.code,
    plainTextWarning: channelErr.plainTextWarning,
  };
}

async function runScenarioMatrix(ctx: DemoEnvironment, interactive: boolean): Promise<Eip1193ScenarioJsonResult[]> {
  const results: Eip1193ScenarioJsonResult[] = [];
  const trip = isDemoTripArgv();

  if (!trip) {
    if (interactive) printBreakthroughBanner();
    results.push(await runScenarioA({ interactive }));
    if (interactive && process.stdin.isTTY) {
      await awaitScenarioRecordingTransition("B");
      printBreakthroughBanner();
    }
    results.push(await runScenarioB({ interactive }));
    if (interactive && process.stdin.isTTY) {
      await awaitScenarioRecordingTransition("C");
      printBreakthroughBanner();
    }
  } else if (interactive) {
    printBreakthroughBanner();
  }

  results.push(await runScenarioC({ interactive, ctx }));
  if (interactive && process.stdin.isTTY) {
    await awaitScenarioRecordingTransition("D");
    printBreakthroughBanner();
  }
  results.push(await runScenarioD({ interactive }));
  return results;
}

wrapDemoExecution(async (ctx) => {
  const jsonMode = isDemoJsonArgv();
  const results = await runScenarioMatrix(ctx, !jsonMode);

  if (jsonMode) {
    console.log(JSON.stringify(results));
    releaseDemoStdin();
    process.exit(0);
  }

  if (!isDemoTripArgv()) {
    console.log(
      `\n${GREEN}${BOLD}RESULT: ✅ EIP-1193 STATE MATRIX COMPLETE — 4 independent scripted scenarios (A·B·C·D) · Isolated replays${R}`,
    );
  }
  releaseDemoStdin();
  process.exit(0);
});
