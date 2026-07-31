# SilverVine Protocol — Read-Only Cloudflare Readiness & Safety Audit
# SilverVine Protocol — 唯讀 Cloudflare 就緒度與安全審計

**Date / 日期:** 2026-07-25  
**Scope / 範圍:** `src/`, `tests/` (read-only · 唯讀)  
**Auditor mode / 審計模式:** Static analysis · no functional logic modified · 靜態分析 · 未修改任何功能邏輯  
**Worker entry / Worker 入口:** `src/index.ts` → `src/api/routes.ts`  
**Test baseline / 測試基線:** 326/326 passing (39 files) · 326/326 通過（39 個檔案）

---

## Executive Summary / 執行摘要

The Worker hot path is lean (~63 KB `dist-worker/index.js`; no `ethers` / `react` / `@msgpack/msgpack` in bundle). KV bindings are optional in TypeScript and fail-safe where implemented, but **three JSON.parse sites lack try/catch**, **edge-security middleware is not wired into `routeRequest`**, and **`wrangler.jsonc` declares no KV namespaces**. Zero raw secrets were found in `src/`. Overall: **deployable for read-only grant verification**; edge hardening items remain before production signing paths go live.

Worker 熱路徑精簡（`dist-worker/index.js` 約 63 KB；bundle 中不含 `ethers` / `react` / `@msgpack/msgpack`）。KV 綁定在 TypeScript 中為可選，已實作處具備 fail-safe，但 **三處 JSON.parse 缺少 try/catch**、**edge-security 中介層未接入 `routeRequest`**，且 **`wrangler.jsonc` 未宣告任何 KV namespace**。`src/` 中未發現原始密鑰。整體結論：**可部署用於唯讀 Grant 驗證**；在生產簽名路徑上線前，仍需完成邊緣強化項目。

| Dimension / 維度 | Verdict / 判定 | Score / 評分 |
|---|---|---|
| A. CF KV / Env Fallbacks / CF KV 與環境回退 | **PASS with gaps / 通過（有缺口）** | 7/10 |
| B. Zero Secrets Leakage / 零密鑰外洩 | **PASS / 通過** | 9/10 |
| C. Dead Code & Bundle Optimization / 死碼與 Bundle 優化 | **PASS with warnings / 通過（有警告）** | 6/10 |

---

## A. Cloudflare KV / Environment Fallbacks / CF KV 與環境回退

### A.1 Binding Surface / 綁定介面

| Binding / 綁定 | Declared in `env.ts` / 於 env.ts 宣告 | Declared in `wrangler.jsonc` / 於 wrangler.jsonc 宣告 | Runtime usage / 執行時使用 |
|---|---|---|---|
| `SYSTEM_STATE_KV` | ✅ Optional / 可選 | ❌ Missing / 缺失 | Jupiter `assertKvExecutionAllowed()` · Jupiter 執行閘門 |
| `SILVERVINE_KV` | ✅ Optional / 可選 | ❌ Missing / 缺失 | `cloid-validator.ts` only (unwired) · 僅 cloid-validator（未接入） |
| `ASSETS` | ✅ Optional / 可選 | ✅ `./dist` SPA / SPA 靜態資源 | Static dashboard / 靜態儀表板 |

**Finding / 發現:** `Env` interface correctly types both KV namespaces as optional (`SYSTEM_STATE_KV?`, `SILVERVINE_KV?`). Production Wrangler config must add `kv_namespaces` entries before edge R20 lock or CLOID anti-replay can function across isolates.

**發現：** `Env` 介面正確將兩個 KV namespace 標記為可選（`SYSTEM_STATE_KV?`、`SILVERVINE_KV?`）。正式環境的 Wrangler 設定必須新增 `kv_namespaces` 條目，跨 isolate 的 R20 鎖定與 CLOID 防重放才能生效。

### A.2 Fail-Safe Paths (PASS) / 安全回退路徑（通過）

| Location / 位置 | Behavior when KV undefined / KV 未綁定時行為 |
|---|---|
| `assertKvExecutionAllowed()` (`jupiter/index.ts:389–390`) | Returns `null`; falls back to in-memory `readActiveSystemState()` · 回傳 `null`；回退至記憶體內 `readActiveSystemState()` |
| `readKvSystemState()` (`jupiter/index.ts:372–382`) | Guarded by caller; inner `JSON.parse` wrapped in try/catch → returns `null` on corrupt payload · 由呼叫方保護；內層 `JSON.parse` 有 try/catch → 損壞 payload 回傳 `null` |
| `checkEdgeRateLimit()` (`edge-security.ts:96–122`) | Falls back to in-memory `Map` when `config.kv` is undefined · `config.kv` 未設定時回退至記憶體 `Map` |
| `executeJupiterQuoteWithEnv()` runtime tag (`jupiter/index.ts:427`) | `"local"` when `SYSTEM_STATE_KV` absent; `"edge"` when bound · 無 `SYSTEM_STATE_KV` 時標記 `"local"`；綁定時為 `"edge"` |

### A.3 KV Gaps (ACTION REQUIRED) / KV 缺口（需處理）

#### Gap 1 — `assertKvExecutionAllowed`: unguarded `JSON.parse` / 未受保護的 JSON.parse

```405:407:src/adapters/jupiter/index.ts
  if (stateRaw) {
    const record = JSON.parse(stateRaw) as KvSystemStateRecord;
    if (record.r20Locked === true || record.r20Locked === R20_LOCKED) {
```

**Risk / 風險:** Corrupt or adversarial KV value at `system:state` throws unhandled `SyntaxError`, crashing the Worker isolate on Jupiter execution paths.  
**風險：** `system:state` 的損壞或惡意 KV 值會拋出未處理的 `SyntaxError`，在 Jupiter 執行路徑上使 Worker isolate 崩潰。

**Fix / 修復:** Wrap in try/catch; treat parse failure as locked or return safe default (mirror `readKvSystemState`).  
**修復：** 以 try/catch 包裹；解析失敗視為鎖定或回傳安全預設值（比照 `readKvSystemState`）。

#### Gap 2 — `readBucket`: unguarded `JSON.parse` in edge-security / edge-security 中未受保護的 JSON.parse

```50:54:src/api/middleware/edge-security.ts
  if (kv) {
    const raw = await kv.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as RateLimitBucket;
```

**Risk / 風險:** Corrupt rate-limit bucket in KV causes 500 on every request passing rate-limit check.  
**風險：** KV 中損壞的 rate-limit bucket 會在每次通過限流檢查的請求上造成 500 錯誤。

**Fix / 修復:** try/catch → return `null` (start fresh window).  
**修復：** try/catch → 回傳 `null`（重新開始計數窗口）。

#### Gap 3 — `wrangler.jsonc`: no KV namespace bindings / 未宣告 KV namespace 綁定

Current config only declares `ASSETS` and route pattern. Neither `SYSTEM_STATE_KV` nor `SILVERVINE_KV` is bound at deploy time.

目前設定僅宣告 `ASSETS` 與路由 pattern。部署時未綁定 `SYSTEM_STATE_KV` 或 `SILVERVINE_KV`。

**Fix / 修復:** Add `kv_namespaces` block with preview + production IDs before edge deployment.  
**修復：** 在邊緣部署前新增含 preview 與 production ID 的 `kv_namespaces` 區塊。

#### Gap 4 — `cloid-validator.ts`: implemented but unwired / 已實作但未接入

`claimCloidAntiReplay()` / `assertCloidNotReplayed()` accept optional `SILVERVINE_KV` but are **never imported** by `routes.ts`, `api/index.ts`, or any adapter hot path. Root 14 anti-replay is dead code in the Worker bundle context.

`claimCloidAntiReplay()` / `assertCloidNotReplayed()` 接受可選 `SILVERVINE_KV`，但 **從未被** `routes.ts`、`api/index.ts` 或任何 adapter 熱路徑 import。Root 14 防重放在 Worker bundle 上下文中為死碼。

---

## B. Zero Secrets Leakage / 零密鑰外洩

### B.1 Static Source Scan (PASS) / 靜態原始碼掃描（通過）

| Check / 檢查項 | Result / 結果 |
|---|---|
| Raw hex private keys (`0x` + 64 hex) in `src/` / src 中原始 hex 私鑰 | **None found / 未發現** |
| `PRIVATE_KEY` / `SECRET_KEY` / `mnemonic` literals / 字面常量 | **None found / 未發現** |
| `index.ts` forbidden re-export patterns / index.ts 禁止 re-export 模式 | **Clean / 乾淨** (`tests/security/security-audit.test.ts`) |
| `simulateTransactionIntent` dry-run state mutation / dry-run 狀態變更 | **No mutation / 無變更** (2 tests pass / 2 項測試通過) |

### B.2 Secret Delivery Model (PASS) / 密鑰交付模型（通過）

Secrets (`GAS_WEBHOOK_URL`, future signing keys) are documented for `wrangler secret put` — not committed to repo. `Env` interface uses optional string bindings only.

密鑰（`GAS_WEBHOOK_URL`、未來簽名金鑰）文件化為透過 `wrangler secret put` 注入 — 未提交至 repo。`Env` 介面僅使用可選字串綁定。

### B.3 Residual Notes / 殘餘注意事項

| Item / 項目 | Severity / 嚴重度 | Note / 說明 |
|---|---|---|
| `ethers` in `hl/auth.ts`, `polymarket/index.ts` / ethers 引用 | **Low / 低** | Type/runtime signing paths; **not in Worker bundle** (~63 KB confirms tree-shake) · 簽名路徑；**不在 Worker bundle 中**（~63 KB 證實 tree-shake） |
| Test fixtures with mock signers / 測試 mock signer | **Info / 資訊** | Isolated to `tests/`; never exported · 僅限 `tests/`；從未 export |
| CORS `Access-Control-Allow-Origin: *` on API routes / API CORS 設定 | **Info / 資訊** | Acceptable for public read-only matrix; restrict before authenticated POST signing · 公開唯讀 matrix 可接受；authenticated POST 簽名前應限制 |

---

## C. Dead Code & Bundle Optimization / 死碼與 Bundle 優化

### C.1 Worker Bundle Size / Worker Bundle 大小

| Metric / 指標 | Value / 數值 |
|---|---|
| `dist-worker/index.js` size / 檔案大小 | **63,608 bytes (~63 KB) / 63,608 位元組（約 63 KB）** |
| CF Workers free-tier script limit / 免費層腳本上限 | 1 MB (well within / 遠低於上限) |
| CF Workers paid script limit / 付費層腳本上限 | 10 MB |
| Heavy deps absent from bundle / bundle 中缺失的重型依賴 | `ethers`, `react`, `react-dom`, `@msgpack/msgpack` ✅ |

**Verdict / 判定:** Bundle is production-lean. No immediate size remediation required.  
**判定：** Bundle 已達生產級精簡。無需立即進行體積修復。

### C.2 Unwired / Dead Modules / 未接入 / 死碼模組

| Module / 模組 | Status / 狀態 | Impact / 影響 |
|---|---|---|
| `src/api/middleware/edge-security.ts` | Implemented + tested (4/4) · **not imported by `routes.ts`** / 已實作並測試 · **routes.ts 未 import** | Rate limit + signature gate inactive on all live routes · 所有 live 路由上限流與簽名閘未生效 |
| `src/services/cloid-validator.ts` | Full Root 14 implementation · **zero imports from hot path** / 完整 Root 14 實作 · **熱路徑零 import** | Anti-replay dedup never runs at edge · 邊緣防重放去重從未執行 |
| `src/ui/dashboard.ts` `JSON.parse` (×2) | SPA-only (Vite build → `dist/`, not Worker) / 僅 SPA | Low Worker risk; wrap in try/catch for UX resilience · Worker 風險低；建議 try/catch 提升 UX 韌性 |

### C.3 Edge-Security Wiring Gap (CRITICAL for production) / Edge-Security 接入缺口（生產環境關鍵）

`validateEdgeHeaders()` and `checkEdgeRateLimit()` exist with passing unit tests but **`routeRequest()` never calls them**:

`validateEdgeHeaders()` 與 `checkEdgeRateLimit()` 已有通過的單元測試，但 **`routeRequest()` 從未呼叫**：

```15:48:src/api/routes.ts
export async function routeRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    // ... no validateEdgeHeaders / checkEdgeRateLimit calls ...
```

**Affected routes / 受影響路由:** `/api/hedge/evaluate` (POST), `/api/state` (GET), `/api/data` (GET), `/api/telemetry/health` (GET) — all unprotected.  
**受影響路由：** 上述全部路由均未受保護。

**Recommended wiring point / 建議接入點:** Top of `routeRequest()`, before pathname dispatch; pass `env.SILVERVINE_KV` (or dedicated RL KV) to `checkEdgeRateLimit`.  
**建議接入位置：** `routeRequest()` 頂部、pathname 分派前；將 `env.SILVERVINE_KV`（或專用 RL KV）傳入 `checkEdgeRateLimit`。

---

## D. JSON.parse Safety Matrix / JSON.parse 安全矩陣

| File / 檔案 | Line / 行 | try/catch | In Worker bundle / 在 Worker bundle | Verdict / 判定 |
|---|---|---|---|---|
| `jupiter/index.ts` (`readKvSystemState`) | 379 | ✅ Yes / 有 | Conditional (Jupiter path) / 條件（Jupiter 路徑） | **PASS / 通過** |
| `jupiter/index.ts` (`assertKvExecutionAllowed`) | 406 | ❌ No / 無 | Conditional / 條件 | **FAIL / 不通過** |
| `edge-security.ts` (`readBucket`) | 53 | ❌ No / 無 | Yes (when wired) / 是（接入後） | **FAIL / 不通過** |
| `hl/execution.ts` | 420 | ✅ Yes / 有 | No (signing adapter) / 否（簽名 adapter） | **PASS / 通過** |
| `hl/websocket.ts` | 132 | ✅ Yes / 有 | No / 否 | **PASS / 通過** |
| `ui/dashboard.ts` | 2729, 2768 | ❌ No / 無 | No (SPA) / 否（SPA） | **WARN / 警告** |

---

## E. Actionable Checklist / 可執行檢查清單

### Pre-Deploy (Required) / 部署前（必要）

- [ ] **Add KV namespaces to `wrangler.jsonc`** — bind `SYSTEM_STATE_KV` + `SILVERVINE_KV` with preview/production IDs  
      **於 `wrangler.jsonc` 新增 KV namespace** — 綁定 `SYSTEM_STATE_KV` + `SILVERVINE_KV`（含 preview/production ID）

- [ ] **Wrap `assertKvExecutionAllowed` JSON.parse** (line 406) in try/catch  
      **為 `assertKvExecutionAllowed` 的 JSON.parse（第 406 行）加上 try/catch**

- [ ] **Wrap `readBucket` JSON.parse** (edge-security line 53) in try/catch  
      **為 `readBucket` 的 JSON.parse（edge-security 第 53 行）加上 try/catch**

- [ ] **Wire `validateEdgeHeaders` + `checkEdgeRateLimit`** into `routeRequest()` before dispatch  
      **於分派前將 `validateEdgeHeaders` + `checkEdgeRateLimit` 接入 `routeRequest()`**

### Pre-Production (Recommended) / 上線前（建議）

- [ ] **Wire `assertCloidNotReplayed`** into HL/Polymarket order submission paths with `env.SILVERVINE_KV`  
      **將 `assertCloidNotReplayed` 接入 HL/Polymarket 下單路徑，並傳入 `env.SILVERVINE_KV`**

- [ ] **Restrict CORS** on POST `/api/hedge/evaluate` to known origins  
      **限制 POST `/api/hedge/evaluate` 的 CORS 為已知來源**

- [ ] **Add integration test** verifying edge-security 401/429 through `routeRequest` (not just unit)  
      **新增整合測試**：經 `routeRequest` 驗證 edge-security 401/429（不僅單元測試）

- [ ] **Wrap dashboard localStorage JSON.parse** in try/catch for SPA resilience  
      **為 dashboard localStorage 的 JSON.parse 加上 try/catch，提升 SPA 韌性**

### Monitoring (Post-Deploy) / 部署後監控

- [ ] **Alert on Worker exception rate** spike after KV binding changes  
      **KV 綁定變更後，對 Worker 例外率飆升設定告警**

- [ ] **Verify `runtime: "edge"` tag** in Jupiter audit logs when `SYSTEM_STATE_KV` is bound  
      **綁定 `SYSTEM_STATE_KV` 後，確認 Jupiter 審計日誌中 `runtime: "edge"` 標籤**

- [ ] **Re-run bundle dry-run** after any new adapter import: target stay ≤ 100 KB  
      **新增 adapter import 後重新執行 bundle dry-run：目標維持 ≤ 100 KB**

---

## F. Audit Sign-Off / 審計簽核

| Field / 欄位 | Value / 值 |
|---|---|
| Audit type / 審計類型 | Read-only static · 唯讀靜態 |
| Code modified / 程式碼修改 | **None / 無** |
| Blocking issues / 阻塞問題 | 0 (deploy-safe for read-only grant demo) · 0（唯讀 Grant 演示可安全部署） |
| High-priority gaps / 高優先缺口 | 3 (JSON.parse ×2, unwired edge-security) · 3（JSON.parse ×2、edge-security 未接入） |
| Bundle status / Bundle 狀態 | **63 KB — PASS / 63 KB — 通過** |

---

*Generated per `docs/SAVE_TOKEN_SOP.md` §6 — Internal Documentation Bilingual Format.*  
*依 `docs/SAVE_TOKEN_SOP.md` §6 內部文件雙語格式生成。*
