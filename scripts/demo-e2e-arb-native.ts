#!/usr/bin/env tsx
/**
 * Arbitrum One (42161) native GM Pool deposit E2E — Wallet B probe + multicall simulate.
 * Boundary: direct 42161 only (not Robinhood 4663 Smart Route).
 *
 * Usage: pnpm demo:e2e:arb-native [--gm-amount=10]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import {
  createPublicClient,
  formatEther,
  formatUnits,
  getAddress,
  http,
  parseAbi,
  type Hex,
} from "viem";
import { arbitrum } from "viem/chains";
import { GMX_ETH_USD_MARKET_TOKEN } from "../src/config/gmx-markets";
import { GMX_V2_EXCHANGE_ROUTER_ARBITRUM } from "../src/config/gmx-revenue";
import {
  buildGmxGmDepositRouterMulticall,
  buildGmxGmUsdcOnlyDepositPayload,
  GMX_GM_ETH_USDC_MARKET,
  stripGmxGmDepositOnChainMetadata,
} from "../src/services/adapters/gmx-gm-deposit-router-encode";
import { GMX_USDC_ARBITRUM } from "../src/services/adapters/gmx-micro-fill-router-encode";
import { GMX_WALLET_B_DEFAULT } from "../src/services/gmx-eth-delta";

const TAG = "[DEMO_E2E_ARB_NATIVE]";
const CHAIN_ID = 42161;
const DEFAULT_RPC = "https://arb1.arbitrum.io/rpc";
const DEFAULT_GM_AMOUNT = 10;
const LOG_PATH = "docs/logging/0909_E2E_ARB_NATIVE_EXECUTION.md";
const routerAbi = parseAbi(["function multicall(bytes[] data) payable returns (bytes[])"]);
const erc20Abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);

function log(msg: string, detail?: Record<string, unknown>): void {
  if (detail) console.log(TAG, msg, detail);
  else console.log(TAG, msg);
}

function parseArgs(argv: string[]): { arbNative: boolean; gmAmountUsd: number } {
  if (!argv.includes("--arb-native")) throw new Error("REFUSE: pass --arb-native for Arbitrum native E2E");
  const eq = argv.find((a) => a.startsWith("--gm-amount="));
  const idx = argv.indexOf("--gm-amount");
  const raw = eq?.slice("--gm-amount=".length) ?? (idx >= 0 ? argv[idx + 1] : undefined) ?? String(DEFAULT_GM_AMOUNT);
  const gmAmountUsd = Number.parseFloat(raw);
  if (!Number.isFinite(gmAmountUsd) || gmAmountUsd <= 0) throw new Error(`INVALID_GM_AMOUNT: ${raw}`);
  return { arbNative: true, gmAmountUsd };
}

async function probeWalletBalances(
  client: ReturnType<typeof createPublicClient>,
  wallet: Hex,
): Promise<{ ethBalance: string; usdcBalance: string }> {
  const ethWei = await client.getBalance({ address: wallet });
  const usdcRaw = await client.readContract({
    address: getAddress(GMX_USDC_ARBITRUM),
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [wallet],
  });
  return { ethBalance: formatEther(ethWei), usdcBalance: formatUnits(usdcRaw, 6) };
}

function writeTelemetryMd(payload: Record<string, unknown>): void {
  mkdirSync("docs/logging", { recursive: true });
  const b = payload.balances as { ethBalance: string; usdcBalance: string };
  const md = `# E2E Arbitrum Native GM Deposit Execution Log

| Field | Value |
|-------|-------|
| **Workflow** | Arbitrum One (\`42161\`) native GM deposit — **not** Robinhood Smart Route (\`4663\`) |
| **Wallet B** | \`${payload.walletB}\` |
| **GM Amount** | $${payload.gmAmountUsd} USDC |
| **ETH Balance** | ${b.ethBalance} ETH |
| **USDC Balance** | ${b.usdcBalance} USDC |
| **Simulate** | ${payload.simulateOk ? "PASS" : "REVERT"} |
| **Timestamp** | ${payload.timestamp} |

\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`
`;
  writeFileSync(LOG_PATH, md);
}

async function main(): Promise<void> {
  const { gmAmountUsd } = parseArgs(process.argv.slice(2));
  const rpc = (process.env.ARB_MAINNET_RPC_URL ?? DEFAULT_RPC).trim();
  const walletB = getAddress((process.env.ARB_MAINNET_USER_ADDRESS ?? GMX_WALLET_B_DEFAULT).trim());
  const client = createPublicClient({ chain: arbitrum, transport: http(rpc) });
  if ((await client.getChainId()) !== CHAIN_ID) throw new Error(`REFUSE chain ${await client.getChainId()}`);

  const balances = await probeWalletBalances(client, walletB);
  log("wallet_b_probe", { walletB, gmAmountUsd, ...balances });

  const market = getAddress(GMX_ETH_USD_MARKET_TOKEN);
  if (market !== GMX_GM_ETH_USDC_MARKET) throw new Error(`GMX_GM_MARKET_MISMATCH: ${market}`);
  const usdcAmount = BigInt(Math.floor(gmAmountUsd * 1_000_000));
  const payload = stripGmxGmDepositOnChainMetadata(
    buildGmxGmUsdcOnlyDepositPayload({ receiver: walletB, usdcAmount, marketToken: market }),
  );
  const { calls, data, value, executionFee, shortTokenAmount } = buildGmxGmDepositRouterMulticall(payload, market);
  log("multicall_built", {
    legs: ["sendWnt", "sendTokens", "createDeposit"],
    callCount: calls.length,
    executionFee: executionFee.toString(),
    collateral: shortTokenAmount.toString(),
    router: GMX_V2_EXCHANGE_ROUTER_ARBITRUM,
    msgValue: value.toString(),
    dataLen: data.length,
  });

  let simulateOk = false;
  let simulateError: string | null = null;
  try {
    await client.simulateContract({
      address: getAddress(GMX_V2_EXCHANGE_ROUTER_ARBITRUM),
      abi: routerAbi,
      functionName: "multicall",
      args: [calls],
      value,
      account: walletB,
    });
    simulateOk = true;
    log("simulate_ok", { mode: "DRY_RUN" });
  } catch (err) {
    simulateError = err instanceof Error ? err.message : String(err);
    log("simulate_revert", { error: simulateError });
  }

  const telemetry = {
    workflow: "ARBITRUM_NATIVE_GM_DEPOSIT",
    chainId: CHAIN_ID,
    boundary: "42161 direct — no Robinhood 4663 Smart Route",
    walletB,
    gmAmountUsd,
    balances,
    multicall: {
      legs: ["sendWnt", "sendTokens", "createDeposit"],
      callCount: calls.length,
      router: GMX_V2_EXCHANGE_ROUTER_ARBITRUM,
      msgValue: value.toString(),
    },
    simulateOk,
    simulateError,
    timestamp: new Date().toISOString(),
  };
  writeTelemetryMd(telemetry);
  log("telemetry_written", { path: LOG_PATH, simulateOk });
  log(simulateOk ? "result_ok" : "result_simulate_revert", {
    note: simulateOk ? "multicall simulate PASS" : "simulate reverted — probe/calldata still valid for E2E audit",
  });
}

main().catch((err) => {
  console.error(TAG, "fatal", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
