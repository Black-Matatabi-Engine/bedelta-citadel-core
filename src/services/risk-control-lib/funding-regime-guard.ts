/**
 * Funding-regime leverage scaling + rebalance halt wired to R20 protective hardlock.
 */

import { severCircuitBreakerPipeline } from "../root-protection-lib/circuit-breaker-sever";
import { emitRiskLog, isoNow } from "./logging";
import {
  evaluateFundingRegime,
  resolveFundingLeverage,
  scaleRebalanceNotionalUsd,
  FUNDING_LEVERAGE_MILD_FLOOR,
  type FundingRegime,
  type FundingRegimeContext,
} from "../../core/funding-regime-core";

export {
  FUNDING_LEVERAGE_NORMAL,
  FUNDING_LEVERAGE_MILD_CEILING,
  FUNDING_LEVERAGE_MILD_FLOOR,
  resolveFundingLeverage,
  scaleRebalanceNotionalUsd,
} from "../../core/funding-regime-core";

export interface FundingRegimePolicyInput extends FundingRegimeContext {
  currentRateBps: number;
  symbol?: string;
  isRebalance?: boolean;
  requestedLeverage?: number;
  baseNotionalUsd?: number;
}

export interface FundingRegimePolicyResult {
  regime: FundingRegime;
  targetLeverage: number;
  scaledNotionalUsd: number;
  haltRebalancing: boolean;
  rebalanceAllowed: boolean;
  routeToBaseYield: boolean;
  r20Triggered: boolean;
  reasons: string[];
}

/** Evaluate funding regime, apply leverage scaling, and escalate prolonged-negative to R20. */
export function evaluateFundingRegimePolicy(
  input: FundingRegimePolicyInput,
): FundingRegimePolicyResult {
  const regime = evaluateFundingRegime(input.currentRateBps, input);
  const targetLeverage = resolveFundingLeverage(regime, input);
  const baseNotional = Math.max(0, Number(input.baseNotionalUsd) || 0);
  const scaledNotionalUsd = scaleRebalanceNotionalUsd(baseNotional, targetLeverage);
  const reasons: string[] = [];

  if (regime === "PROLONGED_NEGATIVE") {
    reasons.push("FUNDING_PROLONGED_NEGATIVE_HALT");
    severCircuitBreakerPipeline("R20");
    emitRiskLog({
      level: "error",
      module: "risk-control",
      event: "CRI_HARDLOCK",
      symbol: input.symbol ?? "ETH",
      timestamp: isoNow(),
      message:
        "Funding regime PROLONGED_NEGATIVE — rebalance halted, R20 hardlock engaged, routing to flat/base yield",
      details: {
        currentRateBps: input.currentRateBps,
        targetLeverage,
        haltRebalancing: true,
        routeToBaseYield: true,
        r20Triggered: true,
      },
    });

    return {
      regime,
      targetLeverage: FUNDING_LEVERAGE_MILD_FLOOR,
      scaledNotionalUsd: scaleRebalanceNotionalUsd(baseNotional, FUNDING_LEVERAGE_MILD_FLOOR),
      haltRebalancing: true,
      rebalanceAllowed: false,
      routeToBaseYield: true,
      r20Triggered: true,
      reasons,
    };
  }

  if (regime === "MILD_NEGATIVE") {
    reasons.push(`FUNDING_MILD_NEGATIVE_LEVERAGE=${targetLeverage.toFixed(2)}x`);
  }

  if (
    input.requestedLeverage !== undefined &&
    Number.isFinite(input.requestedLeverage) &&
    input.requestedLeverage > targetLeverage + 1e-6
  ) {
    reasons.push(
      `FUNDING_LEVERAGE_CAP=${targetLeverage.toFixed(2)}<${input.requestedLeverage.toFixed(2)}`,
    );
  }

  return {
    regime,
    targetLeverage,
    scaledNotionalUsd,
    haltRebalancing: false,
    rebalanceAllowed: true,
    routeToBaseYield: false,
    r20Triggered: false,
    reasons,
  };
}
