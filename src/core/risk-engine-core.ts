/** Lean Santenmoku risk engine — f64 protocol lanes + bitmask invariants (<200 LOC). */
import { R20_LOCKED, readActiveSystemState } from "./state";
import { checkFoolProofGuard } from "../services/fool-proof-guard";
import { HardlockError, RiskLimitExceeded, evaluateFundingRegimePolicy, checkSoilResistance as checkSoilResistanceBase, vineWrapProtection, MAX_SLIPPAGE, isTsunamiShieldWindow, isR20Locked, type SoilResistanceInput, type SoilResistanceResult } from "./risk";
import { resolveSoilMinDepthUsd } from "../services/risk-control";
import { evaluateSoilSlippagePacked, packSoilLane } from "../services/risk-control-lib/soil-resistance-math";
import { isXyzOrHip3Key } from "../services/exchanges/asset-classifier-lib/asset-classifier-keywords";
import { isArbitrumStatusSequencerHealthy } from "../services/adapters/arbitrum-status-sentinel";
import { isRpcRadarSequencerHealthy } from "../services/adapters/rpc-radar";
import { isSequencerSafe } from "../services/risk/sequencer-guard";
import { isArbitrumGasGuardBlocked } from "../services/risk/arbitrum-gas-guard";
import { isSoftConfirmationSafe } from "../services/risk/soft-confirmation-guard";
import type { CitadelRiskGateVerdict, GatewayRulesInput, GatewayRulesResult, GlobalRiskPolicyResult, RiskIntent } from "./risk-engine-lib/risk-engine-types";
import { deny } from "./risk-engine-lib/risk-engine-types";

export const FLAGS_CLEAR = 0;
export const FLAGS_SEVERED = 1 << 0;
export const FLAGS_IMBALANCE_TRIP = 1 << 1;
export const FLAGS_COLLATERAL_TRIP = 1 << 2;
export const FLAGS_YIELD_SHOCK = 1 << 3;
export const FLAGS_SLIPPAGE_TRIP = 1 << 4;
export const FLAGS_HF_TRIP = 1 << 5;
export const FLAGS_NAV_VIOLATION = 1 << 6;
export const FLAGS_HL_SESSION = 1 << 7;
export const FLAGS_HL_SIZE = 1 << 8;
export const FLAGS_HL_SPREAD = 1 << 9;
export const FLAGS_HL_RATE = 1 << 10;
export const PROTO_VECT_LEN = 24;
export const PROTO_SLOT = 4;
export const PROTO_GMX = 0;
export const PROTO_PENDLE = 4;
export const PROTO_CAMELOT = 8;
export const PROTO_RADIANT = 12;
export const PROTO_JONES = 16;
export const PROTO_HL = 20;
export const GMX_IMBALANCE_MAX = 0.35;
export const GMX_COLLATERAL_MIN = 1.05;
export const PENDLE_YIELD_SHOCK_MAX_BPS = 150;
export const CAMELOT_SLIPPAGE_MAX_BPS = 50;
export const RADIANT_HF_MIN = 1.15;
export const JONES_NAV_MAX_BPS = 30;
export const HL_SPREAD_MAX_BPS = 20;
export const HL_RATE_LIMIT_RPM = 120;

const GATEWAY_CLEAR: GatewayRulesResult = Object.freeze({ blocked: false, tripped: false, crashed: false, failClosed: false, reasons: Object.freeze([]) });
const PAYLOAD_POISON: GatewayRulesResult = Object.freeze({ blocked: true, tripped: true, crashed: false, failClosed: true, reasons: Object.freeze(["PAYLOAD_POISON_FAIL_CLOSED"]) });
const SOIL_CLEAR: SoilResistanceResult = { ok: true, tripped: false, crossVenueSlippage: 0, spotPerpSlippage: 0, reasons: [] };
let soilRef: SoilResistanceInput | null = null;
let soilFast = false;

export function packProtocolLane(slot: number, a: number, b: number, c: number, d: number, out: Float64Array): Float64Array {
  out[slot] = a; out[slot + 1] = b; out[slot + 2] = c; out[slot + 3] = d;
  return out;
}

export function evaluateGmxFlags(vec: Float64Array, slot = PROTO_GMX): number {
  const oiL = vec[slot], oiS = vec[slot + 1], tvl = vec[slot + 2], coll = vec[slot + 3];
  let f = FLAGS_CLEAR;
  if (tvl > 0 && Math.abs(oiL - oiS) / tvl > GMX_IMBALANCE_MAX) f |= FLAGS_IMBALANCE_TRIP;
  if (coll !== 0 && (!Number.isFinite(coll) || coll < GMX_COLLATERAL_MIN)) f |= FLAGS_COLLATERAL_TRIP;
  return f;
}

export function evaluatePendleFlags(yieldCurrent: number, yieldOracle: number): number {
  return Math.abs(yieldCurrent - yieldOracle) * 10_000 > PENDLE_YIELD_SHOCK_MAX_BPS ? FLAGS_YIELD_SHOCK : FLAGS_CLEAR;
}

export function evaluateCamelotFlags(slippageBps: number, directionalFeeBps: number, maxDirBps: number): number {
  return (slippageBps > CAMELOT_SLIPPAGE_MAX_BPS || directionalFeeBps > maxDirBps) ? FLAGS_SLIPPAGE_TRIP : FLAGS_CLEAR;
}

export function evaluateRadiantFlags(hf: number, projected?: number, crossDest?: number): number {
  let f = FLAGS_CLEAR;
  if (!Number.isFinite(hf) || hf < RADIANT_HF_MIN) f |= FLAGS_HF_TRIP;
  if (projected !== undefined && projected < RADIANT_HF_MIN) f |= FLAGS_HF_TRIP;
  if (crossDest !== undefined && crossDest < RADIANT_HF_MIN) f |= FLAGS_HF_TRIP;
  return f;
}

export function evaluateJonesFlags(shareBps: number, navDevBps: number, sandwichTrip: boolean): number {
  let f = FLAGS_CLEAR;
  if (shareBps > JONES_NAV_MAX_BPS) f |= FLAGS_NAV_VIOLATION;
  if (sandwichTrip && navDevBps > JONES_NAV_MAX_BPS) f |= FLAGS_NAV_VIOLATION;
  return f;
}

export function evaluateHlSessionFlags(sessionValid: boolean, orderSize: number, maxSize: number, spreadBps: number, rpm: number): number {
  let f = FLAGS_CLEAR;
  if (!sessionValid) f |= FLAGS_HL_SESSION;
  if (orderSize > maxSize) f |= FLAGS_HL_SIZE;
  if (spreadBps > HL_SPREAD_MAX_BPS) f |= FLAGS_HL_SPREAD;
  if (rpm > HL_RATE_LIMIT_RPM) f |= FLAGS_HL_RATE;
  return f;
}

export function isGatewayNominalFastPath(soil: SoilResistanceInput): boolean {
  if (soilRef === soil) return soilFast;
  if (soil.crossSpread || soil.gmxPriceImpact || soil.pendleCrossGuard || soil.pendleOracle || soil.pendlePoolFactory || isXyzOrHip3Key(soil.symbol)) {
    soilRef = soil; soilFast = false; return false;
  }
  const lane = packSoilLane(soil.hlSpot, soil.hlPerp, soil.dydxPerp, soil.depthUsd ?? Number.NaN, soil.maxSlippage ?? MAX_SLIPPAGE, resolveSoilMinDepthUsd(soil));
  if (evaluateSoilSlippagePacked(lane).tripFlags !== 0 || isTsunamiShieldWindow(soil.at)) { soilRef = soil; soilFast = false; return false; }
  const atMs = soil.at?.getTime();
  const ok = isSequencerSafe(atMs) && isArbitrumStatusSequencerHealthy(atMs) && isRpcRadarSequencerHealthy(atMs) && !isArbitrumGasGuardBlocked() && isSoftConfirmationSafe(atMs);
  soilRef = soil; soilFast = ok; return ok;
}

export function checkSoilResistance(input: SoilResistanceInput): SoilResistanceResult {
  return isGatewayNominalFastPath(input) ? SOIL_CLEAR : checkSoilResistanceBase(input);
}

export function evaluateGatewayRules(input: GatewayRulesInput): GatewayRulesResult {
  if (input.payloadPoison) return PAYLOAD_POISON;
  const hasVine = input.estimatedLossUsd !== undefined && input.accountBalanceUsd !== undefined;
  if (!hasVine && isGatewayNominalFastPath(input.soil)) return GATEWAY_CLEAR;
  try {
    const soil = checkSoilResistance(input.soil);
    if (!soil.tripped) {
      if (!hasVine) return GATEWAY_CLEAR;
      vineWrapProtection({ symbol: input.symbol, estimatedLossUsd: input.estimatedLossUsd!, accountBalanceUsd: input.accountBalanceUsd!, criHardlock: input.criHardlock });
      return GATEWAY_CLEAR;
    }
    return { blocked: true, tripped: true, crashed: false, failClosed: true, reasons: soil.reasons };
  } catch (err) {
    if (err instanceof HardlockError || err instanceof RiskLimitExceeded) {
      return { blocked: true, tripped: true, crashed: false, failClosed: true, reasons: Object.freeze([err.code]), errorCode: err.code };
    }
    return { blocked: true, tripped: true, crashed: true, failClosed: false, reasons: Object.freeze([err instanceof Error ? err.message : String(err)]) };
  }
}

export function assertCitadelRiskGate(input: GatewayRulesInput, expectTrip: boolean): CitadelRiskGateVerdict {
  const result = evaluateGatewayRules(input);
  if (!expectTrip) return { pass: !result.tripped, failClosed: false, falseNegatives: 0, result };
  const failClosed = result.failClosed && result.tripped;
  return { pass: failClosed, failClosed, falseNegatives: result.tripped ? 0 : 1, result };
}

export function evaluateGlobalRiskPolicy(intent: RiskIntent): GlobalRiskPolicyResult {
  const state = intent.systemState ?? readActiveSystemState();
  const funding = intent.funding ? evaluateFundingRegimePolicy({ ...intent.funding, symbol: intent.funding.symbol ?? intent.symbol, baseNotionalUsd: intent.funding.baseNotionalUsd ?? intent.amountUsd, requestedLeverage: intent.funding.requestedLeverage ?? intent.foolProof?.leverage }) : null;
  if (isR20Locked(state)) return deny(`${R20_LOCKED} — signing channel severed`, 403);
  try {
    vineWrapProtection({ symbol: intent.symbol ?? intent.venue, estimatedLossUsd: intent.amountUsd, accountBalanceUsd: state.accountBalanceUsd, criHardlock: state.hardlock });
  } catch (err) {
    if (err instanceof HardlockError || err instanceof RiskLimitExceeded) return deny(err.message, err instanceof HardlockError ? 403 : 422);
    throw err;
  }
  if (funding?.r20Triggered || (funding && !funding.rebalanceAllowed)) {
    return { isAllowed: false, reason: funding.reasons.join("|") || "FUNDING_REGIME_HALT", suggestedHttpCode: 403, fundingRegime: funding.regime, targetLeverage: funding.targetLeverage, scaledNotionalUsd: funding.scaledNotionalUsd };
  }
  if (funding && intent.foolProof?.leverage !== undefined && funding.reasons.some((r) => r.startsWith("FUNDING_LEVERAGE_CAP"))) {
    return { isAllowed: false, reason: funding.reasons.join("|"), suggestedHttpCode: 422, fundingRegime: funding.regime, targetLeverage: funding.targetLeverage, scaledNotionalUsd: funding.scaledNotionalUsd };
  }
  const fool = checkFoolProofGuard({ order: { positionValueUsd: intent.amountUsd, leverage: intent.foolProof?.leverage, contractTarget: intent.foolProof?.contractTarget, profile: intent.foolProof?.profile, reduceOnly: intent.foolProof?.reduceOnly }, accountBalanceUsd: state.accountBalanceUsd });
  if (fool.rejected) return deny(`Fool-proof guard rejected — ${fool.reasons.join("|")}`, 422);
  if (intent.soil) {
    const soil = checkSoilResistance(intent.soil);
    if (soil.tripped) return deny(`Soil resistance tripped — ${soil.reasons.join("|")}`, 422);
  }
  return { isAllowed: true, fundingRegime: funding?.regime, targetLeverage: funding?.targetLeverage, scaledNotionalUsd: funding?.scaledNotionalUsd };
}
