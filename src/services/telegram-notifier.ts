/**
 * Telegram panic alerting — optional Bot API dispatch when env vars present.
 */

export interface PanicMetrics {
  coin: string;
  imbalanceRatio: number;
  liveSlippageBps: number;
  dynamicMaxSlUsd: number;
  verdict?: string;
  limitPx?: string | null;
}

export interface TelegramEnv {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export interface SendPanicAlertOptions {
  env?: TelegramEnv;
  fetchFn?: typeof fetch;
}

export interface SendPanicAlertResult {
  sent: boolean;
  skipped: boolean;
  reason?: string;
  message?: string;
}

const TELEGRAM_API_BASE = "https://api.telegram.org";

/** Format counter-attack execution log for Telegram dispatch. */
export function formatPanicAlertMessage(metrics: PanicMetrics): string {
  const imbalancePct = (metrics.imbalanceRatio * 100).toFixed(2);
  const slippagePct = (metrics.liveSlippageBps / 100).toFixed(3);
  const lines = [
    "🚨 Santenmoku Counter-Attack Alert",
    `Coin: ${metrics.coin}`,
    `Imbalance: ${imbalancePct}%`,
    `Live Slippage: ${slippagePct}%`,
    `Dynamic Max SL: $${metrics.dynamicMaxSlUsd.toFixed(2)}`,
  ];

  if (metrics.verdict) {
    lines.push(`Verdict: ${metrics.verdict}`);
  }
  if (metrics.limitPx) {
    lines.push(`Passive Limit: ${metrics.limitPx}`);
  }

  return lines.join("\n");
}

/** Dispatch panic metrics via Telegram Bot API when credentials exist. */
export async function sendPanicAlert(
  metrics: PanicMetrics,
  options: SendPanicAlertOptions = {},
): Promise<SendPanicAlertResult> {
  const env = options.env ?? {};
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    return {
      sent: false,
      skipped: true,
      reason: "TELEGRAM_CREDENTIALS_MISSING",
    };
  }

  const message = formatPanicAlertMessage(metrics);
  const fetchFn = options.fetchFn ?? fetch;
  const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;

  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      return {
        sent: false,
        skipped: false,
        reason: `TELEGRAM_HTTP_${res.status}`,
        message,
      };
    }

    return { sent: true, skipped: false, message };
  } catch (err) {
    return {
      sent: false,
      skipped: false,
      reason: err instanceof Error ? err.message : String(err),
      message,
    };
  }
}
