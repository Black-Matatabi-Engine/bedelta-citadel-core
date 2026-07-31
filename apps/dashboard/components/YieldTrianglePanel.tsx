import type { YieldTriangleViewModel } from "../types";
import { GuardStatusRow } from "./GuardStatusRow";

function Metric({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded border border-zinc-800/70 bg-black/40 px-3 py-2.5">
      <p className="font-data text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <p
        className={`font-data mt-1 text-lg font-semibold tabular-nums ${accent ? "text-emerald-400" : "text-zinc-100"}`}
      >
        {value}
        {unit ? (
          <span className="ml-1 text-xs font-normal text-zinc-500">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}

function GatePill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`font-data rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${
        ok
          ? "border border-emerald-800/60 bg-emerald-950/40 text-emerald-400"
          : "border border-red-900/50 bg-red-950/30 text-red-400"
      }`}
    >
      {label}
    </span>
  );
}

export interface YieldTrianglePanelProps {
  model: YieldTriangleViewModel;
  onRefresh: () => void;
}

export function YieldTrianglePanel({ model, onRefresh }: YieldTrianglePanelProps) {
  const { gateStatus } = model;

  return (
    <section className="hud-panel">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-data text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Yield Triangle
          </h2>
          <p className="font-data text-[10px] text-zinc-600">
            {model.symbol} · {model.fetchedAt ? new Date(model.fetchedAt).toLocaleTimeString() : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={model.loading}
          className="font-data rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[10px] uppercase tracking-wide text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40"
        >
          {model.loading ? "Sync…" : "Refresh"}
        </button>
      </header>

      {model.error ? (
        <p className="mb-3 font-data text-xs text-red-400">{model.error}</p>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Metric label="HL Lend APY" value={model.hlApy.toFixed(2)} unit="%" accent />
        <Metric label="Jupiter Impact" value={String(model.jupiterImpactBps)} unit="bps" />
        <Metric label="Poly Spread" value={String(model.polymarketSpreadBps)} unit="bps" />
        <Metric label="Max SL" value={`$${gateStatus.dynamicMaxSlUsd}`} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <GatePill ok={gateStatus.soilOk} label={gateStatus.soilOk ? "Soil OK" : "Soil Trip"} />
        <GatePill ok={gateStatus.intent2pcReady} label="2PC Ready" />
        <GatePill ok={gateStatus.signingChannelOpen} label="Session Key" />
        <span className="font-data rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] uppercase text-zinc-500">
          Phase · {gateStatus.phase}
        </span>
      </div>

      <GuardStatusRow lights={model.guardLights} />
    </section>
  );
}
