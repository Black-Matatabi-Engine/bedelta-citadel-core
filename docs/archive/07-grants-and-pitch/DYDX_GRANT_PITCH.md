# SilverVine Protocol — dYdX Foundation Grant Pitch

**Applicant:** SilverVine Labs  
**Protocol:** Santenboku v0.8  
**Deployment target:** Cloudflare Workers edge + dYdX v4 Indexer API  
**Submission date:** July 2026  
**Reference:** [GRANT_SUBMISSION.md](../GRANT_SUBMISSION.md)

---

## 1. Executive Summary — Cross-Venue Order Book Depth & Liquidity Arbitrage Gateway

SilverVine Protocol integrates **dYdX v4 perpetual mids** as the secondary liquidity reference leg in its cross-venue soil-resistance fuse. The dYdX depth feeder supplies live oracle prices from the v4 indexer, enabling Hyperliquid-primary desks to detect cross-venue basis drift, missing dual-venue depth, and slippage breaches **before** any perp order is signed — without requiring dYdX wallet keys for grant verification.

### Problem Statement

Hyperliquid-first institutional desks lack a deterministic secondary venue probe for liquidity quality:

| Failure Mode | Institutional Impact |
|---|---|
| Single-venue blind execution | HL perp fills with no cross-check against external perp mid |
| Missing secondary feed | `dydxPerp = 0` trips soil resistance — but only if feeder is wired |
| Cross-venue basis blowout | HL vs. dYdX perp divergence > 0.5% silently erodes arb edge |
| Unallowlisted RPC egress | Worker fetches to unknown indexers create supply-chain risk |

SilverVine addresses this with a **Cross-Venue Liquidity Arbitrage Gateway** — dYdX v4 indexer → `dydxPerp` map → `checkSoilResistance()` dual-venue fuse — welded into matrix assembly, trade pipeline, and zero-key sandbox dry-run.

### Cross-Venue Gateway USPs

| # | USP | dYdX-Specific Value |
|---|---|---|
| 1 | **v4 Indexer Depth Feeder** | `fetchDydxPerpMids()` — single snapshot, all ACTIVE perpetual markets |
| 2 | **Soil Resistance Dual-Venue Probe** | `dydxPerp` input to `checkSoilResistance()` — cross-venue slippage fuse |
| 3 | **RPC Allowlist Defense** | `indexer.dydx.trade` on outbound allowlist — no arbitrary indexer calls |
| 4 | **Matrix Pipeline Integration** | `fetchExchangeBundle()` parallel-fetches HL + dYdX mids for Rule A/B assembly |
| 5 | **Zero-Key Verification** | Full gate path testable via mocked mids — no Cosmos wallet, no API key |

---

## 2. dYdX v4 Chain Integration & Depth Feeder

The dYdX adapter (`src/services/exchanges/dydx-adapter.ts`) implements a lightweight, Workers-safe indexer client. Native Cosmos/IBC execution is scoped to Milestone 2; Milestone 1 delivers the **read-only depth feeder** that powers Pgate soil resistance across the stack.

### Architecture Flow

```text
┌──────────────────────────────────────────────────────────────────────┐
│  Cloudflare Worker Edge                                              │
│  fetchExchangeBundle() — src/services/exchanges/fetch-exchange-maps  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ Promise.all (parallel)
              ┌─────────────────┴─────────────────┐
              │                                   │
┌─────────────▼──────────────┐    ┌───────────────▼──────────────────┐
│  Hyperliquid Adapter        │    │  dYdX v4 Depth Feeder            │
│  hlSpot · hlPerp · hlFunding│    │  fetchDydxPerpMids()             │
└─────────────┬──────────────┘    └───────────────┬──────────────────┘
              │                                   │
              └─────────────────┬─────────────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │  ExchangePriceMaps                 │
              │  { hlSpot, hlPerp, dydxPerp, ... } │
              └─────────────────┬─────────────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │  checkSoilResistance()             │
              │  crossVenueSlippage =              │
              │    |dydxPerp - hlPerp| / hlPerp    │
              └────────────────────────────────────┘
```

### dYdX v4 Indexer Endpoint

| Endpoint | Function | Method |
|---|---|---|
| `/v4/perpetualMarkets` | `fetchDydxPerpMids()` | GET — all ACTIVE perpetual oracle prices |

**Base URL:** `https://indexer.dydx.trade/v4/perpetualMarkets`  
**Allowlist host:** `indexer.dydx.trade` (`src/services/defense/rpc-whitelist.ts`)  
**Timeout:** 8 s (`AbortSignal.timeout`)  
**Fetch wrapper:** `fetchAllowlisted()` — rejects non-allowlisted hosts

### Depth Feeder Pipeline

| Step | Function | Output |
|---|---|---|
| 1. Fetch | `fetchDydxPerpMids()` | Raw indexer JSON |
| 2. Filter | `parseDydxPerpMidsFromMarkets()` | Skip non-`ACTIVE` markets |
| 3. Normalize | `parseDydxTicker("BTC-USD")` → `"BTC"` | Matrix symbol key |
| 4. Price | `oraclePrice` → float mid | `dydxPerp[symbol]` |
| 5. Merge | `fetchExchangeBundle()` | `ExchangePriceMaps.dydxPerp` |

### Order Book Mid Utility

`computeOrderbookMid(bids, asks)` supports future depth-level integration (Milestone 2):

```text
mid = (bestBid + bestAsk) / 2   // dual-sided
mid = bestBid | bestAsk          // single-sided fallback
```

Currently Milestone 1 uses **oracle price** from perpetual market snapshots as the cross-venue reference mid.

---

## 3. Secondary Liquidity Shield & Slippage Protection Gate

dYdX perpetual mids feed directly into SilverVine's **Pgate soil resistance** fuse — the secondary liquidity shield that blocks Hyperliquid execution when dual-venue conditions fail.

### Cross-Venue Slippage Formula

```text
crossVenueSlippage = |dydxPerp - hlPerp| / hlPerp     (when both > 0)
```

| Condition | Trip Reason | HTTP Semantics |
|---|---|---|
| `hlPerp ≤ 0` or `dydxPerp ≤ 0` | `INSUFFICIENT_DEPTH_DUAL_VENUE` | 422 — dual-venue feed required |
| `crossVenueSlippage > 0.5%` | `CROSS_VENUE_SLIPPAGE={pct}%>0.5%` | 422 — basis blowout |
| `depthUsd < $100,000` | `DEPTH_USD={n}<100000` | 422 — insufficient book depth |
| HKT 21:00–23:00 | `TSUNAMI_SHIELD_LOCKED_HKT_21_23` | 422 — macro volatility window |

**Gate function:** `checkSoilResistance({ symbol, hlSpot, hlPerp, dydxPerp, depthUsd })`  
**Constants:** `MAX_SLIPPAGE = 0.005` (0.5%) · `MIN_DEPTH_USD = 100_000`

### Integration Surfaces

| Surface | dYdX Input | Behavior |
|---|---|---|
| Matrix assembly | `maps.dydxPerp[symbol]` | `assembleMatrix()` stamps `risk_tripped` on soil fail |
| Trade pipeline | `input.dydxPerp` | Step 3 ATTACK lock when dual-venue missing |
| HL execution pre-trade | `SoilResistanceInput.dydxPerp` | Blocks signed L1 POST |
| Jupiter adapter | Synthetic `dydxPerp` from slippage ratio | Links swap cost to cross-venue probe |
| Zero-key sandbox | `intent.soil.dydxPerp` | Dry-run gate diagnostics without live fetch |

### Fail-Safe: Empty dYdX Feed

When `fetchDydxPerpMids()` fails at Edge, the bundle returns an empty map and logs:

```text
[dYdX] WARN: dydxPerp map empty — soil resistance may trip
```

This **fail-closed** behavior prevents Hyperliquid execution without a verified secondary venue reference — the Secondary Liquidity Shield defaults to locked.

---

## 4. Proposed Grant Milestones

### Milestone 1 — Order Book Feeder *(Delivered — audit-ready)*

| Deliverable | Status | Evidence |
|---|---|---|
| dYdX v4 indexer client | Complete | `fetchDydxPerpMids()`, `fetchAllowlisted()` |
| Ticker normalization (`BTC-USD` → `BTC`) | Complete | `parseDydxTicker()` |
| ACTIVE market filter + oracle mid parse | Complete | `parseDydxPerpMidsFromMarkets()` |
| Orderbook mid computation utility | Complete | `computeOrderbookMid()` |
| Parallel HL + dYdX bundle fetch | Complete | `fetchExchangeBundle()` |
| Soil resistance dual-venue integration | Complete | `checkSoilResistance()` — 20+ Vitest cases |
| Matrix assembly cross-venue rules | Complete | `assembleMatrix()` — missing feed + slippage trip tests |
| RPC allowlist (`indexer.dydx.trade`) | Complete | `src/services/defense/rpc-whitelist.ts` |

**Acceptance criteria:** `pnpm exec vitest run tests/dydx-adapter.test.ts tests/assemble-matrix-rules.test.ts tests/risk-control.test.ts` — all passing · empty dYdX feed trips soil · cross-venue slippage > 0.5% blocked.

**Requested allocation:** Partial grant release upon dYdX Foundation review of delivered feeder.

---

### Milestone 2 — Cosmos IBC Native Execution *(Proposed)*

| Deliverable | Target | Description |
|---|---|---|
| dYdX v4 order placement module | Q3 2026 | Cosmos SDK message signing for native perp orders on dYdX chain |
| IBC bridge state sync | Q3 2026 | Cross-chain CRI / R20 flag propagation HL ↔ dYdX via Worker KV |
| Live orderbook depth fetch | Q4 2026 | Indexer L2 book → `computeOrderbookMid()` replaces oracle-only mid |
| Cross-venue arb execution pipeline | Q4 2026 | Detected basis → simultaneous HL + dYdX leg with unified Pgate |
| External Cosmos security audit | Q4 2026 | Scope: key management, IBC message validation, slippage gate integrity |

**Acceptance criteria:** Testnet dual-leg demo with reproducible CLI · external audit zero critical · cross-venue slippage evaluation P99 < 10 ms at Edge.

**Requested allocation:** Remaining tranche upon Milestone 2 acceptance + dYdX ecosystem integration listing.

---

## 5. Zero-Key Verification — dYdX Auditor Commands

Grant evaluators can reproduce the full dYdX depth-feeder and soil-resistance path without Cosmos wallets, validator keys, or dYdX API credentials.

### Prerequisites

```bash
pnpm install
```

### Step 1 — Typecheck

```bash
pnpm exec tsc --noEmit
```

### Step 2 — dYdX Adapter Unit Tests

```bash
pnpm exec vitest run tests/dydx-adapter.test.ts
```

Expected: **3 passed** — ticker normalization, orderbook mid, ACTIVE market parsing.

### Step 3 — Soil Resistance Dual-Venue Gate

```bash
pnpm exec vitest run tests/risk-control.test.ts -t "soil resistance"
pnpm exec vitest run tests/risk-control.test.ts -t "dual-venue"
pnpm exec vitest run tests/risk-control.test.ts -t "cross-venue"
```

### Step 4 — Matrix Assembly Cross-Venue Rules

```bash
pnpm exec vitest run tests/assemble-matrix-rules.test.ts -t "dYdX"
pnpm exec vitest run tests/assemble-matrix-rules.test.ts -t "cross-venue slippage"
```

### Step 5 — Trade Pipeline dYdX Feed Lock

```bash
pnpm exec vitest run tests/v2/trade-pipeline.test.ts -t "dYdX"
pnpm exec vitest run tests/v2/trade-pipeline.test.ts -t "checkSoilResistance"
```

### Step 6 — Interactive Zero-Key Soil Probe (Node)

```bash
node --input-type=module -e "
import { checkSoilResistance } from './src/services/risk-control.ts';

const healthy = checkSoilResistance({
  symbol: 'BTC',
  hlSpot: 50000,
  hlPerp: 50010,
  dydxPerp: 50005,
  depthUsd: 500000,
});

const missingFeed = checkSoilResistance({
  symbol: 'BTC',
  hlSpot: 50000,
  hlPerp: 50010,
  dydxPerp: 0,
});

const basisBlowout = checkSoilResistance({
  symbol: 'ETH',
  hlSpot: 3000,
  hlPerp: 3000,
  dydxPerp: 3016,
});

console.log(JSON.stringify({ healthy, missingFeed, basisBlowout }, null, 2));
"
```

Expected: `healthy.tripped = false` · `missingFeed.reasons` contains `INSUFFICIENT_DEPTH_DUAL_VENUE` · `basisBlowout.reasons` contains `CROSS_VENUE_SLIPPAGE`.

### Step 7 — Grant E2E Dry-Run (Cross-Venue Soil in HL Path)

```bash
pnpm exec vitest run tests/e2e/grant-sandbox-dryrun.test.ts
pnpm exec vitest run tests/services/sandbox.test.ts
```

**Expected soil gate in HL dry-run audit log:**

```json
{
  "passedGates": ["R20_LOCK", "ROOT_PROTECTION", "SOIL_RESISTANCE", "HL_DRY_RUN"],
  "executionPath": [
    "gate:SOIL_RESISTANCE:pass"
  ]
}
```

Soil resistance pass requires valid `dydxPerp` in the intent's soil input — confirming dual-venue probe is active.

### Step 8 — Full Grant CI Suite

```bash
pnpm exec vitest run
pnpm run audit:log
```

---

## Appendix — Repository Map (dYdX Scope)

| Path | Role |
|---|---|
| `src/services/exchanges/dydx-adapter.ts` | v4 indexer fetch, ticker parse, orderbook mid |
| `src/services/exchanges/fetch-exchange-maps.ts` | Parallel HL + dYdX bundle assembly |
| `src/services/defense/rpc-whitelist.ts` | Outbound allowlist — `indexer.dydx.trade` |
| `src/services/risk-control.ts` | `checkSoilResistance()` — dual-venue slippage fuse |
| `src/services/assemble-matrix.ts` | Matrix row soil evaluation with `dydxPerp` |
| `src/types/matrix.ts` | `ExchangePriceMaps.dydxPerp` type definition |
| `tests/dydx-adapter.test.ts` | dYdX adapter test suite (3 cases) |
| `tests/assemble-matrix-rules.test.ts` | Cross-venue matrix rule tests |

---

**Contact:** SilverVine Labs — [github.com/SilverVineLabs/santenbokui-fulldex](https://github.com/SilverVineLabs/santenbokui-fulldex)  
**License:** BUSL-1.1 (Additional Use Grant for DEX Foundation evaluators)
