# SilverVine Protocol v0.8 — Grant Submission Summary

**Project:** Santenboku (蔘天木) cross-chain risk stack  
**License:** BUSL-1.1  
**Runtime:** Cloudflare Workers + TypeScript  
**Domains:** `slivervinelabs.com` (Grant HUD) · `slivervine.xyz` (execution core)

---

## Architecture Overview

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

### Risk Iron Rules (Pgate)

| Guard | Function | Block condition |
|-------|----------|-----------------|
| Soil resistance | `checkSoilResistance()` | Cross-venue slippage > 0.5%, depth < $100k, tsunami window |
| Root protection | `rootProtection()` | Estimated loss > Dynamic Max SL (`Balance × 1% + $100`) |
| R20 deadlock | `isR20Locked()` | CRI === 0, hardlock, signing channel severed |

---

## 3-DEX Adapter Triangle

| Venue | Path | Role |
|-------|------|------|
| **Hyperliquid** | `src/adapters/hl/` | Primary perp execution — Session Key EIP-712, WebSocket L2, signed L1 orders |
| **Polymarket** | `src/adapters/polymarket/index.ts` | Tail-risk binary hedge — CLOB orderbook, `evaluateTailHedgeTrigger()` (< $0.08 YES) |
| **Jupiter** | `src/adapters/jupiter/index.ts` | Solana swap routing — v6 quote API, dynamic slippage + soil linkage |

Unified policy entry: `evaluateGlobalRiskPolicy(intent: RiskIntent)` in `src/core/risk-engine.ts`.

Supported venues: `"HL"` · `"POLYMARKET"` · `"JUPITER"`.

---

## Worker KV Edge Integration

Binding: `env.SYSTEM_STATE_KV` (`src/env.ts`)

| KV Key | Purpose |
|--------|---------|
| `system:state` | JSON snapshot — balance, CRI, hardlock, `isHedgeActive` |
| `system:r20_locked` | Edge R20 flag (`"true"` · `"R20_LOCKED"`) |

Jupiter bridge: `executeJupiterQuoteWithEnv(quote, env)` reads KV before swap execution.  
KV R20 flag blocks orders at the Edge with HTTP 403 semantics.

---

## Zero-Key Dry-Run Sandbox

**No private keys required.** Auditors simulate intents through gate diagnostics only.

### Gate sequence

```text
R20_LOCK → ROOT_PROTECTION → SOIL_RESISTANCE
  → [POLYMARKET_TAIL_HEDGE | JUPITER_SLIPPAGE] → *_DRY_RUN
```

### Report shape (`SandboxDiagnosticReport`)

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

## Auditor CLI Steps

### 1. Install & verify

```bash
pnpm install
pnpm run typecheck
npx vitest tests/services/sandbox.test.ts
npx vitest tests/core/risk-engine.test.ts
```

### 2. Run sandbox unit tests (recommended)

```bash
npx vitest tests/services/sandbox.test.ts
```

Expected: **5 passed** — HL pass, R20 block, soil multi-gate block, Polymarket tail block, Jupiter pass.

### 3. Interactive zero-key dry-run (Node)

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

### 4. Polymarket tail-hedge dry-run

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

### 5. Jupiter slippage dry-run

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

### 6. R20 block demonstration

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

Expected output: `R20_LOCK 403`

---

## Public Worker Exports (`src/index.ts`)

```typescript
export { evaluateGlobalRiskPolicy, simulateTransactionIntent };
export type {
  RiskIntent,
  GlobalRiskPolicyResult,
  SandboxDiagnosticReport,
};
```

---

## Test Coverage Reference

| Suite | Command | Scope |
|-------|---------|-------|
| Sandbox | `npx vitest tests/services/sandbox.test.ts` | Zero-key dry-run gates |
| Risk engine | `npx vitest tests/core/risk-engine.test.ts` | Unified policy |
| Jupiter | `npx vitest tests/adapters/jupiter/index.test.ts` | Swap + KV Edge |
| Polymarket | `npx vitest tests/adapters/polymarket/index.test.ts` | Tail hedge |
| HL | `npx vitest tests/adapters/hl/` | Session key + execution |

Full suite: `pnpm run test`

---

## Audit Artifacts

- Yellow Page changelog: `docs/audit/changelog.md`
- Architecture deep-dive: `docs/ARCHITECTURE.md`
- Pop-culture tactic map: `docs/POPCULTURE_TACTICS.md`
