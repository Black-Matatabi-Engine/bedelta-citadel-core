# Robinhood Retail Guard SDK

> **License:** [Apache-2.0](./LICENSE)  
> **Module:** `@slivervine/robinhood-retail-guard` · `src/sdk/robinhood-retail-guard/`  
> **Also known as:** EIP-1193 Retail Guard SDK (omni-chain EVM middleware)

Ultra-lightweight **EIP-1193 provider middleware** that intercepts `eth_sendTransaction` and `eth_signTypedData_v4` **before** the host wallet signs — enforcing fail-closed retail policy with **zero on-chain gas** on rejection paths.

---

## Why Retail Guard?

Server-side transaction simulators (Blockaid, Blowfish, etc.) answer *what will this tx do?* **after** the user commits to signing. Retail Guard answers *is this invocation allowed under the user's mandate?* **before** any cryptographic commitment — a pre-consensus reflex arc in the browser or Edge Worker.

---

## Key Features

### Pre-Consensus 0-Gas Interception

- Blocks infinite ERC-20 `approve` (`UINT256_MAX`) for untrusted spenders
- Parses **Permit2** calldata (`0x2a0886f7` permit · `0x87517c45` approve) via zero-allocation `CALLDATA_SCRATCH`
- Rejects EIP-712 Permit phishing (`verifyingContract` drift · untrusted `message.spender`)
- Returns `RetailGuardRejectedError` with plain-text `ALERT:` warnings — tx never reaches `eth_sendRawTransaction`

### AI Agent Intent Protection

Guards LLM-driven wallets (ElizaOS, LangChain, Virtuals, custom copilots) against:

- Hallucinated approve / spender targets
- Venue drift outside `allowedVenues[]`
- Honeypot slippage (soil lane fuse via `pkg/soil_core.wasm` or TS fallback)
- **4th-submit retry storms** — `INTENT_RING_U32` attempt budget severs the signing channel (`MAX_ATTEMPTS_EXCEEDED_SEVERED` → `CHANNEL_SEVERED`)

See [`AI_INTENT_PROTECTION.md`](./AI_INTENT_PROTECTION.md) for the full threat model.

### EIP-6963 Multi-Provider Discovery

Register the guarded provider for wallet discovery alongside MetaMask, Rabby, and other injected wallets:

```typescript
import { announceGuardedProvider } from "@slivervine/robinhood-retail-guard";

announceGuardedProvider(window.ethereum, config, {
  name: "Robinhood Retail Guard",
  rdns: "io.slivervine.retailguard",
});
```

Falls back to guarded-only wrap when `CustomEvent` / `window` is unavailable (SSR, Node harnesses).

### Living Water Telemetry

[`livingwater-telemetry.ts`](./livingwater-telemetry.ts) provides an in-browser **health and execution performance monitor**:

- `evaluateLivingWaterHealth()` — latency snapshot (`coreLatencyUsec`) and integrity probe
- `verifyTelemetryWatermark()` — binds SDK state to the shared `INTENT_RING_U32` sentinel
- Surfaces `LIVING_WATER_DRIFT` when telemetry consistency cannot be recovered under load

---

## Quick Start

### Install & Wrap Provider

```typescript
import {
  withRetailGuardProvider,
  announceGuardedProvider,
  resolveInjectedEthereum,
  type RetailGuardConfig,
} from "@slivervine/robinhood-retail-guard";

const config: RetailGuardConfig = {
  walletAddress: "0xYourWallet…",
  allowedVenues: [
    "0xGmxRouter…",
    "0xUniswapRouter…",
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

// Option A — direct wrap
const guarded = withRetailGuardProvider(window.ethereum, config);

// Option B — EIP-6963 announce + wrap
const injected = resolveInjectedEthereum();
if (injected) {
  announceGuardedProvider(injected, config);
}

// Use guarded provider like any EIP-1193 provider
const hash = await guarded.request({
  method: "eth_sendTransaction",
  params: [{ from: config.walletAddress, to: "0xGmxRouter…", value: "0x0" }],
});
```

### Error Handling

```typescript
import { RetailGuardRejectedError } from "@slivervine/robinhood-retail-guard";

try {
  await guarded.request({ method: "eth_sendTransaction", params: [tx] });
} catch (err) {
  if (err instanceof RetailGuardRejectedError) {
    console.warn(err.plainTextWarning); // user-facing ALERT copy
    console.debug(err.code);          // e.g. UNAUTHORIZED_SPENDER_REJECTED
  }
}
```

---

## Architecture

```text
[EIP-1193 Provider]
  → withRetailGuardProvider / announceGuardedProvider (Apache-2.0 TS)
  → livingwater-telemetry (health probe)
  → calldata-parser (u32 selectors: ERC20 · Permit2 · routers)
  → guard-engine (approve · venue · soil · intent gates)
  → wasm-adapter → pkg/soil_core.wasm (optional proprietary reflex core)
  → [PASS] forward to base wallet
  → [FAIL] RetailGuardRejectedError (0-Gas)
```

**IP boundary:** TypeScript wrapper, calldata classification, policy config, and user warnings are Apache-2.0. Core slippage fusion and Wasm-accelerated intent math live in `pkg/soil_core.wasm` when loaded; deterministic TS fallbacks run in Vitest and offline harnesses.

---

## Module Map

| File | Role |
|------|------|
| `provider.ts` | EIP-1193 middleware · EIP-6963 `announceGuardedProvider` |
| `risk-evaluator.ts` | Unified `evaluateRetailRisk` orchestration |
| `guard-engine.ts` | Approve · venue · soil · intent · Living Water gates |
| `calldata-parser.ts` | Bitwise selector dispatch (`CALLDATA_SCRATCH`) |
| `livingwater-telemetry.ts` | Health & performance telemetry |
| `wasm-adapter.ts` | `pkg/soil_core.wasm` FFI boundary |

---

## Testing

```bash
npx vitest run tests/sdk/
```

**Baseline:** **48/48 PASS** (5 test files) — includes calldata parsing, EIP-6963, Permit2, intent ring severance, and Living Water telemetry.

---

## Related Documents

- [`ARCHITECTURE_AND_MOAT.md`](./ARCHITECTURE_AND_MOAT.md) — competitive positioning & dual-brand strategy
- [`AI_INTENT_PROTECTION.md`](./AI_INTENT_PROTECTION.md) — LLM / agent threat model
- [`docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md`](../../../docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md) — Wasm reflex core SSOT

---

*SilverVine Labs · Robinhood Retail Guard SDK · Apache-2.0*
