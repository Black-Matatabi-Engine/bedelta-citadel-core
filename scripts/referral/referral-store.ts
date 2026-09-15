/** JSON persistence for referral metrics. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { ARBITRUM_ONE_CHAIN_ID } from "../audit-artifact-bindings";
import type { ReferralMetricsFile, ReferralRecord } from "./referral-types";

export function emptyReferralMetrics(at = new Date()): ReferralMetricsFile {
  return {
    schema: "silvervine.agentic-referral.metrics.v1",
    updatedAt: at.toISOString(),
    chainId: ARBITRUM_ONE_CHAIN_ID,
    totals: { issued: 0, hookIns: 0, paymasterSlotsAllocated: 0 },
    records: [],
  };
}

export function loadReferralMetrics(path: string): ReferralMetricsFile {
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as ReferralMetricsFile;
    if (parsed.schema !== "silvervine.agentic-referral.metrics.v1" || !Array.isArray(parsed.records)) {
      return emptyReferralMetrics();
    }
    return parsed;
  } catch {
    return emptyReferralMetrics();
  }
}

function recomputeTotals(records: ReferralRecord[]): ReferralMetricsFile["totals"] {
  let hookIns = 0;
  const slots = new Set<number>();
  for (const r of records) {
    hookIns += r.hookIns.length;
    slots.add(r.zerodevPaymasterSlot);
  }
  return { issued: records.length, hookIns, paymasterSlotsAllocated: slots.size };
}

export function appendReferralRecord(
  file: ReferralMetricsFile,
  record: ReferralRecord,
  at = new Date(),
): ReferralMetricsFile {
  const records = [...file.records, record];
  return {
    schema: "silvervine.agentic-referral.metrics.v1",
    updatedAt: at.toISOString(),
    chainId: ARBITRUM_ONE_CHAIN_ID,
    totals: recomputeTotals(records),
    records,
  };
}

export function writeReferralMetrics(path: string, file: ReferralMetricsFile): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`);
}

export function recordHookIn(
  file: ReferralMetricsFile,
  code: string,
  source: string,
  at = new Date(),
): ReferralMetricsFile {
  const records = file.records.map((r) =>
    r.code === code
      ? { ...r, hookIns: [...r.hookIns, { at: at.toISOString(), source }] }
      : r,
  );
  return {
    ...file,
    updatedAt: at.toISOString(),
    totals: recomputeTotals(records),
    records,
  };
}
