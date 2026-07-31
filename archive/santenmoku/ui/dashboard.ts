import { BRAND_BANNER_DATA_URI, BRAND_LOGO_DATA_URI } from "./brand-assets";
import {
  METRICS_DICTIONARY,
  STATUS_DICTIONARY,
  STRATEGY_DICTIONARY,
  metricsDictionaryJson,
  statusDictionaryJson,
  strategyDictionaryJson,
} from "../config/statusDictionary";
import {
  computeEffectiveMaxSlUsd,
  dynamicMaxSlPct,
} from "../services/effective-max-sl";
import { clientRuntimeScript } from "../v2/services/client-runtime";
import { ROOT_DEFENSE_TELEMETRY } from "../v2/services/trade-pipeline";
import { DASHBOARD_STORE_SCRIPT } from "./client/store/dashboard-store";
import { RISK_CLIENT_CORE_SCRIPT } from "./risk-client";
import { HUD_CLIENT_SCRIPT } from "./hud-client";
import { MARKET_SENSORS_CLIENT_SCRIPT } from "./market-sensors-client";
import { MATRIX_VIEW_SUBSCRIPTION_SCRIPT } from "./matrix-render";

/** Store subscription — ROOT DEFENSE MATRIX + DonDon HUD refresh on SystemState changes */
const HEADER_HUD_SUBSCRIPTION_SCRIPT = `
    function initHeaderHudStoreSubscription() {
      if (typeof __svDashboardStore === 'undefined' || typeof __svDashboardStore.subscribe !== 'function') return;
      __svDashboardStore.subscribe(function(state, action) {
        if (!action || action.type !== 'SYSTEM_STATE_APPLY') return;
        if (typeof refreshCriAndStatusHud === 'function') refreshCriAndStatusHud();
      });
    }
    initHeaderHudStoreSubscription();
`;

const CLIENT_GLOBAL_BINDINGS_SCRIPT = `
    window.computeSoilRiskUsd = computeSoilRiskUsd;
    window.clampTensileScore = clampTensileScore;
`;
import {
  buildSystemState,
  serializeSystemStateForClient,
} from "../services/systemState";
import {
  ROOT_DEFENSE_MATRIX_TOOLTIP_DESC,
  ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL,
} from "../services/cri-engine";
import { BAGUA_GATE_UI, TAIJI_MODE_UI } from "../services/taiji-bagua";
import { DASHBOARD_INLINE_STYLES } from "./components/dashboard-styles";
import { HMI_INLINE_STYLES } from "./components/hmi-styles";
import { COPILOT_HMI_SCRIPT, R20_DEADLOCK_OVERLAY_HTML } from "./copilot-hmi-client";
import {
  DASHBOARD_SHELL_HEAD_SCRIPT,
  DASHBOARD_SHELL_TAIL_SCRIPT,
  renderDashboardShellHtml,
  renderDashboardShellMidHtml,
  renderDashboardShellTailHtml,
} from "./components/dashboard-shell";
import { DEMO_DRAWER_SCRIPT, renderDemoDrawerHtml } from "./components/demo-drawer";
import { HEADER_HUD_SCRIPT, renderHeaderHudHtml } from "./components/header-hud";
import { ORDER_ENTRY_SCRIPT, renderOrderEntryHtml } from "./components/order-entry";
import { TELEMETRY_MATRIX_SCRIPT } from "./components/telemetry-matrix";
import {
  brandShield,
  brandShieldImg,
  escAttr,
  type DashboardBuildContext,
  UI_HELPERS_SCRIPT,
} from "./components/ui-helpers";

export interface DashboardOptions {
  telemetryLink: string;
  sheetLink?: string;
  version: string;
}

/** Strict invite-ref whitelist + standard Ethereum wallet address */
export const GATEKEEPER_REF_WHITELIST = [
  "grant.santenbokui",
  "0xhyperliquid",
  "0xwallet",
] as const;

/** Client-side auth persistence key — survives refresh without re-entry */
export const GATEKEEPER_AUTH_STORAGE_KEY = "sv_gatekeeper_auth";

/** Valid invite ref: whitelist passcodes OR Ethereum-style 0x wallet address */
export function isValidWalletRef(ref: string | null | undefined): boolean {
  if (typeof ref !== "string") return false;
  const value = ref.trim();
  if (!value) return false;
  const lower = value.toLowerCase();
  if (
    GATEKEEPER_REF_WHITELIST.some((pass) => pass.toLowerCase() === lower)
  ) {
    return true;
  }
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

/**
 * Gatekeeper barrier page — shown when `?ref=` is missing/invalid.
 * Unlock via whitelist pass / wallet address input.
 */
export function renderRestrictedAccess(version: string): string {
  return `<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SILVERVINE LABS | PRIVATE BETA ACCESS · ${version}</title>
  <link rel="icon" href="/brand/favicon.webp" type="image/webp">
  <link rel="icon" href="/brand/favicon.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(ellipse at center, rgba(80, 210, 193, 0.12), transparent 55%),
        #051311;
      color: #e8fff0;
      font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .card {
      max-width: 560px;
      width: calc(100% - 2rem);
      text-align: center;
      border: 2px solid rgba(80, 210, 193, 0.45);
      background: rgba(11, 18, 23, 0.92);
      border-radius: 1rem;
      padding: 2rem 1.5rem;
      box-shadow: 0 0 40px rgba(80, 210, 193, 0.2);
    }
    h1 {
      color: #50D2C1;
      font-size: 1.15rem;
      letter-spacing: 0.04em;
      margin: 0 0 0.75rem;
      font-weight: 900;
    }
    p { margin: 0.5rem 0; line-height: 1.5; }
    code { color: #50D2C1; }
    .gate-hero {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 1rem;
    }
    .gate-hero-img {
      width: 160px;
      height: 160px;
      max-width: 160px;
      aspect-ratio: 1 / 1;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0px 0px 16px rgba(80, 210, 193, 0.35));
    }
    @media (max-width: 480px) {
      .gate-hero-img {
        width: 120px;
        height: 120px;
        max-width: 120px;
      }
    }
    .gate-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.25rem;
      text-align: left;
    }
    .gate-form label {
      font-size: 0.75rem;
      font-weight: 800;
      color: #9ca3af;
      letter-spacing: 0.02em;
    }
    .gate-input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.85rem 1rem;
      border-radius: 0.75rem;
      border: 2px solid rgba(80, 210, 193, 0.45);
      background: rgba(0, 0, 0, 0.45);
      color: #e8fff0;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 700;
      outline: none;
    }
    .gate-input:focus {
      border-color: #50D2C1;
      box-shadow: 0 0 0 3px rgba(80, 210, 193, 0.2);
    }
    .gate-error {
      display: none;
      margin: 0;
      color: #f87171;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .gate-error.visible { display: block; }
    .unlock-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      width: 100%;
      box-sizing: border-box;
      padding: 0.85rem 1.25rem;
      border-radius: 0.75rem;
      font-weight: 900;
      font-size: 0.9rem;
      letter-spacing: -0.02em;
      text-decoration: none;
      transition: filter 0.15s, transform 0.15s;
      cursor: pointer;
      font-family: inherit;
      border: 2px solid #50D2C1;
      background: #50D2C1;
      color: #051311;
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.35);
    }
    .unlock-btn:hover {
      filter: brightness(1.06);
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="gate-hero">
      <img
        src="/brand/dondon_gateway.webp"
        alt="SilverVine Private Beta Gateway"
        class="gate-hero-img"
        width="160"
        height="160"
        decoding="async"
      />
    </div>
    <h1>SILVERVINE LABS | PRIVATE BETA ACCESS</h1>
    <p style="font-weight:800;font-size:0.95rem;">Internal quant risk-control beta terminal. Enter your authorized Pass to continue.</p>
    <p style="color:#9ca3af;font-size:0.8rem;">Whitelist Pass / Wallet Ref Example: <code>0x...</code> (40-char hex address)</p>
    <form class="gate-form" id="gateForm" autocomplete="off">
      <label for="gatePassInput">Pass Key / Wallet Address</label>
      <input
        id="gatePassInput"
        class="gate-input"
        type="password"
        name="ref"
        placeholder="Enter Pass Key or 0x Wallet Address..."
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        required
      />
      <p id="gateError" class="gate-error" role="alert">Invalid Pass or wallet address. Enter a whitelist pass or valid 0x wallet.</p>
      <button type="submit" class="unlock-btn">[ 🔓 UNLOCK TRADING TERMINAL ]</button>
    </form>
  </div>
  <script>
    (function () {
      var WHITELIST = ${JSON.stringify([...GATEKEEPER_REF_WHITELIST])};
      var AUTH_KEY = ${JSON.stringify(GATEKEEPER_AUTH_STORAGE_KEY)};
      function isValidRef(ref) {
        if (typeof ref !== 'string') return false;
        var value = ref.trim();
        if (!value) return false;
        var lower = value.toLowerCase();
        for (var i = 0; i < WHITELIST.length; i++) {
          if (String(WHITELIST[i]).toLowerCase() === lower) return true;
        }
        return /^0x[a-fA-F0-9]{40}$/.test(value);
      }
      function readStoredAuth() {
        try {
          return localStorage.getItem(AUTH_KEY);
        } catch (e) {
          return null;
        }
      }
      function writeStoredAuth(value) {
        try {
          localStorage.setItem(AUTH_KEY, value);
        } catch (e) { /* private mode / quota */ }
      }
      var stored = readStoredAuth();
      if (isValidRef(stored)) {
        window.location.href = '/?ref=' + encodeURIComponent(String(stored).trim());
        return;
      }
      var form = document.getElementById('gateForm');
      var input = document.getElementById('gatePassInput');
      var errorEl = document.getElementById('gateError');
      if (!form || !input) return;
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = String(input.value || '').trim();
        if (!isValidRef(value)) {
          if (errorEl) errorEl.classList.add('visible');
          input.focus();
          return;
        }
        if (errorEl) errorEl.classList.remove('visible');
        writeStoredAuth(value);
        window.location.href = '/?ref=' + encodeURIComponent(value);
      });
      input.addEventListener('input', function () {
        if (errorEl) errorEl.classList.remove('visible');
      });
      input.focus();
    })();
  </script>
</body>
</html>`;
}

function buildDashboardContext(options: DashboardOptions): DashboardBuildContext {
  const sheetBase = options.sheetLink ?? options.telemetryLink;
  const sheetHref = sheetBase.includes("?")
    ? sheetBase
    : `${sheetBase}?gid=0#gid=0`;
  const defaultVaultEquity = 25_000;
  return {
    versionLabel: options.version,
    sheetHref,
    escAttr,
    brandShield,
    brandShieldImg,
    STATUS_DICTIONARY,
    STRATEGY_DICTIONARY,
    METRICS_DICTIONARY,
    ROOT_DEFENSE_MATRIX_TOOLTIP_DESC,
    ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL,
    TAIJI_MODE_UI,
    BAGUA_GATE_UI,
    BRAND_LOGO_DATA_URI,
    BRAND_BANNER_DATA_URI,
    initialMaxSlUsd: computeEffectiveMaxSlUsd(defaultVaultEquity),
    initialDynSlPct: dynamicMaxSlPct(10_000, defaultVaultEquity),
  };
}

/** Assemble injected client runtime — all modules share unified SystemState. */
function resolveClientScriptTokens(script: string): string {
  return script
    .replaceAll("__SV_GATEKEEPER_AUTH_KEY__", JSON.stringify(GATEKEEPER_AUTH_STORAGE_KEY))
    .replaceAll("__SV_GATEKEEPER_WHITELIST__", JSON.stringify([...GATEKEEPER_REF_WHITELIST]));
}

function assembleDashboardClientScript(
  initialSystemState: string,
  injectedRuntime: string,
  rootTelemetryJson: string,
): string {
  return resolveClientScriptTokens(`
    /** Master English Status Dictionary — injected from src/config/statusDictionary.ts */
    const STATUS_DICTIONARY = ${statusDictionaryJson()};
    const STRATEGY_DICTIONARY = ${strategyDictionaryJson()};
    const METRICS_DICTIONARY = ${metricsDictionaryJson()};

    /** Shared risk / role / CRI runtime — sourced from step1-engine + client-runtime.ts */
    ${injectedRuntime}
    ${CLIENT_GLOBAL_BINDINGS_SCRIPT}

    let systemState = ${initialSystemState};
    ${DASHBOARD_STORE_SCRIPT}
    ${RISK_CLIENT_CORE_SCRIPT}
    ${HUD_CLIENT_SCRIPT}

    ${MARKET_SENSORS_CLIENT_SCRIPT}

    const ROOT_DEFENSE_TELEMETRY = ${rootTelemetryJson};

    ${DASHBOARD_SHELL_HEAD_SCRIPT}

    ${UI_HELPERS_SCRIPT}

    ${DEMO_DRAWER_SCRIPT}

    ${HEADER_HUD_SCRIPT}

    ${HEADER_HUD_SUBSCRIPTION_SCRIPT}

    ${ORDER_ENTRY_SCRIPT}

    ${TELEMETRY_MATRIX_SCRIPT}

    ${DASHBOARD_SHELL_TAIL_SCRIPT}

    ${COPILOT_HMI_SCRIPT}

    ${MATRIX_VIEW_SUBSCRIPTION_SCRIPT}
  `);
}

/**
 * Inline dashboard HTML — Santenboku cyberpunk zen theme.
 * Tailwind via CDN; brand assets embedded as data URIs for Worker serving.
 */
export function renderDashboard(options: DashboardOptions): string {
  const ctx = buildDashboardContext(options);
  const initialSystemState = serializeSystemStateForClient(buildSystemState());
  const injectedRuntime = clientRuntimeScript();
  const rootTelemetryJson = JSON.stringify(ROOT_DEFENSE_TELEMETRY);
  const clientScript = assembleDashboardClientScript(
    JSON.stringify(initialSystemState),
    injectedRuntime,
    rootTelemetryJson,
  );

  return `
<!DOCTYPE html>
<html lang="zh-HK" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SANTENBOKU / 蔘天木 · ${ctx.versionLabel}</title>
  <link rel="icon" href="/brand/favicon.webp" type="image/webp">
  <link rel="icon" href="/brand/favicon.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/dashboard.css">
  <style>
${DASHBOARD_INLINE_STYLES}
${HMI_INLINE_STYLES}
  </style>
</head>
${renderDashboardShellHtml(ctx)}
${renderHeaderHudHtml(ctx)}
${renderDemoDrawerHtml(ctx)}
${renderDashboardShellMidHtml(ctx)}
${renderOrderEntryHtml(ctx)}
${renderDashboardShellTailHtml(ctx)}
${R20_DEADLOCK_OVERLAY_HTML}
  <div id="svTooltipRoot" role="tooltip" data-state="closed" hidden></div>
  <script>${clientScript}
  </script>
</body>
</html>
`.replaceAll("__SHEET_LINK__", ctx.sheetHref);
}
