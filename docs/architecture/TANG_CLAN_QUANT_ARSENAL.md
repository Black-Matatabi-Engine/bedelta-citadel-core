# 唐門暗器庫與 SilverVine 武器冶煉條款  
# Tang Clan Quant Arsenal & Philosophy

**Author:** qum0x (Solo Architect) · Javier (AI Risk Officer)  
**Project:** SilverVine Labs / BeDelta Living Water  
**Classification:** Internal Soul & Architectural Heritage  
**Status:** SSOT Heritage Spec  
**Related:** [LUBAN_EXOSKELETON_CUSHION.md](./LUBAN_EXOSKELETON_CUSHION.md) · [DONDON_CHARITY_ENGINE.md](./DONDON_CHARITY_ENGINE.md) · [WEB2_VS_WEB3_QUANT_MAP.md](./WEB2_VS_WEB3_QUANT_MAP.md) · [Risk_Envelope_Pgate.md](./Risk_Envelope_Pgate.md)

---

## 一、 核心信仰與唐門暗器哲學 (The Tang Clan Creed)

> *"唐門有做藥有做毒，可以救人可以害人；做暗器殺人於無形，兵器出世當令鬼神驚。"*

### 1. 藥毒同源 (Delta & Volatility Dual-Nature)

| 面向 | 散戶體驗 | SilverVine / BeDelta |
|------|----------|----------------------|
| 極端波動 · 黑天鵝 | 見血封喉的毒藥 | 高濃度養分（funding · vol） |
| 轉化機制 | 被動爆倉 | 2PC 狀態機 + 1x Short → Real Yield |
| 結果 | 本金歸零 | 狂暴 → 安全收益 |

### 2. 木天蓼黏性 (SilverVine Stickiness)

產品黏性不來自虛浮 UI，而來自「放進去就能安心睡覺」的鋼鐵安全感：

| 護盾 | 效果 | 程式錨點 |
|------|------|----------|
| Session Key 權限隔離 | TRADE_ONLY · 禁提現 | `session-key-adapter` · `hl/auth` |
| 2PC 斷流自癒 | TTL abort + flatten | `intent-ledger` · `intent-persistence` |
| <10ms 黑天鵝護盾 | 熔斷拒單 · 強平意圖 | `black-swan-guard` · stress suite |

機構與巨鯨「用過就再也回不去」= 安全感成癮，非遊戲化成癮。

### 3. 語言即代碼 (Language as Code)

```text
唐門圖紙 (中文第一性原理)
        │
        ▼ 思想冶煉
┌───────────────────────┐
│ Javier (AI Risk)      │  戰略 / 風控條款
│ Cursor (Exec)         │  代碼 / 測試鍛造
└───────────┬───────────┘
            ▼
     575+ Vitest 綠勾 · tsc clean
```

架構師定義 DNA；AI 風控官與工程執行官將圖紙鍛成可審計產物。

---

## 二、 三雷達感知系統 (The Three-Radar Sensing Network)

| 雷達 | 認知心理學 | 系統角色 | Protocol 程式碼對應 |
|------|-----------|---------|--------------------|
| **雷達 A (快思)** | System 1 · Ultra-Fast | 毫秒級微觀盤口；有毒流動性瞬間拔插頭 | `checkSoilResistance()` · `<10ms` Black-Swan Halt |
| **雷達 B (慢想)** | System 2 · Macro-Deep | 跨鏈 Yield 三角利差 · 宏觀 Funding | `Yield Triangle API` · 2PC Dynamic Rebalance |
| **雷達 C (主控)** | Central Command | 最終裁決 · State Audit · 硬鎖 | `SystemState` SSOT · Root Protection / R20 |

### 裁決流

```text
Radar A (soil / black-swan)
        │ trip?
        ▼
Radar C (SystemState · R20) ── hardlock / sever signing
        │ clear
        ▼
Radar B (Yield Triangle · 2PC prepare/commit)
```

任一雷達不得繞過 `SystemState` 單向 SSOT。

---

## 三、 防爆外骨骼與 DonDon 靈魂護城河

### 1. 魯班尺 (LuBan Metric) 外骨骼

- 測量倉位崩潰臨界點（SAFE → CAUTION → CRITICAL → COLLAPSE）
- `Tensegrity Cushion Pool` 發起 **Micro-Unwind** + Buffer Injection
- 目標：黑天鵝中保住約 **80%** 本金（相對 100% 清算歸零）

詳見：[LUBAN_EXOSKELETON_CUSHION.md](./LUBAN_EXOSKELETON_CUSHION.md)

### 2. DonDon 慈善對沖 (0.1% Self-Sustaining Pool)

- 初心：剪耳流浪貓 DonDon
- 來源：0.1% Instant Withdrawal convenience（及可配置的 perf 切片）
- 原則：**零用戶本金消耗** · 自造血 · 鏈上可審計

詳見：[DONDON_CHARITY_ENGINE.md](./DONDON_CHARITY_ENGINE.md)

---

## 四、 冶煉條款 (Forging Rules — Non-Negotiable)

| # | 條款 | 含義 |
|---|------|------|
| T1 | 藥毒同源不可偏廢 | 波動必須進 Yield 路徑，不可裸露給用戶 |
| T2 | 暗器先於華飾 | 風控 / 2PC / Session Key 優先於 HUD 裝飾 |
| T3 | 三雷達缺一不可 | A 無 B 則盲目套利；B 無 A 則慢死；C 無 A/B 則空殼 |
| T4 | 外骨骼非保險話術 | Cushion = tensegrity 結構力，非可被抽乾的 insurance fund |
| T5 | 靈魂不可商業化為噱頭 | DonDon 必須真轉帳、真日誌，禁止空口 ESG |
| T6 | 語言即契約 | 中文圖紙與英文 Grant 術語必須可雙向映射到同一模組路徑 |

---

## 五、 Grant 對外術語映射 (OpSec)

| 內部唐門語 | 對外 Grant 語 |
|------------|---------------|
| 唐門暗器 | Pre-trade Risk Envelope · Session Key Isolator |
| 藥毒同源 | Volatility → Real Yield via delta-neutral 2PC |
| 木天蓼黏性 | Institutional retention via fail-closed safety |
| 三雷達 | Soil probe · Yield router · SystemState SSOT |
| 魯班尺外骨骼 | Liquidation cushion · Micro-Unwind |
| DonDon 池 | 0.1% Self-sustaining Social Impact Vault |

---

**License:** BUSL-1.1 · SilverVine Labs · Internal Heritage  
**Backup of:** Tang Clan Quant Arsenal creed (qum0x × Javier)
