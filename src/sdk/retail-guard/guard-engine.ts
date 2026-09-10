/**
 * Pure retail guard evaluators — wires Zero-GC core without services/ orchestration.
 */
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
import { INTENT_MAX_ATTEMPTS_DEFAULT } from "../../core/wasm-intent-ffi";
import type { RetailGuardConfig, RetailGuardRejectPayload, RetailSoilQuote } from "./types";

const SOIL_LANE = new Float64Array(6);

let channelSevered = false;

export function __resetRetailGuardStateForTests(): void {
  channelSevered = false;
  resetIntentRingSlab();
}

export function isRetailGuardChannelSevered(): boolean {
  return channelSevered;
}

function walletRingOffset(walletAddress: string): number {
  const key = `retail:${walletAddress.trim().toLowerCase()}`;
  return slotBaseOffset(hashKeyToSlotIndex(key));
}

export function evaluateRetailSoilGate(quote: RetailSoilQuote): RetailGuardRejectPayload | null {
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
      plainTextWarning:
        "Swap blocked: price impact exceeds your slippage safety limit (0-Gas pre-broadcast guard).",
    };
  }
  if (soil.tripFlags & SOIL_REASON_DEPTH_USD) {
    return {
      code: "DEPTH_INSUFFICIENT",
      message: `DEPTH_INSUFFICIENT:depthUsd=${quote.depthUsd}`,
      plainTextWarning: "Swap blocked: market depth is below the minimum safety floor.",
    };
  }
  return null;
}

export function evaluateRetailIntentGate(
  config: RetailGuardConfig,
  targetVenueBit: number,
): RetailGuardRejectPayload | null {
  if (channelSevered) {
    return {
      code: "CHANNEL_SEVERED",
      message: "CHANNEL_SEVERED:hot-key pipeline severed after attempt budget exhaust",
      plainTextWarning: "Signing channel severed — wait before retrying (FOMO throttle active).",
    };
  }

  const allowedMask = config.allowedVenueMask ?? 0;
  if (allowedMask === 0 || targetVenueBit === 0) return null;

  const offset = walletRingOffset(config.walletAddress);
  const maxAttempts = config.maxAttempts ?? INTENT_MAX_ATTEMPTS_DEFAULT;
  const gate = evaluateIntentGateU32Pure(offset, allowedMask, targetVenueBit, maxAttempts);

  if (gate.venueDrift) {
    return {
      code: "VENUE_DRIFT_REJECTED",
      message: `${VENUE_DRIFT_REJECTED}:allowed=${allowedMask}&target=${targetVenueBit}=0`,
      plainTextWarning:
        "Signature blocked: contract or venue is not on your approved whitelist (anti-phishing).",
    };
  }

  if (gate.severChannel) {
    channelSevered = true;
    return {
      code: "MAX_ATTEMPTS_EXCEEDED_SEVERED",
      message: `${MAX_ATTEMPTS_EXCEEDED_SEVERED}:attempt=${gate.attempts}:limit=${maxAttempts}`,
      plainTextWarning:
        "Too many rapid submit attempts — signing channel severed to prevent FOMO / panic trading.",
    };
  }

  return null;
}

/** Reserved venue bit for contracts absent from the retail allowlist index. */
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
