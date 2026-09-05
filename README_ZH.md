> **中文參考譯本 · 英文原文為 Grant SSOT**  
> English SSOT: [README.md](./README.md)

# SliverVine Citadel Shield：Arbitrum 上 AI Agent 的共識前意圖防火牆與執行安全原語

**SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)** · SilverVine Labs

[![Vitest](https://img.shields.io/badge/Vitest-836%20PASS%20%28192%20files%29-brightgreen?logo=vitest)](./docs/VERIFICATION_MATRIX.md)
[![V2.0 Stylus Probe](https://img.shields.io/badge/V2.0_Stylus_Probe-9%2F9_PASS_(50bps_aligned)-blue?logo=rust)](./contracts/stylus-probe/)
[![risk-control.ts coverage](https://img.shields.io/badge/risk--control.ts-100%25%20coverage-success?logo=vitest)](./src/services/risk-control.ts)
[![Chaos Matrix](https://img.shields.io/badge/Chaos%20Matrix-255%2F255%20Fail--Closed-blue?logo=github)](./docs/VERIFICATION_MATRIX.md)
[![Benchmark Latency](https://img.shields.io/badge/Benchmark-p50_106%CE%BCs_E2E_Shield_(Kernel_200ns)-blueviolet?logo=speedtest)](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#31-microsecond-moats)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue?logo=typescript)](./tsconfig.json)
[![License](https://img.shields.io/badge/License-BUSL--1.1-orange)](./LICENSE)
[![Foundry Citadel Gate](https://img.shields.io/badge/Foundry-Forge_Test_Passed-brightgreen?logo=solidity)](./SliverVineGate)
[![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-Live_42161-28A0F0?logo=arbitrum)](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1)


<p align="center"><img src="public/brand/Detox_Sanctuary_wm.webp" alt="SliverVine Citadel Gate - Detox Sanctuary" width="600" style="border-radius: 8px;"></p>

> **⚡ 共識前意圖防火牆：** 於 **p50 ~106 μs** 完成亞毫秒級意圖清算 — 有毒 payload 在進入 Arbitrum Sequencer 佇列、Bundler 入口或 MEV mempool **之前**即被切斷（0-Gas fail-closed）。
>
> *亞毫秒端到端 Shield 路徑（純數學核心：200 ns / 0.0002 ms）· Session Key 驗證 SLO &lt; 1.0ms · **主要執行邊界：** 完整 Arbitrum 原生多協議覆蓋（GMX v2、Pendle、Camelot V3、Radiant Capital、JonesDAO、**Variational Omni RFQ**）+ 跨鏈高頻訂單簿防禦（Hyperliquid L1 Session Key Adapter）+ 可選 Arbitrum 原生 RFQ OLP 對沖。*

**哲學 — BeΔ (BeDelta Living Water v1.0)：** **Be** 靈感來自 Bruce Lee 的 *"Be Water, My Friend"* — 流動、自適應的意圖路由與無摩擦多鏈執行，在不破壞不變量的前提下順應場所約束。**Δ (Delta)** 為**市場 Delta 中性**的數學符號 — 透過 GMX v2 GM + Hyperliquid 1× 空頭包絡實現方向性曝險中性化。**SliverVine** = 碎片化意圖保護與鋼鐵級交易執行 · **SliverVine Citadel Shield** = 將兩者綁定的共識前執行安全原語。

**Protocol:** SliverVine · **Entity:** SilverVine Labs · **Contact:** `grants@silvervinelabs.com` · **B2B:** `hello@silvervinelabs.com`  
**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)  

> **鏈上 vs 鏈下 SSOT：** **Arbitrum One 即時閘道**（`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`，chainId **42161**）為不可變的 **Solidity EIP-712 `SliverVineGate`** — [Mainnet Ignition Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6)。**Arbitrum Stylus**（[`contracts/stylus-probe/`](./contracts/stylus-probe/)）為 **V2.0 雙執行 Rust 協處理器**（`stylus_core.rs` 中的 `check_soil_resistance_stylus`；`pnpm build:stylus`）— 僅本地探針；**未**部署於主網。計畫中的鏈上 rollout 採用 **EIP-1967 可升級代理**（零鎖定；多簽治理實作槽）。生產熱路徑 soil fuse 於 Cloudflare Edge 透過 `pkg/soil_core.wasm` 執行（`checkSoilResistance()` p50 ~106µs）。
**Live Dune Telemetry Portal:** [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · **PEV 追蹤**透過 Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` 於鏈上完全運作（`RiskTripBlocked` → `SUM(blocked_intent_notional_usd)`）· **Headless Audit Endpoint:** [`https://bedeltawater.slivervine.xyz/api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) · **Arbitrum One Gate** `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Mainnet Ignition Tx [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6)  

> **Headless Infrastructure Protocol：** 核心互動為 API/SDK 原生（`@slivervine/citadel-sdk`）與 CLI HUD。  
**Package:** [`@slivervine/citadel-sdk`](./src/sdk/README.md) (Apache-2.0) · **Judge entry:** [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) · [Verification Matrix](./docs/VERIFICATION_MATRIX.md) · [Technical Specification](./docs/architecture/01_TECHNICAL_SPECIFICATION.md)

**核心產品：** **SliverVine Citadel Shield** 是 Arbitrum 上 AI Agent 的**共識前意圖防火牆與執行安全原語** — 非獨立 Wasm 風險檢查。鏈下 Edge 反射（`checkSoilResistance()`）+ 鏈上 **EIP-712 consume-once `SliverVineGate`** 構成協議級執行安全層 — [§1 Product Identity](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#1-core-product-identity) · [Three Pillars pipeline](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#0-unified-institutional-pre-execution-pipeline)。

### 核心架構強化（V1.0 · 自動切斷 + 拆分 Payload 防禦）

| Layer | Module | Behavior |
|-------|--------|----------|
| **Auto R20 severance** | [`risk-severance.ts`](./src/core/risk-severance.ts) · [`risk-engine-core.ts`](./src/core/risk-engine-core.ts) | 任何 `FLAGS_*` 觸發（`IMBALANCE`、`NAV`、`YIELD_SHOCK`、`DEPEG` 等）於核心狀態流內呼叫 `severSigningChannel()` — 無 demo 腳本編排 |
| **Sliding-window OI** | [`pending-exposure-window.ts`](./src/core/pending-exposure-window.ts) | 30s 累加器追蹤 pending GMX skew/notional — 中和低於閾值的拆分 payload 投毒 |
| **Stylus coprocessor** | [`stylus_core.rs`](./contracts/stylus-probe/src/stylus_core.rs) | `#![no_std]` `check_soil_resistance_stylus(flags, risk_vector)` — 與 Edge 雙執行對等；`pnpm build:stylus` · **9/9 PASS（50bps 對齊）** |

→ EIP-1967 可升級代理模式（零鎖定）：[`02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./docs/architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos--stylus-alignment--code-verified-on-chain-coprocessor)

**主要場所：** Arbitrum One (`42161`) · Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Mainnet Ignition Tx [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · **跨鏈對沖：** Hyperliquid — **獨立 L1 高頻訂單簿 AppChain**（與 Arbitrum 永續流動性生態同源；session-key adapter，非 Arbitrum 原生）· **護城河：** Pillar 3 Wasm Shield `checkSoilResistance()` p50 ~106 μs — [§3 Defense Matrix](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#3-cross-venue-risk-engine--defense-matrix-r01r20)。

> **備註：** 初始主網部署使用 Bootstrap Ignition Keys（`0x1111…`/`0x2222…`）供公開驗證，不暴露生產 HSM 金鑰。金鑰輪替至生產多簽透過原生治理函式執行。

**Ingress（可選）：** Robinhood Chain `46630`/`4663` → Arbitrum — 僅 **Pillar 2 Reference Escort Adapter**；[Pillar 2 audit](./docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md)。

### Pendle Institutional Shield（V1.0 Live · Core Pillar 3）

機構級 Pendle PT/YT **Safety Sentinel** — 非收益競品。所有 oracle 解析於既有 Shield 預算內以**零 I/O 同步記憶體熱路徑**執行（**p50 ~106µs** `checkSoilResistance()`）：

| Layer | Module | Behavior |
|-------|--------|----------|
| **Dynamic Oracle** | [`pendle-market-oracle-adapter.ts`](./src/adapters/pendle/pendle-market-oracle-adapter.ts) | `ingest()` / `resolve()` 快取 · 可配置 **TTL（預設 60s）** |
| **Registry Hydration** | [`pendle-pt-registry.ts`](./src/adapters/pendle/pendle-pt-registry.ts) | `hydrateFromOracle` 合併即時 `impliedYield`、`ptPriceInAsset`、`liquidityConstant`、`expirySec` |
| **Fail-Closed Fuse** | `checkSoilResistance()` | `pendleOracle` + `pendleCrossGuard` soil 探針 · 缺失/過期/無效 feed 時發出 **`PENDLE_ORACLE_STALE`** |

→ Cross-guard: [`pendle-gmx-cross-guard.ts`](./src/guards/pendle-gmx-cross-guard.ts) · Expiry guard: [`pendle-pt-expiry-guard.ts`](./src/adapters/pendle/pendle-pt-expiry-guard.ts) · Tests: [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md#pendle-institutional-shield-v10-live--core-pillar-3)

### Camelot V3 Native Integration（V1.0 Live · Arbitrum Spot Liquidity）

Citadel 為 **Arbitrum One (`42161`)** 上 Camelot V3 現貨交換的**執行前集中流動性防火牆**：

| Layer | Module | Behavior |
|-------|--------|----------|
| **V3 Liquidity Guard** | [`camelot-v3-adapter.ts`](./src/adapters/camelot/camelot-v3-adapter.ts) | `verifyCamelotPoolLiquidity()` · `verifyCamelotTickDepth()` — CL tick 深度 · 方向性動態費率 |
| **Soil fuse** | `checkSoilResistance()` | 深度耗盡/跨場所滑點時 0-Gas fail-closed |
| **CLI Demo** | `pnpm demo:camelot` | WETH/USDC 現貨交換防護 · `--trip` 觸發 FAIL_CLOSED |

→ Tests: [`tests/adapters/camelot-v3-adapter.test.ts`](./tests/adapters/camelot-v3-adapter.test.ts)

### Radiant Capital（V1.0 Live · Arbitrum Native Lending）

Citadel 為 **Arbitrum One (`42161`)** 上 Radiant Capital 借貸的**執行前 Health Factor 防火牆**：

| Layer | Module | Behavior |
|-------|--------|----------|
| **HF Guard** | [`radiant-lending-adapter.ts`](./src/adapters/radiant/radiant-lending-adapter.ts) | `verifyRadiantHealthFactor()` — HF &lt; 1.15 fail-closed · 跨鏈清算邊界 |
| **Soil fuse** | `checkSoilResistance()` | 抵押品深度耗盡時 0-Gas fail-closed |
| **CLI Demo** | `pnpm demo:radiant` | WETH/USDC 借貸防護 · `--trip` 觸發 FAIL_CLOSED |

→ Tests: [`tests/adapters/radiant-lending-adapter.test.ts`](./tests/adapters/radiant-lending-adapter.test.ts)

### Jones DAO（V1.0 Live · Arbitrum Vault Strategies）

Citadel 為 **Arbitrum One (`42161`)** 上 Jones DAO 策略的**執行前 vault 份額價格防火牆**：

| Layer | Module | Behavior |
|-------|--------|----------|
| **Vault Guard** | [`jones-vault-adapter.ts`](./src/adapters/jones/jones-vault-adapter.ts) | `verifyJonesVaultSharePrice()` — 份額滑點上限 · 再平衡期間 flash-loan sandwich 觸發 |
| **Soil fuse** | `checkSoilResistance()` | 有毒 vault 深度時 0-Gas fail-closed |
| **CLI Demo** | `pnpm demo:jones` | jGLP 再平衡防護 · `--trip` 觸發 FAIL_CLOSED |

→ Tests: [`tests/adapters/jones-vault-adapter.test.ts`](./tests/adapters/jones-vault-adapter.test.ts)

### Wayfinder Native Integration（V1.0 Live · Arbitrum AI Agent Engine）

Citadel 為 **Arbitrum One (`42161`)** 上 Wayfinder Agent Engine 的**原生執行前風險防火牆**：

| Layer | Module | Behavior |
|-------|--------|----------|
| **Native Shield Hook** | [`wayfinder-shield.ts`](./src/adapters/wayfinder/wayfinder-shield.ts) | `wayfinderCitadelShieldHook` — `checkSoilResistance()` soil fuse + `verifyAgentIntent()` 8 維度閘門 |
| **0-Gas Fail-Closed** | Pre-broadcast severance | Soil 觸發 / bitmask 觸發（`FLAGS_*`）/ session-key 違規 → 於核心狀態流內**自動** `severSigningChannel()` — 無外部編排 |
| **CLI Demo** | `pnpm demo:wayfinder` | 正常路由攔截 · `--trip` 示範 0-Gas 有毒 soil |

→ Tests: [`tests/adapters/wayfinder-shield.test.ts`](./tests/adapters/wayfinder-shield.test.ts) · Demo: [`examples/wayfinder-agent-demo.ts`](./examples/wayfinder-agent-demo.ts)

### Stabilizer Protocol（V1.0 Live · Sepolia Testnet）

Citadel 為 Sepolia (`421614`) 上 Stabilizer Protocol 的**執行前零滑點容量與脫鉤清算防火牆**：

| Layer | Module | Behavior |
|-------|--------|----------|
| **Stabilizer Guard** | [`stabilizer-adapter.ts`](./src/adapters/stabilizer/stabilizer-adapter.ts) | 儲備率下限（15%）· USDZ 脫鉤防護（>50bps）· Constant-Sum 容量 |
| **Soil fuse** | `checkSoilResistance()` | 儲備耗盡/清算觸發時 0-Gas fail-closed |
| **De-peg cooldown** | `evaluateStabilizerSwapGuard()` | 60s LLM 強制冷卻 · 簽名通道切斷 |
| **CLI Demo** | `pnpm demo:wayfinder -- --stabilizer` | Sepolia 穩定幣交換 · `--trip` 觸發 FAIL_CLOSED |

→ Tests: [`tests/adapters/stabilizer-adapter.test.ts`](./tests/adapters/stabilizer-adapter.test.ts)

### 四大 AI Agent 框架（V1.0 Live · 完整 Quad 覆蓋）

**全球首個原生支援全部四大 AI Agent 框架（Wayfinder、ElizaOS、Virtuals、LangChain）的執行前風險閘道。**

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

→ Tests: [`wayfinder-shield.test.ts`](./tests/adapters/wayfinder-shield.test.ts) · [`elizaos-plugin.test.ts`](./tests/adapters/elizaos-plugin.test.ts) · [`virtuals-adapter.test.ts`](./tests/adapters/virtuals-adapter.test.ts) · [`langchain-tool.test.ts`](./tests/adapters/langchain-tool.test.ts) · [`stabilizer-adapter.test.ts`](./tests/adapters/stabilizer-adapter.test.ts) — **192 test files | 836 PASS Clean (100% PASS)**

**Triangle loop:** [Technical Specification §2](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#2-triangle-liquidity-loop--segregated-tranches) · **Arbitrum execution premium:** 較橋接路由 +15–30 bps *（設計估算）*。

> **SSOT lock (Buildathon)：** v1.0 Delivered（Sepolia + Arbitrum One 已驗證）· Vitest **192 test files | 836 PASS Clean (100% PASS)** · deep fuzz **327,675** 透過 `pnpm audit:nightly` · Tier-0 Docker [`Dockerfile`](./Dockerfile) · docs hub [`docs/README.md`](./docs/README.md) · **Judge quick brief:** [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md)

> **雙分支策略：** `main`（Grant Public SSOT）vs `feat/wasm-opsec-kernel-experiment`（Closed WASM Kernel 實驗分支，不納入 Grant 公開驗證範圍）。

---

## ⚡ 30 秒快速審計（最快 Judge 驗證）

### 3-Tier Demo Suite（CLI SSOT）

所有獨立 demo 透過 `process.hrtime.bigint()` 量測延遲（µs 精度）— 無硬編碼計時輸出。

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 1 — Native Protocols** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:camelot` · `pnpm demo:radiant` · `pnpm demo:jones` · `pnpm demo:matrix` | GMX · HL · Pendle · Camelot V3 · Radiant · Jones DAO · Variational RFQ · **7-protocol cross-venue matrix** |
| **Tier 2 — Agent Frameworks** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:quad` | Wayfinder · ElizaOS · Virtuals · LangChain · combined quad run |
| **Tier 3 — Sandbox & E2E** | `pnpm demo:stabilizer` · `pnpm demo:e2e` | Sepolia Stabilizer 1:1 guard · 5-step macro lifecycle |
| **Vitest matrix** | `pnpm demo` | 12 Tri-Pillar ANSI scenarios (`tests/demo/`) |

```bash
pnpm demo:gmx      # GMX v2 shadow margin · cross-venue slippage · position cap
pnpm demo:hl       # Hyperliquid session key auth · orderbook depth guard
pnpm demo:pendle   # Pendle PT/YT sentinel · guarded pool factory
pnpm demo:camelot  # Camelot V3 concentrated liquidity · dynamic fee guard
pnpm demo:radiant  # Radiant Capital HF & cross-chain liquidation guard
pnpm demo:jones    # Jones DAO vault share-price & sandwich guard
pnpm demo:matrix              # Full cross-venue matrix (--loop=all, default)
pnpm demo:matrix -- --loop=perp   # Pendle → GMX → dual perp hedge (HL + Variational)
pnpm demo:matrix -- --loop=perp --hedge=variational   # Variational Omni RFQ hedge leg
pnpm demo:matrix -- --loop=perp --hedge=hyperliquid   # Hyperliquid L1 hedge leg only
pnpm demo:matrix -- --loop=perp --hedge=both          # HL + Variational (default perp hedge)
pnpm demo:matrix -- --loop=spot   # Camelot → Radiant → Jones spot loop
# Append -- --healthy-only for nominal PASS; default runs R20 trip + severance
```

### Path 1：即時 Monorepo 驗證（建議 — 3 秒）

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (192 files / 836 tests)
```

GMX: `pnpm demo:gmx` · HL: `pnpm demo:hl` · Pendle: `pnpm demo:pendle` · Camelot: `pnpm demo:camelot` · Radiant: `pnpm demo:radiant` · Jones: `pnpm demo:jones` · Matrix: `pnpm demo:matrix` · Wayfinder: `pnpm demo:wayfinder` · ElizaOS: `pnpm demo:elizaos` · Virtuals: `pnpm demo:virtuals` · LangChain: `pnpm demo:langchain` · Stabilizer: `pnpm demo:stabilizer` · Quad: `pnpm demo:quad`

Optional benchmark: `npx tsx scripts/grant-advanced-resilience-benchmark.ts`

### Path 2：隔離 Docker 驗證

```bash
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
```

零依賴容器執行 — 無需主機 Node/pnpm 安裝。執行隔離 5 步 `demo:e2e` dry-run 與 Tier-1 ANSI HUD demo。完整回歸：`docker run --rm slivervine-citadel pnpm test`（**192 test files | 836 PASS Clean (100% PASS)**）。Sidecar express audit → [`docker/README.md`](./docker/README.md)。

**代表性 `demo:e2e` 終端機亮點**（GitHub `diff` 語法 — 綠色 `+` PASS、紅色 `-` 警示、黃色 `!` 費用注入）：

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

Judge 標準互動式 demo 指令：

1. **Path 1（建議）：** `pnpm install && pnpm demo && pnpm demo:e2e` — Tri-Pillar 微矩陣（12 情境）+ 5 步宏觀生命週期。
2. `pnpm test` 驗證 **192 test files | 836 PASS Clean (100% PASS)**。
3. **Path 2：** `docker build -t slivervine-citadel . && docker run --rm slivervine-citadel` — 隔離 E2E，無主機工具鏈漂移。
4. `grant-advanced-resilience-benchmark.ts` 展示亞毫秒 Wasm Shield 延遲路徑。

完整雙軸驗證中心（Express → Three Pillars Inside → Three Pillars Outside），見 [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)。

---

## 🎯 核心範圍與價值主張

| Horizon | Focus |
|---------|--------|
| **v1.0 Delivered (Sepolia verified)** | **Arbitrum One** GMX v2 **ETH/USDC GM Pool**（主要）+ Hyperliquid **1× short** · **V1.0 Live Native Agent Integrations**（Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer）· 主網部署與 **M6 Grant distribution** 掛鉤。 |
| **Zero Protocol-Level Lock-Up** | 零協議級鎖倉（100% 非託管）；贖回速度僅受 GMX v2 原生 3–5 分鐘 async Keeper 結算限制。可選 ingress AML 防火牆（如 Robinhood **`4663` inbound block**）。 |
| **V1.5 Roadmap Spec** | ⏳ Planned | **Fleet-scale [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) enforcement** · EIP-7702 EOA → Agent Smart Account · CrewAI / AutoGen adapters · BTC/USDC isomorphic GM（僅配置） |
| **V2.0 Design Spec** | ⏳ Planned | **Institutional CaaS & Orbit Shield** — 將 `@slivervine/citadel-sdk` 產品化供 AI DEX / Orbit L3 · 執行前風險檢查 **10 bps protocol authorization fee** |

**Standards & Infrastructure:** [EIP-712](https://eips.ethereum.org/EIPS/eip-712) · [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) / [ERC-7579](https://eips.ethereum.org/EIPS/eip-7579) · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Draft (Virtuals Protocol) · [Standard Compliance & ERC/EIP Wiki](./docs/architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md)。

### 📐 核心風險不變量（Judge 快速參考）

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0
$$

$$
\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}
$$

$$
t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s} \ll t_{\text{mempool\_broadcast}}
$$

推導與 R01–R20 邊界：[Technical Specification §3.1](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#31-microsecond-moats) · [Verification Matrix](./docs/VERIFICATION_MATRIX.md) · [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md)。

**Risk spectrum (88% / 12%)：** 正式數學定義 — [Risk Mitigation & Disclaimer Framework §0.1](./docs/architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) · **80/20 Pareto**（微結構損失集中）鎖定 Pillar 3 內急性 20% 尾部。

## 🛣️ Buildathon 後 B2B 商業化與 PMF 路線圖（9/14 後）

SliverVine Protocol 採嚴格兩階段策略，平衡零摩擦 Hackathon 驗證與長期商業永續：

- **Stage 1: Buildathon Verification Phase（現行 — 9/14 前）**
  - **100% Free Public Telemetry**：開放 Dune Live Telemetry Dashboard（[https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)）— Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` 即時 **`IntentAttested`** + **`RiskTripBlocked`** 串流；**PEV**（`SUM(blocked_intent_notional_usd)`）於鏈上完全運作 · spec: [`docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md`](./docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md)。
  - **Arbitrum One Mainnet Ignition Gate**：ChainID `42161` 上非託管 `SliverVineGate` 位於 `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` — Mainnet Ignition Tx [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) *（Bootstrap Ignition Keys `0x1111…`/`0x2222…`；生產多簽輪替透過原生治理）*。
  - **Sepolia Safety Gate**：Arbitrum Sepolia（`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`）上完整 EIP-712 session key 驗證與 0-Gas Fail-Closed 保護已驗證。
  - **Reference Interceptor Harness**：[`examples/agent-interceptor-demo.ts`](./examples/agent-interceptor-demo.ts) — Virtuals Protocol 與 ElizaOS agent swarm 的參考攔截器與 Adapter（評審可重現；非生產合作背書）。
  - **Zero-Touch SDK**：[`withCitadelShield`](./src/sdk/decorator.ts) — 一行 decorator 包裝 agent 執行 hook，內嵌 `checkSoilResistance()` 廣播前切斷（`import { withCitadelShield } from '@slivervine/citadel-sdk'`）。

- **Stage 2: B2B Monetization & Risk API Launch（9/14 後）**
  - **SliverVine Citadel Risk API & Bad Debt Calculator（由鏈上遙測與 Dune Analytics 視覺化驅動）**：透過 B2B API 變現 SliverVine 專有亞毫秒風險演算法與 shadow margin 遙測 — **非** Dune 平台資料轉售。[Dune](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) 維持**免費公開視覺化儀表板**；付費層（$199/mo Pro 至 $1,999/mo Enterprise）門控 Citadel 計算之清算風險、保證金健康與壞帳節省指標，供 vault manager 與 AI Agent swarm（Wayfinder、Virtuals、M2M Treasury Funds）使用。
  - **V2.0 CaaS rail (Design Spec)：** `@slivervine/citadel-sdk` + 執行前風險檢查 **10 bps protocol authorization fee**。Live v1.0 builder lane 維持 GMX **+10 bps `uiFeeReceiver`**。

---

## ⚔️ 競爭矩陣 — 執行前 vs 執行後風險

| Feature / Dimension | Legacy Providers (Gauntlet / Chaos Labs) | SliverVine Citadel Gate (Pillar 3) |
| :--- | :--- | :--- |
| **Execution Phase** | 執行後儀表板與多日治理參數更新 | **執行前內聯攔截**（mempool 廣播**前**亞毫秒級） |
| **Latency / Hot-Path** | 分鐘至數日（鏈下模擬 + DAO 投票） | **p50 ~106 µs** Shield/TS Gateway 路徑 · Wasm warm **&lt;60 µs**（Edge 上 Rust `#![no_std]`） |
| **Protection Level** | 全域協議參數調校（LTV、抵押因子） | **細粒度 tx 級與 LP soil 保護**（MEV、RPC jitter、Oracle lag） |
| **Deployment Model** | 顧問 / SaaS 分析 | **內聯 Edge Gate 與開源 Wasm SDK**（`@slivervine/citadel-sdk`） |

## 🔬 Santenmoku Engine（內部代號）— BeDelta v1.0 實戰驗證矩陣

SliverVine Protocol 在嚴格數學不變量與零信任執行前斷言下工程化。

### 量身訂製數學不變量（協議物理邊界）

**主要執行邊界：** 完整 Arbitrum 原生多協議覆蓋（GMX v2、Pendle、Camelot V3、Radiant Capital、JonesDAO、**Variational Omni RFQ**）+ 跨鏈高頻訂單簿防禦（Hyperliquid L1 Session Key Adapter）+ 可選 Arbitrum 原生 RFQ OLP 對沖。

| Protocol | Venue | Physical Boundary Check | Code Module |
|----------|-------|-------------------------|-------------|
| **GMX v2** | Arbitrum One | Pool Imbalance Ratio: \|OI_long − OI_short\| / PoolTVL > **0.35** · Collateral Reserve < **105%** | [`gmx-v2-invariants.ts`](./src/adapters/gmx/gmx-v2-invariants.ts) · [`gmx-v2-order-payload-guards.ts`](./src/services/adapters/gmx-v2-order-payload-guards.ts) |
| **Pendle** | Arbitrum One | Discounted Implied Yield Shock: \|Yield_current − Yield_oracle\| > **150 bps** | [`pendle-pool-factory-adapter.ts`](./src/adapters/pendle/pendle-pool-factory-adapter.ts) |
| **Camelot V3** | Arbitrum One | Active Tick Liquidity Depth · Dynamic Directional Fee Impact > **0.50%** slippage/penalty (**50 bps**) | [`camelot-v3-adapter.ts`](./src/adapters/camelot/camelot-v3-adapter.ts) |
| **Radiant Capital** | Arbitrum One | Cross-chain Health Factor HF < **1.15** (Fail-Closed Buffer) | [`radiant-lending-adapter.ts`](./src/adapters/radiant/radiant-lending-adapter.ts) |
| **Jones DAO** | Arbitrum One | Vault NAV Share Price Volatility > **0.30%** single-block NAV deviation / Sandwich trip (**30 bps**) | [`jones-vault-adapter.ts`](./src/adapters/jones/jones-vault-adapter.ts) |
| **Hyperliquid** | Independent L1 HF Orderbook AppChain | Session Key **MaxSizePerOrder** · **Rate Limit** (120/min) · Orderbook Spread > **20 bps** | [`hyperliquid-session-guard.ts`](./src/adapters/hl/hyperliquid-session-guard.ts) |
| **Variational** | Arbitrum One (Omni RFQ) | Quote stale **>500ms** or oracle drift **>30 bps** · OLP depth utilization **>15%** (long-tail) · **Bits 12–13** | [`variational-rfq-adapter.ts`](./src/adapters/variational/variational-rfq-adapter.ts) |

> **Hyperliquid 定位：** 與 Arbitrum 永續流動性生態同源的獨立 L1 高頻訂單簿 AppChain — 透過 session-key adapter 跨場所 Δ-neutral 對沖腿，非 Arbitrum 原生執行。

### 1. On-Chain Enforcement Layer (Solidity v0.8.28)
* **Unit Tests**: 🟢 **60 Passed | 0 Failed**
* **Line Coverage**: 📊 **95.51% Overall** (`SliverVineGate.sol`: **95.65%**)
* **Property Fuzzing**: 🌀 **327,675 Property Fuzz Executions** (`pnpm audit:nightly` / `FOUNDRY_PROFILE=deep`; standard `forge test` = **5,120** = 5×1,024) (All Green)
* **Invariant Testing**: ⛓️ **3 Invariants × 16,384 Depth = 49,152 Stateful Calls** (0 Counterexamples)
* **Gas Deadlock**: ⛽ `verifyAndConsume`: **25,853 min / 28,043 median gas**
* **Runtime Bytecode**: 📦 **8,716 Bytes (8.71 KiB)** — Zero External Dependencies (`Assembly-optimized`)

### 2. Off-Chain Pre-Execution Radar (TypeScript / V8 Runtime)
* **Vitest SSOT**: 🧪 **192 test files | 836 PASS Clean (100% PASS)** on `pnpm test -- --run`
* **Chaos Matrix**: 🌪️ **255 Severe Failure Cases | 0 Crashes**
* **Edge Decision Latency**: ⏱️ **SLO &lt; 1.0ms | p50 ~106 μs Shield/TS Gateway | Wasm warm &lt;60 μs | Pure Math: 0.0002 ms (200 ns)**
* **Worker Bundle**: 📦 **69.32 KiB gzip** measured hot path (`pnpm bundle:measure`) · **276.2 KiB raw** Worker upload (`limitKiB: 150` · `pass: true`)
* **Stylus Probe**: 🦀 **9/9 PASS（50bps 對齊）** — `pnpm build:stylus`

---

## 🗺️ 協議開發里程碑（M0 – M6）

| Milestone | Status | Deliverables & Verification |
|-----------|--------|-----------------------------|
| **M0: Operational Foundation** | ✅ Delivered | WSL / PNPM Monorepo、Cloudflare Edge Worker pipeline 與 CI/CD 嚴格 typecheck。 |
| **M1: On-Chain Citadel Gate** | ✅ Delivered | `SliverVineGate.sol` 核心不變量鎖 · **327,675 deep fuzz** (`FOUNDRY_PROFILE=deep`) · 25k gas 邊界。 |
| **M2: Pre-Execution Radar** | ✅ Delivered | `checkSoilResistance()` 引擎、**192 test files | 836 PASS Clean (100% PASS)**、69.32 KiB gzip bundle、亞毫秒延遲。 |
| **M3: Dual-Chain & ZeroDev AA** | ✅ Dry-Run Harness Verified (Kernel v3 / EntryPoint v0.7) | **Opt-In Pillar 1** ZeroDev Kernel v3 AA Adapter（`USE_ZERODEV_AA` 預設關閉）· 可選 Robinhood Chain / Across（`46630`/`4663`）**Pillar 2 Reference Escort Adapters** 進入 Arbitrum。Wasm Shield + Native Ingress 不受影響。 |
| **M4: WASM Engine & IP Moat** | ✅ Delivered | Rust `#![no_std]` Wasm 核心（`pkg/soil_core.wasm`）— Cloudflare 預算 `<28kb`、熱路徑執行 `<60µs` — 與 `@slivervine/citadel-sdk` 已發布。 |
| **M5: TCA Data & Hyperliquid** | ✅ Delivered (evolving) | TCA / grant-audit 介面與 HL Testnet 5-trade provenance — **Live TCA Analytics HUD 持續演進**。 |
| **M6: Institutional Grant Submission** | ✅ Mainnet Ignition Delivered · ⏳ Final Demo Video | Arbitrum One Gate `0xb174118b…` · [Ignition Tx `0x54c153…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · GMX / Arbitrum grant application package。 |

**Grant 後 Milestone 1（第 2–3 週）：** 向 **ElizaOS**（`@elizaos/plugin-citadel`）與 **Virtuals GAME**（`@virtuals/plugin-citadel`）monorepo 提交官方原生 plugin Pull Request，從現有零開銷 SDK Wrapper decorator 過渡至上游整合。

---

## 🛡️ 審計者 — 30 秒 CLI 與 API 驗證

> **SSOT：** 所有驗證指令、pillar 對應與預期輸出見 [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)。

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
pnpm demo:camelot
pnpm demo:radiant
pnpm demo:jones
pnpm demo:wayfinder
pnpm demo:wayfinder -- --trip
pnpm tsx scripts/generate-survival-report.ts
curl -s https://bedeltawater.slivervine.xyz/api/grant-audit | jq .provenanceVerified
```

完整指令矩陣、敘述與 bundle 檢查 → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)。

---

## 🏛️ Tri-Sensor Telemetry Matrix

Citadel 執行前閘道於任何 GMX 廣播前執行閉環 **Tri-Sensor Telemetry Matrix**：

| Sensor Channel | Observability Domain | Control Action |
|----------------|---------------------|----------------|
| **BaseFee Velocity Sensor** | ArbOS EIP-1559 base-fee 加速代理 | 費率速度超過動態容忍帶時節流 dispatch |
| **RPC Jitter Radar** | 多供應商 RTT 離散與 head 過期 | jitter radar 標記端點相位不同步時 fail-closed |
| **Phase-Shift Instability Detector** | 跨場所 oracle / 訂單簿相位對齊 | 跨感測器相位偏移異常時立即熔斷 |

---

## 🚀 Unified Institutional Pre-Execution Pipeline

**重心 = Arbitrum One。** SliverVine Protocol 為 Arbitrum 上 AI Agent 的亞毫秒 0-Gas 廣播前安全 Citadel 與風險導航器。主要場所：Arbitrum One GMX v2 **ETH/USDC** GM + Hyperliquid **1× short**，Pillar 3 Wasm Shield 為技術護城河。Robinhood / Across 僅為 **Pillar 2 Reference Escort Adapters**。

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

**[Pillar 1: Gatehouse — Opt-In Account Abstraction Layer]** ZeroDev Kernel v3 **opt-in** 範圍 session keys（`USE_ZERODEV_AA` 預設關閉）· **30s TTL Heartbeat / Intent Execution Window**（`WS_HEARTBEAT_INTERVAL_MS` · `DEFAULT_TTL_MS`）— 與底層密碼學 session key 生命週期（模組範圍內最長 **24h / 7d**）不同 · **Paymaster gas sponsorship**（$0.50/op · $10/day cap；耗盡時 fail-closed fallback）。*Pillar 3 Wasm Shield（p50 ~106 µs）與 Arbitrum Native Ingress 獨立於 ZeroDev 運作。* 透過 `pnpm test:zerodev` 與 E2E dry-run（`sessionOk`、`allowedToSign`）評估。

**[Pillar 2: Compliance Ingress Firewall — Escort Accounting]** 場所無關單向 AML 防火牆 · 誠實 **`IN_FLIGHT_BRIDGE_CAPITAL`** 標籤 · **Pending-Capital Recognition Invariant（`lostUsd ≡ 0`）** — 協議於活躍執行期間絕不將在途橋資本過早記為損失 · *（Robinhood Chain / Across 為 **Pillar 2 Reference Escort Adapters** — 作為整合範例，非 SliverVine Protocol 核心產品身份。）* **Audit:** [`docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md)。

**[Pillar 3: Shield — Pre-Execution Risk Engine]** **`pkg/soil_core.wasm`** · `checkSoilResistance()` **p50 ~106 µs**（Shield/TS Gateway 路徑）· Wasm warm **&lt;60 µs** · **R01–R20 Defense Matrix（17 Active | 2 Refactored | 1 Deprecated）** · 任何 soil / oracle / sequencer 觸發時 **`signingChannelOpen: false`** — Arbitrum / HL 廣播前主要技術護城河。

**Architecture standards:** **EIP-712** Gate attestation · **ERC-4337/7579** ZeroDev Kernel v3 · **EIP-1559** ArbOS Tri-Sensor · **ArbOS 61** · optional Robinhood ingress · **Wasm** `soil_core` — 見 [Standard Compliance & ERC/EIP Wiki](./docs/architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md)。

---

## 📚 文件

**Grant 評審與機構審計者：** 從 [`docs/README.md`](./docs/README.md) → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) 開始。

### Top 5 Core Grant Documents

| # | Document | Role |
|---|----------|------|
| 1 | [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) | SSOT 驗證中心 — Express → Three Pillars Inside → Outside |
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

**Protocol / Worker (repo root):** **BUSL-1.1** — Copyright (c) 2026 SilverVine Labs. Change Date `2028-08-21` → Apache-2.0（亦於 M2 / $10M TVL 時提前轉換，依計畫條款）。見 [LICENSE](./LICENSE)。

**Developer integration harness:** [`@slivervine/citadel-sdk`](./src/sdk/) under `src/sdk/` is licensed **Apache-2.0** (Copyright (c) 2026 SilverVine Labs) for third-party integration. See [`src/sdk/LICENSE`](./src/sdk/LICENSE), [`src/sdk/README.md`](./src/sdk/README.md), and [`docs/sdk/CITADEL_SDK_BLUEPRINT.md`](./docs/sdk/CITADEL_SDK_BLUEPRINT.md). EIP-712 domain: `SliverVineCitadel`. Docs index: [`docs/README.md`](./docs/README.md).
