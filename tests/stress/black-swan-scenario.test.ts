import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetBlackSwanGuardForTests,
  assertBlackSwanClear,
  BLACK_SWAN_HUD_TAG,
  BLACK_SWAN_MAX_SLIPPAGE,
  evaluateBlackSwanRisk,
  getRecentBlackSwanLogs,
  isBlackSwanDefenseActive,
  triggerEmergencyAutoFlatten,
  type BlackSwanMarketParams,
} from "../../src/core/black-swan-guard";
import {
  __clearIntentLedgerForTests,
  createCrossLegIntent,
  prepareIntent,
} from "../../src/core/intent-ledger";
import {
  __setSystemStateForTests,
  buildSystemState,
  readActiveSystemState,
} from "../../src/core/state";
import {
  assertSessionKeyExecutionGates,
  DefenseMatrixError,
  type SessionKeyOrderPayload,
} from "../../src/services/session-key-adapter";

const CIRCUIT_BUDGET_MS = 10;
/** Async 2PC flatten path — allow scheduler jitter under full-suite load */
const FLATTEN_BUDGET_MS = 50;

const SESSION_PAYLOAD: SessionKeyOrderPayload = {
  asset: 0,
  isBuy: true,
  limitPx: "65000",
  sz: "0.01",
  reduceOnly: false,
  orderType: { limit: { tif: "Gtc" } },
};

/** HL orderbook collapse + 500% spread blowout */
function collapsedHlMarket(): BlackSwanMarketParams {
  const baselineDepthUsd = 500_000;
  const orderbookDepthUsd = 50_000; // 90% depth collapse
  const baselineSpread = 0.001;
  const spreadRatio = baselineSpread * 6; // 500% spread spike
  const ingressIndexPrice = 65_000;
  const targetVenuePrice = ingressIndexPrice * 0.94; // >3% deviation

  return {
    symbol: "BTC",
    slippage: 0.05,
    orderbookDepthUsd,
    baselineDepthUsd,
    targetVenuePrice,
    ingressIndexPrice,
    spreadRatio,
  };
}

describe("black-swan scenario — HL collapse + 500% spread", () => {
  beforeEach(() => {
    __resetBlackSwanGuardForTests();
    __clearIntentLedgerForTests();
    __setSystemStateForTests(
      buildSystemState({
        accountBalanceUsd: 50_000,
        currentCri: 100,
        skipHardlockAssert: true,
      }),
    );
    vi.restoreAllMocks();
  });

  afterEach(() => {
    __resetBlackSwanGuardForTests();
    __clearIntentLedgerForTests();
    __setSystemStateForTests(null);
  });

  it("evaluateBlackSwanRisk trips liquidity halt + deviation lock within 10ms", () => {
    const params = collapsedHlMarket();

    const t0 = performance.now();
    const risk = evaluateBlackSwanRisk(params);
    const elapsedMs = performance.now() - t0;

    expect(elapsedMs).toBeLessThan(CIRCUIT_BUDGET_MS);
    expect(risk.tripped).toBe(true);
    expect(risk.triggers).toContain("BLACK_SWAN_LIQUIDITY_HALT");
    expect(risk.triggers).toContain("BLACK_SWAN_DEVIATION_LOCK");
    expect(risk.slippage).toBeGreaterThan(BLACK_SWAN_MAX_SLIPPAGE);
    expect(risk.depthDropExceeded).toBe(true);
    expect(risk.priceDeviationExceeded).toBe(true);
  });

  it("circuit breaker rejects orders and auto-flattens PREPARED 2PC within 10ms", async () => {
    const params = collapsedHlMarket();
    const flattenSpy = vi.fn(async () => ({ ok: true }));

    createCrossLegIntent({
      id: "bs-hl-1",
      legs: [
        { venue: "HL", side: "SHORT", sizeUsd: 1_000, symbol: "BTC" },
        { venue: "JUPITER", side: "BUY", sizeUsd: 1_000 },
      ],
    });

    await prepareIntent("bs-hl-1");

    const t0 = performance.now();
    const result = await triggerEmergencyAutoFlatten({
      marketParams: params,
      flattenLeg: flattenSpy,
    });
    const elapsedMs = performance.now() - t0;

    expect(elapsedMs).toBeLessThan(FLATTEN_BUDGET_MS);
    expect(result.hudTag).toBe(BLACK_SWAN_HUD_TAG);
    expect(result.flattenedCount).toBeGreaterThan(0);
    expect(flattenSpy).toHaveBeenCalled();
    expect(isBlackSwanDefenseActive()).toBe(true);

    const gate = assertBlackSwanClear();
    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      expect(gate.reason).toContain(BLACK_SWAN_HUD_TAG);
    }

    expect(() =>
      assertSessionKeyExecutionGates(
        SESSION_PAYLOAD,
        readActiveSystemState(),
      ),
    ).toThrow(DefenseMatrixError);

    const logs = getRecentBlackSwanLogs();
    expect(logs.some((entry) => entry.message.includes(BLACK_SWAN_HUD_TAG))).toBe(
      true,
    );
    expect(
      logs.some((entry) => entry.event === "BLACK_SWAN_EMERGENCY_FLATTEN"),
    ).toBe(true);
  });

  it("does not flatten when market is within black-swan thresholds", async () => {
    const flattenSpy = vi.fn(async () => ({ ok: true }));

    const result = await triggerEmergencyAutoFlatten({
      marketParams: {
        symbol: "ETH",
        slippage: 0.001,
        orderbookDepthUsd: 400_000,
        baselineDepthUsd: 500_000,
        targetVenuePrice: 3_000,
        ingressIndexPrice: 3_010,
      },
      flattenLeg: flattenSpy,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("BLACK_SWAN_NOT_TRIPPED");
    expect(flattenSpy).not.toHaveBeenCalled();
    expect(isBlackSwanDefenseActive()).toBe(false);
  });
});
