import { describe, expect, it } from "vitest";
import {
  validateVariationalRFQIntent,
  VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION,
  VARIATIONAL_PRICE_DEVIATION_MAX_BPS,
  VARIATIONAL_QUOTE_MAX_AGE_MS,
} from "../../src/adapters/variational-rfq-adapter";

const BASE = {
  symbol: "LONG_TAIL_PERP",
  quotePriceUsd: 3500,
  oracleMarkUsd: 3500,
  quoteTimestampMs: 1_700_000_000_000,
  nowMs: 1_700_000_000_200,
  tradeSizeUsd: 5_000,
  olpDepthUsd: 100_000,
  longTailAsset: true,
};

describe("validateVariationalRFQIntent", () => {
  it("fresh quote within oracle band and OLP utilization → ALLOW", () => {
    const r = validateVariationalRFQIntent(BASE);
    expect(r.ok).toBe(true);
    expect(r.status).toBe("ALLOW");
    expect(r.detail).toBe("OLP depth ok");
  });

  it("stale quote or price deviation → VARIATIONAL_STALE_QUOTE_BREACH", () => {
    const stale = validateVariationalRFQIntent({
      ...BASE,
      quoteTimestampMs: BASE.nowMs - VARIATIONAL_QUOTE_MAX_AGE_MS - 1,
    });
    expect(stale.reason).toBe("FAIL_CLOSED: VARIATIONAL_STALE_QUOTE_BREACH");

    const dev = validateVariationalRFQIntent({
      ...BASE,
      quotePriceUsd: 3500 * (1 + (VARIATIONAL_PRICE_DEVIATION_MAX_BPS + 5) / 10_000),
    });
    expect(dev.reason).toBe("FAIL_CLOSED: VARIATIONAL_STALE_QUOTE_BREACH");
  });

  it("trade size >15% OLP depth on long-tail → VARIATIONAL_OLP_DEPTH_BREACH", () => {
    const r = validateVariationalRFQIntent({
      ...BASE,
      tradeSizeUsd: BASE.olpDepthUsd * VARIATIONAL_OLP_DEPTH_MAX_UTILIZATION + 1,
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("FAIL_CLOSED: VARIATIONAL_OLP_DEPTH_BREACH");
  });
});
