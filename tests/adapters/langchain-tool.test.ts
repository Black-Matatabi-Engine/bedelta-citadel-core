import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { ensureSoilWasm } from "../../src/sdk";
import {
  __clearCitadelCooldownsForTests,
  CitadelRiskGuardTool,
  evaluateCitadelRiskGuard,
} from "../../src/adapters/langchain/langchain-citadel-tool";
import { HEALTHY_SOIL, TOXIC_SOIL } from "../../examples/adapters/citadel-ansi-hud";
import { SAFE_TRADING_TIME } from "../helpers/system-time";

const NOW_MS = SAFE_TRADING_TIME.getTime();
const VALID_SESSION = {
  agentAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
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

describe("CitadelRiskGuardTool", () => {
  it("normal LangChain tool invoke → ALLOW, allowedToSign: true", async () => {
    const result = await evaluateCitadelRiskGuard({
      ...HEALTHY_SOIL,
      at: SAFE_TRADING_TIME,
      agentId: "langchain-agent",
      chainId: 42161,
      intent: "DELTA_NEUTRAL_GM_DEPOSIT",
      nowMs: NOW_MS,
      sessionKey: VALID_SESSION,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("ALLOW");
    expect(result.allowedToSign).toBe(true);
    expect(result.output).toContain("SOIL_PASS");
  });

  it("toxic slippage soil trip → FAIL_CLOSED", async () => {
    const result = await CitadelRiskGuardTool.invoke({
      ...TOXIC_SOIL,
      at: SAFE_TRADING_TIME,
      agentId: "langchain-toxic",
      chainId: 42161,
      intent: "PROMPT_INJECTION_HIGH_SLIPPAGE_OPEN",
      nowMs: NOW_MS,
      sessionKey: VALID_SESSION,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("FAIL_CLOSED");
    expect(result.reasons?.some((r) => r.includes("CROSS_VENUE_SLIPPAGE") || r.includes("DEPTH"))).toBe(true);
  });

  it("parameter hallucination → FAIL_CLOSED", async () => {
    const result = await evaluateCitadelRiskGuard(
      JSON.stringify({
        symbol: "",
        hlSpot: NaN,
        hlPerp: 3500,
        dydxPerp: 3500,
        depthUsd: -1,
        agentId: "langchain-hallucination",
      }),
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe("FAIL_CLOSED");
    expect(result.reasons?.some((r) => r.startsWith("PARAMETER_HALLUCINATION"))).toBe(true);
  });
});
