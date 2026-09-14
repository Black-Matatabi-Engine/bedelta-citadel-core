/**
 * SPDX-License-Identifier: BUSL-1.1
 * External venue / protocol soil flag collectors — split from soil-resistance.ts.
 */
import { resolveUsdAiProtocolMask } from "../../adapters/usdai/usdai-protocol-lane";
import { evaluateUsdAiSoilGate } from "../../adapters/usdai/usdai-soil-gate";
import { evaluatePendlePoolFactorySoilGate } from "../../adapters/pendle/pendle-pool-factory-adapter";
import {
  evaluatePendleCrossGuardSoilGate,
  evaluatePendleOracleSoilGateFromRegistry,
} from "../../guards/pendle-gmx-cross-guard";
import { isArbitrumStatusSequencerHealthy } from "../adapters/arbitrum-status-sentinel";
import { isRpcRadarSequencerHealthy } from "../adapters/rpc-radar";
import { isArbitrumGasGuardBlocked } from "../risk/arbitrum-gas-guard";
import { isSequencerSafe } from "../risk/sequencer-guard";
import { isSoftConfirmationSafe } from "../risk/soft-confirmation-guard";
import { evaluateCrossSpreadSoilGate } from "../yield/cross-spread-cache";
import { evaluateGmxPriceImpactSoilGate } from "../yield/gmx-v2-price-impact";
import { shouldBypassOracleLagDeadlock, shouldBypassSoftConfirmationProbe } from "../../core/soil-resistance-core";
import { evaluateHlOrderbookGapGuard } from "./hl-orderbook-gap-guard";
import { evaluateRwaSettlementLock } from "./rwa-settlement-lock";
import {
  appendSoilExternalReasons,
  SOIL_REASON_GAS_GUARD,
  SOIL_REASON_RPC_OUTAGE,
  SOIL_REASON_SEQUENCER_UNSAFE,
  SOIL_REASON_SOFT_CONFIRMATION,
  SOIL_REASON_STATUS_ANOMALY,
  SOIL_REASON_TSUNAMI,
  type SoilReasonScratch,
} from "./soil-reason-codes";
import { isTsunamiShieldWindow } from "./time-gates";
import type { SoilResistanceInput } from "./soil-resistance-types";

export function collectExternalSoilFlags(
  input: SoilResistanceInput,
  minDepthUsd: number,
  scratch: SoilReasonScratch,
): void {
  const { symbol, depthUsd } = input;
  const atMs = input.at?.getTime();

  if (isTsunamiShieldWindow(input.at)) scratch.flags |= SOIL_REASON_TSUNAMI;
  if (!isSequencerSafe(atMs)) scratch.flags |= SOIL_REASON_SEQUENCER_UNSAFE;
  if (!isArbitrumStatusSequencerHealthy(atMs)) scratch.flags |= SOIL_REASON_STATUS_ANOMALY;
  if (!isRpcRadarSequencerHealthy(atMs)) scratch.flags |= SOIL_REASON_RPC_OUTAGE;
  if (isArbitrumGasGuardBlocked() && !shouldBypassOracleLagDeadlock()) {
    scratch.flags |= SOIL_REASON_GAS_GUARD;
  }
  if (!shouldBypassSoftConfirmationProbe() && !isSoftConfirmationSafe(atMs)) {
    scratch.flags |= SOIL_REASON_SOFT_CONFIRMATION;
  }

  if (input.crossSpread) {
    const spreadGate = evaluateCrossSpreadSoilGate(input.crossSpread);
    if (spreadGate.triggered) appendSoilExternalReasons(scratch, spreadGate.reasons);
  }
  if (input.gmxPriceImpact) {
    const impactGate = evaluateGmxPriceImpactSoilGate(input.gmxPriceImpact);
    if (impactGate.triggered) appendSoilExternalReasons(scratch, impactGate.reasons);
  }
  if (input.pendleCrossGuard) {
    const pendleGate = evaluatePendleCrossGuardSoilGate(input.pendleCrossGuard);
    if (pendleGate.triggered) appendSoilExternalReasons(scratch, pendleGate.reasons);
  }
  if (input.pendleOracle) {
    const oracleGate = evaluatePendleOracleSoilGateFromRegistry(input.pendleOracle);
    if (oracleGate.triggered) appendSoilExternalReasons(scratch, oracleGate.reasons);
  }
  if (input.pendlePoolFactory) {
    const poolGate = evaluatePendlePoolFactorySoilGate(input.pendlePoolFactory);
    if (poolGate.triggered) appendSoilExternalReasons(scratch, poolGate.reasons);
  }
  if (input.usdai) {
    scratch.protocolMask |= resolveUsdAiProtocolMask(input.usdai);
    const usdaiGate = evaluateUsdAiSoilGate(input.usdai);
    if (usdaiGate.triggered) appendSoilExternalReasons(scratch, usdaiGate.reasons);
  }
  const hlOrderbookGap = evaluateHlOrderbookGapGuard({
    symbol,
    depthUsd,
    minDepthUsd,
    requestedLeverage: input.requestedLeverage,
    at: input.at,
  });
  if (hlOrderbookGap.triggered) appendSoilExternalReasons(scratch, hlOrderbookGap.reasons);
  const rwaSettlement = evaluateRwaSettlementLock({ symbol, at: input.at });
  if (rwaSettlement.locked) appendSoilExternalReasons(scratch, rwaSettlement.reasons);
}
