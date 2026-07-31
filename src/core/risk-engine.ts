/**
 * Unified cross-chain risk engine — HL + Polymarket + Jupiter policy gate.
 */

import {
  DEFAULT_TAIL_HEDGE_THRESHOLD,
  evaluateTailHedgeTrigger,
} from "../adapters/polymarket/index";
import {
  PGATE_MAX_SLIPPAGE_BPS,
  evaluateJupiterSoilResistance,
  parseJupiterQuote,
  type JupiterQuoteWire,
} from "../adapters/jupiter/index";
import { R20_LOCKED, readActiveSystemState, type SystemState } from "./state";
import {
  checkFoolProofGuard,
  type FoolProofProfile,
} from "../services/fool-proof-guard";
import {
  HardlockError,
  RiskLimitExceeded,
  checkSoilResistance,
  isR20Locked,
  vineWrapProtection,
  type SoilResistanceInput,
} from "./risk";

export type RiskVenue = "HL" | "POLYMARKET" | "JUPITER";

export interface TailHedgeIntent {
  marketPrice: number;
  thresholdProb?: number;
}

export interface JupiterRiskIntent {
  quote: JupiterQuoteWire;
  maxSlippageBps?: number;
}

export interface FoolProofIntent {
  leverage?: number;
  contractTarget?: string;
  profile?: FoolProofProfile;
  reduceOnly?: boolean;
}

export interface RiskIntent {
  venue: RiskVenue;
  amountUsd: number;
  symbol?: string;
  systemState?: SystemState;
  foolProof?: FoolProofIntent;
  soil?: SoilResistanceInput;
  tailHedge?: TailHedgeIntent;
  jupiter?: JupiterRiskIntent;
}

export interface GlobalRiskPolicyResult {
  isAllowed: boolean;
  reason?: string;
  suggestedHttpCode?: number;
}

function deny(
  reason: string,
  suggestedHttpCode: number,
): GlobalRiskPolicyResult {
  return { isAllowed: false, reason, suggestedHttpCode };
}

function evaluateRootProtection(
  intent: RiskIntent,
  state: SystemState,
): GlobalRiskPolicyResult | null {
  try {
    vineWrapProtection({
      symbol: intent.symbol ?? intent.venue,
      estimatedLossUsd: intent.amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock,
    });
    return null;
  } catch (err) {
    if (err instanceof HardlockError) {
      return deny(err.message, 403);
    }
    if (err instanceof RiskLimitExceeded) {
      return deny(err.message, 422);
    }
    throw err;
  }
}

function evaluateFoolProofGate(
  intent: RiskIntent,
  state: SystemState,
): GlobalRiskPolicyResult | null {
  const result = checkFoolProofGuard({
    order: {
      positionValueUsd: intent.amountUsd,
      leverage: intent.foolProof?.leverage,
      contractTarget: intent.foolProof?.contractTarget,
      profile: intent.foolProof?.profile,
      reduceOnly: intent.foolProof?.reduceOnly,
    },
    accountBalanceUsd: state.accountBalanceUsd,
  });
  if (!result.rejected) return null;
  return deny(
    `Fool-proof guard rejected — ${result.reasons.join("|")}`,
    422,
  );
}

function evaluateSoilGate(
  soil: SoilResistanceInput,
): GlobalRiskPolicyResult | null {
  const result = checkSoilResistance(soil);
  if (!result.tripped) return null;
  return deny(
    `Soil resistance tripped — ${result.reasons.join("|")}`,
    422,
  );
}

function evaluatePolymarketGate(
  tailHedge: TailHedgeIntent,
): GlobalRiskPolicyResult | null {
  const threshold = tailHedge.thresholdProb ?? DEFAULT_TAIL_HEDGE_THRESHOLD;
  if (evaluateTailHedgeTrigger(tailHedge.marketPrice, threshold)) {
    return null;
  }
  return deny(
    `Tail hedge trigger not met — marketPrice ${tailHedge.marketPrice} > threshold ${threshold}`,
    422,
  );
}

function evaluateJupiterGate(
  intent: RiskIntent,
  jupiter: JupiterRiskIntent,
): GlobalRiskPolicyResult | null {
  const quote = parseJupiterQuote(jupiter.quote, intent.amountUsd);
  const evaluation = evaluateJupiterSoilResistance(
    quote,
    jupiter.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS,
  );
  if (!evaluation.tripped) return null;
  return deny(evaluation.reasons.join("|"), 422);
}

/** Single cross-chain policy evaluation for HL, Polymarket, and Jupiter intents. */
export function evaluateGlobalRiskPolicy(
  intent: RiskIntent,
): GlobalRiskPolicyResult {
  const state = intent.systemState ?? readActiveSystemState();

  if (isR20Locked(state)) {
    return deny(`${R20_LOCKED} — signing channel severed`, 403);
  }

  const rootBlock = evaluateRootProtection(intent, state);
  if (rootBlock) return rootBlock;

  const foolProofBlock = evaluateFoolProofGate(intent, state);
  if (foolProofBlock) return foolProofBlock;

  if (intent.soil) {
    const soilBlock = evaluateSoilGate(intent.soil);
    if (soilBlock) return soilBlock;
  }

  if (intent.venue === "POLYMARKET" && intent.tailHedge) {
    const tailBlock = evaluatePolymarketGate(intent.tailHedge);
    if (tailBlock) return tailBlock;
  }

  if (intent.venue === "JUPITER" && intent.jupiter) {
    const jupiterBlock = evaluateJupiterGate(intent, intent.jupiter);
    if (jupiterBlock) return jupiterBlock;
  }

  return { isAllowed: true };
}
