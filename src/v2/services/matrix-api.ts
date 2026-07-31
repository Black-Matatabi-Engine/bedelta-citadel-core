import {
  assertUiWorkerHandshake,
  buildUiHandshakeHeaders,
} from "../../services/defense/ui-canary";
import type { MatrixResponse, MatrixSuccessResponse } from "../../types/matrix";

const DEFAULT_POLL_MS = 20_000;

export interface MatrixApiSnapshot {
  payload: MatrixSuccessResponse;
  fetchedAt: number;
}

export async function fetchMatrixApiData(): Promise<MatrixApiSnapshot> {
  const handshake = assertUiWorkerHandshake();
  if (!handshake.ok) {
    throw new Error(handshake.message);
  }

  const response = await fetch("/api/data", {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...buildUiHandshakeHeaders(),
    },
  });

  const body = (await response.json()) as MatrixResponse;

  if (response.status === 403 || ("hardlock" in body && body.hardlock)) {
    const message =
      "error" in body && body.error
        ? body.error
        : "Hardlock Access Denied · signing channel severed";
    throw new Error(message);
  }

  if (!("success" in body) || body.success !== true) {
    const message =
      "error" in body && body.error ? body.error : `API error HTTP ${response.status}`;
    throw new Error(message);
  }

  return { payload: body, fetchedAt: Date.now() };
}

export function resolveMatrixPollIntervalMs(
  pollMs = DEFAULT_POLL_MS,
): number {
  return Math.max(5_000, pollMs);
}

export { DEFAULT_POLL_MS };
