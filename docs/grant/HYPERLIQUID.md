# BeDelta Living Water — Hyperliquid Foundation Grant Pack

**Project:** `bedelta-living-water`  
**Focus:** Hyperliquid-native yield ingress · Session-key risk envelope · 2PC intent ledger  
**Author:** SilverVine Labs / :qum[x0sumx]

---

## 1. Project Overview

BeDelta Living Water routes idle stable yield from **Solana / Arbitrum read-paths** into **Hyperliquid** as the sole hedge anchor (`targetVenue: "HYPERLIQUID"`). Execution is gated by:

- **Session Key TRADE_ONLY** + Dynamic Max SL (`Account Balance × 1% + $100`)
- **2PC Intent Ledger** — dual-leg prepare → commit | abort with reduce-only flatten on partial failure / TTL
- **Soil resistance** — cross-venue slippage + depth circuit breaker before any prepare

Wave 1 is **read-path + testnet execution proof** — not a live cross-chain bridge. Milestone 2 covers capital bridge + Durable Object ledger hardening.

---

## 2. Milestone ↔ Code Path (1-Page)

| Milestone | Deliverable | Code Path | Verify |
|-----------|-------------|-----------|--------|
| **M1a** | Session Key envelope | `src/adapters/hl/session-key-executor.ts` | `pnpm grant:verify` |
| **M1b** | 2PC intent ledger | `src/core/intent-ledger.ts` | `tests/core/intent-ledger.test.ts` |
| **M1c** | HL ↔ 2PC bridge + TTL flatten | `src/adapters/hl/hl-intent-bridge.ts` | `tests/integration/hl-2pc-execution.test.ts` |
| **M1d** | Crash recovery boot | `src/core/intent-persistence.ts` · `src/index.ts` | `tests/core/intent-persistence.test.ts` |
| **M1e** | Yield Triangle API | `GET /api/yield/triangle` · `src/services/yield-router.ts` | `tests/api/yield-triangle.test.ts` |
| **M1f** | Multi-chain ingress (read-path) | `src/adapters/solana/solana-yield-ingress.ts` · `src/adapters/arbitrum/arbitrum-yield-ingress.ts` | integration tests |
| **M1g** | Commercial fee engine | `src/core/fee-calculator.ts` | `tests/core/fee-calculator.test.ts` |
| **M1h** | Grant sandbox (zero-key) | `src/services/sandbox.ts` | `tests/e2e/grant-sandbox-dryrun.test.ts` |
| **M1i** | HL testnet live script | `scripts/verify-hl-testnet.ts` | `pnpm grant:hl-testnet` |
| **M2** | Live capital bridge + DO ledger | Roadmap appendix | — |

---

## 3. Auditor 30-Second Verify

```bash
pnpm install
pnpm exec tsc --noEmit
pnpm grant:verify
```

**Expected:** HL 2PC TTL flatten integration + HL → Polymarket → Jupiter zero-key dry-run **all green**.

Full regression (569+ tests):

```bash
pnpm test
```

Optional HL testnet audit log (dry-run by default; set `HL_TESTNET_PRIVATE_KEY` for live):

```bash
pnpm grant:hl-testnet
```

---

## 4. Conservative Net APY Methodology (6–12% Target Band)

We **do not** pitch a single headline APY. The API returns:

```json
"netApyBand": { "min": 6.2, "base": 11.5, "max": 22.4 }
```

| Component | Typical Range (annualized) |
|-----------|----------------------------|
| Solana / Arbitrum stable base | 3.5–5.1% |
| HL funding (1× short hedge) | 2–10% (regime-dependent) |
| **Gross stacked** | ~6–15% |
| Less 15% performance fee | **~5.1–12.75% net** |

- **`min` (6.2%)** — conservative floor after performance fee  
- **`base` (11.5%)** — central planning scenario; live API clamps measured net into band  
- **`max` (22.4%)** — stress ceiling (extreme funding); not a sustained marketing claim  

Formula: `netApy = (chainBaseApy + hlFundingApy) × 0.85` — see `src/core/fee-calculator.ts`.

---

## 5. Demo Checklist (5 min)

1. `pnpm grant:verify` — terminal green  
2. `curl "/api/yield/triangle?symbol=ETH&ingressChain=SOLANA"` — show `netApyBand`, `targetVenue`, `gateStatus`  
3. `pnpm grant:hl-testnet` — structured audit JSON  
4. Open HUD (`pnpm dev:spa`) — Yield Triangle + Live Intent Stream  

---

## 6. License

BUSL-1.1 with **Additional Use Grant** for Hyperliquid Foundation grant evaluators — see [LICENSE](../../LICENSE).
