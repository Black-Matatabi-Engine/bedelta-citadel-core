/** Gate EIP-712 RiskAttestation helpers for GMX micro-fill dispatch. */
import { parseAbi, type Hex, type WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { PublicClient } from "viem";
import { EIP712_DOMAIN_NAME, EIP712_DOMAIN_VERSION } from "../src/sdk/constants";

const GATE = "0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1" as Hex;
const CHAIN_ID = 42161;

const gateAbi = parseAbi(["function isSigner(address) view returns (bool)"]);

const RISK_ATTESTATION_TYPES = {
  RiskAttestation: [
    { name: "payloadHash", type: "bytes32" },
    { name: "subject", type: "address" },
    { name: "verdict", type: "uint8" },
    { name: "riskBps", type: "uint16" },
    { name: "issuedAt", type: "uint64" },
    { name: "expiresAt", type: "uint64" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

export type RiskAttestationMessage = {
  payloadHash: Hex;
  subject: Hex;
  verdict: number;
  riskBps: number;
  issuedAt: bigint;
  expiresAt: bigint;
  nonce: bigint;
};

export async function signRiskAttestation(
  wallet: WalletClient,
  att: RiskAttestationMessage,
): Promise<Hex> {
  return wallet.signTypedData({
    account: wallet.account!,
    domain: { name: EIP712_DOMAIN_NAME, version: EIP712_DOMAIN_VERSION, chainId: CHAIN_ID, verifyingContract: GATE },
    types: RISK_ATTESTATION_TYPES,
    primaryType: "RiskAttestation",
    message: att,
  });
}

export async function resolveRegisteredGateSigner(
  client: PublicClient,
  pk: Hex,
): Promise<Hex | null> {
  for (const signerPk of [(process.env.GATE_SIGNER_KEY_0 ?? "").trim(), pk].filter((k) => k.startsWith("0x")) as Hex[]) {
    const addr = privateKeyToAccount(signerPk).address;
    if (await client.readContract({ address: GATE, abi: gateAbi, functionName: "isSigner", args: [addr] })) {
      return signerPk;
    }
  }
  return null;
}

export { GATE as GMX_MICRO_FILL_GATE };
