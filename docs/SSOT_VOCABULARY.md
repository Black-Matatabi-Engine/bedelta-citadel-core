# Documentation SSOT Vocabulary (Post v1.1 Venue Prune)

Use this glossary when editing public docs. Historical persona audits under `docs/internal/09xx_*` are frozen — do not retro-edit.

| Old term | New term |
|----------|----------|
| 7+1 / 8-venue matrix | **5-Core Venue Matrix** (+ Hyperliquid L1 cross-chain) |
| Tier 2 AI framework demos (`demo:wayfinder`, etc.) | **Deprecated v1.0 harnesses** — product surface is **EIP-1193 Retail Guard** |
| `evaluateUniswapFlags` / `evaluateAaveFlags` / `evaluateMorphoFlags` | **Removed** — protocol bits 4–6 are `RESERVED_ABI_V2` |
| Aave APY fallback | **Pendle PT yield fallback** (`DEFAULT_PENDLE_BASE_APY`) |
| `AAVE_COLLATERAL` cascade leg | **`USDAI_COLLATERAL`** |
| 217 / 967 / 220 / 992 tests | **218 test files / 1032 PASS** (full Vitest) |
| Point-to-point ElizaOS / Virtuals / LangChain / Wayfinder adapters | **Removed from repo** — B2B uses `withCitadelShield` + `verifyAgentIntent` |

## 5-Core Venues (Production)

GMX v2 · Pendle · USD.ai · Hyperliquid · Variational

## C-End Integration Surface

`@slivervine/robinhood-agentic-retail-wallet-guard` — `withRetailGuardProvider()` (EIP-1193)

## Wasm ABI v2 Hole Preservation

Bits 4–6, protocol vector slots 8–19, and intent venue indices 2–4 remain **reserved** for Wasm/Stylus parity after prune.
