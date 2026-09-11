# Pre-Consensus Chaos Sandbox Audit — 2026-09-11

> **Vitest SSOT:** 225 test files | 1052 PASS clean (100% PASS)
> **Auditor:** Cursor CEO / Chief Engineering Officer (Ask-mode inspection)
> **Scope:** Arbitrum Open House Buildathon — sponsor chaos sandbox readiness

## Verdict

| Item | Status |
|------|--------|
| `computeEffectiveMaxSlUsd` = Equity×0.01+100 | ✅ SSOT confirmed (`src/services/effective-max-sl.ts`) |
| `tests/chaos/arbitrum-sponsor-chaos.test.ts` | ❌ Not present (pre-implementation) |
| `nested_decode.rs` | ❌ Not present (pre-implementation) |
| GMX/Pendle/Session/Gas pure test anchors | ✅ Exist — signatures differ from Grok draft |
| 1052 PASS regression risk | ✅ Low if chaos file is additive-only |

## Key Signature Corrections (vs Grok draft)

1. `collectGmxGmRiskInvariantErrors(ctx, wire)` — ctx first, not `(fee, min, ctx)`.
2. Session layers: `SESSION_KEY_CLIP_USD=$30` vs `SESSION_KEY_NOTIONAL_CAP_USD=$5000`.
3. `computeOrderAwareMaxSlUsd` tightens small orders — chaos Robinhood case must use `computeEffectiveMaxSlUsd`.
4. Stylus <15µs claim belongs in `cargo test`, not Vitest.

## Minimal Implementation Plan

- ADD `tests/chaos/arbitrum-sponsor-chaos.test.ts` (~110 LOC, pure imports, no RPC)
- ADD `contracts/citadel_invariants/src/nested_decode.rs` + `lib.rs` mod export
- Targeted test: `npx vitest run tests/chaos/arbitrum-sponsor-chaos.test.ts`
- Dune: extend existing `RiskTripBlocked` SQL spec (Query C0/C1), Sepolia live / 42161 copy-ready

## Sponsor Lane Mapping

| Vector | SSOT Function | Test Pattern |
|--------|---------------|--------------|
| ZeroDev/Robinhood | `verifySessionKeyValidity` + `evaluateSponsoredGasLimits` | expired key + gas exceeded |
| GMX V2 | `collectGmxGmRiskInvariantErrors` | fee/slippage/pool imbalance |
| Pendle | `evaluatePendleGmxCrossGuard` | near-expiry FAIL_CLOSED_BLOCK |
| ArbOS L1 | `estimateL1SurchargeWei` + `evaluateGasSurcharge` | calldata bloat >30% yield |
| Stylus nested | `decode_nested_fail_closed` | Rust zero-alloc TLV, TS mirror in chaos test |

## Post-Implementation Note

Executed in Agent mode on 2026-09-11: audit log, `nested_decode.rs`, chaos Vitest sandbox (additive-only).

| Check | Result |
|-------|--------|
| `npx vitest run tests/chaos/arbitrum-sponsor-chaos.test.ts` | **5/5 PASS** |
| `cargo test nested` (Stylus crate) | Blocked in CI host — `rustc 1.87` vs `trybuild@1.0.121` requires `1.88` |
| Existing test edits | **None** — additive-only diff |

## Rename (Option B — 2026-09-11)

| Before | After |
|--------|-------|
| `tests/chaos/arbitrum-sponsor-chaos.test.ts` | `tests/chaos/orbit-agentic-failclosed-chaos.test.ts` |

Targeted verify: `npx vitest run tests/chaos/orbit-agentic-failclosed-chaos.test.ts`
