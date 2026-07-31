import type { MatrixSuccessResponse } from "../types/matrix";

/**
 * Fire-and-forget persistence to Google Apps Script.
 * No-ops when webhook URL is missing or a placeholder.
 */
export async function postToGoogleSheet(
  gasWebhookUrl: string | undefined,
  data: MatrixSuccessResponse,
): Promise<void> {
  if (!gasWebhookUrl || gasWebhookUrl.includes("your-gas-id")) {
    return;
  }

  try {
    await fetch(gasWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "Silvervine-CF-Worker",
        payload: data,
      }),
    });
  } catch (err) {
    console.error("[gas-sheet]", err);
  }
}
