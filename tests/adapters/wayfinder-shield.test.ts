import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { ensureSoilWasm } from "../../src/sdk";
import {
  __clearCitadelCooldownsForTests,
  wayfinderCitadelShieldHook,
} from "../../src/adapters/wayfinder/wayfinder-shield";
import { HEALTHY_SOIL, TOXIC_SOIL } from "../../examples/adapters/citadel-ansi-hud";
import { SAFE_TRADING_TIME } from "../helpers/system-time";

const NOW_MS = SAFE_TRADING_TIME.getTime();
const VALID_SESSION = {
  agentAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
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

describe("wayfinderCitadelShieldHook", () => {
  it("normal Arbitrum Wayfinder route intent → ALLOW, allowedToSign: true", async () => {
    const result = await wayfinderCitadelShieldHook.execute({
      ...HEALTHY_SOIL,
      at: SAFE_TRADING_TIME,
      agentId: "wayfinder-arb-route",
      chainId: 42161,
      intent: "DELTA_NEUTRAL_GM_DEPOSIT",
      nowMs: NOW_MS,
      sessionKey: VALID_SESSION,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("ALLOW");
    expect(result.allowedToSign).toBe(true);
    expect(result.latencyUs).toBeGreaterThan(0);
  });

  it("high-slippage toxic soil trip → FAIL_CLOSED, 0-Gas, reasons populated", async () => {
    const result = await wayfinderCitadelShieldHook.execute({
      ...TOXIC_SOIL,
      at: SAFE_TRADING_TIME,
      agentId: "wayfinder-toxic",
      chainId: 42161,
      intent: "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN",
      nowMs: NOW_MS,
      sessionKey: VALID_SESSION,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("FAIL_CLOSED");
    expect(result.allowedToSign).toBe(false);
    expect(result.reasons?.length).toBeGreaterThan(0);
    expect(result.reasons?.some((r) => r.includes("CROSS_VENUE_SLIPPAGE") || r.includes("DEPTH"))).toBe(true);
  });

  it("session key clip breach → FAIL_CLOSED", async () => {
    const clip = await wayfinderCitadelShieldHook.execute({
      ...HEALTHY_SOIL,
      at: SAFE_TRADING_TIME,
      agentId: "wayfinder-clip-breach",
      chainId: 42161,
      nowMs: NOW_MS,
      sessionKey: { ...VALID_SESSION, maxOrderClipUsd: 99 },
    });
    expect(clip.success).toBe(false);
    expect(clip.status).toBe("FAIL_CLOSED");
    expect(clip.allowedToSign).toBe(false);
    expect(clip.reasons?.some((r) => r.startsWith("CLIP_BREACH"))).toBe(true);

    const expired = await wayfinderCitadelShieldHook.execute({
      ...HEALTHY_SOIL,
      at: SAFE_TRADING_TIME,
      agentId: "wayfinder-expired",
      chainId: 42161,
      nowMs: NOW_MS,
      sessionKey: { ...VALID_SESSION, expiresAtMs: NOW_MS - 1 },
    });
    expect(expired.success).toBe(false);
    expect(expired.status).toBe("FAIL_CLOSED");
    expect(expired.allowedToSign).toBe(false);
    expect(expired.reasons?.some((r) => r.startsWith("EXPIRY_LAPSED"))).toBe(true);
  });
});
