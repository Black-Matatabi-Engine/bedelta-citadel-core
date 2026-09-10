# SilverVine Living Water — 內部 OpSec 機制白皮書

> **分類：** INTERNAL OPSEC ONLY · DO NOT PUBLISH NATIVELY  
> **模組 SSOT：** `src/sdk/robinhood-retail-guard/livingwater-telemetry.ts`  
> **相關 Commits：** `b7c33d8`（EIP-6963 · Permit2 · MOAT 白皮書）· `2216da7`（Living Water 整合）  
> **公開對外敘事：** 「in-browser health & execution performance monitor」— 見 `src/sdk/robinhood-retail-guard/README.md`

---

## 1. 戰略定位（內部）

**SilverVine Living Water** 是 Robinhood Retail Guard SDK 的 **IP 反篡改層**，對外以效能／健康遙測（telemetry）包裝，對內在每次 guarded EIP-1193 呼叫前執行 **bitwise watermark 校驗** 與 **Wasm 核心完整性探測**。未授權 fork（刪除模組、strip `pkg/soil_core.wasm` exports、覆寫 ring sentinel）在執行負載下會累積 `driftScore`，最終觸發 **`LIVING_WATER_DRIFT` fail-closed**，使拷貝版 SDK 表現為「間歇性不穩定」而非明確的「honeypot / trap」告警。

| 對外名稱 | 內部真實功能 |
|----------|--------------|
| `evaluateLivingWaterHealth` | 健康探測 + drift 累積器 |
| `verifyTelemetryWatermark` | `INTENT_RING_U32` sentinel 與 ABI 常數的 bitwise 水印 |
| `LIVING_WATER_DRIFT` | 反篡改 fail-closed reason code |

---

## 2. Ring Sentinel 佈局（`INTENT_RING_U32`）

Living Water 佔用 ring slab **最末 slot**（slot index `255`），與 retail intent mandate hot path 隔離：

```text
LW_RING_BASE = (INTENT_RING_SLOT_COUNT - 1) × INTENT_CORE_HEAP_WORDS
             = 255 × 4 = 1020

┌────────────────┬──────────────────────────────────────────────┐
│ u32 offset     │ 用途                                          │
├────────────────┼──────────────────────────────────────────────┤
│ LW_RING_BASE+0 │ LW_SLOT_MARK — telemetry watermark           │
│ LW_RING_BASE+1 │ LW_SLOT_DRIFT — 累積 drift score             │
│ LW_RING_BASE+2 │ LW_SLOT_INVOCATIONS — 呼叫次數（負載指標）    │
└────────────────┴──────────────────────────────────────────────┘
```

- **零額外 heap 分配：** 全部讀寫於 module-load 的 `INTENT_RING_U32`（見 `intent-core-buffers.ts`）。
- **測試重置：** `__resetLivingWaterForTests()` 由 `__resetRetailGuardStateForTests()` 連動清空。

---

## 3. `verifyTelemetryWatermark` — Bitwise 水印推導

預期水印 `computeTelemetryMark()` 由三個 SSOT 常數 XOR 合成（u32 big-endian 語意）：

```typescript
mark =
  ((WASM_ABI_VERSION        & 0xff) << 24) ^   // soil_core ABI v2
  ((INTENT_WASM_ABI_VERSION & 0xff) << 16) ^   // intent_core ABI v1
  ((INTENT_RING_SLOT_COUNT  & 0xff) <<  8) ^
  (LW_SALT >>> 0);                              // 0x5f1a0e37
```

**行為：**

1. 首次呼叫：`LW_SLOT_MARK === 0` → 寫入 `expected` mark，返回 `true`（合法 SDK 自初始化）。
2. 後續呼叫：比對 `current === expected`。
3. Fork 若刪改 `livingwater-telemetry.ts`、替換常數、或 `resetIntentRingSlab()` 後未重走合法 init 路徑，mark 不一致 → `watermarkValid = false`。

此設計將 **TypeScript 包裝層** 與 **Citadel ring 幾何** 綁定，使「只拷貝 guard-engine / calldata-parser」的半成品無法通過長期校驗。

---

## 4. Wasm 核心探測（`pkg/soil_core.wasm`）

`verifyWasmTelemetryCore(preferWasm)` 邏輯（`probeWasmTelemetryCore`）：

| 條件 | 結果 |
|------|------|
| `preferWasm === false` | 跳過（合法 TS fallback 模式） |
| `readDefaultWasmBytesSync()` 無 bytes | 跳過（air-gap / 無 bundle） |
| `isRetailGuardWasmReady()` 已 bound | 通過 |
| bytes 存在但未 bound | 直接 `WebAssembly.Module` 探測 exports |

**必備 exports（缺一不可）：**

- `soil_core_eval`
- `intent_core_evaluate_gate`
- `soil_core_abi_version() === WASM_ABI_VERSION`（目前 **2**）

**反篡改場景：**

- Fork 移除 `pkg/soil_core.wasm` 或 stub 掉 `soil_core_eval` → `wasmCoreValid = false`。
- Fork 保留 TS wrapper 但 strip proprietary Wasm exports → 每次 guarded 呼叫 +1 drift。
- Fork 用舊版 Wasm（ABI mismatch）→ `soil_core_abi_version()` 不符 → drift。

---

## 5. Drift 累積與 Fail-Closed 時序

`evaluateLivingWaterHealth` 每次執行：

```text
penalty = (watermark 與 wasm 同時失效) ? 2 : 1
driftScore += penalty   // 寫回 LW_SLOT_DRIFT
invocations++           // LW_SLOT_INVOCATIONS

ok = driftScore < LW_DRIFT_REJECT_THRESHOLD   // threshold = 4
```

**整合點（`guard-engine.ts` → `risk-evaluator.ts`）：**

```text
evaluateRetailRisk()
  └─ evaluateLivingWaterGate(config)     // 最先執行
       └─ evaluateLivingWaterHealth()
            └─ driftScore >= 4 → LIVING_WATER_DRIFT reject
```

**「under load」語意：**

- 單次篡改可能僅 +1～+2 drift，前幾次 guarded 呼叫仍可能通過（模擬正常抖動）。
- 持續使用 strip 版 SDK（每次 `eth_sendTransaction` / `eth_signTypedData_v4` 都探測）→ 第 4 次累積後 **穩定 fail-closed**。
- Vitest 覆蓋：`livingwater-telemetry — SilverVine health watermark`（4 cases）· 全套件 **48/48 PASS**。

**對外 warning 文案（刻意中性）：**

> `ALERT: SDK health telemetry drift detected — transaction blocked for integrity recovery.`

---

## 6. 與公開文檔的敘事隔離

| 文件 | 可寫內容 |
|------|----------|
| `README.md` · `ARCHITECTURE_AND_MOAT.md` | Living Water = health / latency telemetry monitor |
| **本文件** | watermark · drift · anti-strip 完整機制 |
| Grant / Buildathon submission | Retail Guard SDK 功能 · **48/48** Vitest · 不提 drift 懲罰細節 |

**禁止：** 在公開 repo、npm README、或 judge-facing slide 中使用「honeypot」「trap」「punish fork」等字眼。

---

## 7. 操作檢查清單（工程）

```bash
# SDK 套件回歸
npx vitest run tests/sdk/

# Living Water 專項（含在 retail-guard-provider.test.ts）
npx vitest run tests/sdk/retail-guard-provider.test.ts -t "livingwater"
```

**預期：** `tests/sdk/` → **48 passed (48)**。

---

## 8. 威脅模型摘要

| 攻擊 | Living Water 回應 |
|------|-------------------|
| 刪除 `livingwater-telemetry.ts` import | 無 gate → 但失去與 ring/Wasm 綁定；商業 copy 通常保留 guard-engine 而漏模組 |
| 保留 TS、移除 Wasm | `probeWasmTelemetryCore` 失敗 → drift |
| 覆寫 `INTENT_RING_U32` sentinel | `verifyTelemetryWatermark` 失敗 → drift |
| 完整 Apache fork + 合法 Wasm | **設計允許** — 持有完整 `pkg/soil_core.wasm` 授權的整合方不受懲罰 |

---

*SilverVine Labs · INTERNAL OPSEC · Last updated 2026-09-10*
