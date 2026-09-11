# Standard Compliance & ERC/EIP Wiki

> **Product:** **SliverVine Citadel Shield** — Pre-Consensus Intent Firewall & Execution Safety Primitive  
> **Protocol:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) · Santenmoku internal engine  
> **Document:** Standards Compliance & ERC/EIP Reference Wiki · **Vitest SSOT:** **225 test files | 1052 PASS clean**  
> **Architecture index:** [`README.md`](./README.md) · [`01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md) · [`02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) · [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md) · **This file**

Official infrastructure standards map — each row links a public ERC/EIP (or venue spec) to Citadel implementation anchors and verification. The **ERC/EIP Standards Reference Wiki** below is the formal deep-dive for AA, attestation, asset-escrow, and on-chain coprocessor standards.

Citadel binds **ERC-4337** · **EIP-7562** · **EIP-712** · **ERC-1271** · **EIP-1193** · **EIP-6963** · **ERC-20/777** · **OpenZeppelin v5** · **ERC-7579** · **EIP-7702** · **ERC-7683** · **ERC-7710** · **ERC-7715** · **ERC-8196** (Final) · **EIP-1559** · **Arbitrum Stylus SDK** · **ArbOS / Stylus** · **Robinhood Chain Ingress** · **Wasm `soil_core`** — each mapped to implementation anchors and verification probes in this wiki ([active matrix](#active-evm-standard-compliance-matrix-v10-production) · [emerging standards moat](#emerging-standards--edge-wasm-reference-implementations-erc-8196-erc-77158226-eip-80798105) · [next-gen EIP defense matrix](#next-gen-eip-defense-matrix-erc-7683-eip-7702-erc-7710) · [summary table](#standards-summary-table) · [compliance posture](#compliance-posture) · [ArbOS/Stylus](#arbos-stylus-alignment-code-verified-on-chain-coprocessor) · [RPC/WSS](#infrastructure-rpc-wss-alchemy-ha)).

---

## Active EVM Standard Compliance Matrix (v1.0 Production)

Five standards form the **active C-end / on-chain compliance spine** — each row maps to live TypeScript or Solidity SSOT in this repository.

| # | Standard | Citadel role | Implementation anchor | Verification |
|---|----------|--------------|----------------------|--------------|
| **1** | **[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)** | Universal provider middleware — pre-consensus `request()` intercept | [`withRetailGuardProvider()`](../../src/sdk/eip1193-agentic-wallet-guard/provider.ts) · guards `eth_sendTransaction` / `eth_signTypedData_v4` | `npx vitest run tests/sdk/retail-guard-provider.test.ts` **35/35** |
| **2** | **[EIP-6963](https://eips.ethereum.org/EIPS/eip-6963)** | Multi-injected provider discovery & guarded announcer | [`announceGuardedProvider()`](../../src/sdk/eip1193-agentic-wallet-guard/provider.ts) · `eip6963:announceProvider` / `eip6963:requestProvider` · default `rdns`: `io.slivervine.agenticretailwalletguard` | EIP-6963 announce/request cases in [`retail-guard-provider.test.ts`](../../tests/sdk/retail-guard-provider.test.ts) |
| **3** | **[EIP-712](https://eips.ethereum.org/EIPS/eip-712)** | Off-chain typed structured data parsing & **pre-signing severance** | Retail Guard: [`risk-evaluator.ts`](../../src/sdk/eip1193-agentic-wallet-guard/risk-evaluator.ts) (`eth_signTypedData_v4`) · Gate: [`SliverVineGate.sol`](../../SliverVineGate/src/SliverVineGate.sol) · severance: [`root-protection-core.ts`](../../src/core/root-protection-core.ts) · [`risk-severance.ts`](../../src/core/risk-severance.ts) | Forge Gate I1–I12 · `pnpm demo:gmx -- --trip` (FAIL_CLOSED before broadcast) |
| **4** | **[ERC-4337](https://eips.ethereum.org/EIPS/eip-4337)** / **[ERC-7579](https://eips.ethereum.org/EIPS/eip-7579)** | Agentic modular AA on-chain policy guard | [`SliverVineAgentPolicyGuardV2.sol`](../../contracts/src/SliverVineAgentPolicyGuardV2.sol) · live **42161** [`0xfd98cadb…8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) · ZeroDev Kernel v3 session modules · [`src/adapters/arbitrum/zerodev-aa/`](../../src/adapters/arbitrum/zerodev-aa/) | Forge PolicyGuard **9/9** · `zerodev-aa-gate.test.ts` |
| **5** | **ERC-2612** / **Permit2** | Zero-gas allowance extraterritorial defense — block toxic approvals pre-broadcast | On-chain calldata: [`calldata-parser.ts`](../../src/sdk/eip1193-agentic-wallet-guard/calldata-parser.ts) (`SEL_ERC20_APPROVE` · `SEL_PERMIT2_APPROVE` · `SEL_PERMIT2_PERMIT`) · off-chain permit: [`risk-evaluator.ts`](../../src/sdk/eip1193-agentic-wallet-guard/risk-evaluator.ts) (`UNAUTHORIZED_SPENDER_REJECTED` on EIP-712 permit) | Permit2 approve/permit parse + block tests in [`retail-guard-provider.test.ts`](../../tests/sdk/retail-guard-provider.test.ts) |

> **ERC-8196 attribution (not a product venue):** [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) is documented below as **Factual EIP Attribution & Historical Co-authoring Reference** (Virtuals Protocol co-authored the finalized standard). It is **not** a native venue adapter in the 5-Core Venue Matrix — see [§ ERC-8196](#erc-8196--factual-eip-attribution--historical-co-authoring-reference-not-a-venue-adapter).

### Live SSOT Anchors

| Anchor | Value |
|--------|-------|
| **Vitest baseline** | **225 test files | 1052 PASS clean** · `pnpm test -- --run` · `pnpm exec tsc --noEmit` **0 errors** |
| **Wasm hot path** | `pkg/soil_core.wasm` **< 28 KiB** · warm exec **< 60 µs** · Edge p50 ~106 µs |
| **Worker bundle** | **143.77 KiB raw** · **50.94 KiB gzip** hot-path (`pnpm bundle:measure` · `limitKiB: 150` · `pass: true`) |
| **Arbitrum One Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Arbiscan](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **Stylus coprocessor** | `SliverVineSoilCoprocessor` · [`contracts/stylus-probe/src/lib.rs`](../../contracts/stylus-probe/src/lib.rs) · Stylus SDK **0.10.7** · `cargo test` **9/9 PASS** |

---

## Emerging Standards & Edge-Wasm Reference Implementations (ERC-8196, ERC-7715/8226, EIP-8079/8105)

Citadel's **Pre-Consensus Edge-Wasm Reference Implementation Moat** ships production code **before** several emerging AI-agent and client-gateway standards finalize — Edge `pkg/soil_core.wasm` + EIP-1193 middleware form the off-chain reflex plane; on-chain PolicyGuard anchors settlement.

```text
[ LLM / Agent Intent ]
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│ Layer A — EIP-1193 Retail Guard (ERC-8196 off-chain RI)     │
│ withRetailGuardProvider() · calldata-parser · guard-engine  │
│ p50 ~106µs E2E · p50 ~15µs reflex · 0-Gas on reject         │
└───────────────────────────┬───────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────┐
│ Layer B — Session mandate attenuation (ERC-7715/8226-class) │
│ INTENT_RING_U32 · session-key-guard · agentic-auto-roll     │
└───────────────────────────┬───────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────┐
│ Layer C — Pre-consensus gateway (EIP-8079/8105-class)       │
│ Local simulation + instant reject BEFORE L2 Sequencer       │
└───────────────────────────┬───────────────────────────────┘
                            ▼
              [ Arbitrum Sequencer / Bundler ingress ]
```

### ERC-8196 / ERC-8118 — AI Agent Authenticated Wallet (Off-Chain Reference Implementation)

| Layer | Citadel binding | SSOT |
|-------|-----------------|------|
| **Off-chain RI (primary)** | [`withRetailGuardProvider()`](../../src/sdk/eip1193-agentic-wallet-guard/provider.ts) — EIP-1193 middleware implementing ERC-8196-class **pre-execution policy** for AI agent wallets **before** `eth_sendTransaction` reaches any RPC or mempool | [`risk-evaluator.ts`](../../src/sdk/eip1193-agentic-wallet-guard/risk-evaluator.ts) · [`guard-engine.ts`](../../src/sdk/eip1193-agentic-wallet-guard/guard-engine.ts) |
| **Calldata / prompt-injection defense** | u32 selector dispatch on toxic calldata (approve · Permit2 · router swaps) — **non-semantic bytecode predicates** immune to NL jailbreak at signing layer | [`calldata-parser.ts`](../../src/sdk/eip1193-agentic-wallet-guard/calldata-parser.ts) |
| **Edge Wasm soil fuse** | `evaluateSoilViaWasm()` / `checkSoilResistance()` — sub-ms bitmask evaluation on slippage · depth · cross-venue drift | [`wasm-adapter.ts`](../../src/sdk/eip1193-agentic-wallet-guard/wasm-adapter.ts) · [`soil-resistance-core.ts`](../../src/core/soil-resistance-core.ts) |
| **On-chain anchor** | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) **Final** — [`SliverVineAgentPolicyGuardV2.sol`](../../contracts/src/SliverVineAgentPolicyGuardV2.sol) settlement-plane policy screen | Live **42161** [`0xfd98cadb…8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) |
| **ERC-8118 (emerging)** | Draft companion for authenticated agent wallet surfaces — Citadel aligns via EIP-1193 RI + PolicyGuard V2; **not** a separate product adapter · **no public EIP page yet** | [§ ERC-8196 / ERC-8118](#erc-8196--erc-8118--ai-agent-authenticated-wallet-off-chain-reference-implementation) |

**0-Gas invariant:** Rejected intents throw `RetailGuardRejectedError` locally — **no Sequencer gas** consumed. Latency: **p50 ~106µs** E2E Edge Shield · **p50 ~15µs** Wasm reflex core on `--trip` severance (sub-10ms wall-clock budget, deterministic).

### ERC-7715 / ERC-8226 — Advanced Session Permissions & Attenuation

| Concern | Citadel implementation | SSOT |
|---------|------------------------|------|
| **Scoped session mandates** | `allowedVenues[]` bitmask · `VENUE_DRIFT_REJECTED` on unauthorized venue hops | [`intent-mandate.ts`](../../src/core/intent-mandate.ts) · [`guard-engine.ts`](../../src/sdk/eip1193-agentic-wallet-guard/guard-engine.ts) |
| **Session-key TTL / clip** | `verifySessionKeyValidity()` — expiry + clock-drift buffer before HL order broadcast | [`session-key-guard-core.ts`](../../src/core/session-key-guard-core.ts) |
| **Zero-gas attempt attenuation** | `INTENT_RING_U32` ring slab — `trackAttemptBudgetU32Pure()` · default **3 attempts** → `MAX_ATTEMPTS_EXCEEDED_SEVERED` · `severSigningChannel()` | [`intent-core-ring.ts`](../../src/core/intent-core-ring.ts) · [`intent-core-buffers.ts`](../../src/core/intent-core-buffers.ts) |
| **Pendle Shield Option 3 (agentic roll)** | `evaluateAgenticRollGate()` — PT/YT roll actions gated by yield drift · expiry · hallucinated amount · shared `INTENT_RING_U32` attempt budget | [`agentic-auto-roll-gate.ts`](../../src/services/api/pendle-shield/agentic-auto-roll-gate.ts) |
| **ERC-8226 (emerging)** | Permission attenuation / delegation decay — aligned via Kernel v3 session modules + `INTENT_RING_U32` severance; universal ERC-8226 wallet API ⏳ post-grant | [`zerodev-aa-gate.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-gate.ts) · [§ ERC-7715 posture](#compliance-posture) |

**Verification:** `npx vitest run tests/sdk/retail-guard-provider.test.ts` **35/35** · `npx vitest run tests/core/intent-sinking-audit.test.ts` **8/8** · Pendle roll gate unit tests.

### EIP-8079 / EIP-8105 — Client-Side Pre-Consensus Security Gateway

| Property | Citadel Guard Engine behavior | SSOT |
|----------|------------------------------|------|
| **Pre-confirmation simulation** | `evaluateRetailRisk()` runs full policy stack (transport sync · calldata parse · approve gate · venue allowlist · soil Wasm) **locally** before wallet broadcast | [`guard-engine.ts`](../../src/sdk/eip1193-agentic-wallet-guard/guard-engine.ts) · [`provider.ts`](../../src/sdk/eip1193-agentic-wallet-guard/provider.ts) |
| **Instant local rejection** | Fail-closed paths never call `baseProvider.request()` — tx does not enter L2 Sequencer queue | `RetailGuardRejectedError` in [`provider.ts`](../../src/sdk/eip1193-agentic-wallet-guard/provider.ts) |
| **EIP-8079-class alignment** | Client-side security firewall between dApp/agent and wallet — **0-Gas** pre-consensus intercept | Retail Guard SDK · Edge Worker `checkSoilResistance()` |
| **EIP-8105-class alignment** | Pre-execution intent validation + local rejection before chain confirmation — Wasm bitmask parallel eval | [`wasm-soil-ffi.ts`](../../src/core/wasm-soil-ffi.ts) · `pkg/soil_core.wasm` |

> **Moat thesis:** Competitors optimize **post-execution** analytics or **on-chain** governance delays. Citadel's Edge-Wasm RI executes **pre-Sequencer** — the only tier that can sever EIP-712 at **p50 ~15µs** with **$0 gas** on rejection.

### Next-Gen EIP Defense Matrix (ERC-7683, EIP-7702, ERC-7710)

Production guards on `feat/nextgen-eips-moat` extend the Pre-Consensus Edge-Wasm moat into cross-chain intents, EOA delegation, and zero-gas intent expiry — each bound to a dedicated Vitest proof anchor.

| Standard | Architectural gap | Citadel breakthrough | Implementation SSOT | Verification |
|----------|-------------------|----------------------|---------------------|--------------|
| **[ERC-7683](https://eips.ethereum.org/EIPS/eip-7683)** *(Cross-Chain Intent Standard)* | Solver MEV and slippage exploitation on `CrossChainOrder` fills before signature release | Client-side Edge-Wasm pre-signature simulation — execution delta + solver MEV bps gate (**sub-10ms**) | [`erc7683-intent-guard.ts`](../../src/sdk/eip1193-agentic-wallet-guard/erc7683-intent-guard.ts) | [`tests/sdk/erc7683-intent-guard.test.ts`](../../tests/sdk/erc7683-intent-guard.test.ts) **3/3 PASS** |
| **[EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)** *(Set EOA Account Code)* | Prompt-injected EOA delegation can install malicious implementation bytecode pre-broadcast | Decodes `authorization` tuples · whitelisted implementation invariant matrix · blocked-address denylist | [`eip7702-auth-guard.ts`](../../src/sdk/eip1193-agentic-wallet-guard/eip7702-auth-guard.ts) | [`tests/sdk/eip7702-auth-guard.test.ts`](../../tests/sdk/eip7702-auth-guard.test.ts) **3/3 PASS** |
| **[ERC-7710](https://eips.ethereum.org/EIPS/eip-7710)** *(Intent Delegations & Expiry)* | No zero-gas cancellation path when soil resistance trips before sequencer inclusion | Couples `rootProtection()` (**p50 ~15µs**) with Permit2 deadline expiry cancellation signal on soil trip | [`erc7710-intent-expiry.ts`](../../src/services/api/pendle-shield/erc7710-intent-expiry.ts) | [`tests/services/api/erc7710-intent-expiry.test.ts`](../../tests/services/api/erc7710-intent-expiry.test.ts) **2/2 PASS** |

```text
[ CrossChainOrder / EIP-7702 auth / ERC-7710 delegation ]
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│ Layer D — ERC-7683 cross-chain intent guard                 │
│ erc7683-intent-guard.ts · solver MEV bps · slippage delta  │
└───────────────────────────┬───────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────┐
│ Layer E — EIP-7702 authorization inspector                  │
│ eip7702-auth-guard.ts · bytecode invariant · whitelist      │
└───────────────────────────┬───────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────┐
│ Layer F — ERC-7710 zero-gas expiry + rootProtection()       │
│ erc7710-intent-expiry.ts · p50 ~15µs severance on soil trip │
└───────────────────────────┬───────────────────────────────┘
                            ▼
              [ Arbitrum Sequencer / Bundler ingress ]
```

---

## Standards Summary Table

| Standard | Role in Citadel | Implementation anchor | Verification |
|----------|-----------------|----------------------|--------------|
| **[ERC-4337](https://eips.ethereum.org/EIPS/eip-4337)** | Account Abstraction — scoped agent UserOps without hot-wallet custody | ZeroDev Kernel **v0.3.1** · EntryPoint **v0.7** · `src/adapters/arbitrum/zerodev-aa/` · `zerodev-aa-userop.ts` | ZeroDev AA gate · `eth_supportedEntryPoints` probe · aa-adapter tests |
| **[EIP-7562](https://eips.ethereum.org/EIPS/eip-7562)** | AA storage-access rules — **Zero-Bundler-Rejection Invariant** | Session-key `callData` whitelist · static breaker · `BUNDLER_TIMEOUT_FAIL_CLOSED` | Bundler smoke probe · `zerodev-aa-bundler.ts` |
| **[EIP-712](https://eips.ethereum.org/EIPS/eip-712)** | Typed structured data hashing · domain binding `SliverVineCitadel` | `SliverVineGate.sol` · `src/sdk/constants.ts` · `evaluateAttestation()` | Forge I1–I12 · SDK citadel tests |
| **[ERC-1271](https://eips.ethereum.org/EIPS/eip-1271)** | Contract signature validation for Kernel smart accounts | ZeroDev Kernel `isValidSignature` · Gate ECDSA m-of-n on `RiskAttestation` | Gate Forge suite · agent-intent SDK |
| **[ERC-20](https://eips.ethereum.org/EIPS/eip-20) / [ERC-777](https://eips.ethereum.org/EIPS/eip-777)** | Non-custodial asset transfer & in-flight escrow semantics | `GMX_USDC_ARBITRUM` · [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) · `GatedExecutor` payload binding | [`tests/adapters/across-ingress-bridge.test.ts`](../../tests/adapters/across-ingress-bridge.test.ts) **6/6** · GMX payload tests |
| **[OpenZeppelin Contracts v5](https://docs.openzeppelin.com/contracts/5.x/)** | On-chain gate access control & reentrancy guard | `SliverVineGate.sol` · OZ `ECDSA.tryRecover` alignment · `IngressSafetySwitch.sol` is a stateless compliance filter (no OZ import) | Foundry Gate **60 passed** · Forge property fuzz |
| **Solidity Custom Errors** | Bytecode-efficient fail-closed ingress (`revert CustomError()`) with telemetry-compatible `ERR_*` bytes32 events | [`SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol) (`SignerZero` · `SloTimeout` · …) · [`IngressSafetySwitch.sol`](../../contracts/IngressSafetySwitch.sol) (`InvalidSigner` · `ComplianceBlocked` · …) — `ERR_SLO_TIMEOUT` / `ERR_INVALID_SIGNER` event constants unchanged for Dune | Foundry oracle/switch tests · Dune `ERR_*` decoders |
| **[ERC-7579](https://eips.ethereum.org/EIPS/eip-7579)** | Modular smart-account modules — session-key permission scopes | ZeroDev Kernel v3 modular session keys · scoped `ORDER_EXECUTE` clip · daily gas sponsorship limits | Gatehouse (Pillar Set X) · agent-intent SDK |
| **[EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)** | EOA Account Abstraction via `SetCode` — `authorization` tuple whitelist + bytecode invariant pre-broadcast | [`eip7702-auth-guard.ts`](../../src/sdk/eip1193-agentic-wallet-guard/eip7702-auth-guard.ts) · Kernel v4 intent composer · [§2.4.5](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#245-zerodev-v4-seven-stages-one-stack-alignment-roadmap-post-grant-spec) | `npx vitest run tests/sdk/eip7702-auth-guard.test.ts` **3/3** · Kernel v4 adapter ⏳ V1.5 |
| **[ERC-7683](https://eips.ethereum.org/EIPS/eip-7683)** | Cross-chain intent standard — solver MEV / slippage pre-signature gate | [`erc7683-intent-guard.ts`](../../src/sdk/eip1193-agentic-wallet-guard/erc7683-intent-guard.ts) | `npx vitest run tests/sdk/erc7683-intent-guard.test.ts` **3/3** |
| **[ERC-7710](https://eips.ethereum.org/EIPS/eip-7710)** | Intent-based delegations & expiry — zero-gas cancellation on soil trip | [`erc7710-intent-expiry.ts`](../../src/services/api/pendle-shield/erc7710-intent-expiry.ts) · `rootProtection()` | `npx vitest run tests/services/api/erc7710-intent-expiry.test.ts` **2/2** |
| **[ERC-7715](https://eips.ethereum.org/EIPS/eip-7715)** | Advanced Wallet Permissions — session-key permission evolution target | [Technical Specification §0.1](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#01-bytecode-predicate-verification-v10-erc-7715-post-grant-design-spec) · [Compliance Posture](#compliance-posture) · `session-key-gates.ts` · ZeroDev Kernel v3 session adapter | ✅ v1.0 Delivered (Kernel v3) · ERC-7715 universal permissions ⏳ Post-Grant |
| **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final)** | **Factual EIP attribution** — AI Agent Wallet Policy standard (Virtuals Protocol co-author); on-chain policy screen via PolicyGuard lineage | [`SliverVineAgentPolicyGuardV2.sol`](../../contracts/src/SliverVineAgentPolicyGuardV2.sol) · [`SliverVineAgentPolicyGuard.sol`](../../contracts/src/SliverVineAgentPolicyGuard.sol) · **not** a pruned Virtuals venue adapter | Foundry PolicyGuard suite · live **42161** [`0xfd98cadb…8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) · [§ ERC-8196](#erc-8196--factual-eip-attribution--historical-co-authoring-reference-not-a-venue-adapter) |
| **[EIP-1559](https://eips.ethereum.org/EIPS/eip-1559)** | Dynamic base-fee congestion sensing on Arbitrum One | Tri-Sensor **BaseFee Velocity** channel · `arbitrum-gas-guard.ts` | Gas-guard tests · Tri-Sensor Matrix |
| **[Arbitrum Stylus SDK](https://github.com/OffchainLabs/stylus-sdk-rs)** (`0.10.7`) | WASM Soil Coprocessor Alignment — on-chain soil parity with Edge | [`contracts/stylus-probe/src/lib.rs`](../../contracts/stylus-probe/src/lib.rs) · `SliverVineSoilCoprocessor` · [Stylus docs](https://docs.arbitrum.io/stylus/reference/overview) | ✅ v1.0 Delivered · `cargo test` **9/9 PASS** · `pnpm build:stylus` · Sepolia deploy pending |
| **ArbOS 61** | Arbitrum L2 execution / Stylus co-residence alignment (⏳ V1.0 Design Spec) | `IngressSafetySwitch.sol` · Elara ingress design · Stylus WASM parity path | Robinhood safety contracts · audit notes |
| **Robinhood Chain Ingress** | Permissioned institutional egress · AML inbound isolation | Chains **46630** (testnet) / **4663** (mainnet filter) · Across bridge · `IngressSafetySwitch.sol` | Robinhood Across bridge tests · audit snapshot |
| **WASM Core (`soil_core`)** | Sub-ms pre-execution soil fuse · Cloudflare Edge hot path | `pkg/soil_core.wasm` · `#![no_std]` Rust · budget **< 28 KiB** · warm exec **< 60 µs** · p50 ~106 µs | Wasm feasibility suite · Pillar Set Y Wasm CoreSpec |
| **[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)** | Ethereum Provider JavaScript API — pre-consensus wallet guard middleware | `withRetailGuardProvider` · [`provider.ts`](../../src/sdk/eip1193-agentic-wallet-guard/provider.ts) · fail-closed on `eth_sendTransaction` / `eth_signTypedData_v4` | `npx vitest run tests/sdk/retail-guard-provider.test.ts` **35/35** · [`01_SDK_INTEGRATION_BLUEPRINT.md`](../sdk/01_SDK_INTEGRATION_BLUEPRINT.md) |
| **[EIP-6963](https://eips.ethereum.org/EIPS/eip-6963)** | Multi Injected Provider Discovery — guarded provider announcement | `announceGuardedProvider` · [`provider.ts`](../../src/sdk/eip1193-agentic-wallet-guard/provider.ts) · `eip6963:announceProvider` / `eip6963:requestProvider` | [`retail-guard-provider.test.ts`](../../tests/sdk/retail-guard-provider.test.ts) · EIP-6963 announce/request |
| **ERC-2612 / Permit2** | Zero-gas allowance extraterritorial defense | [`calldata-parser.ts`](../../src/sdk/eip1193-agentic-wallet-guard/calldata-parser.ts) · [`risk-evaluator.ts`](../../src/sdk/eip1193-agentic-wallet-guard/risk-evaluator.ts) | Permit2 + ERC-20 approve parse/block in retail guard Vitest |
| **Clock / L2 timestamp monotonicity (EIP-1482-class)** | RPC `block.timestamp` high-watermark · leap / NTP fail-closed · multi-provider failover | [`monotonic-time.ts`](../../src/core/monotonic-time.ts) · [`clock_core.rs`](../../src/wasm/clock_core.rs) · [`rpc-radar.ts`](../../src/services/adapters/rpc-radar.ts) | [`tests/clock-monotonicity.test.ts`](../../tests/clock-monotonicity.test.ts) **14/14** · [§ Dual-Engine](../verifications/01_ON_CHAIN_MAINNET_ANCHORS.md#dual-engine-infrastructure-map-frozen--2026-09-10) |

---

## ERC/EIP Standards Reference Wiki

### ERC-4337 — Account Abstraction & UserOperation Structure

> **Deep specification:** [Technical Specification §2.4](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#24-pillar-set-x-opt-in-zerodev-account-abstraction-integration-summary) Pillar Set X — ZeroDev Account Abstraction (Kernel v3/v4 · Paymaster · EIP-7562 · v4 Seven Stages roadmap).

| Field | Citadel binding |
|-------|-----------------|
| **EntryPoint** | `entryPoint07Address` — SSOT `ZERODEV_ENTRY_POINT_ADDRESS` |
| **Kernel** | ZeroDev Kernel **v0.3.1** (`ZERODEV_KERNEL_VERSION`) — v4 adapter swap ⏳ Post-Grant (V1.5)（[§2.4.2](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#242-kernel-v3-v4-session-keys-erc-7579-modular-permissions)） |
| **UserOp draft** | `sender` · `nonce` · `callData` · optional `factory`/`factoryData` · gas limits · `paymaster`/`paymasterData` · `signature` |
| **Paymaster** | ZeroDev `zerodev.sponsorUserOperation` — per-op ≤ $0.50 · daily $10 · `zerodev-aa-gas-ledger.ts` |
| **Pre-broadcast gate** | `verifyAgentIntent()` — `AllowedToSign = Injection ∧ Digest ∧ Soil ∧ Session ∧ Gas ∧ Attestation ∧ Armor ∧ Wasm` |
| **106 µs decoupling** | Shield (`checkSoilResistance` · `pkg/soil_core.wasm`) runs **before** paymaster sign + bundler dispatch — Wasm powers sub-ms latency; ZeroDev is opt-in delivery only |

UserOps are drafted locally, sponsored via ZeroDev paymaster middleware, and submitted only after Edge soil + static-breaker evaluation. Bundler RPC MUST advertise EntryPoint v0.7 (`supportsEntryPoint07`). ZeroDev is the **opt-in non-custodial delivery substrate** (Pillar Set X); Citadel Edge Wasm is the **pre-broadcast decision SSOT** ([§2.4.1](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#241-role-of-zerodev-scoped-session-keys-gas-sponsorship-pillar-set-x-opt-in-aa-layer)).

### EIP-7562 — Account Abstraction Storage Access Rules

**Zero-Bundler-Rejection Invariant:** Citadel UserOps MUST NOT violate EIP-7562 opcode/storage rules during the validation phase; bundler rejection is treated as a **protocol fault**, not a retry signal. See [Technical Specification §2.4.4](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#244-eip-7562-zero-bundler-rejection-invariant).

| Rule | Enforcement |
|------|-------------|
| Validation-phase storage reads | Session-key modules restrict `callData` to whitelisted targets/selectors — no forbidden cross-contract reads |
| Edge pre-screen | `evaluateStaticBreakerMatrix()` — soil first, then gas ledger, before `sendUserOperation()` |
| Fail-closed | Bundler unreachable, missing EP v0.7, or timeout → `BUNDLER_TIMEOUT_FAIL_CLOSED` (`ZERODEV_BUNDLER_FAIL_CLOSED_TIMEOUT_MS` = 3_000`) |
| Verification | `zerodev-aa-bundler.ts` · `supportsEntryPoint07` probe · aa-adapter Vitest suite |

### EIP-712 — Typed Structured Data Hashing & Domain Binding

| Component | Value |
|-----------|-------|
| **Domain `name`** | `SliverVineCitadel` (`EIP712_DOMAIN_NAME`) |
| **Domain `version`** | `1` (`EIP712_DOMAIN_VERSION`) |
| **Domain `chainId`** | Live `block.chainid` — cached immutable in Gate constructor |
| **Domain `verifyingContract`** | `SliverVineGate` address (`SLIVERVINE_GATE_ADDRESS`) |
| **Primary type** | `RiskAttestation(bytes32 payloadHash, address subject, uint8 verdict, uint16 riskBps, uint64 issuedAt, uint64 expiresAt, uint256 nonce)` |
| **Digest** | `keccak256("\x19\x01" ‖ domainSeparator ‖ structHash)` — single-use via `consumed[digest]` at `verifyAndConsume` |

SDK envelopes mirror Gate domain binding: `evaluateAttestation()` rejects mismatched `verifyingContract` or `domainName`. Cross-chain replay is denied at L1 consumption.

### ERC-1271 — Standard Signature Validation Method for Contracts

| Path | Mechanism |
|------|-----------|
| **Kernel (ERC-4337)** | ZeroDev Kernel validates session-key proofs via `isValidSignature(bytes32 hash, bytes signature)` — magic value `0x1626ba7e` |
| **Gate (L1 attestation)** | m-of-n ECDSA on `RiskAttestation` EIP-712 digest — OZ-aligned `ECDSA.tryRecover`, non-malleable `s` |
| **UserOp `signature`** | Module-bound session proof consumed by Kernel validation hook, not raw EOA sig |

Edge `verifyAgentIntent()` validates attestation envelope shape; on-chain ERC-1271 / ECDSA verification occurs at Kernel validateUserOp and Gate `verifyAndConsume` respectively.

### EIP-1193 — Ethereum Provider JavaScript API (Wallet Guard Middleware)

| Field | Citadel binding |
|-------|-----------------|
| **Wrapper** | `withRetailGuardProvider(baseProvider, config)` — proxies `request()` on the injected provider |
| **Guarded methods** | `eth_sendTransaction` · `eth_signTypedData_v4` — evaluated **before** `baseProvider.request()` |
| **Risk stack** | `evaluateRetailRisk()` → RPC transport protocol · calldata parse · approve gate · venue allowlist · soil gate · intent ring |
| **Fail-closed** | `RetailGuardRejectedError` thrown pre-broadcast — **0-Gas** on rejection; tx never reaches RPC |
| **Package** | `@slivervine/eip1193-agentic-wallet-guard` · Apache-2.0 wrapper · Wasm IP `pkg/soil_core.wasm` |

The Wallet Guard is an EIP-1193 **middleware layer**, not a replacement wallet. Integrators wrap `window.ethereum` (or any compliant provider) and retain full downstream signing semantics when policy passes.

### EIP-6963 — Multi Injected Provider Discovery (Guarded Provider Announcement)

| Field | Citadel binding |
|-------|-----------------|
| **Entry** | `announceGuardedProvider(baseProvider, config, options?)` |
| **Announce event** | `eip6963:announceProvider` with `{ info, provider }` detail |
| **Request listener** | `eip6963:requestProvider` → re-announce on dApp discovery |
| **Default metadata** | `name`: `EIP-1193 Agentic Wallet Guard` · `rdns`: `io.slivervine.agenticretailwalletguard` |
| **SSR / Node fallback** | When `dispatchEvent` / `addEventListener` unavailable, returns guarded-only wrap (no EIP-6963 registration) |

EIP-6963 enables dApps to discover the guarded provider alongside MetaMask-class injectors without overwriting `window.ethereum`. Implementation SSOT: [`provider.ts`](../../src/sdk/eip1193-agentic-wallet-guard/provider.ts) (`announceGuardedProvider` — no separate announcer module). See [`01_SDK_INTEGRATION_BLUEPRINT.md`](../sdk/01_SDK_INTEGRATION_BLUEPRINT.md) · [Defense Matrix §3.7](./03_DEFENSE_MATRIX_AND_WASM_CORE.md#37-eip-1193-agentic-wallet-guard-sdk--c-end-eip-1193-middleware).

### ERC-2612 / Permit2 — Zero-Gas Allowance Extraterritorial Defense

| Path | Mechanism | SSOT |
|------|-----------|------|
| **On-chain calldata** | `eth_sendTransaction` → u32 selector dispatch on ERC-20 `approve` · Permit2 `approve` · Permit2 `permit` | [`calldata-parser.ts`](../../src/sdk/eip1193-agentic-wallet-guard/calldata-parser.ts) · `evaluateRetailApproveGate()` in [`guard-engine.ts`](../../src/sdk/eip1193-agentic-wallet-guard/guard-engine.ts) |
| **Off-chain EIP-712 permit (ERC-2612-class)** | `eth_signTypedData_v4` → `verifyingContract` venue allowlist · `allowedSpenders` clip on permit spender | [`risk-evaluator.ts`](../../src/sdk/eip1193-agentic-wallet-guard/risk-evaluator.ts) · `UNAUTHORIZED_SPENDER_REJECTED` |

Rejected allowance paths throw `RetailGuardRejectedError` **before** RPC broadcast — **0-Gas** on fail-closed severance.

### ERC-8196 — Factual EIP Attribution & Historical Co-authoring Reference (Not a Venue Adapter)

| Field | Clarification |
|-------|---------------|
| **Standard status** | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) **Final** — Ethereum AI Agent Wallet Policy |
| **Co-author attribution** | Virtuals Protocol is a **historical co-author** of the ERC text — factual EIP metadata only |
| **Citadel binding** | On-chain policy pre-screen via `SliverVineAgentPolicyGuard` lineage → **V2** [`SliverVineAgentPolicyGuardV2.sol`](../../contracts/src/SliverVineAgentPolicyGuardV2.sol) on Arbitrum One |
| **Explicit non-scope** | **Not** a native venue adapter · **not** part of the 5-Core Venue Matrix · pruned Virtuals GAME adapter (v1.1) replaced by EIP-1193 Retail Guard + B2B `withCitadelShield` |

### ERC-20 / ERC-777 — Non-Custodial Asset Transfer Escrow Semantics

| Semantics | Rule |
|-----------|------|
| **Collateral SSOT** | USDC on Arbitrum (`GMX_USDC_ARBITRUM`) — GMX v2 increase/decrease payloads |
| **No indefinite custody** | Protocol never books user principal as protocol-owned; capital remains in user Kernel account or venue GM position |
| **In-flight bridge escrow** | Outbound Robinhood → Arbitrum Across legs labelled `IN_FLIGHT_BRIDGE_CAPITAL`; `lostUsd ≡ 0` until timeout (`BRIDGE_TIMEOUT_FAIL_CLOSED`) |
| **Venue settlement** | GMX async keeper window **3–5 min**; HL withdrawal **15 min** — inventory held in-flight, not escrowed by Gate |
| **ERC-777** | Not on Citadel hot path; ERC-20 `transfer`/`approve` invoked only via Kernel-scoped UserOp `callData` to whitelisted contracts |

`GatedExecutor.payloadHash()` binds UserOp `callData` to Gate `RiskAttestation.payloadHash` — asset movements without matching attestation revert on-chain.

### WASM Core (`soil_core`) — Edge Hot Path

| Field | Citadel binding |
|-------|-----------------|
| **Artifact** | `pkg/soil_core.wasm` — `#![no_std]` Rust compiled for Cloudflare Workers |
| **Size budget** | **< 28 KiB** artifact · **50.94 KiB gzip** Worker hot-path bundle (`pnpm bundle:measure`) |
| **Latency** | Warm exec **< 60 µs** · Edge shield p50 **~106 µs** (`checkSoilResistance()`) |
| **Parity** | Bitmask + six-lane risk vector semantics mirrored by Stylus `check_soil_resistance_stylus()` |
| **Verification** | [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md) · `tests/risk-control/*` · Vitest **225 test files | 1052 PASS clean** |

Edge Wasm is the **pre-broadcast SSOT**; Stylus coprocessor provides on-chain reinforcement — never a weaker substitute for fail-closed Edge gates.

### EIP-1482-Class: Block Timestamp Monotonicity & RPC Regression Defense

> **Auditor note:** Canonical [EIP-1482](https://eips.ethereum.org/EIPS/eip-1482) on ethereum.org defines **shard block proofs**, not wall-clock monotonicity. In this wiki, **EIP-1482-class** denotes Citadel's **L2 `block.timestamp` monotonicity & bounded-drift profile** — aligned with Arbitrum sequencer non-decreasing timestamp rules and heterogeneous RPC load-balancer behavior. Implementation SSOT: [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md) §3.1.1 · [`01_ON_CHAIN_MAINNET_ANCHORS.md`](../verifications/01_ON_CHAIN_MAINNET_ANCHORS.md) § Dual-Engine Map.

Citadel does **not** ship a standalone `MonotonicRpcRatchetGuard` class or `rpc-timestamp-guard.ts` module. The **monotonic RPC ratchet** is a **composite guard** across three SSOT surfaces:

| Layer | SSOT symbol | Role |
|-------|-------------|------|
| **Wasm ratchet** | `RpcTimestampWatermark` · `clock_core_rpc_ingest()` | Per-source high-watermark on `(blockNumber, timestampSec)` — regression freezes held timestamp (fail-closed) |
| **RPC failover** | `rpc-radar.ts` · `evaluateRpcRadarTier()` | Multi-provider probe race; `RPC_RADAR_STALE_BLOCK_MAX_MS` = **5_000** marks stale `latest` blocks; `IS_SEQUENCER_OUTAGE` triggers soil fuse |
| **Virtual wall clock** | `MonotonicTimeSSOT.read()` · sticky `CLOCK_NEGATIVE_LEAP_DETECTED` | NTP / leap step-back does not regress virtual wall time; anomaly persists until reset |

```text
RPC probe (Alchemy / QuickNode / Ankr)
    → clock_core_rpc_ingest / RpcTimestampWatermark (monotonic timestampSec)
    → rpc-radar stale tier (blockAgeMs > 5s → failover)
    → checkSoilResistance() SOIL_REASON_RPC_OUTAGE / fast-path deny
```

| Invariant | Enforcement | Fail-closed outcome |
|-----------|-------------|-------------------|
| `timestampSec` must not regress at equal/higher block height | `RpcTimestampWatermark.ingest()` · Wasm `clock_core_rpc_ingest` | Held high-watermark; regression flag → stale / deny |
| Heterogeneous RPC `latest` skew | `rpc-radar` fastest-fresh-wins + all-stale tier-2 outage | `getRpcRadarOutageReason()` → soil trip |
| Wall-clock leap / NTP step | `MonotonicTimeSSOT` offset + sticky anomaly | `risk-engine-soil.ts` fast-path deny when anomaly ≠ null |

**Verification:** `npx vitest run tests/clock-monotonicity.test.ts` — **14/14 PASS** (includes Wasm FFI regression hold).

### ERC-4337 / ERC-7579 / ERC-7715: Account Abstraction & Session Key Time Gates

Session-key and modular-account time semantics are enforced **before** UserOp broadcast. Clock immunity prevents **fake-fresh** ages that could bypass TTL / staleness modules.

| Standard facet | Clock SSOT binding | Module anchor |
|----------------|-------------------|---------------|
| **ERC-4337** UserOp validation window | `resolveWallAge(nowMs, quoteTimestampMs)` → `LEAP` trips stale flags | [`risk-engine-flag-alt.ts`](../../src/core/risk-engine-flag-alt.ts) · `evaluateVariationalFlags()` |
| **ERC-7579** modular session scope | `resolveUsdAiClockSsotPure()` + `CLOCK_NEGATIVE_LEAP_DETECTED` → `FLAGS_SEVERED` | [`risk-engine-usdai.ts`](../../src/core/risk-engine-usdai.ts) · [`usdai-adapter.ts`](../../src/adapters/usdai/usdai-adapter.ts) |
| **ERC-7579** session clip / TTL | `session_core_ok()` Wasm FFI · `verifySessionKeyValidity(expiresAt, nowMs)` | [`soil_core.rs`](../../src/wasm/soil_core.rs) · [`session-key-guard-core.ts`](../../src/core/session-key-guard-core.ts) |
| **ERC-7715** permission expiry evolution | `expiresAtMs <= nowMs` replay guard + clock-skew trip (`CLOCK_SKEW_EXCEEDED` >30s) | [`session-audit.ts`](../../src/services/risk/session-audit.ts) · USDAI clock SSOT |

**Anti-spoofing rule:** Negative wall deltas (`nowMs < timestampMs`) MUST NOT clamp to `ageMs = 0`. `resolveWallAge()` returns `{ kind: "LEAP" }` → variational / USDAI **STALE** or `FLAGS_SEVERED` — never ALLOW with fake freshness.

### ERC-7715 / EIP-7702 & EIP-712: Session Delegation, Intent Hashing & Physical Deadlock

| Mechanism | Clock / Wasm binding | Outcome |
|-----------|---------------------|---------|
| **EIP-712** structured intent | Domain-bound digest evaluated only after soil clock snapshot is fixed | [`evaluateAttestation()`](../../src/sdk/attestation.ts) · Gate `verifyAndConsume` |
| **EIP-7702** / Kernel upgrade path | Pre-broadcast `checkSoilResistance()` — clock anomaly → no signature release | [`agent-citadel-guard.ts`](../../src/core/agent-citadel-guard.ts) |
| **Physical deadlock** | `rootProtection()` / `severSigningChannel()` on `FLAGS_SEVERED` | [`root-protection-core.ts`](../../src/core/root-protection-core.ts) · [`risk-severance.ts`](../../src/core/risk-severance.ts) |
| **Wasm FFI struct pack** | `packClockStateForWasm()` · `clock_core_pack_state()` — `[virtualWallMs, offsetMs, anomalyFlags]` | [`monotonic-time.ts`](../../src/core/monotonic-time.ts) · [`clock_core.rs`](../../src/wasm/clock_core.rs) · [`wasm-clock-ffi.ts`](../../src/core/wasm-clock-ffi.ts) |

Any sticky `CLOCK_NEGATIVE_LEAP_DETECTED` or `CLOCK_EXCESSIVE_FORWARD_STEP` propagates through `applyAutoSeveranceOnFlags()` → **hot-key pipeline severed** before EIP-712 signing resumes.

---

## Compliance Posture

- **ERC-4337:** UserOps pass Edge `verifyAgentIntent()` before bundler dispatch; EntryPoint v0.7 + Kernel v0.3.1 are canonical; gas ledger caps per-UserOp and daily sponsorship.
- **EIP-7562:** Zero-Bundler-Rejection Invariant — session modules + Edge pre-screen prevent validation-phase storage violations; bundler failure is fail-closed, not retried blindly.
- **EIP-712:** All Gate attestations and SDK envelopes bind `chainId` + `verifyingContract` + domain `SliverVineCitadel` — cross-chain replay denied at `verifyAndConsume`.
- **ERC-1271:** Kernel session-key signatures validated via standard magic value; Gate path uses ECDSA m-of-n — dual validation planes, neither bypasses the other.
- **ERC-20 / ERC-777:** Non-custodial escort — in-flight capital labelled, never booked as loss; ERC-777 hooks excluded from hot path.
- **OpenZeppelin Contracts v5:** Gate contracts enforce fail-closed access control and reentrancy-safe execution patterns; `SliverVineGate` ECDSA verification intentionally matches OZ `ECDSA.tryRecover` (strict 65-byte, non-malleable `s`).
- **ERC-4337 / ERC-7579:** Session modules enforce clip + TTL caps alongside UserOp structure constraints.
- **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196):** **Factual EIP attribution** — Finalized standard co-authored by Virtuals Protocol; implemented via PolicyGuard on-chain screen — **not** a product venue adapter ([§ ERC-8196](#erc-8196--factual-eip-attribution--historical-co-authoring-reference-not-a-venue-adapter)).
- **EIP-1193 / EIP-6963 / ERC-2612·Permit2:** Active C-end Retail Guard spine — see [Active EVM Standard Compliance Matrix](#active-evm-standard-compliance-matrix-v10-production).
- **EIP-1559:** Gas-yield ratio fuse blocks dispatch when L1 surcharge exceeds target yield band.
- **Robinhood Chain:** Outbound-only escort (`46630`/`4663` → `42161`); inbound AML blocked · `lostUsd ≡ 0`.
- **WASM:** Hot-path soil evaluation mirrors Edge `checkSoilResistance()` semantics for sub-ms fail-closed.
- **EIP-1482-class (clock):** `RpcTimestampWatermark` + `rpc-radar` + `MonotonicTimeSSOT` enforce monotonic timestamps and fail-closed on RPC regression — see [§ EIP-1482-Class](#eip-1482-class-block-timestamp-monotonicity--rpc-regression-defense).
- **Session-key time gates:** `resolveWallAge()` LEAP branch prevents fake-fresh oracle/quote ages on ERC-4337 / ERC-7579 paths — see [§ ERC-4337 / ERC-7579 / ERC-7715](#erc-4337--erc-7579--erc-7715-account-abstraction--session-key-time-gates).
- **ERC-7715 Decoupling:** ⏳ **Planned / V1.0 Design Spec** — ZeroDev Kernel v3 is the v1.0 ephemeral session-key adapter (Gatehouse). Universal **ERC-7715 Advanced Wallet Permissions** is the evolution target for adapter swap without Shield or Wasm rewrite.

---

## ArbOS / Stylus Alignment — ✅ Code-Verified On-Chain Coprocessor

> **Edge (Cloudflare) remains the pre-broadcast SSOT.** The **`SliverVineSoilCoprocessor`** (`contracts/stylus-probe/src/lib.rs`) is an active **u128 fixed-point** soil math coprocessor compiled via **Stylus SDK 0.10.7** — on-chain reinforcement aligned with Edge `checkSoilResistance()` semantics. Elara protocol ingress remains ⏳ V1.0 Design Spec.

| Layer | Alignment | Status |
|-------|-----------|--------|
| **Stylus Soil Coprocessor** | **`SliverVineSoilCoprocessor`** — u128 fixed-point score · `check_soil_resistance_stylus(flags, risk_vector)` · quadratic spread/slippage penalty · fail-closed `depth_usd ≥ 10_000` · `evaluate_soil_coprocessor(spread_bps, depth_usd, slippage_bps)` · parity with Edge soil fuse | ✅ **Mainnet Deployed & Activated** (`0xc23587d6573dd134f95b02b0202ffbf84686625e` · activation tx [`0x92079e15…`](https://arbiscan.io/tx/0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397) · Nitro Prover JIT + **ArbWasm `0x71`** · Stylus SDK **0.10.9** · `cargo test` **9/9 PASS** · `pnpm deploy:stylus:mainnet`) |
| **Elara protocol ingress** | Protocol-level ingress filtering drops non-compliant Robinhood Chain / blacklisted senders before GM payload construction — complements `IngressSafetySwitch` | ⏳ V1.0 Design Spec |
| **ArbOS gas / base-fee sensor** | Tri-Sensor **BaseFee Velocity** channel remains the congestion throttle for dispatch SLO | ✅ v1.0 Delivered (Sepolia verified) (`arbitrum-gas-guard.ts`) |

**Design rule:** Edge (Cloudflare) remains the pre-broadcast SSOT; Stylus coprocessor + Elara are the on-chain reinforcement plane — never a weaker substitute for fail-closed Edge gates.

### EIP-1967 Upgradeable Proxy — Zero Lock-In Stylus Path

V2.0 on-chain Stylus rollout targets the standard **[EIP-1967](https://eips.ethereum.org/EIPS/eip-1967) Transparent Upgradeable Proxy** pattern:

| Slot | Purpose |
|------|---------|
| `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc` | Implementation — `SliverVineSoilCoprocessor` / `check_soil_resistance_stylus` logic |
| `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103` | Admin — multisig-governed upgrades; **no bytecode lock-in** |

The immutable **Solidity `SliverVineGate`** on Arbitrum One (`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`) remains the live attestation plane; Stylus is an additive coprocessor reinforcement layer deployable behind EIP-1967 without restricting future math upgrades.

**Dual-execution SSOT:** [`stylus_core.rs`](../../contracts/stylus-probe/src/stylus_core.rs) exports `check_soil_resistance_stylus(flags: u64, risk_vector: [f64; 6]) -> bool` — bitmask + six-lane vector parity with Edge `evaluate*Flags()` / `checkSoilResistance()`. **Arbitrum One mainnet:** `0xc23587d6573dd134f95b02b0202ffbf84686625e` · activation [`0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397`](https://arbiscan.io/tx/0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397) (Nitro JIT + ArbWasm `0x71`). Build: `pnpm deploy:stylus:mainnet`.

---

## Infrastructure RPC / WSS (Alchemy HA)

Multi-chain HTTPS/WSS placeholders live in `.env.example` — replace `YOUR_ALCHEMY_API_KEY` locally; never commit live keys.

| Venue | Chain ID | HTTPS (RPC) | WSS |
|-------|----------|-------------|-----|
| **Arbitrum One** (primary) | 42161 | `ARB_MAINNET_RPC_URL` | `ARBITRUM_WSS_URL` |
| **Arbitrum Sepolia** (sandbox) | 421614 | `ARB_SEPOLIA_RPC_URL` | `ARBITRUM_SEPOLIA_WSS_URL` |
| **Robinhood Testnet** | 46630 | `ROBINHOOD_TESTNET_RPC_URL` | `ROBINHOOD_TESTNET_WSS_URL` |
| **Robinhood Mainnet** | 4663 | `ROBINHOOD_MAINNET_RPC_URL` | `ROBINHOOD_MAINNET_WSS_URL` |
| **Hyperliquid** (venue-native + optional HA) | — | `HYPERLIQUID_*_RPC_URL` · SSOT `HL_INFO_URL` / `HL_EXCHANGE_URL` | `HYPERLIQUID_WSS_URL` |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [`../README.md`](../README.md) | Documentation index · English SSOT hub |
| [`01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md) | Yellow Paper — R01–R20 · Hybrid Pillar Sets X & Y · topology |
| [`05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | 88%/12% risk spectrum · fail-closed boundaries · Basel mapping |
| [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) | CLI Tier 0–5 verification hub |
| [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) | Pillar Set X — ZeroDev Kernel v3 AA · EIP-7702 comparative |
| [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](../architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md) | Pillar Set Y — Wasm soil core · p50 ~106µs |
| [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md) | R01–R20 Defense Matrix · §3.1.1 Physical Clock & Edge Monotonicity |
| [`../verifications/01_ON_CHAIN_MAINNET_ANCHORS.md`](../verifications/01_ON_CHAIN_MAINNET_ANCHORS.md) | Dual-Engine Map (Engine A Stylus · Engine B Edge Wasm) · FROZEN anchors |
| [`../sdk/README.md`](../sdk/README.md) | Wallet Guard SDK documentation index (01 → 04) |
| [`../sdk/01_SDK_INTEGRATION_BLUEPRINT.md`](../sdk/01_SDK_INTEGRATION_BLUEPRINT.md) | EIP-1193 Agentic Wallet Guard SDK |
