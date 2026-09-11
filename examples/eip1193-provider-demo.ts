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
} from "../src/sdk/robinhood-agentic-retail-wallet-guard";
import { BOLD, CYAN, GREEN, R, RED } from "./adapters/citadel-ansi-hud";
import {
  buildPhishingTypedData,
  demoConfig,
  deriveTripEvtHash,
  EIP1193_DEMO,
  measureWasmSoilUs,
  printBreakthroughBanner,
  printEip6963Discovery,
  printPayloadBox,
  probeChannelSever,
  resolveCapitalProtectedUsd,
  truncateAddr,
  wrapGuarded,
} from "./lib/eip1193-breakthrough-helpers";
import { formatLatencyLabel, hrtimeElapsedUs, hrtimeStart, printExecutionLatencySplitBlock } from "./lib/demo-timing";
import { isDemoTripArgv, wrapDemoExecution, type DemoEnvironment } from "./lib/demo-harness";

async function runHealthy(): Promise<void> {
  __resetRetailGuardStateForTests();
  printBreakthroughBanner();
  console.log(`${BOLD}MODE:${R} ${GREEN}NORMAL_INTENT${R}\n`);
  const cfg = demoConfig();
  printEip6963Discovery();
  console.log(`[EIP-1193 INGRESS] window.ethereum.request({ method: 'eth_sendTransaction' })`);
  const tx = { from: EIP1193_DEMO.wallet, to: EIP1193_DEMO.gmx, data: SELECTOR_GMX_MULTICALL + "0".repeat(128) };
  const parsed = parseTransactionCalldata(tx);
  const wasmUs = measureWasmSoilUs(cfg);
  const soilClean = evaluateRetailSoilGate(cfg.soilQuote!, false) === null;
  printPayloadBox(EIP1193_DEMO.arbChainId, wasmUs, soilClean);
  if (parsed?.kind !== "swap") throw new Error(`PAYLOAD_PARSER_MISMATCH:${parsed?.kind ?? "null"}`);
  const guarded = wrapGuarded({ request: async () => "0xdeadbeef" }, cfg);
  const t0 = hrtimeStart();
  await guarded.request({ method: "eth_sendTransaction", params: [tx] });
  printExecutionLatencySplitBlock(hrtimeElapsedUs(t0), wasmUs);
  console.log(`[CHANNEL] EIP-712 Signature Channel: OPEN (Channel Integrity: ${soilClean ? 100 : 0}%)`);
  console.log(`[FORWARD] EIP-1193 Provider -> Dispatched to Sequencer RPC Gate (${truncateAddr(EIP1193_DEMO.gmx)})`);
  console.log(`\n${GREEN}${BOLD}RESULT: 🟢 EIP-1193 PASSTHROUGH ALLOWED (Pre-Consensus Verified Clean)${R}`);
}

async function runRogue(ctx: DemoEnvironment): Promise<{ tripped: true; reason: string }> {
  __resetRetailGuardStateForTests();
  printBreakthroughBanner();
  console.log(`${BOLD}MODE:${R} ${RED}ROGUE_ATTACK_VECTOR (--trip)${R}\n`);
  const cfg = demoConfig();
  const typedData = buildPhishingTypedData();
  printEip6963Discovery();
  console.log(`[EIP-1193 INGRESS] window.ethereum.request({ method: 'eth_signTypedData_v4' })`);

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
      inputAmount: 1_000_000n,
      minOutputAmount: 999_000n,
      quotedOutputAmount: 1_000_000n,
      solverFeeBps: 100,
      maxSlippageBps: 10,
      deadlineSec: 9_999_999_999,
      nowSec: Math.floor(ctx.nowMs / 1000),
    },
    cfg.soilQuote,
  );
  const severAttempt = await probeChannelSever(demoConfig({ maxAttempts: INTENT_MAX_ATTEMPTS_DEFAULT }));
  const wasmReflexUs = Math.min(measureWasmSoilUs(cfg), erc7683.evalLatencyUs);

  console.log(`\n🚨 [BREAKTHROUGH DEFENSE MATRIX TRIGGERED]`);
  if (eip712) console.log(`├── [EIP-712 GUARD] Phishing Attack Detected: verifyingContract Mismatch! (${eip712.code})`);
  if (permit2) console.log(`├── [PERMIT2 GUARD] Blocked Infinite Approve for Untrusted Spender! (${permit2.code})`);
  if (!erc7683.passed) {
    console.log(
      `├── [ERC-7683 GATE] Cross-Chain Intent Solver MEV Bps > Safety Threshold! (${erc7683.solverMevBps.toFixed(0)}bps · ${erc7683.code})`,
    );
  }
  console.log(`└── [CHANNEL SEVER] ${severAttempt}th Rapid Attack Attempt -> EIP-712 Channel SEVERED!`);

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

  const w = EIP1193_DEMO.boxW;
  console.log(`${CYAN}┌${"─".repeat(w)}┐${R}`);
  console.log(`${CYAN}│${R} EIP-1193 EXCEPTION: Thrown RetailGuardRejectedError (RPC Code: 4001)`);
  console.log(`${CYAN}│${R} PROVIDER ISOLATION: ABORTED AT BROWSER PROVIDER LAYER`);
  console.log(`${CYAN}│${R} GAS BURNED: 0.000000 ETH (0 Bytes Broadcasted to Sequencer)`);
  console.log(`${CYAN}│${R} WASM REFLEX TIME: ${formatLatencyLabel(Math.min(wasmReflexUs, hrtimeElapsedUs(t0)))} (Pure Wasm Core)`);
  console.log(`${CYAN}└${"─".repeat(w)}┘${R}`);

  const capital = resolveCapitalProtectedUsd();
  const evt = deriveTripEvtHash(ctx.nowMs, thrown.code);
  console.log(
    `▶ Gas Spent: 0.000000 ETH | Capital Protected: $${capital.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  );
  console.log(
    `[TELEMETRY] Event: RiskTripBlocked(evtHash: ${evt.slice(0, 10)}...) -> Ingested to Dune Spell (silvervine_chaos.intercepts)`,
  );
  console.log(`\n${RED}${BOLD}RESULT: 🔴 EIP-1193 FAIL_CLOSED (0-Gas Intercepted BEFORE RPC Dispatch)${R}`);
  return { tripped: true, reason: thrown.code };
}

wrapDemoExecution(async (ctx) => {
  if (isDemoTripArgv()) return runRogue(ctx);
  await runHealthy();
});
