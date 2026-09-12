import { afterEach, describe, expect, it } from "vitest";
import {
  __clearStabilizerCooldownsForTests,
  evaluateStabilizerSwapGuard,
  STABILIZER_SEPOLIA_CHAIN_ID,
  verifyStabilizerPoolCapacity,
} from "../../src/adapters/stabilizer/stabilizer-adapter";
import { SAFE_TRADING_TIME } from "../helpers/system-time";

const NOW_MS = SAFE_TRADING_TIME.getTime();
const AGENT_ID = "stabilizer-test-agent";

const HEALTHY_SWAP = {
  chainId: STABILIZER_SEPOLIA_CHAIN_ID,
  fromAsset: "USDC" as const,
  toAsset: "USDT" as const,
  amountUsd: 25_000,
  poolReserveUsd: 5_000_000,
  poolCapacityUsd: 1_000_000,
  usdzMarkUsd: 1,
  collateralMarkUsd: 1,
  agentId: AGENT_ID,
  nowMs: NOW_MS,
  at: SAFE_TRADING_TIME,
};

afterEach(() => {
  __clearStabilizerCooldownsForTests();
});

describe("stabilizer-adapter", () => {
  it("normal 1:1 swap within zero-slippage capacity → ALLOW", () => {
    expect(verifyStabilizerPoolCapacity(HEALTHY_SWAP).ok).toBe(true);

    const result = evaluateStabilizerSwapGuard(HEALTHY_SWAP);
    expect(result.ok).toBe(true);
    expect(result.status).toBe("ALLOW");
    expect(result.zeroSlippage).toBe(true);
    expect(result.pegOk).toBe(true);
    expect(result.reserveRatioOk).toBe(true);
    expect(result.soilOk).toBe(true);
    expect(result.signatureChannelSevered).toBe(false);
  });

  it("liquidation trigger / reserve floor depletion → SOIL_RESISTANCE_TRIP, FAIL_CLOSED", () => {
    const depleted = evaluateStabilizerSwapGuard({
      ...HEALTHY_SWAP,
      amountUsd: 4_950_000,
      poolReserveUsd: 5_000_000,
      poolCapacityUsd: 5_000_000,
    });

    expect(depleted.ok).toBe(false);
    expect(depleted.status).toBe("FAIL_CLOSED");
    expect(depleted.reserveRatioOk).toBe(false);
    expect(depleted.reasons).toContain("SOIL_RESISTANCE_TRIP");
    expect(
      depleted.reasons.some(
        (r) =>
          r.startsWith("STABILIZER_RESERVE_RATIO_BREACH") ||
          r.startsWith("STABILIZER_RESERVE_FLOOR_BREACH"),
      ),
    ).toBe(true);
  });

  it("USDZ de-peg trigger → cooldown on retry, signature channel severed", () => {
    const tripped = evaluateStabilizerSwapGuard({
      ...HEALTHY_SWAP,
      fromAsset: "USDZ",
      usdzMarkUsd: 0.994,
    });

    expect(tripped.ok).toBe(false);
    expect(tripped.status).toBe("FAIL_CLOSED");
    expect(tripped.pegOk).toBe(false);
    expect(tripped.signatureChannelSevered).toBe(true);
    expect(tripped.reasons.some((r) => r.startsWith("STABILIZER_USDZ_DEPEG"))).toBe(true);
    expect(tripped.reasons).toContain("STABILIZER_SIGNATURE_CHANNEL_SEVERED");

    const retry = evaluateStabilizerSwapGuard({
      ...HEALTHY_SWAP,
      fromAsset: "USDZ",
      usdzMarkUsd: 1,
    });
    expect(retry.ok).toBe(false);
    expect(retry.status).toBe("MANDATORY_COOLDOWN_ACTIVE");
    expect(retry.signatureChannelSevered).toBe(true);
    expect(retry.reasons.some((r) => r.startsWith("MANDATORY_COOLDOWN_ACTIVE"))).toBe(true);
  });
});
