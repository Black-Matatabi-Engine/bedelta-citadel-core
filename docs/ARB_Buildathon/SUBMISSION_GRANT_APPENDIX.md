# Grant Submission Appendix — Sponsor Matrix · GTM · Milestones

> **Lean submission:** [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) · **Hub:** [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)

## Executive Summary & One-Page Strategic Memo

**Official pitch:** Sub-ms 0-Gas Pre-Broadcast Safety Citadel & Risk Navigator for AI Agents on Arbitrum — see metadata table above.

| Judge pointer | SSOT document |
|---------------|---------------|
| Hybrid Pillar Sets X & Y · R01–R20 | [Architecture index §01–03](../architecture/README.md) · [Hybrid Pillar Sets X & Y](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) · [Defense Matrix](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md) |
| CLI Tier 0–5 verification | [Verification Matrix](../VERIFICATION_MATRIX.md) |
| Dune telemetry · SQL panels | [Dune Dashboard Specification](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) |
| Pendle × GMX cross-guard | [§ Core Risk Decision Matrix](#core-risk-decision-matrix-evaluatependlegmxcrossguard) · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) |
| [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) agent policy | [Technical Specification §0.1](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#01-bytecode-predicate-verification-v10-erc-7715-post-grant-design-spec) |
| Institutional DD / Basel mapping | [Due Diligence Memorandum](../audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) |
| **80/20 boundaries & V2.0 R&D** | [Risk Spectrum §0.1](../architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does-and-does-not-guarantee) · [§ 88% Defense Mesh](#88-defense-mesh-12-post-grant-rd-roadmap) · [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md) |

Built on the Santenmoku internal engine (p50 ~106µs), [`@slivervine/citadel-sdk`](../../src/sdk/README.md), and consume-once EIP-712 Gate attestation — SliverVine intercepts AI trade intents **before** mempool or bundler ingress. Deep narrative: [Problem / Solution](#the-problem) · [Sponsor Integration Matrix](#sponsor-integration-matrix).

### The Problem

AI Trading Agents combine dynamic yield tokens (e.g., Pendle PTs), high-leverage perpetuals (e.g., GMX), and cross-chain liquidity into automated strategies. However, existing risk controls are either reactive (on-chain liquidation after damage is done) or coarse "transaction blockers" that fail to distinguish between **risk-expanding** and **risk-reducing** actions. Blocking a de-leveraging transaction during volatility traps the AI agent in a high-risk position, accelerating forced liquidation (The Observatory Paradox).

* **Real-World Exploit Context**: Autonomous AI Agents on Arbitrum and Base (e.g., Virtuals ecosystem agents & Clanker smart accounts) face unmitigated pre-broadcast vulnerabilities, where prompt injections and sandwich bots exploit execution latency, leading to unauthorized trade execution and slippage losses before mempool confirmation.

### The Solution: Intent-Aware Risk Navigation

SliverVine shifts risk management from "naive blocking" to **Intent-Aware Navigation**:

1. **Observability**: Real-time monitoring of Pendle PT yield jitter/expiry dynamic fees, GMX maintenance margin buffers, and liquidity depth — [Pendle registry SSOT](../../src/adapters/pendle/pendle-pt-registry.ts) · [Technical Specification §1](../architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md#1-core-product-identity).
2. **Intent Taxonomy**: Directional division separating `RISK_INCREASE` (`open`/`increase` → strict Fail-Closed evaluation) from `RISK_DECREASE` (`close`/`reduce` → greenlighted with safety routing) — [§ Core Risk Decision Matrix](#core-risk-decision-matrix-evaluatependlegmxcrossguard).
3. **Shadow Margin Engine**: Pre-execution PT exit proceeds vs GMX maintenance margin — [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) · [Technical Specification §3.1](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#31-microsecond-moats-summary).

### Why Citadel Shield is NOT a Normal RPC Gateway (Cerebrum vs. Cerebellum)

Citadel Shield is the **Cerebellum & Reflex Arc** — the LLM **Cerebrum** plans; Citadel **Cerebellum** executes involuntary safety reflexes before EIP-712 signing.

```
┌────────────────────────────────────────────────────────────────┐
│ [Cerebrum] LLM Reasoning & Agent Loop (~1.0s - 10.0s)          │  <-- CoT / Tool Calls / Non-Deterministic
└────────────────────────────────────────────────────────────────┘
                         │ (Intent Payload)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│ [Citadel Reflex Arc] Cerebellum Shield (⚡ 15.0µs - 106.0µs)     │  <-- 0.015ms-0.106ms / Deterministic Fail-Closed
└────────────────────────────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     [ PASS: <106µs ]            [ FAIL: <15µs ]
    Signature Released          Reflex Deadlock Severed
```

| Dimension | Normal RPC Gateway | Citadel Shield (Cerebellum) |
|-----------|-------------------|-----------------------------|
| **Role** | Transport relay | Involuntary safety reflex |
| **Latency** | 50–300ms+ RTT (transport) | **15.0µs–106.0µs** (0.015ms–0.106ms) vs LLM **~1.0s–10.0s** reasoning loop |
| **On hallucination** | Forwards calldata | **0-Gas FAIL-CLOSED** · `severSigningChannel()` |
| **AI safety** | Unprotected | Out-of-scope cross-chain venue (e.g. Base / **Aerodrome**) severed in **<15.0µs** |

**Fail-Closed walkthrough:** Cerebrum drifts into **cross-chain intent hallucination** — routing to **Aerodrome** (legitimate Base-native protocol) while policy authorizes only Arbitrum One's **7-protocol matrix**. Aerodrome is **out-of-scope**, not malicious; Citadel's Cerebellum triggers **<15.0µs** physical deadlock, severing EIP-712 **before** any cross-chain or unvetted execution → reproduce via `pnpm demo:quad -- --trip`.

### Legal & Regulatory Positioning

> **DISCLAIMER**: SliverVine Protocol provides software-based risk analytics, monitoring, policy enforcement, and execution-safety tooling only. It does NOT provide asset custody, underwriting, indemnity, reimbursement, profit guarantees, uptime SLAs, or any form of insurance-like coverage. All risk decisions are algorithmic and based on user-defined policy parameters and protocol-aware market signals. Fees charged are software access and API metering fees only, creating no obligation to compensate financial losses.

---

## 88% Defense Mesh & 12% Post-Grant R&D Roadmap

> **Formal definition (SSOT):** [Risk Mitigation & Disclaimer Framework §0.1](../architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does-and-does-not-guarantee) — **100%** on-chain risk surface = **88%** pre-broadcast interception mesh + **12%** insurmountable systemic residuals · **80/20 Pareto** (microstructure loss concentration) targets the acute 20% tail within Pillar 3.

### Industry Baseline (~80% or Below)

Traditional DeFi / Agent risk checks rely on **post-hoc analytics** or **mutable pause functions**, leaving exploitable gaps for MEV sandwiching, LLM retry token-burn, and session-key blast-radius expansion.

### SliverVine V1.0 Delivered (**88% Defense Coverage**)

| Layer | Defense |
|-------|---------|
| 🟢 **Sub-ms Pre-Broadcast Severance** | 0-Gas Wasm soil fuse (`checkSoilResistance()` p50 ~106µs) blocks MEV & toxic fills **before** mempool / Sequencer queues |
| 🟢 **AI Behavioral Safety Substrate** | **60s LLM cooldown lock** prevents token-burning infinite retry loops; **dynamic ±2–5 bps jitter** prevents MEV threshold sniping ([`decorator.ts`](../../src/sdk/decorator.ts) · [`soil-threshold-jitter.ts`](../../src/services/risk-control-lib/soil-threshold-jitter.ts)) |
| 🟢 **0-Proxy Immutable Gate** | No admin upgrade backdoors; EIP-712 consume-once attestation (`consumed[digest]`) on live **Arbitrum One** Gate |
| 🟢 **Session Key Blast-Radius Isolation** | Scoped `ORDER_EXECUTE` + **$5,000** notional cap · **v0.95 replay guard** — consume-once nonce + `expiresAt` (`5829e9a`) | `executeHlSessionKeyOrder` |
| 🟢 **Oracle & RPC Resilience** | **30s** oracle-lag fail-closed (`ORACLE_LAG_DEADLOCK` / `ORACLE_LAG_DEADLOCK_MS = 30_000`) + **Honeypot trap RPC** defense (`evaluateRpcDefenseGate()` · 99% synthetic slippage decoy) |

> **Engineering scope boundary:** Citadel is a **pre-consensus intent firewall**, not a universal risk insurer. V1.0 models **88% mesh coverage** with a disclosed **12%** systemic residual tail — see [Risk Framework §0.1](../architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does-and-does-not-guarantee).

### The Remaining **12%** (Why We Need This Foundation Grant)

Residual systemic out-of-scope risks: **TEE enclave supply chains**, **multi-RPC eclipse consensus**, and **protocol-level DeFi flash-loan black swans** on external venues (GMX / Hyperliquid).

Grant allocation directly fuels our **V2.0 R&D Roadmap**:

1. **TEE / Enclave Hardware Key Isolation** — AWS KMS / SGX Enclaves beyond Bootstrap Ignition Keys.
2. **Multi-RPC Quorum Consensus Verification** — Protecting against RPC eclipse spoofing before Wasm evaluation.
3. **Decentralized PEV (Prevented Exploit Volume) Intelligence Feed** — Real-time Dune telemetry into decentralized agent alert networks.

**V1.0 production scope:** Ephemeral Ignition Signers (`0x1111…`/`0x2222…`) on Mainnet Gate · GMX v2 dry-run/Vitest pre-flight guards · **GM Pool I/O channel CLOSED on 42161** (deposit [`0xe3155220…`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) · withdraw [`0xfd3601dc…`](https://arbiscan.io/tx/0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410)) · **Pendle Institutional Safety Sentinel** + **Pendle AI Guarded Pool Factory** · **V1.0 Live Native Agent Integrations** (Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer) · Dune Sepolia live stream + 42161 SQL pre-compiled · **public open gateway** (`X-Citadel-Tier: public` · 5 RPS) · V1.1 4-tier SaaS roadmap · Stylus V2.0 dual-execution coprocessor (`pnpm build:stylus`; EIP-1967 upgradeable proxy path) · **automated R20 severance on `FLAGS_*` trips** · **30s sliding-window pending OI defense** · Monte Carlo 87.39% toxic flow blocked (10,000-run simulation; nominal modeled capital).

---

## Architectural SSOT & Hardened Metrics

* **Test Suite**: **217 test files | 967 PASS clean** — re-run `pnpm test -- --run` to confirm. Full matrix: [Verification Matrix](../VERIFICATION_MATRIX.md).
* **Dual-Demo Architecture**: **`pnpm demo`** — 12 Dual Pillar Set X & Y ANSI scenarios (GMX v2 price impact / Data Streams lag / delever · HL EIP-712 session key / WS stale / GateLockout · Pendle AI guarded pool / 60s TTL stale oracle) · zero-I/O sync hot-path **p50 ~106µs** · **`pnpm demo:e2e`** — **4-step Happy Path** macro cross-venue lifecycle (`--unwind` · `--trip` optional) · **`pnpm demo:wayfinder`** — Wayfinder route interception on Arbitrum `42161` (normal ALLOW · `--trip` 0-Gas FAIL_CLOSED).
* **Formal Verification**: Consume-once and replay-denial invariant lemmas 100% code-verified via native Foundry test suite ([`SliverVineGate.t.sol`](../../SliverVineGate/test/SliverVineGate.t.sol) & [`SliverVineGate.invariant.t.sol`](../../SliverVineGate/test/SliverVineGate.invariant.t.sol)) · [Technical Specification §3](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#3-cross-venue-risk-engine-defense-matrix-r01-r20).
* **Game-Theoretic Simulation**: 10,000 Monte Carlo runs · **87.39% toxic flow blocked** · $9.88M **nominal simulated** LP capital — [`game_theory_simulation_results.json`](../telemetry/game_theory_simulation_results.json) *(simulation only; not live savings)*.
* **Deployments**: Arbitrum One Mainnet Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Ignition Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · Arbitrum Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Robinhood Chain `46630`/`4663` — [On-Chain Verification](#on-chain-verification-arbitrum-one-42161) · [Sepolia](#on-chain-verification-arbitrum-sepolia-421614).
* **0-Gas off-chain severance:** Arbitrum One Gate (`0xb174…`) **engineered for 0-Gas Pre-Execution Off-Chain Severance**. Citadel Risk Gates halt compromised payload signatures at the Edge **prior to mempool submission**, preserving **L2 state space cleanliness**.

### Core Risk Invariants (Judge Quick Reference)

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0
$$

$$
\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}
$$

$$
t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s} \ll t_{\text{mempool\_broadcast}}
$$

Full derivations: [Technical Specification §3.1](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#31-microsecond-moats-summary) · [Verification Matrix](../VERIFICATION_MATRIX.md) · [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md).

### Multi-Wallet Cross-Venue Architecture (Wallet A × Wallet B)

SliverVine's **production delta-neutral envelope** is not a single-wallet abstraction. Two specialized wallets cooperate across venues with **zero key coupling**; the **cross-wallet hedge SSOT** ([`gmx-cross-wallet-hedge.ts`](../../src/services/gmx-cross-wallet-hedge.ts)) matches **GMX ETH long delta (Wallet B)** to **Hyperliquid ETH perp shorts (Wallet A)** until **Δ_net ≡ 0**. Live Worker logs: `[WALLET_B_GMX_STATE]` · `[WALLET_A_HL_STATE]` · `[CROSS_VENUE_MATCH]`. HL session-key execution is **exclusively** via `executeHlSessionKeyOrder` (legacy stubs blocked when `IS_MAINNET=true`).

#### Production Workflow (Live Mainnet SSOT)

| Plane | Wallet / Contract | Role |
|-------|-------------------|------|
| **Wallet B — GM LP Yield Vault** | `0xc9BddABD80982d2201376195DD9B85fb7951546f` | **Dedicated exclusively** to GM LP deposit/withdraw · **no** HL keys · **no** GMX perp |
| **Wallet A — Hedge Engine (Primary)** | `0xef0752df6387248B897F3A59A180af42D801960d` | Hyperliquid session-key **perp short** · 0-Gas · low latency |
| **Wallet A — Hedge Engine (Fallback)** | same | GMX v2 synthetic short via [`gmx-v2-wallet-a-short-builder.ts`](../../src/services/adapters/gmx-v2-wallet-a-short-builder.ts) · USDC collateral · simulate only |
| **On-Chain Settlement** | PolicyGuardV2 `0xfd98cadb…` · MatrixSwitch `0x4129aee9…` · RiskOracleV2 `0xfadb1475…` | Phase A+B+C **Verified Live** @ `572e5cd` · **`stylusCoprocessor=0`** → Pure Solidity fallback · 100% fail-closed without separate Stylus mainnet activation |
| **Gate ↔ PolicyGuardV2 Link** | `SliverVineGatePolicyLink` `0xe4ef5350…` → Gate `0xb174…` | **Verified Live** — setPolicyGuard [`0x1b158a4a…`](https://arbiscan.io/tx/0x1b158a4a40409e39215b76b5b12693c2802b49b190ecc0be97c986f167b9a182) · deploy [`0x7ce414b7…`](https://arbiscan.io/tx/0x7ce414b737c6efed4068034dadebd9f017e1e6eb832aba64e3ba656ac0380ad9) |
| **Wallet B Perp Isolation** | [`wallet-isolation-guard.ts`](../../src/core/wallet-isolation-guard.ts) | Global `WALLET_B_PERP_FORBIDDEN` on all GMX createOrder builders |

**Wallet B — Verified GM I/O (triple-proof Arbiscan):**

| Event | Tx |
|-------|-----|
| GM Deposit Multicall | [`0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) |
| GM LP → Router Approve | [`0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e`](https://arbiscan.io/tx/0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e) |
| GM Withdraw Multicall | [`0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410`](https://arbiscan.io/tx/0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410) |

| Lane | Default address | Venue | Responsibilities |
|------|-----------------|-------|------------------|
| **Wallet A — Hyperliquid Short Lane** | `0xef0752df6387248B897F3A59A180af42D801960d` | Hyperliquid L1 | Perp margin · scoped **session keys** · 1× short IOC execution · cron via `runScheduledGmxHedgeCron` · GMX short **fallback builder** (simulate) |
| **Wallet B — Arbitrum Vault / GMX GM Lane** | `0xc9BddABD80982d2201376195DD9B85fb7951546f` | Arbitrum One | **GM LP I/O only** · **$2,500** ingress vault · **$2,400** GMX v2 GM LP · **+10 bps `uiFeeReceiver`** treasury rebate |

**Capital flow (Grant Happy Path narrative):**

```
User $2,500 USDC ──► Wallet B (Arbitrum)
                         ├─ $2,400 ──► GMX v2 ETH/USDC GM Pool (long leg)
                         ├─  +$2.40 ──► Protocol Treasury (uiFeeReceiver · not principal)
                         └─  $100  ──► HL L1 margin bridge
Wallet A (Hyperliquid) ◄── session-key 1× short ──► Δ_net ≡ 0
```

**Judge demo:** `pnpm demo:e2e` simulates the full **multi-wallet lifecycle in one ANSI HUD** (Gatehouse → Robinhood escort → GMX deposit → HL hedge). Optional `--unwind` adds Step 5 R20 exercise; `--trip` stress-tests Step 1 soil intercept. Proof JSON: `docs/logging/last_e2e_run.json`.

**Latency SSOT:** **p50 ~106 µs** Edge `checkSoilResistance()` · Wasm **<28kb Cloudflare budget, <60µs execution** · M2M reflex `src/core/agent-citadel-guard.ts` &lt;12 µs. Full spec: [`README.md`](../architecture/README.md).

### Version Roadmap SSOT (V1.0 / V1.5 / V2.0)

| Horizon | Status | Scope |
|---------|--------|-------|
| **V1.0** | ✅ Code-Verified Live Baseline | Arbitrum One GMX v2 ETH/USDC GM + HL 1× short · Wasm `checkSoilResistance()` p50 ~106µs · **V1.0 Live Native Agent Integrations** — Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer ([`src/adapters/`](../../src/adapters/)) · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) policy pre-validation · EIP-712 consume-once Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Dune + SHA-256 dual-source `GET /api/grant-audit` · **public open gateway** (`X-Citadel-Tier: public` · 5 RPS) · Worker bundle **50.94 KiB gzip** · **217 test files | 967 PASS clean** |
| **V1.1** | ⏳ Milestone 1 Post-Grant | **KV API Key Metering + 4-Tier SaaS** ($10 / $99 / $299 / $1,999+) · multi-tenant rate limiter |
| **V1.5** | ⏳ Roadmap Spec | **Sub-ms Agentic Security & Swarms** — ERC-8196 (Final) fleet enforcement · EIP-7702 EOA → Agent Smart Account · Prompt Injection Defense Circuit (`severSigningChannel()` sub-100µs) |
| **V2.0** | ⏳ Design Spec | **Institutional CaaS & Orbit Shield** — `@slivervine/citadel-sdk` for AI DEXs / Orbit L3s · Pre-execution risk checks · ZeroDev Stage ⑦ Intent Composition (2PC ledger) |

Optional bridges (Robinhood / Across) are **Pillar Set X Reference Escort Adapters** — they do not define product identity. Aave/Morpho APY figures are *(Hurdle-rate probe only — not a yield-stacking product track)*.

---

## Ecosystem Synergy — Judge Persona Quick Map

| Ecosystem | Role for SliverVine | Why they win together | SSOT |
|-----------|---------------------|----------------------|------|
| **Arbitrum** | Pre-consensus execution primitive on **42161** | Live immutable Gate + Edge clearing before Sequencer ingress | Mainnet Tx · `SliverVineGate.sol` |
| **Pendle** | **Institutional Sentinel + AI Guarded Pool Factory** (V1.0 Pillar Set Y) | 60s TTL Oracle Fuse · 200bps Jitter Guard · `validateAIPoolSelection()` 5 Invariants · protocol-tax-free · SaaS credits in V1.1 | `src/adapters/pendle/pendle-market-oracle-adapter.ts` · `src/adapters/pendle/pendle-pool-factory-adapter.ts` · `src/guards/pendle-gmx-cross-guard.ts` |
| **Dune** | **PEV** + `RiskTripBlocked` telemetry | Indexes off-chain blocked attacks; Sepolia live · One SQL spec | `DUNE_DASHBOARD_SPECIFICATION.md` |
| **GMX** | Builder lane + pre-broadcast soil fuse | +10 bps `uiFeeReceiver`; blocks toxic GM intents pre-DataStore | `src/services/adapters/gmx-v2-order-payload.ts` |
| **Wayfinder** | Native pre-execution risk firewall on **42161** | `wayfinderCitadelShieldHook` · soil fuse + 8-dimension intent gate · 0-Gas fail-closed | `src/adapters/wayfinder/wayfinder-shield.ts` · `pnpm demo:wayfinder` |
| **Stabilizer** | Universal Sepolia sandbox & cross-pass layer on **421614** | Stabilizer → GMX v2 → Pendle routing · identical `checkSoilResistance()` gates | `src/adapters/stabilizer/stabilizer-adapter.ts` · `pnpm demo:stabilizer` |
| **Virtuals / ElizaOS / LangChain** | Full quad-framework pre-consensus firewall | `evaluateVirtualsGameTask()` · `evaluateElizaCitadelAction()` · `CitadelRiskGuardTool` | `src/adapters/virtuals/virtuals-game-adapter.ts` · `src/adapters/elizaos/elizaos-citadel-plugin.ts` · `src/adapters/langchain/langchain-citadel-tool.ts` · `pnpm demo:virtuals` · `pnpm demo:elizaos` · `pnpm demo:langchain` |
| **Robinhood** | Pillar Set X RWA ingress firewall | Outbound-only `46630/4663 → 42161` · **`lostUsd ≡ 0`** · inbound AML BLOCK · ArbOS Elara compatible | Unit-Verified Vitest SSOT — [`tests/adapters/across-ingress-bridge.test.ts`](../../tests/adapters/across-ingress-bridge.test.ts) **6/6** · [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) · `IngressSafetySwitch.sol` |

---

## Sponsor Integration Matrix

### 1. Arbitrum One / Sepolia (Core Base)

* **Lean On-Chain Gate by Design**: On-chain logic is strictly **immutable and non-custodial** (no proxy, no ETH custody) so the hot path stays on Cloudflare Edge — `checkSoilResistance()` **p50 ~106µs**. Dual-contract core: `SliverVineGate.sol` (consume-once attestation, Mainnet + Sepolia `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`) + [`SliverVineAgentPolicyGuard.sol`](../../contracts/src/SliverVineAgentPolicyGuard.sol) ([ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) agent-policy validation).
* **Mechanism**: Intercepts AI Trade Intents in the sub-millisecond off-chain pipeline (`src/core/agent-citadel-guard.ts`), validating soil fuse + deadman switch before settlement-layer EIP-712 (`SliverVineCitadel` domain) (0-Gas Fail-Closed).

### 2. Robinhood Chain (Chain ID: 46630 / 4663) — Pillar Set X RWA Ingress Firewall

* **Arbitrum H1 2026 alignment:** Permissioned **RWA capital escort** from Robinhood Chain (`46630` testnet · `4663` **production mainnet ingress**) into **Arbitrum One (`42161`)** via Pillar Set X Compliance Ingress Firewall — institutional treasuries ingress without naked delta or phantom loss booking.
* **Live Mainnet Smart Route (4663 → 42161):** ZeroDev Kernel v3 UserOp Hash `0x7b72ee9f4dc3f32f08a5de914ecf076c243d895522ecd72d17a2f7b025bc956d` · Verified Tx [`0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a`](https://arbiscan.io/tx/0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a) · Harness `pnpm tsx scripts/execute-smart-route-live-demo.ts`
* **Integration**: Pillar Set X Ingress Bridge Adapter (`src/adapters/across-ingress-bridge.ts`) & R20 Circuit Breaker Sever Pipeline (`src/services/root-protection-lib/circuit-breaker-sever.ts`) · on-chain **`IngressSafetySwitch.sol`** AML oracle flush.
* **Mechanism**: **Optional Pillar Set X Reference Escort Adapter** (not the protocol identity). Outbound `46630`/`4663` → `42161` only; inbound `42161` → Robinhood → **`AML_INBOUND_TO_ROBINHOOD_BLOCKED`**. **Pending-Capital Recognition Invariant:** **`lostUsd ≡ 0`** on `IN_FLIGHT_BRIDGE_CAPITAL` until explicit `SETTLED` or `BRIDGE_TIMEOUT_FAIL_CLOSED` (>1h). When deadlock condition R20 is triggered, `severSigningChannel()` immediately severs hot-key signature pipelines, locking the engine into read-only observer mode.

### 3. Pendle Finance (V1.0 Live · Pillar Set Y)

V1.0 ships **two complementary Pendle integrations** — institutional safety layer, not a yield product:

**1. Pendle Institutional Safety Sentinel** — 60s TTL Oracle Fuse & 200bps Jitter Guard

* Citadel operates as an **institutional pre-execution safety layer** for existing PT/YT exposure — **60s TTL Oracle** with **`PENDLE_ORACLE_STALE`** soil fuse · expiry **<7d** + yield jitter **>200 bps** → fail-closed
* **Dynamic Market Oracle** ([`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts)): zero-I/O sync `ingest()` / `resolve()` in-memory cache · **TTL default 60s**
* **Cross-Guard** ([`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts)): Shadow Margin vs GMX maintenance · Observatory Paradox fix (`close`/`reduce` greenlit)
* **Expiry Guard** ([`pendle-pt-expiry-guard.ts`](../../src/adapters/pendle/pendle-pt-expiry-guard.ts)): `evaluatePendlePtExpiryRiskFromRegistry`
* Defends PT/YT expiry blackholes and oracle decoupling — **not a Pendle YT competitor**

**2. Pendle AI Guarded Pool Factory** — 5 Invariants via `validateAIPoolSelection()`

* **Adapter SSOT** ([`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts)): sync pre-flight validation for AI agent pool selection at **p50 ~106µs**
* Gates **`PENDLE_CREATE_POOL`** / **`PENDLE_ADD_LIQUIDITY`** intents via optional `pendlePoolFactory` soil probe wired into `checkSoilResistance()`
* **5 Pool Invariants:** maturity ≥7d · yield drift ≤300bps · $100K min initial liquidity · underlying asset whitelist (`eETH` / `ETH` / `USDC`) · supported intent taxonomy
* Demo: [`tests/demo/pendle-ai-agent-flow.demo.test.ts`](../../tests/demo/pendle-ai-agent-flow.demo.test.ts) · [`tests/adapters/pendle-pool-factory.test.ts`](../../tests/adapters/pendle-pool-factory.test.ts)

> **DX & Pricing:** AI Agent pool creation and parameter validation through **Pendle AI Guarded Pool Factory** are **100% free from protocol tax**. Metered SaaS Request Credits launch in **V1.1** (Starter **$10/mo** · Pro **$99/mo** · Business **$299/mo** · Enterprise **$1,999+/mo**).

* **Integration (P0/P1 Code-Verified)**:
  * **Registry SSOT**: [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) · `hydrateFromOracle` · `resolvePendlePtMarketState`
  * **Shared Types**: [`core/pendle-types.ts`](../../src/core/pendle-types.ts)
* **Soil Fuse Wiring (Fail-Closed)**: `pendleOracle`, `pendleCrossGuard`, and `pendlePoolFactory` probes wired into `checkSoilResistance()` (`collectExternalSoilFlags`) — emits **`PENDLE_ORACLE_STALE`** when feed is missing, TTL-expired, or carries invalid fields (zero/negative price, etc.)
* **Performance**: Oracle resolution is **purely cached / synchronous** — no `fetch()` on the hot path; coexists with Shield **p50 ~106µs** budget.
* **Arbitrum One PT Markets (Registry SSOT)**:
  * **PT-eETH:** `0x8B330d3A50a624f1fE1744d037048BdBc9664E5D`
  * **PT-USDC:** `0x156291C6e10E8a1B9f95475A9C0c5E3eCe1d1e44`
* **Mechanism**: Resolves real Pendle PT market parameters from registry (optionally hydrated from oracle), monitors maturity boundaries (&lt;7 days) and yield jitter (&gt;200 bps), integrates dynamic fee curve decay and Shadow Margin cross-guard with Observatory Paradox fix (`close`/`reduce` −40 score discount).
* **Vitest Coverage**:
  * [`tests/adapters/pendle-market-oracle.test.ts`](../../tests/adapters/pendle-market-oracle.test.ts) — oracle hydration · TTL stale · soil `PENDLE_ORACLE_STALE` trip
  * [`tests/adapters/pendle-pool-factory.test.ts`](../../tests/adapters/pendle-pool-factory.test.ts) — AI pool selection · yield drift · maturity cliff · soil fuse
  * [`tests/adapters/pendle-pt-registry.test.ts`](../../tests/adapters/pendle-pt-registry.test.ts) — `resolve*` · `normalize*` · address indexing
  * [`tests/risk-control/pendle-soil-guard.test.ts`](../../tests/risk-control/pendle-soil-guard.test.ts) — `checkSoilResistance()` Pendle fuse integration
  * [`tests/guards/pendle-gmx-cross-guard.test.ts`](../../tests/guards/pendle-gmx-cross-guard.test.ts) · [`tests/adapters/pendle-pt-expiry-guard.test.ts`](../../tests/adapters/pendle-pt-expiry-guard.test.ts)

### 4. GMX

* **Phase A+B+C on-chain invariant stack (@ `572e5cd`):**
  * **Phase A — [`GmxRiskInvariantLib.sol`](../../contracts/src/libs/GmxRiskInvariantLib.sol)** (**83 LOC**): pure Solidity GMX wire invariants (executionFee floor · slippage floor · pool imbalance) — mirrors [`gmx-risk-core.ts`](../../src/core/gmx-risk-core.ts).
  * **Phase B — [`GmxSoilMatrixSwitch.sol`](../../contracts/GmxSoilMatrixSwitch.sol)** (**47 LOC**) + [`DefenseMatrixBitmap.sol`](../../contracts/libs/DefenseMatrixBitmap.sol) (**66 LOC**): defense matrix **single SLOAD** bitmap switch · Forge **8/8**.
  * **Phase C — [`citadel_invariants`](../../contracts/citadel_invariants/)** Rust/Stylus coprocessor: 96-byte packed `evaluate_packed` · GMX errMask + soil flags · host wasm parity via `pnpm build:citadel-invariants` · Cargo **2/2** · Vitest [`stylus-gmx-parity.test.ts`](../../tests/wasm/stylus-gmx-parity.test.ts) **6/6**.
  * **Phase C integration — [`SliverVineAgentPolicyGuardV2.sol`](../../contracts/src/SliverVineAgentPolicyGuardV2.sol)** (**71 LOC**): optional `stylusCoprocessor` staticcall first · revert or `address(0)` → **Solidity fallback** to `GmxRiskInvariantLib` · Forge PolicyGuard **9/9**.
  * **Mainnet deploy (Verified Live · 42161):** [`scripts/deploy-policy-guard-v2-mainnet.ts`](../../scripts/deploy-policy-guard-v2-mainnet.ts) · `SliverVineRiskOracleV2` [`0xfadb1475…`](https://arbiscan.io/address/0xfadb14759a3d3c7e976697de61bf62627f14ec93) · `GmxSoilMatrixSwitch` [`0x4129aee9…`](https://arbiscan.io/address/0x4129aee97e68aa3712c56fe9ec48bf369782f99b) · `PolicyGuardV2` [`0xfd98cadb…`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) · `stylusCoprocessor=0`.
* **Dry-run / Vitest verification (0-Gas pre-flight):** GMX v2 execution guards verified via `pnpm demo` · [`tests/demo/gmx-v2-agent-flow.demo.test.ts`](../../tests/demo/gmx-v2-agent-flow.demo.test.ts) · [`gmx-v2-order-payload-guards.ts`](../../src/services/adapters/gmx-v2-order-payload-guards.ts) — pre-flight severance before live GM pool capital deployment.
* **GM Pool I/O channel (Verified Live · 42161):** **CLOSED** — Wallet B ETH/USDC GM deposit + withdraw ExchangeRouter multicall paths broadcast on Arbitrum One:
  * **Deposit multicall:** [`0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) · Block **503036082** · `pnpm execute:gmx:gm-deposit`
  * **GM LP → GMX v2 Router approve:** [`0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e`](https://arbiscan.io/tx/0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e) · Block **503051738** · spender `0x7452c558…`
  * **Withdraw multicall:** [`0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410`](https://arbiscan.io/tx/0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410) · Block **503051752** · `pnpm execute:gmx:gm-withdraw`
* **Mainnet micro-fill harness:** `pnpm execute:gmx:micro-fill --size=1` — calibrated **$1–$20** GMX v2 increase order via PolicyGuardV2 `0xfd98cadb…` + Gate `0xb174…` · **automatic low-OI side calibration** (balanced market leg) · Live: `CONFIRM_GMX_MICRO_FILL=YES BROADCAST=1 MAINNET_PK=0x… ZERODEV_PROJECT_ID=…` · [`scripts/execute-gmx-mainnet-micro-fill.ts`](../../scripts/execute-gmx-mainnet-micro-fill.ts)
* **Mainnet micro-fill Fail-Closed evidence (Live Interception Payload):** `pnpm execute:gmx:micro-fill --size=1` on Arbitrum One (`42161`) — harness intelligently selected **`"short"`** side to balance GM pool (**$71 Long** vs **$58 Short**) · Soil Resistance + Root Protection **successfully intercepted** execution: `DEPTH_USD = $129 < $100,000` min requirement · `GUARD_BLOCKED:ORACLE_LAG_DEADLOCK:154000ms>30000ms` (**154s** stale oracle) · **`lostUsd ≡ 0`** · **0 slippage loss** · no mempool exposure
* **Stylus mainnet (verified):** `SliverVineSoilCoprocessor` **`0xc23587d6573dd134f95b02b0202ffbf84686625e`** · activation tx [`0x92079e15…`](https://arbiscan.io/tx/0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397) · Nitro Prover JIT + **ArbWasm `0x71`** · `pnpm deploy:stylus:mainnet` · [`scripts/deploy-stylus-mainnet.ts`](../../scripts/deploy-stylus-mainnet.ts)
* **Integration**: `evaluatePendleGmxCrossGuard` (`src/guards/pendle-gmx-cross-guard.ts`) & GMX Order Payload Guard (`src/services/adapters/gmx-v2-order-payload-guards.ts`).
* **Mechanism**: Implements Shadow Margin accounting. Evaluates whether swapping out PT collateral under dynamic fees threatens GMX Maintenance Margin. Builder fee SSOT: **`GMX_UI_FEE_BPS` = 10** (`src/config/gmx-revenue.ts`); payload price-impact gate uses **`DEFAULT_GMX_PENALTY_BPS` = 50** (`src/services/yield/gmx-v2-price-impact.ts`).

### 5. Dune Analytics

> **Telemetry boundary partition (zero misleading claims):** Sepolia and Arbitrum One are **explicitly separated** — live streaming vs. contracts-anchored SQL specs.

| Network | ChainID | Status | What is claimed |
|---------|---------|--------|-----------------|
| **Arbitrum Sepolia** | `421614` | ✅ **Active Live Event Pipeline** | Dune ingests decoded `IntentAttested` · `RiskTripBlocked` from Sepolia Gate `0xb174…` — **only** Sepolia claimed as live stream |
| **Arbitrum One** | `42161` | ✅ **Contracts Anchored** + **SQL Query Specs Ready for Ingest** | Production DuneSQL (Queries 0–0b + 1–3) pre-compiled for **42161** semantics · **not** claimed as live mainnet event stream until ingest is wired |

> **Governance footnote (re-confirmed):** Bootstrap Ignition Keys (`0x1111…` / `0x2222…`) are **strictly for public verification and sandbox reproducibility** — not production HSM custody. Post-launch rotation to production multisig via `proposeAdmin` / `acceptAdmin` is the designed authority path.

* **Live Dashboard:** [Dune Telemetry (Sepolia Live Verification & Production SQL Spec)](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)
* **Sepolia event streaming (verified):** Dune engine ingests **decoded events** from Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` (`IntentAttested` · `RiskTripBlocked`) — **only** Sepolia is claimed as active live stream.
* **Arbitrum One production SQL (`42161`):** Matching production DuneSQL queries (Queries 0–0b feed + chart; Queries 1–3 reconciliation panels) target **Arbitrum One mainnet** contract semantics — **SQL specs ready for ingest**; mainnet Gate business-event stream is a post-ingest milestone — [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md).
* **Live Telemetry Feed (Query 0):** `arbitrum.blocks` 12h window · Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · `RiskTripBlocked` / `IntentAttested` / heartbeat status.
* **Telemetry Activity Chart (Query 0b):** 1h minute-bucket toxic-flow distribution (`BLOCKED` / `PASS` / `HEARTBEAT`).
* **Integration**: [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) · Live `/api/grant-audit` `duneTelemetry` JSON.
* **Mechanism**: Production DuneSQL feed + chart (Queries 0–0b) plus reconciliation panels (Queries 1–3) — Toxic Flow Blocked · Observatory Paradox Bypasses · PT Expiry × GMX Margin Health — reconciled against `duneTelemetry.responseRef` sha256 provenance.

### Execution Speed & Protocol-Agnostic Resilience (HL Delta Pool)

Hyperliquid — an **Independent L1 High-Frequency Orderbook AppChain** that originated alongside Arbitrum's perp liquidity ecosystem — Session Key Adapter and TCA provenance (`src/data/verified-5tx-lib/verified-5tx-provenance.ts`) are framed as **cross-venue Δ-neutral execution speed proofs** (GMX v2 ETH/USDC GM + HL 1× short), complementing (not competing with) the Shield pre-execution narrative. SSOT: `src/adapters/hl/hyperliquid-session-guard.ts` · `src/adapters/hl/execution-wire.ts` · `src/adapters/hl/session-key-executor.ts`.

---

## Core Risk Decision Matrix (`evaluatePendleGmxCrossGuard`)

| Intent Direction (Code Mapping) | Trigger Condition | Reflector Action | Strategic Purpose |
| :--- | :--- | :--- | :--- |
| `close` / `reduce` (`RISK_DECREASE`) | Any Market State | `EMERGENCY_DELEVERAGE_ALLOWED` | **Fixes Observatory Paradox**: Applies -40 risk score discount; always greenlights risk reduction to prevent forced liquidation on GMX. |
| `open` / `increase` (`RISK_INCREASE`) | Raw Risk Score &gt; 75 OR Shadow Margin &lt; 0 | `FAIL_CLOSED_BLOCK` | **0-Gas Defense**: Blocks toxic/hallucinated leverage before mempool ingress. |
| `open` / `increase` (`RISK_INCREASE`) | Raw Risk Score ≤ 75 AND Shadow Margin ≥ 0 | `PASS_GREENLIGHT` | Eligible for downstream EIP-712 attestation pipeline (`SliverVineGate.sol`). |

**Demo tests:** [`tests/guards/pendle-gmx-cross-guard.test.ts`](../../tests/guards/pendle-gmx-cross-guard.test.ts) · [`tests/adapters/pendle-pt-expiry-guard.test.ts`](../../tests/adapters/pendle-pt-expiry-guard.test.ts) · [`tests/adapters/pendle-market-oracle.test.ts`](../../tests/adapters/pendle-market-oracle.test.ts) · [`tests/adapters/pendle-pt-registry.test.ts`](../../tests/adapters/pendle-pt-registry.test.ts) · [`tests/risk-control/pendle-soil-guard.test.ts`](../../tests/risk-control/pendle-soil-guard.test.ts).

---

## Three-Pillar Architecture (Submission SSOT)

| Pillar | Role | SSOT |
|--------|------|------|
| **Gatehouse (Auth)** | **Opt-In Pillar 1** ZeroDev scoped session keys · Kernel v3 · R06 / R07 · `USE_ZERODEV_AA` default-off | `zerodev-aa-*` · Gate attestation · [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) |
| **Pillar 2: Compliance Ingress Firewall** | Venue-agnostic unidirectional AML escort · Robinhood Chain RWA ingress (`46630`/`4663` → `42161`) · **`lostUsd ≡ 0`** · inbound AML block · **ArbOS 61 Elara** reinforcement plane | `src/adapters/across-ingress-bridge.ts` · `contracts/IngressSafetySwitch.sol` |
| **Shield (CORE MOAT)** | Sub-ms Wasm pre-execution armor · **p50 ~106 µs** · Wasm **<28kb / <60µs** · fail-closed before mempool · **auto `severSigningChannel()` on bitmask trips** · **Stylus 96KB coprocessor ready** (`SliverVineSoilCoprocessor` · 9/9 PASS) · **independent of ZeroDev** | `checkSoilResistance()` · `soil_core.wasm` · `check_soil_resistance_stylus` |

### Competitive Positioning — Four-Dimensional ASCII Matrices (SliverVine Protocol)

**Entity:** SilverVine Labs · **Protocol:** SliverVine Protocol / SliverVine Citadel (BeΔ)  
**[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196):** Finalized ERC-8196 Standard — Ethereum Standard.

**Matrix 1 — Execution & Pre-Broadcast Severance Profile**

```text
┌───────────────────────────┬─────────────────────────────┬────────────────────────────┬────────────────────────────┐
│ Dimension                 │ SliverVine Citadel (BeΔ)   │ Legacy ERC-4337 / OZ       │ Gauntlet / Chaos Labs      │
├───────────────────────────┼─────────────────────────────┼────────────────────────────┼────────────────────────────┤
│ 1. Latency Profile        │ p50 ~106µs (Sub-ms Edge)   │ 50ms – 500ms+ (Bundler RTT)│ Hours to Days (Parameter) │
│ 2. Pre-Broadcast Severance│ YES (0-Gas Fail-Closed)     │ NO (Post-validation/mempool│ NO (Post-execution audit) │
│ 3. Gas Overhead           │ 0 Gas (Edge Rejection)      │ Wasted Bundler Gas         │ On-chain Governance Gas    │
│ 4. Invariant Enforcement  │ Δnet ≡ 0 & lostUsd ≡ 0      │ Basic Balance Checks       │ Dynamic Risk Parameters    │
└───────────────────────────┴─────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

**Matrix 2 — AI Agent Wallet Policy & Execution Citadel**

```text
┌───────────────────────────┬─────────────────────────────┬────────────────────────────┬────────────────────────────┐
│ Dimension                 │ SliverVine Citadel (BeΔ)   │ Multisig / Timelock        │ Web2 LLM Guardrails        │
├───────────────────────────┼─────────────────────────────┼────────────────────────────┼────────────────────────────┤
│ 1. Policy Gate Layer      │ ERC-8196 (Final) Sub-ms Policy Gate│ On-chain Voting / Delay    │ API Proxy (Centralized)    │
│ 2. Prompt Injection Guard │ R20 Physical Deadlock       │ Vulnerable to Signed Intent│ Bypassable via Jailbreak   │
│ 3. Key Pipe Severing      │ <1ms `severSigningChannel`  │ N/A (Requires On-chain Tx) │ N/A (No On-chain Hook)     │
│ 4. Standard Alignment     │ ERC-8196 (Final) Sub-ms Policy Gate · EIP-7562 │ Standard ERC-20 / ERC-721  │ Proprietary REST APIs      │
└───────────────────────────┴─────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

**Matrix 3 — Cross-Venue Liquidation & Ingress Escort Paradigm**

```text
┌───────────────────────────┬─────────────────────────────┬────────────────────────────┬────────────────────────────┐
│ Dimension                 │ SliverVine Citadel (BeΔ)   │ Native DEX Limit Orders    │ Raw Cross-Chain Bridges    │
├───────────────────────────┼─────────────────────────────┼────────────────────────────┼────────────────────────────┤
│ 1. Cross-Spread Sensing   │ Live GMX/HL Soil Resistance │ Static Slippage Tolerance  │ Blind Asset Relaying       │
│ 2. Liquidation Defense    │ -40 Haircut (Observatory)   │ Cascading Liquidation Risk │ No Execution Awareness     │
│ 3. Ingress Accounting     │ `lostUsd ≡ 0` Escort Label  │ Immediate Capital Loss     │ Phantom In-flight Balances│
│ 4. AML Shielding          │ Blocked Reverse Path (46630)│ Open Protocol Ingress      │ Unfiltered Contamination   │
└───────────────────────────┴─────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

---

## Business Model & GTM Strategy

> **Pricing model boundary:** **v1.0 = Public Open Gateway** (`X-Citadel-Tier: public` · `X-Citadel-RPS-Limit: 5`) for Buildathon evaluation. **V1.1 = 4-Tier SaaS** ($10 / $99 / $299 / $1,999+) with KV API Key metering (Milestone 1 post-grant). **V2.0 = Institutional CaaS & Orbit Shield** (`@slivervine/citadel-sdk`) — do not conflate with v1.0 gateway or GMX +10 bps `uiFeeReceiver`.

SliverVine rejects unrealistic B2B sales models (e.g. charging DAOs $8k/mo upfront) and adopts an **Infra-First, Multi-Tiered Monetization Engine**:

1. **V1.0 Public Open Gateway (Current — Submission Baseline)**:
 * **No paid API key required** for hackathon / judge evaluation.
 * Lightweight Edge RPS rate limiter (header/IP-based) protects memory queues against Sybil DoS.
 * Gateway responses include `X-Citadel-Tier: public` and `X-Citadel-RPS-Limit: 5`.

2. **V1.1 Cloudflare-Style SaaS Subscription (Milestone 1 Post-Grant — $10 / $99 / $299 / $1,999+)**:
 * Cloudflare KV API Key metering + multi-tenant rate limiter.
 * Gateway responses include `X-Citadel-Tier` (`starter` | `pro` | `business` | `enterprise`) and `X-Citadel-RPS-Limit` (`5` | `50` | `200` | `1000`).

| Tier | Monthly | Annual (billed yearly) | RPS | Intents / mo | Entitlements |
|------|---------|------------------------|-----|--------------|--------------|
| **Starter Shield** | **$10** | **$96/yr** | **5** | **100k** | B2B anti-Sybil entry barrier |
| **Pro Guard** | **$99** | **$950/yr** | **50** | **5M** | WASM closed kernel · R17 daily loss prevention |
| **Business Citadel** | **$299** | **$2,870/yr** | **200** | **20M** | Priority memory queue · R20 auto-severance · tenant isolation |
| **Enterprise Dedicated** | **$1,999+** | Custom contract | **1,000+** | Custom | Dedicated Cloudflare Edge nodes · custom Rust/WASM risk modules · private MEV routing |

3. **Pay-per-Intent Micro-Attestation Fee (Adjunct)**:
 * AI Agents and Vault Operators connect via SliverVine's Secure RPC Gateway (`@slivervine/citadel-sdk`).
 * Charged $0.01 – $0.05 per signed attestation, deducting micro-fees automatically without requiring credit card friction.
4. **Telemetry & Risk Data API (Data Engine)**:
 * Access to real-time Yield Convexity and Liquidity Void feeds via WebSocket/REST for hedge funds and quant vaults ($199–$1,999/month).
5. **Edge Execution Alliance (Partnership Model)**:
 * Acts as the **Sub-ms Intent Execution Edge** for macro risk engines (e.g., Chaos Labs, Gauntlet). Chaos Labs provides macro parameter tuning; SliverVine enforces microsecond off-chain intent protection.

**GMX builder lane (adjacent):** +10 bps `uiFeeReceiver` on unsigned GMX v2 payloads — see [`gmx/GMX_BUILDERS_PITCH.md`](../grants/gmx/GMX_BUILDERS_PITCH.md).

---

## 🛣️ Post-Buildathon B2B Commercialization & PMF Roadmap (Post-9/14)

SliverVine Protocol enforces a strict two-stage strategy balancing Zero-Friction Hackathon Verification with Long-Term Commercial Sustainability:

- **Stage 1: Buildathon Verification Phase (Active Now — Pre-9/14)**
  - **Public Dune Telemetry Dashboard** (read-only, no API key): Open-access Dune Live Telemetry Dashboard ([https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)) for judge and developer auditing — distinct from paid Edge API tiers.
  - **Sepolia Safety Gate**: Full EIP-712 session key validation and 0-Gas Fail-Closed protection verified on Arbitrum Sepolia (`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`).

- **Stage 2: B2B Monetization & Risk API Launch (Post-9/14 — V1.1)**
  - **SliverVine Citadel Risk API & Bad Debt Calculator (powered by on-chain telemetry & Dune Analytics visualization)**: Monetize SliverVine's proprietary sub-ms risk calculation algorithms and shadow margin telemetry via a B2B API — **not** Dune platform data resale. [Dune](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) remains the **public read-only visualization dashboard**; **V1.1** paid Edge API tiers (**Starter $10/mo** · **Pro $99/mo** · **Business $299/mo** · **Enterprise $1,999+/mo**) gate programmatic access to Citadel-computed liquidation risk, margin health, and bad-debt savings metrics for vault managers and AI Agent swarms (Wayfinder, Virtuals, M2M Treasury Funds).
  - **V2.0 CaaS rail (Design Spec — not v1.0):** `@slivervine/citadel-sdk` modular Wasm SDK · pre-execution risk checks · ZeroDev Stage ⑦ Intent Composition (2PC ledger). **v1.0 operates as public open gateway**; v1.0 GMX **+10 bps `uiFeeReceiver`** remains the live builder lane.

---

## Post-Hackathon Expansion Roadmap

* **Milestone 1 (Weeks 2–3 post-grant approval): Native Upstream Plugin PRs**
 * Submit official native plugin Pull Requests (PRs) to **ElizaOS** (`@elizaos/plugin-citadel`) and **Virtuals GAME** (`@virtuals/plugin-citadel`) monorepos, transitioning from the current zero-overhead SDK Wrapper decorator (`withCitadelShield`) to official upstream integration.
* **Phase 1: Milestone Dune & PoV (Day 7 – 30)**
 * Deploy live Dune Analytics dashboards and onboarding 3 design partners (AI Agent creators on Virtuals/ElizaOS and GMX Vault Managers) for $0-fee Proof-of-Value testing.
* **Phase 2: Milestone Prediction (Design Spec / Post-Hackathon Roadmap)**
 * Expand off-chain Event-Driven Risk Adapters (`polymarket-event-guard` spec) to protect AI trading agents in prediction markets (Polymarket / Azuro) during breaking news liquidity voids.
* **Phase 3: Milestone Citadel (Day 60 – 90)**
 * Institutional rollout of TEE-enclosed (SGX/Automata) Reflector nodes and Secure RPC Gateway across Arbitrum Orbit chains.

---

## Granular Milestone Matrix (Buildathon · Grant-Tied Distribution)

| ID | Unlock condition (objective) | Sponsor / track | Status |
|----|------------------------------|-----------------|--------|
| **M-Sepolia** | Sepolia Gate + RiskOracle + IngressSafetySwitch verified · `sepoliaDualLegProof` in `/api/grant-audit` | Arbitrum | ✅ Delivered |
| **M-CLI** | Vitest **217 test files | 967 PASS clean** | All | ✅ Delivered |
| **M-RH-Demo** | `4663` → `42161` outbound Smart Route **Verified Live** · UserOp `0x7b72ee9f…` · Tx [`0x4c4ca136…`](https://arbiscan.io/tx/0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a) · inbound AML blocked · `lostUsd ≡ 0` | Robinhood Chain | ✅ Live-verified |
| **M-GMX-Fee** | Unsigned GMX v2 payload injects **10 bps** `uiFeeReceiver` | GMX | ✅ Injected · ⏳ `claimUiFees` |
| **M-Dune** | Publish Dune dashboard per [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) | Dune | ✅ [Live dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) |
| **M6-Mainnet** | Arbitrum One Gate ignition on `42161` · Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Tx `0x54c153…b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) | Arbitrum · Grant | ✅ Delivered |
| **M1-Native-PR** | **Milestone 1 (Weeks 2–3 post-grant):** Official upstream PRs to ElizaOS (`@elizaos/plugin-citadel`) + Virtuals GAME (`@virtuals/plugin-citadel`) — graduate from `withCitadelShield` SDK wrapper to native monorepo plugins | ElizaOS · Virtuals | ⏳ Post-grant Weeks 2–3 |

---

## On-Chain Verification — Arbitrum One (42161)

| Contract | Role | Verified Address (Mainnet) | Proof |
|----------|------|----------------------------|-------|
| `SliverVineGate` | Consume-once EIP-712 attestation anchor | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | Mainnet Ignition Tx [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · [`DeployArbitrumOneGate.s.sol`](../../SliverVineGate/script/DeployArbitrumOneGate.s.sol) |

> **Governance footnote (Bootstrap Ignition Keys):** Mainnet Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` deploys with **Bootstrap Ignition Keys** (`0x1111…` / `0x2222…`) — **strictly for public verification and sandbox reproducibility**, not production HSM custody. Governance authority is designed for **post-launch rotation** to production multisig via native `proposeAdmin` / `acceptAdmin` functions.

> **0-Gas Off-Chain Severance architecture:** Arbitrum One Gate (`0xb174…`) **is engineered for 0-Gas Pre-Execution Off-Chain Severance**. Citadel Risk Gates halt compromised payload signatures at the Edge **prior to mempool submission**, preserving **Arbitrum L2 state space cleanliness** — toxic paths never consume Sequencer gas; on-chain Gate anchors consume-once attestations only for cleared intents.

### [MAINNET_LIVE_EXECUTION_EVIDENCE]

> **Harness:** `pnpm deploy:stylus:mainnet` · `pnpm execute:gmx:micro-fill --size=1` · `pnpm tsx scripts/deploy-policy-guard-and-live-fill.ts` · ZeroDev AA: `pnpm tsx scripts/execute-zerodev-mainnet-test.ts` · Smart Route: `pnpm tsx scripts/execute-smart-route-live-demo.ts` · Live: `CONFIRM_SMART_ROUTE_DEMO=YES BROADCAST=1` · Default ingress: Robinhood Mainnet `4663` (`SMART_ROUTE_SOURCE_CHAIN_ID` override supported)

| Field | Value |
|-------|-------|
| **PolicyGuardV2 (current · Phase A+B+C)** | [`0xfd98cadb7018f692ec58cd4359e0c0399f4f8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) · Deploy [`0xcd520602…`](https://arbiscan.io/tx/0xcd520602a277c0781038552d5692f5ad43076a8928f5e7384e695642f980306a) |
| **Gate PolicyLink (bootstrap Gate binding)** | [`0xe4ef5350963241c49a29e72a4cf093208cd19af0`](https://arbiscan.io/address/0xe4ef5350963241c49a29e72a4cf093208cd19af0) · setPolicyGuard [`0x1b158a4a…`](https://arbiscan.io/tx/0x1b158a4a40409e39215b76b5b12693c2802b49b190ecc0be97c986f167b9a182) · Deploy [`0x7ce414b7…`](https://arbiscan.io/tx/0x7ce414b737c6efed4068034dadebd9f017e1e6eb832aba64e3ba656ac0380ad9) |
| **GmxSoilMatrixSwitch** | [`0x4129aee97e68aa3712c56fe9ec48bf369782f99b`](https://arbiscan.io/address/0x4129aee97e68aa3712c56fe9ec48bf369782f99b) · oracle [`0xfadb1475…`](https://arbiscan.io/address/0xfadb14759a3d3c7e976697de61bf62627f14ec93) |
| **SliverVineRiskOracleV2** | [`0xfadb14759a3d3c7e976697de61bf62627f14ec93`](https://arbiscan.io/address/0xfadb14759a3d3c7e976697de61bf62627f14ec93) |
| **PolicyGuard v1 (superseded)** | [`0xc66f96611a737c4e58706d0955594456eab88959`](https://arbiscan.io/address/0xc66f96611a737c4e58706d0955594456eab88959) · Deploy [`0xeabd5fd1…`](https://arbiscan.io/tx/0xeabd5fd17f1e8684c3408887a233a8ac26220199781b401336233a3072fb4b0c) |
| **PolicyGuard (legacy v0)** | [`0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b`](https://arbiscan.io/address/0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b) · Deploy [`0x77fd8e1c…`](https://arbiscan.io/tx/0x77fd8e1c702ca19e9fa0621a1f6b0e8de6701f389d062cc3427e3d8d3d1e74fa) |
| **ZeroDev Kernel v3 AA Proof Tx** | `0xc7659e299e4961279f03b9cafa988dc082d7f9baf107bcd7b62812e8dfb54aad` · [Arbiscan](https://arbiscan.io/tx/0xc7659e299e4961279f03b9cafa988dc082d7f9baf107bcd7b62812e8dfb54aad) |
| **Smart Route Source Chain** | Robinhood Mainnet (`4663`) |
| **Smart Route Target Chain** | Arbitrum One (`42161`) |
| **ZeroDev Kernel v3 Smart Route UserOp Hash** | `0x7b72ee9f4dc3f32f08a5de914ecf076c243d895522ecd72d17a2f7b025bc956d` |
| **ZeroDev Kernel v3 Smart Route UserOp Tx** | `0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a` · [Arbiscan](https://arbiscan.io/tx/0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a) |
| **Chain** | Arbitrum One (`42161`) |
| **Status** | **Verified Live** on Arbitrum One (42161) with **Fail-Closed Risk Protection** active |
| **GMX Micro-Fill Live Attempt (`--size=1`)** | **Fail-Closed** — balanced side **`"short"`** ($71 Long vs $58 Short) · `DEPTH_USD=$129<$100k` · `ORACLE_LAG_DEADLOCK:154000ms>30000ms` · Soil Resistance + Root Protection intercepted pre-mempool · **`lostUsd ≡ 0`** · 0 slippage loss |
| **GMX Fill Live Attempt (prior)** | **Fail-Closed** — pre-broadcast trip `GMX_POOL_IMBALANCE_BREACH` · no toxic fill submitted · live invariant shield **confirmed active** |
| **Notional (USD)** | `$1–$20` (CLI `--size`; default **$1** micro-fill) |
| **Stylus Build Proof** | `cargo test stylus_core` **5/5 PASS** · `wasm32-unknown-unknown` release build verified · Wasm ABI v2 **28-slot** ↔ [`wasm-soil-ffi.ts`](../../src/core/wasm-soil-ffi.ts) |

---

## On-Chain Verification — Arbitrum Sepolia (421614)

| Contract | Role | Verified Address (Sepolia) | Source |
|----------|------|----------------------------|--------|
| **Deployer / Admin / Signer** | OpSec-isolated Forge broadcast signer | `0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F` | [`scripts/deploy-sepolia-gate.sol`](../../scripts/deploy-sepolia-gate.sol) |
| `SliverVineGate` | Consume-once EIP-712 attestation anchor | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | [`SliverVineGate/src/SliverVineGate.sol`](../../SliverVineGate/src/SliverVineGate.sol) |
| `SliverVineRiskOracle` | EIP-712 offline risk report · `STATUS_SHUTDOWN` flush | `0x3FFa2539f502682E8145e6Eb427ff78d258D53a4` | [`contracts/SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol) |
| `IngressSafetySwitch` | Pillar Set X compliance filter | `0x3E4298e2b8d4e30396A54C1817Eb71c9272Ffb4B` | [`contracts/IngressSafetySwitch.sol`](../../contracts/IngressSafetySwitch.sol) |
| `SliverVineSoilCoprocessor` (Stylus) | On-chain `soil_core` coprocessor · ArbOS 61 **96KB** Wasm expansion ready · `check_soil_resistance_stylus` dual-execution | **Code-Verified** (Cargo 9/9 · Stylus SDK **0.10.7** · `pnpm build:stylus` · EIP-1967 proxy path) | [`contracts/stylus-probe/src/lib.rs`](../../contracts/stylus-probe/src/lib.rs) |

---

## Verification (60s)

```bash
pnpm install
pnpm demo:gmx     # Tier 1 — GMX v2 shadow margin (ALLOW)
pnpm demo:hl      # Tier 1 — Hyperliquid session key (ALLOW)
pnpm demo:pendle  # Tier 1 — Pendle guarded pool factory (ALLOW)
pnpm demo:uniswap # Tier 1 — Uniswap V3 spot liquidity (ALLOW)
pnpm demo:aave # Tier 1 — Aave V3 HF guard (ALLOW)
pnpm demo:morpho   # Tier 1 — Morpho Blue vault guard (ALLOW)
pnpm demo       # Vitest Dual Pillar Set X & Y matrix (12 scenarios)
pnpm demo:e2e   # Tier 3 — 4-Step Happy Path Macro Lifecycle CLI (--unwind · --trip optional)
pnpm demo:wayfinder              # Tier 2 — Wayfinder route interception (ALLOW)
pnpm demo:wayfinder -- --trip    # 0-Gas Fail-Closed soil trip
pnpm test       # Full System Regression Suite (217 test files | 967 PASS clean)
pnpm run audit:security # 3-Tier Security Matrix: 5/0/0 PASS (Vitest, Forge, Slither, Aderyn, pnpm-audit)
cd SliverVineGate && forge test --gas-report && cd ..
curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .sepoliaDualLegProof
```

**Dual Pillar Set X & Y micro demo** (`pnpm demo` — `tests/demo/`):

| File | Venue | Scenarios |
|------|-------|-----------|
| `gmx-v2-agent-flow.demo.test.ts` | GMX v2 | Healthy payload · toxic price impact · oracle-lag + `reduceOnly` rescue · 1,000× benchmark |
| `hyperliquid-agent-flow.demo.test.ts` | Hyperliquid | Valid session key · WS stale/latency fuse · GateLockout · 1,000× benchmark |
| `pendle-ai-agent-flow.demo.test.ts` | Pendle | AI pool PASS · yield-drift reject · stale oracle · 1,000× benchmark |

**Grant E2E macro demo highlights** (`pnpm demo:e2e` — default **4-step Happy Path**; GitHub `diff` syntax):

```diff
+ ── Step 1: Citadel Pre-Execution Check ──
+ Intent: allowedToSign=true · elapsed=106µs · Invariant: Δnet ≡ 0
+ ── Step 2: Robinhood Escort ──
+ Outbound: lostUsd=0 · RESULT: Escort PASS · lostUsd ≡ 0
- Inbound AML block: AML_INBOUND_TO_ROBINHOOD_BLOCKED
! GMX Payload: uiFeeReceiver (+10 bps) injected
+ Step 4: Margin Anchor · $100 HL margin backs $1,200 notional short · Δnet ≡ 0
+ RESULT: E2E OK (4/4)
```

**Optional `--unwind` (Step 5 Citadel Shield exercise):**

```diff
- ALERT: SOIL_TRIPPED — toxic depth fuse
- [CRITICAL] PHYSICAL_DEADLOCK_TRIGGERED: EIP-712 Signature Pipe Severed
+ Treasury State: Protocol Treasury retains +$2.40 (uiFeeReceiver share)
+ Flash unwind: PASS · RESULT: E2E OK (5/5)
```

**Regression bar:** Vitest **217 test files | 967 PASS clean** · **3-Tier Security Matrix: 5/0/0 PASS (Vitest, Forge, Slither, Aderyn, pnpm-audit)** · Forge 60/60 · Cargo Stylus 9/9 · Worker bundle **50.94 KiB gzip** (`pnpm bundle:measure` · pass &lt;75 KiB) · Wasm **<28kb Cloudflare budget, <60µs execution** · Shield **p50 ~106µs**.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [`../../JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md) | 1-page executive brief for Buildathon evaluators |
| [`../../README.md`](../../README.md) | English SSOT landing page |
| [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) | CLI Tier 0–5 verification hub |
| [`../PRODUCTION_WORKFLOW_DEEP_DIVE.md`](../PRODUCTION_WORKFLOW_DEEP_DIVE.md) | Dual-wallet production workflow SSOT |
| [`../architecture/README.md`](../architecture/README.md) | R01–R20 Defense Matrix · latency benchmarks |
| [`../telemetry/DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) | Production DuneSQL feed + activity chart (Queries 0–0b) + 3 reconciliation panels · [live dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) |
| [`../grants/arbitrum/ARBITRUM_ONE_PAGER.md`](../grants/arbitrum/ARBITRUM_ONE_PAGER.md) | One-pager |
| [`../grants/arbitrum/GRANT_PROPOSAL.md`](../grants/arbitrum/GRANT_PROPOSAL.md) | Scope & roadmap |
| [`../grants/gmx/GMX_BUILDERS_PITCH.md`](../grants/gmx/GMX_BUILDERS_PITCH.md) | GMX builder economics |
| [`../pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md`](../pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md) | 180s Pitch + 120s Demo dual-video scripts |
| [§ Threat Model Appendix](#appendix-real-world-threat-model-market-landscape) | Agentic web metrics · case studies · competitive matrix |

---

## Appendix: Real-World Threat Model & Market Landscape

### Market Adoption Metrics (The Agentic Web Shift)

The Web3 attack surface is shifting from human UI phishing to **autonomous agent execution pipelines**. Industry telemetry indicates the agentic web is already material on-chain:

| Metric | Estimate |
|--------|----------|
| **AI agents deployed** | **17,000+** autonomous on-chain agents |
| **Share of on-chain transactions** | **~19%** agent-attributed activity |
| **Daily Active Wallets (DAW) touchpoints** | **~4.5M** wallets interacting with agent frameworks |

**Implication:** Security must evolve from post-hoc dashboards and mutable pause functions to **microsecond Pre-Broadcast Intent Firewalls** — severing toxic calldata **before** Sequencer queues, Bundler ingress, or MEV mempools. Citadel Shield targets this gap at **p50 ~106µs** Edge Wasm evaluation.

### Real-World Case Studies (Why Citadel Shield is Essential)

| # | Case | Loss / Impact | Citadel Alignment |
|---|------|---------------|-------------------|
| **1** | **Jaredfromsubway.eth $7.5M Exploit (MEV Honeypot Trap)** | Automated signature logic exploited via malicious permission / honeypot traps | Validates **sub-ms Wasm pre-broadcast** `checkSoilResistance()` + honeypot RPC defense — signatures never reach toxic mempool paths |
| **2** | **Virtuals Protocol $500k Unbound Agent Drain** | Unbound agent execution exceeded safe notional envelopes | Validates **R06/R07** session-key blast-radius isolation · **`SESSION_KEY_NOTIONAL_CAP_USD = $5,000`** · scoped `ORDER_EXECUTE` |
| **3** | **ElizaOS / ai16z Fraud & Governance Collapse** | SDNY class-action litigation — raw Node.js prompt wrappers lacked on-chain execution guarantees | Validates **non-semantic bytecode predicate assertions** · EIP-712 consume-once Gate · **LLM back-off cooldown** — prompt layer compromise ≠ signing-layer authorization |

### Competitive Landscape Matrix

| Dimension | **SliverVine V1.0 (88% Baseline)** | **Wayfinder** | **Virtuals Protocol** | **ElizaOS Framework** | **ZeroDev / Biconomy (ERC-4337 AA)** |
|-----------|-----------------------------------|---------------|-------------------------|----------------------|--------------------------------------|
| **Pre-broadcast severance** | ✅ Sub-ms Wasm soil fuse (p50 ~106µs) · 0-Gas fail-closed | ✅ **V1.0 Live** via Citadel `wayfinderCitadelShieldHook` on Arbitrum `42161` | ❌ Web2.5 agent layer; wallets exposed without pre-execution bounds | ❌ No native pre-broadcast risk gates | ❌ Session keys only; **no** AI-context fuse |
| **On-chain immutability** | ✅ 0-proxy `SliverVineGate` · `consumed[digest]` | Varies by deployment | Consumer UX focus | Open-source plugins | Strong AA infra |
| **AI behavioral safety** | ✅ 60s LLM cooldown · ±2–5 bps jitter | Limited | Limited | Prompt-only guardrails | N/A |
| **Session blast-radius** | ✅ $5k notional cap · scoped modules | Varies | High adoption; **unbound drain risk** | Framework-dependent | ✅ ERC-4337 session scopes |
| **Prompt injection immunity** | ✅ Bytecode predicates · not NL prompts | Partial | Partial | **Vulnerable** at execution hook | **Vulnerable** — signs whatever UserOp encodes |

### Supplementary Industry References

- **MEV & thin-liquidity on autonomous agents** — `checkSoilResistance()` · `evaluateHlOrderbookGapGuard()`
- **$441k+ bot execution error** — [PumpParade / Medium](https://pumpparade.medium.com/ai-trading-bots-lost-441k-in-one-error-heres-what-actually-works-and-what-doesn-t-4f04f890c189)
- **AI antivirus primitives** — [CertiK AI Skill Scanner](https://www.tradingview.com/news/chainwire:d064d7d1f094b:0-certik-launches-ai-skill-scanner-an-antivirus-software-for-the-ai-age/)
- **Institutional agent-security focus** — [CryptoRank: AI Agents & Web3 Hacking Symposium](https://cryptorank.io/news/feed/fae5e-ai-agents-web3-hacking-wyoming-symposium)

---

**SliverVine Protocol** — *The Risk Operating System for AI-Driven DeFi.*
