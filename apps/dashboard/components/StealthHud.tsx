import { YieldTrianglePanel } from "./YieldTrianglePanel";
import { LiveIntentStream } from "./LiveIntentStream";
import { useYieldTriangle } from "../hooks/useYieldTriangle";
import { useIntentStream } from "../hooks/useIntentStream";

export function StealthHud() {
  const yieldModel = useYieldTriangle({ symbol: "ETH" });
  const intent = useIntentStream();

  return (
    <div className="stealth-shell min-h-screen">
      <header className="border-b border-zinc-900/80 bg-black/60 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.35em] text-zinc-600">
              BeDelta Living Water
            </p>
            <h1 className="font-data text-lg font-semibold tracking-tight text-zinc-100">
              Adaptive Execution HUD
            </h1>
            <p className="mt-0.5 font-data text-[11px] text-zinc-500">
              Hyperliquid-native · 2PC Intent Ledger · Stealth Dark
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-data text-[10px] uppercase tracking-widest text-zinc-600">
              ETH / USD
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                yieldModel.gateStatus.routable
                  ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                  : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
              }`}
              aria-label={yieldModel.gateStatus.routable ? "Routable" : "Not routable"}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-2">
        <YieldTrianglePanel model={yieldModel} onRefresh={() => void yieldModel.refresh()} />
        <LiveIntentStream
          events={intent.events}
          running={intent.running}
          onRunCommit={() => void intent.runScenario("commit")}
          onRunTtlAbort={() => void intent.runScenario("ttl_abort")}
          onRunPrepareFail={() => void intent.runScenario("prepare_fail")}
          onRunJupiterBlock={() => void intent.runJupiterBlock()}
          onClear={intent.clear}
        />
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        <p className="font-data text-[10px] text-zinc-700">
          Session-key TRADE_ONLY · Dynamic Max SL enforced · Soil resistance active
        </p>
      </footer>
    </div>
  );
}

export default StealthHud;
