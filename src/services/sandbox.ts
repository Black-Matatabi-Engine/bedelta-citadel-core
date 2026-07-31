/**
 * Zero-key cross-chain dry-run sandbox — HL / Polymarket / Jupiter simulation.
 */

import {
  evaluateGlobalRiskPolicy,
  type RiskIntent,
  type RiskVenue,
} from "../core/risk-engine";
import { R20_LOCKED, buildSystemState, type SystemState } from "../core/state";
import {
  HardlockError,
  RiskLimitExceeded,
  checkSoilResistance,
  isR20Locked,
  vineWrapProtection,
} from "../core/risk";
import { checkFoolProofGuard } from "./fool-proof-guard";
import {
  DEFAULT_TAIL_HEDGE_THRESHOLD,
  evaluateTailHedgeTrigger,
} from "../adapters/polymarket/index";
import {
  PGATE_MAX_SLIPPAGE_BPS,
  evaluateJupiterSoilResistance,
  parseJupiterQuote,
} from "../adapters/jupiter/index";

export type SandboxGate =
  | "R20_LOCK"
  | "ROOT_PROTECTION"
  | "FOOL_PROOF_GUARD"
  | "SOIL_RESISTANCE"
  | "POLYMARKET_TAIL_HEDGE"
  | "JUPITER_SLIPPAGE"
  | "HL_DRY_RUN"
  | "POLYMARKET_DRY_RUN"
  | "JUPITER_DRY_RUN";

export interface SandboxDiagnosticReport {
  isAllowed: boolean;
  venue: RiskVenue;
  zeroKeyDryRun: true;
  passedGates: SandboxGate[];
  failedGate?: SandboxGate;
  reason?: string;
  suggestedHttpCode?: number;
  simulatedExecutionTimeMs: number;
  executionPath: string[];
}

function resolveMockState(mockState?: Partial<SystemState>): SystemState {
  const base = buildSystemState({
    accountBalanceUsd: mockState?.accountBalanceUsd,
    currentCri: mockState?.currentCri,
    skipHardlockAssert: true,
  });
  const cri = mockState?.currentCri ?? base.currentCri;
  const hardlock = mockState?.hardlock ?? base.hardlock;

  return {
    ...base,
    ...mockState,
    dynamicMaxSL: mockState?.dynamicMaxSL ?? base.dynamicMaxSL,
    hudState: mockState?.hudState ?? base.hudState,
    signingChannelOpen:
      mockState?.signingChannelOpen ?? !(hardlock || cri <= 0),
  };
}

function venueDryRunGate(venue: RiskVenue): SandboxGate {
  switch (venue) {
    case "HL":
      return "HL_DRY_RUN";
    case "POLYMARKET":
      return "POLYMARKET_DRY_RUN";
    case "JUPITER":
      return "JUPITER_DRY_RUN";
  }
}

function buildReport(args: {
  intent: RiskIntent;
  passedGates: SandboxGate[];
  failedGate?: SandboxGate;
  reason?: string;
  suggestedHttpCode?: number;
  startedAt: number;
  executionPath: string[];
}): SandboxDiagnosticReport {
  const isAllowed = !args.failedGate;
  return {
    isAllowed,
    venue: args.intent.venue,
    zeroKeyDryRun: true,
    passedGates: args.passedGates,
    failedGate: args.failedGate,
    reason: args.reason,
    suggestedHttpCode: args.suggestedHttpCode,
    simulatedExecutionTimeMs: Math.max(0, Date.now() - args.startedAt),
    executionPath: args.executionPath,
  };
}

/** Zero-key dry-run simulation with gate-by-gate diagnostic path. */
export function simulateTransactionIntent(
  intent: RiskIntent,
  mockState?: Partial<SystemState>,
): SandboxDiagnosticReport {
  const startedAt = Date.now();
  const passedGates: SandboxGate[] = [];
  const executionPath: string[] = ["sandbox:start"];
  const state = resolveMockState(mockState);
  const enrichedIntent: RiskIntent = { ...intent, systemState: state };

  executionPath.push(`venue:${intent.venue}`);
  executionPath.push("mode:zero-key-dry-run");

  if (isR20Locked(state)) {
    executionPath.push("gate:R20_LOCK:fail");
    return buildReport({
      intent,
      passedGates,
      failedGate: "R20_LOCK",
      reason: `${R20_LOCKED} — signing channel severed`,
      suggestedHttpCode: 403,
      startedAt,
      executionPath,
    });
  }
  passedGates.push("R20_LOCK");
  executionPath.push("gate:R20_LOCK:pass");

  try {
    vineWrapProtection({
      symbol: intent.symbol ?? intent.venue,
      estimatedLossUsd: intent.amountUsd,
      accountBalanceUsd: state.accountBalanceUsd,
      criHardlock: state.hardlock,
    });
  } catch (err) {
    if (err instanceof HardlockError) {
      executionPath.push("gate:ROOT_PROTECTION:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "ROOT_PROTECTION",
        reason: err.message,
        suggestedHttpCode: 403,
        startedAt,
        executionPath,
      });
    }
    if (err instanceof RiskLimitExceeded) {
      executionPath.push("gate:ROOT_PROTECTION:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "ROOT_PROTECTION",
        reason: err.message,
        suggestedHttpCode: 422,
        startedAt,
        executionPath,
      });
    }
    throw err;
  }
  passedGates.push("ROOT_PROTECTION");
  executionPath.push("gate:ROOT_PROTECTION:pass");

  const foolProof = checkFoolProofGuard({
    order: {
      positionValueUsd: intent.amountUsd,
      leverage: intent.foolProof?.leverage,
      contractTarget: intent.foolProof?.contractTarget,
      profile: intent.foolProof?.profile,
      reduceOnly: intent.foolProof?.reduceOnly,
    },
    accountBalanceUsd: state.accountBalanceUsd,
  });
  if (foolProof.rejected) {
    executionPath.push("gate:FOOL_PROOF_GUARD:fail");
    return buildReport({
      intent,
      passedGates,
      failedGate: "FOOL_PROOF_GUARD",
      reason: `Fool-proof guard rejected — ${foolProof.reasons.join("|")}`,
      suggestedHttpCode: 422,
      startedAt,
      executionPath,
    });
  }
  passedGates.push("FOOL_PROOF_GUARD");
  executionPath.push("gate:FOOL_PROOF_GUARD:pass");

  if (intent.soil) {
    const soil = checkSoilResistance(intent.soil);
    if (soil.tripped) {
      executionPath.push("gate:SOIL_RESISTANCE:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "SOIL_RESISTANCE",
        reason: `Soil resistance tripped — ${soil.reasons.join("|")}`,
        suggestedHttpCode: 422,
        startedAt,
        executionPath,
      });
    }
    passedGates.push("SOIL_RESISTANCE");
    executionPath.push("gate:SOIL_RESISTANCE:pass");
  }

  if (intent.venue === "POLYMARKET" && intent.tailHedge) {
    const threshold =
      intent.tailHedge.thresholdProb ?? DEFAULT_TAIL_HEDGE_THRESHOLD;
    if (!evaluateTailHedgeTrigger(intent.tailHedge.marketPrice, threshold)) {
      executionPath.push("gate:POLYMARKET_TAIL_HEDGE:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "POLYMARKET_TAIL_HEDGE",
        reason: `Tail hedge trigger not met — marketPrice ${intent.tailHedge.marketPrice} > threshold ${threshold}`,
        suggestedHttpCode: 422,
        startedAt,
        executionPath,
      });
    }
    passedGates.push("POLYMARKET_TAIL_HEDGE");
    executionPath.push("gate:POLYMARKET_TAIL_HEDGE:pass");
  }

  if (intent.venue === "JUPITER" && intent.jupiter) {
    const quote = parseJupiterQuote(intent.jupiter.quote, intent.amountUsd);
    const evaluation = evaluateJupiterSoilResistance(
      quote,
      intent.jupiter.maxSlippageBps ?? PGATE_MAX_SLIPPAGE_BPS,
    );
    if (evaluation.tripped) {
      executionPath.push("gate:JUPITER_SLIPPAGE:fail");
      return buildReport({
        intent,
        passedGates,
        failedGate: "JUPITER_SLIPPAGE",
        reason: evaluation.reasons.join("|"),
        suggestedHttpCode: 422,
        startedAt,
        executionPath,
      });
    }
    passedGates.push("JUPITER_SLIPPAGE");
    executionPath.push("gate:JUPITER_SLIPPAGE:pass");
  }

  const dryRunGate = venueDryRunGate(intent.venue);
  passedGates.push(dryRunGate);
  executionPath.push(`gate:${dryRunGate}:pass`);
  executionPath.push("sandbox:complete");

  const policy = evaluateGlobalRiskPolicy(enrichedIntent);
  if (!policy.isAllowed) {
    return buildReport({
      intent,
      passedGates: passedGates.slice(0, -1),
      failedGate: dryRunGate,
      reason: policy.reason,
      suggestedHttpCode: policy.suggestedHttpCode,
      startedAt,
      executionPath: [...executionPath.slice(0, -1), `gate:${dryRunGate}:fail`],
    });
  }

  return buildReport({
    intent,
    passedGates,
    startedAt,
    executionPath,
  });
}
