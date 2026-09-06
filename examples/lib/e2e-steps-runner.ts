/** E2E Steps 1–5 pipeline orchestrator. */
import type { E2eDemoMode } from "./e2e-demo-constants";
import type { E2ePipelineResult } from "./e2e-demo-types";
import { runStep1CitadelPreExec, runStep2RobinhoodEscort, runStep3GmxUnderweightRebalance } from "./e2e-steps-early";
import { runStep4HlSessionHedge, runStep5R20PanicFlash } from "./e2e-steps-late";

export type { E2ePipelineResult } from "./e2e-demo-types";

export async function runE2ePipeline(
  mode: E2eDemoMode,
  demoNowMs: number,
  demoAt: Date,
): Promise<E2ePipelineResult> {
  const s1 = runStep1CitadelPreExec(demoNowMs);
  const s2 = runStep2RobinhoodEscort(demoNowMs);
  const s3 = runStep3GmxUnderweightRebalance();
  const s4 = await runStep4HlSessionHedge(mode);
  const s5 = runStep5R20PanicFlash(demoAt);
  return { s1, s2, s3, s4, s5 };
}
