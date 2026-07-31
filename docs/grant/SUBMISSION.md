# Grant Submission — 30-Second Auditor Guide

**Repo:** `SilverVineLabs/bedelta-living-water`  
**Full pack:** [HYPERLIQUID.md](./HYPERLIQUID.md)

## Run This

```bash
pnpm install && pnpm exec tsc --noEmit && pnpm grant:verify
```

## What You Should See

- `tests/integration/hl-2pc-execution.test.ts` — TTL expired → HL reduce-only flatten  
- `tests/e2e/grant-sandbox-dryrun.test.ts` — zero-key HL / Polymarket / Jupiter gate sequence  

## API Spot-Check

```bash
curl -s "https://<your-worker>/api/yield/triangle?symbol=ETH" | jq '{targetVenue, ingressChain, netApyBand, gateStatus}'
```

## Live Testnet (optional)

```bash
HL_TESTNET_PRIVATE_KEY=0x... pnpm grant:hl-testnet
```

Outputs structured JSON audit log with intent phases and exchange response reference.
