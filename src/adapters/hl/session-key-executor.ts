/**
 * Hyperliquid Session Key executor — TRADE_ONLY orders with Dynamic Max SL weld.
 * Workers-safe: uses hl/execution pipeline + injectable Eip712Signer (no ethers on hot path).
 */

import { readActiveSystemState, type SystemState } from "../../core/state";
import {
  assertSessionKeyExecutionGates,
  type SessionKeyOrderPayload,
} from "../../services/session-key-adapter";
import {
  assertSessionKeyPermission,
  type SessionKeyPermission,
} from "../../services/hyperliquidAdapter";
import type { FlattenAction, IntentLeg } from "../../core/intent-ledger";
import type { Eip712Signer } from "./eip712-signer";
import type { ExecutionContext, PreTradeValidationInput } from "./execution-types";
import {
  buildLimitOrderWire,
  buildMarketOrderWire,
  buildOrderAction,
  buildCancelAction,
} from "./execution-wire";
import { executeSignedAction } from "./execution-transport";
import { HL_TESTNET_EXCHANGE_URL } from "../../config/constants";

export interface HlSessionKeyExecutorOptions {
  signer: Eip712Signer;
  systemState?: SystemState;
  isTestnet?: boolean;
  dryRun?: boolean;
  fetchFn?: typeof fetch;
  exchangeUrl?: string;
  /** HL universe asset index — default ETH=0 on testnet/mainnet may differ */
  resolveAssetIndex?: (symbol?: string) => number;
}

export interface HlOrderExecutionResult {
  ok: boolean;
  dryRun: boolean;
  reason?: string;
  filledUsd?: number;
  reduceOnly: boolean;
}

const DEFAULT_ASSET_INDEX: Record<string, number> = {
  ETH: 0,
  BTC: 0,
};

function resolveAssetIndex(symbol: string | undefined, resolver?: (s?: string) => number): number {
  if (resolver) return resolver(symbol);
  const key = (symbol ?? "ETH").toUpperCase();
  return DEFAULT_ASSET_INDEX[key] ?? 0;
}

function legToSessionPayload(
  leg: IntentLeg,
  asset: number,
  limitPx: number,
  reduceOnly: boolean,
): SessionKeyOrderPayload {
  const isBuy = reduceOnly
    ? leg.side === "BUY" || leg.side === "LONG"
    : leg.side === "BUY" || leg.side === "LONG";
  const size = leg.sizeUsd / Math.max(limitPx, 1);
  return {
    asset,
    isBuy,
    limitPx: limitPx.toFixed(2),
    sz: size.toFixed(6),
    reduceOnly,
    orderType: { limit: { tif: reduceOnly ? "Ioc" : "Gtc" } },
  };
}

function buildExecutionContext(
  opts: HlSessionKeyExecutorOptions,
  state: SystemState,
): ExecutionContext {
  return {
    signer: opts.signer,
    gate: {
      signingChannelOpen: state.signingChannelOpen,
      hardlock: state.hardlock,
      criHardlock: state.hardlock || state.currentCri <= 0,
    },
    isTestnet: opts.isTestnet ?? true,
    dryRun: opts.dryRun ?? true,
    fetchFn: opts.fetchFn,
    exchangeUrl:
      opts.exchangeUrl ??
      (opts.isTestnet !== false ? HL_TESTNET_EXCHANGE_URL : undefined),
  };
}

/** Execute HL leg with Dynamic Max SL + TRADE_ONLY permission gate */
export async function executeHlSessionKeyOrder(
  leg: IntentLeg,
  opts: HlSessionKeyExecutorOptions & {
    limitPx?: number;
    preTrade?: PreTradeValidationInput;
    permission?: SessionKeyPermission;
    reduceOnly?: boolean;
  },
): Promise<HlOrderExecutionResult> {
  const state = opts.systemState ?? readActiveSystemState();
  const permission = opts.permission ?? "ORDER_EXECUTE";

  try {
    assertSessionKeyPermission(permission);
  } catch (err) {
    return {
      ok: false,
      dryRun: opts.dryRun ?? true,
      reason: err instanceof Error ? err.message : String(err),
      reduceOnly: opts.reduceOnly ?? false,
    };
  }

  const limitPx = opts.limitPx ?? 3_500;
  const asset = resolveAssetIndex(leg.symbol, opts.resolveAssetIndex);
  const reduceOnly = opts.reduceOnly ?? false;
  const payload = legToSessionPayload(leg, asset, limitPx, reduceOnly);

  try {
    assertSessionKeyExecutionGates(payload, state, state.accountBalanceUsd);
  } catch (err) {
    return {
      ok: false,
      dryRun: opts.dryRun ?? true,
      reason: err instanceof Error ? err.message : String(err),
      reduceOnly,
    };
  }

  const wire = reduceOnly
    ? buildMarketOrderWire({
        asset,
        isBuy: payload.isBuy,
        size: Number(payload.sz),
        limitPx,
        reduceOnly: true,
      })
    : buildLimitOrderWire({
        asset,
        isBuy: payload.isBuy,
        size: Number(payload.sz),
        limitPx,
        reduceOnly: false,
      });

  const action = buildOrderAction([wire]);
  const ctx = buildExecutionContext(opts, state);

  try {
    const result = await executeSignedAction(action, ctx, {
      preTrade: opts.preTrade,
      skipPreTrade: reduceOnly,
    });
    return {
      ok: true,
      dryRun: result.dryRun,
      filledUsd: leg.sizeUsd,
      reduceOnly,
    };
  } catch (err) {
    return {
      ok: false,
      dryRun: opts.dryRun ?? true,
      reason: err instanceof Error ? err.message : String(err),
      reduceOnly,
    };
  }
}

/** Reduce-only unwind / flatten for 2PC abort paths */
export async function flattenHlLeg(
  action: FlattenAction,
  opts: HlSessionKeyExecutorOptions & { limitPx?: number; symbol?: string },
): Promise<HlOrderExecutionResult> {
  const leg: IntentLeg = {
    venue: "HL",
    side: action.side,
    sizeUsd: action.sizeUsd,
    symbol: opts.symbol ?? "ETH",
  };
  return executeHlSessionKeyOrder(leg, {
    ...opts,
    permission: "ORDER_EXECUTE",
    limitPx: opts.limitPx,
    reduceOnly: true,
  });
}

/** Cancel open HL order by oid — TRADE_ONLY cancel path */
export async function cancelHlOrder(
  args: { asset: number; oid: number },
  opts: HlSessionKeyExecutorOptions,
): Promise<HlOrderExecutionResult> {
  try {
    assertSessionKeyPermission("ORDER_CANCEL");
  } catch (err) {
    return {
      ok: false,
      dryRun: opts.dryRun ?? true,
      reason: err instanceof Error ? err.message : String(err),
      reduceOnly: true,
    };
  }

  const state = opts.systemState ?? readActiveSystemState();
  const ctx = buildExecutionContext(opts, state);
  const action = buildCancelAction([{ asset: args.asset, oid: args.oid }]);

  try {
    const result = await executeSignedAction(action, ctx, { skipPreTrade: true });
    return { ok: true, dryRun: result.dryRun, reduceOnly: true };
  } catch (err) {
    return {
      ok: false,
      dryRun: opts.dryRun ?? true,
      reason: err instanceof Error ? err.message : String(err),
      reduceOnly: true,
    };
  }
}
