/** Browser header HUD helpers — injected into dashboard script block (shared scope). */

import {
  formatFrictionLabel,
  formatGatewayLabel,
  formatPgateStatusLabel,
  formatTensileLabel,
  resolveLiveFrictionRatio,
} from "../services/hmi-formatters";

export function appendExecRoutedLog(
  msg: string,
  type: "ok" | "warn" | "error" = "ok",
): void {
  const stream = document.getElementById("execLogStream");
  if (!stream) return;
  const line = document.createElement("div");
  line.className =
    "log-line" +
    (type === "warn" ? " log-warn" : type === "error" ? " log-err" : " log-ok");
  const time = new Date().toLocaleTimeString();
  line.textContent = `[${time}] ${msg}`;
  stream.appendChild(line);
  while (stream.childNodes.length > 120) {
    stream.removeChild(stream.firstChild!);
  }
  stream.scrollTop = stream.scrollHeight;
}

/** Route legacy Step 1 log calls to bottom Real-Time Logging panel only. */
export function appendStep1CondensedLog(
  msg: string,
  type: "ok" | "warn" | "error" = "ok",
): void {
  appendExecRoutedLog(msg, type);
}

function formatHktClockLabel(now: Date | number | null | undefined): string {
  const source = now instanceof Date ? now : new Date(now ?? Date.now());
  const shifted = new Date(source.getTime() + 8 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const hour = String(shifted.getUTCHours()).padStart(2, "0");
  const minute = String(shifted.getUTCMinutes()).padStart(2, "0");
  const second = String(shifted.getUTCSeconds()).padStart(2, "0");
  return `HKT: ${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

function refreshTopClock(): void {
  const el = document.getElementById("topClock");
  if (!el) return;
  el.textContent = formatHktClockLabel(new Date());
}

function startTopClockTicker(): void {
  const win = window as Window & { __SV_TOP_CLOCK_TIMER__?: number };
  if (win.__SV_TOP_CLOCK_TIMER__) return;
  refreshTopClock();
  win.__SV_TOP_CLOCK_TIMER__ = window.setInterval(() => {
    refreshTopClock();
  }, 1000);
}

export function buildHeaderHudClientScript(): string {
  return [
    `const PGATE_MAX_SLIPPAGE = 0.005;`,
    formatHktClockLabel,
    refreshTopClock,
    startTopClockTicker,
    `startTopClockTicker();`,
    formatPgateStatusLabel,
    formatTensileLabel,
    formatFrictionLabel,
    formatGatewayLabel,
    resolveLiveFrictionRatio,
    appendExecRoutedLog,
    appendStep1CondensedLog,
  ]
    .map((fn) => fn.toString())
    .join("\n\n");
}
