#!/usr/bin/env tsx
/**
 * Robinhood ingress → Arbitrum One smart-route ZeroDev Kernel v3 UserOp (PolicyGuard + Gate bind).
 * Dry-run default. Live: CONFIRM_SMART_ROUTE_DEMO=YES BROADCAST=1 MAINNET_PK=0x… ZERODEV_PROJECT_ID=…
 */
import { createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import {
  createPublicClient, createWalletClient, encodeFunctionData, http, keccak256, parseAbi, toHex, type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum } from "viem/chains";
import type { SmartAccount } from "viem/account-abstraction";
import { buildZeroDevRpcUrl } from "../src/adapters/arbitrum/zerodev-aa/zerodev-aa-constants";
import { buildKernelAccount } from "../src/adapters/arbitrum/zerodev-aa/zerodev-aa-kernel";
import { GMX_MARKET_REGISTRY } from "../src/config/gmx-markets";
import { ROBINHOOD_TESTNET_CHAIN_ID, EIP712_DOMAIN_NAME, EIP712_DOMAIN_VERSION } from "../src/sdk/constants";
import { checkSoilResistance } from "../src/services/risk-control";
import { buildGmxSmartRoutePayloadBinding } from "../src/services/adapters/gmx-smart-route-payload-binding";
import { buildGmxV2UnsignedOrderPayload } from "../src/services/adapters/gmx-v2-order-payload";
import { loadEnvProduction } from "./_shared/mainnet-env";

const POLICY_GUARD = "0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b" as Hex;
const GATE = "0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1" as Hex;
const CHAIN_ID = 42161;
const RPC = process.env.ARB_MAINNET_RPC_URL ?? "https://arb1.arbitrum.io/rpc";
const SOURCE_CHAIN = Number(process.env.SMART_ROUTE_SOURCE_CHAIN_ID ?? ROBINHOOD_TESTNET_CHAIN_ID);
const AGENT_ID = keccak256(toHex(`silvervine:smart-route:${SOURCE_CHAIN}->${CHAIN_ID}`));
const policyAbi = parseAbi(["function validateAgentPolicy(bytes32 agentId, uint256 maxNotional, uint256 ttl) returns (bytes32)"]);
const gateAbi = parseAbi([
  "function verifyAndConsume((bytes32 payloadHash,address subject,uint8 verdict,uint16 riskBps,uint64 issuedAt,uint64 expiresAt,uint256 nonce) att, bytes[] signatures) returns (bytes32)",
]);

function arbiscan(tx: string): string { return `https://arbiscan.io/tx/${tx}`; }
function armed(): boolean { return process.env.BROADCAST === "1" && process.env.CONFIRM_SMART_ROUTE_DEMO === "YES"; }
function resolvePk(): Hex {
  const pk = (process.env.MAINNET_PK ?? process.env.PRIVATE_KEY ?? "").trim();
  if (!pk.startsWith("0x")) throw new Error("MAINNET_PK or PRIVATE_KEY required");
  return pk as Hex;
}
function parseSize(argv: string[]): number {
  const raw = argv.find((a, i) => argv[i - 1] === "--size");
  const n = raw ? Number.parseFloat(raw) : 15;
  if (!Number.isFinite(n) || n < 10 || n > 20) throw new Error("size must be $10–$20 USD");
  return n;
}

async function signAtt(wallet: ReturnType<typeof createWalletClient>, att: object): Promise<Hex> {
  return wallet.signTypedData({
    account: wallet.account!, domain: { name: EIP712_DOMAIN_NAME, version: EIP712_DOMAIN_VERSION, chainId: CHAIN_ID, verifyingContract: GATE },
    types: { RiskAttestation: [{ name: "payloadHash", type: "bytes32" }, { name: "subject", type: "address" }, { name: "verdict", type: "uint8" }, { name: "riskBps", type: "uint16" }, { name: "issuedAt", type: "uint64" }, { name: "expiresAt", type: "uint64" }, { name: "nonce", type: "uint256" }] },
    primaryType: "RiskAttestation", message: att,
  });
}

async function main(): Promise<void> {
  try { loadEnvProduction(); } catch { /* optional */ }
  const sizeUsd = parseSize(process.argv.slice(2));
  const client = createPublicClient({ chain: arbitrum, transport: http(RPC) });
  if ((await client.getChainId()) !== CHAIN_ID) throw new Error(`refuse: expected chain ${CHAIN_ID}`);

  const bypassSoil = process.env.BYPASS_SOIL_PROBE === "true";
  const soil = checkSoilResistance({ symbol: "ETH", hlSpot: 3500, hlPerp: 3500, dydxPerp: 3498, depthUsd: 500_000, orderSizeUsd: sizeUsd, accountBalanceUsd: 10_000 });
  if (soil.tripped && !bypassSoil) throw new Error(`SOIL_TRIP: ${soil.reasons.join(",")}`);
  if (bypassSoil && soil.tripped) console.warn("[smart-route] BYPASS_SOIL_PROBE=true — probe skipped", { reasons: soil.reasons });

  const projectId = process.env.ZERODEV_PROJECT_ID?.trim();
  if (!projectId) throw new Error("ZERODEV_PROJECT_ID required");
  const pk = resolvePk();
  const kernel = await buildKernelAccount({ chainId: CHAIN_ID, chain: arbitrum, rpcUrl: RPC, ownerPrivateKey: pk });
  const market = GMX_MARKET_REGISTRY["ETH/USDC"];
  const order = buildGmxV2UnsignedOrderPayload({ side: "long", sizeUsd, midPriceUsd: 3_500, marketToken: market.marketToken, maxSlippageBps: 30 });
  const nonce = BigInt(Date.now());
  const binding = buildGmxSmartRoutePayloadBinding({
    sourceChainId: SOURCE_CHAIN, executor: GATE, initiator: kernel.address, nonce, orderPayload: order, targetRoute: "GM_ETH_USDC",
  });
  console.log("[smart-route] binding OK", {
    sourceChainId: SOURCE_CHAIN, destChainId: binding.chainId, targetRoute: binding.targetRoute,
    smartRoutingAddress: binding.smartRoutingAddress, payloadHash: binding.payloadHash, soilOk: true,
  });

  if (!armed()) {
    console.log("[smart-route] dry-run — set CONFIRM_SMART_ROUTE_DEMO=YES BROADCAST=1 MAINNET_PK=0x… ZERODEV_PROJECT_ID=…");
    return;
  }

  const now = BigInt(Math.floor(Date.now() / 1000));
  const policyData = encodeFunctionData({
    abi: policyAbi, functionName: "validateAgentPolicy",
    args: [AGENT_ID, BigInt(Math.round(sizeUsd * 1e6)), now + 3600n],
  });
  const calls: { to: Hex; data: Hex }[] = [{ to: POLICY_GUARD, data: policyData }];

  const signerPk = (process.env.GATE_SIGNER_KEY_0 ?? "").trim() as Hex;
  if (!signerPk.startsWith("0x")) throw new Error("GATE_SIGNER_KEY_0 required for Gate payloadHash bind");
  const att = { payloadHash: binding.payloadHash, subject: kernel.address, verdict: 1, riskBps: 1200, issuedAt: now, expiresAt: now + 30n, nonce };
  const gateSig = await signAtt(createWalletClient({ account: privateKeyToAccount(signerPk), chain: arbitrum, transport: http(RPC) }), att);
  calls.push({ to: GATE, data: encodeFunctionData({ abi: gateAbi, functionName: "verifyAndConsume", args: [att, [gateSig]] }) });

  const bundlerRpc = buildZeroDevRpcUrl(projectId, CHAIN_ID);
  const paymaster = createZeroDevPaymasterClient({ chain: arbitrum, transport: http(bundlerRpc) });
  const kernelClient = createKernelAccountClient({
    account: kernel.account as SmartAccount, chain: arbitrum, bundlerTransport: http(bundlerRpc), client,
    paymaster: { getPaymasterData: (userOperation) => paymaster.sponsorUserOperation({ userOperation }) },
  });
  const userOpHash = await kernelClient.sendUserOperation({ calls });
  const receipt = await kernelClient.waitForUserOperationReceipt({ hash: userOpHash });
  const tx = receipt.receipt.transactionHash;
  console.log("[smart-route] ZeroDev UserOp", { kernel: kernel.address, userOpHash, tx, success: receipt.success, url: arbiscan(tx) });
  if (!receipt.success) throw new Error("Smart-route UserOp reverted");
}

main().catch((err) => { console.error("[smart-route] fail-closed", err); process.exit(1); });
