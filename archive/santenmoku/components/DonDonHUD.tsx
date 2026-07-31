import { useCallback, useRef } from "react";
import type { DonDonState } from "../types/dondon";
import { getDonDonAssetMapping } from "../assets/dondon/mapping";
import {
  MANUAL_HOLD_CONFIRM_MS,
  parseOverheadHudLines,
} from "../services/dondonEngine";
import { DonDonAlertModal } from "./DonDonAlertModal";

export interface DonDonHUDProps {
  state: DonDonState;
  onManualHoldProgress?: (ms: number) => void;
  killSwitchActive?: boolean;
  onKillSwitchToggle?: (active: boolean) => void;
  showAlertModal?: boolean;
}

export function DonDonHUD({
  state,
  onManualHoldProgress,
  killSwitchActive = true,
  onKillSwitchToggle,
  showAlertModal = true,
}: DonDonHUDProps): React.ReactNode {
  const asset = getDonDonAssetMapping(state.mood, state.colorHue);
  const { primary, secondary } = parseOverheadHudLines(state.overheadHUDText);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const startHold = useCallback(() => {
    if (state.controlMode !== "MANUAL" || !onManualHoldProgress) return;
    stopHold();
    holdTimerRef.current = setInterval(() => {
      const next = Math.min(
        MANUAL_HOLD_CONFIRM_MS,
        state.manualHoldProgressMs + 50,
      );
      onManualHoldProgress(next);
      if (next >= MANUAL_HOLD_CONFIRM_MS) stopHold();
    }, 50);
  }, [
    onManualHoldProgress,
    state.controlMode,
    state.manualHoldProgressMs,
    stopHold,
  ]);

  const holdPct = Math.round(
    (state.manualHoldProgressMs / MANUAL_HOLD_CONFIRM_MS) * 100,
  );

  return (
    <section
      className="dondon-hud-root relative flex flex-col items-center gap-4 p-4"
      aria-label="DonDon emotion HUD"
      data-dondon-mood={state.mood}
      data-control-mode={state.controlMode}
      data-safety-latch={state.isSafetyLatchUnlocked ? "unlocked" : "locked"}
    >
      {showAlertModal ? <DonDonAlertModal state={state} /> : null}

      <div
        className="dondon-overhead-panel w-full max-w-xl rounded-xl border-2 px-4 py-3 shadow-lg"
        style={{
          borderColor: state.colorHue,
          boxShadow: `0 0 24px ${state.colorHue}55`,
          background: `linear-gradient(180deg, ${state.colorHue}22 0%, #0f172a 100%)`,
        }}
      >
        <p className="dondon-overhead-primary text-sm font-bold tracking-wide text-white sm:text-base">
          {primary}
        </p>
        <p
          className="dondon-overhead-secondary mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-slate-900"
          style={{ backgroundColor: state.colorHue }}
        >
          {secondary}
        </p>
        <p className="mt-2 text-[11px] font-mono text-slate-300">{state.statusText}</p>
      </div>

      {state.controlMode === "MANUAL" ? (
        <div className="dondon-manual-hold w-full max-w-xl rounded-xl border border-amber-500/50 bg-slate-950 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
            {(state.manualHoldProgressMs / 1000).toFixed(1)}s / 1.5s HOLD · Slide to Confirm
          </p>
          <div
            className="relative h-10 overflow-hidden rounded-full bg-slate-800"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={MANUAL_HOLD_CONFIRM_MS}
            aria-valuenow={state.manualHoldProgressMs}
            aria-label="Manual hold progress"
          >
            <div
              className="absolute inset-y-0 left-0 bg-amber-500 transition-all"
              style={{ width: `${holdPct}%` }}
            />
            <button
              type="button"
              className="absolute inset-0 text-xs font-bold text-white"
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
            >
              {state.isSafetyLatchUnlocked ? "1.5s LATCH UNLOCKED" : "HOLD 1.5s"}
            </button>
          </div>
        </div>
      ) : null}

      {state.controlMode === "FULL_AUTO" ? (
        <div className="dondon-killswitch w-full max-w-xl rounded-xl border border-red-500/50 bg-slate-950 p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-300">
              100% SHIELD · Emergency Kill Switch
            </span>
            <input
              type="checkbox"
              checked={killSwitchActive}
              onChange={(event) => onKillSwitchToggle?.(event.target.checked)}
              className="h-5 w-5 accent-red-500"
              aria-label="Emergency kill switch"
            />
          </label>
        </div>
      ) : null}

      <div className="dondon-stage relative w-full max-w-xs overflow-hidden">
        <div
          className="dondon-fallback-block absolute inset-0 rounded-2xl"
          style={{ backgroundColor: asset.fallbackColor }}
          aria-hidden
        />
        <img
          src={asset.src}
          alt={asset.alt}
          className={[
            "dondon-hud-image relative z-10 mx-auto max-h-[min(145px,28vw)] w-auto max-w-full object-contain object-center",
            asset.imageClassName,
            asset.overlayClassName ?? "",
          ].join(" ")}
          style={{
            filter:
              state.mood === "SYSTEM_PAUSED"
                ? "grayscale(1) brightness(0.85)"
                : undefined,
          }}
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
        {asset.overlayClassName === "dondon-overlay-monocle" ? (
          <span
            className="dondon-monocle-badge absolute right-2 top-2 z-20 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white"
            aria-hidden
          >
            Admin
          </span>
        ) : null}
      </div>
    </section>
  );
}
