#!/usr/bin/env tsx
/**
 * Arbitrum One (42161) — SliverVineSoilCoprocessor Stylus compile check + optional deploy.
 * Dry-run: pnpm tsx scripts/deploy-stylus-mainnet.ts
 * Live: CONFIRM_STYLUS_MAINNET=YES BROADCAST=1 MAINNET_PK=0x… ARB_MAINNET_RPC_URL=…
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvProduction } from "./_shared/mainnet-env";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STYLUS_DIR = join(ROOT, "contracts/stylus-probe");
const CHAIN_ID = 42161;
const DEFAULT_RPC = "https://arb1.arbitrum.io/rpc";

function run(cmd: string, args: string[], cwd = STYLUS_DIR, env = process.env): { ok: boolean; output: string } {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", env });
  const output = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  return { ok: r.status === 0, output };
}

function stylusEnv(rpc: string): NodeJS.ProcessEnv {
  return { ...process.env, STYLUS_ENDPOINT: rpc, RPC_URL: rpc };
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
  const which = run("bash", ["-lc", "command -v cargo-stylus || rustup run 1.91 cargo stylus --version"]);
  if (!which.ok) {
    console.warn("[stylus:mainnet] cargo-stylus CLI unavailable — compile chain verified; install cargo-stylus for on-chain check");
    return;
  }
  const stylusBin = which.output.split("\n")[0]?.includes("cargo stylus")
    ? "rustup run 1.91 cargo stylus"
    : "cargo-stylus";
  const check = run("bash", ["-lc", `${stylusBin} check --endpoint '${rpc}'`], STYLUS_DIR, stylusEnv(rpc));
  if (!check.ok) {
    console.error("[stylus:mainnet] cargo stylus check FAILED\n", check.output);
    process.exit(1);
  }
  console.log("[stylus:mainnet] cargo stylus check: PASS", { chainId: CHAIN_ID, endpoint: rpc });
}

function deployStylus(rpc: string, pk: string): void {
  const deploy = run(
    "bash",
    ["-lc", `rustup run 1.91 cargo stylus deploy --endpoint '${rpc}' --private-key ${pk} --no-verify`],
    STYLUS_DIR,
    stylusEnv(rpc),
  );
  if (!deploy.ok) {
    console.error("[stylus:mainnet] cargo stylus deploy FAILED\n", deploy.output);
    process.exit(1);
  }
  console.log("[stylus:mainnet] deploy broadcast OK", { chainId: CHAIN_ID, output: deploy.output.slice(-400) });
}

async function main(): Promise<void> {
  try { loadEnvProduction(); } catch { /* optional */ }
  const rpc = resolveRpc();
  console.log("[stylus:mainnet] preflight", { chainId: CHAIN_ID, stylusDir: STYLUS_DIR, rpc });
  verifyCompileChain();
  verifyStylusCheck(rpc);

  if (!armed()) {
    console.log("[stylus:mainnet] dry-run — set CONFIRM_STYLUS_MAINNET=YES BROADCAST=1 MAINNET_PK=0x… to deploy");
    return;
  }
  deployStylus(rpc, resolvePk());
}

main().catch((err) => { console.error("[stylus:mainnet] fail-closed", err); process.exit(1); });
