# Three Pillars & Institutional Ingress Pipeline

> **Document:** Pillar 1 Gatehouse (ZeroDev AA) · Pillar 2 Compliance Ingress · Pillar 3 Shield routing · agent adapters · **Vitest SSOT:** **199 test files \| 868 PASS Clean (100% PASS)** · **Wasm Core:** `<28kb` · **p50 ~106 µs**
> **Topology SSOT:** [`01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md) · **Defense Matrix:** [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md)

### 0.1 Bytecode Predicate Verification (v1.0) & ERC-7715 (⏳ Post-Grant Design Spec)

SliverVine does not interpret natural-language LLM prompts. The Shield enforces **Asymmetric Predicate Bytecode Hard Assertions** against ERC-4337 UserOp calldata inside the sub-ms Wasm core (p50 ~106 μs) — **powered 100% by `pkg/soil_core.wasm`**, independent of Account Abstraction. ZeroDev Kernel v3 is an **opt-in Pillar 1 delivery adapter** for scoped session keys when institutions enable AA (`USE_ZERODEV_AA`); it does **not** provide or power sub-ms latency.

> **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (AI Agent Wallet Policy):** Aligned with the **Finalized ERC-8196 Standard** ([ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) · Ethereum Standard · co-authored by Virtuals Protocol).

> **ERC-7715 (Advanced Wallet Permissions):** ⏳ **Planned / Post-Grant Design Spec** — evolution target for Gatehouse permission surfaces; **not shipped in v1.0**. Adapter swap path is documented for future ZeroDev / Offchain Labs integration without Shield or Wasm rewrite.

| Invariant | Mechanism | Status |
|-----------|-----------|--------|
| **Receiver Invariant** | Decode GMX v2 parameters from UserOp bytecode; assert `sender ≡ receiver` before any L2 broadcast. | ✅ v1.0 Delivered (Sepolia verified) |
| **Parameter Invariant** | Bound-check `acceptablePrice` (and related execution params) against oracle-lag sensors; fail-closed on drift. | ✅ v1.0 Delivered (Sepolia verified) |
| **Unidirectional Outbound Escort** | Pillar 2 enforces venue-agnostic outbound-only escort into Arbitrum `42161`; inbound AML contamination is blocked at the Compliance Ingress Firewall. Robinhood Chain (`46630`/`4663`) is the inaugural reference adapter. | ✅ v1.0 Delivered (Sepolia verified) |

### 0.2 v1.0 Delivered Scope vs Post-Grant Roadmap

| Horizon | Status | Scope |
|---------|--------|-------|
| **v1.0 Delivered (Sepolia + Arbitrum One)** | ✅ Code-Verified Live | **SliverVine Citadel Shield** — Pre-Consensus Intent Firewall · GMX v2 ETH/USDC GM + HL 1× short · Wasm `checkSoilResistance()` p50 ~106µs · **Pendle Institutional Shield** (sync oracle · `PENDLE_ORACLE_STALE` soil fuse · cross-guard) · **Stabilizer Sepolia Cross-Pass Sandbox** (`421614`) · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Final) policy pre-validation · EIP-712 consume-once Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · **Arbitrum One Mainnet Ignition** [`0x54c153…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · Dune + SHA-256 `GET /api/grant-audit` · **199 test files \| 868 PASS Clean (100% PASS)** |
| **v1.0 Active Target** | ✅ Mainnet Ignition Delivered | Single blue-chip anchor: **GMX v2 ETH/USDC GM Pool** + Hyperliquid **1× short** hedge · Gate live on **42161** |
| **v1.0 Partial — HL Orderbook Gap Guard** | ✅ Code-Verified | `evaluateHlOrderbookGapGuard()` in [`hl-orderbook-gap-guard.ts`](../../src/services/risk-control-lib/hl-orderbook-gap-guard.ts) · wired via [`soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) — gap-window leverage scale-down + 2× depth floor |
| **v1.0 Live — Pendle Institutional Shield** | ✅ Code-Verified Live | **Pillar 3 Core** — [`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) (sync cache · TTL 60s) · [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) (`hydrateFromOracle`) · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) · `pendleOracle` / `pendleCrossGuard` → `checkSoilResistance()` · **199 test files \| 868 PASS Clean (100% PASS)** |
| **V1.5 Roadmap Spec** | ⏳ Planned | **Sub-ms Agentic Security & Swarms** — ERC-8196 (Final) fleet enforcement · EIP-7702 EOA → Agent Smart Account · Prompt Injection Defense Circuit (`severSigningChannel()` sub-100µs) · BTC/USDC isomorphic GM (config-only) |
| **V2.0 Design Spec** | ⏳ Planned | **Institutional CaaS & Orbit Shield** — `@slivervine/citadel-sdk` for AI DEXs / Orbit L3s · Pre-execution risk checks · ZeroDev Stage ⑦ Intent Composition (2PC ledger) |

**ZeroDev AA v1.0 active scope (Opt-In Pillar 1):** **Native Integration** with **ZeroDev Kernel v3 (ERC-7579)** + **Ultra-Relay Intent Network** — Stage ① Sign-in · ③ Gas ($0.50/op · $10/day) · ④ Scoped Session Keys (ERC-7579 TYPE 1 validator) · ⑤ Execution — `SliverVineRiskOracle` = **ERC-7579 Pre-Execution Hook (TYPE 4)** · Sepolia dry-run verified (`pnpm test:zerodev`). **v0.95 SSOT (`5829e9a`):** HL session-key consume-once nonce + `expiresAt` replay guard · USD.ai `[CLOCK_SSOT_VERIFIED]`. Stage ② Smart Routing = **Reference Harness & Spec** (Vitest). Stages ⑥ Recover · ⑦ Compose = **⏳ Post-Grant Roadmap (V1.5 / V2.0)**. Pillar 3 Wasm Shield and Pillar 2 Arbitrum Native Ingress operate **100% independently** of ZeroDev.

#### 2.4.6 v0.95 SSOT — ZeroDev AA Security Audit Closure

| Item | Resolution | Code / doc anchor |
|------|------------|-------------------|
| Proprietary vs official ZeroDev plugin | **Resolved in v0.95 SSOT** — Citadel-owned adapter; ERC-7579 typings in `zerodev-aa-types.ts` | `src/adapters/arbitrum/zerodev-aa/` |
| Session key replay (50.94 KiB Worker path) | **Resolved in v0.95 SSOT** — `auditSessionKeyNonceState` + `verifySessionKeyValidity` before broadcast | `execute-order.ts` · commit `5829e9a` |
| `SliverVineRiskOracle` hook classification | **ERC-7579 Pre-Execution Hook** — gate binds oracle status before Ultra-Relay UserOp ingress | `SliverVineRiskOracle.sol` · `zerodev-aa-gate-types.ts` |

**Demo:** `pnpm demo` — 12 Tri-Pillar ANSI scenarios (GMX · HL · Pendle · p50 ~106µs) · `pnpm demo:e2e` — **4-step Happy Path** grant E2E (Intent+Deadman → Robinhood escort → GMX underweight → HL Session hedge) · optional `--unwind` (Step 5 R20) · `--trip` (Step 1 intercept).

### 0.3 Agent Ecosystem Adapters (V1.0 Live · Native Integrations)

Production-native adapters in [`src/adapters/`](../../src/adapters/) — each framework has an **isolated module**, dedicated CLI demo, and Vitest suite. All validate agent intent, session key bounds, and `checkSoilResistance()` before transaction dispatch.

| Framework | Status | Module SSOT | Entry point | CLI | Test |
|-----------|--------|-----------|-------------|-----|------|
| **Wayfinder** | ✅ V1.0 Live | [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) | `wayfinderCitadelShieldHook` | `pnpm demo:wayfinder` | [`wayfinder-shield.test.ts`](../../tests/adapters/wayfinder-shield.test.ts) |
| **ElizaOS** | ✅ V1.0 Live | [`elizaos-citadel-plugin.ts`](../../src/adapters/elizaos/elizaos-citadel-plugin.ts) | `evaluateElizaCitadelAction()` | `pnpm demo:elizaos` | [`elizaos-plugin.test.ts`](../../tests/adapters/elizaos-plugin.test.ts) |
| **Virtuals (GAME)** | ✅ V1.0 Live | [`virtuals-game-adapter.ts`](../../src/adapters/virtuals/virtuals-game-adapter.ts) | `evaluateVirtualsGameTask()` | `pnpm demo:virtuals` | [`virtuals-adapter.test.ts`](../../tests/adapters/virtuals-adapter.test.ts) |
| **LangChain / LangGraph** | ✅ V1.0 Live | [`langchain-citadel-tool.ts`](../../src/adapters/langchain/langchain-citadel-tool.ts) | `CitadelRiskGuardTool` | `pnpm demo:langchain` | [`langchain-tool.test.ts`](../../tests/adapters/langchain-tool.test.ts) |
| **Stabilizer Protocol** | ✅ V1.0 Live | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) | `evaluateStabilizerSwapGuard()` | `pnpm demo:stabilizer` | [`stabilizer-adapter.test.ts`](../../tests/adapters/stabilizer-adapter.test.ts) |
| **USD.ai** | ✅ V1.0 Live | [`usdai-adapter.ts`](../../src/adapters/usdai/usdai-adapter.ts) | `evaluateUsdAiCollateralGuard()` | `pnpm demo:usdai` | [`usdai-adapter.test.ts`](../../tests/adapters/usdai-adapter.test.ts) |
| **Quad-Agent (combined)** | ✅ V1.0 Live | [`quad-agent-demo.ts`](../../examples/quad-agent-demo.ts) | All four AI frameworks | `pnpm demo:quad` | — |
| **CrewAI / AutoGen** | ⏳ V1.5 Roadmap Spec | Python `BaseTool` / Citadel REST Client | `SlivervineCrewAIGuardTool` | `examples/adapters/crewai-autogen-adapter.py` | — |

**Regression bar:** **199 test files | 868 PASS Clean (100% PASS)** · `pnpm test -- --run` · `pnpm exec tsc --noEmit` **0 errors**

### Core Sinking SSOT (`src/core/`)

Pure risk invariants are sunk into five core modules; `src/adapters/` and `src/services/` preserve legacy import paths via thin-shell re-exports. See [`architecture/README.md`](./README.md#core-sinking-ssot-srccore) for the module table · [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md) for USD.ai / soil integration.

**PEV (Prevented Exploit Volume) — Dune Analytics Telemetry Metric:**

| Field | Definition |
|-------|------------|
| **Metric** | **PEV** — nominal USD volume of toxic intents blocked pre-broadcast (0-Gas fail-closed severance) |
| **Event sources** | `RiskTripBlocked` on-chain events · soil-trip `SOIL_RESISTANCE_TRIP` logs · `GET /api/grant-audit` `duneTelemetry` JSON |
| **Indexer SSOT** | [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) — Sepolia event streaming verified; production DuneSQL targets **ChainID `42161`** |

### 0.4 Stabilizer Sepolia — Universal Testnet Sandbox & Cross-Pass Layer (V1.0 Live)

**Arbitrum Sepolia (`421614`) is the Universal Testnet Sandbox & Cross-Pass Interoperability Layer** for AI agent development. Citadel applies the **same `checkSoilResistance()` bytecode and risk gates** on Sepolia as on Arbitrum One (`42161`) — enabling auditors and integrators to validate fail-closed behavior on **live testnet contracts** without mainnet gas or capital friction.

| Cross-pass leg | Sepolia role | Adapter / demo SSOT | Shared gate |
|----------------|--------------|---------------------|-------------|
| **Stabilizer** | 1:1 zero-slippage USDZ / USDC / USDT / USDS rebalance | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · `pnpm demo:stabilizer` | `evaluateStabilizerSwapGuard()` → `checkSoilResistance()` |
| **GMX v2** | Sepolia shadow-margin · price-impact pre-flight | [`gmx-v2-agent-flow.demo.test.ts`](../../tests/demo/gmx-v2-agent-flow.demo.test.ts) · `gmx-v2-order-payload-guards.ts` | `gmxPriceImpact` · depth soil probes |
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

**Verification bar:** **199 test files | 868 PASS Clean (100% PASS)** · `pnpm demo:stabilizer` · `pnpm demo` (Tri-Pillar GMX/HL/Pendle harness).

### 2.2 Traditional Bridge vs SilverVine Pillar 2 Compliance Escort

```text
Traditional Omnichain Bridge (bidirectional · loss opaque)
┌──────────────┐   relayer / LP / messaging   ┌──────────────┐
│  Source L2   │ ───────────────────────────► │  Dest L2     │
│  (any chain) │ ◄─────────────────────────── │  (any chain) │
└──────────────┘   timeout → stuck / social   └──────────────┘
                   recovery · lostUsd > 0 risk

SilverVine Pillar 2 Compliance Escort (unidirectional · fail-closed)
┌─────────────────────┐  Across reference   ┌─────────────────────┐
│ Robinhood Chain     │  escort state mach. │ Arbitrum One 42161  │
│ 46630 / 4663 USDG   │ ──────────────────► │ GMX v2 · Pendle PT  │
│ institutional treas.│ IN_FLIGHT → SETTLED │ deployable NAV only │
└─────────────────────┘                     └─────────────────────┘
         ▲
         └── inbound 42161→46630/4663 AML BLOCKED · lostUsd ≡ 0
```

| Dimension | Traditional Bridge | SilverVine Pillar 2 Escort |
|-----------|-------------------|----------------------------|
| **Ingress direction** | Bidirectional pools · any-chain routing | **Unidirectional outbound-only** — Robinhood `46630`/`4663` → Arbitrum `42161` |
| **In-flight timeout shield** | Capital may appear lost · manual recovery | **>3600s** Across timeout → `BRIDGE_TIMEOUT_FAIL_CLOSED` · **0-Gas severance** |
| **Pending-capital accounting** | Ambiguous pending / LP share semantics | `IN_FLIGHT_BRIDGE_CAPITAL` → `SETTLED` · deployable ⇔ settled ∧ route allowed |
| **Loss invariant** | External insurance / social layer | **`lostUsd ≡ 0`** — state machine SSOT · Vitest **6/6** · `pnpm demo:escort` |

**CLI:** `pnpm demo:escort` — multi-route HUD (Route A RH→42161 · Route B HL L1 probe · Route C Arb→Base) · `pnpm demo:escort -- --trip` — timeout fail-closed + `lostUsd ≡ 0` check.

### 2.3 ZeroDev Smart Route Calldata Binding (Pillar 2 Reference Harness — Demo Spec)

> **Status:** **Reference Harness & Spec** — Dry-run verified via Vitest (`tests/adapters/gmx-smart-route-payload-binding.test.ts`). This serves as an evaluator-reproducible reference adapter. Production execution baseline defaults to **Arbitrum One Native Ingress**.

**Pillar 2 context:** This section documents a **reference harness surface** of the Compliance Ingress Firewall — ZeroDev Kernel UserOp calldata binding from permissioned ingress (Robinhood `46630`/`4663` **USDG** as inaugural reference adapter) to Arbitrum GMX execution. **`GMX_V2_EXCHANGE_ROUTER_ARBITRUM`** (`ZERODEV_SMART_ROUTE_TARGETS` · `gmx-revenue.ts`) → **`GM_ETH_USDC`** pool — single-click cross-chain deposit/swap calldata spec, no hot-wallet custody.

**Payload binding (calldata-level, Gate struct unchanged):** `buildGmxSmartRoutePayloadBinding()` encodes smart-route calldata → `computeGatedExecutorPayloadHash()` mirrors on-chain `GatedExecutor.payloadHash(initiator, target, keccak256(data), nonce)`. The digest fills the existing `RiskAttestation.payloadHash` field — **`SliverVineGate.sol` `ATTESTATION_TYPEHASH` and struct layout are not modified**.

Anchors: [`gmx-smart-route-payload-binding.ts`](../../src/services/adapters/gmx-smart-route-payload-binding.ts) · [`gated-executor-payload.ts`](../../src/sdk/gated-executor-payload.ts) · [`r-chain-yield-router.ts`](../../src/adapters/robinhood/r-chain-yield-router.ts) · [`GatedExecutor.sol`](../../SliverVineGate/src/GatedExecutor.sol).

### 2.4 Pillar 1 — Opt-In ZeroDev Account Abstraction (Integration Summary)

> **Full Pillar 1 specification:** [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) — ZeroDev Kernel v3 session keys, EIP-7702 comparative analysis, `sessionOk` / `allowedToSign` dry-run scope (`pnpm run demo:e2e`), and `pnpm test:zerodev` harness. This section retains integration anchors only.

> **Status:** v1.0 production SSOT = **Kernel v3** (`ZERODEV_KERNEL_VERSION` v0.3.1 · EntryPoint v0.7); **Kernel v4** = post-grant V1.5 alignment path (Gatehouse adapter upgrade only — **no rewrite** of Shield / Wasm / EIP-712 Gate).

> **Boundary:** ZeroDev Kernel v3 is an **opt-in Pillar 1 AA layer** (`USE_ZERODEV_AA` default-off). ZeroDev infrastructure failure, bundler outage, or Paymaster exhaustion **never** impairs the **Edge Wasm Shield** (`checkSoilResistance()` · p50 ~106 µs) or **Arbitrum Native Ingress** — institutions fall back to EOA / native signing paths with identical pre-broadcast protection.

#### 2.4.1 Role of ZeroDev: Scoped Session Keys & Gas Sponsorship (Pillar 1 Opt-In AA Layer)

SliverVine Protocol separates **pre-broadcast risk enforcement** from **account delivery**. ZeroDev Kernel v3 is an **opt-in Pillar 1 layer** — institutions may enable scoped session keys and Paymaster gas sponsorship; the protocol does **not** require ZeroDev for core Citadel protection or bridge accounting.

| Layer | Role | SSOT | Dependency on ZeroDev |
|-------|------|------|------------------------|
| **Pre-Broadcast Risk Core (p50 ~106 µs)** | Sub-ms soil fuse · R01–R20 · fail-closed severance | `pkg/soil_core.wasm` · `checkSoilResistance()` on Cloudflare Edge | **None** — runs 100% independently of AA |
| **ZeroDev Kernel v3 (Pillar 1)** | Opt-in smart-account delivery plane · scoped **30s** session keys · Paymaster sponsorship | `src/adapters/arbitrum/zerodev-aa/` · `pnpm test:zerodev` | **Opt-in** — `USE_ZERODEV_AA` default-off |
| **Baseline ingress (no AA)** | Direct Arbitrum Native Ingress · Across bridge escort | [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) · native GMX/HL adapters · Unit-Verified Vitest **6/6** | **Independent** — `lostUsd ≡ 0` guaranteed by bridge state machine, not AA |

**Separation of powers:**

- **Pre-Broadcast Risk Core (p50 ~106 µs):** Powered 100% independently by SliverVine Edge Wasm (`pkg/soil_core.wasm`). Every intent — EOA, Kernel UserOp, or bridge escort — is evaluated by `checkSoilResistance()` **before** any broadcast path.
- **ZeroDev Kernel v3 (Pillar 1):** Serves as an **Opt-In Smart Account Delivery Plane** for scoped 30s session keys and Paymaster gas sponsorship. Citadel never holds user keys or principal — capital remains in the Kernel `sender` smart account when AA is enabled (R06–R07 · ERC-7579).
- **Baseline Fallback:** Direct **Arbitrum One Native Ingress** and **Across Bridge** adapters operate smoothly with or without ZeroDev enabled. The `lostUsd ≡ 0` invariant is guaranteed by the bridge state machine and escort accounting — **not** by Account Abstraction.

When ZeroDev **is** enabled, it provides three delivery-plane capabilities SliverVine does not replicate in-house:

| Capability | Without ZeroDev (baseline) | With Opt-In ZeroDev integration |
|------------|--------------------------|-----------------------------------|
| **Scoped Session Keys** | EOA or institutional multisig signing | Kernel modular `ORDER_EXECUTE` · R06/R07 notional cap · 30s TTL auto-expiry |
| **Paymaster sponsorship** | Institutions prefund Arbitrum gas | `zerodev.sponsorUserOperation` · per-op ≤ $0.50 · daily $10 circuit breaker |
| **Bundler standard path** | Direct `eth_sendRawTransaction` or venue-native signing | EntryPoint v0.7 + **EIP-7562** compliant UserOp · fail-closed · no blind retry |

**Execution pipeline (opt-in AA path only):**

```text
UserOp draft → verifyAgentIntent() [Edge Shield · p50 ~106µs · Wasm — independent of AA]
 → evaluateStaticBreakerMatrix() [soil + gas ledger]
 → Paymaster sign → Bundler → EntryPoint → Kernel validateUserOp
```

The Shield decides **before broadcast** on every path; ZeroDev handles **non-custodial account delivery only** when explicitly opted in. If ZeroDev is unavailable, institutions route through **Arbitrum Native Ingress** or **Across Bridge** escort — the Wasm Shield and `lostUsd ≡ 0` invariants remain fully operational.

#### 2.4.2 Kernel v3 / v4 Session Keys (ERC-7579 Modular Permissions)

> **Scope:** Kernel v3 session keys are the v1.0 delivered AA surface. Kernel v4 alignment is **post-grant (V1.5)** — adapter swap only; Shield / Wasm / Gate are unchanged.

| Dimension | Kernel v3 (v1.0 delivered) | Kernel v4 (V1.5 alignment) |
|-----------|------------------------------|------------------------------|
| **Module standard** | ERC-7579 modular session keys | v4 unified permission surface · ZeroDev "One Stack" |
| **Permission scope** | `ORDER_EXECUTE` · whitelisted `callData` target/selector | Same R06 semantics · extended Smart Routing cross-chain session scope |
| **Notional cap** | `SESSION_KEY_NOTIONAL_CAP_USD` = **$5,000** (R07) | Config-driven · invariant formulas unchanged |
| **TTL / re-auth** | Session TTL + R14 EIP-712 5-min re-auth | v4 Authorize stage native alignment · adapter swap only |
| **Signature path** | Kernel `isValidSignature` → ERC-1271 `0x1626ba7e` | Dual plane: Kernel ERC-1271 ∥ Gate ECDSA m-of-n |
| **Code anchors** | `src/adapters/arbitrum/zerodev-aa/` · `hl-session/permissions.ts` | ⏳ Post-Grant (V1.5) adapter swap · **Shield / Wasm zero rewrite** |

**Migration rule:** Kernel v3 → v4 replaces Gatehouse adapters only (`zerodev-aa-userop.ts` · `zerodev-aa-gate.ts`); `checkSoilResistance()`, `pkg/soil_core.wasm`, and `SliverVineGate.sol` **do not change** with Kernel major version.

#### 2.4.3 Paymaster Gas Sponsorship (Sponsorship & Circuit Breakers)

> **Scope:** Paymaster sponsorship is **opt-in** (Pillar 1). Daily cap exhaustion falls back to `sponsored: false` — UserOp drafting continues on self-funded gas; **Edge Wasm Shield and Arbitrum Native Ingress are unaffected**.

| Parameter | Value | SSOT |
|-----------|-------|------|
| Per-UserOp sponsorship cap | **$0.50 USD** | `MAX_GAS_COST_PER_USEROP_USD` |
| 24h rolling sponsorship budget | **$10 USD** | `DAILY_SPONSORSHIP_LIMIT_USD` |
| Trip code | `ZERODEV_GAS_LIMIT_EXCEEDED_TRIP` | `zerodev-aa-static-breaker.ts` |
| Paymaster middleware | `zerodev.sponsorUserOperation` | `zerodev-aa-userop.ts` |
| Persistence (optional) | KV `zerodev:aa:gas:ledger` · TTL 86,400s | `zerodev-aa-gas-ledger.ts` |

Sponsorship and soil fuse are **serially evaluated**: `evaluateStaticBreakerMatrix()` runs `checkSoilResistance()` first, then `evaluateSponsoredGasLimits()` — on soil trip, **both sponsorship and broadcast are denied**, preventing "paid but should-be-blocked" UserOps from reaching the bundler.

#### 2.4.4 EIP-7562 Zero-Bundler-Rejection Invariant

> **Scope:** Applies only when ZeroDev AA is **opted in**. Bundler timeout or rejection triggers fail-closed on the UserOp path — institutions may bypass AA entirely via Arbitrum Native Ingress without losing Shield protection.

**Zero-Bundler-Rejection Invariant:** Citadel UserOps MUST NOT trigger EIP-7562 opcode/storage violations during the validation phase; bundler rejection is a **protocol fault**, not a retry signal.

| Rule | Enforcement |
|------|-------------|
| Validation-phase storage reads | Session-key modules restrict `callData` to whitelisted target/selector — no forbidden cross-contract reads |
| Edge pre-screen | Static breaker + `checkSoilResistance()` before `sendUserOperation()` |
| Fail-closed | Bundler unreachable · missing EP v0.7 · timeout → `BUNDLER_TIMEOUT_FAIL_CLOSED` (`ZERODEV_BUNDLER_FAIL_CLOSED_TIMEOUT_MS` = 3,000 ms) |
| Probe | `supportsEntryPoint07` · `zerodev-aa-bundler.ts` smoke probe |

This invariant ensures institutional UserOps are **predictably deliverable** on Arbitrum bundler infrastructure — not silently dropped for storage violations — consistent with the 106 µs Shield fail-closed philosophy.

#### 2.4.5 ZeroDev v4 "Seven Stages, One Stack" Alignment Roadmap (Post-Grant Spec)

ZeroDev v4 converges the smart-wallet lifecycle into **seven stages, one stack**. SliverVine Protocol v1.0 delivers stages **①–⑤** (with ② as reference harness only); stages **⑥–⑦** are explicitly **post-grant roadmap** — not claimed as v1.0 scope.

| Stage | ZeroDev v4 semantics | SliverVine Citadel Shield integration anchor | Status |
|-------|---------------------|-------------------------|--------|
| **① Sign in** | Identity · Kernel account resolution | ZeroDev login → `sender` Kernel address · no hot-wallet seed | ✅ v1.0 Delivered (Sepolia verified) |
| **② Fund** | Cross-chain deposit · Smart Routing | `ZERODEV_SMART_ROUTE_TARGETS` · USDG → GMX ExchangeRouter (§2.3 reference harness) | 📋 Reference Harness (Vitest dry-run verified) |
| **③ Gas** | Paymaster sponsorship | `zerodev-aa-gas-ledger` · per-op / daily caps (§2.4.3) | ✅ v1.0 Delivered (Sepolia verified) |
| **④ Authorize** | Session key scope | ERC-7579 `ORDER_EXECUTE` · R06/R07 · R14 re-auth | ✅ v1.0 Delivered (Sepolia verified) |
| **⑤ Execute** | UserOp broadcast · on-chain execution | `verifyAgentIntent()` → Shield → Bundler → GMX/HL venue | ✅ v1.0 Delivered (Sepolia verified) |
| **⑥ Recover** | Account recovery · social recovery | — | ⏳ Post-Grant Roadmap (V1.5) — *Out of scope for v1.0 (handled by upstream Kernel/EOA owner)* |
| **⑦ Compose** | Multi-step intent composition | 2PC intent ledger · `intent-ledger.ts` (partial internal coverage) | ⏳ Post-Grant Roadmap (V2.0 CaaS) — *Off-chain 2PC intent ledger (partial internal coverage)* |

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

> **Scope honesty:** v1.0 active execution and fee capture remain **GMX v2 ETH/USDC GM + Hyperliquid 1× short** on Arbitrum One (§2 triangle). **Pendle Institutional Shield** is a **v1.0 Live Core Pillar 3** pre-execution firewall (not a fee-capture path). **Stabilizer Sepolia Cross-Pass Sandbox** is **v1.0 Live** on `421614`. Uniswap V3 and Variational remain modular post-grant settlement extensions.

| Partner / Venue | Strategic role | Citadel integration | Horizon | Status |
|-----------------|----------------|---------------------|---------|--------|
| **Pendle Finance** (Yield & Rate Hedging) | PT/YT safety sentinel for AI agents in yield-tokenization markets — **not a yield competitor** | `checkSoilResistance()` · `pendleOracle` / `pendleCrossGuard` soil probes · [`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) (sync cache · TTL 60s · `PENDLE_ORACLE_STALE`) · `evaluatePendleGmxCrossGuard()` · `evaluatePendlePtExpiryRisk()` · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) · [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) | **V1.0** | ✅ Live · Core Pillar 3 · **199 test files \| 868 PASS Clean (100% PASS)** |
| **USD.ai** (AI-Compute RWA Yield Collateral) | Yield-bearing sUSDai collateral tier for AI agent treasury — GPU oracle · peg drift · NAV vs mark · depth fuse | [`usdai-adapter.ts`](../../src/adapters/usdai/usdai-adapter.ts) · `evaluateUsdAiCollateralGuard()` · `usdai` → `collectExternalSoilFlags()` · `USD_AI_DEPEG_ORACLE_TRIP` | **V1.0** | ✅ Live · Core Pillar 3 · `pnpm demo:usdai` |
| **Stabilizer** (Sepolia Cross-Pass Sandbox) | Universal testnet sandbox for AI agent stablecoin rebalance · cross-pass routing to GMX v2 + Pendle on `421614` | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · `evaluateStabilizerSwapGuard()` · identical `checkSoilResistance()` gate as `42161` | **V1.0** | ✅ Live · Sepolia `421614` · `pnpm demo:stabilizer` |
| **Uniswap V3 DEX** (Native Liquidity) | Arbitrum-native `GRAIL` liquidity depth for delta-neutral rebalance friction reduction | Uniswap V3 API on RPC allowlist (`api.uniswap.org`) · rebalance leg optimizer · `FRICTION_BUFFER_APY` absorption in [`rebalance-rules.ts`](../../src/services/yield/rebalance-rules.ts) | **V1.5** | ⏳ Roadmap Spec |
| **Variational** (Next-Gen Perps & Cross-Venue Alternative) | Future-proof integration for advanced decentralized perps and cross-chain margin routing — extensible complement/alternative to Hyperliquid hedge leg | `buildVariationalShortOrder()` · `evaluateVariationalOrderbookDepth()` PoC · same-chain Arbitrum hedge extension | **V2.0** | ⏳ PoC Spec ([`docs/logging/20260827_v1.5_aave_variational_adapter_poc_ZH.md`](../logging/20260827_v1.5_aave_variational_adapter_poc_ZH.md)) |

```text
v1.0 Active Triangle (42161)
  GMX v2 GM Yield ──1× Δ-neutral──► Hyperliquid Short
         │
         ├──► V1.0: Pendle Institutional Shield (Pillar 3 · sync oracle · soil fuse)
         ├──► V1.0: USD.ai AI-Compute Yield Collateral (Pillar 3 · `USD_AI_DEPEG_ORACLE_TRIP`)
         └──► V1.0: Stabilizer Sepolia Cross-Pass Sandbox (421614 · Stabilizer→GMX→Pendle)
         └──► V1.5+: Uniswap V3 zero-slippage settle
         └──► V2.0: Variational native perp hedge (HL complement/alternative)
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
│ SliverVine Citadel Shield Pre-Execution Reflex Hook (106µs Cerebellum) │
│ Edge: verifyAgentIntent() → evaluateSoilCore() │
│ → checkSoilResistance() [pkg/soil_core.wasm] │
│ On-chain: SliverVineSoilCoprocessor.evaluate_soil_…() │
│ [contracts/stylus-probe/src/lib.rs] │
└─────────────────────────┬─────────────────────────────────┘
 │ AllowedToSign = true
 ▼
 Paymaster → Bundler → EntryPoint → GMX / HL
```

### 6.2 ZeroDev Kernel v3 Validator Module (Pillar 1)

| Hook point | ERC-7579 module role | SliverVine Citadel Shield invariant |
|------------|---------------------|----------------|
| **`validateUserOp`** | Session module verifies scoped signature + callData shape | Whitelisted GMX ExchangeRouter · HL adapter selectors only |
| **`isValidSignature` (ERC-1271)** | Kernel returns `0x1626ba7e` on scoped intent digest | Dual plane: Kernel ERC-1271 ∥ Gate ECDSA m-of-n attestation |
| **Session TTL** | Module-enforced expiry | `DEFAULT_TTL_MS` · heartbeat · deadman switch (`agent-citadel-guard`) |
| **Notional cap (R07)** | `SESSION_KEY_NOTIONAL_CAP_USD` = **$5,000** | Physical severance on breach — no partial fill escape |

**Code anchors:** `src/adapters/arbitrum/zerodev-aa/` · `src/core/agent-citadel-guard.ts` · `src/sdk/agent-intent.ts` · §2.4.2 Kernel v3 / v4 Session Keys.

### 6.3 Stylus Wasm Soil Hook (Pillar 3 Reinforcement)

| Property | Edge Wasm (`pkg/soil_core.wasm`) | Stylus Coprocessor (`contracts/stylus-probe/src/lib.rs`) |
|----------|----------------------------------|----------------------------------------------------------|
| **Entry** | `evaluateSoilCore()` via `@slivervine/citadel-sdk` | `evaluate_soil_coprocessor(spread_bps, depth_usd, slippage_bps)` |
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
| `sessionOk` | `session-key-gates.ts` | ERC-7579 module clip enforcement |
| `soilOk` | `checkSoilResistance()` · Wasm · Stylus | **Pre-execution reflex hook** |
| `attOk` | `SliverVineGate.sol` | Consume-once EIP-712 attestation |
| `deadmanOk` | `agent-citadel-guard.ts` | Cross-venue slippage severance |

### 6.5 AI Agent Integration Surface

> *"These framework adapters provide modular integration specifications for pre-execution risk checks via `@slivervine/citadel-sdk` and REST APIs. In v1.0, active fee-capture and liquidity routing are strictly bound to Arbitrum One GMX v2 GM + HL delta-neutral execution; multi-platform agent fee routing is targeted for V2.0 CaaS monetization."*

| Consumer | Integration | Reflex hook |
|----------|-------------|-------------|
| **Third-party dApps** | `@slivervine/citadel-sdk` · `verifyAgentIntent()` · `withCitadelShield` | Apache-2.0 · sub-ms soil gate |
| **ElizaOS** | ✅ V1.0 Live Native Integration — [`elizaos-citadel-plugin.ts`](../../src/adapters/elizaos/elizaos-citadel-plugin.ts) · [§0.3](#03-agent-ecosystem-adapters-v10-live--native-integrations) | `evaluateElizaCitadelAction()` · `checkSoilResistance()` |
| **Virtuals GAME** | ✅ V1.0 Live Native Integration — [`virtuals-game-adapter.ts`](../../src/adapters/virtuals/virtuals-game-adapter.ts) · [§0.3](#03-agent-ecosystem-adapters-v10-live--native-integrations) | `evaluateVirtualsGameTask()` · `checkSoilResistance()` |
| **LangChain** | ✅ V1.0 Live Native Integration — [`langchain-citadel-tool.ts`](../../src/adapters/langchain/langchain-citadel-tool.ts) · [§0.3](#03-agent-ecosystem-adapters-v10-live--native-integrations) | `CitadelRiskGuardTool` · `checkSoilResistance()` |
| **Wayfinder** | ✅ V1.0 Live Native Integration — [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) · [§0.3](#03-agent-ecosystem-adapters-v10-live--native-integrations) | `wayfinderCitadelShieldHook` · `verifyAgentIntent()` |
| **Stabilizer** | ✅ V1.0 Live Native Integration — [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · [§0.4](#04-stabilizer-sepolia--universal-testnet-sandbox--cross-pass-layer-v10-live) | `evaluateStabilizerSwapGuard()` |
| **CrewAI / AutoGen (enterprise)** | ⏳ V1.5 Ecosystem Roadmap / Modular Integration Spec — `SlivervineCrewAIGuardTool` · AutoGen `citadel_soil_guard` · [`crewai-autogen-adapter.py`](../../examples/adapters/crewai-autogen-adapter.py) · [§0.3](#03-agent-ecosystem-adapters-v15-roadmap) | `checkSoilResistance()` · Pillar 2 AML escort boundary |
| **Institutional vaults** | ZeroDev Kernel + Citadel Worker BUSL payload path | ERC-7579 session + 106µs Shield |
| **Grant audit / Dune / PEV** | `GET /api/grant-audit` · **PEV (Prevented Exploit Volume)** · [Dune dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · production DuneSQL feed + chart ([`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md)) | Pillar 2 ingress · Pillar 3 intercepts · 10 bps builder revenue |

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

**SliverVine solution:** `agent-citadel-guard` (`src/core/agent-citadel-guard.ts`) utilizes **deterministic HMAC-SHA256 Session Proofs** (&lt; **12 µs** execution budget) for M2M rejection, achieving **~200× latency reduction** while maintaining cryptographically verifiable non-repudiation on the Edge audit plane.

**Formal split:**

| Plane | Standard | SSOT module |
|-------|----------|-------------|
| **M2M Reflex (reject / deadman)** | Sub-ms M2M Rejection Standard — HMAC-SHA256 session proof | `evaluateAgentCitadelGuard()` · `guardAgentUserOp()` |
| **Human / On-chain settlement** | EIP-712 `SliverVineCitadel` v1 · m-of-n Gate attestation | `SliverVineGate.sol` · `evaluateAttestation()` (SDK) |

**G11 UI fingerprint:** Demo HUD badge `GateDomainFingerprintBadge` calls `verifyGateDomainSeparator()` (`src/services/gate-domain-fingerprint.ts`) to compare on-chain `domainSeparator()` against local EIP-712 recompute — detecting hijacked frontends that point at a forged Gate contract.

**License SSOT (G8):** First-party contracts (`SliverVineGate`, `GatedExecutor`, `SliverVineAgentPolicyGuard`, `SliverVineRiskOracle`, `IngressSafetySwitch`, Stylus coprocessor) = **BUSL-1.1** · `@slivervine/citadel-sdk` = **Apache-2.0**.

### 6.7 Architectural Benchmark: SliverVine High-Performance Innovations vs. Legacy Web3 Standards

> **Audit scope:** `src/` · `contracts/` · `SliverVineGate/` — proprietary designs that intentionally depart from conventional ERC/EIP patterns to achieve sub-millisecond HFT reflexes and AI-agent swarm protection.
> **SSOT modules:** `agent-citadel-guard.ts` · `session-key-gates.ts` · `src/services/root-protection-lib/circuit-breaker-sever.ts` · `soil_core.wasm` / `SliverVineSoilCoprocessor`.

| Dimension | Legacy Web3 Standard (ERC/EIP) | SliverVine Engineered Standard | Latency / Gas Improvement | Architectural Reason |
|-----------|-------------------------------|--------------------------------|---------------------------|----------------------|
| **AI Agent Rejection Proof** | [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed-data ECDSA (secp256k1 + wallet IPC) | **Sub-ms M2M Rejection Standard** — `agent-citadel-guard` deterministic **HMAC-SHA256 Session Proof** (`evaluateAgentCitadelGuard()` · `guardAgentUserOp()`) | **~200×** — **&lt; 12 µs** vs **1.2 – 3.5 ms** (ECDSA) | High-frequency agent reject storms must not block on signing latency; EIP-712 reserved for human / on-chain settlement (`SliverVineGate.verifyAndConsume`) |
| **Session Authorization Gate** | [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) UserOp → Bundler → EntryPoint validation (network RTT + mempool queue) | **SystemState single-flight** — `assertSessionKeyExecutionGates()` · `assertSigningChannelOpen()` (`session-key-gates.ts` · `hl/auth/signing-gate.ts`) | **~10³–10⁴×** — in-process **&lt; 1 ms** vs **50 – 500 ms+** bundler round-trip | Structural session scope (R06/R07 clip) enforced **before** HL signature leaves Edge; bundler only delivers already-shielded intents |
| **Circuit Breaker / Kill Switch** | OpenZeppelin `Pausable` · on-chain `pause()` (≥ **1 block** · Arbitrum ~250 ms · mainnet ~12 s) | **Edge physical sever** — `severCircuitBreakerPipeline()` R17/R20 (`src/services/root-protection-lib/circuit-breaker-sever.ts`) · `severSigningChannel()` · EIP-712 pipe severed in-process | **~10⁵×** — **&lt; 1 ms** Edge sever vs **≥ 250 ms** on-chain pause | Toxic-fill window closes **before** mempool exposure; `SliverVineGate.halt()` is settlement-plane backup, not hot-path reflex |
| **Risk Oracle Flush** | `Ownable` / `Pausable` admin toggle (mutable · governance delay) | **Irreversible flush** — `SliverVineRiskOracle.applySignedReport(STATUS_SHUTDOWN)` → `isSystemFlushed = true` (one-way poison pill) | Same block on trigger; **zero** post-flush un-pause path | Compliance ingress (`IngressSafetySwitch`) fail-closed without independent admin surface |
| **Soil / Slippage Compute** | EVM Solidity storage reads + oracle `SLOAD` loops (gas-heavy · block-bound) | **Wasm hot path** `pkg/soil_core.wasm` (`#![no_std]`) + **Stylus coprocessor** `evaluate_soil_coprocessor()` (stateless u128 fixed-point) | **~10²×** latency — Edge **p50 ~106 µs** · Wasm warm **&lt; 60 µs** vs multi-ms EVM path; Stylus **stateless** (no storage reads) | Pre-broadcast math must run at HFT reflex speed; on-chain coprocessor = auditable parity, not hot-path substitute |
| **Gate Attestation Model** | Replayable signatures · mutable proxy upgrades | **Consume-once EIP-712** — `consumed[digest]` burned before external call (`SliverVineGate` · `GatedExecutor`) · immutable gate (no proxy) | `verifyAndConsume` **~25.8k – 28k gas** · attestation TTL **≤ 30 s** | One ALLOW cannot be redirected to arbitrary calldata; asymmetric authority (halt immediate · unhalt timelocked) |
| **AA Bundler Compliance** | Blind UserOp retry on bundler rejection | **[EIP-7562](https://eips.ethereum.org/EIPS/eip-7562) Zero-Bundler-Rejection Invariant** — `evaluateStaticBreakerMatrix()` pre-screen (`zerodev-aa-static-breaker.ts`) | Eliminates wasted bundler RTT on toxic UserOps | Soil trip **denies sponsorship + broadcast** serially — no "paid but should-be-blocked" UserOps |
| **RPC / Scraper Defense** | Public RPC endpoint lists · no decoy layer | **Honeypot trap hosts** — `evaluateRpcDefenseGate()` · **99% synthetic slippage** (`rpc-fetch-gate-eval.ts`) | Unauthenticated scrapers fail-closed at **&lt; 1 ms** (no real venue RTT) | Anti-copycat: forked frontends hitting trap hosts receive decoy telemetry, not production state |
| **Frontend Trust Anchor** | Client-trusted `verifyingContract` string | **G11 domain fingerprint** — `verifyGateDomainSeparator()` on-chain `domainSeparator()` vs local EIP-712 recompute | One RPC `eth_call` · HUD badge `GateDomainFingerprintBadge` | Detects hijacked frontends pointing at forged Gate contracts |
| **Pre-Execution vs Post-Execution** | Gauntlet / Chaos Labs parameter dashboards (minutes → days) | **Interceptor Moat** — `checkSoilResistance()` inline before broadcast | **p50 ~106 µs** vs minutes–days governance loop | MEV / LVR damage is prevented, not rebalanced after fill |

**Code anchors (audit trail):**

| Pillar | Legacy pattern avoided | SliverVine SSOT |
|--------|------------------------|-----------------|
| AI Security | EIP-712 on every reject | `src/core/agent-citadel-guard.ts` |
| Session Gate | ERC-4337 bundler as first gate | `src/services/session-key-adapter-lib/session-key-gates.ts` · `src/adapters/hl/auth/signing-gate.ts` |
| Circuit Breaker | On-chain `Pausable` | `src/services/root-protection-lib/circuit-breaker-sever.ts` · `src/services/risk-control-lib/root-protection.ts` |
| Compute Parity | EVM storage-heavy soil math | `pkg/soil_core.wasm` · `contracts/stylus-probe/src/lib.rs` · `src/services/risk-control-lib/soil-resistance.ts` |

### 6.8 Competitive Positioning — Four-Dimensional ASCII Matrices (SliverVine Protocol)

**Entity:** SilverVine Labs · **Protocol:** SliverVine Protocol / SliverVine Citadel (BeΔ)  
**[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196):** Finalized ERC-8196 Standard (Ethereum Standard · Virtuals Protocol co-author).

Evaluator-facing comparison of SliverVine Protocol versus legacy execution, agent-wallet, and cross-venue stacks. Complements the §6.7 tabular benchmark.

**Matrix 1 — Execution & Pre-Broadcast Severance Profile**

```text
┌───────────────────────────┬─────────────────────────────┬────────────────────────────┬────────────────────────────┐
│ Dimension                 │ SliverVine Citadel (BeΔ)   │ Legacy ERC-4337 / OZ       │ Gauntlet / Chaos Labs      │
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
│ Dimension                 │ SliverVine Citadel (BeΔ)   │ Multisig / Timelock        │ Web2 LLM Guardrails        │
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
│ Dimension                 │ SliverVine Citadel (BeΔ)   │ Native DEX Limit Orders    │ Raw Cross-Chain Bridges    │
├───────────────────────────┼─────────────────────────────┼────────────────────────────┼────────────────────────────┤
│ 1. Cross-Spread Sensing   │ Live GMX/HL Soil Resistance │ Static Slippage Tolerance  │ Blind Asset Relaying       │
│ 2. Liquidation Defense    │ -40 Haircut (Observatory)   │ Cascading Liquidation Risk │ No Execution Awareness     │
│ 3. Ingress Accounting     │ `lostUsd ≡ 0` Escort Label  │ Immediate Capital Loss     │ Phantom In-flight Balances│
│ 4. AML Shielding          │ Blocked Reverse Path (46630)│ Open Protocol Ingress      │ Unfiltered Contamination   │
└───────────────────────────┴─────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

### 6.9 Strategic Blue-Chip Ecosystem & Settlement Integrations (V1.0 Core + V1.5 / V2.0)

> **Commercial boundary:** v1.0 fee capture and liquidity routing are bound to **GMX v2 GM + HL delta-neutral** execution. **Pendle Institutional Shield** and **Stabilizer Sepolia Cross-Pass Sandbox** are **v1.0 Live** pre-execution firewalls. Uniswap V3 and Variational extend the settlement plane — see [§2.5](#25-strategic-blue-chip-ecosystem--settlement-roadmap-v10-core--v15--v20) and [§5.1.1](#511-strategic-settlement-extensions-v10-core--v15--v20).

| Venue | Integration surface | Reflex hook | Horizon |
|-------|-------------------|-------------|---------|
| **Pendle Finance** | PT/YT registry + sync oracle + cross-guard · soil-wired | `checkSoilResistance()` · `pendleOracle` / `pendleCrossGuard` · `PENDLE_ORACLE_STALE` · `evaluatePendleGmxCrossGuard()` · maturity &lt;7d + jitter &gt;200 bps fail-closed | **V1.0** |
| **Uniswap V3 DEX** | Arbitrum-native `GRAIL` liquidity depth for rebalance routing | Soil fuse on Uniswap V3 pool depth · RPC allowlist `api.uniswap.org` | **V1.5** |
| **Stabilizer** | Sepolia universal sandbox · zero-slippage stablecoin cross-pass routing | `evaluateStabilizerSwapGuard()` · identical `checkSoilResistance()` gate as Mainnet | **V1.0** ✅ Live · Sepolia `421614` |
| **Variational** | Next-gen decentralized perps · cross-venue margin routing (HL complement) | `checkSoilResistance()` on Variational orderbook depth · session-key clip (R06/R07) | **V2.0** |

---
