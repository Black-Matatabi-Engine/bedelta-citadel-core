/** Append live CLI demo rows to docs/audit/exomesh-dune-telemetry.csv. */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildTelemetryRow,
  mapReasonToInterceptType,
  type DuneVenue,
  type ExomeshDuneTelemetryRow,
} from "./exomesh-dune-telemetry";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const CSV_HEADER = "timestamp,venue,intercept_type,reflex_latency_us,gas_burned,status";

export const DEFAULT_DUNE_TELEMETRY_CSV = join(ROOT, "docs/audit/exomesh-dune-telemetry.csv");

export function rowToCsvLine(row: ExomeshDuneTelemetryRow): string {
  return [
    row.timestamp,
    row.venue,
    row.intercept_type,
    row.reflex_latency_us.toFixed(1),
    row.gas_burned.toFixed(6),
    row.status,
  ].join(",");
}

export function appendExomeshDuneTelemetryRow(
  input: {
    timestampMs: number;
    venue: DuneVenue;
    status: "FAIL_CLOSED" | "ALLOW";
    reason: string;
    reflexLatencyUs?: number;
    source: string;
  },
  csvPath = DEFAULT_DUNE_TELEMETRY_CSV,
): ExomeshDuneTelemetryRow {
  const interceptType =
    input.status === "ALLOW" ? "SOIL_RESISTANCE_TRIP" : mapReasonToInterceptType(input.reason);
  const row = buildTelemetryRow({
    timestampMs: input.timestampMs,
    venue: input.venue,
    interceptType,
    reflexLatencyUs: input.reflexLatencyUs ?? (input.status === "FAIL_CLOSED" ? 7.2 : 1.3),
    status: input.status,
    source: input.source,
    reason: input.reason,
  });
  if (!existsSync(csvPath)) {
    writeFileSync(csvPath, `${CSV_HEADER}\n`, "utf8");
  } else {
    const prior = readFileSync(csvPath, "utf8");
    if (prior.length > 0 && !prior.endsWith("\n")) appendFileSync(csvPath, "\n", "utf8");
  }
  appendFileSync(csvPath, `${rowToCsvLine(row)}\n`, "utf8");
  return row;
}
