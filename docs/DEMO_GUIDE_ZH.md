# Citadel CLI Demo 指南

> **中文參考譯本 · 英文原文為 SSOT**  
> English SSOT: [DEMO_GUIDE.md](./DEMO_GUIDE.md)

> **旗艦 demo**（README hero）：`pnpm demo:matrix` · `pnpm demo:quad`  
> 所有獨立 demo 透過 `process.hrtime.bigint()` 量測延遲（µs 精度）— 無硬編碼計時輸出。

---

## 旗艦指令

| 指令 | 範圍 |
|------|------|
| `pnpm demo:matrix` | 完整 **7 協議**跨場所矩陣（`--loop=all`，預設） |
| `pnpm demo:quad` | 完整 **4 大 AI Agent 框架**執行前護盾（Wayfinder · ElizaOS · Virtuals · LangChain） |

```bash
pnpm demo:matrix              # 完整跨場所矩陣 (--loop=all, 預設)
pnpm demo:matrix -- --trip      # R20 trip + severance（全 leg FAIL_CLOSED）
pnpm demo:quad                # 四大 AI 框架合併 ALLOW
pnpm demo:quad -- --trip      # Quad 框架有毒 soil / 幻覺 trip
```

---

## 3-Tier Demo Suite（CLI SSOT）

| Tier | Commands | Scope |
|------|----------|-------|
| **Tier 1 — Native Protocols** | `pnpm demo:gmx` · `pnpm demo:hl` · `pnpm demo:pendle` · `pnpm demo:uniswap` · `pnpm demo:aave` · `pnpm demo:morpho` · `pnpm demo:variational` · `pnpm demo:matrix` | GMX · HL · Pendle · Uniswap V3 · Aave V3 · Morpho Blue · Variational RFQ · **7-protocol cross-venue matrix** |
| **Tier 2 — Agent Frameworks** | `pnpm demo:wayfinder` · `pnpm demo:elizaos` · `pnpm demo:virtuals` · `pnpm demo:langchain` · `pnpm demo:quad` | Wayfinder · ElizaOS · Virtuals · LangChain · combined quad run |
| **Tier 3 — Sandbox & E2E** | `pnpm demo:stabilizer` · `pnpm demo:e2e` | Sepolia Stabilizer 1:1 guard · 5-step macro lifecycle |
| **Vitest matrix** | `pnpm demo` | 12 Tri-Pillar ANSI scenarios (`tests/demo/`) |

---

## Tier 1 — 原生協議

```bash
pnpm demo:gmx           # GMX v2 shadow margin · cross-venue slippage · position cap
pnpm demo:hl            # Hyperliquid session key auth · orderbook depth guard
pnpm demo:pendle        # Pendle PT/YT sentinel · guarded pool factory
pnpm demo:uniswap       # Uniswap V3 concentrated liquidity · dynamic fee guard
pnpm demo:aave          # Aave V3 HF & cross-chain liquidation guard
pnpm demo:morpho        # Morpho Blue vault share-price & sandwich guard
pnpm demo:variational   # Variational Omni RFQ stale quote & OLP depth guard
```

### Matrix 迴圈變體

```bash
pnpm demo:matrix -- --loop=perp                    # Pendle → GMX → dual perp hedge (HL + Variational)
pnpm demo:matrix -- --loop=perp --hedge=variational   # Variational Omni RFQ hedge leg
pnpm demo:matrix -- --loop=perp --hedge=hyperliquid   # Hyperliquid L1 hedge leg only
pnpm demo:matrix -- --loop=perp --hedge=both          # HL + Variational (default perp hedge)
pnpm demo:matrix -- --loop=spot                    # Uniswap V3 → Aave V3 → Morpho Blue spot loop
# 附加 -- --healthy-only 為 nominal PASS；預設執行 R20 trip + severance
```

附加 `-- --trip` 至任一 Tier 1 指令以演示 **FAIL_CLOSED**。

---

## Tier 2 — Agent 框架

```bash
pnpm demo:wayfinder     # Wayfinder route interception on Arbitrum 42161
pnpm demo:elizaos       # ElizaOS Action handler guard
pnpm demo:virtuals      # Virtuals GAME worker guard
pnpm demo:langchain     # LangChain CitadelRiskGuardTool
pnpm demo:quad          # All four AI frameworks (combined)
```

附加 `-- --trip` 以演示 0-Gas Fail-Closed soil trip。

---

## Tier 3 — Sandbox & E2E

```bash
pnpm demo:stabilizer              # Sepolia Stabilizer 1:1 swap guard
pnpm demo:stabilizer -- --trip    # USDZ de-peg + reserve depletion + 60s cooldown
pnpm demo:wayfinder -- --stabilizer   # Stabilizer harness via Wayfinder adapter
pnpm demo:e2e                     # 5-step macro lifecycle ANSI HUD
```

---

## 快速驗證路徑

```bash
pnpm install
pnpm demo       # Primary Judge Showcase (12 Tri-Pillar Scenarios)
pnpm demo:e2e   # 5-Step Macro Lifecycle CLI
pnpm test       # Full System Regression Suite
```

Optional benchmark: `npx tsx scripts/grant-advanced-resilience-benchmark.ts`

→ 完整驗證矩陣：[`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)
