# 05 — Hidden Engineering Gems & Invariants

Engineering-honest deep dive for five production invariants uncovered in codebase audit. Each item cites the SSOT implementation path and line range. This document supplements — not replaces — [`README.md`](../../README.md) and [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md).

---

## 1. Dual-Plug SDK — EIP-1193 Provider vs B2B Decorator

**Problem:** Human wallets and autonomous agent loops need the same soil reflex but different integration surfaces.

| Plug | SSOT | Lines | Integration |
|------|------|-------|-------------|
| **C-End — `withRetailGuardProvider`** | [`src/sdk/exomesh-agentic-wallet-guard/provider.ts`](../../src/sdk/exomesh-agentic-wallet-guard/provider.ts) | **L51–55, L74–93** | Wraps an EIP-1193 `request()` provider. Intercepts `eth_sendTransaction`, `eth_signTypedData_v4`, and EIP-5792 `wallet_sendCalls` before broadcast. |
| **EIP-6963 discovery (optional)** | Same file | **L101–128** | `announceGuardedProvider()` registers a guarded provider via `eip6963:announceProvider`. |
| **B2B — `withExoMeshShield`** | [`src/sdk/decorator.ts`](../../src/sdk/decorator.ts) | **L54–78** | TS function decorator. Runs `checkSoilResistance()` then the wrapped `executionFn`. Trip → 60s cooldown per `agentId` (**L14–27, L62–69**). |
| **8-dimension agent gate** | [`src/sdk/agent-intent.ts`](../../src/sdk/agent-intent.ts) | **L7–8, L31–88** | `verifyAgentIntent`: Injection ∧ Digest ∧ Soil ∧ Session ∧ Gas ∧ Attestation ∧ Armor ∧ Wasm. |

**Agent framework adapters (all use `withExoMeshShield`):**

| Framework | File | Line |
|-----------|------|------|
| Wayfinder | [`src/adapters/wayfinder/wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) | **L65** |
| ElizaOS | [`src/adapters/elizaos/elizaos-citadel-plugin.ts`](../../src/adapters/elizaos/elizaos-citadel-plugin.ts) | **L57** |
| Virtuals GAME | [`src/adapters/virtuals/virtuals-game-adapter.ts`](../../src/adapters/virtuals/virtuals-game-adapter.ts) | **L66** |
| LangChain | [`src/adapters/langchain/langchain-citadel-tool.ts`](../../src/adapters/langchain/langchain-citadel-tool.ts) | **L87** |

**Verify:** `npx vitest run tests/sdk/retail-guard-provider.test.ts` (35/35) · `npx vitest run tests/sdk/decorator.test.ts`

**Honesty boundary:** `withRetailGuardProvider` is the judge-primary C-end SKU. `withExoMeshShield` does not wrap `window.ethereum`; it guards agent-side execution hooks.

---

## 2. Honeypot RPC Trap + Soil Threshold Jitter

Two complementary defenses: outbound RPC integrity (honeypot) and inbound threshold gaming resistance (jitter).

### 2.1 Honeypot — `evaluateRpcDefenseGate()`

| Item | SSOT | Lines |
|------|------|-------|
| Gate evaluation | [`src/services/defense/rpc-fetch-gate-lib/rpc-fetch-gate-eval.ts`](../../src/services/defense/rpc-fetch-gate-lib/rpc-fetch-gate-eval.ts) | **L73–94** |
| 99% synthetic slippage constant | Same file | **L17** (`HONEYPOT_SIMULATED_SLIPPAGE = 0.99`) |
| Decoy telemetry (frozen object) | Same file | **L96–108** |
| Trap hosts in default allowlist | [`src/services/defense/rpc-allowlist-hosts.ts`](../../src/services/defense/rpc-allowlist-hosts.ts) | **L34–43** |
| Enforced on every allowlisted fetch | [`src/services/defense/rpc-fetch-gate-lib/rpc-fetch-gate-fetch.ts`](../../src/services/defense/rpc-fetch-gate-lib/rpc-fetch-gate-fetch.ts) | **L26–33** |

**Mechanism:** Unauthenticated requests to trap hosts (`rpc.silvervine-clone.trap`, etc.) trip immediately with `HONEYPOT_ACTIVE` and status `0x99`. No real venue RTT is consumed. Scrapers or forked frontends that copy the default RPC list receive decoy slippage telemetry, not production state. Authenticated operators bypass via layout-metric unlock or `X-Citadel-Session-Sig` ([`rpc-fetch-gate-eval.ts` L58–71](../../src/services/defense/rpc-fetch-gate-lib/rpc-fetch-gate-eval.ts)).

**Verify:** `npx vitest run tests/defense/rpc-whitelist.test.ts`

### 2.2 Jitter — `resolveJitteredSoilThresholds()`

| Item | SSOT | Lines |
|------|------|-------|
| Jitter SSOT | [`src/core/soil-resistance-jitter.ts`](../../src/core/soil-resistance-jitter.ts) | **L6–7, L16–37** |
| Re-export barrel | [`src/services/risk-control-lib/soil-threshold-jitter.ts`](../../src/services/risk-control-lib/soil-threshold-jitter.ts) | **L1–6** |
| Hot-path integration | [`src/services/risk-control-lib/soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) | **L135** |

**Mechanism:** Each soil check applies ±2–5 bps random offset to `slippageFuse` and `minDepthUsd` via `crypto.getRandomValues`. Prevents adversaries from probing an exact 0.5% fuse boundary with manipulated RPC quotes. Disabled under `VITEST=true` for deterministic tests ([`soil-resistance-jitter.ts` L12](../../src/core/soil-resistance-jitter.ts)).

**Verify:** `npx vitest run tests/risk-control/soil-threshold-jitter.test.ts`

---

## 3. Observatory Paradox Resolution — −40 Haircut on Risk-Decrease Intents

**Problem:** A naive fail-closed guard that blocks `close`/`reduce` during volatility traps the agent in a high-risk position — the Observatory Paradox.

| Item | SSOT | Lines |
|------|------|-------|
| De-leverage detection | [`src/guards/pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) | **L54–57** |
| −40 score discount | Same file | **L55–57** (`effectiveScore = rawRiskScore - 40`) |
| Emergency greenlight | Same file | **L66–76** (`EMERGENCY_DELEVERAGE_ALLOWED`) |
| Expansion still blocked | Same file | **L78–86** (`FAIL_CLOSED_BLOCK` when score > 75 or shadow margin < 0) |

**Mechanism:** Pendle PT shadow-margin cross-guard computes a composite risk score. `close` and `reduce` intents receive a 40-point haircut and always pass as `EMERGENCY_DELEVERAGE_ALLOWED`. Risk-expanding intents retain full scoring.

**Verify:** `npx vitest run tests/guards/pendle-gmx-cross-guard.test.ts`

**Honesty boundary:** This guard applies to the Pendle × GMX cross-guard lane. It is not a universal bypass for all venue soil trips.

---

## 4. Session Key Constraints — Notional Cap, Clip, Dynamic SL

Session-key pipelines enforce layered USD limits before EIP-712 signing.

| Layer | Constant / Formula | SSOT | Lines |
|-------|-------------------|------|-------|
| **Physical notional cap** | `$5,000` (`SESSION_KEY_NOTIONAL_CAP_USD`) | [`src/services/session-key-adapter-lib/session-key-types.ts`](../../src/services/session-key-adapter-lib/session-key-types.ts) | **L77–78** |
| **Enforcement + sever** | `assertSessionKeyExecutionGates` | [`src/services/session-key-adapter-lib/session-key-gates.ts`](../../src/services/session-key-adapter-lib/session-key-gates.ts) | **L63–67, L25–32** |
| **Agent mandate clip** | `$30` (`MAX_ORDER_CLIP_USD`) | [`src/config/risk-parameters.ts`](../../src/config/risk-parameters.ts) | **L11–12** |
| **7-day auto-expire** | `SESSION_KEY_AUTO_EXPIRE_MS` | [`src/services/risk/session-audit.ts`](../../src/services/risk/session-audit.ts) | **L15–16, L41–78** |
| **Dynamic Max SL** | `Balance × 1% + $100` | [`src/core/dynamic-max-sl.ts`](../../src/core/dynamic-max-sl.ts) | **L1–7** |
| **Wasm parity** | `session_core_ok` + dynamic SL in soil eval | [`src/wasm/soil_core.rs`](../../src/wasm/soil_core.rs) | **L61, L78–98** |

**Mechanism:** `assertSessionKeyExecutionGates` checks signing-channel state, R20 lock, $5k notional cap, dynamic SL, and position cap. Breach calls `severSigningChannel()` and throws `SESSION_KEY_HARDLOCK_INTERCEPTED`. Separately, `auditSessionKeyConstraints` enforces the $30 clip and 7-day TTL for agent mandate attenuation.

**Verify:** `npx vitest run tests/services/session-key-gates.test.ts`

---

## 5. Cross-Isolate KV Sync — Non-Blocking `protocolMask`

**Problem:** Soil trip flags must propagate across Cloudflare isolates without adding `await` latency to the reflex hot path.

| Item | SSOT | Lines |
|------|------|-------|
| O(1) sync read | [`src/core/protocol-mask-sync.ts`](../../src/core/protocol-mask-sync.ts) | **L51–53** |
| Local merge | Same file | **L55–57** |
| Fire-and-forget KV write | Same file | **L99–114** (`void put().catch()`) |
| KV adapter shell | [`src/services/kv-lib/protocol-mask.ts`](../../src/services/kv-lib/protocol-mask.ts) | **L32–40** |
| Worker bootstrap | [`src/worker-fetch.ts`](../../src/worker-fetch.ts) | **L47–48** (`bind` + `ctx.waitUntil(prefetch…)`) |
| Route-level prefetch | [`src/api/routes-lean.ts`](../../src/api/routes-lean.ts) via `routeRequest` | Entry at **L34** (RPS gate runs first) |
| Soil integration | [`src/services/risk-control-lib/soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) | **L141–143** |
| Wasm trip bit | [`src/wasm/soil_core.rs`](../../src/wasm/soil_core.rs) | **L54–57** (`TRIP_PROTOCOL`) |

**Mechanism:** `readProtocolMaskSync()` returns a module-scoped `cachedMask` OR-ed with any global snapshot — zero allocation, no I/O. On isolate startup, `prefetchProtocolMaskKv` hydrates cache via `ctx.waitUntil`. When a local isolate discovers new trip bits, `scheduleProtocolMaskKvWrite` updates cache immediately and persists to KV asynchronously. KV write failure is swallowed; the hot path never awaits.

**Verify:** `npx vitest run tests/core/protocol-mask-sync.test.ts`

**Honesty boundary:** Mask sync is eventually consistent across isolates. A trip in isolate A may not be visible in isolate B until KV propagation completes.

---

## Appendix — Public Gateway Rate Limiter (Related)

Not one of the five core invariants above, but referenced from README:

| Item | SSOT | Lines |
|------|------|-------|
| In-memory 5 RPS bucket | [`src/middleware/rate-limiter.ts`](../../src/middleware/rate-limiter.ts) | **L82–104** |
| Enforced before handlers | [`src/api/routes-lean.ts`](../../src/api/routes-lean.ts) | **L34–35** |
| Response headers | [`src/middleware/rate-limiter.ts`](../../src/middleware/rate-limiter.ts) | **L68–79** |

**Honesty boundary:** Per-isolate `Map` counter — not a global Cloudflare Rate Limit product. Some explicit GET routes in `worker-fetch.ts` bypass `routeRequest` and therefore bypass this limiter.

---

## Verification Index

```bash
npx vitest run tests/sdk/retail-guard-provider.test.ts   # Dual-plug C-end
npx vitest run tests/sdk/decorator.test.ts                 # Dual-plug B2B
npx vitest run tests/defense/rpc-whitelist.test.ts         # Honeypot
npx vitest run tests/risk-control/soil-threshold-jitter.test.ts
npx vitest run tests/guards/pendle-gmx-cross-guard.test.ts # Observatory
npx vitest run tests/services/session-key-gates.test.ts    # Session caps
npx vitest run tests/core/protocol-mask-sync.test.ts       # KV mask sync
```
