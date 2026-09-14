# SliverVine Protocol (BeΔ) — ExoMesh Pre-Consensus Intent Firewall for AI Agents on Arbitrum

![Vitest](https://img.shields.io/badge/Vitest-1081%20PASS%20%28231%20files%29-brightgreen?logo=vitest)
![Zero-Alloc Hot-Path](https://img.shields.io/badge/Zero--Alloc_Hot--Path-%3C16%20KiB%20%2F%2010k%20iterations-blue?logo=vitest)
![V2.0 Stylus Probe](https://img.shields.io/badge/V2.0_Stylus_Probe-9%2F9_PASS_(Roadmap)-blue?logo=rust)
![risk-control.ts coverage](https://img.shields.io/badge/risk--control.ts-100%25%20coverage-success?logo=vitest)
![Chaos Matrix](https://img.shields.io/badge/Chaos%20Matrix-255%2F255%20Fail--Closed-blue?logo=github)
![Benchmark Latency](https://img.shields.io/badge/Latency-E2E_p50_106%CE%BCs_|_Reflex_p50_15%CE%BCs-blueviolet?logo=speedtest)
![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue?logo=typescript)
![License](https://img.shields.io/badge/License-BUSL--1.1-orange)
![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-Sepolia_Verified_(42161_Ready)-28A0F0?logo=arbitrum)

![SliverVine ExoMesh — Detox Sanctuary](public/brand/Detox_Sanctuary_wm.webp)

**SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) · SilverVine Labs ·** `v0.95 Santenmoku Core`  
**DApp:** [slivervine.xyz](https://slivervine.xyz) · **Corporate:** [silvervinelabs.com](https://silvervinelabs.com) · **Live Telemetry:** [SliverVine Protocol Master Dashboard (Dune)](https://dune.com/silvervinelabs/slivervine-protocol)

> **SliverVine ExoMesh** (Module A) — **ExoMesh Agentic Guard (EIP-1193/5792/6963+)** pre-consensus exoskeleton · **SSRC** ([`pkg/soil_core.wasm`](pkg/soil_core.wasm) · sub-1.8µs warm soil check).
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

**Verify:** `npx vitest run tests/sdk/retail-guard-provider.test.ts` **35/35** · `pnpm demo:gmx -- --trip` · **Vitest SSOT:** **231 test files | 1081 PASS clean**

### Key Architectural Moats

- **Dual-Plug Entrypoints:** `withRetailGuardProvider` (wallets) · `withExoMeshShield` (AI agent frameworks).
- **Honeypot & Jitter Armor:** 99% synthetic slippage decoy on trap RPC hosts · ±2–5 bps soil-threshold jitter.
- **Observatory Paradox Haircut:** −40 risk-score discount on `close`/`reduce` so emergency de-leveraging is never blocked.

→ Deep dive: [`02_DEFENSE_MATRIX_AND_SSRC_CORE.md` §4](./docs/01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md#hidden-engineering-gems-and-invariants)

### Honesty Boundaries

| Topic | Fact |
|-------|------|
| **Gate** | [`0xb174…8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) — Bootstrap sandbox keys (`0x1111…` / `0x2222…`); **multisig rotation scheduled for Post-Grant Milestone 1** |
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

## Standards Compliance — 3-Tier EIP/ERC Taxonomy

> **Engineering honesty:** SliverVine is an **Off-Chain Client/Edge Pre-Consensus Intent Firewall**. Read the **Status** column before citing any EIP/ERC claim.

| Tier | Status Label | Standards | Narrative |
| ---- | ------------ | --------- | --------- |
| **1** | `[Final]` | **EIP-1193+** · **EIP-5792** · **ERC-7540+** | **100% compliant** with standard specs, extended into **0-Gas pre-consensus security supersets** (ExoMesh & Sanctuary) |
| **2** | `[De-facto Industrial Draft]` | **ERC-7683** (Uniswap/Across) · **ERC-7579** (ZeroDev/Rhinestone) | **Semantic alignment** — not normative Final conformance; production code maps to industrial draft problem spaces |
| **3** | `[Unrelated Draft — Not Implemented]` | [EIP-8105](https://eips.ethereum.org/EIPS/eip-8105) · [EIP-8079](https://eips.ethereum.org/EIPS/eip-8079) · [ERC-8226](https://eips.ethereum.org/EIPS/eip-8226) · [ERC-8118](https://eips.ethereum.org/EIPS/eip-8118) | **No implementation claim** — see [wiki §](./docs/02_eip_extensions/01_EIP_COMPLIANCE_AND_COMPETITIVE_MATRIX.md#conceptual-industry-alignment-targets-draft--emerging-eips) |

---

## Performance Verification & Latency Hierarchy

| Tier | Metric | Scope | Canonical Verification Command |
|------|--------|-------|-------------------------------|
| **Pure Invariant Math** | **~0.5µs–1.1µs** | Isolated `checkSoilResistance()` — no async I/O | CLI HUD `Pure Invariant Time` row |
| **Stylus ReflexCore (SSRC)** | **p50 ~15µs** | `rootProtection()` · `severSigningChannel()` · `soil_core.wasm` | `pnpm demo:gmx -- --trip` |
| **E2E ExoMesh Edge** | **p50 ~106µs** | Cloudflare Worker + TS Gateway + SSRC FFI | `pnpm demo:gmx` |
| **Worker bundle (hot-path)** | **57.76 KiB gzip** | 163.67 KiB raw · `limitKiB: 150` · pass | `pnpm bundle:measure` |

*Zero-Allocation Hot-Path:* Pre-allocated **256×4 ring slab** achieves `<16 KiB` heap delta over 10,000 iterations — `npx vitest run tests/core/intent-sinking-audit.test.ts`.

---

## Quick Verification Reference

```bash
# 1-Line 5-Venue Trip Verification (0-Gas Pre-Consensus Interceptions)
pnpm demo:gmx -- --trip           # GMX v2 FAIL_CLOSED proof
pnpm demo:pendle -- --trip        # Pendle Institutional Sentinel FAIL_CLOSED proof
pnpm demo:usdai -- --trip         # USD.ai Collateral FAIL_CLOSED proof
pnpm demo:hl -- --trip            # Hyperliquid Session Guard FAIL_CLOSED proof
pnpm demo:variational -- --trip   # Variational RFQ FAIL_CLOSED proof

# Unit Verification & Full Test Suite
npx vitest run tests/sdk/retail-guard-provider.test.ts  # 35/35
pnpm test -- --run                                       # 231 files | 1081 PASS
pnpm run audit:security                                  # 3-Axis: 5/0/0 PASS
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
