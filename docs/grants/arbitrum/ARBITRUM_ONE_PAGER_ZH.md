# SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)：面向 Arbitrum 上 AI Agent 的亞毫秒級 0-Gas 預廣播安全堡壘與風險導航器

> **中文參考譯本** · 英文 SSOT：[`ARBITRUM_ONE_PAGER.md`](./ARBITRUM_ONE_PAGER.md)  
> **Vitest SSOT：** **836 tests** · Worker **69.32 KiB** gzip · **7 protocols** · **4 frameworks** · Milestone 1 PRs

**文檔：** Arbitrum 技術一頁簡報  
**官方名稱：** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)  
**定位：** Arbitrum One 上的 GMX v2 預執行安全網關與低配重路由器。  
**身份：** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) 是面向 Arbitrum 上 AI Agent 的亞毫秒級 0-Gas 預廣播安全堡壘與風險導航器。

| | |
| -------------- | ----------------------------------------------------------------------------------------------- |
| 實體 | SilverVine Labs · `grants@silvervinelabs.com` |
| 官方站點 | [silvervinelabs.com](https://silvervinelabs.com) — Defense Matrix 入口 |
| 倉庫 | [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water) |
| 線上 DApp | [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) |
| 回歸基線 | **836 tests** · `tsc --noEmit` clean |
| 授權 | BUSL-1.1 → M2 / $10M TVL 或 24 個月後 Apache-2.0 |
| 規格 SSOT | [`docs/architecture/01_TECHNICAL_SPECIFICATION.md`](../../architecture/01_TECHNICAL_SPECIFICATION.md) |

---

## 功能概述

在任何 GMX DataStore 廣播之前，Citadel Edge 會評估 sequencer 健康度、oracle 延遲、土壤阻力（含 **Pendle Institutional Shield** — V1.0 核心支柱 3 · 同步 oracle · `PENDLE_ORACLE_STALE` fail-closed），以及池子偏斜——然後將合格流量路由至 GM 池 **低配重側**，以降低失衡。Hyperliquid session-key 對沖為 Emergency Liquidity Sponge 後備方案。

**三角流動性迴路：** `Robinhood Chain（支柱 2 參考護航 Adapter）` ↔ `Arbitrum One（GMX GM 收益基地）` ↔ `Hyperliquid（1× Short 對沖）`。

**Arbitrum 原生執行溢價：** 直接 Arbitrum One 流動性提供者相較橋接 / 多跳路由，估計可獲 **+15 ~ 30 bps** 執行溢價（Stylus 對齊入口 · 更低跨場摩擦 · 低配重 rebate 捕捉）。

## Robinhood Chain 狀態

| 網路 | Chain ID | 狀態 |
| ----------------- | --------- | ---------------------------------------------------------------------------- |
| Robinhood Testnet | **46630** | **ACTIVE / TESTED** |
| Robinhood Mainnet | **4663** | **DEPLOYMENT READY**（許可制 RWA 分層 · 入站預設封鎖） |

## 線上證明

- **1 筆線上主網訂單：** 0.2223 ETH Short，OID `513344575969`（hyperliquid-mainnet）—— 可透過 `GET /api/grant-audit` 中的 `provenanceVerified` 機器讀取。
- **5-TX 已驗證測試網套件：** HL 測試網成交打包於 `src/data/verified_5tx_results.json`。
- **Arbiscan Sepolia 錨點：** 雙腿證明包（`sepoliaDualLegProof`）；模擬腿明確標記 `simulated: true`。

## 防禦姿態

| 守衛 | 閾值 |
| -------------------------- | ------------------------------------------------- |
| Chainlink Sequencer Uptime | 600s grace · fail-closed |
| Canonical Oracle Lag | <30s（30,000ms）相對 L2 block headers · fail-closed |
| Dynamic Max SL | Dynamic Account Risk Ceiling（V0.8 基線：權益加權 SL；V1.0 主網：Dynamic Adaptive Engine） |
| CrossVenueNetSlippage | >0.5% → soil trip + TWAP |
| NTP / Pgate latency | <200ms drift / RTT fuse |
| Emergency Margin Buffer | 5% |
| Daily Loss Breaker | 1.5% MDD · Root lockout |
| Decision SLO | 500ms · fail-closed |
| Cron Auto-Rebalancer | 5-min · $10 drift gate · circuit breaker |

## GMX 受益原因

1. 黏性 GM TVL — 時間加權留存持倉。
2. 失衡修復 — 低配重側路由降低池偏斜 · 正向 skew rebate 捕捉。
3. Builder fee 對齊 — 每筆路由未簽名 payload 上 **+10 bps** `uiFeeReceiver` + 最高 **25%** referral rebate。
4. 原生 LP 溢價 — 直接 Arbitrum One 提供者 **+15 ~ 30 bps**。
5. 審計透明 — provenance 徽章、開源守衛 SSOT、脫敏公開 API。

## 驗證（60 秒）

```bash
pnpm install && pnpm test && npx tsc --noEmit
curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .provenanceVerified
```
