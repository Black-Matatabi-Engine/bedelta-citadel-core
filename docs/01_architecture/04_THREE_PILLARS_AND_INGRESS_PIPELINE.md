# Hybrid Pillar Sets X & Y & Institutional Ingress Pipeline

> **Document:** Pillar Set X Gatehouse (ZeroDev AA) · Pillar Set X Compliance Ingress · Pillar Set Y Shield routing · agent adapters · **Vitest SSOT:** **228 test files | 1065 PASS clean (100%)** · **Wasm Core:** `<28kb` · **p50 ~106 µs**
> **Topology SSOT:** [`01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md) · **Defense Matrix:** [`02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](./02_DEFENSE_MATRIX_AND_SSRC_CORE.md)

### 0.1 Bytecode Predicate Verification (v1.0) & ERC-7715 (⏳ Post-Grant Design Spec)

SliverVine does not interpret natural-language LLM prompts. ExoMesh (via ReflexCore / SSRC) enforces **Asymmetric Predicate Bytecode Hard Assertions** against ERC-4337 UserOp calldata inside the sub-ms Wasm core (p50 ~106 μs) — **powered 100% by [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm)**, independent of Account Abstraction. ZeroDev Kernel v3 is an **opt-in Pillar Set X delivery adapter** for scoped session keys when institutions enable AA (`USE_ZERODEV_AA`); it does **not** provide or power sub-ms latency.

> **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (AI Agent Wallet Policy):** Aligned with the **Finalized ERC-8196 Standard** ([ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) · Ethereum Standard · co-authored by Virtuals Protocol).

> **ERC-7715 (Advanced Wallet Permissions):** ⏳ **Planned / Post-Grant Design Spec** — evolution target for Gatehouse permission surfaces; **not shipped in v1.0**. Adapter swap path is documented for future ZeroDev / Offchain Labs integration without Shield or Wasm rewrite.

| Invariant | Mechanism | Status |
|-----------|-----------|--------|
| **Receiver Invariant** | Decode GMX v2 parameters from UserOp bytecode; assert `sender ≡ receiver` before any L2 broadcast. | ✅ v1.0 Delivered (Sepolia verified) |
| **Parameter Invariant** | Bound-check `acceptablePrice` (and related execution params) against oracle-lag sensors; fail-closed on drift. | ✅ v1.0 Delivered (Sepolia verified) |
| **Unidirectional Outbound Escort** | Pillar Set X enforces venue-agnostic outbound-only escort into Arbitrum `42161`; inbound AML contamination is blocked at the Compliance Ingress Firewall. Robinhood Chain (`46630`/`4663`) is the inaugural reference adapter. | ✅ v1.0 Delivered (Sepolia verified) |

### 0.2 v1.0 Delivered Scope vs Post-Grant Roadmap

| Horizon | Status | Scope |
|---------|--------|-------|
| **v1.0 Delivered (Sepolia + Arbitrum One)** | ✅ Code-Verified Live | **SliverVine ExoMesh** — Pre-Consensus Intent Firewall · GMX v2 ETH/USDC GM + HL 1× short · Wasm `checkSoilResistance()` p50 ~106µs · **Pendle Institutional Shield** (sync oracle · `PENDLE_ORACLE_STALE` soil fuse · cross-guard) · **Stabilizer Sepolia Cross-Pass Sandbox** (`421614`) · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) **`SliverVineAgentPolicyGuard` live on 42161** [`0x3e4298e2…`](https://arbiscan.io/address/0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b) · ZeroDev Smart Route UserOp [`0xe12714a7…`](https://arbiscan.io/tx/0xe12714a7b26d8983c32e471180e640dfb2ff000b4e1530a34cee02169f11e816) · EIP-712 consume-once Gate [`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) · **Arbitrum One Mainnet Ignition** [`0x54c153…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · Dune + SHA-256 `GET /api/grant-audit` · **228 test files | 1065 PASS clean (100%)** |
| **v1.0 Active Target** | ✅ Mainnet Ignition Delivered | Single blue-chip anchor: **GMX v2 ETH/USDC GM Pool** + Hyperliquid **1× short** hedge · Gate live on **42161** |
| **v1.0 Partial — HL Orderbook Gap Guard** | ✅ Code-Verified | `evaluateHlOrderbookGapGuard()` in [`hl-orderbook-gap-guard.ts`](../../src/services/risk-control-lib/hl-orderbook-gap-guard.ts) · wired via [`soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) — gap-window leverage scale-down + 2× depth floor |
| **v1.0 Live — Pendle Institutional Shield** | ✅ Code-Verified Live | **Pillar Set Y Core** — [`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) (sync cache · TTL 60s) · [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) (`hydrateFromOracle`) · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) · `pendleOracle` / `pendleCrossGuard` → `checkSoilResistance()` · **228 test files | 1065 PASS clean (100%)** |
| **V1.5 Roadmap Spec** | ⏳ Planned | **Sub-ms Agentic Security & Swarms** — ERC-8196 (Final) fleet enforcement · EIP-7702 EOA → Agent Smart Account · Prompt Injection Defense Circuit (`severSigningChannel()` sub-100µs) · BTC/USDC isomorphic GM (config-only) |
| **V2.0 Design Spec** | ⏳ Planned | **Institutional CaaS & Orbit Shield** — `@slivervine/exomesh-agentic-wallet-guard` for AI DEXs / Orbit L3s · Pre-execution risk checks · ZeroDev Stage ⑦ Intent Composition (2PC ledger) |

**ZeroDev AA v1.0 active scope (Opt-In Pillar Set X):** **Native Integration** with **ZeroDev Kernel v3 (ERC-7579)** + **Ultra-Relay Intent Network** — Stage ① Sign-in · ③ Gas ($0.50/op · $10/day) · ④ Scoped Session Keys (ERC-7579 TYPE 1 validator) · ⑤ Execution — `SliverVineRiskOracle` = **ERC-7579 Pre-Execution Hook (TYPE 4)** · Sepolia dry-run verified (`pnpm test:zerodev`). **v0.95 SSOT (`5829e9a`):** HL session-key consume-once nonce + `expiresAt` replay guard · USD.ai `[CLOCK_SSOT_VERIFIED]`. Stage ② Smart Routing = **Reference Harness & Spec** (Vitest). Stages ⑥ Recover · ⑦ Compose = **⏳ Post-Grant Roadmap (V1.5 / V2.0)**. Pillar Set Y ReflexCore (SSRC) and Pillar Set X Arbitrum Native Ingress operate **100% independently** of ZeroDev.

#### 2.4.6 v0.95 SSOT — ZeroDev AA Security Audit Closure

| Item | Resolution | Code / doc anchor |
|------|------------|-------------------|
| Proprietary vs official ZeroDev plugin | **Resolved in v0.95 SSOT** — Citadel-owned adapter; ERC-7579 typings in [`zerodev-aa-types.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-types.ts) | [`src/adapters/arbitrum/zerodev-aa/`](../../src/adapters/arbitrum/zerodev-aa) |
| Session key replay (57.76 KiB Worker path) | **Resolved in v0.95 SSOT** — `auditSessionKeyNonceState` + `verifySessionKeyValidity` before broadcast | [`execute-order.ts`](../../src/adapters/hl/session-key-executor/execute-order.ts) · commit `5829e9a` |
| `SliverVineRiskOracle` hook classification | **ERC-7579 Pre-Execution Hook** — gate binds oracle status before Ultra-Relay UserOp ingress | [`SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol) · [`zerodev-aa-gate-types.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-gate-types.ts) |

**Demo:** `pnpm demo` — 12 Dual Pillar Set X & Y ANSI scenarios (GMX · HL · Pendle · p50 ~106µs) · `pnpm demo:e2e` — **4-step Happy Path** grant E2E (Intent+Deadman → Robinhood escort → GMX underweight → HL Session hedge) · optional `--unwind` (Step 5 R20) · `--trip` (Step 1 intercept).

### 0.3 C-End & B-End Integration (v1.1 SSOT)

| Surface | Status | Module SSOT | Entry point | Verify |
|---------|--------|-------------|-------------|--------|
| **ExoMesh Agentic Guard (EIP-1193/5792/6963+)** | ✅ V1.0 Live | [`provider.ts`](../../src/sdk/exomesh-agentic-wallet-guard/provider.ts) | `withRetailGuardProvider()` | `npx vitest run tests/sdk/retail-guard-provider.test.ts` **35/35** |
| **B2B Agent Decorator** | ✅ V1.0 Live | [`decorator.ts`](../../src/sdk/decorator.ts) | `withExoMeshShield()` (legacy: `withCitadelShield`) · `verifyAgentIntent()` | `pnpm demo:agent` |
| **5-Core Venue Guards** | ✅ V1.0 Live | [`src/adapters/{gmx,pendle,usdai,hl,variational*}`](../../src/adapters/) | Per-venue evaluators | `pnpm demo:{gmx,pendle,usdai,hl,variational}` |
| **Stabilizer Protocol** | ✅ V1.0 Live (Sepolia) | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) | `evaluateStabilizerSwapGuard()` | `pnpm demo:stabilizer` |
| **Deprecated v1.0 harnesses** | 🗑️ Pruned v1.1 | Wayfinder · ElizaOS · Virtuals · LangChain | Replaced by ExoMesh Agentic Guard + B2B decorator | **RESERVED_ABI_V2** holes preserved |

**Regression bar:** **228 test files | 1065 PASS clean**

### Core Sinking SSOT ([`src/core/`](../../src/core))

Pure risk invariants are sunk into five core modules; [`src/adapters/`](../../src/adapters) and [`src/services/`](../../src/services) preserve legacy import paths via thin-shell re-exports. See [`architecture/README.md`](./README.md#core-sinking-ssot-srccore) for the module table · [`02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](./02_DEFENSE_MATRIX_AND_SSRC_CORE.md) for USD.ai / soil integration.

**PEV (Prevented Exploit Volume) — Dune Analytics Telemetry Metric:**

| Field | Definition |
|-------|------------|
| **Metric** | **PEV** — nominal USD volume of toxic intents blocked pre-broadcast (0-Gas fail-closed severance) |
| **Event sources** | `RiskTripBlocked` on-chain events · soil-trip `SOIL_RESISTANCE_TRIP` logs · `GET /api/grant-audit` `duneTelemetry` JSON |
| **Indexer SSOT** | [`DUNE_DASHBOARD_SPECIFICATION.md`](../03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md) — Sepolia event streaming verified; production DuneSQL targets **ChainID `42161`** |

### 0.4 Stabilizer Sepolia — Universal Testnet Sandbox & Cross-Pass Layer (V1.0 Live)

**Arbitrum Sepolia (`421614`) is the Universal Testnet Sandbox & Cross-Pass Interoperability Layer** for AI agent development. Citadel applies the **same `checkSoilResistance()` bytecode and risk gates** on Sepolia as on Arbitrum One (`42161`) — enabling auditors and integrators to validate fail-closed behavior on **live testnet contracts** without mainnet gas or capital friction.

| Cross-pass leg | Sepolia role | Adapter / demo SSOT | Shared gate |
|----------------|--------------|---------------------|-------------|
| **Stabilizer** | 1:1 zero-slippage USDZ / USDC / USDT / USDS rebalance | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · `pnpm demo:stabilizer` | `evaluateStabilizerSwapGuard()` → `checkSoilResistance()` |
| **GMX v2** | Sepolia shadow-margin · price-impact pre-flight | [`gmx-v2-agent-flow.demo.test.ts`](../../tests/demo/gmx-v2-agent-flow.demo.test.ts) · [`gmx-v2-order-payload-guards.ts`](../../src/services/adapters/gmx-v2-order-payload-guards.ts) | `gmxPriceImpact` · depth soil probes |
| **Pendle** | Testnet Guarded Pool Factory · oracle TTL fuse | [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) · [`pendle-ai-agent-flow.demo.test.ts`](../../tests/demo/pendle-ai-agent-flow.demo.test.ts) | `pendlePoolFactory` · `pendleOracle` soil probes |

```text
Agent Cross-Pass Route (Sepolia 421614)
  Stabilizer 1:1 stablecoin leg
       │ checkSoilResistance()
       ▼
  GMX v2 shadow-margin / GM intent
       │ checkSoilResistance()
       ▼
  Pendle guarded pool / PT intent
       │ checkSoilResistance()
       ▼
  FAIL_CLOSED (0-Gas)  or  ALLOW → Mainnet-identical bytecode path
```

**Verification bar:** **228 test files | 1065 PASS clean**

### 2.2 Traditional Bridge vs SliverVine Pillar Set X Compliance Escort

```text
Traditional Omnichain Bridge (bidirectional · loss opaque)
┌──────────────┐   relayer / LP / messaging   ┌──────────────┐
│  Source L2   │ ───────────────────────────► │  Dest L2     │
│  (any chain) │ ◄─────────────────────────── │  (any chain) │
└──────────────┘   timeout → stuck / social   └──────────────┘
                   recovery · lostUsd > 0 risk

SliverVine Pillar Set X Compliance Escort (unidirectional · fail-closed)
┌─────────────────────┐  Across reference   ┌─────────────────────┐
│ Robinhood Chain     │  escort state mach. │ Arbitrum One 42161  │
│ 46630 / 4663 USDG   │ ──────────────────► │ GMX v2 · Pendle PT  │
│ institutional treas.│ IN_FLIGHT → SETTLED │ deployable NAV only │
└─────────────────────┘                     └─────────────────────┘
         ▲
         └── inbound 42161→46630/4663 AML BLOCKED · lostUsd ≡ 0
```

| Dimension | Traditional Bridge | SliverVine Pillar Set X Escort |
|-----------|-------------------|----------------------------|
| **Ingress direction** | Bidirectional pools · any-chain routing | **Unidirectional outbound-only** — Robinhood `46630`/`4663` → Arbitrum `42161` |
| **In-flight timeout shield** | Capital may appear lost · manual recovery | **>3600s** Across timeout → `BRIDGE_TIMEOUT_FAIL_CLOSED` · **0-Gas severance** |
| **Pending-capital accounting** | Ambiguous pending / LP share semantics | `IN_FLIGHT_BRIDGE_CAPITAL` → `SETTLED` · deployable ⇔ settled ∧ route allowed |
| **Loss invariant** | External insurance / social layer | **`lostUsd ≡ 0`** — state machine SSOT · Vitest **6/6** · `pnpm demo:ingress` |

**CLI:** `pnpm demo:ingress` — multi-route HUD (Route A RH→42161 · Route B HL L1 probe · Route C Arb→Base) · `pnpm demo:ingress -- --trip` — timeout fail-closed + `lostUsd ≡ 0` check · ERC-7540+: `pnpm demo:sanctuary`.

### 2.3 ZeroDev Smart Route Calldata Binding (Pillar Set X Reference Harness — Demo Spec)

> **Status:** **Reference Harness & Spec** — Dry-run verified via Vitest ([`tests/adapters/gmx-smart-route-payload-binding.test.ts`](../../tests/adapters/gmx-smart-route-payload-binding.test.ts)). This serves as an evaluator-reproducible reference adapter. Production execution baseline defaults to **Arbitrum One Native Ingress**.

**Pillar Set X context:** This section documents a **reference harness surface** of the Compliance Ingress Firewall — ZeroDev Kernel UserOp calldata binding from permissioned ingress (Robinhood `46630`/`4663` **USDG** as inaugural reference adapter) to Arbitrum GMX execution. **`GMX_V2_EXCHANGE_ROUTER_ARBITRUM`** (`ZERODEV_SMART_ROUTE_TARGETS` · [`gmx-revenue.ts`](../../src/config/gmx-revenue.ts)) → **`GM_ETH_USDC`** pool — single-click cross-chain deposit/swap calldata spec, no hot-wallet custody.

**Payload binding (calldata-level, Gate struct unchanged):** `buildGmxSmartRoutePayloadBinding()` encodes smart-route calldata → `computeGatedExecutorPayloadHash()` mirrors on-chain `GatedExecutor.payloadHash(initiator, target, keccak256(data), nonce)`. The digest fills the existing `RiskAttestation.payloadHash` field — **[`SliverVineGate.sol/`](../../SliverVineGate/out/SliverVineGate.sol) `ATTESTATION_TYPEHASH` and struct layout are not modified**.

Anchors: [`gmx-smart-route-payload-binding.ts`](../../src/services/adapters/gmx-smart-route-payload-binding.ts) · [`gated-executor-payload.ts`](../../src/sdk/gated-executor-payload.ts) · [`treasury-escort-router.ts`](../../src/adapters/robinhood/treasury-escort-router.ts) · [`GatedExecutor.sol`](../../SliverVineGate/src/GatedExecutor.sol).

### 2.4 Pillar Set X — Opt-In ZeroDev Account Abstraction (Integration Summary)

> **Full Pillar Set X specification:** [`02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](../01_architecture/04_THREE_PILLARS_AND_INGRESS_PIPELINE.md) — ZeroDev Kernel v3 session keys, EIP-7702 comparative analysis, `sessionOk` / `allowedToSign` dry-run scope (`pnpm run demo:e2e`), and `pnpm test:zerodev` harness. This section retains integration anchors only.

> **Status:** v1.0 production SSOT = **Kernel v3** (`ZERODEV_KERNEL_VERSION` v0.3.1 · EntryPoint v0.7); **Kernel v4** = post-grant V1.5 alignment path (Gatehouse adapter upgrade only — **no rewrite** of Shield / Wasm / EIP-712 Gate).

> **Boundary:** ZeroDev Kernel v3 is an **opt-in Pillar Set X AA layer** (`USE_ZERODEV_AA` default-off). ZeroDev infrastructure failure, bundler outage, or Paymaster exhaustion **never** impairs the **ReflexCore (SSRC) Edge path** (`checkSoilResistance()` · p50 ~106 µs) or **Arbitrum Native Ingress** — institutions fall back to EOA / native signing paths with identical pre-broadcast protection.

#### 2.4.1 Role of ZeroDev: Scoped Session Keys & Gas Sponsorship (Pillar Set X Opt-In AA Layer)

SliverVine Protocol separates **pre-broadcast risk enforcement** from **account delivery**. ZeroDev Kernel v3 is an **opt-in Pillar Set X layer** — institutions may enable scoped session keys and Paymaster gas sponsorship; the protocol does **not** require ZeroDev for core Citadel protection or bridge accounting.

| Layer | Role | SSOT | Dependency on ZeroDev |
|-------|------|------|------------------------|
| **Pre-Broadcast Risk Core (p50 ~106 µs)** | Sub-ms soil fuse · R01–R20 · fail-closed severance | [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm) · `checkSoilResistance()` on Cloudflare Edge | **None** — runs 100% independently of AA |
| **ZeroDev Kernel v3 (Pillar Set X)** | Opt-in smart-account delivery plane · scoped **30s** session keys · Paymaster sponsorship | [`src/adapters/arbitrum/zerodev-aa/`](../../src/adapters/arbitrum/zerodev-aa) · `pnpm test:zerodev` | **Opt-in** — `USE_ZERODEV_AA` default-off |
| **Baseline ingress (no AA)** | Direct Arbitrum Native Ingress · Across bridge escort | [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) · native GMX/HL adapters · Unit-Verified Vitest **6/6** | **Independent** — `lostUsd ≡ 0` guaranteed by bridge state machine, not AA |

**Separation of powers:**

- **Pre-Broadcast Risk Core (p50 ~106 µs):** Powered 100% independently by SliverVine Edge Wasm ([`pkg/soil_core.wasm`](../../pkg/soil_core.wasm)). Every intent — EOA, Kernel UserOp, or bridge escort — is evaluated by `checkSoilResistance()` **before** any broadcast path.
- **ZeroDev Kernel v3 (Pillar Set X):** Serves as an **Opt-In Smart Account Delivery Plane** for scoped 30s session keys and Paymaster gas sponsorship. Citadel never holds user keys or principal — capital remains in the Kernel `sender` smart account when AA is enabled (R06–R07 · ERC-7579).
- **Baseline Fallback:** Direct **Arbitrum One Native Ingress** and **Across Bridge** adapters operate smoothly with or without ZeroDev enabled. The `lostUsd ≡ 0` invariant is guaranteed by the bridge state machine and escort accounting — **not** by Account Abstraction.

When ZeroDev **is** enabled, it provides three delivery-plane capabilities SliverVine does not replicate in-house:

| Capability | Without ZeroDev (baseline) | With Opt-In ZeroDev integration |
|------------|--------------------------|-----------------------------------|
| **Scoped Session Keys** | EOA or institutional multisig signing | Kernel modular `ORDER_EXECUTE` · R06/R07 notional cap · 30s TTL auto-expiry |
| **Paymaster sponsorship** | Institutions prefund Arbitrum gas | `zerodev.sponsorUserOperation` · per-op ≤ $0.50 · daily $10 circuit breaker |
| **Bundler standard path** | Direct `eth_sendRawTransaction` or venue-native signing | EntryPoint v0.7 + **EIP-7562** compliant UserOp · fail-closed · no blind retry |

**Execution pipeline (opt-in AA path only):**

```text
UserOp draft → verifyAgentIntent() [ExoMesh Edge gate · p50 ~106µs · Wasm — independent of AA]
 → evaluateStaticBreakerMatrix() [soil + gas ledger]
 → Paymaster sign → Bundler → EntryPoint → Kernel validateUserOp
```

ExoMesh decides **before broadcast** on every path; ZeroDev handles **non-custodial account delivery only** when explicitly opted in. If ZeroDev is unavailable, institutions route through **Arbitrum Native Ingress** or **Across Bridge** escort — ReflexCore (SSRC) and `lostUsd ≡ 0` invariants remain fully operational.

#### 2.4.2 Kernel v3 / v4 Session Keys (ERC-7579 Modular Permissions)

> **Scope:** Kernel v3 session keys are the v1.0 delivered AA surface. Kernel v4 alignment is **post-grant (V1.5)** — adapter swap only; Shield / Wasm / Gate are unchanged.

| Dimension | Kernel v3 (v1.0 delivered) | Kernel v4 (V1.5 alignment) |
|-----------|------------------------------|------------------------------|
| **Module standard** | ERC-7579 modular session keys | v4 unified permission surface · ZeroDev "One Stack" |
| **Permission scope** | `ORDER_EXECUTE` · whitelisted `callData` target/selector | Same R06 semantics · extended Smart Routing cross-chain session scope |
| **Notional cap** | `SESSION_KEY_NOTIONAL_CAP_USD` = **$5,000** (R07) | Config-driven · invariant formulas unchanged |
| **TTL / re-auth** | Session TTL + R14 EIP-712 5-min re-auth | v4 Authorize stage native alignment · adapter swap only |
| **Signature path** | Kernel `isValidSignature` → ERC-1271 `0x1626ba7e` | Dual plane: Kernel ERC-1271 ∥ Gate ECDSA m-of-n |
| **Code anchors** | [`src/adapters/arbitrum/zerodev-aa/`](../../src/adapters/arbitrum/zerodev-aa) · `hl-session/permissions.ts` | ⏳ Post-Grant (V1.5) adapter swap · **Shield / Wasm zero rewrite** |

**Migration rule:** Kernel v3 → v4 replaces Gatehouse adapters only ([`zerodev-aa-userop.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-userop.ts) · [`zerodev-aa-gate.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-gate.ts)); `checkSoilResistance()`, [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm), and [`SliverVineGate.sol/`](../../SliverVineGate/out/SliverVineGate.sol) **do not change** with Kernel major version.

#### 2.4.3 Paymaster Gas Sponsorship (Sponsorship & Circuit Breakers)

> **Scope:** Paymaster sponsorship is **opt-in** (Pillar Set X). Daily cap exhaustion falls back to `sponsored: false` — UserOp drafting continues on self-funded gas; **ReflexCore (SSRC) Edge path and Arbitrum Native Ingress are unaffected**.

| Parameter | Value | SSOT |
|-----------|-------|------|
| Per-UserOp sponsorship cap | **$0.50 USD** | `MAX_GAS_COST_PER_USEROP_USD` |
| 24h rolling sponsorship budget | **$10 USD** | `DAILY_SPONSORSHIP_LIMIT_USD` |
| Trip code | `ZERODEV_GAS_LIMIT_EXCEEDED_TRIP` | [`zerodev-aa-static-breaker.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-static-breaker.ts) |
| Paymaster middleware | `zerodev.sponsorUserOperation` | [`zerodev-aa-userop.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-userop.ts) |
| Persistence (optional) | KV `zerodev:aa:gas:ledger` · TTL 86,400s | [`zerodev-aa-gas-ledger.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-gas-ledger.ts) |

Sponsorship and soil fuse are **serially evaluated**: `evaluateStaticBreakerMatrix()` runs `checkSoilResistance()` first, then `evaluateSponsoredGasLimits()` — on soil trip, **both sponsorship and broadcast are denied**, preventing "paid but should-be-blocked" UserOps from reaching the bundler.

#### 2.4.4 EIP-7562 Zero-Bundler-Rejection Invariant

> **Scope:** Applies only when ZeroDev AA is **opted in**. Bundler timeout or rejection triggers fail-closed on the UserOp path — institutions may bypass AA entirely via Arbitrum Native Ingress without losing Shield protection.

**Zero-Bundler-Rejection Invariant:** Citadel UserOps MUST NOT trigger EIP-7562 opcode/storage violations during the validation phase; bundler rejection is a **protocol fault**, not a retry signal.

| Rule | Enforcement |
|------|-------------|
| Validation-phase storage reads | Session-key modules restrict `callData` to whitelisted target/selector — no forbidden cross-contract reads |
| Edge pre-screen | Static breaker + `checkSoilResistance()` before `sendUserOperation()` |
| Fail-closed | Bundler unreachable · missing EP v0.7 · timeout → `BUNDLER_TIMEOUT_FAIL_CLOSED` (`ZERODEV_BUNDLER_FAIL_CLOSED_TIMEOUT_MS` = 3,000 ms) |
| Probe | `supportsEntryPoint07` · [`zerodev-aa-bundler.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-bundler.ts) smoke probe |

This invariant ensures institutional UserOps are **predictably deliverable** on Arbitrum bundler infrastructure — not silently dropped for storage violations — consistent with the 106 µs Shield fail-closed philosophy.

#### 2.4.5 ZeroDev v4 "Seven Stages, One Stack" Alignment Roadmap (Post-Grant Spec)

ZeroDev v4 converges the smart-wallet lifecycle into **seven stages, one stack**. SliverVine Protocol v1.0 delivers stages **①–⑤** (with ② as reference harness only); stages **⑥–⑦** are explicitly **post-grant roadmap** — not claimed as v1.0 scope.

| Stage | ZeroDev v4 semantics | SliverVine ExoMesh integration anchor | Status |
|-------|---------------------|-------------------------|--------|
| **① Sign in** | Identity · Kernel account resolution | ZeroDev login → `sender` Kernel address · no hot-wallet seed | ✅ v1.0 Delivered (Sepolia verified) |
| **② Fund** | Cross-chain deposit · Smart Routing | `ZERODEV_SMART_ROUTE_TARGETS` · USDG → GMX ExchangeRouter (§2.3 reference harness) | 📋 Reference Harness (Vitest dry-run verified) |
| **③ Gas** | Paymaster sponsorship | `zerodev-aa-gas-ledger` · per-op / daily caps (§2.4.3) | ✅ v1.0 Delivered (Sepolia verified) |
| **④ Authorize** | Session key scope | ERC-7579 `ORDER_EXECUTE` · R06/R07 · R14 re-auth | ✅ v1.0 Delivered (Sepolia verified) |
| **⑤ Execute** | UserOp broadcast · on-chain execution | `verifyAgentIntent()` → Shield → Bundler → GMX/HL venue | ✅ v1.0 Delivered (Sepolia verified) |
| **⑥ Recover** | Account recovery · social recovery | — | ⏳ Post-Grant Roadmap (V1.5) — *Out of scope for v1.0 (handled by upstream Kernel/EOA owner)* |
| **⑦ Compose** | Multi-step intent composition | 2PC intent ledger · [`intent-ledger.ts`](../../src/core/intent-ledger.ts) (partial internal coverage) | ⏳ Post-Grant Roadmap (V2.0 CaaS) — *Off-chain 2PC intent ledger (partial internal coverage)* |

```text
Sign in ──► Fund ──► Gas ──► Authorize ──► Execute (v1.0 Core Active Scope)
 │          │        │          │              │
 Kernel   Smart    Paymaster  Session Keys   Shield 106µs
 Account  Route    Ledger     R06/R07        + Venue
 (Ref)    (Ref)                              dispatch
```

**v1.0 active scope:** Stages ①③④⑤ are Sepolia-verified AA delivery paths. Stage ② is a Vitest reference harness only. Stages ⑥⑦ are **not** v1.0 deliverables — recovery is upstream Kernel/EOA owner responsibility; multi-step Compose is a V2.0 CaaS roadmap item.

**One Stack semantics (post-grant alignment):** When Kernel v4 ships, stages ①–⑤ will share one Kernel account, `sender` identity, and Citadel `AllowedToSign` predicate — institutions need not switch wallets between permissioned ingress and Arbitrum One. **Shield / Wasm / Gate invariants are unchanged** across Kernel major versions.

### 2.5 Strategic Blue-Chip Ecosystem & Settlement Roadmap (V1.0 Core + V1.5 / V2.0)

> **Scope honesty:** v1.0 active execution and fee capture remain **GMX v2 ETH/USDC GM + Hyperliquid 1× short** on Arbitrum One (§2 triangle). **Pendle Institutional Shield** and **Variational Omni RFQ** are **v1.0 Live Pillar Set Y** pre-execution firewalls. **Stabilizer Sepolia Cross-Pass Sandbox** is **v1.0 Live** on `421614`. Pruned Uniswap V3 venue adapter retains generic DEX calldata parsing in Retail Guard SDK only.

| Partner / Venue | Strategic role | Citadel integration | Horizon | Status |
|-----------------|----------------|---------------------|---------|--------|
| **Pendle Finance** (Yield & Rate Hedging) | PT/YT safety sentinel for AI agents in yield-tokenization markets — **not a yield competitor** | `checkSoilResistance()` · `pendleOracle` / `pendleCrossGuard` soil probes · [`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) (sync cache · TTL 60s · `PENDLE_ORACLE_STALE`) · `evaluatePendleGmxCrossGuard()` · `evaluatePendlePtExpiryRisk()` · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) · [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) | **V1.0** | ✅ Live · Pillar Set Y · **228 test files | 1065 PASS clean (100%)** |
| **USD.ai** (AI-Compute RWA Yield Collateral) | Yield-bearing sUSDai collateral tier for AI agent treasury — GPU oracle · peg drift · NAV vs mark · depth fuse | [`usdai-adapter.ts`](../../src/adapters/usdai/usdai-adapter.ts) · `evaluateUsdAiCollateralGuard()` · `usdai` → `collectExternalSoilFlags()` · `USD_AI_DEPEG_ORACLE_TRIP` | **V1.0** | ✅ Live · Pillar Set Y · `pnpm demo:usdai` |
| **Stabilizer** (Sepolia Cross-Pass Sandbox) | Universal testnet sandbox for AI agent stablecoin rebalance · cross-pass routing to GMX v2 + Pendle on `421614` | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · `evaluateStabilizerSwapGuard()` · identical `checkSoilResistance()` gate as `42161` | **V1.0** | ✅ Live · Sepolia `421614` · `pnpm demo:stabilizer` |
| **Variational** (Omni RFQ) | Protocol-agnostic RFQ firewall · stale quote · OLP depth · oracle drift | [`variational-rfq-adapter.ts`](../../src/adapters/variational-rfq-adapter.ts) · `validateVariationalRFQIntent()` · Bits 12–13 | **V1.0** | ✅ Live · `pnpm demo:variational` |

```text
v1.0 Active Triangle (42161)
  GMX v2 GM Yield ──1× Δ-neutral──► Hyperliquid Short
         │
         ├──► V1.0: Pendle Institutional Shield (Pillar Set Y · sync oracle · soil fuse)
         ├──► V1.0: USD.ai AI-Compute Yield Collateral (Pillar Set Y · `USD_AI_DEPEG_ORACLE_TRIP`)
         └──► V1.0: Stabilizer Sepolia Cross-Pass Sandbox (421614 · Stabilizer→GMX→Pendle)
         └──► V1.0: Variational Omni RFQ (Pillar Set Y · stale quote / OLP fuse)
```

## 6. ERC-7579 Pre-Execution Hook Alignment — AI Agent Reflex Architecture

> **Design thesis:** ERC-7579 modular smart accounts provide **permission scope**; SliverVine Protocol provides **reflex speed**. Together they form the pre-execution hook stack that AI agents and institutional vaults require to avoid MEV/LVR traps without surrendering custody.

### 6.1 Two-Plane Hook Stack

| Plane | Component | Latency | Function |
|-------|-----------|---------|----------|
| **① Validator (ERC-7579)** | ZeroDev Kernel v3 modular session module (TYPE 1) · Ultra-Relay Intent Network | **&lt;1 ms** | Scoped `ORDER_EXECUTE` · whitelisted target/selector · R06 notional cap · R07 daily clip · R14 re-auth |
| **①b Pre-Exec Hook (ERC-7579 TYPE 4)** | `SliverVineRiskOracle` — status mask + SLO circuit breaker | **on-chain** | Evaluated before UserOp reaches bundler; mirrored off-chain in `zerodev-aa-gate` |
| **② Reflex Hook (Wasm + Stylus)** | Edge `checkSoilResistance()` ∥ `SliverVineSoilCoprocessor` | **p50 ~106 µs** Edge · on-chain coprocessor reinforcement | Soil fuse · cross-spread · oracle-lag · depth fail-closed **before** UserOp reaches bundler |

```text
AI Agent Intent (seconds)
 │
 ▼
┌───────────────────────────────────────────────────────────┐
│ ERC-7579 Validator (ZeroDev Kernel v3) │
│ · Session key scope · clip · TTL · callData whitelist │
└─────────────────────────┬─────────────────────────────────┘
 │ UserOp draft passes structural auth
 ▼
┌───────────────────────────────────────────────────────────┐
│ SliverVine ExoMesh Pre-Execution Reflex Hook (106µs Cerebellum) │
│ Edge: verifyAgentIntent() → evaluateSoilCore() │
│ → checkSoilResistance() [pkg/soil_core.wasm] │
│ On-chain: SliverVineSoilCoprocessor.evaluate_soil_…() │
│ [contracts/stylus-probe/src/lib.rs] │
└─────────────────────────┬─────────────────────────────────┘
 │ AllowedToSign = true
 ▼
 Paymaster → Bundler → EntryPoint → GMX / HL
```

### 6.2 ZeroDev Kernel v3 Validator Module (Pillar Set X)

| Hook point | ERC-7579 module role | SliverVine ExoMesh invariant |
|------------|---------------------|----------------|
| **`validateUserOp`** | Session module verifies scoped signature + callData shape | Whitelisted GMX ExchangeRouter · HL adapter selectors only |
| **`isValidSignature` (ERC-1271)** | Kernel returns `0x1626ba7e` on scoped intent digest | Dual plane: Kernel ERC-1271 ∥ Gate ECDSA m-of-n attestation |
| **Session TTL** | Module-enforced expiry | `DEFAULT_TTL_MS` · heartbeat · deadman switch (`agent-citadel-guard`) |
| **Notional cap (R07)** | `SESSION_KEY_NOTIONAL_CAP_USD` = **$5,000** | Physical severance on breach — no partial fill escape |

**Code anchors:** [`src/adapters/arbitrum/zerodev-aa/`](../../src/adapters/arbitrum/zerodev-aa) · [`src/core/agent-citadel-guard.ts`](../../src/core/agent-citadel-guard.ts) · [`src/sdk/agent-intent.ts`](../../src/sdk/agent-intent.ts) · §2.4.2 Kernel v3 / v4 Session Keys.

### 6.3 Stylus ReflexCore (SSRC) On-Chain Hook (Pillar Set Y Reinforcement)

| Property | Edge Wasm ([`pkg/soil_core.wasm`](../../pkg/soil_core.wasm)) | Stylus Coprocessor ([`contracts/stylus-probe/src/lib.rs`](../../contracts/stylus-probe/src/lib.rs)) |
|----------|----------------------------------|----------------------------------------------------------|
| **Entry** | `evaluateSoilCore()` via `@slivervine/exomesh-agentic-wallet-guard` | `evaluate_soil_coprocessor(spread_bps, depth_usd, slippage_bps)` |
| **Math** | TS fallback + Wasm hot path | u128 fixed-point score · quadratic spread/slippage penalty |
| **Fail-closed** | `depthUsd < minDepthUsd` → trip | `depth_usd < 10_000` → `(false, u64::MAX)` |
| **Status** | ✅ v1.0 Delivered (Sepolia verified) · p50 ~106 µs | ✅ **Code-Verified Coprocessor** · `cargo test` **9/9 PASS** · Stylus SDK **0.10.7** · on-chain deploy **pending** |

**Alignment rule:** Edge remains the **pre-broadcast SSOT** (fastest path). Stylus coprocessor provides **on-chain auditable parity** for grant diligence and future ERC-7579 executor-module co-location on ArbOS — never a weaker substitute for Edge fail-closed gates.

### 6.4 AllowedToSign Predicate (Reflex Contract)

Production decision formula shared by SDK, Worker, and grant-audit telemetry:

```text
allowedToSign =
 injectionOk ∧ digestOk ∧ soilOk ∧ sessionOk ∧ gasOk
 ∧ deadmanOk ∧ armorOk ∧ attOk ∧ wasmOk
```

| Gate | Module | ERC-7579 / Hook role |
|------|--------|---------------------|
| `sessionOk` | [`session-key-gates.ts`](../../src/services/session-key-adapter-lib/session-key-gates.ts) | ERC-7579 module clip enforcement |
| `soilOk` | `checkSoilResistance()` · Wasm · Stylus | **Pre-execution reflex hook** |
| `attOk` | [`SliverVineGate.sol/`](../../SliverVineGate/out/SliverVineGate.sol) | Consume-once EIP-712 attestation |
| `deadmanOk` | [`agent-citadel-guard.ts`](../../src/core/agent-citadel-guard.ts) | Cross-venue slippage severance |

### 6.5 AI Agent Integration Surface

> *"These framework adapters provide modular integration specifications for pre-execution risk checks via `@slivervine/exomesh-agentic-wallet-guard` and REST APIs. In v1.0, active fee-capture and liquidity routing are strictly bound to Arbitrum One GMX v2 GM + HL delta-neutral execution; multi-platform agent fee routing is targeted for V2.0 CaaS monetization."*

| Consumer | Integration | Reflex hook |
|----------|-------------|-------------|
| **Wallet / dApp (C-End)** | `@slivervine/exomesh-agentic-wallet-guard` · `withRetailGuardProvider()` · [§0.3](#03-c-end--b-end-integration-v11-ssot) | EIP-1193 pre-consensus intercept · 0-Gas on reject |
| **B2B agents** | `@slivervine/exomesh-agentic-wallet-guard` · `verifyAgentIntent()` · `withExoMeshShield` (legacy: `withCitadelShield`) | Apache-2.0 · sub-ms soil gate |
| **5-Core venues** | GMX · Pendle · USD.ai · Variational · HL guards · [§0.3](#03-c-end--b-end-integration-v11-ssot) | Per-venue `checkSoilResistance()` |
| **Stabilizer** | ✅ V1.0 Live (Sepolia) — [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · [§0.4](#04-stabilizer-sepolia-universal-testnet-sandbox-cross-pass-layer-v10-live) | `evaluateStabilizerSwapGuard()` |
| **CrewAI / AutoGen (enterprise)** | ⏳ V1.5 Ecosystem Roadmap / Modular Integration Spec — `SlivervineCrewAIGuardTool` · AutoGen `citadel_soil_guard` · adapter spec (removed from repo per `docs/logging/0911_chaos_sandbox_audit.md`) · [§6.9](#69-strategic-blue-chip-ecosystem-settlement-integrations-v10-core-v15-v20) | `checkSoilResistance()` · Pillar Set X AML escort boundary |
| **Institutional vaults** | ZeroDev Kernel + ExoMesh Worker BUSL payload path | ERC-7579 session + 106µs ExoMesh reflex |
| **Grant audit / Dune / PEV** | `GET /api/grant-audit` · **PEV (Prevented Exploit Volume)** · [Dune dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · production DuneSQL feed + chart ([`DUNE_DASHBOARD_SPECIFICATION.md`](../03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md)) | Pillar Set X ingress · Pillar Set Y intercepts · 10 bps builder revenue |

**Migration safety:** Kernel v3 → v4 adapter swap (Gatehouse only) — **Shield, Wasm, Stylus coprocessor, and EIP-712 Gate require zero rewrite** (§2.4.2 migration rule).

### 6.6 Architectural Trade-off: Sub-Millisecond AI Agent Rejection Proof vs. EIP-712

> **Sub-ms M2M Rejection Standard** — machine-to-machine agent swarm paths use deterministic session proofs; EIP-712 ECDSA is reserved for human-initiated chain settlement.

| Dimension | EIP-712 ECDSA (Settlement Plane) | HMAC-SHA256 Session Proof (M2M Reflex Plane) |
|-----------|----------------------------------|-----------------------------------------------|
| **Latency budget** | **1.2 ms – 3.5 ms** per sign (secp256k1 + wallet IPC) | **&lt; 12 µs** (`agent-citadel-guard` Edge budget) |
| **Use case** | `SliverVineGate.verifyAndConsume()` · human wallet · on-chain attestation anchor | AI trading swarms · sub-ms reject proofs · Agent Memory audit trail |
| **Non-repudiation** | On-chain verifiable ECDSA · consume-once digest | Cryptographically verifiable session proof bound to Citadel session entropy |
| **DoS vector** | High-frequency agent reject storms stall on signing latency | **~200× latency reduction** vs ECDSA — swarm-safe fail-closed |

**Core thesis:** EIP-712 ECDSA signing introduces **1.2 ms – 3.5 ms** latency overhead, creating a **Denial-of-Service vector** for sub-millisecond AI trading swarms that must reject toxic intents faster than mempool races.

**SliverVine solution:** `agent-citadel-guard` ([`src/core/agent-citadel-guard.ts`](../../src/core/agent-citadel-guard.ts)) utilizes **deterministic HMAC-SHA256 Session Proofs** (&lt; **12 µs** execution budget) for M2M rejection, achieving **~200× latency reduction** while maintaining cryptographically verifiable non-repudiation on the Edge audit plane.

**Formal split:**

| Plane | Standard | SSOT module |
|-------|----------|-------------|
| **M2M Reflex (reject / deadman)** | Sub-ms M2M Rejection Standard — HMAC-SHA256 session proof | `evaluateAgentCitadelGuard()` · `guardAgentUserOp()` |
| **Human / On-chain settlement** | EIP-712 `SliverVineCitadel` v1 · m-of-n Gate attestation | [`SliverVineGate.sol/`](../../SliverVineGate/out/SliverVineGate.sol) · `evaluateAttestation()` (SDK) |

**G11 UI fingerprint:** Demo HUD badge `GateDomainFingerprintBadge` calls `verifyGateDomainSeparator()` ([`src/services/gate-domain-fingerprint.ts`](../../src/services/gate-domain-fingerprint.ts)) to compare on-chain `domainSeparator()` against local EIP-712 recompute — detecting hijacked frontends that point at a forged Gate contract.

**License SSOT (G8):** First-party contracts (`SliverVineGate`, `GatedExecutor`, `SliverVineAgentPolicyGuard`, `SliverVineRiskOracle`, `IngressSafetySwitch`, Stylus coprocessor) = **BUSL-1.1** · `@slivervine/exomesh-agentic-wallet-guard` = **Apache-2.0**.

### 6.7 Architectural Benchmark: SliverVine High-Performance Innovations vs. Legacy Web3 Standards

> **Audit scope:** `src/` · `contracts/` · `SliverVineGate/` — proprietary designs that intentionally depart from conventional ERC/EIP patterns to achieve sub-millisecond HFT reflexes and AI-agent swarm protection.
> **SSOT modules:** [`agent-citadel-guard.ts`](../../src/core/agent-citadel-guard.ts) · [`session-key-gates.ts`](../../src/services/session-key-adapter-lib/session-key-gates.ts) · [`src/services/root-protection-lib/circuit-breaker-sever.ts`](../../src/services/root-protection-lib/circuit-breaker-sever.ts) · `soil_core.wasm` / `SliverVineSoilCoprocessor`.

| Dimension | Legacy Web3 Standard (ERC/EIP) | SliverVine Engineered Standard | Latency / Gas Improvement | Architectural Reason |
|-----------|-------------------------------|--------------------------------|---------------------------|----------------------|
| **AI Agent Rejection Proof** | [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed-data ECDSA (secp256k1 + wallet IPC) | **Sub-ms M2M Rejection Standard** — `agent-citadel-guard` deterministic **HMAC-SHA256 Session Proof** (`evaluateAgentCitadelGuard()` · `guardAgentUserOp()`) | **~200×** — **&lt; 12 µs** vs **1.2 – 3.5 ms** (ECDSA) | High-frequency agent reject storms must not block on signing latency; EIP-712 reserved for human / on-chain settlement (`SliverVineGate.verifyAndConsume`) |
| **Session Authorization Gate** | [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) UserOp → Bundler → EntryPoint validation (network RTT + mempool queue) | **SystemState single-flight** — `assertSessionKeyExecutionGates()` · `assertSigningChannelOpen()` ([`session-key-gates.ts`](../../src/services/session-key-adapter-lib/session-key-gates.ts) · `hl/auth/signing-gate.ts`) | **~10³–10⁴×** — in-process **&lt; 1 ms** vs **50 – 500 ms+** bundler round-trip | Structural session scope (R06/R07 clip) enforced **before** HL signature leaves Edge; bundler only delivers already-shielded intents |
| **Circuit Breaker / Kill Switch** | OpenZeppelin `Pausable` · on-chain `pause()` (≥ **1 block** · Arbitrum ~250 ms · mainnet ~12 s) | **Edge physical sever** — `severCircuitBreakerPipeline()` R17/R20 ([`src/services/root-protection-lib/circuit-breaker-sever.ts`](../../src/services/root-protection-lib/circuit-breaker-sever.ts)) · `severSigningChannel()` · EIP-712 pipe severed in-process | **~10⁵×** — **&lt; 1 ms** Edge sever vs **≥ 250 ms** on-chain pause | Toxic-fill window closes **before** mempool exposure; `SliverVineGate.halt()` is settlement-plane backup, not hot-path reflex |
| **Risk Oracle Flush** | `Ownable` / `Pausable` admin toggle (mutable · governance delay) | **Irreversible flush** — `SliverVineRiskOracle.applySignedReport(STATUS_SHUTDOWN)` → `isSystemFlushed = true` (one-way poison pill) | Same block on trigger; **zero** post-flush un-pause path | Compliance ingress (`IngressSafetySwitch`) fail-closed without independent admin surface |
| **Soil / Slippage Compute** | EVM Solidity storage reads + oracle `SLOAD` loops (gas-heavy · block-bound) | **Wasm hot path** [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm) (`#![no_std]`) + **Stylus coprocessor** `evaluate_soil_coprocessor()` (stateless u128 fixed-point) | **~10²×** latency — Edge **p50 ~106 µs** · Wasm warm **&lt; 60 µs** vs multi-ms EVM path; Stylus **stateless** (no storage reads) | Pre-broadcast math must run at HFT reflex speed; on-chain coprocessor = auditable parity, not hot-path substitute |
| **Gate Attestation Model** | Replayable signatures · mutable proxy upgrades | **Consume-once EIP-712** — `consumed[digest]` burned before external call (`SliverVineGate` · `GatedExecutor`) · immutable gate (no proxy) | `verifyAndConsume` **~25.8k – 28k gas** · attestation TTL **≤ 30 s** | One ALLOW cannot be redirected to arbitrary calldata; asymmetric authority (halt immediate · unhalt timelocked) |
| **AA Bundler Compliance** | Blind UserOp retry on bundler rejection | **[EIP-7562](https://eips.ethereum.org/EIPS/eip-7562) Zero-Bundler-Rejection Invariant** — `evaluateStaticBreakerMatrix()` pre-screen ([`zerodev-aa-static-breaker.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-static-breaker.ts)) | Eliminates wasted bundler RTT on toxic UserOps | Soil trip **denies sponsorship + broadcast** serially — no "paid but should-be-blocked" UserOps |
| **RPC / Scraper Defense** | Public RPC endpoint lists · no decoy layer | **Honeypot trap hosts** — `evaluateRpcDefenseGate()` · **99% synthetic slippage** ([`rpc-fetch-gate-eval.ts`](../../src/services/defense/rpc-fetch-gate-lib/rpc-fetch-gate-eval.ts)) | Unauthenticated scrapers fail-closed at **&lt; 1 ms** (no real venue RTT) | Anti-copycat: forked frontends hitting trap hosts receive decoy telemetry, not production state |
| **Frontend Trust Anchor** | Client-trusted `verifyingContract` string | **G11 domain fingerprint** — `verifyGateDomainSeparator()` on-chain `domainSeparator()` vs local EIP-712 recompute | One RPC `eth_call` · HUD badge `GateDomainFingerprintBadge` | Detects hijacked frontends pointing at forged Gate contracts |
| **Pre-Execution vs Post-Execution** | Gauntlet / Chaos Labs parameter dashboards (minutes → days) | **Interceptor Moat** — `checkSoilResistance()` inline before broadcast | **p50 ~106 µs** vs minutes–days governance loop | MEV / LVR damage is prevented, not rebalanced after fill |

**Code anchors (audit trail):**

| Pillar | Legacy pattern avoided | SliverVine SSOT |
|--------|------------------------|-----------------|
| AI Security | EIP-712 on every reject | [`src/core/agent-citadel-guard.ts`](../../src/core/agent-citadel-guard.ts) |
| Session Gate | ERC-4337 bundler as first gate | [`src/services/session-key-adapter-lib/session-key-gates.ts`](../../src/services/session-key-adapter-lib/session-key-gates.ts) · [`src/adapters/hl/auth/signing-gate.ts`](../../src/adapters/hl/auth/signing-gate.ts) |
| Circuit Breaker | On-chain `Pausable` | [`src/services/root-protection-lib/circuit-breaker-sever.ts`](../../src/services/root-protection-lib/circuit-breaker-sever.ts) · [`src/services/risk-control-lib/root-protection.ts`](../../src/services/risk-control-lib/root-protection.ts) |
| Compute Parity | EVM storage-heavy soil math | [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm) · [`contracts/stylus-probe/src/lib.rs`](../../contracts/stylus-probe/src/lib.rs) · [`src/services/risk-control-lib/soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) |

### 6.8 Competitive Positioning — Four-Dimensional ASCII Matrices (SliverVine Protocol)

**Entity:** SilverVine Labs · **Protocol:** SliverVine Protocol (BeΔ) · ExoMesh (Module A) · Sanctuary (Module B)  
**[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196):** Finalized ERC-8196 Standard (Ethereum Standard · Virtuals Protocol co-author).

Evaluator-facing comparison of SliverVine Protocol versus legacy execution, agent-wallet, and cross-venue stacks. Complements the §6.7 tabular benchmark.

**Matrix 1 — Execution & Pre-Broadcast Severance Profile**

```text
┌───────────────────────────┬─────────────────────────────┬────────────────────────────┬────────────────────────────┐
│ Dimension                 │ SliverVine ExoMesh (BeΔ)   │ Legacy ERC-4337 / OZ       │ Gauntlet / Chaos Labs      │
├───────────────────────────┼─────────────────────────────┼────────────────────────────┼────────────────────────────┤
│ 1. Latency Profile        │ p50 ~106µs (Sub-ms Edge)   │ 50ms – 500ms+ (Bundler RTT)│ Hours to Days (Parameter) │
│ 2. Pre-Broadcast Severance│ YES (0-Gas Fail-Closed)     │ NO (Post-validation/mempool│ NO (Post-execution audit) │
│ 3. Gas Overhead           │ 0 Gas (Edge Rejection)      │ Wasted Bundler Gas         │ On-chain Governance Gas    │
│ 4. Invariant Enforcement  │ Δnet ≡ 0 & lostUsd ≡ 0      │ Basic Balance Checks       │ Dynamic Risk Parameters    │
└───────────────────────────┴─────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

**Matrix 2 — AI Agent Wallet Policy & Execution Citadel**

```text
┌───────────────────────────┬─────────────────────────────┬────────────────────────────┬────────────────────────────┐
│ Dimension                 │ SliverVine ExoMesh (BeΔ)   │ Multisig / Timelock        │ Web2 LLM Guardrails        │
├───────────────────────────┼─────────────────────────────┼────────────────────────────┼────────────────────────────┤
│ 1. Policy Gate Layer      │ ERC-8196 (Final) Sub-ms Policy Gate│ On-chain Voting / Delay    │ API Proxy (Centralized)    │
│ 2. Prompt Injection Guard │ R20 Physical Deadlock       │ Vulnerable to Signed Intent│ Bypassable via Jailbreak   │
│ 3. Key Pipe Severing      │ <1ms `severSigningChannel`  │ N/A (Requires On-chain Tx) │ N/A (No On-chain Hook)     │
│ 4. Standard Alignment     │ ERC-8196 (Final) Sub-ms Policy Gate · EIP-7562 │ Standard ERC-20 / ERC-721  │ Proprietary REST APIs      │
└───────────────────────────┴─────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

**Matrix 3 — Cross-Venue Liquidation & Ingress Escort Paradigm**

```text
┌───────────────────────────┬─────────────────────────────┬────────────────────────────┬────────────────────────────┐
│ Dimension                 │ SliverVine ExoMesh (BeΔ)   │ Native DEX Limit Orders    │ Raw Cross-Chain Bridges    │
├───────────────────────────┼─────────────────────────────┼────────────────────────────┼────────────────────────────┤
│ 1. Cross-Spread Sensing   │ Live GMX/HL Soil Resistance │ Static Slippage Tolerance  │ Blind Asset Relaying       │
│ 2. Liquidation Defense    │ -40 Haircut (Observatory)   │ Cascading Liquidation Risk │ No Execution Awareness     │
│ 3. Ingress Accounting     │ `lostUsd ≡ 0` Escort Label  │ Immediate Capital Loss     │ Phantom In-flight Balances│
│ 4. AML Shielding          │ Blocked Reverse Path (46630)│ Open Protocol Ingress      │ Unfiltered Contamination   │
└───────────────────────────┴─────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

<a id="69-strategic-blue-chip-ecosystem-settlement-integrations-v10-core-v15-v20"></a>

### 6.9 Strategic Blue-Chip Ecosystem & Settlement Integrations (V1.0 Core + V1.5 / V2.0)

> **Commercial boundary:** v1.0 fee capture and liquidity routing are bound to **GMX v2 GM + HL delta-neutral** execution. **Pendle Institutional Shield**, **Variational Omni RFQ**, and **Stabilizer Sepolia Cross-Pass Sandbox** are **v1.0 Live** pre-execution firewalls — see [§2.5](#25-strategic-blue-chip-ecosystem-settlement-roadmap-v10-core-v15-v20).

| Venue | Integration surface | Reflex hook | Horizon |
|-------|-------------------|-------------|---------|
| **Pendle Finance** | PT/YT registry + sync oracle + cross-guard · soil-wired | `checkSoilResistance()` · `pendleOracle` / `pendleCrossGuard` · `PENDLE_ORACLE_STALE` · `evaluatePendleGmxCrossGuard()` · maturity &lt;7d + jitter &gt;200 bps fail-closed | **V1.0** |
| **Stabilizer** | Sepolia universal sandbox · zero-slippage stablecoin cross-pass routing | `evaluateStabilizerSwapGuard()` · identical `checkSoilResistance()` gate as Mainnet | **V1.0** ✅ Live · Sepolia `421614` |
| **Variational** | Omni RFQ stale quote · OLP depth · oracle drift | [`variational-rfq-adapter.ts`](../../src/adapters/variational-rfq-adapter.ts) · Bits 12–13 | **V1.0** ✅ Live · `pnpm demo:variational` |

---
