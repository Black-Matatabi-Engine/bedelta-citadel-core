# Grant Audit Cohort 1 Matrix

> **中文參考譯本** · 英文 SSOT：[`20260814-GRANT-AUDIT-COHORT1-MATRIX.md`](./20260814-GRANT-AUDIT-COHORT1-MATRIX.md)  
> **Vitest SSOT：** **840 passed tests** · Worker **70.16 KiB** gzip · **7 protocols** · **4 frameworks** · Milestone 1 PRs

- **生成時間**：2026-08-22T03:53:58.796Z
- **Git**：30be5e7d671b6a1b5b2e1410b3ba82cf87728d5b
- **模式**：LIVE
- **USE_ZERODEV_AA**：true

## 協議 SSOT 概覽

SliverVine Protocol (BeDelta-Living-Water) 是 Arbitrum One 上 GMX v2 GM Pools 的預執行風險網關。Fail-closed 由設計保證：oracle lag > 30s、sequencer grace 違規、土壤阻力 trip 會在 router dispatch 之前封鎖 payload 生成。即時遙測：`GET /api/grant-audit`。

## 三支柱模組化架構

| 支柱 | 模組 | 範圍 |
| --- | --- | --- |
| **支柱 1 — Core Citadel** | zerodev-aa-gate, risk-control | 土壤阻力、gas soft-limit、sequencer/oracle 守衛 |
| **支柱 2 — Robinhood Yield** | r-chain-yield-stub | RWA/Idle yield router stub（chain 46630） |
| **支柱 3 — Agent Gate** | agent-citadel-guard | EIP-712 intent shield + Deadman Switch |

## SliverVine vs. Arbitrum Cohort 1 獲獎者

| 維度 | Carbon | LayerV | T3tris | SliverVine |
| --- | --- | --- | --- | --- |
| 預執行 Fail-Closed Gate | Partial | Partial | Partial | Full（soil + oracle + sequencer） |
| GMX v2 GM Pool Native | — | — | — | Yes（uiFee + referral SSOT） |
| ZeroDev AA Paymaster Sponsored | — | — | — | Yes（One/Nova/Sepolia/R-Chain） |
| Agent EIP-712 Intent Shield | — | — | — | Yes（Deadman Switch） |
| Multi-Chain Failover | — | Limited | — | Yes（Nova/Sepolia/R-Chain） |
| 可驗證測試矩陣 | — | — | — | 836 Vitest + chaos spec |
| Live JSON Telemetry | — | — | — | /api/grant-audit |

## Arbitrum Sepolia 線上 Tx 證明

| 欄位 | 值 |
| --- | --- |
| Live Tx Hash | 0x8c4489f9a0e61a2b7ad4d1001107e2dcd63cd2f79cb1e676865bbef613036dc6 |
| Cohort Prefix Match（0x755e19b4…） | NO（使用最新 proof anchor） |
| Arbiscan | https://sepolia.arbiscan.io/tx/0x8c4489f9a0e61a2b7ad4d1001107e2dcd63cd2f79cb1e676865bbef613036dc6 |

## ZeroDev AA 多鏈驗證

| Chain | ID | Bundler | Sponsored | Paymaster | RPC |
| --- | --- | --- | --- | --- | --- |
| Arbitrum One | 42161 | UNREACHABLE | YES | — | — |
| Arbitrum Nova | 42170 | UNREACHABLE | YES | — | — |
| Arbitrum Sepolia | 421614 | UNREACHABLE | YES | — | — |
| Robinhood Testnet | 46630 | UNREACHABLE | YES | ATTACHED | https://rpc.zerodev.app/api/v3/e93db466-d580-4e15-9cc1-ce50f1541ca2/chain/46630 |

---
*由 `scripts/generate-grant-audit-matrix.ts` 自動生成*
