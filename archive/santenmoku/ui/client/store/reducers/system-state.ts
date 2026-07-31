/**
 * Pure SystemState reducer — only the dashboard store may apply patches.
 * Direction: HEALTH CRI 100 → 0 (higher = healthier).
 */

import {
  HEALTH_CRI_AMBER_THRESHOLD,
  HEALTH_CRI_MIN,
  HEALTH_CRI_SANTENMOKU_THRESHOLD,
} from "../../../../config/constants";

export type ClientHudState =
  | "IDLE"
  | "GREEN"
  | "AMBER"
  | "SANTENMOKU"
  | "BLOCKED";

export interface ClientSystemState {
  accountBalanceUsd: number;
  currentCri: number;
  dynamicMaxSL: number;
  hudState: ClientHudState;
  hardlock: boolean;
  signingChannelOpen: boolean;
  isSandboxMode?: boolean;
  isStale?: boolean;
  isHedgeActive?: boolean;
  taijiMode?: string;
  activeGate?: string;
}

export type SystemStatePatch = Partial<ClientSystemState>;

export function resolveHudStateFromHealthCri(
  currentCri: number,
  hardlock: boolean,
  synced = true,
): ClientHudState {
  if (hardlock || currentCri <= HEALTH_CRI_MIN) return "BLOCKED";
  if (!synced) return "IDLE";
  if (currentCri <= HEALTH_CRI_SANTENMOKU_THRESHOLD) return "SANTENMOKU";
  if (currentCri <= HEALTH_CRI_AMBER_THRESHOLD) return "AMBER";
  return "GREEN";
}

/** Pure merge — returns next snapshot without mutating input. */
export function reduceSystemState(
  current: ClientSystemState,
  patch: SystemStatePatch,
): ClientSystemState {
  if (!patch || typeof patch !== "object") return current;

  const balance = Number(patch.accountBalanceUsd);
  const cri = Number(patch.currentCri);
  const maxSl = Number(patch.dynamicMaxSL);

  const merged: ClientSystemState = {
    accountBalanceUsd: Number.isFinite(balance)
      ? balance
      : current.accountBalanceUsd,
    currentCri: Number.isFinite(cri) ? cri : current.currentCri,
    dynamicMaxSL: Number.isFinite(maxSl) ? maxSl : current.dynamicMaxSL,
    hudState: patch.hudState ?? current.hudState,
    hardlock:
      patch.hardlock === true ||
      (Number.isFinite(cri) && cri === HEALTH_CRI_MIN),
    signingChannelOpen:
      patch.signingChannelOpen !== false &&
      patch.hardlock !== true &&
      !(Number.isFinite(cri) && cri === HEALTH_CRI_MIN),
    isSandboxMode:
      patch.isSandboxMode != null
        ? patch.isSandboxMode === true
        : current.isSandboxMode === true,
    isStale:
      patch.isStale != null ? patch.isStale === true : current.isStale === true,
    isHedgeActive:
      patch.isHedgeActive != null
        ? patch.isHedgeActive === true
        : current.isHedgeActive === true,
    taijiMode: patch.taijiMode ?? current.taijiMode,
    activeGate: patch.activeGate ?? current.activeGate,
  };

  if (merged.hardlock || merged.currentCri === HEALTH_CRI_MIN) {
    merged.signingChannelOpen = false;
  }

  return merged;
}

export function isSystemHardlocked(state: ClientSystemState): boolean {
  return (
    state.hardlock === true ||
    state.currentCri === HEALTH_CRI_MIN ||
    state.signingChannelOpen === false
  );
}
