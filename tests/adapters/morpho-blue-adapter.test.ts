import { afterEach, describe, expect, it } from "vitest";
import {
  MORPHO_ARBITRUM_CHAIN_ID,
  evaluateMorphoBlueGuard,
  verifyMorphoOracle,
} from "../../src/adapters/morpho/morpho-blue-adapter";
import { __resetArbitrumGasGuardForTests } from "../../src/services/risk/arbitrum-gas-guard";
import { seedSafeArbitrumProbes } from "../helpers/arbitrum-probe-seed";
import { SAFE_TRADING_TIME } from "../helpers/system-time";

const NOW_MS = SAFE_TRADING_TIME.getTime();

const HEALTHY_SUPPLY = {
  chainId: MORPHO_ARBITRUM_CHAIN_ID,
  marketId: "WETH/USDC",
  action: "SUPPLY" as const,
  amountUsd: 50_000,
  marketLiquidityUsd: 5_000_000,
  oraclePriceUsd: 3500,
  referencePriceUsd: 3500,
  oracleTimestampMs: NOW_MS - 60_000,
  refPriceUsd: 3500,
  spotPriceUsd: 3500,
  depthUsd: 400_000,
  agentId: "morpho-test-agent",
  nowMs: NOW_MS,
  at: SAFE_TRADING_TIME,
};

afterEach(() => {
  __resetArbitrumGasGuardForTests();
});

describe("morpho-blue-adapter", () => {
  it("fresh oracle within deviation band → ALLOW", () => {
    seedSafeArbitrumProbes(NOW_MS);
    expect(verifyMorphoOracle({
      oracleTimestampMs: HEALTHY_SUPPLY.oracleTimestampMs,
      nowMs: NOW_MS,
      oraclePriceUsd: HEALTHY_SUPPLY.oraclePriceUsd,
      referencePriceUsd: HEALTHY_SUPPLY.referencePriceUsd,
      marketLiquidityUsd: HEALTHY_SUPPLY.marketLiquidityUsd,
    }).ok).toBe(true);

    const result = evaluateMorphoBlueGuard(HEALTHY_SUPPLY);
    expect(result.ok).toBe(true);
    expect(result.status).toBe("ALLOW");
    expect(result.oracleOk).toBe(true);
    expect(result.soilOk).toBe(true);
    expect(result.oracleAgeMs).toBeLessThan(3_600_000);
  });

  it("stale oracle and shallow depth → SOIL_RESISTANCE_TRIP, FAIL_CLOSED", () => {
    seedSafeArbitrumProbes(NOW_MS);
    const tripped = evaluateMorphoBlueGuard({
      ...HEALTHY_SUPPLY,
      oracleTimestampMs: NOW_MS - 4_000_000,
      oraclePriceUsd: 3600,
      referencePriceUsd: 3500,
      marketLiquidityUsd: 50_000,
      depthUsd: 6_000,
    });

    expect(tripped.ok).toBe(false);
    expect(tripped.status).toBe("FAIL_CLOSED");
    expect(tripped.oracleOk).toBe(false);
    expect(tripped.reasons).toContain("SOIL_RESISTANCE_TRIP");
    expect(
      tripped.reasons.some(
        (r) => r.startsWith("MORPHO_ORACLE_STALE") || r.startsWith("MORPHO_ORACLE_DEVIATION"),
      ),
    ).toBe(true);
  });
});
