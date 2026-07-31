/**
 * Humanized operator logs — re-export + hardlock helpers for API/UI.
 */
export {
  humanizeSystemLog,
  humanizeSystemLogs,
} from "./defense/humanize-log";

import { humanizeSystemLog } from "./defense/humanize-log";

const HARDLOCK_HUMAN =
  "[風控死鎖] 蔘天木觸發物理死鎖，CRI 歸零，Hot Key 簽名通道已切斷";

/** Canonical hardlock message for HTTP 403 bodies */
export function humanizeHardlockMessage(raw?: string): string {
  const line = String(raw ?? "").trim();
  if (/CRI.?HARDLOCK|HARDLOCK|CRI.*0|簽名通道/i.test(line)) {
    return HARDLOCK_HUMAN;
  }
  return humanizeSystemLog(line) || HARDLOCK_HUMAN;
}
