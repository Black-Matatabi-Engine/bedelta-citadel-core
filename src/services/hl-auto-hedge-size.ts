/** HL auto-hedge notional sizing — legacy cron vs Citadel grant SSOT ledger anchor. */
import {
  computeCapitalInvariantLedger,
  type CapitalLedgerParams,
} from "../core/capital-invariant-ledger";
import {
  HL_AUTO_HEDGE_ETH_MID_FALLBACK_USD,
  HL_AUTO_HEDGE_MAX_NOTIONAL_USD,
  HL_AUTO_HEDGE_MIN_MARGIN_USD,
  HL_AUTO_HEDGE_MIN_NOTIONAL_USD,
} from "./hl-auto-hedge-status";

export interface ComputeAutoHedgeSizeUsdOptions {
  citadelGrantMode?: boolean;
  ledgerParams?: CapitalLedgerParams;
}

function emitAutoHedgeSizeLog(details: Record<string, number | string | boolean>): void {
  console.log(
    JSON.stringify({
      tag: "HL_AUTO_HEDGE_SIZE",
      timestamp: new Date().toISOString(),
      ...details,
    }),
  );
}

export function computeAutoHedgeSizeUsd(
  gmLiquidityUsd: number,
  hlMarginUsd: number,
  ethMidUsd = HL_AUTO_HEDGE_ETH_MID_FALLBACK_USD,
  options?: ComputeAutoHedgeSizeUsdOptions,
): number {
  if (gmLiquidityUsd <= 0 || hlMarginUsd < HL_AUTO_HEDGE_MIN_MARGIN_USD) {
    emitAutoHedgeSizeLog({ mode: options?.citadelGrantMode ? "citadel-grant" : "legacy", sizeUsd: 0, reason: "BELOW_MIN_MARGIN" });
    return 0;
  }

  if (options?.citadelGrantMode) {
    const ledger = computeCapitalInvariantLedger({
      ...options.ledgerParams,
      ethPriceUsd: options.ledgerParams?.ethPriceUsd ?? ethMidUsd,
      silent: true,
    });
    const legShare = ledger.gmxEffectiveLongUsd / ledger.gmxDepositUsd;
    const leverageRatio = ledger.hlMarginUsd > 0 ? ledger.hlHedgeShortUsd / ledger.hlMarginUsd : 0;
    const gmCap = gmLiquidityUsd * legShare;
    const marginCap = hlMarginUsd * leverageRatio;
    const sizeUsd = Math.min(ledger.hlHedgeShortUsd, gmCap, marginCap);
    emitAutoHedgeSizeLog({
      mode: "citadel-grant",
      gmLiquidityUsd,
      hlMarginUsd,
      anchorUsd: ledger.hlHedgeShortUsd,
      gmCap,
      marginCap,
      sizeUsd,
    });
    return sizeUsd;
  }

  const targetUsd = Math.min(gmLiquidityUsd * 0.25, HL_AUTO_HEDGE_MAX_NOTIONAL_USD);
  const riskCap = Math.min(gmLiquidityUsd * 0.95, hlMarginUsd * 0.95);
  const bounded = Math.min(
    Math.max(targetUsd, HL_AUTO_HEDGE_MIN_NOTIONAL_USD),
    HL_AUTO_HEDGE_MAX_NOTIONAL_USD,
  );
  const sizeUsd = Math.min(bounded, riskCap);
  emitAutoHedgeSizeLog({ mode: "legacy", gmLiquidityUsd, hlMarginUsd, targetUsd, riskCap, sizeUsd });
  return sizeUsd;
}
