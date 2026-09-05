/** Radiant Capital lending guard constants — Arbitrum One. */
import { ARBITRUM_ONE_CHAIN_ID } from "../../sdk/constants";

export const RADIANT_ARBITRUM_CHAIN_ID = ARBITRUM_ONE_CHAIN_ID;
/** Citadel fail-closed HF floor for risk-increasing intents. */
export const RADIANT_HF_FAIL_CLOSED_THRESHOLD = 1.15;
export const RADIANT_HF_LIQUIDATION_THRESHOLD = 1.0;
/** Cross-chain dest HF must not trail source by more than this buffer. */
export const RADIANT_CROSS_CHAIN_HF_BUFFER = 0.05;
