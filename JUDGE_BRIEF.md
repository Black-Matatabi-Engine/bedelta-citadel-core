# JUDGE_BRIEF.md — SliverVine Citadel Shield (1-Page Buildathon Brief)

## ⚡ 3-Second TL;DR for Judges (ELI5)

**Citadel Shield = the sub-millisecond ESP / anti-lock brake system for autonomous AI agents.**

| | **LLM Brain** | **Citadel Pre-Flight Shield** |
|---|---------------|-------------------------------|
| **Speed** | ~2,000ms (slow reasoning, prone to hallucinations) | **14.0µs** (deterministic 0-Gas safety deadlock) |
| **On bad intent** | May route to unauthorized venue (e.g. **Aerodrome**) | **FAIL-CLOSED** — severs signature channel, **$0 Gas** |

```
[LLM Reasoning: 1,000ms – 5,000ms]  →  [Citadel Pre-Execution Shield: 14.0µs]  →  [Arbitrum Chain]
```

**Plain English:** If an AI agent hallucinates or tries to send funds to an unauthorized contract, Citadel severs the signature channel in **14 microseconds** without spending a single cent of Gas. → `pnpm demo:quad` · `pnpm demo:matrix -- --trip`

---
| Field | Value |
|-------|-------|
| **Headline** | **SliverVine Citadel Shield: Pre-Consensus Intent Firewall & Execution Safety Primitive for AI Agents on Arbitrum** |
| **Entity** | SilverVine Labs |
| **Track** | Promising Products — AI Agents & Financial Primitives |
| **Arbitrum One Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Ignition Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Live Dune Telemetry Portal** | [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · PEV operational on Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **Headless Audit Endpoint** | [`https://bedeltawater.slivervine.xyz/api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) |
| **Repo** | [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water) |
| **Verified Commit** | `main` @ **`1acbc24`** (`bedelta-citadel-core`) |
| **Worker Bundle** | **69.28 KiB gzip** (`pnpm bundle:measure` · `pass: true` · &lt;70 KiB) |
| **Tests** | `pnpm test` → **192 test files | 834 PASS Clean (100% PASS)** · **3-Tier Demo Suite** (`demo:{gmx,hl,pendle,uniswap,aave,morpho}` · `demo:{wayfinder,elizaos,virtuals,langchain,quad}` · `demo:{stabilizer,e2e}`) · `pnpm demo` (12 Tri-Pillar) · full matrix → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) |
| **Deep docs** | [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) · [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) |

> **Headless Infrastructure Protocol:** Core interaction is API/SDK Native (`@slivervine/citadel-sdk`) & CLI HUD.

---

## Production Architecture Declarations

> Authoritative v1.0 production scope for SliverVine Citadel Shield. **Baseline:** `main` — **192 test files / 834 PASS Clean (100% PASS)**.

| # | Domain | Production declaration |
|---|--------|------------------------|
| **1** | Ephemeral Ignition Signers | Arbitrum One Gate `0xb174118b…` employs **`0x1111…` / `0x2222…` Ephemeral Verification Signers** for public auditability without exposing production HSM infrastructure. Gate shape = consume-once EIP-712; production rotation via native governance to multisig. |
| **2** | GMX v2 Pre-Flight Guards | GMX v2 execution guards verified via **Vitest CLI + dry-run pipelines** (`pnpm demo` · `tests/demo/gmx-v2-agent-flow.demo.test.ts` · `gmx-v2-order-payload-guards.ts`) — **0-Gas pre-flight severance** before live GM pool capital deployment. Mainnet GM fill scheduled for post-Grant M6. |
| **3** | Pendle Core Pillar 3 | **V1.0 dual deliverable:** (1) **Pendle Institutional Safety Sentinel** — 60s TTL Oracle Fuse & 200bps Jitter Guard · (2) **Pendle AI Guarded Pool Factory** — 5 Invariants via `validateAIPoolSelection()` · **150 bps** implied-yield shock fuse. AI pool creation/validation is **protocol-tax-free**; metered SaaS Request Credits launch in **V1.1**. → [§3 Pendle](#pendle-finance-v10-live--core-pillar-3) |
| **4** | Telemetry Infrastructure | **Live Event Telemetry actively streams on Sepolia Testnet**; **Arbitrum One (42161) SQL Query Indexers fully pre-compiled for production event ingestion** (Queries 0–3 · [`DUNE_DASHBOARD_SPECIFICATION.md`](./docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md)). Sepolia live stream and One production SQL are documented as separate deployment surfaces. |
| **5** | Agent Integration | **V1.0 Live Native Integrations** — Wayfinder · ElizaOS · Virtuals (GAME) · LangChain · Stabilizer ([`src/adapters/`](#four-major-ai-agent-frameworks-v10-live--full-quad-coverage)) · standalone CLIs `pnpm demo:{wayfinder,elizaos,virtuals,langchain,stabilizer,quad}` · **192 test files | 834 PASS Clean (100% PASS)** |
| **6** | 0-Gas Off-Chain Severance | Arbitrum One Gate (`0xb174…`) is **engineered for 0-Gas Pre-Execution Off-Chain Severance**. Citadel Risk Gates halt compromised payload signatures at the Edge **prior to mempool submission**, preserving **L2 state space cleanliness** — hot path burns no on-chain gas. → [Deployment Architecture](#deployment-architecture-arbitrum-one-0-gas-off-chain-severance) |
| **7** | Dune Analytics | **Live Event Telemetry actively streams on Sepolia Testnet**; **Arbitrum One (42161) SQL Query Indexers fully pre-compiled** for production event ingest. → [Dune Analytics](#dune-analytics) |
| **8** | Commercial Model | **v1.0 = Public Open Gateway** (`X-Citadel-Tier: public`) · **V1.1 = 4-Tier SaaS** (Milestone 1) · **10 bps CaaS = V2.0**. → [Commercial Model](#commercial-model-saas-vs-caas) |

### Deployment Architecture (Arbitrum One 0-Gas Off-Chain Severance)

> **Arbitrum One Gate (`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`) is intentionally engineered for 0-Gas Pre-Execution Off-Chain Severance.** Citadel Risk Gates (`checkSoilResistance()` · `severSigningChannel()`) halt compromised payload signatures on Cloudflare Edge **prior to mempool submission**, preserving **Arbitrum L2 state space cleanliness** — tripped paths consume no Sequencer gas; on-chain Gate anchors consume-once EIP-712 attestations only for cleared intents.

### Commercial Model (V1.0 Open Gateway · V1.1 SaaS · V2.0 CaaS)

| Version | Architecture | Notes |
|---------|--------------|-------|
| **v1.0 (current — submission baseline)** | **Public Open Gateway** | Buildathon / hackathon evaluation · lightweight Edge RPS limiter (IP/header) · `X-Citadel-Tier: public` · `X-Citadel-RPS-Limit: 5` |
| **V1.1 (Milestone 1 post-grant)** | **KV API Key Metering + 4-Tier SaaS** | Paid tiers below · multi-tenant rate limiter |
| **V2.0 (roadmap)** | **CaaS protocol fee-sharing** | **10 bps protocol authorization fee** · separate from v1.0 GMX +10 bps `uiFeeReceiver` |

#### V1.0 Submission Baseline (Current)

- **Public open gateway** for judges and developers — no paid API key required for evaluation.
- **Protection:** Lightweight Edge RPS rate limiter (header/IP-based) safeguards memory queues against Sybil DoS.
- **Demo headers:** `X-Citadel-Tier: public` · `X-Citadel-RPS-Limit: 5` on all gateway responses.

#### V1.1 Roadmap — 4-Tier Commercial Model (Milestone 1 Post-Grant)

| Tier | Monthly | Annual (billed yearly) | RPS | Intents / mo | Entitlements |
|------|---------|------------------------|-----|--------------|--------------|
| **Starter Shield** | **$10** | **$96/yr** | **5** | **100k** | B2B anti-Sybil entry barrier |
| **Pro Guard** | **$99** | **$950/yr** | **50** | **5M** | WASM closed kernel · R17 daily loss prevention |
| **Business Citadel** | **$299** | **$2,870/yr** | **200** | **20M** | Priority memory queue · R20 auto-severance · tenant isolation |
| **Enterprise Dedicated** | **$1,999+** | Custom contract | **1,000+** | Custom | Dedicated Cloudflare Edge nodes · custom Rust/WASM risk modules · private MEV routing |

> **Scope honesty:** v1.0 submission ships the **public open gateway** only. The **4-tier paid model is V1.1 Milestone 1** (Cloudflare KV API Key metering). All tiers are **best-effort** (no uptime SLA).

---

## 30-Second Identity

SliverVine is **not** a Wasm slippage calculator. It is a **pre-consensus execution safety primitive**: sub-ms intent clearing on Cloudflare Edge (`checkSoilResistance()`, p50 ~106µs · **`pkg/soil_core.wasm` — independent of AA**) **plus** an immutable **EIP-712 consume-once `SliverVineGate`** on Arbitrum One. ZeroDev Kernel v3 is an **opt-in Pillar 1 AA delivery layer** (`USE_ZERODEV_AA` default-off) — not the source of sub-ms latency. Toxic AI Agent UserOps are severed **before** Sequencer queues — **0-Gas** on blocked paths.

**Primary Execution Boundary:** Full Arbitrum Native Multi-Protocol Coverage (GMX v2, Pendle, Uniswap V3, Aave V3, Morpho Blue, **Variational Omni RFQ**) + Cross-Chain High-Frequency Orderbook Defense (Hyperliquid L1 Session Key Adapter) + optional Arbitrum-native RFQ OLP hedging.

**Hyperliquid** is an **Independent L1 High-Frequency Orderbook AppChain** that originated alongside Arbitrum's perp liquidity ecosystem — session-key hedge adapter, not Arbitrum-native execution.

### Tailor-Made Mathematical Invariants

| Protocol | Venue | Physical Boundary | Module |
|----------|-------|-------------------|--------|
| **GMX v2** | Arbitrum One | \|OI_long − OI_short\| / PoolTVL > **0.35** · Collateral Reserve < **105%** | `gmx-v2-invariants.ts` |
| **Pendle** | Arbitrum One | \|Yield_current − Yield_oracle\| > **150 bps** | `pendle-pool-factory-adapter.ts` |
| **Uniswap V3** | Arbitrum One | Tick depth · slippage/penalty > **0.50%** (**50 bps**) | `uniswap-v3-adapter.ts` |
| **Aave V3** | Arbitrum One | Health Factor HF < **1.15** | `aave-v3-adapter.ts` |
| **Morpho Blue** | Arbitrum One | Single-block NAV deviation > **0.30%** (**30 bps**) | `morpho-blue-adapter.ts` |
| **Hyperliquid** | L1 HF Orderbook AppChain | MaxSizePerOrder · Rate Limit (120/min) · Spread > **20 bps** | `hyperliquid-session-guard.ts` |
| **Variational** | Arbitrum One (Omni RFQ) | Quote stale **>500ms** or oracle drift **>30 bps** · OLP depth utilization **>15%** (long-tail) · **Bit 12** stale quote · **Bit 13** OLP depth · `FLAGS_AUTO_SEVER_MASK` | `evaluateVariationalFlags()` · `variational-rfq-adapter.ts` |

## Why Citadel Shield is NOT a Normal RPC Gateway (The Intent & Calldata Layer)

Citadel Shield sits at the **Intent & Calldata Layer** — between LLM reasoning and EIP-712 signing — not as a passive JSON-RPC relay. It validates semantic intent (venue allowlists, calldata shape, risk bitmask) **before** any hot-key signature pipeline opens.

### LLM vs Citadel Latency — ASCII Workflow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  LLM Reasoning Layer              Citadel Shield Pre-Flight        On-Chain  │
│  (Prompt → Plan → Calldata)       Invariant Check                  Sign/Chain│
│  ████████████████████████████     ██                             ─────────   │
│  ~1,000ms – 5,000ms               ~14.0µs – 106µs                (if cleared)│
└──────────────────────────────────────────────────────────────────────────────┘
```

| Dimension | Normal RPC Gateway | Citadel Shield (Intent Layer) |
|-----------|-------------------|-------------------------------|
| **Layer** | Transport relay | Pre-signature intent firewall |
| **Latency** | 50–300ms+ RTT | **~14.0µs** invariant · **~106µs** matrix (Edge `<106µs`) |
| **Validation** | Opaque forward | Venue allowlist · soil fuse · R17/R20 bitmask |
| **Failure** | Relay errors | **FAIL-CLOSED** · **0-Gas** · `severSigningChannel()` |
| **AI safety** | None | Hallucinated venues severed pre-sign |
| **Demo** | — | `pnpm demo:quad` · `pnpm demo:wayfinder -- --trip` |

### Fail-Closed Walkthrough — AI Prompt Hallucination

**Scenario:** Agent hallucinates **Aerodrome** swap while policy allowlists only **GMX v2 / Pendle / Uniswap V3** on Arbitrum One.

1. LLM emits unsupported-venue calldata (`~2,000ms` reasoning).
2. Citadel Intent Layer flags Aerodrome outside bitmask → **FAIL-CLOSED** in **~14.0µs**.
3. `severSigningChannel()` — **0-Gas**, no mempool broadcast.
4. Reproduce: `pnpm demo:quad -- --trip` · `pnpm demo:matrix -- --trip`

## Judge Quickstart Instructions

```bash
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (192 files / 834 tests)
```

Wayfinder native integration: `pnpm demo:wayfinder` · `pnpm demo:stabilizer` (Sepolia Cross-Pass Sandbox) · Tier 1 Native Protocols: `pnpm demo:{gmx,hl,pendle,uniswap,aave,morpho,matrix}` · `--trip` for Fail-Closed demos

> All verification commands: [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)

### 3-Tier Demo Suite (CLI SSOT)

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 1 — Native Protocols** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:uniswap` · `pnpm demo:aave` · `pnpm demo:morpho` · `pnpm demo:matrix` | GMX · HL · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · Variational RFQ · **7-protocol cross-venue matrix** |
| **Tier 2 — Agent Frameworks** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:quad` | Four major AI frameworks + combined quad run |
| **Tier 3 — Sandbox & E2E** | `pnpm demo:stabilizer` · `pnpm demo:e2e` | Sepolia Stabilizer · 5-step macro lifecycle |
| **Vitest matrix** | `pnpm demo` | **12 ANSI scenarios** — GMX · HL · Pendle · p50 ~106µs |

All standalone CLIs use `process.hrtime.bigint()` latency measurement (µs precision).

### Dual-Demo Architecture (Tri-Pillar Showcase)

| Path | Command | Scope |
|------|---------|-------|
| **Microsecond Risk Gate Demo Matrix** | `pnpm demo` | **12 ANSI scenarios** — GMX v2 (pool imbalance · collateral reserve · Data Streams lag) · Hyperliquid L1 (session key · MaxSizePerOrder · spread >20bps · rate limit) · Pendle (AI guarded pool · 150bps yield shock · 60s TTL stale oracle) · zero-I/O sync hot-path **p50 ~106µs** |
| **Macro Lifecycle E2E Suite** | `pnpm demo:e2e` | **5-step** cross-venue agent hedge · GMX underweight · HL session hedge · R20 circuit breaker |

Demo files: [`tests/demo/`](./tests/demo/) (`gmx-v2-agent-flow` · `hyperliquid-agent-flow` · `pendle-ai-agent-flow`).

---

## Why Protocol, Not a Tool?

| Property | Evidence |
|----------|----------|
| **Consume-once invariant** | `SliverVineGate.sol` — EIP-712 attestation replay ⇒ `Replayed()` revert |
| **Non-custodial settlement gate** | No proxy · no ETH custody · live on **42161** |
| **Unidirectional state flow** | Edge soil fuse → signing channel → Gate attestation (Foundry 62/62) |
| **Composable primitive** | `@slivervine/citadel-sdk` · `withCitadelShield` decorator · Reference harness |

A *tool* reports risk post-hoc. A *protocol primitive* **binds execution** with on-chain invariants and fail-closed pre-consensus clearing.

---

## Ecosystem Synergy — Arbitrum Open House Buildathon Priorities

### Offchain Labs Core / Arbitrum Foundation

**Lean execution · 0-Gas pre-broadcast severance · mainnet gate `0xb174…`:**

- Sub-ms Edge `checkSoilResistance()` (p50 ~106µs) — no on-chain hot-path bloat
- Toxic intents severed **before** Sequencer queues → **0-Gas** on blocked paths
- Live **Arbitrum One** consume-once `SliverVineGate` at `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`
- **0-Gas off-chain severance:** Gate is **designed for off-chain severance** — Risk Gates intercept signatures at the Edge and trip **before mempool submission**, preserving L2 state space cleanliness

### GMX Protocol

**+10 bps builder lane & depth/slippage fuse · Dry-run verification (0-Gas pre-flight):**

- Qualified GM payloads route `uiFeeReceiver` builder fee
- Pre-execution soil fuse (cross-venue slippage + depth) before DataStore broadcast
- **Vitest CLI + dry-run pipelines verified** — `pnpm demo` · `tests/demo/gmx-v2-agent-flow.demo.test.ts` · `gmx-v2-order-payload-guards.ts`; **0-Gas pre-flight protection** before live GM pool capital deployment (mainnet fill is a post-Grant milestone, not an untested v1.0 gap)

### Pendle Finance (V1.0 Live · Core Pillar 3)

V1.0 ships **two complementary Pendle integrations** — institutional safety layer, not a yield product:

**1. Pendle Institutional Safety Sentinel** — 60s TTL Oracle Fuse & 200bps Jitter Guard

- **Dynamic Market Oracle** ([`pendle-market-oracle-adapter.ts`](./src/adapters/pendle/pendle-market-oracle-adapter.ts)): sync in-memory `ingest()` / `resolve()` — **no hot-path I/O** · **TTL default 60s** · emits **`PENDLE_ORACLE_STALE`** on missing / stale / invalid feeds
- **Registry hydration** ([`pendle-pt-registry.ts`](./src/adapters/pendle/pendle-pt-registry.ts)): `hydrateFromOracle` overrides `impliedYield`, `ptPriceInAsset`, `liquidityConstant`, `expirySec`
- **Soil fuse wiring**: `pendleOracle` + `pendleCrossGuard` → `checkSoilResistance()` · expiry **<7d** + yield jitter **>200 bps** → fail-closed
- **Shadow margin cross-check** vs GMX maintenance before risk-increasing intents ([`pendle-gmx-cross-guard.ts`](./src/guards/pendle-gmx-cross-guard.ts))
- Protects PT/YT capital from liquidation blackholes — **not a competing yield product** · coexists with Shield **p50 ~106µs**

**2. Pendle AI Guarded Pool Factory** — 5 Invariants via `validateAIPoolSelection()`

- **Adapter SSOT** ([`pendle-pool-factory-adapter.ts`](./src/adapters/pendle/pendle-pool-factory-adapter.ts)): sync pre-flight validation for AI agent pool intents
- Gates **`PENDLE_CREATE_POOL`** / **`PENDLE_ADD_LIQUIDITY`** before mempool broadcast via optional `pendlePoolFactory` soil probe
- **5 Pool Invariants:** maturity ≥7d · yield drift ≤300bps · $100K min initial liquidity · underlying asset whitelist (`eETH` / `ETH` / `USDC`) · supported intent taxonomy
- Demo: [`tests/demo/pendle-ai-agent-flow.demo.test.ts`](./tests/demo/pendle-ai-agent-flow.demo.test.ts) · [`tests/adapters/pendle-pool-factory.test.ts`](./tests/adapters/pendle-pool-factory.test.ts)

> **DX & Pricing:** AI Agent pool creation through **Pendle AI Guarded Pool Factory** is **100% free from protocol tax**. Metered SaaS Request Credits launch in **V1.1** (Starter **$10/mo** · Pro **$99/mo** · Business **$299/mo** · Enterprise **$1,999+/mo**).

→ [`pendle-gmx-cross-guard.ts`](./src/guards/pendle-gmx-cross-guard.ts) · [`pendle-market-oracle-adapter.ts`](./src/adapters/pendle/pendle-market-oracle-adapter.ts) · [`pendle-pool-factory-adapter.ts`](./src/adapters/pendle/pendle-pool-factory-adapter.ts)

### Uniswap V3 (V1.0 Live · Arbitrum Native Spot Liquidity)

Citadel is the **pre-execution concentrated-liquidity firewall** for Uniswap V3 spot swaps on **Arbitrum One (`42161`)**:

| Layer | Module | Behavior |
|-------|--------|----------|
| **V3 Liquidity Guard** | [`uniswap-v3-adapter.ts`](./src/adapters/uniswap/uniswap-v3-adapter.ts) | `verifyUniswapPoolLiquidity()` — active CL depth · utilization cap · dynamic fee impact |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on depleted depth / cross-venue slippage |
| **CLI Demo** | `pnpm demo:uniswap` | WETH/USDC spot swap guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/uniswap-v3-adapter.test.ts`](./tests/adapters/uniswap-v3-adapter.test.ts)

### Aave V3 (V1.0 Live · Arbitrum Native Lending)

| Layer | Module | Behavior |
|-------|--------|----------|
| **HF Guard** | [`aave-v3-adapter.ts`](./src/adapters/aave/aave-v3-adapter.ts) | `verifyAaveHealthFactor()` — HF &lt; 1.15 fail-closed · cross-chain liquidation boundary |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on depleted collateral depth |
| **CLI Demo** | `pnpm demo:aave` | WETH/USDC borrow guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/aave-v3-adapter.test.ts`](./tests/adapters/aave-v3-adapter.test.ts)

### Morpho Blue (V1.0 Live · Arbitrum Vault Strategies)

| Layer | Module | Behavior |
|-------|--------|----------|
| **Vault Guard** | [`morpho-blue-adapter.ts`](./src/adapters/morpho/morpho-blue-adapter.ts) | `verifyMorphoOracle()` — oracle freshness · price deviation cap |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on toxic vault depth |
| **CLI Demo** | `pnpm demo:morpho` | jGLP rebalance guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/morpho-blue-adapter.test.ts`](./tests/adapters/morpho-blue-adapter.test.ts)

### Dune Analytics

**Live dashboard:** [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)

**Telemetry infrastructure:** **Live Event Telemetry actively streams on Sepolia Testnet**; **Arbitrum One (42161) SQL Query Indexers fully pre-compiled for production event ingestion**.

**Structured on-chain events & PEV (Prevented Exploit Volume) metric:**

- Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` — **`IntentAttested`** (live EIP-712 attestations) + **`RiskTripBlocked`** (pre-broadcast fail-closed severance) indexed in real time
- **PEV** — `SUM(blocked_intent_notional_usd)` from `RiskTripBlocked` logs; **fully operational on-chain** via Sepolia Gate
- Production SQL spec + daily reconciliation panels target Arbitrum One `42161`

→ [`docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md`](./docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md) · `scripts/emit-sepolia-telemetry-events.ts`

### Wayfinder (V1.0 Live · Arbitrum Native AI Agent Engine)

**Citadel is the native pre-execution risk firewall for the Wayfinder Agent Engine on Arbitrum One (`42161`).**

- **Native adapter SSOT:** [`wayfinder-shield.ts`](./src/adapters/wayfinder/wayfinder-shield.ts) — `wayfinderCitadelShieldHook` wires `checkSoilResistance()` (Pillar 3 soil fuse) + `verifyAgentIntent()` (8-dimension validation) before on-chain route dispatch
- **0-Gas fail-closed:** toxic soil trips and session-key violations sever the EIP-712 signing channel pre-broadcast — no Sequencer gas on blocked paths
- **Demo:** `pnpm demo:wayfinder` (Normal Route Interception) · `pnpm demo:wayfinder -- --trip` (0-Gas Fail-Closed Soil Trip) · `pnpm demo:wayfinder -- --stabilizer` (Sepolia Stabilizer 1:1 stablecoin swap)
- **Tests:** [`tests/adapters/wayfinder-shield.test.ts`](./tests/adapters/wayfinder-shield.test.ts)

### Stabilizer Protocol (V1.0 Live · Universal Sepolia Testnet Sandbox)

**Stabilizer on Arbitrum Sepolia (`421614`) is the Universal Testnet Sandbox & Cross-Pass Interoperability Layer for AI Agents.** Citadel provides **0-Gas Pre-Execution Fail-Closed Protection** for agent testnet arbitrage and rebalancing across:

| Leg | Sepolia integration | Citadel gate |
|-----|---------------------|--------------|
| **Stabilizer** | 1:1 zero-slippage USDZ / USDC / USDT / USDS swaps | [`stabilizer-adapter.ts`](./src/adapters/stabilizer/stabilizer-adapter.ts) · `evaluateStabilizerSwapGuard()` |
| **GMX v2** | Sepolia shadow-margin pre-flight · GM pool intent guards | `gmx-v2-order-payload-guards.ts` · [`tests/demo/gmx-v2-agent-flow.demo.test.ts`](./tests/demo/gmx-v2-agent-flow.demo.test.ts) |
| **Pendle** | Testnet Guarded Pool Factory · oracle TTL fuse | [`pendle-pool-factory-adapter.ts`](./src/adapters/pendle/pendle-pool-factory-adapter.ts) · [`tests/demo/pendle-ai-agent-flow.demo.test.ts`](./tests/demo/pendle-ai-agent-flow.demo.test.ts) |

**DX advantage:** Developers and auditors execute against **live Sepolia contracts** without mainnet gas or capital friction — while running the **identical `checkSoilResistance()` bytecode and risk gates** targeted for Arbitrum One (`42161`) deployment.

- **Liquidation invariants:** 15% reserve-ratio floor · Constant-Sum 1:1 capacity · USDZ/collateral >50bps de-peg guard · 60s LLM mandatory cooldown
- **Demo:** `pnpm demo:stabilizer` · `pnpm demo:stabilizer -- --trip` · `pnpm demo:wayfinder -- --stabilizer`
- **Tests:** [`tests/adapters/stabilizer-adapter.test.ts`](./tests/adapters/stabilizer-adapter.test.ts) — **192 test files | 834 PASS Clean (100% PASS)**

**Cross-Pass testnet routing (Stabilizer → GMX v2 → Pendle):**

```text
[ AI Agent · Sepolia 421614 Universal Sandbox ]
         │
         ▼  Stabilizer: 1:1 zero-slippage stablecoin rebalance
         ▼  checkSoilResistance()  (identical gate · p50 ~106µs)
         ▼  GMX v2: Sepolia shadow-margin / price-impact pre-flight
         ▼  checkSoilResistance()  (gmxPriceImpact · depth fuse)
         ▼  Pendle: Testnet Guarded Pool Factory validateAIPoolSelection()
         ▼  checkSoilResistance()  (pendleOracle · pendlePoolFactory)
         │
   ┌─────┴─────┐
   ▼           ▼
FAIL_CLOSED  ALLOW → identical Mainnet bytecode path
(0-Gas)      (pre-broadcast clearance)
```

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

### Four Major AI Agent Frameworks (V1.0 Live · Full Quad Coverage)

**World's First Pre-Execution Risk Gateway natively supporting ALL Four Major AI Agent Frameworks (Wayfinder, ElizaOS, Virtuals, LangChain).**

| Framework | Adapter SSOT | Entry point | Demo |
|-----------|--------------|-------------|------|
| **Wayfinder** | [`wayfinder-shield.ts`](./src/adapters/wayfinder/wayfinder-shield.ts) | `wayfinderCitadelShieldHook` | `pnpm demo:wayfinder` |
| **ElizaOS** | [`elizaos-citadel-plugin.ts`](./src/adapters/elizaos/elizaos-citadel-plugin.ts) | `evaluateElizaCitadelAction()` | `pnpm demo:elizaos` |
| **Virtuals (GAME)** | [`virtuals-game-adapter.ts`](./src/adapters/virtuals/virtuals-game-adapter.ts) | `evaluateVirtualsGameTask()` | `pnpm demo:virtuals` |
| **LangChain / LangGraph** | [`langchain-citadel-tool.ts`](./src/adapters/langchain/langchain-citadel-tool.ts) | `CitadelRiskGuardTool` | `pnpm demo:langchain` |
| **Stabilizer** | [`stabilizer-adapter.ts`](./src/adapters/stabilizer/stabilizer-adapter.ts) | `evaluateStabilizerSwapGuard()` | `pnpm demo:stabilizer` |

Each adapter resides in an **isolated module** under `src/adapters/{framework}/` with a dedicated CLI demo and Vitest suite.

```bash
pnpm demo:wayfinder · pnpm demo:elizaos · pnpm demo:virtuals · pnpm demo:langchain · pnpm demo:stabilizer
pnpm demo:quad              # All four AI frameworks combined → ALLOW
pnpm demo:quad -- --trip    # All four frameworks → FAIL_CLOSED
pnpm demo:matrix                    # Full 7-protocol matrix (--loop=all)
pnpm demo:matrix -- --loop=perp     # Pendle → GMX → dual perp hedge (HL + Variational)
pnpm demo:matrix -- --loop=perp --hedge=variational   # Variational Omni RFQ hedge leg
pnpm demo:matrix -- --loop=perp --hedge=hyperliquid   # Hyperliquid L1 hedge leg only
pnpm demo:matrix -- --loop=perp --hedge=both          # HL + Variational (default perp hedge)
pnpm demo:matrix -- --loop=spot     # Uniswap V3 → Aave V3 → Morpho Blue spot loop
pnpm demo:matrix -- --healthy-only  # Nominal PASS (no R20 sever)
```

- **Tests:** [`wayfinder-shield.test.ts`](./tests/adapters/wayfinder-shield.test.ts) · [`elizaos-plugin.test.ts`](./tests/adapters/elizaos-plugin.test.ts) · [`virtuals-adapter.test.ts`](./tests/adapters/virtuals-adapter.test.ts) · [`langchain-tool.test.ts`](./tests/adapters/langchain-tool.test.ts) · [`stabilizer-adapter.test.ts`](./tests/adapters/stabilizer-adapter.test.ts) — **192 test files | 834 PASS Clean (100% PASS)**

### SDK Decorator & Supplementary Demos

All five **V1.0 Live Native Integrations** above use `checkSoilResistance()` + `verifyAgentIntent()` via isolated `src/adapters/` modules. The `withCitadelShield` decorator ([`src/sdk/decorator.ts`](./src/sdk/decorator.ts)) provides zero-touch wrapping for custom agent hooks:

```ts
import { withCitadelShield } from "@slivervine/citadel-sdk";

const execute = withCitadelShield(async (intent) => agent.swap(intent));
```

Supplementary evaluator harness: [`examples/agent-interceptor-demo.ts`](./examples/agent-interceptor-demo.ts) (`tsx examples/agent-interceptor-demo.ts`) · legacy TS/Python reference scripts in [`examples/adapters/`](./examples/adapters/)

---

## Innovation & Real Problem Solving — AI Behavioral Safety Substrate

1. **Native LLM Back-off & Retry Intercepts**: Active **60-second cooldown lock** per `agentId` in `withCitadelShield` ([`src/sdk/decorator.ts`](./src/sdk/decorator.ts)) prevents token-burning infinite retry loops and **RPC Rate-Limit Self-DoS** when transactions fail closed — surfaces `[Citadel Back-off] MANDATORY_COOLDOWN_ACTIVE` across all V1.0 agent adapters (`pnpm demo:elizaos -- --trip` · `pnpm demo:virtuals -- --trip` · `pnpm demo:langchain -- --trip`).
2. **Non-Semantic Bytecode Predicate Assertions**: Evaluates **raw bytecode parameters** at **p50 ~106µs** Edge Wasm rather than natural language — rendering the system immune to **Indirect Prompt Injections** at the signing layer ([Technical Specification §0.1](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#01-bytecode-predicate-verification-v10--erc-7715--post-grant-design-spec)).
3. **Dynamic Threshold Obfuscation**: Cryptographic pseudo-random **±2–5 bps jitter** on slippage / depth cutoffs ([`soil-threshold-jitter.ts`](./src/services/risk-control-lib/soil-threshold-jitter.ts)) prevents MEV searchers from predicting exact **50 bps** fuse boundaries off-chain.

---

## Official Rubric — CLI Proof Pointers

| Criterion (25% each) | One-liner | Verify |
|---------------------|-----------|--------|
| **Smart Contract Quality** | Immutable consume-once Gate on mainnet | Arbiscan Tx above · `SliverVineGate/test/` |
| **Product-Market Fit** | GMX builder lane + Agent SDK + Pendle Sentinel + **Pendle AI Guarded Pool Factory** | `gmx-v2-order-payload.ts` · `decorator.ts` · `pendle-market-oracle-adapter.ts` · `pendle-pool-factory-adapter.ts` |
| **Innovation & Creativity** | Pre-consensus intent firewall + PEV + AI Behavioral Safety Substrate | This brief · SUBMISSION § Innovation |
| **Real Problem Solving** | 0-Gas pre-broadcast death window + LLM back-off cooldown | `--trip` adapter demos · `lostUsd ≡ 0` |

---

## 88% Defense Mesh & 12% Post-Grant R&D Roadmap

> **Formal definition (SSOT):** [Risk Mitigation & Disclaimer Framework §0.1](./docs/architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) — **100%** on-chain risk surface = **88%** pre-broadcast mesh + **12%** systemic residuals · **80/20 Pareto** targets acute microstructure tail in Pillar 3.

### Industry Baseline (~80% or Below)

Traditional DeFi / Agent risk checks rely on **post-hoc analytics** or **mutable pause functions**, leaving gaps for MEV sandwiching, LLM retry token-burn, and session key exploitation.

### SliverVine V1.0 Delivered (**88% Defense Coverage**)

- 🟢 **Sub-ms Pre-Broadcast Severance** — 0-Gas Wasm soil fuse (p50 ~106µs) blocks MEV & toxic fills before mempool queues.
- 🟢 **AI Behavioral Safety Substrate** — 60s LLM cooldown lock prevents token-burning infinite retry loops; dynamic jitter (±2–5 bps) prevents MEV threshold sniping.
- 🟢 **0-Proxy Immutable Gate** — No admin upgrade backdoors; EIP-712 consume-once attestation (`consumed[digest]`).
- 🟢 **Session Key Blast-Radius Isolation** — Scoped `ORDER_EXECUTE` + **$5,000** notional cap (`SESSION_KEY_NOTIONAL_CAP_USD`).
- 🟢 **Oracle & RPC Resilience** — 30s oracle-lag fail-closed (`ORACLE_LAG_DEADLOCK`) + Honeypot trap RPC defense.

### The Remaining **12%** (Why We Need This Foundation Grant)

Residual systemic out-of-scope risks: **TEE enclave supply chains**, **multi-RPC eclipse consensus**, and **protocol-level DeFi flash-loan black swans**.

Grant allocation directly fuels **V2.0 R&D**:

1. **Milestone 1 (Weeks 2–3 post-grant approval)** — Submit official native plugin Pull Requests (PRs) to **ElizaOS** (`@elizaos/plugin-citadel`) and **Virtuals GAME** (`@virtuals/plugin-citadel`) monorepos, transitioning from the current zero-overhead SDK Wrapper decorator to official upstream integration.
2. **TEE / Enclave Hardware Key Isolation** (AWS KMS / SGX Enclaves).
3. **Multi-RPC Quorum Consensus Verification** (anti–RPC eclipse spoofing).
4. **Decentralized PEV (Prevented Exploit Volume) Intelligence Feed**.

### V1.0 Production Scope

- **Ephemeral Ignition Signers** — Bootstrap Ignition Keys (`0x1111…`/`0x2222…`) on Mainnet Gate `0xb174…` enable public auditability; production HSM rotation via native governance
- **GMX v2** — dry-run / Vitest verified pre-flight guards; mainnet GM pool fill scheduled post-Grant M6
- **Pendle** — Institutional Safety Sentinel (60s TTL Oracle Fuse · 200bps Jitter Guard) + **AI Guarded Pool Factory** (`validateAIPoolSelection()` · 5 Invariants); protocol-tax-free · SaaS Request Credits
- **Dune** — Sepolia live event stream; Arbitrum One (`42161`) SQL schemas pre-compiled for production ingest
- **Commercial** — v1.0 public open gateway (`public` tier · 5 RPS headers) · V1.1 4-tier SaaS roadmap · 10 bps CaaS = V2.0
- **Agent SDK** — **V1.0 Live Native Integrations** for Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer (`src/adapters/`) · `withCitadelShield` decorator · `pnpm demo:quad` · **Milestone 1 (Weeks 2–3 post-grant):** upstream PRs to `@elizaos/plugin-citadel` + `@virtuals/plugin-citadel`
- **Stylus** — V2.0 dual-execution Rust coprocessor (`check_soil_resistance_stylus` · `pnpm build:stylus`); planned EIP-1967 upgradeable proxy deploy — live gateway = immutable Solidity Gate on Arbitrum One
- **Auto severance** — `FLAGS_*` bitmask trips invoke `severSigningChannel()` inside `risk-engine-core` / `soil-resistance` without external orchestration; **Variational RFQ** invariants (**Bits 12–13**: `FLAG_VARIATIONAL_STALE_QUOTE` · `FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED`) integrated in `evaluateVariationalFlags()` and bound to `FLAGS_AUTO_SEVER_MASK`
- **Sliding-window OI** — 30s pending GMX skew accumulator blocks split-payload imbalance poisoning
- **Monte Carlo** — 87.39% toxic flow blocked in 10,000-run simulation; nominal modeled capital, not live TVL

---

**SilverVine Labs** · `grants@silvervinelabs.com` · [Live Dune Dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · [Headless Audit Endpoint](https://bedeltawater.slivervine.xyz/api/grant-audit)
