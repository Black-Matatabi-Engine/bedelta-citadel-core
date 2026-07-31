import {
  STEP1_ROOT_KEYS,
  type MockConfig,
  type Step1RootKey,
  type Step1ScanResult,
  type UserMode,
} from "../types/step1";
import {
  computeEffectiveMaxSlUsd,
  DEFAULT_ACCOUNT_EQUITY_USD,
  sanitizeAccountEquityUsd,
} from "../../services/effective-max-sl";
import { calculateRiskScoreFromTrippedRoots } from "./risk-engine";
import {
  checkRoot17DailyLimit,
  createRoot17DailyState,
  type Root17DailyState,
} from "./root17-daily";

export {
  computeEffectiveMaxSlUsd,
  DEFAULT_ACCOUNT_EQUITY_USD,
} from "../../services/effective-max-sl";
export {
  calculateRiskScore,
  calculateRiskScoreFromTrippedRoots,
  statusesFromTrippedRoots,
  resolveStatusHudStage,
  STATUS_HUD_CONFIG,
  type StatusHudStage,
} from "./risk-engine";
export {
  checkRoot17DailyLimit,
  createRoot17DailyState,
  recordRoot17SlTrip,
  type Root17DailyState,
} from "./root17-daily";

/** Dynamic Max SL at default base-tier equity — (10k × 1%) + $100 = $200 */
export const MAX_SL_USD = computeEffectiveMaxSlUsd(
  DEFAULT_ACCOUNT_EQUITY_USD,
) as number;

/**
 * Hyperliquid Terms of Use & OFAC restricted jurisdictions.
 * Geo-Lock / soil resistance must refuse execution for these ISO country codes.
 */
export const HL_RESTRICTED_COUNTRIES = [
  "US",
  "CA",
  "CU",
  "IR",
  "KP",
  "SY",
  "GB",
] as const;

/** @deprecated Prefer HL_RESTRICTED_COUNTRIES — same ToS / OFAC list */
export const RESTRICTED_GEOS = HL_RESTRICTED_COUNTRIES;

/** VIX threshold that trips Extreme Macro Volatility Warning */
export const VIX_LOCK_THRESHOLD = 30 as const;

/** US equity open spike window (minutes from midnight EST) — 09:15–09:45 */
const OPEN_SPIKE_START_MIN = 9 * 60 + 15;
const OPEN_SPIKE_END_MIN = 9 * 60 + 45;

/** US equity close spike window (minutes from midnight EST) — 15:45–16:15 */
const CLOSE_SPIKE_START_MIN = 15 * 60 + 45;
const CLOSE_SPIKE_END_MIN = 16 * 60 + 15;

export type EstClockParts = {
  hour: number;
  minute: number;
  totalMinutes: number;
};

/**
 * Convert a UTC instant into America/New_York wall-clock parts (EST/EDT).
 */
export function getEstClockParts(now: Date = new Date()): EstClockParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { hour, minute, totalMinutes: hour * 60 + minute };
}

/** True when wall clock falls inside the US open spike window */
export function isUsOpenSpikeWindow(now: Date = new Date()): boolean {
  const { totalMinutes } = getEstClockParts(now);
  return (
    totalMinutes >= OPEN_SPIKE_START_MIN && totalMinutes < OPEN_SPIKE_END_MIN
  );
}

/** True when wall clock falls inside the US close spike window */
export function isUsCloseSpikeWindow(now: Date = new Date()): boolean {
  const { totalMinutes } = getEstClockParts(now);
  return (
    totalMinutes >= CLOSE_SPIKE_START_MIN && totalMinutes < CLOSE_SPIKE_END_MIN
  );
}

/** True when either open or close spike window is active */
export function isUsMarketSpikeWindow(now: Date = new Date()): boolean {
  return isUsOpenSpikeWindow(now) || isUsCloseSpikeWindow(now);
}

/** Map XP / trade-count proxy into a UserMode tier */
export function resolveUserMode(xp: number): UserMode {
  if (xp < 30) return "BEGINNER";
  if (xp <= 70) return "INTERMEDIATE";
  return "EXPERT";
}

/** 3-Role Pipeline modes (Shield / Tactical / Flash) */
export type TradeRoleMode = "SHIELD" | "TACTICAL" | "FLASH";

/** HL wallet historical fill / TX thresholds for role unlock */
export const ROLE_TX_THRESHOLDS = {
  SHIELD: 0,
  TACTICAL: 5,
  FLASH: 20,
} as const;

export const ROLE_LOCK_TIPS = {
  TACTICAL: "Requires ≥ 5 HL TXs to unlock",
  FLASH: "Requires ≥ 20 HL TXs",
} as const;

/** Flash Mode physical welds — never bypassed by survey unlock */
export function flashHardLocks(accountEquityUsd?: number) {
  return {
    root1_maxSlUsd: computeEffectiveMaxSlUsd(
      sanitizeAccountEquityUsd(accountEquityUsd),
    ),
    root8_maxSlippage: 0.005 as const,
  };
}

export const FLASH_HARD_LOCKS = flashHardLocks();

export interface RoleEligibilityResult {
  walletAddress: string;
  txCount: number;
  allowedModes: TradeRoleMode[];
  maxMode: TradeRoleMode;
  reasons: Partial<Record<TradeRoleMode, string>>;
  /** Always true — Root 1 dynamic Max SL is physically welded */
  root1HardWeld: true;
  /** Effective Max SL USD at evaluation equity */
  effectiveMaxSlUsd: number;
  /** Always 0.5% — Root 8 slippage breaker ceiling */
  root8SlippageMax: typeof FLASH_HARD_LOCKS.root8_maxSlippage;
}

/**
 * Resolve 3-Role eligibility from HL wallet historical TX / fill count.
 * Shield = default (0 TX). Tactical ≥5. Flash ≥20.
 */
export function checkRoleEligibility(input: {
  walletAddress?: string | null;
  txCount?: number | null;
  accountEquityUsd?: number | null;
}): RoleEligibilityResult {
  const walletAddress = String(input.walletAddress || "").trim();
  const raw = Number(input.txCount);
  const txCount = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  const effectiveMaxSlUsd = computeEffectiveMaxSlUsd(
    sanitizeAccountEquityUsd(input.accountEquityUsd),
  );

  const allowedModes: TradeRoleMode[] = ["SHIELD"];
  const reasons: Partial<Record<TradeRoleMode, string>> = {};

  if (txCount >= ROLE_TX_THRESHOLDS.TACTICAL) {
    allowedModes.push("TACTICAL");
  } else {
    reasons.TACTICAL = ROLE_LOCK_TIPS.TACTICAL;
  }

  if (txCount >= ROLE_TX_THRESHOLDS.FLASH) {
    allowedModes.push("FLASH");
  } else {
    reasons.FLASH = ROLE_LOCK_TIPS.FLASH;
  }

  const maxMode: TradeRoleMode = allowedModes.includes("FLASH")
    ? "FLASH"
    : allowedModes.includes("TACTICAL")
      ? "TACTICAL"
      : "SHIELD";

  return {
    walletAddress,
    txCount,
    allowedModes,
    maxMode,
    reasons,
    root1HardWeld: true,
    effectiveMaxSlUsd,
    root8SlippageMax: FLASH_HARD_LOCKS.root8_maxSlippage,
  };
}

export function isTradeModeAllowed(
  mode: TradeRoleMode,
  eligibility: RoleEligibilityResult,
): boolean {
  return eligibility.allowedModes.includes(mode);
}

/** Assert Flash physical locks (Root 1 + Root 8) — used when entering Flash. */
export function assertFlashHardLocks(accountEquityUsd?: number): {
  root1_lossLock: true;
  root8_slippageLock: true;
  maxLossUSD: number;
  maxSlippage: typeof FLASH_HARD_LOCKS.root8_maxSlippage;
} {
  const locks = flashHardLocks(accountEquityUsd);
  return {
    root1_lossLock: true,
    root8_slippageLock: true,
    maxLossUSD: locks.root1_maxSlUsd,
    maxSlippage: locks.root8_maxSlippage,
  };
}

const HL_INFO_URL = "https://api.hyperliquid.xyz/info";

/**
 * Fetch HL wallet historical fill count (userFills).
 * Returns 0 on empty address, network failure, or non-array payload.
 */
export async function fetchHlWalletTxCount(
  walletAddress: string,
  options?: { signal?: AbortSignal },
): Promise<number> {
  const user = String(walletAddress || "").trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(user)) return 0;
  try {
    const res = await fetch(HL_INFO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "userFills", user }),
      signal: options?.signal,
    });
    if (!res.ok) return 0;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return 0;
    return data.length;
  } catch {
    return 0;
  }
}

/**
 * End-to-end eligibility: resolve TX count (mock or live HL) then check roles.
 */
export async function checkRoleEligibilityForWallet(
  walletAddress: string,
  config?: MockConfig,
): Promise<RoleEligibilityResult> {
  let txCount = 0;
  if (config?.isMockMode && config.mockUserTxCount !== undefined) {
    txCount = Math.max(0, Math.floor(Number(config.mockUserTxCount) || 0));
  } else {
    txCount = await fetchHlWalletTxCount(walletAddress);
  }
  return checkRoleEligibility({ walletAddress, txCount });
}

function resolveGeoCountry(
  config?: MockConfig,
  requestHeaders?: Headers,
): string {
  if (config?.isMockMode && config.mockGeoCountry !== undefined) {
    return config.mockGeoCountry.toUpperCase();
  }
  const header = requestHeaders?.get("cf-ipcountry") ?? "";
  return header.trim().toUpperCase();
}

function resolveSpikeWindowActive(
  config?: MockConfig,
  now: Date = new Date(),
): { open: boolean; close: boolean; any: boolean } {
  if (config?.isMockMode && config.mockIsUSMarketOpenWindow !== undefined) {
    const forced = config.mockIsUSMarketOpenWindow;
    return { open: forced, close: false, any: forced };
  }
  const open = isUsOpenSpikeWindow(now);
  const close = isUsCloseSpikeWindow(now);
  return { open, close, any: open || close };
}

/**
 * Resolve macro VIX. In mock mode never hits a live API.
 * Live path is a stub placeholder that returns a safe default until wired.
 */
async function resolveVix(config?: MockConfig): Promise<number> {
  if (config?.isMockMode) {
    return config.mockVix ?? 18;
  }
  // Live VIX fetch intentionally deferred — dry-run / offline-safe default.
  return 18;
}

function resolveUserXp(config?: MockConfig): number {
  if (config?.isMockMode && config.mockUserXP !== undefined) {
    return config.mockUserXP;
  }
  return 0;
}

/**
 * Build the 20-Root Defense Matrix.
 * `true` = PASS (clear), `false` = FAIL/LOCKED.
 */
function buildMatrixDetails(input: {
  geoLocked: boolean;
  openSpikeLocked: boolean;
  closeSpikeLocked: boolean;
  vixLocked: boolean;
  primaryMode: UserMode;
  root17Tripped: boolean;
}): Record<Step1RootKey, boolean> {
  const {
    geoLocked,
    openSpikeLocked,
    closeSpikeLocked,
    vixLocked,
    primaryMode,
    root17Tripped,
  } = input;

  const lossLockPass = true; // Dynamic Max SL welded — always enforced/pass
  const beginnerCapPass = primaryMode !== "BEGINNER" || !vixLocked;
  const equityLockPass = !geoLocked && !openSpikeLocked && !closeSpikeLocked;
  const tsunamiPass = !openSpikeLocked && !closeSpikeLocked;
  const killSwitchPass = !geoLocked && !vixLocked;

  const matrix: Record<Step1RootKey, boolean> = {
    root1_lossLock: lossLockPass,
    root2_geoLock: !geoLocked,
    root3_openSpikeLock: !openSpikeLocked,
    root4_closeSpikeLock: !closeSpikeLocked,
    root5_vixLock: !vixLocked,
    root6_beginnerCap: beginnerCapPass,
    root7_equityLock: equityLockPass,
    root8_slippageLock: true,
    root9_depthLock: true,
    root10_tsunamiShield: tsunamiPass,
    root11_fundingExtreme: !vixLocked,
    root12_crossVenue: true,
    root13_sessionAuth: true,
    root14_capitalFloor: true,
    root15_leverageCap: primaryMode !== "BEGINNER",
    root16_correlation: !vixLocked,
    root17_drawdownDay: !root17Tripped,
    root18_rateLimit: true,
    root19_dataFreshness: true,
    root20_killSwitch: killSwitchPass,
  };

  // Guarantee all 20 canonical keys are present
  for (const key of STEP1_ROOT_KEYS) {
    if (matrix[key] === undefined) {
      matrix[key] = false;
    }
  }

  return matrix;
}

/**
 * Step 1 Defense Scan Engine.
 * Evaluates geo, US open/close spike windows, macro VIX, and XP mode,
 * then returns a SAFE / LOCKED result with the 20-Root matrix.
 *
 * When `config.isMockMode` is true, all external inputs are mock-driven
 * (no live API hits).
 */
export async function runStep1Scan(
  config?: MockConfig,
  requestHeaders?: Headers,
  root17State?: Root17DailyState,
): Promise<Step1ScanResult> {
  const now = new Date();

  const geo = resolveGeoCountry(config, requestHeaders);
  const geoLocked =
    geo.length > 0 &&
    (HL_RESTRICTED_COUNTRIES as readonly string[]).includes(geo);

  const spike = resolveSpikeWindowActive(config, now);
  const openSpikeLocked = spike.open;
  const closeSpikeLocked = spike.close;
  const spikeLocked = spike.any;

  const vix = await resolveVix(config);
  const vixLocked = vix > VIX_LOCK_THRESHOLD;

  const xp = resolveUserXp(config);
  const primaryMode = resolveUserMode(xp);

  const accountEquityUsd = sanitizeAccountEquityUsd(
    config?.mockAccountEquityUsd,
  );
  const effectiveMaxSlUsd = computeEffectiveMaxSlUsd(accountEquityUsd);

  const root17Check = checkRoot17DailyLimit({
    accountEquityUsd,
    state: root17State ?? createRoot17DailyState(now),
    now,
  });
  const root17Tripped = root17Check.tripped;

  const matrixDetails = buildMatrixDetails({
    geoLocked,
    openSpikeLocked,
    closeSpikeLocked,
    vixLocked,
    primaryMode,
    root17Tripped,
  });

  const trippedRoots: number[] = [];
  STEP1_ROOT_KEYS.forEach((key, idx) => {
    if (matrixDetails[key] === false) trippedRoots.push(idx + 1);
  });
  const risk_score = calculateRiskScoreFromTrippedRoots(trippedRoots);

  let status: Step1ScanResult["status"] = "SAFE";
  let activeLockReason: string | undefined;

  // Priority order: Root 17 → geo → spike window → VIX
  if (root17Tripped) {
    status = "LOCKED";
    activeLockReason =
      root17Check.reason ?? "Root 17 Daily Drawdown / SL Count Cap (Choice A)";
  } else if (geoLocked) {
    status = "LOCKED";
    activeLockReason = "Jurisdiction Access Restricted";
  } else if (spikeLocked) {
    status = "LOCKED";
    activeLockReason = "US Market Open/Close Volatility Window";
  } else if (vixLocked) {
    status = "LOCKED";
    activeLockReason = "Extreme Macro Volatility Warning";
  }

  return {
    status,
    primaryMode,
    maxLossUSD: effectiveMaxSlUsd,
    accountEquityUsd,
    risk_score,
    root17: root17Check,
    timestamp: Date.now(),
    ...(activeLockReason !== undefined ? { activeLockReason } : {}),
    matrixDetails,
  };
}
