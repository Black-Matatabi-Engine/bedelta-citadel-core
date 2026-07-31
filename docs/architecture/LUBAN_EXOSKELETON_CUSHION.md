# LuBan Exoskeleton & Tensegrity Cushion Pool

**Project:** BeDelta Living Water · SilverVine Protocol  
**Status:** SSOT Architecture Spec  
**Sources:** `docs/06-architecture-and-systems/ARCHITECTURE_BFI_TENSEGRITY.md` · `docs/01-daily-todos-and-roadmaps/Blindspot_Roadmap.md` · `docs/00-unsorted/0801_A_DONDON_RWA.MD`  
**Related:** [Risk_Envelope_Pgate.md](./Risk_Envelope_Pgate.md) · [IRONBANK_RWA_SILVER_STANDARD.md](./IRONBANK_RWA_SILVER_STANDARD.md) · [WEB2_VS_WEB3_QUANT_MAP.md](./WEB2_VS_WEB3_QUANT_MAP.md)

---

## 1. Purpose

Define the **LuBan Metric** (critical collapse-boundary estimator) and the **Tensegrity Cushion Pool** (anti-liquidation exoskeleton). Together they form DEX-market structural protection: when a user / vault approaches hard liquidation, the protocol performs **Micro-Unwind** and **Buffer Injection** from staking capital so the account survives with ~10–20% loss instead of 100% wipeout.

> Naming: Not “insurance fund” (hackable socialized pool).  
> Canonical name: **Tensegrity Cushion Pool** — compression locks + tension liquidity (BFI tensegrity).

---

## 2. LuBan Metric (魯班尺)

### 2.1 Definition

Ancient LuBan rulers measured auspicious / inauspicious structural dimensions. The **LuBan Metric** measures whether a leveraged position / vault is inside a safe structural envelope or approaching collapse.

$$
L = f\!\left(
  \frac{M_{\mathrm{maint}}}{E},\ 
  \sigma_{\mathrm{soil}},\ 
  D_{\mathrm{depth}},\ 
  \Delta_{\mathrm{oracle}},\ 
  \mathrm{CRI}
\right)
$$

| Symbol | Meaning | Source |
|--------|---------|--------|
| $M_{\mathrm{maint}}$ | Maintenance margin requirement | Venue margin engine |
| $E$ | Account equity | `SystemState.accountBalanceUsd` |
| $\sigma_{\mathrm{soil}}$ | Cross-venue / book slippage | `checkSoilResistance()` |
| $D_{\mathrm{depth}}$ | Orderbook depth USD | L2 probe / 1:3 Solana matrix |
| $\Delta_{\mathrm{oracle}}$ | Mark vs ingress index deviation | Black-swan deviation lock |
| $\mathrm{CRI}$ | Capital Resilience Index 0–100 | `cri-engine` / ROOT DEFENSE |

### 2.2 Boundary bands

| Band | LuBan posture | Protocol action |
|------|---------------|-----------------|
| **SAFE** | $L$ well below collapse | Normal Yield / hedge routing |
| **CAUTION** | Approaching maint margin · soil elevated | Soft reduce · HUD amber · cool-down |
| **CRITICAL** | Liquidation proximity | Arm Cushion · Micro-Unwind schedule |
| **COLLAPSE** | Hard liquidation imminent / black swan | Full cushion engage · Session Key flatten · optional R20 |

### 2.3 Relation to existing fuses

| Existing fuse | LuBan role |
|---------------|------------|
| Dynamic Max SL = $B \times 1\% + \$100$ | Hard compression strut — max loss per order |
| `checkSoilResistance()` | Viscosity probe — depth / slippage shear |
| `rootProtection()` / R20 | Ultimate compression lock — sever signing |
| `evaluateBlackSwanRisk()` | Extreme $L$ — liquidity halt / deviation lock |

LuBan is the **orchestrating metric**; existing fuses are its compression members.

---

## 3. Tensegrity Cushion Pool

### 3.1 Geometry (BFI mapping)

| Fuller element | Protocol mapping | Module |
|----------------|------------------|--------|
| Compression struts | Dynamic Max SL · R20 · LuBan COLLAPSE band | `rootProtection` · black-swan · Session Key sever |
| Tension cables | Staking / LivingPool liquidity fibers | BEΔ LivingWater · Iron Bank stake |
| Global equilibrium | `SystemState` SSOT under stress | Unidirectional state updates |

### 3.2 Capital source

| Tier | LivingPool buffer | Typical lumpsum cap | Cushion authority |
|------|-------------------|---------------------|-------------------|
| Lite | $100–$300 | ≤ $3,000 | Micro-Unwind only |
| Standard | $500 | ≤ $20,000 | Unwind + buffer inject |
| Pro / Vault | $1,000+ | > $20,000 | Laddered unwind + toxic-flow hedge |

$500 Standard floor derivation (flash slip 0.8% on $50k + funding flip 0.2%):

$$
\$400_{\mathrm{slip}} + \$100_{\mathrm{funding}} = \$500
$$

### 3.3 Trigger → Response pipeline

```text
LuBan CRITICAL/COLLAPSE
        │
        ▼
┌───────────────────────────┐
│  Tensegrity Cushion Arm   │
│  1. Micro-Unwind (2PC)    │
│  2. Buffer Injection      │
│  3. Soil re-probe         │
└────────────┬──────────────┘
             │
     ┌───────┴────────┐
     │ Survive        │ Fail closed
     │ (~10–20% loss) │ → R20 / hardlock
     └────────────────┘
```

| Step | Action | Intent |
|------|--------|--------|
| **Micro-Unwind** | Reduce-only partial closes via 2PC flatten / Session Key | Lower notional before liquidator penalty |
| **Buffer Injection** | Temporary margin from Cushion / LivingPool stake | Push equity above maint threshold |
| **Re-probe** | Re-run soil + LuBan | Confirm SAFE / CAUTION before re-arming |

**Target outcome:** avoid 100% liquidation wipeout; retain ≥ **80% of avoidable liquidation loss** (user survivors keep ~80–90% equity vs full zero).

---

## 4. Anti-patterns (what this is NOT)

| Anti-pattern | Why rejected |
|--------------|--------------|
| Socialized insurance fund with withdrawable float | Classic hack vector (death spiral) |
| Waiting for external liquidators | Collusive penalty extraction (Blindspot #30) |
| Unlimited buffer prints | Moral hazard · cushion insolvency |
| Soft warnings only | No structural force — UX theater |

---

## 5. Integration with Risk Envelope

1. LuBan **CAUTION** may tighten soil fuse (vine 0.3%) before new opens.  
2. LuBan **CRITICAL** blocks new non-reduce-only orders (`assertBlackSwanClear` / Session Key gates).  
3. LuBan **COLLAPSE** may call `triggerEmergencyAutoFlatten()` for Protocol intents and arm Cushion for user vaults.  
4. Cushion spend is bounded by LivingPool tier; exhaustion → open-lock + top-up requirement (fail closed).

---

## 6. Blindspot coverage

| Blindspot ID | Topic | LuBan / Cushion answer |
|--------------|-------|------------------------|
| #1 | Static SL blindness | Dynamic Max SL + LuBan bands |
| #2 | Toxic liquidity blindness | Soil viscosity fuse |
| #6 | Fear-driven offboarding | Survivable Micro-Unwind |
| #13 | No hard circuit breakers | R20 compression strut |
| #30 | Collusive liquidation rings | Protocol-first Micro-Unwind |

---

## 7. Implementation roadmap (docs-only phase)

| Phase | Deliverable | Code touch (future) |
|-------|-------------|---------------------|
| Spec (now) | This SSOT | — |
| Wave 1.5 | LuBan telemetry fields on HUD / health API | `cri-engine` · telemetry routes |
| Wave 2 | Micro-Unwind scheduler on vault positions | 2PC + Session Key reduce-only |
| Wave 2+ | Buffer Injection ledger + PoR | Iron Bank stake accounting |

---

## 8. SSOT Invariants

1. Cushion capital never enables withdrawal of user principal by Protocol.  
2. Micro-Unwind is always reduce-only.  
3. Buffer Injection is capped by LivingPool tier residual.  
4. Fail closed: cushion empty → no new risk, existing R20 path intact.  
5. LuBan outputs must be auditable in structured JSON logs (same style as black-swan logger).

---

**License:** BUSL-1.1 · SilverVine Labs · `:qum[x0sumx]`
