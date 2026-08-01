import { afterEach, describe, expect, it } from "vitest";
import {
  HoneyPotCircuitBreakError,
  HONEYPOT_RPC_HOSTS,
  HONEYPOT_SIMULATED_SLIPPAGE,
  assertRpcAllowlisted,
  fetchAllowlisted,
  listInternalRpcHosts,
  RpcNodeNotAllowlistedError,
} from "../../src/services/defense/rpc-whitelist";
import {
  JAVIER_SIGNATURE_LITERAL,
  OWNER_IDENTITY_TAG,
  XUANWU_CANONICAL_SALT,
  __setXuanwuEnvForTests,
  computeXuanwuMaxLossLimitUsd,
  decodeThresholdBlob,
  enforceXuanwuSaltGate,
  resolveXuanwuThresholds,
  validateTripleStringUnlock,
  XUANWU_ENC_THRESHOLDS,
} from "../../src/services/defense/salt-engine";
import {
  __setHudCanaryEnvForTests,
  assertUiWorkerHandshake,
  buildUiHandshakeHeaders,
  computeXuanwuWatermarkHash,
  generateCanvasWatermarkPayload,
  HUD_CANARY_EXPECTED,
  isHudCanaryAuthenticated,
  resolveUiStreamState,
  UI_LOCKED_MESSAGE,
} from "../../src/services/defense/ui-canary";
import { RiskLimitExceeded } from "../../src/services/risk-control";

const TRIPLE_STRING_ENV = {
  XUANWU_SALT: XUANWU_CANONICAL_SALT,
  OWNER_IDENTITY: OWNER_IDENTITY_TAG,
  JAVIER_SIGNATURE: JAVIER_SIGNATURE_LITERAL,
} as const;

const HUD_CANARY_ENV = {
  NEXT_PUBLIC_HUD_CANARY: HUD_CANARY_EXPECTED,
} as const;

afterEach(() => {
  __setXuanwuEnvForTests(undefined);
  __setHudCanaryEnvForTests(undefined);
});

describe("Runtime integrity gate — salt-engine", () => {
  it("passes when all 3 operator unlock secrets are supplied", () => {
    __setXuanwuEnvForTests({ ...TRIPLE_STRING_ENV });
    expect(validateTripleStringUnlock()).toBe(true);
    const thresholds = resolveXuanwuThresholds();
    expect(thresholds.valid).toBe(true);
    expect(thresholds.maxSlBaseUsd).toBe(100);
    expect(thresholds.maxSlBalanceRate).toBe(0.01);
    expect(thresholds.latencyBoundMs).toBe(500);
    expect(computeXuanwuMaxLossLimitUsd(10_000, thresholds)).toBe(200);
  });

  it("decrypts threshold blob with canonical operator salt", () => {
    const decoded = decodeThresholdBlob(
      XUANWU_ENC_THRESHOLDS,
      XUANWU_CANONICAL_SALT,
    );
    expect(decoded.maxSlBaseUsd).toBe(100);
    expect(decoded.latencyBoundMs).toBe(500);
  });

  it.each([
    ["missing all keys", {}],
    ["wrong salt", { ...TRIPLE_STRING_ENV, XUANWU_SALT: "wrong" }],
    ["wrong owner tag", { ...TRIPLE_STRING_ENV, OWNER_IDENTITY: "0xEvil" }],
    ["wrong operator sig", { ...TRIPLE_STRING_ENV, JAVIER_SIGNATURE: "javier" }],
    ["missing operator sig only", { XUANWU_SALT: XUANWU_CANONICAL_SALT, OWNER_IDENTITY: OWNER_IDENTITY_TAG }],
  ])("rootProtection deadlock when %s", (_label, env) => {
    __setXuanwuEnvForTests(env);
    expect(resolveXuanwuThresholds().valid).toBe(false);
    expect(() =>
      enforceXuanwuSaltGate({
        symbol: "BTC",
        estimatedLossUsd: 1,
        accountBalanceUsd: 10_000,
      }),
    ).toThrow(RiskLimitExceeded);
  });

  it("allows trades within decrypted dynamic Max SL when triple-string valid", () => {
    __setXuanwuEnvForTests({ ...TRIPLE_STRING_ENV });
    expect(() =>
      enforceXuanwuSaltGate({
        symbol: "BTC",
        estimatedLossUsd: 50,
        accountBalanceUsd: 10_000,
      }),
    ).not.toThrow();
  });
});

describe("Integrity probe rpc-whitelist", () => {
  it("strips probe hosts when operator unlock validation passes", () => {
    const hosts = listInternalRpcHosts(TRIPLE_STRING_ENV);
    for (const trap of HONEYPOT_RPC_HOSTS) {
      expect(hosts).not.toContain(trap);
    }
    expect(() =>
      assertRpcAllowlisted(
        `https://${HONEYPOT_RPC_HOSTS[0]}/v1/rpc`,
        [],
        TRIPLE_STRING_ENV,
      ),
    ).toThrow(RpcNodeNotAllowlistedError);
  });

  it("retains probe hosts without operator unlock", () => {
    const hosts = listInternalRpcHosts({});
    for (const trap of HONEYPOT_RPC_HOSTS) {
      expect(hosts).toContain(trap);
    }
  });

  it("circuit-breaks probe fetch with 500 + simulated slippage", async () => {
    await expect(
      fetchAllowlisted(`https://${HONEYPOT_RPC_HOSTS[1]}/quote`, {}, [], {}),
    ).rejects.toMatchObject({
      name: "HoneyPotCircuitBreakError",
      httpStatus: 500,
      simulatedSlippage: HONEYPOT_SIMULATED_SLIPPAGE,
    });
  });

  it("allows production RPC hosts regardless of unlock state", () => {
    expect(() =>
      assertRpcAllowlisted("https://api.hyperliquid.xyz/info", [], {}),
    ).not.toThrow();
    expect(() =>
      assertRpcAllowlisted(
        "https://api.hyperliquid.xyz/info",
        [],
        TRIPLE_STRING_ENV,
      ),
    ).not.toThrow();
  });
});

describe("XuanWu ui-canary HUD handshake", () => {
  it("authenticates with NEXT_PUBLIC_HUD_CANARY=santenmoku", () => {
    __setHudCanaryEnvForTests({ ...HUD_CANARY_ENV });
    expect(isHudCanaryAuthenticated()).toBe(true);
    expect(resolveUiStreamState()).toBe("CONNECTED");
    expect(assertUiWorkerHandshake()).toEqual({ ok: true });
    expect(buildUiHandshakeHeaders()).toMatchObject({
      "X-Santenmoku-Canary": HUD_CANARY_EXPECTED,
      "X-Xuanwu-Watermark": computeXuanwuWatermarkHash(),
    });
  });

  it("locks UI stream when canary token is invalid", () => {
    __setHudCanaryEnvForTests({ NEXT_PUBLIC_HUD_CANARY: "wrong" });
    expect(isHudCanaryAuthenticated()).toBe(false);
    expect(resolveUiStreamState()).toBe("DISCONNECTED_LOCKED");
    expect(assertUiWorkerHandshake()).toEqual({
      ok: false,
      message: UI_LOCKED_MESSAGE,
    });
    expect(buildUiHandshakeHeaders()).toMatchObject({
      "X-Santenmoku-Canary": HUD_CANARY_EXPECTED,
    });
  });

  it("falls back to santenmoku when NEXT_PUBLIC_HUD_CANARY is unset", () => {
    __setHudCanaryEnvForTests({});
    expect(isHudCanaryAuthenticated()).toBe(true);
    expect(resolveUiStreamState()).toBe("CONNECTED");
    expect(assertUiWorkerHandshake()).toEqual({ ok: true });
  });

  it("generates stable Canvas/WebGL watermark payload", () => {
    const payload = generateCanvasWatermarkPayload();
    expect(payload.seed).toBe("玄武");
    expect(payload.hash).toMatch(/^xw-[0-9a-f]{8}$/);
    expect(payload.webglHint).toContain("webgl-xuanwu-");
  });
});
