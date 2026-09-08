/** Live GMX micro-fill dispatch — ZeroDev Kernel UserOp with EOA router fallback. */
import { createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import {
  createPublicClient, createWalletClient, getAddress, http, maxUint256, parseAbi, type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Chain } from "viem/chains";
import type { SmartAccount } from "viem/account-abstraction";
import { buildZeroDevRpcUrl } from "../src/adapters/arbitrum/zerodev-aa/zerodev-aa-constants";
import { GMX_V2_EXCHANGE_ROUTER_ARBITRUM } from "../src/config/gmx-revenue";
import {
  encodeGmxCollateralApprove,
  encodeGmxV2RouterCreateOrderMulticall,
  bindGmxOrderReceiver,
  GMX_COLLATERAL_SPENDER_ARBITRUM,
  readGmxCollateralAllowance,
} from "../src/services/adapters/gmx-micro-fill-router-encode";
import type { GmxV2UnsignedOrderPayload } from "../src/services/adapters/gmx-v2-adapter.types";

export const WETH_ARBITRUM = getAddress("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1");

/** BigInt-safe USD→WETH wei (avoids JS `* 1e18` precision loss above MAX_SAFE_INTEGER). */
export function usdToWethWei(sizeUsd: number, ethPriceUsd: number): bigint {
  if (!Number.isFinite(sizeUsd) || sizeUsd <= 0 || !Number.isFinite(ethPriceUsd) || ethPriceUsd <= 0) {
    throw new Error("usdToWethWei: invalid sizeUsd or ethPriceUsd");
  }
  const usdMicro = BigInt(Math.round(sizeUsd * 1_000_000));
  const priceMicro = BigInt(Math.round(ethPriceUsd * 1_000_000));
  return (usdMicro * 10n ** 18n) / priceMicro;
}

export type KernelCall = { to: Hex; value: bigint; data: Hex };

const erc20Abi = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
]);
const wethAbi = parseAbi([
  "function deposit() payable",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

const GAS_BUFFER_NUM = 150n;
const GAS_BUFFER_DEN = 100n;

function isGasFeeError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("-32000") || msg.includes("base fee") || msg.includes("baseFee")
    || msg.includes("max fee per gas") || msg.includes("maxFeePerGas") || msg.includes("underpriced");
}

export async function resolveBufferedEip1559Fees(
  client: ReturnType<typeof createPublicClient>,
): Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }> {
  const [block, fees] = await Promise.all([
    client.getBlock({ blockTag: "latest" }),
    client.estimateFeesPerGas(),
  ]);
  const baseFee = block.baseFeePerGas ?? fees.maxFeePerGas ?? 1n;
  const priority = fees.maxPriorityFeePerGas ?? 1n;
  const bufferedBase = (baseFee * GAS_BUFFER_NUM) / GAS_BUFFER_DEN;
  const rpcMax = fees.maxFeePerGas ?? bufferedBase;
  const maxFeePerGas = bufferedBase > rpcMax ? bufferedBase + priority : (rpcMax * GAS_BUFFER_NUM) / GAS_BUFFER_DEN;
  return { maxFeePerGas, maxPriorityFeePerGas: priority > 0n ? priority : 1n };
}

async function sendRouterTx(input: {
  wallet: ReturnType<typeof createWalletClient>;
  client: ReturnType<typeof createPublicClient>;
  account: ReturnType<typeof privateKeyToAccount>;
  chain: Chain;
  value: bigint;
  data: Hex;
}): Promise<Hex> {
  const fees = await resolveBufferedEip1559Fees(input.client);
  try {
    return await input.wallet.sendTransaction({
      chain: input.chain,
      to: GMX_V2_EXCHANGE_ROUTER_ARBITRUM,
      value: input.value,
      data: input.data,
      maxFeePerGas: fees.maxFeePerGas,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      gas: 3_000_000n,
    });
  } catch (err) {
    if (!isGasFeeError(err)) throw err;
    console.warn("[gmx-micro-fill] gas fee rejected — retrying with refreshed baseFee buffer");
    const retryFees = await resolveBufferedEip1559Fees(input.client);
    const [nonce] = await Promise.all([input.client.getTransactionCount({ address: input.account.address })]);
    const serialized = await input.account.signTransaction({
      chainId: input.chain.id,
      type: "eip1559",
      nonce,
      maxFeePerGas: (retryFees.maxFeePerGas * GAS_BUFFER_NUM) / GAS_BUFFER_DEN,
      maxPriorityFeePerGas: retryFees.maxPriorityFeePerGas,
      gas: 3_000_000n,
      to: GMX_V2_EXCHANGE_ROUTER_ARBITRUM,
      value: input.value,
      data: input.data,
    });
    return input.client.sendRawTransaction({ serializedTransaction: serialized });
  }
}

function isBundlerBlocked(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("403") || msg.includes("allowlist") || msg.includes("Access denied");
}

export async function ensureTokenAllowance(input: {
  client: ReturnType<typeof createPublicClient>;
  token: Hex;
  owner: Hex;
  spender: Hex;
  amount: bigint;
  pk: Hex;
  chain: Chain;
  rpc: string;
}): Promise<Hex | null> {
  const allowance = await input.client.readContract({
    address: input.token, abi: erc20Abi, functionName: "allowance", args: [input.owner, input.spender],
  });
  if (allowance >= input.amount) return null;
  const wallet = createWalletClient({
    account: privateKeyToAccount(input.pk), chain: input.chain, transport: http(input.rpc),
  });
  const fees = await resolveBufferedEip1559Fees(input.client);
  const approveTx = await wallet.writeContract({
    address: input.token,
    abi: erc20Abi,
    functionName: "approve",
    args: [input.spender, maxUint256],
    maxFeePerGas: fees.maxFeePerGas,
    maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
  });
  const receipt = await input.client.waitForTransactionReceipt({ hash: approveTx });
  if (receipt.status !== "success") throw new Error(`GMX approve reverted: ${approveTx}`);
  console.log("[gmx-micro-fill] collateral approve confirmed", {
    token: input.token, spender: input.spender, block: receipt.blockNumber.toString(), tx: approveTx,
  });
  return approveTx;
}

async function ensureCollateralAllowanceForOwner(input: {
  client: ReturnType<typeof createPublicClient>;
  owner: Hex;
  token: Hex;
  required: bigint;
  pk?: Hex;
  chain: Chain;
  rpc: string;
}): Promise<KernelCall | null> {
  const allowance = await readGmxCollateralAllowance(input.client, input.owner, input.token);
  if (allowance >= input.required) return null;
  if (input.pk) {
    await ensureTokenAllowance({
      client: input.client,
      token: input.token,
      owner: input.owner,
      spender: GMX_COLLATERAL_SPENDER_ARBITRUM,
      amount: input.required,
      pk: input.pk,
      chain: input.chain,
      rpc: input.rpc,
    });
    return null;
  }
  return { to: input.token, value: 0n, data: encodeGmxCollateralApprove() };
}

export async function dispatchGmxRouterViaEoa(input: {
  pk: Hex;
  chain: Chain;
  rpc: string;
  client: ReturnType<typeof createPublicClient>;
  payload: GmxV2UnsignedOrderPayload;
}): Promise<Hex> {
  const account = privateKeyToAccount(input.pk);
  const payload = bindGmxOrderReceiver(input.payload, account.address);
  const router = encodeGmxV2RouterCreateOrderMulticall(payload);
  const collateralToken = getAddress(payload.addresses.initialCollateralToken as Hex);
  const wallet = createWalletClient({ account, chain: input.chain, transport: http(input.rpc) });
  if (collateralToken === WETH_ARBITRUM) {
    const wethBal = await input.client.readContract({
      address: WETH_ARBITRUM, abi: erc20Abi, functionName: "balanceOf", args: [account.address],
    });
    if (wethBal < router.collateral) {
      const wrapValue = router.collateral - wethBal;
      const ethBal = await input.client.getBalance({ address: account.address });
      if (ethBal < wrapValue + router.executionFee) {
        throw new Error(`GMX_WETH_INSUFFICIENT:need=${wrapValue + router.executionFee} have=${ethBal}`);
      }
      const wrapTx = await wallet.writeContract({ address: WETH_ARBITRUM, abi: wethAbi, functionName: "deposit", value: wrapValue });
      const wrapRcpt = await input.client.waitForTransactionReceipt({ hash: wrapTx });
      console.log("[gmx-micro-fill] WETH wrap OK", { tx: wrapTx, status: wrapRcpt.status, url: `https://arbiscan.io/tx/${wrapTx}` });
    }
  } else {
    const tokenBal = await input.client.readContract({
      address: collateralToken, abi: erc20Abi, functionName: "balanceOf", args: [account.address],
    });
    if (tokenBal < router.collateral) {
      throw new Error(`GMX_COLLATERAL_INSUFFICIENT:${tokenBal}<${router.collateral}`);
    }
  }
  await ensureCollateralAllowanceForOwner({
    client: input.client,
    owner: account.address,
    token: collateralToken,
    required: router.collateral,
    pk: input.pk,
    chain: input.chain,
    rpc: input.rpc,
  });
  return sendRouterTx({
    wallet, client: input.client, account, chain: input.chain, value: router.value, data: router.data,
  });
}

export async function dispatchGmxMicroFillLive(input: {
  pk: Hex;
  chain: Chain;
  rpc: string;
  chainId: number;
  client: ReturnType<typeof createPublicClient>;
  kernel: { address: Hex; account: SmartAccount };
  payload: GmxV2UnsignedOrderPayload;
  preCalls: KernelCall[];
  projectId: string;
  forceEoa?: boolean;
}): Promise<{ tx: Hex; mode: "zerodev" | "eoa" }> {
  const router = encodeGmxV2RouterCreateOrderMulticall(input.payload);
  const routerCall: KernelCall = { to: GMX_V2_EXCHANGE_ROUTER_ARBITRUM, value: router.value, data: router.data };
  const collateralToken = getAddress(input.payload.addresses.initialCollateralToken as Hex);
  const approveCall = await ensureCollateralAllowanceForOwner({
    client: input.client,
    owner: input.kernel.address,
    token: collateralToken,
    required: router.collateral,
    chain: input.chain,
    rpc: input.rpc,
  });
  const calls = [...input.preCalls, ...(approveCall ? [approveCall] : []), routerCall];

  if (input.forceEoa || input.preCalls.length === 0) {
    const tx = await dispatchGmxRouterViaEoa({
      pk: input.pk, chain: input.chain, rpc: input.rpc, client: input.client, payload: input.payload,
    });
    return { tx, mode: "eoa" };
  }

  try {
    const bundlerRpc = buildZeroDevRpcUrl(input.projectId, input.chainId);
    const paymaster = createZeroDevPaymasterClient({ chain: input.chain, transport: http(bundlerRpc) });
    const kernelClient = createKernelAccountClient({
      account: input.kernel.account, chain: input.chain, bundlerTransport: http(bundlerRpc), client: input.client,
      paymaster: { getPaymasterData: (userOperation) => paymaster.sponsorUserOperation({ userOperation }) },
    });
    const userOpHash = await kernelClient.sendUserOperation({ calls });
    const receipt = await kernelClient.waitForUserOperationReceipt({ hash: userOpHash });
    if (!receipt.success) throw new Error("GMX micro-fill UserOp reverted");
    return { tx: receipt.receipt.transactionHash, mode: "zerodev" };
  } catch (err) {
    if (!isBundlerBlocked(err)) throw err;
    console.warn("[gmx-micro-fill] ZeroDev bundler blocked — falling back to EOA direct router dispatch");
    const tx = await dispatchGmxRouterViaEoa({
      pk: input.pk, chain: input.chain, rpc: input.rpc, client: input.client, payload: input.payload,
    });
    return { tx, mode: "eoa" };
  }
}
