import { useCallback, useEffect, useRef, useState } from "react";
import type { HudStreamPayload } from "../../api/hud-telemetry";
import {
  buildUiHandshakeHeaders,
  HUD_CANARY_EXPECTED,
} from "../../services/defense/ui-canary";
import { isBrowser } from "../lib/client-runtime";

const HUD_STREAM_POLL_MS = 150;

export interface UseHudStreamResult {
  payload: HudStreamPayload | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useHudStream(enabled = true): UseHudStreamResult {
  const [payload, setPayload] = useState<HudStreamPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!isBrowser() || inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/hud-stream", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Santenmoku-Canary": HUD_CANARY_EXPECTED,
          ...buildUiHandshakeHeaders(),
        },
      });

      const body = (await response.json()) as HudStreamPayload & {
        success?: boolean;
        error?: string;
        locked?: boolean;
      };

      if (!response.ok || body.success !== true) {
        setPayload(null);
        setError(body.error ?? `HUD stream HTTP ${response.status}`);
        return;
      }

      setPayload(body);
      setError(null);
    } catch (err) {
      setPayload(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isBrowser()) {
      setLoading(false);
      return;
    }

    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, HUD_STREAM_POLL_MS);

    return () => window.clearInterval(timer);
  }, [enabled, refresh]);

  return { payload, error, loading, refresh };
}
