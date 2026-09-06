#!/usr/bin/env tsx
/**
 * Pillar 2 — Unidirectional Compliance Escort (Across / Robinhood reference adapter).
 * Usage: pnpm demo:escort
 * Trip:  pnpm demo:escort -- --trip  (Across timeout >3600s · 0-Gas fail-closed · lostUsd ≡ 0)
 */
import {
  AML_INBOUND_TO_ROBINHOOD_BLOCKED,
  ARBITRUM_ONE_CHAIN_ID,
  BRIDGE_TIMEOUT_FAIL_CLOSED,
  DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS,
  ROBINHOOD_TESTNET_CHAIN_ID,
  evaluateAcrossBridgeTransfer,
  validateAcrossBridgeDirection,
} from "../src/adapters/across-ingress-bridge";
import {
  BOLD,
  CYAN,
  GRAY,
  GREEN,
  RED,
  R,
  hudBlocked,
  hudSevered,
  printMode,
} from "./adapters/citadel-ansi-hud";
import {
  captureDemoBenchmark,
  printEscortBanner,
  printEscortResult,
} from "./lib/escort-demo-hud";
import { isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";
import { formatGuardTime, measureSync } from "./lib/demo-timing";

const WALLET = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const BASE_CHAIN_ID = 48_437;
const HL_L1_CHAIN_ID = 999_001;
const T0 = 1_700_000_000_000;
const ESCORT_USD = 2_500;

function captureEscortBenchmark() {
  const dir = { sourceChainId: ROBINHOOD_TESTNET_CHAIN_ID, destChainId: ARBITRUM_ONE_CHAIN_ID };
  const xfer = { amountUsd: ESCORT_USD, wallet: WALLET, initiatedAtMs: T0 };
  return captureDemoBenchmark({
    pureInvariant: () => validateAcrossBridgeDirection(dir),
    fullMatrix: () => evaluateAcrossBridgeTransfer(xfer, { nowMs: T0 + 90_000 }),
    e2eHarness: () => {
      validateAcrossBridgeDirection(dir);
      evaluateAcrossBridgeTransfer(xfer, { nowMs: T0 + 90_000 });
      evaluateAcrossBridgeTransfer(xfer, { nowMs: T0 + 180_000, settledAtMs: T0 + 150_000 });
    },
  });
}

function hudRoute(id: string, src: number, dst: number, label: string): void {
  console.log(`\n${BOLD}━━ Route ${id}: ${label} ━━${R}`);
  console.log(`  ${GRAY}chain ${src} → ${dst}${R}`);
}

function printEval(state: ReturnType<typeof evaluateAcrossBridgeTransfer>): void {
  const ok = state.ok ? GREEN : RED;
  console.log(
    `${R}  capitalLabel=${ok}${state.capitalLabel}${R} · deployable=${state.deployable} · inFlight=$${state.inFlightUsd} · settled=$${state.settledUsd} · ${BOLD}lostUsd=$${state.lostUsd}${R}`,
  );
  if (state.reasons.length) console.log(`  ${GRAY}reasons: ${state.reasons.join(" · ")}${R}`);
}

function assertLostUsdZero(state: ReturnType<typeof evaluateAcrossBridgeTransfer>): void {
  if (state.lostUsd !== 0) {
    console.error(`${RED}INVARIANT BREACH: lostUsd=${state.lostUsd} (expected 0)${R}`);
    process.exit(1);
  }
}

function runRouteA(trip: boolean): number {
  hudRoute("A", ROBINHOOD_TESTNET_CHAIN_ID, ARBITRUM_ONE_CHAIN_ID, "GMX / Pendle escort");
  const { value: dir } = measureSync(() =>
    validateAcrossBridgeDirection({
      sourceChainId: ROBINHOOD_TESTNET_CHAIN_ID,
      destChainId: ARBITRUM_ONE_CHAIN_ID,
    }),
  );
  console.log(`  ${CYAN}direction ok=${dir.ok}${R}`);
  if (trip) {
    const { value: state, latencyUs } = measureSync(() =>
      evaluateAcrossBridgeTransfer(
        { amountUsd: ESCORT_USD, wallet: WALLET, initiatedAtMs: T0 },
        { nowMs: T0 + DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS + 5_000 },
      ),
    );
    printEval(state);
    assertLostUsdZero(state);
    hudSevered(BRIDGE_TIMEOUT_FAIL_CLOSED);
    hudBlocked();
    return latencyUs;
  }
  const { value: inflight } = measureSync(() =>
    evaluateAcrossBridgeTransfer(
      { amountUsd: ESCORT_USD, wallet: WALLET, initiatedAtMs: T0 },
      { nowMs: T0 + 90_000 },
    ),
  );
  printEval(inflight);
  assertLostUsdZero(inflight);
  const { value: settled, latencyUs } = measureSync(() =>
    evaluateAcrossBridgeTransfer(
      { amountUsd: ESCORT_USD, wallet: WALLET, initiatedAtMs: T0 },
      { nowMs: T0 + 180_000, settledAtMs: T0 + 150_000 },
    ),
  );
  printEval(settled);
  assertLostUsdZero(settled);
  console.log(`  ${GREEN}deployable NAV unlocked → GMX / Pendle pre-flight${R}`);
  return latencyUs;
}

function runRouteB(): void {
  hudRoute("B", ROBINHOOD_TESTNET_CHAIN_ID, HL_L1_CHAIN_ID, "Hyperliquid L1 bridge (direct)");
  const direct = validateAcrossBridgeDirection({
    sourceChainId: ROBINHOOD_TESTNET_CHAIN_ID,
    destChainId: HL_L1_CHAIN_ID,
  });
  console.log(`  ${RED}direct=${direct.ok}${R} · ${GRAY}${direct.reasons.join(" · ")}${R}`);
  console.log(`  ${CYAN}recommended: 46630 → 42161 (Pillar 2 SETTLED) → HL session hedge (Pillar 3)${R}`);
}

function runRouteC(): void {
  hudRoute("C", ARBITRUM_ONE_CHAIN_ID, BASE_CHAIN_ID, "Arbitrum One → Base");
  const outbound = validateAcrossBridgeDirection({
    sourceChainId: ARBITRUM_ONE_CHAIN_ID,
    destChainId: BASE_CHAIN_ID,
  });
  console.log(`  ${RED}pillar2=${outbound.ok}${R} · ${GRAY}${outbound.reasons.join(" · ")}${R}`);
  const aml = validateAcrossBridgeDirection({
    sourceChainId: ARBITRUM_ONE_CHAIN_ID,
    destChainId: ROBINHOOD_TESTNET_CHAIN_ID,
  });
  console.log(
    `  ${RED}inbound AML probe 42161→46630: blocked=${aml.inboundBlocked}${R} · ${aml.reasons[0] ?? ""}`,
  );
  if (aml.reasons[0] === AML_INBOUND_TO_ROBINHOOD_BLOCKED) {
    console.log(`  ${GREEN}AML_INBOUND_TO_ROBINHOOD_BLOCKED enforced${R}`);
  }
}

wrapDemoExecution(() => {
  const trip = isDemoTripArgv();
  printEscortBanner(captureEscortBenchmark());
  printMode(trip);
  const latencyUs = runRouteA(trip);
  if (!trip) {
    runRouteB();
    runRouteC();
  }
  console.log(`\n${R}escort guard · ${formatGuardTime(latencyUs)} · lostUsd invariant ✓${R}\n`);
  printEscortResult(trip);
  if (trip) return { tripped: true, reason: BRIDGE_TIMEOUT_FAIL_CLOSED };
});
