# Adapter Integration Proofs (AI Agents · 7-Protocol Matrix)

> **SSOT index:** [`README.md`](./README.md) · **Hub:** [`../VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)

#### Wayfinder (V1.0 Live · Arbitrum Native AI Agent Engine)

Citadel is the **native pre-execution risk firewall** for the Wayfinder Agent Engine on **Arbitrum One (`42161`)**:

- **Native adapter SSOT:** [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) — `wayfinderCitadelShieldHook` integrates `checkSoilResistance()` (Pillar 3 soil fuse) and `verifyAgentIntent()` (8-dimension validation) before on-chain route dispatch
- **0-Gas fail-closed:** soil trips and session-key violations sever the EIP-712 signing channel pre-broadcast — blocked paths consume no Sequencer gas
- **Tests:** [`tests/adapters/wayfinder-shield.test.ts`](../../tests/adapters/wayfinder-shield.test.ts) — ALLOW · toxic soil FAIL_CLOSED · session-key clip/expiry FAIL_CLOSED

```bash
pnpm demo:wayfinder              # Normal Wayfinder route interception → ALLOW
pnpm demo:wayfinder -- --trip    # 0-Gas Fail-Closed soil trip interception
pnpm demo:wayfinder -- --stabilizer           # Sepolia Stabilizer 1:1 stablecoin swap → ALLOW
pnpm demo:wayfinder -- --stabilizer --trip      # Depleted pool / reserve floor → FAIL_CLOSED
```

**AI Agent execution flow (Wayfinder / Virtuals):**

```text
[ Wayfinder Agent Engine / Virtuals Agent Swarm ]
                    │
                    ▼
        wayfinderCitadelShieldHook  (wayfinder-shield.ts)
                    │
                    ▼
        verifyAgentIntent()  (8-dimension gate)
                    │
                    ▼
        checkSoilResistance()  (Pillar 3 soil fuse · p50 ~106µs)
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     FAIL_CLOSED           ALLOW
     (0-Gas intercept)         │
                               ▼
                    [ On-Chain Execution · Arbitrum 42161 ]
```

#### Stabilizer Protocol (V1.0 Live · Universal Sepolia Testnet Sandbox)

**Stabilizer on Arbitrum Sepolia (`421614`) is the Universal Testnet Sandbox & Cross-Pass Interoperability Layer for AI Agents.** Citadel enforces **0-Gas Pre-Execution Fail-Closed Protection** across testnet arbitrage and rebalancing legs:

| Leg | Role on Sepolia | SSOT |
|-----|-----------------|------|
| **Stabilizer** | 1:1 zero-slippage USDZ / USDC / USDT / USDS routing | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) |
| **GMX v2** | Sepolia shadow-margin · price-impact pre-flight | `gmx-v2-order-payload-guards.ts` · `gmx-v2-agent-flow.demo.test.ts` |
| **Pendle** | Testnet Guarded Pool Factory · 60s TTL oracle fuse | [`pendle-pool-factory-adapter.ts`](../../src/adapters/pendle/pendle-pool-factory-adapter.ts) · `pendle-ai-agent-flow.demo.test.ts` |

**DX advantage:** Demo and audit execution runs on **live Sepolia contracts** without mainnet gas or capital friction — using the **same `checkSoilResistance()` bytecode and risk gates** as Arbitrum One (`42161`).

```bash
pnpm demo:gmx                   # GMX v2 shadow margin · cross-venue slippage → ALLOW
pnpm demo:gmx -- --trip         # Toxic price-impact soil trip → FAIL_CLOSED
pnpm demo:hl                    # Hyperliquid session key auth → ALLOW
pnpm demo:hl -- --trip          # WS stale / depth guard trip → FAIL_CLOSED
pnpm demo:pendle                # Pendle guarded pool factory → ALLOW
pnpm demo:uniswap               # Uniswap V3 concentrated liquidity → ALLOW
pnpm demo:uniswap -- --trip     # Depleted CL / slippage trip → FAIL_CLOSED
pnpm demo:aave               # Aave V3 HF guard → ALLOW
pnpm demo:aave -- --trip     # HF < 1.15 / cross-chain boundary → FAIL_CLOSED
pnpm demo:morpho                 # Morpho Blue vault rebalance → ALLOW
pnpm demo:morpho -- --trip       # Flash-loan sandwich trip → FAIL_CLOSED
pnpm demo:usdai                  # USD.ai yield collateral guard → ALLOW
pnpm demo:usdai -- --trip        # De-peg / oracle lag → FAIL_CLOSED · USD_AI_DEPEG_ORACLE_TRIP
pnpm demo:stabilizer              # Stabilizer 1:1 swap → ALLOW
pnpm demo:stabilizer -- --trip    # USDZ de-peg + SOIL_RESISTANCE_TRIP → FAIL_CLOSED + 60s cooldown
pnpm demo                         # GMX v2 + HL + Pendle Tri-Pillar Vitest matrix (12 scenarios)
```

- **Cross-Pass routing:** Stabilizer stablecoin rebalance → GMX v2 shadow-margin leg → Pendle guarded pool intent → Uniswap V3 spot liquidity — each hop gated by `checkSoilResistance()` before broadcast
- **Tests:** [`tests/adapters/stabilizer-adapter.test.ts`](../../tests/adapters/stabilizer-adapter.test.ts) · [`tests/adapters/uniswap-v3-adapter.test.ts`](../../tests/adapters/uniswap-v3-adapter.test.ts) · **217 test files | 967 PASS clean**

#### Uniswap V3 (V1.0 Live · Arbitrum Native Spot Liquidity)

Citadel is the **pre-execution concentrated-liquidity firewall** for Uniswap V3 spot swaps on **Arbitrum One (`42161`)**:

| Layer | Module | Behavior |
|-------|--------|----------|
| **V3 Liquidity Guard** | [`uniswap-v3-adapter.ts`](../../src/adapters/uniswap/uniswap-v3-adapter.ts) | `verifyUniswapPoolLiquidity()` · `verifyUniswapTickDepth()` — CL tick depth · directional dynamic fee |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on depleted depth / cross-venue slippage |
| **CLI Demo** | `pnpm demo:uniswap` | WETH/USDC spot swap guard · `--trip` for FAIL_CLOSED |

#### Aave V3 (V1.0 Live · Arbitrum Native Lending)

| Layer | Module | Behavior |
|-------|--------|----------|
| **HF Guard** | [`aave-v3-adapter.ts`](../../src/adapters/aave/aave-v3-adapter.ts) | `verifyAaveHealthFactor()` — HF &lt; 1.15 fail-closed · cross-chain liquidation boundary |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on depleted collateral depth |
| **CLI Demo** | `pnpm demo:aave` | WETH/USDC borrow guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/aave-v3-adapter.test.ts`](../../tests/adapters/aave-v3-adapter.test.ts)

#### Morpho Blue (V1.0 Live · Arbitrum Vault Strategies)

| Layer | Module | Behavior |
|-------|--------|----------|
| **Vault Guard** | [`morpho-blue-adapter.ts`](../../src/adapters/morpho/morpho-blue-adapter.ts) | `verifyMorphoOracle()` — oracle freshness · price deviation cap |
| **Soil fuse** | `checkSoilResistance()` | 0-Gas fail-closed on toxic vault depth |
| **CLI Demo** | `pnpm demo:morpho` | jGLP rebalance guard · `--trip` for FAIL_CLOSED |

→ Tests: [`tests/adapters/morpho-blue-adapter.test.ts`](../../tests/adapters/morpho-blue-adapter.test.ts)

#### USD.ai (V1.0 Live · AI-Compute Yield Collateral)

| Layer | Module | Behavior |
|-------|--------|----------|
| **Collateral Guard** | [`usdai-adapter.ts`](../../src/adapters/usdai/usdai-adapter.ts) | `evaluateUsdAiCollateralGuard()` — decoupled GPU oracle · sUSDai peg · NAV vs mark · liquidity depth |
| **Soil fuse** | `collectExternalSoilFlags()` · `usdai` probe | `USD_AI_DEPEG_ORACLE_TRIP` · `FLAG_USDAI_ORACLE_STALE` · `FLAG_USDAI_PEG_DRIFT` |
| **CLI Demo** | `pnpm demo:usdai` | sUSDai yield collateral · `--trip` for de-peg / oracle lag FAIL_CLOSED |

→ Tests: [`tests/adapters/usdai-adapter.test.ts`](../../tests/adapters/usdai-adapter.test.ts) **5/5**

#### Four Major AI Agent Frameworks (V1.0 Live · Full Quad Coverage)

**World's First Pre-Execution Risk Gateway natively supporting ALL Four Major AI Agent Frameworks (Wayfinder, ElizaOS, Virtuals, LangChain).**

| Framework | Adapter SSOT | Entry point | Standalone CLI |
|-----------|--------------|-------------|----------------|
| **Wayfinder** | [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) | `wayfinderCitadelShieldHook` | `pnpm demo:wayfinder` |
| **ElizaOS** | [`elizaos-citadel-plugin.ts`](../../src/adapters/elizaos/elizaos-citadel-plugin.ts) | `evaluateElizaCitadelAction()` | `pnpm demo:elizaos` |
| **Virtuals (GAME)** | [`virtuals-game-adapter.ts`](../../src/adapters/virtuals/virtuals-game-adapter.ts) | `evaluateVirtualsGameTask()` | `pnpm demo:virtuals` |
| **LangChain / LangGraph** | [`langchain-citadel-tool.ts`](../../src/adapters/langchain/langchain-citadel-tool.ts) | `CitadelRiskGuardTool` | `pnpm demo:langchain` |

```bash
pnpm demo:wayfinder · pnpm demo:elizaos · pnpm demo:virtuals · pnpm demo:langchain
pnpm demo:gmx -- --trip           # GMX V2 Arbitrum native hard anchor
pnpm demo:variational -- --trip  # Variational Omni RFQ multi-venue gate
pnpm demo:hl -- --trip            # Hyperliquid L1 primary hedge path
pnpm demo:perp-loop -- --trip     # Loop A perp/yield stack reflex core
pnpm demo:spot-loop -- --trip     # Loop B spot/lending vault reflex core
```

- **Tests:** [`wayfinder-shield.test.ts`](../../tests/adapters/wayfinder-shield.test.ts) · [`elizaos-plugin.test.ts`](../../tests/adapters/elizaos-plugin.test.ts) · [`virtuals-adapter.test.ts`](../../tests/adapters/virtuals-adapter.test.ts) · [`langchain-tool.test.ts`](../../tests/adapters/langchain-tool.test.ts) · **217 test files | 967 PASS clean**

#### Supplementary Agent Demos

- **V1.0 delivered:** All native integrations in [`src/adapters/`](../../src/adapters/) · [`withCitadelShield`](../../src/sdk/decorator.ts) · **3-Tier Demo Suite** — Tier 1 Native Protocols: `pnpm demo:{gmx,hl,pendle,uniswap,aave,morpho,usdai,variational}` · Tier 2 Agents: `pnpm demo:{wayfinder,elizaos,virtuals,langchain}` · Tier 3: `pnpm demo:{stabilizer,e2e}` — CLI reproducible ALLOW / `--trip` FAIL_CLOSED · Worker bundle **50.94 KiB gzip** (`pnpm bundle:measure`)
- **Supplementary harness:** [`examples/agent-interceptor-demo.ts`](../../examples/agent-interceptor-demo.ts) (`tsx examples/agent-interceptor-demo.ts`) · legacy TS/Python scripts in [`examples/adapters/`](../../examples/adapters/)


---

## Zone C — Outside Three Pillars (Ecosystem & Simulation Harnesses)

### 1. Wayfinder Native Adapter (V1.0 Live · Arbitrum AI Agent Engine)

**Command:**

```bash
pnpm demo:wayfinder
# or: npx tsx examples/wayfinder-agent-demo.ts
pnpm demo:wayfinder -- --trip   # 0-Gas Fail-Closed soil trip
pnpm exec vitest run tests/adapters/wayfinder-shield.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`wayfinder-shield.ts`](../../src/adapters/wayfinder/wayfinder-shield.ts) — `wayfinderCitadelShieldHook` |
| Integrates | `checkSoilResistance()` (Pillar 3 soil fuse) + `verifyAgentIntent()` (8-dimension validation) |
| Chain | Arbitrum One (`42161`) — native pre-execution risk firewall for Wayfinder Agent Engine |

| Test scenario | File | Expected |
|---------------|------|----------|
| Normal Arbitrum route intent | [`wayfinder-shield.test.ts`](../../tests/adapters/wayfinder-shield.test.ts) | `status: ALLOW` · `allowedToSign: true` |
| Toxic soil trip (high slippage / depth) | same | `status: FAIL_CLOSED` · 0-Gas · `reasons` populated |
| Session key clip / expiry violation | same | `status: FAIL_CLOSED` · `allowedToSign: false` |

**AI Agent execution flow (Wayfinder / Virtuals):**

```text
[ Wayfinder Agent Engine / Virtuals Agent Swarm ]
                    │
                    ▼
        wayfinderCitadelShieldHook  (wayfinder-shield.ts)
                    │
                    ▼
        verifyAgentIntent()  (8-dimension gate)
                    │
                    ▼
        checkSoilResistance()  (Pillar 3 soil fuse · p50 ~106µs)
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     FAIL_CLOSED           ALLOW
     (0-Gas intercept)         │
                               ▼
                    [ On-Chain Execution · Arbitrum 42161 ]
```

---

### 2. Stabilizer Protocol Adapter (V1.0 Live · Universal Sepolia Cross-DEX Testnet Sandbox)

**Citadel role:** **Universal Testnet Sandbox & Cross-Pass Interoperability Layer** for AI agents on Arbitrum Sepolia (`421614`). Pre-execution **0-Gas Fail-Closed Protection** across Stabilizer (1:1 zero-slippage stablecoin swap) · GMX v2 (Sepolia shadow margin) · Pendle (Testnet Guarded Pool Factory) — **identical `checkSoilResistance()` bytecode and risk gates** as Arbitrum One (`42161`).

**Command:**

```bash
pnpm demo:stabilizer
pnpm demo:stabilizer -- --trip
pnpm demo:wayfinder -- --stabilizer
pnpm exec vitest run tests/adapters/stabilizer-adapter.test.ts
pnpm exec vitest run tests/demo/gmx-v2-agent-flow.demo.test.ts tests/demo/pendle-ai-agent-flow.demo.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`stabilizer-adapter.ts`](../../src/adapters/stabilizer/stabilizer-adapter.ts) |
| Assets | USDZ / USDC / USDT / USDS — Constant-Sum 1:1 zero-slippage pairs |
| Cross-pass legs | Stabilizer → GMX v2 (`gmx-v2-order-payload-guards.ts`) → Pendle (`pendle-pool-factory-adapter.ts`) |
| Integrates | `verifyStabilizerPoolCapacity()` · `verifyStabilizerPegDrift()` · `verifyZeroSlippageCapacity()` · `checkSoilResistance()` |
| Chain | Arbitrum Sepolia (`421614`) |

#### Stabilizer Sepolia Testnet Verification Vectors

| Vector | Invariant / surface | Verify command | Expected |
|--------|---------------------|----------------|----------|
| **1:1 Constant-Sum Capacity Validation** | Swap amount ≤ zero-slippage pool capacity · Constant-Sum 1:1 invariant | `pnpm demo:stabilizer` · `stabilizer-adapter.test.ts` (ALLOW scenario) | `status: ALLOW` · `allowedToSign: true` |
| **USDZ De-peg (>50bps) Severance & 60s LLM Cooldown** | `verifyStabilizerPegDrift()` trips on >50bps USDZ/collateral drift · signature channel severed · 60s mandatory cooldown on retry | `pnpm demo:stabilizer -- --trip` · `stabilizer-adapter.test.ts` (de-peg scenario) | First call: `FAIL_CLOSED` · retry within 60s: `MANDATORY_COOLDOWN_ACTIVE` |
| **Cross-DEX Liquidity Routing (Stabilizer → GMX v2 → Pendle)** | Each hop gated by `checkSoilResistance()` before broadcast · identical Mainnet bytecode path | `pnpm demo` (Tri-Pillar) · `pnpm demo:stabilizer` + GMX/Pendle demo tests | Per-leg ALLOW or FAIL_CLOSED · no cross-leg bypass |

| Test scenario | File | Expected |
|---------------|------|----------|
| Normal 1:1 swap within zero-slippage capacity | [`stabilizer-adapter.test.ts`](../../tests/adapters/stabilizer-adapter.test.ts) | `status: ALLOW` |
| Liquidation / reserve floor depletion | same | `SOIL_RESISTANCE_TRIP` · `FAIL_CLOSED` · 0-Gas |
| USDZ de-peg trigger + 60s cooldown | same | `FAIL_CLOSED` then `MANDATORY_COOLDOWN_ACTIVE` · signature channel severed |

**Cross-Pass routing diagram:**

```text
[ AI Agent · Sepolia 421614 ]
         │
         ▼  Stabilizer: 1:1 zero-slippage rebalance → checkSoilResistance()
         ▼  GMX v2: shadow-margin / price-impact pre-flight → checkSoilResistance()
         ▼  Pendle: Guarded Pool Factory / oracle TTL → checkSoilResistance()
         │
   ┌─────┴─────┐
   ▼           ▼
FAIL_CLOSED  ALLOW (identical Mainnet bytecode · 0-Gas on block)
```

---

### 3. ElizaOS Citadel Plugin (V1.0 Live)

**Command:**

```bash
pnpm demo:elizaos
pnpm exec vitest run tests/adapters/elizaos-plugin.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`elizaos-citadel-plugin.ts`](../../src/adapters/elizaos/elizaos-citadel-plugin.ts) — `evaluateElizaCitadelAction()` |
| Demo | `pnpm demo:elizaos` · `--trip` for FAIL_CLOSED |

---

### 4. Virtuals Protocol GAME Adapter (V1.0 Live)

**Command:**

```bash
pnpm demo:virtuals
pnpm exec vitest run tests/adapters/virtuals-adapter.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`virtuals-game-adapter.ts`](../../src/adapters/virtuals/virtuals-game-adapter.ts) — `evaluateVirtualsGameTask()` |
| Integrates | `verifyAgentIntent()` + `checkSoilResistance()` before GAME Worker dispatch |
| Chain | Arbitrum One (`42161`) |

| Test scenario | Expected |
|---------------|----------|
| Normal GAME worker task | `status: ALLOW` · `allowedToSign: true` |
| Toxic soil trip | `FAIL_CLOSED` · 0-Gas |
| Session key clip breach | `FAIL_CLOSED` · `CLIP_BREACH` |

---

### 5. LangChain / LangGraph CitadelRiskGuardTool (V1.0 Live)

**Command:**

```bash
pnpm demo:langchain
pnpm exec vitest run tests/adapters/langchain-tool.test.ts
```

| Scope | Detail |
|-------|--------|
| Adapter SSOT | [`langchain-citadel-tool.ts`](../../src/adapters/langchain/langchain-citadel-tool.ts) — `CitadelRiskGuardTool` |
| Integrates | Parameter hallucination guard · `verifyAgentIntent()` · `checkSoilResistance()` |
| Compat | `@langchain/core/tools` StructuredTool · LangGraph state nodes |

| Test scenario | Expected |
|---------------|----------|
| Normal tool invoke | `status: ALLOW` · `output: SOIL_PASS` |
| Toxic slippage soil trip | `FAIL_CLOSED` |
| Parameter hallucination (NaN / negative depth) | `FAIL_CLOSED` · `PARAMETER_HALLUCINATION` |

---

### 6. Supplementary Agent Demos (Optional)

**Command:** `tsx examples/agent-interceptor-demo.ts` · legacy scripts in [`examples/adapters/`](../../examples/adapters/)

| Scope | Detail |
|-------|--------|
| Primary SSOT | **V1.0 Live Native Integrations** in [`src/adapters/`](../../src/adapters/) — use `pnpm demo:{wayfinder,elizaos,virtuals,langchain,stabilizer}` |
| Supplementary | [`agent-interceptor-demo.ts`](../../examples/agent-interceptor-demo.ts) · [`examples/adapters/`](../../examples/adapters/) (TS + Python evaluator scripts) |

---

### 7. Quantitative Stress Benchmark (Survival Benchmark)

**Command:**

```bash
pnpm tsx scripts/generate-survival-report.ts
```

| Parameter | Value |
|-----------|-------|
| Lookback | 30D HL L2 orderbook stress |
| Degrade events | 42 observed |
| Offline fallback | Resilient 503 / network abort → snapshot replay |
| Output | `docs/0801_BeDelta_Survival_Benchmark.md` |

---

### 8. Production Telemetry & Provenance (Optional / Network)

| Surface | Command | Expected |
|---------|---------|----------|
| Sidecar health | [`docker/README.md`](../../docker/README.md) | `curl -sS http://localhost:8080/health \| jq .` |
| Live grant audit | Network required | `curl -s https://bedeltawater.slivervine.xyz/api/grant-audit \| jq .provenanceVerified` |
| 5-TX testnet proof | `pnpm verify:5tx` / `pnpm verify:grant` | Hyperliquid testnet anchor in `verified_5tx_results.json` |
| Demo pipeline | `pnpm demo` · `pnpm demo:{gmx,hl,pendle,uniswap,aave,morpho}` · `pnpm demo:{wayfinder,elizaos,virtuals,langchain}` · `pnpm demo:{stabilizer,e2e}` | 3-Tier CLI suite · per-venue `--trip` proofs · **4-step Happy Path** ANSI HUD (`--unwind` · `--trip` optional) |

**Sidecar build:**

```bash
docker build -t silvervine-sidecar -f docker/Dockerfile.sidecar .
```

---

## Appendix — Maintainer Scripts & Bundle Checks

| Script | Purpose | Expected |
|--------|---------|----------|
| `pnpm bundle:measure` | Worker hot-path size gate | **50.94 KiB gzip** / **143.77 KiB raw** · `limitKiB: 150` · `pass: true` |
| `pnpm verify:negative` | Negative soil-trip proofs | Depth breach fail-closed |
| `pnpm demo` | Tri-Pillar micro E2E demo matrix (`tests/demo/`) | **12/12 PASS** |
| `pnpm demo:gmx` | GMX v2 shadow margin CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:hl` | Hyperliquid session key CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:pendle` | Pendle guarded pool factory CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:uniswap` | Uniswap V3 concentrated liquidity CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:aave` | Aave V3 lending HF CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:morpho` | Morpho Blue vault guard CLI | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:variational` | Variational Omni RFQ stale quote & OLP guard | ALLOW / `--trip` **FAIL_CLOSED** |
| `pnpm demo:gmx -- --trip` | **Judge fast track** — GMX native hard anchor | **FAIL_CLOSED** |
| `pnpm demo:variational -- --trip` | **Judge fast track** — Variational multi-venue gate | **FAIL_CLOSED** |
| `pnpm demo:hl -- --trip` | **Judge fast track** — Hyperliquid primary path | **FAIL_CLOSED** |
| `pnpm demo:e2e` | 4-step Happy Path macro lifecycle ANSI HUD | `RESULT: E2E OK (4/4)` |
| `pnpm demo:wayfinder` | Wayfinder native route interception | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:elizaos` | ElizaOS Action handler guard | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:virtuals` | Virtuals GAME worker guard | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:langchain` | LangChain CitadelRiskGuardTool | ALLOW / `--trip` FAIL_CLOSED |
| `pnpm demo:stabilizer` | Standalone Stabilizer Sepolia 1:1 swap guard | ALLOW / `--trip` FAIL_CLOSED + cooldown |
| `pnpm test` | Full Vitest + coverage | **217 test files | 967 PASS clean** |
| `pnpm test:watch` | Interactive Vitest | — |
| `pnpm typecheck` | `tsc --noEmit` | — |
| `pnpm audit:fast` / `audit:security` / `audit:nightly` | 3-tier security matrix | **5/0/0 PASS** (security tier) |
| `pnpm build:wasm` | Rust `soil_core.wasm` | `pkg/soil_core.wasm` |
| `pnpm build:citadel-invariants` | Phase C host wasm + GMX/soil packed eval | `pkg/citadel_invariants.wasm` · Cargo **2/2** |
| `pnpm build` / `deploy` / `dev` | Worker / SPA toolchain | — |

**Removed from public script surface (OpSec):** live ignition / wallet sweep / spot sell / Sepolia UserOp one-offs — not required for Buildathon diligence.

---

## On-Chain Contract Topology (`contracts/` vs `SliverVineGate/`)

Automated dependency audit (2026-08-24): **no TS/JS runtime import** of `contracts/*.sol` paths; **no duplicate** Solidity definitions inside `SliverVineGate/`. Two distinct on-chain surfaces:

| Path | Contracts | Role | Forge / TS linkage |
|------|-----------|------|-------------------|
| **`SliverVineGate/`** | `SliverVineGate.sol` · `GatedExecutor.sol` | EIP-712 consume-once attestation gate (Pillar 3) | `cd SliverVineGate && forge test` · **60/60** · default fuzz **5,120** · deep **327,675** via `FOUNDRY_PROFILE=deep` |
| **`contracts/`** | `SliverVineRiskOracle.sol` · `IngressSafetySwitch.sol` | Venue-agnostic ingress compliance oracle + address-level safety switch | **Not** in Forge testbed · ABI mirrored in TS |

**TypeScript interface SSOT (Edge runtime):**

| Solidity source | TS ABI / adapter | Usage |
|-----------------|------------------|-------|
| `contracts/SliverVineRiskOracle.sol` | `src/services/aa-adapter/risk-oracle.ts` → `SLIVERVINE_RISK_ORACLE_ABI` | `risk-oracle-gate.ts` · viem `readContract` when `SLIVERVINE_RISK_ORACLE_ADDRESS` set |
| `contracts/IngressSafetySwitch.sol` | `risk-oracle.ts` → `INGRESS_SAFETY_SWITCH_ABI` | `risk-oracle-adapter.ts` · `evaluateComplianceAdapter()` (fail-closed logic) |

**Verdict:** `contracts/` is **not** a safe delete — it is the canonical Solidity spec for Robinhood ingress; TS adapters intentionally mirror ABIs (no Forge artifact import at Edge).
