import {
  SETTLEMENT_LOCKDOWN_SEC,
  useSettlementCountdown,
} from "../hooks/useSettlementCountdown";

export function DexSettlementCountdown(): React.ReactNode {
  const { formatted, secondsLeft, lockdownActive } = useSettlementCountdown();

  return (
    <section
      className={[
        "circuit-panel dex-settlement-box",
        lockdownActive ? "dex-settlement-box--lockdown" : "",
      ].join(" ")}
      aria-label="DEX settlement countdown"
    >
      <div className="flex flex-wrap items-center gap-2 text-base font-black text-[#45C4B4]">
        <span>DEX Settlement Countdown</span>
        {lockdownActive ? (
          <span className="countdown-lockdown-pill">SETTLEMENT LOCKDOWN</span>
        ) : null}
      </div>
      <p className="mt-3 text-base font-black text-[var(--text-primary)]">
        Hyperliquid (1h):{" "}
        <span className="text-[#50D2C1] underline decoration-[rgba(80,210,193,0.4)] underline-offset-4">
          {formatted}
        </span>
      </p>
      <p className={lockdownActive ? "mt-2 text-xs" : "funding-yield-fact mt-2"}>
        {lockdownActive
          ? `No new entries ${SETTLEMENT_LOCKDOWN_SEC / 60}m before settlement · ${secondsLeft}s remaining`
          : "Funding Yield Fact: Every 1 hour, peer-to-peer interest is settled in Real USDC."}
      </p>
    </section>
  );
}
