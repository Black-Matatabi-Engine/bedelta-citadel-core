/** USD.ai TypedArray lane pack + bitmask resolve (PROTO_USDAI slot). */
import {
  evaluateUsdAiFlagsFromLane,
  FLAG_USDAI_ORACLE_STALE,
  FLAG_USDAI_PEG_DRIFT,
  FLAGS_CLEAR,
  FLAGS_SEVERED,
  packProtocolLane,
  PROTO_USDAI,
  PROTO_VECT_LEN,
} from "../../core/risk-engine-core";
import { resolveUsdAiClockSsot, type UsdaiSoilInput } from "./usdai-constants";

export function packUsdAiProtocolLane(
  input: UsdaiSoilInput,
  prevSusdaiPriceUsd = input.susdaiPriceUsd,
  out: Float64Array = new Float64Array(PROTO_VECT_LEN),
): Float64Array {
  return packProtocolLane(
    PROTO_USDAI,
    input.susdaiPriceUsd,
    prevSusdaiPriceUsd,
    input.navUsd,
    input.gpuMarkUsd,
    out,
  );
}

export function resolveUsdAiProtocolMask(input: UsdaiSoilInput, emitClockLog = true): number {
  const clock = resolveUsdAiClockSsot(input, emitClockLog);
  if (clock.tripped) return FLAGS_SEVERED;
  const clocked = clock.input;
  const vec = new Float64Array(PROTO_VECT_LEN);
  packUsdAiProtocolLane(clocked, clocked.susdaiPriceUsd, vec);
  return evaluateUsdAiFlagsFromLane(vec, clocked.nowMs, clocked.oracleTimestampMs);
}

export function formatUsdAiFlagMask(flags: number): string {
  const core = flags & ~FLAGS_SEVERED;
  if (core === FLAGS_CLEAR) return "0x0";
  const parts: string[] = [];
  if (core & FLAG_USDAI_ORACLE_STALE) parts.push("USDAI_ORACLE_STALE");
  if (core & FLAG_USDAI_PEG_DRIFT) parts.push("USDAI_PEG_DRIFT");
  return parts.length > 0 ? parts.join("|") : `0x${core.toString(16)}`;
}
