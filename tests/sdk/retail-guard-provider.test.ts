import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetRetailGuardStateForTests,
  isRetailGuardChannelSevered,
  RetailGuardRejectedError,
  withRetailGuardProvider,
  type EIP1193Provider,
  type RetailGuardConfig,
} from "../../src/sdk/retail-guard";

const WALLET = "0x1111111111111111111111111111111111111111";
const GMX_ROUTER = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const MALICIOUS = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

function mockProvider(
  handler: (args: { method: string; params?: unknown[] }) => unknown = () => "0xok",
): EIP1193Provider & { calls: Array<{ method: string; params?: unknown[] }> } {
  const calls: Array<{ method: string; params?: unknown[] }> = [];
  return {
    calls,
    request: async (args) => {
      calls.push(args);
      return handler(args);
    },
  };
}

function baseConfig(overrides: Partial<RetailGuardConfig> = {}): RetailGuardConfig {
  return {
    walletAddress: WALLET,
    allowedVenueMask: 1,
    contractVenueIndex: {
      [GMX_ROUTER.toLowerCase()]: 0,
    },
    soilQuote: {
      hlSpot: 3500,
      hlPerp: 3500,
      dydxPerp: 3498.25,
      depthUsd: 500_000,
      maxSlippage: 0.005,
      minDepthUsd: 100_000,
    },
    ...overrides,
  };
}

describe("withRetailGuardProvider — EIP-1193 PoC", () => {
  beforeEach(() => {
    __resetRetailGuardStateForTests();
  });

  it("passes healthy eth_sendTransaction through to base provider", async () => {
    const base = mockProvider(() => "0xdeadbeef");
    const guarded = withRetailGuardProvider(base, baseConfig());

    const hash = await guarded.request({
      method: "eth_sendTransaction",
      params: [{ from: WALLET, to: GMX_ROUTER, value: "0x0" }],
    });

    expect(hash).toBe("0xdeadbeef");
    expect(base.calls).toHaveLength(1);
    expect(base.calls[0]?.method).toBe("eth_sendTransaction");
  });

  it("rejects excessive slippage with SLIPPAGE_EXCEEDED (0-Gas fail-closed)", async () => {
    const base = mockProvider();
    const guarded = withRetailGuardProvider(
      base,
      baseConfig({
        soilQuote: {
          hlSpot: 3500,
          hlPerp: 3500,
          dydxPerp: 3200,
          depthUsd: 500_000,
          maxSlippage: 0.005,
          minDepthUsd: 100_000,
        },
      }),
    );

    await expect(
      guarded.request({
        method: "eth_sendTransaction",
        params: [{ from: WALLET, to: GMX_ROUTER, value: "0x0" }],
      }),
    ).rejects.toMatchObject({
      code: "SLIPPAGE_EXCEEDED",
    } satisfies Partial<RetailGuardRejectedError>);

    expect(base.calls).toHaveLength(0);
  });

  it("rejects unauthorized contract in eth_signTypedData_v4 with VENUE_DRIFT_REJECTED", async () => {
    const base = mockProvider();
    const guarded = withRetailGuardProvider(base, baseConfig());

    const typedData = JSON.stringify({
      domain: {
        name: "Phish",
        version: "1",
        chainId: 42161,
        verifyingContract: MALICIOUS,
      },
      types: { Permit: [{ name: "spender", type: "address" }] },
      primaryType: "Permit",
      message: { spender: MALICIOUS },
    });

    await expect(
      guarded.request({
        method: "eth_signTypedData_v4",
        params: [WALLET, typedData],
      }),
    ).rejects.toMatchObject({
      code: "VENUE_DRIFT_REJECTED",
    } satisfies Partial<RetailGuardRejectedError>);

    expect(base.calls).toHaveLength(0);
  });

  it("severs signing channel on 4th rapid submit (FOMO throttle)", async () => {
    const base = mockProvider(() => "0x1");
    const guarded = withRetailGuardProvider(base, baseConfig({ maxAttempts: 3 }));

    const params = [{ from: WALLET, to: GMX_ROUTER, value: "0x0" }];

    await guarded.request({ method: "eth_sendTransaction", params });
    await guarded.request({ method: "eth_sendTransaction", params });
    await guarded.request({ method: "eth_sendTransaction", params });
    expect(base.calls).toHaveLength(3);

    await expect(
      guarded.request({ method: "eth_sendTransaction", params }),
    ).rejects.toMatchObject({
      code: "MAX_ATTEMPTS_EXCEEDED_SEVERED",
    } satisfies Partial<RetailGuardRejectedError>);

    expect(isRetailGuardChannelSevered()).toBe(true);
    expect(base.calls).toHaveLength(3);

    await expect(
      guarded.request({ method: "eth_sendTransaction", params }),
    ).rejects.toMatchObject({
      code: "CHANNEL_SEVERED",
    } satisfies Partial<RetailGuardRejectedError>);
  });
});
