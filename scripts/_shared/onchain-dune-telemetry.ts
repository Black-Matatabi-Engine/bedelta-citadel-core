/** On-chain SliverVineGate logs → Dune CSV row mapping SSOT. */
import {
  GATE_ACTION_EMERGENCY_DELEVERAGE,
  GATE_ACTION_FAIL_CLOSED_BLOCK,
  GATE_ACTION_PASS_GREENLIGHT,
} from "../../src/core/gate-telemetry-types";
import { SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS } from "../../src/config/contract-deployments";
import {
  DUNE_TELEMETRY_CSV_COMMENT,
  DUNE_TELEMETRY_CSV_HEADER,
  L2_GAS_SAVED_USD,
  type DuneInterceptStatus,
  type DuneInterceptType,
  type DuneVenue,
  type ExomeshDuneTelemetryRow,
} from "./exomesh-dune-telemetry-types";
import {
  estimateGasSavedUsd,
  estimatePotentialLossSavedUsd,
  mapReasonToInterceptType,
  resolveVenueFromSignal,
  seedReflexLatencyUs,
} from "./exomesh-dune-telemetry-map";

export const ONCHAIN_DUNE_CSV_PATH = "docs/audit/onchain-dune-telemetry.csv";
export const ONCHAIN_DUNE_CSV_COMMENT =
  `${DUNE_TELEMETRY_CSV_COMMENT} | on-chain SliverVineGate ${SLIVERVINE_GATE_DUAL_DEPLOY_ADDRESS} | RiskTripBlocked≡SoilResistanceTripped`;

export const GATE_MAINNET_DEPLOY_BLOCK = 501_229_976n;
export const DEFAULT_LOG_CHUNK_BLOCKS = 50_000n;
export const DEFAULT_SEPOLIA_LOOKBACK_BLOCKS = 500_000n;

export interface ParsedOnchainGateLog {
  chainId: number;
  network: "mainnet" | "sepolia";
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
  timestampMs: number;
  gasUsed: bigint;
  gasPriceWei: bigint;
  eventName: "IntentAttested" | "RiskTripBlocked";
  intentHash: string;
  agent: string;
  action?: number;
  shadowMarginUsd?: bigint;
  reason?: string;
}

function hashSeed(parts: string[]): number {
  let hash = 2_166_136_261;
  for (const part of parts) {
    for (let index = 0; index < part.length; index++) {
      hash ^= part.charCodeAt(index);
      hash = Math.imul(hash, 1_677_761_9);
    }
  }
  return hash >>> 0;
}

function mapIntentAction(action: number): {
  status: DuneInterceptStatus;
  interceptType: DuneInterceptType;
} {
  if (action === GATE_ACTION_PASS_GREENLIGHT) {
    return { status: "ALLOW", interceptType: "SOIL_RESISTANCE_TRIP" };
  }
  if (action === GATE_ACTION_EMERGENCY_DELEVERAGE) {
    return { status: "FAIL_CLOSED", interceptType: "OBSERVATORY_HAIRCUT" };
  }
  return { status: "FAIL_CLOSED", interceptType: "SOIL_RESISTANCE_TRIP" };
}

export function mapOnchainLogToDuneRow(log: ParsedOnchainGateLog): ExomeshDuneTelemetryRow {
  const seed = hashSeed([log.transactionHash, String(log.logIndex), log.intentHash]);
  let status: DuneInterceptStatus = "FAIL_CLOSED";
  let interceptType: DuneInterceptType = "SOIL_RESISTANCE_TRIP";
  let venue: DuneVenue = "gmx";
  let simulatedLossPreventedUsd = 0;

  if (log.eventName === "IntentAttested") {
    const mapped = mapIntentAction(log.action ?? GATE_ACTION_FAIL_CLOSED_BLOCK);
    status = mapped.status;
    interceptType = mapped.interceptType;
    venue = "pendle";
    if (log.shadowMarginUsd !== undefined) {
      simulatedLossPreventedUsd = Number(log.shadowMarginUsd) / 1_000_000;
      if (status === "ALLOW") simulatedLossPreventedUsd = 0;
    }
  } else {
    const reason = log.reason ?? "SOIL_RESISTANCE_TRIP";
    interceptType = mapReasonToInterceptType(reason);
    venue = resolveVenueFromSignal(reason);
    simulatedLossPreventedUsd = estimatePotentialLossSavedUsd(interceptType, seed, "FAIL_CLOSED");
  }

  const gasBurnedEth = Number(log.gasUsed * log.gasPriceWei) / 1e18;
  return {
    timestamp: new Date(log.timestampMs).toISOString(),
    timestampMs: log.timestampMs,
    venue,
    intercept_type: interceptType,
    reflex_latency_us: seedReflexLatencyUs(interceptType, seed),
    gas_burned: gasBurnedEth,
    simulated_loss_prevented_usd: Math.round(simulatedLossPreventedUsd * 100) / 100,
    gas_saved_usd: estimateGasSavedUsd(interceptType, status),
    status,
    source: `onchain:${log.network}:${log.eventName}:${log.transactionHash}:${log.logIndex}`,
    reason: log.reason,
  };
}

export function formatOnchainDuneCsv(rows: readonly ExomeshDuneTelemetryRow[]): string {
  const lines = new Array<string>(rows.length + 2);
  lines[0] = ONCHAIN_DUNE_CSV_COMMENT;
  lines[1] = DUNE_TELEMETRY_CSV_HEADER;
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]!;
    lines[index + 2] = [
      row.timestamp,
      row.venue,
      row.intercept_type,
      row.reflex_latency_us.toFixed(1),
      row.gas_burned.toFixed(6),
      row.simulated_loss_prevented_usd.toFixed(2),
      row.gas_saved_usd.toFixed(2),
      row.status,
    ].join(",");
  }
  return `${lines.join("\n")}\n`;
}
