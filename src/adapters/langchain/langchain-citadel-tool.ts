/**
 * LangChain / LangGraph CitadelRiskGuardTool — StructuredTool-compatible pre-broadcast guard.
 * Intercepts raw LLM action calls; fail-closed on parameter hallucination or toxic slippage.
 */
import { verifyAgentIntent } from "../../sdk/agent-intent";
import {
  __clearCitadelCooldownsForTests,
  withCitadelShield,
  type CitadelShieldIntent,
} from "../../sdk/decorator";
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";

export interface CitadelRiskGuardResult {
  success: boolean;
  status: "ALLOW" | "FAIL_CLOSED" | "MANDATORY_COOLDOWN_ACTIVE";
  allowedToSign?: boolean;
  output?: string;
  reasons?: string[];
  latencyUs?: number;
}

export interface CitadelRiskGuardInput extends SoilResistanceInput {
  intent?: string;
  agentId?: string;
  chainId?: number;
  nowMs?: number;
  sessionKey?: {
    agentAddress: string;
    maxOrderClipUsd: number;
    expiresAtMs: number | null;
    approvedAtMs?: number;
  };
}

export const citadelRiskGuardJsonSchema = {
  type: "object" as const,
  properties: {
    symbol: { type: "string", description: "Asset symbol (e.g. ETH)" },
    hlSpot: { type: "number", description: "Hyperliquid spot reference" },
    hlPerp: { type: "number", description: "Hyperliquid perp mark" },
    dydxPerp: { type: "number", description: "dYdX perp mark" },
    depthUsd: { type: "number", description: "Order book depth USD" },
    intent: { type: "string", description: "Agent intent label" },
    agentId: { type: "string", description: "LangChain agent identifier" },
    chainId: { type: "number", description: "Target chain ID" },
  },
  required: ["symbol", "hlSpot", "hlPerp", "dydxPerp", "depthUsd"],
};

function defaultSessionKey(nowMs: number) {
  return {
    agentAddress: "0x0000000000000000000000000000000000000003",
    maxOrderClipUsd: 30,
    expiresAtMs: nowMs + 86_400_000,
    approvedAtMs: nowMs - 1_000,
  };
}

function isCooldownError(message: string): boolean {
  return message.includes("MANDATORY_COOLDOWN_ACTIVE");
}

function parseShieldTripReasons(message: string): string[] {
  const prefix = "[Citadel Shield Trip] Execution blocked pre-broadcast: ";
  if (message.startsWith(prefix)) return message.slice(prefix.length).split("; ").filter(Boolean);
  return [message];
}

function parseToolInput(raw: string | CitadelRiskGuardInput): CitadelRiskGuardInput {
  if (typeof raw !== "string") return { ...raw, at: raw.at ?? new Date() };
  return { ...(JSON.parse(raw) as CitadelRiskGuardInput), at: new Date() };
}

function validateToolParams(input: CitadelRiskGuardInput): string[] {
  const reasons: string[] = [];
  if (!input.symbol?.trim()) reasons.push("PARAMETER_HALLUCINATION: symbol missing");
  for (const key of ["hlSpot", "hlPerp", "dydxPerp", "depthUsd"] as const) {
    const v = input[key];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
      reasons.push(`PARAMETER_HALLUCINATION: ${key} invalid`);
    }
  }
  if (input.depthUsd === 0) reasons.push("PARAMETER_HALLUCINATION: depthUsd zero");
  return reasons;
}

const shieldedInvoke = withCitadelShield(
  async (_intent: CitadelShieldIntent): Promise<string> => "SOIL_PASS: pre-broadcast clearance granted",
);

export async function evaluateCitadelRiskGuard(
  raw: string | CitadelRiskGuardInput,
): Promise<CitadelRiskGuardResult> {
  const t0 = performance.now();
  const input = parseToolInput(raw);
  const hallucination = validateToolParams(input);
  if (hallucination.length > 0) {
    return {
      success: false,
      status: "FAIL_CLOSED",
      allowedToSign: false,
      reasons: hallucination,
      latencyUs: (performance.now() - t0) * 1000,
    };
  }

  const nowMs = input.nowMs ?? Date.now();
  const agentId = input.agentId ?? "langchain-agent";
  const chainId = input.chainId ?? 42161;
  const soil: SoilResistanceInput = {
    symbol: input.symbol,
    hlSpot: input.hlSpot,
    hlPerp: input.hlPerp,
    dydxPerp: input.dydxPerp,
    depthUsd: input.depthUsd,
    at: input.at ?? new Date(),
  };
  const sessionKey = input.sessionKey ?? defaultSessionKey(nowMs);

  const soilProbe = checkSoilResistance(soil);
  if (!soilProbe.ok) {
    return {
      success: false,
      status: "FAIL_CLOSED",
      allowedToSign: false,
      reasons: soilProbe.reasons,
      latencyUs: (performance.now() - t0) * 1000,
    };
  }

  const intentVerdict = verifyAgentIntent({
    preset: "test",
    allowDevBypass: true,
    nowMs,
    intentDigest: `0x${"00".repeat(32)}`,
    soil: { ...soil, isTestnet: chainId === 421614 },
    sessionKey,
    attestation: undefined,
    deadman: { maxSlippageBps: 50 },
    armor: { sandwichRiskBps: 25 },
    gasBurst: { estimatedGasCostUsd: 0.25, sponsored: true, dailySpentUsd: 1.0, chainId },
  });

  if (!intentVerdict.allowedToSign) {
    return {
      success: false,
      status: "FAIL_CLOSED",
      allowedToSign: false,
      reasons: intentVerdict.reasons,
      latencyUs: (performance.now() - t0) * 1000,
    };
  }

  const shieldIntent: CitadelShieldIntent = { ...soil, agentId };
  try {
    const output = String(await shieldedInvoke(shieldIntent));
    return {
      success: true,
      status: "ALLOW",
      allowedToSign: true,
      output,
      latencyUs: (performance.now() - t0) * 1000,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Citadel Shield trip";
    return {
      success: false,
      status: isCooldownError(message) ? "MANDATORY_COOLDOWN_ACTIVE" : "FAIL_CLOSED",
      allowedToSign: false,
      reasons: parseShieldTripReasons(message),
      latencyUs: (performance.now() - t0) * 1000,
    };
  }
}

/** @langchain/core/tools StructuredTool + LangGraph state-node compatible spec. */
export const CitadelRiskGuardTool = {
  name: "citadel_risk_guard",
  description:
    "Pre-consensus intent firewall — runs checkSoilResistance() + verifyAgentIntent() before LLM trade actions.",
  schema: citadelRiskGuardJsonSchema,
  invoke: evaluateCitadelRiskGuard,
  func: (input: string) => evaluateCitadelRiskGuard(input).then((r) => r.output ?? r.reasons?.join("; ") ?? r.status),
  call: evaluateCitadelRiskGuard,
};

export { __clearCitadelCooldownsForTests };
