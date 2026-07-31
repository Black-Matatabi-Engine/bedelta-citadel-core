/**
 * GET /api/hud-stream — debounced Santenmoku HUD telemetry (100ms).
 */

import {
  getBlackSwanDefenseHudLabel,
  isBlackSwanDefenseActive,
  readBlackSwanActiveTriggers,
} from "../core/black-swan-guard";
import { isR20Locked, readActiveSystemState, type CoreSystemState } from "../core/state";
import { CORS_JSON_HEADERS } from "../services/config";
import { validateHudStreamRequest } from "../services/defense/ui-canary";
import {
  auditThreeEyeAdapters,
  TELEMETRY_VENUES,
} from "../services/santenmoku-three-eye";

export const HUD_STREAM_DEBOUNCE_MS = 100;

export const HUD_FALLBACK_LIVE_PAIRS = 162;

export type HudConnectivityMode =
  | "CONNECTED"
  | "CONNECTED_MOCK"
  | "STANDBY"
  | "DISCONNECTED";

export interface HudMarketPair {
  symbol: string;
  annualYieldPct: number;
}

export interface HudMarketProbe {
  selectToken: string;
  bestToken: string;
  topPairs: readonly HudMarketPair[];
  livePairsCount: number;
}

export const HUD_FALLBACK_MARKET_PROBE: HudMarketProbe = {
  selectToken: "BTC",
  bestToken: "SOL",
  livePairsCount: HUD_FALLBACK_LIVE_PAIRS,
  topPairs: [
    { symbol: "SOL", annualYieldPct: 24.6 },
    { symbol: "ETH", annualYieldPct: 18.2 },
    { symbol: "BTC", annualYieldPct: 12.4 },
  ],
};

export interface HudStreamPayload {
  success: true;
  timestamp: string;
  debounceMs: number;
  isStale: boolean;
  connectivityMode: HudConnectivityMode;
  marketProbe: HudMarketProbe;
  leftEyeDefense: {
    status: "PASS" | "STANDBY" | "LOCKED";
    dynamicMaxSlUsd: number;
    hardlock: boolean;
  };
  rightEyeProbe: {
    status: "ACTIVE" | "STANDBY" | "OFFLINE";
    santenmokuStatus: string;
    activeVenues: readonly string[];
  };
  crownTreasuryPnl: {
    accountBalanceUsd: number;
    estimatedPnlUsd: number;
    criIndex: number;
    hudState: string;
  };
  blackSwanDefense: {
    active: boolean;
    hudTag: string | null;
    triggers: readonly string[];
  };
}

let lastStream: { at: number; body: HudStreamPayload } | null = null;

function isHudDryRunView(state: CoreSystemState): boolean {
  return (
    !state.signingChannelOpen ||
    state.isSandboxMode ||
    state.hardlock ||
    isR20Locked(state)
  );
}

function resolveConnectivityMode(
  state: CoreSystemState,
  dryRun: boolean,
  rightStatus: HudStreamPayload["rightEyeProbe"]["status"],
): HudConnectivityMode {
  if (dryRun) return "CONNECTED_MOCK";
  if (state.hardlock || isR20Locked(state)) return "DISCONNECTED";
  if (rightStatus === "STANDBY" || state.isStale) return "STANDBY";
  return "CONNECTED";
}

export function buildHudStreamPayload(now = Date.now()): HudStreamPayload {
  const state = readActiveSystemState();
  const threeEye = auditThreeEyeAdapters(state);
  const dryRun = isHudDryRunView(state);

  const leftStatus = dryRun
    ? "STANDBY"
    : state.hardlock
      ? "LOCKED"
      : state.isHedgeActive
        ? "PASS"
        : "STANDBY";

  const rightStatus = dryRun
    ? "STANDBY"
    : threeEye.santenmokuStatus === "THREE_EYES_ACTIVE"
      ? "ACTIVE"
      : threeEye.santenmokuStatus === "THREE_EYES_DEGRADED"
        ? "STANDBY"
        : "OFFLINE";

  const useFallbackMarket =
    dryRun || threeEye.activeVenues.length === 0 || rightStatus !== "ACTIVE";

  const estimatedPnlUsd = state.accountBalanceUsd - 10_000;
  const connectivityMode = resolveConnectivityMode(state, dryRun, rightStatus);

  return {
    success: true,
    timestamp: new Date(now).toISOString(),
    debounceMs: HUD_STREAM_DEBOUNCE_MS,
    isStale: dryRun ? false : state.isStale,
    connectivityMode,
    marketProbe: useFallbackMarket
      ? HUD_FALLBACK_MARKET_PROBE
      : {
          selectToken: HUD_FALLBACK_MARKET_PROBE.selectToken,
          bestToken: HUD_FALLBACK_MARKET_PROBE.bestToken,
          livePairsCount: HUD_FALLBACK_LIVE_PAIRS,
          topPairs: HUD_FALLBACK_MARKET_PROBE.topPairs,
        },
    leftEyeDefense: {
      status: leftStatus,
      dynamicMaxSlUsd: state.dynamicMaxSL,
      hardlock: dryRun ? false : state.hardlock,
    },
    rightEyeProbe: {
      status: rightStatus,
      santenmokuStatus: dryRun
        ? "THREE_EYES_STANDBY"
        : threeEye.santenmokuStatus,
      activeVenues: dryRun
        ? TELEMETRY_VENUES
        : threeEye.activeVenues.length > 0
          ? threeEye.activeVenues
          : TELEMETRY_VENUES,
    },
    crownTreasuryPnl: {
      accountBalanceUsd: state.accountBalanceUsd,
      estimatedPnlUsd,
      criIndex: state.currentCri,
      hudState: dryRun ? "IDLE" : state.hudState,
    },
    blackSwanDefense: {
      active: isBlackSwanDefenseActive(),
      hudTag: getBlackSwanDefenseHudLabel(),
      triggers: readBlackSwanActiveTriggers(),
    },
  };
}

export function handleHudStreamRequest(request: Request): Response {
  const auth = validateHudStreamRequest(request);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ success: false, error: auth.message, locked: true }),
      { status: auth.status, headers: CORS_JSON_HEADERS },
    );
  }

  const now = Date.now();
  if (lastStream && now - lastStream.at < HUD_STREAM_DEBOUNCE_MS) {
    return new Response(JSON.stringify(lastStream.body), {
      status: 200,
      headers: CORS_JSON_HEADERS,
    });
  }

  const body = buildHudStreamPayload(now);
  lastStream = { at: now, body };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: CORS_JSON_HEADERS,
  });
}

/** @internal test reset */
export function __resetHudStreamDebounceForTests(): void {
  lastStream = null;
}
