/**
 * Jupiter Solana ingress guard — slippage-protected quote validation before 2PC.
 */

import type { IntentLeg } from "../../core/intent-ledger";
import {
  PGATE_MAX_SLIPPAGE_BPS,
  evaluateJupiterSoilResistance,
  fetchJupiterQuote,
  type FetchJupiterQuoteOptions,
  type JupiterQuote,
  type JupiterSoilEvaluation,
} from "./index";

export interface JupiterIngressValidation {
  allowed: boolean;
  readyFor2Pc: boolean;
  reasons: string[];
  quote: JupiterQuote;
  evaluation: JupiterSoilEvaluation;
  proposedLeg: IntentLeg | null;
}

export interface FetchAndValidateJupiterIngressInput {
  inputMint: string;
  outputMint: string;
  amountUsd: number;
  symbol?: string;
  maxSlippageBps?: number;
  fetchOptions?: FetchJupiterQuoteOptions;
}

export function buildJupiterIntentLeg(
  sizeUsd: number,
  symbol?: string,
): IntentLeg {
  return {
    venue: "JUPITER",
    side: "BUY",
    sizeUsd,
    symbol: symbol ?? "SOL",
  };
}

/** Validate quote slippage/impact — blocks 2PC when combined slippage exceeds cap. */
export function validateJupiterSlippageFor2Pc(
  quote: JupiterQuote,
  maxSlippageBps: number = PGATE_MAX_SLIPPAGE_BPS,
  symbol?: string,
): JupiterIngressValidation {
  const evaluation = evaluateJupiterSoilResistance(quote, maxSlippageBps);
  const reasons = [...evaluation.reasons];

  if (evaluation.tripped) {
    reasons.push("JUPITER_2PC_SLIPPAGE_BLOCK");
  }

  const allowed = !evaluation.tripped;
  const readyFor2Pc = allowed;

  return {
    allowed,
    readyFor2Pc,
    reasons,
    quote,
    evaluation,
    proposedLeg: readyFor2Pc
      ? buildJupiterIntentLeg(quote.amountUsd, symbol)
      : null,
  };
}

/** Fetch Jupiter quote and validate ingress before entering 2PC prepare. */
export async function fetchAndValidateJupiterIngress(
  input: FetchAndValidateJupiterIngressInput,
): Promise<JupiterIngressValidation> {
  const maxSlippageBps = input.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS;
  const quote = await fetchJupiterQuote(
    input.inputMint,
    input.outputMint,
    input.amountUsd,
    {
      ...input.fetchOptions,
      slippageBps: input.fetchOptions?.slippageBps ?? maxSlippageBps,
    },
  );
  return validateJupiterSlippageFor2Pc(quote, maxSlippageBps, input.symbol);
}
