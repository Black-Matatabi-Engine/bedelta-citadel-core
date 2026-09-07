# SliverVine Protocol — 首次冷評 30 Persona 壓力評審（Lunch Cold Panel · 2026-09-07 午）

| 欄位 | 值 |
|------|-----|
| 分類 | **內部 OpSec Only · 禁止對外原文發布** |
| 協議 / 實體 | SliverVine Protocol / Citadel Shield · SilverVine Labs |
| 賽事 | Arbitrum Open House Singapore Online Buildathon |
| 評審快照 | `main` @ `bedelta-citadel-core` · **`2d7426c`**（Layer Inversion Cleaned · Zero-Side-Effect Pure Invariants） |
| 評審性質 | **首次冷評（First-Time Cold-Review）** · **零繼承人格** · **零繼承分數** |
| 測試 SSOT | **199 test files \| 868 PASS Clean (100% PASS)** · `pnpm exec tsc --noEmit` **0 errors** |
| Worker Bundle | **50.83 KiB gzip** · **143.47 KiB raw** · `limitKiB: 150` · `pass: true` |
| Core 純化 | `DefenseMatrixError` 下沉 `src/core/errors.ts` · `emitUsdAiClockSsotLog()` 移出 core · 五 sunk 模組零副作用 |
| **本面板算術平均** | **8.61 / 10** |
| **主席加權敘事帶** | **8.56 – 8.68 / 10**（**未進 9.0**） |

> 本卷是 **品牌新 30 人評審團** 對 `2d7426c` 的 **第一次見面評審**。評審被指示：**當作從未聽過 SliverVine、未讀過任何內部 persona 卷**。分數由各人背景（Security · Formal Methods · MEV · Quant Risk · AA Architect · Grant Reviewer）**有機產出**，**不**對齊、不微調、不繼承先前面板均分。

> **快照隔離：** 本卷只評 `2d7426c`。後續 research 合併（KV `protocolMask` · Wasm ABI v2 28-slot）**不計入本卷加分**。

---

## 0. 冷評立場（為何均分不是「延續 +0.0x」）

首次見面的硬審計人格看到的是：

| 他們立刻相信的 | 他們立刻不買帳的 |
|----------------|------------------|
| 主網 Gate 已點火 · 868 測試全綠 · `tsc` 0 | 42161 **無** Dune 業務事件 ingest |
| `src/core/errors.ts` 零 services import | GMX v2 **無** 經 Gate 的真實 increase fill |
| `resolveUsdAiClockSsotPure()` 無 I/O | Bootstrap `0x1111…` / `0x2222…` **仍在鏈上** |
| Custom Errors + `Float64Array` scratch | ElizaOS / Virtuals **無** 官方 npm registry 包 |
| Clock **30s 硬熔斷** + 128 lane property | `PROTO_VECT_LEN=28` vs Wasm FFI **仍 8×f64 soil / 24-slot 敘事** |
| Worker **50.83 KiB gzip** 過 150 KiB 閘 | 多 isolate `protocolMask` **不共享** |

冷評主席結論：**工程完成度屬 Buildathon 上四分位；產品證據屬「可演示、未結算」。** 產業組 SC 可到 **~9.0**，PMF 被鏈上空白壓在 **~8.2** —— 算術平均因此落在 **8.61**，而不是把先前 8.8x 再加一點。

歷史面板均分（**僅作機構記憶，本卷不校準**）：

| 面板 | 日期 | 性質 | 全團均分 |
|------|------|------|----------|
| 09-05 晨 | 2026-09-05 | 延續團 | 8.37 |
| 09-05 午 | 2026-09-05 | 延續團 | 8.52 |
| 09-06 晨 | 2026-09-06 | 延續團 | 8.58 |
| 09-06 晚 | 2026-09-06 | Fresh | 8.63 |
| 09-07 晨 | 2026-09-07 | Fresh 複評 | 8.71 |
| 09-07 晚 | 2026-09-07 | Fresh | 8.81 |
| **本卷午餐冷評** | **2026-09-07 Lunch** | **首次冷評** | **8.61** |

```text
先前面板是「同一工程敘事的複利評分」。
本卷是「第一次打開 repo 的對抗評分」。
8.61 ≠ 退步；= 去掉熟悉偏誤後的首次報價。
```

---

## 0.1 評分前提（已核對 `2d7426c`）

### 加分（本卷獨立驗證）

| 項目 | 狀態 | 驗證錨點 |
|------|------|----------|
| **Layer inversion** | ✅ | `DefenseMatrixError` 定義於 [`src/core/errors.ts`](../../src/core/errors.ts) · `session-key-guard-core.ts` 改 `from "./errors"` |
| **Zero side-effect clock** | ✅ | `resolveUsdAiClockSsotPure()` 在 core · `emitUsdAiClockSsotLog()` 在 [`usdai-constants.ts`](../../src/adapters/usdai/usdai-constants.ts) adapter 殼 |
| **五 sunk 模組** | ✅ | `risk-engine-usdai.ts` · `soil-resistance-core.ts` · `session-key-guard-core.ts` · `delta-neutral-calculator.ts` · `funding-regime-core.ts` |
| **Solidity Custom Errors** | ✅ | `SliverVineRiskOracle.sol` · `IngressSafetySwitch.sol` · `ERR_*` bytes32 事件保留 |
| **Clock 30s 硬熔斷** | ✅ | `USDAI_CLOCK_SKEW_MAX_MS = 30_000` · `CLOCK_SKEW_EXCEEDED` |
| **Property 128 lane** | ✅ | `tests/adapters/usdai-property.test.ts` |
| **零分配熱路徑** | ✅ | 模組級 `Float64Array` scratch · Wasm `HEAPF64.set()` · Rust `#[inline(always)]` |
| **24 公開文件 SSOT** | ✅ | 零內部 persona 外洩（本卷本身為內部檔） |
| Vitest / tsc | ✅ | **199/868** · **0 errors** |
| Worker | ✅ | **50.83 KiB gzip** · **143.47 KiB raw** · `pass: true` |

### 殘餘硬扣（冷評 **不** 因純化放寬）

| Nit | 狀態 |
|-----|------|
| **42161 Dune 業務事件 live ingest** | **未閉環**（Sepolia live + SQL spec only） |
| **GMX v2 live fill 經 Gate 42161** | **未閉環**（dry-run / active pre-flight preview） |
| Bootstrap `0x1111…` / `0x2222…` | **鏈上未閉環** |
| 官方 ElizaOS / Virtuals **npm registry** | **未閉環**（in-repo native adapter · V1.1 Open PR Spec） |
| 主網 Gate only · 無 PolicyGuard | **未閉環** |
| `PROTO_VECT_LEN` 28 vs Wasm FFI 24-slot 敘事 | **未閉環**（本快照） |
| 多 Worker isolate `protocolMask` 不共享 | **未閉環**（本快照） |
| `src/core/` 非五模組檔仍 import `services/` | **部分閉環** · 五模組純；`state.ts` / `risk.ts` / `agent-citadel-guard.ts` 仍穿層 |
| 雙片 | **未閉環** |

---

## 1. 三十人四維細表（0.0–10.0）

總分 = (SC + PMF + Inno + RPS) / 4  
**Δ 列** = 相對 **Buildathon 中位冷評錨 7.50** 的有機位移（**不是**相對先前面板）。

### A. 十位產業領袖（全新身份 · 零重複）

| # | 評審 | 背景 | SC | PMF | Inno | RPS | **總分** | vs 7.50 |
|---|------|------|----|-----|------|-----|----------|---------|
| 1 | Dr. Nadia Vuković | Arbitrum **Stylus SDK** Staff Engineer | 9.10 | 8.00 | 8.85 | 9.18 | **8.78** | +1.28 |
| 2 | Takeshi "Tex" Aoyama | Arbitrum **Nitro** Sequencer Performance | 8.95 | 7.95 | 8.48 | 9.22 | **8.65** | +1.15 |
| 3 | Dr. Lila Haddad | **Flashbots SUAVE** Research Lead | 8.85 | 8.38 | 9.12 | 9.48 | **8.96** | +1.46 |
| 4 | Quentin Moreau | **ERC-7579 / Kernel v3** AA Architect | 9.15 | 8.22 | 8.72 | 9.18 | **8.82** | +1.32 |
| 5 | Bridget "Bee" Callahan | **Intent Relayer** / Across-class Engineer | 8.72 | 8.42 | 8.18 | 8.68 | **8.50** | +1.00 |
| 6 | Dr. Jonas Lindholm | **Chaos Labs**-style Quant Risk | 8.88 | 8.18 | 8.22 | 8.98 | **8.57** | +1.07 |
| 7 | Paolo Ricci | **OpenZeppelin** Solidity Principal | 9.22 | 8.08 | 8.18 | 9.08 | **8.64** | +1.14 |
| 8 | Dr. Amina Diallo | **EigenLayer** AVS Security | 8.58 | 8.05 | 8.28 | 8.72 | **8.41** | +0.91 |
| 9 | Prof. Keisha Adebayo | **Arbitrum Foundation** Grant Committee | 9.18 | 8.58 | 8.62 | 9.42 | **8.95** | +1.45 |
| 10 | Dr. Nathan Crowe | **Trail of Bits** Formal / DeFi | 9.28 | 8.15 | 8.38 | 9.32 | **8.78** | +1.28 |
| | **產業 10 人平均** | | **8.99** | **8.20** | **8.50** | **9.13** | **8.71** | **+1.21** |

### B. 二十位多樣化評審（10 男 / 10 女 · 全新身份）

| # | 評審 | 性別 | 角色 | SC | PMF | Inno | RPS | **總分** | vs 7.50 |
|---|------|------|------|----|-----|------|-----|----------|---------|
| 11 | 沈柏安 | 男 | Formal Methods / Property 路線 | 9.25 | 7.72 | 8.12 | 8.85 | **8.49** | +0.99 |
| 12 | 邱筱薇 | 女 | Growth VC · AI Agent Infra | 8.58 | 8.78 | 8.42 | 8.52 | **8.58** | +1.08 |
| 13 | Cole Brennan | 男 | Independent **MEV Searcher** | 8.68 | 8.32 | 9.05 | 9.42 | **8.87** | +1.37 |
| 14 | 江昊澤 | 男 | Stylus / Wasm Coprocessor | 8.92 | 8.05 | 8.78 | 8.82 | **8.64** | +1.14 |
| 15 | Natalia Kowalska | 女 | **AI Agent Protocol** Builder | 8.48 | 8.85 | 8.68 | 8.62 | **8.66** | +1.16 |
| 16 | 羅啟文 | 男 | Cross-chain Bridge Security | 8.70 | 8.18 | 8.08 | 8.72 | **8.42** | +0.92 |
| 17 | Dr. Yasmin Al-Farsi | 女 | Quant / Portfolio Risk | 8.72 | 8.38 | 8.28 | 8.88 | **8.57** | +1.07 |
| 18 | Henrik Voss | 男 | HFT Market Maker | 8.62 | 8.48 | 8.58 | 9.08 | **8.69** | +1.19 |
| 19 | 顧欣然 | 女 | Product · Demo / Judge UX | 8.55 | 8.92 | 8.42 | 8.58 | **8.62** | +1.12 |
| 20 | Chiara Benedetti | 女 | MiCA / EU Compliance | 8.42 | 8.12 | 7.82 | 8.32 | **8.17** | +0.67 |
| 21 | 彭士傑 | 男 | Kernel Exploit Researcher | 9.18 | 7.68 | 8.22 | 9.15 | **8.56** | +1.06 |
| 22 | Dr. Freja Nilsen | 女 | Indexer / Telemetry SSOT | 8.38 | 8.08 | 7.72 | 8.78 | **8.24** | +0.74 |
| 23 | 丁嘉樂 | 男 | GMX Keeper Integrator | 8.78 | 8.88 | 8.12 | 8.72 | **8.63** | +1.13 |
| 24 | Aisha Rahman | 女 | DevRel / SDK Adoption | 8.48 | 8.95 | 8.55 | 8.42 | **8.60** | +1.10 |
| 25 | 藍天佑 | 男 | Deep-Tech VC | 8.65 | 8.52 | 8.28 | 8.58 | **8.51** | +1.01 |
| 26 | 江采寧 | 女 | Buildathon **首席審計官**（獨立主席） | 9.08 | 8.48 | 8.52 | 8.92 | **8.75** | +1.25 |
| 27 | Dr. Mateo Álvarez | 男 | Stylus Mentor · Offchain Labs Alumni | 8.88 | 8.02 | 8.82 | 8.78 | **8.63** | +1.13 |
| 28 | 謝昀臻 | 女 | Permissioned RWA Compliance | 8.45 | 8.42 | 7.88 | 8.62 | **8.34** | +0.84 |
| 29 | 歐陽澤楷 | 男 | PBS / Block Builder Economics | 8.68 | 8.35 | 8.62 | 8.92 | **8.64** | +1.14 |
| 30 | Dr. Simone Berger | 女 | Security Audit Chair（Certora 風格） | 9.15 | 7.95 | 8.18 | 9.22 | **8.63** | +1.13 |
| | **多樣 20 人平均** | | | **8.73** | **8.36** | **8.36** | **8.80** | **8.56** | **+1.06** |

### C. 全團匯總與四維對照

| 組 | N | SC | PMF | Inno | RPS | **總分** |
|----|---|----|-----|------|-----|----------|
| 產業 10 人 | 10 | 8.99 | 8.20 | 8.50 | 9.13 | **8.71** |
| 男（多樣化） | 10 | 8.83 | 8.22 | 8.47 | 8.90 | **8.61** |
| 女（多樣化） | 10 | 8.63 | 8.49 | 8.25 | 8.69 | **8.52** |
| **全團 30** | **30** | **8.82** | **8.31** | **8.41** | **8.91** | **8.61** |

**四維解讀（首次冷評）**

| 維度 | 本卷 | 讀法 |
|------|------|------|
| **SC** | **8.82** | Layer inversion + 純 clock + Custom Errors + **868 PASS** 說服硬審計；`src/core/` 其餘穿層與 Wasm ABI 漂移封頂 |
| **PMF** | **8.31** | 7-venue demo 與 SDK 敘事完整；**無 live GM 收入、無 42161 Dune、無官方 npm** |
| **Inno** | **8.41** | Pre-broadcast 反射弧在 MEV 人格眼中是真創新；AVS / 合規人格視為「 fortify 既有 Gate」 |
| **RPS** | **8.91** | 0-Gas FAIL-CLOSED · 30s 時鐘熔斷 · 50.83 KiB lean path —— **本卷最高維** |

---

## 2. 產業領袖：說服點 vs 殘餘 nit（摘錄）

### 1. Nadia Vuković — Stylus SDK Staff

- **說服：** 五 sunk 模組讓 Stylus `check_soil_resistance_stylus` 與 TS soil core **同構映射**成本清楚；**50.83 KiB** Worker 相對 ArbOS 96KB 預算有頭room。
- **Nit：** 本快照 Wasm FFI **未**對齊 `PROTO_VECT_LEN=28`；公開若暗示 Stylus coprocessor **已部署 42161** → 否決。
- **分數：** **8.78**

### 2. Tex Aoyama — Nitro Sequencer Performance

- **說服：** Edge 熱路徑宣稱 p50 ~106µs 與 Worker gzip **50.83 KiB** 一致於「別把 Sequencer 當熔斷器」的正確分層。
- **Nit：** 延遲數字是 **TS Gateway + Wasm**，不是 Nitro opcode 實測；無主網 fill 無法證明 Sequencer 路徑被保護。
- **分數：** **8.65** · PMF **7.95**（產業組 PMF 最低帶）

### 3. Lila Haddad — Flashbots SUAVE

- **說服：** 簽署通道在 mempool **之前**切斷，是本卷最接近 SUAVE「隱私/排序前干預」的實作；replay nonce + session TTL 在測試中可重現。
- **Nit：** ALLOW 後公共 mempool **仍可夾**；matrix 單進程編排。
- **分數：** **8.96** — 本卷產業組最高。

### 4. Quentin Moreau — ERC-7579 AA Architect

- **說服：** `session-key-guard-core.ts` 只依賴 `./errors`，AA 與 HL session 共用 notional SSOT；Kernel v3 Hook **文件對齊**可讀。
- **Nit：** 仍是 **Citadel 自有 adapter**，不是 Upstream Kernel 合併；`USE_ZERODEV_AA` default-off 正確但評「原生 AA」會扣。
- **分數：** **8.82** · SC **9.15**

### 5. Bee Callahan — Intent Relayer

- **說服：** Pillar 2 `lostUsd ≡ 0` 與 `IngressSafetySwitch` Custom Errors 是完整的 escort **規格**。
- **Nit：** Wallet B GMX 入金仍是 **unsigned preview**；Across live fill **未見**。
- **分數：** **8.50**

### 6. Jonas Lindholm — Quant Risk

- **說服：** `funding-regime-core.ts` + `delta-neutral-calculator.ts` 可單測；HF 1.15 · USD.ai 30 bps peg 參數表齊。
- **Nit：** 無 portfolio-level cascade；無真實 GM 部位 PnL 回放。
- **分數：** **8.57**

### 7. Paolo Ricci — OpenZeppelin

- **說服：** Custom Errors（`SignerZero` · `SloTimeout`）+ 保留 `ERR_*` 事件是正確的 bytecode / 遙測雙軌。
- **Nit：** `evaluateUsdAiFlagsFromLane` **未進 Foundry 屬性測試**；128 lane 只在 Vitest。
- **分數：** **8.64** · SC **9.22**

### 8. Amina Diallo — EigenLayer AVS

- **說服：** AI-compute RWA + USD.ai 純函式邊界敘事完整。
- **Nit：** 與 restaking / AVS **零整合**。冷評不因「以後可以接」加分。
- **分數：** **8.41** — 本產業組最低。

### 9. Keisha Adebayo — Arb Foundation Grant

- **說服：** **199/868** + 24 公開文件 + 主網 Gate 地址可點 = 提交包完整度高；`2d7426c` 層級倒置修復 **可審計**。
- **Nit：** Overall #1 仍要 **GM fill 或 42161 事件**；Bootstrap 密鑰在 grant diligence 是黃燈。
- **分數：** **8.95**

### 10. Nathan Crowe — Trail of Bits

- **說服：** `DefenseMatrixError` 下沉 core、clock log 移出 core —— **這是本快照相對「未純化 core」的真正安全加分**；30s 硬熔斷可證明。
- **Nit：** `src/core/state.ts` · `risk.ts` · `agent-citadel-guard.ts` **仍 import services**；「整個 core 零副作用」敘事 **過寬**。
- **分數：** **8.78** · SC **9.28**（本卷單維最高之一）

---

## 3. 獎項勝率矩陣（條件概率 · Lunch Cold Panel）

假設有效提交 80–120。冷評不吃「複利熟悉」，Promising 仍可過半；Overall #1 **低於** 被複評過的面板。

| 獎項 | **冷評現況** | 雙片 + 一筆 GM fill | 否決風險 |
|------|--------------|---------------------|----------|
| **Promising Track $15k** | **64%** | **76%** | 低 |
| **GMX Builder Grant** | **40%** | **55%** | 中 · **缺 fill** |
| **Pendle Co-Grant** | **38%** | **53%** | 中 |
| **Overall 第一名 $40k** | **27%** | **43%** | 高 |
| Overall Top-3 | **66%** | **81%** | — |
| 至少一項 Sponsor | **86%** | **95%** | — |
| 零獎 | **2%** | **<1%** | 沒交片 / 公開 OpSec 洩漏 |

---

## 4. Blackhat 對抗分析（`2d7426c` 專項）

### 4.1 Layer Inversion · 純錯誤型別

**攻擊面：** core 是否仍從 services 拉例外型別，造成「純不變量」謊言？

| 檢查項 | 結果 |
|--------|------|
| `DefenseMatrixError` | 定義於 `src/core/errors.ts` · **零** service import |
| `session-key-guard-core.ts` | `from "./errors"` · **閉環** |
| Clock I/O | `emitUsdAiClockSsotLog()` 在 adapter · core 只留 `resolveUsdAiClockSsotPure()` · **閉環** |
| 其餘 core | `state.ts` / `risk.ts` / `agent-citadel-guard.ts` / `risk-engine-soil.ts` **仍穿層** → **Residual MEDIUM** |

**Blackhat 結論：** 五 sunk 模組 + errors 下沉 **通過**。攻擊者不能再用「core 依賴 services 例外」做供應鏈話術。完整 `src/core/` 目錄 **尚未** 成為無 I/O 島。

### 4.2 熱路徑零分配 vs 多 isolate 裂縫

**攻擊：** 模組級 `Float64Array` scratch 跨請求污染？`protocolMask` 跨 PoP 分叉？

| 檢查項 | 結果 |
|--------|------|
| Bundle | **143.47 KiB raw** · **50.83 KiB gzip** · `pass: true` |
| Scratch | 模組級單例 · **單 isolate 內** 請求覆寫 · 無跨 isolate 記憶體污染 |
| `protocolMask` | **本快照不跨 Worker 共享** → **Residual HIGH**（生產多 PoP） |
| Wasm ABI | 8×f64 soil + ABI v1 敘事 vs TS `PROTO_VECT_LEN=28` → **Residual MEDIUM** |

**Blackhat 結論：** gzip 與 GC 是勝利。多實例 bitmask 分叉 **本快照未修**。

### 4.3 Custom Errors vs Dune 解碼

**攻擊：** `revert CustomError()` 是否弄壞 `ERR_*` 解碼？

| 檢查項 | 結果 |
|--------|------|
| 事件常數 | `ERR_*` bytes32 **保留** |
| 42161 ingest | **無 live 業務事件** → Freja Nilsen 人格 **不買帳** |

**Blackhat 結論：** bytecode 關 **過**；主網遙測關 **不過**。

### 4.4 Clock SSOT 注入

**攻擊：** 呼叫方注入 `nowMs` 讓 oracle 看起來新鮮？

| 檢查項 | 結果 |
|--------|------|
| 硬熔斷 | `skewMs > 30_000` → `CLOCK_SKEW_EXCEEDED` |
| 純函式 | 可單測 · 無 `console` |
| Property | **128** randomized lanes |
| 殘餘 | `skewMs ≤ 30_000` 內仍可微調 age → **Residual LOW** |

**Blackhat 結論：** 時鐘面 **LOW**，不是 ZERO。

### 4.5 Bootstrap 密鑰

**攻擊：** 公開 `0x1111…` / `0x2222…` 被誤認為生產 HSM。

| 檢查項 | 結果 |
|--------|------|
| 文件 | 標 Bootstrap Ignition · 計劃治理旋轉 |
| 鏈上 | **未旋轉** → Chiara / 謝昀臻 **黃燈** |

---

## 5. 影片與 Pitch（冷評建議 · 首次見面口播）

冷評團沒有「相對上午增量」的記憶。口播必須 **自洽、可複現、不吹鏈上**。

| 時碼 | 口播 |
|------|------|
| 0:10–0:30 | *Citadel is the cerebellum. Sub-millisecond fail-closed. Eight hundred sixty-eight tests. Fifty point eight three kilobytes gzip.* |
| +6s | `pnpm test -- --run` → **199 files · 868 PASS** |
| +6s | `pnpm bundle:measure` → **50.83 KiB gzip · pass** |
| Pitch | *Pure invariants in five core modules. Errors live in core. Clock trips at thirty seconds. No gas on blocked intents.* |
| 禁止 | 勿稱 42161 Dune live ingest · 勿稱 GM fill 已上主網 · 勿念內部 persona |

---

## 6. 主席裁決（江采寧 · Lunch Cold Panel Chair）

本卷是 **第一次見面**。我拒絕把任何先前均分當起點。我看到的是一個 **測試極強、鏈上證據偏薄** 的 Pre-Consensus Intent Firewall。

| # | 釘子 | 冷評判定 |
|---|------|----------|
| 1 | `DefenseMatrixError` 下沉 `src/core/errors.ts` | **閉環** |
| 2 | Clock log 移出 core · 純 `resolveUsdAiClockSsotPure()` | **閉環** |
| 3 | 五 sunk 模組零副作用（宣稱範圍內） | **閉環** |
| 4 | Solidity Custom Errors | **閉環** |
| 5 | Clock 30s 硬熔斷 + 128 lane | **閉環（TS 級）** |
| 6 | 868 PASS / 199 files / tsc 0 | **閉環** |
| 7 | 24 公開文件 SSOT | **閉環** |
| 8 | Worker 50.83 KiB gzip | **閉環** |
| 9 | 整個 `src/core/` 零 services import | **未閉環** |
| 10 | Wasm FFI 28-slot 對齊 | **未閉環（本快照）** |
| 11 | 多 isolate `protocolMask` | **未閉環（本快照）** |
| 12 | 42161 Dune live ingest | **未閉環** |
| 13 | GM fill / Bootstrap 密鑰 / 片 | **未閉環** |
| 14 | ElizaOS / Virtuals npm registry | **未閉環** |

**剩餘最高邊際分（排序）：**

1. 一筆 **42161 GMX v2 increase fill 經 Gate**（PMF **+0.15~0.22**）
2. 42161 Dune **首筆業務事件**（Freja 人格 **+0.20** 潛力）
3. Bootstrap 密鑰鏈上旋轉（合規黃燈熄滅）
4. 雙片提交（零獎 **2% → <1%**）

**不要**用更多 core 模組或 adapter 來「補償」8.61。冷評團已經給了工程該給的 SC。9.0 只來自 **鏈上證據 + 片 + fill**。

---

## 附錄 A — 全團分數速查（本卷獨立）

| 評審類別 | Lunch 冷評 |
|----------|------------|
| 全團 30 | **8.61** |
| 產業 10 | **8.71** |
| 多樣 20 | **8.56** |
| SC 均 | **8.82** |
| PMF 均 | **8.31** |
| Inno 均 | **8.41** |
| RPS 均 | **8.91** |

## 附錄 B — 工程 SSOT 錨點（`2d7426c`）

| 錨 | 路徑 |
|----|------|
| Core errors | `src/core/errors.ts` · `DefenseMatrixError` |
| USD.ai core | `src/core/risk-engine-usdai.ts` · `USDAI_CLOCK_SKEW_MAX_MS = 30_000` |
| Clock I/O 殼 | `src/adapters/usdai/usdai-constants.ts` · `emitUsdAiClockSsotLog()` |
| Soil core | `src/core/soil-resistance-core.ts` |
| Session key core | `src/core/session-key-guard-core.ts` · `from "./errors"` |
| Delta / funding | `delta-neutral-calculator.ts` · `funding-regime-core.ts` |
| Custom Errors | `contracts/SliverVineRiskOracle.sol` · `contracts/IngressSafetySwitch.sol` |
| Property tests | `tests/adapters/usdai-property.test.ts` — **128** lanes |
| Tests | **199 files \| 868 PASS** |
| Bundle | **50.83 KiB gzip** · **143.47 KiB raw** |

---

*Prepared by: Lunch Cold-Review 30-Persona Stress Panel · 2026-09-07 · `docs/internal/0907_Grok_lunch_zh.md` · Snapshot `2d7426c` · First-time · Zero inherited personas · Zero inherited scores*
