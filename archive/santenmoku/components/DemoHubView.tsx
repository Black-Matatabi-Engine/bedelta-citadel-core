import { useMemo, useState } from "react";
import { buildDemoHubInput } from "./DemoHubController";
import { DonDonHUD } from "./DonDonHUD";
import { evaluateDonDonMood } from "../services/dondonEngine";
import {
  DEMO_HUB_MOODS,
  DON_DON_CONTROL_MODES,
  DonDonMood,
  type DonDonControlMode,
} from "../types/dondon";

const MOOD_LABELS: Record<DonDonMood, string> = {
  [DonDonMood.WALLET_NOT_LINKED]: "Wallet",
  [DonDonMood.SEARCHING]: "Search",
  [DonDonMood.DEFENSIVE]: "Defense",
  [DonDonMood.ROOTSHIELD_ACTIVE]: "Root Shield",
  [DonDonMood.ALERT]: "Alert",
  [DonDonMood.RAGE_FOMO]: "Rage/FOMO",
  [DonDonMood.VICTORY]: "Victory",
  [DonDonMood.TIER_UPGRADE]: "Tier Up",
  [DonDonMood.ADMIN_MODE]: "Admin",
  [DonDonMood.SYSTEM_PAUSED]: "Paused",
};

const MODE_LABELS: Record<DonDonControlMode, string> = {
  MANUAL: "Manual",
  SEMI_AUTO: "Semi-Auto",
  FULL_AUTO: "Full Auto",
};

const MIN_BALANCE = 1_000;
const MAX_BALANCE = 100_000;
const DEFAULT_BALANCE = 10_000;

export interface DemoHubViewProps {
  initialMood?: DonDonMood;
  initialBalanceUsd?: number;
  initialControlMode?: DonDonControlMode;
}

export function DemoHubView({
  initialMood = DonDonMood.SEARCHING,
  initialBalanceUsd = DEFAULT_BALANCE,
  initialControlMode = "SEMI_AUTO",
}: DemoHubViewProps): React.ReactNode {
  const [mood, setMood] = useState<DonDonMood>(initialMood);
  const [balanceUsd, setBalanceUsd] = useState(initialBalanceUsd);
  const [controlMode, setControlMode] =
    useState<DonDonControlMode>(initialControlMode);
  const [manualHoldProgressMs, setManualHoldProgressMs] = useState(0);
  const [killSwitchActive, setKillSwitchActive] = useState(true);

  const dondonState = useMemo(
    () =>
      evaluateDonDonMood({
        ...buildDemoHubInput(mood, { accountBalanceUsd: balanceUsd }),
        controlMode,
        manualHoldProgressMs,
        killSwitchActive,
        deadlockCooldownSec:
          mood === DonDonMood.RAGE_FOMO ? 60 : undefined,
        sessionExpirySeconds:
          mood === DonDonMood.ALERT ? 299 : undefined,
        positionSizeRatio: mood === DonDonMood.DEFENSIVE ? 0.3 : 1,
      }),
    [mood, balanceUsd, controlMode, manualHoldProgressMs, killSwitchActive],
  );

  return (
    <div className="demohub-view mx-auto max-w-3xl space-y-6 p-4">
      <header className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
        <h1 className="text-lg font-bold text-white">DemoHub · DonDon State Switcher</h1>
        <p className="text-xs text-slate-400">
          Dev toolbar — numbers-first HUD · 3 control modes · anti-FOMO friction
        </p>
      </header>

      <div
        className="demohub-toolbar rounded-xl border border-slate-700 bg-slate-950 p-4"
        role="toolbar"
        aria-label="DonDon dev controls"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Control Mode
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {DON_DON_CONTROL_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className={[
                "rounded-lg px-3 py-1 text-[11px] font-semibold transition",
                controlMode === mode
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700",
              ].join(" ")}
              onClick={() => {
                setControlMode(mode);
                setManualHoldProgressMs(0);
              }}
              aria-pressed={controlMode === mode}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Mood Quick-Switch
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_HUB_MOODS.map((item) => (
            <button
              key={item}
              type="button"
              className={[
                "rounded-lg px-2 py-1 text-[11px] font-semibold transition",
                mood === item
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700",
              ].join(" ")}
              onClick={() => setMood(item)}
              aria-pressed={mood === item}
            >
              {MOOD_LABELS[item]}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Account Balance · ${balanceUsd.toLocaleString()}
          <input
            type="range"
            min={MIN_BALANCE}
            max={MAX_BALANCE}
            step={500}
            value={balanceUsd}
            onChange={(event) => setBalanceUsd(Number(event.target.value))}
            className="mt-2 w-full accent-emerald-400"
          />
        </label>

        <p className="mt-2 font-mono text-xs text-emerald-300">
          {dondonState.dynamicMaxSL.toFixed(2)} SL ·{" "}
          {(dondonState.dynamicMaxSL * 2).toFixed(2)} TP · latch{" "}
          {dondonState.isSafetyLatchUnlocked ? "UNLOCKED" : "LOCKED"}
        </p>
      </div>

      <DonDonHUD
        state={dondonState}
        onManualHoldProgress={setManualHoldProgressMs}
        killSwitchActive={killSwitchActive}
        onKillSwitchToggle={setKillSwitchActive}
        showAlertModal={false}
      />
    </div>
  );
}

export default DemoHubView;
