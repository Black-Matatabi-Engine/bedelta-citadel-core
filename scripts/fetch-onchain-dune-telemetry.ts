#!/usr/bin/env tsx
/** Fetch live SliverVineGate logs (Arbitrum One + Sepolia) → Dune on-chain CSV. */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  http,
  parseAbi,
  type GetLogsReturnType,
  type Hex,
  type PublicClient,
} from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS } from "../src/config/contract-deployments";
import {
  DEFAULT_LOG_CHUNK_BLOCKS,
  DEFAULT_SEPOLIA_LOOKBACK_BLOCKS,
  GATE_MAINNET_DEPLOY_BLOCK,
  ONCHAIN_DUNE_CSV_PATH,
  type ParsedOnchainGateLog,
  formatOnchainDuneCsv,
  mapOnchainLogToDuneRow,
} from "./_shared/onchain-dune-telemetry";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GATE = SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS as Hex;
const gateEventsAbi = parseAbi([
  "event IntentAttested(bytes32 indexed intentHash, address indexed agent, uint8 action, uint256 shadowMarginUsd)",
  "event RiskTripBlocked(bytes32 indexed intentHash, address indexed agent, string reason)",
]);

type GateLog = GetLogsReturnType<typeof gateEventsAbi>[number];

function resolveMainnetRpc(): string {
  return (process.env.ARB_MAINNET_RPC_URL ?? "https://arb1.arbitrum.io/rpc").trim();
}

function resolveSepoliaRpc(): string {
  return (process.env.ARB_SEPOLIA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc").trim();
}

async function fetchLogsChunked(
  client: PublicClient,
  fromBlock: bigint,
  toBlock: bigint,
): Promise<GateLog[]> {
  const chunk = DEFAULT_LOG_CHUNK_BLOCKS;
  const logs: GateLog[] = [];
  for (let start = fromBlock; start <= toBlock; start += chunk) {
    const end = start + chunk - 1n > toBlock ? toBlock : start + chunk - 1n;
    const batch = await client.getLogs({ address: GATE, events: gateEventsAbi, fromBlock: start, toBlock: end });
    logs.push(...batch);
  }
  return logs;
}

async function enrichLogs(
  client: PublicClient,
  chainId: number,
  network: "mainnet" | "sepolia",
  logs: GateLog[],
): Promise<ParsedOnchainGateLog[]> {
  const blockNums = [...new Set(logs.map((log) => log.blockNumber))];
  const txHashes = [...new Set(logs.map((log) => log.transactionHash))];
  const blockTs = new Map<bigint, number>();
  const receiptGas = new Map<string, { gasUsed: bigint; gasPriceWei: bigint }>();

  await Promise.all(
    blockNums.map(async (blockNumber) => {
      const block = await client.getBlock({ blockNumber });
      blockTs.set(blockNumber, Number(block.timestamp) * 1000);
    }),
  );

  await Promise.all(
    txHashes.map(async (hash) => {
      const [receipt, tx] = await Promise.all([
        client.getTransactionReceipt({ hash }),
        client.getTransaction({ hash }),
      ]);
      const gasPriceWei = tx.gasPrice ?? receipt.effectiveGasPrice ?? 0n;
      receiptGas.set(hash, { gasUsed: receipt.gasUsed, gasPriceWei });
    }),
  );

  return logs.map((log) => {
    const gas = receiptGas.get(log.transactionHash) ?? { gasUsed: 0n, gasPriceWei: 0n };
    const base = {
      chainId,
      network,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      logIndex: log.logIndex,
      timestampMs: blockTs.get(log.blockNumber) ?? 0,
      gasUsed: gas.gasUsed,
      gasPriceWei: gas.gasPriceWei,
      intentHash: String(log.args.intentHash),
      agent: String(log.args.agent),
    };
    if (log.eventName === "IntentAttested") {
      return {
        ...base,
        eventName: "IntentAttested",
        action: Number(log.args.action),
        shadowMarginUsd: log.args.shadowMarginUsd,
      };
    }
    return { ...base, eventName: "RiskTripBlocked", reason: log.args.reason };
  });
}

async function fetchNetwork(
  network: "mainnet" | "sepolia",
): Promise<ParsedOnchainGateLog[]> {
  const isMainnet = network === "mainnet";
  const client = createPublicClient({
    chain: isMainnet ? arbitrum : arbitrumSepolia,
    transport: http(isMainnet ? resolveMainnetRpc() : resolveSepoliaRpc()),
  });
  const latest = await client.getBlockNumber();
  const fromBlock = isMainnet
    ? GATE_MAINNET_DEPLOY_BLOCK
    : latest > DEFAULT_SEPOLIA_LOOKBACK_BLOCKS
      ? latest - DEFAULT_SEPOLIA_LOOKBACK_BLOCKS
      : 0n;
  const logs = await fetchLogsChunked(client, fromBlock, latest);
  return enrichLogs(client, isMainnet ? arbitrum.id : arbitrumSepolia.id, network, logs);
}

async function main(): Promise<void> {
  const [mainnetLogs, sepoliaLogs] = await Promise.all([
    fetchNetwork("mainnet"),
    fetchNetwork("sepolia"),
  ]);
  const parsed = [...mainnetLogs, ...sepoliaLogs].sort((a, b) => a.timestampMs - b.timestampMs);
  const rows = parsed.map(mapOnchainLogToDuneRow);
  const outPath = join(ROOT, ONCHAIN_DUNE_CSV_PATH);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, formatOnchainDuneCsv(rows));
  console.error(
    `[onchain-dune] gate=${GATE} mainnet_logs=${mainnetLogs.length} sepolia_logs=${sepoliaLogs.length} rows=${rows.length} -> ${outPath}`,
  );
}

main().catch((error) => {
  console.error("[onchain-dune] fail-closed", error);
  process.exit(1);
});
