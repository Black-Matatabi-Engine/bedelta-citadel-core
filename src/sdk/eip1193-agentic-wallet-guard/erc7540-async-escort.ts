/**
 * SPDX-License-Identifier: Apache-2.0
 * ERC-7540 Asynchronous Vault Pre-Execution Escort — operator + slippage drift gate.
 */
import type {
  ParsedCalldata,
  ParsedErc7540Request,
  ParsedErc7540SetOperator,
} from "./calldata-parser";
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

function isAllowedOperator(address: string, config: RetailGuardConfig): boolean {
  const norm = address.trim().toLowerCase();
  const ops = config.allowedOperators;
  if (ops?.length) return ops.some((o) => o.trim().toLowerCase() === norm);
  const spenders = config.allowedSpenders;
  if (spenders?.length) return spenders.some((s) => s.trim().toLowerCase() === norm);
  return false;
}

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
    plainTextWarning: formatRetailWarning(ERC7540_CODES.ASYNC_SLIPPAGE_DRIFT, {
      driftBps,
      maxBps,
    }),
  };
}

function resolveQuote(
  config: RetailGuardConfig,
  parsed: ParsedErc7540Request,
): Erc7540AsyncQuote | null {
  if (config.resolveErc7540Quote) {
    return config.resolveErc7540Quote(
      parsed.kind === "erc7540_request_deposit" ? "deposit" : "redeem",
      parsed.amountWei,
      parsed.vault,
    );
  }
  return config.erc7540AsyncQuote ?? null;
}

/** Evaluate ERC-7540 async vault calldata — 0-Gas fail-closed before broadcast. */
export function evaluateErc7540AsyncEscortGuard(
  parsed: ParsedErc7540,
  config: RetailGuardConfig,
): RetailGuardRejectPayload | null {
  if (parsed.kind === "erc7540_set_operator") {
    if (!parsed.approved) return null;
    if (!isAllowedOperator(parsed.operator, config)) return rejectOperator(parsed.operator);
    return null;
  }

  if (!isAllowedOperator(parsed.controller, config)) return rejectOperator(parsed.controller);

  const quote = resolveQuote(config, parsed);
  if (!quote) return null;

  const maxBps = quote.maxSlippageBps ?? config.erc7540MaxSlippageBps ?? DEFAULT_MAX_SLIPPAGE_BPS;
  const driftBps = computeErc7540SlippageDriftBps(quote.requestAmountWei, quote.claimableAmountWei);
  if (driftBps > maxBps) return rejectSlippage(driftBps, maxBps);
  return null;
}

/** Bridge ParsedCalldata union into ERC-7540 escort when applicable. */
export function evaluateErc7540FromParsedCalldata(
  parsed: ParsedCalldata,
  config: RetailGuardConfig,
): RetailGuardRejectPayload | null {
  if (
    parsed.kind !== "erc7540_request_deposit" &&
    parsed.kind !== "erc7540_request_redeem" &&
    parsed.kind !== "erc7540_set_operator"
  ) {
    return null;
  }
  return evaluateErc7540AsyncEscortGuard(parsed, config);
}
