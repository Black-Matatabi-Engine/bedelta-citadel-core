# SliverVine Protocol (BeΔ) — SliverVine Citadel Shield: Citadel CLI Demo Guide

> **Buildathon Primary (The Shield):** `pnpm demo:wayfinder` · `pnpm demo:langchain -- --venue=pendle` · `pnpm demo:wayfinder -- --trip` · `pnpm demo:matrix -- --trip`  
> **Latency hierarchy:** **~0.5µs–1.1µs** Pure Invariant Math · **p50 ~15µs** Wasm Reflex Core (**<20µs warm path**) · **p50 ~106µs** E2E Edge Shield (Worker + TS Gateway + Wasm FFI).  
> **Performance SSOT:** Each independent agent guard runs in isolation — ALLOW paths measure E2E Edge Shield; `--trip` paths measure reflex-core severance.  
> **Venue SSOT:** Default **7+1 Cross-Chain Execution Matrix (7 Arbitrum Native + 1 Hyperliquid L1) rotation** · manual `--venue=<protocol>` lock · `--trip` fail-closed.  
> **Vitest SSOT:** **217 test files | 967 PASS clean** on `pnpm test -- --run`.  
> All standalone demos measure latency via `process.hrtime.bigint()` (µs precision) — no hardcoded timing outputs.

---

## Tier 1 — AI Agent Shield (Primary)

```bash
# 4 Framework Guards — p50 ~106µs E2E Edge Shield
pnpm demo:wayfinder                      # Default 7+1 venue rotation
pnpm demo:langchain -- --venue=pendle    # Manual Pendle lane lock
pnpm demo:langchain -- --trip            # Framework FAIL_CLOSED · p50 ~15µs reflex core
# Standalone Matrix — p50 ~15µs Wasm rootProtection (no framework overhead)
pnpm demo:matrix -- --trip               # 9/9 R20 severance · pure-math engine
```

| Command | Scope |
|---------|-------|
| `pnpm demo:wayfinder` | Wayfinder · **Pre-Routing Intent Gate** · default **8-venue rotation** |
| `pnpm demo:elizaos` | ElizaOS · **Action-to-UserOp Dispatch Hook** · default **8-venue rotation** |
| `pnpm demo:virtuals` | Virtuals GAME · **On-Chain Task Execution Boundary** · default **8-venue rotation** |
| `pnpm demo:langchain` | LangGraph · **State Transition Guard** · default **8-venue rotation** |
| `pnpm demo:<framework> -- --venue=<protocol>` | Lock a specific protocol lane (e.g. `--venue=aave`, `--venue=hl`) |
| `pnpm demo:<framework> -- --trip` | Simulated toxic intent / invariant breach → **0-Gas FAIL_CLOSED** |
| `pnpm demo:matrix -- --trip` | **Standalone** pure-math matrix reflex core (**p50 ~15µs** · no AI framework overhead) · 9/9 R20 severance |

---

## 3-Tier Demo Suite (CLI SSOT)

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 1 — AI Agent Shield** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `--venue` · `--trip` · `pnpm demo:matrix -- --trip` | Independent framework guards · 7+1 venue rotation · 7+1 Cross-Chain Execution Matrix R20 severance |
| **Tier 1 — Native Protocols** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:uniswap` · `pnpm demo:aave` · `pnpm demo:morpho` · `pnpm demo:variational` · `pnpm demo:matrix` | GMX · HL · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · Variational RFQ · **7+1 Cross-Chain Execution Matrix** |
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

Each framework demo runs **one agent guard in isolation** — **p50 ~106µs E2E Edge Shield** on ALLOW paths, **p50 ~15µs reflex core** on `--trip` — without multi-agent concurrent queue overhead. All four demos (`wayfinder` · `elizaos` · `virtuals` · `langchain`) share identical CLI flags.

### Demo modes

| Mode | Flag | Behavior |
|------|------|----------|
| **Default (rotated)** | *(none)* | Auto-selects a venue from the **7+1 Cross-Chain Execution Matrix (7 Arbitrum Native + 1 Hyperliquid L1)** on each run. HUD prints `VENUE: <protocol> · rotated` plus the active `INVARIANT` check and protocol-specific intent. |
| **Manual lock** | `--venue=<protocol>` | Locks a specific protocol lane. Example: `pnpm demo:langchain -- --venue=pendle` → HUD prints `VENUE: Pendle · locked`. |
| **Fail-closed trip** | `--trip` | Forces simulated toxic intent / market invariant breach → **p50 ~15µs** Wasm `rootProtection()` physical deadlock · **0-Gas** pre-broadcast intercept. |

```bash
pnpm demo:wayfinder                      # Default 7+1 venue rotation
pnpm demo:elizaos -- --venue=morpho      # Manual lock — Morpho Blue vault lane
pnpm demo:virtuals -- --venue=variational # Manual lock — Variational Omni RFQ
pnpm demo:langchain -- --trip            # Fail-closed soil trip
```

### 7+1 Cross-Chain Execution Matrix (`--venue` keys)

**7 Arbitrum One natives** (GMX v2 · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · USD.ai · Variational Omni RFQ) **+ 1 Hyperliquid L1** cross-chain HF orderbook defense.

| `--venue` key | Protocol | Chain / venue | HUD invariant (sample) |
|---------------|----------|---------------|------------------------|
| `gmx` | GMX v2 | Arbitrum One 42161 | OI skew / reserve cap · cross-venue slippage fuse |
| `pendle` | Pendle | Arbitrum One 42161 | \|Yield_current − Yield_oracle\| ≤ 150 bps |
| `uniswap` / `uni` | Uniswap V3 | Arbitrum One 42161 | Tick depth · slippage ≤ 50 bps |
| `aave` | Aave V3 | Arbitrum One 42161 | Health Factor HF ≥ 1.15 |
| `morpho` | Morpho Blue | Arbitrum One 42161 | NAV deviation ≤ 30 bps |
| `usdai` / `usd` | USD.ai | Arbitrum One 42161 | Peg drift ≤ 30 bps · oracle age ≤ 2h |
| `hyperliquid` / `hl` | Hyperliquid | Hyperliquid L1 Perps | Spread ≤ 20 bps · session-key rate cap |
| `variational` / `var` | Variational Omni RFQ | Arbitrum One 42161 | Quote stale ≤ 500ms · OLP ≤ 15% |

Implementation SSOT: [`examples/lib/agent-venue-matrix.ts`](../examples/lib/agent-venue-matrix.ts)

| Framework | Abstraction layer | Citadel interception point |
|-----------|-------------------|---------------------------|
| **Wayfinder** | Autonomous Pathfinding & Intent Routing | Pre-Routing Intent Gate |
| **ElizaOS** | Plugin / Character Action Execution | Action-to-UserOp Dispatch Hook |
| **Virtuals (GAME)** | Protocol-Level Agent Task Loop | On-Chain Task Execution Boundary |
| **LangChain / LangGraph** | State Node & Multi-Step Reasoning | State Transition Guard |

> **Note:** `pnpm demo:wayfinder -- --stabilizer` uses the Sepolia Stabilizer sandbox and ignores `--venue` rotation.

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
pnpm demo:wayfinder                      # Primary judge entry — 7+1 venue rotation
pnpm demo:langchain -- --venue=pendle    # Manual venue lock smoke test
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 4-Step Happy Path Macro Lifecycle CLI (--unwind · --trip optional)
pnpm test       # Full System Regression Suite (217 test files | 967 PASS clean)
```

Optional benchmark: `npx tsx scripts/grant-advanced-resilience-benchmark.ts`

→ Full verification matrix: [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)
