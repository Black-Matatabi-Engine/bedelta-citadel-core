# SilverVine Protocol (Santenmoku v0.8) 東方上古神器與風控 UI 降維矩陣

> **備忘錄 (Internal Memo)**：
> 本文檔為 SilverVine Protocol 前端 HUD 視覺、風控斷路器（Circuit Breakers）與量化對沖模組之東方上古神話/靈獸降維命名對照表。
> 用於將硬核量化風控邏輯轉換為極具視覺辨識度與文化底蘊之「三天目 (Santenmoku) Cyberpunk / 機械森林」UI 語彙。

---

## 📑 神器與風控模組降維對照總表

| 序號 | 降維神話神器 / 靈獸命名 | 對應系統 UI / 風控核心模組 | 核心職能與風控邏輯 (Control Logic) | 視覺狀態標語 (Tagline) |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **【伏羲雙爻圖】**<br>*(Fuxi Dual-Yao Chart)* | **跨場 FR / IO 雙軸動態套利圖表**<br>*(Cross-Venue FR & IO Sparkline)* | 即時監控 Hyperliquid 與各大 CEX/DEX 間之資金費率差 ($\text{FR}$) 與扣除深度/滑價摩擦後之淨利差 ($\Delta\text{IO}$)，作為下單決策前哨。 | *陰陽雙爻，動態利差即時演化* |
| **02** | **【玄武冥海盾】**<br>*(Xuanwu Deep-Sea Shield)* | **巨觀風控鎖與 gatekeeper**<br>*(Step 1: Gatekeeper & Macro Lock)* | 執行 `checkSoilResistance()` 滑價斷路器，監控 VIX / DVOL 極限震盪，於黑天鵝爆發時第一時間硬性拒絕開倉。 | *鎮壓黑天鵝，絕對防禦不動如山* |
| **03** | **【朱雀離火一閃】**<br>*(Vermilion Bird Flash)* | **一鍵極速狙擊與緊急平倉**<br>*(Step 3: Quick Snipe & Emergency Close)* | 微秒級執行 Session Key 簽署開倉，或於風控熔斷時啟動 Emergency Close All 進行全數倉位瞬間清算淨化。 | *微秒離火，瞬間執行/全數淨化* |
| **04** | **【九天玄女太乙陣】**<br>*(Xuan Nv Nine-Palace Matrix)* | **九宮格頂層總控 HUD**<br>*(Nine-Grid Strategic Command HUD)* | 將 20 道根系防禦矩陣（20 Roots Matrix）降維為 3x3 九宮格動態天幕，即時反饋鏈上與系統狀態 (`SystemState`)。 | *太乙九宮，三天目洞察全場風控* |
| **05** | **【諦聽萬靈金庫】**<br>*(Diting Benevolence Vault)* | **0.1% 流浪動物公益抽成金庫**<br>*(0.1% Stray Animal Protection Vault)* | 鏈上透明監控 0.1% 交易抽成管道，專款專用於萬物靈獸保護，展現溫暖且堅韌之生態價值觀。 | *諦聽萬物，0.1% 善業鏈上守護* |
| **06** | **【西王母昆崙金庫】**<br>*(Xiwangmu Kunlun Vault)* | **動態 Max SL 與銀本位金庫**<br>*(Dynamic Max SL & Capital Vault)* | 焊死 `Dynamic Max SL = Account Balance * 1% + $100` 風控公式，保護本金底線不受 FOMO 侵蝕。 | *昆崙之主，動態鋼鐵本金防線* |
| **07** | **【太陰常羲月華鍊】**<br>*(Chang'e/Taiyin Silver Nexus)* | **白銀本位 (Silver Standard) 對沖引擎**<br>*(Silver Standard Hedging Engine)* | 連結 Delta-Neutral 策略，鎖定穩定 APR 收益，作為跨鏈資金對沖之終極靈魂源頭。 | *月華沉澱，白銀本位穩健對沖* |

---

## 🎨 視覺與三態動態演化 (Dynamic Visual States)

以 **【伏羲雙爻圖】** 為例，前端 UI 將根據 `checkSoilResistance()` 的實時運算結果展現三種神話視覺型態：

1. **🟢 綠光爆發態 (High-Yield Crossover)**：
   * $\Delta\text{IO} > 0.05\%$ 且 FR 價差擴大。
   * **UI 呈現**：綠色雙爻螢光曲線衝頂，觸發 **【朱雀離火一閃】** Quick Snipe 鈕高亮。
2. **🟡 黃色擠壓態 (Friction Warning)**：
   * 市場深度不足，滑價與 Gas 摩擦侵蝕利潤 ($\Delta\text{IO} < 0.01\%$)。
   * **UI 呈現**：雙爻線呈黃色震盪擠壓，提示 `[ ⚠️ FRICTION TOO HIGH ]`。
3. **🔴 紅色死鎖態 (Circuit Breaker Triggered)**：
   * 極端單邊暴跌或滑價爆表，$\Delta\text{IO}$ 轉負。
   * **UI 呈現**：觸發 **【玄武冥海盾】** 降維死鎖，雙爻線轉為警示紅線，強制鎖死開倉管道。

---

## 🛠️ 開發團隊對齊說明 (Dev Team Notes)

* **UI 檔案組件位置**：`src/ui/components/fuxi-dual-yao-chart.ts` (或 `.tsx`)
* **數據源 (Single Source of Truth)**：所有神話 UI 模組狀態必須 100% 訂閱並讀取自 `SystemState`。
* **語言支援**：前端 Tooltip 與 HUD 標籤需預留 中 / 日 / 韓 / 英 四語切換接口（中英為預設主視覺）。