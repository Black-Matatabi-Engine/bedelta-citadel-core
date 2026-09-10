/**
 * Stabilizer Protocol — Sepolia Testnet Guard for 1:1 zero-slippage stablecoin swaps.
 * Liquidation invariants · USDZ peg protection · Constant-Sum capacity · soil fuse.
 */
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";
import { activateStabilizerCooldown, checkStabilizerCooldown } from "./stabilizer-cooldown";
import {
  STABILIZER_DEFAULT_RESERVE_FLOOR_USD,
  STABILIZER_SEPOLIA_CHAIN_ID,
  STABILIZER_ZERO_SLIPPAGE_ASSETS,
  type StabilizerAsset,
} from "./stabilizer-constants";
import {
  verifyStabilizerPegDrift,
  verifyStabilizerPoolCapacity,
} from "./stabilizer-guard-invariants";
import type { StabilizerGuardResult, StabilizerSwapInput } from "./stabilizer-types";

export {
  STABILIZER_COOLDOWN_MS,
  STABILIZER_DEFAULT_RESERVE_FLOOR_USD,
  STABILIZER_MIN_RESERVE_RATIO,
  STABILIZER_PEG_DRIFT_MAX_BPS,
  STABILIZER_SEPOLIA_CHAIN_ID,
  STABILIZER_ZERO_SLIPPAGE_ASSETS,
  type StabilizerAsset,
} from "./stabilizer-constants";
export type { StabilizerPoolCapacityResult, StabilizerPegResult } from "./stabilizer-guard-invariants";
export {
  verifyStabilizerPegDrift,
  verifyStabilizerPoolCapacity,
  verifyZeroSlippageCapacity,
} from "./stabilizer-guard-invariants";
export type { StabilizerGuardResult, StabilizerSwapInput } from "./stabilizer-types";
export { __clearStabilizerCooldownsForTests } from "./stabilizer-cooldown";

function isSupportedAsset(asset: string): asset is StabilizerAsset {
  return (STABILIZER_ZERO_SLIPPAGE_ASSETS as readonly string[]).includes(asset);
}

function buildStabilizerSoilInput(input: StabilizerSwapInput): SoilResistanceInput {
  return {
    symbol: `${input.fromAsset}/${input.toAsset}`,
    hlSpot: input.usdzMarkUsd ?? 1,
    hlPerp: input.collateralMarkUsd ?? 1,
    dydxPerp: 1,
    depthUsd: Math.max(0, input.poolReserveUsd - input.amountUsd),
    isTestnet: true,
    minDepthUsd: STABILIZER_DEFAULT_RESERVE_FLOOR_USD,
    at: input.at ?? new Date(input.nowMs ?? Date.now()),
  };
}

export function evaluateStabilizerSwapGuard(input: StabilizerSwapInput): StabilizerGuardResult {
  const t0 = performance.now();
  const nowMs = input.nowMs ?? Date.now();
  const agentId = input.agentId?.trim() || "stabilizer-agent";
  const reasons: string[] = [];

  const cooldown = checkStabilizerCooldown(agentId, nowMs);
  if (cooldown) return { ...cooldown, latencyUs: (performance.now() - t0) * 1000 };

  if (input.chainId !== STABILIZER_SEPOLIA_CHAIN_ID) {
    reasons.push(`STABILIZER_CHAIN_UNSUPPORTED:chainId=${input.chainId}`);
  }
  if (!isSupportedAsset(input.fromAsset) || !isSupportedAsset(input.toAsset)) {
    reasons.push("STABILIZER_ASSET_UNSUPPORTED");
  }
  if (input.fromAsset === input.toAsset) reasons.push("STABILIZER_NOOP_SWAP");

  const peg = verifyStabilizerPegDrift(input);
  let signatureChannelSevered = false;
  if (!peg.ok) {
    reasons.push(...peg.reasons, "STABILIZER_SIGNATURE_CHANNEL_SEVERED");
    activateStabilizerCooldown(agentId, nowMs);
    signatureChannelSevered = true;
  }

  const capacity = verifyStabilizerPoolCapacity(input);
  reasons.push(...capacity.reasons);

  const soilProbe = checkSoilResistance(buildStabilizerSoilInput(input));
  const soilOk = soilProbe.ok;
  if (!soilOk) reasons.push("SOIL_RESISTANCE_TRIP", ...soilProbe.reasons);

  const zeroSlippage =
    input.fromAsset !== input.toAsset && capacity.zeroSlippageOk && peg.ok;
  const ok = reasons.length === 0 && soilOk;

  return {
    ok,
    status: ok ? "ALLOW" : "FAIL_CLOSED",
    reasons: [...new Set(reasons)],
    capacityOk: capacity.capacityOk,
    reserveOk: capacity.reserveOk,
    reserveRatioOk: capacity.reserveRatioOk,
    pegOk: peg.pegOk,
    soilOk,
    zeroSlippage,
    signatureChannelSevered,
    latencyUs: (performance.now() - t0) * 1000,
  };
}
