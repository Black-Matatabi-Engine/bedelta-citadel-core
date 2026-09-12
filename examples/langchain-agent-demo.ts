#!/usr/bin/env tsx
/**
 * LangChain / LangGraph Demo — CitadelRiskGuardTool pre-broadcast guard.
 * Usage: pnpm demo:langchain
 * Trip:  pnpm demo:langchain -- --trip
 * Venue: pnpm demo:langchain -- --venue=pendle
 */
import { CitadelRiskGuardTool } from "../src/adapters/langchain/langchain-citadel-tool";
import { runAgentFrameworkDemo } from "./lib/agent-framework-demo";

const AGENT_ID = "langchain-demo";

runAgentFrameworkDemo({
  bannerTitle: "LangChain / LangGraph Demo",
  agentId: AGENT_ID,
  frameworkLabel: "LangChain",
  agentAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
  dispatchTarget: (venue) => `LangChain CitadelRiskGuardTool → ${venue.label}`,
  evaluate: ({ soil, intent, nowMs, chainId, sessionKey }) =>
    CitadelRiskGuardTool.invoke({
      ...soil,
      agentId: AGENT_ID,
      chainId,
      intent,
      nowMs,
      sessionKey,
    }),
  retryEvaluate: ({ soil, intent, nowMs, chainId }) =>
    CitadelRiskGuardTool.invoke({
      ...soil,
      agentId: AGENT_ID,
      chainId,
      nowMs,
    }),
});
