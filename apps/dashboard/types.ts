import type {
  AdaptiveGuardLights,
  YieldTriangleGateStatus,
  YieldTriangleResponse,
} from "../../src/services/yield-router";
import type { IntentPhase, IntentVenue } from "../../src/core/intent-ledger";

export type { AdaptiveGuardLights, YieldTriangleGateStatus, YieldTriangleResponse };

export type IntentStreamKind =
  | "CREATE"
  | "PREPARE"
  | "COMMIT"
  | "ABORT"
  | "FLATTEN"
  | "TTL";

export interface IntentStreamEvent {
  id: string;
  ts: number;
  kind: IntentStreamKind;
  phase: IntentPhase;
  intentId: string;
  message: string;
  highlight?: boolean;
  venue?: IntentVenue;
}

export interface YieldTriangleViewModel {
  symbol: string;
  hlApy: number;
  jupiterImpactBps: number;
  polymarketSpreadBps: number;
  fundingRateBps: number;
  netApyBand: { min: number; base: number; max: number } | null;
  gateStatus: YieldTriangleGateStatus;
  guardLights: AdaptiveGuardLights;
  fetchedAt: string;
  loading: boolean;
  error: string | null;
}
