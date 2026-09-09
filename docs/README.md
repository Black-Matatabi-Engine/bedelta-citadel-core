# SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ): Sub-ms 0-Gas Pre-Broadcast Safety Citadel & Risk Navigator for AI Agents on Arbitrum

**Document:** Documentation Index
**Official Name:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)
**Philosophy:** **BeDelta (BeΔ)** = Market Delta-Neutrality & Execution Safety · **SliverVine** = fragmented intent protection & steel trading execution.
**Entity:** SilverVine Labs · **Protocol:** SliverVine · **Branch:** `v1.0_push_BDLW`
**Live:** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · **Dune:** [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · **Contact:** `grants@silvervinelabs.com`

> **Vitest SSOT:** **217 test files | 967 PASS clean** · `pnpm exec tsc --noEmit` **tsc 0 errors** · Worker bundle **143.77 KiB raw | 50.94 KiB gzip** · `pnpm test` · `pnpm demo` (12 Tri-Pillar scenarios) · `pnpm demo:e2e` (**4-step Happy Path** · `--unwind` · `--trip` optional) · live proof `GET /api/grant-audit`.

> **Language policy:** English SSOT files are self-contained — professional English only, no CJK characters, no cross-language links.

---

## Start Here — Grant Reviewers & Institutional Auditors

**Citadel-Armor Sovereign Vault — Recommended reading path for Grant Evaluators:**

| Step | Document | What you verify |
|------|----------|-----------------|
| **1** | [`PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./PRODUCTION_WORKFLOW_DEEP_DIVE.md) | **Citadel-Armor Sovereign Vault SSOT** — Sovereign Delta Pool · Wallet B GM vault · Wallet A HL hedge · near-zero drawdown thesis |
| **2** | [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md) | **Production Workflow SSOT (Live Mainnet 42161)** · CLI Tier 0–5 · settlement contracts · live Arbiscan proofs |
| **3** | On-Chain Settlement Contracts (in Verification Matrix §3) | PolicyGuardV2 `0xfd98cadb…` · MatrixSwitch `0x4129aee9…` · RiskOracleV2 `0xfadb1475…` · GatePolicyLink `0xe4ef5350…` |
| **4** | `execute:gmx:*` CLI commands (in Verification Matrix) | `pnpm execute:gmx:gm-deposit` · `pnpm execute:gmx:gm-withdraw` · `pnpm demo:e2e:arb-native` |

```bash
# Grant evaluator quick-start (Citadel-Armor Sovereign Vault)
pnpm demo:e2e:arb-native              # Arbitrum Native USDC GM deposit simulate
pnpm execute:gmx:gm-deposit           # Wallet B live deposit (CONFIRM_GMX_GM_DEPOSIT=YES)
pnpm demo:e2e                         # 4-step Happy Path macro lifecycle HUD
pnpm test                             # 217 test files | 967 PASS clean
```

---

## Top 5 Core Grant Documents

| # | Document | Role |
|---|----------|------|
| 1 | [`PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./PRODUCTION_WORKFLOW_DEEP_DIVE.md) | **Citadel-Armor Sovereign Vault SSOT** — near-zero drawdown · maximum Sharpe · dual-wallet workflow |
| 2 | [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md) | **CLI Tier 0–5 Verification Entry** — reproducible PASS bars · mainnet settlement plane |
| 3 | [`architecture/README.md`](./architecture/README.md) | **Architecture index (5 files)** — topology · Three Pillars · R01–R20 · ERC/EIP wiki · risk framework |
| 4 | [`audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](./audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) | **Institutional DDIP** — allocator diligence · Basel III alignment · chaos 255/255 |
| 5 | [`sdk/CITADEL_SDK_BLUEPRINT.md`](./sdk/CITADEL_SDK_BLUEPRINT.md) | **B2B CaaS Integration Blueprint** — `@slivervine/citadel-sdk` · **10 bps builder** + referral rebate model |

---

## Supporting Documents

| Audience | Document | Role |
|----------|----------|------|
| **Risk mitigation & disclaimer framework** | [`architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | Fail-closed boundaries · **88% / 12% risk spectrum** · **80/20 Pareto** · force majeure · AI attack vectors · 60 invariants · V1.0 vs V1.5/V2.0 roadmap |
| **Compliance Ingress Firewall (Pillar 2)** | [`audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md`](./audit/03_PILLAR_2_COMPLIANCE_INGRESS_FIREWALL_AUDIT.md) | Venue-agnostic unidirectional AML escort · Robinhood Chain as inaugural reference adapter · 6/6 tests |
| **Edge Shield Wasm Core (Pillar 3)** | [`audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md`](./audit/04_PILLAR_3_EDGE_SHIELD_WASM_CORESPEC.md) | `checkSoilResistance()` · p50 ~106µs · Tri-Sensor · R01–R20 defense matrix |
| **Security audit snapshot** | [`audit/05_PRINCIPAL_AUDIT_REPORT.md`](./audit/05_PRINCIPAL_AUDIT_REPORT.md) | Principal review · Gate / survival matrix |
| **Grant submissions** | [`ARB_Buildathon/SUBMISSION.md`](./ARB_Buildathon/SUBMISSION.md) | Buildathon main submission pack |
| **HackQuest dual-video scripts** | [`pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md`](./pitch/GRANT_PITCH_AND_VIDEO_STORYBOARD.md) | Pitch 180s (rainstorm) · Demo 120s (live CLI) |
| **Arbitrum grant scope** | [`grants/arbitrum/GRANT_PROPOSAL.md`](./grants/arbitrum/GRANT_PROPOSAL.md) | DAO proposal · milestone scope |
| **GMX Builders** | [`grants/gmx/GMX_BUILDERS_PITCH.md`](./grants/gmx/GMX_BUILDERS_PITCH.md) | GMX v2 integration pitch · **10 bps uiFeeReceiver** |
| **SDK package README** | [`../src/sdk/README.md`](../src/sdk/README.md) | In-repo SDK quick reference |
| **Sidecar / B2B ops** | [`../docker/README.md`](../docker/README.md) | Telemetry sidecar · Docker Tier 5 |

---

## Folder Map

```text
docs/
 README.md ← you are here
 PRODUCTION_WORKFLOW_DEEP_DIVE.md ← Citadel-Armor Sovereign Vault SSOT (start here)
 VERIFICATION_MATRIX.md Tier 0–5 CLI map (evaluators · mainnet settlement)
 architecture/ Yellow Paper · standards wiki · risk mitigation & disclaimer framework
 audit/ DDIP · ZeroDev analysis · Robinhood gate · principal audit
 sdk/ Citadel SDK integration blueprint
 ARB_Buildathon/ Buildathon main submission pack
 grants/ arbitrum/ + gmx/
 pitch/ dual-video storyboards
 telemetry/ Dune SQL spec + Monte Carlo JSON
```

Live proof: `GET /api/grant-audit`.
