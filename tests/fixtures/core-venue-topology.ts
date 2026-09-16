/** SSOT 5-core venue topology for test harnesses and grant-audit mocks. */
export const CORE_VENUE_KEYS = [
  "gmx",
  "pendle",
  "usdai",
  "hyperliquid",
  "variational",
] as const;

export type CoreVenueKey = (typeof CORE_VENUE_KEYS)[number];

/** Portfolio cascade replay legs aligned to core venues (GMX GM · HL short · USD.ai collateral). */
export const CORE_CASCADE_LEGS = {
  gmxGm: { venue: "GMX_GM" as const, notionalUsd: 50_000, ethExposure: 12.5, collateralUsd: 50_000, debtUsd: 0 },
  hlShort: { venue: "HL_SHORT" as const, notionalUsd: 48_000, ethExposure: -12.0 },
  usdaiCollateral: {
    venue: "USDAI_COLLATERAL" as const,
    notionalUsd: 80_000,
    ethExposure: 0,
    collateralUsd: 80_000,
    debtUsd: 55_000,
  },
};
