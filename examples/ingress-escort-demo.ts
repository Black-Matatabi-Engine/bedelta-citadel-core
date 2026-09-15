#!/usr/bin/env tsx
/**
 * Module B Treasury Ingress — Pillar Set X Across/Robinhood AML compliance escort.
 * Usage: pnpm demo:ingress · JSON: pnpm demo:ingress -- --json
 * Trip:  pnpm demo:ingress -- --trip
 */
import {
  AML_INBOUND_TO_ROBINHOOD_BLOCKED,
  ARBITRUM_ONE_CHAIN_ID,
  BRIDGE_TIMEOUT_FAIL_CLOSED,
  DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS,
  IN_FLIGHT_BRIDGE_CAPITAL,
  ROBINHOOD_TESTNET_CHAIN_ID,
  evaluateAcrossBridgeTransfer,
  validateAcrossBridgeDirection,
} from "../src/adapters/across-ingress-bridge";
import { GREEN, RED, R, printMode } from "./adapters/citadel-ansi-hud";
import { roundWasmUs } from "./lib/eip1193-extension-helpers";
import { captureDemoBenchmark, formatGuardTime, measureSync } from "./lib/demo-timing";
import { IS_LIVINGWATER_MODE, isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
import { isDemoInteractiveArgv, isDemoJsonArgv, releaseDemoStdin } from "./lib/demo-utils";
import {
  INGRESS_SCENARIO_TITLES,
  awaitIngressScenarioTransition,
  printIngressBanner,
  printIngressResult,
  printIngressScenario,
} from "./lib/ingress-demo-hud";
import {
  buildIngressRunPayload,
  saveIngressRunPayload,
  type IngressScenarioJsonResult,
} from "./lib/ingress-run-persister";

const WALLET = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const BASE_CHAIN_ID = 48_437;
const HL_L1_CHAIN_ID = 999_001;
const T0 = 1_700_000_000_000;
const ESCORT_USD = 2_500;

type ScenarioOpts = { interactive: boolean };

function resolveEscortT0(nowMs: number): number {
  return IS_LIVINGWATER_MODE ? nowMs - 180_000 : T0;
}

function captureEscortBenchmark(t0: number) {
  const dir = { sourceChainId: ROBINHOOD_TESTNET_CHAIN_ID, destChainId: ARBITRUM_ONE_CHAIN_ID };
  const xfer = { amountUsd: ESCORT_USD, wallet: WALLET, initiatedAtMs: t0 };
  return captureDemoBenchmark({
    pureInvariant: () => validateAcrossBridgeDirection(dir),
    fullMatrix: () => evaluateAcrossBridgeTransfer(xfer, { nowMs: t0 + 90_000 }),
    e2eHarness: () => {
      validateAcrossBridgeDirection(dir);
      evaluateAcrossBridgeTransfer(xfer, { nowMs: t0 + 90_000 });
      evaluateAcrossBridgeTransfer(xfer, { nowMs: t0 + 180_000, settledAtMs: t0 + 150_000 });
    },
  });
}

function assertLostUsdZero(state: ReturnType<typeof evaluateAcrossBridgeTransfer>): void {
  if (state.lostUsd !== 0) {
    if (isDemoJsonArgv()) process.exit(1);
    console.error(`${RED}INVARIANT BREACH: lostUsd=${state.lostUsd} (expected 0)${R}`);
    process.exit(1);
  }
}

function runScenarioA(trip: boolean, t0: number, { interactive }: ScenarioOpts): IngressScenarioJsonResult {
  const limitation =
    "Standard ERC-7683 cross-chain intents expose unlocked in-flight MEV risk — capital may deploy before solver settlement proof; no wallet-side IN_FLIGHT lock on naive bridge routing.";
  const enhancement =
    "ERC-7683 Solver Capital Lock IN_FLIGHT → SETTLED semantic escort · Across Pillar Set X route 46630→42161 · lostUsd ≡ 0 invariant enforced.";
  if (trip) {
    const { value: state, latencyUs } = measureSync(() =>
      evaluateAcrossBridgeTransfer(
        { amountUsd: ESCORT_USD, wallet: WALLET, initiatedAtMs: t0 },
        { nowMs: t0 + DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS + 5_000 },
      ),
    );
    assertLostUsdZero(state);
    if (interactive) {
      printIngressScenario({
        id: "A",
        title: INGRESS_SCENARIO_TITLES.A,
        frameColor: RED,
        limitation,
        enhancement,
        detailLines: [
          `chain ${ROBINHOOD_TESTNET_CHAIN_ID} → ${ARBITRUM_ONE_CHAIN_ID} · timeout>${DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS}ms`,
          `capitalLabel=${state.capitalLabel} · deployable=${state.deployable} · lostUsd=$${state.lostUsd}`,
        ],
        latencyUs,
        pass: false,
        gateLine: `${BRIDGE_TIMEOUT_FAIL_CLOSED} · 0-Gas fail-closed · lostUsd ≡ 0`,
        resultLine: `${BRIDGE_TIMEOUT_FAIL_CLOSED} · bridge timeout intercepted before deployable NAV unlock`,
      });
    }
    return {
      scenario: "A",
      status: "FAIL_CLOSED",
      latencyUs: roundWasmUs(latencyUs),
      capitalLabel: state.capitalLabel,
      deployable: state.deployable,
      inFlightUsd: state.inFlightUsd,
      settledUsd: state.settledUsd,
      lostUsd: state.lostUsd,
      reasons: state.reasons,
    };
  }
  const dir = validateAcrossBridgeDirection({
    sourceChainId: ROBINHOOD_TESTNET_CHAIN_ID,
    destChainId: ARBITRUM_ONE_CHAIN_ID,
  });
  const inflight = evaluateAcrossBridgeTransfer(
    { amountUsd: ESCORT_USD, wallet: WALLET, initiatedAtMs: t0 },
    { nowMs: t0 + 90_000 },
  );
  assertLostUsdZero(inflight);
  const { value: settled, latencyUs } = measureSync(() =>
    evaluateAcrossBridgeTransfer(
      { amountUsd: ESCORT_USD, wallet: WALLET, initiatedAtMs: t0 },
      { nowMs: t0 + 180_000, settledAtMs: t0 + 150_000 },
    ),
  );
  assertLostUsdZero(settled);
  if (interactive) {
    printIngressScenario({
      id: "A",
      title: INGRESS_SCENARIO_TITLES.A,
      frameColor: GREEN,
      limitation,
      enhancement,
      detailLines: [
        `direction ok=${dir.ok} · chain ${ROBINHOOD_TESTNET_CHAIN_ID} → ${ARBITRUM_ONE_CHAIN_ID}`,
        `IN_FLIGHT: capitalLabel=${inflight.capitalLabel} · inFlight=$${inflight.inFlightUsd}`,
        `SETTLED: capitalLabel=${settled.capitalLabel} · deployable NAV → GMX / Pendle pre-flight`,
      ],
      latencyUs,
      pass: true,
      resultLine: `COMPLIANCE_ESCORT_SETTLED · ${IN_FLIGHT_BRIDGE_CAPITAL} → SETTLED · lostUsd ≡ 0`,
    });
  }
  return {
    scenario: "A",
    status: "SETTLED",
    latencyUs: roundWasmUs(latencyUs),
    directionOk: dir.ok,
    capitalLabel: settled.capitalLabel,
    deployable: settled.deployable,
    inFlightUsd: inflight.inFlightUsd,
    settledUsd: settled.settledUsd,
    lostUsd: settled.lostUsd,
  };
}

function runScenarioB({ interactive }: ScenarioOpts): IngressScenarioJsonResult {
  const direct = validateAcrossBridgeDirection({
    sourceChainId: ROBINHOOD_TESTNET_CHAIN_ID,
    destChainId: HL_L1_CHAIN_ID,
  });
  if (interactive) {
    printIngressScenario({
      id: "B",
      title: INGRESS_SCENARIO_TITLES.B,
      frameColor: RED,
      limitation:
        "Unsafe direct L1 routing (Robinhood → Hyperliquid) bypasses Arbitrum sequencer escort plane — unguarded cross-venue capital topology.",
      enhancement:
        "Route Topology Switch enforces 46630 → 42161 (Pillar 2 SETTLED) → HL session hedge (Pillar 3); direct RH→HL rejected at pre-flight.",
      detailLines: [
        `direct ${ROBINHOOD_TESTNET_CHAIN_ID} → ${HL_L1_CHAIN_ID}: ok=${direct.ok}`,
        `reasons: ${direct.reasons.join(" · ")}`,
        `recommended: 46630 → 42161 (SETTLED) → HL session hedge`,
      ],
      pass: false,
      resultLine: "BRIDGE_ROUTE_UNSUPPORTED · direct L1 topology blocked",
    });
  }
  return {
    scenario: "B",
    status: "ROUTE_BLOCKED",
    directionOk: direct.ok,
    reasons: direct.reasons,
  };
}

function runScenarioC({ interactive }: ScenarioOpts): IngressScenarioJsonResult {
  const outbound = validateAcrossBridgeDirection({
    sourceChainId: ARBITRUM_ONE_CHAIN_ID,
    destChainId: BASE_CHAIN_ID,
  });
  const aml = validateAcrossBridgeDirection({
    sourceChainId: ARBITRUM_ONE_CHAIN_ID,
    destChainId: ROBINHOOD_TESTNET_CHAIN_ID,
  });
  if (interactive) {
    printIngressScenario({
      id: "C",
      title: INGRESS_SCENARIO_TITLES.C,
      frameColor: RED,
      limitation:
        "Unchecked AML reverse liquidity injection — outbound Arb→Base and inbound Arb→Robinhood lack pre-execution compliance hooks on standard bridges.",
      enhancement:
        "ERC-7579 Isomorphic Inbound AML Block AML_INBOUND_TO_ROBINHOOD_BLOCKED · Pillar Set X compliance pre-execution strategy (Edge isomorphic).",
      detailLines: [
        `outbound ${ARBITRUM_ONE_CHAIN_ID} → ${BASE_CHAIN_ID}: ok=${outbound.ok} · ${outbound.reasons.join(" · ")}`,
        `inbound AML ${ARBITRUM_ONE_CHAIN_ID} → ${ROBINHOOD_TESTNET_CHAIN_ID}: blocked=${aml.inboundBlocked}`,
        `reason: ${aml.reasons[0] ?? AML_INBOUND_TO_ROBINHOOD_BLOCKED}`,
      ],
      pass: aml.inboundBlocked,
      resultLine: `${AML_INBOUND_TO_ROBINHOOD_BLOCKED} enforced · reverse liquidity injection fail-closed`,
    });
  }
  return {
    scenario: "C",
    status: "AML_INBOUND_BLOCKED",
    directionOk: outbound.ok,
    inboundBlocked: aml.inboundBlocked,
    reasons: aml.reasons,
  };
}

wrapDemoExecution(async ({ nowMs }) => {
  const jsonMode = isDemoJsonArgv();
  const interactive = isDemoInteractiveArgv();
  const trip = isDemoTripArgv();
  const t0 = resolveEscortT0(nowMs);
  const benchmark = captureEscortBenchmark(t0);
  const scenarios: IngressScenarioJsonResult[] = [];

  if (!jsonMode) {
    printIngressBanner(benchmark);
    printMode(trip);
  }

  scenarios.push(runScenarioA(trip, t0, { interactive }));
  if (!trip) {
    if (interactive) await awaitIngressScenarioTransition("B");
    scenarios.push(runScenarioB({ interactive }));
    if (interactive) await awaitIngressScenarioTransition("C");
    scenarios.push(runScenarioC({ interactive }));
  }

  const timestamp = new Date(nowMs).toISOString();
  const payload = buildIngressRunPayload(
    scenarios,
    benchmark,
    timestamp,
    trip,
    trip ? BRIDGE_TIMEOUT_FAIL_CLOSED : undefined,
  );

  if (jsonMode) {
    saveIngressRunPayload(payload);
    process.stdout.write(`${JSON.stringify(scenarios, null, 2)}\n`);
    releaseDemoStdin();
    return {
      tripped: trip,
      reason: trip ? BRIDGE_TIMEOUT_FAIL_CLOSED : "INGRESS_MATRIX_VERIFIED",
      suppressInterceptBanner: true,
    };
  }

  const latencyUs = scenarios[0]?.latencyUs ?? 0;
  console.log(`\n${R}escort guard · ${formatGuardTime(latencyUs)} · lostUsd invariant ✓${R}\n`);
  printIngressResult(trip);
  saveIngressRunPayload(payload);
  releaseDemoStdin();
  if (trip) return { tripped: true, reason: BRIDGE_TIMEOUT_FAIL_CLOSED };
});
