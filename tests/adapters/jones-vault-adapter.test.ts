import { afterEach, describe, expect, it } from "vitest";
import {
  JONES_ARBITRUM_CHAIN_ID,
  evaluateJonesVaultGuard,
  verifyJonesVaultSharePrice,
} from "../../src/adapters/jones/jones-vault-adapter";
import { __resetArbitrumGasGuardForTests } from "../../src/services/risk/arbitrum-gas-guard";
import { seedSafeArbitrumProbes } from "../helpers/arbitrum-probe-seed";
import { SAFE_TRADING_TIME } from "../helpers/system-time";

const NOW_MS = SAFE_TRADING_TIME.getTime();

const HEALTHY_REBALANCE = {
  chainId: JONES_ARBITRUM_CHAIN_ID,
  vaultId: "jGLP",
  action: "REBALANCE" as const,
  amountUsd: 50_000,
  vaultTvlUsd: 5_000_000,
  expectedSharePriceUsd: 1.245,
  quotedSharePriceUsd: 1.246,
  rebalancePending: false,
  refPriceUsd: 3500,
  spotPriceUsd: 3500,
  depthUsd: 400_000,
  agentId: "jones-test-agent",
  nowMs: NOW_MS,
  at: SAFE_TRADING_TIME,
};

afterEach(() => {
  __resetArbitrumGasGuardForTests();
});

describe("jones-vault-adapter", () => {
  it("vault share price within slippage band → ALLOW", () => {
    seedSafeArbitrumProbes(NOW_MS);
    expect(verifyJonesVaultSharePrice(HEALTHY_REBALANCE).ok).toBe(true);

    const result = evaluateJonesVaultGuard(HEALTHY_REBALANCE);
    expect(result.ok).toBe(true);
    expect(result.status).toBe("ALLOW");
    expect(result.shareOk).toBe(true);
    expect(result.soilOk).toBe(true);
    expect(result.shareSlippageBps).toBeLessThan(30);
  });

  it("flash-loan sandwich during rebalance → SOIL_RESISTANCE_TRIP, FAIL_CLOSED", () => {
    seedSafeArbitrumProbes(NOW_MS);
    const tripped = evaluateJonesVaultGuard({
      ...HEALTHY_REBALANCE,
      quotedSharePriceUsd: 1.32,
      rebalancePending: true,
      blockPriceDeviationBps: 35,
      depthUsd: 6_000,
    });

    expect(tripped.ok).toBe(false);
    expect(tripped.status).toBe("FAIL_CLOSED");
    expect(tripped.shareOk).toBe(false);
    expect(tripped.reasons).toContain("SOIL_RESISTANCE_TRIP");
    expect(
      tripped.reasons.some(
        (r) =>
          r.startsWith("JONES_SHARE_SLIPPAGE_BREACH") || r.startsWith("JONES_FLASH_SANDWICH_TRIP"),
      ),
    ).toBe(true);
  });
});
