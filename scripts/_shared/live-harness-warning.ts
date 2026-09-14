/** High-visibility banner when GMX live-fill bypass env is armed (execution proof ≠ firewall demo). */
export function isLiveHarnessBypassArmed(): boolean {
  return (
    process.env.BYPASS_SOIL_PROBE === "true" ||
    process.env.ALLOW_STALE_ORACLE === "1" ||
    process.env.ALLOW_STALE_ORACLE === "true"
  );
}

export function printLiveHarnessBypassBanner(): void {
  if (!isLiveHarnessBypassArmed()) return;

  console.warn(`
  ====================================================================
  [DEMO MONITOR PREVIEW - EXECUTION IS NOT FIREWALL]
  WARNING: SOIL PROBE OR ORACLE SAFETY CHECKS ARE CURRENTLY BYPASSED.
  DO NOT USE THIS EXECUTION STATE FOR LIVE-FIRE QUANT TRADING.
  ====================================================================
  `);
}
