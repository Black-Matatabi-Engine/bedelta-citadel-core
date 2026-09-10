# SliverVine 鏈上 / Stylus 升級審計報告

**審計範圍：** `contracts/` · `SliverVineGate/` · `src/core/gmx-risk-core.ts` · `src/wasm/soil_core.rs` · `contracts/stylus-probe/`  
**結論：** 現有鏈上層僅覆蓋 **合規入口（Oracle flush + 黑名單）** 與 **ERC-8196 元資料（agentId / notional / ttl）**；`gmx-risk-core` 與 R01–R20 防禦矩陣 **100% 在 Edge/Wasm 熱路徑**，Hot Key multicall 執行前 **無鏈上 fail-closed 綁定**。以下三項依 **安全缺口 × 可落地性 × Grant 敘事價值** 排序。

---

## 現況差距摘要

| 模組 | LOC | 現況 | 缺口 |
|------|-----|------|------|
| `IngressSafetySwitch.sol` | 53 | Oracle `isSystemFlushed` + `statusCode` + blacklist | 無 R-bitmap、無 GMX wire 解碼；**≥2 次 Oracle SLOAD** |
| `SliverVineRiskOracle.sol` | 90 | EIP-712 離線簽章更新 status | 無 `protocolMask` / 防禦矩陣位元 |
| `SliverVineAgentPolicyGuard.sol` | 92 | agentId / maxNotional / ttl | **未接入** `collectGmxGmRiskInvariantErrors` |
| `stylus-probe` | ~140 | 3 參數 u64 soil + 6×f64 向量 | 與 `src/wasm/soil_core.rs`（28+8 f64 ABI）**語意分叉** |
| `gmx-risk-core.ts` | 130 | executionFee / slippage floor / pool imbalance | 僅 `gmx-gm-deposit-audit.ts` 鏈下使用 |

```33:38:contracts/IngressSafetySwitch.sol
    function isCompliant(address target) external view returns (bool) {
        if (riskOracle.isSystemFlushed() || riskOracle.statusCode() == riskOracle.STATUS_SHUTDOWN()) {
            return false;
        }
        return !institutionalBlacklist[target];
    }
```

```49:59:contracts/src/SliverVineAgentPolicyGuard.sol
    function checkAgentPolicy(bytes32 agentId, uint256 maxNotional, uint256 ttl)
        public
        view
        returns (bytes32 digest)
    {
        if (!isPolicyActive) revert PolicyInactive();
        if (agentId == bytes32(0)) revert ZeroAgentId();
        if (maxNotional == 0) revert ZeroNotional();
        if (block.timestamp > ttl) revert PolicyExpired();
```

---

## 升級 #1（最高影響）：PolicyGuard × GMX Wire 不變量鏈上閘門

**問題：** `0908_PM_30_Persona_Audit` 已確認 multicall 腿順序 / Vault 替換在 **TS assert 層** fail-closed，但攻擊者可繞過 builder 直接組 raw calldata。`gmx-risk-core` 仍是 **廣播前鏈下審計**，PolicyGuard UserOp 僅驗證元資料，**未綁定 `payloadHash → ExchangeRouter.multicall` 語意**。

**目標：** 在 ERC-4337 `validateUserOp` / Kernel v3 Pre-Execution Hook 階段，於 **EVM 執行前** reject 非法 Hot Key multicall。

### 模組拆分（每檔 <200 LOC）

```
contracts/src/
├── libs/
│   └── GmxRiskInvariantLib.sol      (~110 LOC)  // 鏡像 gmx-risk-core 純函式
├── libs/
│   └── GmxMulticallDecodeLib.sol  (~95 LOC)   // calldata 零拷貝解 legs
└── SliverVineAgentPolicyGuardV2.sol (~175 LOC) // 繼承 V1 + wire gate
```

### 核心 API 藍圖

```solidity
// GmxRiskInvariantLib.sol — 固定點鏡像 TS SSOT
uint256 internal constant GMX_MIN_EXECUTION_FEE = 1e15;
uint256 internal constant SLIPPAGE_BPS_CAP = 10_000;
uint256 internal constant IMBALANCE_MAX_BPS = 3_500; // 0.35 × 1e4

function minOutputAmount(uint256 expected, uint16 slippageBps) internal pure returns (uint256);
function verifyPoolImbalanceBps(uint256 longUsd, uint256 shortUsd) internal pure returns (bool);
function collectWireErrors(GmxWire calldata w, GmxCtx calldata ctx) internal pure returns (bytes32 errMask);
```

```solidity
// SliverVineAgentPolicyGuardV2.sol
struct GmxWireContext {
    uint256 executionFee;
    uint256 minMarketTokens;
    uint256 expectedMarketTokens;
    uint16  slippageBps;       // default 30
    uint256 poolLongUsd;       // 由 Edge attestation 注入，非鏈上 RPC
    uint256 poolShortUsd;
}

function checkAgentPolicyWithGmxWire(
    bytes32 agentId,
    uint256 maxNotional,
    uint256 ttl,
    bytes calldata routerMulticallData,  // ExchangeRouter.multicall(bytes[])
    GmxWireContext calldata ctx
) external view returns (bytes32 digest) {
    digest = checkAgentPolicy(agentId, maxNotional, ttl);
    GmxMulticallDecodeLib.assertDepositLegOrder(routerMulticallData); // sendWnt→sendTokens→createDeposit
    bytes32 errMask = GmxRiskInvariantLib.collectWireErrors(...);
    if (errMask != 0) revert GmxInvariantTripped(errMask);
}
```

### 與 Gate / ZeroDev 整合

```text
UserOp.callData
  ├─ [1] PolicyGuard.checkAgentPolicyWithGmxWire(agentId, notional, ttl, gmxCalldata, ctx)
  └─ [2] SliverVineGate.verifyAndConsume(att, sigs)
         payloadHash = hash(initiator, ROUTER, gmxCalldata, nonce)  // 已有 GatedExecutor 綁定
```

**關鍵設計決策：**

- `poolLongUsd / poolShortUsd` **不可**在鏈上 RPC 拉取 → 由 Edge `RiskAttestation.riskBps` 或擴展 EIP-712 `GmxPoolSnapshot` 欄位注入，PolicyGuard 只做 **純算式驗證**（與 TS `auditGmxPoolWeightsImbalancePure` 對拍）。
- `deploy-policy-guard-and-live-fill.ts` 已預期 `Gate.setPolicyGuard()`，但 repo 內 `SliverVineGate.sol` **尚無此 hook** → V2 需同步新增 `IPolicyGuard` 介面 + `SliverVineGateLib.validate` 前置 staticcall（~25 LOC 增量）。

### 測試計畫

- Forge：`contracts/test/PolicyGuardGmxWire.t.sol` — fork 42161 + fixture `gmx-micro-fill-multicall.json`
- Vitest 對拍：`tests/core/gmx-risk-core.test.ts` 案例 → Solidity fuzz corpus（≥65k vectors）
- 目標 gas：`checkAgentPolicyWithGmxWire` view **< 8,000 gas**（Solidity 純算式，非 Stylus）

**預期影響：** 直接關閉「繞過 TS assert 的 raw multicall」攻擊面；Grant 敘事從「Edge 0-Gas Safety」升級為 **「鏈上 settlement-plane 二次 fail-closed」**。

---

## 升級 #2（高影響）：`GmxSoilMatrixSwitch` — 單 SLOAD + calldata 位元遮罩

**問題：** `IngressSafetySwitch` 對 Oracle 做 **兩次獨立讀取**；R01–R20 的 `protocolMask`（`risk-flags.ts`）與 `FLAGS_AUTO_SEVER_MASK` 僅存在 Edge/KV，鏈上無 SSOT。

**目標：** 一次 `SLOAD` 讀取 `bytes32 defenseState`，以 `(state & TRIP_MASK) == 0` 驗證 **可鏈上化的 R 子集**；calldata 傳入 GMX wire 摘要做第二 pass（無 storage）。

### 儲存布局（`bytes32 defenseState` — 單 slot）

```text
bit  [0:19]  trippedRoots      R01–R20（1 = tripped，Edge 離線簽章推送）
bit  [20:23] statusCode        對齊 STATUS_SAFE/WARNING/SHUTDOWN
bit  [24]    isSystemFlushed
bit  [25:55] lastTimestamp     uint31（2038 前足夠）
bit  [56:63] schemaVersion     ABI 版本
```

### 模組拆分

```
contracts/
├── libs/DefenseMatrixBitmap.sol     (~60 LOC)   // pack/unpack + TRIP_MASK 常數
├── GmxSoilMatrixSwitch.sol          (~145 LOC)  // 繼承/組合 IngressSafetySwitch
└── SliverVineRiskOracleV2.sol       (~180 LOC)  // applySignedMatrixReport()
```

### 核心 gate 邏輯（偽代碼）

```solidity
// GmxSoilMatrixSwitch.sol
bytes32 internal constant EDGE_TRIP_MASK =
    (1 << 0)  | // R01 Soil
    (1 << 1)  | // R02 VineWrap
    (1 << 6)  | // R07 Notional
    (1 << 10) | // R11 Dynamic SL
    (1 << 16) | // R17 Daily Loss
    (1 << 19);  // R20 Deadlock

function gateMatrix(bytes32 calldataWireDigest) external view {
    bytes32 state = riskOracle.defenseState();           // 1× SLOAD
    if (state & EDGE_TRIP_MASK != 0) revert MatrixTripped(state);
    if ((uint8(state >> 20) & 0xF) == STATUS_SHUTDOWN) revert SloTimeout();
    if (block.timestamp > uint32(state >> 25) + sloWindowSec) revert SloTimeout();
    // calldata pass — 無 SLOAD
    if (calldataWireDigest != bytes32(0) && calldataWireDigest != expectedWireDigest[msg.sender])
        revert WireDigestMismatch();
}
```

### R01–R20 鏈上化邊界（誠實評估）

| 可打包進 bitmap（Edge 推送） | 必須留 Edge-only |
|------------------------------|------------------|
| R01 Soil · R02 VineWrap · R07 Notional · R11 Dynamic SL · R17 Daily Loss · R20 Deadlock | R03 L2 Book 500ms · R04 PGATE 200ms · R08 Nonce heal · R09 Saga · R15 CCXT |

**離線簽章擴展：** 擴展 `SliverVineRiskOracle` 的 EIP-712 type：

```solidity
keccak256("MatrixReport(bytes32 defenseState,uint8 statusCode,uint256 timestamp)")
```

Edge `rootProtection()` / `severSigningChannel("R20")` 觸發時，離線 signer 原子更新 `defenseState`，Ingress gate 單 SLOAD 即 fail-closed。

**Gas 預估：** `gateMatrix` view ≈ **2,800–3,500 gas**（1 cold SLOAD + 3 bitwise AND + timestamp compare），相較現行雙 SLOAD + 分支樹 **節省 ~40%**。

---

## 升級 #3（效能 × 語意統一）：Stylus `citadel_gmx_invariants` 協處理器

**問題：** `stylus-probe` 存在 **雙 SSOT 分叉**：

- `stylus_core.rs`：6×`f64` + `risk-flags` 子集
- `lib.rs`：3×`U256` 固定點，門檻 `MIN_DEPTH_USD = 10_000`（Edge 主網 SSOT 為 **100,000**）

與 `src/wasm/soil_core.rs`（28+8 f64 · `protocolMask @ lane 27`）**未對齊**。

**目標：** 將 `gmx-risk-core.ts` + 輕量 soil eval 下沉至 **單一 Rust crate 雙目標編譯**（Wasm Edge + Stylus 42161），calldata `&[u8]` 零拷貝，Stylus 靜態 call **<1,000 gas**。

### Crate 結構

```text
citadel_invariants/               # 新建，取代 stylus-probe 單檔
├── src/
│   ├── lib.rs                    (~40 LOC)  feature gates
│   ├── gmx_invariants.rs         (~85 LOC)  鏡像 gmx-risk-core.ts
│   ├── soil_eval_u64.rs          (~70 LOC)  固定點，不用 f64
│   └── abi.rs                    (~55 LOC)  96-byte calldata layout
├── wasm/   → pkg/soil_core.wasm  (Edge)
└── stylus/ → SliverVineInvariantCoprocessor (42161)
```

### Calldata ABI（96 bytes，單 pass 解碼）

```text
offset  size  field
0       8     executionFee       u64
8       8     minMarketTokens    u64
16      8     expectedMarket     u64
24      2     slippageBps        u16
26      6     _pad
32      8     poolLongUsd        u64 (1e6 scale)
40      8     poolShortUsd       u64
48      8     spreadBps          u64  // soil lane
56      8     depthUsd           u64
64      8     slippageBpsSoil    u64
72      8     protocolMask       u64  // 對齊 risk-flags.ts
80      8     flagsOut           u64  // write-back
88      8     score              u64
```

### Stylus 入口（偽代碼）

```rust
#[public]
impl SliverVineInvariantCoprocessor {
    pub fn evaluate_packed(&self, input: Vec<u8>) -> Result<[u8; 32], Vec<u8>> {
        if input.len() != 96 { return Err(b"ABI_LEN".to_vec()); }
        let slice: &[u8] = &input;  // zero-copy
        let (gmx_ok, gmx_mask) = gmx_invariants::eval(slice);
        let (soil_ok, score) = soil_eval_u64::eval(slice);
        Ok(pack_result(gmx_ok && soil_ok, gmx_mask, score))
    }
}
```

### Gas 模型（對齊 `benchmark-stylus-opcode.ts`）

| 路徑 | 估算 gas |
|------|----------|
| Stylus `evaluate_packed`（gmx + 3-lane soil） | **~450–850** |
| 同等邏輯 naive Solidity + 6× cold SLOAD | **~34,000+** |
| 現行 `verifyAndConsume` median | **~28,043** |

**整合方式：** PolicyGuard V2 在 view 路徑末尾 `staticcall` Stylus coprocessor；若 Stylus 未部署則 fallback 至 `GmxRiskInvariantLib`（Solidity 路徑）。符合 `.cursorrules` **Edge SSOT + 鏈上 reinforcement plane** 鐵律。

### 對拍測試

```bash
# 現有
cargo test -p citadel_invariants
npx vitest run tests/core/gmx-risk-core.test.ts
npx vitest run tests/wasm/stylus-soil-wasm.test.ts
# 新增 cross-target golden
npx vitest run tests/wasm/stylus-gmx-parity.test.ts
```

---

## 實施路線圖（建議優先序）

```text
Phase A (2 週) — 安全閉環
  ├─ GmxRiskInvariantLib.sol + Forge fork tests
  ├─ PolicyGuardV2.checkAgentPolicyWithGmxWire
  └─ ZeroDev validateUserOp 接線

Phase B (1 週) — 防禦矩陣 SSOT
  ├─ SliverVineRiskOracleV2.defenseState (bytes32)
  ├─ GmxSoilMatrixSwitch.gateMatrix
  └─ Edge offline signer 推送 MatrixReport

Phase C (2 週) — Stylus 協處理器
  ├─ citadel_invariants crate（合併 stylus-probe + gmx-risk-core）
  ├─ Arbitrum One deploy + gas benchmark
  └─ PolicyGuard staticcall fallback 雙路徑
```

---

## 三項升級 ROI 對照

| # | 升級 | 解決的核心風險 | 鏈上 gas | 實施難度 |
|---|------|----------------|----------|----------|
| **1** | PolicyGuard × GMX Wire | Hot Key multicall 繞過 TS assert | ~6–8k (Solidity view) | **中** — 需 Kernel hook + pool snapshot attestation |
| **2** | GmxSoilMatrixSwitch bitmap | Oracle 多 SLOAD · R-trip 無鏈上 SSOT | ~3k (1 SLOAD) | **低-中** — 擴展現有 Oracle 簽章流 |
| **3** | Stylus citadel_invariants | SSOT 分叉 · 高 gas 純 Solidity 路徑 | **<1k** (Stylus) | **中-高** — Rust 雙目標 + 65k fuzz 對拍 |

---

## 審計結論

1. **單 SLOAD 驗證完整 R01–R20 在數學上不可行**（R03/R04/R08/R09/R15 需 sub-ms 外部感測器）；但 **可鏈上化的 6–8 個 Root + Oracle 狀態** 可壓入 `bytes32 defenseState`，配合 calldata wire digest，達成 **「1 SLOAD + 1 calldata pass」** 的實用目標。

2. **Stylus <1,000 gas 對 gmx-risk-core 純算式可達**；完整 28-lane `soil_core_eval` 建議維持 Edge Wasm SSOT，Stylus 僅做 **GMX wire + 3-lane soil + protocolMask** 強化平面。

3. **最高 ROI 是升級 #1**：`gmx-risk-core` 已下沉為 pure TS SSOT且有完整 Vitest，移植至 Solidity `GmxRiskInvariantLib` 成本最低、安全增益最大；PolicyGuard 目前是鏈上防線的 **明顯斷層**。

若需下一步，可從 Phase A 的 `GmxRiskInvariantLib.sol` + Forge 對拍 `gmx-risk-core.test.ts` 開始落地（預估 **~195 LOC Solidity + ~80 LOC 測試**）。

Phase A 已完成並推送至 `origin/main`（`7c1ac47`）。

## 變更摘要

- **`GmxRiskInvariantLib.sol`（83 LOC）**：鏡像 `gmx-risk-core.ts` — executionFee ≥ `1e15`、slippage floor、`pool imbalance`（3500 bps）；純 `view`/`pure`，零 SLOAD。
- **`GmxMulticallDecodeLib.sol`（97 LOC）**：零拷貝解析 `multicall(bytes[])`；強制 `sendWnt → sendTokens* → createDeposit/createWithdrawal` 腿序。
- **`SliverVineAgentPolicyGuardV2.sol`（62 LOC）**：繼承 V1，新增 `checkAgentPolicyWithGmxWire` / `validateAgentPolicyWithGmxWire`；違規 revert `GmxInvariantTripped(errMask)`。
- **`PolicyGuardGmxWire.t.sol`** + fixture `gmx-gm-deposit-multicall.json`：9/9 Forge 測試通過。

## 測試結果

- `pnpm exec tsc --noEmit` — clean
- `pnpm vitest run` — **212 files / 947 PASS**
- `forge test --match-contract PolicyGuardGmxWireTest` — **9/9 PASS**

## errMask 位元

| 位元 | 含義 |
|------|------|
| `1<<0` | executionFee 低於 floor |
| `1<<1` | minMarketTokens slippage 違規 |
| `1<<2/3` | withdraw minLong/minShort 違規 |
| `1<<4` | pool imbalance 違規 |