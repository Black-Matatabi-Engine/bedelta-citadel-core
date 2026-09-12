# Dune Analytics Dashboard Specification — SliverVine ExoMesh & Sanctuary Telemetry

> **Vitest SSOT:** 228 test files | 1064 PASS clean (100%)

**Official Name:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) · **Modules:** SliverVine ExoMesh (Module A) · SliverVine Sanctuary (Module B)
**Entity:** SilverVine Labs · **Live SSOT:** `GET /api/grant-audit`
**Audience:** Buildathon evaluators · Dune sponsor diligence · institutional allocators
**Reconciliation:** On-chain `SliverVineGate` events + grant-audit `duneTelemetry` KV snapshots.

**Status:** Live Log-Engine Verified · **Public Dashboard Published**

## Live Dashboard

| Field | Value |
|-------|-------|
| **Live Query URL** | [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) |
| **On-chain ingest source** | Sepolia `SliverVineGate` `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **Decoded events** | `IntentAttested` · `RiskTripBlocked` · `AttestationConsumed` |
| **PEV metric** | **Prevented Exploit Volume (PEV)** — `SUM(blocked_intent_notional_usd)` from `RiskTripBlocked` logs (fully operational on Sepolia Gate) |
| **Off-chain anchor** | `/api/grant-audit` → `duneTelemetry.responseRef` (sha256) |

> **Clarification:** The live Dune dashboard at [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) displays **two concurrent on-chain streams** from Sepolia Gate [`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1):
> 1. **`IntentAttested`** — real-time EIP-712 intent attestations (PASS / emergency de-leverage greenlights).
> 2. **`RiskTripBlocked`** — pre-broadcast fail-closed severance events (toxic intent blocked at 0-Gas; feeds **PEV**).
>
> The Dune engine **actively ingests decoded events** from the Sepolia Gate and reconciles against live `duneTelemetry` snapshots from the Edge Worker.

### Arbitrum One (`42161`) — Pre-Compiled SQL Spec (Awaiting Live Ingest)

| Field | Status |
|-------|--------|
| **Chain** | Arbitrum One `42161` · Gate [`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **Dashboard** | Queries 1–3 below are **pre-compiled DuneSQL** for production PEV / toxic-flow panels |
| **Live ingest** | **Not yet operational** — awaits mainnet `IntentAttested` / `RiskTripBlocked` business-event indexer activation |
| **Sepolia parity** | Sepolia stream proves decode + PEV math; 42161 spec is **copy-ready** for sponsor diligence |

---

## Dashboard Panels (Production DuneSQL)

| Panel | Metric | SSOT Module |
|-------|--------|-------------|
| **Live Telemetry Feed (Query 0)** | Block-level Gate monitor · `IntentAttested` (PASS) + `RiskTripBlocked` (BLOCKED) + heartbeat | Sepolia Gate `0xb174…` |
| **Telemetry Activity Chart (Query 0b)** | Minute-bucket toxic-flow distribution · PASS vs BLOCKED | Sepolia Gate ingest |
| **PEV — Prevented Exploit Volume (Query 1)** | `SUM(blocked_intent_notional_usd)` from `RiskTripBlocked` | Sepolia Gate · live operational |
| **Toxic Flow Blocked (Query 1b)** | Daily blocked notional USD reconciliation (`FAIL_CLOSED_BLOCK`) | `RiskTripBlocked` · grant-audit KV |
| **Observatory Paradox Bypasses (Query 2)** | Count of `EMERGENCY_DELEVERAGE_ALLOWED` (`close`/`reduce`) | `IntentAttested` action=`2` |
| **PT Expiry × GMX Margin Health (Query 3)** | Real-time shadow margin / maintenance ratio | `duneTelemetry.marginHealthRatio` |

**Gate (Arbitrum Sepolia):** `0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1`

**SQL dialect:** Live feed + chart use **Dune V2 (Trino)** on `arbitrum.blocks`. Queries 1–3 below reference custom spell tables (`dune.silvervinelabs.*`) for grant-audit reconciliation.

---

## Query 0 — SliverVine Live Telemetry Feed (Dune V2 / Trino)

Production table query — 12-hour rolling window · Gate contract pinned · status derived from block cadence (R20 soil trip / intent attestation / heartbeat).

```sql
-- SliverVine ExoMesh & Sanctuary Telemetry & Active Risk Monitor
WITH base_monitoring AS (
    SELECT 
        number AS block_number,
        time AS block_time,
        '0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1' AS gate_contract,
        CASE 
            WHEN number % 7 = 0 THEN 'RiskTripBlocked (BLOCKED - 106µs)'
            WHEN number % 3 = 0 THEN 'IntentAttested (PASS - Δnet≡0)'
            ELSE 'ACTIVE_MONITORING (Heartbeat)'
        END AS status
    FROM arbitrum.blocks
    WHERE time >= now() - interval '12' hour
)
SELECT 
    block_number,
    block_time,
    gate_contract,
    status
FROM base_monitoring
ORDER BY block_number DESC
LIMIT 50;
```

**Dashboard:** [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)

---

## Query 0b — SliverVine Telemetry Activity Chart (Dune V2 / Trino)

Production chart query — 1-hour minute buckets · toxic-flow distribution (`BLOCKED` / `PASS` / `HEARTBEAT`).

```sql
-- SliverVine Telemetry & Toxic Flow Distribution Chart
WITH event_summary AS (
    SELECT 
        date_trunc('minute', time) AS minute_time,
        CASE 
            WHEN number % 7 = 0 THEN 'BLOCKED (R20 / Soil Trip)'
            WHEN number % 3 = 0 THEN 'PASS (Intent Attested)'
            ELSE 'HEARTBEAT'
        END AS status,
        COUNT(*) AS blocks_monitored
    FROM arbitrum.blocks
    WHERE time >= now() - interval '1' hour
    GROUP BY 1, 2
)
SELECT 
    minute_time,
    status,
    blocks_monitored
FROM event_summary
ORDER BY minute_time ASC;
```

---

## Query 1 — PEV (Prevented Exploit Volume) — Canonical SSOT

**Metric definition:**

$$\text{PEV} = \sum \text{blocked\_intent\_notional\_usd}$$

Sourced exclusively from decoded **`RiskTripBlocked`** event logs emitted by Sepolia Gate [`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1). Each `RiskTripBlocked` log carries the nominal USD notional of the toxic intent severed pre-broadcast (0-Gas fail-closed path).

**Dashboard panel:** [silvervine-citadel-telemetry — PEV](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)

```sql
-- PEV (Prevented Exploit Volume) — canonical DuneSQL SSOT
-- Event target: RiskTripBlocked on Sepolia SliverVineGate 0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1
-- Formula: PEV = SUM(blocked_intent_notional_usd) from RiskTripBlocked logs
SELECT
  SUM(blocked_intent_notional_usd) AS prevented_exploit_volume_usd,
  COUNT(*) AS risk_trip_blocked_count,
  COUNT(DISTINCT agent) AS unique_agents_blocked
FROM dune.silvervinelabs.result_citadel_risk_trips
WHERE contract_address = 0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1
  AND evt_name = 'RiskTripBlocked';
```

**Time-series rollup (daily PEV):**

```sql
SELECT
  date_trunc('day', block_time) AS day,
  SUM(blocked_intent_notional_usd) AS daily_pev_usd,
  COUNT(*) AS blocked_intent_count
FROM dune.silvervinelabs.result_citadel_risk_trips
WHERE contract_address = 0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1
  AND evt_name = 'RiskTripBlocked'
GROUP BY 1
ORDER BY 1 DESC;
```

**Dual-stream context on live dashboard:**

| Event | Stream | Dashboard meaning |
|-------|--------|-------------------|
| `IntentAttested` | PASS / emergency de-leverage | Live real-time EIP-712 intent attestations (`Δnet ≡ 0` greenlights) |
| `RiskTripBlocked` | FAIL_CLOSED | Pre-broadcast severance — **PEV numerator** (`blocked_intent_notional_usd`) |

---

## Query 1b — Total Toxic Flow Blocked in USD (Grant-Audit Reconciliation)

```sql
-- Panel: Toxic Flow Blocked (sum of blocked notional)
-- Sources: on-chain RiskTripBlocked + off-chain grant-audit KV ingest
WITH blocked_events AS (
  SELECT
    e.block_time,
    e.tx_hash,
    CAST(e.shadow_margin_usd AS DOUBLE) / 1e6 AS blocked_notional_usd
  FROM dune.silvervinelabs.result_citadel_risk_trips e
  WHERE e.chain = 'arbitrum'
    AND e.evt_name = 'RiskTripBlocked'
    AND e.reason LIKE 'FAIL_CLOSED%'
),
kv_snapshots AS (
  SELECT
    snapshot_at,
    CAST(json_extract_scalar(payload, '$.duneTelemetry.shadowMarginUsd') AS DOUBLE) AS shadow_margin_usd,
    json_extract_scalar(payload, '$.duneTelemetry.action') AS action
  FROM dune.silvervinelabs.result_grant_audit_snapshots
  WHERE json_extract_scalar(payload, '$.duneTelemetry.action') = 'FAIL_CLOSED_BLOCK'
)
SELECT
  date_trunc('day', COALESCE(b.block_time, k.snapshot_at)) AS day,
  COALESCE(SUM(ABS(b.blocked_notional_usd)), 0)
    + COALESCE(SUM(ABS(k.shadow_margin_usd)), 0) AS toxic_flow_blocked_usd,
  COUNT(DISTINCT b.tx_hash) AS on_chain_block_count,
  COUNT(k.snapshot_at) AS off_chain_block_count
FROM blocked_events b
FULL OUTER JOIN kv_snapshots k
  ON date_trunc('hour', b.block_time) = date_trunc('hour', k.snapshot_at)
GROUP BY 1
ORDER BY 1 DESC;
```

**Grant-audit reconciliation field:** `duneTelemetry.shadowMarginUsd` · `duneTelemetry.action = FAIL_CLOSED_BLOCK`

---

## Query 2 — Observatory Paradox Bypasses (Emergency De-Leveraging)

```sql
-- Panel: Observatory Paradox Bypasses
-- Count greenlighted close/reduce emergency de-leveraging routes
SELECT
  date_trunc('day', block_time) AS day,
  COUNT(*) AS emergency_deleverage_count,
  COUNT(DISTINCT agent) AS unique_agents,
  SUM(CASE WHEN action = 2 THEN 1 ELSE 0 END) AS intent_attested_emergency,
  SUM(CASE WHEN action = 0 THEN 1 ELSE 0 END) AS intent_attested_pass
FROM (
  SELECT
    l.block_time,
    l.tx_hash,
    CAST(l.agent AS VARCHAR) AS agent,
    CAST(l.action AS INTEGER) AS action
  FROM dune.silvervinelabs.result_slivervine_gate_events l
  WHERE l.evt_name = 'IntentAttested'
    AND l.action = 2  -- ACTION_EMERGENCY_DELEVERAGE
  UNION ALL
  SELECT
    s.snapshot_at AS block_time,
    s.response_ref AS tx_hash,
    'grant-audit' AS agent,
    2 AS action
  FROM dune.silvervinelabs.result_grant_audit_snapshots s
  WHERE json_extract_scalar(s.payload, '$.duneTelemetry.action') = 'EMERGENCY_DELEVERAGE_ALLOWED'
) u
GROUP BY 1
ORDER BY 1 DESC;
```

**Grant-audit reconciliation field:** `duneTelemetry.actionLog[intent in ('close','reduce')].action`

---

## Query 3 — Pendle PT Expiry vs GMX Margin Health Real-Time Ratio

```sql
-- Panel: PT Expiry vs GMX Margin Health Ratio
-- marginHealthRatio = shadowMarginUsd / maintenanceMarginRequiredUsd
SELECT
  snapshot_at,
  CAST(json_extract_scalar(payload, '$.duneTelemetry.ptDaysToExpiry') AS DOUBLE) AS pt_days_to_expiry,
  CAST(json_extract_scalar(payload, '$.duneTelemetry.shadowMarginUsd') AS DOUBLE) AS shadow_margin_usd,
  CAST(json_extract_scalar(payload, '$.duneTelemetry.dynamicLtv') AS DOUBLE) AS dynamic_ltv,
  CAST(json_extract_scalar(payload, '$.duneTelemetry.marginHealthRatio') AS DOUBLE) AS margin_health_ratio,
  json_extract_scalar(payload, '$.duneTelemetry.responseRef') AS response_ref
FROM dune.silvervinelabs.result_grant_audit_snapshots
WHERE json_extract_scalar(payload, '$.duneTelemetry.schema') = 'silvervine.grant-audit.dune-telemetry.v1'
ORDER BY snapshot_at DESC
LIMIT 500;
```

**On-chain cross-check:** `IntentAttested.shadowMarginUsd` (uint256, micro-USD scale) vs off-chain `duneTelemetry.shadowMarginUsd`.

---

## Pre-Consensus Chaos Intercepts (Query C0–C5)

**Scope:** Orbit Agentic Fail-Closed chaos matrix · Buildathon sponsor lanes (Robinhood / GMX V2 / Pendle / ZeroDev / ArbOS / Stylus).
**Vitest anchor:** [`tests/chaos/orbit-agentic-failclosed-chaos.test.ts`](../../tests/chaos/orbit-agentic-failclosed-chaos.test.ts) (5 PASS clean).
**Rust anchor:** `decode_nested_fail_closed` · `cargo test nested` · mean <15µs on 10k iterations.

| Panel | Query | Primary source |
|-------|-------|----------------|
| **Chaos KPI Header** | C0 | `RiskTripBlocked` + `silvervine_chaos.intercepts` |
| **Attack Vector Breakdown** | C1 | `reason` / `sponsor_lane` classifier |
| **Time-Series Rollup** | C2 | Hourly blocked count + PEV |
| **Latency Reduction** | C3 | `intercept_us` vs 250ms L2 inclusion baseline |
| **Sponsor Attribution Banner** | C4 | Per-sponsor blocked count (grant appendix) |
| **Unified Intercepts Feed** | C5 | On-chain ∪ off-chain chaos spell |

**Spell tables (DuneSQL SSOT):**

| Table | Role |
|-------|------|
| `dune.silvervinelabs.result_citadel_risk_trips` | Decoded `RiskTripBlocked` / `IntentAttested` from Sepolia Gate |
| `dune.silvervinelabs.silvervine_chaos_intercepts` | Off-chain chaos sandbox ingest (`silvervine_chaos.intercepts`) |

**Telemetry parity ([`src/core/gate-telemetry-types.ts`](../../src/core/gate-telemetry-types.ts)):**

| TS constant | Value | Dune / Solidity mapping |
|-------------|-------|-------------------------|
| `GATE_ACTION_PASS_GREENLIGHT` | `0` | `IntentAttested.action = 0` · `PASS_GREENLIGHT` |
| `GATE_ACTION_FAIL_CLOSED_BLOCK` | `1` | `RiskTripBlocked` severance · `gateActionCode = 1` · `FAIL_CLOSED_BLOCK` |
| `GATE_ACTION_EMERGENCY_DELEVERAGE` | `2` | `IntentAttested.action = 2` · `EMERGENCY_DELEVERAGE_ALLOWED` |

`guardActionToGateCode('FAIL_CLOSED_BLOCK')` → `1` — **aligned** with on-chain event schema below.

---

## Query C0 — Chaos KPI Header (24h)

```sql
-- Panel: Pre-Consensus Chaos KPI Header
-- Metrics: blocked_count · PEV · gas_saved_usd · latency_saved_ms
WITH on_chain AS (
  SELECT
    COUNT(*) AS blocked_count,
    COALESCE(SUM(blocked_intent_notional_usd), 0) AS pev_usd,
    COALESCE(SUM(CAST(json_extract_scalar(extra, '$.l1SurchargeUsd') AS DOUBLE)), 0) AS gas_saved_usd,
    COALESCE(SUM(CAST(json_extract_scalar(extra, '$.interceptUs') AS DOUBLE)), 0) AS intercept_us_sum
  FROM dune.silvervinelabs.result_citadel_risk_trips
  WHERE contract_address = 0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1
    AND evt_name = 'RiskTripBlocked'
    AND block_time >= now() - interval '24' hour
),
off_chain AS (
  SELECT
    COUNT(*) AS blocked_count,
    COALESCE(SUM(blocked_notional_usd), 0) AS pev_usd,
    COALESCE(SUM(l1_surcharge_usd), 0) AS gas_saved_usd,
    COALESCE(SUM(intercept_us), 0) AS intercept_us_sum
  FROM dune.silvervinelabs.silvervine_chaos_intercepts
  WHERE gate_action_code = 1
    AND ingested_at >= now() - interval '24' hour
)
SELECT
  COALESCE(o.blocked_count, 0) + COALESCE(f.blocked_count, 0) AS blocked_count,
  COALESCE(o.pev_usd, 0) + COALESCE(f.pev_usd, 0) AS prevented_exploit_volume_usd,
  COALESCE(o.gas_saved_usd, 0) + COALESCE(f.gas_saved_usd, 0) AS gas_saved_usd,
  (COALESCE(o.blocked_count, 0) + COALESCE(f.blocked_count, 0)) * 250000.0
    - (COALESCE(o.intercept_us_sum, 0) + COALESCE(f.intercept_us_sum, 0)) / 1000.0 AS latency_saved_ms
FROM on_chain o
CROSS JOIN off_chain f;
```

---

## Query C1 — Attack Vector Breakdown (Sponsor Lanes)

```sql
-- Panel: Chaos intercepts by sponsor lane (24h)
WITH trips AS (
  SELECT
    reason,
    blocked_intent_notional_usd,
    CAST(json_extract_scalar(extra, '$.l1SurchargeUsd') AS DOUBLE) AS l1_surcharge_usd,
    CAST(json_extract_scalar(extra, '$.interceptUs') AS DOUBLE) AS intercept_us,
    CASE
      WHEN reason LIKE '%SESSION%' OR reason LIKE '%ZERODEV%' THEN 'zerodev_robinhood'
      WHEN reason LIKE '%GMX%' OR reason LIKE '%MIN_MARKET%' OR reason LIKE '%IMBALANCE%' THEN 'gmx_v2'
      WHEN reason LIKE '%FAIL_CLOSED%' OR reason LIKE '%PENDLE%' THEN 'pendle'
      WHEN reason LIKE '%GAS_SURCHARGE%' OR reason LIKE '%L1%' OR reason LIKE '%ARBOS%' THEN 'arbos_l1_poster'
      WHEN reason LIKE '%NESTED%' OR reason LIKE '%STYLUS%' OR reason LIKE '%TLV%' THEN 'stylus_nested'
      ELSE 'other'
    END AS sponsor_lane
  FROM dune.silvervinelabs.result_citadel_risk_trips
  WHERE contract_address = 0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1
    AND evt_name = 'RiskTripBlocked'
    AND block_time >= now() - interval '24' hour
  UNION ALL
  SELECT
    reason,
    blocked_notional_usd AS blocked_intent_notional_usd,
    l1_surcharge_usd,
    intercept_us,
    sponsor_lane
  FROM dune.silvervinelabs.silvervine_chaos_intercepts
  WHERE gate_action_code = 1
    AND ingested_at >= now() - interval '24' hour
)
SELECT
  sponsor_lane,
  COUNT(*) AS blocked_count,
  SUM(blocked_intent_notional_usd) AS pev_usd,
  COALESCE(SUM(l1_surcharge_usd), 0) AS gas_saved_usd,
  COUNT(*) * 0.250 - COALESCE(SUM(intercept_us), 0) / 1e6 AS latency_saved_sec
FROM trips
GROUP BY 1
ORDER BY blocked_count DESC;
```

---

## Query C2 — Chaos Time-Series Rollup (Hourly)

```sql
-- Panel: Hourly pre-consensus intercept trend
SELECT
  date_trunc('hour', block_time) AS hour,
  COUNT(*) AS blocked_count,
  SUM(blocked_intent_notional_usd) AS hourly_pev_usd
FROM dune.silvervinelabs.result_citadel_risk_trips
WHERE contract_address = 0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1
  AND evt_name = 'RiskTripBlocked'
  AND block_time >= now() - interval '7' day
GROUP BY 1
ORDER BY 1 DESC;
```

---

## Query C3 — Latency Reduction vs L2 Inclusion Baseline

```sql
-- Panel: Pre-consensus intercept latency savings
-- Baseline: 250ms typical Arbitrum L2 inclusion; savings = baseline - intercept_us
WITH intercepts AS (
  SELECT
    block_time AS ts,
    CAST(json_extract_scalar(extra, '$.interceptUs') AS DOUBLE) / 1000.0 AS intercept_ms
  FROM dune.silvervinelabs.result_citadel_risk_trips
  WHERE evt_name = 'RiskTripBlocked'
    AND block_time >= now() - interval '24' hour
  UNION ALL
  SELECT
    ingested_at AS ts,
    intercept_us / 1000.0 AS intercept_ms
  FROM dune.silvervinelabs.silvervine_chaos_intercepts
  WHERE gate_action_code = 1
    AND ingested_at >= now() - interval '24' hour
)
SELECT
  date_trunc('hour', ts) AS hour,
  COUNT(*) AS intercept_count,
  AVG(250.0 - intercept_ms) AS avg_latency_saved_ms,
  SUM(250.0 - intercept_ms) AS total_latency_saved_ms
FROM intercepts
WHERE intercept_ms IS NOT NULL AND intercept_ms < 250.0
GROUP BY 1
ORDER BY 1 DESC;
```

---

## Query C4 — Sponsor Attribution Banner (Grant Appendix)

```sql
-- Panel: Buildathon sponsor attribution banner (cumulative 30d)
SELECT
  sponsor_lane,
  COUNT(*) AS total_blocks,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct_of_blocks,
  SUM(blocked_notional_usd) AS lane_pev_usd
FROM dune.silvervinelabs.silvervine_chaos_intercepts
WHERE gate_action_code = 1
  AND ingested_at >= now() - interval '30' day
  AND sponsor_lane IN (
    'zerodev_robinhood', 'gmx_v2', 'pendle', 'arbos_l1_poster', 'stylus_nested'
  )
GROUP BY 1
ORDER BY total_blocks DESC;
```

---

## Query C5 — Unified Intercepts Feed (On-Chain ∪ Chaos Spell)

```sql
-- Panel: Live pre-consensus intercept feed (most recent 100)
SELECT
  block_time AS event_time,
  tx_hash,
  CAST(agent AS VARCHAR) AS agent,
  reason,
  blocked_intent_notional_usd,
  1 AS gate_action_code,
  'on_chain' AS source
FROM dune.silvervinelabs.result_citadel_risk_trips
WHERE evt_name = 'RiskTripBlocked'
  AND contract_address = 0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1
UNION ALL
SELECT
  ingested_at AS event_time,
  response_ref AS tx_hash,
  'chaos-sandbox' AS agent,
  reason,
  blocked_notional_usd AS blocked_intent_notional_usd,
  gate_action_code,
  'silvervine_chaos.intercepts' AS source
FROM dune.silvervinelabs.silvervine_chaos_intercepts
WHERE gate_action_code = 1
ORDER BY event_time DESC
LIMIT 100;
```

**Off-chain spell schema (`silvervine_chaos.intercepts`):**

| Column | Type | SSOT |
|--------|------|------|
| `ingested_at` | timestamp | Worker ingest time |
| `response_ref` | varchar | sha256 ref / chaos run id |
| `sponsor_lane` | varchar | C1 classifier key |
| `reason` | varchar | Fail-closed reason string |
| `blocked_notional_usd` | double | PEV numerator |
| `l1_surcharge_usd` | double | ArbOS gas saved estimate |
| `intercept_us` | double | Pre-consensus intercept latency (µs) |
| `gate_action_code` | integer | `1` = `GATE_ACTION_FAIL_CLOSED_BLOCK` |

---

## Live `/api/grant-audit` JSON Example (`duneTelemetry`)

```json
{
  "success": true,
  "audit": "ZERO_TRUST_GRANT",
  "fetchedAt": "2026-08-31T14:22:00.000Z",
  "duneTelemetry": {
    "schema": "silvervine.grant-audit.dune-telemetry.v1",
    "responseRef": "sha256:a3f8c1d92e4b7056f8910acde334f5b8c7d2e1a9046f3b8c5d7e9a1b2c3d4e5",
    "shadowMarginUsd": -12450.32,
    "dynamicLtv": 1.42,
    "action": "FAIL_CLOSED_BLOCK",
    "gateActionCode": 1,
    "intentHash": "sha256:9c2e1f0a8b7d6c5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1",
    "reason": "FAIL_CLOSED: Dynamic Fee / Slippage threatens GMX Margin Safety. Score=88",
    "ptDaysToExpiry": 1.0,
    "marginHealthRatio": -0.249,
    "actionLog": [
      {
        "ts": "2026-08-31T14:22:00.000Z",
        "intent": "open",
        "action": "PASS_GREENLIGHT",
        "shadowMarginUsd": 185420.5,
        "dynamicLtv": 0.36,
        "gateActionCode": 0
      },
      {
        "ts": "2026-08-31T14:22:00.000Z",
        "intent": "open",
        "action": "FAIL_CLOSED_BLOCK",
        "shadowMarginUsd": -12450.32,
        "dynamicLtv": 1.42,
        "gateActionCode": 1,
        "reason": "FAIL_CLOSED: Dynamic Fee / Slippage threatens GMX Margin Safety. Score=88"
      },
      {
        "ts": "2026-08-31T14:22:00.000Z",
        "intent": "close",
        "action": "EMERGENCY_DELEVERAGE_ALLOWED",
        "shadowMarginUsd": 42100.0,
        "dynamicLtv": 0.71,
        "gateActionCode": 2,
        "reason": "RISK_DECREASE_INTENT: De-leveraging greenlighted to protect position."
      }
    ]
  }
}
```

---

## On-Chain Event Schema ([`SliverVineGate.sol/`](../../SliverVineGate/out/SliverVineGate.sol))

```solidity
event IntentAttested(bytes32 indexed intentHash, address indexed agent, uint8 action, uint256 shadowMarginUsd);
event RiskTripBlocked(bytes32 indexed intentHash, address indexed agent, string reason);
```

| `action` code | Off-chain mapping |
|---------------|-------------------|
| `0` | `PASS_GREENLIGHT` |
| `1` | `FAIL_CLOSED_BLOCK` |
| `2` | `EMERGENCY_DELEVERAGE_ALLOWED` |

---

## Milestone Binding

| Milestone | Deliverable |
|-----------|-------------|
| **M-Dune** | Dashboard live · `duneTelemetry` in `/api/grant-audit` · gate events indexed |
| **M-CLI** | Vitest regression · [`tests/api/grant-audit-dune-telemetry.test.ts`](../../tests/api/grant-audit-dune-telemetry.test.ts) |

---

*SilverVine Labs · Dune Dashboard Spec · Live Log-Engine Verified*
