# SQL & Dune Query Audit Report

> **Audit date:** 2026-09-14  
> **Scope:** All Markdown under `docs/`, plus `README.md` and `JUDGE_BRIEF.md`  
> **Off-chain SSOT:** [scripts/_shared/exomesh-dune-telemetry.ts](../../scripts/_shared/exomesh-dune-telemetry.ts) · schema `silvervine.exomesh.dune-telemetry.v1` · export `pnpm export:dune` → `docs/audit/exomesh-dune-telemetry.csv`

---

## Executive Summary

| Category | Count | Verdict |
|----------|------:|---------|
| **Fenced `sql` blocks** | 20 | See inventory below |
| **Dune schema / JSON snippets (non-SQL)** | 5 | Mixed — 1 current, 2 roadmap, 2 on-chain |
| **Dune URL / query references (no SQL body)** | 18 files | Links only — no executable SQL |
| **`README.md` / `JUDGE_BRIEF.md`** | 0 SQL | JUDGE_BRIEF has dashboard URL only |

**Headline:** **`docs/internal/DUNE_TELEMETRY_SPEC.md`** and **`docs/03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md` Query C0–C3** now both target `dataset_exomesh_intercepts` (ExoMesh off-chain SSOT). Legacy `silvervine_chaos.intercepts` references were **purged** from the public dashboard spec (2026-09-14). The PCTII spec (`02_PRE_CONSENSUS_MO_TELEMETRY_AND_DUNE_SPEC.md`) still describes a **future** `slivervine_telemetry_events` table not yet implemented in code or export.

---

## Current Off-Chain Telemetry Schema (Audit Baseline)

| Field | Type | SSOT |
|-------|------|------|
| `timestamp` | ISO-8601 UTC | `ExomeshDuneTelemetryRow.timestamp` |
| `venue` | `gmx` · `pendle` · `usdai` · `hyperliquid` · `variational` | `DuneVenue` |
| `intercept_type` | `SOIL_RESISTANCE_TRIP` · `HONEYPOT_DECOY` · `OBSERVATORY_HAIRCUT` · `MAX_ATTEMPTS_SEVERED` | `DuneInterceptType` |
| `reflex_latency_us` | µs | Wasm/Edge reflex (not `eval_latency_us` / `intercept_us`) |
| `gas_burned` | `0` on FAIL_CLOSED | 0-Gas intercept invariant |
| `status` | `FAIL_CLOSED` · `ALLOW` | |
| *(JSON only)* `gas_saved_usd` | USD model | Not in CSV header; present in `--json` export |
| *(JSON only)* `source` | e.g. `chaos-matrix:42` | Row provenance |
| *(JSON only)* `reason` | Fail-closed reason string | |

**Dune upload target:** `dune.silvervinelabs.dataset_exomesh_intercepts` (placeholder until CSV ingest).

---

## Complete SQL Inventory (20 blocks)

### ✅ Valid / Current — ExoMesh Off-Chain Export

| # | ID | File | Table | Status |
|---|-----|------|-------|--------|
| 1 | **E1** Daily intercept volume | [docs/internal/DUNE_TELEMETRY_SPEC.md](../internal/DUNE_TELEMETRY_SPEC.md) §SQL-1 | `dataset_exomesh_intercepts` | ✅ **Valid** — columns match CSV SSOT |
| 2 | **E2** 255/255 chaos reconciliation | same §SQL-2 | `dataset_exomesh_intercepts` | ✅ **Valid** — `source LIKE 'chaos-matrix:%'` matches export |
| 3 | **E3** Zero-gas economics rollup | same §SQL-3 | `dataset_exomesh_intercepts` | ✅ **Valid** — `gas_burned = 0` + `reflex_latency_us` |
| 4 | **E4** Venue heatmap (30d) | same §SQL-4 | `dataset_exomesh_intercepts` | ✅ **Valid** — `venue` + `intercept_type` |

---

### ⚠️ Valid for On-Chain Layer — Not Off-Chain SSOT

These query **Sepolia Gate** decoded events or grant-audit KV. They are **correct for their layer** but **do not** use the new ExoMesh CSV schema.

| # | ID | File | Table(s) | Status | Notes |
|---|-----|------|----------|--------|-------|
| 5 | **Q1** PEV canonical | [docs/03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md](../03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md) | `result_citadel_risk_trips` | ⚠️ **On-chain valid** | `RiskTripBlocked` → `blocked_intent_notional_usd`; Sepolia Gate `0xb174…` |
| 6 | **Q1-daily** PEV time-series | same | `result_citadel_risk_trips` | ⚠️ **On-chain valid** | Daily rollup of Q1 |
| 7 | **Q1b** Toxic flow blocked | same | `result_citadel_risk_trips` + `result_grant_audit_snapshots` | ⚠️ **Hybrid valid** | On-chain + grant-audit KV `duneTelemetry.shadowMarginUsd` |
| 8 | **Q2** Observatory bypasses | same | `result_slivervine_gate_events` + `result_grant_audit_snapshots` | ⚠️ **Hybrid valid** | `EMERGENCY_DELEVERAGE_ALLOWED` / `action = 2` |
| 9 | **Q3** PT expiry × GMX margin | same | `result_grant_audit_snapshots` | ⚠️ **Grant-audit valid** | `silvervine.grant-audit.dune-telemetry.v1` JSON paths |
| 10 | **C2** Chaos hourly rollup | same | `result_citadel_risk_trips` | ⚠️ **On-chain only** | No off-chain union; on-chain half of C0/C5 |

---

### ❌ Stale / Obsolete — Off-Chain Schema Mismatch

| # | ID | File | Table(s) | Status | Staleness |
|---|-----|------|----------|--------|-----------|
| 11 | **C0** Chaos KPI header | `03_DUNE_DASHBOARD_SPECIFICATION.md` | `result_citadel_risk_trips` + **`silvervine_chaos_intercepts`** | ❌ **Stale off-chain half** | Uses `intercept_us`, `l1_surcharge_usd`, `blocked_notional_usd`, `sponsor_lane` — **not** `reflex_latency_us`, `gas_saved_usd`, `intercept_type`, `venue` |
| 12 | **C1** Attack vector breakdown | same | same UNION | ❌ **Stale** | `sponsor_lane` classifier (`zerodev_robinhood`, `gmx_v2`, …) replaced by `venue` enum in export |
| 13 | **C3** Latency reduction | same | same UNION | ❌ **Stale** | Column `intercept_us` → should be `reflex_latency_us`; 250ms L2 baseline logic still valid conceptually |
| 14 | **C4** Venue attribution banner | same | **`silvervine_chaos_intercepts` only** | ❌ **Stale** | `sponsor_lane` not in new schema |
| 15 | **C5** Unified intercepts feed | same | on-chain + **`silvervine_chaos_intercepts`** | ❌ **Stale off-chain half** | Should UNION `dataset_exomesh_intercepts` instead |
| 16 | **PCTII-1** Daily PCTII rollup | [docs/03_hacker_profiling/02_PRE_CONSENSUS_MO_TELEMETRY_AND_DUNE_SPEC.md](../03_hacker_profiling/02_PRE_CONSENSUS_MO_TELEMETRY_AND_DUNE_SPEC.md) §5.1 | **`slivervine_telemetry_events`** | ❌ **Not implemented** | Table spec v1 only; no spell ingest, no export script |
| 17 | **PCTII-2** MO signature heatmap | same §5.2 | **`slivervine_telemetry_events`** | ❌ **Not implemented** | Uses `mo_signature_code`, `gas_saved_wei`, `eval_latency_us` — differs from CSV |
| 18 | **PCTII-3** PCTII → PEV reconciliation | same §5.3 | `slivervine_telemetry_events` + `result_citadel_risk_trips` | ❌ **Not implemented** | Off-chain arm references non-existent table |

---

### 🎭 Synthetic / Demo — Explicitly Non-Event

| # | ID | File | Source | Status | Notes |
|---|-----|------|--------|--------|-------|
| 19 | **Q0** Live telemetry feed | `03_DUNE_DASHBOARD_SPECIFICATION.md` | `arbitrum.blocks` + `number % 7/3` | 🎭 **Synthetic** | **Not decoded Gate events.** Docs and [V0.9_VS_V1.0_ZH.md](../internal/V0.9_VS_V1.0_ZH.md) acknowledge this. Valid as heartbeat **placeholder** only. |
| 20 | **Q0b** Activity chart | same | `arbitrum.blocks` minute buckets | 🎭 **Synthetic** | Same — BLOCKED/PASS labels are **simulated**, not `RiskTripBlocked` / `IntentAttested` logs |

---

## Non-SQL Dune / Telemetry Snippets

| # | File | Snippet type | Status | Notes |
|---|------|--------------|--------|-------|
| N1 | `docs/internal/DUNE_TELEMETRY_SPEC.md` | CSV column table | ✅ **Current** | Matches `exomesh-dune-telemetry.ts` |
| N2 | `docs/03_hacker_profiling/02_PRE_CONSENSUS_MO_TELEMETRY_AND_DUNE_SPEC.md` | `slivervine_telemetry_events` column table (§3.1) | 📋 **Roadmap** | Rich MO taxonomy; **no runtime emitter** yet |
| N3 | same | JSON wire format (§3.4) | 📋 **Roadmap** | `eval_latency_us`, `gas_saved_wei` — future event-bus format |
| N4 | same | TypeScript `event_id` / `agent_id` (§3.3) | 📋 **Roadmap** | Mirrors `deriveTripEvtHash()` pattern |
| N5 | `docs/03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md` | `duneTelemetry` JSON example (§Static grant-audit) | ✅ **Valid** | `silvervine.grant-audit.dune-telemetry.v1` — live in `buildGrantAuditDuneTelemetry()` |
| N6 | same | `silvervine_chaos.intercepts` column table | ❌ **Stale** | Superseded by ExoMesh CSV columns |
| N7 | same | Solidity `IntentAttested` / `RiskTripBlocked` events | ✅ **Valid** | On-chain Dune decode SSOT |
| N8 | `docs/03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md` | Spell table registry (§C0–C5) | ⚠️ **Partial** | Missing `dataset_exomesh_intercepts` |

---

## Dune References Without SQL (18 files)

No executable SQL — dashboard URLs, query IDs in prose, or milestone checklists only.

| File | Reference type |
|------|----------------|
| `README.md` | *(none)* |
| `JUDGE_BRIEF.md` | Dashboard URL only |
| `docs/00_ARB_Buildathon/SUBMISSION.md` | Query 0–3 prose + dashboard link |
| `docs/00_ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md` | Query 0/0b description + dashboard |
| `docs/01_architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md` | External Dune AI-agent links (industry stats) |
| `docs/01_architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md` | PEV dashboard link |
| `docs/03_hacker_profiling/02_PRE_CONSENSUS_MO_TELEMETRY_AND_DUNE_SPEC.md` | Architecture diagram + spell roadmap |
| `docs/05_pitch_and_demos/01_DEMO_VIDEO_SCRIPT_AND_STORYBOARD.md` | Dashboard + “no synthetic Query 0” warning |
| `docs/06_verifications/03_ON_CHAIN_MAINNET_ANCHORS.md` | Dashboard URL |
| `docs/0A_grants/arbitrum/GRANT_PROPOSAL.md` | Dashboard URL |
| `docs/internal/V0.9_VS_V1.0_ZH.md` | Query 0/0b synthetic disclosure |
| `docs/internal/GROK_20_JUDGE_POST_AGENT_AUDIT_ZH.md` | Query 0 panel + R4 risk |
| `docs/internal/0903_Grok_EH_ZH.md` | Query 0–3 spec mention |
| `docs/logging/20260902_dune_sql_production_sync.md` | Archived sync log — points to Query 0/0b |
| `docs/logging/20260902_dune_sql_production_sync_ZH.md` | Same (ZH) |
| `docs/logging/0911_chaos_sandbox_audit.md` | C0–C5 implementation note |

---

## Schema Cross-Walk (Why Items Are Stale)

| Legacy column / table | Current SSOT | Verdict |
|----------------------|--------------|---------|
| `silvervine_chaos.intercepts` | `docs/audit/exomesh-dune-telemetry.csv` | Replace spell ingest |
| `intercept_us` | `reflex_latency_us` | Rename in SQL |
| `l1_surcharge_usd` | `gas_saved_usd` (JSON) / `gas_burned=0` (CSV) | Different semantics |
| `sponsor_lane` | `venue` | Enum changed |
| `blocked_notional_usd` | No direct CSV column; PEV stays on-chain | Keep on-chain queries separate |
| `slivervine_telemetry_events` | `silvervine.exomesh.dune-telemetry.v1` | Future MO-rich layer; not shipped |
| `mo_signature_code` | `intercept_type` (4-value taxonomy) | Simplified for Dune upload |
| `eval_latency_us` / `wasm_latency_us` | `reflex_latency_us` | Single latency field in export |

---

## Recommendations (Priority Order)

1. ~~**Update `03_DUNE_DASHBOARD_SPECIFICATION.md` Query C0–C5**~~ — ✅ Done (2026-09-14): C0–C3 → `dataset_exomesh_intercepts`; legacy C4/C5 removed.
2. **Add cross-link in `02_PRE_CONSENSUS_MO_TELEMETRY_AND_DUNE_SPEC.md`** — Mark §5 SQL as **Phase 2** (MO-rich `slivervine_telemetry_events`); link §5.1–5.3 to `DUNE_TELEMETRY_SPEC.md` for **Phase 1** CSV upload.
3. **Caption Query 0 / 0b** — Add banner: *“Synthetic heartbeat — replace with decoded `SliverVineGate` logs when Sepolia spell is live.”* (partially done in demo script warnings).
4. **Promote `docs/internal/DUNE_TELEMETRY_SPEC.md`** — Move or symlink to public `docs/03_hacker_profiling/04_EXOMESH_DUNE_TELEMETRY.md` after Dune CSV upload confirmed.
5. **Keep Q1–Q3 and PCTII-3 on-chain arm** — Still valid for Sepolia PEV reconciliation; do not merge with off-chain CSV without a documented UNION view (proposed C5 replacement).

---

## Verification Commands

```bash
pnpm export:dune                    # Regenerate docs/audit/exomesh-dune-telemetry.csv (264 rows)
pnpm exec tsc --noEmit              # Type-check export SSOT
npx vitest run tests/sdk/retail-guard-provider.test.ts
```

---

*SilverVine Labs · SQL Audit · Generated 2026-09-14*
