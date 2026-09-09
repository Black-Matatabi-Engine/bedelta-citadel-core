# SliverVine Citadel Shield — Production Workflow Deep Dive

**Document role:** Authoritative English SSOT for the dual-wallet delta-neutral execution plane on Arbitrum One (`42161`).  
**Verified commit:** `main` @ **`abd8518`** · **216 test files | 964 PASS Clean (100% PASS)**  
**Related:** [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md) · [`ARB_Buildathon/SUBMISSION.md`](./ARB_Buildathon/SUBMISSION.md)

---

## Executive Summary

SliverVine's production envelope splits capital across **two specialized wallets with zero key coupling**:

| Plane | Wallet | Venue | Responsibility |
|-------|--------|-------|----------------|
| **Yield vault** | Wallet B `0xc9Bdd…546f` | Arbitrum One · GMX v2 GM | GM LP **deposit / withdraw only** · `uiFeeReceiver` treasury lane |
| **Hedge engine** | Wallet A `0xef0752…960d` | Hyperliquid L1 (primary) · GMX v2 (fallback) | Perp **short** hedge until **Δ_net ≡ 0** |

Cross-wallet sizing SSOT: [`gmx-cross-wallet-hedge.ts`](../src/services/gmx-cross-wallet-hedge.ts).  
Telemetry tags: `[WALLET_B_GMX_STATE]` · `[WALLET_A_HL_STATE]` · `[CROSS_VENUE_MATCH]`.

---

## Section 1 — Wallet B: GM LP Yield Vault (Pure Deposit / Withdraw)

### 1.1 Scope boundary

Wallet B is **exclusively** the Arbitrum GM LP vault. It must **never** sign GMX perp `createOrder` payloads.

| Allowed | Forbidden |
|---------|-----------|
| GM Pool `createDeposit` multicall | GMX perp long/short `createOrder` |
| GM LP → Router `approve` | Hyperliquid session keys |
| GM Pool `createWithdrawal` multicall | Wallet A hedge keys on Wallet B |

**Enforcement:** global `assertWalletBPerpIsolation()` in [`wallet-isolation-guard.ts`](../src/core/wallet-isolation-guard.ts) — throws `WALLET_B_PERP_FORBIDDEN` on all GMX `createOrder` builder paths.

### 1.2 Three-leg GM I/O multicall (verified live)

Production GM I/O uses GMX v2 `ExchangeRouter` multicall on Arbitrum One:

| Leg | Action | SSOT CLI |
|-----|--------|----------|
| **1 — Deposit** | `sendWnt` → `sendTokens` → `createDeposit` | `pnpm execute:gmx:gm-deposit` |
| **2 — Approve** | GM LP token → GMX v2 Router spender | Part of withdraw prep · live tx [`0x30ec0b7a…`](https://arbiscan.io/tx/0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e) |
| **3 — Withdraw** | `sendWnt` → `sendTokens(GM)` → `createWithdrawal` | `pnpm execute:gmx:gm-withdraw` |

**Verified deposit tx:** [`0xe3155220…`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774)  
**Verified withdraw tx:** [`0xfd3601dc…`](https://arbiscan.io/tx/0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410)

**Code SSOT:** [`gmx-gm-deposit-multicall.ts`](../src/services/adapters/gmx-gm-deposit-multicall.ts) · [`gmx-gm-withdraw-multicall.ts`](../src/services/adapters/gmx-gm-withdraw-multicall.ts)

### 1.3 Pre-flight pipeline (every leg)

```
User intent
    → checkSoilResistance()          (Edge · p50 ~106µs · 0-Gas fail-closed)
    → GMX wire guards                (pool imbalance · oracle lag · depth)
    → ExchangeRouter multicall       (Wallet B broadcast)
    → emit [WALLET_B_GMX_STATE]      (cron / hedge telemetry)
```

GMX keeper settlement remains protocol-native two-stage semantics; **user-side I/O channel SSOT is closed** once deposit + withdraw multicalls are confirmed on-chain.

---

## Section 2 — Wallet A: Hedge Engine (HL Primary · GMX Fallback)

### 2.1 Primary path — Hyperliquid L1 perp short

| Field | SSOT |
|-------|------|
| **Wallet** | `0xef0752df6387248B897F3A59A180af42D801960d` (`HL_WALLET_A_DEFAULT`) |
| **Execution** | `executeHlSessionKeyOrder` — EIP-712 session-key IOC short |
| **Sizing** | `computeDeltaNeutralHedgeOrder()` from live GMX Wallet B ETH delta |
| **Cron** | `runScheduledGmxHedgeCron` → `executeGmxCrossWalletHedge` |
| **CLI** | `pnpm tsx scripts/hedge-gmx.ts` (`--live` for broadcast) |

HL execution is **0-Gas on Arbitrum** (L1 orderbook app-chain). Legacy HL stubs are blocked when `IS_MAINNET=true`.

### 2.2 Fallback path — GMX v2 synthetic short (simulate only)

| Field | SSOT |
|-------|------|
| **Builder** | [`gmx-v2-wallet-a-short-builder.ts`](../src/services/adapters/gmx-v2-wallet-a-short-builder.ts) |
| **CLI** | `pnpm execute:gmx:wallet-a-short-fallback` |
| **Collateral** | USDC on Arbitrum · Wallet A balance probe |
| **Live status** | **Simulate only** — Wallet A USDC = 0 on mainnet · **no live fill claims permitted** |
| **Telemetry** | `[GMX_SHORT_HEDGE]` prefix in builder + CLI |

`auditGmxWalletAShortWire` **fail-closed** rejects Wallet B as the signing wallet. Fallback does **not** replace the HL session-key pipeline; it is a contingency wire-audit path when HL is unavailable.

### 2.3 Cross-venue match invariant

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0
$$

[`dual-wallet-structured-log.ts`](../src/services/gmx-cross-wallet-hedge-lib/dual-wallet-structured-log.ts) emits:

```text
[WALLET_B_GMX_STATE] walletB: 0xc9Bd...546f | ethDeltaSize: X.XXXX ETH | gmLiquidityUsd: $X.XX
[WALLET_A_HL_STATE] walletA: 0xef07...960d | existingShortEth: X.XXXX ETH
[CROSS_VENUE_MATCH] uncoveredDeltaEth: X.XXXX ETH | requiredHedgeAction: SHORT|COVER|SKIP
```

---

## Section 3 — Dual-Wallet Cold Start & Capital Model

### 3.1 Seed pre-funding / margin cushion (Wallet A)

**Design principle:** Hyperliquid margin must be **pre-funded** before Wallet B deploys incremental GM long delta. The system does **not** rely on synchronous in-flight cross-chain bridges at hedge time — bridge latency would open an unhedged window and risk liquidation.

| Layer | Mechanism | SSOT |
|-------|-----------|------|
| **HL margin cushion** | Pre-seed Wallet A with USDC margin on Hyperliquid L1 | Grant narrative: **$100 HL margin** backs ~$1,200 notional short (see `SUBMISSION.md` capital flow) |
| **5% cross-MMR buffer** | `DEFAULT_CROSS_MMR = 0.05` — liquidation distance floor | [`margin-buffer.test.ts`](../tests/risk-control/margin-buffer.test.ts) |
| **5–10% NAV buffer** | `evaluateBufferHealth()` — pre-hedged liquidity target | [`buffer-engine.ts`](../src/core/buffer-engine.ts) · `DEFAULT_BUFFER_MIN_PCT = 0.05` · `DEFAULT_BUFFER_MAX_PCT = 0.10` |

**Cold-start sequence:**

```
1. Seed Wallet A HL margin (manual / treasury ops)
2. Verify [WALLET_A_HL_STATE] shows free buffer > 5% cross-MMR
3. Wallet B GM deposit (3-leg multicall)
4. Cron reads GMX delta → HL short until [CROSS_VENUE_MATCH] action = SKIP
```

### 3.2 In-flight JIT bridge / pending settlement buffer

When Wallet A margin is **unsettled or zero**, the hedge engine **fail-closed**:

| Condition | System behavior |
|-----------|-----------------|
| Wallet A USDC = 0 (GMX fallback) | `execute:gmx:wallet-a-short-fallback` → **simulate only** · no broadcast |
| HL session PK missing | `runScheduledGmxHedgeCron` → `CRON_SKIP: CIRCUIT_TRIP` · no hedge broadcast |
| Soil trip on hedge probe | Flash unwind plan + `CRON_FLASH_UNWIND` · signing channel severed |
| Bridge capital in-flight | `lostUsd ≡ 0` on `IN_FLIGHT_BRIDGE_CAPITAL` until `SETTLED` (Pillar 2 escort SSOT) |

**Rationale:** JIT bridges introduce **seconds-to-minutes** settlement latency. Citadel sizes hedges from **settled** HL margin and live GMX delta — never from optimistic in-flight bridge receipts.

### 3.3 Cron drift rebalance (`CRON_DRIFT_MIN_USD = 10`)

[`scheduled-gmx-hedge-drift.ts`](../src/scheduled-gmx-hedge-lib/scheduled-gmx-hedge-drift.ts):

| Constant | Value | Role |
|----------|-------|------|
| `CRON_DRIFT_MIN_USD` | **$10** | Minimum USD drift before hedge or unwind action |
| `CRON_SKIP_BALANCED` | log tag | Drift ≤ $10 on both sides → no action |
| `CRON_UNWIND_OVERHEDGE` | log tag | HL short > GMX long delta → reduce-only cover |
| `CRON_FLASH_UNWIND` | log tag | Soil trip → escalation ladder flash unwind |
| `CRON_SKIP_CIRCUIT` | log tag | Fatal probe error → fail-closed skip |

**Rebalance decision tree:**

```text
fetch GMX Wallet B ETH delta (USD)
fetch HL Wallet A ETH short (USD)
    │
    ├─ soil.tripped? ──YES──► CRON_FLASH_UNWIND + severSigningChannel()
    │
    ├─ overhedgeUsd > $10? ──YES──► executeGmxCrossWalletUnwind (reduce-only HL cover)
    │
    ├─ driftUsd > $10? ──YES──► executeGmxCrossWalletHedge (HL IOC short)
    │
    └─ else ──► CRON_SKIP_BALANCED (within ±$10 deadband)
```

Micro-deposits below the **$10 aggregate drift threshold** are **batched implicitly** by the cron deadband — multiple small Wallet B GM deposits do not trigger a hedge tick until cumulative uncovered delta exceeds `CRON_DRIFT_MIN_USD`.

### 3.4 Unwind & emergency freeze

| Trigger | Wallet A (HL) | Wallet B (GM) | Global |
|---------|---------------|---------------|--------|
| **Soil trip** (`checkSoilResistance`) | No new shorts · flash unwind dispatch | `emitGmxDecreaseSignal()` unsigned delever signal | `severSigningChannel()` · `CRON_FLASH_UNWIND` |
| **R20 / FLAGS trip** | Session-key pipeline severed | GM I/O blocked at Edge pre-flight | `applyAutoSeveranceOnFlags()` |
| **Over-hedge** | Reduce-only HL cover via `executeGmxCrossWalletUnwind` | No new deposit until balanced | `[CROSS_VENUE_MATCH] action=COVER` |
| **Wallet A margin exhausted** | `needsSoilRebalance=true` in liquidation meter | **Freeze further unhedged GM deposits** at policy layer (operator must re-seed HL buffer before scaling Wallet B) |

**Emergency freeze semantics:** When Wallet A trips (margin buffer below 5% cross-MMR or soil severance), Citadel enters **read-only observer mode** — `tradeAllowed: false` until soil, sequencer, and `rootProtection` gates clear. Wallet B cannot safely add GM long delta without a matched HL short; the Edge firewall blocks toxic broadcast paths **before** mempool ingress (**0-Gas fail-closed**).

### 3.5 On-chain settlement plane (Phase A+B+C)

| Contract | Address | Role |
|----------|---------|------|
| **SliverVineAgentPolicyGuardV2** (current) | `0xfd98cadb7018f692ec58cd4359e0c0399f4f8781` | GMX wire invariants · `stylusCoprocessor=0` → pure Solidity fallback |
| **GmxSoilMatrixSwitch** | `0x4129aee97e68aa3712c56fe9ec48bf369782f99b` | Single-SLOAD defense bitmap |
| **SliverVineRiskOracleV2** | `0xfadb14759a3d3c7e976697de61bf62627f14ec93` | `defenseState` bitmap · 300s SLO window |
| **PolicyGuard v1** (superseded) | `0xc66f96611a737c4e58706d0955594456eab88959` | Historical reference only |

---

## Verification Commands

```bash
pnpm exec vitest run tests/core/wallet-isolation-guard.test.ts
pnpm exec vitest run tests/services/dual-wallet-telemetry.test.ts
pnpm exec vitest run tests/services/scheduled-gmx-hedge.test.ts
pnpm execute:gmx:gm-deposit      # Wallet B deposit (live arm: CONFIRM_GMX_GM_DEPOSIT=YES)
pnpm execute:gmx:gm-withdraw     # Wallet B withdraw
pnpm execute:gmx:wallet-a-short-fallback   # Wallet A GMX fallback (simulate)
pnpm tsx scripts/hedge-gmx.ts    # Cross-wallet hedge dry-run
pnpm demo:e2e                    # 4-step Happy Path macro lifecycle
```

---

## Related Documents

| Document | Role |
|----------|------|
| [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md) | CLI Tier 0–5 verification hub |
| [`ARB_Buildathon/SUBMISSION.md`](./ARB_Buildathon/SUBMISSION.md) | Grant submission SSOT |
| [`architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./architecture/01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md) | Topology · Δ-neutral loop |

---

*SilverVine Labs · Production Workflow SSOT · HEAD `abd8518` · 216 test files | 964 PASS Clean (100% PASS)*
