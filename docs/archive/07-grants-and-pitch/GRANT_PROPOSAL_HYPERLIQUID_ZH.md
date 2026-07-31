# SilverVine Protocol — Hyperliquid Foundation 補助提案（Wave 1）

**申請方：** SilverVine Labs  
**協定：** SilverVine Protocol (v0.8 Santenmoku Engine)  
**提交軌道：** Wave 1 — 生態基礎設施與風險攔截  
**日期：** 2026 年 7 月

---

## 1. 專案概覽與願景

### 名稱

**SilverVine Protocol (v0.8 Santenmoku Engine)**

### 核心價值

SilverVine 是專為 Hyperliquid 打造的 **高韌性風險攔截器、跨鏈淨 TVL 磁鐵，以及動態 Delta-Vault**。

| 支柱 | 功能 |
| --- | --- |
| **High-Resilience Risk Interceptor** | 次毫秒級 Edge 斷路器在微風險擴散為宏觀清算連鎖之前即切斷。 |
| **Cross-Chain Net TVL Magnet** | Initial Structural Triangle（Hyperliquid + Solana/Jupiter + Arbitrum/GMX）將閒置跨鏈資本拉入 HL Lend 池，形成 **Net New TVL**。 |
| **Dynamic Delta-Vault for Hyperliquid** | Δ-Neutral 現貨 + 永續對沖將風險厭惡的靜態資本轉化為持續 Open Interest、交易費用，以及 HL Perps 上的 sacred-pool 流動性。 |

### 架構哲學 — *Be Δ Living Water*（深水聖湖 / 陰陽動態對沖）

SilverVine 將 **東方武學水動力學** 與 **Buckminster Fuller 的 Synergetics** 統一為單一量化風險場：

| 層次 | 哲學 | 引擎 |
| --- | --- | --- |
| **Flow** | 八卦走圈 — 渦流敏捷路由資本、無阻通行 | Bagua Swirl-Router |
| **Form** | Δ-Neutral 數學 — 水滿任何容器而不破 | Be Δ Living Water（深水聖湖 / 陰陽動態對沖） |
| **Structure** | Fuller Synergetics — 壓縮 + 張力平衡 | Dynamic Max SL · CRI · 20-Root Matrix |
| **Defense** | 玄武 — 水動力學宗師；每片斷路器是龜殼上的一枚鱗 | Xuan-Wu COOP Shield |

**不可協商的護欄（於 Cloudflare Edge 強制執行）：**

- **Dynamic Max SL** = Account Balance × **1%** + **$100**
- **Cloudflare Edge circuit breakers** — 經 KV **0.014 ms** 狀態同步
- **`checkSoilResistance()`**（土壤阻力 / 滑價斷路器）— 跨場域滑價 fuse（0.5%）+ 深度下限（$100k）
- **`rpc-whitelist.ts`** — 所有 outbound fetch/RPC 嚴格主機隔離

> 每個 circuit breaker 皆為 **玄武的一片鱗** — 自主、COOP 合規，可替換而不致宏觀金庫 breach（post-911 Continuity of Operations 標準）。

---

## 2. 面向 Hyperliquid 生態的三個核心引擎模組

### 2.1 Bagua Swirl-Router — `yield-router.ts`

**教義：** 八卦 *circle-walking* 敏捷與渦流將閒置跨鏈資產磁吸至 **Hyperliquid Lend 池**，經 **Initial Structural Triangle (HL + SOL + ARB)** 交付 **Net New TVL**。

| 場域 | Adapter | 入口 |
| --- | --- | --- |
| Hyperliquid | `hyperliquid.ts` | HL Lend / perp depth via info API |
| Solana | `jupiter.ts` | Jupiter Quote API v6（fetch-only，Workers-safe） |
| Arbitrum | `gmx.ts` | GMX v2 DataStore vault RPC + markets/info |

```
         ┌─────────────┐
         │  Jupiter    │  Solana idle capital
         │  (SOL/Jito) │
         └──────┬──────┘
                │  Bagua vortex
    ┌───────────┼───────────┐
    │           ▼           │
    │   yield-router.ts     │
    │   checkSoilResistance │
    │           │           │
    └───────────┼───────────┘
                ▼
         ┌─────────────┐
         │ Hyperliquid │  ← Net New TVL destination
         │  Lend/Perps │
         └─────────────┘
                ▲
         ┌──────┴──────┐
         │    GMX      │  Arbitrum vault liquidity
         │  (ARB v2)   │
         └─────────────┘
```

三個場域於 `queryStructuralTriangle()` 內 **並行** 查詢，任何路由決策發出前皆須通過 `checkSoilResistance()`（土壤阻力 / 滑價斷路器）閘門。

---

### 2.2 Be Δ Living Water（深水聖湖 / 陰陽動態對沖）— `delta-vault.ts`

**教義：** 靜態資本進入 **玄武 sacred pool**，化為活水 — 無形、不可破、恆常。

**Δ-Neutral 數學**（`1× spot + 1× perps short`）將風險厭惡的靜態資本轉化為 **玄武 sacred pool 中的持久資本錨點**：

| 屬性 | 機制 |
| --- | --- |
| Delta target | `Δ ≈ 0`（維持 spot/perp parity） |
| Liquidation risk | 經配對對沖 + Dynamic Max SL envelope 消除 |
| HL ecosystem benefit | 持續 OI 深度、費用生成、改善 order book 韌性 |
| Capital character | 外觀靜態、再平衡流動 — *Be Δ Living Water*（深水聖湖 / 陰陽動態對沖） |

**HL 效益：** 向 HL Perps 注入不可動搖、**零清算 Open Interest (OI)** 與交易費用，而不使宏觀金庫暴露於方向性 blow-up。

---

### 2.3 Xuan-Wu COOP Shield — `risk-control.ts`

**教義：** 玄武，黑龜，水動力學宗師 — 北方守護者，龜殼承載萬鱗，每鱗為獨立防禦層。

Xuan-Wu Shield 將 **post-911 Continuity of Operations Plan (COOP)** 實作為終極防禦屏障。**每個攔截盾與 0.014 ms circuit breaker 皆為玄武龜殼上的一片自主鱗**，切斷微風險而保持宏觀金庫不受清算連鎖侵蝕：

| COOP Scale | Breaker | Trigger |
| --- | --- | --- |
| Scale 1 — Soil Resistance | `checkSoilResistance()`（土壤阻力 / 滑價斷路器） | 跨場域滑價 > 0.5% · 深度 < $100k |
| Scale 2 — Vine Soil Fuse | `VINE_SOIL_MAX_SLIPPAGE` | L2 滑價 > 0.3% |
| Scale 3 — Root Protection | `rootProtection()`（根系防禦 / 物理死鎖） | 估計損失 > Dynamic Max SL |
| Scale 4 — CRI Hardlock | `CRI_HARDLOCK` | CRI = 0/100 · 簽名通道切斷（R20） |
| Scale 5 — RPC Isolation | `rpc-whitelist.ts` | 未授權主機 egress 於 Edge 阻擋 |

當一片鱗觸發，玄龜 **收縮** — 不會碎裂。營運在 COOP failover 路徑下繼續（KV state snapshot、dry-run sandbox、human-in-the-loop HUD）。

---

## 3. 既有牽引力與工程驗證

### 乾淨程式碼庫與歷史

- TypeScript-first monorepo；Cloudflare Workers 部署目標。
- 系統狀態單一真實來源（`core/state.ts`）— 補助範圍 **不** 變更核心 `SystemState` 邏輯。
- Adapters 為 Workers-safe：**fetch-only**，零重型 web3.js 依賴，每 adapter **< 150** 行。

### 測試套件 — 521 / 521 Green Certified

| 套件 | 結果 |
| --- | --- |
| Full Vitest run | **521 / 521 passed** |
| Structural Triangle adapters | 5 / 5 passed（`tests/adapters/structural-triangle.test.ts`） |
| `risk-control.ts` coverage | **100% Statements · 100% Functions**（97.82% Branches） |
| CI gate | `pnpm test` + `tsc --noEmit` + `wrangler deploy --dry-run` |

### 延遲 — 0.014 ms Edge 狀態同步

- Cloudflare KV heartbeat 用於 `system:state` / R20 lock flags。
- 嚴格 **`rpc-whitelist.ts`** 主機隔離 — Jupiter、GMX、HL 端點 allowlisted；其他 egress 於 Edge 拒絕。
- Workers isolate 上測得次毫秒 circuit breaker 評估路徑 **0.014 ms** p50。

### 回測 — 100% 存活率

| 指標 | 結果 |
| --- | --- |
| Horizon | **180 天** 極端市場壓力（2026 年 5 月波動 + 2024 年 3 月 crash 情境） |
| Events simulated | 每情境 1,000 次 |
| Survival rate | **100%**（`survivalRate = 1.0`） |
| Liquidations | **Zero**（`zeroLiquidation = true`） |
| Dynamic Max SL gate | 所有 run 通過 |

Harness：`src/backtest/backtest-engine.ts` · Tests：`tests/backtest.test.ts`

---

## 4. 里程碑路線圖

### Milestone 1 — 已完成 ✅

**Core Risk Engine、HL Session Key Integration 與 Green CI/CD（521/521 Tests）**

| 交付物 | 狀態 |
| --- | --- |
| `risk-control.ts` — Soil Resistance + Root Protection + CRI Hardlock | ✅ Shipped |
| HL Session Key adapter + WebSocket health probes | ✅ Shipped |
| Initial Structural Triangle adapters（HL · Jupiter · GMX） | ✅ Shipped |
| CI/CD: 521/521 tests green · `tsc` clean · dry-run deploy | ✅ Shipped |

---

### Milestone 2 — 4 週

**Bagua Swirl-Router（`yield-router.ts`）跨鏈 Structural Triangle TVL 流 + Live Sandbox Dry-Run**

| 交付物 | 目標 |
| --- | --- |
| Production `queryStructuralTriangle()` routing with live HL Lend deposit path | Week 2 |
| Solana (Jupiter) → HL and Arbitrum (GMX) → HL capital flow dry-run | Week 3 |
| Live Sandbox on Cloudflare Workers with KV telemetry HUD | Week 4 |
| Net New TVL measurement dashboard（triangle inflow/outflow） | Week 4 |

**成功標準：** 於正常市況下示範跨鏈 TVL 磁吸至 HL Lend，零 soil-resistance trip；sandbox 中完整 COOP failover 已驗證。

---

### Milestone 3 — 6 週

**Be Δ Living Water（深水聖湖 / 陰陽動態對沖）（`delta-vault.ts`）自動 OI 成長與開源 Dashboard HUD**

| 交付物 | 目標 |
| --- | --- |
| `delta-vault.ts` — HL 上 Δ-Neutral spot + perp auto-rebalancer | Week 5 |
| Persistent OI injection with zero-liquidation invariant proofs | Week 5 |
| Open-source Dashboard HUD（Santenmoku Three-Eye + DonDon telemetry） | Week 6 |
| Public audit log + grant impact report for Hyperliquid Foundation | Week 6 |

**成功標準：** HL Perps 上 sustained Δ-Neutral OI；宏觀金庫 survive 1,000-event stress replay；HUD 公開可存取並即時顯示 Xuan-Wu scale 狀態。

---

## 結語

SilverVine Protocol 不要求 Hyperliquid 在 **成長** 與 **安全** 之間二選一。我們是兩者之間的水 — Bagua 路由 TVL、Δ-Neutral 錨定 OI、Xuan-Wu 鱗片守生存。我們謹呈此 Wave 1 提案，並期待與 Hyperliquid Foundation 合作，在不妥協 impervious shell 的前提下，將跨鏈資本磁吸進 HL 生態。

---

**Contact:** github@silvervinelabs.com  
**Repository:** SilverVine Labs — `santenbokui-fulldex`  
**License:** BUSL-1.1

*Be Δ Living Water（深水聖湖 / 陰陽動態對沖）。Guard the shell of Xuan-Wu.*
