/**
 * Native Wayfinder Shield Adapter — Arbitrum AI agent route interception.
 * Pillar 3: checkSoilResistance() soil fuse + verifyAgentIntent() 8-dimension gate.
 * 0-Gas pre-broadcast fail-closed on soil trip or session-key violation.
 */
import { verifyAgentIntent } from "../../sdk/agent-intent";
import {
  __clearCitadelCooldownsForTests,
  withExoMeshShield,
  type CitadelShieldIntent,
} from "../../sdk/decorator";
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";

export interface WayfinderAgentResult {
  success: boolean;
  status: "ALLOW" | "FAIL_CLOSED" | "MANDATORY_COOLDOWN_ACTIVE";
  allowedToSign?: boolean;
  latencyUs?: number;
  reasons?: string[];
}

export interface WayfinderRouteIntent extends SoilResistanceInput {
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

function toSoilInput(payload: WayfinderRouteIntent): SoilResistanceInput {
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
    agentAddress: "0x0000000000000000000000000000000000000001",
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

const shieldedRoute = withExoMeshShield(
  async (_intent: CitadelShieldIntent): Promise<Pick<WayfinderAgentResult, "success" | "status">> => ({
    success: true,
    status: "ALLOW",
  }),
);

async function executeWayfinderShield(payload: WayfinderRouteIntent): Promise<WayfinderAgentResult> {
  const t0 = performance.now();
  const nowMs = payload.nowMs ?? Date.now();
  const soil = toSoilInput(payload);
  const agentId = payload.agentId ?? "wayfinder-agent";
  const chainId = payload.chainId ?? 42161;
  const sessionKey = payload.sessionKey ?? defaultSessionKey(nowMs);

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

  try {
    await shieldedRoute({ ...soil, agentId });
    return {
      success: true,
      status: "ALLOW",
      allowedToSign: true,
      latencyUs: (performance.now() - t0) * 1000,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "ExoMesh ReflexCore (SSRC) trip";
    return {
      success: false,
      status: isCooldownError(message) ? "MANDATORY_COOLDOWN_ACTIVE" : "FAIL_CLOSED",
      allowedToSign: false,
      reasons: parseShieldTripReasons(message),
      latencyUs: (performance.now() - t0) * 1000,
    };
  }
}

export const wayfinderCitadelShieldHook = {
  name: "wayfinder_citadel_shield",
  description:
    "Wayfinder Arbitrum-native AI agent hook — checkSoilResistance() + verifyAgentIntent() before on-chain dispatch.",
  parameters: {
    type: "object" as const,
    properties: {
      symbol: { type: "string" },
      hlSpot: { type: "number" },
      hlPerp: { type: "number" },
      dydxPerp: { type: "number" },
      depthUsd: { type: "number" },
      intent: { type: "string" },
      agentId: { type: "string" },
      chainId: { type: "number" },
    },
    required: ["symbol", "hlSpot", "hlPerp", "dydxPerp", "depthUsd"],
  },
  execute: executeWayfinderShield,
};

export { __clearCitadelCooldownsForTests };
