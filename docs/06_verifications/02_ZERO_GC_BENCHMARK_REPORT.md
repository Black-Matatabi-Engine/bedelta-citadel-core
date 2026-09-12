# Zero-GC Benchmark Report — SliverVine Stylus ReflexCore (SSRC)

> **Product:** **SliverVine ExoMesh** (Module A) · **Engine:** **SliverVine Stylus ReflexCore (SSRC)** (`pkg/soil_core.wasm`)  
> **Vitest SSOT:** **228 test files | 1065 PASS clean (100%)** · `pnpm exec tsc --noEmit` **0 errors**

---

## Executive Summary

SliverVine ExoMesh eliminates per-request heap churn on the AI-agent hot path by pre-allocating ring slabs, `DataView` scratch buffers, and u32 LUTs at module load. Under **10,000+ req/sec** agent transaction swarms, V8 GC jitter is driven toward **zero** on the reflex arc.

| Metric | Result | Verification |
|--------|--------|--------------|
| **Ring slab heap delta** | **<16 KiB** over 10,000 iterations | `npx vitest run tests/core/intent-sinking-audit.test.ts` |
| **Object scavenging** | ~50,000 obj/sec → **0** on hot path | `CALLDATA_SCRATCH` · `SOIL_FFI_REUSABLE_BUFFER` · `BIGINT_U32_LUT` |
| **SSRC warm soil check** | **<1.8µs** | `evaluateSoilViaWasm()` · `pkg/soil_core.wasm` |
| **Reflex severance** | **p50 ~15µs** | `rootProtection()` · `pnpm demo:gmx -- --trip` |
| **E2E ExoMesh Edge** | **p50 ~106µs** | Worker + TS Gateway + SSRC FFI · `pnpm demo:gmx` |

---

## Ring Slab Layout (Module-Load SSOT)

| Buffer | Type | Size | Role |
|--------|------|------|------|
| **`INTENT_RING_SLAB`** | `BigInt64Array` | 256×4 i64 = 8 KiB | Wasm FFI / Stylus C-ABI export |
| **`INTENT_RING_U32`** | `Uint32Array` | 1,024 u32 = 4 KiB | Zero-GC venue drift + attempt budget |
| **`CALLDATA_SCRATCH`** | `Uint8Array` | Reusable calldata decode | u32 selector dispatch |
| **`SOIL_FFI_REUSABLE_BUFFER`** | `ArrayBuffer` | Fixed Wasm input lane | Zero per-invoke `ArrayBuffer` alloc |

**SSOT modules:** [`intent-core-buffers.ts`](../../src/core/intent-core-buffers.ts) · [`intent-core-ring.ts`](../../src/core/intent-core-ring.ts) · [`calldata-hex.ts`](../../src/sdk/eip1193-agentic-wallet-guard/calldata-hex.ts) · [`wasm-soil-ffi.ts`](../../src/core/wasm-soil-ffi.ts)

---

## Verification Commands

```bash
# Zero-GC ring slab + FNV slot hash equivalence
npx vitest run tests/core/intent-sinking-audit.test.ts

# Full regression bar
pnpm test -- --run          # 228 files | 1065 PASS
pnpm exec tsc --noEmit      # 0 errors
```

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [`../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md) | R01–R20 · ReflexCore (SSRC) deep dive |
| [`../04_sdk_and_integration/02_EXOMESH_PROVIDER_GUARD_SPEC.md`](../04_sdk_and_integration/02_EXOMESH_PROVIDER_GUARD_SPEC.md) | EIP-1193 guard threat model |
| [`01_VERIFICATION_MATRIX.md`](./01_VERIFICATION_MATRIX.md) | Full CLI verification hub |
