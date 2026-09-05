import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { ensureSoilWasm } from "../../src/sdk";
import {
  __clearCitadelCooldownsForTests,
  evaluateVirtualsGameTask,
} from "../../src/adapters/virtuals/virtuals-game-adapter";
import { HEALTHY_SOIL, TOXIC_SOIL } from "../../examples/adapters/citadel-ansi-hud";
import { SAFE_TRADING_TIME } from "../helpers/system-time";

const NOW_MS = SAFE_TRADING_TIME.getTime();
const VALID_SESSION = {
  agentAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
  maxOrderClipUsd: 30,
  expiresAtMs: NOW_MS + 86_400_000,
  approvedAtMs: NOW_MS - 1_000,
};

beforeAll(() => {
  expect(ensureSoilWasm()).toBe(true);
});

afterEach(() => {
  __clearCitadelCooldownsForTests();
});

describe("evaluateVirtualsGameTask", () => {
  it("normal Virtuals GAME worker task → ALLOW, allowedToSign: true", async () => {
    const result = await evaluateVirtualsGameTask({
      ...HEALTHY_SOIL,
      at: SAFE_TRADING_TIME,
      agentId: "virtuals-game-worker",
      chainId: 42161,
      intent: "DELTA_NEUTRAL_GM_DEPOSIT",
      taskId: "game-task-001",
      nowMs: NOW_MS,
      sessionKey: VALID_SESSION,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("ALLOW");
    expect(result.allowedToSign).toBe(true);
    expect(result.latencyUs).toBeGreaterThan(0);
  });

  it("toxic soil trip → FAIL_CLOSED, 0-Gas, reasons populated", async () => {
    const result = await evaluateVirtualsGameTask({
      ...TOXIC_SOIL,
      at: SAFE_TRADING_TIME,
      agentId: "virtuals-toxic",
      chainId: 42161,
      intent: "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN",
      nowMs: NOW_MS,
      sessionKey: VALID_SESSION,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("FAIL_CLOSED");
    expect(result.allowedToSign).toBe(false);
    expect(result.reasons?.length).toBeGreaterThan(0);
  });

  it("session key clip breach → FAIL_CLOSED", async () => {
    const result = await evaluateVirtualsGameTask({
      ...HEALTHY_SOIL,
      at: SAFE_TRADING_TIME,
      agentId: "virtuals-clip-breach",
      chainId: 42161,
      nowMs: NOW_MS,
      sessionKey: { ...VALID_SESSION, maxOrderClipUsd: 99 },
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("FAIL_CLOSED");
    expect(result.reasons?.some((r) => r.startsWith("CLIP_BREACH"))).toBe(true);
  });
});
