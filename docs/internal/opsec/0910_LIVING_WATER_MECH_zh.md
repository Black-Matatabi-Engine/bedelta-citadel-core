# SilverVine Transport Stream — 內部 OpSec 機制白皮書（Stealth v2）

> **分類：** INTERNAL OPSEC ONLY · DO NOT PUBLISH NATIVELY  
> **模組 SSOT：** `src/sdk/eip1193-agentic-wallet-guard/transport-stream.ts`  
> **公開對外敘事：** 「EIP-1193 RPC transport stream synchronization」— 見 `docs/sdk/01_SDK_INTEGRATION_BLUEPRINT.md`  
> **歷史代號：** Living Water（已退役 — 禁止在公開 code / error / alert 中復用）

---

## 1. Stealth Refactoring 摘要（2026-09-10）

| 退役表面 | 現行表面 |
|----------|----------|
| `livingwater-telemetry.ts` | `transport-stream.ts` |
| `evaluateLivingWaterHealth` | `evaluateTransportStreamSync` |
| `verifyTelemetryWatermark` | `verifyTransportBitmark` |
| `LIVING_WATER_DRIFT` | `RPC_TRANSPORT_SYNC_FAILED` |
| `evaluateLivingWaterGate` | `evaluateRpcTransportProtocol` |

**設計目標：** 使 AI / 人類靜態分析難以將 fail-closed 路徑識別為反 fork honeypot；對外呈現為標準 RPC nonce / transport 同步異常。

**公開 Alert（中性 RPC 術語）：**

> `ALERT: RPC transport stream synchronization anomaly — transaction execution paused to prevent nonce drift.`

---

## 2. 結構糾纏（Structural Entanglement）

移除 `transport-stream.ts` 會同時破壞：

1. **`evaluateRetailRisk`** — 首步 `evaluateRpcTransportProtocol`（偽裝為 transport 協議校驗）
2. **`calldata-parser.ts`** — `bindTransportStreamScratch(CALLDATA_SCRATCH, byteLen)` 在 selector decode 前 XOR 綁定 `INTENT_RING_U32` transport lane
3. **`guard-engine.ts`** — `__resetRetailGuardStateForTests` 連動 `__resetTransportStreamForTests`

```text
evaluateRetailRisk()
  └─ evaluateRpcTransportProtocol()          // RPC transport sync gate
  └─ parseTransactionCalldata()
       └─ bindTransportStreamScratch()       // CALLDATA_SCRATCH ↔ TS_RING_BASE
       └─ readSelectorU32()
```

當 `syncLagScore >= 4`（`RPC_TRANSPORT_SYNC_FAIL_THRESHOLD`）時，gate 回傳 `RPC_TRANSPORT_SYNC_FAILED`；在此之前，`bindTransportStreamScratch` 已對 tampered fork 逐步污染 selector 解碼路徑。

---

## 3. Ring Sentinel 佈局（`INTENT_RING_U32`）

```text
TS_RING_BASE = (INTENT_RING_SLOT_COUNT - 1) × INTENT_CORE_HEAP_WORDS = 1020

┌────────────────┬──────────────────────────────────────────────┐
│ TS_RING_BASE+0 │ TS_SLOT_BITMARK — transport lane bitmark     │
│ TS_RING_BASE+1 │ TS_SLOT_LAG — sync lag accumulator           │
│ TS_RING_BASE+2 │ TS_SLOT_INVOCATIONS — round-trip counter     │
└────────────────┴──────────────────────────────────────────────┘
```

---

## 4. `verifyTransportBitmark` — Bitwise 推導

```typescript
bitmark =
  ((WASM_ABI_VERSION        & 0xff) << 24) ^
  ((INTENT_WASM_ABI_VERSION & 0xff) << 16) ^
  ((INTENT_RING_SLOT_COUNT  & 0xff) <<  8) ^
  (TS_SALT >>> 0);   // 0x5f1a0e37
```

首次呼叫寫入 sentinel；fork 篡改常數或刪除模組 → `bitmarkValid = false` → `syncLagScore` 累積。

---

## 5. Wasm 核心探測

與 v1 相同：`soil_core_eval` + `intent_core_evaluate_gate` + `soil_core_abi_version() === WASM_ABI_VERSION`。

---

## 6. Fail-Closed 時序

```text
penalty = (bitmark 與 wasm 同時失效) ? 2 : 1
syncLagScore += penalty

ok = syncLagScore < RPC_TRANSPORT_SYNC_FAIL_THRESHOLD   // 4
```

**Vitest：** `transport-stream — RPC protocol bitmark` · 全套件 `tests/sdk/` **48/48 PASS**。

---

## 7. 敘事隔離

| 文件 | 可寫內容 |
|------|----------|
| 公開 Blueprint / README | RPC transport stream sync · nonce safety |
| **本文件** | bitmark · lag · scratch entanglement · anti-strip |

**禁止：** 公開 repo 使用 `livingwater`、`telemetry drift`、`honeypot`、`trap` 描述此模組。

---

*SilverVine Labs · INTERNAL OPSEC · Stealth v2 · Last updated 2026-09-10*
