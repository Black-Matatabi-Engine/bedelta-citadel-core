# 內部戰略備忘 — Grant 後商業化與 Q&A 防禦手冊

| 欄位 | 值 |
|------|-----|
| **分類** | **內部專用** · 禁止放入 Buildathon 公開 submission |
| **用途** | 評委 Q&A · VC pitch · Grant 後 GTM · Turbo RPC 商業邊界 |
| **Buildathon SSOT** | [SUBMISSION.md](../../00_ARB_Buildathon/SUBMISSION.md) · [JUDGE_BRIEF.md](../../../JUDGE_BRIEF.md) |
| **物理 SSOT** | **244 test files \| 1125 PASS** · `pnpm audit:sepsb` · Gate [0xb174…8BF1](https://arbiscan.io/address/0xb174118bc0b84e8d6d59eef2339e29bf7fcf8bf1) |
| **英文版** | [COMMERCIAL_STRATEGY_AND_QA_PLAYBOOK.md](./COMMERCIAL_STRATEGY_AND_QA_PLAYBOOK.md) |

---

## 1. 執行定位與身份邊界

| 階段 | 核心身份 | 對外敘事 | 焦點 |
|------|----------|----------|------|
| **Buildathon（10/01 前）** | 亞毫秒 0-Gas **Pre-Consensus Intent Firewall** | Module A: ExoMesh · Module B: Sanctuary | 可驗證安全 · Wasm fail-closed · SEPSB corpus · 鏈上錨點 |
| **Grant 後（商業 GTM）** | **ExoMesh Dual-Engine RPC**（Brake + Turbo） | Infra-first B2B SaaS · Quant agent 執行通道 | MRR · private relay · API RPS · **唔混入 submission SSOT** |

**一句邊界：** Buildathon 賣 **可驗證安全 primitive**；Grant 後先賣 **cleared-intent transport SKU**。

---

## 2. 願景前提 — ExoMesh Turbo RPC

### 2.1 市場缺口

| 層 | 現況 | 同 ExoMesh 嘅缺口 |
|----|------|-------------------|
| **Public RPC**（Alchemy / Infura） | JSON-RPC 轉發 | 唔做 pre-sign mandate · 唔做 AI intent predicate |
| **MEV Private Relay**（Flashbots / bloXroute） | 防 sandwich · 私有 bundle | 假設 payload **已簽好** · 唔驗 toxic calldata / retry storm |
| **UI Simulator**（Blockaid 等） | 200–800ms 遠端 simulation | 綁 human popup · API agent 高頻 loop 下 **簽名前熔斷** 唔係主路徑 |

**精準 gap 表述（對外可用）：**

> 市場上未有以 **EIP-1193+ 簽名前 hook** 為 SSOT、**Edge/Wasm sub-ms predicate**、**0-Gas fail-closed**，再同 **private relay pass-fast** 合成 **單一 Dual-Engine SKU** 嘅主流供應商。

**謙抑位：** Safe module · AA session key · agent framework 有 partial policy — 但多數係 post-policy 或鏈上 module，唔係 pre-consensus severance + 28-lane soil 一體化。

### 2.2 Dual-Engine 模型

```text
[ Agent / dApp Intent ]
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  EIP-1193+ SINGLE GUARD PLANE (withRetailGuardProvider) │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
 [ FAIL_CLOSED: BRAKE ]            [ PASS_FAST: TURBO ]
 Sub-50µs Wasm deadlock             <5µs routing overhead (sync prep)
 0-Gas severance (no broadcast)     Private relay / preconf gateway
 severSigningChannel()              Dynamic maxPriorityFeePerGas (optional)
```

| 引擎 | 買家 | 價值 |
|------|------|------|
| **Brake** | Risk Officer · Treasury · Agent infra | FN→資金損失 · 0-Gas reject before sign |
| **Turbo** | Quant desk · HFT agent | Pass latency · private inclusion · 只對 **已通過 predicate** 嘅 intent 加速 |

**商業邏輯：** Security 賣「冇發生嘅損失」；Performance 賣「即刻發生嘅執行」——但 **Turbo 唔可以脫離 Brake policy**，否則變成幫 toxic tx 加速。

---

## 3. Q&A 手冊 — 「Brake + Turbo」變現敘事

### 問：「SliverVine 點 monetize，又唔使收離譜 B2B governance 費？」

**標準答法（約 90 秒）：**

> **「SliverVine 透過 Dual-Engine Architecture 變現，共用單一 EIP-1193+ Pre-Sign Guard Plane（`withRetailGuardProvider`）：**
>
> 1. **Fail-Closed Brake（風險層）** — Sub-50µs Wasm 0-Gas 熔斷（`checkSoilResistance()`）。喺 release signature **之前** 截停 LLM retry storm、prompt-injection approve、oracle-lag trap。
>
> 2. **Pass-Fast Turbo（性能層）** — Intent 通過 validation 後，verified intent 進入微秒級 private forwarding lane（<5µs sync routing overhead），可選 dynamic priority fee injection — **唔係** public mempool 盲轉發。
>
> **商業邏輯：** Risk Officer 買 **Brake**；Quant Trader 買 **Turbo**。Pass-Fast transport 用 B2B SaaS tier 同 metered API key 收費；open-source 安全核心免費換生態採用。」

**內部變現分拆：**

- **免費 Brake** = 獲客 · Grant 敘事 · agent 白嫖當廣告  
- **付費 Turbo** = relay seat · RPS · priority-fee API · **需 live partner 後先寫入公開 spec**

---

## 4. 結構性護城河 — 競品點解難以拼接

| 維度 | Legacy RPC | MEV Relay | UI Simulator | **ExoMesh Dual-Engine** |
|------|------------|-----------|--------------|-------------------------|
| **Pre-sign mandate** | ❌ 盲轉發 | ❌ 簽後 bundle | ⚠️ 事後 simulation 警告 | ✅ Sub-ms Edge bitmask predicates |
| **0-Gas severance** | ❌ Revert 燒 gas | ❌ Revert 燒 gas | ❌ N/A | ✅ `severSigningChannel()` · no broadcast |
| **Pass-fast transport** | ❌ Public queue | ✅ Private bundle | ❌ N/A | ✅ Post-validation private forward |
| **Trust boundary** | 轉發分裂 | 轉發分裂 | Simulation 分裂 | ✅ **Single guard plane**（policy + relay 同一決策面） |

**Moat 完整性：** Simulator + MEV relay 拼接會疊 **100–300ms** latency；ExoMesh moat 在 **Brake 評估同 Turbo 路由決策共用同一 local Wasm / Isolate 記憶空間**。

**根本論點（Module A SSOT）：**

> Simulation 答「上 chain 會點」；Wallet Guard 答「喺 mandate 下允唔允許簽」——reflex arc，唔係事後 audit。

→ 詳見 [05_ARCHITECTURE_AND_MOAT.md](../../04_sdk_and_integration/05_ARCHITECTURE_AND_MOAT.md)

---

## 5. 產品身份分拆 — 點解 Buildathon 唔應主打 Turbo RPC SaaS

| 維度 | Buildathon / Grant | Grant 後 Turbo RPC |
|------|-------------------|---------------------|
| **評委要 verify** | `pnpm demo:gmx -- --trip` · SEPSB · Gate anchors | Relay SLA · inclusion rate · uptime |
| **責任模型** | 「我 block 有毒 intent」 | 「我幫你送 tx」→ operator liability |
| **Freeze** | Phase-4 guard semantics 鎖死 | Transport + fee market 快速迭代 |
| **Honesty** | 88%/12% · execution ≠ guard | 需 signed relay partner + live metrics |

**禁止（10/01 前公開文件）：**

- 宣稱 live Turbo Relay SLA / inclusion guarantee  
- 把 SEPSB fixture TPR/FPR 讀成 mainnet 攔截率或 live PnL  
- 把 Module B Robinhood 敘事寫成「已接入 Robinhood App 產品」

**允許（Grant 後商業 deck）：**

- ExoMesh Turbo RPC 獨立 GTM · 共享 guard kernel  
- 定價 tier · design partner · relay 合作方（簽約後）

---

## 6. SEPSB TPR / FPR — 內部披露口徑

| 指標 | 定義 | SSOT |
|------|------|------|
| **TPR** | toxic corpus 中被 **block** 嘅比例 | 16/16 → 100% |
| **FPR** | benign corpus 中被 **誤 block** 嘅比例 | 0/15 → 0% |
| **Corpus** | `tests/p0/corpus/toxic-set.json` + `benign-set.json` | **31 cases** · 唔係 live 流量 |

**跑法：** `pnpm audit:sepsb` → [SEPSB_BENCHMARK_SSOT.json](../../audit/SEPSB_BENCHMARK_SSOT.json)

**對外誠實句：**

> SEPSB = deterministic regression benchmark · **唔係** mainnet 年度 attack 次數 · **唔係** 每月 live intercept SSOT。

**常見誤讀：** 「16 toxic = 一年只會遇到 16 次 attack」→ **錯**。16 = 場景 **類型** 數；live 頻率視 agent 量同市況，可能每月 0 到數百次 **不同** trip 事件。

---

## 7. 運營邊界與披露原則

### 7.1 嚴格解耦

- Buildathon 評分：**只**引用 Module A/B 可驗證 proof  
- Turbo 敘事：**只**出現於 internal pitch · post-grant deck · 客戶 NDA  
- `EXOMESH_PRODUCTION_SCENARIO_CATALOG.md` 若寫 TPR/FPR 來自 `pnpm test -- --run` → **內部知悉**：物理來源係 `pnpm audit:sepsb`

### 7.2 一魚兩吃（正確拆法）

| 可以一魚兩吃 | 唔可以一魚兩吃 |
|--------------|----------------|
| 同一 kernel · 多份 narrative（Buildathon + Grant + VC） | 獎金 + 採購 + MRR 同一日入帳 |
| Module A 文檔 + internal Turbo deck 共用 guard plane | 把 Turbo 寫進 SUBMISSION 當已 production |
| SEPSB + Dune 雙 dashboard 分軌 | 把 demo telemetry 當 live PnL |

### 7.3 Grant 後 GTM 草圖（非 commitment）

| Tier | 表面 | 指示定價 |
|------|------|----------|
| **Public** | Brake OSS · 5 RPS gateway | $0 |
| **Pro** | Turbo relay · seat · KV API | $10–$199/月 |
| **Enterprise** | Custom policy pack · SLA · dedicated relay | $499–$1,999/月 |

---

## 8. 內部 FAQ — 快速反擊

| 問題 | 內部答案 |
|------|----------|
| 同 Flashbots 有咩分別？ | Flashbots 保 inclusion · 我哋保 **簽名前** intent 合規；Turbo 只 forward **PASS** intent |
| 同 Blockaid 有咩分別？ | Blockaid 事後 simulation · 我哋 pre-consensus mandate · 0-Gas reject |
| 點解唔喺 Buildathon 講 Turbo？ | 評委驗 safety primitive · Turbo = transport operator · 兩種產品身份 |
| Robinhood product 可能嗎？ | Module B = egress policy adapter · **唔係** Robinhood App 內置功能 · 採購以年計 |
| 深化邊條 venue？ | Grant 後：**Option 1 GMX 深井**（on-chain rebate）· **Option 2 Pendle Shield**（B2B policy）· **Option 3 五核共用 policy pack** |

---

*SilverVine Labs · Internal OpSec · 禁止對外原文發布 · 更新：2026-09-15*
