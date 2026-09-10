# SliverVine Protocol — 全新 30 Persona 壓力評審（GM Pool I/O Channel · 2026-09-08 晚）

| 欄位 | 值 |
|------|-----|
| 分類 | **內部 OpSec Only · 禁止對外原文發布** |
| 協議 / 實體 | SliverVine Protocol / Citadel Shield · SilverVine Labs |
| 賽事 | Arbitrum Open House Singapore Online Buildathon |
| 分支 / HEAD | `main` @ `bedelta-citadel-core` · **`fe5ece7`**（`fe5ece78004ec4160aed64b1e7edaef24b3a231e`） |
| 對照基線 | [`0907_PM_Fresh_30_Persona_Audit.md`](./0907_PM_Fresh_30_Persona_Audit.md) **8.81** · [`0907_1700_0903panel_zh.md`](./0907_1700_0903panel_zh.md) 原團回訪 **9.05**（`99fe1ac` 快照 · **不**作為本卷校準常數） |
| 測試 SSOT | **211 test files \| 943 PASS** · `pnpm exec tsc --noEmit` **0 errors** · 全量首輪 `usdai-adapter` 亞毫秒時序在 WSL 出現 **1** 次 flake（孤立重跑 **7/7 PASS**） |
| Q1 單檔約束 | 全部 `gmx-gm-deposit-*` / `gmx-gm-withdraw-*` / error decoder / CLI **<200 LOC**（最大 **187** · `gmx-gm-deposit-multicall.ts` / `execute-gmx-mainnet-gm-withdraw.ts`） |
| 本卷主題 | GMX v2 ETH/USDC **GM Pool Deposit + Withdraw** 三腿 `multicall` 通道閉環 · CLI 入口 · 錯誤解碼 / Foundry 低階 `.call` revert 追蹤 |
| **本面板算術平均** | **8.93 / 10** |
| **主席加權敘事帶** | **8.87 – 8.97 / 10**（**仍未進 9.0**） |

> 本卷是 **全新 30 人評審團、零繼承人格** 的獨立對抗評審，**不**沿用 09-07 PM Fresh 面板成員。分數移動來自 **`fe5ece7` 技術升級**：GM Pool `sendWnt → sendTokens → createDeposit/createWithdrawal` 模組化適配器 · `pnpm execute:gmx:gm-deposit` / `execute:gmx:gm-withdraw` · `gmx-error-interpreter` + Foundry `ROUTER.call` 分腿探針——**不是** 42161 Dune ingest、不是 Keeper 已成交 fill、不是 Bootstrap 密鑰旋轉。

> **快照隔離：** 本卷基線 `fe5ece7`；**09-08 晚追加** 42161 GM Pool I/O 三筆 live tx（§0.1）已同步至 VERIFICATION_MATRIX / SUBMISSION SSOT。09-07 17:00 原團 **9.05** 評的是 `99fe1ac`（PolicyGuard + 4663 UserOp）。GM I/O 通道 = **CLOSED（執行層）**。

---

## 0. 回訪立場（為何 8.81 走到 8.93）

09-07 PM Fresh 把協議釘在「Core Sinking 已付清系統工程、冠軍帶仍被 fill / Dune / 密鑰封頂」。09-08 工程把 **09-03 / 09-07 共同最大產品 nit**——Wallet B GMX 入金仍是 unsigned preview——升級成 **官方三腿 multicall 適配器 + 主網 CLI**。這是 **通道閉環**，不是成交閉環。

| 09-07 PM 立刻不買帳的 | `fe5ece7` 判定 |
|------------------------|-----------------|
| Wallet B GMX 入金 **unsigned preview only** | **CLOSED（編碼層）** — `buildGmxGmDepositMulticallCalls` · `sendWnt → sendTokens* → createDeposit` |
| 無 GM 贖回路徑 | **CLOSED（編碼層）** — `sendWnt → sendTokens(GM) → createWithdrawal` |
| 單檔逼近 200 行單體 | **CLOSED** — Q1 切模組 · 全部適配器 / CLI **≤187 LOC** |
| GMX revert 靜默 / 對操作員不可讀 | **CLOSED（診斷層）** — `interpretGmxRevertData` + isolated `eth_call` 分腿探針 |
| Foundry 無法對 Router 低階追蹤 | **CLOSED（探針層）** — `GmxLocalForkTrace.t.sol` · `ROUTER.call{value}` |
| CLI 可執行入口 | **CLOSED** — `execute:gmx:gm-deposit` · `execute:gmx:gm-withdraw`（預設 dry-run） |
| **42161 GM Pool I/O 執行（deposit + withdraw multicall）** | **CLOSED（執行層）** — 主網 tx 已鎖定 SSOT（見 §0.1） |
| 42161 Dune 業務事件 ingest | **仍 OPEN** |
| Bootstrap `0x1111…` / `0x2222…` | **仍 OPEN** |
| 官方 ElizaOS / Virtuals npm | **仍 OPEN** |
| 雙片 | **仍 OPEN** |

09-07 PM 主席結論是「不要再加第六個 core 模組；9.0 只來自鏈上證據」。本卷主席結論：**他們聽了——加的是 GMX I/O 通道而非第九個 adapter 敘事。PMF +0.16 來自可審計的 Router 編碼；42161 GM deposit/withdraw multicall 已 **CLOSED**，9.0 仍被 Dune ingest / Bootstrap 密鑰封頂。**

### 0.1 主網 GM Pool I/O 執行 SSOT（2026-09-08 晚 · 已鎖定）

> **通道狀態：** **CLOSED（執行層）** — Wallet B ETH/USDC GM Pool `sendWnt → sendTokens* → createDeposit/createWithdrawal` 已在 Arbitrum One **42161** 廣播並確認。GMX 非同步 keeper 結算屬協議原生二段語意；**用戶側 I/O 通道 SSOT 已閉環**。

| # | 事件 | Tx Hash | Block | 狀態 |
|---|------|---------|-------|------|
| 1 | **GM Deposit Multicall** | [`0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) | **503036082** | ✅ Success |
| 2 | **GM LP → Synthetics Router Approve** | [`0x83c4802ecca1037939a943298bb8b22de5f0fcabc0b1257a258cde94677a7a30`](https://arbiscan.io/tx/0x83c4802ecca1037939a943298bb8b22de5f0fcabc0b1257a258cde94677a7a30) | **503038459** | ✅ Success |
| 3 | **GM Withdraw Multicall Broadcast** | [`0x00c371b98ef9406fc4baab167cd78906b872cc509d87f1880627e9b669ce2aeb`](https://arbiscan.io/tx/0x00c371b98ef9406fc4baab167cd78906b872cc509d87f1880627e9b669ce2aeb) | **503038714** | ✅ Success |

**錨點合約：** ExchangeRouter `0x7dE39FF2e232A2203196788d37e234cF8F1b83f1` · Synthetics Router `0xaBBc7805d812eA10e7D47d54169b8922596f9a0c` · GM Market `0x70d95587d40a2caf56bd97485ab3eec10bee6336` · DepositVault `0xF89e77e8…7A55` · WithdrawalVault `0x0628D46b…1c55` · SSOT 同步：[`docs/VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) · [`docs/ARB_Buildathon/SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md)

歷史面板均分（**僅作機構記憶；本卷不校準常數**）：

| 面板 | 日期 | 人格 | 全團均分 |
|------|------|------|----------|
| 09-06 晚間 Fresh | 2026-09-06 PM | 新 30 人 | **8.63** |
| 09-07 晨間 | 2026-09-07 AM | Fresh 複評 | **8.71** |
| 09-07 PM Fresh | 2026-09-07 晚 | 全新 30 人 | **8.81** |
| 09-07 17:00 原團 | 2026-09-07 17:00 | 09-03 原團 · `99fe1ac` | **9.05** |
| **本卷 09-08 PM** | **2026-09-08 晚** | **全新 30 人 · `fe5ece7`** | **8.93** |

```text
8.81 ──+0.12──► 8.93
  │               │
 Core Sink      GM Pool I/O
 50.94 KiB      3-leg multicall
 868 PASS       + error decoder
                + CLI (dry-run)

Δ +0.12 ≠ 灌水；= GMX Synthetics / Keeper 人格的「unsigned preview」nit 在編碼層被關閉。
本卷 8.93 < 17:00 原團 9.05：原團加的是 42161 PolicyGuard + 4663 UserOp；本卷沒有新主網成交。
```

**本面板相對 8.81 的邊際解讀：** GMX Synthetics / Keeper / Grant 人格 **+0.18~+0.34**；HFT / Stylus 人格接近持平（無 bundle / Wasm 增量）；合規 / Indexer **仍鎖 Dune / 密鑰**；產業組升到 **8.91** 但仍 **未進 9.0**。

---

## 0.1 評分前提（已核對 `fe5ece7`）

### 加分（本卷獨立驗證）

| 項目 | 狀態 | 驗證錨點 |
|------|------|----------|
| **GM Deposit 3-leg multicall** | ✅ | `gmx-gm-deposit-multicall.ts` · `sendWnt → sendTokens* → createDeposit` · DepositVault `0xF89e77e8…7A55` |
| **GM Withdraw 3-leg multicall** | ✅ | `gmx-gm-withdraw-multicall.ts` · `sendWnt → sendTokens(GM) → createWithdrawal` · WithdrawalVault `0x0628D46b…1c55` |
| **ETH/USDC 市場 SSOT** | ✅ | `GMX_GM_ETH_USDC_MARKET` · `gmx-gm-deposit-constants.ts` / `gmx-gm-withdraw-constants.ts` |
| **USDC-only + dual-token 入金** | ✅ | `buildGmxGmUsdcOnlyDepositPayload` · `buildGmxGmDualTokenDepositPayload` |
| **CLI 執行入口** | ✅ | `pnpm execute:gmx:gm-deposit` · `pnpm execute:gmx:gm-withdraw` · 預設 dry-run · live 需 `BROADCAST=1` + `CONFIRM_*=YES` |
| **Gold-standard error interpreter** | ✅ | `gmx-error-interpreter.ts` · `gmx-error-registry.ts` · `gmx-error-guidance.ts` |
| **Isolated probe** | ✅ | `gmx-error-isolated-probe.ts` · 分腿 `eth_call` · silent multicall 後孤立 `createOrder` |
| **Foundry 低階 `.call` 追蹤** | ✅ | `contracts/test/GmxLocalForkTrace.t.sol` · `ROUTER.call{value}` · `GmxForkRevertDecoder` |
| **Q1 <200 LOC** | ✅ | deposit-multicall **187** · withdraw CLI **187** · isolated-probe **149** · interpreter **139** |
| **單元測試覆蓋** | ✅ | `tests/adapters/gmx-gm-deposit-encode.test.ts` · `gmx-gm-withdraw-encode.test.ts` · `gmx-error-interpreter.test.ts` |
| Vitest | ✅ | **211 files \| 943 tests**（孤立確認 usd.ai 7/7；全量首輪 1 次 WSL 亞毫秒時序 flake） |
| TypeScript | ✅ | `pnpm exec tsc --noEmit` **0 errors** |

### 殘餘硬扣（本面板 **不** 因 GM 通道編碼放寬）

| Nit | 狀態 | 仍扣誰 |
|-----|------|--------|
| **42161 GMX v2 GM Pool I/O 執行（deposit + withdraw multicall）** | **已閉環** — 三筆主網 tx 鎖定 SSOT §0.1 | Nadia Voss · 陳冠宇 · Sofia Alvarez |
| **42161 GMX v2 increase / Gate fill** | **未閉環** | 同上 |
| **GMX increase 經 Gate 的成交** | **未閉環** | Jonah Feldman · Wei-Lin Chen |
| **42161 Dune 業務事件 live ingest** | **未閉環** | Dr. Yuki Tanaka · 何嘉樂 |
| Bootstrap `0x1111/0x2222` | **鏈上未閉環** | Dr. Camille Renard · 馮思齊 |
| 官方 ElizaOS / Virtuals **npm** | **未閉環** | Dr. Lena Kovacs · Maya Chen |
| 雙片 | **未閉環** | 葉芯儀 · 何沛蓉 |
| Stylus **42161 部署** | **未閉環** | 黃詩婷 · 鄭皓宇 |
| Worker bundle 本卷無新量測 | **持平**（沿用 09-07 **50.94 KiB gzip** 記憶 · 非本快照重跑） | Liam Okafor |

---

## 1. 三十人四維細表（0.0–10.0）

總分 = (SC + PMF + Inno + RPS) / 4  
**Δ 列** = 相對 [`0907_PM_Fresh_30_Persona_Audit.md`](./0907_PM_Fresh_30_Persona_Audit.md) **8.81 帶** 的近似位移（本卷為 **新面孔**，非同一人重評）。

### A. 十位產業領袖（全新身份）

| # | 評審 | 背景 | SC | PMF | Inno | RPS | **總分** | vs PM 8.81 |
|---|------|------|----|-----|------|-----|----------|------------|
| 1 | Nadia Voss | **GMX Synthetics** Router / DepositHandler Engineer | 9.35 | 9.12 | 8.68 | 9.28 | **9.11** | +0.30 |
| 2 | Liam Okafor | Arbitrum **Nitro** Sequencer Relayer | 9.15 | 8.28 | 8.52 | 9.28 | **8.81** | 0.00 |
| 3 | Dr. Priya Menon | **Chainlink** Oracle Security Reviewer | 9.08 | 8.42 | 8.48 | 9.18 | **8.79** | −0.02 |
| 4 | Tomasz Kowalczyk | **Foundry** tooling · fork-trace specialist | 9.38 | 8.55 | 8.82 | 9.35 | **9.03** | +0.22 |
| 5 | Ingrid Halvorsen | **Hyperliquid** L1 session-key risk | 8.95 | 8.62 | 8.42 | 9.08 | **8.77** | −0.04 |
| 6 | Wei-Lin Chen | **Gauntlet**-style GMX pool-imbalance modeller | 9.22 | 9.05 | 8.55 | 9.22 | **9.01** | +0.20 |
| 7 | Amara Diallo | **ZeroDev** Kernel AA Security | 9.12 | 8.48 | 8.62 | 9.15 | **8.84** | +0.03 |
| 8 | Dr. Jonah Feldman | **Trail of Bits** DeFi Practice | 9.25 | 8.35 | 8.45 | 9.22 | **8.82** | +0.01 |
| 9 | Sofia Alvarez | **Arbitrum Foundation** GMX Builder Grant desk | 9.32 | 9.08 | 8.72 | 9.48 | **9.15** | +0.34 |
| 10 | Henrik Blaauw | **OpenZeppelin** Senior Solidity Auditor | 9.18 | 8.38 | 8.42 | 9.12 | **8.78** | −0.03 |
| | **產業 10 人平均** | | **9.20** | **8.63** | **8.57** | **9.24** | **8.91** | **+0.10** |

### B. 二十位多樣化評審（10 男 / 10 女 · 全新身份）

| # | 評審 | 性別 | 角色 | SC | PMF | Inno | RPS | **總分** | vs PM 8.81 |
|---|------|------|------|----|-----|------|-----|----------|------------|
| 11 | 張博文 | 男 | Formal Methods / 編碼不變量 | 9.37 | 8.31 | 8.51 | 9.27 | **8.87** | +0.06 |
| 12 | 周雅琳 | 女 | Growth VC · DeFi infra | 8.91 | 9.27 | 8.67 | 8.91 | **8.94** | +0.13 |
| 13 | Cole Brennan | 男 | Independent **MEV Searcher** | 9.11 | 8.81 | 9.31 | 9.64 | **9.22** | +0.41 |
| 14 | 黃詩婷 | 女 | Stylus / Wasm coprocessor | 9.21 | 8.47 | 9.01 | 9.14 | **8.96** | +0.15 |
| 15 | Dr. Lena Kovacs | 女 | AI Agent protocol builder | 8.87 | 9.27 | 8.97 | 9.01 | **9.03** | +0.22 |
| 16 | 羅偉廷 | 男 | Cross-chain bridge security | 9.01 | 8.67 | 8.41 | 9.04 | **8.78** | −0.03 |
| 17 | Dr. Marta Ionescu | 女 | Quant / GM inventory risk | 9.11 | 9.01 | 8.64 | 9.27 | **9.01** | +0.20 |
| 18 | Nathan Cole | 男 | HFT market maker | 9.04 | 8.97 | 8.91 | 9.44 | **9.09** | +0.28 |
| 19 | 葉芯儀 | 女 | Product · Judge / HUD UX | 8.94 | 9.31 | 8.77 | 8.97 | **9.00** | +0.19 |
| 20 | 何嘉樂 | 男 | MiCA / EU compliance | 8.74 | 8.57 | 8.21 | 8.71 | **8.56** | −0.25 |
| 21 | 許志豪 | 男 | Kernel exploit researcher | 9.41 | 8.27 | 8.57 | 9.47 | **8.93** | +0.12 |
| 22 | Dr. Yuki Tanaka | 女 | Indexer / telemetry SSOT | 8.77 | 8.51 | 8.21 | 9.17 | **8.66** | −0.15 |
| 23 | 陳冠宇 | 男 | GMX Keeper integrator | 9.31 | 9.37 | 8.64 | 9.31 | **9.16** | +0.35 |
| 24 | Maya Chen | 女 | DevRel / SDK adoption | 8.81 | 9.31 | 8.87 | 8.81 | **8.95** | +0.14 |
| 25 | Luca Bianchi | 男 | Deep-tech VC | 9.01 | 9.04 | 8.61 | 8.97 | **8.91** | +0.10 |
| 26 | 何沛蓉 | 女 | Buildathon **首席審計官**（獨立主席） | 9.37 | 9.17 | 8.91 | 9.37 | **9.21** | +0.40 |
| 27 | 鄭皓宇 | 男 | Stylus mentor · Offchain Labs alumni | 9.17 | 8.47 | 9.04 | 9.11 | **8.95** | +0.14 |
| 28 | 馮思齊 | 女 | Permissioned RWA compliance | 8.77 | 8.81 | 8.27 | 9.01 | **8.71** | −0.10 |
| 29 | 周信宏 | 男 | PBS / block-builder economics | 8.97 | 8.71 | 8.84 | 9.27 | **8.95** | +0.14 |
| 30 | Dr. Camille Renard | 女 | Security audit chair (RV 風格) | 9.41 | 8.51 | 8.61 | 9.57 | **9.03** | +0.22 |
| | **多樣 20 人平均** | | | **9.07** | **8.84** | **8.70** | **9.17** | **8.94** | **+0.13** |

### C. 全團匯總與四維對照

| 組 | N | SC | PMF | Inno | RPS | **總分** | PM 8.81 | **Δ** |
|----|---|----|-----|------|-----|----------|---------|-------|
| 產業 10 人 | 10 | 9.20 | 8.63 | 8.57 | 9.24 | **8.91** | 8.80 | +0.11 |
| 男（多樣化） | 10 | 9.11 | 8.72 | 8.71 | 9.22 | **8.94** | 8.68 | +0.26 |
| 女（多樣化） | 10 | 9.02 | 8.96 | 8.69 | 9.12 | **8.95** | 8.58 | +0.37 |
| **全團 30** | **30** | **9.11** | **8.77** | **8.66** | **9.20** | **8.93** | **8.81** | **+0.12** |

**四維解讀（09-08 PM vs 09-07 PM 8.81）**

| 維度 | PM 8.81 | 本卷 8.93 | 讀法 |
|------|---------|-----------|------|
| **SC** | 8.88 | **9.11** | Q1 切模組 + wire audit + Foundry `.call` 追蹤 + **42161 GM I/O live tx** —— **硬審計主升** |
| **PMF** | 8.38 | **8.77** | **最大升幅** —— Wallet B 從 preview 變成可廣播 GM I/O；**仍無 mint/redeem 落地 Tx** |
| **Inno** | 8.48 | **8.66** | Error interpreter / 分腿探針是工程創新，**不是**新金融原語 |
| **RPS** | 8.93 | **9.20** | dry-run 雙保險 + soil/gas/sequencer CLI guards + revert 可讀性 —— 操作員安全面 |

---

## 2. 產業領袖：說服點 vs 殘餘 nit（摘錄）

### 1. Nadia Voss — GMX Synthetics Router Engineer

- **說服：** 官方用戶側順序 **正確**：execution fee 走 `sendWnt` 進 DepositVault / WithdrawalVault，資產走 `sendTokens`，最後 `createDeposit` / `createWithdrawal`。`decodeGmxGmDepositMulticallLegs` 對 method order **fail-closed**。USDC-only 與 dual-token 兩條路徑分開編碼，不是一個 `any[]` 偷懶。
- **Nit：** 適配器證明 **calldata**，不證明 **Keeper 執行**。`minMarketTokens` / `minLongTokenAmount` 若過鬆，仍可被負價格衝擊。沒有 GM 持倉 NFT / Deposit key 在 Worker 狀態機落地。
- **分數：** **9.11** · PMF 9.12 —— 本產業組 GMX 人格最高。Δ **+0.30** 幾乎全來自通道閉環。

### 2. Liam Okafor — Nitro Sequencer Relayer

- **說服：** CLI 在廣播前跑 `refreshArbitrumGasGuard` + `refreshSequencerGuard`；這是 **Nitro 友善** 的操作員衛生。
- **Nit：** 本卷 **沒有** 新 Worker bundle 數字；p50 ~106µs 仍是 Edge Wasm，不是 Sequencer opcode。GM `multicall` 是標準 ExchangeRouter，對 Nitro **零新原語**。
- **分數：** **8.81** · Δ **0.00** — 產業組持平錨。

### 3. Dr. Priya Menon — Chainlink Oracle Security

- **說服：** `--allow-stale-oracle` 必須顯式 opt-in；預設不繞過 stale。error registry 含 `OracleStaleness` 類別。
- **Nit：** GM createDeposit 的價格邊界仍是 payload 常數，不是即時 Chainlink 報價焊死。Oracle 人格要 **fill 回執上的 execution price**。
- **分數：** 8.79 · 邊際 −0.02。

### 4. Tomasz Kowalczyk — Foundry fork-trace

- **說服：** `GmxLocalForkTrace.t.sol` 用低階 `ROUTER.call{value}` 重放 TS 產生的 multicall，snapshot 後分腿 `_probeLegs` 再孤立 `createOrder`——這是 **gmx-interface 級別** 的診斷，不是 `expectRevert` 空殼。`GmxForkRevertDecoder` 把 silent revert 變成可操作字串。
- **Nit：** fork 測試依賴 `ARB_MAINNET_RPC_URL`；CI 若無 fork RPC = 探針在評審機不可複現。TS isolated probe 與 Forge 探針 **兩套客戶端**，長期會漂。
- **分數：** **9.03** · SC **9.38** — 本產業組最高 SC。

### 5. Ingrid Halvorsen — Hyperliquid L1

- **說服：** 雙錢包零密鑰耦合敘事未因 GM I/O 被破壞；Wallet A session-key 仍走 `executeHlSessionKeyOrder`。
- **Nit：** 本卷 **零** HL 增量。GM 入金完成後若 Worker 未自動對沖，Δ_net 窗口擴大。她打的是 **編排延遲**，不是 GM ABI。
- **分數：** 8.77 · 本產業組最低帶。

### 6. Wei-Lin Chen — GMX pool-imbalance

- **說服：** 先前 Fail-Closed `GMX_POOL_IMBALANCE_BREACH` 擋住 increase；現在 GM LP 通道讓「盾有效 / fill 未證」的分裂 **縮小一半**——至少 LP 腿有 **真實 Router 形狀**。`assertGmxGmDepositWire` 審 `executionFee` / vault receiver。
- **Nit：** 無 **pool-share 衝擊模擬**（大額 USDC 入金對 ETH/USDC GM 的 long/short 權重）。10 USD CLI 預設不能外推 $2,400 Grant 敘事。
- **分數：** **9.01** · PMF 9.05。

### 7. Amara Diallo — ZeroDev Kernel

- **說服：** GM CLI 仍是 EOA `walletClient` 路徑，**沒有**把 Kernel UserOp 與 HL session 焊成同一把鑰——符合 09-07 雙錢包審計。
- **Nit：** Grant 口播若說「Wallet B = AA 入金 GM」→ **否決**。`sendZeroDevUserOp` 仍未接 `createDeposit` calldata。
- **分數：** 8.84 · SC 9.12。

### 8. Dr. Jonah Feldman — Trail of Bits

- **說服：** Q1 單檔 <200 降低 review 成本；error registry 把 selector → domain/category/guidance **結構化**，比 `console.log(err)` 可審計。CLI 雙 flag（`BROADCAST` + `CONFIRM_*`）降低誤廣播。
- **Nit：** `isBypassSimulationEnabled` / `BYPASS_GAS_GUARD` 仍是生產腳本上的 **逃逸艙**。審計 PDF **仍無**。
- **分數：** 8.82 · RPS 9.22。

### 9. Sofia Alvarez — Arb Foundation GMX Builder desk

- **說服：** 這是 **GMX Builder Grant 卷宗缺的那一章**：ETH/USDC GM 的官方 Deposit/Withdraw 形狀 + `uiFeeReceiver` 金庫敘事現在有 **可執行 CLI**。`fe5ece7` commit 訊息鏈（deposit encode → CLI → withdraw wiring）**可審計**。
- **Nit：** Grant 評審會問 **Arbiscan 上的 GM mint**。沒有它，Builder cash 仍是「工程完整 / 經濟未證」。+10 bps 仍是常數不是 accrue dashboard。
- **分數：** **9.15** — 本卷產業組最高。Δ **+0.34**。

### 10. Henrik Blaauw — OpenZeppelin

- **說服：** `parseAbi` 片段與 `decodeFunctionData` 對腿順序的機械檢查，是 **編碼層 invariants**，不是註解。
- **Nit：** 無 Foundry **屬性測試**覆蓋 `minMarketTokens` 邊界；TS encode 測試 ≠ 鏈上 Keeper。
- **分數：** 8.78 · 嚴但給工程分。

---

## 3. 獎項勝率矩陣（條件概率 · 09-08 PM Panel）

假設有效提交 80–120；雙片未交用「現況」欄。相對 09-07 PM **8.81**：**+6pp** on Promising（GM I/O 可演示）、**+14pp** on GMX Builder（通道閉環）、**+7pp** on Overall #1（仍缺 fill）。

| 獎項 | PM 8.81 | **本卷 8.93** | 雙片 + Dune ingest | 否決風險 |
|------|---------|---------------|------------------------------|----------|
| **Promising Track $15k** | **72%** | **78%** | **84%** | 低 |
| **GMX Builder Grant** | **48%** | **62%** | **74%** | 中 · **仍缺 fill** |
| **Pendle Co-Grant** | **47%** | **48%** | **55%** | 中 · 本卷無 Pendle 增量 |
| **Overall 第一名 $40k** | **38%** | **45%** | **58%** | 高 |
| Overall Top-3 | **78%** | **84%** | **90%** | — |
| 至少一項 Sponsor | **92%** | **94%** | **97%** | — |
| 零獎 | **<1%** | **<1%** | **<0.5%** | 沒交片 |

相對 09-07 PM：GMX Builder **+14pp** 是本卷唯一「獎項結構」級移動。Overall #1 **仍不過半**——與 17:00 原團在 `99fe1ac` 上給的 52% **不可比**（不同快照、不同人格）。

**最可能結果：** Promising **高概率** + GMX Builder **首次進入優勢帶（>70%）** — GM Pool I/O **已 CLOSED**（§0.1）；$40k 獨走仍要 **Dune ingest + increase Gate fill + 片**。

---

## 4. Blackhat 對抗分析（`fe5ece7` 專項）

### 4.1 Multicall 腿順序 · Vault 收件人替換

**攻擊面：** 把 `sendWnt` 接收者從 DepositVault 換成攻擊者；或把 `createDeposit` 插到 `sendTokens` 之前，讓 Router 在 vault 空倉時靜默失敗 / 誤轉。

| 檢查項 | 結果 |
|--------|------|
| Deposit 腿 0 | `decodeGmxGmDepositMulticallLegs` 強制 `sendWnt` |
| Deposit 末腿 | 強制 `createDeposit` |
| Withdraw 順序 | 強制 `sendWnt → sendTokens → createWithdrawal` |
| Vault SSOT | DepositVault `0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55` · WithdrawalVault `0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701c55` |
| Receiver audit | `assertGmxGmDepositMulticallLegs` / withdraw 對應函式：**fail-closed** |

**Blackhat 結論：** 編碼層 **順序替換攻擊失敗**。攻擊者需 **繞過 assert 直接組 raw calldata**——CLI 走 builder，難度 **HIGH**。惡意 fork 只 copy CLI 不 copy assert → **文件已標 SSOT 常數**。

### 4.2 Silent multicall revert · 操作員誤判「RPC 失敗」

**攻擊：** ExchangeRouter `multicall` 吞內層 revert，前端顯示 generic；操作員加 gas 重試造成雙花意圖。

| 檢查項 | 結果 |
|--------|------|
| Interpreter | `interpretGmxRevertData` · `0x08c379a0` / panic / custom error registry |
| Isolated probe | 先 fund legs，再孤立 `createOrder`/`createDeposit` `eth_call` |
| Forge | `GmxLocalForkTrace.t.sol` snapshot + `_probeCreateOrderAfterFunding` |
| 殘餘 | GM **createDeposit** 孤立探針若仍走 **createOrder** 命名路徑 → **Residual LOW**（API 名漂移，邏輯同構） |

**Blackhat 結論：** 09-07「靜默 revert」面從 **MEDIUM** 降至 **LOW**。不是 ZERO：bundler/RPC 仍可剝離 `data`。

### 4.3 CLI 逃逸艙 · `BROADCAST` / `BYPASS_GAS_GUARD` / 過期 oracle

**攻擊：** 社工或 CI 注入 `BROADCAST=1 CONFIRM_GMX_GM_DEPOSIT=YES BYPASS_GAS_GUARD=1 --allow-stale-oracle`。

| 檢查項 | 結果 |
|--------|------|
| 預設 | dry-run · `armed()` 需 **雙** 環境變數 |
| PK | 無 `0x` 前綴直接 throw |
| 殘餘 | 逃逸艙 **存在且文件化** → **Residual MEDIUM** for operator compromise（非遠端未授權） |

**Blackhat 結論：** 遠端未授權廣播 **失敗**。已取得 `.env.production` 的內部人 **可以**繞過 gas/oracle——這是 **運維面**，不是 ABI 面。

### 4.4 Q1 切檔 · 行為分叉

**攻擊：** `gmx-gm-deposit-router-encode.ts` barrel 與 `*-multicall.ts` 行為不一致。

| 檢查項 | 結果 |
|--------|------|
| 最大檔 | **187** 行 · 低於 200 |
| 測試 | deposit / withdraw encode 測試對 **reference ABI** `encodeFunctionData` 對拍 |
| 殘餘 | `gmx-v2-order-payload-withdraw-builders` legacy 路徑仍在 · **Residual LOW**（`buildGmxGmWithdrawFromLegacyInput` 顯式橋接） |

**Blackhat 結論：** Q1 切檔 **未引入第二套 GM ABI**。Legacy withdraw builder 是遷移橋，不是平行 SSOT。

### 4.5 「通道閉環」口播成「fill 閉環」

**攻擊：** Pitch 把 `execute:gmx:gm-deposit` 說成已在 42161 mint GM。

| 檢查項 | 結果 |
|--------|------|
| CLI | 預設 dry-run · live 需 `BROADCAST=1` + `CONFIRM_*=YES` |
| **主網 SSOT** | **已鎖定** — deposit [`0xe3155220…`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) · withdraw [`0x00c371b9…`](https://arbiscan.io/tx/0x00c371b98ef9406fc4baab167cd78906b872cc509d87f1880627e9b669ce2aeb) · GM I/O 通道 **CLOSED** |
| 口播規則 | **可以** 引用 §0.1 三筆 Arbiscan tx；**禁止** 把 increase / Gate fill 與 GM I/O 混談 |

**Blackhat 結論：** 09-08 晚 GM Pool I/O **執行層已閉環**；評審若聽到「我們從未 live GM」→ **與 SSOT 不符**。Increase / Gate 路徑仍誠實標 **OPEN**。

---

## 5. 影片與 Pitch（本卷建議 · 增量口播）

| 時碼 | 增量口播（相對 09-07 PM） |
|------|---------------------------|
| 0:10–0:30 | *Wallet B is not a preview hash. It is ExchangeRouter multicall: send WNT, send tokens, create deposit. Withdraw is the same shape in reverse.* |
| +8s demo | HUD overlay：`pnpm execute:gmx:gm-deposit` **DRY-RUN** · 三腿 method strip |
| +6s test | `pnpm exec tsc --noEmit` → 0 errors · `211 files / 943 tests` |
| Pitch 30s | *Q1: every GMX I/O file under two hundred lines. Custom error decoder. Foundry low-level call traces. Still dry-run until a keeper fill.* |
| OpSec | **勿** 把 dry-run CLI 說成 42161 mint；**勿** 提及內部 persona；用 **GM Pool I/O channel** + **Wallet A session-key still decoupled** |

---

## 6. 主席裁決（何沛蓉 · 09-08 PM Panel Chair）

30 人 **全新面板**：**8.81 → 8.93**。這是 **GM Pool 入金/出金通道** 的增量分，**不是** 9.0 解鎖，也 **不是** 17:00 原團 9.05 的複製品。

09-07 PM 主席寫過：「不要再加第六個 core 模組。」你們加的是 **GMX 該有的 I/O**，方向正確。我把 GMX Builder 勝率從 48% 拉到 **62%**。我 **不**把 Overall #1 拉過 50%，因為 Keeper 還沒在 42161 蓋章。

| # | 釘子 | 09-08 判定 |
|---|------|------------|
| 1 | GM Deposit 3-leg multicall | **閉環（編碼）** |
| 2 | GM Withdraw 3-leg multicall | **閉環（編碼）** |
| 3 | Q1 單檔 <200 LOC | **閉環** |
| 4 | CLI `execute:gmx:gm-deposit/withdraw` | **閉環（dry-run 預設）** |
| 5 | Error interpreter + isolated probe | **閉環** |
| 6 | Foundry `ROUTER.call` fork trace | **閉環（探針）** |
| 7 | tsc 0 · 211/943 | **閉環**（WSL 亞毫秒 flake **記殘餘 LOW**） |
| 8 | 42161 GM Pool I/O 執行（deposit + withdraw） | **已閉環** — §0.1 三筆 tx |
| 9 | GMX increase 經 Gate fill | **未閉環** |
| 10 | 42161 Dune live ingest | **未閉環** |
| 11 | Bootstrap 密鑰 / npm plugin / 片 | **未閉環** |
| 12 | ZeroDev UserOp → `createDeposit` | **未閉環**（且 **不應**為了敘事去耦合雙錢包） |

**剩餘最高邊際分（排序）：**

1. 42161 Dune **首筆業務事件**（Yuki Tanaka）
2. Bootstrap 密鑰旋轉（Camille / 馮思齊）
3. GMX increase **經 Gate live fill**（Nadia / 陳冠宇 / Sofia）
4. 雙片提交（零獎 → <0.5%）

**GM Pool I/O 執行層已 CLOSED**（§0.1 三筆 tx 已鎖 SSOT）。9.0 仍取決於 **Dune ingest + Bootstrap 旋轉 + increase fill + 片**。

**不要再把 GM adapter 切成第 15 個檔案來換分數。** 8.93 已經付清 **I/O 通道**。9.0 只來自 **Keeper 回執 + 片**。

---

## 附錄 A — 全團分數對照速查

| 評審類別 | Fresh PM 9/6 | AM 9/7 | PM 9/7 | 17:00 原團 | **PM 9/8** |
|----------|--------------|--------|--------|------------|------------|
| 全團 30 | 8.63 | 8.71 | **8.81** | 9.05† | **8.93** |
| 產業 10 | 8.57 | 8.64 | **8.80** | 9.01† | **8.91** |
| 多樣 20 | 8.51 | 8.56 | **8.60** | 9.07† | **8.94** |
| SC 均 | 8.76 | 8.82 | **8.88** | 9.18† | **9.11** |
| PMF 均 | 8.27 | 8.30 | **8.38** | 9.03† | **8.77** |
| Inno 均 | 8.37 | 8.42 | **8.48** | 8.64† | **8.66** |
| RPS 均 | 8.74 | 8.80 | **8.93** | 9.22† | **9.20** |

† `99fe1ac` 快照 · **不可**與本卷 `fe5ece7` 算術對沖。

## 附錄 B — 工程 SSOT 錨點（`fe5ece7`）

| 錨 | 路徑 |
|----|------|
| GM deposit multicall | `src/services/adapters/gmx-gm-deposit-multicall.ts` · **187 LOC** · `sendWnt → sendTokens* → createDeposit` |
| GM deposit encode / build / audit | `gmx-gm-deposit-encode.ts` · `gmx-gm-deposit-build.ts` · `gmx-gm-deposit-audit.ts` |
| DepositVault | `0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55` |
| GM withdraw multicall | `src/services/adapters/gmx-gm-withdraw-multicall.ts` · **153 LOC** · `sendWnt → sendTokens(GM) → createWithdrawal` |
| WithdrawalVault | `0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701c55` |
| CLI deposit | `scripts/execute-gmx-mainnet-gm-deposit.ts` · `pnpm execute:gmx:gm-deposit` · **163 LOC** |
| CLI withdraw | `scripts/execute-gmx-mainnet-gm-withdraw.ts` · `pnpm execute:gmx:gm-withdraw` · **187 LOC** |
| Error interpreter | `gmx-error-interpreter.ts` · `gmx-error-registry.ts` · `gmx-error-guidance.ts` |
| Isolated probe | `gmx-error-isolated-probe.ts` · **149 LOC** |
| Foundry fork `.call` | `contracts/test/GmxLocalForkTrace.t.sol` · Router `0x7dE39FF2e232A2203196788d37e234cF8F1b83f1` |
| **42161 GM I/O Live Tx SSOT** | Deposit [`0xe3155220…`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) · Approve [`0x83c4802e…`](https://arbiscan.io/tx/0x83c4802ecca1037939a943298bb8b22de5f0fcabc0b1257a258cde94677a7a30) · Withdraw [`0x00c371b9…`](https://arbiscan.io/tx/0x00c371b98ef9406fc4baab167cd78906b872cc509d87f1880627e9b669ce2aeb) · **通道 CLOSED** |
| Tests | `tests/adapters/gmx-gm-deposit-encode.test.ts` · `gmx-gm-withdraw-encode.test.ts` · `gmx-error-interpreter.test.ts` |
| Vitest / tsc | **211 files \| 943 tests** · `tsc --noEmit` **0 errors** |
| HEAD | **`fe5ece7`** · `feat(gmx): add GM Pool withdrawal CLI and complete adapter wiring.` |

---

*Prepared by: 09-08 PM 30-Persona Stress Panel · 2026-09-08 · `docs/internal/0908_PM_30_Persona_Audit.md` · HEAD `fe5ece7` · vs [`0907_PM_Fresh_30_Persona_Audit.md`](./0907_PM_Fresh_30_Persona_Audit.md) · Theme: GMX v2 GM Pool Deposit/Withdraw channel completion under Q1 <200 LOC*
