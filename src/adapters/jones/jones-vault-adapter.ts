/**
 * Jones DAO — Arbitrum vault share-price pre-flight guard.
 * Share slippage validation · flash-loan sandwich protection · soil fuse.
 */
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";
import {
  JONES_ARBITRUM_CHAIN_ID,
  JONES_FLASH_SANDWICH_DEVIATION_BPS,
  JONES_MAX_SHARE_SLIPPAGE_BPS,
  JONES_MIN_VAULT_TVL_USD,
} from "./jones-vault-constants";

export {
  JONES_ARBITRUM_CHAIN_ID,
  JONES_FLASH_SANDWICH_DEVIATION_BPS,
  JONES_MAX_NAV_DEVIATION_BPS,
  JONES_MAX_SHARE_SLIPPAGE_BPS,
  JONES_MIN_VAULT_TVL_USD,
} from "./jones-vault-constants";

export interface JonesVaultInput {
  chainId: number;
  vaultId: string;
  action: "DEPOSIT" | "WITHDRAW" | "REBALANCE";
  amountUsd: number;
  vaultTvlUsd: number;
  expectedSharePriceUsd: number;
  quotedSharePriceUsd: number;
  rebalancePending?: boolean;
  blockPriceDeviationBps?: number;
  refPriceUsd: number;
  spotPriceUsd: number;
  depthUsd?: number;
  agentId?: string;
  nowMs?: number;
  at?: Date;
}

export interface JonesVaultShareResult {
  ok: boolean;
  shareSlippageBps: number;
  sandwichOk: boolean;
  tvlOk: boolean;
  reasons: string[];
}

export interface JonesVaultGuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED";
  reasons: string[];
  shareSlippageBps: number;
  shareOk: boolean;
  soilOk: boolean;
  latencyUs: number;
}

export function computeJonesShareSlippageBps(expected: number, quoted: number): number {
  if (!Number.isFinite(expected) || expected <= 0) return Number.POSITIVE_INFINITY;
  return (Math.abs(quoted - expected) / expected) * 10_000;
}

export function verifyJonesVaultSharePrice(input: {
  expectedSharePriceUsd: number;
  quotedSharePriceUsd: number;
  vaultTvlUsd: number;
  rebalancePending?: boolean;
  blockPriceDeviationBps?: number;
}): JonesVaultShareResult {
  const reasons: string[] = [];
  const shareSlippageBps = computeJonesShareSlippageBps(
    input.expectedSharePriceUsd,
    input.quotedSharePriceUsd,
  );

  const tvlOk = Number(input.vaultTvlUsd) >= JONES_MIN_VAULT_TVL_USD;
  if (!tvlOk) {
    reasons.push(`JONES_VAULT_TVL_LOW:tvl=${input.vaultTvlUsd}<min=${JONES_MIN_VAULT_TVL_USD}`);
  }

  if (shareSlippageBps > JONES_MAX_SHARE_SLIPPAGE_BPS) {
    reasons.push(
      `JONES_SHARE_SLIPPAGE_BREACH:slippageBps=${shareSlippageBps.toFixed(1)}>${JONES_MAX_SHARE_SLIPPAGE_BPS}`,
    );
  }

  let sandwichOk = true;
  const deviation = input.blockPriceDeviationBps ?? 0;
  if (input.rebalancePending && deviation > JONES_FLASH_SANDWICH_DEVIATION_BPS) {
    sandwichOk = false;
    reasons.push(
      `JONES_FLASH_SANDWICH_TRIP:deviationBps=${deviation}>${JONES_FLASH_SANDWICH_DEVIATION_BPS}`,
    );
  }

  return {
    ok: reasons.length === 0,
    shareSlippageBps,
    sandwichOk,
    tvlOk,
    reasons,
  };
}

function buildJonesSoilInput(input: JonesVaultInput): SoilResistanceInput {
  return {
    symbol: input.vaultId,
    hlSpot: input.refPriceUsd,
    hlPerp: input.spotPriceUsd,
    dydxPerp: input.refPriceUsd,
    depthUsd: input.depthUsd ?? Math.max(0, input.vaultTvlUsd - input.amountUsd),
    orderSizeUsd: input.amountUsd,
    at: input.at ?? new Date(input.nowMs ?? Date.now()),
    disableThresholdJitter: true,
  };
}

export function evaluateJonesVaultGuard(input: JonesVaultInput): JonesVaultGuardResult {
  const t0 = performance.now();
  const reasons: string[] = [];

  if (input.chainId !== JONES_ARBITRUM_CHAIN_ID) {
    reasons.push(`JONES_CHAIN_UNSUPPORTED:chainId=${input.chainId}`);
  }

  const share = verifyJonesVaultSharePrice(input);
  if (!share.ok) reasons.push(...share.reasons);

  const soilProbe = checkSoilResistance(buildJonesSoilInput(input));
  const soilOk = soilProbe.ok;
  if (!soilOk) reasons.push("SOIL_RESISTANCE_TRIP", ...soilProbe.reasons);

  const ok = reasons.length === 0 && soilOk;

  return {
    ok,
    status: ok ? "ALLOW" : "FAIL_CLOSED",
    reasons: [...new Set(reasons)],
    shareSlippageBps: share.shareSlippageBps,
    shareOk: share.ok,
    soilOk,
    latencyUs: (performance.now() - t0) * 1000,
  };
}
