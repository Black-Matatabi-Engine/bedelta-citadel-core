# BeDelta Living Water: Hyperliquid-Native Yield Ingress & Session-Key Risk Envelope

**Applicant:** SilverVine Labs  
**Project:** BeDelta Living Water (`bedelta-living-water`)  
**Track:** Hyperliquid Foundation — Ecosystem Infrastructure & Yield Ingress  
**Submission:** August 2026  
**Auditor guide:** [SUBMISSION.md](./SUBMISSION.md)

---

## 1. Executive Summary

BeDelta Living Water is a **Hyperliquid-first yield ingress layer** deployed on Cloudflare Workers. It routes cross-venue capital signals from Solana (Jupiter) and Arbitrum (GMX) toward Hyperliquid Lend / perp hedge legs, while enforcing a mandatory **Session-Key Risk Envelope** (TRADE_ONLY, Dynamic Max SL) and a **2PC Intent Ledger** that prevents single-leg exposure on partial failure.

Grant auditors can verify the entire Wave 1 MVP **without private keys, funded wallets, or exchange API secrets** via `pnpm grant:verify`.

| Deliverable (Milestone 1) | Module | Status |
|---|---|---|
| Session Key TRADE_ONLY + Dynamic Max SL | `src/adapters/hl/session-key-executor.ts` | Testnet dry-run path |
| 2PC dual-leg Intent Ledger | `src/core/intent-ledger.ts` | Prepare / Commit / Abort + flatten |
| HL ↔ 2PC execution bridge | `src/adapters/hl/hl-intent-bridge.ts` | TTL unwind integration test |
| Yield Triangle read-path API | `GET /api/yield/triangle?symbol=ETH` | Live JSON |
| Zero-key grant sandbox | `src/services/sandbox.ts` | HL → Poly → Jup gate sequence |
| Workers-safe EIP-712 hashing | `src/adapters/hl/crypto.ts` | No ethers on hash hot path |

---

## 2. Value Add to Hyperliquid

### 2.1 Problem

Hyperliquid competes for **Net New TVL** and **persistent OI** against CEX and multi-chain DeFi. Idle capital on Solana and Arbitrum often never reaches HL Lend / perp books because:

| Pain Point | Ecosystem Impact |
|---|---|
| No unified yield ranking toward HL | Capital stays on origin chain |
| Session keys over-permissioned elsewhere | Institutions avoid agent delegation |
| Cross-venue execution without atomicity | Single-leg fills leave naked delta |
| No edge-native ingress router | Policy gates live off-chain inconsistently |

### 2.2 BeDelta Solution — Yield Ingress, Not a Bridge

We are **not** a generic bridge. BeDelta Living Water is a **Yield Engine & Cross-Margin Router** that:

1. **Reads** cross-venue APY / depth / funding (Jupiter quote, GMX markets, HL vault + funding).
2. **Ranks** routes via `queryYieldTriangle()` with soil-resistance gating.
3. **Executes** on HL through Session Keys scoped to **ORDER_EXECUTE / ORDER_CANCEL only** (no withdrawal, no leverage mutation).
4. **Coordinates** dual-leg intents via 2PC — if the second leg fails or TTL expires, HL positions are **reduce-only flattened** automatically.

```text
  Solana (Jupiter)          Arbitrum (GMX)
         │                           │
         └───────────┬───────────────┘
                     │  read-path APY / depth
                     ▼
         ┌───────────────────────────┐
         │  Cloudflare Edge Worker   │
         │  /api/yield/triangle      │
         │  checkSoilResistance()    │
         │  2PC Intent Ledger        │
         └─────────────┬─────────────┘
                       │ Session Key (TRADE_ONLY)
                       ▼
              ┌─────────────────┐
              │   Hyperliquid   │
              │  Lend · Perps   │  ← Net New TVL / OI destination
              └─────────────────┘
```

### 2.3 Hyperliquid-Specific KPIs

| HL KPI | BeDelta Mechanism |
|---|---|
| **HL Lend / Vault TVL** | Yield Triangle surfaces HL vault APR + funding; recommended route defaults to HL when edge wins |
| **Perp OI depth** | Delta-neutral sleeve (HL perp leg) under 2PC — no orphan exposure on abort |
| **Builder / agent adoption** | `BeDeltaSessionKey` EIP-712 agent with auto-sever on R20 hardlock |
| **Institutional trust** | Dynamic Max SL = `(Equity × 1%) + $100` welded before every order wire |

---

## 3. Architecture (Code-Aligned)

### 3.1 Risk Envelope (Session Key — TRADE_ONLY)

| Control | Implementation |
|---|---|
| Permission scope | `ORDER_EXECUTE` · `ORDER_CANCEL` only (`src/services/hyperliquidAdapter.ts`) |
| Dynamic Max SL | `assertSessionKeyExecutionGates()` (`src/services/session-key-adapter.ts`) |
| EIP-712 L1 signing | `src/adapters/hl/auth.ts` — phantom Agent, chainId 1337 |
| Workers-safe hash | `createL1ActionHash()` via `@noble/hashes` (`src/adapters/hl/crypto.ts`) |
| Testnet transport | `executeSignedAction()` → `src/adapters/hl/execution-transport.ts` |
| Agent name | `BeDeltaSessionKey` |

### 3.2 2PC Intent Ledger

```text
PENDING ──prepare──► PREPARED ──commit──► COMMITTED
   │                    │
   └──── abort ─────────┴──── TTL / failure ──► ABORTED (+ HL reduce-only flatten)
```

| Phase | Function | File |
|---|---|---|
| Create intent | `createCrossLegIntent()` | `src/core/intent-ledger.ts` |
| Prepare | `prepareIntent()` | partial fail → flatten prepared legs |
| Commit | `commitIntent()` | TTL expire → flatten prepared legs only |
| HL bridge | `createHlIntentBridge()` | `src/adapters/hl/hl-intent-bridge.ts` |
| Flatten | `flattenHlLeg()` | `src/adapters/hl/session-key-executor.ts` |

**Verified:** `tests/integration/hl-2pc-execution.test.ts`

### 3.3 Yield Triangle API

**Endpoint:** `GET /api/yield/triangle?symbol=ETH`

| Field | Source |
|---|---|
| `venues[].apy` | HL vault + funding · Jupiter quote · GMX funding/borrow |
| `soil` | `checkSoilResistance()` |
| `gateStatus.intent2pcReady` | soil OK + signing channel open |
| `gateStatus.dynamicMaxSlUsd` | `SystemState.dynamicMaxSL` |
| `recommendedRoute` | highest APY healthy venue |

Modules: `src/services/yield-router.ts` · `src/api/routes/yield.ts`

### 3.4 Zero-Key Grant Sandbox

```bash
pnpm grant:verify
```

Module: `simulateTransactionIntent()` · `tests/e2e/grant-sandbox-dryrun.test.ts`

---

## 4. Milestone Roadmap

### Milestone 1 — MVP & Testnet Live Path (Wave 1 Grant Ask)

| Item | Acceptance Criteria | Evidence |
|---|---|---|
| Session Key envelope | TRADE_ONLY + EIP-712 sign path | `tests/adapters/hl/auth.test.ts` |
| HL testnet execution wire | limit / market / cancel + dry-run | `tests/adapters/hl/execution.test.ts` |
| 2PC Intent Ledger | Prepare / Commit / Abort | `tests/core/intent-ledger.test.ts` |
| HL 2PC integration | TTL → HL flatten | `tests/integration/hl-2pc-execution.test.ts` |
| Yield Triangle API | gate status JSON | `tests/api/yield-triangle.test.ts` |
| Grant verify one-liner | `pnpm grant:verify` green | [SUBMISSION.md](./SUBMISSION.md) |
| CI | typecheck + 526 Vitest | `.github/workflows/grant-audit.yml` |

### Milestone 2 — Wave 2 (Appendix — Not Wave 1 Claims)

| Item | Description |
|---|---|
| LayerZero OApp | Cross-chain deposit/withdraw messaging (A存 / B提) |
| WaterPool smart contract | On-chain margin pool + internal netting ledger |
| Polymarket live tail sleeve | CLOB execution beyond read-path |
| Durable Object ledger | Replace in-memory intent store |
| Mainnet Session Key pilot | External signer HSM integration |

> Wave 2 is roadmap appendix only — not required to verify Milestone 1.

---

## 5. Repository Map

```text
src/core/intent-ledger.ts
src/adapters/hl/{auth,crypto,session-key-executor,hl-intent-bridge,execution-transport}.ts
src/services/{yield-router,sandbox}.ts
src/api/routes/yield.ts
tests/integration/hl-2pc-execution.test.ts
tests/e2e/grant-sandbox-dryrun.test.ts
```

---

## 6. License

**BUSL-1.1** — Additional Use Grant permits DEX Foundation Grant evaluator review.  
**Spec:** [Risk Envelope](../architecture/Risk_Envelope_Pgate.md)

*Run `pnpm grant:verify` to reproduce all Milestone 1 claims.*
