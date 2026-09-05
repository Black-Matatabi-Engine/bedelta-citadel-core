/** Soil fast-path + auto-sever wrapper — extracted to keep risk-engine-core <200 LOC. */
import { checkSoilResistance as checkSoilResistanceBase, MAX_SLIPPAGE, isTsunamiShieldWindow, type SoilResistanceInput, type SoilResistanceResult } from "./risk";
import { resolveSoilMinDepthUsd } from "../services/risk-control";
import { evaluateSoilSlippagePacked, packSoilLane } from "../services/risk-control-lib/soil-resistance-math";
import { isXyzOrHip3Key } from "../services/exchanges/asset-classifier-lib/asset-classifier-keywords";
import { isArbitrumStatusSequencerHealthy } from "../services/adapters/arbitrum-status-sentinel";
import { isRpcRadarSequencerHealthy } from "../services/adapters/rpc-radar";
import { isSequencerSafe } from "../services/risk/sequencer-guard";
import { isArbitrumGasGuardBlocked } from "../services/risk/arbitrum-gas-guard";
import { isSoftConfirmationSafe } from "../services/risk/soft-confirmation-guard";
import { applySoilTripSeverance } from "./risk-severance";

const SOIL_CLEAR: SoilResistanceResult = { ok: true, tripped: false, crossVenueSlippage: 0, spotPerpSlippage: 0, reasons: [] };
let soilRef: SoilResistanceInput | null = null;
let soilFast = false;

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
  const result = isGatewayNominalFastPath(input) ? SOIL_CLEAR : checkSoilResistanceBase(input);
  if (result.tripped) applySoilTripSeverance(true);
  return result;
}
