import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Hex } from "viem";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ENV_PRODUCTION_PATH = join(__dirname, "../../.env.production");
export const LOCAL_ENV_PATH = join(__dirname, "../../.env");

/** Wallet A / mainnet broadcast PK lookup order (SSOT). */
export const MAINNET_PRIVATE_KEY_ENV_KEYS = [
  "WALLET_A_PRIVATE_KEY",
  "WalletA_Pkey",
  "MAINNET_PK",
  "PRIVATE_KEY",
] as const;

function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    out[key] = stripEnvQuotes(line.slice(eq + 1));
  }
  return out;
}

function stripEnvQuotes(value: string): string {
  let v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

export function envProductionExists(): boolean {
  return existsSync(ENV_PRODUCTION_PATH);
}

export function loadEnvProduction(): void {
  if (!envProductionExists()) {
    throw new Error(`.env.production missing — run setup first`);
  }
  applyEnvRecord(parseEnvFile(ENV_PRODUCTION_PATH), true);
}

/** Load `.env` then `.env.production` without overriding shell exports. */
export function loadMainnetEnv(): void {
  const merged: Record<string, string> = {};
  if (existsSync(LOCAL_ENV_PATH)) Object.assign(merged, parseEnvFile(LOCAL_ENV_PATH));
  if (envProductionExists()) Object.assign(merged, parseEnvFile(ENV_PRODUCTION_PATH));
  applyEnvRecord(merged, false);
}

function applyEnvRecord(record: Record<string, string>, force: boolean): void {
  for (const [key, value] of Object.entries(record)) {
    if (force || process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

/** Resolve Wallet A / mainnet signing key from env (supports WalletA_Pkey alias). */
export function resolveMainnetPrivateKey(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): Hex {
  for (const key of MAINNET_PRIVATE_KEY_ENV_KEYS) {
    const pk = stripEnvQuotes(env[key] ?? "");
    if (pk.startsWith("0x")) return pk as Hex;
  }
  throw new Error(`${MAINNET_PRIVATE_KEY_ENV_KEYS.join(" | ")} required (never commit)`);
}

export function mask(value: string): string {
  if (value.length < 12) return "***";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function maskHex(value: string): string {
  return mask(value);
}

export function requireEnv(key: string): string {
  const v = (process.env[key] ?? "").trim();
  if (!v) throw new Error(`${key} missing in .env.production`);
  return v;
}
