import type { HudStreamPayload } from "../../api/hud-telemetry";
import { MarketSentimentRadar } from "./MarketSentimentRadar";
import { ClientOnly } from "./ClientOnly";
import { lazy, Suspense } from "react";

const DexSettlementCountdown = lazy(async () => {
  const mod = await import("./DexSettlementCountdown");
  return { default: mod.DexSettlementCountdown };
});

export interface ThreeEyeHudProps {
  criScore: number;
  maxLossUsd: number;
  vix: number;
  dvol: number;
  hudStream: HudStreamPayload | null;
  hudStreamError: string | null;
  hudStreamLoading: boolean;
  polymarketArmed?: boolean;
}

function soilBadge(status: HudStreamPayload["leftEyeDefense"]["status"]): string {
  if (status === "PASS") return "soil-badge-pass";
  if (status === "LOCKED") return "soil-badge-fail";
  return "soil-badge-warn";
}

export function ThreeEyeHud({
  criScore,
  maxLossUsd,
  vix,
  dvol,
  hudStream,
  hudStreamError,
  hudStreamLoading,
  polymarketArmed = false,
}: ThreeEyeHudProps): React.ReactNode {
  const left = hudStream?.leftEyeDefense;
  const right = hudStream?.rightEyeProbe;
  const crown = hudStream?.crownTreasuryPnl;
  const market = hudStream?.marketProbe;
  const leverageRatio =
    crown && crown.accountBalanceUsd > 0
      ? (maxLossUsd / crown.accountBalanceUsd) * 100
      : 0;

  return (
    <section
      className="santen-group santen-group--three-eye space-y-3"
      aria-label="Three-Eye Crop and Focus"
    >
      <h2 className="panel-title-text px-1 font-hud text-[0.7rem] tracking-[0.18em]">
        Group 2 · Three-Eye Crop &amp; Focus
      </h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="three-eye-card three-eye-card--left circuit-panel p-4">
          <p className="three-eye-card-title">Left Eye · Defense</p>
          <p className="mt-2 font-data text-xs text-[var(--text-secondary)]">
            Friction probe · checkSoilResistance()
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold",
                soilBadge(left?.status ?? "STANDBY"),
              ].join(" ")}
            >
              {left?.status ?? "STANDBY"}
            </span>
            {hudStreamLoading ? (
              <span className="font-data text-[10px] text-[rgba(160,255,224,0.5)]">
                syncing…
              </span>
            ) : null}
          </div>
          <dl className="mt-3 space-y-1.5 font-data text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-secondary)]">Dynamic Max SL</dt>
              <dd className="text-[#45C4B4]">
                ${(left?.dynamicMaxSlUsd ?? maxLossUsd).toFixed(0)} · 1% + $100
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-secondary)]">Tensile</dt>
              <dd>
                <strong>{crown?.criIndex ?? criScore}</strong>% / 20% MIN
              </dd>
            </div>
          </dl>
        </article>

        <article className="three-eye-card three-eye-card--right circuit-panel p-4">
          <p className="three-eye-card-title">Right Eye · Probe</p>
          {hudStreamError ? (
            <p className="mt-2 font-data text-xs text-red-400">{hudStreamError}</p>
          ) : (
            <dl className="mt-3 space-y-1.5 font-data text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--text-secondary)]">Santenmoku</dt>
                <dd className="truncate text-right">
                  {right?.santenmokuStatus ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--text-secondary)]">Polymarket</dt>
                <dd>
                  {polymarketArmed ||
                  right?.activeVenues?.includes("POLYMARKET")
                    ? "Tail hedge · ARMED"
                    : "STANDBY"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--text-secondary)]">Select Token</dt>
                <dd className="text-[#45C4B4]">{market?.selectToken ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--text-secondary)]">Best Token</dt>
                <dd className="text-[#45C4B4]">{market?.bestToken ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--text-secondary)]">Live pairs</dt>
                <dd>{market?.livePairsCount ?? 0}</dd>
              </div>
              {market?.topPairs?.length ? (
                <div className="pt-1">
                  <dt className="text-[var(--text-secondary)]">Top Pairs</dt>
                  <dd className="mt-1 space-y-0.5 text-right">
                    {market.topPairs.map((pair) => (
                      <div key={pair.symbol} className="text-[10px]">
                        <span className="text-[#45C4B4]">{pair.symbol}</span>
                        <span className="text-[rgba(160,255,224,0.55)]">
                          {" "}
                          · {pair.annualYieldPct.toFixed(1)}% APR
                        </span>
                      </div>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          )}
          <div className="mt-3 scale-[0.92] origin-top-left">
            <MarketSentimentRadar vix={vix} dvol={dvol} />
          </div>
        </article>

        <article className="three-eye-card three-eye-card--crown circuit-panel p-4">
          <p className="three-eye-card-title">Crown Eye · Treasury</p>
          <dl className="mt-3 space-y-1.5 font-data text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-secondary)]">Real-time PnL</dt>
              <dd
                className={
                  (crown?.estimatedPnlUsd ?? 0) >= 0
                    ? "text-[#45C4B4]"
                    : "text-red-400"
                }
              >
                {(crown?.estimatedPnlUsd ?? 0) >= 0 ? "+" : ""}$
                {(crown?.estimatedPnlUsd ?? 0).toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-secondary)]">Risk leverage</dt>
              <dd>{leverageRatio.toFixed(2)}%</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-secondary)]">HUD state</dt>
              <dd>{crown?.hudState ?? "IDLE"}</dd>
            </div>
            {market ? (
              <>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--text-secondary)]">Live pairs</dt>
                  <dd>{market.livePairsCount}</dd>
                </div>
              </>
            ) : null}
          </dl>
          <ClientOnly
            fallback={
              <p className="mt-3 font-data text-[10px] text-[rgba(160,255,224,0.5)]">
                HL settlement clock…
              </p>
            }
          >
            <Suspense fallback={null}>
              <div className="mt-3 scale-[0.95] origin-top-left">
                <DexSettlementCountdown />
              </div>
            </Suspense>
          </ClientOnly>
        </article>
      </div>
    </section>
  );
}
