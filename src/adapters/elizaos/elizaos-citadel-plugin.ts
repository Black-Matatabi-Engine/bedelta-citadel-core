/**
 * ElizaOS Citadel Plugin — pre-broadcast soil guard for Action handlers.
 */
import { verifyAgentIntent } from "../../sdk/agent-intent";
import {
  __clearCitadelCooldownsForTests,
  withExoMeshShield,
  type CitadelShieldIntent,
} from "../../sdk/decorator";
import { checkSoilResistance, type SoilResistanceInput } from "../../services/risk-control";

export interface ElizaCitadelResult {
  success: boolean;
  status: "ALLOW" | "FAIL_CLOSED" | "MANDATORY_COOLDOWN_ACTIVE";
  allowedToSign?: boolean;
  text: string;
  reasons?: string[];
  latencyUs?: number;
}

export interface ElizaRuntimeRef {
  agentId: string;
}

export interface ElizaCitadelOptions {
  soil: SoilResistanceInput;
  intent?: string;
  chainId?: number;
  nowMs?: number;
  sessionKey?: {
    agentAddress: string;
    maxOrderClipUsd: number;
    expiresAtMs: number | null;
    approvedAtMs?: number;
  };
}

function defaultSessionKey(nowMs: number) {
  return {
    agentAddress: "0x0000000000000000000000000000000000000004",
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

const shieldedAction = withExoMeshShield(async (): Promise<boolean> => true);

export async function evaluateElizaCitadelAction(
  runtime: ElizaRuntimeRef,
  options: ElizaCitadelOptions,
): Promise<ElizaCitadelResult> {
  const t0 = performance.now();
  const nowMs = options.nowMs ?? Date.now();
  const soil = { ...options.soil, at: options.soil.at ?? new Date() };
  const chainId = options.chainId ?? 42161;
  const sessionKey = options.sessionKey ?? defaultSessionKey(nowMs);

  const soilProbe = checkSoilResistance(soil);
  if (!soilProbe.ok) {
    return {
      success: false,
      status: "FAIL_CLOSED",
      allowedToSign: false,
      text: soilProbe.reasons.join("; "),
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
      text: intentVerdict.reasons.join("; "),
      reasons: intentVerdict.reasons,
      latencyUs: (performance.now() - t0) * 1000,
    };
  }

  const shieldIntent: CitadelShieldIntent = { ...soil, agentId: runtime.agentId };
  try {
    await shieldedAction(shieldIntent);
    return {
      success: true,
      status: "ALLOW",
      allowedToSign: true,
      text: "SOIL_PASS: pre-broadcast clearance granted",
      latencyUs: (performance.now() - t0) * 1000,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "ExoMesh ReflexCore (SSRC) trip";
    return {
      success: false,
      status: isCooldownError(message) ? "MANDATORY_COOLDOWN_ACTIVE" : "FAIL_CLOSED",
      allowedToSign: false,
      text: message,
      reasons: parseShieldTripReasons(message),
      latencyUs: (performance.now() - t0) * 1000,
    };
  }
}

export const elizaCitadelPlugin = {
  name: "slivervine-citadel-shield",
  description: "ElizaOS plugin — evaluateElizaCitadelAction() pre-broadcast soil guard.",
  actions: [
    {
      name: "CITADEL_SOIL_GUARD",
      description: "Pre-consensus intent firewall before trade intent broadcast.",
      handler: evaluateElizaCitadelAction,
    },
  ],
};

export { __clearCitadelCooldownsForTests };
