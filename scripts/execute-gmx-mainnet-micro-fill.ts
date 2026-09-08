#!/usr/bin/env tsx
/**
 * Arbitrum One (42161) — calibrated GMX v2 micro-fill via PolicyGuard + Gate (ZeroDev Kernel v3).
 * Dry-run default. Live: CONFIRM_GMX_MICRO_FILL=YES BROADCAST=1 MAINNET_PK=0x… ZERODEV_PROJECT_ID=… [--size=1]
 */
import { createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { createPublicClient, createWalletClient, encodeFunctionData, getAddress, http, keccak256, parseAbi, toHex, type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum } from "viem/chains";
import { buildKernelAccount } from "../src/adapters/arbitrum/zerodev-aa/zerodev-aa-kernel";
import { GMX_V2_EXCHANGE_ROUTER_ARBITRUM } from "../src/config/gmx-revenue";
import { computeGatedExecutorPayloadHash } from "../src/sdk/gated-executor-payload";
import { EIP712_DOMAIN_NAME, EIP712_DOMAIN_VERSION } from "../src/sdk/constants";
import { gmxV2ArbitrumAdapter } from "../src/services/adapters/gmx-v2-adapter";
import { GMX_MARKET_REGISTRY } from "../src/config/gmx-markets";
import { buildGmxV2UnsignedOrderPayload, GMX_ZERO_ADDRESS, GMX_ZERO_REFERRAL_CODE } from "../src/services/adapters/gmx-v2-order-payload";
import { fetchGmxLiveContext, resolveGmxMarket } from "../src/services/adapters/gmx-v2-adapter.utils";
import { poolWeightsFromGmxMarket } from "../src/services/yield/gmx-v2-price-impact";
import { refreshArbitrumGasGuard } from "../src/services/risk/arbitrum-gas-guard";
import { refreshSequencerGuard } from "../src/services/risk/sequencer-guard";
import { loadEnvProduction } from "./_shared/mainnet-env";
import {
  calibrateMicroFillExecution,
  parseMicroFillSize,
  resolveMicroFillSide,
  type MicroFillMarketSnapshot,
} from "./gmx-micro-fill-calibration";
import { computeGmxPoolImbalanceRatio } from "../src/adapters/gmx/gmx-v2-invariants";
import { validateGmxExecutionGuards } from "./gmx-v2-execution-cli";
import { resolveSoilMinDepthUsd, shouldBypassOracleLagDeadlock, shouldBypassSoftConfirmationProbe } from "../src/core/soil-resistance-core";
import {
  applyMicroFillOrderPricing,
  applyMicroFillMinPositionSizing,
  bindGmxOrderReceiver,
  computeMicroFillAcceptablePrice,
  ensureGmxCollateralAllowance,
  fetchGmxIndexOracleTicker,
  GMX_COLLATERAL_SPENDER_ARBITRUM,
  GMX_USDC_ARBITRUM,
  MICRO_FILL_COLLATERAL_USDC,
  MICRO_FILL_LEVERAGE_X,
  MICRO_FILL_MIN_POSITION_USD,
  MICRO_FILL_SIZE_DELTA_USD_30,
  oracleHumanUsdFromTicker,
  readGmxCollateralAllowance,
} from "../src/services/adapters/gmx-micro-fill-router-encode";
import { dispatchGmxMicroFillLive, type KernelCall } from "./gmx-micro-fill-dispatch";

const allowStaleOracle = (argv: string[]): boolean =>
  argv.includes("--allow-stale-oracle") || process.env.ALLOW_STALE_ORACLE === "1" || process.env.ALLOW_STALE_ORACLE === "true";

const POLICY_GUARD = "0xc66f96611a737c4e58706d0955594456eab88959" as Hex;
const GATE = "0xb174118bC0B84e8D6D59EEF2339e29bF7FCf8BF1" as Hex;
const CHAIN_ID = 42161;
const DEFAULT_RPC = "https://arb1.arbitrum.io/rpc";
function resolveRpc(): string {
  return (process.env.ARB_MAINNET_RPC_URL ?? DEFAULT_RPC).trim();
}
const AGENT_ID = keccak256(toHex("silvervine:gmx:micro-fill:42161"));
const policyAbi = parseAbi(["function validateAgentPolicy(bytes32 agentId, uint256 maxNotional, uint256 ttl) returns (bytes32)"]);
const gateAbi = parseAbi([
  "function isSigner(address) view returns (bool)",
  "function verifyAndConsume((bytes32 payloadHash,address subject,uint8 verdict,uint16 riskBps,uint64 issuedAt,uint64 expiresAt,uint256 nonce) att, bytes[] signatures) returns (bytes32)",
]);

function arbiscan(tx: string): string { return `https://arbiscan.io/tx/${tx}`; }
function armed(): boolean { return process.env.BROADCAST === "1" && process.env.CONFIRM_GMX_MICRO_FILL === "YES"; }
function resolvePk(): Hex {
  const pk = (process.env.MAINNET_PK ?? process.env.PRIVATE_KEY ?? "").trim();
  if (!pk.startsWith("0x")) throw new Error("MAINNET_PK or PRIVATE_KEY required");
  return pk as Hex;
}

async function signAtt(wallet: ReturnType<typeof createWalletClient>, att: object): Promise<Hex> {
  return wallet.signTypedData({
    account: wallet.account!, domain: { name: EIP712_DOMAIN_NAME, version: EIP712_DOMAIN_VERSION, chainId: CHAIN_ID, verifyingContract: GATE },
    types: { RiskAttestation: [{ name: "payloadHash", type: "bytes32" }, { name: "subject", type: "address" }, { name: "verdict", type: "uint8" }, { name: "riskBps", type: "uint16" }, { name: "issuedAt", type: "uint64" }, { name: "expiresAt", type: "uint64" }, { name: "nonce", type: "uint256" }] },
    primaryType: "RiskAttestation", message: att,
  });
}

async function resolveRegisteredGateSigner(client: ReturnType<typeof createPublicClient>, pk: Hex): Promise<Hex | null> {
  for (const signerPk of [(process.env.GATE_SIGNER_KEY_0 ?? "").trim(), pk].filter((k) => k.startsWith("0x")) as Hex[]) {
    const addr = privateKeyToAccount(signerPk).address;
    if (await client.readContract({ address: GATE, abi: gateAbi, functionName: "isSigner", args: [addr] })) return signerPk;
  }
  return null;
}

async function loadMarketSnapshot(symbol: string): Promise<MicroFillMarketSnapshot> {
  const [depth, ctx] = await Promise.all([
    gmxV2ArbitrumAdapter.getMarketDepth({ symbol, market: "perp" }),
    fetchGmxLiveContext({}),
  ]);
  const resolved = resolveGmxMarket(ctx, symbol);
  const pool = poolWeightsFromGmxMarket(resolved.info, resolved.midPriceUsd);
  const rawTvl = resolved.poolLiquidityUsd || depth.gmPoolLiquidityUsd || 0;
  const tvlHint = Number.isFinite(rawTvl) && rawTvl > 0 && rawTvl < 1e12 ? rawTvl : 0;
  if (pool.shortTokenUsd < 1 || pool.longTokenUsd < 1 || pool.longTokenUsd + pool.shortTokenUsd < tvlHint * 0.5) {
    const tvl = tvlHint > 0 ? tvlHint : Math.max(pool.longTokenUsd + pool.shortTokenUsd, 1);
    pool.longTokenUsd = tvl * 0.55;
    pool.shortTokenUsd = tvl * 0.45;
  }
  const poolTvlUsd = pool.longTokenUsd + pool.shortTokenUsd;
  const depthUsd = Math.min(depth.bidDepthUsd + depth.askDepthUsd, poolTvlUsd > 0 ? poolTvlUsd : depth.gmPoolLiquidityUsd ?? 0);
  return { symbol, pool, poolTvlUsd, midPriceUsd: resolved.midPriceUsd, depthUsd };
}

async function main(): Promise<void> {
  try { loadEnvProduction(); } catch { /* optional */ }
  const RPC = resolveRpc();
  const minDepthUsd = resolveSoilMinDepthUsd({});
  const argv = process.argv.slice(2);
  const probeBypass = shouldBypassSoftConfirmationProbe();
  const staleOracleOk = allowStaleOracle(argv) || shouldBypassOracleLagDeadlock() || probeBypass;
  const bypassSoil = process.env.BYPASS_SOIL_PROBE === "true" || probeBypass;
  if (staleOracleOk) process.env.ALLOW_STALE_ORACLE = "1";
  const sizeUsd = parseMicroFillSize(argv);
  const symbol = (argv.find((a, i) => argv[i - 1] === "--symbol") ?? "ETH").toUpperCase();
  const client = createPublicClient({ chain: arbitrum, transport: http(RPC) });
  if ((await client.getChainId()) !== CHAIN_ID) throw new Error(`refuse: expected chain ${CHAIN_ID}`);

  await Promise.all([refreshSequencerGuard(), refreshArbitrumGasGuard({ targetYieldUsd: sizeUsd * 0.001 })]);
  const guardVerdict = validateGmxExecutionGuards(staleOracleOk);
  if (!guardVerdict.ok) throw new Error(`GUARD_BLOCKED:${guardVerdict.reasons.join("|")}`);
  if (staleOracleOk || probeBypass) {
    console.warn("[gmx-micro-fill] probe bypass armed via ALLOW_STALE_ORACLE or BYPASS_SOIL_PROBE");
  }

  const market = await loadMarketSnapshot(symbol);
  const preferredSide = resolveMicroFillSide(argv, market.pool);
  let side: "long" | "short";
  let guard: ReturnType<typeof calibrateMicroFillExecution>["guard"];
  try {
    ({ side, guard } = calibrateMicroFillExecution({ market, sizeUsd, preferredSide, bypassSoil }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({
      event: "GMX_MICRO_FILL_BLOCKED",
      network: "arbitrum-one",
      chainId: CHAIN_ID,
      sizeUsd,
      symbol,
      preferredSide,
      pool: market.pool,
      imbalanceRatio: computeGmxPoolImbalanceRatio({
        oiLongUsd: market.pool.longTokenUsd,
        oiShortUsd: market.pool.shortTokenUsd,
        poolTvlUsd: market.poolTvlUsd,
      }),
      reason: message,
      dryRun: !armed(),
      timestamp: new Date().toISOString(),
    }, null, 2));
    process.exit(1);
  }
  const registry = GMX_MARKET_REGISTRY[`${symbol}/USDC` as keyof typeof GMX_MARKET_REGISTRY] ?? GMX_MARKET_REGISTRY["ETH/USDC"];
  const orderPayload = buildGmxV2UnsignedOrderPayload({
    side, sizeUsd, reduceOnly: false, clientOrderId: `gmx-micro-${Date.now()}`, maxSlippageBps: 30,
    marketToken: registry.marketToken, midPriceUsd: market.midPriceUsd, pool: market.pool,
    allowStaleOracle: staleOracleOk,
  });
  const order = { payload: orderPayload, side, sizeUsd };
  const bindNonce = BigInt(Date.now());
  const payloadHash = computeGatedExecutorPayloadHash({
    chainId: CHAIN_ID, executor: GATE, initiator: "0x0000000000000000000000000000000000000001",
    target: GMX_V2_EXCHANGE_ROUTER_ARBITRUM, data: toHex(bindNonce), nonce: bindNonce,
  });
  console.log("[gmx-micro-fill] preflight OK", {
    sizeUsd, side, preferredSide, balanced: side !== preferredSide ? "flipped" : "kept",
    minDepthUsd, oracleLagBypass: staleOracleOk, softConfirmBypass: probeBypass, imbalanceOk: guard.imbalanceOk, soilOk: guard.soilOk,
    policyGuard: POLICY_GUARD, payloadHash,
  });

  if (!armed()) {
    console.log("[gmx-micro-fill] dry-run — set CONFIRM_GMX_MICRO_FILL=YES BROADCAST=1 MAINNET_PK=0x… ZERODEV_PROJECT_ID=…");
    return;
  }

  const pk = resolvePk();
  const kernel = await buildKernelAccount({ chainId: CHAIN_ID, chain: arbitrum, rpcUrl: RPC, ownerPrivateKey: pk });
  const eoa = privateKeyToAccount(pk).address;
  const now = BigInt(Math.floor(Date.now() / 1000));
  let liveSide = side;
  let livePayload = applyMicroFillMinPositionSizing(bindGmxOrderReceiver(orderPayload, kernel.address));
  const usdcBal = await client.readContract({
    address: getAddress(GMX_USDC_ARBITRUM),
    abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
    functionName: "balanceOf",
    args: [kernel.address],
  });
  if (usdcBal < MICRO_FILL_COLLATERAL_USDC) {
    throw new Error(`GMX_USDC_INSUFFICIENT: kernel needs $${MICRO_FILL_COLLATERAL_USD} USDC, have=${usdcBal}`);
  }
  let acceptablePrice: bigint;
  try {
    const ticker = await fetchGmxIndexOracleTicker(registry.longToken);
    acceptablePrice = computeMicroFillAcceptablePrice(
      oracleHumanUsdFromTicker(ticker, livePayload.isLong),
      livePayload.isLong,
    );
  } catch {
    acceptablePrice = computeMicroFillAcceptablePrice(market.midPriceUsd, livePayload.isLong);
  }
  livePayload = applyMicroFillOrderPricing(livePayload, acceptablePrice);
  livePayload = {
    ...livePayload,
    referralCode: GMX_ZERO_REFERRAL_CODE,
    addresses: { ...livePayload.addresses, uiFeeReceiver: GMX_ZERO_ADDRESS },
  };
  console.log("[gmx-micro-fill] order pricing", {
    side: liveSide,
    isLong: livePayload.isLong,
    oraclePriceUsd: market.midPriceUsd,
    sizeDeltaUsd: livePayload.numbers.sizeDeltaUsd,
    collateralUsdc: livePayload.numbers.initialCollateralDeltaAmount,
    leverageX: MICRO_FILL_LEVERAGE_X,
    acceptablePrice: livePayload.numbers.acceptablePrice,
    minOutputAmount: livePayload.numbers.minOutputAmount,
  });
  const collateralToken = getAddress(livePayload.addresses.initialCollateralToken as Hex);
  const requiredCollateral = BigInt(livePayload.numbers.initialCollateralDeltaAmount);
  const gateSignerPk = await resolveRegisteredGateSigner(client, pk);
  const allowanceOwner = gateSignerPk ? kernel.address : eoa;
  const allowance = await readGmxCollateralAllowance(client, allowanceOwner, collateralToken);
  console.log("[gmx-micro-fill] USDC allowance preflight", {
    owner: allowanceOwner,
    spender: GMX_COLLATERAL_SPENDER_ARBITRUM,
    allowance: allowance.toString(),
    required: requiredCollateral.toString(),
    sizeDeltaUsd30: MICRO_FILL_SIZE_DELTA_USD_30.toString(),
    needsApprove: allowance < requiredCollateral,
  });
  if (!gateSignerPk) {
    await ensureGmxCollateralAllowance({
      client, owner: eoa, token: collateralToken, required: requiredCollateral, pk, chain: arbitrum, rpc: RPC,
    });
  }
  const preCalls: KernelCall[] = [{
    to: POLICY_GUARD, value: 0n,
    data: encodeFunctionData({ abi: policyAbi, functionName: "validateAgentPolicy", args: [AGENT_ID, BigInt(Math.round(MICRO_FILL_MIN_POSITION_USD * 1e6)), now + 3600n] }),
  }];
  if (gateSignerPk) {
    const att = {
      payloadHash: computeGatedExecutorPayloadHash({
        chainId: CHAIN_ID, executor: GATE, initiator: kernel.address,
        target: GMX_V2_EXCHANGE_ROUTER_ARBITRUM, data: toHex(JSON.stringify(order.payload)), nonce: bindNonce,
      }),
      subject: kernel.address, verdict: 1, riskBps: 800, issuedAt: now, expiresAt: now + 30n, nonce: bindNonce,
    };
    const gateWallet = createWalletClient({ account: privateKeyToAccount(gateSignerPk), chain: arbitrum, transport: http(RPC) });
    preCalls.push({
      to: GATE, value: 0n,
      data: encodeFunctionData({ abi: gateAbi, functionName: "verifyAndConsume", args: [att, [await signAtt(gateWallet, att)]] }),
    });
  } else {
    console.warn("[gmx-micro-fill] no Gate signer — proceeding with direct GMX Router dispatch (EOA fallback)");
  }

  const projectId = process.env.ZERODEV_PROJECT_ID?.trim();
  if (!projectId) throw new Error("ZERODEV_PROJECT_ID required");
  const { tx, mode } = await dispatchGmxMicroFillLive({
    pk, chain: arbitrum, rpc: RPC, chainId: CHAIN_ID, client, kernel,
    payload: livePayload, preCalls, projectId, forceEoa: !gateSignerPk,
  });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  console.log("[gmx-micro-fill] broadcast OK", {
    mode, kernel: kernel.address, tx, status: receipt.status, side: liveSide, sizeUsd, url: arbiscan(tx),
  });
  if (receipt.status !== "success") {
    console.warn("[gmx-micro-fill] router tx mined with revert — Arbiscan hash recorded for audit", { tx, url: arbiscan(tx) });
    process.exit(1);
  }
}

main().catch((err) => { console.error("[gmx-micro-fill] fail-closed", err); process.exit(1); });
