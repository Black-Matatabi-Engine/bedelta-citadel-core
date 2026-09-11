# `@slivervine/robinhood-agentic-retail-wallet-guard` — Integration Blueprint

**Official Name:** Robinhood Agentic & Retail Wallet Guard SDK  
**License:** Apache-2.0 · **Entity:** SilverVine Labs  
**Package:** `@slivervine/robinhood-agentic-retail-wallet-guard`  
**Source:** [`src/sdk/robinhood-agentic-retail-wallet-guard/`](../../src/sdk/robinhood-agentic-retail-wallet-guard/)  
**Buildathon role:** **Primary C-End Middleware deliverable** — EIP-1193 pre-consensus reflex arc for retail wallets and AI agent copilots

> **Verification:** `npx vitest run tests/sdk/` → **48/48 PASS** (5 test files) · **Tier 0 CLI:** `pnpm demo:eip1193` · `pnpm demo:eip1193 -- --json`

---

## Executive Summary

Ultra-lightweight **EIP-1193 provider middleware** that intercepts `eth_sendTransaction` and `eth_signTypedData_v4` **before** the host wallet signs. Unlike server-side simulators (Blockaid, Blowfish), this SDK enforces **mandate policy pre-consensus** with **zero on-chain gas** on rejection paths.

| Capability | API surface |
|------------|-------------|
| Provider wrap | `withRetailGuardProvider(baseProvider, config)` |
| EIP-6963 discovery | `announceGuardedProvider(baseProvider, config, options)` |
| Risk evaluation | `evaluateRetailRisk(config, method, params)` |
| RPC transport sync | `evaluateTransportStreamSync()` · `verifyTransportBitmark()` |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│ dApp / Wallet / AI Copilot (any EIP-1193 host)                  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ @slivervine/robinhood-agentic-retail-wallet-guard (Apache-2.0)  │
│ ├─ withRetailGuardProvider / announceGuardedProvider (EIP-6963) │
│ ├─ transport-stream.ts — RPC transport stream sync            │
│ ├─ calldata-parser.ts — ERC20 · Permit2 · router u32 selectors  │
│ ├─ guard-engine.ts — approve · venue · soil · intent gates      │
│ └─ wasm-adapter.ts → pkg/soil_core.wasm (optional IP core)      │
└────────────────────────────┬────────────────────────────────────┘
                             │ [PASS] forward request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ MetaMask / Rabby / injected EIP-1193 provider                   │
└─────────────────────────────────────────────────────────────────┘
```

**IP boundary:** TypeScript wrapper, calldata classification, policy config, and user warnings are **Apache-2.0**. Slippage fusion and Wasm-accelerated intent math live in `pkg/soil_core.wasm` when loaded; deterministic TS fallbacks run in Vitest and offline harnesses.

---

## Quick Start

```typescript
import {
  withRetailGuardProvider,
  announceGuardedProvider,
  resolveInjectedEthereum,
  type RetailGuardConfig,
} from "@slivervine/robinhood-agentic-retail-wallet-guard";

const config: RetailGuardConfig = {
  walletAddress: "0xYourWallet…",
  allowedVenues: [
    "0xGmxRouter…",
    "0xUniswapRouter…", // generic DEX calldata guard — not the pruned Uniswap V3 venue adapter
    "0xUsdcToken…",
    "0x000000000022d473030f116ddee9f6b43ac78b6", // Permit2
  ],
  allowedSpenders: ["0xTrustedSpender…"],
  contractVenueIndex: {
    "0xgmxrouter…": 0,
    "0xuniswaprouter…": 1,
    "0xusdctoken…": 2,
    "0x000000000022d473030f116ddee9f6b43ac78b6": 3,
  },
  allowedVenueMask: 0b1111,
  maxApprovalUsd: 10_000,
  soilQuote: {
    hlSpot: 3500,
    hlPerp: 3500,
    dydxPerp: 3498,
    depthUsd: 500_000,
    maxSlippage: 0.005,
    minDepthUsd: 100_000,
  },
};

const guarded = withRetailGuardProvider(window.ethereum, config);

await guarded.request({
  method: "eth_sendTransaction",
  params: [{ from: config.walletAddress, to: "0xGmxRouter…", value: "0x0" }],
});
```

### EIP-6963 Multi-Provider Registration

```typescript
announceGuardedProvider(window.ethereum, config, {
  name: "Robinhood Agentic & Retail Wallet Guard",
  rdns: "io.slivervine.agenticretailwalletguard",
});
```

---

## Defense Pillars

### 1 — Pre-Consensus 0-Gas Interception

| Threat | Guard | Reason code |
|--------|-------|-------------|
| Infinite ERC20 `approve` | `evaluateRetailApproveGate` | `UNAUTHORIZED_SPENDER_REJECTED` |
| Permit2 `approve` / `permit` (`0x87517c45` / `0x2a0886f7`) | `parseTransactionCalldata` | `UNAUTHORIZED_SPENDER_REJECTED` |
| EIP-712 `verifyingContract` drift | `evaluateRetailVenueAllowlist` | `VENUE_DRIFT_REJECTED` |
| Honeypot slippage | `evaluateRetailSoilGate` | `SLIPPAGE_EXCEEDED` |

### 2 — AI Agent Intent Protection

Guards LLM-driven wallets against hallucinated spenders, venue drift, and prompt-injected swaps. See [`04_AI_INTENT_PROTECTION_MODEL.md`](./04_AI_INTENT_PROTECTION_MODEL.md).

### 3 — Retry Storm Severance (`INTENT_RING_U32`)

4th rapid `eth_sendTransaction` within a session severs the signing channel:

- `MAX_ATTEMPTS_EXCEEDED_SEVERED` → `CHANNEL_SEVERED`

### 4 — RPC Transport Stream Sync

EIP-1193 transport lane monitor (`transport-stream.ts`). Surfaces `RPC_TRANSPORT_SYNC_FAILED` when stream synchronization cannot be recovered under load (nonce-safe pause).

---

## CLI Demonstration (`pnpm demo:eip1193`)

Interactive Tier 0 entrypoint for judges and integrators — wraps the same production SDK path as unit tests, with browser-level narrative.

| Command | Output |
|---------|--------|
| `pnpm demo:eip1193` | Scenario **A–D State Matrix** · `JUDGE_SAFE` clock · TTY `[PRESS ENTER]` recording pauses · `[PRODUCTION ALERT]` echoes `plainTextWarning` |
| `pnpm demo:eip1193 -- --json` | JSON array: `{ scenario, status, wasmUs, code, plainTextWarning }` — no ANSI |
| `pnpm demo:eip1193 -- --trip` | Scenario **C–D** shortcut (FAIL_CLOSED + channel severance) |

**Alert SSOT:** Rejection strings originate from `formatRetailWarning()` in [`warnings.ts`](../../src/sdk/robinhood-agentic-retail-wallet-guard/warnings.ts), surfaced on `RetailGuardRejectedError.plainTextWarning`. The demo **does not hardcode** production alert copy — it echoes the thrown error after `withRetailGuardProvider()` intercept.

**0-Gas pre-consensus:** Guarded methods (`eth_sendTransaction`, `eth_signTypedData_v4`) abort at the SDK layer on reject — **no calldata reaches the Sequencer**.

**Dual-track verification:**

| Track | Entrypoint | Coverage |
|-------|------------|----------|
| Interactive CLI | `pnpm demo:eip1193` | 4 core state scenarios (A–D) · independent replays |
| Unit SSOT | `npx vitest run tests/sdk/retail-guard-provider.test.ts` | **35/35 PASS** · all **7** `RetailGuardReasonCode` variants |

Source: [`examples/eip1193-provider-demo.ts`](../../examples/eip1193-provider-demo.ts) · [`examples/lib/eip1193-breakthrough-helpers.ts`](../../examples/lib/eip1193-breakthrough-helpers.ts)

---

## Module Map

| File | Role |
|------|------|
| `provider.ts` | EIP-1193 middleware · EIP-6963 |
| `risk-evaluator.ts` | `evaluateRetailRisk` orchestration |
| `guard-engine.ts` | Policy gates + RPC transport protocol |
| `calldata-parser.ts` | Zero-alloc selector dispatch |
| `transport-stream.ts` | RPC transport stream synchronization |
| `wasm-adapter.ts` | `pkg/soil_core.wasm` FFI |

---

## Testing

```bash
npx vitest run tests/sdk/retail-guard-provider.test.ts   # Tier 0 SSOT — 35/35 · 7/7 reason codes
npx vitest run tests/sdk/                                 # Full SDK suite — 48/48 PASS
pnpm demo:eip1193 -- --json                               # CLI structured output (CI / Dune)
```

**Retail guard baseline:** **35/35 PASS** — exhaustive `RetailGuardReasonCode` coverage:

| Code | Guard |
|------|-------|
| `VENUE_DRIFT_REJECTED` | `evaluateRetailVenueAllowlist` |
| `UNAUTHORIZED_SPENDER_REJECTED` | `evaluateRetailApproveGate` · EIP-712 permit spender |
| `SLIPPAGE_EXCEEDED` | `evaluateRetailSoilGate` |
| `DEPTH_INSUFFICIENT` | `evaluateRetailSoilGate` |
| `MAX_ATTEMPTS_EXCEEDED_SEVERED` | `evaluateRetailIntentGate` |
| `CHANNEL_SEVERED` | Post-severance hard block |
| `RPC_TRANSPORT_SYNC_FAILED` | `evaluateRpcTransportProtocol` |

**Full SDK baseline:** **48/48 PASS**

---

## Related Documents

| Document | Role |
|----------|------|
| [`README.md`](./README.md) | Documentation index (01 → 04) |
| [`02_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md`](./02_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md) | Competitive matrix · grant strategy |
| [`03_ARCHITECTURE_AND_MOAT.md`](./03_ARCHITECTURE_AND_MOAT.md) | Competitive positioning · paradigm shift |
| [`04_AI_INTENT_PROTECTION_MODEL.md`](./04_AI_INTENT_PROTECTION_MODEL.md) | LLM / agent threat model |
| [`../ARB_Buildathon/SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) | Buildathon submission SSOT |
| [`../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md`](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md) | Wasm reflex core · §3.7 |

---

*SilverVine Labs · Robinhood Agentic & Retail Wallet Guard SDK · Apache-2.0*
