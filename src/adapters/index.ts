/** SliverVine Citadel adapter barrel — V1.0 native integrations. */
export {
  evaluateCamelotV3SwapGuard,
  estimateCamelotV3SlippageBps,
  verifyCamelotPoolLiquidity,
  verifyCamelotTickDepth,
  CAMELOT_V3_ARBITRUM_CHAIN_ID,
  type CamelotV3GuardResult,
  type CamelotV3LiquidityResult,
  type CamelotV3SwapInput,
} from "./camelot/camelot-v3-adapter";
export {
  evaluateJonesVaultGuard,
  verifyJonesVaultSharePrice,
  computeJonesShareSlippageBps,
  JONES_ARBITRUM_CHAIN_ID,
  type JonesVaultGuardResult,
  type JonesVaultInput,
  type JonesVaultShareResult,
} from "./jones/jones-vault-adapter";
export {
  evaluateRadiantLendingGuard,
  verifyRadiantHealthFactor,
  computeRadiantHealthFactor,
  RADIANT_ARBITRUM_CHAIN_ID,
  RADIANT_HF_FAIL_CLOSED_THRESHOLD,
  type RadiantHealthFactorResult,
  type RadiantLendingGuardResult,
  type RadiantLendingInput,
} from "./radiant/radiant-lending-adapter";
export { evaluateElizaCitadelAction } from "./elizaos/elizaos-citadel-plugin";
export { CitadelRiskGuardTool } from "./langchain/langchain-citadel-tool";
export { evaluateStabilizerSwapGuard, STABILIZER_SEPOLIA_CHAIN_ID } from "./stabilizer/stabilizer-adapter";
export { evaluateVirtualsGameTask } from "./virtuals/virtuals-game-adapter";
export { wayfinderCitadelShieldHook } from "./wayfinder/wayfinder-shield";
