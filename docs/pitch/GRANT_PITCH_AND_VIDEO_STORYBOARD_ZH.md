# SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) — HackQuest 雙影片分鏡腳本

> **中文參考譯本** · 英文 SSOT：[`GRANT_PITCH_AND_VIDEO_STORYBOARD.md`](./GRANT_PITCH_AND_VIDEO_STORYBOARD.md)  
> **Vitest SSOT：** **836 tests** · Worker **69.32 KiB** gzip · **7 protocols** · **4 frameworks** · Milestone 1 PRs

| 欄位 | 值 |
|-------|-------|
| **文檔** | Grant Pitch & Dual-Video Storyboard（HackQuest / Arbitrum Open House Singapore） |
| **版本** | **v1.1.0** |
| **分類** | Public Grant Pitch · Submission-form video scripts |
| **分支基線** | `V1.0_b4_Buildaton_Submisson` |
| **實體** | SilverVine Labs |
| **協議** | SliverVine Protocol / SliverVine Citadel |
| **身份** | SliverVine Protocol (BeDelta Living Water v1.0 / BeΔ) 是面向 Arbitrum 上 AI Agent 的亞毫秒級 0-Gas 預廣播安全堡壘與風險導航器。 |
| **基線** | Vitest **836 tests** · Wasm **p50 ~106 µs** · chaos **255/255** |
| **線上證明** | [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz) · `GET /api/grant-audit` · [Dune telemetry](https://dune.com/silvervinelabs/silvervine-citadel-telemetry) |
| **[ERC-8196](https://eips.ethereum.org/EIPS/eip-8196)** | [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196)（Emerging Draft Sub-ms Policy Gate）— **非 finalized standard** |
| **相關 SSOT** | [`VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md) · [`01_TECHNICAL_SPECIFICATION.md`](../architecture/01_TECHNICAL_SPECIFICATION.md) · [`01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](../audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) |

> **HackQuest 表單映射：** **SECTION A** = Pitch Video（180s）。**SECTION B** = Demo Video（120s）。勿合併兩個檔案。勿保證 APY。勿聲稱 Stylus 已主網部署。Monte Carlo `$9.88M` 為 **10,000-run nominal simulated LP protection**，非 live TVL。

---

## 核心敘事 — DEX 轉運站的暴雨

AI Agent 抵達 Arbitrum DEX **轉運站**（GMX v2 GM + session-key hedge）。**暴雨**來襲：3σ crash、MEV sandwich，或 prompt-injection 試圖將 signed UserOp 推入 mempool。

| 選項 | 隱喻 | 結果 | 會計 |
|--------|----------|---------|------------|
| **A — Fail-Open** | 無傘衝進暴雨 | 淋濕生病 — 清算、sandwich fill | `lostUsd > 0` · `capitalLossUsd > 0` |
| **B — Fail-Slow** | 躲在**靜態避難所**（timelock / committee） | 錯過每班車；資本困在雨中 | Governance delay · paralyzed NAV |
| **C — SliverVine Citadel Shield** | **Sub-ms 自動盾牌** + 預廣播 severance | 在站內保持 **100% 乾燥** | **`lostUsd ≡ 0`** · soil fuse **p50 ~106µs** `checkSoilResistance()` |

**VO 鎖定（隱喻誠實）：** "`lostUsd ≡ 0`" 為 **in-flight / honest-label invariant**（pending capital 永不作為損失核銷，亦永不視為可部署）。**非**零市場 PnL 承諾。

```text
 RAINSTORM (3σ / MEV / prompt injection)
 │
 ┌─────────┼─────────┐
 ▼         ▼         ▼
 Option A  Option B  Option C — SliverVine Citadel
 Fail-Open Fail-Slow 0-Gas pre-broadcast shield
 SOAKED    STUCK     DRY · lostUsd≡0 · 106µs Wasm
```

---

## SECTION A — Pitch Video Script（180s / 3 分鐘商業與架構）

**表單欄位檔案：** Pitch Video · 1920×1080 · HUD + architecture cards · calm institutional VO。

### A.1 `0s–30s` — 暴雨隱喻與 AI Agent 預廣播死亡窗口

| 時間 | 視覺 | VO / on-screen | Anchor |
|------|--------|----------------|--------|
| **0:00–0:08** | 廣角：DEX 轉運站 · Agent 圖示排隊 · 天空變 3σ 紅 | *"AI Agent 不等待委員會。它們抵達 DEX 站 — 暴雨已在這裡。"* | HUD volatility banner |
| **0:08–0:16** | 暴雨標籤：**3σ crash** · **MEV sandwich** · **prompt injection** | *"死亡窗口是 **pre-broadcast**。UserOp 進入 mempool 後，Agent 已經淋濕。"* | `checkSoilResistance()` · R01–R20 |
| **0:16–0:24** | 分屏：A 無遮蔽奔跑 · B 坐在鎖定避難所下 | **OPTION A FAIL-OPEN** `lostUsd > 0` · **OPTION B FAIL-SLOW** stuck capital | Contrast card |
| **0:24–0:30** | Option C 雨傘在車門前以 **Wasm hex shield** 展開 | *"Option C: SliverVine Citadel — sub-ms shield，然後上車。絕不反過來。"* | Identity sentence on-screen |

### A.2 `30s–75s` — Option C 技術核心

| 時間 | 視覺 | VO / on-screen | Anchor |
|------|--------|----------------|--------|
| **0:30–0:40** | Three Pillars schematic | *"0-Gas Citadel: soil trips **before** Bundler gas. No broadcast, no fee, no sandwich surface."* | Pillar 3 Shield |
| **0:40–0:52** | Rust `#![no_std]` · `pkg/soil_core.wasm` size badge | *"Rust `#![no_std]` Wasm on Cloudflare Edge. `checkSoilResistance()` — p50 ~106 microseconds."* | `<28kb` · warm `&lt;60µs` |
| **0:52–1:04** | Arbiscan Sepolia · Gate address | *"EIP-712 consume-once Gate `0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1`. Replay is `Replayed()`."* | `SliverVineGate.sol` |
| **1:04–1:15** | Halmos `check_*` file · [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) badge | *"Formal consume-once lemmas in-repo. Policy alignment: [ERC-8196](https://eips.ethereum.org/EIPS/eip-8196) (Emerging Draft Sub-ms Policy Gate) — not a finalized standard."* | `HalmosGateInvariant.t.sol` |

### A.3 `75s–120s` — 14 維度分數提升與 Sponsor 協同

| 時間 | 視覺 | VO / on-screen | Anchor |
|------|--------|----------------|--------|
| **1:15–1:30** | Score strip: V0.9 **5.2** → V1.0 **7.7**（internal 20-judge panel） | *"Same 14 audit dimensions. Leaving the yield-vault rain for an Agent Citadel is the score jump — not a louder APY."* | Internal 14-dim comparison（勿閃 OpSec filenames） |
| **1:30–1:45** | GMX payload JSON · `uiFeeReceiver` · **+10 bps** | *"GMX v2 builder lane: `uiFeeReceiver` plus ten basis points on every qualified GM payload."* | `gmx-v2-order-payload.ts` · `GMX_UI_FEE_BPS` |
| **1:45–2:00** | Robinhood `46630`/`4663` → `42161` · inbound red stamp | *"Robinhood Chain is a **Pillar 2 Reference Escort Adapter**. Outbound escort only. Inbound AML **BLOCK**."* | `across-ingress-bridge.ts` · `IngressSafetySwitch.sol` |

### A.4 `120s–150s` — Quant Monte Carlo + Pendle Institutional Shield（V1.0 Live）

| 時間 | 視覺 | VO / on-screen | Anchor |
|------|--------|----------------|--------|
| **2:00–2:16** | 10,000-run histogram · **87.39%** trip rate | *"Monte Carlo: 10,000 shock-plus-sandwich runs. Citadel intercepts **87.39%** of toxic legs. **$9.88 million is nominal simulated LP protection** — not live TVL."* | `docs/telemetry/game_theory_simulation_results.json` |
| **2:16–2:30** | Pendle clock · oracle TTL · 7d / 200 bps | *"Pendle Institutional Shield — V1.0 live on Pillar 3. Sync oracle, sixty-second TTL, `PENDLE_ORACLE_STALE` fail-closed into soil. Expiry under seven days **and** yield jitter over 200 bps → block. A refusal gate — not a PT market."* | `pendle-market-oracle-adapter.ts` · `pendle-pt-expiry-guard.ts` |

### A.5 `150s–180s` — 里程碑 Roadmap 與 Proof Bar

| 時間 | 視覺 | VO / on-screen | Anchor |
|------|--------|----------------|--------|
| **2:30–2:45** | M1–M6 checklist: Sepolia ✅ · CLI ✅ · RH demo ✅ · GMX fee ✅ · Dune spec ✅ · Mainnet ⏳ | *"Milestones are CLI-verifiable. Mainnet is M6 — we do not pretend it is done."* | [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) |
| **2:45–2:55** | Dune 3-query spec card · `GET /api/grant-audit` | *"Dune: three-query production spec plus grant-audit KV reconciliation."* | [`DUNE_DASHBOARD_SPECIFICATION_ZH.md`](../telemetry/DUNE_DASHBOARD_SPECIFICATION_ZH.md) |
| **2:55–3:00** | End card · URL · SSOT string | **836 tests** | `pnpm test -- --run` |

**SECTION A 禁止台詞：** APY guarantee · 99.82% · "already saved LPs $9.88M" · Stylus mainnet · Hyperliquid as the Arbitrum deployment proof · inbound Robinhood as a product。

---

## SECTION B — Demo Video Script（120s / 2 分鐘線上鏈上與技術驗證）

**表單欄位檔案：** Demo Video · **live screen + terminal only** · 除一行標題外無隱喻 VO。Cursor/mouse 可見。

### B.1 `0s–20s` — Live HUD & Arbiscan Gate

| 時間 | 操作（operator） | On-screen proof |
|------|-------------------|-----------------|
| **0:00–0:10** | 開啟 [bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz)。滾動 Shield + routing cards。 | Live HUD title · no staging mock |
| **0:10–0:20** | 新分頁：Arbiscan Sepolia contract `0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1`。 | Address match · consume-once bytecode page |

### B.2 `20s–50s` — Live Soil Trip（green → red fail-closed）

| 時間 | 操作 | On-screen proof |
|------|--------|-----------------|
| **0:20–0:32** | HUD / CLI：dry fixture 上 soil **PASS**（green）。 | `checkSoilResistance()` allow path |
| **0:32–0:50** | 觸發 trip（depth / slippage fuse / circuit-breaker test 或 HUD trip banner）。Channel severs。 | Green → red · `signingChannelOpen: false` · terminal snippet from `pnpm exec vitest run tests/risk-control/soil-circuit-breaker.test.ts` |

### B.3 `50s–80s` — Robinhood inbound AML BLOCK + IN_FLIGHT

| 時間 | 操作 | On-screen proof |
|------|--------|-----------------|
| **0:50–0:65** | 執行 / 展示 bridge test 或 adapter snapshot：inbound `4663` / reverse path。 | **AML inbound BLOCK** |
| **0:65–0:80** | 突出 `capitalLabel: IN_FLIGHT_BRIDGE_CAPITAL` · `deployable: false` · `lostUsd === 0`。 | Pillar 2 Reference Escort Adapter — not product identity |

```bash
pnpm exec vitest run tests/adapters/across-ingress-bridge.test.ts
```

### B.4 `80s–108s` — GMX `uiFeeReceiver` + grant-audit JSON

| 時間 | 操作 | On-screen proof |
|------|--------|-----------------|
| **1:20–1:34** | 開啟 GMX v2 payload fixture / HUD debug：`uiFeeReceiver` · **+10 bps**。 | Field-level verification |
| **1:34–1:48** | Browser：`https://bedeltawater.slivervine.xyz/api/grant-audit` · expand JSON。 | `provenanceVerified` · SHA-256 · duneTelemetry keys |

```bash
curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .provenanceVerified
```

### B.5 `108s–120s` — Vitest SSOT bar

| 時間 | 操作 | On-screen proof |
|------|--------|-----------------|
| **1:48–2:00** | Terminal：`pnpm test -- --run`（可預錄完整運行若帶時間戳；凍結於 summary）。 | 精確字串：**836 tests** superimposed if the CLI summary matches |

**SECTION B 禁止剪輯：** stock APY charts, unrun Halmos CLI claiming "proved," synthetic Dune Query 0 labels presented as decoded Gate events without caption。

---

## Verification & Regression（evaluator copy-paste）

| 指標 | Lock |
|--------|------|
| Vitest | **836 tests** |
| ZeroDev gate | **4/4** · `tests/adapters/zerodev-aa-gate.test.ts` |
| Across / Robinhood escort | **5/5** · `tests/adapters/across-ingress-bridge.test.ts` |
| Chaos | **255/255** · `capitalLossUsd: 0` |
| Wasm | p50 ~106 µs · `<28kb` budget |
| Gate | Sepolia `0xb174118bc0B84e8D6D59EEF2339e29bF7FCf8BF1` |

```bash
pnpm test -- --run
pnpm exec vitest run tests/risk-control/soil-circuit-breaker.test.ts tests/adapters/across-ingress-bridge.test.ts
curl -s "https://bedeltawater.slivervine.xyz/api/grant-audit" | jq .provenanceVerified
```

Start CLI map: [`docs/VERIFICATION_MATRIX.md`](../VERIFICATION_MATRIX.md)。

---

## 相關文檔

| 文檔 | 用途 |
|----------|-----|
| [`docs/README.md`](../README.md) | Grant reviewer navigation |
| [`SUBMISSION.md`](../ARB_Buildathon/SUBMISSION.md) | Buildathon pack |
| [`01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md`](../audit/01_INSTITUTIONAL_DUE_DILIGENCE_MEMORANDUM.md) | Allocator diligence |
| [`03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md`](../architecture/03_RISK_MITIGATION_AND_DISCLAIMER_FRAMEWORK.md) | Option C stress + 60 invariants |

**Prepared by:** SilverVine Labs · HackQuest dual-video SSOT  
**Last updated:** 2026-09-02 · Branch: `V1.0_b4_Buildaton_Submisson`
