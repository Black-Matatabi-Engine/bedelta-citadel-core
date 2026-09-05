# 🔒 [INTERNAL ONLY] WASM OpSec Kernel Experiment Results

| Field | Value |
|-------|-------|
| **Classification** | Strictly Confidential / Internal R&D |
| **Branch** | `feat/wasm-opsec-kernel-experiment` |
| **Baseline** | `main` @ `e445865` (not modified) |
| **Date** | 2026-09-05 |

---

## 1. Objective

Prototype a **closed-source WASM protocol bitmask kernel** that batches GMX, Pendle, and Variational invariant evaluation into a **single C-ABI / FFI call** per intent, aligned with the OpSec audit recommendation ([`OPSEC_AUDIT_REPORT.md`](./OPSEC_AUDIT_REPORT.md)).

---

## 2. Artifacts

| Artifact | Path |
|----------|------|
| Rust kernel | `src/wasm/protocol_flags.rs` |
| Wasm binary | `pkg/soil_core.wasm` (cdylib `soil_core`) |
| TS layout + sim | `src/services/wasm-feasibility-lib/protocol-flags-kernel.ts` |
| Single-FFI wrapper | `src/sdk/protocol-flags-wasm.ts` |
| Parity tests | `tests/wasm/protocol-flags-kernel.test.ts` |
| Benchmark script | `scripts/benchmark-protocol-flags-kernel.ts` |

### C-ABI Entry Points

| Export | Role |
|--------|------|
| `protocol_batch_eval(in_ptr, out_ptr) -> u32` | 13×f64 in · 4×f64 out · combined flags |
| `protocol_kernel_abi_version() -> u32` | ABI stamp (`1`) |
| `soil_core_eval` | Existing soil path (unchanged) |

### Input Layout (13 × f64)

| Index | Field |
|-------|-------|
| 0–3 | GMX: OI long, OI short, pool TVL, collateral ratio |
| 4–5 | Pendle: yield current, yield oracle |
| 6–12 | Variational: quote, mark, quote ts, now, trade size, OLP depth, long-tail (1/0) |

### Flags in WASM

- `FLAGS_AUTO_SEVER_MASK` includes GMX, Pendle, and Variational trip bits
- `FLAGS_SEVERED` (bit 0) set when auto-sever mask matches (mirrors `applyAutoSeveranceOnFlags`)

**Note:** GMX sliding-window pending skew (`pending-exposure-window.ts`) remains TS-only; WASM batch uses instantaneous OI imbalance only.

---

## 3. License Hygiene

| File | Before | After |
|------|--------|-------|
| `src/wasm/soil_core.rs` | BUSL-1.1 (already on `main`) | Confirmed BUSL-1.1 |
| `src/wasm/Cargo.toml` | Apache-2.0 | **BUSL-1.1** |
| `protocol_flags.rs` | — | BUSL-1.1 header |

---

## 4. Verification

| Check | Result |
|-------|--------|
| `pnpm exec tsc --noEmit` | ✅ Clean |
| `npx vitest run` | ✅ **193 files / 842 PASS** (+1 wasm test file, +6 tests) |
| `pnpm bundle:measure` | ✅ **69.32 KiB gzip** (`pass: true`, &lt;70 KiB) |
| `pnpm build:wasm` | ✅ Compiles with `protocol_batch_eval` |

---

## 5. Benchmark Comparison (500 iterations, p50)

Measured on branch `feat/wasm-opsec-kernel-experiment` via:

```bash
pnpm build:wasm
pnpm exec tsx scripts/benchmark-protocol-flags-kernel.ts
```

| Path | p50 Latency | FFI Calls |
|------|-------------|-----------|
| **TS legacy split** (`evaluateGmxFlags` + `evaluatePendleFlags` + `evaluateVariationalFlags`) | **1.05 µs** | 0 (in-process TS) |
| **TS batch sim** (`runProtocolBatchSim`) | **0.44 µs** | 0 |
| **WASM single-FFI** (`protocol_batch_eval`) | **1.84 µs** | **1** |

### Interpretation

- WASM single-FFI is **within the 14 µs FFI budget** (7.6× headroom at p50).
- WASM p50 is ~4× slower than pure TS batch sim on Node/Vitest — expected due to `DataView` memcpy + Wasm invoke overhead in-process.
- **Production value** is OpSec (closed kernel) and **one boundary crossing** on Edge vs multiple TS evaluate paths — not raw Node micro-benchmark wins.
- Warm-path test in `protocol-flags-kernel.test.ts` asserts p50 &lt; `PROTOCOL_FFI_BUDGET_US` (14 µs).

---

## 6. Integration Status

| Area | Status |
|------|--------|
| Production `risk-engine-core.ts` hot path | **Unchanged** (experiment is additive) |
| Worker bundle | **No new imports** in `worker-entry.ts` — bundle size unchanged |
| Matrix demo `[FUSE]` / `[DISPATCH]` | Unchanged on this branch |

**Next steps (if promoted from experiment):**

1. Wire `evaluateProtocolBatch` behind `USE_WASM_PROTOCOL_KERNEL` flag in gateway path
2. Extend kernel with Camelot / Radiant / HL lanes
3. Pass pending GMX skew accumulators as extra f64 inputs
4. Tri-party parity CI: Rust / TS sim / `risk-engine-core`

---

## 7. Branch Policy

All work isolated on **`feat/wasm-opsec-kernel-experiment`**. **`main` remains pristine** — do not merge without explicit review.

---

*SilverVine Labs · Internal R&D · Not for public distribution*
