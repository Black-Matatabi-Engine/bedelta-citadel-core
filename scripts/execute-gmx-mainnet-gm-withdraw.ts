#!/usr/bin/env tsx
/**
 * Arbitrum One (42161) — GMX v2 GM Pool redeem via ExchangeRouter.multicall.
 * Dry-run default. Live: CONFIRM_GMX_GM_WITHDRAW=YES BROADCAST=1 MAINNET_PK=0x… [--amount=100 --gm-price=1.05]
 */
import { createPublicClient, createWalletClient, getAddress, http, parseAbi, type Hex } from "viem";
import { mkdirSync, writeFileSync } from "node:fs";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum } from "viem/chains";
import { GMX_V2_EXCHANGE_ROUTER_ARBITRUM } from "../src/config/gmx-revenue";
import { GMX_ETH_USD_MARKET_TOKEN } from "../src/config/gmx-markets";
import {
  buildGmxGmWithdrawGmAmountPayload,
  buildGmxGmWithdrawRouterMulticall,
  auditGmxGmWithdrawAllowances,
  ensureGmxGmWithdrawAllowance,
  GMX_GM_ETH_USDC_MARKET,
  GMX_GM_WITHDRAW_TOKEN_SPENDERS,
  stripGmxGmWithdrawOnChainMetadata,
} from "../src/services/adapters/gmx-gm-withdraw-router-encode";
import { toGmxGmToken18 } from "../src/services/adapters/gmx-v2-order-payload-builder-helpers";
import { isBypassSimulationEnabled } from "../src/services/adapters/gmx-micro-fill-execution-errors";
import { refreshArbitrumGasGuard } from "../src/services/risk/arbitrum-gas-guard";
import { refreshSequencerGuard } from "../src/services/risk/sequencer-guard";
import { shouldBypassOracleLagDeadlock, shouldBypassSoftConfirmationProbe } from "../src/core/soil-resistance-core";
import { loadEnvProduction } from "./_shared/mainnet-env";
import { resolveBufferedEip1559Fees } from "./gmx-micro-fill-dispatch";
import { validateGmxExecutionGuards } from "./gmx-v2-execution-cli";

const CHAIN_ID = 42161;
const DEFAULT_RPC = "https://arb1.arbitrum.io/rpc";
const DEFAULT_AMOUNT_USD = 100;
const routerAbi = parseAbi(["function multicall(bytes[] data) payable returns (bytes[])"]);
const erc20BalAbi = parseAbi(["function balanceOf(address account) view returns (uint256)"]);

const truthy = (v: string | undefined): boolean => {
  const t = (v ?? "").trim().toLowerCase();
  return t === "1" || t === "true" || t === "yes";
};

function resolveRpc(): string { return (process.env.ARB_MAINNET_RPC_URL ?? DEFAULT_RPC).trim(); }
function armed(): boolean { return process.env.BROADCAST === "1" && process.env.CONFIRM_GMX_GM_WITHDRAW === "YES"; }
function bypassGasGuard(): boolean { return truthy(process.env.BYPASS_GAS_GUARD); }
function allowStaleOracle(argv: string[]): boolean {
  return argv.includes("--allow-stale-oracle") || truthy(process.env.ALLOW_STALE_ORACLE);
}
function resolvePk(): Hex {
  const pk = (process.env.MAINNET_PK ?? process.env.PRIVATE_KEY ?? "").trim();
  if (!pk.startsWith("0x")) throw new Error("MAINNET_PK or PRIVATE_KEY required for broadcast");
  return pk as Hex;
}
function readFlag(argv: string[], name: string): string | undefined {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const idx = argv.indexOf(name);
  return idx >= 0 ? argv[idx + 1] : undefined;
}
function parseAmountUsd(argv: string[]): number {
  const raw = readFlag(argv, "--amount") ?? process.env.GMX_GM_WITHDRAW_USD ?? String(DEFAULT_AMOUNT_USD);
  const amount = Number.parseFloat(raw);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(`INVALID_AMOUNT_USD: ${raw}`);
  return amount;
}
function parseGmPrice(argv: string[]): number | undefined {
  const raw = readFlag(argv, "--gm-price") ?? process.env.GMX_GM_PRICE_USD;
  if (!raw) return undefined;
  const price = Number.parseFloat(raw);
  if (!Number.isFinite(price) || price <= 0) throw new Error(`INVALID_GM_PRICE_USD: ${raw}`);
  return price;
}
function resolveGmTokenAmount(argv: string[], amountUsd: number): bigint {
  const explicit = readFlag(argv, "--gm-amount");
  if (explicit) {
    const amt = BigInt(explicit);
    if (amt <= 0n) throw new Error("GMX_GM_WITHDRAW_AMOUNT: --gm-amount must be > 0");
    return amt;
  }
  const gmPrice = parseGmPrice(argv);
  if (!gmPrice) {
    throw new Error("GMX_GM_WITHDRAW_AMOUNT: set --gm-amount <wei> or --gm-price <usd> with --amount");
  }
  return BigInt(toGmxGmToken18(amountUsd / gmPrice));
}
function parseExecutionFeeWei(argv: string[]): string | undefined {
  return readFlag(argv, "--execution-fee") ?? process.env.GMX_GM_WITHDRAW_EXECUTION_FEE;
}
function validateGuards(staleOracleOk: boolean): { ok: boolean; reasons: string[] } {
  if (bypassGasGuard()) {
    console.warn("[gmx-gm-withdraw] BYPASS_GAS_GUARD=true — skipping Arbitrum gas guard");
    return { ok: true, reasons: [] };
  }
  return validateGmxExecutionGuards(staleOracleOk);
}

async function capWithdrawToGmBalance(
  client: ReturnType<typeof createPublicClient>,
  receiver: Hex,
  market: Hex,
  gmTokenAmount: bigint,
  amountUsd: number,
  staleOracleOk: boolean,
  probeBypass: boolean,
  executionFeeWei?: string,
) {
  let payload = stripGmxGmWithdrawOnChainMetadata(
    buildGmxGmWithdrawGmAmountPayload({
      receiver,
      gmTokenAmount,
      sizeUsd: amountUsd,
      marketToken: market,
      executionFeeWei,
      skipFailClosedGuards: staleOracleOk || probeBypass,
      allowStaleOracle: staleOracleOk,
    }),
  );
  let built = buildGmxGmWithdrawRouterMulticall(payload, market);
  const gmBal = await client.readContract({
    address: market,
    abi: erc20BalAbi,
    functionName: "balanceOf",
    args: [receiver],
  });
  if (built.marketTokenAmount > gmBal) {
    console.warn(`[gmx-gm-withdraw] capping gmTokenAmount ${built.marketTokenAmount} → on-chain balance ${gmBal}`);
    payload = stripGmxGmWithdrawOnChainMetadata(
      buildGmxGmWithdrawGmAmountPayload({
        receiver,
        gmTokenAmount: gmBal,
        sizeUsd: amountUsd,
        marketToken: market,
        executionFeeWei,
        skipFailClosedGuards: staleOracleOk || probeBypass,
        allowStaleOracle: staleOracleOk,
      }),
    );
    built = buildGmxGmWithdrawRouterMulticall(payload, market);
  }
  return built;
}

async function main(): Promise<void> {
  try { loadEnvProduction(); } catch { /* optional */ }
  const argv = process.argv.slice(2);
  const rpc = resolveRpc();
  const amountUsd = parseAmountUsd(argv);
  const gmTokenAmount = resolveGmTokenAmount(argv, amountUsd);
  const executionFeeWei = parseExecutionFeeWei(argv);
  const probeBypass = shouldBypassSoftConfirmationProbe();
  const staleOracleOk = allowStaleOracle(argv) || shouldBypassOracleLagDeadlock() || probeBypass;
  if (staleOracleOk) process.env.ALLOW_STALE_ORACLE = "1";

  const client = createPublicClient({ chain: arbitrum, transport: http(rpc) });
  if ((await client.getChainId()) !== CHAIN_ID) throw new Error(`refuse: expected chain ${CHAIN_ID}`);

  await Promise.all([refreshSequencerGuard(), refreshArbitrumGasGuard({ targetYieldUsd: amountUsd * 0.001 })]);
  const guardVerdict = validateGuards(staleOracleOk);
  if (!guardVerdict.ok) throw new Error(`GUARD_BLOCKED:${guardVerdict.reasons.join("|")}`);
  if (isBypassSimulationEnabled()) {
    console.warn("[gmx-gm-withdraw] BYPASS_SIMULATION=true — skipping eth_call preflight");
  }

  const market = getAddress(GMX_ETH_USD_MARKET_TOKEN);
  if (market !== GMX_GM_ETH_USDC_MARKET) throw new Error(`GMX_GM_MARKET_MISMATCH: ${market}`);
  const receiver = armed() ? privateKeyToAccount(resolvePk()).address : getAddress("0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F");
  let { calls, data, value, executionFee, marketTokenAmount } = await capWithdrawToGmBalance(
    client, receiver, market, gmTokenAmount, amountUsd, staleOracleOk, probeBypass, executionFeeWei,
  );
  const allowanceAudit = await auditGmxGmWithdrawAllowances({
    client, owner: receiver, token: market, gmTokenAmount: marketTokenAmount,
  });

  console.log(JSON.stringify({
    event: armed() ? "GMX_GM_WITHDRAW_LIVE" : "GMX_GM_WITHDRAW_DRY_RUN",
    network: "arbitrum-one",
    chainId: CHAIN_ID,
    amountUsd,
    gmTokenAmount: marketTokenAmount.toString(),
    market,
    receiver,
    executionFee: executionFee.toString(),
    multicallLegs: calls.length,
    router: GMX_V2_EXCHANGE_ROUTER_ARBITRUM,
    gmTokenSpenders: GMX_GM_WITHDRAW_TOKEN_SPENDERS,
    gmAllowances: allowanceAudit.map((row) => ({
      spender: row.spender,
      allowance: row.allowance.toString(),
      sufficient: row.sufficient,
    })),
    dataLen: data.length,
    msgValue: value.toString(),
    bypass: { staleOracle: staleOracleOk, gasGuard: bypassGasGuard(), simulation: isBypassSimulationEnabled() },
    timestamp: new Date().toISOString(),
  }, null, 2));

  if (!armed()) {
    const fixturePath = "contracts/test/fixtures/gmx-gm-withdraw-multicall.json";
    mkdirSync("contracts/test/fixtures", { recursive: true });
    writeFileSync(fixturePath, `${JSON.stringify({
      eoa: receiver,
      router: GMX_V2_EXCHANGE_ROUTER_ARBITRUM,
      market,
      multicallData: data,
      msgValue: value.toString(),
      calls,
      executionFee: executionFee.toString(),
      marketTokenAmount: marketTokenAmount.toString(),
    }, null, 2)}\n`);
    console.log(`[gmx-gm-withdraw] wrote ${fixturePath}`);
    console.log("[gmx-gm-withdraw] dry-run — set CONFIRM_GMX_GM_WITHDRAW=YES BROADCAST=1 MAINNET_PK=0x… [--amount=100 --gm-price=1.05]");
    return;
  }

  const pk = resolvePk();
  const account = privateKeyToAccount(pk);
  const wallet = createWalletClient({ account, chain: arbitrum, transport: http(rpc) });
  const { approveTxs } = await ensureGmxGmWithdrawAllowance({
    client, owner: account.address, token: market, gmTokenAmount: marketTokenAmount, pk, chain: arbitrum, rpc,
    resolveFees: () => resolveBufferedEip1559Fees(client),
  });
  if (approveTxs.length > 0) {
    console.log("[gmx-gm-withdraw] allowance txs broadcast", approveTxs);
  }

  if (!isBypassSimulationEnabled()) {
    await client.simulateContract({
      address: getAddress(GMX_V2_EXCHANGE_ROUTER_ARBITRUM),
      abi: routerAbi,
      functionName: "multicall",
      args: [calls],
      value,
      account: account.address,
    });
  }

  const fees = await resolveBufferedEip1559Fees(client);
  const tx = await wallet.writeContract({
    address: getAddress(GMX_V2_EXCHANGE_ROUTER_ARBITRUM),
    abi: routerAbi,
    functionName: "multicall",
    args: [calls],
    value,
    maxFeePerGas: fees.maxFeePerGas,
    maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
    gas: 3_000_000n,
  });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  console.log("[gmx-gm-withdraw] broadcast OK", {
    tx,
    status: receipt.status,
    block: receipt.blockNumber.toString(),
    arbiscan: `https://arbiscan.io/tx/${tx}`,
  });
}

main().catch((err) => {
  console.error("[gmx-gm-withdraw] fatal", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
