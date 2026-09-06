/** E2E pipeline step theme — SSOT for roadmap colors and step title inheritance. */
import { BLUE, BOLD, BOLD_RED, BRIGHT_CYAN, BRIGHT_MAGENTA, YELLOW } from "./e2e-hud-ansi";

export const E2E_PIPELINE_STEPS = [
  { step: 1, label: "Intent+Deadman", color: BRIGHT_CYAN },
  { step: 2, label: "Robinhood Escort", color: BRIGHT_MAGENTA },
  { step: 3, label: "GMX GM Deposit", color: `${BOLD}${YELLOW}` },
  { step: 4, label: "HL Session Hedge", color: BLUE },
  { step: 5, label: "R20 Panic Flash", color: BOLD_RED },
] as const;

export function e2eStepThemeColor(step: number): string {
  return E2E_PIPELINE_STEPS[step - 1]?.color ?? BRIGHT_CYAN;
}

export function formatE2eSoilTripReason(reason: string): string {
  return reason.replace(
    /CROSS_VENUE_SLIPPAGE=([0-9.]+)%>([0-9.]+)%/g,
    (_match, actual: string, limit: string) =>
      `CROSS_VENUE_SLIPPAGE=${parseFloat(actual).toFixed(2)}%>${parseFloat(limit).toFixed(2)}%`,
  );
}

export function formatE2eSoilTripReasons(reasons: string[]): string {
  return reasons.map(formatE2eSoilTripReason).join(" · ");
}
