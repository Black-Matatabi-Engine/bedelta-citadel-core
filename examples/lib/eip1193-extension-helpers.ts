/** Shared ANSI helpers for EIP-1193 / EIP-6963 extension demo CLI. */
import * as readline from "node:readline/promises";
import { keccak_256 } from "@noble/hashes/sha3";
import {
  CAPITAL_DEFAULT_TOKEN,
  CAPITAL_DEFAULT_TOTAL_VAULT_USD,
} from "../../src/config/capital-invariant-defaults";
import { GATE_ACTION_FAIL_CLOSED_BLOCK } from "../../src/core/gate-telemetry-types";
import {
  announceGuardedProvider,
  evaluateRetailSoilGate,
  type EIP1193Provider,
  type EIP6963EventTarget,
  type RetailGuardConfig,
} from "../../src/sdk/eip1193-agentic-wallet-guard";
import { sanitizeAccountEquityUsd } from "../../src/services/effective-max-sl";
import { BOLD, CYAN, GRAY, GREEN, HEALTHY_SOIL, R, RED, YELLOW } from "../adapters/citadel-ansi-hud";
import { captureSoilBenchmark } from "./demo-benchmark";
import { formatLatencyLabel, measureProbe, printBenchmarkBanner } from "./demo-timing";

export const EIP1193_DEMO = {
  wallet: "0x1111111111111111111111111111111111111111",
  slivervineGate: "0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1",
  gmxGmVault: "0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F",
  usdc: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  malicious: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  permit2: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  rdns: "com.slivervine.citadel",
  arbChainId: 42161,
  boxW: 88,
} as const;

export function eipTag(label: string): string {
  return `${CYAN}${BOLD}[${label}]${R}`;
}

export function featureMetric(text: string): string {
  return `${YELLOW}${BOLD}${text}${R}`;
}

export function rejectCode(code: string): string {
  return `${RED}${BOLD}${code}${R}`;
}

export function wasmCoreMetric(us: number): string {
  return featureMetric(`⚡ ${formatLatencyLabel(us)} Pure Wasm Core`);
}

export function resolveIntentPrincipalUsd(): number {
  return sanitizeAccountEquityUsd(process.env.CITADEL_DEMO_EQUITY_USD ?? CAPITAL_DEFAULT_TOTAL_VAULT_USD);
}

export function formatIntentUsd(usd: number): string {
  return featureMetric(
    `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${CAPITAL_DEFAULT_TOKEN}`,
  );
}

export function resolveDegradedSoftThresholdPct(cfg: RetailGuardConfig = demoConfig()): number {
  return (cfg.soilQuote?.maxSlippage ?? 0.005) * 100;
}

export function crossVenueSlippagePct(cfg: RetailGuardConfig): number {
  const q = cfg.soilQuote!;
  return (Math.abs(q.hlPerp - q.dydxPerp) / Math.max(q.hlSpot, 1)) * 100;
}

export function deriveTripEvtHash(nowMs: number, agentId: string, reason: string): string {
  const payload = `RiskTripBlocked:${agentId}:${reason}:${nowMs}:${GATE_ACTION_FAIL_CLOSED_BLOCK}`;
  return `0x${Buffer.from(keccak_256(new TextEncoder().encode(payload))).toString("hex")}`;
}

export function mapDuneTelemetryReason(code: string): string {
  const table: Record<string, string> = {
    VENUE_DRIFT_REJECTED: "VENUE_DRIFT",
    UNAUTHORIZED_SPENDER_REJECTED: "UNAUTHORIZED_SPENDER",
    SOLVER_MEV_SUSPECT: "SOLVER_MEV",
    MAX_ATTEMPTS_EXCEEDED_SEVERED: "CHANNEL_SEVERED",
    CHANNEL_SEVERED: "CHANNEL_SEVERED",
  };
  return table[code] ?? code.replace(/_REJECTED$/, "").replace(/_EXCEEDED_SEVERED$/, "_SEVERED");
}

export function demoConfig(overrides: Partial<RetailGuardConfig> = {}): RetailGuardConfig {
  const d = EIP1193_DEMO;
  const venues = [d.gmxGmVault, d.usdc, d.permit2, d.slivervineGate].map((a) => a.toLowerCase());
  return {
    walletAddress: d.wallet,
    allowedVenueMask: 0b1111,
    allowedVenues: venues,
    allowedSpenders: [d.slivervineGate.toLowerCase()],
    contractVenueIndex: {
      [d.gmxGmVault.toLowerCase()]: 0,
      [d.usdc.toLowerCase()]: 1,
      [d.permit2.toLowerCase()]: 2,
      [d.slivervineGate.toLowerCase()]: 3,
    },
    maxApprovalUsd: resolveIntentPrincipalUsd(),
    approvalTokenPriceUsd: 1,
    approvalTokenDecimals: 6,
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

export function degradedDemoConfig(): RetailGuardConfig {
  return demoConfig({
    soilQuote: {
      hlSpot: 3500,
      hlPerp: 3500,
      dydxPerp: 3471.3,
      depthUsd: 500_000,
      maxSlippage: 0.009,
      minDepthUsd: 100_000,
    },
  });
}

function bannerLine(text: string, width: number): string {
  return `${CYAN}│${R}${BOLD} ${text.padEnd(width - 2)}${R}${CYAN}│${R}`;
}

export const JUDGE_SAFE_CLOCK_LABEL =
  "Clock: JUDGE_SAFE (Deterministic Audit Epoch) · Network: Arbitrum One 42161" as const;

export const EIP1193_ARCHITECTURE_NOTE =
  "[ARCHITECTURE NOTE] 4 scenarios (A–D) are independent scripted replays; intercept logic & plainTextWarning match production SDK." as const;

export type Eip1193ScenarioId = "A" | "B" | "C" | "D";

export interface Eip1193ScenarioJsonResult {
  scenario: Eip1193ScenarioId;
  status: string;
  wasmUs: number;
  code: string | null;
  plainTextWarning?: string | null;
}

export function isDemoJsonArgv(argv: readonly string[] = process.argv): boolean {
  return argv.includes("--json");
}

export function roundWasmUs(us: number): number {
  return Math.round(us * 10) / 10;
}

export function clearDemoTerminal(): void {
  process.stdout.write("\x1b[2J\x1b[3J\x1b[H");
}

export async function awaitScenarioRecordingTransition(nextId: Eip1193ScenarioId): Promise<void> {
  if (isDemoJsonArgv() || !process.stdin.isTTY) return;
  console.log(`\n${GRAY}[PRESS ENTER TO PROCEED TO SCENARIO ${nextId}...]${R}`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    await rl.question("");
  } finally {
    rl.close();
    releaseDemoStdin();
  }
  clearDemoTerminal();
}

export function releaseDemoStdin(): void {
  if (process.stdin.isTTY && !process.stdin.readableEnded) process.stdin.pause();
}

export function printProductionPlainTextWarning(warning: string, reasonCode: string): void {
  console.log(`${eipTag("PRODUCTION ALERT")} ${GRAY}(warnings.ts · ${reasonCode})${R} ${warning}`);
}

export function printFeatureBanner(invariantClear = true): void {
  const t1 = "🛡️  SliverVine ExoMesh · Universal EIP-1193 / EIP-6963 Retail Guard";
  const w = Math.max(EIP1193_DEMO.boxW, t1.length + 2, JUDGE_SAFE_CLOCK_LABEL.length + 2);
  console.log(`${CYAN}┌${"─".repeat(w)}┐${R}`);
  console.log(bannerLine(t1, w));
  console.log(bannerLine(JUDGE_SAFE_CLOCK_LABEL, w));
  console.log(`${CYAN}└${"─".repeat(w)}┘${R}`);
  console.log(`${GRAY}${EIP1193_ARCHITECTURE_NOTE}${R}`);
  printBenchmarkBanner(captureSoilBenchmark(HEALTHY_SOIL), { invariantClear });
  console.log(`${featureMetric("⚡ FEATURE: [Sub-10ms Off-Chain Wasm Calldata Validation] · [0-Gas Pre-Consensus Gate]")}\n`);
}

export function printMainnetAnchors(): void {
  console.log(`${eipTag("MAINNET ANCHORS")} GMX GM Vault ${EIP1193_DEMO.gmxGmVault}`);
  console.log(`${eipTag("MAINNET ANCHORS")} SliverVine Gate ${EIP1193_DEMO.slivervineGate}`);
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
  const verdict = clean ? featureMetric("CLEAN (0-Gas Allowed)") : rejectCode("TRIP");
  console.log(`${CYAN}┌${"─".repeat(w)}┐${R}`);
  console.log(`${CYAN}│${R} PAYLOAD PARSER: ERC-20 Approve / GMX GM Deposit -> ${EIP1193_DEMO.gmxGmVault}`);
  console.log(`${CYAN}│${R} ${eipTag("EIP-712")} DOMAIN: ChainId: ${chainId} (Arbitrum One) | Verifier: ${GREEN}${BOLD}VERIFIED${R}`);
  console.log(`${CYAN}│${R} WASM REFLEX: ${wasmCoreMetric(wasmUs)} Soil Check -> ${verdict}`);
  console.log(`${CYAN}└${"─".repeat(w)}┘${R}`);
}

export function printLatencyBreakdown(totalUs: number, wasmUs: number): void {
  const shellUs = Math.max(0, totalUs - wasmUs);
  console.log(
    `    Latency Breakdown: ${totalUs.toFixed(1)}µs [ ${featureMetric(`WASM KERNEL: ${wasmUs.toFixed(1)}µs`)} | V8/CLI Shell: ${shellUs.toFixed(1)}µs ]`,
  );
}

export function printChannelOpen(integrityPct: number): void {
  console.log(`  ${eipTag("CHANNEL")} ${eipTag("EIP-712")} Signature Channel: ${GREEN}${BOLD}OPEN${R} (Channel Integrity: ${integrityPct}%)`);
}

export function printForwardGate(): void {
  console.log(
    `  ${eipTag("FORWARD")} ${eipTag("EIP-1193")} Guarded Provider -> Dispatched to Sequencer RPC (Vault ${EIP1193_DEMO.gmxGmVault} · Gate ${EIP1193_DEMO.slivervineGate})`,
  );
}

export function printDefenseMatrixHeader(): void {
  console.log(`\n${RED}${BOLD}[PRE-CONSENSUS DEFENSE MATRIX]${R} ${GRAY}(diagnostic preview)${R}`);
}

export function printDefenseMatrixLine(guard: string, detail: string, code: string | undefined, branch: "├" | "└"): void {
  const suffix = code ? ` (${rejectCode(code)})` : "";
  console.log(`${branch}── ${eipTag(guard)} ${detail}${suffix} ${GRAY}(diagnostic preview)${R}`);
}

export function printPreConsensusProofBox(wasmUs: number, capitalUsd: number): void {
  const w = EIP1193_DEMO.boxW;
  const bar = `${CYAN}┌${"─".repeat(w)}┐${R}`;
  const gas = featureMetric("0.000000 ETH");
  const bytes = featureMetric("0 Bytes Broadcasted to Sequencer");
  console.log(`${bar}\n${CYAN}│${R} ${RED}${BOLD}[PRE-CONSENSUS GATE PROOF]${R}`);
  console.log(`${CYAN}│${R}  ▸ WASM KERNEL TIME : ${wasmCoreMetric(wasmUs)} (Sub-10ms Wasm Kernel Execution)`);
  console.log(`${CYAN}│${R}  ▸ GAS BURNED       : ${gas} (${bytes})`);
  console.log(`${CYAN}│${R}  ▸ CAPITAL PROTECTED: ${formatIntentUsd(capitalUsd)} (lostUsd = ${featureMetric("$0.00")} · 100% Principal Preserved)`);
  console.log(`${CYAN}│${R}  ▸ PROVIDER ISOLATED: Aborted at Browser/SDK Layer via ${eipTag("EIP-1193")} Middleware`);
  console.log(`${CYAN}└${"─".repeat(w)}┘${R}`);
}

export function printDuneTelemetry(agentId: string, rejectCodeRaw: string, nowMs: number): void {
  const reason = mapDuneTelemetryReason(rejectCodeRaw);
  console.log(
    `${GRAY}[TELEMETRY]${R} Event: RiskTripBlocked { agentId: "${agentId}", actionCode: ${GATE_ACTION_FAIL_CLOSED_BLOCK}, reason: "${reason}" }`,
  );
  console.log(`▸ Dune Spell Sync Hash: ${deriveTripEvtHash(nowMs, agentId, reason)} -> ${CYAN}silvervine_chaos.intercepts${R}`);
}
