/**
 * Retail Guard — lightweight EIP-1193 provider middleware (Zero-GC core only).
 */
import type {
  EIP1193Provider,
  RetailGuardConfig,
  RetailGuardRejectPayload,
  RetailSoilQuote,
} from "./types";
import {
  evaluateRetailIntentGate,
  evaluateRetailSoilGate,
  resolveVenueBitFromContract,
} from "./guard-engine";

export class RetailGuardRejectedError extends Error {
  readonly code: RetailGuardRejectPayload["code"];

  constructor(payload: RetailGuardRejectPayload) {
    super(`[Retail Guard] ${payload.code}: ${payload.message}`);
    this.name = "RetailGuardRejectedError";
    this.code = payload.code;
  }
}

const GUARDED_METHODS = new Set(["eth_sendTransaction", "eth_signTypedData_v4"]);

function parseTxTarget(params: unknown[]): string | undefined {
  const tx = params[0];
  if (!tx || typeof tx !== "object") return undefined;
  const to = (tx as { to?: string }).to;
  return typeof to === "string" ? to : undefined;
}

function parseTypedDataContract(params: unknown[]): string | undefined {
  const raw = params[1];
  if (typeof raw !== "string") return undefined;
  try {
    const parsed = JSON.parse(raw) as { domain?: { verifyingContract?: string } };
    return parsed.domain?.verifyingContract;
  } catch {
    return undefined;
  }
}

function resolveSoilQuote(
  config: RetailGuardConfig,
  method: string,
  params: unknown[],
): RetailSoilQuote | null {
  if (config.resolveSoilQuote) return config.resolveSoilQuote(method, params);
  if (method === "eth_sendTransaction" && config.soilQuote) return config.soilQuote;
  return null;
}

function resolveTargetVenueBit(
  config: RetailGuardConfig,
  method: string,
  params: unknown[],
): number {
  if (config.resolveVenueBit) return config.resolveVenueBit(method, params);
  if (method === "eth_sendTransaction") {
    return resolveVenueBitFromContract(parseTxTarget(params), config.contractVenueIndex);
  }
  if (method === "eth_signTypedData_v4") {
    return resolveVenueBitFromContract(parseTypedDataContract(params), config.contractVenueIndex);
  }
  return 0;
}

function runRetailGuards(
  config: RetailGuardConfig,
  method: string,
  params: unknown[],
): void {
  const soilQuote = resolveSoilQuote(config, method, params);
  if (soilQuote) {
    const soilReject = evaluateRetailSoilGate(soilQuote);
    if (soilReject) throw new RetailGuardRejectedError(soilReject);
  }

  const venueBit = resolveTargetVenueBit(config, method, params);
  const intentReject = evaluateRetailIntentGate(config, venueBit);
  if (intentReject) throw new RetailGuardRejectedError(intentReject);
}

/** Wrap an EIP-1193 provider with Citadel Retail Guard (0-Gas fail-closed pre-broadcast). */
export function withRetailGuardProvider(
  baseProvider: EIP1193Provider,
  config: RetailGuardConfig,
): EIP1193Provider {
  return {
    request: async (args) => {
      const method = args.method;
      const params = args.params ?? [];

      if (GUARDED_METHODS.has(method)) {
        runRetailGuards(config, method, params);
      }

      return baseProvider.request(args);
    },
  };
}

export { __resetRetailGuardStateForTests, isRetailGuardChannelSevered } from "./guard-engine";
