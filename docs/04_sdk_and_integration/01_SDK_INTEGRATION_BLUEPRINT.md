# `@slivervine/eip1193-agentic-wallet-guard` — Integration Blueprint

**Official Name:** EIP-1193 Agentic Wallet Guard SDK  
**Product module:** SliverVine ExoMesh (Module A)  
**Slogan:** Universal EIP-1193 Pre-Consensus Guard — Tailor-made for Robinhood Chain & Omni-EVM AI Agents  
**License:** Apache-2.0 · **Entity:** SilverVine Labs  
**Package:** `@slivervine/eip1193-agentic-wallet-guard`  
**Source:** [`src/sdk/eip1193-agentic-wallet-guard/`](../../src/sdk/eip1193-agentic-wallet-guard/)  
**Buildathon role:** **Primary C-End Middleware deliverable** — EIP-1193 pre-consensus reflex arc for Robinhood Chain, Omni-EVM AI agents, and retail wallets

> **Verification:** `npx vitest run tests/sdk/` → **48/48 PASS** (5 test files) · **Tier 0 CLI:** `pnpm demo:eip1193` · `pnpm demo:eip1193 -- --json`

---

## Executive Summary

Ultra-lightweight **EIP-1193 provider middleware** that intercepts `eth_sendTransaction`, `eth_signTypedData_v4`, and [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) `wallet_sendCalls` **before** the host wallet signs. Unlike server-side simulators (Blockaid, Blowfish), this SDK enforces **mandate policy pre-consensus** with **zero on-chain gas** on rejection paths.

| Capability | API surface |
|------------|-------------|
| Provider wrap | `withRetailGuardProvider(baseProvider, config)` |
| EIP-6963 discovery | `announceGuardedProvider(baseProvider, config, options)` |
| Risk evaluation | `evaluateRetailRisk(config, method, params)` |
| EIP-5792 batch | `evaluateEip5792WalletSendCalls(config, params)` · `wallet_sendCalls` |
| RPC transport sync | `evaluateTransportStreamSync()` · `verifyTransportBitmark()` |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│ dApp / Wallet / AI Copilot (any EIP-1193 host)                  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ @slivervine/eip1193-agentic-wallet-guard (Apache-2.0)           │
│ Universal EIP-1193 Pre-Consensus Guard                          │
│ ├─ withRetailGuardProvider / announceGuardedProvider (EIP-6963) │
│ ├─ transport-stream.ts — RPC transport stream sync            │
│ ├─ eip5792-send-calls.ts — EIP-5792 wallet_sendCalls unfold     │
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

## Robinhood Chain Integration Boundary (Hard Evidence SSOT)

This SDK is **Universal EIP-1193 Pre-Consensus Middleware** — chain-agnostic at the provider layer. Robinhood Chain-specific compliance lives in **Pillar Set X (Component 2: Compliance Ingress Firewall) adapter modules**, not inside `withRetailGuardProvider()` defaults.

| Concern | Layer | Code anchor |
|---------|-------|-------------|
| **ChainId registration** | SDK constants | [`src/sdk/constants.ts`](../../src/sdk/constants.ts) — `46630` (testnet) · `4663` (mainnet) |
| **Outbound escort** | Pillar Set X (Component 2: Compliance Ingress Firewall) bridge | [`src/sdk/unidirectional-bridge.ts`](../../src/sdk/unidirectional-bridge.ts) `assertUnidirectionalBridge()` — **`46630`/`4663` → `42161` only** |
| **Inbound AML** | Pillar Set X (Component 2: Compliance Ingress Firewall) bridge | [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) — `42161 → Robinhood` → `AML_INBOUND_TO_ROBINHOOD_BLOCKED` |
| **Treasury Escort & Collateral Ingress** | SliverVine Sanctuary (Module B) adapter | [`src/adapters/robinhood/treasury-escort-router.ts`](../../src/adapters/robinhood/treasury-escort-router.ts) `quoteRChainYieldToArbitrumGm()` — Institutional Treasury Escort Router · `assetKind` · `symbol` · size gates · bridge escort bind |
| **0-Gas retry storm** | **SliverVine ExoMesh (Module A · this SDK)** | [`guard-engine.ts`](../../src/sdk/eip1193-agentic-wallet-guard/guard-engine.ts) `evaluateRetailIntentGate()` → `MAX_ATTEMPTS_EXCEEDED_SEVERED` · Wasm `INTENT_RING_U32` |
| **ERC-7683 cross-chain** | **SliverVine ExoMesh (Module A · this SDK, generic)** | [`erc7683-intent-guard.ts`](../../src/sdk/eip1193-agentic-wallet-guard/erc7683-intent-guard.ts) — chain IDs supplied by caller; no Robinhood hard-wire |

**Demo split:**

| Track | Command | Proves |
|-------|---------|--------|
| Robinhood escort | `pnpm demo:escort` | Outbound `46630 → 42161` · inbound AML block · `lostUsd ≡ 0` |
| EIP-1193 guard | `pnpm demo:eip1193` | Omni-EVM pre-consensus · Scenario A–D · `JUDGE_SAFE` clock on Arbitrum One `42161` |

**ERC-7540 async vault escort (`[Sanctuary]`):** Selector-level guard in [`erc7540-async-escort.ts`](../../src/sdk/eip1193-agentic-wallet-guard/erc7540-async-escort.ts) — verify: `npx vitest run tests/erc7540-async-escort.test.ts` **3/3 PASS**.

**Do not conflate:** `evaluateRetailVenueAllowlist()` is a **config-driven** anti-phishing gate (`allowedVenues` whitelist) in **SliverVine ExoMesh (Module A)**. It does **not** embed Robinhood stock-token mint contract ABIs. Institutional treasury routing is enforced in **SliverVine Sanctuary (Module B)** via `quoteRChainYieldToArbitrumGm()` before GMX smart-route binding.

---

## Quick Start

```typescript
import {
  withRetailGuardProvider,
  announceGuardedProvider,
  resolveInjectedEthereum,
  type RetailGuardConfig,
} from "@slivervine/eip1193-agentic-wallet-guard";

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
  name: "EIP-1193 Agentic Wallet Guard",
  rdns: "io.slivervine.agenticretailwalletguard",
});
```

---

## Defense Layers

### Layer 1: Phishing/Approval Guard

| Threat | Guard | Reason code |
|--------|-------|-------------|
| Infinite ERC20 `approve` | `evaluateRetailApproveGate` | `UNAUTHORIZED_SPENDER_REJECTED` |
| Permit2 `approve` / `permit` (`0x87517c45` / `0x2a0886f7`) | `parseTransactionCalldata` | `UNAUTHORIZED_SPENDER_REJECTED` |
| EIP-712 `verifyingContract` drift | `evaluateRetailVenueAllowlist` | `VENUE_DRIFT_REJECTED` |
| Honeypot slippage | `evaluateRetailSoilGate` | `SLIPPAGE_EXCEEDED` |

### Layer 2: Agent Intent Inspector

Guards LLM-driven wallets against hallucinated spenders, venue drift, and prompt-injected swaps. See [`04_AI_INTENT_PROTECTION_MODEL.md`](./02_EXOMESH_PROVIDER_GUARD_SPEC.md).

### Layer 3: Retry Storm Circuit Breaker (`INTENT_RING_U32`)

4th rapid `eth_sendTransaction` within a session severs the signing channel:

- `MAX_ATTEMPTS_EXCEEDED_SEVERED` → `CHANNEL_SEVERED`

### Layer 4 — RPC Transport Stream Sync

EIP-1193 transport lane monitor (`transport-stream.ts`). Surfaces `RPC_TRANSPORT_SYNC_FAILED` when stream synchronization cannot be recovered under load (nonce-safe pause).

---

## CLI Demonstration (`pnpm demo:eip1193`)

Interactive Tier 0 entrypoint for judges and integrators — wraps the same production SDK path as unit tests, with browser-level narrative.

| Command | Output |
|---------|--------|
| `pnpm demo:eip1193` | Scenario **A–D State Matrix** · `JUDGE_SAFE` clock · TTY `[PRESS ENTER]` recording pauses · `[PRODUCTION ALERT]` echoes `plainTextWarning` |
| `pnpm demo:eip1193 -- --json` | JSON array: `{ scenario, status, wasmUs, code, plainTextWarning }` — no ANSI |
| `pnpm demo:eip1193 -- --trip` | Scenario **C–D** shortcut (FAIL_CLOSED + channel severance) |

**Alert SSOT:** Rejection strings originate from `formatRetailWarning()` in [`warnings.ts`](../../src/sdk/eip1193-agentic-wallet-guard/warnings.ts), surfaced on `RetailGuardRejectedError.plainTextWarning`. The demo **does not hardcode** production alert copy — it echoes the thrown error after `withRetailGuardProvider()` intercept.

**0-Gas pre-consensus:** Guarded methods (`eth_sendTransaction`, `eth_signTypedData_v4`, `wallet_sendCalls`) abort at the SDK layer on reject — **no calldata reaches the Sequencer**.

**Dual-track verification:**

| Track | Entrypoint | Coverage |
|-------|------------|----------|
| Interactive CLI | `pnpm demo:eip1193` | 4 core state scenarios (A–D) · independent replays |
| Unit SSOT | `npx vitest run tests/sdk/retail-guard-provider.test.ts` | **35/35 PASS** · all **7** `RetailGuardReasonCode` variants |

Source: [`examples/eip1193-provider-demo.ts`](../../examples/eip1193-provider-demo.ts) · [`examples/lib/eip1193-breakthrough-helpers.ts`](../../examples/lib/eip1193-breakthrough-helpers.ts)

### EIP-1193 Terminal HUD Representation

Representative `pnpm demo:eip1193` output (ANSI stripped). Wasm μs bands vary slightly per host; compare runs under `Clock: JUDGE_SAFE (Deterministic Audit Epoch)`.

**Slogan:** Universal EIP-1193 Pre-Consensus Guard — Tailor-made for Robinhood Chain & Omni-EVM AI Agents

#### Scenario A — ALLOW_PASSTHROUGH (Healthy Intent)

```text
Scenario A: 🟢 ALLOW_PASSTHROUGH (Healthy Intent)
════════════════════════════════════════════════════════════════════════════════════════

[EIP-1193] Ingress Intercept -> window.ethereum.request({ method: 'eth_sendTransaction' })
[INTENT PAYLOAD] Deposit $2,500.00 USDC into GMX ETH/USDC GM Vault (0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PAYLOAD PARSER: ERC-20 Approve / GMX GM Deposit -> 0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F
│ [EIP-712] DOMAIN: ChainId: 42161 (Arbitrum One) | Verifier: VERIFIED
│ WASM REFLEX: ⚡ 2.1µs Pure Wasm Core Soil Check -> CLEAN (0-Gas Allowed)
└────────────────────────────────────────────────────────────────────────────────────────┘
  [FORWARD] [EIP-1193] Guarded Provider -> Dispatched to Sequencer RPC

RESULT: 🟢 EIP-1193 PASSTHROUGH ALLOWED (Pre-Consensus Verified Clean)
```

#### Scenario C — FAIL_CLOSED_INTERCEPT (Breakthrough Defense Matrix + 0-Gas Proof)

```text
Scenario C: 🛑 FAIL_CLOSED_INTERCEPT (Toxic Intent Interception)
════════════════════════════════════════════════════════════════════════════════════════

[EIP-1193] Ingress Intercept -> window.ethereum.request({ method: 'eth_signTypedData_v4' })
[INTENT VALUATION] Phishing Cross-Venue Route | Attempted Exposure: $2,500.00 USDC

🔥 [BREAKTHROUGH DEFENSE MATRIX TRIGGERED] (diagnostic preview)
├── [EIP-712 GUARD] Phishing Attack: VerifyingContract Mismatch! (VENUE_DRIFT_REJECTED) (diagnostic preview)
├── [PERMIT2 GUARD] Infinite Approve Blocked for Untrusted Spender! (UNAUTHORIZED_SPENDER_REJECTED) (diagnostic preview)
├── [ERC-7683 GATE] Cross-Chain Solver MEV Bps (10090bps) > Safety Limit! · SLIPPAGE_OVERSHOOT (diagnostic preview)
└── [PRE-CONSENSUS] 0-Gas Wasm Intercept armed for toxic EIP-712 ingress (diagnostic preview)

[PRODUCTION ALERT] (warnings.ts · VENUE_DRIFT_REJECTED) ALERT: Signature blocked — contract 0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb is not on your approved venue whitelist (anti-phishing).

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚨 PRE-CONSENSUS BREAKTHROUGH PROOF
│  ▸ WASM REFLEX TIME : ⚡ 0.6µs Pure Wasm Core (Sub-10ms Wasm Core Execution)
│  ▸ GAS BURNED       : 0.000000 ETH (0 Bytes Broadcasted to Sequencer)
│  ▸ CAPITAL PROTECTED: $2,500.00 USDC (lostUsd = $0.00 · 100% Principal Preserved)
│  ▸ PROVIDER ISOLATED: Aborted at Browser/SDK Layer via [EIP-1193] Middleware
└────────────────────────────────────────────────────────────────────────────────────────┘

RESULT: 🛑 FAIL_CLOSED_INTERCEPT (0-Gas Intercepted BEFORE RPC Ingress)
```

#### Scenario D — CHANNEL_SEVERED (Hot-Key Circuit Breaker)

```text
Scenario D: 🔒 CHANNEL_SEVERED (Hot-Key Circuit Breaker)
════════════════════════════════════════════════════════════════════════════════════════

[EIP-1193] Ingress Intercept -> window.ethereum.request({ method: 'eth_sendTransaction' })

[PRODUCTION ALERT] (warnings.ts · MAX_ATTEMPTS_EXCEEDED_SEVERED) ALERT: Too many rapid submit attempts (4) — signing channel severed to prevent panic trading.
[PRODUCTION ALERT] (warnings.ts · CHANNEL_SEVERED) ALERT: Signing channel is severed — wait before retrying (FOMO throttle active).

[CIRCUIT BREAKER] R17 Hot Key Signature Channel SEVERED — All subsequent signing requests hard-blocked (0-Gas)
[CHANNEL SEVER] 4th Rapid Attack Attempt -> EIP-712 Signature Channel SEVERED (MAX_ATTEMPTS_EXCEEDED_SEVERED)
  [CHANNEL STATE] isRetailGuardChannelSevered=true · follow-up=CHANNEL_SEVERED

RESULT: 🔒 CHANNEL_SEVERED (Signature Pipeline Permanently Closed · Gate 0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1)
```

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
| [`02_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md`](./04_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md) | Competitive matrix · grant strategy |
| [`03_ARCHITECTURE_AND_MOAT.md`](./05_ARCHITECTURE_AND_MOAT.md) | Competitive positioning · paradigm shift |
| [`04_AI_INTENT_PROTECTION_MODEL.md`](./02_EXOMESH_PROVIDER_GUARD_SPEC.md) | LLM / agent threat model |
| [`../ARB_Buildathon/SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) | Buildathon submission SSOT |
| [`../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md) | Wasm reflex core · §3.7 |

---

*SilverVine Labs · `@slivervine/eip1193-agentic-wallet-guard` · Apache-2.0*
