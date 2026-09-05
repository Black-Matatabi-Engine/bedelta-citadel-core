> **中文參考譯本 · 英文原文為 Grant SSOT**  
> English SSOT: [JUDGE_BRIEF.md](./JUDGE_BRIEF.md)

# JUDGE_BRIEF.md — SliverVine Citadel Shield（1 頁 Buildathon 簡報）

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
| **Worker Bundle** | **69.32 KiB gzip** (`pnpm bundle:measure` · `pass: true` · &lt;70 KiB) |
| **Tests** | `pnpm test` → **192 test files | 836 PASS Clean (100% PASS)** · **3-Tier Demo Suite** (`demo:{gmx,hl,pendle,uniswap,aave,morpho}` · `demo:{wayfinder,elizaos,virtuals,langchain,quad}` · `demo:{stabilizer,e2e}`) · `pnpm demo` (12 Tri-Pillar) · full matrix → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) |
| **Stylus Probe** | **9/9 PASS（50bps 對齊）** · `pnpm build:stylus` |
| **Branch Policy** | `main`（Grant Public SSOT）vs `feat/wasm-opsec-kernel-experiment`（Closed WASM Kernel） |
| **Deep docs** | [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) · [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) |

> **Headless Infrastructure Protocol:** 核心互動為 API/SDK 原生（`@slivervine/citadel-sdk`）與 CLI HUD。

---

## Production Architecture Declarations

> SliverVine Citadel Shield v1.0 生產範圍權威聲明。**Baseline:** `main` — **192 test files / 836 PASS Clean (100% PASS)**。

| # | Domain | Production declaration |
|---|--------|------------------------|
| **1** | Ephemeral Ignition Signers | Arbitrum One Gate `0xb174118b…` 採用 **`0x1111…` / `0x2222…` Ephemeral Verification Signers** 供公開可審計性，不暴露生產 HSM 基礎設施。Gate 形狀 = consume-once EIP-712；生產輪替透過原生治理至多簽。 |
| **2** | GMX v2 Pre-Flight Guards | GMX v2 執行防護透過 **Vitest CLI + dry-run pipelines** 驗證（`pnpm demo` · `tests/demo/gmx-v2-agent-flow.demo.test.ts` · `gmx-v2-order-payload-guards.ts`）— 於 live GM pool 資本部署前 **0-Gas pre-flight severance**。主網 GM fill 排程於 Grant 後 M6。 |
| **3** | Pendle Core Pillar 3 | **V1.0 雙交付物：** (1) **Pendle Institutional Safety Sentinel** — 60s TTL Oracle Fuse & 200bps Jitter Guard · (2) **Pendle AI Guarded Pool Factory** — 5 Invariants via `validateAIPoolSelection()` · **150 bps** implied-yield shock fuse。AI pool 建立/驗證 **免協議稅**；SaaS Request Credits 計量於 **V1.1** 推出。→ [§3 Pendle](#pendle-finance-v10-live--core-pillar-3) |
| **4** | Telemetry Infrastructure | **Live Event Telemetry 於 Sepolia Testnet 活躍串流**；**Arbitrum One (42161) SQL Query Indexers 已完整預編譯供生產事件攝取**（Queries 0–3 · [`DUNE_DASHBOARD_SPECIFICATION.md`](./docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md)）。Sepolia live stream 與 One production SQL 記載為獨立部署面。 |
| **5** | Agent Integration | **V1.0 Live Native Integrations** — Wayfinder · ElizaOS · Virtuals (GAME) · LangChain · Stabilizer ([`src/adapters/`](#four-major-ai-agent-frameworks-v10-live--full-quad-coverage)) · 獨立 CLI `pnpm demo:{wayfinder,elizaos,virtuals,langchain,stabilizer,quad}` · **192 test files | 836 PASS Clean (100% PASS)** |
| **6** | 0-Gas Off-Chain Severance | Arbitrum One Gate（`0xb174…`）**工程化為 0-Gas Pre-Execution Off-Chain Severance**。Citadel Risk Gates 於 Edge **mempool 提交前**中止受損 payload 簽名，維持 **L2 state space cleanliness** — 熱路徑不消耗鏈上 gas。→ [Deployment Architecture](#deployment-architecture-arbitrum-one-0-gas-off-chain-severance) |
| **7** | Dune Analytics | **Live Event Telemetry 於 Sepolia Testnet 活躍串流**；**Arbitrum One (42161) SQL Query Indexers 已完整預編譯**供生產事件攝取。→ [Dune Analytics](#dune-analytics) |
| **8** | Commercial Model | **v1.0 = 公開 Open Gateway**（`X-Citadel-Tier: public`）· **V1.1 = 四層 SaaS**（Milestone 1）· **10 bps CaaS = V2.0**。→ [Commercial Model](#commercial-model-saas-vs-caas) |

### Deployment Architecture (Arbitrum One 0-Gas Off-Chain Severance)

> **Arbitrum One Gate（`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`）刻意工程化為 0-Gas Pre-Execution Off-Chain Severance。** Citadel Risk Gates（`checkSoilResistance()` · `severSigningChannel()`）於 Cloudflare Edge **mempool 提交前**中止受損 payload 簽名，維持 **Arbitrum L2 state space cleanliness** — 觸發路徑不消耗 Sequencer gas；鏈上 Gate 僅為已清算意圖錨定 consume-once EIP-712 attestation。

### Commercial Model（V1.0 公開 Gateway · V1.1 SaaS · V2.0 CaaS）

| Version | Architecture | Notes |
|---------|--------------|-------|
| **v1.0（現行 — 提交基線）** | **Public Open Gateway** | Buildathon / hackathon 評測 · 輕量 Edge RPS 限流（IP/header）· `X-Citadel-Tier: public` · `X-Citadel-RPS-Limit: 5` |
| **V1.1（Grant 後 Milestone 1）** | **KV API Key 計量 + 四層 SaaS** | 下方付費分層 · 多租戶 rate limiter |
| **V2.0（roadmap）** | **CaaS protocol fee-sharing** | 執行前風險檢查 **10 bps** · 與 v1.0 GMX +10 bps `uiFeeReceiver` 分離 |

#### V1.0 提交基線（現行）

- **公開 open gateway** 供 judges 與 developers 評測 — 無需付費 API Key。
- **防護：** 輕量 Edge RPS rate limiter（header/IP）保護 memory queue 免受 Sybil DoS。
- **Demo 標頭：** 所有 gateway 回應附帶 `X-Citadel-Tier: public` · `X-Citadel-RPS-Limit: 5`。

#### V1.1 路線圖 — 四層商業模型（Milestone 1 Post-Grant）

| 層級 | 月費 | 年付（按年計費） | RPS | 意圖/月 | 權益 |
|------|------|-----------------|-----|---------|------|
| **Starter Shield** | **$10** | **$96/yr** | **5** | **100k** | B2B 反 Sybil 入門門檻 |
| **Pro Guard** | **$99** | **$950/yr** | **50** | **5M** | WASM 閉源核心 · R17 日損熔斷 |
| **Business Citadel** | **$299** | **$2,870/yr** | **200** | **20M** | 優先 memory queue · R20 自動切斷 · 租戶隔離 |
| **Enterprise Dedicated** | **$1,999+** | 客製合約 | **1,000+** | 客製 | 專用 Cloudflare Edge 節點 · 客製 Rust/WASM 風控模組 · 私有 MEV 路由 |

> **範圍誠實性：** v1.0 提交僅交付 **public open gateway**。**四層付費模型為 V1.1 Milestone 1**（Cloudflare KV API Key 計量）。各層級均為 **best-effort**（無 uptime SLA）。

---

## 30-Second Identity

SliverVine **不是** Wasm 滑點計算器。它是**共識前執行安全原語**：Cloudflare Edge 亞毫秒意圖清算（`checkSoilResistance()`，p50 ~106µs · **`pkg/soil_core.wasm` — 獨立於 AA**）**加上** Arbitrum One 上不可變 **EIP-712 consume-once `SliverVineGate`**。ZeroDev Kernel v3 為**可選 Pillar 1 AA 交付層**（`USE_ZERODEV_AA` 預設關閉）— 非亞毫秒延遲來源。有毒 AI Agent UserOp 於 Sequencer 佇列**之前**切斷 — 阻斷路徑 **0-Gas**。

**主要執行邊界：** 完整 Arbitrum 原生多協議覆蓋（GMX v2、Pendle、Uniswap V3、Aave V3、Morpho Blue、**Variational Omni RFQ**）+ 跨鏈高頻訂單簿防禦（Hyperliquid L1 Session Key Adapter）+ 可選 Arbitrum 原生 RFQ OLP 對沖。

**Hyperliquid** 為與 Arbitrum 永續流動性生態同源的**獨立 L1 高頻訂單簿 AppChain** — session-key 對沖 adapter，非 Arbitrum 原生執行。

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

## Why Citadel Shield is NOT a Normal RPC Gateway（Intent & Calldata Layer）

Citadel Shield 運作於 **Intent & Calldata Layer** — 介於 LLM 推理與 EIP-712 簽名之間 — 非被動 JSON-RPC 中繼。於 hot-key 簽名管道開啟前驗證語意意圖（venue allowlist、calldata 形狀、risk bitmask）。

### LLM vs Citadel 延遲 — ASCII 工作流

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  LLM Reasoning Layer              Citadel Shield Pre-Flight        On-Chain  │
│  (Prompt → Plan → Calldata)       Invariant Check                  Sign/Chain│
│  ████████████████████████████     ██                             ─────────   │
│  ~1,000ms – 5,000ms               ~14.0µs – 106µs                (if cleared)  │
└──────────────────────────────────────────────────────────────────────────────┘
```

| 維度 | 一般 RPC Gateway | Citadel Shield（Intent Layer） |
|------|-----------------|-------------------------------|
| **層級** | 傳輸中繼 | 簽名前意圖防火牆 |
| **延遲** | 50–300ms+ RTT | **~14.0µs** invariant · **~106µs** matrix（Edge `<106µs`） |
| **驗證** | 不透明轉發 | Venue allowlist · soil fuse · R17/R20 bitmask |
| **失敗** | 轉發錯誤 | **FAIL-CLOSED** · **0-Gas** · `severSigningChannel()` |
| **AI 安全** | 無 | 幻覺 venue 於簽名前切斷 |
| **Demo** | — | `pnpm demo:quad` · `pnpm demo:wayfinder -- --trip` |

### Fail-Closed 演練 — AI Prompt 幻覺

**情境：** Agent 幻覺 **Aerodrome** 路由，政策僅 allowlist **GMX v2 / Pendle / Uniswap V3**（Arbitrum One）。

1. LLM 產出不支援 venue calldata（`~2,000ms`）。
2. Citadel Intent Layer 判定 Aerodrome 不在 bitmask → **~14.0µs** **FAIL-CLOSED**。
3. `severSigningChannel()` — **0-Gas**，無 mempool 廣播。
4. 重現：`pnpm demo:quad -- --trip` · `pnpm demo:matrix -- --trip`

## Judge Quickstart Instructions

```bash
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (192 files / 836 tests)
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

*工具*事後報告風險。*協議原語*以鏈上不變量與 fail-closed 共識前清算**綁定執行**。

---

## Ecosystem Synergy — Arbitrum Open House Buildathon Priorities

### Offchain Labs Core / Arbitrum Foundation

**精簡執行 · 0-Gas 廣播前切斷 · 主網 gate `0xb174…`：**

- Sub-ms Edge `checkSoilResistance()`（p50 ~106µs）— 無鏈上熱路徑膨脹
- 有毒意圖於 Sequencer 佇列**之前**切斷 → 阻斷路徑 **0-Gas**
- Live **Arbitrum One** consume-once `SliverVineGate` 位於 `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`
- **0-Gas off-chain severance：** Gate **設計為鏈下切斷** — Risk Gates 於 Edge 攔截簽名並於 mempool 提交**前**觸發，維持 L2 state space cleanliness

### GMX Protocol

**+10 bps builder lane & depth/slippage fuse · Dry-run verification (0-Gas pre-flight):**

- 合格 GM payload 路由 `uiFeeReceiver` builder fee
- DataStore 廣播前執行 soil fuse（cross-venue slippage + depth）
- **Vitest CLI + dry-run pipelines 已驗證** — `pnpm demo` · `tests/demo/gmx-v2-agent-flow.demo.test.ts` · `gmx-v2-order-payload-guards.ts`；live GM pool 資本部署前 **0-Gas pre-flight protection**（主網 fill 為 Grant 後里程碑，非未測試 v1.0 缺口）

### Pendle Finance (V1.0 Live · Core Pillar 3)

V1.0 交付**兩項互補 Pendle 整合** — 機構安全層，非收益產品：

**1. Pendle Institutional Safety Sentinel** — 60s TTL Oracle Fuse & 200bps Jitter Guard

- **Dynamic Market Oracle** ([`pendle-market-oracle-adapter.ts`](./src/adapters/pendle/pendle-market-oracle-adapter.ts)): sync in-memory `ingest()` / `resolve()` — **no hot-path I/O** · **TTL default 60s** · emits **`PENDLE_ORACLE_STALE`** on missing / stale / invalid feeds
- **Registry hydration** ([`pendle-pt-registry.ts`](./src/adapters/pendle/pendle-pt-registry.ts)): `hydrateFromOracle` overrides `impliedYield`, `ptPriceInAsset`, `liquidityConstant`, `expirySec`
- **Soil fuse wiring**: `pendleOracle` + `pendleCrossGuard` → `checkSoilResistance()` · expiry **<7d** + yield jitter **>200 bps** → fail-closed
- **Shadow margin cross-check** vs GMX maintenance before risk-increasing intents ([`pendle-gmx-cross-guard.ts`](./src/guards/pendle-gmx-cross-guard.ts))
- 保護 PT/YT 資本免於清算黑洞 — **非競爭性收益產品** · 與 Shield **p50 ~106µs** 共存

**2. Pendle AI Guarded Pool Factory** — 5 Invariants via `validateAIPoolSelection()`

- **Adapter SSOT** ([`pendle-pool-factory-adapter.ts`](./src/adapters/pendle/pendle-pool-factory-adapter.ts)): sync pre-flight validation for AI agent pool intents
- Gates **`PENDLE_CREATE_POOL`** / **`PENDLE_ADD_LIQUIDITY`** before mempool broadcast via optional `pendlePoolFactory` soil probe
- **5 Pool Invariants:** maturity ≥7d · yield drift ≤300bps · $100K min initial liquidity · underlying asset whitelist (`eETH` / `ETH` / `USDC`) · supported intent taxonomy
- Demo: [`tests/demo/pendle-ai-agent-flow.demo.test.ts`](./tests/demo/pendle-ai-agent-flow.demo.test.ts) · [`tests/adapters/pendle-pool-factory.test.ts`](./tests/adapters/pendle-pool-factory.test.ts)

> **DX & Pricing:** 透過 **Pendle AI Guarded Pool Factory** 的 AI Agent pool 建立與參數驗證 **100% 免協議稅**。計量 SaaS Request Credits 於 **V1.1** 推出（Starter **$10/mo** · Pro **$99/mo** · Business **$299/mo** · Enterprise **$1,999+/mo**）。

→ [`pendle-gmx-cross-guard.ts`](./src/guards/pendle-gmx-cross-guard.ts) · [`pendle-market-oracle-adapter.ts`](./src/adapters/pendle/pendle-market-oracle-adapter.ts) · [`pendle-pool-factory-adapter.ts`](./src/adapters/pendle/pendle-pool-factory-adapter.ts)

### Uniswap V3 (V1.0 Live · Arbitrum Native Spot Liquidity)

Citadel 為 **Arbitrum One (`42161`)** 上 Uniswap V3 現貨交換的**執行前集中流動性防火牆**：

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

**Telemetry infrastructure:** **Live Event Telemetry 於 Sepolia Testnet 活躍串流**；**Arbitrum One (42161) SQL Query Indexers 已完整預編譯供生產事件攝取**。

**Structured on-chain events & PEV (Prevented Exploit Volume) metric:**

- Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` — **`IntentAttested`**（live EIP-712 attestations）+ **`RiskTripBlocked`**（pre-broadcast fail-closed severance）即時索引
- **PEV** — `SUM(blocked_intent_notional_usd)` from `RiskTripBlocked` logs；透過 Sepolia Gate **於鏈上完全運作**
- Production SQL spec + daily reconciliation panels target Arbitrum One `42161`

→ [`docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md`](./docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md) · `scripts/emit-sepolia-telemetry-events.ts`

### Wayfinder (V1.0 Live · Arbitrum Native AI Agent Engine)

**Citadel 為 Arbitrum One (`42161`) 上 Wayfinder Agent Engine 的原生執行前風險防火牆。**

- **Native adapter SSOT:** [`wayfinder-shield.ts`](./src/adapters/wayfinder/wayfinder-shield.ts) — `wayfinderCitadelShieldHook` wires `checkSoilResistance()` (Pillar 3 soil fuse) + `verifyAgentIntent()` (8-dimension validation) before on-chain route dispatch
- **0-Gas fail-closed:** toxic soil trips and session-key violations sever the EIP-712 signing channel pre-broadcast — no Sequencer gas on blocked paths
- **Demo:** `pnpm demo:wayfinder` (Normal Route Interception) · `pnpm demo:wayfinder -- --trip` (0-Gas Fail-Closed Soil Trip) · `pnpm demo:wayfinder -- --stabilizer` (Sepolia Stabilizer 1:1 stablecoin swap)
- **Tests:** [`tests/adapters/wayfinder-shield.test.ts`](./tests/adapters/wayfinder-shield.test.ts)

### Stabilizer Protocol (V1.0 Live · Universal Sepolia Testnet Sandbox)

**Arbitrum Sepolia (`421614`) 上 Stabilizer 為 AI Agent 的 Universal Testnet Sandbox 與 Cross-Pass 互操作層。** Citadel 為 agent testnet 套利與再平衡提供 **0-Gas Pre-Execution Fail-Closed Protection**：

| Leg | Sepolia integration | Citadel gate |
|-----|---------------------|--------------|
| **Stabilizer** | 1:1 zero-slippage USDZ / USDC / USDT / USDS swaps | [`stabilizer-adapter.ts`](./src/adapters/stabilizer/stabilizer-adapter.ts) · `evaluateStabilizerSwapGuard()` |
| **GMX v2** | Sepolia shadow-margin pre-flight · GM pool intent guards | `gmx-v2-order-payload-guards.ts` · [`tests/demo/gmx-v2-agent-flow.demo.test.ts`](./tests/demo/gmx-v2-agent-flow.demo.test.ts) |
| **Pendle** | Testnet Guarded Pool Factory · oracle TTL fuse | [`pendle-pool-factory-adapter.ts`](./src/adapters/pendle/pendle-pool-factory-adapter.ts) · [`tests/demo/pendle-ai-agent-flow.demo.test.ts`](./tests/demo/pendle-ai-agent-flow.demo.test.ts) |

**DX advantage:** 開發者與審計者於**即時 Sepolia 合約**上執行，無主網 gas 或資本摩擦 — 同時執行針對 Arbitrum One (`42161`) 部署的**相同 `checkSoilResistance()` bytecode 與 risk gates**。

- **Liquidation invariants:** 15% reserve-ratio floor · Constant-Sum 1:1 capacity · USDZ/collateral >50bps de-peg guard · 60s LLM mandatory cooldown
- **Demo:** `pnpm demo:stabilizer` · `pnpm demo:stabilizer -- --trip` · `pnpm demo:wayfinder -- --stabilizer`
- **Tests:** [`tests/adapters/stabilizer-adapter.test.ts`](./tests/adapters/stabilizer-adapter.test.ts) — **192 test files | 836 PASS Clean (100% PASS)**

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

**全球首個原生支援全部四大 AI Agent 框架（Wayfinder、ElizaOS、Virtuals、LangChain）的執行前風險閘道。**

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

- **Tests:** [`wayfinder-shield.test.ts`](./tests/adapters/wayfinder-shield.test.ts) · [`elizaos-plugin.test.ts`](./tests/adapters/elizaos-plugin.test.ts) · [`virtuals-adapter.test.ts`](./tests/adapters/virtuals-adapter.test.ts) · [`langchain-tool.test.ts`](./tests/adapters/langchain-tool.test.ts) · [`stabilizer-adapter.test.ts`](./tests/adapters/stabilizer-adapter.test.ts) — **192 test files | 836 PASS Clean (100% PASS)**

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
- **Commercial** — v1.0 公開 open gateway（`public` tier · 5 RPS 標頭）· V1.1 四層 SaaS 路線圖 · 10 bps CaaS = V2.0
- **Agent SDK** — **V1.0 Live Native Integrations** for Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer (`src/adapters/`) · `withCitadelShield` decorator · `pnpm demo:quad` · **Milestone 1 (Weeks 2–3 post-grant):** upstream PRs to `@elizaos/plugin-citadel` + `@virtuals/plugin-citadel`
- **Stylus** — V2.0 dual-execution Rust coprocessor (`check_soil_resistance_stylus` · `pnpm build:stylus`)；**9/9 PASS（50bps 對齊）**；planned EIP-1967 upgradeable proxy deploy — live gateway = immutable Solidity Gate on Arbitrum One
- **Auto severance** — `FLAGS_*` bitmask trips invoke `severSigningChannel()` inside `risk-engine-core` / `soil-resistance` without external orchestration; **Variational RFQ** invariants (**Bits 12–13**: `FLAG_VARIATIONAL_STALE_QUOTE` · `FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED`) integrated in `evaluateVariationalFlags()` and bound to `FLAGS_AUTO_SEVER_MASK`
- **Sliding-window OI** — 30s pending GMX skew accumulator blocks split-payload imbalance poisoning
- **Monte Carlo** — 87.39% toxic flow blocked in 10,000-run simulation; nominal modeled capital, not live TVL
- **Dual-branch** — `main`（Grant Public SSOT）vs `feat/wasm-opsec-kernel-experiment`（Closed WASM Kernel 實驗分支）

---

**SilverVine Labs** · `grants@silvervinelabs.com` · [Live Dune Dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · [Headless Audit Endpoint](https://bedeltawater.slivervine.xyz/api/grant-audit)
