#!/usr/bin/env tsx
/** Agentic referral + whitelist / ZeroDev paymaster slot allocator. */
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mintReferralRecord, verifyReferralRecord } from "./referral/referral-crypto";
import {
  appendReferralRecord,
  loadReferralMetrics,
  recordHookIn,
  writeReferralMetrics,
} from "./referral/referral-store";
import type { ReferralGenResult } from "./referral/referral-types";

export const REFERRAL_METRICS_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "../docs/logging/referral_metrics.json",
);

function argValue(argv: readonly string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  if (i < 0) return undefined;
  const next = argv[i + 1];
  if (!next || next.startsWith("--")) return undefined;
  return next;
}

export function parseReferralCli(argv: readonly string[] = process.argv) {
  return {
    agentId: argValue(argv, "--agent")?.trim() || "anonymous-agent",
    json: argv.includes("--json"),
    hookIn: argv.includes("--hook-in"),
    source: argValue(argv, "--source")?.trim() || "cli",
  };
}

export function runReferralGen(
  argv: readonly string[] = process.argv,
  metricsPath = REFERRAL_METRICS_PATH,
): ReferralGenResult {
  const cli = parseReferralCli(argv);
  let file = loadReferralMetrics(metricsPath);
  const record = mintReferralRecord(cli.agentId);
  if (!verifyReferralRecord(record)) throw new Error("REFERRAL_SIGNATURE_VERIFY_FAILED");
  file = appendReferralRecord(file, record);
  if (cli.hookIn) file = recordHookIn(file, record.code, cli.source);
  writeReferralMetrics(metricsPath, file);
  return {
    code: record.code,
    agentId: record.agentId,
    hookInUrl: record.hookInUrl,
    whitelistPriorityRoute: record.whitelistPriorityRoute,
    zerodevPaymasterSlot: record.zerodevPaymasterSlot,
    signatureAlg: "HMAC-SHA256",
    signatureHex: record.signatureHex,
    totals: file.totals,
  };
}

function printHud(out: ReferralGenResult): void {
  console.log(`[referral] code=${out.code}`);
  console.log(`[referral] agent=${out.agentId}`);
  console.log(`[referral] whitelist=${out.whitelistPriorityRoute}`);
  console.log(`[referral] zerodevPaymasterSlot=${out.zerodevPaymasterSlot}`);
  console.log(`[referral] url=${out.hookInUrl}`);
  console.log(`[referral] issued=${out.totals.issued} hookIns=${out.totals.hookIns} slots=${out.totals.paymasterSlotsAllocated}`);
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return fileURLToPath(import.meta.url) === resolve(entry);
}

if (isDirectRun()) {
  const json = process.argv.includes("--json");
  const out = runReferralGen();
  if (json) process.stdout.write(`${JSON.stringify(out)}\n`);
  else printHud(out);
}
