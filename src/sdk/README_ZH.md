> **中文參考譯本** · 本文件為參考譯本，非規範性 SSOT。英文正本請見：[README.md](./README.md)

# `@slivervine/citadel-sdk`

**協議：** SliverVine Citadel Shield — Arbitrum 上 AI Agent 的**共識前意圖防火牆與執行安全原語**（BeDelta Living Water v1.0 / BeΔ）  
**授權：** Apache-2.0 · 見 [`LICENSE`](./LICENSE) · **實體：** SilverVine Labs · **協議品牌：** SliverVine  
**EIP-712 網域：** `SliverVineCitadel` · **Gate 錨點：** `SLIVERVINE_GATE_ADDRESS`

> **Vitest SSOT：** **193 個測試檔案 | 845 PASS Clean (100% PASS)** · 安全層級 `5/0/0 PASS` · Wasm `<28kb` / `<60µs`。

> **「行為通過不等於 Web3 安全。」**  
> `@slivervine/citadel-sdk` 目前執行**無狀態證明信封驗證**（EIP-712 結構檢查：摘要匹配、過期時間、`verifyingContract`、網域 `SliverVineCitadel`、簽名 hex 格式），以及在任何 UserOp 進入 mempool **之前**的 `<28kb` Wasm 土壤評估。  
> **完整密碼學簽名恢復 / m-of-n 法定人數綁定於 L1 `SliverVineGate` 合約層**（`verifyAndConsume`）— 本 SDK 套件**不**宣稱完成鏈下 ECDSA 恢復。

無狀態播前執行框架。無私鑰。無託管。預設故障關閉。

### 機構與 dApp 建構者採用理由

| | 價值 |
|---|--------|
| **零漂移 AI Agent 護甲** | 在亞毫秒執行時（**<60µs** Wasm 土壤路徑）攔截提示注入、Session Key TTL 漂移與執行異常。 |
| **防抄襲網域鎖定** | 未證明或遭篡改的 UserOp 預設故障關閉（`allowedToSign: false`）— Gate `verifyingContract` + 網域 `SliverVineCitadel`。 |
| **單向合規護送** | 強制單向出站流動性（`46630`/`4663` → `42161`）；入站反向路徑封鎖（AML 污染隔離）。 |

## 安裝 / 匯入（monorepo）

```ts
import {
 verifyAgentIntent,
 assertUnidirectionalBridge,
 SLIVERVINE_GATE_ADDRESS,
 EIP712_DOMAIN_NAME,
} from "../sdk"; // 或發布後使用 `@slivervine/citadel-sdk`
```

## dApp 整合

### 1. Agent 意圖（AI / Session Key）

```ts
const verdict = verifyAgentIntent({
 intentDigest, // 0x + 32-byte UserOp / calldata digest
 sessionKey: { agentAddress, maxOrderClipUsd: 30, expiresAtMs },
 soil: { symbol: "ETH-PERP", hlSpot, hlPerp, dydxPerp, depthUsd, isTestnet: false },
 gasBurst: { estimatedGasCostUsd: 0.1, sponsored: true },
 attestation: {
 digest: intentDigest,
 expiresAtMs: Date.now() + 30_000,
 sig: "0x…", // Risk Oracle / Gate signer
 verifyingContract: SLIVERVINE_GATE_ADDRESS,
 domainName: EIP712_DOMAIN_NAME,
 },
 preset: "production", // 預設 — 缺少證明 ⇒ allowedToSign: false
});

if (!verdict.allowedToSign) {
 // 勿請求錢包 / Session Key 簽名
}
```

**方程式（生產環境）：**

`allowedToSign = injectionOk ∧ digestOk ∧ soilOk ∧ sessionOk ∧ gasOk ∧ attOk`

| 閘門 | 公式 / 限制 |
|------|-----------------|
| Soil | ¬tripped；滑點 ≤ 0.5%；深度 ≥ 下限 |
| Session | clip ≤ $30；TTL ≤ 7d |
| Gas | 每 UserOp ≤ $0.50；每日贊助 ≤ $10 |
| Attestation | 信封：digest=intent ∧ 新鮮 ∧ sig hex ∧ Gate `verifyingContract` ∧ 網域 `SliverVineCitadel`（L1 ECDSA/m-of-n 於 `SliverVineGate`） |

僅在明確 `allowDevBypass: true` 或 `preset: "test"` + `soil.isTestnet: true` 時允許開發繞過。

### 3. 共識前意圖防火牆（`withCitadelShield`）

一行裝飾器 — Agent 執行前的邊緣土壤清算（觸發時零 Gas 故障關閉）：

```ts
import { withCitadelShield } from "@slivervine/citadel-sdk";

const shieldedSwap = withCitadelShield(async (intent) => agent.executeSwap(intent));
await shieldedSwap({ symbol: "ETH", hlSpot, hlPerp, dydxPerp, depthUsd: 200_000 });
```

測試：`tests/sdk/decorator.test.ts` · 參考框架：`examples/agent-interceptor-demo.ts`

### 4. 單向橋接（Robinhood → Arbitrum）

```ts
const escort = assertUnidirectionalBridge({
 sourceChainId: 46630, // 或 4663 主網別名
 destChainId: 42161,
 amountUsd: 1000,
 wallet,
 initiatedAtMs: Date.now(),
});
// 入站（→ Robinhood）⇒ capitalLabel AML_INBOUND_TO_ROBINHOOD_BLOCKED，lostUsd === 0
```

## 稽核測試框架

可執行缺口證明位於：

- `tests/sdk/citadel-sdk-intent.test.ts`
- `tests/sdk/citadel-sdk-bridge-armor.test.ts`

```bash
pnpm exec vitest run tests/sdk/citadel-sdk-intent.test.ts tests/sdk/citadel-sdk-bridge-armor.test.ts
pnpm test
pnpm audit:fast
```

涵蓋：提示注入 / session 漂移攔截、缺失與篡改證明（防抄襲）、多標的 soil（`ETH-PERP`、`BTC-PERP`、合成 RWA）、出站 `46630`/`4663`→`42161`、入站 AML 封鎖。

## M4 Wasm

- Rust `#![no_std]` 核心：[`soil_core.rs`](../../src/wasm/soil_core.rs) → [`pkg/soil_core.wasm`](../../pkg/soil_core.wasm)（<28 KiB Cloudflare 預算）
- 熱路徑執行預算：**<60µs**
- 生產環境 `verifyAgentIntent` 需要 Wasm（缺失時 `WASM_CORE_REQUIRED`）；開發環境回退至 TS 模擬
- 重建：`pnpm build:wasm`

## 相關文件

- 藍圖：[`CITADEL_SDK_BLUEPRINT.md`](../../docs/sdk/CITADEL_SDK_BLUEPRINT.md)
- 文件索引：[`docs/README.md`](../../docs/README.md) · [中文參考](../../docs/README_ZH.md)
- 鏈上：[`SliverVineGate/`](../../SliverVineGate/) · [`SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol)
