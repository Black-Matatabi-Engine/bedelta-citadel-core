> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[05_PRINCIPAL_AUDIT_REPORT.md](./05_PRINCIPAL_AUDIT_REPORT.md)

# Principal 審計報告 — SliverVine Citadel Shield · SliverVine Protocol（BeDelta Living Water v1.0 / BeΔ）

**正式名稱：** SliverVine Citadel Shield — 預共識意圖防火牆與執行安全原語 · **SliverVine Protocol**（BeDelta Living Water v1.0 / BeΔ）  
**實體：** SilverVine Labs · **產品：** SliverVine Citadel Shield · **協議：** SliverVine Protocol  
**受眾：** Principal / 安全審查者 · GMX Builders · Arbitrum 盡職  
**即時證明：** `GET /api/grant-audit` · [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz)  
**黃皮書 SSOT：** [`../architecture/01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md)

> **哲學 — BeΔ（BeDelta Living Water v1.0）：** **Be** 源自 Bruce Lee *「Be Water, My Friend」* — 如水般流動、自適應的意圖路由與無摩擦多鏈執行。**Δ (Delta)** 為市場 **Delta 中性**與風險中性執行 — 透過 GMX v2 GM + Hyperliquid 1× short envelope 中和方向性敞口。**SliverVine Citadel Shield** 為將二者綁定的預共識執行安全原語。

> **敘事：** 行為通過不等於 Web3 安全。本報告僅鎖定**程式庫 SSOT 指標** — 無行銷膨脹。

---

## 0. 精確指標鎖定（SSOT 基線）

| 指標 | 鎖定值 | 產物 / 驗證器 |
|--------|--------------|---------------------|
| **Vitest 基線** | **192 個測試檔案 \| 836 PASS Clean（100% PASS）** | `pnpm test` · [`static-analysis-report.json`](./static-analysis-report.json) 中 security-tier Vitest |
| **Wasm Core 預算** | **`<28kb` Cloudflare 預算，`<60µs` 執行（`<150µs` P99 tail）** | [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm) · [`soil_core.rs`](../../src/wasm/soil_core.rs) · [`soil-wasm.ts`](../../src/sdk/soil-wasm.ts) 中 `WASM_BUDGET_BYTES` |
| **Worker bundle** | **69.32 KiB gzip** | `pnpm bundle:measure` |
| **活躍 Guards** | **`agent-citadel-guard`（可配置動態滑點 Deadman）** + R01–R20 矩陣 **17 Active \| 2 Refactored \| 1 Deprecated** | `src/core/agent-citadel-guard.ts` |
| **收益整合** | GMX v2 **`uiFeeReceiver`（+10 bps 協議收益累計）** + 最高 **25%** referral rebate | `GMX_UI_FEE_BPS` · `gmx-v2-order-payload.ts` |
| **安全矩陣** | **三層級安全矩陣：5/0/0 PASS（Vitest、Forge、Slither、Aderyn、pnpm-audit）** | `pnpm run audit:security` → [`static-analysis-report.json`](./static-analysis-report.json) `summary.pass=5` |
| **Fuzzing 基線** | **327,675 Property Fuzz Executions**（`pnpm audit:nightly` / `FOUNDRY_PROFILE=deep` · 5×65,535）· 標準 `forge test` = **5,120**（5×1,024） | Forge property suite · Gate unit **60 Passed** |
| **決策延遲** | p50 ~106 µs（`checkSoilResistance()` / Shield 熱路徑） | Resilience / soil benchmark harness |
| **混沌矩陣** | **255 / 255** 毒性情境阻擋 · `failClosedRate: 100.00%` · `capitalLossUsd: 0` | [`chaos-blackswan-metrics.json`](./chaos-blackswan-metrics.json) |
| **風險光譜（建模）** | **88%** 預廣播攔截網 · **12%** 不可消除系統性殘差（`88% + 12% = 100%`） | [Risk Framework §0.1](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) |

**單一回歸短語（所有審計文案）：**  
`192 test files | 836 PASS Clean` · `3-Tier Security Matrix: 5/0/0 PASS` · Wasm `<28kb` / `<60µs` · Worker **69.32 KiB gzip**。

### 三柱 — 獨立審計規格

| 支柱 | 角色 | 獨立規格 |
|--------|------|------------------|
| **支柱一 — Gatehouse（Auth）** | ZeroDev Kernel v3 session keys · EIP-712 scopes · AA dry-run harness | [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) |
| **支柱二 — 合規入場防火牆** | 場所無關 AML escort · 僅出站 · `lostUsd ≡ 0` · Robinhood / Across 為**參考 adapter** | [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) |
| **支柱三 — Edge Shield（核心護城河）** | `checkSoilResistance()` · `pkg/soil_core.wasm` · R01–R20 · p50 ~106 µs | [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) |

---

## 1. 範圍邊界與資產終局性

| 時程 | 狀態 | 資產 / 清算邊界 |
|---------|--------|------------------------|
| **v1.0 Delivered（Sepolia verified）** | ✅ 程式驗證 | 嚴格 **ETH/USDC GM Pool** — 經**支柱二參考 Escort Adapter**（Robinhood Chain `46630` → Arbitrum One `42161`）護航時消除 oracle de-peg 與 FX 滑點 · 主網部署對應 **M6 Grant 分發** |
| **v1.0 Live — Pendle Institutional Shield** | ✅ 程式驗證 Live | **支柱三核心** — sync oracle · `PENDLE_ORACLE_STALE` soil fuse · PT/YT 安全哨兵（非收益競品）· **192 個測試檔案 \| 836 PASS Clean** |
| **V1.0 同構擴展** | ⏳ Planned | **BTC/USDC GM Pool** — 僅配置驅動市場地址映射；**零** bytecode / Wasm 重寫 |
| **V1.0 國庫路由** | ⏳ Planned | 原生 **USDG Robinhood Chain 國庫路由**（**支柱二參考 Escort Adapter**）— USDG 清算保留於 Robinhood Chain（`46630`）單向橋 |

**出金終局性（v1.0 / unwind 路徑）：** Arbitrum One 於 GMX v2 async unwind 支援原生 **ETH、BTC、USDC**。原生 USDG  redemption **非** Arbitrum 出金路徑 — 返回 Robinhood Chain 時由 Arbitrum USDC 轉換以維持合規邊界。入站 AML 污染（反向路徑 / `4663` 入站阻擋）於防火牆 fail-closed。

---

## 2. 四項診斷質詢（三柱映射）

### 質詢 I — 支柱一：Gatehouse（Auth）：Agent 憑證能否漂移越過 session 邊界？

| 探針 | 預期 fail-closed 姿態 | SSOT |
|-------|------------------------------|------|
| 未範圍化 `ORDER_EXECUTE` | 阻擋 — ZeroDev Kernel v3 session scopes + R06 | `hl-session/permissions.ts` · ZeroDev AA gate |
| 名目超限 | 於 **$5,000** 單筆上限阻擋（R07） | `SESSION_KEY_NOTIONAL_CAP_USD` |
| Deadman bypass | 不可能 — `guardAgentUserOp` → `evaluateAgentCitadelGuard` → soil；可配置動態滑點 Deadman trip 發出 `CITADEL_SLIPPAGE_EXCEEDED` | `agent-citadel-guard.ts` |

**判定：** Auth 表面為 ephemeral-session + EIP-712 intent；無 LLM prompt 解讀 — 僅 predicate / intent 硬斷言。**規格：** [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md)。

### 質詢 II — 支柱二：合規入場防火牆：入站 AML 能否污染 Arbitrum GM TVL？

| 探針 | 預期 fail-closed 姿態 | SSOT |
|-------|------------------------------|------|
| 出站 Robinhood Chain → Arb | 僅允許 escort：`46630` → `42161` | 單向橋 escort |
| 入站反向路徑 | **阻擋**（AML 污染短路） | 防火牆柱 · lostUsd ≡ 0 姿態 |
| Arb 上原生 USDG redeem | **超出範圍** — USDG 清算限於 Robinhood Chain | § 資產 Redemption（Tech Spec §0.1） |

**判定：** 資金流為單向出站 escort；反向 AML 掃描強制入站阻擋。**規格：** [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md)。

### 質詢 III — 支柱三：SliverVine Citadel Shield（核心護城河）：毒性深度 / lag / sandwich 能否抵達 GMX 廣播？

| 探針 | 預期 fail-closed 姿態 | SSOT |
|-------|------------------------------|------|
| 相對本地深度價格影響 **>10 bps** | `checkSoilResistance()` 於廣播前短路（p50 ~106 µs） | R01 · soil + Wasm |
| 跨場所滑點 breach | 可配置動態滑點 Deadman trip | `agent-citadel-guard` |
| Sequencer / oracle lag | Sequencer grace + oracle-lag sensor 於 payload 前 fail-closed | Supporting sensors · R03 / R04 家族 |
| Pendle oracle stale / 無效 feed | `PENDLE_ORACLE_STALE` 經 `pendleOracle` / `pendleCrossGuard` soil probes | `pendle-market-oracle-adapter.ts` · TTL **60s** |
| Receiver / 參數篡改 | ERC-4337 UserOp 上不對稱 predicate bytecode 斷言（`sender ≡ receiver`、`acceptablePrice` 邊界） | Tech Spec §0.1 |

**判定：** SliverVine Citadel Shield 為亞毫秒 Wasm + TS soil fuse；毒性向量永不以未簽名 GMX payload 離開 Edge。**規格：** [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md)。

### 質詢 IV — 收益與 Attestation：Builder 收益與 L1 鎖是否非託管且防重放？

| 探針 | 預期姿態 | SSOT |
|-------|------------------|------|
| `uiFeeReceiver` 注入 | 每筆未簽名 increase / decrease / deposit 帶 **+10 bps** 累計 + 可選 referral rebate | `GMX_UI_FEE_BPS` · `gmx-v2-order-payload.ts` |
| L1 consume-once | `SliverVineGate.sol` `verifyAndConsume` — 防重放、gas 有界 | Forge 60/60 · Slither / Aderyn 於 5/0/0 |
| 公開 JSON 洩漏 | `/api/grant-audit` 編輯簽名材料與專有 encode 路徑 | Grant-audit route 表面 |

**判定：** 收益為協議原生 GMX UI fee 路徑（無托管）；L1 attestation 為 consume-once。

---

## 3. 極限 Survival 矩陣

| Harness | 結果 | 產物 |
|---------|--------|----------|
| Chaos Black-Swan | **255** 情境 · **255** 阻擋 · **0** isolate crash · **$0** 資本損失 | [`chaos-blackswan-metrics.json`](./chaos-blackswan-metrics.json) |
| Forge property fuzz | **327,675**（`pnpm audit:nightly` / `FOUNDRY_PROFILE=deep`）· 標準 `forge test` = **5,120**（5×1,024） | Gate suite |
| Forge unit | **60 Passed / 0 Failed** | `static-analysis-report.json` → forge |
| Advanced resilience | TOCTOU compensate · RPC failover · soil SLO harness `allPass: false`（failover 分支含延遲 jitter fallback） | [`grant-resilience-benchmark-metrics.json`](./grant-resilience-benchmark-metrics.json) |
| Security tier | **5/0/0 PASS**（Vitest、Forge、Slither、Aderyn、pnpm-audit） | [`static-analysis-report.json`](./static-analysis-report.json) |
| 防禦矩陣 | **17 Active \| 2 Refactored \| 1 Deprecated**（R05 SpoofBuster deprecated） | Tech Spec §3 |

**Survival 宣稱（principal 級）：** 於鎖定矩陣下，毒性 / lag / TOCTOU / 深度枯竭向量於 GMX DataStore 廣播前 **fail-closed**；Emergency Liquidity Sponge（HL session 路徑）於 Citadel flag trip 時共享相同 envelope。

---

## 4. WASM / Rust Core 配置

| 項目 | 規格 |
|------|------|
| 來源 | [`soil_core.rs`](../../src/wasm/soil_core.rs)（`#![no_std]`，Apache-2.0 SPDX） |
| 產物 | `pkg/soil_core.wasm` |
| Cloudflare 預算 | **`<28kb`**（`WASM_BUDGET_BYTES = 28 * 1024`） |
| 熱路徑執行 | **`<60µs`** 暖啟動；**`<150µs` P99 tail** |
| 入口 | `soil_core_eval` — 8×f64 LE 輸入 → trip flags（cross-venue / depth / insufficient）+ Dynamic Account Risk Ceiling |
| Session helper | `session_core_ok` — clip + TTL breach → 0 |
| TS wire | `src/sdk/soil-wasm.ts`（生產）；開發用 TS sim fallback |
| 耦合 | 於 Shield / `checkSoilResistance()` 下呼叫；Deadman（`agent-citadel-guard`）不可 bypass soil |

**同構說明：** V1.0 BTC/USDC 市場映射為**僅配置** — pool 地址擴展無需 Wasm bytecode 重寫。

---

## 附錄 A — 防滑點與 0-Lockup（3–5 分鐘 Async Redemption）

| 控制 | 邊界 |
|---------|-------|
| Soil impact fuse | 本地 GM 深度無法吸收機構規模而不超 **>10 bps** 影響時短路 |
| Deadman | **`agent-citadel-guard` 可配置動態滑點 Deadman** — 跨場所 / 深度失敗 → 簽名拒絕 payload |
| 協議 lock-up | **零協議 lock-up** — 流動性使用 GMX v2 **3–5 分鐘 async redemption** |
| 反向 AML | 反向 escort 路徑入站阻擋；僅出站 `46630` → `42161` |
| 藍籌 restraint | v1.0 **僅 ETH/USDC** — Sequencer desync 下 oracle 可靠性 |

---

## 附錄 B — ERC-7715 與 Apache 2.0 專利報復

### B.1 ERC-7715 解耦 — ⏳ Planned / V1.0 Design Spec

ZeroDev Kernel v3 為 **v1.0 ephemeral session-key adapter**（Gatehouse）。**ERC-7715（Advanced Wallet Permissions）** 為 **V1.5 演進目標** — 未於 v1.0 交付。Bytecode predicate 驗證（Receiver / Parameter invariants on ERC-4337 UserOp）於 Wasm / soil core 內 **v1.0 live**（Tech Spec §0.1）。

### B.2 Apache-2.0 專利報復（SDK 表面）

[`@slivervine/citadel-sdk`](../../src/sdk/) 授權 **Apache-2.0**（`src/sdk/LICENSE`）。依 Apache License §3：被授權人提起專利訴訟主張 Work 或 Contribution 構成侵權時，專利授權**於該日起終止**。根協議 / Worker 仍為 **BUSL-1.1**（見 repo `LICENSE`）；SDK harness 為 Apache-2.0 整合邊界。

---

## 附錄 C — 三方 CTO 整合路線圖

SliverVine 為**基礎設施層裝甲管線**。應用層 storefront 作為 CTO / 產品表面整合，不擁有預執行護城河：

| 方 | 層級 | 整合姿態 |
|-------|-------|---------------------|
| **Carbon**（Perp） | App | 消費 Citadel 未簽名 / fail-closed envelope；不 bypass soil 或 Deadman |
| **LayerV**（Vol） | App | 相同 Edge Shield；市場選擇仍 SSOT-gated（v1.0 ETH/USDC） |
| **T3tris**（Vaults） | App | Vault UX / epoch ops（V1.0 路線圖 cap）位於單向 escort + GM unwind 之上 |

**整合合約（CTO checklist）：**

1. 經 Gatehouse session scopes 接線（ZeroDev Kernel v3 → ERC-7715 演進）。
2. 永不反向 Firewall escort（無入站 AML 路徑）。
3. 遵守 Shield 短路（`checkSoilResistance` + `agent-citadel-guard` 可配置動態滑點 Deadman）。
4. 每筆 GMX v2 未簽名 payload 保留 `uiFeeReceiver` **+10 bps**。
5. 僅經 V1.0 配置映射擴展市場（BTC/USDC · USDG Robinhood Chain）— 不 fork Wasm soil core。

**Variational（V2.0）：** 下一代去中心化 perp 與跨場所 margin 路由 — `buildVariationalShortOrder()` · `evaluateVariationalOrderbookDepth()` PoC · 同鏈 Arbitrum hedge 擴展，作 Hyperliquid 對沖腿補充/替代。見 Tech Spec §2.5。

---

## 驗證（Principal — 60s）

```bash
pnpm install && pnpm test -- --run # 192 test files | 836 PASS Clean
pnpm run audit:security # 3-Tier Security Matrix: 5/0/0 PASS
pnpm run audit:fast # fast tier scorecard → security-scorecard.json
cd SliverVineGate && forge test && cd ..
curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .
pnpm bundle:measure # Worker 69.32 KiB gzip
```

---

## 關聯文檔

| 文檔 | 用途 |
|----------|---------|
| [`../architecture/01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) | 黃皮書 — R01–R20 · §0.1 scope · §0.4 bytecode predicates |
| [`../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | 風險緩解 · 免責 · force majeure · AI 攻擊向量 |
| [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) | 支柱一 — ZeroDev Kernel v3 AA · EIP-7702 對照 |
| [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) | 支柱二 — AML escort · 入站阻擋 · 橋接會計 |
| [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) | 支柱三 — Wasm soil core · `checkSoilResistance()` · 延遲護城河 |
| [`01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](./01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) | DDIP — 機構配置者盡職 |
| [`../README.md`](../README.md) | 受眾路由 |
| [`static-analysis-report.json`](./static-analysis-report.json) | Security-tier 5/0/0 鎖定 |
| [`chaos-blackswan-metrics.json`](./chaos-blackswan-metrics.json) | 極限 Survival 矩陣產物 |
| [`../../src/sdk/README.md`](../../src/sdk/README.md) | Apache-2.0 SDK 表面 |
