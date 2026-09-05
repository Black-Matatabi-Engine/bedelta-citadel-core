# SliverVine Citadel Shield: Pre-Consensus Intent Firewall & Execution Safety Primitive for AI Agents on Arbitrum

**SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)** · SilverVine Labs

## ⚡ 3-Second TL;DR for Judges (Neuromorphic Security)

**Cerebrum vs. Cerebellum — Citadel Shield is the involuntary reflex arc for autonomous AI agents.**

| | **Cerebrum (LLM Agent)** | **Cerebellum (Citadel Shield)** |
|---|--------------------------|----------------------------------|
| **Models** | DeepSeek-R1 · GPT-4 · Claude | Wasm `checkSoilResistance()` reflex kernel |
| **Speed** | ~1,000ms–5,000ms (slow Chain-of-Thought) | **14.0µs–106µs** (sub-ms involuntary reflex) |
| **Nature** | Non-deterministic · hallucination-prone | **100% deterministic** · **0-Gas FAIL-CLOSED** |
| **On threat** | May emit out-of-scope calldata (e.g. Cross-chain hallucination to Base / Aerodrome) | **<14.0µs** physical deadlock — severs EIP-712 channel |

### Neuromorphic Workflow

```
┌──────────────────────────────────────────────┐
│ [Cerebrum] LLM Reasoning (~1000ms - 5000ms)  │  <-- Deep CoT / Non-Deterministic
└──────────────────────────────────────────────┘
                         │ (Intent Payload)
                         ▼
┌──────────────────────────────────────────────┐
│ [Cerebellum] Citadel Shield (⚡ 14.0µs)       │  <-- Involuntary Reflex Arc / Fail-Closed
└──────────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     [ PASS: <106µs ]            [ FAIL: <14µs ]
    Signature Released          Reflex Deadlock Severed
```

**Core narrative:** If the LLM Cerebrum suffers hallucination or prompt injection and issues out-of-scope calldata (e.g. cross-chain intent drift to Base / Aerodrome), Citadel's Cerebellum triggers an instant physical deadlock (**<14.0µs**), severing the EIP-712 channel before any cross-chain or unvetted execution — **$0 Gas**.

**Prove it in 30 seconds:** `pnpm demo:quad` · `pnpm demo:matrix -- --trip`

---
[![Vitest](https://img.shields.io/badge/Vitest-834%20PASS%20%28192%20files%29-brightgreen?logo=vitest)](./docs/VERIFICATION_MATRIX.md)
[![V2.0 Stylus Probe](https://img.shields.io/badge/V2.0_Stylus_Probe-9%2F9_PASS_(Roadmap)-blue?logo=rust)](./contracts/stylus-probe/)
[![risk-control.ts coverage](https://img.shields.io/badge/risk--control.ts-100%25%20coverage-success?logo=vitest)](./src/services/risk-control.ts)
[![Chaos Matrix](https://img.shields.io/badge/Chaos%20Matrix-255%2F255%20Fail--Closed-blue?logo=github)](./docs/VERIFICATION_MATRIX.md)
[![Benchmark Latency](https://img.shields.io/badge/Benchmark-p50_106%CE%BCs_E2E_Shield_(Kernel_200ns)-blueviolet?logo=speedtest)](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#31-microsecond-moats)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue?logo=typescript)](./tsconfig.json)
[![License](https://img.shields.io/badge/License-BUSL--1.1-orange)](./LICENSE)
[![Foundry Citadel Gate](https://img.shields.io/badge/Foundry-Forge_Test_Passed-brightgreen?logo=solidity)](./SliverVineGate)
[![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-Live_42161-28A0F0?logo=arbitrum)](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1)


<p align="center"><img src="public/brand/Detox_Sanctuary_wm.webp" alt="SliverVine Citadel Gate - Detox Sanctuary" width="600" style="border-radius: 8px;"></p>

> **⚡ Pre-Consensus Intent Firewall:** Sub-ms intent clearing at **p50 ~106 μs** — toxic payloads are severed **before** Arbitrum Sequencer queues, Bundler ingress, or MEV mempools (0-Gas fail-closed).
>
> *Sub-ms End-to-End Shield Path (Pure-Math Kernel: 200 ns / 0.0002 ms) · < 1.0ms SLO Session Key verification · **Primary Execution Boundary:** Full Arbitrum Native Multi-Protocol Coverage (GMX v2, Pendle, Uniswap V3, Aave V3, Morpho Blue, **Variational Omni RFQ**) + Cross-Chain High-Frequency Orderbook Defense (Hyperliquid L1 Session Key Adapter) + optional Arbitrum-native RFQ OLP hedging.*

**Philosophy — BeΔ (BeDelta Living Water v1.0):** **Be** is inspired by Bruce Lee's *"Be Water, My Friend"* — fluid, adaptive intent routing and friction-free multi-chain execution that conforms to venue constraints without breaking invariants. **Δ (Delta)** is the mathematical symbol for **market delta-neutrality** — neutralizing directional exposure through the GMX v2 GM + Hyperliquid 1× short envelope. **SliverVine** = fragmented intent protection & steel trading execution · **SliverVine Citadel Shield** = the pre-consensus execution safety primitive that binds both.

**Protocol:** SliverVine · **Entity:** SilverVine Labs · **Contact:** `grants@silvervinelabs.com` · **B2B:** `hello@silvervinelabs.com`  
**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)  

> **On-chain vs off-chain SSOT:** The **live Arbitrum One gateway** (`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`, chainId **42161**) is the immutable **Solidity EIP-712 `SliverVineGate`** — [Mainnet Ignition Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6). **Arbitrum Stylus** ([`contracts/stylus-probe/`](./contracts/stylus-probe/)) is the **V2.0 dual-execution Rust coprocessor** (`check_soil_resistance_stylus` in `stylus_core.rs`; `pnpm build:stylus`) — local probe only; **not** deployed on mainnet. Planned on-chain rollout uses **EIP-1967 upgradeable proxy** (zero lock-in; multisig-governed implementation slot). Production hot-path soil fuse runs on Cloudflare Edge via `pkg/soil_core.wasm` (`checkSoilResistance()` p50 ~106µs).
**Live Dune Telemetry Portal:** [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · **PEV tracking fully operational** on-chain via Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` (`RiskTripBlocked` → `SUM(blocked_intent_notional_usd)`) · **Headless Audit Endpoint:** [`https://bedeltawater.slivervine.xyz/api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) · **Arbitrum One Gate** `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Mainnet Ignition Tx [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6)  

> **Headless Infrastructure Protocol:** Core interaction is API/SDK Native (`@slivervine/citadel-sdk`) & CLI HUD.  
**Package:** [`@slivervine/citadel-sdk`](./src/sdk/README.md) (Apache-2.0) · **Judge entry:** [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) · [Verification Matrix](./docs/VERIFICATION_MATRIX.md) · [Technical Specification](./docs/architecture/01_TECHNICAL_SPECIFICATION.md)

**Core product:** **SliverVine Citadel Shield** is a **Pre-Consensus Intent Firewall & Execution Safety Primitive** for AI Agents on Arbitrum — not a standalone Wasm risk check. Off-chain Edge reflex (`checkSoilResistance()`) + on-chain **EIP-712 consume-once `SliverVineGate`** form a protocol-grade execution safety layer — [§1 Product Identity](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#1-core-product-identity) · [Three Pillars pipeline](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#0-unified-institutional-pre-execution-pipeline).

### Core Architectural Hardening (V1.0 · Automated Severance + Split-Payload Defense)

| Layer | Module | Behavior |
|-------|--------|----------|
| **Auto R20 severance** | [`risk-severance.ts`](./src/core/risk-severance.ts) · [`risk-engine-core.ts`](./src/core/risk-engine-core.ts) | Any `FLAGS_*` trip (`IMBALANCE`, `NAV`, `YIELD_SHOCK`, `DEPEG`, etc.) calls `severSigningChannel()` inside core state flow — no demo-script orchestration |
| **Sliding-window OI** | [`pending-exposure-window.ts`](./src/core/pending-exposure-window.ts) | 30s accumulator for pending GMX skew/notional — neutralizes sub-threshold split-payload poisoning |
| **Stylus coprocessor** | [`stylus_core.rs`](./contracts/stylus-probe/src/stylus_core.rs) | `#![no_std]` `check_soil_resistance_stylus(flags, risk_vector)` — dual-execution parity with Edge; `pnpm build:stylus` |

→ EIP-1967 upgradeable proxy pattern (zero lock-in): [`02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./docs/architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos--stylus-alignment--code-verified-on-chain-coprocessor)

**Primary venue:** Arbitrum One (`42161`) · Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Mainnet Ignition Tx [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · **Cross-chain hedge:** Hyperliquid — **Independent L1 High-Frequency Orderbook AppChain** (originated alongside Arbitrum's perp liquidity ecosystem; session-key adapter, not Arbitrum-native) · **Moat:** Pillar 3 Wasm Shield `checkSoilResistance()` p50 ~106 μs — [§3 Defense Matrix](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#3-cross-venue-risk-engine--defense-matrix-r01r20).

> **Note:** Initial mainnet deployment utilizes Bootstrap Ignition Keys (`0x1111…`/`0x2222…`) for public verification without exposing production HSM keys. Key rotation to production multisig is executed via native governance functions.

**Ingress (optional):** Robinhood Chain `46630`/`4663` → Arbitrum — **Pillar 2 Reference Escort Adapter** only; [Pillar 2 audit](./docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md).

### Pendle Institutional Shield (V1.0 Live · Core Pillar 3)

Institutional **Safety Sentinel** for Pendle PT/YT — not a yield competitor. All oracle resolution runs on a **zero-I/O sync in-memory hot path** within the existing Shield budget (**p50 ~106µs** `checkSoilResistance()`):

| Layer | Module | Behavior |
|-------|--------|----------|
| **Dynamic Oracle** | [`pendle-market-oracle-adapter.ts`](./src/adapters/pendle/pendle-market-oracle-adapter.ts) | `ingest()` / `resolve()` cache · configurable **TTL (default 60s)** |
| **Registry Hydration** | [`pendle-pt-registry.ts`](./src/adapters/pendle/pendle-pt-registry.ts) | `hydrateFromOracle` merges live `impliedYield`, `ptPriceInAsset`, `liquidityConstant`, `expirySec` |
| **Fail-Closed Fuse** | `checkSoilResistance()` | `pendleOracle` + `pendleCrossGuard` soil probes · emits **`PENDLE_ORACLE_STALE`** on missing / stale / invalid feeds |

→ Cross-guard: [`pendle-gmx-cross-guard.ts`](./src/guards/pendle-gmx-cross-guard.ts) · Expiry guard: [`pendle-pt-expiry-guard.ts`](./src/adapters/pendle/pendle-pt-expiry-guard.ts) · Tests: [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md#pendle-institutional-shield-v10-live--core-pillar-3)

### Uniswap V3 Native Integration (V1.0 Live · Arbitrum Spot Liquidity)

Citadel is the **pre-execution concentrated-liquidity firewall** for Uniswap V3 spot swaps on **Arbitrum One (`42161`)**:

| Layer | Module | Behavior |
|-------|--------|----------|
| **V3 Liquidity Guard** | [`uniswap-v3-adapter.ts`](./src/adapters/uniswap/uniswap-v3-adapter.ts) | `verifyUniswapPoolLiquidity()` · `verifyUniswapTickDepth()` — CL tick depth · directional dynamic fee |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on depleted depth / cross-venue slippage |
| **CLI Demo** | `pnpm demo:uniswap` | WETH/USDC spot swap guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/uniswap-v3-adapter.test.ts`](./tests/adapters/uniswap-v3-adapter.test.ts)

### Aave V3 (V1.0 Live · Arbitrum Native Lending)

Citadel is the **pre-execution Health Factor firewall** for Aave V3 lending on **Arbitrum One (`42161`)**:

| Layer | Module | Behavior |
|-------|--------|----------|
| **HF Guard** | [`aave-v3-adapter.ts`](./src/adapters/aave/aave-v3-adapter.ts) | `verifyAaveHealthFactor()` — HF &lt; 1.15 fail-closed · cross-chain liquidation boundary |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on depleted collateral depth |
| **CLI Demo** | `pnpm demo:aave` | WETH/USDC borrow guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/aave-v3-adapter.test.ts`](./tests/adapters/aave-v3-adapter.test.ts)

### Morpho Blue (V1.0 Live · Arbitrum Vault Strategies)

Citadel is the **pre-execution vault share-price firewall** for Morpho Blue strategies on **Arbitrum One (`42161`)**:

| Layer | Module | Behavior |
|-------|--------|----------|
| **Vault Guard** | [`morpho-blue-adapter.ts`](./src/adapters/morpho/morpho-blue-adapter.ts) | `verifyMorphoOracle()` — oracle freshness · price deviation cap during rebalance |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on toxic vault depth |
| **CLI Demo** | `pnpm demo:morpho` | jGLP rebalance guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/morpho-blue-adapter.test.ts`](./tests/adapters/morpho-blue-adapter.test.ts)

### Wayfinder Native Integration (V1.0 Live · Arbitrum AI Agent Engine)

Citadel is the **native pre-execution risk firewall** for the Wayfinder Agent Engine on **Arbitrum One (`42161`)**:

| Layer | Module | Behavior |
|-------|--------|----------|
| **Native Shield Hook** | [`wayfinder-shield.ts`](./src/adapters/wayfinder/wayfinder-shield.ts) | `wayfinderCitadelShieldHook` — `checkSoilResistance()` soil fuse + `verifyAgentIntent()` 8-dimension gate |
| **0-Gas Fail-Closed** | Pre-broadcast severance | Soil trip / bitmask trip (`FLAGS_*`) / session-key violation → `severSigningChannel()` **automatically** inside core state flow — no external orchestration |
| **CLI Demo** | `pnpm demo:wayfinder` | Normal route interception · `--trip` for 0-Gas toxic soil demo |

→ Tests: [`tests/adapters/wayfinder-shield.test.ts`](./tests/adapters/wayfinder-shield.test.ts) · Demo: [`examples/wayfinder-agent-demo.ts`](./examples/wayfinder-agent-demo.ts)

### Stabilizer Protocol (V1.0 Live · Sepolia Testnet)

Citadel is the **pre-execution Zero-Slippage Capacity & De-peg Liquidation Firewall** for Stabilizer Protocol on Sepolia (`421614`):

| Layer | Module | Behavior |
|-------|--------|----------|
| **Stabilizer Guard** | [`stabilizer-adapter.ts`](./src/adapters/stabilizer/stabilizer-adapter.ts) | Reserve-ratio floor (15%) · USDZ peg guard (>50bps) · Constant-Sum capacity |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on reserve depletion / liquidation trip |
| **De-peg cooldown** | `evaluateStabilizerSwapGuard()` | 60s LLM mandatory cooldown · signature channel severed |
| **CLI Demo** | `pnpm demo:wayfinder -- --stabilizer` | Sepolia stablecoin swap · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/stabilizer-adapter.test.ts`](./tests/adapters/stabilizer-adapter.test.ts)

### Four Major AI Agent Frameworks (V1.0 Live · Full Quad Coverage)

**World's First Pre-Execution Risk Gateway natively supporting ALL Four Major AI Agent Frameworks (Wayfinder, ElizaOS, Virtuals, LangChain).**

| Framework | Adapter SSOT | Citadel gate | Standalone CLI |
|-----------|--------------|--------------|----------------|
| **Wayfinder** | [`wayfinder-shield.ts`](./src/adapters/wayfinder/wayfinder-shield.ts) | `wayfinderCitadelShieldHook` | `pnpm demo:wayfinder` |
| **ElizaOS** | [`elizaos-citadel-plugin.ts`](./src/adapters/elizaos/elizaos-citadel-plugin.ts) | `evaluateElizaCitadelAction()` | `pnpm demo:elizaos` |
| **Virtuals (GAME)** | [`virtuals-game-adapter.ts`](./src/adapters/virtuals/virtuals-game-adapter.ts) | `evaluateVirtualsGameTask()` | `pnpm demo:virtuals` |
| **LangChain / LangGraph** | [`langchain-citadel-tool.ts`](./src/adapters/langchain/langchain-citadel-tool.ts) | `CitadelRiskGuardTool` | `pnpm demo:langchain` |
| **Stabilizer** | [`stabilizer-adapter.ts`](./src/adapters/stabilizer/stabilizer-adapter.ts) | `evaluateStabilizerSwapGuard()` | `pnpm demo:stabilizer` |

```bash
pnpm demo:wayfinder    # Wayfinder route interception
pnpm demo:elizaos      # ElizaOS Action handler guard
pnpm demo:virtuals     # Virtuals GAME worker guard
pnpm demo:langchain    # LangChain CitadelRiskGuardTool
pnpm demo:stabilizer   # Stabilizer Sepolia 1:1 swap guard
pnpm demo:quad         # All four AI frameworks (combined)
```

→ Tests: [`wayfinder-shield.test.ts`](./tests/adapters/wayfinder-shield.test.ts) · [`elizaos-plugin.test.ts`](./tests/adapters/elizaos-plugin.test.ts) · [`virtuals-adapter.test.ts`](./tests/adapters/virtuals-adapter.test.ts) · [`langchain-tool.test.ts`](./tests/adapters/langchain-tool.test.ts) · [`stabilizer-adapter.test.ts`](./tests/adapters/stabilizer-adapter.test.ts) — **192 test files | 834 PASS Clean (100% PASS)**

**Triangle loop:** [Technical Specification §2](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#2-triangle-liquidity-loop--segregated-tranches) · **Arbitrum execution premium:** +15–30 bps vs bridged routes *(design estimate)*.

> **SSOT lock (Buildathon):** v1.0 Delivered (Sepolia + Arbitrum One verified) · Vitest **192 test files | 834 PASS Clean (100% PASS)** · deep fuzz **327,675** via `pnpm audit:nightly` · Tier-0 Docker [`Dockerfile`](./Dockerfile) · docs hub [`docs/README.md`](./docs/README.md) · **Judge quick brief:** [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md)

---

## Why Citadel Shield is NOT a Normal RPC Gateway (Cerebrum vs. Cerebellum)

Citadel Shield is the **Cerebellum & Reflex Arc** of the agent stack — not a passive JSON-RPC forwarder. The LLM **Cerebrum** plans; the Citadel **Cerebellum** executes involuntary safety reflexes on every intent payload **before** EIP-712 signing.

### Neuromorphic Reflex Architecture

```
┌──────────────────────────────────────────────┐
│ [Cerebrum] LLM Reasoning (~1000ms - 5000ms)  │  <-- Deep CoT / Non-Deterministic
└──────────────────────────────────────────────┘
                         │ (Intent Payload)
                         ▼
┌──────────────────────────────────────────────┐
│ [Cerebellum] Citadel Shield (⚡ 14.0µs)       │  <-- Involuntary Reflex Arc / Fail-Closed
└──────────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     [ PASS: <106µs ]            [ FAIL: <14µs ]
    Signature Released          Reflex Deadlock Severed
```

### Normal RPC Gateway vs Citadel Cerebellum

| Dimension | Normal RPC Gateway | Citadel Shield (Cerebellum) |
|-----------|-------------------|-----------------------------|
| **Cognitive role** | Transport relay (no reflex) | **Involuntary safety reflex** (pre-signature deadlock) |
| **Latency** | 50–300ms+ RTT | **~14.0µs** pure invariant · **~106µs** full matrix (Edge `<106µs`) |
| **Determinism** | N/A | **100% deterministic** bitmask evaluation |
| **On hallucination** | Forwards opaque calldata | **FAIL-CLOSED** · `severSigningChannel()` · **0-Gas** |
| **Demo proof** | N/A | `pnpm demo:quad` · `pnpm demo:wayfinder -- --trip` |

### Fail-Closed Walkthrough — Cerebrum Hallucination

**Scenario:** The LLM **Cerebrum** drifts into a **cross-chain intent hallucination** — routing a swap to **Aerodrome** (a legitimate Base-native protocol) while policy strictly authorizes only Arbitrum One's **7-protocol matrix** (GMX v2 / Pendle / Uniswap V3 / Aave / Morpho / Hyperliquid / Variational).

> **Clarification:** Aerodrome is not malicious — it is **out-of-scope**. When an Arbitrum-authorized agent emits cross-chain calldata (Base / Aerodrome) due to LLM intent drift, Citadel's Cerebellum triggers a **<14.0µs** physical deadlock, severing the EIP-712 channel **before** any cross-chain or unvetted execution can occur.

1. **Cerebrum emits out-of-scope cross-chain calldata** (`~2,000ms` Chain-of-Thought).
2. **Cerebellum reflex** parses chain + venue bitmask — Base/Aerodrome outside Arbitrum allowlist → **FAIL-CLOSED** in **<14.0µs**.
3. **`severSigningChannel()`** triggers physical deadlock — **0-Gas**, no cross-chain bridge or Sequencer queue entry.
4. **Judge reproduction:** `pnpm demo:quad -- --trip` · `pnpm demo:matrix -- --trip`

---

## ⚡ 30-Second Express Audit (Fastest Judge Verification)

### 3-Tier Demo Suite (CLI SSOT)

All standalone demos measure latency via `process.hrtime.bigint()` (µs precision) — no hardcoded timing outputs.

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 1 — Native Protocols** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:uniswap` · `pnpm demo:aave` · `pnpm demo:morpho` · `pnpm demo:matrix` | GMX · HL · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · Variational RFQ · **7-protocol cross-venue matrix** |
| **Tier 2 — Agent Frameworks** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:quad` | Wayfinder · ElizaOS · Virtuals · LangChain · combined quad run |
| **Tier 3 — Sandbox & E2E** | `pnpm demo:stabilizer` · `pnpm demo:e2e` | Sepolia Stabilizer 1:1 guard · 5-step macro lifecycle |
| **Vitest matrix** | `pnpm demo` | 12 Tri-Pillar ANSI scenarios (`tests/demo/`) |

```bash
pnpm demo:gmx      # GMX v2 shadow margin · cross-venue slippage · position cap
pnpm demo:hl       # Hyperliquid session key auth · orderbook depth guard
pnpm demo:pendle   # Pendle PT/YT sentinel · guarded pool factory
pnpm demo:uniswap  # Uniswap V3 concentrated liquidity · dynamic fee guard
pnpm demo:aave  # Aave V3 HF & cross-chain liquidation guard
pnpm demo:morpho    # Morpho Blue vault share-price & sandwich guard
pnpm demo:matrix              # Full cross-venue matrix (--loop=all, default)
pnpm demo:matrix -- --loop=perp   # Pendle → GMX → dual perp hedge (HL + Variational)
pnpm demo:matrix -- --loop=perp --hedge=variational   # Variational Omni RFQ hedge leg
pnpm demo:matrix -- --loop=perp --hedge=hyperliquid   # Hyperliquid L1 hedge leg only
pnpm demo:matrix -- --loop=perp --hedge=both          # HL + Variational (default perp hedge)
pnpm demo:matrix -- --loop=spot   # Uniswap V3 → Aave V3 → Morpho Blue spot loop
# Append -- --healthy-only for nominal PASS; default runs R20 trip + severance
```

### Path 1: Instant Monorepo Verification (Recommended — 3 Seconds)

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (192 files / 834 tests)
```

GMX: `pnpm demo:gmx` · HL: `pnpm demo:hl` · Pendle: `pnpm demo:pendle` · Uniswap V3: `pnpm demo:uniswap` · Aave V3: `pnpm demo:aave` · Morpho Blue: `pnpm demo:morpho` · Matrix: `pnpm demo:matrix` · Wayfinder: `pnpm demo:wayfinder` · ElizaOS: `pnpm demo:elizaos` · Virtuals: `pnpm demo:virtuals` · LangChain: `pnpm demo:langchain` · Stabilizer: `pnpm demo:stabilizer` · Quad: `pnpm demo:quad`

Optional benchmark: `npx tsx scripts/grant-advanced-resilience-benchmark.ts`

### Path 2: Isolated Docker Verification

```bash
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
```

Zero-dependency container execution — no host Node/pnpm install. Runs the isolated 5-step `demo:e2e` dry-run and Tier-1 ANSI HUD demo. Full regression: `docker run --rm slivervine-citadel pnpm test` (**192 test files | 834 PASS Clean (100% PASS)**). Sidecar express audit → [`docker/README.md`](./docker/README.md).

**Representative `demo:e2e` terminal highlights** (GitHub `diff` syntax — green `+` PASS, red `-` alerts, yellow `!` fee injection):

```diff
+  ┌─ SliverVine Citadel Shield ─────────────────────────────────────┐
+  │  BeΔ Living Water v1.0 · 5-Step Grant E2E Demo                  │
+  │  Sepolia Gate · p50 ~106µs · Δnet ≡ 0 · lostUsd ≡ 0            │
+  └────────────────────────────────────────────────────────────────┘
+ ── Step 1: Citadel Pre-Execution Check ──
+ Intent: allowedToSign=true soilOk=true · elapsed=106µs
+ Invariant: Δnet ≡ 0 (GMX_GM + HL_Short delta-neutral envelope)
+ ── Step 2: Robinhood Chain Escort ──
+ Outbound 46630→42161: ok=true lostUsd=0
+ RESULT: Escort PASS — lostUsd ≡ 0
- Inbound AML block: label=AML_INBOUND_TO_ROBINHOOD_BLOCKED
! Payload: uiFeeReceiver (+10 bps) injected
- ALERT: SOIL_TRIPPED — CROSS_VENUE_SLIPPAGE · DEPTH fuse
- [CRITICAL] PHYSICAL_DEADLOCK_TRIGGERED: EIP-712 Signature Pipe Severed
+ Flash unwind: PASS · RESULT: E2E OK (5/5)
```

Canonical interactive demo commands for judges:

1. **Path 1 (recommended):** `pnpm install && pnpm demo && pnpm demo:e2e` — Tri-Pillar micro matrix (12 scenarios) + 5-step macro lifecycle.
2. `pnpm test` verifies **192 test files | 834 PASS Clean (100% PASS)**.
3. **Path 2:** `docker build -t slivervine-citadel . && docker run --rm slivervine-citadel` — isolated E2E, no host toolchain drift.
4. `grant-advanced-resilience-benchmark.ts` shows the sub-ms Wasm Shield latency path.

For the full dual-axis verification hub (Express → Three Pillars Inside → Three Pillars Outside), see [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md).

---

## 🎯 Core Scope & Value Proposition

| Horizon | Focus |
|---------|--------|
| **v1.0 Delivered (Sepolia verified)** | **Arbitrum One** GMX v2 **ETH/USDC GM Pool** (primary) + Hyperliquid **1× short** · **V1.0 Live Native Agent Integrations** (Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer) · Mainnet deployment ties to **M6 Grant distribution**. |
| **Zero Protocol-Level Lock-Up** | Zero protocol-level lock-up (100% non-custodial); redemption speed is subject only to GMX v2's native 3–5 min async Keeper settlement. Optional ingress AML firewall (e.g. Robinhood **`4663` inbound block**). |
| **V1.5 Roadmap Spec** | ⏳ Planned | **Fleet-scale [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) enforcement** · EIP-7702 EOA → Agent Smart Account · CrewAI / AutoGen adapters · BTC/USDC isomorphic GM (config-only) |
| **V2.0 Design Spec** | ⏳ Planned | **Institutional CaaS & Orbit Shield** — productize `@slivervine/citadel-sdk` for AI DEXs / Orbit L3s · **10 bps protocol authorization fee** on pre-execution risk checks |

**Standards & Infrastructure:** [EIP-712](https://eips.ethereum.org/EIPS/eip-712) · [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) / [ERC-7579](https://eips.ethereum.org/EIPS/eip-7579) · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Draft (Virtuals Protocol) · [Standard Compliance & ERC/EIP Wiki](./docs/architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md).

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

Derivations & R01–R20 bounds: [Technical Specification §3.1](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#31-microsecond-moats) · [Verification Matrix](./docs/VERIFICATION_MATRIX.md) · [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md).

**Risk spectrum (88% / 12%):** Formal mathematical definition — [Risk Mitigation & Disclaimer Framework §0.1](./docs/architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) · **80/20 Pareto** (microstructure loss concentration) targets the acute 20% tail within Pillar 3.

## 💳 Commercial Model — V1.0 Open Gateway · V1.1 SaaS Roadmap

### V1.0 Submission Baseline (Current)

| Attribute | Value |
|-----------|-------|
| **Architecture** | Public Open Gateway for Buildathon / hackathon evaluation |
| **Protection** | Lightweight Edge RPS rate limiter (header/IP-based) against Sybil DoS |
| **Demo headers** | `X-Citadel-Tier: public` · `X-Citadel-RPS-Limit: 5` |

### V1.1 Roadmap — 4-Tier Commercial Model (Milestone 1 Post-Grant)

| Tier | Monthly | Annual (billed yearly) | RPS | Intents / mo | Entitlements |
|------|---------|------------------------|-----|--------------|--------------|
| **Starter Shield** | **$10** | **$96/yr** | **5** | **100k** | B2B anti-Sybil entry barrier |
| **Pro Guard** | **$99** | **$950/yr** | **50** | **5M** | WASM closed kernel · R17 daily loss prevention |
| **Business Citadel** | **$299** | **$2,870/yr** | **200** | **20M** | Priority memory queue · R20 auto-severance · tenant isolation |
| **Enterprise Dedicated** | **$1,999+** | Custom contract | **1,000+** | Custom | Dedicated Cloudflare Edge nodes · custom Rust/WASM risk modules · private MEV routing |

> **Scope honesty:** v1.0 ships the **public open gateway** only. The **4-tier paid model is V1.1 Milestone 1** (Cloudflare KV API Key metering).

## 🛣️ Post-Buildathon B2B Commercialization & PMF Roadmap (Post-9/14)

SliverVine Protocol enforces a strict two-stage strategy balancing Zero-Friction Hackathon Verification with Long-Term Commercial Sustainability:

- **Stage 1: Buildathon Verification Phase (Active Now — Pre-9/14)**
  - **Public Dune Telemetry Dashboard** (read-only, no API key): Open-access Dune Live Telemetry Dashboard ([https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)) — live **`IntentAttested`** + **`RiskTripBlocked`** streams from Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`; **PEV** (`SUM(blocked_intent_notional_usd)`) fully operational on-chain · spec: [`docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md`](./docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md).
  - **Arbitrum One Mainnet Ignition Gate**: Non-custodial `SliverVineGate` on ChainID `42161` at `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` — Mainnet Ignition Tx [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) *(Bootstrap Ignition Keys `0x1111…`/`0x2222…`; production multisig rotation via native governance)*.
  - **Sepolia Safety Gate**: Full EIP-712 session key validation and 0-Gas Fail-Closed protection verified on Arbitrum Sepolia (`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`).
  - **Reference Interceptor Harness**: [`examples/agent-interceptor-demo.ts`](./examples/agent-interceptor-demo.ts) — Reference Interceptor Harness & Adapter for Virtuals Protocol and ElizaOS agent swarms (evaluator-reproducible; not a production partnership attestation).
  - **Zero-Touch SDK**: [`withCitadelShield`](./src/sdk/decorator.ts) — one-line decorator wrapping agent execution hooks with inline `checkSoilResistance()` pre-broadcast severance (`import { withCitadelShield } from '@slivervine/citadel-sdk'`).

- **Stage 2: B2B Monetization & Risk API Launch (Post-9/14 — V1.1)**
  - **SliverVine Citadel Risk API & Bad Debt Calculator (powered by on-chain telemetry & Dune Analytics visualization)**: Monetize SliverVine's proprietary sub-ms risk calculation algorithms and shadow margin telemetry via a B2B API — **not** Dune platform data resale. [Dune](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) remains the **public read-only visualization dashboard**; **V1.1** paid Edge API tiers (**Starter $10/mo** · **Pro $99/mo** · **Business $299/mo** · **Enterprise $1,999+/mo**) gate programmatic access to Citadel-computed liquidation risk, margin health, and bad-debt savings metrics for vault managers and AI Agent swarms (Wayfinder, Virtuals, M2M Treasury Funds).
  - **V2.0 CaaS rail (Design Spec):** `@slivervine/citadel-sdk` + **10 bps protocol authorization fee** on pre-execution risk checks. Live v1.0 builder lane remains GMX **+10 bps `uiFeeReceiver`**.

---

## ⚔️ Competitive Matrix — Pre-Execution vs. Post-Execution Risk

| Feature / Dimension | Legacy Providers (Gauntlet / Chaos Labs) | SliverVine Citadel Gate (Pillar 3) |
| :--- | :--- | :--- |
| **Execution Phase** | Post-execution dashboards & multi-day governance parameter updates | **Pre-execution inline interception** (Sub-ms BEFORE mempool broadcast) |
| **Latency / Hot-Path** | Minutes to Days (Off-chain simulations + DAO votes) | **p50 ~106 µs** Shield/TS Gateway path · Wasm warm **&lt;60 µs** (Rust `#![no_std]` on Edge) |
| **Protection Level** | Global protocol parameter tuning (LTV, Collateral factors) | **Granular tx-level & LP soil protection** (MEV, RPC jitter, Oracle lag) |
| **Deployment Model** | Advisory / SaaS Analytics | **Inline Edge Gate & Open-Source Wasm SDK** (`@slivervine/citadel-sdk`) |

## 🔬 Santenmoku Engine (Internal Codename) — BeDelta v1.0 Battle-Tested Matrix

SliverVine Protocol is engineered under strict mathematical invariants and zero-trust pre-execution assertions.

### Tailor-Made Mathematical Invariants (Protocol Physical Boundaries)

**Primary Execution Boundary:** Full Arbitrum Native Multi-Protocol Coverage (GMX v2, Pendle, Uniswap V3, Aave V3, Morpho Blue, **Variational Omni RFQ**) + Cross-Chain High-Frequency Orderbook Defense (Hyperliquid L1 Session Key Adapter) + optional Arbitrum-native RFQ OLP hedging.

| Protocol | Venue | Physical Boundary Check | Code Module |
|----------|-------|-------------------------|-------------|
| **GMX v2** | Arbitrum One | Pool Imbalance Ratio: \|OI_long − OI_short\| / PoolTVL > **0.35** · Collateral Reserve < **105%** | [`gmx-v2-invariants.ts`](./src/adapters/gmx/gmx-v2-invariants.ts) · [`gmx-v2-order-payload-guards.ts`](./src/services/adapters/gmx-v2-order-payload-guards.ts) |
| **Pendle** | Arbitrum One | Discounted Implied Yield Shock: \|Yield_current − Yield_oracle\| > **150 bps** | [`pendle-pool-factory-adapter.ts`](./src/adapters/pendle/pendle-pool-factory-adapter.ts) |
| **Uniswap V3** | Arbitrum One | Active Tick Liquidity Depth · Dynamic Directional Fee Impact > **0.50%** slippage/penalty (**50 bps**) | [`uniswap-v3-adapter.ts`](./src/adapters/uniswap/uniswap-v3-adapter.ts) |
| **Aave V3** | Arbitrum One | Cross-chain Health Factor HF < **1.15** (Fail-Closed Buffer) | [`aave-v3-adapter.ts`](./src/adapters/aave/aave-v3-adapter.ts) |
| **Morpho Blue** | Arbitrum One | Oracle staleness > **1h** or price deviation > **0.30% / Sandwich trip (**30 bps**) | [`morpho-blue-adapter.ts`](./src/adapters/morpho/morpho-blue-adapter.ts) |
| **Hyperliquid** | Independent L1 HF Orderbook AppChain | Session Key **MaxSizePerOrder** · **Rate Limit** (120/min) · Orderbook Spread > **20 bps** | [`hyperliquid-session-guard.ts`](./src/adapters/hl/hyperliquid-session-guard.ts) |
| **Variational** | Arbitrum One (Omni RFQ) | Quote stale **>500ms** or oracle drift **>30 bps** · OLP depth utilization **>15%** (long-tail) | [`variational-rfq-adapter.ts`](./src/adapters/variational-rfq-adapter.ts) |

> **Hyperliquid positioning:** Independent L1 High-Frequency Orderbook AppChain that originated alongside Arbitrum's perp liquidity ecosystem — cross-venue Δ-neutral hedge leg via session-key adapter, not Arbitrum-native execution.

### 1. On-Chain Enforcement Layer (Solidity v0.8.28)
* **Unit Tests**: 🟢 **60 Passed | 0 Failed**
* **Line Coverage**: 📊 **95.51% Overall** (`SliverVineGate.sol`: **95.65%**)
* **Property Fuzzing**: 🌀 **327,675 Property Fuzz Executions** (`pnpm audit:nightly` / `FOUNDRY_PROFILE=deep`; standard `forge test` = **5,120** = 5×1,024) (All Green)
* **Invariant Testing**: ⛓️ **3 Invariants × 16,384 Depth = 49,152 Stateful Calls** (0 Counterexamples)
* **Gas Deadlock**: ⛽ `verifyAndConsume`: **25,853 min / 28,043 median gas**
* **Runtime Bytecode**: 📦 **8,716 Bytes (8.71 KiB)** — Zero External Dependencies (`Assembly-optimized`)

### 2. Off-Chain Pre-Execution Radar (TypeScript / V8 Runtime)
* **Vitest SSOT**: 🧪 **192 test files | 834 PASS Clean (100% PASS)** on `pnpm test -- --run`
* **Chaos Matrix**: 🌪️ **255 Severe Failure Cases | 0 Crashes**
* **Edge Decision Latency**: ⏱️ **SLO &lt; 1.0ms | p50 ~106 μs Shield/TS Gateway | Wasm warm &lt;60 μs | Pure Math: 0.0002 ms (200 ns)**
* **Worker Bundle**: 📦 **69.28 KiB gzip** measured hot path (`pnpm bundle:measure`) · **276.2 KiB raw** Worker upload (`limitKiB: 150` · `pass: true`)

---

## 🗺️ Protocol Development Milestones (M0 – M6)

| Milestone | Status | Deliverables & Verification |
|-----------|--------|-----------------------------|
| **M0: Operational Foundation** | ✅ Delivered | WSL / PNPM Monorepo, Cloudflare Edge Worker pipeline, and CI/CD strict typecheck. |
| **M1: On-Chain Citadel Gate** | ✅ Delivered | `SliverVineGate.sol` core invariant locks · **327,675 deep fuzz** (`FOUNDRY_PROFILE=deep`) · 25k gas bounds. |
| **M2: Pre-Execution Radar** | ✅ Delivered | `checkSoilResistance()` engine, **192 test files | 834 PASS Clean (100% PASS)**, 69.28 KiB gzip bundle, sub-ms latency. |
| **M3: Dual-Chain & ZeroDev AA** | ✅ Dry-Run Harness Verified (Kernel v3 / EntryPoint v0.7) | **Opt-In Pillar 1** ZeroDev Kernel v3 AA Adapter (`USE_ZERODEV_AA` default-off) · optional Robinhood Chain / Across (`46630`/`4663`) **Pillar 2 Reference Escort Adapters** into Arbitrum. Wasm Shield + Native Ingress unaffected. |
| **M4: WASM Engine & IP Moat** | ✅ Delivered | Rust `#![no_std]` Wasm core (`pkg/soil_core.wasm`) — Cloudflare budget `<28kb`, hot-path exec `<60µs` — & `@slivervine/citadel-sdk` shipped. |
| **M5: TCA Data & Hyperliquid** | ✅ Delivered (evolving) | TCA / grant-audit surfaces & HL Testnet 5-trade provenance — **Live TCA Analytics HUD actively evolving**. |
| **M6: Institutional Grant Submission** | ✅ Mainnet Ignition Delivered · ⏳ Final Demo Video | Arbitrum One Gate `0xb174118b…` · [Ignition Tx `0x54c153…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · GMX / Arbitrum grant application package. |

---

## 🛡️ Auditor — 30-Second CLI & API Verification

> **SSOT:** All verification commands, pillar mapping, and expected outputs live in [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md).

```bash
# Zone A — Express (recommended first pass)
pnpm demo && pnpm demo:e2e && pnpm test

# Zone B — Inside Three Pillars
pnpm test:zerodev
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
cd SliverVineGate && forge test && cd ..
pnpm audit:fast && pnpm audit:security

# Zone C — Outside Three Pillars
pnpm demo:gmx
pnpm demo:hl
pnpm demo:pendle
pnpm demo:uniswap
pnpm demo:aave
pnpm demo:morpho
pnpm demo:wayfinder
pnpm demo:wayfinder -- --trip
pnpm tsx scripts/generate-survival-report.ts
curl -s https://bedeltawater.slivervine.xyz/api/grant-audit | jq .provenanceVerified
```

Full command matrix, narratives, and bundle checks → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md).

---

## 🏛️ Tri-Sensor Telemetry Matrix

The Citadel pre-execution gateway runs a closed-loop **Tri-Sensor Telemetry Matrix** before any GMX broadcast:

| Sensor Channel | Observability Domain | Control Action |
|----------------|---------------------|----------------|
| **BaseFee Velocity Sensor** | ArbOS EIP-1559 base-fee acceleration proxy | Throttle dispatch when fee velocity exceeds dynamic tolerance band |
| **RPC Jitter Radar** | Multi-provider RTT dispersion & head-staleness | Fail-closed when jitter radar flags endpoint phase desync |
| **Phase-Shift Instability Detector** | Cross-venue oracle / book phase alignment | Invoke instant circuit breaker on cross-sensor phase-shift anomaly |

---

## 🚀 Unified Institutional Pre-Execution Pipeline

**Center of gravity = Arbitrum One.** SliverVine Protocol is a Sub-ms 0-Gas Pre-Broadcast Safety Citadel & Risk Navigator for AI Agents on Arbitrum. Primary venue: Arbitrum One GMX v2 **ETH/USDC** GM + Hyperliquid **1× short**, with Pillar 3 Wasm Shield as the technical moat. Robinhood / Across are **Pillar 2 Reference Escort Adapters** only.

```text
[ Optional Permissioned Ingress (e.g. Robinhood Chain 46630 / 4663) ]
 │
 ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Pillar 1: GATEHOUSE (Opt-In AA Layer) │
 │ ZeroDev Kernel v3 · 30s TTL · Paymaster (optional) │
 └──────────────────────┬──────────────────────────────────┘
 │
 ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Pillar 2: COMPLIANCE INGRESS FIREWALL (Escort Acct.) │
 │ Unidirectional AML firewall · IN_FLIGHT_BRIDGE_CAPITAL │
 │ Pending-Capital Recognition (lostUsd ≡ 0) · ref adapter │
 └──────────────────────┬──────────────────────────────────┘
 │
 ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Pillar 3: SHIELD (Pre-Execution Risk Engine) │
 │ p50 ~106 µs Shield/TS Gateway · Wasm warm &lt;60 µs │
 │ R01–R20 Defense Matrix (17|2|1) · signingChannelOpen: false │
 └──────────────────────┬──────────────────────────────────┘
 │
 ▼
[ PRIMARY: Arbitrum One GMX v2 ETH/USDC GM + Hyperliquid 1× Short ]
```

**[Pillar 1: Gatehouse — Opt-In Account Abstraction Layer]** ZeroDev Kernel v3 **opt-in** scoped session keys (`USE_ZERODEV_AA` default-off) · **30s TTL Heartbeat / Intent Execution Window** (`WS_HEARTBEAT_INTERVAL_MS` · `DEFAULT_TTL_MS`) — distinct from underlying cryptographic session key lifetime (bounded up to **24h / 7d** per module scope) · **Paymaster gas sponsorship** ($0.50/op · $10/day cap; fail-closed fallback when exhausted). *Pillar 3 Wasm Shield (p50 ~106 µs) and Arbitrum Native Ingress operate independently of ZeroDev.* Evaluated via `pnpm test:zerodev` and E2E dry-run (`sessionOk`, `allowedToSign`).*

**[Pillar 2: Compliance Ingress Firewall — Escort Accounting]** Venue-agnostic unidirectional AML firewall · honest **`IN_FLIGHT_BRIDGE_CAPITAL`** labels · **Pending-Capital Recognition Invariant (`lostUsd ≡ 0`)** — protocol never prematurely writes off in-flight bridge capital as loss during active execution · *(Robinhood Chain / Across are **Pillar 2 Reference Escort Adapters** — they serve as integration examples and are not the core product identity of SliverVine Protocol.)* **Audit:** [`docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md).

**[Pillar 3: Shield — Pre-Execution Risk Engine]** **`pkg/soil_core.wasm`** · `checkSoilResistance()` at **p50 ~106 µs** (Shield/TS Gateway path) · Wasm warm **&lt;60 µs** · **R01–R20 Defense Matrix (17 Active | 2 Refactored | 1 Deprecated)** · **`signingChannelOpen: false`** on any soil / oracle / sequencer trip — primary technical moat before Arbitrum / HL broadcast.

**Architecture standards:** **EIP-712** Gate attestation · **ERC-4337/7579** ZeroDev Kernel v3 · **EIP-1559** ArbOS Tri-Sensor · **ArbOS 61** · optional Robinhood ingress · **Wasm** `soil_core` — see [Standard Compliance & ERC/EIP Wiki](./docs/architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md).

---

## 📚 Documentation

**Grant reviewers & institutional auditors:** start at [`docs/README.md`](./docs/README.md) → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md).

### Top 5 Core Grant Documents

| # | Document | Role |
|---|----------|------|
| 1 | [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) | SSOT verification hub — Express → Three Pillars Inside → Outside |
| 2 | [`docs/architecture/01_TECHNICAL_SPECIFICATION.md`](./docs/architecture/01_TECHNICAL_SPECIFICATION.md) | Yellow Paper · R01–R20 risk matrix |
| 3 | [`docs/audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](./docs/audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) | Institutional DDIP · Basel III alignment |
| 4 | [`docs/audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./docs/audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) | Opt-In Pillar 1 ZeroDev AA vs. independent Wasm Shield substrate |
| 5 | [`docs/sdk/CITADEL_SDK_BLUEPRINT.md`](./docs/sdk/CITADEL_SDK_BLUEPRINT.md) | B2B CaaS integration blueprint · 10 bps builder + referral rebate model |

### Supporting

| Document | Purpose |
|----------|---------|
| [`docs/pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md`](./docs/pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md) | Grant pitch · 35s demo video storyboard |
| [`docs/architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./docs/architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | Risk mitigation · **88% / 12% spectrum** · fail-closed boundaries · disclaimer framework |
| [`docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) | Pillar 2 reference adapter audit · 5/5 bridge tests |
| [`docs/audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./docs/audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) | Pillar 3 Wasm Shield core spec · R01–R20 · Tri-Sensor |
| [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) | Buildathon main submission pack |
| [`docs/README.md`](./docs/README.md) | Full docs index · language policy |

---

## 📜 License

**Protocol / Worker (repo root):** **BUSL-1.1** — Copyright (c) 2026 SilverVine Labs. Change Date `2028-08-21` → Apache-2.0 (also converts earlier at M2 / $10M TVL per program terms). See [LICENSE](./LICENSE).

**Developer integration harness:** [`@slivervine/citadel-sdk`](./src/sdk/) under `src/sdk/` is licensed **Apache-2.0** (Copyright (c) 2026 SilverVine Labs) for third-party integration. See [`src/sdk/LICENSE`](./src/sdk/LICENSE), [`src/sdk/README.md`](./src/sdk/README.md), and [`docs/sdk/CITADEL_SDK_BLUEPRINT.md`](./docs/sdk/CITADEL_SDK_BLUEPRINT.md). EIP-712 domain: `SliverVineCitadel`. Docs index: [`docs/README.md`](./docs/README.md).
