# ExoMesh Production Scenario Catalog

> Judge appendix — **not** a payment rail. All paths are **pre-sign / pre-sequencer**. 
> Core four (A–D) live in [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md). This file lists additional verified vectors. 
> **SSOT:** Vitest **244 test files | 1126 PASS** · **Zero-Allocation Hot-Path** / **Zero-GC Heap Delta (<16 KiB)** · **ZeroDev Kernel v3 AA Ready (Default ON in macro lifecycle)** (`pnpm demo:delta-neutral`) · **SEPSB:** [`SEPSB_BENCHMARK_SSOT.json`](../audit/SEPSB_BENCHMARK_SSOT.json)

**Wasm SSOT:** `pkg/soil_core.wasm` · `tests/wasm/stylus-soil-wasm.test.ts`

---

## SliverVine ExoMesh Pre-Consensus Security Benchmark (SEPSB)

| Metric | Target | Achieved (SSOT) |
|--------|--------|-----------------|
| True Positive Rate (TPR) | ≥ 99.5% | **100%** |
| False Positive Rate (FPR) | ≤ 0.5% | **0%** |
| Reflex Latency (p50) | ≤ 20µs | **0.233µs** (Wasm) |

**Data provenance (verification CLI):**

| Metric lane | Source command |
|-------------|----------------|
| **Wasm Reflex Latency** | `pnpm build:wasm` · `npx vitest run tests/clock-monotonicity.test.ts` |
| **5-Venue TPR / FPR** | `pnpm test -- --run` (**244 test files \| 1126 PASS**) |

---

## A+ — Wallet wrap extras (beyond Permit2)

| Scenario | File |
|----------|------|
| EIP-7702 malicious / unlisted implementation · **ZeroDev Kernel v3 AA Ready (Default ON in macro lifecycle)** | `tests/sdk/eip7702-auth-guard.test.ts` · `pnpm demo:delta-neutral` |
| Prompt injection / session-key clip / Gate attestation tamper | [`tests/sdk/exomesh-sdk-intent.test.ts`](../../tests/sdk/citadel-sdk-intent.test.ts) |
| Venue drift (GMX-approved agent → Pendle) | `tests/core/intent-drift.test.ts` |
| EIP-6963 fallback wrap · transport bitmark fail-closed | `tests/sdk/retail-guard-provider.test.ts` |
| Soil trip → 0-Gas Permit2 expiry signal (ERC-7710) | `tests/services/api/erc7710-intent-expiry.test.ts` |
| `withExoMeshShield` cooldown / `MANDATORY_COOLDOWN_ACTIVE` | `tests/sdk/decorator.test.ts` |

## B+ — Venue extras

| Venue | Scenario | File |
|-------|----------|------|
| GMX | Reserve &lt;105% · OI imbalance · `severSigningChannel` · reduceOnly haircut | `gmx-v2-invariants.test.ts` · `gmx-v2-order-guards.test.ts` · `risk-severance.test.ts` |
| Pendle | Oracle stale · PT &lt;7d + 200bps · pool-factory drift · shadow-margin / auto-roll | `pendle-market-oracle.test.ts` · `pendle-pt-expiry-guard.test.ts` · `pendle-shield.test.ts` · `pendle-gmx-cross-guard.test.ts` |
| USD.ai | Depeg · oracle lag · clock skew &gt;30s | `usdai-adapter.test.ts` |
| HL | WS stale / &gt;200ms · HIP-3 settlement lock | `websocket-soil.test.ts` · `rwa-settlement-lock.test.ts` |
| Variational | OLP &gt;15% · closed hours · carry / funding vol | `variational-rfq-adapter.test.ts` · `variational-instrument-guard.zero.test.ts` |
| Cross | Dual-venue depth miss · HKT tsunami window · soil jitter ±2–5 bps | `soil-coverage-edges.test.ts` · `soil-threshold-jitter.test.ts` |

## C+ — Infra / chaos extras

| Scenario | File |
|----------|------|
| Cross-venue slippage &gt;0.5% breaker | `soil-circuit-breaker.test.ts` |
| CRI hardlock 403 | `session-cap.test.ts` |
| 255-case chaos matrix | `chaos-blackswan-stress.test.ts` |
| Orbit: expired session+gas cap · ArbOS calldata tax · Stylus `FLAG_TOXIC` | `orbit-agentic-failclosed-chaos.test.ts` |
| Soil bypass forbid · Zero-Allocation Hot-Path / Zero-GC Heap Delta (<16 KiB) / 10k | `soil-bypass-forbid.test.ts` · `intent-sinking-audit.test.ts` |
| Flash unwind / nonce heal | `flash-unwind.test.ts` · `nonce-auto-healing.test.ts` |

## D+ — Sanctuary extras

| Scenario | File |
|----------|------|
| In-flight bridge capital not re-escorted · timeout without `lostUsd` | `across-ingress-bridge.test.ts` |
| Treasury escort undersize / reverse yield AML | `treasury-escort-router.test.ts` |
| Sanctuary Wasm GMX wire · coprocessor=0 Solidity fallback | `sanctuary-sinking-audit.test.ts` |
| RiskOracle flush / statusCode=3 blocks UserOp | `risk-oracle-gate.test.ts` |

Reproduce: `npx vitest run tests/sdk/retail-guard-provider.test.ts` · `pnpm demo:gmx -- --trip` · `pnpm audit:sepsb`
