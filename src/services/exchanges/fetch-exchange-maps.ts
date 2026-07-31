import type {
  CommoditiesSnapshot,
  ExchangePriceMaps,
  FxSnapshot,
  IndicesSnapshot,
  PreIpoSnapshot,
  StocksSnapshot,
  TradFiEnrichmentPack,
} from "../../types/matrix";
import { fetchDydxPerpMids } from "./dydx-adapter";
import { hyperliquidAdapter } from "./hyperliquid-adapter";
import { isTradFiAsset } from "./asset-classifier";

export interface ExchangeBundle {
  maps: ExchangePriceMaps;
  /** TradFi display-only — never enters crypto Rule A */
  commodities: CommoditiesSnapshot;
  stocks: StocksSnapshot;
  indices: IndicesSnapshot;
  fx: FxSnapshot;
  preipo: PreIpoSnapshot;
  tradfiEnrichment: TradFiEnrichmentPack;
  debugSystemLogs: string[];
}

/**
 * Strip TradFi / colon keys from crypto price maps.
 * TradFi must never leak into the funding-yield arb universe.
 */
function sanitizeCryptoMap(
  input: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(input)) {
    if (isTradFiAsset(key) || key.includes(":")) continue;
    if (!Number.isFinite(value) || value <= 0) continue;
    out[key.toUpperCase()] = value;
  }
  return out;
}

function sanitizeFundingMap(
  input: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(input)) {
    if (isTradFiAsset(key) || key.includes(":")) continue;
    if (!Number.isFinite(value)) continue;
    out[key.toUpperCase()] = value;
  }
  return out;
}

/**
 * Pull native exchange maps via Hyperliquid adapter only.
 * TradFi spectrum is branched at the source and never mixed into crypto maps.
 */
export async function fetchExchangePriceMaps(): Promise<ExchangePriceMaps> {
  const bundle = await fetchExchangeBundle();
  return bundle.maps;
}

/** Full classified fetch used by the matrix pipeline / API layer */
export async function fetchExchangeBundle(): Promise<ExchangeBundle> {
  const [hlBundle, dydxPerpRaw] = await Promise.all([
    hyperliquidAdapter.fetchClassifiedBundle(),
    fetchDydxPerpMids().catch((err) => {
      console.error("[dYdX] perpetual mid fetch failed", err);
      return {} as Record<string, number>;
    }),
  ]);

  const commodities: CommoditiesSnapshot = { ...hlBundle.commodities };
  const stocks: StocksSnapshot = { ...hlBundle.stocks };
  const indices: IndicesSnapshot = { ...hlBundle.indices };
  const fx: FxSnapshot = { ...hlBundle.fx };
  const preipo: PreIpoSnapshot = { ...hlBundle.preipo };
  const debugSystemLogs = [...(hlBundle.debugSystemLogs ?? [])];

  if (Object.keys(dydxPerpRaw).length === 0) {
    debugSystemLogs.push("[dYdX] WARN: dydxPerp map empty — soil resistance may trip");
  } else {
    debugSystemLogs.push(
      `[dYdX] synced ${Object.keys(dydxPerpRaw).length} perpetual mids`,
    );
  }

  const maps: ExchangePriceMaps = {
    hlSpot: sanitizeCryptoMap(hlBundle.cryptoMaps.hlSpot),
    hlPerp: sanitizeCryptoMap(hlBundle.cryptoMaps.hlPerp),
    dydxPerp: sanitizeCryptoMap(dydxPerpRaw),
    hlFunding: sanitizeFundingMap(hlBundle.cryptoMaps.hlFunding),
    hlDayVolumeUsd: sanitizeCryptoMap(hlBundle.dayVolumeUsd),
  };

  return {
    maps,
    commodities,
    stocks,
    indices,
    fx,
    preipo,
    tradfiEnrichment: hlBundle.tradfiEnrichment,
    debugSystemLogs,
  };
}
