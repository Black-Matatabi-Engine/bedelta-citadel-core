# JUDGE_BRIEF.md — SliverVine Citadel Shield (1-Page Buildathon Brief)

| Field | Value |
|-------|-------|
| **Headline** | **SliverVine Citadel Shield: Pre-Consensus Intent Firewall & Execution Safety Primitive for AI Agents on Arbitrum** |
| **Entity** | SilverVine Labs |
| **Track** | Promising Products — AI Agents & Financial Primitives |
| **Arbitrum One Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Ignition Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Live Dune Telemetry Portal** | [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · PEV operational on Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **Headless Audit Endpoint** | [`https://bedeltawater.slivervine.xyz/api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit) |
| **Repo** | [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water) |
| **Tests** | `pnpm test` → **180 test files | 803 PASS Clean** · `pnpm demo` (12 Tri-Pillar scenarios) · `pnpm demo:e2e` (5-step macro) · full matrix → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) |
| **Deep docs** | [`docs/ARB_Buildathon/SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) · [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) |

> **Headless Infrastructure Protocol:** Core interaction is API/SDK Native (`@slivervine/citadel-sdk`) & CLI HUD.

---

## 評審 Nit 澄清與誠實邊界（Judge Nit Mitigations）

> 本節直接回應 30-Persona 審計（`docs/internal/0903_Grok_EH_ZH.md` · `0904_Grok_M_ZH.md` · `0904_Grok_PM_ZH.md`）五項核心 nit。**v1.0 `main` 維持 180/803 PASS；零 `src/` 邏輯變更。**

| # | Nit | 澄清（繁中 SSOT） |
|---|-----|-------------------|
| **1** | 主網 Bootstrap 密鑰 | Arbitrum One Gate `0xb174118b…` 上的 **`0x1111…` / `0x2222…` 為刻意設計的 Ephemeral Verification Signers（臨時驗證簽名者）**——僅供公開審計可重現性，**不暴露生產 HSM 基礎設施**。產品形狀為 consume-once EIP-712 Gate；生產環境透過原生治理函數輪替至多簽。 |
| **2** | GMX v2 無 live fill | GMX v2 執行防護已透過 **Vitest CLI + dry-run 管線**完整驗證（`pnpm demo` · `tests/demo/gmx-v2-agent-flow.demo.test.ts` · `gmx-v2-order-payload-guards.ts`）——在 **live GM pool 資本部署前**保證 **0-Gas 預飛行（pre-flight）熔斷**；非「未測試」，而是「主網 fill 待 Grant M6 後啟用」。 |
| **3** | Pendle yield 掛名 | Citadel **嚴格定位為 Pendle Institutional Safety Sentinel**——驗證 **60s TTL Oracle** 與 **5 項 Pool Invariants**（maturity ≥7d · yield drift ≤300bps · $100K min liquidity · asset whitelist · `PENDLE_ORACLE_STALE` soil fuse）。**不作任何 APY / yield 收益宣稱**；非 Pendle YT 競品。 |
| **4** | Dune Live vs One | **Dune SQL 索引查詢已預編譯鎖定 Arbitrum One（42161）語意**（Queries 0–3 · [`DUNE_DASHBOARD_SPECIFICATION.md`](./docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md)）；**即時遙測串流目前運行於 Sepolia testnet** Gate `0xb174…`（`IntentAttested` · `RiskTripBlocked`）。表單填寫時須分開標註「Sepolia live」與「One SQL spec」。 |
| **5** | ElizaOS / Wayfinder plugin | **v1.0 交付可執行 Reference Harness**（`examples/adapters/` · `withCitadelShield` · `pnpm demo:agent`）。官方 npm 套件（`@elizaos/plugin-citadel-guard` · Wayfinder `wayfinder_citadel_shield`）屬 **V1.1 Open PR Spec**——見 [V1.1 Roadmap（feature branch）](https://github.com/SilverVineLabs/bedelta-living-water/blob/feature/v1.1-agent-frameworks-spec/docs/V1.1_AGENT_FRAMEWORKS_ROADMAP.md) · `feature/v1.1-agent-frameworks-spec` PR；**非 v1.0 已簽約官方 plugin**。 |

---

## 30-Second Identity

SliverVine is **not** a Wasm slippage calculator. It is a **pre-consensus execution safety primitive**: sub-ms intent clearing on Cloudflare Edge (`checkSoilResistance()`, p50 ~106µs · **`pkg/soil_core.wasm` — independent of AA**) **plus** an immutable **EIP-712 consume-once `SliverVineGate`** on Arbitrum One. ZeroDev Kernel v3 is an **opt-in Pillar 1 AA delivery layer** (`USE_ZERODEV_AA` default-off) — not the source of sub-ms latency. Toxic AI Agent UserOps are severed **before** Sequencer queues — **0-Gas** on blocked paths.

## Judge Quickstart Instructions

```bash
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (180 files / 803 tests)
```

Optional AI interceptor: `pnpm demo:agent` · `pnpm demo:agent --trip` (FAIL_CLOSED)

> All verification commands: [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)

### Dual-Demo Architecture (Tri-Pillar Showcase)

| Path | Command | Scope |
|------|---------|-------|
| **Microsecond Risk Gate Demo Matrix** | `pnpm demo` | **12 ANSI scenarios** — GMX v2 (price impact · Data Streams lag · `reduceOnly` delever) · Hyperliquid (EIP-712 session key · WS stale/latency · GateLockout) · Pendle (AI guarded pool · 60s TTL stale oracle) · zero-I/O sync hot-path **p50 ~106µs** |
| **Macro Lifecycle E2E Suite** | `pnpm demo:e2e` | **5-step** cross-venue agent hedge · GMX underweight · HL session hedge · R20 circuit breaker |

Demo files: [`tests/demo/`](./tests/demo/) (`gmx-v2-agent-flow` · `hyperliquid-agent-flow` · `pendle-ai-agent-flow`).

---

## Why Protocol, Not a Tool?

| Property | Evidence |
|----------|----------|
| **Consume-once invariant** | `SliverVineGate.sol` — EIP-712 attestation replay ⇒ `Replayed()` revert |
| **Non-custodial settlement gate** | No proxy · no ETH custody · live on **42161** |
| **Unidirectional state flow** | Edge soil fuse → signing channel → Gate attestation (Foundry 62/62) |
| **Composable primitive** | `@slivervine/citadel-sdk` · `withCitadelShield` decorator · Reference harness |

A *tool* reports risk post-hoc. A *protocol primitive* **binds execution** with on-chain invariants and fail-closed pre-consensus clearing.

---

## Ecosystem Synergy — Arbitrum Open House Buildathon Priorities

### Offchain Labs Core / Arbitrum Foundation

**Lean execution · 0-Gas pre-broadcast severance · mainnet gate `0xb174…`:**

- Sub-ms Edge `checkSoilResistance()` (p50 ~106µs) — no on-chain hot-path bloat
- Toxic intents severed **before** Sequencer queues → **0-Gas** on blocked paths
- Live **Arbitrum One** consume-once `SliverVineGate` at `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`

### GMX Protocol

**+10 bps builder lane & depth/slippage fuse · Dry-Run 驗證（0-Gas pre-flight）：**

- Qualified GM payloads route `uiFeeReceiver` builder fee
- Pre-execution soil fuse (cross-venue slippage + depth) before DataStore broadcast
- **Vitest CLI + dry-run 管線已驗證** — `pnpm demo` · `tests/demo/gmx-v2-agent-flow.demo.test.ts` · `gmx-v2-order-payload-guards.ts`；**live GM pool 資本部署前**保證 0-Gas 預飛行保護（主網 fill 屬 Grant 後里程碑，非 v1.0 未測試）

### Pendle Finance (V1.0 Live · Core Pillar 3)

**Pendle Institutional Safety Sentinel（非 yield 產品）— 60s TTL Oracle · 5 Pool Invariants：**

- **Dynamic Market Oracle** ([`pendle-market-oracle-adapter.ts`](./src/adapters/pendle/pendle-market-oracle-adapter.ts)): sync in-memory `ingest()` / `resolve()` — **no hot-path I/O** · **TTL default 60s**
- **Registry hydration** ([`pendle-pt-registry.ts`](./src/adapters/pendle/pendle-pt-registry.ts)): `hydrateFromOracle` overrides `impliedYield`, `ptPriceInAsset`, `liquidityConstant`, `expirySec`
- **Soil fuse wiring**: `pendleOracle` + `pendleCrossGuard` → `checkSoilResistance()` · emits **`PENDLE_ORACLE_STALE`** on missing / stale / invalid feeds
- Expiry **<7d** + yield jitter **>200 bps** → fail-closed · Shadow margin cross-check vs GMX maintenance before risk-increasing intents
- Protects PT/YT capital from liquidation blackholes — **not a competing yield product** · **不作 APY 收益宣稱** · coexists with Shield **p50 ~106µs**
- `validateAIPoolSelection()` pre-flights `PENDLE_CREATE_POOL` / `PENDLE_ADD_LIQUIDITY` via optional `pendlePoolFactory` soil probe ([`pendle-pool-factory-adapter.ts`](./src/adapters/pendle/pendle-pool-factory-adapter.ts))

→ [`pendle-gmx-cross-guard.ts`](./src/guards/pendle-gmx-cross-guard.ts) · [`pendle-market-oracle-adapter.ts`](./src/adapters/pendle/pendle-market-oracle-adapter.ts)

### Dune Analytics

**Live dashboard:** [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)

**遙測狀態（誠實邊界）：** Dune SQL **已預編譯鎖定 Arbitrum One（42161）**；**即時事件串流運行於 Sepolia testnet**。

**Structured on-chain events & PEV (Prevented Exploit Volume) metric:**

- Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` — **`IntentAttested`** (live EIP-712 attestations) + **`RiskTripBlocked`** (pre-broadcast fail-closed severance) indexed in real time
- **PEV** — `SUM(blocked_intent_notional_usd)` from `RiskTripBlocked` logs; **fully operational on-chain** via Sepolia Gate
- Production SQL spec + daily reconciliation panels target Arbitrum One `42161`

→ [`docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md`](./docs/telemetry/DUNE_DASHBOARD_SPECIFICATION.md) · `scripts/emit-sepolia-telemetry-events.ts`

### AI Agent Ecosystem Runtimes (Virtuals / ElizaOS / LangChain TS & Python)

**v1.0：可執行 Reference Harness · V1.1：官方 npm 規格 PR（`@elizaos/plugin-citadel-guard`）**

- **v1.0 已交付**：`withCitadelShield` decorator · `examples/adapters/` · `pnpm demo:agent` — 可重現 CLI 驗證
- **V1.1 Open PR Spec**： [V1.1 Agent Frameworks Roadmap（feature branch）](https://github.com/SilverVineLabs/bedelta-living-water/blob/feature/v1.1-agent-frameworks-spec/docs/V1.1_AGENT_FRAMEWORKS_ROADMAP.md) · ElizaOS `@elizaos/plugin-citadel-guard` · Wayfinder `wayfinder_citadel_shield` — **非 v1.0 官方 npm 發布**

**Zero-touch integration for agent swarms (TS decorator + Python REST):**

```ts
import { withCitadelShield } from "@slivervine/citadel-sdk";

const execute = withCitadelShield(async (intent) => agent.swap(intent));
```

```python
# pip install langchain-core pydantic
# python examples/adapters/langchain-agent-adapter.py
from langchain_core.tools import BaseTool  # SlivervinePreExecutionGuardTool in adapter module
```

Executable adapters with Cyberpunk ANSI HUD: [`examples/adapters/`](./examples/adapters/) (TS + Python) · Reference harness: `pnpm demo:agent` ([`examples/agent-interceptor-demo.ts`](./examples/agent-interceptor-demo.ts))

---

## Innovation & Real Problem Solving — AI Behavioral Safety Substrate

1. **Native LLM Back-off & Retry Intercepts**: Active **60-second cooldown lock** per `agentId` in `withCitadelShield` ([`src/sdk/decorator.ts`](./src/sdk/decorator.ts)) prevents token-burning infinite retry loops and **RPC Rate-Limit Self-DoS** when transactions fail closed — surfaces `[Citadel Back-off] MANDATORY_COOLDOWN_ACTIVE` for LLM runtimes (`pnpm tsx examples/adapters/elizaos-action-adapter.ts --trip`).
2. **Non-Semantic Bytecode Predicate Assertions**: Evaluates **raw bytecode parameters** at **p50 ~106µs** Edge Wasm rather than natural language — rendering the system immune to **Indirect Prompt Injections** at the signing layer ([Technical Specification §0.1](./docs/architecture/01_TECHNICAL_SPECIFICATION.md#01-bytecode-predicate-verification-v10--erc-7715--post-grant-design-spec)).
3. **Dynamic Threshold Obfuscation**: Cryptographic pseudo-random **±2–5 bps jitter** on slippage / depth cutoffs ([`soil-threshold-jitter.ts`](./src/services/risk-control-lib/soil-threshold-jitter.ts)) prevents MEV searchers from predicting exact **50 bps** fuse boundaries off-chain.

---

## Official Rubric — CLI Proof Pointers

| Criterion (25% each) | One-liner | Verify |
|---------------------|-----------|--------|
| **Smart Contract Quality** | Immutable consume-once Gate on mainnet | Arbiscan Tx above · `SliverVineGate/test/` |
| **Product-Market Fit** | GMX builder lane + Agent SDK + Pendle Institutional Shield (sync oracle + soil fuse) | `gmx-v2-order-payload.ts` · `decorator.ts` · `pendle-market-oracle-adapter.ts` |
| **Innovation & Creativity** | Pre-consensus intent firewall + PEV + AI Behavioral Safety Substrate | This brief · SUBMISSION § Innovation |
| **Real Problem Solving** | 0-Gas pre-broadcast death window + LLM back-off cooldown | `--trip` adapter demos · `lostUsd ≡ 0` |

---

## 88% Defense Mesh & Honest 12% Post-Grant R&D Blueprint

> **Formal definition (SSOT):** [Risk Mitigation & Disclaimer Framework §0.1](./docs/architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) — **100%** on-chain risk surface = **88%** pre-broadcast mesh + **12%** systemic residuals · **80/20 Pareto** targets acute microstructure tail in Pillar 3.

### Industry Baseline (~80% or Below)

Traditional DeFi / Agent risk checks rely on **post-hoc analytics** or **mutable pause functions**, leaving gaps for MEV sandwiching, LLM retry token-burn, and session key exploitation.

### SliverVine V1.0 Delivered (**88% Defense Coverage**)

- 🟢 **Sub-ms Pre-Broadcast Severance** — 0-Gas Wasm soil fuse (p50 ~106µs) blocks MEV & toxic fills before mempool queues.
- 🟢 **AI Behavioral Safety Substrate** — 60s LLM cooldown lock prevents token-burning infinite retry loops; dynamic jitter (±2–5 bps) prevents MEV threshold sniping.
- 🟢 **0-Proxy Immutable Gate** — No admin upgrade backdoors; EIP-712 consume-once attestation (`consumed[digest]`).
- 🟢 **Session Key Blast-Radius Isolation** — Scoped `ORDER_EXECUTE` + **$5,000** notional cap (`SESSION_KEY_NOTIONAL_CAP_USD`).
- 🟢 **Oracle & RPC Resilience** — 30s oracle-lag fail-closed (`ORACLE_LAG_DEADLOCK`) + Honeypot trap RPC defense.

### The Remaining **12%** (Why We Need This Foundation Grant)

Honest disclosure of systemic out-of-scope risks: **TEE enclave supply chains**, **multi-RPC eclipse consensus**, and **protocol-level DeFi flash-loan black swans**.

Grant allocation directly fuels **V2.0 R&D**:

1. **TEE / Enclave Hardware Key Isolation** (AWS KMS / SGX Enclaves).
2. **Multi-RPC Quorum Consensus Verification** (anti–RPC eclipse spoofing).
3. **Decentralized PEV (Prevented Exploit Volume) Intelligence Feed**.

### V1.0 Honest Limits (Do Not Over-Claim)

- **Ephemeral Verification Signers** — Bootstrap Ignition Keys (`0x1111…`/`0x2222…`) on Mainnet Gate `0xb174…` are **deliberate public-audit signers**, not production HSM keys
- GMX v2 — **dry-run / Vitest verified**; **no live GM pool fill on One yet** (Grant post-M6)
- Pendle — **Safety Sentinel only**; no APY yield claims
- Dune — **Sepolia live stream**; **42161 SQL pre-compiled** (awaiting One event ingest)
- Reference Agent harness — not an official Virtuals/ElizaOS/LangChain partnership attestation; npm plugins = **V1.1 PR Spec**
- Stylus = **V2.0 roadmap probe**; live gateway = **Solidity Gate**
- Monte Carlo **87.39%** toxic flow blocked — *nominal simulated*; not live TVL saved

---

**SilverVine Labs** · `grants@silvervinelabs.com` · [Live Dune Dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · [Headless Audit Endpoint](https://bedeltawater.slivervine.xyz/api/grant-audit)
