> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md](./01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md)

# 機構盡職調查與風險合規備忘錄 (DDIP) — SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)

| 欄位 | 內容 |
|-------|-------|
| **文檔** | Institutional Due Diligence & Risk Compliance Memorandum (DDIP) |
| **版本** | **v1.0.0** |
| **分類** | 公開 Grant / 機構配置者盡職調查 |
| **實體** | SilverVine Labs |
| **協議** | SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) · Santenmoku 內部引擎 |
| **產品** | **SliverVine Citadel Shield** — 預共識意圖防火牆與執行安全原語 |
| **定位** | **SliverVine Citadel Shield** 於 **SliverVine Protocol** (BeDelta Living Water v1.0 / BeΔ) — Arbitrum 上 AI Agent 的亞毫秒 0-Gas 預廣播安全堡壘與風險導航器 |
| **受眾** | Arbitrum Foundation · ZeroDev Grant 委員會 · 機構配置者 · Fund-of-Funds 盡職 |
| **基線** | **Vitest SSOT：** **192 test files \| 836 PASS Clean (100% PASS)** · Worker bundle **69.32 KiB gzip** · Wasm 熱路徑 **p50 ~106 µs** · Wasm warm **&lt;60 µs** |
| **即時驗證** | [`GET /api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) |
| **規格 SSOT** | [`../architecture/01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) |
| **風控框架 SSOT** | [`../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) |

> **哲學 — BeΔ (BeDelta Living Water v1.0)：** **Be** 靈感源自 Bruce Lee 的 *「Be Water, My Friend」* — 如水般流動、自適應的意圖路由與無摩擦多鏈執行。**Δ (Delta)** 表示**市場 Delta 中性**與風險中性執行 — 透過 GMX v2 GM + Hyperliquid 1× Short 對沖包絡中和方向性敞口。**SliverVine Citadel Shield** 為將二者綁定的預共識執行安全原語。

---

## 核心目標

本備忘錄為評估 SliverVine Citadel Shield delta-neutral Vault 基礎設施的 **Arbitrum Foundation、ZeroDev 及機構配置者** 提供**透明、程式碼可驗證的審計軌跡**。每一項量化宣稱均可對應至**可重現的命令、測試檔或鏈上產物** — 而非敘述性保證。

> **請先閱讀：** 完整**風險與免責聲明**揭露 — 含非託管語義、殘餘跨鏈/基差風險，以及 Fail-Closed 防護的限度 — 見下文 [**§ 風險與免責聲明**](#風險與免責聲明)。DDIP 為架構盡職調查產物；**不構成**法律、投資或稅務意見，亦非監管認證。

---

## 風險與免責聲明

> **有效範圍：** 本節適用於所有讀者 — 零售參與者、機構配置者、Grant 評審及 Fund-of-Funds 盡職團隊。引用 DDIP 即表示您知悉 SliverVine Protocol 為**複雜智慧合約協議**，而非銀行存款、貨幣市場基金或受保現金產品。

### R.0 風險光譜 — 數學定義 (88% / 12%)

SliverVine 將 **100% 鏈上風險總面**建模為封閉分割：**88%** 預廣播危害於 **p50 ~106 µs** 經 Wasm Soil Core 攔截（MEV、深度驟降 **>10 bps**、Oracle 滯後、Session 濫用、提示注入 calldata、AML 入站）· **12%** 不可消除的系統性殘差（Sequencer 停機 **>600 s**、0-day 場所漏洞、RPC 斷連），此時 Citadel 採 **Fail-Closed** 姿態（`signingChannelOpen: false`）。**80/20 帕累托法則**（正交微結構統計）指出：約 **80%** 急性毒性損失來自 **~20%** 微秒級深度/滑點異常 — 由 Pillar 3 直接針對。

> **正式 SSOT：** [Risk Mitigation & Disclaimer Framework §0.1](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee)

### R.1 協議分類 — 複雜智慧合約基礎設施

SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) 為 SilverVine Labs 營運的**複雜、非託管 DeFi 執行協議**。其組成為：

| 層級 | 功能 | SSOT |
|-------|----------|------|
| **Pillar 3 — 預執行盾牌** | 廣播前 **Fail-Closed** Citadel 閘門 | `checkSoilResistance()` · `pkg/soil_core.wasm` |
| **Wasm Soil 引擎** | Edge 上 **p50 ~106 µs** 熱路徑熔斷器 | R01–R20 矩陣 · Vitest 回歸 |
| **Pillar 1 — Gatehouse** | 範圍 Session Keys · EIP-712 · **可選加入** ZeroDev Kernel v3 AA | `session-key-gates.ts` · 與 Pillar 3 Wasm 獨立 |
| **Pillar 2 — 合規入站防火牆** | 場所無關單向 AML 護航與待結算資本辨識不變量（`IN_FLIGHT_BRIDGE_CAPITAL` · `lostUsd ≡ 0`）；入站 AML 阻擋。**Robinhood Chain / Across 為 Pillar 2 參考護航適配器** — 非產品本體 | `src/adapters/across-ingress-bridge.ts` · `IngressSafetySwitch.sol` |
| **場所腿** | GMX v2 GM pools（Arbitrum One）+ Hyperliquid 1× Short 對沖 | Tech Spec §2 |

**Fail-Closed 姿態：** 當 soil、oracle、sequencer、bridge 或 session 感測器觸發時，SliverVine Protocol **寧可不動作，也不做錯動作** — `signingChannelOpen: false`、UserOp 於 bundler 前拒絕、橋接狀態 `BRIDGE_TIMEOUT_FAIL_CLOSED`。此為**預執行安全層**，不保證獲利、本金保護或消除市場風險。

```text
User intent → 106µs Wasm Soil Engine (Fail-Closed · `pkg/soil_core.wasm`) → Gate attestation → Venue broadcast
  (ZeroDev AA = optional Pillar 1 delivery path only)
 │
 └── trip → severance (no broadcast) — NOT "zero financial risk"
```

### R.2 非託管執行基底

SliverVine Protocol 運作於**非託管執行基底**：

- 用戶本金存放於 **ZeroDev Kernel Smart Accounts**（選擇 AA 時）或機構 EOA/multisig（基線原生入站）— 非協議國庫、綜合錢包或裁量託管帳戶。
- SilverVine Labs **不**對用戶資金行使裁量保管、**不**再質押已標記在途橋接資本，且**不**自稱持牌託管人、經紀自營商或支付機構。
- 透過 GMX **`uiFeeReceiver` (+10 bps)** 與**最高 25% GMX Referral Rebate** 的協議收益為**協議收入**，於會計語義中與用戶本金明確分離（§6.3）。10 bps builder fee 為 GMX v2 ExchangeRouter 原生參數 — v1.0 執行安全路徑零額外開銷。

**0-Proxy 架構**（§5.3）表示 SliverVine Protocol 提供**風控閘門與路由邏輯** — 非資產負債表中介。用戶與機構對底層場所（GMX、Hyperliquid、Across bridge、Robinhood Chain 護航路徑）保留**直接智慧合約敞口**。

### R.3 殘餘風險 — 量化、隔離與緩衝（非隱藏）

SliverVine Protocol **不**宣傳「零風險」、「保證收益」或「資本保護回報」。殘餘風險保持**完整揭露、盡可能量化、以狀態標籤隔離並經濟緩衝** — 而非以行銷文案遮蔽。

| 殘餘風險類別 | SliverVine Protocol 處置方式 | Fail-Closed **無法**消除者 |
|--------------------|--------------------|--------------------------------------|
| **跨鏈 / 橋接** | `IN_FLIGHT_BRIDGE_CAPITAL` 標籤 · 1h 逾時 → `BRIDGE_TIMEOUT_FAIL_CLOSED` · **`lostUsd ≡ 0`** 誠實待結算會計 | 橋接營運商失敗 · 結算延遲 · 橋接智慧合約漏洞 |
| **基差漂移 (GM vs HL)** | 雙腿 delta 追蹤 · Citadel Safety Buffer · Survival Benchmark 3σ 重播 | 持續 funding/基差分歧 · 場所特定破產 |
| **Oracle 滯後** | `ORACLE_LAG_DEADLOCK` (>30s) · fail-closed 斷簽 | Oracle 操縱 · 超出建模閾值的 feed 中斷 |
| **Sequencer / ArbOS 不同步** | 600s 恢復寬限 · 不同步期間禁止裸開倉 | 長期 L2 中斷 · 超出 PGATE 預算的 reordering/MEV |
| **智慧合約風險** | 不可變 Wasm · L1 consume-once 閘門 · **192 test files \| 836 PASS Clean (100% PASS)** + 混沌矩陣 | 未知漏洞 · 升級/金鑰洩露 · 第三方場所缺陷 |
| **市場 / 流動性** | `MIN_DEPTH_USD` · 0.5% 滑點 fuse · TWAP 路徑切片 | 缺口窗口 · 深度蒸發 · 超出壓力重播的黑天鵝尾部 |
| **收益變異** | 動態目標區間 **8.2% ~ 11.8%**（非保證 HUD 帶）· **0.5% Hurdle Gate** | 負 funding · 費用壓縮 · 與 emission 無關的回報缺口 |

**隔離原則：** 在途跨鏈資本**標記且不可部署**，直至 `SETTLED`。基差與 funding 衝擊由 Citadel Safety Buffer 與門檻閘門再部署（`FRICTION_BUFFER_APY = 0.005`）**緩衝**。這些控制**降低可預防損失路徑** — **不**將 DeFi 轉為無風險產品。

> **反行銷承諾：** 將 SliverVine Protocol 表述為「無風險」、「保證 APY」或「本金保護」與**本備忘錄**及協議誠實會計不變量**不一致**。

### R.4 Fail-Closed 防護的含義（與非含義）

| 陳述 | 準確？ |
|-----------|-----------|
| SliverVine Protocol 於感測器觸發時在 GMX/HL 廣播**之前**阻擋毒性訂單 | **是** — 255/255 混沌情境 · 對抗矩陣中 `capitalLossUsd: 0` |
| SliverVine Protocol 消除智慧合約、市場、橋接或對手方風險 | **否** |
| SliverVine Protocol 保證動態目標區間 8.2–11.8% APY | **否** — 僅顯示帶；見 §5.6 |
| 待結算橋接流動性記為本金損失 | **否** — `lostUsd ≡ 0`，直至明確、有界執行損失 |
| 用戶需具備專業能力以評估殘餘風險 | **是** |

Fail-Closed 為**預執行邊界上的營運風險斷簽** — 類比斷路器，非保險單。

### R.5 法律、監管與非建議免責聲明

| 主題 | 揭露 |
|-------|------------|
| **法律意見** | DDIP **非**法律意見。請就管轄區分析諮詢合格律師。 |
| **投資建議** | DDIP **非**投資、財務或稅務建議。無買賣或持有任何資產之推薦。 |
| **監管狀態** | SliverVine Protocol **不**宣稱銀行牌照、MiCA CASP 授權、SEC/CFTC 登記或 **SOC 2 Type II** 鑑證。§5 框架映射僅為**架構對齊敘述**。 |
| **證券定性** | SilverVine Labs **不**就任何 SliverVine Protocol 互動於任何管轄區是否構成證券作出聲明。 |
| **前瞻性陳述** | 標記 **⏳ Roadmap Spec** 的路線圖項目為設計目標 — 非交付或績效承諾。**Variational Omni RFQ** 已於 v1.0 整合至核心 bitmask（`evaluateVariationalFlags()` · **Bits 12–13** · `FLAGS_AUTO_SEVER_MASK`）。 |
| **第三方場所** | GMX、Hyperliquid、ZeroDev、Across、Robinhood Chain、Arbitrum 為**獨立第三方**。SliverVine Protocol 不對其正常運行、治理或償付能力負責。 |
| **即時審計端點** | `GET /api/grant-audit` 反映**正常測試準則下的營運遙測** — 非對所有未來狀態的即時保證。 |

### R.6 配置者與用戶確認

與 SliverVine Protocol 互動的機構配置者與專業用戶應確認：

1. **理解**跨 Arbitrum One、Hyperliquid 及可選 Robinhood 護航路徑的智慧合約可組合性風險。
2. **接受**殘餘跨鏈與基差敞口 — 即使 Fail-Closed 閘門運作中 — 含 255 案例混沌矩陣與 30D Survival Benchmark 重播之外的情境。
3. **不依賴** DDIP、HUD APY 帶或 grant-audit 遙測**替代**獨立盡職、法律審查與風險預算。
4. **認知** Fail-Closed 斷簽可能延遲或阻止執行 — 可能錯失預期市場機會（機會成本為真實經濟風險）。

**驗證 SSOT：** `pnpm test -- --run` · `GET /api/grant-audit` · [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) §0（免責 · 不可抗力 · AI 風險）· §2.5–§2.6（經濟永續 · 真實收益）· §4（入站時序）· §6（Basel 映射）。

---

## 1. 執行摘要

SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) 為包裹 Arbitrum One 上 GMX v2 GM pools 與 Hyperliquid 1× Short 對沖腿的**預執行 Citadel 風控層**。資金可經 **Arbitrum 原生 USDC**（即時路徑）或 **Robinhood Chain USDG 護航**（單向 Across 橋接與誠實在途會計）入場。

### 1.1 盡職判定矩陣

| 支柱 | 姿態 | 主要證據 |
|--------|---------|------------------|
| **Pillar 3 — SliverVine Citadel Shield** | 廣播前 Fail-Closed | `checkSoilResistance()` · `pkg/soil_core.wasm` · R01–R20 矩陣 · [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) |
| **資金會計** | 待結算橋接流動性 `lostUsd ≡ 0` | `src/adapters/across-ingress-bridge.ts` · 5/5 Vitest |
| **Pillar 1 — Gatehouse** | **可選加入**範圍金鑰 · 名義上限 · gas 帳本 | ZeroDev AA 閘門（`USE_ZERODEV_AA` 預設關閉）· `session-key-gates.ts` · [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) |
| **壓力與模擬** | 30D Survival Benchmark + **192 test files \| 836 PASS Clean (100% PASS)** 回歸 | `generate-survival-report.ts` · `pnpm test -- --run` |
| **Pillar 2 — 合規入站防火牆** | 僅出站護航 · AML 入站阻擋 · Robinhood Chain 為 inaugural 參考適配器 | `IngressSafetySwitch.sol` · [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) |

### 1.2 鎖定 SSOT 指標（評委可直接複製）

| 指標 | 鎖定值 | 驗證方式 |
|--------|--------------|----------|
| **Vitest 回歸** | **192 test files \| 836 PASS Clean (100% PASS)** | `pnpm test -- --run` |
| **橋接不變量** | **5/5 PASS** | `pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts` |
| **ZeroDev AA 閘門** | **4/4 PASS** | `pnpm exec vitest run tests/adapters/zerodev-aa-gate.test.ts` |
| **混沌矩陣** | **255/255 阻擋 · `capitalLossUsd: 0`** | [`chaos-blackswan-metrics.json`](./chaos-blackswan-metrics.json) |
| **安全矩陣** | **三層級：5/0/0 PASS** | `pnpm audit:security` → [`static-analysis-report.json`](./static-analysis-report.json) |
| **V1.0 容量錨點** | **$100,000** Alpha Vault / 設計名義 | `MIN_DEPTH_USD` · `ORDER_SIZE_MAX_USD` · Survival `NOTIONAL_USD` |

### 1.3 深度盡職文檔地圖

| 主題 | DDIP 章節 | 延伸 SSOT |
|-------|-------------|---------------|
| **風險與免責聲明** | [§ 風險與免責聲明](#風險與免責聲明) | 本文 · 非託管 · 殘餘風險表 |
| 模擬與混沌測試框架 | §3 | 本文 · [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) §4 |
| Arbitrum 原生 vs Robinhood 護航 | §4 | 本文 · [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) §5 |
| 監管與機構合規 | §5 | 本文 · [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) §6 |
| ArbOS Elara · 動態目標區間 | §5.6 | [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) §6.5 · [`02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](../architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos--stylus-alignment--code-verified-on-chain-coprocessor) |
| 真實收益 vs. 毒性通膨 | §2.6（風控框架 SSOT） | [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) §2.6 |
| 60 項架構不變量 | §5.1–§5.2 | [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) §3 |
| Robinhood 參考適配器審計 | §2.3 | [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) |
| Principal 安全質詢 | §2 | [`05_PRINCIPAL_AUDIT_REPORT.md`](./05_PRINCIPAL_AUDIT_REPORT.md) |
| Pillar 1 — ZeroDev Gatehouse AA | — | [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) |
| Pillar 3 — Edge Shield Wasm 核心 | — | [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) |
| Yellow Paper / R01–R20 | §2.2 | [`01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) |
| **Variational Omni RFQ（v1.0 Live）** | R.5 · 風控框架 | [`variational-rfq-adapter.ts`](../../src/adapters/variational-rfq-adapter.ts) · `evaluateVariationalFlags()` · Bits 12–13 |

---

## 2. 基礎設施安全（SOC 2 對齊與不可變性）

> **術語說明：** 「SOC 2 對齊」指控制目標與 AICPA Trust Services Criteria（安全、可用性、處理完整性）的**映射** — **非**鑑證報告。

### 2.1 Trust Services Criteria 映射

| TSC 域 | SliverVine Citadel Shield 控制 | 程式 / 產物錨點 |
|------------|-------------|------------------------|
| **CC6 — 邏輯存取** | 範圍 Session Keys（僅 `ORDER_EXECUTE`）· **30s TTL Heartbeat / Intent Execution Window**（密碼學 session key 生命週期上限 **24h / 7d**）· R07 $5k 上限 | `hl-session/permissions.ts` · `session-key-gates.ts` |
| **CC7 — 系統營運** | Sequencer 守衛（600s 寬限）· oracle 滯後 fail-closed · PGATE 200ms 延遲 fuse | `sequencer-guard.ts` · `PGATE_MAX_LATENCY_MS` |
| **CC8 — 變更管理** | 不可變 Wasm 產物 + 釘選 Worker bundle · BUSL-1.1 授權閘門 | `pkg/soil_core.wasm` · `pnpm bundle:measure` |
| **CC9 — 風險緩解** | R17 日損斷簽 · R20 物理死鎖 · rootProtection | `circuit-breaker.ts` · `flatten-hardlock.ts` |
| **A1 — 可用性** | Arbitrum AA failover 探測 · RPC radar · 軟確認守衛 | `zerodev-aa-failover.ts` · `rpc-radar.ts` |
| **PI1 — 處理完整性** | EIP-712 域綁定 · GMX payload hash · Gate consume-once | `SliverVineGate.sol` · `gated-executor-payload.ts` |

### 2.2 不可變性與篡改證據

| 層級 | 不可變屬性 | 驗證 |
|-------|----------------------|--------------|
| **Wasm Soil Core** | `#![no_std]` Rust · `<28kb` 預算 · 熱路徑無執行期依賴注入 | `pnpm build:wasm` · `tests/services/wasm-feasibility-lib/*` |
| **L1 認證閘門** | `SliverVineGate.sol` `verifyAndConsume()` — 單次 digest | Forge 套件 · 安全矩陣中 Slither / Aderyn |
| **負向證明** | 屬性測試確認深度 breach 時 soil 熔斷 — 無法靜默放寬 fuse | `pnpm verify:negative` |
| **5-TX 錨點** | HL testnet 上 SHA-256 驗證執行 hash | `pnpm verify:5tx` · `verified-5tx-lib/` |
| **遙測完整性** | 96h 滾動 daemon · grant-audit SWR fallback 永不捏造 loss | `pnpm telemetry:96h` · `GET /api/grant-audit` |

### 2.3 三柱架構（評委心智模型）

**Pillar 1 — Gatehouse（認證）：** **可選加入 Pillar 1 帳戶抽象層** — ZeroDev Kernel v3 session keys · EIP-712 範圍 · 名義上限 · AA dry-run 測試框架（`USE_ZERODEV_AA` 預設關閉）。v1.0 有效範圍：Stage ① Sign-in · ③ Gas · ④ Authorize · ⑤ Execute。Stage ② Smart Routing = Reference Harness。Stages ⑥⑦ = Post-Grant。**規格：** [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md)。

**Pillar 2 — 合規入站防火牆（參考護航適配器）：** **場所無關**、單向 AML 防火牆與護航會計層。來自許可入站來源的資本僅單向護送至 Arbitrum；入站 AML 路徑於 **Edge 入站適配器** fail-closed（`src/adapters/across-ingress-bridge.ts`）；在途橋接資本透過**待結算資本辨識不變量**（`IN_FLIGHT_BRIDGE_CAPITAL`、`lostUsd ≡ 0`）誠實標記，直至結算。**Robinhood Chain / Across（`46630`/`4663`）為 Pillar 2 參考護航適配器** — 非產品本體。**規格：** [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md)。

**Pillar 3 — SliverVine Citadel Shield（預執行 Edge Shield）：** **核心技術護城河** — `checkSoilResistance()` · `pkg/soil_core.wasm` · R01–R20 Defense Matrix · p50 ~106 µs Shield 路徑。Pillar 3 決定是否允許任何廣播。**規格：** [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md)。

```text
[ Allocator Capital ]
 │
 ▼
┌─────────────────────────────────────┐
│ Pillar 1: GATEHOUSE (Opt-In AA) │ ZeroDev Kernel v3 · EIP-712 · Session Keys
└──────────────────┬──────────────────┘
 ▼
┌─────────────────────────────────────┐
│ Pillar 2: COMPLIANCE INGRESS │ Venue-agnostic AML escort & accounting
│ FIREWALL │ Pillar 2 Reference Escort Adapters (Robinhood / Across)
│ │ · outbound-only · AML inbound block
└──────────────────┬──────────────────┘
 ▼
┌─────────────────────────────────────┐
│ Pillar 3: SLIVERVINE CITADEL SHIELD │ checkSoilResistance() · Wasm · R01–R20
│ (Pre-Execution Edge Shield)         │ 04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md
└─────────────────────────────────────┘
```

**評委命令包：**

```bash
pnpm test -- --run # 192 test files | 836 PASS Clean (100% PASS)
pnpm audit:security # 3-Tier matrix
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
pnpm exec vitest run tests/adapters/zerodev-aa-gate.test.ts
```

---

## 3. 模擬、壓力測試與混沌工程框架

SliverVine Protocol 維護**三層模擬堆疊** — 機構市場重播（Survival Benchmark）、AA/session dry-run 閘門（ZeroDev + HL）、對抗混沌矩陣 — 各層產出 CLI 可驗證產物，通過準則為 **`capitalLossUsd: 0`**。

```text
Layer 1 — Survival Benchmark scripts/survival-benchmark/ (30D HL L2 + Dual-Radar replay)
Layer 2 — AA / Session Dry-Run tests/adapters/* (Pre-bundler fail-closed proofs)
Layer 3 — Chaos Engineering scripts/chaos-blackswan-stress.ts (255-scenario matrix)
```

> **路徑說明：** Survival Benchmark 引擎位於 **`scripts/survival-benchmark/`**（經 `scripts/generate-survival-report.ts` 調用）。不存在 `tests/survival-benchmark/` 目錄 — 混沌回歸覆蓋於 `tests/scripts/chaos-blackswan-stress.test.ts`。

### 3.1 Survival Benchmark — 3σ 黑天鵝與流動性抽乾模擬

Survival Benchmark 融合 **30 天 Hyperliquid 主網歷史**與即時 L2 訂單簿 walk，於 funding 衝擊、基差爆發與深度蒸發下壓力測試 Citadel 包絡。

| 參數 | 鎖定值 | SSOT |
|-----------|-------------|------|
| 標準名義 | **$100,000** | `NOTIONAL_USD` · `survival-benchmark.types.ts` |
| 壓力名義 | **$1,000,000** | `STRESS_NOTIONAL_USD` |
| 回溯 | **30 天** | `LOOKBACK_MS` |
| 黑天鵝降級閾值 | 綜合分 **< 30** | `DEGRADE_THRESHOLD` |
| 深度下限 | **$100,000** | `MIN_DEPTH_USD` |
| 滑點 fuse | **0.5%** | `MAX_SLIPPAGE` |

**執行：**

```bash
pnpm tsx scripts/generate-survival-report.ts
# Output: docs/0801_BeDelta_Survival_Benchmark.md
```

#### 3.1.1 Dual-Radar 五感測器矩陣（黑天鵝體制偵測）

`HLRadarEvaluator`（`scripts/survival-benchmark/hl-radar-evaluator.ts`）對每小時 tick 評分：

| 感測器 | 功能 | 黑天鵝信號 |
|--------|----------|-----------------|
| **S1–S3** | Funding · premium · 綜合 funding 壓力 | 負 funding 持續 · 利率異常 |
| **S4 — Whale / liq wall** | `scoreS4WhaleLiq()` | 清算磁力接近 · 槓桿結構牆突破 |
| **S5 — Basis Z-score** | `scoreS5BasisZ()` | **\|Z\| ≥ 3** → 分數崩至 ≤ 8（3σ 基差爆發） |

當加權綜合分低於 **`DEGRADE_THRESHOLD` (30)** 時，報告進入**黑天鵝體制**：`SystemState` 降級、HUD 鎖定，Phase 3 `AntiFragileYieldService` 啟動每小時 HL funding boost（預設 **1.5×** short-leg 補貼）— 模擬風暴收益捕獲而不開裸 delta。

#### 3.1.2 流動性抽乾與深度 Walk

| 模組 | 檔案 | 模擬內容 |
|--------|------|-------------------|
| **L2 book walk** | `book-simulation.ts` · `walkBook()` | @$100k / $1M 名義的 top-of-book 消耗 |
| **即時指標** | `computeLiveBookMetrics()` | 價差 · 最小側深度 · 價格衝擊 bps |
| **Soil 審計** | `auditLiveBookSoilResistance()` | `depthUsd < MIN_DEPTH_USD` 或滑點 > fuse 時 fail-closed |
| **Market vs SLI-TWAP** | `dualLegMarketSlip()` vs `simulateSliTwap()` | 流動性抽乾成本 — 裸 sweep vs 路徑切片護航 |
| **Phase 隔離** | `phase-isolations.ts` | 單變量武器分階（Base 3-path → Full 30-path TWAP） |

Phase 5/6（`phase-isolation-p5p6.ts`）進一步以合成深度崩潰（`depthUsd: MIN_DEPTH_USD × 0.2`）與雙場所價格分歧壓力測試**跨場所 soil** — 證明毒性 GMX/HL 廣播前 soil 熔斷。

#### 3.1.3 Survival Benchmark 判定欄位（評委檢查清單）

| 欄位 | 通過姿態 |
|-------|-------------|
| `soilAudit.tripped` @ $100k | 正常即時簿下為 **false** |
| `saved100`（TWAP vs market） | 相對裸 sweep 為正滑點節省 |
| `blackSwanHours` | 已計數 · 反脆弱引擎啟動 · 無未對沖 NAV |
| `mddAf` vs `mddBase` | 風暴重播下反脆弱路徑 MDD ≤ 基線 |

---

### 3.2 ZeroDev / Hyperliquid Dry-Run 測試框架

AA/session dry-run 堆疊證明**任何 UserOp 或 HL 簽名離開 Citadel 包絡前** Gatehouse fail-closed 行為。主要回歸檔：**`tests/adapters/zerodev-aa-gate.test.ts`**（4/4 PASS）。

```bash
pnpm exec vitest run tests/adapters/zerodev-aa-gate.test.ts
pnpm test:zerodev # Mock bundler + session constraint audit
pnpm exec vitest run tests/services/session-key-gates.test.ts # R07 $5K cap
pnpm exec vitest run tests/services/nonce-auto-healing.test.ts # 30s heartbeat expiry
```

#### 3.2.1 `zerodev-aa-gate.test.ts` — Citadel + Paymaster Fail-Closed

| 測試 | 斷言 | 控制 |
|------|-----------|---------|
| 健康 soil 通過 | `assertCitadelRiskGate()` · `sequencerSafe: true` · chain `42161` | soil + sequencer + 軟確認探測後的基線 AA 路由 |
| Soil 熔斷 | `RiskLimitExceeded` · `TRIP_SOIL_RESISTANCE` · event `SOIL_RESISTANCE_TRIP` | 跨場所滑點 **> 0.5%** 於 bundler 前阻擋 UserOp |
| 每 UserOp gas 上限 | gas **> $0.50** 時 `ZERODEV_GAS_LIMIT_EXCEEDED_TRIP` | `MAX_GAS_COST_PER_USEROP_USD` · `ROOT_PROTECTION_TRIP` |
| 每日 Paymaster 耗盡 | **$10/day** 時 `sponsored: false` · `ZERODEV_DAILY_SPONSORSHIP_EXHAUSTED` | `DAILY_SPONSORSHIP_LIMIT_USD` — **fail-closed 至自付**，非無防護廣播 |

#### 3.2.2 R07 — $5,000 Session Key 名義上限

R07 於 **HL session-key 簽名管線**（`session-key-gates.ts`）強制，於配套測試中證明：

```typescript
// tests/services/session-key-gates.test.ts
// limitPx=6000 × sz=1 → SESSION_CAP=6000.00>5000 → signing channel severed
```

| 常數 | 值 | SSOT |
|----------|-------|------|
| `SESSION_KEY_NOTIONAL_CAP_USD` | **$5,000** | `session-key-types.ts` |
| 違規行為 | `SESSION_KEY_HARDLOCK_INTERCEPTED` · `signingChannelOpen: false` | `assertSessionKeyExecutionGates()` |

超過 **$5,000** 名義的訂單觸發熱簽名通道**物理斷簽** — 無部分成交、無降級至無範圍簽名。

#### 3.2.3 30s TTL Heartbeat / Intent Execution Window — Session Heartbeat 與 Intent 過期

**30s TTL Heartbeat / Intent Execution Window** 橫跨 WS heartbeat、intent ledger 與 session 撤銷 — **不同於**底層密碼學 session key 生命週期（依模組範圍上限 **24h / 7d**）：

| 機制 | 常數 | SSOT | 測試錨點 |
|-----------|----------|------|-------------|
| **HL WS heartbeat 間隔** | `WS_HEARTBEAT_INTERVAL_MS = 30_000` — Intent Execution Window | `adapters/hl/websocket/types.ts` | `websocket-client-lifecycle.test.ts` |
| **Heartbeat 過期 → 鎖定** | `SESSION_KEY_HEARTBEAT_EXPIRED` | `nonce-auto-healing.ts` | `nonce-auto-healing.test.ts` |
| **2PC intent TTL** | `DEFAULT_TTL_MS = 30_000` | `intent-ledger/defaults.ts` | `intent-persistence.test.ts` |
| **密碼學 session key 生命週期** | 上限 **24h / 7d**（依模組範圍） | `agent-intent.ts` · ZeroDev Kernel session modules | `session-key-gates.test.ts` |

Heartbeat 過期時，`auditSessionKeyHeartbeat()` 設 `revocationLocked: true` — 過期 session key 無法簽署新 HL 訂單。跨腿 intent 超過 **30s** 以 `CRASH_RECOVERY_TTL_EXPIRED` 中止，防止孤兒場所腿。

#### 3.2.4 延伸 Dry-Run 矩陣

| 測試框架 | 命令 | 範圍 |
|---------|---------|-------|
| **ZeroDev AA Dry-Run** | `pnpm test:zerodev` | Kernel v3 EP 0.7 UserOp 草稿 · `auditSessionKeyConstraints()` · Risk Oracle Gate |
| **HL 恐慌沙盒** | `pnpm tsx scripts/dry-run-sandbox.ts` | 記憶體內 HL testnet 壓力 → EIP-712 管線 · **無網路** |
| **Grant E2E** | `pnpm demo:pipeline`（預設 dry-run） | 完整 Citadel 管線 · 僅 `--live` 可選 |
| **5-TX 錨點** | `pnpm verify:5tx` | HL testnet SHA-256 執行證明 · $1K / $100K / $1M 層級 |
| **負向證明** | `pnpm verify:negative` | 深度 breach → soil 熔斷確認 |

> 生產 Edge SSOT 仍為 Worker 熱路徑上的 **`checkSoilResistance()`**。`zerodev-aa-gate.ts` 為可選 CLI/SDK — dry-run 測試框架證明鄰接閘門，不取代 Edge soil。

---

### 3.3 混沌工程 — 255 情境黑天鵝矩陣

`scripts/chaos-blackswan-stress.ts` 執行涵蓋 soil 熔斷、oracle 滯後、sequencer 不同步、橋接逾時、session 斷簽與 root-protection 級聯的 **255 案例對抗矩陣**。

| 指標 | 鎖定值 | 產物 |
|--------|-------------|----------|
| 總情境數 | **255** | [`chaos-blackswan-metrics.json`](./chaos-blackswan-metrics.json) |
| 阻擋毒性攻擊 | **255/255** | 同上 |
| Fail-closed 率 | **100.00%** | 同上 |
| 資本損失 | **`$0`** | `capitalLossUsd: 0` |
| 回歸 | Vitest 包裝 | `tests/scripts/chaos-blackswan-stress.test.ts` |

**夜間屬性 fuzz**（`pnpm audit:nightly` · 327,675 Forge 執行）補充離散混沌矩陣，用於 L1 認證（`SliverVineGate.sol`）重播安全。

### 3.4 持續回歸門檻

| 測試框架 | 命令 | 預期 |
|---------|---------|----------|
| **全量 Vitest** | `pnpm test -- --run` | **192 test files \| 836 PASS Clean (100% PASS)** |
| **Grant 風控 sim（v1.0 套件）** | `pnpm test:grant-v09-sim` | AA / 風控 sim PASS |
| **Wasm 可行性** | `pnpm test:wasm-feasibility` | Soil Wasm sim PASS |
| **安全矩陣** | `pnpm audit:security` | **三層級 5/0/0 PASS** |
| **屬性 fuzz（Forge）** | `pnpm audit:nightly` | Gate + 認證屬性 |

---

## 4. 資本容量與執行時序：Arbitrum 原生 vs. Pillar 2 參考護航適配器

V1.0 暴露兩種**資本入站模式**，匯聚於相同 Citadel 預執行包絡（`checkSoilResistance()` · R01–R20）。Robinhood / Across 為 **Pillar 2 參考護航適配器** — 非收益堆疊產品。兩條路徑均不提高共用 **$100,000 Alpha Vault TVL 上限**。

### 4.1 結構化對照表

| 維度 | **Arbitrum 原生 Vault** | **Pillar 2 參考護航適配器（Robinhood）** |
|-----------|---------------------------|------------------------------|
| **主要資產** | Arbitrum One 上 USDC（`42161`） | Robinhood Chain 上 USDG（`46630` / `4663`） |
| **V1.0 Alpha Vault TVL 上限** | **$100,000** 硬上限（roadmap spec） | **$100,000** — 護航不擴展容量 |
| **入站延遲** | **即時** — 資本已在 `42161` | **依 Across 橋接** — 通常數分鐘至 ≤ **1 小時** |
| **至 soil-gate 時間** | **p50 ~106 µs** Wasm fuse · 亞秒 intent-to-gate | `SETTLED` 後相同；結算前**零**部署 |
| **單筆上限（v1.0 live）** | `SESSION_KEY_NOTIONAL_CAP_USD` = **$5,000** | 橋接結算前 N/A |
| **單筆上限（v1.0 設計）** | `ORDER_SIZE_MAX_USD` = **$100,000** | 僅 `SETTLED` 後；在途不計入 NAV |
| **HL 深度前提** | `MIN_DEPTH_USD` = **$100,000** | 結算後相同對沖腿要求 |
| **缺口窗口收緊** | HL gap guard：深度 **2×**（$200k）· 槓桿 **3× → 1×** | 橋接 **fail-closed** — 在途期間無裸 GM/HL |
| **橋接逾時** | N/A | `DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS` = **1 小時** → `BRIDGE_TIMEOUT_FAIL_CLOSED` |
| **合規防火牆** | 標準 DeFi + Citadel soil | **僅單向出站** · `AML_INBOUND_TO_ROBINHOOD_BLOCKED` |
| **會計標籤（在途）** | N/A | `IN_FLIGHT_BRIDGE_CAPITAL` · **`lostUsd ≡ 0`** |
| **GMX 結算窗口** | **3–5 分鐘** 非同步（兩路徑相同） | 部署後相同 |
| **HL 提領窗口** | **~15 分鐘**（兩路徑相同） | 對沖腿 live 後相同 |
| **建議用途** | 既有 Arb USDC / GM 部位 | Robinhood USDG earn + 機構合規護航 |

**量化錨點：** **$100,000** 為 `MIN_DEPTH_USD`、`ORDER_SIZE_MAX_USD`、Survival Benchmark `NOTIONAL_USD` 與 `01_TECHNICAL_SPECIFICATION.md` §3.6 Alpha Vault Cap 的程式碼驗證匯聚點。

**程式 SSOT：**

| 路徑 | 模組 | 測試 |
|------|--------|------|
| Arbitrum 原生 sizing | `trade-pipeline-order-sizing.ts` · `soil-resistance-types.ts` | `tests/risk-control/*` |
| Robinhood 護航 | `src/adapters/across-ingress-bridge.ts` | `tests/adapters/across-ingress-bridge.test.ts`（**5/5**） |
| 鏈上 AML 防火牆 | `IngressSafetySwitch.sol` | [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) |

### 4.2 執行時序 — 即時 vs. 在途狀態機

#### Arbitrum 原生（即時路徑）

```text
USDC on 42161
 │
 ▼
checkSoilResistance() ← p50 ~106 µs · MAX_SLIPPAGE 0.5% · MIN_DEPTH $100k
 │
 ├─► GMX v2 GM deposit ← async settlement 3–5 min
 └─► HL 1× short (Session Key) ← EIP-712 · R07 $5k live cap
```

資本於 soil 通過後**可立即部署**。無橋接狀態機；延遲主要由 GMX keeper 結算與 HL 簽名管線主導 — 非跨鏈轉帳。

#### Robinhood 護航（延遲路徑）

```text
USDG on 46630/4663
 │
 ▼
evaluateAcrossBridgeTransfer() ← validateAcrossBridgeDirection() — outbound-only
 │
 ├── AVAILABLE
 │ │
 │ └── initiate Across ──► IN_FLIGHT_BRIDGE_CAPITAL (lostUsd ≡ 0 · no naked delta)
 │ │
 │ ├── settle ──► SETTLED → full Citadel envelope
 │ │
 │ └── > 1h ──► BRIDGE_TIMEOUT_FAIL_CLOSED
 │
 └── 42161 → Robinhood inbound ──► AML_INBOUND_TO_ROBINHOOD_BLOCKED (fail-closed)
```

| `capitalLabel` | 可部署 NAV？ | 允許裸 GM/HL？ | `lostUsd` |
|----------------|-----------------|----------------------|-----------|
| `AVAILABLE` | 否 | 否 | **0** |
| `IN_FLIGHT_BRIDGE_CAPITAL` | **否** | **否** | **0** |
| `SETTLED` | 是 | 否 — soil-gated | **0** |
| `BRIDGE_TIMEOUT_FAIL_CLOSED` | 否 | 否 | **0** |
| `AML_INBOUND_TO_ROBINHOOD_BLOCKED` | 否 | 否 | **0** |

> **配置者不變量：** 橋接延遲**無法**開啟未對沖 delta。在途資本標記、不部署，直至 `SETTLED` — Vitest 5/5 驗證。

### 4.3 共用防禦下的容量包絡

兩條路徑共享相同部署後約束：

| 控制 | 值 | 適用時機 |
|---------|-------|---------------|
| Alpha Vault TVL 上限 | **$100,000** | `SETTLED` / 原生 Arb |
| Soil 深度下限 | **$100,000**（`MIN_DEPTH_USD`） | 每筆對沖 clip |
| 跨場所滑點 fuse | **0.5%**（`MAX_SLIPPAGE`） | 每次再平衡 |
| Dynamic Max SL（R11） | Dynamic Account Risk Ceiling（V0.8 Baseline：權益加權 SL；V1.0 Mainnet：Dynamic Adaptive Engine） | @$100k 權益 → **$1,100** |
| 緩衝目標 | **5–10%** 預對沖 | `buffer-engine.ts` |

於 **HL 訂單簿缺口窗口**（HKT 海嘯 · UTC 週末），原生路徑再平衡 clip 自 $100k 基準縮至 **~$33,333**（槓桿 **3× → 1×**）；護航路徑於在途資本上無論缺口體制均保持 **fail-closed**。

### 4.4 路徑選擇指南

| 情境 | 路徑 | 理由 |
|----------|------|-----------|
| 財庫已在 Arbitrum One | **Arbitrum 原生** | 零橋接延遲 · 即時 soil 閘門 |
| Robinhood USDG 機構 earn + 合規通道 | **Robinhood 護航** | 僅出站 AML 防火牆 · 誠實在途會計 |
| 3σ 風暴 · sequencer 寬限 · soil 熔斷 | **兩者皆非** | 兩路徑均 `signingChannelOpen: false` |

```bash
# Verify bridge state machine + AML inbound block
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
```

---

## 5. 監管與機構合規對齊

> **免責聲明：** 本節將 SliverVine Protocol 架構控制映射至**廣泛引用的機構框架**（Basel III 營運風險 · Expected Shortfall · SOC 2 TSC · MiCA 營運韌性原則）供配置者盡職。此**非**銀行牌照、MiCA CASP 授權、SOC 2 Type II 鑑證或正式 Pillar 合規聲明。

### 5.1 Basel III 營運風險 → Fail-Closed Citadel 控制

Basel III 營運風險原則要求可識別控制、損失限額及模型超出容忍度時的故障安全斷簽。SliverVine Protocol 以**程式強制謂詞**實作 — 非政策文件。

| Basel III / AMA 支柱 | SliverVine Protocol Fail-Closed 控制 | 程式 / 測試錨點 |
|------------------------|-------------------------|-------------------|
| **風險識別** | 預廣播 soil 矩陣 — 深度 · 跨價差 · 滑點 | R01 · `checkSoilResistance()` · `soil-resistance.ts` |
| **風險評估與計量** | Dynamic Max SL · order-aware soil 預算 · 日損上限 | R11 · R17 · `effective-max-sl.ts` |
| **控制與緩解** | Session 範圍 · 名義上限 · Paymaster 帳本 · 2PC Saga | R06 · R07 · R09 · `session-key-gates.ts` |
| **監控與報告** | Grant audit API · 96h 遙測 · HUD guard 狀態 | `GET /api/grant-audit` · `pnpm telemetry:96h` |
| **故障安全斷簽** | R20 物理死鎖 · 簽名通道關閉 · rootProtection | `flatten-hardlock.ts` · `circuit-breaker.ts` |
| **情境分析** | 255 案例混沌矩陣 · 30D Survival Benchmark | §3 · `chaos-blackswan-metrics.json` |

**Fail-Closed 不變量（所有路徑）：** 任何感測器觸發時，系統**寧可不動作，也不做錯動作** — `signingChannelOpen: false`、UserOp 於 bundler 前拒絕、橋接狀態 `BRIDGE_TIMEOUT_FAIL_CLOSED`。已驗證：**255/255** 混沌情境阻擋 · **`capitalLossUsd: 0`**。

### 5.2 Expected Shortfall（ES）對齊 → 尾部風險預算

Expected Shortfall 捕捉**超出信心閾值的平均損失** — VaR 之外的尾部。SliverVine Protocol 不在鏈上運行銀行 AMA 模型；改以**硬尾部損失上限**作為營運 ES 守衛：

| ES 概念 | SliverVine Protocol 量化守衛 | @$100k vault 權益 |
|------------|--------------------------|----------------------|
| **每 clip 尾部損失** | Order-aware Max SL = min(Dynamic Max SL, order × 0.5% fuse) | @$100k 名義 **$500** 最大 soil 損失 |
| **Dynamic Max SL（R11）** | Dynamic Account Risk Ceiling（V0.8 Baseline：權益加權 SL；V1.0 Mainnet：Dynamic Adaptive Engine） | **$1,100** |
| **每日 ES 包絡（R17）** | `Effective Max SL × 3` | **$3,300** 日斷簽預算 |
| **壓力名義（Survival Benchmark）** | `STRESS_NOTIONAL_USD` = **$1,000,000** | 10× Alpha Cap 尾部重播 |
| **黑天鵝矩陣** | 255 對抗情境 · 100% fail-closed | **`capitalLossUsd: 0`** |
| **3σ 基差爆發** | Dual-Radar S5 · 綜合分 < 30 → 降級 + 反脆弱 | §3.1 · `scoreS5BasisZ()` |

```text
Per-clip tail ≤ min($1,100, notional × 0.5%) ← R11 + soil fuse
Daily tail ≤ Effective Max SL × 3 ← R17 severance
Portfolio tail ≤ $100k Alpha Cap + stress replay ← §4 + Survival Benchmark
```

**誠實會計（`lostUsd ≡ 0`）：** 待結算橋接流動性**永不計入損失分布** — 消除在途資本造成的幻影 ES 通膨。僅明確、soil 有界的執行損失可累積；橋接逾時僅標記狀態、不確認 P&L。

| 會計狀態 | 計入 ES？ | `lostUsd` |
|------------------|-------------------|-----------|
| `IN_FLIGHT_BRIDGE_CAPITAL` | **否** — 待結算 | **0** |
| `BRIDGE_TIMEOUT_FAIL_CLOSED` | **否** — 流程失敗，非損失事件 | **0** |
| Soil 熔斷拒單 | **否** — 預執行 fail-closed | **0** |
| 有界執行滑點 | **是** — 受 order-aware Max SL 上限 | ≤ fuse 預算 |

**SSOT：** `evaluateAcrossBridgeTransfer()` · `computeOrderAwareMaxSlUsd()` · Vitest **192 test files \| 836 PASS Clean (100% PASS)**。

### 5.3 0-Proxy 不可變基礎設施（SOC 2 對齊）

**0-Proxy** 表示 SliverVine Protocol 的**非託管、非再質押架構**：用戶本金存放於 ZeroDev Kernel Smart Accounts（選擇 AA 時）或機構 EOA — 協議永不作為資產負債表代理、綜合錢包或裁量簽署者。不可變產物防止部署後篡改預執行閘門。**Wasm Shield 與 AA 獨立運作。**

| SOC 2 TSC 域 | 0-Proxy / 不可變控制 | 驗證 |
|------------------|----------------------------|--------------|
| **CC6 — 邏輯存取** | 範圍 Session Keys（僅 `ORDER_EXECUTE`）· **30s TTL Heartbeat / Intent Execution Window**（密碼 key 上限 24h/7d）· R07 $5k 上限 | `session-key-gates.ts` · `nonce-auto-healing.test.ts` |
| **CC7 — 系統營運** | Sequencer 600s 寬限 · oracle >30s fail-closed · PGATE 200ms | `sequencer-guard.ts` · `PGATE_MAX_LATENCY_MS` |
| **CC8 — 變更管理** | 釘選 `#![no_std]` Wasm · BUSL-1.1 · Worker bundle 量測 | `pkg/soil_core.wasm` · `pnpm bundle:measure` |
| **CC9 — 風險緩解** | L1 `verifyAndConsume()` 單次 digest · 無重播 | `SliverVineGate.sol` · Forge 60+ PASS |
| **PI1 — 處理完整性** | EIP-712 域綁定 · GMX `payloadHash()` calldata 鎖定 | `gated-executor-payload.ts` |
| **A1 — 可用性** | Arbitrum AA failover · RPC radar · 軟確認守衛 | `zerodev-aa-failover.ts` |

**不可變性堆疊：**

```text
Layer 1 — Wasm Soil Core (#![no_std], <28kb) → hot-path fuse, no runtime injection
Layer 2 — SliverVineGate.sol (consume-once) → L1 attestation digest lock
Layer 3 — Negative proofs + 192 test files | 836 PASS Clean (100% PASS) regression → silent fuse widening impossible
```

> **SOC 2 說明：** 控制**映射**至 AICPA Trust Services Criteria 以透明化 — SliverVine Protocol **不**宣稱 SOC 2 Type II 認證。完整 TSC 表見 §2.1。

### 5.4 單向 AML 防火牆（MiCA 對齊）

MiCA（加密資產市場法規）強調加密資產服務提供者的**營運韌性、客戶資產隔離與健全治理**。SliverVine Protocol 的 Robinhood 護航實作**單向 AML 合規防火牆** — 架構對齊 MiCA 隔離原則，**不宣稱 CASP 授權**。

| MiCA 對齊原則 | SliverVine Protocol 實作 | SSOT |
|------------------------|---------------------|------|
| **資產隔離** | 用戶資金於 Kernel Smart Accounts（可選 AA）或 EOA — 非協議國庫 | ZeroDev Kernel v3 · 非託管 SSOT · 原生入站 fallback |
| **營運韌性** | 橋接逾時 fail-closed · sequencer 寬限 · soil 熔斷 | R01–R20 矩陣 |
| **衝突 / 污染防範** | **僅出站**護航 · 入站反向路徑阻擋 | `validateAcrossBridgeDirection()` |
| **AML 入站隔離** | `42161 → 46630/4663` → `AML_INBOUND_TO_ROBINHOOD_BLOCKED` | `src/adapters/across-ingress-bridge.ts` |
| **鏈上不變量強制** | **`IngressSafetySwitch.sol`** 地址級 oracle flush + 黑名單 · 入站 AML 於 **`src/adapters/across-ingress-bridge.ts`** | [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) |
| **誠實待結算資產標記** | `IN_FLIGHT_BRIDGE_CAPITAL` · **`lostUsd ≡ 0`** | Vitest **5/5** |

```text
[ Robinhood USDG ] ──outbound-only──► [ Arbitrum Citadel Vault ]
 ▲ │
 │ │
 INBOUND BLOCKED ◄───────────────────────────┘
 AML_INBOUND_TO_ROBINHOOD_BLOCKED
```

**評委驗證：**

```bash
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts # 5/5 — AML + in-flight
pnpm test -- --run # 192 test files | 836 PASS Clean (100% PASS)
```

### 5.6 ArbOS Elara 合規對齊與動態目標區間

> **V1.0 設計規格。** SliverVine Protocol 的 **Pillar 2 合規入站防火牆** 原生對齊 **ArbOS Elara 升級** — Arbitrum 協議級入站過濾平面 — 將**交易排序感知**記錄為 Edge fail-closed 閘門的強化層。見 [`02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](../architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos--stylus-alignment--code-verified-on-chain-coprocessor)。

| 合規平面 | 功能 | UI / 程式錨點 |
|------------------|----------|------------------|
| **Edge SSOT（預廣播）** | Soil 矩陣 · 簽名通道斷簽 · UserOp 閘門 | `checkSoilResistance()` · `zerodev-aa-gate.ts` |
| **Pillar 2 合規入站防火牆 + ArbOS Elara** | 場所無關出站護航 · 入站 AML 阻擋 · Robinhood / Across 為 **Pillar 2 參考護航適配器** · Elara 於 GM payload 建構前丟棄不合規/黑名單發送者 | [`02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](../architecture/02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos--stylus-alignment--code-verified-on-chain-coprocessor) · `IngressSafetySwitch.sol` · `src/adapters/across-ingress-bridge.ts` |
| **Sequencer / 排序感測器** | ArbOS base-fee 速度 · sequencer 寬限 — 不同步期間禁止裸開倉 | `arbitrum-gas-guard.ts` · `sequencer-guard.ts` |
| **多 tranche 示範 HUD** | Tranche A 原生 vault vs Tranche B 橋接狀態機 | `SmartRoutingDepositCard` · `deposit-tranche-config.ts` |
| **反應式 HUD 警示** | 配置者機構 trip 文案 | `compliance-trip-alerts.ts` · `LivingWaterShieldCard` · `AMLShieldCard` |

**Fail-closed trip 代碼（UI SSOT）：**

| Trip 代碼 | 卡片 | 行為 |
|-----------|------|----------|
| `SYSTEM_FAIL_CLOSED_TRIP` | Living Water Shield | 風暴變體 · 派單阻擋 · `aria-live="assertive"` 橫幅 |
| `ORACLE_LAG_DEADLOCK` | Living Water Shield | Oracle 滯後 >30s · 派單阻擋 |
| `BRIDGE_TIMEOUT_FAIL_CLOSED` | AML Shield | Across >1h 逾時 · 匯出阻擋 · 在途資本標記 · `lostUsd ≡ 0` |

**動態目標區間與 Hurdle Gate（收益揭露）：**

| 參數 | 值 | SSOT |
|-----------|-------|------|
| **動態目標區間** | **8.2% ~ 11.8% APY**（非保證顯示帶） | `App.tsx` · [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) §6.5 |
| **Hurdle Gate 摩擦緩衝** | **+0.5%**（`FRICTION_BUFFER_APY = 0.005`） | `rebalance-rules.ts` |
| **再平衡謂詞** | 僅當超額收益超過摩擦緩衝時部署 | `resolveCapitalAllocation()` · `passesDeltaNeutralHurdle()` |

> **配置者說明：** 8.2–11.8% 帶為 **HUD 揭露用動態目標區間**，非保證回報。績效結晶仍受 Hurdle Gate 摩擦緩衝與規劃中 Aave + 1.5% 績效門檻（Invariant #24）閘門。*（僅門檻率探測 — 非收益堆疊產品軌道）*。

> **Variational Omni RFQ（v1.0 Live）：** **第七原生協議** — `validateVariationalRFQIntent()` → `evaluateVariationalFlags()` · quote stale **>500ms** 或 oracle drift **>30 bps** · OLP 深度利用率 **>15%** · **Bits 12–13** 綁定 `FLAGS_AUTO_SEVER_MASK` · `pnpm demo:matrix -- --loop=perp --hedge=variational`。

### 5.7 三道防線與配置者 FAQ

| 防線 | 職能 | SliverVine Citadel Shield 層級 |
|------|----------|------------|
| **第一道** | 業務營運 | 收益門檻 · 緩衝引擎（5–10%）· 再平衡規則 |
| **第二道** | 風控與合規 | Fail-closed soil · PGATE · AML 防火牆 · 橋接會計 |
| **第三道** | 獨立保證 | **192 test files \| 836 PASS Clean (100% PASS)** · Survival Benchmark（§3）· 混沌矩陣 · DDIP |

| 問題 | 答案 | 驗證 |
|----------|--------|--------|
| 橋接延遲會否造成裸 delta？ | **否** — `IN_FLIGHT` 資本不可部署 | 橋接測試 5/5 |
| Session key 能否提領用戶資金？ | **否** — 僅 `ORDER_EXECUTE` 範圍 | `session-key-gates.ts` |
| 是否已 SOC 2 / MiCA 認證？ | **未宣稱** — 僅架構對齊 | §5.3 · §5.4 |
| 上線最大 vault 規模？ | **$100,000** V1.0 Alpha Cap | §4.1 · Tech Spec §3.6 |
| Live loss 何處報告？ | `GET /api/grant-audit` · 正常運營下 `lostUsd: 0` | Live 端點 |

---

## 6. 資金會計不變量

SliverVine Protocol 將**誠實會計**作為硬不變量 — 待結算流動性永不誤記為本金損失。

### 6.1 待結算資本辨識不變量 — `lostUsd ≡ 0`

| `capitalLabel` | 經濟含義 | 可部署 NAV | `lostUsd` |
|----------------|------------------|----------------|-----------|
| `AVAILABLE` | 橋接前 Robinhood USDG | 否 | **0** |
| `IN_FLIGHT_BRIDGE_CAPITAL` | Across 橋接在途 | **否 — 禁止裸腿** | **0** |
| `SETTLED` | Arbitrum One 可用 USDC | 是 | **0** |
| `BRIDGE_TIMEOUT_FAIL_CLOSED` | >1h 逾時 — fail-closed 斷簽 | 否 | **0** |
| `AML_INBOUND_TO_ROBINHOOD_BLOCKED` | 反向路徑阻擋 | 否 | **0** |

**SSOT：** [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) 中的 `evaluateAcrossBridgeTransfer()`

```typescript
/** Always 0 — pending bridge liquidity is never booked as loss. */
lostUsd: number;
```

### 6.2 動態風險預算（R11）

| 公式 | @$100k 權益 | SSOT |
|---------|---------------------|------|
| **Dynamic Max SL** | Dynamic Account Risk Ceiling（V0.8 Baseline：權益加權 SL；V1.0 Mainnet：Dynamic Adaptive Engine）→ **$1,100** | `effective-max-sl.ts` |
| **日損上限（R17）** | Max SL × 3 → **$3,300** | `DAILY_LOSS_CAP_MULTIPLIER` |
| **跨場所滑點 fuse** | **0.5%**（`MAX_SLIPPAGE`） | `soil-resistance-types.ts` |
| **Order-aware @$100k 名義** | min($1,100, $500) → **$500** soil 預算 | `computeOrderAwareMaxSlUsd()` |

已廢止固定 **$50 SL** 於工作區協議規則中**嚴禁**，並於 R11 測試中強制。

### 6.3 非託管語義

- 用戶本金存放於 **ZeroDev Kernel Smart Accounts**（選擇 AA 時）或機構 EOA — 非協議國庫。Pillar 3 Wasm Shield 與 AA 可用性獨立運作。
- GMX `uiFeeReceiver`（+10 bps 原生 builder fee）與 GMX referral rebate（最高交易費 **25%**）為協議收益 — 永不與用戶本金混淆。Builder fee 注入僅使用 GMX v2 ExchangeRouter 參數；不改變 v1.0 預執行安全路徑。
- 在途橋接資本**僅標記、不借出** — 程式路徑無再質押宣稱。

### 6.4 交叉引用

入站容量與執行時序完整規定於 **§4**。Basel / ES / MiCA 映射於 **§5**。§6.1 橋接會計標籤僅適用 Robinhood 護航路徑；Arbitrum 原生資本永不進入 `IN_FLIGHT_BRIDGE_CAPITAL` 狀態機。

---

## 7. 驗證清單（機構簽核）

| # | 檢查項 | 命令 / 介面 | 通過 |
|---|-------|-------------------|------|
| 1 | 全量回歸 | `pnpm test -- --run` | **192 test files \| 836 PASS Clean (100% PASS)** |
| 2 | 橋接會計 | `pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts` | 5/5 |
| 3 | ZeroDev 閘門 | `pnpm exec vitest run tests/adapters/zerodev-aa-gate.test.ts` | 4/4 |
| 4 | 安全矩陣 | `pnpm audit:security` | 5/0/0 |
| 5 | 即時審計 | `GET /api/grant-audit` | `lostUsd: 0` |
| 6 | Survival 報告 | `pnpm tsx scripts/generate-survival-report.ts` | 產物生成（§3.1） |
| 7 | 混沌矩陣 | `tests/scripts/chaos-blackswan-stress.test.ts` | 255/255 · `capitalLossUsd: 0` |
| 8 | Session R07 上限 | `tests/services/session-key-gates.test.ts` | `SESSION_CAP>5000` 斷簽 |
| 9 | 負向證明 | `pnpm verify:negative` | Soil 熔斷確認 |
| 10 | 入站路徑對照 | §4.1 表 · `across-ingress-bridge.test.ts` | 5/5 · 狀態機驗證 |
| 11 | 監管映射 | §5.1–§5.4 · `pnpm test -- --run` | Basel/ES/MiCA 表 · **192 test files \| 836 PASS Clean (100% PASS)** |

---

## 關聯文檔

| 文檔 | 用途 |
|----------|---------|
| [`01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) | Yellow Paper — R01–R20 · 正式風險方程式 |
| [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | 風險緩解 · 免責 · 60 不變量 · 壓力測試框架 · Basel 映射 |
| [`05_PRINCIPAL_AUDIT_REPORT.md`](./05_PRINCIPAL_AUDIT_REPORT.md) | 四項診斷質詢 · 三柱映射 |
| [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) | Pillar 1 — ZeroDev Kernel v3 AA · EIP-7702 比較 |
| [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) | Pillar 2 — AML 護航 · 入站阻擋 · 橋接會計 |
| [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) | Pillar 3 — SliverVine Citadel Shield · Wasm soil 核心 |
| [`static-analysis-report.json`](./static-analysis-report.json) | 三層級安全矩陣產物 |
| [`chaos-blackswan-metrics.json`](./chaos-blackswan-metrics.json) | 255 情境對抗矩陣 |

---

**編製：** SilverVine Labs 風控與合規文檔組  
**最後更新：** 2026-09-05 · 分支基線：`V1.0_b4_Buildaton_Submisson` · **風險與免責聲明** · 三柱架構 · BeΔ 哲學
