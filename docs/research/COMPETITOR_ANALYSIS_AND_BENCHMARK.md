# SilverVine Citadel Protocol — Competitor Analysis & R&D Benchmark Matrix

| Field | Value |
|-------|-------|
| **Classification** | R&D Research · Non-production SSOT |
| **Branch** | `research/competitor-benchmark-and-rd` |
| **Baseline HEAD** | `main` @ `2d7426c` (Core Sinking · `DefenseMatrixError` tier fix · USD.ai pure-function boundary) |
| **Test SSOT** | **199 test files \| 868 PASS** · `tsc --noEmit` **0 errors** |
| **Worker Bundle** | **50.83 KiB gzip** · **143.47 KiB raw** · `limitKiB: 150` · `pass: true` |
| **Document Version** | v1.0 · 2026-09-07 |
| **Maintainer** | SilverVine Labs R&D |

> **Scope Statement:** This document is for internal R&D and competition strategy only. Competitor capabilities are assessed against public documentation, official SDKs, and industry baselines; it **does not** modify `main` core invariants or production paths. Traditional Chinese reference: [`COMPETITOR_ANALYSIS_AND_BENCHMARK_ZH.md`](./COMPETITOR_ANALYSIS_AND_BENCHMARK_ZH.md).

---

## 0. Executive Summary

SliverVine Citadel Shield is positioned as a **Pre-Consensus Intent Firewall** — a sub-millisecond circuit breaker **before** intents enter the Sequencer / Bundler / Mempool — not as a Keeper execution layer, AVS attestation layer, or Agent framework itself.

| Dimension | Citadel Differentiation | Primary Competitor Weakness |
|-----------|-------------------------|----------------------------|
| **Latency / Reflex Gate** | Edge Wasm **p50 ~106 µs** · 0-Gas off-chain severance | Gelato Keeper **2–15 s** RPC polling + on-chain execution latency |
| **Risk Model** | **28-lane** `PROTO_VECT_LEN` bitmask · Soil R01–R20 · Clock SSOT 30s hard trip | Standard Stop-Loss / HF Oracle **reacts post-fill or next block** |
| **AA Integration** | ZeroDev Kernel **ERC-7579 TYPE(4) Pre-execution Hook** narrative + decoupled off-chain Shield | Biconomy / Safe **multisig and post-hoc validation**, not sub-ms intent fuse |
| **AI Agent** | In-repo Native Guard · `evaluateAgentCitadelGuard()` · per-framework demo CLI (`pnpm demo:{wayfinder,elizaos,virtuals,langchain}`) | ElizaOS / Virtuals **plugin ecosystem**, no unified 28-lane soil fuse |

**R&D Conclusion:** Citadel holds a structural advantage in **latency magnitude (10⁴–10⁵×)** and **pre-intent fuse semantics**; competitors retain moats in **on-chain composability (AVS)**, **Keeper network effects (Gelato)**, and **Agent distribution (npm ecosystem)**. Highest marginal score this season comes from **on-chain evidence (GM fill · Dune 42161)**, not from adding more adapters.

---

## 1. Research Methodology & Scoring Rubric

### 1.1 Control Group Selection

| Competitor Category | Representative Products | Selection Rationale |
|--------------------|-------------------------|---------------------|
| **Keeper / Automation** | Gelato Web3 Functions · Automate · dedicated Keeper bots | DeFi automation execution baseline; orthogonal to Citadel "pre-execution safety" |
| **Restaking / Coprocessor** | EigenLayer AVS · Othentic / Brevis coprocessor narratives | On-chain verifiable compute trend; auditors often ask "why not AVS" |
| **AA Infrastructure** | Biconomy Smart Accounts · Safe{Wallet} + modules | Institutional multisig and modular AA mainstream path |
| **AI Agent Frameworks** | ElizaOS · Virtuals GAME | Direct Buildathon track competitors; highest judge familiarity |

### 1.2 Scoring Dimensions (1–5)

| Score | Definition |
|-------|------------|
| **5** | Category-leading · reproducible benchmark or mainnet evidence |
| **4** | Production-ready · complete docs/SDK |
| **3** | Usable but clear latency/risk/integration gaps |
| **2** | PoC or third-party dependent |
| **1** | Dimension not covered |

---

## 2. Dimension A — Latency & Reflex Gate

### 2.1 Technical Comparison

| Metric | **SilverVine Citadel** | **Gelato / Keeper Vaults** | **Typical RPC Polling Bot** |
|--------|------------------------|----------------------------|-----------------------------|
| **Decision Location** | Cloudflare Edge · `checkSoilResistance()` | Gelato Executor · on-chain `check` + `exec` | Self-hosted bot · `eth_call` polling |
| **p50 Latency** | **~106 µs** (TS Gateway + Wasm) | **~2–8 s** (trigger + schedule + execute) | **~2–15 s** (block time + RPC RTT) |
| **Warm Wasm Start** | **< 60 µs** (`soil_core.wasm` < 28 KiB) | N/A (no Wasm hot path) | N/A |
| **Trip Timing** | **Pre-broadcast** · intent never enters mempool | **Post-condition** · execute after condition met | **Post-event** · after price/time trigger |
| **Gas Cost (trip)** | **0-Gas** off-chain severance | Gas per execution | Gas per tx |
| **Failure Mode** | Fail-closed · `FLAGS_SEVERED` · R20 channel sever | Revert on-chain · possible partial execution | Slippage expansion · MEV sandwich window |

### 2.2 Order-of-Magnitude Illustration

```text
Keeper / Gelato path:     [poll 2s]──[detect]──[submit tx]──[block 250ms–2s]──[settle]
Citadel Shield path:      [106µs soil]──► ALLOW / SEVER (no broadcast)

Speed ratio (order of magnitude): 10⁴ – 10⁵× faster decision vs polling keepers
```

### 2.3 R&D Scores

| Product | Latency | Pre-consensus | 0-Gas sever | **Subtotal** |
|---------|---------|---------------|-------------|--------------|
| **Citadel Shield** | 5 | 5 | 5 | **5.0** |
| Gelato Automate | 2 | 1 | 1 | **1.3** |
| Generic Keeper | 2 | 1 | 1 | **1.3** |
| EigenLayer AVS (on-chain verification) | 2 | 3 | 2 | **2.3** |

**Citadel Strength:** Only solution placing the **reflex arc** **pre-broadcast** with a **sub-ms** reproducible benchmark.  
**Citadel Weakness:** Does not replace Keeper **execution**; must compose with Gelato/self-hosted keepers (Shield = front insurance, Keeper = executor).

---

## 3. Dimension B — Risk Model

### 3.1 Architecture Comparison

| Capability | **Citadel** | **Standard Stop-Loss / HF Oracle** |
|------------|-------------|-------------------------------------|
| **State Representation** | `Float64Array(PROTO_VECT_LEN=28)` · protocol bitmask | Single price / HF scalar |
| **Protocol Coverage** | GMX · Pendle · Uniswap · Aave · Morpho · USD.ai · HL · Variational (7+1 venues) | Usually single-protocol or single metric |
| **Defense Matrix** | R01–R20 · `FLAGS_AUTO_SEVER_MASK` · auto severance | No standardized matrix |
| **Clock SSOT** | `USDAI_CLOCK_SKEW_MAX_MS = 30_000` · `resolveUsdAiClockSsotPure()` | Relies on on-chain `block.timestamp` or bot local clock |
| **Slippage / Depth** | Soil lane · orderbook gap · cross-venue TWAP | Fixed % stop or liquidation line |
| **Core Sinking** | 5 modules `src/core/*` pure invariant SSOT | N/A |

### 3.2 Bitmask vs Traditional Risk Controls

```text
Traditional:  IF price < stop THEN sell (often AFTER adverse move)
Citadel:      packProtocolLane() → evaluateFlags() → SEVER before sign/broadcast
              Clock skew > 30s → CLOCK_SKEW_EXCEEDED (fail-closed)
```

| Attack / Scenario | Stop-Loss / HF | Citadel Soil |
|-------------------|----------------|--------------|
| Oracle lag spoofing | High risk (lag window) | `USDAI_ORACLE_STALE` · max age 2h |
| Cross-protocol cascade | Usually unmodeled | Cross-guard · pending OI 30s window |
| Session key replay | Non-standard coverage | `verifySessionKeyValidity()` · nonce guard |
| MEV sandwich (post-broadcast) | Cannot prevent | **Pre-broadcast only**; post-ALLOW sandwich still possible |

### 3.3 R&D Scores

| Product | Multi-protocol bitmask | Clock / anti-spoof | Test regression | **Subtotal** |
|---------|------------------------|--------------------|-----------------|--------------|
| **Citadel** | 5 | 4 | 5 (868 PASS) | **4.7** |
| Aave HF liquidator | 2 | 3 | 3 | **2.7** |
| GMX keeper stop | 2 | 2 | 3 | **2.3** |
| EigenLayer AVS risk module | 3 | 3 | 2 (on-chain primary) | **2.7** |

**Citadel Strength:** **28-lane** vector + **R01–R20** is the hardest institutional narrative asset; Clock SSOT sunk to pure core (`2d7426c`).  
**Citadel Weakness:** Wasm FFI still **24-slot** narrative vs `PROTO_VECT_LEN=28` **partial closure**; multi-Worker `protocolMask` not shared — **Residual HIGH**.

---

## 4. Dimension C — Account Abstraction

### 4.1 Integration Model Comparison

| Item | **Citadel + ZeroDev Kernel v3** | **Biconomy** | **Safe + Modules** |
|------|----------------------------------|--------------|---------------------|
| **Standard** | ERC-4337 · **ERC-7579** TYPE(4) Hook | ERC-4337 · Nexus / MEE | ERC-4337 / multisig |
| **Hook Timing** | **Pre-execution** (spec-level) · off-chain Shield **before** UserOp | Paymaster + middleware | Module `execTransaction` before/after |
| **Latency** | Shield **106 µs** decoupled from AA | Bundler path **seconds** | Multisig collection **minutes** |
| **Session Key** | HL EIP-712 · consume-once nonce | Biconomy session keys | Safe roles module |
| **Implementation Status** | Citadel **native adapter** · dry-run primary | Production npm SDK | Widely deployed |
| **On-Chain Hook Deploy** | **OPEN** (spec + off-chain gate) | Integration-dependent | Module deployed |

### 4.2 Semantic Difference (Key)

```text
Biconomy/Safe:  "Who may sign / pay gas / which contract"
Citadel:        "Should this calldata be signed at all" (sub-ms, pre-broadcast)

Orthogonal layers — Citadel is NOT a replacement AA wallet; it is a Pre-execution Safety Citadel.
```

### 4.3 R&D Scores

| Product | ERC-7579 alignment | Pre-exec semantics | Production deploy | **Subtotal** |
|---------|-------------------|--------------------|--------------------|--------------|
| **Citadel + ZeroDev** | 4 | 5 | 2 | **3.7** |
| Biconomy | 3 | 2 | 5 | **3.3** |
| Safe + Modules | 2 | 2 | 5 | **3.0** |

**Citadel Strength:** Only solution explicitly writing **ERC-7579 TYPE(4) Pre-execution Hook** and **106 µs off-chain Shield** into one narrative stack.  
**Citadel Weakness:** Not an official npm ZeroDev plugin; on-chain Hook **not installed** in Kernel module slot — auditors deduct **production deploy** points.

---

## 5. Dimension D — AI Agent Framework Integration

### 5.1 Integration Depth Comparison

| Capability | **Citadel Native** | **ElizaOS** | **Virtuals GAME** |
|------------|-------------------|-------------|-------------------|
| **Integration Form** | In-repo adapter · `evaluateElizaCitadelAction()` | Plugin ecosystem · npm distribution | GAME Worker task guard |
| **Strategy Execution Point** | `checkSoilResistance()` **pre-broadcast** | Action handler (plugin-dependent) | Before task evaluation |
| **Policy Guard** | `SliverVineAgentPolicyGuard.sol` · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) | Community plugin quality varies | GAME SDK conventions |
| **Unified Risk Control** | 28-lane soil · 7 venue matrix | Plugin-dependent | Integration-dependent |
| **CLI Reproducibility** | `pnpm demo:{elizaos,virtuals,wayfinder,langchain}` | Community examples | Official docs |
| **Official npm Package** | **OPEN** (V1.1 Open PR Spec) | **Published** | **Published** |

### 5.2 Framework Path Comparison

```text
ElizaOS / Virtuals default path:
  LLM intent (~1–10s) → framework action → [optional guard?] → broadcast

Citadel path:
  LLM intent (~1–10s) → evaluateXxxCitadelAction() → soil 106µs → ALLOW/SEVER → broadcast
```

| Dimension | Citadel | ElizaOS / Virtuals |
|-----------|---------|---------------------|
| LLM latency | Not optimized (not the battlefield) | Not optimized |
| Deterministic fuse | **Core** | Not core |
| Ecosystem distribution | Weak (in-repo) | **Strong** |
| Audit reproducibility | **868 PASS + demo CLI** | Plugin-author dependent |

### 5.3 R&D Scores

| Product | Pre-broadcast guard | Multi-protocol soil | Ecosystem distribution | **Subtotal** |
|---------|---------------------|----------------------|------------------------|--------------|
| **Citadel** | 5 | 5 | 2 | **4.0** |
| ElizaOS + community plugin | 2 | 2 | 5 | **3.0** |
| Virtuals GAME | 2 | 2 | 5 | **3.0** |
| Gelato + Agent (execution-oriented) | 1 | 1 | 4 | **2.0** |

**Citadel Strength:** **Native Agent Policy Guard** + multi-framework **isomorphic** `checkSoilResistance()` — judges can verify via **targeted per-venue `--trip` demos** (`pnpm demo:gmx` · `pnpm demo:variational` · `pnpm demo:hl`).  
**Citadel Weakness:** **No official npm**; ElizaOS / Virtuals auditors ask "why not use existing plugins" — requires V1.1 Open PR closure.

---

## 6. Composite Competitor Matrix (Radar Summary)

| Dimension (1–5) | Citadel | Gelato/Keeper | EigenLayer AVS | Biconomy/Safe | ElizaOS/Virtuals |
|-----------------|---------|---------------|----------------|---------------|------------------|
| A Latency / Reflex | **5.0** | 1.3 | 2.3 | 2.5 | 2.0 |
| B Risk Model | **4.7** | 2.0 | 2.7 | 2.5 | 2.5 |
| C AA Integration | **3.7** | 2.0 | 3.0 | 3.3 | 2.0 |
| D Agent Integration | **4.0** | 2.0 | 2.5 | 2.0 | 3.0 |
| **Weighted Average** | **4.35** | 1.83 | 2.63 | 2.58 | 2.38 |

**Recommended Weights (Buildathon track):** A 30% · B 30% · D 25% · C 15% → **Citadel weighted ~4.28** vs next-best EigenLayer ~2.65.

---

## 7. Competitor Moats vs Citadel Counter-Narratives

| Competitor Moat | Citadel Counter (Pitch Language) |
|-----------------|----------------------------------|
| Gelato **execution network & triggers** | "Citadel does not compete on execution; we sever toxic intents **106 µs before** Gelato triggers fire." |
| EigenLayer **AVS trust & staking** | "AVS attests **already-broadcast** behavior; Citadel is a **Pre-consensus Intent Firewall**." |
| Biconomy/Safe **deployment scale** | "We are the ERC-7579 TYPE(4) **Pre-execution** layer, composable atop existing Kernels." |
| ElizaOS/Virtuals **npm ecosystem** | "In-repo native guard + 868 PASS; V1.1 will Open PR official plugins." |

---

## 8. Known Gaps & R&D Roadmap (No main invariant changes)

| Priority | Gap | Recommended R&D Item | Target Competitor Alignment |
|----------|-----|----------------------|----------------------------|
| **P0** | No 42161 live GM fill | M6 timeline + one Gate-path fill | Gelato execution credibility |
| **P0** | 42161 Dune business events | First `IntentAttested` ingest | Institutional telemetry SSOT |
| **P1** | No ElizaOS/Virtuals npm | `@slivervine/citadel-elizaos` Open PR | Agent ecosystem distribution |
| **P1** | Wasm FFI 24 vs 28 slot | FFI alignment or document TS-only lanes | AVS / Stylus parity |
| **P2** | On-chain ERC-7579 Hook not deployed | Sepolia Kernel module slot PoC | Biconomy deploy narrative |
| **P2** | Multi-Worker protocolMask | DO state sync R&D spike | Keeper-grade consistency |

---

## 9. Reproducible Benchmarks (Citadel SSOT · This branch does not modify code)

```bash
pnpm test -- --run          # 199 files | 868 PASS
pnpm exec tsc --noEmit      # 0 errors
pnpm bundle:measure         # gzipKiB < 51 · pass: true
pnpm demo:gmx -- --trip            # GMX native hard anchor
pnpm demo:variational -- --trip    # Variational multi-venue gate
pnpm demo:hl -- --trip             # Hyperliquid primary path
pnpm demo:elizaos           # Agent framework guard path
```

---

## 10. Reference Documents (main SSOT)

| Topic | Path |
|-------|------|
| Latency / Defense Matrix | `docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md` |
| Three Pillars / ZeroDev | `docs/architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md` |
| Core Sinking | `README.md` · `src/core/*` |
| Verification Matrix | `docs/VERIFICATION_MATRIX.md` |
| Internal audit (score baseline) | `docs/internal/0907_PM_Fresh_30_Persona_Audit.md` |

---

## Appendix A — Glossary

| Term | Citadel Definition |
|------|-------------------|
| **Pre-Consensus** | Intent has not yet entered Sequencer / Bundler / public mempool |
| **Soil Resistance** | `checkSoilResistance()` · Wasm `soil_core.wasm` |
| **Reflex Arc** | 14 µs–106 µs deterministic fuse path |
| **TYPE(4) Hook** | ERC-7579 Pre-execution Hook · `SliverVineRiskOracle.sol` |

---

*Prepared by: SilverVine Labs R&D · Branch `research/competitor-benchmark-and-rd` · `docs/research/COMPETITOR_ANALYSIS_AND_BENCHMARK.md`*
