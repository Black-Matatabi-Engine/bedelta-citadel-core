/** Shared runner for ElizaOS · Virtuals · LangChain independent agent framework demos. */
import {
  hudBackoff,
  hudBlocked,
  hudChannelOpen,
  hudDispatched,
  hudIntent,
  hudSevered,
  hudSoilFuse,
  printBackoffDivider,
  printBackoffResult,
  printBanner,
  printMode,
  printResult,
  R,
  RED,
} from "../adapters/citadel-ansi-hud";
import { measureAsync, resolveLatency } from "./demo-timing";
import { withDemoSoil, wrapDemoExecution, type DemoEnvironment } from "./demo-harness";
import {
  agentDemoTrip,
  buildAgentIntent,
  parseDemoVenueArgv,
  printAgentVenueHud,
  resolveAgentVenue,
  type AgentVenueContext,
} from "./agent-venue-matrix";

export type AgentGuardResult = {
  success: boolean;
  status: string;
  latencyUs?: number;
  reasons?: string[];
  text?: string;
  message?: string;
  output?: string;
};

export interface AgentFrameworkDemoConfig {
  bannerTitle: string;
  agentId: string;
  frameworkLabel: string;
  agentAddress: string;
  dispatchTarget: (venue: AgentVenueContext) => string;
  evaluate: (input: {
    soil: ReturnType<typeof withDemoSoil>;
    intent: string;
    nowMs: number;
    chainId: number;
    sessionKey: {
      agentAddress: string;
      maxOrderClipUsd: number;
      expiresAtMs: number;
      approvedAtMs: number;
    };
    venue: AgentVenueContext;
    trip: boolean;
  }) => Promise<AgentGuardResult>;
  retryEvaluate: (input: {
    soil: ReturnType<typeof withDemoSoil>;
    intent: string;
    nowMs: number;
    chainId: number;
    venue: AgentVenueContext;
  }) => Promise<AgentGuardResult>;
}

function sessionKey(nowMs: number, agentAddress: string) {
  return {
    agentAddress,
    maxOrderClipUsd: 30,
    expiresAtMs: nowMs + 86_400_000,
    approvedAtMs: nowMs - 1_000,
  };
}

function failDetail(result: AgentGuardResult): string {
  return result.text ?? result.message ?? result.output ?? result.reasons?.join("; ") ?? "GUARD_FAIL";
}

export function runAgentFrameworkDemo(config: AgentFrameworkDemoConfig): void {
  wrapDemoExecution(async ({ nowMs, at }: DemoEnvironment) => {
    const trip = agentDemoTrip();
    const venue = resolveAgentVenue(nowMs);
    const locked = parseDemoVenueArgv() !== undefined;
    const intent = buildAgentIntent(venue, trip);
    const chainId = venue.key === "hyperliquid" ? 42161 : 42161;

    printBanner(config.bannerTitle);
    printMode(trip);
    printAgentVenueHud(venue, locked);

    hudIntent(config.agentId, config.frameworkLabel, intent, venue.hudVenue);

    const soil = withDemoSoil(trip ? venue.toxicSoil : venue.healthySoil, at);
    const { value: result, latencyUs: measuredUs } = await measureAsync(() =>
      config.evaluate({ soil, intent, nowMs, chainId, sessionKey: sessionKey(nowMs, config.agentAddress), venue, trip }),
    );
    const latencyUs = resolveLatency(measuredUs, result.latencyUs);

    if (result.status === "MANDATORY_COOLDOWN_ACTIVE") {
      hudBackoff(config.agentId, 60);
      printBackoffResult();
      console.error(`${RED}${failDetail(result)}${R}`);
      process.exit(1);
    }

    hudSoilFuse(result.success, latencyUs, result.reasons ?? []);

    if (result.success && result.status === "ALLOW") {
      hudChannelOpen();
      hudDispatched(config.dispatchTarget(venue), latencyUs);
      printResult(true);
      return;
    }

    hudSevered("SOIL_FUSE_TRIP");
    hudBlocked();
    printResult(false);
    console.error(`${RED}${failDetail(result)}${R}`);

    if (trip) {
      printBackoffDivider();
      const retry = await config.retryEvaluate({
        soil: withDemoSoil(venue.toxicSoil, at),
        intent,
        nowMs,
        chainId,
        venue,
      });
      if (retry.status === "MANDATORY_COOLDOWN_ACTIVE") {
        hudBackoff(config.agentId, 60);
        printBackoffResult();
        process.exit(1);
      }
      return { tripped: true, reason: "SOIL_FUSE_TRIP" };
    }
    process.exit(1);
  });
}
