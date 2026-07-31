/**
 * Solana DEX execution gates — assert soil + dry-run stub.
 */

import { R20_HARDLOCK } from "../../config/constants";
import {
  evaluateSolanaDepthMatrix,
  evaluateSolanaSoilResistance,
} from "./depth-matrix";
import type {
  SolanaDexExecutionResult,
  SolanaDexIntent,
  SolanaDexPipeInput,
  SolanaSoilEvaluation,
  SolanaSoilProbe,
} from "./types";
import { SolanaDexBlockedError, SolanaR20HardlockError } from "./types";

/** Physical gate — throws on soil trip or R20_HARDLOCK */
export function assertSolanaDexGates(
  probe: SolanaSoilProbe,
  matrix?: SolanaDexPipeInput,
): SolanaSoilEvaluation {
  const evaluation = matrix
    ? evaluateSolanaDepthMatrix(matrix)
    : evaluateSolanaSoilResistance(probe);

  if (evaluation.r20Hardlock) {
    throw new SolanaR20HardlockError(
      evaluation.aggregatedDepth?.r20Reason ??
        `${R20_HARDLOCK} — Solana depth matrix failsafe`,
      evaluation.reasons,
    );
  }

  if (evaluation.tripped) {
    throw new SolanaDexBlockedError(
      "Solana DEX soil resistance tripped — execution blocked",
      evaluation.reasons,
    );
  }

  return evaluation;
}

/** Stub execution — validates gates then returns dry-run result */
export function executeSolanaDexIntent(
  intent: SolanaDexIntent,
  options: { dryRun?: boolean } = {},
): SolanaDexExecutionResult {
  const soil = assertSolanaDexGates(intent.soil, intent.matrix);
  const activePipes =
    soil.aggregatedDepth?.activePipes ?? (soil.ok ? [intent.venue] : []);

  return {
    allowed: true,
    venue: intent.venue,
    soil,
    adjustedPriorityFeeLamports: soil.adjustedPriorityFeeLamports,
    dryRun: options.dryRun ?? true,
    activePipes,
  };
}
