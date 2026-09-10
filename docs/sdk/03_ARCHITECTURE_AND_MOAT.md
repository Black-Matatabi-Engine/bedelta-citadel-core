# Architecture & Competitive Moat — Robinhood Agentic & Retail Wallet Guard SDK

> **License:** Apache-2.0 (TypeScript wrapper) · proprietary reflex math in `pkg/soil_core.wasm`  
> **Package:** `@slivervine/robinhood-agentic-retail-wallet-guard`  
> **Source:** [`src/sdk/robinhood-agentic-retail-wallet-guard/`](../../src/sdk/robinhood-agentic-retail-wallet-guard/)

---

## Paradigm Shift: Server Simulation vs. Edge Wasm Pre-Consensus Policy Reflex

| Dimension | Server Simulation (Blockaid, Blowfish, WalletConnect Scan) | Edge Wasm Pre-Consensus Policy Reflex (Wallet Guard) |
|-----------|--------------------------------------------------------------|--------------------------------------------------------|
| **Execution locus** | Remote RPC / SaaS API round-trip | In-browser / Edge Worker **before** wallet signature |
| **Latency budget** | 200–800 ms (network + simulation farm) | **< 0.014 ms** reflex arc (u32 ring + scratch buffers) |
| **Gas on reject** | N/A (post-hoc warning) or user already signed | **0-Gas fail-closed** — tx never reaches `eth_sendRawTransaction` |
| **Trust model** | Third-party sees full calldata + address graph | Self-hosted policy; Wasm IP core optional |
| **Offline / air-gap** | Requires connectivity | Deterministic TS fallbacks when Wasm unavailable |
| **Agent / LLM binding** | Bolt-on after intent formed | **Pre-consensus** intent ring (`INTENT_RING_U32`) severs retry storms |

**Fundamental thesis:** Simulation vendors answer *"What will this tx do on-chain?"* after the user (or agent) has already committed to signing. The Wallet Guard answers *"Is this invocation allowed under the user's declared mandate?"* **before** any cryptographic commitment — a reflex arc, not a retrospective audit.

```text
[Legacy Stack]
  dApp → wallet popup → sign → broadcast → Blockaid/Blowfish simulation → warning (too late)

[Wallet Guard Stack]
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

### Pillar 2 — AI Agent Hallucination & Prompt Injection Intent Binding

See [`04_AI_INTENT_PROTECTION_MODEL.md`](./04_AI_INTENT_PROTECTION_MODEL.md).

### Pillar 3 — Multi-Submit FOMO / Panic Retry Storm Severing (`INTENT_RING_U32`)

`INTENT_RING_U32` (256-slot FNV-indexed ring) tracks attempt budgets per wallet session — **O(1)**, **zero-GC**, mirrored in Rust (`intent_core.rs`) and Solidity (`IntentRingSlabLib.sol`).

---

## Integration Surfaces

```typescript
import {
  withRetailGuardProvider,
  announceGuardedProvider,
  resolveInjectedEthereum,
} from "@slivervine/robinhood-agentic-retail-wallet-guard";

const guarded = withRetailGuardProvider(window.ethereum, config);

announceGuardedProvider(window.ethereum, config, {
  name: "Robinhood Agentic & Retail Wallet Guard",
  rdns: "io.slivervine.agenticretailwalletguard",
});
```

---

## RPC Transport Stream Sync

[`transport-stream.ts`](../../src/sdk/robinhood-agentic-retail-wallet-guard/transport-stream.ts) maintains EIP-1193 **RPC transport stream synchronization** bound to `CALLDATA_SCRATCH` and `INTENT_RING_U32`. Surfaces `RPC_TRANSPORT_SYNC_FAILED` when synchronization cannot be recovered under sustained load.

---

## Related Documents

- [`README.md`](./README.md) — documentation index
- [`01_SDK_INTEGRATION_BLUEPRINT.md`](./01_SDK_INTEGRATION_BLUEPRINT.md) — integration blueprint
- [`02_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md`](./02_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md) — market intelligence
- [`04_AI_INTENT_PROTECTION_MODEL.md`](./04_AI_INTENT_PROTECTION_MODEL.md) — LLM / agent threat model
- [`../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md`](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md) — Wasm reflex core · §3.7
