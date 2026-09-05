/** SliverVine Citadel adapter barrel — V1.0 native integrations. */
export {
  evaluateUniswapV3SwapGuard,
  estimateUniswapV3SlippageBps,
  verifyUniswapPoolLiquidity,
  verifyUniswapTickDepth,
  UNISWAP_V3_ARBITRUM_CHAIN_ID,
  type UniswapV3GuardResult,
  type UniswapV3LiquidityResult,
  type UniswapV3SwapInput,
} from "./uniswap/uniswap-v3-adapter";
export {
  evaluateMorphoBlueGuard,
  verifyMorphoOracle,
  computeMorphoPriceDeviationBps,
  MORPHO_ARBITRUM_CHAIN_ID,
  type MorphoBlueGuardResult,
  type MorphoBlueMarketInput,
  type MorphoOracleResult,
} from "./morpho/morpho-blue-adapter";
export {
  evaluateAaveV3Guard,
  verifyAaveHealthFactor,
  computeAaveHealthFactor,
  AAVE_ARBITRUM_CHAIN_ID,
  AAVE_HF_FAIL_CLOSED_THRESHOLD,
  type AaveHealthFactorResult,
  type AaveLendingGuardResult,
  type AaveLendingInput,
} from "./aave/aave-v3-adapter";
export {
  evaluateHyperliquidSessionGuard,
  HL_ORDERBOOK_SPREAD_MAX_BPS,
  HL_SESSION_MAX_SIZE_PER_ORDER_USD,
  HL_SESSION_RATE_LIMIT_PER_MIN,
  type HyperliquidSessionGuardInput,
  type HyperliquidSessionGuardResult,
} from "./hl/hyperliquid-session-guard";
export {
  GMX_POOL_IMBALANCE_MAX_RATIO,
  GMX_COLLATERAL_RESERVE_MIN_RATIO,
  verifyGmxPoolImbalance,
  verifyGmxCollateralReserve,
} from "./gmx/gmx-v2-invariants";
export { evaluateElizaCitadelAction } from "./elizaos/elizaos-citadel-plugin";
export { CitadelRiskGuardTool } from "./langchain/langchain-citadel-tool";
export { evaluateStabilizerSwapGuard, STABILIZER_SEPOLIA_CHAIN_ID } from "./stabilizer/stabilizer-adapter";
export { evaluateVirtualsGameTask } from "./virtuals/virtuals-game-adapter";
export { wayfinderCitadelShieldHook } from "./wayfinder/wayfinder-shield";
