# enXde — Encode / Decode SOP & Triple-String Secret Mapping

> **INTERNAL SECURITY PROTOCOL — DO NOT MODIFY OR EXPOSE**

**Classification:** XuanWu Security Matrix (Defense 1 · 2 · 3)  
**Protocol:** SliverVine Protocol · Santenmoku v0.8  
**Modules:** `salt-engine.ts` · `rpc-whitelist.ts` · `ui-canary.ts`

---

## 1. Triple-String Unlock Mechanism

Authorized Edge runtimes must present **all three** literal environment secrets:

| Variable | Required literal | Role |
|----------|------------------|------|
| `XUANWU_SALT` | `玄武` | XOR threshold decryption root |
| `OWNER_IDENTITY` | `0xWallet` | Private identity string tag |
| `JAVIER_SIGNATURE` | `Javier` | Operator signature gate |

> **Important:** `0xWallet` is a **private identity string tag**, **NOT** a live blockchain wallet address.

Validation: `validateTripleStringUnlock()` — **all three** must match exactly.

### Failure mode

Missing or incorrect key → `resolveXuanwuThresholds()` returns safe zeros:

```json
{ "valid": false, "maxSlBaseUsd": 0, "maxSlBalanceRate": 0, "latencyBoundMs": 0 }
```

Any positive estimated loss with `maxLossLimit: 0` invokes **`rootProtection()`** physical deadlock immediately.

---

## 2. Dynamic Threshold Salt Injection (Defense Matrix 1)

1. Triple-String unlock passes.
2. XOR-decrypt blob `XUANWU_ENC_THRESHOLDS` using `玄武`.
3. Parse JSON thresholds:

```json
{ "maxSlBaseUsd": 100, "maxSlBalanceRate": 0.01, "latencyBoundMs": 500 }
```

**Effective Max SL USD** = `(Account Equity × 0.01) + $100`

APIs: `resolveXuanwuThresholds()` · `computeXuanwuMaxLossLimitUsd()` · `enforceXuanwuSaltGate()`

---

## 3. Honey-pot RPC Filter (Defense Matrix 2)

Two trap endpoints are embedded in the **default whitelist array**:

| Host | Trap behavior |
|------|---------------|
| `rpc.silvervine-clone.trap` | Decoy HL-style RPC |
| `api.santenboku-scraper.trap` | Decoy aggregator RPC |

| Unlock state | Effective whitelist | Unauthorized fetch to trap |
|--------------|----------------------|----------------------------|
| **Triple-String valid** | Production hosts only (traps stripped) | `assertRpcAllowlisted` rejects |
| **Invalid / fork** | Production + honey-pots | HTTP **500** + **99% simulated slippage** |

Strip gate: `isXuanwuRpcStripAuthorized()` → requires full Triple-String unlock.

HMAC reference (strip audit): `HMAC-SHA256(玄武, "xuanwu-honeypot-strip-v1")` → `WxNWEs2ni0/J0po0f/0vwSicux3JSIauRjGYuLS35fA=`

---

## 4. Frontend UI Protection (Defense Matrix 3)

| Variable | Required literal | Role |
|----------|------------------|------|
| `NEXT_PUBLIC_HUD_CANARY` | `santenmoku` | UI ↔ Worker streaming handshake |

Unauthorized builds:

- `assertUiWorkerHandshake()` → `{ ok: false, message: "Disconnected / Locked State" }`
- `/api/data` fetch blocked client-side (no canary headers)
- Santenmoku HUD renders locked stream state

Authorized handshake headers:

```
X-Santenmoku-Canary: santenmoku
X-Xuanwu-Watermark: <FNV-1a hash of 玄武:santenmoku:hud:v1>
```

Canvas/WebGL watermark: `generateCanvasWatermarkPayload()` — referenced on CatHud via `data-xuanwu-watermark`.

---

## 5. Deployment (authorized Workers only)

```bash
wrangler secret put XUANWU_SALT          # 玄武
wrangler secret put OWNER_IDENTITY       # 0xWallet
wrangler secret put JAVIER_SIGNATURE     # Javier
# Vite / Pages build:
# NEXT_PUBLIC_HUD_CANARY=santenmoku
pnpm exec tsc --noEmit
pnpm exec vitest run tests/defense/xuanwu-security.test.ts
```

---

*SilverVine Labs · :qum[x0sumx] · BUSL-1.1 · Internal use only*
