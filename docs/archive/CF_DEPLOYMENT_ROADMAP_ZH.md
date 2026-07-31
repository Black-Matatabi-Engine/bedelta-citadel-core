# SilverVine Protocol — Cloudflare 主網部署路線圖

**階段：** 10 · 任務 1  
**日期：** 2026-07-25  
**目標網域：** `dev-santenbokui.slivervine.xyz`  
**Worker 名稱：** `silvervine-app`  
**參考：** `docs/audit/READONLY_SECURITY_AUDIT.md`、`wrangler.jsonc`

---

## 概覽

從密鑰注入到線上遙測驗證的四步部署流程。不可跳步或調序。

| 步驟 | 動作 | 指令 |
|---|---|---|
| 1 | 建置預檢 | `pnpm exec tsc --noEmit && pnpm test && pnpm run build:worker` |
| 2 | XuanWu 密鑰 | `wrangler secret put XUANWU_SALT`（及 OWNER_IDENTITY、JAVIER_SIGNATURE） |
| 3 | 部署 | `pnpm run deploy:cf` |
| 4 | HUD 驗證 | `curl -H "X-Santenmoku-Canary: santenmoku" /api/hud-stream` |


## Santenmoku 部署 SOP（XuanWu 安全矩陣）

Worker + Pages bundle 四步操作清單。不可跳步或調序。

| 步驟 | 動作 | 指令 |
|---|---|---|
| 1 | 建置與預檢 | `pnpm exec tsc --noEmit && pnpm test && pnpm run build:worker` |
| 2 | XuanWu 密鑰配置 | `wrangler secret put XUANWU_SALT` · `OWNER_IDENTITY` · `JAVIER_SIGNATURE` |
| 3 | Cloudflare 部署 | `pnpm run deploy:cf` |
| 4 | HUD 單一真相驗證 | `curl -H "X-Santenmoku-Canary: santenmoku" /api/hud-stream` |

### 步驟 1 — 建置與 TypeScript 預檢

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm run build:worker
```

`build:worker` 建置 SPA（`dist/`）並 dry-run Worker bundle 至 `dist-worker/`。

### 步驟 2 — Wrangler 密鑰（XuanWu Triple-String）

```bash
wrangler secret put XUANWU_SALT          # 字面量：玄武
wrangler secret put OWNER_IDENTITY       # 字面量：0xWallet（身份標籤，非鏈上地址）
wrangler secret put JAVIER_SIGNATURE     # 字面量：Javier
```

公開 HUD canary（非密鑰）於 `wrangler.jsonc` `vars.NEXT_PUBLIC_HUD_CANARY=santenmoku` 設定，並同步至 Vite 建置環境。

KV 綁定：`SLIVERVINE_KV` + `SYSTEM_STATE_KV` → namespace `af57772629914596b206aef2b5935cf5`。

### 步驟 3 — 部署

```bash
pnpm run deploy:cf
```

執行 typecheck、完整 Vitest、SPA 建置，再 `wrangler deploy`。

### 步驟 4 — HUD 單一真相源驗證

```bash
curl -s -H "X-Santenmoku-Canary: santenmoku" \
  https://dev-santenbokui.slivervine.xyz/api/hud-stream | jq .
curl -s https://dev-santenbokui.slivervine.xyz/api/telemetry/health | jq .
```

預期：`success: true`，含 `leftEyeDefense`、`rightEyeProbe`、`crownTreasuryPnl`；無 `locked: true`。

---

**前置條件：** `wrangler.jsonc` 已宣告 `SILVERVINE_KV` 綁定及路由 `dev-santenbokui.slivervine.xyz`。審計 bundle 基線：**約 63 KB**（`dist-worker/index.js`）。

---

## 步驟 1 — 密鑰配置

**目標：** 透過 Wrangler CLI 將執行時密鑰注入 `silvervine-app` Worker。密鑰永不提交至 repo（見 `src/env.ts`）。

### 1.1 必要密鑰

```bash
npx wrangler secret put GAS_WEBHOOK_URL
```

提示輸入 Google Apps Script webhook URL，供 matrix 持久化使用（`src/services/gas-sheet.ts`）。

### 1.2 可選密鑰

```bash
npx wrangler secret put PYTHON_GATEWAY_URL
```

### 1.3 確認密鑰已綁定

```bash
npx wrangler secret list
```

預期：`GAS_WEBHOOK_URL` 出現於清單（值隱藏）。

### 步驟 1 通過標準

- [ ] 密鑰清單含 `GAS_WEBHOOK_URL`
- [ ] git 工作區無密鑰檔

---

## 步驟 2 — 乾跑驗證

**目標：** 建置 SPA + 型別檢查 + 打包 Worker 但不發布。確認腳本體積符合審計預算（≤ 100 KB；基線約 63 KB）。

### 2.1 建置 SPA 靜態資源

```bash
pnpm run build:spa
```

### 2.2 型別檢查

```bash
npx tsc --noEmit
```

### 2.3 乾跑部署（僅打包）

```bash
WRANGLER_WRITE_LOGS=false npx wrangler deploy --dry-run --outdir=dist-worker
```

單行等效（同 `pnpm run build`）：

```bash
pnpm run build:worker
```

### 2.4 量測 bundle 大小

```bash
wc -c dist-worker/index.js
```

預期：

```
63608 dist-worker/index.js   # ~63 KB audit baseline / 約 63 KB 審計基線
```

硬性上限：**≤ 102,400 bytes (100 KB)** · **≤ 102,400 位元組**

### 2.5 重型依賴洩漏檢查

```bash
grep -E "ethers|react|msgpack" dist-worker/index.js && echo "FAIL" || echo "PASS"
```

預期：**PASS / 通過**

### 步驟 2 通過標準

- [ ] `npx wrangler deploy --dry-run` 退出碼 0
- [ ] `dist-worker/index.js` ≤ 100 KB
- [ ] bundle 無 `ethers` / `react` / `msgpack` 重型依賴

---

## 步驟 3 — 正式部署

**目標：** 將 Worker + SPA 靜態資源發布至 Cloudflare 邊緣 `dev-santenbokui.slivervine.xyz`。

### 3.1 部署

```bash
pnpm run deploy:cf
```

完整管線（SPA 建置 + 部署）：

```bash
pnpm run deploy:cf
```

等效：

```bash
pnpm run build:spa && npx wrangler deploy
```

### 3.2 確認部署

```bash
npx wrangler deployments list
```

預期：最新部署狀態為 **Active**。

### 3.3 KV 綁定確認（可選）

```bash
npx wrangler kv key list --binding SILVERVINE_KV
```

確認 Worker 可存取 `SILVERVINE_KV` namespace（`af57772629914596b206aef2b593scf5`）。

### 步驟 3 通過標準

- [ ] `npx wrangler deploy` 退出碼 0
- [ ] `wrangler deployments list` 顯示 active 版本
- [ ] 路由 `dev-santenbokui.slivervine.xyz` 可解析

---

## 步驟 4 — 線上遙測驗證

**目標：** 驗證線上邊緣 `/api/telemetry/health` 回傳公開 JSON 遙測（不含密鑰）。

### 4.1 健康探針

```bash
curl -s "https://dev-santenbokui.slivervine.xyz/api/telemetry/health" | jq .
```

### 4.2 HTTP 狀態與延遲

```bash
curl -s -o /dev/null -w "HTTP %{http_code} · TTFB %{time_starttransfer}s\n" \
  "https://dev-santenbokui.slivervine.xyz/api/telemetry/health"
```

預期：**HTTP 200** · TTFB < 500 ms。

### 4.3 回應結構驗證

預期 JSON 欄位：

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

欄位存在性檢查：

```bash
curl -s "https://dev-santenbokui.slivervine.xyz/api/telemetry/health" \
  | jq -e '.success == true and .criIndex != null and .circuitBreakers != null'
```

預期：退出碼 **0**。

### 4.4 密鑰外洩防護

```bash
curl -s "https://dev-santenbokui.slivervine.xyz/api/telemetry/health" \
  | grep -iE "webhook|secret|private|0x[0-9a-fA-F]{64}" \
  && echo "FAIL — possible secret leak" \
  || echo "PASS — no secrets in response"
```

預期：**PASS — no secrets in response / 回應中無密鑰**

### 步驟 4 通過標準

- [ ] `/api/telemetry/health` 回傳 **HTTP 200**
- [ ] `success: true` 含 `criIndex`、`circuitBreakers`、`activeVenues` 必要欄位
- [ ] 回應本體無密鑰模式

---

## 回滾

若步驟 4 部署後失敗，立即回滾：

```bash
npx wrangler rollback
npx wrangler deployments list
```

---

## 簽核清單

| 步驟 | 負責人 | 狀態 | 日期 |
|---|---|---|---|
| 1 — 密鑰配置 | | ☐ | |
| 2 — 乾跑驗證 | | ☐ | |
| 3 — 正式部署 | | ☐ | |
| 4 — 線上遙測 | | ☐ | |

---

*依 `docs/SAVE_TOKEN_SOP.md` §6 內部文件雙語格式生成。*
