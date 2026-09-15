# ExoMesh Dune Telemetry Spec

> **Schema:** `silvervine.exomesh.dune-telemetry.v1`  
> **Export:** `pnpm tsx scripts/export-dune-telemetry.ts`  
> **SSOT:** [`scripts/_shared/exomesh-dune-telemetry.ts`](../../scripts/_shared/exomesh-dune-telemetry.ts)  
> **Live dashboard (Module A):** [SliverVine Protocol Master Dashboard (Dune)](https://dune.com/silvervinelabs/slivervine-protocol)

## CSV Upload Schema

Upload `docs/audit/exomesh-dune-telemetry.csv` (auto-written on export) to Dune as `exomesh_intercepts`.

| Column | Type | Description |
|--------|------|-------------|
| `timestamp` | `TIMESTAMP` | ISO-8601 UTC intercept time |
| `venue` | `VARCHAR` | `gmx` · `pendle` · `usdai` · `hyperliquid` · `variational` |
| `intercept_type` | `VARCHAR` | `SOIL_RESISTANCE_TRIP` · `HONEYPOT_DECOY` · `OBSERVATORY_HAIRCUT` · `MAX_ATTEMPTS_SEVERED` |
| `reflex_latency_us` | `DOUBLE` | Wasm/Edge reflex time (µs) |
| `gas_burned` | `DOUBLE` | On-chain gas spent — **0** for fail-closed intercepts |
| `simulated_loss_prevented_usd` | `DOUBLE` | Counterfactual notional protected ($5k–$50k by severity; **0** on `ALLOW`) |
| `gas_saved_usd` | `DOUBLE` | L2 counterfactual gas avoided (~**$0.25** per `FAIL_CLOSED`) |
| `status` | `VARCHAR` | `FAIL_CLOSED` · `ALLOW` |

Extended JSON export (`--json`) also includes `source` and `reason`.

## Intercept Type Mapping

| Signal family | `intercept_type` | Emitter |
|---------------|------------------|---------|
| Soil / slippage / depth / GMX price impact | `SOIL_RESISTANCE_TRIP` | `evaluateRetailSoilGate()` · `checkSoilResistance()` |
| Honeypot RPC trap · malformed telemetry | `HONEYPOT_DECOY` | `evaluateRpcDefenseGate()` · chaos payload isolate |
| Oracle lag · sequencer grace · soft-confirm drift | `OBSERVATORY_HAIRCUT` | `evaluateOracleLag()` · sequencer guard |
| Dual-plug severance · attempt budget exhaust | `MAX_ATTEMPTS_SEVERED` | `evaluateRetailIntentGate()` · `rootProtection()` |

## Dune SQL — Upload Table Queries

```sql
-- 1) Daily intercept volume by venue + type
SELECT
  DATE_TRUNC('day', CAST(timestamp AS TIMESTAMP)) AS day,
  venue,
  intercept_type,
  COUNT(*) AS intercept_count,
  COUNT(*) FILTER (WHERE status = 'FAIL_CLOSED') AS fail_closed_count,
  APPROX_PERCENTILE(reflex_latency_us, 0.5) AS p50_latency_us,
  APPROX_PERCENTILE(reflex_latency_us, 0.99) AS p99_latency_us
FROM dune.silvervinelabs.dataset_exomesh_intercepts
GROUP BY 1, 2, 3
ORDER BY 1 DESC, intercept_count DESC;
```

```sql
-- 2) 255/255 chaos matrix reconciliation (fail-closed rate)
SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE status = 'FAIL_CLOSED') AS fail_closed_rows,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'FAIL_CLOSED')
    / NULLIF(COUNT(*), 0),
    2
  ) AS fail_closed_pct
FROM dune.silvervinelabs.dataset_exomesh_intercepts
WHERE source LIKE 'chaos-matrix:%';
```

```sql
-- 3) Zero-gas economics rollup (gas_burned must be 0 on FAIL_CLOSED)
SELECT
  intercept_type,
  SUM(CASE WHEN gas_burned = 0 AND status = 'FAIL_CLOSED' THEN 1 ELSE 0 END) AS zero_gas_intercepts,
  AVG(reflex_latency_us) FILTER (WHERE status = 'FAIL_CLOSED') AS avg_reflex_us
FROM dune.silvervinelabs.dataset_exomesh_intercepts
GROUP BY 1
ORDER BY zero_gas_intercepts DESC;
```

```sql
-- 4) Venue heatmap (last 30 days)
SELECT
  venue,
  intercept_type,
  COUNT(*) AS blocks
FROM dune.silvervinelabs.dataset_exomesh_intercepts
WHERE CAST(timestamp AS TIMESTAMP) >= NOW() - INTERVAL '30' DAY
  AND status = 'FAIL_CLOSED'
GROUP BY 1, 2
ORDER BY blocks DESC;
```

## Cloudflare KV Pipeline (Production)

| KV binding | Key | Role |
|------------|-----|------|
| `SLIVERVINE_KV` | `telemetry:soak-rolling` | Soak telemetry rolling window |
| `SLIVERVINE_KV` | `telemetry:risk-log-rolling` | `RiskLogEntry` audit trail |
| `SLIVERVINE_KV` | `telemetry:exomesh-intercepts` | ExoMesh intercept rows (Dune schema) |
| `EXECUTION_LOGS_KV` | `exec:grant_audit:latest` | Grant-audit precompute (`GET /api/grant-audit`) |

**Local CLI mirror** (wall-clock `Date.now()` — not JUDGE_SAFE July anchor):

- `docs/audit/exomesh-dune-telemetry.csv` — Dune upload SSOT
- `docs/audit/exomesh-kv-intercepts.json` — `telemetry:exomesh-intercepts` mirror
- `docs/audit/exomesh-risk-log-rolling.json` — `telemetry:risk-log-rolling` mirror

`pnpm demo:gmx -- --trip` (and other demos via `wrapDemoExecution`) append to all three.

## Reconciliation Notes

- **Bulk export (`pnpm export:dune`):** 264 rows stamped across the last 24h ending at `Date.now()` (rolling wall-clock).
- **Chaos matrix:** 255 deterministic fail-closed cases from `scripts/chaos-blackswan-stress.ts`.
- **Honeypot decoys:** `HONEYPOT_RPC_HOSTS` trap hosts → `HONEYPOT_DECOY`.
- **Grant audit shadow margin:** Pendle×GMX probe rows from `buildGrantAuditDuneTelemetry()`.
- **Demo harness:** ExoMesh Scenario A/C/D reference latencies from `pnpm demo:exomesh -- --json`.

Replace `dune.silvervinelabs.dataset_exomesh_intercepts` with your uploaded table name after CSV ingest.
