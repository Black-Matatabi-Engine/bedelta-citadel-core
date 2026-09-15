# SliverVine Protocol (BeΔ) — SliverVine ExoMesh — Dual-Plug Pre-Consensus Intent Firewall for AI Agents & Retail on Arbitrum

> 📌 **System Metrics SSOT**: Verified via [`docs/audit/SYSTEM_METRICS_SSOT.json`](docs/audit/SYSTEM_METRICS_SSOT.json)

<!-- SSOT:README_BADGES_START -->
![Vitest](https://img.shields.io/badge/Vitest-1123_PASS_%28243_files%29-brightgreen?logo=vitest)
![Zero-Alloc Hot-Path](https://img.shields.io/badge/Zero--Alloc_Hot--Path-%3C16_KiB_%2F_10k_iterations-blue?logo=vitest)
![V2.0 Stylus Probe](https://img.shields.io/badge/V2.0_Stylus_Probe-9%2F9_PASS_%28Roadmap%29-blue?logo=rust)
[![risk-control.ts coverage](https://img.shields.io/badge/risk--control.ts-100%25_coverage-success?logo=vitest)](src/services/risk-control.ts)
![Chaos Matrix](https://img.shields.io/badge/Chaos_Matrix-255%2F255_Fail--Closed-blue?logo=github)
![Benchmark Latency](https://img.shields.io/badge/Latency-E2E_p50_106µs_%7C_Reflex_p50_15µs-blueviolet?logo=speedtest)
![TypeScript](https://img.shields.io/badge/TypeScript-0_errors-blue?logo=typescript)
![License](https://img.shields.io/badge/License-BUSL--1.1-orange)
![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-Sepolia_Verified_%2842161_Ready%29-28A0F0?logo=arbitrum)
<!-- SSOT:README_BADGES_END -->

![SliverVine ExoMesh — Detox Sanctuary](public/brand/Detox_Sanctuary_wm.webp)

**SliverVine Protocol · v1.0 · BeDelta Living Water v1.0 (BeΔ)** · SilverVine Labs · **SSRC:** Slivervine Stylus ReflexCore  
**DApp:** [slivervine.xyz](https://slivervine.xyz) · **Corporate:** [silvervinelabs.com](https://silvervinelabs.com) · **Live Telemetry:** [SliverVine Protocol Master Dashboard (Dune)](https://dune.com/silvervinelabs/slivervine-protocol)

> **SliverVine ExoMesh** (Module A) — **ExoMesh Agentic Guard (EIP-1193/5792/6963+)** pre-consensus exoskeleton · **SSRC** ([`pkg/soil_core.wasm`](pkg/soil_core.wasm) · [`src/services/risk-control.ts`](src/services/risk-control.ts) · sub-1.8µs warm soil check).
> **SliverVine Sanctuary** (Module B) — **Sanctuary Async Escort (ERC-7540+)** · Treasury escort · Robinhood / Across compliance ingress.
>
> **V1.0 Buildathon Baseline:** Public Open Gateway — **no API key** · **5 RPS** (`X-SliverVine-Tier: public`).

---

## Primary SDK Entrypoint — EIP-1193+ Agentic Wallet Guard

**Primary product:** Drop-in 1-line safety wrapper for MetaMask, Rabby, Viem, and ZeroDev Kernel agents — [`@slivervine/exomesh-agentic-wallet-guard`](./src/sdk/exomesh-agentic-wallet-guard/).

```ts
import { withRetailGuardProvider } from "@slivervine/exomesh-agentic-wallet-guard";

const ethereum = withRetailGuardProvider(window.ethereum, {
  allowedSpenders: [/* routers you trust */],
  allowedVenues: [/* verifyingContract allowlist */],
});

await ethereum.request({ method: "eth_sendTransaction", params: [tx] });
// infinite approve · Permit2 phishing · EIP-712 domain drift · 4th retry → throw, $0 Gas
```

| Capability | Outcome |
|------------|---------|
| **1-line EIP-1193+ wrapping** | Drop-in for MetaMask / Rabby / Viem / ZeroDev Kernel agents |
| **0-Gas pre-sign intercept** | Toxic calldata never reaches Sequencer |
| **Local in-process reflex** | No Blockaid-class 200–800ms round-trip |
| **AI retry severance** | 4th rapid submit → `MAX_ATTEMPTS_EXCEEDED_SEVERED` |

<!-- SSOT:README_VITEST_LINE_START -->
**Verify:** `npx vitest run tests/sdk/retail-guard-provider.test.ts` **35/35** · `pnpm demo:gmx -- --trip` · **Vitest SSOT:** **243 test files | 1123 PASS clean**
<!-- SSOT:README_VITEST_LINE_END -->

### Key Architectural Moats

- **Dual-Plug Entrypoints:** `withRetailGuardProvider` (wallets) · `withExoMeshShield` (AI agent frameworks).
- **Honeypot & Jitter Armor:** 99% synthetic slippage decoy on trap RPC hosts · ±2–5 bps soil-threshold jitter.
- **Observatory Paradox Haircut:** −40 risk-score discount on `close`/`reduce` so emergency de-leveraging is never blocked.

→ Deep dive: [`02_DEFENSE_MATRIX_AND_SSRC_CORE.md` §4](./docs/01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md#hidden-engineering-gems-and-invariants)

### Honesty Boundaries

| Topic | Fact |
|-------|------|
| **Gate** | `DUAL` · Arbitrum One [`0xb174…8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) · Sepolia [`0xb174…8BF1`](https://sepolia.arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) · ignition [Tx `0x54c153…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) — Bootstrap sandbox keys (`0x1111…` / `0x2222…`); **multisig rotation scheduled for Post-Grant Milestone 1** · matrix → [`02_CONTRACT_DEPLOYMENT_MATRIX.md`](./docs/01_architecture/02_CONTRACT_DEPLOYMENT_MATRIX.md) |
| **Stylus** | `stylusCoprocessor = address(0)` → **Pure Solidity Fallback** ([`GmxRiskInvariantLib.sol`](./contracts/src/libs/GmxRiskInvariantLib.sol)) by design |
| **Rate limit** | Per-isolate **5 RPS** (`X-SliverVine-Tier: public`) — not a global Cloudflare product limiter |
| **npm SDK** | `"private": true` in [`package.json`](./src/sdk/exomesh-agentic-wallet-guard/package.json) — **public npmjs release Post-Grant Milestone 1** |

---

## Neuromorphic Security Architecture (Cerebrum vs Cerebellum)

**SliverVine ExoMesh acts as the involuntary reflex arc for autonomous AI agents (Pillar Set Y).** The LLM **Cerebrum** plans (~1–10s CoT); the **Cerebellum** shield severs toxic intents in **p50 ~15µs** — **$0 Gas** — before Sequencer ingress.

```text
┌────────────────────────────────────────────────────────────────┐
│ [Cerebrum] LLM Reasoning & Agent Loop (~1.0s - 10.0s)          │  <-- CoT / Tool Calls / Non-Deterministic
└────────────────────────────────────────────────────────────────┘
                         │ (Intent Payload)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│ [ExoMesh Reflex Arc] Cerebellum Shield (⚡ p50 ~15µs – p50 ~106µs)     │  <-- 0.015ms-0.106ms / Deterministic Fail-Closed
└────────────────────────────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     [ PASS: p50 ~106µs ]            [ FAIL: p50 ~15µs ]
    Signature Released          Reflex Deadlock Severed
```

> 🤖 **Agentic Commerce Safeguard (x402 & ERC-7683 Orthogonality)**:
> While **x402** defines HTTP 402 payment intent workflows for AI Autonomous Agents and **ERC-7683** handles cross-chain intent settlement, **SliverVine ExoMesh** operates strictly as the **Pre-Consensus Risk Engine (V8/Wasm Isolate)**. It intercepts high-risk micro-transactions, adverse price impact, and sandwich exploits *before* the agent signs or dispatches payments to the sequencer.

---

## 5-Core Venue Execution Matrix

All production lanes are protected by Wasm `checkSoilResistance()`. Pruned legacy venues (Uniswap, Aave, Morpho) retain `RESERVED_ABI_V2` bitmask holes.

| Venue | Protocol | Physical Boundary Guard | CLI Demo Command |
|-------|----------|-------------------------|------------------|
| `gmx` | **GMX v2** | OI skew / PoolTVL > **0.35** · reserve < **105%** | `pnpm demo:gmx -- --trip` |
| `pendle` | **Pendle** | Oracle TTL > **60s** · yield jitter > **200 bps** · PT maturity < **7d** | `pnpm demo:pendle -- --trip` |
| `usdai` | **USD.ai** | Peg drift > **30 bps** · oracle age > **2h** | `pnpm demo:usdai -- --trip` |
| `hyperliquid` | **Hyperliquid L1** | Spread > **20 bps** · session-key rate cap | `pnpm demo:hl -- --trip` |
| `variational` | **Variational RFQ** | Quote stale > **500ms** · OLP > **15%** | `pnpm demo:variational -- --trip` |

→ SSOT: [`02_CLI_DEMO_RUNBOOK.md`](./docs/05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md) · [`01_architecture/README.md`](./docs/01_architecture/README.md)

---

## ExoMesh Pre-Consensus Security Benchmark (SEPSB)

**What it is:** A measurable, reproducible benchmark for pre-consensus intent firewalls that decide transaction intent safety *before* signature release and *before* L2 sequencer ingress.

<!-- SSOT:README_SEPSB_TABLE_START -->
| Metric | Target | Achieved (SSOT) |
|--------|--------|-----------------|
| Reflex Latency (p50) | ≤ 20µs | **0.233µs** (Wasm) |
| Reflex Latency (p99) | ≤ 50µs | **2.299µs** (Wasm) |
| End-to-End Edge Latency (p50) | ≤ 120µs | p50 ~106µs |
| True Positive Rate (TPR) | ≥ 99.5% | **100%** |
| False Positive Rate (FPR) | ≤ 0.5% (kill-switch) | **0%** |
| Observatory Paradox Mis-block Count | 0 | **0** |
| 5-Venue Reflex Cap | < 50µs | **<50µs** (Intel(R) Core(TM) Ultra 7 155H) |
<!-- SSOT:README_SEPSB_TABLE_END -->

**Verification:**

```bash
pnpm audit:sepsb    # Run full SEPSB benchmark & export JSON snapshot
```

**Audit artifacts:** [`SEPSB_BENCHMARK_SSOT.json`](./docs/audit/SEPSB_BENCHMARK_SSOT.json) · [`SEPSB_CORPUS_SNAPSHOT.json`](./docs/audit/SEPSB_CORPUS_SNAPSHOT.json) · weekly CI via [`.github/workflows/weekly-sepsb-deploy.yml`](./.github/workflows/weekly-sepsb-deploy.yml)

<!-- SSOT:README_DUAL_TELEMETRY_START -->
> 💡 **Dual Telemetry Architecture**:
> - **Operational Shield (`/slivervine-protocol`)**: Dynamic operational feed tracking nominal volume, saved execution gas, and intercept counts (`pnpm export:dune` · daily cumulative append).
> - **SEPSB Quant Matrix (`/slivervine-sepsb-stress`)**: Deterministic benchmark runner proving 100% TPR, 0% FPR, and sub-50µs Wasm reflex speeds across 5 venues (GMX, Pendle, USD.ai, Hyperliquid, Variational).

> 🔗 **On-Chain Event Indexing**: `SliverVineGate` (`0xb174…8BF1`) is equipped with standard EVM event emitters. The protocol includes an active on-chain indexer interface (`pnpm export:dune:onchain`) — status **INTERFACE_READY** — ready for direct mainnet event ingestion post-buildathon.
<!-- SSOT:README_DUAL_TELEMETRY_END -->

### 🔗 Relation to Industry Standards (x402, ERC-7683 & Simulation Engine)

- **Orthogonal to x402 (HTTP 402)**: x402 defines agent payment *intent dispatch* over HTTP 402; ExoMesh is the **pre-sign / pre-sequencer risk gate** — not a payment rail — blocking poisoned liquidity and oracle-drift traps on automated micro-payments before wallets sign.
- **Orthogonal to ERC-7683**: ERC-7683 defines cross-chain intent *settlement & solver formats*. SliverVine ExoMesh operates strictly *before* settlement, acting as a sub-microsecond pre-consensus firewall before signatures enter solver/sequencer pipelines.
- **Complementary to Simulation Scanners**: While simulation tools (e.g. Blockaid) take 100–300ms via cloud RPC, SEPSB targets microsecond-class local/edge WASM decisions with 0-Gas rejected paths.

---

## Standards Compliance — 3-Tier EIP/ERC Taxonomy

> **Engineering honesty:** SliverVine is an **Off-Chain Client/Edge Pre-Consensus Intent Firewall**. Read the **Status** column before citing any EIP/ERC claim.

| Tier | Status Label | Standards | Narrative |
| ---- | ------------ | --------- | --------- |
| **1** | `[Final]` | **EIP-1193+** · **EIP-5792** · **ERC-7540+** | **100% compliant** with standard specs, extended into **0-Gas pre-consensus security supersets** (ExoMesh & Sanctuary) |
| **2** | `[De-facto Industrial Draft]` | **ERC-7683** (Uniswap/Across) · **ERC-7579** (ZeroDev/Rhinestone) | **Semantic alignment** — not normative Final conformance; production code maps to industrial draft problem spaces |
| **3** | `[Unrelated Draft — Not Implemented]` | [EIP-8105](https://eips.ethereum.org/EIPS/eip-8105) · [EIP-8079](https://eips.ethereum.org/EIPS/eip-8079) · [ERC-8226](https://eips.ethereum.org/EIPS/eip-8226) · [ERC-8118](https://eips.ethereum.org/EIPS/eip-8118) | **No implementation claim** — see [wiki §](./docs/02_eip_extensions/01_EIP_COMPLIANCE_AND_COMPETITIVE_MATRIX.md#conceptual-industry-alignment-targets-draft--emerging-eips) |

### Partner & Standards Compliance

| Partner / Stack | Badge | Integration highlight |
| --------------- | ----- | --------------------- |
| **ZeroDev** | **ZeroDev AA Ready** | Kernel v3 AA · ERC-7715 Session Mandates · Paymaster 0-Gas Sponsored (ERC-7710 Expiry Sinker) · `pnpm demo:delta-neutral` (`--zerodev=on` default) |

---

## Performance Verification & Latency Hierarchy

| Tier | Metric | Scope | Canonical Verification Command |
|------|--------|-------|-------------------------------|
| **Pure Invariant Math** | **~0.5µs–1.1µs** | Isolated `checkSoilResistance()` — no async I/O | CLI HUD `Pure Invariant Time` row |
| **Stylus ReflexCore (SSRC)** | **p50 ~15µs** | `rootProtection()` · `severSigningChannel()` · `soil_core.wasm` | `pnpm demo:gmx -- --trip` |
| **E2E ExoMesh Edge** | **p50 ~106µs** | Cloudflare Worker + TS Gateway + SSRC FFI | `pnpm demo:gmx` |
| **Worker bundle (hot-path)** | **58.72 KiB gzip** | 166.51 KiB raw · `limitKiB: 150` · pass | `pnpm bundle:measure` |

*Zero-Allocation Hot-Path:* Pre-allocated **256×4 ring slab** achieves `<16 KiB` heap delta over 10,000 iterations — `npx vitest run tests/core/intent-sinking-audit.test.ts`.

---

## Installation & Quickstart

```bash
pnpm install
```

> ℹ️ **Buildathon Audit Note**: `@slivervine/exomesh-agentic-wallet-guard` is currently loaded via local workspace packages (`private: true`) for reproducible evaluation. NPM public registry distribution is scheduled post-grant.

Import the SDK from the monorepo workspace (not npmjs):

```ts
import { withRetailGuardProvider } from "@slivervine/exomesh-agentic-wallet-guard";
```

---

## 🧪 Verification

```bash
pnpm exec tsc --noEmit

# Run SDK & Risk Engine test suite
pnpm test
```

---

## Quick Verification Reference

```bash
# Tier 0 — Fully Demo (Flagship · Module A + B · Scenario A–D)
pnpm demo:exomesh                 # EIP-1193+ Agentic Guard · interactive Scenario A–D matrix
pnpm demo:exomesh -- --json       # CI / Dune structured output

# Tier 1 — 5-Venue Fast-Track Proofs (0-Gas FAIL_CLOSED)
pnpm demo:gmx -- --trip           # GMX v2 FAIL_CLOSED proof
pnpm demo:pendle -- --trip        # Pendle Institutional Sentinel FAIL_CLOSED proof
pnpm demo:usdai -- --trip         # USD.ai Collateral FAIL_CLOSED proof
pnpm demo:hl -- --trip            # Hyperliquid Session Guard FAIL_CLOSED proof
pnpm demo:variational -- --trip   # Variational RFQ FAIL_CLOSED proof

# Tier 2 — Specific Standards & Strategy Use Cases
pnpm demo:sanctuary               # Module B · ERC-7540+ Async Vault Escort (Scenario A–C · `--json`)
pnpm demo:ingress                 # Module B · Across/Robinhood AML Compliance Ingress (Scenario A–C · `--json`)
pnpm demo:delta-neutral           # Multi-venue delta-neutral hedge lifecycle (`--zerodev=on` default · `--json`)
pnpm demo:delta-neutral -- --zerodev=off  # Native EIP-1193 signer (AA disabled)

# Unit Verification & Full Test Suite
npx vitest run tests/sdk/retail-guard-provider.test.ts  # 35/35
<!-- SSOT:README_TEST_CMD_START -->
pnpm test -- --run                                       # 243 files | 1123 PASS
<!-- SSOT:README_TEST_CMD_END -->
pnpm run audit:security                                  # 3-Axis: 5/0/0 PASS
pnpm audit:sepsb                                         # SEPSB benchmark + corpus snapshot
```

---

## Documentation Hub

| Priority | Document | Purpose |
|----------|----------|---------|
| **1** | [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) | 30-second scorecard |
| **2** | [`01_VERIFICATION_MATRIX.md`](./docs/06_verifications/01_VERIFICATION_MATRIX.md) | CLI proof index |
| **3** | [`SUBMISSION.md`](./docs/00_ARB_Buildathon/SUBMISSION.md) | Technical spec entry |
| **4** | [`01_SDK_INTEGRATION_BLUEPRINT.md`](./docs/04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md) | SDK integration |
| **5** | [`01_architecture/README.md`](./docs/01_architecture/README.md) | Yellow Paper · R01–R20 |
| **6** | [`01_EIP_COMPLIANCE…`](./docs/02_eip_extensions/01_EIP_COMPLIANCE_AND_COMPETITIVE_MATRIX.md) | EIP/ERC taxonomy |
| **7** | [`03_DUNE_DASHBOARD_SPECIFICATION.md`](./docs/03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md) | **Module A/B** Dune telemetry · [live dashboard](https://dune.com/silvervinelabs/slivervine-protocol) |

**Protocol & Entity:** SilverVine Labs · `grants@silvervinelabs.com` · Apache-2.0 SDK · BUSL-1.1 contracts → [LICENSE](./LICENSE)

---

## 🛡️ Honesty & Operational Boundaries

| Dimension | Current State | Target / Roadmap |
| :--- | :--- | :--- |
| **Admin Multisig** | Bootstrap Safe Admin Active | Timelock + 3/5 Multisig Governance (Post-Grant M1) |
| **Stylus Coprocessor** | EVM Assembly Fallback Active | WASM Native Stylus Deployment (Arbitrum One) |
| **Package Registry** | Private (`"private": true` in `package.json`) | Public NPM Release Post-Audit Completion |
| **Soil Probe Intercept** | Edge Wasm + Fallback Gateway | 100% On-Chain Hard Ingress Gate Verification |
