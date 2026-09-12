> [ARCHIVED LOG] Historical terminology retained for audit trail.

# 🔒 [INTERNAL ONLY] OpSec Audit Report — Anti-Fork Readiness & WASM Boundary

| Field | Value |
|-------|-------|
| **Classification** | Strictly Confidential / Internal OpSec |
| **Visibility** | Internal Core Team Only (DO NOT expose in Public Grant Submissions) |
| **Repository** | `bedelta-citadel-core` |
| **Audit Baseline** | `main` @ `f2a79c6` (Phase 2 spec pass) · code verified @ `f2a79c6` |
| **Test / Bundle SSOT** | **193 test files | 840 PASS Clean (100% PASS)** · **70.16 KiB gzip** (`pass: true`) |
| **Auditor Role** | Principal Security Auditor & Lead Architect |
| **Scope** | Full codebase read-only scan |
| **Date** | 2026-09-05 |

---

## 1. Executive Summary

SliverVine Citadel Shield's **legal layer** (BUSL-1.1 + competing-use restriction) is stronger than its **technical layer** (most core risk logic is readable TypeScript). Current anti-copycat posture derives from:

1. License and brand constraints (not a cryptographic barrier)
2. 836 Vitest regressions + deep multi-protocol adapter integration (high replication cost, not impossible)
3. Distributed adversarial mechanisms (RPC honeypots, threshold jitter, R17/R20 hardlocks) — **all visible in source**

**Overall anti-fork rating: 6.5 / 10 (Moderate)**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Legal / license barrier | 7/10 | BUSL-1.1 + competing Citadel gateway restriction; Apache conversion 2028-08-21 |
| Source closure | 3/10 | `risk-engine-core.ts`, bitmasks, adapter logic fully plaintext |
| Adversarial trap efficacy | 5/10 | Honeypots depend on config unlock; competitors can grep and bypass |
| WASM closed kernel | 4/10 | `soil_core.wasm` covers narrow subset; Rust source is Apache-2.0 |
| Integration / test moat | 8/10 | 193 test files | 840 PASS Clean (100% PASS) + 7-protocol matrix |

---

## 2. Anti-Copycat & Honeypot Status

### 2.1 R17 (Daily Loss / Dynamic Max SL)

| Mechanism | Location | Behavior |
|-----------|----------|----------|
| **Dynamic Max SL** | `src/services/effective-max-sl.ts` | `Balance × 1% + $100` |
| **Per-trade loss fuse** | `src/services/risk-control-lib/root-protection.ts` → `vineWrapProtection()` | Throws `RiskLimitExceeded` on breach |
| **Daily loss cap (R17)** | `src/services/root17-daily.ts` → `checkRoot17DailyLimit()` | UTC-day cumulative loss / SL trip count |
| **Circuit breaker orchestration** | `src/services/root-protection-lib/circuit-breaker.ts` | R17 trip → `severCircuitBreakerPipeline("R17")` |
| **Tactical log mapping** | `src/services/tactical-log/resolve.ts` | R17 ↔ `checkRoot17DailyLimit()` |

**Competitor strip difficulty: Low.** Logic is clear, un-obfuscated, ~200 LOC to replicate.

### 2.2 R20 (Physical Deadlock / Signing Channel Severance)

| Mechanism | Location | Behavior |
|-----------|----------|----------|
| **R20 state predicate** | `src/core/risk.ts` → `isR20Locked()` | `hardlock` / `currentCri <= 0` / `signingChannelOpen === false` |
| **Channel sever SSOT** | `src/core/state-store.ts` → `severSigningChannel()` | Sets hardlock, CRI=0, HUD=BLOCKED |
| **Bitmask auto-sever** | `src/core/risk-severance.ts` → `applyAutoSeveranceOnFlags()` | `FLAGS_AUTO_SEVER_MASK` hit → sever |
| **Soil trip sever** | `src/core/risk-engine-soil.ts` | `checkSoilResistance()` trip → `applySoilTripSeverance()` |
| **CRI hardlock** | `root-protection.ts` | `criHardlock` → `HardlockError` + R20 sever |
| **Flatten failure escalation** | `src/core/intent-ledger/flatten-hardlock.ts` | `R20_FLATTEN_FAILED` |

**Competitor strip difficulty: Low–Medium.** Requires syncing `SystemState` and sever pipeline; no WASM protection.

### 2.3 Bitmask Protocol Invariants

**SSOT:** `src/core/risk-flags.ts` (14 bits incl. `FLAGS_AUTO_SEVER_MASK` + Variational bits 12–13)

**Evaluators:** `src/core/risk-engine-core.ts`

| Function | Protocol | Threshold source |
|----------|----------|------------------|
| `evaluateGmxFlags` | GMX v2 | `risk-engine-limits.ts` |
| `evaluatePendleFlags` | Pendle | same |
| `evaluateUniswapFlags` | Uniswap V3 | same |
| `evaluateAaveFlags` | Aave V3 | same |
| `evaluateMorphoFlags` | Morpho Blue | same |
| `evaluateHlSessionFlags` | Hyperliquid | same |
| `evaluateDepegFlags` | Stabilizer | same |
| `evaluateGatewayRules` | Gateway | includes `PAYLOAD_POISON` trap |

**Phase 2 (internal reserve — not shipped):**

| Function (planned) | Protocol | Threshold source |
|------------------|----------|------------------|
| `evaluateSparkFlags` | Spark Protocol | `SPARK_USDS_DEPEG_MAX_BPS`, `SPARK_HF_MIN` (Aave-v3 class) |
| `evaluateFluidFlags` | Fluid Protocol | `FLUID_CORRELATED_UTIL_MAX`, `FLUID_SLIPPAGE_MAX_BPS` |
| `evaluateUsdAiFlags` | USD.AI | `USDAI_ORACLE_MAX_AGE_MS`, `USDAI_PEG_DRIFT_MAX_BPS` |
| `evaluateD2Flags` | D2 Finance | `D2_SHARE_SLIPPAGE_MAX_BPS`, `D2_EXEC_BOUND_TVL_RATIO` |

**Note:** Variational RFQ is **not** in the `risk-engine-core` bitmask system. It lives only in `src/adapters/variational-rfq-adapter.ts` — architecturally adapter-layer, easily deleted or replaced during a fork.

**Sliding-window OI defense:** `src/core/pending-exposure-window.ts` (30s GMX skew accumulator — split-payload defense).

### 2.4 Adversarial Traps / Honeypot Inventory

| Type | Location | Mechanism | Anti-fork efficacy |
|------|----------|-----------|-------------------|
| **RPC Honeypot** | `src/services/defense/rpc-allowlist-hosts.ts` | `rpc.silvervine-clone.trap` + 2 others; unauthenticated → `HONEYPOT_ACTIVE` / `0x99` | **Low** — hostnames hardcoded; delete to bypass |
| **Honeypot gate** | `rpc-fetch-gate-eval.ts` | Requires `X-Citadel-Session-Sig` or layout unlock | **Medium** — needs unlock chain understanding |
| **Layout probe unlock** | `layout-metric-provider-lib/` | `isLayoutProbeStripAuthorized()` strips trap hosts | **Medium** — security through obscurity |
| **Payload poison** | `risk-engine-core.ts` | `PAYLOAD_POISON_FAIL_CLOSED` | **Low** — single constant |
| **Threshold jitter** | `soil-threshold-jitter.ts` | ±2–5 bps randomization | **Medium** — MEV threshold sniping defense, not fork defense |
| **Fool-proof guard** | `fool-proof-guard.ts` | Retail position / leverage caps | **Low** — optional layer |
| **Grant audit hygiene** | `src/v09-public/opsec-boundary.ts` | Blocks internal metric keys in public JSON | **High (external)** — does not protect kernel copy |
| **Telemetry sanitizer** | `opsec-log-sanitizer.ts` | Redacts internal formula keys | **High (external)** |

**Conclusion:** Current honeypots are **integrity probes + clone-detection**, not runtime kernel integrity protection. They are ineffective against "de-brand and reuse risk engine" forks.

### 2.5 License & Brand-Strip Risk

| Asset | License | Fork risk |
|-------|---------|-----------|
| Main repo (excl. SDK) | BUSL-1.1 | Legal exposure; technically ignorable |
| `src/sdk/` | Apache-2.0 | **Freely forkable wrapper layer** |
| `src/wasm/soil_core.rs` | **Apache-2.0** (file header) | WASM kernel source legally reusable |
| `contracts/stylus-probe/` | Verify per crate | Stylus = V2.0 roadmap probe |

**Typical competitor strip path:**

1. Fork → remove `SilverVine` strings and BUSL headers (illegal but common)
2. Keep `risk-engine-core.ts` + adapters + tests as executable spec
3. Drop honeypot hosts and layout-metric unlock
4. Re-ship as branded "pre-execution risk gateway"

**Estimated effort:** Skilled team 2–4 weeks for functional parity (excluding mainnet ops and Dune/grant narrative).

---

## 3. WASM vs. TypeScript Boundary Recommendations

### 3.1 Current Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ Edge Hot Path (Worker)                                       │
├─────────────────────────────────────────────────────────────┤
│ risk-engine-soil.ts ──► risk-control-lib/soil-resistance.ts │  ← primary (TS)
│ risk-engine-core.ts (bitmask evaluate*Flags)                 │  ← primary (TS)
│ pkg/soil_core.wasm (soil_core_eval)                          │  ← narrow subset (optional)
│ stylus_core.rs (check_soil_resistance_stylus)                │  ← V2.0 probe only
└─────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │                              │
   Adapters (TS)                  RPC / JSON / viem
   gmx-v2-invariants.ts           hyperliquid-session-guard.ts
   variational-rfq-adapter.ts     wayfinder-shield.ts ...
```

**Key findings:**

- `checkSoilResistance()` hot path is **TypeScript** (`risk-engine-soil.ts` wrapping `soil-resistance.ts`).
- `soil_core.wasm` implements only slippage/depth/session-clip subset (`src/wasm/soil_core.rs`, ~100 LOC).
- `stylus_core.rs` thresholds **drift** from `risk-engine-limits.ts` (e.g. Stylus `MAX_SLIPPAGE_BPS=25` vs TS Uniswap V3 `50`).
- Variational is adapter-only with **zero WASM exposure**.

### 3.2 Compile to Closed-Source WASM Kernel

| Module | Rationale | Priority |
|--------|-----------|----------|
| All `evaluate*Flags` + `packProtocolLane` in `risk-engine-core.ts` | Core invariant math; hardest to reverse | **P0** |
| `risk-engine-limits.ts` numeric constants | Bundle with flags; prevents threshold fork | **P0** |
| `pending-exposure-window.ts` accumulator | Split-payload defense is core IP | **P1** |
| `soil-resistance-math.ts` packed lane eval | WASM prototype exists; extend to full soil | **P0** |
| `root-protection.ts` Max SL decision | Dynamic SL formula is brand SSOT | **P1** |
| `risk-severance.ts` auto-sever decision | WASM decides; TS executes side effects | **P2** |
| `soil-threshold-jitter.ts` | Closed seed/algorithm strengthens MEV defense | **P2** |
| `evaluateGatewayRules` + `PAYLOAD_POISON` | Gateway poison logic should not be plaintext | **P1** |

**WASM ABI recommendation:** Fixed `Float64Array` layout (align with `PROTO_VECT_LEN=24`), single FFI call within **< 0.014ms** budget:

```text
in:  [protocol_lane×6, soil_lane×8, policy_vector×4]  → 64–96 f64
out: [trip_flags u32, sever_flags u32, reasons_hash u64, ...]
```

### 3.3 Must Remain Open TypeScript

| Module | Rationale |
|--------|-----------|
| All `src/adapters/**` | JSON parsing, viem, HL WS, EIP-712, volatile protocol APIs |
| `variational-rfq-adapter.ts` | Business payload parsing; core compare can WASM, adapter only encodes |
| `risk-engine-soil.ts` fast-path routing | I/O gates (sequencer, gas guard) depend on fetch/Date |
| `state-store.ts` / `systemState` | Side effects bound to Cloudflare KV |
| `decorator.ts` / agent frameworks | Integration layer; Apache SDK already public |
| Demos / examples / tests | Reproducibility for grant diligence |

**FFI latency rule:** **One** WASM call per intent; no per-field round-trips. Adapters pre-pack `Float64Array`; WASM returns bitmask; TS only sever + log.

### 3.4 License Consistency Warning

`soil_core.rs` is currently **Apache-2.0**, inconsistent with BUSL main repo. If WASM is the closed moat:

1. Move Rust kernel to a private crate
2. Distribute only embedded `.wasm` binary in Worker
3. Align BUSL or commercial license on kernel artifacts

---

## 4. Baseline Definition — Parameter Decoupling

### 4.1 Current State

| Layer | Parameter location | Issue |
|-------|-------------------|-------|
| Core protocols | `src/core/risk-engine-limits.ts` | Good SSOT |
| Variational | `variational-rfq-adapter.ts` top-level constants | Not in limits |
| Uniswap/Aave/Morpho | `*-constants.ts` + limits dual export | Partial duplication |
| Phase 2 (Spark/Fluid/USD.AI/D2) | Spec-only in `docs/internal/` | Not in `risk-engine-limits.ts` yet |
| Soil | `soil-resistance-types.ts` | `MAX_SLIPPAGE`, `MIN_DEPTH_USD` |
| Stylus | `stylus_core.rs` hardcoded | **Drifts from TS** |
| Runtime jitter | `soil-threshold-jitter.ts` | Input-driven, not manifest-driven |

### 4.2 Recommended: Three-Layer Parameter Model

```text
Layer A — PolicyManifest (versioned JSON / KV / DO)
  ├─ profileId: "arbitrum-v1" | "grant-demo" | "institutional"
  ├─ limits: { gmx: {...}, variational: { quoteMaxAgeMs: 500, ... } }
  └─ semver + checksum

Layer B — WASM Policy Slot (frozen at compile)
  ├─ default manifest hash embedded in .wasm
  └─ hot reload replaces manifest only — no core recompile

Layer C — Adapter Overlay (TS, per-protocol)
  └─ protocol-specific parsing only; numeric limits from Manifest
```

**Implementation notes:**

1. Define `RiskPolicyManifest` (extend patterns from `src/core/types.ts`; avoid redundant types)
2. `evaluate*Flags(vec, manifest)` or write manifest into `Float64Array` tail slots
3. Migrate Variational constants: `quoteMaxAgeMs`, `priceDeviationMaxBps`, `olpDepthMaxUtilization`
4. CI gate: Stylus / `soil_core` / TS limits **tri-party parity** (extend `tests/wasm/stylus-soil-wasm.test.ts`)
5. `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` for judge-reproducible venue proofs

### 4.3 Recompile Matrix

| Change type | WASM rebuild required? |
|-------------|------------------------|
| Variational 30bps → 25bps | **No** (manifest only) |
| New 8th protocol bit | **Yes** (ABI change) |
| Phase 2 quad-protocol expansion (bits 14–21) | **Yes** (`PROTO_VECT_LEN` 24 → 40) |
| Jitter ±2–5 → ±3–7 | **No** (manifest) |
| New trap host | **No** (TS defense layer) |

---

## 5. Module Inventory — Quick Reference

### 5.1 Core Risk Call Chain

```text
Adapter → evaluateGatewayRules / checkSoilResistance
       → risk-engine-core (bitmask)
       → risk-severance → state-store.severSigningChannel()
       → vineWrapProtection (R17/R20 per-trade)
       → checkCircuitBreaker (R17 daily)
```

### 5.2 OpSec Test Coverage

| Test file | Scope |
|-----------|-------|
| `tests/v09/opsec-boundary.test.ts` | Public surface import / JSON leak guard |
| `tests/defense/rpc-whitelist.test.ts` | Honeypot behavior |
| `tests/core/risk-severance.test.ts` | Auto sever on bitmask trips |

---

## 6. Prioritized Recommendations

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | Migrate `risk-engine-core` + limits into private WASM, single FFI | Anti-fork **+3** | 2–3 weeks |
| 2 | Introduce `RiskPolicyManifest` + KV hot-load | Tune without recompile | 1 week |
| 3 | Tri-party parity CI (Stylus / TS / WASM) | Prevent threshold drift | 3 days |
| 4 | WASM crate → BUSL; stop distributing Apache kernel source | License alignment | 1 day |
| 5 | Variational → manifest + optional `FLAGS_VARIATIONAL_*` bit | Architectural unity | 2 days |
| 6 | Runtime honeypot hosts (hashed + env salt) | Raise grep bypass cost | 1 week |
| 7 | Remove TS fallback sim on production hot path (`soil-core-sim.ts`) | Block "WASM-less full TS" forks | 2 days |

---

## 7. Conclusion

`bedelta-citadel-core` is a **strong engineering baseline** (840 passed tests, 7 protocols, 70.16 KiB Worker) but **moderate anti-fork posture** — relying on BUSL and integration depth rather than a closed mathematical kernel. WASM strategy should target:

- **Closed:** bitmask invariants, soil math, Max SL, pending OI, gateway poison
- **Open:** adapters, RPC, agent SDK, demo CLI
- **Configurable:** `RiskPolicyManifest` decouples 30bps / 15% OLP etc. from core recompile

---

## 8. Phase 2 Risk Specification — Spark, Fluid, USD.AI, D2 Finance

> **Classification:** Internal reserve only. **Do not** surface in `README.md`, `JUDGE_BRIEF.md`, or `SUBMISSION.md`.  
> **Cross-ref:** [`CAPITAL_LOOPS_TOPOLOGY.md`](./CAPITAL_LOOPS_TOPOLOGY.md) §5.

### 8.1 Spark Protocol

| Risk vector | Invariant | Draft constant | Auto-sever bit |
|-------------|-----------|----------------|----------------|
| USDS peg deviation | $\|\text{Price}_{\text{USDS}} - 1\| > 50\,\text{bps}$ | `SPARK_USDS_DEPEG_MAX_BPS = 50` | `FLAG_SPARK_USDS_DEPEG` (`1 << 14`) |
| SparkLend HF (Aave-v3 class) | $\text{HF} < 1.15$ fail-closed | `SPARK_HF_MIN = 1.15` | `FLAG_SPARK_HF_LOW` (`1 << 15`) |
| Savings-rate oracle staleness | age $> 3{,}600{,}000\,\text{ms}$ | `SPARK_ORACLE_MAX_AGE_MS` | folded into HF lane |

**OpSec note:** Spark reuses Aave V3 liquidation math — fork competitors may alias `evaluateAaveFlags` with minimal changes. Phase 2 should **not** share a single evaluator; distinct `evaluateSparkFlags` prevents trivial strip.

### 8.2 Fluid Protocol

| Risk vector | Invariant | Draft constant | Auto-sever bit |
|-------------|-----------|----------------|----------------|
| Correlated L+D liquidation | util $> 85\%$ ∧ HF $< 1.25$ | `FLUID_CORRELATED_UTIL_MAX = 0.85` | `FLAG_FLUID_CORRELATED_LIQ` (`1 << 16`) |
| In-layer DEX slippage | slippage $> 50\,\text{bps}$ | `FLUID_SLIPPAGE_MAX_BPS = 50` | `FLAG_FLUID_SLIPPAGE` (`1 << 17`) |
| HF cascade velocity | $\Delta\text{HF}/\Delta t > 0.08$/block | `FLUID_HF_CASCADE_DELTA = 0.08` | folded into correlated lane |

**OpSec note:** Fluid is the highest Phase 2 replication value — unified liquidity layer guards are not present in the public 7-protocol matrix. Prioritize WASM closure for `evaluateFluidFlags` before public adapter ship.

### 8.3 USD.AI

| Risk vector | Invariant | Draft constant | Auto-sever bit |
|-------------|-----------|----------------|----------------|
| GPU RWA oracle timestamp | valuation age $> 7{,}200{,}000\,\text{ms}$ | `USDAI_ORACLE_MAX_AGE_MS = 7_200_000` | `FLAG_USDAI_ORACLE_STALE` (`1 << 18`) |
| sUSDai peg drift | $\|\text{Price}_{\text{sUSDai}} - 1\| > 30\,\text{bps}$ | `USDAI_PEG_DRIFT_MAX_BPS = 30` | `FLAG_USDAI_PEG_DRIFT` (`1 << 19`) |
| NAV vs GPU mark | deviation $> 50\,\text{bps}$ | `USDAI_NAV_DEVIATION_MAX_BPS = 50` | folded into peg lane |

**OpSec note:** Off-chain GPU valuation is a novel oracle surface — adapter must enforce `rpc-whitelist.ts` host allowlist before any valuation fetch. No plaintext GPU API keys in adapter layer.

### 8.4 D2 Finance

| Risk vector | Invariant | Draft constant | Auto-sever bit |
|-------------|-----------|----------------|----------------|
| Structural vault share slippage | share deviation $> 30\,\text{bps}$ | `D2_SHARE_SLIPPAGE_MAX_BPS = 30` | `FLAG_D2_SHARE_SLIPPAGE` (`1 << 20`) |
| Execution bound | notional $> 10\%$ vault TVL | `D2_EXEC_BOUND_TVL_RATIO = 0.10` | `FLAG_D2_EXEC_BOUND` (`1 << 21`) |
| Structural delta shock | $\|\Delta\delta\| > 0.15$ | `D2_DELTA_SHOCK_MAX = 0.15` | folded into slippage lane |

**OpSec note:** Morpho Blue adapter (`evaluateMorphoFlags`) is the closest public analog for oracle-age guards; D2 share-slippage logic is net-new and should land in WASM P0 batch with Fluid correlated guard.

### 8.5 Phase 2 Bitmask & ABI Impact

```text
Current shipped:  bits 0–13  (14 flags) · PROTO_VECT_LEN = 24 (6 lanes × 4)
Phase 2 reserve:  bits 14–21 (8 flags) · PROTO_VECT_LEN → 40 (10 lanes × 4)
FLAGS_AUTO_SEVER_MASK expansion requires risk-severance.ts audit
```

| # | Action | Impact |
|---|--------|--------|
| 8 | Spec → `risk-engine-limits.ts` draft constants (feature-gated) | Manifest-ready |
| 9 | `PROTO_VECT_LEN` ABI bump + WASM FFI regen | **Yes** — blocks silent fork |
| 10 | Per-protocol adapter stubs under `src/adapters/{spark,fluid,usd-ai,d2}/` | Test moat +2/protocol |
| 11 | Internal-only `pnpm demo:phase2` (never in public docs) | DX isolation |

---

*SilverVine Labs · Internal OpSec · Not for public distribution*
