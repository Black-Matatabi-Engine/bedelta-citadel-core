#!/usr/bin/env tsx
/** Sanctuary Async Escort (ERC-7540+) — Usage: pnpm demo:sanctuary · Alias: pnpm demo:escort */
import {
  ERC7540_CODES,
  encodeErc7540RequestDepositCalldata,
  encodeErc7540SetOperatorCalldata,
  evaluateErc7540AsyncEscortGuard,
  parseTransactionCalldata,
  type ParsedErc7540,
  type RetailGuardConfig,
} from "../src/sdk/eip1193-agentic-wallet-guard";
import { BOLD, GREEN, GRAY, RED, R } from "./adapters/citadel-ansi-hud";
import { wrapDemoExecution } from "./lib/demo-harness";
import { printModuleBBanner, printOpSecFootnote } from "./lib/demo-module-banners";
import {
  captureDemoBenchmark,
  formatGuardTime,
  measureSync,
  printPerfHierarchyHud,
} from "./lib/demo-timing";

const WALLET = "0x1111111111111111111111111111111111111111";
const VAULT = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const TRUSTED_OPERATOR = "0xdddddddddddddddddddddddddddddddddddddddd";
const MALICIOUS = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const SCENARIO_RULE = "═".repeat(88);

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

function captureSanctuaryBenchmark(): ReturnType<typeof captureDemoBenchmark> {
  const passCfg = baseConfig({
    erc7540AsyncQuote: { requestAmountWei: 1_000_000n, claimableAmountWei: 999_800n, maxSlippageBps: 50 },
  });
  const depositData = encodeErc7540RequestDepositCalldata(1_000_000n, TRUSTED_OPERATOR, WALLET);
  const operatorData = encodeErc7540SetOperatorCalldata(MALICIOUS, true);
  const driftCfg = baseConfig({
    erc7540AsyncQuote: { requestAmountWei: 1_000_000n, claimableAmountWei: 800_000n, maxSlippageBps: 50 },
  });
  const evalDeposit = () => {
    evaluateErc7540AsyncEscortGuard(requireErc7540(parseTransactionCalldata({ to: VAULT, data: depositData })), passCfg);
  };
  const evalOperator = () => {
    evaluateErc7540AsyncEscortGuard(requireErc7540(parseTransactionCalldata({ to: VAULT, data: operatorData })), baseConfig());
  };
  const evalDrift = () => {
    evaluateErc7540AsyncEscortGuard(requireErc7540(parseTransactionCalldata({ to: VAULT, data: depositData })), driftCfg);
  };
  return captureDemoBenchmark({
    pureInvariant: evalDeposit,
    fullMatrix: () => { evalDeposit(); evalOperator(); },
    e2eHarness: () => { evalDeposit(); evalOperator(); evalDrift(); },
  });
}

function runScenarioA(): void {
  printScenarioHeader("A", GREEN);
  const data = encodeErc7540RequestDepositCalldata(1_000_000n, TRUSTED_OPERATOR, WALLET);
  const { value: parsed, latencyUs } = measureSync(() =>
    parseTransactionCalldata({ to: VAULT, data }),
  );
  console.log(`  ${GRAY}selector: requestDeposit · vault=${VAULT}${R}`);
  const { value: reject } = measureSync(() =>
    evaluateErc7540AsyncEscortGuard(requireErc7540(parsed), baseConfig({
      erc7540AsyncQuote: { requestAmountWei: 1_000_000n, claimableAmountWei: 999_800n, maxSlippageBps: 50 },
    })),
  );
  console.log(`  ${GREEN}verdict: ALLOW_DEPOSIT · escort_clear=${reject === null}${R}`);
  console.log(`  ${formatGuardTime(latencyUs)}`);
  printOpSecFootnote();
}

function runScenarioB(): void {
  printScenarioHeader("B", RED);
  const data = encodeErc7540SetOperatorCalldata(MALICIOUS, true);
  const { value: parsed, latencyUs } = measureSync(() =>
    parseTransactionCalldata({ to: VAULT, data }),
  );
  console.log(`  ${GRAY}selector: setOperator · operator=${MALICIOUS}${R}`);
  const { value: reject } = measureSync(() =>
    evaluateErc7540AsyncEscortGuard(requireErc7540(parsed), baseConfig()),
  );
  console.log(`  ${RED}verdict: ${reject?.code ?? "ALLOW"} · 0-Gas pre-consensus intercept${R}`);
  if (reject?.code !== ERC7540_CODES.OPERATOR_REJECTED) process.exit(1);
  console.log(`  ${formatGuardTime(latencyUs)}`);
  printOpSecFootnote();
}

function runScenarioC(): void {
  printScenarioHeader("C", RED);
  const data = encodeErc7540RequestDepositCalldata(1_000_000n, TRUSTED_OPERATOR, WALLET);
  const { value: parsed, latencyUs } = measureSync(() =>
    parseTransactionCalldata({ to: VAULT, data }),
  );
  console.log(`  ${GRAY}Pending→Claimable drift: 1_000_000 → 800_000 wei (>50 bps)${R}`);
  const { value: reject } = measureSync(() =>
    evaluateErc7540AsyncEscortGuard(requireErc7540(parsed), baseConfig({
      erc7540AsyncQuote: { requestAmountWei: 1_000_000n, claimableAmountWei: 800_000n, maxSlippageBps: 50 },
    })),
  );
  console.log(`  ${RED}verdict: ${reject?.code ?? "ALLOW"} · async vault drift fail-closed${R}`);
  if (reject?.code !== ERC7540_CODES.ASYNC_SLIPPAGE_DRIFT) process.exit(1);
  console.log(`  ${formatGuardTime(latencyUs)}`);
  printOpSecFootnote();
}

wrapDemoExecution(() => {
  printModuleBBanner();
  printPerfHierarchyHud(captureSanctuaryBenchmark());
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
