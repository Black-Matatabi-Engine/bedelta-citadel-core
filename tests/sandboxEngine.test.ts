import { beforeEach, describe, expect, it } from "vitest";
import {
  advanceSandboxTick,
  buildOrderBookFromTick,
  buildSoilFromTick,
  createInitialTick,
  DEADLOCK_COOLDOWN_MS,
  evaluateRootProtectionSuite,
  resolveExecutionMode,
  runSandboxPipeline,
} from "../src/services/sandboxEngine";
import {
  __resetDeadlockRegistryForTests,
  formatEmergencySlTakeoverText,
  isDeadlockActive,
} from "../src/services/rootProtectionService";
import { buildSystemState } from "../src/services/systemState";
import { MAX_SLIPPAGE } from "../src/services/risk-control";

const BASE_ORDER = {
  asset: 0,
  isBuy: true,
  limitPx: "65002",
  sz: "0.01",
  reduceOnly: false,
  orderType: { limit: { tif: "Gtc" as const } },
};

describe("sandboxEngine", () => {
  beforeEach(() => {
    __resetDeadlockRegistryForTests();
  });

  it("resolveExecutionMode — sandbox when isSandboxMode, live when keys present", () => {
    const sandbox = buildSystemState({
      currentCri: 100,
      skipHardlockAssert: true,
      isSandboxMode: true,
    });
    const live = buildSystemState({
      currentCri: 100,
      skipHardlockAssert: true,
      isSandboxMode: false,
    });

    expect(resolveExecutionMode(sandbox)).toBe("SANDBOX");
    expect(resolveExecutionMode(live, { privateKey: "0xabc" })).toBe("LIVE");
    expect(resolveExecutionMode(live, {})).toBe("SANDBOX");
  });

  it("advanceSandboxTick — simulates volatility spike and depth collapse", () => {
    const t0 = createInitialTick();
    const normal = advanceSandboxTick(t0, 1);
    const spike = advanceSandboxTick(t0, 3, { volatilitySpikeAt: 2 });

    expect(normal.volatilityIndex).toBeLessThan(spike.volatilityIndex);
    expect(spike.tickVelocity).toBeGreaterThan(75);
    expect(spike.bidDepthUsd).toBeLessThan(t0.bidDepthUsd);
    expect(buildOrderBookFromTick(spike).spreadBps).toBeGreaterThan(
      buildOrderBookFromTick(normal).spreadBps,
    );
  });

  it("buildSoilFromTick — produces passing soil for healthy book", () => {
    const tick = createInitialTick();
    const soil = buildSoilFromTick(tick);
    expect(soil.depthUsd).toBeGreaterThanOrEqual(100_000);
    expect(soil.symbol).toBe("BTC");
  });

  it("evaluateRootProtectionSuite — 1%+$100 dynamic Max SL at $10k", () => {
    const state = buildSystemState({
      accountBalanceUsd: 10_000,
      currentCri: 100,
      skipHardlockAssert: true,
      isSandboxMode: true,
    });
    const tick = createInitialTick();
    const suite = evaluateRootProtectionSuite({
      state,
      tick,
      unrealizedLossUsd: 250,
    });

    expect(suite.dynamicMaxSL).toBe(200);
    expect(suite.takeover.systemTakeover.reason).toBe("EMERGENCY_SL_PROTECTION");
    expect(suite.takeover.takeoverHUDText).toBe(
      formatEmergencySlTakeoverText(200),
    );
  });

  it("evaluateRootProtectionSuite — 60s deadlock on slippage fuse", () => {
    const state = buildSystemState({
      accountBalanceUsd: 10_000,
      currentCri: 100,
      skipHardlockAssert: true,
      isSandboxMode: true,
    });
    const tick = createInitialTick();
    const t0 = Date.now();

    const tripped = evaluateRootProtectionSuite({
      state,
      tick,
      slippageRatio: MAX_SLIPPAGE + 0.01,
      now: t0,
    });
    expect(tripped.circuitBreaker.tripped).toBe(true);
    expect(isDeadlockActive(t0)).toBe(true);

    const cooled = evaluateRootProtectionSuite({
      state,
      tick,
      slippageRatio: 0.001,
      now: t0 + DEADLOCK_COOLDOWN_MS,
    });
    expect(cooled.circuitBreaker.deadlocked).toBe(false);
    expect(isDeadlockActive(t0 + DEADLOCK_COOLDOWN_MS)).toBe(false);
  });

  it("evaluateRootProtectionSuite — capital leak sensor halts on unaccounted delta", () => {
    const state = buildSystemState({
      accountBalanceUsd: 10_000,
      currentCri: 100,
      skipHardlockAssert: true,
      isSandboxMode: true,
    });
    const tick = createInitialTick();
    const leak = evaluateRootProtectionSuite({
      state,
      tick,
      expectedBalanceUsd: 10_000,
      observedBalanceUsd: 9999.98,
    });

    expect(leak.capitalLeak.leaked).toBe(true);
    expect(leak.capitalLeak.forceSystemPaused).toBe(true);
    expect(leak.capitalLeak.haltText).toContain("UNEXPLAINED LEAK");
  });

  it("runSandboxPipeline — E2E zero-key dry-run with mock fill", async () => {
    const result = await runSandboxPipeline({
      state: {
        accountBalanceUsd: 10_000,
        currentCri: 100,
        isSandboxMode: true,
      },
      payload: BASE_ORDER,
      amountUsd: 50,
    });

    expect(result.mode).toBe("SANDBOX");
    expect(result.state.isSandboxMode).toBe(true);
    expect(result.state.dynamicMaxSL).toBe(200);
    expect(result.fill).not.toBeNull();
    expect(result.fill!.success).toBe(true);
    expect(result.fill!.dryRun).toBe(true);
    expect(result.fill!.fillId).toMatch(/^hl-dry-fill-/);
    expect(result.sandboxReport.isAllowed).toBe(true);
    expect(result.sandboxReport.zeroKeyDryRun).toBe(true);
    expect(result.executionPath).toContain("mode:sandbox");
    expect(result.executionPath).toContain("fill:mock:success");
    expect(result.executionPath.at(-1)).toBe("sandbox:complete");
    expect(result.protection.capitalLeak.leaked).toBe(false);
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
  });

  it("runSandboxPipeline — blocks fill on capital leak", async () => {
    const result = await runSandboxPipeline({
      state: {
        accountBalanceUsd: 10_000,
        currentCri: 100,
        isSandboxMode: true,
      },
      expectedBalanceUsd: 10_000,
      observedBalanceUsd: 9999.98,
    });

    expect(result.fill).toBeNull();
    expect(result.executionPath).toContain("protection:capital-leak:trip");
    expect(result.executionPath).toContain("fill:blocked");
    expect(result.protection.capitalLeak.leaked).toBe(true);
  });
});
