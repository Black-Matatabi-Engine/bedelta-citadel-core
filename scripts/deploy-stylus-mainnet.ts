#!/usr/bin/env tsx
/**
 * Arbitrum One (42161) — SliverVineSoilCoprocessor Stylus compile check + optional deploy.
 * Dry-run: pnpm tsx scripts/deploy-stylus-mainnet.ts
 * Live: CONFIRM_STYLUS_MAINNET=YES BROADCAST=1 MAINNET_PK=0x… ARB_MAINNET_RPC_URL=…
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { loadEnvProduction } from "./_shared/mainnet-env";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STYLUS_DIR = join(ROOT, "contracts/stylus-probe");
const WASM_REL = "target/wasm32-unknown-unknown/release/slivervine_soil_probe.wasm";
const CHAIN_ID = 42161;
const DEFAULT_RPC = "https://arb1.arbitrum.io/rpc";
const GAS_BUFFER_NUM = 150n;
const GAS_BUFFER_DEN = 100n;
const DEPLOY_RETRIES = 2;

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

function resolvePk(): string {
  const pk = (process.env.MAINNET_PK ?? process.env.PRIVATE_KEY ?? "").trim();
  if (!pk.startsWith("0x")) throw new Error("MAINNET_PK or PRIVATE_KEY required for deploy");
  return pk;
}

function weiToGweiCeil(wei: bigint): string {
  return ((wei + 999_999_999n) / 1_000_000_000n).toString();
}

function isGasPriceError(output: string): boolean {
  const msg = output.toLowerCase();
  return msg.includes("basefee") || msg.includes("base fee") || msg.includes("maxfeepergas")
    || msg.includes("gas price") || msg.includes("fee cap") || msg.includes("underpriced");
}

/** RPC baseFee × 1.5 buffer — avoids cargo-stylus tx rejection when baseFee spikes. */
export async function resolveStylusMaxFeeGwei(rpc: string): Promise<{ gwei: string; baseFeeWei: string; maxFeeWei: string }> {
  const override = process.env.STYLUS_MAX_FEE_GWEI?.trim();
  if (override) {
    return { gwei: override, baseFeeWei: "0", maxFeeWei: String(BigInt(override) * 1_000_000_000n) };
  }
  const client = createPublicClient({ chain: arbitrum, transport: http(rpc) });
  const [block, fees] = await Promise.all([
    client.getBlock({ blockTag: "latest" }),
    client.estimateFeesPerGas(),
  ]);
  const baseFee = block.baseFeePerGas ?? fees.maxFeePerGas ?? 1n;
  const buffered = (baseFee * GAS_BUFFER_NUM) / GAS_BUFFER_DEN;
  const rpcMax = fees.maxFeePerGas ?? 0n;
  const maxFee = buffered > rpcMax ? buffered : (rpcMax * GAS_BUFFER_NUM) / GAS_BUFFER_DEN;
  return { gwei: weiToGweiCeil(maxFee), baseFeeWei: baseFee.toString(), maxFeeWei: maxFee.toString() };
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
  const check = run("cargo", ["stylus", "check", "--endpoint", rpc], STYLUS_DIR, stylusEnv(rpc));
  if (!check.ok) {
    console.error("[stylus:mainnet] cargo stylus check FAILED\n", check.output);
    process.exit(1);
  }
  console.log("[stylus:mainnet] cargo stylus check: PASS", { chainId: CHAIN_ID, endpoint: rpc, cli: version.output.split("\n")[0] });
}

function runStylusDeploy(rpc: string, pk: string, gasGwei: string): { ok: boolean; output: string } {
  return run(
    "cargo",
    ["stylus", "deploy", "--endpoint", rpc, "--private-key", pk, "--no-verify", "--wasm-file", WASM_REL, "--max-fee-per-gas-gwei", gasGwei],
    STYLUS_DIR,
    stylusEnv(rpc),
  );
}

async function deployStylus(rpc: string, pk: string): Promise<void> {
  let lastOutput = "";
  for (let attempt = 1; attempt <= DEPLOY_RETRIES; attempt++) {
    const gas = await resolveStylusMaxFeeGwei(rpc);
    console.log("[stylus:mainnet] gas preflight", {
      attempt, baseFeeWei: gas.baseFeeWei, maxFeeGwei: gas.gwei, maxFeeWei: gas.maxFeeWei, buffer: "1.5x",
    });
    const deploy = runStylusDeploy(rpc, pk, gas.gwei);
    lastOutput = deploy.output;
    if (deploy.ok) {
      const txMatch = deploy.output.match(/deployment tx hash:\s*[^\n]*?(0x[a-fA-F0-9]{64})/i)
        ?? deploy.output.match(/0x[a-fA-F0-9]{64}/g);
      const addrMatch = deploy.output.match(/deployed code at address:\s*[^\n]*?(0x[a-fA-F0-9]{40})/i)
        ?? deploy.output.match(/0x[a-fA-F0-9]{40}/g);
      const tx = Array.isArray(txMatch) ? txMatch[txMatch.length - 1] : txMatch?.[1] ?? null;
      const contract = Array.isArray(addrMatch) ? addrMatch[addrMatch.length - 1] : addrMatch?.[1] ?? null;
      console.log("[stylus:mainnet] deploy broadcast OK", {
        chainId: CHAIN_ID, tx, contract, maxFeeGwei: gas.gwei,
        arbiscan: tx ? `https://arbiscan.io/tx/${tx}` : null, output: deploy.output,
      });
      return;
    }
    if (attempt < DEPLOY_RETRIES && isGasPriceError(deploy.output)) {
      console.warn("[stylus:mainnet] gas price rejected — refreshing RPC baseFee and retrying");
      continue;
    }
    break;
  }
  console.error("[stylus:mainnet] cargo stylus deploy FAILED\n", lastOutput);
  process.exit(1);
}

async function main(): Promise<void> {
  try { loadEnvProduction(); } catch { /* optional */ }
  const rpc = resolveRpc();
  console.log("[stylus:mainnet] preflight", { chainId: CHAIN_ID, stylusDir: STYLUS_DIR, rpc });
  verifyCompileChain();
  verifyStylusCheck(rpc);

  const gas = await resolveStylusMaxFeeGwei(rpc);
  console.log("[stylus:mainnet] gas quote", { baseFeeWei: gas.baseFeeWei, maxFeeGwei: gas.gwei, buffer: "1.5x" });

  if (!armed()) {
    console.log("[stylus:mainnet] dry-run — set CONFIRM_STYLUS_MAINNET=YES BROADCAST=1 MAINNET_PK=0x… to deploy");
    return;
  }
  await deployStylus(rpc, resolvePk());
}

main().catch((err) => { console.error("[stylus:mainnet] fail-closed", err); process.exit(1); });
