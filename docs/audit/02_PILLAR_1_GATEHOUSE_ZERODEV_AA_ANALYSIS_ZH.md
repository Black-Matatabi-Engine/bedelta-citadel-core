> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md](./02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md)

# 支柱一：Gatehouse — 可選 ZeroDev Kernel v3 AA 分析（EIP-7702 對照）

| 欄位 | 值 |
|-------|-------|
| **文檔** | 支柱一：Gatehouse — ZeroDev Kernel v3 AA 分析 |
| **版本** | **v1.0.0** |
| **分類** | Grant / 機構配置者 · AA 架構基準 |
| **分支基線** | `v1.0_push_BDLW` |
| **實體** | SilverVine Labs · SliverVine Protocol（BeDelta Living Water v1.0 / BeΔ） |
| **基線** | **Vitest SSOT：** **192 個測試檔案 \| 836 PASS Clean（100% PASS）** · Worker **69.32 KiB gzip** · Shield **p50 ~106 µs**（TS Gateway 路徑）· Wasm 暖啟動 **&lt;60 µs** · **7 原生協議**（含 Variational **Bits 12–13**）· **4 AI 框架** |
| **關聯 SSOT** | [`01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](./01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) · [`01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) §2.4 · [風險光譜 §0.1](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) |

> **邊界：** ZeroDev Kernel v3 為**可選支柱一帳戶抽象層**（`USE_ZERODEV_AA` 預設關閉）。**支柱三 Edge Wasm Shield**（`checkSoilResistance()` · p50 ~106 µs · `pkg/soil_core.wasm`）與**支柱二 Arbitrum 原生入場** **100% 獨立運作** — ZeroDev 故障永不影響亞毫秒播前防護或橋接 `lostUsd ≡ 0` 會計。

> **範圍說明：** 本文對照**面向消費者的 EIP-7702 AA 實作**與 SliverVine Protocol **機構級預執行風控底層**。屬架構盡職 artifact — 非法律或投資建議。

---

## 一、執行摘要

EIP-7702 與 ERC-7579 使 EOA 可將執行委派至智能帳戶邏輯 — 解鎖**一鍵意圖編排**、**Gas 代付**與**範圍化 Session 權限**。消費者 AA 堆疊優化**轉化與留存**：長效 Session Key、寬泛合約 scope、事後政策檢查。

SliverVine Protocol（BeDelta Living Water v1.0 / BeΔ）將 ZeroDev Kernel v3 作為**可選支柱一帳戶抽象層** — **程式碼驗證 / Dry-Run 驗證**（`pnpm test:zerodev`）。Kernel v4 + EIP-7702 意圖編排器為 **⏳ Post-Grant 路線圖（V1.5）**。ZeroDev **永不取代**風控治理，且**不提供**亞毫秒延遲（100% 由 `pkg/soil_core.wasm` 驅動）。無摩擦 onboarding 仍綁定相同**三柱（Three Pillars）**堆疊：

```text
[支柱一：可選 Gatehouse（AA）] ZeroDev Kernel v3 Session Keys & EIP-712 Scopes（可選）
[支柱二：合規入場防火牆] Arbitrum 原生入場 + 可選參考 adapter（Robinhood / Across）
 → 出站 escort · AML 入站阻擋 · payloadHash 綁定 · lostUsd ≡ 0
[支柱三：Shield] checkSoilResistance() · pkg/soil_core.wasm · Fail-Closed 預廣播（與 AA 無關）
```

> **支柱一驗證範圍：** **[支柱一：Gatehouse（Auth）]** 授權機制（`sessionOk`、`allowedToSign`）於 E2E demo（`pnpm run demo:e2e`）透過安全 dry-run adapter 評估；完整 ZeroDev Kernel v3 整合覆蓋於 `pnpm test:zerodev` 驗證。

**機構差異化：** 亞毫秒播前防護 **100% Wasm 驅動**（`checkSoilResistance()` · p50 ~106 µs · `pkg/soil_core.wasm`）— **與 ZeroDev 無關**。當啟用 AA 時，每筆 UserOp 另需通過 **30s TTL 心跳 / 意圖執行窗口**與**待結算資本辨識不變量（`lostUsd ≡ 0`）**，方得 GMX 或 Hyperliquid 廣播。

---

## 二、產業背景 — 消費者 EIP-7702 AA

| 消費者 AA 設計目標 | 典型實作 | 殘餘風險 |
|-------------------|---------|---------|
| **低註冊摩擦** | EIP-7702 委派 · 社交登入 · 首筆代付 | 用戶可能不理解委派權限範圍 |
| **持久 Session** | Session Key **數小時至數天** | 被盜 Session 爆炸半徑大 |
| **寬泛意圖 scope** | 通用 contract call 權限 | 難以排除提現 / approve 路徑 |
| **廣播後政策** | 後端模擬 · 限流 · 人工審核 | Bundler 與 venue 結算間 **Fail-Open** 窗口 |
| **橋接 UX 簡化** | 在途資金顯示為「可用」 | 未結算 escort 期間裸 Delta 風險 |

此模式適用**零售轉化漏斗**，對機構 Delta-Neutral Vault 基礎設施（需**預執行 severance**與**誠實在途資產標記**）**不足**。

---

## 三、對照矩陣 — 消費者 AA vs. SliverVine Citadel Shield

| 架構維度 | 消費者 EIP-7702 AA（業界基準） | SliverVine Citadel Shield 機構底層（程式驗證） |
|---------|------------------------------|-------------------------|
| **首要目標** | UX · onboarding · 交易量 | **Fail-Closed 風控** · 誠實會計 · 有界尾部損失 |
| **帳戶 runtime** | EIP-7702 委派 / ERC-4337 智能帳戶 | ZeroDev **Kernel v3**（✅ 程式驗證 / Dry-Run 驗證）→ **Kernel v4 + EIP-7702**（⏳ 路線圖） |
| **Session Key TTL** | 數小時 / 數天（減少重認證） | **30s TTL 心跳 / 意圖執行窗口**（`WS_HEARTBEAT_INTERVAL_MS = 30_000` · `DEFAULT_TTL_MS = 30_000`）；底層密碼學 Session Key 生命期上限 **24h / 7d** · 心跳過期 → `SESSION_KEY_HEARTBEAT_EXPIRED` |
| **執行 scope** | 寬泛合約互動 | **僅 `ORDER_EXECUTE`** — 零提現權（R06） |
| **名目上限** | 常無 cap 或錢包級 | **`SESSION_KEY_NOTIONAL_CAP_USD = $5,000`**（v1.0 live）· R07 物理 severance |
| **風控閘門位置** | 事後模擬 / 後端政策（Fail-Open 傾向） | **廣播前 Edge SSOT** — `checkSoilResistance()` **p50 ~106 µs** Shield/TS Gateway · Wasm 暖啟動 **&lt;60 µs** · `pkg/soil_core.wasm` |
| **閘門哲學** | 優先執行 + 監控 | **Fail-Closed** — `signingChannelOpen: false` · UserOp 於 bundler 前拒絕 |
| **Paymaster 耗盡** | 回退用戶自付（未護航路徑風險） | **`ZERODEV_DAILY_SPONSORSHIP_EXHAUSTED`** → soil 通過後 fail-closed 自付 — 非未護航廣播 |
| **意圖綁定** | 可選 calldata hash | **`payloadHash()`** → `SliverVineGate.sol` 單次消耗 attestation |
| **橋接在途** | 常計為 live NAV | **`IN_FLIGHT_BRIDGE_CAPITAL`** · **待結算資本辨識不變量（`lostUsd ≡ 0`）** · `SETTLED` 前禁止裸 GM/HL |
| **緊急響應** | Admin pause · 多簽 | **自動化** R17 日損 severance · R20 物理死鎖 · `rootProtection()` |
| **回歸證明** | 廠商 QA / 審計快照 | **192 個測試檔案 \| 836 PASS Clean** · `zerodev-aa-gate.test.ts` **4/4** · chaos matrix **255/255** |

> **支柱一對齊說明：** **[支柱一：Gatehouse（Auth）] ZeroDev Kernel v3 Session Keys & EIP-712 Scopes** — `sessionOk` / `allowedToSign` 於 `pnpm run demo:e2e`（安全 dry-run）演示；完整 Kernel v3 harness 回歸於 `pnpm test:zerodev`（`tests/adapters/zerodev-aa-dryrun-harness.test.ts`）。

---

## 四、深度解析 — 三大機構錨點

### 4.1 [支柱一：Gatehouse（Auth）] — 30s TTL 心跳 / 意圖執行窗口

消費者 AA 延長 Session 以減少錢包提示。SliverVine Protocol 透過 **30s TTL 心跳 / 意圖執行窗口**最小化簽名通道暴露 — 與底層密碼學 Session Key 生命期（模組範圍內上限 **24h / 7d**）區分：

| 控制 | 值 / 行為 | SSOT |
|------|----------|------|
| **HL WS 心跳** | **30s** 間隔 — **意圖執行窗口** | `adapters/hl/websocket/types.ts` · `WS_HEARTBEAT_INTERVAL_MS` |
| **心跳過期** | `SESSION_KEY_HEARTBEAT_EXPIRED` · 通道鎖定 | `nonce-auto-healing.ts` |
| **2PC intent TTL** | **`DEFAULT_TTL_MS = 30_000`** | `intent-ledger/defaults.ts` |
| **密碼學 Session Key 生命期** | 模組範圍內上限 **24h / 7d** | `agent-intent.ts` · ZeroDev Kernel session modules |
| **Scope** | **僅 `ORDER_EXECUTE`** | `hl-session/permissions.ts` |
| **名目 fuse** | **$5,000** → `SESSION_KEY_HARDLOCK_INTERCEPTED` | `session-key-gates.ts` |

```text
Session key 鑄造 → 30s 心跳 / 意圖窗口（密碼 key 可存活至 24h/7d）
 ├─ 有效心跳 + soil PASS → ORDER_EXECUTE 允許
 └─ 過期 / cap  breach → signingChannelOpen: false（Fail-Closed）
```

> **機構 rationale：** 被盜 Session 最多 **~30 秒**活躍意圖窗口與 **$5k 名目**爆炸半徑 — 非數小時委派錢包。

### 4.2 106 µs Shield/TS Gateway Soil 閘門（Shield）

消費者堆疊常在 UserOp 構建**之後**模擬交易。SliverVine Protocol 於 bundler 派發**之前**評估 soil：

| 指標 | 鎖定值 | SSOT |
|------|--------|------|
| **Shield 延遲（p50）** | **~106 µs** — Shield/TS Gateway 路徑 | Edge `checkSoilResistance()` · `pkg/soil_core.wasm` |
| **Wasm 暖啟動執行** | **&lt;60 µs** | `pkg/soil_core.wasm` 熱路徑 |
| **Worker bundle（實測）** | **69.32 KiB gzip** | `pnpm bundle:measure` |
| **滑點 fuse** | **0.5%**（`MAX_SLIPPAGE`） | `soil-resistance-types.ts` |
| **深度下限** | **$100,000**（`MIN_DEPTH_USD`） | soil matrix |
| **Trip 行為** | `TRIP_SOIL_RESISTANCE` · 無廣播 | `zerodev-aa-gate.test.ts` |

```text
UserOp draft
 │
 ▼
verifyAgentIntent() / checkSoilResistance() ← p50 ~106 µs Wasm（Fail-Closed）
 │
 ├─ ALLOW → payloadHash bind → Paymaster → bundler
 └─ TRIP → signingChannelOpen: false（永不進入 mempool）
```

> **EIP-7702 路線圖對齊：** Kernel v4 意圖編排增加 **UX 表面** — **106 µs Shield 不移位**。Edge 仍為 SSOT；ZeroDev 交付執行管線，Citadel 決策。

### 4.3 待結算資本辨識不變量 — `lostUsd ≡ 0`（合規入場防火牆 + 橋接 SSOT）

消費者橋接 UX 常將在途 token 視為可部署餘額。SliverVine Protocol 透過**待結算資本辨識不變量**標記與隔離 — 協議於執行中永不將在途橋接資本提前記為損失：

| `capitalLabel` | 可部署？ | `lostUsd` |
|----------------|---------|-----------|
| `IN_FLIGHT_BRIDGE_CAPITAL` | **否** — 禁止裸 delta | **0** |
| `BRIDGE_TIMEOUT_FAIL_CLOSED` | **否** — fail-closed severance | **0** |
| `SETTLED` / Arbitrum-native | 是 — 完整 soil envelope | **0** |

**不變量：** 待結算橋接流動性**永不誤記為本金損失** — 消除 Robinhood escort 期間 phantom NAV 膨脹。啟用 AA 時，ZeroDev 編排 UserOp；SliverVine Protocol 的 **`evaluateAcrossBridgeTransfer()`** 狀態機無論 AA 路徑皆治理可部署性。

**測試錨點：** `tests/adapters/across-ingress-bridge.test.ts` · **5/5 PASS**

---

## 五、執行管線 — 消費者 vs. SliverVine Protocol

### 5.1 消費者 EIP-7702（典型）

```text
EOA → EIP-7702 delegate → UserOp → bundler → venue
 ↑
 policy check（軟性 / 事後）
```

### 5.2 SliverVine Protocol 機構堆疊（V1.0）

```text
Kernel Smart Account（ZeroDev v3）
 │
 ▼
[支柱一：Gatehouse（Auth）] ZeroDev Kernel v3 Session Keys & EIP-712 Scopes
 │ sessionOk · allowedToSign · Paymaster caps
 │
 ▼
支柱二 合規入場防火牆 — payloadHash() bind · bridge direction validate
 │
 ▼
支柱三 — checkSoilResistance() · p50 ~106 µs · Fail-Closed
 │
 ├─ soil TRIP → sever signing channel
 │
 └─ soil ALLOW → SliverVineGate attestation → GMX / HL broadcast
```

---

## 六、SliverVine Protocol 如何採用 ZeroDev EIP-7702 而不重構架構

**v1.0 ZeroDev AA 活躍範圍：**

| 階段 | 狀態 | 說明 |
|-------|--------|------|
| **① Sign-in** | ✅ v1.0 Delivered（Sepolia verified） | Kernel 帳戶解析 |
| **② Fund（Smart Routing）** | 📋 Reference Harness & Spec（Vitest dry-run verified） | 非生產入場基線 |
| **③ Gas** | ✅ v1.0 Delivered（Sepolia verified） | $0.50/op · $10/day cap |
| **④ Authorize** | ✅ v1.0 Delivered（Sepolia verified） | ERC-7579 scoped session keys |
| **⑤ Execute** | ✅ v1.0 Delivered（Sepolia verified） | Shield PASS 後 UserOp |
| **⑥ Recover** | ⏳ Post-Grant Roadmap（V1.5 Spec） | v1.0 範圍外（上游 Kernel/EOA owner） |
| **⑦ Compose** | ⏳ Post-Grant Roadmap（V2.0 CaaS） | 鏈下 2PC intent ledger（部分內部覆蓋） |

| ZeroDev 能力 | SliverVine Citadel Shield 用法 | 保留的風控 |
|--------------------|-----------|------------------------|
| **Paymaster sponsorship** | 可選 onboarding + agent gas | 日上限 **`DAILY_SPONSORSHIP_LIMIT_USD`** · 耗盡 → soil 後自付 |
| **Smart Routing deposit** | 📋 Reference Harness — Robinhood → Arbitrum GM calldata spec | `IN_FLIGHT_BRIDGE_CAPITAL` 至 settled · 生產基線 = Arbitrum Native Ingress |
| **Kernel v4 / EIP-7702 composer** | ⏳ Post-Grant Roadmap（V1.5）— EOA → Agent Smart Account | 相同 Wasm Shield · 相同 30s TTL · 相同 `payloadHash()` |
| **Session modules（ERC-7579）** | `ORDER_EXECUTE` scoped keys | R06 · R07 · heartbeat auto-healing |

**設計規則（Tech Spec §2.4）：** Adapter 替換（v3 → v4）**不得**重寫 Shield 或 Wasm 語義。EIP-7702 為**執行平面升級**，非 Fail-Closed 閘門放寬。

---

## 七、驗證清單

| # | 宣稱 | 命令 / 產物 | 預期 |
|---|-------|-------------------|----------|
| 1 | 全量回歸 | `pnpm test -- --run` | **192 個測試檔案 \| 836 PASS Clean** |
| 2 | ZeroDev AA gate fail-closed | `pnpm exec vitest run tests/adapters/zerodev-aa-gate.test.ts` | **4/4 PASS** |
| 2b | 支柱一 Gatehouse dry-run harness | `pnpm test:zerodev` | Kernel v3 session scopes · EIP-712 dry-run PASS |
| 3 | Session R07 $5k cap | `pnpm exec vitest run tests/services/session-key-gates.test.ts` | breach 時 severance |
| 4 | 30s heartbeat expiry | `pnpm exec vitest run tests/services/nonce-auto-healing.test.ts` | 過期時鎖定 |
| 5 | 橋接誠實會計 | `pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts` | **5/5 · lostUsd ≡ 0** |
| 6 | Wasm bundle 預算 | `pnpm bundle:measure` | **69.32 KiB gzip** |
| 7 | 即時審計 | `GET /api/grant-audit` | Guard states 暴露 |

---

## 八、審計員與配置者防禦敘事

> 消費者 AA 協議優化**讓 DeFi 易於點擊**。SliverVine Protocol 優化**讓一鍵執行在廣播前數學上安全**。
>
> 亞毫秒防護 **100% Wasm 驅動**（`soil_core.wasm` · p50 ~106 µs）— **非** ZeroDev 提供。當機構**可選啟用** ZeroDev Kernel v3 時，每筆 UserOp 另通過 **30s TTL 心跳 / 意圖執行窗口**（密碼 Session Key 上限 24h/7d）與**待結算資本辨識不變量（`lostUsd ≡ 0`）**。於 3σ 市場衝擊下，AA 管線 **fail closed** — `signingChannelOpen: false` — 而非開裸 delta 或將在途資本誤記為可部署 NAV。機構可經 **Arbitrum Native Ingress** 完全 bypass AA，而不失去 Shield 防護。

---

## 關聯文檔

| 文檔 | 用途 |
|----------|---------|
| [`01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](./01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) | 完整 DDIP · 風險與免責 · Basel 映射 |
| [`01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) §2.4 | 可選 ZeroDev Kernel v3/v4 · Wasm Shield 解耦（§2.4.1） |
| [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) | 三柱 · AML 防火牆 |
| [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) | 支柱三 Wasm Shield · R01–R20 |
| [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | 風險緩解 · fail-closed 邊界 · 60 不變量 · 真實收益 vs. 毒性通膨 |

---

**編製：** SilverVine Labs · 風控與合規文檔  
**最後更新：** 2026-09-05 · 分支：`v1.0_push_BDLW`
