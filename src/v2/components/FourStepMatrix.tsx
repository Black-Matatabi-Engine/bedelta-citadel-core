import { useState } from "react";
import {
  clampActivePageStep,
  PAGE_STEP_TITLES,
  type ActivePageStep,
} from "../../services/terminal-state";
import { CRI_TIER_DEFINITIONS, rootTierCardClass } from "../services/risk-engine";
import { STEP1_ROOT_KEYS } from "../types/step1";

export interface FourStepMatrixProps {
  matrixDetails: Record<string, boolean>;
  step2Panel?: React.ReactNode;
  step3Panel?: React.ReactNode;
  step4Panel?: React.ReactNode;
}

function formatRootLabel(key: string): string {
  return key
    .replace(/^root(\d+)_/, "R$1 · ")
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();
}

function rootNumFromKey(key: string): number {
  const match = /^root(\d+)_/.exec(key);
  return match ? Number(match[1]) : 0;
}

function DefenseMatrixGrid({
  roots,
}: {
  roots: Array<[string, boolean]>;
}): React.ReactNode {
  return (
    <div className="space-y-4">
      {CRI_TIER_DEFINITIONS.map((tier) => {
        const tierRoots = roots.filter(([key]) =>
          (tier.roots as readonly number[]).includes(rootNumFromKey(key)),
        );
        if (tierRoots.length === 0) return null;
        return (
          <div key={tier.id}>
            <h4 className="panel-title-text mb-2 text-[0.65rem] text-[rgba(160,255,224,0.55)]">
              {tier.id} · Weight {(tier.weight * 100).toFixed(0)}%
            </h4>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
              {tierRoots.map(([key, passed]) => {
                const rootNum = rootNumFromKey(key);
                return (
                  <div key={key} className={rootTierCardClass(rootNum)}>
                    <p className="truncate font-data text-[9px] uppercase tracking-wider text-[rgba(160,255,224,0.5)]">
                      {key}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--text-primary)]">
                      {formatRootLabel(key)}
                    </p>
                    <span
                      className={[
                        "mt-2 inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        passed ? "soil-badge-pass" : "soil-badge-fail",
                      ].join(" ")}
                    >
                      {passed ? "PASS [✓]" : "FAIL [✗]"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FourStepMatrix({
  matrixDetails,
  step2Panel,
  step3Panel,
  step4Panel,
}: FourStepMatrixProps): React.ReactNode {
  const [activeStep, setActiveStep] = useState<ActivePageStep>(1);
  const roots = STEP1_ROOT_KEYS.map((key) => [
    key,
    matrixDetails[key] ?? false,
  ]) as Array<[string, boolean]>;

  return (
    <section className="space-y-3" aria-label="4-Step Santenmoku Matrix">
      {([1, 2, 3, 4] as ActivePageStep[]).map((step) => {
        const isActive = activeStep === step;
        return (
          <div
            key={step}
            className={["matrix-step", isActive ? "matrix-step--active" : ""].join(" ")}
          >
            <button
              type="button"
              onClick={() => setActiveStep(clampActivePageStep(step))}
              className="matrix-step-toggle font-hud"
              aria-expanded={isActive}
            >
              <span className="text-sm font-bold text-[#45C4B4]">
                {PAGE_STEP_TITLES[step]}
              </span>
              <span className="font-data text-xs text-[rgba(160,255,224,0.55)]">
                {isActive ? "▾ expanded" : "▸ collapsed"}
              </span>
            </button>
            {isActive ? (
              <div className="matrix-step-body">
                {step === 1 ? <DefenseMatrixGrid roots={roots} /> : null}
                {step === 2 ? step2Panel : null}
                {step === 3 ? step3Panel : null}
                {step === 4 ? step4Panel : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
