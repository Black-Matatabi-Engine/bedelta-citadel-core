# SliverVine Protocol (BeΔ) — SliverVine Citadel Shield: Citadel CLI Demo Guide

> **Buildathon Primary (The Shield):** `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:matrix -- --trip`  
> **Performance SSOT:** Each independent agent guard achieves **p50 ~106µs** Edge Wasm reflex — real agents operate in isolation without concurrent queue overhead.  
> **Vitest SSOT:** **217 test files | 967 PASS clean** on `pnpm test -- --run`.  
> All standalone demos measure latency via `process.hrtime.bigint()` (µs precision) — no hardcoded timing outputs.

---

## Tier 1 — AI Agent Shield (Primary)

```bash
pnpm demo:wayfinder             # Wayfinder route interception · p50 ~106µs guard — ALLOW
pnpm demo:elizaos               # ElizaOS action handler guard — ALLOW
pnpm demo:virtuals              # Virtuals GAME worker guard — ALLOW
pnpm demo:langchain             # LangChain CitadelRiskGuardTool — ALLOW
pnpm demo:wayfinder -- --trip   # Wayfinder 0-Gas fail-closed soil trip on Arbitrum 42161
pnpm demo:matrix -- --trip      # Full 7-protocol matrix · R20 physical deadlock severance (FAIL_CLOSED all legs)
```

| Command | Scope |
|---------|-------|
| `pnpm demo:wayfinder` | Wayfinder autonomous pathfinding · **Pre-Routing Intent Gate** · sub-ms Wasm reflex |
| `pnpm demo:elizaos` | ElizaOS plugin action execution · **Action-to-UserOp Dispatch Hook** |
| `pnpm demo:virtuals` | Virtuals GAME protocol task loop · **On-Chain Task Execution Boundary** |
| `pnpm demo:langchain` | LangGraph state node · **State Transition Guard** |
| `pnpm demo:wayfinder -- --trip` | Any framework + `--trip` → **0-Gas FAIL_CLOSED** soil trip |
| `pnpm demo:matrix -- --trip` | Full **7-protocol** cross-venue matrix · R20 trip + severance |

---

## 3-Tier Demo Suite (CLI SSOT)

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 1 — AI Agent Shield** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:matrix -- --trip` | Independent framework guards · 7-protocol matrix R20 severance |
| **Tier 1 — Native Protocols** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:uniswap` · `pnpm demo:aave` · `pnpm demo:morpho` · `pnpm demo:variational` · `pnpm demo:matrix` | GMX · HL · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · Variational RFQ · **7-protocol cross-venue matrix** |
| **Tier 2 — Agent Frameworks** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` | Wayfinder · ElizaOS · Virtuals · LangChain (each **p50 ~106µs** in isolation) |
| **Tier 3 — Sandbox & E2E** | `pnpm demo:stabilizer` · `pnpm demo:e2e` | Sepolia Stabilizer 1:1 guard · **4-step Happy Path** macro lifecycle (`--unwind` · `--trip` optional) |
| **Vitest matrix** | `pnpm demo` | 12 Tri-Pillar ANSI scenarios (`tests/demo/`) |

---

## Tier 1 — Native Protocols

```bash
pnpm demo:gmx           # GMX v2 shadow margin · cross-venue slippage · position cap
pnpm demo:hl            # Hyperliquid session key auth · orderbook depth guard
pnpm demo:pendle        # Pendle PT/YT sentinel · guarded pool factory
pnpm demo:uniswap       # Uniswap V3 concentrated liquidity · dynamic fee guard
pnpm demo:aave          # Aave V3 HF & cross-chain liquidation guard
pnpm demo:morpho        # Morpho Blue vault share-price & sandwich guard
pnpm demo:variational   # Variational Omni RFQ stale quote & OLP depth guard
```

### Matrix loop variants

```bash
pnpm demo:matrix              # Full cross-venue matrix (--loop=all, default)
pnpm demo:matrix -- --loop=perp                    # Pendle → GMX → dual perp hedge (HL + Variational)
pnpm demo:matrix -- --loop=perp --hedge=variational   # Variational Omni RFQ hedge leg
pnpm demo:matrix -- --loop=perp --hedge=hyperliquid   # Hyperliquid L1 hedge leg only
pnpm demo:matrix -- --loop=perp --hedge=both          # HL + Variational (default perp hedge)
pnpm demo:matrix -- --loop=spot                    # Uniswap V3 → Aave V3 → Morpho Blue spot loop
# Append -- --healthy-only for nominal PASS; default runs R20 trip + severance
```

Append `-- --trip` to any Tier 1 command for **FAIL_CLOSED** demonstration.

---

## Tier 2 — Agent Frameworks

Each framework demo runs **one agent guard in isolation** — demonstrating **p50 ~106µs** Edge Wasm reflex without multi-agent concurrent queue overhead.

```bash
pnpm demo:wayfinder     # Wayfinder route interception on Arbitrum 42161
pnpm demo:elizaos       # ElizaOS Action handler guard
pnpm demo:virtuals      # Virtuals GAME worker guard
pnpm demo:langchain     # LangChain CitadelRiskGuardTool
```

Append `-- --trip` for 0-Gas Fail-Closed soil trip on any framework demo.

| Framework | Abstraction layer | Citadel interception point |
|-----------|-------------------|---------------------------|
| **Wayfinder** | Autonomous Pathfinding & Intent Routing | Pre-Routing Intent Gate |
| **ElizaOS** | Plugin / Character Action Execution | Action-to-UserOp Dispatch Hook |
| **Virtuals (GAME)** | Protocol-Level Agent Task Loop | On-Chain Task Execution Boundary |
| **LangChain / LangGraph** | State Node & Multi-Step Reasoning | State Transition Guard |

---

## Multi-Wallet Cross-Venue Architecture (Wallet A × Wallet B)

Production hedging uses **two wallets on two venues**. Wallet B holds Arbitrum/GMX exposure; Wallet A executes Hyperliquid shorts via session keys. The engine [`gmx-cross-wallet-hedge.ts`](../src/services/gmx-cross-wallet-hedge.ts) sizes shorts from **live GMX ETH delta** until **Δ_net ≡ 0**. Worker/cron logs emit `[WALLET_B_GMX_STATE]` · `[WALLET_A_HL_STATE]` · `[CROSS_VENUE_MATCH]` for auditability.

| Lane | Wallet | Venue | What it does |
|------|--------|-------|--------------|
| **Wallet A — Hyperliquid Short Lane** | Default `0xef0752…960d` | Hyperliquid L1 Perps | Perp margin · EIP-712 session keys · 1× short hedge IOC |
| **Wallet B — Arbitrum Vault / GMX GM Lane** | Default `0xc9Bdd…546f` (`uiFeeReceiver`) | Arbitrum One | **$2,500** user vault · **$2,400** GMX GM deposit · **$100** HL margin gateway · +$2.40 treasury rebate (not principal) |

**`pnpm demo:e2e`** renders this **cross-wallet orchestration as one unified terminal HUD** — judges see the full 4-step Happy Path (and optional `--unwind` / `--trip`) without switching between Arbitrum and Hyperliquid CLIs. Same capital invariant SSOT as [`src/core/capital-invariant-ledger.ts`](../src/core/capital-invariant-ledger.ts).

```bash
pnpm demo:e2e                     # 4-step Happy Path — multi-wallet narrative in one HUD
pnpm demo:e2e -- --unwind         # + Step 5 Citadel Shield R20 unwind
pnpm demo:e2e -- --trip           # Step 1 soil-trip fail-closed intercept
```

---

## Tier 3 — Sandbox & E2E

```bash
pnpm demo:stabilizer              # Sepolia Stabilizer 1:1 swap guard
pnpm demo:stabilizer -- --trip    # USDZ de-peg + reserve depletion + 60s cooldown
pnpm demo:wayfinder -- --stabilizer   # Stabilizer harness via Wayfinder adapter
pnpm demo:e2e                     # 4-step Happy Path macro lifecycle ANSI HUD
pnpm demo:e2e -- --unwind         # Optional Step 5 Citadel Shield R20 unwind (5/5)
pnpm demo:e2e -- --trip           # Step 1 soil-trip stress intercept
```

---

## Quick verification paths

```bash
pnpm install
pnpm demo:wayfinder   # Primary judge entry — independent p50 ~106µs guard
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 4-Step Happy Path Macro Lifecycle CLI (--unwind · --trip optional)
pnpm test       # Full System Regression Suite (217 test files | 967 PASS clean)
```

Optional benchmark: `npx tsx scripts/grant-advanced-resilience-benchmark.ts`

→ Full verification matrix: [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)
