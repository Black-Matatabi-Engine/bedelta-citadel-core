import type {
  ExchangePriceMaps,
  MatrixSuccessResponse,
  PythonGatewayPayload,
} from "../types/matrix";
import { assembleMatrix } from "./assemble-matrix";
import { hktTimestamp } from "./config";
import { fetchAllowlisted } from "./defense/rpc-whitelist";
import { fetchDydxPerpMids } from "./exchanges/dydx-adapter";

/**
 * Normalize optional Python gateway `/matrix` payload into Hyperliquid maps,
 * then assemble the standard matrix response.
 */
function sanitizeDydxMap(input: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value <= 0) continue;
    out[key.toUpperCase()] = value;
  }
  return out;
}

export async function processPythonGatewayData(
  rawJson: PythonGatewayPayload,
): Promise<MatrixSuccessResponse> {
  const hkt = hktTimestamp();
  const items = rawJson.raw?.matrix ?? {};

  const dydxPerp = await fetchDydxPerpMids().catch((err) => {
    console.error("[dYdX] gateway path mid fetch failed", err);
    return {} as Record<string, number>;
  });

  const maps: ExchangePriceMaps = {
    hlSpot: {},
    hlPerp: {},
    dydxPerp: sanitizeDydxMap(dydxPerp),
    hlFunding: {},
  };

  for (const item of Object.values(items)) {
    const symbol = item.pair.toUpperCase();
    if (item.exchange === "Hyperliquid" || item.exchange === "HL") {
      maps.hlSpot[symbol] = item.price;
      maps.hlPerp[symbol] = item.price;
      maps.hlFunding[symbol] = item.funding;
    }
    // Non-Hyperliquid gateway rows are ignored
  }

  const base = assembleMatrix(hkt, maps);
  base.debug_raw_keys = {
    hlSpot: Object.keys(maps.hlSpot),
    hlPerp: Object.keys(maps.hlPerp),
  };
  return base;
}

export async function fetchPythonGateway(
  gatewayUrl: string,
): Promise<PythonGatewayPayload> {
  const response = await fetchAllowlisted(gatewayUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Gateway HTTP ${response.status}`);
  }

  return (await response.json()) as PythonGatewayPayload;
}
