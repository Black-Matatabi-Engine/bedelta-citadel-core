> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[01_TECHNICAL_SPECIFICATION.md](./01_TECHNICAL_SPECIFICATION.md)

# SliverVine Citadel Shield：Arbitrum 上 AI Agent 的預共識意圖防火牆與執行安全原語

> **文檔：** 技術規格與風險拓撲 · **內部引擎代號：** Santenmoku · **Vitest SSOT：** **192 個測試檔案 | 836 PASS Clean（100% PASS）** · Security-tier `5/0/0 PASS` · 防禦矩陣 `17 Active | 2 Refactored | 1 Deprecated` · Wasm Core `<28kb` Cloudflare 預算、`<60µs` 執行 · Worker bundle **69.32 KiB gzip**
> **本文件 SSOT：** R01–R20 不變量 · 雙引擎拓撲 · KV / MDD · 結算與費用邊界
> **文檔索引：** [`docs/README.md`](../README.md) · **風險框架：** [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) · **標準 Wiki：** [`02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md) · **Grants：** [`docs/grants/`](../grants/)

**哲學 — BeΔ（BeDelta Living Water v1.0）：** **Be** 源自 Bruce Lee 的 *"Be Water, My Friend"* — 流動、自適應的意圖路由與無摩擦的多鏈執行。**Δ（Delta）** 表示 **市場 Delta 中性** 與風險中性執行 — 中和方向性敞口。**SliverVine** = 碎片化意圖保護與鋼性交易執行 · **SliverVine Citadel Shield** = 預共識執行安全原語。
**實體：** SilverVine Labs · **協議品牌：** SliverVine Citadel Shield
**即時證明：** `GET /api/grant-audit` · [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz)
**Repo：** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)

| 部署 | Chain ID | Gate / Tx |
|------------|----------|-----------|
| **Arbitrum One Mainnet Ignition** | `42161` | Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Ignition Tx `0x54c153…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Arbitrum Sepolia (sandbox)** | `421614` | Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` (CREATE2 same-address) |

> **備註：** 初始主網部署使用 Bootstrap Ignition Keys（`0x1111…`/`0x2222…`）供公開驗證，不暴露生產 HSM keys。生產多簽輪替透過原生治理函數執行。

本文檔採 **不變量優先**（Yellow Paper 風格）：拓撲、閾值與 fail-closed 語義。營收敘事位於 `docs/grants/`。

---

## 0. 統一機構預執行管線

Santenmoku 為 **統一亞毫秒級預執行網關**。**重心 = Arbitrum One**，具完整原生多協議覆蓋（GMX v2、Pendle、Camelot V3、Radiant Capital、JonesDAO），外加 **Hyperliquid** — 與 Arbitrum 永續流動性生態並生的 **獨立 L1 高頻訂單簿 AppChain** — 作為跨鏈 session-key 對沖腿。支柱三 Wasm Shield 為技術護城河。許可制鏈（如 Robinhood Chain）為 **支援的入場範例**，非產品身份。

**主要執行邊界：** Arbitrum 原生多協議完整覆蓋（GMX v2、Pendle、Camelot V3、Radiant Capital、JonesDAO）+ 跨鏈高頻訂單簿防禦（Hyperliquid L1 Session Key Adapter）。

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

| 支柱 | 角色 | SSOT / 機制 | 專用規格 |
|--------|------|------------------|-------------------------|
| **[Pillar 1: The Gatehouse (Auth)]** | **Opt-In** ZeroDev scoped session keys · EIP-712 intent scopes | Kernel v3 · `ORDER_EXECUTE` bounds · Paymaster ($0.50/op · $10/day) · R06 / R07 · `USE_ZERODEV_AA` default-off | [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) |
| **[Pillar 2: Compliance Ingress Firewall]** | Venue-agnostic unidirectional AML escort · honest `IN_FLIGHT_BRIDGE_CAPITAL` / `lostUsd ≡ 0` | `across-ingress-bridge.ts` · `IngressSafetySwitch.sol` · Robinhood / Across = **optional reference adapters** | [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](../audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) |
| **[Pillar 3: Shield (CORE MOAT)]** | Sub-ms Wasm pre-execution armor — **primary technical moat** | `checkSoilResistance()` p50 ~106 μs · Wasm warm &lt;60µs · R01–R20 | [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) |

> **三柱路由：** 支柱一（Gatehouse）與支柱二（可選入站）於下方 inline 摘要；**完整審計級規格**見上方支柱 1–3 專用文檔。本文件保留跨柱拓撲、結算邊界與整合錨點。

> *雖然 `checkSoilResistance()` 等單一元件公式保持標準開放以供 `@slivervine/citadel-sdk` 在 Arbitrum 無縫採用，我們的核心護城河在於生產整合複雜度 — 將 Rust `#![no_std]` Wasm、Edge Worker 執行與 EIP-712 Gate 縫合成 sub-ms、fail-closed 系統。*

## ⚔️ 競爭矩陣 — 預執行 vs. 事後執行風險

| 特性 / 維度 | 傳統提供者（Gauntlet / Chaos Labs） | SliverVine Citadel Gate（支柱三） |
| :--- | :--- | :--- |
| **Execution Phase** | Post-execution dashboards & multi-day governance parameter updates | **Pre-execution inline interception** (Sub-ms BEFORE mempool broadcast) |
| **Latency / Hot-Path** | Minutes to Days (Off-chain simulations + DAO votes) | **p50 ~106 µs** (Rust `#![no_std]` Wasm engine on Edge) |
| **Protection Level** | Global protocol parameter tuning (LTV, Collateral factors) | **Granular tx-level & LP soil protection** (MEV, RPC jitter, Oracle lag) |
| **Deployment Model** | Advisory / SaaS Analytics | **Inline Edge Gate & Open-Source Wasm SDK** (`@slivervine/citadel-sdk`) |

### 0.1 Bytecode Predicate 驗證（v1.0）與 ERC-7715（⏳ Grant 後設計規格）

SliverVine 不解讀自然語言 LLM prompt。Shield 於 sub-ms Wasm 核心（p50 ~106 μs）內對 ERC-4337 UserOp calldata 強制 **Asymmetric Predicate Bytecode Hard Assertions** — **100% 由 `pkg/soil_core.wasm` 驅動**，獨立於 Account Abstraction。ZeroDev Kernel v3 是機構啟用 AA（`USE_ZERODEV_AA`）時的**可選支柱一交付 adapter**，用於 scoped session keys；它**不**提供或驅動 sub-ms 延遲。

> **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196)（AI Agent Wallet Policy）：** 對齊 emerging **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) AI Agent Wallet Policy Specification**（Draft，Virtuals Protocol 共同撰寫）。**非 finalized 標準。**

> **ERC-7715（Advanced Wallet Permissions）：** ⏳ **Planned / Post-Grant Design Spec** — Gatehouse 權限表面的演進目標；**未於 v1.0 出貨**。Adapter swap 路徑已記載，供未來 ZeroDev / Offchain Labs 整合，無需 Shield 或 Wasm 重寫。

| 不變量 | 機制 | 狀態 |
|-----------|-----------|--------|
| **Receiver Invariant** | Decode GMX v2 parameters from UserOp bytecode; assert `sender ≡ receiver` before any L2 broadcast. | ✅ v1.0 Delivered (Sepolia verified) |
| **Parameter Invariant** | Bound-check `acceptablePrice` (and related execution params) against oracle-lag sensors; fail-closed on drift. | ✅ v1.0 Delivered (Sepolia verified) |
| **Unidirectional Outbound Escort** | Pillar 2 enforces venue-agnostic outbound-only escort into Arbitrum `42161`; inbound AML contamination is blocked at the Compliance Ingress Firewall. Robinhood Chain (`46630`/`4663`) is the inaugural reference adapter. | ✅ v1.0 Delivered (Sepolia verified) |

### 0.2 v1.0 已交付範圍 vs Grant 後路線圖

| 時間範圍 | 狀態 | 範圍 |
|---------|--------|-------|
| **v1.0 Delivered (Sepolia + Arbitrum One)** | ✅ Code-Verified Live | **SliverVine Citadel Shield** — Pre-Consensus Intent Firewall · GMX v2 ETH/USDC GM + HL 1× short · Wasm `checkSoilResistance()` p50 ~106µs · **Pendle Institutional Shield** (sync oracle · `PENDLE_ORACLE_STALE` soil fuse · cross-guard) · **Stabilizer Sepolia Cross-Pass Sandbox** (`421614`) · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Draft policy pre-validation · EIP-712 consume-once Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · **Arbitrum One Mainnet Ignition** [`0x54c153…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · Dune + SHA-256 `GET /api/grant-audit` · **192 個測試檔案 \| 836 PASS Clean（100% PASS）** |
| **v1.0 Active Target** | ✅ Mainnet Ignition Delivered | Single blue-chip anchor: **GMX v2 ETH/USDC GM Pool** + Hyperliquid **1× short** hedge · Gate live on **42161** |
| **v1.0 Partial — HL Orderbook Gap Guard** | ✅ Code-Verified | `evaluateHlOrderbookGapGuard()` in [`hl-orderbook-gap-guard.ts`](../../src/services/risk-control-lib/hl-orderbook-gap-guard.ts) · wired via [`soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) — gap-window leverage scale-down + 2× depth floor |
| **v1.0 Live — Pendle Institutional Shield** | ✅ Code-Verified Live | **Pillar 3 Core** — [`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) (sync cache · TTL 60s) · [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) (`hydrateFromOracle`) · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) · `pendleOracle` / `pendleCrossGuard` → `checkSoilResistance()` · **192 個測試檔案 \| 836 PASS Clean（100% PASS）** |
| **V1.5 Roadmap Spec** | ⏳ Planned | **Sub-ms Agentic Security & Swarms** — [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) fleet enforcement · EIP-7702 EOA → Agent Smart Account · Prompt Injection Defense Circuit (`severSigningChannel()` sub-100µs) · BTC/USDC isomorphic GM (config-only) |
| **V2.0 Design Spec** | ⏳ Planned | **Institutional CaaS & Orbit Shield** — `@slivervine/citadel-sdk` for AI DEXs / Orbit L3s · **10 bps protocol authorization fee** on pre-execution risk checks · ZeroDev Stage ⑦ Intent Composition (2PC ledger) |

**ZeroDev AA v1.0 活躍範圍（可選支柱一）：** Stage ① Sign-in · ③ Gas ($0.50/op · $10/day) · ④ Scoped Session Keys (ERC-7579) · ⑤ Execution — Sepolia dry-run verified (`pnpm test:zerodev`). Stage ② Smart Routing = **Reference Harness & Spec** (Vitest). Stages ⑥ Recover · ⑦ Compose = **⏳ Post-Grant Roadmap (V1.5 / V2.0)**. Pillar 3 Wasm Shield and Pillar 2 Arbitrum Native Ingress operate **100% independently** of ZeroDev.

> **Milestone 1（Grant 後第 2–3 週）：** 向 **ElizaOS**（`@elizaos/plugin-citadel`）與 **Virtuals GAME**（`@virtuals/plugin-citadel`）monorepo 提交官方原生 plugin Pull Request。

**Demo:** `pnpm demo` — 12 Tri-Pillar ANSI scenarios (GMX · HL · Pendle · p50 ~106µs) · `pnpm demo:e2e` — 5-step grant E2E (Intent+Deadman → Robinhood escort → GMX underweight → HL Session hedge → R20 Panic Flash).

### 0.3 Agent 生態 Adapter（V1.0 Live · 原生整合）

[`src/adapters/`](../../src/adapters/) 中的生產原生 adapter — 每個框架有**獨立模組**、專用 CLI demo 與 Vitest 套件。所有 adapter 於交易派發前驗證 agent intent、session key 邊界與 `checkSoilResistance()`。

| 框架 | 狀態 | 模組 SSOT | 入口 | CLI | 測試 |
|-----------|--------|-----------|-------------|-----|------|
| **Wayfinder** | ✅ V1.0 Live | [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) | `wayfinderCitadelShieldHook` | `pnpm demo:wayfinder` | [`wayfinder-shield.test.ts`](../../tests/adapters/wayfinder-shield.test.ts) |
| **ElizaOS** | ✅ V1.0 Live | [`elizaos-citadel-plugin.ts`](../../src/adapters/elizaos/elizaos-citadel-plugin.ts) | `evaluateElizaCitadelAction()` | `pnpm demo:elizaos` | [`elizaos-plugin.test.ts`](../../tests/adapters/elizaos-plugin.test.ts) |
| **Virtuals (GAME)** | ✅ V1.0 Live | [`virtuals-game-adapter.ts`](../../src/adapters/virtuals/virtuals-game-adapter.ts) | `evaluateVirtualsGameTask()` | `pnpm demo:virtuals` | [`virtuals-adapter.test.ts`](../../tests/adapters/virtuals-adapter.test.ts) |
| **LangChain / LangGraph** | ✅ V1.0 Live | [`langchain-citadel-tool.ts`](../../src/adapters/langchain/langchain-citadel-tool.ts) | `CitadelRiskGuardTool` | `pnpm demo:langchain` | [`langchain-tool.test.ts`](../../tests/adapters/langchain-tool.test.ts) |
| **Stabilizer Protocol** | ✅ V1.0 Live | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) | `evaluateStabilizerSwapGuard()` | `pnpm demo:stabilizer` | [`stabilizer-adapter.test.ts`](../../tests/adapters/stabilizer-adapter.test.ts) |
| **Quad-Agent（combined · 4 AI 框架）** | ✅ V1.0 Live | [`quad-agent-demo.ts`](../../examples/quad-agent-demo.ts) | All four AI frameworks | `pnpm demo:quad` | — |
| **CrewAI / AutoGen** | ⏳ V1.5 Roadmap Spec | Python `BaseTool` / Citadel REST Client | `SlivervineCrewAIGuardTool` | `examples/adapters/crewai-autogen-adapter.py` | — |

**回歸基線：** **192 個測試檔案 | 836 PASS Clean（100% PASS）** · `pnpm test -- --run`

**PEV（Prevented Exploit Volume）— Dune Analytics 遙測指標：**

| 欄位 | 定義 |
|-------|------------|
| **Metric** | **PEV** — nominal USD volume of toxic intents blocked pre-broadcast (0-Gas fail-closed severance) |
| **Event sources** | `RiskTripBlocked` on-chain events · soil-trip `SOIL_RESISTANCE_TRIP` logs · `GET /api/grant-audit` `duneTelemetry` JSON |
| **Indexer SSOT** | [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) — Sepolia event streaming verified; production DuneSQL targets **ChainID `42161`** |

### 0.4 Stabilizer Sepolia — 通用 Testnet Sandbox 與 Cross-Pass 層（V1.0 Live）

**Arbitrum Sepolia（`421614`）是 AI agent 開發的 Universal Testnet Sandbox 與 Cross-Pass 互通層**。 Citadel 於 Sepolia 套用與 Arbitrum One（`42161`）**相同的 `checkSoilResistance()` bytecode 與 risk gates** — enabling auditors and integrators to validate fail-closed behavior on **live testnet contracts** without mainnet gas or capital friction.

| Cross-pass 腿 | Sepolia 角色 | Adapter / demo SSOT | 共享 gate |
|----------------|--------------|---------------------|-------------|
| **Stabilizer** | 1:1 zero-slippage USDZ / USDC / USDT / USDS rebalance | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · `pnpm demo:stabilizer` | `evaluateStabilizerSwapGuard()` → `checkSoilResistance()` |
| **GMX v2** | Sepolia shadow-margin · price-impact pre-flight | [`gmx-v2-agent-flow.demo.test.ts`](../../tests/demo/gmx-v2-agent-flow.demo.test.ts) · `gmx-v2-order-payload-guards.ts` | `gmxPriceImpact` · depth soil probes |
| **Pendle** | Testnet Guarded Pool Factory · oracle TTL fuse | [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) · [`pendle-ai-agent-flow.demo.test.ts`](../../tests/demo/pendle-ai-agent-flow.demo.test.ts) | `pendlePoolFactory` · `pendleOracle` soil probes |

```text
Agent Cross-Pass Route (Sepolia 421614)
  Stabilizer 1:1 stablecoin leg
       │ checkSoilResistance()
       ▼
  GMX v2 shadow-margin / GM intent
       │ checkSoilResistance()
       ▼
  Pendle guarded pool / PT intent
       │ checkSoilResistance()
       ▼
  FAIL_CLOSED (0-Gas)  or  ALLOW → Mainnet-identical bytecode path
```

**驗證基線：** **192 個測試檔案 | 836 PASS Clean（100% PASS）** · `pnpm demo:stabilizer` · `pnpm demo` (Tri-Pillar GMX/HL/Pendle harness).

---

## 1. 核心產品身份

**SliverVine Citadel Shield（BeDelta Living Water v1.0 / BeΔ）為 Arbitrum 上 AI Agent 的預共識意圖防火牆與執行安全原語。**

**主要執行包絡：** Arbitrum One 上 **Delta-Neutral GM** — GMX v2 **ETH/USDC** GM pool + Hyperliquid **1× short hedge**（Independent L1 HF Orderbook AppChain · session-key adapter），由支柱三 sub-ms Wasm Shield（`checkSoilResistance()`）守護。

### 1.0 量身訂製數學不變量（協議物理邊界）

| 協議 | 場所 | 物理邊界檢查 | Code 模組 |
|----------|-------|-------------------------|-------------|
| **GMX v2** | Arbitrum One | Pool Imbalance Ratio: \|OI_long − OI_short\| / PoolTVL > **0.35** · Collateral Reserve < **105%** | [`gmx-v2-invariants.ts`](../../src/adapters/gmx/gmx-v2-invariants.ts) · [`gmx-v2-order-payload-guards.ts`](../../src/services/adapters/gmx-v2-order-payload-guards.ts) |
| **Pendle** | Arbitrum One | Discounted Implied Yield Shock: \|Yield_current − Yield_oracle\| > **150 bps** | [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) |
| **Camelot V3** | Arbitrum One | Active Tick Liquidity Depth · Dynamic Directional Fee Impact > **0.50%** (**50 bps**) | [`camelot-v3-adapter.ts`](../../src/adapters/camelot/camelot-v3-adapter.ts) |
| **Radiant Capital** | Arbitrum One | Cross-chain Health Factor HF < **1.15** (Fail-Closed Buffer) | [`radiant-lending-adapter.ts`](../../src/adapters/radiant/radiant-lending-adapter.ts) |
| **Jones DAO** | Arbitrum One | Vault NAV Share Price Volatility > **0.30%** single-block NAV deviation (**30 bps**) | [`jones-vault-adapter.ts`](../../src/adapters/jones/jones-vault-adapter.ts) |
| **Hyperliquid** | Independent L1 HF Orderbook AppChain | Session Key **MaxSizePerOrder** · **Rate Limit** (120/min) · Orderbook Spread > **20 bps** | [`hyperliquid-session-guard.ts`](../../src/adapters/hl/hyperliquid-session-guard.ts) |

| Component | Venue | Role |
|-----------|-------|------|
| **Yield base (PRIMARY)** | Arbitrum One · GMX v2 ETH/USDC GM | Underweight-side GM LP · builder `uiFeeReceiver` (**+10 bps**) · Citadel pre-execution gate |
| **Hedge** | Hyperliquid (Independent L1 HF Orderbook AppChain) | Session-key **1× short** Emergency Liquidity Sponge · `evaluateHyperliquidSessionGuard()` · nonce-healed signing |
| **Ingress (optional)** | Robinhood Chain | **Pillar 2 Reference Escort Adapter** — not product identity |

**Robinhood Chain 角色：** 僅 **Pillar 2 Reference Escort Adapter** — 受監管 treasuries 可 escort 出站（`46630`/`4663` → `42161`）。入站 AML 預設阻擋。產品身份仍為 **Arbitrum 上的 SliverVine Citadel**。**審計：** [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](../audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md)。

### 1.1 工程克制（Blue-Chip 範圍）

v1.0 刻意限制於 **ETH/USDC**，使 Sequencer desync 期間 oracle 可靠性成立：單一 blue-chip pair 移除 multi-asset de-peg 與 FX-slippage 表面，Tri-Sensor Matrix（base-fee velocity、RPC jitter、phase-shift）仍為權威。

### 1.2 大規模資本保護

`checkSoilResistance()`（p50 ~106 μs）於本地 GM 市場深度無法在無嚴重 price impact（**>10 bps**）下吸收大型機構訂單時 short-circuit 任何廣播。L2 提交前 fail-closed — depth / cross-spread / slippage fuse（R01）。

---

## 2. 三角流動性循環與隔離 Tranche

閉環三場所路由，**Arbitrum One 為主要 yield base**。**Hyperliquid** — Independent L1 High-Frequency Orderbook AppChain（與 Arbitrum 永續流動性生態同源）— 提供跨鏈對沖腿；許可制入站（如 Robinhood Chain）為可選：

```text
Arbitrum One (GMX GM Yield Base — PRIMARY · ETH/USDC)
 ↕ 1× Δ-neutral hedge
Hyperliquid (Independent L1 HF Orderbook AppChain · 1× Short Hedge)
 ↑ optional permissioned ingress (e.g. Robinhood Chain 46630 / 4663)
```

| 腿 | 場所 | 角色 |
|-----|-------|------|
| **Yield base (PRIMARY)** | Arbitrum One · GMX v2 GM | Underweight-side GM LP · builder `uiFeeReceiver` (**+10 bps**) · Citadel pre-execution gate |
| **Hedge** | Hyperliquid (Independent L1 HF Orderbook AppChain) | Session-key **1× short** Emergency Liquidity Sponge · `evaluateHyperliquidSessionGuard()` · nonce-healed signing |
| **Ingress (optional example)** | Robinhood Chain | Supported permissioned institutional ingress · outbound-only escort into Arbitrum · **ZeroDev Smart Route Calldata Binding** (reference harness — USDG → GMX `ExchangeRouter`; production baseline = **Arbitrum One Native Ingress**) |

**控制平面：** Cloudflare Edge Worker（`SystemState` SSOT）於任何 unsigned GMX payload 或 HL hedge 派發前評估 sequencer · oracle lag · soil · RPC radar。路由單向進入 `SystemState`；venue adapter 未經 gate pass 永不 mutate 對手 book。

**Read API：** `GET /api/yield/triangle` — HL · GMX 跨場所 structural APY / depth / gate 狀態（Robinhood Chain 入站 stub 經 egress escort 堆疊）。

### 2.1 隔離 Tranche

Solidity vault 表面將資本分割為兩條不可互換風險通道：

| Tranche | 鏈政策 | 行為 |
|---------|--------------|----------|
| **Permissioned RWA Tranche** | Robinhood Chain **4663** inbound **BLOCKED** at Edge protocol filter | Institutional / RWA-tagged deposits only · **`src/adapters/across-ingress-bridge.ts`** AML inbound block · **`IngressSafetySwitch`** oracle flush + address blacklist · no permissionless public mint path from 4663 |
| **Permissionless DeFi Tranche** | Arbitrum One + HL | Open GM / hedge flow behind Citadel fail-closed gate · standard DeFi UX |

**不變量：** 許可制通道上的 RWA 資本 cannot be atomically reminted into the permissionless DeFi tranche without an explicit, audited bridge + compliance gate (Across + AA). Chain **4663 → Arbitrum** inbound is denied by default; Testnet **46630** remains the active integration sandbox.

**鏈上錨點：** [`contracts/IngressSafetySwitch.sol`](../../contracts/IngressSafetySwitch.sol) · [`contracts/SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol) · [`contracts/src/SliverVineAgentPolicyGuard.sol`](../../contracts/src/SliverVineAgentPolicyGuard.sol).

**Lean On-Chain Gate by Design：** 雙合約結算核心為 `SliverVineGate.sol`（consume-once attestation）+ `SliverVineAgentPolicyGuard.sol`（[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Emerging Draft policy validation）。兩者均**不可變、非託管、無 proxy**，風險數學保留於 Edge（`checkSoilResistance()` **p50 ~106µs**）— 鏈上為 fail-closed 記錄，非 HFT 熱路徑。

**Arbitrum One（42161）— Mainnet Ignition Gate：**

| 合約 | 角色 | 已驗證地址（Arbitrum One） |
|----------|------|----------------------------------|
| `SliverVineGate` | Consume-once EIP-712 attestation anchor | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **Mainnet Ignition Tx** | Forge broadcast · contract creation | [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Deploy script** | ChainID guard + optional smoke | [`DeployArbitrumOneGate.s.sol`](../../SliverVineGate/script/DeployArbitrumOneGate.s.sol) · [`deploy-mainnet-gate-ignition.ts`](../../scripts/deploy-mainnet-gate-ignition.ts) |

> **Bootstrap Keys：** Initial mainnet deploy uses Bootstrap Ignition Keys (`0x1111…`/`0x2222…`) for public verification; production multisig rotation via native governance.

**Arbitrum Sepolia（421614）— 已驗證部署地址：**

| 合約 | 角色 | 已驗證地址（Sepolia） |
|----------|------|----------------------------|
| **Deployer / Admin / Signer** | OpSec-isolated Forge broadcast signer · gate stack admin | `0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F` |
| `SliverVineGate` | Consume-once EIP-712 attestation anchor | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| `SliverVineAgentPolicyGuard` | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Emerging Draft) agent-policy pre-screen · `SliverVineCitadel` domain · one-way `isPolicyActive` | **Code-Verified** (Foundry unit) · on-chain deploy pending |
| `SliverVineRiskOracle` | EIP-712 offline risk report · `STATUS_SHUTDOWN` flush | `0x3FFa2539f502682E8145e6Eb427ff78d258D53a4` |
| `IngressSafetySwitch` | Pillar 2 compliance filter (oracle flush + blacklist) | `0x3E4298e2b8d4e30396A54C1817Eb71c9272Ffb4B` |
| `SliverVineSoilCoprocessor` (Stylus) | On-chain HF soil math coprocessor | **Code-Verified** (Cargo **5/5**, Wasm Sandbox Vitest Passed, On-chain Deploy Pending Tooling Lock) |

#### 2.1.1 IngressSafetySwitch 明確範圍隔離

> **Design remark (Phase A SSOT):** `IngressSafetySwitch` is a **Pillar 2 address-level compliance filter only**. It does **not** implement chainId routing, R17/R20 daily-loss cutoff, Hot Key severance, or `checkSoilResistance()`.

| 層級 | 職責 | 模組 |
|-------|----------------|--------|
| **Edge ingress adapter** | Chain ID unidirectional escort · `AML_INBOUND_TO_ROBINHOOD_BLOCKED` | `src/adapters/across-ingress-bridge.ts` (Robinhood = reference adapter) |
| **On-chain ingress switch** | Oracle flush + institutional blacklist per address | `IngressSafetySwitch.sol` |
| **Pre-execution shield** | Sub-ms soil fuse · R17/R20 · Hot Key / `rootProtection()` | Pillar 3 Edge · Wasm · **not** IngressSafetySwitch |

> Shutdown 由上游觸發： **`SliverVineRiskOracle.applySignedReport(STATUS_SHUTDOWN)`** (EIP-712 offline signer → `isSystemFlushed`). **`IngressSafetySwitch`** reads oracle state only — no independent `Ownable` / `Pausable` admin surface.

**Invariant:** Phase A rename (`RobinhoodSafetySwitch` → `IngressSafetySwitch`) is **nomenclature + SSOT realignment only** — zero predicate or storage-layout change. `SliverVineGate.sol` has **no** on-chain dependency on this contract.

### 2.2 資產贖回與清算邊界

| 路徑 | 邊界 |
|------|----------|
| **Arbitrum One Off-ramp** | Native **ETH, BTC, and USDC** supported directly upon GMX v2 async unwind (3–5 min). |
| **USDG Clearing** | Native USDG treasury redemptions are restricted to Robinhood Chain (`46630`/`4663`) via the unidirectional bridge; Arbitrum USDC is converted on return to preserve compliance bounds. Inbound AML contamination (reverse path) is blocked. |

### 2.3 ZeroDev Smart Route Calldata Binding（支柱二 Reference Harness — Demo Spec）

> **狀態：** **Reference Harness & Spec** — 經 Vitest dry-run 驗證（`tests/adapters/gmx-smart-route-payload-binding.test.ts`）。作為評審可重現的 reference adapter。生產執行基線預設 **Arbitrum One Native Ingress**。

**支柱二上下文：** 本節記錄 Compliance Ingress Firewall 的 **reference harness 表面** — 從許可制入場（Robinhood `46630`/`4663` **USDG** 為 inaugural reference adapter）至 Arbitrum GMX 執行的 ZeroDev Kernel UserOp calldata binding。**`GMX_V2_EXCHANGE_ROUTER_ARBITRUM`**（`ZERODEV_SMART_ROUTE_TARGETS` · `gmx-revenue.ts`）→ **`GM_ETH_USDC`** pool — 單鍵跨鏈 deposit/swap calldata 規格，無 hot-wallet 托管。

**Payload binding（calldata 級，Gate struct 不變）：** `buildGmxSmartRoutePayloadBinding()` 編碼 smart-route calldata → `computeGatedExecutorPayloadHash()` 鏡像鏈上 `GatedExecutor.payloadHash(initiator, target, keccak256(data), nonce)`。digest 填入既有 `RiskAttestation.payloadHash` 欄位 — **`SliverVineGate.sol` `ATTESTATION_TYPEHASH` 與 struct layout 不修改**。

Anchors: [`gmx-smart-route-payload-binding.ts`](../../src/services/adapters/gmx-smart-route-payload-binding.ts) · [`gated-executor-payload.ts`](../../src/sdk/gated-executor-payload.ts) · [`r-chain-yield-router.ts`](../../src/adapters/robinhood/r-chain-yield-router.ts) · [`GatedExecutor.sol`](../../SliverVineGate/src/GatedExecutor.sol).

### 2.4 支柱一 — 可選 ZeroDev 帳戶抽象（整合摘要）

> **支柱一完整規格：** [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) — ZeroDev Kernel v3 session keys、EIP-7702 比較分析、`sessionOk` / `allowedToSign` dry-run 範圍（`pnpm run demo:e2e`）與 `pnpm test:zerodev` harness。本節僅保留整合錨點。

> **狀態：** v1.0 生產 SSOT = **Kernel v3**（`ZERODEV_KERNEL_VERSION` v0.3.1 · EntryPoint v0.7）；**Kernel v4** = grant 後 V1.5 對齊路徑（僅 Gatehouse adapter 升級 — **無** Shield / Wasm / EIP-712 Gate 重寫）。

> **邊界：** ZeroDev Kernel v3 為 **opt-in 支柱一 AA 層**（`USE_ZERODEV_AA` 預設關閉）。ZeroDev 基礎設施故障、bundler 中斷或 Paymaster 耗盡 **永不** 損害 **Edge Wasm Shield**（`checkSoilResistance()` · p50 ~106 µs）或 **Arbitrum Native Ingress** — 機構可回退 EOA / 原生簽名路徑，預廣播保護相同。

#### 2.4.1 ZeroDev 角色：Scoped Session Keys 與 Gas Sponsorship（支柱一可選 AA 層）

SliverVine Protocol 將 **預廣播風險執行** 與 **帳戶交付** 分離。ZeroDev Kernel v3 為 **opt-in 支柱一層** — 機構可啟用範圍化 session keys 與 Paymaster gas sponsorship；協議 **不要求** ZeroDev 以實現核心 Citadel 保護或 bridge 會計。

| 層級 | 角色 | SSOT | 對 ZeroDev 依賴 |
|-------|------|------|------------------------|
| **Pre-Broadcast Risk Core (p50 ~106 µs)** | Sub-ms soil fuse · R01–R20 · fail-closed severance | `pkg/soil_core.wasm` · `checkSoilResistance()` on Cloudflare Edge | **None** — runs 100% independently of AA |
| **ZeroDev Kernel v3 (Pillar 1)** | Opt-in smart-account delivery plane · scoped **30s** session keys · Paymaster sponsorship | `src/adapters/arbitrum/zerodev-aa/` · `pnpm test:zerodev` | **Opt-in** — `USE_ZERODEV_AA` default-off |
| **Baseline ingress (no AA)** | Direct Arbitrum Native Ingress · Across bridge escort | `across-ingress-bridge.ts` · native GMX/HL adapters | **Independent** — `lostUsd ≡ 0` guaranteed by bridge state machine, not AA |

**權力分立：**

- **Pre-Broadcast Risk Core (p50 ~106 µs)：** 100% 由 SliverVine Edge Wasm（`pkg/soil_core.wasm`）獨立驅動。每個意圖 — EOA、Kernel UserOp 或 bridge escort — 於任何廣播路徑 **之前** 由 `checkSoilResistance()` 評估。
- **ZeroDev Kernel v3 (Pillar 1)：** 作為範圍化 30s session keys 與 Paymaster gas sponsorship 的 **Opt-In Smart Account Delivery Plane**。Citadel 永不持有用戶金鑰或本金 — AA 啟用時資本留在 Kernel `sender` 智能帳戶（R06–R07 · ERC-7579）。
- **Baseline Fallback：** Direct **Arbitrum One Native Ingress** 與 **Across Bridge** adapter 無論 ZeroDev 是否啟用均可運作。`lostUsd ≡ 0` 不變量由 bridge state machine 與 escort 會計保證 — **非** Account Abstraction。

啟用 ZeroDev 時，提供 SliverVine 不自研的三項交付平面能力：

| 能力 | 無 ZeroDev（基線） | 可選 ZeroDev 整合 |
|------------|--------------------------|-----------------------------------|
| **Scoped Session Keys** | EOA or institutional multisig signing | Kernel modular `ORDER_EXECUTE` · R06/R07 notional cap · 30s TTL auto-expiry |
| **Paymaster sponsorship** | Institutions prefund Arbitrum gas | `zerodev.sponsorUserOperation` · per-op ≤ $0.50 · daily $10 circuit breaker |
| **Bundler standard path** | Direct `eth_sendRawTransaction` or venue-native signing | EntryPoint v0.7 + **EIP-7562** compliant UserOp · fail-closed · no blind retry |

**執行管線（僅 opt-in AA 路徑）：**

```text
UserOp draft → verifyAgentIntent() [Edge Shield · p50 ~106µs · Wasm — independent of AA]
 → evaluateStaticBreakerMatrix() [soil + gas ledger]
 → Paymaster sign → Bundler → EntryPoint → Kernel validateUserOp
```

Shield 於每條路徑 **廣播前** 決定；ZeroDev 僅在明確 opt-in 時處理 **non-custodial 帳戶交付**。ZeroDev 不可用時，機構經 **Arbitrum Native Ingress** 或 **Across Bridge** escort 路由 — Wasm Shield 與 `lostUsd ≡ 0` 不變量完全運作。

#### 2.4.2 Kernel v3 / v4 Session Keys（ERC-7579 模組權限）

> **範圍：** Kernel v3 session keys 為 v1.0 已交付 AA 表面。Kernel v4 對齊為 **grant 後（V1.5）** — 僅 adapter 替換；Shield / Wasm / Gate 不變。

| 維度 | Kernel v3（v1.0 已交付） | Kernel v4（V1.5 對齊） |
|-----------|------------------------------|------------------------------|
| **Module standard** | ERC-7579 modular session keys | v4 unified permission surface · ZeroDev "One Stack" |
| **Permission scope** | `ORDER_EXECUTE` · whitelisted `callData` target/selector | Same R06 semantics · extended Smart Routing cross-chain session scope |
| **Notional cap** | `SESSION_KEY_NOTIONAL_CAP_USD` = **$5,000** (R07) | Config-driven · invariant formulas unchanged |
| **TTL / re-auth** | Session TTL + R14 EIP-712 5-min re-auth | v4 Authorize stage native alignment · adapter swap only |
| **Signature path** | Kernel `isValidSignature` → ERC-1271 `0x1626ba7e` | Dual plane: Kernel ERC-1271 ∥ Gate ECDSA m-of-n |
| **Code anchors** | `src/adapters/arbitrum/zerodev-aa/` · `hl-session/permissions.ts` | ⏳ Post-Grant (V1.5) adapter swap · **Shield / Wasm zero rewrite** |

**遷移規則：** Kernel v3 → v4 僅替換 Gatehouse adapters（`zerodev-aa-userop.ts` · `zerodev-aa-gate.ts`）；`checkSoilResistance()`、`pkg/soil_core.wasm` 與 `SliverVineGate.sol` **不因** Kernel 主版本變更。

#### 2.4.3 Paymaster Gas Sponsorship（贊助與 Circuit Breaker）

> **範圍：** Paymaster sponsorship 為 **opt-in**（支柱一）。每日上限耗盡回退 `sponsored: false` — UserOp 起草繼續自付 gas；**Edge Wasm Shield 與 Arbitrum Native Ingress 不受影響**。

| 參數 | 值 | SSOT |
|-----------|-------|------|
| Per-UserOp sponsorship cap | **$0.50 USD** | `MAX_GAS_COST_PER_USEROP_USD` |
| 24h rolling sponsorship budget | **$10 USD** | `DAILY_SPONSORSHIP_LIMIT_USD` |
| Trip code | `ZERODEV_GAS_LIMIT_EXCEEDED_TRIP` | `zerodev-aa-static-breaker.ts` |
| Paymaster middleware | `zerodev.sponsorUserOperation` | `zerodev-aa-userop.ts` |
| Persistence (optional) | KV `zerodev:aa:gas:ledger` · TTL 86,400s | `zerodev-aa-gas-ledger.ts` |

Sponsorship 與 soil fuse **串行評估**： `evaluateStaticBreakerMatrix()` runs `checkSoilResistance()` first, then `evaluateSponsoredGasLimits()` — on soil trip, **both sponsorship and broadcast are denied**, preventing "paid but should-be-blocked" UserOps from reaching the bundler.

#### 2.4.4 EIP-7562 Zero-Bundler-Rejection 不變量

> **範圍：** 僅於 ZeroDev AA **opt-in** 時適用。Bundler 逾時或拒絕於 UserOp 路徑觸發 fail-closed — 機構可完全 bypass AA 經 Arbitrum Native Ingress，不失去 Shield 保護。

**Zero-Bundler-Rejection Invariant:** Citadel UserOps MUST NOT trigger EIP-7562 opcode/storage violations during the validation phase; bundler rejection is a **protocol fault**, not a retry signal.

| 規則 | 強制 |
|------|-------------|
| Validation-phase storage reads | Session-key modules restrict `callData` to whitelisted target/selector — no forbidden cross-contract reads |
| Edge pre-screen | Static breaker + `checkSoilResistance()` before `sendUserOperation()` |
| Fail-closed | Bundler unreachable · missing EP v0.7 · timeout → `BUNDLER_TIMEOUT_FAIL_CLOSED` (`ZERODEV_BUNDLER_FAIL_CLOSED_TIMEOUT_MS` = 3,000 ms) |
| Probe | `supportsEntryPoint07` · `zerodev-aa-bundler.ts` smoke probe |

此不變量確保機構 UserOp **可預測交付** on Arbitrum bundler infrastructure — not silently dropped for storage violations — consistent with the 106 µs Shield fail-closed philosophy.

#### 2.4.5 ZeroDev v4「七階段、一棧」對齊路線圖（Grant 後規格）

ZeroDev v4 將 smart-wallet 生命週期收斂為 **seven stages, one stack**。 SliverVine Protocol v1.0 delivers stages **①–⑤** (with ② as reference harness only); stages **⑥–⑦** are explicitly **post-grant roadmap** — not claimed as v1.0 scope.

| 階段 | ZeroDev v4 語義 | SliverVine Citadel Shield 整合錨點 | 狀態 |
|-------|---------------------|-------------------------|--------|
| **① Sign in** | Identity · Kernel account resolution | ZeroDev login → `sender` Kernel address · no hot-wallet seed | ✅ v1.0 Delivered (Sepolia verified) |
| **② Fund** | Cross-chain deposit · Smart Routing | `ZERODEV_SMART_ROUTE_TARGETS` · USDG → GMX ExchangeRouter (§2.3 reference harness) | 📋 Reference Harness (Vitest dry-run verified) |
| **③ Gas** | Paymaster sponsorship | `zerodev-aa-gas-ledger` · per-op / daily caps (§2.4.3) | ✅ v1.0 Delivered (Sepolia verified) |
| **④ Authorize** | Session key scope | ERC-7579 `ORDER_EXECUTE` · R06/R07 · R14 re-auth | ✅ v1.0 Delivered (Sepolia verified) |
| **⑤ Execute** | UserOp broadcast · on-chain execution | `verifyAgentIntent()` → Shield → Bundler → GMX/HL venue | ✅ v1.0 Delivered (Sepolia verified) |
| **⑥ Recover** | Account recovery · social recovery | — | ⏳ Post-Grant Roadmap (V1.5) — *Out of scope for v1.0 (handled by upstream Kernel/EOA owner)* |
| **⑦ Compose** | Multi-step intent composition | 2PC intent ledger · `intent-ledger.ts` (partial internal coverage) | ⏳ Post-Grant Roadmap (V2.0 CaaS) — *Off-chain 2PC intent ledger (partial internal coverage)* |

```text
Sign in ──► Fund ──► Gas ──► Authorize ──► Execute (v1.0 Core Active Scope)
 │          │        │          │              │
 Kernel   Smart    Paymaster  Session Keys   Shield 106µs
 Account  Route    Ledger     R06/R07        + Venue
 (Ref)    (Ref)                              dispatch
```

**v1.0 活躍範圍：** Stages ①③④⑤ are Sepolia-verified AA delivery paths. Stage ② is a Vitest reference harness only. Stages ⑥⑦ are **not** v1.0 deliverables — recovery is upstream Kernel/EOA owner responsibility; multi-step Compose is a V2.0 CaaS roadmap item.

**One Stack 語義（post-grant alignment）：** Kernel v4 發布時，stages ①–⑤ 共享一 Kernel 帳戶、`sender` 身份與 Citadel `AllowedToSign` predicate — 機構無需在許可制入場與 Arbitrum One 間切換錢包。**Shield / Wasm / Gate 不變量跨 Kernel 主版本不變**。

### 2.5 戰略藍籌生態與結算路線圖（V1.0 Core + V1.5 / V2.0）

> **範圍誠實性：** v1.0 active 執行與費用捕捉仍為 Arbitrum One 上 **GMX v2 ETH/USDC GM + Hyperliquid 1× short**（§2 三角）。**Pendle Institutional Shield** 為 **v1.0 Live 核心支柱三** 預執行防火牆（非費用捕捉路徑）。**Stabilizer Sepolia Cross-Pass Sandbox** 於 `421614` **v1.0 Live**。Camelot 與 Variational 為模組化 grant 後結算擴展。

| 夥伴 / 場所 | 策略角色 | Citadel 整合 | 時間範圍 | 狀態 |
|-----------------|----------------|---------------------|---------|--------|
| **Pendle Finance**（Yield & Rate Hedging） | yield-tokenization 市場中 AI agent 的 PT/YT 安全哨兵 — **非收益競品** | `checkSoilResistance()` · `pendleOracle` / `pendleCrossGuard` soil probes · [`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) (sync cache · TTL 60s · `PENDLE_ORACLE_STALE`) · `evaluatePendleGmxCrossGuard()` · `evaluatePendlePtExpiryRisk()` · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) · [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) | **V1.0** | ✅ Live · Core Pillar 3 · **192 個測試檔案 \| 836 PASS Clean（100% PASS）** |
| **Stabilizer**（Sepolia Cross-Pass Sandbox） | AI agent 穩定幣再平衡通用 testnet sandbox · `421614` 上 cross-pass 路由至 GMX v2 + Pendle | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · `evaluateStabilizerSwapGuard()` · identical `checkSoilResistance()` gate as `42161` | **V1.0** | ✅ Live · Sepolia `421614` · `pnpm demo:stabilizer` |
| **Camelot DEX**（Native Liquidity） | Arbitrum 原生 `GRAIL` 流動性深度以降低 delta-neutral 再平衡摩擦 | Camelot API on RPC allowlist (`api.camelot.exchange`) · rebalance leg optimizer · `FRICTION_BUFFER_APY` absorption in [`rebalance-rules.ts`](../../src/services/yield/rebalance-rules.ts) | **V1.5** | ⏳ Roadmap Spec |
| **Variational**（Next-Gen Perps & Cross-Venue Alternative） | 進階去中心化永續與跨鏈 margin 路由的未來整合 — Hyperliquid 對沖腿的可擴展補充/替代 | `buildVariationalShortOrder()` · `evaluateVariationalOrderbookDepth()` PoC · same-chain Arbitrum hedge extension | **V2.0** | ⏳ PoC Spec ([`docs/logging/20260827_v1.5_aave_variational_adapter_poc_ZH.md`](../logging/20260827_v1.5_aave_variational_adapter_poc_ZH.md)) |

```text
v1.0 Active Triangle (42161)
  GMX v2 GM Yield ──1× Δ-neutral──► Hyperliquid Short
         │
         ├──► V1.0: Pendle Institutional Shield (Pillar 3 · sync oracle · soil fuse)
         └──► V1.0: Stabilizer Sepolia Cross-Pass Sandbox (421614 · Stabilizer→GMX→Pendle)
         └──► V1.5+: Camelot zero-slippage settle
         └──► V2.0: Variational native perp hedge (HL complement/alternative)
```

---

## 3. 跨場所風險引擎與 Defense Matrix（R01–R20）

> **支柱三完整規格：** [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) — Wasm `soil_core.wasm` 引擎、`checkSoilResistance()` 延遲護城河（p50 ~106 µs · warm &lt;60 µs）、Tri-Sensor 矩陣與完整 R01–R20 防禦矩陣。下文為本拓撲文檔保留的整合摘要。

### 3.1 微秒護城河（摘要）

| 護城河 | 常數 / 模組 | 規格 |
|------|-------------------|------|
| **Emergency Margin Buffer** | `DEFAULT_CROSS_MMR = 0.05` (5% account equity reserve) | Blocks new risk when free margin buffer would fall below **5%** after intended notional (`src/services/risk/liquidation-meter.ts`) |
| **HL Nonce Auto-Resync** | `HL_NONCE_AUTO_RESYNC` · `session-key-adapter-lib/nonce-auto-healing` | Monotonic nonce heal on `Invalid nonce` WS · heartbeat revoke closes signing channel |
| **NTP Clock Drift Compensator** | `NTP_CLOCK_DRIFT_COMPENSATOR` | Rejects / skew-corrects venue timestamps with **&lt;200ms** drift vs Edge NTP; aligns with Pgate latency fuse (`PGATE_MAX_LATENCY_MS` = 200) |
| **Cross-Venue Net Slippage TWAP** | `CrossVenueNetSlippage` | When net cross-book slippage **&gt; 0.5%** (`MAX_SLIPPAGE = 0.005`), trips soil + schedules **TWAPEngineV2** path slicing instead of market sweep |
| **GMX Positive Skew Rebate** | `gmx-v2-balancer` / price-impact soil | Qualifies underweight-side flow · captures **positive skew / price-impact rebate** bps — never conflated with builder UI fee |

**正式風險方程式（SSOT）：**

$$
\mathrm{BufferRatio} = \frac{\mathrm{Equity}}{\mathrm{Notional}} - \mathrm{MMR},\quad \mathrm{MMR}=0.05
$$

$$
\mathrm{MaxSL} = \mathrm{Balance} \times 0.01 + 100
$$

$$
\mathrm{AllowedToSign} = \mathrm{Injection} \land \mathrm{Digest} \land \mathrm{Soil} \land \mathrm{Session} \land \mathrm{Gas} \land \mathrm{Attestation} \land \mathrm{Armor} \land \mathrm{Wasm}
$$

**配套 fuse：** Dynamic Account Risk Ceiling (V0.8 Baseline: Equity-Weighted SL; V1.0 Mainnet: Dynamic Adaptive Engine) · Sequencer 600s grace · Oracle lag fail-closed · Root slippage breaker (0.5%). · Configurable Dynamic Slippage Deadman is an additional fail-closed fuse on the AA / SDK path.

#### § Pendle Institutional Shield（V1.0 Live · 核心支柱三）

| 層級 | 模組 | 熱路徑行為 |
|-------|--------|-----------------|
| **Dynamic Oracle** | [`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) | Sync `ingest()` / `resolve()` in-memory cache · **TTL default 60s** · zero hot-path I/O |
| **Registry Hydration** | [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) | `hydrateFromOracle` merges `impliedYield`, `ptPriceInAsset`, `liquidityConstant`, `expirySec` |
| **Soil Fuse** | [`soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) | `pendleOracle` + `pendleCrossGuard` → `collectExternalSoilFlags()` · **`PENDLE_ORACLE_STALE`** fail-closed |
| **Cross-Guard** | [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) | Shadow Margin vs GMX maintenance · Observatory Paradox de-leverage greenlight |
| **Expiry Guard** | [`pendle-pt-expiry-guard.ts`](../../src/adapters/pendle/pendle-pt-expiry-guard.ts) | PT maturity &lt;7d ∧ yield jitter &gt;200bps fail-closed |
| **AI Pool Factory** | [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) | `validateAIPoolSelection()` · maturity ≥7d · yield drift ≤300bps · min liquidity · asset whitelist |

**Vitest：** [`pendle-market-oracle.test.ts`](../../tests/adapters/pendle-market-oracle.test.ts) · [`pendle-pool-factory.test.ts`](../../tests/adapters/pendle-pool-factory.test.ts) · [`pendle-pt-registry.test.ts`](../../tests/adapters/pendle-pt-registry.test.ts) · [`pendle-soil-guard.test.ts`](../../tests/risk-control/pendle-soil-guard.test.ts) · **192 個測試檔案 \| 836 PASS Clean（100% PASS）** · coexists with Shield **p50 ~106µs** budget.

#### § AI Guarded Pool Factory 協議（V1.0）

自主 AI agent 可提出 Pendle pool 建立或加流動性意圖 (`PENDLE_CREATE_POOL` · `PENDLE_ADD_LIQUIDITY`). Before mempool broadcast, `validateAIPoolSelection()` enforces four synchronous safety invariants on the hot path:

| Invariant | Threshold | Fail reason |
|-----------|-----------|-------------|
| **Liquidity cliff** | Days to maturity **≥ 7** | `PENDLE_POOL_MATURITY_CLIFF` |
| **Yield drift (MEV sandwich)** | Implied vs oracle yield **≤ 300 bps** | `PENDLE_POOL_YIELD_DRIFT_BREACH` |
| **Min initial liquidity** | **≥ $100,000 USD** | `PENDLE_POOL_LOW_INITIAL_LIQUIDITY` |
| **Underlying whitelist** | `eETH` · `ETH` · `USDC` | `PENDLE_POOL_ASSET_NOT_WHITELISTED` |

**Soil 接線：** optional `pendlePoolFactory` probe on `checkSoilResistance()` → `collectExternalSoilFlags()` · may chain `useOracle` freshness (`PENDLE_ORACLE_STALE`) before drift check · **p50 ~106µs** Shield budget preserved (zero hot-path I/O).

### 3.2 風險與執行矩陣

#### § Poisson Jitter 與 Anti-MEV Adaptive TWAP

對 **$1,000,000+** treasury 路由至 GMX v2 GM pools，Shield 排程子 clip via **Wasm-driven Poisson random intervals** uniformly bounded **18s–110s** across a **12–18 minute** parent window. Inter-arrival jitter drives autocorrelation toward **near zero**, keeping GMX local price impact **≤ 10 bps**; any residual depth breach still short-circuits via `checkSoilResistance()` (R01).

#### § Block 0 Sequencer Desync 防禦

| Layer | Mechanism |
|-------|-----------|
| **Private path** | Bypass public mempools via **Private Relays / QUIC** — Edge never exposes intent on the open gossip surface during desync windows. |
| **Settlement timing moat** | Leverage GMX v2 **two-stage async settlement**: keepers execute create→settle asynchronously; **`cancelOrder` remains a single-stage atomic** counter to stale MEV intent if soil / sequencer / oracle sensors trip mid-window. |

#### § SGX PRM Key Caching — ⏳ 規劃中 / V1.0 設計規格

> **不在 v1.0 codebase。** Documented cold-path / hot-signing architecture for future hardened key isolation.

| Phase | Bound |
|-------|-------|
| **Epoch attestation bootstrap** | **24-hour** SGX / PRM attestation refresh — cold path only. |
| **Hot signing** | Sub-ms **in-memory Ephemeral Key** signing after bootstrap — **&lt;30µs** CPU PRM execution on the Shield hot wire (no per-tx remote attestation). |

#### § Step-down 自動 Deleveraging 規則

Python-verified **48-day runway** under sustained negative funding. Automated 3-phase unwind (R12 / escalation ladder family):

| Trigger | Action |
|---------|--------|
| **Day 8** | Delever **−20%** notional |
| **Day 15** | Delever **−50%** notional |
| **Day 22 (30% reserve)** | **100% Fail-Closed return** — flatten remaining exposure; R17 / R20 severance envelope if flatten stalls |

### 3.3 Defense Matrix（R01–R20）— 摘要

**狀態：** **17 Active | 2 Refactored | 1 Deprecated** · Full rule table: [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md#defense-matrix-r01r20).

| 層級 | 規則 | 角色 |
|------|-------|------|
| **Pre-execution soil** | R01 · R03 · R04 · R05† | Wasm soil fuse · L2 stale book · Pgate latency |
| **Session / AA** | R06 · R07 · R08 · R14 | Scoped keys · notional cap · nonce heal · re-auth |
| **Saga / flatten** | R09 · R10 · R12 · R13 | 2PC ledger · auto-flatten · leverage scaling · black-swan halt |
| **Severance** | R17 · R20 · R02 | Daily loss cutoff · physical deadlock · `rootProtection()` |
| **Anchors / infra** | R11 · R15 · R16 · R18 · R19 | Dynamic SL · CCXT harness · 5-TX provenance · KV hardlock |

† R05 SpoofBuster — **Deprecated** (superseded by soil / depth gate).

**支援感測器：** Sequencer Guard · Arbitrum Gas / Oracle Lag · RPC Whitelist · Escalation Ladder.

### 3.4 拓撲與請求流

| 引擎 | 場所 | 角色 |
|--------|-------|------|
| **Arbitrum Citadel** (primary) | GMX v2 GM pools, Arbitrum One | Pre-execution gate · underweight-side routing |
| **Hyperliquid Native** (cross-chain L1) | Independent L1 HF orderbook perps · session-key signing · spread/size/rate-limit guard | Emergency Liquidity Sponge when Citadel flags trip |

路由政策：依 risk flags 選擇 venue; both paths share the same fail-closed envelope. On-chain attestation consume-once: `SliverVineGate.sol` (`verifyAndConsume`).

1. **Ingress** — `worker-fetch.ts` / `worker-scheduled.ts`.
2. **Pre-execution** — sequencer → oracle-lag → `checkSoilResistance()` (depth, cross-spread, slippage fuse, **Pendle oracle / cross-guard soil probes**).
3. **Routing** — underweight GM qualification → unsigned payload with optional builder hooks.
4. **Hedge** — session-key HL leg when Citadel trips.
5. **State** — unidirectional `SystemState`; 2PC intent ledger → KV.

### 3.5 Wasm Soil Core（M4）— 摘要

> **Full Wasm / latency specification:** [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md#wasm-soil-core-engine-no_std).

> **雙引擎 Soil 拓撲：** SliverVine Citadel Shield enforces dual-engine soil resistance: pure high-throughput TypeScript soil math on Cloudflare Worker hot paths, alongside native `pkg/soil_core.wasm` execution on `@slivervine/citadel-sdk` agent-intent paths. Both engines share identical p50 ~106µs fail-closed thresholds and defense bounds.

- 產物：`pkg/soil_core.wasm` (`#![no_std]`)
- 預算：**&lt;28kb** Cloudflare · hot-path exec **&lt;60µs** · Shield p50 **~106µs**
- 接線：`src/sdk/soil-wasm.ts` (production); TS sim fallback for dev

### 3.6 金融風險參數與 Epoch 營運

| 層級 | 參數 | 值 / 規則 | 狀態 |
|-------|-----------|--------------|--------|
| **Active v1.0 Controls** | Single-order notional cap | **$5,000 USD** (`SESSION_KEY_NOTIONAL_CAP_USD`) | ✅ Code-Verified |
| **Active v1.0 Controls** | Protocol UI fee accrual | **+10 bps** `uiFeeReceiver` (`GMX_UI_FEE_BPS`) + up to **25%** referral rebate | ✅ Code-Verified |
| **Active v1.0 Controls** | Emergency margin buffer | **5%** (`DEFAULT_CROSS_MMR = 0.05`) | ✅ Code-Verified |
| **Active v1.0 Controls** | Circuit breakers | **R17** daily-loss severance · **R20** physical deadlock / flatten-fail | ✅ Code-Verified |
| **Vault Operational Spec (V1.0 Roadmap)** | Alpha Vault Cap | **$100,000** hard TVL ceiling | ⏳ Planned |
| **Vault Operational Spec (V1.0 Roadmap)** | Epoch batching | **4-hour** epoch windows for cross-venue execution | ⏳ Planned |
| **Vault Operational Spec (V1.0 Roadmap)** | Deposit cooldown | **24-hour** minimum hold to prevent flash arbitrage | ⏳ Planned |

---

## 4. 標準合規與 ERC/EIP Wiki

> **完整技術分解、合規姿態與驗證錨點見 [Standard Compliance & ERC/EIP Wiki](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI_ZH.md)（中文參考譯本）或 [英文正本](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md)。**

Citadel 綁定 **ERC-4337** · **EIP-7562** · **EIP-712** · **ERC-1271** · **ERC-20/777** · **OpenZeppelin v5** · **ERC-7579** · **EIP-7702** · **ERC-7715** · **ERC-8196** (Draft) · **EIP-1559** · **Arbitrum Stylus SDK** · **ArbOS / Stylus** · **Robinhood Chain Ingress** · **Wasm `soil_core`** — each mapped to implementation anchors and verification probes in the dedicated wiki ([summary table](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#standards-summary-table) · [compliance posture](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#compliance-posture) · [ArbOS/Stylus](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos--stylus-alignment--code-verified-on-chain-coprocessor) · [RPC/WSS](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#infrastructure-rpc--wss-alchemy-ha)).

---

## 5. 結算窗口與費用 Tokenomics

### 5.1 結算窗口

| 窗口 | 常數 | 時長 | 意義 |
|--------|----------|----------|---------|
| GMX GM redemption / settle | `GMX_REDEMPTION_WINDOW` | **3–5 minutes** | Keepers / oracle settle band for GM deposit·withdrawal completion on Arbitrum |
| HL withdrawal settle | `HL_WITHDRAWAL_SETTLEMENT_WINDOW` | **15 minutes** | L1 bridge / withdrawal finality budget before Citadel treats capital as free for re-route |

Gate 不得假設三角跨場所 instant atomicity；庫存會計在各自窗口 elapsed 或 venue ack 確認前持有在途 leg。

#### 5.1.1 策略結算擴展（V1.0 Core + V1.5 / V2.0）

| 擴展 | 結算角色 | 時間範圍 | 狀態 |
|-----------|-----------------|---------|--------|
| **Pendle Finance** | PT/YT exit proceeds vs GMX margin shadow accounting — expiry blackhole / oracle decoupling guard · `PENDLE_ORACLE_STALE` soil fuse | **V1.0** | ✅ Live · Core Pillar 3 · soil-wired · **192 個測試檔案 \| 836 PASS Clean（100% PASS）** |
| **Camelot DEX & Stabilizer** | `GRAIL` liquidity depth for rebalance routing; Stabilizer is **V1.0 Live** on Sepolia `421614` | **Stabilizer V1.0** · Camelot **V1.5** | ✅ Stabilizer Live · ⏳ Camelot Roadmap Spec |
| **Variational** | Same-chain perp hedge settlement window (alternative to HL 15 min withdrawal budget) — cross-venue margin routing | **V2.0** | ⏳ PoC Spec |

整合錨點見 [§2.5 戰略藍籌生態與結算路線圖](#25-戰略-blue-chip-生態與結算路線圖v10-core--v15--v20)。

### 5.2 活躍費用路徑（v1.0）

| 項目 | 定義 | 狀態 |
|------|------------|--------|
| **Builder UI Fee** | **+10 bps** `uiFeeReceiver` on every unsigned GMX v2 increase / decrease / deposit payload (`GMX_UI_FEE_BPS`) | ✅ Code-Verified |
| **Referral Rebate** | Up to **25%** of GMX trading fees via registered `referralCode` (`GMX_REFERRAL_CODE_BYTES32`) | ✅ Code-Verified |

### 5.3 Dynamic Target Range（8.2% ~ 11.8%）— 數學 APY 分解

配置者面向 HUD 帶 — **非保證**; derived from exogenous Delta-Neutral cash flows with **zero native token emissions**. Full narrative: [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md` §2.6.2](./03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK_ZH.md#262-dynamic-target-range-82--118--mathematical-cash-flow-breakdown-82--118--mathematical-cash-flow-breakdown).

| 收益來源腿 | 保守帶（下限 8.2%） | 牛/波動帶（上限 11.8%） | 支付方與機制 |
| :--- | :--- | :--- | :--- |
| **GMX v2 ETH/USDC GM Base** | **4.5%** | **6.5%** | GMX trader swap, borrow & closing fees |
| **Skew Rebate & Builder Fee** | **1.0%** (+10 bps UI fee included) | **1.8%** | Positive skew price-impact rebate + `uiFeeReceiver` (+10 bps · `GMX_UI_FEE_BPS`) |
| **Hyperliquid 1× Short Funding** | **3.2%** | **4.2%** | Counterparty long-side funding payment on HL orderbook |
| **Friction & Rebalance Costs** | **−0.5%** (`FRICTION_BUFFER_APY`) | **−0.7%** | Absorbed by Citadel Safety Buffer (basis & slippage) |
| **Net Strategy APY Range** | **8.2%** | **11.8%** | **Exogenous Delta-Neutral Cash Flow (Zero Token Emissions)** |

> **Evaluator 防禦敘事：** Unlike speculative emission vaults, SliverVine Citadel Shield's **8.2% ~ 11.8%** target range is mathematically grounded in real GMX trading fees, skew rebates, and Hyperliquid short funding rates, guarded by our **0.5% Hurdle Gate** (`FRICTION_BUFFER_APY = 0.005` in `rebalance-rules.ts`).

### 5.4 Hurdle-Rate Probe（非產品身份）

> Arbitrum 上 Aave v3 USDC APY 是 **hurdle-rate probe** used when GMX markets wire is unavailable. *(Hurdle-rate probe only — not a yield-stacking product track)*. It does **not** redefine the AI Agent Citadel roadmap (V1.5 = agentic security / [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) swarms).

| Item | Definition |
|------|------------|
| **Benchmark** | **Aave v3 USDC (Arbitrum) — APY Benchmark** *(Hurdle-rate probe only — not a yield-stacking product track)*; not a live execution adapter |
| **Performance Fee** | **10% of Excess Yield Above Aave Benchmark Rate** *(Hurdle-rate probe only — not a yield-stacking product track)* |
| **Excess Yield** | `max(0, Net Strategy APY − Aave Benchmark APY)` after friction buffer |
| **Status** | **Optional accounting probe** — not accrued on current v1.0 builder UI-fee path (+10 bps `uiFeeReceiver` + 25% referral rebate); **not** the V1.5 Citadel swarm roadmap |

B2B Option B（slippage-savings fee）仍為獨立 commercial SKU and is not the optional hurdle-rate probe above. V2.0 CaaS monetization is the **10 bps protocol authorization fee** on pre-execution risk checks.

### 5.5 公開審計介面

`GET /api/grant-audit` — guard states、TVL、`provenanceVerified`、`sepoliaDualLegProof`。無簽名材料或專有 encode 路徑。

---

## 6. ERC-7579 預執行 Hook 對齊 — AI Agent 反射架構

> **設計論點：** ERC-7579 modular smart accounts provide **permission scope**; SliverVine Protocol provides **reflex speed**. Together they form the pre-execution hook stack that AI agents and institutional vaults require to avoid MEV/LVR traps without surrendering custody.

### 6.1 雙平面 Hook Stack

| 平面 | 元件 | 延遲 | 功能 |
|-------|-----------|---------|----------|
| **① Validator (ERC-7579)** | ZeroDev Kernel v3 modular session module | **&lt;1 ms** | Scoped `ORDER_EXECUTE` · whitelisted target/selector · R06 notional cap · R07 daily clip · R14 re-auth |
| **② Reflex Hook (Wasm + Stylus)** | Edge `checkSoilResistance()` ∥ `SliverVineSoilCoprocessor` | **p50 ~106 µs** Edge · on-chain coprocessor reinforcement | Soil fuse · cross-spread · oracle-lag · depth fail-closed **before** UserOp reaches bundler |

```text
AI Agent Intent (seconds)
 │
 ▼
┌───────────────────────────────────────────────────────────┐
│ ERC-7579 Validator (ZeroDev Kernel v3) │
│ · Session key scope · clip · TTL · callData whitelist │
└─────────────────────────┬─────────────────────────────────┘
 │ UserOp draft passes structural auth
 ▼
┌───────────────────────────────────────────────────────────┐
│ SliverVine Citadel Shield Pre-Execution Reflex Hook (106µs Cerebellum) │
│ Edge: verifyAgentIntent() → evaluateSoilCore() │
│ → checkSoilResistance() [pkg/soil_core.wasm] │
│ On-chain: SliverVineSoilCoprocessor.evaluate_soil_…() │
│ [contracts/stylus-probe/src/lib.rs] │
└─────────────────────────┬─────────────────────────────────┘
 │ AllowedToSign = true
 ▼
 Paymaster → Bundler → EntryPoint → GMX / HL
```

### 6.2 ZeroDev Kernel v3 Validator 模組（支柱一）

| Hook 點 | ERC-7579 模組角色 | SliverVine Citadel Shield 不變量 |
|------------|---------------------|----------------|
| **`validateUserOp`** | Session module verifies scoped signature + callData shape | Whitelisted GMX ExchangeRouter · HL adapter selectors only |
| **`isValidSignature` (ERC-1271)** | Kernel returns `0x1626ba7e` on scoped intent digest | Dual plane: Kernel ERC-1271 ∥ Gate ECDSA m-of-n attestation |
| **Session TTL** | Module-enforced expiry | `DEFAULT_TTL_MS` · heartbeat · deadman switch (`agent-citadel-guard`) |
| **Notional cap (R07)** | `SESSION_KEY_NOTIONAL_CAP_USD` = **$5,000** | Physical severance on breach — no partial fill escape |

**Code 錨點：** `src/adapters/arbitrum/zerodev-aa/` · `src/core/agent-citadel-guard.ts` · `src/sdk/agent-intent.ts` · §2.4.2 Kernel v3 / v4 Session Keys.

### 6.3 Stylus Wasm Soil Hook（支柱三強化）

| 屬性 | Edge Wasm（`pkg/soil_core.wasm`） | Stylus Coprocessor（`contracts/stylus-probe/src/lib.rs`） |
|----------|----------------------------------|----------------------------------------------------------|
| **Entry** | `evaluateSoilCore()` via `@slivervine/citadel-sdk` | `evaluate_soil_coprocessor(spread_bps, depth_usd, slippage_bps)` |
| **Math** | TS fallback + Wasm hot path | u128 fixed-point score · quadratic spread/slippage penalty |
| **Fail-closed** | `depthUsd < minDepthUsd` → trip | `depth_usd < 10_000` → `(false, u64::MAX)` |
| **Status** | ✅ v1.0 Delivered (Sepolia verified) · p50 ~106 µs | ✅ **Code-Verified Coprocessor** · `cargo test` **9/9 PASS（50bps 對齊）** · on-chain deploy **pending** |

**對齊規則：** Edge 仍為 **pre-broadcast SSOT** (fastest path). Stylus coprocessor provides **on-chain auditable parity** for grant diligence and future ERC-7579 executor-module co-location on ArbOS — never a weaker substitute for Edge fail-closed gates.

### 6.4 AllowedToSign Predicate（反射合約）

SDK、Worker 與 grant-audit 遙測共享的生產決策公式：

```text
allowedToSign =
 injectionOk ∧ digestOk ∧ soilOk ∧ sessionOk ∧ gasOk
 ∧ deadmanOk ∧ armorOk ∧ attOk ∧ wasmOk
```

| Gate | 模組 | ERC-7579 / Hook 角色 |
|------|--------|---------------------|
| `sessionOk` | `session-key-gates.ts` | ERC-7579 module clip enforcement |
| `soilOk` | `checkSoilResistance()` · Wasm · Stylus | **Pre-execution reflex hook** |
| `attOk` | `SliverVineGate.sol` | Consume-once EIP-712 attestation |
| `deadmanOk` | `agent-citadel-guard.ts` | Cross-venue slippage severance |

### 6.5 AI Agent 整合介面

> *"These framework adapters provide modular integration specifications for pre-execution risk checks via `@slivervine/citadel-sdk` and REST APIs. In v1.0, active fee-capture and liquidity routing are strictly bound to Arbitrum One GMX v2 GM + HL delta-neutral execution; multi-platform agent fee routing is targeted for V2.0 CaaS monetization."*

| 消費者 | 整合 | 反射 hook |
|----------|-------------|-------------|
| **Third-party dApps** | `@slivervine/citadel-sdk` · `verifyAgentIntent()` · `withCitadelShield` | Apache-2.0 · sub-ms soil gate |
| **ElizaOS** | ✅ V1.0 Live Native Integration — [`elizaos-citadel-plugin.ts`](../../src/adapters/elizaos/elizaos-citadel-plugin.ts) · [§0.3](#03-agent-ecosystem-adapters-v10-live--native-integrations) | `evaluateElizaCitadelAction()` · `checkSoilResistance()` |
| **Virtuals GAME** | ✅ V1.0 Live Native Integration — [`virtuals-game-adapter.ts`](../../src/adapters/virtuals/virtuals-game-adapter.ts) · [§0.3](#03-agent-ecosystem-adapters-v10-live--native-integrations) | `evaluateVirtualsGameTask()` · `checkSoilResistance()` |
| **LangChain** | ✅ V1.0 Live Native Integration — [`langchain-citadel-tool.ts`](../../src/adapters/langchain/langchain-citadel-tool.ts) · [§0.3](#03-agent-ecosystem-adapters-v10-live--native-integrations) | `CitadelRiskGuardTool` · `checkSoilResistance()` |
| **Wayfinder** | ✅ V1.0 Live Native Integration — [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) · [§0.3](#03-agent-ecosystem-adapters-v10-live--native-integrations) | `wayfinderCitadelShieldHook` · `verifyAgentIntent()` |
| **Stabilizer** | ✅ V1.0 Live Native Integration — [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · [§0.4](#04-stabilizer-sepolia--universal-testnet-sandbox--cross-pass-layer-v10-live) | `evaluateStabilizerSwapGuard()` |
| **CrewAI / AutoGen (enterprise)** | ⏳ V1.5 Ecosystem Roadmap / Modular Integration Spec — `SlivervineCrewAIGuardTool` · AutoGen `citadel_soil_guard` · [`crewai-autogen-adapter.py`](../../examples/adapters/crewai-autogen-adapter.py) · [§0.3](#03-agent-ecosystem-adapters-v15-roadmap) | `checkSoilResistance()` · Pillar 2 AML escort boundary |
| **Institutional vaults** | ZeroDev Kernel + Citadel Worker BUSL payload path | ERC-7579 session + 106µs Shield |
| **Grant audit / Dune / PEV** | `GET /api/grant-audit` · **PEV (Prevented Exploit Volume)** · [Dune dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · production DuneSQL feed + chart ([`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md)) | Pillar 2 ingress · Pillar 3 intercepts · 10 bps builder revenue |

**遷移安全：** Kernel v3 → v4 adapter swap (Gatehouse only) — **Shield, Wasm, Stylus coprocessor, and EIP-712 Gate require zero rewrite** (§2.4.2 migration rule).

### 6.6 架構權衡：亞毫秒 AI Agent 拒絕證明 vs. EIP-712

> **Sub-ms M2M Rejection Standard** — machine-to-machine agent swarm paths use deterministic session proofs; EIP-712 ECDSA is reserved for human-initiated chain settlement.

| 維度 | EIP-712 ECDSA（結算平面） | HMAC-SHA256 Session Proof（M2M 反射平面） |
|-----------|----------------------------------|-----------------------------------------------|
| **Latency budget** | **1.2 ms – 3.5 ms** per sign (secp256k1 + wallet IPC) | **&lt; 12 µs** (`agent-citadel-guard` Edge budget) |
| **Use case** | `SliverVineGate.verifyAndConsume()` · human wallet · on-chain attestation anchor | AI trading swarms · sub-ms reject proofs · Agent Memory audit trail |
| **Non-repudiation** | On-chain verifiable ECDSA · consume-once digest | Cryptographically verifiable session proof bound to Citadel session entropy |
| **DoS vector** | High-frequency agent reject storms stall on signing latency | **~200× latency reduction** vs ECDSA — swarm-safe fail-closed |

**核心論點：** EIP-712 ECDSA signing 引入 **1.2 ms – 3.5 ms** latency overhead, creating a **Denial-of-Service vector** for sub-millisecond AI trading swarms that must reject toxic intents faster than mempool races.

**SliverVine 解法：** `agent-citadel-guard` (`src/core/agent-citadel-guard.ts`) utilizes **deterministic HMAC-SHA256 Session Proofs** (&lt; **12 µs** execution budget) for M2M rejection, achieving **~200× latency reduction** while maintaining cryptographically verifiable non-repudiation on the Edge audit plane.

**正式分割：**

| 平面 | 標準 | SSOT 模組 |
|-------|----------|-------------|
| **M2M Reflex (reject / deadman)** | Sub-ms M2M Rejection Standard — HMAC-SHA256 session proof | `evaluateAgentCitadelGuard()` · `guardAgentUserOp()` |
| **Human / On-chain settlement** | EIP-712 `SliverVineCitadel` v1 · m-of-n Gate attestation | `SliverVineGate.sol` · `evaluateAttestation()` (SDK) |

**G11 UI fingerprint：** Demo HUD badge `GateDomainFingerprintBadge` calls `verifyGateDomainSeparator()` (`src/services/gate-domain-fingerprint.ts`) to compare on-chain `domainSeparator()` against local EIP-712 recompute — detecting hijacked frontends that point at a forged Gate contract.

**License SSOT（G8）：** First-party contracts (`SliverVineGate`, `GatedExecutor`, `SliverVineAgentPolicyGuard`, `SliverVineRiskOracle`, `IngressSafetySwitch`, Stylus coprocessor) = **BUSL-1.1** · `@slivervine/citadel-sdk` = **Apache-2.0**.

### 6.7 架構基準：SliverVine 高效能創新 vs. 傳統 Web3 標準

> **審計範圍：** `src/` · `contracts/` · `SliverVineGate/` — proprietary designs that intentionally depart from conventional ERC/EIP patterns to achieve sub-millisecond HFT reflexes and AI-agent swarm protection.
> **SSOT modules:** `agent-citadel-guard.ts` · `session-key-gates.ts` · `src/services/root-protection-lib/circuit-breaker-sever.ts` · `soil_core.wasm` / `SliverVineSoilCoprocessor`.

| 維度 | 傳統 Web3 標準（ERC/EIP） | SliverVine 工程標準 | 延遲 / Gas 改善 | 架構原因 |
|-----------|-------------------------------|--------------------------------|---------------------------|----------------------|
| **AI Agent Rejection Proof** | [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed-data ECDSA (secp256k1 + wallet IPC) | **Sub-ms M2M Rejection Standard** — `agent-citadel-guard` deterministic **HMAC-SHA256 Session Proof** (`evaluateAgentCitadelGuard()` · `guardAgentUserOp()`) | **~200×** — **&lt; 12 µs** vs **1.2 – 3.5 ms** (ECDSA) | High-frequency agent reject storms must not block on signing latency; EIP-712 reserved for human / on-chain settlement (`SliverVineGate.verifyAndConsume`) |
| **Session Authorization Gate** | [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) UserOp → Bundler → EntryPoint validation (network RTT + mempool queue) | **SystemState single-flight** — `assertSessionKeyExecutionGates()` · `assertSigningChannelOpen()` (`session-key-gates.ts` · `hl/auth/signing-gate.ts`) | **~10³–10⁴×** — in-process **&lt; 1 ms** vs **50 – 500 ms+** bundler round-trip | Structural session scope (R06/R07 clip) enforced **before** HL signature leaves Edge; bundler only delivers already-shielded intents |
| **Circuit Breaker / Kill Switch** | OpenZeppelin `Pausable` · on-chain `pause()` (≥ **1 block** · Arbitrum ~250 ms · mainnet ~12 s) | **Edge physical sever** — `severCircuitBreakerPipeline()` R17/R20 (`src/services/root-protection-lib/circuit-breaker-sever.ts`) · `severSigningChannel()` · EIP-712 pipe severed in-process | **~10⁵×** — **&lt; 1 ms** Edge sever vs **≥ 250 ms** on-chain pause | Toxic-fill window closes **before** mempool exposure; `SliverVineGate.halt()` is settlement-plane backup, not hot-path reflex |
| **Risk Oracle Flush** | `Ownable` / `Pausable` admin toggle (mutable · governance delay) | **Irreversible flush** — `SliverVineRiskOracle.applySignedReport(STATUS_SHUTDOWN)` → `isSystemFlushed = true` (one-way poison pill) | Same block on trigger; **zero** post-flush un-pause path | Compliance ingress (`IngressSafetySwitch`) fail-closed without independent admin surface |
| **Soil / Slippage Compute** | EVM Solidity storage reads + oracle `SLOAD` loops (gas-heavy · block-bound) | **Wasm hot path** `pkg/soil_core.wasm` (`#![no_std]`) + **Stylus coprocessor** `evaluate_soil_coprocessor()` (stateless u128 fixed-point) | **~10²×** latency — Edge **p50 ~106 µs** · Wasm warm **&lt; 60 µs** vs multi-ms EVM path; Stylus **stateless** (no storage reads) | Pre-broadcast math must run at HFT reflex speed; on-chain coprocessor = auditable parity, not hot-path substitute |
| **Gate Attestation Model** | Replayable signatures · mutable proxy upgrades | **Consume-once EIP-712** — `consumed[digest]` burned before external call (`SliverVineGate` · `GatedExecutor`) · immutable gate (no proxy) | `verifyAndConsume` **~25.8k – 28k gas** · attestation TTL **≤ 30 s** | One ALLOW cannot be redirected to arbitrary calldata; asymmetric authority (halt immediate · unhalt timelocked) |
| **AA Bundler Compliance** | Blind UserOp retry on bundler rejection | **[EIP-7562](https://eips.ethereum.org/EIPS/eip-7562) Zero-Bundler-Rejection Invariant** — `evaluateStaticBreakerMatrix()` pre-screen (`zerodev-aa-static-breaker.ts`) | Eliminates wasted bundler RTT on toxic UserOps | Soil trip **denies sponsorship + broadcast** serially — no "paid but should-be-blocked" UserOps |
| **RPC / Scraper Defense** | Public RPC endpoint lists · no decoy layer | **Honeypot trap hosts** — `evaluateRpcDefenseGate()` · **99% synthetic slippage** (`rpc-fetch-gate-eval.ts`) | Unauthenticated scrapers fail-closed at **&lt; 1 ms** (no real venue RTT) | Anti-copycat: forked frontends hitting trap hosts receive decoy telemetry, not production state |
| **Frontend Trust Anchor** | Client-trusted `verifyingContract` string | **G11 domain fingerprint** — `verifyGateDomainSeparator()` on-chain `domainSeparator()` vs local EIP-712 recompute | One RPC `eth_call` · HUD badge `GateDomainFingerprintBadge` | Detects hijacked frontends pointing at forged Gate contracts |
| **Pre-Execution vs Post-Execution** | Gauntlet / Chaos Labs parameter dashboards (minutes → days) | **Interceptor Moat** — `checkSoilResistance()` inline before broadcast | **p50 ~106 µs** vs minutes–days governance loop | MEV / LVR damage is prevented, not rebalanced after fill |

**Code 锚點（審計軌跡）：**

| 支柱 | 避免的傳統模式 | SliverVine SSOT |
|--------|------------------------|-----------------|
| AI Security | EIP-712 on every reject | `src/core/agent-citadel-guard.ts` |
| Session Gate | ERC-4337 bundler as first gate | `src/services/session-key-adapter-lib/session-key-gates.ts` · `src/adapters/hl/auth/signing-gate.ts` |
| Circuit Breaker | On-chain `Pausable` | `src/services/root-protection-lib/circuit-breaker-sever.ts` · `src/services/risk-control-lib/root-protection.ts` |
| Compute Parity | EVM storage-heavy soil math | `pkg/soil_core.wasm` · `contracts/stylus-probe/src/lib.rs` · `src/services/risk-control-lib/soil-resistance.ts` |

### 6.8 競爭定位 — 四維 ASCII 矩陣（SliverVine Protocol）

**實體：** SilverVine Labs · **協議品牌：** SliverVine Citadel Shield
**[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196):** Emerging Draft (Virtuals Protocol) — not a finalized standard.

面向 Evaluator 的 SliverVine Protocol 與 legacy execution、agent-wallet、cross-venue stacks 對照 versus legacy execution, agent-wallet, and cross-venue stacks. Complements the §6.7 tabular benchmark.

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
│ 1. Policy Gate Layer      │ ERC-8196 (Emerging Draft Sub-ms Policy Gate)│ On-chain Voting / Delay    │ API Proxy (Centralized)    │
│ 2. Prompt Injection Guard │ R20 Physical Deadlock       │ Vulnerable to Signed Intent│ Bypassable via Jailbreak   │
│ 3. Key Pipe Severing      │ <1ms `severSigningChannel`  │ N/A (Requires On-chain Tx) │ N/A (No On-chain Hook)     │
│ 4. Standard Alignment     │ ERC-8196 (Emerging Draft Sub-ms Policy Gate) · EIP-7562 │ Standard ERC-20 / ERC-721  │ Proprietary REST APIs      │
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

### 6.9 策略 Blue-Chip 生態與結算整合（V1.0 Core + V1.5 / V2.0）

> **商業邊界：** v1.0 費用捕捉與流動性路由綁定 **GMX v2 GM + HL delta-neutral** 執行。**Pendle Institutional Shield** 與 **Stabilizer Sepolia Cross-Pass Sandbox** 為 **v1.0 Live** 預執行防火牆。Camelot 與 Variational 擴展結算平面 — 見 [§2.5](#25-戰略-blue-chip-生態與結算路線圖v10-core--v15--v20) 與 [§5.1.1](#511-strategic-settlement-extensions-v10-core--v15--v20)。

| 場所 | 整合介面 | 反射 hook | 時間範圍 |
|-------|-------------------|-------------|---------|
| **Pendle Finance** | PT/YT registry + sync oracle + cross-guard · soil-wired | `checkSoilResistance()` · `pendleOracle` / `pendleCrossGuard` · `PENDLE_ORACLE_STALE` · `evaluatePendleGmxCrossGuard()` · maturity &lt;7d + jitter &gt;200 bps fail-closed | **V1.0** |
| **Camelot DEX** | Arbitrum-native `GRAIL` liquidity depth for rebalance routing | Soil fuse on Camelot pool depth · RPC allowlist `api.camelot.exchange` | **V1.5** |
| **Stabilizer** | Sepolia universal sandbox · zero-slippage stablecoin cross-pass routing | `evaluateStabilizerSwapGuard()` · identical `checkSoilResistance()` gate as Mainnet | **V1.0** | ✅ Live · Sepolia `421614` |
| **Variational** | Next-gen decentralized perps · cross-venue margin routing (HL complement) | `checkSoilResistance()` on Variational orderbook depth · session-key clip (R06/R07) | **V2.0** |

---

## 關聯文檔

| 文檔 | 用途 |
|----------|---------|
| [`docs/README.md`](../README.md) | Audience router |
| [`docs/ARB_Buildathon/SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) | Buildathon submission SSOT |
| [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water) | Public repository |
| [`docs/grants/`](../grants/) | Public grant submissions (GMX · Arbitrum) |
| [`02_STANDARD_COMPLIANCE_AND_EIP_WIKI_ZH.md`](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI_ZH.md)（中文）· [`02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md)（英文 SSOT） | ERC/EIP standards wiki · compliance posture · ArbOS/Stylus · RPC/WSS |
| [`CITADEL_SDK_BLUEPRINT.md`](../sdk/CITADEL_SDK_BLUEPRINT.md) | Apache-2.0 SDK API |
| [`../audit/`](../audit/) | Principal audit · Robinhood Chain safety gate |
| [`../../docker/README.md`](../../docker/README.md) | Sidecar |
| [`../grants/arbitrum/ARBITRUM_ONE_PAGER.md`](../grants/arbitrum/ARBITRUM_ONE_PAGER.md) | Grant one-pager |
| `src/services/risk/liquidation-meter.ts` | `DEFAULT_CROSS_MMR = 0.05` |
| `src/services/session-key-adapter-lib/nonce-auto-healing.ts` | HL nonce auto-resync |
| `src/services/execution/twap-engine-v2.ts` | TWAP path planner |

---

## 附錄：真實世界威脅模型與市場格局

### 市場採用指標（Agentic Web 轉變）

Web3 攻擊面正從 human UI phishing 轉向 **autonomous agent execution pipelines**。 產業遙測顯示 agentic web 已在鏈上具實質規模：

| 指標 | 估計 | 來源 |
|--------|----------|--------|
| **AI agents deployed** | **17,000+** autonomous on-chain agents | [Dune — ERC-8004: Trustless Agent Activity](https://dune.com/dune/erc-8004-onchain-ai-agents) · [ERC-8004 (EIP)](https://eips.ethereum.org/EIPS/eip-8004) · [Dune AI Agents hub](https://dune.com/agents) |
| **Share of on-chain transactions** | **~19%** agent-attributed activity | [Dune AI Agents](https://dune.com/agents) · [ERC-8004 cross-chain registrations](https://dune.com/queries/6705945) · agent-attribution telemetry (industry estimate) |
| **Daily Active Wallets (DAW) touchpoints** | **~4.5M** wallets interacting with agent frameworks | [Dune AI Agents](https://dune.com/agents) · on-chain wallet–agent interaction dashboards (industry estimate) |

> **遙測備註：** 數字為威脅建模用的**產業級估算** — 非經審計的 SliverVine 協議 KPI。Agent 身份與註冊增長的主要鏈上 SSOT 為 [Dune](https://dune.com/dune/erc-8004-onchain-ai-agents) 上的 [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) 遙測。另見 [CryptoRank Symposium — agent-security focus](https://cryptorank.io/news/feed/fae5e-ai-agents-web3-hacking-wyoming-symposium)。

**意涵：** 安全必須從事後 dashboard 與 mutable pause 函數演進為**微秒級 Pre-Broadcast Intent Firewall** — 於 Sequencer 佇列、Bundler 入站或 MEV mempool **之前**切斷 toxic calldata。Citadel Shield 以 **p50 ~106µs** Edge Wasm 評估（[§3.5 Wasm Soil Core](#35-wasm-soil-core-m4)）針對此缺口 — 覆蓋建模鏈上風險面 **88%**（見 [Risk Framework §0.1](./03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK_ZH.md#01-slivervine-citadel-shield-保證什麼--以及不保證什麼)）；殘餘 **12%** 系統尾部以 Fail-Closed 姿態披露。

### 真實世界案例研究（為何 Citadel Shield 不可或缺）

| # | 案例 | 損失 / 影響 | Citadel 對齊 | 來源 |
|---|------|---------------|-------------------|--------|
| **1** | **[Jaredfromsubway.eth $7.5M Exploit (MEV Honeypot Trap)](https://www.blockaid.io/blog/the-predator-becomes-the-prey-how-a-counter-mev-honeypot-drained-75m-from-jaredfromsubway)** | Automated signature logic exploited via malicious permission / honeypot traps | Validates **sub-ms Wasm pre-broadcast** `checkSoilResistance()` + honeypot RPC defense (`evaluateRpcDefenseGate()`) | [Blockaid incident analysis](https://www.blockaid.io/blog/the-predator-becomes-the-prey-how-a-counter-mev-honeypot-drained-75m-from-jaredfromsubway) · [Chainalysis](https://www.chainalysis.com/blog/sandwich-attack-jaredfromsubway-hack/) · [CertiK](https://www.certik.com/blog/jaredfromsubway-mev-bot-incident-analysis) · [The Defiant](https://thedefiant.io/news/hacks/jaredfromsubway-eth-mev-bot-drained-7-5-million-counter-mev-honeypot) |
| **2** | **[Virtuals Protocol / BasisOS ~$531k Unbound Agent Drain](https://finance.yahoo.com/news/ai-agent-virtuals-protocol-stole-114617216.html)** | Unbound agent execution exceeded safe notional envelopes | Validates **R06/R07** · **`SESSION_KEY_NOTIONAL_CAP_USD = $5,000`** ([§3.6](#36-financial-risk-parameters--epoch-operations)) | [KuCoin — Virtuals compensation disclosure](https://www.kucoin.com/news/flash/virtuals-protocol-to-cover-full-compensation-for-basis-security-incident) · [Yahoo Finance](https://finance.yahoo.com/news/ai-agent-virtuals-protocol-stole-114617216.html) |
| **3** | **[ElizaOS / ai16z Fraud & Governance Collapse](https://www.burwick.law/active-cases/ai16z-elizaos-token-lawsuit-doe-v-walters)** | SDNY class-action litigation — raw Node.js prompt wrappers lacked on-chain execution guarantees | Validates **bytecode predicate assertions** ([§0.1](#01-bytecode-predicate-verification-v10--erc-7715--post-grant-design-spec)) · EIP-712 Gate · **LLM back-off cooldown** | [Burwick Law — Doe v. Walters (SDNY)](https://www.burwick.law/active-cases/ai16z-elizaos-token-lawsuit-doe-v-walters) · [CoinDesk](https://www.coindesk.com/markets/2026/08/05/ai-agent-token-once-worth-usd2-4-billion-ends-with-founder-calling-it-dead) · [Decrypt](https://decrypt.co/374958/eliza-ai-token-dead-shuts-down-foundation-lawsuit) |

### 競爭格局矩陣

| 維度 | **SliverVine V1.0（88% 基線）** | **Wayfinder** | **Virtuals Protocol** | **ElizaOS Framework** | **ZeroDev / Biconomy（ERC-4337 AA）** |
|-----------|-----------------------------------|---------------|-------------------------|----------------------|--------------------------------------|
| **Pre-broadcast severance** | ✅ Sub-ms Wasm soil fuse · 0-Gas fail-closed | ⚠️ Intent routing; **no** sub-ms Wasm severance | ❌ Web2.5 layer; wallets without pre-execution bounds | ❌ No native pre-broadcast gates | ❌ Session keys; **no** AI-context fuse |
| **On-chain immutability** | ✅ 0-proxy Gate · `consumed[digest]` | Varies | Consumer UX focus | Open-source plugins | Strong AA infra |
| **AI behavioral safety** | ✅ 60s LLM cooldown · ±2–5 bps jitter | Limited | Limited | Prompt-only guardrails | N/A |
| **Session blast-radius** | ✅ $5k cap · scoped `ORDER_EXECUTE` | Varies | **Unbound drain risk** | Framework-dependent | ✅ ERC-4337 scopes |
| **Prompt injection immunity** | ✅ Bytecode predicates | Partial | Partial | **Vulnerable** at hook | **Vulnerable** to injected UserOps |

> 另見 [§0 競爭矩陣 — Pre-Execution vs. Post-Execution Risk](#️-competitive-matrix--pre-execution-vs-post-execution-risk) · [88% Defense Mesh](../ARB_Buildathon/SUBMISSION.md#88-defense-mesh--12-post-grant-rd-roadmap) in [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) · [Risk Spectrum §0.1](./03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) (formal **88% / 12%** + **80/20 Pareto** definition).

### 補充產業參考

- **MEV & thin-liquidity** — `checkSoilResistance()` · `evaluateHlOrderbookGapGuard()`
- **$441k+ bot execution error** — [PumpParade / Medium](https://pumpparade.medium.com/ai-trading-bots-lost-441k-in-one-error-heres-what-actually-works-and-what-doesn-t-4f04f890c189)
- **AI antivirus primitives** — [CertiK AI Skill Scanner](https://www.tradingview.com/news/chainwire:d064d7d1f094b:0-certik-launches-ai-skill-scanner-an-antivirus-software-for-the-ai-age/)
- **Institutional agent-security focus** — [CryptoRank Symposium](https://cryptorank.io/news/feed/fae5e-ai-agents-web3-hacking-wyoming-symposium)
