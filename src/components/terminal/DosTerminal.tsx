// Copyright (c) 2026 SilverVine Labs (qum0x & Javier). All Rights Reserved.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  checkSoilResistance,
  MAX_SLIPPAGE,
} from "../../services/risk-control";
import type { SystemState } from "../../services/systemState";

export interface DosBookLevel {
  price: number;
  size: number;
}

export interface DosOrderbookSnapshot {
  symbol: string;
  lastPrice?: number;
  tickSize?: number;
  bids: readonly DosBookLevel[];
  asks: readonly DosBookLevel[];
}

export type DosViewMode = "santenmoku" | "minimal";
export type DosSide = "LONG" | "SHORT";
export type DosOrderType = "MARKET" | "LIMIT";
export type DosRiskPreset = "25" | "50" | "MAX";
type MarketToken = "BTC-PERP" | "ETH-PERP" | "SOL-PERP";

export interface DosTerminalProps {
  systemState: SystemState;
  viewMode?: DosViewMode;
  onViewModeChange?: (mode: DosViewMode) => void;
  latencyMs?: number;
  orderbook?: DosOrderbookSnapshot;
  quantity?: number;
  leverage?: number;
  onQtyChange?: (qty: number) => void;
  onLeverageChange?: (leverage: number) => void;
  onFire?: () => void;
  onHardLock?: () => void;
  onEmergencyFlush?: () => void;
}

interface ExecutionIntent {
  side: DosSide;
  orderType: DosOrderType;
  qty: number;
  leverage: number;
  limitPrice: number | null;
  riskBudgetUsd: number;
  dryRun: boolean;
}

interface MockPositionSnapshot {
  quantity: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPct: number;
}

interface MockOrderBookSnapshot extends DosOrderbookSnapshot {
  lastPrice: number;
}

interface MarketMeta {
  mark: number;
  change24h: string;
  oi: string;
  oiDelta24h: string;
  funding: string;
  countdown: string;
  frPlus8h: string;
  frPlusApy: string;
  frMinus8h: string;
  frMinusApy: string;
  netFrictionApy: string;
  base: number;
  spread: number;
}

interface FundingChartPoint {
  x: number;
  frPlus: number;
  frMinus: number;
}

const MARKET_META: Record<MarketToken, MarketMeta> = {
  "BTC-PERP": {
    mark: 63_623,
    change24h: "-0.53%",
    oi: "$2.22B",
    oiDelta24h: "+4.12% ▲",
    funding: "0.0013%",
    countdown: "00:44:05",
    frPlus8h: "+0.012% / 8h",
    frPlusApy: "+13.14% APY",
    frMinus8h: "-0.004% / 8h",
    frMinusApy: "-4.38% APY",
    netFrictionApy: "+8.76% APY",
    base: 63_623,
    spread: 0.5,
  },
  "ETH-PERP": {
    mark: 3_452.8,
    change24h: "+0.18%",
    oi: "$1.08B",
    oiDelta24h: "+1.24% ▲",
    funding: "0.0008%",
    countdown: "00:31:18",
    frPlus8h: "+0.008% / 8h",
    frPlusApy: "+8.64% APY",
    frMinus8h: "-0.003% / 8h",
    frMinusApy: "-3.24% APY",
    netFrictionApy: "+5.40% APY",
    base: 3_452.8,
    spread: 0.12,
  },
  "SOL-PERP": {
    mark: 178.42,
    change24h: "+1.92%",
    oi: "$412M",
    oiDelta24h: "+2.61% ▲",
    funding: "0.0005%",
    countdown: "00:19:42",
    frPlus8h: "+0.006% / 8h",
    frPlusApy: "+6.48% APY",
    frMinus8h: "-0.002% / 8h",
    frMinusApy: "-2.16% APY",
    netFrictionApy: "+4.32% APY",
    base: 178.42,
    spread: 0.02,
  },
};

interface IntentWindow extends Window {
  __svDosExecutionIntent?: ExecutionIntent;
}

function currency(value: number, digits = 2): string {
  return `$${Number.isFinite(value) ? value.toFixed(digits) : "0.00"}`;
}

function safeNumber(value: number | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

function sumNotional(levels: readonly DosBookLevel[]): number {
  return levels.reduce((sum, level) => sum + safeNumber(level.price) * safeNumber(level.size), 0);
}

function buildMockOrderBook(token: MarketToken, tick: number): MockOrderBookSnapshot {
  const meta = MARKET_META[token];
  const mid = meta.base + Math.sin(tick / 4) * (meta.base * 0.00002) + Math.cos(tick / 6) * (meta.base * 0.00001);
  const spread = meta.spread;
  const half = spread / 2;
  const bids = Array.from({ length: 5 }, (_, idx) => {
    const price = mid - half - idx * spread;
    return {
      price: Number(price.toFixed(2)),
      size: Number((0.85 + ((tick + idx) % 5) * 0.07).toFixed(3)),
    };
  });
  const asks = Array.from({ length: 5 }, (_, idx) => {
    const price = mid + half + idx * spread;
    return {
      price: Number(price.toFixed(2)),
      size: Number((0.92 + ((tick + idx) % 5) * 0.06).toFixed(3)),
    };
  });
  return {
    symbol: token,
    lastPrice: Number(mid.toFixed(2)),
    tickSize: spread,
    bids,
    asks,
  };
}

function buildFundingChart(token: MarketToken, tick: number): FundingChartPoint[] {
  const base = MARKET_META[token];
  const plusBase = Number(base.frPlus8h.split(" ")[0]);
  const minusBase = Number(base.frMinus8h.split(" ")[0]);
  return Array.from({ length: 24 }, (_, idx) => {
    const wave = idx / 23;
    const pulse = Math.sin(wave * Math.PI * 2 + tick * 0.18) * 0.12;
    const antiPulse = Math.cos(wave * Math.PI * 2 + tick * 0.14) * 0.1;
    return {
      x: idx,
      frPlus: plusBase * (1 + pulse),
      frMinus: minusBase * (1 + antiPulse),
    };
  });
}

function statusTimeLabel(): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong",
  }).format(new Date());
}

export function DosTerminal({
  systemState,
  viewMode = "santenmoku",
  onViewModeChange,
  latencyMs,
  orderbook,
  quantity = 0.1,
  leverage = 1,
  onQtyChange,
  onLeverageChange,
  onFire,
  onHardLock,
  onEmergencyFlush,
}: DosTerminalProps): ReactNode {
  const [qtyValue, setQtyValue] = useState<number>(quantity);
  const [leverageValue, setLeverageValue] = useState<number>(leverage);
  const [selectedToken, setSelectedToken] = useState<MarketToken>("BTC-PERP");
  const [side, setSide] = useState<DosSide>("LONG");
  const [orderType, setOrderType] = useState<DosOrderType>("MARKET");
  const [riskPreset, setRiskPreset] = useState<DosRiskPreset>("25");
  const initialLimitPrice = Number.isFinite(orderbook?.lastPrice)
    ? Number(orderbook?.lastPrice)
    : buildMockOrderBook(selectedToken, 0).lastPrice;
  const [limitPrice, setLimitPrice] = useState<string>(
    String(initialLimitPrice),
  );
  const [hasActivePosition, setHasActivePosition] = useState(false);
  const [mockPosition, setMockPosition] = useState<MockPositionSnapshot | null>(null);
  const [showRootRules, setShowRootRules] = useState(false);
  const [panelMode, setPanelMode] = useState<"orderbook" | "chart" | "radar">("orderbook");
  const [marketTick, setMarketTick] = useState(0);

  useEffect(() => setQtyValue(quantity), [quantity]);
  useEffect(() => setLeverageValue(leverage), [leverage]);
  useEffect(() => {
    if (Number.isFinite(orderbook?.lastPrice)) setLimitPrice(String(orderbook?.lastPrice));
  }, [orderbook?.lastPrice]);
  useEffect(() => {
    const timer = window.setInterval(() => setMarketTick((tick) => tick + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const bookMetrics = useMemo(() => {
    const liveBook: MockOrderBookSnapshot = buildMockOrderBook(selectedToken, marketTick);
    const bestBid = liveBook.bids[0] ?? null;
    const bestAsk = liveBook.asks[0] ?? null;
    const spread = bestBid && bestAsk ? bestAsk.price - bestBid.price : null;
    const spreadBps =
      bestBid && bestAsk && bestBid.price > 0
        ? ((bestAsk.price - bestBid.price) / bestBid.price) * 10_000
        : null;
    return {
      liveBook,
      bestBid,
      bestAsk,
      spread,
      spreadBps,
      bidDepthUsd: sumNotional(liveBook.bids),
      askDepthUsd: sumNotional(liveBook.asks),
    };
  }, [marketTick, selectedToken]);

  const frictionProbe = useMemo(() => {
    const spot = bookMetrics.liveBook.lastPrice ?? bookMetrics.bestBid?.price ?? 0;
    const perp = bookMetrics.bestBid?.price ?? 0;
    const dydx = bookMetrics.bestAsk?.price ?? 0;
    if (!spot || !perp || !dydx) return null;
    return checkSoilResistance({
      symbol: bookMetrics.liveBook.symbol ?? "BTC-PERP",
      hlSpot: spot,
      hlPerp: perp,
      dydxPerp: dydx,
      depthUsd: bookMetrics.bidDepthUsd + bookMetrics.askDepthUsd,
      maxSlippage: MAX_SLIPPAGE,
    });
  }, [bookMetrics]);

  const fundingChart = useMemo(() => buildFundingChart(selectedToken, marketTick), [marketTick, selectedToken]);

  const hardlock = systemState.hardlock;
  const marketMeta = MARKET_META[selectedToken];
  const executionBlocked = hardlock || frictionProbe?.tripped === true;
  const executionLabel = hardlock
    ? "[ HARD LOCKED ]"
    : frictionProbe?.tripped
      ? "[ BLOCKED: SLIPPAGE ]"
      : "[ <GO> SAFE TO FIRE 🔥 ]";
  const executionTone = hardlock
    ? "text-[#FF3333]"
    : frictionProbe?.tripped
      ? "text-[#FF9900]"
      : "text-[#00FF66]";

  const riskBudgetUsd =
    riskPreset === "25"
      ? systemState.dynamicMaxSL * 0.25
      : riskPreset === "50"
        ? systemState.dynamicMaxSL * 0.5
        : 100;
  const limitPriceValue = Number(limitPrice);
  const selectedIntent: ExecutionIntent = {
    side,
    orderType,
    qty: qtyValue,
    leverage: leverageValue,
    limitPrice: orderType === "LIMIT" && Number.isFinite(limitPriceValue) ? limitPriceValue : null,
    riskBudgetUsd,
    dryRun: systemState.isSandboxMode || !systemState.signingChannelOpen || executionBlocked,
  };

  const fireExecution = () => {
    if (typeof window !== "undefined") {
      const win = window as IntentWindow;
      win.__svDosExecutionIntent = selectedIntent;
      window.dispatchEvent(
        new CustomEvent<ExecutionIntent>("sv:dos-execution-intent", { detail: selectedIntent }),
      );
    }
    setMockPosition({
      quantity: 0.15,
      entryPrice: 64_231.5,
      markPrice: 64_280.0,
      unrealizedPnlUsd: 48.5,
      unrealizedPnlPct: 2.42,
    });
    setHasActivePosition(true);
    onFire?.();
  };

  const resetExecutionForm = () => {
    setHasActivePosition(false);
    setMockPosition(null);
    setSide("LONG");
    setOrderType("MARKET");
    setRiskPreset("25");
    setQtyValue(quantity);
    setLeverageValue(leverage);
    setLimitPrice(String(bookMetrics.liveBook.lastPrice));
  };

  const closePosition = () => {
    resetExecutionForm();
  };

  const handleEmergencyFlush = () => {
    resetExecutionForm();
    onEmergencyFlush?.();
  };

  const bookTime = statusTimeLabel();
  const latencyLabel = Number.isFinite(latencyMs) ? `${Number(latencyMs).toFixed(0)}ms` : "24ms";
  const rows = Array.from({ length: 5 }, (_, idx) => ({
    bid: bookMetrics.liveBook.bids[idx] ?? null,
    ask: bookMetrics.liveBook.asks[idx] ?? null,
  }));
  const spreadLabel = bookMetrics.spread !== null ? currency(bookMetrics.spread) : "[ UNBOUND ]";
  const chartMin = Math.min(...fundingChart.map((point) => Math.min(point.frPlus, point.frMinus, 0)));
  const chartMax = Math.max(...fundingChart.map((point) => Math.max(point.frPlus, Math.abs(point.frMinus), 0)));
  const chartScaleX = (index: number): number => 10 + (index / Math.max(1, fundingChart.length - 1)) * 220;
  const chartScaleY = (value: number): number => 86 - ((value - chartMin) / Math.max(0.0001, chartMax - chartMin)) * 56;
  const chartPath = (selector: "frPlus" | "frMinus"): string =>
    fundingChart
      .map((point, index) => `${index === 0 ? "M" : "L"} ${chartScaleX(index).toFixed(1)} ${chartScaleY(point[selector]).toFixed(1)}`)
      .join(" ");
  const tensileThresholdY = chartScaleY(frictionProbe?.tripped ? chartMax * 0.68 : chartMax * 0.52);
  const yinPressure = bookMetrics.bidDepthUsd;
  const yangPressure = bookMetrics.askDepthUsd;
  const yinYangBalancePct = Math.max(
    5,
    Math.min(
      95,
      Math.round(
        ((yinPressure / Math.max(1, yinPressure + yangPressure)) * 100) -
          Math.min(12, (bookMetrics.spread ?? 0) * 8),
      ),
    ),
  );
  return (
    <section
      className="flex h-screen w-full flex-col overflow-hidden bg-[#000000] font-mono leading-tight text-[#F6E9C6] [border-radius:0]"
      data-view-mode={viewMode}
    >
      <div className="sr-only">
        <button type="button" onClick={() => onViewModeChange?.("santenmoku")}>
          Santenmoku
        </button>
        <button type="button" onClick={() => onViewModeChange?.("minimal")}>
          Minimal
        </button>
      </div>

      <header className="flex-none border-b border-[#1E2329] bg-[#12171D] px-2 py-1 text-[10px] uppercase tracking-[0.14em]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {(["BTC-PERP", "ETH-PERP", "SOL-PERP"] as const).map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => setSelectedToken(token)}
                className={[
                  "border border-[#1E2329] px-2 py-0.5",
                  selectedToken === token ? "bg-[#1E2329] text-[#26A69A]" : "text-[#848E9C]",
                ].join(" ")}
              >
                [ {token.replace("-PERP", "")} ]
              </button>
            ))}
          </div>
          <div className="text-right text-[10px] leading-4 normal-case tracking-[0.02em]">
            <div>
              <span className="text-[#848E9C]">MARK</span>: <span className="text-[#EAECEF]">${marketMeta.mark.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span> |{" "}
              <span className="text-[#848E9C]">24H CHANGE</span>: <span className={marketMeta.change24h.startsWith("-") ? "text-[#EF5350]" : "text-[#26A69A]"}>{marketMeta.change24h}</span>
            </div>
            <div>
              <span className="text-[#848E9C]">OPEN INTEREST</span>: <span className="text-[#EAECEF]">{marketMeta.oi}</span> |{" "}
              <span className="text-[#848E9C]">OI DELTA (24H)</span>: <span className="text-[#26A69A]">{marketMeta.oiDelta24h}</span>
            </div>
            <div>
              <span className="text-[#848E9C]">FUNDING</span>: <span className="text-[#EAECEF]">{marketMeta.funding}</span> <span className="text-[#848E9C]">(Countdown: {marketMeta.countdown})</span>
            </div>
            <div>
              <span className="text-[#26A69A]">FR+ (LONG)</span>: <span className="text-[#EAECEF]">{marketMeta.frPlus8h}</span> <span className="text-[#848E9C]">({marketMeta.frPlusApy})</span>
            </div>
            <div>
              <span className="text-[#EF5350]">FR- (SHORT)</span>: <span className="text-[#EAECEF]">{marketMeta.frMinus8h}</span> <span className="text-[#848E9C]">({marketMeta.frMinusApy})</span>
            </div>
            <div>
              <span className="text-[#848E9C]">NET FRICTION YIELD</span>: <span className="text-[#26A69A]">{marketMeta.netFrictionApy}</span>
            </div>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between text-[9px] tracking-[0.12em] text-[#848E9C]">
          <div>{selectedToken} US &lt;GO&gt;</div>
          <div>SYS: {hardlock ? "BLOCKED" : "ACTIVE"} | {bookTime} HKT | LATENCY: {latencyLabel}</div>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[9px] tracking-[0.12em]">
          <span className="text-[#848E9C]">YIN (Defense)</span>
          <div className="relative h-2 flex-1 overflow-hidden border border-[#1E2329] bg-[#0B0E11]">
            <div className="absolute inset-y-0 left-0 bg-[#26A69A]" style={{ width: `${yinYangBalancePct}%` }} />
            <div className="absolute inset-y-0 right-0 bg-[#EF5350]" style={{ width: `${100 - yinYangBalancePct}%` }} />
            <div className="absolute left-1/2 top-0 h-full w-px bg-[#848E9C]" />
          </div>
          <span className="text-[#EAECEF]">{yinYangBalancePct}%</span>
          <span className="text-[#848E9C]">YANG (Attack)</span>
        </div>
      </header>

      <main className="grid flex-1 min-h-0 grid-rows-[minmax(0,1fr)_auto_auto_auto] gap-0">
        <div className="grid min-h-0 grid-cols-1 xl:grid-cols-12">
          <section className="min-h-0 overflow-hidden border-b border-[#1E2329] xl:col-span-7 xl:border-r">
            <div className="flex items-center justify-between border-b border-[#1E2329] px-1 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[#848E9C]">
              <span>[ MARKET DEPTH &amp; ORDER BOOK ]</span>
              <span className="text-[#848E9C]">{viewMode === "minimal" ? "[ MINIMAL ]" : "[ FULL ]"}</span>
            </div>
            <div className="grid gap-1 px-2 py-1 text-[10px]">
              <div className="flex items-center justify-between text-[#848E9C]">
                <span className={hardlock ? "text-[#EF5350]" : "text-[#26A69A]"}>
                  {hardlock ? "[ OFFLINE ]" : "[ Connected ]"}
                </span>
                <span>mode: {systemState.hudState}</span>
                <span>{systemState.signingChannelOpen ? "[ SIGNING OPEN ]" : "[ UNBOUND ]"}</span>
              </div>

              <div className="border border-[#1E2329] bg-[#12171D]">
                <div className="flex items-center justify-between gap-2 border-b border-[#1E2329] px-2 py-1 text-[8px] uppercase tracking-[0.12em]">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPanelMode("chart")}
                      className={[
                        "border border-[#1E2329] px-2 py-0.5",
                        panelMode === "chart" ? "bg-[#1E2329] text-[#26A69A]" : "text-[#848E9C]",
                      ].join(" ")}
                    >
                      [ 📊 RISK/FR CHART ]
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanelMode("orderbook")}
                      className={[
                        "border border-[#1E2329] px-2 py-0.5",
                        panelMode === "orderbook" ? "bg-[#1E2329] text-[#EAECEF]" : "text-[#848E9C]",
                      ].join(" ")}
                    >
                      [ 📖 ORDERBOOK ]
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanelMode("radar")}
                      className={[
                        "border border-[#1E2329] px-2 py-0.5",
                        panelMode === "radar" ? "bg-[#1E2329] text-[#26A69A]" : "text-[#848E9C]",
                      ].join(" ")}
                    >
                      [ ☯️ YIN-YANG &amp; ROOT RADAR ]
                    </button>
                  </div>
                  <div className="text-[#848E9C]">--- LIVE ORDER BOOK SPREAD ({spreadLabel}) ---</div>
                </div>
                {panelMode === "radar" ? (
                  <div className="grid gap-2 px-2 py-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-[#1E2329] bg-[#12171D] px-2 py-2">
                        <div className="mb-2 text-[8px] uppercase tracking-[0.12em] text-[#848E9C]">YIN (Defense)</div>
                        <div className="h-24 rounded-none border border-[#1E2329] bg-[#0B0E11] p-2">
                          <div className="mb-1 flex items-center justify-between text-[8px] text-[#848E9C]">
                            <span>VOLATILITY</span>
                            <span>{Math.max(5, 100 - yinYangBalancePct)}%</span>
                          </div>
                          <div className="h-2 overflow-hidden border border-[#1E2329] bg-[#12171D]">
                            <div className="h-full bg-[#26A69A]" style={{ width: `${yinYangBalancePct}%` }} />
                          </div>
                          <div className="mt-2 text-[9px] text-[#EAECEF]">Buy pressure / defensive absorption</div>
                        </div>
                      </div>
                      <div className="border border-[#1E2329] bg-[#12171D] px-2 py-2">
                        <div className="mb-2 text-[8px] uppercase tracking-[0.12em] text-[#848E9C]">YANG (Attack)</div>
                        <div className="h-24 rounded-none border border-[#1E2329] bg-[#0B0E11] p-2">
                          <div className="mb-1 flex items-center justify-between text-[8px] text-[#848E9C]">
                            <span>MOMENTUM</span>
                            <span>{100 - yinYangBalancePct}%</span>
                          </div>
                          <div className="h-2 overflow-hidden border border-[#1E2329] bg-[#12171D]">
                            <div className="ml-auto h-full bg-[#EF5350]" style={{ width: `${100 - yinYangBalancePct}%` }} />
                          </div>
                          <div className="mt-2 text-[9px] text-[#EAECEF]">Sell pressure / attack impulse</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-1 border border-[#1E2329] bg-[#0B0E11] px-2 py-2 text-[8px] uppercase tracking-[0.12em]">
                      <div className="flex items-center justify-between text-[#848E9C]">
                        <span>T1: Pre-Flight</span>
                        <span className="text-[#26A69A]">Log only</span>
                      </div>
                      <div className="flex items-center justify-between text-[#848E9C]">
                        <span>T2: Soil Probe</span>
                        <span className="text-[#C49A6C]">Auto-cap leverage</span>
                      </div>
                      <div className="flex items-center justify-between text-[#848E9C]">
                        <span>T3: Risk Guard</span>
                        <span className="text-[#EF5350]">Block FIRE gate</span>
                      </div>
                      <div className="flex items-center justify-between text-[#848E9C]">
                        <span>T4: Hard Lock 🔒</span>
                        <span className="text-[#EF5350]">Emergency flush</span>
                      </div>
                    </div>
                  </div>
                ) : panelMode === "chart" ? (
                  <div className="px-2 py-2">
                    <div className="mb-2 flex flex-wrap gap-3 text-[9px] uppercase tracking-[0.12em]">
                      <span className="text-[#26A69A]">{marketMeta.frPlus8h} {marketMeta.frPlusApy}</span>
                      <span className="text-[#EF5350]">{marketMeta.frMinus8h} {marketMeta.frMinusApy}</span>
                      <span className="text-[#848E9C]">SOIL TENSILE THRESHOLD</span>
                    </div>
                    <svg viewBox="0 0 240 110" className="h-52 w-full">
                      <defs>
                        <linearGradient id="frPlusFill" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#26A69A" stopOpacity="0.26" />
                          <stop offset="100%" stopColor="#26A69A" stopOpacity="0.02" />
                        </linearGradient>
                        <linearGradient id="frMinusFill" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#EF5350" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#EF5350" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      {Array.from({ length: 5 }, (_, idx) => (
                        <line
                          key={`h-${idx}`}
                          x1="10"
                          x2="230"
                          y1={12 + idx * 16}
                          y2={12 + idx * 16}
                          stroke="#1E2329"
                          strokeWidth="1"
                        />
                      ))}
                      {Array.from({ length: 6 }, (_, idx) => (
                        <line
                          key={`v-${idx}`}
                          y1="10"
                          y2="90"
                          x1={10 + idx * 44}
                          x2={10 + idx * 44}
                          stroke="#1E2329"
                          strokeWidth="1"
                        />
                      ))}
                      <path
                        d={`${chartPath("frPlus")} L 230 86 L 10 86 Z`}
                        fill="url(#frPlusFill)"
                        stroke="#26A69A"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d={`${chartPath("frMinus")} L 230 86 L 10 86 Z`}
                        fill="url(#frMinusFill)"
                        stroke="#EF5350"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="10"
                        x2="230"
                        y1={tensileThresholdY}
                        y2={tensileThresholdY}
                        stroke="#848E9C"
                        strokeDasharray="4 4"
                        strokeWidth="1.25"
                      />
                      <text x="12" y="100" fill="#848E9C" fontSize="8">FR+</text>
                      <text x="52" y="100" fill="#848E9C" fontSize="8">FR-</text>
                      <text x="90" y="100" fill="#848E9C" fontSize="8">TENSILE THRESHOLD</text>
                    </svg>
                  </div>
                ) : (
                  <table className="w-full table-fixed border-collapse text-[10px] leading-6">
                    <thead className="text-[#848E9C]">
                      <tr>
                        <th className="px-3 py-1.5 text-left">BID QTY</th>
                        <th className="px-3 py-1.5 text-right">BID PX</th>
                        <th className="px-3 py-1.5 text-right">SPREAD</th>
                        <th className="px-3 py-1.5 text-right">ASK PX</th>
                        <th className="px-3 py-1.5 text-right">ASK QTY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length ? (
                        rows.map((row, idx) => (
                          <tr
                            key={idx}
                            className="relative cursor-pointer border-t border-[#1E2329]"
                            title="Click any quote row to populate LIMIT PX"
                            style={{
                              background:
                                row.bid && row.ask
                                  ? `linear-gradient(90deg, rgba(38,166,154,0.10) 0%, rgba(38,166,154,0.10) ${(idx + 1) * 18}%, transparent ${(idx + 1) * 18}%), linear-gradient(270deg, rgba(239,83,80,0.10) 0%, rgba(239,83,80,0.10) ${(idx + 1) * 18}%, transparent ${(idx + 1) * 18}%)`
                                  : "transparent",
                            }}
                            onClick={() => {
                              const price = row.ask?.price ?? row.bid?.price;
                              if (price != null) {
                                setOrderType("LIMIT");
                                setLimitPrice(String(price));
                              }
                            }}
                          >
                            <td className="px-3 py-1.5 text-right text-[#26A69A]">
                              {row.bid ? row.bid.size.toFixed(3) : "[ N/A ]"}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-[#EAECEF]">
                              {row.bid ? (
                                <button
                                  type="button"
                                  title="Click to fill limit price"
                                  className="font-bold text-[#26A69A] hover:text-[#EAECEF]"
                                  onClick={() => {
                                    setOrderType("LIMIT");
                                    setLimitPrice(String(row.bid?.price ?? ""));
                                  }}
                                >
                                  {currency(row.bid.price)}
                                </button>
                              ) : (
                                "[ N/A ]"
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-right text-[#848E9C]">
                              {idx === 0 && bookMetrics.spread !== null
                                ? `${currency(bookMetrics.spread)} / ${bookMetrics.spreadBps?.toFixed(2) ?? "0.00"} bps`
                                : ""}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-[#EAECEF]">
                              {row.ask ? (
                                <button
                                  type="button"
                                  title="Click to fill limit price"
                                  className="font-bold text-[#EF5350] hover:text-[#EAECEF]"
                                  onClick={() => {
                                    setOrderType("LIMIT");
                                    setLimitPrice(String(row.ask?.price ?? ""));
                                  }}
                                >
                                  {currency(row.ask.price)}
                                </button>
                              ) : (
                                "[ N/A ]"
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-right text-[#EF5350]">
                              {row.ask ? row.ask.size.toFixed(3) : "[ N/A ]"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-1 py-1 text-[#848E9C]" colSpan={5}>
                            [ OFFLINE ]
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>

          <section className="min-h-0 overflow-hidden border-b border-[#1E2329] xl:col-span-5">
            <div className="border-b border-[#1E2329] px-1 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[#848E9C]">
              [ RISK &amp; VOLATILITY PROBE ]
            </div>
            <div className="flex h-full flex-col gap-1 px-1 py-1 text-[10px]">
              {hasActivePosition && mockPosition ? (
                <div className="flex h-full flex-col justify-between gap-2 border border-[#1E2329] bg-[#12171D] px-3 py-3">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-[#848E9C]">
                    POS: LONG {mockPosition.quantity.toFixed(2)} {bookMetrics.liveBook.symbol} @ ${mockPosition.entryPrice.toFixed(2)}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.14em] text-[#848E9C]">
                    ENTRY: ${mockPosition.entryPrice.toFixed(2)} | MARK: ${mockPosition.markPrice.toFixed(2)}
                  </div>
                  <div className="animate-pulse font-mono text-2xl font-bold uppercase tracking-[0.06em] text-[#00FF66]">
                    UNREALIZED PnL: +${mockPosition.unrealizedPnlUsd.toFixed(2)} (+{mockPosition.unrealizedPnlPct.toFixed(2)}%)
                  </div>
                  <button
                    type="button"
                    onClick={closePosition}
                    className="border border-[#EF5350] px-3 py-2 text-left text-[11px] uppercase tracking-[0.16em] text-[#EF5350]"
                  >
                    [ &lt;GO&gt; CLOSE POSITION (MARKET) ]
                  </button>
                  <button
                    type="button"
                    onClick={handleEmergencyFlush}
                    className="border border-[#1E2329] px-3 py-1 text-left text-[10px] uppercase tracking-[0.16em] text-[#848E9C]"
                  >
                    [ F12: EMERGENCY FLUSH ALL ]
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setSide("LONG")}
                      className={[
                        "border border-[#1E2329] px-2 py-0.5 uppercase tracking-[0.14em]",
                        side === "LONG" ? "text-[#26A69A]" : "text-[#848E9C]",
                      ].join(" ")}
                    >
                      [ 1 &lt;GO&gt; BUY / LONG ]
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("SHORT")}
                      className={[
                        "border border-[#1E2329] px-2 py-0.5 uppercase tracking-[0.14em]",
                        side === "SHORT" ? "text-[#EF5350]" : "text-[#848E9C]",
                      ].join(" ")}
                    >
                      [ 2 &lt;GO&gt; SELL / SHORT ]
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex items-center justify-between border-t border-[#1E2329] pt-1">
                      <span className="text-[#848E9C]">ORDER TYPE</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setOrderType("MARKET")}
                          className={[
                            "border border-[#1E2329] px-2 py-0.5",
                            orderType === "MARKET" ? "text-[#26A69A]" : "text-[#848E9C]",
                          ].join(" ")}
                        >
                          MARKET
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderType("LIMIT")}
                          className={[
                            "border border-[#1E2329] px-2 py-0.5",
                            orderType === "LIMIT" ? "text-[#26A69A]" : "text-[#848E9C]",
                          ].join(" ")}
                        >
                          LIMIT
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center justify-between border-t border-[#1E2329] pt-1">
                      <span className="text-[#848E9C]">QTY ($)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={qtyValue}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          setQtyValue(next);
                          onQtyChange?.(next);
                        }}
                        className="w-28 border border-[#1E2329] bg-[#0B0E11] px-1 py-0.5 text-right text-[#EAECEF] outline-none"
                      />
                    </label>

                    <label className="flex items-center justify-between border-t border-[#1E2329] pt-1">
                      <span className="text-[#848E9C]">LEVERAGE</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="0.1"
                        value={leverageValue}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          setLeverageValue(next);
                          onLeverageChange?.(next);
                        }}
                        className="w-28 border border-[#1E2329] bg-[#0B0E11] px-1 py-0.5 text-right text-[#EAECEF] outline-none"
                      />
                    </label>

                    <div className="flex items-center gap-1 border-t border-[#1E2329] pt-1">
                      <button
                        type="button"
                        onClick={() => setRiskPreset("25")}
                        className={[
                          "border border-[#1E2329] px-2 py-0.5",
                          riskPreset === "25" ? "text-[#26A69A]" : "text-[#848E9C]",
                        ].join(" ")}
                      >
                        25%
                      </button>
                      <button
                        type="button"
                        onClick={() => setRiskPreset("50")}
                        className={[
                          "border border-[#1E2329] px-2 py-0.5",
                          riskPreset === "50" ? "text-[#26A69A]" : "text-[#848E9C]",
                        ].join(" ")}
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => setRiskPreset("MAX")}
                        className={[
                          "border border-[#1E2329] px-2 py-0.5",
                          riskPreset === "MAX" ? "text-[#26A69A]" : "text-[#848E9C]",
                        ].join(" ")}
                      >
                        MAX SL
                      </button>
                    </div>

                    {orderType === "LIMIT" ? (
                      <label className="flex items-center justify-between border-t border-[#222] pt-1">
                        <span className="text-[#848E9C]">LIMIT PX</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={limitPrice}
                          onChange={(event) => setLimitPrice(event.target.value)}
                          className="w-28 border border-[#1E2329] bg-[#0B0E11] px-1 py-0.5 text-right text-[#EAECEF] outline-none"
                        />
                      </label>
                    ) : null}

                    <button
                      type="button"
                      onClick={fireExecution}
                      disabled={executionBlocked}
                      className={[
                        "mt-1 border border-[#1E2329] px-2 py-1 text-left uppercase tracking-[0.14em]",
                        executionTone,
                      ].join(" ")}
                    >
                      {executionLabel}
                    </button>

                    <div className="flex gap-2 text-[10px] uppercase tracking-[0.14em]">
                      <button
                        type="button"
                        onClick={onHardLock}
                      className="border border-[#1E2329] px-2 py-0.5 text-[#EF5350]"
                      >
                        [F9: HARD LOCK]
                      </button>
                      <button
                        type="button"
                      onClick={handleEmergencyFlush}
                      className="border border-[#1E2329] px-2 py-0.5 text-[#848E9C]"
                      >
                        [F12: FLUSH]
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="relative border-b border-[#1E2329] px-2 py-1 text-[9px] leading-tight">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[#848E9C] uppercase tracking-[0.14em]">PROXIMITY PROTECTION DISTANCE SCALE</div>
            <button
              type="button"
              onClick={() => setShowRootRules((value) => !value)}
              className="border border-[#1E2329] px-1 py-0.5 text-[8px] uppercase tracking-[0.12em] text-[#EAECEF]"
            >
              [ 🔍 INSPECT 20 ROOTS ]
            </button>
          </div>
          <div className="mt-1 flex h-5 overflow-hidden border border-[#1E2329] bg-[#0B0E11]">
            <div className="flex flex-1 items-center justify-between border-r border-[#1E2329] bg-[linear-gradient(90deg,rgba(38,166,154,0.28),rgba(38,166,154,0.10))] px-2 text-[8px] uppercase tracking-[0.12em] text-[#EAECEF]">
              <span>T1: Pre-Flight</span>
              <span className="text-[#26A69A]">OK</span>
            </div>
            <div className="flex flex-1 items-center justify-between border-r border-[#1E2329] bg-[linear-gradient(90deg,rgba(196,154,108,0.24),rgba(196,154,108,0.10))] px-2 text-[8px] uppercase tracking-[0.12em] text-[#EAECEF]">
              <span>T2: Soil Probe</span>
              <span className="text-[#C49A6C]">OK</span>
            </div>
            <div className="flex flex-1 items-center justify-between border-r border-[#1E2329] bg-[linear-gradient(90deg,rgba(239,83,80,0.18),rgba(239,83,80,0.08))] px-2 text-[8px] uppercase tracking-[0.12em] text-[#EAECEF]">
              <span>T3: Risk Guard</span>
              <span className="text-[#EF5350]">OK</span>
            </div>
            <div className="flex flex-1 items-center justify-between bg-[linear-gradient(90deg,rgba(239,83,80,0.28),rgba(83,33,33,0.12))] px-2 text-[8px] uppercase tracking-[0.12em] text-[#EAECEF]">
              <span>T4: Hard Lock 🔒</span>
              <span className="text-[#EF5350]">LOCK</span>
            </div>
          </div>
          {showRootRules ? (
            <div className="absolute left-1 right-1 bottom-8 z-20 border border-[#1E2329] bg-[#12171D] px-2 py-2 text-[8px] uppercase tracking-[0.12em] text-[#848E9C]">
              <pre className="whitespace-pre-wrap">
{`T1 R1-R6   | Pre-flight health. Action: log only.
T2 R7-R12  | Friction / soil probe. Action: auto-cap leverage.
T3 R13-R18 | Financial guard. Action: block FIRE gate, no new positions.
T4 R19-R20 | Physical deadlock. Action: revoke session key + flush.`}
              </pre>
            </div>
          ) : null}
        </section>

        <footer className="px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[#848E9C]">
          F1: HELP | F2: TICKER | F9: HARD LOCK | F12: FLUSH
        </footer>
      </main>
    </section>
  );
}

export default DosTerminal;
