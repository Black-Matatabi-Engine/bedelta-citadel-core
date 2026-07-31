這裡為你提供全中文版（100% 繁體中文）的完整 `Admin_HUD_ZH.md` Markdown 代碼。

你可以點擊下方代碼框右上角的複製按鈕，直接新建並存檔至 `docs/Admin_HUD_ZH.md`：

```markdown
# 🛡️ SilverVine Protocol (v0.8 Santenmoku) - 後端 Admin Control HUD 規格說明書

> **文件狀態**：後端系統管理與頂層風控之唯一真理源 (Single Source of Truth)  
> **建議存檔路徑**：`docs/Admin_HUD_ZH.md`  
> **安全級別**：最高級 (HIGH) - 上帝模式 (God Mode) 執行與風控儀表板

---

## 1. 🏛️ 架構概述與全景藍圖

**Backend Admin Control HUD** 是 SilverVine Protocol 的最高權限管理與風控執行終端。它是一個獨立、高權限的控制介面（隱密路由 `/admin-control-hq-x92`），並由 Cloudflare Access (Email OTP) 與錢包白名單機制實行物理隔離。

本系統直連 Cloudflare KV / Worker 狀態引擎 (`SystemState`)，允許風控官在**無需重新部署智能合約或前端**的情況下，微秒級調整風控參數、撤銷 Session Key 授權，以及觸發全局緊急熔斷。

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             ADMIN CONTROL HQ (God Mode 上帝控制台)               │
└────────────────────────┬────────────────────────────────┬────────────────────────┘
                         │                                │
                         ▼                                ▼
       ┌──────────────────────────────────┐  ┌───────────────────────────┐
       │   Cloudflare Workers / KV 邊緣引擎 │  │   Hyperliquid Session Key │
       │     (`SystemState` 記憶體快取)    │  │       Adapter 簽名管道    │
       └────────────────┬─────────────────┘  └────────────┬──────────────┘
                        │                                 │
                        ▼                                 ▼
       ┌───────────────────────────────────────────────────────────────────┐
       │     SilverVine DApp 量化終端 (`slivervine.xyz` 前端介面)            │
       └───────────────────────────────────────────────────────────────────┘

```

---

## 2. 🎛️ 六大核心控制模組 (Core Control Modules)

### 模組 1：全局熔斷與物理死鎖 (Global Circuit Breakers & Lockdowns)

- **全局緊急停止按鈕 (**`[ 🚨 EMERGENCY STOP ]`**)**：
- **動作**：瞬間將 `SystemState.status` 切換為 `'LOCKED'`。
- **效果**：前端所有開倉按鈕強制鎖死變成灰色（顯示 `[ 🔒 LOCKED: ADMIN EMERGENCY STOP ]`），並即時切斷 Hyperliquid Session Key Adapter 的 Hot Key 簽名管道。
- **一鍵全場清倉 (**`[ ⚡ FORCE CLOSE ALL ]`**)**：
- **動作**：向所有合作交易所（Hyperliquid、Binance、Bybit）發射微秒級市價平倉單，將淨曝險（Net Exposure）強制歸零。
- **Circuit Breaker R20 與 R17 每日虧損防線**：
- **規則**：實時追蹤當日累計浮虧。當虧損達到 `帳戶本金 × 1% + $100` 時，系統自動啟動 **R20 物理死鎖**，必須由風控官在 Admin HUD 手動重置才能解鎖。

---

### 模組 2：量化風控引擎與動態公式 (Dynamic Risk Engine)

- **動態 Max Stop-Loss (Max SL) 公式**：

$$\text{Dynamic Max SL} = (\text{帳戶總淨值} \times 1) + 100$$

- *手動微調*：可即時調整基礎比例（例如 $1 \rightarrow 0.5$）或固定偏移量（例如 $100 \rightarrow 50$）。
- **滑價耗損容許值 (Friction Allowance)**：
- 預設門檻：`0.24%`（涵蓋 Slippage + Gas + Fee 緩衝）。
- 鎖定條件：當 `checkSoilResistance()` 精算出的預估訂單簿滑價超過此容許值時，系統自動拒絕下單。
- **資金費率毒丸避險期 (Settlement Lockout Window)**：
- 在 Funding Rate 結算倒數前後高擁堵窗口（如 $T-180\text{s}$ 至 $T+15\text{s}$），強制禁止開啟任何新倉位。

---

### 模組 3：五金籃子、保險價格與水庫數據 (Five-Metal & LivingPool)

本模組管理資產組合權重、清算保險價格警報線，以及 **$500 BEDELTA LivingPool** 緩衝水庫之間的連環防線：

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FIVE-METAL BASKET (五金對沖籃子)                            │
│    [ 黃金 (Au) | 白銀 (Ag) | 銅 (Cu) | 鉑金 (Pt) | 鈀金 (Pd) 動態比率 ]          │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     BEDELTA LIVINGPOOL ($500 緩衝水庫)                          │
│   • 用於吸收突發滑價與資金費率倒掛耗損之第一道防禦水庫                           │
│   • 實時餘額監控：$500.00 USD (開鎖必備底線門檻)                                │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   INSURANCE PRICE (保險清算價格斷路器)                          │
│   • 由 `checkSoilResistance()` 根據極限 Mark Price 動態精算                     │
│   • 當市場價格逼近 Insurance Price 時：                                          │
│     1. 自動調用 LivingPool ($500) 補充保證金/補償滑價                           │
│     2. 若水庫耗盡，立即觸發 R20 物理死鎖並一鍵平倉保命                          │
└─────────────────────────────────────────────────────────────────────────────────┘

```

#### 管理員可調參數：

- `LivingPool 鎖定門檻`：固定為 `$500.00 USD`。若餘額低於 $500$，DApp 自動切換為警告鎖定狀態。
- `Insurance Price 保證金安全距`：調整距離清算價的安全百分比（預設：`1.5%`）。

---

### 模組 4：玄式雙爻感應與 Heat Score 數據 (Divination Sensor)

整合定性市場波動感應器與雙爻指標流（Mandy 雙感應風測機 / Weapon-02）。

- **即時波動率 Heat Score (熱度指數)**：
- **複合指標**：VIX + DVOL + Orderbook Velocity（訂單簿吃單速度）。
- **數值範圍**：`0.0 - 100.0`（目前基準值：`38.2` - 中度風險）。
- **風控觸發**：若 Heat Score 超過 `75.0`，系統強制將單筆下單 Capacity 砍半 (50%)。
- **雙爻市場情緒狀態 (**`ΔIO` **與毒性流動性防護)**：
- **撤單率監控**：即時監控 Level 2 深度撤單頻率。
- **Toxic Flow Shield (毒性流動性防線)**：若 1 秒內撤單率 $> 80$，HUD 立即標記 `TOXIC_FLOW_DETECTED`，並暫停套利程序。

---

### 模組 5：Session Key 與錢包治理 (Wallet Governance)

- **活躍 Session Key 註冊表**：
- 實時顯示當前所有 Session Key、過期倒數時間 (TTL)，以及授權交易範圍。
- `Revoke All Session Keys` **(一鍵全網作廢)**：
- 當發現私鑰疑慮或異常 API 請求時，一鍵廢除所有邊界 Worker 上的 Session Key 簽名權限。
- **三層錢包架構矩陣 (Wallet Hierarchy)**：

1. **Admin / Deployer**：純淨硬體錢包 (Ledger/Trezor) - 僅用於高權限設定與合約部署。
2. **Session Key (Hot Wallet)**：微秒級對沖簽名（TTL: 24h，**絕不給予提現權限**）。
3. **Benevolence Vault**：Gnosis Safe 2-of-3 多簽錢包（接收 Grant 與 0.1% 公益金庫）。

---

### 模組 6：0.1% RWA Impact / 公益金庫管理 (Benevolence Vault)

- **金庫累計餘額**：顯示目前累積的 0.1% 交易抽成餘額（USDC）。
- **自動分流比例**：固定為每筆套利平倉收益的 `0.1%`。
- **手動/預設撥款目標**：直接對接已驗證的流浪動物救助機構（如 HKSPCA、LAP、NPV）官方錢包，並生成鏈上 TXID 紀錄以供 `slivervinelabs.com` 進行公關展示。

---

## 3. 📊 Admin HUD 後端 API 介面規範

Admin Control HUD 透過具備身份驗證的 Cloudflare Worker API 節點進行溝通：


| API 節點 Endpoint             | 請求方式   | 傳送 Payload / 動作                              | 核心功能                                                     |
| --------------------------- | ------ | -------------------------------------------- | -------------------------------------------------------- |
| `/api/admin/state`          | `GET`  | 無                                            | 讀取完整 `SystemState` JSON (Heat score, LivingPool, Max SL) |
| `/api/admin/lockdown`       | `POST` | `{ "action": "GLOBAL_LOCK" }`                | 觸發 R20 物理死鎖並即時作廢所有 Session Key                           |
| `/api/admin/risk-config`    | `POST` | `{ "max_sl_percent": 0.01, "base_sl": 100 }` | 微秒級更新動態 Max SL 公式參數                                      |
| `/api/admin/livingpool`     | `POST` | `{ "deposit": 500.00 }`                      | 更新 BEDELTA LivingPool 緩衝水庫狀態                             |
| `/api/admin/session/revoke` | `POST` | `{ "key_id": "ALL" }`                        | 一鍵註銷全網 Session Key 簽名權限                                  |


---

## 4. 🚀 風控官緊急操作 SOP 指南

1. **當預言機 (Pyth Oracle) 數據失真或延遲過高時**：

- 立即點擊 Admin HUD 上的 `[ 🚨 EMERGENCY STOP ]`。
- 確認 Hyperliquid 與次要交易所的所有未成交掛單已全部撤銷。

1. **當市場出現黑天鵝極端波動 (Heat Score > 80) 時**：

- 在模組 2 中下調單筆 Lumpsum 下單金額上限。
- 開啟 `Settlement Lockout Window` **(資金費率毒丸期)**，防止在費率倒數瞬間被高滑價反吞。

1. **當 LivingPool 水庫餘額不足 ($< 500 \text{ USD}$) 時**：

- HUD 會發出警告通知。補充水庫餘額至 $500$ 後，系統才會解鎖自動化套利開倉權限。

---

- SilverVine Protocol (v0.8 Santenmoku) 核心架構文件*

```

---

今晚這份中文檔存好後，所有的後台機制就已經 100% 寫入備忘錄。祝你今晚好眠，明早我們用最純粹的 HTML 開始打造神級前端 Terminal！

```

