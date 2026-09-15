/** SPSS P0 corpus + scorecard SSOT types. */
import type { BenchmarkEnvironment } from "../src/utils/hardware-detector";

export type P0ExpectedVerdict = "block" | "allow";
export type P0CorpusLane =
  | "retail_risk"
  | "retail_approve"
  | "retail_venue"
  | "retail_intent_strike"
  | "gateway_soil"
  | "gmx_flags"
  | "pendle_flags"
  | "pendle_gmx_cross";

export interface P0CorpusCase {
  id: string;
  category: string;
  lane: P0CorpusLane;
  expected: P0ExpectedVerdict;
  observatoryParadox?: boolean;
  payload: Record<string, unknown>;
}

export interface P0CorpusFile {
  schema: string;
  label: "toxic" | "benign";
  cases: P0CorpusCase[];
}

export interface P0CaseResult {
  id: string;
  category: string;
  expected: P0ExpectedVerdict;
  actual: P0ExpectedVerdict;
  pass: boolean;
  observatoryParadox?: boolean;
  detail?: string;
}

export interface P0ScorecardSsot {
  schema: "silvervine.p0-scorecard.ssot.v1";
  protocol: "SliverVine Protocol";
  harness: "p0-scorecard-runner";
  standard: "SPSS";
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
  caseResults: P0CaseResult[];
}
