# 🔒 [INTERNAL ONLY] Citadel Capital Loops Topology & Expansion Architecture

> **Document Status**: Strictly Confidential / Internal Technical SSOT  
> **Visibility**: Internal Core Team Only (DO NOT expose in Public Grant Submissions or Public Roadmaps)  
> **Target System**: SilverVine Protocol / Citadel Core Pre-Execution Engine  

---

## 1. Executive Summary & Political Positioning

Publicly, Citadel markets its **Full Arbitrum Native Multi-Protocol Coverage** focusing exclusively on Arbitrum Foundation-supported blue-chip primitives:

- **GMX v2** (Perp & Shadow Margin)
- **Pendle** (Yield & Fixed Rates)
- **Camelot V3** (Ecosystem Native Spot & Launchpad)
- **Radiant Capital** (Omnichain Lending & Health Factor Safety)
- **Jones DAO** (Leveraged Vaults & Anti-Sandwich Protection)
- **Hyperliquid** (Independent Cross-Chain L1 Orderbook)
- **Variational** (Arbitrum One Omni RFQ — optional Loop 1 perp hedge target)

Internally, Citadel maintains a **modular, protocol-agnostic vector risk engine (`src/core/risk-engine-core.ts`)**. This engine is mathematically designed to plug into **any AMM, CDP, or Stablecoin Minting Protocol** via standard `SoilResistanceInput` vector masks without modifying core code.

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
│ Loop 2: Spot & Lending Vault Loop                                           │
│ ➔ Venues: Camelot V3 + Radiant Capital + Jones DAO                          │
│ ➔ Mechanism: Camelot V3 Swap -> Radiant Collateral/Borrow -> Jones Vaults   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ INTERNAL TECHNICAL RESERVES (Stealth / Post-Grant Integration)              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Loop 3: Zero-Slippage Peg & De-peg Arb Loop (Stabilizer Sandbox)            │
│ ➔ Venues: Camelot V3 + Stabilizer (Sepolia Sandbox) + Radiant Capital       │
│ ➔ Mechanism: 1:1 Zero-Slippage USDZ Mint/Redeem + Dynamic De-peg Circuit Break│
│                                                                             │
│ Loop 4: Autonomous Treasury & CDP Loop (Future R&D)                         │
│ ➔ Venues: Treasure/MAGIC + Open Dollar CDP                                  │
│ ➔ Mechanism: Long-tail NFT/Asset liquidation + CDP debt ratio enforcement   │
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
- Frame Citadel as the defender of Arbitrum Native TVL (GMX, Pendle, Camelot, Radiant, Jones).
- Do **NOT** mention Stabilizer or unverified stablecoins in the public Roadmap or Grant Pitch.

### Demo Ergonomics (`pnpm demo:matrix`)

- Default CLI command runs **Loop 1 + Loop 2** (Pure Arbitrum Mainnet Natives).
- `--loop=perp` runs Loop 1 (default `--hedge=both`: Hyperliquid + Variational).
- `--loop=perp --hedge=variational` isolates Variational Omni RFQ OLP pre-flight (`validateVariationalRFQIntent`).
- `--loop=spot` runs Loop 2.
- Loop 3 remains strictly isolated under `pnpm demo:stabilizer` for Sepolia testing.
