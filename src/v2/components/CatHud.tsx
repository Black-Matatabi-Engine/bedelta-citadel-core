import type { HudMarketProbe, HudStreamPayload } from "../../api/hud-telemetry";
import {
  generateCanvasWatermarkPayload,
  HUD_CANARY_EXPECTED,
  isHudCanaryAuthenticated,
} from "../../services/defense/ui-canary";
import type { HudState } from "../../services/systemState";
import { resolveHudState } from "../../services/systemState";

export type ConnectivityStatus =
  | "Connected"
  | "Connected · Mock"
  | "Stale"
  | "Disconnected / Locked State";

export interface CatHudProps {
  criScore: number;
  hardlock?: boolean;
  primaryMode: string;
  connectivity: ConnectivityStatus;
  marketProbe?: HudMarketProbe | null;
  connectivityMode?: HudStreamPayload["connectivityMode"];
}

const CAT_IMAGES: Record<HudState, string> = {
  IDLE: "/brand/dondon_normal.png",
  GREEN: "/brand/dondon_normal.png",
  AMBER: "/brand/dondon_warning.png",
  SANTENMOKU: "/brand/dondon_godmode.png",
  BLOCKED: "/brand/dondon_deadlock.png",
};

const HUD_LABELS: Record<HudState, string> = {
  IDLE: "Standby",
  GREEN: "Green Scan",
  AMBER: "Amber Alert",
  SANTENMOKU: "SANTENMOKU",
  BLOCKED: "DEADLOCK",
};

function hudStateClass(hudState: HudState): string {
  if (hudState === "BLOCKED") return "cat-hud-state-blocked";
  if (hudState === "SANTENMOKU") return "cat-hud-state-god";
  if (hudState === "AMBER") return "cat-hud-state-amber";
  return "cat-hud-state-normal";
}

function connectivityClass(status: ConnectivityStatus): string {
  if (status === "Connected" || status === "Connected · Mock") {
    return "connectivity-chip--ok";
  }
  if (status === "Stale") return "connectivity-chip--stale";
  return "connectivity-chip--locked";
}

function resolveDisplayHudState(
  criScore: number,
  hardlock: boolean,
  connectivityMode?: HudStreamPayload["connectivityMode"],
): HudState {
  if (
    connectivityMode === "CONNECTED_MOCK" ||
    connectivityMode === "STANDBY"
  ) {
    return resolveHudState(criScore, false, true);
  }
  return resolveHudState(criScore, hardlock, true);
}

export function CatHud({
  criScore,
  hardlock = false,
  primaryMode,
  connectivity,
  connectivityMode,
}: CatHudProps): React.ReactNode {
  const hudState = resolveDisplayHudState(criScore, hardlock, connectivityMode);
  const watermark = generateCanvasWatermarkPayload();
  const canaryValid = isHudCanaryAuthenticated();

  return (
    <section
      className="cat-hud-panel circuit-panel santen-group santen-group--dondon h-full"
      aria-label="DonDon Overview"
      data-xuanwu-watermark={watermark.hash}
      data-webgl-hint={watermark.webglHint}
      data-hud-canary={HUD_CANARY_EXPECTED}
      data-hud-canary-valid={canaryValid ? "true" : "false"}
    >
      <p className="panel-title-text px-4 pt-4 font-hud text-[0.7rem] tracking-[0.18em]">
        Group 1 · DonDon Overview
      </p>

      <div className="flex flex-col items-center gap-4 px-4 py-5 text-center">
        <img
          src={CAT_IMAGES[hudState]}
          alt="DonDon"
          className="h-24 w-24 rounded-full border border-[rgba(80,210,193,0.35)] object-cover"
          decoding="async"
        />
        <div>
          <h2 className={`brand-hero-title font-hud text-lg ${hudStateClass(hudState)}`}>
            {HUD_LABELS[hudState]}
          </h2>
          <p className="mt-2 font-data text-sm text-[var(--text-secondary)]">
            mode{" "}
            <span className="font-bold uppercase text-[#45C4B4]">
              {primaryMode}
            </span>
          </p>
        </div>
        <span
          className={["connectivity-chip font-data text-xs", connectivityClass(connectivity)].join(
            " ",
          )}
        >
          {connectivity}
        </span>
      </div>
    </section>
  );
}
