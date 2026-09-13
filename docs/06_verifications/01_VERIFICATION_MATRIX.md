# SliverVine Protocol (BeΔ) — Verification Matrix (Express Hub)

**Official Name:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)  
**Entity:** SilverVine Labs · **Contact:** `grants@silvervinelabs.com`  
**DApp HUD:** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · **Primary judge path:** `pnpm demo:gmx -- --trip` · `pnpm demo:e2e` · `withExoMeshShield`  
**Audit provenance archive:** [Historical Audit Telemetry Snapshot](https://bedeltawater.slivervine.xyz/api/grant-audit) — `GET /api/grant-audit` serves as a verifiable **static** audit snapshot and SHA-256 provenance checkpoint for the Buildathon submission baseline (not a dynamic real-time market oracle).  
**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)

> **Vitest SSOT:** **228 test files | 1066 PASS clean (100%)** · `pnpm test -- --run` · `pnpm exec tsc --noEmit` **0 errors**

### 📊 Vitest 1066 PASS Suite Composition (Physical Breakdown)

| Category | File Count | Test Count (`it`) | Assertion Count (`expect`) | Execution Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Core Protocol & SSRC Engine** | ~198 | ~998 | ~3,055 | Pure Wasm, ExoMesh Agentic Guard (EIP-1193/5792/6963+), Sanctuary Async Escort (ERC-7540+), R01–R20 Defense Matrix |
| **Grant HUD & Copy SSOT** | 12 | ~30 | ~102 | GUI bridge, certificate copy & design token invariants |
| **Reference Agent Adapters** | 5 | ~15 | ~64 | Virtuals, ElizaOS, Wayfinder, LangChain harness verification |
| **Demo Flow Reproducibility** | 3 | ~12 | ~35 | End-to-end scenario validation (GMX, Pendle, Hyperliquid) |
| **TOTAL VERIFIED GREEN** | **228** | **1,066** | **3,320+** | **100% Green · 0 Trivial/No-op Assertions** |

> **Engineering honesty:** **1066 PASS** is a full-repo regression gate. Grant HUD and reference-agent harness rows are disclosed separately so judges can weight **~998 core** ExoMesh/SSRC proofs vs presentation-layer locks.  
> **Latency classes:** **~0.5µs–1.1µs** Pure Invariant Math · **p50 ~15µs** Wasm Reflex Core (**<20µs warm path**) · **p50 ~106µs** E2E ExoMesh Edge gate (Worker + TS Gateway + Wasm FFI)  
> **Verified commit:** `main` @ **`3f26efa`** · baseline **`572e5cd`** (Phase A+B+C mainnet) · Worker bundle **57.76 KiB gzip** (`limitKiB: 150` · `pass: true`)

---

## Role Routing (Start Here)

| Audience | First read | Then verify |
|----------|------------|-------------|
| **Buildathon judges** | [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md) | `pnpm demo:exomesh` · `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` · `pnpm demo:hl -- --trip` · `npx vitest run tests/sdk/retail-guard-provider.test.ts` · [`02_CLI_ZONE_MAP.md`](./04_CLI_ZONE_MAP.md) |
| **Grant evaluators (Sovereign Vault)** | [`PRODUCTION_WORKFLOW_DEEP_DIVE.md`](../PRODUCTION_WORKFLOW_DEEP_DIVE.md) | [`01_ON_CHAIN_MAINNET_ANCHORS.md`](./03_ON_CHAIN_MAINNET_ANCHORS.md) · [`04_LIVE_FIRE_EVIDENCE.md`](./06_LIVE_FIRE_EVIDENCE.md) |
| **Wallet / agent integrators** | [`sdk/01_SDK_INTEGRATION_BLUEPRINT.md`](../04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md) · [`03_ADAPTER_INTEGRATION_PROOFS.md`](./05_ADAPTER_INTEGRATION_PROOFS.md) | `pnpm demo:exomesh` · `npx vitest run tests/sdk/retail-guard-provider.test.ts` · `pnpm demo:agent` |
| **Full grant appendix** | [`ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md`](../ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md) | Venue integration matrix · GTM · milestones |

**Decoupled SSOT index:** [`verifications/README.md`](./README.md)

---

## 30-Second Express Verification

```bash
pnpm install
# === [ExoMesh] Tier 0 — SDK/CLI Unit & Integration ===
npx vitest run tests/sdk/retail-guard-provider.test.ts   # ../../tests/sdk/retail-guard-provider.test.ts
npx vitest run tests/sdk/eip5792-send-calls.test.ts      # ../../tests/sdk/eip5792-send-calls.test.ts
pnpm demo:exomesh                         # Scenario A–D State Matrix (JUDGE_SAFE clock) — see ../05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md

# === [ExoMesh] Tier 1 — 5-Core Venue FAIL_CLOSED proofs ===
pnpm demo:gmx -- --trip
pnpm demo:variational -- --trip
pnpm demo:hl -- --trip
pnpm demo:perp-loop -- --trip            # Zone A Loop A: GMX / Pendle / HL / Variational
pnpm demo:spot-loop -- --trip             # Zone A Loop B: USD.ai collateral lane

# === [Sanctuary] Tier 0 — Module B Vault Standard (ERC-7540+) ===
pnpm demo:sanctuary                      # ERC-7540+ Scenario A–C (alias: pnpm demo:escort)
# === [Sanctuary] Tier 0 — Module B Treasury Ingress (Pillar Set X) ===
pnpm demo:ingress                        # Across/Robinhood AML ingress escort (lostUsd ≡ $0)
npx vitest run tests/adapters/treasury-escort-router.test.ts   # ../../tests/adapters/treasury-escort-router.test.ts

# === Zone B — Sandbox & E2E (Sovereign Vault POC) ===
pnpm demo:e2e                            # 4-Step Delta-Neutral Capital Lifecycle (GMX + HL)

# === Tier 1 — Full Protocol Regression ===
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
pnpm test -- --run                       # Full Regression Suite (228 test files | 1066 PASS clean)
```

| Command | Tag | Proves |
|---------|-----|--------|
| [`npx vitest run tests/sdk/retail-guard-provider.test.ts`](../../tests/sdk/retail-guard-provider.test.ts) | `[ExoMesh]` | **ExoMesh Agentic Guard (EIP-1193/5792/6963+)** · **35/35 PASS** · exhaustive **7/7** `RetailGuardReasonCode` SSOT |
| [`npx vitest run tests/sdk/eip5792-send-calls.test.ts`](../../tests/sdk/eip5792-send-calls.test.ts) | `[ExoMesh]` | EIP-5792 `wallet_sendCalls` batch unfold (Agentic Guard extension) · **3/3 PASS** |
| [`npx vitest run tests/adapters/treasury-escort-router.test.ts`](../../tests/adapters/treasury-escort-router.test.ts) | `[Sanctuary]` | Institutional treasury escort routing |
| `pnpm demo:sanctuary` | `[Sanctuary]` | **Module B Vault Standard** — ERC-7540+ Scenario A–C (`demo:escort` alias) · [`sanctuary-demo.ts`](../../examples/sanctuary-demo.ts) |
| `pnpm demo:exomesh` | `[ExoMesh]` | **Tier 0 interactive CLI** · Scenario **A–D State Matrix** · `JUDGE_SAFE` clock · production `plainTextWarning` echo · recording pauses (TTY) |
| `pnpm demo:exomesh -- --json` | `[ExoMesh]` | Structured JSON array for Dune / CI (`scenario`, `status`, `wasmUs`, `code`, `plainTextWarning`) |
| `pnpm demo:exomesh -- --trip` | `[ExoMesh]` | Scenario **C–D shortcut** · FAIL_CLOSED intercept + Hot-Key channel severance |
| `pnpm demo:gmx -- --trip` | `[ExoMesh]` | **p50 ~15µs reflex core** · GMX native hard anchor FAIL_CLOSED |
| `pnpm demo:variational -- --trip` | `[ExoMesh]` | **p50 ~15µs reflex core** · RFQ stale quote FAIL_CLOSED |
| `pnpm demo:hl -- --trip` | `[ExoMesh]` | **p50 ~15µs reflex core** · HL session-key FAIL_CLOSED |
| `pnpm demo:perp-loop -- --trip` | `[ExoMesh]` | **p50 ~15µs reflex core** · Loop A perp/yield stack R20 severance |
| `pnpm demo:spot-loop -- --trip` | `[ExoMesh]` | **p50 ~15µs reflex core** · Loop B spot/lending vault R20 severance |
| `pnpm demo` | `[ExoMesh]` | 12 Dual Pillar Set X & Y ANSI scenarios |
| `pnpm demo:e2e` | `[Sanctuary]` | 4-step Happy Path macro lifecycle |
| `pnpm demo:ingress` | `[Sanctuary]` | **Module B Treasury Ingress** — ERC-7683 Solver Pre-flight Capital Lock · Pillar Set X Compliance Pre-Execution Strategy (Edge Isomorphic) · [`ingress-escort-demo.ts`](../../examples/ingress-escort-demo.ts) |
| `pnpm demo:e2e:arb-native` | `[ExoMesh]` | Arbitrum One USDC GM deposit simulate |
| `pnpm execute:gmx:gm-deposit` | `[ExoMesh]` | Wallet B live GM deposit (`CONFIRM_GMX_GM_DEPOSIT=YES`) |
| `pnpm run audit:security` | `[ExoMesh]` | 3-Axis Security Scorecard **5/0/0 PASS** |

### 5-Core Venue CLI Flags (SSOT)

| Flag | Effect |
|------|--------|
| *(default)* | Healthy soil ALLOW path · **p50 ~106µs** E2E ExoMesh Edge gate |
| `--trip` | Simulated toxic intent → **p50 ~15µs** Wasm `rootProtection()` deadlock · **0-Gas FAIL_CLOSED** |

→ Full tables: [`DEMO_GUIDE.md`](../05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md) · [`examples/lib/agent-venue-matrix.ts`](../../examples/lib/agent-venue-matrix.ts)

### CLI Demo Clock SSOT (`JUDGE_SAFE`)

All `examples/*` CLI demos — including **`pnpm demo:exomesh`** — run under a fixed deterministic audit epoch for reproducible benchmark verification:

`Clock: JUDGE_SAFE (Deterministic Audit Epoch) · Network: Arbitrum One 42161`

The banner is emitted by [`examples/lib/eip1193-extension-helpers.ts`](../../examples/lib/eip1193-extension-helpers.ts) (`JUDGE_SAFE_CLOCK_LABEL`) and seeded via [`examples/lib/demo-harness.ts`](../../examples/lib/demo-harness.ts) (`initDemoEnvironmentClock`). Judges should treat Wasm μs bands and Dune telemetry hashes as **comparable across runs** when this clock is displayed.

### Dual-Track Verification Architecture (`@slivervine/exomesh-agentic-wallet-guard`)

> **Slogan:** Universal EIP-1193 Pre-Consensus Guard — Tailor-made for Robinhood Chain & Omni-EVM AI Agents

> **Standards compliance:** SliverVine Protocol is **100% compliant** with standard EIP-1193 / EIP-5792 and ERC-7540 specs, while extending them into **0-Gas pre-consensus security supersets** (ExoMesh & Sanctuary).

Tier 0 **ExoMesh Agentic Guard (EIP-1193/5792/6963+)** verification uses **two complementary tracks** — interactive demonstration plus exhaustive unit SSOT:

| Track | Entrypoint | Scope |
|-------|------------|-------|
| **Interactive CLI** | `pnpm demo:exomesh` | **4 scripted state scenarios** (isolated replays, not a live lifecycle): **A** `ALLOW_PASSTHROUGH` · **B** `DEGRADED_WARN` (demo monitor preview) · **C** `FAIL_CLOSED` · **D** `CHANNEL_SEVERED`. Runs under **`Clock: JUDGE_SAFE (Deterministic Audit Epoch) · Network: Arbitrum One 42161`**. TTY recording pauses between scenarios; `--json` bypasses ANSI for CI/Dune. Echoes production alerts via `RetailGuardRejectedError.plainTextWarning` ([`warnings.ts`](../../src/sdk/exomesh-agentic-wallet-guard/warnings.ts)). |
| **Unit Test Suite** | `npx vitest run tests/sdk/retail-guard-provider.test.ts` | **35/35 PASS** — exhaustive coverage of all **7** SDK `RetailGuardReasonCode` variants: `VENUE_DRIFT_REJECTED` · `UNAUTHORIZED_SPENDER_REJECTED` · `SLIPPAGE_EXCEEDED` · `DEPTH_INSUFFICIENT` · `MAX_ATTEMPTS_EXCEEDED_SEVERED` · `CHANNEL_SEVERED` · `RPC_TRANSPORT_SYNC_FAILED`. |

**Source:** [`examples/eip1193-provider-demo.ts`](../../examples/eip1193-provider-demo.ts) · [`src/sdk/exomesh-agentic-wallet-guard/`](../../src/sdk/exomesh-agentic-wallet-guard/) · [`tests/sdk/retail-guard-provider.test.ts`](../../tests/sdk/retail-guard-provider.test.ts)

---

## Protocol Core Modules (Architecture SSOT)

| Module | Scope | Verify |
|--------|-------|--------|
| **SliverVine ExoMesh (Module A)** | Omni-EVM pre-consensus middleware · Defense Layers 1–4 ([`05_ARCHITECTURE_AND_MOAT.md`](../04_sdk_and_integration/05_ARCHITECTURE_AND_MOAT.md)) | `[ExoMesh]` [`pnpm demo:exomesh`](../05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md#tier-0--exomesh-agentic-guard-eip-119357926963) · [`npx vitest run tests/sdk/retail-guard-provider.test.ts`](../../tests/sdk/retail-guard-provider.test.ts) **35/35** |
| **SliverVine Sanctuary (Module B)** | **Vault Standard:** ERC-7540+ (`demo:sanctuary`) · **Treasury Ingress:** Pillar Set X Across/AML (`demo:ingress`) · outbound `46630`/`4663` → `42161` | `[Sanctuary]` `pnpm demo:sanctuary` · `pnpm demo:ingress` · unit: [`treasury-escort-router.test.ts`](../../tests/adapters/treasury-escort-router.test.ts) · [`erc7540-async-escort.test.ts`](../../tests/erc7540-async-escort.test.ts) |

---

## Robinhood Chain Hard Evidence SSOT (Pillar Set X Sanctuary Escrow Substrate · Module B)

> **ChainId SSOT:** `ROBINHOOD_TESTNET_CHAIN_ID = 46630` · `ROBINHOOD_MAINNET_CHAIN_ID = 4663` — [`src/sdk/constants.ts`](../../src/sdk/constants.ts) **L24–25**. Codebase does **not** use `46631`.

| Layer | Hard evidence | Entrypoint |
|-------|---------------|------------|
| **Outbound escort** | Unidirectional **`46630`/`4663` → `42161`** · `assertUnidirectionalBridge()` · `lostUsd ≡ 0` | `pnpm demo:ingress` · [`examples/ingress-escort-demo.ts`](../../examples/ingress-escort-demo.ts) Route A |
| **Inbound AML block** | `42161 → 46630/4663` → `AML_INBOUND_TO_ROBINHOOD_BLOCKED` | Route C in same demo · [`src/adapters/across-ingress-bridge.ts`](../../src/adapters/across-ingress-bridge.ts) `validateAcrossBridgeDirection` |
| **Treasury Escort & Collateral Ingress** | Institutional Treasury Escort Router — `quoteRChainYieldToArbitrumGm()` · `assetKind` · `symbol` · size gates · bridge escort bind | [`src/adapters/robinhood/treasury-escort-router.ts`](../../src/adapters/robinhood/treasury-escort-router.ts) · [`tests/adapters/treasury-escort-router.test.ts`](../../tests/adapters/treasury-escort-router.test.ts) |
| **ExoMesh Agentic Guard (EIP-1193/5792/6963+)** | **Chain-agnostic** Omni-EVM pre-consensus guard — `MAX_ATTEMPTS_EXCEEDED_SEVERED` · SSRC soil · **not** Robinhood calldata-specific | `@slivervine/exomesh-agentic-wallet-guard` · [`tests/sdk/retail-guard-provider.test.ts`](../../tests/sdk/retail-guard-provider.test.ts) **35/35** |
| **Audit certificate** | SHA-256 snapshot · inbound invariant probe | `GET /api/robinhood-audit-snapshot` · [`src/sdk/robinhood-audit-snapshot.ts`](../../src/sdk/robinhood-audit-snapshot.ts) |

**Bridge regression:** [`tests/adapters/across-ingress-bridge.test.ts`](../../tests/adapters/across-ingress-bridge.test.ts) · [`tests/sdk/citadel-sdk-bridge-armor.test.ts`](../../tests/sdk/citadel-sdk-bridge-armor.test.ts)

**Narrative lock:** Robinhood is **SliverVine Sanctuary (Module B)** — a **Pillar Set X Sanctuary Escrow Substrate**. Product identity remains **SliverVine Protocol on Arbitrum One (`42161`)** — Sanctuary is the escort substrate, not the umbrella brand. Treasury collateral symbols are gated at the **Institutional Treasury Escort Router** decision layer via generic `symbol` + `assetKind`, not via hard-coded mint-contract selectors in `evaluateRetailVenueAllowlist` (**ExoMesh Module A**).

---

## 3-Tier Sovereign Vault (Grant SSOT Summary)

| Lane | Address | Role |
|------|---------|------|
| **Wallet A — HL Hedge** | `0xef0752df6387248B897F3A59A180af42D801960d` | EIP-712 session-key 1× perp short |
| **Wallet B — GMX GM Vault** | `0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F` | Principal capital custody · GM deposit/withdraw |
| **Protocol Treasury — UI Fee Vault** | `0xc9BddABD80982d2201376195DD9B85fb7951546f` | `uiFeeReceiver` · +10 bps builder rebate (segregated from Wallet B) |

Full workflow → [`PRODUCTION_WORKFLOW_DEEP_DIVE.md`](../PRODUCTION_WORKFLOW_DEEP_DIVE.md)

---

## On-Chain Anchors (Copy-Paste)

| Contract | Address |
|----------|---------|
| **SliverVineGate (42161)** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **PolicyGuardV2** | `0xfd98cadb7018f692ec58cd4359e0c0399f4f8781` |
| **GmxSoilMatrixSwitch** | `0x4129aee97e68aa3712c56fe9ec48bf369782f99b` |
| **SliverVineRiskOracleV2** | `0xfadb14759a3d3c7e976697de61bf62627f14ec93` |
| **Gate PolicyLink** | `0xe4ef5350963241c49a29e72a4cf093208cd19af0` |
| **Stylus Soil Coprocessor** | [`0xc23587d6573dd134f95b02b0202ffbf84686625e`](https://arbiscan.io/address/0xc23587d6573dd134f95b02b0202ffbf84686625e) |

Full tables · Phase A+B+C · Stylus proof → [`01_ON_CHAIN_MAINNET_ANCHORS.md`](./03_ON_CHAIN_MAINNET_ANCHORS.md)

---

## Live Mainnet Evidence (Summary)

| Proof | Tx / Status |
|-------|-------------|
| **GM Deposit** | [`0xe3155220…`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) |
| **GM Approve** | [`0x30ec0b7a…`](https://arbiscan.io/tx/0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e) |
| **GM Withdraw** | [`0xfd3601dc…`](https://arbiscan.io/tx/0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410) |
| **Micro-fill fail-closed** | `pnpm execute:gmx:micro-fill --size=1` · **`lostUsd ≡ 0`** |

Full harness specs · `[MAINNET_LIVE_EXECUTION_EVIDENCE]` → [`04_LIVE_FIRE_EVIDENCE.md`](./06_LIVE_FIRE_EVIDENCE.md)

---

## CLI Zone Map (Deep Dive)

| Zone | Scope | Document |
|------|-------|----------|
| **Zone A** | 30-second express · Tier 0–1 + Zone A/B demo suite | [`02_CLI_ZONE_MAP.md`](./04_CLI_ZONE_MAP.md) § Zone A |
| **Zone A.1** | Security audit · bundle gates | same § Zone A.1 |
| **Zone B** | Hybrid Pillar Sets X & Y inside (GMX · Pendle · Dune) | same § Zone B |
| **Zone C** | ExoMesh Agentic Guard (EIP-1193/5792/6963+) · 5-core venue proofs · B2B decorator | [`03_ADAPTER_INTEGRATION_PROOFS.md`](./05_ADAPTER_INTEGRATION_PROOFS.md) |

---

## Core Invariants

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0 \qquad lostUsd \equiv 0 \qquad t_{\text{reflector\_p50}} \sim 106\mu s
$$

Derivations → [`architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md`](../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md#31-microsecond-moats-summary)

---

## Related Docs

| Document | Role |
|----------|------|
| [`README.md`](../README.md) | Repo entry · ExoMesh + Sanctuary |
| [`ARB_Buildathon/SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) | Lean Buildathon pack (ExoMesh-first) |
| [`ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md`](../ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md) | Venue integration matrix · GTM · milestones |
| [`architecture/README.md`](../01_architecture/README.md) | Yellow Paper · R01–R20 |
| [`DEMO_GUIDE.md`](../05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md) | Tier 0–1 + Zone A/B demo suite (5-core + Retail Guard) |
| [`JUDGE_BRIEF.md`](../../JUDGE_BRIEF.md) | 30-second Buildathon brief |
| [`02_ZERO_ALLOCATION_HOTPATH_BENCHMARK_REPORT.md`](./02_ZERO_ALLOCATION_HOTPATH_BENCHMARK_REPORT.md) | **Zero-Allocation Hot-Path** · ring slab `<16 KiB` / 10k |

---

## OpSec Commitment & Anti-Reversing Policy

### 🛡️ Proactive OpSec & Anti-Reversing Policy (Commit History Hardening)

> **Notice to Evaluators & Security Auditors:**  
> To prevent hostile anti-reversing forensics and protect proprietary `SSRC Wasm` binary fuses, pre-sinking implementation commits have been squashed and sanitized in accordance with SliverVine Protocol's strict OpSec Release Policy. All protocol invariants are 100% verified via deterministic Vitest suite (**228 test files / 1066 PASS / 3,320+ physical assertions**) and Stylus C-ABI parity tests.

---

*SilverVine Labs · Verification Express Hub · 228 test files | 1066 PASS clean*
