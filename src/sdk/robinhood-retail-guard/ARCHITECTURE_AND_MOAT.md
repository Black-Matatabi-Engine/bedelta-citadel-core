# Architecture & Competitive Moat — Robinhood Retail Guard SDK

> **License:** Apache-2.0 (TypeScript wrapper) · proprietary reflex math in `pkg/soil_core.wasm`  
> **Brands:** **Robinhood Retail Guard** (grant pitch name) · **EIP-1193 Retail Guard SDK** (omni-chain EVM middleware)

---

## Paradigm Shift: Server Simulation vs. Edge Wasm Pre-Consensus Policy Reflex

| Dimension | Server Simulation (Blockaid, Blowfish, WalletConnect Scan) | Edge Wasm Pre-Consensus Policy Reflex (Retail Guard) |
|-----------|--------------------------------------------------------------|--------------------------------------------------------|
| **Execution locus** | Remote RPC / SaaS API round-trip | In-browser / Edge Worker **before** wallet signature |
| **Latency budget** | 200–800 ms (network + simulation farm) | **< 0.014 ms** reflex arc (u32 ring + scratch buffers) |
| **Gas on reject** | N/A (post-hoc warning) or user already signed | **0-Gas fail-closed** — tx never reaches `eth_sendRawTransaction` |
| **Trust model** | Third-party sees full calldata + address graph | Self-hosted policy; Wasm IP core optional |
| **Offline / air-gap** | Requires connectivity | Deterministic TS fallbacks when Wasm unavailable |
| **Agent / LLM binding** | Bolt-on after intent formed | **Pre-consensus** intent ring (`INTENT_RING_U32`) severs retry storms |

**Fundamental thesis:** Simulation vendors answer *"What will this tx do on-chain?"* after the user (or agent) has already committed to signing. Retail Guard answers *"Is this invocation allowed under the user's declared mandate?"* **before** any cryptographic commitment — a reflex arc, not a retrospective audit.

```text
[Legacy Stack]
  dApp → wallet popup → sign → broadcast → Blockaid/Blowfish simulation → warning (too late)

[Retail Guard Stack]
  dApp → withRetailGuardProvider / announceGuardedProvider (EIP-6963)
       → calldata-parser (u32 selectors: ERC20 · Permit2 · routers)
       → guard-engine (approve · venue · soil · intent gates)
       → wasm-adapter → soil_core.wasm
       → [PASS] forward to MetaMask / Rabby / injected provider
       → [FAIL] RetailGuardRejectedError + plainTextWarning (0-Gas)
```

---

## Three Core Defense Pillars

### Pillar 1 — 0-Gas Pre-Consensus Infinite Approval & Phishing Interception

**Surfaces:** `eth_sendTransaction` · `eth_signTypedData_v4` · Permit2 calldata (`0x2a0886f7`, `0x87517c45`)

| Threat | Mechanism | SSOT |
|--------|-----------|------|
| Infinite ERC20 `approve` (`UINT256_MAX`) | `evaluateRetailApproveGate` | `allowedSpenders[]` |
| Permit2 `approve` / `permit` (uint160 max) | `parseTransactionCalldata` → approve gate | `CALLDATA_SCRATCH` (zero alloc) |
| EIP-712 Permit phishing (`verifyingContract` drift) | `evaluateRetailVenueAllowlist` | `contractVenueIndex` |
| Untrusted `message.spender` in typed data | Spender cross-check | `UNAUTHORIZED_SPENDER_REJECTED` |

**EIP-7730 alignment:** Permit2 and router selectors are classified at the **wallet middleware** layer — the same surface EIP-7730 standardizes for human-readable call exposure. Retail Guard enforces **policy** on that surface before display/sign, not after.

### Pillar 2 — AI Agent Hallucination & Prompt Injection Intent Binding

**Surfaces:** All guarded EIP-1193 methods when driven by LLM agents (ElizaOS, LangChain, Virtuals, custom copilots).

| Hallucination class | Guard | Code path |
|---------------------|-------|-----------|
| Hallucinated spender / approve target | Infinite + notional caps | `evaluateRetailApproveGate` |
| Wrong `verifyingContract` in EIP-712 | Venue drift | `VENUE_DRIFT_REJECTED` |
| Toxic slippage / honeypot venue | Soil lane fuse | `evaluateSoilSlippagePacked` / Wasm |
| Prompt-injected venue swap | Bitmask venue gate | `evaluateRetailIntentGate` |

Agents do not get a second chance to "retry until success" against an unchanged mandate — the intent ring tracks per-wallet attempt budgets and severs the hot-key pipeline on exhaustion.

See `AI_INTENT_PROTECTION.md` for the full threat model.

### Pillar 3 — Multi-Submit FOMO / Panic Retry Storm Severing (`INTENT_RING_U32`)

**Problem:** Phishing UIs and agent loops exploit panic by spamming `eth_sendTransaction` until the user approves or the agent exhausts RPC rate limits.

**Solution:** `INTENT_RING_U32` (256-slot FNV-indexed ring) tracks attempt budgets per wallet session:

1. `allowedVenueMask` ∩ `targetVenueBit` — reject venue drift before incrementing attempts.
2. `trackAttemptBudgetU32Pure` — increment on each guarded invocation.
3. `MAX_ATTEMPTS_EXCEEDED_SEVERED` — channel sever; subsequent calls return `CHANNEL_SEVERED`.

This is **O(1)**, **zero-GC**, and mirrored in Rust (`intent_core.rs`) and Solidity (`IntentRingSlabLib.sol`) for cross-tier parity.

---

## Dual-Brand Strategy

| Brand | Audience | Positioning |
|-------|----------|-------------|
| **Robinhood Retail Guard** | Grant reviewers · retail brokerage pilots | "Involuntary reflex arc for 50M+ retail wallets — 0-Gas phishing block" |
| **EIP-1193 Retail Guard SDK** | Wallet vendors · dApp integrators · agent frameworks | Omni-chain EVM middleware: drop-in `withRetailGuardProvider` / `announceGuardedProvider` (EIP-6963) |

Both ship from this directory under **Apache-2.0**. The open boundary includes:

- `provider.ts` — EIP-1193 + EIP-6963 wrapper
- `calldata-parser.ts` — bitwise selector dispatch
- `guard-engine.ts` — policy evaluators + scratch SSOT
- `risk-evaluator.ts` — unified gate orchestration
- `warnings.ts` — plain-text ALERT copy

**IP core (proprietary):** `pkg/soil_core.wasm` — soil slippage fusion and Wasm-accelerated intent budget math. TypeScript provides deterministic fallbacks for Vitest and offline harnesses.

---

## Integration Surfaces

```typescript
import {
  withRetailGuardProvider,
  announceGuardedProvider,
  resolveInjectedEthereum,
} from "@slivervine/robinhood-retail-guard";

// Direct wrap (custom / injected provider)
const guarded = withRetailGuardProvider(window.ethereum, config);

// EIP-6963 multi-provider discovery
announceGuardedProvider(window.ethereum, config, {
  name: "Robinhood Retail Guard",
  rdns: "io.slivervine.retailguard",
});

// Convenience: first injected provider
const injected = resolveInjectedEthereum();
if (injected) announceGuardedProvider(injected, config);
```

---

## Moat Summary

1. **Pre-consensus reflex** — policy enforcement before signature, not simulation after.
2. **Zero-GC hot path** — `CALLDATA_SCRATCH` · `INTENT_RING_U32` · `SOIL_FFI_REUSABLE_BUFFER`.
3. **Cross-tier parity** — TS ↔ Wasm ↔ Solidity intent ring; soil lane math in Edge Workers.
4. **Agent-native** — mandate binding + retry severing designed for LLM-driven wallets, not retrofitted.
5. **Apache-2.0 distribution** — wallet vendors can fork the wrapper; Wasm IP preserves commercial upside.

---

## Living Water Telemetry

[`livingwater-telemetry.ts`](./livingwater-telemetry.ts) exposes an in-browser **health and execution performance monitor** (`evaluateLivingWaterHealth`, `verifyTelemetryWatermark`) that runs on every guarded EIP-1193 invocation. When SDK integrity cannot be recovered under sustained load, the gate returns `LIVING_WATER_DRIFT` — a fail-closed recovery path framed for end users as telemetry drift, not a security trap.

---

## Related Documents

- [`README.md`](./README.md) — public integration guide
- `AI_INTENT_PROTECTION.md` — LLM / agent threat model
- `docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md` — Wasm reflex core · §3.7 Retail Guard SDK
- `docs/internal/PERFORMANCE_AND_PARITY_AUDIT.md` — zero-GC audit (2026-09-10)
