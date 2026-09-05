> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[README.md](./README.md)

# SliverVine Protocol（BeDelta Living Water v1.0 / BeΔ）：Arbitrum 上 AI Agent 的亞毫秒零 Gas 播前安全堡壘與風險導航器

**文件：** 文件索引  
**正式名稱：** SliverVine Protocol（BeDelta Living Water v1.0 / BeΔ）  
**理念：** **BeDelta（BeΔ）** = 市場 Delta 中性與執行安全 · **SliverVine** = 碎片化意圖保護與鋼鐵級交易執行。  
**實體：** SilverVine Labs · **協議：** SliverVine · **分支：** `v1.0_push_BDLW`  
**線上：** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · **Dune：** [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · **聯絡：** `grants@silvervinelabs.com`

> **Vitest SSOT：** **192 個測試檔案 | 836 PASS Clean（100% PASS）** · `pnpm test` · `pnpm demo`（12 個三柱 ANSI 情境）· `pnpm demo:e2e`（5 步宏觀流程）· 即時證明 `GET /api/grant-audit`。

> **語言政策：** 英文 SSOT 檔案自成一體 — 僅使用專業英文，不含 CJK 字元，不含跨語言連結。

---

## 從這裡開始 — 補助審查員與機構稽核員

**步驟 1：** [`VERIFICATION_MATRIX_ZH.md`](./VERIFICATION_MATRIX_ZH.md)（英文 SSOT：[`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)）— Tier 0–5 CLI 驗證（Docker · Vitest · Forge · ZeroDev · 即時遙測）。

**步驟 2：** 依序閱讀下方 **五大核心補助文件**。

---

## 五大核心補助文件

| # | 文件 | 角色 |
|---|------|------|
| 1 | [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md) · [中文參考](./VERIFICATION_MATRIX_ZH.md) | **CLI Tier 0–5 驗證入口** — 評審可重現的 PASS 門檻 |
| 2 | [`architecture/01_TECHNICAL_SPECIFICATION.md`](./architecture/01_TECHNICAL_SPECIFICATION.md) | **黃皮書** — R01–R20 風險矩陣 · 三柱架構 · Arbitrum 中心拓撲 |
| 2b | [`architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md) | **ERC/EIP 標準百科** — 合規態勢 · ArbOS/Stylus · RPC/WSS |
| 3 | [`audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](./audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) | **機構盡職調查備忘錄（DDIP）** — 配置者盡職 · Basel III 對應 · chaos 255/255 |
| 4 | [`audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) | **ZeroDev AA 與播前 Wasm 風險基質** — Kernel v3 機構差異化 |
| 5 | [`sdk/CITADEL_SDK_BLUEPRINT.md`](./sdk/CITADEL_SDK_BLUEPRINT.md) | **B2B CaaS 整合藍圖** — `@slivervine/citadel-sdk` · 10 bps 建構者 + 推薦返利模型 |

---

## 支援文件

| 受眾 | 文件 | 角色 |
|------|------|------|
| **風險緩解與免責聲明框架** | [`architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | 故障關閉邊界 · **88% / 12% 風險光譜** · **80/20 帕累托** · 不可抗力 · AI 攻擊向量 · 60 項不變量 · V1.0 與 V1.5/V2.0 路線圖 |
| **合規入口防火牆（柱 2）** | [`audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) | 場館無關單向 AML 護送 · Robinhood Chain 為首個參考適配器 · 5/5 測試 |
| **邊緣 Shield Wasm 核心（柱 3）** | [`audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) | `checkSoilResistance()` · p50 ~106µs · 三感測器 · R01–R20 防禦矩陣 |
| **安全稽核快照** | [`audit/05_PRINCIPAL_AUDIT_REPORT.md`](./audit/05_PRINCIPAL_AUDIT_REPORT.md) | 主體審查 · Gate / 生存矩陣 |
| **補助提交** | [`ARB_Buildathon/SUBMISSION.md`](./ARB_Buildathon/SUBMISSION.md) · [中文參考](./ARB_Buildathon/SUBMISSION_ZH.md) | Buildathon 主提交包 |
| **HackQuest 雙影片腳本** | [`pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md`](./pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md) | Pitch 180s（暴雨）· Demo 120s（即時 CLI） |
| **Arbitrum 補助範圍** | [`grants/arbitrum/GRANT_PROPOSAL.md`](./grants/arbitrum/GRANT_PROPOSAL.md) | DAO 提案 · 里程碑範圍 |
| **GMX Builders** | [`grants/gmx/GMX_BUILDERS_PITCH.md`](./grants/gmx/GMX_BUILDERS_PITCH.md) | GMX v2 整合提案 |
| **SDK 套件 README** | [`../src/sdk/README.md`](../src/sdk/README.md) · [中文參考](../src/sdk/README_ZH.md) | 倉庫內 SDK 快速參考 |
| **Sidecar / B2B 營運** | [`../docker/README.md`](../docker/README.md) | 遙測 sidecar · Docker Tier 5 |

---

## 資料夾地圖

```text
docs/
 README.md ← 您在此處（英文 SSOT）
 README_ZH.md ← 中文參考譯本
 VERIFICATION_MATRIX.md Tier 0–5 CLI 地圖（評審從此開始）
 architecture/ 黃皮書 · 標準百科 · 風險緩解與免責聲明框架
 audit/ DDIP · ZeroDev 分析 · Robinhood 閘門 · 主體稽核
 sdk/ Citadel SDK 整合藍圖
 ARB_Buildathon/ Buildathon 主提交包
 grants/ arbitrum/ + gmx/
 pitch/ 雙影片分鏡腳本
 telemetry/ Dune SQL 規格 + Monte Carlo JSON
```

即時證明：`GET /api/grant-audit`。
