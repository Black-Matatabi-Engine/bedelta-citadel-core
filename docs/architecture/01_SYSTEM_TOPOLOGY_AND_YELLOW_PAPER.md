# SliverVine Citadel Shield — System Topology & Yellow Paper

> **Document:** System topology · BeΔ philosophy · GMX/HL triangle loop · settlement bounds · **Vitest SSOT:** **222 test files | 1044 PASS clean** · Security-tier `5/0/0 PASS` · **Wasm Core:** ABI **v2** · 28-protocol-slot FFI · `<28kb` Cloudflare budget · `<60µs` warm execution · **p50 ~106 µs**
> **Architecture index:** [`README.md`](./README.md) · **Hybrid Pillar Sets X & Y:** [`02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) · **Defense Matrix:** [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md) · **Standards:** [`04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md) · **Risk framework:** [`05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md)

**Philosophy — BeΔ (BeDelta Living Water v1.0):** **Be** is inspired by Bruce Lee's *"Be Water, My Friend"* — fluid, adaptive intent routing and friction-free multi-chain execution. **Δ (Delta)** denotes **market delta-neutrality** and risk-neutral execution — neutralizing directional exposure. **SliverVine** = fragmented intent protection & steel trading execution · **SliverVine Citadel Shield** = the pre-consensus execution safety primitive.  
**Entity:** SilverVine Labs · **Protocol brand:** SliverVine Citadel Shield  
**Live proof:** `GET /api/grant-audit` · [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz)  
**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)

### Core On-Chain & Deployment Anchors

| Anchor | Chain ID | Value |
|--------|----------|-------|
| **SliverVineGate (Arbitrum One)** | `42161` | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Arbiscan](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **SliverVineAgentPolicyGuard (Arbitrum One)** | `42161` | `0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b` · [Arbiscan](https://arbiscan.io/address/0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b) · Deploy [`0x77fd8e1c…`](https://arbiscan.io/tx/0x77fd8e1c702ca19e9fa0621a1f6b0e8de6701f389d062cc3427e3d8d3d1e74fa) |
| **ZeroDev Smart Route UserOp (Arbitrum One)** | `42161` | [`0xe12714a7b26d8983c32e471180e640dfb2ff000b4e1530a34cee02169f11e816`](https://arbiscan.io/tx/0xe12714a7b26d8983c32e471180e640dfb2ff000b4e1530a34cee02169f11e816) · `execute-smart-route-live-demo.ts` |
| **SliverVineGate (Arbitrum Sepolia)** | `421614` | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` (CREATE2 same-address) |
| **Mainnet Ignition Tx** | `42161` | [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **SliverVineRiskOracle (Sepolia)** | `421614` | `0x3FFa2539f502682E8145e6Eb427ff78d258D53a4` |
| **IngressSafetySwitch (Sepolia)** | `421614` | `0x3E4298e2b8d4e30396A54C1817Eb71c9272Ffb4B` |
| **Wasm hot path** | Edge | `pkg/soil_core.wasm` **< 28 KiB** · ABI **v2** · 28-slot protocol vector · Worker bundle **143.77 KiB raw | 50.94 KiB gzip** · p50 ~106 µs |

### Core Sinking SSOT (`src/core/`)

Five pure invariant modules are the TypeScript SSOT; legacy import paths under `src/adapters/` and `src/services/` remain **100% backward compatible** via thin-shell re-exports.

| Module | Responsibility |
|--------|----------------|
| [`risk-engine-usdai.ts`](../../src/core/risk-engine-usdai.ts) | USD.ai clock · oracle · depth · `PROTO_USDAI` lane |
| [`soil-resistance-core.ts`](../../src/core/soil-resistance-core.ts) | Soil lane math · HKT time gates · jitter · orderbook gap |
| [`session-key-guard-core.ts`](../../src/core/session-key-guard-core.ts) | Session key validity · notional math |
| [`delta-neutral-calculator.ts`](../../src/core/delta-neutral-calculator.ts) | 0-Δ cross-wallet hedge sizing |
| [`funding-regime-core.ts`](../../src/core/funding-regime-core.ts) | Funding regime classification · leverage scaling |

**Solidity ingress:** [`SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol) · [`IngressSafetySwitch.sol`](../../contracts/IngressSafetySwitch.sol) — **Custom Errors** (`revert CustomError()`) for bytecode-efficient fail-closed; `ERR_*` bytes32 event constants preserved for Dune/telemetry.

### System Architecture — Layer Import Boundaries

Citadel enforces a **machine-verified single-direction gateway boundary** inside `src/core/` — pure invariant modules must not penetrate orchestration layers (`services/` · `adapters/` · `routes/` · `workers/`). Gateway files (`state.ts` · `risk.ts` · `agent-citadel-guard.ts`) remain **zero-layer penetration** surfaces; only **five documented orchestration sinks** may import `services/`:

| Allowlisted orchestration sink | Role |
|-------------------------------|------|
| [`risk-engine-soil.ts`](../../src/core/risk-engine-soil.ts) | Soil fuse orchestration bridge |
| [`risk-engine-policy.ts`](../../src/core/risk-engine-policy.ts) | Policy matrix orchestration |
| [`risk-engine-lib/risk-engine-types.ts`](../../src/core/risk-engine-lib/risk-engine-types.ts) | Shared risk-engine type sink |
| [`intent-ledger/flatten-hardlock.ts`](../../src/core/intent-ledger/flatten-hardlock.ts) | Intent ledger flatten orchestration |
| [`black-swan-guard-lib/black-swan-guard-flatten.ts`](../../src/core/black-swan-guard-lib/black-swan-guard-flatten.ts) | Black-swan guard flatten orchestration |

**Verification protocol** — static import scan across all `src/core/**/*.ts`:

```bash
# Verify Zero-Layer Penetration & Gateway Allowlist Boundaries (3/3 PASS)
npx vitest run tests/core/core-import-boundary.test.ts
```

**SSOT:** [`core-import-boundary.ts`](../../src/core/core-import-boundary.ts) · [`core-import-boundary.test.ts`](../../tests/core/core-import-boundary.test.ts).

> **Note:** Initial mainnet deployment utilizes Bootstrap Ignition Keys (`0x1111…`/`0x2222…`) for public verification without exposing production HSM keys. Key rotation to production multisig is executed via native governance functions.

This document is **invariant-first** (Yellow Paper style): topology, thresholds, and fail-closed semantics. Monetization pitches live under `docs/grants/`.

## 0. Unified Institutional Pre-Execution Pipeline

Santenmoku is a **unified sub-millisecond pre-execution gateway**. **Center of gravity = Arbitrum One** with the **5-Core Venue Matrix** — GMX v2 · Pendle · USD.ai · Variational Omni RFQ on Arbitrum One, plus **Hyperliquid** as an **Independent L1 High-Frequency Orderbook AppChain** cross-chain session-key hedge leg. Pruned venues (Uniswap V3 · Aave V3 · Morpho Blue) retain **RESERVED_ABI_V2** Wasm bitmask holes (protocol bits 4–6). Pillar Set Y Wasm Shield is the technical moat. Permissioned chains (e.g. Robinhood Chain) are **supported ingress examples**, not the product identity.

**Primary Execution Boundary — 5-Core Venue Matrix:** GMX v2 · Pendle · USD.ai · Variational (Arbitrum One) + Hyperliquid L1 Session Key Adapter (cross-chain hedge).

```text
[ Optional Permissioned Ingress (e.g. Robinhood Chain 46630 / 4663) ]
 │
 ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 1. THE GATEHOUSE (Auth) — Opt-In ZeroDev Kernel v3 AA │
 │ Scopes agent permissions & eliminates credential drift│
 └──────────────────────┬──────────────────────────────────┘
 │
 ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 2. PILLAR 2: COMPLIANCE INGRESS FIREWALL │
 │ Venue-agnostic unidirectional AML escort & accounting│
 │ Robinhood Chain = inaugural reference adapter │
 │ · ZeroDev Smart Route Calldata Binding (Reference Harness — Demo Spec) │
 └──────────────────────┬──────────────────────────────────┘
 │
 ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 3. THE SHIELD (CORE MOAT — PRIMARY TECH) — Sub-ms Wasm │
 │ checkSoilResistance() & Wasm engine at p50 ~106 μs │
 └──────────────────────┬──────────────────────────────────┘
 │
 ▼
[ PRIMARY: Arbitrum One GMX v2 ETH/USDC GM + Hyperliquid 1× Short ]
```

| Pillar | Role | SSOT / Mechanism | Dedicated specification |
|--------|------|------------------|-------------------------|
| **[Pillar Set X · Component 1 — The Gatehouse (Auth)]** | **Opt-In** ZeroDev scoped session keys · EIP-712 intent scopes | Kernel v3 · `ORDER_EXECUTE` bounds · Paymaster ($0.50/op · $10/day) · R06 / R07 · `USE_ZERODEV_AA` default-off | [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) |
| **[Pillar Set X · Component 2 — Compliance Ingress Firewall]** | Venue-agnostic unidirectional AML escort · honest `IN_FLIGHT_BRIDGE_CAPITAL` / `lostUsd ≡ 0` | [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) · `IngressSafetySwitch.sol` · Robinhood / Across = **optional reference adapters** · Unit-Verified Vitest **6/6** | [`02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) |
| **[Pillar Set Y — Shield (CORE MOAT)]** | Sub-ms Wasm pre-execution armor — **primary technical moat** | `checkSoilResistance()` p50 ~106 μs · Wasm warm &lt;60µs · R01–R20 | [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md) |

> **Hybrid Pillar Sets X & Y routing:** Pillar Set X (Gatehouse) and Pillar Set X (optional ingress) are summarized inline below; **exhaustive audit-grade specifications** live in the dedicated Pillar Set X & Y component specification documents above. This file retains cross-pillar topology, settlement bounds, and integration anchors.

> *While single components like `checkSoilResistance()` formulas are kept standard and open for seamless `@slivervine/citadel-sdk` adoption across Arbitrum, our core moat lies in the production integration complexity—stitching Rust `#![no_std]` Wasm, Edge Worker execution, and EIP-712 Gate into a sub-ms, fail-closed system.*

## ⚔️ Competitive Matrix — Pre-Execution vs. Post-Execution Risk

| Feature / Dimension | Legacy Providers (Gauntlet / Chaos Labs) | SliverVine Citadel Gate (Pillar Set Y) |
| :--- | :--- | :--- |
| **Execution Phase** | Post-execution dashboards & multi-day governance parameter updates | **Pre-execution inline interception** (Sub-ms BEFORE mempool broadcast) |
| **Latency / Hot-Path** | Minutes to Days (Off-chain simulations + DAO votes) | **p50 ~106 µs** (Rust `#![no_std]` Wasm engine on Edge) |
| **Protection Level** | Global protocol parameter tuning (LTV, Collateral factors) | **Granular tx-level & LP soil protection** (MEV, RPC jitter, Oracle lag) |
| **Deployment Model** | Advisory / SaaS Analytics | **Inline Edge Gate & Open-Source Wasm SDK** (`@slivervine/citadel-sdk`) |

## 1. Core Product Identity

**SliverVine Citadel Shield (BeDelta Living Water v1.0 / BeΔ) is a Pre-Consensus Intent Firewall & Execution Safety Primitive for AI Agents on Arbitrum.**

**Primary execution envelope:** **Delta-Neutral GM** on Arbitrum One — GMX v2 **ETH/USDC** GM pool + Hyperliquid **1× short hedge** (Independent L1 HF Orderbook AppChain · session-key adapter), guarded by Pillar Set Y sub-ms Wasm Shield (`checkSoilResistance()`).

### 1.0 Tailor-Made Mathematical Invariants (Protocol Physical Boundaries)

| Protocol | Venue | Physical Boundary Check | Code Module |
|----------|-------|-------------------------|-------------|
| **GMX v2** | Arbitrum One | Pool Imbalance Ratio: \|OI_long − OI_short\| / PoolTVL > **0.35** · Collateral Reserve < **105%** | [`gmx-v2-invariants.ts`](../../src/adapters/gmx/gmx-v2-invariants.ts) · [`gmx-v2-order-payload-guards.ts`](../../src/services/adapters/gmx-v2-order-payload-guards.ts) |
| **Pendle** | Arbitrum One | Discounted Implied Yield Shock: \|Yield_current − Yield_oracle\| > **150 bps** | [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) |
| **USD.ai** | Arbitrum One | sUSDai peg drift > **30 bps** · GPU oracle age > **2h** · liquidity depth < **$100k** | [`usdai-adapter.ts`](../../src/adapters/usdai/usdai-adapter.ts) · `USD_AI_DEPEG_ORACLE_TRIP` soil fuse |
| **Variational** | Arbitrum One | RFQ quote stale > **500ms** · OLP depth > **15%** · oracle drift > **30 bps** | [`variational-rfq-adapter.ts`](../../src/adapters/variational-rfq-adapter.ts) |
| **Hyperliquid** | Independent L1 HF Orderbook AppChain | Session Key **MaxSizePerOrder** · **Rate Limit** (120/min) · Orderbook Spread > **20 bps** | [`hyperliquid-session-guard.ts`](../../src/adapters/hl/hyperliquid-session-guard.ts) |
| **RESERVED_ABI_V2** | Wasm ABI v2 holes | Pruned Uniswap · Aave · Morpho — protocol bits **4–6** frozen | [`risk-flags.ts`](../../src/core/risk-flags.ts) |

| Component | Venue | Role |
|-----------|-------|------|
| **Yield base (PRIMARY)** | Arbitrum One · GMX v2 ETH/USDC GM | Underweight-side GM LP · builder `uiFeeReceiver` (**+10 bps**) · Citadel pre-execution gate |
| **Hedge** | Hyperliquid (Independent L1 HF Orderbook AppChain) | Session-key **1× short** Emergency Liquidity Sponge · `evaluateHyperliquidSessionGuard()` · nonce-healed signing |
| **Ingress (optional)** | Robinhood Chain | **Pillar Set X Reference Escort Adapter** — not product identity |

**Robinhood Chain role:** **Pillar Set X Reference Escort Adapter** only — regulated treasuries may escort outbound (`46630`/`4663` → `42161`). Inbound AML is blocked by default. Product identity remains **SliverVine Citadel on Arbitrum**. **Audit:** [`02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md).

### 1.1 Engineering Restraint (Blue-Chip Scope)

v1.0 is intentionally restricted to **ETH/USDC** so oracle reliability holds during Sequencer desync: one blue-chip pair removes multi-asset de-peg and FX-slippage surfaces while the Tri-Sensor Matrix (base-fee velocity, RPC jitter, phase-shift) remains authoritative.

### 1.2 Large-Scale Capital Protection

`checkSoilResistance()` (p50 ~106 μs) short-circuits any broadcast when local GM market depth cannot absorb a large institutional order without severe price impact (**>10 bps**). Fail-closed before L2 submission — depth / cross-spread / slippage fuse (R01).

### 1.3 Cross-Isolate `protocolMask` KV Synchronization

Multi-Worker Cloudflare Edge isolates do not share in-memory state. When one isolate trips a protocol lane (e.g. USD.ai de-peg), sibling isolates must inherit the same bitmask without blocking the **p50 ~15µs** hot path.

| Concern | SSOT | Hot-path behavior |
|---------|------|-------------------|
| **KV namespace** | `env.SLIVERVINE_KV` (fallback `SYSTEM_STATE_KV`) | Bound per request in `worker-fetch.ts` |
| **KV key** | `soil:protocol_mask` (`KV_KEYS.PROTOCOL_MASK`) | JSON record `{ version: 1, mask, savedAt }` |
| **Read path** | [`protocol-mask.ts`](../../src/services/kv-lib/protocol-mask.ts) · `readProtocolMaskSync()` | Module-level cache — **zero await** inside `checkSoilResistance()` |
| **Prefetch** | `ctx.waitUntil(prefetchProtocolMaskKv(kv))` | Non-blocking KV `get` warms cache at request ingress |
| **Write path** | `scheduleProtocolMaskKvWrite()` | Fire-and-forget `kv.put()` after local OR merge; cache updated synchronously |

**Invariant:** `checkSoilResistance()` merges `scratch.protocolMask |= readProtocolMaskSync()` before external flag collection, then persists any delta via `scheduleProtocolMaskKvWrite()` — preserving microsecond Edge latency while closing the cross-isolate residual risk.

### 1.4 Wasm FFI ABI v2 — 28-Protocol-Slot Alignment

TypeScript `PROTO_VECT_LEN = 28` (7 lanes × 4 slots) is now mirrored in `pkg/soil_core.wasm` via **`soil_core_abi_version() = 2`**.

| Field | Offset (f64 index) | Semantics |
|-------|-------------------|-----------|
| **Protocol lanes** | `0 … 27` | Active: GMX · Pendle · USD.ai · Variational · Hyperliquid · **RESERVED_ABI_V2** holes (bits 4–6 · slots 8–19) for pruned venues |
| **`protocolMask`** | **27** | Aggregated bitmask; non-zero ⇒ `TRIP_PROTOCOL` (bit 8) |
| **Soil math input** | `28 … 35` | Legacy 8×f64 slippage / depth fuse (`hlSpot` … `minDepthUsd`) |
| **Output** | `out_ptr` + 6×f64 | `crossVenue` · `spotPerp` · `tripped` · `soilRiskUsd` · `cappedMaxSlUsd` · `tripFlags` |

**Wire modules:** [`soil-core-sim.ts`](../../src/services/wasm-feasibility-lib/soil-core-sim.ts) (`WASM_SOIL_INPUT_BYTES = 288`) · [`soil-wasm.ts`](../../src/sdk/soil-wasm.ts) (`WASM_ABI_VERSION = 2`) · [`soil_core.rs`](../../src/wasm/soil_core.rs) (`#![no_std]`).

### 1.5 Dual-Layer Sequencer Defense Model

Citadel Shield is **not** “Edge-only” or “on-chain-only” — it is a **dual-layer** stack that answers the Nitro reviewer question: *TS Gateway latency ≠ Nitro opcode latency; both layers protect different phases.*

| Layer | Runtime | Role | Latency / Gas | SSOT |
|-------|---------|------|---------------|------|
| **Layer 1 — Edge Pre-Consensus** | Cloudflare Worker · `pkg/soil_core.wasm` · TS `checkSoilResistance()` | **Zero-gas** pre-broadcast intercept · sever signing before Sequencer / Bundler / mempool | **p50 ~106 µs** · **0 gas** on blocked paths | `worker-fetch.ts` · `soil-wasm.ts` |
| **Layer 2 — On-Chain Sequencer Execution** | Arbitrum **Nitro Stylus** native Wasm · `SliverVineRiskOracle.sol` | On-chain fail-closed reinforcement inside Nitro VM block execution · auditable parity with Edge soil fuse | **~313 gas** modeled (`check_soil_resistance_stylus`) vs **~34,540 gas** naive EVM equivalent (**~110×**) · sub-ms Nitro runtime | [`stylus_core.rs`](../../contracts/stylus-probe/src/stylus_core.rs) · [`SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol) |

```text
Agent Intent
    │
    ▼
[Layer 1] Edge Gateway + Wasm  (~106µs · 0 gas) ──FAIL──► severSigningChannel()
    │ PASS
    ▼
[Layer 2] Nitro Sequencer block
    ├── Stylus SliverVineSoilCoprocessor  (native Wasm opcode · ~313 gas)
    └── SliverVineRiskOracle STATUS_SHUTDOWN flush
    │ PASS
    ▼
EIP-712 SliverVineGate attestation → GMX / HL execution
```

**Benchmark harness:** `pnpm tsx scripts/benchmark-stylus-opcode.ts` — Cargo `stylus_core` release tests + opcode-weighted Gas table vs EVM-equivalent storage path.

---

## 2. Triangle Liquidity Loop & Segregated Tranches

Closed-loop three-venue routing with **Arbitrum One as the primary yield base**. **Hyperliquid** — Independent L1 High-Frequency Orderbook AppChain (originated alongside Arbitrum's perp liquidity ecosystem) — provides the cross-chain hedge leg; permissioned ingress (e.g. Robinhood Chain) is optional:

```text
Arbitrum One (GMX GM Yield Base — PRIMARY · ETH/USDC)
 ↕ 1× Δ-neutral hedge
Hyperliquid (Independent L1 HF Orderbook AppChain · 1× Short Hedge)
 ↑ optional permissioned ingress (e.g. Robinhood Chain 46630 / 4663)
```

| Leg | Venue | Role |
|-----|-------|------|
| **Yield base (PRIMARY)** | Arbitrum One · GMX v2 GM | Underweight-side GM LP · builder `uiFeeReceiver` (**+10 bps**) · Citadel pre-execution gate |
| **Hedge** | Hyperliquid (Independent L1 HF Orderbook AppChain) | Session-key **1× short** Emergency Liquidity Sponge · `evaluateHyperliquidSessionGuard()` · nonce-healed signing |
| **Ingress (optional example)** | Robinhood Chain | Supported permissioned institutional ingress · outbound-only escort into Arbitrum · **ZeroDev Smart Route Calldata Binding** (reference harness — USDG → GMX `ExchangeRouter`; production baseline = **Arbitrum One Native Ingress**) |

**Control plane:** Cloudflare Edge Worker (`SystemState` SSOT) evaluates sequencer · oracle lag · soil · RPC radar before any unsigned GMX payload or HL hedge dispatch. Routing is unidirectional into `SystemState`; venue adapters never mutate peer books without a gate pass.

**Read API:** `GET /api/yield/triangle` — structural APY / depth / gate status across HL · GMX (Robinhood Chain ingress stub stacked via egress escort).

### 2.1 Segregated Tranches

Solidity vault surface splits capital into two non-fungible risk lanes:

| Tranche | Chain policy | Behavior |
|---------|--------------|----------|
| **Permissioned RWA Tranche** | Robinhood Chain **4663** inbound **BLOCKED** at Edge protocol filter | Institutional / RWA-tagged deposits only · **`src/adapters/across-ingress-bridge.ts`** AML inbound block · **`IngressSafetySwitch`** oracle flush + address blacklist · no permissionless public mint path from 4663 |
| **Permissionless DeFi Tranche** | Arbitrum One + HL | Open GM / hedge flow behind Citadel fail-closed gate · standard DeFi UX |

**Invariant:** RWA capital on the permissioned lane cannot be atomically reminted into the permissionless DeFi tranche without an explicit, audited bridge + compliance gate (Across + AA). Chain **4663 → Arbitrum** inbound is denied by default; Testnet **46630** remains the active integration sandbox.

**On-chain anchors:** [`contracts/IngressSafetySwitch.sol`](../../contracts/IngressSafetySwitch.sol) · [`contracts/SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol) · [`contracts/src/SliverVineAgentPolicyGuard.sol`](../../contracts/src/SliverVineAgentPolicyGuard.sol).

**Lean On-Chain Gate by Design:** Dual-contract settlement core is `SliverVineGate.sol` (consume-once attestation) + `SliverVineAgentPolicyGuard.sol` ([ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) policy validation). Both are **immutable, non-custodial, no proxy** so risk math remains on Edge (`checkSoilResistance()` **p50 ~106µs**) — on-chain is the fail-closed record, not the HFT hot path.

**Arbitrum One (42161) — Mainnet Ignition Gate:**

| Contract | Role | Verified Address (Arbitrum One) |
|----------|------|----------------------------------|
| `SliverVineGate` | Consume-once EIP-712 attestation anchor | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| `SliverVineAgentPolicyGuard` | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) agent-policy pre-screen · `validateAgentPolicy` | `0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b` · Deploy [`0x77fd8e1c…`](https://arbiscan.io/tx/0x77fd8e1c702ca19e9fa0621a1f6b0e8de6701f389d062cc3427e3d8d3d1e74fa) |
| **ZeroDev Smart Route UserOp** | Kernel v3 ERC-7579 · Robinhood ingress → GMX smart-route `payloadHash` bind | [`0xe12714a7…`](https://arbiscan.io/tx/0xe12714a7b26d8983c32e471180e640dfb2ff000b4e1530a34cee02169f11e816) |
| **Mainnet Ignition Tx** | Forge broadcast · Gate contract creation | [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Deploy script** | ChainID guard + optional smoke | [`DeployArbitrumOneGate.s.sol`](../../SliverVineGate/script/DeployArbitrumOneGate.s.sol) · [`deploy-mainnet-gate-ignition.ts`](../../scripts/deploy-mainnet-gate-ignition.ts) |

> **Bootstrap Keys:** Initial mainnet deploy uses Bootstrap Ignition Keys (`0x1111…`/`0x2222…`) for public verification; production multisig rotation via native governance.

**Arbitrum Sepolia (421614) — verified deployment addresses:**

| Contract | Role | Verified Address (Sepolia) |
|----------|------|----------------------------|
| **Deployer / Admin / Signer** | OpSec-isolated Forge broadcast signer · gate stack admin | `0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F` |
| `SliverVineGate` | Consume-once EIP-712 attestation anchor | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| `SliverVineAgentPolicyGuard` | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) agent-policy pre-screen · `SliverVineCitadel` domain · one-way `isPolicyActive` | **Verified Live (42161)** · `0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b` · [Deploy Tx](https://arbiscan.io/tx/0x77fd8e1c702ca19e9fa0621a1f6b0e8de6701f389d062cc3427e3d8d3d1e74fa) |
| `SliverVineRiskOracle` | EIP-712 offline risk report · `STATUS_SHUTDOWN` flush | `0x3FFa2539f502682E8145e6Eb427ff78d258D53a4` |
| `IngressSafetySwitch` | Pillar Set X compliance filter (oracle flush + blacklist) | `0x3E4298e2b8d4e30396A54C1817Eb71c9272Ffb4B` |
| `SliverVineSoilCoprocessor` (Stylus) | On-chain HF soil math coprocessor | **Code-Verified** (Cargo **9/9 PASS** · Stylus SDK **0.10.7** · Wasm Sandbox Vitest Passed · On-chain Deploy Pending Tooling Lock) |

#### 2.1.1 Explicit Scope Isolation for IngressSafetySwitch

> **Design remark (Phase A SSOT):** `IngressSafetySwitch` is a **Pillar Set X address-level compliance filter only**. It does **not** implement chainId routing, R17/R20 daily-loss cutoff, Hot Key severance, or `checkSoilResistance()`.

| Layer | Responsibility | Module |
|-------|----------------|--------|
| **Edge ingress adapter** | Chain ID unidirectional escort · `AML_INBOUND_TO_ROBINHOOD_BLOCKED` | `src/adapters/across-ingress-bridge.ts` (Robinhood = reference adapter) |
| **On-chain ingress switch** | Oracle flush + institutional blacklist per address | `IngressSafetySwitch.sol` |
| **Pre-execution shield** | Sub-ms soil fuse · R17/R20 · Hot Key / `rootProtection()` | Pillar Set Y Edge · Wasm · **not** IngressSafetySwitch |

> Shutdown is triggered upstream by **`SliverVineRiskOracle.applySignedReport(STATUS_SHUTDOWN)`** (EIP-712 offline signer → `isSystemFlushed`). **`IngressSafetySwitch`** reads oracle state only — no independent `Ownable` / `Pausable` admin surface.

**Invariant:** Phase A rename (`RobinhoodSafetySwitch` → `IngressSafetySwitch`) is **nomenclature + SSOT realignment only** — zero predicate or storage-layout change. `SliverVineGate.sol` has **no** on-chain dependency on this contract.

### 2.2 Asset Redemption & Clearing Boundaries

| Path | Boundary |
|------|----------|
| **Arbitrum One Off-ramp** | Native **ETH, BTC, and USDC** supported directly upon GMX v2 async unwind (3–5 min). |
| **USDG Clearing** | Native USDG treasury redemptions are restricted to Robinhood Chain (`46630`/`4663`) via the unidirectional bridge; Arbitrum USDC is converted on return to preserve compliance bounds. Inbound AML contamination (reverse path) is blocked. |

## 5. Settlement Windows & Fee Tokenomics

### 5.1 Settlement Windows

| Window | Constant | Duration | Meaning |
|--------|----------|----------|---------|
| GMX GM redemption / settle | `GMX_REDEMPTION_WINDOW` | **3–5 minutes** | Keepers / oracle settle band for GM deposit·withdrawal completion on Arbitrum |
| HL withdrawal settle | `HL_WITHDRAWAL_SETTLEMENT_WINDOW` | **15 minutes** | L1 bridge / withdrawal finality budget before Citadel treats capital as free for re-route |

Gates must not assume instant atomicity across the triangle; inventory accounting holds legs in-flight until the respective window elapses or venue ack confirms.

#### 5.1.1 Strategic Settlement Extensions (V1.0 Core + V1.5 / V2.0)

| Extension | Settlement role | Horizon | Status |
|-----------|-----------------|---------|--------|
| **Pendle Finance** | PT/YT exit proceeds vs GMX margin shadow accounting — expiry blackhole / oracle decoupling guard · `PENDLE_ORACLE_STALE` soil fuse | **V1.0** | ✅ Live · Pillar Set Y · soil-wired · **222 test files | 1044 PASS clean (100%)** |
| **USD.ai** | AI-compute RWA yield-bearing collateral tier — sUSDai peg · GPU oracle freshness · NAV deviation · depth fuse · `USD_AI_DEPEG_ORACLE_TRIP` | **V1.0** | ✅ Live · Pillar Set Y · [`risk-engine-usdai.ts`](../../src/core/risk-engine-usdai.ts) (SSOT) · [`usdai-adapter.ts`](../../src/adapters/usdai/usdai-adapter.ts) (orchestration) · `pnpm demo:usdai` |
| **Uniswap V3 DEX & Stabilizer** | `GRAIL` liquidity depth for rebalance routing; Stabilizer is **V1.0 Live** on Sepolia `421614` | **Stabilizer V1.0** · Uniswap V3 **V1.5** | ✅ Stabilizer Live · ⏳ Uniswap V3 Roadmap Spec |
| **Variational** | Same-chain perp hedge settlement window (alternative to HL 15 min withdrawal budget) — cross-venue margin routing | **V2.0** | ⏳ PoC Spec |

See [§2.5 Strategic Blue-Chip Ecosystem & Settlement Roadmap](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#25-strategic-blue-chip-ecosystem-settlement-roadmap-v10-core-v15-v20) for integration anchors.

### 5.2 Active Fee Path (v1.0)

| Item | Definition | Status |
|------|------------|--------|
| **Builder UI Fee** | **+10 bps** `uiFeeReceiver` on every unsigned GMX v2 increase / decrease / deposit payload (`GMX_UI_FEE_BPS`) | ✅ Code-Verified |
| **Referral Rebate** | Up to **25%** of GMX trading fees via registered `referralCode` (`GMX_REFERRAL_CODE_BYTES32`) | ✅ Code-Verified |

### 5.3 Dynamic Target Range (8.2% ~ 11.8%) — Mathematical APY Breakdown

Allocator-facing HUD band — **non-guaranteed**; derived from exogenous Delta-Neutral cash flows with **zero native token emissions**. Full narrative: [`05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md` §2.6.2](./05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#262-dynamic-target-range-82-118-mathematical-cash-flow-breakdown).

| Yield Source Leg | Conservative Band (Lower 8.2%) | Bull/Volatile Band (Upper 11.8%) | Payer & Mechanism |
| :--- | :--- | :--- | :--- |
| **GMX v2 ETH/USDC GM Base** | **4.5%** | **6.5%** | GMX trader swap, borrow & closing fees |
| **Skew Rebate & Builder Fee** | **1.0%** (+10 bps UI fee included) | **1.8%** | Positive skew price-impact rebate + `uiFeeReceiver` (+10 bps · `GMX_UI_FEE_BPS`) |
| **Hyperliquid 1× Short Funding** | **3.2%** | **4.2%** | Counterparty long-side funding payment on HL orderbook |
| **Friction & Rebalance Costs** | **−0.5%** (`FRICTION_BUFFER_APY`) | **−0.7%** | Absorbed by Citadel Safety Buffer (basis & slippage) |
| **Net Strategy APY Range** | **8.2%** | **11.8%** | **Exogenous Delta-Neutral Cash Flow (Zero Token Emissions)** |

> **Evaluator defense narrative:** Unlike speculative emission vaults, SliverVine Citadel Shield's **8.2% ~ 11.8%** target range is mathematically grounded in real GMX trading fees, skew rebates, and Hyperliquid short funding rates, guarded by our **0.5% Hurdle Gate** (`FRICTION_BUFFER_APY = 0.005` in `rebalance-rules.ts`).

### 5.4 Hurdle-Rate Probe (Not Product Identity)

> Aave v3 USDC APY on Arbitrum is a **hurdle-rate probe** used when GMX markets wire is unavailable. *(Hurdle-rate probe only — not a yield-stacking product track)*. It does **not** redefine the AI Agent Citadel roadmap (V1.5 = agentic security / [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) swarms).

| Item | Definition |
|------|------------|
| **Benchmark** | **Aave v3 USDC (Arbitrum) — APY Benchmark** *(Hurdle-rate probe only — not a yield-stacking product track)*; not a live execution adapter |
| **Performance Fee** | **10% of Excess Yield Above Aave Benchmark Rate** *(Hurdle-rate probe only — not a yield-stacking product track)* |
| **Excess Yield** | `max(0, Net Strategy APY − Aave Benchmark APY)` after friction buffer |
| **Status** | **Optional accounting probe** — not accrued on current v1.0 builder UI-fee path (+10 bps `uiFeeReceiver` + 25% referral rebate); **not** the V1.5 Citadel swarm roadmap |

B2B Option B (slippage-savings fee) remains a separate commercial SKU and is not the optional hurdle-rate probe above. V2.0 CaaS monetization is scoped to institutional SDK licensing and pre-execution risk-check APIs — no public fee schedule in v1.0 docs.

### 5.5 Public Audit Surface

`GET /api/grant-audit` — guard states, TVL, `provenanceVerified`, `sepoliaDualLegProof`. No signing material or proprietary encode paths.

## Appendix: Real-World Threat Model & Market Landscape

### Market Adoption Metrics (The Agentic Web Shift)

The Web3 attack surface is shifting from human UI phishing to **autonomous agent execution pipelines**. Industry telemetry indicates the agentic web is already material on-chain:

| Metric | Estimate | Source |
|--------|----------|--------|
| **AI agents deployed** | **17,000+** autonomous on-chain agents | [Dune — ERC-8004: Trustless Agent Activity](https://dune.com/dune/erc-8004-onchain-ai-agents) · [ERC-8004 (EIP)](https://eips.ethereum.org/EIPS/eip-8004) · [Dune AI Agents hub](https://dune.com/agents) |
| **Share of on-chain transactions** | **~19%** agent-attributed activity | [Dune AI Agents](https://dune.com/agents) · [ERC-8004 cross-chain registrations](https://dune.com/queries/6705945) · agent-attribution telemetry (industry estimate) |
| **Daily Active Wallets (DAW) touchpoints** | **~4.5M** wallets interacting with agent frameworks | [Dune AI Agents](https://dune.com/agents) · on-chain wallet–agent interaction dashboards (industry estimate) |

> **Telemetry note:** Figures are order-of-magnitude **industry estimates** for threat-modeling — not audited SliverVine protocol KPIs. Primary on-chain SSOT for agent identity and registration growth is [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) telemetry on [Dune](https://dune.com/dune/erc-8004-onchain-ai-agents). See also [CryptoRank Symposium — agent-security focus](https://cryptorank.io/news/feed/fae5e-ai-agents-web3-hacking-wyoming-symposium).

**Implication:** Security must evolve from post-hoc dashboards and mutable pause functions to **microsecond Pre-Broadcast Intent Firewalls** — severing toxic calldata **before** Sequencer queues, Bundler ingress, or MEV mempools. Citadel Shield targets this gap at **p50 ~106µs** Edge Wasm evaluation ([§3.5 Wasm Soil Core](./03_DEFENSE_MATRIX_AND_WASM_CORE.md#35-wasm-soil-core-m4-summary)) — covering **88%** of the modeled on-chain risk surface per [Risk Framework §0.1](./05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does-and-does-not-guarantee); the residual **12%** systemic tail is disclosed with Fail-Closed posture.

### Real-World Case Studies (Why Citadel Shield is Essential)

| # | Case | Loss / Impact | Citadel Alignment | Source |
|---|------|---------------|-------------------|--------|
| **1** | **[Jaredfromsubway.eth $7.5M Exploit (MEV Honeypot Trap)](https://www.blockaid.io/blog/the-predator-becomes-the-prey-how-a-counter-mev-honeypot-drained-75m-from-jaredfromsubway)** | Automated signature logic exploited via malicious permission / honeypot traps | Validates **sub-ms Wasm pre-broadcast** `checkSoilResistance()` + honeypot RPC defense (`evaluateRpcDefenseGate()`) | [Blockaid incident analysis](https://www.blockaid.io/blog/the-predator-becomes-the-prey-how-a-counter-mev-honeypot-drained-75m-from-jaredfromsubway) · [Chainalysis](https://www.chainalysis.com/blog/sandwich-attack-jaredfromsubway-hack/) · [CertiK](https://www.certik.com/blog/jaredfromsubway-mev-bot-incident-analysis) · [The Defiant](https://thedefiant.io/news/hacks/jaredfromsubway-eth-mev-bot-drained-7-5-million-counter-mev-honeypot) |
| **2** | **[Virtuals Protocol / BasisOS ~$531k Unbound Agent Drain](https://finance.yahoo.com/news/ai-agent-virtuals-protocol-stole-114617216.html)** | Unbound agent execution exceeded safe notional envelopes | Validates **R06/R07** · **`SESSION_KEY_NOTIONAL_CAP_USD = $5,000`** ([§3.6](./03_DEFENSE_MATRIX_AND_WASM_CORE.md#36-financial-risk-parameters-epoch-operations)) | [KuCoin — Virtuals compensation disclosure](https://www.kucoin.com/news/flash/virtuals-protocol-to-cover-full-compensation-for-basis-security-incident) · [Yahoo Finance](https://finance.yahoo.com/news/ai-agent-virtuals-protocol-stole-114617216.html) |
| **3** | **[ElizaOS / ai16z Fraud & Governance Collapse](https://www.burwick.law/active-cases/ai16z-elizaos-token-lawsuit-doe-v-walters)** | SDNY class-action litigation — raw Node.js prompt wrappers lacked on-chain execution guarantees | Validates **bytecode predicate assertions** ([§0.1](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#01-bytecode-predicate-verification-v10-erc-7715-post-grant-design-spec)) · EIP-712 Gate · **LLM back-off cooldown** | [Burwick Law — Doe v. Walters (SDNY)](https://www.burwick.law/active-cases/ai16z-elizaos-token-lawsuit-doe-v-walters) · [CoinDesk](https://www.coindesk.com/markets/2026/08/05/ai-agent-token-once-worth-usd2-4-billion-ends-with-founder-calling-it-dead) · [Decrypt](https://decrypt.co/374958/eliza-ai-token-dead-shuts-down-foundation-lawsuit) |

### Competitive Landscape Matrix

| Dimension | **SliverVine V1.0 (88% Baseline)** | **Wayfinder** | **Virtuals Protocol** | **ElizaOS Framework** | **ZeroDev / Biconomy (ERC-4337 AA)** |
|-----------|-----------------------------------|---------------|-------------------------|----------------------|--------------------------------------|
| **Pre-broadcast severance** | ✅ Sub-ms Wasm soil fuse · 0-Gas fail-closed | ⚠️ Intent routing; **no** sub-ms Wasm severance | ❌ Web2.5 layer; wallets without pre-execution bounds | ❌ No native pre-broadcast gates | ❌ Session keys; **no** AI-context fuse |
| **On-chain immutability** | ✅ 0-proxy Gate · `consumed[digest]` | Varies | Consumer UX focus | Open-source plugins | Strong AA infra |
| **AI behavioral safety** | ✅ 60s LLM cooldown · ±2–5 bps jitter | Limited | Limited | Prompt-only guardrails | N/A |
| **Session blast-radius** | ✅ $5k cap · scoped `ORDER_EXECUTE` | Varies | **Unbound drain risk** | Framework-dependent | ✅ ERC-4337 scopes |
| **Prompt injection immunity** | ✅ Bytecode predicates | Partial | Partial | **Vulnerable** at hook | **Vulnerable** to injected UserOps |

> See also [§0 Competitive Matrix — Pre-Execution vs. Post-Execution Risk](#competitive-matrix-pre-execution-vs-post-execution-risk) · [88% Defense Mesh](../ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md#88-defense-mesh-12-post-grant-rd-roadmap) in [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) · [Risk Spectrum §0.1](./05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does-and-does-not-guarantee) (formal **88% / 12%** + **80/20 Pareto** definition).

### Supplementary Industry References

- **MEV & thin-liquidity** — `checkSoilResistance()` · `evaluateHlOrderbookGapGuard()`
- **$441k+ bot execution error** — [PumpParade / Medium](https://pumpparade.medium.com/ai-trading-bots-lost-441k-in-one-error-heres-what-actually-works-and-what-doesn-t-4f04f890c189)
- **AI antivirus primitives** — [CertiK AI Skill Scanner](https://www.tradingview.com/news/chainwire:d064d7d1f094b:0-certik-launches-ai-skill-scanner-an-antivirus-software-for-the-ai-age/)
- **Institutional agent-security focus** — [CryptoRank Symposium](https://cryptorank.io/news/feed/fae5e-ai-agents-web3-hacking-wyoming-symposium)
