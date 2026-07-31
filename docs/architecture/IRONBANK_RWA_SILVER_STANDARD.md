# Iron Bank · RWA Silver Standard

**Project:** BeDelta Living Water · SilverVine Protocol  
**Status:** SSOT Architecture Spec  
**Sources:** `docs/06-architecture-and-systems/Web3_Ironbank_BeDeltaLivingPool.md` · `docs/10-standards-and-reference/RWA_SILVER_STANDARD.md` · `docs/10-standards-and-reference/RWA_SILVER_STANDARD_ZH.md` · `docs/01-daily-todos-and-roadmaps/Ironbank_v2.0_roadmap.md` · `docs/08-research-and-maps/3map_combine.md`  
**Related:** [LUBAN_EXOSKELETON_CUSHION.md](./LUBAN_EXOSKELETON_CUSHION.md) · [WEB2_VS_WEB3_QUANT_MAP.md](./WEB2_VS_WEB3_QUANT_MAP.md) · [DONDON_CHARITY_ENGINE.md](./DONDON_CHARITY_ENGINE.md)

---

## 1. Purpose

Unify **Iron Bank v2.0** (Web3 unbreakable vault narrative + defense versioning) with the **Silver-Denominated RWA Standard** into one SSOT for how physical / stable assets sit inside **BeDelta Living Pool**: defense posture, yield routing, redeemability, and fail-closed settlement.

---

## 2. Terminology (canonical)

| Term | Definition |
|------|------------|
| **Iron Bank** | Protocol posture: assets + risk fully code-gated; “never scrambles” under black swan |
| **BEΔ Living Pool / LivingWater** | Tiered buffer + yield vault that absorbs flash slip / funding flip before user equity |
| **Silver-Denominated RWA** | Tokenized physical silver (or equivalent hard asset) anchoring redeemable vault value |
| **Zero-Entropy Hard Asset** | Asset / position state with toxic drag stripped — high certainty, fail-closed |
| **Cryptographic Turnstile** | Session Key isolator: time-bounded TRADE_ONLY scope; no withdraw |

English aliases (RWA standard): *Silver-Denominated RWA Protocol* · *Silver-Standard Real World Asset Vault*.

---

## 3. Iron Bank First Principles

| Dimension | Traditional DEX / CEX | Iron Bank (SilverVine) |
|-----------|----------------------|-------------------------|
| Incentive | Liquidation fees · FOMO churn | Preserve equity · stacked yield |
| Risk model | Forward entropy (toxic slip · wick) | Entropy rejection pump (soil · root · R20) |
| Liquidation | Passive liquidator wipeout | Snapshot · Micro-Unwind · Cushion (LuBan) |
| Key surface | Full wallet / unlimited | Session Key TRADE_ONLY · TTL |
| Truth | Fragmented UI flags | `SystemState` SSOT unidirectional |

**One-liner (Grant):**  
> Traditional DEXs treat risk as irreversible market entropy. Iron Bank uses Session Key turnstiles, Dynamic Max SL, and Living Pool buffers to invert that entropy and keep capital redeemable.

---

## 4. RWA Silver Standard Rules

### 4.1 Core concept

Tokenized physical silver backs vault NAV with **yield-bearing but redeemable** design. All vault ops inherit:

- 20-root defense matrix (versioned; R20 = ultimate deadlock)
- `checkSoilResistance()` before any risk-increasing action
- `rootProtection()` / hardlock when integrity thresholds breach
- Fail closed on liquidity / settlement / oracle integrity failure

### 4.2 Defense integration

| Gate | Vault behavior on trip |
|------|------------------------|
| Soil trip | Block new RWA mint / hedge open |
| Root / Dynamic Max SL | Cap estimated loss on hedge legs |
| R20 / hardlock | Sever signing · halt vault risk ops |
| Black-swan halt | Liquidity / deviation lock · 2PC flatten |
| De-peg / PoR fail | Freeze mint/redeem until reserve proven |

### 4.3 Proof of Reserve (PoR)

- Public multisig / HL vault addresses for silver hedge + margin  
- Zero private-key exposure for auditors (read-path only)  
- 24/7 explorer-visible reserve attestation target (Wave 2+)

---

## 5. BeDelta Living Pool — Asset Defense & Yield Flow

### 5.1 Capital vector

$$
\vec{c} = \langle c_{\mathrm{HL\_PERP}},\ c_{\mathrm{ingress}},\ c_{\mathrm{RWA}},\ c_{\mathrm{cushion}},\ c_{\mathrm{dondon}} \rangle
$$

| Sleeve | Role | Chain |
|--------|------|-------|
| HL Perp | 1x Short delta-neutral | Hyperliquid |
| Ingress | Stable / lending APY | SOL · ARB |
| RWA Silver | Hard-asset anchor | Tokenized silver vault |
| Cushion | LuBan / LivingWater buffer | Protocol stake |
| DonDon | 0.1% social impact pool | Charity vault (see DonDon spec) |

### 5.2 Flow model

```text
User deposit (stable / RWA claim)
        │
        ▼
┌─ Iron Bank Living Pool ─┐
│  Tier buffer reserved   │──► Cushion (LuBan)
│  Remaining deployable   │
└───────────┬─────────────┘
            │
     Yield Triangle 2PC
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
 Ingress  HL Short  RWA sleeve
   │        │        │
   └────────┴────────┘
            │
   Gross yield → 15% perf fee
            │
      ┌─────┴─────┐
      ▼           ▼
  Net to user   Protocol treasury
                  │
                  └── 0.1% → DonDon Protection Pool
```

### 5.3 Tiered LivingPool (capital efficiency)

| Tier | Buffer | Lumpsum guidance |
|------|--------|------------------|
| Lite | $100–$300 | ≤ $3k |
| Standard | $500 | ≤ $20k |
| Pro | $1k+ | > $20k |

Buffer exists to absorb flash slip + funding flip **before** user equity hits Dynamic Max SL / R20.

---

## 6. Iron Bank v2.0 Roadmap Alignment

| Version | Defense span | Focus |
|---------|--------------|-------|
| v0.8 Santenmoku | 20 roots · R20 deadlock | HL Grant MVP · Risk Envelope · 2PC |
| v1.5 | ~25–30 roots | L2 sequencer backup · MEV builder filter · LuBan telemetry |
| v2.0 | 50+ / “Diamond” matrix | RWA silver sleeve live · PoR · cross-chain IronVault |

**Rule:** expanding roots is config/adapter growth — not a rewrite of `SystemState` SSOT.

---

## 7. Tri-Fi Matrix (future expansion)

| Layer | Focus | Milestone |
|-------|-------|-----------|
| Web3 native | MEV · Session Key · 24/7 perp | Wave 1 (current) |
| Silver / RWA | Physical precious metals · DePA | Wave 2+ |
| Web2 FX / TradFi | Rollover · CLS / LCH topology | Wave 3 |

Lazy evaluation: Wave 1 locks Web3 + Iron Bank narrative; RWA silver sleeve activates when PoR + custody rails are ready.

---

## 8. SSOT Invariants

1. Vault actions fail closed when soil / root / PoR integrity fails.  
2. RWA redeemability must not be subordinated to speculative hedge PnL.  
3. LivingPool cushion capital is not user withdrawable yield until surplus rules allow.  
4. Session Key never gains withdraw / transfer scope.  
5. Fee routing (15% / 0.1%) is defined in `fee-calculator.ts` and DonDon SSOT — no parallel fee SSOT.

---

## 9. Implementation Anchors

| Concern | Path |
|---------|------|
| Fee engine | `src/core/fee-calculator.ts` |
| Risk gates | `src/services/risk-control.ts` |
| Yield routing | `src/services/yield-router.ts` |
| 2PC | `src/core/intent-ledger.ts` |
| Black swan | `src/core/black-swan-guard.ts` |
| Tensegrity | `docs/architecture/LUBAN_EXOSKELETON_CUSHION.md` |
| Legacy RWA short form | `docs/10-standards-and-reference/RWA_SILVER_STANDARD.md` |

---

**License:** BUSL-1.1 · SilverVine Labs · `:qum[x0sumx]`
