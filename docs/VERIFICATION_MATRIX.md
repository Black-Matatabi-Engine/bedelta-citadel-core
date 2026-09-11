# SliverVine Protocol (BeΔ) — Verification Matrix (Express Hub)

**Official Name:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)  
**Entity:** SilverVine Labs · **Contact:** `grants@silvervinelabs.com`  
**Live:** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · `GET /api/grant-audit`  
**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)

> **Vitest SSOT:** **225 test files | 1052 PASS clean** · `pnpm test -- --run` · `pnpm exec tsc --noEmit` **0 errors**  
> **Latency hierarchy:** **~0.5µs–1.1µs** Pure Invariant Math · **p50 ~15µs** Wasm Reflex Core (**<20µs warm path**) · **p50 ~106µs** E2E Edge Shield (Worker + TS Gateway + Wasm FFI)  
> **Verified commit:** `main` @ **`3f26efa`** · baseline **`572e5cd`** (Phase A+B+C mainnet) · Worker bundle **50.94 KiB gzip** (`limitKiB: 150` · `pass: true`)

---

## Role Routing (Start Here)

| Audience | First read | Then verify |
|----------|------------|-------------|
| **Buildathon judges** | [`JUDGE_BRIEF.md`](../JUDGE_BRIEF.md) | `pnpm demo:eip1193` · `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` · `pnpm demo:hl -- --trip` · `npx vitest run tests/sdk/retail-guard-provider.test.ts` · [`02_CLI_ZONE_MAP.md`](./verifications/02_CLI_ZONE_MAP.md) |
| **Grant evaluators (Sovereign Vault)** | [`PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./PRODUCTION_WORKFLOW_DEEP_DIVE.md) | [`01_ON_CHAIN_MAINNET_ANCHORS.md`](./verifications/01_ON_CHAIN_MAINNET_ANCHORS.md) · [`04_LIVE_FIRE_EVIDENCE.md`](./verifications/04_LIVE_FIRE_EVIDENCE.md) |
| **Wallet / agent integrators** | [`sdk/01_SDK_INTEGRATION_BLUEPRINT.md`](./sdk/01_SDK_INTEGRATION_BLUEPRINT.md) · [`03_ADAPTER_INTEGRATION_PROOFS.md`](./verifications/03_ADAPTER_INTEGRATION_PROOFS.md) | `pnpm demo:eip1193` · `npx vitest run tests/sdk/retail-guard-provider.test.ts` · `pnpm demo:agent` |
| **Full grant appendix** | [`ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md`](./ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md) | Sponsor matrix · GTM · milestones |

**Decoupled SSOT index:** [`verifications/README.md`](./verifications/README.md)

---

## 30-Second Express Verification

```bash
pnpm install
# === Tier 0 — EIP-1193 Retail Guard SDK ===
npx vitest run tests/sdk/retail-guard-provider.test.ts
pnpm demo:eip1193                         # Scenario A–D State Matrix (JUDGE_SAFE clock)

# === Tier 1 — 5-Core Venue FAIL_CLOSED proofs ===
pnpm demo:gmx -- --trip
pnpm demo:variational -- --trip
pnpm demo:hl -- --trip
pnpm demo:perp-loop -- --trip            # Loop A: GMX / Pendle / HL / Variational
pnpm demo:spot-loop -- --trip             # Loop B: USD.ai collateral lane

# === Pillar Set X — Liquidity & Ingress Infrastructure (SOVEREIGN VAULT POC) ===
pnpm demo:e2e                            # 4-Step Delta-Neutral Capital Lifecycle (GMX + HL)
pnpm demo:escort                         # Unidirectional Compliance Bridge Escort (lostUsd ≡ $0)

# === Tier 0 & Regression Verification ===
docker build -t slivervine-citadel . && docker run --rm slivervine-citadel
pnpm test -- --run                       # Full Regression Suite (225 test files | 1052 PASS clean)
```

| Command | Proves |
|---------|--------|
| `npx vitest run tests/sdk/retail-guard-provider.test.ts` | EIP-1193 / EIP-6963 Retail Guard · **35/35 PASS** · exhaustive **7/7** `RetailGuardReasonCode` SSOT |
| `pnpm demo:eip1193` | **Tier 0 interactive CLI** · Scenario **A–D State Matrix** · `JUDGE_SAFE` clock · production `plainTextWarning` echo · recording pauses (TTY) |
| `pnpm demo:eip1193 -- --json` | Structured JSON array for Dune / CI (`scenario`, `status`, `wasmUs`, `code`, `plainTextWarning`) |
| `pnpm demo:eip1193 -- --trip` | Scenario **C–D shortcut** · FAIL_CLOSED intercept + Hot-Key channel severance |
| `pnpm demo:gmx -- --trip` | **p50 ~15µs reflex core** · GMX native hard anchor FAIL_CLOSED |
| `pnpm demo:variational -- --trip` | **p50 ~15µs reflex core** · RFQ stale quote FAIL_CLOSED |
| `pnpm demo:hl -- --trip` | **p50 ~15µs reflex core** · HL session-key FAIL_CLOSED |
| `pnpm demo:perp-loop -- --trip` | **p50 ~15µs reflex core** · Loop A perp/yield stack R20 severance |
| `pnpm demo:spot-loop -- --trip` | **p50 ~15µs reflex core** · Loop B spot/lending vault R20 severance |
| `pnpm demo` | 12 Dual Pillar Set X & Y ANSI scenarios |
| `pnpm demo:e2e` | 4-step Happy Path macro lifecycle |
| `pnpm demo:e2e:arb-native` | Arbitrum One USDC GM deposit simulate |
| `pnpm execute:gmx:gm-deposit` | Wallet B live GM deposit (`CONFIRM_GMX_GM_DEPOSIT=YES`) |
| `pnpm run audit:security` | 3-Tier Security Matrix **5/0/0 PASS** |

### 5-Core Venue CLI Flags (SSOT)

| Flag | Effect |
|------|--------|
| *(default)* | Healthy soil ALLOW path · **p50 ~106µs** E2E Edge Shield |
| `--trip` | Simulated toxic intent → **p50 ~15µs** Wasm `rootProtection()` deadlock · **0-Gas FAIL_CLOSED** |

→ Full tables: [`DEMO_GUIDE.md`](./DEMO_GUIDE.md) · [`examples/lib/agent-venue-matrix.ts`](../examples/lib/agent-venue-matrix.ts)

### CLI Demo Clock SSOT (`JUDGE_SAFE`)

All `examples/*` CLI demos — including **`pnpm demo:eip1193`** — run under a fixed deterministic audit epoch for reproducible benchmark verification:

`Clock: JUDGE_SAFE (Deterministic Audit Epoch) · Network: Arbitrum One 42161`

The banner is emitted by `examples/lib/eip1193-breakthrough-helpers.ts` (`JUDGE_SAFE_CLOCK_LABEL`) and seeded via `examples/lib/demo-harness.ts` (`initDemoEnvironmentClock`). Judges should treat Wasm μs bands and Dune telemetry hashes as **comparable across runs** when this clock is displayed.

### Dual-Track Verification Architecture (`@slivervine/eip1193-agentic-wallet-guard`)

> **Slogan:** Universal EIP-1193 Pre-Consensus Guard — Tailor-made for Robinhood Chain & Omni-EVM AI Agents

Tier 0 EIP-1193 / EIP-6963 verification uses **two complementary tracks** — interactive demonstration plus exhaustive unit SSOT:

| Track | Entrypoint | Scope |
|-------|------------|-------|
| **Interactive CLI** | `pnpm demo:eip1193` | **4 scripted state scenarios** (isolated replays, not a live lifecycle): **A** `ALLOW_PASSTHROUGH` · **B** `DEGRADED_WARN` (demo monitor preview) · **C** `FAIL_CLOSED` · **D** `CHANNEL_SEVERED`. Runs under **`Clock: JUDGE_SAFE (Deterministic Audit Epoch) · Network: Arbitrum One 42161`**. TTY recording pauses between scenarios; `--json` bypasses ANSI for CI/Dune. Echoes production alerts via `RetailGuardRejectedError.plainTextWarning` (`warnings.ts`). |
| **Unit Test Suite** | `npx vitest run tests/sdk/retail-guard-provider.test.ts` | **35/35 PASS** — exhaustive coverage of all **7** SDK `RetailGuardReasonCode` variants: `VENUE_DRIFT_REJECTED` · `UNAUTHORIZED_SPENDER_REJECTED` · `SLIPPAGE_EXCEEDED` · `DEPTH_INSUFFICIENT` · `MAX_ATTEMPTS_EXCEEDED_SEVERED` · `CHANNEL_SEVERED` · `RPC_TRANSPORT_SYNC_FAILED`. |

**Source:** [`examples/eip1193-provider-demo.ts`](../examples/eip1193-provider-demo.ts) · [`src/sdk/eip1193-agentic-wallet-guard/`](../src/sdk/eip1193-agentic-wallet-guard/) · [`tests/sdk/retail-guard-provider.test.ts`](../tests/sdk/retail-guard-provider.test.ts)

---

## Robinhood Chain Hard Evidence SSOT (Pillar 2 Reference Escort Adapter)

> **ChainId SSOT:** `ROBINHOOD_TESTNET_CHAIN_ID = 46630` · `ROBINHOOD_MAINNET_CHAIN_ID = 4663` — [`src/sdk/constants.ts`](../src/sdk/constants.ts) **L24–25**. Codebase does **not** use `46631`.

| Layer | Hard evidence | Entrypoint |
|-------|---------------|------------|
| **Outbound escort** | Unidirectional **`46630`/`4663` → `42161`** · `assertUnidirectionalBridge()` · `lostUsd ≡ 0` | `pnpm demo:escort` · [`examples/ingress-escort-demo.ts`](../examples/ingress-escort-demo.ts) Route A |
| **Inbound AML block** | `42161 → 46630/4663` → `AML_INBOUND_TO_ROBINHOOD_BLOCKED` | Route C in same demo · [`src/adapters/across-ingress-bridge.ts`](../src/adapters/across-ingress-bridge.ts) `validateAcrossBridgeDirection` |
| **RWA decision gates** | Adapter layer — `quoteRChainYieldToArbitrumGm()` · `assetKind: "rwa" \| "idle"` · size gates · bridge escort bind | [`src/adapters/robinhood/r-chain-yield-router.ts`](../src/adapters/robinhood/r-chain-yield-router.ts) · `tests/adapters/r-chain-yield-router.test.ts` |
| **EIP-1193 middleware** | **Chain-agnostic** Omni-EVM pre-consensus guard — `MAX_ATTEMPTS_EXCEEDED_SEVERED` · Wasm soil · **not** Robinhood calldata-specific | `@slivervine/eip1193-agentic-wallet-guard` · `tests/sdk/retail-guard-provider.test.ts` **35/35** |
| **Audit certificate** | SHA-256 snapshot · inbound invariant probe | `GET /api/robinhood-audit-snapshot` · [`src/sdk/robinhood-audit-snapshot.ts`](../src/sdk/robinhood-audit-snapshot.ts) |

**Bridge regression:** [`tests/adapters/across-ingress-bridge.test.ts`](../tests/adapters/across-ingress-bridge.test.ts) · [`tests/sdk/citadel-sdk-bridge-armor.test.ts`](../tests/sdk/citadel-sdk-bridge-armor.test.ts)

**Narrative lock:** Robinhood is a **Pillar Set X Reference Escort Adapter** — product identity remains **SliverVine Citadel on Arbitrum One (`42161`)**. RWA stock symbols (e.g. TSLA/NVDA) are gated at the **adapter decision layer** via generic `symbol` + `assetKind`, not via hard-coded mint-contract selectors in `evaluateRetailVenueAllowlist`.

---

## 3-Tier Sovereign Vault (Grant SSOT Summary)

| Lane | Address | Role |
|------|---------|------|
| **Wallet A — HL Hedge** | `0xef0752df6387248B897F3A59A180af42D801960d` | EIP-712 session-key 1× perp short |
| **Wallet B — GMX GM Vault** | `0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F` | Principal capital custody · GM deposit/withdraw |
| **Protocol Treasury — UI Fee Vault** | `0xc9BddABD80982d2201376195DD9B85fb7951546f` | `uiFeeReceiver` · +10 bps builder rebate (segregated from Wallet B) |

Full workflow → [`PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./PRODUCTION_WORKFLOW_DEEP_DIVE.md)

---

## On-Chain Anchors (Copy-Paste)

| Contract | Address |
|----------|---------|
| **SliverVineGate (42161)** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **PolicyGuardV2** | `0xfd98cadb7018f692ec58cd4359e0c0399f4f8781` |
| **GmxSoilMatrixSwitch** | `0x4129aee97e68aa3712c56fe9ec48bf369782f99b` |
| **SliverVineRiskOracleV2** | `0xfadb14759a3d3c7e976697de61bf62627f14ec93` |
| **Gate PolicyLink** | `0xe4ef5350963241c49a29e72a4cf093208cd19af0` |
| **Stylus Soil Coprocessor** | `0xc23587d6573dd134f95b02b0202ffbf84686625e` |

Full tables · Phase A+B+C · Stylus proof → [`01_ON_CHAIN_MAINNET_ANCHORS.md`](./verifications/01_ON_CHAIN_MAINNET_ANCHORS.md)

---

## Live Mainnet Evidence (Summary)

| Proof | Tx / Status |
|-------|-------------|
| **GM Deposit** | [`0xe3155220…`](https://arbiscan.io/tx/0xe3155220e464c375329838bb5ca8498226b8c8fa32c11929b7605070f7be4774) |
| **GM Approve** | [`0x30ec0b7a…`](https://arbiscan.io/tx/0x30ec0b7a9493f0c43edb257fd40f6d6f9258401e206357f3db7574b11071b00e) |
| **GM Withdraw** | [`0xfd3601dc…`](https://arbiscan.io/tx/0xfd3601dce5c2407d371186d8a24829994547ec8810f4a20c3e798d2fb67ae410) |
| **Micro-fill fail-closed** | `pnpm execute:gmx:micro-fill --size=1` · **`lostUsd ≡ 0`** |

Full harness specs · `[MAINNET_LIVE_EXECUTION_EVIDENCE]` → [`04_LIVE_FIRE_EVIDENCE.md`](./verifications/04_LIVE_FIRE_EVIDENCE.md)

---

## CLI Zone Map (Deep Dive)

| Zone | Scope | Document |
|------|-------|----------|
| **Zone A** | 30-second express · Tier 1–3 demo suite | [`02_CLI_ZONE_MAP.md`](./verifications/02_CLI_ZONE_MAP.md) § Zone A |
| **Zone A.1** | Security audit · bundle gates | same § Zone A.1 |
| **Zone B** | Hybrid Pillar Sets X & Y inside (GMX · Pendle · Dune) | same § Zone B |
| **Zone C** | EIP-1193 Retail Guard · 5-core venue proofs · B2B decorator | [`03_ADAPTER_INTEGRATION_PROOFS.md`](./verifications/03_ADAPTER_INTEGRATION_PROOFS.md) |

---

## Core Invariants

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0 \qquad lostUsd \equiv 0 \qquad t_{\text{reflector\_p50}} \sim 106\mu s
$$

Derivations → [`architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md`](./architecture/03_DEFENSE_MATRIX_AND_WASM_CORE.md#31-microsecond-moats-summary)

---

## Related Docs

| Document | Role |
|----------|------|
| [`README.md`](../README.md) | Repo entry · Shield + Sovereign Vault |
| [`ARB_Buildathon/SUBMISSION.md`](./ARB_Buildathon/SUBMISSION.md) | Lean Buildathon pack (Shield-first) |
| [`ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md`](./ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md) | Sponsor matrix · GTM · milestones |
| [`architecture/README.md`](./architecture/README.md) | Yellow Paper · R01–R20 |
| [`DEMO_GUIDE.md`](./DEMO_GUIDE.md) | Tier 0–3 demo suite (5-core + Retail Guard) |
| [`JUDGE_BRIEF.md`](../JUDGE_BRIEF.md) | 30-second Buildathon brief |

---

*SilverVine Labs · Verification Express Hub · 225 test files | 1052 PASS clean*
