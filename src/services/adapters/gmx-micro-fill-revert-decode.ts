/** GMX micro-fill simulateContract revert decode helpers. */
import {
  BaseError, ContractFunctionRevertedError, decodeAbiParameters, type Hex,
} from "viem";
import { decodeGmxSyntheticsError } from "./gmx-synthetics-errors";

const ERROR_STRING_SELECTOR = "0x08c379a0";
const PANIC_SELECTOR = "0x4e487b71";

export type GmxSimulateRevertDetails = {
  message: string;
  reason?: string;
  signature?: string;
  rawData?: Hex;
  decodedError?: string;
  causeData?: string;
};

function readHexData(value: unknown): Hex | undefined {
  if (typeof value !== "string" || !value.startsWith("0x")) return undefined;
  return value as Hex;
}

function scrapeRevertData(err: unknown, depth = 0): Hex | undefined {
  if (!err || typeof err !== "object" || depth > 6) return undefined;
  const o = err as Record<string, unknown>;
  for (const key of ["data", "raw", "result"]) {
    const hex = readHexData(o[key]);
    if (hex && hex.length > 10) return hex;
  }
  return scrapeRevertData(o.cause, depth + 1);
}

function formatDecodedContractError(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const { errorName, args } = data as { errorName?: string; args?: readonly unknown[] };
  if (!errorName) return undefined;
  if (errorName === "Error" && args?.[0] != null) return `Error("${String(args[0])}")`;
  if (errorName === "Panic" && args?.[0] != null) return `Panic(0x${BigInt(args[0] as bigint).toString(16)})`;
  return args?.length ? `${errorName}(${args.map(String).join(", ")})` : errorName;
}

function decodeGmxRevertData(data: Hex): string | null {
  const selector = data.slice(0, 10).toLowerCase();
  const gmxDecoded = decodeGmxSyntheticsError(data);
  if (gmxDecoded) return gmxDecoded;
  try {
    if (selector === ERROR_STRING_SELECTOR) {
      const [msg] = decodeAbiParameters([{ type: "string" }], `0x${data.slice(10)}` as Hex);
      return `Error("${msg}")`;
    }
    if (selector === PANIC_SELECTOR) {
      const [code] = decodeAbiParameters([{ type: "uint256" }], `0x${data.slice(10)}` as Hex);
      return `Panic(0x${code.toString(16)})`;
    }
    return `CustomError(selector=${selector}, payload=${data})`;
  } catch {
    return `UndecodedRevert(data=${data})`;
  }
}

export function extractGmxSimulateRevertDetails(err: unknown): GmxSimulateRevertDetails {
  const parts: string[] = [];
  let reason: string | undefined;
  let signature: string | undefined;
  let rawData: Hex | undefined;
  let decodedError: string | undefined;
  const causeData = scrapeRevertData(err);

  if (err instanceof BaseError) {
    const rev = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (rev instanceof ContractFunctionRevertedError) {
      reason = rev.reason;
      signature = rev.signature;
      rawData = readHexData((rev as { raw?: unknown }).raw) ?? scrapeRevertData(rev);
      decodedError = formatDecodedContractError(rev.data) ?? undefined;
      if (reason) parts.push(`reason=${reason}`);
      if (signature) parts.push(`signature=${signature}`);
      if (rawData) {
        parts.push(`rawData=${rawData}`);
        decodedError = decodedError ?? decodeGmxRevertData(rawData) ?? undefined;
      }
      if (decodedError) parts.push(`decoded=${decodedError}`);
    }
    if (causeData && causeData !== rawData) {
      parts.push(`causeData=${causeData}`);
      if (!decodedError) decodedError = decodeGmxRevertData(causeData) ?? undefined;
      if (decodedError && !parts.some((p) => p.startsWith("decoded="))) parts.push(`decoded=${decodedError}`);
    }
    if (parts.length === 0) parts.push(err.shortMessage ?? err.message);
  } else {
    parts.push(err instanceof Error ? err.message : String(err));
    if (causeData) {
      rawData = causeData;
      decodedError = decodeGmxRevertData(causeData) ?? undefined;
      parts.push(`causeData=${causeData}`);
      if (decodedError) parts.push(`decoded=${decodedError}`);
    }
  }
  return { message: parts.join(" | "), reason, signature, rawData, decodedError, causeData };
}

export function formatGmxSimulateRevert(err: unknown): string {
  return extractGmxSimulateRevertDetails(err).message;
}

function isEmptyRevertHex(hex?: string): boolean {
  return hex === "0x" || hex === "";
}

export function isSilentGmxSimulateRevert(err: unknown): boolean {
  const { rawData, causeData } = extractGmxSimulateRevertDetails(err);
  if (isEmptyRevertHex(rawData) || isEmptyRevertHex(causeData)) return true;
  if (err instanceof BaseError) {
    const rev = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (rev instanceof ContractFunctionRevertedError) {
      const raw = readHexData((rev as { raw?: unknown }).raw);
      if (isEmptyRevertHex(raw)) return true;
    }
  }
  return false;
}
