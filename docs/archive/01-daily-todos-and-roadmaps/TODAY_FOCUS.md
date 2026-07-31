# 📋 SilverVine Protocol 每日晨間 Audit & 解體 SOP (10-Min Routine)

> **Javier 鐵血風控 3 大死規則（每日必讀錨點）：**
> 1. **「1% + $100」動態止損**：`Dynamic Max SL = Account Balance * 1% + $100`，舊版固定 $50 規則已廢除。
> 2. **無結構不開倉**：未達強地基/強天花板絕不開倉，嚴防 FOMO 與過度交易。
> 3. ** Circuit Breakers 焊死**：`checkSoilResistance()` 與 `rootProtection()` 為物理死鎖，觸發時切斷 Hot Key 簽名管道。

---

## ⏱️ 晨間 10 分鐘執行流程

### [08:30 - 08:35] 階段一： Terminal 快速壓測與型別對齊
1. 執行 `pnpm run typecheck`（驗證零 TS Error）
2. 執行 `pnpm test`（驗證 583+ 測試全綠勾）

### [08:35 - 08:38] 階段二：風控硬鎖與 Deprecated 毒素掃描
1. 全專案搜尋 `@deprecated` (檢查是否有過時介面被調用)
2. 正則搜尋 `systemState\.[a-zA-Z0-9_]+\s*=(?!=)` (檢查有無 Store 外的非法 Mutation)
3. 全專案搜尋 `computeEffectiveMaxSlUSD` (確保動態止損 100% 覆蓋)

### [08:38 - 08:40] 階段三：複製 Prompt 給 Cursor Agent 執行淨化
1. 將下方的 **【Agent 一鍵淨化 Prompt】** 貼給 Cursor Composer / Agent mode。
2. 驗證 `pnpm test` 通過，確認無爆單，安心啟動 UI/UX 細琢！

---

## 🤖 Cursor Agent 一鍵淨化 Prompt (Copy & Paste Template)

```text
@Codebase
Please refactor all deprecated functions and constants in `src/` to align with our purified SilverVine Protocol (v0.8 Santenmoku) standards.

### Fix Tasks:
1. **Dynamic Max SL Refactoring**:
   - In `src/services/criEngine.ts`, `src/services/dondonEngine.ts`, `src/services/risk-control.ts`, and `src/services/systemState.ts`:
   - Replace all usages and imports of deprecated `calculateDynamicMaxSL` and `computedDynamicMaxSlUSD` with the canonical `computeEffectiveMaxSlUSD` (from `./effective-max-sl` or `./risk-control`).

2. **CRI Constants Refactoring**:
   - In `src/mocks/mock-analytics-generator.ts`, `src/services/criEngine.ts`, and `src/services/systemState.ts`:
   - Replace all imported deprecated constants `CRI_MAX` and `CRI_MIN` with `HEALTH_CRI_MAX` and `HEALTH_CRI_MIN` (from `../config/constants`).

3. **Protection Function Refactoring**:
   - In `src/backtest/backtest-engine.ts` and related services:
   - Replace deprecated `rootProtection` calls with `vineWrapProtection`.

4. **Clean Exports**:
   - Remove deprecated wrapper function definitions in `src/services/risk-control.ts` and `src/services/systemState.ts` once all internal callers are updated.

### Execution Constraints:
- Do NOT alter any active risk logic or core formula (`Dynamic Max SL = Account Balance * 1% + $100`).
- Ensure all imports are correctly resolved.
- Run `pnpm run typecheck` and `pnpm test` upon completion to verify all 583+ tests remain green.