# SilverVine Protocol — Cloudflare Mainnet Deployment Roadmap
# SilverVine Protocol — Cloudflare 主網部署路線圖

**Phase / 階段:** 10 · Task 1  
**Date / 日期:** 2026-07-25  
**Target domain / 目標網域:** `dev-santenbokui.slivervine.xyz`  
**Worker name / Worker 名稱:** `silvervine-app`  
**Reference / 參考:** `docs/audit/READONLY_SECURITY_AUDIT.md`, `wrangler.jsonc`

---

## Overview / 概覽

Four sequential deployment steps from secret injection to live telemetry validation. Do not skip or reorder.

從密鑰注入到線上遙測驗證的四步部署流程。不可跳步或調序。

| Step / 步驟 | Action / 動作 | Command / 指令 |
|---|---|---|
| 1 | Build & pre-check / 建置預檢 | `pnpm exec tsc --noEmit && pnpm test && pnpm run build:worker` |
| 2 | XuanWu secrets / XuanWu 密鑰 | `wrangler secret put XUANWU_SALT` (+ OWNER_IDENTITY, JAVIER_SIGNATURE) |
| 3 | Deploy / 部署 | `pnpm run deploy:cf` |
| 4 | HUD SSOT verify / HUD 驗證 | `curl -H "X-Santenmoku-Canary: santenmoku" /api/hud-stream` |


## Santenmoku Deployment SOP (XuanWu Matrix)

Four-step operator checklist for Worker + Pages bundle. Do not skip or reorder.

| Step | Action | Command |
|---|---|---|
| 1 | Build & pre-check | `pnpm exec tsc --noEmit && pnpm test && pnpm run build:worker` |
| 2 | XuanWu secret provisioning | `wrangler secret put XUANWU_SALT` · `OWNER_IDENTITY` · `JAVIER_SIGNATURE` |
| 3 | Cloudflare deploy | `pnpm run deploy:cf` |
| 4 | HUD SSOT verification | `curl -H "X-Santenmoku-Canary: santenmoku" /api/hud-stream` |

### Step 1 — Build & TypeScript pre-check

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm run build:worker
```

`build:worker` compiles the SPA (`dist/`) and dry-runs the Worker bundle to `dist-worker/`.

### Step 2 — Wrangler secrets (XuanWu Triple-String)

```bash
wrangler secret put XUANWU_SALT          # literal: 玄武
wrangler secret put OWNER_IDENTITY       # literal: 0xWallet (identity tag, not a wallet)
wrangler secret put JAVIER_SIGNATURE     # literal: Javier
```

Public HUD canary (non-secret) is set in `wrangler.jsonc` `vars.NEXT_PUBLIC_HUD_CANARY=santenmoku` and mirrored in Vite build env.

KV bindings: `SLIVERVINE_KV` + `SYSTEM_STATE_KV` → namespace `af57772629914596b206aef2b5935cf5`.

### Step 3 — Deploy

```bash
pnpm run deploy:cf
```

Runs typecheck, full Vitest suite, SPA build, then `wrangler deploy`.

### Step 4 — Single-source HUD verification

```bash
curl -s -H "X-Santenmoku-Canary: santenmoku" \
  https://dev-santenbokui.slivervine.xyz/api/hud-stream | jq .
curl -s https://dev-santenbokui.slivervine.xyz/api/telemetry/health | jq .
```

Expected: `success: true`, `leftEyeDefense`, `rightEyeProbe`, `crownTreasuryPnl` populated; no `locked: true`.

---

**Pre-requisites / 前置條件:** `wrangler.jsonc` must declare `SILVERVINE_KV` (bound) and route `dev-santenbokui.slivervine.xyz`. Audit bundle baseline: **~63 KB** (`dist-worker/index.js`).


**前置條件：** `wrangler.jsonc` 已宣告 `SILVERVINE_KV` 綁定及路由 `dev-santenbokui.slivervine.xyz`。審計 bundle 基線：**約 63 KB**（`dist-worker/index.js`）。

---

## Step 1 — Secret Provisioning / 密鑰配置

**Goal / 目標:** Inject runtime secrets into the `silvervine-app` Worker via Wrangler CLI. Secrets are never committed to repo (see `src/env.ts`).

**目標：** 透過 Wrangler CLI 將執行時密鑰注入 `silvervine-app` Worker。密鑰永不提交至 repo（見 `src/env.ts`）。

### 1.1 Required secret / 必要密鑰

```bash
npx wrangler secret put GAS_WEBHOOK_URL
```

Prompts for Google Apps Script webhook URL used by matrix persistence (`src/services/gas-sheet.ts`).

提示輸入 Google Apps Script webhook URL，供 matrix 持久化使用（`src/services/gas-sheet.ts`）。

### 1.2 Optional secrets / 可選密鑰

```bash
npx wrangler secret put PYTHON_GATEWAY_URL
```

### 1.3 Verify secrets bound / 確認密鑰已綁定

```bash
npx wrangler secret list
```

Expected / 預期: `GAS_WEBHOOK_URL` appears (value hidden).  
預期：`GAS_WEBHOOK_URL` 出現於清單（值隱藏）。

### Step 1 Pass Criteria / 步驟 1 通過標準

- [ ] `GAS_WEBHOOK_URL` listed in `wrangler secret list` / 密鑰清單含 `GAS_WEBHOOK_URL`
- [ ] No secrets in git working tree / git 工作區無密鑰檔

---

## Step 2 — Dry-run Verification / 乾跑驗證

**Goal / 目標:** Build SPA + typecheck + bundle Worker without publishing. Confirm script size stays within audit budget (≤ 100 KB; baseline ~63 KB).

**目標：** 建置 SPA + 型別檢查 + 打包 Worker 但不發布。確認腳本體積符合審計預算（≤ 100 KB；基線約 63 KB）。

### 2.1 Build SPA assets / 建置 SPA 靜態資源

```bash
pnpm run build:spa
```

### 2.2 Typecheck / 型別檢查

```bash
npx tsc --noEmit
```

### 2.3 Dry-run deploy (bundle only) / 乾跑部署（僅打包）

```bash
WRANGLER_WRITE_LOGS=false npx wrangler deploy --dry-run --outdir=dist-worker
```

One-liner equivalent (matches `pnpm run build`) / 單行等效（同 `pnpm run build`）：

```bash
pnpm run build:worker
```

### 2.4 Measure bundle size / 量測 bundle 大小

```bash
wc -c dist-worker/index.js
```

Expected / 預期:

```
63608 dist-worker/index.js   # ~63 KB audit baseline / 約 63 KB 審計基線
```

Hard ceiling / 硬性上限: **≤ 102,400 bytes (100 KB)** · **≤ 102,400 位元組**

### 2.5 Heavy-dep leak guard / 重型依賴洩漏檢查

```bash
grep -E "ethers|react|msgpack" dist-worker/index.js && echo "FAIL" || echo "PASS"
```

Expected / 預期: **PASS / 通過**

### Step 2 Pass Criteria / 步驟 2 通過標準

- [ ] `npx wrangler deploy --dry-run` exits 0 / 乾跑退出碼 0
- [ ] `dist-worker/index.js` ≤ 100 KB / bundle ≤ 100 KB
- [ ] No `ethers` / `react` / `msgpack` in bundle / bundle 無重型依賴

---

## Step 3 — Production Deployment / 正式部署

**Goal / 目標:** Publish Worker + SPA assets to Cloudflare edge at `dev-santenbokui.slivervine.xyz`.

**目標：** 將 Worker + SPA 靜態資源發布至 Cloudflare 邊緣 `dev-santenbokui.slivervine.xyz`。

### 3.1 Deploy / 部署

```bash
pnpm run deploy:cf
```

Full pipeline (SPA build + deploy) / 完整管線（SPA 建置 + 部署）：

```bash
pnpm run deploy:cf
```

Equivalent / 等效：

```bash
pnpm run build:spa && npx wrangler deploy
```

### 3.2 Confirm deployment / 確認部署

```bash
npx wrangler deployments list
```

Expected / 預期: Latest deployment shows **Active** status.  
預期：最新部署狀態為 **Active**。

### 3.3 KV binding sanity (optional) / KV 綁定確認（可選）

```bash
npx wrangler kv key list --binding SILVERVINE_KV
```

Confirms `SILVERVINE_KV` namespace (`af57772629914596b206aef2b593scf5`) is reachable from Worker.

確認 Worker 可存取 `SILVERVINE_KV` namespace（`af57772629914596b206aef2b593scf5`）。

### Step 3 Pass Criteria / 步驟 3 通過標準

- [ ] `npx wrangler deploy` exits 0 / 部署退出碼 0
- [ ] `wrangler deployments list` shows active version / 清單顯示 active 版本
- [ ] Route `dev-santenbokui.slivervine.xyz` resolves / 路由可解析

---

## Step 4 — Live Telemetry Verification / 線上遙測驗證

**Goal / 目標:** Validate `/api/telemetry/health` returns public JSON telemetry (no secrets) from the live edge.

**目標：** 驗證線上邊緣 `/api/telemetry/health` 回傳公開 JSON 遙測（不含密鑰）。

### 4.1 Health probe / 健康探針

```bash
curl -s "https://dev-santenbokui.slivervine.xyz/api/telemetry/health" | jq .
```

### 4.2 HTTP status & latency / HTTP 狀態與延遲

```bash
curl -s -o /dev/null -w "HTTP %{http_code} · TTFB %{time_starttransfer}s\n" \
  "https://dev-santenbokui.slivervine.xyz/api/telemetry/health"
```

Expected / 預期: **HTTP 200** · TTFB < 500 ms.  
預期：**HTTP 200** · TTFB < 500 ms。

### 4.3 Response shape validation / 回應結構驗證

Expected JSON fields / 預期 JSON 欄位:

```json
{
  "success": true,
  "timestamp": "<ISO-8601>",
  "criIndex": 100,
  "hudState": "GREEN",
  "soilResistance": {
    "status": "STANDBY",
    "hedgeChannelActive": false
  },
  "activeVenues": ["HL", "POLYMARKET", "JUPITER"],
  "circuitBreakers": {
    "r20Locked": false,
    "hardlock": false,
    "signingChannelOpen": true,
    "dynamicMaxSlUsd": 0
  }
}
```

Field presence check / 欄位存在性檢查：

```bash
curl -s "https://dev-santenbokui.slivervine.xyz/api/telemetry/health" \
  | jq -e '.success == true and .criIndex != null and .circuitBreakers != null'
```

Expected / 預期: exit code **0**.  
預期：退出碼 **0**。

### 4.4 Secret leak guard / 密鑰外洩防護

```bash
curl -s "https://dev-santenbokui.slivervine.xyz/api/telemetry/health" \
  | grep -iE "webhook|secret|private|0x[0-9a-fA-F]{64}" \
  && echo "FAIL — possible secret leak" \
  || echo "PASS — no secrets in response"
```

Expected / 預期: **PASS — no secrets in response / 回應中無密鑰**

### Step 4 Pass Criteria / 步驟 4 通過標準

- [ ] `/api/telemetry/health` → **HTTP 200** / 回傳 **HTTP 200**
- [ ] `success: true` with `criIndex`, `circuitBreakers`, `activeVenues` / 含必要欄位
- [ ] No secret patterns in response body / 回應本體無密鑰模式

---

## Rollback / 回滾

If Step 4 fails after deploy, roll back immediately:

若步驟 4 部署後失敗，立即回滾：

```bash
npx wrangler rollback
npx wrangler deployments list
```

---

## Sign-Off Checklist / 簽核清單

| Step / 步驟 | Owner / 負責人 | Status / 狀態 | Date / 日期 |
|---|---|---|---|
| 1 — Secret Provisioning / 密鑰配置 | | ☐ | |
| 2 — Dry-run Verification / 乾跑驗證 | | ☐ | |
| 3 — Production Deployment / 正式部署 | | ☐ | |
| 4 — Live Telemetry / 線上遙測 | | ☐ | |

---

*Generated per `docs/SAVE_TOKEN_SOP.md` §6 — Internal Documentation Bilingual Format.*  
*依 `docs/SAVE_TOKEN_SOP.md` §6 內部文件雙語格式生成。*
