import { DEFAULT_DVOL, DEFAULT_VIX } from "../../services/config";

export interface MarketSentimentRadarProps {
  vix?: number;
  dvol?: number;
}

function vixMood(vix: number) {
  if (vix >= 22) return { label: "傳統市場：高波動 / High Vol", emoji: "😰", alert: true };
  if (vix > 20) return { label: "傳統市場：升溫 / Elevated", emoji: "😬", alert: true };
  return { label: "傳統市場：平穩 / Stable", emoji: "😌", alert: false };
}

function dvolMood(dvol: number) {
  if (dvol >= 55) return { label: "加密市場：恐慌 / Panic", emoji: "🔥", alert: true };
  if (dvol >= 45) return { label: "加密市場：升溫 / Elevated", emoji: "😬", alert: true };
  return { label: "加密市場：橫盤蓄勢 / Low Vol", emoji: "😌", alert: false };
}

export function MarketSentimentRadar({
  vix = DEFAULT_VIX,
  dvol = DEFAULT_DVOL,
}: MarketSentimentRadarProps): React.ReactNode {
  const vixState = vixMood(vix);
  const dvolState = dvolMood(dvol);
  const defconActive = vix > 20 || dvol > 55;

  return (
    <section
      className="circuit-panel step1-glacier-card vol-filter-panel p-4"
      aria-label="全球市場情緒雷達"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="section-header font-hud">
          🎭 全球市場情緒雷達 (Market Sentiment)
        </h2>
        <span
          className={[
            "defcon-badge",
            defconActive ? "defcon-badge--elevated" : "defcon-badge--clear",
          ].join(" ")}
        >
          {defconActive ? "DEFCON · ELEVATED" : "DEFCON: CLEAR"}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div
          className={[
            "vol-filter-badge",
            vixState.alert ? "vol-filter-badge--alert" : "vol-filter-badge--ok",
          ].join(" ")}
        >
          VIX (Trad): <strong>{vix.toFixed(1)}</strong> [ {vixState.emoji}{" "}
          {vixState.label} ]
        </div>
        <div
          className={[
            "vol-filter-badge",
            dvolState.alert ? "vol-filter-badge--alert" : "vol-filter-badge--ok",
          ].join(" ")}
        >
          DVOL (Crypto): <strong>{dvol.toFixed(1)}%</strong> [ {dvolState.emoji}{" "}
          {dvolState.label} ]
        </div>
      </div>
    </section>
  );
}
