# Brand SSOT — Dual Domain & Deploy Lock

**Status:** Canonical · Wave-1 cleanup  
**Last verified:** 2026-08-01 · Worker Version `79b8d210-75cb-4735-bde1-ce91ba51cf1e`

Do **not** collapse SIL ↔ SLI. Fix entity typos only; keep runtime bindings.

---

## Dual-brand matrix

| Surface | Canonical form | Do NOT “correct” to |
|---------|----------------|---------------------|
| Company / PR | **SilverVine Labs** · `silvervinelabs.com` (SIL-) | SliverVine Labs · silvervine.xyz |
| Protocol face (code / legacy greenpapers) | **SliverVine Protocol** (SLI-) | Blind mass-replace to SilverVine Protocol without glossary |
| DApp / Worker deploy | **`bedeltawater.slivervine.xyz`** | `dev-santenbokui.slivervine.xyz` · silvervine.xyz |
| Parent SLI zone | `slivervine.xyz` | silvervine.xyz |
| Product (Grant Wave 1) | **BeΔ Living Water** (display) · code id `bedelta-*` | BeDeltaLivingWater / LivingPool as primary title |
| Risk layer (Grant English) | **Risk Envelope** (aka Santenmoku / Pgate) | Tang Clan / Iron Bank mythology in grant pack |
| Isolated KV | **`BEDELTA_WATER_KV`** | Shared legacy namespace IDs |

---

## Cloudflare deploy SSOT (`wrangler.jsonc`)

| Key | Value |
|-----|-------|
| Worker `name` | `bedelta-living-water` |
| Custom Domain | `bedeltawater.slivervine.xyz` (`custom_domain = true`) |
| Assets | `./dist` · binding `ASSETS` · SPA `not_found_handling` |
| Env | `ENVIRONMENT = "production"` |
| Isolated KV | `BEDELTA_WATER_KV` → `60db4bcba35248dba594ef109e4065b1` |
| Compat aliases | `SLIVERVINE_KV` · `SYSTEM_STATE_KV` → **same** namespace id (code-compat; no public rename) |

**Live health:**

```bash
curl -s https://bedeltawater.slivervine.xyz/api/telemetry/health | jq .
```

---

## Naming discipline (future merge)

| Sleeve | Role | Prefix examples |
|--------|------|-----------------|
| Yield (BeΔ) | Water / TVL ingress | `routeYieldIngress`, `calcStackedApy` |
| Risk (HTAC / Santenmoku) | Shield / envelope | `assertSoilSafe`, `triggerR20Deadlock` |
| Execution (TWAP+) | Spear | `executeTwapOrder` |
| Charity (DonDon) | 0.1% social | `routeDondonPool` |

Public brand umbrella stays **SilverVine**; execution zone stays **slivervine.xyz**; this Worker’s public face is **BeΔ Living Water** at `bedeltawater.slivervine.xyz`.

---

## Out of scope

- Renaming Cloudflare binding identifiers in application code beyond documenting `BEDELTA_WATER_KV`
- Deleting `archive/santenmoku` or `legacy_ref`
- Implementing LuBan / DonDon on-chain
