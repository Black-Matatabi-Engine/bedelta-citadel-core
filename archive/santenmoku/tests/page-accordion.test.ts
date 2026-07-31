import { describe, expect, it } from "vitest";
import { renderDashboard } from "../src/ui/dashboard";
import { renderPageStepSection } from "../src/components/terminal/PageStepAccordion";

describe("V1 dashboard layout", () => {
  it("renders macro sentiment sanctuary and token selector shells", () => {
    const html = renderDashboard({
      telemetryLink: "/api/telemetry/health",
      version: "test",
    });
    expect(html).toContain("P-GATE : [ 20 ROOTS % SECURE ]");
    expect(html).toContain("TENSILE : [ 100% / 20% MIN ]");
    expect(html).toContain('id="statusHudCri"');
    expect(html).toContain('id="statusHudBadge"');
    expect(html).toContain('id="statusHudFriction"');
    expect(html).toContain('id="statusHudGateway"');
    expect(html).toContain('HKT:');
    expect(html).not.toContain('id="hmiStatusStrip"');
    expect(html).toContain("( ATTACK 陽 MODE )");
    expect(html).toContain('id="app"');
    expect(html).toContain('id="sopGuideBackdrop"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('.demo-hub-backdrop.hidden');
    expect(html).toContain('function closeAllDashboardModals');
    expect(html).toContain('data-dashboard-mount="v1"');
    expect(html).toContain('id="step1MacroSentimentTree"');
    expect(html).toContain('id="macroSentimentRadar"');
    expect(html).toContain('id="masterRiskConsole"');
    expect(html).toContain('id="step1BestHedgeRadar"');
    expect(html).toContain('id="fundingRateKingsBar"');
    expect(html).toContain('id="bestPairSymbol"');
    expect(html).toContain('id="consoleSelectedLabel"');
    expect(html).toContain("VIX (Trad): <strong>16.8</strong>");
    expect(html).toContain("DVOL (Crypto): <strong>52.5%</strong>");
    expect(html).toContain("window.injectTokenToMasterConsole");
    expect(html).toContain("startHudStreamPoll");
    expect(html).toContain("X-Santenmoku-Canary");
  });

  it("emits valid jsOnclickArg helper in inline script", () => {
    const html = renderDashboard({
      telemetryLink: "/api/telemetry/health",
      version: "test",
    });
    const re = /<script>([\s\S]*?)<\/script>/g;
    let script = "";
    let match: RegExpExecArray | null;
    while ((match = re.exec(html))) {
      if (match[1].includes("let globalData = []")) {
        script = match[1];
        break;
      }
    }
    if (!script) throw new Error("main script not found");
    expect(script).toContain("function jsOnclickArg");
    expect(script).toContain("applySystemState");
    expect(script).toContain("startHudStreamPoll");
  });

  it("renders collapsed banner with chevron", () => {
    const html = renderPageStepSection({
      step: 2,
      activeStep: 1,
      badgeHtml: "Active Target: [BRENT] $88.58 (8h FR: +0.0050%)",
      bodyHtml: '<div id="tradFiPanel"></div>',
    });
    expect(html).toContain("▼");
    expect(html).not.toContain("is-active");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("transition-all duration-300");
  });
});
