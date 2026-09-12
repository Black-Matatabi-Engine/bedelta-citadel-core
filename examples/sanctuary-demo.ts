#!/usr/bin/env tsx
/** Sanctuary Async Escort (ERC-7540+) — Usage: pnpm demo:sanctuary · Alias: pnpm demo:escort */
import {
  ERC7540_CODES,
  computeErc7540SlippageDriftBps,
  encodeErc7540RequestDepositCalldata,
  encodeErc7540SetOperatorCalldata,
  evaluateErc7540AsyncEscortGuard,
  parseTransactionCalldata,
  type ParsedErc7540,
  type RetailGuardConfig,
} from "../src/sdk/eip1193-agentic-wallet-guard";
import { BOLD, CYAN, GREEN, GRAY, RED, R } from "./adapters/citadel-ansi-hud";
import { ensureDemoWasmSoft, wrapDemoExecution } from "./lib/demo-harness";
import { printModuleBBanner, printOpSecFootnote } from "./lib/demo-module-banners";
import {
  CORE_BRIGHT_CYAN,
  captureDemoBenchmark,
  formatLatencyLabel,
  measureProbe,
  measureSync,
  printPerfHierarchyHud,
  type DemoBenchmarkSnapshot,
} from "./lib/demo-timing";

const WALLET = "0x1111111111111111111111111111111111111111";
const VAULT = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const TRUSTED_OPERATOR = "0xdddddddddddddddddddddddddddddddddddddddd";
const MALICIOUS = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const SCENARIO_RULE = "═".repeat(88);
const TAG_VAULT = `${CYAN}${BOLD}[ERC-7540 ASYNC VAULT]${R}`;
const TAG_WASM = `${CYAN}${BOLD}[WASM REFLEX]${R}`;
const TAG_GATE = `${RED}${BOLD}[PRE-CONSENSUS GATE]${R}`;

const SCENARIOS = {
  A: "🟢 ALLOW_DEPOSIT — Valid requestDeposit() · Whitelisted Controller",
  B: "🛑 REJECT_UNAUTHORIZED_OPERATOR — Malicious setOperator() Blocked",
  C: "🛑 REJECT_ASYNC_SLIPPAGE — High-Slippage Async Vault Request Rejected",
} as const;

function requireErc7540(parsed: ReturnType<typeof parseTransactionCalldata>): ParsedErc7540 {
  if (!parsed) {
    console.error(`${RED}parse failed${R}`);
    process.exit(1);
  }
  return parsed as ParsedErc7540;
}

function baseConfig(overrides: Partial<RetailGuardConfig> = {}): RetailGuardConfig {
  return {
    walletAddress: WALLET,
    allowedOperators: [TRUSTED_OPERATOR.toLowerCase()],
    allowedVenues: [VAULT.toLowerCase()],
    erc7540MaxSlippageBps: 50,
    ...overrides,
  };
}

function printScenarioHeader(id: keyof typeof SCENARIOS, color: string): void {
  console.log(`\n${SCENARIO_RULE}`);
  console.log(`${color}${BOLD}Scenario ${id}: ${SCENARIOS[id]}${R}`);
  console.log(`${SCENARIO_RULE}\n`);
}

function printVaultLine(detail: string): void {
  console.log(`  ${TAG_VAULT} ${GRAY}${detail}${R}`);
}

function printResult(color: string, detail: string): void {
  console.log(`  ${color}${BOLD}[RESULT]${R} ${detail}`);
}

function printWasmReflex(us: number): void {
  console.log(`  ${TAG_WASM} ${CORE_BRIGHT_CYAN}${BOLD}⚡ ${formatLatencyLabel(us)} SSRC Escort Eval${R}`);
}

function captureSanctuaryBenchmark(): DemoBenchmarkSnapshot {
  const passCfg = baseConfig({
    erc7540AsyncQuote: { requestAmountWei: 1_000_000n, claimableAmountWei: 999_800n, maxSlippageBps: 50 },
  });
  const depositData = encodeErc7540RequestDepositCalldata(1_000_000n, TRUSTED_OPERATOR, WALLET);
  const operatorData = encodeErc7540SetOperatorCalldata(MALICIOUS, true);
  const driftCfg = baseConfig({
    erc7540AsyncQuote: { requestAmountWei: 1_000_000n, claimableAmountWei: 800_000n, maxSlippageBps: 50 },
  });
  const depositParsed = () => requireErc7540(parseTransactionCalldata({ to: VAULT, data: depositData }));
  const evalDeposit = () => evaluateErc7540AsyncEscortGuard(depositParsed(), passCfg);
  const evalOperator = () =>
    evaluateErc7540AsyncEscortGuard(
      requireErc7540(parseTransactionCalldata({ to: VAULT, data: operatorData })),
      baseConfig(),
    );
  const evalDrift = () => evaluateErc7540AsyncEscortGuard(depositParsed(), driftCfg);
  const stackE2e = () => { evalDeposit(); evalOperator(); evalDrift(); };
  const pureDrift = () => computeErc7540SlippageDriftBps(1_000_000n, 999_800n);
  return captureDemoBenchmark({
    warmup: () => { pureDrift(); stackE2e(); },
    pureInvariant: pureDrift,
    fullMatrix: evalDeposit,
    e2eHarness: stackE2e,
  });
}

function runScenarioA(): void {
  printScenarioHeader("A", GREEN);
  const amountWei = 1_000_000n;
  const claimableWei = 999_800n;
  const data = encodeErc7540RequestDepositCalldata(amountWei, TRUSTED_OPERATOR, WALLET);
  const cfg = baseConfig({ erc7540AsyncQuote: { requestAmountWei: amountWei, claimableAmountWei: claimableWei, maxSlippageBps: 50 } });
  printVaultLine(`target=${VAULT} · selector=requestDeposit(0xb2d9f201)`);
  printVaultLine(`amount=${amountWei} wei · operator=${TRUSTED_OPERATOR} · controller=${WALLET}`);
  printVaultLine(`Pending→Claimable quote: ${amountWei} → ${claimableWei} wei · drift=${computeErc7540SlippageDriftBps(amountWei, claimableWei)} bps (≤50)`);
  const parsed = requireErc7540(parseTransactionCalldata({ to: VAULT, data }));
  const wasmUs = measureProbe(() => evaluateErc7540AsyncEscortGuard(parsed, cfg));
  const { value: reject } = measureSync(() => evaluateErc7540AsyncEscortGuard(parsed, cfg));
  printWasmReflex(wasmUs);
  printResult(GREEN, `ALLOW_DEPOSIT · escort_clear=${reject === null} · 0-Gas pre-consensus passthrough`);
  printOpSecFootnote();
}

function runScenarioB(): void {
  printScenarioHeader("B", RED);
  const data = encodeErc7540SetOperatorCalldata(MALICIOUS, true);
  printVaultLine(`target=${VAULT} · selector=setOperator(0x9cc233d6)`);
  printVaultLine(`operator=${MALICIOUS} · approved=true · whitelist=${TRUSTED_OPERATOR}`);
  const parsed = requireErc7540(parseTransactionCalldata({ to: VAULT, data }));
  const wasmUs = measureProbe(() => evaluateErc7540AsyncEscortGuard(parsed, baseConfig()));
  const { value: reject } = measureSync(() => evaluateErc7540AsyncEscortGuard(parsed, baseConfig()));
  printWasmReflex(wasmUs);
  console.log(`  ${TAG_GATE} ${RED}0-Gas intercept · operator not in allowedOperators${R}`);
  printResult(RED, `${reject?.code ?? "ALLOW"} · malicious setOperator blocked before broadcast`);
  if (reject?.code !== ERC7540_CODES.OPERATOR_REJECTED) process.exit(1);
  printOpSecFootnote();
}

function runScenarioC(): void {
  printScenarioHeader("C", RED);
  const amountWei = 1_000_000n;
  const claimableWei = 800_000n;
  const data = encodeErc7540RequestDepositCalldata(amountWei, TRUSTED_OPERATOR, WALLET);
  const cfg = baseConfig({ erc7540AsyncQuote: { requestAmountWei: amountWei, claimableAmountWei: claimableWei, maxSlippageBps: 50 } });
  printVaultLine(`target=${VAULT} · selector=requestDeposit(0xb2d9f201)`);
  printVaultLine(`Pending→Claimable drift: ${amountWei} → ${claimableWei} wei · drift=${computeErc7540SlippageDriftBps(amountWei, claimableWei)} bps (>50)`);
  const parsed = requireErc7540(parseTransactionCalldata({ to: VAULT, data }));
  const wasmUs = measureProbe(() => evaluateErc7540AsyncEscortGuard(parsed, cfg));
  const { value: reject } = measureSync(() => evaluateErc7540AsyncEscortGuard(parsed, cfg));
  printWasmReflex(wasmUs);
  console.log(`  ${TAG_GATE} ${RED}async vault drift fail-closed · Pending→Claimable slip exceeds erc7540MaxSlippageBps${R}`);
  printResult(RED, `${reject?.code ?? "ALLOW"} · high-slippage requestDeposit rejected (0-Gas)`);
  if (reject?.code !== ERC7540_CODES.ASYNC_SLIPPAGE_DRIFT) process.exit(1);
  printOpSecFootnote();
}

wrapDemoExecution(() => {
  ensureDemoWasmSoft();
  printModuleBBanner();
  captureSanctuaryBenchmark();
  const benchmark = captureSanctuaryBenchmark();
  benchmark.pureInvariantUs = measureProbe(() => computeErc7540SlippageDriftBps(1_000_000n, 999_800n));
  printPerfHierarchyHud(benchmark);
  runScenarioA();
  runScenarioB();
  runScenarioC();
  const line = "═".repeat(88);
  console.log(`\n${GREEN}${line}${R}`);
  console.log(
    `${GREEN}${BOLD}RESULT: ✅ Sanctuary Async Escort Matrix Complete — Scenarios A–C Replayed (ALLOW · REJECT_OPERATOR · REJECT_SLIPPAGE)${R}`,
  );
  console.log(`${GREEN}${line}${R}\n`);
});
