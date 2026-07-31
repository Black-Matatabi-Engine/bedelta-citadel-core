/**
 * Solana 1:3 depth matrix — Touchwood pipe isolation + soil evaluation.
 * @theory Kyle (1985) — composite liquidity / price-impact prior.
 * @see checkSoilResistance — cross-venue slippage matrix.
 */

import { checkSoilResistance } from "../../core/risk";
import {
  R20_HARDLOCK,
  SOLANA_BASE_PRIORITY_FEE_LAMPORTS,
} from "../../config/constants";
import {
  adjustPriorityFee,
  checkR15OracleDeviation,
  checkRaydiumTickCollapse,
  checkSlotLatency,
  checkTouchwoodJupiterOracle,
  resolveJupiterRoutingDepthUsd,
  resolvePhoenixDepthUsd,
  resolvePhoenixMidPx,
  resolveRaydiumDepthUsd,
} from "./guards";
import type {
  AggregatedSolanaDepth,
  SolanaDexPipeInput,
  SolanaSoilEvaluation,
  SolanaSoilProbe,
  TouchwoodPipeStatus,
} from "./types";
import { SOLANA_DEPTH_PIPES } from "./types";

export function evaluateTouchwoodPipes(
  input: SolanaDexPipeInput,
): TouchwoodPipeStatus[] {
  const statuses: TouchwoodPipeStatus[] = [];

  if (input.phoenix) {
    const slot = checkSlotLatency(input.phoenix.slotLatencyMs);
    const depthUsd = resolvePhoenixDepthUsd(
      input.phoenix.snapshot,
      input.phoenix.depthUsd,
    );
    statuses.push({
      dex: "PHOENIX_CLOB",
      active: slot.pass,
      severed: !slot.pass,
      depthUsd: slot.pass ? depthUsd : 0,
      ...(slot.reason !== undefined ? { reason: slot.reason } : {}),
    });
  }

  if (input.raydium) {
    const tick = checkRaydiumTickCollapse(input.raydium.snapshot);
    const depthUsd = resolveRaydiumDepthUsd(
      input.raydium.snapshot,
      input.raydium.depthUsd,
    );
    statuses.push({
      dex: "RAYDIUM_CLMM",
      active: tick.pass,
      severed: !tick.pass,
      depthUsd: tick.pass ? depthUsd : 0,
      ...(tick.reason !== undefined ? { reason: tick.reason } : {}),
    });
  }

  if (input.jupiter) {
    const oracle = checkTouchwoodJupiterOracle(
      input.jupiter.pythOraclePx,
      input.jupiter.spotPx,
    );
    const depthUsd = resolveJupiterRoutingDepthUsd(
      input.jupiter.quote,
      input.jupiter.routingDepthUsd,
    );
    statuses.push({
      dex: "JUPITER_AGGREGATOR",
      active: oracle.pass,
      severed: !oracle.pass,
      depthUsd: oracle.pass ? depthUsd : 0,
      ...(oracle.reason !== undefined ? { reason: oracle.reason } : {}),
    });
  }

  return statuses;
}

/** 1:3 Depth Aggregation — composite liquidity from Phoenix + Raydium + Jupiter. */
export function aggregateSolanaDepth1x3(
  input: SolanaDexPipeInput,
): AggregatedSolanaDepth {
  const pipeStatuses = evaluateTouchwoodPipes(input);
  const activePipes = pipeStatuses.filter((p) => p.active).map((p) => p.dex);
  const severedPipes = pipeStatuses.filter((p) => p.severed).map((p) => p.dex);

  const activeDepths = pipeStatuses.filter((p) => p.active).map((p) => p.depthUsd);
  const totalDepthUsd = activeDepths.reduce((s, d) => s + d, 0);
  const compositeDepthUsd =
    activeDepths.length > 0 ? totalDepthUsd / activeDepths.length : 0;

  const allSevered =
    pipeStatuses.length === SOLANA_DEPTH_PIPES.length && activePipes.length === 0;

  const partialMatrix =
    pipeStatuses.length > 0 &&
    pipeStatuses.length < SOLANA_DEPTH_PIPES.length &&
    activePipes.length === 0;

  const r20Hardlock = allSevered || partialMatrix;

  let r20Reason: string | undefined;
  if (r20Hardlock) {
    const severReasons = pipeStatuses
      .filter((p) => p.severed && p.reason)
      .map((p) => `${p.dex}:${p.reason}`);
    r20Reason = `${R20_HARDLOCK} — all Solana DEX pipes severed [${severReasons.join("|")}]`;
  }

  return {
    totalDepthUsd,
    compositeDepthUsd,
    activePipes,
    severedPipes,
    pipeStatuses,
    r20Hardlock,
    ...(r20Reason !== undefined ? { r20Reason } : {}),
  };
}

function resolveCrossVenueFromMatrix(
  input: SolanaDexPipeInput,
  aggregated: AggregatedSolanaDepth,
): { hlSpot: number; hlPerp: number; dydxPerp: number; depthUsd: number } {
  const spot = input.spotPx;
  const phoenixMid = input.phoenix
    ? resolvePhoenixMidPx(input.phoenix.snapshot)
    : null;
  const raydiumPx = input.raydium?.snapshot.tickCurrent ? spot : spot;
  const jupiterOracle = input.jupiter?.pythOraclePx ?? spot;

  const hlSpot = phoenixMid ?? spot;
  const hlPerp = raydiumPx;
  const oracleDelta = spot > 0 ? Math.abs(jupiterOracle - spot) / spot : 0;
  const dydxPerp = spot * (1 + oracleDelta);

  return {
    hlSpot,
    hlPerp,
    dydxPerp,
    depthUsd: Math.max(aggregated.compositeDepthUsd, aggregated.totalDepthUsd),
  };
}

function resolveCrossVenueProbe(probe: SolanaSoilProbe): {
  hlSpot: number;
  hlPerp: number;
  dydxPerp: number;
  depthUsd: number;
} {
  const spot = probe.spotPx ?? probe.hlSpot ?? 100;
  const oracle = probe.pythOraclePx ?? spot;

  if (
    probe.hlSpot !== undefined &&
    probe.hlPerp !== undefined &&
    probe.dydxPerp !== undefined
  ) {
    return {
      hlSpot: probe.hlSpot,
      hlPerp: probe.hlPerp,
      dydxPerp: probe.dydxPerp,
      depthUsd: probe.depthUsd ?? 500_000,
    };
  }

  const deviationRatio = spot > 0 ? Math.abs(oracle - spot) / spot : 0;

  return {
    hlSpot: spot,
    hlPerp: spot,
    dydxPerp: spot * (1 + deviationRatio),
    depthUsd: probe.depthUsd ?? 500_000,
  };
}

/** Full 1:3 depth matrix evaluation — Touchwood isolation + checkSoilResistance(). */
export function evaluateSolanaDepthMatrix(
  input: SolanaDexPipeInput,
): SolanaSoilEvaluation {
  const aggregated = aggregateSolanaDepth1x3(input);
  const reasons: string[] = [];

  if (aggregated.r20Hardlock) {
    reasons.push(aggregated.r20Reason ?? R20_HARDLOCK);
  }

  for (const pipe of aggregated.pipeStatuses) {
    if (pipe.severed && pipe.reason) {
      reasons.push(`TOUCHWOOD_SEVER_${pipe.dex}:${pipe.reason}`);
    }
  }

  let soil = {
    ok: true,
    tripped: false,
    crossVenueSlippage: 0,
    spotPerpSlippage: 0,
    reasons: [] as string[],
  };

  if (!aggregated.r20Hardlock && aggregated.activePipes.length > 0) {
    const cross = resolveCrossVenueFromMatrix(input, aggregated);
    soil = checkSoilResistance({
      symbol: input.symbol,
      hlSpot: cross.hlSpot,
      hlPerp: cross.hlPerp,
      dydxPerp: cross.dydxPerp,
      depthUsd: cross.depthUsd,
    });
    if (soil.tripped) reasons.push(...soil.reasons);
  }

  const slotLatencyMs = input.phoenix?.slotLatencyMs ?? 0;
  const slot = checkSlotLatency(slotLatencyMs);
  const adjustedPriorityFeeLamports = adjustPriorityFee(
    input.priorityFeeLamports ?? SOLANA_BASE_PRIORITY_FEE_LAMPORTS,
    slotLatencyMs,
  );

  let oracleDeviationBps: number | null = null;
  let r15OraclePass = true;
  if (input.jupiter) {
    const r15 = checkR15OracleDeviation(
      input.jupiter.pythOraclePx,
      input.jupiter.spotPx,
    );
    oracleDeviationBps = Number.isFinite(r15.deviationBps) ? r15.deviationBps : null;
    r15OraclePass = r15.pass;
  }

  const tripped = aggregated.r20Hardlock || soil.tripped;

  return {
    ok: !tripped,
    tripped,
    reasons,
    slotLatencyMs,
    slotLatencyPass: slot.pass,
    priorityFeeLamports: input.priorityFeeLamports ?? SOLANA_BASE_PRIORITY_FEE_LAMPORTS,
    adjustedPriorityFeeLamports,
    oracleDeviationBps,
    r15OraclePass,
    soil,
    aggregatedDepth: aggregated,
    touchwood: aggregated.pipeStatuses,
    r20Hardlock: aggregated.r20Hardlock,
  };
}

/** Legacy single-probe soil gate */
export function evaluateSolanaSoilResistance(
  probe: SolanaSoilProbe,
): SolanaSoilEvaluation {
  const reasons: string[] = [];
  const slot = checkSlotLatency(probe.slotLatencyMs);
  if (!slot.pass && slot.reason) reasons.push(slot.reason);

  let oracleDeviationBps: number | null = null;
  let r15OraclePass = true;

  if (
    probe.venue === "JUPITER_AGGREGATOR" &&
    probe.pythOraclePx !== undefined &&
    probe.spotPx !== undefined
  ) {
    const r15 = checkR15OracleDeviation(probe.pythOraclePx, probe.spotPx);
    oracleDeviationBps = Number.isFinite(r15.deviationBps) ? r15.deviationBps : null;
    r15OraclePass = r15.pass;
    if (!r15.pass && r15.reason) reasons.push(r15.reason);
  }

  const cross = resolveCrossVenueProbe(probe);
  const soil = checkSoilResistance({
    symbol: probe.symbol,
    hlSpot: cross.hlSpot,
    hlPerp: cross.hlPerp,
    dydxPerp: cross.dydxPerp,
    depthUsd: cross.depthUsd,
  });

  if (soil.tripped) reasons.push(...soil.reasons);

  const adjustedPriorityFeeLamports = adjustPriorityFee(
    probe.priorityFeeLamports || SOLANA_BASE_PRIORITY_FEE_LAMPORTS,
    probe.slotLatencyMs,
  );

  const tripped = reasons.length > 0;

  return {
    ok: !tripped,
    tripped,
    reasons,
    slotLatencyMs: probe.slotLatencyMs,
    slotLatencyPass: slot.pass,
    priorityFeeLamports: probe.priorityFeeLamports,
    adjustedPriorityFeeLamports,
    oracleDeviationBps,
    r15OraclePass,
    soil,
  };
}
