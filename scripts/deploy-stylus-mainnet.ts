#!/usr/bin/env tsx
/**
 * Arbitrum One (42161) — SliverVineSoilCoprocessor Stylus compile check + optional deploy.
 * Dry-run: pnpm tsx scripts/deploy-stylus-mainnet.ts
 * Live: CONFIRM_STYLUS_MAINNET=YES BROADCAST=1 MAINNET_PK=0x… ARB_MAINNET_RPC_URL=…
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Hex } from "viem";
import { deployStylusWasmViaViem, resolveStylusDeployFees } from "../src/services/adapters/stylus-viem-deploy";
import { loadWasmInitcode } from "../src/services/adapters/stylus-wasm-initcode";
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { loadEnvProduction } from "./_shared/mainnet-env";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STYLUS_DIR = join(ROOT, "contracts/stylus-probe");
const WASM_PATH = join(STYLUS_DIR, "target/wasm32-unknown-unknown/release/slivervine_soil_probe.wasm");
const CHAIN_ID = 42161;
const DEFAULT_RPC = "https://arb1.arbitrum.io/rpc";

function run(cmd: string, args: string[], cwd = STYLUS_DIR, env = process.env): { ok: boolean; output: string } {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", env });
  const output = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  return { ok: r.status === 0, output };
}

function stylusEnv(rpc: string): NodeJS.ProcessEnv {
  return { ...process.env, STYLUS_ENDPOINT: rpc, STYLUS_RPC_URL: rpc, RPC_URL: rpc };
}

function armed(): boolean {
  return process.env.BROADCAST === "1" && process.env.CONFIRM_STYLUS_MAINNET === "YES";
}

function resolveRpc(): string {
  return (process.env.ARB_MAINNET_RPC_URL ?? DEFAULT_RPC).trim();
}

function resolvePk(): Hex {
  const pk = (process.env.MAINNET_PK ?? process.env.PRIVATE_KEY ?? "").trim();
  if (!pk.startsWith("0x")) throw new Error("MAINNET_PK or PRIVATE_KEY required for deploy");
  return pk as Hex;
}

function verifyCompileChain(): void {
  const tests = run("cargo", ["test", "stylus_core", "--release", "--quiet"]);
  if (!tests.ok) {
    console.error("[stylus:mainnet] cargo test stylus_core FAILED\n", tests.output);
    process.exit(1);
  }
  const wasm = run("cargo", ["build", "--target", "wasm32-unknown-unknown", "--release", "--quiet"]);
  if (!wasm.ok) {
    console.error("[stylus:mainnet] wasm32 build FAILED\n", wasm.output);
    process.exit(1);
  }
  console.log("[stylus:mainnet] cargo test stylus_core + wasm32 release build: PASS");
}

function verifyStylusCheck(rpc: string): void {
  const version = run("cargo", ["stylus", "--version"]);
  if (!version.ok) {
    console.warn("[stylus:mainnet] cargo-stylus CLI unavailable — compile chain verified; install cargo-stylus for on-chain check");
    return;
  }
  const check = run(
    "cargo",
    ["stylus", "check", "--endpoint", rpc, "--wasm-file", WASM_PATH],
    STYLUS_DIR,
    stylusEnv(rpc),
  );
  if (!check.ok) {
    console.error("[stylus:mainnet] cargo stylus check FAILED\n", check.output);
    process.exit(1);
  }
  console.log("[stylus:mainnet] cargo stylus check: PASS", { chainId: CHAIN_ID, endpoint: rpc, cli: version.output.split("\n")[0] });
}

async function main(): Promise<void> {
  try { loadEnvProduction(); } catch { /* optional */ }
  const rpc = resolveRpc();
  console.log("[stylus:mainnet] preflight", { chainId: CHAIN_ID, stylusDir: STYLUS_DIR, wasm: WASM_PATH, rpc });
  verifyCompileChain();
  if (!existsSync(WASM_PATH)) {
    console.error("[stylus:mainnet] wasm artifact missing:", WASM_PATH);
    process.exit(1);
  }
  verifyStylusCheck(rpc);

  const client = createPublicClient({ chain: arbitrum, transport: http(rpc) });
  const fees = await resolveStylusDeployFees(client);
  const initcode = loadWasmInitcode(WASM_PATH);
  console.log("[stylus:mainnet] gas quote", {
    maxFeePerGas: fees.maxFeePerGas.toString(),
    maxPriorityFeePerGas: fees.maxPriorityFeePerGas.toString(),
    initcodeBytes: (initcode.length - 2) / 2,
    buffer: "max(rpcMax×2, 0.15 gwei) cap; priority min(0.01 gwei, maxFee/10)",
  });

  if (!armed()) {
    console.log("[stylus:mainnet] dry-run — set CONFIRM_STYLUS_MAINNET=YES BROADCAST=1 MAINNET_PK=0x… to deploy");
    return;
  }
  const result = await deployStylusWasmViaViem({ rpc, privateKey: resolvePk(), wasmPath: WASM_PATH });
  console.log("[stylus:mainnet] Stylus Deployed Contract Address:", result.contractAddress);
  console.log("[stylus:mainnet] Deployment Transaction Hash:", result.deployTxHash);
  console.log("[stylus:mainnet] Activation Transaction Hash:", result.activateTxHash);
  console.log("[stylus:mainnet] deploy broadcast OK", {
    chainId: CHAIN_ID,
    contract: result.contractAddress,
    tx: result.deployTxHash,
    activateTx: result.activateTxHash,
    arbiscan: `https://arbiscan.io/tx/${result.deployTxHash}`,
  });
}

main().catch((err) => { console.error("[stylus:mainnet] fail-closed", err); process.exit(1); });
