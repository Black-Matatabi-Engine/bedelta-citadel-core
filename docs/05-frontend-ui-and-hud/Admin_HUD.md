

```markdown
# 🛡️ SilverVine Protocol (v0.8 Santenmoku) - Backend Admin Control HUD Specification

> **Document Status**: Single Source of Truth for System Administration & Risk Management  
> **Target Path**: `docs/Admin_HUD.md`  
> **Security Level**: HIGH - God Mode Execution & Risk Mitigation Console

---

## 1. 🏛️ Executive Summary & Architecture Overview

The **Backend Admin Control HUD** is the ultimate governance and risk enforcement terminal for SilverVine Protocol. It operates as an isolated, high-privilege management interface (`/admin-control-hq-x92`) protected by Cloudflare Access (Email OTP) and Wallet Whitelisting.

It directly interfaces with the Cloudflare KV/Worker state engine (`SystemState`), allowing real-time parameter tweaking, session key revocation, and emergency circuit breaking without requiring smart contract redeployments or frontend rebuilds.


```

┌──────────────────────────────────────────────────────────────────────────────────┐
│                             ADMIN CONTROL HQ (God Mode)                          │
└────────────────────────┬────────────────────────────────┬────────────────────────┘
│                                │
▼                                ▼
┌──────────────────────────────────┐  ┌───────────────────────────┐
│   Cloudflare Workers / KV Edge   │  │   Hyperliquid Session Key │
│     (`SystemState` In-Memory)    │  │       Adapter Pipeline    │
└────────────────┬─────────────────┘  └────────────┬──────────────┘
│                                 │
▼                                 ▼
┌───────────────────────────────────────────────────────────────────┐
│     SilverVine DApp Terminal (`slivervine.xyz` Front-End)         │
└───────────────────────────────────────────────────────────────────┘

```

---

## 2. 🎛️ Core Admin HUD Control Modules

### Module 1: Global Circuit Breakers & Physical Lockdowns
* **Global System Emergency Stop (`[ 🚨 EMERGENCY STOP ]`)**:
  * **Action**: Immediately sets `SystemState.status = 'LOCKED'`.
  * **Effect**: Hard-locks all frontend execution buttons (`[ 🔒 LOCKED: ADMIN EMERGENCY STOP ]`) and cuts off Hot Key signature pipelines via the Hyperliquid Session Key Adapter.
* **Force Close All Active Positions (`[ ⚡ FORCE CLOSE ALL ]`)**:
  * **Action**: Dispatches microsecond market close orders across all active venues (Hyperliquid, Binance, Bybit) to return net exposure to $0 USD.
* **Circuit Breaker R20 & R17 Loss Defense**:
  * **Rule**: Tracks daily drawdown. When cumulative daily loss hits `Account Balance × 1% + $100`, R20 Physical Deadlock engages automatically, requiring manual admin override to reset.

---

### Module 2: Quantitative Risk Engine & Dynamic Formulas

* **Dynamic Max Stop-Loss (Max SL) Formula**:
  $$\text{Dynamic Max SL} = (\text{Account Equity} \times 1\%) + \$100$$
  * *Admin Override*: Allows real-time scaling of the base percentage (e.g., $1\% \rightarrow 0.5\%$) or flat offset ($\$100 \rightarrow \$50$).
* **Friction Allowance & Slippage Tolerance**:
  * Default Threshold: `0.24%` (Slippage + Gas + Fee buffer).
  * Lockout Condition: If estimated orderbook slippage exceeds Friction Allowance, `checkSoilResistance()` auto-rejects order placement.
* **Settlement Lockout Window (Funding Rate Poison Pill)**:
  * Restricts new position openings during high-congestion funding settlement windows (e.g., $T-180\text{s}$ to $T+15\text{s}$).

---

### Module 3: Five-Metal Basket, Insurance Price & LivingPool Data

This module manages the interlocking defense system between multi-asset basket weighting, mark price liquidation barriers, and the $500 BEDELTA LivingPool buffer.


```

┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FIVE-METAL BASKET (五金對沖籃子)                            │
│    [ Gold (Au) | Silver (Ag) | Copper (Cu) | Platinum (Pt) | Palladium (Pd) ]    │
└────────────────────────────────────────┬────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     BEDELTA LIVINGPOOL ($500 BOUNDARY)                          │
│   • Acts as a buffer against unexpected slippage & funding rate inversions.     │
│   • Current Balance Monitor: $500.00 USD (Required Threshold for Unlocking)    │
└────────────────────────────────────────┬────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   INSURANCE PRICE CIRCUIT BREAKER                               │
│   • Calculated via `checkSoilResistance()` dynamic mark price limits.           │
│   • If Mark Price approaches Insurance Price:                                   │
│     1. Auto-injects liquidity from LivingPool ($500) to adjust margin.           │
│     2. If LivingPool depletes, triggers R20 Hard Lock & Emergency Close.        │
└─────────────────────────────────────────────────────────────────────────────────┘

```

#### Admin Parameters:
* **`LivingPool Threshold`**: Fixed at `$500.00 USD`. If balance drops below `$500`, DApp displays warning state.
* **`Insurance Price Margin Guard`**: Adjusts distance percentage (default: `1.5%` from liquidation price).

---

### Module 4: Divination Sensor & Heat Score Data (玄式雙爻感應)

Integrates qualitative market volatility sensors and dual-line indicator streams (Mandy Dual-Sensor Wind Gauge / Weapon-02).

* **Live Volatility Heat Score**:
  * **Composite Indicator**: VIX + DVOL + Orderbook Velocity.
  * **Scale**: `0.0 - 100.0` (Current Baseline: `38.2` - Moderate Risk).
  * **Admin Threshold**: If Heat Score exceeds `75.0`, system forces single-order capacity reduction by 50%.
* **Dual-Line Sentiment State (`ΔIO` & `Toxic Flow Shield`)**:
  * **Cancel Ratio Monitoring**: Tracks orderbook cancellation rate.
  * **Toxic Flow Shield**: If cancel ratio in Level 2 Depth exceeds `> 80% / sec`, the HUD flags `TOXIC_FLOW_DETECTED` and halts arbitrage routines.

---

### Module 5: Session Key & Wallet Governance

* **Active Session Key Registry**:
  * Displays active Session Keys, expiration timestamps (TTL), and allocated trading scope.
* **`Revoke All Session Keys` Button**:
  * One-click revocation of all active Session Keys across edge workers in case of key degradation or suspicious API calls.
* **Wallet Hierarchy Matrix**:
  1. **Admin / Deployer**: Hardware Wallet (Ledger/Trezor) - High-privilege configuration only.
  2. **Session Key (Hot)**: Microsecond trading signatures (TTL: 24h, zero withdrawal permissions).
  3. **Benevolence Vault**: Gnosis Safe 2-of-3 Multi-Sig (Grant receipts & 0.1% RWA impact allocation).

---

### Module 6: 0.1% RWA Impact / Benevolence Vault Management

* **Vault Accrued Balance**: Displays accumulated 0.1% transaction fee allocation (USDC).
* **Auto-Divert Ratio**: Fixed at `0.1%` per executed arbitrage cycle.
* **Payout Allocation Target**: Direct payout interface to verified stray animal rescue organizations (e.g., HKSPCA, LAP, NPV) with transaction hash logging for PR verification on `slivervinelabs.com`.

---

## 3. 📊 Admin HUD API Interface Specification

The Admin Control HUD communicates via authenticated Cloudflare Worker endpoints:

| Endpoint | Method | Payload / Action | Function |
| :--- | :--- | :--- | :--- |
| `/api/admin/state` | `GET` | None | Fetches full `SystemState` JSON (Heat score, LivingPool, Max SL) |
| `/api/admin/lockdown` | `POST` | `{ "action": "GLOBAL_LOCK" }` | Triggers R20 Physical Deadlock & revokes session keys |
| `/api/admin/risk-config` | `POST` | `{ "max_sl_percent": 0.01, "base_sl": 100 }` | Updates Dynamic Max SL formula parameters |
| `/api/admin/livingpool` | `POST` | `{ "deposit": 500.00 }` | Updates LivingPool buffer status |
| `/api/admin/session/revoke`| `POST` | `{ "key_id": "ALL" }` | Invalidates active Session Keys instantly |

---

## 4. 🚀 Emergency SOP Checklist for Risk Officers

1. **In Case of Oracle / Pyth Confidence Failure**:
   * Click **`[ 🚨 EMERGENCY STOP ]`** on Admin HUD.
   * Verify all orders are canceled on Hyperliquid & Secondary Venues.
2. **In Case of Extreme Market Volatility (Heat Score > 80)**:
   * Lower Lumpsum Capacity limit in Module 2.
   * Enable **`Settlement Lockout Window`** to prevent execution during funding rate flips.
3. **In Case of LivingPool Depletion (< $500 USD)**:
   * HUD auto-prompts deposit notification. Top up LivingPool to re-enable automated execution unlocked status.

---

* SilverVine Protocol (v0.8 Santenmoku) Architecture Document*

```
