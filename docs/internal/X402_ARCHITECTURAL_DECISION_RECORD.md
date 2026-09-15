# x402 Architectural Decision Record (ADR)

> **Classification:** Internal · OpSec compliance  
> **Status:** Accepted · Phase-4 Codebase Freeze boundary  
> **SSOT:** [SYSTEM_METRICS_SSOT.json](../audit/SYSTEM_METRICS_SSOT.json) · **Freeze:** [CODEBASE_FREEZE.json](../audit/CODEBASE_FREEZE.json) **Phase 4 active** (`frozenAt: 2026-09-14`)  
> **Decision:** **Do not implement an x402 payment rail within the Phase-4 freeze window.** Document orthogonality; preserve the verified closed loop.

**Physical anchors (locked):** DUAL Gate [0xb174…8BF1](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) · ExoMesh (Module A) + Sanctuary (Module B) · `pkg/soil_core.wasm` · `@slivervine/exomesh-agentic-wallet-guard`.

---

## 1. Context — Layer separation and freeze boundary

**Question:** Must SliverVine implement x402 (HTTP 402 Agent Payment Standard) code during Phase-4 freeze?

**Assessment:** No. x402 and SliverVine ExoMesh occupy **different layers of the agent execution stack**. They are **orthogonal and complementary**, not competing protocols.

| Layer | Standard / product | Responsibility | Out of scope for ExoMesh |
|-------|--------------------|----------------|--------------------------|
| **Dispatch** | **x402 (HTTP 402)** | Machine payment *intent dispatch* — how an agent requests / pays for a resource over HTTP | Soil fuse, slippage gate, or sequencer firewall |
| **Settlement format** | **ERC-7683** | Cross-chain intent *settlement & solver* envelopes | Pre-sign risk engine |
| **Pre-consensus** | **SliverVine ExoMesh** | **V8/Wasm Isolate** risk engine — `checkSoilResistance()` + EIP-1193+ wrap **before sign / before sequencer** | Payment rail, 402 receipt issuer, or HTTP facilitator |

ExoMesh intercepts high-risk micro-transactions, adverse price impact, and sandwich / poisoned-liquidity paths **before** the agent signs or dispatches calldata. If an agent later pays via x402, the same EIP-1193+ wrap still fail-closes toxic txs at **$0 gas**. Implementing x402 *inside* the freeze would duplicate a payment protocol outside the project's core surface and would **not** improve SEPSB TPR/FPR or reflex SLA.

SSOT tag: `system_architecture.capabilities.x402_compatibility = ORTHOGONAL_PRE_CONSENSUS_SAFEGUARD`. Public positioning is documented in [README.md](../../README.md) and [JUDGE_BRIEF.md](../../JUDGE_BRIEF.md) §2.

**Engineering conclusion:** Necessity of *implementation* during freeze = **none**. Necessity of *accurate architectural positioning* = **high**.

---

## 2. Timeline impact and scope retention

**Freeze context:** Phase-4 locks Wasm, soil runtime, Stylus ABI, PolicyGuard, and Gate deployments. New payment-rail code would constitute **unfrozen surface** without a matching SEPSB corpus.

| Workstream (full x402 rail, if pursued now) | Estimate | Freeze / verification risk |
|-------------------------------------------|----------|----------------------------|
| Facilitator + HTTP 402 client + receipt schema | **5–10 eng-days** | New attack surface; no venue soil mapping |
| Wallet / agent adapter + replay / idempotency | **3–5 eng-days** | Competes with EIP-1193+ 35/35 already shipped |
| End-to-end proof + telemetry / SSOT alignment | **3–5 eng-days** | Unverified KPI vs locked SEPSB dual dashboards |
| **Total** | **~2–3 calendar weeks** | **Misses submission window or ships unverified** |

**Scope risk (HIGH):** Core surface is already closed-loop and measurable:

- SEPSB: **100% TPR · 0% FPR · Observatory mis-block 0** · Wasm reflex p50 **0.233µs** / p99 **2.299µs** · 5-venue cap **<50µs**
- Dual telemetry: Operational Shield [/slivervine-protocol](https://dune.com/silvervinelabs/slivervine-protocol) vs SEPSB Quant [/slivervine-sepsb-stress](https://dune.com/silvervinelabs/slivervine-sepsb-stress)
- Vitest SSOT: **243 files | 1123 PASS** · `pnpm exec tsc --noEmit` **0 errors**
- Primary SDK: `withRetailGuardProvider` **35/35**

Pursuing x402 implementation would trade a **completed, reproducible loop** for a **partial, unbenchmarked feature**.

**Engineering conclusion:** The verified closed loop outscores a last-minute x402 client. Do not allocate freeze budget to a payment rail.

---

## 3. Rationale — Current closed loop is sufficient

**Verified execution path (sign → soil → fail-closed or attest → optional Gate):**

1. **EIP-1193+ Agentic Wallet Guard** — 1-line wrap; infinite approve / Permit2 / domain drift / 4th retry severed **pre-broadcast**.
2. **Wasm soil (`checkSoilResistance`)** — 5-core venues (GMX, Pendle, USD.ai, Hyperliquid, Variational) with physical fuses.
3. **DUAL Gate `0xb174…8BF1`** — consume-once EIP-712 on Arbitrum One + Sepolia; not a custodian, not a 402 facilitator.
4. **Sanctuary (Module B)** — ERC-7540+ async escort + Across/Robinhood ingress AML — complementary, not an x402 substitute.
5. **Dual telemetry** — operational economics vs deterministic SEPSB matrix + `pnpm export:dune:onchain` (`INTERFACE_READY`).

**Documentation over unverified code (Phase 4):** Positioning x402 as an **orthogonal upstream intent standard** in public docs is the correct interface contract: agents may dispatch payments however they choose; **ExoMesh remains the pre-consensus safeguard**. This claim is freeze-compatible, SSOT-tagged, and does not mutate `pkg/soil_core.wasm` or locked Solidity.

**Post-freeze (future work):** If x402 traffic becomes material on Arbitrum, integration is a **thin adapter** — map 402 payment intents into the existing EIP-1193+ request path. No new soil ISA required.

---

## 4. Decision summary

**x402 pays; ExoMesh decides whether the agent is allowed to sign.** The project ships the decision engine, the 5-venue proofs, and the dual dashboards — not a second payment protocol under freeze.

| Decision | Status |
|----------|--------|
| Implement x402 rail in Phase-4 freeze | **Rejected** |
| Document orthogonality in public docs | **Accepted** (README · JUDGE_BRIEF · SSOT) |
| Core loop (SDK + Wasm + Gate + SEPSB + Dune) | **Retained** |
