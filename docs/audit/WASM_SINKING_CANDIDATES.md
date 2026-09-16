# WASM Sinking Candidates Audit

> **Audit date:** 2026-09-14 · **SSOT:** `pkg/soil_core.wasm` · `src/wasm/` Rust crate  
> **Baseline bundle:** 163.81 KiB raw · 57.88 KiB gzip (`SYSTEM_METRICS_SSOT.json`)

## Executive Summary

SliverVine ExoMesh already ships **`soil_core.wasm`** (Rust) for sub-1.8µs warm soil reflex via `wasm-adapter.ts`. This audit ranks **remaining TypeScript hot-path compute** for Phase-2 sinking into `src/wasm/` (Rust → `wasm32-unknown-unknown`) or Stylus coprocessor offload.

| Priority | Function / Module | Current LOC | Wasm Status | Target Latency |
|----------|-------------------|-------------|-------------|----------------|
| **P0** | `evaluateSoilSlippagePacked()` | `soil-resistance-math.ts` | **✅ Sunk** — Wasm SSOT via `soil-wasm-runtime.ts` | < 1.1µs |
| **P0** | `intent_core_evaluate_gate()` | `intent-core-ring.ts` | **In-flight** — FFI wired | < 15µs |
| **P1** | `checkSoilResistance()` external bitmask | `soil-resistance-external.ts` | **✅ Sunk** — `soil_core_fold_probe_mask` ABI v2 | < 5µs |
| **P1** | `evalAsyncVaultDrift()` | `soil-resistance-math.ts` | **✅ Sunk** — `eval_async_vault_drift` in `soil_core.wasm` | < 0.5µs |
| **P2** | `computeGatedExecutorPayloadHash()` | `gated-executor-payload.ts` | TS keccak | < 50µs |
| **P2** | `evaluateBlackSwanRisk()` | `black-swan-guard.ts` | TS float | < 2µs |
| **P3** | Calldata selector LUT scan | `calldata-selector-lut.ts` | TS string | < 10µs |

---

## P0 — Already Partially Sunk (Extend Rust SSOT)

### 1. `evaluateSoilSlippagePacked()` / `packSoilLane()`

| Field | Value |
|-------|-------|
| **File** | `src/core/soil-resistance-math.ts` |
| **Hot path** | Every `checkSoilResistance()` call |
| **Rust SSOT** | `src/wasm/soil_core.rs` → `soil_core_eval(in_ptr, out_ptr)` |
| **Memory model** | Pre-allocated `Float64Array(6)` scratch — zero alloc per call |
| **Sink action** | Route `computeSoilSlippageMetrics()` through `wasm-adapter.ts` exclusively; delete TS duplicate after ABI lock |
| **Test anchor** | `tests/core/intent-sinking-audit.test.ts` · `tests/services/wasm-feasibility-lib/soil-core-sim.test.ts` |

### 2. `intent_core_evaluate_gate()` — Ring + Attempt Budget

| Field | Value |
|-------|-------|
| **File** | `src/core/intent-core-ring.ts` · `src/sdk/exomesh-agentic-wallet-guard/wasm-adapter.ts` |
| **Rust SSOT** | `src/wasm/intent_core.rs` |
| **Hot path** | `withRetailGuardProvider` · 4th-strike severance |
| **Sink action** | Expand `WASM_INTENT_HEAP_BYTE_OFFSET` slab to cover venue bitmask + nonce in single FFI call |
| **GC note** | `INTENT_RING_U32` flat slab already array-first; Wasm reads by index pointer |

---

## P1 — High-Value TS → Wasm Candidates

### 3. `collectExternalSoilFlags()` bitmask aggregation

| Field | Value |
|-------|-------|
| **File** | `src/services/risk-control-lib/soil-resistance-external.ts` |
| **Compute** | Bitwise OR of `SOIL_REASON_*` flags + protocol mask |
| **Why Wasm** | Called on every soil check; currently branches across 12+ venue adapters |
| **Sink design** | Pass pre-normalized `u32` venue probe vector into `soil_core_eval` extended ABI v2 |
| **Blocker** | Async I/O guards (sequencer, gas) must stay TS — only pure bitmask fold sinks |

### 4. `evalAsyncVaultDrift()` — ERC-7540+ rate drift

| Field | Value |
|-------|-------|
| **File** | `src/core/soil-resistance-math.ts` |
| **Compute** | `bigint` delta × 10000 / requestRate |
| **Why Wasm** | Sanctuary async escort hot path; deterministic integer math ideal for Rust `u128` |
| **Sink design** | `soil_core.wasm` `eval_async_vault_drift` (BigInt `u64` ABI) — ✅ Phase-3 complete |

### 5. `resolveJitteredSoilThresholds()` — threshold jitter

| Field | Value |
|-------|-------|
| **File** | `src/core/soil-resistance-core.ts` |
| **Compute** | ±2–5 bps jitter on slippage fuse |
| **Why Wasm** | Honeypot armor; must be timing-stable and non-predictable to scrapers |
| **Sink design** | `clock_core.rs` PRNG seed + fuse output in 16-byte pack |

---

## P2 — Cryptographic / Hash Candidates

### 6. `computeGatedExecutorPayloadHash()`

| Field | Value |
|-------|-------|
| **File** | `src/sdk/gated-executor-payload.ts` |
| **Compute** | EIP-712 payload digest · keccak256 |
| **Why Wasm** | Agent batch paths; viem keccak allocates |
| **Sink design** | Rust `tiny-keccak` in wasm32; reuse 32-byte output buffer |
| **Risk** | Domain separator must remain TS SSOT for EIP-712 compliance audit trail |

### 7. `evaluateBlackSwanRisk()`

| Field | Value |
|-------|-------|
| **File** | `src/core/black-swan-guard.ts` |
| **Compute** | Slippage vs depth ratio matrix |
| **Why Wasm** | Chaos matrix calls 255×; pure f64 lane |
| **Sink design** | Fold into `soil_core.rs` as `black_swan_eval(f64×4) → u8 flags` |

---

## P3 — Bundle / Edge Optimizations (Not Wasm — Tree-Shake)

| Module | Issue | Action |
|--------|-------|--------|
| `grant-audit-edge-payload.ts` | Worker KV fallback pulls citadel stubs | ✅ Split `grant-audit-edge-citadel.ts` |
| `telemetry-analytics-core.ts` | Optional Telegram notify in worker | Lazy `import()` behind env gate |
| `humanize-log.ts` | `.map().filter()` chain | Single-pass for loop |

---

## Memory / Iterator Optimizations Applied (2026-09-14)

| Location | Before | After |
|----------|--------|-------|
| `formatDuneTelemetryCsv()` | `.map().join()` | Pre-sized `Array` + single `for` loop |
| `buildHoneypotDecoyRows()` | `.map()` | Indexed `for` + pre-sized array |
| `buildGrantAuditTelemetryRows()` | `.map()` | Indexed `for` + pre-sized array |
| `resolvePrimaryHash()` | `.map().find()` | Single-pass `for` loop |
| `buildChaosMatrixTelemetryRows()` | Already single-pass | Maintained |

---

## Refactoring — 200+ LOC Module Splits (2026-09-14)

| Module | Before | After |
|--------|--------|-------|
| `soil-resistance.ts` | 214 | 130 + `soil-resistance-external.ts` (95) |
| `grant-audit-edge-payload.ts` | 223 | 168 + `grant-audit-edge-citadel.ts` (78) |
| `exomesh-dune-telemetry.ts` | 270 | 175 + types (47) + map (108) |
| `chaos-blackswan-stress.ts` | 841 | 57 barrel + 9 submodules (all < 212 LOC) |
| `live-96h-telemetry-daemon.ts` | 410 | 96 barrel + 5 submodules (all < 185 LOC) |
| `run-security-matrix.ts` | 289 | 14 barrel + 3 submodules (all < 186 LOC) |
| `soak-test.ts` | 273 | 3 barrel + 3 submodules (all < 143 LOC) |

---

## Phase-2 Completed (2026-09-14)

| Item | Status | Notes |
|------|--------|-------|
| `computeSoilSlippageMetrics()` Wasm SSOT | ✅ | `src/core/soil-wasm-runtime.ts` · TS fallback cold-path only |
| `collectExternalSoilFlags` bitmask fold | ✅ | `packInfrastructureProbeBitmask()` → `soil_core_fold_probe_mask` |
| `soil_core` ABI v2 lane-26 | ✅ | `externalProbeMask` in `wasm-soil-ffi.ts` |
| Script module splits | ✅ | live-96h / security-matrix / soak-test subdirs |
| Verification | ✅ | tsc clean · 1091 Vitest PASS |

---

## Phase-3 Completed (2026-09-14)

| Item | Status | Notes |
|------|--------|-------|
| `evaluateSoilSlippagePacked` cold-path parity | ✅ | TS duplicate isolated to `soil-slippage-cold-path.ts`; hot path 100% via `evaluatePackedSoilLane` / `soil-wasm-runtime.ts` |
| `evalAsyncVaultDrift` Wasm sink | ✅ | `eval_async_vault_drift` in `soil_core.wasm` · BigInt `u64` parameters via `evalAsyncVaultDriftViaWasm` |
| PolicyGuardV2 Stylus ABI alignment | ✅ | `stylus-soil-abi-bridge.ts` · `mapCoreRustTripFlagsToStylusU64` · `packPolicyGuardSoilScreen` |
| Zero-alloc benchmark | ✅ | `<16 KiB / 10k` via `intent-sinking-audit.test.ts` |
| Verification | ✅ | tsc clean · **1093 Vitest PASS** (235 files) · `bundle:measure` pass |

---

## Phase-4 Completed (2026-09-14) — FINAL SINKING & CODEBASE FREEZE

> **Scope lock:** Phase-4 is the **final** Wasm sinking roadmap phase. No Phase-5 planned.

| Item | Status | Notes |
|------|--------|-------|
| GMX packed eval Wasm sink | ✅ | `sanctuary-wasm-runtime.ts` · Worker cold tier via `collectGmxGmRiskInvariantErrors` |
| PolicyGuardV2 Stylus gate | ✅ | `policy-guard-stylus-gate.ts` · activates when `stylusCoprocessor != 0` (`0xc235…625e`) |
| Zero-alloc benchmark lock | ✅ | `<16 KiB / 10k` intent + sanctuary GMX eval (`sanctuary-sinking-audit.test.ts`) |
| Codebase freeze | ✅ | `docs/audit/CODEBASE_FREEZE.json` · Buildathon & DEX Grant submission lock |
| Verification | ✅ | tsc clean · **1099 Vitest PASS** (237 files) · `bundle:measure` pass |

---

## Verification Commands

```bash
pnpm exec tsc --noEmit
pnpm test -- --run tests/core/intent-sinking-audit.test.ts
pnpm test -- --run tests/services/wasm-feasibility-simulation.test.ts
pnpm test -- --run tests/scripts/chaos-blackswan-stress.test.ts
pnpm bundle:measure
```

*SilverVine Labs · Internal Engineering Audit · DO NOT treat as external security certification*
