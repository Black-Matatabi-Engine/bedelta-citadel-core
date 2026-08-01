# Risk Envelope (Pgate) — Production Gate Specification

**Project:** BeΔ Living Water  
**Scope:** Institutional risk envelope · Session-Key safety · Grant reproducibility  
**Canonical modules:** `src/core/` · `src/services/` · `src/core/intent-ledger.ts`

---

## 1. Risk Envelope Overview

The **Risk Envelope** (formerly Pgate) is the mandatory pre-execution policy layer for all Hyperliquid-first and cross-venue intents. No order wire is signed until every gate in the envelope passes.

| Gate | Function | Block condition |
|------|----------|-----------------|
| **Soil resistance** | `checkSoilResistance()` | Cross-venue slippage > 0.5%, depth < $100k, tsunami window |
| **Root protection** | `vineWrapProtection()` | Estimated loss > Dynamic Max SL (`Balance × 1% + $100`) |
| **R20 deadlock** | `isR20Locked()` | CRI === 0, hardlock, signing channel severed |
| **2PC intent ledger** | `prepareIntent()` / `commitIntent()` | Dual-leg prepare failure → ABORT + flatten simulation |

### Non-negotiable guardrails

- **Dynamic Max SL** = Account Balance × **1%** + **$100**
- **Session Key scope** = TRADE_ONLY (no withdrawal / leverage mutation)
- **`rpc-whitelist.ts`** — strict host isolation for all outbound fetch/RPC
- **Intent TTL** — prepared legs expire after 30s default; auto-abort + flatten

---

## 2. 2PC Dual-Leg Intent Flow

```text
PENDING ──prepare──► PREPARED ──commit──► COMMITTED
   │                    │
   └──── abort ─────────┴──── abort ────► ABORTED (+ flatten simulation)
```

Module: `src/core/intent-ledger.ts`

| Phase | Entry | Success | Failure |
|-------|-------|---------|---------|
| Prepare | `prepareIntent(id)` | → PREPARED | → ABORTED + flatten prepared legs |
| Commit | `commitIntent(id)` | → COMMITTED | → ABORTED + flatten all legs |
| Abort | `abortIntent(id, reason)` | → ABORTED | — |

---

## 3. Grant Reviewer Commands

```bash
pnpm install
pnpm run typecheck
pnpm exec vitest run tests/e2e/grant-sandbox-dryrun.test.ts
pnpm exec vitest run tests/core/intent-ledger.test.ts
curl -s https://bedeltawater.slivervine.xyz/api/telemetry/health | jq .
```

| Step | Command | Expected |
|------|---------|----------|
| Typecheck | `pnpm run typecheck` | 0 errors |
| Grant dry-run | `pnpm exec vitest run tests/e2e/grant-sandbox-dryrun.test.ts` | HL → Poly → Jup gates pass |
| 2PC ledger | `pnpm exec vitest run tests/core/intent-ledger.test.ts` | prepare abort flatten verified |
| Live health | `curl -s …/api/telemetry/health` | CRI + breaker status |

---

## 4. Cloudflare KV Bindings

| Binding | Key | Purpose |
|---------|-----|---------|
| `BEDELTA_WATER_KV` | `system:state` | SystemState snapshot (isolated) |
| `SLIVERVINE_KV` | `system:state` | Compat alias → same namespace |
| `BEDELTA_WATER_KV` | `telemetry:soak-rolling` | Soak tick buffer |

```bash
pnpm run kv:ping
pnpm run kv:heartbeat
```

See [`BRAND_SSOT.md`](BRAND_SSOT.md) for deploy lock.

---

## 5. Archived Santenmoku UI

Legacy v1 SSR dashboard, DonDon HUD engine, and monolith sources live under `archive/santenmoku/`. They are **not** part of the Grant Wave 1 deliverable.

---

**License:** BUSL-1.1  
**Steel Core:** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz)  
**Entity:** SilverVine Labs
