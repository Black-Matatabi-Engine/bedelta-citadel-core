# Grant Submission — 30-Second Auditor Guide

**Repo:** [SilverVineLabs/bedelta-living-water](https://github.com/SilverVineLabs/bedelta-living-water)  
**Entity:** [SilverVine Labs](https://silvervinelabs.com)  
**Live HUD:** [https://bedeltawater.slivervine.xyz](https://bedeltawater.slivervine.xyz)  
**Hero:** BeΔ Living Water — Hyperliquid-native yield ingress + 2PC + Session Key  
**Full pack:** [HYPERLIQUID.md](./HYPERLIQUID.md)

---

## Thesis (10 seconds)

External **Solana / Arbitrum** yield → **Hyperliquid** as sole 1× short hedge → **TVL stickiness + HL OI**.  
Gated by **Session Key TRADE_ONLY**, **Dynamic Max SL** (`Balance × 1% + $100`), and **2PC Intent Ledger** (TTL abort + reduce-only flatten).

---

## Wave 1 Scope (Honest)

| In scope | Out of scope (→ M2 / M2+) |
|----------|---------------------------|
| Read-path ingress · Hyperliquid Testnet 2PC proof | Live capital bridge |
| Risk Envelope · black-swan halt | LuBan Micro-Unwind cushion (live) |
| 575 tests · zero-key sandbox | DonDon on-chain charity transfers |

> LuBan Cushion and DonDon on-chain routing are Milestone 2+ specifications (fee & telemetry aligned); Wave 1 ships the core BeΔ Risk Envelope and 2PC Intent Ledger on Hyperliquid.

**Team:** Solo-built infra MVP + CI automation.

---

## Run This

```bash
pnpm install && pnpm exec tsc --noEmit && pnpm grant:verify
```

**Also:** `pnpm test` → **575/575** · `pnpm grant:hl-testnet` → Hyperliquid Testnet 2PC audit JSON

---

## What You Should See

| Check | Expected |
|-------|----------|
| `tests/integration/hl-2pc-execution.test.ts` | TTL expired → HL reduce-only flatten |
| `tests/e2e/grant-sandbox-dryrun.test.ts` | Zero-key HL → Polymarket → Jupiter gates pass |
| `tests/stress/black-swan-scenario.test.ts` | Circuit evaluate &lt;10ms · order reject |

---

## API Spot-Check

```bash
curl -s "https://bedeltawater.slivervine.xyz/api/yield/triangle?symbol=ETH" \
  | jq '{targetVenue, ingressChain, netApyBand, gateStatus}'
```

Expect: `targetVenue: "HYPERLIQUID"` · conservative `netApyBand` · gate flags.

```bash
curl -s "https://bedeltawater.slivervine.xyz/api/telemetry/health" \
  | jq '{criIndex, circuitBreakers, soilResistance}'
```

---

## Live Hyperliquid Testnet (optional)

```bash
HL_TESTNET_PRIVATE_KEY=0x... HL_LIVE=1 pnpm grant:hl-testnet
```

Structured JSON: CREATE → PREPARE → COMMIT (and PREPARED-only ABORT demo) on **Hyperliquid Testnet**.

---

## Ask Framing (suggested)

**Use of funds:** harden Wave 1 Hyperliquid Testnet path · Milestone 2 capital bridge · DO ledger.  
**Not this ask:** marketing LuBan/DonDon as shipped products (see [HYPERLIQUID.md](./HYPERLIQUID.md) Appendix A).
