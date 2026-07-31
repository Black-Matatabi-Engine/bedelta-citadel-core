import { useCallback, useState } from "react";
import {
  AUTO_PILOT_BASIS_BADGE,
  MILESTONE_SANDBOX_BADGE,
  R20_DEADLOCK_OVERLAY_BODY,
  R20_DEADLOCK_OVERLAY_TITLE,
} from "../services/copilot-care-messages";

export interface ExecutionShieldProps {
  onEmergencyCloseAll?: () => void;
  onDefcon1?: () => void;
  milestoneBadge?: string;
}

/** Step 3 Execution Shield — tactile emergency controls + R20 overlay. */
export function ExecutionShield({
  onEmergencyCloseAll,
  onDefcon1,
  milestoneBadge = MILESTONE_SANDBOX_BADGE,
}: ExecutionShieldProps): React.ReactNode {
  const [deadlockOpen, setDeadlockOpen] = useState(false);

  const handleDefcon1 = useCallback(() => {
    setDeadlockOpen(true);
    onDefcon1?.();
  }, [onDefcon1]);

  return (
    <>
      <div className="step3-emergency-row flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="emergency-close-all-btn tactile-emergency-btn execution-shield-tactile-btn"
          onClick={onEmergencyCloseAll}
        >
          🚨 EMERGENCY CLOSE ALL
        </button>
        <button
          type="button"
          className="typo-action tactile-emergency-btn tactile-defcon-btn execution-shield-tactile-btn rounded border border-red-500/40 bg-red-950/50 px-3 py-1.5 text-red-200 hover:bg-red-900/50"
          onClick={handleDefcon1}
        >
          DEFCON 1
        </button>
        <span
          className="auto-pilot-basis-badge sv-tip"
          title={AUTO_PILOT_BASIS_BADGE}
        >
          {AUTO_PILOT_BASIS_BADGE}
        </span>
        <span className="milestone-remark-badge">{milestoneBadge}</span>
      </div>

      {deadlockOpen ? (
        <div
          className="r20-deadlock-overlay"
          role="alertdialog"
          aria-labelledby="execution-shield-r20-title"
          aria-describedby="execution-shield-r20-body"
        >
          <div className="r20-deadlock-panel">
            <h2 id="execution-shield-r20-title">{R20_DEADLOCK_OVERLAY_TITLE}</h2>
            <p id="execution-shield-r20-body">{R20_DEADLOCK_OVERLAY_BODY}</p>
            <button
              type="button"
              className="mt-4 rounded-lg border border-red-400/50 bg-red-950/60 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-900/70"
              onClick={() => setDeadlockOpen(false)}
            >
              Acknowledge
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
