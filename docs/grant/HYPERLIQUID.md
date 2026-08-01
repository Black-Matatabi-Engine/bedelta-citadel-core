# BeΔ Living Water — Hyperliquid Foundation Grant Pack

**Project:** `bedelta-living-water`  
**Live HUD:** [https://bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz)  
**Entity:** [SilverVine Labs](https://silvervinelabs.com) · [GitHub](https://github.com/SilverVineLabs/bedelta-living-water)  
**Hero thesis:** Hyperliquid-native yield ingress → HL perp OI  
**Wave:** Solo-built infrastructure MVP (Wave 1)

> **Scope honesty:** Wave 1 is **read-path + Hyperliquid Testnet execution proof** — not a live cross-chain capital bridge. Bridge deployment and Durable Object ledger hardening are **Milestone 2**.

> **Milestone 2+ (not Wave 1):** LuBan Cushion and DonDon on-chain routing are Milestone 2+ specifications (fee & telemetry aligned); Wave 1 ships the core BeΔ Risk Envelope and 2PC Intent Ledger on Hyperliquid.

---

## 1. One-Sentence Pitch

**BeΔ Living Water** routes idle stable yield from **Solana / Arbitrum** into **Hyperliquid** as the sole 1× short hedge venue — gated by **Session Key TRADE_ONLY**, **Dynamic Max SL** (`Balance × 1% + $100`), and a **2PC Intent Ledger** with TTL abort + reduce-only flatten — so external capital becomes **sticky HL open interest** without naked cross-venue delta.

---

## 2. Why Hyperliquid (Ecosystem Fit · TVL / OI)

| HL outcome | BeΔ mechanism |
|------------|---------------|
| **Open Interest** | Every deployed dollar pairs with an HL 1× short hedge leg |
| **TVL stickiness** | Yield Triangle makes HL the *required* hedge anchor (`targetVenue: "HYPERLIQUID"`) |
| **Safer builder flow** | Session Key cannot withdraw; soil + root + black-swan fuses block toxic opens |
| **Fewer orphaned hedges** | 2PC prepare → commit \| abort + crash-recovery unwind |

**Wave 1 KPI targets (labeled aspirational until live bridge):**

| KPI | Target (post-M2 bridge) |
|-----|-------------------------|
| Hyperliquid Testnet 2PC intents verified | Reproducible via `pnpm grant:verify` / `grant:hl-testnet` |
| Hedge notional (pilot) | Track HL short notional vs ingress deposits |
| OI contribution | 1:1 mapping design — $1 ingress → ~$1 HL hedge OI (delta-neutral) |

---

## 3. Wave 1 — What Ships (Honest Engineering)

**Team model:** Solo architect MVP + automated CI. Scope is deliberately narrow.

| Shipped capability | Proof |
|--------------------|-------|
| Session Key TRADE_ONLY + Dynamic Max SL | `src/adapters/hl/session-key-executor.ts` |
| 2PC Intent Ledger (prepare / commit / abort / flatten) | `src/core/intent-ledger.ts` |
| HL ↔ 2PC bridge + TTL flatten | `src/adapters/hl/hl-intent-bridge.ts` |
| Crash recovery (KV restore + emergency unwind) | `src/core/intent-persistence.ts` · `src/index.ts` |
| Yield Triangle API (HL-first) | `GET /api/yield/triangle` |
| Multi-chain ingress **read-path** (SOL / ARB) | `src/adapters/solana/*` · `src/adapters/arbitrum/*` |
| Soil resistance + root protection + R20 | `src/services/risk-control.ts` |
| Black-swan halt (&lt;10ms evaluate path) | `src/core/black-swan-guard.ts` · stress suite |
| Zero-key grant sandbox | `src/services/sandbox.ts` |
| Fee engine (15% perf · 0.1% convenience) | `src/core/fee-calculator.ts` |

**Regression bar:** **575 tests** · `tsc --noEmit` clean · CI grant-audit workflow.

---

## 4. Milestone ↔ Code Path

| Milestone | Deliverable | Code Path | Verify |
|-----------|-------------|-----------|--------|
| **M1a** | Session Key envelope | `src/adapters/hl/session-key-executor.ts` | `pnpm grant:verify` |
| **M1b** | 2PC intent ledger | `src/core/intent-ledger.ts` | `tests/core/intent-ledger.test.ts` |
| **M1c** | HL ↔ 2PC + TTL flatten | `src/adapters/hl/hl-intent-bridge.ts` | `tests/integration/hl-2pc-execution.test.ts` |
| **M1d** | Crash recovery boot | `src/core/intent-persistence.ts` | `tests/core/intent-persistence.test.ts` |
| **M1e** | Yield Triangle API | `src/services/yield-router.ts` | `tests/api/yield-triangle.test.ts` |
| **M1f** | Ingress read-path (SOL / ARB) | `src/adapters/solana/*` · `arbitrum/*` | integration tests |
| **M1g** | Fee engine | `src/core/fee-calculator.ts` | `tests/core/fee-calculator.test.ts` |
| **M1h** | Zero-key sandbox | `src/services/sandbox.ts` | `tests/e2e/grant-sandbox-dryrun.test.ts` |
| **M1i** | Hyperliquid Testnet audit script | `scripts/verify-hl-testnet.ts` | `pnpm grant:hl-testnet` |
| **M1j** | Black-swan circuit | `src/core/black-swan-guard.ts` | `tests/stress/black-swan-scenario.test.ts` |
| **M2** | Live capital bridge + DO ledger | Roadmap | — |
| **M2+** | LuBan cushion · DonDon on-chain | Appendix below | Spec + fee/telemetry align |

---

## 5. Auditor 30-Second Verify

```bash
pnpm install
pnpm exec tsc --noEmit
pnpm grant:verify
```

**Expected:** HL 2PC TTL flatten + HL → Polymarket → Jupiter zero-key dry-run **all green**.

```bash
pnpm test          # 575/575
pnpm grant:hl-testnet   # Hyperliquid Testnet 2PC audit JSON (dry-run default)
```

Live Hyperliquid Testnet (optional):

```bash
HL_TESTNET_PRIVATE_KEY=0x... HL_LIVE=1 pnpm grant:hl-testnet
```

Risk envelope detail: [Risk_Envelope_Pgate.md](../architecture/Risk_Envelope_Pgate.md)

---

## 6. Conservative Net APY Band (Disclosure)

We do **not** pitch a single headline APY. API returns:

```json
"netApyBand": { "min": 6.2, "base": 11.5, "max": 22.4 }
```

| Component | Typical range (annualized) |
|-----------|----------------------------|
| Solana / Arbitrum stable base | 3.5–5.1% |
| HL funding (1× short hedge) | 2–10% (regime-dependent) |
| Gross stacked | ~6–15% |
| After 15% performance fee | **~5.1–12.75% net** |

- **`min` (6.2%)** — conservative floor  
- **`base` (11.5%)** — planning scenario  
- **`max` (22.4%)** — stress ceiling — **not** a sustained marketing claim  

`netApy = (chainBaseApy + hlFundingApy) × 0.85` — `src/core/fee-calculator.ts`.

---

## 7. Demo Checklist (5 min)

1. `pnpm grant:verify` — terminal green  
2. `curl -s "https://bedeltawater.slivervine.xyz/api/yield/triangle?symbol=ETH&ingressChain=SOLANA"` — `targetVenue`, `netApyBand`, `gateStatus`  
3. `pnpm grant:hl-testnet` — Hyperliquid Testnet PREPARE → COMMIT audit JSON  
4. `curl -s "https://bedeltawater.slivervine.xyz/api/telemetry/health"` — CRI · circuit breakers · soil status  
5. Open [Live HUD](https://bedeltawater.slivervine.xyz/) — BeΔ Edge status  

---

## Appendix A — Milestone 2+ Roadmap (Not Wave 1 Claims)

> LuBan Cushion and DonDon on-chain routing are Milestone 2+ specifications (fee & telemetry aligned); Wave 1 ships the core BeΔ Risk Envelope and 2PC Intent Ledger on Hyperliquid.

| Item | Wave 1 status | Milestone 2+ |
|------|---------------|--------------|
| **Liquidation cushion (LuBan Metric)** | Spec + telemetry posture fields | Micro-Unwind + buffer injection from staking pool |
| **0.1% social-impact fee route** | `DONDON_CHARITY_BPS = 10` in fee engine | On-chain multisig transfer + PoR logs |
| Live capital bridge | Out of scope | SOL/ARB → HL funded path |
| Durable Object ledger | KV persistence MVP | DO / D1 hardening |

Architecture references (internal SSOT — not Wave 1 deliverables):

- [LUBAN_EXOSKELETON_CUSHION.md](../architecture/LUBAN_EXOSKELETON_CUSHION.md)  
- [DONDON_CHARITY_ENGINE.md](../architecture/DONDON_CHARITY_ENGINE.md)  

---

## License

BUSL-1.1 with **Additional Use Grant** for Hyperliquid Foundation grant evaluators — see [LICENSE](../../LICENSE).

**Quick submit card:** [SUBMISSION.md](./SUBMISSION.md)  
**Brand / contact:** [silvervinelabs.com](https://silvervinelabs.com) · [GitHub repo](https://github.com/SilverVineLabs/bedelta-living-water)
