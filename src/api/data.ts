import type { Env } from "../env";
import { hardlockResponse } from "./hardlock-response";
import { CORS_JSON_HEADERS, resolveConfig } from "../services/config";
import { humanizeSystemLogs } from "../services/humanize-log";
import { computeIsMacroBlocking } from "../services/macro-radar";
import {
  HardlockError,
  isTsunamiShieldWindow,
} from "../services/risk-control";
import {
  saveMatrixPayloadToKV,
  saveSystemStateToKV,
} from "../services/kv-store";
import { buildMatrixPayload } from "../services/matrix-pipeline";
import {
  buildSystemStateFromSignals,
  DEFAULT_ACCOUNT_BALANCE_USD,
} from "../services/systemState";
import type {
  CommoditiesSnapshot,
  FxSnapshot,
  IndicesSnapshot,
  MatrixErrorResponse,
  MatrixRow,
  MatrixSuccessResponse,
  PreIpoSnapshot,
  StocksSnapshot,
} from "../types/matrix";

/** Force TradFi payload keys to lowercase for dashboard alignment */
function normalizeTradFiKeys(
  input: Record<string, number | undefined> | undefined,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!input) return out;
  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      continue;
    }
    out[key.toLowerCase()] = value;
  }
  return out;
}

/**
 * GET /api/data — TradFi spectrum display + Rule A filtered Hyperliquid crypto pairs.
 * No client-IP gating; outbound RPC hosts are allowlisted at the adapter layer.
 */
export async function handleDataRequest(
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    const config = resolveConfig(env);
    const { data: pipeline } = await buildMatrixPayload(config);

    const cryptoRows: MatrixRow[] = (
      Array.isArray(pipeline.matrix)
        ? pipeline.matrix
        : Array.isArray(pipeline.data)
          ? pipeline.data
          : []
    ).filter(
      (row) =>
        !!row.b1_symbol &&
        !row.b1_symbol.toUpperCase().includes("XYZ:") &&
        !row.b1_symbol.includes(":") &&
        row.onHyperliquid === true &&
        row.d1_hl_perp > 0 &&
        (row.passedRule === "A" || row.passedRule === "B"),
    );

    const commodities = normalizeTradFiKeys(
      pipeline.commodities,
    ) as CommoditiesSnapshot;
    const stocks = normalizeTradFiKeys(pipeline.stocks) as StocksSnapshot;
    const indices = normalizeTradFiKeys(pipeline.indices) as IndicesSnapshot;
    const fx = normalizeTradFiKeys(pipeline.fx) as FxSnapshot;
    const preipo = normalizeTradFiKeys(pipeline.preipo) as PreIpoSnapshot;

    const rawLogs = Array.isArray(pipeline.debug_system_logs)
      ? pipeline.debug_system_logs
      : [];

    const tsunamiActive = isTsunamiShieldWindow();
    const vix = pipeline.vix_traditional ?? 16.8;
    const dvol = pipeline.dvol_crypto ?? 52.5;
    const macroBlocking = computeIsMacroBlocking();

    const systemState = buildSystemStateFromSignals(
      {
        tsunamiShieldActive: tsunamiActive,
        matrixRows: cryptoRows,
        vix,
        dvol,
        macroBlocking,
      },
      DEFAULT_ACCOUNT_BALANCE_USD,
    );

    const finalPayload: MatrixSuccessResponse = {
      success: true,
      timestamp_hkt: pipeline.timestamp_hkt,
      vix_traditional: vix,
      dvol_crypto: dvol,
      vix,
      commodities,
      stocks,
      indices,
      fx,
      preipo,
      matrix: cryptoRows,
      data: cryptoRows,
      funding_rate_kings: pipeline.funding_rate_kings,
      hl_universe: pipeline.hl_universe,
      tradfi_enrichment: pipeline.tradfi_enrichment,
      tsunami_shield_active: tsunamiActive,
      debug_info: pipeline.debug_info,
      debug_raw_keys: pipeline.debug_raw_keys,
      debug_system_logs: humanizeSystemLogs(rawLogs),
      systemState,
    };

    ctx.waitUntil(
      Promise.all([
        saveMatrixPayloadToKV(env.SLIVERVINE_KV, finalPayload),
        saveSystemStateToKV(env.SLIVERVINE_KV, systemState),
      ]).catch((err) => {
        console.error("[kv-store-waitUntil]", err);
      }),
    );

    return new Response(JSON.stringify(finalPayload), {
      status: 200,
      headers: CORS_JSON_HEADERS,
    });
  } catch (error) {
    if (error instanceof HardlockError) {
      return hardlockResponse(error, DEFAULT_ACCOUNT_BALANCE_USD);
    }

    console.error("[API] /api/data failed", error);
    const message = error instanceof Error ? error.message : String(error);
    const friendly =
      humanizeSystemLogs([message])[0] ??
      "[System] Sync unavailable — retry shortly";
    const body: MatrixErrorResponse = { success: false, error: friendly };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
