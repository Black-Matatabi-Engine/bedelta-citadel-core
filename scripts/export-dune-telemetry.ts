#!/usr/bin/env tsx
/**
 * ExoMesh off-chain telemetry → Dune-compatible CSV/JSON.
 * Usage: pnpm tsx scripts/export-dune-telemetry.ts [--json] [--out path]
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildChaosMatrixTelemetryRows,
  buildGrantAuditTelemetryRows,
  buildHoneypotDecoyRows,
  buildTelemetryRow,
  formatDuneTelemetryCsv,
  mapRetailCodeToInterceptType,
  type ExomeshDuneTelemetryRow,
} from "./_shared/exomesh-dune-telemetry";
import {
  applyRollingTimestamps,
  resolveRollingExportEndMs,
} from "./_shared/exomesh-dune-telemetry-rolling";
import { CHAOS_ATTACK_COUNT, runMatrixCase } from "./chaos-blackswan-stress";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function buildExomeshDemoRows(): ExomeshDuneTelemetryRow[] {
  const demoRows: Array<{
    venue: ExomeshDuneTelemetryRow["venue"];
    code: string;
    wasmUs: number;
    status: ExomeshDuneTelemetryRow["status"];
    source: string;
  }> = [
    {
      venue: "gmx",
      code: "VENUE_DRIFT_REJECTED",
      wasmUs: 6.8,
      status: "FAIL_CLOSED",
      source: "demo:exomesh:C",
    },
    {
      venue: "hyperliquid",
      code: "MAX_ATTEMPTS_EXCEEDED_SEVERED",
      wasmUs: 7.2,
      status: "FAIL_CLOSED",
      source: "demo:exomesh:D",
    },
    {
      venue: "gmx",
      code: "ALLOW",
      wasmUs: 1.3,
      status: "ALLOW",
      source: "demo:exomesh:A",
    },
  ];
  return demoRows.map((row, index) =>
    buildTelemetryRow({
      timestampMs: index,
      venue: row.venue,
      interceptType: row.status === "ALLOW" ? "SOIL_RESISTANCE_TRIP" : mapRetailCodeToInterceptType(row.code),
      reflexLatencyUs: row.wasmUs,
      status: row.status,
      source: row.source,
      reason: row.code,
    }),
  );
}

function muteConsole(): () => void {
  const warn = console.warn;
  const error = console.error;
  console.warn = () => {};
  console.error = () => {};
  return () => {
    console.warn = warn;
    console.error = error;
  };
}

export function buildExomeshDuneTelemetryExport(endMs = resolveRollingExportEndMs()): ExomeshDuneTelemetryRow[] {
  const restore = muteConsole();
  let chaosCases: ReturnType<typeof runMatrixCase>[];
  try {
    chaosCases = Array.from({ length: CHAOS_ATTACK_COUNT }, (_, index) => runMatrixCase(index + 1));
  } finally {
    restore();
  }
  const rows = [
    ...buildChaosMatrixTelemetryRows(chaosCases),
    ...buildHoneypotDecoyRows(),
    ...buildGrantAuditTelemetryRows(endMs),
    ...buildExomeshDemoRows(),
  ];
  return applyRollingTimestamps(rows, endMs);
}

function main(): void {
  const jsonMode = process.argv.includes("--json");
  const outIdx = process.argv.indexOf("--out");
  const outPath = outIdx >= 0 ? process.argv[outIdx + 1] : undefined;
  const rows = buildExomeshDuneTelemetryExport();
  const failClosed = rows.filter((row) => row.status === "FAIL_CLOSED").length;
  const gasSavedUsd = rows.reduce((sum, row) => sum + row.gas_saved_usd, 0);
  const potentialLossSavedUsd = rows.reduce((sum, row) => sum + row.potential_loss_saved_usd, 0);

  if (jsonMode) {
    const payload = JSON.stringify(
      {
        schema: "silvervine.exomesh.dune-telemetry.v1",
        generatedAt: new Date().toISOString(),
        rowCount: rows.length,
        failClosedCount: failClosed,
        gasSavedUsdTotal: Math.round(gasSavedUsd * 100) / 100,
        potentialLossSavedUsdTotal: Math.round(potentialLossSavedUsd * 100) / 100,
        rows,
      },
      null,
      2,
    );
    if (outPath) writeFileSync(outPath, payload);
    else console.log(payload);
  } else {
    const csv = formatDuneTelemetryCsv(rows);
    if (outPath) writeFileSync(outPath, csv);
    else console.log(csv);
  }

  const defaultOut = join(ROOT, "docs/audit/exomesh-dune-telemetry.csv");
  if (!outPath) writeFileSync(defaultOut, formatDuneTelemetryCsv(rows));

  console.error(
    `[dune-export] rows=${rows.length} fail_closed=${failClosed}/${CHAOS_ATTACK_COUNT} potential_loss_saved_usd=${potentialLossSavedUsd.toFixed(2)} gas_saved_usd=${gasSavedUsd.toFixed(2)} -> ${outPath ?? defaultOut}`,
  );
}

main();
