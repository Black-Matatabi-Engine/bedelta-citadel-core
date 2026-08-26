/**
 * V1.5 PoC — Variational Perp DEX native Arbitrum 1× short hedge leg.
 * Isolated adapter; HL orderbook gap guard semantics ported for depth evaluation.
 */

import { ARBITRUM_ONE_CHAIN_ID } from "../../sdk/constants";
import {
  FUNDING_LEVERAGE_MILD_FLOOR,
  FUNDING_LEVERAGE_NORMAL,
} from "../risk-control-lib/funding-regime-guard";
import { isHlOrderbookGapWindow } from "../risk-control-lib/time-gates";

export const VARIATIONAL_HEDGE_ADAPTER_ID = "variational-hedge-v1.5" as const;
export const VARIATIONAL_TARGET_LEVERAGE = 1.0;
export const VARIATIONAL_ORDERBOOK_GAP_GUARD = "VARIATIONAL_ORDERBOOK_GAP_GUARD" as const;
export const VARIATIONAL_DEPTH_MULTIPLIER = 2;

export interface VariationalShortOrderInput {
  symbol: string;
  sizeUsd: number;
  maxSlippageBps?: number;
  clientOrderId?: string;
  reduceOnly?: boolean;
}

export interface VariationalShortOrderPayload {
  venue: "variational";
  chainId: number;
  symbol: string;
  side: "short";
  leverage: number;
  sizeUsd: number;
  maxSlippageBps: number;
  reduceOnly: boolean;
  clientOrderId: string;
  payload: Record<string, unknown>;
}

export interface VariationalOrderbookDepthInput {
  symbol: string;
  depthUsd?: number;
  minDepthUsd?: number;
  requestedLeverage?: number;
  at?: Date;
}

export interface VariationalOrderbookDepthResult {
  triggered: boolean;
  targetLeverage: number;
  requiredMinDepthUsd: number;
  reasons: string[];
}

function normalizeSymbol(symbol: string): string {
  return String(symbol ?? "").trim().toUpperCase();
}

/** Build native Arbitrum One 1× short order payload (unsigned; signing stays in session layer). */
export function buildVariationalShortOrder(
  input: VariationalShortOrderInput,
): VariationalShortOrderPayload {
  const symbol = normalizeSymbol(input.symbol);
  const sizeUsd = Math.max(0, Number(input.sizeUsd) || 0);
  const maxSlippageBps = Math.max(1, Number(input.maxSlippageBps) || 50);
  const clientOrderId =
    input.clientOrderId ?? `var-short-${symbol}-${Date.now()}`;
  const reduceOnly = input.reduceOnly === true;

  return {
    venue: "variational",
    chainId: ARBITRUM_ONE_CHAIN_ID,
    symbol,
    side: "short",
    leverage: VARIATIONAL_TARGET_LEVERAGE,
    sizeUsd,
    maxSlippageBps,
    reduceOnly,
    clientOrderId,
    payload: {
      adapterId: VARIATIONAL_HEDGE_ADAPTER_ID,
      type: "variational.perp.market",
      chainId: ARBITRUM_ONE_CHAIN_ID,
      symbol,
      side: "sell",
      leverage: VARIATIONAL_TARGET_LEVERAGE,
      notionalUsd: sizeUsd,
      maxSlippageBps,
      reduceOnly,
      clientOrderId,
      timeInForce: "IOC",
    },
  };
}

/** Port `evaluateHlOrderbookGapGuard()` — gap window scales 3×→1× and doubles depth floor. */
export function evaluateVariationalOrderbookDepth(
  input: VariationalOrderbookDepthInput,
): VariationalOrderbookDepthResult {
  const symbol = normalizeSymbol(input.symbol);
  const baseMinDepth = Math.max(0, Number(input.minDepthUsd) || 0);
  const reasons: string[] = [];

  if (!symbol) {
    return {
      triggered: false,
      targetLeverage: input.requestedLeverage ?? FUNDING_LEVERAGE_NORMAL,
      requiredMinDepthUsd: baseMinDepth,
      reasons,
    };
  }

  if (!isHlOrderbookGapWindow(input.at)) {
    return {
      triggered: false,
      targetLeverage: input.requestedLeverage ?? FUNDING_LEVERAGE_NORMAL,
      requiredMinDepthUsd: baseMinDepth,
      reasons,
    };
  }

  const targetLeverage = FUNDING_LEVERAGE_MILD_FLOOR;
  const requiredMinDepthUsd = Math.round(baseMinDepth * VARIATIONAL_DEPTH_MULTIPLIER);
  reasons.push(VARIATIONAL_ORDERBOOK_GAP_GUARD);
  reasons.push(
    `VARIATIONAL_LEVERAGE_SCALE=${FUNDING_LEVERAGE_NORMAL}x->${targetLeverage}x`,
  );

  const requested = input.requestedLeverage;
  if (requested !== undefined && Number.isFinite(requested) && requested > targetLeverage + 1e-6) {
    reasons.push(`VARIATIONAL_LEVERAGE_CAP=${targetLeverage}<${requested.toFixed(2)}`);
  }

  const depthUsd = input.depthUsd;
  if (depthUsd !== undefined && depthUsd < requiredMinDepthUsd) {
    reasons.push(`VARIATIONAL_DEPTH_GUARD=${depthUsd}<${requiredMinDepthUsd}`);
  }

  return { triggered: true, targetLeverage, requiredMinDepthUsd, reasons };
}
