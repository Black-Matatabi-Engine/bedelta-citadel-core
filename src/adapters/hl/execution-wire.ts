/**
 * Hyperliquid L1 order wire builders and pre-trade Pgate gate.
 * @see risk-control.ts — checkSoilResistanceWithVine()
 */

import { assertVineShield } from "../../services/fool-proof-guard";
import { checkSoilResistanceWithVine } from "../../services/risk-control";
import { PGATE_MAX_LATENCY_MS, PGATE_MAX_SLIPPAGE } from "../../config/constants";
import {
  PreTradeValidationError,
  type HlOrderWire,
  type OrderGrouping,
  type OrderTif,
  type PreTradeValidationInput,
  type TpslSide,
} from "./execution-types";

/** Normalize float to Hyperliquid wire price/size string (max 8 decimals) */
export function floatToWire(value: number): string {
  const rounded = value.toFixed(8);
  if (Math.abs(Number(rounded) - value) >= 1e-12) {
    throw new Error(`floatToWire causes rounding: ${value}`);
  }
  const normalized = Number(rounded);
  return Object.is(normalized, -0) ? "0" : normalized.toString();
}

/**
 * Pgate + soil resistance gate — blocks new position orders.
 * @theory Kyle (1985) — Kyle's Lambda price-impact prior to venue POST.
 * @theory Almgren & Chriss (2000) — transient impact / optimal execution slippage cap.
 * @see checkSoilResistanceWithVine — cross-venue soil matrix.
 */
export function assertPreTradeValidation(input: PreTradeValidationInput): void {
  const reasons: string[] = [];

  if (input.latencyMs !== undefined && input.latencyMs > PGATE_MAX_LATENCY_MS) {
    reasons.push(`LATENCY_MS=${input.latencyMs}>${PGATE_MAX_LATENCY_MS}`);
  }

  if (
    input.expectedSlippage !== undefined &&
    input.expectedSlippage > PGATE_MAX_SLIPPAGE
  ) {
    reasons.push(
      `EXPECTED_SLIPPAGE=${(input.expectedSlippage * 100).toFixed(4)}%>${PGATE_MAX_SLIPPAGE * 100}%`,
    );
  }

  if (input.foolProof && input.accountBalanceUsd !== undefined) {
    try {
      assertVineShield({
        order: input.foolProof,
        accountBalanceUsd: input.accountBalanceUsd,
      });
    } catch (err) {
      reasons.push(err instanceof Error ? err.message : String(err));
    }
  }

  const soil = checkSoilResistanceWithVine(input);
  if (soil.tripped) reasons.push(...soil.reasons);

  if (reasons.length > 0) {
    throw new PreTradeValidationError(
      "Pre-trade validation failed — execution blocked",
      reasons,
    );
  }
}

export function buildLimitOrderWire(args: {
  asset: number;
  isBuy: boolean;
  size: number;
  limitPx: number;
  reduceOnly?: boolean;
  tif?: OrderTif;
  cloid?: string;
}): HlOrderWire {
  const wire: HlOrderWire = {
    a: args.asset,
    b: args.isBuy,
    p: floatToWire(args.limitPx),
    s: floatToWire(args.size),
    r: args.reduceOnly ?? false,
    t: { limit: { tif: args.tif ?? "Gtc" } },
  };
  if (args.cloid) wire.c = args.cloid;
  return wire;
}

/** Market-style entry via IoC limit that crosses the spread */
export function buildMarketOrderWire(args: {
  asset: number;
  isBuy: boolean;
  size: number;
  limitPx: number;
  reduceOnly?: boolean;
  cloid?: string;
}): HlOrderWire {
  return buildLimitOrderWire({ ...args, tif: "Ioc" });
}

export function buildTriggerOrderWire(args: {
  asset: number;
  isBuy: boolean;
  size: number;
  triggerPx: number;
  tpsl: TpslSide;
  isMarket?: boolean;
  reduceOnly?: boolean;
  cloid?: string;
}): HlOrderWire {
  const wire: HlOrderWire = {
    a: args.asset,
    b: args.isBuy,
    p: "0",
    s: floatToWire(args.size),
    r: args.reduceOnly ?? true,
    t: {
      trigger: {
        triggerPx: floatToWire(args.triggerPx),
        isMarket: args.isMarket ?? true,
        tpsl: args.tpsl,
      },
    },
  };
  if (args.cloid) wire.c = args.cloid;
  return wire;
}

export function buildOrderAction(
  orders: HlOrderWire[],
  grouping: OrderGrouping = "na",
): Record<string, unknown> {
  return { type: "order", orders, grouping };
}

export function buildCancelAction(
  cancels: Array<{ asset: number; oid: number }>,
): Record<string, unknown> {
  return {
    type: "cancel",
    cancels: cancels.map((c) => ({ a: c.asset, o: c.oid })),
  };
}

export function buildCancelByCloidAction(
  cancels: Array<{ asset: number; cloid: string }>,
): Record<string, unknown> {
  return {
    type: "cancelByCloid",
    cancels: cancels.map((c) => ({ a: c.asset, cloid: c.cloid })),
  };
}
