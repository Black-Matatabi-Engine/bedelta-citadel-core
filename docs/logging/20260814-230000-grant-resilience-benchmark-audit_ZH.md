> [ARCHIVED LOG] Historical terminology retained for audit trail.

# Grant 韌性基準審計

> **中文參考譯本** · 英文 SSOT：[`20260814-230000-grant-resilience-benchmark-audit.md`](./20260814-230000-grant-resilience-benchmark-audit.md)  
> **Vitest SSOT：** **840 passed tests** · Worker **70.16 KiB** gzip · **7 protocols** · **4 frameworks** · Milestone 1 PRs

**時間戳：** 2026-08-19T11:34:52.415Z  
**協議：** Santenmoku v0.9  
**Harness：** `scripts/grant-advanced-resilience-benchmark.ts`

## 結果

| 測試 | 狀態 |
|------|--------|
| TOCTOU Async Consistency（GMX v2 2-Phase） | PASS |
| Multi-RPC Failover Resilience | PASS |
| Benchmark Latency & Memory Guard | PASS |

## 關鍵指標

- 網關評估平均延遲：**0.0003ms**（SLO < 1.0ms）
- RPC failover 最大切換：**40.78ms**（SLO < 50ms）
- Citadel 風險門 false negatives：**0**
- Post-GC heap delta：**0.3788 MB**（gc=true）
- 基準迭代次數：**10000**

**總體：** ALL PASS
