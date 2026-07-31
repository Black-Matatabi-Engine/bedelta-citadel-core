import type { IntentStreamEvent } from "../types";

const KIND_COLORS: Record<IntentStreamEvent["kind"], string> = {
  CREATE: "text-zinc-400",
  PREPARE: "text-sky-400",
  COMMIT: "text-emerald-400",
  ABORT: "text-red-400",
  FLATTEN: "text-amber-400",
  TTL: "text-orange-400",
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export interface LiveIntentStreamProps {
  events: IntentStreamEvent[];
  running: boolean;
  onRunCommit: () => void;
  onRunTtlAbort: () => void;
  onRunPrepareFail: () => void;
  onRunJupiterBlock: () => void;
  onClear: () => void;
}

export function LiveIntentStream({
  events,
  running,
  onRunCommit,
  onRunTtlAbort,
  onRunPrepareFail,
  onRunJupiterBlock,
  onClear,
}: LiveIntentStreamProps) {
  return (
    <section className="hud-panel flex h-full min-h-[320px] flex-col">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-data text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Live Intent Stream
          </h2>
          <p className="font-data text-[10px] text-zinc-600">2PC · PENDING → PREPARED → COMMITTED | ABORTED</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <DemoBtn label="Commit" onClick={onRunCommit} disabled={running} />
          <DemoBtn label="TTL Abort" onClick={onRunTtlAbort} disabled={running} accent />
          <DemoBtn label="Poly Block" onClick={onRunPrepareFail} disabled={running} />
          <DemoBtn label="Jup Block" onClick={onRunJupiterBlock} disabled={running} />
          <DemoBtn label="Clear" onClick={onClear} disabled={running || events.length === 0} />
        </div>
      </header>

      <div className="intent-log flex-1 overflow-y-auto rounded border border-zinc-900 bg-black/50 p-2">
        {events.length === 0 ? (
          <p className="font-data px-2 py-6 text-center text-xs text-zinc-600">
            No intent events · trigger a demo scenario
          </p>
        ) : (
          <ul className="space-y-1">
            {events.map((evt) => (
              <li
                key={evt.id}
                className={`font-data flex gap-2 rounded px-2 py-1.5 text-[11px] leading-relaxed ${
                  evt.highlight
                    ? "border border-amber-900/40 bg-amber-950/20 text-amber-100"
                    : "text-zinc-400"
                }`}
              >
                <span className="shrink-0 tabular-nums text-zinc-600">{formatTime(evt.ts)}</span>
                <span className={`shrink-0 w-14 uppercase ${KIND_COLORS[evt.kind]}`}>{evt.kind}</span>
                <span className="shrink-0 w-16 text-zinc-500">{evt.phase}</span>
                <span className="min-w-0 flex-1 break-all text-zinc-300">{evt.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function DemoBtn({
  label,
  onClick,
  disabled,
  accent,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`font-data rounded border px-2 py-0.5 text-[10px] uppercase tracking-wide transition disabled:opacity-40 ${
        accent
          ? "border-amber-800/60 bg-amber-950/30 text-amber-400 hover:border-amber-600"
          : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}
