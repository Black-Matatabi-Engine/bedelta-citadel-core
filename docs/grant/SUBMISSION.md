# Grant Auditor — 30-Second Verification Guide

**Project:** BeDelta Living Water  
**Hyperliquid proposal:** [HYPERLIQUID.md](./HYPERLIQUID.md)  
**Risk envelope spec:** [Risk_Envelope_Pgate.md](../architecture/Risk_Envelope_Pgate.md)

---

## Prerequisites

- Node.js 20+ (CI uses 22)
- pnpm 9+

```bash
pnpm install
pnpm exec tsc --noEmit   # expect: 0 errors
```

---

## One-Command Verify (Recommended)

```bash
pnpm grant:verify
```

| Test file | What it proves |
|---|---|
| `tests/e2e/grant-sandbox-dryrun.test.ts` | Zero-key HL → Polymarket → Jupiter gate sequence |
| `tests/integration/hl-2pc-execution.test.ts` | HL prepare OK → TTL expire → HL reduce-only flatten |

**Expected:** all tests green · no API keys · no wallet seed phrase.

---

## Extended Verify (~2 minutes)

```bash
pnpm exec vitest run tests/core/intent-ledger.test.ts
pnpm exec vitest run tests/adapters/hl/auth.test.ts
pnpm exec vitest run tests/api/yield-triangle.test.ts
pnpm test
```

---

## Live API Smoke (requires `pnpm run dev`)

```bash
curl -s 'http://localhost:8789/api/yield/triangle?symbol=ETH' | jq .
curl -s 'http://localhost:8789/api/telemetry/health' | jq .
```

---

## What Auditors Should See

### Zero-Key Sandbox

- `event: "GRANT_SANDBOX_DRY_RUN"`
- `zeroKeyDryRun: true` · `apiKeysRequired: false`
- Gates: `HL_DRY_RUN` · `POLYMARKET_DRY_RUN` · `JUPITER_DRY_RUN`

### HL 2PC Integration

- Phases: `PENDING → PREPARED → ABORTED`
- Reason: `PREPARE_TTL_EXPIRED`
- Flatten: `venue: "HL"`, `reduceOnly: true`

### Architecture SSOT

| Concern | Module |
|---|---|
| Dynamic Max SL | `src/services/session-key-adapter.ts` |
| TRADE_ONLY | `src/services/hyperliquidAdapter.ts` |
| 2PC ledger | `src/core/intent-ledger.ts` |
| Yield ranking | `src/services/yield-router.ts` |

---

## CI

`.github/workflows/grant-audit.yml` — typecheck · full Vitest · audit log on `main`.

---

## License

BUSL-1.1 — Grant evaluator review permitted. See [LICENSE](../../LICENSE).
