import type { DonDonState } from "../types/dondon";
import { DonDonMood } from "../types/dondon";
import { MANUAL_HOLD_CONFIRM_MS } from "../services/dondonEngine";

export interface DonDonAlertModalProps {
  state: DonDonState;
  open?: boolean;
  onDismiss?: () => void;
}

export function DonDonAlertModal({
  state,
  open = true,
  onDismiss,
}: DonDonAlertModalProps): React.ReactNode {
  if (!open) return null;

  const isFomoBlock =
    state.mood === DonDonMood.RAGE_FOMO || state.mood === DonDonMood.ALERT;
  const needsHold =
    state.controlMode === "MANUAL" && !state.isSafetyLatchUnlocked;

  if (!isFomoBlock && !needsHold) return null;

  const holdRemainingMs = Math.max(
    0,
    MANUAL_HOLD_CONFIRM_MS - state.manualHoldProgressMs,
  );

  return (
    <div
      className="dondon-alert-modal fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="alertdialog"
      aria-labelledby="dondon-alert-title"
      aria-describedby="dondon-alert-body"
    >
      <div
        className="w-full max-w-md rounded-xl border-2 p-5 shadow-2xl"
        style={{ borderColor: state.colorHue, backgroundColor: "#0f172a" }}
      >
        <h2
          id="dondon-alert-title"
          className="text-lg font-bold text-white"
        >
          {needsHold ? `${(holdRemainingMs / 1000).toFixed(1)}s HOLD · Anti-FOMO Latch` : `${state.volatilityIndex}/100 VOL · Circuit Alert`}
        </h2>
        <p id="dondon-alert-body" className="mt-2 text-sm text-slate-300">
          {needsHold
            ? "Hold slide control for 1.5s to unlock safety latch before execution."
            : state.overheadHUDText.split("\n")[0]}
        </p>
        {onDismiss ? (
          <button
            type="button"
            className="mt-4 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
            onClick={onDismiss}
          >
            Acknowledge
          </button>
        ) : null}
      </div>
    </div>
  );
}
