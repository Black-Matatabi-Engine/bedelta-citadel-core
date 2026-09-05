/** Core state override + R20 severance — no risk-control import (breaks cycles). */
import {
  buildSystemState,
  type SystemState,
} from "../services/systemState";
import { enrichSystemStateVectorEquilibrium } from "../services/vector-equilibrium";

export interface CoreSystemState extends SystemState {
  isHedgeActive: boolean;
}

let activeStateOverride: CoreSystemState | null = null;

export function readStateOverride(): CoreSystemState | null {
  return activeStateOverride;
}

export function writeStateOverride(state: CoreSystemState | null): void {
  activeStateOverride = state;
}

/** Immediately sever the Session Key signing channel (physical R20 hardlock). */
export function severSigningChannel(): CoreSystemState {
  const current =
    activeStateOverride ??
    enrichSystemStateVectorEquilibrium(
      { ...buildSystemState({ skipHardlockAssert: true }), isHedgeActive: false },
      { isHedgeActive: false },
    );

  const next: CoreSystemState = {
    ...current,
    signingChannelOpen: false,
    hardlock: true,
    currentCri: 0,
    hudState: "BLOCKED",
    sessionKeyStatus: "R20_DEADLOCK",
    isHedgeActive: false,
  };

  activeStateOverride = enrichSystemStateVectorEquilibrium(next, {
    soilTripped: true,
    isHedgeActive: false,
  });
  return activeStateOverride;
}
