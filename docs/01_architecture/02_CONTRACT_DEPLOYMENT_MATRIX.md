# Contract Deployment Matrix — Mainnet & Sepolia SSOT

> **Code SSOT:** [src/config/contract-deployments.ts](../../src/config/contract-deployments.ts) · **SDK re-exports:** [src/sdk/constants.ts](../../src/sdk/constants.ts) 
> **Extended proofs:** [03_ON_CHAIN_MAINNET_ANCHORS.md](../06_verifications/03_ON_CHAIN_MAINNET_ANCHORS.md) · [SUBMISSION_GRANT_APPENDIX.md](../00_ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md)

**Audit date:** 2026-09-14 · **Networks:** Arbitrum One `42161` · Arbitrum Sepolia `421614`

---

## Network Legend

| Badge | Chain | Role |
|-------|-------|------|
| `MAINNET` | Arbitrum One `42161` | Production anchors · GMX GM I/O · PolicyGuardV2 · Stylus coprocessor |
| `SEPOLIA` | Arbitrum Sepolia `421614` | Live Dune event stream · async escort sandbox · stabilizer demos |
| `DUAL` | Both `42161` + `421614` | Identical `SliverVineGate` address (bootstrap ignition) |

---

## Dual-Deployed / Shared Contracts

| Contract | Address | Badge | Role |
|----------|---------|-------|------|
| **SliverVineGate** | [0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) | `DUAL` | EIP-712 consume-once attestation · `IntentAttested` · `RiskTripBlocked` |
| **Bootstrap Ignition Signer A** | `0x1111…1111` | `DUAL` | Sandbox verification key (multisig rotation post-grant) |
| **Bootstrap Ignition Signer B** | `0x2222…2222` | `DUAL` | Sandbox verification key (multisig rotation post-grant) |

**Mainnet ignition:** [Tx 0x54c153…b0c6](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · **Sepolia explorer:** [sepolia.arbiscan.io](https://sepolia.arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1)

---

## Mainnet Deployed Only (`42161`)

| Contract | Address | Role | Deploy harness |
|----------|---------|------|----------------|
| **SliverVineAgentPolicyGuardV2** | [0xfd98cadb…8781](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) | ERC-8196 policy pre-screen · `stylusCoprocessor=0` | `scripts/deploy-policy-guard-v2-mainnet.ts` |
| **SliverVineGatePolicyLink** | [0xe4ef5350…9af0](https://arbiscan.io/address/0xe4ef5350963241c49a29e72a4cf093208cd19af0) | Gate ↔ PolicyGuardV2 binding | `scripts/link-gate-policy-guard-v2.ts` |
| **GmxSoilMatrixSwitch** | [0x4129aee9…f99b](https://arbiscan.io/address/0x4129aee97e68aa3712c56fe9ec48bf369782f99b) | Defense matrix single-SLOAD bitmap | `scripts/deploy-policy-guard-v2-mainnet.ts` |
| **SliverVineRiskOracleV2** | [0xfadb1475…ec93](https://arbiscan.io/address/0xfadb14759a3d3c7e976697de61bf62627f14ec93) | Risk oracle for PolicyGuardV2 | `scripts/deploy-policy-guard-v2-mainnet.ts` |
| **SliverVineSoilCoprocessor** (Stylus) | [0xc23587d6…625e](https://arbiscan.io/address/0xc23587d6573dd134f95b02b0202ffbf84686625e) | On-chain soil coprocessor (Engine A) | `scripts/deploy-stylus-mainnet.ts` |

### Mainnet Superseded (historical — do not wire new integrations)

| Contract | Address | Status |
|----------|---------|--------|
| PolicyGuard v1 | [0xc66f9661…8959](https://arbiscan.io/address/0xc66f96611a737c4e58706d0955594456eab88959) | Superseded by V2 |
| PolicyGuard v0 | [0x3e4298e2…fb4b](https://arbiscan.io/address/0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b) | Legacy bootstrap |

### Embedded libraries (no separate deploy)

| Module | Role |
|--------|------|
| `GmxRiskInvariantLib` | Pure Solidity GMX wire invariants inside PolicyGuardV2 bytecode |
| `GmxMulticallDecodeLib` | GMX multicall decode helpers |

---

## Sepolia Testnet Deployed Only (`421614`)

| Contract | Address | Role | Source |
|----------|---------|------|--------|
| **SliverVineRiskOracle** | [0x3FFa2539…D53a4](https://sepolia.arbiscan.io/address/0x3ffa2539f502682e8145e6eb427ff78d258d53a4) | EIP-712 offline risk report · `STATUS_SHUTDOWN` | `contracts/SliverVineRiskOracle.sol` |
| **IngressSafetySwitch** | [0x3E4298e2…Fb4B](https://sepolia.arbiscan.io/address/0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b) | Pillar Set X compliance · ERC-7540+ async escort ingress | `contracts/IngressSafetySwitch.sol` |
| **Sepolia deployer / admin** | `0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F` | Forge broadcast signer | `scripts/deploy-sepolia-gate.sol` |
| **GMX Sepolia DataStore** (mock) | `0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8` | Stabilizer / GMX sandbox probe | `scripts/sepolia-gmx-hl-interact.ts` |

**Sepolia Stylus coprocessor:** code-verified via `pnpm build:stylus` · EIP-1967 proxy path — **not** the mainnet `0xc23587…` address.

---

## Module Mapping (Telemetry vs On-Chain)

| Module | Network focus | Primary contracts |
|--------|---------------|-------------------|
| **Module A — SliverVine ExoMesh** | Off-chain + both chains | Edge Wasm · `dataset_exomesh_intercepts` · Gate EIP-712 domain |
| **Module B — SliverVine Sanctuary** | Sepolia live stream + Mainnet anchors | `IngressSafetySwitch` (Sepolia) · `SliverVineGate` (`DUAL`) · PolicyGuardV2 (Mainnet) |

---

## Environment Variables (RPC SSOT)

| Variable | Network | Purpose |
|----------|---------|---------|
| `ARB_MAINNET_RPC_URL` | `42161` | Mainnet deploy / GMX GM scripts |
| `ARB_SEPOLIA_RPC_URL` | `421614` | Sepolia Gate telemetry · stabilizer demos |
| `MAINNET_PK` | `42161` | Armed mainnet broadcast (`BROADCAST=1` + confirm flags) |
| `SLIVERVINE_GATE_ADDRESS` | Worker override | Optional Worker env → `gate-domain-fingerprint.ts` |

See [.env.example](../../.env.example) for full RPC / WSS placeholders.

---

## Verification Commands

```bash
pnpm exec tsc --noEmit
pnpm test -- --run
cd SliverVineGate && forge test
pnpm deploy:stylus:mainnet # dry-run Stylus preflight
pnpm tsx scripts/deploy-sepolia-gate.sol # Sepolia Gate (Forge)
```
