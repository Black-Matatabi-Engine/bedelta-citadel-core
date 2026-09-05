/**
 * Stabilizer Protocol — Sepolia Testnet Guard for 1:1 zero-slippage stablecoin swaps.
 * Assets: USDZ / USDC / USDT / USDS · integrates checkSoilResistance() pre-flight.
 */
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";

export const STABILIZER_SEPOLIA_CHAIN_ID = 421614 as const;
export const STABILIZER_ZERO_SLIPPAGE_ASSETS = ["USDZ", "USDC", "USDT", "USDS"] as const;
export const STABILIZER_DEFAULT_RESERVE_FLOOR_USD = 100_000;

export type StabilizerAsset = (typeof STABILIZER_ZERO_SLIPPAGE_ASSETS)[number];

export interface StabilizerSwapInput {
  chainId: number;
  fromAsset: StabilizerAsset;
  toAsset: StabilizerAsset;
  amountUsd: number;
  poolReserveUsd: number;
  poolCapacityUsd: number;
  reserveFloorUsd?: number;
  at?: Date;
}

export interface StabilizerPoolCapacityResult {
  ok: boolean;
  capacityOk: boolean;
  reserveOk: boolean;
  reasons: string[];
}

export interface StabilizerGuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reasons: string[];
  capacityOk: boolean;
  reserveOk: boolean;
  soilOk: boolean;
  zeroSlippage: boolean;
  latencyUs?: number;
}

function isSupportedAsset(asset: string): asset is StabilizerAsset {
  return (STABILIZER_ZERO_SLIPPAGE_ASSETS as readonly string[]).includes(asset);
}

export function verifyStabilizerPoolCapacity(input: {
  amountUsd: number;
  poolReserveUsd: number;
  poolCapacityUsd: number;
  reserveFloorUsd?: number;
}): StabilizerPoolCapacityResult {
  const reasons: string[] = [];
  const reserveFloor = input.reserveFloorUsd ?? STABILIZER_DEFAULT_RESERVE_FLOOR_USD;
  const amountUsd = Number(input.amountUsd);
  const poolReserveUsd = Number(input.poolReserveUsd);
  const poolCapacityUsd = Number(input.poolCapacityUsd);

  let capacityOk = true;
  let reserveOk = true;

  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    reasons.push("STABILIZER_AMOUNT_INVALID");
    capacityOk = false;
    reserveOk = false;
    return { ok: false, capacityOk, reserveOk, reasons };
  }

  if (amountUsd > poolCapacityUsd) {
    capacityOk = false;
    reasons.push(`STABILIZER_CAPACITY_EXCEEDED:amount=${amountUsd}>capacity=${poolCapacityUsd}`);
  }

  const postReserve = poolReserveUsd - amountUsd;
  if (postReserve < reserveFloor) {
    reserveOk = false;
    reasons.push(`STABILIZER_RESERVE_FLOOR_BREACH:postReserve=${postReserve}<floor=${reserveFloor}`);
  }

  return { ok: capacityOk && reserveOk, capacityOk, reserveOk, reasons };
}

function buildStabilizerSoilInput(input: StabilizerSwapInput): SoilResistanceInput {
  const depthUsd = Math.max(0, input.poolReserveUsd - input.amountUsd);
  return {
    symbol: `${input.fromAsset}/${input.toAsset}`,
    hlSpot: 1,
    hlPerp: 1,
    dydxPerp: 1,
    depthUsd,
    isTestnet: true,
    minDepthUsd: STABILIZER_DEFAULT_RESERVE_FLOOR_USD,
    at: input.at ?? new Date(),
  };
}

export function evaluateStabilizerSwapGuard(input: StabilizerSwapInput): StabilizerGuardResult {
  const t0 = performance.now();
  const reasons: string[] = [];

  if (input.chainId !== STABILIZER_SEPOLIA_CHAIN_ID) {
    reasons.push(`STABILIZER_CHAIN_UNSUPPORTED:chainId=${input.chainId}`);
  }
  if (!isSupportedAsset(input.fromAsset) || !isSupportedAsset(input.toAsset)) {
    reasons.push("STABILIZER_ASSET_UNSUPPORTED");
  }
  if (input.fromAsset === input.toAsset) {
    reasons.push("STABILIZER_NOOP_SWAP");
  }

  const capacity = verifyStabilizerPoolCapacity(input);
  reasons.push(...capacity.reasons);

  const soilProbe = checkSoilResistance(buildStabilizerSoilInput(input));
  const soilOk = soilProbe.ok;
  if (!soilOk) {
    reasons.push("SOIL_RESISTANCE_TRIP", ...soilProbe.reasons);
  }

  const zeroSlippage = input.fromAsset !== input.toAsset && capacity.ok;
  const ok = reasons.length === 0 && soilOk;
  return {
    ok,
    status: ok ? "ALLOW" : "FAIL_CLOSED",
    reasons: [...new Set(reasons)],
    capacityOk: capacity.capacityOk,
    reserveOk: capacity.reserveOk,
    soilOk,
    zeroSlippage,
    latencyUs: (performance.now() - t0) * 1000,
  };
}
