/** Dynamic E2E financial ledger — HUD, proof JSON, and invariant assertions derive from here. */
import {
  DEMO_ETH_MID,
  DEMO_TOKEN,
  GMX_BUILDER_FEE_BPS,
  GMX_GM_DEPOSITED_USD,
  GMX_GM_ETH_LEG_SHARE,
  TOTAL_VAULT_CAPITAL_USD,
} from "./e2e-demo-constants";

export const E2E_PROTOCOL_TREASURY_RECEIVER = "0xc9BddABD80982d2201376195DD9B85fb7951546f";
export const E2E_PROTOCOL_TREASURY_RECEIVER_SHORT = "0xc9Bdd...546f";

export interface E2eFinancialLedger {
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

export interface E2eCapitalInvariant {
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

export function computeE2eFinancialLedger(ethPriceUsd = DEMO_ETH_MID): E2eFinancialLedger {
  const initialCapitalUsd = TOTAL_VAULT_CAPITAL_USD;
  const gmxDepositUsd = GMX_GM_DEPOSITED_USD;
  const gmxEffectiveLongUsd = gmxDepositUsd * GMX_GM_ETH_LEG_SHARE;
  const builderRebateEarnedUsd = (gmxDepositUsd * GMX_BUILDER_FEE_BPS) / 10_000;
  const hlHedgeShortUsd = gmxEffectiveLongUsd;
  const hlMarginUsd = initialCapitalUsd - gmxDepositUsd;
  const gmxLongEth = gmxEffectiveLongUsd / ethPriceUsd;
  const hlShortEth = hlHedgeShortUsd / ethPriceUsd;
  const deltaNetEth = gmxLongEth - hlShortEth;
  const finalUserVaultBalanceUsd = initialCapitalUsd;
  const lostUsd = Math.max(0, initialCapitalUsd - finalUserVaultBalanceUsd);

  return {
    initialCapitalUsd,
    gmxDepositUsd,
    gmxEffectiveLongUsd,
    builderRebateEarnedUsd,
    protocolTreasuryReceiver: E2E_PROTOCOL_TREASURY_RECEIVER,
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
    token: DEMO_TOKEN,
    gmxBuilderFeeBps: GMX_BUILDER_FEE_BPS,
  };
}

export function buildE2eCapitalInvariant(ethPriceUsd = DEMO_ETH_MID): E2eCapitalInvariant {
  const ledger = computeE2eFinancialLedger(ethPriceUsd);
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

export function assertE2eFinancialInvariants(ledger: E2eFinancialLedger): void {
  if (ledger.lostUsd !== 0) {
    throw new Error(`E2E lostUsd invariant failed: expected 0, got ${ledger.lostUsd}`);
  }
  if (ledger.finalUserVaultBalanceUsd !== ledger.initialCapitalUsd) {
    throw new Error(
      `E2E principal invariant failed: expected ${ledger.initialCapitalUsd}, got ${ledger.finalUserVaultBalanceUsd}`,
    );
  }
  if (Math.abs(ledger.deltaNetEth) > 1e-12) {
    throw new Error(`E2E deltaNetEth invariant failed: expected 0, got ${ledger.deltaNetEth}`);
  }
}
