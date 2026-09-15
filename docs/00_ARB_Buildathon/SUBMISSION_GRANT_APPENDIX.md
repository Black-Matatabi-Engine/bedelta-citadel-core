# Grant & Milestone Appendix — SliverVine Protocol (BeΔ)

> **Primary spec:** [SUBMISSION.md](./SUBMISSION.md) · **Verification hub:** [../06_verifications/01_VERIFICATION_MATRIX.md](../06_verifications/01_VERIFICATION_MATRIX.md) · **Judge brief:** [../../JUDGE_BRIEF.md](../../JUDGE_BRIEF.md)

**Official positioning:** Sub-ms 0-Gas Pre-Broadcast Safety Layer (**SliverVine ExoMesh**) & Risk Navigator for AI Agents on Arbitrum.

---

## SSOT Metrics (Buildathon Baseline)

| Metric | Value | Verify |
|--------|-------|--------|
| **Vitest** | **244 test files \| 1125 PASS clean (100%)** | `pnpm test -- --run` |
| **TypeScript** | **0 errors** | `pnpm exec tsc --noEmit` |
| **Worker bundle** | **58.72 KiB gzip** · 166.51 KiB raw | `pnpm bundle:measure` |
| **Wasm reflex** | **p50 ~106µs** Edge · **p50 ~15µs** severance | `pnpm demo:gmx -- --trip` |
| **SEPSB** | TPR **100%** · FPR **0%** · 5-venue corpus | `pnpm audit:sepsb` |
| **Security matrix** | **3-Tier: 5/0/0 PASS** | `pnpm run audit:security` |

**Core invariants:** \(\Delta_{\text{net}} \equiv 0\) · **`lostUsd ≡ 0`** on in-flight bridge capital · \(t_{\text{reflex}} \ll t_{\text{mempool}}\).

Full derivations → [Defense Matrix §3.1](../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md#31-microsecond-moats-summary) · [Risk Framework §0.1](../01_architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-exomesh-does-and-does-not-guarantee).

---

## Module Partition (~70% / ~30%)

| Module | Surface | Role |
|--------|---------|------|
| **[Module A: SliverVine ExoMesh](#module-a-slivervine-exomesh-primary--70-surface)** | **~70%** | Pre-consensus 0-Gas intent firewall · SSRC Wasm reflex · EIP-1193+ SDK |
| **[Module B: SliverVine Sanctuary](#module-b-slivervine-sanctuary-complement--30-surface)** | **~30%** | Sovereign Delta Pool · ERC-7540+ async escort · Pillar Set X ingress |

---

## Module A: SliverVine ExoMesh (Primary · ~70% Surface)

**Deterministic fail-closed pre-consensus ingress severance** — not an RPC relay.

| Layer | Mechanism | Latency / Gas |
|-------|-----------|---------------|
| **SSRC Wasm reflex** | `checkSoilResistance()` · `pkg/soil_core.wasm` | **p50 ~106µs** Edge · **0 gas** on reject |
| **Physical deadlock** | `rootProtection()` · `severSigningChannel()` | **p50 ~15µs** · **0 gas** |
| **EIP-1193+ SDK (C-end)** | `withRetailGuardProvider()` | [retail-guard-provider.test.ts](../../tests/sdk/retail-guard-provider.test.ts) **35/35** |
| **B2B decorator** | `withExoMeshShield()` · `verifyAgentIntent()` | [decorator.ts](../../src/sdk/decorator.ts) · `pnpm demo:agent` |
| **Zero-allocation hot-path** | O(1) ring-slab mandate heap · **<16 KiB** / 10k iter | [Ring slab SSOT](../01_architecture/02_DEFENSE_MATRIX_AND_SSRC_CORE.md#zero-allocation-hot-path-engine-pre-allocated-ring-slab) |

**Architecture principle:** Upstream pre-consensus severance — signing-channel severance (`severSigningChannel()`) is enforced **upstream** of L2 Sequencer ingress, AA Bundler, and UserOp relayer via EIP-1193 RPC middleware.

**5-Core Venue Matrix (Module A guards):**

| Venue | Demo | Module |
|-------|------|--------|
| GMX v2 | `pnpm demo:gmx -- --trip` | ExoMesh soil fuse · GMX native backup |
| Hyperliquid | `pnpm demo:hl -- --trip` | Session-key perp hedge · L1 primary |
| Pendle | `pnpm demo:pendle` | Institutional safety sentinel · AI guarded pool factory |
| USD.ai | `pnpm demo:usdai -- --trip` | Collateral guard |
| Variational | `pnpm demo:variational -- --trip` | RFQ instrument-lane guard |

SDK SSOT → [../04_sdk_and_integration/README.md](../04_sdk_and_integration/README.md) · [01_SDK_INTEGRATION_BLUEPRINT.md](../04_sdk_and_integration/01_SDK_INTEGRATION_BLUEPRINT.md).

**88% pre-broadcast mesh / 12% disclosed systemic residual** — formal scope → [Risk Framework §0.1](../01_architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md#01-what-slivervine-exomesh-does-and-does-not-guarantee). Competitive detail → [SUBMISSION.md](./SUBMISSION.md) · [../04_sdk_and_integration/04_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md](../04_sdk_and_integration/04_MARKET_INTELLIGENCE_AND_COMPETITOR_AUDIT.md).

---

## Module B: SliverVine Sanctuary (Complement · ~30% Surface)

**Sovereign Delta Pool** — treasury escort, async vault semantics, and Robinhood ingress firewall.

| Component | Mechanism | Invariant |
|-----------|-----------|-----------|
| **ERC-7540+ Async Escort** | Sanctuary async vault escort path | `pnpm demo:sanctuary` |
| **Pillar Set X Ingress** | Outbound-only RWA escort **`46630`/`4663` → `42161`** | **`lostUsd ≡ 0`** |
| **AML reverse path** | Inbound `42161` → Robinhood | **`AML_INBOUND_TO_ROBINHOOD_BLOCKED`** |
| **R20 deadlock** | `severSigningChannel()` on trip | Read-only observer mode |

**Live Smart Route proof:** ZeroDev Kernel v3 UserOp [0x4c4ca1...964a](https://arbiscan.io/tx/0x4c4ca1362d4a50d4684662e633e728401478c29dbef13f49e109e68253b5964a) · harness `pnpm tsx scripts/execute-smart-route-live-demo.ts`.

**Bridge regression:** [across-ingress-bridge.test.ts](../../tests/adapters/across-ingress-bridge.test.ts) **6/6** · [IngressSafetySwitch.sol](../../contracts/IngressSafetySwitch.sol).

**E2E macro HUD:** `pnpm demo:delta-neutral` — Gatehouse → Robinhood escort → GMX deposit → HL hedge (**4/4** default; `--unwind` optional Step 5).

Escort SSOT → [../02_eip_extensions/02_ERC7540_ASYNC_ESCORT_IMPLEMENTATION.md](../02_eip_extensions/02_ERC7540_ASYNC_ESCORT_IMPLEMENTATION.md) · [../PRODUCTION_WORKFLOW_DEEP_DIVE.md](../PRODUCTION_WORKFLOW_DEEP_DIVE.md).

---

## Venue Integration Matrix

| Venue / Track | Chain | Integration | Status | Verify |
|---------------|-------|-------------|--------|--------|
| **Arbitrum One Gate** | `42161` | Consume-once [EIP-712](https://eips.ethereum.org/EIPS/eip-712) attestation | ✅ Live | [0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **PolicyGuardV2** | `42161` | GMX soil matrix · Stylus optional fallback | ✅ Live | [0xfd98cadb7018f692ec58cd4359e0c0399f4f8781](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) |
| **Arbitrum Sepolia** | `421614` | Gate + RiskOracle + IngressSafetySwitch sandbox | ✅ Delivered | [Sepolia Gate](https://sepolia.arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **Robinhood Chain** | `46630`/`4663` | Pillar Set X outbound escort → `42161` | ✅ Live-verified | `pnpm demo:ingress` |
| **GMX v2** | `42161` | +10 bps `uiFeeReceiver` · pre-broadcast soil fuse | ✅ Live + dry-run | `pnpm demo:gmx -- --trip` |
| **Hyperliquid** | L1 | Session-key perp · Δ-neutral with GMX GM | ✅ Harness | `pnpm demo:hl -- --trip` |
| **Pendle** | `42161` | 60s TTL oracle · 200 bps jitter · pool factory | ✅ V1.0 Live | `pnpm demo:pendle` |
| **USD.ai** | `42161` | Collateral guard | ✅ V1.0 Live | `pnpm demo:usdai -- --trip` |
| **Variational** | `42161` | RFQ instrument-lane zero-alloc guard | ✅ V1.0 Live | `pnpm demo:variational -- --trip` |
| **Dune telemetry** | Sepolia live · One SQL spec | PEV · `RiskTripBlocked` panels | ✅ Dashboard live | [Dune](https://dune.com/silvervinelabs/slivervine-protocol) |

On-chain anchor detail → [../06_verifications/03_ON_CHAIN_MAINNET_ANCHORS.md](../06_verifications/03_ON_CHAIN_MAINNET_ANCHORS.md).

---

## Buildathon Terms Alignment

### Robinhood Chain Alignment

| Requirement | SliverVine implementation |
|-------------|---------------------------|
| **Outbound RWA escort** | `46630` (testnet) · `4663` (mainnet) → Arbitrum One `42161` only |
| **Pending-capital accounting** | **`lostUsd ≡ 0`** until `SETTLED` or `BRIDGE_TIMEOUT_FAIL_CLOSED` |
| **Reverse-path AML** | Inbound Robinhood blocked at Edge · non-custodial escort labels |
| **ArbOS Elara** | Compatible with Robinhood Chain ingress firewall plane |

### Milestone Schedule (Post-Grant)

| ID | Milestone | Window | Deliverable | Status |
|----|-----------|--------|-------------|--------|
| **M0** | Buildathon baseline | Now | Gate live · 1125 PASS · public gateway (`X-SliverVine-Tier: public` · 5 RPS) | ✅ Delivered |
| **M-Sepolia** | Sepolia sandbox | Pre-grant | Gate + RiskOracle + IngressSafetySwitch · `/api/grant-audit` archive | ✅ Delivered |
| **M-RH-Demo** | Robinhood Smart Route | Pre-grant | `4663` → `42161` live UserOp · **`lostUsd ≡ 0`** | ✅ Live-verified |
| **M-Mainnet** | Arbitrum One ignition | Pre-grant | Gate [0xb174...8bf1](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) · [Ignition tx](https://arbiscan.io/tx/0x54c153e9a41f704b5eb0ae554eac593d1110d62bd826ff094e72f2bd60c1b0c6) | ✅ Delivered |
| **M1** | Native upstream PRs | Weeks 2–3 post-grant | Official plugins: `@elizaos/plugin-exomesh` · `@virtuals/plugin-exomesh` | ⏳ Post-grant |
| **M2** | SaaS API metering | Milestone 1 post-grant | Cloudflare KV API keys · 4-tier SaaS ($10 / $99 / $299 / $1,999+) | ⏳ Post-grant |
| **M-Dune** | Telemetry ingest | Ongoing | Sepolia live stream · One SQL spec ready | ✅ [Live dashboard](https://dune.com/silvervinelabs/slivervine-protocol) |

Grant scope detail → [../0A_grants/arbitrum/GRANT_PROPOSAL.md](../0A_grants/arbitrum/GRANT_PROPOSAL.md).

---

## On-Chain Anchors (Mainnet · `42161`)

| Contract | Address | Role |
|----------|---------|------|
| **`SliverVineGate`** | [0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) | Consume-once EIP-712 attestation · non-custodial · no proxy |
| **`PolicyGuardV2`** | [0xfd98cadb7018f692ec58cd4359e0c0399f4f8781](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) | GMX soil matrix · optional Stylus coprocessor fallback |
| **`SliverVineSoilCoprocessor`** | [0xc235...625e](https://arbiscan.io/address/0xc23587d6573dd134f95b02b0202ffbf84686625e) | Stylus Wasm coprocessor (optional) |
| **`GmxSoilMatrixSwitch`** | [0x4129...f99b](https://arbiscan.io/address/0x4129aee97e68aa3712c56fe9ec48bf369782f99b) | Defense matrix bitmap switch |

> **0-Gas off-chain severance:** ExoMesh risk gates halt compromised payloads at the Edge **prior to mempool submission** — toxic paths never consume Sequencer gas; on-chain Gate anchors consume-once attestations only for cleared intents.

---

## Product Horizons

| Horizon | Status | Scope |
|---------|--------|-------|
| **V1.0** | ✅ Live baseline | ExoMesh + Sanctuary · 5-core venue CLI · EIP-1193+ guard · public open gateway |
| **V1.1** | ⏳ M2 post-grant | KV API metering · 4-tier SaaS |
| **V1.5** | ⏳ Roadmap | ERC-8196 fleet · EIP-7702 agent accounts |
| **V2.0** | ⏳ Design spec | Institutional ExoMesh-as-a-Service · Orbit Shield |

**V1.0 pricing:** Public open gateway — no API key required · `X-SliverVine-Tier: public` · `X-SliverVine-RPS-Limit: 5`. Paid tiers launch at **M2**.

---

## 60-Second Verification

```bash
pnpm install
npx vitest run tests/sdk/retail-guard-provider.test.ts   # Module A · EIP-1193+ · 35/35
pnpm demo:gmx -- --trip                                  # Module A · 0-Gas fail-closed
pnpm demo:delta-neutral                                  # Module A+B · 4-step Happy Path
pnpm test -- --run                                       # 244 files · 1125 PASS
pnpm run audit:security                                  # 3-Tier matrix
curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .sepoliaDualLegProof
```

CLI tier map → [../05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md](../05_pitch_and_demos/02_CLI_DEMO_RUNBOOK.md).

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [SUBMISSION.md](./SUBMISSION.md) | Authoritative technical specification |
| [../../JUDGE_BRIEF.md](../../JUDGE_BRIEF.md) | 1-page evaluator brief |
| [../06_verifications/01_VERIFICATION_MATRIX.md](../06_verifications/01_VERIFICATION_MATRIX.md) | CLI Tier 0–5 hub |
| [../01_architecture/README.md](../01_architecture/README.md) | R01–R20 · Hybrid Pillar Sets X & Y |
| [../04_sdk_and_integration/README.md](../04_sdk_and_integration/README.md) | SDK integration index |
| [../03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md](../03_hacker_profiling/03_DUNE_DASHBOARD_SPECIFICATION.md) | DuneSQL panels |
| [../0A_grants/gmx/GMX_BUILDERS_PITCH.md](../0A_grants/gmx/GMX_BUILDERS_PITCH.md) | GMX builder economics |

---

> **Disclaimer:** SliverVine Protocol provides software-based risk analytics and execution-safety tooling only. It does not provide custody, insurance, profit guarantees, or uptime SLAs. Fees are software access and API metering fees only.

*SilverVine Labs · SliverVine ExoMesh + Sanctuary · v1.0 · BeDelta Living Water v1.0 (SSRC) · 244 test files | 1125 PASS*
