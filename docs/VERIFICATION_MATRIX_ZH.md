> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[VERIFICATION_MATRIX.md](./VERIFICATION_MATRIX.md)

# SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) — 驗證矩陣（Buildathon / 補助評審）

**正式名稱：** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)
> **Pitch SSOT：** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) 是面向 Arbitrum 上 AI Agent 的 Sub-ms 0-Gas 預廣播安全堡壘與風險導航器。
**實體：** SilverVine Labs · **聯絡：** `grants@silvervinelabs.com`
**線上：** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · `GET /api/grant-audit`
**儲存庫：** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)

> **Vitest SSOT：** **192 test files | 836 PASS Clean (100% PASS)**（`pnpm test -- --run`）。Forge **60/60** · Cargo Stylus **9/9 (50bps)** · Property Fuzz **327,675**（`pnpm audit:nightly` / `FOUNDRY_PROFILE=deep`；標準 `forge test` = **5,120** = 5×1,024）· ZeroDev AA **Opt-In Pillar 1 · Dry-Run Harness Verified**（Kernel v3 / EntryPoint v0.7 · `USE_ZERODEV_AA` 預設關閉）。

**版面：** **快速入口 → 內部三大支柱（核心）→ 外部三大支柱（延伸）**。請先開啟本文件 — 各區域皆可透過 CLI 重現，**除非另有說明，否則零主網簽名依賴**。

### 絕對 SSOT 鎖定（評審複製貼上）

| 欄位 | 鎖定值 | 驗證 |
|-------|--------------|--------|
| **官方 H1** | SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)：面向 Arbitrum 上 AI Agent 的 Sub-ms 0-Gas 預廣播安全堡壘與風險導航器 | [`README.md`](../README.md) · [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) |
| **Vitest 基線** | **192 test files \| 836 PASS Clean (100% PASS)** | `pnpm test -- --run` |
| **已驗證 commit** | `main` @ **`1acbc24`** · Worker bundle **69.32 KiB gzip**（`pass: true`） | `git rev-parse HEAD` · `pnpm bundle:measure` |
| **自動 R20 斷開** | `applyAutoSeveranceOnFlags()` — bitmask 觸發時自動呼叫 `severSigningChannel()` | [`risk-severance.ts`](../src/core/risk-severance.ts) · [`tests/core/risk-severance.test.ts`](../tests/core/risk-severance.test.ts) |
| **Variational RFQ 核心 bitmask** | `evaluateVariationalFlags()` — **Bit 12** `FLAG_VARIATIONAL_STALE_QUOTE` · **Bit 13** `FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED` · 兩者皆綁定至 `FLAGS_AUTO_SEVER_MASK` | [`risk-engine-core.ts`](../src/core/risk-engine-core.ts) · [`risk-flags.ts`](../src/core/risk-flags.ts) · [`variational-rfq-adapter.ts`](../src/adapters/variational-rfq-adapter.ts) |
| **滑動視窗 pending OI** | 30s GMX skew/notional 累加器 — 分割 payload 防禦 | [`pending-exposure-window.ts`](../src/core/pending-exposure-window.ts) |
| **Stylus 雙重執行** | `check_soil_resistance_stylus(flags, risk_vector)` · `pnpm build:stylus` · **9/9 (50bps)** | [`stylus_core.rs`](../contracts/stylus-probe/src/stylus_core.rs) · EIP-1967 proxy 路徑見 [EIP Wiki](./architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md) |
| **Wayfinder 原生 adapter** | `wayfinderCitadelShieldHook` — soil fuse + 8 維 intent gate | [`wayfinder-shield.ts`](../src/adapters/wayfinder/wayfinder-shield.ts) · `pnpm demo:wayfinder` |
| **Quad-Agent 框架** | 全球首個面向 Wayfinder · ElizaOS · Virtuals · LangChain 的預執行風險閘道 | [`quad-agent-demo.ts`](../examples/quad-agent-demo.ts) · `pnpm demo:quad` |
| **ElizaOS plugin** | `evaluateElizaCitadelAction()` — Action handler soil fuse | [`elizaos-citadel-plugin.ts`](../src/adapters/elizaos/elizaos-citadel-plugin.ts) · `pnpm demo:elizaos` |
| **Virtuals GAME adapter** | `evaluateVirtualsGameTask()` — GAME Worker 預廣播守衛 | [`virtuals-game-adapter.ts`](../src/adapters/virtuals/virtuals-game-adapter.ts) · `pnpm demo:virtuals` |
| **LangChain Citadel tool** | `CitadelRiskGuardTool` — StructuredTool + LangGraph state-node guard | [`langchain-citadel-tool.ts`](../src/adapters/langchain/langchain-citadel-tool.ts) · `pnpm demo:langchain` |
| **Stabilizer Sepolia adapter** | **421614** 上的通用跨 DEX 測試網沙盒 — 1:1 容量 · de-peg severance · cross-pass routing | `evaluateStabilizerSwapGuard()` · 15% reserve ratio · USDZ >50bps peg guard · 60s LLM cooldown | [`stabilizer-adapter.ts`](../src/adapters/stabilizer/stabilizer-adapter.ts) · `pnpm demo:stabilizer` |
| **Sepolia Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | [Arbiscan Sepolia](https://sepolia.arbiscan.io/address/0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1) |
| **Arbitrum One Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | [Arbiscan One](https://arbiscan.io/address/0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1) |
| **Mainnet Ignition Tx** | `0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6` | [Arbiscan Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Agent SDK decorator** | `withCitadelShield` — 零接觸預廣播包裝器 | [`src/sdk/decorator.ts`](../src/sdk/decorator.ts) · [`examples/agent-interceptor-demo.ts`](../examples/agent-interceptor-demo.ts) |
| **核心 DEX demos（Tier 1）** | GMX v2 · Hyperliquid · Pendle · Uniswap V3 · Aave V3 · Morpho Blue 獨立 CLI | [`gmx-demo.ts`](../examples/gmx-demo.ts) · [`hyperliquid-demo.ts`](../examples/hyperliquid-demo.ts) · [`pendle-demo.ts`](../examples/pendle-demo.ts) · [`uniswap-demo.ts`](../examples/uniswap-demo.ts) · [`aave-demo.ts`](../examples/aave-demo.ts) · [`morpho-demo.ts`](../examples/morpho-demo.ts) · `pnpm demo:{gmx,hl,pendle,uniswap,aave,morpho}` |
| **Uniswap V3 adapter** | `evaluateUniswapV3SwapGuard()` — CL tick depth · directional dynamic fee · soil fuse | [`uniswap-v3-adapter.ts`](../src/adapters/uniswap/uniswap-v3-adapter.ts) · `pnpm demo:uniswap` |
| **Aave V3 adapter** | `evaluateAaveV3Guard()` — HF &lt; 1.15 fail-closed · cross-chain liquidation boundary | [`aave-v3-adapter.ts`](../src/adapters/aave/aave-v3-adapter.ts) · `pnpm demo:aave` |
| **Hyperliquid L1 session guard** | `evaluateHyperliquidSessionGuard()` — Independent L1 HF Orderbook AppChain · MaxSizePerOrder · rate limit (120/min) · spread > **20 bps** | [`hyperliquid-session-guard.ts`](../src/adapters/hl/hyperliquid-session-guard.ts) · `pnpm demo:hl` |
| **Variational Omni RFQ adapter** | `validateVariationalRFQIntent()` → `evaluateVariationalFlags()` — quote stale **>500ms** 或 oracle drift **>30 bps** · OLP depth utilization **>15%**（long-tail）· 核心 bitmask 中 **Bits 12–13** · `FLAGS_AUTO_SEVER_MASK` | [`variational-rfq-adapter.ts`](../src/adapters/variational-rfq-adapter.ts) · [`risk-engine-core.ts`](../src/core/risk-engine-core.ts) · `pnpm demo:matrix -- --loop=perp --hedge=variational` |
| **GMX v2 pool invariants** | `verifyGmxPoolImbalance()` · `verifyGmxCollateralReserve()` — imbalance > **0.35** · reserve < **105%** | [`gmx-v2-invariants.ts`](../src/adapters/gmx/gmx-v2-invariants.ts) · `pnpm demo:gmx` |
| **Dune dashboard** | [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) | 公開 URL |
| **DuneSQL（Sepolia ingest）** | 於 Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` 上已驗證事件串流（`IntentAttested` · `RiskTripBlocked`）· **PEV** `SUM(blocked_intent_notional_usd)` 運作中 | [`DUNE_DASHBOARD_SPECIFICATION.md`](./telemetry/DUNE_DASHBOARD_SPECIFICATION.md) |
| **DuneSQL（Arbitrum One prod）** | Queries 0–0b feed + chart；Queries 1–3 reconciliation — 生產 SQL 目標 **ChainID `42161`** | 同規格 |
| **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196)** | Emerging Draft（Virtuals Protocol）— **尚未定稿** | [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) |

> **備註：** 初始主網部署使用 Bootstrap Ignition Keys（`0x1111…`/`0x2222…`）以供公開驗證，不暴露生產 HSM 金鑰。金鑰旋轉至生產多簽透過原生治理函式執行。

**核心不變量：** $\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0$ · $\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}$ · $t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s}$ — [Technical Specification §3.1](../architecture/01_TECHNICAL_SPECIFICATION.md#31-microsecond-moats)。

**主要執行邊界：** 完整 Arbitrum 原生多協議覆蓋（GMX v2、Pendle、Uniswap V3、Aave V3、Morpho Blue、**Variational Omni RFQ**）+ 跨鏈高頻訂單簿防禦（Hyperliquid L1 Session Key Adapter）+ 可選 Arbitrum 原生 RFQ OLP hedging。

### 量身打造之數學不變量（全部七個協議）

| 協議 | 場所 | 物理邊界 | Adapter |
|----------|-------|-------------------|---------|
| **GMX v2** | Arbitrum One | \|OI_long − OI_short\| / PoolTVL > **0.35** · Collateral Reserve < **105%** | `gmx-v2-invariants.ts` |
| **Pendle** | Arbitrum One | \|Yield_current − Yield_oracle\| > **150 bps** | `pendle-pool-factory-adapter.ts` |
| **Uniswap V3** | Arbitrum One | Active tick depth · slippage/penalty > **0.50%**（**50 bps**） | `uniswap-v3-adapter.ts` |
| **Aave V3** | Arbitrum One | Health Factor HF < **1.15** | `aave-v3-adapter.ts` |
| **Morpho Blue** | Arbitrum One | Single-block NAV deviation > **0.30%**（**30 bps**） | `morpho-blue-adapter.ts` |
| **Hyperliquid** | Independent L1 HF Orderbook AppChain | MaxSizePerOrder · Rate Limit (120/min) · Spread > **20 bps** | `hyperliquid-session-guard.ts` |
| **Variational** | Arbitrum One (Omni RFQ) | Quote stale **>500ms** 或 oracle drift **>30 bps** · OLP depth utilization **>15%**（long-tail）· **Bit 12** stale quote · **Bit 13** OLP depth · `FLAGS_AUTO_SEVER_MASK` | `evaluateVariationalFlags()` · `variational-rfq-adapter.ts` |

> **OpSec：** 內部模擬報告僅位於 `docs/internal/` — 不從公開補助套件連結。公開文件中不含私鑰。

---

## Zone A — 30 秒快速驗證（快速通道）

### 三層 Demo 套件（CLI SSOT）

| 層級 | 指令 | 範圍 |
|------|----------|-------|
| **Tier 1 — 原生協議** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:uniswap` · `pnpm demo:aave` · `pnpm demo:morpho` · `pnpm demo:matrix` | GMX · HL · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · **7 協議跨場所矩陣** |
| **Tier 2 — Agent 框架** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:quad` | Wayfinder · ElizaOS · Virtuals · LangChain · 四框架合併 |
| **Tier 3 — 沙盒與 E2E** | `pnpm demo:stabilizer` · `pnpm demo:e2e` | Sepolia Stabilizer · 5 步宏觀生命週期 |
| **Vitest 矩陣** | `pnpm demo` | 12 個 Tri-Pillar ANSI 情境（`tests/demo/`） |

所有獨立 CLI 透過 `process.hrtime.bigint()` 測量延遲（µs 精度）。

### 路徑 1：即時 Monorepo（建議 — 約 3 秒）

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (192 files / 836 tests)
```

| 指令 | 證明 | 預期 |
|---------|--------|----------|
| `pnpm demo` | Tri-Pillar 微 E2E 矩陣（`tests/demo/`） | **12/12 PASS** · ANSI 輸出 |
| `pnpm demo:gmx` | GMX v2 shadow margin · cross-venue slippage · position cap | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:hl` | Hyperliquid session key auth · WS depth guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:pendle` | Pendle PT/YT sentinel · guarded pool factory | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:uniswap` | Uniswap V3 concentrated liquidity · dynamic fee guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:aave` | Aave V3 HF & cross-chain liquidation guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:morpho` | Morpho Blue vault share-price & sandwich guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:matrix` | 完整 7 協議跨場所矩陣（`--loop=all`） | **7/7 ALLOW** 正常 · **7/7 FAIL_CLOSED** trip |
| `pnpm demo:matrix -- --loop=perp` | Delta-neutral perp stack（Pendle → GMX → HL + Variational） | **3/3 + Soil** |
| `pnpm demo:matrix -- --loop=perp --hedge=variational` | Variational Omni RFQ hedge leg · stale quote trip | `ALLOW` / `--trip` **FAIL_CLOSED**（`VARIATIONAL_STALE_QUOTE_BREACH`） |
| `pnpm demo:matrix -- --loop=perp --hedge=hyperliquid` | 僅 Hyperliquid L1 hedge leg | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:matrix -- --loop=perp --hedge=both` | 雙 perp hedge（HL + Variational，預設） | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:matrix -- --loop=spot` | Spot & lending vault loop（Uniswap V3 → Aave V3 → Morpho Blue） | **3/3 + Soil** |
| `pnpm demo:matrix -- --healthy-only` | 僅正常 pre-flight（無 R20 sever） | **ALLOW** |
| `pnpm demo:matrix -- --trip --gmx` | GMX pool imbalance (>0.35) trip 變體 | **FAIL_CLOSED** |
| `pnpm demo:e2e` | 5 步 Citadel ANSI HUD dry-run | `RESULT: E2E OK (5/5)` |
| `pnpm demo:wayfinder` | Arbitrum `42161` 上 Wayfinder 路由攔截 | `ALLOW` · pre-broadcast clearance |
| `pnpm demo:elizaos` | ElizaOS Action handler 預廣播守衛 | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:virtuals` | Virtuals GAME worker task guard | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:langchain` | LangChain CitadelRiskGuardTool invoke | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:wayfinder -- --trip` | 0-Gas Fail-Closed soil trip | `FAIL_CLOSED` · 0-Gas intercept |
| `pnpm demo:wayfinder -- --stabilizer` | Sepolia Stabilizer 1:1 stablecoin swap（Wayfinder harness） | `ALLOW` · zero-slippage clearance |
| `pnpm demo:wayfinder -- --stabilizer --trip` | Stabilizer reserve / capacity breach（Wayfinder harness） | `FAIL_CLOSED` · `SOIL_RESISTANCE_TRIP` |
| `pnpm demo:stabilizer` | 獨立 Stabilizer Sepolia 1:1 swap guard | `ALLOW` · zero-slippage clearance |
| `pnpm demo:stabilizer -- --trip` | USDZ de-peg + reserve depletion + 60s cooldown | `FAIL_CLOSED` · 重試時 `MANDATORY_COOLDOWN_ACTIVE` |
| `pnpm demo:quad` | 全部四個 AI agent 框架（Wayfinder · ElizaOS · Virtuals · LangChain） | **4/4 ALLOW** |
| `pnpm demo:quad -- --trip` | 四框架 toxic soil / hallucination trip | **4/4 FAIL_CLOSED** |
| `pnpm test` | 完整 Vitest regression bar | **192 test files \| 836 PASS Clean (100% PASS)** |

**`demo:e2e` 預期終端機重點**（GitHub `diff` 語法）：

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

### 路徑 2：隔離 Docker（零主機 Node/pnpm）

```bash
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
```

| 指令 | 證明 | 預期 |
|---------|--------|----------|
| 預設 `docker run` | 容器內 5 步 Citadel **`demo:e2e`** | `[tier0] demo:e2e PASS` |
| `docker run --rm slivervine-citadel pnpm test` | 完整 Vitest regression（無主機依賴） | **192 test files \| 836 PASS Clean (100% PASS)** |

**為何選 Docker 路徑：** 消除評審筆電 Node 版本漂移、pnpm store 損壞與缺少 WSL 依賴 — 相同 PASS 標準，密閉容器。

---

## Zone A.1 — 雙 Demo 架構（Tri-Pillar 展示）

Cloudflare Edge **SaaS gateway** 定位：sub-ms **零 I/O 同步** `checkSoilResistance()` 熱路徑（**p50 ~106µs**）— 與 AA bundler 延遲無關。

### (a) 微秒級風險閘道 Demo 矩陣 — `pnpm demo`

```bash
pnpm demo
# or: npx vitest run tests/demo/
```

**12 個 ANSI 可讀 Vitest 情境**，涵蓋 GMX v2 · Hyperliquid · Pendle（`tests/demo/*.demo.test.ts`）：

| Demo 檔案 | 情境 | 已證明之風險面 |
|-----------|-----------|----------------------|
| [`gmx-v2-agent-flow.demo.test.ts`](../tests/demo/gmx-v2-agent-flow.demo.test.ts) | 4 | Healthy MarketIncrease · toxic price-impact soil trip · Chainlink Data Streams oracle-lag reject + `reduceOnly` delever rescue · 1,000× payload validation benchmark |
| [`hyperliquid-agent-flow.demo.test.ts`](../tests/demo/hyperliquid-agent-flow.demo.test.ts) | 4 | Valid `ApproveAgent` EIP-712 · WS stale / latency >200ms soil trip · expired session key / GateLockout · 1,000× session-key validation benchmark |
| [`pendle-ai-agent-flow.demo.test.ts`](../tests/demo/pendle-ai-agent-flow.demo.test.ts) | 4 | AI guarded pool PASS · 450bps yield-drift MEV reject · 60s TTL stale oracle · 1,000× `validateAIPoolSelection()` benchmark |

| 指令 | 證明 | 預期 |
|---------|--------|----------|
| `pnpm demo` | Tri-Pillar 微 E2E 矩陣 | **12/12 PASS** · 彩色 ANSI 終端輸出 |

### (b) 宏觀生命週期 E2E 套件 — `pnpm demo:e2e`

```bash
pnpm demo:e2e
```

| 指令 | 證明 | 預期 |
|---------|--------|----------|
| `pnpm demo:e2e` | 5 步跨場所 agent hedge & circuit breaker | `RESULT: E2E OK (5/5)` |

步驟：Intent + Deadman → Robinhood escort → GMX underweight rebalance → HL session hedge → R20 panic flash unwind。

---

## Zone B — 內部三大支柱（核心協議不變量）

### Pillar 1 — Gatehouse（Opt-In Account Abstraction & Scoped Auth）

**指令：** `pnpm test:zerodev`

**定義：** `vitest run tests/adapters/zerodev-aa-dryrun-harness.test.ts`

| 斷言 | 狀態 |
|-----------|--------|
| Kernel v3 / EntryPoint **v0.7** UserOp **draft** 路徑 | ✅ Dry-run harness verified |
| Session scope + Risk Oracle Gate fail-closed | ✅ Offline / mock bundler |
| Mainnet UserOp broadcast | ⚠️ **未聲稱**（`USE_ZERODEV_AA` 預設關閉） |

**敘述：** ZeroDev Kernel v3 是 **Opt-In Pillar 1 Account Abstraction Layer** — 範圍 30s session keys 與 Paymaster gas sponsorship（$0.50/op · $10/day）。**Pillar 3 Wasm Soil Core**（`pkg/soil_core.wasm` · p50 ~106 µs）與 **Pillar 2 Arbitrum Native Ingress** **100% 獨立**於 ZeroDev 運作。`zerodev-aa-gate.ts` 在啟用 AA 時提供 pre-bundler UserOp 驗證。

**v1.0 AA 範圍：** 階段 ① Sign-in · ③ Gas · ④ Authorize · ⑤ Execute（Sepolia 已驗證）。階段 ② Smart Routing = Reference Harness。階段 ⑥⑦ = Post-Grant Roadmap。

**閱讀順序：**

```text
zerodev-aa-gate.test.ts → assertCitadelRiskGate() + evaluateZeroDevGasGuards()
zerodev-aa-gate.ts → evaluateStaticBreakerMatrix() + Citadel risk gate
 ├─ zerodev-aa-failover.ts → Arbitrum One health / AA probe route
 ├─ zerodev-aa-static-breaker.ts → soil + gas sponsorship limits
 └─ zerodev-aa-userop.ts → Paymaster + bundler dispatch (after gate PASS)
```

---

### Pillar 2 — Compliance Ingress Firewall（Escort Accounting & AML）

**指令：**

```bash
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
```

| 指標 | 預期 |
|--------|----------|
| 測試案例 | **5/5 PASS** |
| Escort 不變量 | `lostUsd ≡ 0` |
| AML 隔離 | `AML_INBOUND_TO_ROBINHOOD_BLOCKED` — 僅單向 42161→46630 outbound |

**敘述：** Robinhood Chain（`46630`/`4663`）Across ingress 是 **Pillar 2 Reference Escort Adapter** — 非產品身份。Inbound AML block 在資本抵達 Arbitrum 可部署 NAV 前強制 fail-closed 單向隔離。

相關：[`audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md)

---

### Pillar 3 — SliverVine Citadel Shield（Pre-Consensus Wasm Risk Engine）

| 指令 | 證明 | 預期 |
|---------|--------|----------|
| `cd SliverVineGate && forge test` | 鏈上 Gate · 預設 property fuzz | **60/60 Passed** · **5,120 fuzz**（5×1,024） |
| `pnpm audit:nightly` | Deep fuzz gate（`FOUNDRY_PROFILE=deep`） | **327,675** executions |
| `pnpm audit:fast` / `pnpm audit:security` | TSC · Vitest security · Solhint · Gitleaks · Slither · Aderyn | Fast PASS · Security **5/0/0 PASS** |

**預設 forge 指令：**

```bash
cd SliverVineGate && forge test --gas-report && cd ..
```

**Deep fuzz 指令：**

```bash
pnpm audit:nightly
# or: cd SliverVineGate && FOUNDRY_PROFILE=deep forge test --match-path 'test/*.fuzz.t.sol' && cd ..
```

| 指標 | 預設 `forge test` | Deep profile（`FOUNDRY_PROFILE=deep` / `pnpm audit:nightly`） |
|--------|----------------------|----------------------------------------------------------------|
| 單元測試 | **60 Passed · 0 Failed** | **60 Passed · 0 Failed** |
| Property fuzzing | **5 × 1,024 = 5,120** executions | **5 × 65,535 = 327,675** executions |
| Invariants | **3 × 16,384** stateful calls · 0 counterexamples | same |
| 核心 | `SliverVineGate.sol` consume-once attestation · gas-bounded `verifyAndConsume` | same |

**形式驗證 — 原生 Foundry Invariant Tests**

| 不變量 | 測試錨點 | 驗證 |
|-----------|-------------|--------|
| Replay denial (I6) | `test_I6_Replay_Denies` | `cd SliverVineGate && forge test --match-test test_I6_Replay_Denies` |
| No double-spend | `invariant_NoDoubleSpend` | `cd SliverVineGate && forge test --match-path test/SliverVineGate.invariant.t.sol` |
| 完整 Gate 套件 | 60 unit + fuzz + invariant tests | `cd SliverVineGate && forge test` |

**R03 / R04 — RPC & Execution-Lag Telemetry（Provenance）**

| ID | Guard | Fail-closed budget | Code SSOT |
|----|-------|-------------------|-----------|
| **R04** | PGATE Latency / WS jitter | **200ms** | `PGATE_MAX_LATENCY_MS` · `src/adapters/hl/websocket/websocket-health.ts` |
| **R03** | HL L2 book stale / RPC probe | **500ms** | `HL_L2_STALE_THRESHOLD_MS` · `src/services/exchanges/hl-l2-book-lib/hl-l2-book-types.ts` |

相關：[`audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) · [`audit/05_PRINCIPAL_AUDIT_REPORT.md`](./audit/05_PRINCIPAL_AUDIT_REPORT.md)

#### Pendle Institutional Shield（V1.0 Live · Core Pillar 3）

在既有 Shield **p50 ~106µs** 預算內的 Zero-I/O sync oracle + fail-closed soil wiring。

```bash
pnpm demo   # 12 Tri-Pillar ANSI scenarios (recommended first)
pnpm exec vitest run tests/adapters/pendle-market-oracle.test.ts
pnpm exec vitest run tests/adapters/pendle-pt-registry.test.ts
pnpm exec vitest run tests/risk-control/pendle-soil-guard.test.ts
pnpm exec vitest run tests/guards/pendle-gmx-cross-guard.test.ts tests/adapters/pendle-pt-expiry-guard.test.ts
pnpm exec vitest run tests/demo/pendle-ai-agent-flow.demo.test.ts
```

| 測試檔案 | 證明 | 預期 |
|-----------|--------|----------|
| [`tests/adapters/pendle-market-oracle.test.ts`](../tests/adapters/pendle-market-oracle.test.ts) | Sync oracle `ingest`/`resolve` · **TTL 60s** stale · `PENDLE_ORACLE_STALE` soil trip | **PASS** |
| [`tests/adapters/pendle-pt-registry.test.ts`](../tests/adapters/pendle-pt-registry.test.ts) | `resolve*` · `normalize*` · address index · `hydrateFromOracle` | **PASS** |
| [`tests/risk-control/pendle-soil-guard.test.ts`](../tests/risk-control/pendle-soil-guard.test.ts) | `pendleOracle` + `pendleCrossGuard` → `checkSoilResistance()` | **PASS** |
| [`tests/guards/pendle-gmx-cross-guard.test.ts`](../tests/guards/pendle-gmx-cross-guard.test.ts) | Shadow Margin cross-guard · Observatory Paradox de-leverage | **PASS** |
| [`tests/adapters/pendle-pt-expiry-guard.test.ts`](../tests/adapters/pendle-pt-expiry-guard.test.ts) | PT expiry &lt;7d ∧ jitter &gt;200bps fail-closed · 1,000 fuzz | **PASS** |

**Code SSOT：** [`pendle-market-oracle-adapter.ts`](../src/adapters/pendle/pendle-market-oracle-adapter.ts) · [`pendle-pt-registry.ts`](../src/adapters/pendle/pendle-pt-registry.ts) · [`pendle-gmx-cross-guard.ts`](../src/guards/pendle-gmx-cross-guard.ts) · [`core/pendle-types.ts`](../src/core/pendle-types.ts)

---

## Zone C — 外部三大支柱（生態系與模擬 Harness）

### 1. Wayfinder Native Adapter（V1.0 Live · Arbitrum AI Agent Engine）

**指令：**

```bash
pnpm demo:wayfinder
# or: npx tsx examples/wayfinder-agent-demo.ts
pnpm demo:wayfinder -- --trip   # 0-Gas Fail-Closed soil trip
pnpm exec vitest run tests/adapters/wayfinder-shield.test.ts
```

| 範圍 | 細節 |
|-------|--------|
| Adapter SSOT | [`wayfinder-shield.ts`](../src/adapters/wayfinder/wayfinder-shield.ts) — `wayfinderCitadelShieldHook` |
| 整合 | `checkSoilResistance()`（Pillar 3 soil fuse）+ `verifyAgentIntent()`（8 維驗證） |
| Chain | Arbitrum One（`42161`）— Wayfinder Agent Engine 原生預執行風險防火牆 |

| 測試情境 | 檔案 | 預期 |
|---------------|------|----------|
| 正常 Arbitrum route intent | [`wayfinder-shield.test.ts`](../tests/adapters/wayfinder-shield.test.ts) | `status: ALLOW` · `allowedToSign: true` |
| Toxic soil trip（high slippage / depth） | same | `status: FAIL_CLOSED` · 0-Gas · `reasons` populated |
| Session key clip / expiry violation | same | `status: FAIL_CLOSED` · `allowedToSign: false` |

**AI Agent 執行流程（Wayfinder / Virtuals）：**

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

### 2. Stabilizer Protocol Adapter（V1.0 Live · Universal Sepolia Cross-DEX Testnet Sandbox）

**Citadel 角色：** Arbitrum Sepolia（`421614`）上 AI agent 的 **通用測試網沙盒與 Cross-Pass 互操作層**。跨 Stabilizer（1:1 zero-slippage stablecoin swap）· GMX v2（Sepolia shadow margin）· Pendle（Testnet Guarded Pool Factory）的預執行 **0-Gas Fail-Closed Protection** — 與 Arbitrum One（`42161`）**相同 `checkSoilResistance()` bytecode 與風險閘道**。

**指令：**

```bash
pnpm demo:stabilizer
pnpm demo:stabilizer -- --trip
pnpm demo:wayfinder -- --stabilizer
pnpm exec vitest run tests/adapters/stabilizer-adapter.test.ts
pnpm exec vitest run tests/demo/gmx-v2-agent-flow.demo.test.ts tests/demo/pendle-ai-agent-flow.demo.test.ts
```

| 範圍 | 細節 |
|-------|--------|
| Adapter SSOT | [`stabilizer-adapter.ts`](../src/adapters/stabilizer/stabilizer-adapter.ts) |
| Assets | USDZ / USDC / USDT / USDS — Constant-Sum 1:1 zero-slippage pairs |
| Cross-pass legs | Stabilizer → GMX v2（`gmx-v2-order-payload-guards.ts`）→ Pendle（`pendle-pool-factory-adapter.ts`） |
| 整合 | `verifyStabilizerPoolCapacity()` · `verifyStabilizerPegDrift()` · `verifyZeroSlippageCapacity()` · `checkSoilResistance()` |
| Chain | Arbitrum Sepolia（`421614`） |

#### Stabilizer Sepolia 測試網驗證向量

| 向量 | 不變量 / 面 | 驗證指令 | 預期 |
|--------|---------------------|----------------|----------|
| **1:1 Constant-Sum Capacity Validation** | Swap amount ≤ zero-slippage pool capacity · Constant-Sum 1:1 invariant | `pnpm demo:stabilizer` · `stabilizer-adapter.test.ts`（ALLOW scenario） | `status: ALLOW` · `allowedToSign: true` |
| **USDZ De-peg (>50bps) Severance & 60s LLM Cooldown** | `verifyStabilizerPegDrift()` 於 >50bps USDZ/collateral drift 觸發 · signature channel severed · 重試時 60s mandatory cooldown | `pnpm demo:stabilizer -- --trip` · `stabilizer-adapter.test.ts`（de-peg scenario） | 首次呼叫：`FAIL_CLOSED` · 60s 內重試：`MANDATORY_COOLDOWN_ACTIVE` |
| **Cross-DEX Liquidity Routing（Stabilizer → GMX v2 → Pendle）** | 每跳在廣播前由 `checkSoilResistance()` 閘控 · 相同 Mainnet bytecode 路徑 | `pnpm demo`（Tri-Pillar）· `pnpm demo:stabilizer` + GMX/Pendle demo tests | 每 leg ALLOW 或 FAIL_CLOSED · 無跨 leg bypass |

| 測試情境 | 檔案 | 預期 |
|---------------|------|----------|
| 正常 1:1 swap within zero-slippage capacity | [`stabilizer-adapter.test.ts`](../tests/adapters/stabilizer-adapter.test.ts) | `status: ALLOW` |
| Liquidation / reserve floor depletion | same | `SOIL_RESISTANCE_TRIP` · `FAIL_CLOSED` · 0-Gas |
| USDZ de-peg trigger + 60s cooldown | same | `FAIL_CLOSED` then `MANDATORY_COOLDOWN_ACTIVE` · signature channel severed |

**Cross-Pass 路由圖：**

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

### 3. ElizaOS Citadel Plugin（V1.0 Live）

**指令：**

```bash
pnpm demo:elizaos
pnpm exec vitest run tests/adapters/elizaos-plugin.test.ts
```

| 範圍 | 細節 |
|-------|--------|
| Adapter SSOT | [`elizaos-citadel-plugin.ts`](../src/adapters/elizaos/elizaos-citadel-plugin.ts) — `evaluateElizaCitadelAction()` |
| Demo | `pnpm demo:elizaos` · `--trip` 用於 FAIL_CLOSED |

---

### 4. Virtuals Protocol GAME Adapter（V1.0 Live）

**指令：**

```bash
pnpm demo:virtuals
pnpm exec vitest run tests/adapters/virtuals-adapter.test.ts
```

| 範圍 | 細節 |
|-------|--------|
| Adapter SSOT | [`virtuals-game-adapter.ts`](../src/adapters/virtuals/virtuals-game-adapter.ts) — `evaluateVirtualsGameTask()` |
| 整合 | `verifyAgentIntent()` + `checkSoilResistance()` before GAME Worker dispatch |
| Chain | Arbitrum One（`42161`） |

| 測試情境 | 預期 |
|---------------|----------|
| 正常 GAME worker task | `status: ALLOW` · `allowedToSign: true` |
| Toxic soil trip | `FAIL_CLOSED` · 0-Gas |
| Session key clip breach | `FAIL_CLOSED` · `CLIP_BREACH` |

---

### 5. LangChain / LangGraph CitadelRiskGuardTool（V1.0 Live）

**指令：**

```bash
pnpm demo:langchain
pnpm exec vitest run tests/adapters/langchain-tool.test.ts
```

| 範圍 | 細節 |
|-------|--------|
| Adapter SSOT | [`langchain-citadel-tool.ts`](../src/adapters/langchain/langchain-citadel-tool.ts) — `CitadelRiskGuardTool` |
| 整合 | Parameter hallucination guard · `verifyAgentIntent()` · `checkSoilResistance()` |
| Compat | `@langchain/core/tools` StructuredTool · LangGraph state nodes |

| 測試情境 | 預期 |
|---------------|----------|
| 正常 tool invoke | `status: ALLOW` · `output: SOIL_PASS` |
| Toxic slippage soil trip | `FAIL_CLOSED` |
| Parameter hallucination（NaN / negative depth） | `FAIL_CLOSED` · `PARAMETER_HALLUCINATION` |

---

### 6. 補充 Agent Demos（可選）

**指令：** `tsx examples/agent-interceptor-demo.ts` · [`examples/adapters/`](../../examples/adapters/) 中的 legacy scripts

| 範圍 | 細節 |
|-------|--------|
| Primary SSOT | [`src/adapters/`](../../src/adapters/) 中的 **V1.0 Live Native Integrations** — 使用 `pnpm demo:{wayfinder,elizaos,virtuals,langchain,stabilizer,quad}` |
| Supplementary | [`agent-interceptor-demo.ts`](../../examples/agent-interceptor-demo.ts) · [`examples/adapters/`](../../examples/adapters/)（TS + Python evaluator scripts） |

---

### 7. 量化壓力基準（Survival Benchmark）

**指令：**

```bash
pnpm tsx scripts/generate-survival-report.ts
```

| 參數 | 值 |
|-----------|-------|
| Lookback | 30D HL L2 orderbook stress |
| Degrade events | 42 observed |
| Offline fallback | Resilient 503 / network abort → snapshot replay |
| Output | `docs/0801_BeDelta_Survival_Benchmark.md` |

---

### 8. 生產遙測與 Provenance（可選 / 需網路）

| 面 | 指令 | 預期 |
|---------|---------|----------|
| Sidecar health | [`docker/README.md`](../docker/README.md) | `curl -sS http://localhost:8080/health \| jq .` |
| Live grant audit | 需網路 | `curl -s https://bedeltawater.slivervine.xyz/api/grant-audit \| jq .provenanceVerified` |
| 5-TX testnet proof | `pnpm verify:5tx` / `pnpm verify:grant` | Hyperliquid testnet anchor in `verified_5tx_results.json` |
| Demo pipeline | `pnpm demo` · `pnpm demo:{gmx,hl,pendle,uniswap,aave,morpho}` · `pnpm demo:{wayfinder,elizaos,virtuals,langchain,quad}` · `pnpm demo:{stabilizer,e2e}` | 3-Tier CLI suite · 12-scenario Vitest matrix · 5-step ANSI HUD |

**Sidecar build：**

```bash
docker build -t silvervine-sidecar -f docker/Dockerfile.sidecar .
```

---

## 附錄 — 維護者腳本與 Bundle 檢查

| 腳本 | 用途 | 預期 |
|--------|---------|----------|
| `pnpm bundle:measure` | Worker hot-path size gate | **69.32 KiB gzip** / **276.2 KiB raw** · `limitKiB: 150` · `pass: true` |
| `pnpm verify:negative` | Negative soil-trip proofs | Depth breach fail-closed |
| `pnpm demo` | Tri-Pillar 微 E2E demo 矩陣（`tests/demo/`） | **12/12 PASS** |
| `pnpm demo:gmx` | GMX v2 shadow margin CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:hl` | Hyperliquid session key CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:pendle` | Pendle guarded pool factory CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:uniswap` | Uniswap V3 concentrated liquidity CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:aave` | Aave V3 lending HF CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:morpho` | Morpho Blue vault guard CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:matrix` | Cross-venue 7-protocol circuit breaker CLI（`--loop=all`） | **7/7 ALLOW** / trip **7/7 FAIL_CLOSED** |
| `pnpm demo:matrix -- --loop=perp` | Perp stack loop（Pendle → GMX → HL + Variational） | **4/4 FAIL_CLOSED** trip |
| `pnpm demo:matrix -- --loop=perp --hedge=variational` | Variational RFQ OLP / stale-quote guard | `ALLOW` / `--trip` **FAIL_CLOSED** |
| `pnpm demo:matrix -- --loop=perp --hedge=both` | Dual hedge（HL + Variational，預設） | `ALLOW` / `--trip` FAIL_CLOSED |
| `pnpm demo:matrix -- --loop=spot` | Spot vault loop（Uniswap V3 → Aave V3 → Morpho Blue） | **4/4 FAIL_CLOSED** trip |
| `pnpm demo:e2e` | 5-step macro lifecycle ANSI HUD | `RESULT: E2E OK (5/5)` |
| `pnpm demo:wayfinder` | Wayfinder native route interception | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:elizaos` | ElizaOS Action handler guard | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:virtuals` | Virtuals GAME worker guard | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:langchain` | LangChain CitadelRiskGuardTool | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:stabilizer` | Standalone Stabilizer Sepolia 1:1 swap guard | ALLOW / `--trip` FAIL_CLOSED + cooldown |
| `pnpm demo:quad` | Quad-Agent framework demo（Wayfinder · ElizaOS · Virtuals · LangChain） | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm test` | 完整 Vitest + coverage | **192 test files \| 836 PASS Clean (100% PASS)** |
| `pnpm test:watch` | Interactive Vitest | — |
| `pnpm typecheck` | `tsc --noEmit` | — |
| `pnpm audit:fast` / `audit:security` / `audit:nightly` | 3-tier security matrix | **5/0/0 PASS**（security tier） |
| `pnpm build:wasm` | Rust `soil_core.wasm` | `pkg/soil_core.wasm` |
| `pnpm build` / `deploy` / `dev` | Worker / SPA toolchain | — |

**已從公開腳本表面移除（OpSec）：** live ignition / wallet sweep / spot sell / Sepolia UserOp one-offs — Buildathon diligence 不需要。

---

## 鏈上合約拓撲（`contracts/` vs `SliverVineGate/`）

自動化依賴稽核（2026-08-24）：**無** TS/JS runtime import `contracts/*.sol` 路徑；**無** `SliverVineGate/` 內重複 Solidity 定義。兩個獨立鏈上表面：

| 路徑 | 合約 | 角色 | Forge / TS linkage |
|------|-----------|------|-------------------|
| **`SliverVineGate/`** | `SliverVineGate.sol` · `GatedExecutor.sol` | EIP-712 consume-once attestation gate（Pillar 3） | `cd SliverVineGate && forge test` · **60/60** · 預設 fuzz **5,120** · deep **327,675** via `FOUNDRY_PROFILE=deep` |
| **`contracts/`** | `SliverVineRiskOracle.sol` · `IngressSafetySwitch.sol` | Venue-agnostic ingress compliance oracle + address-level safety switch | **Not** in Forge testbed · ABI mirrored in TS |

**TypeScript interface SSOT（Edge runtime）：**

| Solidity source | TS ABI / adapter | Usage |
|-----------------|------------------|-------|
| `contracts/SliverVineRiskOracle.sol` | `src/services/aa-adapter/risk-oracle.ts` → `SLIVERVINE_RISK_ORACLE_ABI` | `risk-oracle-gate.ts` · viem `readContract` when `SLIVERVINE_RISK_ORACLE_ADDRESS` set |
| `contracts/IngressSafetySwitch.sol` | `risk-oracle.ts` → `INGRESS_SAFETY_SWITCH_ABI` | `risk-oracle-adapter.ts` · `evaluateComplianceAdapter()`（fail-closed logic） |

**結論：** `contracts/` **不可**安全刪除 — 它是 Robinhood ingress 的 canonical Solidity spec；TS adapters 刻意 mirror ABI（Edge 無 Forge artifact import）。

---

## 相關文件

| 文件 | 角色 |
|----------|------|
| [`README.md`](../README.md) | 儲存庫入口 · 快速驗證摘要 |
| [`ARB_Buildathon/SUBMISSION.md`](./ARB_Buildathon/SUBMISSION.md) | Buildathon 主要提交 |
| [`architecture/01_TECHNICAL_SPECIFICATION.md`](./architecture/01_TECHNICAL_SPECIFICATION.md) | Yellow Paper |
| [`architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | 風險光譜 · 模擬 harnesses |
| [`../docker/README.md`](../docker/README.md) | Sidecar testlist |
| [`../JUDGE_BRIEF.md`](../JUDGE_BRIEF.md) | 1 頁評審入口 |

---

*SilverVine Labs · BUSL-1.1 · Verification Matrix · 192 test files | 836 PASS Clean (100% PASS)*
