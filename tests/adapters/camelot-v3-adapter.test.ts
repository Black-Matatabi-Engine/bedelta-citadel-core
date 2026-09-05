import { afterEach, describe, expect, it } from "vitest";
import {
  CAMELOT_V3_ARBITRUM_CHAIN_ID,
  evaluateCamelotV3SwapGuard,
  verifyCamelotPoolLiquidity,
} from "../../src/adapters/camelot/camelot-v3-adapter";
import { __resetArbitrumGasGuardForTests } from "../../src/services/risk/arbitrum-gas-guard";
import { seedSafeArbitrumProbes } from "../helpers/arbitrum-probe-seed";
import { SAFE_TRADING_TIME } from "../helpers/system-time";

const NOW_MS = SAFE_TRADING_TIME.getTime();

const HEALTHY_SWAP = {
  chainId: CAMELOT_V3_ARBITRUM_CHAIN_ID,
  tokenIn: "WETH",
  tokenOut: "USDC",
  amountInUsd: 25_000,
  activeLiquidityUsd: 2_500_000,
  dynamicFeeBps: 5,
  tickRangeLiquidityUsd: 200_000,
  tickSpacing: 60,
  directionalFeeBps: 2,
  spotPriceUsd: 3500,
  refPriceUsd: 3500,
  depthUsd: 500_000,
  agentId: "camelot-test-agent",
  nowMs: NOW_MS,
  at: SAFE_TRADING_TIME,
};

afterEach(() => {
  __resetArbitrumGasGuardForTests();
});

describe("camelot-v3-adapter", () => {
  it("normal V3 swap within pool depth → ALLOW", () => {
    seedSafeArbitrumProbes(NOW_MS);
    expect(verifyCamelotPoolLiquidity(HEALTHY_SWAP).ok).toBe(true);

    const result = evaluateCamelotV3SwapGuard(HEALTHY_SWAP);
    expect(result.ok).toBe(true);
    expect(result.status).toBe("ALLOW");
    expect(result.liquidityOk).toBe(true);
    expect(result.soilOk).toBe(true);
    expect(result.estimatedSlippageBps).toBeLessThan(50);
    expect(result.reasons).toHaveLength(0);
  });

  it("high slippage / depleted V3 liquidity → SOIL_RESISTANCE_TRIP, FAIL_CLOSED", () => {
    seedSafeArbitrumProbes(NOW_MS);
    const depleted = evaluateCamelotV3SwapGuard({
      ...HEALTHY_SWAP,
      amountInUsd: 600_000,
      activeLiquidityUsd: 200_000,
      dynamicFeeBps: 85,
      depthUsd: 8_000,
    });

    expect(depleted.ok).toBe(false);
    expect(depleted.status).toBe("FAIL_CLOSED");
    expect(depleted.liquidityOk).toBe(false);
    expect(depleted.reasons).toContain("SOIL_RESISTANCE_TRIP");
    expect(
      depleted.reasons.some(
        (r) =>
          r.startsWith("CAMELOT_V3_LIQUIDITY_DEPLETED") ||
          r.startsWith("CAMELOT_V3_SLIPPAGE_BREACH") ||
          r.startsWith("CAMELOT_V3_DYNAMIC_FEE_BREACH"),
      ),
    ).toBe(true);
  });
});
