/** GMX micro-fill — non-Alchemy RPC fallback for revert replay + call trace diagnostics. */
import { type Hex } from "viem";
import { postArbitrumJsonRpc } from "./arbitrum-rpc-fallback";
import { decodeGmxRevertData } from "./gmx-micro-fill-revert-decode";
import { labelGmxSyntheticsError, type GmxSyntheticsErrorLabel } from "./gmx-synthetics-error-labels";
import { GMX_DIAGNOSTIC_RPC_PROVIDERS } from "./gmx-v2-rpc-constants";

export type GmxFailedTxDiagnostics = {
  summary: string;
  decodedError?: string;
  errorLabel?: GmxSyntheticsErrorLabel;
  rawData?: Hex;
  rpcUrl?: string;
  traceHint?: string;
};

export type GmxTxReplayFields = {
  from: Hex;
  to: Hex;
  input: Hex;
  value: bigint;
  gas: bigint;
  blockTag: Hex | "latest";
};

type TraceNode = {
  type?: string;
  error?: string;
  revertReason?: string;
  output?: string;
  calls?: TraceNode[];
};

export function isAlchemyRpc(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes("alchemy.com");
  } catch {
    return url.toLowerCase().includes("alchemy");
  }
}

export function resolveGmxDiagnosticRpcProviders(primaryRpc?: string): string[] {
  const explicit = (process.env.GMX_DIAGNOSTIC_RPC_URL ?? process.env.ARB_DIAGNOSTIC_RPC_URL ?? "").trim();
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed) || isAlchemyRpc(trimmed)) return;
    seen.add(trimmed);
    out.push(trimmed);
  };
  if (explicit) push(explicit);
  for (const url of GMX_DIAGNOSTIC_RPC_PROVIDERS) push(url);
  if (primaryRpc) push(primaryRpc);
  return out;
}

export function scrapeJsonRpcRevertData(json: unknown): Hex | undefined {
  if (!json || typeof json !== "object") return undefined;
  const err = (json as { error?: { data?: unknown } }).error;
  const data = err?.data;
  if (typeof data === "string" && data.startsWith("0x") && data.length >= 10) return data as Hex;
  if (data && typeof data === "object") {
    const nested = (data as { data?: unknown }).data;
    if (typeof nested === "string" && nested.startsWith("0x") && nested.length >= 10) return nested as Hex;
  }
  return undefined;
}

export function extractTraceRevertHint(trace: unknown): { rawData?: Hex; hint?: string } | undefined {
  if (!trace || typeof trace !== "object") return undefined;
  const walk = (node: TraceNode): { rawData?: Hex; hint?: string } | undefined => {
    for (const child of node.calls ?? []) {
      const nested = walk(child);
      if (nested) return nested;
    }
    const output = node.output;
    if (typeof output === "string" && output.startsWith("0x") && output.length > 10) {
      return { rawData: output as Hex, hint: `${node.type ?? "CALL"} output=${output.slice(0, 18)}…` };
    }
    if (node.revertReason) return { hint: node.revertReason };
    if (node.error) return { hint: node.error };
    return undefined;
  };
  return walk(trace as TraceNode);
}

function rankDiagnostics(a: GmxFailedTxDiagnostics, b: GmxFailedTxDiagnostics): GmxFailedTxDiagnostics {
  const score = (d: GmxFailedTxDiagnostics) =>
    (d.errorLabel ? 8 : 0) + (d.decodedError ? 4 : 0) + (d.rawData && d.rawData !== "0x" ? 2 : 0) + (d.traceHint ? 1 : 0);
  return score(a) >= score(b) ? a : b;
}

function buildDiagnostics(input: {
  rawData?: Hex;
  decodedError?: string;
  rpcUrl?: string;
  traceHint?: string;
}): GmxFailedTxDiagnostics {
  const stripped = input.decodedError?.replace(/^\[GMX:[^\]]+\]\s*/, "");
  const errorLabel = stripped ? labelGmxSyntheticsError(stripped) : undefined;
  const parts: string[] = [];
  if (input.decodedError) parts.push(input.decodedError);
  else if (errorLabel) parts.push(`[GMX:${errorLabel}]`);
  if (input.rawData && input.rawData !== "0x") parts.push(`rawData=${input.rawData}`);
  if (input.traceHint) parts.push(`trace=${input.traceHint}`);
  if (input.rpcUrl) parts.push(`rpc=${input.rpcUrl}`);
  return {
    summary: parts.length ? parts.join(" | ") : "silent revert (no custom error data)",
    decodedError: input.decodedError,
    errorLabel,
    rawData: input.rawData,
    rpcUrl: input.rpcUrl,
    traceHint: input.traceHint,
  };
}

export async function replayGmxTxEthCall(input: {
  rpcUrl: string;
  tx: GmxTxReplayFields;
  fetchFn?: typeof fetch;
}): Promise<GmxFailedTxDiagnostics | undefined> {
  const call = {
    from: input.tx.from,
    to: input.tx.to,
    data: input.tx.input,
    value: `0x${input.tx.value.toString(16)}`,
    gas: `0x${input.tx.gas.toString(16)}`,
  };
  const json = await postArbitrumJsonRpc(
    { jsonrpc: "2.0", id: "gmx-replay", method: "eth_call", params: [call, input.tx.blockTag] },
    { fetchFn: input.fetchFn, preferredRpc: input.rpcUrl, providers: [input.rpcUrl], allowJsonRpcError: true },
  );
  const rawData = scrapeJsonRpcRevertData(json);
  if (!rawData) return undefined;
  const decodedError = decodeGmxRevertData(rawData) ?? undefined;
  return buildDiagnostics({ rawData, decodedError, rpcUrl: input.rpcUrl });
}

export async function fetchGmxTxCallTrace(input: {
  rpcUrl: string;
  txHash: Hex;
  fetchFn?: typeof fetch;
}): Promise<GmxFailedTxDiagnostics | undefined> {
  const json = await postArbitrumJsonRpc(
    {
      jsonrpc: "2.0",
      id: "gmx-trace",
      method: "debug_traceTransaction",
      params: [input.txHash, { tracer: "callTracer" }],
    },
    { fetchFn: input.fetchFn, preferredRpc: input.rpcUrl, providers: [input.rpcUrl] },
  );
  if (!json || typeof json !== "object" || (json as { error?: unknown }).error) return undefined;
  const hint = extractTraceRevertHint((json as { result?: unknown }).result);
  if (!hint) return undefined;
  const decodedError = hint.rawData ? decodeGmxRevertData(hint.rawData) ?? undefined : undefined;
  return buildDiagnostics({
    rawData: hint.rawData,
    decodedError,
    traceHint: hint.hint,
    rpcUrl: input.rpcUrl,
  });
}

export async function diagnoseGmxFailedTransaction(input: {
  tx: GmxTxReplayFields;
  txHash: Hex;
  primaryRpc?: string;
  fetchFn?: typeof fetch;
  primaryReplay?: GmxFailedTxDiagnostics;
}): Promise<GmxFailedTxDiagnostics | undefined> {
  let best = input.primaryReplay;
  const providers = resolveGmxDiagnosticRpcProviders(input.primaryRpc);
  for (const rpcUrl of providers) {
    const replay = await replayGmxTxEthCall({ rpcUrl, tx: input.tx, fetchFn: input.fetchFn });
    if (replay) best = best ? rankDiagnostics(best, replay) : replay;
    if (best?.decodedError && best.rawData && best.rawData !== "0x") break;
  }
  if (best?.decodedError && best.rawData && best.rawData !== "0x") return best;
  if (best?.errorLabel) return best;
  for (const rpcUrl of providers) {
    const traced = await fetchGmxTxCallTrace({ rpcUrl, txHash: input.txHash, fetchFn: input.fetchFn });
    if (traced) best = best ? rankDiagnostics(best, traced) : traced;
    if (best?.decodedError || best?.traceHint) break;
  }
  return best;
}
