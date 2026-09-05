import { describe, expect, it } from "vitest";
import {
  CITADEL_API_KEY_HEADER,
  CITADEL_RPS_LIMIT_HEADER,
  CITADEL_TIER_HEADER,
  applyCitadelTierHeaders,
  applyPublicApiResponseHeaders,
  resolveCitadelTier,
} from "../../src/middleware/citadel-tier-headers";

describe("citadel-tier-headers", () => {
  it("defaults to starter tier without API key", () => {
    expect(resolveCitadelTier(new Request("https://citadel.local/api/health"))).toBe("starter");
  });

  it("resolves tier from API key prefix", () => {
    const req = new Request("https://citadel.local/api/data", {
      headers: { [CITADEL_API_KEY_HEADER]: "cst_pro_live_abc" },
    });
    expect(resolveCitadelTier(req)).toBe("pro");
    expect(
      resolveCitadelTier(
        new Request("https://citadel.local/", {
          headers: { [CITADEL_API_KEY_HEADER]: "cst_business_prod" },
        }),
      ),
    ).toBe("business");
    expect(
      resolveCitadelTier(
        new Request("https://citadel.local/", {
          headers: { [CITADEL_API_KEY_HEADER]: "cst_enterprise_dedicated" },
        }),
      ),
    ).toBe("enterprise");
  });

  it("applyCitadelTierHeaders sets tier and RPS limit", () => {
    const res = applyCitadelTierHeaders(new Response("ok", { status: 200 }), "business");
    expect(res.headers.get(CITADEL_TIER_HEADER)).toBe("business");
    expect(res.headers.get(CITADEL_RPS_LIMIT_HEADER)).toBe("200");
  });

  it("applyPublicApiResponseHeaders chains grant-audit + engine-mode + tier", () => {
    const req = new Request("https://citadel.local/api/grant-audit", {
      headers: {
        [CITADEL_API_KEY_HEADER]: "cst_pro_demo",
        "x-engine-mode": "ARBITRUM_CITADEL",
      },
    });
    const res = applyPublicApiResponseHeaders(new Response("{}"), req);
    expect(res.headers.get(CITADEL_TIER_HEADER)).toBe("pro");
    expect(res.headers.get(CITADEL_RPS_LIMIT_HEADER)).toBe("50");
    expect(res.headers.get("x-engine-mode")).toBe("ARBITRUM_CITADEL");
    expect(res.headers.get("X-Slivervine-Version")).toBeTruthy();
  });
});
