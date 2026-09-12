# SliverVine Protocol: Risk Mitigation, Fail-Closed Security Boundaries & Disclaimer Framework

> **Product:** **SliverVine ExoMesh** (Module A) · **SliverVine Sanctuary** (Module B) — Pre-Consensus Intent Firewall & Execution Safety Primitive
> **Protocol:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) · Santenmoku internal engine
> **Document Status:** Official SSOT for Arbitrum Foundation · ZeroDev Grant Committees · Institutional allocators
> **Version:** v1.0 → v2.0 Roadmap Alignment
> **Baseline:** Vitest **225 test files | 1052 PASS clean (100%)** · Wasm hot-path **50.94 KiB gzip** (`pkg/soil_core.wasm` **< 28 KiB**) · Shield **p50 ~106 µs**
> **Core Principle:** Honest Accounting, Physical Invariants (`lostUsd ≡ 0`), and Venue-Agnostic Pre-Execution Citadel Protection.
> **Spec SSOT:** [`01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md) · [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md)

> **Philosophy — BeΔ (BeDelta Living Water v1.0):** **Be** is inspired by Bruce Lee's *"Be Water, My Friend"* — fluid, adaptive intent routing and friction-free multi-chain execution. **Δ (Delta)** denotes **market delta-neutrality** and risk-neutral execution. **SliverVine ExoMesh** is the pre-consensus execution safety primitive that binds both.

**Official Name:** SliverVine ExoMesh (Module A) · SliverVine Sanctuary (Module B) on **SliverVine Protocol** (BeDelta Living Water v1.0 / BeΔ)  
**Entity:** SilverVine Labs  
**Positioning:** Sub-ms 0-Gas Pre-Broadcast Safety Citadel for AI Agents on Arbitrum  
**Live proof:** `GET /api/grant-audit` · [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · **Dune PEV dashboard:** [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) — **PEV tracking fully operational** on-chain via Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` (`RiskTripBlocked` → `SUM(blocked_intent_notional_usd)`)

### Live SSOT Anchors

| Anchor | Value |
|--------|-------|
| **Vitest baseline** | **225 test files | 1052 PASS clean (100%)** · `pnpm test -- --run` |
| **Wasm hot-path** | **50.94 KiB gzip** · `pkg/soil_core.wasm` **< 28 KiB** · `pass: true` (`pnpm bundle:measure`) |
| **Shield performance** | **p50 ~106 µs** Edge `checkSoilResistance()` |
| **Arbitrum One Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Arbiscan](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **Arbitrum Sepolia Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **Mainnet Ignition Tx** | [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |

### Hybrid Pillar Sets X & Y — Independent Audit Specs

| Pillar | Role | Spec |
|--------|------|------|
| **Pillar Set X — Gatehouse** | ZeroDev Kernel v3 · EIP-712 · session scopes | [`../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) |
| **Pillar Set X — Compliance Ingress Firewall** | AML escort · outbound-only · `lostUsd ≡ 0` | [`../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) |
| **Pillar Set Y — SliverVine ExoMesh Engine Substrate** | `checkSoilResistance()` · Wasm · R01–R20 | [`../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md`](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md) |

---

## 0. Risk Mitigation, Fail-Closed Boundaries & Disclaimer Framework

> **Effective scope:** This section applies to all readers — grant evaluators, institutional allocators, AI-agent integrators, and fund-of-funds diligence teams. By referencing this framework, you acknowledge that **no software can eliminate 100% of systemic crypto, market, or adversarial risks**.

<a id="01-what-slivervine-citadel-shield-does-and-does-not-guarantee"></a>

### 0.1 What SliverVine ExoMesh Does — and Does Not — Guarantee

**SliverVine ExoMesh** provides an **88% pre-broadcast fail-closed interceptor mesh** — anchored by the **sub-ms Wasm soil gate** (`checkSoilResistance()` · `pkg/soil_core.wasm`) — designed to **sever toxic payloads before GMX / Hyperliquid broadcast**.

#### Formal Risk Spectrum Definition (88% / 12%)

SliverVine models the **100% Total On-Chain Risk Surface** — the complete set of execution hazards facing an AI agent operating across Arbitrum, GMX v2, and Hyperliquid — as a **closed two-partition spectrum** that sums to 100%:

| Partition | Share | Definition | Citadel behavior |
|-----------|-------|------------|------------------|
| **Pre-Broadcast Interception Mesh** (SliverVine ExoMesh coverage) | **88%** | The proportion of **operational hazards interceptable at the pre-mempool boundary** at **p50 ~106 µs** via Wasm Soil Core (`checkSoilResistance()` · `pkg/soil_core.wasm`): MEV sandwiches, illiquid depth spikes **>10 bps**, oracle lag (`ORACLE_LAG_DEADLOCK`), unauthorized session usage (R06/R07), prompt-injection / rogue-LLM calldata, AML ingress violations (Pillar Set X), cross-venue slippage anomalies, and honeypot RPC traps | **100% fail-closed severance** — `signingChannelOpen: false`; payload never reaches mempool / bundler |
| **Insurmountable Systemic Residuals** | **12%** | Structural crypto-systemic risks that **no pre-execution software can code-erase**: total L2 sequencer halts **>600 s**, protocol-level 0-day smart-contract exploits on third-party venues, network-level RPC disconnections beyond quorum, TEE supply-chain compromise, bridge counterparty insolvency | **Fail-Closed posture** on sensor breach — `signingChannelOpen: false`; **no claim of principal protection** against these tail events |

**Mathematical closure:** `88% + 12% = 100%` of the modeled on-chain risk surface. The **88%** is derived from the **255-case chaos matrix** and **R01–R20 Defense Matrix** — coverage of **known, sensor-addressable pre-broadcast vectors** — not a guarantee against all future loss.

> **Evaluator SSOT:** All grant, DDIP, audit, and submission prose citing **88%** or **12%** must reference this section: [`§0.1`](#01-what-slivervine-citadel-shield-does-and-does-not-guarantee).

#### Pareto Rule — 80% / 20% (Microstructure Loss Concentration)

Where referenced in Pillar Set Y and technical specs, the **80/20 Pareto rule** is a **distinct, orthogonal microstructure statistic** — not additive to the 88/12 spectrum:

- **~80%** of acute toxic execution loss (sandbox replay · Monte Carlo substrate) stems from **~20%** of microsecond-scale depth / slippage anomalies (illiquidity spikes, cross-venue decoupling, sub-block MEV windows).
- **Pillar Set Y** (`checkSoilResistance()` · R03 depth fuse · R04 slippage fuse · PGATE latency fuse) **targets this 20% acute tail** directly at sub-ms Edge evaluation — the highest-leverage interception band within the broader **88% mesh**.

#### Core Physical Invariants (Judge Quick Reference)

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0
$$

$$
\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}
$$

$$
t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s} \ll t_{\text{mempool\_broadcast}}
$$

**SliverVine ExoMesh** is a **pre-execution circuit breaker**, not:

- A guarantee of **zero market loss** or principal protection
- Immunity to **all future AI exploits**, novel attack vectors, or zero-day smart-contract bugs
- A substitute for independent legal, investment, tax, or regulatory advice
- Regulatory certification (SOC 2 Type II, MiCA CASP, banking license, or insured deposit product)

**Fail-Closed posture:** When soil, oracle, sequencer, bridge, session, or policy sensors trip, SliverVine Protocol **prefers no action over wrong action** — `signingChannelOpen: false`, UserOp rejected pre-bundler, bridge state `BRIDGE_TIMEOUT_FAIL_CLOSED`.

### 0.2 Force Majeure & Residual Risk Vectors (Cannot Be Fully Eliminated)

| Risk class | Example scenarios | SliverVine ExoMesh mitigation | Residual exposure |
|------------|-------------------|-------------------------------------|-------------------|
| **Sequencer / L2 outage** | Arbitrum sequencer halt · extended reordering window | 600s recovery grace · no naked opens during desync · `ARBITRUM_SEQUENCER_UNSAFE` severance | Extended outage beyond modeled grace · state divergence |
| **Oracle lag / manipulation** | Stale GMX / HL marks · >30s feed drift | `ORACLE_LAG_DEADLOCK` · fail-closed before payload construction | Oracle compromise beyond threshold · feed censorship |
| **MEV / sandwich / toxic flow** | Block-builder reordering · liquidity extraction | Soil slippage fuse · TWAP path slicing · PGATE latency fuse | Tail-event MEV beyond modeled depth · private order-flow wars |
| **Bridge / cross-chain** | Across settlement delay · escort path compromise | `IN_FLIGHT_BRIDGE_CAPITAL` · `lostUsd ≡ 0` · 1h timeout fail-closed | Bridge smart-contract exploit · counterparty insolvency |
| **Basis / funding drift** | GMX GM vs HL short divergence | Dual-leg Δ tracking · Citadel Safety Buffer · hurdle gate | Persistent negative funding · venue-specific insolvency |
| **AI-specific attack surface** | **Prompt injection** · rogue LLM intent generation · agent credential drift | Pillar Set X scoped session keys · R20 physical deadlock · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) policy pre-validation · V1.5 prompt-injection circuit (roadmap) | Novel adversarial ML · compromised upstream agent orchestrator · social-engineering of operator keys |

### 0.3 Interceptor Mesh Coverage (88% Pre-Broadcast)

See **[§0.1 Formal Risk Spectrum Definition](#01-what-slivervine-citadel-shield-does-and-does-not-guarantee)** for the authoritative **88% / 12%** partition. In summary: the **88%** reflects modeled coverage of **known toxic pre-broadcast vectors** in the 255-case chaos matrix and R01–R20 Defense Matrix; the residual **12%** comprises unmodeled tail events, third-party venue failures, governance upgrades, key compromise outside session scope, and force majeure beyond sensor thresholds (§0.2).

```text
User / AI intent → Pillar Set X Gatehouse (session scope)
 → Pillar Set X optional escort (AML · bridge accounting)
 → Pillar Set Y SliverVine ExoMesh Engine Substrate (88% interceptor mesh · sub-ms Wasm)
 → [ PASS ] → venue broadcast
 → [ TRIP ] → severSigningChannel() · no broadcast · lostUsd ≡ 0 on pending bridge
```

### 0.4 No-Advice & Classification Disclaimer

SliverVine Protocol is **sophisticated smart-contract infrastructure** — not a bank deposit, money-market fund, or insured cash product. Dynamic Target Range **8.2% ~ 11.8% APY** is a **non-guaranteed display band**, not a yield guarantee. See [`05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) § Risk & Disclaimer for full allocator disclosures.

### 0.5 Fail-Closed Fund Safety & User Notification Flow

> **Institutional SSOT:** What happens to user capital and operator UX when a pre-execution risk trip fires — before any mempool submission, bundler relay, or venue broadcast.

#### 0.5.1 Asset Safety Guarantee — Pre-Broadcast Interception (0 Wasted Gas)

SliverVine ExoMesh evaluates every intent at the **Edge** via `checkSoilResistance()` (**p50 ~106 µs** · `pkg/soil_core.wasm`) and venue-specific guards (GMX pool invariants, HL session limits, bridge escort rules) **before** constructing a signed payload, UserOp, or router calldata.

| Trip class | Example reason codes | When evaluated | On-chain / gas impact |
|------------|---------------------|----------------|---------------------|
| **Soil / microstructure** | `SOIL_RESISTANCE_TRIP` · `ARBITRUM_SEQUENCER_PROBE_MISSING` · cross-venue slippage fuse | Pillar Set Y Edge · Wasm + TS orchestration | **No tx submitted** · **0 gas** · `tradeAllowed: false` |
| **GMX pool invariant** | `GMX_POOL_IMBALANCE_BREACH` · `GMX_COLLATERAL_RESERVE_BREACH` | Pre-payload in `gmx-v2-order-payload-guards.ts` / `gmx-v2-invariants.ts` | **No GMX router call** · **0 gas** on rejected intent |
| **AA / bundler path** | `RiskLimitExceeded` · oracle fail-closed · soil trip propagated to ZeroDev gate | Pillar Set X `zerodev-aa-gate.ts` **before** `sendUserOperation` | **UserOp never reaches bundler** · **0 sponsorship gas** on rejected simulation |
| **Session / policy** | R06/R07 scope breach · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) policy inactive | Pillar Set X Gatehouse + `SliverVineAgentPolicyGuard` | **No Gate `verifyAndConsume`** · signing channel severed |

**Fund safety mechanics:**

1. **Funds remain in the user's custody** — EOA, ZeroDev Kernel smart account, or source-chain wallet. Citadel is **non-custodial**; rejection does not move principal.
2. **No mempool pollution** — toxic intents are severed at `signingChannelOpen: false` / `severSigningChannel()`; Arbitrum sequencer gas is not spent on doomed trades.
3. **Live mainnet proof (42161):** GMX fill attempted under live pool stress correctly tripped **`GMX_POOL_IMBALANCE_BREACH`** pre-broadcast — confirming the fail-closed invariant shield is **active in production** (see [`VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) `[MAINNET_LIVE_EXECUTION_EVIDENCE]`).

```text
Operator intent
  → checkSoilResistance() + venue guards (p50 ~106µs)
  → [ PASS ]  → payload / UserOp assembly → optional Gate attestation → broadcast
  → [ TRIP ]  → RiskLimitExceeded / soil reasons
              → NO calldata signed for venue
              → NO UserOp to bundler
              → user funds unchanged · gas cost = 0
```

#### 0.5.2 In-Flight & Cross-Chain Escort Handling (`lostUsd ≡ 0`)

Pillar Set X Compliance Ingress Firewall enforces **honest bridge accounting** — pending escort capital is **labeled, not lost**.

| State | `capitalLabel` | `deployable` | `lostUsd` | Operator action |
|-------|----------------|--------------|-----------|-----------------|
| **Bridge initiated** | `IN_FLIGHT_BRIDGE_CAPITAL` | `false` | `0` | Wait for escort settlement; no naked GMX/HL leg opens |
| **Bridge settled** | `DEPLOYABLE` (post-escort) | `true` | `0` | Citadel re-runs soil + venue guards before venue broadcast |
| **Bridge timeout (>1h)** | `BRIDGE_TIMEOUT_FAIL_CLOSED` | `false` | `0` | Fail-closed — no delta-neutral open; capital remains on source chain or Kernel account |

**State machine (Pillar Set X reference escort):**

```text
IN_FLIGHT_BRIDGE_CAPITAL
  ├─ settled within DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS (3_600_000 ms = 1h)
  │    → escort OK · lostUsd ≡ 0 · proceed to Pillar Set Y soil gate
  └─ elapsed > 1h without settlement
       → BRIDGE_TIMEOUT_FAIL_CLOSED
       → refuse naked positions · lostUsd ≡ 0
       → funds NOT trapped in Citadel contracts (non-custodial escort labels only)
```

**Capital location on trip:** Funds stay in the **user's Kernel AA account** (Arbitrum) or **source-chain wallet** (e.g. Robinhood `46630` outbound escort). SliverVine Protocol does not sweep principal into protocol-owned contracts on fail-closed paths.

**Code SSOT:** `src/adapters/across-ingress-bridge.ts` · `src/sdk/unidirectional-bridge.ts` · `src/core/capital-invariant-ledger.ts` (`lostUsd` hard-assert = 0) · Pillar Set X audit [`02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) §2.4.

#### 0.5.3 User Feedback & Notification Flow (HUD · SDK · Operator Console)

Rejected intents surface as **structured, actionable errors** — never silent drops.

| Layer | Mechanism | Operator sees |
|-------|-----------|---------------|
| **Core exception** | `RiskLimitExceeded` (`src/services/risk-control`) with `reason` + `details.reasons[]` | Machine-readable trip code (e.g. `GMX_POOL_IMBALANCE_BREACH`) |
| **HUD / SPA** | `resolveComplianceAlertsFromReasons()` · `COMPLIANCE_TRIP_ALERTS` in `compliance-trip-alerts.ts` | Title + severity (`critical` / `warning`) + plain-language remediation |
| **SSE telemetry** | `GET /api/hud-stream` · `section1-soil-probes.ts` log templates | Live `SOIL_RESISTANCE_PROBE: REJECTED` with reason list |
| **SDK / decorator** | `withCitadelShield` · `evaluate*Guard()` adapters | Thrown `RiskLimitExceeded` or `{ allowed: false, reasons }` before wallet sign |
| **Grant audit API** | `GET /api/grant-audit` · Robinhood audit snapshot | `lostUsd: 0` · `tradeAllowed: false` on trip paths |

**Example operator messages (UI SSOT):**

| Trip code | HUD title | Actionable guidance |
|-----------|-----------|---------------------|
| `GMX_POOL_IMBALANCE_BREACH` | Pool Imbalance Fail-Closed | Reduce size, wait for pool rebalance, or switch tranche — **no trade was sent** |
| `SOIL_RESISTANCE_TRIP` | Soil Fuse Armed | Depth/slippage exceeded fuse — retry when cross-venue books normalize |
| `BRIDGE_TIMEOUT_FAIL_CLOSED` | Bridge Timeout Fail-Closed | Escort exceeded 1h — capital remains in-flight label; **do not force naked hedge** |
| `SYSTEM_FAIL_CLOSED_TRIP` | System Fail-Closed | Signing channel severed — clear soil/sequencer/oracle trips before re-arm |

**ZeroDev AA path:** `assertCitadelRiskGate()` and `assertRiskOracleUserOpGateOnChain()` run **before** `sendUserOperation`. Bundler simulation failures (e.g. `UnknownSigner`) are caught pre-relay; operators receive fail-closed console output from `scripts/execute-*-mainnet-*.ts` harnesses with Arbiscan URLs only on **successful** broadcasts.

**Design principle:** Every rejection answers three questions for the operator: **(1)** What tripped? **(2)** Are my funds safe? **(3)** What should I do next? — Answer template: *«{CODE} — no broadcast; funds unchanged; {remediation}»*.

---

## Executive Summary

**SliverVine Protocol** acknowledges a fundamental law of distributed systems: **Cross-chain risk, bridge latency, and basis drift cannot be magically erased by software; they must be quantified, isolated, and economically absorbed.**

This document outlines SliverVine Protocol's 3-Stage Evolutionary Roadmap — from the **code-verified V1.0 AI Agent Citadel on Arbitrum**, through **V1.5 sub-ms agentic security / [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) swarms**, to **V2.0 institutional Citadel-as-a-Service (CaaS) & Orbit Shield** — plus **60 Reflective Architectural Invariants**, each status-badged as **✅ Code-Verified** (v1.0 baseline) or **⏳ Roadmap Spec** (V1.5/V2.0). Aave/Morpho APY figures, where mentioned, are *(Hurdle-rate probe only — not a yield-stacking product track)*. Optional bridges are **Pillar Set X Reference Escort Adapters**.

---

## 1. The 3-Stage Evolutionary Architecture

**Product positioning:** Sub-ms 0-Gas Pre-Broadcast Safety Citadel for AI Agents on Arbitrum (SliverVine Protocol · SilverVine Labs).

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Stage A (V1.0 — ✅ Code-Verified Live Baseline)                                 │
│ · Arbitrum One Primary + GMX v2 / HL Delta-Neutral Engine                       │
│ · Wasm Hot-Path Shield: p50 ~106µs · <28KiB pkg/soil_core.wasm                  │
│ · ERC-8196 (Final) Sub-ms Policy Gate — policy pre-validation                          │
│ · EIP-712 Consume-Once Gate 0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1           │
│ · Mainnet Ignition Tx 0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6 │
│ · Vitest SSOT: 225 test files | 1052 PASS clean
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Stage B (V1.5 — ⏳ Roadmap: Sub-ms Agentic Security & ERC-8196 (Final) Sub-ms Policy Gate swarms)           │
│ · ERC-8196 (Final) Sub-ms Policy Gate Fleet Enforcement — multi-agent policy gates vs rogue LLM execution  │
│ · EIP-7702 Zero-Friction Onboarding — EOA → Agent Smart Account, no token move  │
│ · Prompt Injection Defense Circuit — sub-100µs severSigningChannel()            │
│ · Variational Perp Native Hedge PoC — Arbitrum shadow hedge, less cross-L1 RPC  │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Stage C (V2.0 — ⏳ Design Spec: Institutional CaaS & Orbit Shield)               │
│ · Modular B2B CaaS — @slivervine/citadel-sdk Wasm core for AI DEX / Orbit L3    │
│ · Pre-execution risk checks · ZeroDev Stage ⑦ Intent Composition (2PC ledger)   │
│ · Multi-Chain Edge Reflector Mesh — cross-L2 telemetry + instant kill-switch    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Stage | Status | Center of Gravity |
|-------|--------|-------------------|
| **A — V1.0** | ✅ Code-Verified (**225 test files | 1052 PASS clean (100%)**) | Arbitrum One GMX v2 / HL Δ-neutral · Wasm Shield · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) policy gate · Gate `0xb174118b…` · Sepolia + One consume-once Gate |
| **B — V1.5** | ⏳ Roadmap | ERC-8196 (Final) fleet enforcement · EIP-7702 agent onboarding · prompt-injection pipe sever · Variational native hedge PoC |
| **C — V2.0** | ⏳ Design Spec | **Institutional CaaS & Orbit Shield** — `@slivervine/citadel-sdk` for AI DEXs / Orbit L3s · Pre-execution risk checks · ZeroDev Stage ⑦ Intent Composition (2PC ledger) |

### 1.1 Three-Stage Risk Comparison Matrix

| Risk Dimension | Stage A (V1.0 — ✅ Code-Verified) | Stage B (V1.5 — ⏳ Roadmap) | Stage C (V2.0 — ⏳ Design Spec) |
|----------------|-----------------------------------|-----------------------------|--------------------------------|
| **Product posture** | Sub-ms 0-Gas pre-broadcast Citadel for AI Agents on Arbitrum | Multi-agent [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) swarm security | Institutional CaaS + Orbit Shield mesh |
| **Shield latency** | Wasm hot-path p50 ~106µs · `<28KiB` `soil_core.wasm` | Same Shield · **sub-100µs** `severSigningChannel()` on LLM invariant breach | Same Shield · mesh-propagated kill-switch |
| **Agent policy** | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) pre-validation · EIP-712 consume-once Gate `0xb174…` | **Fleet enforcement** — multi-agent policy delegation vs rogue LLM | Plug-and-play policy SDK for third-party agent wallets |
| **AA / onboarding** | ZeroDev Kernel v3 · Paymaster · Smart Routing | **EIP-7702** EOA → Agent Smart Account (no token migration) · Kernel v4 adapter | Single-chain Intent Compose across Orbit L3s |
| **Prompt injection** | R20 physical deadlock on signed-intent violation | Dedicated **Prompt Injection Defense Circuit** (pipe sever before broadcast) | Mesh-wide channel lock + CaaS tenant isolation |
| **Hedge / venue** | GMX v2 GM + HL 1× short (Δnet ≡ 0) | HL retained · **Variational Perp native hedge PoC** (less cross-L1 RPC) | Same-chain GM + native perp · optional escort |
| **Bridge / ingress** | Pillar Set X Reference Escort Adapter (Robinhood 46630 outbound) · `lostUsd ≡ 0` | Same escort semantics · no yield-stacking identity | **Eliminated** as default path · Robinhood opt-in escort |
| **Monetization** | GMX +10 bps `uiFeeReceiver` (builder lane) | Design-partner PoV · no new fee surface required | Institutional CaaS SDK licensing · pre-execution risk-check APIs |
| **AML / compliance** | Outbound-only Robinhood escort · reverse path blocked | Stronger fleet policy + segregated RWA tranche (planned) | Tenant CaaS policy packs · Robinhood opt-in |
| **Oracle / sequencer** | <30s oracle lag fail-closed · 600s sequencer grace | Same sensors + storm fallback (planned) | Cross-L2 synchronized telemetry |
| **Regression bar** | **225 test files | 1052 PASS clean (100%)** | No Wasm rewrite · additive swarm tests | No Wasm rewrite · CaaS SDK contract tests |

---

## 2. Key Architecture Invariants & Financial Physics

### 2.1 Honest Bridge Accounting (`IN_FLIGHT_BRIDGE_CAPITAL`)

When funds cross via Across Bridge, SliverVine Protocol labels capital as `IN_FLIGHT_BRIDGE_CAPITAL`. **`lostUsd ≡ 0`** holds strictly because capital is not yet exposed to market delta. If bridge execution exceeds `DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS` (1 hour), the system triggers `BRIDGE_TIMEOUT_FAIL_CLOSED`, refusing to open naked positions.

**Code SSOT:** `src/adapters/across-ingress-bridge.ts` · Vitest 6/6 PASS (`tests/adapters/across-ingress-bridge.test.ts`)

### 2.2 Yield Ingress Probe (Pendle PT Fallback — Not Product Identity)

> **v1.0 today:** When GMX markets wire is unavailable, yield ingress falls back to **Pendle PT base APY** (`DEFAULT_PENDLE_BASE_APY`) *(Hurdle-rate probe only — not a yield-stacking product track)* — **not** automatic capital redeployment.

**Code SSOT:** [`arbitrum-yield-ingress-ops.ts`](../../src/adapters/arbitrum/arbitrum-yield-ingress-lib/arbitrum-yield-ingress-ops.ts) · `src/services/yield/rebalance-rules.ts` (`FRICTION_BUFFER_APY`)

### 2.3 Two-Tiered Yield System & Citadel Safety Buffer

> **V1.0 yield SSOT:** Allocator-facing HUD anchors to **Dynamic Target Range 8.2% ~ 11.8% APY** (non-guaranteed), governed by **Hurdle Gate** `FRICTION_BUFFER_APY = 0.005` (0.5% friction buffer) in `rebalance-rules.ts`. Tier caps below describe component mechanics — not guaranteed totals.

| Tier | Mechanism | Cap / Rule |
|------|-----------|------------|
| **Robinhood (Pillar Set X Reference Escort Adapter)** | Optional outbound compliance channel (`46630`/`4663` → `42161`) · `lostUsd ≡ 0` | Not a yield product · does not raise TVL cap |
| **Citadel Safety Buffer** | GMX v2 builder fee (**+10 bps `uiFeeReceiver`** via `GMX_UI_FEE_BPS`) + skew arbitrage surplus | Absorbs bridge fees, basis risk, and MEV slippage |
| **Hurdle Gate** | Rebalance / performance fee crystallization | `FRICTION_BUFFER_APY = 0.005` — deploy only above friction-adjusted excess |

### 2.4 Evolution of ZeroDev: From Bridge Router to Intent Composer

Even in a V2.0 CaaS / Orbit Shield setup, ZeroDev remains the Gatehouse engine:

| Capability | V1.0 (Kernel v3) | V1.5 / V2.0 (v4 + EIP-7702) |
|------------|--------------|-------------------------|
| **Gas-Free Sponsorship** | Paymaster + daily caps | Same, extended to AI agent fleets |
| **Scoped Security** | 30s TTL Session Keys · `ORDER_EXECUTE` only | Zero withdrawal scope preserved |
| **Atomic Composition** | 1-click GM + HL hedge under Citadel gates | EOA → Agent Smart Account · CaaS tenant UserOps |

**Spec SSOT:** [`02_THREE_PILLARS_AND_INGRESS_PIPELINE.md` §2.4](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#24-pillar-set-x-opt-in-zerodev-account-abstraction-integration-summary)

### 2.5 Economic Sustainability Philosophy: Why Low Fees Without Depth Destroy Yield

> **DeFi economics first principle:** A headline fee rate is not yield. **Net LP return = fee revenue + incentives − impermanent loss − cross-venue slippage − MEV leakage.** When depth is thin, a race to **0.01% flat fees** or **unsustainable emissions** often accelerates a **death spiral** — volume chases the cheapest quote, LPs absorb hidden slippage, TVL exits, depth collapses further, and advertised APY becomes fiction.

#### 2.5.1 Lessons from Sustainable AMM Design (Equalizer / Curve lineage)

Mature stableswap and ve(3,3)-style venues (e.g. **Curve**, **Equalizer** and peers) converge on a shared insight:

| Sustainable DEX pattern | Why it survives | Failure mode it avoids |
|-------------------------|-----------------|--------------------------|
| **Fee tiers matched to pool depth & volatility** | Higher-impact pools charge enough to compensate LPs for LVR | Flat micro-fees on shallow books → LP capital bleed |
| **Emissions tied to real fee generation, not vanity TVL** | Rewards follow measurable protocol revenue | Mercenary capital farm-and-dump → liquidity cliff |
| **Concentrated liquidity with explicit impact budgets** | Slippage is priced, not socialized as "free yield" | Toxic flow + hidden IL → silent principal erosion |
| **Governance that adjusts parameters when depth shifts** | Fee/emission knobs respond to utilization | Static 0.01% marketing → death spiral when vol spikes |

**Death spiral mechanics (generic):**

```text
Low headline fee / high emission APY
 → toxic flow & arb extract value from LPs
 → realized slippage + IL > advertised yield
 → LP exit · depth thins
 → worse execution for every $1 deployed
 → emissions subsidize a shrinking book → spiral repeats until TVL collapse
```

SliverVine Protocol does **not** compete on vanity fee minimization. We compete on **honest net yield after friction** — enforced by code, not marketing copy.

#### 2.5.2 SliverVine Protocol Contrast: Mathematical Invariants Over Fee Theater

| Dimension | Unsustainable low-fee / emission model | SliverVine Protocol V1.0 approach |
|-----------|----------------------------------------|---------------------|
| **Yield governance** | Narrative APY · mutable emissions | **Mathematical invariants** — soil fuse · hurdle gate · honest bridge accounting |
| **Protocol revenue capture** | Often absent or extracted via hidden spread | **GMX v2 `uiFeeReceiver` +10 bps** on every unsigned payload (`GMX_UI_FEE_BPS`) + up to **25%** referral rebate |
| **Friction vs net gain** | Ignored until LP capital is impaired | **`FRICTION_BUFFER_APY = 0.005` (0.5%) Hurdle Gate** — DN opens only when `targetNetApy > nativeEarnApy + buffer` |
| **Slippage budget** | Socialized across passive LPs | **Pre-execution soil fuse** — cross-venue slip **> 0.5%** trips fail-closed · TWAP path slicing |
| **Allocator disclosure** | Fixed "guaranteed" APY | **Dynamic Target Range 8.2% ~ 11.8%** (non-guaranteed HUD band) |

**Hurdle Gate SSOT (`rebalance-rules.ts`):**

```typescript
export const FRICTION_BUFFER_APY = 0.005 as const; // 0.5% friction buffer
// resolveCapitalAllocation(): OPEN_DELTA_NEUTRAL iff targetNetApy > hurdleRateApy + FRICTION_BUFFER_APY
```

**Net-yield inequality SliverVine Protocol enforces:**

```text
+10 bps uiFeeReceiver (GMX_UI_FEE_BPS) + GMX skew rebate + funding cushion
 − bridge / basis / MEV friction
 > Native Earn APY + FRICTION_BUFFER_APY (0.5%)
 ⇔ capital deployment allowed (else park in Native Earn · fail-closed)
```

**Design rule:** Citadel Safety Buffer and builder UI fee exist to **capture real economic surplus** from GMX v2 skew routing — not to mask slippage with emissions. The 0.5% Hurdle Gate ensures **net gains always outpace friction** before Delta-Neutral capital is deployed or rebalanced.

**Code anchors:** `src/services/yield/rebalance-rules.ts` · `src/services/adapters/gmx-v2-order-payload.ts` · `src/services/risk-control-lib/soil-resistance.ts` · Vitest **225 test files | 1052 PASS clean

### 2.6 Real Yield vs. Toxic Inflation

> **Tokenomics first principle:** Not all APY is created equal. **Real yield** flows from exogenous cash flows — trading fees, funding payments, lending spreads, and skew rebates paid by counterparties. **Toxic inflation** flows from endogenous token emissions — newly minted governance tokens recycled into headline APY with no structural payer on the other side of the trade.

SliverVine Protocol **does not** operate an empty emission token model. There is **no** native SliverVine Protocol reward token, **no** mercenary liquidity mining program, and **no** vanity TVL subsidy designed to inflate HUD numbers. Yield is anchored to **structural delta-neutral cash flows** that exist independently of SliverVine token issuance.

#### 2.6.1 Toxic Inflation — The Empty Emission Pattern

| Toxic inflation signal | Mechanism | Why it collapses |
|------------------------|-----------|------------------|
| **Emission-only APY** | Protocol mints reward token → farms TVL → dumps on exit | No exogenous payer; APY is self-referential |
| **Mercenary capital loop** | High emission → farm → exit → repeat | TVL cliff when emissions taper |
| **Narrative "real yield" without hurdle** | Marketing APY without friction-adjusted net math | Slippage + IL + basis bleed hidden until principal impaired |
| **Governance token as collateral of last resort** | Token price backs advertised returns | Reflexive death spiral when token sells off |

```text
Toxic inflation loop:
 Mint emissions → advertise 40% APY → mercenary TVL in
 → emissions sold / diluted → real cash flow < headline APY
 → exit cascade → emissions must rise → spiral until insolvency narrative
```

This pattern is **explicitly rejected** by SliverVine Protocol architecture. Allocator-facing disclosure uses a **non-guaranteed Dynamic Target Range (8.2% ~ 11.8%)** — not emission-inflated marketing APY.

#### 2.6.2 Dynamic Target Range (8.2% ~ 11.8%) — Mathematical Cash-Flow Breakdown

The HUD **Dynamic Target Range** is derived **solely from exogenous Delta-Neutral cash flows** — GMX trading fees, skew rebates, Hyperliquid funding, and protocol builder accrual — with **zero native SliverVine token emissions**:

| Yield Source Leg | Conservative Band (Lower 8.2%) | Bull/Volatile Band (Upper 11.8%) | Payer & Mechanism |
| :--- | :--- | :--- | :--- |
| **GMX v2 ETH/USDC GM Base** | **4.5%** | **6.5%** | GMX trader swap, borrow & closing fees |
| **Skew Rebate & Builder Fee** | **1.0%** (+10 bps UI fee included) | **1.8%** | Positive skew price-impact rebate + `uiFeeReceiver` (+10 bps) |
| **Hyperliquid 1× Short Funding** | **3.2%** | **4.2%** | Counterparty long-side funding payment on HL orderbook |
| **Friction & Rebalance Costs** | **−0.5%** (`FRICTION_BUFFER_APY`) | **−0.7%** | Absorbed by Citadel Safety Buffer (basis & slippage) |
| **Net Strategy APY Range** | **8.2%** | **11.8%** | **Exogenous Delta-Neutral Cash Flow (Zero Token Emissions)** |

> **Evaluator defense narrative:** Unlike speculative emission vaults, SliverVine ExoMesh's **8.2% ~ 11.8%** target range is mathematically grounded in real GMX trading fees, skew rebates, and Hyperliquid short funding rates, guarded by our **0.5% Hurdle Gate** (`FRICTION_BUFFER_APY = 0.005`). Capital deploys only when `targetNetApy > nativeEarnApy + FRICTION_BUFFER_APY` (`rebalance-rules.ts`).

**Code anchors:** `src/services/yield/rebalance-rules.ts` (`FRICTION_BUFFER_APY`) · `src/services/adapters/gmx-v2-order-payload.ts` (`GMX_UI_FEE_BPS`) · `scripts/survival-benchmark/` (HL funding replay).

#### 2.6.3 Real Yield — SliverVine Protocol's Structural Delta-Neutral Cash-Flow Stack

SliverVine Protocol composes yield from **three exogenous legs**, each with an identifiable economic payer outside SliverVine token minting:

| Cash-flow leg | Source | Economic payer | Stage | Code / spec anchor |
|---------------|--------|----------------|-------|-------------------|
| **Risk-free base (probe only)** | Aave v3 / Morpho Blue USDC earn on Arbitrum One *(Hurdle-rate probe only — not a yield-stacking product track)* | Borrowers pay lending spread | Probe · optional storm floor | `arbitrum-yield-ingress.ts` · `rebalance-rules.ts` |
| **GMX skew rebate + builder fee** | Underweight-side GM LP · `uiFeeReceiver` **+10 bps** (`GMX_UI_FEE_BPS`) · positive skew price-impact rebate (up to **~5 bps** venue-native; separate from `uiFeeReceiver`) | Traders / skew rebalancers on GMX v2 | A ✅ | `gmx-v2-order-payload.ts` · `GMX_UI_FEE_BPS` · Invariant #25–#27 |
| **HL funding cushion** | 1× short leg on Hyperliquid — hourly funding when perp > spot | Counterparty funding flow on HL book | A ✅ | HL session pipeline · Survival Benchmark funding replay |

**Delta-neutral structure:** Long GM pool exposure (Arbitrum) is hedged by 1× HL short — net directional delta ≈ 0. Yield is therefore **carry and fee capture**, not leveraged directional bet + emission subsidy.

```text
Real yield stack (conceptual):
 Base floor ← Aave / Morpho USDC earn (~4–5% *(Hurdle-rate probe only — not a yield-stacking product track)*)
 + GMX surplus ← +10 bps uiFeeReceiver (GMX_UI_FEE_BPS) + venue-native skew rebate (up to ~5 bps; separate)
 + HL funding ← 1× short funding cushion (hourly · regime-dependent)
 − friction ← bridge · basis · MEV · slippage (Citadel Safety Buffer absorbs)
 > hurdle ← Native Earn + FRICTION_BUFFER_APY (0.5%) before DN redeploy
```

#### 2.6.4 Why SliverVine Protocol Rejects Empty Emissions — Design Rules

| Design rule | Rationale |
|-------------|-----------|
| **No emission token as yield source** | Prevents reflexive APY divorced from venue cash flows |
| **Hurdle Gate before DN deployment** | `resolveCapitalAllocation()` parks capital in Native Earn when `targetNetApy ≤ hurdle + 0.5%` |
| **Citadel Safety Buffer absorbs friction** | Real surplus must cover bridge/basis/MEV — not be masked by mint-and-dump |
| **Storm fallback to Aave/Morpho (optional probe)** | When GMX skew + HL funding compress, capital **may park at risk-free probe** *(Hurdle-rate probe only — not a yield-stacking product track)* |
| **Honest HUD band** | 8.2–11.8% is a **target range**, not a guaranteed emission-backed APY |

**Contrast summary:**

| | Toxic inflation model | SliverVine Protocol real-yield model |
|---|----------------------|----------------------|
| **Primary yield driver** | Native token emissions | GMX fees/rebates + HL funding + Aave/Morpho base *(Hurdle-rate probe only — not a yield-stacking product track)* |
| **Payer identity** | Future token holders / dilution | Traders, borrowers, funding counterparties |
| **TVL retention** | Mercenary — exits when emissions drop | Hurdle-gated — deploys only when net > friction |
| **Downside in storm** | Raise emissions (spiral) | Fail-closed + optional Aave/Morpho probe floor *(Hurdle-rate probe only — not a yield-stacking product track)* |
| **Protocol revenue** | Often token-dilutive | **+10 bps `uiFeeReceiver`** + up to **25%** referral rebate — venue-native builder stack |

> **Allocator note:** Real yield **does not mean risk-free**. Funding can flip negative, skew rebates compress, and Aave rates move. SliverVine Protocol quantifies and buffers these residuals (§2.5 · §6) — it simply refuses to **substitute** them with empty token inflation.

**Code anchors:** `src/services/yield/rebalance-rules.ts` · `src/adapters/arbitrum/arbitrum-yield-ingress.ts` · `src/services/adapters/gmx-v2-order-payload.ts` · `scripts/survival-benchmark/` (HL funding replay) · [`05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) § Risk & Disclaimer (no guaranteed APY).

---

## 3. The 60 Reflective Architectural Invariants (Summary Matrix)

> **Defense Matrix (R01–R20):** 17 Active · 2 Refactored · 1 Deprecated — see [`03_DEFENSE_MATRIX_AND_WASM_CORE.md` §3.3](./03_DEFENSE_MATRIX_AND_WASM_CORE.md#33-defense-matrix-r01-r20-summary)
> **Status legend:** **✅ Code-Verified** = v1.0 baseline with code/test anchor · **⏳ Roadmap Spec** = V1.5/V2.0 design — not claimed as shipped

### I. Honest Accounting & Cross-Chain Physics (1–10)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 1 | ✅ | **Honest Accounting** | In-flight bridge funds labelled `IN_FLIGHT_BRIDGE_CAPITAL`; zero naked exposure |
| 2 | ✅ | **Zero Loss Invariant** | `lostUsd ≡ 0` — pending bridge liquidity is never booked as principal loss |
| 3 | ✅ | **Bridge Timeout Fail-Closed** | `DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS` = 1h → `BRIDGE_TIMEOUT_FAIL_CLOSED` |
| 4 | ✅ | **Unidirectional Escort** | Robinhood `46630`/`4663` → Arbitrum `42161` outbound-only |
| 5 | ✅ | **AML Inbound Isolation** | `42161 → 46630/4663` inbound blocked · `AML_INBOUND_TO_ROBINHOOD_BLOCKED` |
| 6 | ✅ | **Settlement Window Honesty** | GMX 3–5 min · HL withdrawal 15 min — capital held in-flight, not mis-booked |
| 7 | ✅ | **Non-Custodial Escrow** | User principal never booked as protocol-owned; Kernel account SSOT |
| 8 | ✅ | **Basis Risk Quantification** | Cross-venue delta tracked; friction absorbed by Citadel Safety Buffer |
| 9 | ✅ | **Across Bridge SSOT** | `evaluateAcrossBridgeTransfer()` + `evaluateBridgeTimeout()` pure functions |
| 10 | ✅ | **Ingress Safety Switch** | On-chain **`IngressSafetySwitch.sol`** address-level oracle flush + blacklist · inbound AML at Edge adapter |

### II. ZeroDev & Account Abstraction (11–20)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 11 | ⏳ | **ZeroDev Evolution** | Kernel v3 → v4 EIP-7702 Intent Composer for native multi-venue routing |
| 12 | ✅ | **EIP-7562 Zero Bundler Rejection** | Stateless `ecrecover` in Validation Phase; bundler rejection rate → 0 |
| 13 | ✅ | **Scoped Session Keys** | `ORDER_EXECUTE` bounds only — zero withdrawal scope on hot keys |
| 14 | ✅ | **30s TTL Self-Destruct** | Ephemeral session keys auto-revoke; nonce-healed on `Invalid nonce` |
| 15 | ✅ | **Paymaster Gas Sponsorship** | Daily sponsorship caps; fail-closed when ledger exhausted |
| 16 | ✅ | **EIP-712 Domain Binding** | `SliverVineCitadel` · chainId + `verifyingContract` anti-replay |
| 17 | ✅ | **ERC-1271 Dual Validation** | Kernel magic value `0x1626ba7e` + Gate m-of-n ECDSA — neither bypasses the other |
| 18 | ⏳ | **EIP-7702 Zero-Friction Onboarding** | EOA instant Smart Account transformation without asset transfer |
| 19 | ✅ | **Gatehouse Abstraction** | Zero-contract-rewrite venue upgrades via adapter swap |
| 20 | ✅ | **ERC-4337 UserOp Pre-Screen** | Edge `verifyAgentIntent()` before bundler dispatch |

### III. Yield, Liquidity & Fee Tokenomics (21–30)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 21 | ⏳ | **Two-Tiered Yield** | Robinhood (**Pillar Set X Reference Escort Adapter**) capped at +2% boost; excess yield → Safety Buffer |
| 22 | ⏳ | **Hurdle-rate probe (optional)** | Aave/Morpho APY as probe floor *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 23 | ⏳ | **Aave Cap Isolation** | Aave USDC 100% supply cap → Morpho Blue probe fallback *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 24 | ⏳ | **Dynamic Hurdle Rate** | Optional performance fee only on yield exceeding Aave probe + 1.5% *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 25 | ✅ | **Builder UI Fee** | +10 bps `uiFeeReceiver` on every GMX v2 payload (v1.0 active) |
| 26 | ✅ | **Skew Neutralizer Premium** | Positive skew / price-impact rebate — never conflated with UI fee |
| 27 | ✅ | **Citadel Safety Buffer** | Excess GMX yield absorbs bridge fees, basis drift, MEV slippage |
| 28 | ⏳ | **Risk-Free Storm Probe** | Optional 4%~5% Aave/Morpho probe during 3σ / oracle-lag / sequencer grace *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 29 | ⏳ | **Performance Fee (optional accounting)** | 10% of excess yield above Aave probe — not on v1.0 UI fee path *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 30 | ⏳ | **CaaS Monetization** | B2B Wasm Firewall license · institutional SDK licensing |

### IV. Wasm Shield & Pre-Execution Moat (31–40)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 31 | ✅ | **Venue-Agnostic Shield** | `checkSoilResistance()` on abstract Soil state — independent of venue |
| 32 | ✅ | **p50 ~106 µs Hot Path** | Rust `#![no_std]` Wasm on Cloudflare Edge |
| 33 | ✅ | **Hot/Cold Decoupling** | 50.94 KiB gzip hot path isolated from 5-min Cron Workers; zero GC pauses |
| 34 | ✅ | **Wasm Budget** | `<28kb` artifact · `<60µs` warm execution (`pkg/soil_core.wasm`) |
| 35 | ✅ | **R01 Soil Resistance** | Depth · cross-spread · slippage fuse — fail-closed pre-broadcast |
| 36 | ✅ | **R04 PGATE Latency** | `PGATE_MAX_LATENCY_MS` = 200 — rejects stale venue timestamps |
| 37 | ✅ | **R03 L2 Book Fail-Closed** | 500ms HL orderbook staleness → dispatch blocked |
| 38 | ✅ | **Cross-Venue TWAP** | Net slippage >0.5% → `TWAPEngineV2` path slicing, not market sweep |
| 39 | ✅ | **Poisson Jitter Anti-MEV** | $1M+ clips: 18s–110s random intervals over 12–18 min parent window |
| 40 | ✅ | **Block 0 Sequencer Defense** | Private relay / QUIC + GMX `cancelOrder` atomic counter |

### V. Risk Matrix & Fail-Closed Severance (41–53)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 41 | ✅ | **Fail-Closed Haven** | `signingChannelOpen: false` during 3σ storms — no action > wrong action |
| 42 | ✅ | **R02 rootProtection** | Fatal errors / R17/R20 breach → kill Hot Key signature pipelines |
| 43 | ✅ | **R11 Dynamic Max SL** | Dynamic Account Risk Ceiling (V0.8 Baseline: Equity-Weighted SL; V1.0 Mainnet: Dynamic Adaptive Engine) — deprecated fixed $50 SL forbidden |
| 44 | ✅ | **R07 Notional Cap** | `SESSION_KEY_NOTIONAL_CAP_USD` = $5,000 per scoped session |
| 45 | ✅ | **R12 Leverage Scaling** | 3× → 1× → Halt escalation under funding regime stress |
| 46 | ✅ | **R13 Black-Swan Speed-Halt** | 3σ volatility spike → immediate dispatch freeze |
| 47 | ✅ | **R17 Daily Loss Severance** | Daily loss budget breach → circuit breaker + channel sever |
| 48 | ✅ | **R20 Physical Deadlock** | `R20_FLATTEN_FAILED` → hardlock + signing channel close |
| 49 | ✅ | **R09 Two-Phase Saga** | Intent ledger 2PC — no orphan venue legs |
| 50 | ✅ | **R10 Auto-Compensating Flatten** | Stalled hedge → automated unwind attempt before hardlock |
| 51 | ✅ | **Sequencer Guard** | 600s recovery grace — no naked opens during ArbOS desync |
| 52 | ✅ | **Oracle Lag Fail-Closed** | >30s Chainlink staleness → soil trip + signing sever |
| 53 | ✅ | **Emergency Margin Buffer** | `DEFAULT_CROSS_MMR = 0.05` — 5% equity reserve before new risk |

### VI. V1.5 / V2.0 Evolution & B2B (54–60)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 54 | ⏳ | **AI Agent Shield** | 30s TTL Session Keys protecting unattended bots from MEV & sequencer halts |
| 55 | ⏳ | **OI Inversion Lock** | GMX Open Interest 99% cap → opposite-leg lock; PnL & delta frozen |
| 56 | ⏳ | **Aave Cap Isolation** | Aave USDC supply cap 100% → automatic Morpho Blue degradation *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 57 | ⏳ | **PoR De-peg Defense** | Chainlink Proof-of-Reserve >0.5% RWA de-peg → execution hard-lock |
| 58 | ⏳ | **EIP-7702 Zero-Friction Onboarding** | EOA wallet → Smart Account without asset migration |
| 59 | ⏳ | **Dynamic Hurdle Rate** | Performance fee charged only above Aave benchmark + 1.5% *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 60 | ⏳ | **Immutable B2B License** | Static 50.94 KiB gzip Worker hot path powering CaaS ecosystem subscriptions |

---

## 4. Simulation & Stress Testing Harness

SliverVine Protocol treats **simulation as a first-class risk artifact** — not a marketing appendix. All harnesses below are offline or read-only against live market data; they never mutate production signing state unless explicitly invoked with `--live`.

> **SSOT verification hub:** All CLI commands, pillar mapping, and expected outputs → [`docs/VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)

### 4.1 Survival Benchmark (HL Mainnet L2 + Dual-Radar)

The **Survival Benchmark** is a 30-day lookback institutional stress report that fuses Hyperliquid mainnet L2 orderbook walks, Binance basis, funding history, and Citadel soil audits.

| Parameter | Value | SSOT |
|-----------|-------|------|
| Canonical notional | **$100,000** (`NOTIONAL_USD`) | `scripts/survival-benchmark/survival-benchmark.types.ts` |
| Stress notional | **$1,000,000** (`STRESS_NOTIONAL_USD`) | Same |
| Lookback window | **30 days** | `LOOKBACK_MS` |
| Slippage fuse | **0.5%** (`MAX_SLIPPAGE`) | `soil-resistance-types.ts` |
| Depth floor | **$100,000** (`MIN_DEPTH_USD`) | Same |
| Output artifact | `docs/0801_BeDelta_Survival_Benchmark.md` | `scripts/survival-benchmark/index.ts` |

**Execution:**

```bash
pnpm tsx scripts/generate-survival-report.ts
```

**What it measures:**

1. **Live L2 book metrics** — spread, bid/ask depth, price impact @ $100k / $1M via `computeLiveBookMetrics()`.
2. **Soil resistance audit** — `auditLiveBookSoilResistance()` against `MIN_DEPTH_USD` and cross-venue slippage fuse.
3. **Dual-leg market vs SLI-TWAP** — `dualLegMarketSlip()` vs `simulateSliTwap()`; reports slippage saved at $100k and $1M.
4. **HL Dual-Radar composite** — 5-sensor matrix (funding, basis, depth, volatility, HUD state) over 30D funding equity curve.
5. **Phase isolations** — progressive weapon staging (Base → Full Spec) with single-variable isolation.

> **Grant evaluator note:** Survival Benchmark validates that **$100k is the v1.0 design notional envelope** — aligned with `ORDER_SIZE_MAX_USD`, `MIN_DEPTH_USD`, and Alpha Vault Cap (§5.1).

### 4.2 ZeroDev AA Gate Regression (`zerodev-aa-gate.test.ts`)

The ZeroDev Citadel risk gate is an **opt-in CLI/SDK pre-broadcast envelope** (not mounted on the Worker hot path). Its Vitest suite proves fail-closed behavior before any UserOp reaches a bundler.

| Test case | Assertion | Risk control |
|-----------|-----------|--------------|
| Healthy soil pass | `assertCitadelRiskGate()` returns `sequencerSafe: true`, chain `42161` | Baseline AA route |
| Soil trip | Throws `RiskLimitExceeded` with `TRIP_SOIL_RESISTANCE` | Cross-venue slippage > fuse |
| Per-UserOp gas cap | Throws `ZERODEV_GAS_LIMIT_EXCEEDED_TRIP` when gas > **$0.50** | `MAX_GAS_COST_PER_USEROP_USD` |
| Daily sponsorship exhaustion | Falls back to `sponsored: false` at **$10/day** cap | `DAILY_SPONSORSHIP_LIMIT_USD` |

```bash
pnpm exec vitest run tests/adapters/zerodev-aa-gate.test.ts
```

**Read order for evaluators:**

```text
zerodev-aa-gate.test.ts → assertCitadelRiskGate() + evaluateZeroDevGasGuards()
zerodev-aa-gate.ts → evaluateStaticBreakerMatrix() + Citadel risk gate
 ├─ zerodev-aa-failover.ts → Arbitrum One health / AA probe route
 ├─ zerodev-aa-static-breaker.ts → soil + gas sponsorship limits
 └─ zerodev-aa-userop.ts → Paymaster + bundler dispatch (after gate PASS)
```

### 4.3 ZeroDev / HL Dry-Run Harnesses (No Live Broadcast)

| Harness | Command / Test | Scope |
|---------|----------------|-------|
| **ZeroDev AA Dry-Run** | `pnpm test:zerodev` → `tests/adapters/zerodev-aa-dryrun-harness.test.ts` | Kernel v3 EP 0.7 UserOp draft · session-key clip audit · Risk Oracle Gate simulation |
| **HL Panic Sandbox** | `pnpm tsx scripts/dry-run-sandbox.ts` | In-memory HL testnet stress → counter-attack → EIP-712 session-key pipeline (< 5ms hot path target) |
| **Grant E2E Demo** | `pnpm demo:e2e` (default **dry-run**) | Full Citadel pipeline simulation; pass `--live` only for controlled mainnet ignition |
| **5-TX Verified Proof** | `pnpm verify:5tx` / `pnpm verify:grant` | Hyperliquid testnet 5-TX anchor with notional tiers ($1K / $100K / $1M) |
| **Negative Proofs** | `pnpm verify:negative` | Confirms soil trips on depth breach (`DEPTH_USD < MIN_DEPTH_USD`) |
| **AI Agent Interceptor** | `pnpm demo:agent` | `@slivervine/citadel-sdk` `withCitadelShield` — ALLOW / `--trip` FAIL_CLOSED |

> Production soil fuse on Edge remains **`checkSoilResistance()`** — dry-run harnesses validate adjacent paths without replacing the Worker SSOT.

### 4.4 Multi-Leg Portfolio Cascade Replay (Black Swan Resiliency)

Gauntlet-style **multi-leg cascade replay** simulates correlated shocks across the GMX · Hyperliquid · USD.ai collateral triangle — validating fail-closed halts before any live broadcast.

```bash
# Verify Multi-Leg Cascade Replay & HF Breach Defense (4/4 PASS)
npx vitest run tests/core/portfolio-cascade-replay.test.ts
```

| Scenario | Shock profile | Expected trip code |
|----------|---------------|-------------------|
| **Benign shock** | −0.3% ETH · 10% depth drop · 0.5% slippage | `totalBlocked = 0` · healthy HF |
| **HF breach (deep crash)** | ETH −30% · 75% depth drop · 3% slippage · GM pool 70/30 imbalance | `HF_BREACH` · `BLACK_SWAN_HALT` · or `GMX_IMBALANCE` |
| **HF velocity cascade** | Two-step ETH collapse (−6.7% → −21%) · `hfCascadeDeltaPerStep = 0.08` | `cascadeVelocityTripped` or blocked steps · `finalHf < COLLATERAL_HF_MIN + 0.5` |
| **Delta drift** | Missing HL hedge leg · mild ETH dip | `DELTA_DRIFT` · `blocked = true` |

**SSOT modules:** [`portfolio-cascade-core.ts`](../../src/core/portfolio-cascade-core.ts) · [`portfolio-cascade-replay.test.ts`](../../tests/core/portfolio-cascade-replay.test.ts) · venue legs: **GMX_GM** · **HL_SHORT** · **USDAI_COLLATERAL**.

---

## 5. Comparative Analysis: Arbitrum Native vs. Pillar Set X Reference Escort Adapter

V1.0 operates two **distinct capital ingress modes**. They share the same Citadel pre-execution envelope. Robinhood / Across is a **Pillar Set X Reference Escort Adapter** — not product identity.

### 5.1 Capacity Limits

| Dimension | **Arbitrum Native Ingress** | **Pillar Set X Reference Escort Adapter (Robinhood)** |
|-----------|----------------------------|------------------------------|
| **V1.0 Alpha Vault TVL cap** | **$100,000** hard ceiling (roadmap spec) | Same envelope — escort does not raise TVL cap |
| **Single-order notional (v1.0 live)** | `SESSION_KEY_NOTIONAL_CAP_USD` = **$5,000** | N/A until bridge settles on `42161` |
| **Single-order notional (v1.0 design)** | `ORDER_SIZE_MAX_USD` = **$100,000** | Post-settlement only; in-flight capital excluded from deployable NAV |
| **Depth prerequisite** | `MIN_DEPTH_USD` = **$100,000** on HL book | Same hedge leg requirements after settlement |
| **Gap-window tightening** | HL orderbook gap guard: depth **2×** ($200k) · leverage **3× → 1×** | Bridge timeout fail-closed — no naked GM/HL legs during in-flight |

**Quant anchor:** The **$100,000** convergence is not arbitrary — it is the intersection of `MIN_DEPTH_USD`, `ORDER_SIZE_MAX_USD`, Survival Benchmark `NOTIONAL_USD`, and [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md) §3.6 Alpha Vault Cap.

### 5.2 Execution Timing: Instant vs. In-Flight Bridge State Machine

```text
Arbitrum Native (Instant Path)
──────────────────────────────
User USDC on 42161 → checkSoilResistance() → GMX GM deposit + HL 1× short
 └─ p50 ~106 µs Wasm fuse · sub-second intent-to-gate

Robinhood Escort (Deferred Path)
────────────────────────────────
USDG on 46630 → evaluateAcrossBridgeTransfer() state machine:

 AVAILABLE ──(initiate)──► IN_FLIGHT_BRIDGE_CAPITAL ──(settle)──► SETTLED
 │
 └──(> 1h timeout)──► BRIDGE_TIMEOUT_FAIL_CLOSED
 lostUsd ≡ 0
```

| State | `capitalLabel` | Deployable? | `lostUsd` |
|-------|----------------|-------------|-----------|
| Pre-bridge | `AVAILABLE` | No (not on Arb yet) | **0** |
| In transit | `IN_FLIGHT_BRIDGE_CAPITAL` | **No** — naked positions forbidden | **0** |
| Settled | `SETTLED` | Yes — full Citadel envelope | **0** |
| Timeout | `BRIDGE_TIMEOUT_FAIL_CLOSED` | **No** — fail-closed severance | **0** |

**Code SSOT:** `evaluateAcrossBridgeTransfer()` in `src/adapters/across-ingress-bridge.ts` · Vitest **6/6 PASS**.

**Settlement latency honesty (Invariant #6):** GMX async settlement **3–5 min** · HL withdrawal **~15 min** · Across bridge escort **≤ 1 h** before timeout fail-closed. Arbitrum-native ingress bypasses bridge latency entirely but retains GMX/HL settlement windows.

### 5.3 When to Use Which Path

| Use case | Recommended path | Rationale |
|----------|-----------------|-----------|
| Existing Arb USDC / GM positions | **Arbitrum Native** | Zero bridge latency · instant soil gate |
| Robinhood USDG institutional earn + compliance escort | **Robinhood Escort** | Outbound-only AML isolation · honest in-flight accounting |
| Storm / sequencer grace / 3σ halt | **Neither opens new risk** | `signingChannelOpen: false` · both paths fail-closed |

---

## 6. Institutional Compliance Alignment (Basel Accords Mapping)

> **Disclaimer:** This mapping is an **architectural alignment narrative** for grant committees and institutional due diligence — not a claim of regulatory certification. SliverVine Protocol implements controls that **rhyme with** Basel III operational-risk and ICAAP stress-testing principles.

### 6.1 Basel III Operational Risk → Citadel Fail-Closed Controls

| Basel III concept | SliverVine Protocol control | Code / test anchor |
|-------------------|-------------|-------------------|
| **Internal control environment** | Unidirectional `SystemState` · no orphan venue legs (R09 Saga) | `intent-ledger.ts` · `tests/risk-control/*` |
| **Risk assessment** | Pre-execution `checkSoilResistance()` — depth, spread, slippage | `soil-resistance.ts` · `pkg/soil_core.wasm` |
| **Control activities** | Session-key scope (`ORDER_EXECUTE` only) · notional cap R07 | `session-key-gates.ts` · `SESSION_KEY_NOTIONAL_CAP_USD` |
| **Monitoring & reporting** | `GET /api/grant-audit` · [Dune PEV dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · 96h telemetry daemon | `pnpm telemetry:96h` · [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) |
| **Fail-safe severance** | R17 daily loss · R20 physical deadlock · signing channel close | `circuit-breaker.ts` · `flatten-hardlock.ts` |

### 6.2 `lostUsd ≡ 0` → Principle of Honest Loss Recognition

Basel operational-risk frameworks require that **pending/settlement exposures are not mis-booked as realized losses**. SliverVine Protocol enforces this as a **hard invariant**:

```typescript
// src/adapters/across-ingress-bridge.ts — lostUsd is always 0 until explicit timeout labeling
lostUsd: number; // Always 0 — pending bridge liquidity is never booked as loss.
```

| Accounting state | Booked loss | Basel analog |
|------------------|-------------|--------------|
| `IN_FLIGHT_BRIDGE_CAPITAL` | **$0** | Settlement pending — not operational loss event |
| `BRIDGE_TIMEOUT_FAIL_CLOSED` | **$0** (capital state unknown, not written off) | Process failure → control trigger, not P&L recognition |
| Soil trip / R17 severance | Bounded by Dynamic Account Risk Ceiling (V0.8 Baseline: Equity-Weighted SL; V1.0 Mainnet: Dynamic Adaptive Engine) | Loss limit framework |

### 6.3 Stress Testing → Survival Benchmark & Dry-Run Matrix

| Basel ICAAP element | SliverVine Protocol harness | Frequency |
|---------------------|-------------|-----------|
| **Historical simulation** | Survival Benchmark 30D HL funding + L2 book | On-demand (`generate-survival-report.ts`) |
| **Stress scenarios** | $100k canonical + **$1M** stress notional (`STRESS_NOTIONAL_USD`) | Same report |
| **Reverse stress** | Negative proofs — depth breach, soil trip, bridge timeout | `pnpm verify:negative` |
| **Multi-leg cascade replay** | HF breach · velocity spike · GM LP imbalance · delta drift (GMX · HL · AAVE) | `npx vitest run tests/core/portfolio-cascade-replay.test.ts` **4/4** |
| **Model validation** | Vitest **225 test files | 1052 PASS clean (100%)** full regression | CI / pre-release |

### 6.4 Three Lines of Defense Mapping

| Line | SliverVine Protocol layer | Examples |
|------|-----------|----------|
| **1st — Business / Ops** | Yield hurdle · rebalance rules · buffer engine (5–10% pre-hedge) | `rebalance-rules.ts` · `buffer-engine.ts` |
| **2nd — Risk / Compliance** | Soil resistance · PGATE · sequencer/oracle guards · bridge AML isolation | R01–R20 matrix (§3) |
| **3rd — Internal Audit** | Grant audit matrix · negative proofs · Survival Benchmark artifact | `pnpm audit:grant` · `docs/audit/*` |

### 6.5 ArbOS Elara Compliance Alignment & Dynamic Target Range

> **V1.0 Design Spec (on-chain reinforcement plane).** Edge (Cloudflare) remains the pre-broadcast SSOT; **ArbOS Elara upgrade** natively aligns **Pillar Set X AML Firewall** with protocol-level compliance filtering and **transaction-ordering awareness** — never a weaker substitute for Edge fail-closed gates.

| Layer | Compliance function | Transaction-ordering awareness | Status |
|-------|---------------------|-------------------------------|--------|
| **Edge Citadel (SSOT)** | `checkSoilResistance()` · R01–R20 · signing channel severance | Pre-broadcast intent ordering · UserOp gate before bundler | ✅ v1.0 Delivered (Sepolia verified) |
| **Pillar Set X AML Firewall + ArbOS Elara** | Outbound-only Robinhood escort · `AML_INBOUND_TO_ROBINHOOD_BLOCKED` · Elara ingress drops non-compliant / blacklisted senders before GM payload construction | Sequencer / ArbOS ordering sensor alignment · complements **`IngressSafetySwitch.sol`** | ⏳ V1.0 Design Spec ([`04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos-stylus-alignment-code-verified-on-chain-coprocessor)) |
| **UI reactive HUD** | `LivingWaterShieldCard` · `AMLShieldCard` · `SmartRoutingDepositCard` tranche switcher | Trip banners · Tranche A native vs Tranche B bridge state machine | ✅ v1.0 UI SSOT |

**Dynamic Target Range (non-guaranteed yield band):**

| Parameter | Locked value | SSOT |
|-----------|--------------|------|
| **Dynamic Target Range** | **8.2% ~ 11.8% APY** (display band · not a guarantee) | `App.tsx` · DDIP §5.6 |
| **Hurdle Gate (friction buffer)** | **+0.5%** (`FRICTION_BUFFER_APY = 0.005`) — rebalance / performance fee only above friction-adjusted excess | `rebalance-rules.ts` |
| **Performance hurdle (planned)** | Aave benchmark + 1.5% before fee crystallization *(Hurdle-rate probe only — not a yield-stacking product track)* | Invariant #24 · #59 (⏳) |

```text
Net deployable excess = observed_yield − (Aave_base + FRICTION_BUFFER_APY)
Rebalance allowed ⇔ excess ≥ FRICTION_BUFFER_APY // Hurdle Gate
UI display band = 8.2% ~ 11.8% Dynamic Target Range (Non-Guaranteed)
```

**Design rule (Elara):** Elara ingress filtering and ArbOS transaction-ordering awareness **reinforce** Edge fail-closed — they do not bypass `signingChannelOpen: false`, `BRIDGE_TIMEOUT_FAIL_CLOSED`, or `ORACLE_LAG_DEADLOCK` severance.

---

## 7. Verification & Related Documents

### 7.0 Audit Walkthrough — Code Anchors (Grant Evaluators)

Evaluators should trace claims in this document to the following SSOT paths:

| Pillar | Claim | Code SSOT | Test Anchor |
|--------|-------|-----------|-------------|
| **Bridge accounting** | `IN_FLIGHT_BRIDGE_CAPITAL` · `lostUsd ≡ 0` | [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) | [`tests/adapters/across-ingress-bridge.test.ts`](../../tests/adapters/across-ingress-bridge.test.ts) (6/6) |
| **ZeroDev AA gate** | Citadel risk gate before UserOp · failover · gas ledger | [`src/adapters/arbitrum/zerodev-aa/zerodev-aa-gate.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-gate.ts) (`zerodev-aa/zerodev-aa-gate.ts`) | [`tests/adapters/zerodev-aa-gate.test.ts`](../../tests/adapters/zerodev-aa-gate.test.ts) |
| **Smart Routing calldata** | USDG → GMX `ExchangeRouter` · `payloadHash()` binding · **Reference Harness** (production baseline = Arbitrum One Native Ingress) | [`src/services/adapters/gmx-smart-route-payload-binding.ts`](../../src/services/adapters/gmx-smart-route-payload-binding.ts) | [`tests/adapters/gmx-smart-route-payload-binding.test.ts`](../../tests/adapters/gmx-smart-route-payload-binding.test.ts) |
| **Wasm Soil Shield** | p50 ~106 µs pre-execution fuse | [`src/services/risk-control-lib/soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) · [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm) | `tests/risk-control/*` |

**ZeroDev AA execution path (read order):**

```text
zerodev-aa-gate.ts → evaluateStaticBreakerMatrix() + Citadel risk gate
 ├─ zerodev-aa-failover.ts → Arbitrum One health / AA probe route
 ├─ zerodev-aa-static-breaker.ts → soil + gas sponsorship limits
 └─ zerodev-aa-userop.ts → Paymaster + bundler dispatch (after gate PASS)

gmx-smart-route-payload-binding.ts → buildGmxSmartRoutePayloadBinding()
 └─ gated-executor-payload.ts → computeGatedExecutorPayloadHash() → SliverVineGate
```

> **Note:** `zerodev-aa-gate.ts` is an opt-in CLI/SDK Citadel risk gate — not mounted on the Worker hot path. Production soil fuse remains `checkSoilResistance()` on Edge.

| Check | Command / Surface | Expected |
|-------|-------------------|----------|
| Full regression | `pnpm test -- --run` | **225 test files | 1052 PASS clean (100%)** |
| Bridge invariants | `pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts` | **6/6 PASS** |
| Live audit | `GET /api/grant-audit` | `lostUsd: 0` · guard states exposed |

> **Full verification matrix:** [`docs/VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) — Express → Hybrid Pillar Sets X & Y Inside → Outside

| Document | Purpose |
|----------|---------|
| [`../../JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md) | 1-page executive brief for Buildathon evaluators |
| [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) | CLI Tier 0–5 verification hub |
| [`01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md) | Yellow Paper — Triangle Liquidity Loop · settlement |
| [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md) | R01–R20 Defense Matrix · Wasm soil core |
| [`04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md) | ERC/EIP alignment · ArbOS Elara compliance |
| [`../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) | Pillar Set X Compliance Ingress Firewall Audit |
| [`../sdk/01_SDK_INTEGRATION_BLUEPRINT.md`](../sdk/01_SDK_INTEGRATION_BLUEPRINT.md) | `@slivervine/eip1193-agentic-wallet-guard` integration |
