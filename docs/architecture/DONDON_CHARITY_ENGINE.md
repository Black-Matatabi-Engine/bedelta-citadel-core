# DonDon Charity Engine — 0.1% Self-Sustaining Protection Pool

**Project:** BeDelta Living Water · SilverVine Protocol  
**Status:** SSOT Architecture Spec  
**Sources:** `docs/10-standards-and-reference/RWA_SILVER_STANDARD_ZH.md` · `docs/00-unsorted/0801_A_DONDON_RWA.MD` · `docs/08-research-and-maps/BeDelta_water_300.md` · `src/core/fee-calculator.ts`  
**Related:** [IRONBANK_RWA_SILVER_STANDARD.md](./IRONBANK_RWA_SILVER_STANDARD.md) · [WEB2_VS_WEB3_QUANT_MAP.md](./WEB2_VS_WEB3_QUANT_MAP.md)

---

## 1. Purpose

Specify the automated flow that routes **0.1%** of Instant Withdrawal convenience fees (and a defined slice of Protocol performance revenue) into the **DonDon Protection Pool** — a stray-animal RWA shelter vault. This is positioned as Web3’s first **self-funding, zero-principal-drain** Positive Social Impact module: users do not donate principal; the protocol donates from yield / convenience friction already charged.

### Origin

**DonDon** — rescued stray tomcat (ear-tipped, neutered; ~3 years). The product’s moral root: hard-quant defense should leave a real-world life protected, not only a balance sheet.

---

## 2. Fee SSOT (code-aligned)

Canonical rates in `src/core/fee-calculator.ts`:

| Fee | Rate | When | Destination (default) |
|-----|------|------|------------------------|
| Performance fee | **15%** of gross yield | Continuous yield accounting | Protocol Treasury |
| Instant withdrawal convenience | **0.1%** of withdrawal notional | Instant exit | Split: ops + **DonDon Pool** |

### DonDon allocation rule (canonical)

| Source | DonDon share | Notes |
|--------|--------------|-------|
| Instant withdrawal convenience (0.1%) | **100% of that 0.1%** OR protocol-configurable ≥ 50% | Prefer full route to charity for Grant narrative clarity |
| Protocol performance fee (15%) | **0.1 percentage points of gross** *or* **0.1% of treasury take** | Must be fixed in config before mainnet; no ad-hoc diversion |

**Invariant:** User principal and LivingPool cushion are **never** skimmed for charity. Only fees on yield / convenience.

---

## 3. Flow Architecture

```text
Gross Stacked Yield (Ingress + Funding − Friction)
        │
        ├─ 85% ──────────────────► User Net APY
        │
        └─ 15% Performance Fee ──► Protocol Treasury
                                      │
                                      └─ DonDon slice (config) ──► DonDon Vault

Instant Withdrawal Notional
        │
        └─ 0.1% Convenience Fee ──► DonDon Protection Pool (primary)
```

### Vault properties

| Property | Requirement |
|----------|-------------|
| Mutability | Multisig / immutable receiver address after deploy |
| Spend policy | Verified rescue / food / medical programs only |
| Transparency | On-chain event logs for every transfer |
| Custody | Separate from Iron Bank trading sleeves |
| Fail mode | If DonDon vault unreachable → hold in escrow sub-account; never burn to void |

---

## 4. Why this is “self-sustaining / zero principal drain”

| Claim | Mechanism |
|-------|-----------|
| **Self-sustaining** | Charity volume scales with protocol activity (APY + withdrawals), not one-off fundraising |
| **Zero principal drain** | Depositors keep NAV; only fee layer funds DonDon |
| **RWA-aligned impact** | Charity vault can hold stables / silver-denominated claims under same PoR discipline as Iron Bank (read-only attestation) |
| **Positive Social Impact** | Hard-quant protocol + real animal shelter outcomes — Grant ESG narrative without greenwashing principal |

---

## 5. Grant / Public Narrative (approved language)

> *0.1% of protocol convenience / performance revenue is automatically routed to the **DonDon RWA Stray Animal Defense Fund**, creating a self-sustaining, delta-neutral charity engine — users earn yield while the protocol shelters real animals without touching principal.*

Do **not** claim:

- Charity replaces Risk Envelope or LuBan cushion  
- Donations come from user deposits  
- Unaudited off-chain cash drops without logs  

---

## 6. HUD / Brand Coupling

| Surface | Role |
|---------|------|
| Three-Eye Cat HUD | Visual spirit of protection (Santenmoku) |
| `silvervinelabs.com` | Public Benevolence / DonDon vault disclosure |
| `slivervine.xyz` | Trading DApp — fee receipts link to DonDon tx |

Charity copy must not block or slow hot-path execution (annotation-only on HUD; settlement async after fee event).

---

## 7. Operational Controls

1. **Config SSOT** — single `DONDON_FEE_BPS` / share constants (future `src/config`); no parallel magic numbers.  
2. **Audit trail** — every route emits structured JSON (`module: "dondon-charity"`, amount, source fee type, tx hash).  
3. **Cap / pause** — admin may pause DonDon routing under legal / venue risk; paused fees accrue to escrow.  
4. **No circular dependency** — DonDon vault cannot stake into speculative HL legs that risk charity capital (stable / RWA-only hold).  

---

## 8. Relation to other architecture docs

| Doc | Relationship |
|-----|--------------|
| Iron Bank / RWA Silver | DonDon is a **non-trading sleeve**; inherits PoR transparency, not hedge risk |
| Web2/Web3 Quant Map | Social impact layer completes “dark pool + moral moat” story |
| LuBan Cushion | Orthogonal — cushion protects trader equity; DonDon protects animals from fee surplus |

---

## 9. Implementation roadmap (docs-only phase)

| Phase | Deliverable |
|-------|-------------|
| Spec (now) | This SSOT |
| Wave 1.5 | Config constants + structured log stub |
| Wave 2 | On-chain / multisig receiver + withdrawal fee hook |
| Wave 2+ | Public dashboard of cumulative DonDon transfers |

---

## 10. SSOT Invariants

1. Charity never consumes user principal or LivingPool buffer.  
2. Fee rates remain aligned with `fee-calculator.ts` unless that module is intentionally versioned.  
3. All DonDon transfers are logged and address-stable.  
4. DonDon capital is non-speculative (no leveraged perp exposure).  
5. Pause accrues; it does not silently retain fees in Protocol ops without disclosure.

---

**License:** BUSL-1.1 · SilverVine Labs · `:qum[x0sumx]`  
**Dedication:** For DonDon — and every ear-tipped life that survives because the protocol chose to give back from surplus, not from the weak.
