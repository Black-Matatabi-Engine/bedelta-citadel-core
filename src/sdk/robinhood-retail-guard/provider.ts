/**
 * SPDX-License-Identifier: Apache-2.0
 * Robinhood Retail Guard — EIP-1193 provider middleware (Apache wrapper · Wasm IP core).
 */
import { evaluateRetailRisk } from "./risk-evaluator";
import type { EIP1193Provider, RetailGuardConfig, RetailGuardRejectPayload } from "./types";

export class RetailGuardRejectedError extends Error {
  readonly code: RetailGuardRejectPayload["code"];
  readonly plainTextWarning: string;

  constructor(payload: RetailGuardRejectPayload) {
    super(`[Robinhood Retail Guard] ${payload.code}: ${payload.message}`);
    this.name = "RetailGuardRejectedError";
    this.code = payload.code;
    this.plainTextWarning = payload.plainTextWarning;
  }
}

const GUARDED_METHODS = new Set(["eth_sendTransaction", "eth_signTypedData_v4"]);

/** Wrap an EIP-1193 provider with Robinhood Retail Guard (0-Gas fail-closed pre-broadcast). */
export function withRetailGuardProvider(
  baseProvider: EIP1193Provider,
  config: RetailGuardConfig,
): EIP1193Provider {
  return {
    request: async (args) => {
      const method = args.method;
      const params = args.params ?? [];

      if (GUARDED_METHODS.has(method)) {
        const reject = evaluateRetailRisk(config, method, params);
        if (reject) throw new RetailGuardRejectedError(reject);
      }

      return baseProvider.request(args);
    },
  };
}

export { __resetRetailGuardStateForTests, isRetailGuardChannelSevered } from "./guard-engine";
