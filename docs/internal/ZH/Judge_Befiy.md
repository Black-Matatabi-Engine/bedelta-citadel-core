# SliverVine Protocol (BeΔ) — 評審 30 秒極速簡報 (JUDGE_BRIEF_zh.md)

> 📌 **系統指標 SSOT**: 已透過 [`docs/audit/SYSTEM_METRICS_SSOT.json`](docs/audit/SYSTEM_METRICS_SSOT.json) 物理驗證
> **當前發布版本**: `v1.0 · BeDelta Living Water v1.0 (SSRC)` · **狀態**: Phase-4 Codebase Freeze 活躍 (243 files / 1123 PASS)

---

## ⚡ 3 秒核心概念 (神經形態安全架構)

**大腦 (Cerebrum) 對比 小腦 (Cerebellum) — SliverVine ExoMesh 是自動化 AI Agent 與零售用戶的無條件防禦反射弧。**

| 比較維度 | 大腦 (LLM / Agent 決策迴圈) | ExoMesh 防禦反射弧 (小腦) |
|---|---|---|
| **延遲 (Latency)** | **~1.0秒 – 10.0秒** (思維鏈與工具調用) | **E2E p50 ~106µs** (ALLOW) · **p50 ~15µs 反射核心** (FAIL_CLOSED) |
| **特性** | 非確定性 · 容易產生幻覺 | **100% 確定性** · **0-Gas 閃電熔斷 (FAIL-CLOSED)** |
| **面對威脅時** | 無法攔截跨鏈 drift 或隱含夾子攻擊 | **p50 ~15µs 內**瞬間切斷 [EIP-712](https://eips.ethereum.org/EIPS/eip-712) 簽名通道 · **$0 燃氣費** |

---

### 🎨 Text-UI — 零燃氣費預共識反射黃金路徑 (Zero-Gas Pre-Consensus Reflex Happy Path)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  SLIVERVINE EXOMESH — 4 核心場景與零燃氣反射黃金路徑                         │
│  SSOT: 243 測試文件 | 1123 通過 (100%)  ·  Phase-4 程式碼庫冷凍中            │
└──────────────────────────────────────────────────────────────────────────────┘

  [ 用戶 / AI AGENT ]  ──►  (發起廣播交易 / x402 意圖* / DApp 請求)
           │
           ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  EIP-1193+ 客戶端本地攔截  (本地 Wrap · 0-Gas 簽名前攔截) [Module A]   │
  └──────────────────────────────────────────────────────────────────────────┘
           │
           ▼  (V8 / Wasm 隔離區 · 零內存分配熱路徑 · <50µs 土壤阻力上限)
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  預共識反射核心 checkSoilResistance()  (pkg/soil_core.wasm) [Module A]   │
  └──────────────────────────────────────────────────────────────────────────┘
           │
     ┌─────┴──────────┬────────────────┬─────────────────┐
     ▼                ▼                ▼                 ▼
  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐
  │ [A] 零售   │  │ [B] 5核心  │  │ [C] 重試風  │  │ [D] 跨鏈與   │
  │ Permit2    │  │ 場館漂移   │  │ 暴 / 電路   │  │ 金庫護送     │
  │ 授權中毒   │  │ 與防護折讓 │  │ 斷路器      │  │ (Sanctuary)  │
  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘
        │               │               │                │
        └───────┬───────┴───────┬───────┴────────┬───────┘
                │               │                │
                └───────────────┼────────────────┘
                                ▼
                   ( 判決引擎 Verdict Engine )
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
     ┌─────────────────┐   ┌──────────────────┐
     │ FAIL_CLOSED     │   │ HAPPY PATH       │
     │ 毒性滑點 / 釣魚 │   │ 土壤健康 ALLOW   │
     │ 授權 / 預言機滯後│   │ 釋放簽名 ➔ L2    │
     │ 0-Gas 消耗      │   │ / Gate 憑證上鏈  │
     └─────────────────┘   └──────────────────┘

  * x402 = 正交的 HTTP 402 支付分派標準（冷凍期內未實現）。同款 Wallet Wrap 照常攔截簽名。
```

### 🎨 Text-UI — 增強 EIP/ERC 安全超集流程

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  SLIVERVINE 增強 EIP/ERC 工作流與安全超集                                    │
│  標準規格  →  0-Gas 預共識安全原語（非競品支付軌道）                          │
└──────────────────────────────────────────────────────────────────────────────┘

 [ 1. EIP-1193 / EIP-5792 / EIP-6963 ]  ──►  標準錢包與批次調用
           │
           ▼  ★ 【Module A: ExoMesh 增強】
           │  · 擴展為 Pre-Sign Local Guard（本地 Wrap · 0-Gas）
           │  · 戰績：35/35 · 強制攔截 Permit2 釣魚與批次內毒性調用
           │
 ──────────────────────────────────────────────────────────────────────────────
 [ 2. ERC-7540 (Module B: Sanctuary) ]  ──►  標準異步金庫提案
           │
           ▼  ★ 【Module B: Sanctuary 增強】
           │  · 選擇器級異步金庫護送 (Async Vault Escort)
           │  · 防禦 pending→claimable 窗口的操作員劫持與資本漂移
           │
 ──────────────────────────────────────────────────────────────────────────────
 [ 3. ERC-7683 (Cross-Chain Intent) ]  ──►  標準跨鏈意圖與 Solver 格式
           │
           ▼  ★ 【SliverVine 增強 · 正交於 settlement】
           │  · Pre-Consensus Solver 預檢資本鎖定 (IN_FLIGHT→SETTLED)
           │  · 在跨鏈信封進入 Solver 前清洗 MEV 與滑點越權
           │
 ──────────────────────────────────────────────────────────────────────────────
 [ 4. ERC-7579 (Modular Accounts) ]  ──►  標準模組化智慧帳戶
           │
           ▼  ★ 【SliverVine 增強】
           │  · Edge Isomorphic Pre-Execution Hook Policy
           │  · 錨定 PolicyGuardV2 與 RiskOracle 合規前置校驗
           │
 ──────────────────────────────────────────────────────────────────────────────
 [ 5. EIP-712 & Permit2 / ERC-2612 ]  ──►  標準數位簽名與授權
           │
           ▼  ★ 【SliverVine 增強】
           │  · Consume-once 數位簽名 + Gate 審計重放拒絕
           │  · Arbitrum One SliverVineGate 觸發 Replayed() 熔斷
           │
 ──────────────────────────────────────────────────────────────────────────────
 [ 6. EIP-7702 / ERC-7710 ]  ──►  帳戶升級與意圖過期
           │
           ▼  ★ 【SliverVine 增強】
           │  · Intent Expiry & Root Protection（意圖過期與物理死鎖）
           │  · R17 日損或 R20 死鎖時切斷簽名管道
```

| 編號 | 模組 | 核心場景 | 攔截什麼 | 證明 |
|------|------|----------|----------|------|
| **A** | Module A ExoMesh | 零售 / Permit2 中毒 | 無限授權 · Permit2 · EIP-712 域漂移 · EIP-5792 毒性批次 | `retail-guard-provider.test.ts` 35/35 · `eip5792-send-calls.test.ts` 3/3 |
| **B** | Module A ExoMesh | 5 核心場館漂移與折讓 | GMX 衝擊 · Pendle 預言機 · USD.ai 脫錨 · HL 點差 · Variational 過期報價（close/reduce 不誤封） | `pnpm demo:gmx -- --trip` · venue soil tests |
| **C** | Module A ExoMesh | 重試風暴 / 斷路器 | 第 4 次快提切斷 · 5 RPS · 動態 Max SL · R20 | `root-protection.test.ts` · `edge-security.test.ts` |
| **D** | Module B Sanctuary | 金庫與跨鏈護送 | ERC-7540 操作員劫持 · ERC-7683 solver MEV · inbound AML | `erc7540-async-escort.test.ts` · `across-ingress-bridge.test.ts` |

```bash
npx vitest run tests/sdk/retail-guard-provider.test.ts
pnpm demo:gmx -- --trip
pnpm test -- --run
```

*SilverVine Labs · Internal ZH mirror · 243 / 1123 PASS · Phase-4 freeze*

