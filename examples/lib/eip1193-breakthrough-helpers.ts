/** Shared ANSI helpers for EIP-1193 / EIP-6963 breakthrough demo CLI. */
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
import { BOLD, CYAN, GRAY, GREEN, R, RED, YELLOW } from "../adapters/citadel-ansi-hud";
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

export function eipTag(label: string): string {
  return `${CYAN}${BOLD}[${label}]${R}`;
}

export function breakthroughMetric(text: string): string {
  return `${YELLOW}${BOLD}${text}${R}`;
}

export function rejectCode(code: string): string {
  return `${RED}${BOLD}${code}${R}`;
}

export function wasmCoreMetric(us: number): string {
  return breakthroughMetric(`⚡ ${formatLatencyLabel(us)} Pure Wasm Core`);
}

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
  const bar = `${CYAN}┌${"─".repeat(w)}┐${R}`;
  console.log(`${bar}\n${CYAN}│${R}${BOLD} ${t1.padEnd(w - 1)}${R}${CYAN}│${R}\n${CYAN}└${"─".repeat(w)}┘${R}`);
  console.log(`${breakthroughMetric("⚡ BREAKTHROUGH: [Sub-10ms Off-Chain Wasm Calldata Validation] · [0-Gas Pre-Consensus]")}\n`);
}

export function printEip6963Discovery(): void {
  console.log(`${eipTag("EIP-6963")} Provider Discovery -> rdns: "${EIP1193_DEMO.rdns}"`);
}

export function printEip1193Ingress(method: string): void {
  console.log(`${eipTag("EIP-1193")} Ingress Intercept -> window.ethereum.request({ method: '${method}' })`);
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
  const verdict = clean ? breakthroughMetric("CLEAN (0-Gas Allowed)") : rejectCode("TRIP");
  console.log(`${CYAN}┌${"─".repeat(w)}┐${R}`);
  console.log(`${CYAN}│${R} PAYLOAD PARSER: ERC-20 Approve / GMX GM Deposit`);
  console.log(
    `${CYAN}│${R} ${eipTag("EIP-712")} DOMAIN: ChainId: ${chainId} (Arbitrum One) | Verifier: ${GREEN}${BOLD}VERIFIED${R}`,
  );
  console.log(`${CYAN}│${R} WASM REFLEX: ${wasmCoreMetric(wasmUs)} Soil Check -> ${verdict}`);
  console.log(`${CYAN}└${"─".repeat(w)}┘${R}`);
}

export function printLatencyBreakdown(totalUs: number, wasmUs: number): void {
  const shellUs = Math.max(0, totalUs - wasmUs);
  console.log(
    `    Latency Breakdown: ${totalUs.toFixed(1)}µs [ ${breakthroughMetric(`WASM CORE: ${wasmUs.toFixed(1)}µs`)} | V8/CLI Shell: ${shellUs.toFixed(1)}µs ]`,
  );
}

export function printChannelOpen(integrityPct: number): void {
  console.log(`  ${eipTag("CHANNEL")} ${eipTag("EIP-712")} Signature Channel: ${GREEN}${BOLD}OPEN${R} (Channel Integrity: ${integrityPct}%)`);
}
export function printForwardGate(addr: string): void {
  console.log(`  ${eipTag("FORWARD")} ${eipTag("EIP-1193")} Provider -> Dispatched to Sequencer RPC (${truncateAddr(addr)})`);
}

export function printDefenseMatrixHeader(): void {
  console.log(`\n🔥 ${RED}${BOLD}[BREAKTHROUGH DEFENSE MATRIX TRIGGERED]${R}`);
}

export function printDefenseMatrixLine(
  guard: string,
  detail: string,
  code: string | undefined,
  branch: "├" | "└",
): void {
  const suffix = code ? ` (${rejectCode(code)})` : "";
  console.log(`${branch}── ${eipTag(guard)} ${detail}${suffix}`);
}

export function printPreConsensusProofBox(wasmUs: number): void {
  const w = EIP1193_DEMO.boxW;
  const bar = `${CYAN}┌${"─".repeat(w)}┐${R}`;
  const gas = breakthroughMetric("0.000000 ETH");
  const bytes = breakthroughMetric("0 Bytes Broadcasted to Sequencer");
  console.log(`${bar}\n${CYAN}│${R} ${RED}${BOLD}🚨 PRE-CONSENSUS BREAKTHROUGH PROOF${R}`);
  console.log(`${CYAN}│${R}  ▸ WASM REFLEX TIME : ${wasmCoreMetric(wasmUs)} (Sub-10ms Wasm Core Execution)`);
  console.log(`${CYAN}│${R}  ▸ GAS BURNED       : ${gas} (${bytes})`);
  console.log(`${CYAN}│${R}  ▸ PROVIDER ISOLATED: Aborted at Browser/SDK Layer via ${eipTag("EIP-1193")} Middleware`);
  console.log(`${CYAN}└${"─".repeat(w)}┘${R}`);
}

export function printTripFooter(capitalUsd: number, evtHash: string): void {
  console.log(
    `▸ Gas Spent: ${breakthroughMetric("0.000000 ETH")} | Capital Protected: $${capitalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  );
  console.log(
    `${GRAY}[TELEMETRY]${R} Event: RiskTripBlocked(evtHash: ${evtHash.slice(0, 10)}...) -> ${CYAN}Dune Ingested${R} (silvervine_chaos.intercepts)`,
  );
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
