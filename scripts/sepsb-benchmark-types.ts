/** SEPSB corpus + benchmark SSOT types. */
import type { BenchmarkEnvironment } from "../src/utils/hardware-detector";

export type SepsbExpectedVerdict = "block" | "allow";
export type SepsbCorpusLane =
  | "retail_risk"
  | "retail_approve"
  | "retail_venue"
  | "retail_intent_strike"
  | "gateway_soil"
  | "gmx_flags"
  | "pendle_flags"
  | "pendle_gmx_cross";

export interface SepsbCorpusCase {
  id: string;
  category: string;
  lane: SepsbCorpusLane;
  expected: SepsbExpectedVerdict;
  observatoryParadox?: boolean;
  payload: Record<string, unknown>;
}

export interface SepsbCorpusFile {
  schema: string;
  label: "toxic" | "benign";
  cases: SepsbCorpusCase[];
}

export interface SepsbCaseResult {
  id: string;
  category: string;
  expected: SepsbExpectedVerdict;
  actual: SepsbExpectedVerdict;
  pass: boolean;
  observatoryParadox?: boolean;
  detail?: string;
}

export interface SepsbBenchmarkSsot {
  schema: "silvervine.sepsb-benchmark.ssot.v1";
  protocol: "SliverVine Protocol";
  harness: "sepsb-benchmark-runner";
  benchmark_title: "SliverVine ExoMesh Pre-Consensus Security Benchmark (SEPSB)";
  standard_version: "SEPSB-v1.0-Santenmoku";
  generatedAt: string;
  benchmark_environment: BenchmarkEnvironment;
  corpus: {
    toxicCases: number;
    benignCases: number;
  };
  metrics: {
    truePositiveRatePct: number;
    falsePositiveRatePct: number;
    reflexLatencyP50Us: number;
    reflexLatencyP99Us: number;
    observatoryParadoxMisblockCount: number;
    latencyIterations: number;
  };
  targets: {
    tprMinPct: number;
    fprMaxPct: number;
    observatoryMisblockMax: number;
  };
  verdict: "PASS" | "FAIL";
  killSwitchTriggered: boolean;
  caseResults: SepsbCaseResult[];
}
