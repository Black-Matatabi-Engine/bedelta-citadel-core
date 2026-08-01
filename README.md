# BeDelta Living Water — Hyperliquid-Native Yield Ingress & Session-Key Risk Envelope

[![Grant Audit](https://github.com/SilverVineLabs/bedelta-living-water/actions/workflows/grant-audit.yml/badge.svg)](https://github.com/SilverVineLabs/bedelta-living-water/actions/workflows/grant-audit.yml)
![Vitest](https://img.shields.io/badge/Vitest-575_Tests_Passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-Clean-blue)
![License](https://img.shields.io/badge/License-BUSL--1.1-orange)
![Live Telemetry](https://img.shields.io/badge/Live_Telemetry-%2Fapi%2Ftelemetry%2Fhealth-informational)

## Auditor — 30-Second CLI Verify

```bash
pnpm install
pnpm grant:verify
```

```bash
curl -s https://bedeltawater.slivervine.xyz/api/telemetry/health | jq .
```

**Core commands:** `pnpm build` · `pnpm test` (575/575) · `pnpm grant:verify` · `pnpm grant:hl-testnet`

---

Hyperliquid-first yield ingress on Cloudflare Workers — Session Key risk envelope · 2PC intent ledger · Yield Triangle API · Jupiter / GMX read-path.

**Grant pack:** [docs/grant/HYPERLIQUID.md](docs/grant/HYPERLIQUID.md) · [docs/grant/SUBMISSION.md](docs/grant/SUBMISSION.md) · [Brand SSOT](docs/architecture/BRAND_SSOT.md) · [Risk Envelope](docs/architecture/Risk_Envelope_Pgate.md)

## Wave 1 — Hyperliquid Grant MVP

| Module | Path | Role |
|--------|------|------|
| **Session Key Envelope** | `src/adapters/hl/session-key-executor.ts` | TRADE_ONLY + Dynamic Max SL + testnet dry-run |
| **2PC Intent Ledger** | `src/core/intent-ledger.ts` | Dual-leg prepare / commit / abort + flatten |
| **HL ↔ 2PC Bridge** | `src/adapters/hl/hl-intent-bridge.ts` | TTL unwind integration |
| **Crash Recovery Boot** | `src/core/intent-persistence.ts` · Worker `src/index.ts` | KV restore + TTL emergency unwind |
| **Yield Triangle API** | `GET /api/yield/triangle?symbol=ETH` | HL ingress + conservative `netApyBand` |
| **Zero-Key Sandbox** | `src/services/sandbox.ts` | Grant gate diagnostics (no keys) |

## Expected Verify Output

`pnpm grant:verify` — HL 2PC TTL flatten + HL → Polymarket → Jupiter zero-key dry-run **all green**.

Optional HL testnet audit log:

```bash
pnpm grant:hl-testnet
```

## Local Dev

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm run dev
```

## CI

`.github/workflows/grant-audit.yml` — typecheck · full Vitest · audit log on `main`.

## License

BUSL-1.1 (Grant evaluator review permitted under Additional Use Grant — see [LICENSE](LICENSE))
