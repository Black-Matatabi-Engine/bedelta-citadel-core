# 🛡️ SliverVine Protocol (BeΔ) — Citadel Shield: Pre-Consensus Intent Firewall & Execution Safety Primitive & 0-Gas Physical Deadlock for AI Agents on Arbitrum

**SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) · SilverVine Labs 🛡️ ⚡ 🏛️**

> ⚡ **0-Gas Fail-Closed Physical Deadlock (`rootProtection`):** Instantly severs EIP-712 signing channels in **<14.0µs** on Cloudflare Edge before toxic payloads ever reach Arbitrum Sequencer queues, Bundler ingress, or MEV mempools.
>
> 🧠 **Block AI Hallucinations & Prompt Injection:** Microsecond edge bitmask evaluation (**p50 ~106µs**) halting out-of-scope calldata and cross-chain intent drift in real-time.
>
> 🔒 **Unidirectional Escort & Single-Pass Pipeline:** Hardened execution boundaries across the **7+1 Cross-Chain Execution Matrix (7 Arbitrum Native + 1 Hyperliquid L1)** with zero capital leakage (`lostUsd ≡ 0`).
>
> 🚀 **Independent Framework Guards:** Each AI agent runtime (Wayfinder · ElizaOS · Virtuals · LangChain) runs its own **p50 ~106µs** Edge Wasm reflex — **default 7+1 venue rotation** across the full Cross-Chain Execution Matrix, or lock a lane with `--venue=<protocol>`. Start with `pnpm demo:wayfinder`.

---

## ⚡ 30-Second Judge Action Box

```bash
# Tier 1 — Independent AI Agent Framework Guards (p50 ~106µs Wasm reflex each)
pnpm demo:wayfinder                      # Wayfinder (Auto-rotates across 7+1 Cross-Chain Execution Matrix)
pnpm demo:elizaos -- --venue=gmx         # ElizaOS (Manual lock to GMX v2 GM lane)
pnpm demo:virtuals -- --venue=pendle     # Virtuals GAME (Manual lock to Pendle PT/YT lane)
pnpm demo:langchain -- --trip            # LangChain/LangGraph (Fail-closed: toxic intent -> <14µs rootProtection())

# Tier 1 — 7+1 Cross-Chain Execution Matrix Physical Deadlock Severance (<14.0µs)
pnpm demo:matrix -- --trip

# Tier 1 — Full Regression Suite (217 test files | 967 PASS clean)
pnpm test
```

---

## ⚡ Neuromorphic Security Architecture (AEB Analogy)

**Cerebrum vs. Cerebellum — Citadel Shield is the involuntary reflex arc for autonomous AI agents** (**Pillar Set Y** · *Pre-Consensus Firewall & Reflex Defense*).

**AEB analogy:** Think of Citadel Shield like **AEB (Automated Emergency Braking)** in a car. The LLM **Cerebrum** is the driver planning the route (~1–10s Chain-of-Thought). The **Cerebellum reflex arc** slams the brakes in **<14µs** before the transaction leaves the agent's cabin — **$0 Gas burned** — before the vehicle ever reaches the intersection (Sequencer queue, Bundler ingress, or mempool). The EIP-712 signing channel is severed while the intent is still in the cabin.

| | **Cerebrum (LLM Reasoning & Agent Loop)** | **Cerebellum Reflex Arc (Citadel Shield)** |
|---|-------------------------------------------|---------------------------------------------|
| **Stack** | DeepSeek-R1 / GPT-4 + Wayfinder / ElizaOS / GAME / LangChain | Wasm `checkSoilResistance()` reflex kernel |
| **Latency scale** | **~1.0s–10.0s** (1,000ms–10,000ms · DeepSeek-R1 CoT & tool calls) | **14.0µs–106.0µs** (<0.1ms · 0.014ms–0.106ms) |
| **Nature** | Non-deterministic · hallucination-prone | **100% deterministic** · **0-Gas FAIL-CLOSED** physical deadlock |
| **On threat** | May emit out-of-scope calldata (e.g. cross-chain hallucination to [Base / Aerodrome](#fail-closed-walkthrough-cerebrum-hallucination)) | **<14.0µs** reflex — severs EIP-712 channel |

### Neuromorphic Workflow

```
┌────────────────────────────────────────────────────────────────┐
│ [Cerebrum] LLM Reasoning & Agent Loop (~1.0s - 10.0s)          │  <-- CoT / Tool Calls / Non-Deterministic
└────────────────────────────────────────────────────────────────┘
                         │ (Intent Payload)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│ [Citadel Reflex Arc] Cerebellum Shield (⚡ 14.0µs - 106.0µs)     │  <-- 0.014ms-0.106ms / Deterministic Fail-Closed
└────────────────────────────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     [ PASS: <106µs ]            [ FAIL: <14µs ]
    Signature Released          Reflex Deadlock Severed
```

**Core narrative:** If the LLM Cerebrum suffers hallucination or prompt injection and issues out-of-scope calldata (e.g. cross-chain intent drift to Base / Aerodrome), Citadel's Cerebellum triggers an instant physical deadlock (**<14.0µs**), severing the EIP-712 channel before any cross-chain or unvetted execution — **$0 Gas**.

---

## 📌 Live SSOT Anchors & Verification Badges

[![Vitest](https://img.shields.io/badge/Vitest-967%20PASS%20%28217%20files%29-brightgreen?logo=vitest)](./docs/VERIFICATION_MATRIX.md)
[![V2.0 Stylus Probe](https://img.shields.io/badge/V2.0_Stylus_Probe-9%2F9_PASS_(Roadmap)-blue?logo=rust)](./contracts/stylus-probe/)
[![risk-control.ts coverage](https://img.shields.io/badge/risk--control.ts-100%25%20coverage-success?logo=vitest)](./src/services/risk-control.ts)
[![Chaos Matrix](https://img.shields.io/badge/Chaos%20Matrix-255%2F255%20Fail--Closed-blue?logo=github)](./docs/VERIFICATION_MATRIX.md)
[![Benchmark Latency](https://img.shields.io/badge/Benchmark-p50_106%CE%BCs_E2E_Shield_(Kernel_200ns)-blueviolet?logo=speedtest)](./docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#31-microsecond-moats-summary)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue?logo=typescript)](./tsconfig.json)
[![License](https://img.shields.io/badge/License-BUSL--1.1-orange)](./LICENSE)
[![Foundry Citadel Gate](https://img.shields.io/badge/Foundry-Forge_Test_Passed-brightgreen?logo=solidity)](./SliverVineGate)
[![Arbitrum One Gate](https://img.shields.io/badge/Arbitrum_One_Gate-Live_42161-28A0F0?logo=arbitrum)](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1)

<p align="center"><img src="public/brand/Detox_Sanctuary_wm.webp" alt="SliverVine Citadel Gate - Detox Sanctuary" width="600" style="border-radius: 8px;"></p>

> **Latency scope:** **p50 ~106 µs** measures **TypeScript Gateway + Wasm `checkSoilResistance()` interception** on Cloudflare Edge — **not** L1/L2 block confirmation, sequencer finality, or on-chain inclusion time.

| Anchor | Value |
|--------|-------|
| **Vitest baseline** | **217 test files | 967 PASS clean** · `pnpm test -- --run` · `pnpm exec tsc --noEmit` **tsc 0 errors** |
| **Canonical HEAD** | **`572e5cd`** (Phase A+B+C mainnet) · **`3f26efa`** (Citadel-Armor SSOT) · `git rev-parse HEAD` |
| **PolicyGuardV2 (42161 · current)** | [Arbiscan · `0xfd98cadb…8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) · Deploy [Tx `0xcd520602…`](https://arbiscan.io/tx/0xcd520602a277c0781038552d5692f5ad43076a8928f5e7384e695642f980306a) |
| **Wasm ABI v2** | `pkg/soil_core.wasm` · `soil_core_abi_version() = 2` · **28-protocol-slot** FFI (`PROTO_VECT_LEN=28`) — GMX · Hyperliquid · Pendle · Uniswap · Aave · Morpho · USD.ai · Variational lanes · slot **27** = aggregated `protocolMask` · slots **28–35** = soil math input |
| **Security scorecard** | **3-Tier Security Scorecard: 5/0/0 PASS** · `pnpm run audit:security` |
| **Wasm hot path** | `pkg/soil_core.wasm` **< 28 KiB** · ABI **v2** · 28-slot protocol vector · Shield **p50 ~106 µs** · warm **< 60 µs** |
| **Worker bundle** | **50.94 KiB gzip** · **143.77 KiB raw** · `limitKiB: 150` · `pass: true` (`pnpm bundle:measure`) |
| **Arbitrum One Gate** | [Arbiscan · `0xb174118b…f8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **Stylus Soil Coprocessor (42161)** | [Arbiscan · `0xc23587d6…625e`](https://arbiscan.io/address/0xc23587d6573dd134f95b02b0202ffbf84686625e) · Activation [Tx `0x92079e15…`](https://arbiscan.io/tx/0x92079e150697717af75b0b750ff80be36d06212337189ef368bf65fead6c9397) · Nitro Prover JIT + **ArbWasm `0x71`** |
| **Mainnet Ignition Tx** | [Arbiscan · `0x54c153e9…1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Dune Telemetry** | [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · **Sepolia live ingest** · **42161 = pre-compiled SQL spec** awaiting mainnet event ingest → [`DUNE_DASHBOARD_SPECIFICATION.md`](./docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md) |
| **Headless Audit** | [`GET /api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) |

**Philosophy — BeΔ (BeDelta Living Water v1.0):** **Be** is inspired by Bruce Lee's *"Be Water, My Friend"* — fluid, adaptive intent routing that conforms to venue constraints without breaking invariants. **Δ (Delta)** denotes **market delta-neutrality** — neutralizing directional exposure through the GMX v2 GM + Hyperliquid 1× short envelope. **SliverVine** = fragmented intent protection & steel trading execution · **SliverVine Citadel Shield** = the pre-consensus execution safety primitive that binds both.

**Protocol:** SliverVine · **Entity:** SilverVine Labs · **Contact:** `grants@silvervinelabs.com` · **B2B:** `hello@silvervinelabs.com`  
**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water) · **Package:** [`@slivervine/citadel-sdk`](./src/sdk/README.md) (Apache-2.0)

### Core Sinking SSOT (`src/core/`)

Pure risk invariants are sunk into five core modules; legacy paths under `src/adapters/` and `src/services/` keep **100% backward compatibility** via thin-shell re-exports.

| Core module | Scope |
|-------------|--------|
| [`risk-engine-usdai.ts`](./src/core/risk-engine-usdai.ts) | USD.ai invariants · `resolveUsdAiClockSsotPure()` clock SSOT |
| [`soil-resistance-core.ts`](./src/core/soil-resistance-core.ts) | Soil lane math · time gates · jitter · orderbook gap pure decision |
| [`session-key-guard-core.ts`](./src/core/session-key-guard-core.ts) | Session key validity · notional math |
| [`delta-neutral-calculator.ts`](./src/core/delta-neutral-calculator.ts) | 0-Δ cross-wallet hedge sizing |
| [`funding-regime-core.ts`](./src/core/funding-regime-core.ts) | Funding regime classification · leverage scaling |

> **Solidity ingress:** [`SliverVineRiskOracle.sol`](./contracts/SliverVineRiskOracle.sol) · [`IngressSafetySwitch.sol`](./contracts/IngressSafetySwitch.sol) use **Solidity Custom Errors** (`revert CustomError()`) for bytecode-efficient fail-closed; `ERR_*` bytes32 event constants remain for telemetry.

> **On-chain vs off-chain SSOT:** Live **EIP-712 `SliverVineGate`** on Arbitrum One (`42161`) — [Gate `0xb174118b…f8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) + Cloudflare Edge `pkg/soil_core.wasm` (**< 28 KiB** · `checkSoilResistance()` **p50 ~106 µs** · **Pillar Set Y**). **Arbitrum Stylus** [`SliverVineSoilCoprocessor`](./contracts/stylus-probe/) — **mainnet deployed & activated** at [Arbiscan · `0xc23587d6…625e`](https://arbiscan.io/address/0xc23587d6573dd134f95b02b0202ffbf84686625e) (Nitro Prover JIT via ArbWasm `0x71`). → [Technical Specification §0](./docs/architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md#0-unified-institutional-pre-execution-pipeline)

### Arbitrum Ecosystem Alignment (H1 2026)

| Alignment | SliverVine role | SSOT |
|-----------|-----------------|------|
| **Agentic Commerce** | **Pillar Set Y** (*Pre-Consensus Firewall & Reflex Defense*) — execution safety primitive for AI agent swarms & machine-payment rails (x402-ready) | `checkSoilResistance()` · `rootProtection()` · `SliverVineGate.sol` · [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) |
| **Robinhood Chain (`46630`/`4663`)** | **Pillar Set X** (*Liquidity & Ingress Infrastructure*) — outbound-only USDG escort → Arbitrum One · **`lostUsd ≡ 0`** · inbound AML block | `pnpm demo:escort` · Vitest **6/6** — [`across-ingress-bridge.test.ts`](./tests/adapters/across-ingress-bridge.test.ts) · [`03_PILLAR_2` audit](./docs/audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) |
| **ArbOS 61 Elara** | **Pillar Set Y** (*Pre-Consensus Firewall & Reflex Defense*) — protocol ingress filtering reinforces Edge fail-closed; never a weaker substitute for pre-broadcast SSOT | [`04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./docs/architecture/04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos-stylus-alignment-code-verified-on-chain-coprocessor) |
| **ZeroDev Kernel v3 (v0.95 SSOT)** | **Pillar Set X** ingress hook — ERC-7579 Modular Account · Ultra-Relay Intent Network · proprietary Citadel adapter (`src/adapters/arbitrum/zerodev-aa/`) | `pnpm test:zerodev` · [`02_THREE_PILLARS` §2.4](./docs/architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#24-pillar-set-x-opt-in-zerodev-account-abstraction-integration-summary) |

### v0.95 SSOT Security Patches (Commit `5829e9a`)

| Patch | Resolution | Telemetry |
|-------|------------|-----------|
| **Session Key Replay Guard** | `executeHlSessionKeyOrder` — consume-once nonce (`auditSessionKeyNonceState`) + `expiresAt <= nowMs` before broadcast | `[WALLET_A_HL_STATE]` |
| **Clock SSOT** | `resolveUsdAiClockSsot()` — `nowMs ?? Date.now()` · **hard skew >30s → `CLOCK_SKEW_EXCEEDED`** | `[CLOCK_SSOT_VERIFIED]` |
| **ZeroDev AA Security Review** | ZeroDev boundary documented · replay + clock items **Resolved in v0.95 SSOT** | [`SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) |

> **Note:** Initial mainnet deployment utilizes Bootstrap Ignition Keys ([`0x1111…1111`](https://arbiscan.io/address/0x1111111111111111111111111111111111111111) / [`0x2222…2222`](https://arbiscan.io/address/0x2222222222222222222222222222222222222222)) for public verification. Production multisig rotation via native governance.

---

## 🎯 7+1 Cross-Chain Execution Matrix & Unidirectional Bridge Escort

**Hybrid Pillar Architecture:** **Pillar Set X** (*Liquidity & Ingress Infrastructure*) — GMX v2 GM / Hyperliquid cross-wallet liquidity · Robinhood unidirectional escort · bridge ingress. **Pillar Set Y** (*Pre-Consensus Firewall & Reflex Defense*) — Wasm `rootProtection()` · Edge `checkSoilResistance()` · 0-Gas fail-closed reflex.

**Primary Execution Boundary — 7+1 Cross-Chain Execution Matrix (7 Arbitrum Native + 1 Hyperliquid L1):**
- **7 Arbitrum One natives:** GMX v2 · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · USD.ai · Variational Omni RFQ
- **+1 cross-chain HF orderbook defense:** Hyperliquid L1 Session Key Adapter

| Protocol | Venue | Physical Boundary | Adapter / Demo |
|----------|-------|-------------------|----------------|
| **GMX v2** | Arbitrum One | \|OI_long − OI_short\| / PoolTVL > **0.35** · Reserve < **105%** | `gmx-v2-invariants.ts` · `pnpm demo:gmx` |
| **Pendle** | Arbitrum One | \|Yield_current − Yield_oracle\| > **150 bps** | `pendle-pool-factory-adapter.ts` · `pnpm demo:pendle` |
| **Uniswap V3** | Arbitrum One | Tick depth · slippage/penalty > **50 bps** | `uniswap-v3-adapter.ts` · `pnpm demo:uniswap` |
| **Aave V3** | Arbitrum One | Health Factor HF < **1.15** | `aave-v3-adapter.ts` · `pnpm demo:aave` |
| **Morpho Blue** | Arbitrum One | NAV deviation > **30 bps** | `morpho-blue-adapter.ts` · `pnpm demo:morpho` |
| **USD.ai** | Arbitrum One | sUSDai peg drift > **30 bps** · oracle age > **2h** · depth < **$100k** | `usdai-adapter.ts` · `pnpm demo:usdai` — **AI-Compute Yield Collateral · Guarded by Citadel Soil Fuse** |
| **Hyperliquid** | L1 HF Orderbook AppChain | MaxSizePerOrder · 120/min · spread > **20 bps** | `hyperliquid-session-guard.ts` · `pnpm demo:hl` |
| **Variational** | Arbitrum One (Omni RFQ) | Quote stale **>500ms** · drift **>30 bps** · OLP **>15%** | `variational-rfq-adapter.ts` · `pnpm demo:matrix -- --loop=perp --hedge=variational` |

**AI Agent frameworks (Wayfinder · ElizaOS · Virtuals · LangChain):** `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` — **default 7+1 venue rotation** · `--venue=<protocol>` lock · `--trip` fail-closed · → [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md)

### Pillar Set X — Unidirectional Bridge Escort (*Liquidity & Ingress Infrastructure*)

```text
Traditional Bridge                SilverVine Pillar Set X Escort
(any ↔ any · loss opaque)         (46630/4663 → 42161 only · lostUsd ≡ 0)
 Source ═══════► Dest              RH Chain ──escort──► Arbitrum GMX/Pendle
       ◄═══════                         ▲ inbound AML BLOCKED
 timeout → stuck capital
```

| | Traditional | SilverVine Escort |
|---|-------------|-----------------|
| Direction | Bidirectional | **Unidirectional outbound** |
| Timeout | Manual recovery | **`BRIDGE_TIMEOUT_FAIL_CLOSED`** (>3600s) |
| Accounting | Opaque pending | `IN_FLIGHT` → `SETTLED` |
| Loss | Social / insurance | **`lostUsd ≡ 0`** |

**Interactive demo:** `pnpm demo:escort` · timeout trip: `pnpm demo:escort -- --trip` · → [`02_THREE_PILLARS`](./docs/architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md#22-traditional-bridge-vs-silvervine-pillar-set-x-compliance-escort)

Full adapter tables, Stabilizer Sepolia sandbox, and architectural hardening (R20 auto-severance · sliding-window OI · Stylus coprocessor) → [`docs/architecture/README.md`](./docs/architecture/README.md) · [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)

---

## 🏛️ Live Proof MVP: Citadel-Armor Sovereign Vault (GMX v2 Real Yield)

A live proof-of-concept demonstrating how Citadel Shield's microsecond circuit breaking enables risk-free delta-neutral capital deployment.

The **Citadel-Armor Sovereign Vault** proves that **active sub-ms circuit breaking** delivers GMX v2 Real Yield with **near-zero drawdown** and **maximum Sharpe Ratio** — **100% active** routing to GMX v2 GM Pools (ETH/USDC) + **1× Hyperliquid perp short** hedge until **Δ_net ≡ 0**.

| Lane | Wallet Address | Venue | Role & OpSec Boundaries |
|------|----------------|-------|-------------------------|
| **Wallet A — HL Short Lane** | [Arbiscan · `0xef0752…960d`](https://arbiscan.io/address/0xef0752df6387248B897F3A59A180af42D801960d) *(OpSec Rotation Pending)* | Hyperliquid L1 Perps | 0-Gas **1× ETH short** · EIP-712 session keys · `executeGmxCrossWalletHedge` |
| **Wallet B — GM LP Yield Vault** | [Arbiscan · `0xbd65d7…EC7F`](https://arbiscan.io/address/0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F) | Arbitrum One GMX v2 | **Principal Capital Custody** · GM LP deposit/withdraw execution lane |
| **Protocol Treasury — UI Fee Vault** | [Arbiscan · `0xc9BddA…546f`](https://arbiscan.io/address/0xc9BddABD80982d2201376195DD9B85fb7951546f) (`uiFeeReceiver`) | Arbitrum One Treasury | **Protocol Revenue Collection** · Recipient of +10 bps GMX v2 builder rebate |

**Protocol revenue stream:** `GMX_UI_FEE_BPS = 10` — every unsigned GMX v2 payload injects **+10 bps** directly to the dedicated Protocol Treasury ([Arbiscan · `0xc9BddA…546f`](https://arbiscan.io/address/0xc9BddABD80982d2201376195DD9B85fb7951546f)) as `uiFeeReceiver`, completely segregated from Wallet B principal capital ([Arbiscan · `0xbd65d7…EC7F`](https://arbiscan.io/address/0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F)). SSOT: [`gmx-revenue.ts`](./src/config/gmx-revenue.ts).

**Cold-start safety:** `INSUFFICIENT_WALLETA_HEDGE_MARGIN` fail-closed guard blocks HL hedge broadcast when Wallet A margin cushion is below JIT threshold — operators must **pre-fund Seed Margin** before scaling Wallet B GM deposits. → [`docs/PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./docs/PRODUCTION_WORKFLOW_DEEP_DIVE.md)

**Grant E2E capital routing:** **$2,500 USDC** → **$2,400** GMX GM LP (+$2.40 treasury rebate) → **$100** HL margin → Wallet A matching short · **`lostUsd ≡ $0`**.

Production delta-neutral execution splits **venue-specific custody** across three specialized wallets (Wallet A hedge · Wallet B principal · Protocol Treasury fee collection). The cross-wallet hedge engine ([`gmx-cross-wallet-hedge.ts`](./src/services/gmx-cross-wallet-hedge.ts) · [`scheduled-gmx-hedge-cron.ts`](./src/scheduled-gmx-hedge-lib/scheduled-gmx-hedge-cron.ts)) reads **live GMX GM delta on Wallet B** and sizes **Hyperliquid session-key shorts on Wallet A** until **Δ_net ≡ 0**.

```bash
pnpm demo:e2e:arb-native              # Tier 1 — Arbitrum Native USDC direct GM deposit (42161 simulate)
pnpm demo:e2e:arb-native -- --gm-amount=10
pnpm execute:gmx:gm-deposit           # Wallet B live GM deposit multicall
pnpm execute:gmx:gm-withdraw          # Wallet B live GM withdraw multicall
pnpm demo:e2e                         # 4-step cross-wallet Happy Path HUD
pnpm demo:e2e -- --unwind             # + Step 5 Citadel Shield R20 exercise
```

→ **Full production workflow SSOT:** [`docs/PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./docs/PRODUCTION_WORKFLOW_DEEP_DIVE.md) · [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)

---

## 📚 English SSOT Hub — Start Here

| Priority | Document | Role |
|----------|----------|------|
| **1** | [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) | 30-second Buildathon brief · neuromorphic security · Arbitrum H1 2026 alignment |
| **2** | [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) | Express verification hub — role routing · decoupled proof index |
| **3** | [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) | Full Buildathon submission pack |
| **4** | [`docs/architecture/README.md`](./docs/architecture/README.md) | Yellow Paper · R01–R20 · Hybrid Pillar Sets X & Y · adapter deep dives |
| **5** | [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md) | Granular `pnpm demo:*` command reference |
| **6** | [`docs/README.md`](./docs/README.md) | Full documentation index · audit · grants · SDK blueprint |

**Core product:** **SliverVine Citadel Shield** is a **Pre-Consensus Intent Firewall & Execution Safety Primitive** for AI Agents on Arbitrum — not a standalone Wasm risk check. Off-chain Edge reflex (`checkSoilResistance()`) + on-chain **EIP-712 consume-once `SliverVineGate`** form a protocol-grade execution safety layer. → [§1 Product Identity](./docs/architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md#1-core-product-identity)

---

### 📐 Core Risk Invariants (Judge Quick Reference)

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0
$$

$$
\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}
$$

$$
t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s} \ll t_{\text{mempool\_broadcast}}
$$

Derivations & R01–R20 bounds: [Technical Specification §3.1](./docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#31-microsecond-moats-summary) · [Verification Matrix](./docs/VERIFICATION_MATRIX.md) · [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md).

**Risk spectrum (88% / 12%):** [Risk Mitigation Framework §0.1](./docs/architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does-and-does-not-guarantee)

---

## Why Citadel Shield is NOT a Normal RPC Gateway

Citadel Shield is the **Cerebellum & Reflex Arc** — not a passive JSON-RPC forwarder. Extended neuromorphic architecture → [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md).

| Dimension | Normal RPC Gateway | Citadel Shield (Cerebellum) |
|-----------|-------------------|-----------------------------|
| **Cognitive role** | Transport relay (no reflex) | **Involuntary safety reflex** (pre-signature deadlock) |
| **Latency** | 50–300ms+ RTT (transport) | **14.0µs–106.0µs** Edge Gateway + Wasm reflex (**not** block time) vs LLM **~1.0s–10.0s** reasoning loop |
| **Determinism** | N/A | **100% deterministic** bitmask evaluation |
| **On hallucination** | Forwards opaque calldata | **FAIL-CLOSED** · `severSigningChannel()` · **0-Gas** |
| **Demo proof** | N/A | `pnpm demo:wayfinder` (7+1 venue rotation) · `--venue=pendle` lock · `--trip` FAIL_CLOSED |

### Fail-Closed Walkthrough — Cerebrum Hallucination

**Scenario:** The LLM **Cerebrum** drifts into a **cross-chain intent hallucination** — routing a swap to **Aerodrome** (a legitimate Base-native protocol) while policy strictly authorizes only the **7+1 Cross-Chain Execution Matrix (7 Arbitrum Native + 1 Hyperliquid L1)**.

> **Clarification:** Aerodrome is **out-of-scope**, not malicious. Citadel's Cerebellum triggers **<14.0µs** physical deadlock, severing EIP-712 **before** any cross-chain or unvetted execution.

1. **Cerebrum emits out-of-scope cross-chain calldata** (`~2,000ms` Chain-of-Thought).
2. **Cerebellum reflex** — Base/Aerodrome outside Arbitrum allowlist → **FAIL-CLOSED** in **<14.0µs**.
3. **`severSigningChannel()`** — **0-Gas**, no Sequencer queue entry.
4. **Judge reproduction:** `pnpm demo:langchain -- --venue=pendle` · `pnpm demo:wayfinder -- --trip` · `pnpm demo:matrix -- --trip`

---

## ⚡ Agent Framework Demo Modes (Wayfinder · ElizaOS · Virtuals · LangChain)

All four independent agent framework demos share the same CLI surface — each runs **one guard in isolation** with **p50 ~106µs** Edge Wasm reflex (no concurrent multi-agent queue overhead).

| Mode | Command pattern | Behavior |
|------|-----------------|----------|
| **Default (rotated)** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` | Auto-selects a venue from the **7+1 Cross-Chain Execution Matrix (7 Arbitrum Native + 1 Hyperliquid L1)** (rotates per harness clock). HUD prints `VENUE` · `INVARIANT` · protocol-specific intent. |
| **Manual lock** | `pnpm demo:<framework> -- --venue=<protocol>` | Locks a specific protocol lane. Example: `pnpm demo:langchain -- --venue=pendle` |
| **Fail-closed trip** | `pnpm demo:<framework> -- --trip` | Simulates toxic intent / market invariant breach → **<14.0µs** Wasm `rootProtection()` physical deadlock · **0-Gas** |

**7+1 Cross-Chain Execution Matrix venues** (7 Arbitrum Native + 1 Hyperliquid L1 · accepted `--venue` keys):

| `--venue` key | Protocol | Sample invariant (HUD) |
|---------------|----------|--------------------------|
| `gmx` | GMX v2 | OI skew / reserve cap · cross-venue slippage fuse |
| `pendle` | Pendle | \|Yield_current − Yield_oracle\| ≤ 150 bps |
| `uniswap` | Uniswap V3 | Tick depth · slippage ≤ 50 bps |
| `aave` | Aave V3 | Health Factor HF ≥ 1.15 |
| `morpho` | Morpho Blue | NAV deviation ≤ 30 bps |
| `usdai` | USD.ai | Peg drift ≤ 30 bps · oracle age ≤ 2h |
| `hyperliquid` / `hl` | Hyperliquid | Spread ≤ 20 bps · session-key rate cap |
| `variational` / `var` | Variational Omni RFQ | Quote stale ≤ 500ms · OLP ≤ 15% |

→ Full CLI reference: [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md) · [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)

---

## ⚡ Extended Express Audit

### Flagship Demos (Tier 1 — AI Agent Shield)

```bash
pnpm demo:wayfinder                        # Default 7+1 venue rotation · p50 ~106µs Wasm reflex
pnpm demo:langchain -- --venue=aave        # Manual lock — Aave V3 supply lane
pnpm demo:elizaos -- --trip                # Fail-closed soil trip · any framework supports --trip
pnpm demo:matrix -- --trip                 # 7+1 Cross-Chain Execution Matrix · R20 physical deadlock severance
pnpm demo:escort                           # Pillar Set X multi-route compliance escort · lostUsd ≡ 0
```

→ **Granular protocol & framework demos:** [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md)

### Path 1: Instant Monorepo (Recommended — ~3 Seconds)

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Dual Pillar Set X & Y Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (217 test files | 967 PASS clean)
```

### Path 2: Isolated Docker

```bash
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
```

Full dual-axis verification (Zone A → B → C), `demo:e2e` diff output, and bundle gates → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)

---

## 🔬 Battle-Tested Metrics (Santenmoku Engine)

| Layer | Metric |
|-------|--------|
| **Vitest SSOT** | **217 test files | 967 PASS clean** · Chaos **255/255** fail-closed |
| **Wasm hot path** | `pkg/soil_core.wasm` **< 28 KiB** · **ABI v2** · 28-protocol-slot FFI · Shield **p50 ~106 µs** · warm **< 60 µs** |
| **Worker bundle** | **50.94 KiB gzip** · **143.77 KiB raw** (`pnpm bundle:measure` · `pass: true`) |
| **Edge latency** | p50 ~106 μs Shield path · pure-math kernel **200 ns** |
| **Foundry Gate** | **60/60** unit tests · **327,675** deep fuzz (`pnpm audit:nightly`) · **95.51%** line coverage |
| **Deep fuzz (standard)** | **5,120** = 5×1,024 (`forge test`) |

---

## 🗺️ Protocol Milestones (M0 – M6)

| Milestone | Status | Highlight |
|-----------|--------|-----------|
| **M0: Operational Foundation** | ✅ Delivered | Monorepo · Cloudflare Edge · CI/CD |
| **M1: On-Chain Citadel Gate** | ✅ Delivered | `SliverVineGate.sol` · deep fuzz · 25k gas bounds |
| **M2: Pre-Execution Radar** | ✅ Delivered | `checkSoilResistance()` · **967 PASS** · **50.94 KiB gzip** |
| **M3: Dual-Chain & ZeroDev AA** | ✅ Dry-Run Verified | Opt-In Pillar Set X ingress (`USE_ZERODEV_AA` default-off) |
| **M4: WASM Engine & SDK** | ✅ Delivered | `pkg/soil_core.wasm` · `@slivervine/citadel-sdk` |
| **M5: TCA & Hyperliquid** | ✅ Delivered | Grant-audit surfaces · HL testnet provenance |
| **M6: Grant Submission** | ✅ Mainnet Ignition | Gate [Arbiscan · `0xb174118b…f8BF1`](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) · [Ignition Tx `0x54c153e9…`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |

Commercial model (V1.0 open gateway · V1.1 SaaS tiers · V2.0 CaaS) → [`JUDGE_BRIEF.md`](./JUDGE_BRIEF.md) · [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md)

---

## 🛡️ Auditor — CLI & API Verification

> **SSOT:** All verification commands, pillar mapping, and expected outputs → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md).

```bash
# Zone A — Express (recommended first pass)
pnpm demo && pnpm demo:e2e && pnpm test

# Zone B — Inside Pillar Sets X & Y
pnpm test:zerodev
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
cd SliverVineGate && forge test && cd ..
pnpm audit:fast && pnpm audit:security

# Zone C — Outside Pillar Sets X & Y
pnpm demo:gmx && pnpm demo:hl && pnpm demo:pendle
pnpm demo:wayfinder -- --trip
curl -s https://bedeltawater.slivervine.xyz/api/grant-audit | jq .provenanceVerified
```

Hybrid Pillar Sets X & Y pipeline ASCII · Tri-Sensor matrix · competitive positioning → [`docs/architecture/README.md`](./docs/architecture/README.md)

---

## 📜 License

**Protocol / Worker (repo root):** **BUSL-1.1** — Copyright (c) 2026 SilverVine Labs. Change Date `2028-08-21` → Apache-2.0. See [LICENSE](./LICENSE).

**Developer integration harness:** [`@slivervine/citadel-sdk`](./src/sdk/) under **Apache-2.0**. See [`src/sdk/README.md`](./src/sdk/README.md) · [`docs/sdk/CITADEL_SDK_BLUEPRINT.md`](./docs/sdk/CITADEL_SDK_BLUEPRINT.md).
