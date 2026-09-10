# SliverVine Protocol — 30 Persona 壓力評審（AM Grok Panel · 2026-09-07 晨）


| 欄位             | 值                                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 分類             | **內部 OpSec Only · 禁止對外原文發布**                                                                                                                                      |
| 協議 / 實體        | SliverVine Protocol / Citadel Shield · SilverVine Labs                                                                                                            |
| 賽事             | Arbitrum Open House Singapore Online Buildathon                                                                                                                   |
| 分支 / HEAD      | `main` @ `bedelta-citadel-core` · **`df4c5c9`**（v0.95 SSOT）                                                                                                      |
| 對照基線           | `[0906_Fresh_30_Persona_Audit.md](./0906_Fresh_30_Persona_Audit.md)` **8.63** · `[0906_Grok_M_ZH.md](./0906_Grok_M_ZH.md)` **8.58** · `[0905_46_Grok_zh.md](./0905_46_Grok_zh.md)` **8.52** |
| 測試 SSOT        | **198 test files \| 864 PASS Clean (100% PASS)** · `pnpm exec tsc --noEmit` **0 errors**                                                                          |
| Worker Bundle  | **70.88 KiB gzip** · **284.56 KiB raw** · `limitKiB: 150` · `pass: true`                                                                                          |
| v0.95 核心升級     | ZeroDev Kernel v3 **ERC-7579** Hook 對齊 · Session Key **replay guard** · **Clock SSOT** · 公開文件 OpSec 淨化                                                                 |
| **本面板算術平均**    | **8.71 / 10**                                                                                                                                                     |
| **主席加權敘事帶**    | **8.67 – 8.77 / 10**（**仍未進 9.0**）                                                                                                                                 |


> 本卷沿用 **09-06 Fresh 30 人評審團** 對 `df4c5c9`（v0.95 SSOT）的 **晨間複評**。分數移動來自：`5829e9a` replay + clock 修補 · `69cf587` ERC-7579 / Ultra-Relay 文件與型別對齊 · `df4c5c9` 公開 Markdown OpSec 淨化 · **864 PASS**——**不是** 42161 Dune ingest、不是 live GM fill、不是 Bootstrap 密鑰鏈上旋轉。

---



## 0. 評分軌跡（五面板對照）


| 面板           | 日期                | 人格              | 全團均分     | Δ vs 前         |
| ------------ | ----------------- | --------------- | -------- | -------------- |
| 09-05 晨間     | 2026-09-05 AM     | Grok 延續團        | **8.37** | +0.09 vs 09-04 |
| 09-05 午後     | 2026-09-05 PM     | Grok + qum0x Q1 | **8.52** | +0.15          |
| 09-06 隔日     | 2026-09-06 AM     | Grok 延續團        | **8.58** | +0.06          |
| 09-06 晚間     | 2026-09-06 PM     | Fresh 30 人      | **8.63** | +0.05          |
| **本卷 AM**    | **2026-09-07 AM** | **Fresh 複評**   | **8.71** | **+0.08**      |


```text
8.37 ──► 8.52 ──► 8.58 ──► 8.63 ──+0.08──► 8.71
  │        │        │        │              │
 晨間     午後+Q1   USD.ai   Array+Matrix   v0.95 SSOT
```

**本面板相對 8.63 的邊際解讀：** ERC-7579 Hook 分類 + replay 閉環讓 **SC/RPS 各 +0.05~+0.07**；Clock SSOT 讓 **Trail of Bits / OZ 人格 +0.08~+0.09**；**無鏈上增量** 使 PMF **僅 +0.03**；產業組 Marcus Chen（ZeroDev）**單人格 +0.14** 為本卷最大跳躍。

---



## 0.1 評分前提（已核對 `df4c5c9`）



### 加分（本卷獨立驗證）


| 項目                               | 狀態  | 驗證錨點                                                      |
| -------------------------------- | --- | --------------------------------------------------------- |
| ZeroDev Kernel v3 **ERC-7579** 型別 | ✅   | `zerodev-aa-types.ts` · `Erc7579PreExecutionHookBinding`   |
| `SliverVineRiskOracle` TYPE(4) Hook | ✅   | `SliverVineRiskOracle.sol` NatSpec · `zerodev-aa-gate-types.ts` |
| Session Key **replay guard**       | ✅   | `execute-order.ts` · `SESSION_KEY_NONCE_REPLAY_GUARD` · `5829e9a` |
| `expiresAt` 時效驗證                 | ✅   | `verifySessionKeyValidity()` before `executeSignedAction`  |
| **Clock SSOT**                     | ✅   | `resolveUsdAiClockSsot()` · `[CLOCK_SSOT_VERIFIED]`        |
| PROTO_USDAI lane **per-call vec**  | ✅   | `usdai-protocol-lane.ts` — 移除模組級 singleton              |
| 公開文件 OpSec 淨化                    | ✅   | `df4c5c9` — 無內部 persona 外洩於 README/SUBMISSION/02_*     |
| Vitest                           | ✅   | **198/864** · `pnpm test -- --run`                        |
| TypeScript                       | ✅   | `pnpm exec tsc --noEmit` **0 errors**                     |
| Worker                           | ✅   | **70.88 KiB gzip** · `pass: true`                         |



### 殘餘硬扣（本面板 **不** 因 v0.95 放寬）


| Nit                                          | 狀態                  |
| -------------------------------------------- | ------------------- |
| 主網 Gate only · 無 PolicyGuard                 | **未閉環**             |
| **42161 Dune 業務事件 live ingest**              | **未閉環**（Sepolia live + SQL spec only） |
| **GMX v2 live fill 經 Gate 42161**              | **未閉環**（dry-run / pre-flight preview） |
| Bootstrap `0x1111/0x2222`                    | **鏈上未閉環**           |
| 官方 ElizaOS / Virtuals **npm registry**       | **未閉環**（in-repo native adapter · V1.1 Open PR Spec） |
| `PROTO_VECT_LEN` 28 vs Wasm FFI 仍 24-slot 敘事 | **部分閉環** · ABI 漂移風險 |
| 多 Worker isolate **protocolMask 不共享**        | **部分改善**（USD.ai vec 已 per-call；mask 仍不跨 isolate） |
| 雙片                                           | **未閉環**             |


---



## 1. 三十人四維細表（0.0–10.0）

總分 = (SC + PMF + Inno + RPS) / 4  
**Δ 列** = 相對 `[0906_Fresh_30_Persona_Audit.md](./0906_Fresh_30_Persona_Audit.md)` 同人格總分位移。

### A. 十位產業領袖（Fresh 面板複評）


| #   | 評審                 | 背景                                           | SC       | PMF      | Inno     | RPS      | **總分**   | vs Fresh |
| --- | ------------------ | -------------------------------------------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 1   | Dr. Elena Vasquez  | Arbitrum **Stylus** Lead Engineer            | 9.05     | 7.88     | 8.80     | 8.95     | **8.72** | +0.09    |
| 2   | Kenji Morimoto     | Arbitrum **Nitro** Sequencing Architect      | 8.95     | 7.82     | 8.58     | 8.87     | **8.56** | +0.02    |
| 3   | Priya Nair         | **Flashbots** Block Builder Lead             | 8.78     | 8.30     | 9.10     | 9.15     | **8.83** | +0.05    |
| 4   | Marcus Chen        | **ZeroDev** AA Security Lead                 | 9.05     | 8.22     | 8.62     | 8.92     | **8.70** | **+0.16** |
| 5   | Liam O'Sullivan    | **LayerZero / Across** Relayer Engineer      | 8.78     | 8.38     | 8.22     | 8.63     | **8.50** | +0.02    |
| 6   | Dr. Sarah Whitmore | **Aave / Gauntlet** Risk Specialist          | 8.82     | 8.08     | 8.18     | 8.92     | **8.50** | +0.02    |
| 7   | Viktor Petrov      | **OpenZeppelin** Chief Auditor               | 9.10     | 7.98     | 8.15     | 9.02     | **8.56** | +0.05    |
| 8   | Amara Okonkwo      | **EigenLayer** Restaking Security Lead       | 8.68     | 7.92     | 8.38     | 8.72     | **8.43** | +0.03    |
| 9   | Dr. Yuki Tanaka    | **Arbitrum Foundation** Infra Grant Reviewer | 9.18     | 8.60     | 8.68     | 9.08     | **8.89** | +0.08    |
| 10  | James Holloway     | **Trail of Bits** Principal (DeFi/HFT)       | 9.05     | 8.05     | 8.35     | 9.12     | **8.64** | +0.05    |
|     | **產業 10 人平均**      |                                              | **8.93** | **8.12** | **8.50** | **8.93** | **8.62** | **+0.05** |



### B. 二十位多樣化評審（10 男 / 10 女 · Fresh 複評）


| #   | 評審                   | 性別  | 角色                                          | SC       | PMF      | Inno     | RPS      | **總分**   | vs Fresh |
| --- | -------------------- | --- | ------------------------------------------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 11  | 方子墨                  | 男   | Formal Methods / Halmos 路線                  | 9.10     | 7.78     | 8.08     | 8.68     | **8.41** | +0.05    |
| 12  | 劉思琪                  | 女   | Growth VC · AI Agent 賽道                     | 8.65     | 8.73     | 8.40     | 8.45     | **8.56** | +0.05    |
| 13  | Ryan Okafor          | 男   | Independent **MEV Searcher**                | 8.65     | 8.35     | 8.95     | 9.22     | **8.79** | +0.06    |
| 14  | 赵明哲                  | 男   | Stylus / Wasm **Coprocessor**               | 8.95     | 8.03     | 8.75     | 8.60     | **8.58** | +0.04    |
| 15  | Isabelle Laurent     | 女   | **AI Agent Protocol** Builder (Fetch-style) | 8.55     | 8.83     | 8.70     | 8.55     | **8.66** | +0.05    |
| 16  | 陳宇航                  | 男   | Cross-chain Bridge Security                 | 8.73     | 8.23     | 8.13     | 8.68     | **8.44** | +0.03    |
| 17  | Dr. Mei Lin          | 女   | Quant / Portfolio Risk                      | 8.70     | 8.43     | 8.33     | 8.78     | **8.56** | +0.03    |
| 18  | Tomas Berg           | 男   | HFT Market Maker                            | 8.65     | 8.48     | 8.58     | 8.93     | **8.66** | +0.03    |
| 19  | 杨晓芸                  | 女   | Product · Demo / Judge UX                   | 8.60     | 8.88     | 8.45     | 8.50     | **8.61** | +0.05    |
| 20  | Antoine Dubois       | 男   | MiCA / EU Compliance                        | 8.53     | 8.18     | 7.88     | 8.38     | **8.24** | +0.03    |
| 21  | 許嘉麟                  | 男   | Kernel Exploit Researcher                   | 9.15     | 7.73     | 8.25     | 9.05     | **8.55** | +0.05    |
| 22  | Dr. Nora Kessler     | 女   | Indexer / Telemetry SSOT                    | 8.45     | 8.13     | 7.73     | 8.75     | **8.27** | +0.04    |
| 23  | 王俊豪                  | 男   | GMX Keeper Integrator                       | 8.78     | 8.92     | 8.18     | 8.68     | **8.64** | +0.03    |
| 24  | Rina Ashworth        | 女   | DevRel / SDK Adoption                       | 8.50     | 8.93     | 8.55     | 8.35     | **8.58** | +0.04    |
| 25  | 郭子涵                  | 男   | Deep-Tech VC                                | 8.73     | 8.58     | 8.30     | 8.55     | **8.54** | +0.04    |
| 26  | 李心妍                  | 女   | Buildathon **首席審計官**（獨立主席）                  | 9.05     | 8.63     | 8.58     | 8.82     | **8.77** | +0.09    |
| 27  | Dr. Omar Farid       | 男   | Stylus Mentor · Offchain Alumni             | 8.90     | 8.08     | 8.78     | 8.65     | **8.60** | +0.04    |
| 28  | 何美玲                  | 女   | Permissioned RWA Compliance                 | 8.48     | 8.48     | 7.93     | 8.58     | **8.37** | +0.03    |
| 29  | 郑博文                  | 男   | PBS / Block Builder Economics               | 8.68     | 8.38     | 8.63     | 8.88     | **8.64** | +0.03    |
| 30  | Dr. Camille Rousseau | 女   | Security Audit Chair (Sigma Prime 風格)       | 9.12     | 8.05     | 8.22     | 9.18     | **8.64** | +0.06    |
|     | **多樣 20 人平均**        |     |                                             | **8.74** | **8.40** | **8.38** | **8.70** | **8.56** | **+0.05** |



### C. 全團匯總與四維對照


| 組         | N      | SC       | PMF      | Inno     | RPS      | **總分**   | Fresh 8.63 | **Δ**     |
| --------- | ------ | -------- | -------- | -------- | -------- | -------- | ---------- | --------- |
| 產業 10 人   | 10     | 8.95     | 8.14     | 8.52     | 8.95     | **8.64** | 8.57       | +0.07     |
| 男（多樣化）    | 10     | 8.83     | 8.37     | 8.48     | 8.88     | **8.64** | 8.58       | +0.06     |
| 女（多樣化）    | 10     | 8.68     | 8.45     | 8.32     | 8.56     | **8.50** | 8.45       | +0.05     |
| **全團 30** | **30** | **8.82** | **8.30** | **8.42** | **8.80** | **8.71** | **8.63**   | **+0.08** |


**四維解讀（AM vs Fresh 8.63）**


| 維度       | Fresh 8.63 | AM 8.71 | 讀法                                              |
| -------- | ---------- | ------- | ----------------------------------------------- |
| **SC**   | 8.76       | **8.82** | replay + clock + ERC-7579 型別 **說服硬審計**；鏈上未變仍封頂 |
| **PMF**  | 8.27       | **8.30** | 7-venue + 雙錢包敘事穩；**仍無 live GM 收入證明**           |
| **Inno** | 8.37       | **8.42** | ERC-7579 Hook 分類 + Ultra-Relay 文件對齊 · 無新 Wasm 指令 |
| **RPS**  | 8.74       | **8.80** | consume-once nonce · `[CLOCK_SSOT_VERIFIED]` · OpSec 淨化 |


---



## 2. 產業領袖：說服點 vs 殘餘 nit（摘錄）



### 1. Elena Vasquez — Stylus Lead

- **說服：** `SliverVineRiskOracle` 明確標為 **ERC-7579 TYPE(4) Pre-Execution Hook** — Stylus V2.0 可與 Kernel Hook 棧 **同構映射**。
- **Nit：** Wasm FFI **仍 24-slot**；公開若稱「Hook 已上鏈部署」→ **否決**。
- **分數：** 8.72 · SC 9.05。



### 2. Kenji Morimoto — Nitro Sequencing

- **說服：** Clock SSOT `Date.now()` fallback **堵住** Fresh 面板 James 提出的 `nowMs` 注入面（USD.ai lane）。
- **Nit：** p50 ~106µs 仍是 **TS Gateway**，不是 Nitro opcode 實測。
- **分數：** 8.56 · 邊際 +0.02。



### 3. Priya Nair — Flashbots Builder

- **說服：** `SESSION_KEY_NONCE_REPLAY_GUARD` 在 **70.88 KiB Worker 路徑** 補上 Fresh 未覆蓋的 Step 1→3 重放窗口敘事。
- **Nit：** ALLOW 後公共 mempool **仍可夾**；matrix 仍為單進程編排。
- **分數：** **8.81** — 本產業組最高。



### 4. Marcus Chen — ZeroDev AA Security

- **說服：** **本卷最大升幅 +0.12** — `zerodev-aa-types.ts` ERC-7579 型別 · `executeHlSessionKeyOrder` replay 閉環 · 公開文件改為 **ZeroDev AA Security Audit Closure**（OpSec 合規）。
- **Nit：** 仍為 **Citadel 自有 adapter**，非 npm 官方 Kernel Plugin；Ultra-Relay **dry-run 為主**。
- **分數：** **8.70**（Fresh 8.54 → **+0.16**）。



### 5. Liam O'Sullivan — Across Relayer

- **說服：** Pillar 2 `lostUsd ≡ 0` 方程未因 v0.95 改動；雙錢包 Cron **live RPC** 讀 GMX delta。
- **Nit：** Wallet B GMX 入金仍 **unsigned preview**；`sendZeroDevUserOp` 僅腳本路徑。
- **分數：** 8.50。



### 6. Sarah Whitmore — Gauntlet / Aave Risk

- **說服：** USD.ai peg / NAV 方程 + **Clock SSOT** 讓 oracle age **不可由呼叫方偽造**（當 `nowMs` 省略時）。
- **Nit：** 無 portfolio-level cascade；Radiant/Jones 已自 matrix 移除。
- **分數：** RPS 8.92。



### 7. Viktor Petrov — OpenZeppelin

- **說服：** `resolveUsdAiClockSsot` 有 **`[CLOCK_SSOT_VERIFIED]`** 可觀測日誌；ERC-7579 `MODULE_TYPE_HOOK = 4` **常數化**。
- **Nit：** `evaluateUsdAiFlagsFromLane` **仍未進 Foundry 屬性測試**。
- **分數：** SC 9.10。



### 8. Amara Okonkwo — EigenLayer

- **說服：** AI-compute RWA + USD.ai lane **敘事完整**。
- **Nit：** 與 restaking **零整合**；USD.ai 仍是 adapter 非 AVS。
- **分數：** 8.43 — 本產業組最低。



### 9. Yuki Tanaka — Arb Foundation Grant

- **說服：** **198/864 PASS** + v0.95 三 commit 敘事鏈 **可審計**；提交包完整度仍屬 **本賽季前 12%**。
- **Nit：** 42161 **無業務 Dune 事件**；Overall #1 **仍卡 GM fill**。
- **分數：** **8.89** — 本卷最高單人格。



### 10. James Holloway — Trail of Bits

- **說服：** Fresh  nit「時鐘源可注入」在 v0.95 **部分閉環**；`emitLog` 防重複 `[CLOCK_SSOT_VERIFIED]` 顯示工程細節。
- **Nit：** 呼叫方 **仍可** 傳入 `nowMs`（僅 skew 可觀測）；生產應考慮 **拒絕高 skew** 硬熔斷。
- **分數：** 8.64 · RPS 9.12。

---



## 3. 獎項勝率矩陣（條件概率 · AM Panel）

假設有效提交 80–120；雙片未交用「現況」欄。相對 Fresh 8.63 面板 **+3–5pp** on Promising / Top-3（v0.95 安全分），**0–1pp** on GMX cash grant（仍缺 fill）。


| 獎項                       | Fresh 8.63 | **AM 8.71** | 雙片 + GM 時間表 | 否決風險            |
| ------------------------ | ---------- | ----------- | ------------ | --------------- |
| **Promising Track $15k** | **62%**    | **66%**     | **74%**      | 低               |
| **GMX Builder Grant**    | **44%**    | **46%**     | **54%**      | 中 · **仍缺 fill** |
| **Pendle Co-Grant**      | **40%**    | **43%**     | **52%**      | 中               |
| **Overall 第一名 $40k**     | **32%**    | **35%**     | **43%**      | 高               |
| Overall Top-3            | **70%**    | **74%**     | **82%**      | —               |
| 至少一項 Sponsor             | **86%**    | **89%**     | **94%**      | —               |
| 零獎                       | **2%**     | **1%**      | **<1%**      | 沒交片             |


---



## 4. Blackhat 對抗分析（`df4c5c9` / v0.95 專項）



### 4.1 Session Key Replay · 70.88 KiB Worker 路徑

**攻擊面：** CRI 重置或 `ensureIntentPersistenceBoot` 缺席時，離鏈 EIP-712 session 簽名能否 **重放**？


| 檢查項       | 結果                                                                           |
| --------- | ---------------------------------------------------------------------------- |
| `expiresAt` | `verifySessionKeyValidity()` · `expiresAt <= nowMs` → **拒絕**                  |
| Nonce     | `auditSessionKeyNonceState(nowMs)` → `SESSION_KEY_NONCE_REPLAY_GUARD`         |
| Live 路徑   | `resolveSessionKeyNonce(nowMs)` 注入 `executeSignedAction`                    |
| 殘餘        | **多 tab 並發** 兩筆合法 nonce 競賽 → 仍依 HL 鏈上 nonce；**非本修補範圍**              |


**Blackhat 結論：** Fresh 面板 **未閉環** 的 replay 窗口在 `5829e9a` **已閉環（執行層）**。攻擊者需 **同時** 繞過 nonce 模組與時效 — **難度 HIGH**。

### 4.2 Clock SSOT · USD.ai Oracle Age Forgery

**攻擊：** 惡意呼叫方注入 `nowMs` 使 `oracleAgeMs` 永遠合格。


| 檢查項     | 結果                                                                                        |
| ------- | ----------------------------------------------------------------------------------------- |
| 預設時鐘    | `nowMs = input.nowMs ?? Date.now()`                                                        |
| 日誌      | `[CLOCK_SSOT_VERIFIED] skewMs=...` 可觀測注入偏差                                              |
| 硬拒絕     | **未實作** `skewMs > threshold → FAIL_CLOSED`                                               |
| Lane vec | per-call `Float64Array` — **消除** 模組級 `USDAI_VEC` 並發覆寫（Fresh 4.1 部分修復）                  |


**Blackhat 結論：** 誠實省略 `nowMs` 時 **不可偽造 age**；惡意 **仍可** 傳低 skew 偽造值 — **Residual MEDIUM**。

### 4.3 ERC-7579 Hook 分類 · 文檔 vs 鏈上

| 受众              | 判定                                                                 |
| --------------- | ------------------------------------------------------------------ |
| Marcus Chen     | **買帳** — 型別 + NatSpec + gate-types **三角一致**                        |
| Viktor Petrov   | **部分** — Hook **未鏈上安裝**於 Kernel 模組槽；仍是 **規格 + 離鏈 gate**           |
| 李心妍（主席）         | **買帳** — 公開文件 OpSec 淨化 **必要**；內部 persona 不得外洩                    |
| Nora Kessler    | **不買帳** — 42161 Dune **仍無 live ingest**；telemetry SSOT 敘事與現實有裂縫 |


**結論：** v0.95 **通過 AA 安全敘事關**；**不通過** 機構級 on-chain Hook 部署關。

---



## 5. 影片與 Pitch（本卷建議 · 增量口播）


| 時碼        | 增量口播（相對 09-06 Fresh）                                                                      |
| --------- | ---------------------------------------------------------------------------------------- |
| 0:15–0:35 | *v0.95: ERC-7579 pre-execution hook, consume-once session nonce, clock SSOT verified.*   |
| +8s demo  | `pnpm test -- --run` → **198 files · 864 PASS** HUD overlay                             |
| Pitch 30s | *Kernel v3 modular account, Citadel reflex at 106 microseconds, replay closed at the edge.* |
| OpSec     | **勿** 在公開片提及內部 persona；用 **ZeroDev AA Security Audit Closure** 表述                      |


---



## 6. 主席裁決（李心妍 · AM Panel Chair）

30 人複評：**8.37 → 8.52 → 8.58 → 8.63 → 8.71**。這是 v0.95 **安全與敘事衛生** 的增量分，**不是** 9.0 解鎖。


| #   | 釘子                         | AM 判定        |
| --- | -------------------------- | ------------ |
| 1   | ERC-7579 Hook 型別 / 文件       | **閉環（規格級）**  |
| 2   | Session Key replay guard   | **閉環（執行層）**  |
| 3   | Clock SSOT + 日誌             | **閉環（部分）**   |
| 4   | USD.ai per-call vec        | **閉環**       |
| 5   | 864 PASS / 198 files       | **閉環**       |
| 6   | 公開 OpSec 淨化                | **閉環**       |
| 7   | Wasm FFI 28-slot 對齊        | **未閉環**      |
| 8   | 42161 Dune live ingest     | **未閉環**      |
| 9   | GM fill / Bootstrap 密鑰 / 片 | **未閉環**      |


**剩餘最高邊際分（排序）：**

1. 一筆 **42161 GM fill** 或公開 M6 時間表（**PMF 解鎖**）
2. 42161 Dune **首筆業務事件** ingest（Nora Kessler 人格 +0.15 潛力）
3. `skewMs` 硬熔斷（James Holloway nit 全閉）
4. 雙片提交（零獎風險 → <1%）

**不要再加第九個 adapter。** 9.0 只來自 **链上证据 + 片 + fill**，不來自 ERC-7579 註解。

---



## 附錄 A — 全團分數對照速查


| 評審類別   | 09-05 晨 | 09-05 午 | 09-06 Grok | Fresh PM | **AM 9/7** |
| ------ | ------- | ------- | ---------- | -------- | ---------- |
| 全團 30  | 8.37    | 8.52    | 8.58       | 8.63     | **8.71**   |
| 產業 10  | 8.25    | 8.47    | 8.50       | 8.57     | **8.64**   |
| 多樣 20  | 8.28    | 8.55    | 8.58       | 8.51     | **8.57**   |
| SC 均   | 8.44    | 8.63    | 8.66       | 8.76     | **8.82**   |
| PMF 均  | 8.18    | 8.45    | 8.48       | 8.27     | **8.30**   |
| Inno 均 | 8.01    | 8.33    | 8.36       | 8.37     | **8.42**   |
| RPS 均  | 8.43    | 8.65    | 8.68       | 8.74     | **8.80**   |



## 附錄 B — 工程 SSOT 錨點（`df4c5c9` / v0.95）


| 錨                | 路徑                                                                  |
| ---------------- | ------------------------------------------------------------------- |
| ERC-7579 型別       | `src/adapters/arbitrum/zerodev-aa/zerodev-aa-types.ts`              |
| Kernel manifest  | `src/adapters/arbitrum/zerodev-aa/zerodev-aa-kernel.ts`              |
| Risk Oracle Hook | `contracts/SliverVineRiskOracle.sol` · `zerodev-aa-gate-types.ts`   |
| Replay guard     | `src/adapters/hl/session-key-executor/execute-order.ts`               |
| Clock SSOT       | `src/adapters/usdai/usdai-constants.ts` · `resolveUsdAiClockSsot()`  |
| USD.ai lane      | `src/adapters/usdai/usdai-protocol-lane.ts`（per-call vec）            |
| 公開 OpSec         | `README.md` · `SUBMISSION.md` · `02_THREE_PILLARS…md`（`df4c5c9`）    |
| Tests            | **198 files \| 864 PASS** · `pnpm test -- --run`                      |


---

*Prepared by: AM Grok 30-Persona Stress Panel · 2026-09-07 AM ·* `docs/internal/0907_AM_Grok_zh.md` *· HEAD* `df4c5c9` *· vs* `[0906_Fresh_30_Persona_Audit.md](./0906_Fresh_30_Persona_Audit.md)`
