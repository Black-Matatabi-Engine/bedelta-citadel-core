/**
 * Pure backend Hyperliquid Session Key adapter — dry-run mock engine + soil gate.
 */

import type { SystemState } from "./systemState";
import {
  checkSoilResistance,
  MAX_SLIPPAGE,
  type SoilResistanceInput,
} from "./risk-control";
import {
  signAndExecuteOrder,
  type SessionKeyOrderPayload,
  type SigningResult,
  DefenseMatrixError,
} from "./session-key-adapter";
import { resolveSlRejectionFallback } from "./rootProtectionService";
import { DEFAULT_ACCOUNT_EQUITY_USD } from "./effective-max-sl";

/** Session key blast-radius — order execution only (no withdraw / leverage). */
export type SessionKeyPermission =
  | "ORDER_EXECUTE"
  | "ORDER_CANCEL"
  | "WITHDRAW"
  | "SET_LEVERAGE";

export const SESSION_KEY_ALLOWED_PERMISSIONS: readonly SessionKeyPermission[] = [
  "ORDER_EXECUTE",
  "ORDER_CANCEL",
] as const;

const SESSION_KEY_BLOCKED_PERMISSIONS: readonly SessionKeyPermission[] = [
  "WITHDRAW",
  "SET_LEVERAGE",
] as const;

let lastFullStateResyncAt: string | null = null;
let visibilityListenerAttached = false;

/** Tick velocity ceiling — slippage decay protection (0–100 scale) */
export const TICK_VELOCITY_SLIPPAGE_THRESHOLD = 75;

/** Session key expiry warning threshold (5 minutes). */
export const SESSION_KEY_WARNING_THRESHOLD_SEC = 300;

export interface SessionKeyValidityResult {
  valid: boolean;
  sessionKeyWarning: boolean;
  remainingSeconds: number;
  /** Force dry-run / signing fallback when key is expired */
  forceFallback: boolean;
}

/** Probe session key TTL — warn under 5m, force fallback on expiry. */
export function checkSessionKeyValidity(
  sessionExpiryTimestamp: number,
  nowMs = Date.now(),
): SessionKeyValidityResult {
  const remainingMs = sessionExpiryTimestamp - nowMs;
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const expired = remainingSeconds <= 0;
  const sessionKeyWarning =
    !expired && remainingSeconds < SESSION_KEY_WARNING_THRESHOLD_SEC;

  return {
    valid: !expired,
    sessionKeyWarning,
    remainingSeconds: Math.max(0, remainingSeconds),
    forceFallback: expired,
  };
}

export interface HyperliquidAdapterSecrets {
  privateKey?: string;
  sessionKey?: string;
}

export interface HyperliquidAdapterConfig extends HyperliquidAdapterSecrets {
  /** Force dry-run even when secrets exist */
  dryRun?: boolean;
}

export interface ExecuteOrderInput {
  payload: SessionKeyOrderPayload;
  soil: SoilResistanceInput;
  tickVelocity?: number;
  systemState?: SystemState;
  config?: HyperliquidAdapterConfig;
  leverage?: number;
  contractTarget?: string;
  profile?: "retail" | "institutional";
  sessionExpiryTimestamp?: number;
  permission?: SessionKeyPermission;
  /** Prior SL rejection — triggers IOC sweep fallback */
  slRejected?: boolean;
  rejectionReason?: string;
}

export interface CancelOrderInput {
  orderId: string;
  soil?: SoilResistanceInput;
  tickVelocity?: number;
  config?: HyperliquidAdapterConfig;
}

export interface HyperliquidFillResult {
  success: boolean;
  dryRun: boolean;
  fillId: string | null;
  signatureHash: string | null;
  rejected: boolean;
  reason?: string;
  sessionKeyWarning?: boolean;
  usedIocFallback?: boolean;
}

export interface HyperliquidCancelResult {
  success: boolean;
  dryRun: boolean;
  canceled: boolean;
  orderId: string;
  reason?: string;
}

export interface HyperliquidBalanceResult {
  success: boolean;
  dryRun: boolean;
  balanceUsd: number;
}

export class HyperliquidAdapterError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus = 403) {
    super(message);
    this.name = "HyperliquidAdapterError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export function resolveHyperliquidDryRun(
  config: HyperliquidAdapterConfig = {},
  systemState?: SystemState,
): boolean {
  if (systemState?.isSandboxMode === true) return true;
  if (config.dryRun === true) return true;
  if (config.dryRun === false) return false;
  const hasSecret = Boolean(config.privateKey?.trim() || config.sessionKey?.trim());
  return !hasSecret;
}

/** Block session key permissions outside order execution blast-radius. */
export function assertSessionKeyPermission(
  permission: SessionKeyPermission,
): void {
  if (
    SESSION_KEY_BLOCKED_PERMISSIONS.includes(permission) ||
    !SESSION_KEY_ALLOWED_PERMISSIONS.includes(permission)
  ) {
    throw new HyperliquidAdapterError(
      "SESSION_KEY_PERMISSION_DENIED",
      `Session key scope denied for ${permission} — allowed: ${SESSION_KEY_ALLOWED_PERMISSIONS.join(", ")}`,
      403,
    );
  }
}

export function readLastFullStateResyncAt(): string | null {
  return lastFullStateResyncAt;
}

/** Force full state resync after tab refocus / visibility restore. */
export async function forceFullStateResync(): Promise<{
  synced: boolean;
  at: string;
}> {
  lastFullStateResyncAt = new Date().toISOString();
  return { synced: true, at: lastFullStateResyncAt };
}

/** document.visibilityState listener — resync on tab refocus. */
export function registerVisibilityResyncListener(
  onResync: () => void | Promise<void> = async () => {
    await forceFullStateResync();
  },
): () => void {
  if (visibilityListenerAttached) {
    return () => undefined;
  }

  if (typeof document === "undefined") {
    return () => undefined;
  }

  const handler = (): void => {
    if (document.visibilityState === "visible") {
      void onResync();
    }
  };

  document.addEventListener("visibilitychange", handler);
  visibilityListenerAttached = true;

  return () => {
    document.removeEventListener("visibilitychange", handler);
    visibilityListenerAttached = false;
  };
}

/** Test-only visibility listener reset */
export function __resetVisibilityListenerForTests(): void {
  visibilityListenerAttached = false;
  lastFullStateResyncAt = null;
}

/** Reject when soil fuse trips or tick velocity exceeds slippage decay threshold. */
export function assertSoilResistanceForOrder(
  soil: SoilResistanceInput,
  tickVelocity = 0,
): void {
  const audit = checkSoilResistance(soil);
  if (audit.tripped) {
    throw new HyperliquidAdapterError(
      "SOIL_RESISTANCE_TRIP",
      `checkSoilResistance() blocked order: ${audit.reasons.join("; ")}`,
      403,
    );
  }

  if (tickVelocity > TICK_VELOCITY_SLIPPAGE_THRESHOLD) {
    throw new HyperliquidAdapterError(
      "SLIPPAGE_DECAY_TRIP",
      `Tick velocity ${tickVelocity} exceeds threshold ${TICK_VELOCITY_SLIPPAGE_THRESHOLD}`,
      403,
    );
  }

  const impliedSlippage = Math.max(audit.crossVenueSlippage, audit.spotPerpSlippage);
  if (impliedSlippage > (soil.maxSlippage ?? MAX_SLIPPAGE)) {
    throw new HyperliquidAdapterError(
      "SLIPPAGE_DECAY_TRIP",
      `Implied slippage ${impliedSlippage.toFixed(6)} exceeds fuse`,
      403,
    );
  }
}

function deterministicFillId(payload: SessionKeyOrderPayload): string {
  const seed = `${payload.asset}|${payload.limitPx}|${payload.sz}|${payload.isBuy ? 1 : 0}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `hl-dry-fill-${hash.toString(16).padStart(8, "0")}`;
}

function deterministicCancelId(orderId: string): string {
  return `hl-dry-cancel-${orderId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;
}

/** Session Key order execution — soil gate → dry-run mock or signing stub. */
export async function executeOrder(
  input: ExecuteOrderInput,
): Promise<HyperliquidFillResult> {
  const config = input.config ?? {};
  const dryRun = resolveHyperliquidDryRun(config, input.systemState);
  const permission = input.permission ?? "ORDER_EXECUTE";

  assertSessionKeyPermission(permission);

  let sessionKeyWarning = false;
  if (input.sessionExpiryTimestamp !== undefined) {
    const probe = checkSessionKeyValidity(input.sessionExpiryTimestamp);
    sessionKeyWarning = probe.sessionKeyWarning;
    if (probe.forceFallback) {
      return {
        success: false,
        dryRun,
        fillId: null,
        signatureHash: null,
        rejected: true,
        reason: "SESSION_KEY_EXPIRED_FALLBACK",
        sessionKeyWarning,
      };
    }
  }

  const slFallback = resolveSlRejectionFallback({
    rejected: input.slRejected === true,
    rejectionReason: input.rejectionReason,
    payload: input.payload,
  });

  const effectivePayload = slFallback.iocPayload ?? input.payload;
  const usedIocFallback = slFallback.fallbackToIoc;

  assertSoilResistanceForOrder(input.soil, input.tickVelocity ?? 0);

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      fillId: deterministicFillId(effectivePayload),
      signatureHash: null,
      rejected: false,
      ...(sessionKeyWarning ? { sessionKeyWarning } : {}),
      ...(usedIocFallback ? { usedIocFallback: true, reason: slFallback.reason } : {}),
    };
  }

  try {
    const signing: SigningResult = await signAndExecuteOrder(effectivePayload, {
      systemState: input.systemState,
      dryRun: false,
      leverage: input.leverage,
      contractTarget: input.contractTarget,
      profile: input.profile,
    });

    if (!signing.success) {
      const retryFallback = resolveSlRejectionFallback({
        rejected: true,
        rejectionReason: signing.errorReason ?? undefined,
        payload: input.payload,
      });
      if (retryFallback.fallbackToIoc && retryFallback.iocPayload) {
        const iocSigning = await signAndExecuteOrder(retryFallback.iocPayload, {
          systemState: input.systemState,
          dryRun: false,
          leverage: input.leverage,
          contractTarget: input.contractTarget,
          profile: input.profile,
        });
        return {
          success: iocSigning.success,
          dryRun: false,
          fillId: iocSigning.success
            ? deterministicFillId(retryFallback.iocPayload)
            : null,
          signatureHash: iocSigning.signatureHash,
          rejected: !iocSigning.success,
          reason: retryFallback.reason,
          usedIocFallback: true,
          ...(sessionKeyWarning ? { sessionKeyWarning } : {}),
        };
      }
    }

    return {
      success: signing.success,
      dryRun: false,
      fillId: signing.success ? deterministicFillId(effectivePayload) : null,
      signatureHash: signing.signatureHash,
      rejected: !signing.success,
      ...(signing.errorReason ? { reason: signing.errorReason } : {}),
      ...(sessionKeyWarning ? { sessionKeyWarning } : {}),
      ...(usedIocFallback ? { usedIocFallback: true, reason: slFallback.reason } : {}),
    };
  } catch (err) {
    if (err instanceof DefenseMatrixError) {
      return {
        success: false,
        dryRun: false,
        fillId: null,
        signatureHash: null,
        rejected: true,
        reason: err.message,
      };
    }
    throw err;
  }
}

/** Cancel open order — soil-safe dry-run mock when secrets absent. */
export async function cancelOrder(
  input: CancelOrderInput,
): Promise<HyperliquidCancelResult> {
  const config = input.config ?? {};
  const dryRun = resolveHyperliquidDryRun(config);

  assertSessionKeyPermission("ORDER_CANCEL");

  if (input.soil) {
    assertSoilResistanceForOrder(input.soil, input.tickVelocity ?? 0);
  }

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      canceled: true,
      orderId: input.orderId,
    };
  }

  return {
    success: true,
    dryRun: false,
    canceled: true,
    orderId: deterministicCancelId(input.orderId),
  };
}

/** Fetch account balance — mock deterministic equity in dry-run mode. */
export async function fetchAccountBalance(
  config: HyperliquidAdapterConfig = {},
  accountBalanceUsd = DEFAULT_ACCOUNT_EQUITY_USD,
): Promise<HyperliquidBalanceResult> {
  const dryRun = resolveHyperliquidDryRun(config);
  return {
    success: true,
    dryRun,
    balanceUsd: accountBalanceUsd,
  };
}
