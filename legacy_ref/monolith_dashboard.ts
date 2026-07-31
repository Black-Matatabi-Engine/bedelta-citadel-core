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
import { RISK_CLIENT_CORE_SCRIPT } from "./risk-client";
import { HUD_CLIENT_SCRIPT } from "./hud-client";
import {
  buildSystemState,
  serializeSystemStateForClient,
} from "../services/systemState";
import {
  ROOT_DEFENSE_MATRIX_TOOLTIP_DESC,
  ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL,
} from "../services/cri-engine";
import { BAGUA_GATE_UI, TAIJI_MODE_UI } from "../services/taiji-bagua";

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

/**
 * Inline dashboard HTML — santenbokui 蔘天木 cyberpunk zen theme.
 * Tailwind via CDN; brand assets embedded as data URIs for Worker serving.
 */
export function renderDashboard(options: DashboardOptions): string {
  const sheetBase = options.sheetLink ?? options.telemetryLink;
  const sheetHref = sheetBase.includes("?")
    ? sheetBase
    : `${sheetBase}?gid=0#gid=0`;
  const initialSystemState = serializeSystemStateForClient(buildSystemState());
  const versionLabel = options.version;
  const escAttr = (value: string): string =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const BRAND_FAVICON_SRC = "/brand/favicon.webp";
  const brandShield = (cls = "brand-shield-icon", size = 16): string =>
    `<img src="${BRAND_FAVICON_SRC}" alt="" class="${cls}" width="${size}" height="${size}" decoding="async" />`;

  const defaultVaultEquity = 25_000;
  const initialMaxSlUsd = computeEffectiveMaxSlUsd(defaultVaultEquity);
  const initialDynSlPct = dynamicMaxSlPct(10_000, defaultVaultEquity);
  const injectedRuntime = clientRuntimeScript();
  const rootTelemetryJson = JSON.stringify(ROOT_DEFENSE_TELEMETRY);

  return `
<!DOCTYPE html>
<html lang="zh-HK" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SANTENBOKU / 蔘天木 · ${versionLabel}</title>
  <link rel="icon" href="/brand/favicon.webp" type="image/webp">
  <link rel="icon" href="/brand/favicon.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/dashboard.css">
  <style>
    :root {
      --bg-primary: #051311;
      --bg-card-dark: #0A1A17;
      --bg-card-light: #0F2A24;
      --text-dark-theme: #e8fff0;
      --text-light-theme: #A0FFE0;
      --border-color: rgba(80, 210, 193, 0.18);
      --primary: #50D2C1;
      --accent: #50D2C1;
      --circuit: #50D2C1;
      --glacier: #50D2C1;
      --glacier-dim: #45C4B4;
      --glacier-glow: rgba(80, 210, 193, 0.8);
      --surface-glacier: #0A1A17;
      --copper: #8b5a2b;
      --base-font-size: 1.125rem;
    }
    [data-theme="light"] {
      --bg-primary: #e8f5ec;
      --bg-card-dark: #d4eadc;
      --bg-card-light: #f4fbf6;
      --text-dark-theme: #0A1A17;
      --text-light-theme: #1a3324;
      --border-color: rgba(107, 68, 35, 0.25);
    }
    body {
      background-color: var(--bg-primary);
      background-image:
        linear-gradient(180deg, rgba(5,19,17,0.82) 0%, rgba(5,19,17,0.94) 55%, #051311 100%),
        url('${BRAND_BANNER_DATA_URI}');
      background-size: cover;
      background-position: center top;
      background-attachment: fixed;
      color: var(--text-dark-theme);
      font-size: var(--base-font-size);
      font-family: 'Inter', -apple-system, sans-serif;
      font-variant-numeric: tabular-nums;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color 0.3s, color 0.3s;
    }
    .font-hud { font-family: 'Inter', -apple-system, sans-serif; }
    .font-mono {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .tabular-nums {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    #marketSessionsBox {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    table, input, button, select {
      font-size: var(--base-font-size) !important;
    }
    .sticky-col-left {
      position: sticky;
      left: 0;
      background-color: var(--bg-card-dark);
      z-index: 10;
    }
    .sticky-col-right {
      position: sticky;
      right: 0;
      background-color: var(--bg-card-dark);
      z-index: 10;
    }
    .draggable { cursor: grab; user-select: none; }
    .draggable:active { cursor: grabbing; }
    .drag-over {
      border: 2px dashed #50D2C1 !important;
      opacity: 0.8;
    }
    .funding-link {
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 0.2s, opacity 0.2s;
    }
    .funding-link:hover { color: #50D2C1 !important; opacity: 0.9; }
    th { position: relative; }
    .resizer {
      position: absolute;
      right: 0; top: 0; height: 100%; width: 5px;
      background: rgba(80, 210, 193, 0.05);
      cursor: col-resize;
      user-select: none;
    }
    .resizer:hover { background: #50D2C1; }
    .sort-asc::after { content: " ▲"; font-size: 0.75rem; color: #50D2C1; }
    .sort-desc::after { content: " ▼"; font-size: 0.75rem; color: #ef4444; }
    .brand-logo-ring {
      box-shadow: 0 0 0 1px rgba(80,210,193,0.35), 0 0 18px rgba(80,210,193,0.25);
    }
    .circuit-panel {
      border: 1px solid rgba(80,210,193,0.22);
      background: linear-gradient(145deg, rgba(13,40,24,0.92), rgba(8,26,16,0.96));
      box-shadow: inset 0 0 0 1px rgba(139,90,43,0.18);
    }
    .soil-shield {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.15rem;
      padding: 0.25rem 0.45rem;
      border-radius: 9999px;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-align: center;
      line-height: 1.25;
      white-space: nowrap;
    }
    .soil-shield-ok {
      color: #7DFFD0;
      border: 1px solid rgba(52, 211, 153, 0.35);
      background: rgba(16, 185, 129, 0.1);
      box-shadow: none;
    }
    .soil-shield-trip {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: 0.35rem;
      border-radius: 0.5rem;
      padding: 0.35rem 0.55rem;
      white-space: nowrap;
      color: #ff8a8a;
      border: 1px solid rgba(255, 80, 80, 0.55);
      background: rgba(80, 10, 10, 0.45);
      box-shadow: 0 0 12px rgba(255, 60, 60, 0.18);
      font-size: 0.68rem;
      background-image: none;
    }
    .soil-subline {
      font-size: 0.58rem;
      font-weight: 700;
      opacity: 0.9;
      letter-spacing: 0.02em;
    }
    .soil-shield-icon-lg {
      font-size: 3rem;
      line-height: 1;
      filter: drop-shadow(0 0 10px rgba(255,100,100,0.55));
    }
    .soil-shield-icon-attack {
      font-size: 2rem;
      line-height: 1;
      filter: drop-shadow(0 0 8px rgba(80,210,193,0.45));
    }
    .soil-shield-dondon {
      width: 1.75rem; /* w-7 */
      height: auto;
      object-fit: contain;
      display: block;
      margin: 0 auto;
      opacity: 1;
      transition: filter 0.2s ease, transform 0.2s ease;
    }
    .soil-shield-ok .soil-shield-dondon,
    .attack-btn:not(:disabled) .attack-btn-dondon {
      filter: drop-shadow(0 0 6px rgba(80, 210, 193, 0.6));
    }
    .soil-shield-trip .soil-shield-dondon,
    .attack-btn:disabled .attack-btn-dondon,
    .attack-btn.attack-locked .attack-btn-dondon {
      filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.8));
    }
    .attack-btn-dondon {
      width: 1.75rem;
      height: auto;
      max-width: 1.75rem;
      object-fit: contain;
      vertical-align: middle;
    }
    .funding-king-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 900;
      font-size: 1.125rem;
      line-height: 1.2;
      text-decoration: none;
      transition: background 0.15s, box-shadow 0.15s;
      letter-spacing: 0.02em;
    }
    .funding-king-high {
      color: #50D2C1;
      border: 2px solid rgba(80,210,193,0.65);
      background: rgba(80,210,193,0.12);
      box-shadow: 0 0 18px rgba(80,210,193,0.35);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .funding-king-high:hover {
      background: rgba(80,210,193,0.22);
      box-shadow: 0 0 24px rgba(80,210,193,0.5);
    }
    .funding-king-low {
      color: #ff8a8a;
      border: 2px solid rgba(255,80,80,0.65);
      background: rgba(255,80,80,0.12);
      box-shadow: 0 0 18px rgba(255,80,80,0.35);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .funding-king-low:hover {
      background: rgba(255,80,80,0.22);
      box-shadow: 0 0 24px rgba(255,80,80,0.5);
    }
    .funding-kings-bar {
      border: 1px solid rgba(80,210,193,0.35);
      background: linear-gradient(135deg, rgba(80,210,193,0.06), rgba(255,80,80,0.06));
      box-shadow: 0 0 20px rgba(80,210,193,0.12), inset 0 0 0 1px rgba(255,80,80,0.12);
    }
    .countdown-lockdown {
      background: rgba(220, 38, 38, 0.92) !important;
      color: #fff !important;
      border: 2px solid #ff6b6b !important;
      border-radius: 0.5rem;
      padding: 0.35rem 0.75rem;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      animation: pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      box-shadow: 0 0 16px rgba(255, 60, 60, 0.55);
      text-decoration: none !important;
    }
    .vol-filter-panel {
      font-size: 1rem;
    }
    .vol-filter-badge {
      font-size: 0.95rem;
      padding: 0.45rem 0.85rem;
      line-height: 1.35;
      font-weight: 800;
    }
    .oi-king-title {
      font-size: 0.8rem;
      font-weight: 900;
      color: #50D2C1;
      text-shadow: 0 0 10px rgba(80, 210, 193, 0.45);
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }
    .commodity-chip {
      font-size: 0.58rem;
      font-weight: 800;
      padding: 0.28rem 0.45rem;
      border-radius: 0.375rem;
      text-decoration: none;
      transition: background 0.15s, box-shadow 0.15s;
    }
    .commodity-chip:hover {
      box-shadow: 0 0 10px rgba(80,210,193,0.25);
    }
    .tradfi-asset-chip {
      font-size: 0.58rem;
      font-weight: 800;
      padding: 0.32rem 0.48rem;
      border-radius: 0.375rem;
      text-decoration: none;
      transition: background 0.15s, box-shadow 0.15s;
      white-space: nowrap;
    }
    .tradfi-asset-chip:hover {
      box-shadow: 0 0 12px rgba(80,210,193,0.2);
    }
    .emoji-xl {
      font-size: 1.5em;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
    }
    .panel-emoji {
      font-size: 1.5rem;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
    }
    .panel-title-text {
      font-size: 0.875rem;
      font-weight: 800;
    }
    .tradfi-cat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.35rem;
      flex-wrap: wrap;
      border-bottom: 1px solid rgba(80, 210, 193, 0.28);
      padding-bottom: 0.35rem;
      margin-bottom: 0.5rem;
    }
    .tradfi-cat-title {
      font-size: 0.875rem !important;
      font-weight: 800 !important;
      color: #7DFFD0 !important;
      letter-spacing: 0.06em;
      line-height: 1.3;
    }
    .tradfi-top-node-tag {
      position: absolute;
      top: -0.35rem;
      right: -0.2rem;
      font-size: 0.5rem;
      font-weight: 900;
      letter-spacing: 0.03em;
      color: #0b1217;
      background: linear-gradient(135deg, #fcd34d, #50D2C1);
      border: 1px solid rgba(252, 211, 77, 0.9);
      border-radius: 0.25rem;
      padding: 0.06rem 0.32rem;
      line-height: 1.2;
      white-space: nowrap;
      z-index: 3;
      pointer-events: none;
      box-shadow: 0 0 8px rgba(252, 211, 77, 0.45);
    }
    .world-tree-capsule-wrap {
      position: relative;
      padding-top: 1.35rem;
    }
    .world-tree-capsule-wrap .tradfi-root-node-tag {
      position: absolute;
      top: 0;
      right: 0;
      left: auto;
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #0b1217;
      background: linear-gradient(135deg, #fde047, #fbbf24 55%, #f59e0b 100%);
      border: 1px solid rgba(250, 204, 21, 0.95);
      border-radius: 0.4rem;
      padding: 0.2rem 0.55rem;
      line-height: 1.25;
      white-space: nowrap;
      z-index: 5;
      pointer-events: none;
      box-shadow: 0 0 12px rgba(250, 204, 21, 0.55), 0 2px 6px rgba(0, 0, 0, 0.35);
    }
    .world-tree-capsule {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 9.5rem;
      max-width: 100%;
      padding: 0.45rem 0.55rem 0.4rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.75);
      overflow: hidden;
      transition: box-shadow 0.15s, border-color 0.15s;
    }
    .world-tree-capsule:hover {
      border-color: rgba(80, 210, 193, 0.65);
      box-shadow: 0 0 14px rgba(80, 210, 193, 0.2);
    }
    .world-tree-capsule.is-root-node {
      border-color: rgb(250, 204, 21);
      box-shadow: 0 0 10px rgba(250, 204, 21, 0.4), 0 0 0 1px rgba(250, 204, 21, 0.25);
    }
    .world-tree-capsule.crowded-long {
      border-color: rgba(251, 191, 36, 0.75);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.35), inset 0 0 20px rgba(239, 68, 68, 0.08);
      animation: crowded-pulse 2.4s ease-in-out infinite;
    }
    @keyframes crowded-pulse {
      0%, 100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
      50% { box-shadow: 0 0 18px rgba(239, 68, 68, 0.45); }
    }
    .world-tree-oi-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: linear-gradient(90deg, rgba(80, 210, 193, 0.22), rgba(80, 210, 193, 0.06));
      pointer-events: none;
      z-index: 0;
      border-radius: inherit;
    }
    .world-tree-capsule-body {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .world-tree-capsule-main {
      font-size: 0.72rem;
      font-weight: 800;
      line-height: 1.35;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
    }
    .world-tree-capsule-meta {
      font-size: 0.58rem;
      font-weight: 600;
      color: rgba(156, 163, 175, 0.95);
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      line-height: 1.3;
    }
    .world-tree-capsule-actions {
      display: none;
    }
    #tradFiPanel .world-tree-capsule,
    #tradFiPanel .world-tree-capsule button,
    #tradFiPanel .world-tree-capsule a {
      font-family: ui-monospace, 'JetBrains Mono', monospace !important;
    }
    .matrix-category-btn.active {
      border-color: rgba(80, 210, 193, 0.7) !important;
      background: rgba(80, 210, 193, 0.2) !important;
      color: #50D2C1 !important;
    }
    .step2-theory-line {
      font-size: 0.7rem;
      color: rgba(156, 163, 175, 0.95);
      line-height: 1.45;
      margin-top: 0.15rem;
    }
    #tradFiPanel .tradfi-asset-chip,
    #tradFiPanel .tradfi-asset-chip button,
    #tradFiPanel .tradfi-token-price {
      font-size: 0.75rem !important;
      font-family: ui-monospace, 'JetBrains Mono', monospace !important;
      color: #45C4B4 !important;
      opacity: 0.9;
      font-weight: 600;
    }
    #tradFiPanel .tradfi-asset-chip button {
      opacity: 0.95;
    }
    /* 五大 TradFi 板塊整體字體收細 ~20%（標題 / 卡片字級已於上方規則下修） */
    .tradfi-panel-scale .panel-emoji {
      font-size: 1.2rem;
    }
    .tradfi-panel-scale .emoji-xl {
      font-size: 1.2em;
    }
    #matrixTableBody tr.token-row-selected {
      background: rgba(80, 210, 193, 0.12);
      outline: 1px solid rgba(80, 210, 193, 0.45);
    }
    #matrixTableBody tr.matrix-token-row {
      cursor: pointer;
      border-left: 4px solid transparent;
      transition: background 0.15s, border-color 0.15s;
    }
    #matrixTableBody tr.matrix-token-row:hover {
      background: rgba(2, 44, 34, 0.4); /* emerald-950/40 */
      border-left-color: #45C4B4; /* emerald-400 */
    }
    #matrixTableBody td.matrix-symbol-cell,
    #matrixTableBody td.matrix-symbol-cell .token-name-select {
      font-size: calc(1em - 1px);
    }
    .matrix-price-fr-cell {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      line-height: 1.25;
    }
    .matrix-price-fr-cell .matrix-fr-sub {
      font-size: 0.7rem;
      color: #facc15;
      opacity: 0.9;
    }
    .matrix-pagination-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.75rem;
      border-color: var(--border-color);
    }
    .matrix-page-size-btn.active {
      border-color: rgba(80, 210, 193, 0.7) !important;
      background: rgba(80, 210, 193, 0.2) !important;
      color: #50D2C1 !important;
    }
    .matrix-table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.75rem;
      width: 100%;
    }
    .matrix-table-toolbar-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      margin-left: auto;
    }
    .app-footer {
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.12);
    }
    .footer-link-btn {
      background: transparent;
      border: none;
      color: #50D2C1;
      cursor: pointer;
      padding: 0.15rem 0.35rem;
      font: inherit;
      font-weight: 800;
    }
    .footer-link-btn:hover {
      text-decoration: underline;
      color: #7ee0ce;
    }
    .footer-copyright-link {
      color: inherit;
      text-decoration: none;
    }
    .footer-copyright-link:hover {
      color: #7ee0ce;
      text-decoration: underline;
    }
    .footer-x-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #50D2C1;
      line-height: 0;
      padding: 0.15rem 0.35rem;
    }
    .footer-x-link:hover {
      color: #7ee0ce;
    }
    .footer-x-link svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    .legal-modal-body {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-height: min(60vh, 28rem);
      overflow-y: auto;
    }
    .legal-modal-body p {
      margin: 0;
    }
    .legal-modal-body strong {
      color: #50D2C1;
      display: block;
      margin-bottom: 0.35rem;
      font-size: 0.7rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .alpha-edge-panel {
      position: relative;
      border: 2px solid #ffcc33;
      border-image: none;
      background:
        linear-gradient(
          125deg,
          #ff3300 0%,
          #ff5500 28%,
          #ff9900 58%,
          #ffcc44 78%,
          #ff7700 100%
        );
      box-shadow:
        0 0 0 1px rgba(255, 230, 120, 0.55),
        0 0 18px rgba(255, 85, 0, 0.55),
        0 0 42px rgba(255, 153, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 200, 0.55),
        inset 0 -10px 28px rgba(180, 40, 0, 0.28);
      color: #000000;
      animation: alpha-edge-neon-pulse 2.8s ease-in-out infinite;
    }
    @keyframes alpha-edge-neon-pulse {
      0%, 100% {
        box-shadow:
          0 0 0 1px rgba(255, 230, 120, 0.5),
          0 0 16px rgba(255, 85, 0, 0.45),
          0 0 36px rgba(255, 153, 0, 0.28),
          inset 0 1px 0 rgba(255, 255, 200, 0.5),
          inset 0 -10px 28px rgba(180, 40, 0, 0.28);
      }
      50% {
        box-shadow:
          0 0 0 1px rgba(255, 245, 160, 0.75),
          0 0 26px rgba(255, 85, 0, 0.7),
          0 0 56px rgba(255, 200, 40, 0.4),
          inset 0 1px 0 rgba(255, 255, 220, 0.7),
          inset 0 -10px 28px rgba(180, 40, 0, 0.22);
      }
    }
    .alpha-edge-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      z-index: 1;
      background:
        linear-gradient(
          180deg,
          rgba(255, 255, 210, 0.18) 0%,
          transparent 42%,
          transparent 70%,
          rgba(120, 20, 0, 0.1) 100%
        );
    }
    .alpha-edge-panel,
    .alpha-edge-panel * {
      color: #000000;
    }
    .alpha-edge-title {
      color: #1a0500 !important;
      font-weight: 900;
      font-size: 1.05rem;
      letter-spacing: -0.02em;
      text-shadow:
        0 0 10px rgba(255, 220, 120, 0.85),
        0 1px 0 rgba(255, 255, 255, 0.35);
    }
    .alpha-edge-warning {
      color: #d1d5db !important;
      font-weight: 800;
      font-size: 0.8rem;
      line-height: 1.4;
      text-shadow: 0 0 8px rgba(0, 0, 0, 0.35);
    }
    .alpha-edge-tokens {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    }
    .alpha-edge-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.78rem;
      font-weight: 900;
      font-family: 'Akkurat Mono', 'JetBrains Mono', 'Fira Code', monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      padding: 0.4rem 0.65rem;
      border-radius: 0.375rem;
      text-decoration: none;
      white-space: nowrap;
      border: 2px solid;
      box-shadow: 0 0 12px rgba(0, 0, 0, 0.25);
    }
    .alpha-edge-chip-up {
      color: #064e3b !important;
      border-color: #064e3b;
      background: rgba(80, 210, 193, 0.32);
    }
    .alpha-edge-chip-down {
      color: #7f1d1d !important;
      border-color: #7f1d1d;
      background: rgba(255, 80, 80, 0.28);
    }
    .alpha-edge-fish-overlay {
      opacity: 0.26;
      mix-blend-mode: normal;
      filter: saturate(1.05) brightness(0.92) contrast(1.05);
    }
    .dex-settlement-box {
      background: #50D2C1;
      border: 2px solid rgba(11, 18, 23, 0.35);
      color: #0b1217;
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.35);
    }
    .dex-settlement-box.settlement-demo-locked {
      background: #0b1217;
      border-color: #50D2C1;
      color: #50D2C1;
      box-shadow: 0 0 22px rgba(80, 210, 193, 0.45);
    }
    .market-sessions-title {
      font-size: 1.5rem;
      line-height: 1.2;
      font-weight: 900;
    }
    .asia-market-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.45rem;
      border-radius: 0.35rem;
      font-size: 0.65rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(80, 210, 193, 0.35);
      color: #50D2C1;
    }
    .tradfi-draggable { cursor: grab; user-select: none; }
    .tradfi-draggable:active { cursor: grabbing; }
    .connect-wallet-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      border-radius: 0.65rem;
      font-weight: 900;
      font-size: 0.85rem;
      letter-spacing: -0.02em;
      color: #0b1217;
      background: linear-gradient(135deg, #50D2C1 0%, #45C4B4 100%);
      border: 2px solid rgba(11, 18, 23, 0.35);
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.45);
      transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
    }
    .connect-wallet-btn:hover {
      filter: brightness(1.06);
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.65);
      transform: translateY(-1px);
    }
    .connect-wallet-btn.connected {
      background: #0b1217;
      color: #50D2C1;
      border-color: #50D2C1;
    }
    .wallet-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 80;
      background: rgba(0, 0, 0, 0.72);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .wallet-modal {
      width: min(420px, 100%);
      border-radius: 1rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: linear-gradient(160deg, #0A1F1A, #051311);
      padding: 1.25rem;
      box-shadow: 0 0 40px rgba(80, 210, 193, 0.25);
    }
    .us-macro-card {
      min-width: 220px;
    }
    .us-macro-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.72rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      padding: 0.25rem 0;
      border-bottom: 1px solid rgba(80, 210, 193, 0.12);
    }
    .us-macro-row:last-child { border-bottom: none; }
    .sentiment-ext-link {
      text-decoration: none;
      margin-left: 0.25rem;
      opacity: 0.9;
    }
    .sentiment-ext-link:hover { opacity: 1; filter: brightness(1.2); }
    .gatekeeper-screen {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(ellipse at center, rgba(80, 210, 193, 0.12), transparent 55%),
        #051311;
      padding: 1.5rem;
    }
    .gatekeeper-card {
      max-width: 560px;
      width: 100%;
      text-align: center;
      border: 2px solid rgba(80, 210, 193, 0.45);
      background: rgba(11, 18, 23, 0.92);
      border-radius: 1rem;
      padding: 2rem 1.5rem;
      box-shadow: 0 0 40px rgba(80, 210, 193, 0.2);
    }
    .tsunami-shield-lamp {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: 900;
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      color: #ff8a8a;
      border: 2px solid rgba(255, 100, 100, 0.55);
      background: rgba(80, 10, 10, 0.45);
      box-shadow: 0 0 16px rgba(255, 60, 60, 0.35);
      animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .funding-yield-fact {
      font-size: 0.7rem;
      color: rgba(80, 210, 193, 0.75);
      font-weight: 600;
      letter-spacing: 0.02em;
      margin-top: 0.35rem;
    }
    .soil-subline {
      font-size: 0.55rem;
      font-weight: 600;
      opacity: 0.85;
      letter-spacing: 0.02em;
    }
    .soil-token-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
      max-width: 100%;
    }
    .soil-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.58rem;
      font-weight: 900;
      font-family: 'Akkurat Mono', 'JetBrains Mono', 'Fira Code', monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      padding: 0.18rem 0.4rem;
      border-radius: 0.3rem;
      border: 1px solid;
      white-space: nowrap;
      cursor: help;
    }
    .soil-solid {
      color: #50D2C1;
      border-color: rgba(80, 210, 193, 0.55);
      background: rgba(80, 210, 193, 0.1);
    }
    .soil-balanced {
      color: #45C4B4;
      border-color: rgba(0, 229, 153, 0.55);
      background: rgba(0, 229, 153, 0.12);
    }
    .soil-loose {
      color: #FFD700;
      border-color: rgba(255, 215, 0, 0.55);
      background: rgba(255, 215, 0, 0.12);
    }
    .soil-danger {
      color: #FF4D4D;
      border-color: rgba(255, 77, 77, 0.7);
      background: rgba(255, 77, 77, 0.16);
      box-shadow: 0 0 10px rgba(255, 77, 77, 0.35);
      animation: pulse 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    /* Radix-compatible status tooltips (vanilla dashboard surface) */
    .sv-tip {
      cursor: help;
      border-bottom: 1px dotted rgba(80, 210, 193, 0.4);
      outline: none;
    }
    .sv-tip:focus-visible {
      box-shadow: 0 0 0 2px rgba(80, 210, 193, 0.45);
      border-radius: 0.25rem;
    }
    #svTooltipRoot {
      position: fixed;
      z-index: 10050;
      max-width: min(20rem, calc(100vw - 1.5rem));
      padding: 0.55rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(16, 185, 129, 0.4);
      background: rgba(15, 23, 42, 0.92);
      color: #A0FFE0;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.7rem;
      font-weight: 700;
      line-height: 1.45;
      letter-spacing: 0.01em;
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.22), 0 12px 32px rgba(0, 0, 0, 0.55);
      pointer-events: none;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.12s ease, transform 0.12s ease;
      white-space: normal;
    }
    #svTooltipRoot[data-state="open"] {
      opacity: 1;
      transform: translateY(0);
    }
    #svTooltipRoot .sv-tip-label {
      display: block;
      color: #50D2C1;
      margin-bottom: 0.3rem;
      font-weight: 900;
    }
    .soil-tooltip {
      display: none;
      position: absolute;
      left: 0;
      bottom: calc(100% + 8px);
      z-index: 40;
      min-width: 220px;
      padding: 0.75rem 0.85rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      background: #0b1217;
      color: #e8fff0;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55), 0 0 18px rgba(80, 210, 193, 0.2);
      font-family: 'Akkurat Mono', 'JetBrains Mono', 'Fira Code', monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      pointer-events: none;
    }
    .soil-token-wrap:hover .soil-tooltip,
    .soil-king-wrap:hover .soil-tooltip {
      display: block;
    }
    .soil-tooltip-title {
      font-size: 0.68rem;
      font-weight: 900;
      color: #50D2C1;
      margin-bottom: 0.45rem;
    }
    .soil-tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.18rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .soil-tooltip-row:last-child { border-bottom: none; }
    .soil-king-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      flex-wrap: wrap;
      width: 100%;
    }
    .root-slip-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(80, 210, 193, 0.06);
      font-family: 'Akkurat Mono', 'JetBrains Mono', 'Fira Code', monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .root-slip-status.tripped {
      border-color: rgba(251, 146, 60, 0.55);
      background: rgba(251, 146, 60, 0.1);
    }
    .dondon-eyes {
      width: 140px;
      max-width: 140px;
      height: auto;
      object-fit: contain;
      opacity: 0.8;
      transition: all 0.3s ease;
      vertical-align: middle;
    }
    .dondon-eyes:hover,
    .dondon-eyes.dondon-awake,
    .attack-armed .dondon-eyes,
    button:hover .dondon-eyes {
      opacity: 1;
      transform: scale(1.05);
      filter: drop-shadow(0 0 12px rgba(80, 210, 193, 0.8));
    }
    .dondon-eyes-lg {
      width: 140px;
      max-width: 140px;
      height: auto;
    }
    .dondon-eyes-inline {
      width: 140px;
      max-width: 140px;
    }
    .section-header {
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #45C4B4;
    }
    .step-badge {
      display: inline-flex;
      align-items: center;
      color: #45C4B4;
      border: 1px solid rgba(16, 185, 129, 0.5);
      padding: 0.125rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 800;
      font-family: var(--font-mono, ui-monospace, monospace);
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .token-price-link {
      font-size: 0.875rem;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-weight: 700;
      color: #45C4B4;
      text-decoration: none;
    }
    .token-price-link:hover {
      text-decoration: underline;
      color: #7DFFD0;
    }
    .tradfi-token-price,
    #tradFiPanel .token-price-link {
      font-size: 0.75rem !important;
      font-family: ui-monospace, 'JetBrains Mono', monospace !important;
      font-weight: 700 !important;
      opacity: 0.8;
      color: #45C4B4 !important;
    }
    .alpha-edge-chip .text-emerald-300,
    .alpha-edge-price {
      font-size: 1.25rem !important;
      font-family: ui-monospace, 'JetBrains Mono', monospace !important;
      font-weight: 800 !important;
      color: #7DFFD0 !important;
    }
    .step1-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .step1-header-sentiment {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-left: auto;
    }
    .step1-sentiment-micro {
      font-size: 0.65rem;
      font-weight: 800;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      white-space: nowrap;
      border: 1px solid;
    }
    .step1-sessions-mint {
      background: #a8f0e6 !important;
      color: #0f172a !important;
      border: 2px solid rgba(16, 185, 129, 0.45) !important;
      box-shadow: 0 0 12px rgba(168, 240, 230, 0.35);
    }
    .step1-sessions-mint .section-header,
    .step1-sessions-mint #marketSessionsTitle,
    .step1-sessions-mint .asia-market-chip {
      color: #0f172a !important;
    }
    .step1-sessions-mint .asia-market-chip {
      background: rgba(255, 255, 255, 0.45) !important;
      border-color: rgba(15, 23, 42, 0.15) !important;
    }
    .alien-sandbox-hero,
    .aquarium-springs-hero {
      background: #0b1317 !important;
      border: 1px solid rgba(245, 158, 11, 0.4) !important;
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.15) !important;
      min-height: 100%;
      color: #e5e7eb !important;
    }
    .alien-sandbox-title,
    .aquarium-springs-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fbbf24 !important;
      text-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
      letter-spacing: -0.02em;
    }
    .aquarium-dark-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      background: linear-gradient(
        to top,
        #0b1317 0%,
        rgba(11, 19, 23, 0.7) 55%,
        rgba(11, 19, 23, 0.3) 100%
      );
    }
    .step1-col-left {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 0;
    }
    .step1-sentiment-slot {
      min-height: 7rem;
    }
    .step1-aquarium-slot {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
    }
    .step1-col-center {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-height: 0;
    }
    .world-tree-capsule-capacity {
      font-size: 0.78rem;
      font-weight: 800;
      line-height: 1.4;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
    }
    .world-tree-capsule-price {
      font-size: 0.68rem;
      font-weight: 700;
      line-height: 1.35;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      color: #7DFFD0;
      opacity: 0.88;
    }
    .world-tree-capsule-price a,
    .world-tree-capsule-price .hl-trade-icon-link {
      color: #7DFFD0;
      opacity: 0.92;
      text-decoration: none;
      font-weight: 800;
    }
    .world-tree-capsule-price a:hover,
    .world-tree-capsule-price .hl-trade-icon-link:hover {
      color: #A0FFE0;
      opacity: 1;
      text-decoration: underline;
    }
    .world-tree-oi-highlight {
      color: #7DFFD0;
      font-weight: 800;
    }
    .world-tree-fr-highlight {
      color: #facc15;
      font-weight: 800;
    }
    #step1ColLeft .vol-filter-badge,
    #step1ColCenter .vol-filter-badge,
    #step1LeftPanel .vol-filter-badge {
      font-size: 1rem;
      line-height: 1.45;
      padding: 0.55rem 0.8rem;
      font-weight: 800;
    }
    #step1ColCenter .asia-market-chip,
    #step1ColLeft .asia-market-chip,
    #step1LeftPanel .asia-market-chip {
      font-size: 0.875rem;
      padding: 0.45rem 0.7rem;
      white-space: nowrap;
      font-weight: 700;
    }
    #step1ColCenter .us-macro-row,
    #step1ColLeft .us-macro-row,
    #step1LeftPanel .us-macro-row {
      font-size: 1rem;
      padding: 0.45rem 0;
    }
    #step1ColCenter .section-header,
    #step1ColLeft .section-header,
    #step1LeftPanel .section-header {
      font-size: 1.05rem;
    }
    .step1-glacier-card {
      background: rgba(6, 32, 27, 0.8);
      border: 1px solid rgba(80, 210, 193, 0.3);
      box-shadow: 0 0 15px rgba(80, 210, 193, 0.1);
    }
    .step1-sessions-card {
      overflow: visible;
    }
    .step1-col-center,
    .step1-left-panel {
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: linear-gradient(145deg, rgba(11, 18, 23, 0.96), rgba(13, 40, 24, 0.9));
      transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
      padding: 0.75rem;
      border-radius: 0.75rem;
    }
    .step1-col-left.all-red-mode,
    .step1-col-center.all-red-mode,
    .step1-left-panel.all-red-mode {
      background: rgba(69, 10, 10, 0.9) !important;
      border: 2px solid #ef4444 !important;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.5);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      color: #fecaca;
    }
    .step1-col-center.all-red-mode .section-header,
    .step1-col-center.all-red-mode .us-macro-row,
    .step1-col-center.all-red-mode .asia-market-chip,
    .step1-col-center.all-red-mode #marketSessionsTitle,
    .step1-col-center.all-red-mode a,
    .step1-col-left.all-red-mode .section-header,
    .step1-col-left.all-red-mode .us-macro-row,
    .step1-col-left.all-red-mode .asia-market-chip,
    .step1-col-left.all-red-mode #marketSessionsTitle,
    .step1-col-left.all-red-mode a,
    .step1-left-panel.all-red-mode .section-header,
    .step1-left-panel.all-red-mode .us-macro-row,
    .step1-left-panel.all-red-mode .asia-market-chip,
    .step1-left-panel.all-red-mode #marketSessionsTitle,
    .step1-left-panel.all-red-mode a {
      color: #fecaca !important;
    }
    .step1-col-center.all-red-mode #macroCpiCountdown,
    .step1-col-center.all-red-mode #macroEcbCountdown,
    .step1-col-center.all-red-mode #macroBojCountdown,
    .step1-col-center.all-red-mode #macroFomcCountdown,
    .step1-col-left.all-red-mode #macroCpiCountdown,
    .step1-col-left.all-red-mode #macroEcbCountdown,
    .step1-col-left.all-red-mode #macroBojCountdown,
    .step1-col-left.all-red-mode #macroFomcCountdown,
    .step1-left-panel.all-red-mode #macroCpiCountdown,
    .step1-left-panel.all-red-mode #macroEcbCountdown,
    .step1-left-panel.all-red-mode #macroBojCountdown,
    .step1-left-panel.all-red-mode #macroFomcCountdown {
      color: #fdba74 !important;
    }
    .step1-col-center.all-red-mode .us-macro-card,
    .step1-col-center.all-red-mode .step1-glacier-card,
    .step1-col-center.all-red-mode .circuit-panel,
    .step1-col-center.all-red-mode .vol-filter-panel,
    .step1-col-center.all-red-mode .dex-settlement-box,
    .step1-col-left.all-red-mode .us-macro-card,
    .step1-col-left.all-red-mode .step1-glacier-card,
    .step1-col-left.all-red-mode .circuit-panel,
    .step1-col-left.all-red-mode .vol-filter-panel,
    .step1-left-panel.all-red-mode .us-macro-card,
    .step1-left-panel.all-red-mode .step1-glacier-card,
    .step1-left-panel.all-red-mode .circuit-panel,
    .step1-left-panel.all-red-mode .vol-filter-panel {
      border-color: rgba(239, 68, 68, 0.45) !important;
      background: rgba(0, 0, 0, 0.25) !important;
      box-shadow: none !important;
    }
    .step1-all-red-banner {
      font-size: 0.95rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      text-align: center;
      padding: 0.65rem 0.85rem;
      border-radius: 0.5rem;
      background: rgba(127, 29, 29, 0.85);
      border: 1px solid #f87171;
      color: #fed7aa;
      text-shadow: 0 0 12px rgba(239, 68, 68, 0.55);
    }
    .hl-trade-icon-link {
      font-size: 0.7rem;
      color: #50D2C1;
      text-decoration: none;
      font-weight: 800;
      white-space: nowrap;
    }
    .hl-trade-icon-link:hover {
      text-decoration: underline;
      opacity: 1;
    }
    .tour-modal,
    .sop-guide-modal {
      max-width: 48rem;
      max-height: 88vh;
      overflow: hidden;
      width: 94%;
      background: #0d131a;
      border: 2px solid rgba(80, 210, 193, 0.55);
      border-radius: 1.25rem;
      padding: 0;
      box-shadow:
        0 0 0 1px rgba(80, 210, 193, 0.15),
        0 0 48px rgba(80, 210, 193, 0.28),
        0 24px 64px rgba(0, 0, 0, 0.55);
    }
    .brand-hero-header {
      position: relative;
      height: 12rem;
      background-image: url('/brand/dondon-eyes.webp');
      background-size: cover;
      background-position: center;
      overflow: hidden;
    }
    .brand-hero-header--section {
      position: relative;
      height: auto;
      min-height: 0;
      border-radius: 0.75rem 0.75rem 0 0;
      background-image: none;
      background-color: #50D2C1;
      border-bottom: 1px solid rgba(15, 23, 42, 0.18);
      box-shadow: 0 0 15px rgba(80, 210, 193, 0.35);
      transition: all 0.15s ease;
    }
    .brand-hero-header--section .brand-hero-header-overlay {
      display: none;
    }
    .inject-header-stack {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 2.75rem 0.75rem 0.75rem;
      width: 100%;
      text-align: center;
    }
    .inject-header-subtitle {
      margin: 0;
      max-width: 100%;
      line-height: 1.35;
      color: rgb(15 23 42 / 0.8);
    }
    .brand-hero-header--matrix {
      min-height: 10.5rem;
      height: auto;
      border-radius: 0;
      background-image: none;
      background-color: #0d131a;
    }
    .brand-hero-header--matrix::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('/brand/dondon-eyes.webp');
      background-size: cover;
      background-position: center;
      opacity: 0.8;
      pointer-events: none;
      z-index: 0;
    }
    .brand-hero-header--matrix .brand-hero-header-overlay {
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
      z-index: 0;
    }
    .sop-guide-modal .brand-hero-header {
      border-radius: 1.1rem 1.1rem 0 0;
    }
    .brand-hero-title {
      margin: 0;
      font-size: 1.5rem;
      line-height: 1.2;
      font-weight: 700;
      color: #45C4B4;
      text-shadow: 0 0 24px rgba(52, 211, 153, 0.45), 0 2px 8px rgba(0, 0, 0, 0.85);
      letter-spacing: -0.02em;
    }
    .brand-hero-title--section {
      font-size: 1.25rem;
    }
    .brand-hero-subtitle {
      margin: 0.35rem 0 0;
      font-size: 0.8rem;
      line-height: 1.4;
      font-weight: 700;
      color: rgba(167, 243, 208, 0.82);
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.85);
    }
    .brand-hero-close {
      position: absolute;
      top: 0.85rem;
      right: 0.85rem;
      z-index: 2;
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.45);
      color: #d1d5db;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .brand-hero-close:hover {
      background: rgba(80, 210, 193, 0.2);
      border-color: rgba(80, 210, 193, 0.55);
      color: #fff;
    }
    .sop-guide-body {
      padding: 2rem;
      overflow-y: auto;
      max-height: calc(88vh - 12rem);
    }
    .sop-guide-steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .sop-guide-step h3 {
      color: #50D2C1;
      font-weight: 900;
      font-size: 1.125rem;
      line-height: 1.4;
      margin: 0 0 0.65rem;
    }
    .sop-guide-step p,
    .sop-guide-step li {
      color: #d1d5db;
      font-size: 1rem;
      line-height: 1.65;
      margin: 0;
    }
    .sop-guide-step ul {
      margin: 0 0 0.75rem;
      padding-left: 1.25rem;
    }
    .sop-guide-step p + p {
      margin-top: 0.5rem;
    }
    .sop-book-link {
      color: #7DFFD0;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 0.2s;
      font-weight: 700;
    }
    .sop-book-link:hover {
      color: #ecfdf5;
    }
    .inject-status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0;
      border-radius: 0;
      border: none;
      background: transparent;
      color: #020617;
      font-size: 1.05rem;
      line-height: 1.25;
      font-weight: 900;
      letter-spacing: 0.02em;
      white-space: normal;
      text-align: center;
      text-shadow: none;
      box-shadow: none;
    }
    .inject-status-badge.is-pending {
      color: rgb(15 23 42 / 0.75);
      font-size: 0.95rem;
      font-weight: 700;
      background: transparent;
      border: none;
      animation: injectPulse 1.4s ease-in-out infinite;
    }
    .inject-status-badge.is-active {
      color: #020617;
      background: transparent;
      border: none;
      box-shadow: none;
      text-shadow: none;
    }
    @keyframes injectPulse {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 1; }
    }
    .brand-hero-header--section .brand-hero-header-inner {
      display: block;
      height: auto;
      padding: 0;
      align-items: center;
      justify-content: center;
    }
    .sop-guide-trigger-btn {
      position: absolute;
      top: 0.55rem;
      right: 0.55rem;
      width: 1.85rem;
      height: 1.85rem;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: 1px solid rgba(15, 23, 42, 0.28);
      background: rgba(15, 23, 42, 0.18);
      color: #020617;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: none;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .sop-guide-trigger-btn:hover {
      background: rgba(15, 23, 42, 0.28);
      border-color: rgba(15, 23, 42, 0.45);
      color: #020617;
      box-shadow: none;
    }
    .max-sl-lock-badge,
    .dyn-sl-lock-tag,
    .merged-sl-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
      margin-top: 0;
      padding: 0.45rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.65);
      background: rgba(80, 210, 193, 0.1);
      color: #50D2C1;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      box-shadow: 0 0 14px rgba(80, 210, 193, 0.28);
      white-space: normal;
      line-height: 1.35;
      cursor: help;
    }
    .master-risk-console-body,
    .attack-zone-body {
      padding: 1rem 1.25rem 1.25rem;
    }
    .tour-modal-header {
      position: relative;
      height: 11rem;
      background-image: url('/brand/dondon-eyes.webp');
      background-size: cover;
      background-position: center;
      border-radius: 1.1rem 1.1rem 0 0;
      overflow: hidden;
    }
    .tour-modal-header-overlay,
    .brand-hero-header-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        #0d131a 0%,
        rgba(13, 19, 26, 0.82) 38%,
        rgba(13, 19, 26, 0.35) 68%,
        transparent 100%
      );
      pointer-events: none;
    }
    .tour-modal-header-inner,
    .brand-hero-header-inner {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 100%;
      padding: 1rem 1.5rem 1.25rem;
    }
    .brand-hero-header-inner {
      flex-wrap: wrap;
      gap: 1rem;
    }
    .brand-hero-header--matrix .brand-hero-header-inner {
      align-items: stretch;
      padding: 1.25rem 1.5rem 1.5rem;
    }
    .matrix-table-filters {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }
    .matrix-table-updated {
      font-size: 0.75rem;
      font-family: ui-monospace, monospace;
      color: rgba(167, 243, 208, 0.8);
      white-space: nowrap;
    }
    .tour-modal-title {
      margin: 0;
      font-size: 1.875rem;
      line-height: 1.2;
      font-weight: 900;
      color: #45C4B4;
      text-shadow: 0 0 24px rgba(52, 211, 153, 0.45), 0 2px 8px rgba(0, 0, 0, 0.85);
      letter-spacing: -0.02em;
    }
    .tour-modal-close,
    .brand-hero-close {
      position: absolute;
      top: 0.85rem;
      right: 0.85rem;
      z-index: 2;
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.45);
      color: #d1d5db;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .tour-modal-close:hover {
      background: rgba(80, 210, 193, 0.2);
      border-color: rgba(80, 210, 193, 0.55);
      color: #fff;
    }
    .tour-modal-body {
      padding: 1.5rem 1.75rem 1.75rem;
      overflow-y: auto;
      max-height: calc(88vh - 11rem);
    }
    .tour-modal-steps {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .tour-modal-step {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.85rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.2);
      background: rgba(6, 32, 27, 0.55);
      font-size: 1rem;
      line-height: 1.6;
      color: #e5e7eb;
      cursor: help;
    }
    .tour-modal-step-body {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.45rem 0.65rem;
      min-width: 0;
    }
    .tour-modal-step .tour-root-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: #A0FFE0;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 78, 59, 0.35);
      border-radius: 0.35rem;
      padding: 0.12rem 0.4rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .tour-modal-step-badge {
      flex-shrink: 0;
      font-size: 0.8rem;
      font-weight: 900;
      padding: 0.3rem 0.65rem;
      border-radius: 0.45rem;
      color: #7DFFD0;
      border: 1px solid rgba(16, 185, 129, 0.55);
      background: rgba(16, 185, 129, 0.12);
      white-space: nowrap;
    }
    .tour-modal-cta {
      margin-top: 1.5rem;
      width: 100%;
      padding: 0.85rem 1.25rem;
      border-radius: 0.75rem;
      border: 2px solid rgba(80, 210, 193, 0.75);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(6, 78, 59, 0.55));
      color: #7DFFD0;
      font-size: 1.125rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      cursor: pointer;
      box-shadow:
        0 0 20px rgba(80, 210, 193, 0.35),
        0 0 40px rgba(16, 185, 129, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
      transition: transform 0.15s, box-shadow 0.2s, background 0.2s, border-color 0.2s;
    }
    .tour-modal-cta:hover {
      transform: translateY(-1px);
      border-color: #50D2C1;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.42), rgba(6, 95, 70, 0.65));
      color: #A0FFE0;
      box-shadow:
        0 0 28px rgba(80, 210, 193, 0.55),
        0 0 56px rgba(16, 185, 129, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
    .tour-modal-cta:active {
      transform: translateY(0);
    }
    .tour-modal-step p,
    .tour-modal-step li {
      color: #d1d5db;
      font-size: 0.75rem;
      line-height: 1.55;
    }
    .soil-badge.soil-warning {
      color: #fbbf24;
      border-color: rgba(251, 191, 36, 0.45);
      background: rgba(251, 191, 36, 0.12);
    }
    .attack-zone {
      border: 2px solid rgba(251, 146, 60, 0.45);
      background: linear-gradient(145deg, rgba(11, 18, 23, 0.96), rgba(40, 24, 13, 0.94));
      box-shadow: 0 0 28px rgba(251, 146, 60, 0.18);
      overflow: hidden;
    }
    .master-risk-console {
      border: 2px solid rgba(80, 210, 193, 0.45);
      background: linear-gradient(145deg, rgba(11, 18, 23, 0.96), rgba(13, 40, 24, 0.94));
      box-shadow: 0 0 28px rgba(80, 210, 193, 0.18);
      overflow: hidden;
    }
    .step3-econ-card {
      background: rgba(6, 78, 59, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 0.5rem;
      padding: 0.75rem;
      min-height: 150px;
    }
    .master-slider {
      width: 100%;
      accent-color: #50D2C1;
    }
    .mega-slider-wrap {
      margin-top: 0.35rem;
      padding: 0.85rem 0.9rem 1rem;
      border-radius: 0.85rem;
      border: 1px solid rgba(80, 210, 193, 0.55);
      background:
        radial-gradient(ellipse at 20% 0%, rgba(80, 210, 193, 0.22), transparent 55%),
        linear-gradient(180deg, rgba(6, 40, 32, 0.95), rgba(4, 16, 12, 0.92));
      box-shadow:
        0 0 28px rgba(80, 210, 193, 0.28),
        inset 0 0 18px rgba(80, 210, 193, 0.08);
    }
    .mega-slider-wrap .master-slider {
      height: 1.35rem;
      accent-color: #50D2C1;
      filter: drop-shadow(0 0 8px rgba(80, 210, 193, 0.55));
    }
    .mega-slider-title {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.45rem;
    }
    .mega-slider-title .typo-action {
      color: #A0FFE0;
      letter-spacing: 0.06em;
      text-shadow: 0 0 10px rgba(80, 210, 193, 0.35);
      font-size: 0.78rem;
    }
    .capital-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.45rem;
    }
    .capital-preset-btn {
      padding: 0.25rem 0.55rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      background: rgba(0, 0, 0, 0.35);
      color: #7DFFD0;
      font-size: 0.68rem;
      font-weight: 900;
      cursor: pointer;
    }
    .capital-preset-btn:hover,
    .capital-preset-btn.is-active {
      background: rgba(80, 210, 193, 0.2);
      border-color: #50D2C1;
      color: #A0FFE0;
    }
    /* Pipeline Bar Master Preset Controller (micro-tabs) */
    .pipeline-mode-toggle {
      display: inline-flex;
      flex-shrink: 0;
      align-items: stretch;
      gap: 0.2rem;
      padding: 0.18rem;
      border-radius: 0.55rem;
      border: 1px solid rgba(251, 191, 36, 0.35);
      background: rgba(0, 0, 0, 0.45);
      box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.35);
    }
    @media (max-width: 720px) {
      .pipeline-mode-toggle {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
      }
      .pipeline-mode-btn {
        min-width: 0;
      }
      .pipeline-mode-btn .pipeline-mode-status {
        display: none;
      }
    }
    .pipeline-mode-btn {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 0.08rem;
      padding: 0.28rem 0.55rem;
      border: 1px solid transparent;
      border-radius: 0.4rem;
      background: transparent;
      color: #94a3b8;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.01em;
      line-height: 1.15;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .pipeline-mode-btn .pipeline-mode-label {
      font-weight: 900;
    }
    .pipeline-mode-btn .pipeline-mode-status {
      font-size: 0.52rem;
      font-weight: 700;
      opacity: 0.72;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .pipeline-mode-btn:hover {
      color: #e2e8f0;
      background: rgba(255, 255, 255, 0.04);
    }
    .pipeline-mode-btn.is-active.shield {
      color: #6EE7B7;
      border-color: rgba(16, 185, 129, 0.55);
      background: rgba(6, 78, 59, 0.45);
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.45), inset 0 0 8px rgba(16, 185, 129, 0.18);
    }
    .pipeline-mode-btn.is-active.tactical {
      color: #FCD34D;
      border-color: rgba(251, 191, 36, 0.55);
      background: rgba(120, 53, 15, 0.42);
      box-shadow: 0 0 14px rgba(251, 191, 36, 0.4), inset 0 0 8px rgba(251, 191, 36, 0.15);
    }
    .pipeline-mode-btn.is-active.flash {
      color: #A5B4FC;
      border-color: rgba(99, 102, 241, 0.55);
      background: rgba(49, 46, 129, 0.5);
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.5), inset 0 0 8px rgba(129, 140, 248, 0.2);
    }
    .pipeline-mode-btn.is-active .pipeline-mode-status {
      opacity: 0.95;
    }
    .auto-guard-banner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.55rem 0.75rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(251, 191, 36, 0.42);
      background: linear-gradient(135deg, rgba(66, 42, 8, 0.88), rgba(11, 18, 23, 0.92));
      padding: 0.55rem 0.85rem;
      margin-bottom: 0.65rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 800;
      color: #fde68a;
      line-height: 1.45;
      box-shadow: 0 0 18px rgba(251, 191, 36, 0.12);
      letter-spacing: 0.01em;
    }
    .auto-guard-banner-main {
      flex: 1 1 12rem;
      min-width: 0;
    }
    .banner-heat-status {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      font-weight: 900;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .banner-heat-status.is-safe { color: #50D2C1; text-shadow: 0 0 10px rgba(80, 210, 193, 0.55); }
    .banner-heat-status.is-elevated { color: #fde68a; }
    .banner-heat-status.is-extreme { color: #fecaca; }
    .banner-heat-status.is-flash {
      color: #A5B4FC;
      text-shadow: 0 0 12px rgba(99, 102, 241, 0.65);
    }
    .auto-guard-banner.is-locked {
      border-color: rgba(251, 191, 36, 0.5);
      color: #fde68a;
    }
    .auto-guard-banner.is-flash {
      border-color: rgba(99, 102, 241, 0.55);
      color: #c7d2fe;
      box-shadow: 0 0 18px rgba(99, 102, 241, 0.18);
    }
    .auto-guard-banner.is-unlocked {
      border-color: rgba(52, 211, 153, 0.55);
      color: #7DFFD0;
    }
    .auto-guard-banner.is-tactical {
      border-color: rgba(251, 191, 36, 0.48);
      color: #fde68a;
    }
    .session-clock-row {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.5rem;
    }
    .session-clock-chip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.55rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(0,0,0,0.12);
      background: rgba(255,255,255,0.35);
      font-size: 0.72rem;
      font-weight: 800;
      color: #0b1217;
    }
    .session-clock-chip.is-active {
      border-color: rgba(6, 78, 59, 0.45);
      background: rgba(16, 185, 129, 0.28);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
    }
    .session-settlement-merge {
      margin-top: 0.55rem;
      padding-top: 0.5rem;
      border-top: 1px dashed rgba(0,0,0,0.15);
      font-size: 0.72rem;
      font-weight: 800;
      color: #0b1217;
    }
    .macro-oracle-badge {
      margin-top: 0.65rem;
      padding: 0.4rem 0.5rem;
      border-radius: 0.4rem;
      border: 1px dashed rgba(80, 210, 193, 0.35);
      background: rgba(0,0,0,0.2);
      font-size: 0.62rem;
      color: #94a3b8;
      line-height: 1.35;
      font-weight: 700;
    }
    .step2-funding-panel {
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: linear-gradient(135deg, rgba(80, 210, 193, 0.12), rgba(11, 18, 23, 0.92));
      padding: 0.65rem 0.85rem;
      margin-bottom: 0.75rem;
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.15);
    }
    .mode-gate-panel {
      display: none !important;
    }
    .header-vault-pill {
      display: none !important;
    }
    .step3-vault-bar,
    .step1-vault-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.65rem;
      margin-bottom: 0.75rem;
      padding: 0.625rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(16, 185, 129, 0.3);
      background: rgba(15, 23, 42, 0.8);
      font-size: 0.75rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .step1-vault-bar {
      width: 100%;
    }
    .vault-balance-badge {
      display: flex;
      flex-direction: column;
      gap: 0.28rem;
      margin-bottom: 0.65rem;
      padding: 0.5rem 0.65rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(80, 210, 193, 0.55);
      background:
        linear-gradient(135deg, rgba(2, 24, 22, 0.95) 0%, rgba(15, 23, 42, 0.98) 55%, rgba(6, 40, 36, 0.92) 100%);
      box-shadow:
        0 0 0 1px rgba(80, 210, 193, 0.12) inset,
        0 0 14px rgba(80, 210, 193, 0.18);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .vault-balance-main {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.4rem 0.55rem;
      line-height: 1.2;
    }
    .vault-balance-label {
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      color: #7DFFD0;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.45);
    }
    .vault-balance-value {
      font-size: 0.82rem;
      font-weight: 900;
      color: #A0FFE0;
      letter-spacing: 0.04em;
      text-shadow: 0 0 12px rgba(80, 210, 193, 0.55);
    }
    .vault-balance-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.3rem 0.45rem;
      font-size: 0.62rem;
      font-weight: 700;
      color: #94a3b8;
    }
    .vault-balance-meta .vault-sep {
      color: rgba(148, 163, 184, 0.45);
    }
    .capital-vault-pcts {
      margin-top: 0.3rem;
    }
    .capital-vault-pct-btn {
      border-style: dashed;
    }
    .capital-preset-btn:disabled,
    .capital-preset-btn.is-disabled {
      opacity: 0.35;
      cursor: not-allowed;
      filter: grayscale(0.4);
    }
    .step3-vault-stats,
    .step1-vault-stats {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem 0.65rem;
      font-family: inherit;
      font-size: inherit;
      font-weight: 700;
      color: #cbd5e1;
    }
    .step1-vault-stats .vault-label-vault,
    .step1-vault-stats .vault-equity-value {
      color: #34d399;
      font-weight: 700;
    }
    .step1-vault-stats .vault-label-pos,
    .step1-vault-stats .vault-pos-value {
      color: #cbd5e1;
    }
    .step1-vault-stats .vault-label-pnl,
    .step1-vault-stats .step3-vault-pnl.is-pos {
      color: #34d399;
      font-weight: 700;
    }
    .step1-vault-stats .step3-vault-pnl.is-neg {
      color: #f87171;
      font-weight: 700;
    }
    .step3-vault-stats .vault-sep,
    .step1-vault-stats .vault-sep {
      color: rgba(148, 163, 184, 0.55);
    }
    .step3-vault-pnl.is-pos { color: #45C4B4; }
    .step3-vault-pnl.is-neg { color: #f87171; }
    .step3-emergency-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 0.55rem;
    }
    .emergency-close-all-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.75rem;
      border-radius: 0.5rem;
      border: 2px solid rgba(239, 68, 68, 0.75);
      background: linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(69, 10, 10, 0.9));
      color: #fecaca;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 0 18px rgba(239, 68, 68, 0.35);
      white-space: nowrap;
    }
    .emergency-close-all-btn:hover {
      background: linear-gradient(135deg, rgba(185, 28, 28, 0.98), rgba(127, 29, 29, 0.95));
      color: #fff;
    }
    .market-heartbeat-card {
      min-height: 100px;
      height: auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.4rem;
      margin-bottom: 0.65rem;
      padding: 0.55rem 0.75rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      transition: background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s;
      box-sizing: border-box;
    }
    .market-heartbeat-card .mhb-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.2fr);
      gap: 0.55rem 0.85rem;
      align-items: start;
    }
    @media (max-width: 640px) {
      .market-heartbeat-card .mhb-grid {
        grid-template-columns: 1fr;
      }
    }
    .market-heartbeat-card .mhb-title {
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 0.2rem;
    }
    .market-heartbeat-card .mhb-root5,
    .market-heartbeat-card .mhb-circuit,
    .market-heartbeat-card .mhb-hl {
      line-height: 1.35;
      white-space: nowrap;
    }
    .market-heartbeat-card .mhb-hl {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem 0.45rem;
      white-space: normal;
    }
    .market-heartbeat-card .mhb-root5-label {
      opacity: 0.95;
      margin-right: 0.35rem;
    }
    .market-heartbeat-card .mhb-vol-state {
      font-weight: 900;
    }
    .market-heartbeat-card .mhb-sessions {
      display: flex;
      flex-direction: column;
      gap: 0.12rem;
      margin-top: 0.15rem;
      font-variant-numeric: tabular-nums;
    }
    .market-heartbeat-card .mhb-sessions-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem 0.5rem;
      margin-bottom: 0.2rem;
    }
    .market-heartbeat-card .mhb-sessions-title {
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.9;
    }
    .root-tag {
      display: inline-flex;
      align-items: center;
      padding: 0.12rem 0.35rem;
      border-radius: 0.3rem;
      border: 1px solid rgba(16, 185, 129, 0.4);
      background: rgba(15, 23, 42, 0.55);
      color: #50D2C1;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.58rem;
      font-weight: 900;
      letter-spacing: 0.03em;
      white-space: nowrap;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.35);
    }
    .gk-status-pill.sv-tip,
    .root-tag.sv-tip {
      border-bottom-style: solid;
    }
    .macro-radar-title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem 0.55rem;
      margin-bottom: 0.35rem;
    }
    .market-heartbeat-card .mhb-session-row {
      display: grid;
      grid-template-columns: minmax(9.5rem, 1fr) 5.1rem 4.2rem;
      gap: 0.35rem;
      align-items: center;
    }
    .market-heartbeat-card .mhb-session-name {
      opacity: 0.88;
      letter-spacing: 0.04em;
    }
    .market-heartbeat-card .mhb-session-clock {
      font-weight: 900;
      text-align: right;
    }
    .market-heartbeat-card .mhb-session-state {
      font-weight: 900;
      text-align: right;
      letter-spacing: 0.06em;
    }
    .market-heartbeat-card .mhb-session-state.is-open {
      color: #A0FFE0;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.45);
    }
    .market-heartbeat-card .mhb-session-state.is-closed {
      color: rgba(148, 163, 184, 0.95);
    }
    .market-heartbeat-card .mhb-root10 {
      margin-top: 0.25rem;
      padding: 0.2rem 0.4rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(251, 191, 36, 0.55);
      background: rgba(120, 53, 15, 0.55);
      color: #fde68a;
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.03em;
      line-height: 1.3;
      white-space: normal;
    }
    .market-heartbeat-card .mhb-root10.is-active {
      display: block;
    }
    .market-heartbeat-card.is-safe {
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(16, 185, 129, 0.35));
      border-color: rgba(52, 211, 153, 0.7);
      color: #ecfdf5;
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.28);
    }
    .market-heartbeat-card.is-elevated {
      background: linear-gradient(135deg, rgba(120, 53, 15, 0.95), rgba(245, 158, 11, 0.4));
      border-color: rgba(251, 191, 36, 0.75);
      color: #fffbeb;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.3);
    }
    .market-heartbeat-card.is-extreme {
      background: linear-gradient(135deg, rgba(127, 29, 29, 0.98), rgba(220, 38, 38, 0.55));
      border-color: rgba(248, 113, 113, 0.85);
      color: #fef2f2;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
      animation: heartbeat-pulse 1.1s ease-in-out infinite;
    }
    .market-heartbeat-card .countdown-lockdown,
    .market-heartbeat-card.settlement-active #hlCountdown {
      color: #fca5a5;
      font-weight: 900;
    }
    .market-heartbeat-bar {
      min-height: 35px;
      height: auto;
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.35rem 0.75rem;
      padding: 0.35rem 0.85rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      text-align: left;
      transition: background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s;
    }
    .market-heartbeat-bar .hb-cluster {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem 0.65rem;
    }
    .market-heartbeat-bar .hb-sep {
      opacity: 0.45;
    }
    .market-heartbeat-bar .hb-meta {
      opacity: 0.95;
      white-space: nowrap;
    }
    .market-heartbeat-bar.is-safe {
      background: linear-gradient(90deg, rgba(6, 78, 59, 0.95), rgba(16, 185, 129, 0.55));
      border-color: rgba(52, 211, 153, 0.7);
      color: #ecfdf5;
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);
    }
    .market-heartbeat-bar.is-elevated {
      background: linear-gradient(90deg, rgba(120, 53, 15, 0.95), rgba(245, 158, 11, 0.55));
      border-color: rgba(251, 191, 36, 0.75);
      color: #fffbeb;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.35);
    }
    .market-heartbeat-bar.is-extreme {
      background: linear-gradient(90deg, rgba(127, 29, 29, 0.98), rgba(220, 38, 38, 0.65));
      border-color: rgba(248, 113, 113, 0.85);
      color: #fef2f2;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.45);
      animation: heartbeat-pulse 1.1s ease-in-out infinite;
    }
    @keyframes heartbeat-pulse {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.18); }
    }
    .hot-token-spotlight {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      padding: 0.75rem 0.95rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(245, 158, 11, 0.6);
      background: linear-gradient(120deg, rgba(69, 26, 3, 0.92), rgba(120, 53, 15, 0.55) 48%, rgba(11, 18, 23, 0.95));
      box-shadow: 0 0 26px rgba(245, 158, 11, 0.28), inset 0 0 18px rgba(180, 83, 9, 0.18);
    }
    .hot-token-spotlight-main {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.65rem 1rem;
      min-width: 0;
    }
    .hot-token-badge {
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #fbbf24;
      text-shadow: 0 0 12px rgba(251, 191, 36, 0.45);
    }
    .hot-token-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.45rem 0.85rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 800;
      color: #fde68a;
    }
    .hot-token-meta .hot-chg { color: #fbbf24; }
    .hot-token-meta .hot-chg.is-neg { color: #fb923c; }
    .hot-token-meta .hot-fr { color: #fcd34d; }
    .hot-token-sparkline {
      width: 96px;
      height: 28px;
      flex-shrink: 0;
    }
    .quick-snipe-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.85rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(245, 158, 11, 0.7);
      background: linear-gradient(135deg, rgba(120, 53, 15, 0.95), rgba(245, 158, 11, 0.28));
      color: #fbbf24;
      font-size: 0.75rem;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.35);
    }
    .quick-snipe-btn:hover {
      background: linear-gradient(135deg, rgba(146, 64, 14, 0.98), rgba(251, 191, 36, 0.4));
      color: #fef3c7;
    }
    .step1-overhaul-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.65rem;
      margin-bottom: 0.75rem;
    }
    @media (min-width: 900px) {
      .step1-overhaul-grid {
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      }
    }
    .gatekeeper-defense-matrix,
    .best-hedge-radar {
      border-radius: 0.75rem;
      padding: 0.75rem 0.85rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.88);
      box-shadow: 0 0 14px rgba(80, 210, 193, 0.1);
      min-width: 0;
    }
    .best-hedge-radar {
      border: 2px solid rgba(245, 158, 11, 0.7);
      background: linear-gradient(to bottom, rgba(69, 26, 3, 0.4), #020617 45%, #020617);
      color: #e2e8f0;
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.25), inset 0 0 28px rgba(245, 158, 11, 0.04);
    }
    .best-hedge-radar,
    .best-hedge-radar .typo-context,
    .best-hedge-radar .typo-num,
    .best-hedge-radar .typo-action,
    .best-hedge-radar .best-hedge-title,
    .best-hedge-radar .live-vol-heat-meta,
    .best-hedge-radar .live-vol-heat-score {
      color: #e2e8f0 !important;
      text-shadow: none !important;
    }
    .dondon-ip-stage {
      position: relative;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-height: 14rem;
      background: #020617;
      border-bottom: 1px solid rgba(245, 158, 11, 0.22);
      isolation: isolate;
    }
    .dondon-ip-stage--header {
      flex: none;
      min-height: auto;
      overflow: visible;
      margin: 0;
      border: none;
      border-radius: 0;
    }
    .defense-hud-panel {
      margin: 0.5rem 0 0.65rem;
      overflow: hidden;
    }
    .defense-hud-panel .step1-condensed-log {
      width: 100%;
      margin-top: 0.1rem;
      border-bottom: none;
      border-top: 1px solid rgba(80, 210, 193, 0.18);
    }
    .dondon-ip-frame--compact {
      position: relative;
      width: 100%;
      max-height: 145px;
      min-height: 0;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin-top: 0.2rem;
      padding: 0.2rem 0 0;
      background: radial-gradient(ellipse at center, rgba(0, 255, 163, 0.06) 0%, transparent 72%);
    }
    .dondon-ip-frame--compact[data-dondon-state="GOD_MODE"] {
      background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.12) 0%, rgba(0, 255, 153, 0.06) 40%, transparent 75%);
    }
    .dondon-ip-frame--compact[data-dondon-state="HARD_LOCK"] {
      background: radial-gradient(ellipse at center, rgba(255, 0, 51, 0.14) 0%, transparent 70%);
    }
    .dondon-ip-frame--compact .dondon-ip-badge {
      top: 0.15rem;
    }
    .dondon-ip-frame--compact .dondon-ip-img {
      max-height: min(145px, 28vw);
      max-width: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      object-position: center center;
      transform: none;
      transition: filter 0.35s ease;
    }
    .dondon-ip-frame--compact .dondon-ip-img.dondon-state-normal,
    .dondon-ip-frame--compact .dondon-ip-img.dondon-state-levelup,
    .dondon-ip-frame--compact .dondon-ip-img.dondon-state-warning,
    .dondon-ip-frame--compact .dondon-ip-img.dondon-state-shield,
    .dondon-ip-frame--compact .dondon-ip-img.dondon-state-hardlock,
    .dondon-ip-frame--compact .dondon-ip-img.dondon-state-godmode,
    .dondon-ip-frame--compact .dondon-ip-img.dondon-state-orangetarget {
      --dondon-scale: 1;
      transform: none;
    }
    .step1-condensed-log {
      flex-shrink: 0;
      max-height: 2.35rem;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.28rem 0.55rem;
      background: rgba(0, 0, 0, 0.55);
      border-bottom: 1px solid rgba(80, 210, 193, 0.18);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.58rem;
      line-height: 1.35;
      color: #94a3b8;
      scrollbar-width: thin;
    }
    .step1-condensed-log-line { margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .step1-condensed-log-line.log-ok { color: #45C4B4; }
    .step1-condensed-log-line.log-warn { color: #fbbf24; }
    .step1-condensed-log-line.log-err { color: #f87171; }
    .dondon-ip-frame {
      position: relative;
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 11rem;
      overflow: hidden;
      background: radial-gradient(ellipse at center, rgba(0, 255, 163, 0.06) 0%, #020617 72%);
    }
    .dondon-ip-frame[data-dondon-state="GOD_MODE"] {
      background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.12) 0%, rgba(0, 255, 153, 0.06) 40%, #020617 75%);
    }
    .dondon-ip-frame[data-dondon-state="HARD_LOCK"] {
      background: radial-gradient(ellipse at center, rgba(255, 0, 51, 0.14) 0%, #020617 70%);
    }
    .dondon-ip-badge {
      position: absolute;
      top: 0.45rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      padding: 0.15rem 0.65rem;
      border-radius: 0.35rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.14em;
      color: #e2e8f0;
      background: rgba(2, 6, 23, 0.72);
      border: 1px solid rgba(80, 210, 193, 0.35);
      text-shadow: 0 0 10px var(--dondon-glow, #00FFA3);
      pointer-events: none;
    }
    .dondon-ip-img {
      display: block;
      width: auto;
      height: auto;
      max-width: 92%;
      max-height: 92%;
      object-fit: contain;
      object-position: center center;
      transform: scale(var(--dondon-scale, 1));
      transition: transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), filter 0.35s ease;
      filter: drop-shadow(0 0 16px var(--dondon-glow, #00FFA3));
      transform-origin: center center;
    }
    .dondon-state-normal { --dondon-scale: 1; --dondon-glow: #00FFA3; }
    .dondon-state-levelup { --dondon-scale: 1.2; --dondon-glow: #00F0FF; }
    .dondon-state-warning { --dondon-scale: 1.4; --dondon-glow: #FFD700; }
    .dondon-state-shield { --dondon-scale: 1.6; --dondon-glow: #00E676; }
    .dondon-state-hardlock { --dondon-scale: 2; --dondon-glow: #FF0033; animation: dondon-glitch-pulse 1.1s ease-in-out infinite; }
    .dondon-state-godmode {
      --dondon-scale: 2.5;
      --dondon-glow: #FFD700;
      filter: drop-shadow(0 0 22px #FFD700) drop-shadow(0 0 14px #00FF99);
    }
    .dondon-state-orangetarget { --dondon-scale: 1; --dondon-glow: #FF8C00; }
    @keyframes dondon-glitch-pulse {
      0%, 100% { filter: drop-shadow(0 0 22px #FF0033); }
      50% { filter: drop-shadow(0 0 34px #FF0033) drop-shadow(2px 0 0 #00FFFF) drop-shadow(-2px 0 0 #FF00FF); }
    }
    .best-hedge-eyes-banner,
    .best-hedge-eyes-img { display: none; }
    .best-hedge-header {
      flex-shrink: 0;
      padding: 0.55rem 0.95rem 0.5rem;
      border-bottom: 1px solid rgba(245, 158, 11, 0.28);
      background: linear-gradient(180deg, rgba(2, 6, 23, 0.98), rgba(15, 23, 42, 0.9));
      box-shadow: inset 0 1px 0 rgba(251, 191, 36, 0.08), inset 0 -1px 0 rgba(251, 191, 36, 0.1);
    }
    .best-hedge-body {
      padding: 0.85rem 0.95rem 1rem;
      min-width: 0;
    }
    .gk-matrix-title,
    .best-hedge-title {
      font-size: 0.78rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #A0FFE0;
      margin-bottom: 0.55rem;
    }
    .best-hedge-radar .best-hedge-title {
      margin: 0;
      color: #e2e8f0 !important;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: none !important;
    }
    .best-hedge-hero-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem 1rem;
      margin-bottom: 0.45rem;
    }
    .best-hedge-badges {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.35rem;
      flex-shrink: 0;
      max-width: min(52%, 14.5rem);
    }
    .best-hedge-auto-lock {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0.28rem 0.55rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(251, 191, 36, 0.75);
      background: rgba(120, 53, 15, 0.45);
      color: #fcd34d !important;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.03em;
      white-space: nowrap;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.35), inset 0 0 8px rgba(251, 191, 36, 0.12);
    }
    .best-pair-action-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
      padding: 0.28rem 0.55rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(139, 92, 246, 0.65);
      background: rgba(76, 29, 149, 0.35);
      color: #c4b5fd !important;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      cursor: help;
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.28);
    }
    .best-pair-action-tag.is-cashcat {
      border-color: rgba(56, 189, 248, 0.65);
      background: rgba(12, 74, 110, 0.45);
      color: #7dd3fc !important;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.28);
    }
    .best-pair-action-tag.is-reverse {
      border-color: rgba(167, 139, 250, 0.7);
      background: rgba(76, 29, 149, 0.4);
      color: #ddd6fe !important;
      box-shadow: 0 0 12px rgba(139, 92, 246, 0.35);
    }
    .best-pair-action-tag.is-empty {
      border-color: rgba(148, 163, 184, 0.4);
      background: rgba(15, 23, 42, 0.7);
      color: #94a3b8 !important;
      box-shadow: none;
      white-space: normal;
      text-align: right;
      line-height: 1.35;
      font-size: 0.65rem;
    }
    .pipeline-mode-btn.is-locked {
      opacity: 0.42;
      cursor: not-allowed;
      filter: grayscale(0.35);
    }
    .pipeline-mode-btn.is-locked:hover {
      color: #94a3b8;
      background: transparent;
    }
    .gk-heat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }
    .live-vol-heat-panel {
      margin-top: 0.75rem;
      padding-top: 0.7rem;
      border-top: 1px solid rgba(15, 23, 42, 0.18);
    }
    .best-hedge-radar .live-vol-heat-panel {
      border-top-color: rgba(245, 158, 11, 0.22);
    }
    .best-hedge-radar .live-vol-heat-score {
      color: #34d399 !important;
    }
    .live-vol-heat-panel .gk-heat-row {
      margin-bottom: 0.45rem;
    }
    .live-vol-heat-score {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 900;
      color: #50D2C1;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.35);
    }
    .live-vol-heat-meta {
      font-size: 0.65rem;
      color: #94a3b8;
      font-weight: 700;
    }
    .gk-heat-lamp {
      display: none; /* SAFE status lives in Step 1 top bar only */
    }
    .gk-heat-lamp.is-safe {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(52, 211, 153, 0.55);
      color: #7DFFD0;
    }
    .gk-heat-lamp.is-elevated {
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(251, 191, 36, 0.55);
      color: #fde68a;
    }
    .gk-heat-lamp.is-extreme {
      background: rgba(239, 68, 68, 0.22);
      border-color: rgba(248, 113, 113, 0.65);
      color: #fecaca;
    }
    .gk-telemetry-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem;
      margin-bottom: 0.55rem;
    }
    .best-hedge-radar .gk-telemetry-grid {
      margin-top: 0.65rem;
      margin-bottom: 0;
    }
    .gk-telemetry-chip {
      padding: 0.4rem 0.5rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: rgba(80, 210, 193, 0.06);
      box-shadow: 0 0 10px rgba(80, 210, 193, 0.12);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      color: #50D2C1;
    }
    .best-hedge-radar .gk-telemetry-chip {
      background: rgba(2, 6, 23, 0.92);
      border-color: rgba(245, 158, 11, 0.28);
      color: #fbbf24;
      box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.35);
    }
    .gk-telemetry-chip .label {
      display: block;
      color: #50D2C1;
      font-size: 0.62rem;
      margin-bottom: 0.15rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 800;
      opacity: 0.85;
    }
    .gk-telemetry-chip .value {
      color: #50D2C1;
      font-weight: 900;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.35);
    }
    .best-hedge-radar .gk-telemetry-chip .label,
    .best-hedge-radar .gk-telemetry-chip .value {
      color: #fbbf24 !important;
      text-shadow: none !important;
    }
    .gk-status-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .gk-status-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.28rem 0.45rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(52, 211, 153, 0.4);
      background: rgba(6, 78, 59, 0.35);
      color: #A0FFE0;
      font-size: 0.65rem;
      font-weight: 800;
      white-space: nowrap;
    }
    .gk-status-pill.is-fail {
      border-color: rgba(248, 113, 113, 0.55);
      background: rgba(127, 29, 29, 0.4);
      color: #fecaca;
    }
    .gk-macro-mini {
      margin-top: 0.55rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .best-hedge-symbol-row {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.55rem 1rem;
      margin: 0 0 0.65rem;
      min-width: 0;
      flex: 1 1 auto;
    }
    .best-hedge-token-pair {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      min-width: 0;
    }
    .best-hedge-token-icon {
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      border: 1px solid rgba(251, 191, 36, 0.45);
      background: radial-gradient(circle at 30% 30%, #fde68a, #b45309 62%, #1e293b);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.35);
      flex-shrink: 0;
    }
    #bestPairSymbol {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: #ffffff !important;
      text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
      background: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
      line-height: 1.15;
    }
    #bestPairYield {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 1.05rem;
      font-weight: 900;
      color: #34d399 !important;
      text-shadow: 0 0 14px rgba(52, 211, 153, 0.45);
    }
    .best-hedge-returns {
      margin: 0.65rem 0 0.85rem;
      background: rgba(15, 23, 42, 0.78);
      border: 1px solid rgba(245, 158, 11, 0.28);
      border-radius: 0.65rem;
      padding: 0.75rem 0.85rem;
      box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .best-hedge-returns-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
    }
    .best-hedge-returns-value {
      font-size: 1.15rem;
      font-weight: 900;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: #34d399;
      text-shadow: 0 0 10px rgba(52, 211, 153, 0.35);
      filter: none;
    }
    .lock-best-hedge-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.65rem;
      border: 1px solid #fbbf24;
      background: rgba(245, 158, 11, 0.2);
      color: #fcd34d;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
      transition: all 0.15s ease;
    }
    .lock-best-hedge-btn:hover {
      background: rgba(245, 158, 11, 0.3);
      border-color: #fbbf24;
      color: #fde68a;
      box-shadow: 0 0 22px rgba(245, 158, 11, 0.45);
    }
    .best-hedge-lock-hint {
      margin-top: 0.45rem;
      font-size: 0.68rem;
      font-weight: 700;
      color: #94a3b8 !important;
      line-height: 1.4;
    }
    .lock-best-hedge-btn:active {
      transform: scale(0.95);
    }
    .lock-best-hedge-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
    .lock-shield-icon,
    .matrix-inject-icon,
    .brand-shield-icon {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      object-fit: contain;
      flex-shrink: 0;
      vertical-align: -0.15em;
      filter: drop-shadow(0 0 6px rgba(80, 210, 193, 0.55));
    }
    .lock-shield-icon,
    .matrix-inject-icon,
    .brand-shield-icon-md {
      width: 1.25rem;
      height: 1.25rem;
    }
    .brand-shield-icon-lg {
      width: 1.5rem;
      height: 1.5rem;
      vertical-align: -0.25em;
    }
    .brand-shield-icon-xl {
      width: 2.5rem;
      height: 2.5rem;
      display: block;
      margin: 0 auto 1rem;
      filter: drop-shadow(0 0 12px rgba(80, 210, 193, 0.65));
    }
    .section-header .brand-shield-icon,
    .section-header .brand-shield-icon-md,
    .gk-matrix-title .brand-shield-icon,
    .sop-guide-step h3 .brand-shield-icon,
    .sop-guide-step li .brand-shield-icon {
      margin-right: 0.2rem;
    }
    .inline-flex-shield {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .soil-circuit-shield-icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      object-fit: contain;
      flex-shrink: 0;
      filter: drop-shadow(0 0 4px rgba(80, 210, 193, 0.45));
    }
    #marketSessionsBox { display: none !important; }
    .aquarium-deprecated { display: none !important; }
    .header-actions-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: nowrap;
      justify-content: flex-end;
      position: relative;
      flex-shrink: 0;
    }
    .header-menu-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: rgba(0, 0, 0, 0.4);
      color: #A0FFE0;
      font-size: 0.75rem;
      font-weight: 800;
      cursor: pointer;
    }
    .header-menu-toggle:hover {
      background: rgba(80, 210, 193, 0.12);
    }
    /* Universal: secondary actions always live inside ☰ MENU (all breakpoints) */
    .header-secondary-actions {
      display: none;
      position: absolute;
      top: calc(100% + 0.4rem);
      right: 0;
      z-index: 60;
      width: min(22rem, calc(100vw - 1.5rem));
      flex-direction: column;
      align-items: stretch;
      gap: 0.45rem;
      padding: 0.75rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      background: linear-gradient(160deg, rgba(8, 24, 18, 0.98), rgba(6, 14, 12, 0.98));
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
    }
    .header-secondary-actions.is-open {
      display: flex;
    }
    .header-secondary-actions > * {
      width: 100%;
      justify-content: center;
    }
    .live-ops-panel {
      border-radius: 0.85rem;
      border: 1px solid rgba(80, 210, 193, 0.3);
      background: rgba(6, 20, 13, 0.78);
      padding: 0.75rem 1rem;
      margin-top: 0.5rem;
    }
    .live-ops-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    @media (min-width: 900px) {
      .live-ops-grid {
        grid-template-columns: 1.15fr 0.85fr;
      }
    }
    .live-ops-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.72rem;
    }
    .live-ops-table th,
    .live-ops-table td {
      padding: 0.4rem 0.35rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      text-align: left;
    }
    .live-ops-table th { color: #94a3b8; font-weight: 800; }
    .exec-log-stream {
      max-height: 11rem;
      overflow-y: auto;
      font-size: 0.68rem;
      font-family: 'JetBrains Mono', monospace;
      color: #cbd5e1;
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 0.5rem;
      padding: 0.5rem 0.6rem;
    }
    .exec-log-stream .log-line { margin: 0.2rem 0; }
    .exec-log-stream .log-warn { color: #fbbf24; }
    .exec-log-stream .log-ok { color: #45C4B4; }
    .exec-log-stream .log-err { color: #f87171; }
    .demo-hub-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
      padding: 0.25rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.4);
      background: rgba(0, 0, 0, 0.4);
    }
    .demo-hub-tab {
      padding: 0.55rem 0.65rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      background: transparent;
      color: #94a3b8;
      font-size: calc((0.72rem + 2px) * 1.15);
      font-weight: 900;
      cursor: pointer;
      text-align: center;
      transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
    }
    .demo-hub-tab.is-active {
      background: rgba(80, 210, 193, 0.22);
      color: #ecfdf5;
      border-color: #50D2C1;
      box-shadow: 0 0 12px rgba(80, 210, 193, 0.25);
    }
    .demo-hub-pane.hidden { display: none; }
    .demo-hub-tab-content {
      max-height: 65vh;
      overflow-y: auto;
      padding-right: 0.35rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(16, 185, 129, 0.3) rgb(15, 23, 42);
    }
    .demo-hub-tab-content::-webkit-scrollbar {
      width: 6px;
    }
    .demo-hub-tab-content::-webkit-scrollbar-track {
      background: rgb(15, 23, 42);
      border-radius: 3px;
    }
    .demo-hub-tab-content::-webkit-scrollbar-thumb {
      background: rgba(16, 185, 129, 0.3);
      border-radius: 3px;
    }
    .demo-hub-tab-content::-webkit-scrollbar-thumb:hover {
      background: rgba(16, 185, 129, 0.5);
    }
    .root-telemetry-grid {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .root-telemetry-tier {
      flex-shrink: 0;
      height: auto;
      border-radius: 0.65rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.38);
      overflow: visible;
    }
    .root-telemetry-tier.is-emerald {
      border-color: rgba(52, 211, 153, 0.4);
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.1);
    }
    .root-telemetry-tier.is-amber {
      border-color: rgba(251, 191, 36, 0.4);
      box-shadow: 0 0 14px rgba(245, 158, 11, 0.1);
    }
    .root-telemetry-tier.is-violet {
      border-color: rgba(167, 139, 250, 0.4);
      box-shadow: 0 0 14px rgba(139, 92, 246, 0.12);
    }
    .root-telemetry-tier.is-cyan {
      border-color: rgba(34, 211, 238, 0.42);
      box-shadow: 0 0 14px rgba(6, 182, 212, 0.12);
      background: rgba(8, 51, 68, 0.35);
    }
    .root-telemetry-tier.is-indigo {
      border-color: rgba(129, 140, 248, 0.42);
      box-shadow: 0 0 14px rgba(99, 102, 241, 0.14);
      background: rgba(30, 27, 75, 0.38);
    }
    .root-telemetry-tier.is-crimson {
      border-color: rgba(248, 113, 113, 0.42);
      box-shadow: 0 0 14px rgba(220, 38, 38, 0.14);
      background: rgba(69, 10, 10, 0.38);
    }
    .root-telemetry-tier.is-cyan .root-telemetry-tier-badge {
      background: rgba(8, 51, 68, 0.55);
      border: 1px solid rgba(34, 211, 238, 0.55);
      color: #67e8f9;
    }
    .root-telemetry-tier.is-indigo .root-telemetry-tier-badge {
      background: rgba(49, 46, 129, 0.55);
      border: 1px solid rgba(129, 140, 248, 0.55);
      color: #c7d2fe;
    }
    .root-telemetry-tier.is-crimson .root-telemetry-tier-badge {
      background: rgba(127, 29, 29, 0.55);
      border: 1px solid rgba(248, 113, 113, 0.55);
      color: #fecaca;
    }
    .root-telemetry-row.is-tier1 {
      background: rgba(76, 5, 25, 0.5);
      border: 1px solid rgba(244, 63, 94, 0.4);
    }
    .root-telemetry-row.is-tier2 {
      background: rgba(69, 26, 3, 0.4);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .root-telemetry-row.is-tier3 {
      background: rgba(66, 32, 6, 0.3);
      border: 1px solid rgba(234, 179, 8, 0.2);
    }
    .root-telemetry-row.is-tier4 {
      background: rgba(8, 51, 68, 0.3);
      border: 1px solid rgba(6, 182, 212, 0.2);
    }
    .root-telemetry-row.is-tripped {
      background: rgba(127, 29, 29, 0.8) !important;
      animation: heartbeat-pulse 1s ease-in-out infinite;
      box-shadow: inset 0 0 0 1px rgba(248, 113, 113, 0.55);
    }
    .risk-index-hud {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      margin: 0.5rem 0 0;
      padding: 0.65rem 0.85rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.25);
      background: rgba(6, 32, 27, 0.75);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      text-align: center;
    }
    .risk-index-hud.is-nominal { border-color: rgba(52, 211, 153, 0.45); }
    .risk-index-hud.is-optimal { border-color: rgba(52, 211, 153, 0.55); }
    .risk-index-hud.is-elevated { border-color: rgba(251, 191, 36, 0.55); }
    .risk-index-hud.is-critical { border-color: rgba(248, 113, 113, 0.55); }
    .risk-index-hud.is-toxicity-elevated { border-color: rgba(192, 132, 252, 0.55); }
    .risk-index-hud.is-toxic-mode {
      border-color: rgba(34, 211, 238, 0.75);
      box-shadow: 0 0 24px rgba(34, 211, 238, 0.35);
      animation: heartbeat-pulse 1.2s ease-in-out infinite;
    }
    .risk-index-score {
      font-size: 1.05rem;
      font-weight: 900;
      letter-spacing: 0.06em;
    }
    .risk-index-badge {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    .risk-index-score.sv-tip,
    .risk-index-badge.sv-tip {
      cursor: help;
      border-bottom: 1px dotted rgba(80, 210, 193, 0.45);
    }
    .risk-index-bar-track {
      width: min(100%, 22rem);
      margin-top: 0.15rem;
    }
    .taiji-bagua-overlay {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: min(100%, 26rem);
      margin-bottom: 0.15rem;
    }
    .taiji-mode-badge,
    .bagua-gate-badge {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      cursor: help;
      white-space: nowrap;
    }
    .taiji-mode-yang {
      color: #fde68a;
      background: rgba(120, 53, 15, 0.55);
      border-color: rgba(251, 191, 36, 0.65);
      box-shadow: 0 0 14px rgba(251, 191, 36, 0.45), inset 0 0 8px rgba(251, 191, 36, 0.15);
    }
    .taiji-mode-yin {
      color: #c7d2fe;
      background: rgba(30, 27, 75, 0.65);
      border-color: rgba(129, 140, 248, 0.55);
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.25);
    }
    .bagua-gate-qian { color: #fde68a; border-color: rgba(251, 191, 36, 0.5); background: rgba(69, 26, 3, 0.45); }
    .bagua-gate-kun { color: #a5b4fc; border-color: rgba(129, 140, 248, 0.45); background: rgba(30, 27, 75, 0.45); }
    .bagua-gate-zhen { color: #fdba74; border-color: rgba(251, 146, 60, 0.55); background: rgba(124, 45, 18, 0.45); }
    .bagua-gate-xun { color: #fcd34d; border-color: rgba(234, 179, 8, 0.5); background: rgba(66, 32, 6, 0.45); }
    .bagua-gate-kan { color: #67e8f9; border-color: rgba(34, 211, 238, 0.45); background: rgba(8, 51, 68, 0.55); }
    .bagua-gate-li { color: #86efac; border-color: rgba(52, 211, 153, 0.45); background: rgba(6, 44, 28, 0.45); }
    .bagua-gate-gen { color: #5eead4; border-color: rgba(45, 212, 191, 0.45); background: rgba(4, 47, 46, 0.5); }
    .bagua-gate-dui {
      color: #fca5a5;
      border-color: rgba(248, 113, 113, 0.75);
      background: rgba(69, 10, 10, 0.65);
      animation: heartbeat-pulse 0.85s ease-in-out infinite;
      box-shadow: 0 0 16px rgba(248, 113, 113, 0.55);
    }
    .text-emerald-400 { color: #34d399; }
    .text-purple-400 { color: #c084fc; }
    .text-cyan-400 { color: #22d3ee; }
    .animate-pulse { animation: heartbeat-pulse 1.2s ease-in-out infinite; }
    .dondon-avatar-toxic {
      filter: hue-rotate(160deg) saturate(1.35) brightness(1.05);
      box-shadow: 0 0 28px rgba(34, 211, 238, 0.45);
    }
    .demo-cri-control-block {
      margin-bottom: 0.85rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px solid rgba(251, 191, 36, 0.45);
      background: rgba(69, 26, 3, 0.28);
    }
    .demo-cri-preset-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem;
      margin-top: 0.45rem;
    }
    .demo-cri-preset-btn {
      padding: 0.4rem 0.45rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.75);
      color: #a7f3d0;
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      cursor: pointer;
      text-align: center;
    }
    .demo-cri-preset-btn:hover { background: rgba(80, 210, 193, 0.15); border-color: rgba(80, 210, 193, 0.65); }
    .demo-cri-preset-btn.is-toxic { border-color: rgba(248, 113, 113, 0.55); color: #fecaca; }
    .demo-cri-preset-btn.is-god { border-color: rgba(251, 191, 36, 0.65); color: #fde68a; }
    .demo-cri-reset-btn {
      display: block;
      width: 100%;
      margin-top: 0.45rem;
      padding: 0.45rem 0.55rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(34, 211, 238, 0.55);
      background: rgba(8, 47, 73, 0.55);
      color: #a5f3fc;
      font-size: 0.62rem;
      font-weight: 800;
      cursor: pointer;
    }
    .demo-cri-reset-btn:hover { background: rgba(14, 116, 144, 0.45); }
    .sniper-rail.soil-stress-shake {
      animation: soil-stress-shake 0.5s ease-in-out;
    }
    @keyframes soil-stress-shake {
      0%, 100% { transform: translate(0, 0); }
      12% { transform: translate(-2px, 1px); }
      24% { transform: translate(2px, -1px); }
      36% { transform: translate(-2px, -1px); }
      48% { transform: translate(2px, 1px); }
      60% { transform: translate(-1px, 0); }
      72% { transform: translate(1px, 0); }
    }
    .toxic-mode-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(2, 8, 23, 0.92);
      padding: 1.5rem;
    }
    .toxic-mode-backdrop.hidden { display: none; }
    .toxic-mode-modal {
      max-width: 36rem;
      width: 100%;
      border: 2px solid rgba(34, 211, 238, 0.65);
      border-radius: 1rem;
      background: rgba(8, 47, 73, 0.95);
      padding: 1.5rem;
      text-align: center;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: #a5f3fc;
      box-shadow: 0 0 40px rgba(34, 211, 238, 0.35);
    }
    .toxic-mode-modal h2 {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: 0.06em;
      color: #67e8f9;
    }
    .demo-role-block {
      margin-bottom: 0.85rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.65);
    }
    .demo-role-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.45rem;
    }
    .demo-role-btn {
      flex: 1 1 auto;
      min-width: 7rem;
      padding: 0.35rem 0.5rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(0,0,0,0.35);
      color: #e5e7eb;
      font-size: 0.68rem;
      font-weight: 800;
      cursor: pointer;
    }
    .demo-role-btn.is-active { border-color: rgba(80, 210, 193, 0.75); color: #6ee7b7; }
    .demo-role-btn.role-auditor.is-active { border-color: rgba(34, 211, 238, 0.75); color: #67e8f9; }
    .demo-role-btn.role-risk.is-active { border-color: rgba(251, 191, 36, 0.75); color: #fcd34d; }
    .demo-fault-panel {
      margin-top: 0.75rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px dashed rgba(251, 191, 36, 0.45);
      background: rgba(69, 26, 3, 0.35);
    }
    .demo-fault-panel.hidden { display: none; }
    .demo-fault-btn {
      display: block;
      width: 100%;
      margin-top: 0.35rem;
      padding: 0.45rem 0.55rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(248, 113, 113, 0.45);
      background: rgba(127, 29, 29, 0.45);
      color: #fecaca;
      font-size: 0.68rem;
      font-weight: 800;
      cursor: pointer;
    }
    body.role-auditor .attack-btn,
    body.role-auditor #attackExecuteBtn,
    body.role-auditor #attackExecuteZone input,
    body.role-auditor #masterRiskConsole input:not([readonly]),
    body.role-auditor #masterRiskConsole select,
    body.role-auditor #masterRiskConsole textarea,
    body.role-auditor #capitalInput,
    body.role-auditor #frictionInput {
      pointer-events: none;
      opacity: 0.55;
    }
    body.role-auditor #demoHubBackdrop input,
    body.role-auditor #demoHubBackdrop button,
    body.role-auditor #demoHubBackdrop select {
      pointer-events: auto;
      opacity: 1;
    }
    body.role-trader .demo-hub-risk-inject button,
    body.role-trader .demo-hub-risk-inject input,
    body.role-trader .demo-hub-risk-inject select,
    body.role-trader .demo-cri-preset-btn,
    body.role-trader .demo-cri-reset-btn,
    body.role-trader .demo-root-toggle-btn,
    body.role-trader .demo-hub-row button,
    body.role-trader #hubDefcon1ToggleBtn,
    body.role-trader .demo-hub-tx-btn:not(.demo-role-btn),
    body.role-trader .demo-xp-block button,
    body.role-trader .demo-xp-block input {
      pointer-events: none;
      opacity: 0.55;
    }
    body.role-auditor .demo-hub-risk-inject button,
    body.role-auditor .demo-hub-risk-inject input,
    body.role-auditor .demo-hub-risk-inject select,
    body.role-auditor .demo-cri-preset-btn,
    body.role-auditor .demo-cri-reset-btn,
    body.role-auditor .demo-root-toggle-btn,
    body.role-auditor .demo-hub-row button,
    body.role-auditor #hubDefcon1ToggleBtn,
    body.role-auditor .demo-hub-tx-btn:not(.demo-role-btn),
    body.role-auditor .demo-xp-block button,
    body.role-auditor .demo-xp-block input {
      pointer-events: none;
      opacity: 0.55;
    }
    body.role-auditor #demoHubTabTelemetry {
      pointer-events: auto;
      opacity: 1;
    }
    body:not(.role-auditor):not(.role-risk-manager) #demoHubTabTelemetry {
      opacity: 0.45;
    }
    body.role-auditor #demoHubTabTelemetry,
    body.role-risk-manager #demoHubTabTelemetry {
      opacity: 1;
    }
    body.role-trader { --role-accent: #34d399; }
    body.role-auditor { --role-accent: #22d3ee; }
    body.role-risk-manager { --role-accent: #fbbf24; }
    .demo-root-toggle-btn.is-warn {
      border-color: rgba(251, 191, 36, 0.75);
      color: #fcd34d;
      background: rgba(69, 26, 3, 0.45);
    }
    @keyframes hud-growth-pulse {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.25); }
    }
    .status-hud-emoji { font-size: 1.1rem; line-height: 1; }
    .status-hud-subtitle {
      font-size: 0.62rem;
      font-weight: 600;
      opacity: 0.85;
      letter-spacing: 0.06em;
    }
    .demo-cri-bar {
      margin-bottom: 0.85rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.65);
    }
    .demo-cri-bar-track {
      height: 0.45rem;
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.85);
      overflow: hidden;
      margin-top: 0.35rem;
    }
    .demo-cri-bar-fill {
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, #34d399, #fbbf24, #f87171);
      transition: width 0.25s ease;
    }
    .demo-xp-block { margin-bottom: 0.85rem; }
    .demo-xp-row { display: flex; gap: 0.45rem; flex-wrap: wrap; align-items: center; margin-top: 0.35rem; }
    .demo-xp-input {
      width: 5rem;
      padding: 0.25rem 0.45rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(0,0,0,0.35);
      color: #50D2C1;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .demo-root-toggle-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
      gap: 0.35rem;
      margin-top: 0.45rem;
    }
    .demo-root-toggle-btn {
      padding: 0.3rem 0.25rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(0,0,0,0.35);
      color: #94a3b8;
      font-size: 0.62rem;
      font-weight: 900;
      cursor: pointer;
    }
    .demo-root-toggle-btn.is-tripped {
      border-color: rgba(248, 113, 113, 0.65);
      background: rgba(127, 29, 29, 0.45);
      color: #fecaca;
    }
    .root-telemetry-status.TRIPPED { color: #f87171; }
    .root-telemetry-tier-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.45rem 0.65rem;
      padding: 0.55rem 0.7rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.55);
    }
    .root-telemetry-tier-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.15rem 0.45rem;
      border-radius: 0.3rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.62rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .root-telemetry-tier.is-emerald .root-telemetry-tier-badge {
      background: rgba(6, 78, 59, 0.55);
      border: 1px solid rgba(52, 211, 153, 0.55);
      color: #6ee7b7;
    }
    .root-telemetry-tier.is-amber .root-telemetry-tier-badge {
      background: rgba(120, 53, 15, 0.55);
      border: 1px solid rgba(251, 191, 36, 0.55);
      color: #fcd34d;
    }
    .root-telemetry-tier.is-violet .root-telemetry-tier-badge {
      background: rgba(76, 29, 149, 0.5);
      border: 1px solid rgba(167, 139, 250, 0.55);
      color: #ddd6fe;
    }
    .root-telemetry-tier.is-sky .root-telemetry-tier-badge {
      background: rgba(12, 74, 110, 0.55);
      border: 1px solid rgba(56, 189, 248, 0.55);
      color: #7dd3fc;
    }
    .root-telemetry-tier-title {
      flex: 1 1 auto;
      min-width: 0;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: calc(0.62rem * 1.15);
      font-weight: 800;
      letter-spacing: 0.03em;
      color: #e2e8f0;
      line-height: 1.35;
    }
    .root-telemetry-tier-focus {
      width: 100%;
      font-size: calc(0.58rem * 1.15);
      font-weight: 600;
      color: #94a3b8;
      line-height: 1.35;
    }
    .root-telemetry-tier-body {
      display: flex;
      flex-direction: column;
      gap: 0.28rem;
      padding: 0.45rem 0.5rem 0.55rem;
      height: auto;
      overflow: visible;
    }
    .root-telemetry-row {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.4rem 0.55rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(0,0,0,0.28);
      font-size: calc(0.68rem * 1.15);
      cursor: help;
    }
    .root-telemetry-status {
      font-weight: 900;
      color: #7DFFD0;
      white-space: nowrap;
    }
    .root-telemetry-status.ENGAGED { color: #fca5a5; }
    .root-telemetry-status.ACTIVE { color: #7DFFD0; }
    .root-telemetry-status.READY { color: #50D2C1; }
    .root-telemetry-status.STANDBY { color: #94a3b8; }
    .root-telemetry-status.FAIL { color: #f87171; }
    .quick-close-btn {
      padding: 0.2rem 0.45rem;
      border-radius: 0.35rem;
      border: 1px solid rgba(248, 113, 113, 0.45);
      background: rgba(127, 29, 29, 0.35);
      color: #fecaca;
      font-size: 0.65rem;
      font-weight: 900;
      cursor: pointer;
    }
    .post-trade-review-toast {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 95;
      padding: 0.75rem 1.1rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.5);
      background: rgba(6, 20, 13, 0.95);
      color: #A0FFE0;
      font-weight: 900;
      font-size: 0.8rem;
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.3);
    }
    .funding-world-tree-bar {
      border: 2px solid #50D2C1;
      background: linear-gradient(135deg, rgba(80, 210, 193, 0.16), rgba(11, 18, 23, 0.92));
      box-shadow: 0 0 24px rgba(80, 210, 193, 0.25);
    }
    .funding-world-tree-bar.funding-extreme-demo {
      animation: pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      box-shadow: 0 0 32px rgba(255, 80, 80, 0.45);
      border-color: #fb923c;
    }
    .funding-tag {
      display: inline-flex;
      align-items: center;
      font-size: 0.62rem;
      font-weight: 900;
      padding: 0.15rem 0.4rem;
      border-radius: 0.3rem;
      border: 1px solid;
      white-space: nowrap;
    }
    .funding-tag-bleed {
      color: #fecaca;
      border-color: rgba(248, 113, 113, 0.55);
      background: rgba(127, 29, 29, 0.35);
    }
    .funding-tag-short {
      color: #fdba74;
      border-color: rgba(251, 146, 60, 0.55);
      background: rgba(154, 52, 18, 0.3);
    }
    .funding-tag-arb {
      color: #fde68a;
      border-color: rgba(251, 191, 36, 0.5);
      background: rgba(120, 53, 15, 0.35);
    }
    .funding-tag-ok {
      color: #7DFFD0;
      border-color: rgba(80, 210, 193, 0.45);
      background: rgba(80, 210, 193, 0.1);
    }
    .risk-guide-popover {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      z-index: 50;
      width: min(360px, 90vw);
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: #0b1217;
      color: #e8fff0;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
      font-size: 0.75rem;
      line-height: 1.45;
    }
    .demo-hub-backdrop {
      position: fixed;
      inset: 0;
      z-index: 85;
      background: rgba(0, 0, 0, 0.72);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .demo-hub-drawer-backdrop {
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      align-items: stretch;
      justify-content: flex-end;
      padding: 0;
    }
    .demo-hub-backdrop.hidden,
    .wallet-modal-backdrop.hidden {
      display: none !important;
      pointer-events: none !important;
      visibility: hidden;
    }
    .demo-hub-modal {
      width: min(680px, 100%);
      border-radius: 1.1rem;
      border: 2px solid rgba(80, 210, 193, 0.55);
      background: linear-gradient(160deg, #0A1F1A, #051311);
      padding: 0;
      overflow: hidden;
      box-shadow: 0 0 48px rgba(80, 210, 193, 0.35), 0 0 0 1px rgba(80, 210, 193, 0.15);
      font-size: calc((0.8rem + 2px) * 1.15);
    }
    .demo-hub-drawer {
      width: 100%;
      max-width: 400px;
      height: 100%;
      max-height: 100vh;
      border-radius: 0;
      border: none;
      border-left: 2px solid rgba(80, 210, 193, 0.55);
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .demo-hub-drawer .demo-hub-modal-header {
      flex-shrink: 0;
      height: 6.5rem;
      border-radius: 0;
    }
    .demo-hub-drawer .demo-hub-modal-body {
      flex: 1 1 auto;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .demo-hub-modal-header {
      position: relative;
      height: 9.5rem;
      background-image: url('/brand/dondon-eyes.webp');
      background-size: cover;
      background-position: center;
      border-radius: 1.05rem 1.05rem 0 0;
      overflow: hidden;
    }
    .demo-hub-modal-body {
      padding: 1.15rem 1.35rem 1.35rem;
    }
    .demo-hub-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 0.85rem;
      margin-bottom: 0.45rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.22);
      background: rgba(0, 0, 0, 0.32);
      font-size: calc((0.8rem + 2px) * 1.15);
      font-weight: 800;
      color: #e8fff0;
    }
    .demo-hub-row:last-child { border-bottom: none; margin-bottom: 0; }
    .demo-hub-tx-block {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.55rem;
      padding: 0.75rem 0.85rem;
      margin-bottom: 0.45rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(251, 191, 36, 0.35);
      background: rgba(69, 26, 3, 0.28);
      font-size: calc((0.8rem + 2px) * 1.15);
      font-weight: 800;
      color: #fde68a;
    }
    .demo-hub-tx-label {
      color: #fbbf24;
      font-weight: 900;
      letter-spacing: 0.02em;
    }
    .demo-hub-tx-options {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.35rem;
    }
    .demo-hub-tx-btn {
      width: 100%;
      text-align: left;
      padding: 0.45rem 0.65rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: rgba(2, 6, 23, 0.55);
      color: #cbd5e1;
      font-size: calc((0.68rem + 2px) * 1.15);
      font-weight: 800;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;
    }
    .demo-hub-tx-btn:hover {
      border-color: rgba(251, 191, 36, 0.55);
      color: #fde68a;
    }
    .demo-hub-tx-btn.is-active {
      border-color: rgba(251, 191, 36, 0.85);
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
    }
    .demo-hub-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.25rem;
      margin-bottom: 0.85rem;
      padding: 0.3rem;
      border-radius: 0.7rem;
      border: 1px solid rgba(80, 210, 193, 0.45);
      background: rgba(0, 0, 0, 0.45);
    }
    .demo-hub-tab {
      padding: 0.6rem 0.75rem;
      border-radius: 0.55rem;
      border: 1px solid transparent;
      background: transparent;
      color: #94a3b8;
      font-size: calc((0.72rem + 2px) * 1.15);
      font-weight: 900;
      cursor: pointer;
      text-align: center;
      transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
    }
    .demo-hub-tab.is-active {
      background: rgba(80, 210, 193, 0.22);
      color: #ecfdf5;
      border-color: #50D2C1;
      box-shadow: 0 0 14px rgba(80, 210, 193, 0.3);
    }
    .root-telemetry-row {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.5rem 0.65rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(0,0,0,0.28);
      font-size: calc((0.72rem + 2px) * 1.15);
    }
    .tradfi-asset-chip.token-selected,
    .world-tree-capsule.token-selected {
      box-shadow: 0 0 0 2px #50D2C1, 0 0 14px rgba(80, 210, 193, 0.45);
    }
    .attack-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.75rem 1.35rem;
      border-radius: 0.65rem;
      font-weight: 900;
      font-size: 0.95rem;
      background: #50D2C1;
      color: #0b1217;
      border: 2px solid rgba(11, 18, 23, 0.35);
      transition: all 0.2s ease;
      box-shadow: 0 0 15px rgba(80, 210, 193, 0.4);
    }
    .attack-btn-xl {
      padding: 0.9rem 1.6rem;
      font-size: 1.05rem;
      min-height: 3.25rem;
    }
    .attack-btn:hover:not(:disabled) {
      filter: brightness(1.05);
      box-shadow: 0 0 22px rgba(80, 210, 193, 0.6);
    }
    .attack-btn:disabled,
    .attack-btn.attack-locked {
      opacity: 1;
      cursor: not-allowed;
      background: #4b5563;
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.55);
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.35);
      filter: none;
    }
    .attack-btn:disabled .attack-btn-dondon,
    .attack-btn.attack-locked .attack-btn-dondon {
      filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.8));
    }
    .attack-btn:not(:disabled):not(.attack-locked) .attack-btn-dondon {
      filter: drop-shadow(0 0 6px rgba(80, 210, 193, 0.6));
    }
    .matrix-inject-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.625rem 1rem;
      border-radius: 0.45rem;
      border: 1px solid rgba(80, 210, 193, 0.65);
      background: rgba(80, 210, 193, 0.12);
      color: #50D2C1;
      font-size: 0.875rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      cursor: pointer;
      white-space: nowrap;
      text-shadow: 0 0 10px rgba(80, 210, 193, 0.45);
      box-shadow: 0 0 12px rgba(80, 210, 193, 0.18);
      transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.12s ease;
    }
    .matrix-inject-btn:hover {
      background: rgba(80, 210, 193, 0.22);
      border-color: rgba(80, 210, 193, 0.9);
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.4);
      color: #A0FFE0;
    }
    .matrix-inject-btn:active {
      transform: scale(0.95);
    }
    .pin-btn {
      cursor: pointer;
      user-select: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      line-height: 1;
      color: #9ca3af;
      background: transparent;
      border: 0;
      padding: 0;
      transform: scale(0.7);
      transition: transform 0.15s, filter 0.15s, color 0.15s;
    }
    .pin-btn:hover { transform: scale(0.78); color: #facc15; }
    .pin-btn.pinned {
      color: #facc15;
      filter: drop-shadow(0 0 6px #facc15);
    }
    .pin-btn.pin-locked { opacity: 0.35; cursor: not-allowed; }
    .row-pinned {
      background: linear-gradient(90deg, rgba(80,210,193,0.08), transparent 40%);
      box-shadow: inset 3px 0 0 #50D2C1;
    }
    @keyframes cat-spin {
      0% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 4px #50D2C1); }
      50% { transform: rotate(180deg) scale(1.06); filter: drop-shadow(0 0 14px #50D2C1); }
      100% { transform: rotate(360deg) scale(1); filter: drop-shadow(0 0 4px #50D2C1); }
    }
    .cat-spinner {
      animation: cat-spin 1.1s linear infinite;
      width: 28px; height: 28px; border-radius: 9999px;
    }
    #forceRefreshOverlay {
      display: none;
      position: fixed; inset: 0; z-index: 80;
      background: rgba(6,20,13,0.72);
      backdrop-filter: blur(3px);
      align-items: center; justify-content: center;
      flex-direction: column; gap: 0.75rem;
    }
    #forceRefreshOverlay.active { display: flex; }

    #app {
      min-height: calc(100vh - 2rem);
      color: var(--text-dark-theme);
    }
    #app[data-mounted="true"] { opacity: 1; }
    .app-boot-banner {
      margin: 0 0 0.75rem;
      padding: 0.55rem 0.85rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(10, 26, 23, 0.92);
      color: #a0ffe0;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .app-boot-banner.is-error {
      border-color: rgba(248, 113, 113, 0.45);
      color: #fecaca;
    }
    .app-boot-banner.hidden { display: none; }
    body.dashboard-booting #app { visibility: visible; opacity: 1; }

    /* === v2.0 Split-Screen Layout (70/30) + Typography === */
    body.terminal-body {
      padding: 1rem 1.25rem 0;
      padding-bottom: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .typo-title {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-shadow: 0 0 8px rgba(80, 210, 193, 0.35);
    }
    @media (min-width: 1024px) {
      .typo-title { font-size: 1.125rem; }
    }
    .typo-context {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 0.75rem;
      font-weight: 500;
    }
    @media (min-width: 1024px) {
      .typo-context { font-size: 0.875rem; }
    }
    .typo-context.mono,
    .typo-num {
      font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
      font-variant-numeric: tabular-nums;
    }
    .typo-action {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .terminal-header {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }
    .terminal-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: nowrap;
    }
    .global-status-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: stretch;
      gap: 0.5rem;
      width: 100%;
    }
    .global-status-bar .market-heartbeat-bar {
      flex: 1 1 100%;
    }
    .status-chip {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding: 0.4rem 0.65rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(80, 210, 193, 0.35);
      background: rgba(6, 32, 27, 0.85);
      min-width: 0;
      flex: 1 1 140px;
    }
    .status-chip-label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #50D2C1;
      font-family: 'Inter', sans-serif;
    }
    .status-chip-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 500;
      color: #e8fff0;
    }
    .status-chip--funding {
      flex: 2 1 280px;
    }
    #fundingRateKings.funding-ticker-compact {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem 0.75rem;
      font-size: 0.75rem;
    }
    .terminal-workspace {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      flex: 1 1 auto;
      min-height: 0;
      align-items: start;
    }
    @media (min-width: 1100px) {
      .terminal-workspace {
        grid-template-columns: minmax(0, 7fr) minmax(280px, 3fr);
      }
      .sniper-rail {
        position: sticky;
        top: 0.75rem;
        max-height: calc(100vh - 5.5rem);
        overflow-y: auto;
        align-self: start;
      }
    }
    .main-canvas {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .sniper-rail {
      min-width: 0;
      background: #50D2C1;
      color: #020617;
      border: 1px solid rgba(15, 23, 42, 0.22);
      border-radius: 0.85rem;
      padding: 0.65rem 0.7rem 0.75rem;
      box-shadow: 0 0 20px rgba(80, 210, 193, 0.35);
    }
    .sniper-rail,
    .sniper-rail .section-header,
    .sniper-rail .typo-title,
    .sniper-rail .typo-action,
    .sniper-rail .typo-num,
    .sniper-rail .typo-context,
    .sniper-rail .inject-status-badge,
    .sniper-rail .inject-header-subtitle {
      color: #020617;
    }
    .sniper-rail .step-badge {
      color: #020617 !important;
      border-color: rgba(15, 23, 42, 0.35) !important;
      background: rgba(255, 255, 255, 0.45);
    }
    .sniper-rail .brand-hero-header--section {
      background: transparent;
      box-shadow: none;
      border-bottom: 1px solid rgba(15, 23, 42, 0.18);
      border-radius: 0;
    }
    .sniper-rail .sniper-panel {
      background: transparent;
      border-color: rgba(15, 23, 42, 0.2);
      box-shadow: none;
    }
    .sniper-rail .target-locked-banner {
      background: rgba(2, 6, 23, 0.88);
      border-bottom-color: rgba(15, 23, 42, 0.35);
      color: #50D2C1;
    }
    .sniper-rail .merged-sl-badge,
    .sniper-rail .max-sl-lock-badge,
    .sniper-rail .dyn-sl-lock-tag {
      background: rgba(2, 6, 23, 0.9);
      border-color: rgba(15, 23, 42, 0.8);
      color: #50D2C1;
      box-shadow: none;
    }
    .sniper-rail .mega-slider-wrap {
      background: rgba(2, 6, 23, 0.9);
      border-color: rgba(15, 23, 42, 0.85);
      box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.28);
    }
    .sniper-rail .mega-slider-title .typo-action,
    .sniper-rail #consoleOrderSizeLabel {
      color: #50D2C1 !important;
      text-shadow: none !important;
    }
    .sniper-rail .mega-slider-wrap .typo-context {
      color: rgba(226, 232, 240, 0.85) !important;
    }
    .sniper-rail #consoleSlippageReadout {
      color: #020617 !important;
    }
    .sniper-rail .order-size-ceiling > .mt-2 > .typo-action {
      color: #020617 !important;
    }
    .sniper-rail .master-slider {
      accent-color: #50D2C1;
    }
    .sniper-rail .step3-econ-card {
      background: rgba(2, 6, 23, 0.9) !important;
      border-color: rgba(15, 23, 42, 0.85) !important;
      color: #50D2C1;
    }
    .sniper-rail .step3-econ-card .typo-action,
    .sniper-rail .step3-econ-card .typo-num,
    .sniper-rail .step3-econ-card .typo-context {
      color: #50D2C1 !important;
    }
    .sniper-rail .step3-econ-card input[type="number"] {
      background: rgba(15, 23, 42, 0.95) !important;
      border-color: rgba(51, 65, 85, 0.95) !important;
      color: #50D2C1 !important;
    }
    .sniper-rail .capital-preset-btn {
      background: rgba(15, 23, 42, 0.95);
      border-color: rgba(51, 65, 85, 0.95);
      color: #50D2C1;
    }
    .sniper-rail .capital-preset-btn:hover,
    .sniper-rail .capital-preset-btn.is-active {
      background: rgba(80, 210, 193, 0.18);
      border-color: #50D2C1;
      color: #A0FFE0;
    }
    .sniper-rail .vault-balance-badge {
      border-color: rgba(15, 23, 42, 0.85);
      background:
        linear-gradient(135deg, rgba(2, 6, 23, 0.98) 0%, rgba(15, 23, 42, 0.98) 60%, rgba(2, 24, 22, 0.95) 100%);
      box-shadow:
        0 0 0 1px rgba(80, 210, 193, 0.22) inset,
        0 0 16px rgba(2, 6, 23, 0.35);
    }
    .sniper-rail .vault-balance-label {
      color: #50D2C1;
    }
    .sniper-rail .vault-balance-value {
      color: #A0FFE0;
    }
    .sniper-rail .capital-preset-btn:disabled,
    .sniper-rail .capital-preset-btn.is-disabled {
      opacity: 0.32;
      color: #64748b;
    }
    .sniper-rail .soil-badge {
      background: rgba(15, 23, 42, 0.95);
    }
    .sniper-rail .attack-zone {
      background: rgba(2, 6, 23, 0.92);
      border-color: rgba(15, 23, 42, 0.85);
      box-shadow: none;
    }
    .sniper-rail .root-slip-status {
      background: rgba(15, 23, 42, 0.85);
      border-color: rgba(51, 65, 85, 0.9);
    }
    .sniper-rail .root-slip-status .typo-action,
    .sniper-rail .root-slip-status .typo-context {
      color: #50D2C1 !important;
    }
    .sniper-rail #attackWarning {
      color: #fde68a !important;
    }
    .sniper-rail .attack-btn:not(:disabled):not(.attack-locked) {
      background: #020617;
      color: #50D2C1;
      border-color: rgba(15, 23, 42, 0.85);
      box-shadow: 0 0 14px rgba(2, 6, 23, 0.35);
    }
    .sniper-rail .attack-btn:hover:not(:disabled):not(.attack-locked) {
      background: #0f172a;
      filter: none;
    }
    .sniper-rail .sop-guide-trigger-btn {
      background: rgba(2, 6, 23, 0.85);
      border-color: rgba(15, 23, 42, 0.7);
      color: #50D2C1;
    }
    .sniper-rail .sop-guide-trigger-btn:hover {
      background: #020617;
      color: #7ee0ce;
    }
    .gatekeeper-compact {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    @media (min-width: 768px) {
      .gatekeeper-compact {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    .gate-card {
      border-radius: 0.75rem;
      padding: 0.65rem 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.3);
      background: rgba(6, 32, 27, 0.8);
      box-shadow: 0 0 12px rgba(80, 210, 193, 0.08);
      min-width: 0;
    }
    .cat-card-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }
    .cat-oi-total {
      font-family: 'JetBrains Mono', monospace;
      font-size: calc(0.75rem + 1.5px);
      color: #ecfdf5;
      text-shadow: 0 0 8px rgba(52, 211, 153, 0.55), 0 1px 2px rgba(0, 0, 0, 0.85);
      font-weight: 700;
      letter-spacing: 0.01em;
    }
    .cat-fr-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .cat-fr-row {
      display: flex;
      justify-content: space-between;
      gap: 0.35rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
    }
    .cat-fr-row button {
      background: transparent;
      border: 0;
      padding: 0;
      color: #e8fff0;
      font: inherit;
      cursor: pointer;
      text-align: left;
    }
    .cat-fr-row button:hover { color: #50D2C1; }
    .sniper-panel {
      border: 1px solid rgba(80, 210, 193, 0.4);
      border-radius: 0.75rem;
      background: #0e1a17;
      overflow: hidden;
      box-shadow: 0 0 18px rgba(80, 210, 193, 0.08);
    }
    .sniper-panel.target-lock-pulse {
      animation: gun-cock 0.65s ease-out;
    }
    @keyframes gun-cock {
      0% { box-shadow: 0 0 0 0 rgba(80, 210, 193, 0.0); transform: translateX(0); border-color: rgba(80, 210, 193, 0.28); }
      15% { box-shadow: 0 0 24px 2px rgba(80, 210, 193, 0.55); transform: translateX(-3px); border-color: #50D2C1; }
      30% { transform: translateX(3px); }
      45% { transform: translateX(-2px); box-shadow: 0 0 18px 1px rgba(80, 210, 193, 0.45); }
      100% { box-shadow: 0 0 0 0 rgba(80, 210, 193, 0); transform: translateX(0); border-color: rgba(80, 210, 193, 0.28); }
    }
    .target-locked-banner {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      background: rgba(80, 210, 193, 0.12);
      border-bottom: 1px solid rgba(80, 210, 193, 0.35);
      color: #50D2C1;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-family: 'Inter', sans-serif;
    }
    .target-locked-banner.is-active {
      display: flex;
      animation: target-pulse 1.2s ease-in-out 2;
    }
    @keyframes target-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.55; }
    }
    .sniper-stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.75rem;
    }
    .sniper-stack #draggableGrid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    @media (min-width: 1100px) {
      .sniper-stack #draggableGrid {
        grid-template-columns: 1fr;
      }
    }
    .sniper-stack .step3-econ-card {
      min-height: 0 !important;
    }
    .hardlock-badge-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      flex-direction: column;
      align-items: flex-start;
    }
    .vault-panel {
      border-radius: 0.75rem;
      border: 1px solid rgba(80, 210, 193, 0.28);
      background: rgba(6, 20, 13, 0.75);
      padding: 0.75rem 1rem;
    }
    .debug-drawer {
      flex-shrink: 0;
      margin-top: 0.75rem;
      border-radius: 0.75rem 0.75rem 0 0;
      border: 1px solid rgba(244, 63, 94, 0.25);
      border-bottom: 0;
      background: rgba(0, 0, 0, 0.72);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
    }
    .debug-drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      user-select: none;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .debug-drawer-body {
      padding: 0.5rem 0.75rem 0.75rem;
      max-height: 12rem;
      overflow-y: auto;
    }
    .debug-drawer.is-collapsed .debug-drawer-body {
      display: none;
    }

    #globalStatusBar #dexSettlementBox.status-chip {
      background: rgba(6, 32, 27, 0.85);
      border: 1px solid rgba(80, 210, 193, 0.35);
      color: #e8fff0;
      box-shadow: none;
    }
    #globalStatusBar #dexSettlementBox.settlement-demo-locked {
      background: #0b1217;
      border-color: #50D2C1;
      color: #50D2C1;
    }
    #step1ColCenter.all-red-mode {
      padding: 0.5rem;
      border-radius: 0.75rem;
    }
    .aquarium-deprecated {
      display: none !important;
    }
    /* Tighten section headers to typography budget (excl. debug) */
    .main-canvas .section-header,
    .sniper-rail .section-header,
    .vault-panel .section-header {
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .main-canvas button.typo-action,
    .sniper-rail button.typo-action,
    .terminal-header button.typo-action {
      font-size: 0.75rem !important;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
  </style>
</head>
<body class="terminal-body min-h-screen dashboard-booting">

  <noscript>
    <div style="margin:1rem;padding:1rem;border:2px solid #50D2C1;border-radius:0.75rem;background:#0A1A17;color:#e8fff0;font-family:Inter,sans-serif;">
      JavaScript is required for live telemetry. The risk dashboard layout is server-rendered below.
    </div>
  </noscript>

  <div id="forceRefreshOverlay">
    <img src="${BRAND_LOGO_DATA_URI}" alt="SANTENBOKU loading" class="cat-spinner" style="width:88px;height:88px;border-radius:9999px;" />
    <div class="font-hud text-circuit text-sm tracking-widest">SANTENBOKU / 蔘天木 · SECURED: RUNNING</div>
  </div>

  <div id="app" role="main" data-dashboard-mount="v1" aria-label="Santenboku risk terminal">
    <div id="appBootBanner" class="app-boot-banner hidden" aria-live="polite">
      Connecting v0.8 telemetry stream… SSR dashboard active.
    </div>

  <header class="terminal-header">
    <div class="terminal-header-top">
      <div class="flex items-center gap-3 flex-wrap">
        <a href="https://javier-dashboard-core.henry-astar1.workers.dev/" class="typo-action flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-circuit/20 hover:border-circuit/50 text-circuit rounded transition">
          &lt; Home
        </a>
        <div class="flex items-center gap-3">
          <img src="${BRAND_LOGO_DATA_URI}" alt="SANTENBOKU cat shield" class="h-14 w-14 rounded-full object-cover brand-logo-ring bg-black" />
          <div>
            <h1 class="typo-title text-circuit leading-tight">
              SANTENBOKU / 蔘天木 / さんてんぼく / 삼천목
            </h1>
            <p class="typo-context text-copper tracking-[0.18em] mt-0.5">
              [ SECURED : RUNNING ] <span class="text-circuit/70">· SILVERVINE LABS · ${versionLabel}</span>
              <span id="headerPairCount" class="text-circuit/60"> · 162 pairs live</span>
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end header-actions-right">
        <div id="topClock" class="typo-num text-circuit/70 bg-black/40 px-3 py-1.5 border border-circuit/20 rounded">🕒 HKT: --/--/---- --:--:--</div>
        <button type="button" id="connectWalletBtn" onclick="connectWallet()" class="connect-wallet-btn typo-action">
          <span class="panel-emoji" style="font-size:1.1rem;">🦊</span>
          <span id="connectWalletLabel">Connect Wallet</span>
        </button>
        <button type="button" id="headerMenuToggle" class="header-menu-toggle typo-action" onclick="toggleHeaderMenu()" aria-expanded="false" aria-controls="headerSecondaryActions">☰ Menu</button>
        <div id="headerSecondaryActions" class="header-secondary-actions">
          <div class="flex items-center border border-circuit/20 rounded overflow-hidden bg-black/30">
            <button onclick="adjustFontSize(-0.05)" class="typo-action px-3 py-1.5 text-circuit hover:bg-circuit/10 transition border-r border-circuit/20" title="Decrease font size">- A</button>
            <button onclick="adjustFontSize(0.05)" class="typo-action px-3 py-1.5 text-circuit hover:bg-circuit/10 transition" title="Increase font size">+ A</button>
          </div>
          <a href="__SHEET_LINK__" target="_blank" class="typo-action flex items-center gap-1.5 px-3 py-2 bg-circuit/15 hover:bg-circuit/25 text-circuit border border-circuit/40 rounded transition">
            Sheet
          </a>
          <button type="button" id="forceRefreshBtn" onclick="forceRefresh()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-circuit/15 border-2 border-circuit/50 text-circuit hover:bg-circuit/25 transition">
            <img id="forceRefreshCat" src="${BRAND_LOGO_DATA_URI}" alt="" class="h-5 w-5 rounded-full object-cover hidden" />
            FORCE REFRESH
          </button>
          <span id="refreshStatus" class="typo-num text-gray-500">idle</span>
          <button type="button" id="demoControlHubBtn" onclick="openDemoControlHub()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-[#50D2C1]/50 text-[#50D2C1] hover:bg-[#50D2C1]/10 transition">
            Demo Control Hub
          </button>
          <button type="button" id="startTourBtn" onclick="openQuickTour()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition">
            5-Sec Quick Guide
          </button>
          <button type="button" id="layoutMemoryBtn" onclick="toggleLayoutMemory()" class="typo-action inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-circuit/30 text-circuit hover:bg-circuit/10 transition">
            Layout
            <span id="layoutMemoryLamp" class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span id="layoutMemoryState" class="px-2 py-0.5 rounded bg-white/5 border border-white/10">ON</span>
          </button>
          <button onclick="toggleTheme()" class="p-2 rounded border border-copper/40 hover:bg-copper/20 text-copper typo-action">
            <span class="panel-emoji">☀️</span>/<span class="panel-emoji">🌙</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Legacy status mirrors (Market Heartbeat card lives in Step 1) -->
    <div id="globalStatusBar" class="hidden" aria-hidden="true">
      <div id="marketSessionsBox">
        <div id="shieldDemoMessage" class="hidden"></div>
      </div>
      <span id="heartbeatSessionLabel" class="hidden">Session: TOKYO</span>
      <span id="tsunamiShieldLamp" class="tsunami-shield-lamp hidden">SHIELD</span>
      <span id="settlementDemoLamp" class="tsunami-shield-lamp hidden">LOCKDOWN</span>
    </div>
    <div id="statusHudBar" class="risk-index-hud defense-hud-panel is-optimal" role="status" aria-live="polite">
      <div id="taijiBaguaOverlay" class="taiji-bagua-overlay">
        <span id="taijiModeBadge" class="taiji-mode-badge taiji-mode-yang sv-tip" tabindex="0" data-sv-tip="${escAttr(TAIJI_MODE_UI.YANG_STRIKE.tooltip)}" data-sv-label="Taiji Mode">${TAIJI_MODE_UI.YANG_STRIKE.label}</span>
        <span id="baguaGateBadge" class="bagua-gate-badge bagua-gate-qian sv-tip" tabindex="0" data-sv-tip="${escAttr(BAGUA_GATE_UI.QIAN_OPEN.tooltip)}" data-sv-label="Bagua Gate">${BAGUA_GATE_UI.QIAN_OPEN.label}</span>
      </div>
      <span id="statusHudCri" class="risk-index-score sv-tip text-emerald-400" tabindex="0" data-sv-tip="${escAttr(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC)}" data-sv-label="${escAttr(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL)}" title="${escAttr(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL)}">ROOT DEFENSE MATRIX: 100 / 100</span>
      <div class="demo-cri-bar-track risk-index-bar-track"><div id="statusHudFill" class="demo-cri-bar-fill" style="width:100%;background:#34d399"></div></div>
      <span id="statusHudBadge" class="risk-index-badge sv-tip text-emerald-400" tabindex="0" data-sv-tip="${escAttr(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC)}" data-sv-label="${escAttr(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL)}" title="${escAttr(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL)}">[ STATUS: OPTIMAL / ALL ROOTS LOCKED ]</span>
      <div id="step1CondensedLog" class="step1-condensed-log" aria-live="polite">
        <div class="step1-condensed-log-line log-ok">[SYSTEM] Root Defense loop armed · awaiting target inject</div>
      </div>
      <div class="dondon-ip-frame dondon-ip-frame--compact" id="dondonIpFrame" data-dondon-state="NORMAL" aria-label="DonDon IP Status Display">
        <span id="dondonIpBadge" class="dondon-ip-badge">ちリブ</span>
        <img
          id="bestHedgeDonDonAvatar"
          src="/brand/dondon_normal.png"
          alt="DonDon IP — Nominal Scan"
          class="dondon-ip-img dondon-state-normal"
          decoding="async"
        />
      </div>
    </div>
  </header>

  <div id="toxicModeBackdrop" class="toxic-mode-backdrop hidden" role="alertdialog" aria-modal="true" aria-labelledby="toxicModeTitle">
    <div class="toxic-mode-modal">
      <h2 id="toxicModeTitle">TOXIC MODE TRIPPED — ALL POSITIONS CLOSED &amp; ORDERS CANCELLED</h2>
      <p id="toxicModeSubtitle" class="text-sm" style="margin:0;color:#bae6fd;">Execution hard-locked. Cooldown active before re-arm.</p>
      <button type="button" class="demo-fault-btn" style="max-width:12rem;margin:1rem auto 0;" onclick="acknowledgeToxicModeModal()">ACKNOWLEDGE</button>
    </div>
  </div>

  <div id="demoHubBackdrop" class="demo-hub-backdrop demo-hub-drawer-backdrop hidden" aria-hidden="true" onclick="closeDemoControlHub(event)">
    <div class="demo-hub-modal demo-hub-drawer font-mono" onclick="event.stopPropagation()">
      <header class="demo-hub-modal-header">
        <div class="tour-modal-header-overlay" aria-hidden="true"></div>
        <button type="button" onclick="closeDemoControlHub()" class="tour-modal-close" aria-label="Close Demo Hub">✕</button>
        <div class="tour-modal-header-inner">
          <h2 class="tour-modal-title">🎛️ Demo Control Hub</h2>
        </div>
      </header>
      <div class="demo-hub-modal-body">
        <div class="demo-hub-tabs" role="tablist" aria-label="Demo Control Hub views">
          <button type="button" id="demoHubTabToggles" class="demo-hub-tab is-active" role="tab" aria-selected="true" onclick="setDemoHubTab('toggles')">🎛️ Risk Toggles</button>
          <button type="button" id="demoHubTabTelemetry" class="demo-hub-tab inline-flex-shield" role="tab" aria-selected="false" onclick="setDemoHubTab('telemetry')">${brandShield("brand-shield-icon", 14)} 20-Root Telemetry</button>
        </div>
        <div class="demo-hub-tab-content">
        <div id="demoHubPaneToggles" class="demo-hub-pane">
          <p class="text-gray-400 mb-3" style="font-size:calc((0.7rem + 2px) * 1.15);">${STATUS_DICTIONARY.DEMO_HUB.INTRO}</p>
          <div class="demo-cri-bar sv-tip" data-sv-tip="${escAttr(ROOT_DEFENSE_MATRIX_TOOLTIP_DESC)}" data-sv-label="${escAttr(ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL)}">
            <div class="flex justify-between items-center gap-2">
              <span class="font-black text-[#50D2C1]">${STATUS_DICTIONARY.DEMO_HUB.CRI_TELEMETRY.label}</span>
              <span id="demoHubCriReadout" class="typo-num text-emerald-300">ROOT DEFENSE MATRIX: 100 / 100</span>
            </div>
            <div class="demo-cri-bar-track"><div id="demoHubCriFill" class="demo-cri-bar-fill" style="width:100%;background:#34d399"></div></div>
            <div class="flex flex-col gap-0.5 mt-2 text-[0.62rem] font-bold">
              <span id="demoHubDynSlReadout" class="typo-num text-[#50D2C1]">DYN-SL: — · MAX $350</span>
              <span id="demoHubSlippageReadout" class="typo-num text-gray-400">Soil: — · Max 0.5%</span>
            </div>
          </div>
          <div class="demo-cri-control-block demo-hub-risk-inject sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.label)}">
            <span class="demo-hub-tx-label">${STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.label}</span>
            <div class="demo-cri-preset-grid" role="group" aria-label="ROOT DEFENSE MATRIX quick presets">
              <button type="button" class="demo-cri-preset-btn sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presetTips.NOMINAL)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presets.NOMINAL)}" onclick="setDemoCriPreset('NOMINAL')">${STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presets.NOMINAL}</button>
              <button type="button" class="demo-cri-preset-btn sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presetTips.WARNING)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presets.WARNING)}" onclick="setDemoCriPreset('WARNING')">${STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presets.WARNING}</button>
              <button type="button" class="demo-cri-preset-btn is-toxic sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presetTips.TOXIC)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presets.TOXIC)}" onclick="setDemoCriPreset('TOXIC')">${STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presets.TOXIC}</button>
              <button type="button" class="demo-cri-preset-btn is-god sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presetTips.GOD)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presets.GOD)}" onclick="setDemoCriPreset('GOD')">${STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.presets.GOD}</button>
            </div>
            <button type="button" class="demo-cri-reset-btn" onclick="resetToxicLockAndCooldown()">${STATUS_DICTIONARY.DEMO_HUB.CRI_CONTROL.resetBtn}</button>
          </div>
          <div class="demo-role-block sv-tip" data-sv-tip="Switch Demo Hub persona — Trader, Auditor (read-only), or Risk Manager (Javier)." data-sv-label="Demo Persona Role">
            <span class="demo-hub-tx-label">[ Demo Persona Role ]</span>
            <div id="demoRoleBanner" class="text-xs text-emerald-300 mt-1">[ TRADER MODE · ORDER ENTRY ENABLED ]</div>
            <div class="demo-role-options" role="group" aria-label="Demo persona role">
              <button type="button" id="demoRoleTrader" class="demo-role-btn is-active" onclick="setDemoPersonaRole('TRADER')">Trader</button>
              <button type="button" id="demoRoleAuditor" class="demo-role-btn role-auditor" onclick="setDemoPersonaRole('AUDITOR')">Auditor</button>
              <button type="button" id="demoRoleRisk" class="demo-role-btn role-risk" onclick="setDemoPersonaRole('RISK_MANAGER')">Risk Manager</button>
            </div>
          </div>
          <div id="demoFaultPanel" class="demo-fault-panel demo-hub-risk-inject hidden sv-tip" data-sv-tip="Javier-only 1-click fault injection sandbox for demo stress tests." data-sv-label="Inject Fault Sandbox Testing">
            <span class="demo-hub-tx-label">[ Inject Fault Sandbox Testing ]</span>
            <button type="button" class="demo-fault-btn" onclick="injectFaultPreset('HIGH_SLIPPAGE')">High Slippage</button>
            <button type="button" class="demo-fault-btn" onclick="injectFaultPreset('HIGH_VOLATILITY')">High Volatility</button>
            <button type="button" class="demo-fault-btn" onclick="injectFaultPreset('RISK_SCORE_SPIKE')">RiskScore Spike</button>
          </div>
          <div class="demo-xp-block demo-hub-risk-inject sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.XP_CONTROLS.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.XP_CONTROLS.label)}">
            <span class="demo-hub-tx-label">${STATUS_DICTIONARY.DEMO_HUB.XP_CONTROLS.label}</span>
            <div class="demo-xp-row">
              <input type="number" id="demoXpInput" class="demo-xp-input" min="0" max="200" value="0" oninput="onDemoXpInputChange()" />
              <button type="button" class="demo-hub-tx-btn" onclick="adjustDemoXp(10)">${STATUS_DICTIONARY.DEMO_HUB.XP_CONTROLS.presets.PLUS_10}</button>
              <button type="button" class="demo-hub-tx-btn" onclick="resetDemoXp()">${STATUS_DICTIONARY.DEMO_HUB.XP_CONTROLS.presets.RESET}</button>
            </div>
            <div class="demo-cri-bar-track"><div id="demoXpFill" class="demo-cri-bar-fill" style="width:0%; background: linear-gradient(90deg, #34d399, #50D2C1);"></div></div>
            <div id="demoXpTierLabel" class="text-xs text-gray-400 mt-1">RPG Tier: BEGINNER · XP 0</div>
          </div>
          <div class="demo-hub-tx-block demo-hub-risk-inject sv-tip mb-3" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT_TOGGLES.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT_TOGGLES.label)}">
            <span class="demo-hub-tx-label">${STATUS_DICTIONARY.DEMO_HUB.ROOT_TOGGLES.label}</span>
            <div id="demoRootToggleGrid" class="demo-root-toggle-grid" aria-label="20-Root CRI toggles"></div>
          </div>
          <div class="demo-hub-tx-block demo-hub-risk-inject sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.WALLET_TX_LEVEL.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.WALLET_TX_LEVEL.label)}">
            <span class="demo-hub-tx-label">${STATUS_DICTIONARY.DEMO_HUB.WALLET_TX_LEVEL.label}</span>
            <div class="demo-hub-tx-options" role="group" aria-label="Wallet TX Level Override">
              <button type="button" id="hubTxLevel0" class="demo-hub-tx-btn is-active" onclick="setDemoWalletTxLevel(0)">${STATUS_DICTIONARY.DEMO_HUB.WALLET_TX_LEVEL.options.SHIELD}</button>
              <button type="button" id="hubTxLevel5" class="demo-hub-tx-btn" onclick="setDemoWalletTxLevel(5)">${STATUS_DICTIONARY.DEMO_HUB.WALLET_TX_LEVEL.options.TACTICAL}</button>
              <button type="button" id="hubTxLevel20" class="demo-hub-tx-btn" onclick="setDemoWalletTxLevel(20)">${STATUS_DICTIONARY.DEMO_HUB.WALLET_TX_LEVEL.options.FLASH}</button>
            </div>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT8_SLIPPAGE.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT8_SLIPPAGE.label)}">${STATUS_DICTIONARY.DEMO_HUB.ROOT8_SLIPPAGE.label}</span>
            <button type="button" onclick="toggleShieldDemo()" class="px-2 py-1 rounded border border-white/20 font-black" id="hubShieldState" style="font-size:calc((0.75rem + 2px) * 1.15);">NORMAL</button>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT10_SETTLEMENT.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT10_SETTLEMENT.label)}">${STATUS_DICTIONARY.DEMO_HUB.ROOT10_SETTLEMENT.label}</span>
            <button type="button" onclick="toggleSettlementLockdownDemo()" class="px-2 py-1 rounded border border-white/20 font-black" id="hubSettlementState" style="font-size:calc((0.75rem + 2px) * 1.15);">Normal</button>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT11_FUNDING.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT11_FUNDING.label)}">${STATUS_DICTIONARY.DEMO_HUB.ROOT11_FUNDING.label}</span>
            <button type="button" onclick="toggleFundingExtremeDemo()" class="px-2 py-1 rounded border border-white/20 font-black" id="hubFundingExtremeState" style="font-size:calc((0.75rem + 2px) * 1.15);">OFF</button>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT13_GATEKEEPER.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.ROOT13_GATEKEEPER.label)}">${STATUS_DICTIONARY.DEMO_HUB.ROOT13_GATEKEEPER.label}</span>
            <button type="button" onclick="toggleGatekeeperDemo()" class="px-2 py-1 rounded border border-white/20 font-black" id="hubGatekeeperState" style="font-size:calc((0.75rem + 2px) * 1.15);">PASS</button>
          </div>
          <div class="demo-hub-row demo-hub-risk-inject">
            <span class="sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.DEFCON1.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.DEFCON1.label)}">${STATUS_DICTIONARY.DEMO_HUB.DEFCON1.label}</span>
            <button type="button" onclick="toggleDefcon1Demo()" class="px-2 py-1 rounded border border-red-500/50 text-red-300 font-black hover:bg-red-500/20" id="hubDefcon1State" style="font-size:calc((0.75rem + 2px) * 1.15);">OFF</button>
          </div>
          <button type="button" onclick="toggleDefcon1Demo()" id="hubDefcon1ToggleBtn" class="demo-hub-risk-inject mt-2 w-full px-3 py-2.5 rounded-lg border border-red-500/60 bg-red-950/50 text-red-200 font-black hover:bg-red-900/60 tracking-wide sv-tip" style="font-size:calc((0.75rem + 2px) * 1.15);" data-sv-tip="${escAttr(STATUS_DICTIONARY.DEMO_HUB.DEFCON1.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.DEMO_HUB.DEFCON1.toggleBtn)}">
            ${STATUS_DICTIONARY.DEMO_HUB.DEFCON1.toggleBtn}
          </button>
        </div>
        <div id="demoHubPaneTelemetry" class="demo-hub-pane hidden">
          <p class="text-gray-400 mb-3" style="font-size:calc((0.7rem + 2px) * 1.15);">${STATUS_DICTIONARY.DEMO_HUB.TELEMETRY_INTRO}</p>
          <div id="rootTelemetryGrid" class="root-telemetry-grid" aria-live="polite"></div>
        </div>
        </div>
      </div>
    </div>
  </div>

  <div id="walletModalBackdrop" class="wallet-modal-backdrop hidden" onclick="closeWalletModal(event)">
    <div class="wallet-modal font-mono" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-circuit font-black text-base">Connect Wallet</h3>
        <button type="button" onclick="closeWalletModal()" class="text-gray-400 hover:text-white text-sm">✕</button>
      </div>
      <p class="text-xs text-gray-400 mb-4">Select a wallet provider to enter the SilverVine Santenboku terminal.</p>
      <div class="flex flex-col gap-2">
        <button type="button" onclick="mockConnectWallet('MetaMask')" class="w-full px-3 py-2.5 rounded-lg border border-circuit/40 bg-circuit/10 text-circuit font-black hover:bg-circuit/20 text-left">🦊 MetaMask</button>
        <button type="button" onclick="mockConnectWallet('WalletConnect')" class="w-full px-3 py-2.5 rounded-lg border border-circuit/40 bg-black/40 text-white font-black hover:bg-white/10 text-left">🔗 WalletConnect</button>
        <button type="button" onclick="mockConnectWallet('Rabby')" class="w-full px-3 py-2.5 rounded-lg border border-circuit/40 bg-black/40 text-white font-black hover:bg-white/10 text-left">🐰 Rabby</button>
      </div>
      <p id="walletModalStatus" class="text-[11px] text-gray-500 mt-3">Ready · Mock / ethereum provider</p>
    </div>
  </div>


  <div id="quickTourBackdrop" class="demo-hub-backdrop hidden" aria-hidden="true" onclick="closeQuickTour(event)">
    <div class="tour-modal font-mono" onclick="event.stopPropagation()">
      <header class="tour-modal-header">
        <div class="tour-modal-header-overlay" aria-hidden="true"></div>
        <button type="button" onclick="closeQuickTour()" class="tour-modal-close" aria-label="Close quick guide">✕</button>
        <div class="tour-modal-header-inner">
          <h2 class="tour-modal-title">🚀 ${STATUS_DICTIONARY.QUICK_TOUR.TITLE}</h2>
        </div>
      </header>
      <div class="tour-modal-body">
        <ol class="tour-modal-steps">
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP1.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP1.title)}">
            <span class="tour-modal-step-badge">Step 1</span>
            <span class="tour-modal-step-body">
              <span class="inline-flex-shield">${brandShield("brand-shield-icon", 14)} ${STATUS_DICTIONARY.QUICK_TOUR.STEP1.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY.QUICK_TOUR.STEP1.roots}</span>
            </span>
          </li>
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP2.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP2.title)}">
            <span class="tour-modal-step-badge">Step 2</span>
            <span class="tour-modal-step-body">
              <span>🎯 ${STATUS_DICTIONARY.QUICK_TOUR.STEP2.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY.QUICK_TOUR.STEP2.roots}</span>
            </span>
          </li>
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP3.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP3.title)}">
            <span class="tour-modal-step-badge">Step 3</span>
            <span class="tour-modal-step-body">
              <span class="inline-flex-shield">${brandShield("brand-shield-icon", 14)} ${STATUS_DICTIONARY.QUICK_TOUR.STEP3.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY.QUICK_TOUR.STEP3.roots}</span>
            </span>
          </li>
          <li class="tour-modal-step sv-tip" tabindex="0" data-sv-tip="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP4.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.QUICK_TOUR.STEP4.title)}">
            <span class="tour-modal-step-badge">Step 4</span>
            <span class="tour-modal-step-body">
              <span>📜 ${STATUS_DICTIONARY.QUICK_TOUR.STEP4.title}</span>
              <span class="root-tag tour-root-tag">${STATUS_DICTIONARY.QUICK_TOUR.STEP4.roots}</span>
            </span>
          </li>
        </ol>
        <button type="button" onclick="closeQuickTour()" class="tour-modal-cta">${STATUS_DICTIONARY.QUICK_TOUR.CTA}</button>
      </div>
    </div>
  </div>

  <div id="sopGuideBackdrop" class="demo-hub-backdrop hidden" aria-hidden="true" onclick="closeSopGuide(event)">
    <div class="sop-guide-modal font-mono" onclick="event.stopPropagation()">
      <header class="brand-hero-header">
        <div class="brand-hero-header-overlay" aria-hidden="true"></div>
        <button type="button" onclick="closeSopGuide()" class="brand-hero-close" aria-label="Close SOP">✕</button>
        <div class="brand-hero-header-inner">
          <div>
            <h2 class="brand-hero-title">📖 SilverVine Labs Ironclad Risk Control SOP</h2>
            <p class="brand-hero-subtitle">[SANTENBOKU] Rules · Quant Risk Control Playbook</p>
          </div>
        </div>
      </header>
      <div class="sop-guide-body">
        <div class="sop-guide-steps">
          <section class="sop-guide-step">
            <h3>Phase 1: 宏觀門禁與結算淨空 (Macro Lock &amp; Settlement Clear)</h3>
            <ul class="list-disc list-inside">
              <li>Rule: Confirm Macro Radar shows no imminent high-impact releases (US CPI/FED) and sentiment is within control bands.</li>
            </ul>
            <p>📚 理論依據：<a href="https://www.amazon.com/dp/0471152803" target="_blank" rel="noopener noreferrer" class="sop-book-link">Nassim Taleb《Dynamic Hedging: Managing Vanilla and Exotic Options》</a> — Avoid fat-tailed black-swan uncertainty.</p>
          </section>
          <section class="sop-guide-step">
            <h3>Phase 2: 標的狙擊與對沖雷達 (Pre-Launch Snipe &amp; Best Hedge)</h3>
            <ul class="list-disc list-inside">
              <li>Rule: Verify funding rate before entry. Never chase longs during extreme long bleed (+0.1%+).</li>
            </ul>
            <p>📚 理論依據：<a href="https://www.amazon.com/Quantitative-Trading-Algorithmic-Business-Revised/dp/1394378041/ref=sr_1_1?nsdOptOutParam=true&amp;s=books&amp;sr=1-1" target="_blank" rel="noopener noreferrer" class="sop-book-link">Dr. Ernest P. Chan《Quantitative Trading (Revised Edition)》</a> — Avoid crowded trades with excessive carry friction.</p>
          </section>
          <section class="sop-guide-step">
            <h3 class="inline-flex-shield">${brandShield("brand-shield-icon", 16)} Phase 3: 地基阻力與滑價斷路 (Soil Resistance &amp; Slippage Breaker)</h3>
            <ul class="list-disc list-inside">
              <li class="inline-flex-shield">${brandShield("brand-shield-icon", 14)} Rule 1: Dynamic Max SL = (Equity × 1%) + $100 per order (hard-welded across all symbols).</li>
              <li>Rule 2: No structure / weak foundation / weak ceiling — no entry. Anti-FOMO enforced.</li>
              <li>Rule 3: If Order Size Slider shows [ SOIL: DANGER ] (slippage too high), entry is physically blocked.</li>
            </ul>
            <p>📚 理論依據：<a href="https://www.amazon.com/KELLY-CAPITAL-GROWTH-INVESTMENT-CRITERION/dp/9814383139/ref=sr_1_1?nsdOptOutParam=true&amp;s=books&amp;sr=1-1" target="_blank" rel="noopener noreferrer" class="sop-book-link">Edward O. Thorp《The Kelly Capital Growth Investment Criterion》</a> Capital management and physical slippage breaker mechanics.</p>
          </section>
          <section class="sop-guide-step">
            <h3 class="inline-flex-shield">${brandShield("brand-shield-icon", 16)} Phase 4: 絕對資本防護與處決 (Dynamic Max SL Weld &amp; Attack)</h3>
            <ul class="list-disc list-inside">
              <li class="inline-flex-shield">${brandShield("brand-shield-icon", 14)} Rule: After Phases 1–3 pass, fire ATTACK and execute the stop-loss plan without deviation.</li>
            </ul>
            <p>📚 理論依據：<a href="https://www.amazon.com/dp/0735201447" target="_blank" rel="noopener noreferrer" class="sop-book-link">Mark Douglas《Trading in the Zone》</a> — Remove emotion; execute pure probabilistic edge.</p>
          </section>
        </div>
      </div>
    </div>
  </div>

  <div class="terminal-workspace">
    <div class="main-canvas">
      <div class="hot-token-spotlight bg-amber-950/40 border-amber-500/60" id="hotTokenSpotlight" aria-label="HL Pre-Launch Spotlight">
        <div class="hot-token-spotlight-main">
          <span class="hot-token-badge text-amber-400">🚀 HL PRE-LAUNCH SPOTLIGHT</span>
          <div class="hot-token-meta text-amber-400">
            <span id="hotTokenSymbol">CASHCAT-USDC</span>
            <span id="hotTokenPrice">$0.0834</span>
            <span id="hotTokenChg" class="hot-chg is-neg">-26.10%</span>
            <span id="hotTokenFr" class="hot-fr">8H FR: 0.1675%</span>
          </div>
          <svg class="hot-token-sparkline" id="hotTokenSparkline" viewBox="0 0 96 28" aria-hidden="true">
            <polyline id="hotTokenSparkFill" fill="rgba(248,113,113,0.18)" stroke="none"
              points="2,6 12,8 22,10 32,12 42,14 52,16 62,18 72,20 82,22 94,24 94,28 2,28" />
            <polyline id="hotTokenSparkLine" fill="none" stroke="#f87171" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
              points="2,6 12,8 22,10 32,12 42,14 52,16 62,18 72,20 82,22 94,24" />
          </svg>
        </div>
        <button type="button" class="quick-snipe-btn" onclick="quickSnipeHotToken()">⚡ QUICK SNIPE</button>
      </div>

      <!-- STEP 1: Gatekeeper & Macro Lock -->
      <div class="mb-1 flex items-center gap-2 flex-wrap">
        <span class="step-badge typo-action text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded">Step 1</span>
        <h2 class="section-header typo-title m-0 inline-flex-shield">${brandShield("brand-shield-icon-md", 20)} Step 1: Gatekeeper &amp; Macro Lock</h2>
      </div>
      <div id="autoGuardBanner" class="auto-guard-banner is-locked" aria-live="polite">
        <div class="pipeline-mode-toggle" role="group" aria-label="Trade mode master preset controller">
          <button
            type="button"
            id="modeBtnShield"
            class="pipeline-mode-btn shield is-active sv-tip"
            onclick="setTradeMode('SHIELD')"
            data-sv-tip="${escAttr(STATUS_DICTIONARY.TRADE_MODES.SHIELD.desc)}"
            data-sv-label="${escAttr(STATUS_DICTIONARY.TRADE_MODES.SHIELD.button)}"
          >
            <span class="pipeline-mode-label">${STATUS_DICTIONARY.TRADE_MODES.SHIELD.button}</span>
            <span class="pipeline-mode-status">${STATUS_DICTIONARY.TRADE_MODES.SHIELD.status}</span>
          </button>
          <button
            type="button"
            id="modeBtnTactical"
            class="pipeline-mode-btn tactical sv-tip"
            onclick="setTradeMode('TACTICAL')"
            data-sv-tip="${escAttr(STATUS_DICTIONARY.TRADE_MODES.TACTICAL.desc)}"
            data-sv-label="${escAttr(STATUS_DICTIONARY.TRADE_MODES.TACTICAL.button)}"
          >
            <span class="pipeline-mode-label">${STATUS_DICTIONARY.TRADE_MODES.TACTICAL.button}</span>
            <span class="pipeline-mode-status">${STATUS_DICTIONARY.TRADE_MODES.TACTICAL.status}</span>
          </button>
          <button
            type="button"
            id="modeBtnFlash"
            class="pipeline-mode-btn flash sv-tip"
            onclick="setTradeMode('FLASH')"
            data-sv-tip="${escAttr(STATUS_DICTIONARY.TRADE_MODES.FLASH.desc)}"
            data-sv-label="${escAttr(STATUS_DICTIONARY.TRADE_MODES.FLASH.button)}"
          >
            <span class="pipeline-mode-label">${STATUS_DICTIONARY.TRADE_MODES.FLASH.button}</span>
            <span class="pipeline-mode-status">${STATUS_DICTIONARY.TRADE_MODES.FLASH.status}</span>
          </button>
        </div>
        <span id="autoGuardBannerMain" class="auto-guard-banner-main"></span>
        <span id="gkHeatLamp" class="banner-heat-status is-safe sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.VOLATILITY_HEAT.SAFE.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label)}">🟢 ${STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label}</span>
      </div>
      <div id="step1AllRedBanner" class="step1-all-red-banner hidden">
        🚨 DEFCON 1: ALL-RED RISK ALERT (MACRO / HIGH VOLATILITY LOCKDOWN)
      </div>
      <div class="step1-overhaul-grid" id="step1MacroSentimentTree">
        <div class="step1-sentiment-sanctuary circuit-panel p-3 mb-3" id="macroSentimentRadar" aria-label="Global Market Sentiment Radar">
          <p class="typo-action text-circuit mb-2">🛡️ Sanctuary Risk Shield · VIX / DVOL</p>
          <div id="vixTrad" class="vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm mb-2">
            VIX (Trad): <strong>16.8</strong>
            <a href="https://www.cboe.com/tradable_products/vix/" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="CBOE VIX">🔗</a>
            [ <span class="emoji-xl">😌</span> 傳統市場：平穩 / Stable ]
          </div>
          <div id="vixCrypto" class="vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm">
            DVOL (Crypto): <strong>52.5%</strong>
            <a href="https://www.deribit.com/statistics/BTC/volatility-index" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="Deribit DVOL">🔗</a>
            [ <span class="emoji-xl">😌</span> 加密市場：橫盤蓄勢 / Low Vol ]
          </div>
        </div>
        <div class="gatekeeper-defense-matrix" id="step1ColLeft">
          <div
            id="marketHeartbeatBar"
            class="market-heartbeat-card is-safe"
            role="status"
            aria-live="polite"
            aria-label="Market Heartbeat"
          >
            <div class="mhb-grid">
              <div class="mhb-left">
                <div class="mhb-title">MARKET HEARTBEAT</div>
                <div class="mhb-root5">
                  <span
                    class="mhb-root5-label root-tag sv-tip"
                    data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT5_VIX_DVOL.desc)}"
                    data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT5_VIX_DVOL.label)}"
                  >${STATUS_DICTIONARY.ROOT_TAGS.ROOT5_VIX_DVOL.label}</span>
                  <span id="heartbeatVolState" class="mhb-vol-state">SAFE / STABLE</span>
                </div>
                <div id="heartbeatCircuitLabel" class="mhb-circuit">NO CIRCUIT RISK</div>
                <span id="heartbeatVolLabel" class="hidden" aria-hidden="true">SAFE / STABLE</span>
              </div>
              <div class="mhb-right">
                <div id="hlCountdownWrap" class="mhb-hl">
                  <span
                    id="root10TsunamiTag"
                    class="root-tag sv-tip"
                    data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.desc)}"
                    data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.label)}"
                  >${STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.label}</span>
                  <span class="mhb-hl-text">HL Settled: <span id="hlCountdown">--m --s</span></span>
                </div>
                <div class="mhb-sessions" aria-label="Global trading sessions">
                  <div class="mhb-sessions-header">
                    <span class="mhb-sessions-title">SESSIONS</span>
                    <span
                      class="root-tag sv-tip"
                      data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT13_SESSION.desc)}"
                      data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT13_SESSION.label)}"
                    >${STATUS_DICTIONARY.ROOT_TAGS.ROOT13_SESSION.label}</span>
                  </div>
                  <div class="mhb-session-row">
                    <span class="mhb-session-name">ASIA (TOKYO/HKT):</span>
                    <span id="sessionAsiaClock" class="mhb-session-clock">--:--:--</span>
                    <span id="sessionAsia" class="mhb-session-state is-closed">CLOSED</span>
                  </div>
                  <div class="mhb-session-row">
                    <span class="mhb-session-name">EUROPE (LONDON):</span>
                    <span id="sessionEuropeClock" class="mhb-session-clock">--:--:--</span>
                    <span id="sessionEurope" class="mhb-session-state is-closed">CLOSED</span>
                  </div>
                  <div class="mhb-session-row">
                    <span class="mhb-session-name">US (NEW YORK):</span>
                    <span id="sessionUSClock" class="mhb-session-clock">--:--:--</span>
                    <span id="sessionUS" class="mhb-session-state is-closed">CLOSED</span>
                  </div>
                </div>
                <div
                  id="root10VolWindow"
                  class="mhb-root10 hidden sv-tip"
                  data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.desc)}"
                  data-sv-label="[ HKT 21-23 Window - HIGH VOLATILITY ]"
                >[ HKT 21-23 Window - HIGH VOLATILITY ]</div>
              </div>
            </div>
          </div>
          <div class="gk-matrix-title inline-flex-shield">${brandShield("brand-shield-icon", 16)} Gatekeeper Defense Matrix</div>
          <div class="gk-status-row" id="gkStatusRow">
            <span
              id="gkStatusGeo"
              class="gk-status-pill sv-tip"
              tabindex="0"
              data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT2_GEO_LOCK.desc)}"
              data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT2_GEO_LOCK.ok)}"
            >${STATUS_DICTIONARY.ROOT_TAGS.ROOT2_GEO_LOCK.ok}</span>
            <span
              id="gkStatusSlippage"
              class="gk-status-pill sv-tip"
              tabindex="0"
              data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT8_SLIPPAGE_BREAKER.desc)}"
              data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT8_SLIPPAGE_BREAKER.ok)}"
            >${STATUS_DICTIONARY.ROOT_TAGS.ROOT8_SLIPPAGE_BREAKER.ok}</span>
            <span
              id="gkStatusSl"
              class="gk-status-pill sv-tip"
              tabindex="0"
              data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT1_SL_WELD.desc)}"
              data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT1_SL_WELD.label)}"
            >${STATUS_DICTIONARY.ROOT_TAGS.ROOT1_SL_WELD.label}</span>
          </div>
          <div class="gk-macro-mini gate-card us-macro-card" style="background:transparent;border:0;box-shadow:none;padding:0;">
            <div class="macro-radar-title-row typo-action text-gray-400">
              <span>📡 Macro Radar · FOMC / CPI</span>
              <span
                class="root-tag sv-tip"
                data-sv-tip="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT_MACRO_FILTER.desc)}"
                data-sv-label="${escAttr(STATUS_DICTIONARY.ROOT_TAGS.ROOT_MACRO_FILTER.label)}"
              >${STATUS_DICTIONARY.ROOT_TAGS.ROOT_MACRO_FILTER.label}</span>
            </div>
            <div id="usMacroEvents" class="flex flex-col gap-1">
              <div class="us-macro-row typo-context flex justify-between gap-2">
                <span>🇺🇸 FOMC <a href="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">🔗</a></span>
                <span id="macroFomcCountdown" class="typo-num text-[#50D2C1]">8d 12h</span>
              </div>
              <div class="us-macro-row typo-context flex justify-between gap-2">
                <span>🇺🇸 CPI <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">🔗</a></span>
                <span id="macroCpiCountdown" class="typo-num text-[#50D2C1]">--</span>
              </div>
              <div class="us-macro-row typo-context flex justify-between gap-2">
                <span>🇪🇺 ECB <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">🔗</a></span>
                <span id="macroEcbCountdown" class="typo-num text-[#50D2C1]">--</span>
              </div>
              <div class="us-macro-row typo-context flex justify-between gap-2">
                <span>🇯🇵 BOJ <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link">🔗</a></span>
                <span id="macroBojCountdown" class="typo-num text-[#50D2C1]">--</span>
              </div>
            </div>
            <div class="macro-oracle-badge">
              [ ℹ️ Data Source: Federal Reserve &amp; BLS Official Oracles | Informational Only ]
            </div>
          </div>
        </div>

        <div class="best-hedge-radar bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 text-slate-200" id="step1BestHedgeRadar">
          <div class="best-hedge-header">
            <h3 class="best-hedge-title">BEST HEDGE &amp; DELTA NEUTRAL RADAR</h3>
          </div>
          <div class="best-hedge-body">
          <div class="best-hedge-hero-row">
            <div class="best-hedge-symbol-row">
              <div class="best-hedge-token-pair">
                <span class="best-hedge-token-icon" aria-hidden="true"></span>
                <span id="bestPairSymbol" class="text-white font-extrabold drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">--- / USDC</span>
              </div>
              <span id="bestPairYield" class="text-emerald-400 font-black">---% APR</span>
            </div>
            <div class="best-hedge-badges">
              <span
                class="best-hedge-auto-lock sv-tip"
                data-sv-tip="${escAttr(STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.AUTO_LOCKED.desc)}"
                data-sv-label="${escAttr(STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.AUTO_LOCKED.label)}"
              >${STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.AUTO_LOCKED.label}</span>
              <span
                id="bestPairAction"
                class="best-pair-action-tag sv-tip is-cashcat"
                data-sv-tip="${escAttr(STRATEGY_DICTIONARY.CASHCAT.tooltip)}"
                data-sv-label="${escAttr(STRATEGY_DICTIONARY.CASHCAT.actionText)}"
              >Computing…</span>
            </div>
          </div>
          <div class="best-hedge-returns">
            <div class="flex items-baseline gap-2 min-w-0">
              <span class="best-hedge-returns-label">7d:</span>
              <span id="bestPairProfit" class="best-hedge-returns-value">---</span>
            </div>
            <div class="flex items-baseline gap-2 min-w-0">
              <span class="best-hedge-returns-label">30d:</span>
              <span id="bestPairProfit30" class="best-hedge-returns-value">---</span>
              <span class="best-hedge-returns-label">USD</span>
            </div>
          </div>
          <button type="button" id="lockBestHedgeBtn" class="lock-best-hedge-btn sv-tip bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]" onclick="lockBestHedgeToStep3()" disabled data-sv-tip="${escAttr(STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.LOCK_BUTTON.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.LOCK_BUTTON.label)}">
            ${brandShield("lock-shield-icon", 20)}
            ${STATUS_DICTIONARY.BEST_HEDGE_STRATEGY.LOCK_BUTTON.label}
          </button>
          <div class="best-hedge-lock-hint">Auto-injects optimal delta-neutral strategy with dynamic Effective Max SL = (Equity × 1%) + $100.</div>

          <div class="live-vol-heat-panel sv-tip" id="liveVolHeatPanel" aria-label="Live Volatility Heat" data-sv-tip="${escAttr(STATUS_DICTIONARY.VOLATILITY_HEAT.SAFE.desc)}" data-sv-label="Live Volatility Heat">
            <div class="gk-heat-row">
              <span class="typo-context">Live Volatility Heat</span>
              <span id="liveVolHeatScore" class="live-vol-heat-score">--</span>
            </div>
            <div id="liveVolHeatMeta" class="live-vol-heat-meta">Heat score · VIX / DVOL composite</div>
          </div>

          <div class="gk-telemetry-grid" id="bestHedgeMetricsGrid" aria-label="Friction &amp; Volatility Metrics">
            <div class="gk-telemetry-chip sv-tip" data-sv-tip="${escAttr(METRICS_DICTIONARY.GAS.desc)}" data-sv-label="${escAttr(METRICS_DICTIONARY.GAS.label)}">
              <span class="label">${METRICS_DICTIONARY.GAS.label}</span>
              <span class="value" id="gkGasReadout">$2.50</span>
            </div>
            <div class="gk-telemetry-chip sv-tip" data-sv-tip="${escAttr(METRICS_DICTIONARY.FRICTION.desc)}" data-sv-label="${escAttr(METRICS_DICTIONARY.FRICTION.label)}">
              <span class="label">${METRICS_DICTIONARY.FRICTION.label}</span>
              <span class="value" id="gkFrictionReadout">0.24%</span>
            </div>
            <div class="gk-telemetry-chip sv-tip" data-sv-tip="${escAttr(METRICS_DICTIONARY.SLIPPAGE.desc)}" data-sv-label="${escAttr(METRICS_DICTIONARY.SLIPPAGE.label)}">
              <span class="label">${METRICS_DICTIONARY.SLIPPAGE.label}</span>
              <span class="value" id="gkSlipReadout">--</span>
            </div>
            <div class="gk-telemetry-chip sv-tip" data-sv-tip="${escAttr(METRICS_DICTIONARY.HEAT.desc)}" data-sv-label="${escAttr(METRICS_DICTIONARY.HEAT.label)}">
              <span class="label">${METRICS_DICTIONARY.HEAT.label}</span>
              <span class="value" id="gkHeatScore">--</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- Hidden legacy Step 1 shells for older selectors -->
      <div id="step1ColCenter" class="hidden" aria-hidden="true"></div>
      <div id="alphaEdgeTokens" class="hidden" aria-hidden="true"></div>

      <!-- STEP 2: Weak Target Radar -->
      <div class="mb-1 flex items-center gap-2 flex-wrap">
        <span class="step-badge typo-action text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded">Step 2</span>
        <div>
          <h2 class="section-header typo-title m-0" title="Six asset branches · OI · Extreme FR">🎯 Step 2: Weak Target Radar</h2>
          <p class="typo-context text-gray-400">6 categories · ALL HL tokens mapped · Top 3 extreme FR · Lock → Sniper</p>
        </div>
      </div>

      <div class="step2-funding-panel funding-world-tree-bar" id="fundingRateKingsBar">
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <span class="typo-action text-[#50D2C1]">🔥 Funding Extremes · Top/Bottom 3</span>
          <button type="button" id="fundingRiskGuideBtn" onclick="toggleFundingRiskGuide()" class="typo-action px-1.5 py-0.5 rounded border border-[#50D2C1]/50 text-[#50D2C1] hover:bg-[#50D2C1]/10">INFO</button>
        </div>
        <div class="relative">
          <div id="fundingRiskGuidePopover" class="risk-guide-popover hidden">
            <div class="font-black text-[#50D2C1] mb-2">Funding Rate Risk Guide</div>
            <p class="mb-2">Funding rate is hourly interest paid between longs and shorts on perpetuals. Positive = longs pay shorts; negative = shorts pay longs.</p>
            <p class="mb-2"><strong class="text-rose-300">Carry bleed risk:</strong> Extreme positive funding can drain long P&amp;L; extreme negative funding drains naked shorts.</p>
            <p>Practice: Watch Top 3, Soil Resistance, and settlement countdown — avoid blind entries near the hour.</p>
          </div>
        </div>
        <div id="fundingRateKings" class="funding-ticker-compact status-chip-value">
          <span class="text-gray-500">Syncing...</span>
        </div>
      </div>

      <div class="mb-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-2 tradfi-panel-scale" id="tradFiPanel">
        <div id="tradfi-crypto" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel step1-glacier-card bg-[#051A16]/80 border border-[#50D2C1]/30" style="order:0;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">⚡ Crypto</span>
            <span id="cryptoOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="cryptoPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-commodities" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:1;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">⚜️ Commodities</span>
            <span id="commoditiesOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="commoditiesPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-stocks" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:2;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">📈 Stocks</span>
            <span id="stocksOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="stocksPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-indices" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:3;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">📊 Indices</span>
            <span id="indicesOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="indicesPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-fx" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:4;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">💱 FX</span>
            <span id="fxOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="fxPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
        <div id="tradfi-preipo" draggable="true" class="tradfi-draggable p-2.5 rounded-xl circuit-panel" style="order:5;">
          <div class="cat-card-meta">
            <span class="tradfi-cat-title typo-title text-emerald-300">🚀 Pre-IPO</span>
            <span id="preipoOiTotal" class="cat-oi-total">OI --</span>
          </div>
          <div id="preipoPanel" class="cat-fr-list"><span class="text-gray-500 typo-context">Syncing...</span></div>
        </div>
      </div>

      <div class="rounded-xl overflow-hidden shadow-md border" style="background-color: var(--bg-card-dark); border-color: var(--border-color)" id="tokenTableSection">
        <header class="brand-hero-header brand-hero-header--matrix">
          <div class="brand-hero-header-overlay" aria-hidden="true"></div>
          <div class="brand-hero-header-inner w-full">
            <div class="matrix-table-toolbar">
              <div>
                <h3 class="brand-hero-title brand-hero-title--section typo-title">Filtered Token Table</h3>
                <p class="brand-hero-subtitle typo-context">Symbol · Price / 8H FR · HL OI · APR · Slippage · Quick Lock</p>
              </div>
              <div class="matrix-table-toolbar-right">
                <div id="matrixCategoryFilters" class="flex flex-wrap gap-1.5 justify-end">
                  <button type="button" data-category="ALL" onclick="setMatrixCategoryFilter('ALL')" class="matrix-category-btn active typo-action px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">🌐 All</button>
                  <button type="button" data-category="CRYPTO" onclick="setMatrixCategoryFilter('CRYPTO')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">⚡ Crypto</button>
                  <button type="button" data-category="COMMODITIES" onclick="setMatrixCategoryFilter('COMMODITIES')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">🌴 Commodities</button>
                  <button type="button" data-category="STOCKS" onclick="setMatrixCategoryFilter('STOCKS')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">📈 Stocks</button>
                  <button type="button" data-category="INDICES" onclick="setMatrixCategoryFilter('INDICES')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">📊 Indices</button>
                  <button type="button" data-category="FX" onclick="setMatrixCategoryFilter('FX')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">💱 FX</button>
                  <button type="button" data-category="PREIPO" onclick="setMatrixCategoryFilter('PREIPO')" class="matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">🚀 Pre-IPO</button>
                </div>
                <div class="matrix-table-updated typo-num" id="lastUpdated">Syncing market foundation data...</div>
              </div>
            </div>
            <div class="matrix-table-filters">
              <div class="flex flex-col lg:flex-row lg:items-center gap-3 justify-between mt-2">
                <div class="relative w-full lg:max-w-xs">
                  <input id="tokenSearchInput" type="search" placeholder="Search token (e.g. BTC)..." oninput="onTokenSearchInput()"
                    class="w-full bg-black/40 border border-white/10 rounded px-3 py-2 typo-context text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div id="pairStatusFilters" class="flex flex-wrap gap-1.5">
                  <button type="button" data-status="ALL" onclick="setPairStatusFilter('ALL')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">All</button>
                  <button type="button" data-status="OPEN" onclick="setPairStatusFilter('OPEN')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Open</button>
                  <button type="button" data-status="HOLD" onclick="setPairStatusFilter('HOLD')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Hold</button>
                  <button type="button" data-status="SPREAD" onclick="setPairStatusFilter('SPREAD')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Spread</button>
                  <button type="button" data-status="DEFICIT" onclick="setPairStatusFilter('DEFICIT')" class="pair-status-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">Deficit</button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div class="matrix-pagination-bar border-b" id="matrixPaginationTop">
          <span class="pagination-info text-gray-400 typo-context">Page 0 / 0 · 0 rows</span>
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5 typo-context text-gray-400">
              <span>Show:</span>
              <button type="button" data-page-size="5" onclick="setPageSize(5)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">5</button>
              <button type="button" data-page-size="10" onclick="setPageSize(10)" class="matrix-page-size-btn active typo-action px-2 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">10</button>
              <button type="button" data-page-size="20" onclick="setPageSize(20)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">20</button>
              <button type="button" data-page-size="all" onclick="setPageSize('all')" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">All</button>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="page-prev-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToPrevPage()">Prev</button>
              <button type="button" class="page-next-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToNextPage()">Next</button>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse dynamic-text-target table-layout-fixed" id="matrixTable">
            <thead>
              <tr class="uppercase tracking-wider border-b select-none typo-action" style="border-color: var(--border-color); color: #9ca3af">
                <th class="p-2 sticky-col-left text-center" style="width: 40px;" title="Favorite / Pin to Top">☆</th>
                <th class="p-2 sticky-col-left cursor-pointer hover:bg-white/5" style="width: 110px; left: 40px;" onclick="sortTable(1)">Symbol</th>
                <th class="p-2 text-emerald-400 cursor-pointer hover:bg-white/5" style="width: 100px;" onclick="sortTable(2)">HL OI</th>
                <th class="p-2 cursor-pointer hover:bg-white/5" style="width: 120px;" onclick="sortTable(3)">PRICE / 8H FR</th>
                <th class="p-2 text-circuit cursor-pointer hover:bg-white/5" style="width: 100px;" onclick="sortTable(4)">HL APR</th>
                <th class="p-2 text-center text-circuit" style="width: 120px;">Slippage</th>
                <th class="p-2 sticky-col-right text-right" style="width: 168px;" title="Lock to Step 3">Lock to Step 3</th>
              </tr>
            </thead>
            <tbody id="matrixTableBody" class="divide-y divide-white/5"></tbody>
          </table>
        </div>
        <div class="matrix-pagination-bar border-t" id="matrixPaginationBottom">
          <span class="pagination-info text-gray-400 typo-context">Page 0 / 0 · 0 rows</span>
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5 typo-context text-gray-400">
              <span>Show:</span>
              <button type="button" data-page-size="5" onclick="setPageSize(5)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">5</button>
              <button type="button" data-page-size="10" onclick="setPageSize(10)" class="matrix-page-size-btn active typo-action px-2 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit">10</button>
              <button type="button" data-page-size="20" onclick="setPageSize(20)" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">20</button>
              <button type="button" data-page-size="all" onclick="setPageSize('all')" class="matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10">All</button>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="page-prev-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToPrevPage()">Prev</button>
              <button type="button" class="page-next-btn typo-action px-3 py-1.5 rounded border border-white/10 bg-black/30 text-white hover:bg-white/10 disabled:opacity-40" onclick="goToNextPage()">Next</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Positions & Execution Logs (replaces bottom Vault box) -->
      <div class="live-ops-panel mt-2" id="livePositionsLogsPanel">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="step-badge typo-action text-[#50D2C1] border border-[#50D2C1]/50 px-2 py-0.5 rounded">Ops</span>
          <h2 class="section-header typo-title m-0">📜 Step 4: Live Positions &amp; Review Logs</h2>
        </div>
        <div class="live-ops-grid">
          <div>
            <div class="typo-action text-gray-400 mb-1">Active Positions</div>
            <div class="overflow-x-auto">
              <table class="live-ops-table" id="activePositionsTable">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Size</th>
                    <th>Dynamic SL</th>
                    <th>PnL</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="activePositionsBody">
                  <tr id="activePositionsEmpty"><td colspan="5" class="text-gray-500">No open positions</td></tr>
                </tbody>
              </table>
            </div>
            <!-- Hidden vault mirrors for header sync -->
            <span id="vaultOpenPositions" class="hidden">0</span>
            <span id="vaultSettledPnl" class="hidden">$0.00</span>
            <span id="vaultLastAttack" class="hidden">—</span>
          </div>
          <div>
            <div class="typo-action text-gray-400 mb-1">Real-time Execution Log</div>
            <div id="execLogStream" class="exec-log-stream" aria-live="polite">
              <div class="log-line log-ok">[SYSTEM] Root Defense loop armed · waiting for inject / ATTACK</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT 30%: Sniper Execution Shield (merged Step 3 + Execution) -->
    <aside class="sniper-rail bg-[#50D2C1] text-slate-950" id="sniperExecutionShield" aria-label="Sniper Execution Shield">
      <div class="mb-1 flex items-center gap-2 flex-wrap">
        <span class="step-badge typo-action text-slate-950 border border-slate-900/40 px-2 py-0.5 rounded">Step 3</span>
        <h2 class="section-header typo-title m-0 text-slate-950 inline-flex-shield">${brandShield("brand-shield-icon-md", 20)} Step 3: Sniper Execution Shield</h2>
      </div>
      <div class="step3-emergency-row">
        <button type="button" class="emergency-close-all-btn" onclick="emergencyCloseAllPositions()" title="Instant mock exit of all positions">
          🚨 EMERGENCY CLOSE ALL
        </button>
      </div>
      <div id="masterRiskConsole" class="sniper-panel font-mono">
        <div id="targetLockedBanner" class="target-locked-banner">🎯 TARGET LOCKED</div>
        <header class="brand-hero-header brand-hero-header--section text-slate-950 font-bold">
          <button type="button" id="sopGuideBtn" onclick="openSopGuide()" class="sop-guide-trigger-btn" title="SOP Guide" aria-label="Open SOP Guide">❔</button>
          <div class="inject-header-stack flex flex-col gap-1.5 items-center justify-center p-3 pr-11">
            <div id="consoleSelectedLabel" class="inject-status-badge is-pending text-slate-950">⏳ Waiting for token inject…</div>
            <p id="consoleInjectSubtitle" class="inject-header-subtitle text-xs font-mono tracking-wider uppercase font-semibold text-slate-900/80">
              CAPITAL . SOIL . ATTACK / Order size synced with Soil Resistance
            </p>
          </div>
        </header>
        <div class="sniper-stack master-risk-console-body">
          <div class="hardlock-badge-wrap">
            <span
              id="dynSlLockTag"
              class="merged-sl-badge sv-tip"
              data-sv-tip="${escAttr(STATUS_DICTIONARY.MAX_SL_WELD.desc)}"
              data-sv-label="${escAttr(STATUS_DICTIONARY.MAX_SL_WELD.label)}"
            >[ ${brandShield("brand-shield-icon", 14)} MAX SL DYNAMIC WELD | DYN-SL: ${initialDynSlPct.toFixed(2)}% ($${initialMaxSlUsd.toFixed(0)} MAX LOSS) ]</span>
          </div>

          <!-- Order Size ABOVE Capital — visual ceiling before Capital sizing -->
          <div class="order-size-ceiling" id="orderSizeCeiling">
            <div class="mega-slider-wrap" id="orderSizeMegaSlider">
              <div class="mega-slider-title">
                <span class="typo-action">⚡ ORDER SIZE · MEGA SLIDER</span>
                <span id="consoleOrderSizeLabel" class="typo-num text-base font-black">$10,000</span>
              </div>
              <input type="range" id="masterOrderSizeSlider" class="master-slider" min="1000" max="25000" step="1000" value="10000" oninput="onMasterOrderSizeChange()" />
              <div class="flex justify-between typo-context mt-1">
                <span>$1K</span>
                <span id="orderSizeSliderMid">mid</span>
                <span id="orderSizeSliderMaxLabel">$25K</span>
              </div>
            </div>
            <div class="mt-2">
              <div class="typo-action mb-1">Soil Resistance</div>
              <div id="consoleSlippageReadout" class="typo-num font-bold">--</div>
              <div id="consoleSoilBadge" class="soil-badge soil-loose w-fit mt-1 sv-tip" data-sv-tip="${escAttr(STATUS_DICTIONARY.SOIL_RESISTANCE.LOOSE.desc)}" data-sv-label="${escAttr(STATUS_DICTIONARY.SOIL_RESISTANCE.LOOSE.label)}">[ ${STATUS_DICTIONARY.SOIL_RESISTANCE.LOOSE.label} ]</div>
            </div>
          </div>

          <div class="grid gap-2" id="draggableGrid">
            <div id="block2" class="step3-econ-card bg-slate-950/90 border border-slate-800 rounded-lg p-2.5" style="order:1;">
              <div
                class="vault-balance-badge"
                id="step3VaultBar"
                title="Santenboku Vault Control — CAPITAL presets bind to this balance"
              >
                <div class="vault-balance-main">
                  <span class="vault-balance-label">VAULT BALANCE:</span>
                  <span class="vault-balance-value">$<span id="step3VaultEquity">25,000.00</span> USD</span>
                </div>
                <div class="vault-balance-meta">
                  <span>Open Pos: <span id="step3VaultPos">0</span></span>
                  <span class="vault-sep">·</span>
                  <span>Live PnL: <span id="step3VaultLivePnl" class="step3-vault-pnl is-pos">+$0.00</span> <span id="step3VaultPnlEmoji">🟢</span></span>
                </div>
              </div>
              <div class="typo-action mb-1">Capital</div>
              <input type="number" id="capitalInput" value="25000" min="1" max="25000" step="100" oninput="onCapitalInputChange()" onblur="onCapitalInputBlur()"
                class="w-full bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded typo-num text-[#50D2C1] focus:outline-none focus:border-[#50D2C1]" />
              <div class="capital-presets" id="capitalAbsPresets">
                <button type="button" class="capital-preset-btn" data-capital="1000" onclick="setCapitalPreset(1000)">$1k</button>
                <button type="button" class="capital-preset-btn" data-capital="5000" onclick="setCapitalPreset(5000)">$5k</button>
                <button type="button" class="capital-preset-btn" data-capital="10000" onclick="setCapitalPreset(10000)">$10k</button>
                <button type="button" class="capital-preset-btn" data-capital="50000" onclick="setCapitalPreset(50000)">$50k</button>
              </div>
              <div class="capital-presets capital-vault-pcts" id="capitalVaultPctPresets" title="Allocate % of live Vault balance">
                <button type="button" class="capital-preset-btn capital-vault-pct-btn" data-vault-pct="25" onclick="setCapitalVaultPct(25)">25%</button>
                <button type="button" class="capital-preset-btn capital-vault-pct-btn" data-vault-pct="50" onclick="setCapitalVaultPct(50)">50%</button>
                <button type="button" class="capital-preset-btn capital-vault-pct-btn" data-vault-pct="75" onclick="setCapitalVaultPct(75)">75%</button>
                <button type="button" class="capital-preset-btn capital-vault-pct-btn is-active" data-vault-pct="100" onclick="setCapitalVaultPct(100)">100%</button>
              </div>
              <div id="block2CapitalDisplay" class="hidden">$25,000</div>
              <div id="walletMarginReadout" class="typo-context mt-1">Margin: connect wallet</div>
            </div>
            <div id="block3" class="step3-econ-card bg-slate-950/90 border border-slate-800 rounded-lg p-2.5" style="order:2;">
              <div class="typo-action mb-1">Friction %</div>
              <div class="relative">
                <input type="number" id="frictionInput" value="0.24" step="0.01" oninput="onStep3FrictionChange()" class="w-full bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded typo-num text-[#50D2C1] focus:outline-none focus:border-[#50D2C1]">
                <span class="absolute right-3 top-2 typo-context text-[#50D2C1]/70">%</span>
              </div>
            </div>
            <div id="block4" class="step3-econ-card bg-slate-950/90 border border-slate-800 rounded-lg p-2.5" style="order:3;" title="Gas fixed cost">
              <div class="typo-action mb-1">Gas</div>
              <div class="typo-num font-bold">$2.50</div>
              <input type="hidden" id="fixedCostInput" value="2.50" />
            </div>
            <div id="block5" class="step3-econ-card bg-slate-950/90 border border-slate-800 rounded-lg p-2.5" style="order:4;">
              <div class="typo-action mb-1 text-rose-300">Total Friction</div>
              <div class="typo-num font-bold text-rose-300" id="displayTotalFriction">$26.50</div>
            </div>
          </div>

          <div id="attackExecuteZone" class="attack-zone rounded-lg border border-slate-800 overflow-hidden">
            <div class="attack-zone-body flex flex-col gap-3 p-3">
              <div id="rootSlipProtectionStatus" class="root-slip-status">
                <div class="flex flex-col gap-1">
                  <span class="typo-action">Root Slip-Protection</span>
                  <span id="rootSlipBreakerLamp" class="typo-context font-bold">🟢 Slip Breaker: ACTIVE | Max 0.5%</span>
                </div>
              </div>
              <div id="step4SopCard" class="hidden" aria-hidden="true"></div>
              <div id="attackExecuteRow" class="flex flex-col gap-2">
                <span id="attackWarning" class="typo-context font-bold">⚠️ Confirm Soil + Settlement countdown</span>
                <div class="flex items-center gap-2">
                  <span id="attackLockdownLabel" class="hidden typo-action text-red-300 border border-red-500/40 bg-red-950/60 px-2 py-1 rounded animate-pulse">🔒 LOCKDOWN</span>
                  <button type="button" id="attackExecuteBtn" class="attack-btn attack-btn-xl w-full typo-action" onclick="executeAttackOrder()" disabled>
                    <img src="/brand/dondon-eyes.webp" alt="DonDon" class="attack-btn-dondon w-7 h-auto" />
                    <span id="attackExecuteBtnLabel">ATTACK / EXECUTE ORDER</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>

  <div class="debug-drawer" id="debugDrawer">
    <div class="debug-drawer-header" onclick="toggleDebugDrawer()" role="button" tabindex="0">
      <span class="text-rose-400 font-bold flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
        SYSTEM DEBUG CONSOLE (SANTENBOKU)
      </span>
      <div class="flex items-center gap-2" onclick="event.stopPropagation()">
        <button type="button" onclick="toggleDefcon1Demo()" class="typo-action bg-red-950/50 border border-red-500/40 px-2 py-0.5 rounded hover:bg-red-900/50 text-red-200">DEFCON 1</button>
        <button onclick="clearLogs()" class="typo-action bg-white/5 border border-white/10 px-2 py-0.5 rounded hover:bg-white/10 text-white">Clear</button>
        <button type="button" id="debugDrawerToggleBtn" onclick="toggleDebugDrawer()" class="typo-action text-gray-400 border border-white/10 px-2 py-0.5 rounded">Collapse</button>
      </div>
    </div>
    <div class="debug-drawer-body">
      <div id="consoleOutput" class="space-y-1 text-gray-300">
        <div class="text-emerald-400">[SYSTEM] Santenboku defense matrix online · SECURED: RUNNING · Layout v2.0 70/30</div>
      </div>
    </div>
  </div>

  <footer id="appFooter" class="app-footer mt-8 mb-4 px-4 py-4 rounded-xl border border-[#50D2C1]/25 bg-black/40 font-mono">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-400">
      <div class="text-center sm:text-left">
        <a
          href="https://www.SliverVineLabs.com"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-copyright-link"
        >© 2026 SliverVine Labs. All rights reserved.</a>
      </div>
      <div class="flex items-center justify-center gap-2 text-[#50D2C1] font-bold">
        <a
          href="https://x.com/SliverVineLabs"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-x-link"
          aria-label="SliverVine Labs on X"
          title="X / Twitter"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
          </svg>
        </a>
        <span class="text-gray-600">|</span>
        <button type="button" class="footer-link-btn" onclick="openLegalModal('tc')">T&amp;C</button>
        <span class="text-gray-600">|</span>
        <button type="button" class="footer-link-btn" onclick="openLegalModal('privacy')">Privacy</button>
        <span class="text-gray-600">|</span>
        <button type="button" class="footer-link-btn" onclick="openLegalModal('disclaimer')">Disclaimer</button>
      </div>
    </div>
  </footer>
  <div id="legalModalBackdrop" class="demo-hub-backdrop hidden" aria-hidden="true" onclick="closeLegalModal(event)">
    <div class="demo-hub-modal font-mono" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between mb-3">
        <h3 id="legalModalTitle" class="text-[#50D2C1] font-black text-base">Legal</h3>
        <button type="button" onclick="closeLegalModal()" class="text-gray-400 hover:text-white text-sm">✕</button>
      </div>
      <div id="legalModalBody" class="legal-modal-body text-xs text-gray-300 leading-relaxed"></div>
    </div>
  </div>
  </div><!-- #app -->

  <div id="svTooltipRoot" role="tooltip" data-state="closed" hidden></div>
  <script>
    /** Master English Status Dictionary — injected from src/config/statusDictionary.ts */
    const STATUS_DICTIONARY = ${statusDictionaryJson()};
    const STRATEGY_DICTIONARY = ${strategyDictionaryJson()};
    const METRICS_DICTIONARY = ${metricsDictionaryJson()};

    /** Shared risk / role / CRI runtime — sourced from step1-engine + client-runtime.ts */
    ${injectedRuntime}

    let systemState = ${JSON.stringify(initialSystemState)};
    ${RISK_CLIENT_CORE_SCRIPT}
    ${HUD_CLIENT_SCRIPT}

    const ROOT_DEFENSE_TELEMETRY = ${rootTelemetryJson};

    let globalData = [];
    let currentFontSizeRem = 1.125;
    let currentSortCol = -1;
    let sortAscending = true;
    let currentPage = 1;
    let pageSize = 10; // 5 | 10 | 20 | Infinity (All)

    /**
     * Safe arg for onclick="fn(...)" inside HTML strings.
     * Uses JSON + &quot; so nested TS template-literal backslashes cannot strip quotes
     * (avoids SyntaxError: Unexpected string from injectTokenToMasterConsole(BTC)).
     */
    function jsOnclickArg(value) {
      return JSON.stringify(String(value == null ? '' : value)).replace(/"/g, '&quot;');
    }

    function tooltipPrimitive(value) {
      if (value == null) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      if (typeof value === 'object') {
        if (typeof value.desc === 'string') return value.desc;
        if (typeof value.label === 'string') return value.label;
        if (typeof value.text === 'string') return value.text;
        try { return JSON.stringify(value); } catch (_) { return ''; }
      }
      try { return String(value); } catch (_) { return ''; }
    }

    function escapeTooltipHtml(value) {
      const text = tooltipPrimitive(value);
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /** Radix-style floating tooltip for [data-sv-tip] / .sv-tip nodes */
    function initSvTooltips() {
      let root = document.getElementById('svTooltipRoot');
      if (!root) {
        root = document.createElement('div');
        root.id = 'svTooltipRoot';
        root.setAttribute('role', 'tooltip');
        root.setAttribute('data-state', 'closed');
        root.hidden = true;
        document.body.appendChild(root);
      }
      let activeEl = null;
      let hideTimer = null;

      function hideTip() {
        activeEl = null;
        root.setAttribute('data-state', 'closed');
        root.hidden = true;
        root.innerHTML = '';
      }

      function showTip(el) {
        const tip = el.getAttribute('data-sv-tip');
        if (!tip) return;
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        activeEl = el;
        const label = el.getAttribute('data-sv-label');
        root.innerHTML =
          (label ? '<span class="sv-tip-label">' + escapeTooltipHtml(label) + '</span>' : '') +
          escapeTooltipHtml(tip);
        root.hidden = false;
        root.setAttribute('data-state', 'open');
        const rect = el.getBoundingClientRect();
        const tipRect = root.getBoundingClientRect();
        let left = rect.left + (rect.width / 2) - (tipRect.width / 2);
        let top = rect.top - tipRect.height - 10;
        if (top < 8) top = rect.bottom + 10;
        left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
        root.style.left = left + 'px';
        root.style.top = top + 'px';
      }

      document.addEventListener('mouseover', function(e) {
        const el = e.target && e.target.closest ? e.target.closest('[data-sv-tip], .sv-tip') : null;
        if (!el || !el.getAttribute('data-sv-tip')) return;
        showTip(el);
      });
      document.addEventListener('mouseout', function(e) {
        const el = e.target && e.target.closest ? e.target.closest('[data-sv-tip], .sv-tip') : null;
        if (!el || el !== activeEl) return;
        const related = e.relatedTarget;
        if (related && el.contains(related)) return;
        hideTimer = setTimeout(hideTip, 80);
      });
      document.addEventListener('focusin', function(e) {
        const el = e.target && e.target.closest ? e.target.closest('[data-sv-tip], .sv-tip') : null;
        if (el && el.getAttribute('data-sv-tip')) showTip(el);
      });
      document.addEventListener('focusout', function() {
        hideTimer = setTimeout(hideTip, 80);
      });
      window.addEventListener('scroll', hideTip, true);
    }

    function applySvTip(el, desc, label) {
      if (!el) return;
      el.classList.add('sv-tip');
      if (desc != null) el.setAttribute('data-sv-tip', tooltipPrimitive(desc));
      if (label != null) el.setAttribute('data-sv-label', tooltipPrimitive(label));
    }
    let pairStatusFilter = 'ALL';
    let matrixCategoryFilter = 'ALL';
    let tokenSearchQuery = '';
    let cachedDisplayList = [];
    /** Hard dead-lock: max 3 pinned tokens, pinned above search/pagination */
    const MAX_PINS = 3;
    let pinnedSymbols = [];
    /** Defense 3/4 — FORCE REFRESH physical debounce lock (ms) */
    const FORCE_REFRESH_DEBOUNCE_MS = 2000;
    let lastForceRefreshAt = 0;
    let forceRefreshInFlight = false;
    /** Settlement lockdown — true when < 5 min to hourly funding */
    let settlementLockdownActive = false;
    let tsunamiShieldActive = false;
    /** Demo Switch — override global sessions into Red Alert visuals */
    let shieldDemoRedAlertActive = false;
    const SHIELD_DEMO_RED_ALERT_MSG =
      'SHIELD LOCKED (21:00-23:00) HKT - Extreme Volatility. Order execution disabled.';
    /** Demo Switch — force Settlement Lockdown visuals + execution block */
    let settlementLockdownDemoActive = false;
    const SETTLEMENT_LOCKDOWN_DEMO_MSG =
      'SETTLEMENT LOCKDOWN DEMO: NO OPEN POSITIONS';
    /** Demo Switch — persist draggable layout via localStorage */
    const LAYOUT_MEMORY_FLAG_KEY = 'santenboku_layout_memory_enabled';
    let layoutMemoryEnabled =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(LAYOUT_MEMORY_FLAG_KEY) !== '0'
        : true;
    const GRID_LAYOUT_STORAGE_KEY = 'santenboku_grid_layout';
    const TRADFI_LAYOUT_STORAGE_KEY = 'santenboku_tradfi_layout';
    const SETTLEMENT_LOCKDOWN_SEC = 300;
    const SETTLEMENT_LOCKDOWN_MSG = '[RISK LOCK] No new positions within 5 minutes of HL settlement.';
    const COMMODITY_ORDER = ['brent', 'wti', 'gold', 'silver', 'copper', 'natgas', 'platinum', 'palladium', 'aluminium', 'urnm'];
    const COMMODITY_LABELS = {
      brent: 'BRENT', wti: 'WTI', copper: 'COPPER', gold: 'GOLD', natgas: 'NATGAS', silver: 'SILVER',
      platinum: 'PLATINUM', palladium: 'PALLADIUM', aluminium: 'ALUMINIUM', urnm: 'URNM',
    };
    let cachedTradFiEnrichment = null;
    let cachedHlUniverse = [];
    let cachedTradFiSnapshots = {
      commodities: {},
      stocks: {},
      indices: {},
      fx: {},
      preipo: {},
    };

    function isExecutionDisabled() {
      return (
        settlementLockdownActive === true ||
        tsunamiShieldActive === true ||
        shieldDemoRedAlertActive === true ||
        settlementLockdownDemoActive === true
      );
    }

    function guardExecutionDisabledLink(event) {
      if (!isExecutionDisabled()) return true;
      if (event && event.preventDefault) event.preventDefault();
      if (settlementLockdownActive === true || settlementLockdownDemoActive === true) {
        addLog(settlementLockdownDemoActive ? SETTLEMENT_LOCKDOWN_DEMO_MSG : SETTLEMENT_LOCKDOWN_MSG, 'warn');
      } else {
        addLog(SHIELD_DEMO_RED_ALERT_MSG, 'warn');
      }
      return false;
    }

    function guardExecutionDisabledAction() {
      if (!isExecutionDisabled()) return false;
      if (settlementLockdownActive === true || settlementLockdownDemoActive === true) {
        addLog(settlementLockdownDemoActive ? SETTLEMENT_LOCKDOWN_DEMO_MSG : SETTLEMENT_LOCKDOWN_MSG, 'warn');
      } else {
        addLog(SHIELD_DEMO_RED_ALERT_MSG, 'warn');
      }
      return true;
    }

    function applyShieldDemoUI() {
      const box = document.getElementById('marketSessionsBox');
      const msg = document.getElementById('shieldDemoMessage');
      const stateEl = document.getElementById('hubShieldState') || document.getElementById('shieldDemoState');
      const heartbeat = document.getElementById('marketHeartbeatBar');
      const sessionLabel = document.getElementById('heartbeatSessionLabel');
      const volState = document.getElementById('heartbeatVolState');
      const circuitLabel = document.getElementById('heartbeatCircuitLabel');

      if (shieldDemoRedAlertActive) {
        if (box) {
          box.classList.remove('dex-settlement-box');
          box.style.background = '#dc2626';
        }
        if (msg) msg.classList.remove('hidden');
        if (stateEl) stateEl.innerText = 'RED';
        if (heartbeat) {
          heartbeat.classList.add('is-extreme');
          heartbeat.classList.remove('is-safe', 'is-elevated');
        }
        if (sessionLabel) sessionLabel.textContent = 'Session: SHIELD LOCK';
        if (volState) volState.textContent = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.LOCKED.label;
        if (circuitLabel) circuitLabel.textContent = 'CIRCUIT TRIGGERED';
      } else {
        if (box) {
          box.classList.add('dex-settlement-box');
          box.style.background = '';
          box.style.color = '';
          box.style.borderColor = '';
          box.style.boxShadow = '';
        }
        if (msg) msg.classList.add('hidden');
        if (stateEl) stateEl.innerText = 'NORMAL';
      }
      applyDonDonIpDisplay();
    }

    function toggleShieldDemo() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      shieldDemoRedAlertActive = !shieldDemoRedAlertActive;
      applyShieldDemoUI();
      syncDemoHubLamps();
      refreshCriAndStatusHud();
      addLog(
        shieldDemoRedAlertActive
          ? SHIELD_DEMO_RED_ALERT_MSG
          : '[RISK DEADLOCK] Normal sessions restored.',
        'warn',
      );
    }

    function applySettlementLockdownDemoUI() {
      const box = document.getElementById('dexSettlementBox');
      const demoLamp = document.getElementById('settlementDemoLamp');
      const stateEl = document.getElementById('hubSettlementState') || document.getElementById('settlementLockdownDemoState');
      if (stateEl) {
        stateEl.innerText = settlementLockdownDemoActive ? 'Lockdown' : 'Normal';
      }
      if (box) {
        if (settlementLockdownDemoActive) {
          box.classList.add('settlement-demo-locked');
        } else {
          box.classList.remove('settlement-demo-locked');
        }
      }
      if (demoLamp) {
        if (settlementLockdownDemoActive) demoLamp.classList.remove('hidden');
        else demoLamp.classList.add('hidden');
      }
    }

    function toggleSettlementLockdownDemo() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      settlementLockdownDemoActive = !settlementLockdownDemoActive;
      applySettlementLockdownDemoUI();
      syncDemoHubLamps();
      refreshCriAndStatusHud();
      updateClocks();
      addLog(
        settlementLockdownDemoActive
          ? SETTLEMENT_LOCKDOWN_DEMO_MSG
          : '[UI] Settlement Lockdown Demo OFF — countdown restored.',
        'warn',
      );
    }

    let fundingExtremeDemoActive = false;
    let gatekeeperDemoLocked = false;

    function syncDemoHubLamps() {
      const hubShield = document.getElementById('hubShieldState');
      const hubSettle = document.getElementById('hubSettlementState');
      const hubFund = document.getElementById('hubFundingExtremeState');
      const hubGate = document.getElementById('hubGatekeeperState');
      const hubDefcon = document.getElementById('hubDefcon1State');
      const hubDefconBtn = document.getElementById('hubDefcon1ToggleBtn');
      if (hubShield) hubShield.innerText = shieldDemoRedAlertActive ? 'RED' : 'NORMAL';
      if (hubSettle) hubSettle.innerText = settlementLockdownDemoActive ? 'Lockdown' : 'Normal';
      if (hubFund) hubFund.innerText = fundingExtremeDemoActive ? 'ON' : 'OFF';
      if (hubGate) hubGate.innerText = gatekeeperDemoLocked ? 'LOCKED' : 'PASS';
      const forced = window.__SV_DEMO__.forceDefcon1 === true;
      if (hubDefcon) {
        hubDefcon.innerText = forced ? 'ON' : 'OFF';
        hubDefcon.className = forced
          ? 'px-2 py-1 rounded border border-red-400 text-red-200 text-xs font-black bg-red-600/40 animate-pulse'
          : 'px-2 py-1 rounded border border-red-500/50 text-red-300 text-xs font-black hover:bg-red-500/20';
      }
      if (hubDefconBtn) {
        hubDefconBtn.innerText = forced
          ? '[ 🚨 DEFCON 1 Mode: ON — Click to Clear ]'
          : '[ 🚨 Toggle DEFCON 1 Mode ]';
      }
      syncDemoWalletTxLevelUI();
    }

    function toggleDefcon1Demo() {
      if (typeof canToggleMasterBreaker === 'function' && !canToggleMasterBreaker(demoPersonaRole)) {
        addLog('[DEMO] Master Breaker toggles locked for current persona role', 'warn');
        return;
      }
      svDemoDispatch({ type: 'DEMO_TOGGLE_FORCE_DEFCON1' });
      applyStep1EmergencyState();
      syncDemoHubLamps();
      refreshCriAndStatusHud();
      addLog(
        window.__SV_DEMO__.forceDefcon1
          ? '[DEMO] DEFCON 1 / ALL-RED Mode FORCED ON — Step 1 left panel lockdown'
          : '[DEMO] DEFCON 1 / ALL-RED Mode cleared — auto thresholds restored',
        'warn',
      );
    }

    function openDemoControlHub() {
      const backdrop = document.getElementById('demoHubBackdrop');
      if (backdrop) backdrop.classList.remove('hidden');
      syncDemoHubLamps();
      renderDemoRootToggleGrid();
      syncDemoXpUI();
      refreshCriAndStatusHud();
      renderRootTelemetry();
    }

    function closeDemoControlHub(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      const backdrop = document.getElementById('demoHubBackdrop');
      if (backdrop) backdrop.classList.add('hidden');
    }

    function toggleFundingExtremeDemo() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      fundingExtremeDemoActive = !fundingExtremeDemoActive;
      const bar = document.getElementById('fundingRateKingsBar');
      if (bar) {
        if (fundingExtremeDemoActive) bar.classList.add('funding-extreme-demo');
        else bar.classList.remove('funding-extreme-demo');
      }
      syncDemoHubLamps();
      addLog(
        fundingExtremeDemoActive
          ? '[DEMO] Funding Extreme simulation ON — world-tree board highlighted'
          : '[DEMO] Funding Extreme simulation OFF',
        'warn',
      );
    }

    function toggleGatekeeperDemo() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      gatekeeperDemoLocked = !gatekeeperDemoLocked;
      syncDemoHubLamps();
      refreshCriAndStatusHud();
      if (gatekeeperDemoLocked) {
        addLog('[DEMO] Gatekeeper LOCKED simulation — valid ref still required on refresh', 'warn');
        if (!document.getElementById('gatekeeperDemoBanner')) {
          document.body.insertAdjacentHTML(
            'afterbegin',
            '<div id="gatekeeperDemoBanner" class="mb-3 p-3 rounded-xl text-center font-black" style="background:#0b1217;border:2px solid #50D2C1;color:#50D2C1;">🔐 Gatekeeper Demo LOCKED · Use Demo Hub to restore PASS</div>',
          );
        }
      } else {
        const banner = document.getElementById('gatekeeperDemoBanner');
        if (banner) banner.remove();
        addLog('[DEMO] Gatekeeper PASS restored', 'info');
      }
    }

    function toggleFundingRiskGuide() {
      const pop = document.getElementById('fundingRiskGuidePopover');
      if (!pop) return;
      pop.classList.toggle('hidden');
    }

    function toggleLayoutMemory() {
      layoutMemoryEnabled = !layoutMemoryEnabled;
      try {
        sessionStorage.setItem(
          LAYOUT_MEMORY_FLAG_KEY,
          layoutMemoryEnabled ? '1' : '0',
        );
      } catch (e) {
        // ignore
      }
      const lamp = document.getElementById('layoutMemoryLamp');
      const state = document.getElementById('layoutMemoryState');
      if (layoutMemoryEnabled) {
        if (lamp) lamp.className = 'inline-block w-2.5 h-2.5 rounded-full bg-emerald-400';
        if (state) state.innerText = 'ON';
        const order = loadStoredGridLayoutOrder();
        if (order) applyGridLayoutOrder(order);
        const tradfiOrder = loadStoredTradFiLayoutOrder();
        if (tradfiOrder) applyTradFiLayoutOrder(tradfiOrder);
        addLog('[UI] Layout Memory ON — grid layout persistence enabled.', 'info');
      } else {
        if (lamp) lamp.className = 'inline-block w-2.5 h-2.5 rounded-full bg-gray-500';
        if (state) state.innerText = 'OFF';
        addLog('[UI] Layout Memory OFF — localStorage write/read paused.', 'info');
      }
    }

    function applyGridLayoutOrder(orderIds) {
      if (!Array.isArray(orderIds) || orderIds.length === 0) return;
      const grid = document.getElementById('draggableGrid');
      if (!grid) return;
      for (let i = 0; i < orderIds.length; i++) {
        const el = document.getElementById(orderIds[i]);
        if (el) el.style.order = String(i + 1);
      }
    }

    function loadStoredGridLayoutOrder() {
      if (!layoutMemoryEnabled) return null;
      try {
        const raw = localStorage.getItem(GRID_LAYOUT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed;
      } catch (e) {
        return null;
      }
    }

    function persistGridLayoutOrder() {
      if (!layoutMemoryEnabled) return;
      try {
        const blocks = Array.from(
          document.querySelectorAll('#draggableGrid .draggable'),
        );
        const ordered = blocks
          .slice()
          .sort(
            (a, b) => parseInt(a.style.order || '0', 10) - parseInt(b.style.order || '0', 10),
          );
        const ids = ordered.map((x) => x.id);
        localStorage.setItem(GRID_LAYOUT_STORAGE_KEY, JSON.stringify(ids));
      } catch (e) {
        // ignore
      }
    }

    function applyTradFiLayoutOrder(orderIds) {
      if (!Array.isArray(orderIds) || orderIds.length === 0) return;
      for (let i = 0; i < orderIds.length; i++) {
        const el = document.getElementById(orderIds[i]);
        if (el) el.style.order = String(i + 1);
      }
    }

    function loadStoredTradFiLayoutOrder() {
      if (!layoutMemoryEnabled) return null;
      try {
        const raw = localStorage.getItem(TRADFI_LAYOUT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed;
      } catch (e) {
        return null;
      }
    }

    function persistTradFiLayoutOrder() {
      if (!layoutMemoryEnabled) return;
      try {
        const blocks = Array.from(
          document.querySelectorAll('#tradFiPanel .tradfi-draggable'),
        );
        const ordered = blocks
          .slice()
          .sort(
            (a, b) => parseInt(a.style.order || '0', 10) - parseInt(b.style.order || '0', 10),
          );
        const ids = ordered.map((x) => x.id);
        localStorage.setItem(TRADFI_LAYOUT_STORAGE_KEY, JSON.stringify(ids));
      } catch (e) {
        // ignore
      }
    }

    /** Defense 16 — serenity-style humanized console (never dump raw SQL/API) */
    function humanizeConsoleMessage(raw) {
      const line = String(raw == null ? '' : raw).trim();
      if (!line) return '';
      const upper = line.toUpperCase();
      if (/CROSS_VENUE_SLIPPAGE|SPOT_PERP_SLIPPAGE|SOIL_RESISTANCE_TRIP|SPREAD_TOO_HIGH|價差過大|SOIL RESISTANCE CIRCUIT/.test(upper) || /SOIL RESISTANCE CIRCUIT BREAKER TRIPPED/i.test(line)) {
        return '[RISK ALERT] Spot/perp spread too wide — Santenboku defense matrix blocked entry';
      }
      if (/ROOT_PROTECTION_TRIP|MAX.?SL|RISKLIMITEXCEEDED/i.test(line)) {
        return '[RISK ALERT] Estimated loss near root stop-loss ceiling — entry locked to prevent liquidation';
      }
      if (/DEPTH_USD|MINDEPTH|流動性不足/i.test(line)) {
        return '[RISK ALERT] Insufficient book depth — soil resistance rejected entry';
      }
      if (/RPC_NODE_NOT_ALLOWLISTED|NOT ON ALLOWLIST/i.test(line)) {
        return '[RISK ALERT] Unauthorized RPC node request intercepted (whitelist nodes only)';
      }
      if (/PIN LOCK|PINNED.*MAX|FOMO|置頂.*上限|風控死鎖/i.test(line)) {
        return '[RISK DEADLOCK] Pin limit is 3 core watchlist symbols to prevent over-trading and emotional FOMO.';
      }
      if (/結算前 5 分鐘禁止開倉|SETTLEMENT LOCKDOWN/i.test(line)) {
        return SETTLEMENT_LOCKDOWN_MSG;
      }
      if (/TSUNAMI_SHIELD|海嘯期|SHIELD LOCKED/i.test(line)) {
        return '[RISK DEADLOCK] Tsunami window HKT 21:00–23:00 · Soil Resistance locked execution.';
      }
      if (/ALLMIDS.*FAILED|HL META.*FAILED|NETWORK ERROR|FETCH FAILED/i.test(line)) {
        return '[SYSTEM] Market node busy — Santenboku retrying sync. Please FORCE REFRESH shortly.';
      }
      if (/SQL(STATE|EXCEPTION|ERROR)|SQLITE|POSTGRES|MYSQL|PRAGMA/i.test(line)) {
        return '[SYSTEM] Internal data validation failed — safe degraded mode active.';
      }
      if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|HTTP\s*[45]\d\d|STATUS\s*[45]\d\d/i.test(line)) {
        return '[SYSTEM] External market feed interrupted — defense matrix on standby.';
      }
      if (/STACK TRACE|TYPEERROR:|REFERENCEERROR:/i.test(line)) {
        return '[SYSTEM] Engine self-check triggered protection — anomaly isolated.';
      }
      if (line.indexOf('[風控') === 0) return '[RISK CONTROL] ' + line.slice(line.indexOf(']') + 1).trim();
      if (line.indexOf('[系統') === 0) return '[SYSTEM] ' + line.slice(line.indexOf(']') + 1).trim();
      if (line.indexOf('[TRADFI]') === 0 || line.indexOf('[allMids]') === 0 || line.indexOf('[HL') === 0 || line.indexOf('[API]') === 0 || line.indexOf('[BUNDLE]') === 0 || line.indexOf('[PIPELINE]') === 0 || line.indexOf('[SYSTEM]') === 0) {
        return line;
      }
      if (/[{}\[\]]/.test(line) && /error|exception|failed/i.test(line)) {
        return '[SYSTEM] Sync fluctuation detected — self-heal complete. Check latest panel quotes.';
      }
      return line;
    }

    /**
     * Weld frontend Tab filters to backend actionStatus:
     * OPEN = Rule A green SOP directions
     * HOLD = 🟡 靜觀其變
     * SPREAD = 🛑 soil / spread breaker
     * DEFICIT = 🚨 funding inversion / Rule B high-rate risk
     */
    function resolvePairStatusKey(status, riskTripped, passedRule) {
      if (status === 'RULE_B_HIGH_RATE' || passedRule === 'B') return 'DEFICIT';
      if (riskTripped === true) return 'SPREAD';
      if (status === 'SPREAD_TOO_HIGH' || status === 'SPREAD') return 'SPREAD';
      if (status === 'SHORT_HL_SPOT_LONG_HL_PERP' || status === 'DEFICIT') return 'DEFICIT';
      if (status === 'HOLD') return 'HOLD';
      if (
        status === 'BUY_HL_SPOT_SHORT_HL_PERP' ||
        status === 'OPEN'
      ) {
        return 'OPEN';
      }
      return 'HOLD';
    }

    function onTokenSearchInput() {
      const el = document.getElementById('tokenSearchInput');
      tokenSearchQuery = el && el.value ? String(el.value).trim().toUpperCase() : '';
      currentPage = 1;
      recalculate();
    }

    function isSettlementLockdown() {
      return settlementLockdownActive === true;
    }

    function guardSettlementLockdown() {
      if (isTsunamiShieldActive() && guardTsunamiShield()) return true;
      if (!isSettlementLockdown()) return false;
      addLog(SETTLEMENT_LOCKDOWN_MSG, 'warn');
      return true;
    }

    function isTsunamiShieldActive() {
      return tsunamiShieldActive === true;
    }

    function guardTsunamiShield() {
      if (!isTsunamiShieldActive()) return false;
      addLog('[RISK DEADLOCK] Tsunami window HKT 21:00–23:00 · Soil Resistance locked execution.', 'warn');
      return true;
    }

    function getHktHour(now) {
      now = now || new Date();
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Hong_Kong',
        hour: 'numeric',
        hour12: false
      }).formatToParts(now);
      const hourPart = parts.find(function(p) { return p.type === 'hour'; });
      return parseInt(hourPart && hourPart.value ? hourPart.value : '0', 10);
    }

    function guardSettlementLockdownLink(event) {
      return guardExecutionDisabledLink(event);
    }

    function handleActionCellClick(statusKey) {
      if (statusKey === 'OPEN' && guardExecutionDisabledAction()) return false;
      return true;
    }

    function setPairStatusFilter(status) {
      if (status === 'OPEN' && guardExecutionDisabledAction()) return;
      pairStatusFilter = status || 'ALL';
      currentPage = 1;
      const buttons = document.querySelectorAll('.pair-status-btn');
      buttons.forEach(function(btn) {
        const active = btn.getAttribute('data-status') === pairStatusFilter;
        if (active) {
          btn.className = 'pair-status-btn px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit font-bold';
        } else {
          btn.className = 'pair-status-btn px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 font-bold hover:bg-white/10';
        }
      });
      recalculate();
    }

    function setMatrixCategoryFilter(category) {
      matrixCategoryFilter = category || 'ALL';
      currentPage = 1;
      document.querySelectorAll('.matrix-category-btn').forEach(function(btn) {
        const active = btn.getAttribute('data-category') === matrixCategoryFilter;
        btn.classList.toggle('active', active);
        if (active) {
          btn.className = 'matrix-category-btn active typo-action px-2.5 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit font-bold';
        } else {
          btn.className = 'matrix-category-btn typo-action px-2.5 py-1 rounded border border-white/10 bg-black/30 text-gray-300 font-bold hover:bg-white/10';
        }
      });
      recalculate();
    }

    function isPinned(symbol) {
      return pinnedSymbols.indexOf(String(symbol).toUpperCase()) >= 0;
    }

    function togglePin(symbol) {
      if (guardSettlementLockdown()) return;
      const sym = String(symbol || '').toUpperCase();
      if (!sym) return;
      const idx = pinnedSymbols.indexOf(sym);
      if (idx >= 0) {
        pinnedSymbols.splice(idx, 1);
        addLog('FAVORITE OFF: ' + sym + ' (' + pinnedSymbols.length + '/' + MAX_PINS + ')', 'info');
        recalculate();
        return;
      }
      if (pinnedSymbols.length >= MAX_PINS) {
        console.warn('[RISK DEADLOCK] Pin limit is 3 core watchlist symbols to prevent over-trading and emotional FOMO.');
        addLog('[RISK DEADLOCK] Pin limit is 3 core watchlist symbols to prevent over-trading and emotional FOMO.', 'warn');
        return;
      }
      pinnedSymbols.push(sym);
      addLog('FAVORITE ON: ' + sym + ' (' + pinnedSymbols.length + '/' + MAX_PINS + ')', 'success');
      recalculate();
    }

    const BRAND_FAVICON_SRC = '/brand/favicon.webp';
    function brandShieldImg(cls, size) {
      const s = size || 16;
      const c = cls || 'brand-shield-icon';
      return '<img src="' + BRAND_FAVICON_SRC + '" alt="" class="' + c + '" width="' + s + '" height="' + s + '" decoding="async" />';
    }

    function isSlippageLocked(row) {
      if (!row) return true;
      if (row.risk_tripped === true) return true;
      if (row.pairStatusKey === 'SPREAD') return true;
      if (row.actionStatus === 'SPREAD_TOO_HIGH') return true;
      return false;
    }

    function buildSoilResistanceHtml(row) {
      const locked = isSlippageLocked(row);
      const ready = STATUS_DICTIONARY.SLIPPAGE_ALERT.ATTACK_READY;
      const trip = STATUS_DICTIONARY.SLIPPAGE_ALERT.CIRCUIT_BREAKER;
      if (locked) {
        return '<div class="soil-shield soil-shield-trip sv-tip" data-sv-tip="' + escapeTooltipHtml(trip.desc) + '" data-sv-label="' + escapeTooltipHtml(trip.label) + '" title="' + escapeTooltipHtml(trip.desc) + '">' +
          brandShieldImg('soil-circuit-shield-icon', 16) +
          '<span class="font-black text-[11px]" style="color:' + trip.color + '">' + trip.label + '</span>' +
        '</div>';
      }
      return '<span class="soil-shield soil-shield-ok sv-tip" style="color:' + ready.color + '" data-sv-tip="' + escapeTooltipHtml(ready.desc) + '" data-sv-label="' + escapeTooltipHtml(ready.label) + '" title="' + escapeTooltipHtml(ready.desc) + '">🟢 ' + ready.label + '</span>';
    }

    function pickRecommendedRow(rows) {
      const eligible = (rows || []).filter(function(row) {
        return row && row.b1_symbol && row.passedRule === 'A' && !isSlippageLocked(row);
      });
      if (eligible.length === 0) return null;
      let best = eligible[0];
      for (let i = 1; i < eligible.length; i++) {
        const row = eligible[i];
        if ((row.i1_annual_cross || 0) > (best.i1_annual_cross || 0)) {
          best = row;
        }
      }
      return best;
    }

    /** Ranked Rule A hedges by APR (bestHedgeList[0] = #1 recommendation). */
    function buildBestHedgeList(rows) {
      return (rows || [])
        .filter(function(row) {
          return row && row.b1_symbol && row.passedRule === 'A' && !isSlippageLocked(row);
        })
        .slice()
        .sort(function(a, b) {
          return (b.i1_annual_cross || 0) - (a.i1_annual_cross || 0);
        });
    }

    /** Resolve CASHCAT vs REVERSE_CASHCAT from row strategyType / actionStatus / funding. */
    function resolveStrategyType(row) {
      if (!row) return 'CASHCAT';
      const typed = String(row.strategyType || '').toUpperCase();
      if (typed === 'CASHCAT' || typed === 'REVERSE_CASHCAT') return typed;
      const action = String(row.actionStatus || '');
      if (action === 'SHORT_HL_SPOT_LONG_HL_PERP') return 'REVERSE_CASHCAT';
      if (action === 'BUY_HL_SPOT_SHORT_HL_PERP') return 'CASHCAT';
      const fr = parseFloat(row.e1_hl_funding);
      if (Number.isFinite(fr) && fr < 0) return 'REVERSE_CASHCAT';
      return 'CASHCAT';
    }

    function getStrategyEntry(strategyType) {
      const key = strategyType === 'REVERSE_CASHCAT' ? 'REVERSE_CASHCAT' : 'CASHCAT';
      return STRATEGY_DICTIONARY[key] || STRATEGY_DICTIONARY.CASHCAT;
    }

    function renderBestHedgeStrategyTag(row) {
      const bestActionEl = document.getElementById('bestPairAction');
      if (!bestActionEl) return;
      if (!row) {
        bestActionEl.className = 'best-pair-action-tag sv-tip is-empty';
        bestActionEl.style.color = '';
        bestActionEl.textContent = 'No eligible hedge';
        applySvTip(bestActionEl, STATUS_DICTIONARY.SLIPPAGE_ALERT.CIRCUIT_BREAKER.desc, 'No Eligible Hedge');
        return;
      }
      const strategyType = resolveStrategyType(row);
      const rec = getStrategyEntry(strategyType);
      const tipBody = rec.actionText + ' — ' + rec.tooltip;
      const tone = strategyType === 'REVERSE_CASHCAT' ? 'is-reverse' : 'is-cashcat';
      // Single-layer badge only — never nest another .best-pair-action-tag inside.
      bestActionEl.className = 'best-pair-action-tag sv-tip ' + tone;
      bestActionEl.style.color = '';
      bestActionEl.textContent = rec.label;
      applySvTip(bestActionEl, tipBody, rec.actionText);
    }

    function effectivePageSize(totalFiltered) {
      if (pageSize === Infinity || pageSize <= 0) return Math.max(1, totalFiltered || 1);
      return pageSize;
    }

    function goToPage(page) {
      const size = effectivePageSize(cachedDisplayList.length);
      const totalPages = Math.max(1, Math.ceil(cachedDisplayList.length / size) || 1);
      currentPage = Math.min(Math.max(1, page), totalPages);
      recalculate();
    }

    function goToPrevPage() {
      goToPage(currentPage - 1);
    }

    function goToNextPage() {
      goToPage(currentPage + 1);
    }

    function setPageSize(size) {
      if (size === 'all' || size === 'All' || size === Infinity) {
        pageSize = Infinity;
      } else {
        const n = parseInt(size, 10);
        pageSize = (n === 5 || n === 10 || n === 20) ? n : 10;
      }
      currentPage = 1;
      document.querySelectorAll('.matrix-page-size-btn').forEach(function(btn) {
        const key = btn.getAttribute('data-page-size');
        const active = (pageSize === Infinity && key === 'all') || String(pageSize) === key;
        btn.classList.toggle('active', active);
        if (active) {
          btn.className = 'matrix-page-size-btn active typo-action px-2 py-1 rounded border border-circuit/40 bg-circuit/20 text-circuit';
        } else {
          btn.className = 'matrix-page-size-btn typo-action px-2 py-1 rounded border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10';
        }
      });
      recalculate();
    }

    function updatePaginationControls(totalFiltered) {
      const size = effectivePageSize(totalFiltered);
      const totalPages = Math.max(1, Math.ceil(totalFiltered / size) || 1);
      if (currentPage > totalPages) currentPage = totalPages;
      const infoText = 'Page ' + currentPage + ' / ' + totalPages + ' · ' + totalFiltered + ' rows';
      document.querySelectorAll('.pagination-info').forEach(function(info) {
        info.innerText = infoText;
      });
      document.querySelectorAll('.page-prev-btn').forEach(function(prevBtn) {
        if (currentPage <= 1) prevBtn.setAttribute('disabled', 'true');
        else prevBtn.removeAttribute('disabled');
      });
      document.querySelectorAll('.page-next-btn').forEach(function(nextBtn) {
        if (currentPage >= totalPages) nextBtn.setAttribute('disabled', 'true');
        else nextBtn.removeAttribute('disabled');
      });
    }

    // SOP 四動作色系 + 風控狀態融合（阻斷態隱藏方向，建議開倉保留 SOP 指引）
    function getSopDirection(status) {
      const s = status || 'HOLD';
      if (s === 'BUY_HL_SPOT_SHORT_HL_PERP') {
        return {
          bg: "bg-amber-500/15",
          text: "text-amber-400",
          border: "border-amber-500/30",
          direction: "📈 Buy HL Spot + 📉 Short HL Perp"
        };
      }
      if (s === 'SHORT_HL_SPOT_LONG_HL_PERP') {
        return {
          bg: "bg-blue-500/15",
          text: "text-blue-400",
          border: "border-blue-500/30",
          direction: "📉 Short HL Spot + 📈 Long HL Perp"
        };
      }
      return null;
    }

    function getActionStyle(status, riskTripped, passedRule) {
      const s = status || 'HOLD';
      if (s === 'RULE_B_HIGH_RATE' || passedRule === 'B') {
        return {
          bg: "bg-orange-600/25",
          text: "text-orange-300",
          border: "border-orange-400/50",
          label: "[ Rule B: High Rate Risk ]",
          statusKey: "DEFICIT"
        };
      }
      const statusKey = resolvePairStatusKey(s, riskTripped, passedRule);

      // 🔴 滑價斷路：隱藏具體方向，防誤操作
      if (statusKey === 'SPREAD' || s === 'SPREAD_TOO_HIGH') {
        return {
          bg: "bg-red-900/40",
          text: "text-red-300",
          border: "border-red-500/50",
          label: "🔴【 🛑 SLIPPAGE BREAKER LOCKED 】",
          statusKey: "SPREAD"
        };
      }

      // 🔵 逆差 / Rule B 極端費率阻斷
      if (statusKey === 'DEFICIT' || s === 'SHORT_HL_SPOT_LONG_HL_PERP') {
        return {
          bg: "bg-blue-600/25",
          text: "text-blue-300",
          border: "border-blue-400/50",
          label: "🔵【 🚨 INVERSE RISK: FUNDING INVERSION BLOCK 】",
          statusKey: "DEFICIT"
        };
      }

      // 🟡 靜觀其變
      if (statusKey === 'HOLD' || s === 'HOLD') {
        return {
          bg: "bg-gray-500/15",
          text: "text-gray-400",
          border: "border-gray-500/30",
          label: "🟡【 💤 HOLD / WATCH 】",
          statusKey: "HOLD"
        };
      }

      // 🟢 建議開倉：風控徽章 + SOP 動作方向（保留原色系）
      const sop = getSopDirection(s);
      if (sop) {
        return {
          bg: sop.bg,
          text: sop.text,
          border: sop.border,
          label: "🟢【 ⚡ SUGGEST ENTRY 】 " + sop.direction,
          statusKey: "OPEN"
        };
      }

      return {
        bg: "bg-gray-500/15",
        text: "text-gray-400",
        border: "border-gray-500/30",
        label: "🟡【 💤 HOLD / WATCH 】",
        statusKey: "HOLD"
      };
    }

    function getSymbolEmoji(symbol) {
      if (!symbol) return '🪙';
      const sym = symbol.toUpperCase();
      if (sym.includes('BTC')) return '🟠';
      if (sym.includes('ETH')) return '🔵';
      if (sym.includes('SOL')) return '🟣';
      if (sym.includes('LINK')) return '🟢';
      if (sym.includes('BNB')) return '🟡';
      if (sym.includes('ADA')) return '🔵';
      if (sym.includes('XRP')) return '⚫';
      if (sym.includes('SUI')) return '💧';
      if (sym.includes('AVAX')) return '🔴';
      return '🪙';
    }

    function adjustFontSize(delta) {
      currentFontSizeRem += delta;
      if (currentFontSizeRem < 0.8) currentFontSizeRem = 0.8;
      if (currentFontSizeRem > 1.8) currentFontSizeRem = 1.8;
      document.documentElement.style.setProperty('--base-font-size', currentFontSizeRem + 'rem');
      addLog("UI Font Size Adjusted to: " + currentFontSizeRem.toFixed(3) + "rem", "info");
    }

    function secondsToNextHour(now) {
      const nextHour = new Date(now.getTime());
      nextHour.setMinutes(0, 0, 0);
      nextHour.setHours(now.getHours() + 1);
      return Math.max(0, Math.floor((nextHour.getTime() - now.getTime()) / 1000));
    }

    /** Macro Radar Phase 1 calendar (UTC → HKT countdown) */
    const US_MACRO_EVENTS = [
      { id: 'macroFomcCountdown', label: 'US FED FOMC', dates: ['2026-07-29T18:00:00Z', '2026-09-16T18:00:00Z', '2026-11-04T19:00:00Z', '2026-12-16T19:00:00Z'] },
      { id: 'macroCpiCountdown', label: 'US CPI', dates: ['2026-08-12T12:30:00Z', '2026-09-11T12:30:00Z', '2026-10-14T12:30:00Z'] },
      { id: 'macroEcbCountdown', label: 'EU ECB', dates: ['2026-09-11T12:15:00Z', '2026-10-30T12:15:00Z', '2026-12-18T13:15:00Z'] },
      { id: 'macroBojCountdown', label: 'Asia BOJ', dates: ['2026-09-19T03:00:00Z', '2026-10-31T03:00:00Z', '2026-12-19T03:00:00Z'] },
    ];

    /**
     * Phase 2 reserved shape — Polymarket prediction markets.
     * @typedef {{ marketId: string, question: string, yesPrice?: number, volumeUsd?: number, endDateIso?: string, sourceUrl?: string, tags?: string[] }} PredictionMarketData
     */
    /** @type {PredictionMarketData[]|null} */
    let predictionMarketCache = null;
    void predictionMarketCache;

    function formatMacroCountdown(ms) {
      if (ms <= 0) return 'LIVE / RELEASED';
      const totalSec = Math.floor(ms / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      if (days > 0) return days + 'd ' + hours + 'h';
      if (hours > 0) return hours + 'h ' + mins + 'm';
      return mins + 'm';
    }

    function nextMacroDate(dates, now) {
      const t = now.getTime();
      for (let i = 0; i < dates.length; i++) {
        const d = new Date(dates[i]).getTime();
        if (d + 2 * 3600 * 1000 > t) return d;
      }
      return new Date(dates[dates.length - 1]).getTime();
    }

    /** Macro blocking window: LIVE or within 6h before release */
    const MACRO_BLOCK_MS = 6 * 3600 * 1000;
    let lastVixValue = 16.8;
    let lastDvolValue = 38.0;
    let lastHeatScore = 29.52;
    let lastHeatState = 'safe'; // safe | elevated | extreme
    let isMacroBlocking = false;
    let cachedBestHedgeRow = null;
    /** Ranked eligible hedges by APR — [0] is the live #1 recommendation */
    let bestHedgeList = [];
    let cachedSpotlight = {
      key: 'CASHCAT',
      pair: 'CASHCAT-USDC',
      markPrice: 0.0834,
      change24h_pct: -26.10,
      fundingRate8h_pct: 0.1675,
      fundingRateHourly: 0.1675 / 800,
      openInterestNotionalUsd: 5e6,
      displayName: 'CASHCAT',
      hlSymbol: 'CASHCAT',
    };
    function computeIsMacroBlocking(now) {
      now = now || new Date();
      const t = now.getTime();
      for (let i = 0; i < US_MACRO_EVENTS.length; i++) {
        const target = nextMacroDate(US_MACRO_EVENTS[i].dates, now);
        const ms = target - t;
        if (ms <= MACRO_BLOCK_MS) return true;
      }
      return false;
    }

    function applyStep1EmergencyState() {
      const vix = lastVixValue;
      const dvol = lastDvolValue;
      const isEmergencyState =
        window.__SV_DEMO__.forceDefcon1 || (vix > 20 || dvol > 55 || isMacroBlocking);
      const panel = document.getElementById('step1MacroSentimentTree') || document.getElementById('step1ColLeft');
      const banner = document.getElementById('step1AllRedBanner');
      if (!panel && !banner) return;
      if (isEmergencyState) {
        if (panel) {
          panel.classList.add(
            'all-red-mode',
            'bg-red-950/90',
            'border-2',
            'border-red-500',
            'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
          );
        }
        if (banner) {
          banner.classList.remove('hidden');
          banner.textContent =
            '🚨 DEFCON 1: ALL-RED RISK ALERT (MACRO / HIGH VOLATILITY LOCKDOWN)';
        }
      } else {
        if (panel) {
          panel.classList.remove(
            'all-red-mode',
            'bg-red-950/90',
            'border-2',
            'border-red-500',
            'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
          );
        }
        if (banner) banner.classList.add('hidden');
      }
      refreshGatekeeperDefenseMatrix();
    }

    function updateUsMacroCountdowns(now) {
      now = now || new Date();
      US_MACRO_EVENTS.forEach(function(ev) {
        const el = document.getElementById(ev.id);
        if (!el) return;
        const target = nextMacroDate(ev.dates, now);
        el.textContent = formatMacroCountdown(target - now.getTime());
      });
      isMacroBlocking = computeIsMacroBlocking(now);
      applyStep1EmergencyState();
    }

    let connectedWalletAddress = '';
    /** Mock Hyperliquid withdrawable collateral (USD) — 0 until wallet connects */
    let withdrawableCollateralUsd = 0;
    /** Account capital (editable) — capped by live Vault balance */
    let capitalUsd = 25000;
    /** Active trade mode: SHIELD | TACTICAL | FLASH */
    let tradeMode = 'SHIELD';
    /** HL wallet historical fill / TX count for 3-Role eligibility */
    let hlWalletTxCount = 0;
    let roleEligibility = {
      walletAddress: '',
      txCount: 0,
      allowedModes: ['SHIELD'],
      maxMode: 'SHIELD',
      reasons: {
        TACTICAL: ROLE_LOCK_TIPS.TACTICAL,
        FLASH: ROLE_LOCK_TIPS.FLASH,
      },
      root1HardWeld: true,
      effectiveMaxSlUsd: computeEffectiveMaxSlUsd(DEFAULT_ACCOUNT_EQUITY_USD),
      root8SlippageMax: 0.005,
    };
    const FLASH_HARD_LOCKS = { maxSlippage: 0.005 };
    /** Open positions for Live Ops + header vault */
    let openPositions = [];
    let nextPositionId = 1;
    let settledPnlUsd = 0;
    const POST_TRADE_REVIEW_KV_KEY = 'silvervine_post_trade_reviews_v1';
    /** Demo / live Root 17 Choice A UTC-day tracker */
    let root17DailyState = createRoot17DailyState();
    /** Demo hub — per-root status overrides (rootNum -> PASS | WARN | TRIPPED) */
    window.devRootStatus = window.devRootStatus || {};
    /** Demo persona role */
    let demoPersonaRole = 'TRADER';

    function canMutateDemoRiskControls() {
      return typeof canEditRiskPresets === 'function'
        ? canEditRiskPresets(demoPersonaRole)
        : demoPersonaRole === 'RISK_MANAGER';
    }
    let toxicModeCooldownUntil = 0;
    let toxicModeModalShown = false;
    /** RPG XP for GROWTH HUD + tier display */
    let demoUserXp = 0;
    let growthHudTimer = null;
    let lastDemoXp = 0;
    /** DonDon IP transient animation state (Priority 2) */
    let dondonTransientKind = null;
    let dondonTransientTimer = null;

    const DONDON_IP = {
      NORMAL: { asset: '/brand/dondon_normal.png', scale: 1.0, glow: '#00FFA3', badge: 'ちリブ', cssClass: 'dondon-state-normal' },
      LEVEL_UP: { asset: '/brand/dondon_levelup.png', scale: 1.2, glow: '#00F0FF', badge: 'ちリブ (+EXP)', cssClass: 'dondon-state-levelup' },
      WARNING: { asset: '/brand/dondon_warning.png', scale: 1.4, glow: '#FFD700', badge: '警 告', cssClass: 'dondon-state-warning' },
      SHIELD: { asset: '/brand/dondon_defense.png', scale: 1.6, glow: '#00E676', badge: '防 御', cssClass: 'dondon-state-shield' },
      HARD_LOCK: { asset: '/brand/dondon_deadlock.png', scale: 2.0, glow: '#FF0033', badge: '死 鎖', cssClass: 'dondon-state-hardlock' },
      GOD_MODE: { asset: '/brand/dondon_godmode.png', scale: 2.5, glow: '#FFD700', badge: '三天目', cssClass: 'dondon-state-godmode' },
      ORANGE_TARGET: { asset: '/brand/dondon_orangetarget.png', scale: 1.0, glow: '#FF8C00', badge: 'TARGET LOCK', cssClass: 'dondon-state-orangetarget' },
    };

    function recomputeRootDefenseMatrixState() {
      const statuses = collectRootStatusesForCri();
      const score = calculateRootDefenseMatrixFromStatuses(statuses);
      const hardlock = score <= 0;
      const equity = resolveAccountEquityUsd();
      const dynamicMaxSL = computeEffectiveMaxSlUsd(equity);
      if (typeof applySystemState === 'function') {
        applySystemState({
          accountBalanceUsd: equity,
          currentCri: score,
          dynamicMaxSL: dynamicMaxSL,
          hudState: typeof resolveHudStateClient === 'function'
            ? resolveHudStateClient(score, hardlock, true)
            : systemState.hudState,
          hardlock: hardlock,
          signingChannelOpen: !hardlock,
        });
      }
      return score;
    }

    function getRootDefenseMatrixScore() {
      const cri = Number(systemState.currentCri);
      return Math.max(0, Math.min(100, Number.isFinite(cri) ? Math.round(cri) : 0));
    }

    function getToxicityRiskScore() {
      return Math.max(0, Math.min(100, 100 - getRootDefenseMatrixScore()));
    }

    function resolveRootDefenseMatrixFillColor(score) {
      const s = Number.isFinite(score) ? score : 0;
      if (s >= 80) return '#34d399';
      if (s >= 50) return '#fbbf24';
      return '#f87171';
    }

    function applyRootDefenseMatrixBarFill(el, score) {
      if (!el) return;
      const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
      el.style.width = s + '%';
      el.style.background = resolveRootDefenseMatrixFillColor(s);
    }

    function getEffectiveRiskScore() {
      return getToxicityRiskScore();
    }

    function clearDonDonTransient() {
      dondonTransientKind = null;
      if (dondonTransientTimer) {
        clearTimeout(dondonTransientTimer);
        dondonTransientTimer = null;
      }
    }

    function resolveDonDonBaseState(riskScore) {
      if (window.__SV_DEMO__.forceDefcon1 === true) return 'GOD_MODE';
      if (isToxicModeTripped(riskScore)) return 'HARD_LOCK';
      if (shieldDemoRedAlertActive || tsunamiShieldActive) return 'SHIELD';
      if (riskScore >= TOXICITY_ELEVATED_THRESHOLD) return 'WARNING';
      return 'NORMAL';
    }

    function applyDonDonIpDisplay(forceState) {
      const avatar = document.getElementById('bestHedgeDonDonAvatar');
      const badge = document.getElementById('dondonIpBadge');
      const frame = document.getElementById('dondonIpFrame');
      if (!avatar) return;

      const riskScore = getEffectiveRiskScore();
      let stateKey = forceState || resolveDonDonBaseState(riskScore);

      if (isToxicModeTripped(riskScore) && window.__SV_DEMO__.forceDefcon1 !== true) {
        stateKey = 'HARD_LOCK';
        clearDonDonTransient();
      } else if (!forceState && dondonTransientKind) {
        stateKey = dondonTransientKind;
      }

      const cfg = DONDON_IP[stateKey] || DONDON_IP.NORMAL;
      avatar.src = cfg.asset;
      avatar.alt = 'DonDon IP — ' + String(stateKey).replace(/_/g, ' ');
      Object.keys(DONDON_IP).forEach(function(k) {
        avatar.classList.remove(DONDON_IP[k].cssClass);
      });
      avatar.classList.add(cfg.cssClass);
      var compactFrame = frame && frame.classList.contains('dondon-ip-frame--compact');
      avatar.style.setProperty('--dondon-scale', compactFrame ? '1' : String(cfg.scale));
      avatar.style.setProperty('--dondon-glow', cfg.glow);
      avatar.classList.toggle('dondon-avatar-toxic', stateKey === 'HARD_LOCK');
      if (badge) badge.textContent = cfg.badge;
      if (frame) frame.dataset.dondonState = stateKey;
    }

    function triggerDonDonTransient(kind, durationMs) {
      if (isToxicModeTripped(getEffectiveRiskScore())) return;
      clearDonDonTransient();
      dondonTransientKind = kind;
      applyDonDonIpDisplay();
      dondonTransientTimer = setTimeout(function() {
        dondonTransientKind = null;
        dondonTransientTimer = null;
        applyDonDonIpDisplay();
      }, durationMs || 1750);
    }

    function triggerDonDonOrangeTarget() {
      triggerDonDonTransient('ORANGE_TARGET', 1750);
    }

    function triggerDonDonLevelUp() {
      triggerDonDonTransient('LEVEL_UP', 1750);
    }

    function applyDonDonAvatarForRisk(riskScore) {
      applyDonDonIpDisplay();
    }

    function appendStep1CondensedLog(msg, type) {
      const bar = document.getElementById('step1CondensedLog');
      if (!bar) return;
      const line = document.createElement('div');
      line.className = 'step1-condensed-log-line' +
        (type === 'warn' ? ' log-warn' : type === 'error' ? ' log-err' : ' log-ok');
      const time = new Date().toLocaleTimeString();
      line.textContent = '[' + time + '] ' + msg;
      bar.appendChild(line);
      while (bar.childNodes.length > 40) bar.removeChild(bar.firstChild);
      bar.scrollTop = bar.scrollHeight;
    }

    function resetDemoRootStatuses() {
      for (let r = 1; r <= 20; r++) setDevRootStatus(r, 'PASS');
    }

    function applyDemoRootTrips(rootNums) {
      resetDemoRootStatuses();
      (rootNums || []).forEach(function(r) { setDevRootStatus(r, 'TRIPPED'); });
    }

    function setDemoCriPreset(preset) {
      if (typeof canEditRiskPresets === 'function' && !canEditRiskPresets(demoPersonaRole)) {
        addLog('[DEMO] Risk preset overrides locked for current persona role', 'warn');
        return;
      }
      const p = String(preset || '').toUpperCase();
      svDemoDispatch({ type: 'DEMO_SET_FORCE_DEFCON1', value: false });
      if (p === 'NOMINAL') {
        resetDemoRootStatuses();
      } else if (p === 'WARNING') {
        applyDemoRootTrips([11, 6, 1, 2, 3]);
      } else if (p === 'TOXIC') {
        applyDemoRootTrips([11, 12, 13, 1]);
      } else if (p === 'GOD') {
        svDemoDispatch({ type: 'DEMO_SET_FORCE_DEFCON1', value: true });
        for (let r = 1; r <= 20; r++) setDevRootStatus(r, 'TRIPPED');
      }
      applyStep1EmergencyState();
      syncDemoHubLamps();
      renderDemoRootToggleGrid();
      refreshCriAndStatusHud();
      addLog('[DEMO] ROOT DEFENSE MATRIX preset applied: ' + p, 'success');
      pushExecLog('[DEMO] ROOT DEFENSE MATRIX preset → ' + p, 'ok');
    }

    function resetToxicLockAndCooldown() {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Risk injection locked for current persona role', 'warn');
        return;
      }
      toxicModeCooldownUntil = 0;
      toxicModeModalShown = false;
      const backdrop = document.getElementById('toxicModeBackdrop');
      if (backdrop) backdrop.classList.add('hidden');
      if (getToxicityRiskScore() >= TOXIC_MODE_THRESHOLD) {
        setDemoCriPreset('WARNING');
        return;
      }
      refreshCriAndStatusHud();
      if (typeof updateMasterConsoleSlippage === 'function') updateMasterConsoleSlippage();
      addLog('[DEMO] Toxic Mode execution lock and cooldown cleared — standard execution restored', 'success');
      pushExecLog('[DEMO] Toxic lock & cooldown reset', 'ok');
    }

    function resolveAccountEquityUsd() {
      return resolveVaultEquityUsd();
    }

    function resolveEffectiveMaxSlUsd() {
      return computeEffectiveMaxSlUsd(resolveAccountEquityUsd());
    }

    function formatDynSlLockTagHtml(orderSize) {
      const equity = resolveAccountEquityUsd();
      const maxSl = computeEffectiveMaxSlUsd(equity);
      return '[ ' + brandShieldImg('brand-shield-icon', 14) + ' MAX SL DYNAMIC WELD | DYN-SL: ' +
        dynamicMaxSlPct(orderSize, equity).toFixed(2) + '% ($' + maxSl.toFixed(0) + ' MAX LOSS) ]';
    }

    function formatMaxSlWeldLabel() {
      const maxSl = resolveEffectiveMaxSlUsd();
      return '[ R1: SL $' + maxSl.toFixed(0) + ' WELD ]';
    }

    function formatMaxSlWeldDesc() {
      const equity = resolveAccountEquityUsd();
      const maxSl = computeEffectiveMaxSlUsd(equity);
      return 'Dynamic capital protection limit. Effective Max SL = (Equity × 1%) + $100 → $' +
        maxSl.toFixed(0) + ' at $' + equity.toLocaleString() + ' equity.';
    }

    function normalizeDevRootStatus(raw) {
      const v = String(raw || '').toUpperCase();
      if (v === 'TRIPPED' || v === 'WARN' || v === 'PASS') return v;
      return 'PASS';
    }

    function setDevRootStatus(rootNum, status) {
      window.devRootStatus[rootNum] = normalizeDevRootStatus(status);
      window.devRootTripped = window.devRootTripped || {};
      window.devRootTripped[rootNum] = window.devRootStatus[rootNum] === 'TRIPPED';
    }

    function cycleDevRootStatus(rootNum) {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Root toggle locked for current persona role', 'warn');
        return normalizeDevRootStatus(window.devRootStatus[rootNum]);
      }
      const current = normalizeDevRootStatus(window.devRootStatus[rootNum]);
      const next = current === 'PASS' ? 'WARN' : (current === 'WARN' ? 'TRIPPED' : 'PASS');
      setDevRootStatus(rootNum, next);
      return next;
    }

    function collectRootStatusesForCri() {
      const statuses = {};
      for (let r = 1; r <= 20; r++) {
        statuses[r] = normalizeDevRootStatus(window.devRootStatus[r]);
      }
      if (window.__SV_DEMO__.forceDefcon1 === true) {
        for (let r = 1; r <= 20; r++) statuses[r] = 'TRIPPED';
      }
      if (gatekeeperDemoLocked) statuses[13] = 'TRIPPED';
      if (shieldDemoRedAlertActive) statuses[8] = 'TRIPPED';
      if (settlementLockdownDemoActive) statuses[10] = 'TRIPPED';
      if (tsunamiShieldActive) statuses[10] = 'TRIPPED';
      if (typeof isMacroBlocking !== 'undefined' && isMacroBlocking) statuses[5] = 'TRIPPED';
      if (typeof lastVixValue === 'number' && lastVixValue > 20) statuses[5] = 'TRIPPED';
      if (typeof lastDvolValue === 'number' && lastDvolValue > 55) statuses[5] = 'TRIPPED';
      const rows = typeof globalData !== 'undefined' ? globalData : [];
      rows.forEach(function(row) {
        if (!row || !row.risk_tripped) return;
        const reasons = row.risk_reasons || [];
        if (reasons.indexOf('RISK_LIMIT_EXCEEDED') >= 0) {
          statuses[16] = 'TRIPPED';
        } else if (reasons.indexOf('SOIL_RESISTANCE') >= 0 || reasons.indexOf('INSUFFICIENT_DEPTH') >= 0) {
          statuses[3] = 'TRIPPED';
        }
      });
      const root17 = checkRoot17DailyLimit({
        accountEquityUsd: resolveAccountEquityUsd(),
        state: root17DailyState,
      });
      if (root17.tripped) statuses[17] = 'TRIPPED';
      return statuses;
    }

    function collectTrippedRootsForCri() {
      const tripped = [];
      const statuses = collectRootStatusesForCri();
      for (let r = 1; r <= 20; r++) {
        if (statuses[r] === 'TRIPPED') tripped.push(r);
      }
      return tripped;
    }

    function triggerToxicModeCircuitBreaker(riskScore) {
      if (!isToxicModeTripped(riskScore)) {
        toxicModeModalShown = false;
        return;
      }
      if (openPositions.length) {
        openPositions = [];
        renderActivePositions();
        pushExecLog('[TOXIC MODE] All open positions force-closed', 'err');
      }
      toxicModeCooldownUntil = Date.now() + TOXIC_MODE_COOLDOWN_MS;
      if (!toxicModeModalShown) {
        toxicModeModalShown = true;
        const backdrop = document.getElementById('toxicModeBackdrop');
        if (backdrop) backdrop.classList.remove('hidden');
        addLog('TOXIC MODE TRIPPED — ALL POSITIONS CLOSED & ORDERS CANCELLED', 'warn');
        pushExecLog('[TOXIC MODE] Circuit breaker engaged · execution cooldown started', 'err');
      }
      updateMasterConsoleSlippage();
    }

    function acknowledgeToxicModeModal() {
      const backdrop = document.getElementById('toxicModeBackdrop');
      if (backdrop) backdrop.classList.add('hidden');
    }

    function syncDemoPersonaRoleUI() {
      const banner = document.getElementById('demoRoleBanner');
      const faultPanel = document.getElementById('demoFaultPanel');
      const teleTab = document.getElementById('demoHubTabTelemetry');
      const cfg = (typeof DEMO_ROLE_CONFIG !== 'undefined' && DEMO_ROLE_CONFIG[demoPersonaRole])
        ? DEMO_ROLE_CONFIG[demoPersonaRole]
        : { banner: '[ TRADER MODE · ORDER ENTRY ENABLED ]', themeClass: 'role-trader', color: 'text-emerald-300' };
      if (banner) {
        banner.textContent = cfg.banner;
        const roleColors = { TRADER: 'text-emerald-300', AUDITOR: 'text-cyan-300', RISK_MANAGER: 'text-amber-300' };
        banner.className = 'text-xs mt-1 ' + (roleColors[demoPersonaRole] || 'text-emerald-300');
      }
      document.body.classList.remove('role-trader', 'role-auditor', 'role-risk-manager');
      document.body.classList.add(cfg.themeClass || 'role-trader');
      ['demoRoleTrader', 'demoRoleAuditor', 'demoRoleRisk'].forEach(function(id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.classList.remove('is-active');
      });
      const activeId = demoPersonaRole === 'AUDITOR' ? 'demoRoleAuditor'
        : (demoPersonaRole === 'RISK_MANAGER' ? 'demoRoleRisk' : 'demoRoleTrader');
      const activeBtn = document.getElementById(activeId);
      if (activeBtn) activeBtn.classList.add('is-active');
      if (faultPanel) {
        faultPanel.classList.toggle('hidden', !(typeof canAccessFaultInjection === 'function'
          ? canAccessFaultInjection(demoPersonaRole)
          : demoPersonaRole === 'RISK_MANAGER'));
      }
      if (teleTab) {
        const teleUnlocked = typeof canAccessTelemetryAudit === 'function'
          ? canAccessTelemetryAudit(demoPersonaRole)
          : (demoPersonaRole === 'AUDITOR' || demoPersonaRole === 'RISK_MANAGER');
        teleTab.disabled = !teleUnlocked;
        teleTab.setAttribute('aria-disabled', teleUnlocked ? 'false' : 'true');
        teleTab.title = teleUnlocked ? '' : 'Auditor or Risk Manager role required';
      }
      if (demoPersonaRole === 'AUDITOR') {
        setDemoHubTab('telemetry');
      } else if (demoPersonaRole === 'TRADER') {
        setDemoHubTab('toggles');
      }
      updateMasterConsoleSlippage();
    }

    function setDemoPersonaRole(role) {
      demoPersonaRole = typeof resolveDemoRole === 'function'
        ? resolveDemoRole(role)
        : (String(role || 'TRADER').toUpperCase() === 'AUDITOR' ? 'AUDITOR'
          : (String(role || '').toUpperCase() === 'RISK_MANAGER' || String(role || '').toUpperCase() === 'JAVIER'
            ? 'RISK_MANAGER' : 'TRADER'));
      syncDemoPersonaRoleUI();
      triggerDonDonLevelUp();
      pushExecLog('[ROLE] Demo persona → ' + demoPersonaRole, 'ok');
    }

    function injectFaultPreset(preset) {
      if (typeof canAccessFaultInjection === 'function'
        ? !canAccessFaultInjection(demoPersonaRole)
        : demoPersonaRole !== 'RISK_MANAGER') {
        addLog('[FAULT] Risk Manager (Javier) role required for sandbox injection', 'warn');
        return;
      }
      const id = String(preset || '').toUpperCase();
      if (id === 'HIGH_SLIPPAGE') {
        shieldDemoRedAlertActive = true;
        applyShieldDemoUI();
        setDevRootStatus(8, 'TRIPPED');
      } else if (id === 'HIGH_VOLATILITY') {
        svDemoDispatch({ type: 'DEMO_SET_FORCE_DEFCON1', value: true });
        setDevRootStatus(5, 'TRIPPED');
        syncDemoHubLamps();
      } else if (id === 'RISK_SCORE_SPIKE') {
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].forEach(function(r) {
          setDevRootStatus(r, 'TRIPPED');
        });
      }
      renderDemoRootToggleGrid();
      refreshCriAndStatusHud();
      pushExecLog('[FAULT] Injected preset: ' + id, 'warn');
    }

    let criHudRefreshing = false;

    function resolveClientTaijiBaguaContext() {
      var soilTripped = false;
      if (typeof resolveRoot8SlippageLock === 'function' && typeof selectedConsoleAsset !== 'undefined' && selectedConsoleAsset) {
        var slip = typeof slipForNotionalDynamic === 'function'
          ? slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd || 10000)
          : 0;
        var soilLock = resolveRoot8SlippageLock({
          slipRatio: slip,
          symbol: selectedConsoleAsset.symbol || selectedConsoleAsset.key,
          hlSpot: selectedConsoleAsset.hlSpot,
          hlPerp: selectedConsoleAsset.hlPerp,
          dydxPerp: selectedConsoleAsset.dydxPerp,
        });
        soilTripped = !!soilLock;
      }
      return {
        soilTripped: soilTripped,
        isHedgeActive: systemState.isHedgeActive === true,
      };
    }

    function syncTaijiBaguaOnSystemState() {
      if (typeof enrichSystemStateTaijiBagua !== 'function') return systemState;
      var ctx = resolveClientTaijiBaguaContext();
      var enriched = enrichSystemStateTaijiBagua(systemState, ctx);
      systemState.taijiMode = enriched.taijiMode;
      systemState.activeGate = enriched.activeGate;
      return enriched;
    }

    function refreshTaijiBaguaHud() {
      var enriched = syncTaijiBaguaOnSystemState();
      var taijiEl = document.getElementById('taijiModeBadge');
      var gateEl = document.getElementById('baguaGateBadge');
      if (!taijiEl || !gateEl || typeof TAIJI_MODE_UI === 'undefined' || typeof BAGUA_GATE_UI === 'undefined') return;
      var taijiMode = enriched.taijiMode || 'YIN_YIELD';
      var activeGate = enriched.activeGate || 'LI_BRIGHT';
      var taijiCfg = TAIJI_MODE_UI[taijiMode] || TAIJI_MODE_UI.YIN_YIELD;
      var gateCfg = BAGUA_GATE_UI[activeGate] || BAGUA_GATE_UI.LI_BRIGHT;
      taijiEl.textContent = taijiCfg.label;
      taijiEl.className = 'taiji-mode-badge sv-tip ' + taijiCfg.cssClass;
      taijiEl.setAttribute('data-sv-tip', taijiCfg.tooltip);
      taijiEl.setAttribute('data-sv-label', 'Taiji Mode · ' + taijiMode.replace('_', ' '));
      gateEl.textContent = gateCfg.label;
      gateEl.className = 'bagua-gate-badge sv-tip ' + gateCfg.cssClass;
      gateEl.setAttribute('data-sv-tip', gateCfg.tooltip);
      gateEl.setAttribute('data-sv-label', 'Bagua Gate · ' + gateCfg.shortLabel);
    }

    function refreshCriAndStatusHud(opts) {
      if (criHudRefreshing) {
        const cached = getRootDefenseMatrixScore();
        return {
          criScore: cached,
          riskScore: Math.max(0, 100 - cached),
          band: resolveRootDefenseMatrixBand(cached),
          statuses: collectRootStatusesForCri(),
        };
      }
      criHudRefreshing = true;
      try {
      opts = opts || {};
      const statuses = collectRootStatusesForCri();
      const defenseScore = recomputeRootDefenseMatrixState();
      const band = resolveRootDefenseMatrixBand(defenseScore);
      const hudCfg = ROOT_DEFENSE_MATRIX_HUD_CONFIG[band] || ROOT_DEFENSE_MATRIX_HUD_CONFIG.OPTIMAL;

      const bar = document.getElementById('statusHudBar');
      const criEl = document.getElementById('statusHudCri');
      const badgeEl = document.getElementById('statusHudBadge');
      if (bar) bar.className = 'risk-index-hud ' + hudCfg.cssClass;
      if (criEl) {
        criEl.textContent = formatRootDefenseMatrixLabel(defenseScore);
        criEl.className = 'risk-index-score sv-tip ' + hudCfg.scoreClass;
      }
      if (badgeEl) {
        badgeEl.textContent = hudCfg.badge;
        badgeEl.className = 'risk-index-badge sv-tip ' + hudCfg.scoreClass;
      }

      applyRootDefenseMatrixBarFill(document.getElementById('statusHudFill'), defenseScore);

      const hubReadout = document.getElementById('demoHubCriReadout');
      const hubFill = document.getElementById('demoHubCriFill');
      if (hubReadout) {
        hubReadout.textContent = formatRootDefenseMatrixLabel(defenseScore);
        hubReadout.className = 'typo-num ' + hudCfg.scoreClass;
      }
      applyRootDefenseMatrixBarFill(hubFill, defenseScore);

      applyDonDonAvatarForRisk(getToxicityRiskScore());
      triggerToxicModeCircuitBreaker(getToxicityRiskScore());
      refreshTaijiBaguaHud();

      if (typeof renderRootTelemetry === 'function') renderRootTelemetry();
      if (typeof updateMasterConsoleSlippage === 'function') updateMasterConsoleSlippage();
      return {
        criScore: defenseScore,
        riskScore: getToxicityRiskScore(),
        band: band,
        statuses: statuses,
      };
      } finally {
        criHudRefreshing = false;
      }
    }

    function triggerGrowthHudBurst() {
      triggerDonDonLevelUp();
      refreshCriAndStatusHud({ forceGrowth: true });
      if (growthHudTimer) clearTimeout(growthHudTimer);
      growthHudTimer = setTimeout(function() {
        growthHudTimer = null;
        refreshCriAndStatusHud();
      }, 3000);
    }

    function syncDemoXpUI() {
      const input = document.getElementById('demoXpInput');
      if (input) input.value = String(demoUserXp);
      const fill = document.getElementById('demoXpFill');
      if (fill) fill.style.width = Math.min(100, demoUserXp) + '%';
      const tierEl = document.getElementById('demoXpTierLabel');
      if (tierEl) {
        tierEl.textContent = 'RPG Tier: ' + resolveUserMode(demoUserXp) + ' · XP ' + demoUserXp;
      }
    }

    function onDemoXpInputChange() {
      if (!canMutateDemoRiskControls()) return;
      const input = document.getElementById('demoXpInput');
      const raw = input ? parseInt(String(input.value), 10) : 0;
      demoUserXp = Number.isFinite(raw) ? Math.max(0, Math.min(200, raw)) : 0;
      const prev = lastDemoXp;
      lastDemoXp = demoUserXp;
      syncDemoXpUI();
      const cri = refreshCriAndStatusHud().criScore;
      if (demoUserXp > prev && cri <= 25) triggerGrowthHudBurst();
    }

    function adjustDemoXp(delta) {
      demoUserXp = Math.max(0, Math.min(200, demoUserXp + Number(delta || 0)));
      onDemoXpInputChange();
    }

    function resetDemoXp() {
      demoUserXp = 0;
      lastDemoXp = 0;
      onDemoXpInputChange();
    }

    function renderDemoRootToggleGrid() {
      const grid = document.getElementById('demoRootToggleGrid');
      if (!grid) return;
      grid.innerHTML = '';
      for (let r = 1; r <= 20; r++) {
        const status = normalizeDevRootStatus(window.devRootStatus[r]);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'demo-root-toggle-btn' +
          (status === 'TRIPPED' ? ' is-tripped' : (status === 'WARN' ? ' is-warn' : ''));
        btn.textContent = 'R' + r + (status === 'WARN' ? '!' : '');
        btn.setAttribute('aria-pressed', status !== 'PASS' ? 'true' : 'false');
        btn.title = 'Cycle PASS → WARN → TRIPPED';
        btn.onclick = function() { toggleDemoRootTrip(r); };
        grid.appendChild(btn);
      }
    }

    function toggleDemoRootTrip(rootNum) {
      const n = Number(rootNum);
      if (!Number.isFinite(n) || n < 1 || n > 20) return;
      const next = cycleDevRootStatus(n);
      renderDemoRootToggleGrid();
      const snapshot = refreshCriAndStatusHud();
      pushExecLog('[DEMO] Root ' + n + ' → ' + next +
        ' · ' + formatRiskIndexLabel(snapshot.riskScore), next === 'TRIPPED' ? 'warn' : 'ok');
    }

    function isRoot17Blocking() {
      return checkRoot17DailyLimit({
        accountEquityUsd: resolveAccountEquityUsd(),
        state: root17DailyState,
      }).tripped;
    }

    function sanitizeCapitalUsd(raw) {
      const vault = resolveVaultEquityUsd();
      const n = typeof raw === 'number' ? raw : parseFloat(String(raw == null ? '' : raw).replace(/,/g, ''));
      if (!Number.isFinite(n) || n <= 0) return Math.min(10000, vault);
      return Math.min(n, vault);
    }

    function resolveOrderSizeMaxUsd(cap) {
      const vault = resolveVaultEquityUsd();
      const c = Math.min(sanitizeCapitalUsd(cap), vault);
      return Math.max(1000, Math.min(100000, c));
    }

    function clampOrderSizeUsd(size, cap) {
      const max = resolveOrderSizeMaxUsd(cap);
      const n = Number(size);
      if (!Number.isFinite(n) || n < 1000) return 1000;
      return Math.min(Math.max(n, 1000), max);
    }

    function dynamicMaxSlPctLocal(orderSize) {
      return dynamicMaxSlPct(orderSize, resolveAccountEquityUsd());
    }

    function exceedsMaxRiskBoundaryLocal(orderSize, slipRatio) {
      return exceedsMaxRiskBoundary({
        orderSizeUsd: orderSize,
        slipRatio: slipRatio,
        accountEquityUsd: resolveAccountEquityUsd(),
      });
    }

    function collectAutoGuards() {
      const mindsetClear = !(window.__SV_DEMO__.forceDefcon1 === true) && !isMacroBlocking && !(lastVixValue > 20 && lastDvolValue > 55);
      const vixDvolNormal = lastVixValue <= 22 && lastDvolValue <= 45;
      const targetLocked = !!selectedConsoleAsset;
      const settlementClear = !settlementLockdownActive && !settlementLockdownDemoActive;
      let soilSafe = true;
      if (selectedConsoleAsset) {
        const slip = slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd);
        soilSafe = !exceedsMaxRiskBoundaryLocal(masterOrderSizeUsd, slip);
      }
      return {
        mindsetClear: mindsetClear,
        vixDvolNormal: vixDvolNormal,
        targetLocked: targetLocked,
        settlementClear: settlementClear,
        soilSafe: soilSafe,
      };
    }

    function formatAutoGuardBannerLocal(mode, guards) {
      const unlocked = isStep3UnlockedFromGuards(mode, guards);
      const R = STATUS_DICTIONARY.ROOT_TAGS;
      if (mode === 'FLASH') {
        const flashLabel = (R.FLASH_ACTIVE && R.FLASH_ACTIVE.label) || '[ ⚡ FLASH ACTIVE: SURVEY BYPASSED ]';
        const flashDesc = (R.FLASH_ACTIVE && R.FLASH_ACTIVE.desc) || STATUS_DICTIONARY.TRADE_MODES.FLASH.desc;
        const root1 = formatMaxSlWeldLabel();
        const root8 = R.ROOT8_SLIPPAGE_BREAKER.ok;
        const direct = (R.ROOT18_STEP3 && R.ROOT18_STEP3.direct) || '[ 🔓 STEP 3 DIRECT ACCESS 🎯 ]';
        return (
          '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(flashDesc) + '" data-sv-label="' + escapeTooltipHtml(flashLabel) + '">' + escapeTooltipHtml(flashLabel) + '</span> · ' +
          '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(formatMaxSlWeldDesc()) + '" data-sv-label="' + escapeTooltipHtml(root1) + '">' + escapeTooltipHtml(root1) + '</span> · ' +
          '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(R.ROOT8_SLIPPAGE_BREAKER.desc) + '" data-sv-label="' + escapeTooltipHtml(root8) + '">' + escapeTooltipHtml(root8) + '</span> -> ' +
          '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(R.ROOT18_STEP3.desc) + '" data-sv-label="' + escapeTooltipHtml(direct) + '">' + escapeTooltipHtml(direct) + '</span>'
        );
      }
      // Shield + Tactical: Root 5 / Root 10 / Root 3 -> Root 18 (dynamic lock explainers on trip states)
      const vixLabel = guards.vixDvolNormal ? R.ROOT5_VIX.pass : R.ROOT5_VIX.fail;
      const vixTip = guards.vixDvolNormal
        ? R.ROOT5_VIX.desc
        : (R.ROOT5_VIX.failDesc || R.ROOT5_MACRO_VOL.elevatedDesc || R.ROOT5_VIX.desc);
      const settLabel = guards.settlementClear ? R.ROOT10_SETTLEMENT.clear : R.ROOT10_SETTLEMENT.lockdown;
      const settTip = guards.settlementClear
        ? R.ROOT10_SETTLEMENT.desc
        : (R.ROOT10_SETTLEMENT.lockdownDesc || R.ROOT10_SETTLEMENT.desc);
      const soilLabel = guards.soilSafe ? R.ROOT3_SOIL.safe : R.ROOT3_SOIL.danger;
      const soilTip = guards.soilSafe
        ? R.ROOT3_SOIL.desc
        : (R.ROOT3_SOIL.dangerDesc || R.ROOT3_SOIL.desc);
      const tailLabel = unlocked ? R.ROOT18_STEP3.unlocked : R.ROOT18_STEP3.locked;
      return (
        '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(vixTip) + '" data-sv-label="' + escapeTooltipHtml(vixLabel) + '">' + escapeTooltipHtml(vixLabel) + '</span> · ' +
        '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(settTip) + '" data-sv-label="' + escapeTooltipHtml(settLabel) + '">' + escapeTooltipHtml(settLabel) + '</span> · ' +
        '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(soilTip) + '" data-sv-label="' + escapeTooltipHtml(soilLabel) + '">' + escapeTooltipHtml(soilLabel) + '</span> -> ' +
        '<span class="sv-tip" data-sv-tip="' + escapeTooltipHtml(R.ROOT18_STEP3.desc) + '" data-sv-label="' + escapeTooltipHtml(tailLabel) + '">' + escapeTooltipHtml(tailLabel) + '</span>'
      );
    }

    function isStep3UnlockedFromGuards(mode, guards) {
      if (mode === 'FLASH') return true;
      if (mode === 'TACTICAL') {
        return !!(guards.vixDvolNormal && guards.settlementClear && guards.soilSafe);
      }
      // SHIELD: full automated safety pipeline (mindset + target + risk trio)
      return !!(
        guards.mindsetClear &&
        guards.vixDvolNormal &&
        guards.targetLocked &&
        guards.settlementClear &&
        guards.soilSafe
      );
    }

    function isStep3Unlocked() {
      return isStep3UnlockedFromGuards(tradeMode, collectAutoGuards());
    }

    function refreshAutoGuardBanner() {
      const guards = collectAutoGuards();
      const unlocked = isStep3UnlockedFromGuards(tradeMode, guards);
      const banner = document.getElementById('autoGuardBanner');
      const main = document.getElementById('autoGuardBannerMain');
      if (main) {
        main.innerHTML = formatAutoGuardBannerLocal(tradeMode, guards);
      } else if (banner) {
        banner.innerHTML = formatAutoGuardBannerLocal(tradeMode, guards);
      }
      if (banner) {
        let modeClass = ' is-locked';
        if (tradeMode === 'FLASH') modeClass = ' is-flash';
        else if (tradeMode === 'TACTICAL') modeClass = unlocked ? ' is-unlocked is-tactical' : ' is-locked is-tactical';
        else modeClass = unlocked ? ' is-unlocked' : ' is-locked';
        banner.className = 'auto-guard-banner' + modeClass;
      }
      refreshBannerHeatStatus();
      if (typeof updateMasterConsoleSlippage === 'function') {
        updateMasterConsoleSlippage();
      }
    }

    function assertFlashHardLocksLocal() {
      const locks = assertFlashHardLocks(resolveAccountEquityUsd());
      if (ROOT_DEFENSE_TELEMETRY[0]) ROOT_DEFENSE_TELEMETRY[0].status = 'ENGAGED';
      if (ROOT_DEFENSE_TELEMETRY[7]) ROOT_DEFENSE_TELEMETRY[7].status = 'ACTIVE';
      return locks;
    }

    async function fetchHlWalletTxCount(walletAddress) {
      // Demo Control Hub TX override takes priority (works without connected wallet).
      if (typeof window.devMockHlTxCount === 'number' && Number.isFinite(window.devMockHlTxCount)) {
        return Math.max(0, Math.floor(window.devMockHlTxCount));
      }
      const user = String(walletAddress || '').trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(user)) return 0;
      try {
        const res = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'userFills', user: user }),
        });
        if (!res.ok) return 0;
        const data = await res.json();
        return Array.isArray(data) ? data.length : 0;
      } catch (err) {
        return 0;
      }
    }

    function syncDemoWalletTxLevelUI() {
      const raw = Number(window.devMockHlTxCount);
      const tx = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
      const levels = [
        { id: 'hubTxLevel0', match: tx < 5 },
        { id: 'hubTxLevel5', match: tx >= 5 && tx < 20 },
        { id: 'hubTxLevel20', match: tx >= 20 },
      ];
      levels.forEach(function(row) {
        const el = document.getElementById(row.id);
        if (el) el.classList.toggle('is-active', row.match);
      });
    }

    function setDemoWalletTxLevel(level) {
      if (!canMutateDemoRiskControls()) {
        addLog('[DEMO] Wallet TX override locked for current persona role', 'warn');
        return;
      }
      const n = Number(level);
      const tx = n >= 20 ? 20 : (n >= 5 ? 5 : 0);
      window.devMockHlTxCount = tx;
      syncDemoWalletTxLevelUI();
      refreshRoleEligibility().then(function(elig) {
        refreshAutoGuardBanner();
        const unlocked = (elig && elig.allowedModes) ? elig.allowedModes.join('/') : 'SHIELD';
        pushExecLog(
          '[DEMO] Wallet TX Level Override → ' + tx + ' TXs · unlocked roles: ' + unlocked,
          'ok'
        );
      });
    }

    async function refreshRoleEligibility() {
      const addr = connectedWalletAddress || '';
      hlWalletTxCount = await fetchHlWalletTxCount(addr);
      roleEligibility = checkRoleEligibility({
        walletAddress: addr,
        txCount: hlWalletTxCount,
        accountEquityUsd: resolveAccountEquityUsd(),
      });
      syncTradeModeButtonsFromEligibility();
      if (tradeMode !== 'SHIELD' && roleEligibility.allowedModes.indexOf(tradeMode) < 0) {
        tradeMode = 'SHIELD';
        syncTradeModeButtonsFromEligibility();
        refreshAutoGuardBanner();
      }
      return roleEligibility;
    }

    function syncTradeModeButtonsFromEligibility() {
      const map = {
        SHIELD: 'modeBtnShield',
        TACTICAL: 'modeBtnTactical',
        FLASH: 'modeBtnFlash',
      };
      Object.keys(map).forEach(function(k) {
        const el = document.getElementById(map[k]);
        if (!el) return;
        const allowed = roleEligibility.allowedModes.indexOf(k) >= 0;
        const modeMeta = STATUS_DICTIONARY.TRADE_MODES[k];
        el.classList.toggle('is-active', k === tradeMode);
        el.classList.toggle('is-locked', !allowed);
        el.disabled = !allowed;
        el.setAttribute('aria-disabled', allowed ? 'false' : 'true');
        const tip = !allowed && roleEligibility.reasons[k]
          ? roleEligibility.reasons[k]
          : (modeMeta && modeMeta.desc) || '';
        const label = (modeMeta && modeMeta.button) || k;
        applySvTip(el, tip, label);
      });
    }

    function formatBestHedgePairLabel(symbol) {
      const raw = String(symbol || '').trim().toUpperCase();
      if (!raw || raw === '---') return '--- / USDC';
      const cleaned = raw
        .replace(/[-_/]?USDC$/i, '')
        .replace(/[-_/]?USD$/i, '')
        .replace(/^XYZ:/i, '')
        .trim();
      const base = cleaned || raw;
      return base + ' / USDC';
    }

    function setTradeMode(mode) {
      const m = String(mode || '').toUpperCase();
      let next = 'SHIELD';
      if (m === 'TACTICAL' || m === 'INTERMEDIATE') next = 'TACTICAL';
      else if (m === 'FLASH' || m === 'EXPERT') next = 'FLASH';

      if (roleEligibility.allowedModes.indexOf(next) < 0) {
        const tip = roleEligibility.reasons[next] || ('Requires HL TXs to unlock ' + next);
        pushExecLog('[MODE] Blocked ' + next + ' · ' + tip, 'warn');
        syncTradeModeButtonsFromEligibility();
        return;
      }

      tradeMode = next;
      if (tradeMode === 'FLASH') {
        const locks = assertFlashHardLocksLocal();
        pushExecLog(
          '[MODE] ⚡ Flash · survey bypass · Root 1 Max SL $' + locks.maxLossUSD.toFixed(0) +
          ' + Root 8 Slippage ≤ ' + (locks.maxSlippage * 100).toFixed(1) + '% WELDED',
          'ok'
        );
        if (typeof renderRootTelemetry === 'function') renderRootTelemetry();
        if (typeof refreshGatekeeperDefenseMatrix === 'function') refreshGatekeeperDefenseMatrix();
      } else if (tradeMode === 'TACTICAL') {
        pushExecLog('[MODE] ⚔️ Tactical · balanced defense · Dynamic Max SL $' +
          resolveEffectiveMaxSlUsd().toFixed(0) + ' retained', 'ok');
      } else {
        pushExecLog('[MODE] Shield · full automated safety pipeline armed', 'ok');
      }
      syncTradeModeButtonsFromEligibility();
      refreshAutoGuardBanner();
    }

    function onModeGateChange() {
      refreshAutoGuardBanner();
    }

    function syncExpertVixMirror() {
      // retained no-op — Flash mode status lives in auto-guard banner
    }

    function formatTzClock(now, timeZone) {
      try {
        return new Intl.DateTimeFormat('en-GB', {
          timeZone: timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);
      } catch (e) {
        return '--:--:--';
      }
    }

    function getTzHour(now, timeZone) {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: timeZone,
          hour: '2-digit',
          hour12: false,
        }).formatToParts(now);
        return parseInt(parts.find(function(p) { return p.type === 'hour'; }).value, 10);
      } catch (e) {
        return -1;
      }
    }

    function setDemoHubTab(tab) {
      if (tab === 'telemetry' && typeof canAccessTelemetryAudit === 'function'
        && !canAccessTelemetryAudit(demoPersonaRole)) {
        addLog('[DEMO] 20-Root Telemetry audit view requires Auditor or Risk Manager role', 'warn');
        tab = 'toggles';
      }
      const togglesPane = document.getElementById('demoHubPaneToggles');
      const telePane = document.getElementById('demoHubPaneTelemetry');
      const tabT = document.getElementById('demoHubTabToggles');
      const tabR = document.getElementById('demoHubTabTelemetry');
      const isTele = tab === 'telemetry';
      if (togglesPane) togglesPane.classList.toggle('hidden', isTele);
      if (telePane) telePane.classList.toggle('hidden', !isTele);
      if (tabT) {
        tabT.classList.toggle('is-active', !isTele);
        tabT.setAttribute('aria-selected', isTele ? 'false' : 'true');
      }
      if (tabR) {
        tabR.classList.toggle('is-active', isTele);
        tabR.setAttribute('aria-selected', isTele ? 'true' : 'false');
      }
      if (isTele) renderRootTelemetry();
    }

    function toggleHeaderMenu() {
      const drawer = document.getElementById('headerSecondaryActions');
      const btn = document.getElementById('headerMenuToggle');
      if (!drawer) return;
      const open = !drawer.classList.contains('is-open');
      drawer.classList.toggle('is-open', open);
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function closeHeaderMenu() {
      const drawer = document.getElementById('headerSecondaryActions');
      const btn = document.getElementById('headerMenuToggle');
      if (drawer) drawer.classList.remove('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    document.addEventListener('click', function(e) {
      const wrap = document.querySelector('.header-actions-right');
      if (!wrap || wrap.contains(e.target)) return;
      closeHeaderMenu();
    });

    function sumLivePnlUsd() {
      let sum = 0;
      for (let i = 0; i < openPositions.length; i++) {
        const n = parseFloat(openPositions[i].pnlUsd);
        if (Number.isFinite(n)) sum += n;
      }
      return sum;
    }

    function formatSignedUsd(n) {
      const v = Number.isFinite(n) ? n : 0;
      const sign = v >= 0 ? '+' : '-';
      return sign + '$' + Math.abs(v).toFixed(2);
    }

    function resolveVaultEquityUsd() {
      if (Number.isFinite(withdrawableCollateralUsd) && withdrawableCollateralUsd > 0) {
        return withdrawableCollateralUsd;
      }
      return 25000;
    }

    function syncHeaderVault() {
      const posCount = openPositions.length;
      const livePnl = sumLivePnlUsd();
      const equity = resolveVaultEquityUsd();
      const vaultOpen = document.getElementById('vaultOpenPositions');
      const vaultPnl = document.getElementById('vaultSettledPnl');
      if (vaultOpen) vaultOpen.textContent = String(posCount);
      if (vaultPnl) vaultPnl.textContent = '$' + settledPnlUsd.toFixed(2);

      const stepPos = document.getElementById('step3VaultPos');
      const stepEquity = document.getElementById('step3VaultEquity');
      const stepLive = document.getElementById('step3VaultLivePnl');
      const stepEmoji = document.getElementById('step3VaultPnlEmoji');
      if (stepPos) stepPos.textContent = String(posCount);
      if (stepEquity) stepEquity.textContent = equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (stepLive) {
        stepLive.textContent = formatSignedUsd(livePnl);
        stepLive.className = 'step3-vault-pnl font-bold ' + (livePnl >= 0 ? 'is-pos text-emerald-400' : 'is-neg text-rose-400');
      }
      if (stepEmoji) stepEmoji.textContent = livePnl >= 0 ? '🟢' : '🔴';

      const capitalInput = document.getElementById('capitalInput');
      if (capitalInput) capitalInput.max = String(equity);

      // CAPITAL ceiling tracks live vault — clamp + refresh soil / MAX SL weld
      if (capitalUsd > equity) {
        applyCapitalUsd(equity, { forceInput: true, sanitize: true });
      } else {
        refreshCapitalPresetsFromVault();
        updateMasterConsoleSlippage();
      }
    }

    function emergencyCloseAllPositions() {
      if (!openPositions.length) {
        addLog('[EMERGENCY] No open positions to close', 'warn');
        pushExecLog('[EMERGENCY] CLOSE ALL — no open positions', 'warn');
        return;
      }
      const count = openPositions.length;
      let realized = 0;
      while (openPositions.length) {
        const pos = openPositions.pop();
        // Instant mock exit — lock current mark PnL into settled
        realized += pos.pnlUsd;
        settledPnlUsd += pos.pnlUsd;
      }
      const reviewLog = storePostTradeReview('Emergency Exit');
      showPostTradeReviewToast(reviewLog);
      pushExecLog('[EMERGENCY] CLOSE ALL · ' + count + ' pos · realized ' + formatSignedUsd(realized) + ' · Root 19-20 ACTIVE', 'warn');
      addLog('[EMERGENCY] Closed all ' + count + ' positions · ' + formatSignedUsd(realized), 'warn');
      const vaultLast = document.getElementById('vaultLastAttack');
      if (vaultLast) vaultLast.innerText = 'EMERGENCY EXIT · ' + count + ' pos';
      renderActivePositions();
      updateMasterConsoleSlippage();
    }

    function quickSnipeHotToken() {
      closeHeaderMenu();
      const spot = cachedSpotlight || {};
      const symbol = spot.key || spot.hlSymbol || 'CASHCAT';
      const asset = {
        markPrice: spot.markPrice,
        change24h_pct: spot.change24h_pct,
        openInterestNotionalUsd: spot.openInterestNotionalUsd || 5e6,
        fundingRateHourly: spot.fundingRateHourly || ((spot.fundingRate8h_pct || 0) / 800),
        fundingRate8h_pct: spot.fundingRate8h_pct,
        displayName: spot.displayName || String(symbol).toUpperCase(),
        hlSymbol: spot.hlSymbol || String(symbol).toUpperCase(),
      };
      injectTokenToMasterConsole(symbol, asset);
      // Prefer Pre-IPO filter in Step 2 for handoff clarity
      if (typeof setMatrixCategoryFilter === 'function') {
        try { setMatrixCategoryFilter('PREIPO'); } catch (e) { /* ignore */ }
      }
      const step3 = document.getElementById('sniperExecutionShield');
      const step2 = document.getElementById('tokenTableSection');
      if (step3 && step3.scrollIntoView) {
        step3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (step2 && step2.scrollIntoView) {
        step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      addLog('[PRE-LAUNCH SNIPE] ' + (spot.pair || symbol) + ' injected into Step 2/3', 'success');
      pushExecLog('[PRE-LAUNCH SNIPE] ' + (spot.pair || symbol) + ' locked into Sniper console', 'ok');
    }

    function lockBestHedgeToStep3() {
      if (!cachedBestHedgeRow || !cachedBestHedgeRow.b1_symbol) {
        addLog('[BEST HEDGE] No eligible Rule A hedge yet', 'warn');
        return;
      }
      const row = cachedBestHedgeRow;
      const asset = assetFromMatrixRow(row);
      injectTokenToMasterConsole(row.b1_symbol, asset);
      const step3 = document.getElementById('sniperExecutionShield');
      if (step3 && step3.scrollIntoView) {
        step3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      addLog('[BEST HEDGE] Locked ' + row.b1_symbol + ' @ ' + (row.i1_annual_cross || 0).toFixed(2) +
        '% APR · Dynamic Max SL $' + resolveEffectiveMaxSlUsd().toFixed(0) + ' weld', 'success');
      pushExecLog('[BEST HEDGE] ' + row.b1_symbol + ' injected · Dyn-SL $' +
        resolveEffectiveMaxSlUsd().toFixed(0) + ' MAX LOSS armed', 'ok');
    }

    function resolveActiveSessionName(now) {
      const hktHour = getHktHour(now);
      const londonHour = getTzHour(now, 'Europe/London');
      const nyHour = getTzHour(now, 'America/New_York');
      if (hktHour >= 9 && hktHour < 18) return 'TOKYO';
      if (londonHour >= 8 && londonHour < 17) return 'LONDON';
      if (nyHour >= 9 && nyHour < 17) return 'NEW YORK';
      return 'OFF-HOURS';
    }

    function isAsiaSessionOpen(now) {
      const h = getHktHour(now);
      return h >= 9 && h < 18;
    }

    function isEuropeSessionOpen(now) {
      const h = getTzHour(now, 'Europe/London');
      return h >= 8 && h < 17;
    }

    function isUsSessionOpen(now) {
      const h = getTzHour(now, 'America/New_York');
      return h >= 9 && h < 17;
    }

    function setSessionStateEl(el, isOpen) {
      if (!el) return;
      el.textContent = isOpen ? 'OPEN' : 'CLOSED';
      el.className = 'mhb-session-state ' + (isOpen ? 'is-open' : 'is-closed');
    }

    function formatSettledMinutes(secsLeft) {
      if (settlementLockdownDemoActive || secsLeft < SETTLEMENT_LOCKDOWN_SEC) {
        return 'LOCKDOWN';
      }
      const total = Math.max(0, Math.floor(secsLeft));
      const mins = Math.floor(total / 60);
      const secs = total % 60;
      return String(mins).padStart(2, '0') + 'm ' + String(secs).padStart(2, '0') + 's';
    }

    function sparklinePoints(changePct) {
      const down = !(Number.isFinite(changePct) && changePct >= 0);
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const x = 2 + i * (92 / 9);
        const t = i / 9;
        const y = down
          ? (6 + t * 18 + Math.sin(t * 6) * 1.5)
          : (22 - t * 18 + Math.sin(t * 6) * 1.5);
        pts.push(x.toFixed(1) + ',' + y.toFixed(1));
      }
      return pts.join(' ');
    }

    function pickPreLaunchSpotlight(enrichment) {
      const bucket = (enrichment && enrichment.preipo) || {};
      const keys = Object.keys(bucket);
      let bestKey = null;
      let bestAsset = null;
      let bestScore = -1;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const asset = bucket[key];
        if (!asset || !(parseFloat(asset.markPrice) > 0)) continue;
        const label = String(asset.hlSymbol || asset.displayName || key).toUpperCase();
        const chg = Math.abs(parseFloat(asset.change24h_pct) || 0);
        const fr = Math.abs(parseFloat(asset.fundingRate8h_pct) || 0);
        const prefer = /CASHCAT|PRE.?LAUNCH|FLAUNCH/i.test(label) || /cashcat/i.test(key) ? 1000 : 0;
        const score = prefer + chg + fr * 10;
        if (score > bestScore) {
          bestScore = score;
          bestKey = key;
          bestAsset = asset;
        }
      }
      if (bestAsset && bestKey) {
        const sym = String(bestAsset.hlSymbol || bestAsset.displayName || bestKey).toUpperCase().replace(/-USDC$/i, '');
        return {
          key: bestKey,
          pair: sym + '-USDC',
          markPrice: parseFloat(bestAsset.markPrice) || 0,
          change24h_pct: parseFloat(bestAsset.change24h_pct),
          fundingRate8h_pct: parseFloat(bestAsset.fundingRate8h_pct),
          fundingRateHourly: parseFloat(bestAsset.fundingRateHourly) || ((parseFloat(bestAsset.fundingRate8h_pct) || 0) / 800),
          openInterestNotionalUsd: parseFloat(bestAsset.openInterestNotionalUsd) || 5e6,
          displayName: sym,
          hlSymbol: sym,
        };
      }
      return cachedSpotlight;
    }

    function renderPreLaunchSpotlight(enrichment) {
      const spot = pickPreLaunchSpotlight(enrichment);
      cachedSpotlight = spot;
      const symEl = document.getElementById('hotTokenSymbol');
      const pxEl = document.getElementById('hotTokenPrice');
      const chgEl = document.getElementById('hotTokenChg');
      const frEl = document.getElementById('hotTokenFr');
      const lineEl = document.getElementById('hotTokenSparkLine');
      const fillEl = document.getElementById('hotTokenSparkFill');
      if (symEl) symEl.textContent = spot.pair || '---';
      if (pxEl) {
        const px = parseFloat(spot.markPrice);
        pxEl.textContent = Number.isFinite(px)
          ? ('$' + px.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }))
          : '—';
      }
      const chg = parseFloat(spot.change24h_pct);
      if (chgEl) {
        if (Number.isFinite(chg)) {
          const sign = chg > 0 ? '+' : '';
          chgEl.textContent = sign + chg.toFixed(2) + '%';
          chgEl.className = 'hot-chg' + (chg < 0 ? ' is-neg' : '');
        } else {
          chgEl.textContent = '—';
          chgEl.className = 'hot-chg';
        }
      }
      const fr = parseFloat(spot.fundingRate8h_pct);
      if (frEl) {
        frEl.textContent = Number.isFinite(fr)
          ? ('8H FR: ' + (fr >= 0 ? '' : '') + fr.toFixed(4) + '%')
          : '8H FR: —';
      }
      const pts = sparklinePoints(chg);
      const stroke = Number.isFinite(chg) && chg < 0 ? '#f87171' : '#45C4B4';
      const fill = Number.isFinite(chg) && chg < 0 ? 'rgba(248,113,113,0.18)' : 'rgba(52,211,153,0.18)';
      if (lineEl) {
        lineEl.setAttribute('points', pts);
        lineEl.setAttribute('stroke', stroke);
      }
      if (fillEl) {
        fillEl.setAttribute('points', pts + ' 94,28 2,28');
        fillEl.setAttribute('fill', fill);
      }
    }

    function refreshBannerHeatStatus() {
      const heatLamp = document.getElementById('gkHeatLamp');
      const heatPanel = document.getElementById('liveVolHeatPanel');
      const state = lastHeatState || 'safe';
      const heat = STATUS_DICTIONARY.VOLATILITY_HEAT;
      const hb = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT;
      const flashMode = tradeMode === 'FLASH';

      if (heatLamp && flashMode) {
        const flash = STATUS_DICTIONARY.TRADE_MODES.FLASH;
        heatLamp.className = 'banner-heat-status is-flash sv-tip';
        heatLamp.textContent = '⚡ ' + flash.lamp;
        applySvTip(heatLamp, flash.desc, flash.lamp);
        heatLamp.style.color = '#A5B4FC';
      } else {
        let entry = heat.SAFE;
        let hbEntry = hb.SAFE;
        let prefix = '🟢 ';
        if (state === 'extreme') {
          entry = heat.DANGER;
          hbEntry = hb.LOCKED;
          prefix = '🔴 ';
        } else if (state === 'elevated') {
          entry = heat.ELEVATED;
          hbEntry = hb.ELEVATED;
          prefix = '🟡 ';
        }
        if (heatLamp) {
          heatLamp.className = 'banner-heat-status is-' + state + ' sv-tip';
          heatLamp.textContent = prefix + hbEntry.label;
          applySvTip(heatLamp, entry.desc, entry.label);
          heatLamp.style.color = hbEntry.color;
        }
      }
      if (heatPanel) {
        const tipEntry = state === 'extreme' ? heat.DANGER : state === 'elevated' ? heat.ELEVATED : heat.SAFE;
        applySvTip(heatPanel, tipEntry.desc, 'Live Volatility Heat · ' + tipEntry.label);
      }
    }

    function refreshGatekeeperDefenseMatrix() {
      const heatScoreEl = document.getElementById('gkHeatScore');
      const heatScoreRight = document.getElementById('liveVolHeatScore');
      const heatMeta = document.getElementById('liveVolHeatMeta');
      const gasEl = document.getElementById('gkGasReadout');
      const frEl = document.getElementById('gkFrictionReadout');
      const slipEl = document.getElementById('gkSlipReadout');
      const geoPill = document.getElementById('gkStatusGeo');
      const slipPill = document.getElementById('gkStatusSlippage');
      const slPill = document.getElementById('gkStatusSl');

      const state = lastHeatState || 'safe';
      refreshBannerHeatStatus();
      const scoreText = Number.isFinite(lastHeatScore) ? lastHeatScore.toFixed(1) : '--';
      if (heatScoreEl) heatScoreEl.textContent = scoreText;
      if (heatScoreRight) heatScoreRight.textContent = scoreText;
      if (heatMeta) {
        heatMeta.textContent = state === 'extreme'
          ? 'Heat score · CIRCUIT RISK ELEVATED'
          : (state === 'elevated' ? 'Heat score · caution zone' : 'Heat score · VIX / DVOL composite');
      }
      if (gasEl) gasEl.textContent = '$' + (getStep3FixedCost ? getStep3FixedCost() : 2.5).toFixed(2);
      if (frEl) {
        const rate = getStep3FrictionRate ? getStep3FrictionRate() : 0.0024;
        frEl.textContent = (rate * 100).toFixed(2) + '%';
      }
      let slipRatio = null;
      if (slipEl) {
        if (selectedConsoleAsset && typeof slipForNotionalDynamic === 'function') {
          slipRatio = slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd || 10000);
          slipEl.textContent = (slipRatio * 100).toFixed(3) + '%';
        } else {
          slipEl.textContent = 'standby';
        }
      }

      // Root 2 GEO LOCK defaults to PASS in client UI (server enforces restricted geos).
      const geoOk = true;
      // Root 8 physical slippage breaker: 0.5% max limit (Flash hard-weld included).
      const slipCeil = (tradeMode === 'FLASH' ? FLASH_HARD_LOCKS.maxSlippage : 0.005);
      const slipOk = !(Number.isFinite(slipRatio) && slipRatio > slipCeil);
      const R = STATUS_DICTIONARY.ROOT_TAGS;
      if (geoPill) {
        geoPill.className = 'gk-status-pill sv-tip' + (geoOk ? '' : ' is-fail');
        geoPill.textContent = geoOk ? R.ROOT2_GEO_LOCK.ok : R.ROOT2_GEO_LOCK.fail;
        applySvTip(
          geoPill,
          geoOk ? R.ROOT2_GEO_LOCK.desc : (R.ROOT2_GEO_LOCK.lockDesc || R.ROOT2_GEO_LOCK.desc),
          geoOk ? R.ROOT2_GEO_LOCK.ok : R.ROOT2_GEO_LOCK.fail
        );
      }
      if (slipPill) {
        slipPill.className = 'gk-status-pill sv-tip' + (slipOk ? '' : ' is-fail');
        slipPill.textContent = slipOk ? R.ROOT8_SLIPPAGE_BREAKER.ok : R.ROOT8_SLIPPAGE_BREAKER.fail;
        applySvTip(
          slipPill,
          slipOk ? R.ROOT8_SLIPPAGE_BREAKER.desc : (R.ROOT8_SLIPPAGE_BREAKER.tripDesc || R.ROOT8_SLIPPAGE_BREAKER.desc),
          slipOk ? R.ROOT8_SLIPPAGE_BREAKER.ok : R.ROOT8_SLIPPAGE_BREAKER.fail
        );
      }
      if (slPill) {
        slPill.className = 'gk-status-pill sv-tip';
        slPill.textContent = formatMaxSlWeldLabel();
        applySvTip(slPill, formatMaxSlWeldDesc(), formatMaxSlWeldLabel());
      }
      refreshCriAndStatusHud();
    }

    let rootTelemetryRendering = false;

    function renderRootTelemetry() {
      const grid = document.getElementById('rootTelemetryGrid');
      if (!grid || rootTelemetryRendering) return;
      rootTelemetryRendering = true;
      try {
      ROOT_DEFENSE_TELEMETRY[2].status = 'ACTIVE';
      ROOT_DEFENSE_TELEMETRY[6].status = 'ENGAGED';
      ROOT_DEFENSE_TELEMETRY[13].status = 'READY';
      ROOT_DEFENSE_TELEMETRY[18].status = 'ACTIVE';
      ROOT_DEFENSE_TELEMETRY[19].status = 'ACTIVE';
      const root17Check = checkRoot17DailyLimit({
        accountEquityUsd: resolveAccountEquityUsd(),
        state: root17DailyState,
      });
      if (ROOT_DEFENSE_TELEMETRY[16]) {
        ROOT_DEFENSE_TELEMETRY[16].status = root17Check.tripped ? 'TRIPPED' : 'READY';
        ROOT_DEFENSE_TELEMETRY[16].label = 'Daily Drawdown Cap ($' +
          root17Check.maxDailyLossUsd.toFixed(0) + ' · 3 SL/day)';
      }
      const tips = STATUS_DICTIONARY.ROOT_TELEMETRY_TIPS || {};
      const labels = STATUS_DICTIONARY.ROOT_TELEMETRY_LABELS || {};
      const tiers = STATUS_DICTIONARY.ROOT_TELEMETRY_TIERS || {};
      const statusMap = collectRootStatusesForCri();
      const trippedSet = {};
      Object.keys(statusMap).forEach(function(k) {
        if (statusMap[k] === 'TRIPPED') trippedSet[k] = true;
      });
      const byRoot = {};
      ROOT_DEFENSE_TELEMETRY.forEach(function(row) {
        byRoot[row.root] = row;
      });
      const tierOrder = ['TIER1', 'TIER2', 'TIER3', 'TIER4'];
      const tierCardClass = function(rootNum) {
        if (rootNum <= 6) return 'is-tier1';
        if (rootNum <= 12) return 'is-tier2';
        if (rootNum <= 16) return 'is-tier3';
        return 'is-tier4';
      };
      grid.innerHTML = tierOrder.map(function(key) {
        const tier = tiers[key];
        if (!tier) return '';
        const accent = String(tier.accent || 'emerald');
        const rowsHtml = (tier.roots || []).map(function(rootNum) {
          const row = byRoot[rootNum];
          if (!row) return '';
          const tipRaw = tips[rootNum] || tips[String(rootNum)] || ('Root ' + rootNum + ' defense algorithm status.');
          const nameRaw = labels[rootNum] || labels[String(rootNum)] || row.label || ('Root ' + rootNum);
          const tip = tooltipPrimitive(tipRaw);
          const name = tooltipPrimitive(nameRaw);
          const displayLabel = 'R' + rootNum + ': ' + name;
          const tooltipLabel = 'Root ' + rootNum + ': ' + name;
          const tripped = !!trippedSet[rootNum];
          const status = tripped ? 'TRIPPED' : tooltipPrimitive(row.status || 'READY');
          return '<div class="root-telemetry-row sv-tip ' + tierCardClass(rootNum) +
            (tripped ? ' is-tripped' : '') + '" tabindex="0" data-sv-tip="' + escapeTooltipHtml(tip) +
            '" data-sv-label="' + escapeTooltipHtml(tooltipLabel) + '">' +
            '<span>' + escapeTooltipHtml(displayLabel) + '</span>' +
            '<span class="root-telemetry-status ' + status + '">[' + status + ']</span>' +
          '</div>';
        }).join('');
        return (
          '<section class="root-telemetry-tier is-' + escapeTooltipHtml(accent) + '" aria-label="' + escapeTooltipHtml(tooltipPrimitive(tier.title || tier.header)) + '">' +
            '<header class="root-telemetry-tier-header">' +
              '<span class="root-telemetry-tier-badge">' + escapeTooltipHtml(tooltipPrimitive((tier.emoji ? tier.emoji + ' ' : '') + (tier.badge || ''))) + '</span>' +
              '<span class="root-telemetry-tier-title">' + escapeTooltipHtml(tooltipPrimitive(tier.header || tier.title)) + '</span>' +
              '<span class="root-telemetry-tier-focus">' + escapeTooltipHtml(tooltipPrimitive(tier.focus || '')) + '</span>' +
            '</header>' +
            '<div class="root-telemetry-tier-body">' + rowsHtml + '</div>' +
          '</section>'
        );
      }).join('');
      } finally {
        rootTelemetryRendering = false;
      }
    }

    function pushExecLog(msg, kind) {
      const stream = document.getElementById('execLogStream');
      appendStep1CondensedLog(msg, kind === 'warn' ? 'warn' : kind === 'err' ? 'error' : 'ok');
      if (!stream) return;
      const line = document.createElement('div');
      line.className = 'log-line' + (kind === 'warn' ? ' log-warn' : kind === 'err' ? ' log-err' : ' log-ok');
      const time = new Date().toLocaleTimeString();
      line.textContent = '[' + time + '] ' + msg;
      stream.appendChild(line);
      while (stream.childNodes.length > 120) stream.removeChild(stream.firstChild);
      stream.scrollTop = stream.scrollHeight;
    }

    function renderActivePositions() {
      const body = document.getElementById('activePositionsBody');
      if (!body) return;
      if (!openPositions.length) {
        body.innerHTML = '<tr id="activePositionsEmpty"><td colspan="5" class="text-gray-500">No open positions</td></tr>';
        syncHeaderVault();
        return;
      }
      body.innerHTML = openPositions.map(function(p) {
        const pnlClass = p.pnlUsd >= 0 ? 'text-emerald-300' : 'text-rose-300';
        return '<tr data-pos-id="' + p.id + '">' +
          '<td class="typo-num">' + p.symbol + '</td>' +
          '<td class="typo-num">$' + p.sizeUsd.toLocaleString() + '</td>' +
          '<td class="typo-num">' + p.dynSlPct.toFixed(2) + '%</td>' +
          '<td class="typo-num ' + pnlClass + '">$' + p.pnlUsd.toFixed(2) + '</td>' +
          '<td><button type="button" class="quick-close-btn" onclick="closePosition(' + p.id + ')">CLOSE POSITION</button></td>' +
        '</tr>';
      }).join('');
      syncHeaderVault();
    }

    function storePostTradeReview(kind) {
      const entry = {
        kind: kind,
        at: new Date().toISOString(),
        log: 'Review: [ ' + kind + ' ]',
      };
      try {
        const raw = localStorage.getItem(POST_TRADE_REVIEW_KV_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const arr = Array.isArray(list) ? list : [];
        arr.push(entry);
        while (arr.length > 50) arr.shift();
        localStorage.setItem(POST_TRADE_REVIEW_KV_KEY, JSON.stringify(arr));
      } catch (e) { /* private mode */ }
      return entry.log;
    }

    function showPostTradeReviewToast(text) {
      const existing = document.getElementById('postTradeReviewToast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'postTradeReviewToast';
      toast.className = 'post-trade-review-toast';
      toast.textContent = text;
      document.body.appendChild(toast);
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 3000);
    }

    function closePosition(posId) {
      const idx = openPositions.findIndex(function(p) { return p.id === posId; });
      if (idx < 0) return;
      const pos = openPositions[idx];
      // Demo exit classifier: small random TP/SL, else Manual Exit
      const roll = Math.random();
      let kind = 'Manual Exit';
      if (roll < 0.25) { kind = 'Hit TP'; pos.pnlUsd = Math.abs(pos.pnlUsd) + 12; }
      else if (roll < 0.4) {
        kind = 'Hit SL';
        const maxSl = resolveEffectiveMaxSlUsd();
        pos.pnlUsd = -Math.min(maxSl, Math.abs(pos.pnlUsd) + 18);
        root17DailyState = recordRoot17SlTrip(root17DailyState, Math.abs(pos.pnlUsd));
        refreshCriAndStatusHud();
      }
      settledPnlUsd += pos.pnlUsd;
      openPositions.splice(idx, 1);
      const reviewLog = storePostTradeReview(kind);
      showPostTradeReviewToast(reviewLog);
      pushExecLog('[STEP 4] ' + reviewLog + ' · ' + pos.symbol + ' · Root 19-20 closure ACTIVE', 'ok');
      addLog('[STEP 4] ' + reviewLog + ' · closed ' + pos.symbol, 'success');
      const vaultLast = document.getElementById('vaultLastAttack');
      if (vaultLast) vaultLast.innerText = 'CLOSED ' + pos.symbol + ' · ' + kind;
      renderActivePositions();
      updateMasterConsoleSlippage();
    }

    function connectWallet() {
      const backdrop = document.getElementById('walletModalBackdrop');
      if (backdrop) backdrop.classList.remove('hidden');
    }

    function closeWalletModal(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      const backdrop = document.getElementById('walletModalBackdrop');
      if (backdrop) backdrop.classList.add('hidden');
    }

    function shortenAddress(addr) {
      const a = String(addr || '');
      if (a.length < 10) return a;
      return a.slice(0, 6) + '…' + a.slice(-4);
    }

    async function mockConnectWallet(providerName) {
      const statusEl = document.getElementById('walletModalStatus');
      const btn = document.getElementById('connectWalletBtn');
      const label = document.getElementById('connectWalletLabel');
      if (statusEl) statusEl.textContent = 'Connecting via ' + providerName + '…';

      try {
        if (providerName === 'MetaMask' && window.ethereum && window.ethereum.request) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts[0]) {
            connectedWalletAddress = accounts[0];
          }
        }
      } catch (err) {
        if (statusEl) statusEl.textContent = 'Provider denied — falling back to mock session.';
      }

      if (!connectedWalletAddress) {
        connectedWalletAddress = '0x' + Array.from({ length: 40 }, function() {
          return Math.floor(Math.random() * 16).toString(16);
        }).join('');
      }

      if (btn) btn.classList.add('connected');
      if (label) label.textContent = shortenAddress(connectedWalletAddress);
      // Mock withdrawable collateral for Margin Guard
      withdrawableCollateralUsd = 25000;
      const marginReadout = document.getElementById('walletMarginReadout');
      if (marginReadout) {
        marginReadout.textContent = 'Withdrawable: $' + withdrawableCollateralUsd.toLocaleString();
        marginReadout.className = 'typo-context text-emerald-300 mt-1';
      }
      if (statusEl) statusEl.textContent = 'Connected · ' + providerName + ' · ' + shortenAddress(connectedWalletAddress);
      addLog('[WALLET] Connected via ' + providerName + ': ' + shortenAddress(connectedWalletAddress) + ' · collateral $' + withdrawableCollateralUsd.toLocaleString(), 'success');
      pushExecLog('[WALLET] Margin Guard armed · withdrawable $' + withdrawableCollateralUsd.toLocaleString(), 'ok');
      syncHeaderVault();
      applyCapitalUsd(resolveVaultEquityUsd(), { forceInput: true, sanitize: true });
      updateMasterConsoleSlippage();
      refreshRoleEligibility().then(function(elig) {
        pushExecLog('[ROLE] HL TXs=' + elig.txCount + ' · max mode ' + elig.maxMode, 'ok');
      });
      setTimeout(function() {
        const backdrop = document.getElementById('walletModalBackdrop');
        if (backdrop) backdrop.classList.add('hidden');
      }, 500);
    }

    const GATEKEEPER_AUTH_KEY = ${JSON.stringify(GATEKEEPER_AUTH_STORAGE_KEY)};

    function isValidWalletRef(ref) {
      if (typeof ref !== 'string') return false;
      const value = ref.trim();
      if (!value) return false;
      const lower = value.toLowerCase();
      const whitelist = ${JSON.stringify([...GATEKEEPER_REF_WHITELIST])};
      for (let i = 0; i < whitelist.length; i++) {
        if (String(whitelist[i]).toLowerCase() === lower) return true;
      }
      return /^0x[a-fA-F0-9]{40}$/.test(value);
    }

    function readGatekeeperAuth() {
      try {
        return localStorage.getItem(GATEKEEPER_AUTH_KEY);
      } catch (e) {
        return null;
      }
    }

    function writeGatekeeperAuth(value) {
      try {
        localStorage.setItem(GATEKEEPER_AUTH_KEY, value);
      } catch (e) { /* private mode / quota */ }
    }

    function runGatekeeper() {
      const params = new URLSearchParams(window.location.search || '');
      let ref = params.get('ref');
      if (!isValidWalletRef(ref)) {
        const stored = readGatekeeperAuth();
        if (isValidWalletRef(stored)) {
          ref = String(stored).trim();
          window.location.search = '?ref=' + encodeURIComponent(ref);
          return false;
        }
      }
      if (isValidWalletRef(ref)) {
        writeGatekeeperAuth(String(ref).trim());
        return true;
      }
      document.body.innerHTML =
        '<div class="gatekeeper-screen">' +
          '<div class="gatekeeper-card font-mono">' +
            brandShieldImg('brand-shield-icon-xl', 40) +
            '<h1 style="color:#50D2C1;font-weight:900;font-size:1.15rem;letter-spacing:0.04em;margin-bottom:0.75rem;">SILVERVINE LABS | PRIVATE BETA ACCESS</h1>' +
            '<p style="color:#e8fff0;font-weight:800;font-size:0.95rem;line-height:1.5;">Internal quant risk-control beta terminal. Enter your authorized Pass to continue.</p>' +
            '<p style="color:#9ca3af;font-size:0.75rem;margin-top:0.75rem;line-height:1.5;">Whitelist Pass / Wallet Ref Example: <code style="color:#50D2C1;">0x...</code> (40-char hex address)</p>' +
            '<form class="gate-form" id="gateForm" autocomplete="off" style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1.25rem;text-align:left;">' +
              '<label for="gatePassInput" style="font-size:0.75rem;font-weight:800;color:#9ca3af;">Pass Key / Wallet Address</label>' +
              '<input id="gatePassInput" type="password" name="ref" placeholder="Enter Pass Key or 0x Wallet Address..." spellcheck="false" autocapitalize="off" autocomplete="off" required style="width:100%;box-sizing:border-box;padding:0.85rem 1rem;border-radius:0.75rem;border:2px solid rgba(80,210,193,0.45);background:rgba(0,0,0,0.45);color:#e8fff0;font-family:inherit;font-size:0.9rem;font-weight:700;outline:none;" />' +
              '<p id="gateError" role="alert" style="display:none;margin:0;color:#f87171;font-size:0.75rem;font-weight:800;">Invalid Pass or wallet address. Enter a whitelist pass or valid 0x wallet.</p>' +
              '<button type="submit" style="display:inline-flex;align-items:center;justify-content:center;width:100%;box-sizing:border-box;padding:0.85rem 1.25rem;border-radius:0.75rem;border:2px solid #50D2C1;background:#50D2C1;color:#051311;font-weight:900;font-size:0.9rem;font-family:inherit;cursor:pointer;box-shadow:0 0 24px rgba(80,210,193,0.35);">[ 🔓 UNLOCK TRADING TERMINAL ]</button>' +
            '</form>' +
          '</div>' +
        '</div>';
      (function bindInlineGate() {
        var form = document.getElementById('gateForm');
        var input = document.getElementById('gatePassInput');
        var errorEl = document.getElementById('gateError');
        if (!form || !input) return;
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          var value = String(input.value || '').trim();
          if (!isValidWalletRef(value)) {
            if (errorEl) errorEl.style.display = 'block';
            input.focus();
            return;
          }
          writeGatekeeperAuth(value);
          window.location.search = '?ref=' + encodeURIComponent(value);
        });
      })();
      return false;
    }

    function applyCountdownLockdown(wrapEl, countEl, secsLeft) {
      if (!wrapEl || !countEl) return;
      const locked = settlementLockdownDemoActive || secsLeft < SETTLEMENT_LOCKDOWN_SEC;
      if (locked) {
        countEl.innerText = 'LOCKDOWN';
        countEl.className = 'countdown-lockdown';
        wrapEl.className = 'mhb-hl settlement-active';
        wrapEl.style.color = '';
      } else {
        countEl.innerText = formatSettledMinutes(secsLeft);
        wrapEl.style.color = '';
        wrapEl.className = 'mhb-hl';
        countEl.className = '';
      }
    }

    function updateClocks() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const dateStr = "" + now.getFullYear() + "/" + pad(now.getMonth() + 1) + "/" + pad(now.getDate());
      const timeStrLong = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
      const clockEl = document.getElementById('topClock');
      if (clockEl) clockEl.innerText = "🕒 HKT: " + dateStr + " " + timeStrLong;

      const secsLeft = secondsToNextHour(now);
      settlementLockdownActive = secsLeft < SETTLEMENT_LOCKDOWN_SEC || settlementLockdownDemoActive;
      const hktHour = getHktHour(now);
      tsunamiShieldActive = hktHour >= 21 && hktHour < 23;
      const usSessionOpen = isUsSessionOpen(now);

      const tsunamiLamp = document.getElementById('tsunamiShieldLamp');
      if (tsunamiLamp) {
        if (tsunamiShieldActive) {
          tsunamiLamp.classList.remove('hidden');
        } else {
          tsunamiLamp.classList.add('hidden');
        }
      }
      applySettlementLockdownDemoUI();

      const hlWrap = document.getElementById('hlCountdownWrap');
      const hlCount = document.getElementById('hlCountdown');
      if (hlWrap) {
        if (settlementLockdownDemoActive || secsLeft < SETTLEMENT_LOCKDOWN_SEC) {
          hlWrap.className = 'mhb-hl settlement-active';
          if (hlCount) {
            hlCount.textContent = 'LOCKDOWN';
            hlCount.className = 'countdown-lockdown';
          } else {
            const R10 = STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI;
            hlWrap.innerHTML =
              '<span id="root10TsunamiTag" class="root-tag sv-tip" data-sv-tip="' + escapeTooltipHtml(R10.desc) + '" data-sv-label="' + escapeTooltipHtml(R10.label) + '">' + escapeTooltipHtml(R10.label) + '</span>' +
              '<span class="mhb-hl-text">HL Settled: <span id="hlCountdown" class="countdown-lockdown">LOCKDOWN</span></span>';
          }
        } else {
          hlWrap.className = 'mhb-hl';
          if (hlCount) {
            hlCount.textContent = formatSettledMinutes(secsLeft);
            hlCount.className = '';
          } else {
            const R10 = STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI;
            hlWrap.innerHTML =
              '<span id="root10TsunamiTag" class="root-tag sv-tip" data-sv-tip="' + escapeTooltipHtml(R10.desc) + '" data-sv-label="' + escapeTooltipHtml(R10.label) + '">' + escapeTooltipHtml(R10.label) + '</span>' +
              '<span class="mhb-hl-text">HL Settled: <span id="hlCountdown">' + formatSettledMinutes(secsLeft) + '</span></span>';
          }
        }
      }

      const sessionLabel = document.getElementById('heartbeatSessionLabel');
      if (sessionLabel && !shieldDemoRedAlertActive) {
        sessionLabel.textContent = 'Session: ' + resolveActiveSessionName(now);
      }

      const root10 = document.getElementById('root10VolWindow');
      if (root10) {
        const showRoot10 = tsunamiShieldActive || usSessionOpen || shieldDemoRedAlertActive;
        root10.classList.toggle('hidden', !showRoot10);
        root10.classList.toggle('is-active', showRoot10);
        if (showRoot10) {
          root10.textContent = '[ HKT 21-23 Window - HIGH VOLATILITY ]';
          applySvTip(root10, STATUS_DICTIONARY.ROOT_TAGS.ROOT10_TSUNAMI.desc, '[ HKT 21-23 Window - HIGH VOLATILITY ]');
        }
      }

      updateUsMacroCountdowns(now);
      updateRootSlipProtectionStatus();
      refreshGatekeeperDefenseMatrix();

      const asiaClock = document.getElementById('sessionAsiaClock');
      const euClock = document.getElementById('sessionEuropeClock');
      const usClock = document.getElementById('sessionUSClock');
      if (asiaClock) asiaClock.textContent = formatTzClock(now, 'Asia/Hong_Kong');
      if (euClock) euClock.textContent = formatTzClock(now, 'Europe/London');
      if (usClock) usClock.textContent = formatTzClock(now, 'America/New_York');
      setSessionStateEl(document.getElementById('sessionAsia'), isAsiaSessionOpen(now));
      setSessionStateEl(document.getElementById('sessionEurope'), isEuropeSessionOpen(now));
      setSessionStateEl(document.getElementById('sessionUS'), usSessionOpen);

      refreshAutoGuardBanner();
    }

    function addLog(msg, type="info") {
      const consoleBox = document.getElementById('consoleOutput');
      const friendly = humanizeConsoleMessage(msg);
      if (!friendly) return;
      appendStep1CondensedLog(friendly, type === 'success' ? 'ok' : type);
      if (!consoleBox) return;
      const time = new Date().toLocaleTimeString();
      let color = "text-gray-300";
      if (type === "success") color = "text-emerald-400";
      if (type === "error") color = "text-rose-400";
      if (type === "warn") color = "text-amber-400";

      const line = document.createElement('div');
      line.className = color;
      line.textContent = "[" + time + "] " + friendly;
      consoleBox.appendChild(line);
      // Cap DOM nodes to avoid memory death on long sessions
      while (consoleBox.childNodes.length > 200) {
        consoleBox.removeChild(consoleBox.firstChild);
      }
      consoleBox.scrollTop = consoleBox.scrollHeight;
    }

    function clearLogs() {
      const consoleBox = document.getElementById('consoleOutput');
      if (consoleBox) consoleBox.innerHTML = '<div class="text-emerald-400">[SYSTEM] Santenboku log cleared.</div>';
    }

    function fundingRiskTag(rate8hPct, side) {
      if (side === 'pos') {
        if (rate8hPct >= 0.15) return { cls: 'funding-tag funding-tag-bleed', label: '[ ⚠️ LONG BLEED ]' };
        if (rate8hPct >= 0.05) return { cls: 'funding-tag funding-tag-arb', label: '[ ⚡ BASIS ARB ]' };
        return { cls: 'funding-tag funding-tag-ok', label: '[ 🟢 FUNDING HEALTHY ]' };
      }
      if (rate8hPct <= -0.15) return { cls: 'funding-tag funding-tag-short', label: '[ 🚀 SHORT SQUEEZE ALERT ]' };
      if (rate8hPct <= -0.05) return { cls: 'funding-tag funding-tag-arb', label: '[ ⚡ BASIS ARB ]' };
      return { cls: 'funding-tag funding-tag-ok', label: '[ 🟢 FUNDING HEALTHY ]' };
    }

    function renderFundingWorldTreeList(items, side) {
      if (!items || items.length === 0) {
        return '<div class="text-gray-500 text-xs">No data</div>';
      }
      return items.map(function(item, idx) {
        const sign = item.rate8h_pct >= 0 ? '+' : '';
        const rate = sign + item.rate8h_pct.toFixed(4) + '%';
        const url = 'https://app.hyperliquid.xyz/trade/' + encodeURIComponent(item.symbol);
        const tag = fundingRiskTag(item.rate8h_pct, side);
        const linkCls = side === 'pos' ? 'funding-king-link funding-king-high' : 'funding-king-link funding-king-low';
        return '<div class="flex flex-wrap items-center gap-2">' +
          '<span class="text-[10px] text-gray-400 font-bold">#' + (idx + 1) + '</span>' +
          '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="' + linkCls + '">' +
            rate + ' ' + item.symbol +
          '</a>' +
          '<span class="' + tag.cls + '">' + tag.label + '</span>' +
        '</div>';
      }).join('');
    }

    function renderFundingRateKings(kings) {
      const el = document.getElementById('fundingRateKings');
      if (!el) return;
      if (!kings || (!kings.highest && !(kings.topPositive && kings.topPositive.length))) {
        el.innerHTML = '<span class="text-gray-500">No funding extremes · retry sync</span>';
        return;
      }
      const pos = (kings.topPositive && kings.topPositive.length)
        ? kings.topPositive
        : (kings.highest ? [kings.highest] : []);
      const neg = (kings.topNegative && kings.topNegative.length)
        ? kings.topNegative
        : (kings.lowest ? [kings.lowest] : []);
      function compactKingChips(items, side) {
        return (items || []).slice(0, 3).map(function(item) {
          if (!item) return '';
          const sym = String(item.symbol || item.b1_symbol || '—');
          const rateVal = Number(item.rate8h_pct);
          const sign = Number.isFinite(rateVal) && rateVal >= 0 ? '+' : '';
          const rate = (Number.isFinite(rateVal) ? sign + rateVal.toFixed(3) : '—') + '%';
          const url = 'https://app.hyperliquid.xyz/trade/' + encodeURIComponent(sym);
          const cls = side === 'pos' ? 'text-rose-300' : 'text-emerald-300';
          return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="typo-num ' + cls + ' hover:underline">' +
            sym + ' ' + rate + '</a>';
        }).filter(Boolean).join(' · ');
      }
      el.innerHTML =
        '<span class="text-rose-300/80 typo-action">LONG+</span> ' + (compactKingChips(pos, 'pos') || '--') +
        ' <span class="text-gray-600">|</span> ' +
        '<span class="text-emerald-300/80 typo-action">SHORT−</span> ' + (compactKingChips(neg, 'neg') || '--');
    }

    function renderStep2MarketPanels(payload) {
      payload = payload || {};
      try {
        renderTradFiPanels(
          payload.commodities || {},
          payload.stocks || {},
          payload.indices || {},
          payload.fx || {},
          payload.preipo || {},
          payload.tradfi_enrichment || null
        );
      } catch (err) {
        addLog('[Step 2] TradFi panel render failed: ' + (err && err.message ? err.message : String(err)), 'warn');
        renderTradFiPanels({}, {}, {}, {}, {}, null);
      }
      try {
        renderFundingRateKings(payload.funding_rate_kings || null);
      } catch (err) {
        addLog('[Step 2] Funding kings render failed: ' + (err && err.message ? err.message : String(err)), 'warn');
        renderFundingRateKings(null);
      }
      try {
        renderCryptoWorldTreePanel();
      } catch (err) {
        addLog('[Step 2] Crypto world-tree render failed: ' + (err && err.message ? err.message : String(err)), 'warn');
        const cryptoEl = document.getElementById('cryptoPanel');
        if (cryptoEl) cryptoEl.innerHTML = '<span class="text-gray-500 typo-context">HL feed unavailable</span>';
      }
      try {
        renderPreLaunchSpotlight(cachedTradFiEnrichment);
      } catch (_) { /* optional spotlight */ }
    }

    function toggleTheme() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    }

    async function fetchData() {
      const statusEl = document.getElementById('refreshStatus');
      try {
        if (statusEl) statusEl.innerText = 'syncing...';
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        let res;
        try {
          res = await response.json();
        } catch (parseErr) {
          throw new Error('Invalid /api/data JSON');
        }

        if (res && res.success) {
          if (res.systemState && typeof applySystemState === 'function') {
            applySystemState(res.systemState);
          }
          if (Array.isArray(res.data)) {
            globalData = res.data;
          } else if (Array.isArray(res.matrix)) {
            globalData = res.matrix;
          } else if (res.data && Array.isArray(res.data.list)) {
            globalData = res.data.list;
          } else if (Array.isArray(res.list)) {
            globalData = res.list;
          } else {
            globalData = [];
          }
          cachedHlUniverse = Array.isArray(res.hl_universe) ? res.hl_universe : [];
          currentPage = 1;

          const updatedEl = document.getElementById('lastUpdated');
          if (updatedEl) {
            updatedEl.innerText = 'Last updated HKT: ' + (res.timestamp_hkt || new Date().toLocaleString());
          }

          if (res.tsunami_shield_active === true) {
            tsunamiShieldActive = true;
          }
          try {
            updateVolatilityFilters(res.vix_traditional || 16.8, res.dvol_crypto || 52.5);
          } catch (_) { /* macro filters are non-fatal */ }

          renderStep2MarketPanels(res);

          try {
            applyDefaultConsoleToken();
          } catch (_) { /* console default is optional */ }

          if (Array.isArray(res.debug_system_logs)) {
            res.debug_system_logs.forEach(function(line) {
              if (line) addLog(String(line), 'success');
            });
          }

          addLog('Data sync success. Count: ' + globalData.length + ' pairs.', 'success');
          try {
            recalculate();
          } catch (recalcErr) {
            addLog('[Step 2] Matrix recalculate failed: ' + (recalcErr && recalcErr.message ? recalcErr.message : String(recalcErr)), 'warn');
          }
          if (typeof refreshCriAndStatusHud === 'function') {
            refreshCriAndStatusHud();
          }
          if (statusEl) statusEl.innerText = 'ok · ' + globalData.length + ' pairs';
        } else {
          const apiErr = (res && res.error) ? String(res.error) : 'Unknown';
          addLog('API Error: ' + apiErr, 'error');
          if (!globalData.length) renderStep2MarketPanels({});
          if (statusEl) statusEl.innerText = 'api error';
        }
      } catch (err) {
        addLog('Network Error: ' + (err && err.message ? err.message : String(err)), 'error');
        if (!globalData.length) renderStep2MarketPanels({});
        if (statusEl) statusEl.innerText = 'network error';
      }
    }

    async function forceRefresh() {
      const now = Date.now();
      if (forceRefreshInFlight) {
        addLog('[RISK ALERT] Sync in progress — duplicate FORCE REFRESH ignored', 'warn');
        return;
      }
      if (now - lastForceRefreshAt < FORCE_REFRESH_DEBOUNCE_MS) {
        const waitMs = FORCE_REFRESH_DEBOUNCE_MS - (now - lastForceRefreshAt);
        addLog('[RISK ALERT] FORCE REFRESH debounce active (remaining ' + Math.ceil(waitMs / 100) / 10 + 's) — protecting Workers quota', 'warn');
        return;
      }
      lastForceRefreshAt = now;
      forceRefreshInFlight = true;

      const btn = document.getElementById('forceRefreshBtn');
      const overlay = document.getElementById('forceRefreshOverlay');
      const cat = document.getElementById('forceRefreshCat');
      try {
        if (btn) {
          btn.setAttribute('disabled', 'true');
          btn.classList.add('opacity-50');
        }
        if (cat) cat.classList.remove('hidden');
        if (overlay) overlay.classList.add('active');
        await fetchData();
      } finally {
        forceRefreshInFlight = false;
        if (btn) {
          // Keep button disabled for remaining debounce window
          const elapsed = Date.now() - lastForceRefreshAt;
          const remain = Math.max(0, FORCE_REFRESH_DEBOUNCE_MS - elapsed);
          setTimeout(function() {
            btn.removeAttribute('disabled');
            btn.classList.remove('opacity-50');
          }, remain);
        }
        if (cat) cat.classList.add('hidden');
        if (overlay) overlay.classList.remove('active');
      }
    }

    function hlTradeUrl(hlSymbol) {
      const raw = String(hlSymbol || '');
      const cleaned = raw.replace(/^xyz:/i, '');
      return 'https://app.hyperliquid.xyz/trade/' + encodeURIComponent(cleaned);
    }

    /** TradFi / HIP-3 assets — keep xyz: prefix for Hyperliquid trade deep-links */
    function hlTradFiTradeUrl(hlSymbol) {
      const raw = String(hlSymbol || '').trim();
      const cleaned = raw.replace(/^xyz:/i, '');
      return 'https://app.hyperliquid.xyz/trade/xyz:' + encodeURIComponent(cleaned);
    }

    function formatMarkPrice(key, price) {
      const n = parseFloat(price);
      if (!Number.isFinite(n) || n <= 0) return null;
      const k = String(key || '').toLowerCase();
      if (['gold', 'platinum', 'xyz100', 'sp500', 'us500', 'jp225', 'kr200', 'qqq', 'nvda', 'amd', 'samsung', 'skhynix', 'dram', 'sndk', 'mu'].indexOf(k) >= 0) {
        return n.toFixed(2);
      }
      if (['natgas', 'wti', 'brent', 'silver', 'copper', 'eurusd', 'gbpusd', 'usdjpy', 'usdkrw', 'dxy'].indexOf(k) >= 0) {
        return n.toFixed(4);
      }
      return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }

    function formatOiNotionalUsd(value) {
      const n = parseFloat(value);
      if (!Number.isFinite(n) || n <= 0) return '—';
      if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
      if (n >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
      return '$' + n.toFixed(2);
    }

    function resolveAssetLabel(key, asset) {
      if (asset && asset.hlSymbol) {
        const sym = String(asset.hlSymbol).toUpperCase();
        if (COMMODITY_LABELS[key]) return COMMODITY_LABELS[key];
        return sym;
      }
      return COMMODITY_LABELS[key] || String(key).toUpperCase();
    }

    /**
     * Order-book soil estimator — square-root impact vs OI depth proxy.
     * Returns slippage ratios for $1K / $10K / $50K buys + SOIL tier from 10K.
     */
    function estimateSoilSlippage(asset) {
      const oiNotional = parseFloat(asset && asset.openInterestNotionalUsd);
      const absChg = Math.abs(parseFloat(asset && asset.change24h_pct) || 0);
      const depthUsd = Math.max(
        25000,
        (Number.isFinite(oiNotional) && oiNotional > 0 ? oiNotional : 5e6) * 0.015,
      );
      const volFactor = 1 + Math.min(absChg, 12) / 100;
      const impactK = 0.01;
      function slipForNotional(notional) {
        const ratio = impactK * Math.sqrt(notional / depthUsd) * volFactor;
        return Math.min(ratio, 0.05);
      }
      const slip1k = slipForNotional(1000);
      const slip10k = slipForNotional(10000);
      const slip50k = slipForNotional(50000);
      // SOLID ≤0.05% | LOOSE 0.05%–0.5% (core band 0.05%–0.2%) | DANGER >0.5%
      let tier = 'SOLID';
      if (slip10k > 0.005) tier = 'DANGER';
      else if (slip10k > 0.0005) tier = 'LOOSE';
      return { slip1k: slip1k, slip10k: slip10k, slip50k: slip50k, tier: tier, depthUsd: depthUsd };
    }

    function formatSlipPct(ratio) {
      return (ratio * 100).toFixed(2) + '%';
    }

    function soilDictEntryFromTier(tier) {
      const soil = STATUS_DICTIONARY.SOIL_RESISTANCE;
      if (tier === 'SOLID') return soil.COMPACT;
      if (tier === 'LOOSE') return soil.BALANCED;
      if (tier === 'WARNING' || tier === 'DANGER') return soil.LOOSE;
      return soil.BALANCED;
    }

    function soilBadgeClass(tier) {
      if (tier === 'DANGER') return 'soil-badge soil-danger';
      if (tier === 'WARNING') return 'soil-badge soil-warning';
      if (tier === 'LOOSE') return 'soil-badge soil-balanced';
      if (tier === 'SOLID') return 'soil-badge soil-solid';
      return 'soil-badge soil-balanced';
    }

    function soilBadgeLabel(tier) {
      const entry = soilDictEntryFromTier(tier);
      if (tier === 'DANGER') return '[ ' + entry.label + ' ] 🔴';
      if (tier === 'WARNING') return '[ ' + entry.label + ' ] 🟡';
      if (tier === 'LOOSE') return '[ ' + entry.label + ' ]';
      if (tier === 'SOLID') return '[ ' + entry.label + ' ]';
      return '[ SOIL: — ]';
    }

    function applySoilBadgeTip(badgeEl, tier) {
      if (!badgeEl) return;
      if (String(tier || '').toUpperCase() === 'DANGER') {
        const soil = STATUS_DICTIONARY.ROOT_TAGS.ROOT3_SOIL;
        applySvTip(
          badgeEl,
          soil.dangerDesc || soil.desc,
          soil.danger || '[ R3: SOIL DANGER ]'
        );
        return;
      }
      const entry = soilDictEntryFromTier(tier);
      applySvTip(badgeEl, entry.desc, entry.label);
    }

    function soilTooltipHtml(label, est) {
      return '<div class="soil-tooltip" role="tooltip">' +
        '<div class="soil-tooltip-title">📐 Slippage Estimator · ' + label + '</div>' +
        '<div class="soil-tooltip-row"><span>$1K Buy</span><span style="color:#50D2C1">' + formatSlipPct(est.slip1k) + '</span></div>' +
        '<div class="soil-tooltip-row"><span>$10K Buy</span><span style="color:#fbbf24">' + formatSlipPct(est.slip10k) + '</span></div>' +
        '<div class="soil-tooltip-row"><span>$50K Buy</span><span style="color:#fb923c">' + formatSlipPct(est.slip50k) + '</span></div>' +
        '<div class="soil-tooltip-row"><span>Depth Proxy</span><span style="color:#50D2C1">' + formatOiNotionalUsd(est.depthUsd) + '</span></div>' +
      '</div>';
    }

    let selectedConsoleAsset = null;
    let selectedConsoleKey = '';
    /** Alias for UI click-to-select state */
    let activeSelectedToken = '';
    let masterOrderSizeUsd = 10000;
    let consoleDefaultApplied = false;
    /** Cached best-pair APR % for live Block 01/05 slider updates (no full table rebuild) */
    let cachedBestAprPct = null;

    function assetFromMatrixRow(row) {
      if (!row) return null;
      const vol = parseFloat(row.vol_3d_avg);
      const oi = parseFloat(row.hl_oi_usd);
      return {
        markPrice: row.c1_hl_spot || row.d1_hl_perp,
        change24h_pct: 0,
        openInterestNotionalUsd: Number.isFinite(oi) && oi > 0
          ? oi
          : (Number.isFinite(vol) && vol > 0 ? vol : 5e6),
        fundingRateHourly: parseFloat(row.e1_hl_funding) || 0,
        fundingRate8h_pct: formatFunding8hPctFromHourly(row.e1_hl_funding),
        displayName: row.b1_symbol,
        hlSymbol: row.b1_symbol,
      };
    }

    function syncConsoleSelectionHighlights(key) {
      document.querySelectorAll('.world-tree-capsule.token-selected, .tradfi-asset-chip.token-selected').forEach(function(n) {
        n.classList.remove('token-selected');
      });
      const chips = document.querySelectorAll('.world-tree-capsule[data-token-key="' + key + '"], .tradfi-asset-chip[data-token-key="' + key + '"]');
      chips.forEach(function(c) { c.classList.add('token-selected'); });
      document.querySelectorAll('#matrixTableBody tr.token-row-selected').forEach(function(n) {
        n.classList.remove('token-row-selected');
      });
      const rows = document.querySelectorAll('#matrixTableBody tr[data-token-key="' + String(key).toUpperCase() + '"]');
      rows.forEach(function(r) { r.classList.add('token-row-selected'); });
      // also match lowercase tradfi keys on table if any
      const rowsLower = document.querySelectorAll('#matrixTableBody tr[data-token-key="' + String(key).toLowerCase() + '"]');
      rowsLower.forEach(function(r) { r.classList.add('token-row-selected'); });
    }

    function slipForNotionalDynamic(asset, notional) {
      const est = estimateSoilSlippage(asset);
      const depthUsd = est.depthUsd;
      const absChg = Math.abs(parseFloat(asset && asset.change24h_pct) || 0);
      const volFactor = 1 + Math.min(absChg, 12) / 100;
      const impactK = 0.01;
      return Math.min(impactK * Math.sqrt(notional / depthUsd) * volFactor, 0.05);
    }

    function tierFromSlip10k(slip10k) {
      if (slip10k > 0.005) return 'DANGER';
      if (slip10k > 0.0005) return 'LOOSE';
      return 'SOLID';
    }

    function soilTierFromOrderSize(usd) {
      // Soft tier for display — hard ATTACK lock uses dynamic Effective Max SL boundary
      const size = Number(usd) || 0;
      if (size >= 50000) return 'WARNING';
      if (size >= 15000) return 'WARNING';
      return 'LOOSE';
    }

    function injectTokenToMasterConsole(key, asset) {
      if (!asset && cachedTradFiEnrichment) {
        const cats = ['commodities', 'stocks', 'indices', 'fx', 'preipo'];
        const keyLower = String(key).toLowerCase();
        for (let i = 0; i < cats.length; i++) {
          const bucket = cachedTradFiEnrichment[cats[i]];
          if (bucket && bucket[key]) {
            asset = bucket[key];
            break;
          }
          if (bucket && bucket[keyLower]) {
            asset = bucket[keyLower];
            key = keyLower;
            break;
          }
        }
      }
      if (!asset && globalData && globalData.length) {
        const sym = String(key).toUpperCase();
        const cryptoBucket = buildCryptoAssetsFromMatrix();
        if (cryptoBucket[key] || cryptoBucket[key.toLowerCase()]) {
          asset = cryptoBucket[key] || cryptoBucket[key.toLowerCase()];
          key = key.toLowerCase();
        }
        for (let i = 0; i < globalData.length; i++) {
          if (String(globalData[i].b1_symbol).toUpperCase() === sym) {
            asset = assetFromMatrixRow(globalData[i]);
            key = sym;
            break;
          }
        }
      }
      if (!asset) {
        addLog('[CONSOLE] Token data not found: ' + key, 'warn');
        return;
      }
      selectedConsoleKey = key;
      activeSelectedToken = key;
      selectedConsoleAsset = asset;
      const labelEl = document.getElementById('consoleSelectedLabel');
      const label = resolveAssetLabel(key, asset);
      if (labelEl) {
        labelEl.className = 'inject-status-badge is-active text-slate-950';
        labelEl.innerHTML = '🎯 <span class="font-black">[ ' + label + ' ]</span> INJECTED';
      }
      syncConsoleSelectionHighlights(key);
      const warn = document.getElementById('attackWarning');
      if (warn) warn.classList.remove('hidden');
      triggerTargetLockFeedback(label);
      refreshAutoGuardBanner();
      pushExecLog('[INJECT] Target locked: ' + label + ' · Root Defense scanning', 'ok');
      addLog('[CONSOLE] Token injected: ' + label, 'info');
    }

    function triggerTargetLockFeedback(label) {
      const panel = document.getElementById('masterRiskConsole');
      const banner = document.getElementById('targetLockedBanner');
      const rail = document.getElementById('sniperExecutionShield');
      if (panel) {
        panel.classList.remove('target-lock-pulse');
        void panel.offsetWidth;
        panel.classList.add('target-lock-pulse');
        setTimeout(function() { panel.classList.remove('target-lock-pulse'); }, 700);
      }
      if (rail) {
        rail.classList.remove('soil-stress-shake');
        void rail.offsetWidth;
        rail.classList.add('soil-stress-shake');
        setTimeout(function() { rail.classList.remove('soil-stress-shake'); }, 500);
      }
      triggerDonDonOrangeTarget();
      if (banner) {
        banner.classList.add('is-active');
        banner.innerText = '🎯 TARGET LOCKED · ' + (label || '');
        setTimeout(function() { banner.classList.remove('is-active'); }, 2400);
      }
      if (rail && rail.scrollIntoView) {
        try { rail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
      }
    }

    function toggleDebugDrawer() {
      const drawer = document.getElementById('debugDrawer');
      const btn = document.getElementById('debugDrawerToggleBtn');
      if (!drawer) return;
      drawer.classList.toggle('is-collapsed');
      if (btn) btn.innerText = drawer.classList.contains('is-collapsed') ? 'Expand' : 'Collapse';
    }

    function showConsoleTokenPending() {
      const labelEl = document.getElementById('consoleSelectedLabel');
      if (!labelEl || selectedConsoleKey) return;
      labelEl.className = 'inject-status-badge is-pending text-slate-950';
      labelEl.innerHTML = '⏳ Waiting for token inject…';
    }

    function resolveTokenFromUrlParam() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        const raw = params.get('token') || params.get('symbol') || params.get('asset');
        if (!raw) return null;
        return String(raw).trim();
      } catch (e) {
        return null;
      }
    }

    function lookupAssetByKey(key) {
      if (!key) return null;
      const keyLower = String(key).toLowerCase();
      const keyUpper = String(key).toUpperCase();
      if (cachedTradFiEnrichment) {
        const cats = ['commodities', 'stocks', 'indices', 'fx', 'preipo'];
        for (let i = 0; i < cats.length; i++) {
          const bucket = cachedTradFiEnrichment[cats[i]];
          if (!bucket) continue;
          if (bucket[key]) return { key: key, asset: bucket[key] };
          if (bucket[keyLower]) return { key: keyLower, asset: bucket[keyLower] };
          if (bucket[keyUpper]) return { key: keyUpper, asset: bucket[keyUpper] };
        }
      }
      if (typeof buildCryptoAssetsFromMatrix === 'function') {
        const cryptoBucket = buildCryptoAssetsFromMatrix();
        if (cryptoBucket[key]) return { key: key, asset: cryptoBucket[key] };
        if (cryptoBucket[keyLower]) return { key: keyLower, asset: cryptoBucket[keyLower] };
        if (cryptoBucket[keyUpper]) return { key: keyUpper, asset: cryptoBucket[keyUpper] };
      }
      if (globalData && globalData.length) {
        for (let i = 0; i < globalData.length; i++) {
          if (String(globalData[i].b1_symbol).toUpperCase() === keyUpper) {
            return { key: keyUpper, asset: assetFromMatrixRow(globalData[i]) };
          }
        }
      }
      if (cachedSpotlight && (String(cachedSpotlight.key || '').toUpperCase() === keyUpper
          || String(cachedSpotlight.hlSymbol || '').toUpperCase() === keyUpper
          || String(cachedSpotlight.displayName || '').toUpperCase() === keyUpper)) {
        return {
          key: cachedSpotlight.key || cachedSpotlight.hlSymbol || keyUpper,
          asset: {
            markPrice: cachedSpotlight.markPrice,
            change24h_pct: cachedSpotlight.change24h_pct,
            openInterestNotionalUsd: cachedSpotlight.openInterestNotionalUsd || 5e6,
            fundingRateHourly: cachedSpotlight.fundingRateHourly || ((cachedSpotlight.fundingRate8h_pct || 0) / 800),
            fundingRate8h_pct: cachedSpotlight.fundingRate8h_pct,
            displayName: cachedSpotlight.displayName || keyUpper,
            hlSymbol: cachedSpotlight.hlSymbol || keyUpper,
          },
        };
      }
      return null;
    }

    /**
     * Resolve Step 3 token dynamically from #1 APR best hedge (bestHedgeList[0]).
     * Never hardcode static symbols (QNT / CASHCAT). URL param still wins when present.
     */
    function applyDefaultConsoleToken() {
      if (selectedConsoleKey && selectedConsoleAsset) {
        consoleDefaultApplied = true;
        return;
      }

      // 1) URL ?token= / ?symbol= / ?asset=
      const urlToken = resolveTokenFromUrlParam();
      if (urlToken) {
        const found = lookupAssetByKey(urlToken);
        if (found) {
          consoleDefaultApplied = true;
          injectTokenToMasterConsole(found.key, found.asset);
          return;
        }
      }

      // 2) Top-ranked Best Hedge (#1 APR) — primary dynamic bind for Step 3
      const topHedge = (bestHedgeList && bestHedgeList[0]) || cachedBestHedgeRow;
      if (topHedge && topHedge.b1_symbol) {
        consoleDefaultApplied = true;
        injectTokenToMasterConsole(topHedge.b1_symbol, assetFromMatrixRow(topHedge));
        return;
      }

      // 3) No token yet — keep skeleton / pending state
      showConsoleTokenPending();
    }

    function setDashboardModalOpen(backdropId, open) {
      const backdrop = document.getElementById(backdropId);
      if (!backdrop) return;
      if (open) {
        backdrop.classList.remove('hidden');
        backdrop.setAttribute('aria-hidden', 'false');
      } else {
        backdrop.classList.add('hidden');
        backdrop.setAttribute('aria-hidden', 'true');
      }
    }

    function closeAllDashboardModals() {
      [
        'legalModalBackdrop',
        'quickTourBackdrop',
        'sopGuideBackdrop',
        'demoHubBackdrop',
        'walletModalBackdrop',
        'toxicModeBackdrop',
      ].forEach(function(id) {
        setDashboardModalOpen(id, false);
      });
    }

    function bindDashboardModalEscapeDismiss() {
      document.addEventListener('keydown', function(event) {
        if (event.key !== 'Escape') return;
        closeLegalModal();
        closeQuickTour();
        closeSopGuide();
        if (typeof closeDemoControlHub === 'function') closeDemoControlHub();
        if (typeof closeWalletModal === 'function') closeWalletModal();
      });
    }

    function openLegalModal(kind) {
      const title = document.getElementById('legalModalTitle');
      const body = document.getElementById('legalModalBody');
      const NON_CUSTODIAL =
        'SliverVine Labs provides an open-source, non-custodial risk-control execution terminal. SliverVine Labs never holds user private keys, custodial funds, or execution authority.';
      const HARD_RISK_LIMIT =
        'All trades are executed directly via decentralized venue contracts (e.g., Hyperliquid / Jupiter). While the terminal enforces a dynamic Effective Max SL circuit breaker — (Account Equity × 1%) + $100 — and soil resistance checks (<code>checkSoilResistance()</code>), market slippage, orderbook gaps, and blockchain congestion remain subject to venue conditions.';
      const PRIVACY_POLICY =
        'No personal identity data is stored. On-chain telemetry and telemetry logs are processed locally or via stateless Cloudflare Workers without tracking individual users.';
      const copyByKind = {
        tc: {
          title: 'Terms of Service',
          html:
            '<p><strong>Non-Custodial Architecture</strong>' + NON_CUSTODIAL + '</p>' +
            '<p><strong>Hard Risk Limit Notice</strong>' + HARD_RISK_LIMIT + '</p>',
        },
        privacy: {
          title: 'Privacy Policy',
          html:
            '<p><strong>Privacy Policy</strong>' + PRIVACY_POLICY + '</p>' +
            '<p><strong>Non-Custodial Architecture</strong>' + NON_CUSTODIAL + '</p>',
        },
        disclaimer: {
          title: 'Risk Disclaimer',
          html:
            '<p><strong>Hard Risk Limit Notice</strong>' + HARD_RISK_LIMIT + '</p>' +
            '<p><strong>Non-Custodial Architecture</strong>' + NON_CUSTODIAL + '</p>',
        },
      };
      const selected = copyByKind[kind] || copyByKind.tc;
      if (title) title.innerText = selected.title;
      if (body) body.innerHTML = selected.html;
      setDashboardModalOpen('legalModalBackdrop', true);
    }

    function closeLegalModal(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      setDashboardModalOpen('legalModalBackdrop', false);
    }

    function openQuickTour() {
      setDashboardModalOpen('quickTourBackdrop', true);
    }

    function closeQuickTour(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      setDashboardModalOpen('quickTourBackdrop', false);
    }

    function openSopGuide() {
      setDashboardModalOpen('sopGuideBackdrop', true);
    }

    function closeSopGuide(event) {
      if (event && event.target && event.currentTarget && event.target !== event.currentTarget) return;
      setDashboardModalOpen('sopGuideBackdrop', false);
    }

    function refreshCapitalPresetsFromVault() {
      const vault = resolveVaultEquityUsd();
      document.querySelectorAll('.capital-preset-btn[data-capital]').forEach(function(btn) {
        const v = parseFloat(btn.getAttribute('data-capital'));
        const exceeds = Number.isFinite(v) && v > vault;
        btn.disabled = exceeds;
        btn.classList.toggle('is-disabled', exceeds);
        btn.title = exceeds
          ? 'Exceeds vault ($' + vault.toLocaleString() + ')'
          : 'Set CAPITAL to $' + v.toLocaleString();
      });
      syncCapitalPresetButtons();
    }

    function syncCapitalPresetButtons() {
      const vault = resolveVaultEquityUsd();
      document.querySelectorAll('.capital-preset-btn[data-capital]').forEach(function(btn) {
        const v = parseFloat(btn.getAttribute('data-capital'));
        btn.classList.toggle('is-active', Number.isFinite(v) && v === capitalUsd && v <= vault);
      });
      document.querySelectorAll('.capital-preset-btn[data-vault-pct]').forEach(function(btn) {
        const pct = parseFloat(btn.getAttribute('data-vault-pct'));
        if (!Number.isFinite(pct) || pct <= 0) {
          btn.classList.remove('is-active');
          return;
        }
        const target = Math.round((vault * pct) / 100);
        // Active when CAPITAL matches vault% (within $1 rounding)
        btn.classList.toggle('is-active', Math.abs(capitalUsd - target) < 1);
      });
    }

    function applyCapitalUsd(raw, opts) {
      const options = opts || {};
      capitalUsd = sanitizeCapitalUsd(raw);
      const capitalInput = document.getElementById('capitalInput');
      if (capitalInput) {
        capitalInput.max = String(resolveVaultEquityUsd());
        if (options.forceInput || sanitizeCapitalUsd(capitalInput.value) !== capitalUsd || options.sanitize) {
          capitalInput.value = String(capitalUsd);
        }
      }
      const block2 = document.getElementById('block2CapitalDisplay');
      if (block2) block2.innerText = '$' + capitalUsd.toLocaleString();
      refreshCapitalPresetsFromVault();
      // Re-bound mega slider max to capital ∩ vault (capped $1k–$100k)
      const slider = document.getElementById('masterOrderSizeSlider');
      const maxSize = resolveOrderSizeMaxUsd(capitalUsd);
      if (slider) {
        slider.min = '1000';
        slider.max = String(maxSize);
        slider.step = '1000';
      }
      const maxLabel = document.getElementById('orderSizeSliderMaxLabel');
      if (maxLabel) maxLabel.textContent = '$' + (maxSize >= 1000 ? (maxSize / 1000) + 'K' : maxSize);
      const midLabel = document.getElementById('orderSizeSliderMid');
      if (midLabel) {
        const mid = Math.round(maxSize / 2000) * 1000;
        midLabel.textContent = mid >= 1000 ? '$' + (mid / 1000) + 'K' : String(mid);
      }
      masterOrderSizeUsd = clampOrderSizeUsd(masterOrderSizeUsd, capitalUsd);
      syncOrderSizeUi(masterOrderSizeUsd);
      updateStep3BlockEconomics();
      updateMasterConsoleSlippage();
    }

    function setCapitalPreset(usd) {
      const vault = resolveVaultEquityUsd();
      const requested = typeof usd === 'number' ? usd : parseFloat(String(usd));
      if (Number.isFinite(requested) && requested > vault) {
        pushExecLog('[CAPITAL] $' + requested.toLocaleString() + ' exceeds vault $' + vault.toLocaleString() + ' — clamped', 'warn');
      }
      applyCapitalUsd(usd, { forceInput: true, sanitize: true });
      pushExecLog('[CAPITAL] Preset $' + sanitizeCapitalUsd(usd).toLocaleString() + ' / vault $' + vault.toLocaleString(), 'ok');
    }

    function setCapitalVaultPct(pct) {
      const vault = resolveVaultEquityUsd();
      const p = Math.max(0, Math.min(100, Number(pct) || 0));
      const usd = Math.round((vault * p) / 100);
      applyCapitalUsd(usd, { forceInput: true, sanitize: true });
      pushExecLog('[CAPITAL] Vault ' + p + '% → $' + sanitizeCapitalUsd(usd).toLocaleString() + ' of $' + vault.toLocaleString(), 'ok');
    }

    function onCapitalInputChange() {
      const capitalInput = document.getElementById('capitalInput');
      const raw = capitalInput ? capitalInput.value : '';
      if (raw === '' || raw === null) return; // wait for blur to sanitize empty
      const n = parseFloat(String(raw).replace(/,/g, ''));
      if (!Number.isFinite(n) || n <= 0) return;
      applyCapitalUsd(n, { forceInput: false });
    }

    function onCapitalInputBlur() {
      const capitalInput = document.getElementById('capitalInput');
      applyCapitalUsd(capitalInput ? capitalInput.value : '', { forceInput: true, sanitize: true });
    }

    function onMasterOrderSizeChange() {
      const slider = document.getElementById('masterOrderSizeSlider');
      if (!slider) return;
      masterOrderSizeUsd = clampOrderSizeUsd(parseFloat(slider.value) || 1000, capitalUsd);
      syncOrderSizeUi(masterOrderSizeUsd);
      updateStep3BlockEconomics();
      updateMasterConsoleSlippage();
    }

    function onStep3FrictionChange() {
      updateStep3BlockEconomics();
      // Friction affects table net7 columns — debounce-free light path: full recalc on blur-scale inputs
      recalculate();
      updateMasterConsoleSlippage();
    }

    function syncOrderSizeUi(usd) {
      const size = clampOrderSizeUsd(usd, capitalUsd);
      masterOrderSizeUsd = size;
      const label = document.getElementById('consoleOrderSizeLabel');
      if (label) label.innerText = '$' + size.toLocaleString();
      const slider = document.getElementById('masterOrderSizeSlider');
      if (slider && parseFloat(slider.value) !== size) {
        const stepped = Math.max(1000, Math.round(size / 1000) * 1000);
        const max = resolveOrderSizeMaxUsd(capitalUsd);
        slider.value = String(Math.min(stepped, max));
      }
      const dynTag = document.getElementById('dynSlLockTag');
      if (dynTag) {
        dynTag.innerHTML = formatDynSlLockTagHtml(size);
        applySvTip(
          dynTag,
          STATUS_DICTIONARY.MAX_SL_WELD.desc,
          STATUS_DICTIONARY.MAX_SL_WELD.label
        );
      }
    }

    /** @deprecated Use syncOrderSizeUi — kept for init call sites */
    function syncStep3CapitalUi(usd) {
      syncOrderSizeUi(usd);
    }

    function getStep3FrictionRate() {
      const el = document.getElementById('frictionInput');
      return (parseFloat(el && el.value) || 0.24) / 100;
    }

    function getStep3FixedCost() {
      const el = document.getElementById('fixedCostInput');
      return parseFloat(el && el.value) || 2.50;
    }

    function updateStep3BlockEconomics() {
      const capital = masterOrderSizeUsd || 10000;
      const frictionRate = getStep3FrictionRate();
      const fixedCost = getStep3FixedCost();
      const upfrontFrictionUSD = (capital * frictionRate) + fixedCost;
      const frictionBlockVal = document.getElementById('displayTotalFriction');
      if (frictionBlockVal) {
        frictionBlockVal.innerText = '$' + upfrontFrictionUSD.toFixed(2);
      }
      const bestProfitEl = document.getElementById('bestPairProfit');
      const bestProfit30El = document.getElementById('bestPairProfit30');
      if (cachedBestAprPct !== null && Number.isFinite(cachedBestAprPct)) {
        const dailyGrossProfit = capital * ((cachedBestAprPct / 100) / 365);
        const net7 = (dailyGrossProfit * 7) - upfrontFrictionUSD;
        const net30 = (dailyGrossProfit * 30) - upfrontFrictionUSD;
        if (bestProfitEl) bestProfitEl.innerText = '$' + net7.toFixed(2);
        if (bestProfit30El) bestProfit30El.innerText = '$' + net30.toFixed(2);
      }
    }

    function resolveAttackButtonState(slip) {
      const riskScore = getToxicityRiskScore();
      const lock = resolveAttackLock({
        hasTarget: !!selectedConsoleAsset,
        step3Unlocked: isStep3Unlocked(),
        withdrawableCollateral: withdrawableCollateralUsd,
        orderSizeUsd: masterOrderSizeUsd,
        slipRatio: slip || 0,
        accountEquityUsd: resolveAccountEquityUsd(),
        root17Tripped: isRoot17Blocking(),
        executionDisabled: typeof isExecutionDisabled === 'function' && isExecutionDisabled(),
        riskScore: riskScore,
        toxicCooldownUntil: toxicModeCooldownUntil,
        auditReadOnly: typeof canUseOrderEntry === 'function'
          ? !canUseOrderEntry(demoPersonaRole)
          : demoPersonaRole === 'AUDITOR',
      });
      return {
        locked: lock.locked,
        label: lock.label,
        reason: lock.reason,
        soilDanger: lock.reason === 'SOIL_EXCEEDS_MAX_SL',
      };
    }

    function updateMasterConsoleSlippage() {
      const readout = document.getElementById('consoleSlippageReadout');
      const badge = document.getElementById('consoleSoilBadge');
      const btn = document.getElementById('attackExecuteBtn');
      const btnLabel = document.getElementById('attackExecuteBtnLabel');
      const lockdownLabel = document.getElementById('attackLockdownLabel');
      const warn = document.getElementById('attackWarning');
      const dynTag = document.getElementById('dynSlLockTag');
      if (dynTag) {
        dynTag.innerHTML = formatDynSlLockTagHtml(masterOrderSizeUsd);
        applySvTip(
          dynTag,
          STATUS_DICTIONARY.MAX_SL_WELD.desc,
          STATUS_DICTIONARY.MAX_SL_WELD.label
        );
      }

      const slip = selectedConsoleAsset
        ? slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd)
        : 0;
      const softTier = soilTierFromOrderSize(masterOrderSizeUsd);
      const attackState = resolveAttackButtonState(slip);
      const isDanger = attackState.soilDanger;

      if (warn) warn.classList.remove('hidden');

      if (!selectedConsoleAsset) {
        if (readout) readout.innerText = '--';
        if (badge) {
          badge.className = soilBadgeClass(softTier) + ' w-fit';
          badge.innerText = soilBadgeLabel(softTier);
          applySoilBadgeTip(badge, softTier);
        }
      } else {
        if (readout) {
          readout.innerText = formatSlipPct(slip) + ' @ $' + masterOrderSizeUsd.toLocaleString() +
            ' · risk $' + (masterOrderSizeUsd * slip).toFixed(2);
          readout.style.color = isDanger ? '#f87171' : (softTier === 'WARNING' ? '#fbbf24' : '#45C4B4');
        }
        if (badge) {
          if (isDanger) {
            badge.className = soilBadgeClass('DANGER') + ' w-fit';
            badge.innerText = '[ ' + STATUS_DICTIONARY.SOIL_RESISTANCE.LOOSE.label + ' · EXCEEDS $' +
              resolveEffectiveMaxSlUsd().toFixed(0) + ' RISK ] 🔴';
            applySoilBadgeTip(badge, 'DANGER');
          } else {
            badge.className = soilBadgeClass(softTier) + ' w-fit';
            badge.innerText = soilBadgeLabel(softTier);
            applySoilBadgeTip(badge, softTier);
          }
        }
      }

      const consoleBox = document.getElementById('masterRiskConsole');
      const attackZone = document.getElementById('attackExecuteZone');
      if (consoleBox) {
        if (isDanger) consoleBox.classList.add('attack-armed');
        else consoleBox.classList.remove('attack-armed');
      }
      if (attackZone) {
        if (isDanger) attackZone.classList.add('attack-armed');
        else attackZone.classList.remove('attack-armed');
      }
      if (btn) {
        btn.disabled = attackState.locked;
        if (attackState.locked) btn.classList.add('attack-locked');
        else btn.classList.remove('attack-locked');
        if (isDanger) {
          const soil = STATUS_DICTIONARY.ROOT_TAGS.ROOT3_SOIL;
          applySvTip(btn, soil.dangerDesc || soil.desc, soil.danger || attackState.label);
        }
      }
      if (btnLabel) btnLabel.innerText = attackState.label;
      if (lockdownLabel) {
        if (isDanger || attackState.reason === 'INSUFFICIENT_MARGIN') lockdownLabel.classList.remove('hidden');
        else lockdownLabel.classList.add('hidden');
      }

      const marginReadout = document.getElementById('walletMarginReadout');
      if (marginReadout && connectedWalletAddress) {
        const ok = withdrawableCollateralUsd >= masterOrderSizeUsd;
        marginReadout.textContent = 'Withdrawable: $' + withdrawableCollateralUsd.toLocaleString() +
          ' · Required: $' + masterOrderSizeUsd.toLocaleString() + (ok ? '' : ' · SHORT');
        marginReadout.className = 'typo-context mt-1 ' + (ok ? 'text-emerald-300' : 'text-rose-300');
      }
      if (typeof refreshGatekeeperDefenseMatrix === 'function') {
        refreshGatekeeperDefenseMatrix();
      }
      syncDemoHubMirrorReadouts(slip, softTier, isDanger);
    }

    function syncDemoHubMirrorReadouts(slip, softTier, isDanger) {
      const equity = resolveAccountEquityUsd();
      const maxSl = Number(systemState.dynamicMaxSL) || computeEffectiveMaxSlUsd(equity);
      const dynPct = dynamicMaxSlPct(masterOrderSizeUsd || equity, equity);
      const hubDyn = document.getElementById('demoHubDynSlReadout');
      const hubSlip = document.getElementById('demoHubSlippageReadout');
      if (hubDyn) {
        hubDyn.textContent = 'DYN-SL: ' + dynPct.toFixed(2) + '% · MAX $' + maxSl.toFixed(0) +
          ' @ $' + equity.toLocaleString();
      }
      if (hubSlip) {
        if (!selectedConsoleAsset) {
          hubSlip.textContent = 'Soil: — · Max ' + (MAX_SLIPPAGE * 100).toFixed(1) + '%';
        } else {
          hubSlip.textContent = 'Soil: ' + formatSlipPct(slip || 0) + ' · ' +
            (isDanger ? 'EXCEEDS MAX SL' : soilBadgeLabel(softTier)) +
            ' · Max ' + (MAX_SLIPPAGE * 100).toFixed(1) + '%';
        }
      }
    }

    function executeAttackOrder() {
      if (typeof canUseOrderEntry === 'function' ? !canUseOrderEntry(demoPersonaRole) : demoPersonaRole === 'AUDITOR') {
        addLog('[AUDIT READ-ONLY MODE] Execution disabled for Auditor persona', 'warn');
        return;
      }
      if (guardExecutionDisabledAction()) return;
      if (!isStep3Unlocked()) {
        addLog('[ATTACK BLOCKED] Complete mode gates before Step 3', 'warn');
        pushExecLog('[ROOT] Step 3 locked — mode gate incomplete', 'warn');
        return;
      }
      if (!selectedConsoleAsset) {
        addLog('[ATTACK] Inject a token into the master console first', 'warn');
        return;
      }
      const label = resolveAssetLabel(selectedConsoleKey, selectedConsoleAsset);
      const slip = slipForNotionalDynamic(selectedConsoleAsset, masterOrderSizeUsd);
      const attackState = resolveAttackButtonState(slip);
      if (attackState.reason === 'INSUFFICIENT_MARGIN') {
        addLog('[ATTACK BLOCKED] INSUFFICIENT MARGIN · collateral $' + withdrawableCollateralUsd.toLocaleString() + ' < $' + masterOrderSizeUsd.toLocaleString(), 'warn');
        pushExecLog('[MARGIN GUARD] ATTACK denied — insufficient withdrawable collateral', 'err');
        updateMasterConsoleSlippage();
        return;
      }
      if (attackState.reason === 'SOIL_EXCEEDS_MAX_SL') {
        const maxSl = resolveEffectiveMaxSlUsd();
        addLog('[ATTACK BLOCKED] SOIL DANGER: EXCEEDS $' + maxSl.toFixed(0) + ' RISK · slip ' + formatSlipPct(slip) + ' · $' + (masterOrderSizeUsd * slip).toFixed(2), 'warn');
        pushExecLog('[ROOT 3/7] Soil friction exceeds $' + maxSl.toFixed(0) + ' Effective Max SL — ATTACK physically locked', 'err');
        updateMasterConsoleSlippage();
        return;
      }
      if (attackState.locked) {
        addLog('[ATTACK BLOCKED] ' + attackState.label, 'warn');
        return;
      }

      const dynPct = dynamicMaxSlPct(masterOrderSizeUsd);
      addLog('[ATTACK ARMED] DonDon locked ' + label + ' · size $' + masterOrderSizeUsd.toLocaleString() + ' · DYN-SL ' + dynPct.toFixed(2) + '% · slip ' + formatSlipPct(slip), 'success');
      pushExecLog('[ATTACK] Injected ' + label + ' · size $' + masterOrderSizeUsd.toLocaleString() + ' · friction ' + formatSlipPct(slip) + ' · ' + formatDynSlLockTag(masterOrderSizeUsd), 'ok');
      pushExecLog('[ROOT 14] ClOID Deduplication READY · ticket #' + nextPositionId, 'ok');

      openPositions.push({
        id: nextPositionId++,
        symbol: label,
        sizeUsd: masterOrderSizeUsd,
        dynSlPct: dynPct,
        pnlUsd: Math.round((20 + Math.random() * 140) * 100) / 100,
        openedAt: Date.now(),
      });
      const vaultLast = document.getElementById('vaultLastAttack');
      if (vaultLast) vaultLast.innerText = label + ' · $' + masterOrderSizeUsd.toLocaleString();
      renderActivePositions();
      updateMasterConsoleSlippage();
    }

    function formatFunding8hPctFromHourly(hourly) {
      const h = parseFloat(hourly);
      if (!Number.isFinite(h)) return null;
      return h * 8 * 100;
    }

    function formatFunding8hLabel(pct) {
      if (pct === null || pct === undefined || !Number.isFinite(pct)) return '—';
      const sign = pct >= 0 ? '+' : '';
      return sign + pct.toFixed(4) + '%';
    }

    function isCrowdedLongFunding(fr8hPct) {
      return Number.isFinite(fr8hPct) && fr8hPct > 0.1;
    }

    function formatOiCell(hlUsd) {
      return formatOiNotionalUsd(hlUsd);
    }

    function resolveRowCategory(row) {
      if (row && row.asset_category) return row.asset_category;
      return 'crypto';
    }

    function rowMatchesMatrixCategory(row) {
      if (!matrixCategoryFilter || matrixCategoryFilter === 'ALL') return true;
      const cat = resolveRowCategory(row);
      if (matrixCategoryFilter === 'CRYPTO') return cat === 'crypto';
      if (matrixCategoryFilter === 'COMMODITIES') return cat === 'commodity';
      if (matrixCategoryFilter === 'STOCKS') return cat === 'stock';
      if (matrixCategoryFilter === 'INDICES') return cat === 'index';
      if (matrixCategoryFilter === 'PREIPO') return cat === 'preipo';
      if (matrixCategoryFilter === 'STOCKS_INDICES') return cat === 'stock' || cat === 'index' || cat === 'preipo';
      if (matrixCategoryFilter === 'FX') return cat === 'fx';
      return true;
    }

    function sortedBucketEntries(bucket, orderedKeys) {
      const entries = [];
      const seen = {};
      function push(key, asset) {
        if (!asset || seen[key]) return;
        seen[key] = true;
        entries.push({ key: key, asset: asset });
      }
      (orderedKeys || []).forEach(function(key) {
        if (bucket && bucket[key]) push(key, bucket[key]);
      });
      Object.keys(bucket || {}).forEach(function(key) {
        push(key, bucket[key]);
      });
      entries.sort(function(a, b) {
        const oiA = parseFloat(a.asset.openInterestNotionalUsd) || 0;
        const oiB = parseFloat(b.asset.openInterestNotionalUsd) || 0;
        return oiB - oiA;
      });
      return entries;
    }

    function maxOiInBucket(bucket) {
      let max = 0;
      Object.keys(bucket || {}).forEach(function(key) {
        const oi = parseFloat(bucket[key] && bucket[key].openInterestNotionalUsd) || 0;
        if (oi > max) max = oi;
      });
      return max;
    }

    function worldTreeCapsuleHtml(key, asset, isRootNode, maxOi, isCrypto) {
      if (!asset) return '';
      const label = resolveAssetLabel(key, asset);
      const price = parseFloat(asset.markPrice);
      if (!Number.isFinite(price) || price <= 0) return '';
      const pct = parseFloat(asset.change24h_pct);
      const hasPct = Number.isFinite(pct);
      const priceText = formatMarkPrice(key, price) || price.toFixed(4);
      const sign = hasPct && pct >= 0 ? '+' : '';
      const pctText = hasPct ? ' (' + sign + pct.toFixed(2) + '%)' : '';
      const oiUsd = parseFloat(asset.openInterestNotionalUsd) || 0;
      const fr8h = asset.fundingRate8h_pct !== undefined
        ? parseFloat(asset.fundingRate8h_pct)
        : formatFunding8hPctFromHourly(asset.fundingRateHourly !== undefined
          ? asset.fundingRateHourly
          : asset.e1_hl_funding);
      const crowded = isCrowdedLongFunding(fr8h);
      const oiFillPct = maxOi > 0 && oiUsd > 0 ? Math.min(100, (oiUsd / maxOi) * 100) : 0;
      const hlSymbol = asset.hlSymbol || label;
      const tradeUrl = isCrypto ? hlTradeUrl(hlSymbol) : hlTradFiTradeUrl(hlSymbol);
      const selected = selectedConsoleKey === key || String(selectedConsoleKey).toUpperCase() === String(key).toUpperCase();
      const rootTag = isRootNode
        ? '<span class="tradfi-root-node-tag" title="Root Node — Max OI Capacity">👑 ROOT NODE (MAX OI)</span>'
        : '';
      const capsuleCls = 'world-tree-capsule' +
        (isRootNode ? ' is-root-node' : '') +
        (crowded ? ' crowded-long' : '') +
        (selected ? ' token-selected' : '');
      const capacityLine =
        '<span class="world-tree-oi-highlight">OI: ' + formatOiNotionalUsd(oiUsd) + '</span>' +
        ' · <span class="world-tree-fr-highlight">8h FR: ' + formatFunding8hLabel(fr8h) + '</span>' +
        (crowded ? ' <span class="text-amber-300 font-bold">⚠ CROWDED</span>' : '');
      const priceLine =
        '<button type="button" class="bg-transparent border-0 p-0 cursor-pointer font-bold text-inherit" onclick="injectTokenToMasterConsole(' + jsOnclickArg(key) + ')" title="Lock &amp; Inject to Step 3">[' + label + ']</button>' +
        ' <a href="' + tradeUrl + '" target="_blank" rel="noopener noreferrer" class="token-price-link tradfi-token-price" onclick="event.stopPropagation()" title="Open Hyperliquid">$' + priceText + pctText + '</a>' +
        ' <a href="' + tradeUrl + '" target="_blank" rel="noopener noreferrer" class="hl-trade-icon-link" onclick="event.stopPropagation()" title="Hyperliquid">🔗</a>';
      const est = estimateSoilSlippage(asset);
      const capsuleInner =
        '<div class="' + capsuleCls + '" data-token-key="' + key + '">' +
        (oiFillPct > 0 ? '<div class="world-tree-oi-fill" style="width:' + oiFillPct.toFixed(1) + '%"></div>' : '') +
        '<div class="world-tree-capsule-body">' +
          '<div class="world-tree-capsule-capacity">' + capacityLine + '</div>' +
          '<div class="world-tree-capsule-price">' + priceLine + '</div>' +
        '</div>' +
        soilTooltipHtml(label, est) +
      '</div>';
      if (isRootNode) {
        return '<div class="world-tree-capsule-wrap">' + rootTag + capsuleInner + '</div>';
      }
      return capsuleInner;
    }

    function sumBucketOi(bucket) {
      let total = 0;
      Object.keys(bucket || {}).forEach(function(k) {
        total += parseFloat(bucket[k].openInterestNotionalUsd) || 0;
      });
      return total;
    }

    function fundingAbs8hPct(asset) {
      const fr8 = parseFloat(asset && asset.fundingRate8h_pct);
      if (Number.isFinite(fr8)) return Math.abs(fr8);
      return Math.abs((parseFloat(asset && asset.fundingRateHourly) || 0) * 100 * 8);
    }

    function topExtremeFundingEntries(bucket, orderedKeys, limit) {
      const entries = sortedBucketEntries(bucket, orderedKeys);
      entries.sort(function(a, b) {
        return fundingAbs8hPct(b.asset) - fundingAbs8hPct(a.asset);
      });
      return entries.slice(0, limit || 3);
    }

    function formatCatFrPct(asset) {
      const fr8 = parseFloat(asset.fundingRate8h_pct);
      if (Number.isFinite(fr8)) {
        const sign = fr8 >= 0 ? '+' : '';
        return sign + fr8.toFixed(4) + '%';
      }
      const hourly = parseFloat(asset.fundingRateHourly) || 0;
      const pct = hourly * 100 * 8;
      const sign = pct >= 0 ? '+' : '';
      return sign + pct.toFixed(4) + '%';
    }

    function renderCategoryExtremeFrList(elId, bucket, orderedKeys, emptyMsg, isCrypto) {
      const el = document.getElementById(elId);
      if (!el) return;
      const oiEl = document.getElementById(elId.replace('Panel', 'OiTotal'));
      const totalOi = sumBucketOi(bucket);
      if (oiEl) oiEl.innerText = 'OI ' + formatOiNotionalUsd(totalOi);
      const top = topExtremeFundingEntries(bucket, orderedKeys, 3);
      if (!top.length) {
        el.innerHTML = '<span class="text-gray-500 typo-context">' + emptyMsg + '</span>';
        return;
      }
      el.innerHTML = top.map(function(entry) {
        const label = resolveAssetLabel(entry.key, entry.asset);
        const fr = formatCatFrPct(entry.asset);
        const frNum = parseFloat(entry.asset.fundingRate8h_pct);
        const color = (Number.isFinite(frNum) ? frNum : (parseFloat(entry.asset.fundingRateHourly) || 0)) >= 0
          ? 'text-rose-300' : 'text-emerald-300';
        return '<div class="cat-fr-row">' +
          '<button type="button" onclick="injectTokenToMasterConsole(' + jsOnclickArg(entry.key) + ')" title="Quick Target Lock">' + label + '</button>' +
          '<span class="typo-num ' + color + '">' + fr + '</span>' +
        '</div>';
      }).join('');
    }

    function renderWorldTreeCategoryPanel(elId, bucket, orderedKeys, emptyMsg, kingKey, isCrypto, itemLimit) {
      // v2.0: condensed cards — ALL tokens mapped in bucket; display Top 3 extreme FR only
      renderCategoryExtremeFrList(elId, bucket, orderedKeys, emptyMsg, isCrypto);
    }

    /**
     * Client-side crypto bucket from Worker hl_universe proxy (ALL tokens).
     * Heavy FR/OI sort happens here — Worker only ships slim quotes.
     * Falls back to Rule A/B matrix rows if proxy absent.
     */
    function buildCryptoAssetsFromMatrix() {
      const bucket = {};
      if (cachedHlUniverse && cachedHlUniverse.length) {
        cachedHlUniverse.forEach(function(q) {
          if (!q || typeof q !== 'object') return;
          const sym = String(q.symbol || '').toUpperCase();
          if (!sym) return;
          const key = sym.toLowerCase();
          const oi = parseFloat(q.dayVolumeUsd) || 0;
          const fr8h = Number.isFinite(parseFloat(q.funding8h_pct))
            ? parseFloat(q.funding8h_pct)
            : formatFunding8hPctFromHourly(q.funding);
          bucket[key] = {
            hlSymbol: sym,
            markPrice: parseFloat(q.mark) || parseFloat(q.spot) || 0,
            change24h_pct: 0,
            openInterestNotionalUsd: oi,
            fundingRateHourly: parseFloat(q.funding) || 0,
            fundingRate8h_pct: fr8h,
            displayName: sym,
          };
        });
        return bucket;
      }
      if (!globalData || !globalData.length) return bucket;
      globalData.forEach(function(row) {
        const sym = String(row.b1_symbol || '').toUpperCase();
        if (!sym) return;
        const key = sym.toLowerCase();
        const price = parseFloat(row.d1_hl_perp) || parseFloat(row.c1_hl_spot) || 0;
        const oi = parseFloat(row.hl_oi_usd) || parseFloat(row.vol_3d_avg) || 0;
        const fr8h = formatFunding8hPctFromHourly(row.e1_hl_funding);
        const existing = bucket[key];
        const existingOi = existing ? (parseFloat(existing.openInterestNotionalUsd) || 0) : 0;
        if (existing && existingOi >= oi) return;
        bucket[key] = {
          hlSymbol: sym,
          markPrice: price,
          change24h_pct: 0,
          openInterestNotionalUsd: oi,
          fundingRateHourly: parseFloat(row.e1_hl_funding) || 0,
          fundingRate8h_pct: fr8h,
          displayName: sym,
        };
      });
      return bucket;
    }

    function renderCryptoWorldTreePanel() {
      const bucket = buildCryptoAssetsFromMatrix();
      let kingKey = '';
      let bestOi = 0;
      Object.keys(bucket).forEach(function(k) {
        const oi = parseFloat(bucket[k].openInterestNotionalUsd) || 0;
        if (oi > bestOi) { bestOi = oi; kingKey = k; }
      });
      renderWorldTreeCategoryPanel('cryptoPanel', bucket, null, 'No crypto targets', kingKey, true, 0);
    }

    function buildTradFiMatrixRows(enrichment) {
      if (!enrichment) return [];
      const specs = [
        { bucket: 'commodities', cat: 'commodity' },
        { bucket: 'stocks', cat: 'stock' },
        { bucket: 'indices', cat: 'index' },
        { bucket: 'fx', cat: 'fx' },
        { bucket: 'preipo', cat: 'preipo' },
      ];
      const rows = [];
      specs.forEach(function(spec) {
        const bucket = enrichment[spec.bucket] || {};
        Object.keys(bucket).forEach(function(key) {
          const asset = bucket[key];
          if (!asset || !asset.markPrice) return;
          const label = resolveAssetLabel(key, asset);
          const oi = parseFloat(asset.openInterestNotionalUsd) || 0;
          const fr = parseFloat(asset.fundingRateHourly) || 0;
          rows.push({
            b1_symbol: label,
            asset_category: spec.cat,
            c1_hl_spot: asset.markPrice,
            d1_hl_perp: asset.markPrice,
            e1_hl_funding: fr,
            i1_annual_cross: 0,
            vol_3d_avg: oi,
            hl_oi_usd: oi,
            onHyperliquid: true,
            stability: 0,
            isTradFiSynthetic: true,
            tradfi_key: key,
          });
        });
      });
      return rows;
    }

    function mergeTradFiEnrichmentWithSnapshots(enrichment, snapshots) {
      const merged = {
        commodities: {},
        stocks: {},
        indices: {},
        fx: {},
        preipo: {},
        kings: (enrichment && enrichment.kings) ? enrichment.kings : {},
      };
      ['commodities', 'stocks', 'indices', 'fx', 'preipo'].forEach(function(cat) {
        const existing = (enrichment && enrichment[cat]) ? enrichment[cat] : {};
        Object.keys(existing).forEach(function(key) {
          merged[cat][key] = Object.assign({}, existing[key]);
        });
        const snapshot = (snapshots && snapshots[cat]) ? snapshots[cat] : {};
        Object.keys(snapshot).forEach(function(key) {
          const normKey = String(key).toLowerCase();
          const price = parseFloat(snapshot[key]);
          if (!Number.isFinite(price) || price <= 0) return;
          if (!merged[cat][normKey]) {
            merged[cat][normKey] = {
              hlSymbol: resolveAssetLabel(normKey, {}),
              markPrice: price,
            };
          } else if (!Number.isFinite(parseFloat(merged[cat][normKey].markPrice))) {
            merged[cat][normKey].markPrice = price;
          }
        });
      });
      return merged;
    }

    function mergeMatrixDataSource(cryptoRows) {
      const tradfiRows = buildTradFiMatrixRows(cachedTradFiEnrichment);
      return (cryptoRows || []).concat(tradfiRows);
    }

    function tradFiAssetChipHtml(key, asset, isTopNode) {
      return worldTreeCapsuleHtml(key, asset, isTopNode, maxOiInBucket({ [key]: asset }), false);
    }

    function renderTradFiCategoryPanel(elId, bucket, orderedKeys, emptyMsg, kingKey) {
      renderWorldTreeCategoryPanel(elId, bucket, orderedKeys, emptyMsg, kingKey, false);
    }

    function updateRootSlipProtectionStatus() {
      const box = document.getElementById('rootSlipProtectionStatus');
      const lamp = document.getElementById('rootSlipBreakerLamp');
      if (!lamp) return;
      const tripped = settlementLockdownActive || tsunamiShieldActive || shieldDemoRedAlertActive || settlementLockdownDemoActive;
      if (tripped) {
        lamp.innerHTML = '🟠 Slip Breaker: LOCKED | Max 0.5% Slippage Tolerance';
        if (box) box.classList.add('tripped');
      } else {
        lamp.innerHTML = '🟢 Slip Breaker: ACTIVE | Max 0.5% Slippage Tolerance';
        if (box) box.classList.remove('tripped');
      }
    }

    function renderTradFiPanels(commodities, stocks, indices, fx, preipo, enrichment) {
      cachedTradFiSnapshots = {
        commodities: commodities || {},
        stocks: stocks || {},
        indices: indices || {},
        fx: fx || {},
        preipo: preipo || {},
      };
      cachedTradFiEnrichment = mergeTradFiEnrichmentWithSnapshots(enrichment, cachedTradFiSnapshots);
      const kings = (cachedTradFiEnrichment && cachedTradFiEnrichment.kings) ? cachedTradFiEnrichment.kings : {};
      const bucket = cachedTradFiEnrichment || {};

      renderTradFiCategoryPanel(
        'commoditiesPanel',
        bucket.commodities,
        COMMODITY_ORDER,
        'No commodities',
        kings.commodities ? kings.commodities.key : ''
      );
      renderTradFiCategoryPanel(
        'stocksPanel',
        bucket.stocks,
        null,
        'No synthetic stocks',
        kings.stocks ? kings.stocks.key : ''
      );
      renderTradFiCategoryPanel(
        'indicesPanel',
        bucket.indices,
        null,
        'No indices',
        kings.indices ? kings.indices.key : ''
      );
      renderTradFiCategoryPanel(
        'fxPanel',
        bucket.fx,
        null,
        'No FX pairs',
        kings.fx ? kings.fx.key : ''
      );
      renderTradFiCategoryPanel(
        'preipoPanel',
        bucket.preipo,
        null,
        'No Pre-IPO targets',
        kings.preipo ? kings.preipo.key : ''
      );
      renderCryptoWorldTreePanel();
      renderPreLaunchSpotlight(cachedTradFiEnrichment || enrichment);
    }

    function updateVolatilityFilters(vixValue, dvolValue) {
      const vixTradEl = document.getElementById('vixTrad');
      const vixCryptoEl = document.getElementById('vixCrypto');
      const heartbeatEl = document.getElementById('marketHeartbeatBar');
      const volLabelEl = document.getElementById('heartbeatVolLabel');
      const volStateEl = document.getElementById('heartbeatVolState');
      const circuitEl = document.getElementById('heartbeatCircuitLabel');
      const vixNum = parseFloat(vixValue);
      const dvolNum = parseFloat(dvolValue);
      lastVixValue = Number.isFinite(vixNum) ? vixNum : lastVixValue;
      lastDvolValue = Number.isFinite(dvolNum) ? dvolNum : lastDvolValue;
      const vixPanic = Number.isFinite(vixNum) && vixNum >= 22;
      const dvolHigh = Number.isFinite(dvolNum) && dvolNum >= 45;
      const vixForHeat = Number.isFinite(lastVixValue) ? lastVixValue : 0;
      const dvolForHeat = Number.isFinite(lastDvolValue) ? lastDvolValue : 0;
      const heatScore = (vixForHeat * 0.4) + (dvolForHeat * 0.6);
      lastHeatScore = heatScore;

      if (vixTradEl) {
        const mood = vixPanic
          ? '<span class="emoji-xl">😵</span> 傳統市場：恐慌暴動 / Panic'
          : '<span class="emoji-xl">😌</span> 傳統市場：平穩 / Stable';
        vixTradEl.innerHTML = 'VIX (Trad): <strong>' + (Number.isFinite(vixNum) ? vixNum.toFixed(1) : '--') + '</strong>' +
          ' <a href="https://www.cboe.com/tradable_products/vix/" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="CBOE VIX">🔗</a> [ ' + mood + ' ]';
        vixTradEl.className = vixPanic
          ? 'vol-filter-badge rounded bg-red-500/20 text-red-300 border-2 border-red-500/50 font-mono font-bold text-sm mb-2 animate-pulse'
          : 'vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm mb-2';
      }
      if (vixCryptoEl) {
        const mood = dvolHigh
          ? '<span class="emoji-xl">🤪</span> 加密市場：瘋狂洗盤 / High Vol'
          : '<span class="emoji-xl">😌</span> 加密市場：橫盤蓄勢 / Low Vol';
        vixCryptoEl.innerHTML = 'DVOL (Crypto): <strong>' + (Number.isFinite(dvolNum) ? dvolNum.toFixed(1) + '%' : '--') + '</strong>' +
          ' <a href="https://www.deribit.com/statistics/BTC/volatility-index" target="_blank" rel="noopener noreferrer" class="sentiment-ext-link" title="Deribit DVOL">🔗</a> [ ' + mood + ' ]';
        vixCryptoEl.className = dvolHigh
          ? 'vol-filter-badge text-orange-300 font-mono font-bold text-sm bg-red-950/40 border-2 border-orange-500/50 px-3 py-1.5 rounded animate-pulse'
          : 'vol-filter-badge rounded bg-emerald-500/10 text-emerald-300 border-2 border-emerald-500/40 font-mono font-bold text-sm';
      }

      let stateClass = 'is-safe';
      let volState = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label;
      let circuitText = 'NO CIRCUIT RISK';
      let tipDesc = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.desc;
      let tipLabel = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.SAFE.label;
      lastHeatState = 'safe';
      if (heatScore > 75) {
        stateClass = 'is-extreme';
        lastHeatState = 'extreme';
        volState = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.LOCKED.label;
        circuitText = 'CIRCUIT TRIGGERED';
        tipDesc = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.LOCKED.desc;
        tipLabel = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.LOCKED.label;
      } else if (heatScore >= 40) {
        stateClass = 'is-elevated';
        lastHeatState = 'elevated';
        volState = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.ELEVATED.label;
        circuitText = 'CIRCUIT WATCH';
        tipDesc = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.ELEVATED.desc;
        tipLabel = STATUS_DICTIONARY.TOP_BAR_STATUS.MARKET_HEARTBEAT.ELEVATED.label;
      }

      if (heartbeatEl) {
        heartbeatEl.className = 'market-heartbeat-card ' + stateClass;
        heartbeatEl.title = 'Heat ' + heatScore.toFixed(1) + ' = VIX ' + vixForHeat.toFixed(1) + '×0.4 + DVOL ' + dvolForHeat.toFixed(1) + '×0.6';
      }
      if (volStateEl) volStateEl.textContent = volState;
      if (circuitEl) circuitEl.textContent = circuitText;
      if (volLabelEl) {
        volLabelEl.textContent = volState + ' — ' + circuitText;
        applySvTip(volLabelEl, tipDesc, tipLabel);
      }
      if (volStateEl) applySvTip(volStateEl, tipDesc, tipLabel);

      applyStep1EmergencyState();
      refreshGatekeeperDefenseMatrix();
      if (typeof syncCriFromLiveRiskSignals === 'function') {
        syncCriFromLiveRiskSignals();
      }
    }

function recalculate() {
      try {
        const capital = Number.isFinite(masterOrderSizeUsd) && masterOrderSizeUsd > 0
          ? masterOrderSizeUsd
          : sanitizeCapitalUsd(capitalUsd);
        syncOrderSizeUi(capital);
        const frictionRate = getStep3FrictionRate();
        const fixedCost = getStep3FixedCost();
        
        const upfrontFrictionUSD = (capital * frictionRate) + fixedCost;
        
        const frictionBlockVal = document.getElementById('displayTotalFriction');
        if (frictionBlockVal) {
          frictionBlockVal.innerText = "$" + upfrontFrictionUSD.toFixed(2);
        }

        const tbody = document.getElementById('matrixTableBody');
        if (!tbody) return;

        if (!globalData || globalData.length === 0) {
          const tradfiOnly = buildTradFiMatrixRows(cachedTradFiEnrichment);
          if (!tradfiOnly.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-rose-400 font-bold">⚠️ Waiting for data gateway or no available targets...</td></tr>';
            cachedDisplayList = [];
            updatePaginationControls(0);
            return;
          }
        }

        // 數據清洗與安全值填充（Crypto Rule A/B + TradFi HL 資產）
        let processedData = mergeMatrixDataSource(globalData).map(item => {
          const row = { ...item };
          row.b1_symbol = row.b1_symbol || 'Unknown';
          row.c1_hl_spot = parseFloat(row.c1_hl_spot) || 0;
          row.d1_hl_perp = parseFloat(row.d1_hl_perp) || 0;
          row.e1_hl_funding = parseFloat(row.e1_hl_funding) || 0;
          row.i1_annual_cross = parseFloat(row.i1_annual_cross) || 0;
          row.std_dev_24h = parseFloat(row.std_dev_24h) || 0;
          row.vol_3d_avg = parseFloat(row.vol_3d_avg) || 0;
          row.stability = parseFloat(row.stability) || 0;
          row.hl_oi_usd = parseFloat(row.hl_oi_usd) || parseFloat(row.vol_3d_avg) || 0;
          return row;
        });

        // 後端已焊死 Rule A；前端僅做搜尋 / 狀態 / 分類 / 分頁
        let filteredData = processedData.filter(row => {
          const hasSymbol = !!row.b1_symbol && row.b1_symbol !== 'Unknown';
          const hasPrice = row.c1_hl_spot > 0 || row.d1_hl_perp > 0;
          return hasSymbol && hasPrice && rowMatchesMatrixCategory(row);
        });

        // 後端 actionStatus 焊死 → Tab Filter；僅在缺失時才前端推導
        let displayList = filteredData.map(row => {
          const dailyYieldRate = (row.i1_annual_cross / 100) / 365;
          const dailyGrossProfit = capital * dailyYieldRate;
          const net7 = (dailyGrossProfit * 7) - upfrontFrictionUSD;
          const net30 = (dailyGrossProfit * 30) - upfrontFrictionUSD;
          const funding8hPct = formatFunding8hPctFromHourly(row.e1_hl_funding);

          const currentStatus = row.actionStatus || '';
          const riskTripped = row.risk_tripped === true;
          let styleObj;
          if (currentStatus) {
            styleObj = getActionStyle(currentStatus, riskTripped, row.passedRule);
          } else if (riskTripped) {
            styleObj = getActionStyle('SPREAD_TOO_HIGH', true, row.passedRule);
          } else {
            styleObj = getActionStyle('HOLD', false, row.passedRule);
            if (row.net7 <= 0 || upfrontFrictionUSD > 50) {
              styleObj = getActionStyle('HOLD', false, row.passedRule);
            } else {
              const hlPerpDiff = row.c1_hl_spot > 0
                ? (row.d1_hl_perp - row.c1_hl_spot) / row.c1_hl_spot
                : 0;
              if (hlPerpDiff > 0.015 || row.e1_hl_funding > 0) {
                styleObj = getActionStyle('BUY_HL_SPOT_SHORT_HL_PERP', false, row.passedRule);
              } else if (hlPerpDiff < -0.015 || row.e1_hl_funding < 0) {
                styleObj = getActionStyle('SHORT_HL_SPOT_LONG_HL_PERP', false, row.passedRule);
              } else {
                styleObj = getActionStyle('HOLD', false, row.passedRule);
              }
            }
          }

          const pairStatusKey = resolvePairStatusKey(
            currentStatus || (
              styleObj.statusKey === 'SPREAD' ? 'SPREAD_TOO_HIGH' :
              styleObj.statusKey === 'DEFICIT' ? (row.passedRule === 'B' ? 'RULE_B_HIGH_RATE' : 'SHORT_HL_SPOT_LONG_HL_PERP') :
              styleObj.statusKey === 'OPEN' ? 'BUY_HL_SPOT_SHORT_HL_PERP' :
              'HOLD'
            ),
            riskTripped,
            row.passedRule
          );

          return {
            ...row,
            funding8hPct,
            net7,
            net30,
            styleObj,
            pairStatusKey: pairStatusKey
          };
        });

        // Token 搜尋 / 狀態篩選 — 不套用到已 Pin 的 Token
        const pinnedSet = {};
        pinnedSymbols.forEach(function(s) { pinnedSet[s] = true; });

        const pinnedPool = displayList.filter(function(row) {
          return !!pinnedSet[String(row.b1_symbol).toUpperCase()];
        });
        // Keep pin order stable
        pinnedPool.sort(function(a, b) {
          return pinnedSymbols.indexOf(String(a.b1_symbol).toUpperCase()) -
            pinnedSymbols.indexOf(String(b.b1_symbol).toUpperCase());
        });

        let unpinnedList = displayList.filter(function(row) {
          return !pinnedSet[String(row.b1_symbol).toUpperCase()];
        });

        if (tokenSearchQuery) {
          unpinnedList = unpinnedList.filter(function(row) {
            return String(row.b1_symbol).toUpperCase().indexOf(tokenSearchQuery) >= 0;
          });
        }

        if (pairStatusFilter && pairStatusFilter !== 'ALL') {
          unpinnedList = unpinnedList.filter(function(row) {
            if (row.isTradFiSynthetic) return matrixCategoryFilter !== 'CRYPTO';
            return row.pairStatusKey === pairStatusFilter;
          });
        }

        // 排序引擎（僅 unpinned；pinned 保持頂置順序）
        if (currentSortCol !== -1) {
          unpinnedList.sort((a, b) => {
            let valA, valB;
            switch (currentSortCol) {
              case 1: valA = a.b1_symbol; valB = b.b1_symbol; break;
              case 2: valA = a.hl_oi_usd || 0; valB = b.hl_oi_usd || 0; break;
              case 3: valA = Math.abs(a.funding8hPct || 0); valB = Math.abs(b.funding8hPct || 0); break;
              case 4: valA = a.i1_annual_cross; valB = b.i1_annual_cross; break;
              case 5: valA = a.vol_3d_avg; valB = b.vol_3d_avg; break;
              case 6: valA = a.net7; valB = b.net7; break;
              case 7: valA = a.net30; valB = b.net30; break;
              default: valA = 0; valB = 0;
            }
            if (typeof valA === 'string') {
              return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else {
              return sortAscending ? valA - valB : valB - valA;
            }
          });
        }

        cachedDisplayList = unpinnedList;
        updatePaginationControls(unpinnedList.length);

        const size = effectivePageSize(unpinnedList.length);
        const startIdx = (currentPage - 1) * size;
        const pageRows = unpinnedList.slice(startIdx, startIdx + size);
        const renderRows = pinnedPool.concat(pageRows);

        tbody.innerHTML = '';
        const bestRow = pickRecommendedRow(displayList);

        if (renderRows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-amber-400 font-bold">⚠️ No targets match current filters</td></tr>';
        }

        renderRows.forEach(row => {
          const isTradFiRow = row.isTradFiSynthetic === true;
          const isPositive7 = row.net7 > 0;
          const isPositive30 = row.net30 > 0;
          const styleObj = row.styleObj || getActionStyle(isTradFiRow ? 'HOLD' : 'HOLD');
          const maxLossText = row.maxLossLabel || '';
          const actionTagHtml =
            '<div class="inline-flex flex-col items-end gap-1">' +
              '<span class="px-2 py-1 rounded text-xs font-black border ' + styleObj.bg + ' ' + styleObj.text + ' ' + styleObj.border + '">' + styleObj.label + '</span>' +
              (maxLossText
                ? '<span class="text-[10px] font-mono text-amber-300/90">' + maxLossText + '</span>'
                : '') +
            '</div>';
          const cleanSymbolName = getSymbolEmoji(row.b1_symbol) + " " + row.b1_symbol;
          const volText = row.vol_3d_avg ? ("$" + (row.vol_3d_avg / 1000000).toFixed(1) + "M") : "N/A";
          
          const mixTrendCol = '<div>' + (row.stability * 1000).toFixed(2) + ' ‰ (stable)</div><div class="text-[10px] text-gray-400 mt-0.5">3d Vol: ' + volText + '</div>';

          const symUpper = String(row.b1_symbol).toUpperCase();
          const pinned = isPinned(symUpper);
          const pinAtCap = !pinned && pinnedSymbols.length >= MAX_PINS;
          const pinClass = 'pin-btn' + (pinned ? ' pinned' : '') + (pinAtCap ? ' pin-locked' : '');
          const pinLabel = pinned ? '★' : '☆';
          const pinTitle = pinAtCap
            ? 'Favorite limit reached (Max 3)'
            : (pinned ? 'Unfavorite ' + symUpper : 'Favorite / Pin to Top');

          // Soil Resistance — compact Normal tag; expanded only on CIRCUIT BREAKER
          const soilHtml = buildSoilResistanceHtml(row);

          const tr = document.createElement('tr');
          tr.className = 'border-b border-white/5 matrix-token-row' +
            (pinned ? ' row-pinned' : '') +
            (String(activeSelectedToken).toUpperCase() === symUpper || String(selectedConsoleKey).toUpperCase() === symUpper
              ? ' token-row-selected' : '');
          tr.setAttribute('data-token-key', symUpper);
          tr.title = '☆ Favorite on left · Lock & Inject on right to send to Step 3';
          tr.addEventListener('click', function(e) {
            if (e.target && e.target.closest && e.target.closest('a, button, .pin-btn, .token-price-link, .hl-trade-icon-link, .matrix-inject-btn')) return;
            injectTokenToMasterConsole(symUpper, assetFromMatrixRow(row));
          });

          const markPx = parseFloat(row.d1_hl_perp) || parseFloat(row.c1_hl_spot) || 0;
          const displayHlSpot = markPx > 0
            ? ('$' + markPx.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4}))
            : '—';
          const displayAnnualHl = row.i1_annual_cross.toFixed(2) + "%";
          
          const net7Class = isPositive7 ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/5';
          const displayNet7 = "$" + row.net7.toFixed(2);
          
          const net30Class = isPositive30 ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/5';
          const displayNet30 = "$" + row.net30.toFixed(2);
          const isOpenAction = row.pairStatusKey === 'OPEN';
          const tradeLinkGuard = isOpenAction ? ' onclick="return guardSettlementLockdownLink(event)"' : '';
          const actionCellClass = 'p-3 sticky-col-right text-right' + (isOpenAction ? ' cursor-pointer' : '');
          const actionCellClick = isOpenAction ? ' onclick="handleActionCellClick(\\'OPEN\\')"' : '';
          const hlUrl = isTradFiRow ? hlTradFiTradeUrl(row.b1_symbol) : hlTradeUrl(row.b1_symbol);
          const oiCell = formatOiCell(row.hl_oi_usd);

          const fr8Label = formatFunding8hLabel(formatFunding8hPctFromHourly(row.e1_hl_funding));
          const shieldIcon = brandShieldImg('matrix-inject-icon', 20);
          const lockBtn =
            '<button type="button" class="matrix-inject-btn" ' +
            'onclick="injectTokenToMasterConsole(' + jsOnclickArg(symUpper) + ')" title="Lock to Step 3">' +
            shieldIcon + '[ LOCK TO STEP 3 ]</button>';
          tr.innerHTML =
            '<td class="p-2 sticky-col-left text-center">' +
              '<button type="button" class="' + pinClass + '" title="' + pinTitle + '" aria-label="' + pinTitle + '" onclick="togglePin(' + jsOnclickArg(symUpper) + ')">' + pinLabel + '</button>' +
            '</td>' +
            '<td class="p-2 font-bold sticky-col-left text-white typo-context matrix-symbol-cell" style="left:40px">' +
              '<button type="button" class="token-name-select bg-transparent border-0 p-0 cursor-pointer text-white font-bold text-left" onclick="injectTokenToMasterConsole(' + jsOnclickArg(symUpper) + ')" title="Lock to Step 3">' +
                cleanSymbolName +
              '</button>' +
            '</td>' +
            '<td class="p-2 typo-num text-emerald-300 font-bold">' + oiCell + '</td>' +
            '<td class="p-2 typo-num">' +
              '<div class="matrix-price-fr-cell">' +
                '<a href="' + hlUrl + '" target="_blank" rel="noopener noreferrer" class="token-price-link text-white font-bold"' + tradeLinkGuard + ' title="Open Hyperliquid">' + displayHlSpot + '</a>' +
                '<span class="matrix-fr-sub funding-link">' + fr8Label + '</span>' +
              '</div>' +
            '</td>' +
            '<td class="p-2 typo-num font-bold text-circuit">' + displayAnnualHl + '</td>' +
            '<td class="p-2 text-center">' + soilHtml + '</td>' +
            '<td class="p-2 sticky-col-right text-right">' + lockBtn + '</td>';
            
          tbody.appendChild(tr);
        });

        if (selectedConsoleKey) syncConsoleSelectionHighlights(selectedConsoleKey);

        // Block 01 — highest APR Rule A row not slippage-locked (synced with table logic)
        const bestSymbolEl = document.getElementById('bestPairSymbol');
        const bestYieldEl = document.getElementById('bestPairYield');
        const bestProfitEl = document.getElementById('bestPairProfit');
        const bestProfit30El = document.getElementById('bestPairProfit30');

        bestHedgeList = buildBestHedgeList(displayList);
        const topHedge = bestHedgeList[0] || bestRow || null;

        if (topHedge) {
          cachedBestHedgeRow = topHedge;
          cachedBestAprPct = topHedge.i1_annual_cross;
          if (bestSymbolEl) bestSymbolEl.innerText = formatBestHedgePairLabel(topHedge.b1_symbol);
          if (bestYieldEl) bestYieldEl.innerText = topHedge.i1_annual_cross.toFixed(2) + "% APR";
          renderBestHedgeStrategyTag(topHedge);
          if (bestProfitEl) bestProfitEl.innerText = "$" + Number(topHedge.net7 || 0).toFixed(2);
          if (bestProfit30El) bestProfit30El.innerText = "$" + Number(topHedge.net30 || 0).toFixed(2);
          const lockBtn = document.getElementById('lockBestHedgeBtn');
          if (lockBtn) lockBtn.disabled = false;
        } else {
          cachedBestHedgeRow = null;
          bestHedgeList = [];
          cachedBestAprPct = null;
          if (bestSymbolEl) bestSymbolEl.innerText = formatBestHedgePairLabel('---');
          if (bestYieldEl) bestYieldEl.innerText = '---% APR';
          renderBestHedgeStrategyTag(null);
          if (bestProfitEl) bestProfitEl.innerText = '$0.00';
          if (bestProfit30El) bestProfit30El.innerText = '$0.00';
          const lockBtn = document.getElementById('lockBestHedgeBtn');
          if (lockBtn) lockBtn.disabled = true;
        }

        // Bind Step 3 AFTER bestHedgeList[0] is known (dynamic #1 APR inject)
        applyDefaultConsoleToken();
        refreshGatekeeperDefenseMatrix();

      } catch (err) {
        addLog("Recalculate Error: " + err.message, "error");
        console.error(err);
      }
    }

    function sortTable(colIndex) {
      if (currentSortCol === colIndex) {
        sortAscending = !sortAscending;
      } else {
        currentSortCol = colIndex;
        sortAscending = true;
      }
      
      const headers = document.querySelectorAll('#matrixTable th');
      headers.forEach((h, idx) => {
        h.classList.remove('sort-asc', 'sort-desc');
        if (idx === colIndex) {
          h.classList.add(sortAscending ? 'sort-asc' : 'sort-desc');
        }
      });

      recalculate();
    }

    let dragSrcEl = null;
    let tradfiDragSrcEl = null;

    function handleDragStart(e) {
      this.style.opacity = '0.4';
      dragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
      if (e.preventDefault) e.preventDefault();
      this.classList.add('drag-over');
      return false;
    }

    function handleDragLeave() {
      this.classList.remove('drag-over');
    }

    function handleDrop(e) {
      if (e.stopPropagation) e.stopPropagation();
      this.classList.remove('drag-over');
      
      if (dragSrcEl !== this) {
        const tempOrder = this.style.order;
        this.style.order = dragSrcEl.style.order;
        dragSrcEl.style.order = tempOrder;
        addLog("Dashboard Layout Adjusted.", "info");
        persistGridLayoutOrder();
      }
      return false;
    }

    function handleDragEnd() {
      this.style.opacity = '1';
      const cols = document.querySelectorAll('.draggable');
      cols.forEach(col => col.classList.remove('drag-over'));
    }

    function initDraggables() {
      const cols = document.querySelectorAll('.draggable');
      cols.forEach(col => {
        col.addEventListener('dragstart', handleDragStart, false);
        col.addEventListener('dragover', handleDragOver, false);
        col.addEventListener('dragleave', handleDragLeave, false);
        col.addEventListener('drop', handleDrop, false);
        col.addEventListener('dragend', handleDragEnd, false);
      });
    }

    function handleTradFiDragStart(e) {
      this.style.opacity = '0.4';
      tradfiDragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
    }

    function handleTradFiDragOver(e) {
      if (e.preventDefault) e.preventDefault();
      this.classList.add('drag-over');
      return false;
    }

    function handleTradFiDragLeave() {
      this.classList.remove('drag-over');
    }

    function handleTradFiDrop(e) {
      if (e.stopPropagation) e.stopPropagation();
      this.classList.remove('drag-over');
      if (tradfiDragSrcEl && tradfiDragSrcEl !== this) {
        const tempOrder = this.style.order;
        this.style.order = tradfiDragSrcEl.style.order;
        tradfiDragSrcEl.style.order = tempOrder;
        addLog('TradFi Panel Layout Adjusted.', 'info');
        persistTradFiLayoutOrder();
      }
      return false;
    }

    function handleTradFiDragEnd() {
      this.style.opacity = '1';
      document.querySelectorAll('.tradfi-draggable').forEach(function(col) {
        col.classList.remove('drag-over');
      });
    }

    function initTradFiDraggables() {
      document.querySelectorAll('#tradFiPanel .tradfi-draggable').forEach(function(col) {
        col.addEventListener('dragstart', handleTradFiDragStart, false);
        col.addEventListener('dragover', handleTradFiDragOver, false);
        col.addEventListener('dragleave', handleTradFiDragLeave, false);
        col.addEventListener('drop', handleTradFiDrop, false);
        col.addEventListener('dragend', handleTradFiDragEnd, false);
      });
    }

    function initResizers() {
      const ths = document.querySelectorAll('#matrixTable th');
      ths.forEach(th => {
        const resizer = th.querySelector('.resizer');
        if (!resizer) return;
        
        let startX, startWidth;
        resizer.addEventListener('mousedown', e => {
          startX = e.clientX;
          startWidth = th.offsetWidth;
          document.addEventListener('mousemove', doDrag);
          document.addEventListener('mouseup', stopDrag);
          e.preventDefault();
        });

        function doDrag(e) {
          th.style.width = (startWidth + e.clientX - startX) + 'px';
        }

        function stopDrag() {
          document.removeEventListener('mousemove', doDrag);
          document.removeEventListener('mouseup', stopDrag);
        }
      });
    }

    window.injectTokenToMasterConsole = injectTokenToMasterConsole;

    function revealDashboardMount() {
      const app = document.getElementById('app');
      if (app) {
        app.hidden = false;
        app.setAttribute('data-mounted', 'true');
      }
      document.body.classList.remove('dashboard-booting');
      const overlay = document.getElementById('forceRefreshOverlay');
      if (overlay) overlay.classList.remove('active');
    }

    function dismissAppBootBanner() {
      const banner = document.getElementById('appBootBanner');
      if (banner) banner.classList.add('hidden');
    }

    function showDashboardBootError(err) {
      revealDashboardMount();
      const banner = document.getElementById('appBootBanner');
      if (banner) {
        banner.classList.remove('hidden');
        banner.classList.add('is-error');
        banner.textContent = 'Telemetry deferred — SSR dashboard fallback active.';
      }
      if (err) console.error('[dashboard] bootstrap error', err);
    }

    function bootstrapDashboard() {
      try {
        revealDashboardMount();
        closeAllDashboardModals();
        bindDashboardModalEscapeDismiss();
        if (!runGatekeeper()) return;
      // Demo UI initial state sync
      if (typeof window.devMockHlTxCount !== 'number' || !Number.isFinite(window.devMockHlTxCount)) {
        window.devMockHlTxCount = 0; // Demo default: Shield Only
      }
      initSvTooltips();
      refreshAutoGuardBanner();
      if (shieldDemoRedAlertActive) applyShieldDemoUI();
      applySettlementLockdownDemoUI();
      const layoutLamp = document.getElementById('layoutMemoryLamp');
      const layoutState = document.getElementById('layoutMemoryState');
      if (layoutMemoryEnabled) {
        if (layoutLamp) layoutLamp.className = 'inline-block w-2.5 h-2.5 rounded-full bg-emerald-400';
        if (layoutState) layoutState.innerText = 'ON';
        const order = loadStoredGridLayoutOrder();
        if (order) applyGridLayoutOrder(order);
        const tradfiOrder = loadStoredTradFiLayoutOrder();
        if (tradfiOrder) applyTradFiLayoutOrder(tradfiOrder);
      } else {
        if (layoutLamp) layoutLamp.className = 'inline-block w-2.5 h-2.5 rounded-full bg-gray-500';
        if (layoutState) layoutState.innerText = 'OFF';
      }
      updateClocks();
      applyCapitalUsd(resolveVaultEquityUsd(), { forceInput: true, sanitize: true });
      setTradeMode('SHIELD');
      syncTradeModeButtonsFromEligibility();
      syncDemoWalletTxLevelUI();
      if (typeof refreshRoleEligibility === 'function') {
        refreshRoleEligibility();
      }
      renderActivePositions();
      syncHeaderVault();
      updateStep3BlockEconomics();
      updateMasterConsoleSlippage();
      applyStep1EmergencyState();
      syncDemoHubLamps();
      renderDemoRootToggleGrid();
      syncDemoXpUI();
      syncDemoPersonaRoleUI();
      refreshCriAndStatusHud();
      renderStep2MarketPanels({});
      setInterval(function() {
        if (toxicModeCooldownUntil > Date.now() || isToxicModeTripped(getToxicityRiskScore())) {
          updateMasterConsoleSlippage();
        }
      }, 1000);
      fetchData();
      if (typeof startHudStreamPoll === 'function') {
        startHudStreamPoll();
      }
      initDraggables();
      initTradFiDraggables();
      initResizers();
      setInterval(updateClocks, 1000);
      setInterval(fetchData, 20000);
      dismissAppBootBanner();
      } catch (err) {
        showDashboardBootError(err);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootstrapDashboard);
    } else {
      bootstrapDashboard();
    }
  </script>
</body>
</html>
`.replaceAll("__SHEET_LINK__", sheetHref);
}
