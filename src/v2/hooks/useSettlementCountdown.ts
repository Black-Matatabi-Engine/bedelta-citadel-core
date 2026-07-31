import { useEffect, useState } from "react";
import { isBrowser } from "../lib/client-runtime";

export const SETTLEMENT_LOCKDOWN_SEC = 300;

export function secondsToNextHour(now: Date): number {
  const nextHour = new Date(now.getTime());
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(now.getHours() + 1);
  return Math.max(0, Math.floor((nextHour.getTime() - now.getTime()) / 1000));
}

export function formatCountdownMmSs(totalSeconds: number): string {
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export interface SettlementCountdownState {
  secondsLeft: number;
  formatted: string;
  lockdownActive: boolean;
}

export function useSettlementCountdown(tickMs = 1000): SettlementCountdownState {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    if (!isBrowser()) return;

    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  const clock = now ?? new Date(0);
  const secondsLeft = secondsToNextHour(clock);
  return {
    secondsLeft,
    formatted: formatCountdownMmSs(secondsLeft),
    lockdownActive: secondsLeft < SETTLEMENT_LOCKDOWN_SEC,
  };
}
