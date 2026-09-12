> [ARCHIVED LOG] Historical terminology retained for audit trail.

# SliverVine Protocol — 閉門技術防禦模擬審計（Lunch Red Team · 2026-09-10）

| 欄位 | 值 |
|------|-----|
| 分類 | **內部 OpSec Only · 禁止對外原文發布** |
| 協議 / 實體 | SliverVine Protocol / Citadel Shield v0.8 Santenmoku · SilverVine Labs |
| 賽事 | Arbitrum Open House Singapore Online Buildathon |
| 評審快照 | `main` @ **`056c125`**（`beforeAll` 60s cargo hook · Zero-GC ring slab `c1a37d4` · SSOT `d152d2d`） |
| 評審性質 | **多人格閉門詰問** · Offchain Labs / GMX Synthetics / 機構記憶體審計 · **非公開評審原文** |
| 測試 SSOT | **220 test files \| 992 PASS** · `tsc` **0 errors** · `intent-sinking-audit.test.ts` **8/8** · `stylus-gmx-parity.test.ts` **6/6** |
| 本卷主題 | Zero-GC Ring Slab · Pre-Consensus 0-Gas Sequencer Defense · Mainnet Anchors `0xc235…` / `0xfd98…` |
| **四維加權均分** | **9.05 / 10** |

> 英文工程 SSOT 仍為 `src/core/*` 與 `docs/architecture/`。本卷僅為內部模擬對話與紅隊矩陣，**不得**作為公開 grant pack 原文。

---

## 1. Panel Introduction & Executive Summary

**場景：** Arbitrum Open House Singapore Buildathon 閉門技術防禦會。面板由 Offchain Labs 共識/序器衛生視角、GMX Synthetics 風險視角、以及 Trail of Bits / OpenZeppelin 風格的記憶體與熱路徑審計組成。被審對象為 **Citadel Shield（SliverVine Protocol v0.8）** 在 Cloudflare V8 Isolate 上的 pre-consensus 防火牆，而非 vault 收益率敘事。

**本場核心焦點（三條不變量）：**

| 焦點 | 工程錨點 | 經驗門檻 |
|------|----------|----------|
| **Zero-GC Ring Slab** | `INTENT_RING_SLAB` / `INTENT_RING_U32` · 256×4 · `hashKeyToSlotIndex & 0xFF` | `heapUsed` Δ **&lt; 16 KiB** / 10,000 次 `evaluateIntentGatePure()` |
| **Pre-Consensus 0-Gas Sequencer Defense** | `soil_core.wasm` · `rootProtection()` · `VENUE_DRIFT_REJECTED` | Reflex **p50 ~15µs** · E2E Shield **p50 ~106µs** · 拒絕路徑 **0 L2 gas** |
| **Mainnet Deployed Anchors** | Stylus `0xc23587d6573dd134f95b02b0202ffbf84686625e` · PolicyGuardV2 `0xfd98cadb7018f692ec58cd4359e0c0399f4f8781` | `stylusCoprocessor=0` 時 **100% Pure Solidity fail-closed** |

**執行摘要：** 面板接受 Edge Isolate 作為 sequencer ingress 的物理上游切斷面。高頻 agent hallucination 不得進入 Nitro 排隊；GMX GM 與 HL 對沖必須在密鑰與結算路徑上隔離；熱路徑不得以 `Map<string, …>` 製造 STW GC。殘餘開放項（Gate live fill、Wallet A GMX short live、42161 Dune ingest）**不**推翻本場對 pre-consensus 正確性的判定，但封頂 PMF。

```text
HEAD 056c125
  ├─ intent-core ring slab (c1a37d4)     — u32 hot path · C-ABI ↔ intent_core.rs
  ├─ stylus-gmx-parity beforeAll 60_000  — cargo test no longer 5s-hook flake
  └─ public SSOT (d152d2d)               — Core Architectural Innovations table
```

---

## 2. Persona Q&A & Hardcore Interrogations

### 2.1 Persona #2 — Dr. Steven Goldfeder（Offchain Labs）

**Q — How does Pre-Consensus Edge Shield (`soil_core.wasm`) handle high-frequency agent hallucinations without choking the Arbitrum Sequencer ingress queue?**

**A — System Defense**

Goldfeder 的問題本質是 **queue hygiene**：LLM 以 1–10s CoT 產生越權 calldata（跨鏈漂移、非白名單 venue）時，Nitro 是否會被 doomed UserOp / 垃圾交易填滿。

Citadel 的切斷點在 **EIP-712 簽名通道釋放之前**：

1. **Wasm reflex deadlock（p50 ~15µs，warm &lt;20µs）**  
   `checkSoilResistance()` 將 R01–R20 編譯為單一 bitmask。任一 trip bit → `rootProtection()` → `severSigningChannel()`。此時沒有 Bundler ingress、沒有 sequencer gossip、沒有 L2 calldata。

2. **`VENUE_DRIFT_REJECTED` 0-Gas cut**  
   `intentDigest` 綁定 `{chainId, venueKey, action}`；`allowedVenues[]` 寫入 ring slab `allowed_mask`。目標 bit 與 mask 無交集時，`evaluateIntentGatePure` **不遞增 attempts**，直接 fail-closed。這是純位元運算，不是 NLP 分類器。

3. **L2 calldata 接觸前燒 0 gas**  
   Edge 路徑 gas = **0**。Layer 2 Stylus `0xc23587d6…625e` 為可選 Nitro coprocessor；生產結算以 PolicyGuardV2 `stylusCoprocessor=0` 的 Solidity fallback 為 SSOT。拒絕路徑永不進入 `ExchangeRouter.multicall`。

```text
Agent hallucination → Edge Isolate (soil_core.wasm)
        │ bitmask OR · venue mask AND
        ▼
   FAIL_CLOSED ── severSigningChannel() ── 0 L2 gas
        │
        └── Sequencer queue never observes the intent
```

**Goldfeder 筆記（模擬）：** 「這是 ingress 衛生層，不是 on-chain pause。pause 仍佔區塊與 gas；這裡連 calldata 都不存在。」

---

### 2.2 Persona #1 — Elena Korolev（GMX Synthetics Risk Lead）

**Q — How does dual-venue fallback from Hyperliquid to GMX V2 GM Pools maintain delta-neutrality during extreme market dislocation?**

**A — System Defense**

Korolev 要求的是 **Δ_net ≡ 0 在 venue isolation 下的可執行定義**，不是「無縫切換」行銷語。

| 腿 | 錢包 | 路徑 | 狀態 |
|----|------|------|------|
| **Primary hedge** | Wallet A `0xef0752…960d` | Hyperliquid L1 session-key perp short | 0-Gas pre-broadcast soil |
| **Native backup short** | 同一 Wallet A | GMX v2 synthetic short · [`gmx-v2-wallet-a-short-builder.ts`](../../src/services/adapters/gmx-v2-wallet-a-short-builder.ts) | **simulate / encode probe only**（USDC=0 → live fill OPEN） |
| **GM LP vault** | Wallet B `0xc9BddABD80982d2201376195DD9B85fb7951546f` | GMX v2 GM deposit/withdraw **only** | 主網三證 · 無 HL key · 無 GMX perp |

**機制：**

1. **密鑰與資本隔離**  
   Wallet B 不得持有 HL session key，亦不得作為 GMX increase 簽名者。dislocation 時 HL 斷線不會把 GM LP 變成 perp 抵押；perp 風險留在 Wallet A。

2. **`gmx-v2-wallet-a-short-builder.ts` 探針**  
   編碼 `sendWnt → sendTokens → createOrder` 的 **嚴格順序** multicall。這是 fork/simulate 探針，用於證明 fallback calldata 與 GMX ExchangeRouter 線格式相容，**不是**宣稱 live short 已填。

3. **PolicyGuardV2 Pure Solidity fallback**  
   [`0xfd98cadb7018f692ec58cd4359e0c0399f4f8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) · `stylusCoprocessor=0`。Nitro Stylus 不可用時，`GmxRiskInvariantLib` 仍 fail-closed。GM 入金仍受 OI skew / pool imbalance soil 約束。

4. **Δ_net 定義**  
   `Δ_GMX_GM + Δ_HL_Short ≡ 0` 由 cross-wallet hedge cron 維護。極端錯位時：soil trip → 拒絕新風險；既有 GM LP 留在 Wallet B；不得用 multicall 把「對沖腿」與「LP 腿」打成同一原子包（見 §3 Vector 1）。

**Korolev 筆記（模擬）：** 「Backup 是編碼正確性 + 結算合約 live，不是第二條已成交空單。Δ 中性在 HL 存活時可演示；GMX short live 仍是 OPEN nit。」

---

### 2.3 Security / Memory Auditor（Trail of Bits / OpenZeppelin 風格）

**Q — In a high-frequency trading loop, how do you prevent V8 Garbage Collection spikes and Stop-The-World latency drift?**

**A — System Defense**

Auditor 拒絕「我們很快所以不會 GC」的論證，要求 **分配模型** 與 **可重現堆增量**。

| 機制 | 規格 | 為何消滅 STW |
|------|------|----------------|
| **Module-load slab** | `BigInt64Array` 256 slots × 4 i64 = **1024 words**（Wasm FFI）+ 平行 `Uint32Array` 熱路徑 | 零 per-intent `new BigInt64Array` |
| **Numeric slot index** | `slotIndex = hashKeyToSlotIndex(key) & 0xFF` · `baseOffset = slotIndex × 4` | 刪除 `Map<string, …>` 字串鍵保留與 hash table 增長 |
| **In-place u32 gate** | `evaluateIntentGatePure` 對 ring slab **禁止** 熱路徑 `new` / `bigint` boxing | 避免 `Number(bigint)` 在 10k 迴圈中的隱式分配 |
| **Scratch reuse** | 模組級 `GATE_RESULT_SCRATCH` / `ATTEMPT_BUDGET_SCRATCH` | 回傳物件不進 nursery |

**經驗證明（HEAD `056c125`）：**

```bash
npx vitest run tests/core/intent-sinking-audit.test.ts
# Tests  8 passed (8)
# Worker: 50-round JIT warmup · min-of-3 heapUsed · threshold 16 KiB / 10_000 iterations
```

`globalThis` singleton（`intent-core-buffers.ts`）保證 Vitest 雙模組圖仍指向同一 slab。C-ABI 與 [`src/wasm/intent_core.rs`](../../src/wasm/intent_core.rs) 的 `4 × i64` heap 對齊；熱路徑讀 `INTENT_RING_U32`，冷路徑 `syncIntentSlotToWasmSlab()`。

**Auditor 筆記（模擬）：** 「16 KiB 是 **上限門檻**，不是『零位元組』行銷。JIT warmup 後的 net delta 才算數；5s hook timeout 已在 `stylus-gmx-parity` 用 60s 修掉，避免把 cargo 編譯誤判成產品延遲。」

---

## 3. Red Team Attack Vectors & Mitigation Matrix

| # | Vector | 攻擊模型 | Mitigation | SSOT |
|---|--------|----------|------------|------|
| **1** | **Multicall leg-sequencing griefing** | 重排 `sendWnt` / `sendTokens` / `createOrder`（或 GM withdraw 三腿），使 OrderVault 欠款、partial fill、或把 LP 與 perp 綁進同一原子包 | **嚴格 fail-closed 順序**：編碼器固定腿序；soil / PolicyGuard 在錯誤序或 skew 時拒絕；Wallet B **禁止** 進入 perp multicall | `gmx-market-increase-multicall.ts` · `gmx-v2-wallet-a-short-builder.ts` · PolicyGuardV2 `0xfd98…8781` |
| **2** | **Retry storm / attempt budget exhaustion** | Agent 對同一 `intentDigest` 以 10× 重試灌爆 Isolate、RPC、以及（若切斷失敗）sequencer | **Max 3 attempts** per digest on ring slab · `withCitadelShield` **60s** cooldown · 超限 → `MAX_ATTEMPTS_EXCEEDED_SEVERED` + `severSigningChannel()` | `INTENT_MAX_ATTEMPTS_DEFAULT=3` · `intent-mandate.ts` · `intent-core-ring.ts` |

**Vector 1 細節：** GMX ExchangeRouter 對 `msg.value` / WNT deposit 順序敏感。錯誤序不是「多付 gas」，而是 **狀態機不變量破壞**。Citadel 不在 Edge 上「修復」錯誤序；它 **拒絕簽名**。跨 venue 不得用單一 multicall 同時移動 Wallet B GM 與 Wallet A short。

**Vector 2 細節：** Ring slab 以 digest/agent key 雜湊進 256 slot（可能碰撞；碰撞共享 attempt 計數 → **更嚴** 而非更鬆）。第四次 attempt 置 `FLAG_SEVER_CHANNEL`。Cooldown 阻擋 LLM token burn 與 RPC self-DoS，與 GC 門檻正交。

```text
retry i=1..3  → trackAttemptBudgetU32Pure  (in-place u32++)
retry i=4     → MAX_ATTEMPTS_EXCEEDED_SEVERED
              → severSigningChannel() + 60s MANDATORY_COOLDOWN_ACTIVE
```

---

## 4. Verdict & Scoring Breakdown

評分機制與既有內部卷一致：**SC**（安全與正確性）· **PMF**（產品市場契合）· **Inno**（創新）· **RPS**（可重現性與證明面）。**總分** = 四維算術平均。

| 維度 | 分 | 面板依據 |
|------|----|----------|
| **SC** | **9.22** | 0-Gas 切斷在 sequencer 上游；venue mask + attempt budget 可形式化；PolicyGuardV2 Solidity fallback live；Wallet 隔離降低 cross-leg griefing |
| **PMF** | **8.88** | GMX native backup + HL 主對沖對齊 Arbitrum/GMX 生態；**扣點**：Wallet A GMX short 仍 simulate-only、Gate live fill / Dune 42161 ingest OPEN |
| **Inno** | **8.66** | Ring slab 取代 Map 是可審計的分配模型，非敘事創新；C-ABI 對齊 Stylus/Wasm 有工程價值，但非新共識原語 |
| **RPS** | **9.31** | `intent-sinking-audit` 8/8 · 992 Vitest · `stylus-gmx-parity` 6/6（60s hook）· 公開驗證指令單測可複現 |

$$
\frac{9.22 + 8.88 + 8.66 + 9.31}{4} = \mathbf{9.05}
$$

**加權敘事帶：** **9.02 – 9.10 / 10**（Goldfeder 對 queue hygiene 加權偏 SC/RPS；Korolev 對 live GMX short 缺口壓制 PMF）。

**裁決：** **CONDITIONAL PASS（內部閉門）** — pre-consensus 與記憶體不變量在 `056c125` 上可防禦；主網「雙腿皆成交」的 Δ 中性仍為條件項。不得將本卷分數寫入公開 `SUBMISSION.md`。

---

## 5. Reproduction Commands (Internal)

```bash
# Snapshot
git rev-parse HEAD   # expected lineage includes 056c125

# Zero-GC isolation
npx vitest run tests/core/intent-sinking-audit.test.ts

# Stylus / GMX bitmask parity (cargo in beforeAll, 60s hook)
npx vitest run tests/wasm/stylus-gmx-parity.test.ts

# Sequencer-hygiene FAIL_CLOSED HUD
pnpm demo:gmx -- --trip
pnpm demo:variational -- --trip
pnpm demo:hl -- --trip
```

---

*SilverVine Labs · Internal Red Team Lunch · HEAD `056c125` · 9.05 / 10 · OpSec only*
