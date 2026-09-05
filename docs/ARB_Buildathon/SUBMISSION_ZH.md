> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[SUBMISSION.md](./SUBMISSION.md)

# SUBMISSION.md：SliverVine Citadel Shield — Arbitrum 上 AI Agent 的預共識意圖防火牆與執行安全原語

| 欄位 | 值 |
|-------|-------|
| **正式名稱** | SliverVine Citadel Shield · SliverVine Protocol（BeDelta Living Water v1.0 / BeΔ） |
| **類別** | Promising Products Track — AI Agents & Financial Primitives |
| **Buildathon** | Arbitrum Open House Singapore Online Buildathon |
| **Live Gate（Sepolia）** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **Live Gate（Arbitrum One）** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Mainnet Ignition Tx [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) |
| **Dune Telemetry** | [Dune Telemetry（Sepolia 即時驗證與生產 SQL 規格）](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) — **即時事件遙測於 Sepolia Testnet 持續串流**（`0xb174…`）；**Arbitrum One（`42161`）SQL Query Indexers 已完整預編譯以供生產事件擷取**，依 [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) |
| **已驗證 Commit** | `main` @ **`1acbc24`**（`bedelta-citadel-core`）· Worker bundle **69.32 KiB gzip**（`pnpm bundle:measure` · `pass: true`） |

> **備註：** 初始主網部署採用 **Ephemeral Verification Signers** — Mainnet Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` 上的 Bootstrap Ignition Keys（`0x1111…`/`0x2222…`）— 以實現**刻意公開可稽核性，同時不暴露生產 HSM 基礎設施**。透過原生治理函式執行金鑰輪替至生產多簽。

> **核心 Pitch：** **SliverVine Citadel Shield** 是 Arbitrum 上 AI Agent 的**預共識意圖防火牆與執行安全原語**。於亞毫秒級（p50 ~106µs）在 Arbitrum Sequencer 佇列**之前**攔截有毒 payload — 透過 `checkSoilResistance()` 實現 0-Gas fail-closed 切斷，並搭配 Arbitrum One（`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`）上不可變的 **EIP-712 consume-once `SliverVineGate`**。

---

## 生產架構宣告

> SliverVine Citadel Shield v1.0 生產範圍的權威定義。**基線：** `main` — **192 test files / 836 PASS Clean（100% PASS）**。

| # | 領域 | 生產宣告 |
|---|--------|------------------------|
| **1** | Ephemeral Ignition Signers | `0x1111…`/`0x2222…` 為 Mainnet Gate `0xb174…` 上的 **Ephemeral Verification Signers** — 公開可稽核性，不暴露生產 HSM。Gate 形態 = consume-once EIP-712；生產輪替透過原生治理。→ [鏈上驗證 — Arbitrum One](#on-chain-verification--arbitrum-one-42161) |
| **2** | GMX v2 Pre-Flight Guards | GMX v2 執行守衛透過 **Vitest CLI + dry-run pipelines** 驗證（`pnpm demo` · `gmx-v2-agent-flow.demo.test.ts` · `gmx-v2-order-payload-guards.ts`）— 於實盤 GM pool 資本部署前進行 **0-Gas pre-flight** 切斷。Mainnet GM fill 排程於 Grant M6 之後。→ [§4 GMX](#4-gmx) |
| **3** | Pendle Core Pillar 3 | **V1.0 雙交付物：**（1）**Pendle Institutional Safety Sentinel** — 60s TTL Oracle Fuse 與 200bps Jitter Guard ·（2）**Pendle AI Guarded Pool Factory** — 透過 `validateAIPoolSelection()` 的 5 項 Invariants · **150 bps** implied-yield shock fuse。AI pool 建立/驗證為 **protocol-tax-free**；透過 Citadel SaaS Request Credits 計量。→ [§3 Pendle](#3-pendle-finance-v10-live--core-pillar-3) |
| **4** | Telemetry Infrastructure | **即時事件遙測於 Sepolia Testnet 持續串流**；**Arbitrum One（42161）SQL Query Indexers 已完整預編譯以供生產事件擷取**。Sepolia 即時串流與 One 生產 SQL 分別記載。→ [§5 Dune](#5-dune-analytics) |
| **5** | Agent Integration | **V1.0 Live Native Integrations** — Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer · `pnpm demo:{wayfinder,elizaos,virtuals,langchain,stabilizer,quad}` · [`src/adapters/`](../../src/adapters/) · **192 test files | 836 PASS Clean（100% PASS）** → [四大 AI Agent 框架](#four-major-ai-agent-frameworks-v10-live--full-quad-coverage) |
| **6** | 0-Gas Off-Chain Severance | Arbitrum One Gate（`0xb174…`）**為 0-Gas Pre-Execution Off-Chain Severance 而設計**。Citadel Risk Gates 於 Edge **在 mempool 提交之前**中止受損 payload 簽名，維持 **L2 state space cleanliness**。→ [鏈上驗證 — Arbitrum One](#on-chain-verification--arbitrum-one-42161) |
| **7** | Dune Analytics | **即時事件遙測於 Sepolia Testnet 持續串流**；**Arbitrum One（42161）SQL Query Indexers 已完整預編譯以供生產事件擷取**。→ [§5 Dune](#5-dune-analytics) |
| **8** | Commercial Model | **v1.0 = SaaS subscription（$0/$49/$299）**；**10 bps CaaS fee-sharing = V2.0 Expansion**。→ [商業模式](#business-model--gtm-strategy) |

---

**哲學：** **BeDelta（BeΔ）** = 市場 Delta 中性與執行安全 · **SliverVine** = 碎片化意圖保護與鋼鐵級交易執行。

**主要執行邊界：** 完整 Arbitrum Native 多協議覆蓋（GMX v2、Pendle、Camelot V3、Radiant Capital、JonesDAO、**Variational Omni RFQ**）+ 跨鏈高頻訂單簿防禦（Hyperliquid L1 Session Key Adapter）+ 可選 Arbitrum-native RFQ OLP hedging。

**Hyperliquid** 為與 Arbitrum 永續流動性生態系並行的**獨立 L1 高頻訂單簿 AppChain** — 透過 session-key adapter 實現跨場域 Δ-neutral hedge，非 Arbitrum-native 執行。

**Variational** 為 **Arbitrum One Omni RFQ** 永續場域 — pre-flight `validateVariationalRFQIntent()` 於 RFQ dispatch 前強制 quote freshness（**>500ms** stale · **>30 bps** oracle drift）與 OLP capacity（**>15%** long-tail depth utilization）。Bits 12-13 涵蓋 Variational RFQ 意圖驗證與 OLP 深度熔斷。

### 量身打造的數學 Invariants

| 協議 | 場域 | 物理邊界 | 模組 |
|----------|-------|-------------------|--------|
| **GMX v2** | Arbitrum One | Pool Imbalance > **0.35** · Collateral Reserve < **105%** | `gmx-v2-invariants.ts` |
| **Pendle** | Arbitrum One | Implied yield shock > **150 bps** | `pendle-pool-factory-adapter.ts` |
| **Camelot V3** | Arbitrum One | Tick depth · slippage > **0.50%** | `camelot-v3-adapter.ts` |
| **Radiant Capital** | Arbitrum One | HF < **1.15** fail-closed | `radiant-lending-adapter.ts` |
| **Jones DAO** | Arbitrum One | NAV deviation > **0.30%** / sandwich | `jones-vault-adapter.ts` |
| **Hyperliquid** | L1 HF Orderbook AppChain | MaxSizePerOrder · rate limit · spread > **20 bps** | `hyperliquid-session-guard.ts` |
| **Variational** | Arbitrum One（Omni RFQ） | Quote stale **>500ms** 或 oracle drift **>30 bps** · OLP depth utilization **>15%**（long-tail）· Bits 12-13 | `variational-rfq-adapter.ts` |

**實體：** SilverVine Labs · **聯絡：** `grants@silvervinelabs.com`
**官方網站：** [silvervinelabs.com](https://silvervinelabs.com)
**Live Dune Telemetry Portal：** [`https://bedeltawater.slivervine.xyz`](https://bedeltawater.slivervine.xyz)（重導至官方 Dune Dashboard）  
**Headless Audit Endpoint：** [`https://bedeltawater.slivervine.xyz/api/grant-audit`](https://bedeltawater.slivervine.xyz/api/grant-audit)  
> **Headless Infrastructure Protocol：** 核心互動為 API/SDK Native（`@slivervine/citadel-sdk`）與 CLI HUD。

**Repo：** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water) · **Judge 快速簡報：** [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md)

---

## 官方 HackQuest 評審標準對照

| 標準 | 證據（CLI / code） |
|-----------|------------------------|
| **Smart Contract Quality** | **Lean On-Chain Gate by Design** — 雙合約核心 [`SliverVineGate.sol`](../../SliverVineGate/src/SliverVineGate.sol)（consume-once EIP-712）+ [`SliverVineAgentPolicyGuard.sol`](../../contracts/src/SliverVineAgentPolicyGuard.sol)（[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Emerging Draft policy pre-screen）· immutable · non-custodial · no proxy — 使 Edge `checkSoilResistance()` 維持 **p50 ~106µs** · **Arbitrum One Mainnet Ignition Gate：ChainID 42161 上已驗證 Non-Custodial Gate** — Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Arbiscan Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · Consume-once 與 replay-denial invariant lemmas 透過原生 Foundry test suite 100% code-verified（[`SliverVineGate.t.sol`](../../SliverVineGate/test/SliverVineGate.t.sol) 與 [`SliverVineGate.invariant.t.sol`](../../SliverVineGate/test/SliverVineGate.invariant.t.sol)）· **192 test files \| 836 PASS Clean（100% PASS）** |
| **Real Problem Solving** | AI Agent pre-broadcast death window — 於 Bundler / mempool 之前透過 `checkSoilResistance()` 實現 0-Gas fail-closed sub-ms severance · **AI Behavioral Safety Substrate**（LLM back-off cooldown + dynamic threshold jitter）· `lostUsd ≡ 0` in-flight invariant |
| **Innovation and Creativity** | Arbitrum 上 AI Agent 的 **Pre-Consensus Intent Firewall** — **Pre-Consensus Intent Clearing**（p50 ~106µs，於 Sequencer queues 之前 · 0-Gas）· **PEV（Prevented Exploit Volume）** telemetry primitive for Dune/indexers · Pendle PT/YT 的 **Yield Safety Sentinel**（expiry blackhole / oracle decoupling guard — 非 yield 競品）· **Zero-Touch Plugin Standard**：`withCitadelShield`（[`src/sdk/decorator.ts`](../../src/sdk/decorator.ts)）· Wasm Edge（`pkg/soil_core.wasm`）· [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Draft |
| **Product-Market Fit** | GMX v2 +10 bps `uiFeeReceiver` builder lane（[`gmx-v2-order-payload.ts`](../../src/services/adapters/gmx-v2-order-payload.ts)）· **Opt-In Pillar 1** ZeroDev Kernel v3 AA（EIP-7702 = ⏳ V1.5 post-grant）· **V1.0 Live Native Agent Integrations** — Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer（[`src/adapters/`](../../src/adapters/) · `pnpm demo:{wayfinder,elizaos,virtuals,langchain,stabilizer,quad}`）· **`withCitadelShield`** zero-touch decorator（[`src/sdk/decorator.ts`](../../src/sdk/decorator.ts)）· **Pendle Core Pillar 3（V1.0）** — **Institutional Safety Sentinel**（60s TTL Oracle Fuse · 200bps Jitter Guard）+ **AI Guarded Pool Factory**（`validateAIPoolSelection()` · 5 Invariants）（[`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts) · [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts)） |

#### Innovation and Creativity — 概念框架

- **Pre-Consensus Intent Clearing**：於 Cloudflare Edge **p50 ~106µs** 攔截有毒 AI Agent payload，**在**其抵達 Arbitrum Sequencer queues、Bundler ingress 或 public mempools **之前** — **0-Gas loss prevention**（fail-closed severance； doomed UserOps 不浪費 Bundler gas）。
- **PEV（Prevented Exploit Volume）— Dune Analytics Primitive**：引入 **PEV** 作為結構化遙測指標 — 於 pre-broadcast 被阻擋的有毒意圖之名目 USD 成交量 — 可透過 `RiskTripBlocked` / soil-trip events 與 grant-audit JSON（`duneTelemetry`）索引。見 [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md)。
- **Yield Safety Sentinel for Pendle**：Off-chain circuit breaker 守護 Pendle **PT/YT** pool 持倉免受 **expiry blackholes** 與 **oracle decoupling** 影響 — 外加 agent pool 建立 pre-flight 的 **Pendle AI Guarded Pool Factory**（[`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts)）— 在不與 YT yield 競爭的前提下保護資本免於清算連鎖（[`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts)）。
- **Zero-Gas Pre-Broadcast Circuit Breaker**：與需消耗 gas 並等待區塊確認的 on-chain pause functions 不同，Citadel 於共識 ingress **之前**以 sub-ms latency 切斷 EIP-712 signing channel。
- **Autonomous Reflex Arc（Agentic Safety Substrate）**：AI Agent 的 off-chain「脊髓反射」— 在不消耗 LLM tokens 或增加 cloud round-trips 的情況下攔截有毒意圖。

#### Innovation & Real Problem Solving — AI Behavioral Safety Substrate

1. **Native LLM Back-off & Retry Intercepts**：`withCitadelShield`（[`src/sdk/decorator.ts`](../../src/sdk/decorator.ts)）中每 `agentId` 啟用 **60 秒 cooldown lock**，防止 token-burning infinite retry loops 與交易 fail-closed 時的 **RPC Rate-Limit Self-DoS** — `[Citadel Back-off] MANDATORY_COOLDOWN_ACTIVE` 於所有 V1.0 agent adapters 呈現（`pnpm demo:elizaos -- --trip` · `pnpm demo:virtuals -- --trip` · `pnpm demo:langchain -- --trip`）。
2. **Non-Semantic Bytecode Predicate Assertions**：於 **p50 ~106µs** Edge Wasm 評估**原始 bytecode parameters**，而非自然語言 — 於 signing layer 免疫 **Indirect Prompt Injections**（[Technical Specification §0.1](../architecture/01_TECHNICAL_SPECIFICATION.md#01-bytecode-predicate-verification-v10--erc-7715--post-grant-design-spec)）。
3. **Dynamic Threshold Obfuscation**：對 `MAX_SLIPPAGE` / depth bounds 施加密碼學 pseudo-random **±2–5 bps jitter**（[`soil-threshold-jitter.ts`](../../src/services/risk-control-lib/soil-threshold-jitter.ts)），防止 MEV searchers 在 off-chain 預測精確 **50 bps** cutoff boundaries。

#### Wayfinder（V1.0 Live · Arbitrum Native AI Agent Engine）

Citadel 是 **Arbitrum One（`42161`）** 上 Wayfinder Agent Engine 的**原生 pre-execution risk firewall**：

- **Native adapter SSOT：** [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) — `wayfinderCitadelShieldHook` 於 on-chain route dispatch 之前整合 `checkSoilResistance()`（Pillar 3 soil fuse）與 `verifyAgentIntent()`（8-dimension validation）
- **0-Gas fail-closed：** soil trips 與 session-key violations 於 pre-broadcast 切斷 EIP-712 signing channel — blocked paths 不消耗 Sequencer gas
- **Tests：** [`tests/adapters/wayfinder-shield.test.ts`](../../tests/adapters/wayfinder-shield.test.ts) — ALLOW · toxic soil FAIL_CLOSED · session-key clip/expiry FAIL_CLOSED

```bash
pnpm demo:wayfinder              # Normal Wayfinder route interception → ALLOW
pnpm demo:wayfinder -- --trip    # 0-Gas Fail-Closed soil trip interception
pnpm demo:wayfinder -- --stabilizer           # Sepolia Stabilizer 1:1 stablecoin swap → ALLOW
pnpm demo:wayfinder -- --stabilizer --trip      # Depleted pool / reserve floor → FAIL_CLOSED
```

**AI Agent 執行流程（Wayfinder / Virtuals）：**

```text
[ Wayfinder Agent Engine / Virtuals Agent Swarm ]
                    │
                    ▼
        wayfinderCitadelShieldHook  (wayfinder-shield.ts)
                    │
                    ▼
        verifyAgentIntent()  (8-dimension gate)
                    │
                    ▼
        checkSoilResistance()  (Pillar 3 soil fuse · p50 ~106µs)
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     FAIL_CLOSED           ALLOW
     (0-Gas intercept)         │
                               ▼
                    [ On-Chain Execution · Arbitrum 42161 ]
```

#### Stabilizer Protocol（V1.0 Live · Universal Sepolia Testnet Sandbox）

**Stabilizer on Arbitrum Sepolia（`421614`）為 AI Agent 的 Universal Testnet Sandbox 與 Cross-Pass Interoperability Layer。** Citadel 於 testnet arbitrage 與 rebalancing legs 強制 **0-Gas Pre-Execution Fail-Closed Protection**：

| Leg | Sepolia 角色 | SSOT |
|-----|-----------------|------|
| **Stabilizer** | 1:1 zero-slippage USDZ / USDC / USDT / USDS routing | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) |
| **GMX v2** | Sepolia shadow-margin · price-impact pre-flight | `gmx-v2-order-payload-guards.ts` · `gmx-v2-agent-flow.demo.test.ts` |
| **Pendle** | Testnet Guarded Pool Factory · 60s TTL oracle fuse | [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) · `pendle-ai-agent-flow.demo.test.ts` |

**DX 優勢：** Demo 與 audit 執行於 **live Sepolia contracts**，無 mainnet gas 或資本摩擦 — 使用與 Arbitrum One（`42161`）**相同的 `checkSoilResistance()` bytecode 與 risk gates**。

```bash
pnpm demo:gmx                   # GMX v2 shadow margin · cross-venue slippage → ALLOW
pnpm demo:gmx -- --trip         # Toxic price-impact soil trip → FAIL_CLOSED
pnpm demo:hl                    # Hyperliquid session key auth → ALLOW
pnpm demo:hl -- --trip          # WS stale / depth guard trip → FAIL_CLOSED
pnpm demo:pendle                # Pendle guarded pool factory → ALLOW
pnpm demo:camelot               # Camelot V3 concentrated liquidity → ALLOW
pnpm demo:camelot -- --trip     # Depleted CL / slippage trip → FAIL_CLOSED
pnpm demo:radiant               # Radiant Capital HF guard → ALLOW
pnpm demo:radiant -- --trip     # HF < 1.15 / cross-chain boundary → FAIL_CLOSED
pnpm demo:jones                 # Jones DAO vault rebalance → ALLOW
pnpm demo:jones -- --trip       # Flash-loan sandwich trip → FAIL_CLOSED
pnpm demo:stabilizer              # Stabilizer 1:1 swap → ALLOW
pnpm demo:stabilizer -- --trip    # USDZ de-peg + SOIL_RESISTANCE_TRIP → FAIL_CLOSED + 60s cooldown
pnpm demo                         # GMX v2 + HL + Pendle Tri-Pillar Vitest matrix (12 scenarios)
```

- **Cross-Pass routing：** Stabilizer stablecoin rebalance → GMX v2 shadow-margin leg → Pendle guarded pool intent → Camelot V3 spot liquidity — 每跳於 broadcast 前由 `checkSoilResistance()` 門控
- **Tests：** [`tests/adapters/stabilizer-adapter.test.ts`](../../tests/adapters/stabilizer-adapter.test.ts) · [`tests/adapters/camelot-v3-adapter.test.ts`](../../tests/adapters/camelot-v3-adapter.test.ts) · **192 test files | 836 PASS Clean（100% PASS）**

#### Camelot V3（V1.0 Live · Arbitrum Native Spot Liquidity）

Citadel 是 **Arbitrum One（`42161`）** 上 Camelot V3 spot swaps 的 **pre-execution concentrated-liquidity firewall**：

| Layer | 模組 | 行為 |
|-------|--------|----------|
| **V3 Liquidity Guard** | [`camelot-v3-adapter.ts`](../../src/adapters/camelot/camelot-v3-adapter.ts) | `verifyCamelotPoolLiquidity()` · `verifyCamelotTickDepth()` — CL tick depth · directional dynamic fee |
| **Soil fuse** | `checkSoilResistance()` | depleted depth / cross-venue slippage 時 0-Gas fail-closed |
| **CLI Demo** | `pnpm demo:camelot` | WETH/USDC spot swap guard · `--trip` for FAIL_CLOSED |

#### Radiant Capital（V1.0 Live · Arbitrum Native Lending）

| Layer | 模組 | 行為 |
|-------|--------|----------|
| **HF Guard** | [`radiant-lending-adapter.ts`](../../src/adapters/radiant/radiant-lending-adapter.ts) | `verifyRadiantHealthFactor()` — HF &lt; 1.15 fail-closed · cross-chain liquidation boundary |
| **Soil fuse** | `checkSoilResistance()` | depleted collateral depth 時 0-Gas fail-closed |
| **CLI Demo** | `pnpm demo:radiant` | WETH/USDC borrow guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/radiant-lending-adapter.test.ts`](../../tests/adapters/radiant-lending-adapter.test.ts)

#### Jones DAO（V1.0 Live · Arbitrum Vault Strategies）

| Layer | 模組 | 行為 |
|-------|--------|----------|
| **Vault Guard** | [`jones-vault-adapter.ts`](../../src/adapters/jones/jones-vault-adapter.ts) | `verifyJonesVaultSharePrice()` — share slippage cap · flash-loan sandwich trip |
| **Soil fuse** | `checkSoilResistance()` | toxic vault depth 時 0-Gas fail-closed |
| **CLI Demo** | `pnpm demo:jones` | jGLP rebalance guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/jones-vault-adapter.test.ts`](../../tests/adapters/jones-vault-adapter.test.ts)

#### Four Major AI Agent Frameworks（V1.0 Live · Full Quad Coverage）

**全球首個原生支援四大 AI Agent 框架（Wayfinder、ElizaOS、Virtuals、LangChain）的 Pre-Execution Risk Gateway。**

| 框架 | Adapter SSOT | Entry point | Standalone CLI |
|-----------|--------------|-------------|----------------|
| **Wayfinder** | [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) | `wayfinderCitadelShieldHook` | `pnpm demo:wayfinder` |
| **ElizaOS** | [`elizaos-citadel-plugin.ts`](../../src/adapters/elizaos/elizaos-citadel-plugin.ts) | `evaluateElizaCitadelAction()` | `pnpm demo:elizaos` |
| **Virtuals (GAME)** | [`virtuals-game-adapter.ts`](../../src/adapters/virtuals/virtuals-game-adapter.ts) | `evaluateVirtualsGameTask()` | `pnpm demo:virtuals` |
| **LangChain / LangGraph** | [`langchain-citadel-tool.ts`](../../src/adapters/langchain/langchain-citadel-tool.ts) | `CitadelRiskGuardTool` | `pnpm demo:langchain` |
| **Stabilizer** | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) | `evaluateStabilizerSwapGuard()` | `pnpm demo:stabilizer` |

```bash
pnpm demo:wayfinder · pnpm demo:elizaos · pnpm demo:virtuals · pnpm demo:langchain · pnpm demo:stabilizer
pnpm demo:quad              # All four AI frameworks combined → ALLOW
pnpm demo:quad -- --trip    # All four frameworks → FAIL_CLOSED
pnpm demo:matrix                    # Full 7-protocol matrix (--loop=all)
pnpm demo:matrix -- --loop=perp     # Pendle → GMX → dual perp hedge (HL + Variational)
pnpm demo:matrix -- --loop=perp --hedge=variational   # Variational Omni RFQ hedge leg
pnpm demo:matrix -- --loop=perp --hedge=hyperliquid   # Hyperliquid L1 hedge leg only
pnpm demo:matrix -- --loop=perp --hedge=both          # HL + Variational (default perp hedge)
pnpm demo:matrix -- --loop=spot     # Camelot → Radiant → Jones spot loop
pnpm demo:matrix -- --healthy-only  # Nominal PASS (no R20 sever)
```

- **Tests：** [`wayfinder-shield.test.ts`](../../tests/adapters/wayfinder-shield.test.ts) · [`elizaos-plugin.test.ts`](../../tests/adapters/elizaos-plugin.test.ts) · [`virtuals-adapter.test.ts`](../../tests/adapters/virtuals-adapter.test.ts) · [`langchain-tool.test.ts`](../../tests/adapters/langchain-tool.test.ts) · [`stabilizer-adapter.test.ts`](../../tests/adapters/stabilizer-adapter.test.ts) · **192 test files | 836 PASS Clean（100% PASS）**

#### Supplementary Agent Demos

- **V1.0 delivered：** [`src/adapters/`](../../src/adapters/) 中所有 native integrations · [`withCitadelShield`](../../src/sdk/decorator.ts) · **3-Tier Demo Suite** — Tier 1 Native Protocols：`pnpm demo:{gmx,hl,pendle,camelot,radiant,jones,matrix}` · Tier 2 Agents：`pnpm demo:{wayfinder,elizaos,virtuals,langchain,quad}` · Tier 3：`pnpm demo:{stabilizer,e2e}` — CLI 可重現 ALLOW / `--trip` FAIL_CLOSED · Worker bundle **69.32 KiB gzip**（`pnpm bundle:measure`）
- **Supplementary harness：** [`examples/agent-interceptor-demo.ts`](../../examples/agent-interceptor-demo.ts)（`tsx examples/agent-interceptor-demo.ts`）· [`examples/adapters/`](../../examples/adapters/) 中 legacy TS/Python scripts

---

## Executive Summary & One-Page Strategic Memo

**官方 pitch：** Arbitrum 上 AI Agent 的 Sub-ms 0-Gas Pre-Broadcast Safety Citadel & Risk Navigator — 見上方 metadata table。

| Judge pointer | SSOT document |
|---------------|---------------|
| Three Pillars · R01–R20 | [Technical Specification §0–§3](../architecture/01_TECHNICAL_SPECIFICATION.md) |
| CLI Tier 0–5 verification | [Verification Matrix](../VERIFICATION_MATRIX.md) |
| Dune telemetry · SQL panels | [Dune Dashboard Specification](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) |
| Pendle × GMX cross-guard | [§ Core Risk Decision Matrix](#core-risk-decision-matrix-evaluatependlegmxcrossguard) · [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) |
| [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) agent policy | [Technical Specification §0.1](../architecture/01_TECHNICAL_SPECIFICATION.md#01-bytecode-predicate-verification-v10--erc-7715--post-grant-design-spec) |
| Institutional DD / Basel mapping | [Due Diligence Memorandum](../audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) |
| **80/20 boundaries & V2.0 R&D** | [Risk Spectrum §0.1](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) · [§ 88% Defense Mesh](#88-defense-mesh--12-post-grant-rd-roadmap) · [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md) |

基於 Santenmoku internal engine（p50 ~106µs）、[`@slivervine/citadel-sdk`](../../src/sdk/README.md) 與 consume-once EIP-712 Gate attestation — SliverVine 於 mempool 或 bundler ingress **之前**攔截 AI trade intents。深度敘述：[Problem / Solution](#the-problem) · [Sponsor Integration Matrix](#sponsor-integration-matrix)。

### The Problem

AI Trading Agents 將 dynamic yield tokens（如 Pendle PTs）、high-leverage perpetuals（如 GMX）與 cross-chain liquidity 組合成自動化策略。然而，現有風控要麼是 reactive（on-chain liquidation 於損害已造成後），要麼是粗粒度的「transaction blockers」，無法區分 **risk-expanding** 與 **risk-reducing** 動作。於波動期阻擋 de-leveraging transaction 會將 AI agent 困於高風險持倉，加速 forced liquidation（The Observatory Paradox）。

* **Real-World Exploit Context**：Arbitrum 與 Base 上的 Autonomous AI Agents（如 Virtuals ecosystem agents 與 Clanker smart accounts）面對未緩解的 pre-broadcast vulnerabilities，prompt injections 與 sandwich bots 利用 execution latency，於 mempool confirmation 前導致 unauthorized trade execution 與 slippage losses。

### The Solution: Intent-Aware Risk Navigation

SliverVine 將 risk management 從「naive blocking」轉為 **Intent-Aware Navigation**：

1. **Observability**：即時監控 Pendle PT yield jitter/expiry dynamic fees、GMX maintenance margin buffers 與 liquidity depth — [Pendle registry SSOT](../../src/adapters/pendle/pendle-pt-registry.ts) · [Technical Specification §1](../architecture/01_TECHNICAL_SPECIFICATION.md#1-core-product-identity)。
2. **Intent Taxonomy**：方向性區分，將 `RISK_INCREASE`（`open`/`increase` → strict Fail-Closed evaluation）與 `RISK_DECREASE`（`close`/`reduce` → greenlighted with safety routing）分離 — [§ Core Risk Decision Matrix](#core-risk-decision-matrix-evaluatependlegmxcrossguard)。
3. **Shadow Margin Engine**：Pre-execution PT exit proceeds vs GMX maintenance margin — [`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts) · [Technical Specification §3.1](../architecture/01_TECHNICAL_SPECIFICATION.md#31-microsecond-moats)。

### Legal & Regulatory Positioning

> **DISCLAIMER**：SliverVine Protocol 僅提供 software-based risk analytics、monitoring、policy enforcement 與 execution-safety tooling。不提供 asset custody、underwriting、indemnity、reimbursement、profit guarantees 或任何 insurance-like coverage。所有 risk decisions 為 algorithmic，基於 user-defined policy parameters 與 protocol-aware market signals。SLA commitments 嚴格適用於 system availability、sub-millisecond latency、logging integrity 與 observability uptime。所收費用為 software access、API 與 computational SLA routing fees，不產生補償金融損失之義務。

---

## 88% Defense Mesh & 12% Post-Grant R&D Roadmap

> **Formal definition（SSOT）：** [Risk Mitigation & Disclaimer Framework §0.1](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee) — **100%** on-chain risk surface = **88%** pre-broadcast interception mesh + **12%** insurmountable systemic residuals · **80/20 Pareto**（microstructure loss concentration）於 Pillar 3 內針對 acute 20% tail。

### Industry Baseline（~80% or Below）

傳統 DeFi / Agent risk checks 依賴 **post-hoc analytics** 或 **mutable pause functions**，為 MEV sandwiching、LLM retry token-burn 與 session-key blast-radius expansion 留下可利用缺口。

### SliverVine V1.0 Delivered（**88% Defense Coverage**）

| Layer | Defense |
|-------|---------|
| 🟢 **Sub-ms Pre-Broadcast Severance** | 0-Gas Wasm soil fuse（`checkSoilResistance()` p50 ~106µs）於 mempool / Sequencer queues **之前**阻擋 MEV 與 toxic fills |
| 🟢 **AI Behavioral Safety Substrate** | **60s LLM cooldown lock** 防止 token-burning infinite retry loops；**dynamic ±2–5 bps jitter** 防止 MEV threshold sniping（[`decorator.ts`](../../src/sdk/decorator.ts) · [`soil-threshold-jitter.ts`](../../src/services/risk-control-lib/soil-threshold-jitter.ts)） |
| 🟢 **0-Proxy Immutable Gate** | 無 admin upgrade backdoors；live **Arbitrum One** Gate 上 EIP-712 consume-once attestation（`consumed[digest]`） |
| 🟢 **Session Key Blast-Radius Isolation** | Scoped `ORDER_EXECUTE` + **$5,000** notional cap（`SESSION_KEY_NOTIONAL_CAP_USD`）限制 key-compromise damage |
| 🟢 **Oracle & RPC Resilience** | **30s** oracle-lag fail-closed（`ORACLE_LAG_DEADLOCK` / `ORACLE_LAG_DEADLOCK_MS = 30_000`）+ **Honeypot trap RPC** defense（`evaluateRpcDefenseGate()` · 99% synthetic slippage decoy） |

> **Engineering scope boundary：** Citadel 為 **pre-consensus intent firewall**，非 universal risk insurer。V1.0 建模 **88% mesh coverage**，並披露 **12%** systemic residual tail — 見 [Risk Framework §0.1](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-citadel-shield-does--and-does-not--guarantee)。

### The Remaining **12%**（Why We Need This Foundation Grant）

Residual systemic out-of-scope risks：**TEE enclave supply chains**、**multi-RPC eclipse consensus** 與 external venues（GMX / Hyperliquid）上的 **protocol-level DeFi flash-loan black swans**。

Grant allocation 直接推動 **V2.0 R&D Roadmap**：

1. **TEE / Enclave Hardware Key Isolation** — 超越 Bootstrap Ignition Keys 的 AWS KMS / SGX Enclaves。
2. **Multi-RPC Quorum Consensus Verification** — 於 Wasm evaluation 前防護 RPC eclipse spoofing。
3. **Decentralized PEV（Prevented Exploit Volume）Intelligence Feed** — 即時 Dune telemetry 接入 decentralized agent alert networks。

**V1.0 production scope：** Mainnet Gate 上 Ephemeral Ignition Signers（`0x1111…`/`0x2222…`）· GMX v2 dry-run/Vitest pre-flight guards（mainnet GM fill post-M6）· **Pendle Institutional Safety Sentinel** + **Pendle AI Guarded Pool Factory** · **V1.0 Live Native Agent Integrations**（Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer）· Dune Sepolia live stream + 42161 SQL pre-compiled · v1.0 SaaS $0/$49/$299（10 bps CaaS = V2.0）· Stylus V2.0 dual-execution coprocessor（`pnpm build:stylus`；EIP-1967 upgradeable proxy path；**9/9（50bps）**）· **automated R20 severance on `FLAGS_*` trips** · **30s sliding-window pending OI defense** · Monte Carlo 87.39% toxic flow blocked（10,000-run simulation；nominal modeled capital）· **dual-branch strategy**（`main` 生產基線 + feature branch 上游插件整合）。

---

## Architectural SSOT & Hardened Metrics

* **Test Suite**：**192 test files | 836 PASS Clean（100% PASS）** — 重新執行 `pnpm test -- --run` 確認。完整 matrix：[Verification Matrix](../VERIFICATION_MATRIX.md)。
* **Dual-Demo Architecture**：**`pnpm demo`** — 12 Tri-Pillar ANSI scenarios（GMX v2 price impact / Data Streams lag / delever · HL EIP-712 session key / WS stale / GateLockout · Pendle AI guarded pool / 60s TTL stale oracle）· zero-I/O sync hot-path **p50 ~106µs** · **`pnpm demo:e2e`** — 5-step macro cross-venue lifecycle · **`pnpm demo:wayfinder`** — Arbitrum `42161` 上 Wayfinder route interception（normal ALLOW · `--trip` 0-Gas FAIL_CLOSED）。
* **Formal Verification**：Consume-once 與 replay-denial invariant lemmas 透過原生 Foundry test suite 100% code-verified（[`SliverVineGate.t.sol`](../../SliverVineGate/test/SliverVineGate.t.sol) 與 [`SliverVineGate.invariant.t.sol`](../../SliverVineGate/test/SliverVineGate.invariant.t.sol)）· [Technical Specification §3](../architecture/01_TECHNICAL_SPECIFICATION.md#3-cross-venue-risk-engine--defense-matrix-r01r20)。
* **Game-Theoretic Simulation**：10,000 Monte Carlo runs · **87.39% toxic flow blocked** · $9.88M **nominal simulated** LP capital — [`game_theory_simulation_results.json`](../telemetry/game_theory_simulation_results.json) *（simulation only；not live savings）*。
* **Deployments**：Arbitrum One Mainnet Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Ignition Tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · Arbitrum Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Robinhood Chain `46630`/`4663` — [On-Chain Verification](#on-chain-verification--arbitrum-one-42161) · [Sepolia](#on-chain-verification--arbitrum-sepolia-421614)。
* **0-Gas off-chain severance：** Arbitrum One Gate（`0xb174…`）**為 0-Gas Pre-Execution Off-Chain Severance 而設計**。Citadel Risk Gates 於 Edge **在 mempool 提交之前**中止受損 payload 簽名，維持 **L2 state space cleanliness**。

### Core Risk Invariants（Judge Quick Reference）

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0
$$

$$
\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}
$$

$$
t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s} \ll t_{\text{mempool\_broadcast}}
$$

完整推導：[Technical Specification §3.1](../architecture/01_TECHNICAL_SPECIFICATION.md#31-microsecond-moats) · [Verification Matrix](../VERIFICATION_MATRIX.md) · [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md)。

**Latency SSOT：** p50 ~106 µs Edge `checkSoilResistance()` · Wasm warm &lt;60 µs · M2M reflex `src/core/agent-citadel-guard.ts` &lt;12 µs。完整規格：[`01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md)。

### Version Roadmap SSOT（V1.0 / V1.5 / V2.0）

| Horizon | Status | Scope |
|---------|--------|-------|
| **V1.0** | ✅ Code-Verified Live Baseline | Arbitrum One GMX v2 ETH/USDC GM + HL 1× short · Wasm `checkSoilResistance()` p50 ~106µs · **V1.0 Live Native Agent Integrations** — Wayfinder · ElizaOS · Virtuals · LangChain · Stabilizer（[`src/adapters/`](../../src/adapters/)）· [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Draft policy pre-validation · EIP-712 consume-once Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Dune + SHA-256 dual-source `GET /api/grant-audit` · **Cloudflare SaaS $0/$49/$299** · **192 test files \| 836 PASS Clean（100% PASS）** · **dual-branch strategy** |
| **V1.5** | ⏳ Roadmap Spec | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) fleet enforcement for multi-agent swarms · EIP-7702 EOA → Agent Smart Account · Prompt Injection Defense Circuit（`severSigningChannel()` sub-100µs） |
| **V2.0** | ⏳ Design Spec | Institutional **CaaS**（`@slivervine/citadel-sdk`）for AI DEXs and Orbit L3s · **10 bps protocol authorization fee** on pre-execution risk checks — **explicitly V2.0；not v1.0 SaaS** |

Optional bridges（Robinhood / Across）為 **Pillar 2 Reference Escort Adapters** — 不定義產品身份。Aave/Morpho APY figures 為 *（Hurdle-rate probe only — not a yield-stacking product track）*。

---

## Ecosystem Synergy — Judge Persona Quick Map

| Ecosystem | SliverVine 角色 | Why they win together | SSOT |
|-----------|---------------------|----------------------|------|
| **Arbitrum** | **42161** 上 pre-consensus execution primitive | Live immutable Gate + Edge clearing 於 Sequencer ingress 之前 | Mainnet Tx · `SliverVineGate.sol` |
| **Pendle** | **Institutional Sentinel + AI Guarded Pool Factory**（V1.0 Core Pillar 3） | 60s TTL Oracle Fuse · 200bps Jitter Guard · `validateAIPoolSelection()` 5 Invariants · protocol-tax-free via SaaS Request Credits | `pendle-market-oracle-adapter.ts` · `pendle-pool-factory-adapter.ts` · `pendle-gmx-cross-guard.ts` |
| **Dune** | **PEV** + `RiskTripBlocked` telemetry | Indexes off-chain blocked attacks；Sepolia live · One SQL spec | `DUNE_DASHBOARD_SPECIFICATION.md` |
| **GMX** | Builder lane + pre-broadcast soil fuse | +10 bps `uiFeeReceiver`；blocks toxic GM intents pre-DataStore | `gmx-v2-order-payload.ts` |
| **Wayfinder** | **42161** 上 native pre-execution risk firewall | `wayfinderCitadelShieldHook` · soil fuse + 8-dimension intent gate · 0-Gas fail-closed | `wayfinder-shield.ts` · `pnpm demo:wayfinder` |
| **Stabilizer** | **421614** 上 universal Sepolia sandbox & cross-pass layer | Stabilizer → GMX v2 → Pendle routing · identical `checkSoilResistance()` gates | `stabilizer-adapter.ts` · `pnpm demo:stabilizer` |
| **Virtuals / ElizaOS / LangChain** | Full quad-framework pre-consensus firewall | `evaluateVirtualsGameTask()` · `evaluateElizaCitadelAction()` · `CitadelRiskGuardTool` | `virtuals-game-adapter.ts` · `elizaos-citadel-plugin.ts` · `langchain-citadel-tool.ts` · `pnpm demo:virtuals` · `pnpm demo:elizaos` · `pnpm demo:langchain` |
| **Robinhood** | Pillar 2 compliance escort | Outbound-only `46630/4663 → 42161` · inbound AML BLOCK | `across-ingress-bridge.ts` |

---

## Sponsor Integration Matrix

### 1. Arbitrum One / Sepolia（Core Base）

* **Lean On-Chain Gate by Design**：On-chain logic 嚴格 **immutable and non-custodial**（no proxy、no ETH custody），使 hot path 留在 Cloudflare Edge — `checkSoilResistance()` **p50 ~106µs**。Dual-contract core：`SliverVineGate.sol`（consume-once attestation，Mainnet + Sepolia `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`）+ [`SliverVineAgentPolicyGuard.sol`](../../contracts/src/SliverVineAgentPolicyGuard.sol)（[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Emerging Draft agent-policy validation — **not a finalized standard**）。
* **Mechanism**：於 sub-millisecond off-chain pipeline（`src/core/agent-citadel-guard.ts`）攔截 AI Trade Intents，於 settlement-layer EIP-712（`SliverVineCitadel` domain）之前驗證 soil fuse + deadman switch（0-Gas Fail-Closed）。

### 2. Robinhood Chain（Chain ID: 46630 / 4663）— Pillar 2 Reference Escort Adapter

* **Integration**：Pillar 2 Ingress Bridge Adapter（`src/adapters/across-ingress-bridge.ts`）與 R20 Circuit Breaker Sever Pipeline（`src/services/root-protection-lib/circuit-breaker-sever.ts`）。
* **Mechanism**：**Optional Pillar 2 Reference Escort Adapter**（非 protocol identity）。僅 outbound `46630`/`4663` → `42161`。當 deadlock condition R20 觸發時，`severSigningChannel()` 立即 sever hot-key signature pipelines，將 engine 鎖定為 read-only observer mode。**Pending-Capital Recognition Invariant：** `lostUsd ≡ 0` on `IN_FLIGHT_BRIDGE_CAPITAL` until explicit timeout。

### 3. Pendle Finance（V1.0 Live · Core Pillar 3）

V1.0 交付 **兩項互补 Pendle integrations** — institutional safety layer，非 yield product：

**1. Pendle Institutional Safety Sentinel** — 60s TTL Oracle Fuse & 200bps Jitter Guard

* Citadel 作為現有 PT/YT exposure 的 **institutional pre-execution safety layer** — **60s TTL Oracle** 搭配 **`PENDLE_ORACLE_STALE`** soil fuse · expiry **<7d** + yield jitter **>200 bps** → fail-closed
* **Dynamic Market Oracle**（[`pendle-market-oracle-adapter.ts`](../../src/adapters/pendle/pendle-market-oracle-adapter.ts)）：zero-I/O sync `ingest()` / `resolve()` in-memory cache · **TTL default 60s**
* **Cross-Guard**（[`pendle-gmx-cross-guard.ts`](../../src/guards/pendle-gmx-cross-guard.ts)）：Shadow Margin vs GMX maintenance · Observatory Paradox fix（`close`/`reduce` greenlit）
* **Expiry Guard**（[`pendle-pt-expiry-guard.ts`](../../src/adapters/pendle/pendle-pt-expiry-guard.ts)）：`evaluatePendlePtExpiryRiskFromRegistry`
* 防禦 PT/YT expiry blackholes 與 oracle decoupling — **not a Pendle YT competitor**

**2. Pendle AI Guarded Pool Factory** — 透過 `validateAIPoolSelection()` 的 5 Invariants

* **Adapter SSOT**（[`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts)）：AI agent pool selection 的 sync pre-flight validation at **p50 ~106µs**
* 透過 wired into `checkSoilResistance()` 的 optional `pendlePoolFactory` soil probe 門控 **`PENDLE_CREATE_POOL`** / **`PENDLE_ADD_LIQUIDITY`** intents
* **5 Pool Invariants：** maturity ≥7d · yield drift ≤300bps · $100K min initial liquidity · underlying asset whitelist（`eETH` / `ETH` / `USDC`）· supported intent taxonomy
* Demo: [`tests/demo/pendle-ai-agent-flow.demo.test.ts`](../../tests/demo/pendle-ai-agent-flow.demo.test.ts) · [`tests/adapters/pendle-pool-factory.test.ts`](../../tests/adapters/pendle-pool-factory.test.ts)

> **DX & Pricing：** 透過 **Pendle AI Guarded Pool Factory** 的 AI Agent pool creation 與 parameter validation 為 **100% free from protocol tax**，透過 Citadel 的 **Cloudflare-style SaaS Request Credits**（$0 / $49 / $299 tiers）無縫計量。

* **Integration（P0/P1 Code-Verified）**:
  * **Registry SSOT**: [`pendle-pt-registry.ts`](../../src/adapters/pendle/pendle-pt-registry.ts) · `hydrateFromOracle` · `resolvePendlePtMarketState`
  * **Shared Types**: [`core/pendle-types.ts`](../../src/core/pendle-types.ts)
* **Soil Fuse Wiring（Fail-Closed）**: `pendleOracle`、`pendleCrossGuard` 與 `pendlePoolFactory` probes wired into `checkSoilResistance()`（`collectExternalSoilFlags`）— 當 feed missing、TTL-expired 或 carries invalid fields（zero/negative price 等）時 emit **`PENDLE_ORACLE_STALE`**
* **Performance**: Oracle resolution 為 **purely cached / synchronous** — hot path 上無 `fetch()`；與 Shield **p50 ~106µs** budget 共存。
* **Arbitrum One PT Markets（Registry SSOT）**:
  * **PT-eETH:** `0x8B330d3A50a624f1fE1744d037048BdBc9664E5D`
  * **PT-USDC:** `0x156291C6e10E8a1B9f95475A9C0c5E3eCe1d1e44`
* **Mechanism**: 從 registry 解析 real Pendle PT market parameters（可選 oracle hydration），監控 maturity boundaries（&lt;7 days）與 yield jitter（&gt;200 bps），整合 dynamic fee curve decay 與 Observatory Paradox fix（`close`/`reduce` −40 score discount）的 Shadow Margin cross-guard。
* **Vitest Coverage**:
  * [`tests/adapters/pendle-market-oracle.test.ts`](../../tests/adapters/pendle-market-oracle.test.ts) — oracle hydration · TTL stale · soil `PENDLE_ORACLE_STALE` trip
  * [`tests/adapters/pendle-pool-factory.test.ts`](../../tests/adapters/pendle-pool-factory.test.ts) — AI pool selection · yield drift · maturity cliff · soil fuse
  * [`tests/adapters/pendle-pt-registry.test.ts`](../../tests/adapters/pendle-pt-registry.test.ts) — `resolve*` · `normalize*` · address indexing
  * [`tests/risk-control/pendle-soil-guard.test.ts`](../../tests/risk-control/pendle-soil-guard.test.ts) — `checkSoilResistance()` Pendle fuse integration
  * [`tests/guards/pendle-gmx-cross-guard.test.ts`](../../tests/guards/pendle-gmx-cross-guard.test.ts) · [`tests/adapters/pendle-pt-expiry-guard.test.ts`](../../tests/adapters/pendle-pt-expiry-guard.test.ts)

### 4. GMX

* **Dry-run / Vitest verification（0-Gas pre-flight）：** GMX v2 execution guards 透過 `pnpm demo` · [`tests/demo/gmx-v2-agent-flow.demo.test.ts`](../../tests/demo/gmx-v2-agent-flow.demo.test.ts) · [`gmx-v2-order-payload-guards.ts`](../../src/services/adapters/gmx-v2-order-payload-guards.ts) 驗證 — 於 live GM pool capital deployment 前 pre-flight severance；mainnet fill 為 post-Grant milestone。
* **Integration**: `evaluatePendleGmxCrossGuard`（`src/guards/pendle-gmx-cross-guard.ts`）與 GMX Order Payload Guard（`src/services/adapters/gmx-v2-order-payload-guards.ts`）。
* **Mechanism**: 實作 Shadow Margin accounting。評估於 dynamic fees 下 swap out PT collateral 是否威脅 GMX Maintenance Margin。Builder fee SSOT：**`GMX_UI_FEE_BPS` = 10**（`src/config/gmx-revenue.ts`）；payload price-impact gate 使用 **`DEFAULT_GMX_PENALTY_BPS` = 50**（`src/services/yield/gmx-v2-price-impact.ts`）。

### 5. Dune Analytics

* **Telemetry infrastructure：** **即時事件遙測於 Sepolia Testnet 持續串流**；**Arbitrum One（42161）SQL Query Indexers 已完整預編譯以供生產事件擷取**。
* **Live Dashboard:** [Dune Telemetry（Sepolia Live Verification & Production SQL Spec）](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)
* **Sepolia event streaming（verified）：** Dune engine 從 Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` 擷取 **decoded events**（`IntentAttested` · `RiskTripBlocked`）— judges 的 live feed proof。
* **Arbitrum One production SQL（`42161`）：** Matching production DuneSQL queries（Queries 0–0b feed + chart；Queries 1–3 reconciliation panels）target **Arbitrum One mainnet** semantics — [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md)。
* **Live Telemetry Feed（Query 0）：** `arbitrum.blocks` 12h window · Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · `RiskTripBlocked` / `IntentAttested` / heartbeat status。
* **Telemetry Activity Chart（Query 0b）：** 1h minute-bucket toxic-flow distribution（`BLOCKED` / `PASS` / `HEARTBEAT`）。
* **Integration**: [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) · Live `/api/grant-audit` `duneTelemetry` JSON。
* **Mechanism**: Production DuneSQL feed + chart（Queries 0–0b）plus reconciliation panels（Queries 1–3）— Toxic Flow Blocked · Observatory Paradox Bypasses · PT Expiry × GMX Margin Health — reconciled against `duneTelemetry.responseRef` sha256 provenance。

### Execution Speed & Protocol-Agnostic Resilience（HL Delta Pool）

Hyperliquid — 與 Arbitrum 永續流動性生態系並行的**獨立 L1 高頻訂單簿 AppChain** — Session Key Adapter 與 TCA provenance（`src/data/verified-5tx-lib/verified-5tx-provenance.ts`）定位為 **cross-venue Δ-neutral execution speed proofs**（GMX v2 ETH/USDC GM + HL 1× short），補強（而非競爭）Shield pre-execution narrative。SSOT: `src/adapters/hl/hyperliquid-session-guard.ts` · `src/adapters/hl/execution-wire.ts` · `src/adapters/hl/session-key-executor.ts`。

---

## Core Risk Decision Matrix（`evaluatePendleGmxCrossGuard`）

| Intent Direction（Code Mapping） | Trigger Condition | Reflector Action | Strategic Purpose |
| :--- | :--- | :--- | :--- |
| `close` / `reduce`（`RISK_DECREASE`） | Any Market State | `EMERGENCY_DELEVERAGE_ALLOWED` | **Fixes Observatory Paradox**：Applies -40 risk score discount；always greenlights risk reduction to prevent forced liquidation on GMX。 |
| `open` / `increase`（`RISK_INCREASE`） | Raw Risk Score &gt; 75 OR Shadow Margin &lt; 0 | `FAIL_CLOSED_BLOCK` | **0-Gas Defense**：Blocks toxic/hallucinated leverage before mempool ingress。 |
| `open` / `increase`（`RISK_INCREASE`） | Raw Risk Score ≤ 75 AND Shadow Margin ≥ 0 | `PASS_GREENLIGHT` | Eligible for downstream EIP-712 attestation pipeline（`SliverVineGate.sol`）。 |

**Demo tests:** [`tests/guards/pendle-gmx-cross-guard.test.ts`](../../tests/guards/pendle-gmx-cross-guard.test.ts) · [`tests/adapters/pendle-pt-expiry-guard.test.ts`](../../tests/adapters/pendle-pt-expiry-guard.test.ts) · [`tests/adapters/pendle-market-oracle.test.ts`](../../tests/adapters/pendle-market-oracle.test.ts) · [`tests/adapters/pendle-pt-registry.test.ts`](../../tests/adapters/pendle-pt-registry.test.ts) · [`tests/risk-control/pendle-soil-guard.test.ts`](../../tests/risk-control/pendle-soil-guard.test.ts)。

---

## Three-Pillar Architecture（Submission SSOT）

| Pillar | 角色 | SSOT |
|--------|------|------|
| **Gatehouse (Auth)** | **Opt-In Pillar 1** ZeroDev scoped session keys · Kernel v3 · R06 / R07 · `USE_ZERODEV_AA` default-off | `zerodev-aa-*` · Gate attestation · [`02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) |
| **Pillar 2: Compliance Ingress Firewall** | Venue-agnostic unidirectional AML escort · Robinhood / Across（`46630`/`4663` → `42161`）as **Pillar 2 Reference Escort Adapters** | `src/adapters/across-ingress-bridge.ts` · `contracts/IngressSafetySwitch.sol` |
| **Shield (CORE MOAT)** | Sub-ms Wasm pre-execution armor · p50 ~106 μs · fail-closed before mempool · **auto `severSigningChannel()` on bitmask trips** · **independent of ZeroDev** | `checkSoilResistance()` · `soil_core.wasm` · Stylus `SliverVineSoilCoprocessor` · `check_soil_resistance_stylus` |

### Competitive Positioning — Four-Dimensional ASCII Matrices（SliverVine Protocol）

**Entity:** SilverVine Labs · **Protocol:** SliverVine Protocol / SliverVine Citadel（BeΔ）  
**[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196):** Emerging Draft — not finalized.

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
│ 1. Policy Gate Layer      │ ERC-8196 (Emerging Draft Sub-ms Policy Gate)│ On-chain Voting / Delay    │ API Proxy (Centralized)    │
│ 2. Prompt Injection Guard │ R20 Physical Deadlock       │ Vulnerable to Signed Intent│ Bypassable via Jailbreak   │
│ 3. Key Pipe Severing      │ <1ms `severSigningChannel`  │ N/A (Requires On-chain Tx) │ N/A (No On-chain Hook)     │
│ 4. Standard Alignment     │ ERC-8196 (Emerging Draft Sub-ms Policy Gate) · EIP-7562 │ Standard ERC-20 / ERC-721  │ Proprietary REST APIs      │
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

---

## Business Model & GTM Strategy

> **Pricing model boundary：** **v1.0 uses Cloudflare-style SaaS subscription（$0 / $49 / $299）**；**10 bps CaaS protocol fee-sharing is explicitly designated V2.0 Expansion** — do not conflate with v1.0 SaaS or GMX +10 bps `uiFeeReceiver`。

SliverVine 拒絕不切實際的 B2B sales models（如向 DAOs 收取 $8k/mo upfront），採用 **Infra-First, Multi-Tiered Monetization Engine**：

1. **Cloudflare-Style SaaS Subscription（v1.0 Primary — $0 / $49 / $299）**:
 * Edge API tiered access for institutions and agent swarms — **not** the V2.0 CaaS protocol fee rail.
2. **Pay-per-Intent Micro-Attestation Fee（Adjunct）**:
 * AI Agents and Vault Operators connect via SliverVine's Secure RPC Gateway（`@slivervine/citadel-sdk`）。
 * Charged $0.01 – $0.05 per signed attestation, deducting micro-fees automatically without requiring credit card friction.
2. **Telemetry & Risk Data API（Data Engine）**:
 * Access to real-time Yield Convexity and Liquidity Void feeds via WebSocket/REST for hedge funds and quant vaults（$199–$1,999/month）。
3. **Edge Execution Alliance（Partnership Model）**:
 * Acts as the **Sub-ms Intent Execution Edge** for macro risk engines（e.g., Chaos Labs, Gauntlet）。Chaos Labs provides macro parameter tuning；SliverVine enforces microsecond off-chain intent protection.

**GMX builder lane（adjacent）：** +10 bps `uiFeeReceiver` on unsigned GMX v2 payloads — see [`gmx/GMX_BUILDERS_PITCH.md`](../grants/gmx/GMX_BUILDERS_PITCH.md)。

---

## 🛣️ Post-Buildathon B2B Commercialization & PMF Roadmap（Post-9/14）

SliverVine Protocol 執行嚴格的 two-stage strategy，平衡 Zero-Friction Hackathon Verification 與 Long-Term Commercial Sustainability：

- **Stage 1: Buildathon Verification Phase（Active Now — Pre-9/14）**
  - **100% Free Public Telemetry**：Open-access Dune Live Telemetry Dashboard（[https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)）供 judges 與 developers zero-friction auditing。
  - **Sepolia Safety Gate**：Full EIP-712 session key validation 與 0-Gas Fail-Closed protection 於 Arbitrum Sepolia（`0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`）驗證。

- **Stage 2: B2B Monetization & Risk API Launch（Post-9/14）**
  - **SliverVine Citadel Risk API & Bad Debt Calculator（powered by on-chain telemetry & Dune Analytics visualization）**：透過 B2B API 將 SliverVine 專有 sub-ms risk calculation algorithms 與 shadow margin telemetry 商業化 — **not** Dune platform data resale。[Dune](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) 仍為 **free public visualization dashboard**；paid tiers（$199/mo Pro to $1,999/mo Enterprise）gate programmatic access to Citadel-computed liquidation risk、margin health 與 bad-debt savings metrics for vault managers and AI Agent swarms（Wayfinder, Virtuals, M2M Treasury Funds）。
  - **V2.0 CaaS rail（Design Spec — not v1.0）：** `@slivervine/citadel-sdk` modular Wasm SDK + **10 bps protocol authorization fee** on pre-execution risk checks。**v1.0 operates on SaaS（$0/$49/$299）**；v1.0 GMX **+10 bps `uiFeeReceiver`** remains the live builder lane（not the V2.0 CaaS fee）。

---

## Post-Hackathon Expansion Roadmap

* **Milestone 1（Weeks 2–3 post-grant approval）：Native Upstream Plugin PRs**
 * 向 **ElizaOS**（`@elizaos/plugin-citadel`）與 **Virtuals GAME**（`@virtuals/plugin-citadel`）monorepos 提交 official native plugin Pull Requests（PRs），從現有 zero-overhead SDK Wrapper decorator（`withCitadelShield`）過渡至 official upstream integration。
* **Phase 1: Milestone Dune & PoV（Day 7 – 30）**
 * Deploy live Dune Analytics dashboards and onboarding 3 design partners（AI Agent creators on Virtuals/ElizaOS and GMX Vault Managers）for $0-fee Proof-of-Value testing。
* **Phase 2: Milestone Prediction（Design Spec / Post-Hackathon Roadmap）**
 * Expand off-chain Event-Driven Risk Adapters（`polymarket-event-guard` spec）to protect AI trading agents in prediction markets（Polymarket / Azuro）during breaking news liquidity voids。
* **Phase 3: Milestone Citadel（Day 60 – 90）**
 * Institutional rollout of TEE-enclosed（SGX/Automata）Reflector nodes and Secure RPC Gateway across Arbitrum Orbit chains。

---

## Granular Milestone Matrix（Buildathon · Grant-Tied Distribution）

| ID | Unlock condition（objective） | Sponsor / track | Status |
|----|------------------------------|-----------------|--------|
| **M-Sepolia** | Sepolia Gate + RiskOracle + IngressSafetySwitch verified · `sepoliaDualLegProof` in `/api/grant-audit` | Arbitrum | ✅ Delivered |
| **M-CLI** | Vitest **192 test files | 836 PASS Clean（100% PASS）** | All | ✅ Delivered |
| **M-RH-Demo** | `46630`/`4663` → `42161` outbound escort OK · inbound AML blocked · `lostUsd ≡ 0` | Robinhood Chain | ✅ Code-verified · ⏳ video |
| **M-GMX-Fee** | Unsigned GMX v2 payload injects **10 bps** `uiFeeReceiver` | GMX | ✅ Injected · ⏳ `claimUiFees` |
| **M-Dune** | Publish Dune dashboard per [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) | Dune | ✅ [Live dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) |
| **M6-Mainnet** | Arbitrum One Gate ignition on `42161` · Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · [Tx `0x54c153…b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) | Arbitrum · Grant | ✅ Delivered |
| **M1-Native-PR** | **Milestone 1（Weeks 2–3 post-grant）：** Official upstream PRs to ElizaOS（`@elizaos/plugin-citadel`）+ Virtuals GAME（`@virtuals/plugin-citadel`）— graduate from `withCitadelShield` SDK wrapper to native monorepo plugins | ElizaOS · Virtuals | ⏳ Post-grant Weeks 2–3 |

---

## On-Chain Verification — Arbitrum One（42161）

| Contract | 角色 | Verified Address（Mainnet） | Proof |
|----------|------|----------------------------|-------|
| `SliverVineGate` | Consume-once EIP-712 attestation anchor | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | Mainnet Ignition Tx [`0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6`](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) · [`DeployArbitrumOneGate.s.sol`](../../SliverVineGate/script/DeployArbitrumOneGate.s.sol) |

> **Note:** Mainnet Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` deploys with **Ephemeral Verification Signers** — Bootstrap Ignition Keys（`0x1111…`/`0x2222…`）— for **deliberate public auditability without exposing production HSM infrastructure**。Key rotation to production multisig is executed via native governance functions。

> **0-Gas Off-Chain Severance architecture:** Arbitrum One Gate（`0xb174…`）**is engineered for 0-Gas Pre-Execution Off-Chain Severance**。Citadel Risk Gates halt compromised payload signatures at the Edge **prior to mempool submission**，preserving **Arbitrum L2 state space cleanliness** — toxic paths never consume Sequencer gas；on-chain Gate anchors consume-once attestations only for cleared intents。

---

## On-Chain Verification — Arbitrum Sepolia（421614）

| Contract | 角色 | Verified Address（Sepolia） | Source |
|----------|------|----------------------------|--------|
| **Deployer / Admin / Signer** | OpSec-isolated Forge broadcast signer | `0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F` | [`scripts/deploy-sepolia-gate.sol`](../../scripts/deploy-sepolia-gate.sol) |
| `SliverVineGate` | Consume-once EIP-712 attestation anchor | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` | [`SliverVineGate/src/SliverVineGate.sol`](../../SliverVineGate/src/SliverVineGate.sol) |
| `SliverVineRiskOracle` | EIP-712 offline risk report · `STATUS_SHUTDOWN` flush | `0x3FFa2539f502682E8145e6Eb427ff78d258D53a4` | [`contracts/SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol) |
| `IngressSafetySwitch` | Pillar 2 compliance filter | `0x3E4298e2b8d4e30396A54C1817Eb71c9272Ffb4B` | [`contracts/IngressSafetySwitch.sol`](../../contracts/IngressSafetySwitch.sol) |
| `SliverVineSoilCoprocessor`（Stylus） | On-chain HF math coprocessor · `check_soil_resistance_stylus` dual-execution | **Code-Verified**（Stylus **9/9（50bps）** · `pnpm build:stylus` · EIP-1967 proxy path） | [`contracts/stylus-probe/src/lib.rs`](../../contracts/stylus-probe/src/lib.rs) |

---

## Verification（60s）

```bash
pnpm install
pnpm demo:gmx     # Tier 1 — GMX v2 shadow margin (ALLOW)
pnpm demo:hl      # Tier 1 — Hyperliquid session key (ALLOW)
pnpm demo:pendle  # Tier 1 — Pendle guarded pool factory (ALLOW)
pnpm demo:camelot # Tier 1 — Camelot V3 spot liquidity (ALLOW)
pnpm demo:radiant # Tier 1 — Radiant Capital HF guard (ALLOW)
pnpm demo:jones   # Tier 1 — Jones DAO vault guard (ALLOW)
pnpm demo       # Vitest Tri-Pillar matrix (12 scenarios)
pnpm demo:e2e   # Tier 3 — 5-Step Macro Lifecycle CLI
pnpm demo:wayfinder              # Tier 2 — Wayfinder route interception (ALLOW)
pnpm demo:wayfinder -- --trip    # 0-Gas Fail-Closed soil trip
pnpm test       # Full System Regression Suite (192 files / 836 tests)
pnpm run audit:security # 5/0/0 PASS
cd SliverVineGate && forge test --gas-report && cd ..
curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .sepoliaDualLegProof
```

**Tri-Pillar micro demo**（`pnpm demo` — `tests/demo/`）:

| File | Venue | Scenarios |
|------|-------|-----------|
| `gmx-v2-agent-flow.demo.test.ts` | GMX v2 | Healthy payload · toxic price impact · oracle-lag + `reduceOnly` rescue · 1,000× benchmark |
| `hyperliquid-agent-flow.demo.test.ts` | Hyperliquid | Valid session key · WS stale/latency fuse · GateLockout · 1,000× benchmark |
| `pendle-ai-agent-flow.demo.test.ts` | Pendle | AI pool PASS · yield-drift reject · stale oracle · 1,000× benchmark |

**Grant E2E macro demo highlights**（`pnpm demo:e2e` — GitHub `diff` syntax）:

```diff
+ ── Step 1: Citadel Pre-Execution Check ──
+ Intent: allowedToSign=true · elapsed=106µs · Invariant: Δnet ≡ 0
+ ── Step 2: Robinhood Escort ──
+ Outbound: lostUsd=0 · RESULT: Escort PASS · lostUsd ≡ 0
- Inbound AML block: AML_INBOUND_TO_ROBINHOOD_BLOCKED
! GMX Payload: uiFeeReceiver (+10 bps) injected
- ALERT: SOIL_TRIPPED — toxic depth fuse
- [CRITICAL] PHYSICAL_DEADLOCK_TRIGGERED: EIP-712 Signature Pipe Severed
+ Flash unwind: PASS · RESULT: E2E OK (5/5)
```

**Regression bar:** Vitest **192 test files | 836 PASS Clean（100% PASS）** · Forge 60/60 · Cargo Stylus **9/9（50bps）** · Worker bundle **69.32 KiB gzip**（`pnpm bundle:measure` · pass &lt;70 KiB）· Wasm &lt;28 KiB / &lt;60 µs。

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [`../architecture/01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) | R01–R20 Defense Matrix · latency benchmarks |
| [`../telemetry/DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) | Production DuneSQL feed + activity chart（Queries 0–0b）+ 3 reconciliation panels · [live dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) |
| [`../grants/arbitrum/ARBITRUM_ONE_PAGER.md`](../grants/arbitrum/ARBITRUM_ONE_PAGER.md) | One-pager |
| [`../grants/arbitrum/GRANT_PROPOSAL.md`](../grants/arbitrum/GRANT_PROPOSAL.md) | Scope & roadmap |
| [`../grants/gmx/GMX_BUILDERS_PITCH.md`](../grants/gmx/GMX_BUILDERS_PITCH.md) | GMX builder economics |
| [`../pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md`](../pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md) | 180s Pitch + 120s Demo dual-video scripts |
| [§ Threat Model Appendix](#appendix-real-world-threat-model--market-landscape) | Agentic web metrics · case studies · competitive matrix |

---

## Appendix: Real-World Threat Model & Market Landscape

### Market Adoption Metrics（The Agentic Web Shift）

Web3 attack surface 正從 human UI phishing 轉向 **autonomous agent execution pipelines**。Industry telemetry 顯示 agentic web 已在鏈上具實質規模：

| Metric | Estimate |
|--------|----------|
| **AI agents deployed** | **17,000+** autonomous on-chain agents |
| **Share of on-chain transactions** | **~19%** agent-attributed activity |
| **Daily Active Wallets (DAW) touchpoints** | **~4.5M** wallets interacting with agent frameworks |

**Implication:** Security 必須從 post-hoc dashboards 與 mutable pause functions 演進為 **microsecond Pre-Broadcast Intent Firewalls** — 於 Sequencer queues、Bundler ingress 或 MEV mempools **之前** severing toxic calldata。Citadel Shield 於 **p50 ~106µs** Edge Wasm evaluation 填補此缺口。

### Real-World Case Studies（Why Citadel Shield is Essential）

| # | Case | Loss / Impact | Citadel Alignment |
|---|------|---------------|-------------------|
| **1** | **Jaredfromsubway.eth $7.5M Exploit（MEV Honeypot Trap）** | Automated signature logic exploited via malicious permission / honeypot traps | Validates **sub-ms Wasm pre-broadcast** `checkSoilResistance()` + honeypot RPC defense — signatures never reach toxic mempool paths |
| **2** | **Virtuals Protocol $500k Unbound Agent Drain** | Unbound agent execution exceeded safe notional envelopes | Validates **R06/R07** session-key blast-radius isolation · **`SESSION_KEY_NOTIONAL_CAP_USD = $5,000`** · scoped `ORDER_EXECUTE` |
| **3** | **ElizaOS / ai16z Fraud & Governance Collapse** | SDNY class-action litigation — raw Node.js prompt wrappers lacked on-chain execution guarantees | Validates **non-semantic bytecode predicate assertions** · EIP-712 consume-once Gate · **LLM back-off cooldown** — prompt layer compromise ≠ signing-layer authorization |

### Competitive Landscape Matrix

| Dimension | **SliverVine V1.0（88% Baseline）** | **Wayfinder** | **Virtuals Protocol** | **ElizaOS Framework** | **ZeroDev / Biconomy（ERC-4337 AA）** |
|-----------|-----------------------------------|---------------|-------------------------|----------------------|--------------------------------------|
| **Pre-broadcast severance** | ✅ Sub-ms Wasm soil fuse（p50 ~106µs）· 0-Gas fail-closed | ✅ **V1.0 Live** via Citadel `wayfinderCitadelShieldHook` on Arbitrum `42161` | ❌ Web2.5 agent layer；wallets exposed without pre-execution bounds | ❌ No native pre-broadcast risk gates | ❌ Session keys only；**no** AI-context fuse |
| **On-chain immutability** | ✅ 0-proxy `SliverVineGate` · `consumed[digest]` | Varies by deployment | Consumer UX focus | Open-source plugins | Strong AA infra |
| **AI behavioral safety** | ✅ 60s LLM cooldown · ±2–5 bps jitter | Limited | Limited | Prompt-only guardrails | N/A |
| **Session blast-radius** | ✅ $5k notional cap · scoped modules | Varies | High adoption；**unbound drain risk** | Framework-dependent | ✅ ERC-4337 session scopes |
| **Prompt injection immunity** | ✅ Bytecode predicates · not NL prompts | Partial | Partial | **Vulnerable** at execution hook | **Vulnerable** — signs whatever UserOp encodes |

### Supplementary Industry References

- **MEV & thin-liquidity on autonomous agents** — `checkSoilResistance()` · `evaluateHlOrderbookGapGuard()`
- **$441k+ bot execution error** — [PumpParade / Medium](https://pumpparade.medium.com/ai-trading-bots-lost-441k-in-one-error-heres-what-actually-works-and-what-doesn-t-4f04f890c189)
- **AI antivirus primitives** — [CertiK AI Skill Scanner](https://www.tradingview.com/news/chainwire:d064d7d1f094b:0-certik-launches-ai-skill-scanner-an-antivirus-software-for-the-ai-age/)
- **Institutional agent-security focus** — [CryptoRank: AI Agents & Web3 Hacking Symposium](https://cryptorank.io/news/feed/fae5e-ai-agents-web3-hacking-wyoming-symposium)

---

**SliverVine Protocol** — *The Risk Operating System for AI-Driven DeFi.*
