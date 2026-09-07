/** Pure soil math SSOT — cross-venue / spot-perp slippage lane (Wasm-aligned 6×f64). */
import type { SoilResistanceInput } from "../services/risk-control-lib/soil-resistance-types";

export const MAX_SLIPPAGE = 0.005;
export const MIN_DEPTH_USD = 100_000;
export const HL_TESTNET_MIN_DEPTH_USD = 5_000;
export const VINE_SOIL_MAX_SLIPPAGE = 0.003;

const SOIL_PACK_LEN = 6;
const SOIL_LANE_SCRATCH = new Float64Array(SOIL_PACK_LEN);
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
  packSoilLane(
    input.hlSpot,
    input.hlPerp,
    input.dydxPerp,
    input.depthUsd ?? Number.NaN,
    slippageFuse,
    minDepthUsd,
    SOIL_LANE_SCRATCH,
  );
  return evaluateSoilSlippagePacked(SOIL_LANE_SCRATCH);
}

export const TSUNAMI_SHIELD_HKT_START = 21;
export const TSUNAMI_SHIELD_HKT_END = 23;
const HKT_OFFSET_MS = 8 * 3_600_000;

export function getHktHour(now: Date = new Date()): number {
  return new Date(now.getTime() + HKT_OFFSET_MS).getUTCHours();
}

export function isTsunamiShieldWindow(now: Date = new Date()): boolean {
  const h = getHktHour(now);
  return h >= TSUNAMI_SHIELD_HKT_START && h < TSUNAMI_SHIELD_HKT_END;
}

export function isHlOrderbookGapWindow(now: Date = new Date()): boolean {
  if (isTsunamiShieldWindow(now)) return true;
  const day = now.getUTCDay();
  return day === 0 || day === 6;
}

export const JITTER_MIN_BPS = 2;
export const JITTER_MAX_BPS = 5;

function isJitterEnabled(input: SoilResistanceInput, forceEnable?: boolean): boolean {
  if (forceEnable) return true;
  if (input.disableThresholdJitter) return false;
  if (typeof process !== "undefined" && process.env?.VITEST === "true") return false;
  return true;
}

function sampleJitterBps(): { magnitudeBps: number; sign: 1 | -1 } {
  const buf = new Uint32Array(1);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(buf);
  else buf[0] = (Date.now() * 2654435761) >>> 0;
  const span = JITTER_MAX_BPS - JITTER_MIN_BPS + 1;
  const word = buf[0];
  return { magnitudeBps: JITTER_MIN_BPS + (word % span), sign: (word >>> 16) & 1 ? -1 : 1 };
}

export function resolveJitteredSoilThresholds(
  input: SoilResistanceInput,
  options?: { forceEnable?: boolean },
): { slippageFuse: number; minDepthUsd: number } {
  const baseSlippage = input.maxSlippage ?? MAX_SLIPPAGE;
  const baseMinDepth = resolveSoilMinDepthUsd(input);
  if (!isJitterEnabled(input, options?.forceEnable)) return { slippageFuse: baseSlippage, minDepthUsd: baseMinDepth };
  const { magnitudeBps, sign } = sampleJitterBps();
  const deltaRatio = (sign * magnitudeBps) / 10_000;
  return {
    slippageFuse: Math.max(0, baseSlippage + deltaRatio),
    minDepthUsd: Math.max(0, Math.floor(baseMinDepth * (1 + deltaRatio))),
  };
}

export interface HlOrderbookGapGuardPureInput {
  isHip3Symbol: boolean;
  inGapWindow: boolean;
  depthUsd?: number;
  minDepthUsd: number;
  requestedLeverage?: number;
}

export interface HlOrderbookGapGuardPureResult {
  triggered: boolean;
  targetLeverage: number;
  requiredMinDepthUsd: number;
  reasons: string[];
}

export function evaluateHlOrderbookGapGuardPure(
  input: HlOrderbookGapGuardPureInput,
  opts: { guardLabel: string; normalLeverage: number; floorLeverage: number; depthMultiplier: number },
): HlOrderbookGapGuardPureResult {
  const baseMinDepth = Math.max(0, input.minDepthUsd);
  const reasons: string[] = [];
  if (!input.isHip3Symbol || !input.inGapWindow) {
    return { triggered: false, targetLeverage: input.requestedLeverage ?? opts.normalLeverage, requiredMinDepthUsd: baseMinDepth, reasons };
  }
  const targetLeverage = opts.floorLeverage;
  const requiredMinDepthUsd = Math.round(baseMinDepth * opts.depthMultiplier);
  reasons.push(opts.guardLabel);
  reasons.push(`HL_ORDERBOOK_LEVERAGE_SCALE=${opts.normalLeverage}x->${targetLeverage}x`);
  if (input.requestedLeverage !== undefined && Number.isFinite(input.requestedLeverage) && input.requestedLeverage > targetLeverage + 1e-6) {
    reasons.push(`HL_ORDERBOOK_LEVERAGE_CAP=${targetLeverage}<${input.requestedLeverage.toFixed(2)}`);
  }
  if (input.depthUsd !== undefined && input.depthUsd < requiredMinDepthUsd) {
    reasons.push(`HL_ORDERBOOK_GAP_GUARD_DEPTH=${input.depthUsd}<${requiredMinDepthUsd}`);
  }
  return { triggered: true, targetLeverage, requiredMinDepthUsd, reasons };
}
