/** Arbitrum One Stylus deploy + activate via viem (no cargo-stylus deploy subprocess). */
import {
  createPublicClient, createWalletClient, http, maxUint256, parseAbi, parseEther, parseGwei, type Hex, type PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum } from "viem/chains";
import { loadWasmInitcode } from "./stylus-wasm-initcode";

export const ARB_WASM = "0x0000000000000000000000000000000000000071" as const;
const DATA_FEE_BUMP_NUM = 120n;
const DATA_FEE_BUMP_DEN = 100n;
const MIN_MAX_FEE = parseGwei("0.15");
const MIN_PRIORITY_FEE = parseGwei("0.01");
const ACTIVATION_PROBE_VALUE = parseEther("0.0001");

const arbWasmAbi = parseAbi([
  "function activateProgram(address program) payable returns (uint16 version, uint256 dataFee)",
]);

export async function resolveStylusDeployFees(
  client: PublicClient,
): Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }> {
  const fees = await client.estimateFeesPerGas();
  const rpcMax = fees.maxFeePerGas ?? 0n;
  const doubled = rpcMax * 2n;
  const maxFeePerGas = doubled > MIN_MAX_FEE ? doubled : MIN_MAX_FEE;
  let maxPriorityFeePerGas = maxFeePerGas / 10n;
  if (maxPriorityFeePerGas < MIN_PRIORITY_FEE) maxPriorityFeePerGas = MIN_PRIORITY_FEE;
  if (maxPriorityFeePerGas > maxFeePerGas) maxPriorityFeePerGas = maxFeePerGas;
  return { maxFeePerGas, maxPriorityFeePerGas };
}

async function estimateActivationDataFee(
  client: PublicClient,
  program: Hex,
  from: Hex,
): Promise<bigint> {
  const { result } = await client.simulateContract({
    address: ARB_WASM,
    abi: arbWasmAbi,
    functionName: "activateProgram",
    args: [program],
    account: from,
    value: ACTIVATION_PROBE_VALUE,
    stateOverride: [{ address: from, balance: maxUint256 }],
  });
  const quotedFee = result[1] as bigint;
  return (quotedFee * DATA_FEE_BUMP_NUM) / DATA_FEE_BUMP_DEN;
}

export type StylusDeployResult = { contractAddress: Hex; deployTxHash: Hex; activateTxHash: Hex };

export async function deployStylusWasmViaViem(input: {
  rpc: string;
  privateKey: Hex;
  wasmPath: string;
}): Promise<StylusDeployResult> {
  const account = privateKeyToAccount(input.privateKey);
  const client = createPublicClient({ chain: arbitrum, transport: http(input.rpc) });
  const wallet = createWalletClient({ account, chain: arbitrum, transport: http(input.rpc) });
  const initcode = loadWasmInitcode(input.wasmPath);
  const fees = await resolveStylusDeployFees(client);
  const gas = await client.estimateGas({ account: account.address, data: initcode });
  const deployTxHash = await wallet.sendTransaction({
    data: initcode,
    gas,
    maxFeePerGas: fees.maxFeePerGas,
    maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
  });
  const deployReceipt = await client.waitForTransactionReceipt({ hash: deployTxHash });
  if (deployReceipt.status !== "success" || !deployReceipt.contractAddress) {
    throw new Error(`stylus deploy reverted: ${deployTxHash}`);
  }
  const contractAddress = deployReceipt.contractAddress;
  const dataFee = await estimateActivationDataFee(client, contractAddress, account.address);
  const activateGas = await client.estimateContractGas({
    address: ARB_WASM,
    abi: arbWasmAbi,
    functionName: "activateProgram",
    args: [contractAddress],
    account: account.address,
    value: dataFee,
  });
  const activateTxHash = await wallet.writeContract({
    address: ARB_WASM,
    abi: arbWasmAbi,
    functionName: "activateProgram",
    args: [contractAddress],
    value: dataFee,
    gas: activateGas,
    maxFeePerGas: fees.maxFeePerGas,
    maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
  });
  const activateReceipt = await client.waitForTransactionReceipt({ hash: activateTxHash });
  if (activateReceipt.status !== "success") {
    throw new Error(`stylus activate reverted: ${activateTxHash}`);
  }
  return { contractAddress, deployTxHash, activateTxHash };
}
