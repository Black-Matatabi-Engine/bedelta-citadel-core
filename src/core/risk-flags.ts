/** Protocol trip bitmask SSOT — shared by risk-engine-core and severance. */
export const FLAGS_CLEAR = 0;
export const FLAGS_SEVERED = 1 << 0;
export const FLAGS_IMBALANCE_TRIP = 1 << 1;
export const FLAGS_COLLATERAL_TRIP = 1 << 2;
export const FLAGS_YIELD_SHOCK = 1 << 3;
export const FLAGS_SLIPPAGE_TRIP = 1 << 4;
export const FLAGS_HF_TRIP = 1 << 5;
export const FLAGS_NAV_VIOLATION = 1 << 6;
export const FLAGS_HL_SESSION = 1 << 7;
export const FLAGS_HL_SIZE = 1 << 8;
export const FLAGS_HL_SPREAD = 1 << 9;
export const FLAGS_HL_RATE = 1 << 10;
export const FLAGS_DEPEG_TRIP = 1 << 11;

export const FLAGS_AUTO_SEVER_MASK =
  FLAGS_IMBALANCE_TRIP |
  FLAGS_COLLATERAL_TRIP |
  FLAGS_YIELD_SHOCK |
  FLAGS_SLIPPAGE_TRIP |
  FLAGS_HF_TRIP |
  FLAGS_NAV_VIOLATION |
  FLAGS_HL_SESSION |
  FLAGS_HL_SIZE |
  FLAGS_HL_SPREAD |
  FLAGS_HL_RATE |
  FLAGS_DEPEG_TRIP;
