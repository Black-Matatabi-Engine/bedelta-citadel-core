import {
  STATUS_DICTIONARY,
  STRATEGY_DICTIONARY,
  METRICS_DICTIONARY,
} from "../../config/statusDictionary";
import { normalizeTriggeredRoots } from "../../services/cri-engine";

export { normalizeTriggeredRoots };

const BRAND_FAVICON_SRC = "/brand/favicon.webp";

export interface DashboardBuildContext {
  versionLabel: string;
  sheetHref: string;
  escAttr: (value: string) => string;
  brandShield: (cls?: string, size?: number) => string;
  brandShieldImg: (cls?: string, size?: number) => string;
  STATUS_DICTIONARY: typeof STATUS_DICTIONARY;
  STRATEGY_DICTIONARY: typeof STRATEGY_DICTIONARY;
  METRICS_DICTIONARY: typeof METRICS_DICTIONARY;
  ROOT_DEFENSE_MATRIX_TOOLTIP_DESC: string;
  ROOT_DEFENSE_MATRIX_TOOLTIP_LABEL: string;
  TAIJI_MODE_UI: typeof import("../../services/taiji-bagua").TAIJI_MODE_UI;
  BAGUA_GATE_UI: typeof import("../../services/taiji-bagua").BAGUA_GATE_UI;
  BRAND_LOGO_DATA_URI: string;
  BRAND_BANNER_DATA_URI: string;
  initialMaxSlUsd: number;
  initialDynSlPct: number;
}

export function escAttr(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function brandShield(cls = "brand-shield-icon", size = 16): string {
  return `<img src="${BRAND_FAVICON_SRC}" alt="" class="${cls}" width="${size}" height="${size}" decoding="async" />`;
}

export function brandShieldImg(cls = "brand-shield-icon", size = 16): string {
  return brandShield(cls, size);
}

/** Shared DOM formatters, sv-tip helpers, modal utilities */
export const UI_HELPERS_SCRIPT = "    function jsOnclickArg(value) {\n      return JSON.stringify(String(value == null ? '' : value)).replace(/\"/g, '&quot;');\n    }\n\n    function tooltipPrimitive(value) {\n      if (value == null) return '';\n      if (typeof value === 'string') return value;\n      if (typeof value === 'number' || typeof value === 'boolean') return String(value);\n      if (typeof value === 'object') {\n        if (typeof value.desc === 'string') return value.desc;\n        if (typeof value.label === 'string') return value.label;\n        if (typeof value.text === 'string') return value.text;\n        try { return JSON.stringify(value); } catch (_) { return ''; }\n      }\n      try { return String(value); } catch (_) { return ''; }\n    }\n\n    function escapeTooltipHtml(value) {\n      const text = tooltipPrimitive(value);\n      return text\n        .replace(/&/g, '&amp;')\n        .replace(/</g, '&lt;')\n        .replace(/>/g, '&gt;')\n        .replace(/\"/g, '&quot;');\n    }\n\n    /** Radix-style floating tooltip for [data-sv-tip] / .sv-tip nodes */\n    function initSvTooltips() {\n      let root = document.getElementById('svTooltipRoot');\n      if (!root) {\n        root = document.createElement('div');\n        root.id = 'svTooltipRoot';\n        root.setAttribute('role', 'tooltip');\n        root.setAttribute('data-state', 'closed');\n        root.hidden = true;\n        document.body.appendChild(root);\n      }\n      let activeEl = null;\n      let hideTimer = null;\n\n      function hideTip() {\n        activeEl = null;\n        root.setAttribute('data-state', 'closed');\n        root.hidden = true;\n        root.innerHTML = '';\n      }\n\n      function showTip(el) {\n        const tip = el.getAttribute('data-sv-tip');\n        if (!tip) return;\n        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }\n        activeEl = el;\n        const label = el.getAttribute('data-sv-label');\n        root.innerHTML =\n          (label ? '<span class=\"sv-tip-label\">' + escapeTooltipHtml(label) + '</span>' : '') +\n          escapeTooltipHtml(tip);\n        root.hidden = false;\n        root.setAttribute('data-state', 'open');\n        const rect = el.getBoundingClientRect();\n        const tipRect = root.getBoundingClientRect();\n        let left = rect.left + (rect.width / 2) - (tipRect.width / 2);\n        let top = rect.top - tipRect.height - 10;\n        if (top < 8) top = rect.bottom + 10;\n        left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));\n        root.style.left = left + 'px';\n        root.style.top = top + 'px';\n      }\n\n      document.addEventListener('mouseover', function(e) {\n        const el = e.target && e.target.closest ? e.target.closest('[data-sv-tip], .sv-tip') : null;\n        if (!el || !el.getAttribute('data-sv-tip')) return;\n        showTip(el);\n      });\n      document.addEventListener('mouseout', function(e) {\n        const el = e.target && e.target.closest ? e.target.closest('[data-sv-tip], .sv-tip') : null;\n        if (!el || el !== activeEl) return;\n        const related = e.relatedTarget;\n        if (related && el.contains(related)) return;\n        hideTimer = setTimeout(hideTip, 80);\n      });\n      document.addEventListener('focusin', function(e) {\n        const el = e.target && e.target.closest ? e.target.closest('[data-sv-tip], .sv-tip') : null;\n        if (el && el.getAttribute('data-sv-tip')) showTip(el);\n      });\n      document.addEventListener('focusout', function() {\n        hideTimer = setTimeout(hideTip, 80);\n      });\n      window.addEventListener('scroll', hideTip, true);\n    }\n\n    function applySvTip(el, desc, label) {\n      if (!el) return;\n      el.classList.add('sv-tip');\n      if (desc != null) el.setAttribute('data-sv-tip', tooltipPrimitive(desc));\n      if (label != null) el.setAttribute('data-sv-label', tooltipPrimitive(label));\n    }\n\n    function setDashboardModalOpen(backdropId, open) {\n      const backdrop = document.getElementById(backdropId);\n      if (!backdrop) return;\n      if (open) {\n        backdrop.classList.remove('hidden');\n        backdrop.setAttribute('aria-hidden', 'false');\n      } else {\n        backdrop.classList.add('hidden');\n        backdrop.setAttribute('aria-hidden', 'true');\n      }\n    }\n\n    function closeAllDashboardModals() {\n      [\n        'legalModalBackdrop',\n        'quickTourBackdrop',\n        'sopGuideBackdrop',\n        'demoHubBackdrop',\n        'walletModalBackdrop',\n        'toxicModeBackdrop',\n      ].forEach(function(id) {\n        setDashboardModalOpen(id, false);\n      });\n    }\n\n    function bindDashboardModalEscapeDismiss() {\n      document.addEventListener('keydown', function(event) {\n        if (event.key !== 'Escape') return;\n        closeLegalModal();\n        closeQuickTour();\n        closeSopGuide();\n        if (typeof closeDemoControlHub === 'function') closeDemoControlHub();\n        if (typeof closeWalletModal === 'function') closeWalletModal();\n      });\n    }";
