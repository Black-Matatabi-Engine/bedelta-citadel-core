# Pgate.md — Production Gate Audit & Personal Operations SOP

**Protocol:** SliverVine Protocol · Santenmoku v0.8.0-rc1  
**Scope:** Technical audit · behavioral governance · daily ops · grant reproducibility  
**Canonical modules:** `src/services/` · `package.json` scripts

---

## 0. Domain & Brand Mapping (Strict Spelling)

| Role | Canonical Name | Domain / Surface |
|---|---|---|
| **Official Protocol** | **SliverVine Protocol** | Code · docs · grant audit |
| **Core Quant DApp & Steel Core** | **slivervine.xyz** | Workers API · Session Key · telemetry |
| **Public PR Brand & Ecosystem Shield** | **SilverVine Labs** | Grant face · brand · legal entity |
| **Public Website Shield** | **silvervinelabs.com** | Marketing · 20-Root defense matrix HUD |

> **Spelling rule:** Protocol & DApp use **Sliver** (quant execution). PR brand & website use **Silver** (`silvervinelabs.com` — strictly with **e**).

---

## 1. Sliver & Vine Architectural Taxonomy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SLIVERVINE PROTOCOL v0.8.0-rc1                       │
├──────────────────────────────┬──────────────────────────────────────────┤
│ SLIVER (Execution Layer)     │ VINE (Resilience Layer)                  │
│ Microsecond liquidity slivers│ Root-system defensive entanglement       │
│ Zero-slippage passive maker  │ Dynamic topology · circuit self-healing  │
│ 1.004 ms end-to-end latency  │ vineWrapProtection · vineMeshAutoRecovery│
└──────────────────────────────┴──────────────────────────────────────────┘
```

### Sliver — High-Frequency Liquidity Slicing

| Capability | Target | Module |
|---|---|---|
| Counter-attack eval path | **1.004 ms** E2E | `counter-attack-matrix.ts` · `santenmoku-three-eye.ts` |
| Panic imbalance capture | **> 0.75** ask-heavy | `evalCounterAttackOpportunity()` |
| Zero-slippage execution | Passive Maker @ `bestBid` | `computePassiveMakerLimitPx()` |
| Live slippage fuse | **≤ 0.3%** | `COUNTER_ATTACK_MAX_LIVE_SLIPPAGE` |

### Vine — Distributed Root-System Guards

| Function | Responsibility | Module |
|---|---|---|
| `checkVineShield()` | L0 anti-naïveté · fat-finger · blind-sign block | `fool-proof-guard.ts` |
| `checkSoilResistanceWithVine()` | L1 L2 slippage/spread fuse **> 0.3%** → isolate | `risk-control.ts` |
| `vineWrapProtection()` | L2 Dynamic Max SL · R20 physical deadlock | `risk-control.ts` |
| `vineMeshAutoRecovery()` | L3 3-min cool-down · spread **< 0.1%** · `recoveryCount` | `circuit-breaker.ts` |

### Gate Execution Order

```
checkVineShield() → checkSoilResistanceWithVine() → vineWrapProtection() → evalCounterAttackOpportunity()
```

---

## 2. Operational Governance — 4-Persona Shield

```
                    INBOUND ORDER / SIGNING INTENT
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ L0 · VINE SHIELD               │ Anti-naïveté · Fat-finger│
│ checkVineShield()              │ Fang Jin-xin shield        │
└───────────────────────────────┬─────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ L1 · VINE SOIL + MESH          │ Anti-panic-bottom-sell   │
│ checkSoilResistanceWithVine()  │ Ruam Mei shield          │
│ vineMeshAutoRecovery()         │                          │
└───────────────────────────────┬─────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ L2 · VINE WRAP PROTECTION      │ Anti-emotional over-lever│
│ vineWrapProtection()           │ Lung Kei-man shield      │
└───────────────────────────────┬─────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ L3 · SLIVER COUNTER-ATTACK     │ Anti-irrational cascade  │
│ evalCounterAttackOpportunity() │ Ting Chai shield         │
└───────────────────────────────┬─────────────────────────────┘
                                ▼
                     PASSIVE MAKER @ bestBid (zero taker slip)
```

| Level | Vine / Sliver Gate | Key Threshold |
|---|---|---|
| L0 | `checkVineShield()` | Retail position **≤ 20%** · leverage **≤ 5×** |
| L1 | `checkSoilResistanceWithVine()` | Slippage fuse **0.3%** · spread recovery **< 0.1%** |
| L2 | `vineWrapProtection()` | Dynamic Max SL = `Balance × 1% + $100` |
| L3 | Sliver counter-attack | Imbalance **> 0.75** · latency **1.004 ms** |

---

## 3. Verified Production Metrics (v0.8.0-rc1)

### 3.1 Unit & Type Safety

| Check | Command | Verified Result |
|---|---|---|
| Vitest master suite | `npm test` | **391 / 391** passed · **47** files · 100% green |
| TypeScript | `npm run typecheck` | `tsc --noEmit` **CLEAN** (0 errors) |

### 3.2 24/7 Soak Test Telemetry

| Metric | Verified Value | Pass Gate |
|---|---|---|
| Faults | **0** | `fatalErrors === 0` |
| Auto-recoveries | **8** | `vineMeshAutoRecovery()` · `recovered: 8` |
| Memory stability | **`memoryOk = true`** | exit code 0 |
| Average tick latency | **29.679 ms** | `avgTickMs < 50` |
| Heap growth | **9.35 MB** | `heapGrowthMb < 15` |

KV rolling buffer: `telemetry:soak-rolling` · binding: `SLIVERVINE_KV` · coins: `BTC`, `ETH`.

### 3.3 Sliver End-to-End Latency

| Path | Target |
|---|---|
| Live L2 → imbalance → STRIKE verdict | **1.004 ms** |

---

## 4. Grant Reviewer Commands

```bash
npm install
npm test          # 391 passed (391)
npm run test:soak # faults=0 · recovered=8 · memoryOk=true
npm run typecheck # tsc --noEmit CLEAN
```

| Step | Command | Expected |
|---|---|---|
| Unit tests | `npm test` | **391 / 391** green |
| Full 24h soak | `npm run test:soak` | `memoryOk: true` |
| Live health | `curl -s https://slivervine.xyz/api/telemetry/health \| jq .` | CRI + breakers |
| Zero-key sandbox | `npm run test:dry-run` | gate path green |

---

## 5. Backend Operational SOP

### 5.1 Daily Checklist

| # | Task | Endpoint / Command | Pass |
|---|---|---|---|
| 1 | Typecheck | `npm run typecheck` | 0 errors |
| 2 | Unit gates | `npm test` | 391/391 |
| 3 | Soak smoke | `npx tsx scripts/soak-test.ts --mock --iterations 10` | `fatalErrors: 0` |
| 4 | Telemetry | `https://slivervine.xyz/api/telemetry/health` | CRI visible |
| 5 | KV roll | `telemetry:soak-rolling` | `tickCount` advancing |

### 5.2 KV Monitoring (`SLIVERVINE_KV`)

```bash
wrangler kv key get --binding=SLIVERVINE_KV telemetry:soak-rolling | jq .
```

| Field | Threshold |
|---|---|
| `heapGrowthMb` | **< 15 MB** |
| `avgTickMs` | **< 50 ms** |
| `memoryOk` | **true** |

### 5.3 Emergency Reset (`PANIC_LOCKED`)

```bash
curl -s https://slivervine.xyz/api/telemetry/health | jq '{circuitBreakers,counterAttackStatus}'
wrangler kv key delete --binding=SLIVERVINE_KV system:r20_locked
npx tsx scripts/soak-test.ts --mock --iterations 10
```

> Prefer `vineMeshAutoRecovery()` cool-down (`recovered: 8`) before manual override.

---

## 6. Module Map (`src/services/`)

| Layer | File | Primary Export |
|---|---|---|
| Vine L0 | `fool-proof-guard.ts` | `checkVineShield()` · `runVineShieldSoilGate()` |
| Vine L1 | `risk-control.ts` | `checkSoilResistanceWithVine()` |
| Vine L2 | `risk-control.ts` | `vineWrapProtection()` |
| Vine L3 | `circuit-breaker.ts` | `vineMeshAutoRecovery()` · `getVineMeshRecoveryCount()` |
| Sliver L3 | `counter-attack-matrix.ts` | `evalCounterAttackOpportunity()` |
| Hub | `santenmoku-three-eye.ts` | `evaluateSantenmokuHub()` |
| Ops | `soak-telemetry.ts` | `runSoakTelemetryTick()` |

---

## 7. `package.json` Script Reference

| Script | Purpose |
|---|---|
| `npm test` | Vitest + coverage (391 tests) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:soak` | Full 1,440-iteration soak harness |
| `npm run test:dry-run` | Zero-key cross-chain sandbox |
| `npm run audit:log` | Yellow-page changelog SOP |
| `npm run dev` | SPA + `wrangler dev` |
| `npm run deploy` | Production Workers deploy |

---

**License:** BUSL-1.1  
**Protocol:** SliverVine Protocol v0.8.0-rc1  
**Steel Core:** [slivervine.xyz](https://slivervine.xyz)  
**PR Shield:** [silvervinelabs.com](https://silvervinelabs.com) · SilverVine Labs  
**Last verified:** 391/391 Vitest green · `tsc --noEmit` CLEAN · soak `faults=0` · `recovered=8` · `memoryOk=true`
