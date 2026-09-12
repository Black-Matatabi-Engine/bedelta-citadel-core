# SliverVine Protocol (BeΔ) — ExoMesh Pre-Consensus Intent Firewall for AI Agents on Arbitrum

**SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) · SilverVine Labs ·** `v0.95 Santenmoku Core`  
**DApp:** [slivervine.xyz](https://slivervine.xyz) · **Corporate:** [silvervinelabs.com](https://silvervinelabs.com)

> **SliverVine ExoMesh** (Module A · ~70% pitch) — **ExoMesh Agentic Guard (EIP-1193/5792/6963+)** pre-consensus exoskeleton · powered by **SliverVine Stylus ReflexCore (SSRC)** (`pkg/soil_core.wasm` + Arbitrum Stylus coprocessor · sub-1.8µs warm soil check).  
> **SliverVine Sanctuary** (Module B · ~30% pitch) — **Sanctuary Async Escort (ERC-7540+)** · Treasury escort router · Robinhood / Across compliance ingress · Pillar Set X.
>
> **Standards compliance:** SliverVine Protocol is **100% compliant** with standard [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) / [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) and [ERC-7540](https://eips.ethereum.org/EIPS/eip-7540) specs, while extending them into **0-Gas pre-consensus security supersets** (ExoMesh & Sanctuary).
>
> *Former umbrella title "SliverVine Citadel Shield" is retired; **ExoMesh** is the hero product; **SSRC** is the underlying Stylus/Wasm reflex engine inside it.*

![Vitest](https://img.shields.io/badge/Vitest-1065%20PASS%20%28228%20files%29-brightgreen?logo=vitest)
![Zero-Alloc Hot-Path](https://img.shields.io/badge/Zero--Alloc_Hot--Path-%3C16%20KiB%20%2F%2010k%20iterations-blue?logo=vitest)
![V2.0 Stylus Probe](https://img.shields.io/badge/V2.0_Stylus_Probe-9%2F9_PASS_(Roadmap)-blue?logo=rust)
![risk-control.ts coverage](https://img.shields.io/badge/risk--control.ts-100%25%20coverage-success?logo=vitest)
![Chaos Matrix](https://img.shields.io/badge/Chaos%20Matrix-255%2F255%20Fail--Closed-blue?logo=github)
![Benchmark Latency](https://img.shields.io/badge/Latency-E2E_p50_106%CE%BCs_|_Reflex_p50_15%CE%BCs-blueviolet?logo=speedtest)
![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue?logo=typescript)
![License](https://img.shields.io/badge/License-BUSL--1.1-orange)
![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-Sepolia_Verified_(42161_Ready)-28A0F0?logo=arbitrum)

![SliverVine ExoMesh — Detox Sanctuary](public/brand/Detox_Sanctuary_wm.webp)



---



## 🚀 Standards Moat — How SilverVine Solves Next-Gen EIPs

> **Industry's First [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) Edge-Wasm 0-Gas Pre-Consensus Reference Implementation** — [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) · [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) · [ERC-7683](https://eips.ethereum.org/EIPS/eip-7683) · [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) · [ERC-7710](https://eips.ethereum.org/EIPS/eip-7710) · [ERC-8226](https://eips.ethereum.org/EIPS/eip-8226) · [EIP-8079](https://eips.ethereum.org/EIPS/eip-8079).
>
> SilverVine executes Edge-Wasm policy validation **before** Arbitrum Sequencer ingress — **0-Gas burned on rejections**.
>
> **Zero-Allocation Hot-Path**: The pre-consensus microsecond execution phase operates on pre-allocated static `Uint32Array` slabs and Wasm linear memory with **zero ephemeral heap allocations** (~**50,000 ephemeral heap objects/sec eliminated** on the RPC reflex arc), while non-critical cold paths (user warning formatters, error loggers) remain standard readable TypeScript.


| Standard / EIP                                             | The Architectural Limitation (The Problem)                                                              | SilverVine Breakthrough (How We Solve It)                                                                                                                                                    | Code & Test Proof Anchor                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) / [ERC-8118 (draft)](./docs/02_eip_extensions/01_EIP_COMPLIANCE_AND_COMPETITIVE_MATRIX.md#erc-8196--erc-8118--ai-agent-authenticated-wallet-off-chain-reference-implementation)** *(AI Authenticated Policy Engine)* | On-chain policy checks burn Gas and cannot catch prompt-injection intent drifts pre-execution. | **[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) Middleware (**`withRetailGuardProvider`**)** intercepts `eth_sendTransaction` and [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) `wallet_sendCalls`, running **sub-10ms, 0-Gas** Wasm calldata validation. | `src/sdk/eip1193-agentic-wallet-guard/` `tests/sdk/retail-guard-provider.test.ts` **(35 PASS)** · `eip5792-send-calls.test.ts` **(3 PASS)** |
| **[EIP-5792](https://eips.ethereum.org/EIPS/eip-5792)** *(Wallet Call API)* | `wallet_sendCalls` batches bypass `eth_sendTransaction`-only middleware. | [`eip5792-send-calls.ts`](./src/sdk/eip1193-agentic-wallet-guard/eip5792-send-calls.ts) unfolds `calls[]` into the retail risk stack · empty/malformed batch fail-closed · one intent-ring attempt per batch. | `tests/sdk/eip5792-send-calls.test.ts` **(3 PASS)** |
| **[ERC-7715](https://eips.ethereum.org/EIPS/eip-7715) / [ERC-8226](https://eips.ethereum.org/EIPS/eip-8226)** *(Attenuated Session Mandates)*    | Lack of zero-gas enforcement for multi-agent delegation decay and cumulative spend caps.       | `INTENT_RING_U32` + `[agentic-auto-roll-gate.ts](./src/services/api/pendle-shield/agentic-auto-roll-gate.ts)` real-time spend attempt tracking; severs channel prior to signing. | `src/services/api/pendle-shield/` `tests/services/api/pendle-shield.test.ts` **(7/7 PASS)**           |
| **[EIP-8079](https://eips.ethereum.org/EIPS/eip-8079) / [EIP-8105](https://eips.ethereum.org/EIPS/eip-8105)** *(Pre-Consensus 0-Gas Gateway)*    | Blind mempool ingress without a 0-Gas transaction withdrawal mechanism against MEV.            | **Client-Side Preconf Gateway** in Wasm (`[soil-resistance-core.ts](./src/core/soil-resistance-core.ts)`) simulates execution and aborts locally before broadcast.               | `src/core/soil-resistance-core.ts` `tests/core/protocol-mask-sync.test.ts` **(6 PASS)**                  |
| **[ERC-7683](https://eips.ethereum.org/EIPS/eip-7683)** *(Cross-Chain Intent Standard)* | Solver MEV and slippage exploitation on `CrossChainOrder` fills before signature release. | Client-side Edge-Wasm pre-signature simulation via [`erc7683-intent-guard.ts`](./src/sdk/eip1193-agentic-wallet-guard/erc7683-intent-guard.ts) — execution delta + solver MEV bps gate (**sub-10ms**). | `tests/sdk/erc7683-intent-guard.test.ts` **(3 PASS)** |
| **[EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)** *(Set EOA Account Code)* | Prompt-injected EOA delegation can install malicious implementation bytecode pre-broadcast. | [`eip7702-auth-guard.ts`](./src/sdk/eip1193-agentic-wallet-guard/eip7702-auth-guard.ts) decodes `authorization` tuples · whitelisted implementation invariant matrix. | `tests/sdk/eip7702-auth-guard.test.ts` **(3 PASS)** |
| **[ERC-7710](https://eips.ethereum.org/EIPS/eip-7710)** *(Intent Delegations & Expiry)* | No zero-gas cancellation path when soil resistance trips before sequencer inclusion. | [`erc7710-intent-expiry.ts`](./src/services/api/pendle-shield/erc7710-intent-expiry.ts) binds `rootProtection()` (**p50 ~15µs**) · emits Permit2 deadline expiry cancellation signal. | `tests/services/api/erc7710-intent-expiry.test.ts` **(2 PASS)** |


→ Wiki: [`01_EIP_COMPLIANCE_AND_COMPETITIVE_MATRIX.md`](./docs/02_eip_extensions/01_EIP_COMPLIANCE_AND_COMPETITIVE_MATRIX.md#next-gen-eip-defense-matrix-erc-7683-eip-7702-erc-7710)

---

## Product Modules — ExoMesh (70%) + Sanctuary (30%)

### SliverVine ExoMesh — Hero Product (~70%)

| Surface | SSOT | Verify |
|---------|------|--------|
| **ExoMesh Agentic Guard (EIP-1193/5792/6963+)** | [`src/sdk/eip1193-agentic-wallet-guard/`](./src/sdk/eip1193-agentic-wallet-guard/) | `pnpm demo:eip1193` · `npx vitest run tests/sdk/retail-guard-provider.test.ts` |
| Wasm reflex core (`rootProtection`, `checkSoilResistance`) | [`docs/01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](./docs/01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md) | `pnpm demo:gmx -- --trip` |
| 5-Core Venue Matrix | GMX · Pendle · USD.ai · HL · Variational | `pnpm demo:{gmx,hl,variational} -- --trip` |

### SliverVine Sanctuary — Escrow Support (~30%)

| Surface | SSOT | Verify |
|---------|------|--------|
| Institutional Treasury Escort Router | [`treasury-escort-router.ts`](./src/adapters/robinhood/treasury-escort-router.ts) | `pnpm demo:escort` |
| Across ingress / AML unidirectional escort | [`across-ingress-bridge.ts`](./src/adapters/across-ingress-bridge.ts) | `tests/adapters/across-ingress-bridge.test.ts` |
| **Sanctuary Async Escort (ERC-7540+)** (selector-level) | [`erc7540-async-escort.ts`](./src/sdk/eip1193-agentic-wallet-guard/erc7540-async-escort.ts) | `npx vitest run tests/erc7540-async-escort.test.ts` |

---

## ⚡ Key Architectural Innovations & Invariants

- **0-Gas Pre-Consensus Sequencer Defense:** Unverified intents are rejected at Edge isolates before Arbitrum Sequencer queues — **0-Gas on fail-closed paths**.
- **Physical Deadlock (**`rootProtection`**):** Wasm reflex core severs [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signing channels at **p50 ~15µs** before toxic payloads reach bundler ingress.
- **5-Core Venue Matrix:** Hardened execution boundaries across GMX v2, Pendle, USD.ai, Hyperliquid, and Variational with zero capital leakage ($lostUsd \equiv 0$).
- **SliverVine ExoMesh (Module A):** `@slivervine/eip1193-agentic-wallet-guard` — `withRetailGuardProvider()` intercepts `eth_sendTransaction` / `eth_signTypedData_v4` / [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) `wallet_sendCalls` pre-consensus · verify: `pnpm demo:eip1193`.
- **SliverVine Sanctuary (Module B · Pillar Set X Escrow Substrate):** ChainId **`46630`** (testnet) / **`4663`** (mainnet) · Institutional Treasury Escort Router · outbound escort **`46630`/`4663` → `42161`** · inbound AML block · verify: `pnpm demo:escort`.

---



## 🎯 5-Core Venue Execution Matrix

All production lanes are protected by Wasm `checkSoilResistance()`. Pruned legacy venues (Uniswap, Aave, Morpho) retain `RESERVED_ABI_V2` bitmask holes to ensure 100% C-ABI binary compatibility.


| Venue         | Protocol            | Physical Boundary Guard                           | CLI Demo Command                  |
| ------------- | ------------------- | ------------------------------------------------- | --------------------------------- |
| `gmx`         | **GMX v2**          | OI skew / PoolTVL > **0.35** · reserve < **105%** | `pnpm demo:gmx -- --trip`         |
| `pendle`      | **Pendle**          | |Yield − oracle| > **150 bps** · Auto-Roll Gate   | `pnpm demo:pendle`                |
| `usdai`       | **USD.ai**          | Peg drift > **30 bps** · oracle age > **2h**      | `pnpm demo:usdai -- --trip`       |
| `hyperliquid` | **Hyperliquid L1**  | Spread > **20 bps** · session-key rate cap        | `pnpm demo:hl -- --trip`          |
| `variational` | **Variational RFQ** | Quote stale > **500ms** · OLP > **15%**           | `pnpm demo:variational -- --trip` |


→ SSOT Guide: [`docs/05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md`](./docs/05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md) · Architecture: [`docs/01_architecture/README.md`](./docs/01_architecture/README.md)

---



## ⚡ Neuromorphic Security Architecture (AEB Analogy)

**SliverVine ExoMesh acts as the involuntary reflex arc for autonomous AI agents (Pillar Set Y).**

**AEB Analogy:** Think of SliverVine ExoMesh like **Automated Emergency Braking (AEB)** in a vehicle. The LLM **Cerebrum** plans the trading strategy (~1–10s Chain-of-Thought). The **Cerebellum reflex arc** slams the brakes in **p50 ~15µs** before the transaction leaves the agent's cabin — **$0 Gas burned** — before reaching the Sequencer queue or mempool.

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

## ⏱️ Performance Verification & Latency Hierarchy

SliverVine ExoMesh reports three statistical latency tiers:


| Tier                    | Metric           | Scope (What is Measured)                                                                  | Canonical Verification Command             |
| ----------------------- | ---------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Pure Invariant Math** | **~0.5µs–1.1µs** | Isolated `checkSoilResistance()` pure-math kernel — no async I/O.                | CLI HUD `Pure Invariant Time` row |
| **Stylus ReflexCore (SSRC)** | **p50 ~15µs** | `rootProtection()` physical deadlock · `severSigningChannel()` · `pkg/soil_core.wasm` warm path. | `pnpm demo:gmx -- --trip` |
| **E2E ExoMesh Edge**    | **p50 ~106µs**   | Cloudflare Worker + TS Gateway + SSRC FFI (ExoMesh exoskeleton over ReflexCore). | `pnpm demo:gmx`                            |


*Zero-Allocation Hot-Path Memory Benchmark:* Pre-allocated **256×4 ring slab** intent engine achieves `<16 KiB` **Heap Delta over 10,000 iterations** (`npx vitest run tests/core/intent-sinking-audit.test.ts`). See [`02_ZERO_ALLOCATION_HOTPATH_BENCHMARK_REPORT.md`](./docs/06_verifications/02_ZERO_ALLOCATION_HOTPATH_BENCHMARK_REPORT.md).

**Zero-Allocation Hot-Path Engine**: Risk evaluation, calldata decoding, and attempt ring operations execute on static memory slabs with **zero ephemeral heap allocations** during the microsecond reflex phase (~**50,000 ephemeral heap objects/sec eliminated**).

---



## 🛠️ Quick Verification Reference

```bash
# 1-Line 5-Venue Trip Verification (0-Gas Pre-Consensus Interceptions)
pnpm demo:gmx -- --trip           # GMX v2 FAIL_CLOSED proof
pnpm demo:pendle                  # Pendle Yield Guard ALLOW path
pnpm demo:usdai -- --trip         # USD.ai Collateral FAIL_CLOSED proof
pnpm demo:hl -- --trip            # Hyperliquid Session Guard FAIL_CLOSED proof
pnpm demo:variational -- --trip   # Variational RFQ FAIL_CLOSED proof

# Strategy Loops
pnpm demo:perp-loop -- --trip     # Loop A: GMX / Pendle / HL / Variational
pnpm demo:spot-loop -- --trip     # Loop B: USD.ai Collateral Lane

# [ExoMesh] Tier 0 — SDK/CLI Unit & Integration
pnpm demo:eip1193                 # Scenario A–D State Matrix (JUDGE_SAFE clock)
pnpm demo:eip1193 -- --json         # Structured JSON for CI / Dune
npx vitest run tests/sdk/retail-guard-provider.test.ts
npx vitest run tests/sdk/eip5792-send-calls.test.ts

# [Sanctuary] Tier 0 — Escrow & Async Vault
pnpm demo:escort
npx vitest run tests/adapters/treasury-escort-router.test.ts
npx vitest run tests/erc7540-async-escort.test.ts

# Full Regression Test Suite (228 test files | 1065 PASS clean)
pnpm test -- --run
```

---

## 📚 English SSOT Documentation Hub


| Priority | Document                      | Purpose & Link                                                                                                                                                  |
| -------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**    | **Judge Brief**               | Executive Protocol Summary → [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md)                                                                                      |
| **2**    | **Verification Matrix**       | Complete Command & Proof Index → [`docs/06_verifications/01_VERIFICATION_MATRIX.md`](./docs/06_verifications/01_VERIFICATION_MATRIX.md)                                                        |
| **3**    | **Buildathon Submission**     | Technical Specification & Patch Log → [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md)                                       |
| **4**    | **SliverVine ExoMesh SDK (EIP-1193 Agentic Wallet Guard)**   | `@slivervine/eip1193-agentic-wallet-guard` · C-end [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) integration → [`docs/04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md`](./docs/04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md) |
| **5**    | **Architecture Yellow Paper** | R01–R20 Defense Matrix & Yellow Paper → [`docs/01_architecture/README.md`](./docs/01_architecture/README.md)                                                 |
| **6**    | **EIP Standards Wiki**        | EVM & AI Standard Alignment → [`docs/02_eip_extensions/01_EIP_COMPLIANCE_AND_COMPETITIVE_MATRIX.md`](./docs/02_eip_extensions/01_EIP_COMPLIANCE_AND_COMPETITIVE_MATRIX.md) |


**Protocol & Entity:** SilverVine Labs · `grants@silvervinelabs.com` · [`@slivervine/eip1193-agentic-wallet-guard`](./docs/04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md) — *Universal EIP-1193 Pre-Consensus Guard — Tailor-made for Robinhood Chain & Omni-EVM AI Agents* (Apache-2.0) · **BUSL-1.1 Root License** → [LICENSE](./LICENSE)