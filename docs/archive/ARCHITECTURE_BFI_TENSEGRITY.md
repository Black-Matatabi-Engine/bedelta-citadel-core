# SilverVine Protocol — BFI Tensegrity & Synergetics Architecture

**Version:** Santenmoku v0.8  
**Author & Certification:** `:qum[x0sumx]`  
**Scope:** Solana 1:3 Depth Matrix · Touchwood Circuit Breaker · Hyperliquid Cross-Chain Failsafe

---

## 1. Tensegrity Framework (Buckminster Fuller)

Buckminster Fuller's **tensegrity** structures achieve stability through a balance of **compression members** (rigid struts that resist crushing forces) and **tension members** (cables that distribute load dynamically). SilverVine Protocol maps this geometry onto execution risk architecture:

| Fuller Element | SilverVine Mapping | Module |
|---|---|---|
| Compression struts | Hard, non-negotiable physical locks | `rootProtection()` · R20_HARDLOCK · Dynamic Max SL |
| Tension cables | Elastic liquidity & index fibers | Phoenix + Raydium + Jupiter 1:3 Depth Matrix · CRI Index |
| Global equilibrium | System-wide stable posture under stress | `SystemState` SSOT · `checkSoilResistance()` |

The system does not rely on a single rigid gate. It holds shape because compression locks **bound** maximum loss while tension members **absorb and redistribute** venue-specific shocks.

---

## 2. Hard Compression Members

### 2.1 R20 Physical Deadlock

When all three Solana DEX pipes sever simultaneously, the Touchwood engine emits `R20_HARDLOCK` — a compression-member trip that:

- Severs the Session Key signing channel immediately
- Sets `signingChannelOpen = false` and `currentCri = 0`
- Signals Hyperliquid cross-chain fallback for capital preservation

Implementation: `aggregateSolanaDepth1x3()` → `SolanaR20HardlockError` (HTTP 403).

### 2.2 Dynamic Max SL — Balance × 1% + $100

The second compression strut caps per-trade worst-case loss:

```
Effective Max SL USD = (Account Equity × 0.01) + $100
```

At $10,000 equity → **$200** maximum single-position loss. This limit is welded into Root 1 of the 20-Rule Defense Matrix and enforced by `vineWrapProtection()` / `rootProtection()` before any fill.

---

## 3. Tension Members — 1:3 Depth Matrix

Three Solana venues form the tension cable network in `src/adapters/solana-adapter.ts`:

| Pipe | Model | Tension Role |
|---|---|---|
| **Phoenix** | CLOB orderbook | Bid/ask depth strut — on-chain limit book liquidity |
| **Raydium** | CLMM concentrated liquidity | Tick-range elasticity — AMM curve depth |
| **Jupiter** | Aggregator routing | Cross-pool route synthesis — oracle-linked path depth |

### 3.1 1:3 Aggregation

`aggregateSolanaDepth1x3()` computes:

- **totalDepthUsd** — sum of active pipe depths
- **compositeDepthUsd** — equal-weight average across active pipes (1:3 ratio)

Aggregated depth feeds `checkSoilResistance()` as the unified liquidity probe before execution approval.

---

## 4. Touchwood Single-DEX Fault Isolation

Touchwood engineering severs individual tension cables while preserving global equilibrium:

| Fault Condition | Threshold | Degradation |
|---|---|---|
| Phoenix slot latency | > 200ms | Sever Phoenix → Raydium + Jupiter |
| Raydium tick collapse | tick liquidity < $50k USD | Sever Raydium → Phoenix + Jupiter |
| Jupiter Pyth oracle delta | > 0.3% (30 bps) | Sever Jupiter → Phoenix + Raydium |
| All three pipes severed | — | **R20_HARDLOCK** → HL cross-chain failsafe |

Function: `evaluateTouchwoodPipes()` → `evaluateSolanaDepthMatrix()`.

---

## 5. Fluid Dynamics — Bouchaud Viscosity in `checkSoilResistance()`

Jean-Philippe Bouchaud's market microstructure model treats order books as **viscous fluids** — price impact increases non-linearly as flow rate (order size) exceeds local liquidity viscosity.

SilverVine implements this metaphor in `checkSoilResistance()` (`src/services/risk-control.ts`):

- **Cross-venue slippage** (> 0.5%) — fluid shear between HL perp and dYdX perp surfaces
- **Depth USD** (< $100k) — insufficient fluid volume to absorb flow
- **Vine soil fuse** (0.3%) — L2 book viscosity trip via `checkSoilResistanceWithVine()`

The 1:3 aggregated depth from Solana pipes becomes the **viscosity input** — higher composite depth lowers effective slippage resistance, permitting flow; collapsed depth increases viscosity and trips the breaker.

---

## 6. CRI Index as Tension Telemetry

The **Capital Resilience Index (CRI)** — 0–100 — measures remaining tension capacity:

- CRI 100 → full cable network engaged, all pipes elastic
- CRI → 0 → compression members dominate, R20 physical deadlock

CRI feeds DonDon HUD state machine and gates Session Key signing via `isR20Locked()`.

---

## 7. System Topology

```
                    ┌─────────────────────────────────┐
                    │     COMPRESSION MEMBERS         │
                    │  Dynamic Max SL · R20_HARDLOCK  │
                    └──────────────┬──────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
    ┌────▼────┐              ┌─────▼─────┐             ┌─────▼─────┐
    │ Phoenix │              │  Raydium  │             │  Jupiter  │
    │  CLOB   │              │   CLMM    │             │ Aggregator│
    └────┬────┘              └─────┬─────┘             └─────┬─────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │   1:3 Depth Aggregation         │
                    │   aggregateSolanaDepth1x3()     │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │   checkSoilResistance()         │
                    │   (Bouchaud viscosity fuse)     │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │   SystemState (SSOT)            │
                    │   Session Key · HL Fallback     │
                    └─────────────────────────────────┘
```

---

## 8. Author Certification

This architecture document is authored and certified exclusively by **`:qum[x0sumx]`** as the canonical BFI Tensegrity mapping for SilverVine Protocol Santenmoku v0.8.

No derivative tensegrity claims, compression-member bypasses, or tension-cable sever overrides are authorized without explicit re-certification by the author.

---

*SilverVine Labs · Santenboku UI FullDex · BUSL-1.1*
