import {
  getBlackSwanDefenseHudLabel,
  getRecentBlackSwanLogs,
  isBlackSwanDefenseActive,
  readBlackSwanActiveTriggers,
  type BlackSwanLogPayload,
} from "../../core/black-swan-guard";
import {
  isR20Locked,
  readActiveSystemState,
  type CoreSystemState,
  type HudState,
} from "../../core/state";
import { CORS_JSON_HEADERS } from "../../services/config";
import {
  auditThreeEyeAdapters,
  readCounterAttackTelemetryStatus,
  type CounterAttackStatus,
  type SantenmokuThreeEyeStatus,
  type TelemetryVenue,
  type VenueAdapterAudit,
} from "../../services/santenmoku-three-eye";

export type SoilResistanceTelemetryStatus = "PASS" | "STANDBY" | "LOCKED";

export interface TelemetryHealthResponse {
  success: true;
  timestamp: string;
  criIndex: number;
  hudState: HudState;
  soilResistance: {
    status: SoilResistanceTelemetryStatus;
    hedgeChannelActive: boolean;
  };
  activeVenues: readonly TelemetryVenue[];
  santenmokuStatus: SantenmokuThreeEyeStatus;
  adapterAudit: readonly VenueAdapterAudit[];
  circuitBreakers: {
    r20Locked: boolean;
    hardlock: boolean;
    signingChannelOpen: boolean;
    dynamicMaxSlUsd: number;
  };
  counterAttackStatus: CounterAttackStatus;
  blackSwanDefense: {
    active: boolean;
    hudTag: string | null;
    triggers: readonly string[];
    recentLogs: readonly BlackSwanLogPayload[];
  };
}

function resolveSoilResistanceStatus(
  state: CoreSystemState,
): SoilResistanceTelemetryStatus {
  if (isR20Locked(state) || state.hardlock) return "LOCKED";
  if (state.isHedgeActive) return "PASS";
  return "STANDBY";
}

/** GET /api/telemetry/health — public metrics without secrets or internal config. */
export function handleTelemetryHealthRequest(): Response {
  const state = readActiveSystemState();
  const threeEye = auditThreeEyeAdapters(state);

  const body: TelemetryHealthResponse = {
    success: true,
    timestamp: new Date().toISOString(),
    criIndex: state.currentCri,
    hudState: state.hudState,
    soilResistance: {
      status: resolveSoilResistanceStatus(state),
      hedgeChannelActive: state.isHedgeActive,
    },
    activeVenues: threeEye.activeVenues,
    santenmokuStatus: threeEye.santenmokuStatus,
    adapterAudit: threeEye.adapters,
    circuitBreakers: {
      r20Locked: isR20Locked(state),
      hardlock: state.hardlock,
      signingChannelOpen: state.signingChannelOpen,
      dynamicMaxSlUsd: state.dynamicMaxSL,
    },
    counterAttackStatus: readCounterAttackTelemetryStatus(state),
    blackSwanDefense: {
      active: isBlackSwanDefenseActive(),
      hudTag: getBlackSwanDefenseHudLabel(),
      triggers: readBlackSwanActiveTriggers(),
      recentLogs: getRecentBlackSwanLogs(),
    },
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: CORS_JSON_HEADERS,
  });
}
