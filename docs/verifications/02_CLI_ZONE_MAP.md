# CLI Zone Map (Tier 0–5 Verification)

> **SSOT index:** [`README.md`](./README.md) · **Hub:** [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)

## Zone A — 30-Second Express Verification (Fast Track)

### 3-Tier Demo Suite (CLI SSOT)

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 1 — Sovereign Vault GM I/O** | `pnpm demo:e2e:arb-native` · `pnpm execute:gmx:gm-deposit` · `pnpm execute:gmx:gm-withdraw` · `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:matrix` | Arbitrum Native USDC GM deposit · live Wallet B multicall · GMX · HL · **7-protocol matrix** |
| **Tier 1 — Native Protocols** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:uniswap` · `pnpm demo:aave` · `pnpm demo:morpho` · `pnpm demo:usdai` · `pnpm demo:matrix` | GMX · HL · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · USD.ai · **7-protocol cross-venue matrix** |
| **Tier 2 — Agent Frameworks** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:quad` | Wayfinder · ElizaOS · Virtuals · LangChain · combined quad |
| **Tier 3 — Sandbox & E2E** | `pnpm demo:stabilizer` · `pnpm demo:e2e` | Sepolia Stabilizer · **4-step Happy Path** macro lifecycle (`--unwind` · `--trip` optional) |
| **Vitest matrix** | `pnpm demo` | 12 Tri-Pillar ANSI scenarios (`tests/demo/`) |

All standalone CLIs measure latency via `process.hrtime.bigint()` (µs precision).

### Path 1: Instant Monorepo (Recommended — ~3 Seconds)

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 4-Step Happy Path Macro Lifecycle CLI (--unwind · --trip optional)
pnpm test       # Full System Regression Suite (217 test files | 967 PASS clean)
```

| Command | Proves | Expected |
|---------|--------|----------|
| `pnpm demo` | Tri-Pillar micro E2E matrix (`tests/demo/`) | **12/12 PASS** · ANSI output |
| `pnpm demo:gmx` | GMX v2 shadow margin · cross-venue slippage · position cap | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:hl` | Hyperliquid session key auth · WS depth guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:pendle` | Pendle PT/YT sentinel · guarded pool factory | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:uniswap` | Uniswap V3 concentrated liquidity · dynamic fee guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:aave` | Aave V3 HF & cross-chain liquidation guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:morpho` | Morpho Blue vault share-price & sandwich guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:usdai` | USD.ai AI-compute yield collateral guard (`evaluateUsdAiCollateralGuard`) | `ALLOW` / `--trip` FAIL_CLOSED · [`usdai-adapter.test.ts`](../../tests/adapters/usdai-adapter.test.ts) **5/5** |
| `pnpm demo:matrix` | Full 7-protocol cross-venue matrix (`--loop=all`) | **7/7 ALLOW** nominal · **7/7 FAIL_CLOSED** trip |
| `pnpm demo:matrix -- --loop=perp` | Delta-neutral perp stack (Pendle → GMX → HL + Variational) | **3/3 + Soil** |
| `pnpm demo:matrix -- --loop=perp --hedge=variational` | Variational Omni RFQ hedge leg · stale quote trip | `ALLOW` / `--trip` **FAIL_CLOSED** (`VARIATIONAL_STALE_QUOTE_BREACH`) |
| `pnpm demo:matrix -- --loop=perp --hedge=hyperliquid` | Hyperliquid L1 hedge leg only | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:matrix -- --loop=perp --hedge=both` | Dual perp hedge (HL + Variational, default) | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:matrix -- --loop=spot` | Spot & lending vault loop (Uniswap V3 → Aave V3 → Morpho Blue) | **3/3 + Soil** |
| `pnpm demo:matrix -- --healthy-only` | Nominal pre-flight only (no R20 sever) | **ALLOW** |
| `pnpm demo:matrix -- --trip --gmx` | GMX pool imbalance (>0.35) trip variant | **FAIL_CLOSED** |
| `pnpm demo:e2e` | 4-step Citadel ANSI HUD dry-run (Happy Path SSOT) | `RESULT: E2E OK (4/4)` |
| `pnpm demo:e2e -- --unwind` | Optional Step 5 Citadel Shield R20 unwind exercise | `RESULT: E2E OK (5/5)` |
| `pnpm demo:e2e -- --trip` | Step 1 soil-trip stress intercept | `E2E FAIL` at Gatehouse |
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
| `pnpm test` | Full Vitest regression bar | **217 test files | 967 PASS clean** |

**`demo:e2e` expected terminal highlights** (GitHub `diff` syntax):

```diff
+  ┌─ SliverVine Citadel Shield ─────────────────────────────────────┐
+  │  Sepolia Gate · p50 ~106µs · Δnet ≡ 0 · lostUsd ≡ 0            │
+  └────────────────────────────────────────────────────────────────┘
+ Step 1: allowedToSign=true · elapsed=106µs · Δnet ≡ 0
+ Step 2: Escort PASS · lostUsd ≡ 0
- AML_INBOUND_TO_ROBINHOOD_BLOCKED (inbound 42161→46630)
! Step 3: uiFeeReceiver (+10 bps)
+ Step 4: Margin Anchor · Δnet ≡ 0
+ RESULT: E2E OK (4/4)
```

**Optional modes:**

```diff
+ pnpm demo:e2e -- --unwind   # Step 5 Citadel Shield R20 unwind · RESULT: E2E OK (5/5)
+ pnpm demo:e2e -- --trip     # Step 1 soil-trip intercept · E2E FAIL at Gatehouse
```

**Legacy stress diff** (`--unwind` only — Step 5 soil exercise):

```diff
- ALERT: SOIL_TRIPPED — toxic depth fuse
- [CRITICAL] PHYSICAL_DEADLOCK_TRIGGERED: EIP-712 Signature Pipe Severed
+ Treasury State: Protocol Treasury retains +$2.40 (uiFeeReceiver share)
+ Flash unwind: PASS · RESULT: E2E OK (5/5)
```

### Path 2: Isolated Docker (Zero Host Node/pnpm)

```bash
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
```

| Command | Proves | Expected |
|---------|--------|----------|
| Default `docker run` | 4-step Citadel **`demo:e2e`** Happy Path inside container | `[tier0] demo:e2e PASS` |
| `docker run --rm slivervine-citadel pnpm test` | Full Vitest regression (host-free) | **217 test files | 967 PASS clean** |

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
| [`gmx-v2-agent-flow.demo.test.ts`](../../tests/demo/gmx-v2-agent-flow.demo.test.ts) | 4 | Healthy MarketIncrease · toxic price-impact soil trip · Chainlink Data Streams oracle-lag reject + `reduceOnly` delever rescue · 1,000× payload validation benchmark |
| [`hyperliquid-agent-flow.demo.test.ts`](../../tests/demo/hyperliquid-agent-flow.demo.test.ts) | 4 | Valid `ApproveAgent` EIP-712 · WS stale / latency >200ms soil trip · expired session key / GateLockout · 1,000× session-key validation benchmark |
| [`pendle-ai-agent-flow.demo.test.ts`](../../tests/demo/pendle-ai-agent-flow.demo.test.ts) | 4 | AI guarded pool PASS · 450bps yield-drift MEV reject · 60s TTL stale oracle · 1,000× `validateAIPoolSelection()` benchmark |

| Command | Proves | Expected |
|---------|--------|----------|
| `pnpm demo` | Tri-Pillar micro E2E matrix | **12/12 PASS** · colorful ANSI console output |

### (b) Macro Lifecycle E2E Suite — `pnpm demo:e2e`

```bash
pnpm demo:e2e
```

| Command | Proves | Expected |
|---------|--------|----------|
| `pnpm demo:e2e` | 4-step cross-venue agent hedge Happy Path (SSOT) | `RESULT: E2E OK (4/4)` |
| `pnpm demo:e2e -- --unwind` | Optional Step 5 R20 panic flash unwind | `RESULT: E2E OK (5/5)` |
| `pnpm demo:e2e -- --trip` | Step 1 soil-trip stress intercept | `E2E FAIL` at Gatehouse |

Steps (Happy Path): Intent + Deadman → Robinhood escort → GMX underweight rebalance → HL session hedge. Optional `--unwind` adds Step 5 Citadel Shield R20 exercise; `--trip` stress-tests Step 1 Gatehouse intercept.

---

## Zone B — Inside Three Pillars (Core Protocol Invariants)

### Pillar 1 — Gatehouse (Opt-In Account Abstraction & Scoped Auth)

**Command:** `pnpm test:zerodev`

**Definition:** `vitest run tests/adapters/zerodev-aa-dryrun-harness.test.ts`

| Assertion | Status |
|-----------|--------|
| Kernel v3 / EntryPoint **v0.7** UserOp **draft** path | ✅ Dry-run harness verified |
| Session scope + Risk Oracle Gate fail-closed | ✅ Offline / mock bundler |
| Mainnet UserOp broadcast | ✅ **Verified Live** — Robinhood Mainnet Smart Route `4663` → `42161` · UserOp [`0x7b72ee9f…`](https://arbiscan.io/tx/0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a) |

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
| Test cases | **6/6 PASS** |
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
| [`tests/adapters/pendle-market-oracle.test.ts`](../../tests/adapters/pendle-market-oracle.test.ts) | Sync oracle `ingest`/`resolve` · **TTL 60s** stale · `PENDLE_ORACLE_STALE` soil trip | **PASS** |
| [`tests/adapters/pendle-pt-registry.test.ts`](../../tests/adapters/pendle-pt-registry.test.ts) | `resolve*` · `normalize*` · address index · `hydrateFromOracle` | **PASS** |
| [`tests/risk-control/pendle-soil-guard.test.ts`](../../tests/risk-control/pendle-soil-guard.test.ts) | `pendleOracle` + `pendleCrossGuard` → `checkSoilResistance()` | **PASS** |
| [`tests/guards/pendle-gmx-cross-guard.test.ts`](../../tests/guards/pendle-gmx-cross-guard.test.ts) | Shadow Margin cross-guard · Observatory Paradox de-leverage | **PASS** |
| [`tests/adapters/pendle-pt-expiry-guard.test.ts`](../../tests/adapters/pendle-pt-expiry-guard.test.ts) | PT expiry &lt;7d ∧ jitter &gt;200bps fail-closed · 1,000 fuzz | **PASS** |

**Code SSOT:** [`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) · [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) · [`core/pendle-types.ts`](../../src/core/pendle-types.ts)

---
