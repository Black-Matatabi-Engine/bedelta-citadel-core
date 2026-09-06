#!/usr/bin/env tsx
/**
 * Unified E2E Citadel Demo — 5-step institutional trade lifecycle (grant auditor CLI).
 *
 * Usage:
 *   pnpm demo:e2e
 *   pnpm demo:e2e --hedge-live
 *   pnpm demo:e2e --livingwater
 */
import { E2E_PROOF_REL_PATH, parseE2eMode } from "../examples/lib/e2e-demo-constants";
import {
  e2eLog,
  logE2eHeaderClock,
  logE2eHeaderMode,
  logE2ePipelineRoadmap,
  paintE2eBanner,
  printE2eSummaryHud,
} from "../examples/lib/e2e-hud-renderer";
import {
  buildE2eProofPayload,
  evaluateE2ePipelineOk,
  saveE2eProof,
} from "../examples/lib/e2e-proof-persister";
import { runE2ePipeline } from "../examples/lib/e2e-steps-runner";
import { handleDemoExit, IS_LIVINGWATER_MODE, wrapDemoExecution } from "../examples/lib/demo-harness";
import { resetProbes } from "./_shared/santenmoku-stress-probes";

wrapDemoExecution(async ({ nowMs, at }) => {
  const mode = parseE2eMode(process.argv.slice(2));
  e2eLog("");
  paintE2eBanner();
  logE2eHeaderMode(mode);
  logE2eHeaderClock(IS_LIVINGWATER_MODE);
  logE2ePipelineRoadmap();
  if (!IS_LIVINGWATER_MODE) resetProbes(nowMs);

  const steps = await runE2ePipeline(mode, nowMs, at);
  e2eLog("");
  const proof = buildE2eProofPayload(mode, steps);
  saveE2eProof(proof);
  const allOk = evaluateE2ePipelineOk(steps);
  printE2eSummaryHud(proof, E2E_PROOF_REL_PATH, allOk);

  if (!allOk) {
    process.exitCode = 1;
    return;
  }
  handleDemoExit(false, "E2E_OK");
  process.exit(0);
});
