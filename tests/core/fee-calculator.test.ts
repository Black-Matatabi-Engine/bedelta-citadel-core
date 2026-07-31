import { describe, expect, it } from "vitest";
import {
  INSTANT_WITHDRAWAL_CONVENIENCE_FEE_RATE,
  PERFORMANCE_FEE_RATE,
  calculateInstantWithdrawalFee,
  calculateYieldFees,
  netApyAfterPerformanceFee,
  protocolTreasuryFeeFromGross,
} from "../../src/core/fee-calculator";

describe("fee-calculator", () => {
  it("applies 15% performance fee to gross APY", () => {
    const fees = calculateYieldFees(0.12);
    expect(fees.performanceFeeRate).toBe(PERFORMANCE_FEE_RATE);
    expect(fees.protocolTreasuryFee).toBeCloseTo(0.018);
    expect(fees.netApy).toBeCloseTo(0.102);
    expect(fees.netApy + fees.protocolTreasuryFee).toBeCloseTo(0.12);
  });

  it("returns zero fees for zero gross APY", () => {
    const fees = calculateYieldFees(0);
    expect(fees.netApy).toBe(0);
    expect(fees.protocolTreasuryFee).toBe(0);
  });

  it("computes 0.1% instant withdrawal convenience fee", () => {
    const result = calculateInstantWithdrawalFee(10_000);
    expect(result.convenienceFeeRate).toBe(INSTANT_WITHDRAWAL_CONVENIENCE_FEE_RATE);
    expect(result.convenienceFeeUsd).toBeCloseTo(10);
    expect(result.netWithdrawalUsd).toBeCloseTo(9_990);
  });

  it("exposes helper accessors for net APY and treasury fee", () => {
    expect(netApyAfterPerformanceFee(0.2)).toBeCloseTo(0.17);
    expect(protocolTreasuryFeeFromGross(0.2)).toBeCloseTo(0.03);
  });
});
