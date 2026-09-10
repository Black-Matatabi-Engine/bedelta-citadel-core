# Architecture Specification Index

> **Vitest SSOT:** **217 test files | 967 PASS clean** · **Wasm:** `p50 ~106 µs` · `<28 KiB` budget · **Worker bundle:** **143.77 KiB raw | 50.94 KiB gzip** (`limitKiB: 150` · `pass: true`) · **Defense Matrix:** `17 Active | 2 Refactored | 1 Deprecated`

**Hybrid Pillar Architecture**

| Pillar Set | Name | Scope |
|------------|------|--------|
| **X** | *Liquidity & Ingress Infrastructure* | GMX v2 GM / Hyperliquid cross-wallet liquidity · Robinhood unidirectional escort · bridge ingress · ZeroDev AA ingress hooks |
| **Y** | *Pre-Consensus Firewall & Reflex Defense* | Wasm `rootProtection()` · Edge `checkSoilResistance()` · 0-Gas fail-closed reflex · R01–R20 Defense Matrix |

| # | Document | Scope |
|---|----------|-------|
| **00** | [`00_TECHNICAL_SPECIFICATION_REDIRECT.md`](./00_TECHNICAL_SPECIFICATION_REDIRECT.md) | Legacy modularization redirect stub (former monolithic spec) |
| **01** | [`01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md) | BeΔ philosophy · **7+1 Cross-Chain Execution Matrix** · GMX/HL triangle loop · settlement & fee tokenomics |
| **02** | [`02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) | **Pillar Set X** ingress & liquidity · **Pillar Set Y** reflex hooks · ZeroDev · agent adapters |
| **03** | [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md) | **Pillar Set Y** — R01–R20 Defense Matrix · `soil_core` Wasm · microsecond moats |
| **04** | [`04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md) | ERC-8196 (Final) · ERC-4337 · EIP-712 · Stylus coprocessor · ArbOS alignment |
| **05** | [`05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | **88% / 12%** risk spectrum · Basel mapping · fail-closed boundaries · disclaimers |

**Legacy path:** [`01_TECHNICAL_SPECIFICATION.md`](./01_TECHNICAL_SPECIFICATION.md) → [`00_TECHNICAL_SPECIFICATION_REDIRECT.md`](./00_TECHNICAL_SPECIFICATION_REDIRECT.md)

## Core Sinking SSOT (`src/core/`)

Five pure invariant modules are the TypeScript SSOT; `src/adapters/` and `src/services/` retain legacy import paths via thin-shell re-exports.

| Module | Responsibility |
|--------|----------------|
| [`monotonic-time.ts`](../../src/core/monotonic-time.ts) | Monotonic clock SSOT · Wasm `clock_core` FFI · leap-second fail-closed |
| [`risk-engine-usdai.ts`](../../src/core/risk-engine-usdai.ts) | USD.ai clock · oracle · depth · `PROTO_USDAI` lane |
| [`soil-resistance-core.ts`](../../src/core/soil-resistance-core.ts) | `packSoilLane()` · slippage math · HKT time gates · jitter · `evaluateHlOrderbookGapGuardPure()` |
| [`session-key-guard-core.ts`](../../src/core/session-key-guard-core.ts) | `verifySessionKeyValidity()` · `resolveOrderNotionalUsd()` |
| [`delta-neutral-calculator.ts`](../../src/core/delta-neutral-calculator.ts) | `computeDeltaNeutralHedgeOrder()` · 0-Δ sizing |
| [`funding-regime-core.ts`](../../src/core/funding-regime-core.ts) | `evaluateFundingRegime()` · `resolveFundingLeverage()` |

**Solidity ingress (custom errors):** [`SliverVineRiskOracle.sol`](../../contracts/SliverVineRiskOracle.sol) · [`IngressSafetySwitch.sol`](../../contracts/IngressSafetySwitch.sol) — `revert CustomError()` for gas-efficient fail-closed; `ERR_SLO_TIMEOUT` / `ERR_INVALID_SIGNER` bytes32 **events** unchanged for Dune/telemetry.

**Hub:** [`docs/README.md`](../README.md) · **Verification:** [`VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)

## Related Documents

| Document | Purpose |
|----------|---------|
| [`docs/README.md`](../README.md) | Audience router · English SSOT hub |
| [`../../JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md) | 1-page executive brief for Buildathon evaluators |
| [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) | CLI Tier 0–5 verification hub |
| [`../ARB_Buildathon/SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) | Buildathon submission SSOT |
| [`05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | 88%/12% risk spectrum · fail-closed boundaries |
| [`../sdk/01_SDK_INTEGRATION_BLUEPRINT.md`](../sdk/01_SDK_INTEGRATION_BLUEPRINT.md) | Robinhood Agentic & Retail Wallet Guard SDK |
| [`../audit/`](../audit/) | Principal audit · Pillar Set X & Y specifications |
| [`../grants/`](../grants/) | Public grant submissions (GMX · Arbitrum) |
| [`../../docker/README.md`](../../docker/README.md) | Sidecar |
| `src/services/risk/liquidation-meter.ts` | `DEFAULT_CROSS_MMR = 0.05` |
| `src/services/session-key-adapter-lib/nonce-auto-healing.ts` | HL nonce auto-resync |
| `src/services/execution/twap-engine-v2.ts` | TWAP path planner |
