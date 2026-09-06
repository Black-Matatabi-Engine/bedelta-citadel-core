/** Shared E2E demo constants — vault capital, tokens, proof path. */
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type E2eDemoMode = "dry-run" | "live";

export const ETH_GM_MARKET = "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336" as const;
export const DEMO_AGENT = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
export const DEMO_WALLET = "0xcccccccccccccccccccccccccccccccccccccccc";
export const DEMO_DIGEST =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export const DEMO_ETH_MID = 3_500;
export const DEMO_SIZE_USD = 100;
export const DEMO_VAULT_CAPITAL_USD = 2_500;
export const DEMO_REBALANCE_USD = 1_200;
export const DEMO_BUILDER_REBATE_USD = 0.12;
export const DEMO_TOKEN = "USDC";
export const E2E_PROOF_REL_PATH = "docs/logging/last_e2e_run.json";
export const E2E_PROOF_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../docs/logging/last_e2e_run.json",
);
export const E2E_SUMMARY_DIVIDER = "=".repeat(88);
export const HL_SANDBOX_REF = "sha256:d21f336ffdfeee5e";
export const HL_SANDBOX_TX = "0xhl_simulated_session_hedge_88a91b";

export function parseE2eMode(argv: string[]): E2eDemoMode {
  if (argv.includes("--hedge-live") && !argv.includes("--dry-run")) return "live";
  return "dry-run";
}

export function sha16(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
}

export function resolveHlSessionPrivateKey(): string | undefined {
  return (
    process.env.HYPERLIQUID_MAINNET_SESSION_PK?.trim() ||
    process.env.HL_TESTNET_PRIVATE_KEY?.trim() ||
    undefined
  );
}
