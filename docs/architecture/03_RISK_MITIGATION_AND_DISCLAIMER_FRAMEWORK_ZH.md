> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md](./03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md)

# SliverVine Protocol：風險緩解、Fail-Closed 安全邊界與免責聲明框架

> **產品：** **SliverVine Citadel Shield** — 共識前意圖防火牆與執行安全原語
> **協議：** SliverVine Protocol（BeDelta Living Water v1.0 / BeΔ）· Santenmoku 內部引擎代號
> **文檔狀態：** Arbitrum Foundation · ZeroDev Grant 委員會 · 機構配置者之官方 SSOT
> **版本：** v1.0 → v2.0 路線圖對齊
> **基線：** Vitest **192 個測試檔案 | 836 PASS Clean（100% PASS）** · Worker 熱路徑 **69.32 KiB gzip** · Shield **p50 ~106 µs** · **7 協議**（含 Variational **Bits 12–13**）· **4 個 AI 框架** · Stylus **9/9 PASS（50bps 對齊）** · **Milestone 1 上游 plugin PRs** · **dual-branch strategy**
> **核心原則：** 誠實會計、物理不變量（`lostUsd ≡ 0`）與場所無關的預執行 Citadel 防護。
> **規格 SSOT：** [`01_TECHNICAL_SPECIFICATION.md`](./01_TECHNICAL_SPECIFICATION.md)

> **哲學 — BeΔ（BeDelta Living Water v1.0）：** **Be** 靈感來自 Bruce Lee 的 *"Be Water, My Friend"* — 流動、自適應的意圖路由與無摩擦的多鏈執行。**Δ（Delta）** 表示**市場 Delta 中性**與風險中性執行。**SliverVine Citadel Shield** 是將兩者綁定的共識前執行安全原語。

**正式名稱：** **SliverVine Protocol** 上的 SliverVine Citadel Shield（BeDelta Living Water v1.0 / BeΔ）
**實體：** SilverVine Labs
**定位：** Arbitrum 上 AI Agent 的亞毫秒 0-Gas 預廣播安全 Citadel
**Live proof：** `GET /api/grant-audit` · [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · **Dune PEV dashboard：** [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) — **PEV 追蹤已於鏈上完全運作**，經 Sepolia Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1`（`RiskTripBlocked` → `SUM(blocked_intent_notional_usd)`）

> **Dual-branch strategy：** `main`（Grant Public SSOT）vs `feat/wasm-opsec-kernel-experiment`（Closed WASM Kernel 實驗分支，不納入 Grant 公開驗證範圍）。

### 三柱 — 獨立審計規格

| 支柱 | 角色 | 規格 |
|--------|------|------|
| **支柱一 — Gatehouse** | ZeroDev Kernel v3 · EIP-712 · session 範圍 | [`../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md`](../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) |
| **支柱二 — Compliance Ingress Firewall** | AML escort · 僅出站 · `lostUsd ≡ 0` | [`../audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](../audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) |
| **支柱三 — SliverVine Citadel Shield** | `checkSoilResistance()` · Wasm · R01–R20 | [`../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](../audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) |

---

## 0. 風險緩解、Fail-Closed 邊界與免責聲明框架

> **有效範圍：** 本節適用於所有讀者 — Grant 評審、機構配置者、AI-agent 整合者與 fund-of-funds 盡職團隊。引用本框架即表示您 acknowledge **沒有任何軟體能消除 100% 的系統性加密、市場或對抗性風險**。

### 0.1 SliverVine Citadel Shield 保證什麼 — 以及不保證什麼

**SliverVine Citadel Shield** 提供 **88% 預廣播 fail-closed 攔截網格** — 以**亞毫秒 Wasm soil gate**（`checkSoilResistance()` · `pkg/soil_core.wasm`）為錨 — 設計目標是在 **GMX / Hyperliquid 廣播之前**切斷有毒 payload。

#### 正式風險譜定義（88% / 12%）

SliverVine 將 **100% 鏈上總風險面** — AI agent 在 Arbitrum、GMX v2 與 Hyperliquid 上操作所面臨的完整執行危害集合 — 建模為**加總為 100% 的封閉雙分區譜**：

| 分區 | 占比 | 定義 | Citadel 行為 |
|-----------|-------|------------|------------------|
| **Pre-Broadcast Interception Mesh**（SliverVine Citadel Shield 覆蓋） | **88%** | 於 **p50 ~106 µs** 透過 Wasm Soil Core（`checkSoilResistance()` · `pkg/soil_core.wasm`）在**預 mempool 邊界**可攔截的**營運危害占比**：MEV sandwich、流動性深度尖峰 **>10 bps**、oracle lag（`ORACLE_LAG_DEADLOCK`）、未授權 session 使用（R06/R07）、prompt injection / rogue-LLM calldata、AML 入站違規（支柱二）、跨場所 slippage 異常與 honeypot RPC trap | **100% fail-closed severance** — `signingChannelOpen: false`；payload 永不進入 mempool / bundler |
| **Insurmountable Systemic Residuals** | **12%** | **任何預執行軟體都無法程式化消除**的結構性加密系統風險：L2 sequencer 完全停機 **>600 s**、第三方場所協議級 0-day 智能合約 exploit、超出 quorum 的網路級 RPC 斷線、TEE 供應鏈 compromise、bridge 對手方 insolvency | 感測器 breach 時 **Fail-Closed 姿態** — `signingChannelOpen: false`；**不宣稱**對這些尾部事件的本金保護 |

**數學閉合：** `88% + 12% = 100%` 的建模鏈上風險面。**88%** 源自 **255-case chaos matrix** 與 **R01–R20 Defense Matrix** — 覆蓋**已知、感測器可處理的預廣播向量** — 非對所有未來損失的保證。

> **Evaluator SSOT：** 所有 Grant、DDIP、審計與 submission 引用 **88%** 或 **12%** 的文案**必須**引用本節：[`§0.1`](#01-slivervine-citadel-shield-保證什麼--以及不保證什麼)。

#### Pareto 規則 — 80% / 20%（微結構損失集中）

支柱三與技術規格中引用的 **80/20 Pareto 規則** 是**獨立、正交的微結構統計** — 非 88/12 譜的加總：

- 急性有毒執行損失（sandbox replay · Monte Carlo 基質）的 **~80%** 來自 **~20%** 的微秒級深度 / slippage 異常（流動性尖峰、跨場所 decoupling、sub-block MEV 窗口）。
- **支柱三**（`checkSoilResistance()` · R03 depth fuse · R04 slippage fuse · PGATE latency fuse）於 sub-ms Edge 評估**直接針對這 20% 急性尾部** — 在更廣 **88% 網格**內槓桿最高的攔截帶。

**SliverVine Citadel Shield** 是**預執行 circuit breaker**，而非：

- **零市場損失**或本金保護的保證
- 對**所有未來 AI exploit**、新型攻擊向量或 0-day 智能合約 bug 的免疫
- 獨立法律、投資、稅務或監管建議的替代
- 監管認證（SOC 2 Type II、MiCA CASP、銀行執照或受保存款產品）

**Fail-Closed 姿態：** 當 soil、oracle、sequencer、bridge、session 或 policy 感測器 trip 時，SliverVine Protocol **寧可不行動，也不錯誤行動** — `signingChannelOpen: false`、UserOp 於 pre-bundler 拒絕、bridge 狀態 `BRIDGE_TIMEOUT_FAIL_CLOSED`。

### 0.2 不可抗力與殘餘風險向量（無法完全消除）

| 風險類別 | 範例情境 | SliverVine Citadel Shield 緩解 | 殘餘暴露 |
|------------|-------------------|-------------------------------------|-------------------|
| **Sequencer / L2 outage** | Arbitrum sequencer 停機 · 延長 reordering 窗口 | 600s recovery grace · desync 期間無 naked open · `ARBITRUM_SEQUENCER_UNSAFE` severance | 超出建模 grace 的延長 outage · 狀態 divergence |
| **Oracle lag / manipulation** | 過期 GMX / HL mark · >30s feed drift | `ORACLE_LAG_DEADLOCK` · payload 構建前 fail-closed | 超出閾值的 oracle compromise · feed censorship |
| **MEV / sandwich / toxic flow** | Block-builder reordering · 流動性提取 | Soil slippage fuse · TWAP path slicing · PGATE latency fuse | 超出建模深度的尾部 MEV · private order-flow 競爭 |
| **Bridge / cross-chain** | Across settlement delay · escort 路徑 compromise | `IN_FLIGHT_BRIDGE_CAPITAL` · `lostUsd ≡ 0` · 1h timeout fail-closed | Bridge 智能合約 exploit · 對手方 insolvency |
| **Basis / funding drift** | GMX GM vs HL short divergence | Dual-leg Δ tracking · Citadel Safety Buffer · hurdle gate | 持續負 funding · 場所特定 insolvency |
| **AI-specific attack surface** | **Prompt injection** · rogue LLM 意圖生成 · agent credential drift | 支柱一 scoped session keys · R20 physical deadlock · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) policy pre-validation · V1.5 prompt-injection circuit（roadmap） | 新型對抗性 ML · 被 compromise 的上游 agent orchestrator · 營運者 key 的 social engineering |

### 0.3 Interceptor Mesh 覆蓋（88% Pre-Broadcast）

見 **[§0.1 正式風險譜定義](#01-slivervine-citadel-shield-保證什麼--以及不保證什麼)** 取得權威 **88% / 12%** 分區。摘要：**88%** 反映 255-case chaos matrix 與 R01–R20 Defense Matrix 中**已知有毒預廣播向量**的建模覆蓋；殘餘 **12%** 包含未建模尾部事件、第三方場所故障、治理升級、session 範圍外 key compromise 與超出感測器閾值的 force majeure（§0.2）。

```text
User / AI intent → Pillar 1 Gatehouse (session scope)
 → Pillar 2 optional escort (AML · bridge accounting)
 → Pillar 3 SliverVine Citadel Shield (88% interceptor mesh · sub-ms Wasm)
 → [ PASS ] → venue broadcast
 → [ TRIP ] → severSigningChannel() · no broadcast · lostUsd ≡ 0 on pending bridge
```

### 0.4 非建議聲明與分類免責

SliverVine Protocol 是**複雜的智能合約基礎設施** — 非銀行存款、貨幣市場基金或受保現金產品。Dynamic Target Range **8.2% ~ 11.8% APY** 是**非保證展示帶**，非收益保證。完整配置者披露見 [`01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](../audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) § Risk & Disclaimer。

---

## Executive Summary

**SliverVine Protocol** acknowledge 分散式系統的基本定律：**跨鏈風險、bridge 延遲與 basis drift 無法被軟體 magically 消除；必須被量化、隔離並經濟吸收。**

本文檔概述 SliverVine Protocol 的 **3-Stage Evolutionary Roadmap** — 從**程式驗證的 V1.0 Arbitrum AI Agent Citadel**，經 **V1.5 sub-ms agentic security / [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) swarms**，至 **V2.0 institutional Citadel-as-a-Service (CaaS) & Orbit Shield** — 外加 **60 Reflective Architectural Invariants**，各項標記 **✅ Code-Verified**（v1.0 基線）或 **⏳ Roadmap Spec**（V1.5/V2.0）。提及的 Aave/Morpho APY 均為 *(Hurdle-rate probe only — not a yield-stacking product track)*。可選 bridge 為 **Pillar 2 Reference Escort Adapters**。

---

## 1. 三階段演進架構

**產品定位：** Arbitrum 上 AI Agent 的亞毫秒 0-Gas Pre-Broadcast Safety Citadel（SliverVine Protocol · SilverVine Labs）。

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Stage A (V1.0 — ✅ Code-Verified Live Baseline)                                 │
│ · Arbitrum One Primary + GMX v2 / HL Delta-Neutral Engine                       │
│ · Wasm Hot-Path Shield: p50 ~106µs · <28KiB pkg/soil_core.wasm                  │
│ · ERC-8196 (Emerging Draft Sub-ms Policy Gate) — policy pre-validation                          │
│ · EIP-712 Consume-Once Gate 0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1           │
│ · Vitest SSOT: 192 test files | 836 PASS Clean         │
│ · 7 protocols · 4 AI frameworks · Stylus 9/9 (50bps) · dual-branch strategy   │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Stage B (V1.5 — ⏳ Roadmap: Sub-ms Agentic Security & ERC-8196 swarms)           │
│ · ERC-8196 Fleet Enforcement — multi-agent policy gates vs rogue LLM execution  │
│ · EIP-7702 Zero-Friction Onboarding — EOA → Agent Smart Account, no token move  │
│ · Prompt Injection Defense Circuit — sub-100µs severSigningChannel()            │
│ · Variational Perp Native Hedge PoC — Arbitrum shadow hedge, less cross-L1 RPC  │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Stage C (V2.0 — ⏳ Design Spec: Institutional CaaS & Orbit Shield)               │
│ · Modular B2B CaaS — @slivervine/citadel-sdk Wasm core for AI DEX / Orbit L3    │
│ · Protocol Monetization — 10 bps authorization fee on pre-execution risk checks │
│ · Multi-Chain Edge Reflector Mesh — cross-L2 telemetry + instant kill-switch    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Stage | Status | Center of Gravity |
|-------|--------|-------------------|
| **A — V1.0** | ✅ Code-Verified（**192 test files \| 836 PASS Clean**） | Arbitrum One GMX v2 / HL Δ-neutral · Wasm Shield · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Draft policy gate · Sepolia consume-once Gate · **7 協議** · **4 AI 框架** |
| **B — V1.5** | ⏳ Roadmap | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) fleet enforcement · EIP-7702 agent onboarding · prompt-injection pipe sever · Variational native hedge PoC |
| **C — V2.0** | ⏳ Design Spec | Institutional CaaS（`@slivervine/citadel-sdk`）· 10 bps pre-exec fee · Orbit / Edge reflector mesh |

> **Milestone 1（Grant 後第 2–3 週）：** 向 **ElizaOS**（`@elizaos/plugin-citadel`）與 **Virtuals GAME**（`@virtuals/plugin-citadel`）monorepo 提交官方原生 plugin Pull Request，從現有零開銷 SDK Wrapper decorator 過渡至上游整合。

### 1.1 三階段風險對照矩陣

| Risk Dimension | Stage A (V1.0 — ✅ Code-Verified) | Stage B (V1.5 — ⏳ Roadmap) | Stage C (V2.0 — ⏳ Design Spec) |
|----------------|-----------------------------------|-----------------------------|--------------------------------|
| **Product posture** | Sub-ms 0-Gas pre-broadcast Citadel for AI Agents on Arbitrum | Multi-agent [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) swarm security | Institutional CaaS + Orbit Shield mesh |
| **Shield latency** | Wasm hot-path p50 ~106µs · `<28KiB` `soil_core.wasm` | Same Shield · **sub-100µs** `severSigningChannel()` on LLM invariant breach | Same Shield · mesh-propagated kill-switch |
| **Agent policy** | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Emerging Draft pre-validation · EIP-712 consume-once Gate `0xb174…` | **Fleet enforcement** — multi-agent policy delegation vs rogue LLM | Plug-and-play policy SDK for third-party agent wallets |
| **AA / onboarding** | ZeroDev Kernel v3 · Paymaster · Smart Routing | **EIP-7702** EOA → Agent Smart Account (no token migration) · Kernel v4 adapter | Single-chain Intent Compose across Orbit L3s |
| **Prompt injection** | R20 physical deadlock on signed-intent violation | Dedicated **Prompt Injection Defense Circuit** (pipe sever before broadcast) | Mesh-wide channel lock + CaaS tenant isolation |
| **Hedge / venue** | GMX v2 GM + HL 1× short (Δnet ≡ 0) · **7-protocol matrix**（含 Variational **Bits 12–13**） | HL retained · **Variational Perp native hedge PoC** (less cross-L1 RPC) | Same-chain GM + native perp · optional escort |
| **Bridge / ingress** | Pillar 2 Reference Escort Adapter (Robinhood 46630 outbound) · `lostUsd ≡ 0` | Same escort semantics · no yield-stacking identity | **Eliminated** as default path · Robinhood opt-in escort |
| **Monetization** | GMX +10 bps `uiFeeReceiver` (builder lane) | Design-partner PoV · no new fee surface required | **10 bps protocol authorization fee** on pre-exec risk checks |
| **AML / compliance** | Outbound-only Robinhood escort · reverse path blocked | Stronger fleet policy + segregated RWA tranche (planned) | Tenant CaaS policy packs · Robinhood opt-in |
| **Oracle / sequencer** | <30s oracle lag fail-closed · 600s sequencer grace | Same sensors + storm fallback (planned) | Cross-L2 synchronized telemetry |
| **Regression bar** | **192 test files \| 836 PASS Clean** | No Wasm rewrite · additive swarm tests | No Wasm rewrite · CaaS SDK contract tests |

---

## 2. 關鍵架構不變量與金融物理

### 2.1 誠實 Bridge 會計（`IN_FLIGHT_BRIDGE_CAPITAL`）

資金經 Across Bridge 跨鏈時，SliverVine Protocol 將資本標記為 `IN_FLIGHT_BRIDGE_CAPITAL`。**`lostUsd ≡ 0`** 嚴格成立，因資本尚未暴露於 market delta。若 bridge 執行超過 `DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS`（1 小時），系統觸發 `BRIDGE_TIMEOUT_FAIL_CLOSED`，拒絕開 naked 部位。

**Code SSOT：** `src/adapters/across-ingress-bridge.ts` · Vitest 5/5 PASS（`tests/adapters/across-ingress-bridge.test.ts`）

### 2.2 Hurdle-Rate Probe（Aave v3 / Morpho — 非產品身份）

> **v1.0 現況：** 當 GMX markets wire 不可用時，Aave APY 作 hurdle-rate probe *(Hurdle-rate probe only — not a yield-stacking product track)* — **非**自動資本 redeployment，**非** V1.5 Citadel roadmap（V1.5 = [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) swarms / EIP-7702 / prompt-injection circuit）。

市場風暴期間，**可選**會計退守至 Arbitrum One 上 Aave v3 / Morpho Blue USDC 作為 risk-free **probe floor** *(Hurdle-rate probe only — not a yield-stacking product track)*。這**不**重新定義 SliverVine Protocol 為 yield-stacking vault。

**Code SSOT（v1.0 probe only）：** `src/adapters/arbitrum/arbitrum-yield-ingress.ts` · `src/services/yield/rebalance-rules.ts`（`FRICTION_BUFFER_APY`）

### 2.3 雙層收益系統與 Citadel Safety Buffer

> **V1.0 yield SSOT：** 配置者面向 HUD 錨定 **Dynamic Target Range 8.2% ~ 11.8% APY**（非保證），由 `rebalance-rules.ts` 中 **Hurdle Gate** `FRICTION_BUFFER_APY = 0.005`（0.5% friction buffer）治理。下方 tier cap 描述元件機制 — 非保證總計。

| Tier | Mechanism | Cap / Rule |
|------|-----------|------------|
| **Robinhood（Pillar 2 Reference Escort Adapter）** | 可選出站合規通道（`46630`/`4663` → `42161`）· `lostUsd ≡ 0` | 非 yield 產品 · 不提高 TVL cap |
| **Citadel Safety Buffer** | GMX v2 builder fee（**+10 bps `uiFeeReceiver`** via `GMX_UI_FEE_BPS`）+ skew arbitrage surplus | 吸收 bridge fees、basis risk 與 MEV slippage |
| **Hurdle Gate** | Rebalance / performance fee crystallization | `FRICTION_BUFFER_APY = 0.005` — 僅於 friction-adjusted excess 之上 deploy |

### 2.4 ZeroDev 演進：從 Bridge Router 到 Intent Composer

即使於 V2.0 CaaS / Orbit Shield 設定，ZeroDev 仍為 Gatehouse 引擎：

| Capability | V1.0 (Kernel v3) | V1.5 / V2.0 (v4 + EIP-7702) |
|------------|--------------|-------------------------|
| **Gas-Free Sponsorship** | Paymaster + daily caps | Same, extended to AI agent fleets |
| **Scoped Security** | 30s TTL Session Keys · `ORDER_EXECUTE` only | Zero withdrawal scope preserved |
| **Atomic Composition** | 1-click GM + HL hedge under Citadel gates | EOA → Agent Smart Account · CaaS tenant UserOps |

**Spec SSOT：** [`01_TECHNICAL_SPECIFICATION.md` §2.4](./01_TECHNICAL_SPECIFICATION.md)

### 2.5 經濟永續哲學：為何低費率無深度會摧毀收益

> **DeFi 經濟第一原則：** 標題費率不是收益。**Net LP return = fee revenue + incentives − impermanent loss − cross-venue slippage − MEV leakage。** 當深度稀薄時，追逐 **0.01% flat fees** 或**不可持續 emissions** 常加速 **death spiral** — 成交量追逐最便宜報價、LP 吸收隱藏 slippage、TVL 退出、深度進一步 collapse，advertised APY 成為 fiction。

#### 2.5.1 永續 AMM 設計的教訓（Equalizer / Curve 系譜）

成熟 stableswap 與 ve(3,3) 風格場所（如 **Curve**、**Equalizer** 及同儕）收斂於共同洞察：

| Sustainable DEX pattern | Why it survives | Failure mode it avoids |
|-------------------------|-----------------|--------------------------|
| **Fee tiers matched to pool depth & volatility** | Higher-impact pools charge enough to compensate LPs for LVR | Flat micro-fees on shallow books → LP capital bleed |
| **Emissions tied to real fee generation, not vanity TVL** | Rewards follow measurable protocol revenue | Mercenary capital farm-and-dump → liquidity cliff |
| **Concentrated liquidity with explicit impact budgets** | Slippage is priced, not socialized as "free yield" | Toxic flow + hidden IL → silent principal erosion |
| **Governance that adjusts parameters when depth shifts** | Fee/emission knobs respond to utilization | Static 0.01% marketing → death spiral when vol spikes |

**Death spiral mechanics（generic）：**

```text
Low headline fee / high emission APY
 → toxic flow & arb extract value from LPs
 → realized slippage + IL > advertised yield
 → LP exit · depth thins
 → worse execution for every $1 deployed
 → emissions subsidize a shrinking book → spiral repeats until TVL collapse
```

SliverVine Protocol **不**在 vanity fee minimization 上競爭。我們在**摩擦後誠實 net yield** 上競爭 — 由 code 強制，非 marketing copy。

#### 2.5.2 SliverVine Protocol 對照：數學不變量優於 Fee Theater

| Dimension | Unsustainable low-fee / emission model | SliverVine Protocol V1.0 approach |
|-----------|----------------------------------------|---------------------|
| **Yield governance** | Narrative APY · mutable emissions | **Mathematical invariants** — soil fuse · hurdle gate · honest bridge accounting |
| **Protocol revenue capture** | Often absent or extracted via hidden spread | **GMX v2 `uiFeeReceiver` +10 bps** on every unsigned payload (`GMX_UI_FEE_BPS`) + up to **25%** referral rebate |
| **Friction vs net gain** | Ignored until LP capital is impaired | **`FRICTION_BUFFER_APY = 0.005` (0.5%) Hurdle Gate** — DN opens only when `targetNetApy > nativeEarnApy + buffer` |
| **Slippage budget** | Socialized across passive LPs | **Pre-execution soil fuse** — cross-venue slip **> 0.5%** trips fail-closed · TWAP path slicing |
| **Allocator disclosure** | Fixed "guaranteed" APY | **Dynamic Target Range 8.2% ~ 11.8%** (non-guaranteed HUD band) |

**Hurdle Gate SSOT（`rebalance-rules.ts`）：**

```typescript
export const FRICTION_BUFFER_APY = 0.005 as const; // 0.5% friction buffer
// resolveCapitalAllocation(): OPEN_DELTA_NEUTRAL iff targetNetApy > hurdleRateApy + FRICTION_BUFFER_APY
```

**Net-yield inequality SliverVine Protocol enforces：**

```text
+10 bps uiFeeReceiver (GMX_UI_FEE_BPS) + GMX skew rebate + funding cushion
 − bridge / basis / MEV friction
 > Native Earn APY + FRICTION_BUFFER_APY (0.5%)
 ⇔ capital deployment allowed (else park in Native Earn · fail-closed)
```

**Design rule：** Citadel Safety Buffer 與 builder UI fee 存在是為**從 GMX v2 skew routing 捕獲真實經濟 surplus** — 非以 emissions 掩蓋 slippage。0.5% Hurdle Gate 確保 **net gains 始終超過 friction** 後才 deploy 或 rebalance Delta-Neutral 資本。

**Code anchors：** `src/services/yield/rebalance-rules.ts` · `src/services/adapters/gmx-v2-order-payload.ts` · `src/services/risk-control-lib/soil-resistance.ts` · Vitest **192 test files | 836 PASS Clean** regression。

### 2.6 Real Yield vs. Toxic Inflation

> **Tokenomics 第一原則：** 並非所有 APY 同等。**Real yield** 來自 exogenous cash flows — trading fees、funding payments、lending spreads 與 skew rebates，由 counterparty 支付。**Toxic inflation** 來自 endogenous token emissions — 新 mint 的 governance token 回收進 headline APY，trade 另一側無 structural payer。

SliverVine Protocol **不**運作 empty emission token model。**無** native SliverVine Protocol reward token、**無** mercenary liquidity mining program、**無** vanity TVL subsidy 設計 inflate HUD numbers。Yield 錨定於**獨立於 SliverVine token 發行的 structural delta-neutral cash flows**。

#### 2.6.1 Toxic Inflation — Empty Emission Pattern

| Toxic inflation signal | Mechanism | Why it collapses |
|------------------------|-----------|------------------|
| **Emission-only APY** | Protocol mints reward token → farms TVL → dumps on exit | No exogenous payer; APY is self-referential |
| **Mercenary capital loop** | High emission → farm → exit → repeat | TVL cliff when emissions taper |
| **Narrative "real yield" without hurdle** | Marketing APY without friction-adjusted net math | Slippage + IL + basis bleed hidden until principal impaired |
| **Governance token as collateral of last resort** | Token price backs advertised returns | Reflexive death spiral when token sells off |

```text
Toxic inflation loop:
 Mint emissions → advertise 40% APY → mercenary TVL in
 → emissions sold / diluted → real cash flow < headline APY
 → exit cascade → emissions must rise → spiral until insolvency narrative
```

此 pattern 被 SliverVine Protocol 架構**明確拒絕**。配置者披露使用**非保證 Dynamic Target Range (8.2% ~ 11.8%)** — 非 emission-inflated marketing APY。

#### 2.6.2 Dynamic Target Range (8.2% ~ 11.8%) — Mathematical Cash-Flow Breakdown

HUD **Dynamic Target Range** **僅**源自 exogenous Delta-Neutral cash flows — GMX trading fees、skew rebates、Hyperliquid funding 與 protocol builder accrual — **零** native SliverVine token emissions：

| Yield Source Leg | Conservative Band (Lower 8.2%) | Bull/Volatile Band (Upper 11.8%) | Payer & Mechanism |
| :--- | :--- | :--- | :--- |
| **GMX v2 ETH/USDC GM Base** | **4.5%** | **6.5%** | GMX trader swap, borrow & closing fees |
| **Skew Rebate & Builder Fee** | **1.0%** (+10 bps UI fee included) | **1.8%** | Positive skew price-impact rebate + `uiFeeReceiver` (+10 bps) |
| **Hyperliquid 1× Short Funding** | **3.2%** | **4.2%** | Counterparty long-side funding payment on HL orderbook |
| **Friction & Rebalance Costs** | **−0.5%** (`FRICTION_BUFFER_APY`) | **−0.7%** | Absorbed by Citadel Safety Buffer (basis & slippage) |
| **Net Strategy APY Range** | **8.2%** | **11.8%** | **Exogenous Delta-Neutral Cash Flow (Zero Token Emissions)** |

> **Evaluator defense narrative：** 與 speculative emission vaults 不同，SliverVine Citadel Shield 的 **8.2% ~ 11.8%** target range 數學上 grounded 於真實 GMX trading fees、skew rebates 與 Hyperliquid short funding rates，由 **0.5% Hurdle Gate**（`FRICTION_BUFFER_APY = 0.005`）守護。僅當 `targetNetApy > nativeEarnApy + FRICTION_BUFFER_APY`（`rebalance-rules.ts`）時 deploy 資本。

**Code anchors：** `src/services/yield/rebalance-rules.ts`（`FRICTION_BUFFER_APY`）· `src/services/adapters/gmx-v2-order-payload.ts`（`GMX_UI_FEE_BPS`）· `scripts/survival-benchmark/`（HL funding replay）。

#### 2.6.3 Real Yield — SliverVine Protocol's Structural Delta-Neutral Cash-Flow Stack

SliverVine Protocol 從**三個 exogenous legs** 組合 yield，各 leg 在 SliverVine token minting 外有可識別 economic payer：

| Cash-flow leg | Source | Economic payer | Stage | Code / spec anchor |
|---------------|--------|----------------|-------|-------------------|
| **Risk-free base (probe only)** | Aave v3 / Morpho Blue USDC earn on Arbitrum One *(Hurdle-rate probe only — not a yield-stacking product track)* | Borrowers pay lending spread | Probe · optional storm floor | `arbitrum-yield-ingress.ts` · `rebalance-rules.ts` |
| **GMX skew rebate + builder fee** | Underweight-side GM LP · `uiFeeReceiver` **+10 bps** (`GMX_UI_FEE_BPS`) · positive skew price-impact rebate (up to **~5 bps** venue-native; separate from `uiFeeReceiver`) | Traders / skew rebalancers on GMX v2 | A ✅ | `gmx-v2-order-payload.ts` · `GMX_UI_FEE_BPS` · Invariant #25–#27 |
| **HL funding cushion** | 1× short leg on Hyperliquid — hourly funding when perp > spot | Counterparty funding flow on HL book | A ✅ | HL session pipeline · Survival Benchmark funding replay |

**Delta-neutral structure：** Long GM pool exposure（Arbitrum）由 1× HL short hedge — net directional delta ≈ 0。Yield 因此是**carry 與 fee capture**，非 leveraged directional bet + emission subsidy。

```text
Real yield stack (conceptual):
 Base floor ← Aave / Morpho USDC earn (~4–5% *(Hurdle-rate probe only — not a yield-stacking product track)*)
 + GMX surplus ← +10 bps uiFeeReceiver (GMX_UI_FEE_BPS) + venue-native skew rebate (up to ~5 bps; separate)
 + HL funding ← 1× short funding cushion (hourly · regime-dependent)
 − friction ← bridge · basis · MEV · slippage (Citadel Safety Buffer absorbs)
 > hurdle ← Native Earn + FRICTION_BUFFER_APY (0.5%) before DN redeploy
```

#### 2.6.4 Why SliverVine Protocol Rejects Empty Emissions — Design Rules

| Design rule | Rationale |
|-------------|-----------|
| **No emission token as yield source** | Prevents reflexive APY divorced from venue cash flows |
| **Hurdle Gate before DN deployment** | `resolveCapitalAllocation()` parks capital in Native Earn when `targetNetApy ≤ hurdle + 0.5%` |
| **Citadel Safety Buffer absorbs friction** | Real surplus must cover bridge/basis/MEV — not be masked by mint-and-dump |
| **Storm fallback to Aave/Morpho (optional probe)** | When GMX skew + HL funding compress, capital **may park at risk-free probe** *(Hurdle-rate probe only — not a yield-stacking product track)* |
| **Honest HUD band** | 8.2–11.8% is a **target range**, not a guaranteed emission-backed APY |

**Contrast summary：**

| | Toxic inflation model | SliverVine Protocol real-yield model |
|---|----------------------|----------------------|
| **Primary yield driver** | Native token emissions | GMX fees/rebates + HL funding + Aave/Morpho base *(Hurdle-rate probe only — not a yield-stacking product track)* |
| **Payer identity** | Future token holders / dilution | Traders, borrowers, funding counterparties |
| **TVL retention** | Mercenary — exits when emissions drop | Hurdle-gated — deploys only when net > friction |
| **Downside in storm** | Raise emissions (spiral) | Fail-closed + optional Aave/Morpho probe floor *(Hurdle-rate probe only — not a yield-stacking product track)* |
| **Protocol revenue** | Often token-dilutive | **+10 bps `uiFeeReceiver`** + up to **25%** referral rebate — venue-native builder stack |

> **Allocator note：** Real yield **不**意味 risk-free。Funding 可轉負、skew rebates 壓縮、Aave rates 變動。SliverVine Protocol 量化並 buffer 這些殘餘（§2.5 · §6）— 僅拒絕以 empty token inflation **替代**它們。

**Code anchors：** `src/services/yield/rebalance-rules.ts` · `src/adapters/arbitrum/arbitrum-yield-ingress.ts` · `src/services/adapters/gmx-v2-order-payload.ts` · `scripts/survival-benchmark/`（HL funding replay）· [`01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](../audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) § Risk & Disclaimer（no guaranteed APY）。

---

## 3. 60 Reflective Architectural Invariants（摘要矩陣）

> **Defense Matrix (R01–R20)：** 17 Active · 2 Refactored · 1 Deprecated — 見 [`01_TECHNICAL_SPECIFICATION.md` §3.3](./01_TECHNICAL_SPECIFICATION.md)
> **Status legend：** **✅ Code-Verified** = v1.0 baseline with code/test anchor · **⏳ Roadmap Spec** = V1.5/V2.0 design — not claimed as shipped

### I. Honest Accounting & Cross-Chain Physics (1–10)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 1 | ✅ | **Honest Accounting** | In-flight bridge funds labelled `IN_FLIGHT_BRIDGE_CAPITAL`; zero naked exposure |
| 2 | ✅ | **Zero Loss Invariant** | `lostUsd ≡ 0` — pending bridge liquidity is never booked as principal loss |
| 3 | ✅ | **Bridge Timeout Fail-Closed** | `DEFAULT_ACROSS_BRIDGE_TIMEOUT_MS` = 1h → `BRIDGE_TIMEOUT_FAIL_CLOSED` |
| 4 | ✅ | **Unidirectional Escort** | Robinhood `46630`/`4663` → Arbitrum `42161` outbound-only |
| 5 | ✅ | **AML Inbound Isolation** | `42161 → 46630/4663` inbound blocked · `AML_INBOUND_TO_ROBINHOOD_BLOCKED` |
| 6 | ✅ | **Settlement Window Honesty** | GMX 3–5 min · HL withdrawal 15 min — capital held in-flight, not mis-booked |
| 7 | ✅ | **Non-Custodial Escrow** | User principal never booked as protocol-owned; Kernel account SSOT |
| 8 | ✅ | **Basis Risk Quantification** | Cross-venue delta tracked; friction absorbed by Citadel Safety Buffer |
| 9 | ✅ | **Across Bridge SSOT** | `evaluateAcrossBridgeTransfer()` + `evaluateBridgeTimeout()` pure functions |
| 10 | ✅ | **Ingress Safety Switch** | On-chain **`IngressSafetySwitch.sol`** address-level oracle flush + blacklist · inbound AML at Edge adapter |

### II. ZeroDev & Account Abstraction (11–20)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 11 | ⏳ | **ZeroDev Evolution** | Kernel v3 → v4 EIP-7702 Intent Composer for native multi-venue routing |
| 12 | ✅ | **EIP-7562 Zero Bundler Rejection** | Stateless `ecrecover` in Validation Phase; bundler rejection rate → 0 |
| 13 | ✅ | **Scoped Session Keys** | `ORDER_EXECUTE` bounds only — zero withdrawal scope on hot keys |
| 14 | ✅ | **30s TTL Self-Destruct** | Ephemeral session keys auto-revoke; nonce-healed on `Invalid nonce` |
| 15 | ✅ | **Paymaster Gas Sponsorship** | Daily sponsorship caps; fail-closed when ledger exhausted |
| 16 | ✅ | **EIP-712 Domain Binding** | `SliverVineCitadel` · chainId + `verifyingContract` anti-replay |
| 17 | ✅ | **ERC-1271 Dual Validation** | Kernel magic value `0x1626ba7e` + Gate m-of-n ECDSA — neither bypasses the other |
| 18 | ⏳ | **EIP-7702 Zero-Friction Onboarding** | EOA instant Smart Account transformation without asset transfer |
| 19 | ✅ | **Gatehouse Abstraction** | Zero-contract-rewrite venue upgrades via adapter swap |
| 20 | ✅ | **ERC-4337 UserOp Pre-Screen** | Edge `verifyAgentIntent()` before bundler dispatch |

### III. Yield, Liquidity & Fee Tokenomics (21–30)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 21 | ⏳ | **Two-Tiered Yield** | Robinhood (**Pillar 2 Reference Escort Adapter**) capped at +2% boost; excess yield → Safety Buffer |
| 22 | ⏳ | **Hurdle-rate probe (optional)** | Aave/Morpho APY as probe floor *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 23 | ⏳ | **Aave Cap Isolation** | Aave USDC 100% supply cap → Morpho Blue probe fallback *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 24 | ⏳ | **Dynamic Hurdle Rate** | Optional performance fee only on yield exceeding Aave probe + 1.5% *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 25 | ✅ | **Builder UI Fee** | +10 bps `uiFeeReceiver` on every GMX v2 payload (v1.0 active) |
| 26 | ✅ | **Skew Neutralizer Premium** | Positive skew / price-impact rebate — never conflated with UI fee |
| 27 | ✅ | **Citadel Safety Buffer** | Excess GMX yield absorbs bridge fees, basis drift, MEV slippage |
| 28 | ⏳ | **Risk-Free Storm Probe** | Optional 4%~5% Aave/Morpho probe during 3σ / oracle-lag / sequencer grace *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 29 | ⏳ | **Performance Fee (optional accounting)** | 10% of excess yield above Aave probe — not on v1.0 UI fee path *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 30 | ⏳ | **CaaS Monetization** | B2B Wasm Firewall license · 10 bps protocol authorization fee |

### IV. Wasm Shield & Pre-Execution Moat (31–40)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 31 | ✅ | **Venue-Agnostic Shield** | `checkSoilResistance()` on abstract Soil state — independent of venue |
| 32 | ✅ | **p50 ~106 µs Hot Path** | Rust `#![no_std]` Wasm on Cloudflare Edge |
| 33 | ✅ | **Hot/Cold Decoupling** | **69.32 KiB gzip** Worker hot path isolated from 5-min Cron Workers; zero GC pauses |
| 34 | ✅ | **Wasm Budget** | `<28kb` artifact · `<60µs` warm execution (`pkg/soil_core.wasm`) |
| 35 | ✅ | **R01 Soil Resistance** | Depth · cross-spread · slippage fuse — fail-closed pre-broadcast |
| 36 | ✅ | **R04 PGATE Latency** | `PGATE_MAX_LATENCY_MS` = 200 — rejects stale venue timestamps |
| 37 | ✅ | **R03 L2 Book Fail-Closed** | 500ms HL orderbook staleness → dispatch blocked |
| 38 | ✅ | **Cross-Venue TWAP** | Net slippage >0.5% → `TWAPEngineV2` path slicing, not market sweep |
| 39 | ✅ | **Poisson Jitter Anti-MEV** | $1M+ clips: 18s–110s random intervals over 12–18 min parent window |
| 40 | ✅ | **Block 0 Sequencer Defense** | Private relay / QUIC + GMX `cancelOrder` atomic counter |

### V. Risk Matrix & Fail-Closed Severance (41–53)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 41 | ✅ | **Fail-Closed Haven** | `signingChannelOpen: false` during 3σ storms — no action > wrong action |
| 42 | ✅ | **R02 rootProtection** | Fatal errors / R17/R20 breach → kill Hot Key signature pipelines |
| 43 | ✅ | **R11 Dynamic Max SL** | Dynamic Account Risk Ceiling (V0.8 Baseline: Equity-Weighted SL; V1.0 Mainnet: Dynamic Adaptive Engine) — deprecated fixed $50 SL forbidden |
| 44 | ✅ | **R07 Notional Cap** | `SESSION_KEY_NOTIONAL_CAP_USD` = $5,000 per scoped session |
| 45 | ✅ | **R12 Leverage Scaling** | 3× → 1× → Halt escalation under funding regime stress |
| 46 | ✅ | **R13 Black-Swan Speed-Halt** | 3σ volatility spike → immediate dispatch freeze |
| 47 | ✅ | **R17 Daily Loss Severance** | Daily loss budget breach → circuit breaker + channel sever |
| 48 | ✅ | **R20 Physical Deadlock** | `R20_FLATTEN_FAILED` → hardlock + signing channel close |
| 49 | ✅ | **R09 Two-Phase Saga** | Intent ledger 2PC — no orphan venue legs |
| 50 | ✅ | **R10 Auto-Compensating Flatten** | Stalled hedge → automated unwind attempt before hardlock |
| 51 | ✅ | **Sequencer Guard** | 600s recovery grace — no naked opens during ArbOS desync |
| 52 | ✅ | **Oracle Lag Fail-Closed** | >30s Chainlink staleness → soil trip + signing sever |
| 53 | ✅ | **Emergency Margin Buffer** | `DEFAULT_CROSS_MMR = 0.05` — 5% equity reserve before new risk |

### VI. V1.5 / V2.0 Evolution & B2B (54–60)

| # | Status | Invariant | Mechanism |
|---|--------|-----------|-----------|
| 54 | ⏳ | **AI Agent Shield** | 30s TTL Session Keys protecting unattended bots from MEV & sequencer halts |
| 55 | ⏳ | **OI Inversion Lock** | GMX Open Interest 99% cap → opposite-leg lock; PnL & delta frozen |
| 56 | ⏳ | **Aave Cap Isolation** | Aave USDC supply cap 100% → automatic Morpho Blue degradation *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 57 | ⏳ | **PoR De-peg Defense** | Chainlink Proof-of-Reserve >0.5% RWA de-peg → execution hard-lock |
| 58 | ⏳ | **EIP-7702 Zero-Friction Onboarding** | EOA wallet → Smart Account without asset migration |
| 59 | ⏳ | **Dynamic Hurdle Rate** | Performance fee charged only above Aave benchmark + 1.5% *(Hurdle-rate probe only — not a yield-stacking product track)* |
| 60 | ⏳ | **Immutable B2B License** | Static **69.32 KiB gzip** Worker hot path powering CaaS ecosystem subscriptions |

---

## 4. Simulation & Stress Testing Harness

SliverVine Protocol 將 **simulation 視為 first-class risk artifact** — 非 marketing appendix。下方所有 harness 均為 offline 或對 live market data read-only；除非以 `--live` 明確 invoke，否則永不 mutate 生產 signing state。

> **SSOT verification hub：** 所有 CLI 命令、支柱映射與預期輸出 → [`docs/VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)

### 4.1 Survival Benchmark (HL Mainnet L2 + Dual-Radar)

**Survival Benchmark** 是 30 天 lookback 機構 stress report，融合 Hyperliquid mainnet L2 orderbook walks、Binance basis、funding history 與 Citadel soil audits。

| Parameter | Value | SSOT |
|-----------|-------|------|
| Canonical notional | **$100,000** (`NOTIONAL_USD`) | `scripts/survival-benchmark/survival-benchmark.types.ts` |
| Stress notional | **$1,000,000** (`STRESS_NOTIONAL_USD`) | Same |
| Lookback window | **30 days** | `LOOKBACK_MS` |
| Slippage fuse | **0.5%** (`MAX_SLIPPAGE`) | `soil-resistance-types.ts` |
| Depth floor | **$100,000** (`MIN_DEPTH_USD`) | Same |
| Output artifact | `docs/0801_BeDelta_Survival_Benchmark.md` | `scripts/survival-benchmark/index.ts` |

**Execution：**

```bash
pnpm tsx scripts/generate-survival-report.ts
```

**What it measures：**

1. **Live L2 book metrics** — spread, bid/ask depth, price impact @ $100k / $1M via `computeLiveBookMetrics()`.
2. **Soil resistance audit** — `auditLiveBookSoilResistance()` against `MIN_DEPTH_USD` and cross-venue slippage fuse.
3. **Dual-leg market vs SLI-TWAP** — `dualLegMarketSlip()` vs `simulateSliTwap()`; reports slippage saved at $100k and $1M.
4. **HL Dual-Radar composite** — 5-sensor matrix (funding, basis, depth, volatility, HUD state) over 30D funding equity curve.
5. **Phase isolations** — progressive weapon staging (Base → Full Spec) with single-variable isolation.

> **Grant evaluator note：** Survival Benchmark 驗證 **$100k 是 v1.0 design notional envelope** — 對齊 `ORDER_SIZE_MAX_USD`、`MIN_DEPTH_USD` 與 Alpha Vault Cap（§5.1）。

### 4.2 ZeroDev AA Gate Regression (`zerodev-aa-gate.test.ts`)

ZeroDev Citadel risk gate 是**可選 CLI/SDK pre-broadcast envelope**（未掛載於 Worker hot path）。其 Vitest suite 證明 fail-closed behavior 於任何 UserOp 到達 bundler 之前。

| Test case | Assertion | Risk control |
|-----------|-----------|--------------|
| Healthy soil pass | `assertCitadelRiskGate()` returns `sequencerSafe: true`, chain `42161` | Baseline AA route |
| Soil trip | Throws `RiskLimitExceeded` with `TRIP_SOIL_RESISTANCE` | Cross-venue slippage > fuse |
| Per-UserOp gas cap | Throws `ZERODEV_GAS_LIMIT_EXCEEDED_TRIP` when gas > **$0.50** | `MAX_GAS_COST_PER_USEROP_USD` |
| Daily sponsorship exhaustion | Falls back to `sponsored: false` at **$10/day** cap | `DAILY_SPONSORSHIP_LIMIT_USD` |

```bash
pnpm exec vitest run tests/adapters/zerodev-aa-gate.test.ts
```

**Read order for evaluators：**

```text
zerodev-aa-gate.test.ts → assertCitadelRiskGate() + evaluateZeroDevGasGuards()
zerodev-aa-gate.ts → evaluateStaticBreakerMatrix() + Citadel risk gate
 ├─ zerodev-aa-failover.ts → Arbitrum One health / AA probe route
 ├─ zerodev-aa-static-breaker.ts → soil + gas sponsorship limits
 └─ zerodev-aa-userop.ts → Paymaster + bundler dispatch (after gate PASS)
```

### 4.3 ZeroDev / HL Dry-Run Harnesses (No Live Broadcast)

| Harness | Command / Test | Scope |
|---------|----------------|-------|
| **ZeroDev AA Dry-Run** | `pnpm test:zerodev` → `tests/adapters/zerodev-aa-dryrun-harness.test.ts` | Kernel v3 EP 0.7 UserOp draft · session-key clip audit · Risk Oracle Gate simulation |
| **HL Panic Sandbox** | `pnpm tsx scripts/dry-run-sandbox.ts` | In-memory HL testnet stress → counter-attack → EIP-712 session-key pipeline (< 5ms hot path target) |
| **Grant E2E Demo** | `pnpm demo:pipeline` (default **dry-run**) | Full Citadel pipeline simulation; pass `--live` only for controlled mainnet ignition |
| **5-TX Verified Proof** | `pnpm verify:5tx` / `pnpm verify:grant` | Hyperliquid testnet 5-TX anchor with notional tiers ($1K / $100K / $1M) |
| **Negative Proofs** | `pnpm verify:negative` | Confirms soil trips on depth breach (`DEPTH_USD < MIN_DEPTH_USD`) |
| **AI Agent Interceptor** | `pnpm demo:agent` | `@slivervine/citadel-sdk` `withCitadelShield` — ALLOW / `--trip` FAIL_CLOSED |

> Production soil fuse on Edge 仍為 **`checkSoilResistance()`** — dry-run harnesses 驗證 adjacent paths，不取代 Worker SSOT。

---

## 5. Comparative Analysis: Arbitrum Native vs. Pillar 2 Reference Escort Adapter

V1.0 運作兩種** distinct capital ingress modes**。它們共享相同 Citadel pre-execution envelope。Robinhood / Across 是 **Pillar 2 Reference Escort Adapter** — 非產品身份。

### 5.1 Capacity Limits

| Dimension | **Arbitrum Native Ingress** | **Pillar 2 Reference Escort Adapter (Robinhood)** |
|-----------|----------------------------|------------------------------|
| **V1.0 Alpha Vault TVL cap** | **$100,000** hard ceiling (roadmap spec) | Same envelope — escort does not raise TVL cap |
| **Single-order notional (v1.0 live)** | `SESSION_KEY_NOTIONAL_CAP_USD` = **$5,000** | N/A until bridge settles on `42161` |
| **Single-order notional (v1.0 design)** | `ORDER_SIZE_MAX_USD` = **$100,000** | Post-settlement only; in-flight capital excluded from deployable NAV |
| **Depth prerequisite** | `MIN_DEPTH_USD` = **$100,000** on HL book | Same hedge leg requirements after settlement |
| **Gap-window tightening** | HL orderbook gap guard: depth **2×** ($200k) · leverage **3× → 1×** | Bridge timeout fail-closed — no naked GM/HL legs during in-flight |

**Quant anchor：** **$100,000** convergence 非 arbitrary — 它是 `MIN_DEPTH_USD`、`ORDER_SIZE_MAX_USD`、Survival Benchmark `NOTIONAL_USD` 與 `01_TECHNICAL_SPECIFICATION.md` §3.6 Alpha Vault Cap 的交集。

### 5.2 Execution Timing: Instant vs. In-Flight Bridge State Machine

```text
Arbitrum Native (Instant Path)
──────────────────────────────
User USDC on 42161 → checkSoilResistance() → GMX GM deposit + HL 1× short
 └─ p50 ~106 µs Wasm fuse · sub-second intent-to-gate

Robinhood Escort (Deferred Path)
────────────────────────────────
USDG on 46630 → evaluateAcrossBridgeTransfer() state machine:

 AVAILABLE ──(initiate)──► IN_FLIGHT_BRIDGE_CAPITAL ──(settle)──► SETTLED
 │
 └──(> 1h timeout)──► BRIDGE_TIMEOUT_FAIL_CLOSED
 lostUsd ≡ 0
```

| State | `capitalLabel` | Deployable? | `lostUsd` |
|-------|----------------|-------------|-----------|
| Pre-bridge | `AVAILABLE` | No (not on Arb yet) | **0** |
| In transit | `IN_FLIGHT_BRIDGE_CAPITAL` | **No** — naked positions forbidden | **0** |
| Settled | `SETTLED` | Yes — full Citadel envelope | **0** |
| Timeout | `BRIDGE_TIMEOUT_FAIL_CLOSED` | **No** — fail-closed severance | **0** |

**Code SSOT：** `evaluateAcrossBridgeTransfer()` in `src/adapters/across-ingress-bridge.ts` · Vitest **5/5 PASS**。

**Settlement latency honesty (Invariant #6)：** GMX async settlement **3–5 min** · HL withdrawal **~15 min** · Across bridge escort **≤ 1 h** before timeout fail-closed。Arbitrum-native ingress 完全 bypass bridge latency，但仍保留 GMX/HL settlement windows。

### 5.3 When to Use Which Path

| Use case | Recommended path | Rationale |
|----------|-----------------|-----------|
| Existing Arb USDC / GM positions | **Arbitrum Native** | Zero bridge latency · instant soil gate |
| Robinhood USDG institutional earn + compliance escort | **Robinhood Escort** | Outbound-only AML isolation · honest in-flight accounting |
| Storm / sequencer grace / 3σ halt | **Neither opens new risk** | `signingChannelOpen: false` · both paths fail-closed |

---

## 6. Institutional Compliance Alignment (Basel Accords Mapping)

> **Disclaimer：** 此 mapping 是 Grant 委員會與機構盡職的**架構對齊敘事** — 非監管認證聲明。SliverVine Protocol 實作與 Basel III operational-risk 及 ICAAP stress-testing 原則**呼應**的控制。

### 6.1 Basel III Operational Risk → Citadel Fail-Closed Controls

| Basel III concept | SliverVine Protocol control | Code / test anchor |
|-------------------|-------------|-------------------|
| **Internal control environment** | Unidirectional `SystemState` · no orphan venue legs (R09 Saga) | `intent-ledger.ts` · `tests/risk-control/*` |
| **Risk assessment** | Pre-execution `checkSoilResistance()` — depth, spread, slippage | `soil-resistance.ts` · `pkg/soil_core.wasm` |
| **Control activities** | Session-key scope (`ORDER_EXECUTE` only) · notional cap R07 | `session-key-gates.ts` · `SESSION_KEY_NOTIONAL_CAP_USD` |
| **Monitoring & reporting** | `GET /api/grant-audit` · [Dune PEV dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · 96h telemetry daemon | `pnpm telemetry:96h` · [`DUNE_DASHBOARD_SPECIFICATION.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION.md) |
| **Fail-safe severance** | R17 daily loss · R20 physical deadlock · signing channel close | `circuit-breaker.ts` · `flatten-hardlock.ts` |

### 6.2 `lostUsd ≡ 0` → Principle of Honest Loss Recognition

Basel operational-risk 框架要求 **pending/settlement exposures 不得被誤記為 realized losses**。SliverVine Protocol 將此強制為**硬不變量**：

```typescript
// src/adapters/across-ingress-bridge.ts — lostUsd is always 0 until explicit timeout labeling
lostUsd: number; // Always 0 — pending bridge liquidity is never booked as loss.
```

| Accounting state | Booked loss | Basel analog |
|------------------|-------------|--------------|
| `IN_FLIGHT_BRIDGE_CAPITAL` | **$0** | Settlement pending — not operational loss event |
| `BRIDGE_TIMEOUT_FAIL_CLOSED` | **$0** (capital state unknown, not written off) | Process failure → control trigger, not P&L recognition |
| Soil trip / R17 severance | Bounded by Dynamic Account Risk Ceiling (V0.8 Baseline: Equity-Weighted SL; V1.0 Mainnet: Dynamic Adaptive Engine) | Loss limit framework |

### 6.3 Stress Testing → Survival Benchmark & Dry-Run Matrix

| Basel ICAAP element | SliverVine Protocol harness | Frequency |
|---------------------|-------------|-----------|
| **Historical simulation** | Survival Benchmark 30D HL funding + L2 book | On-demand (`generate-survival-report.ts`) |
| **Stress scenarios** | $100k canonical + **$1M** stress notional (`STRESS_NOTIONAL_USD`) | Same report |
| **Reverse stress** | Negative proofs — depth breach, soil trip, bridge timeout | `pnpm verify:negative` |
| **Model validation** | Vitest **192 test files | 836 PASS Clean** full regression | CI / pre-release |

### 6.4 Three Lines of Defense Mapping

| Line | SliverVine Protocol layer | Examples |
|------|-----------|----------|
| **1st — Business / Ops** | Yield hurdle · rebalance rules · buffer engine (5–10% pre-hedge) | `rebalance-rules.ts` · `buffer-engine.ts` |
| **2nd — Risk / Compliance** | Soil resistance · PGATE · sequencer/oracle guards · bridge AML isolation | R01–R20 matrix (§3) |
| **3rd — Internal Audit** | Grant audit matrix · negative proofs · Survival Benchmark artifact | `pnpm audit:grant` · `docs/audit/*` |

### 6.5 ArbOS Elara Compliance Alignment & Dynamic Target Range

> **V1.0 Design Spec（on-chain reinforcement plane）。** Edge（Cloudflare）仍為 pre-broadcast SSOT；**ArbOS Elara upgrade** 原生對齊 **Pillar 2 AML Firewall** 與 protocol-level compliance filtering 及 **transaction-ordering awareness** — 永不作為 Edge fail-closed gates 的較弱替代。

| Layer | Compliance function | Transaction-ordering awareness | Status |
|-------|---------------------|-------------------------------|--------|
| **Edge Citadel (SSOT)** | `checkSoilResistance()` · R01–R20 · signing channel severance | Pre-broadcast intent ordering · UserOp gate before bundler | ✅ v1.0 Delivered (Sepolia verified) |
| **Pillar 2 AML Firewall + ArbOS Elara** | Outbound-only Robinhood escort · `AML_INBOUND_TO_ROBINHOOD_BLOCKED` · Elara ingress drops non-compliant / blacklisted senders before GM payload construction | Sequencer / ArbOS ordering sensor alignment · complements **`IngressSafetySwitch.sol`** | ⏳ V1.0 Design Spec ([`02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./02_STANDARD_COMPLIANCE_AND_EIP_WIKI.md#arbos--stylus-alignment--code-verified-on-chain-coprocessor)) |
| **UI reactive HUD** | `LivingWaterShieldCard` · `AMLShieldCard` · `SmartRoutingDepositCard` tranche switcher | Trip banners · Tranche A native vs Tranche B bridge state machine | ✅ v1.0 UI SSOT |

**Dynamic Target Range (non-guaranteed yield band)：**

| Parameter | Locked value | SSOT |
|-----------|--------------|------|
| **Dynamic Target Range** | **8.2% ~ 11.8% APY** (display band · not a guarantee) | `App.tsx` · DDIP §5.6 |
| **Hurdle Gate (friction buffer)** | **+0.5%** (`FRICTION_BUFFER_APY = 0.005`) — rebalance / performance fee only above friction-adjusted excess | `rebalance-rules.ts` |
| **Performance hurdle (planned)** | Aave benchmark + 1.5% before fee crystallization *(Hurdle-rate probe only — not a yield-stacking product track)* | Invariant #24 · #59 (⏳) |

```text
Net deployable excess = observed_yield − (Aave_base + FRICTION_BUFFER_APY)
Rebalance allowed ⇔ excess ≥ FRICTION_BUFFER_APY // Hurdle Gate
UI display band = 8.2% ~ 11.8% Dynamic Target Range (Non-Guaranteed)
```

**Design rule (Elara)：** Elara ingress filtering 與 ArbOS transaction-ordering awareness **強化** Edge fail-closed — 它們不 bypass `signingChannelOpen: false`、`BRIDGE_TIMEOUT_FAIL_CLOSED` 或 `ORACLE_LAG_DEADLOCK` severance。

---

## 7. Verification & Related Documents

### 7.0 Audit Walkthrough — Code Anchors (Grant Evaluators)

Evaluators 應將本文檔 claims 追溯至以下 SSOT paths：

| Pillar | Claim | Code SSOT | Test Anchor |
|--------|-------|-----------|-------------|
| **Bridge accounting** | `IN_FLIGHT_BRIDGE_CAPITAL` · `lostUsd ≡ 0` | [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) | [`tests/adapters/across-ingress-bridge.test.ts`](../../tests/adapters/across-ingress-bridge.test.ts) (5/5) |
| **ZeroDev AA gate** | Citadel risk gate before UserOp · failover · gas ledger | [`src/adapters/arbitrum/zerodev-aa/zerodev-aa-gate.ts`](../../src/adapters/arbitrum/zerodev-aa/zerodev-aa-gate.ts) (`zerodev-aa/zerodev-aa-gate.ts`) | [`tests/adapters/zerodev-aa-gate.test.ts`](../../tests/adapters/zerodev-aa-gate.test.ts) |
| **Smart Routing calldata** | USDG → GMX `ExchangeRouter` · `payloadHash()` binding · **Reference Harness** (production baseline = Arbitrum One Native Ingress) | [`src/services/adapters/gmx-smart-route-payload-binding.ts`](../../src/services/adapters/gmx-smart-route-payload-binding.ts) | [`tests/adapters/gmx-smart-route-payload-binding.test.ts`](../../tests/adapters/gmx-smart-route-payload-binding.test.ts) |
| **Wasm Soil Shield** | p50 ~106 µs pre-execution fuse | [`src/services/risk-control-lib/soil-resistance.ts`](../../src/services/risk-control-lib/soil-resistance.ts) · [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm) | `tests/risk-control/*` |

**ZeroDev AA execution path (read order)：**

```text
zerodev-aa-gate.ts → evaluateStaticBreakerMatrix() + Citadel risk gate
 ├─ zerodev-aa-failover.ts → Arbitrum One health / AA probe route
 ├─ zerodev-aa-static-breaker.ts → soil + gas sponsorship limits
 └─ zerodev-aa-userop.ts → Paymaster + bundler dispatch (after gate PASS)

gmx-smart-route-payload-binding.ts → buildGmxSmartRoutePayloadBinding()
 └─ gated-executor-payload.ts → computeGatedExecutorPayloadHash() → SliverVineGate
```

> **Note：** `zerodev-aa-gate.ts` 是可選 CLI/SDK Citadel risk gate — 未掛載於 Worker hot path。Production soil fuse 仍為 Edge 上的 `checkSoilResistance()`。

| Check | Command / Surface | Expected |
|-------|-------------------|----------|
| Full regression | `pnpm test -- --run` | **192 test files | 836 PASS Clean** |
| Bridge invariants | `pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts` | **5/5 PASS** |
| Live audit | `GET /api/grant-audit` | `lostUsd: 0` · guard states exposed |

> **Full verification matrix：** [`docs/VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) — Express → Three Pillars Inside → Outside

| Document | Purpose |
|----------|---------|
| [`01_TECHNICAL_SPECIFICATION.md`](./01_TECHNICAL_SPECIFICATION.md) | Yellow Paper — R01–R20 · Triangle Liquidity Loop |
| [`../audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](../audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) | Pillar 2 Compliance Ingress Firewall Audit |
| [`../sdk/CITADEL_SDK_BLUEPRINT.md`](../sdk/CITADEL_SDK_BLUEPRINT.md) | `@slivervine/citadel-sdk` integration |
