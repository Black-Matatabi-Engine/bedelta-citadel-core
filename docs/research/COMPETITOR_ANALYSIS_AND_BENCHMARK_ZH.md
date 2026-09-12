# SilverVine Citadel Protocol — 競品分析與 R&D 基準矩陣

| 欄位 | 值 |
|------|-----|
| **分類** | R&D Research · 非生產 SSOT |
| **分支** | `research/competitor-benchmark-and-rd` |
| **基線 HEAD** | `main` @ `2d7426c`（Core Sinking · `DefenseMatrixError` 層級修正 · USD.ai 純函式邊界） |
| **測試 SSOT** | **199 test files \| 868 PASS** · `tsc --noEmit` **0 errors** |
| **Worker Bundle** | **50.83 KiB gzip** · **143.47 KiB raw** · `limitKiB: 150` · `pass: true` |
| **文件版本** | v1.0 · 2026-09-07 |
| **維護者** | SilverVine Labs R&D |

> **範圍聲明：** 本文件僅供內部 R&D 與賽事策略使用。競品能力以公開文件、官方 SDK 與產業基線為準；**不**修改 `main` 核心 invariant 或生產路徑。

---

## 0. 執行摘要

SliverVine Citadel Shield 的定位是 **Pre-Consensus Intent Firewall**（意圖進入 Sequencer / Bundler / Mempool **之前** 的亞毫秒熔斷），而非 Keeper 執行層、AVS 共證層或 Agent 框架本體。

| 維度 | Citadel 差異化 | 主要競品弱點 |
|------|----------------|--------------|
| **延遲 / 反射門** | Edge Wasm **p50 ~106 µs** · 0-Gas 離鏈 severance | Gelato Keeper **2–15 s** RPC 輪詢 + 鏈上執行延遲 |
| **風控模型** | **28-lane** `PROTO_VECT_LEN` bitmask · Soil R01–R20 · Clock SSOT 30s 硬熔斷 | 標準 Stop-Loss / HF Oracle **反應在成交後或下一區塊** |
| **AA 整合** | ZeroDev Kernel **ERC-7579 TYPE(4) Pre-execution Hook** 敘事 + 離鏈 Shield 解耦 | Biconomy / Safe **多簽與事後驗證**，非 sub-ms 意圖熔斷 |
| **AI Agent** | In-repo Native Guard · `evaluateAgentCitadelGuard()` · 四框架 demo CLI | ElizaOS / Virtuals **外掛生態**，無統一 28-lane soil fuse |

**R&D 結論：** Citadel 在 **延遲數量級（10⁴–10⁵×）** 與 **意圖前熔斷語義** 上具結構性優勢；競品在 **鏈上可組合性（AVS）**、**Keeper 網路效應（Gelato）**、**Agent 分發（npm 生態）** 上仍具護城河。本賽季最高邊際分來自 **鏈上證據（GM fill · Dune 42161）**，而非再加深 adapter 數量。

---

## 1. 研究方法與評分尺規

### 1.1 對照組選取

| 競品類別 | 代表產品 | 選取理由 |
|----------|----------|----------|
| **Keeper / Automation** | Gelato Web3 Functions · Automate · dedicated Keeper bots | DeFi 自動化執行基線；與 Citadel「執行前安全」形成正交對照 |
| **Restaking / Coprocessor** | EigenLayer AVS · Othentic / Brevis 類 coprocessor 敘事 | 鏈上可驗證計算趨勢；審計人格常問「為何不用 AVS」 |
| **AA 基礎設施** | Biconomy Smart Accounts · Safe{Wallet} + modules | 機構多簽與模組化 AA 主流路徑 |
| **AI Agent 框架** | ElizaOS · Virtuals GAME | Buildathon 賽道直接競品；評委熟悉度最高 |

### 1.2 評分維度（1–5）

| 分數 | 定義 |
|------|------|
| **5** | 賽道領先 · 有可複現基準或主網證據 |
| **4** | 生產可用 · 文件/SDK 完整 |
| **3** | 可用但延遲/風控/整合有明顯缺口 |
| **2** | PoC 或依賴第三方 |
| **1** | 未覆蓋該維度 |

---

## 2. 維度 A — 延遲與反射門（Latency & Reflex Gate）

### 2.1 技術對照

| 指標 | **SilverVine Citadel** | **Gelato / Keeper Vaults** | **典型 RPC Polling Bot** |
|------|------------------------|----------------------------|---------------------------|
| **決策位置** | Cloudflare Edge · `checkSoilResistance()` | Gelato Executor · 鏈上 `check` + `exec` | 自建 bot · `eth_call` 輪詢 |
| **p50 延遲** | **~106 µs**（TS Gateway + Wasm） | **~2–8 s**（觸發 + 排程 + 執行） | **~2–15 s**（區塊時間 + RPC RTT） |
| **暖啟動 Wasm** | **< 60 µs**（`soil_core.wasm` < 28 KiB） | N/A（無 Wasm 熱路徑） | N/A |
| **熔斷時機** | **Pre-broadcast** · 意圖未進 mempool | **Post-condition** · 條件滿足後執行 | **Post-event** · 價格/時間觸發後 |
| **Gas 成本（熔斷）** | **0-Gas** 離鏈 severance | 每次執行消耗 gas | 每次 tx 消耗 gas |
| **失敗模式** | Fail-closed · `FLAGS_SEVERED` · R20 通道 sever | Revert on-chain · 可能部分執行 | 滑點擴大 · MEV 夾擊窗口 |

### 2.2 數量級示意

```text
Keeper / Gelato path:     [poll 2s]──[detect]──[submit tx]──[block 250ms–2s]──[settle]
Citadel Shield path:      [106µs soil]──► ALLOW / SEVER (no broadcast)

Speed ratio (order of magnitude): 10⁴ – 10⁵× faster decision vs polling keepers
```

### 2.3 R&D 評分

| 產品 | 延遲 | Pre-consensus | 0-Gas sever | **小計** |
|------|------|---------------|-------------|----------|
| **Citadel Shield** | 5 | 5 | 5 | **5.0** |
| Gelato Automate | 2 | 1 | 1 | **1.3** |
| Generic Keeper | 2 | 1 | 1 | **1.3** |
| EigenLayer AVS (鏈上驗證) | 2 | 3 | 2 | **2.3** |

**Citadel 優勢：** 唯一將 **反射弧** 放在 **廣播前** 且具 **sub-ms** 可複現基準的方案。  
**Citadel 劣勢：** 不取代 Keeper **執行**；需與 Gelato/自建 keeper **組合** 敘事（Shield = 前置保險，Keeper = 執行器）。

---

## 3. 維度 B — 風控模型（Risk Model）

### 3.1 架構對照

| 能力 | **Citadel** | **標準 Stop-Loss / HF Oracle** |
|------|-------------|--------------------------------|
| **狀態表示** | `Float64Array(PROTO_VECT_LEN=28)` · protocol bitmask | 單點價格 / HF 標量 |
| **協議覆蓋** | GMX · Pendle · USD.ai · HL · Variational（5-core venues）[^1] | 通常單協議或單指標 |

[^1]: Citadel 產品面 = 5-core venues + EIP-1193 Retail Guard SDK — 非 point-to-point 框架插件。競品景觀可引用 ElizaOS/Virtuals 作市場背景。
| **Defense Matrix** | R01–R20 · `FLAGS_AUTO_SEVER_MASK` · auto severance | 無標準化矩陣 |
| **時鐘 SSOT** | `USDAI_CLOCK_SKEW_MAX_MS = 30_000` · `resolveUsdAiClockSsotPure()` | 依賴鏈上 `block.timestamp` 或 bot 本地時鐘 |
| **滑點 / 深度** | Soil lane · orderbook gap · cross-venue TWAP | 固定 % stop 或清算線 |
| **Core Sinking** | 5 模組 `src/core/*` 純 invariant SSOT | N/A |

### 3.2 Bitmask vs 傳統風控

```text
Traditional:  IF price < stop THEN sell (often AFTER adverse move)
Citadel:      packProtocolLane() → evaluateFlags() → SEVER before sign/broadcast
              Clock skew > 30s → CLOCK_SKEW_EXCEEDED (fail-closed)
```

| 攻擊 / 場景 | Stop-Loss / HF | Citadel Soil |
|-------------|----------------|--------------|
| Oracle 延遲欺騙 | 高風險（lag 窗口） | `USDAI_ORACLE_STALE` · max age 2h |
| 跨協議連鎖 | 通常不建模 | Cross-guard · pending OI 30s window |
| Session key 重放 | 非標準覆蓋 | `verifySessionKeyValidity()` · nonce guard |
| MEV 夾擊（post-broadcast） | 無法阻止 | **僅 pre-broadcast**；ALLOW 後仍可能被夾 |

### 3.3 R&D 評分

| 產品 | 多協議 bitmask | 時鐘 / 反欺騙 | 可測回歸 | **小計** |
|------|----------------|---------------|----------|----------|
| **Citadel** | 5 | 4 | 5（868 PASS） | **4.7** |
| Aave HF liquidator | 2 | 3 | 3 | **2.7** |
| GMX keeper stop | 2 | 2 | 3 | **2.3** |
| EigenLayer AVS risk module | 3 | 3 | 2（鏈上為主） | **2.7** |

**Citadel 優勢：** **28-lane** 向量 + **R01–R20** 為機構敘事最硬資產；Clock SSOT 已下沉 pure core（`2d7426c`）。  
**Citadel 劣勢：** Wasm FFI 仍 **24-slot** 敘事 vs `PROTO_VECT_LEN=28` **部分閉環**；多 Worker `protocolMask` 不共享 **Residual HIGH**。

---

## 4. 維度 C — 帳戶抽象（Account Abstraction）

### 4.1 整合模型對照

| 項目 | **Citadel + ZeroDev Kernel v3** | **Biconomy** | **Safe + Modules** |
|------|----------------------------------|--------------|---------------------|
| **標準** | ERC-4337 · **ERC-7579** TYPE(4) Hook | ERC-4337 · Nexus / MEE | ERC-4337 / 多簽 |
| **Hook 時機** | **Pre-execution**（規格級）· 離鏈 Shield **先於** UserOp | Paymaster + middleware | Module `execTransaction` 前後 |
| **延遲** | Shield **106 µs** 與 AA **解耦** | Bundler 路徑 **秒級** | 多簽收集 **分鐘級** |
| **Session Key** | HL EIP-712 · consume-once nonce | Biconomy session keys | Safe roles module |
| **實作狀態** | Citadel **自有 adapter** · dry-run 為主 | 生產 npm SDK | 生產廣泛部署 |
| **鏈上 Hook 部署** | **未閉環**（規格 + 離鏈 gate） | 依整合而定 | Module 已部署 |

### 4.2 語義差異（關鍵）

```text
Biconomy/Safe:  "Who may sign / pay gas / which contract"
Citadel:        "Should this calldata be signed at all" (sub-ms, pre-broadcast)

Orthogonal layers — Citadel is NOT a replacement AA wallet; it is a Pre-execution Safety Citadel.
```

### 4.3 R&D 評分

| 產品 | ERC-7579 對齊 | Pre-exec 語義 | 生產部署 | **小計** |
|------|---------------|----------------|----------|----------|
| **Citadel + ZeroDev** | 4 | 5 | 2 | **3.7** |
| Biconomy | 3 | 2 | 5 | **3.3** |
| Safe + Modules | 2 | 2 | 5 | **3.0** |

**Citadel 優勢：** 唯一明確將 **ERC-7579 TYPE(4) Pre-execution Hook** 與 **106 µs 離鏈 Shield** 寫入同一敘事棧。  
**Citadel 劣勢：** 非 npm 官方 ZeroDev plugin；鏈上 Hook **未安裝**於 Kernel 模組槽 — 審計人格會扣 **生產部署** 分。

---

## 5. 維度 D — AI Agent 框架整合

### 5.1 整合深度對照

| 能力 | **Citadel Native** | **ElizaOS** | **Virtuals GAME** |
|------|-------------------|-------------|-------------------|
| **整合形態** | In-repo adapter · `evaluateElizaCitadelAction()` | Plugin 生態 · npm 分發 | GAME Worker task guard |
| **策略執行點** | `checkSoilResistance()` **廣播前** | Action handler 內（依插件） | Task evaluation 前 |
| **Policy Guard** | `SliverVineAgentPolicyGuard.sol` · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) | 社群 plugin 品質不一 | GAME SDK 約定 |
| **統一風控** | 28-lane soil · 7 venue matrix | 依 plugin 實作 | 依 integration |
| **CLI 可複現** | `pnpm demo:{elizaos,virtuals,wayfinder,langchain}` | 依社群範例 | 依官方 doc |
| **npm 官方套件** | **未閉環**（V1.1 Open PR Spec） | **已上架** | **已上架** |

### 5.2 框架路徑比較

```text
ElizaOS / Virtuals default path:
  LLM intent (~1–10s) → framework action → [optional guard?] → broadcast

Citadel path:
  LLM intent (~1–10s) → evaluateXxxCitadelAction() → soil 106µs → ALLOW/SEVER → broadcast
```

| 維度 | Citadel | ElizaOS / Virtuals |
|------|---------|---------------------|
| LLM 延遲 | 不優化（非戰場） | 不優化 |
| 確定性熔斷 | **核心** | 非核心 |
| 生態分發 | 弱（in-repo） | **強** |
| 審計可重現 | **868 PASS + demo CLI** | 依 plugin 作者 |

### 5.3 R&D 評分

| 產品 | Pre-broadcast guard | 多協議 soil | 生態分發 | **小計** |
|------|---------------------|-------------|----------|----------|
| **Citadel** | 5 | 5 | 2 | **4.0** |
| ElizaOS + 社群 plugin | 2 | 2 | 5 | **3.0** |
| Virtuals GAME | 2 | 2 | 5 | **3.0** |
| Gelato + Agent（執行向） | 1 | 1 | 4 | **2.0** |

**Citadel 優勢：** **Native Agent Policy Guard** + 多框架 **同構** `checkSoilResistance()` — 評委可用 **精準 per-venue `--trip` demo** 驗證（`pnpm demo:gmx` · `pnpm demo:variational` · `pnpm demo:hl`）。  
**Citadel 劣勢：** **無官方 npm**；ElizaOS / Virtuals 審計官會問「為何不用現成 plugin」— 需 V1.1 Open PR 閉環。

---

## 6. 綜合競品矩陣（Radar 摘要）

| 維度 (1–5) | Citadel | Gelato/Keeper | EigenLayer AVS | Biconomy/Safe | ElizaOS/Virtuals |
|------------|---------|---------------|----------------|---------------|------------------|
| A 延遲 / 反射 | **5.0** | 1.3 | 2.3 | 2.5 | 2.0 |
| B 風控模型 | **4.7** | 2.0 | 2.7 | 2.5 | 2.5 |
| C AA 整合 | **3.7** | 2.0 | 3.0 | 3.3 | 2.0 |
| D Agent 整合 | **4.0** | 2.0 | 2.5 | 2.0 | 3.0 |
| **加權平均** | **4.35** | 1.83 | 2.63 | 2.58 | 2.38 |

**權重建議（Buildathon 賽道）：** A 30% · B 30% · D 25% · C 15% → **Citadel 加權 ~4.28** vs 次高 EigenLayer ~2.65。

---

## 7. 競品護城河 vs Citadel 反制敘事

| 競品護城河 | Citadel 反制（Pitch 用語） |
|------------|---------------------------|
| Gelato **執行網路與觸發器** | 「Citadel 不競爭執行；我們在 Gelato 觸發 **之前** 106 µs 砍掉毒意圖。」 |
| EigenLayer **AVS 信任與質押** | 「AVS 驗證 **已廣播** 行為；Citadel 是 **Pre-consensus Intent Firewall**。」 |
| Biconomy/Safe **部署量** | 「我們是 ERC-7579 TYPE(4) **Pre-execution** 層，可疊加在既有 Kernel 上。」 |
| ElizaOS/Virtuals **npm 生態** | 「In-repo native guard + 868 PASS；V1.1 將 Open PR 官方 plugin。」 |

---

## 8. 已知差距與 R&D 路線圖（不修改 main invariant）

| 優先級 | 差距 | 建議 R&D 項 | 目標競品對齊 |
|--------|------|-------------|--------------|
| **P0** | 無 42161 live GM fill | M6 時間表 + 一筆 Gate 路徑成交 | Gelato 執行可信度 |
| **P0** | 42161 Dune 業務事件 | 首筆 `IntentAttested` ingest | 機構 telemetry SSOT |
| **P1** | ElizaOS/Virtuals 無 npm | `@slivervine/citadel-elizaos` Open PR | Agent 生態分發 |
| **P1** | Wasm FFI 24 vs 28 slot | FFI 對齊或文件標 TS-only lane | AVS / Stylus parity |
| **P2** | 鏈上 ERC-7579 Hook 未部署 | Sepolia Kernel 模組槽 PoC | Biconomy 部署敘事 |
| **P2** | 多 Worker protocolMask | DO 狀態同步 R&D spike | Keeper 級一致性 |

---

## 9. 可複現基準（Citadel SSOT · 本分支不改 code）

```bash
pnpm test -- --run          # 199 files | 868 PASS
pnpm exec tsc --noEmit      # 0 errors
pnpm bundle:measure         # gzipKiB < 51 · pass: true
pnpm demo:gmx -- --trip            # GMX native hard anchor
pnpm demo:variational -- --trip    # Variational multi-venue gate
pnpm demo:hl -- --trip             # Hyperliquid primary path
npx vitest run tests/sdk/retail-guard-provider.test.ts  # EIP-1193 Retail Guard SDK
```

---

## 10. 參考文件（main SSOT）

| 主題 | 路徑 |
|------|------|
| 延遲 / Defense Matrix | `docs/01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md` |
| Pillar Set X & Y / ZeroDev | `docs/01_architecture/04_THREE_PILLARS_AND_INGRESS_PIPELINE.md` |
| Core Sinking | `README.md` · `src/core/*` |
| 驗證矩陣 | `docs/06_verifications/01_VERIFICATION_MATRIX.md` |
| 內部評審（分數基線） | `docs/internal/0907_PM_Fresh_30_Persona_Audit.md` |

---

## 附錄 A — 詞彙對照

| 術語 | Citadel 定義 |
|------|--------------|
| **Pre-Consensus** | 意圖尚未進入 Sequencer / Bundler / 公共 mempool |
| **Soil Resistance** | `checkSoilResistance()` · Wasm `soil_core.wasm` |
| **Reflex Arc** | 14 µs–106 µs 確定性熔斷路徑 |
| **TYPE(4) Hook** | ERC-7579 Pre-execution Hook · `SliverVineRiskOracle.sol` |

---

*Prepared by: SilverVine Labs R&D · Branch `research/competitor-benchmark-and-rd` · `docs/research/COMPETITOR_ANALYSIS_AND_BENCHMARK.md`*
