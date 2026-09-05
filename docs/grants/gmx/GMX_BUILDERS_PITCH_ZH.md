# GMX Builders Program — 申請套件

> **中文參考譯本** · 英文 SSOT：[`GMX_BUILDERS_PITCH.md`](./GMX_BUILDERS_PITCH.md)  
> **Vitest SSOT：** **836 tests** · Worker **69.32 KiB** gzip · **7 protocols** · **4 frameworks** · Milestone 1 PRs

**官方名稱：** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)  
**項目：** SliverVine Protocol — 面向 Arbitrum 上 AI Agent 的亞毫秒級 0-Gas 預廣播安全堡壘與風險導航器（GMX v2 GM Pool Gateway）  
**實體：** SilverVine Labs · **聯絡：** `grants@silvervinelabs.com`  
**官方站點：** [silvervinelabs.com](https://silvervinelabs.com)  
**倉庫：** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)  
**線上 HUD：** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz)  
**Grant Audit：** `curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .arbitrumCitadel`  
**渠道：** [t.me/GMXPartners](https://t.me/GMXPartners)

**受眾：** 僅 GMX Builders。勿以 ZeroDev / Robinhood / HL grant 敘事為主。

---

## 執行摘要

SliverVine 在 Arbitrum One 上交付開源 **GMX v2 預執行安全網關與低配重路由器**。在任何 GMX DataStore 廣播之前，Citadel edge 評估土壤阻力（slippage / depth / cross-spread）、sequencer 健康度與池偏斜——然後將合格流量路由至可降低失衡的 GM 池 **低配重側**。

每筆未簽名 increase / decrease / deposit payload 注入 **+10 bps `uiFeeReceiver`**（SliverVine Treasury via `GMX_UI_FEE_RECEIVER`）+ 可選 **25% referral rebate** — 協議原生 builder 累積，無托管。

---

## GMX 原生能力

| 能力 | 描述 | SSOT |
|------------|-------------|------|
| **Soil / slippage protection** | GM-bound flow 上 `checkSoilResistance()` fuse — depth、跨場 slip、GMX price-impact probe | `soil-resistance.ts` · `gmx-v2-price-impact.ts` |
| **Underweight-side router** | `isGmxBalancerQualified` — 僅在 rebalance **降低 GM skew** 時路由 | `gmx-v2-balancer.ts` |
| **+10 bps `uiFeeReceiver`** | 每筆未簽名 GMX v2 payload 注入（+ 可選 `referralCode` · 最高 **25%** rebate） | `gmx-v2-order-payload.ts` |
| **DataStore-safe path** | 廣播前 fail-closed；公開 audit JSON 脫敏 encode secrets | `GET /api/grant-audit` |
| **Sepolia dual-leg proof** | Arbiscan 錨定驗證產物供 builder diligence | `sepoliaDualLegProof` |

---

## GMX 受益原因

1. **黏性 GM TVL** — 時間加權留存 GM 持倉。
2. **失衡修復** — 低配重側路由降低池偏斜。
3. **Builder fee 對齊** — 路由成交量上 +10 bps `uiFeeReceiver`。
4. **審計透明** — Provenance 徽章 · 開源守衛 SSOT · 脫敏公開 API。

---

## 商業化與里程碑（$30k · $10k × 3）

| 收入流 | 機制 |
|--------|-----------|
| UI Fee (+10 bps) | 未簽名 payload 上 `uiFeeReceiver` · 最高 **25%** referral rebate |
| Underweight flow | 合格 rebalance 成交量歸因 |
| Referral | 可選 `referralCode`（bytes32） |

| 里程碑 | 範圍 | 狀態 |
|-----------|-------|--------|
| **M1** | **v1.0 Delivered（Sepolia verified）** · pre-exec gateway · Live HUD · +10 bps routing · `/api/grant-audit` · **836 tests** | ✅ Delivered（Sepolia & dry-run；主網對應 M6） |
| **M2** | Institutional gateway · sidecar daemon · `claimUiFees` | ✅ Core Built（Sidecar Daemon Ready / Awaiting Treasury Claim Hook） |
| **M3** | Multi-tenant B2B · cross-venue compensation SLA | Roadmap（Multi-tenant B2B & Cross-venue SLA） |

---

## 驗證（60 秒）

```bash
pnpm install && pnpm test && npx tsc --noEmit
pnpm run audit:security # 5/0/0 PASS target
curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .arbitrumCitadel.isGmxBalancerQualified
```

**回歸基線：** **836 tests** · Forge 60/60 · **327,675 Property Fuzz Executions**（`pnpm audit:nightly` / `FOUNDRY_PROFILE=deep`；標準 `forge test` = 5,120）· Wasm `<28kb` / `<60µs`。

---

## 相關文檔

| 文檔 | 用途 |
|----------|---------|
| [`../README_ZH.md`](../README_ZH.md) | Grants 索引 |
| [`../../architecture/01_TECHNICAL_SPECIFICATION.md`](../../architecture/01_TECHNICAL_SPECIFICATION.md) | R01–R20 不變量 |
| [`../../ARB_Buildathon/SUBMISSION.md`](../../ARB_Buildathon/SUBMISSION.md) | Buildathon / Arbitrum 提交套件（不同受眾） |
