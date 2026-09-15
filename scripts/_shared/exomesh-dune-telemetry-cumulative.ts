/** Cumulative historical append for ExoMesh Dune CSV export. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  DUNE_TELEMETRY_CSV_HEADER,
  type DuneInterceptStatus,
  type DuneInterceptType,
  type DuneVenue,
  type ExomeshDuneTelemetryRow,
} from "./exomesh-dune-telemetry-types";

export interface DuneTelemetryExportMeta {
  lastExportDate: string;
  batchSize: number;
  batchCount: number;
}

export type DuneCumulativeMergeAction = "created" | "appended" | "replaced";

export function utcExportDateKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function parseDuneTelemetryCsv(content: string): ExomeshDuneTelemetryRow[] {
  const lines = content.trim().split("\n").filter((line) => line.length > 0);
  if (lines.length <= 1) return [];
  const rows = new Array<ExomeshDuneTelemetryRow>(lines.length - 1);
  for (let index = 1; index < lines.length; index++) {
    rows[index - 1] = parseDuneTelemetryCsvLine(lines[index]!);
  }
  return rows;
}

function parseDuneTelemetryCsvLine(line: string): ExomeshDuneTelemetryRow {
  const [
    timestamp,
    venue,
    interceptType,
    reflexLatencyUs,
    gasBurned,
    potentialLossSavedUsd,
    gasSavedUsd,
    status,
  ] = line.split(",");
  const timestampMs = Date.parse(timestamp);
  return {
    timestamp,
    timestampMs,
    venue: venue as DuneVenue,
    intercept_type: interceptType as DuneInterceptType,
    reflex_latency_us: Number.parseFloat(reflexLatencyUs),
    gas_burned: Number.parseFloat(gasBurned),
    potential_loss_saved_usd: Number.parseFloat(potentialLossSavedUsd),
    gas_saved_usd: Number.parseFloat(gasSavedUsd),
    status: status as DuneInterceptStatus,
    source: "csv:historical",
  };
}

export function readDuneTelemetryExportMeta(metaPath: string): DuneTelemetryExportMeta | null {
  if (!existsSync(metaPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(metaPath, "utf8")) as DuneTelemetryExportMeta;
    if (!parsed.lastExportDate || !parsed.batchSize) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDuneTelemetryExportMeta(
  metaPath: string,
  meta: DuneTelemetryExportMeta,
): void {
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
}

export function mergeCumulativeDuneBatches(
  historical: readonly ExomeshDuneTelemetryRow[],
  newBatch: readonly ExomeshDuneTelemetryRow[],
  endMs: number,
  meta: DuneTelemetryExportMeta | null,
): { rows: ExomeshDuneTelemetryRow[]; action: DuneCumulativeMergeAction; meta: DuneTelemetryExportMeta } {
  const batchSize = newBatch.length;
  const exportDate = utcExportDateKey(endMs);

  if (historical.length === 0) {
    return {
      rows: [...newBatch],
      action: "created",
      meta: { lastExportDate: exportDate, batchSize, batchCount: 1 },
    };
  }

  if (meta?.lastExportDate === exportDate && historical.length >= batchSize) {
    const preserved = historical.slice(0, -batchSize);
    const batchCount = Math.max(1, Math.floor(preserved.length / batchSize) + 1);
    return {
      rows: [...preserved, ...newBatch],
      action: "replaced",
      meta: { lastExportDate: exportDate, batchSize, batchCount },
    };
  }

  const batchCount = Math.floor(historical.length / batchSize) + 1;
  return {
    rows: [...historical, ...newBatch],
    action: "appended",
    meta: { lastExportDate: exportDate, batchSize, batchCount },
  };
}

export function loadCumulativeDuneTelemetry(
  csvPath: string,
): ExomeshDuneTelemetryRow[] {
  if (!existsSync(csvPath)) return [];
  const content = readFileSync(csvPath, "utf8");
  if (!content.trim().startsWith(DUNE_TELEMETRY_CSV_HEADER)) return [];
  return parseDuneTelemetryCsv(content);
}
