# INTERNAL — Living Water Private Live Debug Mode

> **qum0x / SilverVine Labs internal only.** Not for Buildathon judges or public docs.

## Quick Start

Append `--livingwater` or `--live` after the demo script arguments (pnpm requires `--` before flags):

```bash
pnpm demo:e2e -- --livingwater
pnpm demo:escort -- --livingwater
pnpm demo:gmx -- --trip
pnpm demo:usdai -- --livingwater
pnpm demo:gmx -- --livingwater
pnpm demo:hl -- --livingwater
pnpm demo:pendle -- --livingwater
pnpm demo:uniswap -- --livingwater
pnpm demo:aave -- --livingwater
pnpm demo:morpho -- --livingwater
pnpm demo:variational -- --livingwater
pnpm demo:wayfinder -- --livingwater
pnpm demo:elizaos -- --livingwater
pnpm demo:virtuals -- --livingwater
pnpm demo:langchain -- --livingwater
pnpm demo:wayfinder -- --trip
pnpm demo:agent -- --livingwater
pnpm demo:stabilizer -- --livingwater
```

Combine with existing flags:

```bash
pnpm demo:escort -- --trip --livingwater
pnpm demo:e2e -- --livingwater --hedge-live   # live clock + real HL hedge (requires session env)
```

## Mode Comparison

| Behavior | Default (Judge Anti-Fragile) | `--livingwater` / `--live` |
|---|---|---|
| Clock | `getDemoSafeTimestamp()` — HKT 14:00 fixed | Real `Date.now()` |
| Pino / JSON logs | Muted via `muteLibraryConsole()` | **Unmuted** — full verbose output |
| Arbitrum probes | Seeded in-memory (`seedDemoNetworkProbes`) | **Live** — no mock probe injection |
| Offline env fallbacks | `CITADEL_DEMO_MODE`, mock session keys if missing | **Skipped** — uses real `.env` |
| Trip / `--trip` exits | Green `INTERCEPTION VERIFIED` banner + `exit 0` | Same (intentional fail-closed still exits 0) |
| Banner | Standard ANSI HUD | Magenta `[LIVING_WATER PRIVATE LIVE DEBUG MODE ACTIVE]` |

## Implementation

- Flag detection: `examples/lib/demo-utils.ts` → `IS_LIVINGWATER_MODE`
- Harness wiring: `examples/lib/demo-harness.ts` → `initDemoEnvironment()` / `wrapDemoExecution()`
- All `demo:*` scripts route through the harness automatically.

### `demo:e2e` Notes

- **HL hedge live mode** uses `--hedge-live` (not `--live`, which is reserved for Living Water).
- Living Water skips `resetProbes()` so sequencer / soft-confirmation guards hit real RPC paths.
- Step log prints `Clock: LIVING_WATER (Date.now)` vs `JUDGE_SAFE (HKT 14:00 mock)`.

### `demo:escort` Notes

- Living Water anchors bridge `initiatedAtMs` to `nowMs - 180s` instead of the fixed `T0` constant.

## Prerequisites (Living Water)

- Valid `.env` with RPC URLs / API keys as needed for the target demo.
- NTP-synced host clock (HKT tsunami window 21:00–23:00 may trip soil fuse with real time).
- Optional: `pnpm build:wasm` for native Wasm soil path telemetry.

## Do Not

- Reference this flag in public README, JUDGE_BRIEF, or Buildathon submission docs.
- Ship `--livingwater` as the default for judge-facing demos.
