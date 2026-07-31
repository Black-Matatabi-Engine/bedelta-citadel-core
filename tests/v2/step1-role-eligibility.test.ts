import { describe, expect, it } from "vitest";
import {
  assertFlashHardLocks,
  checkRoleEligibility,
  FLASH_HARD_LOCKS,
  isTradeModeAllowed,
  MAX_SL_USD,
  ROLE_LOCK_TIPS,
  ROLE_TX_THRESHOLDS,
} from "../../src/v2/services/step1-engine";

describe("checkRoleEligibility", () => {
  it("defaults to Shield at 0 TX", () => {
    const r = checkRoleEligibility({ walletAddress: "0xabc", txCount: 0 });
    expect(r.allowedModes).toEqual(["SHIELD"]);
    expect(r.maxMode).toBe("SHIELD");
    expect(r.reasons.TACTICAL).toBe(ROLE_LOCK_TIPS.TACTICAL);
    expect(r.reasons.FLASH).toBe(ROLE_LOCK_TIPS.FLASH);
    expect(r.root1HardWeld).toBe(true);
    expect(r.root8SlippageMax).toBe(0.005);
  });

  it("unlocks Tactical at ≥5 HL TXs", () => {
    const r = checkRoleEligibility({ txCount: 5 });
    expect(r.allowedModes).toEqual(["SHIELD", "TACTICAL"]);
    expect(r.maxMode).toBe("TACTICAL");
    expect(r.reasons.FLASH).toBe(ROLE_LOCK_TIPS.FLASH);
    expect(isTradeModeAllowed("TACTICAL", r)).toBe(true);
    expect(isTradeModeAllowed("FLASH", r)).toBe(false);
  });

  it("unlocks Flash at ≥20 HL TXs", () => {
    const r = checkRoleEligibility({ txCount: 20 });
    expect(r.allowedModes).toEqual(["SHIELD", "TACTICAL", "FLASH"]);
    expect(r.maxMode).toBe("FLASH");
    expect(isTradeModeAllowed("FLASH", r)).toBe(true);
  });

  it("treats invalid / missing txCount as 0", () => {
    expect(checkRoleEligibility({}).txCount).toBe(0);
    expect(checkRoleEligibility({ txCount: -3 }).txCount).toBe(0);
    expect(checkRoleEligibility({ txCount: Number.NaN }).txCount).toBe(0);
  });
  it("includes effectiveMaxSlUsd from account equity", () => {
    const r = checkRoleEligibility({ txCount: 0, accountEquityUsd: 25_000 });
    expect(r.effectiveMaxSlUsd).toBe(350);
  });
});

describe("assertFlashHardLocks", () => {
  it("hard-binds Root 1 dynamic Max SL and Root 8 0.5% slippage", () => {
    const locks = assertFlashHardLocks(10_000);
    expect(locks.root1_lossLock).toBe(true);
    expect(locks.root8_slippageLock).toBe(true);
    expect(locks.maxLossUSD).toBe(MAX_SL_USD);
    expect(locks.maxLossUSD).toBe(200);
    expect(locks.maxSlippage).toBe(FLASH_HARD_LOCKS.root8_maxSlippage);
    expect(locks.maxSlippage).toBe(0.005);
    expect(ROLE_TX_THRESHOLDS.TACTICAL).toBe(5);
    expect(ROLE_TX_THRESHOLDS.FLASH).toBe(20);
  });
});
