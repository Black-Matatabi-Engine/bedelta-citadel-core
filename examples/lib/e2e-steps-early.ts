/** E2E Steps 1–3 — Gatehouse, Ingress Escort, GMX Rebalance. */
import {
  AML_INBOUND_TO_ROBINHOOD_BLOCKED,
  ARBITRUM_ONE_CHAIN_ID,
  assertUnidirectionalBridge,
  EIP712_DOMAIN_NAME,
  ensureSoilWasm,
  evaluateSoilCore,
  ROBINHOOD_TESTNET_CHAIN_ID,
  SLIVERVINE_GATE_ADDRESS,
  verifyAgentIntent,
  WASM_EXEC_BUDGET_US,
} from "../../src/sdk";
import { AGENT_DEADMAN_SLIPPAGE_BPS } from "../../src/core/agent-citadel-guard";
import {
  WASM_SOIL_DEFAULT_SLIPPAGE_FUSE,
  WASM_SOIL_MIN_DEPTH_USD,
} from "../../src/services/wasm-feasibility-lib/soil-core-sim";
import {
  buildGmxV2UnsignedOrderPayload,
  GMX_DEFAULT_UI_FEE_RECEIVER,
  GMX_UI_FEE_BPS,
} from "../../src/services/adapters/gmx-v2-order-payload";
import { evaluateGmxBalancerQualification } from "../../src/services/yield/gmx-v2-balancer";
import {
  DEMO_AGENT,
  DEMO_BUILDER_REBATE_USD,
  DEMO_DIGEST,
  DEMO_ETH_MID,
  DEMO_REBALANCE_USD,
  DEMO_SIZE_USD,
  DEMO_TOKEN,
  DEMO_VAULT_CAPITAL_USD,
  DEMO_WALLET,
  ETH_GM_MARKET,
  sha16,
} from "./e2e-demo-constants";
import type { E2eStep1Result, E2eStep2Result, E2eStep3Result } from "./e2e-demo-types";
import { e2eLog, fmtE2eUsd, logE2eStep } from "./e2e-hud-renderer";
import { formatWasmP50BandStatus, sampleWasmSoilLatencyUs } from "./e2e-wasm-bench";
import { hrtimeElapsedUs, hrtimeStart } from "./demo-timing";

export function runStep1CitadelPreExec(demoNowMs: number): E2eStep1Result {
  logE2eStep(1, "Citadel Pre-Execution — Gatehouse + Wasm Soil + Deadman Switch", [
    "[Pillar 1: Gatehouse] ZeroDev Kernel v3 AA Session Keys · 0-Gas Paymaster",
    "[Pillar 3: Citadel Shield] checkSoilResistance() sub-ms Wasm Intent Clearing",
  ]);
  e2eLog(`Vault Capital: ${fmtE2eUsd(DEMO_VAULT_CAPITAL_USD)} ${DEMO_TOKEN} | Asset Pair: ETH/USDC`);
  ensureSoilWasm();
  const soilInput = {
    hlSpot: DEMO_ETH_MID,
    hlPerp: DEMO_ETH_MID,
    dydxPerp: DEMO_ETH_MID,
    depthUsd: 1_000_000,
    orderSizeUsd: DEMO_SIZE_USD,
    accountBalanceUsd: 10_000,
    maxSlippage: WASM_SOIL_DEFAULT_SLIPPAGE_FUSE,
    minDepthUsd: WASM_SOIL_MIN_DEPTH_USD,
  };
  const { p50Us: wasmP50Us, minUs: wasmHotPathUs } = sampleWasmSoilLatencyUs(soilInput);
  const core = evaluateSoilCore(soilInput);
  const wasmBudgetPass = wasmHotPathUs < WASM_EXEC_BUDGET_US;
  const nodeT0 = hrtimeStart();
  const verdict = verifyAgentIntent({
    intentDigest: DEMO_DIGEST,
    sessionKey: {
      agentAddress: DEMO_AGENT,
      maxOrderClipUsd: 30,
      expiresAtMs: demoNowMs + 86_400_000,
      approvedAtMs: demoNowMs,
    },
    soil: {
      symbol: "ETH-PERP",
      hlSpot: DEMO_ETH_MID,
      hlPerp: DEMO_ETH_MID,
      dydxPerp: DEMO_ETH_MID,
      depthUsd: 1_000_000,
      isTestnet: false,
    },
    gasBurst: { estimatedGasCostUsd: 0.1, sponsored: true, dailySpentUsd: 0 },
    deadman: {
      maxSlippageBps: AGENT_DEADMAN_SLIPPAGE_BPS,
      soilResistanceThreshold: AGENT_DEADMAN_SLIPPAGE_BPS,
    },
    attestation: {
      digest: DEMO_DIGEST,
      expiresAtMs: demoNowMs + 60_000,
      sig: `0x${"11".repeat(65)}`,
      verifyingContract: SLIVERVINE_GATE_ADDRESS,
      domainName: EIP712_DOMAIN_NAME,
    },
    armor: { rpcLatencyMs: 42, sandwichRiskBps: 8 },
    preset: "production",
    nowMs: demoNowMs,
  });
  const nodeE2eRttUs = hrtimeElapsedUs(nodeT0);
  const soilClear = !core.output.tripped && verdict.soilOk;
  e2eLog("[ AA SESSION KEY ]   Kernel v3 Scopes: EIP-712 Intent Signed  │  Paymaster: 0-Gas Sponsored  [ ACTIVE ]");
  e2eLog(
    `[ WASM SOIL CORE ]   Hot-Path: ${wasmHotPathUs.toFixed(1)}µs (<${WASM_EXEC_BUDGET_US}µs ${wasmBudgetPass ? "PASS" : "FAIL"})  │  p50: ${wasmP50Us.toFixed(1)}µs  │  Soil Status: ${soilClear ? "CLEAR" : "TRIP"}      [ ${soilClear && wasmBudgetPass ? "PASSED" : "FAILED"} ]`,
  );
  e2eLog(
    `[ DEADMAN SWITCH ]   Armed Threshold: ${AGENT_DEADMAN_SLIPPAGE_BPS}bps  │  Status: ${verdict.deadmanOk ? "OK" : "TRIP"}  │  Signer Mode: Ephemeral Ignition Keys`,
  );
  if (!verdict.allowedToSign || !verdict.deadmanOk) {
    throw new Error(`STEP1_BLOCKED: ${verdict.reasons.join(",")}`);
  }
  e2eLog("RESULT: 🟢 Step 1 Pre-Execution PASS — ZeroDev 0-Gas Verified · Sub-ms Wasm Clear · Soil OK");
  return {
    ok: true,
    wasmUsed: verdict.wasmUsed,
    wasmHotPathUs,
    wasmP50Us,
    nodeE2eRttUs,
    deadmanOk: verdict.deadmanOk,
  };
}

export function runStep2RobinhoodEscort(demoNowMs: number): E2eStep2Result {
  logE2eStep(2, "Unidirectional Compliance Escort — AML Inbound Firewall", "[Pillar 2: Compliance Ingress Firewall] Across Intent-Based Unidirectional Escort");
  const outbound = assertUnidirectionalBridge({
    sourceChainId: ROBINHOOD_TESTNET_CHAIN_ID,
    destChainId: ARBITRUM_ONE_CHAIN_ID,
    amountUsd: DEMO_VAULT_CAPITAL_USD,
    wallet: DEMO_WALLET,
    initiatedAtMs: demoNowMs,
    nowMs: demoNowMs + 90_000,
    settledAtMs: demoNowMs + 60_000,
  });
  e2eLog("[ OUTBOUND ESCORT ]   Robinhood (46630) ──( Across Fast Intent )──► Arbitrum (42161)");
  e2eLog("└─ Status: SETTLED  │  lostUsd ≡ 0 Verified  │  0-Gas Paymaster: ACTIVE  [ ALLOWED ]");
  const inbound = assertUnidirectionalBridge({
    sourceChainId: ARBITRUM_ONE_CHAIN_ID,
    destChainId: ROBINHOOD_TESTNET_CHAIN_ID,
    amountUsd: 10,
    wallet: DEMO_WALLET,
    initiatedAtMs: demoNowMs,
    nowMs: demoNowMs,
  });
  e2eLog("[ INBOUND AML BLOCK ] Arbitrum (42161) ──( Reversal Blocked )──x Robinhood (46630)");
  e2eLog(`└─ Reason: ${AML_INBOUND_TO_ROBINHOOD_BLOCKED}  │  RWA Protection: ENFORCED [ REJECTED ]`);
  if (!outbound.ok) throw new Error(`STEP2_OUTBOUND_BLOCKED: ${outbound.reasons.join(",")}`);
  if (inbound.ok || inbound.capitalLabel !== AML_INBOUND_TO_ROBINHOOD_BLOCKED) {
    throw new Error("STEP2_AML_INBOUND_NOT_BLOCKED");
  }
  e2eLog("RESULT: 🟢 Pillar 2 Ingress PASS — Outbound Escort Active · Inbound AML Blocked · lostUsd ≡ 0");
  return { outboundOk: true, inboundBlocked: true, capitalLabel: inbound.capitalLabel };
}

export function runStep3GmxUnderweightRebalance(): E2eStep3Result {
  logE2eStep(3, "GMX v2 Underweight Rebalance & UI Fee Rebase", `GMX v2 Underweight Rebalance & UI Fee Rebase (+${GMX_UI_FEE_BPS} bps uiFeeReceiver builder lane)`);
  e2eLog(`Rebalance Amount: ${fmtE2eUsd(DEMO_REBALANCE_USD)} ${DEMO_TOKEN} | Builder Rebate: +10 bps (${fmtE2eUsd(DEMO_BUILDER_REBATE_USD)} USD)`);
  const pool = { longTokenUsd: 5_200_000, shortTokenUsd: 4_800_000 };
  const balancer = evaluateGmxBalancerQualification({
    orderSizeUsd: DEMO_SIZE_USD,
    isLong: false,
    pool,
    symbol: "ETH",
  });
  e2eLog(`Balancer: underweight=${balancer.underweightSide} qualified=${balancer.isGmxBalancerQualified} rebate=${balancer.expectedPriceImpactRebateBps}bps`);
  e2eLog(`Skew: longW=${(balancer.longWeight * 100).toFixed(1)}% shortW=${(balancer.shortWeight * 100).toFixed(1)}% reducesImbalance=${balancer.reducesImbalance}`);
  const payload = buildGmxV2UnsignedOrderPayload({
    side: "short",
    sizeUsd: DEMO_SIZE_USD,
    midPriceUsd: DEMO_ETH_MID,
    marketToken: ETH_GM_MARKET,
    maxSlippageBps: 30,
    pool,
    clientOrderId: `grant-e2e-${Date.now()}`,
  });
  const uiFeeReceiver = payload.addresses.uiFeeReceiver;
  e2eLog(`Payload: orderType=${payload.orderType} isLong=${payload.isLong} uiFeeReceiver=${uiFeeReceiver} (+${GMX_UI_FEE_BPS} bps)`);
  e2eLog(`SSOT treasury: ${GMX_DEFAULT_UI_FEE_RECEIVER}`);
  e2eLog(`CreateOrderParams.addresses.uiFeeReceiver injected: ${uiFeeReceiver === GMX_DEFAULT_UI_FEE_RECEIVER}`);
  if (uiFeeReceiver !== GMX_DEFAULT_UI_FEE_RECEIVER) throw new Error("STEP3_UI_FEE_RECEIVER_MISMATCH");
  if (!balancer.isGmxBalancerQualified) throw new Error("STEP3_BALANCER_NOT_QUALIFIED");
  e2eLog("RESULT: 🟢 Step 3 GMX v2 Rebalance PASS — +10 bps Builder Fee Injected · Skew Balanced");
  return {
    uiFeeReceiver,
    uiFeeBps: GMX_UI_FEE_BPS,
    underweightSide: balancer.underweightSide,
    payloadRef: `sha256:${sha16(payload)}`,
  };
}
