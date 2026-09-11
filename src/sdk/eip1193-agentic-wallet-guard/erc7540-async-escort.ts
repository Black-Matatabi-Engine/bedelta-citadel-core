/**
 * SPDX-License-Identifier: Apache-2.0
 * ERC-7540 async vault escort — operator whitelist + vectorized Pending→Claimable bps.
 */
import type { ParsedCalldata, ParsedErc7540Request, ParsedErc7540SetOperator } from "./calldata-parser";
import { formatRetailWarning } from "./warnings";
import type { RetailGuardConfig, RetailGuardRejectPayload } from "./types";

export const ERC7540_CODES = {
  OPERATOR_REJECTED: "ERC7540_OPERATOR_REJECTED",
  ASYNC_SLIPPAGE_DRIFT: "ERC7540_ASYNC_SLIPPAGE_DRIFT",
} as const;

export type Erc7540RejectCode = (typeof ERC7540_CODES)[keyof typeof ERC7540_CODES];
export type ParsedErc7540 = ParsedErc7540Request | ParsedErc7540SetOperator;

export interface Erc7540AsyncQuote {
  requestAmountWei: bigint;
  claimableAmountWei: bigint;
  maxSlippageBps?: number;
}

const DEFAULT_MAX_SLIPPAGE_BPS = 50;

function listHas(address: string, list: readonly string[] | undefined): boolean {
  if (!list?.length) return false;
  const n = address.trim().toLowerCase();
  for (let i = 0; i < list.length; i++) {
    if (list[i]!.trim().toLowerCase() === n) return true;
  }
  return false;
}

function isAllowedOperator(address: string, config: RetailGuardConfig): boolean {
  return listHas(address, config.allowedOperators) || listHas(address, config.allowedSpenders);
}

/** |request−claimable| × 10000 / request — fail-closed on non-positive request. */
export function computeErc7540SlippageDriftBps(requestWei: bigint, claimableWei: bigint): number {
  if (requestWei <= 0n) return Number.POSITIVE_INFINITY;
  const delta = requestWei > claimableWei ? requestWei - claimableWei : claimableWei - requestWei;
  return Number((delta * 10_000n) / requestWei);
}

function rejectOperator(operator: string): RetailGuardRejectPayload {
  const norm = operator.trim().toLowerCase();
  return {
    code: ERC7540_CODES.OPERATOR_REJECTED,
    message: `ERC7540_OPERATOR_REJECTED:operator=${norm}`,
    plainTextWarning: formatRetailWarning(ERC7540_CODES.OPERATOR_REJECTED, { operator: norm }),
  };
}

function rejectSlippage(driftBps: number, maxBps: number): RetailGuardRejectPayload {
  return {
    code: ERC7540_CODES.ASYNC_SLIPPAGE_DRIFT,
    message: `ERC7540_ASYNC_SLIPPAGE_DRIFT:drift=${driftBps}:max=${maxBps}`,
    plainTextWarning: formatRetailWarning(ERC7540_CODES.ASYNC_SLIPPAGE_DRIFT, { driftBps, maxBps }),
  };
}

export function evaluateErc7540AsyncEscortGuard(
  parsed: ParsedErc7540,
  config: RetailGuardConfig,
): RetailGuardRejectPayload | null {
  if (parsed.kind === "erc7540_set_operator") {
    return parsed.approved && !isAllowedOperator(parsed.operator, config)
      ? rejectOperator(parsed.operator)
      : null;
  }
  if (!isAllowedOperator(parsed.controller, config)) return rejectOperator(parsed.controller);

  const quote = config.resolveErc7540Quote
    ? config.resolveErc7540Quote(
        parsed.kind === "erc7540_request_deposit" ? "deposit" : "redeem",
        parsed.amountWei,
        parsed.vault,
      )
    : (config.erc7540AsyncQuote ?? null);
  if (!quote) return null;

  const maxBps = quote.maxSlippageBps ?? config.erc7540MaxSlippageBps ?? DEFAULT_MAX_SLIPPAGE_BPS;
  const driftBps = computeErc7540SlippageDriftBps(quote.requestAmountWei, quote.claimableAmountWei);
  return driftBps > maxBps ? rejectSlippage(driftBps, maxBps) : null;
}

export function evaluateErc7540FromParsedCalldata(
  parsed: ParsedCalldata,
  config: RetailGuardConfig,
): RetailGuardRejectPayload | null {
  const k = parsed.kind;
  if (k !== "erc7540_request_deposit" && k !== "erc7540_request_redeem" && k !== "erc7540_set_operator") {
    return null;
  }
  return evaluateErc7540AsyncEscortGuard(parsed, config);
}
