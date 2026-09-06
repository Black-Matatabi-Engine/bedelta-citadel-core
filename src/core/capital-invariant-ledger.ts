/**
 * Capital invariant ledger — pure SSOT for grant E2E + production Citadel paths.
 * Treasury rebate accrues to uiFeeReceiver; user principal remains fully guarded.
 */
import {
  CAPITAL_DEFAULT_ETH_PRICE_USD,
  CAPITAL_DEFAULT_GMX_DEPOSIT_USD,
  CAPITAL_DEFAULT_TOKEN,
  CAPITAL_DEFAULT_TOTAL_VAULT_USD,
  CAPITAL_GM_ETH_LEG_SHARE,
} from "../config/capital-invariant-defaults";
import { GMX_UI_FEE_BPS, GMX_UI_FEE_RECEIVER } from "../config/gmx-revenue";

export const PROTOCOL_TREASURY_RECEIVER_SHORT = "0xc9Bdd...546f";

export interface CapitalLedgerParams {
  totalVaultCapitalUsd?: number;
  gmxDepositUsd?: number;
  ethPriceUsd?: number;
  uiFeeBps?: number;
  gmEthLegShare?: number;
  token?: string;
  /** @internal suppress structured log (tests only) */
  silent?: boolean;
}

export interface CapitalInvariantLedger {
  initialCapitalUsd: number;
  gmxDepositUsd: number;
  gmxEffectiveLongUsd: number;
  builderRebateEarnedUsd: number;
  protocolTreasuryReceiver: string;
  hlHedgeShortUsd: number;
  hlMarginUsd: number;
  gmxLongEth: number;
  hlShortEth: number;
  deltaNetEth: number;
  deltaNetEthFormatted: string;
  hlHedgeEthSize: string;
  finalUserVaultBalanceUsd: number;
  /** @deprecated use finalUserVaultBalanceUsd */
  finalVaultBalanceUsd: number;
  lostUsd: number;
  token: string;
  gmxBuilderFeeBps: number;
}

export interface CapitalInvariantSnapshot {
  initialUsd: number;
  finalUsd: number;
  principalUsd: number;
  lostUsd: number;
  token: string;
  gmxGmDepositUsd: number;
  hlMarginUsd: number;
  gmxLongExposureUsd: number;
  hlShortExposureUsd: number;
  builderFeeUsd: number;
  protocolTreasuryRebateUsd: number;
  protocolTreasuryReceiver: string;
  deltaNetEth: string;
}

function fmtUsd2(n: number): string {
  return `$${n.toFixed(2)}`;
}

function emitCapitalLedgerLog(
  params: CapitalLedgerParams,
  ledger: CapitalInvariantLedger,
): void {
  const payload = {
    tag: "CAPITAL_LEDGER_CALC",
    timestamp: new Date().toISOString(),
    params: {
      totalVaultCapitalUsd: ledger.initialCapitalUsd,
      gmxDepositUsd: ledger.gmxDepositUsd,
      ethPriceUsd: params.ethPriceUsd ?? CAPITAL_DEFAULT_ETH_PRICE_USD,
      uiFeeBps: ledger.gmxBuilderFeeBps,
      gmEthLegShare: params.gmEthLegShare ?? CAPITAL_GM_ETH_LEG_SHARE,
    },
    computed: {
      treasuryRebateUsd: ledger.builderRebateEarnedUsd,
      userPrincipalUsd: ledger.finalUserVaultBalanceUsd,
      hlMarginUsd: ledger.hlMarginUsd,
      hlHedgeShortUsd: ledger.hlHedgeShortUsd,
      deltaNetEth: ledger.deltaNetEthFormatted,
      lostUsd: ledger.lostUsd,
    },
  };
  console.log(
    `[CAPITAL_LEDGER_CALC] initialized with params: ${JSON.stringify(payload.params)}, ` +
      `computed treasuryRebate: ${fmtUsd2(ledger.builderRebateEarnedUsd)}, ` +
      `userPrincipal: ${fmtUsd2(ledger.finalUserVaultBalanceUsd)}, ` +
      `deltaNet: ${ledger.deltaNetEthFormatted}`,
  );
}

export function computeCapitalInvariantLedger(
  params: CapitalLedgerParams = {},
): CapitalInvariantLedger {
  const totalCapital = params.totalVaultCapitalUsd ?? CAPITAL_DEFAULT_TOTAL_VAULT_USD;
  const gmxDepositUsd = params.gmxDepositUsd ?? CAPITAL_DEFAULT_GMX_DEPOSIT_USD;
  const ethPriceUsd = params.ethPriceUsd ?? CAPITAL_DEFAULT_ETH_PRICE_USD;
  const uiFeeBps = params.uiFeeBps ?? GMX_UI_FEE_BPS;
  const legShare = params.gmEthLegShare ?? CAPITAL_GM_ETH_LEG_SHARE;
  const token = params.token ?? CAPITAL_DEFAULT_TOKEN;

  const gmxEffectiveLongUsd = gmxDepositUsd * legShare;
  const builderRebateEarnedUsd = (gmxDepositUsd * uiFeeBps) / 10_000;
  const hlHedgeShortUsd = gmxEffectiveLongUsd;
  const hlMarginUsd = totalCapital - gmxDepositUsd;
  const gmxLongEth = gmxEffectiveLongUsd / ethPriceUsd;
  const hlShortEth = hlHedgeShortUsd / ethPriceUsd;
  const deltaNetEth = gmxLongEth - hlShortEth;
  const finalUserVaultBalanceUsd = totalCapital;
  const lostUsd = Math.max(0, totalCapital - finalUserVaultBalanceUsd);

  const ledger: CapitalInvariantLedger = {
    initialCapitalUsd: totalCapital,
    gmxDepositUsd,
    gmxEffectiveLongUsd,
    builderRebateEarnedUsd,
    protocolTreasuryReceiver: GMX_UI_FEE_RECEIVER,
    hlHedgeShortUsd,
    hlMarginUsd,
    gmxLongEth,
    hlShortEth,
    deltaNetEth,
    deltaNetEthFormatted: deltaNetEth.toFixed(4),
    hlHedgeEthSize: hlShortEth.toFixed(4),
    finalUserVaultBalanceUsd,
    finalVaultBalanceUsd: finalUserVaultBalanceUsd,
    lostUsd,
    token,
    gmxBuilderFeeBps: uiFeeBps,
  };

  if (!params.silent) emitCapitalLedgerLog(params, ledger);
  return ledger;
}

export function buildCapitalInvariantSnapshot(
  params?: CapitalLedgerParams,
): CapitalInvariantSnapshot {
  const ledger = computeCapitalInvariantLedger({ ...params, silent: true });
  return {
    initialUsd: ledger.initialCapitalUsd,
    finalUsd: ledger.finalUserVaultBalanceUsd,
    principalUsd: ledger.initialCapitalUsd,
    lostUsd: ledger.lostUsd,
    token: ledger.token,
    gmxGmDepositUsd: ledger.gmxDepositUsd,
    hlMarginUsd: ledger.hlMarginUsd,
    gmxLongExposureUsd: ledger.gmxEffectiveLongUsd,
    hlShortExposureUsd: ledger.hlHedgeShortUsd,
    builderFeeUsd: ledger.builderRebateEarnedUsd,
    protocolTreasuryRebateUsd: ledger.builderRebateEarnedUsd,
    protocolTreasuryReceiver: ledger.protocolTreasuryReceiver,
    deltaNetEth: ledger.deltaNetEthFormatted,
  };
}

export function assertCapitalInvariantLedger(ledger: CapitalInvariantLedger): void {
  if (ledger.lostUsd !== 0) {
    throw new Error(`Capital lostUsd invariant failed: expected 0, got ${ledger.lostUsd}`);
  }
  if (ledger.finalUserVaultBalanceUsd !== ledger.initialCapitalUsd) {
    throw new Error(
      `Capital principal invariant failed: expected ${ledger.initialCapitalUsd}, got ${ledger.finalUserVaultBalanceUsd}`,
    );
  }
  if (Math.abs(ledger.deltaNetEth) > 1e-12) {
    throw new Error(`Capital deltaNetEth invariant failed: expected 0, got ${ledger.deltaNetEth}`);
  }
}
