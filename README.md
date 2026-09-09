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

---

## ⚡ 30-Second Judge Action Box

```bash
# === Pillar Set Y — Pre-Consensus Firewall & Reflex Defense (PRIMARY FLAGSHIP) ===
pnpm demo:wayfinder                      # Wayfinder AI Guard (p50 ~106µs E2E Edge Shield)
pnpm demo:elizaos -- --venue=gmx         # ElizaOS AI Guard (Manual lock to GMX v2 GM lane)
pnpm demo:virtuals -- --venue=pendle     # Virtuals GAME Guard (Manual lock to Pendle PT/YT)
pnpm demo:langchain -- --trip            # LangChain AI Guard (p50 ~15µs Physical Deadlock)
pnpm demo:matrix -- --trip              # Standalone Pure-Math Engine (9/9 Matrix R20 Severance)

# === Pillar Set X — Liquidity & Ingress Infrastructure (SOVEREIGN VAULT POC) ===
pnpm demo:e2e                            # 4-Step Delta-Neutral Capital Lifecycle (GMX + HL)
pnpm demo:escort                         # Unidirectional Compliance Bridge Escort (lostUsd ≡ $0)

# === Tier 0 & Regression Verification ===
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
pnpm test                                # Full Regression Suite (217 test files | 967 PASS clean)
```

---

## ⚡ Latency Hierarchy (Judge SSOT)

Citadel Shield reports **three statistical latency tiers** — judges should map each demo command to the correct tier:

| Tier | Metric | Scope (what is measured) | Canonical demo |
|------|--------|--------------------------|----------------|
| **Pure Invariant Math** | **~0.5µs–1.1µs** | Isolated `checkSoilResistance()` pure-math kernel — no async · no harness I/O | CLI HUD `Pure Invariant Time` row |
| **Wasm Reflex Core** | **p50 ~15µs** (**<20µs warm path**) | `rootProtection()` physical deadlock · `severSigningChannel()` — standalone pure-math engine (no AI framework overhead) | `pnpm demo:matrix -- --trip` (canonical) · `pnpm demo:<framework> -- --trip` |
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
| **On threat** | May emit out-of-scope calldata (e.g. cross-chain hallucination to [Base / Aerodrome](#fail-closed-walkthrough-cerebrum-hallucination)) | **p50 ~15µs** reflex — severs EIP-712 channel |

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

**Core narrative:** If the LLM Cerebrum suffers hallucination or prompt injection and issues out-of-scope calldata (e.g. cross-chain intent drift to Base / Aerodrome), Citadel's Cerebellum triggers an instant physical deadlock (**p50 ~15µs**), severing the EIP-712 channel before any cross-chain or unvetted execution — **$0 Gas**.

---

## 📌 Live SSOT Anchors

[![Vitest](https://img.shields.io/badge/Vitest-967%20PASS%20%28217%20files%29-brightgreen?logo=vitest)](./docs/VERIFICATION_MATRIX.md)
[![Benchmark Latency](https://img.shields.io/badge/Latency-E2E_p50_106%CE%BCs_|_Reflex_p50_15%CE%BCs-blueviolet?logo=speedtest)](./docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#31-microsecond-moats-summary)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue?logo=typescript)](./tsconfig.json)
[![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-Live_42161-28A0F0?logo=arbitrum)](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1)

| Anchor | Value |
|--------|-------|
| **Vitest baseline** | **`217 test files | 967 PASS clean`** · `pnpm test -- --run` |
| **Arbitrum One Gate** | [`0xb174118b…f8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) · [Ignition Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Headless Audit** | [`GET /api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) |

**Protocol:** SilverVine Labs · `grants@silvervinelabs.com` · [`@slivervine/citadel-sdk`](./src/sdk/README.md) (Apache-2.0)

Pure risk invariants are sunk into five `src/core/` modules (thin-shell re-exports preserve backward compatibility) — full module map → [`01_SYSTEM_TOPOLOGY § Core Sinking`](./docs/architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md#core-sinking-ssot-srccore).

### Arbitrum Ecosystem Alignment (H1 2026)

| Alignment | Pillar Set | Deep dive |
|-----------|------------|-----------|
| **AI Agent Execution Primitive** | **Y** — Pre-Consensus Firewall & Reflex Defense | [`JUDGE_BRIEF.md` § Strategic Value #1](./JUDGE_BRIEF.md#arbitrum-ecosystem-strategic-value-matrix) |
| **Robinhood Chain RWA Escort** | **X** — Liquidity & Ingress Infrastructure · **`lostUsd ≡ 0`** | [`JUDGE_BRIEF.md` § Strategic Value #2](./JUDGE_BRIEF.md#arbitrum-ecosystem-strategic-value-matrix) |
| **ArbOS 61 Elara & Stylus** | **Y** reinforcement + on-chain coprocessor roadmap | [`JUDGE_BRIEF.md` § Strategic Value #3](./JUDGE_BRIEF.md#arbitrum-ecosystem-strategic-value-matrix) |

v0.95 security patch log (session-key replay · clock SSOT · ZeroDev review) → [`SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md#v095-ssot-security-patches-commit-5829e9a)

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

## 🏛️ Sovereign Vault — Pillar Set X Live Proof (GMX + HL)

The **Citadel-Armor Sovereign Vault** is a live PoC that **Pillar Set X** capital routing works under **Pillar Set Y** microsecond circuit breaking: GMX v2 GM Pools (ETH/USDC) Real Yield on Wallet B, paired with a **1× Hyperliquid perp short** on Wallet A until **Δ_net ≡ 0**, with **`lostUsd ≡ $0`** across the grant E2E lifecycle (`pnpm demo:e2e`).

Wallet segregation (Wallet A hedge · Wallet B principal · Protocol Treasury +10 bps builder rebate), cold-start margin guards, and production deposit/withdraw multicalls are documented in [`docs/PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./docs/PRODUCTION_WORKFLOW_DEEP_DIVE.md).

---

## 📚 English SSOT Hub — Start Here

| Priority | Document | Role |
|----------|----------|------|
| **1** | [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) | 30-second Buildathon brief · neuromorphic security · Arbitrum H1 2026 alignment |
| **2** | [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) | Express verification hub — role routing · decoupled proof index |
| **3** | [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) | Full Buildathon submission pack · v0.95 patch log |
| **4** | [`docs/architecture/README.md`](./docs/architecture/README.md) | Yellow Paper · R01–R20 · Hybrid Pillar Sets X & Y |
| **5** | [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md) | Granular `pnpm demo:*` command reference |

---

## ⚡ Extended Express Audit

Start with the [30-Second Judge Action Box](#-30-second-judge-action-box) above. Granular protocol & framework demos → [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md).

### Path 1: Instant Monorepo (Recommended — ~3 Seconds)

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Dual Pillar Set X & Y Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (217 test files | 967 PASS clean)
```

### Tier 0 — Zero-Dependency Isolated Docker

Same command as the [30-Second Judge Action Box](#-30-second-judge-action-box) — for environments without `pnpm`/Node:

```bash
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
```

Full dual-axis verification (Zone A → B → C), `demo:e2e` diff output, and bundle gates → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)

---

## 🔬 Battle-Tested Metrics (Santenmoku Engine)

| Layer | Metric |
|-------|--------|
| **Vitest SSOT** | **217 test files | 967 PASS clean** · Chaos **255/255** fail-closed |
| **E2E Edge Shield** | **p50 ~106µs** — Cloudflare Worker + TS Gateway + Wasm FFI (`checkSoilResistance()`) |
| **Wasm reflex core** | **p50 ~15µs** (**<20µs warm path**) — `rootProtection()` physical deadlock · `pnpm demo:matrix -- --trip` |
| **Wasm hot path** | `pkg/soil_core.wasm` **< 28 KiB** · **ABI v2** · 28-protocol-slot FFI · warm **< 60 µs** |
| **Worker bundle** | **50.94 KiB gzip** · **143.77 KiB raw** (`pnpm bundle:measure` · `pass: true`) |
| **Foundry Gate** | **60/60** unit tests · **327,675** deep fuzz (`pnpm audit:nightly`) · **95.51%** line coverage |
| **Deep fuzz (standard)** | **5,120** = 5×1,024 (`forge test`) |

---

## 🗺️ Protocol Milestones (M0 – M6)

| Milestone | Status | Highlight |
|-----------|--------|-----------|
| **M0: Operational Foundation** | ✅ Delivered | Monorepo · Cloudflare Edge · CI/CD |
| **M1: On-Chain Citadel Gate** | ✅ Delivered | `SliverVineGate.sol` · deep fuzz · 25k gas bounds |
| **M2: Pre-Execution Radar** | ✅ Delivered | `checkSoilResistance()` · **967 PASS** · **50.94 KiB gzip** |
| **M3: Dual-Chain & ZeroDev AA** | ✅ Dry-Run Verified | Opt-In Pillar Set X ingress (`USE_ZERODEV_AA` default-off) |
| **M4: WASM Engine & SDK** | ✅ Delivered | `pkg/soil_core.wasm` · `@slivervine/citadel-sdk` |
| **M5: TCA & Hyperliquid** | ✅ Delivered | Grant-audit surfaces · HL testnet provenance |
| **M6: Grant Submission** | ✅ Mainnet Ignition | Gate [Arbiscan · `0xb174118b…f8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) · [Ignition Tx `0x54c153e9…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |

Commercial model (V1.0 open gateway · V1.1 SaaS tiers · V2.0 CaaS) → [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) · [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md)

---

## 🛡️ Auditor — CLI & API Verification

> **SSOT:** All verification commands, pillar mapping, and expected outputs → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md).

```bash
# Zone A — Express (recommended first pass)
pnpm demo && pnpm demo:e2e && pnpm test

# Zone B — Inside Pillar Sets X & Y
pnpm test:zerodev
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
cd SliverVineGate && forge test && cd ..
pnpm audit:fast && pnpm audit:security

# Zone C — Outside Pillar Sets X & Y
pnpm demo:gmx && pnpm demo:hl && pnpm demo:pendle
pnpm demo:wayfinder -- --trip
curl -s https://bedeltawater.slivervine.xyz/api/grant-audit | jq .provenanceVerified
```

Hybrid Pillar Sets X & Y pipeline ASCII · Tri-Sensor matrix · competitive positioning → [`docs/architecture/README.md`](./docs/architecture/README.md)

---

## 📜 License

**Protocol / Worker (repo root):** **BUSL-1.1** — Copyright (c) 2026 SilverVine Labs. Change Date `2028-08-21` → Apache-2.0. See [LICENSE](./LICENSE).

**Developer integration harness:** [`@slivervine/citadel-sdk`](./src/sdk/) under **Apache-2.0**. See [`src/sdk/README.md`](./src/sdk/README.md) · [`docs/sdk/CITADEL_SDK_BLUEPRINT.md`](./docs/sdk/CITADEL_SDK_BLUEPRINT.md).
