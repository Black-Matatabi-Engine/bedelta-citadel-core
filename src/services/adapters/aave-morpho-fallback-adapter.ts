/**
 * V1.5 PoC — Tiered Liquidity Stacking: Aave v3 / Morpho Blue risk-free fallback.
 * Isolated adapter; does not touch soil_core.wasm, risk-control.ts, or Gate.sol.
 */

import {
  ARBITRUM_STABLE_ADDRESSES,
  DEFAULT_AAVE_BASE_APY,
} from "../../adapters/arbitrum/arbitrum-yield-ingress-lib/arbitrum-yield-ingress-types";

export const TIERED_FALLBACK_ADAPTER_ID = "aave-morpho-fallback-v1.5" as const;
export const MIN_GMX_SKEW_REBATE_BPS = 50;
export const RISK_FREE_APY_FLOOR = 0.04;
export const RISK_FREE_APY_CEILING = 0.052;
export const AAVE_SUPPLY_CAP_FULL = 1.0;

export const AAVE_V3_USDC_POOL_ARBITRUM =
  "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
export const MORPHO_BLUE_USDC_VAULT_ARBITRUM =
  "0x0000000000000000000000000000000000000000";

export type RiskFreeVenue = "aave-v3" | "morpho-blue";

export interface TieredFallbackConditionInput {
  soilOk?: boolean;
  soilFailClosed?: boolean;
  signingChannelOpen?: boolean;
  gmxSkewRebateBps?: number;
}

export interface TieredFallbackConditionResult {
  shouldFallback: boolean;
  reasons: string[];
}

export interface RouteToRiskFreeBaseInput {
  amountUsd: number;
  symbol?: "USDC";
  aaveSupplyCapUtilization?: number;
  aaveApy?: number;
  morphoApy?: number;
}

export interface RouteToRiskFreeBaseResult {
  venue: RiskFreeVenue;
  baseApy: number;
  amountUsd: number;
  asset: string;
  target: string;
  payload: Record<string, unknown>;
  reasons: string[];
}

function clampRiskFreeApy(apy: number): number {
  return Math.min(RISK_FREE_APY_CEILING, Math.max(RISK_FREE_APY_FLOOR, apy));
}

function isSoilFailClosed(input: TieredFallbackConditionInput): boolean {
  if (input.soilFailClosed === true) return true;
  if (input.soilOk === false) return true;
  if (input.signingChannelOpen === false) return true;
  return false;
}

/** Soil Fail-Closed or GMX skew rebate below 0.5% (50 bps) triggers tiered fallback. */
export function checkTieredFallbackCondition(
  input: TieredFallbackConditionInput,
): TieredFallbackConditionResult {
  const reasons: string[] = [];
  if (isSoilFailClosed(input)) {
    reasons.push("TIERED_FALLBACK_SOIL_FAIL_CLOSED");
  }
  const rebateBps = Math.max(0, Number(input.gmxSkewRebateBps) || 0);
  if (rebateBps < MIN_GMX_SKEW_REBATE_BPS) {
    reasons.push(`TIERED_FALLBACK_SKEW_REBATE=${rebateBps}<${MIN_GMX_SKEW_REBATE_BPS}bps`);
  }
  return { shouldFallback: reasons.length > 0, reasons };
}

/** Route idle USDC to Aave v3; degrade to Morpho Blue when Aave supply cap is full. */
export function routeToRiskFreeBase(
  input: RouteToRiskFreeBaseInput,
): RouteToRiskFreeBaseResult {
  const symbol = input.symbol ?? "USDC";
  const amountUsd = Math.max(0, Number(input.amountUsd) || 0);
  const capUtil = Math.max(0, Number(input.aaveSupplyCapUtilization) || 0);
  const reasons: string[] = [];
  const aaveApy = clampRiskFreeApy(
    input.aaveApy ?? DEFAULT_AAVE_BASE_APY[symbol],
  );
  const morphoApy = clampRiskFreeApy(input.morphoApy ?? aaveApy + 0.004);
  const useMorpho = capUtil >= AAVE_SUPPLY_CAP_FULL;

  if (useMorpho) {
    reasons.push("AAVE_SUPPLY_CAP_FULL→MORPHO_BLUE");
  } else {
    reasons.push("AAVE_V3_PRIMARY_ROUTE");
  }

  const venue: RiskFreeVenue = useMorpho ? "morpho-blue" : "aave-v3";
  const baseApy = useMorpho ? morphoApy : aaveApy;
  const target = useMorpho ? MORPHO_BLUE_USDC_VAULT_ARBITRUM : AAVE_V3_USDC_POOL_ARBITRUM;
  const asset = ARBITRUM_STABLE_ADDRESSES[symbol];

  return {
    venue,
    baseApy,
    amountUsd,
    asset,
    target,
    payload: {
      adapterId: TIERED_FALLBACK_ADAPTER_ID,
      action: "supply",
      venue,
      asset,
      target,
      amountUsd,
      baseApy,
      chainId: 42161,
    },
    reasons,
  };
}
