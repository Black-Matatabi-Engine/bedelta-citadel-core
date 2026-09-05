# SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) — Verification Matrix (Buildathon / Grant Evaluators)

**Official Name:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)
> **Pitch SSOT:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) is a Sub-ms 0-Gas Pre-Broadcast Safety Citadel & Risk Navigator for AI Agents on Arbitrum.
**Entity:** SilverVine Labs · **Contact:** `grants@silvervinelabs.com`
**Live:** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · `GET /api/grant-audit`
**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)

> **Vitest SSOT:** **191 test files | 831 PASS Clean (100% PASS)** on `pnpm test -- --run`. Forge **60/60** · Cargo Stylus **9/9** · Property Fuzz **327,675** (`pnpm audit:nightly` / `FOUNDRY_PROFILE=deep`; standard `forge test` = **5,120** = 5×1,024) · ZeroDev AA **Opt-In Pillar 1 · Dry-Run Harness Verified** (Kernel v3 / EntryPoint v0.7 · `USE_ZERODEV_AA` default-off).

**Layout:** **Express Entry → Three Pillars Inside (Core) → Three Pillars Outside (Extended)**. Open this document first — each zone is CLI-reproducible with **zero mainnet signing dependency** unless explicitly noted.

### Absolute SSOT Lock (Evaluator Copy-Paste)

| Field | Locked value | Verify |
|-------|--------------|--------|
| **Official H1** | SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ): Sub-ms 0-Gas Pre-Broadcast Safety Citadel & Risk Navigator for AI Agents on Arbitrum | [`README.md`](../README.md) · [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) |
| **Vitest baseline** | **191 test files \| 831 PASS Clean (100% PASS)** | `pnpm test -- --run` |
| **Auto R20 severance** | `applyAutoSeveranceOnFlags()` — bitmask trips auto-call `severSigningChannel()` | [`risk-severance.ts`](../src/core/risk-severance.ts) · [`tests/core/risk-severance.test.ts`](../tests/core/risk-severance.test.ts) |
| **Sliding-window pending OI** | 30s GMX skew/notional accumulator — split-payload defense | [`pending-exposure-window.ts`](../src/core/pending-exposure-window.ts) |
| **Stylus dual-execution** | `check_soil_resistance_stylus(flags, risk_vector)` · `pnpm build:stylus` | [`stylus_core.rs`](../contracts/stylus-probe/src/stylus_core.rs) · EIP-1967 proxy path in [EIP Wiki](./architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md) |
| **Wayfinder native adapter** | `wayfinderCitadelShieldHook` — soil fuse + 8-dimension intent gate | [`wayfinder-shield.ts`](../src/adapters/wayfinder/wayfinder-shield.ts) · `pnpm demo:wayfinder` |
| **Quad-Agent frameworks** | World's First Pre-Execution Risk Gateway for Wayfinder · ElizaOS · Virtuals · LangChain | [`quad-agent-demo.ts`](../examples/quad-agent-demo.ts) · `pnpm demo:quad` |
| **ElizaOS plugin** | `evaluateElizaCitadelAction()` — Action handler soil fuse | [`elizaos-citadel-plugin.ts`](../src/adapters/elizaos/elizaos-citadel-plugin.ts) · `pnpm demo:elizaos` |
| **Virtuals GAME adapter** | `evaluateVirtualsGameTask()` — GAME Worker pre-broadcast guard | [`virtuals-game-adapter.ts`](../src/adapters/virtuals/virtuals-game-adapter.ts) · `pnpm demo:virtuals` |
| **LangChain Citadel tool** | `CitadelRiskGuardTool` — StructuredTool + LangGraph state-node guard | [`langchain-citadel-tool.ts`](../src/adapters/langchain/langchain-citadel-tool.ts) · `pnpm demo:langchain` |
| **Stabilizer Sepolia adapter** | Universal Cross-DEX Testnet Sandbox on **421614** — 1:1 capacity · de-peg severance · cross-pass routing | `evaluateStabilizerSwapGuard()` · 15% reserve ratio · USDZ >50bps peg guard · 60s LLM cooldown | [`stabilizer-adapter.ts`](../src/adapters/stabilizer/stabilizer-adapter.ts) · `pnpm demo:stabilizer` |
| **Sepolia Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | [Arbiscan Sepolia](https://sepolia.arbiscan.io/address/0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1) |
| **Arbitrum One Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | [Arbiscan One](https://arbiscan.io/address/0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1) |
| **Mainnet Ignition Tx** | `0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6` | [Arbiscan Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Agent SDK decorator** | `withCitadelShield` — zero-touch pre-broadcast wrapper | [`src/sdk/decorator.ts`](../src/sdk/decorator.ts) · [`examples/agent-interceptor-demo.ts`](../examples/agent-interceptor-demo.ts) |
| **Core DEX demos (Tier 1)** | GMX v2 · Hyperliquid · Pendle · Camelot V3 · Radiant · Jones DAO standalone CLIs | [`gmx-demo.ts`](../examples/gmx-demo.ts) · [`hyperliquid-demo.ts`](../examples/hyperliquid-demo.ts) · [`pendle-demo.ts`](../examples/pendle-demo.ts) · [`camelot-demo.ts`](../examples/camelot-demo.ts) · [`radiant-demo.ts`](../examples/radiant-demo.ts) · [`jones-demo.ts`](../examples/jones-demo.ts) · `pnpm demo:{gmx,hl,pendle,camelot,radiant,jones}` |
| **Camelot V3 adapter** | `evaluateCamelotV3SwapGuard()` — CL tick depth · directional dynamic fee · soil fuse | [`camelot-v3-adapter.ts`](../src/adapters/camelot/camelot-v3-adapter.ts) · `pnpm demo:camelot` |
| **Radiant Capital adapter** | `evaluateRadiantLendingGuard()` — HF &lt; 1.15 fail-closed · cross-chain liquidation boundary | [`radiant-lending-adapter.ts`](../src/adapters/radiant/radiant-lending-adapter.ts) · `pnpm demo:radiant` |
| **Hyperliquid L1 session guard** | `evaluateHyperliquidSessionGuard()` — Independent L1 HF Orderbook AppChain · MaxSizePerOrder · rate limit (120/min) · spread > **20 bps** | [`hyperliquid-session-guard.ts`](../src/adapters/hl/hyperliquid-session-guard.ts) · `pnpm demo:hl` |
| **GMX v2 pool invariants** | `verifyGmxPoolImbalance()` · `verifyGmxCollateralReserve()` — imbalance > **0.35** · reserve < **105%** | [`gmx-v2-invariants.ts`](../src/adapters/gmx/gmx-v2-invariants.ts) · `pnpm demo:gmx` |
| **Dune dashboard** | [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) | Public URL |
| **DuneSQL (Sepolia ingest)** | Event streaming verified on Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` (`IntentAttested` · `RiskTripBlocked`) · **PEV** `SUM(blocked_intent_notional_usd)` operational | [`DUNE_DASHBOARD_SPECIFICATION.md`](./telemetry/DUNE_DASHBOARD_SPECIFICATION.md) |
| **DuneSQL (Arbitrum One prod)** | Queries 0–0b feed + chart; Queries 1–3 reconciliation — production SQL targets **ChainID `42161`** | Same spec |
| **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196)** | Emerging Draft (Virtuals Protocol) — **not finalized** | [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) |

> **Note:** Initial mainnet deployment utilizes Bootstrap Ignition Keys (`0x1111…`/`0x2222…`) for public verification without exposing production HSM keys. Key rotation to production multisig is executed via native governance functions.

**Core invariants:** $\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0$ · $\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}$ · $t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s}$ — [Technical Specification §3.1](../architecture/01_TECHNICAL_SPECIFICATION.md#31-microsecond-moats).

**Primary Execution Boundary:** Full Arbitrum Native Multi-Protocol Coverage (GMX v2, Pendle, Camelot V3, Radiant Capital, JonesDAO) + Cross-Chain High-Frequency Orderbook Defense (Hyperliquid L1 Session Key Adapter).

### Tailor-Made Mathematical Invariants (All Six Protocols)

| Protocol | Venue | Physical Boundary | Adapter |
|----------|-------|-------------------|---------|
| **GMX v2** | Arbitrum One | \|OI_long − OI_short\| / PoolTVL > **0.35** · Collateral Reserve < **105%** | `gmx-v2-invariants.ts` |
| **Pendle** | Arbitrum One | \|Yield_current − Yield_oracle\| > **150 bps** | `pendle-pool-factory-adapter.ts` |
| **Camelot V3** | Arbitrum One | Active tick depth · slippage/penalty > **0.50%** (**50 bps**) | `camelot-v3-adapter.ts` |
| **Radiant Capital** | Arbitrum One | Health Factor HF < **1.15** | `radiant-lending-adapter.ts` |
| **Jones DAO** | Arbitrum One | Single-block NAV deviation > **0.30%** (**30 bps**) | `jones-vault-adapter.ts` |
| **Hyperliquid** | Independent L1 HF Orderbook AppChain | MaxSizePerOrder · Rate Limit (120/min) · Spread > **20 bps** | `hyperliquid-session-guard.ts` |

> **OpSec:** Internal simulation reports live under `docs/internal/` only — not linked from public grant packs. No private keys in public docs.

---

## Zone A — 30-Second Express Verification (Fast Track)

### 3-Tier Demo Suite (CLI SSOT)

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 1 — Native Protocols** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:camelot` · `pnpm demo:radiant` · `pnpm demo:jones` · `pnpm demo:matrix` | GMX · HL · Pendle · Camelot V3 · Radiant · Jones DAO · **6-protocol cross-venue matrix** |
| **Tier 2 — Agent Frameworks** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:quad` | Wayfinder · ElizaOS · Virtuals · LangChain · combined quad |
| **Tier 3 — Sandbox & E2E** | `pnpm demo:stabilizer` · `pnpm demo:e2e` | Sepolia Stabilizer · 5-step macro lifecycle |
| **Vitest matrix** | `pnpm demo` | 12 Tri-Pillar ANSI scenarios (`tests/demo/`) |

All standalone CLIs measure latency via `process.hrtime.bigint()` (µs precision).

### Path 1: Instant Monorepo (Recommended — ~3 Seconds)

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (191 files / 831 tests)
```

| Command | Proves | Expected |
|---------|--------|----------|
| `pnpm demo` | Tri-Pillar micro E2E matrix (`tests/demo/`) | **12/12 PASS** · ANSI output |
| `pnpm demo:gmx` | GMX v2 shadow margin · cross-venue slippage · position cap | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:hl` | Hyperliquid session key auth · WS depth guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:pendle` | Pendle PT/YT sentinel · guarded pool factory | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:camelot` | Camelot V3 concentrated liquidity · dynamic fee guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:radiant` | Radiant Capital HF & cross-chain liquidation guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:jones` | Jones DAO vault share-price & sandwich guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:matrix` | Full 6-protocol cross-venue matrix (`--loop=all`) | **6/6 ALLOW** nominal · **6/6 FAIL_CLOSED** trip |
| `pnpm demo:matrix -- --loop=perp` | Delta-neutral perp stack (Pendle → GMX → HL) | **3/3 + Soil** |
| `pnpm demo:matrix -- --loop=spot` | Spot & lending vault loop (Camelot → Radiant → Jones) | **3/3 + Soil** |
| `pnpm demo:matrix -- --healthy-only` | Nominal pre-flight only (no R20 sever) | **ALLOW** |
| `pnpm demo:matrix -- --trip --gmx` | GMX pool imbalance (>0.35) trip variant | **FAIL_CLOSED** |
| `pnpm demo:e2e` | 5-step Citadel ANSI HUD dry-run | `RESULT: E2E OK (5/5)` |
| `pnpm demo:wayfinder` | Wayfinder route interception on Arbitrum `42161` | `ALLOW` · pre-broadcast clearance |
| `pnpm demo:elizaos` | ElizaOS Action handler pre-broadcast guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:virtuals` | Virtuals GAME worker task guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:langchain` | LangChain CitadelRiskGuardTool invoke | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:wayfinder -- --trip` | 0-Gas Fail-Closed soil trip | `FAIL_CLOSED` · 0-Gas intercept |
| `pnpm demo:wayfinder -- --stabilizer` | Sepolia Stabilizer 1:1 stablecoin swap (Wayfinder harness) | `ALLOW` · zero-slippage clearance |
| `pnpm demo:wayfinder -- --stabilizer --trip` | Stabilizer reserve / capacity breach (Wayfinder harness) | `FAIL_CLOSED` · `SOIL_RESISTANCE_TRIP` |
| `pnpm demo:stabilizer` | Standalone Stabilizer Sepolia 1:1 swap guard | `ALLOW` · zero-slippage clearance |
| `pnpm demo:stabilizer -- --trip` | USDZ de-peg + reserve depletion + 60s cooldown | `FAIL_CLOSED` · `MANDATORY_COOLDOWN_ACTIVE` on retry |
| `pnpm demo:quad` | All four AI agent frameworks (Wayfinder · ElizaOS · Virtuals · LangChain) | **4/4 ALLOW** |
| `pnpm demo:quad -- --trip` | Quad-framework toxic soil / hallucination trip | **4/4 FAIL_CLOSED** |
| `pnpm test` | Full Vitest regression bar | **190 test files \| 828 PASS Clean (100% PASS)** |

**`demo:e2e` expected terminal highlights** (GitHub `diff` syntax):

```diff
+  ┌─ SliverVine Citadel Shield ─────────────────────────────────────┐
+  │  Sepolia Gate · p50 ~106µs · Δnet ≡ 0 · lostUsd ≡ 0            │
+  └────────────────────────────────────────────────────────────────┘
+ Step 1: allowedToSign=true · elapsed=106µs · Δnet ≡ 0
+ Step 2: Escort PASS · lostUsd ≡ 0
- AML_INBOUND_TO_ROBINHOOD_BLOCKED (inbound 42161→46630)
! Step 3: uiFeeReceiver (+10 bps)
- Step 5: SOIL_TRIPPED · PHYSICAL_DEADLOCK_TRIGGERED
+ RESULT: E2E OK (5/5)
```

### Path 2: Isolated Docker (Zero Host Node/pnpm)

```bash
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
```

| Command | Proves | Expected |
|---------|--------|----------|
| Default `docker run` | 5-step Citadel **`demo:e2e`** inside container | `[tier0] demo:e2e PASS` |
| `docker run --rm slivervine-citadel pnpm test` | Full Vitest regression (host-free) | **190 test files \| 828 PASS Clean (100% PASS)** |

**Why Docker Path:** Eliminates judge laptop Node version drift, pnpm store corruption, and missing WSL deps — same PASS bar, hermetic container.

---

## Zone A.1 — Dual-Demo Architecture (Tri-Pillar Showcase)

Cloudflare Edge **SaaS gateway** positioning: sub-ms **zero-I/O sync** `checkSoilResistance()` hot-path (**p50 ~106µs**) — independent of AA bundler latency.

### (a) Microsecond Risk Gate Demo Matrix — `pnpm demo`

```bash
pnpm demo
# or: npx vitest run tests/demo/
```

**12 ANSI-readable Vitest scenarios** across GMX v2 · Hyperliquid · Pendle (`tests/demo/*.demo.test.ts`):

| Demo file | Scenarios | Risk surfaces proven |
|-----------|-----------|----------------------|
| [`gmx-v2-agent-flow.demo.test.ts`](../tests/demo/gmx-v2-agent-flow.demo.test.ts) | 4 | Healthy MarketIncrease · toxic price-impact soil trip · Chainlink Data Streams oracle-lag reject + `reduceOnly` delever rescue · 1,000× payload validation benchmark |
| [`hyperliquid-agent-flow.demo.test.ts`](../tests/demo/hyperliquid-agent-flow.demo.test.ts) | 4 | Valid `ApproveAgent` EIP-712 · WS stale / latency >200ms soil trip · expired session key / GateLockout · 1,000× session-key validation benchmark |
| [`pendle-ai-agent-flow.demo.test.ts`](../tests/demo/pendle-ai-agent-flow.demo.test.ts) | 4 | AI guarded pool PASS · 450bps yield-drift MEV reject · 60s TTL stale oracle · 1,000× `validateAIPoolSelection()` benchmark |

| Command | Proves | Expected |
|---------|--------|----------|
| `pnpm demo` | Tri-Pillar micro E2E matrix | **12/12 PASS** · colorful ANSI console output |

### (b) Macro Lifecycle E2E Suite — `pnpm demo:e2e`

```bash
pnpm demo:e2e
```

| Command | Proves | Expected |
|---------|--------|----------|
| `pnpm demo:e2e` | 5-step cross-venue agent hedge & circuit breaker | `RESULT: E2E OK (5/5)` |

Steps: Intent + Deadman → Robinhood escort → GMX underweight rebalance → HL session hedge → R20 panic flash unwind.

---

## Zone B — Inside Three Pillars (Core Protocol Invariants)

### Pillar 1 — Gatehouse (Opt-In Account Abstraction & Scoped Auth)

**Command:** `pnpm test:zerodev`

**Definition:** `vitest run tests/adapters/zerodev-aa-dryrun-harness.test.ts`

| Assertion | Status |
|-----------|--------|
| Kernel v3 / EntryPoint **v0.7** UserOp **draft** path | ✅ Dry-run harness verified |
| Session scope + Risk Oracle Gate fail-closed | ✅ Offline / mock bundler |
| Mainnet UserOp broadcast | ⚠️ **Not claimed** (`USE_ZERODEV_AA` default-off) |

**Narrative:** ZeroDev Kernel v3 is an **Opt-In Pillar 1 Account Abstraction Layer** — scoped 30s session keys and Paymaster gas sponsorship ($0.50/op · $10/day). **Pillar 3 Wasm Soil Core** (`pkg/soil_core.wasm` · p50 ~106 µs) and **Pillar 2 Arbitrum Native Ingress** operate **100% independently** of ZeroDev. `zerodev-aa-gate.ts` provides pre-bundler UserOp validation when AA is enabled.

**v1.0 AA scope:** Stage ① Sign-in · ③ Gas · ④ Authorize · ⑤ Execute (Sepolia verified). Stage ② Smart Routing = Reference Harness. Stages ⑥⑦ = Post-Grant Roadmap.

**Read order:**

```text
zerodev-aa-gate.test.ts → assertCitadelRiskGate() + evaluateZeroDevGasGuards()
zerodev-aa-gate.ts → evaluateStaticBreakerMatrix() + Citadel risk gate
 ├─ zerodev-aa-failover.ts → Arbitrum One health / AA probe route
 ├─ zerodev-aa-static-breaker.ts → soil + gas sponsorship limits
 └─ zerodev-aa-userop.ts → Paymaster + bundler dispatch (after gate PASS)
```

---

### Pillar 2 — Compliance Ingress Firewall (Escort Accounting & AML)

**Command:**

```bash
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
```

| Metric | Expected |
|--------|----------|
| Test cases | **5/5 PASS** |
| Escort invariant | `lostUsd ≡ 0` |
| AML isolation | `AML_INBOUND_TO_ROBINHOOD_BLOCKED` — unidirectional 42161→46630 outbound only |

**Narrative:** Robinhood Chain (`46630`/`4663`) Across ingress is a **Pillar 2 Reference Escort Adapter** — not product identity. Inbound AML block enforces fail-closed unidirectional isolation before capital reaches Arbitrum deployable NAV.

Related: [`audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md)

---

### Pillar 3 — SliverVine Citadel Shield (Pre-Consensus Wasm Risk Engine)

| Command | Proves | Expected |
|---------|--------|----------|
| `cd SliverVineGate && forge test` | On-chain Gate · default property fuzz | **60/60 Passed** · **5,120 fuzz** (5×1,024) |
| `pnpm audit:nightly` | Deep fuzz gate (`FOUNDRY_PROFILE=deep`) | **327,675** executions |
| `pnpm audit:fast` / `pnpm audit:security` | TSC · Vitest security · Solhint · Gitleaks · Slither · Aderyn | Fast PASS · Security **5/0/0 PASS** |

**Default forge command:**

```bash
cd SliverVineGate && forge test --gas-report && cd ..
```

**Deep fuzz command:**

```bash
pnpm audit:nightly
# or: cd SliverVineGate && FOUNDRY_PROFILE=deep forge test --match-path 'test/*.fuzz.t.sol' && cd ..
```

| Metric | Default `forge test` | Deep profile (`FOUNDRY_PROFILE=deep` / `pnpm audit:nightly`) |
|--------|----------------------|----------------------------------------------------------------|
| Unit tests | **60 Passed · 0 Failed** | **60 Passed · 0 Failed** |
| Property fuzzing | **5 × 1,024 = 5,120** executions | **5 × 65,535 = 327,675** executions |
| Invariants | **3 × 16,384** stateful calls · 0 counterexamples | same |
| Core | `SliverVineGate.sol` consume-once attestation · gas-bounded `verifyAndConsume` | same |

**Formal Verification — Native Foundry Invariant Tests**

| Invariant | Test anchor | Verify |
|-----------|-------------|--------|
| Replay denial (I6) | `test_I6_Replay_Denies` | `cd SliverVineGate && forge test --match-test test_I6_Replay_Denies` |
| No double-spend | `invariant_NoDoubleSpend` | `cd SliverVineGate && forge test --match-path test/SliverVineGate.invariant.t.sol` |
| Full Gate suite | 60 unit + fuzz + invariant tests | `cd SliverVineGate && forge test` |

**R03 / R04 — RPC & Execution-Lag Telemetry (Provenance)**

| ID | Guard | Fail-closed budget | Code SSOT |
|----|-------|-------------------|-----------|
| **R04** | PGATE Latency / WS jitter | **200ms** | `PGATE_MAX_LATENCY_MS` · `src/adapters/hl/websocket/websocket-health.ts` |
| **R03** | HL L2 book stale / RPC probe | **500ms** | `HL_L2_STALE_THRESHOLD_MS` · `src/services/exchanges/hl-l2-book-lib/hl-l2-book-types.ts` |

Related: [`audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) · [`audit/05_PRINCIPAL_AUDIT_REPORT.md`](./audit/05_PRINCIPAL_AUDIT_REPORT.md)

#### Pendle Institutional Shield (V1.0 Live · Core Pillar 3)

Zero-I/O sync oracle + fail-closed soil wiring within the existing Shield **p50 ~106µs** budget.

```bash
pnpm demo   # 12 Tri-Pillar ANSI scenarios (recommended first)
pnpm exec vitest run tests/adapters/pendle-market-oracle.test.ts
pnpm exec vitest run tests/adapters/pendle-pt-registry.test.ts
pnpm exec vitest run tests/risk-control/pendle-soil-guard.test.ts
pnpm exec vitest run tests/guards/pendle-gmx-cross-guard.test.ts tests/adapters/pendle-pt-expiry-guard.test.ts
pnpm exec vitest run tests/demo/pendle-ai-agent-flow.demo.test.ts
```

| Test file | Proves | Expected |
|-----------|--------|----------|
| [`tests/adapters/pendle-market-oracle.test.ts`](../tests/adapters/pendle-market-oracle.test.ts) | Sync oracle `ingest`/`resolve` · **TTL 60s** stale · `PENDLE_ORACLE_STALE` soil trip | **PASS** |
| [`tests/adapters/pendle-pt-registry.test.ts`](../tests/adapters/pendle-pt-registry.test.ts) | `resolve*` · `normalize*` · address index · `hydrateFromOracle` | **PASS** |
| [`tests/risk-control/pendle-soil-guard.test.ts`](../tests/risk-control/pendle-soil-guard.test.ts) | `pendleOracle` + `pendleCrossGuard` → `checkSoilResistance()` | **PASS** |
| [`tests/guards/pendle-gmx-cross-guard.test.ts`](../tests/guards/pendle-gmx-cross-guard.test.ts) | Shadow Margin cross-guard · Observatory Paradox de-leverage | **PASS** |
| [`tests/adapters/pendle-pt-expiry-guard.test.ts`](../tests/adapters/pendle-pt-expiry-guard.test.ts) | PT expiry &lt;7d ∧ jitter &gt;200bps fail-closed · 1,000 fuzz | **PASS** |

**Code SSOT:** [`pendle-market-oracle-adapter.ts`](../src/adapters/pendle/pendle-market-oracle-adapter.ts) · [`pendle-pt-registry.ts`](../src/adapters/pendle/pendle-pt-registry.ts) · [`pendle-gmx-cross-guard.ts`](../src/guards/pendle-gmx-cross-guard.ts) · [`core/pendle-types.ts`](../src/core/pendle-types.ts)

---

## Zone C — Outside Three Pillars (Ecosystem & Simulation Harnesses)

### 1. Wayfinder Native Adapter (V1.0 Live · Arbitrum AI Agent Engine)

**Command:**

```bash
pnpm demo:wayfinder
# or: npx tsx examples/wayfinder-agent-demo.ts
pnpm demo:wayfinder -- --trip   # 0-Gas Fail-Closed soil trip
pnpm exec vitest run tests/adapters/wayfinder-shield.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`wayfinder-shield.ts`](../src/adapters/wayfinder/wayfinder-shield.ts) — `wayfinderCitadelShieldHook` |
| Integrates | `checkSoilResistance()` (Pillar 3 soil fuse) + `verifyAgentIntent()` (8-dimension validation) |
| Chain | Arbitrum One (`42161`) — native pre-execution risk firewall for Wayfinder Agent Engine |

| Test scenario | File | Expected |
|---------------|------|----------|
| Normal Arbitrum route intent | [`wayfinder-shield.test.ts`](../tests/adapters/wayfinder-shield.test.ts) | `status: ALLOW` · `allowedToSign: true` |
| Toxic soil trip (high slippage / depth) | same | `status: FAIL_CLOSED` · 0-Gas · `reasons` populated |
| Session key clip / expiry violation | same | `status: FAIL_CLOSED` · `allowedToSign: false` |

**AI Agent execution flow (Wayfinder / Virtuals):**

```text
[ Wayfinder Agent Engine / Virtuals Agent Swarm ]
                    │
                    ▼
        wayfinderCitadelShieldHook  (wayfinder-shield.ts)
                    │
                    ▼
        verifyAgentIntent()  (8-dimension gate)
                    │
                    ▼
        checkSoilResistance()  (Pillar 3 soil fuse · p50 ~106µs)
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     FAIL_CLOSED           ALLOW
     (0-Gas intercept)         │
                               ▼
                    [ On-Chain Execution · Arbitrum 42161 ]
```

---

### 2. Stabilizer Protocol Adapter (V1.0 Live · Universal Sepolia Cross-DEX Testnet Sandbox)

**Citadel role:** **Universal Testnet Sandbox & Cross-Pass Interoperability Layer** for AI agents on Arbitrum Sepolia (`421614`). Pre-execution **0-Gas Fail-Closed Protection** across Stabilizer (1:1 zero-slippage stablecoin swap) · GMX v2 (Sepolia shadow margin) · Pendle (Testnet Guarded Pool Factory) — **identical `checkSoilResistance()` bytecode and risk gates** as Arbitrum One (`42161`).

**Command:**

```bash
pnpm demo:stabilizer
pnpm demo:stabilizer -- --trip
pnpm demo:wayfinder -- --stabilizer
pnpm exec vitest run tests/adapters/stabilizer-adapter.test.ts
pnpm exec vitest run tests/demo/gmx-v2-agent-flow.demo.test.ts tests/demo/pendle-ai-agent-flow.demo.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`stabilizer-adapter.ts`](../src/adapters/stabilizer/stabilizer-adapter.ts) |
| Assets | USDZ / USDC / USDT / USDS — Constant-Sum 1:1 zero-slippage pairs |
| Cross-pass legs | Stabilizer → GMX v2 (`gmx-v2-order-payload-guards.ts`) → Pendle (`pendle-pool-factory-adapter.ts`) |
| Integrates | `verifyStabilizerPoolCapacity()` · `verifyStabilizerPegDrift()` · `verifyZeroSlippageCapacity()` · `checkSoilResistance()` |
| Chain | Arbitrum Sepolia (`421614`) |

#### Stabilizer Sepolia Testnet Verification Vectors

| Vector | Invariant / surface | Verify command | Expected |
|--------|---------------------|----------------|----------|
| **1:1 Constant-Sum Capacity Validation** | Swap amount ≤ zero-slippage pool capacity · Constant-Sum 1:1 invariant | `pnpm demo:stabilizer` · `stabilizer-adapter.test.ts` (ALLOW scenario) | `status: ALLOW` · `allowedToSign: true` |
| **USDZ De-peg (>50bps) Severance & 60s LLM Cooldown** | `verifyStabilizerPegDrift()` trips on >50bps USDZ/collateral drift · signature channel severed · 60s mandatory cooldown on retry | `pnpm demo:stabilizer -- --trip` · `stabilizer-adapter.test.ts` (de-peg scenario) | First call: `FAIL_CLOSED` · retry within 60s: `MANDATORY_COOLDOWN_ACTIVE` |
| **Cross-DEX Liquidity Routing (Stabilizer → GMX v2 → Pendle)** | Each hop gated by `checkSoilResistance()` before broadcast · identical Mainnet bytecode path | `pnpm demo` (Tri-Pillar) · `pnpm demo:stabilizer` + GMX/Pendle demo tests | Per-leg ALLOW or FAIL_CLOSED · no cross-leg bypass |

| Test scenario | File | Expected |
|---------------|------|----------|
| Normal 1:1 swap within zero-slippage capacity | [`stabilizer-adapter.test.ts`](../tests/adapters/stabilizer-adapter.test.ts) | `status: ALLOW` |
| Liquidation / reserve floor depletion | same | `SOIL_RESISTANCE_TRIP` · `FAIL_CLOSED` · 0-Gas |
| USDZ de-peg trigger + 60s cooldown | same | `FAIL_CLOSED` then `MANDATORY_COOLDOWN_ACTIVE` · signature channel severed |

**Cross-Pass routing diagram:**

```text
[ AI Agent · Sepolia 421614 ]
         │
         ▼  Stabilizer: 1:1 zero-slippage rebalance → checkSoilResistance()
         ▼  GMX v2: shadow-margin / price-impact pre-flight → checkSoilResistance()
         ▼  Pendle: Guarded Pool Factory / oracle TTL → checkSoilResistance()
         │
   ┌─────┴─────┐
   ▼           ▼
FAIL_CLOSED  ALLOW (identical Mainnet bytecode · 0-Gas on block)
```

---

### 3. ElizaOS Citadel Plugin (V1.0 Live)

**Command:**

```bash
pnpm demo:elizaos
pnpm exec vitest run tests/adapters/elizaos-plugin.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`elizaos-citadel-plugin.ts`](../src/adapters/elizaos/elizaos-citadel-plugin.ts) — `evaluateElizaCitadelAction()` |
| Demo | `pnpm demo:elizaos` · `--trip` for FAIL_CLOSED |

---

### 4. Virtuals Protocol GAME Adapter (V1.0 Live)

**Command:**

```bash
pnpm demo:virtuals
pnpm exec vitest run tests/adapters/virtuals-adapter.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`virtuals-game-adapter.ts`](../src/adapters/virtuals/virtuals-game-adapter.ts) — `evaluateVirtualsGameTask()` |
| Integrates | `verifyAgentIntent()` + `checkSoilResistance()` before GAME Worker dispatch |
| Chain | Arbitrum One (`42161`) |

| Test scenario | Expected |
|---------------|----------|
| Normal GAME worker task | `status: ALLOW` · `allowedToSign: true` |
| Toxic soil trip | `FAIL_CLOSED` · 0-Gas |
| Session key clip breach | `FAIL_CLOSED` · `CLIP_BREACH` |

---

### 5. LangChain / LangGraph CitadelRiskGuardTool (V1.0 Live)

**Command:**

```bash
pnpm demo:langchain
pnpm exec vitest run tests/adapters/langchain-tool.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`langchain-citadel-tool.ts`](../src/adapters/langchain/langchain-citadel-tool.ts) — `CitadelRiskGuardTool` |
| Integrates | Parameter hallucination guard · `verifyAgentIntent()` · `checkSoilResistance()` |
| Compat | `@langchain/core/tools` StructuredTool · LangGraph state nodes |

| Test scenario | Expected |
|---------------|----------|
| Normal tool invoke | `status: ALLOW` · `output: SOIL_PASS` |
| Toxic slippage soil trip | `FAIL_CLOSED` |
| Parameter hallucination (NaN / negative depth) | `FAIL_CLOSED` · `PARAMETER_HALLUCINATION` |

---

### 6. Supplementary Agent Demos (Optional)

**Command:** `tsx examples/agent-interceptor-demo.ts` · legacy scripts in [`examples/adapters/`](../../examples/adapters/)

| Scope | Detail |
|-------|--------|
| Primary SSOT | **V1.0 Live Native Integrations** in [`src/adapters/`](../../src/adapters/) — use `pnpm demo:{wayfinder,elizaos,virtuals,langchain,stabilizer,quad}` |
| Supplementary | [`agent-interceptor-demo.ts`](../../examples/agent-interceptor-demo.ts) · [`examples/adapters/`](../../examples/adapters/) (TS + Python evaluator scripts) |

---

### 7. Quantitative Stress Benchmark (Survival Benchmark)

**Command:**

```bash
pnpm tsx scripts/generate-survival-report.ts
```

| Parameter | Value |
|-----------|-------|
| Lookback | 30D HL L2 orderbook stress |
| Degrade events | 42 observed |
| Offline fallback | Resilient 503 / network abort → snapshot replay |
| Output | `docs/0801_BeDelta_Survival_Benchmark.md` |

---

### 8. Production Telemetry & Provenance (Optional / Network)

| Surface | Command | Expected |
|---------|---------|----------|
| Sidecar health | [`docker/README.md`](../docker/README.md) | `curl -sS http://localhost:8080/health \| jq .` |
| Live grant audit | Network required | `curl -s https://bedeltawater.slivervine.xyz/api/grant-audit \| jq .provenanceVerified` |
| 5-TX testnet proof | `pnpm verify:5tx` / `pnpm verify:grant` | Hyperliquid testnet anchor in `verified_5tx_results.json` |
| Demo pipeline | `pnpm demo` · `pnpm demo:{gmx,hl,pendle,camelot,radiant,jones}` · `pnpm demo:{wayfinder,elizaos,virtuals,langchain,quad}` · `pnpm demo:{stabilizer,e2e}` | 3-Tier CLI suite · 12-scenario Vitest matrix · 5-step ANSI HUD |

**Sidecar build:**

```bash
docker build -t silvervine-sidecar -f docker/Dockerfile.sidecar .
```

---

## Appendix — Maintainer Scripts & Bundle Checks

| Script | Purpose | Expected |
|--------|---------|----------|
| `pnpm bundle:measure` | Worker hot-path size gate | **68.9 KiB gzip** / **276.2 KiB raw** · `limitKiB: 150` · `pass: true` |
| `pnpm verify:negative` | Negative soil-trip proofs | Depth breach fail-closed |
| `pnpm demo` | Tri-Pillar micro E2E demo matrix (`tests/demo/`) | **12/12 PASS** |
| `pnpm demo:gmx` | GMX v2 shadow margin CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:hl` | Hyperliquid session key CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:pendle` | Pendle guarded pool factory CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:camelot` | Camelot V3 concentrated liquidity CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:radiant` | Radiant Capital lending HF CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:jones` | Jones DAO vault guard CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:matrix` | Cross-venue 6-protocol circuit breaker CLI (`--loop=all`) | **6/6 ALLOW** / trip **6/6 FAIL_CLOSED** |
| `pnpm demo:matrix -- --loop=perp` | Perp stack loop (Pendle → GMX → HL) | **4/4 FAIL_CLOSED** trip |
| `pnpm demo:matrix -- --loop=spot` | Spot vault loop (Camelot → Radiant → Jones) | **4/4 FAIL_CLOSED** trip |
| `pnpm demo:e2e` | 5-step macro lifecycle ANSI HUD | `RESULT: E2E OK (5/5)` |
| `pnpm demo:wayfinder` | Wayfinder native route interception | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:elizaos` | ElizaOS Action handler guard | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:virtuals` | Virtuals GAME worker guard | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:langchain` | LangChain CitadelRiskGuardTool | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:stabilizer` | Standalone Stabilizer Sepolia 1:1 swap guard | ALLOW / `--trip` FAIL_CLOSED + cooldown |
| `pnpm demo:quad` | Quad-Agent framework demo (Wayfinder · ElizaOS · Virtuals · LangChain) | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm test` | Full Vitest + coverage | **190 test files \| 828 PASS Clean (100% PASS)** |
| `pnpm test:watch` | Interactive Vitest | — |
| `pnpm typecheck` | `tsc --noEmit` | — |
| `pnpm audit:fast` / `audit:security` / `audit:nightly` | 3-tier security matrix | **5/0/0 PASS** (security tier) |
| `pnpm build:wasm` | Rust `soil_core.wasm` | `pkg/soil_core.wasm` |
| `pnpm build` / `deploy` / `dev` | Worker / SPA toolchain | — |

**Removed from public script surface (OpSec):** live ignition / wallet sweep / spot sell / Sepolia UserOp one-offs — not required for Buildathon diligence.

---

## On-Chain Contract Topology (`contracts/` vs `SliverVineGate/`)

Automated dependency audit (2026-08-24): **no TS/JS runtime import** of `contracts/*.sol` paths; **no duplicate** Solidity definitions inside `SliverVineGate/`. Two distinct on-chain surfaces:

| Path | Contracts | Role | Forge / TS linkage |
|------|-----------|------|-------------------|
| **`SliverVineGate/`** | `SliverVineGate.sol` · `GatedExecutor.sol` | EIP-712 consume-once attestation gate (Pillar 3) | `cd SliverVineGate && forge test` · **60/60** · default fuzz **5,120** · deep **327,675** via `FOUNDRY_PROFILE=deep` |
| **`contracts/`** | `SliverVineRiskOracle.sol` · `IngressSafetySwitch.sol` | Venue-agnostic ingress compliance oracle + address-level safety switch | **Not** in Forge testbed · ABI mirrored in TS |

**TypeScript interface SSOT (Edge runtime):**

| Solidity source | TS ABI / adapter | Usage |
|-----------------|------------------|-------|
| `contracts/SliverVineRiskOracle.sol` | `src/services/aa-adapter/risk-oracle.ts` → `SLIVERVINE_RISK_ORACLE_ABI` | `risk-oracle-gate.ts` · viem `readContract` when `SLIVERVINE_RISK_ORACLE_ADDRESS` set |
| `contracts/IngressSafetySwitch.sol` | `risk-oracle.ts` → `INGRESS_SAFETY_SWITCH_ABI` | `risk-oracle-adapter.ts` · `evaluateComplianceAdapter()` (fail-closed logic) |

**Verdict:** `contracts/` is **not** a safe delete — it is the canonical Solidity spec for Robinhood ingress; TS adapters intentionally mirror ABIs (no Forge artifact import at Edge).

---

## Related Docs

| Document | Role |
|----------|------|
| [`README.md`](../README.md) | Repo entry · express verification summary |
| [`ARB_Buildathon/SUBMISSION.md`](./ARB_Buildathon/SUBMISSION.md) | Buildathon main submission |
| [`architecture/01_TECHNICAL_SPECIFICATION.md`](./architecture/01_TECHNICAL_SPECIFICATION.md) | Yellow Paper |
| [`architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | Risk spectrum · simulation harnesses |
| [`../docker/README.md`](../docker/README.md) | Sidecar testlist |
| [`../JUDGE_BRIEF.md`](../JUDGE_BRIEF.md) | 1-page judge entry |

---

*SilverVine Labs · BUSL-1.1 · Verification Matrix · 190 test files | 828 PASS Clean (100% PASS)*
