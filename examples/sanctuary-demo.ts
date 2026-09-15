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
} from "../src/sdk/exomesh-agentic-wallet-guard";
import { ensureDemoWasmSoft, wrapDemoExecution } from "./lib/demo-harness";
import {
  captureDemoBenchmark,
  measureProbe,
  measureSync,
  type DemoBenchmarkSnapshot,
} from "./lib/demo-timing";
import {
  printSanctuaryBanner,
  printSanctuaryMatrixComplete,
  printSanctuaryScenario,
  SANCTUARY_SCENARIO_TITLES,
} from "./lib/sanctuary-demo-hud";
import { GREEN, RED } from "./adapters/citadel-ansi-hud";

const WALLET = "0x1111111111111111111111111111111111111111";
const VAULT = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const TRUSTED_OPERATOR = "0xdddddddddddddddddddddddddddddddddddddddd";
const MALICIOUS = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

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

function evalScenario(
  parsed: ParsedErc7540,
  cfg: RetailGuardConfig,
): { wasmUs: number; reject: ReturnType<typeof evaluateErc7540AsyncEscortGuard> } {
  const wasmUs = measureProbe(() => evaluateErc7540AsyncEscortGuard(parsed, cfg));
  const { value: reject } = measureSync(() => evaluateErc7540AsyncEscortGuard(parsed, cfg));
  return { wasmUs, reject };
}

function runScenarioA(): void {
  const amountWei = 1_000_000n;
  const claimableWei = 999_800n;
  const driftBps = computeErc7540SlippageDriftBps(amountWei, claimableWei);
  const data = encodeErc7540RequestDepositCalldata(amountWei, TRUSTED_OPERATOR, WALLET);
  const cfg = baseConfig({
    erc7540AsyncQuote: { requestAmountWei: amountWei, claimableAmountWei: claimableWei, maxSlippageBps: 50 },
  });
  const parsed = requireErc7540(parseTransactionCalldata({ to: VAULT, data }));
  const { wasmUs, reject } = evalScenario(parsed, cfg);
  printSanctuaryScenario({
    id: "A",
    title: SANCTUARY_SCENARIO_TITLES.A,
    frameColor: GREEN,
    limitation:
      "Standard ERC-7540 has no wallet-side guard on requestDeposit — Pending→Claimable async drift is unchecked before signature broadcast.",
    enhancement:
      "Pre-sign Wasm escort intercepts requestDeposit(0xb2d9f201) · whitelisted controller + evalAsyncVaultDriftBps fuse · 0-Gas fail-closed on breach.",
    detailLines: [
      `target=${VAULT} · amount=${amountWei} wei · operator=${TRUSTED_OPERATOR}`,
      `Pending→Claimable: ${amountWei} → ${claimableWei} wei · drift=${driftBps} bps (≤50)`,
    ],
    wasmUs,
    pass: reject === null,
    resultLine: "ALLOW_DEPOSIT · escort_clear=true · 0-Gas pre-consensus passthrough",
  });
}

function runScenarioB(): void {
  const data = encodeErc7540SetOperatorCalldata(MALICIOUS, true);
  const parsed = requireErc7540(parseTransactionCalldata({ to: VAULT, data }));
  const { wasmUs, reject } = evalScenario(parsed, baseConfig());
  if (reject?.code !== ERC7540_CODES.OPERATOR_REJECTED) process.exit(1);
  printSanctuaryScenario({
    id: "B",
    title: SANCTUARY_SCENARIO_TITLES.B,
    frameColor: RED,
    limitation:
      "ERC-7540 setOperator(approved=true) grants vault control with no standard wallet whitelist — attacker can hijack Pending share claims.",
    enhancement:
      "Selector-level interception on setOperator(0x9cc233d6) · allowedOperators lock · malicious operator blocked before mock provider receives request().",
    detailLines: [
      `target=${VAULT} · operator=${MALICIOUS} · approved=true`,
      `whitelist=${TRUSTED_OPERATOR} · 0xbbbb… ∉ allowedOperators`,
    ],
    wasmUs,
    pass: false,
    gateLine: "0-Gas intercept · operator not in allowedOperators",
    resultLine: `${reject.code} · malicious setOperator blocked before broadcast`,
  });
}

function runScenarioC(): void {
  const amountWei = 1_000_000n;
  const claimableWei = 800_000n;
  const driftBps = computeErc7540SlippageDriftBps(amountWei, claimableWei);
  const data = encodeErc7540RequestDepositCalldata(amountWei, TRUSTED_OPERATOR, WALLET);
  const cfg = baseConfig({
    erc7540AsyncQuote: { requestAmountWei: amountWei, claimableAmountWei: claimableWei, maxSlippageBps: 50 },
  });
  const parsed = requireErc7540(parseTransactionCalldata({ to: VAULT, data }));
  const { wasmUs, reject } = evalScenario(parsed, cfg);
  if (reject?.code !== ERC7540_CODES.ASYNC_SLIPPAGE_DRIFT) process.exit(1);
  printSanctuaryScenario({
    id: "C",
    title: SANCTUARY_SCENARIO_TITLES.C,
    frameColor: RED,
    limitation:
      "Raw ERC-7540 exposes an un-guarded Pending→Claimable window — oracle lag / de-peg can erode claimable amount with no pre-consensus slippage cap.",
    enhancement:
      "evalAsyncVaultDriftBps at pre-sign Wasm check on requestDeposit · erc7540MaxSlippageBps=50 enforced · 0-Gas FAIL_CLOSED before broadcast.",
    detailLines: [
      `target=${VAULT} · selector=requestDeposit(0xb2d9f201)`,
      `Pending→Claimable: ${amountWei} → ${claimableWei} wei · drift=${driftBps} bps (>50)`,
    ],
    wasmUs,
    pass: false,
    gateLine: "async vault drift fail-closed · Pending→Claimable slip exceeds erc7540MaxSlippageBps",
    resultLine: `${reject.code} · high-slippage requestDeposit rejected (0-Gas)`,
  });
}

wrapDemoExecution(() => {
  ensureDemoWasmSoft();
  const benchmark = captureSanctuaryBenchmark();
  benchmark.pureInvariantUs = measureProbe(() => computeErc7540SlippageDriftBps(1_000_000n, 999_800n));
  printSanctuaryBanner(benchmark);
  runScenarioA();
  runScenarioB();
  runScenarioC();
  printSanctuaryMatrixComplete();
});
