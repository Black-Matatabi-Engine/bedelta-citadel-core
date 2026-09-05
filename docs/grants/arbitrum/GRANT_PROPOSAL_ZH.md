# Arbitrum Grant Proposal — SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)：面向 Arbitrum 上 AI Agent 的亞毫秒級 0-Gas 預廣播安全堡壘與風險導航器

> **中文參考譯本** · 英文 SSOT：[`GRANT_PROPOSAL.md`](./GRANT_PROPOSAL.md)  
> **Vitest SSOT：** **836 tests** · Worker **69.32 KiB** gzip · **7 protocols** · **4 frameworks** · Milestone 1 PRs

**官方名稱：** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)  
**實體：** SilverVine Labs · **聯絡：** `grants@silvervinelabs.com`  
**官方站點：** [silvervinelabs.com](https://silvervinelabs.com)  
**倉庫：** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)  
**線上 DApp：** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz)

**受眾：** Arbitrum 生態 / Open House / 未來 Security Grant。  
**非本套件：** GMX `uiFeeReceiver` 經濟學 → [`../gmx/`](../gmx/)。

---

## 1. 執行摘要

SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) 是面向 Arbitrum 上 AI Agent 的亞毫秒級 0-Gas 預廣播安全堡壘與風險導航器。SliverVine 在 **Arbitrum One** 部署 **Zero-Trust Pre-Execution Citadel**，含 **Sepolia** 雙腿 provenance 與 L1 **`SliverVineGate.sol`** consume-once attestation lock。任何 Arbitrum 廣播之前，Edge 感測器（sequencer、oracle lag、soil）fail-closed；生產 attestation 綁定 Gate `verifyingContract`。

**Interceptor Moat：** 在 MEV bot 或 Sequencer mempool 看到交易 **之前**，於 **p50 ~106 μs** 決定執行安全性。Builder **+10 bps `uiFeeReceiver`** + 最高 **25% referral rebate** 為標準 GMX Builders 商業化 — 次於 sub-ms 風險網關。

LP 退出語義：協議強制 **零協議級鎖定期（100% 非托管）；赎回速度僅受 GMX v2 原生 3–5 分鐘 async Keeper 結算限制。**

**v1.0 Delivered（Sepolia verified）** · 主網部署對應 **M6 Grant distribution**。

安全盡職為一等公民：**3-Tier Audit Matrix** — security tier **5/0/0 PASS** 位於 `docs/audit/static-analysis-report.json`（Vitest、Forge、Slither、Aderyn、pnpm-audit）；`security-scorecard.json` 鏡像最近一次運行的 `"tier"`。Nightly 增加 Echidna / deep fuzz（探索性）。Formal invariants 經原生 Foundry suite 驗證（`SliverVineGate.t.sol` & `SliverVineGate.invariant.t.sol`）。

---

## 2. Arbitrum 交付物（Live）

| 交付物 | SSOT | 狀態 |
|-------------|------|--------|
| L1 Gate consume-once | `SliverVineGate/` · Forge 60/60 · 327,675 fuzz | Live |
| Edge Citadel on Arb One | Workers · sequencer / gas / soil | Live |
| Sepolia dual-leg proof | `sepoliaDualLegProof` in `/api/grant-audit` | Live |
| 3-Tier security scorecard | `docs/audit/security-scorecard.json` | Live |
| Wasm soil core | `pkg/soil_core.wasm` `<28kb` / `<60µs` | Live |
| Pendle Institutional Shield | `pendle-market-oracle-adapter.ts` · `pendle-gmx-cross-guard.ts` · soil-wired | Live |
| R01–R20 matrix | Technical Specification | **17 / 2 / 1** |

---

## 3. 差異化（Arbitrum Security）

| 缺口 | 典型 L2 工具包 | SliverVine Citadel |
|-----|--------------------|--------------------|
| Pre-broadcast risk | Post-trade monitors | Fail-closed Edge + Gate attestation |
| Attestation replay | Soft off-chain checks | On-chain consume-once |
| Audit automation | Ad-hoc scripts | Fast / Security / Nightly matrix |
| Agent / AA drift | Unsigned UserOps | Bound via SDK + Gate（提交 AA 時見 ZeroDev pack） |

---

## 4. v1.0 Delivered Scope vs Post-Grant Roadmap

| 時間線 | 狀態 | 範圍 |
|---------|--------|-------|
| **v1.0 Delivered（Sepolia verified）** | ✅ Live | 面向 Arbitrum 上 AI Agent 的亞毫秒級 0-Gas 預廣播安全堡壘 · GMX v2 ETH/USDC GM + HL 1× short · **Pendle Institutional Shield**（Core Pillar 3 · sync oracle · soil fuse）· Wasm Shield p50 ~106µs · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) Draft · EIP-712 Gate `0xb174…` · **836 tests** · Sepolia / dry-run verified；主網對應 M6 |
| **V1.5 Roadmap Spec** | ⏳ Planned | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) fleet enforcement · EIP-7702 EOA → Agent Smart Account · Prompt Injection Defense Circuit（`severSigningChannel()` sub-100µs） |
| **V2.0 Design Spec** | ⏳ Planned | Institutional CaaS（`@slivervine/citadel-sdk`）for AI DEXs & Orbit L3s · 預執行風險檢查上 **10 bps protocol authorization fee** |

| 階段 | 範圍 | 狀態 |
|-------|-------|--------|
| Open House / Buildathon | Live HUD · Gate · Sepolia proof · **836 tests** · 5-step E2E（`pnpm run demo:e2e`） | ✅ Submitted |
| Security Grant pack | Cold audit pack · R01–R20 + Slither/Echidna narrative | ⏳ Planned |
| Institutional AA | Kernel v3 Session Key — [ZeroDev Comparative Analysis](../../audit/02_PILLAR_1_GATEHOUSE_ZERODEV_AA_ANALYSIS.md) · [Technical Specification §2.4](../../architecture/01_TECHNICAL_SPECIFICATION.md#24-pillar-1--zerodev-account-abstraction-deep-specification) | ✅ Delivered in v1.0 |

---

## SSOT Verification Lock（Buildathon Judges）

| 欄位 | 鎖定值 |
|-------|--------------|
| **Vitest baseline** | **836 tests** |
| **Sepolia Gate** | `0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **Dune dashboard** | [https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) |
| **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196)** | 與 Emerging Draft（Virtuals Protocol）對齊 — **非 finalized standard** |

**核心不變量：** $\Delta_{\text{net}} \equiv 0$ · $\text{lostUsd} \equiv 0 \quad \forall \text{InFlightBridgeCapital}$ · $t_{\text{reflector\_p50}} \sim 106\,\mu\mathrm{s}$ — [Technical Specification §3.1](../../architecture/01_TECHNICAL_SPECIFICATION.md#31-microsecond-moats)。

---

## 🛣️ Post-Buildathon B2B 商業化與 PMF Roadmap（Post-9/14）

SliverVine Protocol 執行嚴格兩階段策略，平衡 Zero-Friction Hackathon Verification 與長期商業可持續性：

- **Stage 1: Buildathon Verification Phase（Active Now — Pre-9/14）**
  - **100% Free Public Telemetry**：開放 Dune Live Telemetry Dashboard（[https://dune.com/silvervinelabs/silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)）供 judge 與開發者零摩擦審計。
  - **Sepolia Safety Gate**：Arbitrum Sepolia 上完整 EIP-712 session key 驗證與 0-Gas Fail-Closed 保護（`0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1`）。

- **Stage 2: B2B Monetization & Risk API Launch（Post-9/14）**
  - **SliverVine Citadel Risk API & Bad Debt Calculator**（由鏈上遙測與 Dune Analytics 視覺化驅動）：透過 B2B API 商業化 SliverVine 專有 sub-ms 風險計算算法與 shadow margin 遙測 — **非** Dune 平台數據轉售。[Dune](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) 仍為 **免費公開視覺化 dashboard**；付費層（$199/mo Pro 至 $1,999/mo Enterprise）對 vault managers 與 AI Agent swarms（Wayfinder、Virtuals、M2M Treasury Funds）開放 Citadel 計算的清算風險、margin health、bad-debt savings 指標的程式化存取。
  - **V2.0 CaaS rail（Design Spec）：** `@slivervine/citadel-sdk` + 預執行風險檢查上 **10 bps protocol authorization fee**。Live v1.0 builder lane 仍為 GMX **+10 bps `uiFeeReceiver`**。

---

## 5. 驗證

```bash
pnpm install
pnpm test # 836 tests
pnpm run audit:security # 5/0/0 PASS
pnpm run demo:e2e # 5-step Citadel E2E (dry-run)
cd SliverVineGate && forge test && cd ..
curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .sepoliaDualLegProof
```

---

## 相關文檔

| 文檔 | 用途 |
|----------|---------|
| [`../../ARB_Buildathon/SUBMISSION.md`](../../ARB_Buildathon/SUBMISSION.md) | Submission pack |
| [`ARBITRUM_ONE_PAGER_ZH.md`](./ARBITRUM_ONE_PAGER_ZH.md) | One-pager |
| [`../../architecture/01_TECHNICAL_SPECIFICATION.md`](../../architecture/01_TECHNICAL_SPECIFICATION.md) | R01–R20 |
| [`../../audit/`](../../audit/) | Scorecards |
| [`../gmx/GMX_BUILDERS_PITCH_ZH.md`](../gmx/GMX_BUILDERS_PITCH_ZH.md) | GMX-only economics |
