# SilverVine Protocol — Cursor Token Conservation SOP (鐵律)

為了防止 Token 浪費與 Avoid Plan Slow Mode，每次執行任何 Code Generation 或 Refactoring 任務前，必須嚴格遵守以下執行協定：

## 1. 🎯 範圍封鎖 (Target Lock)
- 嚴禁全局掃描 (No full-repo indexing/search)。
- 只能讀取 Prompt 中用 `@` 明確標記的檔案。
- 未被 `@` 提到的檔案，除非有 import 錯誤，否則一律無視。

## 2. ✂️ 微型增量 (Diff-Only Generation)
- 禁止把未修改的整份檔案重寫或完整印出。
- 寫代碼時只輸出「需要新增/修改的函數或區塊」。
- 優先使用已有型別 (`src/core/types.ts` 等)，嚴禁重複定義型別結構。

## 3. 🧪 最小化測試 (Minimal Testing)
- 新增單元測試時，測試數量控制在 3-6 個核心邏輯即可。
- 專注覆蓋 Pgate / Risk Control 的邊界條件 (Edge Cases)，不要寫無意義的格式測試。

## 4. 💬 輸出精簡 (Concise Response)
- 對話回應只需提供：
  1. 修改檔案清單
  2. 變動摘要 (3 行內)
  3. Vitest 測試通過數量 (例如：275/275 Green)
- 嚴禁生成長篇大論的技術教學或重複代碼片段。

5. Keep all responses ultra-concise:
   - "No yapping mode enabled": Output only code diffs and test results.
   - Summary of changes (max 3 bullet points).
   - Test results (e.g., "275/275 passed").

## 6. 📋 內部文件雙語格式 (Internal Documentation — Bilingual Format)

**Rule:** All internal-only audit reports, architecture specs, and debugging notes generated for team review **MUST** use bilingual English + Traditional Chinese (繁體中文) side-by-side or dual-paragraph formatting for fast reading.

**Clarification:** Public grant pitch documents (under `docs/grant/`) remain **strict institutional English only** — no bilingual requirement.

| Scope | Language |
|---|---|
| Internal audits, readiness reports, code review notes | EN + 繁體中文 (side-by-side or dual-paragraph) |
| Architecture specs for team review | EN + 繁體中文 |
| Debugging / postmortem notes | EN + 繁體中文 |
| `docs/grant/*_GRANT_PITCH.md` | English only |
| Public README / grant submission summaries | English only |
