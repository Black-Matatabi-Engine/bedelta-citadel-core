/** Safe trading hour — 2026-07-25T06:00:00Z = HKT 14:00 (outside tsunami window). */
export const SAFE_TRADING_TIME = new Date("2026-07-25T06:00:00.000Z");

/** Tsunami shield probe — 2026-07-25T13:30:00Z = HKT 21:30 (inside 21:00–23:00 lock). */
export const TSUNAMI_SHIELD_TIME = new Date("2026-07-25T13:30:00.000Z");
