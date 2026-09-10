# 🔒 [INTERNAL ONLY] Citadel Capital Loops Topology & Expansion Architecture

> **Document Status**: Strictly Confidential / Internal Technical SSOT  
> **Visibility**: Internal Core Team Only (DO NOT expose in Public Grant Submissions or Public Roadmaps)  
> **Target System**: SilverVine Protocol / Citadel Core Pre-Execution Engine  

---

## 1. Executive Summary & Political Positioning

Publicly, Citadel markets the **5-Core Venue Matrix**:

- **GMX v2** (Perp & Shadow Margin)
- **Pendle** (Yield & Fixed Rates)
- **USD.ai** (AI-Compute RWA Collateral)
- **Hyperliquid** (Independent Cross-Chain L1 Orderbook)
- **Variational** (Arbitrum One Omni RFQ)

Pruned venue adapters (Uniswap V3 · Aave V3 · Morpho Blue) retain Wasm **RESERVED_ABI_V2** holes — not public product surface.

Internally, Citadel maintains a **modular, protocol-agnostic vector risk engine (`src/core/risk-engine-core.ts`)**. This engine is mathematically designed to plug into **any AMM, CDP, or Stablecoin Minting Protocol** via standard `SoilResistanceInput` vector masks without modifying core code.

**Phase 2 (internal reserve):** Spark, Fluid, USD.AI, D2 Finance — see [§5](#5-phase-2-protocol-expansion-internal-reserve).

---

## 2. Comprehensive Capital Loops Topology (Internal Matrix)

Citadel classifies all AI Agent chain interactions into four discrete **Capital Loops**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ PUBLIC & GRANT FACING LOOPS (Primary Focus for Arbitrum Buildathon)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Loop 1: Δ-Neutral Perp Stack Loop                                           │
│ ➔ Venues: Pendle + GMX v2 + Hyperliquid (+ optional Variational Omni RFQ)   │
│ ➔ Mechanism: Pendle PT yield locking + GMX GM Shadow Margin + HL L1 /       │
│   Variational RFQ OLP hedge (`--hedge=hyperliquid|variational|both`)        │
│                                                                             │
│ Loop 2: Spot & Collateral Vault Loop                                        │
│ ➔ Venues: USD.ai collateral lane                                            │
│ ➔ Mechanism: sUSDai peg drift · oracle age · depth fuse pre-broadcast      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ INTERNAL TECHNICAL RESERVES (Stealth / Post-Grant Integration)              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Loop 3: Zero-Slippage Peg & De-peg Arb Loop (Stabilizer Sandbox)            │
│ ➔ Venues: Uniswap V3 + Stabilizer (Sepolia Sandbox) + Aave V3               │
│ ➔ Mechanism: 1:1 Zero-Slippage USDZ Mint/Redeem + Dynamic De-peg Circuit Break│
│                                                                             │
│ Loop 4: Autonomous Treasury & CDP Loop (Future R&D)                         │
│ ➔ Venues: Treasure/MAGIC + Open Dollar CDP                                  │
│ ➔ Mechanism: Long-tail NFT/Asset liquidation + CDP debt ratio enforcement   │
│                                                                             │
│ Loop 5: Phase 2 Next-Gen Protocol Stack (Internal Reserve — §5)             │
│ ➔ Venues: Spark + Fluid + USD.AI + D2 Finance                               │
│ ➔ Mechanism: Stablecoin peg + unified L+D layer + GPU RWA + struct vaults │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Deep Dive: Loop 3 Technical Specification (Internal Reserve)

### 3.1 Mechanics & Risk Invariants

Loop 3 addresses AI Agent exposure to 1:1 pegged assets and pegged stablecoins (e.g., USDZ / Sandbox Tokens).

**Invariant 1: Peg Deviation Limit**

$$
\Delta \text{Peg} = |\text{Price}_{\text{USDZ}} - 1.0000|
$$

If $\Delta \text{Peg} > 50\,\text{bps}$ ($0.0050$), `evaluateStabilizerGuard()` returns `FLAGS_DEPEG_TRIP`.

**Invariant 2: Reserve Slippage & Liquidity Ratio**

If Agent attempts mint/redeem during thin pool depth or high oracle delay ($>30\text{s}$), the 0-Gas fast-path trips `FAIL_CLOSED`.

### 3.2 Code Base Isolation

To ensure zero leak into public Grant materials while maintaining test integrity:

- **Adapter Implementation**: `src/adapters/stabilizer/`
- **Test Suite**: `tests/adapters/stabilizer/`
- **CLI Entry**: `pnpm demo:stabilizer` (Marked as "Sepolia Sandbox Testnet Demo" in internal testing, omitted from primary Grant pitch decks).

---

## 4. Operational & OpSec Guidelines

### Grant Submission Alignment (`SUBMISSION.md`, `JUDGE_BRIEF.md`, `README.md`)

- Refer strictly to **Loop 1** (Perp Stack) and **Loop 2** (Spot & Lending Vault).
- Frame Citadel as the defender of Arbitrum Native TVL (Uniswap V3, Aave V3, Morpho Blue, GMX, Pendle).
- Do **NOT** mention Stabilizer, Phase 2 protocols (Spark, Fluid, USD.AI, D2 Finance), or unverified stablecoins in the public Roadmap or Grant Pitch.

### Demo Ergonomics (targeted venue proofs)

- `pnpm demo:perp-loop` runs **Loop 1** (GMX / Pendle / HL / Variational perp stack).
- `pnpm demo:spot-loop` runs **Loop 2** (Morpho / Aave / USD.ai / Uniswap spot & lending).
- `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` · `pnpm demo:hl -- --trip` — judge fast-track single-venue FAIL_CLOSED proofs.
- `pnpm demo:perp-loop -- --hedge=variational` isolates Variational Omni RFQ OLP pre-flight (`validateVariationalRFQIntent`).
- Loop 3 remains strictly isolated under `pnpm demo:stabilizer` for Sepolia testing.
- Loop 5 (Phase 2) has **no public CLI** until adapters land under `src/adapters/{spark,fluid,usd-ai,d2}/`.

---

## 5. Phase 2 Protocol Expansion (Internal Reserve)

> **Status:** Specification only — not in public 7-protocol matrix.  
> **Target:** Post-grant adapter sprint · `PROTO_VECT_LEN` expansion to **32** required (current lane map exhausts slots 0–23).

### 5.1 Spark Protocol

**Role:** Maker/Sky-aligned stablecoin stack on Arbitrum — USDS mint/redeem + SparkLend (Aave V3 fork) collateral markets.

| Invariant | Threshold (draft) | Evaluator (planned) | Bit |
|-----------|-------------------|---------------------|-----|
| USDS peg deviation | $\|\text{Price}_{\text{USDS}} - 1.0000\| > 50\,\text{bps}$ | `evaluateSparkFlags()` → `FLAG_SPARK_USDS_DEPEG` | `1 << 14` |
| SparkLend HF (Aave-v3 class) | $\text{HF} < 1.15$ (fail-closed buffer) | same → `FLAG_SPARK_HF_LOW` | `1 << 15` |
| DSR / savings-rate oracle lag | oracle age $> 3{,}600{,}000\,\text{ms}$ | same → `FLAG_SPARK_ORACLE_STALE` | (fold into HF lane) |

**Lane layout (slot 24–27):** `[usdsPrice, usdsPegRef, sparkHf, projectedHf]`

**Soil fuse:** Reuse `STABILIZER_DEPEG_MAX_BPS` pattern for USDS; HF math inherits `AAVE_HF_MIN` from `risk-engine-limits.ts`.

**Adapter path (planned):** `src/adapters/spark/spark-protocol-adapter.ts`

---

### 5.2 Fluid Protocol

**Role:** Unified Lending + DEX liquidity layer — correlated liquidation risk when swap depth and borrow health move together.

| Invariant | Threshold (draft) | Evaluator (planned) | Bit |
|-----------|-------------------|---------------------|-----|
| Combined L+D utilization | swap utilization $> 85\%$ **and** HF $< 1.25$ | `evaluateFluidFlags()` → `FLAG_FLUID_CORRELATED_LIQ` | `1 << 16` |
| DEX leg slippage (in-layer) | estimated slippage $> 50\,\text{bps}$ | same → `FLAG_FLUID_SLIPPAGE` | `1 << 17` |
| Cross-venue liquidation cascade | $\Delta\text{HF} / \Delta t > 0.08$ per block window | same → `FLAG_FLUID_CASCADE` | (severity fold) |

**Lane layout (slot 28–31):** `[dexUtilization, lendHf, swapSlippageBps, hfDeltaPerBlock]`

**Correlated guard logic:**

$$
\text{trip} \iff (\text{util} > 0.85 \land \text{HF} < 1.25) \lor (\text{slippageBps} > 50 \land \text{HF} < 1.15)
$$

**Soil fuse:** Depth on Fluid DEX leg must exceed `tradeSizeUsd / 0.15` (15% max utilization, aligned with Variational OLP cap).

**Adapter path (planned):** `src/adapters/fluid/fluid-liquidity-layer-adapter.ts`

---

### 5.3 USD.AI

**Role:** GPU-backed RWA yield vault — sUSDai stable share token with off-chain GPU valuation oracle.

| Invariant | Threshold (draft) | Evaluator (planned) | Bit |
|-----------|-------------------|---------------------|-----|
| GPU RWA oracle timestamp | valuation age $> 7{,}200{,}000\,\text{ms}$ (2h) | `evaluateUsdAiFlags()` → `FLAG_USDAI_ORACLE_STALE` | `1 << 18` |
| sUSDai peg drift | $\|\text{Price}_{\text{sUSDai}} - 1.0000\| > 30\,\text{bps}$ | same → `FLAG_USDAI_PEG_DRIFT` | `1 << 19` |
| NAV vs GPU mark deviation | $\|\text{NAV} - \text{GPUmark}\| / \text{GPUmark} > 50\,\text{bps}$ | same → `FLAG_USDAI_NAV_DEVIATION` | (fold into peg lane) |

**Lane layout (reserved — requires `PROTO_VECT_LEN=40`):** `[sUsdaiPrice, pegRef, gpuMarkUsd, oracleTimestampMs]`

**Soil fuse:** Block mint/redeem when GPU oracle heartbeat missing or sUSDai AMM depth $< \$100{,}000$.

**Adapter path (planned):** `src/adapters/usd-ai/usd-ai-rwa-adapter.ts`

---

### 5.4 D2 Finance

**Role:** Structural derivatives vault — share-price execution bounds for options/perp-structured vault products.

| Invariant | Threshold (draft) | Evaluator (planned) | Bit |
|-----------|-------------------|---------------------|-----|
| Vault share slippage | $\|\text{quotedShare} - \text{expectedShare}\| / \text{expectedShare} > 30\,\text{bps}$ | `evaluateD2Flags()` → `FLAG_D2_SHARE_SLIPPAGE` | `1 << 20` |
| Execution bound breach | trade notional $> 10\%$ of vault TVL in single intent | same → `FLAG_D2_EXEC_BOUND` | `1 << 21` |
| Structural delta shock | $\|\Delta\delta\| > 0.15$ vs vault policy band | same → `FLAG_D2_DELTA_SHOCK` | (fold into slippage lane) |

**Lane layout (reserved):** `[expectedShareUsd, quotedShareUsd, tradeNotionalUsd, vaultTvlUsd]`

**Soil fuse:** Reject rebalance intents during pending settlement window or when share oracle age $> 1{,}800{,}000\,\text{ms}$.

**Adapter path (planned):** `src/adapters/d2/d2-structural-vault-adapter.ts`

---

### 5.5 Phase 2 Integration Checklist

| Step | Owner | Gate |
|------|-------|------|
| Expand `PROTO_VECT_LEN` 24 → 40 | Core | ABI + WASM FFI review |
| Reserve bits 14–21 in `risk-flags.ts` | Core | No public doc mention |
| Add limits to `risk-engine-limits.ts` | Core | Manifest parity CI |
| Adapter stubs + Vitest per protocol | Adapters | Targeted `vitest run` per file |
| `pnpm demo:perp-loop -- --loop=phase2` (internal only) | DX | **Never** in `SUBMISSION.md` |
