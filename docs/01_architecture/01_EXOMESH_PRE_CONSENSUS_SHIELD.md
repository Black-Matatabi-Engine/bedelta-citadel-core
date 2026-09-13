# ExoMesh Pre-Consensus Shield — Venue Matrix & Zero-GC Soil Lanes

> **Module A (70%)** · SSOT hub: [`02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](./02_DEFENSE_MATRIX_AND_SSRC_CORE.md) · [`04_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](./04_THREE_PILLARS_AND_INGRESS_PIPELINE.md)

SliverVine ExoMesh is the **pre-consensus intent firewall** — deterministic soil evaluation **before** EIP-712 signing, Arbitrum Sequencer ingress, or RFQ acceptance. Hot paths use **zero-allocation numeric slabs** aligned with `soil_core.wasm` FFI (`wasm-soil-ffi.ts` · `pkg/soil_core.wasm`).

## 5-Core Venue Matrix (Arbitrum One + HL L1)

| Venue | Role | Hot-path guard | Demo |
|-------|------|----------------|------|
| **GMX v2** | Arbitrum-native perp / GM | `gmx-v2-order-payload-guards.ts` | `pnpm demo:gmx -- --trip` |
| **Pendle** | PT/YT safety sentinel | `pendle-gmx-cross-guard.ts` | `pnpm demo:pendle -- --trip` |
| **USD.ai** | sUSDai collateral fuse | `usdai-adapter.ts` | `pnpm demo:usdai -- --trip` |
| **Hyperliquid** | L1 session-key hedge | `hyperliquid-session-guard.ts` | `pnpm demo:hl -- --trip` |
| **Variational** | RFQ + TradFi swap lane | `variational-rfq-adapter.ts` · `variational-instrument-guard.zero.ts` | `pnpm demo:variational -- --trip` |

## Variational RFQ & Swap Guard

- **Variational RFQ & Swap Guard**:
  - *Hot Path (Zero-GC)*: Sub-microsecond numeric soil check (`evaluateSwapPerpSoilZero`) — pre-allocated `SoilResultSlot` mutation only; no `new` / string materialization on reflex path ([`variational-instrument-guard.zero.ts`](../../src/guards/variational-instrument-guard.zero.ts)).
  - *Instrument Awareness*: Distinguishes **TradFi Total Return Swaps** (flat carry, market open hours, dividend pass-through) vs **Crypto Perps** (variable funding rate volatility).
  - *Defensive Limits*: Fail-closed on closed swap market hours, carry **>8%**, quote age **>500ms**, or OLP exposure **>15%**. Perp funding volatility **>80 bps** fail-closed with **SWAP** instrument hint.
  - *Cold Path*: Adapter-layer `validateVariationalRFQIntent()` delegates to core bitmask Bits 12–13 ([`variational-rfq-adapter.ts`](../../src/adapters/variational-rfq-adapter.ts)).

```text
FlatQuoteInput (numeric slab)
        │
        ▼
evaluateSwapPerpSoilZero(q, out)   ← Zero-GC hot path
        │
        ├── SWAP: marketOpen · carryBps · quoteAge · OLP util
        └── PERP: fundingVolBps · quoteAge · OLP util → hint SWAP
        │
        ▼
SoilResultSlot { action, reason, flags, hintInstrument }
        │
        └── reasonToString()  ← cold path / HUD only
```

## Physical Latency SSOT (do not conflate)

| Layer | Budget | Artifact |
|-------|--------|----------|
| SSRC Wasm reflex | **p50 ~15µs** | `soil_core.wasm` |
| ExoMesh packed lane | **p50 ~106µs** | `checkSoilResistance()` |
| LLM Cerebrum loop | **~1–10s** | out of scope |

---

*SilverVine Labs · Architecture SSOT · ExoMesh Pre-Consensus Shield · DO NOT conflate with Sanctuary async vault escort*
