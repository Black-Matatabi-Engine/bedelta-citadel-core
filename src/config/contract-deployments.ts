/**
 * On-chain deployment SSOT — Arbitrum One (42161) · Arbitrum Sepolia (421614).
 * Docs mirror: docs/01_architecture/02_CONTRACT_DEPLOYMENT_MATRIX.md
 */
export const ARBITRUM_ONE_CHAIN_ID = 42161 as const;
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614 as const;

export type DeploymentNetwork = "mainnet" | "sepolia" | "dual";

export interface ContractDeployment {
  name: string;
  address: `0x${string}`;
  network: DeploymentNetwork;
  chainIds: readonly number[];
  role: string;
  source?: string;
}

/** Dual-deployed CREATE2 / identical ignition address on 42161 + 421614. */
export const SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS =
  "0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1" as const;

export const MAINNET_IGNITION_TX =
  "0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6" as const;

export const BOOTSTRAP_IGNITION_SIGNER_A =
  "0x1111111111111111111111111111111111111111" as const;
export const BOOTSTRAP_IGNITION_SIGNER_B =
  "0x2222222222222222222222222222222222222222" as const;

export const MAINNET_DEPLOYMENTS: readonly ContractDeployment[] = [
  {
    name: "SliverVineGate",
    address: SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS,
    network: "dual",
    chainIds: [ARBITRUM_ONE_CHAIN_ID, ARBITRUM_SEPOLIA_CHAIN_ID],
    role: "EIP-712 consume-once attestation anchor",
    source: "SliverVineGate/script/DeployArbitrumOneGate.s.sol",
  },
  {
    name: "SliverVineAgentPolicyGuardV2",
    address: "0xfd98cadb7018f692ec58cd4359e0c0399f4f8781",
    network: "mainnet",
    chainIds: [ARBITRUM_ONE_CHAIN_ID],
    role: "ERC-8196 agent policy pre-screen · stylusCoprocessor=0",
    source: "scripts/deploy-policy-guard-v2-mainnet.ts",
  },
  {
    name: "SliverVineGatePolicyLink",
    address: "0xe4ef5350963241c49a29e72a4cf093208cd19af0",
    network: "mainnet",
    chainIds: [ARBITRUM_ONE_CHAIN_ID],
    role: "Bootstrap Gate ↔ PolicyGuardV2 binding",
    source: "scripts/link-gate-policy-guard-v2.ts",
  },
  {
    name: "GmxSoilMatrixSwitch",
    address: "0x4129aee97e68aa3712c56fe9ec48bf369782f99b",
    network: "mainnet",
    chainIds: [ARBITRUM_ONE_CHAIN_ID],
    role: "Single-SLOAD defense matrix bitmap",
    source: "scripts/deploy-policy-guard-v2-mainnet.ts",
  },
  {
    name: "SliverVineRiskOracleV2",
    address: "0xfadb14759a3d3c7e976697de61bf62627f14ec93",
    network: "mainnet",
    chainIds: [ARBITRUM_ONE_CHAIN_ID],
    role: "Risk oracle feed for PolicyGuardV2",
    source: "scripts/deploy-policy-guard-v2-mainnet.ts",
  },
  {
    name: "SliverVineSoilCoprocessor",
    address: "0xc23587d6573dd134f95b02b0202ffbf84686625e",
    network: "mainnet",
    chainIds: [ARBITRUM_ONE_CHAIN_ID],
    role: "Stylus on-chain soil coprocessor (Engine A)",
    source: "scripts/deploy-stylus-mainnet.ts",
  },
];

export const SEPOLIA_ONLY_DEPLOYMENTS: readonly ContractDeployment[] = [
  {
    name: "SliverVineRiskOracle",
    address: "0x3FFa2539f502682E8145e6Eb427ff78d258D53a4",
    network: "sepolia",
    chainIds: [ARBITRUM_SEPOLIA_CHAIN_ID],
    role: "EIP-712 offline risk report · STATUS_SHUTDOWN flush",
    source: "contracts/SliverVineRiskOracle.sol",
  },
  {
    name: "IngressSafetySwitch",
    address: "0x3E4298e2b8d4e30396A54C1817Eb71c9272Ffb4B",
    network: "sepolia",
    chainIds: [ARBITRUM_SEPOLIA_CHAIN_ID],
    role: "Pillar Set X compliance filter · async escort ingress",
    source: "contracts/IngressSafetySwitch.sol",
  },
];

export const MAINNET_SUPERSEDED_DEPLOYMENTS: readonly ContractDeployment[] = [
  {
    name: "SliverVineAgentPolicyGuard v1",
    address: "0xc66f96611a737c4e58706d0955594456eab88959",
    network: "mainnet",
    chainIds: [ARBITRUM_ONE_CHAIN_ID],
    role: "Superseded by PolicyGuardV2",
  },
  {
    name: "SliverVineAgentPolicyGuard v0",
    address: "0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b",
    network: "mainnet",
    chainIds: [ARBITRUM_ONE_CHAIN_ID],
    role: "Legacy bootstrap policy guard",
  },
];

export function resolveGateAddressForChain(chainId: number): `0x${string}` {
  if (chainId === ARBITRUM_SEPOLIA_CHAIN_ID || chainId === ARBITRUM_ONE_CHAIN_ID) {
    return SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS;
  }
  return SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS;
}
