import type { Env } from "./env";
import { routeRequest } from "./api/routes";
import { runSoakTelemetryTick } from "./services/soak-telemetry";
import { severSigningChannel } from "./services/session-key-adapter";

export type { Env };
export {
  checkVineShield,
  checkFoolProofGuard,
  checkFoolProofOrder,
  assertVineShield,
  assertFoolProofGuard,
  runVineShieldSoilGate,
  checkSoilResistanceWithFoolProofGuard,
  checkSoilResistanceWithVine,
  vineWrapProtection,
} from "./services/index";
export type {
  VineShieldOrder,
  VineShieldResult,
  VineShieldProfile,
  VineShieldInput,
  FoolProofOrder,
  FoolProofResult,
  FoolProofProfile,
  FoolProofGuardInput,
} from "./services/index";
export {
  evaluateGlobalRiskPolicy,
} from "./core/risk-engine";
export type {
  GlobalRiskPolicyResult,
  FoolProofIntent,
  JupiterRiskIntent,
  RiskIntent,
  RiskVenue,
  TailHedgeIntent,
} from "./core/risk-engine";
export { simulateTransactionIntent } from "./services/sandbox";
export type { SandboxDiagnosticReport } from "./services/sandbox";
export {
  createCrossLegIntent,
  prepareIntent,
  commitIntent,
  abortIntent,
  getIntent,
} from "./core/intent-ledger";
export type {
  CrossLegIntent,
  IntentPhase,
  IntentLeg,
  FlattenAction,
} from "./core/intent-ledger";
export {
  auditThreeEyeAdapters,
  evaluateSantenmokuHub,
  readCounterAttackTelemetryStatus,
  TELEMETRY_VENUES,
  fetchJupiterQuote,
  fetchPolymarketOrderbook,
  fetchHyperliquidMaps,
  signAndExecuteOrder,
  assertSessionKeyExecutionGates,
  severSigningChannel,
  sendPanicAlert,
  vineMeshAutoRecovery,
  checkCircuitRecovery,
  recordSoilViolation,
} from "./services/index";
export type {
  CounterAttackStatus,
  SantenmokuHubResult,
  PanicMetrics,
  VineMeshRecoveryResult,
  CircuitRecoveryResult,
  SessionKeyOrderPayload,
  SigningResult,
  SessionKeyEip712Stub,
  SignAndExecuteOptions,
} from "./services/index";

async function runScheduledSoakTelemetry(env: Env): Promise<void> {
  await runSoakTelemetryTick({ kv: env.SLIVERVINE_KV });
}

async function runScheduledJobs(env: Env): Promise<void> {
  // Market sensors (HL funding + Pyth confidence) run client-side on slivervine.xyz.
  // Worker cron retains soak telemetry only — avoids KV 429 write storms.
  await runScheduledSoakTelemetry(env);
}

console.log("[slivervine] worker boot");

const GEO_BLOCKED_COUNTRIES = new Set(["US", "CU", "IR", "KP", "SY"]);

function enforceGeoCompliance(request: Request): Response | null {
  const country = request.cf?.country;
  if (typeof country !== "string" || !GEO_BLOCKED_COUNTRIES.has(country)) {
    return null;
  }
  severSigningChannel();
  return new Response(
    "[SILVERVINE DEFENSE] Access Denied by Geo-Compliance Circuit Breaker",
    {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
    },
  );
}

/**
 * SliverVine Workers entry — API routes + static SPA via ASSETS binding.
 * wrangler.jsonc runs the worker first for `/api/*`; all other paths fall through to dist/.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const geoResponse = enforceGeoCompliance(request);
    if (geoResponse) return geoResponse;
    return routeRequest(request, env, ctx);
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    console.log("[slivervine] cron fired", controller.cron);
    ctx.waitUntil(
      runScheduledJobs(env).catch((err) => {
        console.error("[slivervine] scheduled cron failed", err);
      }),
    );
  },
} satisfies ExportedHandler<Env>;
