# SliverVine Protocol (BeΔ) — Citadel CLI Demo Guide

> **Buildathon Primary (The Shield):** `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` · `pnpm demo:hl -- --trip` · `npx vitest run tests/sdk/retail-guard-provider.test.ts`  
> **Latency hierarchy:** **~0.5µs–1.1µs** Pure Invariant Math · **p50 ~15µs** Wasm Reflex Core (**<20µs warm path**) · **p50 ~106µs** E2E Edge Shield (Worker + TS Gateway + Wasm FFI).  
> **Venue SSOT:** **5-Core Venue Matrix** — GMX v2 · Pendle · USD.ai · Hyperliquid · Variational.  
> **Vitest SSOT:** **222 test files | 1044 PASS clean** on `pnpm test -- --run`.  
> All standalone demos measure latency via `process.hrtime.bigint()` (µs precision) — no hardcoded timing outputs.

---

## 4-Tier Demo Suite (CLI SSOT)

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 0 — Retail Guard SDK** | `npx vitest run tests/sdk/retail-guard-provider.test.ts` | EIP-1193 C-end middleware · `withRetailGuardProvider()` |
| **Tier 1 — 5-Core Venues** | `pnpm demo:{gmx,pendle,usdai,hl,variational}` · `--trip` | Native protocol guards · FAIL_CLOSED proofs |
| **Tier 2 — Strategy Loops** | `pnpm demo:{perp-loop,spot-loop}` · `--trip` | Loop A perp/yield · Loop B USD.ai collateral |
| **Tier 3 — Sandbox & E2E** | `pnpm demo:{stabilizer,e2e,escort}` | Sepolia sandbox · macro lifecycle · bridge escort |

---

## Tier 0 — EIP-1193 Retail Guard SDK

```bash
npx vitest run tests/sdk/retail-guard-provider.test.ts   # 35/35 PASS
```

| Module | Path |
|--------|------|
| Provider middleware | [`src/sdk/robinhood-agentic-retail-wallet-guard/provider.ts`](../src/sdk/robinhood-agentic-retail-wallet-guard/provider.ts) |
| Integration blueprint | [`docs/sdk/01_SDK_INTEGRATION_BLUEPRINT.md`](./sdk/01_SDK_INTEGRATION_BLUEPRINT.md) |

Intercepts `eth_sendTransaction` / `eth_signTypedData_v4` pre-consensus — **0-Gas** on rejection. Generic DEX calldata parsing (Uniswap router selectors) is intentional Retail Guard behavior, **not** the pruned Uniswap V3 venue adapter.

---

## Tier 1 — 5-Core Venue Matrix

```bash
pnpm demo:gmx           # GMX v2 shadow margin · cross-venue slippage · position cap
pnpm demo:pendle        # Pendle PT/YT sentinel · guarded pool factory
pnpm demo:usdai         # USD.ai collateral · peg drift · oracle age guard
pnpm demo:hl            # Hyperliquid session key auth · orderbook depth guard
pnpm demo:variational   # Variational Omni RFQ stale quote & OLP depth guard
```

Append `-- --trip` for **FAIL_CLOSED** demonstration (**p50 ~15µs** Wasm `rootProtection()`).

| `--venue` key | Protocol | Chain | HUD invariant (sample) |
|---------------|----------|-------|------------------------|
| `gmx` | GMX v2 | Arbitrum One 42161 | OI skew / reserve cap · cross-venue slippage fuse |
| `pendle` | Pendle | Arbitrum One 42161 | \|Yield_current − Yield_oracle\| ≤ 150 bps |
| `usdai` / `usd` | USD.ai | Arbitrum One 42161 | Peg drift ≤ 30 bps · oracle age ≤ 2h |
| `hyperliquid` / `hl` | Hyperliquid | Hyperliquid L1 Perps | Spread ≤ 20 bps · session-key rate cap |
| `variational` / `var` | Variational Omni RFQ | Arbitrum One 42161 | Quote stale ≤ 500ms · OLP ≤ 15% |

Implementation SSOT: [`examples/lib/agent-venue-matrix.ts`](../examples/lib/agent-venue-matrix.ts)

**Pruned venues (v1.1):** Uniswap V3 · Aave V3 · Morpho Blue — Wasm ABI v2 **RESERVED_ABI_V2** holes preserved at protocol bits 4–6. See [`docs/architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md).

### Judge copy-paste commands

```bash
pnpm demo:gmx -- --trip
pnpm demo:variational -- --trip
pnpm demo:hl -- --trip
```

**Expected HUD signals:**
- `pnpm demo:gmx -- --trip` → `GMX_FAIL_CLOSED` · pool skew / price-impact breach · `⚡ Reflex Core Deadlock`
- `pnpm demo:variational -- --trip` → `VARIATIONAL_FAIL_CLOSED` · stale quote / OLP breach · `⚡ Reflex Core Deadlock`
- `pnpm demo:hl -- --trip` → `HL_FAIL_CLOSED` · session-key / depth guard · `⚡ Reflex Core Deadlock`

---

## Tier 2 — Strategy Loop Guards (Loop A / Loop B)

```bash
pnpm demo:perp-loop                              # Loop A: GMX / Pendle / HL / Variational
pnpm demo:perp-loop -- --trip                    # Loop A FAIL_CLOSED · p50 ~15µs rootProtection()
pnpm demo:perp-loop -- --hedge=variational       # Variational Omni RFQ hedge leg only
pnpm demo:perp-loop -- --hedge=hyperliquid       # Hyperliquid L1 hedge leg only
pnpm demo:spot-loop                              # Loop B: USD.ai collateral lane
pnpm demo:spot-loop -- --trip                    # Loop B FAIL_CLOSED · p50 ~15µs rootProtection()
pnpm demo:perp-loop -- --healthy-only            # Nominal PASS (no R20 sever)
```

| Loop | Venues | Role |
|------|--------|------|
| **Loop A (perp-loop)** | GMX · Pendle · HL · Variational | Perp/yield stack pre-broadcast guards |
| **Loop B (spot-loop)** | USD.ai | Collateral / peg lane pre-broadcast guards |

---

## Dual-Venue Short Architecture: GMX Backup & Variational Matrix

Citadel Shield uses a **three-tier venue stack** for perp short / hedge coverage.

| Tier | Venue | Chain | Role |
|------|-------|-------|------|
| **Primary** | Hyperliquid L1 | Off-Arbitrum L1 | High-speed perp shorting via **EIP-712 session keys** (`Wallet A`) |
| **Hard Anchor** | **GMX V2** | Arbitrum One `42161` | Arbitrum-native fallback when HL is unreachable — **0-Gas pre-consensus** |
| **RFQ Expansion** | **Variational** | Arbitrum One `42161` | Protocol-agnostic RFQ firewall · `allowedVenues[]` → **`VENUE_DRIFT_REJECTED`** |

Live GM I/O proofs: deposit [`0xe3155220…`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) · withdraw [`0xfd3601dc…`](https://arbiscan.io/tx/0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410).

---

## B2B Agent Integration (`withCitadelShield`)

Framework-agnostic B2B decorator — replaces v1.0 point-to-point AI framework adapters:

```bash
pnpm demo:agent    # withCitadelShield + verifyAgentIntent smoke demo
```

SSOT: [`src/sdk/decorator.ts`](../src/sdk/decorator.ts) · [`examples/agent-interceptor-demo.ts`](../examples/agent-interceptor-demo.ts)

---

## Pillar Set X vs Pillar Set Y — Command Boundary

| Pillar | CLI entry | Scope | What `--unwind` means here |
|--------|-----------|-------|----------------------------|
| **Pillar Set X** | `pnpm demo:e2e` | Sovereign Vault **capital lifecycle** — Robinhood escort → GMX GM deposit → HL delta-neutral hedge | **`pnpm demo:e2e -- --unwind`** appends Step 5 R20 Emergency Unwind (`RESULT: E2E OK (5/5)`) |
| **Pillar Set Y** | `pnpm demo:spot-loop` · `pnpm demo:perp-loop` | **Pre-consensus intent guards** — zero-gas FAIL_CLOSED *before* broadcast | **No `--unwind` flag.** Use `--trip` for reflex-core deadlock. |

---

## Multi-Wallet Cross-Venue Architecture (Wallet A × Wallet B)

| Lane | Wallet | Venue | What it does |
|------|--------|-------|--------------|
| **Wallet A — Hyperliquid Short Lane** | Default `0xef0752…960d` | Hyperliquid L1 Perps | Perp margin · EIP-712 session keys · 1× short hedge IOC |
| **Wallet B — Arbitrum Vault / GMX GM Lane** | Default `0xc9Bdd…546f` | Arbitrum One | **$2,500** user vault · **$2,400** GMX GM deposit · **$100** HL margin gateway |

```bash
pnpm demo:e2e                     # Pillar Set X — 4-Step Happy Path
pnpm demo:e2e -- --unwind         # Pillar Set X — 5-Step Emergency Capital Unwind
pnpm demo:e2e -- --trip           # Pillar Set X — Step 1 soil-trip fail-closed intercept
pnpm demo:perp-loop -- --trip     # Pillar Set Y — Loop A reflex demo
pnpm demo:spot-loop -- --trip     # Pillar Set Y — Loop B reflex demo
```

---

## Tier 3 — Sandbox & E2E

```bash
pnpm demo:stabilizer              # Sepolia Stabilizer 1:1 swap guard
pnpm demo:stabilizer -- --trip    # USDZ de-peg + reserve depletion + 60s cooldown
pnpm demo:escort                  # Unidirectional Compliance Bridge Escort (lostUsd ≡ $0)
pnpm demo:e2e                     # 4-Step Happy Path Lifecycle (RESULT: E2E OK 4/4)
pnpm demo:e2e -- --unwind         # 5-Step Emergency Capital Unwind (RESULT: E2E OK 5/5)
pnpm demo:e2e -- --trip           # Step 1 Gatehouse soil-trip intercept (FAIL_CLOSED abort)
```

---

## Quick verification paths

```bash
pnpm install
pnpm demo:gmx -- --trip
npx vitest run tests/sdk/retail-guard-provider.test.ts
pnpm demo:e2e
pnpm test       # Full System Regression Suite (222 test files | 1044 PASS clean)
```

Optional benchmark: `npx tsx scripts/grant-advanced-resilience-benchmark.ts`

→ Full verification matrix: [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)
