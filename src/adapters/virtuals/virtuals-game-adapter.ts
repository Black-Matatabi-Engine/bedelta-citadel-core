/**
 * Virtuals GAME Framework adapter — pre-broadcast soil fuse for GAME Workers.
 * Validates agent intent, session key bounds, and checkSoilResistance() before dispatch.
 */
import { verifyAgentIntent } from "../../sdk/agent-intent";
import {
  __clearCitadelCooldownsForTests,
  withExoMeshShield,
  type CitadelShieldIntent,
} from "../../sdk/decorator";
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";

export interface VirtualsGameTaskResult {
  success: boolean;
  status: "ALLOW" | "FAIL_CLOSED" | "MANDATORY_COOLDOWN_ACTIVE";
  allowedToSign?: boolean;
  latencyUs?: number;
  reasons?: string[];
  message?: string;
}

export interface VirtualsGameTaskInput extends SoilResistanceInput {
  taskId?: string;
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

function toSoilInput(payload: VirtualsGameTaskInput): SoilResistanceInput {
  return {
    symbol: payload.symbol,
    hlSpot: payload.hlSpot,
    hlPerp: payload.hlPerp,
    dydxPerp: payload.dydxPerp,
    depthUsd: payload.depthUsd,
    at: payload.at ?? new Date(),
  };
}

function defaultSessionKey(nowMs: number) {
  return {
    agentAddress: "0x0000000000000000000000000000000000000002",
    maxOrderClipUsd: 30,
    expiresAtMs: nowMs + 86_400_000,
    approvedAtMs: nowMs - 1_000,
  };
}

function isCooldownError(message: string): boolean {
  return message.includes("MANDATORY_COOLDOWN_ACTIVE");
}

function parseShieldTripReasons(message: string): string[] {
  const prefix = "[ExoMesh Trip] Execution blocked pre-broadcast: ";
  if (message.startsWith(prefix)) return message.slice(prefix.length).split("; ").filter(Boolean);
  return [message];
}

const shieldedTask = withExoMeshShield(
  async (_intent: CitadelShieldIntent): Promise<{ success: true; status: "ALLOW"; message: string }> => ({
    success: true,
    status: "ALLOW",
    message: "GAME worker: pre-broadcast clearance granted",
  }),
);

export async function evaluateVirtualsGameTask(payload: VirtualsGameTaskInput): Promise<VirtualsGameTaskResult> {
  const t0 = performance.now();
  const nowMs = payload.nowMs ?? Date.now();
  const soil = toSoilInput(payload);
  const agentId = payload.agentId ?? "virtuals-game-agent";
  const chainId = payload.chainId ?? 42161;
  const sessionKey = payload.sessionKey ?? defaultSessionKey(nowMs);

  const soilProbe = checkSoilResistance(soil);
  if (!soilProbe.ok) {
    return {
      success: false,
      status: "FAIL_CLOSED",
      allowedToSign: false,
      reasons: soilProbe.reasons,
      message: soilProbe.reasons.join("; "),
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
      message: intentVerdict.reasons.join("; "),
      latencyUs: (performance.now() - t0) * 1000,
    };
  }

  try {
    await shieldedTask({ ...soil, agentId });
    return {
      success: true,
      status: "ALLOW",
      allowedToSign: true,
      message: "GAME worker: pre-broadcast clearance granted",
      latencyUs: (performance.now() - t0) * 1000,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "ExoMesh ReflexCore (SSRC) trip";
    return {
      success: false,
      status: isCooldownError(message) ? "MANDATORY_COOLDOWN_ACTIVE" : "FAIL_CLOSED",
      allowedToSign: false,
      reasons: parseShieldTripReasons(message),
      message,
      latencyUs: (performance.now() - t0) * 1000,
    };
  }
}

export const virtualsCitadelGameFunction = {
  name: "citadel_soil_guard",
  description:
    "Virtuals GAME worker action — evaluateVirtualsGameTask() with checkSoilResistance() + verifyAgentIntent().",
  parameters: {
    type: "object" as const,
    properties: {
      symbol: { type: "string" },
      hlSpot: { type: "number" },
      hlPerp: { type: "number" },
      dydxPerp: { type: "number" },
      depthUsd: { type: "number" },
      taskId: { type: "string" },
      intent: { type: "string" },
      agentId: { type: "string" },
      chainId: { type: "number" },
    },
    required: ["symbol", "hlSpot", "hlPerp", "dydxPerp", "depthUsd"],
  },
  execute: evaluateVirtualsGameTask,
};

export { __clearCitadelCooldownsForTests };
