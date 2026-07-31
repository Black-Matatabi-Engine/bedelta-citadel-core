# Santenboku 綠皮書 (Greenpaper)

**SliverVine Protocol · Santenmoku v0.8.0-rc2**  
**SilverVine Labs — 商業 · 智慧財產 · 補助策略 (Business · IP · Grant Strategy)**  
**架構設計 (Architect)：:qum[x0sumx]**

**分類：** 面向補助 · 可談判 · 零去識別化 (Grant-Facing · Negotiable · Zero-Doxxed)  
**授權（程式碼庫）：** BUSL-1.1 · **IP 所有權：** 100% 由 `:qum[x0sumx]` / SilverVine Labs 保留  
**聯絡窗口：** `github@silvervinelabs.com` · [silvervinelabs.com](https://silvervinelabs.com) · [slivervine.xyz](https://slivervine.xyz)

---

## 1. 執行摘要 (Executive Summary)

Santenmoku 是一套跨場域的量化風險執行堆疊 (Multi-Venue Quant Risk Execution Stack) — Hyperliquid · Polymarket · Jupiter · dYdX — 統一於 **20-Root Defense Matrix**（Pgate 防禦閘門）與零私鑰 **Dry-Run Sandbox Engine** 之下。系統在任一實盤訂單送達交易所之前，即強制執行動態 Max SL（`Balance × 1% + $100`）、資本洩漏感測 (Leak Sensor)、60 秒死鎖遲滯，以及 Session-Key 爆炸半徑隔離 (Blast Radius Isolation)。

| 支柱 (Pillar) | 能力 (Capability) | 補助 / 商業價值 (Grant/Commercial Value) |
|---|---|---|
| **Steel Core** | Cloudflare Workers + KV 遙測 | 邊緣原生、可稽核、無 VPS 失血（<350 LOC 單檔限制） |
| **Defense Matrix & HMI** | 20 Root Protection 規則 + Santenmoku (三天目) DonDon HUD | 雙層治理：外有 DonDon 溫柔護航，內有 Javier 鐵血風控 |
| **Zero-Key Sandbox** | `sandboxEngine.ts` · HL mock fills | 審查者可無錢包或 API 金鑰驗證 (`pnpm audit:dry-run`) |
| **Multi-DEX Matrix** | 場域專屬補助閘門 | 平行資金軌道（HL · Poly · Jupiter · dYdX） |

**生產態勢（v0.8.0-rc2）：** 594/594 Vitest 測試案例全數通過（100% Green Matrix）· `tsc --noEmit` clean · CI/CD 經 `.github/workflows/ci.yml` · 即時健康檢查於 `/api/telemetry/health`。

**架構權威：** 所有系統設計、協定邏輯與 IP 譜系可追溯至 **:qum[x0sumx]**。公開品牌面向：**SilverVine Labs**。執行協定面向：**SliverVine Protocol**。

---

### 1.1 人機交互 (HMI) 與 DonDon 攻防一體化雙星架構

Santenmoku 引入具備太極哲學的「攻防一體化」高質感人機交互（HMI）：

* **外殼 (DonDon Co-Pilot)**：人性化溫柔護航。當觸發風控時呈現 `🐾 [DonDon Co-Pilot]` 護航日誌，並自動轉換 UI 狀態至 **`( GUARD 陰 MODE )`**（以圓包覆資本），提示用戶「Javier 已為你鎖定最大風險於 $Equity \times 1\% + \$100$」。當行情具備強地基時，則轉入 **`( ATTACK 陽 MODE )`** 動態擴展獲利空間。
* **內核 (Javier Quantitative Risk Engine)**：底層焊死 Kyle's Lambda 動態滑價阻力、Ralph Vince 動態止損與 EVT 尾部風險防禦。
* **緊急避險 (DEFCON 1)**：觸發 R20 物理死鎖時，微秒級切斷 Hot Key 簽名通道，呈現高對比度物理死鎖覆蓋層。
* **無摩擦對沖 (Auto-Pilot)**：透過 `copilot-hmi-client.ts` 提供 **`[ ⚡ LOCK BEST HEDGE TO Δ ]`** 功能，一鍵將最佳對沖基差帶入執行引擎。

---

## 2. 補助資金與里程碑拆解 (Grant Budget & Milestones)

### 2.1 場域補助軌道 (Venue Grant Tracks)

| 軌道 (Track) | 里程碑重點 (Focus) | 交付物 (Deliverables) | Zero-Key Gate |
|---|---|---|---|
| **Hyperliquid** | Session Key + Dynamic Max SL | `hyperliquid-adapter.ts` · EIP-712 dry-run | `HL_DRY_RUN` |
| **Polymarket** | Tail-Hedge Architecture | 跨場域 soil + hedge trigger | `POLYMARKET_DRY_RUN` |
| **Jupiter** | Edge KV + Combined Slippage | Jupiter soil resistance fuse | `JUPITER_DRY_RUN` |
| **dYdX** | Cross-Venue Depth Feeder | 雙場域深度完整性 | `SOIL_RESISTANCE` |

### 2.2 里程碑資金模型（範本）(Milestone Budget Model)

| 階段 (Phase) | 範圍 (Scope) | 工程 USD (Engineering) | 法務 / IP USD (Legal/IP) | 總申請額 (Total) |
|---|---|---:|---:|---:|
| **M0 — Audit Gate** | Zero-key sandbox · CI green (594/594) · telemetry health | $15,000 | $5,000 | **$20,000** |
| **M1 — Session Key Hardening** | HL adapter · root protection E2E · leak sensor | $35,000 | $8,000 | **$43,000** |
| **M2 — Multi-Venue Matrix** | Polymarket · Jupiter · dYdX gate parity | $45,000 | $10,000 | **$55,000** |
| **M3 — Production Soak** | 24/7 KV soak · panic recovery · grant reproducibility | $25,000 | $7,000 | **$32,000** |
| **M4 — Public Shield** | silvervinelabs.com HUD · auditor docs · demo hub | $20,000 | $5,000 | **$25,000** |

**累計工程申請：** $140,000 · **累計法務/IP：** $35,000 · **計畫總額：** **$175,000**

---

### 2.3 法務與國際 IP 預算（PCT / Madrid / Patent Pending）

本計畫包含國際專利（Patent Pending）與商標防禦佈局：

| 項目 (Item) | 目的 (Purpose) | 估計成本 USD (Est. Cost) | 時程 (Timeline) |
|---|---|---:|---|
| **Prior-art search & freedom-to-operate** | DeFi 風險引擎 · Session-Key 爆炸半徑 | $8,000 – $12,000 | M0 – M1 |
| **Provisional filing (US Patent)** | 專利標的：攻防一體化 UI 狀態變換（`( GUARD 陰 MODE )` / `( ATTACK 陽 MODE )`）、微秒級物理死鎖 | $6,000 – $9,000 | M1 |
| **PCT international phase** | 量化風險編排 · 跨場域 soil fuse | $18,000 – $25,000 | M2 – M3 |
| **Madrid Protocol (trademark)** | Santenboku · SliverVine · DonDon · SilverVine Labs 商標 | $4,000 – $7,000 | M2 |
| **Grant compliance counsel** | 里程碑驗收 · BUSL carve-outs · auditor terms | $5,000 – $8,000 | 持續 |
| **Reserve (office actions)** | 審查員回應緩衝 | $10,000 | M3 – M4 |

**IP 計畫小計：** **$51,000 – $71,000**（保守 $35k 基線已併入法務/IP 欄；積極 PCT+Madrid 可擴至完整儲備）。

---

### 2.4 補助審查者驗證（無需金鑰）(Auditor Verification)

```bash
pnpm install
pnpm exec tsc --noEmit
pnpm exec vitest run
pnpm audit:dry-run
curl -s [https://slivervine.xyz/api/telemetry/health](https://slivervine.xyz/api/telemetry/health) | jq .