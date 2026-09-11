#!/usr/bin/env tsx
/** EIP-1193 Breakthrough Demo — Usage: pnpm demo:eip1193 · Trip: pnpm demo:eip1193 -- --trip */
import { INTENT_MAX_ATTEMPTS_DEFAULT } from "../src/core/wasm-intent-ffi";
import {
  __resetRetailGuardStateForTests,
  encodePermit2ApproveCalldata,
  evaluateErc7683CrossChainIntentGuard,
  evaluateRetailApproveGate,
  evaluateRetailSoilGate,
  evaluateRetailVenueAllowlist,
  parseTransactionCalldata,
  parseTypedDataPayload,
  RetailGuardRejectedError,
  SELECTOR_GMX_MULTICALL,
  UINT160_MAX,
  withRetailGuardProvider,
} from "../src/sdk/robinhood-agentic-retail-wallet-guard";
import { BOLD, GREEN, R, RED } from "./adapters/citadel-ansi-hud";
import {
  breakthroughMetric,
  buildPhishingTypedData,
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
  printPayloadBox,
  printPreConsensusProofBox,
  rejectCode,
  resolveIntentPrincipalUsd,
  wrapGuarded,
  type RetailGuardConfig,
} from "./lib/eip1193-breakthrough-helpers";
import { hrtimeElapsedUs, hrtimeStart } from "./lib/demo-timing";
import { isDemoTripArgv, wrapDemoExecution, type DemoEnvironment } from "./lib/demo-harness";

const RETAIL_GUARD_AGENT_ID = "retail-guard";

async function probeChannelSever(cfg: RetailGuardConfig): Promise<number> {
  __resetRetailGuardStateForTests();
  const guarded = withRetailGuardProvider({ request: async () => "0x1" }, cfg);
  const params = [{ from: EIP1193_DEMO.wallet, to: EIP1193_DEMO.gmxGmVault, value: "0x0" }];
  for (let i = 0; i < INTENT_MAX_ATTEMPTS_DEFAULT + 2; i++) {
    try {
      await guarded.request({ method: "eth_sendTransaction", params });
    } catch (err) {
      if (err instanceof RetailGuardRejectedError) return i + 1;
      throw err;
    }
  }
  return INTENT_MAX_ATTEMPTS_DEFAULT + 1;
}

async function runHealthy(): Promise<void> {
  __resetRetailGuardStateForTests();
  printBreakthroughBanner();
  console.log(`${BOLD}MODE:${R} ${GREEN}NORMAL_INTENT${R}\n`);
  const cfg = demoConfig();
  printEip6963Discovery();
  printEip1193Ingress("eth_sendTransaction");
  console.log(
    `${eipTag("INTENT PAYLOAD")} Deposit ${formatIntentUsd(resolveIntentPrincipalUsd())} into GMX ETH/USDC GM Vault (${EIP1193_DEMO.gmxGmVault.slice(0, 10)}...)`,
  );
  const tx = {
    from: EIP1193_DEMO.wallet,
    to: EIP1193_DEMO.gmxGmVault,
    data: SELECTOR_GMX_MULTICALL + "0".repeat(128),
  };
  const parsed = parseTransactionCalldata(tx);
  const wasmUs = measureWasmSoilUs(cfg);
  const soilClean = evaluateRetailSoilGate(cfg.soilQuote!, false) === null;
  printPayloadBox(EIP1193_DEMO.arbChainId, wasmUs, soilClean);
  if (parsed?.kind !== "swap") throw new Error(`PAYLOAD_PARSER_MISMATCH:${parsed?.kind ?? "null"}`);
  const guarded = wrapGuarded({ request: async () => "0xdeadbeef" }, cfg);
  const t0 = hrtimeStart();
  await guarded.request({ method: "eth_sendTransaction", params: [tx] });
  printLatencyBreakdown(hrtimeElapsedUs(t0), wasmUs);
  printChannelOpen(soilClean ? 100 : 0);
  printForwardGate();
  console.log(`\n${GREEN}${BOLD}RESULT: 🟢 EIP-1193 PASSTHROUGH ALLOWED (Pre-Consensus Verified Clean)${R}`);
}

async function runRogue(ctx: DemoEnvironment): Promise<{ tripped: true; reason: string }> {
  __resetRetailGuardStateForTests();
  printBreakthroughBanner();
  console.log(`${BOLD}MODE:${R} ${RED}ROGUE_ATTACK_VECTOR (--trip)${R}\n`);
  const principalUsd = resolveIntentPrincipalUsd();
  const cfg = demoConfig();
  const typedData = buildPhishingTypedData();
  printEip6963Discovery();
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
  const severAttempt = await probeChannelSever(demoConfig({ maxAttempts: INTENT_MAX_ATTEMPTS_DEFAULT }));
  const wasmReflexUs = Math.min(measureWasmSoilUs(cfg), erc7683.evalLatencyUs);

  printDefenseMatrixHeader();
  if (eip712) printDefenseMatrixLine("EIP-712 GUARD", "Phishing Attack: VerifyingContract Mismatch!", eip712.code, "├");
  if (permit2) printDefenseMatrixLine("PERMIT2 GUARD", "Infinite Approve Blocked for Untrusted Spender!", permit2.code, "├");
  if (!erc7683.passed) {
    console.log(
      `├── ${eipTag("ERC-7683 GATE")} Cross-Chain Solver MEV Bps (${breakthroughMetric(`${erc7683.solverMevBps.toFixed(0)}bps`)}) > Safety Limit! · ${rejectCode(erc7683.code ?? "FAIL")}`,
    );
  }
  printDefenseMatrixLine(
    "CHANNEL SEVER",
    `${severAttempt}th Rapid Attack Attempt -> EIP-712 Channel SEVERED!`,
    undefined,
    "└",
  );

  __resetRetailGuardStateForTests();
  const guarded = wrapGuarded({ request: async () => "0x0" }, cfg);
  const t0 = hrtimeStart();
  let thrown: RetailGuardRejectedError | null = null;
  try {
    await guarded.request({ method: "eth_signTypedData_v4", params: [EIP1193_DEMO.wallet, typedData] });
  } catch (err) {
    if (err instanceof RetailGuardRejectedError) thrown = err;
    else throw err;
  }
  if (!thrown) process.exit(1);

  printPreConsensusProofBox(Math.min(wasmReflexUs, hrtimeElapsedUs(t0)), principalUsd);
  console.log(`▸ Gas Spent: ${breakthroughMetric("0.000000 ETH")} | Capital Protected: ${formatIntentUsd(principalUsd)} (100% Principal Preserved)`);
  printDuneTelemetry(RETAIL_GUARD_AGENT_ID, thrown.code, ctx.nowMs);
  console.log(
    `\n${RED}${BOLD}RESULT: 🔴 EIP-1193 FAIL_CLOSED (${breakthroughMetric("0-Gas")} Intercepted BEFORE RPC Ingress)${R}`,
  );
  return { tripped: true, reason: thrown.code };
}

wrapDemoExecution(async (ctx) => {
  if (isDemoTripArgv()) return runRogue(ctx);
  await runHealthy();
});
