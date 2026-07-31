/**
 * SilverVine / BeDelta services barrel — venue adapters + Santenmoku Three-Eye audit.
 */

export {
  FOOL_PROOF_MAX_LEVERAGE,
  FOOL_PROOF_MAX_RETAIL_POSITION_RATIO,
  HL_SESSION_KEY_ALLOWED_CONTRACTS,
  FoolProofRejectedError,
  VineShieldRejectedError,
  assertVineShield,
  assertFoolProofGuard,
  checkVineShield,
  checkFoolProofGuard,
  checkFoolProofOrder,
  runVineShieldSoilGate,
  checkSoilResistanceWithFoolProofGuard,
  type VineShieldInput,
  type VineShieldOrder,
  type VineShieldProfile,
  type VineShieldResult,
  type FoolProofGuardInput,
  type FoolProofOrder,
  type FoolProofProfile,
  type FoolProofResult,
} from "./fool-proof-guard";

export {
  VINE_SOIL_MAX_SLIPPAGE,
  checkSoilResistanceWithVine,
  vineWrapProtection,
} from "./risk-control";

export {
  HyperliquidAdapter,
  hyperliquidAdapter,
  hyperliquidSnapshotToMaps,
  fetchHyperliquidMaps,
  parseHyperliquidResponse,
  calculateLiqDistance,
  evaluateSoilResistance,
  calculateNetDelta,
  type HyperliquidMaps,
  type HyperliquidParseBundle,
  type PositionStatus,
  type MarginHealthTier,
} from "./hyperliquid-adapter";

export {
  JUPITER_QUOTE_URL,
  JUPITER_SWAP_URL,
  PGATE_MAX_SLIPPAGE_BPS,
  DefenseMatrixError as JupiterDefenseMatrixError,
  JupiterApiError,
  assertSystemStateGates as assertJupiterSystemStateGates,
  evaluateJupiterSoilResistance,
  fetchJupiterQuote,
  buildJupiterSwapTransaction,
  executeJupiterSwapPipeline,
  type JupiterQuoteParams,
  type JupiterQuoteResponse,
  type JupiterSoilEvaluation,
  type JupiterSwapTransactionPayload,
  type JupiterExecutionResult,
} from "./jupiter-adapter";

export {
  POLYMARKET_CLOB_URL,
  MAX_BINARY_SPREAD,
  MIN_BINARY_LIQUIDITY_USD,
  DefenseMatrixError as PolymarketDefenseMatrixError,
  PolymarketApiError,
  assertSystemStateGates as assertPolymarketSystemStateGates,
  evaluatePolymarketFriction,
  fetchPolymarketOrderbook,
  type PolymarketOrderbookParams,
  type PolymarketQuoteResponse,
  type BinaryHedgeRatio,
  type PolymarketFrictionEvaluation,
} from "./polymarket-adapter";

export {
  TELEMETRY_VENUES,
  DEFAULT_COUNTER_ATTACK_COIN,
  auditThreeEyeAdapters,
  evaluateSantenmokuHub,
  evaluateCounterAttackSync,
  readCounterAttackTelemetryStatus,
  resolveCounterAttackStatus,
  buildCounterAttackInputFromMetrics,
  type TelemetryVenue,
  type SantenmokuThreeEyeStatus,
  type CounterAttackStatus,
  type VenueAdapterAudit,
  type ThreeEyeAuditResult,
  type SantenmokuHubResult,
  type EvaluateSantenmokuHubOptions,
} from "./santenmoku-three-eye";

export {
  HL_L1_CHAIN_ID,
  HL_SESSION_KEY_AGENT_NAME,
  DefenseMatrixError as SessionKeyDefenseMatrixError,
  resolveR20Locked,
  severSigningChannel,
  assertSessionKeyExecutionGates,
  buildSessionKeyEip712Stub,
  stubSignSessionKeyPayload,
  signAndExecuteOrder,
  type SessionKeyOrderTif,
  type SessionKeyOrderType,
  type SessionKeyOrderPayload,
  type SigningResult,
  type SessionKeyEip712Stub,
  type SignAndExecuteOptions,
} from "./session-key-adapter";

export {
  KV_KEYS,
  KV_TTL_SECONDS,
  saveSystemStateToKV,
  saveMatrixPayloadToKV,
  saveMarketSnapshotToKV,
  saveSoakTelemetryToKV,
  appendRiskLogToKV,
  readSystemStateFromKV,
  type KvWriteResult,
  type SystemStateKvRecord,
  type RiskLogEntry,
  type RiskLogRollingRecord,
  type SliverVineKv,
} from "./kv-store";

export {
  extractCriticalKvFlags,
  shouldPersistSystemStateToKv,
  shouldPersistMatrixPayloadToKv,
  type CriticalKvFlags,
} from "./stateManager";

export {
  sendPanicAlert,
  formatPanicAlertMessage,
  type PanicMetrics,
  type TelegramEnv,
  type SendPanicAlertResult,
} from "./telegram-notifier";

export {
  RECOVERY_COOLDOWN_MS,
  NORMALIZED_SPREAD_MAX,
  recordSoilViolation,
  recordSpreadSample,
  isSoftR20Deadlock,
  vineMeshAutoRecovery,
  checkCircuitRecovery,
  getVineMeshRecoveryCount,
  type VineMeshRecoveryResult,
  type CircuitRecoveryResult,
} from "./circuit-breaker";

export {
  SOAK_TELEMETRY_KV_KEY,
  SOAK_ROLLING_MAX_TICKS,
  SOAK_TELEMETRY_COINS,
  runSoakTelemetryTick,
  evaluateSoakCoinTick,
  appendSoakTicks,
  readInMemorySoakLog,
  type SoakTelemetryTick,
  type SoakTelemetryRollingLog,
  type RunSoakTelemetryTickOptions,
} from "./soak-telemetry";
