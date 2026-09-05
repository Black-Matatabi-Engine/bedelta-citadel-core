/**
 * Unified cross-chain risk engine — lean core re-export.
 */

export { HardlockError, RiskLimitExceeded } from "./risk";

export type {
  RiskVenue,
  FoolProofIntent,
  FundingRegimeIntent,
  RiskIntent,
  GlobalRiskPolicyResult,
  GatewayRulesInput,
  GatewayRulesResult,
  CitadelRiskGateVerdict,
} from "./risk-engine-lib/risk-engine-types";

export {
  FLAGS_CLEAR,
  FLAGS_SEVERED,
  FLAGS_IMBALANCE_TRIP,
  FLAGS_COLLATERAL_TRIP,
  FLAGS_YIELD_SHOCK,
  FLAGS_SLIPPAGE_TRIP,
  FLAGS_HF_TRIP,
  FLAGS_NAV_VIOLATION,
  FLAGS_HL_SESSION,
  FLAGS_HL_SIZE,
  FLAGS_HL_SPREAD,
  FLAGS_HL_RATE,
  PROTO_VECT_LEN,
  PROTO_SLOT,
  PROTO_GMX,
  PROTO_PENDLE,
  PROTO_CAMELOT,
  PROTO_RADIANT,
  PROTO_JONES,
  PROTO_HL,
  packProtocolLane,
  evaluateGmxFlags,
  evaluatePendleFlags,
  evaluateCamelotFlags,
  evaluateRadiantFlags,
  evaluateJonesFlags,
  evaluateHlSessionFlags,
  checkSoilResistance,
  evaluateGatewayRules,
  assertCitadelRiskGate,
  evaluateGlobalRiskPolicy,
} from "./risk-engine-core";

export { isGatewayNominalFastPath } from "./risk-engine-core";
