#!/usr/bin/env tsx
/**
 * ElizaOS Agent Demo — ExoMesh Action handler.
 * Usage: pnpm demo:elizaos
 * Trip:  pnpm demo:elizaos -- --trip
 * Venue: pnpm demo:elizaos -- --venue=pendle
 */
import { evaluateElizaCitadelAction } from "../src/adapters/elizaos/elizaos-citadel-plugin";
import { runAgentFrameworkDemo } from "./lib/agent-framework-demo";

const AGENT_ID = "elizaos-demo";

runAgentFrameworkDemo({
  bannerTitle: "ElizaOS Framework Demo",
  agentId: AGENT_ID,
  frameworkLabel: "ElizaOS",
  agentAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  dispatchTarget: (venue) => `ElizaOS Action Handler → ${venue.label}`,
  evaluate: ({ soil, intent, nowMs, chainId, sessionKey }) =>
    evaluateElizaCitadelAction({ agentId: AGENT_ID }, { soil, intent, nowMs, chainId, sessionKey }),
  retryEvaluate: ({ soil, intent, nowMs, chainId }) =>
    evaluateElizaCitadelAction({ agentId: AGENT_ID }, { soil, intent, nowMs, chainId }),
});
