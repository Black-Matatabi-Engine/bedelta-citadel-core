# SliverVine Protocol (BeΔ) — SliverVine Citadel Shield: Pre-Consensus Intent Firewall & Execution Safety Primitive for AI Agents on Arbitrum

**Release:** **`v0.95 Santenmoku Core`**

## JUDGE_BRIEF — 30-Second Buildathon Brief

> **SSOT Lock:** **222 test files | 1044 PASS clean (100%)** · **Release: v0.95 Santenmoku Core** · **3-Tier Security Scorecard: 5/0/0 PASS** · Gate `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` · Wasm **<28kb / <60µs** · ABI **v2** · 28-protocol-slot FFI (RESERVED_ABI_V2 holes preserved)  
> **Latency hierarchy:** **~0.5µs–1.1µs** Pure Invariant Math · **p50 ~15µs** Wasm Reflex Core (**<20µs warm path**) · **p50 ~106µs** E2E Edge Shield (Worker + TS Gateway + Wasm FFI)

---

## ⚡ 3-Second TL;DR (Neuromorphic Security)

**Cerebrum vs. Cerebellum — Citadel Shield is the involuntary reflex arc for autonomous AI agents.**

| | **Cerebrum (LLM / Agent Loop)** | **Citadel Reflex Arc (Cerebellum)** |
|---|----------------------------------|-------------------------------------|
| **Latency** | **~1.0s–10.0s** (CoT & tool calls) | **E2E p50 ~106µs** (ALLOW) · **p50 ~15µs reflex core** (FAIL_CLOSED) |
| **Nature** | Non-deterministic · hallucination-prone | **100% deterministic** · **0-Gas FAIL-CLOSED** |
| **On threat** | Out-of-scope calldata (cross-chain drift) | **p50 ~15µs** — severs [EIP-712](https://eips.ethereum.org/EIPS/eip-712) channel · **$0 Gas** |

**One-liner:** LLM emits toxic intent → Citadel severs signing **before** Sequencer queues → `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` · `pnpm demo:hl -- --trip`

### How SilverVine Solves Next-Gen EIPs (Problem → Breakthrough → Proof)

**Industry's first [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) Edge-Wasm 0-Gas Pre-Consensus Reference Implementation** for [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) · [ERC-8226](https://eips.ethereum.org/EIPS/eip-8226) · [EIP-8079](https://eips.ethereum.org/EIPS/eip-8079).

| Standard | **Problem** (architectural gap) | **Breakthrough** (SilverVine Edge-Wasm) | **Proof** |
|----------|--------------------------------|----------------------------------------|-----------|
| **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) / [ERC-8118](https://eips.ethereum.org/EIPS/eip-8118)** | On-chain policy checks burn Gas and cannot catch prompt-injection / calldata drift **before** execution | [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) `withRetailGuardProvider()` intercepts `eth_sendTransaction` · sub-10ms Edge Wasm calldata validation · **0-Gas** on reject | `npx vitest run tests/sdk/` **48/48 PASS** · [`src/sdk/robinhood-agentic-retail-wallet-guard/`](./src/sdk/robinhood-agentic-retail-wallet-guard/) |
| **[ERC-7715](https://eips.ethereum.org/EIPS/eip-7715) / [ERC-8226](https://eips.ethereum.org/EIPS/eip-8226)** | No zero-gas enforcement for multi-agent delegation decay · cumulative spend caps unenforced at RPC layer | `agentic-auto-roll-gate.ts` + `INTENT_RING_U32` ring-buffer tracks attempts in real time · severs signing channel **before** [EIP-712](https://eips.ethereum.org/EIPS/eip-712) release | `npx vitest run tests/services/api/pendle-shield.test.ts` **7/7 PASS** |
| **[EIP-8079](https://eips.ethereum.org/EIPS/eip-8079) / [EIP-8105](https://eips.ethereum.org/EIPS/eip-8105)** | Transactions enter mempools blind — L2 Sequencer MEV exposure with no 0-Gas abort path | Client-side Pre-Consensus Gateway — Wasm simulates preconfirmations locally · aborts unsafe txs **before** network broadcast | [`soil-resistance-core.ts`](./src/core/soil-resistance-core.ts) · `npx vitest run tests/core/protocol-mask-sync.test.ts` **6/6 PASS** |

**Vitest SSOT:** **222 test files | 1044 PASS clean** · `pnpm test -- --run`

---

## 3-Layer Temporal Execution Stack

SilverVine occupies **Layer 3** — the only tier that operates at **microsecond** scale **before** broadcast ingress.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 1 — On-Chain Settlement & Finality                              │
│ Timescale: seconds → minutes (block inclusion · keeper settlement)      │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 2 — Sequencer · Bundler · Mempool Ingress                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 3 — SilverVine Pre-Broadcast Intent Firewall (Citadel Shield)   │
│ Wasm reflex core: p50 ~15µs · E2E Edge Shield: p50 ~106µs              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Submission Snapshot

| Field | Value |
|-------|-------|
| **Release** | **`v0.95 Santenmoku Core`** |
| **Headline** | Pre-Consensus Intent Firewall & Execution Safety Primitive for AI Agents on Arbitrum |
| **Track** | Promising Products — AI Agents & Financial Primitives |
| **Arbitrum One Gate** | `0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1` |
| **Vitest** | **222 test files | 1044 PASS clean** · `pnpm test -- --run` |
| **C-End SDK** | `@slivervine/robinhood-agentic-retail-wallet-guard` · [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) · **35/35** retail guard tests |
| **Deep docs** | [`SUBMISSION.md`](./docs/ARB_Buildathon/SUBMISSION.md) · [`VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) |

---

## 30-Second Identity

SliverVine is a **pre-consensus execution safety primitive** — E2E Edge Shield **`checkSoilResistance()`** (**p50 ~106µs**) + reflex-core **`rootProtection()`** (**p50 ~15µs** on `--trip`) + immutable **[EIP-712](https://eips.ethereum.org/EIPS/eip-712) consume-once `SliverVineGate`** on Arbitrum One.

**Production highlights:** GMX v2 · Pendle Institutional Sentinel · **5-Core Venue Matrix** · **[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) Retail Guard SDK** · Stabilizer Sepolia sandbox · **v1.0 public gateway** (`X-Citadel-Tier: public` · 5 RPS).

### 5-Core Venue Matrix

| Protocol | Venue | Physical Boundary | Demo |
|----------|-------|-------------------|------|
| **GMX v2** | Arbitrum One | OI skew / PoolTVL > **0.35** | `pnpm demo:gmx` |
| **Pendle** | Arbitrum One | Yield shock > **150 bps** | `pnpm demo:pendle` |
| **USD.ai** | Arbitrum One | Peg drift · oracle lag · depth fuse | `pnpm demo:usdai` |
| **Hyperliquid** | L1 HF Orderbook | Spread > **20 bps** | `pnpm demo:hl` |
| **Variational** | Arbitrum RFQ | Stale **>500ms** · drift **>30 bps** | `pnpm demo:variational` |

**Judge fast-track (FAIL-CLOSED):** `pnpm demo:gmx -- --trip` · `pnpm demo:variational -- --trip` · `pnpm demo:hl -- --trip`

**Retail Guard SDK:** `npx vitest run tests/sdk/retail-guard-provider.test.ts`

### EVM Standards Compliance (5-Pillar Active Matrix)

| # | Standard | Judge-facing proof |
|---|----------|-------------------|
| **1** | **[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)** | `npx vitest run tests/sdk/retail-guard-provider.test.ts` — `withRetailGuardProvider()` |
| **2** | **[EIP-6963](https://eips.ethereum.org/EIPS/eip-6963)** | Same suite — `announceGuardedProvider()` announce/request |
| **3** | **[EIP-712](https://eips.ethereum.org/EIPS/eip-712)** | `pnpm demo:gmx -- --trip` — pre-sign severance · Gate `0xb174…` consume-once |
| **4** | **[ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) / [ERC-7579](https://eips.ethereum.org/EIPS/eip-7579)** | PolicyGuardV2 [`0xfd98cadb…8781`](https://arbiscan.io/address/0xfd98cadb7018f692ec58cd4359e0c0399f4f8781) |
| **5** | **[ERC-2612](https://eips.ethereum.org/EIPS/eip-2612) / [Permit2](https://github.com/Uniswap/permit2)** | Retail guard Vitest — Permit2 approve/permit block paths |

Wiki SSOT → [`docs/architecture/04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md`](./docs/architecture/04_STANDARD_COMPLIANCE_AND_EIP_WIKI.md) · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) = factual EIP attribution only (not a venue adapter)

### Core Invariants

$$
\Delta_{\text{net}} = \Delta_{\text{GMX\_GM}} + \Delta_{\text{HL\_Short}} \equiv 0 \qquad lostUsd \equiv 0 \qquad t_{\text{reflector\_p50}} \sim 106\mu s
$$

---

## Judge Quickstart (60s Verification)

```bash
pnpm test -- --run          # 222 test files | 1044 PASS clean
pnpm run audit:security     # 3-Tier Security Scorecard: 5/0/0 PASS

pnpm demo:gmx -- --trip
pnpm demo:variational -- --trip
pnpm demo:hl -- --trip
npx vitest run tests/sdk/retail-guard-provider.test.ts
pnpm demo:e2e
```

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 0 — Retail Guard** | `npx vitest run tests/sdk/retail-guard-provider.test.ts` | [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) C-end middleware |
| **Tier 1 — Judge fast-track** | `pnpm demo:gmx -- --trip` · `demo:variational -- --trip` · `demo:hl -- --trip` | 5-core FAIL_CLOSED proofs |
| **Tier 1 — Protocols** | `pnpm demo:{gmx,hl,pendle,usdai,variational}` | 5-Core Venue Matrix |
| **Tier 2 — Strategy loops** | `pnpm demo:{perp-loop,spot-loop}` | Cross-venue reflex demos |
| **Tier 3 — E2E** | `pnpm demo:{stabilizer,e2e,escort}` | Sepolia sandbox · macro lifecycle |

Full matrix → [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md) · [`docs/DEMO_GUIDE.md`](./docs/DEMO_GUIDE.md)

---

## Why Protocol, Not a Tool?

| Property | Evidence |
|----------|----------|
| **Consume-once invariant** | `SliverVineGate.sol` — [EIP-712](https://eips.ethereum.org/EIPS/eip-712) replay ⇒ `Replayed()` revert |
| **Non-custodial gate** | No proxy · no ETH custody · live **42161** |
| **Composable primitive** | `@slivervine/robinhood-agentic-retail-wallet-guard` · `withRetailGuardProvider()` · Retail Guard [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) · [`docs/sdk/01_SDK_INTEGRATION_BLUEPRINT.md`](./docs/sdk/01_SDK_INTEGRATION_BLUEPRINT.md) |

---

**SilverVine Labs** · `grants@silvervinelabs.com` · [Live Dune Dashboard](https://dune.com/silvervinelabs/silvervine-citadel-telemetry)
