# Internal Strategic Memo — Post-Grant Commercialization & Q&A Defense

| Field | Value |
|-------|-------|
| **Classification** | **INTERNAL ONLY** · Do not include in public Buildathon submission |
| **Purpose** | Judge Q&A · VC pitch · Post-grant GTM · Turbo RPC commercial boundaries |
| **Buildathon SSOT** | [SUBMISSION.md](../../00_ARB_Buildathon/SUBMISSION.md) · [JUDGE_BRIEF.md](../../../JUDGE_BRIEF.md) |
| **Physical SSOT** | **244 test files \| 1125 PASS** · `pnpm audit:sepsb` · Gate [0xb174…8BF1](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **Chinese edition** | [COMMERCIAL_STRATEGY_AND_QA_PLAYBOOK_ZH.md](./COMMERCIAL_STRATEGY_AND_QA_PLAYBOOK_ZH.md) |

---

## 1. Executive Positioning & Identity Boundary

| Phase | Core Identity | Public Framing | Focus |
|-------|---------------|----------------|-------|
| **Buildathon (Pre-10/01)** | Sub-ms 0-Gas **Pre-Consensus Intent Firewall** | Module A: ExoMesh · Module B: Sanctuary | Verifiable safety · Wasm fail-closed · SEPSB corpus · on-chain anchors |
| **Post-Grant (Commercial GTM)** | **ExoMesh Dual-Engine RPC** (Brake + Turbo) | Infra-first B2B SaaS · Quant agent execution rail | MRR · private relay · API RPS · **Do not merge into submission SSOT** |

**Boundary in one line:** Buildathon sells a **verifiable safety primitive**; post-grant sells a **cleared-intent transport SKU**.

---

## 2. Vision Premise — ExoMesh Turbo RPC

### 2.1 The Gap

| Layer | Incumbent behavior | Gap vs ExoMesh |
|-------|-------------------|----------------|
| **Public RPC** (Alchemy / Infura) | JSON-RPC transport | No pre-sign mandate · no AI intent predicate |
| **MEV Private Relay** (Flashbots / bloXroute) | Anti-sandwich · private bundles | Assumes payload **already signed** · does not validate toxic calldata / retry storms |
| **UI Simulator** (Blockaid, etc.) | 200–800ms remote simulation | Human-popup bound · not the primary path for high-frequency API-driven agents **before** sign |

**Precise gap statement (external-safe):**

> No dominant vendor offers a **single Dual-Engine SKU** combining **EIP-1193+ pre-sign hook SSOT**, **Edge/Wasm sub-ms predicates**, **0-Gas fail-closed**, and **private relay pass-fast**.

**Humility clause:** Safe modules · AA session keys · agent frameworks provide **partial** policy — mostly post-policy or on-chain modules, not unified pre-consensus severance + 28-lane soil.

### 2.2 Dual-Engine Model

```text
[ Agent / dApp Intent ]
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  EIP-1193+ SINGLE GUARD PLANE (withRetailGuardProvider) │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
 [ FAIL_CLOSED: BRAKE ]            [ PASS_FAST: TURBO ]
 Sub-50µs Wasm deadlock             <5µs routing overhead (sync prep)
 0-Gas severance (no broadcast)     Private relay / preconf gateway
 severSigningChannel()              Dynamic maxPriorityFeePerGas (optional)
```

| Engine | Buyer | Value |
|--------|-------|-------|
| **Brake** | Risk Officer · Treasury · Agent infra | False-negative → capital loss · 0-Gas reject before sign |
| **Turbo** | Quant desk · HFT agent | Pass latency · private inclusion · acceleration **only** for predicate-cleared intents |

**Commercial logic:** Security sells insurance against what *doesn't* happen; Performance sells what happens *immediately* — but **Turbo must not detach from Brake policy**, or you accelerate toxic transactions.

---

## 3. Q&A Playbook — "Brake + Turbo" Monetization

### Q: "How does SliverVine monetize without absurd B2B governance fees?"

**Authoritative answer (~90s):**

> **"SliverVine monetizes through a Dual-Engine Architecture sharing a single EIP-1193+ Pre-Sign Guard Plane (`withRetailGuardProvider`):**
>
> 1. **Fail-Closed Brake (Risk Layer)** — Sub-50µs Wasm 0-Gas circuit breaking (`checkSoilResistance()`). Halts LLM retry storms, prompt-injection approvals, and oracle-lag traps **before** signature release.
>
> 2. **Pass-Fast Turbo (Performance Layer)** — When an intent passes validation, verified intents enter a microsecond private forwarding lane (<5µs sync routing overhead) with optional dynamic priority fee injection — **not** public mempool blind transport.
>
> **Commercial logic:** Risk Officers buy the **Brake**; Quant Traders buy the **Turbo**. We monetize Pass-Fast transport via B2B SaaS tiers and metered API keys, while keeping the open-source security core free for ecosystem adoption."

**Internal monetization split:**

- **Free Brake** = acquisition · Grant narrative · agent adoption as marketing  
- **Paid Turbo** = relay seat · RPS · priority-fee API · **only claim in public spec after live relay partner**

---

## 4. Structural Moat — Why Competitors Cannot Easily Stitch This

| Dimension | Legacy RPC | MEV Relay | UI Simulator | **ExoMesh Dual-Engine** |
|-----------|------------|-----------|--------------|-------------------------|
| **Pre-sign mandate** | ❌ Blind transport | ❌ Post-sign bundle | ⚠️ Post-simulation warning | ✅ Sub-ms Edge bitmask predicates |
| **0-Gas severance** | ❌ Revert burns gas | ❌ Revert burns gas | ❌ N/A | ✅ `severSigningChannel()` · no broadcast |
| **Pass-fast transport** | ❌ Public queue | ✅ Private bundle | ❌ N/A | ✅ Post-validation private forward |
| **Trust boundary** | Split transport | Split transport | Split simulation | ✅ **Single guard plane** (policy + relay decision) |

**Moat integrity:** Stitching a third-party simulator onto an MEV relay stacks **100–300ms** latency. ExoMesh's moat is executing **Brake evaluation and Turbo routing in the same local Wasm / Isolate memory space**.

**Fundamental thesis (Module A SSOT):**

> Simulation answers *"What will this tx do on-chain?"* The Wallet Guard answers *"Is this invocation allowed under the user's declared mandate?"* **before** any cryptographic commitment — a reflex arc, not a retrospective audit.

→ See [05_ARCHITECTURE_AND_MOAT.md](../../04_sdk_and_integration/05_ARCHITECTURE_AND_MOAT.md)

---

## 5. Product Identity Separation — Why Buildathon Must Not Lead With Turbo RPC SaaS

| Dimension | Buildathon / Grant | Post-Grant Turbo RPC |
|-----------|-------------------|----------------------|
| **Judges verify** | `pnpm demo:gmx -- --trip` · SEPSB · Gate anchors | Relay SLA · inclusion rate · uptime |
| **Liability model** | "We block toxic intents" | "We forward your tx" → operator liability |
| **Freeze** | Phase-4 guard semantics locked | Transport + fee market fast iteration |
| **Honesty** | 88%/12% · execution ≠ guard | Requires signed relay partner + live metrics |

**Forbidden in public docs (Pre-10/01):**

- Claim live Turbo Relay SLA / inclusion guarantees  
- Read SEPSB fixture TPR/FPR as mainnet intercept rate or live PnL  
- Frame Module B Robinhood narrative as "integrated Robinhood App product"

**Allowed in post-grant commercial deck:**

- ExoMesh Turbo RPC as separate GTM · shared guard kernel  
- Pricing tiers · design partners · relay partner list (post-contract)

---

## 6. SEPSB TPR / FPR — Internal Disclosure Discipline

| Metric | Definition | SSOT |
|--------|------------|------|
| **TPR** | Share of **toxic** corpus cases that received **block** | 16/16 → 100% |
| **FPR** | Share of **benign** corpus cases wrongly **block**ed | 0/15 → 0% |
| **Corpus** | `tests/p0/corpus/toxic-set.json` + `benign-set.json` | **31 cases** · not live traffic |

**Run:** `pnpm audit:sepsb` → [SEPSB_BENCHMARK_SSOT.json](../../audit/SEPSB_BENCHMARK_SSOT.json)

**External honesty line:**

> SEPSB is a deterministic regression benchmark — **not** mainnet annual attack count · **not** monthly live intercept SSOT.

**Common misread:** "16 toxic = only 16 attacks per year" → **Wrong**. 16 = **scenario types**; live frequency depends on agent volume and market conditions (monthly 0 to hundreds of distinct trip events).

---

## 7. Operational Boundaries & Disclosure Principles

### 7.1 Strict Decoupling

- Buildathon judging: cite **only** Module A/B verifiable proofs  
- Turbo narrative: **only** in internal pitch · post-grant deck · customer NDA  
- If `EXOMESH_PRODUCTION_SCENARIO_CATALOG.md` cites TPR/FPR from `pnpm test -- --run` → internal note: physical source is `pnpm audit:sepsb`

### 7.2 One-Fish-Two-Eats (Correct Split)

| Can multi-use | Cannot multi-use |
|---------------|------------------|
| Same kernel · multiple narratives (Buildathon + Grant + VC) | Prize money + procurement + MRR on the same clock |
| Module A docs + internal Turbo deck share guard plane | Write Turbo into SUBMISSION as production-ready |
| SEPSB + Dune dual-dashboard partition | Treat demo telemetry as live PnL |

### 7.3 Post-Grant GTM Sketch (Non-Binding)

| Tier | Surface | Indicative pricing |
|------|---------|-------------------|
| **Public** | Brake OSS · 5 RPS gateway | $0 |
| **Pro** | Turbo relay · seat · KV API | $10–$199/mo |
| **Enterprise** | Custom policy pack · SLA · dedicated relay | $499–$1,999/mo |

---

## 8. Internal FAQ — Quick Counter-Punch

| Question | Internal answer |
|----------|-----------------|
| vs Flashbots? | Flashbots optimizes **inclusion**; we enforce **pre-sign** intent compliance; Turbo forwards **PASS** intents only |
| vs Blockaid? | Blockaid = post-hoc simulation; we = pre-consensus mandate · 0-Gas reject |
| Why not pitch Turbo at Buildathon? | Judges score safety primitive; Turbo = transport operator · two product identities |
| Robinhood product possible? | Module B = egress policy adapter · **not** in-app Robinhood feature · procurement measured in years |
| Which venue to deepen post-grant? | **Option 1:** GMX deep well (on-chain rebate) · **Option 2:** Pendle Shield (B2B policy) · **Option 3:** Five-venue shared policy pack |

---

*SilverVine Labs · Internal OpSec · DO NOT PUBLISH NATIVELY · Last updated: 2026-09-15*
