# 🛡️ SliverVine Protocol (BeΔ) — Citadel Shield: Pre-Consensus Intent Firewall & Execution Safety Primitive & 0-Gas Physical Deadlock for AI Agents on Arbitrum

**SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) · SilverVine Labs 🛡️ ⚡ 🏛️**

> **Latency hierarchy (do not conflate):** **~0.5µs–1.1µs** Pure Invariant Math · **p50 ~15µs** Wasm Reflex Core (**<20µs warm path**) · **p50 ~106µs** E2E Edge Shield (Worker + TS Gateway + Wasm FFI).
>
> ⚡ **0-Gas Fail-Closed Physical Deadlock (`rootProtection`):** Wasm reflex core severs EIP-712 signing channels at **p50 ~15µs** before toxic payloads reach Arbitrum Sequencer queues, Bundler ingress, or MEV mempools.
>
> 🧠 **Block AI Hallucinations & Prompt Injection:** Full Edge Shield bitmask evaluation (**p50 ~106µs** E2E) halting out-of-scope calldata and cross-chain intent drift in real-time.
>
> 🔒 **Unidirectional Escort & Single-Pass Pipeline:** Hardened execution boundaries across the **7+1 Cross-Chain Execution Matrix (7 Arbitrum Native + 1 Hyperliquid L1)** with zero capital leakage (`lostUsd ≡ 0`).
>
> 🚀 **Independent Framework Guards:** Each AI agent runtime (Wayfinder · ElizaOS · Virtuals · LangChain) — **p50 ~106µs E2E Edge Shield** on ALLOW · **p50 ~15µs reflex core** on `--trip` — **default 7+1 venue rotation** or `--venue=<protocol>` lock. Start with `pnpm demo:wayfinder`.

[![Vitest](https://img.shields.io/badge/Vitest-992%20PASS%20%28220%20files%29-brightgreen?logo=vitest)](./docs/VERIFICATION_MATRIX.md)
[![Zero-GC Ring Slab](https://img.shields.io/badge/Zero--GC_Ring_Slab-%3C16%20KiB%20%2F%2010k%20iterations-blue?logo=vitest)](./docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#zero-gc-pre-allocated-ring-slab-memory-engine)
[![V2.0 Stylus Probe](https://img.shields.io/badge/V2.0_Stylus_Probe-9%2F9_PASS_(Roadmap)-blue?logo=rust)](./contracts/stylus-probe/)
[![risk-control.ts coverage](https://img.shields.io/badge/risk--control.ts-100%25%20coverage-success?logo=vitest)](./src/services/risk-control.ts)
[![Chaos Matrix](https://img.shields.io/badge/Chaos%20Matrix-255%2F255%20Fail--Closed-blue?logo=github)](./docs/VERIFICATION_MATRIX.md)
[![Benchmark Latency](https://img.shields.io/badge/Latency-E2E_p50_106%CE%BCs_|_Reflex_p50_15%CE%BCs-blueviolet?logo=speedtest)](./docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#31-microsecond-moats-summary)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue?logo=typescript)](./tsconfig.json)
[![License](https://img.shields.io/badge/License-BUSL--1.1-orange)](./LICENSE)
[![Foundry Citadel Gate](https://img.shields.io/badge/Foundry-Forge_Test_Passed-brightgreen?logo=solidity)](./SliverVineGate)
[![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-Live_42161-28A0F0?logo=arbitrum)](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1)

<p align="center"><img src="public/brand/Detox_Sanctuary_wm.webp" alt="SliverVine Citadel Gate - Detox Sanctuary" width="600" style="border-radius: 8px;"></p>

> **Latency scope:** **~0.5µs–1.1µs** Pure Invariant Math · **p50 ~15µs** Wasm Reflex Core (**<20µs warm path**) · **p50 ~106µs** E2E Edge Shield. None of these tiers measure L1/L2 block time, sequencer finality, or on-chain inclusion.

> **Operational boundaries:** Edge latency bands are **not** Nitro/Stylus opcode times. Shield scope is **pre-broadcast** (before EIP-712 release) — **not** post-ALLOW private-mempool MEV protection, Chainlink CCIP native verification, or Robinhood Chain integration. Dune: **Sepolia (`421614`) live event stream** · **Arbitrum One (`42161`) contracts anchored + SQL spec only** (not claimed as live mainnet ingest). Ring-slab heap gate: **&lt;16 KiB** over 10k iterations (not absolute zero bytes).

| Anchor | Value |
|--------|-------|
| **Vitest baseline** | **`220 test files | 992 PASS clean`** · `pnpm test -- --run` · `pnpm exec tsc --noEmit` **0 errors** |
| **Zero-GC heap gate** | **`<16 KiB` / 10,000 iterations** · `npx vitest run tests/core/intent-sinking-audit.test.ts` → **9 passed (9)** |
| **Arbitrum One Gate** | [Arbiscan · `0xb174118b…f8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) · [Ignition Tx `0x54c153e9…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Headless Audit** | [`GET /api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) |

---

## Core Architectural Innovations & Safety Invariants

| # | Security Pillar | System Guarantees & Technical Defense | Verification Protocol |
|---|-----------------|---------------------------------------|----------------------|
| **1** | **0-Gas Pre-Consensus Sequencer Defense** | Unverified intents rejected at Edge isolates before Arbitrum Sequencer ingress — **zero on-chain gas** on fail-closed paths | `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` · `pnpm demo:hl -- --trip` |
| **2** | **Mainnet Deployed Anchors & Pure Solidity Fallback** | Arbitrum One (`42161`) live contracts · optional Stylus · **100% fail-closed** when `stylusCoprocessor=0` | Stylus [`0xc23587d6…625e`](https://arbiscan.io/address/0xc23587d6573dd134f95b02b0202ffbf84686625e) · PolicyGuardV2 [`0xfd98cadb…8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) |
| **3** | **Hyperliquid → GMX V2 Native Liquidity Routing** | Deterministic L1 primary hedge → Arbitrum-native GMX GM fallback; **Δ_net ≡ 0** under venue isolation | `pnpm demo:hl -- --trip` · `pnpm demo:gmx -- --trip` · `pnpm demo:e2e` |
| **4** | **Physical Clock Monotonicity** | Edge Wasm fail-closed against leap seconds · NTP step-back · RPC `block.timestamp` regression | `pnpm build:wasm` · `tests/clock-monotonicity.test.ts` **14/14** |
| **5** | **Robinhood Agentic & Retail Wallet Guard SDK** | Apache-2.0 EIP-1193 C-end middleware · 0-Gas pre-consensus intercept · AI agent retry severance · EIP-6963 | `npx vitest run tests/sdk/` **48/48 PASS** · [`docs/sdk/01_SDK_INTEGRATION_BLUEPRINT.md`](./docs/sdk/01_SDK_INTEGRATION_BLUEPRINT.md) |

→ Technical specification: [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) · Wallet Guard blueprint: [`docs/sdk/01_SDK_INTEGRATION_BLUEPRINT.md`](./docs/sdk/01_SDK_INTEGRATION_BLUEPRINT.md)

---

## Performance Verification — Zero-GC Memory Isolation

Pre-allocated **256×4 ring slab** intent mandate engine — **O(1)** slot hashing · **zero `Map` churn** · **C-ABI parity** with Rust `intent_core.rs`.

```bash
# Verify Zero-GC Hot-Path Memory Isolation (<16 KiB Heap Delta / 10,000 iterations)
npx vitest run tests/core/intent-sinking-audit.test.ts
```

**Expected output:**

```text
 Tests  8 passed (8)
```

**Invariant coverage:** zero-allocation hot path · C-ABI memory parity · fail-closed intent locks (venue drift · attempt budget · ring-slab indexing).

→ Architecture SSOT: [`03_DEFENSE_MATRIX_AND_WASM_CORE.md` § Ring Slab](./docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#zero-gc-pre-allocated-ring-slab-memory-engine)

---

## Verification Command Reference

```bash
# Zero-GC memory isolation (<16 KiB heap delta / 10,000 iterations)
npx vitest run tests/core/intent-sinking-audit.test.ts   # expect: 8 passed (8)

# Per-venue FAIL_CLOSED severance proofs
pnpm demo:gmx -- --trip           # GMX V2 Arbitrum native hard anchor
pnpm demo:variational -- --trip   # Variational multi-venue RFQ gate
pnpm demo:hl -- --trip            # Hyperliquid L1 primary hedge path

# Pillar Set Y — Pre-Consensus Firewall & Reflex Defense
pnpm demo:wayfinder                      # Wayfinder AI Guard (p50 ~106µs E2E Edge Shield)
pnpm demo:elizaos -- --venue=gmx         # ElizaOS AI Guard (Manual lock to GMX v2 GM lane)
pnpm demo:virtuals -- --venue=pendle     # Virtuals GAME Guard (Manual lock to Pendle PT/YT)
pnpm demo:langchain -- --trip            # LangChain AI Guard (p50 ~15µs Physical Deadlock)
pnpm demo:perp-loop -- --trip            # Standalone Perp/Yield Stack Guard (Loop A: GMX/Pendle/HL)
pnpm demo:spot-loop -- --trip            # Standalone Spot/Lending Vault Guard (Loop B: Morpho/USD.ai)

# Pillar Set X — Liquidity & Ingress Infrastructure
pnpm demo:e2e                            # 4-Step Delta-Neutral Capital Lifecycle (GMX + HL)
pnpm demo:escort                         # Unidirectional Compliance Bridge Escort (lostUsd ≡ $0)

# Regression verification
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
pnpm test                                # Full Regression Suite (220 test files | 992 PASS clean)
```

---

## Latency Hierarchy (Measurement SSOT)

Citadel Shield reports **three statistical latency tiers**. Map each verification command to the tier it exercises:

| Tier | Metric | Scope (what is measured) | Canonical demo |
|------|--------|--------------------------|----------------|
| **Pure Invariant Math** | **~0.5µs–1.1µs** | Isolated `checkSoilResistance()` pure-math kernel — no async · no harness I/O | CLI HUD `Pure Invariant Time` row |
| **Wasm Reflex Core** | **p50 ~15µs** (**<20µs warm path**) | `rootProtection()` physical deadlock · `severSigningChannel()` — standalone pure-math engine (no AI framework overhead) | `pnpm demo:perp-loop -- --trip` · `pnpm demo:spot-loop -- --trip` · `pnpm demo:<framework> -- --trip` |
| **E2E Edge Shield** | **p50 ~106µs** | Cloudflare Worker + TypeScript Gateway + Wasm FFI — full pre-broadcast guard path | `pnpm demo:wayfinder` · `pnpm demo:langchain -- --venue=pendle` |

> **Excluded from all tiers:** L1/L2 block confirmation · sequencer finality · on-chain inclusion time.

---

## ⚡ Neuromorphic Security Architecture (AEB Analogy)

**Cerebrum vs. Cerebellum — Citadel Shield is the involuntary reflex arc for autonomous AI agents** (**Pillar Set Y** · *Pre-Consensus Firewall & Reflex Defense*).

**AEB analogy:** Think of Citadel Shield like **AEB (Automated Emergency Braking)** in a car. The LLM **Cerebrum** is the driver planning the route (~1–10s Chain-of-Thought). The **Cerebellum reflex arc** slams the brakes in **p50 ~15µs** before the transaction leaves the agent's cabin — **$0 Gas burned** — before the vehicle ever reaches the intersection (Sequencer queue, Bundler ingress, or mempool). The EIP-712 signing channel is severed while the intent is still in the cabin.

| | **Cerebrum (LLM Reasoning & Agent Loop)** | **Cerebellum Reflex Arc (Citadel Shield)** |
|---|-------------------------------------------|---------------------------------------------|
| **Stack** | DeepSeek-R1 / GPT-4 + Wayfinder / ElizaOS / GAME / LangChain | Wasm `checkSoilResistance()` reflex kernel |
| **Latency scale** | **~1.0s–10.0s** (1,000ms–10,000ms · DeepSeek-R1 CoT & tool calls) | **E2E p50 ~106µs** (ALLOW) · **p50 ~15µs reflex core** (FAIL_CLOSED) |
| **Nature** | Non-deterministic · hallucination-prone | **100% deterministic** · **0-Gas FAIL-CLOSED** physical deadlock |
| **On threat** | May emit out-of-scope calldata (e.g. cross-chain hallucination to Base / Aerodrome) | **p50 ~15µs** reflex — severs EIP-712 channel |

### Neuromorphic Workflow

```
┌────────────────────────────────────────────────────────────────┐
│ [Cerebrum] LLM Reasoning & Agent Loop (~1.0s - 10.0s)          │  <-- CoT / Tool Calls / Non-Deterministic
└────────────────────────────────────────────────────────────────┘
                         │ (Intent Payload)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│ [Citadel Reflex Arc] Cerebellum Shield (⚡ p50 ~15µs – p50 ~106µs)     │  <-- 0.015ms-0.106ms / Deterministic Fail-Closed
└────────────────────────────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     [ PASS: p50 ~106µs ]            [ FAIL: p50 ~15µs ]
    Signature Released          Reflex Deadlock Severed
```

**Fail-closed behavior:** Out-of-scope calldata triggers physical deadlock (**p50 ~15µs**) via `severSigningChannel()` before EIP-712 broadcast — zero on-chain gas on rejected paths. → `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` · `pnpm demo:hl -- --trip` · [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md)

---

## 🎯 7+1 Cross-Chain Execution Matrix

**Pillar Set Y** guards all lanes via Wasm `checkSoilResistance()` · **default 7+1 venue rotation** or `--venue=<key>` lock on framework demos.

| `--venue` | Protocol | Physical boundary |
|-----------|----------|-------------------|
| `gmx` | GMX v2 | OI skew / PoolTVL > **0.35** · reserve < **105%** |
| `pendle` | Pendle | \|Yield − oracle\| > **150 bps** |
| `uniswap` | Uniswap V3 | Slippage > **50 bps** |
| `aave` | Aave V3 | Health Factor < **1.15** |
| `morpho` | Morpho Blue | NAV deviation > **30 bps** |
| `usdai` | USD.ai | Peg drift > **30 bps** · oracle age > **2h** |
| `hyperliquid` / `hl` | Hyperliquid L1 | Spread > **20 bps** · session-key rate cap |
| `variational` / `var` | Variational Omni RFQ | Quote stale > **500ms** · OLP > **15%** |

→ Adapter deep dives · bridge escort mechanics · R20 matrix → [`docs/architecture/README.md`](./docs/architecture/README.md) · CLI flags → [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md)

---

## 🏛️ Live Proof MVP: Sovereign Vault (Pillar Set X)

The **Citadel-Armor Sovereign Vault** is a live PoC that **Pillar Set X** capital routing works under **Pillar Set Y** microsecond circuit breaking: GMX v2 GM Pools (ETH/USDC) Real Yield on Wallet B, paired with a **1× Hyperliquid perp short** on Wallet A until **Δ_net ≡ 0**, with **`lostUsd ≡ $0`** across the grant E2E lifecycle (`pnpm demo:e2e`).

Wallet segregation (Wallet A hedge · Wallet B principal · Protocol Treasury +10 bps builder rebate), cold-start margin guards, and production deposit/withdraw multicalls → [`docs/PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./docs/PRODUCTION_WORKFLOW_DEEP_DIVE.md).

---

## 📚 English SSOT Hub & Extended Audit

| Priority | Document | Role |
|----------|----------|------|
| **1** | [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) | Executive protocol summary · dual-layer validation architecture |
| **2** | [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) | Verification hub — CLI Tier 0–5 · decoupled proof index |
| **3** | [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) | Technical specification · v0.95 patch log |
| **4** | [`docs/architecture/README.md`](./docs/architecture/README.md) | Yellow Paper · R01–R20 · Hybrid Pillar Sets X & Y |
| **5** | [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md) | Granular `pnpm demo:*` command reference |
| **6** | [`docs/README.md`](./docs/README.md) | Full documentation index · audit · grants · SDK blueprint |

**Core product:** **SliverVine Citadel Shield** is a **Pre-Consensus Intent Firewall & Execution Safety Primitive** for AI Agents on Arbitrum — off-chain Edge reflex (`checkSoilResistance()`) + on-chain **EIP-712 consume-once `SliverVineGate`**. Pure `src/core/` module map → [`01_SYSTEM_TOPOLOGY`](./docs/architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md#core-sinking-ssot-srccore).

### Extended Express Audit

```bash
# Zone A — Primary verification commands
pnpm demo:gmx -- --trip && pnpm demo:variational -- --trip && pnpm demo:hl -- --trip

# Zone B — Inside Pillar Sets X & Y
pnpm test -- --run && pnpm demo:e2e
pnpm test:zerodev
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
cd SliverVineGate && forge test && cd ..
pnpm audit:fast && pnpm audit:security

# Zone C — Supplementary protocol & agent proofs
pnpm demo:gmx && pnpm demo:hl && pnpm demo:variational
pnpm demo:wayfinder -- --trip
curl -s https://bedeltawater.slivervine.xyz/api/grant-audit | jq .provenanceVerified
```

| Layer | Metric |
|-------|--------|
| **Vitest SSOT** | **220 test files | 992 PASS clean** · Zero-GC gate **8/8** · Chaos **255/255** fail-closed |
| **E2E Edge Shield** | **p50 ~106µs** — Worker + TS Gateway + Wasm FFI |
| **Wasm reflex core** | **p50 ~15µs** (**<20µs warm path**) · `pnpm demo:perp-loop -- --trip` · `pnpm demo:spot-loop -- --trip` |
| **Worker bundle** | **50.94 KiB gzip** · **143.77 KiB raw** (`pnpm bundle:measure` · `pass: true`) |

**Protocol:** SilverVine Labs · `grants@silvervinelabs.com` · [`@slivervine/citadel-sdk`](./src/sdk/README.md) (Apache-2.0) · **BUSL-1.1** root license → [LICENSE](./LICENSE)
