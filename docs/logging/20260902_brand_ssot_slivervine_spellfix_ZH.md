> [ARCHIVED LOG] Historical terminology retained for audit trail.

# Brand SSOT — SliverVine Protocol 拼寫修正（2026-09-02）

> **中文參考譯本** · 英文 SSOT：[`20260902_brand_ssot_slivervine_spellfix.md`](./20260902_brand_ssot_slivervine_spellfix.md)  
> **Vitest SSOT：** **840 passed tests** · Worker **70.16 KiB** gzip · **7 protocols** · **4 frameworks** · Milestone 1 PRs

| 欄位      | 值                                                                |
| ---------- | -------------------------------------------------------------------- |
| **分支** | `v1.0_push_BDLW`                                                     |
| **範圍**  | 全域 `.md` / `.ts` / `.tsx` / `.sol` / `.json` / scripts           |
| **規則**   | 協議 = **SliverVine** · 實體 = **SilverVine Labs**（不變） |

## 替換項

- `SilverVine Protocol` → `SliverVine Protocol`
- `SilverVine Citadel Protocol` → `SliverVine Citadel Protocol`
- `SilverVine Citadel` → `SliverVine Citadel`
- 獨立協議名 `SilverVine` → `SliverVine`（29 個檔案）

## 僅保留的向後相容別名（已棄用）

- `resolveSilverVineRiskOracleAddress` / `readSilverVineRiskOracleState` — `risk-oracle-gate.ts` 中的 re-export 別名
- `SILVERVINE_RISK_ORACLE_ABI` / `SILVERVINE_RISK_ORACLE_ADDRESS` — env/ABI 棄用別名
- `SILVERVINE_HUD_DAPP_NODE_URL` / `SILVERVINE_SAFETY_BPS` / `SAFETY_RESERVE_BPS` — 常數別名

## API / 常數後續修正（2026-09-02 follow-up）

- `zerodev-kernel-adapter.ts` — 主要 import `resolveSliverVine*` / `readSliverVine*`
- `grant-ui-ssot.ts` — `SLIVERVINE_HUD_DAPP_NODE_URL` 為主
- `fee-calculator.ts` — `SLIVERVINE_SAFETY_BPS` 為主
- HUD 字串 — `[SLIVERVINE CITADEL HUD]` · `SLIVERVINE · SANTENMOKU SAFETY HUD` · `[SLIVERVINE DEFENSE]`

## 驗證

- `pnpm test` — **840 passed tests**
- 殘留 `SilverVine` grep — 僅實體引用
