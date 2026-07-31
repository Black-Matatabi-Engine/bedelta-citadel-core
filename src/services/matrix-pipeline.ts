import type { MatrixSuccessResponse } from "../types/matrix";
import { assembleMatrix } from "./assemble-matrix";
import {
  DEFAULT_DVOL,
  DEFAULT_VIX,
  hktTimestamp,
  type RuntimeConfig,
} from "./config";
import { fetchExchangeBundle } from "./exchanges/fetch-exchange-maps";
import { fetchPythonGateway, processPythonGatewayData } from "./gateway";

async function fetchNativeExchangeData(
  tokens: readonly string[],
): Promise<MatrixSuccessResponse> {
  const hkt = hktTimestamp();
  const bundle = await fetchExchangeBundle();
  const base = assembleMatrix(hkt, bundle.maps, tokens);

  base.commodities = bundle.commodities;
  base.stocks = bundle.stocks;
  base.indices = bundle.indices;
  base.fx = bundle.fx;
  base.preipo = bundle.preipo;
  base.tradfi_enrichment = bundle.tradfiEnrichment;
  base.data = base.matrix;
  base.debug_system_logs = [...(bundle.debugSystemLogs ?? [])];
  base.debug_raw_keys = {
    hlSpotKeys: Object.keys(bundle.maps.hlSpot).slice(0, 15),
    hlPerpKeys: Object.keys(bundle.maps.hlPerp).slice(0, 15),
  };
  return base;
}

export interface MatrixPipelineResult {
  data: MatrixSuccessResponse;
  source: string;
}

/**
 * Orchestrates gateway vs native exchange fetch into a typed matrix payload.
 */
export async function buildMatrixPayload(
  config: RuntimeConfig,
): Promise<MatrixPipelineResult> {
  let data: MatrixSuccessResponse;
  let source: string;

  if (config.usePythonGateway) {
    try {
      const raw = await fetchPythonGateway(config.pythonGatewayUrl);
      data = await processPythonGatewayData(raw);
      source = "Python Gateway";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[PIPELINE] gateway failed, falling back to native", err);
      data = await fetchNativeExchangeData(config.defaultTokens);
      source = `Native Fallback (Gateway Error: ${message})`;
    }
  } else {
    data = await fetchNativeExchangeData(config.defaultTokens);
    source = "Direct Native Fetch";
  }

  data.debug_info = { source };
  data.vix = DEFAULT_VIX;
  data.vix_traditional = DEFAULT_VIX;
  data.dvol_crypto = DEFAULT_DVOL;
  data.data = data.matrix;
  data.commodities = data.commodities ?? {};
  data.stocks = data.stocks ?? {};
  data.indices = data.indices ?? {};
  data.fx = data.fx ?? {};
  data.preipo = data.preipo ?? {};
  data.tradfi_enrichment = data.tradfi_enrichment ?? {
    commodities: {},
    stocks: {},
    indices: {},
    fx: {},
    preipo: {},
    kings: {},
  };
  data.debug_system_logs = data.debug_system_logs ?? [];

  return { data, source };
}
