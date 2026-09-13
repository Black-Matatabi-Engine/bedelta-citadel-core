/** High-visibility banner when GMX live-fill bypass env is armed (execution proof ≠ firewall demo). */
export function printLiveHarnessBypassBanner(): void {
  const bypassSoil = process.env.BYPASS_SOIL_PROBE === "true";
  const allowStale =
    process.env.ALLOW_STALE_ORACLE === "1" || process.env.ALLOW_STALE_ORACLE === "true";
  if (!bypassSoil && !allowStale) return;

  console.warn(
    [
      "",
      "====================================================================",
      "[WARNING] LIVE HARNESS MODE (EXECUTION CAPABILITY PROOF ONLY)",
      "BYPASS_SOIL_PROBE active. This script tests GMX contract fill.",
      "For non-bypass firewall defense demo, run: pnpm demo:gmx -- --trip",
      "====================================================================",
      "",
    ].join("\n"),
  );
}
