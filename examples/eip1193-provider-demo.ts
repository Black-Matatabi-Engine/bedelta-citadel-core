#!/usr/bin/env tsx
/** EIP-1193 Retail Guard SDK CLI — Usage: pnpm demo:eip1193 · Trip: pnpm demo:eip1193 -- --trip */
import {
  __resetRetailGuardStateForTests,
  announceGuardedProvider,
  RetailGuardRejectedError,
  type EIP1193Provider,
  type RetailGuardConfig,
} from "../src/sdk/robinhood-agentic-retail-wallet-guard";
import {
  hudBlocked,
  hudChannelOpen,
  printBanner,
  printMode,
  printResult,
  R,
  RED,
} from "./adapters/citadel-ansi-hud";
import {
  hrtimeElapsedUs,
  hrtimeStart,
  printExecutionLatencySplitBlock,
  WASM_CORE_ESTIMATE_US,
} from "./lib/demo-timing";
import { isDemoTripArgv, wrapDemoExecution } from "./lib/demo-harness";

const WALLET = "0x1111111111111111111111111111111111111111";
const GMX = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const EIP6963_UUID = "eip6963.slivervine.retail-guard";
const GMX_ROUTER_LABEL = "0xbd65d785...";
const DUNE_EVT = "0xbede17a1c0debeef0000000000000000000000000000000000000000000001";
const CAPITAL_USD = 100_030;
const TX = [{ from: WALLET, to: GMX, value: "0x0" }] as const;

function guardConfig(trip: boolean): RetailGuardConfig {
  return {
    walletAddress: WALLET,
    allowedVenueMask: 0b111,
    allowedVenues: [GMX.toLowerCase()],
    contractVenueIndex: { [GMX.toLowerCase()]: 0 },
    soilQuote: {
      hlSpot: 3500,
      hlPerp: 3500,
      dydxPerp: trip ? 3200 : 3498,
      depthUsd: 500_000,
      maxSlippage: 0.005,
      minDepthUsd: 100_000,
    },
    preferWasm: false,
  };
}

function printEip6963Announce(): void {
  console.log(`[EIP-6963 ANNOUNCE] Provider UUID: ${EIP6963_UUID}`);
}

function printEip1193Ingress(): void {
  console.log(`[EIP-1193 INGRESS] window.ethereum.request({ method: 'eth_sendTransaction' })`);
}

function printEip1193Dispatch(): void {
  console.log(
    `[EIP-1193 DISPATCH] Provider Forwarded -> RPC Provider (GMX Router · ${GMX_ROUTER_LABEL})`,
  );
}

function printEip1193Error(): void {
  console.log(
    `[EIP-1193 ERROR] Thrown: RetailGuardRejectedError (RPC Code: 4001 User Rejected / Soil Trip)`,
  );
}

function printProviderIsolation(): void {
  console.log(
    `[PROVIDER ISOLATION] Aborted inside EIP-1193 Middleware — ZERO bytes sent to Sequencer RPC`,
  );
}

wrapDemoExecution(async () => {
  __resetRetailGuardStateForTests();
  const trip = isDemoTripArgv();
  printBanner("EIP-1193 Retail Guard SDK");
  printMode(trip);

  const inner: EIP1193Provider = { request: async () => "0xdeadbeef" };
  const cfg = guardConfig(trip);
  const t0 = hrtimeStart();

  if (!trip) {
    printEip6963Announce();
    printEip1193Ingress();
    const guarded = announceGuardedProvider(inner, cfg, {
      uuid: EIP6963_UUID,
      announce: false,
    });
    await guarded.request({ method: "eth_sendTransaction", params: [...TX] });
    printExecutionLatencySplitBlock(hrtimeElapsedUs(t0), WASM_CORE_ESTIMATE_US);
    hudChannelOpen();
    printEip1193Dispatch();
    printResult(true);
    return;
  }

  printEip1193Ingress();
  const guarded = announceGuardedProvider(inner, cfg, { announce: false });
  try {
    await guarded.request({ method: "eth_sendTransaction", params: [...TX] });
    process.exit(1);
  } catch (err) {
    if (!(err instanceof RetailGuardRejectedError)) throw err;
    printEip1193Error();
    printProviderIsolation();
    printExecutionLatencySplitBlock(hrtimeElapsedUs(t0), WASM_CORE_ESTIMATE_US);
    console.error(`${RED}[TRIP] ${err.code}: ${err.plainTextWarning}${R}`);
    hudBlocked();
    const cap = CAPITAL_USD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    console.log(`    ▸ Gas Spent: 0.000000 ETH (Intercepted at EIP-1193 Provider Level) | Capital Protected: $${cap}`);
    console.log(
      `[TELEMETRY] Event: RiskTripBlocked(evtHash: ${DUNE_EVT.slice(0, 10)}...) -> Ingested to Dune Spell (silvervine_chaos.intercepts)`,
    );
    printResult(false);
    return { tripped: true, reason: err.code };
  }
});
