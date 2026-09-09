#!/usr/bin/env tsx
/**
 * Virtuals GAME Framework Demo — Citadel pre-broadcast worker guard.
 * Usage: pnpm demo:virtuals
 * Trip:  pnpm demo:virtuals -- --trip
 * Venue: pnpm demo:virtuals -- --venue=aave
 */
import { evaluateVirtualsGameTask } from "../src/adapters/virtuals/virtuals-game-adapter";
import { runAgentFrameworkDemo } from "./lib/agent-framework-demo";

const AGENT_ID = "virtuals-demo";

runAgentFrameworkDemo({
  bannerTitle: "Virtuals GAME Framework Demo",
  agentId: AGENT_ID,
  frameworkLabel: "Virtuals GAME",
  agentAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  dispatchTarget: (venue) => `Virtuals GAME Worker → ${venue.label}`,
  evaluate: ({ soil, intent, nowMs, chainId, sessionKey }) =>
    evaluateVirtualsGameTask({
      ...soil,
      agentId: AGENT_ID,
      chainId,
      taskId: "game-demo-001",
      intent,
      nowMs,
      sessionKey,
    }),
  retryEvaluate: ({ soil, intent, nowMs, chainId }) =>
    evaluateVirtualsGameTask({
      ...soil,
      agentId: AGENT_ID,
      chainId,
      taskId: "game-demo-001",
      nowMs,
    }),
});
