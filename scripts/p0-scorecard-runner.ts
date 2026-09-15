#!/usr/bin/env tsx
/** SPSS P0 Pre-Consensus Security Standard — autonomous scorecard harness. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeSoilSlippageMetrics } from "../src/core/soil-resistance-math";
import { detectBenchmarkEnvironment } from "../src/utils/hardware-detector";
import { evaluateP0Case } from "./p0-scorecard-eval";
import type { P0CaseResult, P0CorpusFile, P0ScorecardSsot } from "./p0-scorecard-types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOXIC_PATH = join(ROOT, "tests/p0/corpus/toxic-set.json");
const BENIGN_PATH = join(ROOT, "tests/p0/corpus/benign-set.json");
const SCORECARD_PATH = join(ROOT, "docs/audit/P0_SCORECARD_SSOT.json");
const METRICS_PATH = join(ROOT, "docs/audit/SYSTEM_METRICS_SSOT.json");
const LATENCY_ITERS = 10_000;
const TPR_MIN = 99.5;
const FPR_MAX = 0.5;

function loadCorpus(path: string): P0CorpusFile {
  return JSON.parse(readFileSync(path, "utf8")) as P0CorpusFile;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx] ?? 0;
}

function runCorpus(file: P0CorpusFile): P0CaseResult[] {
  return file.cases.map((caseRow) => {
    const { actual, detail } = evaluateP0Case(caseRow);
    const pass = actual === caseRow.expected;
    return {
      id: caseRow.id,
      category: caseRow.category,
      expected: caseRow.expected,
      actual,
      pass,
      observatoryParadox: caseRow.observatoryParadox,
      detail,
    };
  });
}

function measureReflexLatencyUs(): { p50: number; p99: number } {
  const soil = {
    hlSpot: 3500,
    hlPerp: 3500,
    dydxPerp: 3498.25,
    depthUsd: 500_000,
    maxSlippage: 0.005,
    minDepthUsd: 100_000,
  };
  for (let i = 0; i < 500; i++) computeSoilSlippageMetrics({ symbol: "ETH", ...soil });
  const samplesUs: number[] = [];
  for (let i = 0; i < LATENCY_ITERS; i++) {
    const t0 = performance.now();
    computeSoilSlippageMetrics({ symbol: "ETH", ...soil });
    samplesUs.push((performance.now() - t0) * 1000);
  }
  samplesUs.sort((a, b) => a - b);
  return { p50: Number(percentile(samplesUs, 50).toFixed(3)), p99: Number(percentile(samplesUs, 99).toFixed(3)) };
}

function computeRates(toxic: P0CaseResult[], benign: P0CaseResult[]) {
  const tp = toxic.filter((r) => r.actual === "block").length;
  const fn = toxic.length - tp;
  const fp = benign.filter((r) => r.actual === "block").length;
  const tn = benign.length - fp;
  const tpr = toxic.length ? (tp / (tp + fn)) * 100 : 100;
  const fpr = benign.length ? (fp / (fp + tn)) * 100 : 0;
  const observatoryMisblock = benign.filter((r) => r.observatoryParadox && r.actual === "block").length;
  return { tpr, fpr, observatoryMisblock, tp, fn, fp, tn };
}

function main(): void {
  const env = detectBenchmarkEnvironment();
  const toxic = runCorpus(loadCorpus(TOXIC_PATH));
  const benign = runCorpus(loadCorpus(BENIGN_PATH));
  const rates = computeRates(toxic, benign);
  const latency = measureReflexLatencyUs();
  const killSwitch = rates.fpr > FPR_MAX;
  const verdict =
    !killSwitch && rates.tpr >= TPR_MIN && rates.observatoryMisblock === 0 && toxic.every((r) => r.pass) && benign.every((r) => r.pass)
      ? "PASS"
      : "FAIL";

  const scorecard: P0ScorecardSsot = {
    schema: "silvervine.p0-scorecard.ssot.v1",
    protocol: "SliverVine Protocol",
    harness: "p0-scorecard-runner",
    standard: "SPSS",
    generatedAt: env.detectedAt,
    benchmark_environment: env,
    corpus: { toxicCases: toxic.length, benignCases: benign.length },
    metrics: {
      truePositiveRatePct: Number(rates.tpr.toFixed(4)),
      falsePositiveRatePct: Number(rates.fpr.toFixed(4)),
      reflexLatencyP50Us: latency.p50,
      reflexLatencyP99Us: latency.p99,
      observatoryParadoxMisblockCount: rates.observatoryMisblock,
      latencyIterations: LATENCY_ITERS,
    },
    targets: { tprMinPct: TPR_MIN, fprMaxPct: FPR_MAX, observatoryMisblockMax: 0 },
    verdict,
    killSwitchTriggered: killSwitch,
    caseResults: [...toxic, ...benign],
  };

  mkdirSync(dirname(SCORECARD_PATH), { recursive: true });
  writeFileSync(SCORECARD_PATH, `${JSON.stringify(scorecard, null, 2)}\n`);

  const metrics = JSON.parse(readFileSync(METRICS_PATH, "utf8")) as Record<string, unknown>;
  metrics.benchmark_environment = env;
  metrics.generatedAt = env.detectedAt;
  writeFileSync(METRICS_PATH, `${JSON.stringify(metrics, null, 2)}\n`);

  console.log(`[P0] TPR ${scorecard.metrics.truePositiveRatePct}% (target >= ${TPR_MIN}%)`);
  console.log(`[P0] FPR ${scorecard.metrics.falsePositiveRatePct}% (target <= ${FPR_MAX}%${killSwitch ? " KILL-SWITCH" : ""})`);
  console.log(`[P0] Reflex p50 ${latency.p50}µs · p99 ${latency.p99}µs (${LATENCY_ITERS} iter)`);
  console.log(`[P0] Observatory mis-block ${rates.observatoryMisblock} (max 0)`);
  console.log(`[P0] Verdict ${verdict}`);
  console.log(`[SSOT] ${SCORECARD_PATH}`);
  if (verdict !== "PASS") process.exitCode = 1;
}

main();
