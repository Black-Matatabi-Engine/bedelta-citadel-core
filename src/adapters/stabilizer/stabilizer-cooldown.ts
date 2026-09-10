import { STABILIZER_COOLDOWN_MS } from "./stabilizer-constants";
import type { StabilizerGuardResult } from "./stabilizer-types";

const stabilizerCooldowns = new Map<string, number>();

export function __clearStabilizerCooldownsForTests(): void {
  stabilizerCooldowns.clear();
}

export function activateStabilizerCooldown(agentId: string, nowMs: number): void {
  stabilizerCooldowns.set(agentId, nowMs + STABILIZER_COOLDOWN_MS);
}

export function checkStabilizerCooldown(agentId: string, nowMs: number): StabilizerGuardResult | null {
  const until = stabilizerCooldowns.get(agentId);
  if (!until || nowMs >= until) {
    if (until) stabilizerCooldowns.delete(agentId);
    return null;
  }
  const remainingSec = Math.max(1, Math.ceil((until - nowMs) / 1000));
  return {
    ok: false,
    status: "MANDATORY_COOLDOWN_ACTIVE",
    reasons: [
      `MANDATORY_COOLDOWN_ACTIVE:agent=${agentId}:remainingSec=${remainingSec}`,
      "STABILIZER_SIGNATURE_CHANNEL_SEVERED",
    ],
    capacityOk: false,
    reserveOk: false,
    reserveRatioOk: false,
    pegOk: false,
    soilOk: false,
    zeroSlippage: false,
    signatureChannelSevered: true,
    latencyUs: 0,
  };
}
