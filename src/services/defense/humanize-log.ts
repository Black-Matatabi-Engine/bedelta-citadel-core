/**
 * Defense line 16 — serenity-style humanized console messages.
 * Never surface raw SQL / stack / API jargon to the public DEBUG CONSOLE.
 */

const PRODUCT = "蔘天木";

/** Map machine logs / errors into operator-friendly Traditional Chinese. */
export function humanizeSystemLog(raw: string): string {
  const line = String(raw ?? "").trim();
  if (!line) return "";

  const upper = line.toUpperCase();

  if (
    /CROSS_VENUE_SLIPPAGE|SPOT_PERP_SLIPPAGE|SOIL_RESISTANCE_TRIP|SPREAD_TOO_HIGH|價差過大/.test(
      upper,
    ) ||
    /SOIL RESISTANCE CIRCUIT BREAKER TRIPPED/i.test(line)
  ) {
    return `[Co-Pilot Care] Soil capacity exceeded — DonDon auto-capped order size. Your equity is protected.`;
  }

  if (
    /CRI.?HARDLOCK|HARDLOCK|簽名通道已切斷|PHYSICAL DEADLOCK/i.test(upper) ||
    /CRI_HARDLOCK/i.test(line)
  ) {
    return `[風控死鎖] ${PRODUCT}觸發物理死鎖，CRI 歸零，Hot Key 簽名通道已切斷`;
  }

  if (/ROOT_PROTECTION_TRIP|MAX.?SL|RISKLIMITEXCEEDED/i.test(line)) {
    return `[Co-Pilot Care] Dynamic Max SL weld engaged — Javier capped max risk to protect your equity.`;
  }

  if (/DEPTH_USD|MINDEPTH|流動性不足/i.test(line)) {
    return `[風控提示] 盤口深度不足，${PRODUCT}土壤阻抗防線已拒絕進場`;
  }

  if (/RPC_NODE_NOT_ALLOWLISTED|NOT ON ALLOWLIST/i.test(line)) {
    return `[風控提示] 偵測到未授權的 RPC 節點請求，${PRODUCT}已攔截（僅允許白名單節點）`;
  }

  if (/PIN LOCK|PINNED.*MAX|FOMO|置頂.*上限|風控死鎖/i.test(line)) {
    return `[風控死鎖] 為了防止情緒 FOMO，置頂核心監控標的物理上限為 3 個。`;
  }

  if (/ALLMIDS.*FAILED|HL META.*FAILED|NETWORK ERROR|FETCH FAILED/i.test(line)) {
    return `[系統提示] 行情節點暫時繁忙，${PRODUCT}正在重試同步，請稍候再 FORCE REFRESH`;
  }

  if (/SQL(STATE|EXCEPTION|ERROR)|SQLITE|POSTGRES|MYSQL|PRAGMA/i.test(line)) {
    return `[系統提示] 內部資料校驗未通過，${PRODUCT}已安全降級，不影響您的瀏覽`;
  }

  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|HTTP\s*[45]\d\d|STATUS\s*[45]\d\d/i.test(line)) {
    return `[系統提示] 外部行情通道短暫中斷，${PRODUCT}防禦矩陣維持待機，稍後自動恢復`;
  }

  if (/STACK TRACE|AT\s+\S+\.(TS|JS):\d+|TYPEERROR:|REFERENCEERROR:/i.test(line)) {
    return `[系統提示] 引擎內部自檢觸發保護，${PRODUCT}已隔離異常並繼續服務`;
  }

  // Pass through already-human / intentional operator lines
  if (
    line.startsWith("[風控") ||
    line.startsWith("[系統") ||
    line.startsWith("[TRADFI]") ||
    line.startsWith("[allMids]") ||
    line.startsWith("[HL") ||
    line.startsWith("[API]") ||
    line.startsWith("[BUNDLE]") ||
    line.startsWith("[PIPELINE]") ||
    line.startsWith("[SYSTEM]")
  ) {
    return line;
  }

  // Soft sanitize leftover machine noise
  if (/[{}\[\]]/.test(line) && /error|exception|failed/i.test(line)) {
    return `[系統提示] 同步過程出現波動，${PRODUCT}已完成自癒，請查看面板最新報價`;
  }

  return line;
}

export function humanizeSystemLogs(lines: readonly string[]): string[] {
  return lines.map(humanizeSystemLog).filter(Boolean);
}
