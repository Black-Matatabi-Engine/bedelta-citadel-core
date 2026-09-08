import { describe, expect, it, vi } from "vitest";
import { encodeErrorResult, type Hex } from "viem";
import { GMX_SYNTHETICS_ERRORS_ABI } from "../../src/services/adapters/gmx-synthetics-errors";
import {
  diagnoseGmxFailedTransaction,
  extractTraceRevertHint,
  isAlchemyRpc,
  replayGmxTxEthCall,
  resolveGmxDiagnosticRpcProviders,
  scrapeJsonRpcRevertData,
} from "../../src/services/adapters/gmx-micro-fill-rpc-diagnostics";

const TX = {
  from: "0xbd65d785Dac74EBa9efFdB357b2dC52fCC26EC7F" as Hex,
  to: "0x7dE39FF2e232A2203196788d37e234cF8F1b83f1" as Hex,
  input: "0xdeadbeef" as Hex,
  value: 0n,
  gas: 2_000_000n,
  blockTag: "0x1" as Hex,
};

describe("gmx-micro-fill-rpc-diagnostics", () => {
  it("isAlchemyRpc detects Alchemy hosts", () => {
    expect(isAlchemyRpc("https://arb-mainnet.g.alchemy.com/v2/demo")).toBe(true);
    expect(isAlchemyRpc("https://arb1.arbitrum.io/rpc")).toBe(false);
  });

  it("resolveGmxDiagnosticRpcProviders excludes Alchemy and honors GMX_DIAGNOSTIC_RPC_URL", () => {
    vi.stubEnv("GMX_DIAGNOSTIC_RPC_URL", "https://custom-rpc.example/rpc");
    const list = resolveGmxDiagnosticRpcProviders("https://arb-mainnet.g.alchemy.com/v2/key");
    expect(list[0]).toBe("https://custom-rpc.example/rpc");
    expect(list.some((u) => u.includes("alchemy"))).toBe(false);
    vi.unstubAllEnvs();
  });

  it("scrapeJsonRpcRevertData unwraps nested Alchemy-style error payloads", () => {
    const data = "0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004746f6f00" as Hex;
    expect(scrapeJsonRpcRevertData({ error: { data } })).toBe(data);
    expect(scrapeJsonRpcRevertData({ error: { data: { data } } })).toBe(data);
  });

  it("extractTraceRevertHint walks nested callTracer output", () => {
    const raw = "0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004746f6f00";
    const hint = extractTraceRevertHint({
      type: "CALL",
      calls: [{ type: "DELEGATECALL", output: raw, error: "execution reverted" }],
    });
    expect(hint?.rawData).toBe(raw);
    expect(hint?.hint).toContain("DELEGATECALL");
  });

  it("replayGmxTxEthCall decodes and labels InsufficientExecutionFee from fallback RPC", async () => {
    const revertData = encodeErrorResult({
      abi: GMX_SYNTHETICS_ERRORS_ABI,
      errorName: "InsufficientExecutionFee",
      args: [2n, 1n],
    });
    const fetchFn = vi.fn(async () =>
      new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted", data: revertData } })),
    );
    const result = await replayGmxTxEthCall({
      rpcUrl: "https://arb1.arbitrum.io/rpc",
      tx: TX,
      fetchFn,
    });
    expect(result?.errorLabel).toBe("InsufficientExecutionFee");
    expect(result?.decodedError).toBe("[GMX:InsufficientExecutionFee] InsufficientExecutionFee(2, 1)");
    expect(result?.summary).toContain("[GMX:InsufficientExecutionFee]");
    expect(result?.rpcUrl).toBe("https://arb1.arbitrum.io/rpc");
  });

  it("diagnoseGmxFailedTransaction prefers fallback RPC when primary replay is silent", async () => {
    const revertData = encodeErrorResult({ abi: GMX_SYNTHETICS_ERRORS_ABI, errorName: "EmptyOrder", args: [] });
    const fetchFn = vi.fn(async () =>
      new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted", data: revertData } })),
    );
    const diag = await diagnoseGmxFailedTransaction({
      tx: TX,
      txHash: "0x3af365a1ae9246bc2d8c51d8ed6e502677bff786b569c11392d080debd7c1f72",
      primaryRpc: "https://arb-mainnet.g.alchemy.com/v2/demo",
      fetchFn,
      primaryReplay: { summary: "silent revert (no custom error data)" },
    });
    expect(diag?.decodedError).toBe("EmptyOrder");
    expect(diag?.rpcUrl).toBe("https://arb1.arbitrum.io/rpc");
  });
});
