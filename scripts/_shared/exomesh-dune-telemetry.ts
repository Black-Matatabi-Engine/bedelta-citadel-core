/** ExoMesh off-chain intercept rows — Dune CSV/JSON export SSOT. */
import { MAX_ATTEMPTS_EXCEEDED_SEVERED } from "../../src/core/intent-mandate";
import { buildGrantAuditDuneTelemetry } from "../../src/routes/grant-audit-lib/grant-audit-dune-telemetry";
import { HONEYPOT_RPC_HOSTS } from "../../src/services/defense/rpc-allowlist-hosts";
import { HONEYPOT_ACTIVE } from "../../src/services/defense/rpc-fetch-gate-lib/rpc-fetch-gate-eval";

export type DuneVenue = "gmx" | "pendle" | "usdai" | "hyperliquid" | "variational";

export type DuneInterceptType =
  | "SOIL_RESISTANCE_TRIP"
  | "HONEYPOT_DECOY"
  | "OBSERVATORY_HAIRCUT"
  | "MAX_ATTEMPTS_SEVERED";

export type DuneInterceptStatus = "FAIL_CLOSED" | "ALLOW";

export interface ExomeshDuneTelemetryRow {
  timestamp: string;
  timestampMs: number;
  venue: DuneVenue;
  intercept_type: DuneInterceptType;
  reflex_latency_us: number;
  gas_burned: number;
  gas_saved_usd: number;
  status: DuneInterceptStatus;
  source: string;
  reason?: string;
}

const GAS_SAVED_USD: Readonly<Record<DuneInterceptType, number>> = {
  SOIL_RESISTANCE_TRIP: 0.42,
  HONEYPOT_DECOY: 0.35,
  OBSERVATORY_HAIRCUT: 0.55,
  MAX_ATTEMPTS_SEVERED: 0.68,
};

const LATENCY_SEED_US: Readonly<Record<DuneInterceptType, number>> = {
  SOIL_RESISTANCE_TRIP: 1.4,
  HONEYPOT_DECOY: 12.8,
  OBSERVATORY_HAIRCUT: 38.6,
  MAX_ATTEMPTS_SEVERED: 7.2,
};

export function mapReasonToInterceptType(reason: string): DuneInterceptType {
  const r = reason.toUpperCase();
  if (
    r.includes(HONEYPOT_ACTIVE) ||
    r.includes("MALFORMED") ||
    r.includes("UNTRUSTED_TELEMETRY") ||
    r.includes("PAYLOAD_INFLATION")
  ) {
    return "HONEYPOT_DECOY";
  }
  if (
    r.includes("ORACLE") ||
    r.includes("SEQUENCER") ||
    r.includes("SOFT_CONFIRMATION") ||
    r.includes("TIMEBOOST")
  ) {
    return "OBSERVATORY_HAIRCUT";
  }
  if (
    r.includes("SESSION_KEY") ||
    r.includes("ROOT_PROTECTION") ||
    r.includes("ROOT17") ||
    r.includes("SAGA") ||
    r.includes("R20") ||
    r.includes(MAX_ATTEMPTS_EXCEEDED_SEVERED) ||
    r.includes("CHANNEL_SEVERED")
  ) {
    return "MAX_ATTEMPTS_SEVERED";
  }
  return "SOIL_RESISTANCE_TRIP";
}

export function mapRetailCodeToInterceptType(code: string): DuneInterceptType {
  const upper = code.toUpperCase();
  if (upper.includes("MAX_ATTEMPTS") || upper.includes("CHANNEL_SEVERED")) {
    return "MAX_ATTEMPTS_SEVERED";
  }
  if (upper.includes("RPC_TRANSPORT") || upper.includes("HONEYPOT")) {
    return "HONEYPOT_DECOY";
  }
  if (upper.includes("SLIPPAGE") || upper.includes("DEPTH")) {
    return "SOIL_RESISTANCE_TRIP";
  }
  return mapReasonToInterceptType(upper);
}

export function resolveVenueFromSignal(reason: string, scenarioGroup?: string): DuneVenue {
  const r = reason.toUpperCase();
  if (r.includes("GMX") || r.includes("ARBITRUM_GAS") || r.includes("SEQUENCER")) return "gmx";
  if (r.includes("PENDLE") || r.includes("PT_") || r.includes("SHADOW_MARGIN")) return "pendle";
  if (r.includes("ORACLE") || r.includes("USDC_DEPEG")) return "usdai";
  if (r.includes("CROSS_VENUE") || r.includes("BLACK_SWAN") || r.includes("VARIATIONAL")) {
    return "variational";
  }
  if (r.includes("HL") || r.includes("HYPERLIQUID") || r.includes("DYDX")) return "hyperliquid";
  switch (scenarioGroup) {
    case "B":
    case "E":
      return "gmx";
    case "F":
    case "G":
      return "hyperliquid";
    case "H":
      return "variational";
    case "I":
      return "usdai";
    case "J":
      return "pendle";
    default:
      return "gmx";
  }
}

export function estimateGasSavedUsd(interceptType: DuneInterceptType): number {
  return GAS_SAVED_USD[interceptType];
}

export function seedReflexLatencyUs(interceptType: DuneInterceptType, seed: number): number {
  const base = LATENCY_SEED_US[interceptType];
  const jitter = (seed % 97) * 0.07;
  return Math.round((base + jitter) * 10) / 10;
}

export function buildTelemetryRow(input: {
  timestampMs: number;
  venue: DuneVenue;
  interceptType: DuneInterceptType;
  reflexLatencyUs: number;
  status: DuneInterceptStatus;
  source: string;
  reason?: string;
}): ExomeshDuneTelemetryRow {
  const gasBurned = input.status === "FAIL_CLOSED" ? 0 : 0.000001;
  const gasSaved = input.status === "FAIL_CLOSED" ? estimateGasSavedUsd(input.interceptType) : 0;
  return {
    timestamp: new Date(input.timestampMs).toISOString(),
    timestampMs: input.timestampMs,
    venue: input.venue,
    intercept_type: input.interceptType,
    reflex_latency_us: input.reflexLatencyUs,
    gas_burned: gasBurned,
    gas_saved_usd: gasSaved,
    status: input.status,
    source: input.source,
    reason: input.reason,
  };
}

export function buildChaosMatrixTelemetryRows(
  evalAtMs: number,
  cases: ReadonlyArray<{
    id?: number;
    scenario: string;
    blocked: boolean;
    reasons: string[];
  }>,
): ExomeshDuneTelemetryRow[] {
  const rows: ExomeshDuneTelemetryRow[] = [];
  for (const caseRow of cases) {
    if (!caseRow.blocked) continue;
    const reason = caseRow.reasons[0] ?? "FAIL_CLOSED";
    const interceptType = mapReasonToInterceptType(reason);
    const venue = resolveVenueFromSignal(reason, caseRow.scenario);
    const seed = caseRow.id ?? rows.length + 1;
    rows.push(
      buildTelemetryRow({
        timestampMs: evalAtMs + seed,
        venue,
        interceptType,
        reflexLatencyUs: seedReflexLatencyUs(interceptType, seed),
        status: "FAIL_CLOSED",
        source: `chaos-matrix:${seed}`,
        reason,
      }),
    );
  }
  return rows;
}

export function buildHoneypotDecoyRows(evalAtMs: number): ExomeshDuneTelemetryRow[] {
  return HONEYPOT_RPC_HOSTS.map((host, index) =>
    buildTelemetryRow({
      timestampMs: evalAtMs + 10_000 + index,
      venue: "variational",
      interceptType: "HONEYPOT_DECOY",
      reflexLatencyUs: seedReflexLatencyUs("HONEYPOT_DECOY", index + 3),
      status: "FAIL_CLOSED",
      source: `honeypot-trap:${host}`,
      reason: HONEYPOT_ACTIVE,
    }),
  );
}

export function buildGrantAuditTelemetryRows(evalAtMs: number): ExomeshDuneTelemetryRow[] {
  const telemetry = buildGrantAuditDuneTelemetry(new Date(evalAtMs).toISOString());
  return telemetry.actionLog.map((entry, index) => {
    if (entry.action === "PASS_GREENLIGHT") {
      return buildTelemetryRow({
        timestampMs: Date.parse(entry.ts) + index,
        venue: "pendle",
        interceptType: "SOIL_RESISTANCE_TRIP",
        reflexLatencyUs: seedReflexLatencyUs("SOIL_RESISTANCE_TRIP", index + 40),
        status: "ALLOW",
        source: "grant-audit:shadow-margin",
        reason: entry.reason,
      });
    }
    const interceptType =
      entry.action === "EMERGENCY_DELEVERAGE_ALLOWED"
        ? "OBSERVATORY_HAIRCUT"
        : "SOIL_RESISTANCE_TRIP";
    return buildTelemetryRow({
      timestampMs: Date.parse(entry.ts) + index,
      venue: "pendle",
      interceptType,
      reflexLatencyUs: seedReflexLatencyUs(interceptType, index + 40),
      status: "FAIL_CLOSED",
      source: "grant-audit:shadow-margin",
      reason: entry.reason,
    });
  });
}

export function formatDuneTelemetryCsv(rows: readonly ExomeshDuneTelemetryRow[]): string {
  const header = "timestamp,venue,intercept_type,reflex_latency_us,gas_burned,status";
  const body = rows.map((row) =>
    [
      row.timestamp,
      row.venue,
      row.intercept_type,
      row.reflex_latency_us.toFixed(1),
      row.gas_burned.toFixed(6),
      row.status,
    ].join(","),
  );
  return [header, ...body].join("\n");
}
