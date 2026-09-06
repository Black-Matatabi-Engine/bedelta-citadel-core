# Defense Matrix (R01–R20) & Wasm Soil Core

> **Document:** R01–R20 defense matrix · sub-ms `soil_core` Wasm · microsecond moats · risk equations · **Vitest SSOT:** **193 test files \| 840 PASS Clean (100% PASS)** · **Defense Matrix:** `17 Active | 2 Refactored | 1 Deprecated` · **p50 ~106 µs**
> **Full Pillar 3 audit:** [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) · **Topology:** [`01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md)

## 3. Cross-Venue Risk Engine & Defense Matrix (R01–R20)

> **Full Pillar 3 specification:** [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) — Wasm `soil_core.wasm` engine, `checkSoilResistance()` latency moats (p50 ~106 µs · warm &lt;60 µs), Tri-Sensor matrix, and complete R01–R20 defense matrix. Below is the integration summary for grant evaluators.

### 3.1 Microsecond Moats (Summary)

| Moat | Constant / Module | Spec |
|------|-------------------|------|
| **Emergency Margin Buffer** | `DEFAULT_CROSS_MMR = 0.05` (5% account equity reserve) | Blocks new risk when free margin buffer would fall below **5%** after intended notional (`src/services/risk/liquidation-meter.ts`) |
| **HL Nonce Auto-Resync** | `HL_NONCE_AUTO_RESYNC` · `session-key-adapter-lib/nonce-auto-healing` | Monotonic nonce heal on `Invalid nonce` WS · heartbeat revoke closes signing channel |
| **NTP Clock Drift Compensator** | `NTP_CLOCK_DRIFT_COMPENSATOR` | Rejects / skew-corrects venue timestamps with **&lt;200ms** drift vs Edge NTP; aligns with Pgate latency fuse (`PGATE_MAX_LATENCY_MS` = 200) |
| **Cross-Venue Net Slippage TWAP** | `CrossVenueNetSlippage` | When net cross-book slippage **&gt; 0.5%** (`MAX_SLIPPAGE = 0.005`), trips soil + schedules **TWAPEngineV2** path slicing instead of market sweep |
| **GMX Positive Skew Rebate** | `gmx-v2-balancer` / price-impact soil | Qualifies underweight-side flow · captures **positive skew / price-impact rebate** bps — never conflated with builder UI fee |

**Formal risk equations (SSOT):**

$$
\mathrm{BufferRatio} = \frac{\mathrm{Equity}}{\mathrm{Notional}} - \mathrm{MMR},\quad \mathrm{MMR}=0.05
$$

$$
\mathrm{MaxSL} = \mathrm{Balance} \times 0.01 + 100
$$

$$
\mathrm{AllowedToSign} = \mathrm{Injection} \land \mathrm{Digest} \land \mathrm{Soil} \land \mathrm{Session} \land \mathrm{Gas} \land \mathrm{Attestation} \land \mathrm{Armor} \land \mathrm{Wasm}
$$

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0
$$

$$
\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}
$$

$$
t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s} \ll t_{\text{mempool\_broadcast}}
$$

**Companion fuses:** Dynamic Account Risk Ceiling (V0.8 Baseline: Equity-Weighted SL; V1.0 Mainnet: Dynamic Adaptive Engine) · Sequencer 600s grace · Oracle lag fail-closed · Root slippage breaker (0.5%). · Configurable Dynamic Slippage Deadman is an additional fail-closed fuse on the AA / SDK path.

#### § Pendle Institutional Shield (V1.0 Live · Core Pillar 3)

| Layer | Module | Hot-path behavior |
|-------|--------|-----------------|
| **Dynamic Oracle** | [`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) | Sync `ingest()` / `resolve()` in-memory cache · **TTL default 60s** · zero hot-path I/O |
| **Registry Hydration** | [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) | `hydrateFromOracle` merges `impliedYield`, `ptPriceInAsset`, `liquidityConstant`, `expirySec` |
| **Soil Fuse** | [`soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) | `pendleOracle` + `pendleCrossGuard` → `collectExternalSoilFlags()` · **`PENDLE_ORACLE_STALE`** fail-closed |
| **Cross-Guard** | [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) | Shadow Margin vs GMX maintenance · Observatory Paradox de-leverage greenlight |
| **Expiry Guard** | [`pendle-pt-expiry-guard.ts`](../../src/adapters/pendle/pendle-pt-expiry-guard.ts) | PT maturity &lt;7d ∧ yield jitter &gt;200bps fail-closed |
| **AI Pool Factory** | [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) | `validateAIPoolSelection()` · maturity ≥7d · yield drift ≤300bps · min liquidity · asset whitelist |

**Vitest:** [`pendle-market-oracle.test.ts`](../../tests/adapters/pendle-market-oracle.test.ts) · [`pendle-pool-factory.test.ts`](../../tests/adapters/pendle-pool-factory.test.ts) · [`pendle-pt-registry.test.ts`](../../tests/adapters/pendle-pt-registry.test.ts) · [`pendle-soil-guard.test.ts`](../../tests/risk-control/pendle-soil-guard.test.ts) · **193 test files \| 840 PASS Clean (100% PASS)** · coexists with Shield **p50 ~106µs** budget.

#### § AI Guarded Pool Factory Protocol (V1.0)

Autonomous AI agents may propose Pendle pool creation or liquidity-add intents (`PENDLE_CREATE_POOL` · `PENDLE_ADD_LIQUIDITY`). Before mempool broadcast, `validateAIPoolSelection()` enforces four synchronous safety invariants on the hot path:

| Invariant | Threshold | Fail reason |
|-----------|-----------|-------------|
| **Liquidity cliff** | Days to maturity **≥ 7** | `PENDLE_POOL_MATURITY_CLIFF` |
| **Yield drift (MEV sandwich)** | Implied vs oracle yield **≤ 300 bps** | `PENDLE_POOL_YIELD_DRIFT_BREACH` |
| **Min initial liquidity** | **≥ $100,000 USD** | `PENDLE_POOL_LOW_INITIAL_LIQUIDITY` |
| **Underlying whitelist** | `eETH` · `ETH` · `USDC` | `PENDLE_POOL_ASSET_NOT_WHITELISTED` |

**Soil wiring:** optional `pendlePoolFactory` probe on `checkSoilResistance()` → `collectExternalSoilFlags()` · may chain `useOracle` freshness (`PENDLE_ORACLE_STALE`) before drift check · **p50 ~106µs** Shield budget preserved (zero hot-path I/O).

### 3.2 Risk & Execution Matrix

#### § Poisson Jitter & Anti-MEV Adaptive TWAP

For **$1,000,000+** treasury routing into GMX v2 GM pools, the Shield schedules child clips via **Wasm-driven Poisson random intervals** uniformly bounded **18s–110s** across a **12–18 minute** parent window. Inter-arrival jitter drives autocorrelation toward **near zero**, keeping GMX local price impact **≤ 10 bps**; any residual depth breach still short-circuits via `checkSoilResistance()` (R01).

#### § Block 0 Sequencer Desync Defense

| Layer | Mechanism |
|-------|-----------|
| **Private path** | Bypass public mempools via **Private Relays / QUIC** — Edge never exposes intent on the open gossip surface during desync windows. |
| **Settlement timing moat** | Leverage GMX v2 **two-stage async settlement**: keepers execute create→settle asynchronously; **`cancelOrder` remains a single-stage atomic** counter to stale MEV intent if soil / sequencer / oracle sensors trip mid-window. |

#### § SGX PRM Key Caching — ⏳ Planned / V1.0 Design Spec

> **Not in v1.0 codebase.** Documented cold-path / hot-signing architecture for future hardened key isolation.

| Phase | Bound |
|-------|-------|
| **Epoch attestation bootstrap** | **24-hour** SGX / PRM attestation refresh — cold path only. |
| **Hot signing** | Sub-ms **in-memory Ephemeral Key** signing after bootstrap — **&lt;30µs** CPU PRM execution on the Shield hot wire (no per-tx remote attestation). |

#### § Step-down Auto-Deleveraging Rules

Python-verified **48-day runway** under sustained negative funding. Automated 3-phase unwind (R12 / escalation ladder family):

| Trigger | Action |
|---------|--------|
| **Day 8** | Delever **−20%** notional |
| **Day 15** | Delever **−50%** notional |
| **Day 22 (30% reserve)** | **100% Fail-Closed return** — flatten remaining exposure; R17 / R20 severance envelope if flatten stalls |

### 3.3 Defense Matrix (R01–R20) — Summary

**Status:** **17 Active | 2 Refactored | 1 Deprecated** · Full rule table: [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md#defense-matrix-r01r20).

| Tier | Rules | Role |
|------|-------|------|
| **Pre-execution soil** | R01 · R03 · R04 · R05† | Wasm soil fuse · L2 stale book · Pgate latency |
| **Session / AA** | R06 · R07 · R08 · R14 | Scoped keys · notional cap · nonce heal · re-auth |
| **Saga / flatten** | R09 · R10 · R12 · R13 | 2PC ledger · auto-flatten · leverage scaling · black-swan halt |
| **Severance** | R17 · R20 · R02 | Daily loss cutoff · physical deadlock · `rootProtection()` |
| **Anchors / infra** | R11 · R15 · R16 · R18 · R19 | Dynamic SL · CCXT harness · 5-TX provenance · KV hardlock |

† R05 SpoofBuster — **Deprecated** (superseded by soil / depth gate).

**Supporting sensors:** Sequencer Guard · Arbitrum Gas / Oracle Lag · RPC Whitelist · Escalation Ladder.

### 3.4 Topology & Request Flow

| Engine | Venue | Role |
|--------|-------|------|
| **Arbitrum Citadel** (primary) | GMX v2 GM pools, Arbitrum One | Pre-execution gate · underweight-side routing |
| **Hyperliquid Native** (cross-chain L1) | Independent L1 HF orderbook perps · session-key signing · spread/size/rate-limit guard | Emergency Liquidity Sponge when Citadel flags trip |

Routing policy: venue selected per risk flags; both paths share the same fail-closed envelope. On-chain attestation consume-once: `SliverVineGate.sol` (`verifyAndConsume`).

1. **Ingress** — `worker-fetch.ts` / `worker-scheduled.ts`.
2. **Pre-execution** — sequencer → oracle-lag → `checkSoilResistance()` (depth, cross-spread, slippage fuse, **Pendle oracle / cross-guard soil probes**).
3. **Routing** — underweight GM qualification → unsigned payload with optional builder hooks.
4. **Hedge** — session-key HL leg when Citadel trips.
5. **State** — unidirectional `SystemState`; 2PC intent ledger → KV.

### 3.5 Wasm Soil Core (M4) — Summary

> **Full Wasm / latency specification:** [`04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md#wasm-soil-core-engine-no_std).

> **Dual-Engine Soil Topology:** SliverVine Citadel Shield enforces dual-engine soil resistance: pure high-throughput TypeScript soil math on Cloudflare Worker hot paths, alongside native `pkg/soil_core.wasm` execution on `@slivervine/citadel-sdk` agent-intent paths. Both engines share identical p50 ~106µs fail-closed thresholds and defense bounds.

- Artifact: `pkg/soil_core.wasm` (`#![no_std]`)
- Budget: **&lt;28kb** Cloudflare · hot-path exec **&lt;60µs** · Shield p50 **~106µs**
- Wire: `src/sdk/soil-wasm.ts` (production); TS sim fallback for dev

### 3.6 Financial Risk Parameters & Epoch Operations

| Layer | Parameter | Value / Rule | Status |
|-------|-----------|--------------|--------|
| **Active v1.0 Controls** | Single-order notional cap | **$5,000 USD** (`SESSION_KEY_NOTIONAL_CAP_USD`) | ✅ Code-Verified |
| **Active v1.0 Controls** | Protocol UI fee accrual | **+10 bps** `uiFeeReceiver` (`GMX_UI_FEE_BPS`) + up to **25%** referral rebate | ✅ Code-Verified |
| **Active v1.0 Controls** | Emergency margin buffer | **5%** (`DEFAULT_CROSS_MMR = 0.05`) | ✅ Code-Verified |
| **Active v1.0 Controls** | Circuit breakers | **R17** daily-loss severance · **R20** physical deadlock / flatten-fail | ✅ Code-Verified |
| **Vault Operational Spec (V1.0 Roadmap)** | Alpha Vault Cap | **$100,000** hard TVL ceiling | ⏳ Planned |
| **Vault Operational Spec (V1.0 Roadmap)** | Epoch batching | **4-hour** epoch windows for cross-venue execution | ⏳ Planned |
| **Vault Operational Spec (V1.0 Roadmap)** | Deposit cooldown | **24-hour** minimum hold to prevent flash arbitrage | ⏳ Planned |
