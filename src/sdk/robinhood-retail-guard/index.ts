/**
 * SPDX-License-Identifier: Apache-2.0
 * @module @slivervine/robinhood-retail-guard
 */
export { withRetailGuardProvider, RetailGuardRejectedError } from "./provider";
export { evaluateRetailRisk, parseTypedDataPayload } from "./risk-evaluator";
export {
  __resetRetailGuardStateForTests,
  isRetailGuardChannelSevered,
  evaluateRetailSoilGate,
  evaluateRetailIntentGate,
  evaluateRetailApproveGate,
  evaluateRetailVenueAllowlist,
  resolveVenueBitFromContract,
  RETAIL_UNKNOWN_VENUE_BIT,
} from "./guard-engine";
export {
  ensureRetailGuardWasm,
  isRetailGuardWasmReady,
  evaluateSoilViaWasm,
  evaluateIntentGateViaWasm,
  __resetRetailGuardWasmForTests,
} from "./wasm-adapter";
export {
  parseTransactionCalldata,
  parseSelector,
  encodeApproveCalldata,
  readSelectorU32,
  isInfiniteApproval,
  UINT256_MAX,
  SEL_ERC20_APPROVE,
  SEL_ERC20_TRANSFER,
  SELECTOR_ERC20_APPROVE,
  SELECTOR_ERC20_TRANSFER,
  SELECTOR_UNISWAP_V2_SWAP_EXACT,
  SELECTOR_UNISWAP_V3_EXACT_INPUT_SINGLE,
  SELECTOR_GMX_MULTICALL,
} from "./calldata-parser";
export { formatRetailWarning } from "./warnings";
export type {
  EIP1193Provider,
  RetailGuardConfig,
  RetailGuardReasonCode,
  RetailGuardRejectPayload,
  RetailGuardRiskInput,
  RetailSoilQuote,
} from "./types";
export type { ParsedCalldata, ParsedApprove, ParsedSwap, ParsedTransfer } from "./calldata-parser";
