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
import type { UsdaiSoilInput } from "./usdai-constants";

let usdaiVec: Float64Array | undefined;
function getUsdAiVec(out?: Float64Array): Float64Array {
  if (out) return out;
  if (!usdaiVec) usdaiVec = new Float64Array(PROTO_VECT_LEN);
  return usdaiVec;
}

export function packUsdAiProtocolLane(
  input: UsdaiSoilInput,
  prevSusdaiPriceUsd = input.susdaiPriceUsd,
  out: Float64Array = getUsdAiVec(),
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

export function resolveUsdAiProtocolMask(input: UsdaiSoilInput): number {
  packUsdAiProtocolLane(input);
  return evaluateUsdAiFlagsFromLane(getUsdAiVec(), input.nowMs, input.oracleTimestampMs);
}

export function formatUsdAiFlagMask(flags: number): string {
  const core = flags & ~FLAGS_SEVERED;
  if (core === FLAGS_CLEAR) return "0x0";
  const parts: string[] = [];
  if (core & FLAG_USDAI_ORACLE_STALE) parts.push("USDAI_ORACLE_STALE");
  if (core & FLAG_USDAI_PEG_DRIFT) parts.push("USDAI_PEG_DRIFT");
  return parts.length > 0 ? parts.join("|") : `0x${core.toString(16)}`;
}
