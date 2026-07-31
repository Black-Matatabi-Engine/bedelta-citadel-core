# SilverVine Protocol — Jupiter / Solana Ecosystem Grant Pitch

**Applicant:** SilverVine Labs  
**Protocol:** Santenboku v0.8  
**Deployment target:** Cloudflare Workers edge + Jupiter v6 Swap API  
**Submission date:** July 2026  
**Reference:** [GRANT_SUBMISSION.md](../GRANT_SUBMISSION.md)

---

## 1. Executive Summary & Solana Cross-Chain Liquidity USPs

SilverVine Protocol extends institutional perp risk controls from Hyperliquid into Solana spot liquidity via the **Jupiter v6 quote/swap adapter**. The adapter runs at the Cloudflare Edge, reads cross-chain system state from **Worker KV**, and enforces Pgate slippage limits before any swap transaction is assembled — without requiring Solana private keys for grant verification.

### Problem Statement

Solana DeFi desks routing through Jupiter face distinct cross-chain failure modes when paired with CEX/perp hedges:

| Failure Mode | Institutional Impact |
|---|---|
| Quote slippage + price impact stacking | Combined route cost exceeds desk mandate silently |
| Edge/runtime state desync | Worker executes swap while HL hedge channel is hardlocked |
| Unbounded swap API abuse | Public quote endpoints hammered without rate governance |

SilverVine unifies Jupiter swap validation under the same **Pgate** iron rules applied to Hyperliquid and Polymarket — one policy surface, three venues.

### Solana Cross-Chain Liquidity USPs

| # | USP | Jupiter / Solana Value |
|---|---|---|
| 1 | **Jupiter v6 Edge Adapter** | Workers-safe `fetchJupiterQuote()` + `executeJupiterQuote()` — no Node-only dependencies |
| 2 | **KV State Bridge** | `SYSTEM_STATE_KV` binding propagates R20 hardlock from HL/perp stack to Solana swap gate |
| 3 | **Combined Slippage Gate** | `priceImpactBps + quoteSlippageBps ≤ 15 bps` before swap wire |
| 4 | **Soil Resistance Linkage** | Jupiter slippage mapped into `checkSoilResistance()` cross-venue probe |
| 5 | **Zero-Key Sandbox** | Full Jupiter dry-run via `simulateTransactionIntent({ venue: "JUPITER" })` — no wallet, no RPC key |

---

## 2. Jupiter Swap API & Cloudflare Workers Edge KV Adapter Architecture

SilverVine's Jupiter adapter (`src/adapters/jupiter/index.ts`) implements a three-layer execution bridge: quote fetch → Pgate validation → optional swap POST.

### Architecture Flow

```text
┌──────────────────────────────────────────────────────────────────────┐
│  Cloudflare Worker Edge (src/index.ts)                               │
│  executeJupiterQuoteWithEnv(quote, env)                            │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │  assertKvExecutionAllowed(env)       │
              │  KV: system:r20_locked               │
              │  KV: system:state (JSON snapshot)    │
              └─────────────────┬─────────────────┘
                                │ pass
              ┌─────────────────▼─────────────────┐
              │  executeJupiterQuote(quote)        │
              │    ├─ assertJupiterExecutionGates()  │
              │    ├─ evaluateJupiterSoilResistance()│
              │    └─ POST /v6/swap (if !dryRun)    │
              └─────────────────┬─────────────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │  Jupiter v6 Quote API              │
              │  https://quote-api.jup.ag/v6/quote │
              └────────────────────────────────────┘
```

### Worker KV Bindings

| KV Key | Constant | Purpose |
|---|---|---|
| `system:state` | `SYSTEM_STATE_KV_KEY` | JSON snapshot — balance, CRI, `dynamicMaxSL`, `hardlock`, `isHedgeActive` |
| `system:r20_locked` | `SYSTEM_STATE_R20_FLAG_KEY` | Edge R20 flag (`"true"` · `"R20_LOCKED"`) — blocks swap at HTTP 403 |

**Env binding:** `env.SYSTEM_STATE_KV` (`src/env.ts`)  
**Merge logic:** `mergeKvSystemState()` · `readKvSystemState()` · `assertKvExecutionAllowed()`

### Runtime Modes

| Mode | Trigger | Behavior |
|---|---|---|
| **Edge** | `env.SYSTEM_STATE_KV` bound | Reads KV snapshot + R20 flag before swap |
| **Local** | No KV binding | Falls back to `readActiveSystemState()` in-process |
| **Dry-run** | `options.dryRun = true` | Validates gates + soil; skips `/v6/swap` POST |

### Jupiter v6 API Surface

| Endpoint | Function | Method |
|---|---|---|
| `/v6/quote` | `fetchJupiterQuote()` | GET — slippageBps, inputMint, outputMint, amount |
| `/v6/swap` | `executeJupiterQuote()` | POST — `{ quoteResponse }` after Pgate pass |

Default slippage ceiling: `PGATE_MAX_SLIPPAGE_BPS = 15` (0.15%).

---

## 3. Pgate Combined Slippage Gate & Rate Limiting Defense

### Combined Slippage Formula

Jupiter route cost is evaluated as the sum of quote-level slippage and price impact:

```text
combinedSlippageBps = |priceImpactPct| × 100 + slippageBps
```

| Component | Source | Example |
|---|---|---|
| `priceImpactBps` | Jupiter quote `priceImpactPct` | `0.05` → 5 bps |
| `quoteSlippageBps` | Jupiter quote `slippageBps` | `10` bps |
| **Combined** | `combinedSlippageBps()` | **15 bps** (at Pgate ceiling) |

**Gate function:** `evaluateJupiterSoilResistance(quote, maxSlippageBps)`  
**Block condition:** `combinedSlippageBps > PGATE_MAX_SLIPPAGE_BPS` → `JUPITER_COMBINED_SLIPPAGE` reason

### Soil Resistance Cross-Venue Linkage

When combined slippage exceeds threshold, the adapter also maps slippage into a synthetic cross-venue probe:

```text
dydxPerp = basePx × (1 + combinedSlippageBps / 10_000)
→ checkSoilResistance({ symbol: "JUP_SWAP", ... })
```

This links Jupiter route degradation to the same soil-resistance fuse used by Hyperliquid and Polymarket adapters.

### Full Jupiter Gate Sequence

```text
R20_LOCK (KV flag + in-process)
  → ROOT_PROTECTION (Dynamic Max SL)
    → JUPITER_SLIPPAGE (combined bps)
      → SOIL_RESISTANCE (cross-venue probe)
        → JUPITER_DRY_RUN / swap POST
```

### Edge Rate Limiting Defense

Public Worker endpoints are protected by `src/api/middleware/edge-security.ts`:

| Control | Function | Response |
|---|---|---|
| Signature validation | `validateEdgeHeaders()` | HTTP 401 — malformed `X-Silvervine-Signature` / timestamp |
| Rate limiting | `checkEdgeRateLimit()` | HTTP 429 — KV-backed bucket (`edge:rl:{client}`) with in-memory fallback |
| Default window | 60 s · 10 requests | Configurable via `EdgeSecurityConfig` |

Rate limiting prevents swap-quote endpoint abuse and protects Jupiter API quota from edge-triggered bursts.

---

## 4. Milestones & Deliverables

### Delivered Core *(Milestone 1 — audit-ready)*

| Deliverable | Status | Evidence |
|---|---|---|
| Jupiter v6 quote fetch + parse | Complete | `fetchJupiterQuote()`, `parseJupiterQuote()` |
| Combined slippage + soil evaluation | Complete | `evaluateJupiterSoilResistance()`, 18 Vitest cases |
| Worker KV R20 bridge | Complete | `assertKvExecutionAllowed()`, `executeJupiterQuoteWithEnv()` |
| Unified risk engine Jupiter gate | Complete | `evaluateGlobalRiskPolicy()` — venue `"JUPITER"` |
| Zero-key sandbox dry-run | Complete | `simulateTransactionIntent()` → `JUPITER_DRY_RUN` gate |
| Edge security rate limiting | Complete | `src/api/middleware/edge-security.ts`, 4 Vitest cases |

**Acceptance criteria:** `pnpm exec vitest run tests/adapters/jupiter/index.test.ts` — 18/18 passing · KV R20 block verified · dry-run path confirmed.

**Requested allocation:** Partial grant release upon Jupiter committee review of delivered core.

---

### Mainnet Expansion *(Milestone 2 — proposed)*

| Deliverable | Target | Description |
|---|---|---|
| Solana mainnet swap demo (Testnet-first) | Q3 2026 | Live Jupiter quote → Pgate pass → signed swap via delegated signer |
| KV state sync from HL CRI engine | Q3 2026 | Real-time R20 flag propagation HL → Edge KV → Jupiter gate |
| Jupiter route telemetry dashboard | Q4 2026 | Public HUD: combined slippage bps, soil trip reasons, gate path |
| MEV / sandwich defense layer | Q4 2026 | Priority-fee ceiling + route freshness TTL on Edge |
| External Solana security audit | Q4 2026 | Scope: KV bridge, slippage gate, rate limiter, no key exposure |

**Acceptance criteria:** Mainnet demo with reproducible CLI · external audit zero critical · combined slippage gate P99 evaluation < 10 ms at Edge.

**Requested allocation:** Remaining tranche upon Milestone 2 acceptance + Jupiter ecosystem integration listing.

---

## 5. Zero-Key Verification — Jupiter Auditor Commands

Grant evaluators can reproduce the full Jupiter validation path without Solana wallets, RPC keys, or Jupiter API credentials.

### Prerequisites

```bash
pnpm install
```

### Step 1 — Typecheck

```bash
pnpm exec tsc --noEmit
```

### Step 2 — Jupiter Adapter Unit Tests

```bash
pnpm exec vitest run tests/adapters/jupiter/index.test.ts
```

Expected: **18 passed** — combined slippage, soil linkage, KV R20 block, dry-run, Edge runtime.

### Step 3 — Combined Slippage Gate Verification

```bash
pnpm exec vitest run tests/adapters/jupiter/index.test.ts -t "combinedSlippageBps"
pnpm exec vitest run tests/adapters/jupiter/index.test.ts -t "evaluateJupiterSoilResistance"
```

### Step 4 — Worker KV Edge Bridge Verification

```bash
pnpm exec vitest run tests/adapters/jupiter/index.test.ts -t "executeJupiterQuoteWithEnv"
pnpm exec vitest run tests/adapters/jupiter/index.test.ts -t "isKvR20LockedFlag"
```

### Step 5 — Grant E2E Dry-Run (Jupiter Step 3 of 3)

```bash
pnpm exec vitest run tests/e2e/grant-sandbox-dryrun.test.ts
```

**Expected Jupiter audit log shape:**

```json
{
  "event": "GRANT_SANDBOX_DRY_RUN",
  "step": 3,
  "venue": "JUPITER",
  "zeroKeyDryRun": true,
  "isAllowed": true,
  "passedGates": [
    "R20_LOCK",
    "ROOT_PROTECTION",
    "SOIL_RESISTANCE",
    "JUPITER_SLIPPAGE",
    "JUPITER_DRY_RUN"
  ],
  "executionPath": [
    "sandbox:start",
    "venue:JUPITER",
    "mode:zero-key-dry-run",
    "gate:R20_LOCK:pass",
    "gate:ROOT_PROTECTION:pass",
    "gate:SOIL_RESISTANCE:pass",
    "gate:JUPITER_SLIPPAGE:pass",
    "gate:JUPITER_DRY_RUN:pass",
    "sandbox:complete"
  ],
  "apiKeysRequired": false
}
```

### Step 6 — Interactive Zero-Key Jupiter Dry-Run (Node)

```bash
node --input-type=module -e "
import { simulateTransactionIntent } from './src/services/sandbox.ts';
import { buildSystemState } from './src/core/state.ts';

const report = simulateTransactionIntent(
  {
    venue: 'JUPITER',
    amountUsd: 50,
    soil: { symbol: 'BTC', hlSpot: 50000, hlPerp: 50010, dydxPerp: 50005, depthUsd: 500000 },
    jupiter: {
      quote: {
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        inAmount: '100000000',
        outAmount: '16198753',
        slippageBps: 10,
        priceImpactPct: '0.05',
      },
    },
  },
  buildSystemState({ currentCri: 100, skipHardlockAssert: true }),
);

console.log(JSON.stringify(report, null, 2));
"
```

### Step 7 — Edge Security & Full CI

```bash
pnpm exec vitest run tests/api/edge-security.test.ts
pnpm exec vitest run tests/security/security-audit.test.ts
pnpm exec vitest run
```

---

## Appendix — Repository Map (Jupiter Scope)

| Path | Role |
|---|---|
| `src/adapters/jupiter/index.ts` | Jupiter v6 quote/swap, combined slippage, KV bridge |
| `src/core/risk-engine.ts` | Unified `evaluateGlobalRiskPolicy()` — Jupiter venue gate |
| `src/services/sandbox.ts` | Zero-key `simulateTransactionIntent()` — `JUPITER_DRY_RUN` |
| `src/api/middleware/edge-security.ts` | Edge signature validation + KV rate limiting |
| `src/env.ts` | `SYSTEM_STATE_KV` binding definition |
| `tests/adapters/jupiter/index.test.ts` | Jupiter adapter test suite (18 cases) |
| `tests/e2e/grant-sandbox-dryrun.test.ts` | Cross-venue grant E2E proof |

---

**Contact:** SilverVine Labs — [github.com/SilverVineLabs/santenbokui-fulldex](https://github.com/SilverVineLabs/santenbokui-fulldex)  
**License:** BUSL-1.1 (Additional Use Grant for DEX Foundation evaluators)
