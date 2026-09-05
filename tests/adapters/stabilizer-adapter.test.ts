import { describe, expect, it } from "vitest";
import {
  evaluateStabilizerSwapGuard,
  STABILIZER_SEPOLIA_CHAIN_ID,
  verifyStabilizerPoolCapacity,
} from "../../src/adapters/stabilizer/stabilizer-adapter";
import { SAFE_TRADING_TIME } from "../helpers/system-time";

const HEALTHY_SWAP = {
  chainId: STABILIZER_SEPOLIA_CHAIN_ID,
  fromAsset: "USDC" as const,
  toAsset: "USDT" as const,
  amountUsd: 25_000,
  poolReserveUsd: 5_000_000,
  poolCapacityUsd: 1_000_000,
  at: SAFE_TRADING_TIME,
};

describe("stabilizer-adapter", () => {
  it("normal 1:1 zero-slippage swap → ALLOW", () => {
    const capacity = verifyStabilizerPoolCapacity(HEALTHY_SWAP);
    expect(capacity.ok).toBe(true);

    const result = evaluateStabilizerSwapGuard(HEALTHY_SWAP);
    expect(result.ok).toBe(true);
    expect(result.status).toBe("ALLOW");
    expect(result.zeroSlippage).toBe(true);
    expect(result.soilOk).toBe(true);
    expect(result.capacityOk).toBe(true);
    expect(result.reserveOk).toBe(true);
    expect(result.latencyUs).toBeGreaterThan(0);
  });

  it("reserve floor breach / depleted capacity → SOIL_RESISTANCE_TRIP, FAIL_CLOSED", () => {
    const depleted = evaluateStabilizerSwapGuard({
      ...HEALTHY_SWAP,
      amountUsd: 6_000_000,
      poolReserveUsd: 5_000_000,
      poolCapacityUsd: 5_000_000,
      reserveFloorUsd: 100_000,
    });

    expect(depleted.ok).toBe(false);
    expect(depleted.status).toBe("FAIL_CLOSED");
    expect(depleted.capacityOk).toBe(false);
    expect(depleted.reserveOk).toBe(false);
    expect(depleted.soilOk).toBe(false);
    expect(depleted.reasons).toContain("SOIL_RESISTANCE_TRIP");
    expect(
      depleted.reasons.some(
        (r) =>
          r.startsWith("STABILIZER_RESERVE_FLOOR_BREACH") ||
          r.startsWith("STABILIZER_CAPACITY_EXCEEDED") ||
          r.includes("DEPTH"),
      ),
    ).toBe(true);
  });
});
