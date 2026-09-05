> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md)

# 支柱二：合規入場防火牆與參考 Adapter 審計（如 Robinhood Chain / Across）

| 欄位 | 值 |
|-------|-------|
| **文檔** | 支柱二：合規入場防火牆與參考 Adapter 審計 |
| **版本** | **v1.0.0** |
| **分類** | 公開 Grant / 機構盡職 |
| **實體** | SilverVine Labs |
| **協議** | SliverVine Protocol（BeDelta Living Water v1.0 / BeΔ）· Santenmoku 內部引擎 |
| **範圍** | 支柱二合規入場防火牆 · Robinhood Chain **46630**（testnet）· **4663**（mainnet）· Across 參考 escort · Arbitrum One **42161** |
| **規格 SSOT** | [`docs/architecture/01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) |
| **即時證明** | [`GET /api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) |

> **產品身份邊界：** Robinhood Chain 與 Across 為**可選支柱二參考入場 Adapter**，展示多鏈合規 escort 會計 — 屬整合範例，**非** SliverVine Protocol 核心產品身份。協議重心仍為**預共識意圖防火牆與 GMX/HL 執行安全原語（支柱三 Shield）** — 見 [README § 三柱](../../README.md)。

> **權威聲明：** 本報告於 Citadel **三柱架構**下驗證支柱二合規入場防火牆，以 Robinhood Chain / Across 為 inaugural 參考 adapter。所有量化宣稱可經 `pnpm test` 與定向橋接測試 CLI 驗證。

---

## 審計判定

| 閘門 | 狀態 |
|------|--------|
| **Vitest — Robinhood Across Bridge** | **5/5 PASS** |
| **單向 Escort（46630/4663 → 42161）** | **ALLOWED** |
| **AML 入站阻擋（42161 → 46630/4663）** | **BLOCKED** |
| **鏈上 `IngressSafetySwitch.sol`** | **不變量已驗證** |
| **資本損失不變量** | **`lostUsd ≡ 0`** |

**Robinhood Chain 狀態：** Testnet **46630** — **ACTIVE / TESTED** · Mainnet **4663** — **DEPLOYMENT READY**（入站於協議 filter 阻擋）。

---

## 三柱架構

```text
[ 機構國庫（Robinhood Chain 46630 / 4663） ]
 │
 ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 支柱一：GATEHOUSE（Auth）                                │
 │ ZeroDev Kernel v3 Session Keys & EIP-712 Scopes         │
 └──────────────────────┬──────────────────────────────────┘
 │
 ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 支柱二：合規入場防火牆（參考 Adapter — Robinhood / Across）│
 │ 單向 Escort · AML 入站隔離                               │
 │ IngressSafetySwitch.sol · lostUsd ≡ 0                   │
 └──────────────────────┬──────────────────────────────────┘
 │
 ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 支柱三：SHIELD（核心護城河）                              │
 │ 亞毫秒 checkSoilResistance() & Wasm 引擎                 │
 └──────────────────────┬──────────────────────────────────┘
 │
 ▼
[ Arbitrum One GMX v2 GM Pool 安全執行 ]
```

---

## 支柱一：Gatehouse（Auth）

**ZeroDev Kernel v3 Session Keys & EIP-712 Scopes**

| 控制 | 機制 | 證據 |
|---------|-----------|----------|
| **範圍化 session keys** | ZeroDev Kernel v3 AA adapter 強制 `ORDER_EXECUTE` 邊界與每日 gas sponsorship 上限 | `src/adapters/zerodev/` · `docs/audit/zerodev-aa-metrics.json` |
| **EIP-712 域綁定** | 域 `SliverVineCitadel` · chainId 綁定 attestation 表面 | `@slivervine/citadel-sdk` · `SliverVineGate.sol` |
| **憑證漂移消除** | Session keys 取代 hot-wallet 憑證輪替以界定 agent 權限 | README § 統一機構預執行管線 |

**閘門姿態：** 無有效範圍 session key 與 gate pass，不得進行未簽名 GMX payload 或 hedge dispatch。

---

## 支柱二：合規入場防火牆（參考 Adapter — Robinhood Chain / Across）

### 2.1 Vitest 驗證 — 5/5 PASS

```bash
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
```

| # | 測試案例 | 結果 |
|---|-----------|--------|
| 1 | 單向出站 **46630 → 42161** 允許 | ✅ PASS |
| 2 | 在途資本標記 `IN_FLIGHT_BRIDGE_CAPITAL`；`lostUsd ≡ 0` | ✅ PASS |
| 3 | 出站結算清除在途標記 → `SETTLED` | ✅ PASS |
| 4 | AML 隔離：**42161 → 46630 / 4663** 入站阻擋 | ✅ PASS |
| 5 | 橋接逾時 fail-closed；資本永不標記為損失 | ✅ PASS |

**模組：** `src/adapters/across-ingress-bridge.ts`  
**測試檔：** `tests/adapters/across-ingress-bridge.test.ts`

### 2.2 單向 Escort 路由矩陣

| 方向 | Chain ID | 狀態 | Reason Code |
|-----------|-----------|--------|-------------|
| 出站（sandbox） | **46630 → 42161** | ✅ **ALLOWED** | — |
| 出站（mainnet） | **4663 → 42161** | ✅ **ALLOWED** | — |
| 入站 AML 阻擋 | **42161 → 46630** | 🚫 **BLOCKED** | `AML_INBOUND_TO_ROBINHOOD_BLOCKED` |
| 入站 AML 阻擋 | **42161 → 4663** | 🚫 **BLOCKED** | `AML_INBOUND_TO_ROBINHOOD_BLOCKED` |
| `inboundToRobinhoodPermitted` | 所有路徑 | 🚫 **false** | 硬不變量 |

**AML 隔離規則：** 零入站資金流回 Robinhood Chain。外部來源（如 Arbitrum One）指向 Robinhood Chain 目的地者，於 adapter 層於橋接狀態機進入前拒絕。

**Sandbox vs mainnet：**

- **46630（testnet）：** 活躍整合 sandbox — 出站 escort 至 Arbitrum One 可運作。
- **4663（mainnet）：** 部署就緒 — 出站 escort 允許；**42161 入站於協議 filter 阻擋**（Permissioned RWA tranche 政策，見 Tech Spec § 隔離 Tranche）。

### 2.3 鏈上不變量 — `IngressSafetySwitch.sol`

**合約：** [`contracts/IngressSafetySwitch.sol`](../../contracts/IngressSafetySwitch.sol)  
**Oracle 錨點：** [`contracts/SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol)

| 不變量 | 機制 | 違規時 |
|-----------|-----------|--------------|
| **Oracle system flush** | `riskOracle.isSystemFlushed()` | `isCompliant → false`；`gateAddress → revert("SLO_TIMEOUT")` |
| **STATUS_SHUTDOWN (3)** | `riskOracle.statusCode() == STATUS_SHUTDOWN()` | 相同 fail-closed 路徑；`EmergencyJumped` + `ErrorTriggered` 事件 |
| **機構黑名單** | `institutionalBlacklist[target]` | `gateAddress → revert("BLACKLISTED")`；`ERR_INVALID_SIGNER` 事件 |
| **零地址防護** | Constructor `require(oracle_ != address(0))` + blacklist 零檢查 | 部署時 revert |
| **合規通過** | 所有檢查通過 | 發出 `StatusRefreshed(target, timestamp)` |

**架構分層：**

| 層級 | 範圍 | 角色 |
|-------|-------|------|
| **Edge Adapter** | Chain ID 路由 | 單向 escort + AML 入站阻擋（4663/46630） |
| **鏈上 Safety Switch** | 地址級 gate | Oracle flush + 機構黑名單（Robinhood Chain 互動前） |

補充 Tech Spec § 隔離 Tranche 與 § ArbOS Elara 對齊（協議級入場過濾）。

### 2.4 資本損失不變量 — `lostUsd ≡ 0`

`evaluateAcrossBridgeTransfer()` 橋接狀態機強制：

| 狀態 | `inFlightUsd` | `settledUsd` | `lostUsd` |
|-------|---------------|--------------|-----------|
| In-flight | `amountUsd` | `0` | **`0`** |
| Settled | `0` | `amountUsd` | **`0`** |
| Timeout fail-closed | `0` | `0` | **`0`** |
| AML inbound blocked | `0` | `0` | **`0`** |

**不變量：** 待結算橋接流動性**永不**記為損失。逾時路徑 fail-closed，標記 `BRIDGE_TIMEOUT_FAIL_CLOSED`，無資本沖銷。

---

## 支柱三：Shield（核心護城河）

**亞毫秒 `checkSoilResistance()` & Wasm 引擎**

| 護城河 | 規格 | 證據 |
|------|------|----------|
| **Edge soil fuse** | 跨場所滑點 > 0.5% 觸發 fail-closed；排程 TWAP path slicing | `src/services/risk-control-lib/soil-resistance.ts` |
| **決策延遲** | SLO < 1.0ms · p50 ~106 μs · 純數學 0.0002 ms | README § Santenmoku Engine |
| **Wasm 熱路徑** | `#![no_std]` core · Cloudflare 預算 < 28kb · 暖啟動 < 60μs | `pkg/soil_core.wasm` · M4 milestone |
| **Tri-Sensor Matrix** | BaseFee velocity · RPC jitter radar · phase-shift instability | README § Tri-Sensor Telemetry Matrix |

**閘門姿態：** 預執行護甲於 Arbitrum One GMX v2 GM pool **廣播前**攔截 MEV sandwich、lagging RPC 與跨場所 phase desync。

---

## CLI 重現

```bash
# 全量 Vitest 套件（192 個測試檔案 | 836 PASS Clean）
pnpm test

# 定向 Robinhood Chain 橋接 gate
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts

# 鏈上合約測試（Foundry）
cd SliverVineGate && forge test && cd ..
```

---

## 關聯產物

| 路徑 | 角色 |
|------|------|
| [`docs/architecture/01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) | 三角流動性迴路 · 隔離 Tranche · Elara 對齊 |
| [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) | 支柱三 Wasm Shield · R01–R20 · Tri-Sensor |
| [`docs/audit/05_PRINCIPAL_AUDIT_REPORT.md`](./05_PRINCIPAL_AUDIT_REPORT.md) | Principal Audit v1.0.0-rc1 · survival matrix |
| [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) | Edge adapter — 單向路由 + AML 阻擋 |
| [`contracts/IngressSafetySwitch.sol`](../../contracts/IngressSafetySwitch.sol) | 鏈上合規 filter |
| [`tests/adapters/across-ingress-bridge.test.ts`](../../tests/adapters/across-ingress-bridge.test.ts) | Vitest gate 驗證 |

---

*SilverVine Labs · BUSL-1.1 · 支柱二合規入場防火牆審計 v1.0.0*
