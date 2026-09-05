import type { Env } from "../env";
import { applyGrantAuditHeaders } from "./middleware/og-preview";
import {
  applyEngineModeResponseHeaders,
  parseEngineModeHeader,
} from "../middleware/engine-mode-router";
import { hardlockResponse } from "./hardlock-response";
import { HardlockError } from "../services/risk-control";
import {
  handleExecutionLogsRequest,
  handleSystemStatusRequest,
  isExecutionLogsPath,
} from "./routes/logs";
import {
  handleGrantAuditRequest,
  isGrantAuditApiPath,
} from "./routes/grant-audit";
import { handleDataRequestLean } from "./routes/data-lean";
import { handleTelemetryHealthRequestLean } from "./routes/telemetry-lean";
import {
  handleBadgeHealthRequestLean,
  handleBadgeProofsRequestLean,
} from "./routes/badge-lean";
import { handleTelemetryAnalyticsRequestLean } from "./routes/analytics-lean";
import { handleYieldTriangleRequestLean } from "./routes/yield-lean";

/** Ultra-lean Worker route dispatch — no matrix-pipeline / hl-telemetry / grant-audit-payload. */
export async function routeRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    const url = new URL(request.url);

    if (isExecutionLogsPath(url.pathname) && request.method === "GET") {
      return applyEngineModeResponseHeaders(
        applyGrantAuditHeaders(await handleExecutionLogsRequest(env, request)),
        parseEngineModeHeader(request),
      );
    }

    if (isGrantAuditApiPath(url.pathname) && request.method === "GET") {
      return applyEngineModeResponseHeaders(
        applyGrantAuditHeaders(await handleGrantAuditRequest(env, request)),
        parseEngineModeHeader(request),
      );
    }

    if (
      (url.pathname === "/api" || url.pathname === "/api/health") &&
      request.method === "GET"
    ) {
      return applyGrantAuditHeaders(handleSystemStatusRequest(env));
    }

    if (url.pathname === "/api/data" && request.method === "GET") {
      return applyGrantAuditHeaders(await handleDataRequestLean(env, ctx));
    }

    if (url.pathname === "/api/telemetry/health" && request.method === "GET") {
      return applyGrantAuditHeaders(handleTelemetryHealthRequestLean());
    }

    if (url.pathname === "/api/badge/health" && request.method === "GET") {
      return applyGrantAuditHeaders(handleBadgeHealthRequestLean());
    }

    if (url.pathname === "/api/badge/proofs" && request.method === "GET") {
      return applyGrantAuditHeaders(handleBadgeProofsRequestLean());
    }

    if (url.pathname === "/api/telemetry/analytics" && request.method === "GET") {
      return applyGrantAuditHeaders(handleTelemetryAnalyticsRequestLean());
    }

    if (url.pathname === "/api/yield/triangle" && request.method === "GET") {
      return applyGrantAuditHeaders(handleYieldTriangleRequestLean(request));
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, X-Santenmoku-Canary, X-Runtime-Integrity, x-engine-mode",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    if (error instanceof HardlockError) {
      return applyGrantAuditHeaders(hardlockResponse(error));
    }
    console.error("[routeRequest] unhandled error", error);
    return applyGrantAuditHeaders(
      new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }
}
