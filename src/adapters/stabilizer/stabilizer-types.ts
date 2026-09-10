import type { StabilizerAsset } from "./stabilizer-constants";

export interface StabilizerSwapInput {
  chainId: number;
  fromAsset: StabilizerAsset;
  toAsset: StabilizerAsset;
  amountUsd: number;
  poolReserveUsd: number;
  poolCapacityUsd: number;
  reserveFloorUsd?: number;
  minReserveRatio?: number;
  usdzMarkUsd?: number;
  collateralMarkUsd?: number;
  agentId?: string;
  nowMs?: number;
  at?: Date;
}

export interface StabilizerGuardResult {
  ok: boolean;
  status: "ALLOW" | "FAIL_CLOSED" | "MANDATORY_COOLDOWN_ACTIVE";
  reasons: string[];
  capacityOk: boolean;
  reserveOk: boolean;
  reserveRatioOk: boolean;
  pegOk: boolean;
  soilOk: boolean;
  zeroSlippage: boolean;
  signatureChannelSevered: boolean;
  latencyUs?: number;
}
