# SilverVine Protocol v0.8 — 資助申請摘要

**專案：** Santenboku（蔘天木）跨鏈風控堆疊  
**授權：** BUSL-1.1  
**執行環境：** Cloudflare Workers + TypeScript  
**網域：** `slivervinelabs.com`（Grant HUD）· `slivervine.xyz`（執行核心）

---

## 架構概覽

```text
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Worker (src/index.ts)                           │
│  ├─ API: /api/data · /api/state · /api/hedge/evaluate      │
│  ├─ evaluateGlobalRiskPolicy()  ← unified cross-chain gate  │
│  └─ simulateTransactionIntent() ← zero-key dry-run sandbox  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   src/adapters/hl/    src/adapters/       src/adapters/
   auth · ws · exec     polymarket/         jupiter/
                        index.ts            index.ts
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                    src/core/risk-engine.ts
                    src/core/state.ts · src/core/risk.ts
                              │
                    src/services/risk-control.ts
                    (checkSoilResistance · rootProtection)
```

### 風控鐵律（Pgate）

| 守衛 | 函式 | 阻擋條件 |
|-------|----------|-----------------|
| 土壤阻力 | `checkSoilResistance()`（土壤阻力 / 滑價斷路器） | 跨場所滑價 > 0.5%、深度 < $100k、海嘯時窗 |
| 根系防禦 | `rootProtection()`（根系防禦 / 物理死鎖） | 預估虧損 > Dynamic Max SL（`Balance × 1% + $100`） |
| R20 死鎖 | `isR20Locked()` | CRI === 0、hardlock、簽名通道切斷 |

---

## 三 DEX 適配器三角

| 場所 | 路徑 | 角色 |
|-------|------|------|
| **Hyperliquid** | `src/adapters/hl/` | 主要永續合約執行 — Session Key EIP-712、WebSocket L2、已簽名 L1 訂單 |
| **Polymarket** | `src/adapters/polymarket/index.ts` | 尾部風險二元對沖 — CLOB 訂單簿、`evaluateTailHedgeTrigger()`（< $0.08 YES） |
| **Jupiter** | `src/adapters/jupiter/index.ts` | Solana 交換路由 — v6 報價 API、動態滑價 + 土壤阻力聯動 |

統一策略入口：`src/core/risk-engine.ts` 中的 `evaluateGlobalRiskPolicy(intent: RiskIntent)`。

支援場所：`"HL"` · `"POLYMARKET"` · `"JUPITER"`。

---

## Worker KV 邊緣整合

綁定：`env.SYSTEM_STATE_KV`（`src/env.ts`）

| KV 鍵 | 用途 |
|--------|---------|
| `system:state` | JSON 快照 — 餘額、CRI、hardlock、`isHedgeActive` |
| `system:r20_locked` | 邊緣 R20 旗標（`"true"` · `"R20_LOCKED"`） |

Jupiter 橋接：`executeJupiterQuoteWithEnv(quote, env)` 在交換執行前讀取 KV。  
KV R20 旗標以 HTTP 403 語意於邊緣阻擋訂單。

---

## 零私鑰乾跑沙盒

**無需私鑰。** 審計員僅透過閘門診斷模擬意圖。

### 閘門序列

```text
R20_LOCK → ROOT_PROTECTION → SOIL_RESISTANCE
  → [POLYMARKET_TAIL_HEDGE | JUPITER_SLIPPAGE] → *_DRY_RUN
```

### 報告結構（`SandboxDiagnosticReport`）

```typescript
{
  isAllowed: boolean;
  venue: "HL" | "POLYMARKET" | "JUPITER";
  zeroKeyDryRun: true;
  passedGates: string[];
  failedGate?: string;
  reason?: string;
  suggestedHttpCode?: number;
  simulatedExecutionTimeMs: number;
  executionPath: string[];
}
```

---

## 審計員 CLI 步驟

### 1. 安裝與驗證

```bash
pnpm install
pnpm run typecheck
npx vitest tests/services/sandbox.test.ts
npx vitest tests/core/risk-engine.test.ts
```

### 2. 執行沙盒單元測試（建議）

```bash
npx vitest tests/services/sandbox.test.ts
```

預期：**5 passed** — HL 通過、R20 阻擋、土壤多閘門阻擋、Polymarket 尾部阻擋、Jupiter 通過。

### 3. 互動式零私鑰乾跑（Node）

```bash
node --input-type=module -e "
import { simulateTransactionIntent } from './src/services/sandbox.ts';
import { buildSystemState } from './src/core/state.ts';

const soil = {
  symbol: 'BTC',
  hlSpot: 50_000,
  hlPerp: 50_010,
  dydxPerp: 50_005,
  depthUsd: 500_000,
};

const report = simulateTransactionIntent(
  { venue: 'HL', amountUsd: 50, soil },
  buildSystemState({ currentCri: 100, skipHardlockAssert: true }),
);

console.log(JSON.stringify(report, null, 2));
"
```

### 4. Polymarket 尾部對沖乾跑

```bash
node --input-type=module -e "
import { simulateTransactionIntent } from './src/services/sandbox.ts';
import { buildSystemState } from './src/core/state.ts';

const report = simulateTransactionIntent(
  {
    venue: 'POLYMARKET',
    amountUsd: 25,
    soil: { symbol: 'BTC', hlSpot: 50000, hlPerp: 50010, dydxPerp: 50005, depthUsd: 500000 },
    tailHedge: { marketPrice: 0.06 },
  },
  buildSystemState({ currentCri: 100, skipHardlockAssert: true }),
);

console.log(report.passedGates, report.isAllowed);
"
```

### 5. Jupiter 滑價乾跑

```bash
node --input-type=module -e "
import { simulateTransactionIntent } from './src/services/sandbox.ts';
import { buildSystemState } from './src/core/state.ts';

const report = simulateTransactionIntent(
  {
    venue: 'JUPITER',
    amountUsd: 50,
    soil: { symbol: 'BTC', hlSpot: 50000, hlPerp: 50010, dydxPerp: 50005, depthUsd: 500000 },
    jupiter: {
      quote: {
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        inAmount: '100000000',
        outAmount: '16198753',
        slippageBps: 10,
        priceImpactPct: '0.05',
      },
    },
  },
  buildSystemState({ currentCri: 100, skipHardlockAssert: true }),
);

console.log(report.passedGates, report.isAllowed);
"
```

### 6. R20 阻擋示範

```bash
node --input-type=module -e "
import { simulateTransactionIntent } from './src/services/sandbox.ts';

const report = simulateTransactionIntent(
  { venue: 'HL', amountUsd: 50 },
  { hardlock: true, currentCri: 0, signingChannelOpen: false },
);

console.log(report.failedGate, report.suggestedHttpCode);
"
```

預期輸出：`R20_LOCK 403`

---

## 公開 Worker 匯出（`src/index.ts`）

```typescript
export { evaluateGlobalRiskPolicy, simulateTransactionIntent };
export type {
  RiskIntent,
  GlobalRiskPolicyResult,
  SandboxDiagnosticReport,
};
```

---

## 測試覆蓋參考

| 測試套件 | 指令 | 範圍 |
|-------|---------|-------|
| Sandbox | `npx vitest tests/services/sandbox.test.ts` | 零私鑰乾跑閘門 |
| Risk engine | `npx vitest tests/core/risk-engine.test.ts` | 統一策略 |
| Jupiter | `npx vitest tests/adapters/jupiter/index.test.ts` | 交換 + KV 邊緣 |
| Polymarket | `npx vitest tests/adapters/polymarket/index.test.ts` | 尾部對沖 |
| HL | `npx vitest tests/adapters/hl/` | Session key + 執行 |

完整套件：`pnpm run test`

---

## 審計產物

- Yellow Page 變更紀錄：`docs/audit/changelog.md`
- 架構深度剖析：`docs/ARCHITECTURE.md`
- 流行文化戰術對照：`docs/POPCULTURE_TACTICS.md`
