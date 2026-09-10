/** P0 intent mandate — venue drift lock + per-digest attempt budget SSOT. */
import { hashAbiString } from "../utils/abi-keccak";
import { FLAGS_SEVERED } from "./risk-flags";
import { severSigningChannel } from "./state-store";
import type { SoilResistanceInput, SoilResistanceResult } from "./soil-resistance-types";

export const VENUE_DRIFT_REJECTED = "VENUE_DRIFT_REJECTED" as const;
export const MAX_ATTEMPTS_EXCEEDED_SEVERED = "MAX_ATTEMPTS_EXCEEDED_SEVERED" as const;
export const INTENT_DIGEST_MISMATCH = "INTENT_DIGEST_MISMATCH" as const;
export const MAX_ATTEMPTS_PER_INTENT = 3 as const;

export interface IntentDigestInput {
  chainId: number;
  venueKey: string;
  action: string;
}

const attemptCounts = new Map<string, number>();

export function __resetIntentAttemptTrackerForTests(): void {
  attemptCounts.clear();
}

export function normalizeVenueKey(venue: string): string {
  return venue.trim().toLowerCase();
}

/** Cryptographic bind: chainId + venueKey + action — venue swap invalidates digest. */
export function buildIntentDigest(input: IntentDigestInput): `0x${string}` {
  const chainId = Math.trunc(input.chainId);
  if (!Number.isFinite(chainId) || chainId <= 0) {
    throw new Error("INTENT_DIGEST_CHAIN_ID_INVALID");
  }
  const venueKey = normalizeVenueKey(input.venueKey);
  const action = input.action.trim();
  if (!venueKey || !action) throw new Error("INTENT_DIGEST_FIELDS_REQUIRED");
  return hashAbiString(`citadel:intent:v1:${chainId}:${venueKey}:${action}`);
}

function resolveTargetVenue(input: SoilResistanceInput): string | null {
  const raw = input.targetVenue ?? input.venueKey;
  if (!raw?.trim()) return null;
  return normalizeVenueKey(raw);
}

function resolveAttemptKey(input: SoilResistanceInput): string | null {
  const digest = input.intentDigest?.trim().toLowerCase();
  if (digest && /^0x[a-f0-9]{64}$/.test(digest)) return digest;
  const agentId = input.agentId?.trim();
  if (agentId) return `agent:${agentId}`;
  return null;
}

function mandateTrip(reasons: string[], sever = true): SoilResistanceResult {
  if (sever) severSigningChannel();
  return {
    ok: false,
    tripped: true,
    crossVenueSlippage: -1,
    spotPerpSlippage: -1,
    reasons,
  };
}

/** Venue whitelist + digest bind + attempt budget — fail-closed before soil math. */
export function evaluateIntentMandateGate(input: SoilResistanceInput): SoilResistanceResult | null {
  const targetVenue = resolveTargetVenue(input);
  const allowed = input.allowedVenues;
  if (targetVenue && allowed && allowed.length > 0) {
    const ok = allowed.some((v) => normalizeVenueKey(v) === targetVenue);
    if (!ok) {
      return mandateTrip([`${VENUE_DRIFT_REJECTED}:target=${targetVenue}`]);
    }
  }

  const chainId = input.chainId;
  const action = input.intentAction?.trim();
  const digest = input.intentDigest?.trim();
  if (
    digest &&
    /^0x[a-fA-F0-9]{64}$/.test(digest) &&
    targetVenue &&
    action &&
    chainId !== undefined &&
    Number.isFinite(chainId)
  ) {
    const expected = buildIntentDigest({ chainId, venueKey: targetVenue, action }).toLowerCase();
    if (digest.toLowerCase() !== expected) {
      return mandateTrip([INTENT_DIGEST_MISMATCH, VENUE_DRIFT_REJECTED]);
    }
  }

  const attemptKey = resolveAttemptKey(input);
  if (!attemptKey) return null;

  const next = (attemptCounts.get(attemptKey) ?? 0) + 1;
  attemptCounts.set(attemptKey, next);
  if (next > MAX_ATTEMPTS_PER_INTENT) {
    severSigningChannel();
    return mandateTrip(
      [`${MAX_ATTEMPTS_EXCEEDED_SEVERED}:attempt=${next}:limit=${MAX_ATTEMPTS_PER_INTENT}`, `FLAGS_SEVERED=${FLAGS_SEVERED}`],
      true,
    );
  }

  return null;
}

export function hasIntentMandateFields(input: SoilResistanceInput): boolean {
  return (
    (input.allowedVenues?.length ?? 0) > 0 ||
    Boolean(input.intentDigest?.trim()) ||
    Boolean(input.agentId?.trim()) ||
    Boolean(input.targetVenue?.trim()) ||
    Boolean(input.venueKey?.trim())
  );
}
