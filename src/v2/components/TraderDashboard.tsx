import { useState, type ReactNode } from "react";
import { DEFAULT_DVOL, DEFAULT_VIX } from "../../services/config";
import { UI_LOCKED_MESSAGE } from "../../services/defense/ui-canary";
import type { HudStreamPayload } from "../../api/hud-telemetry";
import { useHudStream } from "../hooks/useHudStream";
import { runStep1Scan } from "../services/step1-engine";
import { runStep2Scan } from "../services/step2-engine";
import { calculateRiskScoreFromTrippedRoots } from "../services/risk-engine";
import type { MockConfig, Step1ScanResult } from "../types/step1";
import type { Step2AnalysisResult } from "../types/step2-targets";
import { CatHud, type ConnectivityStatus } from "./CatHud";
import { ExecutionGatePanel } from "./ExecutionGatePanel";
import { RootDefenseGrid } from "./RootDefenseGrid";
import { ThreeEyeHud } from "./ThreeEyeHud";
import type { LiveDashboardViewModel } from "../services/live-dashboard";

export type DashboardViewMode = "santenmoku" | "minimal";
export const DEFAULT_DASHBOARD_VIEW_MODE: DashboardViewMode = "santenmoku";

export interface ApiSyncState {
  loading: boolean;
  error: string | null;
  refresh: () => void;
  pairCount: number;
}

export interface TraderDashboardProps {
  result: Step1ScanResult;
  onFire?: () => void;
  defaultViewMode?: DashboardViewMode;
  viewMode?: DashboardViewMode;
  onViewModeChange?: (mode: DashboardViewMode) => void;
  isMockMode?: boolean;
  defaultVix?: number;
  defaultDvol?: number;
  mockScanConfig?: MockConfig;
  onBootstrapScan?: typeof runStep1Scan;
  liveView?: LiveDashboardViewModel;
  apiSync?: ApiSyncState;
}

function trippedRootNums(matrixDetails: Record<string, boolean>): number[] {
  return Object.entries(matrixDetails)
    .filter(([, passed]) => !passed)
    .map(([key]) => {
      const match = /^root(\d+)_/.exec(key);
      return match ? Number(match[1]) : 0;
    })
    .filter((n) => n > 0);
}

function resolveConnectivity(
  isMockMode: boolean,
  apiSync: ApiSyncState | undefined,
  isStale: boolean,
  hudStreamError: string | null,
  connectivityMode?: HudStreamPayload["connectivityMode"],
): ConnectivityStatus {
  if (hudStreamError === UI_LOCKED_MESSAGE) {
    return "Disconnected / Locked State";
  }
  if (connectivityMode === "CONNECTED_MOCK" || isMockMode) {
    return "Connected · Mock";
  }
  if (isStale || hudStreamError) return "Stale";
  if (apiSync?.error) return "Stale";
  if (apiSync?.loading) return "Stale";
  return "Connected";
}

export function TraderDashboard({
  result: initialResult,
  onFire,
  defaultViewMode = DEFAULT_DASHBOARD_VIEW_MODE,
  viewMode: controlledMode,
  onViewModeChange,
  isMockMode = false,
  defaultVix = DEFAULT_VIX,
  defaultDvol = DEFAULT_DVOL,
  mockScanConfig,
  onBootstrapScan = runStep1Scan,
  liveView,
  apiSync,
}: TraderDashboardProps): ReactNode {
  const [showMinimalStrip, setShowMinimalStrip] = useState(
    defaultViewMode === "minimal",
  );
  const viewMode = controlledMode ?? DEFAULT_DASHBOARD_VIEW_MODE;

  const [step1Result, setStep1Result] = useState<Step1ScanResult>(initialResult);
  const [step2Result, setStep2Result] = useState<Step2AnalysisResult | null>(
    null,
  );
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [vix, setVix] = useState(defaultVix);

  const {
    payload: hudStream,
    error: hudStreamError,
    loading: hudStreamLoading,
  } = useHudStream(true);

  const isLocked = step1Result.status === "LOCKED" || liveView?.hardlock === true;
  const maxLoss = liveView?.maxLossUsd ?? step1Result.maxLossUSD;
  const riskScore =
    step1Result.risk_score ??
    calculateRiskScoreFromTrippedRoots(trippedRootNums(step1Result.matrixDetails));
  const currentCri =
    liveView?.criScore ?? Math.max(0, Math.min(100, 100 - riskScore));
  const sentimentVix = liveView?.vix ?? vix;
  const sentimentDvol = liveView?.dvol ?? defaultDvol;
  const isStale =
    liveView?.systemState?.isStale === true || hudStream?.isStale === true;
  const connectivity = resolveConnectivity(
    isMockMode,
    apiSync,
    isStale,
    hudStreamError,
    hudStream?.connectivityMode,
  );
  const displayedPairCount =
    apiSync?.pairCount && apiSync.pairCount > 0
      ? apiSync.pairCount
      : hudStream?.marketProbe.livePairsCount;
  const circuitBreakerTripped =
    isLocked ||
    hudStream?.leftEyeDefense.hardlock === true ||
    hudStream?.leftEyeDefense.status === "LOCKED";

  const runStep2L1Scan = async () => {
    setScanning(true);
    setScanError(null);
    try {
      const step1 = await onBootstrapScan(
        isMockMode
          ? (mockScanConfig ?? {
              isMockMode: true,
              mockUserXP: 85,
              mockGeoCountry: "HK",
              mockIsUSMarketOpenWindow: false,
              mockVix: vix,
            })
          : undefined,
      );
      setStep1Result(step1);
      if (mockScanConfig?.mockVix !== undefined) setVix(mockScanConfig.mockVix);
      setStep2Result(await runStep2Scan(step1, { isMockMode }));
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Step 2 L1 scan failed");
      setStep2Result(null);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="santen-shell font-hud">
      <header className="santen-header px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="panel-title-text tracking-[0.22em]">
              SLIVERVINE · SANTENMOKU LEAN UI
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              4-Step Macro Focus · Santenboku
              {!isMockMode && displayedPairCount !== undefined
                ? ` · ${displayedPairCount} pairs`
                : isMockMode && displayedPairCount !== undefined
                  ? ` · ${displayedPairCount} pairs (mock)`
                  : ""}
            </p>
            {apiSync?.error ? (
              <p className="mt-1 font-data text-xs text-red-400">{apiSync.error}</p>
            ) : null}
          </div>
          <div className="view-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "santenmoku" && !showMinimalStrip}
              onClick={() => {
                setShowMinimalStrip(false);
                onViewModeChange?.(DEFAULT_DASHBOARD_VIEW_MODE);
              }}
              className={[
                "view-mode-tab",
                viewMode === "santenmoku" && !showMinimalStrip
                  ? "view-mode-tab--active"
                  : "",
              ].join(" ")}
            >
              Santenmoku Full Dashboard
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showMinimalStrip}
              onClick={() => {
                setShowMinimalStrip(true);
                onViewModeChange?.("minimal");
              }}
              className={[
                "view-mode-tab",
                showMinimalStrip ? "view-mode-tab--active" : "",
              ].join(" ")}
            >
              Minimal Strip
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:items-stretch">
          <div className="xl:col-span-3">
            <CatHud
              criScore={currentCri}
              hardlock={liveView?.hardlock ?? isLocked}
              primaryMode={step1Result.primaryMode}
              connectivity={connectivity}
              connectivityMode={hudStream?.connectivityMode}
            />
          </div>

          <div className="xl:col-span-6">
            <ThreeEyeHud
              criScore={currentCri}
              maxLossUsd={maxLoss}
              vix={sentimentVix}
              dvol={sentimentDvol}
              hudStream={hudStream}
              hudStreamError={hudStreamError}
              hudStreamLoading={hudStreamLoading}
            />
          </div>

          <div className="xl:col-span-3">
            <ExecutionGatePanel
              isLocked={isLocked}
              lockReason={step1Result.activeLockReason}
              maxLoss={maxLoss}
              sessionKeyLabel={
                circuitBreakerTripped || isStale ? "SEVERED" : "ACTIVE"
              }
              circuitBreakerTripped={circuitBreakerTripped}
              onFire={onFire}
            />
          </div>
        </div>

        <RootDefenseGrid matrixDetails={step1Result.matrixDetails} />

        {showMinimalStrip ? (
          <section className="circuit-panel px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="panel-title-text text-[0.65rem]">Minimal Radar Strip</p>
              <button
                type="button"
                onClick={() => void runStep2L1Scan()}
                disabled={scanning}
                className="mint-btn px-3 py-1 text-[10px]"
              >
                {scanning ? "Scanning…" : "Run L1 Scan"}
              </button>
            </div>
            {scanError ? (
              <p className="mt-2 font-data text-xs text-red-400">{scanError}</p>
            ) : null}
            {step2Result?.status === "TARGETS_FOUND" ? (
              <p className="mt-2 font-data text-xs text-[rgba(160,255,224,0.65)]">
                {step2Result.targets.length} weak targets tracked
              </p>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default TraderDashboard;
