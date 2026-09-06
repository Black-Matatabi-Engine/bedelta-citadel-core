# SliverVine Protocol (BeΔ) — SliverVine Citadel Shield: Citadel CLI Demo Guide

> **Flagship demos** (README hero): `pnpm demo:matrix` · `pnpm demo:quad`  
> **Vitest SSOT:** **194 test files | 845 PASS Clean (100% PASS)** on `pnpm test -- --run`.  
> All standalone demos measure latency via `process.hrtime.bigint()` (µs precision) — no hardcoded timing outputs.

---

## Flagship Commands

| Command | Scope |
|---------|-------|
| `pnpm demo:matrix` | Full **7-protocol** cross-venue matrix (`--loop=all`, default) |
| `pnpm demo:quad` | Full **4 AI Agent frameworks** pre-flight shield (Wayfinder · ElizaOS · Virtuals · LangChain) |

```bash
pnpm demo:matrix              # Full cross-venue matrix (--loop=all, default)
pnpm demo:matrix -- --trip      # R20 trip + severance (FAIL_CLOSED all legs)
pnpm demo:quad                # All four AI frameworks (combined ALLOW)
pnpm demo:quad -- --trip      # Quad-framework toxic soil / hallucination trip
```

---

## 3-Tier Demo Suite (CLI SSOT)

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 1 — Native Protocols** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:uniswap` · `pnpm demo:aave` · `pnpm demo:morpho` · `pnpm demo:variational` · `pnpm demo:matrix` | GMX · HL · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · Variational RFQ · **7-protocol cross-venue matrix** |
| **Tier 2 — Agent Frameworks** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:quad` | Wayfinder · ElizaOS · Virtuals · LangChain · combined quad run |
| **Tier 3 — Sandbox & E2E** | `pnpm demo:stabilizer` · `pnpm demo:e2e` | Sepolia Stabilizer 1:1 guard · 5-step macro lifecycle |
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

```bash
pnpm demo:wayfinder     # Wayfinder route interception on Arbitrum 42161
pnpm demo:elizaos       # ElizaOS Action handler guard
pnpm demo:virtuals      # Virtuals GAME worker guard
pnpm demo:langchain     # LangChain CitadelRiskGuardTool
pnpm demo:quad          # All four AI frameworks (combined)
```

Append `-- --trip` for 0-Gas Fail-Closed soil trip on any framework demo.

---

## Tier 3 — Sandbox & E2E

```bash
pnpm demo:stabilizer              # Sepolia Stabilizer 1:1 swap guard
pnpm demo:stabilizer -- --trip    # USDZ de-peg + reserve depletion + 60s cooldown
pnpm demo:wayfinder -- --stabilizer   # Stabilizer harness via Wayfinder adapter
pnpm demo:e2e                     # 5-step macro lifecycle ANSI HUD
```

---

## Quick verification paths

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite (194 test files | 845 PASS Clean (100% PASS))
```

Optional benchmark: `npx tsx scripts/grant-advanced-resilience-benchmark.ts`

→ Full verification matrix: [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)
