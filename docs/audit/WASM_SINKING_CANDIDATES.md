# WASM Sinking Candidates Audit

> **Audit date:** 2026-09-14 · **SSOT:** `pkg/soil_core.wasm` · `src/wasm/` Rust crate  
> **Baseline bundle:** 163.72 KiB raw · 57.81 KiB gzip (`SYSTEM_METRICS_SSOT.json`)

## Executive Summary

SliverVine ExoMesh already ships **`soil_core.wasm`** (Rust) for sub-1.8µs warm soil reflex via `wasm-adapter.ts`. This audit ranks **remaining TypeScript hot-path compute** for Phase-2 sinking into `src/wasm/` (Rust → `wasm32-unknown-unknown`) or Stylus coprocessor offload.

| Priority | Function / Module | Current LOC | Wasm Status | Target Latency |
|----------|-------------------|-------------|-------------|----------------|
| **P0** | `evaluateSoilSlippagePacked()` | `soil-resistance-math.ts` | **Partial** — TS mirror of Rust | < 1.1µs |
| **P0** | `intent_core_evaluate_gate()` | `intent-core-ring.ts` | **In-flight** — FFI wired | < 15µs |
| **P1** | `checkSoilResistance()` external bitmask | `soil-resistance-external.ts` | TS only | < 5µs |
| **P1** | `evalAsyncVaultDrift()` | `soil-resistance-math.ts` | TS bigint | < 0.5µs |
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
| **Sink design** | `sanctuary_invariants.wasm` (exists: `pkg/sanctuary_invariants.wasm`) |

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

---

## Recommended Phase-2 Roadmap

1. **Lock `soil_core` ABI v2** — extend 6×f64 pack with protocol mask u32.
2. **Delete TS `evaluateSoilSlippagePacked` duplicate** once Wasm path is 100% default in Worker.
3. **Sink `evalAsyncVaultDrift`** to `sanctuary_invariants.wasm`.
4. **Benchmark** via `tests/core/intent-sinking-audit.test.ts` — maintain `<16 KiB` / 10k iter budget.
5. **Stylus coprocessor** (`0xc235…625e`) — on-chain mirror of P0 soil eval for PolicyGuardV2 pre-screen.

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
