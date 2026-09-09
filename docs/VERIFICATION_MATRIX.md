# SliverVine Protocol (BeΔ) — Verification Matrix (Express Hub)

**Official Name:** SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ)  
**Entity:** SilverVine Labs · **Contact:** `grants@silvervinelabs.com`  
**Live:** [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · `GET /api/grant-audit`  
**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)

> **Vitest SSOT:** **217 test files | 967 PASS clean** · `pnpm test -- --run` · `pnpm exec tsc --noEmit` **0 errors**  
> **Verified commit:** `main` @ **`3f26efa`** · baseline **`572e5cd`** (Phase A+B+C mainnet) · Worker bundle **50.94 KiB gzip** (`limitKiB: 150` · `pass: true`)

---

## Role Routing (Start Here)

| Audience | First read | Then verify |
|----------|------------|-------------|
| **Buildathon judges** | [`JUDGE_BRIEF.md`](../JUDGE_BRIEF.md) | `pnpm demo:wayfinder` · `pnpm demo:langchain -- --venue=pendle` · `pnpm demo:wayfinder -- --trip` · [`02_CLI_ZONE_MAP.md`](./verifications/02_CLI_ZONE_MAP.md) |
| **Grant evaluators (Sovereign Vault)** | [`PRODUCTION_WORKFLOW_DEEP_DIVE.md`](./PRODUCTION_WORKFLOW_DEEP_DIVE.md) | [`01_ON_CHAIN_MAINNET_ANCHORS.md`](./verifications/01_ON_CHAIN_MAINNET_ANCHORS.md) · [`04_LIVE_FIRE_EVIDENCE.md`](./verifications/04_LIVE_FIRE_EVIDENCE.md) |
| **Agent / adapter integrators** | [`03_ADAPTER_INTEGRATION_PROOFS.md`](./verifications/03_ADAPTER_INTEGRATION_PROOFS.md) | `pnpm demo:{wayfinder,elizaos,virtuals,langchain}` |
| **Full grant appendix** | [`ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md`](./ARB_Buildathon/SUBMISSION_GRANT_APPENDIX.md) | Sponsor matrix · GTM · milestones |

**Decoupled SSOT index:** [`verifications/README.md`](./verifications/README.md)

---

## 30-Second Express Verification

```bash
pnpm install
pnpm demo:wayfinder                      # Default 7+1 venue rotation · p50 ~106µs — ALLOW
pnpm demo:langchain -- --venue=pendle    # Manual venue lock — Pendle lane
pnpm demo:wayfinder -- --trip            # Fail-closed · <14µs rootProtection()
pnpm demo:matrix -- --trip               # 7+1 Cross-Chain Execution Matrix R20 severance
pnpm test -- --run                       # 217 test files | 967 PASS clean
```

| Command | Proves |
|---------|--------|
| `pnpm demo:wayfinder` | Independent agent guard · **default 7+1 venue rotation** · HUD `VENUE` + `INVARIANT` |
| `pnpm demo:<framework> -- --venue=<protocol>` | Manual protocol lane lock across all 4 frameworks |
| `pnpm demo:<framework> -- --trip` | Toxic intent / invariant breach → **0-Gas FAIL_CLOSED** |
| `pnpm demo` | 12 Dual Pillar Set X & Y ANSI scenarios |
| `pnpm demo:e2e` | 4-step Happy Path macro lifecycle |
| `pnpm demo:e2e:arb-native` | Arbitrum One USDC GM deposit simulate |
| `pnpm execute:gmx:gm-deposit` | Wallet B live GM deposit (`CONFIRM_GMX_GM_DEPOSIT=YES`) |
| `pnpm run audit:security` | 3-Tier Security Matrix **5/0/0 PASS** |

### Agent Framework CLI Flags (SSOT)

All four demos — `pnpm demo:{wayfinder,elizaos,virtuals,langchain}` — share:

| Flag | Effect |
|------|--------|
| *(default)* | Auto-rotates across **7+1 Cross-Chain Execution Matrix (7 Arbitrum Native + 1 Hyperliquid L1)**: GMX v2 · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · USD.ai · Variational Omni RFQ · Hyperliquid L1 |
| `--venue=<protocol>` | Locks venue (`gmx` · `pendle` · `uniswap` · `aave` · `morpho` · `usdai` · `hyperliquid`/`hl` · `variational`/`var`) |
| `--trip` | Simulated toxic intent → **<14.0µs** Wasm `rootProtection()` deadlock |

→ Full tables & framework interception points: [`DEMO_GUIDE.md`](./DEMO_GUIDE.md)

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
| **Zone C** | Agent adapters · 7+1 Cross-Chain Execution Matrix | [`03_ADAPTER_INTEGRATION_PROOFS.md`](./verifications/03_ADAPTER_INTEGRATION_PROOFS.md) |

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
| [`DEMO_GUIDE.md`](./DEMO_GUIDE.md) | Tier 1 AI Agent Shield demos |
| [`JUDGE_BRIEF.md`](../JUDGE_BRIEF.md) | 30-second Buildathon brief |

---

*SilverVine Labs · Verification Express Hub · 217 test files | 967 PASS clean · HEAD `3f26efa`*
