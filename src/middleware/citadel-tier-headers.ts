/** Citadel SaaS tier response headers — v1.0 commercial SSOT. */
import { applyGrantAuditHeaders } from "../api/middleware/og-preview";
import { applyEngineModeResponseHeaders, parseEngineModeHeader } from "./engine-mode-router";

export const CITADEL_TIER_HEADER = "X-Citadel-Tier" as const;
export const CITADEL_RPS_LIMIT_HEADER = "X-Citadel-RPS-Limit" as const;
export const CITADEL_API_KEY_HEADER = "X-Citadel-API-Key" as const;

export type CitadelCommercialTier = "starter" | "pro" | "business" | "enterprise";

export const CITADEL_TIER_RPS_LIMIT: Record<CitadelCommercialTier, number> = {
  starter: 5,
  pro: 50,
  business: 200,
  enterprise: 1000,
};

export const CITADEL_TIER_INTENTS_MONTHLY: Record<CitadelCommercialTier, number> = {
  starter: 100_000,
  pro: 5_000_000,
  business: 20_000_000,
  enterprise: 20_000_000,
};

const TIER_PREFIXES: ReadonlyArray<{ prefix: string; tier: CitadelCommercialTier }> = [
  { prefix: "cst_enterprise_", tier: "enterprise" },
  { prefix: "cst_ent_", tier: "enterprise" },
  { prefix: "cst_business_", tier: "business" },
  { prefix: "cst_bus_", tier: "business" },
  { prefix: "cst_pro_", tier: "pro" },
  { prefix: "cst_starter_", tier: "starter" },
];

/** V1.1 Roadmap: full API Key KV metering — per-key intent counters + billing-cycle enforcement. */
export function resolveCitadelTier(request?: Request | null): CitadelCommercialTier {
  const raw = request?.headers.get(CITADEL_API_KEY_HEADER)?.trim().toLowerCase() ?? "";
  if (!raw) return "starter";
  for (const { prefix, tier } of TIER_PREFIXES) {
    if (raw.startsWith(prefix)) return tier;
  }
  return "starter";
}

export function applyCitadelTierHeaders(
  response: Response,
  tier: CitadelCommercialTier = "starter",
): Response {
  const headers = new Headers(response.headers);
  headers.set(CITADEL_TIER_HEADER, tier);
  headers.set(CITADEL_RPS_LIMIT_HEADER, String(CITADEL_TIER_RPS_LIMIT[tier]));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function applyPublicApiResponseHeaders(
  response: Response,
  request?: Request | null,
): Response {
  const tier = resolveCitadelTier(request);
  const mode = request
    ? parseEngineModeHeader(request)
    : parseEngineModeHeader(new Request("https://citadel.local/"));
  return applyGrantAuditHeaders(
    applyEngineModeResponseHeaders(applyCitadelTierHeaders(response, tier), mode),
  );
}
