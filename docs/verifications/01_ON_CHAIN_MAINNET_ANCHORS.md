# On-Chain Mainnet Anchors (Arbitrum One · 42161)

> **SSOT index:** [`README.md`](./README.md) · **Hub:** [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)

### Absolute SSOT Lock (Evaluator Copy-Paste)

| Field | Locked value | Verify |
|-------|--------------|--------|
| **Official H1** | SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ): Sub-ms 0-Gas Pre-Broadcast Safety Citadel & Risk Navigator for AI Agents on Arbitrum | [`README.md`](../../README.md) · [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) |
| **Vitest baseline** | **217 test files | 967 PASS clean** | `pnpm test -- --run` · `pnpm exec tsc --noEmit` **0 errors** |
| **Verified commit** | `main` @ **`3f26efa`** (Citadel-Armor SSOT) · baseline **`572e5cd`** (Phase A+B+C mainnet) · Worker bundle **143.77 KiB raw | 50.94 KiB gzip** (`limitKiB: 150` · `pass: true`) | `git rev-parse HEAD` · `pnpm bundle:measure` |
| **Phase A — GmxRiskInvariantLib** | Pure Solidity GMX wire invariants — mirrors [`gmx-risk-core.ts`](../../src/core/gmx-risk-core.ts) · **83 LOC** | [`GmxRiskInvariantLib.sol`](../../contracts/src/libs/GmxRiskInvariantLib.sol) · Forge PolicyGuard **9/9** |
| **Phase B — GmxSoilMatrixSwitch** | Single **SLOAD** defense bitmap · **47 LOC** + `DefenseMatrixBitmap` **66 LOC** | [`GmxSoilMatrixSwitch.sol`](../../contracts/GmxSoilMatrixSwitch.sol) · Forge **8/8** |
| **Phase C — citadel_invariants** | Stylus/Wasm coprocessor `evaluate_packed` · TS/Rust parity · **PolicyGuardV2** Stylus staticcall + `GmxRiskInvariantLib` fallback | [`contracts/citadel_invariants/`](../../contracts/citadel_invariants/) · `pnpm build:citadel-invariants` · [`stylus-gmx-parity.test.ts`](../../tests/wasm/stylus-gmx-parity.test.ts) **6/6** · Cargo **2/2** |
| **Auto R20 severance** | `applyAutoSeveranceOnFlags()` — bitmask trips auto-call `severSigningChannel()` | [`risk-severance.ts`](../../src/core/risk-severance.ts) · [`tests/core/risk-severance.test.ts`](../../tests/core/risk-severance.test.ts) |
| **Variational RFQ core bitmask** | `evaluateVariationalFlags()` — **Bit 12** `FLAG_VARIATIONAL_STALE_QUOTE` · **Bit 13** `FLAG_VARIATIONAL_OLP_DEPTH_EXCEEDED` · both bound to `FLAGS_AUTO_SEVER_MASK` | [`risk-engine-core.ts`](../../src/core/risk-engine-core.ts) · [`risk-flags.ts`](../../src/core/risk-flags.ts) · [`variational-rfq-adapter.ts`](../../src/adapters/variational-rfq-adapter.ts) |
| **Sliding-window pending OI** | 30s GMX skew/notional accumulator — split-payload defense | [`pending-exposure-window.ts`](../../src/core/pending-exposure-window.ts) |
| **Dual-Engine Wasm (FROZEN)** | **Engine A** Stylus `0xc23587…` · **Engine B** Edge SHA-256 `67f8fcc7…` — see [§ Dual-Engine Map](#dual-engine-infrastructure-map-frozen--2026-09-10) | [`01_ON_CHAIN_MAINNET_ANCHORS.md`](./01_ON_CHAIN_MAINNET_ANCHORS.md#dual-engine-infrastructure-map-frozen--2026-09-10) |
| **Wayfinder native adapter** | `wayfinderCitadelShieldHook` — soil fuse + 8-dimension intent gate | [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) · `pnpm demo:wayfinder` |
| **AI Agent frameworks** | Independent pre-execution guards — Wayfinder · ElizaOS · Virtuals · LangChain · **p50 ~106µs** each | [`wayfinder-agent-demo.ts`](../../examples/wayfinder-agent-demo.ts) · `pnpm demo:{wayfinder,elizaos,virtuals,langchain}` |
| **ElizaOS plugin** | `evaluateElizaCitadelAction()` — Action handler soil fuse | [`elizaos-citadel-plugin.ts`](../../src/adapters/elizaos/elizaos-citadel-plugin.ts) · `pnpm demo:elizaos` |
| **Virtuals GAME adapter** | `evaluateVirtualsGameTask()` — GAME Worker pre-broadcast guard | [`virtuals-game-adapter.ts`](../../src/adapters/virtuals/virtuals-game-adapter.ts) · `pnpm demo:virtuals` |
| **LangChain Citadel tool** | `CitadelRiskGuardTool` — StructuredTool + LangGraph state-node guard | [`langchain-citadel-tool.ts`](../../src/adapters/langchain/langchain-citadel-tool.ts) · `pnpm demo:langchain` |
| **Stabilizer Sepolia adapter** | Universal Cross-DEX Testnet Sandbox on **421614** — 1:1 capacity · de-peg severance · cross-pass routing | `evaluateStabilizerSwapGuard()` · 15% reserve ratio · USDZ >50bps peg guard · 60s LLM cooldown | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) · `pnpm demo:stabilizer` |
| **Sepolia Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | [Arbiscan Sepolia](https://sepolia.arbiscan.io/address/0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1) |
| **Arbitrum One Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | [Arbiscan One](https://arbiscan.io/address/0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1) |
| **PolicyGuardV2 (Arbitrum One · current)** | `0xfd98cadb7018f692ec58cd4359e0c0399f4f8781` · `stylusCoprocessor=0` | [Arbiscan](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) · Deploy [`0xcd520602…`](https://arbiscan.io/tx/0xcd520602a277c0781038552d5692f5ad43076a8928f5e7384e695642f980306a) |
| **Gate PolicyLink (42161 · bootstrap Gate)** | `0xe4ef5350963241c49a29e72a4cf093208cd19af0` → Gate `0xb174…` · PolicyGuardV2 `0xfd98…` | [PolicyLink](https://arbiscan.io/address/0xe4ef5350963241c49a29e72a4cf093208cd19af0) · Link [`0x1b158a4a…`](https://arbiscan.io/tx/0x1b158a4a40409e39215b76b5b12693c2802b49b190ecc0be97c986f167b9a182) |
| **GmxSoilMatrixSwitch (42161)** | `0x4129aee97e68aa3712c56fe9ec48bf369782f99b` → oracle `0xfadb1475…` | [Arbiscan](https://arbiscan.io/address/0x4129aee97e68aa3712c56fe9ec48bf369782f99b) · Deploy [`0x6790c2b8…`](https://arbiscan.io/tx/0x6790c2b8ea23ba02640c87f06e774f093061d3d98b462caa9bd84f48a24d63ab) |
| **SliverVineRiskOracleV2 (42161)** | `0xfadb14759a3d3c7e976697de61bf62627f14ec93` | [Arbiscan](https://arbiscan.io/address/0xfadb14759a3d3c7e976697de61bf62627f14ec93) · Deploy [`0x8f5d79e5…`](https://arbiscan.io/tx/0x8f5d79e538ed65f863b1fdfc10d2dacf387b07c5cb7b3eb127afa835a27686ab) |
| **PolicyGuard v1 (superseded)** | `0xc66f96611a737c4e58706d0955594456eab88959` | [Arbiscan](https://arbiscan.io/address/0xc66f96611a737c4e58706d0955594456eab88959) · Deploy [`0xeabd5fd1…`](https://arbiscan.io/tx/0xeabd5fd17f1e8684c3408887a233a8ac26220199781b401336233a3072fb4b0c) |
| **PolicyGuard (legacy v0)** | `0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b` | [Arbiscan](https://arbiscan.io/address/0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b) · Deploy [`0x77fd8e1c…`](https://arbiscan.io/tx/0x77fd8e1c702ca19e9fa0621a1f6b0e8de6701f389d062cc3427e3d8d3d1e74fa) |
| **ZeroDev Smart Route UserOp (4663→42161)** | UserOp `0x7b72ee9f4dc3f32f08a5de914ecf076c243d895522ecd72d17a2f7b025bc956d` · Tx `0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a` | [Arbiscan Tx](https://arbiscan.io/tx/0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a) |
| **Mainnet Ignition Tx** | `0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6` | [Arbiscan Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Agent SDK decorator** | `withCitadelShield` — zero-touch pre-broadcast wrapper | [`src/sdk/decorator.ts`](../../src/sdk/decorator.ts) · [`examples/agent-interceptor-demo.ts`](../../examples/agent-interceptor-demo.ts) |
| **Core DEX demos (Tier 1)** | GMX v2 · Hyperliquid · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · USD.ai standalone CLIs | [`gmx-demo.ts`](../../examples/gmx-demo.ts) · [`hyperliquid-demo.ts`](../../examples/hyperliquid-demo.ts) · [`pendle-demo.ts`](../../examples/pendle-demo.ts) · [`uniswap-demo.ts`](../../examples/uniswap-demo.ts) · [`aave-demo.ts`](../../examples/aave-demo.ts) · [`morpho-demo.ts`](../../examples/morpho-demo.ts) · [`usdai-demo.ts`](../../examples/usdai-demo.ts) · `pnpm demo:{gmx,hl,pendle,uniswap,aave,morpho,usdai}` |
| **Uniswap V3 adapter** | `evaluateUniswapV3SwapGuard()` — CL tick depth · directional dynamic fee · soil fuse | [`uniswap-v3-adapter.ts`](../../src/adapters/uniswap/uniswap-v3-adapter.ts) · `pnpm demo:uniswap` |
| **Aave V3 adapter** | `evaluateAaveV3Guard()` — HF &lt; 1.15 fail-closed · cross-chain liquidation boundary | [`aave-v3-adapter.ts`](../../src/adapters/aave/aave-v3-adapter.ts) · `pnpm demo:aave` |
| **Hyperliquid L1 session guard** | `evaluateHyperliquidSessionGuard()` — Independent L1 HF Orderbook AppChain · MaxSizePerOrder · rate limit (120/min) · spread > **20 bps** | [`hyperliquid-session-guard.ts`](../../src/adapters/hl/hyperliquid-session-guard.ts) · `pnpm demo:hl` |
| **Variational Omni RFQ adapter** | `validateVariationalRFQIntent()` → `evaluateVariationalFlags()` — quote stale **>500ms** or oracle drift **>30 bps** · OLP depth utilization **>15%** (long-tail) · **Bits 12–13** in core bitmask · `FLAGS_AUTO_SEVER_MASK` | [`variational-rfq-adapter.ts`](../../src/adapters/variational-rfq-adapter.ts) · [`risk-engine-core.ts`](../../src/core/risk-engine-core.ts) · `pnpm demo:variational -- --trip` |
| **GMX v2 pool invariants** | `verifyGmxPoolImbalance()` · `verifyGmxCollateralReserve()` — imbalance > **0.35** · reserve < **105%** | [`gmx-v2-invariants.ts`](../../src/adapters/gmx/gmx-v2-invariants.ts) · `pnpm demo:gmx` |
| **Dune dashboard** | [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) | Public URL |
| **Dune — Sepolia (`421614`)** | ✅ **Active Live Event Stream** — decoded `IntentAttested` · `RiskTripBlocked` from Sepolia Gate `0xb174…` · **PEV** `SUM(blocked_intent_notional_usd)` operational | [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) |
| **Dune — Arbitrum One (`42161`)** | ✅ **Contracts Anchored** + **SQL Query Specs Ready for Ingest** — Queries 0–0b feed/chart + Queries 1–3 reconciliation panels pre-compiled for **ChainID `42161`** · **not** claimed as live mainnet event stream | Same spec |
| **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196)** | Final (Ethereum Standard · Virtuals Protocol co-author) | [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) |

> **Governance footnote (Bootstrap Ignition Keys):** Mainnet Gate `0xb174…` deploys with **Bootstrap Ignition Keys** (`0x1111…` / `0x2222…`) — **strictly for public verification and sandbox reproducibility**, not production HSM custody. Governance authority is designed for **post-launch rotation** to production multisig via native `proposeAdmin` / `acceptAdmin` functions.

### Phase A+B+C Mainnet Deployment (Arbitrum One · 42161) — Verified Live

| Contract | Address | Deploy Tx |
|----------|---------|-----------|
| **SliverVineRiskOracleV2** | [`0xfadb14759a3d3c7e976697de61bf62627f14ec93`](https://arbiscan.io/address/0xfadb14759a3d3c7e976697de61bf62627f14ec93) | [`0x8f5d79e538ed65f863b1fdfc10d2dacf387b07c5cb7b3eb127afa835a27686ab`](https://arbiscan.io/tx/0x8f5d79e538ed65f863b1fdfc10d2dacf387b07c5cb7b3eb127afa835a27686ab) · Block **503074231** |
| **GmxSoilMatrixSwitch** | [`0x4129aee97e68aa3712c56fe9ec48bf369782f99b`](https://arbiscan.io/address/0x4129aee97e68aa3712c56fe9ec48bf369782f99b) | [`0x6790c2b8ea23ba02640c87f06e774f093061d3d98b462caa9bd84f48a24d63ab`](https://arbiscan.io/tx/0x6790c2b8ea23ba02640c87f06e774f093061d3d98b462caa9bd84f48a24d63ab) · Block **503074242** |
| **SliverVineAgentPolicyGuardV2** | [`0xfd98cadb7018f692ec58cd4359e0c0399f4f8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) | [`0xcd520602a277c0781038552d5692f5ad43076a8928f5e7384e695642f980306a`](https://arbiscan.io/tx/0xcd520602a277c0781038552d5692f5ad43076a8928f5e7384e695642f980306a) · Block **503074255** |

> **Note:** `GmxRiskInvariantLib` · `GmxMulticallDecodeLib` are **internal libraries** embedded in PolicyGuardV2 bytecode — no separate mainnet deploy. `stylusCoprocessor = address(0)` → pure Solidity fallback path active.

### Phase A+B+C — GMX On-Chain Invariant Stack (Solidity · Stylus · Wasm)

> **Status:** **100% delivered @ `572e5cd`** — three-layer GMX wire audit path from pure Solidity fallback through single-SLOAD soil matrix to optional Stylus coprocessor.

| Layer | SSOT module | Role | LOC | Verification |
|-------|-------------|------|-----|--------------|
| **Phase A** | [`GmxRiskInvariantLib.sol`](../../contracts/src/libs/GmxRiskInvariantLib.sol) | executionFee floor · slippage floor · pool imbalance · zero SLOAD/RPC | **83** | [`PolicyGuardGmxWire.t.sol`](../../contracts/test/PolicyGuardGmxWire.t.sol) **9/9** · TS mirror [`gmx-risk-core.ts`](../../src/core/gmx-risk-core.ts) **131** |
| **Phase B** | [`GmxSoilMatrixSwitch.sol`](../../contracts/GmxSoilMatrixSwitch.sol) + [`DefenseMatrixBitmap.sol`](../../contracts/libs/DefenseMatrixBitmap.sol) | defense matrix **single SLOAD** bitmap switch | **47 + 66** | [`GmxSoilMatrixSwitch.t.sol`](../../contracts/test/GmxSoilMatrixSwitch.t.sol) **8/8** |
| **Phase C** | [`citadel_invariants`](../../contracts/citadel_invariants/) Rust crate | 96-byte packed eval · GMX errMask + soil flags · Stylus `evaluate_packed` entrypoint | **lib 58 · abi 39 · gmx 60 · soil 31** | Cargo **2/2** · Vitest [`stylus-gmx-parity.test.ts`](../../tests/wasm/stylus-gmx-parity.test.ts) **6/6** |
| **Phase C** | [`SliverVineAgentPolicyGuardV2.sol`](../../contracts/src/SliverVineAgentPolicyGuardV2.sol) | optional `stylusCoprocessor` staticcall · revert/`address(0)` → **Solidity fallback** | **71** | Forge PolicyGuard **9/9** |
| **Pack / call** | `CitadelInvariantsPackLib` · `CitadelInvariantsStylusLib` · `ICitadelInvariantsCoprocessor` | wire+ctx → 96 bytes · parse 32-byte LE result word | **41 + 28 + 6** | integrated in `_enforceGmxWire` |

**Build commands:** `pnpm build:citadel-invariants` (host wasm parity) · `cargo build --features stylus` (Stylus deploy) · `pnpm exec tsc --noEmit` **0 errors**.

### Stylus Module Build Proof (Local Verification)

| Check | Result | SSOT |
|-------|--------|------|
| `cargo test stylus_core --release` | **5/5 PASS** (100% local) | [`contracts/stylus-probe/src/stylus_core.rs`](../../contracts/stylus-probe/src/stylus_core.rs) |
| `cargo build --target wasm32-unknown-unknown --release` | **Verified locally** (100%) | [`contracts/stylus-probe/Stylus.toml`](../../contracts/stylus-probe/Stylus.toml) · ChainID **42161** |
| Wasm ABI v2 **28-slot** alignment | `WASM_ABI_VERSION = 2` · `WASM_PROTOCOL_LEN = PROTO_VECT_LEN = 28` | [`src/core/wasm-soil-ffi.ts`](../../src/core/wasm-soil-ffi.ts) · [`src/wasm/soil_core.rs`](../../src/wasm/soil_core.rs) · [`tests/core/wasm-ffi-alignment.test.ts`](../../tests/core/wasm-ffi-alignment.test.ts) |
| Mainnet readiness harness | `pnpm deploy:stylus:mainnet` | [`scripts/deploy-stylus-mainnet.ts`](../../scripts/deploy-stylus-mainnet.ts) |

### Dual-Engine Infrastructure Map (FROZEN · 2026-09-10)

Citadel Shield runs **two independent Wasm engines**. They share risk semantics but **not** the same binary, deploy path, or runtime.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Engine B — Off-Chain Cloudflare Edge Wasm Monotonic Core                │
│ pkg/soil_core.wasm · SHA-256 67f8fcc7… · V8 Isolates · 0 gas          │
│ Role: sub-ms leap / NTP / RPC regression firewall (clock_core C-ABI)    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ pre-broadcast intent (fail-closed)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Engine A — On-Chain Arbitrum Stylus Coprocessor (Nitro)                 │
│ SliverVineSoilCoprocessor 0xc23587… · ArbWasm 0x71 · on-chain verify    │
│ Role: pre-consensus state validation · Stylus soil bitmask coprocessor  │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Engine A — On-Chain Arbitrum Stylus Coprocessor

| Field | Locked value |
|-------|--------------|
| **Status** | `DEPLOYED_MAINNET` · `FROZEN` |
| **Contract** | `SliverVineSoilCoprocessor` · **`0xc23587d6573dd134f95b02b0202ffbf84686625e`** |
| **Explorer** | [https://arbiscan.io/address/0xc23587d6573dd134f95b02b0202ffbf84686625e](https://arbiscan.io/address/0xc23587d6573dd134f95b02b0202ffbf84686625e) |
| **Activation Tx** | [`0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397`](https://arbiscan.io/tx/0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397) |
| **Role** | On-chain pre-consensus state validation · Stylus `check_soil_resistance_stylus` verification inside Nitro blocks |
| **Source** | [`contracts/stylus-probe`](../../contracts/stylus-probe/) · [`stylus_core.rs`](../../contracts/stylus-probe/src/stylus_core.rs) |
| **Deploy harness** | [`scripts/deploy-stylus-mainnet.ts`](../../scripts/deploy-stylus-mainnet.ts) |
| **Activation path** | Nitro Prover JIT + `activateProgram` via ArbWasm precompile **`0x0000000000000000000000000000000000000071`** |
| **Toolchain** | `cargo-stylus v0.10.9` · ChainID **42161** · metadata hash `955b67a82cd3bd16066ee85b5b44ffe96d7be9e25e0842586481a294ec720ee7` |
| **Preflight (2026-09-10)** | `cargo stylus check --endpoint https://arb1.arbitrum.io/rpc` — **PASS** · **7.1 KB** (7122 bytes) |

#### Engine B — Off-Chain Cloudflare Edge Wasm Monotonic Core

| Field | Locked value |
|-------|--------------|
| **Status** | `EDGE_ARTIFACT_VERIFIED` · `FROZEN` |
| **Binary** | `pkg/soil_core.wasm` · build: `pnpm run build:wasm` |
| **Wasm SHA-256** | `67f8fcc70563fec84727036b6c36607733114fb30577a58490584247f8010b14` |
| **Size** | **1,557 bytes** (&lt;28 KiB Cloudflare Worker budget) |
| **Role** | Sub-millisecond physical clock leap / NTP step / RPC `block.timestamp` regression firewall on Edge Isolates |
| **Source** | [`src/wasm/clock_core.rs`](../../src/wasm/clock_core.rs) · [`src/wasm/soil_core.rs`](../../src/wasm/soil_core.rs) · host [`monotonic-time.ts`](../../src/core/monotonic-time.ts) · loader [`clock-wasm.ts`](../../src/sdk/clock-wasm.ts) |
| **C-ABI exports** | `clock_core_read` · `clock_core_rpc_ingest` · `clock_core_resolve_wall_age` · `clock_core_abi_version` = **1** |
| **Not Stylus-deployable** | `cargo stylus check --wasm-file pkg/soil_core.wasm` → **FAIL** (missing `#[entrypoint]` — Edge cdylib only) |

#### Verification Freeze Record (2026-09-10)

| Check | Result | SSOT |
|-------|--------|------|
| `npx vitest run tests/clock-monotonicity.test.ts` | **14/14 PASS** | Engine B TS + Wasm FFI parity |
| `cargo test stylus_core --release` | **5/5 PASS** | Engine A unit tests |
| `cargo stylus check` (stylus-probe · mainnet RPC) | **PASS** | Engine A Nitro compatibility |
| `pnpm run build:wasm` | **PASS** | Regenerates Engine B `pkg/soil_core.wasm` |

> **Redeploy note:** Engine B is **never** broadcast to Arbitrum. Future Engine A redeploys use `scripts/deploy-stylus-mainnet.ts` (not `cargo stylus deploy --wasm-file pkg/soil_core.wasm`).
