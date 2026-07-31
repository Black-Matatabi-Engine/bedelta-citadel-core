import { CRI_TIER_DEFINITIONS } from "../services/risk-engine";
import { STEP1_ROOT_KEYS } from "../types/step1";

export interface RootDefenseGridProps {
  matrixDetails: Record<string, boolean>;
}

function rootNumFromKey(key: string): number {
  const match = /^root(\d+)_/.exec(key);
  return match ? Number(match[1]) : 0;
}

export function RootDefenseGrid({
  matrixDetails,
}: RootDefenseGridProps): React.ReactNode {
  const roots = STEP1_ROOT_KEYS.map(
    (key) => [key, matrixDetails[key] ?? false] as const,
  );

  return (
    <section
      className="circuit-panel santen-group santen-group--roots px-4 py-4"
      aria-label="20-Root Defense Grid"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title-text font-hud text-[0.7rem] tracking-[0.18em]">
          Group 4 · 20-Root Defense Sanctuary Grid
        </h2>
        <span className="font-data text-[10px] text-[rgba(160,255,224,0.55)]">
          R1–R20 LED matrix · PASS / FAIL
        </span>
      </div>

      {CRI_TIER_DEFINITIONS.map((tier) => {
        const tierRoots = roots.filter(([key]) =>
          (tier.roots as readonly number[]).includes(rootNumFromKey(key)),
        );
        if (tierRoots.length === 0) return null;

        return (
          <div key={tier.id} className="mb-3 last:mb-0">
            <p className="mb-1.5 font-data text-[9px] uppercase tracking-wider text-[rgba(160,255,224,0.45)]">
              {tier.id} · TIER {(tier.weight * 100).toFixed(0)}%
            </p>
            <div className="root-led-strip flex flex-wrap gap-1.5">
              {tierRoots.map(([key, passed]) => {
                const rootNum = rootNumFromKey(key);
                return (
                  <span
                    key={key}
                    title={key}
                    className={[
                      "root-led-chip font-data",
                      passed ? "root-led-chip--pass" : "root-led-chip--fail",
                    ].join(" ")}
                  >
                    R{rootNum}
                    <span className="root-led-chip-status">
                      {passed ? "✓" : "✗"}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
