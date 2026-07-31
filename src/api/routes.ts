import type { Env } from "../env";
import { handleDataRequest } from "./data";
import { handleIndexApiRequest } from "./index";
import { handleHudStreamRequest } from "./hud-telemetry";
import { handlePageRequest } from "./page";
import { handleTelemetryHealthRequest } from "./routes/telemetry";
import { handleYieldTriangleRequest } from "./routes/yield";
import { applyGrantAuditHeaders, handleOgPreviewRequest } from "./middleware/og-preview";
import { hardlockResponse } from "./hardlock-response";
import { HardlockError } from "../services/risk-control";

console.log("[slivervine] routes initialized");

/**
 * Pathname / method dispatch — decoupled from arbitrage services.
 * Static SPA is served via wrangler ASSETS at `/` (see wrangler.jsonc).
 */
export async function routeRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    const url = new URL(request.url);

    if (url.pathname === "/api/data" && request.method === "GET") {
      return applyGrantAuditHeaders(await handleDataRequest(env, ctx));
    }

    if (url.pathname === "/api/telemetry/health" && request.method === "GET") {
      return applyGrantAuditHeaders(handleTelemetryHealthRequest());
    }

    if (url.pathname === "/api/hud-stream" && request.method === "GET") {
      return applyGrantAuditHeaders(handleHudStreamRequest(request));
    }

    if (url.pathname === "/api/yield/triangle" && request.method === "GET") {
      return applyGrantAuditHeaders(await handleYieldTriangleRequest(request));
    }

    if (
      (url.pathname === "/" || url.pathname === "/index.html") &&
      request.method === "GET"
    ) {
      return applyGrantAuditHeaders(await handlePageRequest(env, request));
    }

    const ogPreviewResponse = handleOgPreviewRequest(request);
    if (ogPreviewResponse) return ogPreviewResponse;

    const indexResponse = await handleIndexApiRequest(request, url);
    if (indexResponse) return applyGrantAuditHeaders(indexResponse);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Santenmoku-Canary, X-Xuanwu-Watermark",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    if (error instanceof HardlockError) {
      return applyGrantAuditHeaders(hardlockResponse(error));
    }
    throw error;
  }
}
