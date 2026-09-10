# Live-Fire Execution Evidence (Mainnet · 42161)

> **SSOT index:** [`README.md`](./README.md) · **Hub:** [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)

### Mainnet Live-Fire Script Specifications

| Script | Command | Role | Live arm |
|--------|---------|------|----------|
| **Stylus mainnet readiness** | `pnpm deploy:stylus:mainnet` | **Deployed & activated** `0xc23587d6573dd134f95b02b0202ffbf84686625e` · Tx [`0x92079e15…`](https://arbiscan.io/tx/0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397) · Nitro JIT + ArbWasm `0x71` | [`scripts/deploy-stylus-mainnet.ts`](../../scripts/deploy-stylus-mainnet.ts) |
| **GMX v2 micro-fill harness** | `pnpm execute:gmx:micro-fill --size=1` | Calibrated **$1–$20** GMX v2 increase via PolicyGuardV2 `0xfd98cadb…` + Gate `0xb174…` · **automatic low-OI side calibration** (balanced market leg) · Fail-Closed on `ORACLE_LAG_DEADLOCK` · `GMX_POOL_IMBALANCE_BREACH` | [`scripts/execute-gmx-mainnet-micro-fill.ts`](../../scripts/execute-gmx-mainnet-micro-fill.ts) · Live: `CONFIRM_GMX_MICRO_FILL=YES BROADCAST=1 MAINNET_PK=0x… ZERODEV_PROJECT_ID=…` |
| **GMX GM Pool deposit** | `pnpm execute:gmx:gm-deposit` | **Verified Live** — `sendWnt → sendTokens → createDeposit` · ExchangeRouter `0x7dE39…83f1` · ETH/USDC GM `0x70d955…6336` | [`scripts/execute-gmx-mainnet-gm-deposit.ts`](../../scripts/execute-gmx-mainnet-gm-deposit.ts) · Live: `CONFIRM_GMX_GM_DEPOSIT=YES BROADCAST=1 MAINNET_PK=0x…` |
| **GMX GM Pool withdraw** | `pnpm execute:gmx:gm-withdraw` | **Verified Live** — GM LP approve → GMX v2 Router `0x7452c558…` · `sendWnt → sendTokens(GM) → createWithdrawal` | [`scripts/execute-gmx-mainnet-gm-withdraw.ts`](../../scripts/execute-gmx-mainnet-gm-withdraw.ts) · Live: `CONFIRM_GMX_GM_WITHDRAW=YES BROADCAST=1 MAINNET_PK=0x…` |
| **GMX Phase A+B+C deploy** | `pnpm tsx scripts/deploy-policy-guard-v2-mainnet.ts` | **Verified Live @ block 503074231–503074255** — PolicyGuardV2 `0xfd98cadb…` · MatrixSwitch `0x4129aee9…` · RiskOracleV2 `0xfadb1475…` | Live: `CONFIRM_POLICY_GUARD_V2_DEPLOY=YES BROADCAST=1 MAINNET_PK=0x…` |

### GMX GM Pool I/O Channel (Arbitrum One · 42161) — Verified Live

> **Status:** **CLOSED (execution layer)** — Wallet B GM Pool deposit + withdraw ExchangeRouter multicall paths **broadcast and confirmed** on Arbitrum One. Async GMX keeper settlement remains protocol-native two-stage semantics; **user-side I/O channel SSOT is closed**.

| Field | Value |
|-------|-------|
| **Channel Status** | **CLOSED** — GM Pool I/O (`execute:gmx:gm-deposit` · `execute:gmx:gm-withdraw`) |
| **ExchangeRouter** | [`0x7dE39FF2e232A2203196788d37e234cF8F1b83f1`](https://arbiscan.io/address/0x7dE39FF2e232A2203196788d37e234cF8F1b83f1) |
| **GMX v2 Router (GM LP spender)** | [`0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6`](https://arbiscan.io/address/0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6) |
| **GM Deposit Multicall Tx** | [`0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) · Block **503036082** · **Success** |
| **GM Router Approve Tx** | [`0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e`](https://arbiscan.io/tx/0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e) · Block **503051738** · **Success** |
| **GM Withdraw Multicall Tx** | [`0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410`](https://arbiscan.io/tx/0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410) · Block **503051752** · **Success** |
| **DepositVault** | `0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55` |
| **WithdrawalVault** | `0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701c55` |
| **GM Market (ETH/USDC)** | `0x70d95587d40a2caf56bd97485ab3eec10bee6336` |

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

### Stylus Mainnet Deployment (Arbitrum One · 42161) — Verified

| Field | Value |
|-------|-------|
| **Contract** | `SliverVineSoilCoprocessor` · `0xc23587d6573dd134f95b02b0202ffbf84686625e` · [Arbiscan](https://arbiscan.io/address/0xc23587d6573dd134f95b02b0202ffbf84686625e) |
| **Activation Tx** | [`0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397`](https://arbiscan.io/tx/0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397) |
| **Activation path** | Nitro Prover **JIT compilation** + `activateProgram` via **ArbWasm precompile `0x0000000000000000000000000000000000000071`** (`cargo stylus activate` SSOT) |
| **Toolchain** | `cargo-stylus v0.10.9` · `cargo stylus get-initcode` + viem deploy · ChainID **42161** |

### GMX Micro-Fill Fail-Closed Evidence (Live Interception Payload)

> **Harness:** `pnpm execute:gmx:micro-fill --size=1` on Arbitrum One (`42161`) · **no broadcast** — Soil Resistance + Root Protection tripped pre-mempool.

| Field | Value |
|-------|-------|
| **Command** | `pnpm execute:gmx:micro-fill --size=1` |
| **Network** | Arbitrum One (`42161`) |
| **Balanced Side Calibration** | Harness intelligently selected **`"short"`** leg — GM pool snapshot **$71 Long** vs **$58 Short** (low-OI side) to reduce skew before preflight |
| **Soil Resistance Trip** | `DEPTH_USD = $129 < $100,000` min requirement (`minDepthUsd` SSOT) · `SOIL_RESISTANCE_TRIP` |
| **Root Protection Trip** | `GUARD_BLOCKED:ORACLE_LAG_DEADLOCK:154000ms>30000ms` · **154 seconds** stale Chainlink oracle lag (> **30s** `ORACLE_LAG_DEADLOCK_MS`) |
| **Execution Outcome** | **Fail-Closed** — Citadel Shield **successfully intercepted** GMX v2 increase order before mempool · dual-axis block (depth + oracle lag) |
| **Capital Invariant** | **`lostUsd ≡ 0`** — **0 slippage loss** · zero stale-price impact · zero mempool exposure · no toxic fill submitted |
| **Prior Trip (pool state)** | `GMX_POOL_IMBALANCE_BREACH` also documented — shield remains active on oracle-lag · depth · pool-imbalance axes |

### Dune Telemetry Boundary (Re-confirmed)

| Partition | ChainID | Claim |
|-----------|---------|-------|
| **Sepolia — Live Event Pipeline** | `421614` | ✅ Active decoded event ingest (`IntentAttested` · `RiskTripBlocked`) from Sepolia Gate `0xb174…` |
| **Arbitrum One — Contract Anchored + SQL Specs** | `42161` | ✅ Contracts anchored · DuneSQL Queries 0–0b + 1–3 **ready for ingest** · **not** claimed as live mainnet event stream |

> **Governance footnote (re-confirmed):** Bootstrap Ignition Keys (`0x1111…` / `0x2222…`) on Mainnet Gate `0xb174…` are **strictly for public verification and sandbox reproducibility**. Post-launch governance rotation to production multisig via `proposeAdmin` / `acceptAdmin` is the designed authority path.

### [MAINNET_LIVE_EXECUTION_EVIDENCE]

> **Harness:** `pnpm deploy:stylus:mainnet` · `pnpm execute:gmx:micro-fill --size=1` · `pnpm execute:gmx:gm-deposit` · `pnpm execute:gmx:gm-withdraw` · `pnpm tsx scripts/deploy-policy-guard-and-live-fill.ts` · ZeroDev AA: `pnpm tsx scripts/execute-zerodev-mainnet-test.ts` · Smart Route: `pnpm tsx scripts/execute-smart-route-live-demo.ts` · Live: `CONFIRM_SMART_ROUTE_DEMO=YES BROADCAST=1` · Default ingress: Robinhood Mainnet `4663` (`SMART_ROUTE_SOURCE_CHAIN_ID` override supported)

| Field | Value |
|-------|-------|
| **PolicyGuardV2 (current)** | `SliverVineAgentPolicyGuardV2` · [`0xfd98cadb7018f692ec58cd4359e0c0399f4f8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) · `stylusCoprocessor=0` |
| **PolicyGuardV2 Deployment Tx** | [`0xcd520602a277c0781038552d5692f5ad43076a8928f5e7384e695642f980306a`](https://arbiscan.io/tx/0xcd520602a277c0781038552d5692f5ad43076a8928f5e7384e695642f980306a) |
| **PolicyGuard v1 (superseded)** | [`0xc66f96611a737c4e58706d0955594456eab88959`](https://arbiscan.io/address/0xc66f96611a737c4e58706d0955594456eab88959) · Deploy [`0xeabd5fd1…`](https://arbiscan.io/tx/0xeabd5fd17f1e8684c3408887a233a8ac26220199781b401336233a3072fb4b0c) |
| **PolicyGuard (legacy v0)** | [`0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b`](https://arbiscan.io/address/0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b) · Deploy [`0x77fd8e1c…`](https://arbiscan.io/tx/0x77fd8e1c702ca19e9fa0621a1f6b0e8de6701f389d062cc3427e3d8d3d1e74fa) |
| **ZeroDev Kernel v3 AA Proof Tx** | `0xc7659e299e4961279f03b9cafa988dc082d7f9baf107bcd7b62812e8dfb54aad` · [Arbiscan](https://arbiscan.io/tx/0xc7659e299e4961279f03b9cafa988dc082d7f9baf107bcd7b62812e8dfb54aad) |
| **Smart Route Source Chain** | Robinhood Mainnet (`4663`) |
| **Smart Route Target Chain** | Arbitrum One (`42161`) |
| **ZeroDev Kernel v3 Smart Route UserOp Hash** | `0x7b72ee9f4dc3f32f08a5de914ecf076c243d895522ecd72d17a2f7b025bc956d` |
| **ZeroDev Kernel v3 Smart Route UserOp Tx** | `0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a` · [Arbiscan](https://arbiscan.io/tx/0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a) |
| **Chain** | Arbitrum One (`42161`) |
| **Status** | **Verified Live** on Arbitrum One (42161) with **Fail-Closed Risk Protection** active |
| **GMX Micro-Fill Live Attempt (`--size=1`)** | **Fail-Closed** — balanced side **`"short"`** ($71 Long vs $58 Short) · `DEPTH_USD=$129<$100k` · `ORACLE_LAG_DEADLOCK:154000ms>30000ms` · **`lostUsd ≡ 0`** · 0 slippage loss |
| **GMX Fill Live Attempt (prior)** | **Fail-Closed** — pre-broadcast trip `GMX_POOL_IMBALANCE_BREACH` · no toxic fill submitted · live invariant shield **confirmed active** |
| **GM Pool I/O Channel Status** | **CLOSED** — deposit + withdraw ExchangeRouter multicall **Verified Live** on `42161` |
| **GM Deposit Multicall Tx** | [`0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) · Block **503036082** |
| **GM Router Approve Tx** | [`0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e`](https://arbiscan.io/tx/0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e) · Block **503051738** |
| **GM Withdraw Multicall Tx** | [`0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410`](https://arbiscan.io/tx/0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410) · Block **503051752** |
| **Notional (USD)** | `$1–$20` (CLI `--size`; default **$1** micro-fill) |

### [POLICYGUARD_MAINNET_ANCHOR]

> **Harness:** `pnpm tsx scripts/execute-smart-route-live-demo.ts` · Live: `CONFIRM_SMART_ROUTE_DEMO=YES BROADCAST=1 MAINNET_PK=0x… ZERODEV_PROJECT_ID=…` · Default ingress: Robinhood Mainnet `4663`

| Field | Value |
|-------|-------|
| **PolicyGuardV2 Address (current)** | [`0xfd98cadb7018f692ec58cd4359e0c0399f4f8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) |
| **PolicyGuardV2 Deploy Tx** | [`0xcd520602a277c0781038552d5692f5ad43076a8928f5e7384e695642f980306a`](https://arbiscan.io/tx/0xcd520602a277c0781038552d5692f5ad43076a8928f5e7384e695642f980306a) |
| **PolicyGuard v1 (superseded)** | [`0xc66f96611a737c4e58706d0955594456eab88959`](https://arbiscan.io/address/0xc66f96611a737c4e58706d0955594456eab88959) |
| **PolicyGuard (legacy v0)** | [`0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b`](https://arbiscan.io/address/0x3e4298e2b8d4e30396a54c1817eb71c9272ffb4b) |
| **ZeroDev Kernel v3 AA Proof Tx** | `0xc7659e299e4961279f03b9cafa988dc082d7f9baf107bcd7b62812e8dfb54aad` |
| **Smart Route Source Chain** | Robinhood Mainnet (`4663`) |
| **Smart Route Target Chain** | Arbitrum One (`42161`) |
| **ZeroDev Kernel v3 Smart Route UserOp Hash** | `0x7b72ee9f4dc3f32f08a5de914ecf076c243d895522ecd72d17a2f7b025bc956d` |
| **ZeroDev Kernel v3 Smart Route UserOp Tx** | `0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a` |
| **GMX Micro-Fill Live Attempt (`--size=1`)** | **Fail-Closed** — balanced side **`"short"`** ($71 Long vs $58 Short) · `DEPTH_USD=$129<$100k` · `ORACLE_LAG_DEADLOCK:154000ms>30000ms` · **`lostUsd ≡ 0`** · 0 slippage loss |
| **GMX Fill Live Attempt (prior)** | **Fail-Closed** — `GMX_POOL_IMBALANCE_BREACH` (pre-broadcast; shield active) |
| **Gate setPolicyGuard Tx** | [`0x1b158a4a40409e39215b76b5b12693c2802b49b190ecc0be97c986f167b9a182`](https://arbiscan.io/tx/0x1b158a4a40409e39215b76b5b12693c2802b49b190ecc0be97c986f167b9a182) · Block **503079575** · via `SliverVineGatePolicyLink` `0xe4ef5350963241c49a29e72a4cf093208cd19af0` → PolicyGuardV2 `0xfd98…` |
| **Gate PolicyLink Deploy Tx** | [`0x7ce414b737c6efed4068034dadebd9f017e1e6eb832aba64e3ba656ac0380ad9`](https://arbiscan.io/tx/0x7ce414b737c6efed4068034dadebd9f017e1e6eb832aba64e3ba656ac0380ad9) · bootstrap Gate `0xb174…` lacks native setter |
| **Arbiscan URL (Deploy)** | [Arbiscan Tx](https://arbiscan.io/tx/0xeabd5fd17f1e8684c3408887a233a8ac26220199781b401336233a3072fb4b0c) |
| **Arbiscan URL (Smart Route)** | [Arbiscan Tx](https://arbiscan.io/tx/0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a) |

