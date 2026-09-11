# SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ): Sub-ms 0-Gas Pre-Broadcast Safety Citadel & Risk Navigator for AI Agents on Arbitrum

**Document:** Documentation Index
**Release:** **`v0.95 Santenmoku Core`**
**Official Name:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)
**Philosophy:** **BeDelta (BeΔ)** = Market Delta-Neutrality & Execution Safety · **SliverVine** = fragmented intent protection & steel trading execution.
**Entity:** SilverVine Labs · **Protocol:** SliverVine · **Branch:** `v1.0_push_BDLW`
**Live:** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · **Dune:** [silvervine-citadel-telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) · **Contact:** `grants@silvervinelabs.com`

> **Vitest SSOT:** **225 test files | 1052 PASS clean (100%)** · **Release: v0.95 Santenmoku Core** · **5-Core Venue Matrix:** GMX v2 · Pendle · USD.ai · Hyperliquid · Variational · `pnpm exec tsc --noEmit` **tsc 0 errors** · Worker bundle **143.77 KiB raw | 50.94 KiB gzip** · `pnpm test` · `pnpm demo` · `pnpm demo:e2e` · live proof `GET /api/grant-audit`.

> **Language policy:** English SSOT files are self-contained — professional English only, no CJK characters, no cross-language links.

> **Public SSOT:** Current product documentation = [`architecture/`](./architecture/) + [`sdk/`](./sdk/) + [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md).

---

## Start Here — Grant Reviewers & Institutional Auditors

**Citadel-Armor Sovereign Vault — Recommended reading path for Grant Evaluators:**

| Step | Document | What you verify |
|------|----------|-----------------|
| **1** | [`PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./PRODUCTION_WORKFLOW_DEEP_DIVE.md) | **Citadel-Armor Sovereign Vault SSOT** — Sovereign Delta Pool · Wallet B GM vault · Wallet A HL hedge · near-zero drawdown thesis |
| **2** | [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md) | **Express verification hub** — role routing · 30-second commands · links to decoupled proofs |
| **2a** | [`verifications/`](./verifications/) | **Decoupled SSOT** — on-chain anchors · CLI zones · adapters · live-fire evidence |
| **3** | [`verifications/01_ON_CHAIN_MAINNET_ANCHORS.md`](./verifications/01_ON_CHAIN_MAINNET_ANCHORS.md) | PolicyGuardV2 · MatrixSwitch · RiskOracleV2 · Phase A+B+C |
| **4** | [`verifications/04_LIVE_FIRE_EVIDENCE.md`](./verifications/04_LIVE_FIRE_EVIDENCE.md) | GM I/O Arbiscan proofs · micro-fill fail-closed |

```bash
# Grant evaluator quick-start (Citadel-Armor Sovereign Vault)
pnpm demo:e2e:arb-native              # Arbitrum Native USDC GM deposit simulate
pnpm execute:gmx:gm-deposit           # Wallet B live deposit (CONFIRM_GMX_GM_DEPOSIT=YES)
pnpm demo:e2e                         # 4-step Happy Path macro lifecycle HUD
pnpm test                             # 225 test files | 1052 PASS clean
```

---

## Top 5 Core Grant Documents

| # | Document | Role |
|---|----------|------|
| 1 | [`PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./PRODUCTION_WORKFLOW_DEEP_DIVE.md) | **Citadel-Armor Sovereign Vault SSOT** — near-zero drawdown · maximum Sharpe · dual-wallet workflow |
| 2 | [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md) | **Express verification hub** — CLI Tier 0–5 entry · decoupled proof index |
| 3 | [`architecture/README.md`](./architecture/README.md) | **Architecture index (`00`–`05`)** — topology · Hybrid Pillar Sets X & Y · R01–R20 · ERC/EIP wiki · risk framework |
| 4 | [`architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | **Risk mitigation & disclaimer framework** — allocator diligence · Basel III alignment · chaos 255/255 |
| 5 | [`sdk/README.md`](./sdk/README.md) | **C-End Middleware SDK Docs (01→04)** — `@slivervine/eip1193-agentic-wallet-guard` · EIP-1193 pre-consensus wallet guard · **35/35** retail guard Vitest |

---

## Supporting Documents

| Audience | Document | Role |
|----------|----------|------|
| **Risk mitigation & disclaimer framework** | [`architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](./architecture/05_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | Fail-closed boundaries · **88% / 12% risk spectrum** · **80/20 Pareto** · force majeure · AI attack vectors · 60 invariants · V1.0 vs V1.5/V2.0 roadmap |
| **Compliance Ingress Firewall (Pillar Set X)** | [`architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md`](./architecture/02_THREE_PILLARS_AND_INGRESS_PIPELINE.md) | Venue-agnostic unidirectional AML escort · Robinhood Chain as inaugural reference adapter · 6/6 tests |
| **Edge Shield Wasm Core (Pillar Set Y)** | [`architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md) | `checkSoilResistance()` · p50 ~106µs · Tri-Sensor · R01–R20 defense matrix |
| **Security audit snapshot** | [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md) | Verification hub · Gate / survival matrix |
| **Grant submissions** | [`ARB_Buildathon/SUBMISSION.md`](./ARB_Buildathon/SUBMISSION.md) | Lean Buildathon pack (Shield-first) |
| **Grant appendix** | [`ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md`](./ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md) | Sponsor matrix · GTM · milestones · deep tables |
| **Verification proofs** | [`verifications/`](./verifications/) | On-chain · CLI zones · adapters · live-fire |
| **Market intelligence** | [`sdk/02_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md`](./sdk/02_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md) | Competitive matrix · AI threats · Robinhood Chain fit |
| **Arbitrum grant scope** | [`grants/arbitrum/GRANT_PROPOSAL.md`](./grants/arbitrum/GRANT_PROPOSAL.md) | DAO proposal · milestone scope |
| **GMX Builders** | [`grants/gmx/GMX_BUILDERS_PITCH.md`](./grants/gmx/GMX_BUILDERS_PITCH.md) | GMX v2 integration pitch · **10 bps uiFeeReceiver** |
| **SDK package README** | [`./sdk/README.md`](./sdk/README.md) | In-repo SDK quick reference |
| **Sidecar / B2B ops** | [`../docker/README.md`](../docker/README.md) | Telemetry sidecar · Docker Ops Zone |

---

## Folder Map

```text
docs/
 README.md ← you are here
 PRODUCTION_WORKFLOW_DEEP_DIVE.md ← Citadel-Armor Sovereign Vault SSOT (start here)
 VERIFICATION_MATRIX.md Express hub (evaluators · role routing)
 verifications/ Decoupled on-chain · CLI · adapter · live-fire proofs
 architecture/ Yellow Paper · standards wiki · risk mitigation & disclaimer framework
 audit/ Generated security scorecard JSON artifacts (runtime)
 sdk/ Retail Wallet Guard integration docs (01→05)
 ARB_Buildathon/ Buildathon main submission pack
 grants/ arbitrum/ + gmx/
 telemetry/ Dune SQL spec + Monte Carlo JSON
```

Live proof: `GET /api/grant-audit`.
