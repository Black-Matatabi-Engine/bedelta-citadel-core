import type { AdaptiveGuardLights } from "../types";

const LIGHT_STYLES = {
  green: "bg-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  amber: "bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
  red: "bg-red-500/90 shadow-[0_0_10px_rgba(239,68,68,0.65)] animate-pulse",
} as const;

export interface GuardStatusRowProps {
  lights: AdaptiveGuardLights;
}

function GuardCell({
  label,
  sublabel,
  light,
}: {
  label: string;
  sublabel: string;
  light: keyof typeof LIGHT_STYLES;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5">
      <div>
        <p className="font-data text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
        <p className="font-data text-xs text-zinc-300">{sublabel}</p>
      </div>
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${LIGHT_STYLES[light]}`}
        title={light}
        aria-label={`${label} ${light}`}
      />
    </div>
  );
}

export function GuardStatusRow({ lights }: GuardStatusRowProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <GuardCell label="Hyperliquid" sublabel="Lend + Funding" light={lights.hyperliquid} />
      <GuardCell label="Jupiter" sublabel="Ingress Guard" light={lights.jupiter} />
      <GuardCell label="Polymarket" sublabel="Orderbook Guard" light={lights.polymarket} />
    </div>
  );
}
