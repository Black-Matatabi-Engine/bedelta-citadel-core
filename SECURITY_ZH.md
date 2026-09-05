> **中文參考譯本 · 英文原文為 Grant SSOT**  
> English SSOT: [SECURITY.md](./SECURITY.md)

# Security Policy — SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)

> **Vitest SSOT:** 192 test files | 836 PASS Clean

**Entity:** SilverVine Labs · **Contact:** `security@silvervinelabs.com`
**Official Site:** [silvervinelabs.com](https://silvervinelabs.com) — Defense Matrix portal
**Grant / audit:** `grants@silvervinelabs.com`

---

## Reporting a Vulnerability

我們嚴肅對待安全報告。對於可利用的發現，請**勿**公開開立 GitHub issue。

1. 寄信至 `security@silvervinelabs.com`，內容包含：
 - 描述與影響
 - 重現步驟或概念驗證（PoC）
 - 受影響的 commit 或已部署版本 ID（來自 `wrangler deploy` 輸出）
2. 我們於 **72 小時內**確認，並目標於 **7 個工作天內**完成初步評估。
3. 協調揭露 — 我們傾向於公開揭露前先協調發布。

**Out of scope:** 社交工程、實體攻擊、我方 Worker 邊界外的第三方場所（GMX / Hyperliquid / Arbitrum）漏洞、無利用鏈的拒絕服務攻擊。

---

## Fail-Closed Security Guarantees

SliverVine Citadel 設計為 **fail-closed** — 模糊或不安全狀態將中止簽名與廣播：

| Layer | Module | Guarantee |
|-------|--------|-----------|
| Sequencer Guard | `sequencer-guard.ts` | Arbitrum sequencer 不健康時不 dispatch（600s grace） |
| Oracle Lag Shield | `arbitrum-gas-guard.ts` | 規範 lag 超過上限時 HALT（&lt;120ms grant posture） |
| Soil Resistance | `risk-control/soil.ts` | 深度、跨價差或滑點 fuse 觸發時拒絕交易 |
| Root Protection | `rootProtectionService.ts` | Fatal / R17·R20 觸發時終止 hot-key 簽名管線 |
| Dynamic Max SL | `effective-max-sl.ts` | Dynamic Account Risk Ceiling（V0.8 Baseline: Equity-Weighted SL；V1.0 Mainnet: Dynamic Adaptive Engine）— 已棄用之固定 $50 SL 嚴禁使用 |
| Session Key | `session-key-adapter` | 過期或已撤銷金鑰 → READ_ONLY_OBSERVER |
| RPC Whitelist | `rpc-whitelist.ts` | 外部 RPC 受監控；延遲 &gt;500ms 觸發熔斷 |

**No custody:** Worker 不持有使用者私鑰。Session keys 為客戶端範圍；主網密鑰存於 Cloudflare Secrets Store / `wrangler secret` — 絕不在 repo 或 KV 中。

**KV tenancy:** 單一 namespace ID，嚴格 key-prefix 隔離（`exec:*`、`state:*`、`sys:*`）。見 `wrangler.toml` 註解與 [docs/architecture/01_TECHNICAL_SPECIFICATION.md](./docs/architecture/01_TECHNICAL_SPECIFICATION.md)。

**Public audit surface:** `GET /api/grant-audit` 暴露 guard 狀態與遙測 — 絕不暴露簽名材料、calldata 模板或專有 encode 路徑。

---

## Supported Versions

| Component | Branch / tag | Support |
|-----------|--------------|---------|
| bedelta-living-water Worker | `main`（Grant Public SSOT） | Active |
| Closed WASM Kernel experiment | `feat/wasm-opsec-kernel-experiment` | Experimental — 不納入 Grant 公開驗證 |
| Grant Audit HUD | production deploy | Active |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [docs/architecture/01_TECHNICAL_SPECIFICATION.md](./docs/architecture/01_TECHNICAL_SPECIFICATION.md) | Topology · R01–R20 · KV isolation |
| [docs/grants/arbitrum/GRANT_PROPOSAL.md](./docs/grants/arbitrum/GRANT_PROPOSAL.md) | Scope & roadmap |
| [docs/README.md](./docs/README.md) | Audience router |
