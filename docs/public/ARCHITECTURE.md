# SliverVine Protocol — Public Architecture Overview

| Field | Value |
|-------|-------|
| Protocol | SliverVine Protocol · Citadel Shield |
| Entity | SilverVine Labs |
| Version | v0.8 Santenmoku Engine |
| Audience | External · silvervinelabs.com · slivervine.xyz |

---

## Physical Clock & Edge Monotonicity Matrix (v0.8 Santenmoku)

Citadel Shield treats physical clock disagreement as normal infrastructure noise. Immunity means: when any clock source lies (NTP step, leap second, RPC regression, multi-PoP drift), the pre-consensus firewall never produces negative time intervals, fake-fresh oracle ages, duplicate execution, or silent state rollback. Untrusted time states fail-closed.

### Dual-Layer Execution Model

- **Cloudflare Edge (V8):** TypeScript host adapter (`monotonic-time.ts`), `performance.now()` for latency observation, seamless TS fallback when Wasm is unavailable.
- **Rust / Wasm (`clock_core.rs` in `soil_core.wasm`):** Proprietary saturating arithmetic, virtual monotonic wall-clock, RPC timestamp high-watermark hold.
- **Arbitrum Stylus (`contracts/stylus-probe`):** On-chain verification; `pnpm run deploy:stylus:testnet`.

### Memory Layout Parity

Host and Wasm share fixed `BigInt64Array(2)` monotonic state: `[lastWallMs, offsetMs]` as i64 slots. RPC watermark: `[blockNumber, timestampSec]`. Zero-allocation hot path; bitwise saturating math for JIT inlining.

### Fail-Closed Leap Protection

| Anomaly | Outcome |
|---------|---------|
| Negative wall step | Sticky `CLOCK_NEGATIVE_LEAP_DETECTED` · STALE / DENY |
| Excessive forward step | Sticky `CLOCK_EXCESSIVE_FORWARD_STEP` · fail-closed |
| RPC timestamp regression | High-watermark hold · no fake-fresh age |

Internal threshold constants remain inside the Wasm binary.

### Build

```bash
pnpm run build:wasm
pnpm run deploy:stylus:testnet
```

### Related Docs

- [Defense Matrix & Wasm Core](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md)
- [Three Pillars & Ingress Pipeline](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md)

---

SilverVine Labs · BUSL-1.1
