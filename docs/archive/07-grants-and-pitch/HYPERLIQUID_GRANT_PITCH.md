# SilverVine Protocol — Hyperliquid Foundation Grant Pitch

**Applicant:** SilverVine Labs  
**Protocol:** Santenboku v0.8  
**Deployment target:** Cloudflare Workers edge + Hyperliquid L1 Appchain  
**Submission date:** July 2026  
**Reference:** [GRANT_SUBMISSION.md](../GRANT_SUBMISSION.md)

---

## 1. Executive Summary & Unique Selling Proposition

SilverVine Protocol is an institutional-grade, cross-venue risk orchestration layer purpose-built for Hyperliquid-first execution. The stack runs at the edge on Cloudflare Workers, enforces a unified **Pgate** policy gate across Hyperliquid, Polymarket, and Jupiter, and never requires grant auditors to provision private keys or exchange API secrets for verification.

### Problem Statement

High-frequency and systematic traders on Hyperliquid face three compounding failure modes:

| Failure Mode | Institutional Impact |
|---|---|
| Uncapped per-trade loss | Single fat-finger or slippage event breaches desk mandate |
| Session-key over-permissioning | Compromised agent key can sign until manually revoked |
| Cross-venue basis drift | HL perp vs. external perp divergence triggers silent P&L decay |

SilverVine addresses each failure mode with deterministic, test-covered gates wired before any L1 signature is produced.

### Unique Selling Propositions

| # | USP | Hyperliquid-Specific Value |
|---|---|---|
| 1 | **Zero-Key Auditor Sandbox** | Full HL dry-run path via `simulateTransactionIntent()` — no mainnet keys, no funded wallet |
| 2 | **Session-Key Safety Net** | EIP-712 agent delegation (`SantenmokuSessionKey`) severed automatically on R20 hardlock or soil-resistance trip |
| 3 | **Dynamic Max SL Weld** | `(Equity × 1%) + $100` ceiling enforced at root protection before HL order wire is signed |
| 4 | **Edge-Native Latency Guard** | WS heartbeat + 200 ms Pgate latency fuse on HL feed (`PGATE_MAX_LATENCY_MS`) |
| 5 | **Grant-Ready CI** | `.github/workflows/grant-audit.yml` — typecheck, 319+ Vitest cases, Yellow Page audit log |

---

## 2. Session Key Architecture & Safety Net

SilverVine implements Hyperliquid's native **ApproveAgent** delegation pattern with a risk-gated signing channel. Master wallet authorizes a time-bounded session agent; all L1 exchange actions route through `signHyperliquidAction()` with pre-flight Pgate validation.

### Architecture Flow

```text
┌─────────────────┐     approveAgent      ┌──────────────────────┐
│  Master Wallet  │ ───────────────────►  │ SantenmokuSessionKey │
│  (cold / HW)    │     EIP-712 user      │  (hot agent, TTL)    │
└─────────────────┘                       └──────────┬───────────┘
                                                   │
                  ┌────────────────────────────────▼────────────────────────┐
                  │              Pgate Signing Channel Gate                  │
                  │  assertSigningChannelOpen()                              │
                  │    ├─ soilResistanceTripped  → 403 SIGNING_CHANNEL_LOCKED│
                  │    ├─ R20 / CRI hardlock       → 403 HARDLOCK             │
                  │    └─ signingChannelOpen=false → 403 CHANNEL_CLOSED        │
                  └────────────────────────────────┬────────────────────────┘
                                                   │ pass
                  ┌────────────────────────────────▼────────────────────────┐
                  │  signHyperliquidAction() → phantom Agent EIP-712 (L1)   │
                  │  POST https://api.hyperliquid.xyz/exchange               │
                  └─────────────────────────────────────────────────────────┘
```

### Safety Net Controls

| Control | Module | Behavior |
|---|---|---|
| **R20 Physical Deadlock** | `src/core/state.ts` | `CRI ≤ 0` or `hardlock=true` → signing channel severed; HTTP 403 |
| **Soil Resistance Fuse** | `src/services/risk-control.ts` | Cross-venue slippage > 0.5% or depth < $100k → blocks signing |
| **Session Key TTL** | `src/adapters/hl/auth.ts` | `verifySessionKeyValidity()` rejects expired agents before order wire |
| **Tsunami Shield** | `src/services/risk-control.ts` | HKT 21:00–23:00 US-open window → soil resistance locked |
| **Pre-Trade Pgate** | `src/adapters/hl/execution.ts` | Latency ≤ 200 ms, slippage ≤ 0.15% before signed POST |

### Key Implementation References

- Session agent creation: `createSessionKeyAgent()` — `src/adapters/hl/auth.ts`
- Signing gate assertion: `assertSigningChannelOpen()` — `src/adapters/hl/auth.ts`
- HL execution engine: `src/adapters/hl/execution.ts`
- Market data adapter: `src/services/exchanges/hyperliquid-adapter.ts`

---

## 3. Dynamic Max SL — `(Equity × 1%) + $100` on HL Appchain

Root Protection (Root 1) is the non-bypassable loss ceiling applied to every Hyperliquid intent before session-key signing.

### Formula

```text
Effective Max SL (USD) = (Account Equity × 0.01) + 100
```

| Account Equity | Effective Max SL | Daily Loss Cap (×3) |
|---:|---:|---:|
| $0 | $100 | $300 |
| $10,000 | $200 | $600 |
| $50,000 | $600 | $1,800 |
| $100,000 | $1,100 | $3,300 |

**Canonical implementation:** `computeEffectiveMaxSlUsd()` in `src/services/effective-max-sl.ts`  
**Runtime enforcement:** `rootProtection()` in `src/services/risk-control.ts`  
**SystemState field:** `dynamicMaxSL` recomputed on every balance patch via `recomputeDynamicMaxSL()`

### HL Appchain Integration Points

1. **Pre-sign gate** — `validatePreTrade()` in `src/adapters/hl/execution.ts` calls `checkSoilResistance()` then `rootProtection()` with live equity.
2. **Matrix assembly** — `src/services/assemble-matrix.ts` stamps Dynamic Max SL labels on every strategy row.
3. **Edge Worker API** — `GET /api/state` exposes `systemState.dynamicMaxSL` for auditor HUD verification.
4. **Sandbox dry-run** — `simulateTransactionIntent({ venue: "HL", ... })` traverses `ROOT_PROTECTION` gate without signing.

### Rejection Semantics

When `estimatedLossUsd > dynamicMaxSL`, the engine throws `RiskLimitExceeded` (HTTP 422). When `CRI hardlock` is active, `HardlockError` (HTTP 403) severs the session signing channel entirely.

---

## 4. Proposed Grant Milestones

### Milestone 1 — Risk Engine Core *(Delivered — audit-ready)*

| Deliverable | Status | Evidence |
|---|---|---|
| Unified cross-chain risk engine (`evaluateGlobalRiskPolicy`) | Complete | `src/core/risk-engine.ts` |
| HL EIP-712 session-key auth + signing gates | Complete | `src/adapters/hl/auth.ts`, 15 Vitest cases |
| HL execution engine with Pgate pre-trade validation | Complete | `src/adapters/hl/execution.ts`, 19 Vitest cases |
| Dynamic Max SL + soil resistance + R20 hardlock | Complete | `src/services/risk-control.ts`, 20 Vitest cases |
| Zero-key sandbox dry-run (HL / Polymarket / Jupiter) | Complete | `src/services/sandbox.ts` |
| Grant CI pipeline | Complete | `.github/workflows/grant-audit.yml` |

**Acceptance criteria:** `pnpm exec tsc --noEmit` clean · `pnpm exec vitest run` ≥ 319 passing · zero private-key exports from `src/index.ts`.

**Requested allocation:** Foundation review of Milestone 1 deliverables + partial funding release upon HL committee sign-off.

---

### Milestone 2 — Mainnet Sandbox & External Audit

| Deliverable | Target | Description |
|---|---|---|
| HL Testnet live session-key demo | Q3 2026 | End-to-end ApproveAgent → signed limit order on HL Testnet with Pgate HUD |
| Mainnet read-only auditor dashboard | Q3 2026 | Public `/api/state` + matrix feed with no signing keys on edge |
| Third-party security audit | Q4 2026 | Scope: session-key lifecycle, R20 severance, edge KV rate limiting |
| Hyperliquid Appchain deployment guide | Q4 2026 | Wrangler deploy + SYSTEM_STATE_KV binding documentation |
| Performance benchmark report | Q4 2026 | WS latency P99 < 200 ms; sandbox gate evaluation < 50 ms |

**Acceptance criteria:** External audit report with zero critical findings · HL Testnet demo video + reproducible CLI script · mainnet sandbox accessible without API keys.

**Requested allocation:** Remaining grant tranche upon Milestone 2 acceptance + Hyperliquid ecosystem listing consideration.

---

## 5. Zero-Key Sandbox Verification — HL Auditor Commands

Grant evaluators can reproduce the full Hyperliquid dry-run path locally without wallets, RPC keys, or exchange credentials.

### Prerequisites

```bash
pnpm install
```

### Step 1 — Typecheck

```bash
pnpm exec tsc --noEmit
```

### Step 2 — HL-Specific Unit Tests

```bash
# Session-key EIP-712 auth + signing gates
pnpm exec vitest run tests/adapters/hl/auth.test.ts

# Pre-trade Pgate + signed order wire (dry-run mode)
pnpm exec vitest run tests/adapters/hl/execution.test.ts

# WS heartbeat, latency fuse, soil integration
pnpm exec vitest run tests/adapters/hl/websocket.test.ts
```

### Step 3 — Cross-Venue Grant E2E Dry-Run (HL Step 1 of 3)

```bash
pnpm exec vitest run tests/e2e/grant-sandbox-dryrun.test.ts
```

**Expected HL audit log shape:**

```json
{
  "event": "GRANT_SANDBOX_DRY_RUN",
  "step": 1,
  "venue": "HL",
  "zeroKeyDryRun": true,
  "isAllowed": true,
  "passedGates": ["R20_LOCK", "ROOT_PROTECTION", "SOIL_RESISTANCE", "HL_DRY_RUN"],
  "executionPath": [
    "sandbox:start",
    "venue:HL",
    "mode:zero-key-dry-run",
    "gate:R20_LOCK:pass",
    "gate:ROOT_PROTECTION:pass",
    "gate:SOIL_RESISTANCE:pass",
    "gate:HL_DRY_RUN:pass",
    "sandbox:complete"
  ],
  "apiKeysRequired": false
}
```

### Step 4 — Full Grant CI Suite

```bash
pnpm exec vitest run
pnpm run audit:log
```

### Step 5 — Security Surface Audit

```bash
# Confirms zero private keys exported from public Worker entry
pnpm exec vitest run tests/security/security-audit.test.ts

# Confirms sandbox dry-run never mutates system state
pnpm exec vitest run tests/security/security-audit.test.ts -t "never mutates"
```

### Step 6 — Dynamic Max SL Formula Verification

```bash
pnpm exec vitest run tests/effective-max-sl.test.ts tests/risk-control.test.ts -t "Dynamic Max SL"
```

---

## Appendix — Repository Map (HL Scope)

| Path | Role |
|---|---|
| `src/adapters/hl/auth.ts` | Session-key delegation, EIP-712 L1 signing, signing channel gates |
| `src/adapters/hl/execution.ts` | Signed order POST, pre-trade Pgate, dry-run mode |
| `src/adapters/hl/websocket.ts` | HL WS client, heartbeat, latency/stale fuse |
| `src/services/exchanges/hyperliquid-adapter.ts` | HL info/exchange fetch, TradFi enrichment |
| `src/services/sandbox.ts` | Zero-key `simulateTransactionIntent()` dry-run |
| `src/services/effective-max-sl.ts` | `(Equity × 1%) + $100` canonical formula |
| `tests/e2e/grant-sandbox-dryrun.test.ts` | Grant auditor E2E proof |

---

**Contact:** SilverVine Labs — [github.com/SilverVineLabs/santenbokui-fulldex](https://github.com/SilverVineLabs/santenbokui-fulldex)  
**License:** BUSL-1.1 (Additional Use Grant for DEX Foundation evaluators)
