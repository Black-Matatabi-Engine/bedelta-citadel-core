import { describe, expect, it, afterEach } from "vitest";
import {
  CITADEL_API_KEY_HEADER,
  CITADEL_RPS_LIMIT_HEADER,
  CITADEL_TIER_HEADER,
  PUBLIC_GATEWAY_RPS_LIMIT,
  PUBLIC_GATEWAY_TIER,
  applyPublicApiResponseHeaders,
  resolveGatewayTier,
} from "../../src/middleware/citadel-tier-headers";
import {
  __resetPublicGatewayRpsForTests,
  applyGatewayRateLimitHeaders,
  enforcePublicGatewayRps,
} from "../../src/middleware/rate-limiter";

afterEach(() => {
  __resetPublicGatewayRpsForTests();
});

describe("rate-limiter / citadel-tier-headers", () => {
  it("V1.0 defaults to public open gateway tier", () => {
    expect(resolveGatewayTier(new Request("https://citadel.local/api/health"))).toBe(PUBLIC_GATEWAY_TIER);
    const res = applyGatewayRateLimitHeaders(new Response("ok"));
    expect(res.headers.get(CITADEL_TIER_HEADER)).toBe("public");
    expect(res.headers.get(CITADEL_RPS_LIMIT_HEADER)).toBe(String(PUBLIC_GATEWAY_RPS_LIMIT));
  });

  it("V1.1 preview resolves paid tier from API key prefix", () => {
    const req = new Request("https://citadel.local/api/data", {
      headers: { [CITADEL_API_KEY_HEADER]: "cst_pro_live_abc" },
    });
    expect(resolveGatewayTier(req)).toBe("pro");
    expect(
      resolveGatewayTier(
        new Request("https://citadel.local/", {
          headers: { [CITADEL_API_KEY_HEADER]: "cst_business_prod" },
        }),
      ),
    ).toBe("business");
  });

  it("enforcePublicGatewayRps blocks burst above public limit", () => {
    const req = new Request("https://citadel.local/api/health", {
      headers: { "CF-Connecting-IP": "203.0.113.9" },
    });
    for (let i = 0; i < PUBLIC_GATEWAY_RPS_LIMIT; i += 1) {
      expect(enforcePublicGatewayRps(req)).toBeNull();
    }
    const blocked = enforcePublicGatewayRps(req);
    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get(CITADEL_TIER_HEADER)).toBe("public");
    expect(blocked?.headers.get(CITADEL_RPS_LIMIT_HEADER)).toBe(String(PUBLIC_GATEWAY_RPS_LIMIT));
  });

  it("applyPublicApiResponseHeaders chains grant-audit + engine-mode + tier", () => {
    const req = new Request("https://citadel.local/api/grant-audit", {
      headers: { "x-engine-mode": "ARBITRUM_CITADEL" },
    });
    const res = applyPublicApiResponseHeaders(new Response("{}"), req);
    expect(res.headers.get(CITADEL_TIER_HEADER)).toBe("public");
    expect(res.headers.get(CITADEL_RPS_LIMIT_HEADER)).toBe("5");
    expect(res.headers.get("x-engine-mode")).toBe("ARBITRUM_CITADEL");
    expect(res.headers.get("X-Slivervine-Version")).toBeTruthy();
  });
});
