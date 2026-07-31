import { describe, expect, it } from "vitest";
import {
  R15_ORACLE_DEVIATION_MAX_BPS,
  R20_HARDLOCK,
  SOLANA_SLOT_LATENCY_MAX_MS,
  SolanaDexBlockedError,
  SolanaR20HardlockError,
  TOUCHWOOD_JUPITER_ORACLE_MAX_BPS,
  adjustPriorityFee,
  aggregateSolanaDepth1x3,
  assertSolanaDexGates,
  checkR15OracleDeviation,
  checkRaydiumTickCollapse,
  checkSlotLatency,
  evaluateSolanaDepthMatrix,
  evaluateSolanaSoilResistance,
  evaluateTouchwoodPipes,
  executeSolanaDexIntent,
  resolvePhoenixMidPx,
  type SolanaDexPipeInput,
} from "../../src/adapters/solana-adapter";

const JUPITER_QUOTE = {
  inputMint: "So11111111111111111111111111111111111111112",
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  inAmount: "100000000",
  outAmount: "16198753",
  slippageBps: 10,
  priceImpactPct: "0.05",
};

const PHOENIX_SNAPSHOT = {
  symbol: "SOL",
  marketAddress: "PhoenixStub",
  slot: 1,
  bids: [{ price: 149.9, size: 500 }],
  asks: [{ price: 150.1, size: 500 }],
};

const RAYDIUM_SNAPSHOT = {
  symbol: "SOL",
  poolAddress: "RaydiumStub",
  slot: 2,
  tickCurrent: 150,
  tickLiquidityUsd: 200_000,
  depthUsd: 300_000,
};

function healthyMatrix(overrides: Partial<SolanaDexPipeInput> = {}): SolanaDexPipeInput {
  return {
    symbol: "SOL",
    spotPx: 150,
    priorityFeeLamports: 5_000,
    phoenix: {
      snapshot: PHOENIX_SNAPSHOT,
      slotLatencyMs: 80,
      depthUsd: 400_000,
    },
    raydium: {
      snapshot: RAYDIUM_SNAPSHOT,
      depthUsd: 300_000,
    },
    jupiter: {
      quote: JUPITER_QUOTE,
      pythOraclePx: 150.02,
      spotPx: 150,
      routingDepthUsd: 500_000,
    },
    ...overrides,
  };
}

const HEALTHY_PROBE = {
  symbol: "SOL",
  venue: "JUPITER_AGGREGATOR" as const,
  slotLatencyMs: 120,
  priorityFeeLamports: 5_000,
  pythOraclePx: 150.01,
  spotPx: 150,
  depthUsd: 500_000,
};

describe("solana-adapter — legacy probes", () => {
  it("checkSlotLatency passes under 200ms threshold", () => {
    expect(checkSlotLatency(120).pass).toBe(true);
    expect(checkSlotLatency(SOLANA_SLOT_LATENCY_MAX_MS - 1).pass).toBe(true);
  });

  it("checkSlotLatency trips at or above 200ms", () => {
    const trip = checkSlotLatency(SOLANA_SLOT_LATENCY_MAX_MS);
    expect(trip.pass).toBe(false);
    expect(trip.reason).toContain("SLOT_LATENCY=");
  });

  it("adjustPriorityFee scales with slot lag", () => {
    const low = adjustPriorityFee(10_000, 40);
    const high = adjustPriorityFee(10_000, 180);
    expect(high).toBeGreaterThan(low);
  });

  it("checkR15OracleDeviation trips on Pyth vs spot delta", () => {
    expect(checkR15OracleDeviation(100, 100).pass).toBe(true);
    const trip = checkR15OracleDeviation(100.8, 100);
    expect(trip.pass).toBe(false);
    expect(trip.reason).toContain("R15_ORACLE_DEVIATION");
    expect(trip.deviationBps).toBeGreaterThan(R15_ORACLE_DEVIATION_MAX_BPS);
  });

  it("evaluateSolanaSoilResistance integrates checkSoilResistance on healthy probe", () => {
    const eval_ = evaluateSolanaSoilResistance(HEALTHY_PROBE);
    expect(eval_.ok).toBe(true);
    expect(eval_.soil.ok).toBe(true);
  });

  it("resolvePhoenixMidPx derives mid from CLOB book", () => {
    expect(resolvePhoenixMidPx(PHOENIX_SNAPSHOT)).toBe(150);
  });
});

describe("solana-adapter — 1:3 depth matrix & Touchwood", () => {
  it("aggregateSolanaDepth1x3 sums active pipe depths", () => {
    const agg = aggregateSolanaDepth1x3(healthyMatrix());
    expect(agg.activePipes).toHaveLength(3);
    expect(agg.totalDepthUsd).toBeGreaterThan(0);
    expect(agg.compositeDepthUsd).toBeGreaterThan(0);
    expect(agg.r20Hardlock).toBe(false);
  });

  it("Touchwood severs Phoenix on slot latency > 200ms", () => {
    const pipes = evaluateTouchwoodPipes(
      healthyMatrix({ phoenix: { snapshot: PHOENIX_SNAPSHOT, slotLatencyMs: 250, depthUsd: 400_000 } }),
    );
    const phoenix = pipes.find((p) => p.dex === "PHOENIX_CLOB");
    expect(phoenix?.severed).toBe(true);
    expect(phoenix?.active).toBe(false);

    const agg = aggregateSolanaDepth1x3(
      healthyMatrix({ phoenix: { snapshot: PHOENIX_SNAPSHOT, slotLatencyMs: 250, depthUsd: 400_000 } }),
    );
    expect(agg.severedPipes).toContain("PHOENIX_CLOB");
    expect(agg.activePipes).toContain("RAYDIUM_CLMM");
    expect(agg.activePipes).toContain("JUPITER_AGGREGATOR");
  });

  it("Touchwood severs Raydium on CLMM tick collapse", () => {
    const collapsed = {
      ...RAYDIUM_SNAPSHOT,
      tickLiquidityUsd: 10_000,
      depthUsd: 10_000,
    };
    expect(checkRaydiumTickCollapse(collapsed).pass).toBe(false);

    const agg = aggregateSolanaDepth1x3(
      healthyMatrix({ raydium: { snapshot: collapsed, depthUsd: 10_000 } }),
    );
    expect(agg.severedPipes).toContain("RAYDIUM_CLMM");
    expect(agg.activePipes).not.toContain("RAYDIUM_CLMM");
  });

  it("Touchwood severs Jupiter on Pyth oracle delta > 0.3%", () => {
    const agg = aggregateSolanaDepth1x3(
      healthyMatrix({
        jupiter: {
          quote: JUPITER_QUOTE,
          pythOraclePx: 150.6,
          spotPx: 150,
          routingDepthUsd: 500_000,
        },
      }),
    );
    expect(agg.severedPipes).toContain("JUPITER_AGGREGATOR");
    const deviationBps = (0.6 / 150) * 10_000;
    expect(deviationBps).toBeGreaterThan(TOUCHWOOD_JUPITER_ORACLE_MAX_BPS);
  });

  it("all 3 DEX pipes severed triggers R20_HARDLOCK", () => {
    const agg = aggregateSolanaDepth1x3(
      healthyMatrix({
        phoenix: { snapshot: PHOENIX_SNAPSHOT, slotLatencyMs: 300, depthUsd: 400_000 },
        raydium: {
          snapshot: { ...RAYDIUM_SNAPSHOT, tickLiquidityUsd: 1_000, depthUsd: 1_000 },
          depthUsd: 1_000,
        },
        jupiter: {
          quote: JUPITER_QUOTE,
          pythOraclePx: 152,
          spotPx: 150,
          routingDepthUsd: 500_000,
        },
      }),
    );
    expect(agg.r20Hardlock).toBe(true);
    expect(agg.r20Reason).toContain(R20_HARDLOCK);
    expect(agg.activePipes).toHaveLength(0);
  });

  it("evaluateSolanaDepthMatrix passes with 2-of-3 degraded pipes", () => {
    const eval_ = evaluateSolanaDepthMatrix(
      healthyMatrix({ phoenix: { snapshot: PHOENIX_SNAPSHOT, slotLatencyMs: 250, depthUsd: 400_000 } }),
    );
    expect(eval_.r20Hardlock).toBe(false);
    expect(eval_.aggregatedDepth?.activePipes).toHaveLength(2);
    expect(eval_.ok).toBe(true);
  });

  it("assertSolanaDexGates throws SolanaR20HardlockError when all pipes fail", () => {
    expect(() =>
      assertSolanaDexGates(HEALTHY_PROBE, {
        symbol: "SOL",
        spotPx: 150,
        phoenix: { snapshot: PHOENIX_SNAPSHOT, slotLatencyMs: 400 },
        raydium: {
          snapshot: { ...RAYDIUM_SNAPSHOT, tickLiquidityUsd: 100, depthUsd: 100 },
        },
        jupiter: {
          quote: JUPITER_QUOTE,
          pythOraclePx: 155,
          spotPx: 150,
        },
      }),
    ).toThrow(SolanaR20HardlockError);
  });

  it("executeSolanaDexIntent routes via active pipes on matrix pass", () => {
    const result = executeSolanaDexIntent(
      {
        venue: "JUPITER_AGGREGATOR",
        symbol: "SOL",
        amountUsd: 50,
        soil: HEALTHY_PROBE,
        matrix: healthyMatrix(),
      },
      { dryRun: true },
    );
    expect(result.allowed).toBe(true);
    expect(result.activePipes).toHaveLength(3);
  });

  it("assertSolanaDexGates throws SolanaDexBlockedError on legacy probe trip", () => {
    expect(() =>
      assertSolanaDexGates({ ...HEALTHY_PROBE, slotLatencyMs: 400 }),
    ).toThrow(SolanaDexBlockedError);
  });
});
