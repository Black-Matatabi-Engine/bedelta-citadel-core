import { useTelemetryHealth } from "../hooks/useTelemetryHealth";
import { useYieldTriangle } from "../hooks/useYieldTriangle";

function SafeTag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`font-data inline-flex items-center gap-2 rounded border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${
        ok
          ? "border-emerald-800/70 bg-emerald-950/50 text-emerald-400"
          : "border-amber-800/60 bg-amber-950/40 text-amber-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          ok ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-amber-400"
        }`}
      />
      {label}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-zinc-900/80 py-2 last:border-0">
      <span className="font-data text-[10px] uppercase tracking-[0.2em] text-zinc-600">{k}</span>
      <span className="font-data text-sm text-zinc-200">{v}</span>
    </div>
  );
}

export function StealthHud() {
  const health = useTelemetryHealth();
  const yieldModel = useYieldTriangle({ symbol: "ETH", pollMs: 8_000 });

  const soilOk =
    health.data?.soilResistance.status === "PASS" ||
    health.data?.soilResistance.status === "STANDBY";
  const blackSwanOk = health.data ? !health.data.blackSwanDefense.active : false;
  const hedgeActive =
    health.data?.soilResistance.hedgeChannelActive === true ||
    Boolean(yieldModel.gateStatus.routable);

  /** Graceful edge posture — stay Active while syncing / under latency. */
  const edgeActive = health.online || health.loading || !health.error;

  return (
    <div className="stealth-shell min-h-screen">
      <header className="border-b border-zinc-900/90 px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="font-data text-[10px] uppercase tracking-[0.4em] text-zinc-600">
            SilverVine Labs · Live Edge
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            BeΔ Living Water
          </h1>
          <p className="mt-2 font-data text-sm text-zinc-500">
            Hyperliquid Yield &amp; Risk Envelope
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-8 sm:px-8">
        <section aria-label="System status">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              System Status
            </h2>
            <button
              type="button"
              onClick={() => void health.refresh()}
              className="font-data text-[10px] uppercase tracking-widest text-zinc-600 transition hover:text-zinc-300"
            >
              {health.loading ? "Sync…" : "Refresh"}
            </button>
          </div>
          <div className="hud-panel space-y-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <SafeTag
                ok={edgeActive}
                label={
                  edgeActive
                    ? "[BeΔ Edge Network: Active]"
                    : "[BeΔ Edge Network: Degraded]"
                }
              />
              {health.data ? (
                <SafeTag
                  ok={!health.data.circuitBreakers.hardlock}
                  label={
                    health.data.circuitBreakers.hardlock
                      ? "HARDLOCK"
                      : `HUD ${health.data.hudState}`
                  }
                />
              ) : null}
            </div>
            {health.error && !edgeActive ? (
              <p className="font-data text-xs text-red-400">{health.error}</p>
            ) : null}
            <Row k="Endpoint" v="/api/telemetry/health" />
            <Row k="CRI Index" v={health.data ? String(health.data.criIndex) : "—"} />
            <Row
              k="Signing Channel"
              v={
                health.data?.circuitBreakers.signingChannelOpen
                  ? "OPEN"
                  : health.data
                    ? "SEVERED"
                    : "—"
              }
            />
            <Row
              k="Dynamic Max SL"
              v={
                health.data
                  ? `$${health.data.circuitBreakers.dynamicMaxSlUsd.toFixed(0)}`
                  : "—"
              }
            />
            <Row
              k="Last Pulse"
              v={
                health.data
                  ? new Date(health.data.timestamp).toISOString()
                  : "awaiting…"
              }
            />
          </div>
        </section>

        <section aria-label="Risk matrix">
          <h2 className="mb-3 font-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Risk Matrix
          </h2>
          <div className="hud-panel">
            <div className="mb-4 flex flex-wrap gap-2">
              <SafeTag
                ok={Boolean(health.data) && soilOk}
                label={
                  health.data
                    ? `SOIL RESISTANCE · ${health.data.soilResistance.status}`
                    : "SOIL RESISTANCE · …"
                }
              />
              <SafeTag
                ok={Boolean(health.data) && blackSwanOk}
                label={
                  blackSwanOk
                    ? "BLACK-SWAN GUARD · SAFE"
                    : health.data?.blackSwanDefense.active
                      ? "BLACK-SWAN GUARD · ACTIVE"
                      : "BLACK-SWAN GUARD · …"
                }
              />
            </div>
            <Row
              k="R20 Lock"
              v={health.data?.circuitBreakers.r20Locked ? "LOCKED" : "CLEAR"}
            />
            <Row k="LuBan Band" v={health.data?.lubanExoskeleton.status ?? "—"} />
            <Row
              k="Active Venues"
              v={
                health.data?.activeVenues?.length
                  ? health.data.activeVenues.join(" · ")
                  : "—"
              }
            />
          </div>
        </section>

        <section aria-label="Yield and hedge">
          <h2 className="mb-3 font-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Yield &amp; Hedge
          </h2>
          <div className="hud-panel">
            <div className="mb-4 flex flex-wrap gap-2">
              <SafeTag
                ok={yieldModel.gateStatus.routable}
                label={
                  yieldModel.gateStatus.routable
                    ? "TARGET YIELD INGRESS · READY"
                    : "TARGET YIELD INGRESS · GATED"
                }
              />
              <SafeTag
                ok={hedgeActive}
                label={
                  hedgeActive
                    ? "HL 1× SHORT HEDGE · ARMED"
                    : "HL 1× SHORT HEDGE · STANDBY"
                }
              />
            </div>
            {yieldModel.error ? (
              <p className="mb-2 font-data text-xs text-amber-400/90">{yieldModel.error}</p>
            ) : null}
            <Row k="Symbol" v={yieldModel.symbol} />
            <Row k="HL Lend APY" v={`${yieldModel.hlApy.toFixed(2)}%`} />
            <Row
              k="Net APY Band"
              v={
                yieldModel.netApyBand
                  ? `${yieldModel.netApyBand.min.toFixed(1)}–${yieldModel.netApyBand.max.toFixed(1)}%`
                  : "—"
              }
            />
            <Row k="Jupiter Impact" v={`${yieldModel.jupiterImpactBps} bps`} />
          </div>
        </section>

        <section aria-label="Auditor terminal guide" className="border-t border-zinc-900 pt-8">
          <h2 className="mb-3 font-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Auditor Terminal Guide · 30s
          </h2>
          <div className="space-y-3 font-data text-sm text-zinc-400">
            <p className="text-zinc-500">
              Zero-key local sandbox — Hyperliquid Testnet dry-run · no production writes.
            </p>
            <pre className="overflow-x-auto rounded border border-zinc-900 bg-black/70 px-4 py-3 text-xs leading-relaxed text-emerald-400/90">
{`pnpm grant:verify
pnpm grant:hl-testnet`}
            </pre>
            <p className="text-[11px] text-zinc-600">
              Live health:{" "}
              <code className="text-zinc-500">
                curl -s https://bedeltawater.slivervine.xyz/api/telemetry/health
              </code>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StealthHud;
