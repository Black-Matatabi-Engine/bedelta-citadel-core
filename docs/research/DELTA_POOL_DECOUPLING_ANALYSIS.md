# Delta Pool / Hedging Engine Decoupling — Research Draft

**Date:** 2026-09-11  
**Branch:** `feat/delta-pool-decouple-research`  
**Author:** SilverVine Protocol Research & OpSec Matrix  
**SSOT Baseline:** 226 test files | 1057 PASS clean | 0 TypeScript errors (verified on branch creation)  
**Status:** Read-only research — no production code changes in this branch

---

## 1. Executive Summary

This document evaluates decoupling the **Delta Pool / Delta-Neutral Hedging Engine** from the Buildathon submission narrative, isolating it as a **Plug-and-Play Yield Module (V1.5)** while retaining a hyper-focused pitch on:

| Core Module | Scope | Buildathon Role |
|-------------|-------|-----------------|
| **Module A** | EIP-1193 Retail Guard SDK (`@slivervine/eip1193-agentic-wallet-guard`) | Pre-consensus 0-Gas security firewall |
| **Module B** | Treasury Escort Adapter (`treasury-escort-router.ts`) | Institutional compliance ingress (46630/4663 → 42161) |

**Verdict (research-only):** Decoupling is **architecturally feasible** with minimal Tier 0 / Tier 1 regression risk. The Delta Pool stack is already isolated behind service boundaries (`src/services/yield/*`, `src/services/gmx-cross-wallet-hedge*`, `src/scheduled-gmx-hedge*`) and does not participate in the Retail Guard hot path (`checkSoilResistance` → `rootProtection` → EIP-1193 severance).

---

## 2. Current Delta Pool / Hedging Topology

### 2.1 Philosophy Anchor (BeΔ)

The **Δ (Delta)** in BeDelta Living Water denotes **market delta-neutrality** — long GMX GM exposure hedged by Hyperliquid 1× short. This is documented in `01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md` and `05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md` §2.6 (8.2–11.8% APY range from exogenous DN cash flows).

### 2.2 Layer Map

```text
┌─────────────────────────────────────────────────────────────────┐
│ V1.5 Yield Module (DECOUPLE TARGET)                              │
│                                                                  │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐ │
│  │ GMX v2 GM    │◄──►│ delta-neutral-   │◄──►│ HL 1× Short  │ │
│  │ Pool (42161) │    │ calculator.ts    │    │ (session key)│ │
│  └──────────────┘    └────────┬─────────┘    └──────────────┘ │
│                               │                                  │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │ gmx-cross-wallet-hedge* · scheduled-gmx-hedge-cron        │  │
│  │ yield/* (rebalance-rules · auto-compound · balancer)      │  │
│  │ worker-cron-entry.ts (isolated hedge Worker)              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼ (soil gate only — not hot path)
┌─────────────────────────────────────────────────────────────────┐
│ Buildathon Core (RETAIN)                                         │
│                                                                  │
│  Module A: EIP-1193 Retail Guard SDK                             │
│  Module B: Treasury Escort Adapter                               │
│  Pillar Set Y: soil_core Wasm · rootProtection · venue guards    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Primary Source Files (Delta Pool / Hedging)

| Layer | File(s) | Role |
|-------|---------|------|
| **Pure math** | `src/core/delta-neutral-calculator.ts` | 0-Δ sizing: `computeDeltaNeutralHedgeOrder()` · slippage limit |
| **GMX delta reader** | `src/services/gmx-eth-delta.ts` · `src/services/adapters/gmx-v2-live-delta-reader.ts` | Live on-chain GM pool ETH delta for Wallet B |
| **Cross-wallet hedge** | `src/services/gmx-cross-wallet-hedge*.ts` (6 files) | GMX Wallet B delta → HL Wallet A ETH perp short |
| **Scheduled cron** | `src/scheduled-gmx-hedge.ts` · `src/scheduled-gmx-hedge-lib/*` | Cron tick: drift detection · rebalance · flash unwind |
| **HL auto-hedge** | `src/services/hl-auto-hedge.ts` · `src/services/hl-auto-hedge-status.ts` | Session-key hedge dispatch |
| **Yield engine** | `src/services/yield/*` (11 files) | Rebalance rules · auto-compound · GMX balancer · cross-spread |
| **Yield router** | `src/services/yield-router-lib/yield-router-triangle.ts` | Multi-wallet yield triangle routing |
| **Portfolio cascade** | `src/core/portfolio-cascade-core.ts` | DN portfolio replay / cascade legs |
| **Grant audit proof** | `src/routes/grant-audit-lib/grant-audit-zero-delta.ts` | Zero-delta proof for `GET /api/grant-audit` |
| **Cron Worker** | `src/worker-cron-entry.ts` | Isolated deploy (`wrangler.cron.toml`) — hedge tick only |
| **Scripts** | `scripts/hedge-gmx.ts` · `scripts/grant-e2e-citadel-demo.ts` | CLI hedge + 4-step E2E lifecycle demo |

### 2.4 Hyperliquid Short Adapter (Hedge Leg)

The HL session-key adapter (`src/adapters/hl/*`) serves **dual roles**:

| Role | Buildathon Tier | Decouple? |
|------|-----------------|-----------|
| **Venue guard** (`evaluateHyperliquidSessionGuard`) | **Tier 1** — `pnpm demo:hl -- --trip` | **Retain** |
| **Hedge execution** (`executeHlSessionKeyOrder` via cross-wallet hedge) | Sovereign Vault / E2E only | **Defer to V1.5** |

The guard layer and execution layer are already separated at the adapter boundary — decoupling does not require removing HL from the 5-Core Venue Matrix.

---

## 3. Simplified Value Proposition (Core Guard Only)

### 3.1 Before (Current Full Stack)

> "SliverVine is a delta-neutral yield protocol with a pre-consensus security firewall, 5-venue adapters, and institutional treasury escort."

**Judge cognitive load:** High — must understand DN math, dual-wallet topology, yield hurdle gates, AND Wasm reflex arc.

### 3.2 After (Decoupled Pitch)

> "SliverVine Citadel Shield is an **EIP-1193 Edge-Wasm pre-consensus security primitive** for AI agent wallets and retail users on Arbitrum — with an optional **institutional compliance ingress escort** (Module B)."

**Judge cognitive load:** Low — 90-second demo path: `demo:eip1193` → `demo:gmx -- --trip` → `demo:escort`.

### 3.3 What We Lose in Narrative (Acceptable for Buildathon)

| Removed from pitch | Impact | Mitigation |
|--------------------|--------|------------|
| 8.2–11.8% APY range | Grant financial narrative weakened | Reframe as "V1.5 Yield Module roadmap" |
| Dual-wallet (A/B) topology | Sovereign Vault story simplified | Keep Wallet addresses in appendix only |
| `pnpm demo:e2e` 4-step lifecycle | E2E macro demo dropped from express path | Retain in `PRODUCTION_WORKFLOW_DEEP_DIVE.md` |
| Cron hedge Worker | No live rebalance telemetry | Document as V1.5 ops surface |

### 3.4 What We Gain

| Gain | Mechanism |
|------|-----------|
| **Laser focus on innovation moat** | 7 EIP/ERC standards (7683/7702/7710 + 8196/8226/8079) without yield distraction |
| **Faster judge verification** | Tier 0 + Tier 1 complete in <5 minutes |
| **Reduced OpSec surface** | No session-key live signing in demo path |
| **Cleaner SDK story** | `@slivervine/eip1193-agentic-wallet-guard` as standalone npm product |

---

## 4. Tier 0 / Tier 1 — Active Code Paths After Decoupling

### 4.1 Tier 0 — EIP-1193 Retail Guard SDK (100% Retained)

| Entrypoint | Test Anchor | Status |
|------------|-------------|--------|
| `pnpm demo:eip1193` | Interactive CLI A–D matrix | **Active** |
| `npx vitest run tests/sdk/retail-guard-provider.test.ts` | **35/35 PASS** | **Active** |
| `npx vitest run tests/sdk/erc7683-intent-guard.test.ts` | **3/3 PASS** | **Active** |
| `npx vitest run tests/sdk/eip7702-auth-guard.test.ts` | **3/3 PASS** | **Active** |
| `npx vitest run tests/services/api/erc7710-intent-expiry.test.ts` | **2/2 PASS** | **Active** |

**Hot path (unchanged):** `withRetailGuardProvider()` → `evaluateRetailRisk()` → `checkSoilResistance()` → `rootProtection()` → fail-closed or passthrough.

### 4.2 Tier 1 — 5-Core Venue FAIL_CLOSED Proofs (100% Retained)

| Demo | Venue Guard | Delta Pool Dependency |
|------|-------------|----------------------|
| `pnpm demo:gmx -- --trip` | GMX soil + payload guard | **None** — guard-only |
| `pnpm demo:hl -- --trip` | HL session-key guard | **None** — guard-only |
| `pnpm demo:variational -- --trip` | RFQ stale quote guard | **None** |
| `pnpm demo:perp-loop -- --trip` | Loop A R20 severance | **None** — uses venue guards |
| `pnpm demo:spot-loop -- --trip` | Loop B USD.ai lane | **None** |

### 4.3 Module B — Treasury Escort (100% Retained)

| Entrypoint | Test Anchor | Status |
|------------|-------------|--------|
| `pnpm demo:escort` | Unidirectional bridge · `lostUsd ≡ 0` | **Active** |
| `npx vitest run tests/adapters/treasury-escort-router.test.ts` | Escort quote + size gates | **Active** |
| `npx vitest run tests/adapters/across-ingress-bridge.test.ts` | AML inbound block | **Active** |

### 4.4 Deferred to V1.5 (Not Required for Buildathon Tier 0/1)

| Entrypoint | Current Role | Decouple Action |
|------------|--------------|-----------------|
| `pnpm demo:e2e` | 4-step DN capital lifecycle | Move to V1.5 docs · optional appendix |
| `worker-cron-entry.ts` | Live GMX↔HL hedge cron | Deploy flag `ENABLE_HEDGE_CRON=false` |
| `GET /api/grant-audit` zero-delta proof | Sovereign Vault telemetry | Retain endpoint · mark DN fields as V1.5 |
| `scripts/hedge-gmx.ts` | Manual hedge CLI | Archive to `scripts/v1.5/` |

---

## 5. Proposed Cut Lines (File-Level)

### 5.1 V1.5 Yield Module Package (Isolate, Do Not Delete)

```
src/core/delta-neutral-calculator.ts          # Pure math — zero deps on guard hot path
src/services/gmx-eth-delta.ts
src/services/adapters/gmx-v2-live-delta-reader.ts
src/services/gmx-cross-wallet-hedge*.ts       # 6 files
src/scheduled-gmx-hedge*.ts                   # Cron + drift
src/services/hl-auto-hedge.ts
src/services/yield/*                            # 11 files
src/services/yield-router-lib/*
src/core/portfolio-cascade-core.ts
src/worker-cron-entry.ts
scripts/hedge-gmx.ts
scripts/grant-e2e-citadel-demo.ts
```

### 5.2 Buildathon Core (No Changes Required)

```
src/sdk/eip1193-agentic-wallet-guard/*        # Module A
src/adapters/robinhood/treasury-escort-router.ts  # Module B
src/core/soil-resistance-core.ts
src/core/root-protection-core.ts
src/core/wasm-soil-ffi.ts
src/adapters/gmx/*                            # Venue guards (not hedge execution)
src/adapters/hl/*                             # Session-key guards (not hedge execution)
pkg/soil_core.wasm
```

### 5.3 Shared Boundary (Retain, Document Interface)

| Shared Module | Used By Core | Used By Yield | Decouple Strategy |
|---------------|-------------|---------------|-------------------|
| `checkSoilResistance()` | Retail Guard · venue demos | Hedge cron soil gate | **Retain** — single Wasm SSOT |
| `buildLiveHedgeSoilInput()` | — | Cross-wallet hedge | **Move** to V1.5 package |
| `shadow-margin-guard.ts` (Pendle) | Pendle Shield API | GMX+HL composite | **Retain** — guard API, not yield execution |
| HL `session-key-executor.ts` | Guard trip demos | Live hedge dispatch | **Split** guard vs execution exports |

---

## 6. Test Suite Impact Analysis

### 6.1 Tests Directly Bound to Delta Pool / Hedging

| Test File | Tests | Decouple Impact |
|-----------|-------|-----------------|
| `tests/services/scheduled-gmx-hedge.test.ts` | Cron drift · rebalance | **Defer** to V1.5 CI lane |
| `tests/services/hl-auto-hedge.test.ts` | Cross-wallet hedge dispatch | **Defer** |
| `tests/services/gmx-v2-balancer.test.ts` | GMX balancer qualification | **Defer** |
| `tests/services/auto-compound-liq-meter.test.ts` | Auto-compound rules | **Defer** |
| `tests/services/native-earn-hurdle.test.ts` | DN hurdle gate | **Defer** |
| `tests/services/dual-wallet-structured-log.test.ts` | Hedge telemetry | **Defer** |
| `tests/services/cross-spread.test.ts` | Cross-venue spread | **Defer** |
| `tests/hyperliquid-position-health.test.ts` | DN position health | **Defer** |
| `tests/core/portfolio-cascade-replay.test.ts` | Portfolio cascade | **Defer** |
| `tests/e2e-financial-accounting.test.ts` | E2E accounting | **Defer** |
| `tests/api/grant-audit-zero-trust.test.ts` | Zero-delta proof | **Partial** — retain grant-audit, stub DN fields |

**Estimated deferred test count:** ~15–25 test files (~60–80 individual tests).  
**Buildathon Tier 0/1 regression:** **0 impact** — all 48 SDK tests + venue trip demos remain green.

### 6.2 Full Suite Integrity (This Branch)

Baseline verification on `feat/delta-pool-decouple-research` (no code changes):

```bash
pnpm test -- --run
# Observed: 226 test files | 1057 PASS clean (100%)
```

Decoupling implementation (future branch) should introduce a `vitest.workspace` split:

| Workspace | Scope | Gate |
|-----------|-------|------|
| `citadel-core` | Module A + B + venue guards | **Buildathon CI** — must be 100% PASS |
| `yield-v1.5` | Delta Pool / Hedging Engine | **Nightly CI** — non-blocking for submission |

---

## 7. Buildathon Narrative Rewrite (Draft Bullets)

### 7.1 README / JUDGE_BRIEF Headline Shift

| Current | Proposed |
|---------|----------|
| "Delta-Neutral yield protocol with pre-consensus firewall" | "EIP-1193 Edge-Wasm pre-consensus security primitive for Arbitrum" |
| "5-Venue + DN hedge triangle" | "5-Venue guard matrix + optional institutional escort" |
| "8.2–11.8% APY" | "V1.5 Yield Module roadmap (DN engine deferred)" |

### 7.2 90-Second Judge Demo Path (Decoupled)

```bash
pnpm demo:eip1193 -- --trip          # 30s — Core Module A
pnpm demo:gmx -- --trip              # 15s — Venue guard proof
pnpm demo:escort                     # 15s — Core Module B
npx vitest run tests/sdk/            # 30s — 48/48 SDK PASS
```

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Judges expect yield/APY story | Medium | Appendix slide: "V1.5 Plug-and-Play Yield Module" with DN architecture diagram |
| `demo:e2e` removed from express path | Low | Keep in `PRODUCTION_WORKFLOW_DEEP_DIVE.md` for grant deep-dive |
| Shared `checkSoilResistance` coupling | Low | Soil gate is guard primitive — hedge cron is consumer, not owner |
| Test count drop in headline | Low | Report **citadel-core** workspace count separately (est. ~200 files / ~970 PASS) |
| Internal docs still reference Δ | Low | Batch update `01_SYSTEM_TOPOLOGY` philosophy section — Δ becomes V1.5 subtitle |

---

## 9. Recommended Next Steps

| Priority | Action | Owner |
|----------|--------|-------|
| **P0** | OpSec sign-off on decoupled pitch vs full-stack pitch | Javier / 蘇若晴 |
| **P1** | Create `feat/delta-pool-v1.5-extract` — move yield files to `packages/yield-module/` | Engineering |
| **P1** | Split `vitest.workspace.ts` — `citadel-core` vs `yield-v1.5` | CI |
| **P2** | Rewrite `README.md` / `JUDGE_BRIEF.md` headline for Core Guard Only | DevRel |
| **P2** | Update `VERIFICATION_MATRIX.md` — demote `demo:e2e` to appendix tier | Docs |
| **P3** | Archive DN APY tables to `docs/architecture/05_RISK_MITIGATION` V1.5 appendix | Docs |

---

## 10. Conclusion

Decoupling the Delta Pool / Hedging Engine is **low-risk and high-clarity** for the Buildathon submission:

1. **Module A (EIP-1193 Retail Guard)** and **Module B (Treasury Escort)** are already architecturally isolated from yield execution paths.
2. **Tier 0 / Tier 1 verification** requires zero changes — all demo scripts and test anchors remain valid.
3. The Delta Pool stack maps cleanly to a **V1.5 Plug-and-Play Yield Module** without deleting production code.
4. The simplified pitch amplifies the **7-EIP Standards Moat** (ERC-7683 / EIP-7702 / ERC-7710 + core 4) without yield narrative dilution.

**Research recommendation:** Proceed with decoupled **Core Guard Only** pitch for 9/14 Buildathon; retain full DN stack on `feat/delta-pool-v1.5-extract` for post-grant yield productization.

---

*SilverVine Labs · Internal Research · `feat/delta-pool-decouple-research` · DO NOT PUBLISH NATIVELY*
