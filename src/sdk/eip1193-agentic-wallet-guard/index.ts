/**
 * SPDX-License-Identifier: Apache-2.0
 * @module @slivervine/eip1193-agentic-wallet-guard
 */
export {
  withRetailGuardProvider,
  announceGuardedProvider,
  resolveInjectedEthereum,
  RetailGuardRejectedError,
} from "./provider";
export type {
  EIP6963ProviderInfo,
  EIP6963ProviderDetail,
  AnnounceGuardedProviderOptions,
  EIP6963EventTarget,
} from "./provider";
export { evaluateRetailRisk, parseTypedDataPayload } from "./risk-evaluator";
export {
  __resetRetailGuardStateForTests,
  isRetailGuardChannelSevered,
  evaluateRetailSoilGate,
  evaluateRetailIntentGate,
  evaluateRetailApproveGate,
  evaluateRetailVenueAllowlist,
  evaluateRpcTransportProtocol,
  resolveVenueBitFromContract,
  RETAIL_UNKNOWN_VENUE_BIT,
} from "./guard-engine";
export {
  evaluateTransportStreamSync,
  verifyTransportBitmark,
  bindTransportStreamScratch,
  isRpcTransportSyncFailed,
  __resetTransportStreamForTests,
  RPC_TRANSPORT_SYNC_FAIL_THRESHOLD,
  TS_RING_BASE,
} from "./transport-stream";
export type { TransportStreamSyncSnapshot } from "./transport-stream";
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
  encodePermit2ApproveCalldata,
  encodePermit2PermitCalldata,
  readSelectorU32,
  isInfiniteApproval,
  UINT256_MAX,
  UINT160_MAX,
  SEL_ERC20_APPROVE,
  SEL_ERC20_TRANSFER,
  SEL_PERMIT2_PERMIT,
  SEL_PERMIT2_APPROVE,
  SELECTOR_ERC20_APPROVE,
  SELECTOR_ERC20_TRANSFER,
  SELECTOR_UNISWAP_V2_SWAP_EXACT,
  SELECTOR_UNISWAP_V3_EXACT_INPUT_SINGLE,
  SELECTOR_GMX_MULTICALL,
  SELECTOR_PERMIT2_PERMIT,
  SELECTOR_PERMIT2_APPROVE,
} from "./calldata-parser";
export {
  evaluateErc7683CrossChainIntentGuard,
  computeCrossChainExecutionDeltaBps,
  computeSolverMevBps,
  ERC7683_CODES,
  type CrossChainOrder,
  type Erc7683GuardVerdict,
  type Erc7683RejectCode,
} from "./erc7683-intent-guard";
export {
  decodeEip7702Authorization,
  evaluateEip7702AuthGuard,
  EIP7702_CODES,
  type Eip7702Authorization,
  type Eip7702AuthGuardConfig,
  type Eip7702AuthVerdict,
  type Eip7702RejectCode,
} from "./eip7702-auth-guard";
export { formatRetailWarning } from "./warnings";
export type {
  EIP1193Provider,
  RetailGuardConfig,
  RetailGuardReasonCode,
  RetailGuardRejectPayload,
  RetailGuardRiskInput,
  RetailSoilQuote,
} from "./types";
export type {
  ParsedCalldata,
  ParsedApprove,
  ParsedSwap,
  ParsedTransfer,
  ParsedPermit2Approve,
  ParsedPermit2Permit,
} from "./calldata-parser";
