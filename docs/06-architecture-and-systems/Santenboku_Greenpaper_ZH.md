# Santenboku 綠皮書

**SliverVine Protocol · Santenmoku v0.8.0-rc1**  
**SilverVine Labs — 商業 · 智慧財產 · 補助策略**  
**架構設計：:qum[x0sumx]**

**分類：** 面向補助 · 可談判 · 零去識別化  
**授權（程式碼庫）：** BUSL-1.1 · **IP 所有權：** 100% 由 `:qum[x0sumx]` / SilverVine Labs 保留  
**聯絡窗口：** `github@silvervinelabs.com` · [silvervinelabs.com](https://silvervinelabs.com) · [slivervine.xyz](https://slivervine.xyz)

---

## 1. 執行摘要

Santenboku 是一套跨場域的量化風險執行堆疊 — Hyperliquid · Polymarket · Jupiter · dYdX — 統一於 **20-Root Defense Matrix**（Pgate）與零私鑰 **Dry-Run Sandbox Engine** 之下。系統在任一實盤訂單送達交易所之前，即強制執行動態 Max SL（`Balance × 1% + $100`）、資本洩漏感測、60 秒死鎖遲滯，以及 session-key 爆炸半徑隔離。

| 支柱 | 能力 | 補助 / 商業價值 |
|---|---|---|
| **Steel Core** | Cloudflare Workers + KV 遙測 | 邊緣原生、可稽核、無 VPS 失血 |
| **Defense Matrix** | 20 Root Protection 規則 + Santenmoku (三天目) DonDon HUD | 行為 + 機器雙層治理 |
| **Zero-Key Sandbox** | `sandboxEngine.ts` · HL mock fills | 審查者可無錢包或 API 金鑰驗證 |
| **Multi-DEX Matrix** | 場域專屬補助閘門 | 平行資金軌道（HL · Poly · Jupiter · dYdX） |

**生產態勢（v0.8.0-rc1）：** 490+ Vitest 案例 · `tsc --noEmit` clean · CI/CD 經 `.github/workflows/ci.yml` · 即時健康檢查於 `/api/telemetry/health`。

**架構權威：** 所有系統設計、協定邏輯與 IP 譜系可追溯至 **:qum[x0sumx]**。公開品牌面向：**SilverVine Labs**。執行協定面向：**SliverVine Protocol**。

---

## 2. 補助資金與里程碑拆解

### 2.1 場域補助軌道

| 軌道 | 里程碑重點 | 交付物 | Zero-Key Gate |
|---|---|---|---|
| **Hyperliquid** | Session Key + Dynamic Max SL | `hyperliquidAdapter.ts` · EIP-712 dry-run | `HL_DRY_RUN` |
| **Polymarket** | Tail-Hedge Architecture | 跨場域 soil + hedge trigger | `POLYMARKET_DRY_RUN` |
| **Jupiter** | Edge KV + Combined Slippage | Jupiter soil resistance fuse | `JUPITER_DRY_RUN` |
| **dYdX** | Cross-Venue Depth Feeder | 雙場域深度完整性 | `SOIL_RESISTANCE` |

### 2.2 里程碑資金模型（範本）

| 階段 | 範圍 | 工程（USD） | 法務 / IP（USD） | 總申請額 |
|---|---|---:|---:|---:|
| **M0 — Audit Gate** | Zero-key sandbox · CI green · telemetry health | $15,000 | $5,000 | **$20,000** |
| **M1 — Session Key Hardening** | HL adapter · root protection E2E · leak sensor | $35,000 | $8,000 | **$43,000** |
| **M2 — Multi-Venue Matrix** | Polymarket · Jupiter · dYdX gate parity | $45,000 | $10,000 | **$55,000** |
| **M3 — Production Soak** | 24/7 KV soak · panic recovery · grant reproducibility | $25,000 | $7,000 | **$32,000** |
| **M4 — Public Shield** | silvervinelabs.com HUD · auditor docs · demo hub | $20,000 | $5,000 | **$25,000** |

**累計工程申請：** $140,000 · **累計法務/IP：** $35,000 · **計畫總額：** **$175,000**

> 里程碑金額為談判錨點。實際分期付款綁定可驗證的閘門指令（`npm test`、`npm run test:dry-run`、即時 telemetry JSON）。

### 2.3 法務與國際 IP 預算（PCT / Madrid）

| 項目 | 目的 | 估計成本（USD） | 時程 |
|---|---|---:|---|
| **Prior-art search & freedom-to-operate** | DeFi 風險引擎 · session-key 爆炸半徑 | $8,000 – $12,000 | M0 – M1 |
| **Provisional filing (US)** | 20-Root Matrix · dynamic SL formula · leak sensor | $6,000 – $9,000 | M1 |
| **PCT international phase** | 量化風險編排 · 跨場域 soil fuse | $18,000 – $25,000 | M2 – M3 |
| **Madrid Protocol (trademark)** | Santenboku · SliverVine · DonDon · SilverVine Labs | $4,000 – $7,000 | M2 |
| **Grant compliance counsel** | 里程碑驗收 · BUSL carve-outs · auditor terms | $5,000 – $8,000 | 持續 |
| **Reserve (office actions)** | 審查員回應緩衝 | $10,000 | M3 – M4 |

**IP 計畫小計：** **$51,000 – $71,000**（保守 $35k 基線已併入法務/IP 欄；積極 PCT+Madrid 可擴至完整儲備）。

### 2.4 補助審查者驗證（無需金鑰）

```bash
pnpm install
pnpm exec tsc --noEmit
pnpm exec vitest run
pnpm exec vitest run tests/e2e/grant-sandbox-dryrun.test.ts
curl -s https://slivervine.xyz/api/telemetry/health | jq .
```

預期結果：`zeroKeyDryRun: true` · CRI + circuit breaker 欄位存在 · 100% 測試通過。

---

## 3. 談判策略與 IP 所有權約束

### 3.1 Zero-Doxxing Protocol

| 規則 | 執行方式 |
|---|---|
| **Identity surface** | 公開：`:qum[x0sumx]` · SilverVine Labs · `github@silvervinelabs.com` 僅此 |
| **No personal linkage** | 舊 handle、個人 email、本機 metadata 排除於文件、commit 與補助 PDF |
| **Technical proof over biography** | 以可重現指令、測試數量與 telemetry JSON 為先 — 非創辦人敘事 |
| **Demo scope** | 僅 dry-run sandbox 與公開端點；即時談判不做私鑰 demo |

### 3.2 100% IP 保留 — 不可協商項

| 資產 | 擁有者 | 備註 |
|---|---|---|
| **Source code & architecture** | `:qum[x0sumx]` | BUSL-1.1；無另行書面文件不得轉讓 |
| **20-Root Defense Matrix logic** | `:qum[x0sumx]` | 含 dynamic SL、deadlock、leak sensor、FOMO takeover |
| **DonDon HUD & `:santen[boku` notation** | `:qum[x0sumx]` | 情緒驅動 UX 層；商標候選 |
| **Telemetry schemas & KV keys** | `:qum[x0sumx]` | `system:state`、`telemetry:soak-rolling` 等 |
| **Grant milestone deliverables** | 僅於付費驗收後授權資助方 | 絕不為「曝光」或「孵化」預先轉讓 IP |

### 3.3 談判策略

1. **錨定可驗證閘門，非簡報。** 提供即時重現：clone → test → telemetry curl。降低 FUD，將對話轉向里程碑經濟學。
2. **工程與 IP 分項列帳。** 資助方看見精實開發成本；法務/IP 明確，不藏於「顧問費」。
3. **里程碑託管或分期釋款。** 每筆付款綁定客觀通過/失敗（`npm test`、dry-run E2E、health endpoint schema）。
4. **不做股權換 IP。** 若需策略合作，授權非專屬商業使用 — 保留核心專利/營業秘密堆疊。
5. **場域補助平行推進。** HL / Poly / Jupiter / dYdX 軌道降低單一生態預算依賴。
6. **退場觸發條件：** 強制 IP 轉讓、強制個人 KYC 出現在公開材料、或審計要求暴露私鑰。

### 3.4 允許的補助用語（範本）

> *"SilverVine Labs grants the Funder a non-exclusive, milestone-scoped license to audit and operate the delivered modules for the stated grant purpose. All underlying protocol IP, trade secrets, and derivative improvements remain the exclusive property of :qum[x0sumx]. No Co-authored or joint-invention claims arise from grant funding unless executed under a separate IP agreement."*

---

## 4. 提案與成本敘事框架

### 4.1 不對稱故事

| 維度 | 典型 DeFi Bot Shop | Santenboku (SliverVine) |
|---|---|---|
| **Team shape** | 3–5 通才 dev · $400k+/yr burn | 單一架構師 `:qum[x0sumx]` · 精實 edge stack |
| **Infra cost** | VPS · RPC · monitoring · $2k–8k/mo | Cloudflare Workers + KV · 邊際成本近零 |
| **Risk model** | Static SL · manual kill switch | 20-Root Matrix · dynamic SL · leak sensor · 60s deadlock |
| **Audit surface** | "Trust our closed bot" | Zero-key dry-run · 490+ tests · public telemetry |
| **IP posture** | 不明 fork / copy | BUSL-1.1 · 文件化 100% 保留 |

**敘事：** *低 burn 不代表低價值。* 架構將機構級風險治理壓縮進邊緣原生堆疊，專為補助可重現性與多場域防禦而設。

### 4.2 面向資助方的成本框架

| 項目 | 訊息 |
|---|---|
| **Engineering** | 付費對象是 **可運作、測試證明的閘門** — 非人頭表演 |
| **Legal / IP** | 付費對象是 **可防禦護城河** — 在 copycat matrix 出現前完成 PCT + Madrid |
| **Total program ($175k template)** | **< 一名初階 quant desk 僱用（6 mo）** · 交付生產閘門 + IP 選擇權 |
| **ROI hook** | Session-key 爆炸半徑 + soil fuse = 生態補助 **可控尾部風險** 聲譽護盾 |

### 4.3 電梯簡報（30 秒）

> Santenboku 是 SliverVine Protocol 的跨場域風險外殼 — 20 roots、dynamic stop-loss、zero-key sandbox — 由 :qum[x0sumx] 架構，SilverVine Labs 營運。資助方獲得里程碑閘門、完全可重現的交付物：跑測試、打 telemetry 端點，無需錢包。我們保留 100% 核心 IP；您資助可驗證的生態防禦基礎設施。

### 4.4 異議處理

| 異議 | 回應 |
|---|---|
| *"One-person project — bus factor?"* | 文件化 Pgate SOP、CI/CD、KV telemetry、grant dry-run E2E — 知識在 repo，非口傳 |
| *"Why BUSL?"* | 保護 PCT 前 quant logic；商業授權可另議 |
| *"Can we own the IP?"* | 僅非專屬里程碑授權；核心 matrix 仍屬 `:qum[x0sumx]` |
| *"Show live trading profits"* | Zero-doxxing + grant scope = **風險基礎設施**，非績效行銷；指向防禦指標（CRI、breakers、leak halts） |

---

## 5. 文件控制

| 欄位 | 值 |
|---|---|
| **Version** | 1.0.0 |
| **Protocol** | SliverVine Protocol v0.8.0-rc1 |
| **Author / Architect** | `:qum[x0sumx]` |
| **Entity** | SilverVine Labs |
| **Last updated** | 2026-07-26 |
| **Companion docs** | `Pgate.md` · `README.md` · `docs/GRANT_SUBMISSION.md` |

---

**© 2026 SilverVine Labs. All Rights Reserved.**  
**Architected by :qum[x0sumx]**
