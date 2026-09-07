/**
 * SPDX-License-Identifier: BUSL-1.1
 * Copyright (c) 2026 SilverVine Labs. All Rights Reserved.
 * Soil resistance types + depth/slippage constants.
 */

import type { UsdaiSoilInput } from "../../adapters/usdai/usdai-constants";
import type {
  PendleCrossGuardSoilInput,
  PendleOracleSoilInput,
  PendlePoolFactorySoilInput,
} from "../../core/pendle-types";
import type { CrossSpreadSoilInput } from "../yield/cross-spread-cache";
import type { GmxV2PriceImpactSoilInput } from "../yield/gmx-v2-price-impact";

export {
  MAX_SLIPPAGE,
  MIN_DEPTH_USD,
  HL_TESTNET_MIN_DEPTH_USD,
  VINE_SOIL_MAX_SLIPPAGE,
  resolveSoilMinDepthUsd,
} from "../../core/soil-resistance-core";

export interface SoilResistanceInput {
  symbol: string;
  hlSpot: number;
  hlPerp: number;
  dydxPerp: number;
  /** Optional order-book / volume depth in USD */
  depthUsd?: number;
  /** Optional slippage fuse override (default MAX_SLIPPAGE) */
  maxSlippage?: number;
  /** Optional order notional — enables soil-risk Max SL cap */
  orderSizeUsd?: number;
  /** Optional account equity — enables soil-risk Max SL cap */
  accountBalanceUsd?: number;
  /** Override MIN_DEPTH_USD — HL testnet uses HL_TESTNET_MIN_DEPTH_USD ($5K). */
  minDepthUsd?: number;
  /** HyperEVM testnet (chainId 998) — relaxes depth gate to HL_TESTNET_MIN_DEPTH_USD. */
  isTestnet?: boolean;
  /** Optional evaluation timestamp (tests / replay) */
  at?: Date;
  /** Optional requested leverage — HIP-3 gap guard scales 3x → 1x during RWA windows */
  requestedLeverage?: number;
  /** Cross-DEX funding spread gate (GMX v2 vs HL/Vertex) */
  crossSpread?: CrossSpreadSoilInput;
  /** GMX v2 GM pool price-impact penalty / subsidy probe */
  gmxPriceImpact?: GmxV2PriceImpactSoilInput;
  /** Pendle PT × GMX shadow-margin cross-guard probe */
  pendleCrossGuard?: PendleCrossGuardSoilInput;
  /** Pendle oracle freshness probe — trips with PENDLE_ORACLE_STALE */
  pendleOracle?: PendleOracleSoilInput;
  /** Pendle AI pool-factory pre-flight — PENDLE_CREATE_POOL / PENDLE_ADD_LIQUIDITY */
  pendlePoolFactory?: PendlePoolFactorySoilInput;
  /** USD.ai GPU RWA yield collateral — oracle · peg · depth probe */
  usdai?: UsdaiSoilInput;
  /** Disable dynamic ±2–5 bps threshold jitter (tests / replay) */
  disableThresholdJitter?: boolean;
}

export interface SoilResistanceResult {
  ok: boolean;
  tripped: boolean;
  /** Absolute cross-venue perp slippage ratio */
  crossVenueSlippage: number;
  /** Absolute HL spot–perp basis ratio */
  spotPerpSlippage: number;
  crossSpreadBps?: number;
  isSpreadProfitable?: boolean;
  priceImpactSubsidiesBps?: number;
  priceImpactPenaltyBps?: number;
  gmxReducesImbalance?: boolean;
  reasons: string[];
  /** Measured slippage loss USD when orderSizeUsd is provided */
  soilRiskUsd?: number;
  /** min(dynamic Max SL, orderSize×fuse) when order + balance provided */
  cappedMaxSlUsd?: number;
}
