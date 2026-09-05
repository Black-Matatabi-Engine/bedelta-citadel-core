import { afterEach, describe, expect, it } from "vitest";
import {
  RADIANT_ARBITRUM_CHAIN_ID,
  RADIANT_HF_FAIL_CLOSED_THRESHOLD,
  evaluateRadiantLendingGuard,
  verifyRadiantHealthFactor,
} from "../../src/adapters/radiant/radiant-lending-adapter";
import { __resetArbitrumGasGuardForTests } from "../../src/services/risk/arbitrum-gas-guard";
import { seedSafeArbitrumProbes } from "../helpers/arbitrum-probe-seed";
import { SAFE_TRADING_TIME } from "../helpers/system-time";

const NOW_MS = SAFE_TRADING_TIME.getTime();

const HEALTHY_BORROW = {
  chainId: RADIANT_ARBITRUM_CHAIN_ID,
  market: "WETH/USDC",
  collateralUsd: 150_000,
  debtUsd: 80_000,
  liquidationThreshold: 0.825,
  projectedHealthFactor: 1.42,
  refPriceUsd: 3500,
  spotPriceUsd: 3500,
  depthUsd: 500_000,
  agentId: "radiant-test-agent",
  nowMs: NOW_MS,
  at: SAFE_TRADING_TIME,
};

afterEach(() => {
  __resetArbitrumGasGuardForTests();
});

describe("radiant-lending-adapter", () => {
  it("healthy HF above fail-closed threshold → ALLOW", () => {
    seedSafeArbitrumProbes(NOW_MS);
    const hf = verifyRadiantHealthFactor(HEALTHY_BORROW);
    expect(hf.ok).toBe(true);
    expect(hf.healthFactor).toBeGreaterThan(RADIANT_HF_FAIL_CLOSED_THRESHOLD);

    const result = evaluateRadiantLendingGuard(HEALTHY_BORROW);
    expect(result.ok).toBe(true);
    expect(result.status).toBe("ALLOW");
    expect(result.hfOk).toBe(true);
    expect(result.soilOk).toBe(true);
  });

  it("HF below 1.15 and cross-chain boundary breach → SOIL_RESISTANCE_TRIP, FAIL_CLOSED", () => {
    seedSafeArbitrumProbes(NOW_MS);
    const tripped = evaluateRadiantLendingGuard({
      ...HEALTHY_BORROW,
      collateralUsd: 95_000,
      debtUsd: 80_000,
      projectedHealthFactor: 1.08,
      crossChainSourceHf: 1.35,
      crossChainDestHf: 1.12,
      depthUsd: 8_000,
    });

    expect(tripped.ok).toBe(false);
    expect(tripped.status).toBe("FAIL_CLOSED");
    expect(tripped.hfOk).toBe(false);
    expect(tripped.healthFactor).toBeLessThan(RADIANT_HF_FAIL_CLOSED_THRESHOLD);
    expect(tripped.reasons).toContain("SOIL_RESISTANCE_TRIP");
    expect(
      tripped.reasons.some(
        (r) =>
          r.startsWith("RADIANT_HF_FAIL_CLOSED") ||
          r.startsWith("RADIANT_PROJECTED_HF_FAIL_CLOSED") ||
          r.startsWith("RADIANT_CROSS_CHAIN_HF_BOUNDARY"),
      ),
    ).toBe(true);
  });
});
