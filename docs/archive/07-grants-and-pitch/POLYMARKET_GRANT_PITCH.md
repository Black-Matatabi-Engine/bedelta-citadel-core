# SilverVine Protocol — Polymarket Grants Committee Pitch

**Applicant:** SilverVine Labs  
**Protocol:** Santenboku v0.8  
**Deployment target:** Cloudflare Workers edge + Polymarket CLOB REST API  
**Submission date:** July 2026  
**Reference:** [GRANT_SUBMISSION.md](../GRANT_SUBMISSION.md)

---

## 1. Executive Summary — Tail-Hedge Architecture for Macro Volatility Protection

SilverVine Protocol deploys Polymarket as the **tail-risk insurance leg** in a three-venue cross-chain stack (Hyperliquid · Polymarket · Jupiter). When macro volatility spikes, perp desks can acquire cheap binary YES contracts as black-swan hedges — gated by a deterministic **tail-hedge trigger** (`marketPrice ≤ $0.08`) and welded to the same Pgate iron rules that govern Hyperliquid session-key signing.

### Problem Statement

Institutional perp desks lack a systematic, price-bounded mechanism to acquire macro tail insurance without overpaying during calm markets:

| Failure Mode | Institutional Impact |
|---|---|
| Overpaying for tail contracts | YES price > 8¢ erodes hedge ROI and breaches mandate |
| Ungated hedge submission | Orders fire during R20 hardlock or soil-resistance trip |
| Orderbook blind spots | Bid/ask spread and depth ignored before CLOB POST |
| Cross-venue policy fragmentation | Polymarket logic isolated from HL/Jupiter risk engine |

SilverVine solves this with a **Tail-Hedge Architecture** — cheap-insurance trigger, CLOB microstructure parsing, and unified policy evaluation — all verifiable without private keys.

### Tail-Hedge Value Proposition

| # | Capability | Polymarket-Specific Value |
|---|---|---|
| 1 | **Tail Trigger Gate** | `evaluateTailHedgeTrigger()` — fires only when YES ≤ $0.08 (8% implied prob) |
| 2 | **CLOB Microstructure** | `fetchMarketSnapshot()` — best bid/ask, implied probability, bid/ask depth USD |
| 3 | **R20 + Root Protection Weld** | `assertHedgeRiskGates()` blocks payload when signing channel severed or Max SL exceeded |
| 4 | **Unified Risk Engine** | `evaluateGlobalRiskPolicy({ venue: "POLYMARKET", tailHedge })` — single policy surface |
| 5 | **Zero-Key Sandbox** | Full Polymarket dry-run via `simulateTransactionIntent()` — no wallet, no CLOB API key |

---

## 2. Polymarket Edge Worker API Adapter & Order Book Microstructure

The Polymarket adapter (`src/adapters/polymarket/index.ts`) runs on Cloudflare Workers with native `fetch` — no Node-only dependencies. Public CLOB market data requires no authentication; order submission supports dry-run mode for auditor verification.

### Architecture Flow

```text
┌──────────────────────────────────────────────────────────────────────┐
│  Cloudflare Worker Edge (src/index.ts)                               │
│  POST /api/hedge/evaluate  ·  handleHedgeEvaluateRequest()          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │  evaluateGlobalRiskPolicy()        │
              │  evaluatePolymarketGate()          │
              │  evaluateTailHedgeTrigger()          │
              └─────────────────┬─────────────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │  Polymarket CLOB Adapter             │
              │  fetchOrderbook() → /book?token_id=  │
              │  parseOrderbookSnapshot()            │
              │  createHedgeOrderPayload()           │
              │  submitHedgeOrder() [dryRun option]  │
              └─────────────────┬─────────────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │  Polymarket CLOB REST                │
              │  https://clob.polymarket.com         │
              └──────────────────────────────────────┘
```

### Order Book Microstructure

| Field | Source | Usage |
|---|---|---|
| `bestBid` / `bestAsk` | `orderbook.bids[0]` / `orderbook.asks[0]` | Spread and entry price discovery |
| `impliedProbability` | `bestAsk ?? midPrice` | Tail-hedge trigger input |
| `spread` | `bestAsk - bestBid` | Liquidity quality signal |
| `bidDepthUsd` / `askDepthUsd` | Σ(price × size) per side | Depth sufficiency probe |
| `tick_size` / `min_order_size` | CLOB wire fields | Order sizing compliance |

**Snapshot parser:** `parseOrderbookSnapshot(tokenId, orderbook)` → `MarketSnapshot`  
**Public fetch:** `fetchMarketSnapshot(tokenId)` → GET `/book?token_id={tokenId}`

### CLOB Order Payload

| Field | Function | Notes |
|---|---|---|
| `price` | `formatProbability()` | Max 6 decimal places, range [0, 1] |
| `size` | `usdToOutcomeSize(amountUsd, price)` | USD notional → outcome tokens |
| `orderType` | `GTC` · `FOK` · `GTD` | Default: `GTC` |
| `signature` | `signHedgeOrderPayload()` | EIP-191 placeholder for dry-run hand-off |

**Submission endpoint:** POST `{POLYMARKET_CLOB_URL}/order`  
**Dry-run mode:** `submitHedgeOrder(..., { dryRun: true })` — returns payload, skips POST

---

## 3. Unified Risk Engine Integration

Polymarket tail-hedge evaluation is a first-class venue in the unified cross-chain risk engine (`src/core/risk-engine.ts`).

### Tail-Hedge Trigger

```text
evaluateTailHedgeTrigger(marketPrice, thresholdProb)
  → true when marketPrice ≤ thresholdProb (default: 0.08)
```

| Parameter | Default | Pgate Reference |
|---|---|---|
| `marketPrice` | CLOB best ask / implied probability | Live orderbook input |
| `thresholdProb` | `DEFAULT_TAIL_HEDGE_THRESHOLD = 0.08` | Pgate Phase 2 — cheap tail insurance |

### Policy Gate Sequence (Polymarket Venue)

```text
evaluateGlobalRiskPolicy({ venue: "POLYMARKET", tailHedge, soil, ... })

  1. isR20Locked(state)           → 403 R20_LOCK
  2. evaluateRootProtection()     → 403/422 ROOT_PROTECTION
  3. evaluateSoilGate(soil)       → 422 SOIL_RESISTANCE
  4. evaluatePolymarketGate()     → 422 POLYMARKET_TAIL_HEDGE (if price > threshold)
  5. { isAllowed: true }
```

**Sandbox mirror:** `simulateTransactionIntent()` traverses the same gates and emits `POLYMARKET_DRY_RUN` on pass.

### Worker API Surface

| Endpoint | Handler | Purpose |
|---|---|---|
| `GET /api/state` | `handleStateRequest()` | SystemState snapshot — CRI, hardlock, `isHedgeActive` |
| `POST /api/hedge/evaluate` | `handleHedgeEvaluateRequest()` | Tail trigger + soil + R20 evaluation for auditors |

### Error Semantics

| Error Class | Code | HTTP | Trigger |
|---|---|---|---|
| `HedgeExecutionBlockedError` | `HEDGE_EXECUTION_BLOCKED` | 403 | R20 hardlock or root protection trip |
| `PolymarketApiError` | `HTTP_ERROR` / `INVALID_RESPONSE` | varies | CLOB fetch/submit failure |
| Policy deny | — | 422 | Tail trigger not met (`marketPrice > threshold`) |

---

## 4. Proposed Grant Milestones

### Milestone 1 — Core Adapter *(Delivered — audit-ready)*

| Deliverable | Status | Evidence |
|---|---|---|
| CLOB orderbook fetch + snapshot parsing | Complete | `fetchOrderbook()`, `parseOrderbookSnapshot()` |
| Tail-hedge trigger evaluation | Complete | `evaluateTailHedgeTrigger()`, `DEFAULT_TAIL_HEDGE_THRESHOLD` |
| Hedge order payload builder | Complete | `createHedgeOrderPayload()`, `signHedgeOrderPayload()` |
| R20 + root protection gates | Complete | `assertHedgeRiskGates()`, `HedgeExecutionBlockedError` |
| Unified risk engine Polymarket gate | Complete | `evaluatePolymarketGate()` in `src/core/risk-engine.ts` |
| Worker hedge evaluate API | Complete | `POST /api/hedge/evaluate` |
| Zero-key sandbox dry-run | Complete | `simulateTransactionIntent({ venue: "POLYMARKET" })` |

**Acceptance criteria:** `pnpm exec vitest run tests/adapters/polymarket/index.test.ts` — 16/16 passing · tail trigger verified · R20 block confirmed · dry-run path validated.

**Requested allocation:** Partial grant release upon Polymarket committee review of delivered core.

---

### Milestone 2 — Real-Time Event Arbitrage *(Proposed)*

| Deliverable | Target | Description |
|---|---|---|
| Live event feed integration | Q3 2026 | WebSocket / polling bridge for macro event markets (Fed, CPI, election) |
| Real-time tail trigger HUD | Q3 2026 | Dashboard lamp: implied prob vs. $0.08 threshold with countdown |
| Cross-venue auto-hedge pipeline | Q4 2026 | HL perp drawdown → auto-evaluate Polymarket tail contract eligibility |
| Orderbook depth circuit breaker | Q4 2026 | Block hedge when `askDepthUsd < MIN_DEPTH_USD` on target market |
| External Polymarket security audit | Q4 2026 | Scope: CLOB payload integrity, R20 severance, no key exposure at Edge |

**Acceptance criteria:** Live event demo with reproducible CLI · external audit zero critical · tail trigger evaluation P99 < 10 ms at Edge.

**Requested allocation:** Remaining tranche upon Milestone 2 acceptance + Polymarket ecosystem integration listing.

---

## 5. Zero-Key Verification — Polymarket Auditor Commands

Grant evaluators can reproduce the full Polymarket validation path without wallets, CLOB API keys, or funded accounts.

### Prerequisites

```bash
pnpm install
```

### Step 1 — Typecheck

```bash
pnpm exec tsc --noEmit
```

### Step 2 — Polymarket Adapter Unit Tests

```bash
pnpm exec vitest run tests/adapters/polymarket/index.test.ts
```

Expected: **16 passed** — tail trigger, orderbook parsing, payload builder, R20 block, dry-run, CLOB POST mock.

### Step 3 — Tail-Hedge Trigger Verification

```bash
pnpm exec vitest run tests/adapters/polymarket/index.test.ts -t "evaluateTailHedgeTrigger"
pnpm exec vitest run tests/adapters/polymarket/index.test.ts -t "implied probability"
```

### Step 4 — Unified Risk Engine Polymarket Gate

```bash
pnpm exec vitest run tests/core/risk-engine.test.ts -t "Polymarket"
pnpm exec vitest run tests/api/index.test.ts -t "hedge/evaluate"
```

### Step 5 — Grant E2E Dry-Run (Polymarket Step 2 of 3)

```bash
pnpm exec vitest run tests/e2e/grant-sandbox-dryrun.test.ts
```

**Expected Polymarket audit log shape:**

```json
{
  "event": "GRANT_SANDBOX_DRY_RUN",
  "step": 2,
  "venue": "POLYMARKET",
  "zeroKeyDryRun": true,
  "isAllowed": true,
  "passedGates": [
    "R20_LOCK",
    "ROOT_PROTECTION",
    "SOIL_RESISTANCE",
    "POLYMARKET_TAIL_HEDGE",
    "POLYMARKET_DRY_RUN"
  ],
  "executionPath": [
    "sandbox:start",
    "venue:POLYMARKET",
    "mode:zero-key-dry-run",
    "gate:R20_LOCK:pass",
    "gate:ROOT_PROTECTION:pass",
    "gate:SOIL_RESISTANCE:pass",
    "gate:POLYMARKET_TAIL_HEDGE:pass",
    "gate:POLYMARKET_DRY_RUN:pass",
    "sandbox:complete"
  ],
  "apiKeysRequired": false
}
```

### Step 6 — Interactive Zero-Key Polymarket Dry-Run (Node)

```bash
node --input-type=module -e "
import { simulateTransactionIntent } from './src/services/sandbox.ts';
import { buildSystemState } from './src/core/state.ts';

const report = simulateTransactionIntent(
  {
    venue: 'POLYMARKET',
    amountUsd: 25,
    soil: { symbol: 'BTC', hlSpot: 50000, hlPerp: 50010, dydxPerp: 50005, depthUsd: 500000 },
    tailHedge: { marketPrice: 0.06 },
  },
  buildSystemState({ currentCri: 100, skipHardlockAssert: true }),
);

console.log(JSON.stringify(report, null, 2));
"
```

### Step 7 — Tail Trigger Block Demonstration

```bash
node --input-type=module -e "
import { simulateTransactionIntent } from './src/services/sandbox.ts';
import { buildSystemState } from './src/core/state.ts';

const report = simulateTransactionIntent(
  {
    venue: 'POLYMARKET',
    amountUsd: 25,
    soil: { symbol: 'BTC', hlSpot: 50000, hlPerp: 50010, dydxPerp: 50005, depthUsd: 500000 },
    tailHedge: { marketPrice: 0.15 },
  },
  buildSystemState({ currentCri: 100, skipHardlockAssert: true }),
);

console.log(report.failedGate, report.suggestedHttpCode);
"
```

Expected output: `POLYMARKET_TAIL_HEDGE 422`

### Step 8 — Full Grant CI Suite

```bash
pnpm exec vitest run tests/services/sandbox.test.ts
pnpm exec vitest run
```

---

## Appendix — Repository Map (Polymarket Scope)

| Path | Role |
|---|---|
| `src/adapters/polymarket/index.ts` | CLOB fetch, tail trigger, hedge payload, order submit |
| `src/core/risk-engine.ts` | `evaluatePolymarketGate()` — unified tail-hedge policy |
| `src/api/index.ts` | `POST /api/hedge/evaluate` — Worker hedge evaluation API |
| `src/services/sandbox.ts` | Zero-key `simulateTransactionIntent()` — `POLYMARKET_DRY_RUN` |
| `tests/adapters/polymarket/index.test.ts` | Polymarket adapter test suite (16 cases) |
| `tests/e2e/grant-sandbox-dryrun.test.ts` | Cross-venue grant E2E proof |

---

**Contact:** SilverVine Labs — [github.com/SilverVineLabs/santenbokui-fulldex](https://github.com/SilverVineLabs/santenbokui-fulldex)  
**License:** BUSL-1.1 (Additional Use Grant for DEX Foundation evaluators)
