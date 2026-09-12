# Integration Proofs v2 (5-Core Venues · EIP-1193 Retail Guard · B2B Decorator)

> **SSOT index:** [`README.md`](./README.md) · **Hub:** [`../06_verifications/01_VERIFICATION_MATRIX.md`](../06_verifications/01_VERIFICATION_MATRIX.md)  
> **Vitest baseline:** **228 test files | 1065 PASS clean**

---

## Proof Chain Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│ (a) C-End: EIP-1193 Retail Guard SDK                            │
│     withRetailGuardProvider() → eth_sendTransaction intercept   │
├─────────────────────────────────────────────────────────────────┤
│ (b) 5-Core Venue Guards + Demo CLIs                             │
│     GMX · Pendle · USD.ai · HL · Variational                    │
├─────────────────────────────────────────────────────────────────┤
│ (c) B2B: withCitadelShield / verifyAgentIntent (framework-agnostic)│
└─────────────────────────────────────────────────────────────────┘
```

**Removed v1.1 prune:** Wayfinder · ElizaOS · Virtuals · LangChain framework adapters · Uniswap V3 · Aave V3 · Morpho Blue venue adapters — Wasm **RESERVED_ABI_V2** holes preserved.

---

## (a) EIP-1193 Retail Guard — C-End Middleware

Citadel ships a **universal wallet middleware** for any EIP-1193 host (dApp · wallet · AI copilot):

| Layer | Module | Behavior |
|-------|--------|----------|
| Provider wrap | [`provider.ts`](../../src/sdk/eip1193-agentic-wallet-guard/provider.ts) | `withRetailGuardProvider()` — intercepts RPC before broadcast |
| Calldata parse | [`calldata-parser.ts`](../../src/sdk/eip1193-agentic-wallet-guard/calldata-parser.ts) | Generic DEX selector parsing (Uniswap router = calldata guard, **not** pruned venue adapter) |
| Guard engine | [`guard-engine.ts`](../../src/sdk/eip1193-agentic-wallet-guard/guard-engine.ts) | `checkSoilResistance()` + mandate evaluation |

```bash
npx vitest run tests/sdk/retail-guard-provider.test.ts   # 35/35 PASS
```

**Integration blueprint:** [`docs/04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md`](../04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md)

**Execution flow:**

```text
[ EIP-1193 Host (Wallet / dApp / AI Copilot) ]
                    │
                    ▼
        withRetailGuardProvider()  (provider.ts)
                    │
                    ▼
        evaluateTransactionIntent()  (guard-engine.ts)
                    │
                    ▼
        checkSoilResistance()  (p50 ~106µs E2E · p50 ~15µs reflex on --trip)
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     FAIL_CLOSED           ALLOW
     (0-Gas intercept)         │
                               ▼
                    [ Wallet broadcast · Arbitrum 42161 ]
```

---

## (b) 5-Core Venue Guards + Demo CLIs

| Venue | Guard module | Demo CLI | Test |
|-------|--------------|----------|------|
| **GMX v2** | [`gmx-v2-invariants.ts`](../../src/adapters/gmx/gmx-v2-invariants.ts) | `pnpm demo:gmx` | [`gmx-v2-invariants.test.ts`](../../tests/adapters/gmx-v2-invariants.test.ts) |
| **Pendle** | [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) | `pnpm demo:pendle` | pendle adapter tests |
| **USD.ai** | [`usdai-adapter.ts`](../../src/adapters/usdai/usdai-adapter.ts) | `pnpm demo:usdai` | [`usdai-adapter.test.ts`](../../tests/adapters/usdai-adapter.test.ts) |
| **Hyperliquid** | [`hyperliquid-session-guard.ts`](../../src/adapters/hl/hyperliquid-session-guard.ts) | `pnpm demo:hl` | HL session guard tests |
| **Variational** | [`variational-rfq-adapter.ts`](../../src/adapters/variational-rfq-adapter.ts) | `pnpm demo:variational` | variational RFQ tests |

```bash
pnpm demo:gmx -- --trip
pnpm demo:pendle
pnpm demo:usdai -- --trip
pnpm demo:hl -- --trip
pnpm demo:variational -- --trip
```

**Strategy loops:**

```bash
pnpm demo:perp-loop -- --trip    # Loop A: GMX / Pendle / HL / Variational
pnpm demo:spot-loop -- --trip     # Loop B: USD.ai collateral lane
```

**Venue rotation SSOT:** [`examples/lib/agent-venue-matrix.ts`](../../examples/lib/agent-venue-matrix.ts)

---

## (c) B2B Agent Decorator (`withCitadelShield`)

Framework-agnostic B2B integration — no per-framework npm plugins:

| Layer | Module | Behavior |
|-------|--------|----------|
| Decorator | [`decorator.ts`](../../src/sdk/decorator.ts) | `withCitadelShield()` — zero-touch pre-broadcast wrapper |
| Intent verify | [`agent-intent.ts`](../../src/sdk/agent-intent.ts) | `verifyAgentIntent()` — 8-dimension mandate gate |
| Demo | [`agent-interceptor-demo.ts`](../../examples/agent-interceptor-demo.ts) | `pnpm demo:agent` |

```bash
pnpm demo:agent
npx vitest run tests/sdk/decorator.test.ts
```

---

## Stabilizer Sepolia Sandbox (Tier 3 — not 5-core production)

| Module | Role |
|--------|------|
| [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) | Sepolia `421614` 1:1 swap guard · de-peg severance |

```bash
pnpm demo:stabilizer
pnpm demo:stabilizer -- --trip
```

---

## RESERVED_ABI_V2 (Pruned Venue Holes)

Pruned venue evaluators removed; Wasm ABI v2 retains frozen holes:

| Hole | Location | Status |
|------|----------|--------|
| Protocol bits 4–6 | [`risk-flags.ts`](../../src/core/risk-flags.ts) | `@deprecated RESERVED_ABI_V2` |
| Vector slots 8–19 | Wasm FFI | Frozen — no new evaluators |
| Venue indices 2–4 | Intent mandate | Removed from `VENUE_KEY_INDEX` |

See [`intent-mandate.ts`](../../src/core/intent-mandate.ts) · [`docs/01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md).

---

## Cross-Reference Index

| Audience | Start here |
|----------|------------|
| C-end wallet vendors | [`docs/04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md`](../04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md) |
| B2B agent integrators | [`src/sdk/decorator.ts`](../../src/sdk/decorator.ts) |
| Judge fast-track | `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` · `pnpm demo:hl -- --trip` |
| Full CLI map | [`02_CLI_ZONE_MAP.md`](./04_CLI_ZONE_MAP.md) |
