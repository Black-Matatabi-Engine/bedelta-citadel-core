import { afterEach, describe, expect, it, vi } from "vitest";
import {
  __clearL2BookCacheForTests,
  __seedL2BookCacheForTests,
} from "../../src/services/hyperliquid-adapter";
import {
  evaluateSantenmokuHub,
  readCounterAttackTelemetryStatus,
} from "../../src/services/santenmoku-three-eye";
import {
  __setSystemStateForTests,
  buildSystemState,
} from "../../src/core/state";

const PANIC_BOOK = {
  coin: "BTC",
  book: {
    coin: "BTC",
    levels: [
      [{ px: "100", sz: "1000" }],
      [{ px: "100.02", sz: "8000" }],
    ],
  },
  fetchedAt: new Date().toISOString(),
  live: true,
  source: "testnet" as const,
};

afterEach(() => {
  __clearL2BookCacheForTests();
  __setSystemStateForTests(null);
  vi.restoreAllMocks();
});

describe("santenmoku hub counter-attack integration", () => {
  it("readCounterAttackTelemetryStatus returns ARMED_AND_READY on panic + soil", () => {
    __setSystemStateForTests({
      ...buildSystemState({ currentCri: 100, skipHardlockAssert: true }),
      isHedgeActive: false,
    });
    __seedL2BookCacheForTests(PANIC_BOOK);

    expect(readCounterAttackTelemetryStatus(readActiveState())).toBe(
      "ARMED_AND_READY",
    );
  });

  it("evaluateSantenmokuHub routes passive maker order through session-key adapter", async () => {
    const state = {
      ...buildSystemState({
        accountBalanceUsd: 10_000,
        currentCri: 100,
        skipHardlockAssert: true,
      }),
      isHedgeActive: false,
    };
    __setSystemStateForTests(state);

    const fetchFn = vi.fn(async () =>
      Response.json(PANIC_BOOK.book),
    ) as unknown as typeof fetch;

    const hub = await evaluateSantenmokuHub(state, {
      fetchFn,
      dryRun: true,
      orderNotionalUsd: 150,
    });

    expect(hub.counterAttackStatus).toBe("ARMED_AND_READY");
    expect(hub.counterAttack?.armed).toBe(true);
    expect(hub.execution).toEqual({
      success: true,
      signatureHash: null,
      errorReason: null,
    });
    expect(fetchFn).toHaveBeenCalled();
  });

  it("returns LOCKED when R20 tripped", async () => {
    const state = {
      ...buildBlockedState(),
      isHedgeActive: false,
    };
    __setSystemStateForTests(state);

    const hub = await evaluateSantenmokuHub(state, { execute: false });

    expect(hub.counterAttackStatus).toBe("LOCKED");
    expect(hub.execution).toBeNull();
  });
});

function readActiveState() {
  return {
    ...buildSystemState({ currentCri: 100, skipHardlockAssert: true }),
    isHedgeActive: false,
  };
}

function buildBlockedState() {
  return buildSystemState({ currentCri: 0, skipHardlockAssert: true });
}
