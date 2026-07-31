import {
  AUTO_PILOT_BASIS_BADGE,
  MILESTONE_SANDBOX_BADGE,
} from "../../services/copilot-care-messages";

export interface ExecutionGatePanelProps {
  isLocked: boolean;
  lockReason?: string;
  maxLoss: number;
  sessionKeyLabel: string;
  circuitBreakerTripped: boolean;
  onFire?: () => void;
}

export function ExecutionGatePanel({
  isLocked,
  lockReason,
  maxLoss,
  sessionKeyLabel,
  circuitBreakerTripped,
  onFire,
}: ExecutionGatePanelProps): React.ReactNode {
  const executionLocked = isLocked || circuitBreakerTripped;

  return (
    <section
      className="santen-group santen-group--fire circuit-panel flex min-h-full flex-col p-4"
      aria-label="Order Execution and HotKey Gate"
    >
      <h2 className="panel-title-text font-hud text-[0.7rem] tracking-[0.18em]">
        Group 3 · Fire Step
      </h2>
      <p className="mt-1 font-data text-[10px] text-[rgba(160,255,224,0.55)]">
        HotKey gate · Session Key · risk posture
      </p>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-4 text-center">
        {executionLocked ? (
          <>
            <p className="text-lg font-black text-indigo-200">( GUARD 陰 MODE )</p>
            <p className="font-data text-xs text-amber-100/90">
              {lockReason ??
                "🐾 DonDon Co-Pilot: Javier's dynamic shield is protecting your equity."}
            </p>
          </>
        ) : (
          <p className="font-data text-xs text-[#45C4B4]">Risk posture · CLEAR</p>
        )}

        <p className="font-data text-[10px] text-[var(--text-secondary)]">
          Session Key ·{" "}
          <span
            className={
              sessionKeyLabel === "ACTIVE"
                ? "text-[#45C4B4]"
                : "text-amber-300"
            }
          >
            {sessionKeyLabel}
          </span>
        </p>

        <button
          type="button"
          onClick={onFire}
          disabled={executionLocked}
          className={[
            "mint-btn attack-btn-xl w-full max-w-[220px]",
            executionLocked ? "opacity-50" : "",
          ].join(" ")}
        >
          {executionLocked ? "LOCKED 🔒" : "SAFE TO FIRE 🔥"}
        </button>

        <p className="font-data text-xs text-[#45C4B4]">
          Max Risk ${maxLoss.toFixed(0)} USD
        </p>
      </div>

      <div
        className="grant-scope-placeholder mt-4 rounded-lg border-2 border-dashed border-amber-400/45 bg-amber-950/20 px-3 py-4 text-center font-data text-[10px] leading-relaxed text-amber-100/80"
        aria-label="Grant scope placeholder"
      >
        <span className="milestone-remark-badge">{MILESTONE_SANDBOX_BADGE}</span>
        <p className="mt-2">{AUTO_PILOT_BASIS_BADGE}</p>
      </div>
    </section>
  );
}
