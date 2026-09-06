/** Shared E2E demo constants — vault capital, delta-neutral math, proof path. */
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type E2eDemoMode = "dry-run" | "live";

export const ETH_GM_MARKET = "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336" as const;
export const DEMO_AGENT = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
export const DEMO_WALLET = "0xcccccccccccccccccccccccccccccccccccccccc";
export const DEMO_DIGEST =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export const DEMO_ETH_MID = 3_465;
export const DEMO_TOKEN = "USDC";

export const TOTAL_VAULT_CAPITAL_USD = 2_500;
export const DEMO_VAULT_CAPITAL_USD = TOTAL_VAULT_CAPITAL_USD;
export const GMX_GM_DEPOSITED_USD = 2_400;
export const GMX_ETH_LONG_EXPOSURE_USD = 1_200;
export const GMX_BUILDER_FEE_BPS = 10;
export const GMX_BUILDER_FEE_USD = 2.4;
export const HL_HEDGE_SHORT_USD = 1_200;
export const HL_HEDGE_ETH_SIZE = "0.3463";
export const HL_MARGIN_USD = TOTAL_VAULT_CAPITAL_USD - GMX_GM_DEPOSITED_USD;
export const FINAL_VAULT_USD = TOTAL_VAULT_CAPITAL_USD + GMX_BUILDER_FEE_USD;
export const DELTA_NET_ETH = "0.0000";

/** @deprecated use GMX_ETH_LONG_EXPOSURE_USD */
export const DEMO_SIZE_USD = GMX_ETH_LONG_EXPOSURE_USD;

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
