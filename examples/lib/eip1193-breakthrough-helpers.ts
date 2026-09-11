/** Shared helpers for EIP-1193 / EIP-6963 breakthrough demo CLI. */
import { keccak_256 } from "@noble/hashes/sha3";
import { CAPITAL_DEFAULT_TOTAL_VAULT_USD } from "../../src/config/capital-invariant-defaults";
import { INTENT_MAX_ATTEMPTS_DEFAULT } from "../../src/core/wasm-intent-ffi";
import {
  __resetRetailGuardStateForTests,
  announceGuardedProvider,
  evaluateRetailSoilGate,
  RetailGuardRejectedError,
  withRetailGuardProvider,
  type EIP1193Provider,
  type EIP6963EventTarget,
  type RetailGuardConfig,
} from "../../src/sdk/robinhood-agentic-retail-wallet-guard";
import { computeEffectiveMaxSlUsd, sanitizeAccountEquityUsd } from "../../src/services/effective-max-sl";
import { BOLD, CYAN, GRAY, R } from "../adapters/citadel-ansi-hud";
import { formatLatencyLabel, measureProbe } from "./demo-timing";

export const EIP1193_DEMO = {
  wallet: "0x1111111111111111111111111111111111111111",
  gmx: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  usdc: "0xaf88d065e77c1c973b2696121c3f3f3f3f3f3f3f3f",
  malicious: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  trusted: "0xdddddddddddddddddddddddddddddddddddddddd",
  permit2: "0x000000000022d473030f116ddee9f6b43ac78b6",
  rdns: "com.slivervine.citadel",
  arbChainId: 42161,
  boxW: 64,
} as const;

export function truncateAddr(addr: string): string {
  return `${addr.slice(0, 8)}...`;
}

export function deriveTripEvtHash(nowMs: number, code: string): string {
  return `0x${Buffer.from(keccak_256(new TextEncoder().encode(`RiskTripBlocked:${code}:${nowMs}`))).toString("hex")}`;
}

export function resolveCapitalProtectedUsd(): number {
  return computeEffectiveMaxSlUsd(
    sanitizeAccountEquityUsd(process.env.CITADEL_DEMO_EQUITY_USD ?? CAPITAL_DEFAULT_TOTAL_VAULT_USD),
  );
}

export function demoConfig(overrides: Partial<RetailGuardConfig> = {}): RetailGuardConfig {
  const d = EIP1193_DEMO;
  return {
    walletAddress: d.wallet,
    allowedVenueMask: 0b1111,
    allowedVenues: [d.gmx, d.usdc, d.permit2].map((a) => a.toLowerCase()),
    allowedSpenders: [d.trusted.toLowerCase()],
    contractVenueIndex: { [d.gmx.toLowerCase()]: 0, [d.usdc.toLowerCase()]: 1, [d.permit2.toLowerCase()]: 2 },
    maxApprovalUsd: 10_000,
    approvalTokenPriceUsd: 1,
    approvalTokenDecimals: 18,
    soilQuote: {
      hlSpot: 3500,
      hlPerp: 3500,
      dydxPerp: 3498.25,
      depthUsd: 500_000,
      maxSlippage: 0.005,
      minDepthUsd: 100_000,
    },
    preferWasm: false,
    ...overrides,
  };
}

export function printBreakthroughBanner(): void {
  const t1 = "🛡️  SliverVine Citadel Shield · Universal EIP-1193 / EIP-6963 Retail Guard";
  const w = EIP1193_DEMO.boxW;
  console.log(`${CYAN}┌${"─".repeat(w)}┐${R}\n${CYAN}│${R}${BOLD} ${t1.padEnd(w - 1)}${R}${CYAN}│${R}\n${CYAN}└${"─".repeat(w)}┘${R}`);
  console.log(`${GRAY}⚡ INDUSTRY'S FIRST EDGE-WASM PRE-CONSENSUS 0-GAS PROVIDER MIDDLEWARE${R}\n`);
}

export function printEip6963Discovery(): void {
  console.log(`[EIP-6963 DISCOVERY] Announcing Guarded Provider -> rdns: "${EIP1193_DEMO.rdns}"`);
}

export function wrapGuarded(base: EIP1193Provider, cfg: RetailGuardConfig): EIP1193Provider {
  const target: EIP6963EventTarget = { dispatchEvent: () => true, addEventListener: () => {} };
  return announceGuardedProvider(base, cfg, { rdns: EIP1193_DEMO.rdns, target });
}

export function buildPhishingTypedData(): string {
  return JSON.stringify({
    domain: {
      name: "Permit",
      version: "1",
      chainId: EIP1193_DEMO.arbChainId,
      verifyingContract: EIP1193_DEMO.malicious,
    },
    types: { Permit: [{ name: "spender", type: "address" }] },
    primaryType: "Permit",
    message: { spender: EIP1193_DEMO.malicious },
  });
}

export function measureWasmSoilUs(cfg: RetailGuardConfig): number {
  const quote = cfg.soilQuote!;
  return measureProbe(() => evaluateRetailSoilGate(quote, cfg.preferWasm !== false));
}

export function printPayloadBox(chainId: number, wasmUs: number, clean: boolean): void {
  const w = EIP1193_DEMO.boxW;
  console.log(`${CYAN}┌${"─".repeat(w)}┐${R}`);
  console.log(`${CYAN}│${R} PAYLOAD PARSER: ERC-20 Approve / GMX GM Deposit`);
  console.log(`${CYAN}│${R} EIP-712 DOMAIN: ChainId: ${chainId} (Arbitrum One) | Verifier: Verified`);
  console.log(
    `${CYAN}│${R} WASM REFLEX: p50 ${formatLatencyLabel(wasmUs)} Soil Check -> ${clean ? "CLEAN (0-Gas Allowed)" : "TRIP"}`,
  );
  console.log(`${CYAN}└${"─".repeat(w)}┘${R}`);
}

export async function probeChannelSever(cfg: RetailGuardConfig): Promise<number> {
  __resetRetailGuardStateForTests();
  const guarded = withRetailGuardProvider({ request: async () => "0x1" }, cfg);
  const params = [{ from: EIP1193_DEMO.wallet, to: EIP1193_DEMO.gmx, value: "0x0" }];
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
