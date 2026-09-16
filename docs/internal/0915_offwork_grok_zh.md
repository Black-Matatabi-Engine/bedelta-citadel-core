# SliverVine Protocol — 0915 下班 Grok 30人 Persona 獨立評審（CLI HUD 標準化與公開文檔收斂 · 2026-09-15 17:30 Off-Work Checkpoint）

| 欄位 | 值 |
|------|-----|
| **Checkpoint** | **2026-09-15 17:30 HKT（Off-Work Final Checkpoint）** |
| 分類 | **內部 OpSec Only · 禁止對外原文發布** |
| 協議 / 實體 | **SliverVine Protocol** v1.0 Santenmoku · SilverVine Labs |
| 賽事 | **Arbitrum Open House Singapore Online Buildathon** |
| **Submission Deadline** | **2026-10-01 23:59 SGT**（官方 T&C） |
| 分支 / HEAD | `main` @ **`a053bd4f`** · Phase-4 **CODEBASE_FREEZE Active**（`frozenAt: 2026-09-14`） |
| Codebase State | **Phase-4 CODEBASE_FREEZE Active** — [`CODEBASE_FREEZE.json`](../audit/CODEBASE_FREEZE.json) |
<!-- SSOT:GROK_HEADER_METRICS_START -->
| 測試 SSOT | **243 test files \| 1123 PASS clean (100%)** · `pnpm exec tsc --noEmit` **0 errors** |
| Bundle SSOT | **166.51 KiB raw · 58.72 KiB gzip**（Pass `< 150 KiB` Lean Warn Limit） |
| **SEPSB Telemetry SSOT** | **TPR 100% · FPR 0% · Observatory Mis-block 0** · Reflex p50 **0.233µs**（Wasm） · p99 **2.299µs** · `pnpm audit:sepsb` |
| **SEPSB 5-Venue Distribution** | **gmx (9)** · **hyperliquid (6)** · **pendle (7)** · **usdai (4)** · **variational (5)** — [`sepsb-stress-telemetry.csv`](../audit/sepsb-stress-telemetry.csv) |
| Quant Backtest SSOT | Tier 1 **3/3 FAIL_CLOSED** · Tier 2 **2/2** · Tier 3 **10,000 runs · 100% intercept** · Prevented **$1,326,412.79 USD**（simulated） |
| **Dual Dune Dashboards** | **Dashboard 1:** [`slivervine-protocol`](https://dune.com/silvervinelabs/slivervine-protocol) — Operational Shield · cumulative append · **Dashboard 2:** [`slivervine-sepsb-stress`](https://dune.com/silvervinelabs/slivervine-sepsb-stress) — SEPSB Quant Matrix & 5-Venue SLA |
| **On-Chain Indexer** | `pnpm export:dune:onchain` · Gate `0xb174…8BF1` · Status **INTERFACE_READY** |
<!-- SSOT:GROK_HEADER_METRICS_END -->
| 英文裁決 SSOT | [`README.md`](../../README.md) · [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md) · [`SUBMISSION.md`](../00_ARB_Buildathon/SUBMISSION.md) |
| CLI Demo SSOT | [`02_CLI_DEMO_RUNBOOK.md`](../05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md) |
| 前序卷對照 | 0915 10:00（**9.48**）→ 0915 Lunch（**9.50**）→ **本卷 9.60** |

> **本卷用途：** 30 人面板對 **下午 / 下班時段 CLI HUD 標準化、互動式評委 UX、ZeroDev AA Ready 整合、雙 Dune 連結消歧** 做獨立裁決。物理 SSOT：[`SYSTEM_METRICS_SSOT.json`](../audit/SYSTEM_METRICS_SSOT.json) · [`SEPSB_BENCHMARK_SSOT.json`](../audit/SEPSB_BENCHMARK_SSOT.json) · **不突破** Phase-4 freeze 核心 Wasm / 合約層。

**執行摘要：** Checkpoint **17:30 HKT** · HEAD `a053bd4f`。物理指標：**243 / 1123 PASS** · **tsc 0 errors** · SEPSB **TPR 100% / FPR 0%** · Dual Dune 分軌連結已在 README / JUDGE_BRIEF / SUBMISSION **明確標籤化**。**本卷裁決：下午七柱抛光（Seven Pillars of Afternoon Polish）** 把評委體驗從「能跑 demo」升級為「能逐步消化安全證明」—— Tier 0 `demo:exomesh` 旗艦定位、二級 demo 統一 Box-Drawing HUD、`Press ENTER` 互動停頓、純 `--json` 機器可讀輸出、ZeroDev AA Ready 預設開啟且優雅降級。**禁止** 恢復 `demo:e2e` 別名；**禁止** 在 freeze 內改動 `pkg/soil_core.wasm` 或 PolicyGuard ABI。

---

## 0. 評分軌跡（0915 全日 · N=30）

```text
0915 10:00 Morning  ──► 9.48  (Zero-Bias · SEPSB + Dual Dune 澄清)
         │
0915 12:00 Lunch    ──► 9.50  (x402 正交裁決 · freeze 內拒絕 payment rail)
         │
0915 17:30 Off-Work ──► 9.60  (CLI HUD 七柱抛光 · ZeroDev badge · Dune 消歧)
```

| 時段 | HEAD（近似） | 加權均分 | 本卷增量驅動 |
|------|--------------|----------|--------------|
| 10:00 Morning | `b72b5a2b` | **9.48** | SEPSB v1.0-Santenmoku · 雙 Dune 架構澄清 |
| 12:00 Lunch | `4c2a01c7` | **9.50** | x402 正交 · 拒絕 freeze 內第二支付軌 |
| **17:30 Off-Work** | **`a053bd4f`** | **9.60** | CLI 標準化 · 互動 pause · `--json` · ZeroDev · Dune 連結消歧 |

### 主席加權四維（0915 17:30 Off-Work · N=30）

| 維度 | **本卷** | 驅動 |
|------|----------|------|
| **SC** (Security & Code Integrity) | **9.62** | Zero-alloc hot path · 純 `--json` 無 ANSI 洩漏 · **1123/1123 PASS** · freeze 未破 |
| **PMF** (Product-Market Fit & Judge UX) | **9.58** | `Press ENTER` 逐步消化 · ZeroDev AA Ready badge · Tier 0–2 demo 層級清晰 |
| **Inno** (Architecture Innovation) | **9.38** | 預共識 Wasm reflex arc · ERC-7540+ / ERC-7683 superset 敘事 · 非新支付 rail |
| **RPS** (Reproducibility & Submission Spec) | **9.82** | `pnpm sync:docs`  flawless · 雙 Dune 連結 explicit · OpSec 內卷隔離 |
| **加權均分** | **9.60 / 10.0** | 相對 Lunch（9.50）**+0.10**：評委 UX + 文檔收斂，非核心 Wasm 改動 |

---

## 1. 下午七柱抛光（Seven Pillars of Afternoon Polish）

### 柱 1 — CLI 標準化與 Demo 去混淆

| 決策 | 狀態 | 工程錨點 |
|------|------|----------|
| 廢除 `demo:e2e` | ✅ **已執行 · 禁止別名** | 全面更名 **`pnpm demo:delta-neutral`** |
| 命名一致性 | ✅ | `package.json` scripts · `02_CLI_DEMO_RUNBOOK.md` · SUBMISSION 命令表 |
| 評委心智模型 | ✅ | 「Delta-Neutral Macro Flow」取代模糊 e2e 標籤 |

**裁決：** 任何 PR 重新引入 `demo:e2e` 別名 → **OpSec 拒絕合併**。

### 柱 2 — Tier 0 旗艦定位（`pnpm demo:exomesh`）

| 層級 | 命令 | 定位 | Scenario 覆蓋 |
|------|------|------|---------------|
| **Tier 0** | `pnpm demo:exomesh` | **Fully Demo Flagship** | Scenario **A–D**（EIP-1193+ Agentic Guard 全弧） |
| Tier 1 | `pnpm demo:{gmx,hl,pendle,usdai,variational}` | 5-Core Venue Matrix | `--trip` fail-closed |
| Tier 2 | `demo:sanctuary` · `demo:ingress` · `demo:delta-neutral` | 二級敘事 demo | A/B/C + Box-Drawing |

**文檔錨點：** [`README.md`](../../README.md) Tier 0 段 · [`02_CLI_DEMO_RUNBOOK.md`](../05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md#tier-0--exomesh-agentic-guard-eip-119357926963)

### 柱 3 — 二級 CLI HUD Box-Drawing 統一

| Demo | HUD 模組 | 視覺框架 |
|------|----------|----------|
| `demo:sanctuary` | `examples/lib/sanctuary-demo-hud.ts` | `⚠️ RAW LIMITATION` vs `🛡️ SLIVERVINE SANCTUARY ENHANCEMENT` |
| `demo:ingress` | `examples/lib/ingress-demo-hud.ts` | Module B · Pillar Set X · Scenario A–C box frames |

**裁決：** Box-drawing 讓評委 **一眼對照** ERC-7540 原生限制 vs Sanctuary 增強 — 不需讀 200 行源碼。

### 柱 4 — 互動式步進停頓（`Press ENTER`）

| 能力 | 實作 | 評委價值 |
|------|------|----------|
| Scenario A/B/C 統一命名 | 全二級 demo 對齊 | 可預測敘事節拍 |
| `Press ENTER` pause | `examples/lib/demo-utils.ts` | 逐步消化安全證明，非跑馬燈 |
| 非互動 CI 模式 | 無 TTY 時自動跳過 pause | CI / headless 友好 |

### 柱 5 — 純 `--json` 機器可讀模式

| Demo | `--json` 行為 | 持久化日誌 |
|------|---------------|------------|
| `demo:sanctuary` | stdout **純 JSON array** · 抑制 ANSI | `docs/logging/last_sanctuary_run.json` |
| `demo:ingress` | 同上 | `docs/logging/last_ingress_run.json` |
| `demo:delta-neutral` | 完整 payload + `zerodev` 狀態 | `docs/logging/last_delta_neutral_run.json` |
| `demo:exomesh` | scenario array（既有） | `docs/logging/last_exomesh_run.json` |

**驗證：**

```bash
pnpm demo:sanctuary -- --json | jq .
pnpm demo:ingress -- --json | jq .
pnpm demo:delta-neutral -- --json | jq .
```

> **注意：** pnpm 可能在前置一行 `$ tsx ...` 提示；JSON body 本身有效。評委應 `| tail -n +2 | jq .` 或直讀 `docs/logging/last_*.json`。

### 柱 6 — ZeroDev AA Ready 整合

| 項目 | 狀態 | 錨點 |
|------|------|------|
| `--zerodev=on`（default） / `--zerodev=off` | ✅ | `examples/lib/delta-neutral-zerodev.ts` |
| Bundler probe + 優雅降級 | ✅ | offline → native EIP-1193 signer fallback |
| README SVG badge | ✅ | `[![ZeroDev AA Ready](...)](https://zerodev.app)` · `buildReadmeBadges()` |
| Venue demo badge | ✅ | `[AA] 🟢 ZeroDev AA Ready` · `venue-demo-hud.ts` |
| ERC-7715 Mandates | ✅ | JUDGE_BRIEF EVM Standards 矩陣 **#9** 保留 |

**裁決：** Partner 冗餘表格已從公開 doc 移除；ZeroDev 敘事收斂至 **header badge + CLI HUD + standards 矩陣**。

### 柱 7 — Dune 雙儀表板連結消歧

| Dashboard | 標籤 | URL | 用途 |
|-----------|------|-----|------|
| **Dashboard 1** | **Dune Operational Shield** | [`/slivervine-protocol`](https://dune.com/silvervinelabs/slivervine-protocol) | Live volume · gas saved · intercept donut |
| **Dashboard 2** | **Dune SEPSB Stress Matrix** | [`/slivervine-sepsb-stress`](https://dune.com/silvervinelabs/slivervine-sepsb-stress) | TPR/FPR · 5-venue Wasm reflex SLA |

**已同步文件：** `README.md`（header Live Telemetry + `README_DUAL_TELEMETRY`）· `JUDGE_BRIEF.md`（telemetry table + footer）· `SUBMISSION.md`（Live Telemetry 表 + metadata 行）· `buildDualTelemetryBlock()` / `buildJudgeTelemetryTable()`

**禁止敘事：** 禁止把 SEPSB fixture TPR 與 Operational Shield `$6.57M` live PnL 合併 KPI。

---

## 2. Demo CLI 層級速查（評委 60 秒路徑）

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  TIER 0  pnpm demo:exomesh          ← 旗艦 · Scenario A–D · EIP-1193+  │
├─────────────────────────────────────────────────────────────────────────┤
│  TIER 1  pnpm demo:gmx -- --trip     ← 5-Core Venue fail-closed proof  │
│          pnpm demo:{hl,pendle,usdai,variational} -- --trip              │
├─────────────────────────────────────────────────────────────────────────┤
│  TIER 2  pnpm demo:sanctuary         ← ERC-7540+ Box HUD · --json       │
│          pnpm demo:ingress           ← Module B ingress · --json        │
│          pnpm demo:delta-neutral     ← 4-Step macro · --zerodev=on|off  │
└─────────────────────────────────────────────────────────────────────────┘
```

| 評委目標 | 推薦命令 | 預期結果 |
|----------|----------|----------|
| 最快 fail-closed | `pnpm demo:gmx -- --trip` | `FAIL_CLOSED` · 0-Gas · soil trip |
| 旗艦全弧 | `pnpm demo:exomesh` | Scenario A–D · Wallet Guard narrative |
| Sanctuary 對照 | `pnpm demo:sanctuary` | RAW vs ENHANCEMENT box frames |
| AA + macro flow | `pnpm demo:delta-neutral -- --zerodev=on` | ZeroDev probe · 4-step HUD |
| 機器可讀 | `pnpm demo:ingress -- --json` | → `docs/logging/last_ingress_run.json` |

---

## 3. 文檔與 SSOT 同步狀態（Off-Work 收斂）

| 文件 | 下午變更摘要 | sync 標記 |
|------|--------------|-----------|
| `README.md` | ZeroDev badge · 雙 Dune header · 移除 Partner 表 | `README_BADGES` · `README_DUAL_TELEMETRY` |
| `JUDGE_BRIEF.md` | Telemetry table 明確連結 · footer 雙 Dune | `JUDGE_TELEMETRY_TABLE` |
| `SUBMISSION.md` | Live Telemetry 雙行 · metadata Dune 行 | 手動（非 auto-block） |
| `02_CLI_DEMO_RUNBOOK.md` | Tier 0 exomesh · delta-neutral · zerodev flags | 手動 |
| `sync-ssot-docs-lib.ts` | `buildReadmeBadges` + ZeroDev · Dune link labels | `pnpm sync:docs` |

**凍結層（本卷未觸碰 · Phase-4）：** `soil-wasm-runtime.ts` · `sanctuary-wasm-runtime.ts` · `policy-guard-stylus-gate.ts` · `contract-deployments.ts` · PolicyGuardV2 ABI · `pkg/soil_core.wasm` · `CODEBASE_FREEZE.json`

---

## 4. 三十人 Persona 四維評分細表（0915 17:30 Off-Work · 0.0–10.0）

**說明：** 三組各 10 席 · 共 30 人。**本卷繼承** 10:00 / Lunch 物理 SSOT，**增量評分** 聚焦下午 CLI / 文檔抛光。席次總分 = (SC+PMF+Inno+RPS)/4。

### Panel A — 核心協議與量化風險（Core Protocol & Quant Risk · 10 Judges）

| # | 評審 | 背景 | SC | PMF | Inno | RPS | **總分** |
|---|------|------|----|-----|------|-----|----------|
| 1 | Dr. Steven Goldfeder | Offchain Labs CEO | 9.78 | 9.58 | 9.46 | 9.92 | **9.69** |
| 2 | Elena Korolev | GMX Synthetics Risk | 9.76 | 9.56 | 9.44 | 9.90 | **9.67** |
| 3 | Dr. Isabel Costa | Pendle Core Engineering | 9.80 | 9.58 | 9.48 | 9.92 | **9.70** |
| 4 | TN Lee | Pendle Co-founder | 9.74 | 9.54 | 9.42 | 9.88 | **9.65** |
| 5 | Amir Hassan | Gauntlet Quant Lead | 9.82 | 9.54 | 9.50 | 9.94 | **9.70** |
| 6 | Dr. Mei Ling Xu | Stylus / Wasm · SSRC | 9.84 | 9.60 | 9.52 | 9.96 | **9.73** |
| 7 | Dr. Zara Nyong'o | ZeroDev Kernel | 9.72 | 9.62 | 9.40 | 9.86 | **9.65** |
| 8 | Nina Petrov | Flashbots PBS Research | 9.80 | 9.58 | 9.50 | 9.92 | **9.70** |
| 9 | Dr. Fiona Walsh | Immunefi Triage Lead | 9.74 | 9.54 | 9.42 | 9.88 | **9.65** |
| 10 | Victor Russo | Trail of Bits | 9.82 | 9.58 | 9.48 | 9.92 | **9.70** |
| | **Panel A 平均（N=10）** | | **9.78** | **9.57** | **9.46** | **9.91** | **9.68** |

**席次讀法：** Xu 給 `--json` 零 ANSI 洩漏 + 1123 PASS 加分；Nyong'o 認可 `--zerodev=on` 預設與 graceful fallback；Walsh 仍扣 BH-7 未跑。

### Panel B — 生態、SDK 與遙測（Ecosystem, SDK & Telemetry · 10 Judges）

| # | 評審 | 背景 | SC | PMF | Inno | RPS | **總分** |
|---|------|------|----|-----|------|-----|----------|
| 11 | Clara Mendez | Arbitrum GMX Builder Lead | 9.56 | 9.68 | 9.32 | 9.86 | **9.61** |
| 12 | Tano Kahn | Offchain Labs Product | 9.52 | 9.64 | 9.28 | 9.82 | **9.57** |
| 13 | Fredrik Haga | Dune CEO | 9.58 | 9.72 | 9.30 | 9.90 | **9.63** |
| 14 | Maya Rodriguez | DevRel / SDK DX | 9.50 | 9.70 | 9.26 | 9.80 | **9.57** |
| 15 | Sofia Petrov | AI Agent Protocol Standards | 9.54 | 9.72 | 9.30 | 9.84 | **9.60** |
| 16 | Kelvin Koh | Spartan Group | 9.48 | 9.66 | 9.24 | 9.78 | **9.54** |
| 17 | Jason Choi | Tangent / Blockcrunch | 9.52 | 9.68 | 9.28 | 9.82 | **9.58** |
| 18 | Dr. Ingrid Sørensen | Indexer / Telemetry | 9.54 | 9.70 | 9.26 | 9.84 | **9.59** |
| 19 | 蔡俊彥 | GMX Keeper Integrator | 9.56 | 9.68 | 9.30 | 9.86 | **9.60** |
| 20 | 蘇若晴 | Buildathon 首席審計官 | 9.60 | 9.74 | 9.32 | 9.90 | **9.64** |
| | **Panel B 平均（N=10）** | | **9.54** | **9.69** | **9.29** | **9.84** | **9.59** |

**席次讀法：** Haga 強推 **Dune Operational Shield** vs **Dune SEPSB Stress Matrix** 明確標籤；Rodriguez 給 `Press ENTER` 互動 UX 高分；蘇若晴 認可 Tier 0 `demo:exomesh` 旗艦定位。

### Panel C — OpSec、合規與機構資本（OpSec, Compliance & Capital · 10 Judges）

| # | 評審 | 背景 | SC | PMF | Inno | RPS | **總分** |
|---|------|------|----|-----|------|-----|----------|
| 21 | Johann Kerbrat | Robinhood Crypto | 9.50 | 9.48 | 9.38 | 9.72 | **9.52** |
| 22 | Marco Esposito | MiCA / EU Compliance | 9.54 | 9.50 | 9.40 | 9.74 | **9.55** |
| 23 | Arthur Cheong | DeFiance Capital | 9.48 | 9.46 | 9.36 | 9.70 | **9.50** |
| 24 | Mable Jiang | Web3 Investor | 9.52 | 9.48 | 9.38 | 9.72 | **9.53** |
| 25 | Dr. Hannah Weiss | Aave Risk Committee | 9.50 | 9.46 | 9.36 | 9.70 | **9.51** |
| 26 | Ed Felten | Offchain Labs Chief Scientist | 9.58 | 9.52 | 9.44 | 9.76 | **9.58** |
| 27 | Patrick McCorry | Arbitrum Foundation Research | 9.52 | 9.48 | 9.40 | 9.72 | **9.53** |
| 28 | Dr. Camille Renard | Security Chair | 9.54 | 9.50 | 9.42 | 9.74 | **9.55** |
| 29 | 林承翰 | Formal Methods | 9.50 | 9.46 | 9.36 | 9.70 | **9.51** |
| 30 | Felix Grund | HFT Market Maker | 9.48 | 9.44 | 9.34 | 9.68 | **9.49** |
| | **Panel C 平均（N=10）** | | **9.52** | **9.48** | **9.38** | **9.72** | **9.53** |

**席次讀法：** Kerbrat 認可 `demo:ingress` Module B 敘事 · 扣 BH-9 Bootstrap；Felten 給 freeze 未破 + pure JSON 加分；Grund 仍把 SEPSB 當實驗室 SLA。

### E. 全團 30 人匯總

| 組 | N | SC | PMF | Inno | RPS | **總分** |
|----|---|----|-----|------|-----|----------|
| Panel A | 10 | 9.78 | 9.57 | 9.46 | 9.91 | **9.68** |
| Panel B | 10 | 9.54 | 9.69 | 9.29 | 9.84 | **9.59** |
| Panel C | 10 | 9.52 | 9.48 | 9.38 | 9.72 | **9.53** |
| **全團 30** | **30** | **9.62** | **9.58** | **9.38** | **9.82** | **9.60** |

**主席加權四維（蘇若晴 · Mendez 雙主席 · 0915 17:30 Off-Work）：** SC **9.62** · PMF **9.58** · Inno **9.38** · RPS **9.82** · **Combined Score 9.60 / 10.0**。

---

## 5. 殘餘硬扣（本面板不放寬）

| Nit | 狀態 | 影響 |
|-----|------|------|
| **BH-7** Large-Scale Chaos | **NOT RUN · HIGH（披露）** | K8s 分區 / Sequencer 宕機未實跑 |
| **BH-9** Bootstrap 密鑰旋轉 | **OPEN · MED** | post-grant M1 Safe 3/5 |
| npm **實際公開發布** | **OPEN · P1** | workspace `private: true` |
| 30s Wallet Guard 片 | **OPEN · P1** | 評委仍須跑測試才能「看見」SKU |
| SEPSB ≠ Live PnL | **披露** | Dashboard 2 ≠ Dashboard 1 `$6.57M` |
| `demo:e2e` 復活風險 | **WATCH** | 任何別名 PR → OpSec 拒絕 |

---

## 6. 60 秒評審驗證命令（0915 17:30 · `a053bd4f`）

```bash
# === Off-Work 60 秒快驗（0915 17:30）===
HEAD=$(git rev-parse --short HEAD)
echo "HEAD=$HEAD"   # a053bd4f
pnpm exec tsc --noEmit                          # 0 errors
pnpm test                                       # 243 files · 1123 PASS
pnpm sync:docs                                  # README / JUDGE_BRIEF / Grok 卷 header 對齊
pnpm demo:exomesh                               # Tier 0 旗艦 · Scenario A–D
pnpm demo:gmx -- --trip                           # fail-closed 閉環
pnpm demo:sanctuary -- --json | tail -n +2 | jq . # 純 JSON（跳過 pnpm 提示行）
pnpm demo:delta-neutral -- --zerodev=on           # ZeroDev AA Ready 預設
pnpm audit:sepsb                                  # SEPSB TPR/FPR SSOT
jq '.active' docs/audit/CODEBASE_FREEZE.json      # true
```

---

## 7. 主席裁決與提交建議（0915 17:30 Off-Work）

| 決策 | 裁決 |
|------|------|
| **Buildathon 提交** | **GO** — 1123 PASS · CLI 七柱抛光 · 雙 Dune explicit · freeze active |
| **Grant Milestone M0** | **符合** — 工程交付物 + 評委 UX 路徑齊備 |
| **禁止敘事** | 禁止 `demo:e2e` · 禁止 SEPSB = live PnL · 禁止「BH-7 已關」 |
| **10/01 前 P0** | 30s demo 片 · npm publish 決策 · BH-9 Bootstrap 披露 finalize |

**本卷最終分：9.60 / 10.0（N=30 · 0915 17:30 Off-Work Checkpoint）**

**評分軌跡鎖定：** Morning **9.48** → Lunch **9.50** → **Off-Work 9.60**

---

*內部文件 · SilverVine Labs OpSec · 禁止對外原文發布 · Generated @ 2026-09-15 17:30 HKT · HEAD `a053bd4f` · 243/1123 PASS · DO NOT PUBLISH NATIVELY*
