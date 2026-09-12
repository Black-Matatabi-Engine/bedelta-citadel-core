> [ARCHIVED LOG] Historical terminology retained for audit trail.

# Performance & Cross-Tier Parity Audit — Zero-GC Pointerization · TypedArray Sinking · Bitwise Pure State

> **Audit date:** 2026-09-10  
> **Scope:** `src/core/` · `src/wasm/` · `contracts/` (Solidity + `citadel_invariants` Stylus)  
> **Auditor role:** Principal Systems Performance Engineer & Compiler Architect  
> **Related SSOT:** [`02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md) · [`01_ON_CHAIN_MAINNET_ANCHORS.md`](../03_ON_CHAIN_MAINNET_ANCHORS.md)

---

## Executive Summary

Citadel's **Tier-0 reflex arc** (intent mandate gate · soil slippage lane · monotonic clock) is **largely zero-GC compliant** via pre-allocated ring slabs and scratch-object reuse. The **full soil fuse** (`services/risk-control-lib/soil-resistance.ts`) and **orchestration sinks** (`risk-engine-soil.ts`) remain **cold-path / gateway** surfaces with intentional `Date.now()`, string reason accumulation, and service-layer I/O — not inner-loop hot paths.

**Cross-tier parity is partial by design:**

| Tier | Coverage | Gap |
|------|----------|-----|
| **Intent mandate** | TS u32 ring ↔ Rust `intent_core.rs` ↔ Solidity `IntentRingSlabLib.sol` | Wasm lacks FNV `hashKeyToSlot` + 256-slot ring; single 4×i64 heap only |
| **Soil slippage lane** | TS `evaluateSoilSlippagePacked` ↔ Edge `soil_core_eval` (f64) | Stylus `soil_eval_u64` uses **different packed ABI** (spread_bps / depth u64) |
| **Clock SSOT** | TS `MonotonicTimeSSOT` ↔ `clock_core.rs` | No on-chain Solidity/Stylus clock module |
| **GMX wire invariants** | TS `gmx-risk-core.ts` ↔ `GmxRiskInvariantLib.sol` ↔ `citadel_invariants/gmx_invariants.rs` | ✅ Full triple parity via `PolicyGuardV2` + Stylus fallback |
| **Risk flag matrix (R01–R20)** | TS bitwise `risk-flags.ts` + evaluators | No Wasm/Stylus compiled lane for Variational / USDAI / Pendle / HL sub-flags |

**Verdict:** Zero-GC sinking is **production-grade on the intent ring + soil lane math**. Branchless bitwise pure state is **achieved for flag evaluators and venue masks** but **not** for full soil orchestration or simulation harnesses. Wasm/Stylus parity is **strong on GMX + intent budget** and **weak on multi-protocol flag evaluators + black-swan cascade**.

---

## Audit Methodology

1. Static scan of `src/core/**/*.ts` for `new Map`, `.push()`, `{}`, `Date.now()`, `new Array` / `new Float64Array` inside exported pure functions.
2. Hot-path classification: **T0 Reflex** (Edge p50 ~106µs budget) vs **T1 Gateway** vs **T2 Orchestration** vs **T3 Persistence**.
3. Symbol inventory: TS exports vs `src/wasm/*.rs` `#[no_mangle]` C-ABI vs `contracts/` Solidity/Stylus.
4. Regression anchors: `intent-sinking-audit.test.ts` (8/8) · `clock-monotonicity.test.ts` (14/14) · `IntentRingSlabTest` (5/5 Foundry fuzz).

---

## Pillar 1 — Memory & Allocation Audit (Pointerization & TypedArray Sinking)

### 1.1 Tier-0 Reflex — COMPLIANT

| Surface | Sinking mechanism | Heap behavior |
|---------|-------------------|---------------|
| **`intent-core-buffers.ts`** | Module-load `globalThis` singleton `BigInt64Array(1024)` + `Uint32Array(1024)` | **Zero per-gate alloc** |
| **`intent-core-ring.ts`** | `evaluateIntentGateU32Pure` in-place `INTENT_RING_U32` mutation | Reuses `GATE_RESULT_SCRATCH` / `ATTEMPT_BUDGET_SCRATCH` (module singletons) |
| **`intent-core.ts`** | Ring-slab branch uses u32 path; `BigInt64Array` path for Wasm FFI cold sync | Scratch objects reused; no `new` in inner loop |
| **`soil-resistance-math.ts`** | `SOIL_LANE_SCRATCH = new Float64Array(6)` at module load; `packSoilLane` accepts optional `out` buffer | Optional `new Float64Array(6)` only when caller omits `out` |
| **`monotonic-time.ts`** | `BigInt64Array(2)` per `MonotonicTimeSSOT` instance; optional Wasm heap via `allocClockWasmHeap()` | `read()` returns plain object literal (small alloc) — acceptable at gateway frequency |
| **`protocol-mask-sync.ts`** | Scalar `cachedMask` + bitwise `|` merge | **O(1) zero alloc** on `readProtocolMaskSync` / `mergeProtocolMaskLocal` |
| **`risk-flags.ts`** | Pure `number` bitmasks | Zero alloc |

**Module-load one-time allocations (acceptable):**

- `intent-core-ring.ts` — `I64_U8_LUT`: `new Array(256)` filled once at load for Wasm slab sync.
- `wasm-soil-ffi.ts` — `encodeWasmSoilInput()` allocates `ArrayBuffer` per Wasm invoke (cold FFI boundary, not inner u32 loop).

### 1.2 Tier-0 Findings — MINOR GAPS

| Finding | Location | Severity | Notes |
|---------|----------|----------|-------|
| String iteration in slot hash | `hashKeyToSlotIndex(key: string)` | **Low** | FNV-1a over string chars; key should be interned / stable per agent session |
| Telemetry object on soil trip | `logSoilCore(...)` in `evaluateSoilSlippagePacked` | **Low** | Only fires on `tripFlags !== 0` (fail-closed path) |
| `read()` return object | `MonotonicTimeSSOT.read()` | **Low** | Could sink to module scratch if called >10k/s |
| `encodeWasmSoilInput` buffer alloc | `wasm-soil-ffi.ts` | **Medium (FFI)** | Pre-allocate thread-local `ArrayBuffer` pool recommended for Wasm hot invoke |

### 1.3 Tier-1 Gateway — ACCEPTABLE (not zero-GC)

| File | Allocations | Classification |
|------|-------------|----------------|
| **`risk-engine-soil.ts`** | `SOIL_CLEAR` singleton with `reasons: []`; `Date.now()` in fast-path probe | Gateway — imports `services/` adapters for sequencer/RPC health |
| **`session-key-guard-core.ts`** | Default `nowMs = Date.now()` | Pure fn; caller should inject monotonic `nowMs` on hot path |
| **`risk-engine-flag-alt.ts`** | Bitwise flag math; `resolveWallAge` injectable | **Pure** when `nowMs` passed; no loop alloc |

### 1.4 Tier-2 Orchestration — EXPECTED ALLOCATIONS (out of hot path)

| File | Pattern | Notes |
|------|---------|-------|
| **`services/risk-control-lib/soil-resistance.ts`** | `createSoilReasonScratch`, `materializeSoilReasons`, `.push()` reason strings | Full R01–R20 soil fuse — orchestration, not reflex kernel |
| **`portfolio-cascade-core.ts`** | `steps.push()`, `reasons.push()` | Offline Gauntlet-style replay harness |
| **`black-swan-guard-lib/*`** | `triggers.push()`, `reasons.push()`, `Date.now()` | Emergency flatten orchestration |
| **`gmx-risk-core.ts`** | `errors.push()` in `collectGmxGmRiskInvariantErrors` | Audit collector — not Edge reflex |
| **`buffer-engine.ts`** | `nettingRecommendations.push()` | Rebalance planner — cold path |
| **`funding-regime-policy-core.ts`** | `reasons.push()` | Policy evaluation — cold path |
| **`risk-engine-usdai.ts`** | `reasons.push()`, `Date.now()` default | Clock SSOT orchestration wrapper |

### 1.5 Tier-3 Persistence — MAP-BACKED (by design)

| File | Structure | Hot-path impact |
|------|-----------|-----------------|
| **`intent-ledger/store.ts`** | `Map<string, CrossLegIntent>` | Ledger persistence — not reflex |
| **`intent-persistence/stores.ts`** | `Map<string, string>` | KV-style intent store |

### 1.6 `risk-control.ts` Note

There is **no** `src/core/risk-control.ts`. Soil orchestration lives in **`src/services/risk-control.ts`** (re-export barrel) and **`src/services/risk-control-lib/soil-resistance.ts`**. Core exposes **`src/core/risk-engine-soil.ts`** as the thin gateway wrapper with fast-path cache (`soilRef` / `soilFast`).

---

## Pillar 2 — Mathematical Pureness Audit (Equation & Bitwise State Machine)

### 2.1 Bitwise / Mask — COMPLIANT

| Module | Pattern | Status |
|--------|---------|--------|
| **`intent-core-ring.ts`** | `(allowedMask & targetBit) !== 0` venue drift | ✅ Bitwise |
| **`intent-core.ts`** | `encodeVenueMaskU32Pure` — `mask \|= 1 << idx` | ✅ Bitwise |
| **`risk-flags.ts`** | `FLAGS_* = 1 << n` · `applyAutoSeveranceOnFlags` mask test | ✅ Bitwise |
| **`risk-engine-flag-alt.ts`** | `f \|= FLAG_*` variational / USDAI lanes | ✅ Bitwise |
| **`protocol-mask-sync.ts`** | `cachedMask \| localMask` | ✅ Bitwise |
| **`soil-resistance-math.ts`** | `tripFlags \|= SOIL_REASON_*` | ✅ Bitwise flags; f64 slippage ratios |

### 2.2 Floating-Point in Pure Invariants — BY DESIGN

| Module | FP usage | Justification |
|--------|----------|---------------|
| **`soil-resistance-math.ts`** | `Math.abs(dydxPerp - hlPerp) / hlPerp` | Cross-venue slippage ratio — mirrored in `soil_core.rs` f64 |
| **`dynamic-max-sl.ts`** | `equity * 0.01 + 100` | Account-weighted SL cap — mirrored in `soil_core_eval` |
| **`delta-neutral-calculator.ts`** | `ethMarkUsd * 0.99 / 1.01` | Hedge limit pricing |
| **`funding-regime-core.ts`** | APR / leverage scaling | Cold policy path |
| **`portfolio-cascade-core.ts`** | HF / delta float comparisons | Simulation harness |

**Not branchless:** All Tier-0 gates use **short-circuit branches** (`if (next > maxAttempts)`). This is intentional fail-closed semantics, not SIMD branchless optimization.

### 2.3 `Date.now()` Inside Pure / Near-Pure Functions

| Function | `Date.now()` | Mitigation |
|----------|--------------|------------|
| `MonotonicTimeSSOT` consumers | Injected `wallMs` at gateway | ✅ Caller supplies clock |
| `resolveWallAge(nowMs, ts)` | **No** — pure | ✅ |
| `session-key-guard-core.verifySessionKeyValidity` | Default param only | Pass monotonic `nowMs` on hot path |
| `risk-engine-soil.isGatewayNominalFastPath` | `soil.at?.getTime() ?? Date.now()` | Fast-path bypass only when soil clean |
| `soil-resistance-jitter.resolveJitteredSoilThresholds` | Entropy seed fallback | Cold threshold jitter — not reflex |
| `black-swan-guard-flatten` | `input.now?.() ?? Date.now()` | Emergency orchestration |

---

## Pillar 3 — Execution Surface Parity (TS vs Rust/Wasm vs Solidity/Stylus)

### 3.1 Wasm C-ABI Inventory (`pkg/soil_core.wasm`)

| Export | TS SSOT | Parity |
|--------|---------|--------|
| `intent_core_check_venue_drift` | `checkVenueDriftPure` / `checkVenueDriftU32Pure` | ✅ |
| `intent_core_track_attempt_budget` | `trackAttemptBudgetPure` / `trackAttemptBudgetU32Pure` | ✅ |
| `intent_core_evaluate_gate` | `evaluateIntentGatePure` (single 4×i64 heap) | ✅ (no ring index in Wasm) |
| `soil_core_eval` | `evaluateSoilSlippagePacked` + dynamic SL | ✅ f64 lane |
| `session_core_ok` | `session-key-guard-core.verifySessionKeyValidity` | ✅ |
| `clock_core_read` | `MonotonicTimeSSOT.read` | ✅ |
| `clock_core_rpc_ingest` | `RpcTimestampWatermark.ingest` | ✅ |
| `clock_core_resolve_wall_age` | `resolveWallAge` | ✅ |
| `clock_core_saturating_sub` | `saturatingSub` | ✅ |
| `clock_core_pack_state` | `packClockStateForWasm` | ✅ |

**Missing in Edge Wasm (`src/wasm/`):**

- `hashKeyToSlotIndex` / FNV-1a ring slot routing (TS + Solidity only)
- 256-slot ring slab memory model (TS `INTENT_RING_U32` only)
- Full `risk-engine-flag-alt` protocol evaluators
- `black-swan-guard` liquidity / deviation breaker
- `portfolio-cascade-core` multi-leg replay
- `funding-regime-core` leverage scaling
- `delta-neutral-calculator` hedge sizing
- HKT time gates (`isTsunamiShieldWindow`) · HL orderbook gap guard
- Pendle / Variational / USDAI adapter-specific soil gates

### 3.2 On-Chain / Stylus Inventory

| Logic | Solidity | Stylus (`citadel_invariants`) | TS Edge |
|-------|----------|------------------------------|---------|
| Intent ring slot mask + attempt budget | `IntentRingSlabLib.sol` ✅ fuzz 5/5 | ❌ | `intent-core-ring.ts` ✅ |
| GMX execution fee / min output / pool imbalance | `GmxRiskInvariantLib.sol` ✅ | `gmx_invariants.rs` ✅ | `gmx-risk-core.ts` ✅ |
| Packed GMX+soil eval | `CitadelInvariantsPackLib.sol` | `evaluate_packed_core` ✅ | Partial — different soil encoding |
| Soil spread/depth/protocol (u64 packed) | `CitadelInvariantsStylusLib` staticcall | `soil_eval_u64.rs` ✅ | `soil-resistance-math.ts` f64 — **ABI mismatch** |
| ERC-8196 agent policy TTL / notional | `SliverVineAgentPolicyGuardV2.sol` ✅ | ❌ | `session-key-guard-core.ts` |
| Monotonic clock / RPC watermark | ❌ | ❌ | `monotonic-time.ts` + `clock_core.rs` |
| Dynamic Max SL (`balance×1%+$100`) | ❌ (in soil Stylus score only) | Partial in packed eval | `dynamic-max-sl.ts` ✅ |
| Risk flag bitmask R01–R20 | `DefenseMatrixBitmap.sol` (partial) | ❌ | `risk-flags.ts` ✅ |
| Black-swan / portfolio cascade | ❌ | ❌ | `black-swan-guard-lib` · `portfolio-cascade-core` |

### 3.3 Dual-Engine Boundary (Frozen)

Per [`01_ON_CHAIN_MAINNET_ANCHORS.md`](../03_ON_CHAIN_MAINNET_ANCHORS.md):

- **Engine A (Stylus):** `SliverVineSoilCoprocessor` `0xc23587…` — on-chain GMX+soil packed eval.
- **Engine B (Edge Wasm):** `pkg/soil_core.wasm` SHA-256 `67f8fcc7…` — clock + intent + soil C-ABI; **not Stylus-deployable** (no `#[entrypoint]` in Edge cdylib).

---

## Summary Table — File-Level Audit

| File Path | Hot Path Allocations Found | Equation / Bitwise Status | Missing Wasm Parity | Missing Stylus / Sol Parity |
|-----------|---------------------------|---------------------------|---------------------|----------------------------|
| `src/core/intent-core-buffers.ts` | **None** (module-load slab) | N/A (buffers) | — | — |
| `src/core/intent-core-ring.ts` | **None** in u32 hot loop; module-load LUT | ✅ Bitwise masks | `hashKeyToSlotIndex` | ✅ `IntentRingSlabLib.sol` |
| `src/core/intent-core.ts` | **None** in ring branch; scratch reuse | ✅ Bitwise + i64 path | 256-slot ring model | Partial (single-heap Wasm) |
| `src/core/intent-mandate.ts` | Low (delegates to ring) | ✅ Bitwise venue bits | Full mandate gate | Partial (`IntentRingSlabLib`) |
| `src/core/soil-resistance-math.ts` | **None** with `SOIL_LANE_SCRATCH`; trip logs alloc | ✅ Bitwise tripFlags; f64 ratios | — (has `soil_core_eval`) | Different ABI (`soil_eval_u64`) |
| `src/core/monotonic-time.ts` | Low (`read()` object); `BigInt64Array` state | ✅ Integer / BigInt monotonic | — (full `clock_core`) | ❌ No on-chain clock |
| `src/core/protocol-mask-sync.ts` | **None** on hot read/merge | ✅ Bitwise OR | `protocol_mask` lane in soil_core only | Partial via packed eval |
| `src/core/risk-flags.ts` | **None** | ✅ Pure bitmask SSOT | All evaluators | `DefenseMatrixBitmap.sol` partial |
| `src/core/risk-engine-flag-alt.ts` | **None** in evaluators | ✅ Bitwise flags | Full lane evaluators | ❌ |
| `src/core/risk-engine-soil.ts` | `Date.now()` fast-path; service imports | Mixed (gateway) | Sequencer/RPC guards | ❌ |
| `src/core/session-key-guard-core.ts` | Default `Date.now()` param | ✅ Pure comparisons | — (`session_core_ok`) | `PolicyGuardV2` TTL |
| `src/core/dynamic-max-sl.ts` | **None** | f64 formula | In `soil_core_eval` | ❌ standalone |
| `src/core/gmx-risk-core.ts` | `errors.push()` audit path | ✅ bigint + bps math | — | ✅ `GmxRiskInvariantLib` + Stylus |
| `src/core/delta-neutral-calculator.ts` | **None** | f64 hedge math | ❌ | ❌ |
| `src/core/funding-regime-core.ts` | **None** in core math | f64 regime | ❌ | ❌ |
| `src/core/black-swan-guard-lib/*` | `.push()` reasons | f64 thresholds | ❌ | ❌ |
| `src/core/portfolio-cascade-core.ts` | `.push()` steps/reasons | f64 simulation | ❌ | ❌ |
| `src/core/risk-severance.ts` | Side-effect only | ✅ Bitmask severance | ❌ | ❌ |
| `src/core/wasm-soil-ffi.ts` | **RESOLVED** — `SOIL_FFI_REUSABLE_BUFFER` | Layout SSOT + `stylus-soil-abi-bridge.ts` | — | ✅ bridge pack |
| `src/wasm/intent_core.rs` | N/A (Rust) | ✅ Bitwise | **RESOLVED** — `intent_core_hash_key_to_slot` | ✅ via `IntentRingSlabLib` |
| `src/wasm/soil_core.rs` | N/A (Rust) | f64 eval | — | Partial vs `soil_eval_u64` |
| `src/wasm/clock_core.rs` | N/A (Rust) | ✅ i64 monotonic | — | ❌ |
| `contracts/src/libs/IntentRingSlabLib.sol` | N/A (EVM) | ✅ u32 ring | N/A (canonical on-chain) | — |
| `contracts/src/SliverVineAgentPolicyGuardV2.sol` | N/A | Policy + GMX wire | N/A | ✅ Stylus optional |
| `contracts/citadel_invariants/` | N/A | u64 packed | N/A | ✅ Stylus entrypoint |
| `services/risk-control-lib/soil-resistance.ts` | Heavy (reasons, telemetry) | Orchestration | Partial (lane only) | Partial (packed) |

---

## Gap Closure Roadmap (Prioritized)

| Priority | Gap | Status | Resolution |
|----------|-----|--------|------------|
| **P0** | Soil ABI mismatch: Edge f64 lane vs Stylus u64 packed | ✅ **RESOLVED** | `stylus-soil-abi-bridge.ts` · `tests/core/soil-abi-parity.test.ts` **7/7** |
| **P1** | Wasm missing FNV ring index | ✅ **RESOLVED** | `intent_core_hash_key_to_slot` · `sdk/intent-wasm.ts` · Vitest parity in `intent-sinking-audit.test.ts` |
| **P1** | `encodeWasmSoilInput` per-call alloc | ✅ **RESOLVED** | `SOIL_FFI_REUSABLE_BUFFER` module scratch in `wasm-soil-ffi.ts` |
| **P2** | Risk flag evaluators (Variational / USDAI) | ⏳ Open | Pack into `PROTO_VECT_LEN` lanes · extend `soil_core_eval` protocol_mask trip |
| **P2** | `MonotonicTimeSSOT.read()` object alloc | ⏳ Open | Module scratch `{ virtualWallMs, anomaly }` for burst paths |
| **P3** | Black-swan / portfolio cascade on-chain | ⏳ Open | Keep offline; optional Stylus score feed for HF breach bitmask only |

---

## Verification Commands

```bash
# Zero-GC intent ring heap + Wasm FNV hash parity (10/10)
npx vitest run tests/core/intent-sinking-audit.test.ts

# Soil ABI golden vectors — TS · Wasm · Stylus bridge (7/7)
npx vitest run tests/core/soil-abi-parity.test.ts

# Monotonic clock + Wasm FFI (14/14)
npx vitest run tests/clock-monotonicity.test.ts

# Core import boundary (3/3)
npx vitest run tests/core/core-import-boundary.test.ts

# Portfolio cascade replay (4/4)
npx vitest run tests/core/portfolio-cascade-replay.test.ts

# Solidity ring slab fuzz (5/5)
forge test --match-contract IntentRingSlabTest

# Stylus packed eval unit tests
cargo test -p citadel_invariants
```

---

## Auditor Sign-Off

| Pillar | Grade | Notes |
|--------|-------|-------|
| **P1 Memory / TypedArray sinking** | **A** | P1 FFI buffer pool resolved; Tier-0 reflex zero-GC |
| **P2 Bitwise pure state** | **B+** | Flags + intent masks excellent; soil uses f64 ratios by design |
| **P3 Cross-tier parity** | **A-** | P0 soil bridge + P1 FNV Wasm hash resolved; clock + multi-flag lanes still Edge-only |

*This document is the internal SSOT for performance sinking and execution parity. Public-facing summaries belong in [`02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md) and [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md).*
