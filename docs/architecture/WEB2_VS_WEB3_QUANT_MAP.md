# Web2 vs Web3 Quant Map — Global Clearing Topology & Dark Route Privacy

**Project:** BeDelta Living Water · SilverVine Protocol  
**Status:** SSOT Architecture Spec  
**Sources:** `docs/08-research-and-maps/` · `docs/06-architecture-and-systems/` · `src/core/intent-ledger.ts`  
**Related:** [Risk_Envelope_Pgate.md](./Risk_Envelope_Pgate.md) · [IRONBANK_RWA_SILVER_STANDARD.md](./IRONBANK_RWA_SILVER_STANDARD.md)

---

## 1. Purpose

Map traditional Web2 commodity / FX clearing patterns onto the BeDelta three-chain surface (**HL · ARB · SOL**), and define how the **2PC Intent Ledger** enables dark-route privacy and stacked RWA / stablecoin yield without leaking Protocol Treasury intent to public mempools or MEV observers.

---

## 2. Web2 Clearing Topology (As-Is)

| Hub | Asset Class | Mechanism | Privacy Model |
|-----|-------------|-----------|---------------|
| **CME / CBOT (Chicago)** | Commodities · rates futures | Central clearing · margin · cash-and-carry | Dark pools + block trades |
| **LME (London)** | Base metals | Warehouse warrants · delayed settlement | OTC + LME Select |
| **LCH / CLS (London)** | FX · rates | Multilateral netting · T+N | Interbank private pipes |
| **SGX / HKEX** | Asia commodities · equity futures | Regional clearing houses | Broker dark routing |
| **Zurich vault model** | Physical precious metals | Custody + redemption | Off-book allocation |

### Web2 first principles BeDelta inherits

1. **Cash-and-carry** — long spot / short futures when basis is rich → stacked yield.  
2. **Dark pool fragmentation** — large notional is sliced so the public book never sees the full size.  
3. **Rollover / overnight risk** — FX and commodity sessions have open/close gaps; crypto digests that risk 24/7.  
4. **Zero-entropy hard assets** — physical silver / gold as credit-collapse anchors (see RWA Silver Standard).

---

## 3. Web3 Surface Map (HL / ARB / SOL)

| Web2 Analog | Web3 Venue | BeDelta Role | Adapter / Module |
|-------------|------------|--------------|------------------|
| Futures short hedge | **Hyperliquid Perp** | 1x Short delta-neutral leg | `hl-intent-bridge` · Session Key TRADE_ONLY |
| Spot / lending ingress | **Solana (Jupiter · lending)** | Stable ingress APY sleeve | `solana-yield-ingress` · Jupiter guard |
| Spot / lending ingress | **Arbitrum (GMX · stables)** | Alt ingress APY sleeve | `arbitrum-yield-ingress` · GMX read-path |
| Tail insurance | **Polymarket** | Binary black-swan sleeve | `polymarket` realtime sleeve |
| Dark pool router | **2PC Intent Ledger** | Atomic dual-leg prepare / commit / abort | `intent-ledger.ts` · `intent-persistence.ts` |
| Circuit breaker | **Risk Envelope** | Soil · Root · R20 · Black-Swan | `risk-control.ts` · `black-swan-guard.ts` |

### Yield Triangle (canonical)

```text
        SOL ingress APY
              │
              ▼
   ┌──── BeDelta Living Pool ────┐
   │  2PC Intent · TTL Flatten   │
   └────────────┬────────────────┘
                │
        HL 1x Short Hedge
                │
        ARB ingress APY (parallel)
```

Conservative net APY band (post 15% performance fee): **6.2% – 22.4%** (`fee-calculator.ts`).

---

## 4. Dark Route Privacy (2PC Intent Ledger)

### Problem

Public DEX orderflow reveals Protocol Treasury size and direction. MEV / on-chain trackers can reconstruct “large vault hedging” from correlated legs.

### Solution — Intent fragmentation + TTL flatten

```text
PENDING ──prepare──► PREPARED ──commit──► COMMITTED
   │                    │
   └──── abort ─────────┴──── abort ────► ABORTED (+ reduce-only flatten)
```

| Technique | Effect on observers |
|-----------|---------------------|
| Dual-leg prepare (ingress + HL short) | Legs appear as independent retail hedges |
| Intent TTL (default 30s) | Stale prepares auto-abort; no naked delta linger |
| Session Key TRADE_ONLY | No withdrawal signature surface for hijack |
| Crash recovery (`intent-persistence`) | Edge KV restore + emergency unwind; no orphaned position |
| Micro-notional slicing at ingress | SOL/ARB entries look like scattered retail deposits |

**Dark Route Privacy claim:** Protocol Treasury capital enters as intents, hedges on HL as 1x short, and never presents a single public “vault rebalance” fingerprint that MEV bots can front-run end-to-end.

---

## 5. Cross-Chain RWA / Stablecoin Stacked Hedge

| Layer | Source Yield | Hedge | Gate |
|-------|--------------|-------|------|
| L1 Ingress | SOL lending / ARB stables | — | Ingress guard + soil probe |
| L2 Hedge | — | HL 1x Short | Session Key + Dynamic Max SL |
| L3 Tail | — | Polymarket binary (optional) | Tail threshold |
| L4 Anchor | Tokenized silver / RWA (phase+) | Basis vs crypto volatility | RWA Silver Standard |

**Cash-and-carry Web3 translation:** when funding + ingress APY > friction, BeDelta routes capital through Yield Triangle; when soil resistance trips or black-swan deviation locks, ingress and hedge abort via 2PC flatten.

---

## 6. Regional Psychology Overlay (from research maps)

| Region | First Principle | BeDelta Mapping |
|--------|-----------------|-----------------|
| Pan-Asia 12 | Liquidity dynamics · entropy · micro-capital | LivingPool tiers · soil fuse |
| London FX | Clearing topology | Cross-venue soil probe |
| Zurich vault | Permission isolation | Session Key scope boundary |
| Frankfurt/AMS HFT | Deterministic FSM | `SystemState` SSOT |
| Nordics minimal | Algorithmic equilibrium | Dynamic Max SL + LivingWater |

OpSec note: detailed geographic philosophy maps remain internal study material under `docs/08-research-and-maps/`. External Grant language uses US-EN technical terms only.

---

## 7. SSOT Invariants

1. All venue routing decisions flow through `SystemState` (unidirectional).  
2. No opening order without Risk Envelope pre-trade input.  
3. Dual-leg intents must pass prepare → commit or abort + flatten.  
4. Dark Route Privacy is an **architectural property of 2PC**, not a separate privacy L2.  
5. RWA silver / physical anchors inherit Iron Bank + RWA Silver Standard rules.

---

## 8. Implementation Anchors

| Concern | Path |
|---------|------|
| 2PC ledger | `src/core/intent-ledger.ts` |
| Crash recovery | `src/core/intent-persistence.ts` |
| Yield triangle | `src/services/yield-router.ts` |
| Fee / APY band | `src/core/fee-calculator.ts` |
| Black-swan halt | `src/core/black-swan-guard.ts` |
| Risk envelope | `docs/architecture/Risk_Envelope_Pgate.md` |

---

**License:** BUSL-1.1 · SilverVine Labs · `:qum[x0sumx]`
