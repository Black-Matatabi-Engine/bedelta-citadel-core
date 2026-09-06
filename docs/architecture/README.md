# Architecture Specification Index

> **Vitest SSOT:** **194 test files | 845 PASS Clean (100% PASS)** · **Wasm:** `p50 ~106 µs` · `<28kb` budget · **Defense Matrix:** `17 Active | 2 Refactored | 1 Deprecated`

| # | Document | Scope |
|---|----------|-------|
| **01** | [`01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md`](./01_SYSTEM_TOPOLOGY_AND_YELLOW_PAPER.md) | BeΔ philosophy · execution boundaries · GMX/HL triangle loop · settlement & fee tokenomics |
| **02** | [`02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](./02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) | Pillar 1 Gatehouse AA · Pillar 2 Compliance Ingress · Pillar 3 routing · ZeroDev · agent adapters |
| **03** | [`03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./03_DEFENSE_MATRIX_AND_WASM_CORE.md) | R01–R20 Defense Matrix · `soil_core` Wasm · microsecond moats · risk equations |
| **04** | [`04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md) | ERC-8196 (Final) · ERC-4337 · EIP-712 · Stylus coprocessor · ArbOS alignment |
| **05** | [`05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | **88% / 12%** risk spectrum · Basel mapping · fail-closed boundaries · disclaimers |

**Legacy path:** [`README.md`](./README.md) was modularized into **01–05** above (no content removed).

**Hub:** [`docs/README.md`](../README.md) · **Verification:** [`VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)

## Related Documents

| Document | Purpose |
|----------|---------|
| [`docs/README.md`](../README.md) | Audience router · English SSOT hub |
| [`../../JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md) | 1-page executive brief for Buildathon evaluators |
| [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) | CLI Tier 0–5 verification hub |
| [`../ARB_Buildathon/SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) | Buildathon submission SSOT |
| [`05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | 88%/12% risk spectrum · fail-closed boundaries |
| [`../sdk/CITADEL_SDK_BLUEPRINT.md`](../sdk/CITADEL_SDK_BLUEPRINT.md) | Apache-2.0 SDK API |
| [`../audit/`](../audit/) | Principal audit · Pillar 1–3 specifications |
| [`../grants/`](../grants/) | Public grant submissions (GMX · Arbitrum) |
| [`../../docker/README.md`](../../docker/README.md) | Sidecar |
| `src/services/risk/liquidation-meter.ts` | `DEFAULT_CROSS_MMR = 0.05` |
| `src/services/session-key-adapter-lib/nonce-auto-healing.ts` | HL nonce auto-resync |
| `src/services/execution/twap-engine-v2.ts` | TWAP path planner |
