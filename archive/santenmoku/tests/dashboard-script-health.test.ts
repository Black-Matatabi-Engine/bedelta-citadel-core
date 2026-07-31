import { describe, expect, it } from "vitest";
import { renderDashboard } from "../src/ui/dashboard";
import { MATRIX_RENDER_SCRIPT, MATRIX_VIEW_SUBSCRIPTION_SCRIPT } from "../src/ui/matrix-render";
import { RISK_CLIENT_SCRIPT } from "../src/ui/risk-client";
import vm from "node:vm";

function extractMainInlineScript(html: string): string {
  const re = /<script>([\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match[1].includes("let globalData = []")) {
      return match[1];
    }
  }
  throw new Error("main script not found");
}

describe("dashboard runtime script health", () => {
  it("inline script parses and seeds live radar values", () => {
    const html = renderDashboard({
      telemetryLink: "/api/telemetry/health",
      version: "test",
    });
    const script = extractMainInlineScript(html);
    expect(() => new vm.Script(script)).not.toThrow();

    expect(html).toMatch(/VIX \(Trad\): <strong>16\.8<\/strong>/);
    expect(html).toMatch(/DVOL \(Crypto\): <strong>52\.5%<\/strong>/);
    expect(html).toContain('id="hlCountdown"');
    expect(html).not.toContain('id="dydxCountdown"');
    expect(html).not.toContain("dYdX");
    expect(html).toContain("dydxPerp");
    expect(html).toContain("updateVolatilityFilters(res.vix_traditional");
    expect(html).toContain('id="hlCountdownWrap"');
    expect(html).toContain("function applyCountdownLockdown");
    expect(html).toContain("window.injectTokenToMasterConsole");
    expect(html).toContain('id="fundingRateKingsBar"');
  });

  it("Phase 3 modules inject SystemState + matrix + Macro CRI sync", () => {
    expect(RISK_CLIENT_SCRIPT).toContain("function applySystemState");
    expect(RISK_CLIENT_SCRIPT).toContain("__svDashboardStore.dispatch");
    expect(RISK_CLIENT_SCRIPT).not.toContain("systemState = {");
    expect(RISK_CLIENT_SCRIPT).toContain("computeEffectiveMaxSlUsd");
    expect(RISK_CLIENT_SCRIPT).toContain("syncCriFromLiveRiskSignals");
    expect(RISK_CLIENT_SCRIPT).toContain("deriveCriFromRiskSignalsClient");
    expect(RISK_CLIENT_SCRIPT).toContain("computeIsMacroBlocking");
    expect(MATRIX_RENDER_SCRIPT).toContain("function recalculate");
    expect(MATRIX_RENDER_SCRIPT).toContain("function getActionStyle");
    expect(MATRIX_VIEW_SUBSCRIPTION_SCRIPT).toContain("initMatrixViewStoreSubscription");

    const html = renderDashboard({
      telemetryLink: "/api/telemetry/health",
      version: "test",
    });
    const script = extractMainInlineScript(html);
    expect(script).toContain("syncCriFromLiveRiskSignals");
    expect(script).toContain("function recalculate");
    expect(script).toContain("function applySystemState");
    expect(script).toContain("window.__SV_DEMO__");
    expect(script).toContain("function svDemoDispatch");
    expect(script).toContain("__svDashboardStore.subscribe");
    expect(script).toContain("function startMarketSensorsPoll");
    expect(script).toContain("refreshMarketSensorsClient");
    expect(script).toContain("initMatrixViewStoreSubscription");
    expect(script).toContain("function refreshTaijiBaguaHud");
    expect(html).toContain('id="taijiModeBadge"');
    expect(html).toContain('id="baguaGateBadge"');
    expect(html).toContain('defense-hud-panel');
    expect(html).toContain('dondon-ip-frame--inline');
    expect(html).not.toContain('id="dondonIpStage"');
    expect(script).not.toContain("devForceDefcon1");
    expect(script).toContain("function computeEffectiveMaxSlUsd");
    expect(script).toContain("calculateRootDefenseMatrixFromStatuses");
    expect(script).toContain("formatRootDefenseMatrixLabel");
    expect(html).toContain("P-GATE");
    expect(script).toContain("DYNAMIC_MAX_SL_BASE_USD");
    expect(html).not.toContain("cdn.tailwindcss.com");
    expect(html).toContain('/assets/dashboard.css');
    expect(script).not.toContain("lastRiskScore || refreshCriAndStatusHud");
    expect(script).not.toContain("lastRiskScore");
    expect(script).not.toContain("demoCriOverride");
    expect(script).toContain("function normalizeTriggeredRoots");
    expect(script).toContain("function recomputeRootDefenseMatrixState");
    expect(script).toContain("ROOT_DEFENSE_SCORE_MIN");
    expect(script).toContain("TIER_PENALTY_BY_ROOT");
    expect(script).toContain("TIER_4_SET");
    expect(script).toContain("function renderStep2MarketPanels");
    expect(script).toContain("calculateRootDefenseMatrixFromStatuses");
    expect(html).toContain('id="app"');
    expect(script).toContain("function setDashboardModalOpen");
    expect(script).toContain("bindDashboardModalEscapeDismiss");
    expect(html).toContain('data-dashboard-mount="v1"');
    expect(script).toContain("function bootstrapDashboard");
    expect(script).toContain("DOMContentLoaded");
    expect(script).toContain("function revealDashboardMount");
    expect(script).toContain("rootTelemetryRendering");
    expect(() => new vm.Script(script)).not.toThrow();
  });
});
