/**
 * SPDX-License-Identifier: Apache-2.0
 *
 * AI Agent Intent Protection — retail reflex evaluators.
 *
 * Guards against LLM-hallucinated:
 *  - Spender / approve targets (`UNAUTHORIZED_SPENDER_REJECTED`)
 *  - EIP-712 verifyingContract drift (`VENUE_DRIFT_REJECTED`)
 *  - Honeypot slippage trades (`SLIPPAGE_EXCEEDED` via soil lane)
 *  - Infinite retry storms (`MAX_ATTEMPTS_EXCEEDED_SEVERED` via `INTENT_RING_U32`)
 *
 * Scratch SSOT: `SOIL_FFI_REUSABLE_BUFFER` (Wasm soil) · `INTENT_RING_U32` (u32 hot path).
 * See `AI_INTENT_PROTECTION.md` for full threat model.
 */
import { INTENT_RING_U32 } from "../../core/intent-core-buffers";
import {
  evaluateIntentGateU32Pure,
  hashKeyToSlotIndex,
  resetIntentRingSlab,
  slotBaseOffset,
} from "../../core/intent-core-ring";
import { VENUE_DRIFT_REJECTED, MAX_ATTEMPTS_EXCEEDED_SEVERED } from "../../core/intent-mandate";
import {
  evaluateSoilSlippagePacked,
  MAX_SLIPPAGE,
  MIN_DEPTH_USD,
  packSoilLane,
  SOIL_REASON_CROSS_VENUE,
  SOIL_REASON_DEPTH_USD,
} from "../../core/soil-resistance-math";
import { INTENT_MAX_ATTEMPTS_DEFAULT, INTENT_SLOT_ATTEMPTS } from "../../core/wasm-intent-ffi";
import type { ParsedApprove } from "./calldata-parser";
import { evaluateTransportStreamSync, __resetTransportStreamForTests } from "./transport-stream";
import { evaluateIntentGateViaWasm, evaluateSoilViaWasm } from "./wasm-adapter";
import { formatRetailWarning } from "./warnings";
import type { RetailGuardConfig, RetailGuardRejectPayload, RetailSoilQuote } from "./types";

const SOIL_LANE = new Float64Array(6);
const DEFAULT_MAX_APPROVAL_USD = 10_000;
const TRIP_CROSS_WASM = 1;
const TRIP_DEPTH_WASM = 2;

let channelSevered = false;

export function __resetRetailGuardStateForTests(): void {
  channelSevered = false;
  resetIntentRingSlab();
  __resetTransportStreamForTests();
}

/** RPC transport protocol verification — stream sync before policy gates. */
export function evaluateRpcTransportProtocol(
  config: RetailGuardConfig,
): RetailGuardRejectPayload | null {
  const sync = evaluateTransportStreamSync(config.preferWasm !== false);
  if (sync.ok) return null;
  return {
    code: "RPC_TRANSPORT_SYNC_FAILED",
    message: `RPC_TRANSPORT_SYNC_FAILED:lag=${sync.syncLagScore}:bm=${sync.bitmarkValid ? 1 : 0}`,
    plainTextWarning: formatRetailWarning("RPC_TRANSPORT_SYNC_FAILED"),
  };
}

export function isRetailGuardChannelSevered(): boolean {
  return channelSevered;
}

function walletRingOffset(walletAddress: string): number {
  return slotBaseOffset(hashKeyToSlotIndex(`retail:${walletAddress.trim().toLowerCase()}`));
}

function isAllowedAddress(
  address: string | undefined,
  allowlist: readonly string[] | undefined,
): boolean {
  if (!address?.trim() || !allowlist?.length) return false;
  const norm = address.trim().toLowerCase();
  return allowlist.some((a) => a.trim().toLowerCase() === norm);
}

function approvalUsdNotional(approve: ParsedApprove, config: RetailGuardConfig): number {
  const decimals = config.approvalTokenDecimals ?? 18;
  const price = config.approvalTokenPriceUsd ?? 1;
  return (Number(approve.amountWei) / 10 ** decimals) * price;
}

export function evaluateRetailApproveGate(
  approve: ParsedApprove,
  config: RetailGuardConfig,
): RetailGuardRejectPayload | null {
  const spender = approve.spender;
  const allowed = isAllowedAddress(spender, config.allowedSpenders);
  const maxUsd = config.maxApprovalUsd ?? DEFAULT_MAX_APPROVAL_USD;
  const notional = approvalUsdNotional(approve, config);

  if (approve.infinite && !allowed) {
    return {
      code: "UNAUTHORIZED_SPENDER_REJECTED",
      message: `UNAUTHORIZED_SPENDER_REJECTED:infinite:spender=${spender}`,
      plainTextWarning: formatRetailWarning("UNAUTHORIZED_SPENDER_REJECTED", {
        spender,
        infinite: true,
      }),
    };
  }

  if (!allowed && notional > maxUsd) {
    return {
      code: "UNAUTHORIZED_SPENDER_REJECTED",
      message: `UNAUTHORIZED_SPENDER_REJECTED:notional=${notional.toFixed(2)}>max=${maxUsd}`,
      plainTextWarning: formatRetailWarning("UNAUTHORIZED_SPENDER_REJECTED", {
        spender,
        infinite: false,
      }),
    };
  }

  return null;
}

export function evaluateRetailVenueAllowlist(
  contract: string | undefined,
  config: RetailGuardConfig,
): RetailGuardRejectPayload | null {
  if (!contract?.trim() || !config.allowedVenues?.length) return null;
  if (isAllowedAddress(contract, config.allowedVenues)) return null;
  const norm = contract.trim().toLowerCase();
  return {
    code: "VENUE_DRIFT_REJECTED",
    message: `${VENUE_DRIFT_REJECTED}:contract=${norm}`,
    plainTextWarning: formatRetailWarning("VENUE_DRIFT_REJECTED", { contract: norm }),
  };
}

function evaluateRetailSoilGateTs(quote: RetailSoilQuote): RetailGuardRejectPayload | null {
  packSoilLane(
    quote.hlSpot,
    quote.hlPerp,
    quote.dydxPerp,
    quote.depthUsd,
    quote.maxSlippage ?? MAX_SLIPPAGE,
    quote.minDepthUsd ?? MIN_DEPTH_USD,
    SOIL_LANE,
  );
  const soil = evaluateSoilSlippagePacked(SOIL_LANE);
  if (soil.tripFlags & SOIL_REASON_CROSS_VENUE) {
    return {
      code: "SLIPPAGE_EXCEEDED",
      message: `SLIPPAGE_EXCEEDED:cross=${soil.crossVenueSlippage.toFixed(6)}`,
      plainTextWarning: formatRetailWarning("SLIPPAGE_EXCEEDED", {
        crossSlippage: soil.crossVenueSlippage.toFixed(4),
      }),
    };
  }
  if (soil.tripFlags & SOIL_REASON_DEPTH_USD) {
    return {
      code: "DEPTH_INSUFFICIENT",
      message: `DEPTH_INSUFFICIENT:depthUsd=${quote.depthUsd}`,
      plainTextWarning: formatRetailWarning("DEPTH_INSUFFICIENT", { depthUsd: quote.depthUsd }),
    };
  }
  return null;
}

export function evaluateRetailSoilGate(
  quote: RetailSoilQuote,
  preferWasm = true,
): RetailGuardRejectPayload | null {
  if (preferWasm) {
    const wasm = evaluateSoilViaWasm(quote);
    if (wasm) {
      if (wasm.tripFlags & TRIP_CROSS_WASM) {
        return {
          code: "SLIPPAGE_EXCEEDED",
          message: `SLIPPAGE_EXCEEDED:cross=${wasm.crossVenueSlippage.toFixed(6)}`,
          plainTextWarning: formatRetailWarning("SLIPPAGE_EXCEEDED", {
            crossSlippage: wasm.crossVenueSlippage.toFixed(4),
          }),
        };
      }
      if (wasm.tripFlags & TRIP_DEPTH_WASM) {
        return {
          code: "DEPTH_INSUFFICIENT",
          message: `DEPTH_INSUFFICIENT:depthUsd=${quote.depthUsd}`,
          plainTextWarning: formatRetailWarning("DEPTH_INSUFFICIENT", {
            depthUsd: quote.depthUsd,
          }),
        };
      }
      return null;
    }
  }
  return evaluateRetailSoilGateTs(quote);
}

function evaluateRetailIntentGateTs(
  config: RetailGuardConfig,
  targetVenueBit: number,
  offset: number,
  maxAttempts: number,
): { venueDrift: boolean; severChannel: boolean; attempts: number } {
  INTENT_RING_U32[offset + 2] = config.allowedVenueMask ?? 0;
  INTENT_RING_U32[offset + 3] = targetVenueBit;
  const gate = evaluateIntentGateU32Pure(offset, config.allowedVenueMask ?? 0, targetVenueBit, maxAttempts);
  return {
    venueDrift: gate.venueDrift,
    severChannel: gate.severChannel,
    attempts: gate.attempts,
  };
}

export function evaluateRetailIntentGate(
  config: RetailGuardConfig,
  targetVenueBit: number,
): RetailGuardRejectPayload | null {
  if (channelSevered) {
    return {
      code: "CHANNEL_SEVERED",
      message: "CHANNEL_SEVERED:hot-key pipeline severed after attempt budget exhaust",
      plainTextWarning: formatRetailWarning("CHANNEL_SEVERED"),
    };
  }

  const allowedMask = config.allowedVenueMask ?? 0;
  if (allowedMask === 0 || targetVenueBit === 0) return null;

  const offset = walletRingOffset(config.walletAddress);
  const maxAttempts = config.maxAttempts ?? INTENT_MAX_ATTEMPTS_DEFAULT;
  const preferWasm = config.preferWasm !== false;

  let venueDrift = false;
  let severChannel = false;
  let attempts = INTENT_RING_U32[offset + INTENT_SLOT_ATTEMPTS];

  if (preferWasm) {
    const wasm = evaluateIntentGateViaWasm(offset, allowedMask, targetVenueBit, maxAttempts);
    if (wasm) {
      venueDrift = wasm.venueDrift;
      severChannel = wasm.severChannel;
      attempts = wasm.attempts;
    } else {
      const ts = evaluateRetailIntentGateTs(config, targetVenueBit, offset, maxAttempts);
      venueDrift = ts.venueDrift;
      severChannel = ts.severChannel;
      attempts = ts.attempts;
    }
  } else {
    const ts = evaluateRetailIntentGateTs(config, targetVenueBit, offset, maxAttempts);
    venueDrift = ts.venueDrift;
    severChannel = ts.severChannel;
    attempts = ts.attempts;
  }

  if (venueDrift) {
    return {
      code: "VENUE_DRIFT_REJECTED",
      message: `${VENUE_DRIFT_REJECTED}:allowed=${allowedMask}&target=${targetVenueBit}=0`,
      plainTextWarning: formatRetailWarning("VENUE_DRIFT_REJECTED", {
        contract: `bit:${targetVenueBit}`,
      }),
    };
  }

  if (severChannel) {
    channelSevered = true;
    return {
      code: "MAX_ATTEMPTS_EXCEEDED_SEVERED",
      message: `${MAX_ATTEMPTS_EXCEEDED_SEVERED}:attempt=${attempts}:limit=${maxAttempts}`,
      plainTextWarning: formatRetailWarning("MAX_ATTEMPTS_EXCEEDED_SEVERED", { attempts }),
    };
  }

  return null;
}

export const RETAIL_UNKNOWN_VENUE_BIT = 1 << 7;

export function resolveVenueBitFromContract(
  contract: string | undefined,
  contractVenueIndex: Readonly<Record<string, number>> | undefined,
): number {
  if (!contract?.trim()) return 0;
  if (!contractVenueIndex) return RETAIL_UNKNOWN_VENUE_BIT;
  const idx = contractVenueIndex[contract.trim().toLowerCase()];
  if (idx === undefined || idx < 0 || idx > 7) return RETAIL_UNKNOWN_VENUE_BIT;
  return 1 << idx;
}
