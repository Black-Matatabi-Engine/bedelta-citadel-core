/**
 * Demo override reducer — all Demo Hub mutations flow through __SV_DEMO__ dispatch.
 */

export type DevRootStatus = "PASS" | "WARN" | "TRIPPED";

export interface SvDemoState {
  forceDefcon1: boolean;
  rootStatus: Record<number, DevRootStatus>;
  rootTripped: Record<number, boolean>;
  mockHlTxCount: number;
}

export type SvDemoAction =
  | { type: "DEMO_INIT" }
  | { type: "DEMO_TOGGLE_FORCE_DEFCON1" }
  | { type: "DEMO_SET_FORCE_DEFCON1"; value: boolean }
  | { type: "DEMO_SET_ROOT_STATUS"; root: number; status: DevRootStatus }
  | { type: "DEMO_CYCLE_ROOT_STATUS"; root: number; next: DevRootStatus }
  | { type: "DEMO_SET_MOCK_HL_TX_COUNT"; value: number };

export const DEFAULT_SV_DEMO_STATE: SvDemoState = {
  forceDefcon1: false,
  rootStatus: {},
  rootTripped: {},
  mockHlTxCount: 0,
};

export function normalizeDevRootStatus(
  raw: unknown,
): DevRootStatus {
  const s = String(raw || "PASS").toUpperCase();
  if (s === "WARN" || s === "WARNING") return "WARN";
  if (s === "TRIPPED" || s === "TRIP") return "TRIPPED";
  return "PASS";
}

export function reduceDemoState(
  state: SvDemoState,
  action: SvDemoAction,
): SvDemoState {
  switch (action.type) {
    case "DEMO_INIT":
      return { ...DEFAULT_SV_DEMO_STATE, ...state };
    case "DEMO_TOGGLE_FORCE_DEFCON1":
      return { ...state, forceDefcon1: !state.forceDefcon1 };
    case "DEMO_SET_FORCE_DEFCON1":
      return { ...state, forceDefcon1: action.value === true };
    case "DEMO_SET_ROOT_STATUS": {
      const root = Math.trunc(action.root);
      if (root < 1 || root > 20) return state;
      const status = normalizeDevRootStatus(action.status);
      return {
        ...state,
        rootStatus: { ...state.rootStatus, [root]: status },
        rootTripped: {
          ...state.rootTripped,
          [root]: status === "TRIPPED",
        },
      };
    }
    case "DEMO_CYCLE_ROOT_STATUS": {
      const root = Math.trunc(action.root);
      if (root < 1 || root > 20) return state;
      const status = normalizeDevRootStatus(action.next);
      return {
        ...state,
        rootStatus: { ...state.rootStatus, [root]: status },
        rootTripped: {
          ...state.rootTripped,
          [root]: status === "TRIPPED",
        },
      };
    }
    case "DEMO_SET_MOCK_HL_TX_COUNT": {
      const tx = Number(action.value);
      if (!Number.isFinite(tx)) return state;
      return {
        ...state,
        mockHlTxCount: Math.max(0, Math.floor(tx)),
      };
    }
    default:
      return state;
  }
}
