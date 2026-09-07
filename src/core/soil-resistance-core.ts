/** Pure soil math SSOT — cross-venue / spot-perp slippage lane (Wasm-aligned 6×f64). */
import type { SoilResistanceInput } from "../services/risk-control-lib/soil-resistance-types";

export const MAX_SLIPPAGE = 0.005;
export const MIN_DEPTH_USD = 100_000;
export const HL_TESTNET_MIN_DEPTH_USD = 5_000;
export const VINE_SOIL_MAX_SLIPPAGE = 0.003;

const SOIL_PACK_LEN = 6;
const SOIL_IDX_HL_SPOT = 0;
const SOIL_IDX_HL_PERP = 1;
const SOIL_IDX_DYDX_PERP = 2;
const SOIL_IDX_DEPTH_USD = 3;
const SOIL_IDX_SLIPPAGE_FUSE = 4;
const SOIL_IDX_MIN_DEPTH_USD = 5;
const SOIL_REASON_INSUFFICIENT_DEPTH = 1;
const SOIL_REASON_CROSS_VENUE = 2;
const SOIL_REASON_DEPTH_USD = 4;

export function resolveSoilMinDepthUsd(input: {
  minDepthUsd?: number;
  isTestnet?: boolean;
}): number {
  if (input.minDepthUsd !== undefined) return input.minDepthUsd;
  if (input.isTestnet) return HL_TESTNET_MIN_DEPTH_USD;
  return MIN_DEPTH_USD;
}

export function packSoilLane(
  hlSpot: number,
  hlPerp: number,
  dydxPerp: number,
  depthUsd: number,
  slippageFuse: number,
  minDepthUsd: number,
  out?: Float64Array,
): Float64Array {
  const lane = out ?? new Float64Array(SOIL_PACK_LEN);
  lane[SOIL_IDX_HL_SPOT] = hlSpot;
  lane[SOIL_IDX_HL_PERP] = hlPerp;
  lane[SOIL_IDX_DYDX_PERP] = dydxPerp;
  lane[SOIL_IDX_DEPTH_USD] = depthUsd;
  lane[SOIL_IDX_SLIPPAGE_FUSE] = slippageFuse;
  lane[SOIL_IDX_MIN_DEPTH_USD] = minDepthUsd;
  return lane;
}

export function evaluateSoilSlippagePacked(lane: Float64Array): {
  crossVenueSlippage: number;
  spotPerpSlippage: number;
  tripFlags: number;
} {
  const hlPerp = lane[SOIL_IDX_HL_PERP];
  const dydxPerp = lane[SOIL_IDX_DYDX_PERP];
  const hlSpot = lane[SOIL_IDX_HL_SPOT];
  const depthUsd = lane[SOIL_IDX_DEPTH_USD];
  const slippageFuse = lane[SOIL_IDX_SLIPPAGE_FUSE];
  const minDepthUsd = lane[SOIL_IDX_MIN_DEPTH_USD];
  const crossVenueSlippage =
    hlPerp > 0 && dydxPerp > 0 ? Math.abs(dydxPerp - hlPerp) / hlPerp : Number.POSITIVE_INFINITY;
  const spotPerpSlippage =
    hlSpot > 0 ? Math.abs(hlPerp - hlSpot) / hlSpot : Number.POSITIVE_INFINITY;
  let tripFlags = 0;
  if (hlPerp <= 0 || dydxPerp <= 0) tripFlags |= SOIL_REASON_INSUFFICIENT_DEPTH;
  if (hlPerp > 0 && dydxPerp > 0 && crossVenueSlippage > slippageFuse) tripFlags |= SOIL_REASON_CROSS_VENUE;
  if (Number.isFinite(depthUsd) && depthUsd < minDepthUsd) tripFlags |= SOIL_REASON_DEPTH_USD;
  return { crossVenueSlippage, spotPerpSlippage, tripFlags };
}

export interface SoilSlippageOverrides {
  maxSlippage?: number;
  minDepthUsd?: number;
}

export function computeSoilSlippageMetrics(
  input: SoilResistanceInput,
  overrides?: SoilSlippageOverrides,
): { crossVenueSlippage: number; spotPerpSlippage: number; tripFlags: number } {
  const slippageFuse = overrides?.maxSlippage ?? input.maxSlippage ?? MAX_SLIPPAGE;
  const minDepthUsd = overrides?.minDepthUsd ?? resolveSoilMinDepthUsd(input);
  const lane = packSoilLane(
    input.hlSpot,
    input.hlPerp,
    input.dydxPerp,
    input.depthUsd ?? Number.NaN,
    slippageFuse,
    minDepthUsd,
  );
  return evaluateSoilSlippagePacked(lane);
}
