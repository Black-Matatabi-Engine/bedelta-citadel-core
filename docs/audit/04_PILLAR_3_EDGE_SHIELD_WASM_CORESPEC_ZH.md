> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md](./04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md)

# 支柱三：Edge Shield — Wasm Soil Core 規格（`checkSoilResistance()`）

| 欄位 | 值 |
|-------|-------|
| **文檔** | 支柱三：Edge Shield — Wasm Soil Core 規格 |
| **版本** | **v1.0.0** |
| **分類** | 公開 Grant / 機構盡職 |
| **實體** | SilverVine Labs |
| **協議** | SliverVine Protocol（BeDelta Living Water v1.0 / BeΔ）· Santenmoku 內部引擎 |
| **範圍** | 預共識意圖防火牆 · `checkSoilResistance()` · `pkg/soil_core.wasm` · R01–R20 防禦矩陣 · Tri-Sensor 遙測 |
| **規格 SSOT** | [`docs/architecture/01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) |
| **即時證明** | [`GET /api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) |

> **產品身份：** **[支柱三：Shield]** 為 SliverVine Protocol **核心技術護城河** — **預共識意圖防火牆與 GMX/HL 執行安全原語**。支柱一（Gatehouse）與支柱二（可選入場 adapter）路由資金與權限；**支柱三於亞毫秒延遲決定是否允許任何廣播**。

> **權威聲明：** 所有量化宣稱可經 `pnpm test`、`pnpm run demo:e2e` 與定向 soil/Wasm 延遲套件 CLI 驗證。

---

## 審計判定

| 閘門 | 狀態 |
|------|--------|
| **Vitest — 全量回歸** | **192 個測試檔案 \| 836 PASS Clean（100% PASS）** |
| **`checkSoilResistance()` warm p50** | **&lt; 1 ms** 全路徑預算（`soil-resistance-latency.test.ts`） |
| **Wasm 熱路徑（`soil_core_eval`）** | **&lt; 60 µs** 暖啟動預算（`WASM_EXEC_BUDGET_US`） |
| **Shield/TS Gateway p50** | **~106 µs**（生產 Edge 目標 · demo 實測抽樣） |
| **Wasm bundle** | **&lt; 28 KiB** Cloudflare 預算（`pkg/soil_core.wasm`） |
| **Worker bundle** | **69.32 KiB gzip**（`pnpm bundle:measure`） |
| **防禦矩陣** | **17 Active \| 2 Refactored \| 1 Deprecated** |
| **Fail-closed 姿態** | 任何 soil / oracle / sequencer trip → `signingChannelOpen: false` |
| **攔截網覆蓋** | **88%** 預廣播 · **12%** 系統性殘差（Fail-Closed）— [Risk Framework §0.1](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) |

---

## 三柱上下文

```text
[支柱一：Gatehouse（Auth）] → sessionOk · allowedToSign · EIP-712 scopes
[支柱二：合規入場防火牆] → 可選 Robinhood / Across escort · lostUsd ≡ 0
 │
 ▼
┌─────────────────────────────────────────────────────────┐
│ 支柱三：SHIELD（核心護城河）                              │
│ checkSoilResistance() · pkg/soil_core.wasm · R01–R20    │
│ p50 ~106µs Shield 路徑 · Wasm 暖啟動 <60µs             │
└──────────────────────┬──────────────────────────────────┘
 │
 ▼
[ 主要：Arbitrum One GMX v2 ETH/USDC GM + Hyperliquid 1× Short ]
```

---

## `checkSoilResistance()` — 預執行管線

**SSOT：** `src/services/risk-control-lib/soil-resistance.ts` · `src/services/risk-control.ts`

```text
Intent / UserOp draft
 │
 ▼
verifyAgentIntent() ──► Wasm soil core（evaluateSoilCore / soil_core_eval）
 │
 ▼
checkSoilResistance() ──► depth · cross-venue slippage · oracle-lag · sequencer guards · Pendle oracle / cross-guard soil probes
 │
 ├─ TRIP → signingChannelOpen: false · 無 bundler / mempool 廣播
 └─ ALLOW → payloadHash bind → GMX / HL execution envelope
```

| 屬性 | 值 | SSOT |
|----------|-------|------|
| **滑點 fuse** | **0.5%**（`MAX_SLIPPAGE = 0.005`） | `soil-resistance-types.ts` |
| **最小深度下限** | **$100,000**（`MIN_DEPTH_USD`） | soil matrix |
| **Trip 行為** | `TRIP_SOIL_RESISTANCE` · fail-closed | `zerodev-aa-gate.test.ts` |
| **SDK 表面** | `verifyAgentIntent()` · `checkSoilResistance()` | `@slivervine/citadel-sdk` |

**形式化 predicate（SSOT）：**

$$
\mathrm{AllowedToSign} = \mathrm{Injection} \land \mathrm{Digest} \land \mathrm{Soil} \land \mathrm{Session} \land \mathrm{Gas} \land \mathrm{Attestation} \land \mathrm{Armor} \land \mathrm{Wasm}
$$

---

## Wasm Soil Core 引擎（`#![no_std]`）

| 屬性 | 規格 | 證據 |
|----------|------|----------|
| **產物** | `pkg/soil_core.wasm` | Rust `#![no_std]` · 可移植 `soil_core_eval` |
| **記憶體預算** | **&lt; 28 KiB** | Cloudflare Edge 部署限制 |
| **暖啟動執行** | **&lt; 60 µs** | `WASM_EXEC_BUDGET_US` · `tests/services/wasm-feasibility-lib/soil-core-sim.test.ts` |
| **Wire / loader** | `src/sdk/soil-wasm.ts` | `initSoilWasm()` · `evaluateSoilCore()` |
| **TS sim fallback** | `runWasmSoilCoreSim()` | 開發 / Vitest（Wasm 未載入時） |
| **Stylus 強化** | `contracts/stylus-probe/` | 鏈上 coprocessor 對等（V2.0 路線圖 probe） |

```bash
# Wasm 可行性 + <60µs 暖路徑
pnpm exec vitest run tests/services/wasm-feasibility-lib/soil-core-sim.test.ts

# 全量 soil resistance 路徑延遲（p50 < 1ms）
pnpm exec vitest run tests/services/soil-resistance-latency.test.ts
```

---

## 延遲護城河

| 層級 | 指標 | 說明 |
|-------|--------|-------|
| **Wasm core 熱路徑** | **&lt; 60 µs** | 原始 `soil_core_eval` — `#![no_std]` 函式體 |
| **Shield / TS Gateway p50** | **~106 µs** | 完整 `checkSoilResistance()` Edge 路徑（生產 SLO） |
| **健康實測帶** | **95 µs – 120 µs** | `pnpm run demo:e2e` Step 1 中 100 次暖迴圈 |
| **純數學核心** | **0.0002 ms（200 ns）** | Santenmoku 純數學反射（benchmark harness） |
| **SLO 上限** | **&lt; 1.0 ms** | 端到端預執行決策截止 |

> **評委說明：** 本機 Node harness 可能顯示 `FAST_LOCAL` p50 低於 Edge 目標帶 — 屬預期。生產 Edge SSOT 仍為 Cloudflare Workers 上 **p50 ~106 µs**（`pkg/soil_core.wasm`）。

---

## Tri-Sensor 遙測矩陣

v1.0 限制於 **ETH/USDC**，使 Sequencer desync 期間 oracle 可靠性成立；Tri-Sensor Matrix 仍為 dispatch gating 權威。

| Sensor | 角色 | SSOT |
|--------|------|------|
| **BaseFee Velocity** | Arbitrum One 上 EIP-1559 壅塞 throttle | `arbitrum-gas-guard.ts` · Tri-Sensor **BaseFee Velocity** channel |
| **RPC Jitter Radar** | 過期 / lagging RPC 偵測 · fail-closed severance | `rpc-whitelist.ts` · `checkSoilResistance()` armor inputs |
| **Phase-Shift Instability** | 跨場所 oracle / perp phase desync | soil matrix · cross-venue slippage fuse |

**伴生 fuse：** Sequencer 600s grace · Oracle lag fail-closed（`ORACLE_LAG_DEADLOCK_MS`）· Pgate latency **200 ms**（`PGATE_MAX_LATENCY_MS` · R04）· **Pendle Institutional Shield**（`PENDLE_ORACLE_STALE` · TTL 60s sync oracle）。

---

## Pendle Institutional Shield（V1.0 Live · 核心支柱三）

| 元件 | SSOT | v1.0 狀態 |
|-----------|------|-------------|
| **Sync Market Oracle** | `pendle-market-oracle-adapter.ts` | ✅ Live · 零 I/O `ingest()` / `resolve()` · TTL **60s** |
| **Registry Hydration** | `pendle-pt-registry.ts` | ✅ Live · `hydrateFromOracle` |
| **Soil Fuse Wiring** | `soil-resistance.ts` | ✅ Live · `pendleOracle` + `pendleCrossGuard` → `collectExternalSoilFlags()` |
| **Cross-Guard** | `pendle-gmx-cross-guard.ts` | ✅ Live · Shadow Margin · Observatory Paradox de-leverage |
| **Expiry Guard** | `pendle-pt-expiry-guard.ts` | ✅ Live · &lt;7d ∧ &gt;200bps fail-closed |

```bash
pnpm exec vitest run tests/adapters/pendle-market-oracle.test.ts
pnpm exec vitest run tests/adapters/pendle-pt-registry.test.ts
pnpm exec vitest run tests/risk-control/pendle-soil-guard.test.ts
```

**回歸基線：** **192 個測試檔案 \| 836 PASS Clean** · 與 Shield **p50 ~106µs** 預算共存。

---

## 防禦矩陣（R01–R20）

**狀態：** **17 Active | 2 Refactored | 1 Deprecated**

核心不變量：Edge / Session / Saga（`src/services/`、`src/core/`、`src/adapters/`）。  
L1 鎖：`SliverVineGate.sol` consume-once attestation。

| ID | 名稱 | 狀態 | 程式 SSOT |
|----|------|--------|-----------|
| **R01** | Soil Resistance | Active | `soil-resistance.ts` + Wasm `pkg/soil_core.wasm` |
| **R02** | VineWrap / rootProtection | Active | `root-protection.ts` |
| **R03** | L2 Book Fail-Closed (500ms) | Active | `hl-l2-book-types.ts` |
| **R04** | PGATE Latency (200ms) | Active | `PGATE_MAX_LATENCY_MS` |
| **R05** | SpoofBuster | Deprecated | 由 soil / depth gate 取代 |
| **R06** | Scoped Session Key `ORDER_EXECUTE` | Active | `hl-session/permissions.ts` |
| **R07** | Notional Cap $5,000 | Active | `SESSION_KEY_NOTIONAL_CAP_USD` |
| **R08** | Nonce Auto-Healing | Refactored | `nonce-auto-healing.ts` |
| **R09** | Two-Phase Saga | Active | `intent-ledger.ts` |
| **R10** | Auto-Compensating Flatten | Active | `flatten-hardlock.ts` |
| **R11** | Dynamic Account Risk Ceiling | Active | `effective-max-sl.ts` |
| **R12** | Leverage Scaling 3x→1x→Halt | Active | `funding-regime-guard.ts` |
| **R13** | Black-Swan Speed-Halt | Active | `black-swan-guard-core.ts` |
| **R14** | EIP-712 Re-Auth (5-min) | Active | `unlock-reauthorization.ts` |
| **R15** | CCXT Fault Harness | Refactored | `safe-exchange-fetch.ts` · `chase-engine.ts` |
| **R16** | SHA-256 5-TX Anchor | Active | `verified-5tx-lib/` |
| **R17** | Daily Loss Severance | Active | `circuit-breaker.ts` |
| **R18** | KV Hardlock 24h | Active | `kv-lib/keys.ts` TTL 86_400s |
| **R19** | `SESSION_ENTROPY_SEED` | Active | `layout-metric-provider.ts` |
| **R20** | Physical Deadlock `R20_FLATTEN_FAILED` | Active | `flatten-hardlock` + `circuit-breaker-sever.ts` |

**支援 sensor：** Sequencer Guard · Arbitrum Gas / Oracle Lag · RPC Whitelist · Escalation Ladder。

**Dynamic Max SL（SSOT）：** $\mathrm{MaxSL} = \mathrm{Balance} \times 0.01 + 100$ — 已廢止固定 $50 SL。

---

## 微秒護城河（執行矩陣摘要）

| 護城河 | 常數 / 模組 | 規格 |
|------|-------------------|------|
| **Emergency Margin Buffer** | `DEFAULT_CROSS_MMR = 0.05` | 自由 margin buffer &lt; **5%** 時阻擋新風險 |
| **HL Nonce Auto-Resync** | `nonce-auto-healing.ts` | Monotonic nonce heal · heartbeat revoke |
| **NTP Clock Drift Compensator** | `NTP_CLOCK_DRIFT_COMPENSATOR` | 相對 Edge NTP **&lt; 200 ms** drift（R04 對齊） |
| **Cross-Venue Net Slippage TWAP** | `CrossVenueNetSlippage` | **&gt; 0.5%** → soil trip + TWAPEngineV2 slicing |
| **Poisson Jitter TWAP** | Wasm 驅動 clips | **18s–110s** 間隔 · **≤ 10 bps** 本地 GM impact |
| **R20 Physical Deadlock** | `severCircuitBreakerPipeline()` | 滑點/深度異常下 EIP-712 簽名通道 severance |

---

## CLI 重現

```bash
# 全量 Vitest 基線
pnpm test -- --run

# 5 步 grant E2E — Step 1 Wasm p50 + Gatehouse + Deadman HUD
pnpm run demo:e2e

# 定向 soil / Wasm 套件
pnpm exec vitest run tests/services/soil-resistance-latency.test.ts
pnpm exec vitest run tests/services/wasm-feasibility-lib/soil-core-sim.test.ts
pnpm exec vitest run tests/adapters/zerodev-aa-gate.test.ts
```

---

## 關聯產物

| 路徑 | 角色 |
|------|------|
| [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](./02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) | 支柱一 Gatehouse · ZeroDev Kernel v3 |
| [`03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) | 支柱二可選入場 adapter |
| [`docs/architecture/01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) | 跨柱拓撲 · 結算 · 費用邊界 |
| [`src/services/risk-control-lib/soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) | Soil fuse SSOT |
| [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm) | Wasm soil core 產物 |
| [`tests/services/soil-resistance-latency.test.ts`](../../tests/services/soil-resistance-latency.test.ts) | 全路徑 p50 預算 |

---

*SilverVine Labs · BUSL-1.1 · 支柱三 Edge Shield Wasm Core 規格 v1.0.0*
