# SliverVine Protocol (BeΔ) — SliverVine Citadel Shield: Pre-Consensus Intent Firewall & Execution Safety Primitive for AI Agents on Arbitrum

**SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) — Sub-ms 0-Gas Pre-Broadcast Safety Citadel & Risk Navigator for AI Agents on Arbitrum** · SilverVine Labs

## ⚡ 3-Second TL;DR for Judges (Neuromorphic Security)

**Cerebrum vs. Cerebellum — Citadel Shield is the involuntary reflex arc for autonomous AI agents.**

| | **Cerebrum (LLM Reasoning & Agent Loop)** | **Citadel Reflex Arc (Cerebellum)** |
|---|-------------------------------------------|-------------------------------------|
| **Stack** | DeepSeek-R1 / GPT-4 + Wayfinder / ElizaOS / GAME / LangChain | Wasm `checkSoilResistance()` reflex kernel |
| **Latency scale** | **~1.0s–10.0s** (1,000ms–10,000ms · DeepSeek-R1 CoT & tool calls) | **14.0µs–106.0µs** (0.014ms–0.106ms) |
| **Nature** | Non-deterministic · hallucination-prone | **100% deterministic** · **0-Gas FAIL-CLOSED** physical deadlock |
| **On threat** | May emit out-of-scope calldata (e.g. cross-chain hallucination to [Base / Aerodrome](#fail-closed-walkthrough---cerebrum-hallucination)) | **<14.0µs** reflex — severs EIP-712 channel |

### Neuromorphic Workflow

```
┌────────────────────────────────────────────────────────────────┐
│ [Cerebrum] LLM Reasoning & Agent Loop (~1.0s - 10.0s)          │  <-- CoT / Tool Calls / Non-Deterministic
└────────────────────────────────────────────────────────────────┘
                         │ (Intent Payload)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│ [Citadel Reflex Arc] Cerebellum Shield (⚡ 14.0µs - 106.0µs)     │  <-- 0.014ms-0.106ms / Deterministic Fail-Closed
└────────────────────────────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     [ PASS: <106µs ]            [ FAIL: <14µs ]
    Signature Released          Reflex Deadlock Severed
```

**Core narrative:** If the LLM Cerebrum suffers hallucination or prompt injection and issues out-of-scope calldata (e.g. cross-chain intent drift to Base / Aerodrome), Citadel's Cerebellum triggers an instant physical deadlock (**<14.0µs**), severing the EIP-712 channel before any cross-chain or unvetted execution — **$0 Gas**.

**Prove it in 30 seconds:** `pnpm demo:quad` · `pnpm demo:matrix -- --trip`

---
[![Vitest](https://img.shields.io/badge/Vitest-840%20PASS%20%28193%20files%29-brightgreen?logo=vitest)](./docs/VERIFICATION_MATRIX.md)
[![V2.0 Stylus Probe](https://img.shields.io/badge/V2.0_Stylus_Probe-9%2F9_PASS_(Roadmap)-blue?logo=rust)](./contracts/stylus-probe/)
[![risk-control.ts coverage](https://img.shields.io/badge/risk--control.ts-100%25%20coverage-success?logo=vitest)](./src/services/risk-control.ts)
[![Chaos Matrix](https://img.shields.io/badge/Chaos%20Matrix-255%2F255%20Fail--Closed-blue?logo=github)](./docs/VERIFICATION_MATRIX.md)
[![Benchmark Latency](https://img.shields.io/badge/Benchmark-p50_106%CE%BCs_E2E_Shield_(Kernel_200ns)-blueviolet?logo=speedtest)](./docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#31-microsecond-moats-summary)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue?logo=typescript)](./tsconfig.json)
[![License](https://img.shields.io/badge/License-BUSL--1.1-orange)](./LICENSE)
[![Foundry Citadel Gate](https://img.shields.io/badge/Foundry-Forge_Test_Passed-brightgreen?logo=solidity)](./SliverVineGate)
[![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-Live_42161-28A0F0?logo=arbitrum)](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1)

<p align="center"><img src="public/brand/Detox_Sanctuary_wm.webp" alt="SliverVine Citadel Gate - Detox Sanctuary" width="600" style="border-radius: 8px;"></p>

> **⚡ Pre-Consensus Intent Firewall:** Sub-ms intent clearing at **p50 ~106 μs** — toxic payloads are severed **before** Arbitrum Sequencer queues, Bundler ingress, or MEV mempools (0-Gas fail-closed).
>
> *Sub-ms End-to-End Shield Path (Pure-Math Kernel: 200 ns / 0.0002 ms) · < 1.0ms SLO Session Key verification · **Primary Execution Boundary:** Full Arbitrum Native Multi-Protocol Coverage (GMX v2, Pendle, Uniswap V3, Aave V3, Morpho Blue, **Variational Omni RFQ**) + Cross-Chain High-Frequency Orderbook Defense (Hyperliquid L1 Session Key Adapter) + optional Arbitrum-native RFQ OLP hedging.*

**Philosophy — BeΔ (BeDelta Living Water v1.0):** **Be** is inspired by Bruce Lee's *"Be Water, My Friend"* — fluid, adaptive intent routing that conforms to venue constraints without breaking invariants. **Δ (Delta)** denotes **market delta-neutrality** — neutralizing directional exposure through the GMX v2 GM + Hyperliquid 1× short envelope. **SliverVine** = fragmented intent protection & steel trading execution · **SliverVine Citadel Shield** = the pre-consensus execution safety primitive that binds both.

**Protocol:** SliverVine · **Entity:** SilverVine Labs · **Contact:** `grants@silvervinelabs.com` · **B2B:** `hello@silvervinelabs.com`  
**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water) · **Package:** [`@slivervine/citadel-sdk`](./src/sdk/README.md) (Apache-2.0)

---

## 📌 Live SSOT Anchors

| Anchor | Value |
|--------|-------|
| **Vitest baseline** | **196+ test files \| 863+ PASS Clean (100% PASS)** · `pnpm test -- --run` |
| **Security scorecard** | **3-Tier Security Scorecard: 5/0/0 PASS** · `pnpm run audit:security` |
| **Wasm hot path** | `pkg/soil_core.wasm` **< 28 KiB** · Shield **p50 ~106 µs** · warm **< 60 µs** |
| **Worker bundle** | **70.88 KiB gzip** · **284.56 KiB raw** · `limitKiB: 150` · `pass: true` (`pnpm bundle:measure`) |
| **Arbitrum One Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Arbiscan](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **Mainnet Ignition Tx** | [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Dune Telemetry** | [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · PEV on Sepolia Gate `0xb174118b…` |
| **Headless Audit** | [`GET /api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) |

> **On-chain vs off-chain SSOT:** Live **EIP-712 `SliverVineGate`** on Arbitrum One (`42161`) + Cloudflare Edge `pkg/soil_core.wasm` (**< 28 KiB** · `checkSoilResistance()` **p50 ~106 µs**). **Arbitrum Stylus** [`SliverVineSoilCoprocessor`](./contracts/stylus-probe/) — **ArbOS 61 Elara** compatible · **96KB** Wasm budget ready · Cargo **9/9 PASS**. → [Technical Specification §0](./docs/architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md#0-unified-institutional-pre-execution-pipeline)

### Arbitrum Ecosystem Alignment (H1 2026)

| Alignment | SliverVine role | SSOT |
|-----------|-----------------|------|
| **Agentic Commerce** | Pre-consensus execution safety primitive for AI agent swarms & machine-payment rails (x402-ready) | `checkSoilResistance()` · `SliverVineGate.sol` · [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) |
| **Robinhood Chain (`46630`/`4663`)** | Pillar 2 RWA ingress — outbound-only USDG escort → Arbitrum One · **`lostUsd ≡ 0`** · inbound AML block | `pnpm demo:escort` · Vitest **6/6** — [`across-ingress-bridge.test.ts`](./tests/adapters/across-ingress-bridge.test.ts) · [`03_PILLAR_2` audit](./docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) |
| **ArbOS 61 Elara** | Protocol ingress filtering reinforces Edge fail-closed — never a weaker substitute for pre-broadcast SSOT | [`04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./docs/architecture/04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos--stylus-alignment--code-verified-on-chain-coprocessor) |
| **ZeroDev Kernel v3 (v0.95 SSOT)** | **Pillar 1 Native Integration** — ERC-7579 Modular Account Hook · Ultra-Relay Intent Network · proprietary Citadel adapter (`src/adapters/arbitrum/zerodev-aa/`) | `pnpm test:zerodev` · [`02_THREE_PILLARS` §2.4](./docs/architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#24-pillar-1--opt-in-zerodev-account-abstraction-integration-summary) |

### v0.95 SSOT Security Patches (Commit `5829e9a`)

| Patch | Resolution | Telemetry |
|-------|------------|-----------|
| **Session Key Replay Guard** | `executeHlSessionKeyOrder` — consume-once nonce (`auditSessionKeyNonceState`) + `expiresAt <= nowMs` before broadcast | `[WALLET_A_HL_STATE]` |
| **Clock SSOT** | `resolveUsdAiClockSsot()` — `nowMs ?? Date.now()` on USD.ai oracle lane | `[CLOCK_SSOT_VERIFIED]` |
| **ZeroDev AA Security Review** | ZeroDev boundary documented · replay + clock items **Resolved in v0.95 SSOT** | [`SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) |

> **Note:** Initial mainnet deployment utilizes Bootstrap Ignition Keys (`0x1111…`/`0x2222…`) for public verification. Production multisig rotation via native governance.

---

## 📚 English SSOT Hub — Start Here

| Priority | Document | Role |
|----------|----------|------|
| **1** | [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) | 30-second Buildathon brief · neuromorphic security · Arbitrum H1 2026 alignment |
| **2** | [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) | CLI Tier 0–5 verification hub — Express → Three Pillars |
| **3** | [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) | Full Buildathon submission pack |
| **4** | [`docs/architecture/README.md`](./docs/architecture/README.md) | Yellow Paper · R01–R20 · Three Pillars · adapter deep dives |
| **5** | [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md) | Granular `pnpm demo:*` command reference |
| **6** | [`docs/README.md`](./docs/README.md) | Full documentation index · audit · grants · SDK blueprint |

**Core product:** **SliverVine Citadel Shield** is a **Pre-Consensus Intent Firewall & Execution Safety Primitive** for AI Agents on Arbitrum — not a standalone Wasm risk check. Off-chain Edge reflex (`checkSoilResistance()`) + on-chain **EIP-712 consume-once `SliverVineGate`** form a protocol-grade execution safety layer. → [§1 Product Identity](./docs/architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md#1-core-product-identity)

---

## Multi-Wallet Cross-Venue Architecture (Wallet A × Wallet B)

Production delta-neutral execution splits **venue-specific custody** across two wallets. The cross-wallet hedge engine ([`gmx-cross-wallet-hedge.ts`](./src/services/gmx-cross-wallet-hedge.ts) · [`scheduled-gmx-hedge-cron.ts`](./src/scheduled-gmx-hedge-lib/scheduled-gmx-hedge-cron.ts)) reads **live GMX GM delta on Wallet B** and sizes **Hyperliquid session-key shorts on Wallet A** until **Δ_net ≡ 0**.

| Lane | Wallet | Venue | Role |
|------|--------|-------|------|
| **Wallet A — Hyperliquid Short Lane** | `0xef0752…960d` (default master) | Hyperliquid L1 Perps | Perp margin · EIP-712 **session keys** · 1× ETH short hedge execution · `executeGmxCrossWalletHedge` |
| **Wallet B — Arbitrum Vault / GMX GM Lane** | `0xc9Bdd…546f` (default · also `uiFeeReceiver`) | Arbitrum One GMX v2 | User capital ingress · **$2,500** vault narrative · **$2,400** → ETH/USDC GM pool · **$100** → HL margin gateway |

**Grant E2E capital routing (Happy Path SSOT):** Robinhood/Arbitrum escort settles **$2,500 USDC** → **$2,400** GMX GM LP deposit (+10 bps builder fee to Protocol Treasury on Wallet B) → **$100** HL L1 margin bridge → Wallet A opens the matching short. User principal remains **$2,500** (`lostUsd ≡ $0`).

**`pnpm demo:e2e`** presents this **multi-wallet orchestration in a single unified terminal HUD** (Steps 1–4 Happy Path · optional `--unwind` / `--trip`) — same invariant math as production [`computeCapitalInvariantLedger()`](./src/core/capital-invariant-ledger.ts), without requiring judges to watch two separate CLIs.

```bash
pnpm demo:e2e              # 4-step cross-wallet Happy Path HUD
pnpm demo:e2e -- --unwind  # + Step 5 Citadel Shield R20 exercise
```

---

## 🎯 7-Protocol Execution Matrix

**Primary Execution Boundary:** Full Arbitrum Native Multi-Protocol Coverage (GMX v2, Pendle, Uniswap V3, Aave V3, Morpho Blue, **Variational Omni RFQ**) + Cross-Chain High-Frequency Orderbook Defense (Hyperliquid L1 Session Key Adapter).

| Protocol | Venue | Physical Boundary | Adapter / Demo |
|----------|-------|-------------------|----------------|
| **GMX v2** | Arbitrum One | \|OI_long − OI_short\| / PoolTVL > **0.35** · Reserve < **105%** | `gmx-v2-invariants.ts` · `pnpm demo:gmx` |
| **Pendle** | Arbitrum One | \|Yield_current − Yield_oracle\| > **150 bps** | `pendle-pool-factory-adapter.ts` · `pnpm demo:pendle` |
| **Uniswap V3** | Arbitrum One | Tick depth · slippage/penalty > **50 bps** | `uniswap-v3-adapter.ts` · `pnpm demo:uniswap` |
| **Aave V3** | Arbitrum One | Health Factor HF < **1.15** | `aave-v3-adapter.ts` · `pnpm demo:aave` |
| **Morpho Blue** | Arbitrum One | NAV deviation > **30 bps** | `morpho-blue-adapter.ts` · `pnpm demo:morpho` |
| **USD.ai** | Arbitrum One | sUSDai peg drift > **30 bps** · oracle age > **2h** · depth < **$100k** | `usdai-adapter.ts` · `pnpm demo:usdai` — **AI-Compute Yield Collateral · Guarded by Citadel Soil Fuse** |
| **Hyperliquid** | L1 HF Orderbook AppChain | MaxSizePerOrder · 120/min · spread > **20 bps** | `hyperliquid-session-guard.ts` · `pnpm demo:hl` |
| **Variational** | Arbitrum One (Omni RFQ) | Quote stale **>500ms** · drift **>30 bps** · OLP **>15%** | `variational-rfq-adapter.ts` · `pnpm demo:matrix -- --loop=perp --hedge=variational` |

**Quad-Agent frameworks (Wayfinder · ElizaOS · Virtuals · LangChain):** `pnpm demo:quad` · → [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md)

### Pillar 2 Escort — Traditional Bridge vs SilverVine Compliance Escort

```text
Traditional Bridge                SilverVine Pillar 2 Escort
(any ↔ any · loss opaque)         (46630/4663 → 42161 only · lostUsd ≡ 0)
 Source ═══════► Dest              RH Chain ──escort──► Arbitrum GMX/Pendle
       ◄═══════                         ▲ inbound AML BLOCKED
 timeout → stuck capital
```

| | Traditional | SilverVine Escort |
|---|-------------|-----------------|
| Direction | Bidirectional | **Unidirectional outbound** |
| Timeout | Manual recovery | **`BRIDGE_TIMEOUT_FAIL_CLOSED`** (>3600s) |
| Accounting | Opaque pending | `IN_FLIGHT` → `SETTLED` |
| Loss | Social / insurance | **`lostUsd ≡ 0`** |

**Interactive demo:** `pnpm demo:escort` · timeout trip: `pnpm demo:escort -- --trip` · → [`02_THREE_PILLARS`](./docs/architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#22-traditional-bridge-vs-silvervine-pillar-2-compliance-escort)

Full adapter tables, Stabilizer Sepolia sandbox, and architectural hardening (R20 auto-severance · sliding-window OI · Stylus coprocessor) → [`docs/architecture/README.md`](./docs/architecture/README.md) · [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)

---

### 📐 Core Risk Invariants (Judge Quick Reference)

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0
$$

$$
\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}
$$

$$
t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s} \ll t_{\text{mempool\_broadcast}}
$$

Derivations & R01–R20 bounds: [Technical Specification §3.1](./docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#31-microsecond-moats-summary) · [Verification Matrix](./docs/VERIFICATION_MATRIX.md) · [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md).

**Risk spectrum (88% / 12%):** [Risk Mitigation Framework §0.1](./docs/architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee)

---

## Why Citadel Shield is NOT a Normal RPC Gateway

Citadel Shield is the **Cerebellum & Reflex Arc** — not a passive JSON-RPC forwarder. Extended neuromorphic architecture → [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md).

| Dimension | Normal RPC Gateway | Citadel Shield (Cerebellum) |
|-----------|-------------------|-----------------------------|
| **Cognitive role** | Transport relay (no reflex) | **Involuntary safety reflex** (pre-signature deadlock) |
| **Latency** | 50–300ms+ RTT (transport) | **14.0µs–106.0µs** (0.014ms–0.106ms) vs LLM **~1.0s–10.0s** reasoning loop |
| **Determinism** | N/A | **100% deterministic** bitmask evaluation |
| **On hallucination** | Forwards opaque calldata | **FAIL-CLOSED** · `severSigningChannel()` · **0-Gas** |
| **Demo proof** | N/A | `pnpm demo:quad` · `pnpm demo:wayfinder -- --trip` |

### Fail-Closed Walkthrough — Cerebrum Hallucination

**Scenario:** The LLM **Cerebrum** drifts into a **cross-chain intent hallucination** — routing a swap to **Aerodrome** (a legitimate Base-native protocol) while policy strictly authorizes only Arbitrum One's **7-protocol matrix**.

> **Clarification:** Aerodrome is **out-of-scope**, not malicious. Citadel's Cerebellum triggers **<14.0µs** physical deadlock, severing EIP-712 **before** any cross-chain or unvetted execution.

1. **Cerebrum emits out-of-scope cross-chain calldata** (`~2,000ms` Chain-of-Thought).
2. **Cerebellum reflex** — Base/Aerodrome outside Arbitrum allowlist → **FAIL-CLOSED** in **<14.0µs**.
3. **`severSigningChannel()`** — **0-Gas**, no Sequencer queue entry.
4. **Judge reproduction:** `pnpm demo:quad -- --trip` · `pnpm demo:matrix -- --trip`

---

## ⚡ 30-Second Express Audit

### Flagship Demos

```bash
pnpm demo:matrix   # Full 7-Protocol Cross-Venue Matrix
pnpm demo:quad     # Full 4 AI Agent Frameworks Pre-Flight Shield
pnpm demo:escort   # Pillar 2 multi-route compliance escort · lostUsd ≡ 0
```

→ **Granular protocol & framework demos:** [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md)

### Path 1: Instant Monorepo (Recommended — ~3 Seconds)

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (196+ test files | 863+ PASS Clean (100% PASS))
```

### Path 2: Isolated Docker

```bash
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
```

Full dual-axis verification (Zone A → B → C), `demo:e2e` diff output, and bundle gates → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)

---

## 🔬 Battle-Tested Metrics (Santenmoku Engine)

| Layer | Metric |
|-------|--------|
| **Vitest SSOT** | **196+ test files \| 863+ PASS Clean (100% PASS)** · Chaos **255/255** fail-closed |
| **Wasm hot path** | `pkg/soil_core.wasm` **< 28 KiB** · Shield **p50 ~106 µs** · warm **< 60 µs** |
| **Worker bundle** | **70.88 KiB gzip** · **284.56 KiB raw** (`pnpm bundle:measure` · `pass: true`) |
| **Edge latency** | p50 ~106 μs Shield path · pure-math kernel **200 ns** |
| **Foundry Gate** | **60/60** unit tests · **327,675** deep fuzz (`pnpm audit:nightly`) · **95.51%** line coverage |
| **Deep fuzz (standard)** | **5,120** = 5×1,024 (`forge test`) |

---

## 🗺️ Protocol Milestones (M0 – M6)

| Milestone | Status | Highlight |
|-----------|--------|-----------|
| **M0: Operational Foundation** | ✅ Delivered | Monorepo · Cloudflare Edge · CI/CD |
| **M1: On-Chain Citadel Gate** | ✅ Delivered | `SliverVineGate.sol` · deep fuzz · 25k gas bounds |
| **M2: Pre-Execution Radar** | ✅ Delivered | `checkSoilResistance()` · **845 PASS** · **70.88 KiB gzip** |
| **M3: Dual-Chain & ZeroDev AA** | ✅ Dry-Run Verified | Opt-In Pillar 1 (`USE_ZERODEV_AA` default-off) |
| **M4: WASM Engine & SDK** | ✅ Delivered | `pkg/soil_core.wasm` · `@slivervine/citadel-sdk` |
| **M5: TCA & Hyperliquid** | ✅ Delivered | Grant-audit surfaces · HL testnet provenance |
| **M6: Grant Submission** | ✅ Mainnet Ignition | Gate `0xb174118b…` · [Ignition Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |

Commercial model (V1.0 open gateway · V1.1 SaaS tiers · V2.0 CaaS) → [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) · [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md)

---

## 🛡️ Auditor — CLI & API Verification

> **SSOT:** All verification commands, pillar mapping, and expected outputs → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md).

```bash
# Zone A — Express (recommended first pass)
pnpm demo && pnpm demo:e2e && pnpm test

# Zone B — Inside Three Pillars
pnpm test:zerodev
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
cd SliverVineGate && forge test && cd ..
pnpm audit:fast && pnpm audit:security

# Zone C — Outside Three Pillars
pnpm demo:gmx && pnpm demo:hl && pnpm demo:pendle
pnpm demo:wayfinder -- --trip
curl -s https://bedeltawater.slivervine.xyz/api/grant-audit | jq .provenanceVerified
```

Three Pillars pipeline ASCII · Tri-Sensor matrix · competitive positioning → [`docs/architecture/README.md`](./docs/architecture/README.md)

---

## 📜 License

**Protocol / Worker (repo root):** **BUSL-1.1** — Copyright (c) 2026 SilverVine Labs. Change Date `2028-08-21` → Apache-2.0. See [LICENSE](./LICENSE).

**Developer integration harness:** [`@slivervine/citadel-sdk`](./src/sdk/) under **Apache-2.0**. See [`src/sdk/README.md`](./src/sdk/README.md) · [`docs/sdk/CITADEL_SDK_BLUEPRINT.md`](./docs/sdk/CITADEL_SDK_BLUEPRINT.md).
