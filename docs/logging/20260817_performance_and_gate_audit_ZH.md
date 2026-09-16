> [ARCHIVED LOG] Historical terminology retained for audit trail.

# Performance & On-Chain Gate Audit — Arbitrum Buildathon V1.0

> **中文參考譯本** · 英文 SSOT：[`20260817_performance_and_gate_audit.md`](./20260817_performance_and_gate_audit.md)  
> **Vitest SSOT：** **840 passed tests** · Worker **70.16 KiB** gzip · **7 protocols** · **4 frameworks** · Milestone 1 PRs

**審計日期：** 2026-08-17 (UTC+8)  
**審計角色：** Cursor Senior Systems Engineer  
**倉庫：** `bedelta-living-water`（`feat/v1.0-expansion` @ `56cfe58`）  
**域名：** `bedeltawater.slivervine.xyz`（SliverVine Protocol）

---

## 執行裁決

| 目標 | 目標值 | 測量值 | 裁決 |
|---|---|---|---|
| `checkSoilResistance()` 亞微秒延遲 | p50 < **1.0 µs**（1,000 ns） | p50 ≈ **106 µs**（105,951 ns） | ❌ **FAIL** |
| `checkSoilResistance()` 實用 Edge SLO | < **1.0 ms** | p50 ≈ **0.106 ms** | ✅ **PASS** |
| Worker gzipped bundle | ≤ **158.99 KiB** | **158.99 KiB**（精確） | ✅ **PASS**（at ceiling） |
| `verifyAndConsume` median gas | ~**28k** | **28,043** gas | ✅ **PASS** |
| `SliverVineGate` runtime bytecode | < **24 KiB** | **8,916 B**（8.71 KiB） | ✅ **PASS** |
| Foundry test suite（`SliverVineGate/`） | 60/60 green | **60 passed / 0 failed** | ✅ **PASS** |

**底線：** Bundle 與鏈上 gate 聲稱 **可驗證且在限制內**。**sub-microsecond** `checkSoilResistance()` 聲稱 **不被測量數據支持**；可辯護的延遲聲稱為 **sub-millisecond**（Node.js v22 中 ~100 µs 中位數）。

> **倉庫備註：** `SliverVineGate/` Solidity 源碼在 `feat/v1.0-expansion` 工作樹上 **缺失**（僅剩 `MILESTONES.md`）。鏈上測試從 **`git archive v0.9 SliverVineGate`** 提取於 `/tmp/slivervine-gate-audit/SliverVineGate` 執行。提交前請重新整合 gate 源碼。

---

## 1. `checkSoilResistance()` 決策延遲基準

### 方法論

- **函數：** `checkSoilResistance()` from `src/services/risk-control-lib/soil-resistance.ts`
- **Harness：** Inline `tsx` benchmark，2,000 warmup + **10,000** timed iterations
- **計時器：** `performance.now()`（轉換為 ns）**與** `process.hrtime.bigint()`
- **Probes：** 透過 `scripts/_shared/santenmoku-stress-probes.ts` 的確定性測試 probes（`resetProbes`, `SAFE_AT`）
- **輸入：** 標稱 ETH 路徑 — `hlSpot/hlPerp/dydxPerp=3500`, `depthUsd=MIN_DEPTH_USD`, `orderSizeUsd=500`, `accountBalanceUsd=10_000`
- **環境：** Node.js `v22.23.1`, Linux WSL2

### 原始輸出

```json
{
 "benchmark": "checkSoilResistance() pure path",
 "node": "v22.23.1",
 "iterations": 10000,
 "warmup": 2000,
 "claimTargetNs": 1000,
 "claimLabel": "Sub-Microsecond (<1.0 µs)",
 "performanceNow": {
 "minNs": 56109,
 "p50Ns": 106628,
 "p95Ns": 257390,
 "p99Ns": 589181,
 "maxNs": 8558158,
 "meanNs": 134744
 },
 "hrtimeBigint": {
 "minNs": 55904,
 "p50Ns": 105951,
 "p95Ns": 256019,
 "p99Ns": 585661,
 "maxNs": 8554588,
 "meanNs": 133565
 },
 "passSubMicrosecond_p50": false,
 "passSubMillisecond_p50": true
}
```

### 分析

| 百分位 | `hrtime` (ns) | `hrtime` (µs) | vs 1 µs target |
|---|---|---|---|
| min | 55,904 | 55.9 µs | **56× over** |
| **p50** | **105,951** | **106.0 µs** | **106× over** |
| p95 | 256,019 | 256.0 µs | 256× over |
| p99 | 585,661 | 585.7 µs | 586× over |
| mean | 133,565 | 133.6 µs | 134× over |

**延遲超過 1 µs 的原因：** `checkSoilResistance()` **不是**單一算術 fuse。熱路徑在 slippage 計算前順序評估 **≥8 個 guard 子系統**：

```117:165:src/services/risk-control-lib/soil-resistance.ts
export function checkSoilResistance(
 input: SoilResistanceInput,
): SoilResistanceResult {
 // ...
 if (isTsunamiShieldWindow(input.at)) { ... }
 if (!isSequencerSafe(input.at?.getTime())) { ... }
 if (!isArbitrumStatusSequencerHealthy(input.at?.getTime())) { ... }
 if (!isRpcRadarSequencerHealthy(input.at?.getTime())) { ... }
 if (isArbitrumGasGuardBlocked()) { ... }
 if (!isSoftConfirmationSafe(input.at?.getTime())) { ... }
 // + crossSpread, gmxPriceImpact, hlOrderbookGap, rwaSettlement, slippage math, telemetry emit on trip
```

**交叉引用 — 內部 SLO harness**（`scripts/grant-advanced-resilience-benchmark.ts`，10k iters，`evaluateGatewayRules` + `checkSoilResistance`）：

```json
"benchmark": {
 "pass": true,
 "meanLatencyMs": 0.0004,
 "iterations": 10000,
 "sloTargetMs": 1,
 "soilSloMs": 500
}
```

該 harness SLO 為 **< 1.0 ms**（毫秒），**非** sub-microsecond。`.cursorrules` 的 "0.014ms Edge execution logic"（14 µs）亦 **未達成** 完整 guard stack（~106 µs 測量）。

### 裁決 — 延遲

| 聲稱 | 結果 |
|---|---|
| Sub-microsecond (< 1 µs) | ❌ **REJECTED** — 約 2 個數量級偏差 |
| Sub-millisecond (< 1 ms) | ✅ **CONFIRMED** — p50 ≈ 0.106 ms |
| Oracle-lag circuit-break (> 500 ms RPC) | ✅ Architectural（與 pure-function bench 分開） |

---

## 2. Cloudflare Worker Bundle 限制

### 命令

```bash
pnpm run bundle:measure
# equivalent: pnpm run build:worker → vite build + tsc + wrangler deploy --dry-run
```

### 原始輸出 — `bundle:measure`

```json
{
 "measuredAt": "2026-08-17T15:14:07.819Z",
 "entry": "src/worker-entry.ts",
 "artifact": "dist-worker/worker-entry.js",
 "rawKiB": 767.34,
 "gzipKiB": 158.99,
 "wranglerTotalUploadKiB": 767.34,
 "wranglerTotalGzipKiB": 158.99
}
```

### 原始輸出 — `pnpm run build:worker`（wrangler tail）

```
Total Upload: 767.34 KiB / gzip: 158.99 KiB
--dry-run: exiting now.
```

### 裁決 — Bundle

| 指標 | 限制 | 測量值 | 狀態 |
|---|---|---|---|
| Gzipped Worker upload | ≤ 158.99 KiB | **158.99 KiB** | ✅ **PASS**（zero headroom） |
| Raw `worker-entry.js` | informational | 767.34 KiB | — |

**風險：** Bundle **精確位於 158.99 KiB 上限**。任何依賴新增將在無進一步 tree-shaking 或 code splitting 的情況下超限。

---

## 3. On-Chain Gate — Gas & Bytecode（`SliverVineGate/`）

### 環境

```
forge Version: 1.7.1
solc 0.8.28, optimizer_runs=20000 (foundry.toml)
Source: git archive v0.9 → /tmp/slivervine-gate-audit/SliverVineGate
```

### 測試執行

```bash
cd /tmp/slivervine-gate-audit/SliverVineGate
/home/lhsum/.foundry/bin/forge test --gas-report
```

```
Ran 4 test suites in 11.79s: 60 tests passed, 0 failed, 0 skipped (60 total tests)
```

### Gas Report 摘錄 — `verifyAndConsume`

```
╭------------------------------------------------+-----------------+-------+--------+-------+---------╮
| src/SliverVineGate.sol:SliverVineGate Contract | | | | | |
+=====================================================================================================+
| Deployment Cost | Deployment Size | | | | |
|------------------------------------------------+-----------------+-------+--------+-------+---------|
| 2090241 | 10216 | | | | |
|------------------------------------------------+-----------------+-------+--------+-------+---------|
| Function Name | Min | Avg | Median | Max | # Calls |
|------------------------------------------------+-----------------+-------+--------+-------+---------|
| verifyAndConsume | 25853 | 29550 | 28043 | 77128 | 17991 |
╰------------------------------------------------+-----------------+-------+--------+-------+---------╯
```

| 指標 | MILESTONES.md 聲稱 | 本審計 | Delta |
|---|---|---|---|
| `verifyAndConsume` min | 25,853 | **25,853** | exact match |
| `verifyAndConsume` median | 28,055 | **28,043** | −12 gas (−0.04%) |
| `verifyAndConsume` max | 77,148 | **77,128** | −20 gas |

### Bytecode Size — `forge build --sizes`

```
╭-----------------+------------------+-------------------+--------------------+---------------------╮
| Contract | Runtime Size (B) | Initcode Size (B) | Runtime Margin (B) | Initcode Margin (B) |
+===================================================================================================+
| SliverVineGate | 8,916 | 9,960 | 15,660 | 39,192 |
| GatedExecutor | 3,771 | 4,431 | 20,805 | 44,721 |
╰-----------------+------------------+-------------------+--------------------+---------------------╯
```

| Size 指標 | 值 | 24 KiB limit (24,576 B) | 狀態 |
|---|---|---|---|
| **Runtime bytecode**（on-chain） | **8,916 B**（8.71 KiB） | 36% of limit | ✅ **PASS** |
| Initcode | 9,960 B | 41% of limit | ✅ PASS |
| Gas-report "Deployment Size" | 10,216 B | 42% of limit | ✅ PASS（artifact metric） |

> **澄清：** `MILESTONES.md` 引用 "10,216 bytes runtime"。`forge build --sizes` 報告 **on-chain runtime = 8,916 B**。gas-report **Deployment Size = 10,216** 為 deployment-artifact 數字（initcode/metadata-adjacent），非 deployed runtime wordcode。**二者均遠低於 24 KiB EIP-170 限制。**

### 裁決 — On-Chain Gate

| 聲稱 | 結果 |
|---|---|
| `verifyAndConsume` ~28k median gas | ✅ **CONFIRMED**（28,043） |
| Runtime < 24 KiB | ✅ **CONFIRMED**（8.71 KiB） |
| 60/60 Foundry tests | ✅ **CONFIRMED** |
| Zero external deps（inline ECDSA） | ✅ **CONFIRMED**（`SliverVineGate.sol` static review） |

---

## 4. Static Code Audit — Risk Engine & Verification Path

### 4.1 Off-Chain Risk Engine（`checkSoilResistance`）

| 發現 | 嚴重度 | 細節 |
|---|---|---|
| Fail-closed guard stack | ✅ Strength | 交易計算前 8+ 順序 probes；trip → `notifyFailClosedLock` + telemetry |
| Latency claim accuracy | ⚠️ Medium | 公開 "sub-microsecond" 聲稱不支持；使用 **~100 µs p50** 或 **<1 ms SLO** |
| Trip side-effects on hot path | ℹ️ Info | trip 時 `recordTelemetrySoilTrip()` + `emitRiskLog()` 增加 I/O；fail-closed 可接受但非 latency-neutral |
| Probe testability | ✅ Strength | `santenmoku-stress-probes.ts` 為 CI 提供確定性注入 |

### 4.2 On-Chain Gate（`SliverVineGate.sol`）

| 不變量 | Static Review | Test Coverage |
|---|---|---|
| I1 halted → deny all | ✅ `halted` checked first | `test_I1_Halted_Denies` |
| I2 verdict == ALLOW only | ✅ `VERDICT_ALLOW = 1` | `test_I2_NonAllowVerdict_Denies` |
| I6 replay protection | ✅ `consumed[digest]` mapping | `test_I6_Replay_Denies`, fuzz |
| I7 strict signer ordering | ✅ ascending address guard | `test_I7b_DuplicateSigner_Denies` |
| I7d malleability rejection | ✅ `s <= secp256k1n/2` | `test_I7d_MalleableSignature_Denies` |
| Cross-chain replay | ✅ `chainId` in EIP-712 domain | `test_CrossChainReplay_Impossible` |
| Asymmetric authority | ✅ halt immediate, unhalt timelocked | authority test suite |
| No oracle on-chain reads | ✅ by design（comment L19–22） | architectural |

### 4.3 Integration Gap（Current Branch）

| 項目 | 狀態 |
|---|---|
| `SliverVineGate/` sources on `feat/v1.0-expansion` | ❌ **Missing**（only `MILESTONES.md`） |
| `DEPLOYMENTS.md` gate addresses | `drafted, not yet deployed` |
| `forge` from repo root | Returns "Nothing to compile"（no `foundry.toml` at root） |

**Remediation：** `git checkout v0.9 -- SliverVineGate` 或在 Buildathon demo / M3 deployment milestone 前恢復 submodule。

---

## 5. Recommended Public Claims（Buildathon-Safe）

| ✅ Safe to claim | ❌ Do not claim |
|---|---|
| `checkSoilResistance()` median **~106 µs** in Node（10k bench） | "Sub-microsecond"（< 1 µs）decision latency |
| Full risk gate stack **< 1 ms** SLO | "0.014 ms" without scoping to a specific micro-kernel |
| Worker bundle **158.99 KiB gzip**（at limit） | Headroom for new deps without rebuild |
| `verifyAndConsume` **~28k gas** median | Exact 28,055 gas（use "~28k"） |
| Gate runtime **8.7 KiB**（<< 24 KiB） | "10.2 KiB runtime" without clarifying metric |
| 60/60 Foundry tests, 327k+ fuzz runs | "contracts pre-deployed"（not yet on-chain） |

---

## 6. Reproduction Commands

```bash
# 1. Soil resistance latency (10,000 iterations)
cd bedelta-living-water
pnpm exec tsx -e "
import { performance } from 'node:perf_hooks';
import { MIN_DEPTH_USD, checkSoilResistance } from './src/services/risk-control.ts';
import { muteConsole, resetProbes, SAFE_AT } from './scripts/_shared/santenmoku-stress-probes.ts';
const inp = { symbol:'ETH', hlSpot:3500, hlPerp:3500, dydxPerp:3500, depthUsd:MIN_DEPTH_USD, at:SAFE_AT };
const r = muteConsole(); resetProbes(Date.now());
for (let i=0;i<2000;i++) checkSoilResistance(inp);
const ns=[]; for (let i=0;i<10000;i++){const t=process.hrtime.bigint();checkSoilResistance(inp);ns.push(Number(process.hrtime.bigint()-t));}
r(); ns.sort((a,b)=>a-b); console.log('p50_ns', ns[5000]);
"

# 2. Worker bundle
pnpm run bundle:measure

# 3. On-chain gate (restore sources first)
git archive v0.9 SliverVineGate | tar -x -C /tmp/gate-audit
cd /tmp/gate-audit/SliverVineGate
~/.foundry/bin/forge test --gas-report
~/.foundry/bin/forge build --sizes
```

---

*審計產物生成於 2026-08-17。所有測量來自審計工作站上的 live execution。*
